// Run under the user's installed Electron with ELECTRON_RUN_AS_NODE=1.
// This mounts the plugin against DSH's actual connection registry, without
// starting or restarting the user's desktop host or making provider calls.
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { createRequire } = require('node:module');
const assert = require('node:assert/strict');
const os = require('node:os');
const anchor = process.env.SALON_DSH_APP || (process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'Programs', 'DSH NEXT', 'resources', 'app.asar') : '');
const installed = createRequire(anchor + '/package.json');
const trace = path.resolve('test-results/host-contract.json');
fs.mkdirSync(path.dirname(trace), { recursive: true });
fs.writeFileSync(trace, JSON.stringify({ stage: 'starting' }));
(async () => {
  const { Context } = installed('@deepseek-ai/cordis');
  const { HostConnectionService } = installed('@deepseek-ai/dsh-client-connection');
  fs.writeFileSync(trace, JSON.stringify({ stage: 'modules loaded', contextSet: typeof Context.prototype.set }));
  const ctx = new Context();
  const fiber = ctx.plugin(pluginCtx => { new HostConnectionService(pluginCtx, [], {}); });
  await fiber.await();
  const connection = ctx.get('connection');
  assert.equal(typeof connection.fetch.register, 'function');
  const { apply } = await import(pathToFileURL(path.resolve('src/index.mjs')));
  const disposers = [], directory = fs.mkdtempSync(path.join(os.tmpdir(), 'salon-host-'));
  const sandbox = {
    connection, llm: { listProviders: () => [], listModels: async () => [] },
    get: name => name === 'attachments' ? {} : undefined,
    on: (event, fn) => { if (event === 'dispose') disposers.push(fn); },
  };
  try {
    await apply(sandbox, { dataDirectory: directory });
    const shared = connection.createSharedFetchHandler('/api');
    const response = await shared.fetch(new Request('http://host/api/salon/state?room=group'), connection.browserPeer);
    assert.equal(response.status, 200);
    const state = await response.json();
    assert.equal(state.characters.length, 4); assert.equal(state.settings.contextTokens, 500000);
    const post = await shared.fetch(new Request('http://host/api/salon/action', { method: 'POST', headers: { 'x-salon-client': '1', 'content-type': 'application/json' }, body: '{"action":"settings","patch":{"userName":"宿主验收"}}' }), connection.browserPeer);
    assert.equal(post.status, 200);
    for (const dispose of disposers) await dispose();
    const gone = await shared.fetch(new Request('http://host/api/salon/state'), connection.browserPeer);
    assert.equal(gone.status, 404);
    const result = { passed: true, desktopVersion: JSON.parse(fs.readFileSync(anchor + '/package.json', 'utf8')).version, checks: ['real DSH Fetch registry', 'state GET', 'settings POST', 'plugin disposal'], providerCalls: 0 };
    fs.writeFileSync(trace, JSON.stringify(result, null, 2)); console.log(JSON.stringify(result));
  } finally { await fiber.dispose(); fs.rmSync(directory, { recursive: true, force: true }); }
})().catch(error => { fs.writeFileSync(trace, JSON.stringify({ passed: false, error: error.message, stack: error.stack }, null, 2)); console.error(error); process.exitCode = 1; });
