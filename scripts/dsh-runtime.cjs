// Read-only bridge used by local integration checks. Provider credentials stay
// in DSH's own credential service; no secret is exported, copied or printed.
const { createRequire } = require('node:module');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

exports.createDshRuntime = async function createDshRuntime() {
  const anchor = process.env.SALON_DSH_APP || path.join(process.env.LOCALAPPDATA, 'Programs', 'DSH NEXT', 'resources', 'app.asar');
  const installed = createRequire(anchor + '/package.json');
  const { Context } = installed('@deepseek-ai/cordis');
  const { parse } = installed('yaml');
  const home = process.env.DSH_HOME || path.join(os.homedir(), '.dsh');
  const providers = {};
  function visit(value) {
    if (!value || typeof value !== 'object') return;
    if (value.config?.providers && typeof value.config.providers === 'object') Object.assign(providers, value.config.providers);
    for (const child of Object.values(value)) visit(child);
  }
  for (const file of ['cordis.yml', 'cordis.patch.yml']) {
    try { visit(parse(fs.readFileSync(path.join(home, 'profiles', 'desktop', file), 'utf8'))); }
    catch (error) { if (error.code !== 'ENOENT') throw new Error('DSH 配置无法读取；为避免泄露配置正文，不输出解析器原始错误。'); }
  }
  const ctx = new Context();
  const fibers = [];
  const mount = async (plugin, config) => { const fiber = ctx.plugin(plugin, config); fibers.push(fiber); await fiber.await(); };
  try {
    await mount(installed('@deepseek-ai/dsh-llm').default);
    await mount(installed('@deepseek-ai/dsh-credentials-local').default, { dshHome: home, watch: false });
    await mount(installed('@deepseek-ai/dsh-llm-pi-ai'), { providers });
    const proxy = {
      llm: ctx.get('llm'),
      get: name => name === 'settings' ? { describe: () => [{ ns: 'llm-pi-ai', value: { providers } }] } : ctx.get(name),
    };
    return { ctx: proxy, home, mountAttachments: async dataHome => mount(installed('@deepseek-ai/dsh-attachment-local').default, { dshHome: dataHome }), close: async () => { for (const fiber of fibers.reverse()) await fiber.dispose(); } };
  } catch (error) { for (const fiber of fibers.reverse()) await fiber.dispose(); throw error; }
};
