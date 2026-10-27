import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ConfigManager } from '../src/config.mjs';
import { createAPI } from '../src/api.mjs';
import { ImmichClient } from '../src/immich.mjs';

async function manager(t) {
  const directory = await mkdtemp(join(tmpdir(), 'immich-test-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  return new ConfigManager(directory);
}

test('config preserves stored credentials across omitted, masked and repeated saves', async t => {
  const config = await manager(t);
  await config.save({ immichUrl: 'localhost:2283/api/', apiKey: 'test-secret-123456' });
  assert.equal(config.config.immichUrl, 'http://localhost:2283');
  assert.equal(config.redacted().apiKey, '••••••••');
  assert.equal(JSON.stringify(config.redacted()).includes('test-secret'), false);
  await config.save({ videoMode: 'frames' });
  await config.save({ apiKey: config.redacted().apiKey });
  await config.save({ apiKey: 'test••••••••3456' });
  assert.equal(config.config.apiKey, 'test-secret-123456');
  await config.save({ apiKey: 'replacement' });
  assert.equal(config.config.apiKey, 'replacement');
  await config.save({ apiKey: '' });
  assert.equal(config.redacted().hasApiKey, false);
});

test('concurrent saves are serialized without losing changes', async t => {
  const config = await manager(t);
  await Promise.all([config.save({ apiKey: 'secret' }), config.save({ videoMode: 'frames' }), config.save({ pageSize: 20 })]);
  const saved = JSON.parse(await readFile(config.file, 'utf8'));
  assert.equal(saved.apiKey, 'secret');
  assert.equal(saved.videoMode, 'frames');
  assert.equal(saved.pageSize, 20);
});

test('invalid settings do not overwrite working configuration', async t => {
  const config = await manager(t);
  await config.save({ apiKey: 'secret' });
  const before = await readFile(config.file, 'utf8');
  for (const patch of [null, [], { immichUrl: 'ftp://server' }, { immichUrl: 'https://user:pass@server' }, { immichUrl: 'https://server?key=secret' }, { maxFrames: 31 }, { frameInterval: Infinity }, { videoMode: 'unknown' }, { apiKey: 'x\ny' }]) {
    await assert.rejects(config.save(patch));
    assert.equal(await readFile(config.file, 'utf8'), before);
  }
  await config.save({ pageSize: 25 });
  assert.equal(config.config.pageSize, 25);
});

test('damaged configuration is reported instead of silently replacing the credential', async t => {
  const config = await manager(t);
  await writeFile(config.file, '{broken json');
  await assert.rejects(config.save({ pageSize: 30 }), /无法读取/);
  assert.equal(await readFile(config.file, 'utf8'), '{broken json');
});

test('API rejects invalid JSON, bodies, pagination, IDs and methods', async t => {
  const config = await manager(t);
  const handler = createAPI(config, new ImmichClient(config));
  for (const body of ['{bad', 'null', '[]']) {
    const response = await handler(new Request('http://localhost/api/immich/config', { method: 'POST', body }));
    assert.equal(response.status, 400);
  }
  for (const path of ['timeline?page=-1', 'timeline?size=201', 'timeline?page=1.5', 'thumbnail?id=../config', 'original']) {
    const response = await handler(new Request('http://localhost/api/immich/' + path));
    assert.equal(response.status, 400, path);
  }
  assert.equal((await handler(new Request('http://localhost/api/immich/search', { method: 'DELETE' }))).status, 405);
  assert.equal((await handler(new Request('http://localhost/api/immich/unknown'))).status, 404);
});

test('API config responses never expose the key and do not permit caching', async t => {
  const config = await manager(t);
  await config.save({ apiKey: 'private-secret' });
  const response = await createAPI(config, {})(new Request('http://localhost/api/immich/config'));
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal((await response.text()).includes('private-secret'), false);
});

test('original media forwards Range/If-Range and preserves 206 headers and bytes', async t => {
  const config = await manager(t);
  const handler = createAPI(config, {
    getOriginalResponse: async (id, options) => {
      assert.equal(id, 'video-1');
      assert.deepEqual(options.headers, { range: 'bytes=2-4', 'if-range': '"etag"' });
      return new Response('cde', { status: 206, headers: {
        'content-type': 'video/mp4', 'content-range': 'bytes 2-4/6', 'content-length': '3', 'accept-ranges': 'bytes'
      } });
    }
  });
  const response = await handler(new Request('http://localhost/api/immich/original?id=video-1', {
    headers: { Range: 'bytes=2-4', 'If-Range': '"etag"' }
  }));
  assert.equal(response.status, 206);
  assert.equal(response.headers.get('content-range'), 'bytes 2-4/6');
  assert.equal(response.headers.get('content-length'), '3');
  assert.equal(response.headers.get('cache-control'), 'private, no-store');
  assert.equal(await response.text(), 'cde');
});

test('media proxies preserve 416 and protect thumbnail caches', async t => {
  const config = await manager(t);
  const handler = createAPI(config, {
    getOriginalResponse: async () => new Response(null, { status: 416, headers: { 'content-range': 'bytes */6' } }),
    getThumbnailResponse: async () => new Response('image', { headers: { 'content-type': 'image/jpeg' } })
  });
  const original = await handler(new Request('http://localhost/api/immich/original?id=id'));
  assert.equal(original.status, 416);
  assert.equal(original.headers.get('content-range'), 'bytes */6');
  const thumbnail = await handler(new Request('http://localhost/api/immich/thumbnail?id=id'));
  assert.equal(thumbnail.headers.get('cache-control'), 'private, max-age=300');
});

test('frame overrides reject out-of-range options before extraction', async t => {
  const config = await manager(t);
  const handler = createAPI(config, { extractVideoFrames: () => assert.fail('must not extract') });
  for (const maxFrames of [0, -1, 31, 'NaN', 1.5]) {
    const response = await handler(new Request('http://localhost/api/immich/convert-frames', {
      method: 'POST', body: JSON.stringify({ id: 'video', maxFrames })
    }));
    assert.equal(response.status, 400);
  }
});
