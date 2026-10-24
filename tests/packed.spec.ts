/** Install-payload smoke: actual npm tarballs and built Host exports, no network or inference. */
import { expect, it } from 'vitest'
import { spawnSync } from 'node:child_process'
import { mkdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { Context } from '@deepseek-ai/cordis'
import SystemPrompt, { renderContextSnapshot } from '@deepseek-ai/dsh-system-prompt'
import LlmRuntime from '@deepseek-ai/dsh-llm'
import SessionStore from '@deepseek-ai/dsh-session'

it.each(['dsh-progress-commentary', 'dsh-reasoning-translation'])('loads built %s from its npm installation payload', async name => {
  const directory = resolve('.checks/packed', name)
  mkdirSync(directory, { recursive: true })
  const unpack = spawnSync('tar', ['-xzf', resolve('dist', `${name}-0.1.0.tgz`), '-C', directory], { encoding: 'utf8' })
  expect(unpack.status).toBe(0)
  const root = resolve(directory, 'package')
  const manifest = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
  expect(manifest.dsh.bundle.patch).toBe('./cordis.patch.yml')
  expect(manifest.engines.dsh).toBe('0.2.1-rc.3')
  const plugin = await import(/* @vite-ignore */ pathToFileURL(resolve(root, 'lib/index.js')).href)
  const ctx = new Context()
  try {
    await ctx.plugin(SystemPrompt)
    await ctx.plugin(LlmRuntime)
    await ctx.plugin(SessionStore)
    await ctx.plugin(plugin)
    if (name.includes('progress')) expect(renderContextSnapshot(await ctx.systemPrompt.assemble())).toContain('Progress commentary')
    else expect(manifest.dsh.client.platform).toBe('web')
    expect(manifest.scripts?.postinstall).toBeUndefined()
  } finally { await ctx.fiber.dispose() }
})
