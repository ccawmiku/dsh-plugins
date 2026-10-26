import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createAPI, action, validateSettings } from '../src/api.mjs';
import { fixture, idle } from './helpers.mjs';

test('settings validate actual finite budgets and do not accept raw API credentials', async t => {
  const { store } = await fixture(t);
  assert.throws(() => validateSettings(store.state.settings, { contextTokens: NaN }));
  assert.throws(() => validateSettings(store.state.settings, { autoMinMinutes: 50, autoMaxMinutes: 2 }));
  assert.throws(() => validateSettings(store.state.settings, { quietStart: '25:99' }));
  const settings = validateSettings(store.state.settings, { apiKey: 'do-not-save-this', contextTokens: 500000 });
  assert.equal(settings.apiKey, undefined);
});
test('private memory cannot be assigned to a different character and cannot overwrite core persona', async t => {
  const { store, engine } = await fixture(t);
  await assert.rejects(() => action(engine, { action: 'memory', characterId: 'koharu', scope: 'dm:mashiro', text: '秘密' }));
  await action(engine, { action: 'memory', characterId: 'koharu', scope: 'dm:koharu', text: '仅我们知道的记忆', pinned: true });
  assert.equal(store.character('koharu').memories[0].scope, 'dm:koharu');
  await action(engine, { action: 'character', id: 'koharu', patch: { memories: [], name: '小春' } });
  assert.equal(store.character('koharu').memories.length, 1);
});
test('API requires an explicit client header on mutations', async t => {
  const { engine } = await fixture(t), api = createAPI(engine);
  const response = await api(new Request('http://localhost/api/salon/action', { method: 'POST', body: '{"action":"stop"}' }));
  assert.equal(response.status, 403);
});
test('video serving supports suffix ranges, HEAD and refuses path traversal', async t => {
  const { store, engine, media } = await fixture(t), id = 'fixed-id';
  const dir = join(media.directory, id); await mkdir(dir, { recursive: true });
  await writeFile(join(dir, 'original.mp4'), '0123456789');
  store.state.media.push({ id, name: 'clip.mp4', extension: '.mp4', mime: 'video/mp4', frames: [] });
  const api = createAPI(engine);
  const response = await api(new Request(`http://localhost/api/salon/media?id=${id}`, { headers: { range: 'bytes=-4' } }));
  assert.equal(response.status, 206); assert.equal(await response.text(), '6789');
  assert.equal(response.headers.get('content-range'), 'bytes 6-9/10');
  const head = await api(new Request(`http://localhost/api/salon/media?id=${id}`, { method: 'HEAD' }));
  assert.equal(head.headers.get('content-length'), '10'); assert.equal(await head.text(), '');
  const traversal = await api(new Request(`http://localhost/api/salon/media?id=${id}&part=../../state.json`));
  assert.equal(traversal.status, 400);
});
test('summary edits and rollback preserve the original source messages', async t => {
  const { store, engine } = await fixture(t), room = store.room('group');
  room.messages.push({ id: 'one', speaker: 'user', text: '原始经历', at: 1 });
  room.summaries = [{ id: 's1', text: '第一版', throughId: 'one', previousId: null }]; room.summaryId = 's1';
  await action(engine, { action: 'summary', roomId: 'group', text: '修订版' });
  assert.equal(room.summaries.at(-1).text, '修订版');
  await action(engine, { action: 'summary', roomId: 'group', restore: true });
  assert.equal(room.summaryId, 's1'); assert.equal(room.messages[0].text, '原始经历');
});
test('manual wake in a DM selects that member rather than the first group member', async t => {
  const { store, engine } = await fixture(t);
  await action(engine, { action: 'wake', roomId: 'dm:mashiro' }); await idle(engine, 'dm:mashiro');
  assert.equal(store.room('dm:mashiro').messages[0].speaker, 'mashiro');
  assert.equal(store.room('dm:koharu').messages.length, 0);
});
