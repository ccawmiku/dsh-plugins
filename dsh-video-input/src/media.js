import { spawn } from 'node:child_process'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { join, extname } from 'node:path'
import { tmpdir } from 'node:os'

const formats = {'.mp4':'video/mp4','.m4v':'video/mp4','.mov':'video/quicktime','.webm':'video/webm','.mkv':'video/x-matroska','.avi':'video/x-msvideo','.mpeg':'video/mpeg','.mpg':'video/mpeg','.3gp':'video/3gpp','.wmv':'video/x-ms-wmv'}
export function videoMime(ref) { return formats[extname(ref.name ?? '').toLowerCase()] }
export function videosIn(messages) {
  return messages.flatMap(message => message.role === 'user' ? message.content.filter(block => block.type === 'file' && videoMime(block.attachment)) : [])
}

/** Read the stored, integrity-checked stream; never treat a user name as a host path. */
export async function videoBytes(store, ref, maxBytes, signal) {
  if (ref.bytes > maxBytes) throw Object.assign(new Error('视频超过直传大小限制'), {code:'VIDEO_TOO_LARGE'})
  let size = 0
  const chunks = []
  for await (const chunk of store.readFileStream(ref, signal)) {
    signal.throwIfAborted()
    size += chunk.byteLength
    if (size > maxBytes) throw Object.assign(new Error('视频超过直传大小限制'), {code:'VIDEO_TOO_LARGE'})
    chunks.push(chunk)
  }
  return Buffer.concat(chunks, size)
}

/** Own and reap one subprocess, including cancellation and bounded diagnostics. */
export function processOutput(command, args, signal, timeoutMs) {
  return new Promise((resolve, reject) => {
    signal.throwIfAborted()
    const child = spawn(command, args, {windowsHide:true, shell:false, stdio:['ignore','pipe','pipe']})
    let stdout = '', stderr = '', failure
    const abort = () => { failure = signal.reason ?? new Error('已取消'); child.kill() }
    const timer = setTimeout(() => { failure = new Error('视频抽帧超时'); child.kill() }, timeoutMs)
    signal.addEventListener('abort', abort, {once:true})
    child.stdout.on('data', bytes => { stdout = (stdout + bytes).slice(-65536) })
    child.stderr.on('data', bytes => { stderr = (stderr + bytes).slice(-2048) })
    child.once('error', error => { failure = error.code === 'ENOENT' ? new Error('自动抽帧需要 FFmpeg / FFprobe，请安装或在视频输入设置中指定路径。') : error })
    child.once('close', code => {
      clearTimeout(timer)
      signal.removeEventListener('abort', abort)
      if (failure) reject(failure)
      else if (code !== 0) reject(new Error(`视频抽帧失败（退出码 ${code}）。请检查视频是否损坏及 FFmpeg 配置。`))
      else resolve(stdout)
    })
  })
}

/** Uniform samples include both ends; retained source files can regenerate them after restart. */
export async function extractFrames(store, ref, config, signal) {
  if (ref.bytes > config.maxVideoBytes) throw new Error('视频超过插件设置的单文件大小限制。')
  const directory = await mkdtemp(join(tmpdir(), 'dsh-video-input-'))
  try {
    const source = join(directory, 'source')
    let size = 0
    async function* verified() {
      for await (const chunk of store.readFileStream(ref, signal)) {
        signal.throwIfAborted()
        size += chunk.byteLength
        if (size > config.maxVideoBytes) throw new Error('视频超过插件设置的单文件大小限制。')
        yield chunk
      }
    }
    await writeFile(source, verified(), {signal})
    const meta = JSON.parse(await processOutput(config.ffprobePath, ['-v','error','-show_entries','format=duration','-of','json',source], signal, config.timeoutMs))
    const duration = Number(meta.format?.duration)
    if (!Number.isFinite(duration) || duration <= 0) throw new Error('无法读取视频时长。')
    const count = Math.min(config.maxFrames, Math.max(1, Math.ceil(duration / config.frameInterval)))
    const frames = []
    for (let index = 0; index < count; index++) {
      signal.throwIfAborted()
      const time = count === 1 ? 0 : index * Math.max(0, duration - 0.1) / (count - 1)
      const output = join(directory, `${index}.jpg`)
      await processOutput(config.ffmpegPath, ['-hide_banner','-loglevel','error','-y','-ss',time.toFixed(3),'-i',source,'-frames:v','1','-vf',`scale=${config.frameWidth}:-2`,'-q:v','3',output], signal, config.timeoutMs)
      const attachment = await store.saveImage({data:await readFile(output),mediaType:'image/jpeg',name:`${ref.name ?? 'video'} @ ${time.toFixed(2)}s`})
      frames.push({time, attachment})
    }
    return frames
  } finally { await rm(directory, {recursive:true,force:true}) }
}
