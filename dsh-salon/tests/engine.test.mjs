import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fixture, idle } from './helpers.mjs';
import { Store } from '../src/store.mjs';
import { inQuietHours } from '../src/engine.mjs';

test('group mentions choose the named role; DM replies remain in that DM', async t => {
  const { store, engine, calls } = await fixture(t);
  await engine.send({ roomId: 'group', text: '@真白 今天怎么样？' }); await idle(engine);
  assert.deepEqual(store.room('group').messages.map(m => m.speaker), ['user', 'mashiro']);
  await engine.send({ roomId: 'dm:koharu', text: '私聊独有字符串XYZ' }); await idle(engine, 'dm:koharu');
  assert.deepEqual(store.room('dm:koharu').messages.map(m => m.speaker), ['user', 'koharu']);
  assert.doesNotMatch(JSON.stringify(store.room('group')), /XYZ/);
  assert.equal(store.character('koharu').diaries[0].scope, 'dm:koharu');
});
test('restarting restores chats and separate memory scopes', async t => {
  const { directory, store, engine } = await fixture(t);
  await engine.send({ roomId: 'dm:koharu', text: '记得我们一起看过电影。' }); await idle(engine, 'dm:koharu');
  store.character('koharu').memories.push({ id: 'remember', scope: 'dm:koharu', text: '一起看过电影', sourceIds: [], at: 1 }); await store.save();
  const reopened = await new Store(directory).open();
  assert.equal(reopened.room('dm:koharu').messages.length, 2);
  assert.equal(reopened.character('koharu').memories[0].scope, 'dm:koharu');
});
test('user can stop an in-flight response without committing partial text', async t => {
  const { store, engine } = await fixture(t, { stream: async function* (request) {
    yield { type: 'text-delta', text: '未完成的回复' };
    await new Promise((resolve, reject) => { request.signal.addEventListener('abort', () => reject(request.signal.reason), { once: true }); });
  } });
  await engine.send({ roomId: 'group', text: '说说话' });
  while (!engine.jobs.get('group').partials.koharu) await new Promise(r => setTimeout(r, 5));
  engine.stop('group'); await idle(engine);
  assert.equal(store.room('group').messages.length, 1); assert.equal(engine.jobs.size, 0);
});
test('automatic chat starts without a new video and never replays missed wakeups', async t => {
  const { store, engine } = await fixture(t);
  store.state.nextAutoAt = 1; store.state.settings.autoPrivateChance = 1;
  await engine.tick(); await idle(engine, 'dm:koharu');
  assert.ok(store.room('dm:koharu').messages.some(m => m.automatic));
  const count = store.room('dm:koharu').messages.length;
  await engine.tick(); assert.equal(store.room('dm:koharu').messages.length, count);
  assert.ok(store.state.nextAutoAt > Date.now());
});
test('silence preference supports quiet hours crossing midnight in Shanghai', () => {
  const settings = { quietStart: '23:00', quietEnd: '08:00', timezone: 'Asia/Shanghai' };
  assert.equal(inQuietHours(settings, Date.parse('2026-10-25T17:00:00Z')), true);
  assert.equal(inQuietHours(settings, Date.parse('2026-10-25T08:00:00Z')), false);
});
test('model failures are visible and do not become normal conversation history', async t => {
  const { store, engine } = await fixture(t, { stream: async function* () { yield { type: 'finish', reason: { kind: 'error', failure: { message: 'provider unavailable' } } }; } });
  await engine.send({ text: '@小春 你好' }); await idle(engine);
  const message = store.room('group').messages.at(-1);
  assert.ok(message.error); assert.match(message.text, /unavailable/);
});
