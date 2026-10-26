import { randomUUID } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { Readable } from 'node:stream';
import { ContextManager } from './compression.mjs';

const stringRules = { title: 100, userName: 80, userPersona: 12000, defaultProvider: 200, defaultModel: 300, videoProvider: 200, videoModel: 300, nativeBaseURL: 2000, nativeKeyRef: 200, quietStart: 5, quietEnd: 5, timezone: 100 };
const numberRules = { contextTokens: [8192, 2000000], compressionTrigger: [0.4, 0.95], frameInterval: [0.2, 60], maxFrames: [1, 256], frameWidth: [240, 1600], maxOutputTokens: [256, 32768], autoMinMinutes: [1, 1440], autoMaxMinutes: [1, 1440], autoPrivateChance: [0, 1] };
const boolRules = ['allowVideoFallback', 'transcribeAudio', 'autoChat'];
const modes = ['auto', 'native', 'frames'];
function text(value, max, label) { if (typeof value !== 'string' || value.length > max) throw new Error(`${label}须为不超过${max}字的文字`); return value; }
function number(value, range, label) { if (typeof value !== 'number' || !Number.isFinite(value) || value < range[0] || value > range[1]) throw new Error(`${label}须在${range[0]}至${range[1]}之间`); return value; }

export function validateSettings(previous, patch) {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) throw new Error('设置格式错误');
  const result = { ...previous };
  delete result.followUpTurns;
  for (const [key, max] of Object.entries(stringRules)) if (Object.hasOwn(patch, key)) result[key] = text(patch[key], max, key);
  for (const [key, range] of Object.entries(numberRules)) if (Object.hasOwn(patch, key)) result[key] = number(patch[key], range, key);
  for (const key of boolRules) if (Object.hasOwn(patch, key)) { if (typeof patch[key] !== 'boolean') throw new Error(`${key}须为开关`); result[key] = patch[key]; }
  if (Object.hasOwn(patch, 'videoMode')) { if (!modes.includes(patch.videoMode)) throw new Error('视频模式无效'); result.videoMode = patch.videoMode; }
  for (const key of ['quietStart', 'quietEnd']) if (result[key] && !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(result[key])) throw new Error('安静时段须为 HH:mm 格式');
  try { new Intl.DateTimeFormat('zh-CN', { timeZone: result.timezone }); } catch { throw new Error('时区格式无效'); }
  if (result.autoMaxMinutes < result.autoMinMinutes) throw new Error('主动聊天最长间隔不能小于最短间隔');
  for (const key of ['contextTokens', 'maxFrames', 'frameWidth', 'maxOutputTokens']) result[key] = Math.floor(result[key]);
  return result;
}

