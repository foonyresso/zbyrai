// Біоми: колір, вартість проходу (для доріг) і групи. Порядок id = індекси в масиві biome[] (на C# — enum).
(function () {
  'use strict';
  const R = (globalThis.RealmMap = globalThis.RealmMap || {}); R.Data = R.Data || {};
  // group: water | land; mon: вид монстрів ('mountain' | 'forest' | null); move — вартість кроку по землі; speed — км/добу пішки поза дорогою
  const list = [
    { id: 'deep',      name: 'Глибоке море',     color: '#27506f', water: true },
    { id: 'sea',       name: 'Мілководдя',       color: '#3f7c97', water: true },
    { id: 'lake',      name: 'Озеро',            color: '#4c8aa6', water: true },
    { id: 'grass',     name: 'Луки й поля',      color: '#a9c27a', move: 1.0, speed: 22 },
    { id: 'steppe',    name: 'Степ',             color: '#c9c27f', move: 1.0, speed: 24 },
    { id: 'forest',    name: 'Ліс',              color: '#6f9a58', move: 1.8, speed: 12, mon: 'forest' },
    { id: 'taiga',     name: 'Тайга',            color: '#5d8a6c', move: 1.9, speed: 11, mon: 'forest' },
    { id: 'enchanted', name: 'Зачарований ліс',  color: '#6aa88e', move: 2.2, speed: 9,  mon: 'forest', fantasy: true },
    { id: 'swamp',     name: 'Болото',           color: '#6f8a62', move: 4.0, speed: 6 },
    { id: 'desert',    name: 'Пустеля',          color: '#dbc58d', move: 1.6, speed: 14 },
    { id: 'tundra',    name: 'Тундра',           color: '#b9c3b2', move: 1.5, speed: 14 },
    { id: 'wasteland', name: 'Спустошені землі', color: '#9a8a7a', move: 1.8, speed: 13, fantasy: true },
    { id: 'hills',     name: 'Пагорби',          color: '#a9a074', move: 2.2, speed: 13, mon: 'mountain' },
    { id: 'mountain',  name: 'Гори',             color: '#8d8579', move: 5.0, speed: 7,  mon: 'mountain' },
    { id: 'peaks',     name: 'Засніжені піки',   color: '#e6e9ec', move: 12,  speed: 3,  mon: 'mountain' },
  ];
  const B = {}; list.forEach((b, i) => { b.i = i; B[b.id.toUpperCase()] = i; });
  R.Data.biomes = list; R.Data.B = B;
})();
