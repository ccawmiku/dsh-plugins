import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { Readable } from 'node:stream';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createAPI } from '../src/api.mjs';

export async function startServer(engine, { port = 3188, demo = false } = {}) {
  const web = fileURLToPath(new URL('../web/', import.meta.url));
  const api = createAPI(engine);
  const server = createServer(async (req, res) => {
    try {
      const origin = `http://127.0.0.1:${server.address().port}`;
      if (req.headers.origin && req.headers.origin !== origin) { res.writeHead(403); res.end('Origin refused'); return; }
      const url = new URL(req.url, origin);
      if (url.pathname === '/preview-mode') { res.setHeader('content-type', 'application/json'); res.end(JSON.stringify({ demo })); return; }
      if (url.pathname.startsWith('/api/salon/')) {
        const controller = new AbortController();
        req.on('aborted', () => controller.abort());
        const request = new Request(url, { method: req.method, headers: req.headers, signal: controller.signal, ...(['GET', 'HEAD'].includes(req.method) ? {} : { body: Readable.toWeb(req), duplex: 'half' }) });
        const response = await api(request);
        res.writeHead(response.status, Object.fromEntries(response.headers));
        if (response.body) Readable.fromWeb(response.body).pipe(res); else res.end();
        return;
      }
      const files = { '/': ['index.html', 'text/html; charset=utf-8'], '/index.html': ['index.html', 'text/html; charset=utf-8'], '/preview.js': ['preview.js', 'text/javascript; charset=utf-8'], '/preview.js.map': ['preview.js.map', 'application/json'] };
      const asset = files[url.pathname];
      if (!asset) { res.writeHead(404); res.end(); return; }
      const data = await readFile(join(web, asset[0]));
      res.writeHead(200, { 'content-type': asset[1], 'x-content-type-options': 'nosniff' }); res.end(data);
    } catch { if (!res.headersSent) res.writeHead(500); res.end('本地服务无法完成请求'); }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
  const timer = setInterval(() => engine.tick().catch(() => {}), 30000);
  timer.unref();
  return {
    url: `http://127.0.0.1:${server.address().port}`,
    close: async () => { clearInterval(timer); await engine.close(); await new Promise(resolve => server.close(resolve)); },
  };
}
