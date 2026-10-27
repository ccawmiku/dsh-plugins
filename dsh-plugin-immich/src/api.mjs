import { InputError, objectBody, assetId, frameOptions } from './validation.mjs';

async function readBody(request) {
  try { return objectBody(await request.json()); }
  catch (error) { throw error instanceof InputError ? error : new InputError('请求内容不是有效 JSON'); }
}

function mediaResponse(upstream, original) {
  const headers = new Headers({
    'Cache-Control': original ? 'private, no-store' : 'private, max-age=300',
    'X-Content-Type-Options': 'nosniff'
  });
  for (const name of ['content-type', 'content-disposition', 'content-range', 'accept-ranges', 'etag', 'last-modified']) {
    if (upstream.headers.has(name)) headers.set(name, upstream.headers.get(name));
  }
  // Fetch transparently decompresses; the compressed Content-Length is then invalid.
  if (!upstream.headers.has('content-encoding') && upstream.headers.has('content-length')) {
    headers.set('content-length', upstream.headers.get('content-length'));
  }
  if (!headers.has('content-type')) headers.set('content-type', original ? 'application/octet-stream' : 'image/jpeg');
  return new Response(upstream.body, { status: upstream.status, headers });
}

export function createAPI(configManager, immichClient) {
  return async request => {
    const url = new URL(request.url);
    const path = url.pathname.replace('/api/immich/', '');
    const route = routes.find(([name]) => name === path);
    if (!route) return Response.json({ error: 'API 路径不存在' }, { status: 404 });
    if (!route[1].includes(request.method)) {
      return Response.json({ error: '请求方法不支持' }, { status: 405, headers: { Allow: route[1].join(', ') } });
    }
    const signal = AbortSignal.any([request.signal, AbortSignal.timeout(path === 'convert-frames' ? 300000 : path === 'original' ? 120000 : 30000)]);
    try {
      if (path === 'config') {
        if (request.method === 'POST') {
          await configManager.save(await readBody(request));
          return Response.json({ success: true, config: configManager.redacted() }, { headers: { 'Cache-Control': 'no-store' } });
        }
        await configManager.load();
        return Response.json(configManager.redacted(), { headers: { 'Cache-Control': 'no-store' } });
      }
      if (path === 'test') {
        const body = await readBody(request);
        return Response.json(await immichClient.testConnection(body.immichUrl, body.apiKey));
      }
      if (path === 'timeline' || path === 'search') {
        const params = Object.fromEntries(url.searchParams);
        const options = {
          query: params.q ?? '', type: params.type ?? null, mode: params.mode ?? 'auto',
          page: params.page, size: params.size ?? configManager.config.pageSize, signal
        };
        if (request.method === 'POST') Object.assign(options, await readBody(request), { signal });
        const data = path === 'timeline' ? await immichClient.getTimeline(options) : await immichClient.search(options);
        return Response.json(data, { headers: { 'Cache-Control': 'no-store' } });
      }
      if (path === 'thumbnail' || path === 'original') {
        const id = assetId(url.searchParams.get('id'));
        const original = path === 'original';
        const headers = {};
        for (const name of ['range', 'if-range']) {
          if (original && request.headers.has(name)) headers[name] = request.headers.get(name);
        }
        const upstream = original
          ? await immichClient.getOriginalResponse(id, { headers, signal })
          : await immichClient.getThumbnailResponse(id, url.searchParams.get('size'), { signal });
        if (upstream.ok || upstream.status === 416) return mediaResponse(upstream, original);
        await upstream.body?.cancel();
        return Response.json({ error: `媒体获取失败 (HTTP ${upstream.status})` }, { status: upstream.status });
      }
      if (path === 'convert-frames') {
        const body = await readBody(request);
        const options = frameOptions({
          maxFrames: body.maxFrames ?? Math.min(configManager.config.maxFrames, 30),
          frameInterval: body.frameInterval ?? configManager.config.frameInterval
        });
        return Response.json(await immichClient.extractVideoFrames(assetId(body.id), { ...options, signal }), {
          headers: { 'Cache-Control': 'no-store' }
        });
      }
    } catch (error) {
      if (signal.aborted || error.name === 'TimeoutError' || error.name === 'AbortError') {
        return Response.json({ error: '请求已取消或超时，请稍后重试' }, { status: 504 });
      }
      // Never log raw upstream errors: they can include URLs and request headers.
      return Response.json({ error: error.message || '内部处理错误' }, { status: error.status || 500 });
    }
  };
}

export const routes = [
  ['config', ['GET', 'POST']],
  ['test', ['POST']],
  ['timeline', ['GET']],
  ['search', ['GET', 'POST']],
  ['thumbnail', ['GET']],
  ['original', ['GET']],
  ['convert-frames', ['POST']]
];
