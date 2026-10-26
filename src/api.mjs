export function createAPI(configManager, immichClient) {
  return async (request) => {
    const url = new URL(request.url);
    const method = request.method;

    try {
      // 1. 获取配置
      if (url.pathname === '/api/immich/config' && method === 'GET') {
        await configManager.load();
        return Response.json(configManager.redacted());
      }

      // 2. 保存配置
      if (url.pathname === '/api/immich/config' && method === 'POST') {
        const body = await request.json().catch(() => ({}));
        const saved = await configManager.save(body);
        return Response.json({ success: true, config: configManager.redacted() });
      }

      // 3. 测试连通性
      if (url.pathname === '/api/immich/test' && method === 'POST') {
        const body = await request.json().catch(() => ({}));
        const result = await immichClient.testConnection(body.immichUrl, body.apiKey);
        return Response.json(result);
      }

      // 4. 获取相册时间线
      if (url.pathname === '/api/immich/timeline' && method === 'GET') {
        const page = parseInt(url.searchParams.get('page') || '1', 10);
        const size = parseInt(url.searchParams.get('size') || String(configManager.config.pageSize || 60), 10);
        const data = await immichClient.getTimeline({ page, size });
        return Response.json(data);
      }

      // 5. 搜索（GET 或 POST）
      if (url.pathname === '/api/immich/search') {
        let query = url.searchParams.get('q') || '';
        let type = url.searchParams.get('type') || null;
        let page = parseInt(url.searchParams.get('page') || '1', 10);
        let size = parseInt(url.searchParams.get('size') || String(configManager.config.pageSize || 60), 10);

        if (method === 'POST') {
          const body = await request.json().catch(() => ({}));
          if (body.query) query = body.query;
          if (body.type) type = body.type;
          if (body.page) page = body.page;
          if (body.size) size = body.size;
        }

        const data = await immichClient.search({ query, type, page, size });
        return Response.json(data);
      }

      // 6. 代理获取缩略图
      if (url.pathname === '/api/immich/thumbnail' && method === 'GET') {
        const id = url.searchParams.get('id');
        const size = url.searchParams.get('size') || 'thumbnail';
        if (!id) return Response.json({ error: '缺少 asset id' }, { status: 400 });

        const upstream = await immichClient.getThumbnailResponse(id, size);
        if (!upstream.ok) {
          return Response.json({ error: '缩略图获取失败' }, { status: upstream.status });
        }

        const contentType = upstream.headers.get('content-type') || 'image/jpeg';
        return new Response(upstream.body, {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=86400, immutable'
          }
        });
      }

      // 7. 代理获取原图/视频文件
      if (url.pathname === '/api/immich/original' && method === 'GET') {
        const id = url.searchParams.get('id');
        if (!id) return Response.json({ error: '缺少 asset id' }, { status: 400 });

        const upstream = await immichClient.getOriginalResponse(id);
        if (!upstream.ok) {
          return Response.json({ error: '原文件获取失败' }, { status: upstream.status });
        }

        const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
        const contentDisposition = upstream.headers.get('content-disposition');
        const headers = {
          'Content-Type': contentType,
          'Accept-Ranges': 'bytes'
        };
        if (contentDisposition) headers['Content-Disposition'] = contentDisposition;

        return new Response(upstream.body, {
          status: 200,
          headers
        });
      }

      // 8. 视频转多帧图片
      if (url.pathname === '/api/immich/convert-frames' && method === 'POST') {
        const body = await request.json().catch(() => ({}));
        const id = body.id;
        if (!id) return Response.json({ error: '缺少 asset id' }, { status: 400 });

        const maxFrames = body.maxFrames || configManager.config.maxFrames;
        const frameInterval = body.frameInterval || configManager.config.frameInterval;
        const result = await immichClient.extractVideoFrames(id, { maxFrames, frameInterval });
        return Response.json(result);
      }

      return Response.json({ error: 'API 路径不存在' }, { status: 404 });
    } catch (err) {
      console.error('[dsh-plugin-immich api error]', err);
      return Response.json({ error: err.message || '内部处理错误' }, { status: 500 });
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
