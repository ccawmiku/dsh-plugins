import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initialState } from '../src/characters.mjs';
import { buildContext, accessibleMemories, recall } from '../src/context.mjs';
import { fixture } from './helpers.mjs';
import { estimateTokens } from '../src/compression.mjs';

test('group prompt never receives DM history, private memory, diary or private summary', () => {
  const state = initialState(), c = state.characters[0];
  state.rooms.find(r => r.id === 'dm:koharu').messages.push({ id: 'secret', speaker: 'user', text: '绝密私聊暗号665533', at: 1 });
  c.memories.push({ id: 'm1', scope: 'dm:koharu', text: '绝密私聊记忆998877', pinned: true, at: 1 });
  c.diaries.push({ text: '绝密日记001122', scope: 'dm:koharu' });
  state.rooms[1].summaries = [{ id: 's', text: '绝密私聊摘要443322', throughId: 'secret' }]; state.rooms[1].summaryId = 's';
  const group = JSON.stringify(buildContext(state, c, 'group'));
  assert.doesNotMatch(group, /绝密|665533|998877|001122|443322/);
  const privateContext = JSON.stringify(buildContext(state, c, 'dm:koharu'));
  assert.match(privateContext, /998877/); assert.match(privateContext, /443322/);
  assert.throws(() => buildContext(state, state.characters[1], 'dm:koharu'));
  assert.doesNotMatch(JSON.stringify(buildContext(state, state.characters[1], 'dm:mashiro')), /绝密/);
});
test('public memory can follow the same character into private chat', () => {
  const state = initialState(), c = state.characters[0];
  c.memories.push({ id: 'public', scope: 'group', text: '用户喜欢柠檬蛋糕', at: 1 });
  assert.match(JSON.stringify(buildContext(state, c, 'dm:koharu')), /柠檬蛋糕/);
});
test('Chinese lorebook matching finds the topic and always preserves pinned lore', () => {
  const state = initialState(), c = state.characters[0];
  c.memories = [{ id: 'a', text: '用户对花生过敏', keys: ['花生'], scope: 'group', at: 1 }, { id: 'b', text: '上次看过一只猫', scope: 'group', at: 1 }, { id: 'c', text: '秘密', scope: 'dm:koharu', pinned: true, at: 1 }, { id: 'd', text: '两人约定周五见面', scope: 'group', pinned: true, at: 1 }];
  const result = recall(c, 'group', '今天有花生蛋糕', 1);
  assert.deepEqual(result.map(m => m.id), ['d', 'a']);
});
test('500k is a token target rather than a 160-message truncation', async t => {
  const { store, engine } = await fixture(t);
  for (let i = 0; i < 200; i++) store.state.rooms[0].messages.push({ id: String(i), speaker: 'user', text: '第' + i + '条消息', at: i + 1 });
  const context = await engine.contexts.prepare(store.state.characters[0], 'group', '继续');
  assert.match(context.prompt, /第0条消息/); assert.match(context.prompt, /第199条消息/);
  assert.equal(context.metrics.target, 500000); assert.equal(context.metrics.capacity, 500000);
});
test('smaller model uses its actual capacity and compacts old messages without deleting originals', async t => {
  const { store, engine, calls } = await fixture(t, { capacity: 24000 });
  const room = store.room('group');
  for (let i = 0; i < 90; i++) room.messages.push({ id: 'msg' + i, speaker: i % 2 ? 'koharu' : 'user', text: '今天我们在沙龙谈论点心和视频。'.repeat(22), at: i });
  const context = await engine.contexts.prepare(store.state.characters[0], 'group', '你好');
  assert.equal(context.metrics.capacity, 24000);
  assert.ok(room.summaryId); assert.equal(room.messages.length, 90);
  assert.match(context.prompt, /连续剧情摘要/);
  assert.ok(context.metrics.estimatedInput < context.metrics.budget);
  assert.ok(calls.some(c => c.system.includes('连续剧情记录员')));
});
test('compression failure never advances the summary boundary or drops history', async t => {
  const { store, engine } = await fixture(t, { capacity: 24000, stream: async function* () { throw new Error('offline'); } });
  const room = store.room('group');
  for (let i = 0; i < 90; i++) room.messages.push({ id: String(i), speaker: 'user', text: '值得记住的故事'.repeat(60), at: i });
  await assert.rejects(() => engine.contexts.prepare(store.state.characters[0], 'group', '继续'), /offline/);
  assert.equal(room.messages.length, 90); assert.equal(room.summaryId, undefined);
});
test('private compression never reads another conversation', async t => {
  const { store, engine, calls } = await fixture(t);
  const room = store.room('dm:koharu');
  for (let i = 0; i < 12; i++) room.messages.push({ id: 'p' + i, speaker: 'user', text: '小春的秘密聊天' + i, at: i });
  store.room('dm:mashiro').messages.push({ id: 'alien', speaker: 'user', text: '真白独有秘密', at: 1 });
  await engine.contexts.compact(room.id, store.character('koharu'), await engine.contexts.limits(store.character('koharu')), undefined, true);
  assert.doesNotMatch(JSON.stringify(calls), /真白独有秘密/);
  assert.ok(room.summaryId); assert.equal(store.room('group').summaryId, undefined);
});
