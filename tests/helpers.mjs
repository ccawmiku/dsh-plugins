import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Store } from '../src/store.mjs';
import { MediaLibrary } from '../src/media.mjs';
import { ModelGateway } from '../src/providers.mjs';
import { SalonEngine } from '../src/engine.mjs';

export async function fixture(t, options = {}) {
  const directory = await mkdtemp(join(tmpdir(), 'salon-test-'));
  const store = await new Store(directory).open();
  store.state.settings.defaultProvider = 'test'; store.state.settings.defaultModel = 'test-model';
  const calls = [];
  const llm = {
    listProviders: () => [{ id: 'test', name: 'Test' }],
    listModels: async () => [{ id: 'test-model', inputModalities: ['image', 'text'] }],
    resolveModelInfo: async () => ({ context: { contextWindow: options.capacity || 1000000 }, inputModalities: ['text', 'image'] }),
    async *stream(request) {
      calls.push(request);
      if (options.stream) { yield* options.stream(request); return; }
      let text = request.system.includes('整理这一次真实聊天的个人记忆') ? '{"memories":[],"diary":"今天聊得很开心。"}' : request.system.includes('连续剧情记录员') ? '大家在沙龙聊过点心，约好了下次一起看视频。' : request.messages[0].content[0].text.includes('[自然接话判断]') ? '[沉默]' : '你好，我记得我们说过的事情。';
      yield { type: 'text-delta', text, index: 0 }; yield { type: 'finish', reason: { kind: 'stop' } };
    },
  };
  const attachments = { saveImage: async input => ({ id: 'image-' + input.name, mediaType: input.mediaType, bytes: input.data.length }) };
  const services = { attachments, ...options.services };
  const ctx = { llm, get: name => services[name] };
  const media = new MediaLibrary(store);
  const gateway = new ModelGateway(ctx, store, media, options.fetcher ? { fetcher: options.fetcher } : {});
  const engine = new SalonEngine(store, gateway, { random: () => 0.1 });
  t.after(async () => { await engine.close(); await rm(directory, { recursive: true, force: true }); });
  return { directory, store, gateway, engine, media, ctx, calls };
}
export async function idle(engine, roomId = 'group') {
  for (let i = 0; i < 50; i++) {
    const job = engine.jobs.get(roomId);
    if (!job) return;
    await job.promise;
  }
  throw new Error('job did not settle');
}
