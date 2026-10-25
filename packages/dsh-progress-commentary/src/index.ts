/** Prompt-only, provider-neutral progress guidance through DSH's logged context registry. */
import { readFileSync } from 'node:fs'
import type { Context, Volatile } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import type {} from '@deepseek-ai/dsh-system-prompt'
import type {} from '@deepseek-ai/dsh-agent'
import type { Session } from '@deepseek-ai/dsh-session'

/** Default policy adapted from pinned Apache-2.0 Codex prompt excerpts. */
export const defaultPolicy = readFileSync(new URL('../prompts/commentary.md', import.meta.url), 'utf8').trim()

/** Fields editable from the standard Plugins configuration form. */
export interface Config {
  enabled: Volatile<boolean>
  language: Volatile<string>
  instructions: Volatile<string>
  silenceReminders: Volatile<boolean>
  intervalSeconds: Volatile<number>
}

/** No provider or credential is needed: all text is generated in the main model's existing calls. */
export const Config = z.object({
  enabled: z.boolean().default(true).description('启用主模型自然语言进度说明').volatile(),
  language: z.string().default('跟随用户本轮使用的语言').description('进度说明的语言').volatile(),
  instructions: z.string().default(defaultPolicy).description('进度规则；留空时不注入').volatile(),
  silenceReminders: z.boolean().default(false).description('可选沉默提醒；默认关闭，仅按发现、阶段变化与阻碍自然播报').volatile(),
  intervalSeconds: z.natural().min(30).max(86400).default(180).description('开启沉默提醒后生效的间隔（秒）；仅在下一次已有模型响应前提醒，不创建定时请求').volatile(),
})

/** This plugin needs only the official prompt context registry. */
export const inject = ['systemPrompt']

/**
 * Register a required, durable runtime context so complete-persona presets cannot silently discard it.
 * @param ctx - Cordis lifecycle owner.
 * @param config - live fields captured by each prompt assembly, never by a separate model request.
 */
export function apply(ctx: Context, config: Config): void {
  // Track only actual public assistant text. Reasoning, translations and injected reminders do not
  // satisfy the update. A WeakMap keeps simultaneous parent/child Sessions independent without leaks.
  const activity = new WeakMap<Session, { turn: number; lastTextAt: number }>()
  ctx.on('session/event', (session, event) => {
    if (event.type === 'turn/start') activity.set(session, { turn: event.data.turn, lastTextAt: Date.now() })
    else if (event.type === 'turn/end') activity.delete(session)
    else if (event.type === 'assistant/message') {
      if (event.data.message.content.some(block => block.type === 'text' && block.text.trim())) {
        activity.set(session, { turn: event.data.turn, lastTextAt: Date.now() })
      }
    }
  })
  ctx.effect(() => ctx.systemPrompt.context({
    name: 'dsh-progress-commentary',
    order: 700,
    required: true,
    interpolate: false,
    text: ({ agent }) => {
      if (!config.enabled.get()) return ''
      const policy = config.instructions.get().trim()
      if (!policy) return ''
      const state = agent && activity.get(agent.session)
      const due = config.silenceReminders.get() && state && Date.now() - state.lastTextAt >= config.intervalSeconds.get() * 1000
      const reminder = due
        ? '\n\nProgress update due: the user has not heard from you for a while. Give one short, natural update grounded in the work so far: a useful finding, a changed approach, a blocker, or the question you are resolving and why it matters. Group related checks instead of announcing individual reads, searches or commands. If there is no new result, say what remains unresolved without inventing progress. Continue with the actual tools if needed; if finished, answer normally. Do not mention the reminder or elapsed interval.'
        : ''
      return `${policy}\n\nCommentary language preference: ${config.language.get()}${reminder}`
    },
  }))
}
