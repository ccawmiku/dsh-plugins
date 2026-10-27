import { mkdir, cp, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

process.chdir(resolve(dirname(fileURLToPath(import.meta.url)), '..'));

await mkdir('lib', { recursive: true });
await cp('src', 'lib', { recursive: true });

const manifest = JSON.parse(await readFile('package.json', 'utf8'));

await build({
  entryPoints: ['client/index.jsx'],
  outfile: 'lib/client.js',
  bundle: true,
  platform: 'browser',
  format: 'cjs',
  external: ['react', 'react/jsx-runtime', 'react-dom'],
  target: 'es2022',
  sourcemap: true,
  banner: {
    js: `window.__ModuleLoader__.load({id:${JSON.stringify(manifest.name)},factory:function(require){var module={exports:{}};var exports=module.exports;`
  },
  footer: {
    js: 'return module.exports;}});'
  }
});

console.log('✅ 成功构建 dsh-plugin-immich 后端与前端产物！');
