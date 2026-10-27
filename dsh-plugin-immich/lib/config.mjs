import { mkdir, readFile, writeFile, rename, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { InputError, objectBody, normalizeUrl, numberOption, frameOptions, validateKey } from './validation.mjs';

export const defaultConfig = {
  immichUrl: 'http://192.168.1.21:2283',
  apiKey: '',
  pageSize: 60,
  videoMode: 'direct',
  maxFrames: 12,
  frameInterval: 2
};

export class ConfigManager {
  constructor(storageDir) {
    this.dir = storageDir || join(process.env.DSH_HOME || join(homedir(), '.dsh'), 'storages', 'dsh-immich');
    this.file = join(this.dir, 'config.json');
    this.config = { ...defaultConfig };
    this.pendingSave = Promise.resolve();
  }

  async load() {
    try {
      const loaded = objectBody(JSON.parse(await readFile(this.file, 'utf8')));
      this.config = { ...defaultConfig, ...loaded };
    } catch (error) {
      if (error.code !== 'ENOENT') throw new Error('无法读取 Immich 配置，请检查配置文件及访问权限');
      this.config = { ...defaultConfig };
    }
    return this.config;
  }

  save(patch) {
    const operation = this.pendingSave.then(() => this.savePatch(patch));
    this.pendingSave = operation.catch(() => {});
    return operation;
  }

  async savePatch(patch) {
    objectBody(patch);
    await this.load();
    const updated = { ...this.config };
    if ('immichUrl' in patch) updated.immichUrl = normalizeUrl(patch.immichUrl);
    if ('apiKey' in patch) {
      if (typeof patch.apiKey !== 'string') throw new InputError('API Key 必须是字符串');
      // Older clients submit the displayed mask. Never persist a mask as a credential.
      if (patch.apiKey.includes('•')) {
        const key = this.config.apiKey;
        const legacyMask = key.length > 8 ? key.slice(0, 4) + '••••••••' + key.slice(-4) : '••••••••';
        if (!key || ![legacyMask, '••••••••'].includes(patch.apiKey)) throw new InputError('请重新输入 API Key');
      } else {
        updated.apiKey = validateKey(patch.apiKey, true);
      }
    }
    if ('pageSize' in patch) updated.pageSize = numberOption(patch.pageSize, 60, 1, 200, '每页数量', true);
    if ('videoMode' in patch) {
      if (!['direct', 'frames'].includes(patch.videoMode)) throw new InputError('视频模式无效');
      updated.videoMode = patch.videoMode;
    }
    Object.assign(updated, frameOptions({
      maxFrames: patch.maxFrames ?? Math.min(updated.maxFrames, 30),
      frameInterval: patch.frameInterval ?? updated.frameInterval
    }));
    delete updated.allowInsecure;
    delete updated.hasApiKey;
    await mkdir(this.dir, { recursive: true, mode: 0o700 });
    const temporary = join(this.dir, `config-${randomUUID()}.tmp`);
    try {
      await writeFile(temporary, JSON.stringify(updated, null, 2), { encoding: 'utf8', mode: 0o600 });
      await rename(temporary, this.file);
      this.config = updated;
    } finally {
      await rm(temporary, { force: true });
    }
    return this.config;
  }

  redacted() {
    const { apiKey, ...config } = this.config;
    return { ...config, apiKey: apiKey ? '••••••••' : '', hasApiKey: Boolean(apiKey) };
  }
}