export async function action(engine, body) {
  const { store, gateway } = engine;
  switch (body.action) {
    case 'send': {
      const roomId = text(body.roomId || 'group', 100, '会话');
      const mediaIds = body.mediaIds || [];
      if (!Array.isArray(mediaIds) || mediaIds.length > 1 || mediaIds.some(id => typeof id !== 'string')) throw new Error('视频列表无效');
      return engine.send({ roomId, text: text(body.text || '', 300000, '消息'), mediaIds, all: body.all === true, characterId: body.characterId });
    }
    case 'stop': engine.stop(body.roomId || 'group'); return { stopped: true };
    case 'settings': {
      const next = validateSettings(store.state.settings, body.patch);
      store.state.settings = next;
      store.state.nextAutoAt = Date.now() + next.autoMinMinutes * 60000;
      await store.save(); return { saved: true };
    }
    case 'character': {
      const character = store.character(body.id), patch = body.patch || {}, next = { ...character };
      for (const [key, max] of Object.entries({ name: 60, subtitle: 100, avatar: 2000, persona: 60000, interests: 3000, provider: 200, model: 300, reasoningEffort: 100, color: 20 })) if (Object.hasOwn(patch, key)) next[key] = text(patch[key], max, key);
      if (!next.name.trim() || store.state.characters.some(c => c.id !== character.id && c.name === next.name)) throw new Error('角色名字不能为空或与其他角色重复');
      if (!/^#[\da-fA-F]{6}$/.test(next.color)) throw new Error('角色颜色格式须为 #RRGGBB');
      if (Object.hasOwn(patch, 'initiative')) next.initiative = number(patch.initiative, [0, 1], '主动程度');
      if (Object.hasOwn(patch, 'temperature')) next.temperature = number(patch.temperature, [0, 2], '温度');
      if (Object.hasOwn(patch, 'enabled')) { if (typeof patch.enabled !== 'boolean') throw new Error('启用状态无效'); next.enabled = patch.enabled; }
      if (Object.hasOwn(patch, 'videoMode')) { if (![...modes, 'inherit'].includes(patch.videoMode)) throw new Error('视频模式无效'); next.videoMode = patch.videoMode; }
      Object.assign(character, next);
      store.room('dm:' + character.id).name = next.name;
      await store.save(); return { saved: true };
    }
    case 'add-character': {
      const id = randomUUID();
      const character = { ...structuredClone(store.state.characters[0]), id, name: '新成员' + (store.state.characters.length + 1), subtitle: '等待你来设定', avatar: '✨', persona: '你是一位成年女性，刚来到沙龙，性格和背景等待用户补充。', provider: '', model: '', memories: [], diaries: [], interests: '', enabled: true };
      store.state.characters.push(character); store.state.rooms.push({ id: `dm:${id}`, name: character.name, messages: [] });
      await store.save(); return { id };
    }
    case 'memory': {
      const character = store.character(body.characterId);
      const scope = body.scope || 'group';
      if (!['group', `dm:${character.id}`].includes(scope)) throw new Error('记忆不能写入其他角色的私聊');
      const existing = body.id ? character.memories.find(m => m.id === body.id) : null;
      if (body.id && !existing) throw new Error('记忆不存在');
      if (body.remove) { character.memories = character.memories.filter(m => m.id !== body.id); }
      else {
        const value = text(body.text, 12000, '记忆');
        const keys = text(body.keys || '', 2000, '关键词').split(/[,，、\n]/).map(s => s.trim()).filter(Boolean).slice(0, 40);
        const memory = { id: existing?.id || randomUUID(), text: value, scope, keys, pinned: body.pinned === true, at: existing?.at || Date.now(), sourceIds: existing?.sourceIds || [], manual: true };
        if (existing) Object.assign(existing, memory); else character.memories.push(memory);
      }
      await store.save(); return { saved: true };
    }
    case 'transcript': await gateway.media.setTranscript(body.id, body.text); return { saved: true };
    case 'wake': {
      const roomId = body.roomId || 'group';
      const characterId = body.characterId || engine.readyCharacters().find(c => roomId === 'group' || roomId === `dm:${c.id}`)?.id;
      return engine.send({ roomId, characterId, automatic: true });
    }
    case 'compact': {
      const roomId = body.roomId || 'group';
      if (engine.jobs.has(roomId)) throw new Error('请先停止当前聊天再整理摘要');
      const c = roomId === 'group' ? engine.readyCharacters()[0] : engine.readyCharacters().find(c => `dm:${c.id}` === roomId);
      if (!c) throw new Error('请先配置该会话的模型');
      const signal = AbortSignal.timeout(240000);
      await engine.contexts.compact(roomId, c, await engine.contexts.limits(c, null, signal), signal, true);
      return { saved: true };
    }
    case 'summary': {
      const room = store.room(body.roomId || 'group');
      if (engine.jobs.has(room.id)) throw new Error('请先停止当前聊天再修改摘要');
      const summary = room.summaries?.find(s => s.id === room.summaryId);
      if (!summary) throw new Error('本会话还没有摘要');
      if (body.restore) room.summaryId = summary.previousId;
      else {
        const next = { ...summary, id: randomUUID(), text: text(body.text, 30000, '摘要'), previousId: summary.id, at: Date.now(), manual: true };
        room.summaries.push(next); room.summaryId = next.id;
      }
      await store.save(); return { saved: true };
    }
    default: throw new Error('未知操作');
  }
}

export function createAPI(engine) {
  return async request => {
    const url = new URL(request.url);
    try {
      if (request.method === 'POST' && request.headers.get('x-salon-client') !== '1') return Response.json({ error: '请求缺少沙龙客户端标识' }, { status: 403 });
      if (url.pathname === '/api/salon/state') return Response.json(engine.snapshot(url.searchParams.get('room') || 'group'));
      if (url.pathname === '/api/salon/catalog') return Response.json(await engine.gateway.catalog());
      if (url.pathname === '/api/salon/action') {
        if (Number(request.headers.get('content-length')) > 2 * 1024 * 1024) throw new Error('请求过大');
        const raw = await request.text();
        if (Buffer.byteLength(raw) > 2 * 1024 * 1024) throw new Error('请求过大');
        return Response.json(await action(engine, JSON.parse(raw)));
      }
      if (url.pathname === '/api/salon/upload') {
        if (!request.body) throw new Error('没有收到视频');
        const video = await engine.gateway.media.importStream(request.body, url.searchParams.get('name'), request.signal);
        return Response.json(video);
      }
      if (url.pathname === '/api/salon/media') {
        const video = engine.gateway.media.get(url.searchParams.get('id'));
        const part = url.searchParams.get('part') || 'original';
        const file = engine.gateway.media.path(video, part), info = await stat(file);
        const headers = { 'content-type': part === 'original' ? video.mime : part === 'audio' ? 'audio/wav' : 'image/jpeg', 'cache-control': 'private, max-age=3600', 'accept-ranges': 'bytes', 'x-content-type-options': 'nosniff' };
        let start = 0, end = info.size - 1, status = 200;
        const range = request.headers.get('range');
        if (range) {
          const match = /^bytes=(\d*)-(\d*)$/.exec(range);
          if (!match || (!match[1] && !match[2])) return new Response(null, { status: 416, headers: { 'content-range': `bytes */${info.size}` } });
          if (!match[1]) start = Math.max(0, info.size - Number(match[2]));
          else { start = Number(match[1]); if (match[2]) end = Math.min(Number(match[2]), end); }
          if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= info.size) return new Response(null, { status: 416, headers: { 'content-range': `bytes */${info.size}` } });
          status = 206; headers['content-range'] = `bytes ${start}-${end}/${info.size}`;
        }
        headers['content-length'] = String(end - start + 1);
        return new Response(request.method === 'HEAD' ? null : Readable.toWeb(createReadStream(file, { start, end })), { status, headers });
      }
      if (url.pathname === '/api/salon/export') return new Response(JSON.stringify(engine.store.state, null, 2), { headers: { 'content-type': 'application/json', 'content-disposition': 'attachment; filename="salon-backup.json"' } });
      if (url.pathname === '/api/salon/history') {
        const room = engine.store.room(url.searchParams.get('room') || 'group');
        const before = url.searchParams.get('before');
        const end = before ? room.messages.findIndex(m => m.id === before) : room.messages.length;
        return Response.json(room.messages.slice(Math.max(0, end - 200), end));
      }
      return Response.json({ error: '接口不存在' }, { status: 404 });
    } catch (error) { return Response.json({ error: error.message || '操作失败' }, { status: 400 }); }
  };
}

export const routes = [
  ['state', ['GET']], ['catalog', ['GET']], ['action', ['POST']], ['upload', ['POST']], ['media', ['GET', 'HEAD']], ['export', ['GET']], ['history', ['GET']],
];
