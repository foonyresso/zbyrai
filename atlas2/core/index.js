// Завантажувач для Node (тести, експорт): підключає файли ядра в потрібному порядку. У браузері ті самі файли йдуть тегами <script> у тому ж порядку.
'use strict';
const path = require('node:path');
const FILES = ['rng', 'noise', 'heap', 'grid', 'params', 'terrain', 'hydrology', 'climate', 'astrakor', 'biomedata', 'subbiomes', 'names', 'settle', 'grow', 'politics', 'settlements', 'astrawall', 'roads', 'landmarks', 'searoutes', 'seas', 'bestiary', 'monorder', 'danger', 'generate', 'serialize', 'citydata', 'citytext', 'townenv', 'townstreets', 'townsites', 'townsites2', 'townroads', 'townfields', 'townpaths', 'castlegeo', 'castleplot', 'castletypes', 'castlewall', 'castlelayout', 'castleroads', 'townkeep', 'townfort', 'townmon', 'town', 'citytrace', 'townquery', 'dungeondata', 'dungeon', 'dungeonplace'];
for (const f of FILES) require(path.join(__dirname, f + '.js'));
module.exports = globalThis.Atlas2;
