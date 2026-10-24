/** Bounded translation queue and paragraph feeder, independent of Cordis and model providers. */
import type { TranslationRequest, TranslationResult } from './records.ts'

/** One immutable configuration snapshot for a source fragment. */
export interface TranslationSettings {
  provider: string
  model: string
  language: string
  maxTokens: number
  timeoutMs: number
  maxOutputChars: number
}

/** Adapter effects supplied by the Host; request persistence must succeed before dispatch. */
export interface TranslationJob {
  request: TranslationRequest
  settings: TranslationSettings
  signal: AbortSignal
  record(): void
  start(): Promise<void>
  settle(result: TranslationResult): Promise<void>
  translate(request: TranslationRequest, signal: AbortSignal): Promise<string>
  storageFailed(): void
}

/** Serialized auxiliary calls with bounded admission and no retries. */
export class TranslationQueue {
  private readonly pending = new Set<Promise<void>>()
  private tail: Promise<void> = Promise.resolve()
  private disposed = false
  private readonly lifetime = new AbortController()
  constructor(private readonly maxPending: number) {}

  /** Reserve one queue slot; false means no request was sent or recorded. */
  enqueue(job: TranslationJob): boolean {
    if (this.disposed || this.pending.size >= this.maxPending) return false
    // Source frames arrive outside Session publication. Reserve the Chat position now, not when a
    // slow translation frees the queue, which could otherwise place this source in a later turn.
    try { job.record() } catch (_error) { job.storageFailed(); return false }
    const task = this.tail.then(() => this.run(job))
    this.pending.add(task)
    this.tail = task.catch(() => { /* run contains failures; preserve queue availability if an effect throws. */ })
    void task.then(() => this.pending.delete(task), () => this.pending.delete(task))
    return true
  }

  /** Wait for accepted jobs; tests and lifecycle teardown use the same drain. */
  async idle(): Promise<void> { await Promise.allSettled([...this.pending]) }

  /** Stop admission and abort active work; queued jobs never reach the model. */
  async dispose(): Promise<void> {
    this.disposed = true
    this.lifetime.abort()
    await this.idle()
  }

  private async run(job: TranslationJob): Promise<void> {
    const signal = AbortSignal.any([job.signal, this.lifetime.signal])
    const cancelled = async (): Promise<void> => {
      try { await job.settle({ version: 1, id: job.request.id, status: 'cancelled', text: '' }) }
      catch (_error) { job.storageFailed() }
    }
    if (signal.aborted) { await cancelled(); return }
    try { await job.start() } catch (_error) { job.storageFailed(); return }
    if (signal.aborted) { await cancelled(); return }
    const timer = new AbortController()
    const timeout = setTimeout(() => timer.abort(), job.settings.timeoutMs)
    const combined = AbortSignal.any([signal, timer.signal])
    let abortListener: (() => void) | undefined
    const interrupted = new Promise<never>((_resolve, reject) => {
      abortListener = () => reject(new Error('Translation interrupted'))
      combined.addEventListener('abort', abortListener, { once: true })
      if (combined.aborted) abortListener()
    })
    let result: TranslationResult
    try {
      const text = await Promise.race([job.translate(job.request, combined), interrupted])
      if (combined.aborted) throw new Error('Translation interrupted')
      if (!text.trim() || text.length > job.settings.maxOutputChars) throw new Error('Invalid translation response')
      result = { version: 1, id: job.request.id, status: 'translated', text }
    } catch (_error) {
      // Do not store exception messages: provider errors can contain URLs, source text or credentials.
      result = { version: 1, id: job.request.id,
        status: timer.signal.aborted ? 'unconfirmed' : signal.aborted ? 'cancelled' : 'failed', text: '' }
    } finally {
      clearTimeout(timeout)
      if (abortListener) combined.removeEventListener('abort', abortListener)
    }
    try { await job.settle(result) } catch (_error) { job.storageFailed() }
  }
}

/** A source prefix bounded independently of the total reasoning stream. */
export class ParagraphFeed {
  private pending = ''
  private observed = ''
  private offset = 0
  private stopped = false
  constructor(private readonly maxChars: number, private readonly maxSourceChars: number,
    private readonly emit: (text: string, offset: number) => boolean,
    private readonly truncated: () => void = () => {}) {}

  /** Feed only publicly emitted reasoning deltas; tool arguments and normal response text never enter. */
  push(text: string): void {
    if (this.stopped) return
    const room = this.maxSourceChars - this.observed.length
    const admitted = text.slice(0, room)
    this.observed += admitted
    this.pending += admitted
    this.flush(false)
    if (text.length > room) { this.finish(); this.truncated() }
  }

  /** A provider may emit only block-end; reconcile missing trailing deltas without translating prefixes twice. */
  end(completeText: string): void {
    if (this.stopped) return
    if (!completeText.startsWith(this.observed)) { this.stopped = true; return }
    this.push(completeText.slice(this.observed.length))
    this.finish()
  }

  /** Publish a remaining safe prefix, for normal block completion only. */
  private finish(): void { this.flush(true); this.stopped = true }

  private flush(final: boolean): void {
    while (this.pending) {
      const paragraph = this.pending.indexOf('\n\n')
      let length = paragraph >= 0 ? paragraph + 2 : final ? this.pending.length : 0
      if (!length && this.pending.length < this.maxChars) return
      length = Math.min(length || this.maxChars, this.maxChars)
      // Never split a UTF-16 surrogate pair, including when a delta ends between its code units.
      const last = this.pending.charCodeAt(length - 1)
      if (last >= 0xD800 && last <= 0xDBFF) length -= 1
      if (length === 0) return
      const part = this.pending.slice(0, length)
      this.pending = this.pending.slice(length)
      const offset = this.offset
      this.offset += length
      if (part.trim() && !this.emit(part, offset)) { this.stopped = true; this.pending = ''; return }
    }
  }
}
