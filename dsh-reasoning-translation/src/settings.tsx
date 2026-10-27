/** A native Settings page; reads model names only and writes the existing plugin Config atomically. */
import React, { useCallback, useEffect, useState, useSyncExternalStore, type CSSProperties } from 'react'
import type { Context } from '@deepseek-ai/cordis'
import type { ConfigForm } from '@deepseek-ai/dsh-client-ui-settings/client'
import type { ModelProviderGroup } from '@deepseek-ai/dsh-api-remotes/client'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'

export const SETTINGS_NS = 'dshReasoningTranslationSettings'
export const ENTRY = 'dsh-reasoning-translation'
export interface TranslationPreferences { enabled: boolean; provider: string; model: string; targetLanguage: string }
export const zh = {
  title: '思考翻译', description: '把公开思考译成聊天中的自然段落，随工具过程持续显示。',
  enabled: '启用思考翻译', model: '翻译模型', choose: '选择已配置的模型', manual: '手动填写模型',
  provider: '服务商路由', modelId: '模型 ID', language: '目标语言', refresh: '刷新模型列表',
  save: '保存', saving: '正在保存…', saved: '已保存，新片段立即使用新配置。',
  failed: '保存失败或配置已改变。请检查当前配置后重试。',
  loading: '正在读取配置…', unavailable: '插件配置暂不可用。', catalogFailed: '部分模型未能读取，仍可手动填写路由与模型 ID。',
  catalogLoading: '正在读取模型列表…', required: '请填写服务商路由、模型 ID 和目标语言。',
  note: '复用 DSH 已保存的服务商凭证。翻译会产生额外模型请求；不限制翻译条数，按顺序处理所有新片段。',
  current: '当前模型', missing: '尚未选择', reset: '撤销修改',
}
type Key = keyof typeof zh
const en: Record<Key, string> = {
  title: 'Reasoning translation', description: 'Translate public reasoning into narration alongside tool activity.',
  enabled: 'Enable reasoning translation', model: 'Translation model', choose: 'Choose a configured model', manual: 'Enter a model manually',
  provider: 'Provider route', modelId: 'Model ID', language: 'Target language', refresh: 'Refresh models',
  save: 'Save', saving: 'Saving…', saved: 'Saved. New fragments use these settings immediately.',
  failed: 'Save failed or settings changed. Check the current configuration and retry.',
  loading: 'Loading settings…', unavailable: 'Plugin settings are unavailable.', catalogFailed: 'Some models could not be loaded. You can still enter the route and model ID.',
  catalogLoading: 'Loading models…', required: 'Enter a provider route, model ID and target language.',
  note: 'Uses credentials already saved in DSH. Translation adds model requests. All new fragments are queued without a count limit.',
  current: 'Current model', missing: 'None selected', reset: 'Discard changes',
}
declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap { dshReasoningTranslationSettings: Key }
}
export function routeKey(provider: string, model: string): string { return JSON.stringify([provider, model]) }
export function preferenceOps(value: TranslationPreferences) {
  return Object.entries({ enabled: value.enabled, provider: value.provider.trim(), model: value.model.trim(), targetLanguage: value.targetLanguage.trim() })
    .map(([key, value]) => ({ op: 'set' as const, path: [key], value }))
}
interface SettingsFace {
  form: ConfigForm<TranslationPreferences>
  loadModels(): Promise<{ groups: readonly ModelProviderGroup[]; partial: boolean }>
  watchModels(refresh: () => void): () => void
}
const control: CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '8px',
  border: '1px solid var(--dsw-alias-border-primary, #555)', background: 'var(--dsw-alias-interactive-bg-hover, transparent)', color: 'inherit', font: 'inherit' }
const button: CSSProperties = { ...control, width: 'auto', cursor: 'pointer' }
const field: CSSProperties = { display: 'grid', gap: '8px' }

