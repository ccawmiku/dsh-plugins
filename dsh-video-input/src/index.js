import z from '@deepseek-ai/schemastery'
import { LlmError } from '@deepseek-ai/dsh-llm'
import { videosIn, videoMime, extractFrames } from './media.js'
import { currentConnection, chatBody, openVideoRequest, chatChunks } from './chat.js'

export const name = 'video-input'
export const inject = ['llm','attachments','settings','credentials']
export const Config = z.object({
  enabled:z.boolean().default(true).description('启用视频直传与自动抽帧').volatile(),
  maxVideos:z.natural().min(1).max(64).default(8).description('每次模型请求最多携带的视频数量（包括历史视频）').volatile(),
  maxVideoBytes:z.natural().min(1).max(2147483647).default(536870912).description('单个源视频最大字节数').volatile(),
  maxDirectBytes:z.natural().min(1).max(536870912).default(67108864).description('每次请求直传视频总字节数，超过后自动抽帧').volatile(),
  autoFallback:z.boolean().default(true).description('接口不支持直传或超出直传限制时自动抽帧').volatile(),
  ffmpegPath:z.string().default('ffmpeg').description('FFmpeg 可执行文件路径，自动抽帧需要').volatile(),
  ffprobePath:z.string().default('ffprobe').description('FFprobe 可执行文件路径，自动抽帧需要').volatile(),
  maxFrames:z.natural().min(1).max(20).default(8).description('所有历史视频合计最多抽取的图片数量，不超过原生图片数量上限').volatile(),
  frameInterval:z.number().min(0.1).max(3600).default(2).description('目标采样间隔（秒）；较长视频会均匀覆盖首尾').volatile(),
  frameWidth:z.natural().min(128).max(2048).default(1024).description('抽帧图片宽度').volatile(),
  frameCacheEntries:z.natural().min(0).max(128).default(16).description('内存中缓存的已完成抽帧结果数量').volatile(),
  timeoutMs:z.natural().min(1000).max(1800000).default(180000).description('单次视频模型请求与处理总超时（毫秒）').volatile(),
})

/** Existing durable file events are the source for both direct media and regenerated frames. */
export function apply(ctx, liveConfig) {
  const lifetime = new AbortController(), frames = new Map()
  ctx.effect(() => () => { lifetime.abort(new Error('视频插件已停用')); frames.clear() })
  ctx.on('llm/stream', function (options, next) {
    const config = Object.fromEntries(Object.entries(liveConfig).map(([key,value])=>[key,value.get()]))
    if (!config.enabled || !videosIn(options.messages).length) return next()
    return processVideo(options,config)
  })

  async function frameMessages(options, signal, unique, config) {
    const occurrences = videosIn(options.messages).length
    const perVideo = Math.max(1,Math.floor(config.maxFrames / occurrences))
    if (occurrences > config.maxFrames) throw new LlmError('视频数量超过抽帧图片上限，请减少本轮携带的视频或提高设置中的上限。','VIDEO_LIMIT')
    const resolved = new Map()
    for (const [id,ref] of unique) {
      const key = JSON.stringify([id,perVideo,config.frameInterval,config.frameWidth,config.ffmpegPath,config.ffprobePath])
      let samples = config.frameCacheEntries ? frames.get(key) : undefined
      if (!samples) {
        samples = await extractFrames(ctx.attachments,ref,{...config,maxFrames:perVideo},signal)
        if (config.frameCacheEntries) {
          frames.set(key,samples)
          while (frames.size > config.frameCacheEntries) frames.delete(frames.keys().next().value)
        }
      }
      resolved.set(id,samples)
    }
    return options.messages.map(message => ({...message,content:message.content.flatMap(block => {
      if (message.role !== 'user' || block.type !== 'file' || !videoMime(block.attachment)) return [block]
      const samples = resolved.get(block.attachment.attachmentId)
      return [{type:'text',text:`[Video frame fallback: ${block.attachment.name ?? 'video'}. ${samples.length} sampled frames follow in time order. Audio is NOT included; do not claim to have heard this video.]`},
        ...samples.flatMap(sample => [{type:'text',text:`[Video timestamp ${sample.time.toFixed(2)}s]`},{type:'image',attachment:sample.attachment}])]
    })}))
  }

  async function* processVideo(options,config) {
    const signal = AbortSignal.any([lifetime.signal,AbortSignal.timeout(config.timeoutMs),...(options.signal ? [options.signal]:[])])
    try {
      const videos = videosIn(options.messages)
      if (videos.length > config.maxVideos) throw new LlmError('当前请求中的视频数量超过视频输入设置上限。','VIDEO_LIMIT')
      if (videos.some(video => video.attachment.bytes > config.maxVideoBytes)) throw new LlmError('视频超过插件设置的单文件大小限制。','VIDEO_LIMIT')
      const unique = new Map(videos.map(video => [video.attachment.attachmentId,video.attachment]))
      const connection = await currentConnection(ctx,options)
      let reason = '当前连接协议不支持视频直传'
      if (connection) {
        try {
          const body = await chatBody(ctx,options,connection,config,signal)
          const response = await openVideoRequest(connection,body,options,signal)
          // Once output starts, errors must never trigger another model generation.
          yield* chatChunks(response,signal)
          return
        } catch (error) {
          if (!error.fallback) throw error
          reason = error.code === 'VIDEO_TOO_LARGE' ? '视频超过直传大小限制' : '当前接口拒绝视频直传'
        }
      }
      if (!config.autoFallback) throw new LlmError(`${reason}，自动抽帧已关闭。`,'UNSUPPORTED_CONTENT')
      const messages = await frameMessages(options,signal,unique,config)
      const notice = `【视频插件提示】${reason}，已自动改用带时间标记的抽帧图片；此模式不包含声音。\n\n`
      yield {type:'block-start',index:0,blockType:'text'}
      yield {type:'text-delta',index:0,text:notice}
      yield {type:'block-end',index:0,block:{type:'text',text:notice}}
      // No video FileBlock remains, so this call delegates to the selected native adapter.
      for await (const chunk of ctx.llm.stream({...options,messages,signal})) {
        yield 'index' in chunk ? {...chunk,index:chunk.index+1} : chunk
      }
    } catch (error) {
      const aborted = signal.aborted
      const timeout = aborted && signal.reason?.name === 'TimeoutError'
      yield {type:'finish',reason:{kind:aborted && !timeout ? 'aborted':'error',failure:{
        code:timeout ? 'TIMEOUT' : aborted ? 'ABORTED' : error.code ?? 'VIDEO_INPUT_ERROR',
        message:timeout ? '视频处理或请求超时。' : aborted ? '视频请求已取消。' : error instanceof TypeError ? '视频请求失败，请检查当前模型连接与网络。' : error.message,
      }}}
    }
  }
}
