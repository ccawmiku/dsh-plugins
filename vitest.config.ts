import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'
import ts from 'typescript'

const upstream = resolve(process.env.DSH_SOURCE ?? '../dsh-research/deepseek-harness')
const parsed = ts.readConfigFile(resolve(upstream, 'tsconfig.base.json'), ts.sys.readFile)
const alias = Object.entries<string[]>(parsed.config.compilerOptions.paths)
  .filter(([key]) => !key.includes('*'))
  .sort(([a], [b]) => b.length - a.length)
  .map(([key, values]) => ({ find: new RegExp(`^${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`), replacement: resolve(upstream, values[0]!) }))
for (const file of ['assembler', 'event-registry', 'view-registry']) alias.push({
  find: new RegExp(`^@dsh-test/${file}$`), replacement: resolve(upstream, `packages/client/ui-conversation/src/client/conversation/${file}.ts`),
})
// Adapted from DSH vitest.shared.ts (MIT, DeepSeek): source-mode DSH uses standard TS decorators.
function standardDecoratorPlugin() {
  return { name: 'dsh-plugin-standard-decorators', enforce: 'pre' as const,
    transform(code: string, id: string) {
      const file = id.split('?', 1)[0]!
      if (!/\.[cm]?tsx?$/.test(file) || !/^\s*@[A-Za-z_$][\w$]*/m.test(code)) return
      const result = ts.transpileModule(code, { fileName: file, compilerOptions: {
        target: ts.ScriptTarget.ES2024, module: ts.ModuleKind.ESNext,
        ...(file.endsWith('x') ? { jsx: ts.JsxEmit.ReactJSX } : {}), sourceMap: true,
      } })
      return { code: result.outputText, map: result.sourceMapText }
    } }
}
export default defineConfig({
  plugins: [standardDecoratorPlugin()],
  resolve: { alias, dedupe: ['react', 'react-dom'] },
  test: { include: ['tests/**/*.spec.ts', 'tests/**/*.spec.tsx'], testTimeout: 15000 },
})
