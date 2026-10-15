// Копіює shared/theme.css у theme.css і shared/tool-chrome.js у tool-chrome.js кожного інструмента.
// Інструмент = підпапка кореня з index.html, окрім shared, assets, tools.
// Запуск: node tools/sync-theme.mjs   (з будь-якої папки)
import { readdirSync, existsSync, copyFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'shared', 'theme.css');
const skip = new Set(['shared', 'assets', 'tools', 'node_modules']);

const src = readFileSync(source);
const chromeSrc = join(root, 'shared', 'tool-chrome.js');
let n = 0;
for (const e of readdirSync(root, { withFileTypes: true })) {
  if (!e.isDirectory() || e.name.startsWith('.') || skip.has(e.name)) continue;
  if (!existsSync(join(root, e.name, 'index.html'))) continue;
  const dest = join(root, e.name, 'theme.css');
  const same = existsSync(dest) && readFileSync(dest).equals(src);
  copyFileSync(source, dest);
  if (e.name !== 'taste') copyFileSync(chromeSrc, join(root, e.name, 'tool-chrome.js'));
  console.log(`${same ? '=' : '✓'} ${e.name}/theme.css${same ? ' (без змін)' : ' оновлено'}`);
  n++;
}
console.log(`Готово: ${n} інструмент(и).`);
