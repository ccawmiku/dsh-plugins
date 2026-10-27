/** Pack only built, documented independent plugins; never install or publish them. */
import { mkdir, readFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'
import { createHash } from 'node:crypto'
import { writeFile } from 'node:fs/promises'

await mkdir('dist', { recursive: true })
const sums = []
for (const name of ['dsh-progress-commentary', 'dsh-reasoning-translation']) {
  const directory = resolve('../..', name)
  for (const file of ['lib/index.js', 'cordis.patch.yml', 'README.md', 'LICENSE']) await readFile(`${directory}/${file}`)
  const npm = process.env.npm_execpath
  const packed = npm
    ? spawnSync(process.execPath, [npm, 'pack', directory, '--ignore-scripts', '--pack-destination', resolve('dist'), '--json'], { encoding: 'utf8' })
    : spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['pack', directory, '--ignore-scripts', '--pack-destination', resolve('dist'), '--json'], { encoding: 'utf8', shell: process.platform === 'win32' })
  if (packed.status !== 0) throw new Error(packed.stderr)
  const [entry] = JSON.parse(packed.stdout)
  const files = entry.files.map(item => item.path)
  for (const file of ['lib/index.js', 'cordis.patch.yml', 'README.md']) if (!files.includes(file)) throw new Error(`Missing ${file}`)
  if (name.includes('translation') && !files.includes('lib/client.js')) throw new Error('Missing browser factory')
  if (name.includes('progress') && !files.includes('prompts/commentary.md')) throw new Error('Missing runtime prompt')
  const bytes = await readFile(resolve('dist', entry.filename))
  sums.push(`${createHash('sha256').update(bytes).digest('hex')}  ${entry.filename}`)
  console.log(`${entry.filename}: ${entry.entryCount} files, ${entry.size} bytes`)
}
await writeFile('dist/SHA256SUMS', `${sums.join('\n')}\n`)
