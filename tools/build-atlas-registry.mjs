// Збирає medieval-world/registry.js: перелік файлів світів (worlds/*/world.js) і біомів (biomes/*.js).
// Запуск: node tools/build-atlas-registry.mjs   (--check: лише перевірити, що registry.js актуальний)
import { readdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const base = join(dirname(fileURLToPath(import.meta.url)), '..', 'medieval-world');
export function buildRegistry() {
  const worlds = readdirSync(join(base, 'worlds'), { withFileTypes: true })
    .filter((e) => e.isDirectory() && existsSync(join(base, 'worlds', e.name, 'world.js')))
    .map((e) => `worlds/${e.name}/world.js`).sort();
  const biomes = readdirSync(join(base, 'biomes')).filter((f) => f.endsWith('.js')).map((f) => `biomes/${f}`).sort();
  return '/* Автоматично: node tools/build-atlas-registry.mjs. Не правити вручну. */\n'
    + 'Atlas.manifest = ' + JSON.stringify({ worlds, biomes }, null, 2) + ';\n';
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const text = buildRegistry(), file = join(base, 'registry.js');
  if (process.argv.includes('--check')) {
    if (!existsSync(file) || readFileSync(file, 'utf8') !== text) { console.error('registry.js застарів: node tools/build-atlas-registry.mjs'); process.exit(1); }
    console.log('registry.js актуальний');
  } else { writeFileSync(file, text); console.log('registry.js оновлено'); }
}
