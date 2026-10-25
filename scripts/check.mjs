import { readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
for (const dir of ['src', 'shared', 'scripts', 'tests']) for (const file of await readdir(dir)) if (/\.[mc]js$/.test(file)) {
  const result = spawnSync(process.execPath, ['--check', `${dir}/${file}`], { encoding: 'utf8', windowsHide: true });
  if (result.status) { console.error(result.stderr); process.exit(result.status); }
}
console.log('JavaScript 语法检查通过。');
