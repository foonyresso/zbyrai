// Завантажувач для Node (тести, експорт): підключає файли ядра в потрібному порядку. У браузері ті самі файли йдуть тегами <script> у тому ж порядку.
'use strict';
const path = require('node:path');
const FILES = ['rng', 'noise', 'heap', 'grid', 'params', 'terrain', 'hydrology', 'climate', 'names', 'settle', 'grow', 'politics', 'settlements', 'roads', 'searoutes', 'seas', 'bestiary', 'danger', 'generate', 'serialize'];
for (const f of FILES) require(path.join(__dirname, f + '.js'));
module.exports = globalThis.Atlas2;
