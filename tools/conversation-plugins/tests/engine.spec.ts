import { describe, expect, it, vi } from 'vitest'
import { ParagraphFeed, TranslationQueue, type TranslationJob } from '../../../dsh-reasoning-translation/src/engine.ts'
import type { TranslationRequest, TranslationResult } from '../../../dsh-reasoning-translation/src/records.ts'

export const request: TranslationRequest = { version: 1, id: 'request-1', turn: 1, step: 1,
  provider: 'chosen-provider', model: 'chosen-model', language: '简体中文', source: 'Public source', system: 'Translate only', maxTokens: 100 }

function job(overrides: Partial<TranslationJob> = {}): TranslationJob {
  return { request, settings: { ...request, timeoutMs: 1000, maxOutputChars: 100 },
    signal: new AbortController().signal, record: vi.fn(), start: vi.fn(async () => {}), settle: vi.fn(async () => {}),
    translate: vi.fn(async () => '译文'), storageFailed: vi.fn(), ...overrides }
}

describe('public paragraph feed', () => {
  it('publishes completed paragraphs before the reasoning block ends, without replaying deltas', () => {
    const parts: [string, number][] = []
    const feed = new ParagraphFeed(100, (text, offset) => { parts.push([text, offset]); return true })
    feed.push('First para\n')
    expect(parts).toEqual([])
    feed.push('\nSecond')
    expect(parts).toEqual([['First para\n\n', 0]])
    feed.end('First para\n\nSecond paragraph')
    feed.end('First para\n\nSecond paragraph')
    expect(parts).toEqual([['First para\n\n', 0], ['Second paragraph', 12]])
  })
  it('supports block-end-only adapters', () => {
    const parts: string[] = []
    new ParagraphFeed(10, text => { parts.push(text); return true }).end('abcdef')
    expect(parts).toEqual(['abcdef'])
  })
  it('never splits surrogate pairs across capped requests or adjacent deltas', () => {
    const parts: string[] = []
    const feed = new ParagraphFeed(3, text => { parts.push(text); return true })
    feed.push('ab\uD83D')
    feed.push('\uDE00cd')
    feed.end('ab😀cd')
    expect(parts.join('')).toBe('ab😀cd')
    expect(parts.every(x => !/[\uD800-\uDBFF]$/.test(x))).toBe(true)
  })
  it('stops scheduling when persistence refuses a fragment', () => {
    const emit = vi.fn((_text: string, _offset: number) => false)
    const feed = new ParagraphFeed(4, emit)
    feed.push('x'.repeat(100000))
    feed.push('more')
    expect(emit).toHaveBeenCalledTimes(1)
    expect(emit.mock.calls[0]?.[0]).toHaveLength(4)
  })
  it('does not translate an inconsistent authoritative block twice', () => {
    const emit = vi.fn(() => true)
    const feed = new ParagraphFeed(100, emit)
    feed.push('original')
    feed.end('different')
    expect(emit).not.toHaveBeenCalled()
  })
  it('processes an arbitrarily long source without dropping a suffix', () => {
    const parts: string[] = []
    const source = '段落😀。\n\n'.repeat(400)
    const feed = new ParagraphFeed(16, text => { parts.push(text); return true })
    feed.push(source)
    feed.end(source)
    expect(parts.length).toBeGreaterThan(128)
    expect(parts.join('')).toBe(source)
  })
})

