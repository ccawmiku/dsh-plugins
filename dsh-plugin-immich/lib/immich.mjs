import { spawn } from 'node:child_process';
import { mkdir, readdir, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';

export class ImmichClient {
  constructor(configManager) {
    this.configManager = configManager;
  }

  get config() {
    return this.configManager.config;
  }

  getHeaders(extra = {}) {
    const key = this.config.apiKey;
    if (!key) throw new Error('请先在设置中配置 Immich API Key');
    return {
      'x-api-key': key,
      'Accept': 'application/json',
      ...extra
    };
  }

  async fetchImmich(path, options = {}) {
    const base = this.config.immichUrl;
    if (!base) throw new Error('请先在设置中配置 Immich 服务器地址');
    const url = new URL(path, base).toString();
    const headers = this.getHeaders(options.headers || {});
    const reqOptions = {
      ...options,
      headers
    };

    const res = await fetch(url, reqOptions);
    return res;
  }

  async testConnection(overrideUrl, overrideKey) {
    const urlBase = (overrideUrl !== undefined ? overrideUrl : this.config.immichUrl || '').trim().replace(/\/$/, '');
    const key = (overrideKey !== undefined ? overrideKey : this.config.apiKey || '').trim();
    if (!urlBase) throw new Error('Immich 服务器地址不能为空');
    if (!key) throw new Error('Immich API Key 不能为空');

    const headers = { 'x-api-key': key, 'Accept': 'application/json' };
    const endpoints = ['/api/server/version', '/api/server-info/version', '/api/server/about'];
    let lastError = null;

    for (const ep of endpoints) {
      try {
        const res = await fetch(`${urlBase}${ep}`, { headers, signal: AbortSignal.timeout(6000) });
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          return {
            success: true,
            version: data.major ? `${data.major}.${data.minor}.${data.patch}` : (data.version || 'Connected'),
            endpoint: ep
          };
        } else if (res.status === 401 || res.status === 403) {
          throw new Error('API Key 无效或权限不足（HTTP ' + res.status + '）');
        } else {
          lastError = new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
      } catch (err) {
        lastError = err;
        if (err.message && err.message.includes('API Key')) throw err;
      }
    }
    throw lastError || new Error('无法连接到 Immich 服务器，请检查地址是否正确及内网连通性');
  }

  normalizeAsset(item) {
    if (!item) return null;
    return {
      id: item.id,
      type: item.type === 'VIDEO' ? 'video' : 'image',
      originalFileName: item.originalFileName || item.originalPath?.split('/')?.pop() || 'media',
      fileCreatedAt: item.fileCreatedAt || item.createdAt || new Date().toISOString(),
      duration: item.duration || null,
      width: item.exifInfo?.exifImageWidth || item.width || null,
      height: item.exifInfo?.exifImageHeight || item.height || null,
      size: item.exifInfo?.fileSizeInByte || item.fileSizeInByte || null,
      description: item.exifInfo?.description || item.description || ''
    };
  }

  async getTimeline({ page = 1, size = 60 } = {}) {
    const body = {
      page: Number(page) || 1,
      size: Number(size) || 60,
      isVisible: true,
      order: 'desc'
    };

    let res = await this.fetchImmich('/api/search/metadata', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (res.ok) {
      const data = await res.json();
      const rawItems = Array.isArray(data) ? data : (data.assets?.items || data.items || []);
      const total = data.assets?.total || data.total || rawItems.length;
      return {
        items: rawItems.map(item => this.normalizeAsset(item)).filter(Boolean),
        page,
        size,
        total,
        hasMore: rawItems.length >= size
      };
    }

    // 回退到 GET /api/assets
    res = await this.fetchImmich(`/api/assets?take=${size}&skip=${(page - 1) * size}`);
    if (res.ok) {
      const rawItems = await res.json();
      return {
        items: (Array.isArray(rawItems) ? rawItems : []).map(item => this.normalizeAsset(item)).filter(Boolean),
        page,
        size,
        hasMore: rawItems.length >= size
      };
    }

    throw new Error(`获取相册时间线失败 (HTTP ${res.status})`);
  }

  async search({ query = '', type = null, page = 1, size = 60 } = {}) {
    query = (query || '').trim();
    if (!query) return this.getTimeline({ page, size });

    // 优先尝试 Immich 机器学习 Smart Search (CLIP)
    try {
      const smartRes = await this.fetchImmich('/api/search/smart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, clip: true })
      });
      if (smartRes.ok) {
        const smartData = await smartRes.json();
        let items = Array.isArray(smartData) ? smartData : (smartData.assets?.items || smartData.items || []);
        if (items.length > 0) {
          let normalized = items.map(item => this.normalizeAsset(item)).filter(Boolean);
          if (type) {
            normalized = normalized.filter(item => item.type === type);
          }
          return {
            items: normalized,
            page: 1,
            size: normalized.length,
            total: normalized.length,
            hasMore: false,
            smartSearch: true
          };
        }
      }
    } catch {
      // Smart search 不可用时继续尝试普通元数据搜索
    }

    // 普通元数据搜索（支持文件名或描述）
    const metaBody = {
      originalFileName: query,
      page: Number(page) || 1,
      size: Number(size) || 60
    };
    if (type) metaBody.type = type.toUpperCase();

    const metaRes = await this.fetchImmich('/api/search/metadata', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metaBody)
    });

    if (metaRes.ok) {
      const data = await metaRes.json();
      const rawItems = Array.isArray(data) ? data : (data.assets?.items || data.items || []);
      return {
        items: rawItems.map(item => this.normalizeAsset(item)).filter(Boolean),
        page,
        size,
        total: data.assets?.total || data.total || rawItems.length,
        hasMore: rawItems.length >= size,
        smartSearch: false
      };
    }

    throw new Error(`搜索 Immich 资产失败 (HTTP ${metaRes.status})`);
  }

  async getAsset(id) {
    const res = await this.fetchImmich(`/api/assets/${id}`);
    if (!res.ok) throw new Error(`获取资产信息失败 (HTTP ${res.status})`);
    return this.normalizeAsset(await res.json());
  }

  async getThumbnailResponse(id, size = 'thumbnail') {
    const sz = size === 'preview' ? 'preview' : 'thumbnail';
    const res = await this.fetchImmich(`/api/assets/${id}/thumbnail?size=${sz}`);
    return res;
  }

  async getOriginalResponse(id) {
    const res = await this.fetchImmich(`/api/assets/${id}/original`);
    return res;
  }

  /**
   * 抽取视频多帧图片并转换为图片 Base64 列表
   */
  async extractVideoFrames(id, { maxFrames = 12, frameInterval = 2 } = {}) {
    const asset = await this.getAsset(id);
    if (!asset || asset.type !== 'video') {
      throw new Error('指定的资产不是视频或不存在');
    }

    const tempDir = join(tmpdir(), 'immich-frames-' + randomUUID());
    await mkdir(tempDir, { recursive: true });

    try {
      // 下载视频到临时文件
      const videoRes = await this.getOriginalResponse(id);
      if (!videoRes.ok) throw new Error('下载原视频失败');
      const videoBytes = await videoRes.arrayBuffer();
      const videoPath = join(tempDir, 'input.mp4');
      const { writeFile } = await import('node:fs/promises');
      await writeFile(videoPath, Buffer.from(videoBytes));

      const interval = Math.max(0.5, frameInterval);
      const count = Math.min(Math.max(1, maxFrames), 30);

      // 调用 ffmpeg 抽帧
      await new Promise((resolve, reject) => {
        const proc = spawn('ffmpeg', [
          '-hide_banner',
          '-loglevel', 'error',
          '-y',
          '-i', videoPath,
          '-vf', `fps=1/${interval},scale=720:-2`,
          '-frames:v', String(count),
          '-q:v', '3',
          join(tempDir, 'frame-%03d.jpg')
        ], { windowsHide: true });

        let stderr = '';
        proc.stderr.on('data', d => { stderr += d.toString(); });
        proc.on('error', err => reject(new Error('未检测到 FFmpeg 或命令执行失败，请确保系统已安装 FFmpeg')));
        proc.on('close', code => {
          if (code === 0) resolve();
          else reject(new Error(`FFmpeg 抽帧失败 (退出码 ${code}): ${stderr}`));
        });
      });

      const files = (await readdir(tempDir)).filter(f => f.startsWith('frame-') && f.endsWith('.jpg')).sort();
      if (files.length === 0) throw new Error('未能从视频中提取到有效帧');

      const frames = [];
      for (let i = 0; i < files.length; i++) {
        const filePath = join(tempDir, files[i]);
        const buf = await readFile(filePath);
        frames.push({
          name: `${asset.originalFileName.replace(/\.[^/.]+$/, '')}_frame_${i + 1}.jpg`,
          mime: 'image/jpeg',
          base64: buf.toString('base64'),
          timeOffset: i * interval
        });
      }

      return {
        assetId: id,
        originalFileName: asset.originalFileName,
        count: frames.length,
        frames
      };
    } finally {
      await rm(tempDir, { recursive: true, force: true }).catch(() => {});
    }
  }
}
