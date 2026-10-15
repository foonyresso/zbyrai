// Завантажувач для Node (тести, сервер, експорт): підключає файли ядра в потрібному порядку й повертає RealmMap.
// У браузері ті самі файли підключаються тегами <script> у тому ж порядку (див. index.html).
'use strict';
const path = require('node:path');
const FILES = [
  'core/rng.js', 'core/noise.js', 'core/heap.js', 'core/grid.js',
  'data/biomes.js', '../../src/data/realm/poi-types.js', 'data/gdd-codes.js', 'data/name-banks.js', 'data/hooks.js', '../../src/data/realm/monsters-mountain.js', '../../src/data/realm/monsters-forest.js', '../../src/data/realm/monsters-sea.js',
  'core/terrain.js', 'core/rivers.js', 'core/climate.js', 'core/suitability.js', 'core/politics.js', 'core/names.js', 'core/settlements.js', 'core/pois.js', 'core/lairs.js', 'core/router.js', 'core/roads.js', 'core/searoutes.js', 'core/features.js', 'core/contours.js', 'core/planner.js', 'core/params.js', 'core/peoples.js', 'core/details.js', 'core/generate.js', 'core/serialize.js',
];
const extra = []; // нові файли ядра додаються нижче
// реєстр Атласу з народами й расами (необов'язково для генерації; без нього народи не призначаються)
globalThis.Atlas = require(path.join(__dirname, '..', '..', '..', 'src', 'core', 'atlas.js'));
for (const f of ['peoples', 'races']) require(path.join(__dirname, '..', '..', '..', 'atlas-data', f + '.js'));
for (const f of FILES.concat(extra)) require(path.join(__dirname, '..', f));
module.exports = globalThis.RealmMap;
