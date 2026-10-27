import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { ImmichClient } from '../src/immich.mjs';

const ffmpegAvailable = spawnSync('ffmpeg', ['-version'], { windowsHide: true }).status === 0;

test('real FFmpeg extracts a sub-interval clip and capped samples spanning a longer clip', { skip: !ffmpegAvailable }, async t => {
  const directory = await mkdtemp(join(tmpdir(), 'immich-fixtures-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  for (const [name, duration, maxFrames, interval, expectedCount, expectedLast] of [
    ['short', 0.1, 12, 2, 1, 0],
    ['long', 8, 3, 0.5, 3, 16 / 3]
  ]) {
    const file = join(directory, name + '.mp4');
    const result = spawnSync('ffmpeg', [
      '-hide_banner', '-loglevel', 'error', '-y', '-f', 'lavfi',
      '-i', 'testsrc2=size=96x64:rate=30', '-t', String(duration), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', file
    ], { windowsHide: true });
    assert.equal(result.status, 0, result.stderr?.toString());
    const data = await readFile(file);
    const client = new ImmichClient({ config: {} });
    client.getAsset = async () => ({ type: 'video', originalFileName: name + '.mp4', duration: duration * 1000 });
    client.getOriginalResponse = async () => new Response(data);
    const frames = await client.extractVideoFrames(name, { maxFrames, frameInterval: interval });
    assert.equal(frames.count, expectedCount, name);
    assert.equal(frames.frames.at(-1).timeOffset, expectedLast);
    for (const frame of frames.frames) {
      const bytes = Buffer.from(frame.base64, 'base64');
      assert.equal(bytes.subarray(0, 2).toString('hex'), 'ffd8');
    }
    assert.notEqual(frames.frames[0].base64, frames.frames[1]?.base64);
  }
});

test('frame extraction removes temporary files after download failure', async () => {
  const before = new Set((await readdir(tmpdir())).filter(name => name.startsWith('immich-frames-')));
  const client = new ImmichClient({ config: {} });
  client.getAsset = async () => ({ type: 'video', originalFileName: 'clip.mp4' });
  client.getOriginalResponse = async () => new Response(null, { status: 403 });
  await assert.rejects(client.extractVideoFrames('video'), /403/);
  const after = (await readdir(tmpdir())).filter(name => name.startsWith('immich-frames-') && !before.has(name));
  assert.deepEqual(after, []);
});
