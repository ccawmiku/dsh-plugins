import { expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import SystemPrompt, { renderContextSnapshot, renderPrompt } from '@deepseek-ai/dsh-system-prompt'
import * as Progress from '../packages/dsh-progress-commentary/src/index.ts'

it('works with a complete persona and suppressed optional context, and unregisters on unload', async () => {
  const ctx = new Context()
  try {
    await ctx.plugin(SystemPrompt, { includeRuntimeContext: false })
    ctx.systemPrompt.section({ name: 'test-complete', order: 0, complete: true, text: 'Full persona.' })
    const plugin = await ctx.plugin(Progress)
    const assembly = await ctx.systemPrompt.assemble()
    expect(renderPrompt(assembly)).toBe('Full persona.')
    expect(renderContextSnapshot(assembly)).toContain('Progress commentary')
    expect(renderContextSnapshot(assembly)).toContain('ordinary assistant text')
    expect(assembly.tools).toEqual([])
    await plugin.dispose()
    expect(renderContextSnapshot(await ctx.systemPrompt.assemble())).not.toContain('Progress commentary')
  } finally { await ctx.fiber.dispose() }
})

it('can be disabled without requiring an LLM service', async () => {
  const ctx = new Context()
  try {
    await ctx.plugin(SystemPrompt)
    await ctx.plugin(Progress, { enabled: false })
    expect(renderContextSnapshot(await ctx.systemPrompt.assemble())).not.toContain('Progress commentary')
  } finally { await ctx.fiber.dispose() }
})

it('preserves literal braces in custom instructions and uses the configured language', async () => {
  const ctx = new Context()
  try {
    await ctx.plugin(SystemPrompt)
    await ctx.plugin(Progress, { instructions: 'Literal {{not_a_prompt_variable}}', language: '简体中文' })
    const text = renderContextSnapshot(await ctx.systemPrompt.assemble())
    expect(text).toContain('{{not_a_prompt_variable}}')
    expect(text).toContain('简体中文')
  } finally { await ctx.fiber.dispose() }
})
