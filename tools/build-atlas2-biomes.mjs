// Збирає з реєстру біомів старого Атласу (medieval-world/biomes) каталог «підбіомів» основного світу для Атласу 2.0: atlas2/core/biomedata.js.
// Беруться наземні біоми без тегу exclusive (води, підземель, хмар, берегів і крон теж немає); ті, що вже є базовими в Атласі 2.0, пропускаються.
// Запуск: node tools/build-atlas2-biomes.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'medieval-world', 'biomes');
const all = [];
globalThis.Atlas = { registerBiome: b => all.push(b) };
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.js')).sort()) new Function(fs.readFileSync(path.join(dir, f), 'utf8'))();

const BAN = /underground|water|sea|cloud|surreal|exclusive|canopy|shore/;
const BASE = new Set(['grass', 'steppe', 'forest', 'taiga', 'savanna', 'jungle', 'swamp', 'desert', 'tundra', 'snow', 'mountain', 'lake', 'sea', 'deep']);
const CLASSES = ['mountain', 'forest', 'swamp', 'desert', 'snow', 'grass']; // той самий поділ, що й у плям старого нескінченного світу
const has = (b, ...t) => t.some(x => b.tags.includes(x));
const member = {
  mountain: b => has(b, 'highland', 'mountain', 'hills', 'canyon'),
  forest: b => has(b, 'forest'),
  swamp: b => has(b, 'swamp'),
  desert: b => has(b, 'hot', 'dry') && !has(b, 'forest', 'swamp'),
  snow: b => has(b, 'cold'),
  grass: b => has(b, 'plain', 'temperate', 'farmland') && !has(b, 'dry', 'hot', 'cold'),
};
const out = [];
for (const b of all) {
  if (!b.tags.includes('land') || BAN.test(b.tags.join()) || BASE.has(b.id)) continue;
  let mask = 0; CLASSES.forEach((c, k) => { if (member[c](b)) mask |= 1 << k; });
  if (!mask) continue;
  const d = ((b.lore && b.lore.description) || '').replace(/\s+/g, ' ').split(/(?<=[.!?])\s/)[0].slice(0, 140);
  out.push([b.id, b.name, b.color, mask, d]);
}
const body = `// ЗГЕНЕРОВАНО tools/build-atlas2-biomes.mjs зі старого реєстру біомів — вручну не правити.
// Запис: [id, назва, колір, маска класів (біт k = CLASSES[k]), короткий опис]. Це біоми, які мають бути в основному світі (без тегу exclusive).
(function () {
  'use strict';
  const A = globalThis.Atlas2 = globalThis.Atlas2 || {};
  A.BiomeData = {
    CLASSES: ${JSON.stringify(CLASSES)},
    list: ${JSON.stringify(out)}
  };
})();
`;
fs.writeFileSync(path.join(root, 'atlas2', 'core', 'biomedata.js'), body.replace(/\],\[/g, '],\n[').replace('list: [[', 'list: [\n[').replace(/\]\]\n  \};/, ']\n    ]\n  };'));
console.log('біомів:', out.length);
