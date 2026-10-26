import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';

export const defaultConfig = {
  immichUrl: 'http://192.168.1.21:2283',
  apiKey: '',
  allowInsecure: false,
  pageSize: 60,
  videoMode: 'direct', // 'direct'（直传模型） | 'frames'（转多帧图片）
  maxFrames: 12,
  frameInterval: 2
};

export class ConfigManager {
  constructor(storageDir) {
    this.dir = storageDir || join(process.env.DSH_HOME || join(homedir(), '.dsh'), 'storages', 'dsh-immich');
    this.file = join(this.dir, 'config.json');
    this.config = { ...defaultConfig };
  }

  async load() {
    try {
      await mkdir(this.dir, { recursive: true });
      const raw = await readFile(this.file, 'utf8');
      const loaded = JSON.parse(raw);
      this.config = { ...defaultConfig, ...loaded };
    } catch {
      this.config = { ...defaultConfig };
    }
    return this.config;
  }

  async save(patch) {
    await this.load();
    const updated = { ...this.config };

    if (typeof patch.immichUrl === 'string') {
      let url = patch.immichUrl.trim();
      if (url.endsWith('/')) url = url.slice(0, -1);
      if (url && !/^https?:\/\//i.test(url)) url = 'http://' + url;
      updated.immichUrl = url;
    }
    if (typeof patch.apiKey === 'string') {
      updated.apiKey = patch.apiKey.trim();
    }
    if (typeof patch.allowInsecure === 'boolean') {
      updated.allowInsecure = patch.allowInsecure;
    }
    if (typeof patch.pageSize === 'number' && patch.pageSize > 0) {
      updated.pageSize = Math.min(Math.max(10, Math.floor(patch.pageSize)), 200);
    }
    if (patch.videoMode === 'direct' || patch.videoMode === 'frames') {
      updated.videoMode = patch.videoMode;
    }
    if (typeof patch.maxFrames === 'number' && patch.maxFrames > 0) {
      updated.maxFrames = Math.min(Math.max(1, Math.floor(patch.maxFrames)), 60);
    }
    if (typeof patch.frameInterval === 'number' && patch.frameInterval > 0) {
      updated.frameInterval = Math.min(Math.max(0.5, patch.frameInterval), 60);
    }

    this.config = updated;
    await mkdir(this.dir, { recursive: true });
    await writeFile(this.file, JSON.stringify(this.config, null, 2), 'utf8');
    return this.config;
  }

  redacted() {
    const rawKey = this.config.apiKey || '';
    const masked = rawKey.length > 8
      ? rawKey.slice(0, 4) + '••••••••' + rawKey.slice(-4)
      : (rawKey ? '••••••••' : '');
    return {
      ...this.config,
      apiKey: masked,
      hasApiKey: Boolean(rawKey)
    };
  }
}
