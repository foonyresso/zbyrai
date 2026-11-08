// Збирає компактні списки тегів для автопідказок Віддаленого SD з CSV розширення Tag Autocomplete (формат: тег,категорія,кількість,"синоніми").
// Запуск: node tools/build-sd-autocomplete.mjs <danbooru.csv> [e621.csv] [extra-quality-tags.csv]
// Результат: sd-remote/data/danbooru.txt (+ e621.txt): рядки «тег<TAB>категорія<TAB>кількість<TAB>синоніми через кому».
// Відсіюються лише теги й синоніми, що сексуалізують неповнолітніх (за словами-ознаками нижче); решта дорослих тегів лишається.
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const BLOCK = new Set(['loli', 'lolicon', 'lolis', 'shota', 'shotacon', 'toddlercon', 'underage', 'cub', 'cubs', 'pedo', 'pedophile', 'pedophilia', 'preteen', 'jailbait']);
export const blocked = (t) => String(t).toLowerCase().split(/[^a-z0-9]+/).some((w) => BLOCK.has(w));

// Розбір рядка CSV з полем у лапках
export function parseLine(line) {
  const out = []; let cur = '', q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) { if (c === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
    else if (c === '"') q = true; else if (c === ',') { out.push(cur); cur = ''; } else cur += c;
  }
  out.push(cur); return out;
}

function build(file, { min, maxAliases = 5, cat = null }) {
  const rows = [];
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    if (!line) continue;
    const [tag, c, count, aliases = ''] = parseLine(line);
    const n = parseInt(count, 10) || 0;
    if (!tag || n < min || blocked(tag)) continue;
    const al = aliases.split(',').map((a) => a.trim()).filter((a) => a && a.length <= 28 && !blocked(a) && a !== tag).slice(0, maxAliases);
    rows.push([tag, cat ?? c, n, al.join(',')]);
  }
  return rows;
}
const write = (name, rows) => { const text = rows.map((r) => r.join('\t')).join('\n') + '\n'; fs.writeFileSync(join(root, 'sd-remote', 'data', name), text); console.log(`${name}: ${rows.length} тегів, ${(text.length / 1024).toFixed(0)} КБ`); };

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [dan, e621, quality] = process.argv.slice(2);
  if (!dan) { console.log('Використання: node tools/build-sd-autocomplete.mjs <danbooru.csv> [e621.csv] [extra-quality-tags.csv]'); process.exit(1); }
  const rows = build(dan, { min: 30 });
  if (quality) rows.unshift(...build(quality, { min: 0, cat: 'q' }).map((r) => [r[0], 'q', 9e9, r[3]]));
  write('danbooru.txt', rows);
  if (e621) write('e621.txt', build(e621, { min: 60, maxAliases: 3 }));
}
