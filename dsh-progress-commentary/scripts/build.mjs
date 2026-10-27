import { build } from 'esbuild'
import { mkdir } from 'node:fs/promises'
import { readFile } from 'node:fs/promises'
const manifest=JSON.parse(await readFile('package.json','utf8'))
await mkdir('lib',{recursive:true})
await mkdir('dist',{recursive:true})
await build({entryPoints:['src/index.ts'],outfile:'lib/index.js',bundle:true,platform:'node',target:'node24',format:'esm',packages:'external',sourcemap:true})
if(manifest.dsh.client) await build({entryPoints:['src/client.ts'],outfile:'lib/client.js',bundle:true,platform:'browser',target:'es2022',format:'cjs',packages:'external',sourcemap:true,
banner:{js:`window.__ModuleLoader__.load({id:${JSON.stringify(manifest.name)},factory:(require)=>{var module={exports:{}};var exports=module.exports;`},footer:{js:'return module.exports;}});'}})
console.log('Built '+manifest.name)
