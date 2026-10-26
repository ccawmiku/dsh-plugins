import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fixture } from './helpers.mjs';
import { runProcess } from '../src/media.mjs';

async function tinyVideo(f) {
  const file = join(f.directory, 'test.mp4');
  await runProcess('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'lavfi', '-i', 'testsrc=size=320x240:rate=12', '-f', 'lavfi', '-i', 'sine=frequency=440:sample_rate=16000', '-t', '3', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', file]);
  const bytes = await readFile(file);
  const video = await f.media.importStream((async function* () { yield bytes; })(), '一段本地视频.mp4');
  return { video, bytes };
}
function configureNative(f) {
  f.store.state.settings.nativeBaseURL = 'https://native.example/v1';
  f.store.state.settings.nativeKeyRef = 'TEST_VIDEO_KEY';
  const previous = f.ctx.get;
  f.ctx.get = name => name === 'credentials' ? { resolve: async () => ({ value: 'dummy-secret-must-not-leak' }) } : previous(name);
}
test('real FFmpeg intake keeps original video and produces timestamped frames and an audio track', async t => {
  const f = await fixture(t), { video, bytes } = await tinyVideo(f);
  assert.equal(video.hasAudio, true); assert.ok(video.duration >= 3);
  assert.deepEqual(await readFile(f.media.path(video)), bytes);
  const frames = await f.media.frames(video);
  assert.ok(frames.length >= 1); assert.equal(frames[0].time, 0);
  assert.ok((await readFile(await f.media.audio(video))).length > 1000);
  video.notes = '[00:01] 这是一条测试视频的字幕';
  const result = await f.gateway.generate(f.store.character('koharu'), { system: '看视频', prompt: '说说看见什么', video });
  assert.equal(result.transport.mode, 'frames');
  const content = f.calls.at(-1).messages[0].content;
  assert.ok(content.some(p => p.type === 'image'));
  assert.match(JSON.stringify(content), /00:01/);
});
test('native route sends actual video bytes and MIME; it does not call the DSH frame channel', async t => {
  const requests = [];
  const f = await fixture(t, { fetcher: async (url, options) => { requests.push({ url, ...options }); return Response.json({ candidates: [{ content: { parts: [{ text: '看到了连续画面，也听到了声音。' }] } }] }); } });
  const { video, bytes } = await tinyVideo(f); configureNative(f);
  f.store.state.settings.videoMode = 'native';
  const output = await f.gateway.generate(f.store.character('koharu'), { system: '角色', prompt: '看看', video });
  const body = JSON.parse(requests[0].body);
  assert.equal(body.contents[0].parts[1].inlineData.mimeType, 'video/mp4');
  assert.deepEqual(Buffer.from(body.contents[0].parts[1].inlineData.data, 'base64'), bytes);
  assert.equal(output.transport.mode, 'native'); assert.equal(f.calls.length, 0); assert.equal(video.frames.length, 0);
  assert.match(requests[0].url, /v1beta\/models\/test-model:generateContent$/);
});
test('failed native video does not silently fall back; secrets in provider errors are scrubbed', async t => {
  const f = await fixture(t, { fetcher: async () => Response.json({ error: { message: 'bad dummy-secret-must-not-leak' } }, { status: 400 }) });
  const { video } = await tinyVideo(f); configureNative(f); f.store.state.settings.videoMode = 'native';
  let error;
  try { await f.gateway.generate(f.store.character('koharu'), { system: '角色', prompt: '看看', video }); } catch (e) { error = e; }
  assert.match(error.message, /视频直传未成功/); assert.doesNotMatch(error.message, /dummy-secret/);
  assert.equal(video.frames.length, 0); assert.equal(f.calls.length, 0);
  f.store.state.settings.allowVideoFallback = true; video.notes = '测试字幕';
  const output = await f.gateway.generate(f.store.character('koharu'), { system: '角色', prompt: '看看', video });
  assert.equal(output.transport.mode, 'frames'); assert.match(output.transport.fallbackReason, /HTTP 400/);
});
test('pure-text model is rejected instead of pretending to have watched extracted frames', async t => {
  const f = await fixture(t), { video } = await tinyVideo(f);
  f.ctx.llm.resolveModelInfo = async () => ({ inputModalities: ['text'] });
  await assert.rejects(() => f.gateway.generate(f.store.character('koharu'), { system: '', prompt: '', video }), /纯文本模型/);
});
test('transient native network errors retry the same video without switching transports', async t => {
  let count = 0;
  const f = await fixture(t, { fetcher: async () => {
    if (++count === 1) throw new Error('fetch failed');
    return Response.json({ candidates: [{ content: { parts: [{ text: '红色画面' }] } }] });
  } });
  const { video } = await tinyVideo(f); configureNative(f); f.store.state.settings.videoMode = 'native';
  const output = await f.gateway.generate(f.store.character('koharu'), { system: '', prompt: '看颜色', video });
  assert.equal(output.transport.mode, 'native'); assert.equal(count, 2); assert.equal(video.frames.length, 0);
});
test('failed audio transcription leaves frames usable and labels missing audio explicitly', async t => {
  const f = await fixture(t, { fetcher: async () => Response.json({ error: { message: 'audio unsupported' } }, { status: 400 }) });
  const { video } = await tinyVideo(f); configureNative(f);
  const output = await f.gateway.generate(f.store.character('koharu'), { system: '', prompt: '看看', video });
  assert.equal(output.transport.mode, 'frames'); assert.equal(output.transport.audio, '未转写');
  assert.match(output.transport.warning, /audio unsupported/);
  assert.match(JSON.stringify(f.calls.at(-1).messages), /没提供声音时不要声称听过/);
});
