/** Prompt-only, provider-neutral progress guidance through DSH's logged context registry. */
import { readFileSync } from 'node:fs'
import type { Context, Volatile } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import type {} from '@deepseek-ai/dsh-system-prompt'

/** Default policy adapted from pinned Apache-2.0 Codex prompt excerpts. */
export const defaultPolicy = readFileSync(new URL('../prompts/commentary.md', import.meta.url), 'utf8').trim()

/** Fields editable from the standard Plugins configuration form. */
export interface Config {
  enabled: Volatile<boolean>
  language: Volatile<string>
  instructions: Volatile<string>
}

/** No provider or credential is needed: all text is generated in the main model's existing calls. */
export const Config = z.object({
  enabled: z.boolean().default(true).description('启用主模型自然语言进度说明').volatile(),
  language: z.string().default('跟随用户本轮使用的语言').description('进度说明的语言').volatile(),
  instructions: z.string().default(defaultPolicy).description('进度规则；留空时不注入').volatile(),
})

/** This plugin needs only the official prompt context registry. */
export const inject = ['systemPrompt']

/**
 * Register a required, durable runtime context so complete-persona presets cannot silently discard it.
 * @param ctx - Cordis lifecycle owner.
 * @param config - live fields captured by each prompt assembly, never by a separate model request.
 */
export function apply(ctx: Context, config: Config): void {
  ctx.effect(() => ctx.systemPrompt.context({
    name: 'dsh-progress-commentary',
    order: 700,
    required: true,
    interpolate: false,
    text: () => {
      if (!config.enabled.get()) return ''
      const policy = config.instructions.get().trim()
      if (!policy) return ''
      return `${policy}\n\nCommentary language preference: ${config.language.get()}`
    },
  }))
}
