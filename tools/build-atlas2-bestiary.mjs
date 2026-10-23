// Збирає з реєстру монстрів старого Атласу (medieval-world/monsters) компактний бестіарій для Атласу 2.0: atlas2/core/bestiary.js.
// Беруться лише монстри «для всіх світів» і з наземних біомів (води, підземель і фентезі-біомів поки немає). Запуск: node tools/build-atlas2-bestiary.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'medieval-world', 'monsters');
const mons = [];
globalThis.Atlas = { registerMonster: m => mons.push(m) };
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.js'))) new Function(fs.readFileSync(path.join(dir, f), 'utf8'))();

const KINDS = ['weak', 'monster', 'other', 'mini-boss', 'boss', 'super-boss', 'world-boss'];
const GROUPS = ['peaks', 'mountain', 'hills', 'grass', 'steppe', 'savanna', 'forest', 'taiga', 'jungle', 'swamp', 'desert', 'tundra', 'snow'];
// старий біом/тег → групи ландшафту Атласу 2
const MAP = {
  hills: ['hills'], mountain: ['mountain'], peaks: ['peaks'], grass: ['grass'], forest: ['forest'], taiga: ['taiga'], swamp: ['swamp'], desert: ['desert'],
  snow: ['snow'], jungle: ['jungle'], steppe: ['steppe'], tundra: ['tundra'], savanna: ['savanna'], wasteland: ['desert', 'tundra'],
  'tag:swamp': ['swamp'], 'tag:wet': ['swamp', 'jungle'], 'tag:forest': ['forest', 'taiga', 'jungle'], 'tag:mountain': ['mountain', 'peaks', 'hills'],
  'tag:dry': ['desert', 'savanna', 'steppe'], 'tag:cold': ['snow', 'tundra', 'taiga'], 'tag:plain': ['grass', 'steppe', 'savanna'],
};
const out = [], seen = new Set();
for (const m of mons) {
  if (!m.spawn || m.spawn.worlds !== 'all') continue;
  const gs = new Set(); for (const b of m.spawn.biomes || []) for (const g of MAP[b] || []) gs.add(g);
  if (!gs.size || seen.has(m.name)) continue; seen.add(m.name);
  const ki = KINDS.indexOf(m.kind); if (ki < 0) continue;
  let mask = 0; for (const g of gs) mask |= 1 << GROUPS.indexOf(g);
  const d = ((m.lore && m.lore.description) || '').replace(/\s+/g, ' ').split(/(?<=[.!?])\s/)[0].slice(0, 120);
  out.push([m.name, ki, m.nature === 'magic' ? 1 : 0, mask, d]);
}
const body = `// ЗГЕНЕРОВАНО tools/build-atlas2-bestiary.mjs зі старого реєстру монстрів — вручну не правити.
// Запис: [назва, тип, природа (0 загроза, 1 магія), маска груп ландшафту, короткий опис]; типи й групи — у Atlas2.Bestiary.KINDS / GROUPS.
(function () {
  'use strict';
  const A = globalThis.Atlas2 = globalThis.Atlas2 || {};
  A.Bestiary = {
    KINDS: ${JSON.stringify(['weak', 'monster', 'other', 'mini-boss', 'boss', 'super-boss', 'world-boss'])},
    GROUPS: ${JSON.stringify(GROUPS)},
    list: ${JSON.stringify(out)}
  };
})();
`;
fs.writeFileSync(path.join(root, 'atlas2', 'core', 'bestiary.js'), body);
const byKind = {}; for (const e of out) byKind[KINDS[e[1]]] = (byKind[KINDS[e[1]]] || 0) + 1;
console.log('монстрів:', out.length, byKind, 'байт:', body.length);
