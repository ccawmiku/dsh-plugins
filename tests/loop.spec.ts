/** Keyless integration: real Cordis, DSH loop, sessions and tools; only model responses and storage flush are mocked. */
import { expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import LlmRuntime, { createUserMessage, LlmAdapter, ToolCallId, type GenerateOptions, type StreamChunk } from '@deepseek-ai/dsh-llm'
import SessionStore, { SessionId, type SessionEvent } from '@deepseek-ai/dsh-session'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import AgentRegistry from '@deepseek-ai/dsh-agent'
import AgentLoop from '@deepseek-ai/dsh-agent-loop'
import SessionProjections from '@deepseek-ai/dsh-session-projection'
import Tools from '@deepseek-ai/dsh-tools'
import * as NativeTools from '@deepseek-ai/dsh-tool-executor-native'
import * as Progress from '../packages/dsh-progress-commentary/src/index.ts'
import * as Translation from '../packages/dsh-reasoning-translation/src/index.ts'
import { REQUEST, RESULT } from '../packages/dsh-reasoning-translation/src/records.ts'

class Scripted extends LlmAdapter {
  readonly requests: GenerateOptions[] = []
  constructor(private readonly replies: StreamChunk[][]) { super() }
  override async resolveModel(provider: string, model: string) { return { provider, id: model, name: model } }
  override async *stream(options: GenerateOptions) {
    this.requests.push(options)
    const chunks = this.replies.shift()
    if (!chunks) throw new Error('Unexpected model call')
    yield* chunks
  }
}
function text(text: string): StreamChunk[] {
  return [{ type: 'text-delta', index: 0, text }, { type: 'block-end', index: 0, block: { type: 'text', text } },
    { type: 'finish', reason: { kind: 'stop' } }]
}
async function harness() {
  const ctx = new Context()
  await ctx.plugin(LlmRuntime); await ctx.plugin(SessionStore); await ctx.plugin(SessionProjections)
  await ctx.plugin(SystemPrompt); await ctx.plugin(Tools); await ctx.plugin(NativeTools)
  await ctx.plugin(AgentRegistry); await ctx.plugin(AgentLoop, { agents: [] })
  return ctx
}

it('preserves text beside real tool calls, uses no extra progress model request and keeps final text separate', async () => {
  const ctx = await harness()
  try {
    await ctx.plugin(Progress)
    const callId = ToolCallId('echo-1')
    const model = new Scripted([[
      ...text('我先检查现有实现。').slice(0, -1),
      { type: 'block-end', index: 1, block: { type: 'tool-call', id: callId, name: 'echo', arguments: '{}' } },
      { type: 'finish', reason: { kind: 'tool-calls' } },
    ], text('检查完成，结果如下。')])
    ctx.llm.registerAdapter(['main'], model)
    ctx.tools.register({ name: 'echo', description: 'A harmless fixture', parameters: { type: 'object', properties: {} },
      output: { schema: { type: 'string' }, render: () => [{ type: 'text', text: 'ok' }] }, execute: async () => 'ok' })
    const events: SessionEvent[] = []
    ctx.on('session/event', (_session, event) => { events.push(event) })
    const agent = await ctx.agentLoop.create(SessionId('progress-integration'), { provider: 'main', model: 'main-model' })
    agent.followup(createUserMessage({ source: { kind: 'user' }, content: [{ type: 'text', text: '复杂测试任务' }] }))
    await vi.waitFor(() => expect(events.some(e => e.type === 'turn/end')).toBe(true))
    expect(model.requests).toHaveLength(2)
    expect(JSON.stringify(model.requests[0]?.messages)).toContain('Progress commentary')
    expect(events.filter(e => e.type === 'assistant/message').map(e => e.type === 'assistant/message'
      ? e.data.message.content.filter(b => b.type === 'text').map(b => b.type === 'text' ? b.text : '').join('') : '')
    ).toEqual(['我先检查现有实现。', '检查完成，结果如下。'])
    const kinds = events.map(e => e.type)
    expect(kinds.indexOf('assistant/message')).toBeLessThan(kinds.indexOf('tool/call'))
    expect(kinds.indexOf('tool/result')).toBeLessThan(kinds.lastIndexOf('assistant/message'))
  } finally { await ctx.fiber.dispose() }
})

it('translates only public reasoning through a different model, preserves originals, and stores replayable display records', async () => {
  const ctx = await harness()
  try {
    // In-memory durability barrier fixture; no claim of filesystem crash durability is made by this test.
    let flushes = 0
    ctx.on('session/flush', () => { flushes += 1 })
    const main = new Scripted([[
      { type: 'reasoning-delta', index: 0, text: 'Public reasoning paragraph.\n\n' },
      { type: 'block-end', index: 0, block: { type: 'reasoning', text: 'Public reasoning paragraph.\n\n' } },
      { type: 'text-delta', index: 1, text: 'FINAL ORIGINAL' },
      { type: 'block-end', index: 1, block: { type: 'text', text: 'FINAL ORIGINAL' } },
      { type: 'finish', reason: { kind: 'stop' } },
    ]])
    const auxiliary = new Scripted([text('公开思考段落。')])
    ctx.llm.registerAdapter(['main'], main)
    ctx.llm.registerAdapter(['aux'], auxiliary)
    const events: SessionEvent[] = []
    ctx.on('session/event', (_session, event) => { events.push(event) })
    await ctx.plugin(Translation, { enabled: true, provider: 'aux', model: 'translation-model' })
    const agent = await ctx.agentLoop.create(SessionId('translation-integration'), { provider: 'main', model: 'main-model' })
    agent.followup(createUserMessage({ source: { kind: 'user' }, content: [{ type: 'text', text: 'PRIVATE USER CONTEXT' }] }))
    await vi.waitFor(() => expect(events.some(e => String(e.type) === RESULT)).toBe(true))
    expect(main.requests).toHaveLength(1)
    expect(auxiliary.requests).toHaveLength(1)
    expect(auxiliary.requests[0]?.model).toBe('translation-model')
    expect(JSON.stringify(auxiliary.requests[0]?.messages)).not.toContain('PRIVATE USER CONTEXT')
    expect(JSON.stringify(auxiliary.requests[0]?.messages)).not.toContain('FINAL ORIGINAL')
    expect(JSON.stringify(agent.session.deriveMessages())).not.toContain('公开思考段落。')
    expect(JSON.stringify(agent.session.deriveMessages())).toContain('Public reasoning paragraph.')
    expect(events.find(e => String(e.type) === REQUEST)?.ignorable).toBe(true)
    expect(events.findIndex(e => String(e.type) === REQUEST)).toBeLessThan(events.findIndex(e => e.type === 'assistant/message'))
    expect(flushes).toBeGreaterThanOrEqual(2)
    expect(events.filter(e => e.type === 'assistant/message')).toHaveLength(1)
  } finally { await ctx.fiber.dispose() }
})
