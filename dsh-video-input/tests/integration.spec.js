import { createServer } from 'node:http'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import Loader from '@deepseek-ai/cordis-plugin-loader'
import Include from '@deepseek-ai/cordis-plugin-include'
import LlmRuntime, { LlmAdapter } from '@deepseek-ai/dsh-llm'
import LocalAttachmentStore from '@deepseek-ai/dsh-attachment-local'
import * as Video from '../src/index.js'

class Native extends LlmAdapter {
  calls=[]
  async resolveModel(provider,id) {return {provider,id,name:id,inputModalities:['text','image']}}
  async *stream(options) {
    this.calls.push(options)
    yield {type:'block-start',index:0,blockType:'text'}
    yield {type:'text-delta',index:0,text:'native-frame-answer'}
    yield {type:'block-end',index:0,block:{type:'text',text:'native-frame-answer'}}
    yield {type:'finish',reason:{kind:'stop'}}
  }
}

/** Real Loader + LLM runtime + durable attachment store; only upstream HTTP/config are fixtures. */
export async function harness({status=200,body='unsupported video_url',config={},home,hang=false}={}) {
  const directory=home ?? await mkdtemp(join(tmpdir(),'dsh-video-integration-'))
  const requests=[]
  const server=createServer(async(req,res)=>{
    let text='';for await(const bytes of req) text+=bytes
    requests.push(JSON.parse(text))
    if(hang) return
    if(status!==200){res.writeHead(status);res.end(body);return}
    res.writeHead(200,{'content-type':'text/event-stream'})
    for(const event of [{choices:[{delta:{content:'direct-video-answer'}}]},{choices:[{delta:{},finish_reason:'stop'}],usage:{prompt_tokens:10,completion_tokens:2,total_tokens:12}}]) res.write(`data: ${JSON.stringify(event)}\n\n`)
    res.end('data: [DONE]\n\n')
  })
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve))
  const baseURL=`http://127.0.0.1:${server.address().port}/v1`
  const ctx=new Context()
  const native=new Native()
  try {
    await ctx.plugin(LlmRuntime)
    await ctx.plugin(LocalAttachmentStore,{dshHome:directory})
    ctx.llm.registerAdapter(['current'],native)
    ctx.llm.registerConfigurableProviders([{provider:'current',displayName:'Current model',settingsNs:'fixture-config',settingsPath:['providers','current']}])
    ctx.provide('settings',{describe:()=>[{ns:'fixture-config',value:{providers:{current:{api:'openai-completions',baseURL,apiKeyEnv:'TEST_KEY'}}}}]})
    ctx.provide('credentials',{resolve:async()=>({value:'local-test-only'})})
    await ctx.plugin(Loader)
    ctx.loader.builtins.include=Include
    ctx.loader.builtins.video=Video
    const file=join(directory,'cordis.yml')
    await writeFile(file,`- id: video\n  name: cordis:video\n  config: ${JSON.stringify(config)}\n`)
    await ctx.loader.create({name:'cordis:include',config:{path:pathToFileURL(file).href}})
    await ctx.loader.await()
    const entry=[...ctx.loader.entries()].find(e=>e.options.id==='video')
    expect(entry?.fiber).toBeDefined()
    const ref=await ctx.attachments.saveFile({data:await readFile(new URL('./fixtures/probe.mp4',import.meta.url)),name:'clip.mp4'})
    const options={provider:'current',model:'gemini-3.8-flash',messages:[{role:'user',content:[{type:'file',attachment:ref},{type:'text',text:'inspect video'}]}]}
    return {ctx,native,requests,ref,options,directory,entry,close:async()=>{
      await ctx.fiber.dispose();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));if(!home)await rm(directory,{recursive:true,force:true})
    }}
  } catch(error){await ctx.fiber.dispose();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));await rm(directory,{recursive:true,force:true});throw error}
}

