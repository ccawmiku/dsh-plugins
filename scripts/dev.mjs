import { Store } from '../src/store.mjs';
import { MediaLibrary } from '../src/media.mjs';
import { ModelGateway } from '../src/providers.mjs';
import { SalonEngine } from '../src/engine.mjs';
import { startServer } from './server.mjs';
import { resolve } from 'node:path';

const demo = process.argv.includes('--demo');
if (!demo) {
  console.log('DSH 插件请安装后使用；界面演示请运行 npm run dev -- --demo。演示模式不连接真实模型。');
  process.exit(0);
}
const store = await new Store(resolve(process.env.SALON_DATA_DIR || '.dev-data/demo')).open();
store.state.settings.autoChat = false;
store.state.settings.defaultProvider = 'demo';
store.state.settings.defaultModel = 'demo-roleplay';
await store.save();
const llm = {
  listProviders: () => [{ id: 'demo', name: '演示模型（不联网）' }],
  listModels: async () => [{ id: 'demo-roleplay', name: '演示角色', inputModalities: ['text', 'image'] }],
  resolveModelInfo: async () => ({ context: { contextWindow: 1000000 }, inputModalities: ['text', 'image'] }),
  async *stream(options) {
    let output;
    if (options.system.includes('整理这一次真实聊天的个人记忆')) {
      const records = JSON.parse(options.messages[0].content[0].text).records;
      output = JSON.stringify({ memories: [], diary: '今天有人推开了沙龙的门。下次还想再聊聊。' });
    } else if (options.system.includes('连续剧情记录员')) output = '经历时间线：大家在沙龙相识，分享了各自喜欢的日常话题。';
    else if (options.messages[0].content[0].text.includes('[自然接话判断]')) output = '[沉默]';
    else if (options.system.includes('你是小春')) output = '主人，茶已经准备好了。今天想和我们一起看看什么？如果还没想好，先坐一会儿也可以。';
    else if (options.system.includes('你是真白')) output = '……门都开了，就进来坐吧。别站在那儿发呆。今天有什么好笑的视频吗？';
    else if (options.system.includes('你是丽华')) output = '原来今天来的客人是你呀。那我可要好好听听，你准备给我们讲什么有趣的事情了。';
    else output = '晚上好。别急，坐近一点，先说说今天过得怎么样？';
    for (let offset = 0; offset < output.length; offset += 5) {
      options.signal?.throwIfAborted();
      await new Promise(resolve => setTimeout(resolve, 18));
      yield { type: 'text-delta', text: output.slice(offset, offset + 5), index: 0 };
    }
    yield { type: 'finish', reason: { kind: 'stop' } };
  },
};
const ctx = { llm, get: name => name === 'attachments' ? { saveImage: async x => ({ id: 'demo-image', mediaType: x.mediaType }) } : undefined };
const media = new MediaLibrary(store);
const engine = new SalonEngine(store, new ModelGateway(ctx, store, media));
const server = await startServer(engine, { demo: true, port: Number(process.env.SALON_PORT || 3188) });
console.log(`沙龙演示：${server.url}（样例回复，不连接真实模型）`);
for (const event of ['SIGINT', 'SIGTERM']) process.once(event, async () => { await server.close(); process.exit(0); });
