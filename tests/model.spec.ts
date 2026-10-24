import { expect, it, vi } from 'vitest'
import type { GenerateOptions, StreamChunk, FinishReason } from '@deepseek-ai/dsh-llm'
import { translateWithModel } from '../packages/dsh-reasoning-translation/src/model.ts'
import type { TranslationRequest } from '../packages/dsh-reasoning-translation/src/records.ts'

const input: TranslationRequest = { version: 1, id: '1', turn: 1, step: 1, source: 'source', system: 'translate',
  provider: 'aux', model: 'different-model', language: 'zh', maxTokens: 123 }
const signal = new AbortController().signal
function stream(chunks: StreamChunk[]) { return async function* (_options: GenerateOptions) { yield* chunks } }

it('uses the selected model with only source and translation instructions, no main conversation or tools', async () => {
  const chunks: StreamChunk[] = [
    { type: 'reasoning-delta', index: 0, text: 'translator-private-data' },
    { type: 'text-delta', index: 1, text: '译' }, { type: 'text-delta', index: 1, text: '文' },
    { type: 'block-end', index: 1, block: { type: 'text', text: '译文' } },
    { type: 'finish', reason: { kind: 'stop' } },
  ]
  const call = vi.fn(stream(chunks))
  expect(await translateWithModel(call, input, signal, 100)).toBe('译文')
  expect(call).toHaveBeenCalledWith({ provider: 'aux', model: 'different-model', system: 'translate',
    messages: [{ role: 'user', content: [{ type: 'text', text: 'source' }] }], tools: [], maxTokens: 123, signal })
})
it('supports providers emitting only complete text blocks', async () => {
  expect(await translateWithModel(stream([{ type: 'block-end', index: 0, block: { type: 'text', text: 'ok' } },
    { type: 'finish', reason: { kind: 'stop' } }]), input, signal, 10)).toBe('ok')
})
it.each(['error', 'aborted', 'max-tokens', 'tool-calls'] as const)('rejects non-success finish %s', async kind => {
  const finish: FinishReason = kind === 'error' || kind === 'aborted'
    ? { kind, failure: { code: 'FAILED', message: 'failed' } } : { kind }
  await expect(translateWithModel(stream([{ type: 'finish', reason: finish }]), input, signal, 100)).rejects.toThrow()
})
it('rejects missing finish, oversized output, and any requested tool', async () => {
  await expect(translateWithModel(stream([]), input, signal, 10)).rejects.toThrow('without finish')
  await expect(translateWithModel(stream([{ type: 'text-delta', index: 0, text: 'xx' }]), input, signal, 1)).rejects.toThrow('limit')
  await expect(translateWithModel(stream([{ type: 'block-start', index: 0, blockType: 'tool-call' },
    { type: 'tool-call-delta', index: 0, id: 'tool' as never, name: 'bad', argumentsDelta: '{}' }]), input, signal, 100)).rejects.toThrow('tools')
})
