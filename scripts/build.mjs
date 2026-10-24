/** Produce Node ESM and DSH's documented lazy-CJS browser factory without bundling framework identities. */
import { build } from 'esbuild'
import { mkdir, readFile, rm } from 'node:fs/promises'
import { resolve } from 'node:path'

for (const name of ['dsh-progress-commentary', 'dsh-reasoning-translation']) {
  const dir = resolve('packages', name)
  await rm(`${dir}/lib`, { recursive: true, force: true })
  await mkdir(`${dir}/lib`, { recursive: true })
  await build({ entryPoints: [`${dir}/src/index.ts`], outfile: `${dir}/lib/index.js`, bundle: true,
    platform: 'node', target: 'node24', format: 'esm', packages: 'external', sourcemap: true })
  if (name === 'dsh-reasoning-translation') {
    await build({ entryPoints: [`${dir}/src/client.ts`], outfile: `${dir}/lib/client.js`, bundle: true,
      platform: 'browser', target: 'es2022', format: 'cjs', packages: 'external', sourcemap: true,
      banner: { js: `window.__ModuleLoader__.load({ id: ${JSON.stringify(name)}, factory: (require) => { var module = { exports: {} }; var exports = module.exports;` },
      footer: { js: 'return module.exports; } });' } })
  }
  // Preserve source for users; .d.ts emission is intentionally not advertised without a declaration build.
  const manifest = JSON.parse(await readFile(`${dir}/package.json`, 'utf8'))
  if (!manifest.dsh?.bundle?.patch) throw new Error(`Missing DSH bundle manifest: ${name}`)
}
console.log('Built 2 host plugins and 1 DSH browser factory.')
