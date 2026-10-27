import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import LlmRuntime, { LlmAdapter, createUserMessage } from '@deepseek-ai/dsh-llm'
import LocalAttachmentStore from '@deepseek-ai/dsh-attachment-local'
import SessionStore, { SessionId } from '@deepseek-ai/dsh-session'
import SessionProjections from '@deepseek-ai/dsh-session-projection'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import AgentRegistry from '@deepseek-ai/dsh-agent'
import AgentLoop from '@deepseek-ai/dsh-agent-loop'
import Tools from '@deepseek-ai/dsh-tools'
import * as NativeTools from '@deepseek-ai/dsh-tool-executor-native'
import * as Video from '../src/index.js'

class Route extends LlmAdapter {
  async resolveModel(provider,id){return {provider,id,name:id,inputModalities:['text','image'],contextWindow:1048576}}
  async *stream(){throw new Error('Unexpected native dispatch: the video plugin did not intercept this call')}
}
it.skipIf(!process.env.DSH_VIDEO_TEST_KEY)('Gemini: real Agent Loop reads multiple videos, calls a tool, and answers a new detail on follow-up',async()=>{
  const home=await mkdtemp(join(tmpdir(),'dsh-video-live-'))
  const ctx=new Context(),events=[],seen=[]
  try {
    await ctx.plugin(LlmRuntime);await ctx.plugin(SessionStore);await ctx.plugin(SessionProjections)
    await ctx.plugin(SystemPrompt);await ctx.plugin(Tools);await ctx.plugin(NativeTools)
    await ctx.plugin(AgentRegistry);await ctx.plugin(AgentLoop,{agents:[]})
    await ctx.plugin(LocalAttachmentStore,{dshHome:home})
    ctx.llm.registerAdapter(['test-gateway'],new Route())
    ctx.llm.registerConfigurableProviders([{provider:'test-gateway',displayName:'Test gateway',settingsNs:'test-settings',settingsPath:[]}])
    ctx.provide('settings',{describe:()=>[{ns:'test-settings',value:{api:'openai-completions',baseURL:process.env.DSH_VIDEO_TEST_URL,apiKeyEnv:'VIDEO_TEST'}}]})
    ctx.provide('credentials',{resolve:async name=>name==='VIDEO_TEST'?{value:process.env.DSH_VIDEO_TEST_KEY}:undefined})
    await ctx.plugin(Video)
    ctx.tools.register({name:'record_scene',description:'Record the observed video facts.',parameters:{type:'object',properties:{firstLabelA:{type:'string'},firstLabelB:{type:'string'},spokenWord:{type:'string'}},required:['firstLabelA','firstLabelB','spokenWord']},
      output:{schema:{type:'string'},render:()=>[{type:'text',text:'Recorded successfully.'}]},execute:async args=>{seen.push(args);return 'Recorded successfully.'}})
    ctx.on('session/event',(_session,event)=>events.push(event))
    const refs=[]
    for(const name of ['probe.mp4','probe-reversed.mp4']) refs.push(await ctx.attachments.saveFile({data:await readFile(new URL('./fixtures/'+name,import.meta.url)),name}))
    const agent=await ctx.agentLoop.create(SessionId('video-live-'+Date.now()),{provider:'test-gateway',model:'gemini-3.8-flash',maxTokens:4096})
    agent.followup(createUserMessage({source:{kind:'user'},content:[{type:'text',text:'Video A:'},{type:'file',attachment:refs[0]},{type:'text',text:'Video B:'},{type:'file',attachment:refs[1]},
      {type:'text',text:'Inspect both attached videos. Call record_scene exactly once with the first printed label of video A, the first printed label of video B, and the secret spoken word in video A. Do not infer missing media. Then briefly confirm completion.'}]}))
    await vi.waitFor(()=>expect(events.filter(event=>event.type==='turn/end').length).toBe(1),{timeout:120000,interval:100})
    expect(seen).toHaveLength(1)
    expect(seen[0].firstLabelA.toLowerCase()).toMatch(/blue.*41/)
    expect(seen[0].firstLabelB.toLowerCase()).toMatch(/red.*29/)
    expect(seen[0].spokenWord.toLowerCase()).toContain('coconut')
    agent.followup(createUserMessage({source:{kind:'user'},content:[{type:'text',text:'Look at video A again. What COLOR is the TEXT printed on the middle yellow background? Reply with only the text color.'}]}))
    await vi.waitFor(()=>expect(events.filter(event=>event.type==='turn/end').length).toBe(2),{timeout:120000,interval:100})
    const last=events.filter(event=>event.type==='assistant/message').at(-1)
    expect(last.data.message.content.filter(p=>p.type==='text').map(p=>p.text).join('').toLowerCase()).toContain('black')
    expect(events.filter(e=>e.type==='user/message').some(e=>e.data.content.some(p=>p.type==='file'))).toBe(true)
    console.log('Live verification: multiple videos, audio, real tool execution and follow-up passed.')
  } finally {await ctx.fiber.dispose();await rm(home,{recursive:true,force:true})}
},180000)
