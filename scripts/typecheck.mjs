/** Type-check against the pinned upstream source graph, with separate Host and Client Cordis programs. */
import { spawnSync } from 'node:child_process'
import { writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import ts from 'typescript'

const upstream = resolve(process.env.DSH_SOURCE ?? '../dsh-research/deepseek-harness')
const base = resolve(upstream, 'tsconfig.base.json')
const parsed = ts.readConfigFile(base, ts.sys.readFile)
if (parsed.error) throw new Error(ts.flattenDiagnosticMessageText(parsed.error.messageText, '\n'))
const paths = Object.fromEntries(Object.entries(parsed.config.compilerOptions.paths)
  .map(([key, values]) => [key, values.map(value => resolve(upstream, value))]))
// The vendored framework intentionally has its own compiler settings. Use its real emitted declarations,
// rather than rechecking vendor implementation under this plugin's stricter settings.
for (const [key, values] of Object.entries(paths)) {
  paths[key] = values.map(value => /\/vendor\/(cordis|cosmokit|schemastery|loader)\/src$/.test(value)
    ? value.replace(/\/src$/, '/lib/types/index.d.ts') : value)
}
for (const file of ['assembler', 'event-registry', 'view-registry']) paths[`@dsh-test/${file}`] = [
  resolve(upstream, `packages/client/ui-conversation/lib/types/client/conversation/${file}.d.ts`),
]
// Client packages expose hundreds of unrelated UI implementations from their entry points. Compile
// those with upstream project references first, then consume their actual public declarations.
for (const [key, values] of Object.entries(paths)) {
  if (key.startsWith('@deepseek-ai/dsh-client-') || key.startsWith('@deepseek-ai/dsh-api-')) {
    paths[key] = values.map(value => value.includes('/src/')
      ? value.replace('/src/', '/lib/types/').replace(/\.tsx?$/, '.d.ts')
      : value.endsWith('/src') ? `${value.slice(0, -4)}/lib/types/index.d.ts` : value)
  }
}
mkdirSync('.checks', { recursive: true })
for (const [face, files] of Object.entries({
  host: ['packages/dsh-progress-commentary/src/index.ts', 'packages/dsh-reasoning-translation/src/index.ts',
    'tests/engine.spec.ts', 'tests/model.spec.ts', 'tests/progress.spec.ts', 'tests/loop.spec.ts', 'tests/packed.spec.ts'],
  client: ['packages/dsh-reasoning-translation/src/client.ts', 'tests/presentation.spec.ts'],
})) {
  const config = {
    compilerOptions: { target: 'ES2024', module: 'ESNext', moduleResolution: 'bundler', strict: true,
      noUncheckedIndexedAccess: true, exactOptionalPropertyTypes: true, noEmit: true, skipLibCheck: true,
      esModuleInterop: true, jsx: 'react-jsx', allowImportingTsExtensions: true, paths,
      types: ['node', ...(face === 'client' ? ['react'] : [])],
      typeRoots: [resolve('node_modules/@types'), resolve(upstream, 'node_modules/@types')] },
    files: files.map(file => resolve(file)),
  }
  const filename = resolve('.checks', `${face}.json`)
  writeFileSync(filename, JSON.stringify(config, null, 2))
  const result = spawnSync(process.execPath, ['node_modules/typescript/bin/tsc', '-p', filename], { stdio: 'inherit' })
  if (result.status !== 0) process.exit(result.status ?? 1)
}
console.log('Host and Client checked separately against upstream source.')
