// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createElement, type ComponentProps } from 'react'
import type { ConfigForm, ConfigFormSnapshot } from '@deepseek-ai/dsh-client-ui-settings/client'
import { TranslationSettings, routeKey, zh, type TranslationPreferences } from '../packages/dsh-reasoning-translation/src/settings.tsx'
import { TranslationRowView } from '../packages/dsh-reasoning-translation/src/client.ts'

afterEach(cleanup)
function setup(ok = true) {
  const snapshot: ConfigFormSnapshot<TranslationPreferences> = { status: 'ready', writable: true, revision: 7,
    value: { enabled: true, provider: 'old', model: 'old-model', targetLanguage: '简体中文' }, base: {}, user: {} }
  const form: ConfigForm<TranslationPreferences> = {
    getSnapshot() { expect(this).toBe(form); return snapshot }, subscribe() { expect(this).toBe(form); return () => {} },
    mutate: vi.fn(async () => ok), set: vi.fn(async () => true), unset: vi.fn(async () => true) }
  const loadModels = vi.fn(async () => ({ groups: [{ id: 'new', name: 'New provider', models: [{ id: 'new-model', name: 'New model' }] }], partial: false }))
  const watchModels = vi.fn(() => () => {})
  const t = ((key: keyof typeof zh) => zh[key]) as ComponentProps<typeof TranslationSettings>['t']
  render(createElement(TranslationSettings, { form, loadModels, watchModels, t }))
  return { form, loadModels }
}
it('shows the saved route and saves a catalog choice as one revision-fenced mutation', async () => {
  const { form } = setup()
  expect(screen.getByText('当前模型 · old / old-model')).toBeTruthy()
  await screen.findByText('New model')
  fireEvent.change(screen.getByLabelText('翻译模型'), { target: { value: routeKey('new', 'new-model') } })
  fireEvent.click(screen.getByText('保存'))
  await screen.findByText(zh.saved)
  expect(form.mutate).toHaveBeenCalledWith([
    { op: 'set', path: ['enabled'], value: true }, { op: 'set', path: ['provider'], value: 'new' },
    { op: 'set', path: ['model'], value: 'new-model' }, { op: 'set', path: ['targetLanguage'], value: '简体中文' },
  ], 7)
})
it('retains manual edits after a refused save and allows retry', async () => {
  const { form } = setup(false)
  fireEvent.change(screen.getByLabelText('模型 ID'), { target: { value: ' custom-id ' } })
  fireEvent.click(screen.getByText('保存'))
  await screen.findByRole('alert')
  expect((screen.getByLabelText('模型 ID') as HTMLInputElement).value).toBe(' custom-id ')
  expect(form.mutate).toHaveBeenCalledWith(expect.arrayContaining([{ op: 'set', path: ['model'], value: 'custom-id' }]), 7)
})
it('validates enabled routing before saving and can discard drafts', async () => {
  const { form } = setup()
  fireEvent.change(screen.getByLabelText('服务商路由'), { target: { value: '' } })
  fireEvent.click(screen.getByText('保存'))
  await screen.findByText(zh.required)
  expect(form.mutate).not.toHaveBeenCalled()
  fireEvent.click(screen.getByText('撤销修改'))
  expect((screen.getByLabelText('服务商路由') as HTMLInputElement).value).toBe('old')
  await waitFor(() => expect(screen.queryByText(zh.catalogLoading)).toBeNull())
})
it('renders safe Markdown as unboxed narration and hides provenance and original until expanded', () => {
  const props = { node: { data: { status: 'translated', text: '**进度**：检查 `config.ts`。\n\n<script>evil()</script>',
    source: '<script>original()</script>', provider: 'aux', model: 'model-id', language: 'zh' } },
    t: (key: string) => ({ title: '思考译文', original: '查看公开原文', copy: '复制', copied: '已复制', footnotes: '脚注' })[key as 'title'] ?? key,
  } as ComponentProps<typeof TranslationRowView>
  const { container } = render(createElement(TranslationRowView, props))
  expect(container.querySelector('strong')?.textContent).toBe('进度')
  expect(container.querySelector('code')?.textContent).toBe('config.ts')
  expect(container.querySelector('script')).toBeNull()
  expect(container.querySelector('section')?.style.borderInlineStart).toBe('')
  const details = container.querySelector('details')!
  expect(details.open).toBe(false)
  expect(details.textContent).toContain('aux / model-id')
  expect(details.textContent).toContain('<script>original()</script>')
})
