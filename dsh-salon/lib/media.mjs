import { mkdir, readFile, writeFile, readdir, stat, rename } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
import { spawn } from 'node:child_process';

export function runProcess(command, args, { timeout = 180000, signal } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { windowsHide: true, shell: false, signal, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '', stderr = '', settled = false;
    const timer = setTimeout(() => { child.kill(); finish(new Error('视频处理超时')); }, timeout);
    function finish(error, value) { if (settled) return; settled = true; clearTimeout(timer); error ? reject(error) : resolve(value); }
    child.stdout.on('data', b => { stdout = (stdout + b.toString()).slice(-1000000); });
    child.stderr.on('data', b => { stderr = (stderr + b.toString()).slice(-5000); });
    child.on('error', e => finish(new Error(e.code === 'ENOENT' ? `找不到 ${command}，请安装 FFmpeg 或设置可执行文件路径。` : e.message)));
    child.on('close', code => finish(code === 0 ? null : new Error(`视频处理失败（${command}，退出码 ${code}）：${stderr.slice(-900)}`), stdout));
  });
}

const formats = { '.mp4': 'video/mp4', '.mov': 'video/quicktime', '.webm': 'video/webm', '.mkv': 'video/x-matroska', '.mpeg': 'video/mpeg', '.avi': 'video/x-msvideo', '.m4v': 'video/mp4' };
export class MediaLibrary {
  constructor(store, { ffmpeg = process.env.FFMPEG || 'ffmpeg', ffprobe = process.env.FFPROBE || 'ffprobe' } = {}) {
    this.store = store; this.directory = join(store.directory, 'media'); this.ffmpeg = ffmpeg; this.ffprobe = ffprobe;
    this.pendingFrames = new Map();
  }
  async importStream(stream, name, signal) {
    name = basename(String(name || 'video.mp4').replaceAll('\\', '/')).slice(0, 180);
    const extension = extname(name).toLowerCase();
    if (!formats[extension]) throw new Error('支持 MP4、MOV、WebM、MKV、MPEG、AVI 和 M4V 视频');
    const id = randomUUID(), directory = join(this.directory, id);
    await mkdir(directory, { recursive: true });
    const file = join(directory, 'original' + extension), hash = createHash('sha256');
    let size = 0;
    async function* bounded() {
      for await (const bytes of stream) {
        signal?.throwIfAborted(); size += bytes.byteLength;
        if (size > 1024 * 1024 * 1024) throw new Error('单个视频最大 1 GiB');
        hash.update(bytes); yield bytes;
      }
    }
    await writeFile(file, bounded());
    if (!size) throw new Error('视频文件为空');
    const metadata = JSON.parse(await runProcess(this.ffprobe, ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', file], { signal }));
    const video = metadata.streams?.find(s => s.codec_type === 'video');
    if (!video) throw new Error('文件中没有可读取的视频轨道');
    const duration = Number(metadata.format?.duration || video.duration || 0);
    if (!Number.isFinite(duration) || duration <= 0) throw new Error('无法确定视频时长');
    const record = { id, name, extension, mime: formats[extension], size, duration, width: video.width, height: video.height, hasAudio: metadata.streams.some(s => s.codec_type === 'audio'), sha256: hash.digest('hex'), at: Date.now(), frames: [], transcripts: {}, notes: '', status: 'ready' };
    await runProcess(this.ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-i', file, '-frames:v', '1', '-vf', 'scale=480:-2', join(directory, 'poster.jpg')], { signal });
    this.store.state.media.push(record);
    await this.store.save();
    return record;
  }
  get(id) { const media = this.store.state.media.find(m => m.id === id); if (!media) throw new Error('视频不存在'); return media; }
  path(media, part = 'original') {
    if (part === 'original') return join(this.directory, media.id, 'original' + media.extension);
    if (part === 'poster') return join(this.directory, media.id, 'poster.jpg');
    if (part === 'audio') return join(this.directory, media.id, 'audio.wav');
    const frame = media.frames.find(f => f.name === part);
    if (!frame) throw new Error('视频帧不存在');
    return join(this.directory, media.id, frame.name);
  }
  async frames(media, signal) {
    if (media.frames.length) return media.frames;
    if (this.pendingFrames.has(media.id)) return this.pendingFrames.get(media.id);
    const task = this.extractFrames(media, signal);
    this.pendingFrames.set(media.id, task);
    try { return await task; } finally { this.pendingFrames.delete(media.id); }
  }
  async extractFrames(media, signal) {
    const settings = this.store.state.settings;
    const interval = Math.max(settings.frameInterval, media.duration / settings.maxFrames);
    const dir = join(this.directory, media.id);
    // Start at t=0 and preserve timestamps. The duration/maxFrames term limits count without discarding a long video's tail.
    await runProcess(this.ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-i', this.path(media), '-vf', `fps=1/${interval}:start_time=0,scale=${settings.frameWidth}:-2`, '-frames:v', String(settings.maxFrames), '-q:v', '3', join(dir, 'frame-%04d.jpg')], { signal });
    const names = (await readdir(dir)).filter(n => /^frame-\d{4}\.jpg$/.test(n)).sort();
    if (!names.length) {
      await runProcess(this.ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-i', this.path(media), '-frames:v', '1', '-vf', `scale=${settings.frameWidth}:-2`, join(dir, 'frame-0001.jpg')], { signal });
      names.push('frame-0001.jpg');
    }
    media.frames = names.map((name, index) => ({ name, time: Math.min(index * interval, media.duration), mediaId: media.id }));
    media.frameInterval = interval;
    await this.store.save();
    return media.frames;
  }
  async audio(media, signal) {
    if (!media.hasAudio) return null;
    const file = this.path(media, 'audio');
    try { await stat(file); return file; } catch {}
    const temp = file + '.tmp.wav';
    await runProcess(this.ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-i', this.path(media), '-vn', '-ac', '1', '-ar', '16000', temp], { signal });
    await rename(temp, file).catch(async e => { try { await stat(file); } catch { throw e; } });
    return file;
  }
  async setTranscript(id, text) {
    const media = this.get(id);
    if (typeof text !== 'string' || text.length > 300000) throw new Error('字幕长度须在 30 万字以内');
    media.notes = text; await this.store.save();
  }
}
