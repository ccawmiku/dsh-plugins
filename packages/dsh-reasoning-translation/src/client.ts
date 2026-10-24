/** Chat-node projection of durable translation records using the existing conversation assembly. */
import { createElement } from 'react'
import type { Context } from '@deepseek-ai/cordis'
import type { ConversationNodeDefinition } from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { ChatNodeViewProps } from '@deepseek-ai/dsh-client-ui-chat/client'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import { parseRecord, type TranslationRow } from './records.ts'

const NS = 'dshReasoningTranslation'
const zh = {
  title: '思考译文', original: '查看公开原文', pending: '翻译已排队／发起，结果待确认；不会自动重试。',
  failed: '翻译失败；公开原文仍可查看。', cancelled: '翻译已取消。',
  unconfirmed: '翻译超时，服务端结果未知；不会自动重试。', limited: '已达翻译调用或队列上限；后续公开思考未翻译。',
}
const en: typeof zh = {
  title: 'Reasoning translation', original: 'View public original', pending: 'Translation queued/requested; result unconfirmed. No automatic retry.',
  failed: 'Translation failed. The public original is still available.', cancelled: 'Translation cancelled.',
  unconfirmed: 'Translation timed out; server outcome unknown. No automatic retry.', limited: 'Translation call or queue limit reached. Later public reasoning was not translated.',
}
type Key = keyof typeof zh

declare module '@deepseek-ai/dsh-client-ui-chat/client' {
  interface ChatNodeDataMap { 'dsh-reasoning-translation': TranslationRow }
}
declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap { dshReasoningTranslation: Key }
}

/** One request owns one stable row; results update that row during streaming and replay. */
export const translationDefinition: ConversationNodeDefinition<TranslationRow> = {
  kind: 'dsh-reasoning-translation', target: 'chat',
  match(event) {
    const record = parseRecord(event)
    if (!record) return null
    return { id: record.data.id, role: record.kind === 'result' ? 'update' : 'start' }
  },
  start(_context, match) {
    const record = parseRecord(match.event)
    if (!record || record.kind === 'result') throw new Error('Translation row requires a request or limit notice')
    if (record.kind === 'notice') return { id: record.data.id, seq: record.seq,
      turn: record.data.turn, step: record.data.step, provider: '', model: '', language: '', source: '', text: '', status: 'limited' }
    const d = record.data
    return { id: d.id, seq: record.seq, turn: d.turn, step: d.step, provider: d.provider,
      model: d.model, language: d.language, source: d.source, text: '', status: 'pending' }
  },
  update(context, match) {
    const record = parseRecord(match.event)
    return record?.kind === 'result' ? { ...context.state, status: record.data.status, text: record.data.text } : context.state
  },
  buildViewNode(context) {
    if (!context.state) return null
    return { key: context.key, kind: 'dsh-reasoning-translation', id: context.id,
      target: 'chat', anchorSeq: context.state.seq,
      location: context.start?.location ?? context.matches[0]?.location ?? { kind: 'unresolved' },
      visibility: 'visible', groupTree: 'turn', data: context.state }
  },
}

/** Render as text, not HTML; mark the auxiliary source and retain the original in a disclosure. */
export function TranslationRowView({ node, t }: Omit<ChatNodeViewProps<'dsh-reasoning-translation'>, 't'> & PropsLocale<typeof NS>) {
  const d = node.data
  const body = d.status === 'translated' ? d.text : t(d.status)
  return createElement('section', {
    'data-dsh-reasoning-translation': d.status,
    style: { margin: '8px 0', padding: '8px 12px', borderInlineStart: '2px solid currentColor', opacity: 0.85 },
  }, createElement('small', null, `${t('title')}${d.model ? ` · ${d.provider} / ${d.model} · ${d.language}` : ''}`),
  createElement('div', { style: { whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' } }, body),
  d.source ? createElement('details', null, createElement('summary', null, t('original')),
    createElement('pre', { style: { whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' } }, d.source)) : null)
}

export const inject = ['uiConversation', 'slots', 'locale']

/** Register the public extension points; all UI disappears on unload without deleting stored originals. */
export function apply(ctx: Context): void {
  ctx.effect(() => ctx.locale.register(NS, { en, zh }))
  ctx.effect(() => ctx.uiConversation.events.register(translationDefinition))
  ctx.slots.inject('conversation.chat.node', () => ctx.slots.register({
    name: 'conversation.chat.node', key: 'dsh-reasoning-translation', locale: NS,
  }, TranslationRowView))
}
