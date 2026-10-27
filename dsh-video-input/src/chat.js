import { fileHandleText, isContextWindowExceededError, isQuotaExceededError, offloadedImageText, projectToolUpdates } from '@deepseek-ai/dsh-llm'
import { videoMime, videoBytes } from './media.js'

export class VideoRequestError extends Error {
  constructor(message, code, fallback = false) { super(message); this.code = code; this.fallback = fallback }
}

/** Resolve only the route selected by this request; never persist or expose credentials. */
export async function currentConnection(ctx, options) {
  const entry = ctx.llm.listConfigurableProviders().find(row => row.provider === options.provider)
  if (!entry) return null
  const descriptor = ctx.settings.describe().find(row => row.ns === entry.settingsNs)
  if (!descriptor) throw new VideoRequestError('无法读取当前模型连接配置，请检查 DSH 模型设置。', 'VIDEO_CONFIG')
  let profile = descriptor.value
  for (const key of entry.settingsPath) profile = profile?.[key]
  if (!profile) throw new VideoRequestError('当前模型连接配置不存在。', 'VIDEO_CONFIG')
  if (profile.api !== 'openai-completions') return null
  const endpoint = new URL(profile.baseURL || entry.defaultBaseURL)
  if (!['http:','https:'].includes(endpoint.protocol) || endpoint.username || endpoint.password || endpoint.search || endpoint.hash) {
    throw new VideoRequestError('当前模型的接口地址格式不受支持。', 'VIDEO_CONFIG')
  }
  endpoint.pathname = endpoint.pathname.replace(/\/$/, '')
  if (!endpoint.pathname) endpoint.pathname = '/v1'
  if (!endpoint.pathname.endsWith('/chat/completions')) endpoint.pathname += '/chat/completions'
  let apiKey
  if (profile.apiKeyEnv) {
    apiKey = (await ctx.credentials.resolve(profile.apiKeyEnv))?.value
    if (!apiKey) throw new VideoRequestError('当前模型连接的凭据不可用，请在模型设置中重新保存。', 'AUTH')
  } else {
    for (const variable of entry.nativeAuth?.env ?? []) {
      apiKey = (await ctx.credentials.resolve(variable))?.value
      if (apiKey) break
    }
    if (!apiKey && entry.nativeAuth?.oauth) return null
  }
  return {endpoint:endpoint.href, profile, apiKey}
}

async function imagePart(ctx, options, block, signal) {
  const ref = block.attachment
  if (block.offloaded) return {type:'text',text:offloadedImageText(ref)}
  const target = ctx.llm.imageRequestTarget(options.provider, options.model, ref)
  const image = await ctx.attachments.readImageRequest(ref, target, signal)
  return {type:'image_url',image_url:{url:`data:${image.mediaType};base64,${Buffer.from(image.data).toString('base64')}`}}
}

/** Keep text, images and tool correlation while substituting video file references. */
export async function chatBody(ctx, options, connection, config, signal) {
  const projection = projectToolUpdates(options.messages, options.tools, undefined, options.toolHistory)
  const messages = []
  let videoTotal = 0
  if (options.system) messages.push({role:'system',content:options.system})
  for (const message of projection.messages) {
    const content = [], calls = [], reasoning = []
    for (const block of message.content) {
      switch (block.type) {
        case 'text': content.push({type:'text',text:block.text}); break
        case 'reasoning': reasoning.push(block.text); break
        case 'image': content.push(await imagePart(ctx, options, block, signal)); break
        case 'file': {
          const mime = videoMime(block.attachment)
          if (!mime || message.role !== 'user') {
            content.push({type:'text',text:fileHandleText(block.attachment, ctx.attachments.fileHostPath(block.attachment))})
            break
          }
          videoTotal += block.attachment.bytes
          if (videoTotal > config.maxDirectBytes) throw new VideoRequestError('视频总大小超过直传限制，将自动抽帧。','VIDEO_TOO_LARGE',true)
          const bytes = await videoBytes(ctx.attachments, block.attachment, config.maxDirectBytes, signal)
          content.push({type:'text',text:`[Video: ${block.attachment.name ?? 'video'}]`}, {type:'video_url',video_url:{url:`data:${mime};base64,${bytes.toString('base64')}`}})
          break
        }
        case 'tool-call': calls.push({id:block.id,type:'function',function:{name:block.name,arguments:block.arguments}}); break
        default: throw new VideoRequestError(`视频请求暂不支持内容类型：${block.type}`,'UNSUPPORTED_CONTENT')
      }
    }
    const out = {role:message.role,content:content.length === 1 && content[0].type === 'text' ? content[0].text : content}
    if (message.role === 'tool') out.tool_call_id = message.toolCallId
    if (calls.length) out.tool_calls = calls
    if (reasoning.length && message.role === 'assistant') out.reasoning_content = reasoning.join('')
    messages.push(out)
  }
  const body = {model:options.model,messages,stream:true,stream_options:{include_usage:true}}
  if (projection.tools?.length) body.tools = projection.tools.map(tool => ({type:'function',function:{name:tool.name,description:tool.description,parameters:tool.parameters}}))
  if (options.maxTokens !== undefined) body.max_tokens = options.maxTokens
  if (options.temperature !== undefined) body.temperature = options.temperature
  if (options.stop !== undefined) body.stop = options.stop
  const model = connection.profile.models?.find(row => row.id === options.model)
  const override = connection.profile.modelOverrides?.[options.model]
  const effort = options.reasoningEffort ?? connection.profile.reasoning
  const efforts = override?.reasoningEfforts ?? model?.reasoningEfforts
  const wireEffort = efforts && Object.hasOwn(efforts, effort) ? efforts[effort] : effort
  if (wireEffort && wireEffort !== 'off') body.reasoning_effort = wireEffort
  return body
}

