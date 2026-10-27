import { expect, it } from 'vitest'
import { chatChunks, openVideoRequest, currentConnection } from '../src/chat.js'

function stream(events) {
  const bytes = new TextEncoder().encode(events.map(event=>`data: ${typeof event==='string'?event:JSON.stringify(event)}\r\n\r\n`).join(''))
  let cursor=0
  return new Response(new ReadableStream({pull(controller) {
    if (cursor>=bytes.length) {controller.close();return}
    controller.enqueue(bytes.slice(cursor,cursor+3));cursor+=3
  }}),{headers:{'content-type':'text/event-stream'}})
}
it('preserves fragmented UTF-8 text, reasoning, interleaved tools, usage and raw arguments',async()=>{
  const response=stream([
    {choices:[{delta:{reasoning_content:'检查视频。'}}]},
    {choices:[{delta:{content:'已看到画面。',tool_calls:[{index:0,id:'call1',function:{name:'inspect',arguments:'{"t":'}}]}}]},
    {choices:[{delta:{tool_calls:[{index:1,id:'call2',function:{name:'save',arguments:'{}'}},{index:0,function:{arguments:'2}'}}]},finish_reason:'tool_calls'}]},
    {choices:[],usage:{prompt_tokens:50,completion_tokens:10,total_tokens:60,prompt_tokens_details:{cached_tokens:12},completion_tokens_details:{reasoning_tokens:5}}},'[DONE]',
  ])
  const chunks=await Array.fromAsync(chatChunks(response,new AbortController().signal))
  expect(chunks.filter(c=>c.type==='block-end').map(c=>c.block)).toEqual([
    {type:'reasoning',text:'检查视频。'},{type:'text',text:'已看到画面。'},
    {type:'tool-call',id:'call1',name:'inspect',arguments:'{"t":2}'},
    {type:'tool-call',id:'call2',name:'save',arguments:'{}'},
  ])
  expect(chunks.at(-1)).toEqual({type:'finish',reason:{kind:'tool-calls'}})
  expect(chunks.find(c=>c.type==='usage').usage).toMatchObject({inputTokens:38,cacheReadTokens:12,outputTokens:10,totalTokens:60,reasoningTokens:5})
})
it('rejects truncated streams rather than accepting partial answers',async()=>{
  await expect(Array.fromAsync(chatChunks(stream([{choices:[{delta:{content:'partial'}}]}]),new AbortController().signal))).rejects.toMatchObject({code:'TRANSPORT'})
})
it.each([401,403,429,500])('does not turn HTTP %i into another billable frame request',async status=>{
  await expect(openVideoRequest({endpoint:'http://localhost/v1/chat/completions',profile:{},apiKey:'private-fixture-key'}, {}, {},new AbortController().signal,
    async()=>new Response('unsupported video',{status}))).rejects.toMatchObject({fallback:false})
})
it('allows a media-specific rejection to trigger fallback and never surfaces the upstream secret',async()=>{
  await expect(openVideoRequest({endpoint:'http://localhost/v1/chat/completions',profile:{},apiKey:'secret-value'}, {}, {},new AbortController().signal,
    async()=>new Response('unsupported video_url; secret-value',{status:400}))).rejects.toMatchObject({fallback:true,message:'视频请求被当前接口拒绝（HTTP 400）。'})
})
it('preserves context overflow for DSH compaction instead of retrying the video as frames',async()=>{
  await expect(openVideoRequest({endpoint:'http://localhost/v1/chat/completions',profile:{}},{},{},new AbortController().signal,
    async()=>new Response('{"error":{"code":"context_length_exceeded","message":"maximum context length exceeded"}}',{status:400}))).rejects.toMatchObject({code:'CONTEXT_WINDOW_EXCEEDED',fallback:false})
})
it('rereads only the selected route and resolves its existing credential reference',async()=>{
  let endpoint='http://localhost:8801/v1'
  const ctx={llm:{listConfigurableProviders:()=>[{provider:'route',settingsNs:'llm',settingsPath:['providers','route']}]},
    settings:{describe:()=>[{ns:'llm',value:{providers:{route:{api:'openai-completions',baseURL:endpoint,apiKeyEnv:'LOCAL_CREDENTIAL'}}}}]},
    credentials:{resolve:async key=>({value:key==='LOCAL_CREDENTIAL'?'memory-only':undefined})}}
  expect((await currentConnection(ctx,{provider:'route'})).endpoint).toBe('http://localhost:8801/v1/chat/completions')
  endpoint='http://localhost:8802/v1'
  expect((await currentConnection(ctx,{provider:'route'})).endpoint).toBe('http://localhost:8802/v1/chat/completions')
})
