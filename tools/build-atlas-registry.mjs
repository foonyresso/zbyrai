// Збирає medieval-world/registry.js: перелік файлів світів (worlds/*/world.js) і біомів (biomes/*.js).
// Запуск: node tools/build-atlas-registry.mjs   (--check: лише перевірити, що registry.js актуальний)
import { readdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';
import vm from 'node:vm';

const base = join(dirname(fileURLToPath(import.meta.url)), '..', 'medieval-world');
export function buildRegistry() {
  const worlds = readdirSync(join(base, 'worlds'), { withFileTypes: true })
    .filter((e) => e.isDirectory() && existsSync(join(base, 'worlds', e.name, 'world.js')))
    .map((e) => `worlds/${e.name}/world.js`).sort();
  const biomes = readdirSync(join(base, 'biomes')).filter((f) => f.endsWith('.js')).map((f) => `biomes/${f}`).sort();
  const monsters = readdirSync(join(base, 'monsters')).filter((f) => f.endsWith('.js')).map((f) => `monsters/${f}`).sort();
  return '/* Автоматично: node tools/build-atlas-registry.mjs. Не правити вручну. */\n'
    + 'Atlas.manifest = ' + JSON.stringify({ worlds, biomes, monsters }, null, 2) + ';\n';
}

/* Списки монстрів рушія «Материк» (src/data/realm/monsters-*.js) збираються з файлів monsters/: рушій читає старий формат { monsters: [назви], bosses: [{ n, alias, variants, tier }] }.
   Група за біомом появи: гори (hills, mountain, peaks), ліси (forest, taiga, enchanted), моря (deep). Звичайні монстри — тип «monster»; боси: міні-бос = рівень 2, бос і вище = рівень 3. */
const GROUPS = { mountain: ['Гори', ['hills', 'mountain', 'peaks']], forest: ['Ліси', ['forest', 'taiga', 'enchanted']], sea: ['Моря', ['deep']] };
const ENGINE_WORLDS = ['continent', 'archipelago', 'island', 'pangea'];
export function buildContinentData() {
  const Atlas = createRequire(import.meta.url)(join(base, 'src/core/atlas.js'));
  const ctx = vm.createContext({ Atlas });
  for (const f of readdirSync(join(base, 'monsters')).filter((f) => f.endsWith('.js')).sort()) vm.runInContext(readFileSync(join(base, 'monsters', f), 'utf8'), ctx);
  const out = {};
  for (const [id, [name, biomes]] of Object.entries(GROUPS)) {
    const mine = Atlas.monsters.filter((m) => (m.spawn.worlds === 'all' || m.spawn.worlds.some((w) => ENGINE_WORLDS.includes(w))) && m.spawn.biomes.some((b) => biomes.includes(b)));
    const monsters = mine.filter((m) => m.kind === 'monster').map((m) => m.name);
    const bosses = mine.filter((m) => m.kind !== 'monster' && m.kind !== 'weak' && m.kind !== 'other').map((m) => {
      const b = { n: m.name };
      if (m.alias) b.alias = m.alias;
      if (m.variants) b.variants = m.variants;
      b.tier = m.kind === 'mini-boss' ? 2 : 3;
      return b;
    });
    const fmt = (b) => '      { ' + Object.entries(b).map(([k, v]) => k + ': ' + (typeof v === 'number' ? v : Array.isArray(v) ? '[' + v.map((x) => JSON.stringify(x).replace(/^"|"$/g, "'")).join(', ') + ']' : "'" + v.replace(/'/g, "\\'") + "'")).join(', ') + ' },';
    out[`src/data/realm/monsters-${id}.js`] = `// Автоматично з monsters/*.js: node tools/build-atlas-registry.mjs. Не правити вручну: правте файли монстрів.
// Монстри та боси (${name.toLowerCase()}) у форматі рушія «Материк». Боси: tier 2 міні-бос, 3 бос і вище; alias — друга назва, variants — варіанти (обирається один).
(function () {
  'use strict';
  const R = (globalThis.RealmMap = globalThis.RealmMap || {}); R.Data = R.Data || {};
  R.Data.${id} = {
    id: '${id}', name: '${name}',
    monsters: [${monsters.map((m) => "'" + m.replace(/'/g, "\\'") + "'").join(', ')}],
    bosses: [
${bosses.map(fmt).join('\n')}
    ],
  };
})();
`;
  }
  return out;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const files = { 'registry.js': buildRegistry(), ...buildContinentData() };
  if (process.argv.includes('--check')) {
    for (const [f, text] of Object.entries(files)) if (!existsSync(join(base, f)) || readFileSync(join(base, f), 'utf8') !== text) { console.error(f + ' застарів: node tools/build-atlas-registry.mjs'); process.exit(1); }
    console.log('registry.js і списки монстрів актуальні');
  } else { for (const [f, text] of Object.entries(files)) writeFileSync(join(base, f), text); console.log('registry.js і списки монстрів оновлено'); }
}
