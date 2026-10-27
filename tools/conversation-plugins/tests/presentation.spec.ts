import { expect, it } from 'vitest'
import { runInNewContext } from 'node:vm'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import * as primitives from '@deepseek-ai/dsh-client-ui-primitives'
import { Context } from '@deepseek-ai/cordis'
import { ConversationNodeAssembler } from '@dsh-test/assembler'
import { ConversationEventRegistry } from '@dsh-test/event-registry'
import { ConversationViewRegistry } from '@dsh-test/view-registry'
import type { ConversationViewNode } from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { SessionEvent } from '@deepseek-ai/dsh-session/types'
import { translationDefinition } from '../../../dsh-reasoning-translation/src/client.ts'
import { parseRecord, REQUEST, RESULT, PROGRESS, type TranslationRow } from '../../../dsh-reasoning-translation/src/records.ts'

const source = { version: 1, id: 'same-key', turn: 1, step: 1, provider: 'aux', model: 'other', language: 'zh',
  source: '<script>untrusted source</script>', system: 'Translate', maxTokens: 100 }
function event(type: string, seq: number, data: object): SessionEvent {
  // The real wire preserves unknown ignorable plugin records; parsing them is the plugin's job.
  return { type, seq, time: 123, ignorable: true, data } as SessionEvent
}

it('updates one live row, keeps it outside process folding, and recreates the same row after JSON replay', async () => {
  const ctx = new Context()
  try {
    const defs = new ConversationEventRegistry(ctx)
    const views = new ConversationViewRegistry(ctx)
    defs.register(translationDefinition)
    views.register({ target: 'chat', create() {
      let nodes: readonly ConversationViewNode[] = []
      return { empty: [], replace(input) { nodes = input.nodes; return nodes },
        apply(input) { const map = new Map(nodes.map(n => [n.key, n])); for (const n of input.upserts) map.set(n.key, n); nodes = [...map.values()]; return nodes } }
    } })
    const assembler = new ConversationNodeAssembler(defs, views)
    assembler.activateTarget('chat')
    const first = event(REQUEST, 0, source)
    const last = event(RESULT, 2, { version: 1, id: 'same-key', status: 'translated', text: '译文' })
    assembler.append({ type: 'event', event: first }); assembler.flush()
    const snapshot = () => assembler.snapshot('chat') as readonly (ConversationViewNode & { groupTree: string; data: TranslationRow })[]
    const key = snapshot()[0]?.key
    assembler.append({ type: 'event', event: event(PROGRESS, 1, { version: 1, id: 'same-key', status: 'translating', text: '译' }) }); assembler.flush()
    expect(snapshot()[0]?.data.text).toBe('译')
    expect(snapshot()[0]?.data.status).toBe('translating')
    expect(snapshot()[0]?.key).toBe(key)
    assembler.append({ type: 'event', event: last }); assembler.flush()
    expect(snapshot()).toHaveLength(1)
    expect(snapshot()[0]?.key).toBe(key)
    expect(snapshot()[0]?.groupTree).toBe('turn')
    expect(snapshot()[0]?.data.text).toBe('译文')
    const replay = JSON.parse(JSON.stringify([first, event(PROGRESS, 1, { version: 1, id: 'same-key', status: 'translating', text: '译' }), { ...last, seq: 2 }])) as SessionEvent[]
    assembler.replaceWindow(replay.map(event => ({ type: 'event' as const, event })), false); assembler.flush()
    expect(snapshot()).toHaveLength(1)
    expect(snapshot()[0]?.data.status).toBe('translated')
    expect(snapshot()[0]?.data.source).toBe(source.source)
  } finally { await ctx.fiber.dispose() }
})

it('ignores malformed records and unknown future versions', () => {
  expect(parseRecord(event(REQUEST, 0, { ...source, version: 2 }))).toBeUndefined()
  expect(parseRecord(event(REQUEST, -1, source))).toBeUndefined()
  expect(parseRecord(event(REQUEST, 0, { ...source, source: 'x'.repeat(32769) }))).toBeUndefined()
  expect(parseRecord({ type: REQUEST, seq: 0, data: source })).toBeUndefined()
})

it('does not treat an old incomplete request as permission to redispatch', () => {
  const parsed = parseRecord(event(REQUEST, 0, source))
  expect(parsed?.kind).toBe('request')
  // This parser and projection have no model, network or tool dispatcher.
  expect(translationDefinition.match(event(REQUEST, 0, source))).toEqual({ id: 'same-key', role: 'start' })
})

it('built browser file registers lazily and uses the shared React and Markdown runtimes', () => {
  const load: { id: string; factory(require: (id: string) => unknown): { apply: unknown } }[] = []
  const script = readFileSync('../../dsh-reasoning-translation/lib/client.js', 'utf8')
  runInNewContext(script, { window: { __ModuleLoader__: { load: (item: typeof load[number]) => load.push(item) } } })
  expect(load).toHaveLength(1)
  expect(load[0]?.id).toBe('dsh-reasoning-translation')
  const require = createRequire(import.meta.url)
  expect(typeof load[0]?.factory(id => id === '@deepseek-ai/dsh-client-ui-primitives' ? primitives : require(id)).apply).toBe('function')
})
