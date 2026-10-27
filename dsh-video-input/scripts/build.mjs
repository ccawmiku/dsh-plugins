import { build } from 'esbuild'
import { mkdir } from 'node:fs/promises'
await mkdir('lib', { recursive: true })
await mkdir('dist', { recursive: true })
await build({entryPoints: ['src/client.js'], outfile: 'lib/client.js', bundle: true, platform: 'browser', target: 'es2022', format: 'cjs', packages: 'external',
  banner: {js: 'window.__ModuleLoader__.load({id:"dsh-video-input",factory:(require)=>{var module={exports:{}};var exports=module.exports;'},
  footer: {js: 'return module.exports;}});'}})
console.log('Built DSH browser module.')
