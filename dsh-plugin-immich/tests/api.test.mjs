import test from 'node:test';
import assert from 'node:assert/strict';
import { ConfigManager } from '../src/config.mjs';
import { ImmichClient } from '../src/immich.mjs';
import { createAPI } from '../src/api.mjs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

test('ConfigManager: 读写、校验与脱敏', async () => {
  const tempDir = join(tmpdir(), 'dsh-immich-test-' + randomUUID());
  const mgr = new ConfigManager(tempDir);
  const cfg = await mgr.load();
  assert.equal(cfg.videoMode, 'direct');
  assert.equal(cfg.pageSize, 60);

  // 保存设置
  await mgr.save({
    immichUrl: 'http://192.168.1.21:2283/',
    apiKey: 'my-super-secret-immich-key-12345678',
    videoMode: 'frames',
    maxFrames: 16
  });

  assert.equal(mgr.config.immichUrl, 'http://192.168.1.21:2283');
  assert.equal(mgr.config.apiKey, 'my-super-secret-immich-key-12345678');
  assert.equal(mgr.config.videoMode, 'frames');
  assert.equal(mgr.config.maxFrames, 16);

  // 脱敏校验
  const redacted = mgr.redacted();
  assert.equal(redacted.hasApiKey, true);
  assert.ok(redacted.apiKey.includes('••••••••'));
  assert.ok(!redacted.apiKey.includes('super-secret'));
});

test('ImmichClient: 连通性测试（无效配置时友好报错）', async () => {
  const tempDir = join(tmpdir(), 'dsh-immich-test-' + randomUUID());
  const mgr = new ConfigManager(tempDir);
  const client = new ImmichClient(mgr);

  // 缺少 URL 或 Key 时拒绝
  await assert.rejects(async () => {
    await client.testConnection('', '');
  }, /服务器地址不能为空/);
});

test('createAPI: 路由分发与错误处理', async () => {
  const tempDir = join(tmpdir(), 'dsh-immich-test-' + randomUUID());
  const mgr = new ConfigManager(tempDir);
  const client = new ImmichClient(mgr);
  const handler = createAPI(mgr, client);

  // 1. GET /api/immich/config
  const req1 = new Request('http://localhost/api/immich/config', { method: 'GET' });
  const res1 = await handler(req1);
  assert.equal(res1.status, 200);
  const json1 = await res1.json();
  assert.equal(json1.hasApiKey, false);

  // 2. POST /api/immich/config
  const req2 = new Request('http://localhost/api/immich/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ immichUrl: 'http://192.168.1.100:2283', apiKey: 'testkey123456' })
  });
  const res2 = await handler(req2);
  assert.equal(res2.status, 200);
  const json2 = await res2.json();
  assert.equal(json2.success, true);
  assert.equal(json2.config.immichUrl, 'http://192.168.1.100:2283');

  // 3. GET /api/immich/thumbnail 缺少 id
  const req3 = new Request('http://localhost/api/immich/thumbnail', { method: 'GET' });
  const res3 = await handler(req3);
  assert.equal(res3.status, 400);

  // 4. 未知路径返回 404
  const req4 = new Request('http://localhost/api/immich/unknown', { method: 'GET' });
  const res4 = await handler(req4);
  assert.equal(res4.status, 404);
});
