import { mkdir, cp, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

let build;
try {
  const esbuild = await import('esbuild');
  build = esbuild.build;
} catch (e) {
  // Fallback to locally known esbuild installation if present
  const fallbackPath = 'C:/Users/19070/Documents/ChatGPT/群组ai/node_modules/esbuild/lib/main.js';
  if (existsSync(fallbackPath)) {
    const esbuild = await import('file:///' + fallbackPath.replace(/\\/g, '/'));
    build = esbuild.build;
  } else {
    throw new Error('未找到 esbuild，请在插件目录运行 npm install 或 pnpm install');
  }
}

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
