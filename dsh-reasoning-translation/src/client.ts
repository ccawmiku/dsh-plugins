/** Chat-node projection of durable translation records using the existing conversation assembly. */
import { createElement, useMemo } from 'react'
import { MarkdownText } from '@deepseek-ai/dsh-client-ui-primitives'
import type { Context } from '@deepseek-ai/cordis'
import type { ConversationNodeDefinition } from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { ChatNodeViewProps } from '@deepseek-ai/dsh-client-ui-chat/client'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import { parseRecord, type TranslationRow } from './records.ts'
import { mountSettings } from './settings.tsx'

const NS = 'dshReasoningTranslation'
const zh = {
  title: '思考译文', original: '查看公开原文', pending: '等待译文…',
  failed: '翻译失败；公开原文仍可查看。', cancelled: '翻译已取消。',
  unconfirmed: '翻译超时，服务端结果未知；不会自动重试。', limited: '已达翻译调用或队列上限；后续公开思考未翻译。',
  copy: '复制', copied: '已复制', footnotes: '脚注',
  translating: '翻译中…',
}
const en: typeof zh = {
  title: 'Reasoning translation', original: 'View public original', pending: 'Waiting for translation…',
  failed: 'Translation failed. The public original is still available.', cancelled: 'Translation cancelled.',
  unconfirmed: 'Translation timed out; server outcome unknown. No automatic retry.', limited: 'Translation call or queue limit reached. Later public reasoning was not translated.',
  copy: 'Copy', copied: 'Copied', footnotes: 'Footnotes',
  translating: 'Translating…',
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
    return { id: record.data.id, role: record.kind === 'result' || record.kind === 'progress' ? 'update' : 'start' }
  },
  start(_context, match) {
    const record = parseRecord(match.event)
    if (!record || record.kind === 'result' || record.kind === 'progress') throw new Error('Translation row requires a request or limit notice')
    if (record.kind === 'notice') return { id: record.data.id, seq: record.seq,
      turn: record.data.turn, step: record.data.step, provider: '', model: '', language: '', source: '', text: '', status: 'limited' }
    const d = record.data
    return { id: d.id, seq: record.seq, turn: d.turn, step: d.step, provider: d.provider,
      model: d.model, language: d.language, source: d.source, text: '', status: 'pending' }
  },
  update(context, match) {
    const record = parseRecord(match.event)
    return record?.kind === 'result' || record?.kind === 'progress'
      ? { ...context.state, status: record.data.status, text: record.data.text } : context.state
  },
  buildViewNode(context) {
    if (!context.state) return null
    return { key: context.key, kind: 'dsh-reasoning-translation', id: context.id,
      target: 'chat', anchorSeq: context.state.seq,
      location: context.start?.location ?? context.matches[0]?.location ?? { kind: 'unresolved' },
      visibility: 'visible', groupTree: 'turn', data: context.state }
  },
}

/** Use DSH's safe Markdown and typography, with quiet provenance below the narration. */
export function TranslationRowView({ node, t }: Omit<ChatNodeViewProps<'dsh-reasoning-translation'>, 't'> & PropsLocale<typeof NS>) {
  const d = node.data
  const hasText = d.status === 'translated' || d.status === 'translating'
  const body = d.status === 'translated' || d.status === 'translating' ? d.text : t(d.status)
  const labels = useMemo(() => ({ code: { copyLabel: t('copy'), copiedLabel: t('copied') }, footnotes: t('footnotes') }), [t])
  const quiet = { color: 'var(--dsw-alias-label-tertiary, #888)', fontSize: '12px', lineHeight: '20px' }
  return createElement('section', {
    'data-dsh-reasoning-translation': d.status,
    style: { margin: '12px 0 18px', minWidth: 0, overflowWrap: 'anywhere',
      fontSize: 'var(--dsh-content-font-size, 14px)', lineHeight: 'calc(24px + var(--dsh-content-font-delta, 0px))',
      color: 'var(--dsw-alias-label-primary, inherit)' },
  }, hasText ? createElement(MarkdownText, { text: body, labels, streaming: d.status === 'translating' })
    : createElement('div', { style: quiet, role: 'status' }, body),
  d.source ? createElement('details', { style: { marginTop: '6px' } },
    createElement('summary', { style: { ...quiet, cursor: 'pointer', width: 'fit-content' },
      title: t('original') }, d.status === 'translating' ? `${t('translating')} · ${t('title')}` : t('title')),
    createElement('div', { style: { ...quiet, marginTop: '8px' } }, `${d.provider} / ${d.model} · ${d.language}`),
    createElement('pre', { style: { whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', fontFamily: 'inherit',
      color: 'var(--dsw-alias-label-secondary, #aaa)', margin: '6px 0', fontSize: '13px' } }, d.source)) : null)
}

export const inject = ['uiConversation', 'slots', 'locale']

/** Register the public extension points; all UI disappears on unload without deleting stored originals. */
export function apply(ctx: Context): void {
  ctx.effect(() => ctx.locale.register(NS, { en, zh }))
  ctx.effect(() => ctx.uiConversation.events.register(translationDefinition))
  ctx.slots.inject('conversation.chat.node', () => ctx.slots.register({
    name: 'conversation.chat.node', key: 'dsh-reasoning-translation', locale: NS,
  }, TranslationRowView))
  ctx.inject(['configForms', 'remote', 'remote.session'], child => mountSettings(child))
}
