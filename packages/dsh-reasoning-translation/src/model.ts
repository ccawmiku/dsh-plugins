/** Collect only a complete ordinary-text translation from a DSH auxiliary call. */
import type { GenerateOptions, StreamChunk } from '@deepseek-ai/dsh-llm'
import type { TranslationRequest } from './records.ts'

/** Translate one public source fragment; returned reasoning and tool calls are never executed or displayed. */
export async function translateWithModel(
  stream: (options: GenerateOptions) => AsyncIterable<StreamChunk>,
  request: TranslationRequest, signal: AbortSignal, maxOutputChars: number,
  progress: (text: string) => void = () => {},
): Promise<string> {
  const texts = new Map<number, string>()
  let size = 0
  let stopped = false
  for await (const chunk of stream({
    provider: request.provider, model: request.model,
    system: request.system,
    messages: [{ role: 'user', content: [{ type: 'text', text: request.source }] }],
    maxTokens: request.maxTokens,
    tools: [], signal,
  })) {
    signal.throwIfAborted()
    if (stopped) throw new Error('Chunks after finish')
    let text: string | undefined
    if (chunk.type === 'text-delta') text = (texts.get(chunk.index) ?? '') + chunk.text
    if (chunk.type === 'block-end' && chunk.block.type === 'text') text = chunk.block.text
    if (chunk.type === 'tool-call-delta' || (chunk.type === 'block-end' && chunk.block.type === 'tool-call')) {
      throw new Error('Translation response requested tools')
    }
    if (text !== undefined && 'index' in chunk) {
      size += text.length - (texts.get(chunk.index)?.length ?? 0)
      if (size > maxOutputChars) throw new Error('Translation output limit')
      texts.set(chunk.index, text)
      progress([...texts.entries()].sort(([a], [b]) => a - b).map(([, text]) => text).join(''))
    }
    if (chunk.type === 'finish') {
      if (chunk.reason.kind !== 'stop') throw new Error('Incomplete translation')
      stopped = true
    }
  }
  signal.throwIfAborted()
  if (!stopped) throw new Error('Translation stream ended without finish')
  return [...texts.entries()].sort(([a], [b]) => a - b).map(([, text]) => text).join('')
}
