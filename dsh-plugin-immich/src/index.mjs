import { ConfigManager } from './config.mjs';
import { ImmichClient } from './immich.mjs';
import { createAPI, routes } from './api.mjs';

export const name = 'immich';
export const inject = ['connection'];

export async function apply(ctx, options = {}) {
  const configManager = new ConfigManager(options.dataDirectory);
  await configManager.load();

  const immichClient = new ImmichClient(configManager);
  const handler = createAPI(configManager, immichClient);

  const disposers = [];
  try {
    for (const [path, methods] of routes) {
      disposers.push(
        ctx.connection.fetch.register({
          path: '/api/immich/' + path,
          methods,
          requestBody: 'buffered',
          fetch: handler
        })
      );
    }

    ctx.on('dispose', () => {
      for (const dispose of disposers) {
        try { dispose(); } catch {}
      }
    });

    console.log('[dsh-plugin-immich] 后端服务已成功注册 /api/immich/* 接口');
  } catch (err) {
    for (const dispose of disposers) {
      try { dispose(); } catch {}
    }
    throw err;
  }
}