describe('serialized auxiliary queue', () => {
  it('records and flushes input before dispatch and records the actual result', async () => {
    const events: string[] = []
    const j = job({ start: async () => { await Promise.resolve(); events.push('flush') },
      translate: async () => { events.push('dispatch'); return '译文' },
      settle: async result => { events.push(result.status) } })
    const queue = new TranslationQueue()
    expect(queue.enqueue(j)).toBe(true)
    await queue.idle()
    expect(events).toEqual(['flush', 'dispatch', 'translated'])
  })
  it('never bills when durable request storage fails', async () => {
    const j = job({ start: async () => { throw new Error('disk') } })
    const queue = new TranslationQueue()
    queue.enqueue(j)
    await queue.idle()
    expect(j.translate).not.toHaveBeenCalled()
    expect(j.storageFailed).toHaveBeenCalledTimes(1)
  })
  it('reserves source order at admission even while a previous model call is blocked', async () => {
    let finish!: (text: string) => void
    const first = job({ translate: () => new Promise(resolve => { finish = resolve }) })
    const second = job()
    const queue = new TranslationQueue()
    queue.enqueue(first); queue.enqueue(second)
    expect(second.record).toHaveBeenCalledTimes(1)
    expect(second.translate).not.toHaveBeenCalled()
    await vi.waitFor(() => expect(finish).toBeTypeOf('function'))
    finish('ok'); await queue.idle()
  })
  it('keeps every queued fragment beyond the old caps and serializes calls', async () => {
    let resolveFirst!: (text: string) => void
    const first = job({ translate: () => new Promise(resolve => { resolveFirst = resolve }) })
    const queued = Array.from({ length: 160 }, () => job())
    const queue = new TranslationQueue()
    expect(queue.enqueue(first)).toBe(true)
    for (const next of queued) expect(queue.enqueue(next)).toBe(true)
    await vi.waitFor(() => expect(resolveFirst).toBeTypeOf('function'))
    for (const next of queued) expect(next.translate).not.toHaveBeenCalled()
    resolveFirst('译文')
    await queue.idle()
    for (const next of queued) expect(next.translate).toHaveBeenCalledTimes(1)
  })
  it('times out an adapter that ignores abort and never retries an unknown outcome', async () => {
    const results: TranslationResult[] = []
    const j = job({ settings: { ...job().settings, timeoutMs: 5 }, translate: () => new Promise(() => {}),
      settle: async r => { results.push(r) } })
    const queue = new TranslationQueue()
    queue.enqueue(j)
    await queue.idle()
    expect(results.map(x => x.status)).toEqual(['unconfirmed'])
    expect(j.start).toHaveBeenCalledTimes(1)
  })
  it('cancels active work and prevents queued dispatch on unload', async () => {
    const first = job({ translate: vi.fn(() => new Promise<string>(() => {})) })
    const second = job()
    const queue = new TranslationQueue()
    queue.enqueue(first); queue.enqueue(second)
    await vi.waitFor(() => expect(first.translate).toHaveBeenCalledTimes(1))
    await queue.dispose()
    expect(first.settle).toHaveBeenCalledWith(expect.objectContaining({ status: 'cancelled', text: '' }))
    expect(second.start).not.toHaveBeenCalled()
    expect(queue.enqueue(job())).toBe(false)
  })
  it('does not dispatch after cancellation during the durability barrier', async () => {
    const controller = new AbortController()
    const j = job({ signal: controller.signal, start: async () => { controller.abort() } })
    const queue = new TranslationQueue()
    queue.enqueue(j); await queue.idle()
    expect(j.translate).not.toHaveBeenCalled()
  })
  it.each(['', 'x'.repeat(101)])('does not label empty or oversized content as translated', async text => {
    const j = job({ translate: async () => text })
    const queue = new TranslationQueue()
    queue.enqueue(j); await queue.idle()
    expect(j.settle).toHaveBeenCalledWith(expect.objectContaining({ status: 'failed' }))
  })
  it('contains failures and never persists sensitive exception messages', async () => {
    const j = job({ translate: async () => { throw new Error('Authorization: DO-NOT-PERSIST') } })
    const queue = new TranslationQueue()
    queue.enqueue(j); await queue.idle()
    expect(JSON.stringify(vi.mocked(j.settle).mock.calls)).not.toContain('DO-NOT-PERSIST')
    expect(j.settle).toHaveBeenCalledWith(expect.objectContaining({ status: 'failed', text: '' }))
  })
})
