import { spawn } from 'node:child_process';
import { mkdir, readdir, readFile, rm } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { durationSeconds } from './media.mjs';
export { durationSeconds } from './media.mjs';
import { InputError, normalizeUrl, pagination, frameOptions, assetId, validateKey } from './validation.mjs';

function upstreamError(response, action) {
  const error = new Error(`${action} (HTTP ${response.status})` +
    ([401, 403].includes(response.status) ? '：API Key 无效或缺少只读权限' : ''));
  error.status = [401, 403, 404, 416, 429].includes(response.status) ? response.status : 502;
  return error;
}

// Keep credentials on the configured origin, including thumbnail redirects.
async function fetchWithKey(url, key, options = {}) {
  const origin = new URL(url).origin;
  const headers = new Headers(options.headers);
  headers.set('x-api-key', validateKey(key));
  headers.set('Accept', headers.get('Accept') || 'application/json');
  const signal = options.signal || AbortSignal.timeout(20000);
  for (let redirects = 0; redirects <= 5; redirects++) {
    let response;
    try {
      response = await fetch(url, { ...options, headers, signal, redirect: 'manual' });
    } catch (error) {
      if (signal.aborted) throw error;
      throw new Error('无法连接 Immich，请检查服务器地址、网络及 HTTPS 证书');
    }
    if (![301, 302, 303, 307, 308].includes(response.status)) return response;
    const location = response.headers.get('location');
    await response.body?.cancel();
    if (!location) throw new Error('Immich 返回了无效的重定向');
    const next = new URL(location, url);
    if (next.origin !== origin || next.username || next.password) throw new Error('已阻止向其他服务器转发 Immich API Key，请配置最终服务器地址');
    url = next.toString();
  }
  throw new Error('Immich 重定向次数过多');
}

export class ImmichClient {
  constructor(configManager) {
    this.configManager = configManager;
  }

  get config() { return this.configManager.config; }

  async fetchImmich(path, options = {}) {
    const base = normalizeUrl(this.config.immichUrl);
    const key = this.config.apiKey;
    if (!key) throw new InputError('请先在设置中配置 Immich API Key');
    return fetchWithKey(base + path, key, options);
  }