/** Decode fragmented UTF-8 SSE with bounded per-event buffering and guaranteed reader release. */
export async function* sseData(body, signal) {
  const reader = body.getReader(), decoder = new TextDecoder()
  let buffer = '', data = [], dataBytes = 0, completed = false
  try {
    while (true) {
      signal.throwIfAborted()
      const chunk = await reader.read()
      buffer += decoder.decode(chunk.value, {stream:!chunk.done})
      if (buffer.length > 8 * 1024 * 1024) throw new VideoRequestError('模型返回的单个流事件过大。','INVALID_RESPONSE')
      let newline
      while ((newline = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0,newline).replace(/\r$/, '')
        buffer = buffer.slice(newline+1)
        if (line === '') {
          if (data.length) { yield data.join('\n'); data = []; dataBytes = 0 }
        } else if (line.startsWith('data:')) {
          dataBytes += line.length
          if (dataBytes > 8 * 1024 * 1024) throw new VideoRequestError('模型返回的单个流事件过大。','INVALID_RESPONSE')
          data.push(line.slice(5).replace(/^ /,''))
        }
      }
      if (chunk.done) { completed = true; break }
    }
    if (buffer.startsWith('data:')) data.push(buffer.slice(5).trim())
    if (data.length) yield data.join('\n')
  } finally {
    if (!completed) await reader.cancel().catch(() => {})
    reader.releaseLock()
  }
}

/** HTTP failures before any model output may admit frame fallback, never authentication or outage retries. */
export async function openVideoRequest(connection, body, options, signal, fetcher = fetch) {
  const headers = new Headers(connection.profile.headers)
  headers.set('content-type','application/json')
  headers.set('accept','text/event-stream')
  if (connection.apiKey) headers.set('authorization',`Bearer ${connection.apiKey}`)
  if (options.sessionId) headers.set('x-session-id',String(options.sessionId))
  const response = await fetcher(connection.endpoint, {method:'POST',headers,body:JSON.stringify(body),signal,redirect:'error'})
  if (!response.ok) {
    // Inspect at most 16 KiB in memory for classification; never print provider bodies or headers.
    let errorText = ''
    const reader = response.body?.getReader()
    try {
      if (reader) {
        while (errorText.length < 16384) {
          const chunk = await reader.read()
          if (chunk.done) break
          errorText += new TextDecoder().decode(chunk.value.subarray(0,16384-errorText.length))
        }
      }
    } finally { if (reader) { await reader.cancel().catch(() => {}); reader.releaseLock() } }
    const overflow = isContextWindowExceededError(errorText), quota = isQuotaExceededError(errorText)
    const fallback = !overflow && !quota && (response.status === 413 || [400,415,422].includes(response.status) && /video|video_url|unsupported.*(?:media|content)|unknown.*(?:type|field)|not support.*(?:media|content)/i.test(errorText))
    const code = overflow ? 'CONTEXT_WINDOW_EXCEEDED' : quota ? 'QUOTA_EXCEEDED' : response.status === 401 || response.status === 403 ? 'AUTH' : response.status === 429 ? 'RATE_LIMIT' : response.status >= 500 ? 'SERVER' : 'INVALID_REQUEST'
    throw new VideoRequestError(`视频请求被当前接口拒绝（HTTP ${response.status}）。`,code,fallback)
  }
  if (!response.body || !response.headers.get('content-type')?.includes('text/event-stream')) throw new VideoRequestError('接口未返回预期的流式响应。','INVALID_RESPONSE')
  return response
}

