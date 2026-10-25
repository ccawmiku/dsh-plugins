// Optional integration check. Uses an isolated synthetic conversation with the
// existing DSH credentials, never writes test chat into the user's real salon.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const resultFile = path.resolve('test-results/live-conversation.json');
fs.mkdirSync(path.dirname(resultFile), { recursive: true });
fs.writeFileSync(resultFile, JSON.stringify({ stage: 'starting' }));
(async () => {
  const runtime = await require('../scripts/dsh-runtime.cjs').createDshRuntime();
  const { Store } = await import(pathToFileURL(path.resolve('src/store.mjs')));
  const { MediaLibrary } = await import(pathToFileURL(path.resolve('src/media.mjs')));
  const { ModelGateway } = await import(pathToFileURL(path.resolve('src/providers.mjs')));
  const { SalonEngine } = await import(pathToFileURL(path.resolve('src/engine.mjs')));
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'salon-conversation-'));
  const store = await new Store(directory).open();
  const gateway = new ModelGateway(runtime.ctx, store, new MediaLibrary(store));
  const engine = new SalonEngine(store, gateway);
  let timer;
  try {
    const catalog = await gateway.catalog();
    const routes = catalog.flatMap(p => p.models.filter(m => /gemini.*flash/i.test(m.id)).map(m => ({ provider: p.id, model: m.id })));
    if (!routes.length) throw new Error('没有可用的 Gemini 测试模型');
    const route = routes[0];
    Object.assign(store.state.settings, { defaultProvider: route.provider, defaultModel: route.model, maxOutputTokens: 1024, autoChat: false });
    for (const c of store.state.characters) c.enabled = ['koharu', 'mashiro'].includes(c.id);
    await engine.send({ text: '@全体 今天茶会只剩两块草莓蛋糕，你们俩聊聊怎么安排，可以互相@。我先去忙，你们想说就继续，觉得聊完了就自然停。只发聊天文字。' });
    timer = setTimeout(() => engine.stop('group'), 180000); // Test deadline, not an application turn limit.
    await engine.jobs.get('group')?.promise;
    const room = store.room('group'), messages = room.messages.filter(m => m.speaker !== 'user' && !m.error);
    const passed = room.lastDiscussion?.reason === 'natural' && messages.length >= 3 && messages.every(m => !/[（）()]/.test(m.text));
    const result = { passed, route, ended: room.lastDiscussion?.reason || 'test-timeout', utterances: messages.length, speakers: [...new Set(messages.map(m => m.speaker))], bracketsAbsent: messages.every(m => !/[（）()]/.test(m.text)), errors: engine.activity.filter(a => a.type === 'error').map(a => a.text) };
    fs.writeFileSync(resultFile, JSON.stringify(result, null, 2)); console.log(JSON.stringify(result));
  } finally {
    clearTimeout(timer); await engine.close(); await runtime.close();
    try { fs.rmSync(directory, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 }); } catch {}
  }
})().catch(error => { fs.writeFileSync(resultFile, JSON.stringify({ passed: false, error: error.message }, null, 2)); process.exitCode = 1; });
