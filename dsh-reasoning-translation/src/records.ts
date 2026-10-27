/** Versioned, ignorable presentation records; none enter the main model's history. */
import type { SessionSeq } from '@deepseek-ai/dsh-session/types'

export const REQUEST = 'plugin:dsh-reasoning-translation/request'
export const RESULT = 'plugin:dsh-reasoning-translation/result'
export const PROGRESS = 'plugin:dsh-reasoning-translation/progress'
export const NOTICE = 'plugin:dsh-reasoning-translation/notice'

/** A translation is durably recorded before the auxiliary model receives its source. */
export interface TranslationRequest {
  version: 1
  id: string
  turn: number
  step: number
  provider: string
  model: string
  language: string
  source: string
  system: string
  maxTokens: number
}

/** Only successful, complete auxiliary responses are labelled translated. */
export interface TranslationResult {
  version: 1
  id: string
  status: 'translated' | 'failed' | 'cancelled' | 'unconfirmed'
  text: string
}

export interface TranslationProgress {
  version: 1
  id: string
  status: 'translating'
  text: string
}

/** A local resource limit skipped translation; it is not a model-generated announcement. */
export interface TranslationNotice {
  version: 1
  id: string
  turn: number
  step: number
  status: 'limited'
}

declare module '@deepseek-ai/dsh-session/types' {
  interface PluginRecordMap {
    'plugin:dsh-reasoning-translation/request': TranslationRequest
    'plugin:dsh-reasoning-translation/result': TranslationResult
    'plugin:dsh-reasoning-translation/progress': TranslationProgress
    'plugin:dsh-reasoning-translation/notice': TranslationNotice
  }
}

/** Validated presentation independent of the current plugin configuration. */
export interface TranslationRow {
  id: string
  seq: number
  turn: number
  step: number
  provider: string
  model: string
  language: string
  source: string
  text: string
  status: TranslationResult['status'] | 'pending' | 'limited' | 'translating'
}

type UnknownRecord = Record<string, unknown>
function object(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
function coordinate(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
}
function string(value: unknown, max: number): value is string {
  return typeof value === 'string' && value.length <= max
}

/** Parse stored JSON defensively; unsupported future versions and malformed records are ignored. */
export function parseRecord(event: unknown):
  | { kind: 'request'; seq: SessionSeq; data: TranslationRequest }
  | { kind: 'result'; seq: SessionSeq; data: TranslationResult }
  | { kind: 'progress'; seq: SessionSeq; data: TranslationProgress }
  | { kind: 'notice'; seq: SessionSeq; data: TranslationNotice }
  | undefined {
  if (!object(event) || event.ignorable !== true || !coordinate(event.seq) || !object(event.data)) return
  const d = event.data
  if (d.version !== 1 || !string(d.id, 512) || !d.id) return
  // SessionSeq is already validated above; no lossy conversion is performed.
  const seq = event.seq as SessionSeq
  if (event.type === PROGRESS) {
    if (d.status !== 'translating' || !string(d.text, 262144)) return
    return { kind: 'progress', seq, data: { version: 1, id: d.id, status: 'translating', text: d.text } }
  }
  if (event.type === RESULT) {
    if (!['translated', 'failed', 'cancelled', 'unconfirmed'].includes(String(d.status)) || !string(d.text, 262144)) return
    return { kind: 'result', seq, data: { version: 1, id: d.id, status: d.status as TranslationResult['status'], text: d.text } }
  }
  if (!coordinate(d.turn) || !coordinate(d.step)) return
  if (event.type === NOTICE && d.status === 'limited') {
    return { kind: 'notice', seq, data: { version: 1, id: d.id, turn: d.turn, step: d.step, status: 'limited' } }
  }
  if (event.type !== REQUEST || !string(d.provider, 512) || !string(d.model, 512)
    || !string(d.language, 128) || !string(d.source, 32768) || !string(d.system, 32768)
    || !coordinate(d.maxTokens) || d.maxTokens < 1) return
  return { kind: 'request', seq, data: { version: 1, id: d.id, turn: d.turn, step: d.step,
    provider: d.provider, model: d.model, language: d.language, source: d.source, system: d.system, maxTokens: d.maxTokens } }
}