/** Convert interleaved Chat Completions text, reasoning and tool calls into DSH chunks. */
export async function* chatChunks(response, signal) {
  const blocks = new Map(), tools = new Map()
  let nextIndex = 0, reason, usage, done = false
  for await (const data of sseData(response.body,signal)) {
    if (data === '[DONE]') { done = true; break }
    const event = JSON.parse(data)
    if (event.error) throw new VideoRequestError('模型返回了流式错误，请检查当前模型与网关。','SERVER')
    if (event.usage) usage = event.usage
    const choice = event.choices?.[0]
    if (!choice) continue
    if (choice.finish_reason) reason = choice.finish_reason
    const delta = choice.delta ?? {}
    for (const [field,kind] of [['reasoning_content','reasoning'],['reasoning','reasoning'],['content','text']]) {
      if (typeof delta[field] !== 'string' || !delta[field]) continue
      let block = blocks.get(kind)
      if (!block) {
        block = {index:nextIndex++,type:kind,text:''}
        blocks.set(kind,block)
        yield {type:'block-start',index:block.index,blockType:kind}
      }
      block.text += delta[field]
      yield {type:kind === 'text' ? 'text-delta':'reasoning-delta',index:block.index,text:delta[field]}
    }
    for (const deltaTool of delta.tool_calls ?? []) {
      let block = tools.get(deltaTool.index)
      if (!block) {
        block = {index:nextIndex++,type:'tool-call',id:'',name:'',arguments:''}
        tools.set(deltaTool.index,block)
        yield {type:'block-start',index:block.index,blockType:'tool-call'}
      }
      if (deltaTool.id && deltaTool.id !== block.id) block.id += deltaTool.id
      block.name += deltaTool.function?.name ?? ''
      const argumentsDelta = deltaTool.function?.arguments ?? ''
      block.arguments += argumentsDelta
      if (block.id) yield {type:'tool-call-delta',index:block.index,id:block.id,name:block.name,argumentsDelta}
    }
  }
  if (!reason || !done) throw new VideoRequestError('模型流在结束标记前中断。','TRANSPORT')
  for (const block of [...blocks.values(),...tools.values()].sort((a,b)=>a.index-b.index)) {
    const {index,...content} = block
    if (content.type === 'tool-call' && (!content.id || !content.name)) throw new VideoRequestError('模型返回了不完整的工具调用。','INVALID_RESPONSE')
    yield {type:'block-end',index,block:content}
  }
  if (usage) yield {type:'usage',usage:{inputTokens:Math.max(0,(usage.prompt_tokens ?? 0)-(usage.prompt_tokens_details?.cached_tokens ?? 0)),outputTokens:usage.completion_tokens ?? 0,
    ...(usage.total_tokens === undefined ? {} : {totalTokens:usage.total_tokens}),
    ...(usage.completion_tokens_details?.reasoning_tokens === undefined ? {} : {reasoningTokens:usage.completion_tokens_details.reasoning_tokens}),
    ...(usage.prompt_tokens_details?.cached_tokens === undefined ? {} : {cacheReadTokens:usage.prompt_tokens_details.cached_tokens})}}
  if (!blocks.size && !tools.size) throw new VideoRequestError('模型返回了空响应。','EMPTY_RESPONSE')
  if (reason === 'content_filter') throw new VideoRequestError('模型因内容过滤终止了视频回复。','CONTENT_FILTER')
  if (!['stop','length','tool_calls'].includes(reason)) throw new VideoRequestError('模型返回了不受支持的结束原因。','INVALID_RESPONSE')
  yield {type:'finish',reason:reason === 'tool_calls' || tools.size ? {kind:'tool-calls'} : reason === 'length' ? {kind:'max-tokens'} : {kind:'stop'}}
}
