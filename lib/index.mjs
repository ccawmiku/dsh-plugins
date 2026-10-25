import { join } from 'node:path';
import { homedir } from 'node:os';
import { Store } from './store.mjs';
import { MediaLibrary } from './media.mjs';
import { ModelGateway } from './providers.mjs';
import { SalonEngine } from './engine.mjs';
import { createAPI, routes } from './api.mjs';

export const name = 'salon';
export const inject = ['llm', 'connection', 'attachments'];

export async function apply(ctx, config = {}) {
  const directory = config.dataDirectory || join(process.env.DSH_HOME || join(homedir(), '.dsh'), 'storages', 'dsh-salon');
  const store = await new Store(directory).open();
  const media = new MediaLibrary(store, config);
  const gateway = new ModelGateway(ctx, store, media);
  const engine = new SalonEngine(store, gateway);
  const handler = createAPI(engine);
  const disposers = [];
  try {
    for (const [path, methods] of routes) disposers.push(ctx.connection.fetch.register({ path: '/api/salon/' + path, methods, requestBody: path === 'upload' ? 'streaming' : 'buffered', fetch: handler }));
    const timer = setInterval(() => engine.tick().catch(error => {
      engine.activity.push({ at: Date.now(), type: 'error', text: '主动聊天未开始：' + error.message });
    }), 30000);
    timer.unref?.();
    ctx.on('dispose', async () => { clearInterval(timer); for (const dispose of disposers) dispose(); await engine.close(); });
  } catch (e) { for (const dispose of disposers) dispose(); await engine.close(); throw e; }
}
