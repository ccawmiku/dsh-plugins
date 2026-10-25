import { build } from 'esbuild';
import { mkdir, cp, readFile } from 'node:fs/promises';

await mkdir('lib', { recursive: true });
await cp('src', 'lib', { recursive: true });
const manifest = JSON.parse(await readFile('package.json', 'utf8'));
await build({ entryPoints: ['client/index.jsx'], outfile: 'lib/client.js', bundle: true, platform: 'browser', format: 'cjs', external: ['react'], target: 'es2022', sourcemap: true,
  banner: { js: `window.__ModuleLoader__.load({id:${JSON.stringify(manifest.name)},factory:function(require){var module={exports:{}};var exports=module.exports;` },
  footer: { js: 'return module.exports;}});' },
});
await build({ entryPoints: ['client/preview.jsx'], outfile: 'web/preview.js', bundle: true, platform: 'browser', format: 'esm', target: 'es2022', sourcemap: true });
console.log('已构建 DSH 插件和本地预览。');
