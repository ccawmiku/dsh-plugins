import { randomUUID } from 'node:crypto';
import { extractJson } from './context.mjs';
import { ContextManager } from './compression.mjs';
import { mentionedCharacters, spokenText, isSilent } from '../shared/chat.mjs';

export function weightedPick(characters, random = Math.random) {
  if (!characters.length) return null;
  const total = characters.reduce((n, c) => n + Math.max(0.05, c.initiative), 0);
  let target = random() * total;
  return characters.find(c => (target -= Math.max(0.05, c.initiative)) < 0) || characters.at(-1);
}
export function inQuietHours(settings, now = Date.now()) {
  if (!settings.quietStart || !settings.quietEnd || settings.quietStart === settings.quietEnd) return false;
  const current = new Intl.DateTimeFormat('en-GB', { timeZone: settings.timezone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(now);
  return settings.quietStart < settings.quietEnd ? current >= settings.quietStart && current < settings.quietEnd : current >= settings.quietStart || current < settings.quietEnd;
}

export class SalonEngine {
  constructor(store, gateway, { random = Math.random, now = Date.now } = {}) {
    this.store = store; this.gateway = gateway; this.random = random; this.now = now;
    this.jobs = new Map(); this.activity = []; this.closed = false;
    this.contexts = new ContextManager(store, gateway);
  }
  readyCharacters() {
    return this.store.state.characters.filter(c => { if (!c.enabled) return false; try { this.gateway.route(c); return true; } catch { return false; } });
  }
  async addMessage(roomId, speaker, text, extra = {}) {
    const message = { id: randomUUID(), speaker, text, at: this.now(), ...extra };
    this.store.room(roomId).messages.push(message);
    await this.store.save(); return message;
  }
  async send({ roomId = 'group', text = '', mediaIds = [], all = false, characterId, automatic = false }) {
    if (this.closed) throw new Error('沙龙正在关闭');
    const room = this.store.room(roomId);
    if (!automatic && !text.trim() && !mediaIds.length) throw new Error('请输入消息或选择视频');
    const characters = this.readyCharacters().filter(c => roomId === 'group' || roomId === `dm:${c.id}`);
    if (!characters.length) throw new Error('没有已配置模型的可用角色，请先打开沙龙设置。');
    if (roomId === 'group') {
      const explicitlyNamed = mentionedCharacters(text, this.store.state.characters.map(c => ({ ...c, enabled: true })), { everyone: false });
      const unavailable = explicitlyNamed.filter(c => !characters.some(ready => ready.id === c.id));
      if (unavailable.length) throw new Error('被点名的' + unavailable.map(c => c.name).join('、') + '尚未配置模型或已暂停参与，请先在角色设定中调整。');
    }
    const videos = mediaIds.map(id => this.gateway.media.get(id));
    if (videos.length > 1) throw new Error('每条消息先一起看一条视频；多条可以连续分享。');
    const existing = this.jobs.get(roomId);
    if (existing) {
      if (!existing.acceptingInput) {
        await existing.promise;
        return this.send({ roomId, text, mediaIds, all, characterId, automatic });
      }
      if (roomId !== 'group' || automatic || videos.length) throw new Error(videos.length ? '先停止当前讨论，再分享下一条视频。' : '她还在回复，可以先点击停止。');
      const targets = characterId ? characters.filter(c => c.id === characterId) : mentionedCharacters(text, characters);
      if (characterId && !targets.length) throw new Error('被点名的角色不可用');
      existing.inputRevision++;
      existing.pendingSpeakers.push(...(targets.length ? targets : all ? characters : [weightedPick(characters, this.random)]).map(c => c.id));
      await this.addMessage(roomId, 'user', text.trim());
      return { accepted: true, interjection: true };
    }
    const controller = new AbortController();
    const job = { roomId, controller, partials: {}, phase: '准备中', startedAt: this.now(), promise: null, acceptingInput: true, inputRevision: 0, pendingSpeakers: [] };
    this.jobs.set(roomId, job);
    try {
      let chosen;
      if (characterId) {
        chosen = characters.filter(c => c.id === characterId);
        if (!chosen.length) throw new Error('被点名的角色不可用');
      } else {
        const mentioned = mentionedCharacters(text, characters);
        if (mentioned.length) chosen = mentioned;
        else if (roomId !== 'group' || all || videos.length) chosen = characters;
        else chosen = [weightedPick(characters, this.random)];
      }
      if (!automatic) await this.addMessage(roomId, 'user', text.trim(), { mediaIds });
      job.promise = this.run(job, chosen, { video: videos[0], automatic, room, characters })
        .catch(async error => {
          if (!controller.signal.aborted) {
            this.activity.push({ at: this.now(), type: 'error', text: error.message });
            await this.addMessage(roomId, 'system', error.message, { error: true });
          }
        }).finally(() => { this.jobs.delete(roomId); this.store.touch(); });
      return { accepted: true };
    } catch (e) { this.jobs.delete(roomId); throw e; }
  }
  async run(job, chosen, { video, automatic, room, characters }) {
    const { signal } = job.controller;
    const remember = [];
    // Video first impressions use the same initial history, before any other role speaks.
    const contexts = new Map(await Promise.all(chosen.map(async c => [c.id, await this.contexts.prepare(c, room.id, automatic
      ? '你现在有空，可以自然地发起一个话题，接续过去的事情、找用户聊两句，或和某位成员说话。没有新经历就不要声称自己刚做了现实操作。没有合适的话可只输出[沉默]。'
      : video ? '大家在一起看用户刚分享的视频。先形成你自己的感受，挑你在意的细节自然说话，不必做完整观后感。'
      : '回应最新消息，保持你自己的语气和关注点。', video, signal)])));
    job.phase = video ? '一起看视频' : automatic ? '想找你聊聊' : '正在接话';
    const attempts = chosen.map(async character => {
      const output = await this.speak(job, character, contexts.get(character.id), video);
      return { character, output };
    });
    const initial = await Promise.allSettled(attempts);
    const initiallyFailed = [];
    signal.throwIfAborted();
    for (let index = 0; index < initial.length; index++) {
      const attempt = initial[index], character = chosen[index];
      delete job.partials[character.id];
      if (attempt.status === 'fulfilled') {
        const { output } = attempt.value;
        if (!isSilent(output.text)) {
          const message = await this.addMessage(room.id, character.id, output.text.trim(), { transport: output.transport, automatic });
          remember.push({ character, message });
        }
      } else if (attempt.reason?.name !== 'AbortError') {
        initiallyFailed.push(character.id);
        await this.addMessage(room.id, character.id, attempt.reason.message || '回复失败', { error: true, retry: { characterId: character.id, mediaIds: video ? [video.id] : [] } });
      }
    }
    if (room.id === 'group') await this.continueConversation(job, room, remember, video, automatic, remember.length ? [] : chosen.map(c => c.id), initiallyFailed);
    job.acceptingInput = false;
    job.partials = {}; job.phase = '整理自己的记忆'; this.store.touch();
    await Promise.allSettled([...new Map(remember.map(r => [r.character.id, r])).values()].map(({ character, message }) => this.remember(character, room, message.id, signal)));
    signal.throwIfAborted();
    if (automatic) { this.store.state.lastAutoAt = this.now(); await this.store.save(); }
  }
  async continueConversation(job, room, remember, video, automatic, initiallyDeclined = [], initiallyFailed = []) {
    const { signal } = job.controller;
    let lastId = remember.at(-1)?.character.id, revision = job.inputRevision;
    const declined = new Set(initiallyDeclined), failed = new Set(initiallyFailed);
    while (true) {
      signal.throwIfAborted();
      if (revision !== job.inputRevision) { declined.clear(); failed.clear(); revision = job.inputRevision; }
      const available = this.readyCharacters();
      let queued;
      while (job.pendingSpeakers.length && !queued) {
        const id = job.pendingSpeakers.shift();
        queued = available.find(c => c.id === id && !failed.has(id));
      }
      const candidates = available.filter(c => c.id !== lastId && !declined.has(c.id) && !failed.has(c.id));
      const latest = room.messages.findLast(m => !m.error && m.speaker !== 'system');
      const called = mentionedCharacters(latest?.text || '', candidates);
      // Ask every other willing member before ending; one person's silence
      // doesn't end the group. A new utterance opens a fresh chance to respond.
      const character = queued || called[0] || weightedPick(candidates, this.random);
      if (!character) {
        job.acceptingInput = false;
        room.lastDiscussion = { reason: failed.size ? 'model-error' : 'natural', at: this.now(), utterances: remember.length };
        break;
      }
      job.phase = `听听${character.name}想不想接话`;
      const watched = remember.some(r => r.character.id === character.id && r.message.transport);
      const instruction = '[自然接话判断]\n' + (queued ? '用户刚刚插话或点名了你，先回应用户的最新消息。\n' : called.length ? '上一条消息点名了你，优先回应对方。\n' : '')
        + '这是持续进行的正常群聊，不是单轮问答。你可以回复某位成员、自然延伸话题、用 @名字 请其他成员接话。只在你有实际想说的话时直接发消息；不要重复刚才的内容，不要为了延长聊天而机械提问。不要要求用户每轮都发言。话题已尽、需要等待用户或确实没有补充时，只输出[沉默]，这只是内部决定，不会发到群里。不要输出括号内容、动作或心理旁白。'
        + (video && !watched ? '\n你尚未直接收到视频，只知道大家公开说过的内容，不要声称自己看过。' : '');
      try {
        const context = await this.contexts.prepare(character, room.id, instruction, null, signal);
        const output = await this.speak(job, character, context);
        signal.throwIfAborted();
        delete job.partials[character.id]; this.store.touch();
        const repeated = room.messages.filter(m => m.speaker === character.id && !m.error).slice(-3).some(m => m.text.trim() === output.text.trim());
        if (isSilent(output.text) || repeated) { declined.add(character.id); continue; }
        const message = await this.addMessage(room.id, character.id, output.text.trim(), { automatic });
        remember.push({ character, message }); lastId = character.id;
        declined.clear();
      } catch (e) {
        signal.throwIfAborted();
        failed.add(character.id); delete job.partials[character.id]; this.store.touch();
        this.activity.push({ at: this.now(), type: 'error', text: `${character.name}接话失败：${e.message}` });
      }
    }
  }
  async speak(job, character, context, video) {
    const signal = AbortSignal.any([job.controller.signal, AbortSignal.timeout(240000)]);
    job.partials[character.id] = { name: character.name, text: '', phase: video ? '看视频中' : '正在输入' };
    this.store.touch();
    const output = await this.gateway.generate(character, { ...context, video, signal, onText: text => {
      const spoken = spokenText(text);
      job.partials[character.id] = { name: character.name, text: isSilent(spoken) || /^\[(?:沉默)?$/.test(spoken) ? '' : spoken, phase: '正在输入' }; this.store.touch();
    } });
    signal.throwIfAborted(); return { ...output, text: spokenText(output.text) };
  }
  async remember(character, room, ownMessageId, signal) {
    const relevant = room.messages.filter(m => !m.error).slice(-18);
    const ids = new Set(relevant.map(m => m.id));
    const input = relevant.map(m => ({ id: m.id, speaker: m.speaker, text: m.text, mediaIds: m.mediaIds || [] }));
    try {
      const result = await this.gateway.generate(character, {
        system: `你正在为${character.name}整理这一次真实聊天的个人记忆。人设：${character.persona}\n只依据提供的记录，区分谁说了什么，不把视频剧情当成用户经历，不把角色自己的猜测当成事实。记住值得以后提起的偏好、约定、关系进展和共同经历。不要推断没说过的隐私，不改核心人设。输出 JSON：{"memories":[{"text":"具体记忆","sourceIds":["记录中的ID"]}],"diary":"以角色口吻写一小段今天对这次交流的感受"}。最多6条记忆，没有值得记的就空数组。`,
        prompt: JSON.stringify({ scene: room.id === 'group' ? '公开群聊' : '与用户的私聊', records: input }),
        signal: AbortSignal.any([signal, AbortSignal.timeout(120000)]),
      });
      signal.throwIfAborted();
      const parsed = extractJson(result.text);
      const scope = room.id;
      const known = new Set(character.memories.filter(m => m.scope === scope).map(m => m.text.trim()));
      const newMemories = (Array.isArray(parsed.memories) ? parsed.memories : []).slice(0, 6)
        .filter(m => typeof m.text === 'string' && m.text.trim() && Array.isArray(m.sourceIds) && m.sourceIds.length && m.sourceIds.every(id => ids.has(id)))
        .filter(m => !known.has(m.text.trim()))
        .map(m => ({ id: randomUUID(), text: m.text.trim().slice(0, 1600), sourceIds: [...new Set(m.sourceIds)], scope, at: this.now(), pinned: false }));
      character.memories.push(...newMemories);
      if (typeof parsed.diary === 'string' && parsed.diary.trim()) character.diaries.push({ id: randomUUID(), text: parsed.diary.trim().slice(0, 6000), scope, at: this.now(), sourceIds: [ownMessageId] });
      await this.store.save();
    } catch (e) {
      if (!signal.aborted) this.activity.push({ at: this.now(), type: 'memory', text: `${character.name}的本次记忆整理未完成：${e.message}` });
    }
  }
  stop(roomId) { this.jobs.get(roomId)?.controller.abort(new DOMException('已停止本次聊天', 'AbortError')); }
  async tick() {
    const state = this.store.state, s = state.settings;
    if (this.closed || !s.autoChat || this.now() < state.nextAutoAt || this.jobs.size || inQuietHours(s, this.now())) return;
    const characters = this.readyCharacters();
    if (!characters.length) return;
    state.nextAutoAt = this.now() + (s.autoMinMinutes + this.random() * (s.autoMaxMinutes - s.autoMinMinutes)) * 60000;
    await this.store.save();
    const character = weightedPick(characters, this.random);
    const roomId = this.random() < s.autoPrivateChance ? `dm:${character.id}` : 'group';
    await this.send({ roomId, characterId: character.id, automatic: true });
  }
  snapshot(roomId = 'group') {
    const state = this.store.state;
    return {
      version: state.version, revision: state.revision, settings: state.settings,
      characters: state.characters,
      rooms: state.rooms.map(r => ({ id: r.id, name: r.name, count: r.messages.length, lastAt: r.messages.at(-1)?.at || 0, lastMessage: r.messages.at(-1)?.text.slice(0, 70) || '' })),
      room: { ...this.store.room(roomId), count: this.store.room(roomId).messages.length, messages: this.store.room(roomId).messages.slice(-300) },
      media: state.media.map(({ transcripts, ...m }) => ({ ...m, transcriptAvailable: Boolean(m.notes || Object.keys(transcripts || {}).length) })),
      jobs: [...this.jobs.values()].map(({ roomId, partials, phase, startedAt }) => ({ roomId, partials, phase, startedAt })),
      activity: this.activity.slice(-30), nextAutoAt: state.nextAutoAt, lastAutoAt: state.lastAutoAt,
      contextMetrics: [...this.contexts.metrics.values()].filter(m => m.roomId === roomId),
    };
  }
  async close() {
    this.closed = true;
    for (const roomId of this.jobs.keys()) this.stop(roomId);
    await Promise.allSettled([...this.jobs.values()].map(j => j.promise));
    await this.store.close();
  }
}
