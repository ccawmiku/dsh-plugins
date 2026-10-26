// Optional live check: invokes the user's configured Gemini route with tiny
// synthetic media; never uses a private user video or writes into DSH settings.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const assert = require('node:assert/strict');
const resultFile = path.resolve('test-results/live-provider.json');
fs.mkdirSync(path.dirname(resultFile), { recursive: true });
fs.writeFileSync(resultFile, JSON.stringify({ stage: 'starting' }));
(async () => {
  const { createDshRuntime } = require('../scripts/dsh-runtime.cjs');
  const runtime = await createDshRuntime();
  const { Store } = await import(pathToFileURL(path.resolve('src/store.mjs')));
  const { ModelGateway } = await import(pathToFileURL(path.resolve('src/providers.mjs')));
  const { MediaLibrary, runProcess } = await import(pathToFileURL(path.resolve('src/media.mjs')));
  const { SalonEngine } = await import(pathToFileURL(path.resolve('src/engine.mjs')));
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'salon-live-'));
  const store = await new Store(directory).open(), media = new MediaLibrary(store);
  const gateway = new ModelGateway(runtime.ctx, store, media), engine = new SalonEngine(store, gateway);
  const report = { checks: [], providerCalls: 0 };
  try {
    const catalog = await gateway.catalog();
    const candidates = catalog.flatMap(p => p.models.filter(m => /gemini/i.test(m.id)).map(m => ({ provider: p.id, model: m.id })));
    fs.writeFileSync(resultFile, JSON.stringify({ stage: 'catalog loaded', providers: catalog.map(p => ({ id: p.id, modelCount: p.models.length })), geminiModels: candidates }, null, 2));
    const route = candidates.find(c => /flash/i.test(c.model)) || candidates[0];
    if (!route) throw new Error('没有从 DSH 活跃配置中找到 Gemini 模型');
    store.state.settings.defaultProvider = route.provider; store.state.settings.defaultModel = route.model;
    store.state.settings.maxOutputTokens = 1024; store.state.settings.followUpTurns = 0; store.state.settings.autoChat = false;
    const c = store.character('koharu');
    const response = await gateway.generate(c, { system: '你是小春，一位温柔的女仆。', prompt: '用中文一句话向刚来到沙龙的用户打招呼，不超过40字。', signal: AbortSignal.timeout(120000) });
    assert.ok(response.text.length > 0); report.providerCalls++; report.checks.push({ kind: 'DSH text channel', passed: true, outputLength: response.text.length });
    const file = path.join(directory, 'synthetic.mp4');
    await runProcess('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'lavfi', '-i', 'color=c=red:s=160x120:r=5', '-f', 'lavfi', '-i', 'sine=frequency=440:sample_rate=16000', '-t', '1', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', file]);
    const video = await media.importStream(fs.createReadStream(file), 'synthetic-red.mp4');
    store.state.settings.videoMode = 'native';
    try {
      const native = await gateway.generate(c, { system: '你正在看一个测试视频。', prompt: '只回答视频主要画面是什么颜色，不超过10字。', video, signal: AbortSignal.timeout(120000) });
      report.providerCalls++; report.checks.push({ kind: 'native video bytes', passed: true, outputLength: native.text.length, transport: native.transport.mode });
    } catch (error) { report.checks.push({ kind: 'native video bytes', passed: false, reason: error.message }); }
    await runtime.mountAttachments(path.join(directory, 'attachment-home'));
    store.state.settings.videoMode = 'frames';
    const frames = await gateway.generate(c, { system: '你正在看一个测试视频。', prompt: '只回答视频主要画面是什么颜色，不超过10字。', video, signal: AbortSignal.timeout(120000) });
    report.providerCalls += 2;
    report.checks.push({ kind: 'DSH extracted images and audio transcription', passed: true, outputLength: frames.text.length, transport: frames.transport.mode, audio: frames.transport.audio });
    report.route = route; report.passed = report.checks.every(c => c.passed);
    fs.writeFileSync(resultFile, JSON.stringify(report, null, 2)); console.log(JSON.stringify(report));
  } finally {
    await engine.close(); await runtime.close();
    try { fs.rmSync(directory, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); }
    catch { /* Keep the test result if Windows still holds an attachment worker handle. */ }
  }
})().catch(error => { fs.writeFileSync(resultFile, JSON.stringify({ passed: false, error: error.message }, null, 2)); console.error('真实提供方验收未通过，参见 test-results/live-provider.json（不含凭据）。'); process.exitCode = 1; });