it('uploads exact bytes for multiple videos, retains tools/images, restores refs and unregisters cleanly',async()=>{
  const h=await harness()
  try {
    const expected=await readFile(new URL('./fixtures/probe.mp4',import.meta.url))
    const image=await h.ctx.attachments.saveImage({data:await readFile(new URL('./fixtures/frame.png',import.meta.url)),mediaType:'image/png',name:'image.png'})
    h.options.messages[0].content.push({type:'file',attachment:h.ref})
    h.options.messages[0].content.push({type:'image',attachment:image})
    h.options.tools=[{name:'inspect',description:'Inspect',parameters:{type:'object',properties:{}}}]
    const chunks=await Array.fromAsync(h.ctx.llm.stream(h.options))
    expect(chunks.at(-1).reason.kind).toBe('stop')
    expect(h.requests).toHaveLength(1)
    expect(h.requests[0].model).toBe('gemini-3.8-flash')
    const media=h.requests[0].messages[0].content.filter(p=>p.type==='video_url')
    expect(media).toHaveLength(2)
    expect(Buffer.from(media[0].video_url.url.split(',')[1],'base64')).toEqual(expected)
    expect(h.requests[0].messages[0].content.find(p=>p.type==='image_url').image_url.url).toMatch(/^data:image\//)
    expect(h.requests[0].tools[0].function.name).toBe('inspect')
    // A new durable ref object read from persisted JSON still resolves and is resent on a follow-up.
    const restored=JSON.parse(JSON.stringify(h.options))
    restored.messages.push({role:'user',content:[{type:'text',text:'What was in the middle?'}]})
    await Array.fromAsync(h.ctx.llm.stream(restored))
    expect(h.requests[1].messages[0].content.filter(p=>p.type==='video_url')).toHaveLength(2)
    expect(h.native.calls).toHaveLength(0)
    await h.entry.fiber.dispose()
    await Array.fromAsync(h.ctx.llm.stream(h.options))
    expect(h.requests).toHaveLength(2)
    expect(h.native.calls).toHaveLength(1)
    expect(h.native.calls[0].messages[0].content.some(p=>p.type==='file')).toBe(false)
    expect(h.native.calls[0].messages[0].content.some(p=>p.type==='image')).toBe(true)
  } finally {await h.close()}
})
it('automatically extracts timestamped frames on an explicit media refusal and shows an audio-loss notice',async()=>{
  const h=await harness({status:400,config:{maxFrames:3}})
  try {
    const chunks=await Array.fromAsync(h.ctx.llm.stream(h.options))
    expect(chunks.at(-1)).toEqual({type:'finish',reason:{kind:'stop'}})
    expect(h.requests).toHaveLength(1)
    expect(h.native.calls).toHaveLength(1)
    const content=h.native.calls[0].messages[0].content
    expect(content.some(p=>p.type==='file')).toBe(false)
    expect(content.filter(p=>p.type==='image')).toHaveLength(3)
    expect(JSON.stringify(content)).toContain('Audio is NOT included')
    expect(chunks.find(c=>c.type==='text-delta').text).toContain('此模式不包含声音')
    await Array.fromAsync(h.ctx.llm.stream(h.options))
    expect(h.native.calls).toHaveLength(2)
  } finally {await h.close()}
})
it('passes ordinary messages through without a separate HTTP request',async()=>{
  const h=await harness()
  try {
    await Array.fromAsync(h.ctx.llm.stream({...h.options,messages:[{role:'user',content:[{type:'text',text:'hello'}]}]}))
    expect(h.requests).toHaveLength(0);expect(h.native.calls).toHaveLength(1)
  } finally {await h.close()}
})
it('does not retry bad credentials as frame requests',async()=>{
  const h=await harness({status:401})
  try {
    const chunks=await Array.fromAsync(h.ctx.llm.stream(h.options))
    expect(chunks.at(-1).reason.failure.code).toBe('AUTH')
    expect(h.requests).toHaveLength(1);expect(h.native.calls).toHaveLength(0)
  } finally {await h.close()}
})
it('reopens durable video references with a fresh runtime after restart',async()=>{
  const home=await mkdtemp(join(tmpdir(),'dsh-video-resume-'))
  try {
    const first=await harness({home})
    let restored
    try {restored=JSON.parse(JSON.stringify(first.options));await Array.fromAsync(first.ctx.llm.stream(first.options))}
    finally {await first.close()}
    const second=await harness({home})
    try {
      restored.messages.push({role:'user',content:[{type:'text',text:'Follow-up after restart'}]})
      await Array.fromAsync(second.ctx.llm.stream(restored))
      expect(second.requests[0].messages[0].content.some(p=>p.type==='video_url')).toBe(true)
      expect(second.requests[0].messages.at(-1).content).toBe('Follow-up after restart')
    } finally {await second.close()}
  } finally {await rm(home,{recursive:true,force:true})}
})
it('aborts an in-flight request when the plugin is unloaded without dispatching fallback',async()=>{
  const h=await harness({hang:true})
  try {
    const pending=Array.fromAsync(h.ctx.llm.stream(h.options))
    await vi.waitFor(()=>expect(h.requests).toHaveLength(1))
    await h.entry.fiber.dispose()
    const chunks=await pending
    expect(chunks.at(-1).reason.kind).toBe('aborted')
    expect(h.native.calls).toHaveLength(0)
  } finally {await h.close()}
})
