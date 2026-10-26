import { mkdir, readFile, writeFile, rename, copyFile, chmod } from 'node:fs/promises';
import { join } from 'node:path';
import { initialState } from './characters.mjs';

export class Store {
  constructor(directory) { this.directory = directory; this.file = join(directory, 'state.json'); this.queue = Promise.resolve(); }
  async open() {
    await mkdir(this.directory, { recursive: true });
    try {
      this.state = JSON.parse(await readFile(this.file, 'utf8'));
      if (this.state.version !== 1 || !Array.isArray(this.state.characters) || !Array.isArray(this.state.rooms) || !Array.isArray(this.state.media)) throw new Error('不支持或损坏的沙龙数据格式');
      this.state.settings = { ...initialState().settings, ...this.state.settings };
      // Old fixed turn counts no longer control a natural group conversation.
      delete this.state.settings.followUpTurns;
    } catch (error) {
      if (error.code !== 'ENOENT') throw new Error('沙龙数据无法读取，已保留原文件，请先检查或恢复备份。', { cause: error });
      this.state = initialState();
      await this.save();
    }
    return this;
  }
  touch() { this.state.revision += 1; }
  save() {
    this.touch();
    const snapshot = JSON.stringify(this.state, null, 2);
    const task = this.queue.then(async () => {
      const temp = `${this.file}.tmp`;
      await writeFile(temp, snapshot, { mode: 0o600 });
      try { await copyFile(this.file, `${this.file}.bak`); } catch (e) { if (e.code !== 'ENOENT') throw e; }
      await rename(temp, this.file);
      await chmod(this.file, 0o600).catch(() => {});
    });
    // A failed write is visible to its caller but must not poison subsequent saves.
    this.queue = task.catch(() => {});
    return task;
  }
  room(id) {
    const room = this.state.rooms.find(r => r.id === id);
    if (!room) throw new Error('会话不存在');
    return room;
  }
  character(id) {
    const c = this.state.characters.find(c => c.id === id);
    if (!c) throw new Error('角色不存在');
    return c;
  }
  async close() { await this.queue; }
}