export function TranslationSettings({ form, loadModels, watchModels, t }: SettingsFace & PropsLocale<typeof SETTINGS_NS>) {
  const snapshot = useSyncExternalStore(useCallback(listener => form.subscribe(listener), [form]), useCallback(() => form.getSnapshot(), [form]))
  const [draft, setDraft] = useState<{ value: TranslationPreferences; revision: number | undefined } | null>(null)
  const [groups, setGroups] = useState<readonly ModelProviderGroup[]>([])
  const [catalog, setCatalog] = useState<'loading' | 'ready' | 'partial'>('loading')
  const [refresh, setRefresh] = useState(0)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<'saved' | 'failed' | 'required' | null>(null)
  useEffect(() => watchModels(() => setRefresh(n => n + 1)), [watchModels])
  useEffect(() => {
    let active = true
    setCatalog('loading')
    void loadModels().then(result => {
      if (!active) return
      setGroups(result.groups); setCatalog(result.partial ? 'partial' : 'ready')
    }, () => { if (active) { setGroups([]); setCatalog('partial') } })
    return () => { active = false }
  }, [loadModels, refresh])
  if (snapshot.status !== 'ready' || !snapshot.value) return <p role="status">{t(snapshot.status === 'loading' ? 'loading' : 'unavailable')}</p>
  const value = draft?.value ?? snapshot.value
  const locked = !snapshot.writable || saving
  const edit = (patch: Partial<TranslationPreferences>) => {
    setDraft({ value: { ...value, ...patch }, revision: draft?.revision ?? snapshot.revision }); setMessage(null)
  }
  const known = groups.some(g => g.id === value.provider && g.models.some(m => m.id === value.model))
  const save = async () => {
    if (!draft || locked) return
    if (value.enabled && (!value.provider.trim() || !value.model.trim() || !value.targetLanguage.trim())) { setMessage('required'); return }
    setSaving(true); setMessage(null)
    try {
      const accepted = await form.mutate(preferenceOps(value), draft.revision)
      if (accepted) { setDraft(null); setMessage('saved') } else setMessage('failed')
    } catch { setMessage('failed') }
    finally { setSaving(false) }
  }
  return <form onSubmit={event => { event.preventDefault(); void save() }} style={{ display: 'grid', gap: '24px', maxWidth: '680px', padding: '8px 0' }}>
    <header><h2 style={{ margin: '0 0 8px', fontSize: '20px' }}>{t('title')}</h2><p style={{ margin: 0, color: 'var(--dsw-alias-label-secondary, #aaa)' }}>{t('description')}</p></header>
    <label style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><input type="checkbox" checked={value.enabled} disabled={locked} onChange={e => edit({ enabled: e.target.checked })} />{t('enabled')}</label>
    <div style={{ color: 'var(--dsw-alias-label-secondary, #aaa)', overflowWrap: 'anywhere' }}>{t('current')} · {value.model ? `${value.provider} / ${value.model}` : t('missing')}</div>
    <label style={field}>{t('model')}<select style={control} disabled={locked} value={known ? routeKey(value.provider, value.model) : ''} onChange={e => {
      if (!e.target.value) return
      const [provider, model] = JSON.parse(e.target.value) as [string, string]; edit({ provider, model })
    }}><option value="">{value.model ? t('manual') : t('choose')}</option>{groups.map(group => <optgroup key={group.id} label={group.name}>{group.models.map(model => <option key={model.id} value={routeKey(group.id, model.id)}>{model.name || model.id}</option>)}</optgroup>)}</select></label>
    <div><button type="button" style={button} disabled={catalog === 'loading'} onClick={() => setRefresh(n => n + 1)}>{t('refresh')}</button>
      {catalog !== 'ready' && <p role="status">{t(catalog === 'loading' ? 'catalogLoading' : 'catalogFailed')}</p>}</div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
      <label style={field}>{t('provider')}<input style={control} value={value.provider} maxLength={512} disabled={locked} onChange={e => edit({ provider: e.target.value })} /></label>
      <label style={field}>{t('modelId')}<input style={control} value={value.model} maxLength={512} disabled={locked} onChange={e => edit({ model: e.target.value })} /></label>
    </div>
    <label style={field}>{t('language')}<input style={control} value={value.targetLanguage} maxLength={128} disabled={locked} onChange={e => edit({ targetLanguage: e.target.value })} /></label>
    <p style={{ margin: 0, color: 'var(--dsw-alias-label-secondary, #aaa)', lineHeight: 1.7 }}>{t('note')}</p>
    <div style={{ display: 'flex', gap: '12px' }}><button type="submit" style={button} disabled={!draft || locked}>{t(saving ? 'saving' : 'save')}</button>
      <button type="button" style={button} disabled={!draft || saving} onClick={() => { setDraft(null); setMessage(null) }}>{t('reset')}</button></div>
    {message && <p role={message === 'saved' ? 'status' : 'alert'}>{t(message)}</p>}
  </form>
}

export function mountSettings(ctx: Context): void {
  ctx.effect(() => ctx.locale.register(SETTINGS_NS, { zh, en }))
  const t = ctx.locale.bind(SETTINGS_NS)
  const face: SettingsFace = {
    form: ctx.configForms.get<TranslationPreferences>(ENTRY),
    async loadModels() {
      const result = await ctx.remote.session.modelCatalog()
      if (!result.ok) throw new Error('Model catalog unavailable')
      return { groups: result.value.groups, partial: result.value.failures.length > 0 }
    },
    watchModels(refresh) {
      const off = [ctx.remote.$on('llm/adapters-updated', refresh), ctx.remote.$on('settings/document-updated', refresh), ctx.on('connection/reset', refresh)]
      return () => { for (const dispose of off) dispose() }
    },
  }
  ctx.effect(() => ctx.configForms.whileServed([ENTRY], () => ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section', id: ENTRY, order: 35, label: () => t('title'), locale: SETTINGS_NS, inject: () => face,
  }, TranslationSettings))))
}