  async testConnection(overrideUrl, overrideKey) {
    const base = normalizeUrl(overrideUrl ?? this.config.immichUrl);
    const key = overrideKey ?? this.config.apiKey;
    if (typeof key !== 'string' || !key.trim()) throw new InputError('Immich API Key 不能为空');
    // Version endpoints are public: a separate authenticated read validates the key.
    const signal = AbortSignal.timeout(15000);
    const probe = await fetchWithKey(base + '/api/search/metadata', key.trim(), {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: 1, size: 1, visibility: 'timeline' }), signal
    });
    if (!probe.ok) { await probe.body?.cancel(); throw upstreamError(probe, 'API Key 验证失败'); }
    await probe.json();
    let version = 'Connected';
    for (const endpoint of ['/api/server/version', '/api/server-info/version', '/api/server/about']) {
      const response = await fetchWithKey(base + endpoint, key.trim(), { signal });
      if (response.ok) {
        const data = await response.json();
        version = data.major !== undefined ? `${data.major}.${data.minor}.${data.patch}` : (data.version || version);
        break;
      }
      await response.body?.cancel();
      if (![404, 405].includes(response.status)) break;
    }
    return { success: true, version };
  }

  normalizeAsset(item) {
    if (!item?.id || !['IMAGE', 'VIDEO'].includes(item.type)) return null;
    return {
      id: item.id,
      type: item.type === 'VIDEO' ? 'video' : 'image',
      originalFileName: item.originalFileName || item.originalPath?.split(/[\\/]/).pop() || 'media',
      fileCreatedAt: item.fileCreatedAt || item.createdAt || null,
      duration: item.duration ?? null,
      width: item.exifInfo?.exifImageWidth || item.width || null,
      height: item.exifInfo?.exifImageHeight || item.height || null,
      size: item.exifInfo?.fileSizeInByte || item.fileSizeInByte || null,
      description: item.exifInfo?.description || item.description || ''
    };
  }

  result(data, { page, size }, extra = {}) {
    const assets = data.assets || data;
    const items = Array.isArray(data) ? data : (assets.items || []);
    if (!Array.isArray(items)) throw new Error('Immich 返回了无效的媒体列表');
    return {
      items: items.map(item => this.normalizeAsset(item)).filter(Boolean),
      page, size,
      total: assets.total ?? items.length,
      hasMore: Object.hasOwn(assets, 'nextPage') ? assets.nextPage != null && assets.nextPage !== '' : items.length >= size,
      ...extra
    };
  }

  async metadata(body, signal) {
    const response = await this.fetchImmich('/api/search/metadata', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body), signal
    });
    if (!response.ok) { await response.body?.cancel(); throw upstreamError(response, '获取相册失败'); }
    return response.json();
  }

  async getTimeline(options = {}) {
    const paging = pagination(options);
    const data = await this.metadata({ ...paging, visibility: 'timeline', withDeleted: false, withExif: true, order: 'desc' }, options.signal);
    return this.result(data, paging);
  }

  async search({ query = '', type = null, page, size, mode = 'auto', signal } = {}) {
    if (typeof query !== 'string') throw new InputError('搜索词必须是字符串');
    if (type && !['image', 'video'].includes(type)) throw new InputError('媒体类型无效');
    if (!['auto', 'smart', 'filename'].includes(mode)) throw new InputError('搜索模式无效');
    query = query.trim();
    const paging = pagination({ page, size });
    if (!query) return this.getTimeline({ ...paging, signal });
    const body = { ...paging, visibility: 'timeline', withDeleted: false, withExif: true };
    if (type) body.type = type.toUpperCase();
    if (mode !== 'filename') {
      let response;
      try {
        response = await this.fetchImmich('/api/search/smart', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...body, query }), signal
        });
      } catch (error) {
        // A cancelled request must never start a fallback request.
        if (signal?.aborted || mode === 'smart') throw error;
      }
      if (response?.ok) {
        const result = this.result(await response.json(), paging, { smartSearch: true, mode: 'smart' });
        // Once paginating, never switch from smart results to filenames.
        if (result.items.length || paging.page > 1 || mode === 'smart') return result;
      } else if (response) {
        await response.body?.cancel();
        if (mode === 'smart' || [401, 403, 429].includes(response.status)) throw upstreamError(response, '智能搜索失败');
      }
    }
    const data = await this.metadata({ ...body, originalFileName: query, order: 'desc' }, signal);
    return this.result(data, paging, { smartSearch: false, mode: 'filename' });
  }

  async getAsset(id, options = {}) {
    const response = await this.fetchImmich(`/api/assets/${assetId(id)}`, options);
    if (!response.ok) { await response.body?.cancel(); throw upstreamError(response, '获取资产信息失败'); }
    return this.normalizeAsset(await response.json());
  }

  getThumbnailResponse(id, size = 'thumbnail', options = {}) {
    const selectedSize = size === 'preview' ? 'preview' : 'thumbnail';
    return this.fetchImmich(`/api/assets/${assetId(id)}/thumbnail?size=${selectedSize}`, options);
  }

  getOriginalResponse(id, options = {}) {
    return this.fetchImmich(`/api/assets/${assetId(id)}/original`, {
      ...options,
      signal: options.signal || AbortSignal.timeout(120000)
    });
  }

  async extractVideoFrames(id, options = {}) {
    const { maxFrames, frameInterval } = frameOptions(options);
    const signal = options.signal;
    const asset = await this.getAsset(id, { signal });
    if (!asset || asset.type !== 'video') throw new InputError('指定的资产不是视频或不存在');
    const tempDir = join(tmpdir(), 'immich-frames-' + randomUUID());
    await mkdir(tempDir, { recursive: true, mode: 0o700 });
    try {
      const response = await this.getOriginalResponse(id, { signal });
      if (!response.ok) { await response.body?.cancel(); throw upstreamError(response, '下载原视频失败'); }
      const videoPath = join(tempDir, 'input');
      await pipeline(Readable.fromWeb(response.body), createWriteStream(videoPath, { mode: 0o600 }), { signal });
      const duration = durationSeconds(asset.duration);
      // Spread capped samples over the full clip, rather than only its beginning.
      const interval = duration > 0 ? Math.max(frameInterval, duration / maxFrames) : frameInterval;
      await new Promise((resolve, reject) => {
        const proc = spawn('ffmpeg', [
          '-hide_banner', '-loglevel', 'error', '-nostdin', '-y', '-i', videoPath,
          '-vf', `fps=fps=1/${interval}:round=up:start_time=0,scale=720:-2`,
          '-frames:v', String(maxFrames), '-q:v', '3', join(tempDir, 'frame-%03d.jpg')
        ], { windowsHide: true, timeout: 120000, killSignal: 'SIGKILL', signal });
        let stderr = '';
        proc.stderr.on('data', chunk => { stderr = (stderr + chunk.toString()).slice(-4096); });
        let processError;
        proc.on('error', error => { processError = error; });
        proc.on('close', (code, killedBy) => {
          if (processError) reject(processError.code === 'ENOENT'
            ? new Error('未检测到 FFmpeg，请在 DSH 服务所在设备安装 FFmpeg 并加入 PATH') : processError);
          else if (code === 0) resolve();
          else reject(new Error(killedBy ? 'FFmpeg 抽帧已取消或超时' : `FFmpeg 抽帧失败 (退出码 ${code}): ${stderr}`));
        });
      });
      const files = (await readdir(tempDir)).filter(file => /^frame-\d+\.jpg$/.test(file)).sort();
      if (!files.length) throw new Error('未能从视频中提取到有效帧');
      const frames = [];
      for (const [index, file] of files.entries()) {
        const buffer = await readFile(join(tempDir, file));
        frames.push({
          name: `${asset.originalFileName.replace(/\.[^/.]+$/, '')}_frame_${index + 1}.jpg`,
          mime: 'image/jpeg', base64: buffer.toString('base64'), timeOffset: index * interval
        });
      }
      return { assetId: id, originalFileName: asset.originalFileName, count: frames.length, frames };
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  }
}
