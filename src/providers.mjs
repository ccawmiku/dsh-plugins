import { readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';

function cleanError(message, secrets = []) {
  let result = String(message || '模型请求失败');
  for (const secret of secrets.filter(Boolean)) result = result.replaceAll(secret, '[已隐藏]');
  return result.replace(/(?:Bearer\s+)[^\s"']+/gi, 'Bearer [已隐藏]').slice(0, 1200);
}
export function nativeBase(base) {
  const url = new URL(base || 'https://generativelanguage.googleapis.com');
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) throw new Error('视频接口地址须为不含凭据和查询参数的 HTTP(S) 地址');
  url.pathname = url.pathname.replace(/\/(?:v1beta|v1|v1alpha)\/?$/, '').replace(/\/$/, '');
  return url.toString().replace(/\/$/, '');
}

export class ModelGateway {
  constructor(ctx, store, media, { fetcher = fetch } = {}) {
    this.ctx = ctx; this.store = store; this.media = media; this.fetcher = fetcher;
    this.remoteFiles = new Map(); this.transcribing = new Map(); this.attachmentRefs = new Map();
  }
  async catalog() {
    const providers = this.ctx.llm.listProviders();
    return Promise.all(providers.map(async p => {
      try { return { ...p, models: (await this.ctx.llm.listModels(p.id)).map(m => ({ id: m.id, name: m.name || m.id, inputModalities: m.inputModalities, reasoning: m.reasoning })) }; }
      catch { return { ...p, models: [], error: '模型目录读取失败，可手动填写模型 ID' }; }
    }));
  }
  route(character) {
    const s = this.store.state.settings;
    const route = { provider: character.provider || s.defaultProvider, model: character.model || s.defaultModel };
    if (!route.provider || !route.model) throw new Error('请先在「沙龙设置」选择默认模型，或为该角色单独选择模型。');
    return route;
  }
  async nativeConfig(route, { perception = false } = {}) {
    const s = this.store.state.settings;
    const provider = perception ? (s.videoProvider || route.provider) : route.provider;
    const model = perception ? (s.videoModel || route.model) : route.model;
    const directory = this.ctx.llm.listConfigurableProviders?.().find(p => p.provider === provider);
    let profile;
    if (directory) {
      const value = this.ctx.get?.('settings')?.describe({ redactSecrets: false }).find(d => d.ns === directory.settingsNs)?.value;
      profile = directory.settingsPath.reduce((v, key) => v?.[key], value);
    }
    const baseURL = s.nativeBaseURL || profile?.baseURL || directory?.defaultBaseURL;
    const keyRef = s.nativeKeyRef || profile?.apiKeyEnv || (provider === 'google' || provider === 'gemini' ? 'GEMINI_API_KEY' : '');
    if (!baseURL && !/google|gemini/i.test(provider)) throw new Error('无法从该 DSH 提供方推导 Gemini 原生视频接口，请在视频设置填写原生接口地址和凭据变量名。');
    if (!keyRef) throw new Error('原生视频通道缺少凭据引用，请选择 Gemini 提供方或填写已保存的凭据变量名。');
    const key = (await this.ctx.get?.('credentials')?.resolve(keyRef))?.value || process.env[keyRef];
    if (!key) throw new Error(`找不到视频通道凭据 ${keyRef}，请在 DSH 中保存该凭据。`);
    return { provider, model: model.replace(/^models\//, ''), base: nativeBase(baseURL), key, keyRef, headers: { ...profile?.headers, 'x-goog-api-key': key, authorization: `Bearer ${key}` } };
  }
  async request(config, path, init, signal) {
    let res;
    const replayable = !init.body || typeof init.body === 'string';
    for (let attempt = 0; attempt < (replayable ? 3 : 1); attempt++) {
      signal?.throwIfAborted();
      try {
        res = await this.fetcher(config.base + path, { ...init, headers: { ...config.headers, ...init.headers }, signal });
        if (![429, 502, 503, 504].includes(res.status) || attempt === 2 || !replayable) break;
        await res.body?.cancel();
      } catch (error) {
        signal?.throwIfAborted();
        if (attempt === 2 || !replayable) throw new Error(cleanError(error.message, [config.key]));
      }
      await new Promise((resolve, reject) => {
        const timer = setTimeout(done, (attempt + 1) * 800);
        function done() { signal?.removeEventListener('abort', abort); resolve(); }
        function abort() { clearTimeout(timer); signal?.removeEventListener('abort', abort); reject(signal.reason); }
        signal?.addEventListener('abort', abort, { once: true }); if (signal?.aborted) abort();
      });
    }
    if (!res.ok) {
      let detail = '';
      try { detail = (await res.json()).error?.message || ''; } catch {}
      throw new Error(cleanError(`原生视频接口 HTTP ${res.status}${detail ? '：' + detail : ''}`, [config.key]));
    }
    return res;
  }
  async filePart(config, file, mime, signal) {
    const info = await stat(file);
    if (info.size <= 12 * 1024 * 1024) return { inlineData: { mimeType: mime, data: (await readFile(file)).toString('base64') } };
    const signature = createHash('sha256').update(config.base + config.key + file + info.mtimeMs).digest('hex');
    const cached = this.remoteFiles.get(signature);
    if (cached && cached.expires > Date.now()) return { fileData: { mimeType: mime, fileUri: cached.uri } };
    const start = await this.request(config, '/upload/v1beta/files', {
      method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-upload-protocol': 'resumable', 'x-goog-upload-command': 'start', 'x-goog-upload-header-content-length': String(info.size), 'x-goog-upload-header-content-type': mime },
      body: JSON.stringify({ file: { display_name: 'salon-local-video' } }),
    }, signal);
    const uploadURL = start.headers.get('x-goog-upload-url');
    if (!uploadURL) throw new Error('该接口没有返回视频上传地址；它可能不支持 Gemini Files API。可显式切换抽帧模式。');
    const upload = new URL(uploadURL);
    if (upload.origin !== new URL(config.base).origin) throw new Error('上传地址跨域，已停止发送凭据。请使用支持同源 Files API 的接口或小于 12 MiB 的视频。');
    const { createReadStream } = await import('node:fs');
    const response = await this.request(config, upload.pathname + upload.search, { method: 'POST', headers: { 'x-goog-upload-offset': '0', 'x-goog-upload-command': 'upload, finalize', 'content-length': String(info.size) }, body: createReadStream(file), duplex: 'half' }, signal);
    const uploaded = await response.json();
    let remote = uploaded.file || uploaded;
    if (!/^files\/[\w-]+$/.test(remote.name || '')) throw new Error('视频上传结果缺少有效文件标识');
    const deadline = Date.now() + 180000;
    while (remote.state === 'PROCESSING' && Date.now() < deadline) {
      await new Promise((resolve, reject) => {
        const timer = setTimeout(done, 1500);
        function done() { signal?.removeEventListener('abort', aborted); resolve(); }
        function aborted() { clearTimeout(timer); signal?.removeEventListener('abort', aborted); reject(signal.reason); }
        signal?.addEventListener('abort', aborted, { once: true }); if (signal?.aborted) aborted();
      });
      remote = await (await this.request(config, `/v1beta/${remote.name}`, { method: 'GET' }, signal)).json();
    }
    if (remote.state !== 'ACTIVE' || !remote.uri) throw new Error('视频尚未处理成功，未将其当成已观看。');
    this.remoteFiles.set(signature, { uri: remote.uri, expires: Date.now() + 24 * 3600000 });
    return { fileData: { mimeType: mime, fileUri: remote.uri } };
  }
  async nativeGenerate(config, { system, prompt, file, mime, signal, onText, maxTokens, temperature }) {
    const parts = [{ text: prompt }];
    if (file) parts.push(await this.filePart(config, file, mime, signal));
    const res = await this.request(config, `/v1beta/models/${encodeURIComponent(config.model)}:generateContent`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] }, contents: [{ role: 'user', parts }], generationConfig: { maxOutputTokens: maxTokens || this.store.state.settings.maxOutputTokens, ...(temperature == null ? {} : { temperature }) },
      }),
    }, signal);
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.filter(p => !p.thought && p.text).map(p => p.text).join('') || '';
    if (!text) throw new Error(`视频通道没有返回正文${data.promptFeedback?.blockReason ? '，原因：' + data.promptFeedback.blockReason : ''}`);
    onText?.(text); return text;
  }
  async transcribe(video, route, signal) {
    if (video.notes) return { text: video.notes, source: '手动字幕/备注' };
    if (!video.hasAudio) return { text: '', source: '无音轨' };
    if (!this.store.state.settings.transcribeAudio) return { text: '', source: '声音转写已关闭' };
    let config;
    try { config = await this.nativeConfig(route, { perception: true }); }
    catch (e) { return { text: '', source: '未转写', warning: e.message }; }
    const key = createHash('sha256').update(config.base + config.model).digest('hex').slice(0, 20);
    if (video.transcripts[key]) return { text: video.transcripts[key], source: '音轨转写（Gemini）' };
    const pendingKey = video.id + key;
    if (this.transcribing.has(pendingKey)) return this.transcribing.get(pendingKey);
    const task = (async () => {
      const file = await this.media.audio(video, signal);
      const text = await this.nativeGenerate(config, { system: '你负责忠实转写音轨。', prompt: '请转写音轨中可辨认的对白，保留原语言并标注大致时间。对重要音乐、语气、笑声和音效简要加注；无法听清处写[听不清]，不要补造台词。只输出转写。', file, mime: 'audio/wav', signal, maxTokens: 8192 });
      video.transcripts[key] = text; await this.store.save();
      return { text, source: '音轨转写（Gemini）' };
    })();
    this.transcribing.set(pendingKey, task);
    try { return await task; }
    catch (error) { signal?.throwIfAborted(); return { text: '', source: '未转写', warning: error.message }; }
    finally { this.transcribing.delete(pendingKey); }
  }
  async frameParts(video, route, signal) {
    const frames = await this.media.frames(video, signal);
    const attachments = this.ctx.get?.('attachments');
    if (!attachments) throw new Error('DSH 未提供图片存储服务，抽帧模式不可用。');
    const info = await this.ctx.llm.resolveModelInfo?.(route.provider, route.model, signal);
    if (info?.inputModalities && !info.inputModalities.includes('image')) throw new Error('这个角色选择的是纯文本模型，请换成支持图片的模型再看视频。');
    const sound = await this.transcribe(video, route, signal);
    const content = [{ type: 'text', text: `视频「${video.name}」，时长 ${video.duration.toFixed(1)} 秒。下方画面按时间排列。\n声音材料：${sound.source}${sound.warning ? '；' + sound.warning : ''}\n${sound.text}\n仅按提供的画面与声音材料理解；没提供声音时不要声称听过。` }];
    for (const frame of frames) {
      signal?.throwIfAborted();
      const file = this.media.path(video, frame.name);
      let ref = this.attachmentRefs.get(file);
      if (!ref) { ref = await attachments.saveImage({ data: await readFile(file), mediaType: 'image/jpeg', name: `${video.id}-${frame.name}` }); this.attachmentRefs.set(file, ref); }
      content.push({ type: 'text', text: `[画面时间 ${frame.time.toFixed(1)} 秒]` }, { type: 'image', attachment: ref });
    }
    return { content, transport: { mode: 'frames', frames: frames.length, audio: sound.source, warning: sound.warning || '' } };
  }
  async textGenerate(route, { system, prompt, content = [], signal, onText, character }) {
    let text = '';
    for await (const chunk of this.ctx.llm.stream({ ...route, system, messages: [{ role: 'user', content: [{ type: 'text', text: prompt }, ...content] }], signal, maxTokens: this.store.state.settings.maxOutputTokens, temperature: character?.temperature ?? 0.9, ...(character?.reasoningEffort ? { reasoningEffort: character.reasoningEffort } : {}) })) {
      signal?.throwIfAborted();
      if (chunk.type === 'text-delta') { text += chunk.text; onText?.(text); }
      if (chunk.type === 'finish' && ['error', 'aborted'].includes(chunk.reason?.kind)) throw new Error(cleanError(chunk.reason?.failure?.message || (chunk.reason.kind === 'aborted' ? '已停止' : 'DSH 模型请求失败')));
    }
    if (!text.trim()) throw new Error('模型没有返回正文');
    return text;
  }
  async generate(character, { system, prompt, video, signal, onText }) {
    const route = this.route(character);
    if (!video) return { text: await this.textGenerate(route, { system, prompt, signal, onText, character }), transport: null };
    const s = this.store.state.settings;
    const selected = character.videoMode === 'inherit' ? s.videoMode : character.videoMode;
    const direct = selected === 'native' || (selected === 'auto' && /gemini/i.test(route.model));
    let fallbackReason = '';
    if (direct) {
      try {
        const config = await this.nativeConfig(route);
        const text = await this.nativeGenerate(config, { system, prompt: prompt + `\n附上本次共同观看的原视频「${video.name}」。请按你自己的人设看视频并回应。`, file: this.media.path(video), mime: video.mime, signal, onText, temperature: character.temperature });
        return { text, transport: { mode: 'native', provider: config.provider, model: config.model, audio: video.hasAudio ? '随原视频提交' : '原视频无音轨' } };
      } catch (e) {
        signal?.throwIfAborted();
        if (!s.allowVideoFallback) throw new Error(`视频直传未成功：${e.message}。可手动切换抽帧模式，或在设置中明确允许失败后回退。`);
        fallbackReason = e.message;
      }
    }
    const { content, transport } = await this.frameParts(video, route, signal);
    if (fallbackReason) transport.fallbackReason = fallbackReason;
    const text = await this.textGenerate(route, { system, prompt, content, signal, onText, character });
    return { text, transport };
  }
}
