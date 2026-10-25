import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fixture, idle } from './helpers.mjs';
import { mentionedCharacters, mentionQuery, spokenText } from '../shared/chat.mjs';
import { initialCharacters } from '../src/characters.mjs';

function isMemory(request) { return request.system.includes('整理这一次真实聊天的个人记忆'); }
function isFollowUp(request) { return request.messages[0].content[0].text.includes('[自然接话判断]'); }
function speaker(request) { return initialCharacters.find(c => request.system.startsWith('你是' + c.name))?.id; }
function output(text) { return { type: 'text-delta', text, index: 0 }; }
const memory = '{"memories":[],"diary":"今天一起聊了很多。"}';

test('conversation continues past old turn limits until every other member declines', async t => {
  let turns = 0;
  const f = await fixture(t, { stream: async function* (request) {
    yield output(isMemory(request) ? memory : !isFollowUp(request) ? '先聊聊电影吧。' : turns < 15 ? `我还有第${++turns}个想法。` : '[沉默]');
  } });
  f.store.state.settings.followUpTurns = 0; // A legacy saved cap must not disable natural continuation.
  await f.engine.send({ text: '随便聊聊' }); await idle(f.engine);
  assert.equal(turns, 15);
  assert.equal(f.store.room('group').messages.filter(m => m.speaker !== 'user').length, 16);
  assert.equal(f.store.room('group').lastDiscussion.reason, 'natural');
});

test('one silent member does not end the group while another wants to speak', async t => {
  let reikaSpoke = false;
  const f = await fixture(t, { stream: async function* (request) {
    let text = '[沉默]';
    if (isMemory(request)) text = memory;
    else if (!isFollowUp(request)) text = '今天看什么电影？';
    else if (speaker(request) === 'reika' && !reikaSpoke) { reikaSpoke = true; text = '我想推荐一部推理片。'; }
    yield output(text);
  } });
  await f.engine.send({ text: '大家聊聊' }); await idle(f.engine);
  assert.deepEqual(f.store.room('group').messages.map(m => m.speaker), ['user', 'koharu', 'reika']);
});

test('characters can mention another character and that member gets the next response', async t => {
  const followUps = [];
  const f = await fixture(t, { stream: async function* (request) {
    if (isMemory(request)) { yield output(memory); return; }
    if (!isFollowUp(request)) { yield output('@夕雾 你有什么推荐？'); return; }
    followUps.push(speaker(request));
    yield output(followUps.length === 1 ? '我有一部适合今晚看的。' : '[沉默]');
  } });
  await f.engine.send({ text: '@小春 先聊聊吧' }); await idle(f.engine);
  assert.equal(followUps[0], 'yugiri');
  assert.equal(f.store.room('group').messages[2].speaker, 'yugiri');
});

test('user can interject and mention someone while the same discussion is running', async t => {
  let release, entered;
  const started = new Promise(resolve => { entered = resolve; });
  const gate = new Promise(resolve => { release = resolve; });
  let answered = false;
  const f = await fixture(t, { stream: async function* (request) {
    if (isMemory(request)) { yield output(memory); return; }
    if (!isFollowUp(request)) { entered(); await gate; yield output('我刚才想说的是电影。'); return; }
    if (speaker(request) === 'mashiro' && !answered) {
      answered = true;
      assert.match(request.messages[0].content[0].text, /我现在插一句/);
      yield output('听到了，你想聊游戏是吧。');
    } else yield output('[沉默]');
  } });
  await f.engine.send({ text: '聊聊电影' }); await started;
  const job = f.engine.jobs.get('group');
  const result = await f.engine.send({ text: '@真白 我现在插一句，聊游戏吧。' });
  assert.equal(result.interjection, true); assert.equal(f.engine.jobs.get('group'), job);
  release(); await idle(f.engine);
  assert.ok(answered);
  assert.equal(f.store.room('group').messages.filter(m => m.speaker === 'user').length, 2);
});

test('stop interrupts a continuing conversation and clears partial replies', async t => {
  let entered;
  const continuing = new Promise(resolve => { entered = resolve; });
  const f = await fixture(t, { stream: async function* (request) {
    if (!isFollowUp(request)) { yield output('我先开个头。'); return; }
    entered(); yield output('还没说完');
    await new Promise((resolve, reject) => request.signal.addEventListener('abort', () => reject(request.signal.reason), { once: true }));
  } });
  await f.engine.send({ text: '聊起来' }); await continuing;
  f.engine.stop('group'); await idle(f.engine);
  assert.equal(f.engine.jobs.size, 0);
  assert.equal(f.store.room('group').messages.length, 2);
});

test('only spoken text reaches private chat and streaming previews', async t => {
  const visible = [];
  let engine;
  const f = await fixture(t, { stream: async function* (request) {
    if (isMemory(request)) { yield output(memory); return; }
    for (const text of ['（走近）你好', '，今天（轻轻微笑', '）开心吗？']) {
      yield output(text);
      visible.push(engine.jobs.get('dm:koharu').partials.koharu.text);
    }
  } });
  engine = f.engine;
  await engine.send({ roomId: 'dm:koharu', text: '你好' }); await idle(engine, 'dm:koharu');
  assert.equal(f.store.room('dm:koharu').messages.at(-1).text, '你好，今天开心吗？');
  assert.doesNotMatch(visible.join(''), /[（）()]|走近|轻轻|微笑/);
});

test('mention parsing handles multiple targets, everyone, prefixes and email text', () => {
  assert.deepEqual(mentionedCharacters('@真白 @夕雾，来聊天', initialCharacters).map(c => c.id), ['mashiro', 'yugiri']);
  assert.equal(mentionedCharacters('@全体 一起聊聊', initialCharacters).length, 4);
  assert.equal(mentionedCharacters('test@小春.example', initialCharacters).length, 0);
  assert.deepEqual(mentionedCharacters('@小春子 你好', [...initialCharacters, { id: 'other', name: '小春子', enabled: true }]).map(c => c.id), ['other']);
  assert.equal(mentionedCharacters('@小春子 你好', initialCharacters).length, 0);
  assert.deepEqual(mentionQuery('想问 @真', 5), { start: 3, end: 5, query: '真' });
  assert.equal(mentionQuery('user@example.com', 16), null);
});

test('parenthetical narration is removed even when nested or incomplete', () => {
  assert.equal(spokenText('（轻笑）你好呀。(坐下)今晚看什么？'), '你好呀。今晚看什么？');
  assert.equal(spokenText('先聊聊（想了想(有点犹豫)）游戏。'), '先聊聊游戏。');
  assert.equal(spokenText('晚安（挥'), '晚安');
});
test('mentioning an unavailable character never silently routes to someone else', async t => {
  const f = await fixture(t);
  f.store.character('mashiro').enabled = false;
  await assert.rejects(() => f.engine.send({ text: '@真白 你来回答' }), /被点名的真白/);
  assert.equal(f.store.room('group').messages.length, 0);
  assert.equal(f.calls.length, 0);
});
