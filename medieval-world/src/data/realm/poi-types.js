// Типи поселень, їхні стани й точки інтересу. Клас дороги визначається типом: major → мала дорога, minor → стежка.
(function () {
  'use strict';
  const R = (globalThis.RealmMap = globalThis.RealmMap || {}); R.Data = R.Data || {};

  // Ранги поселень. road — клас дороги до поселення: major (велика), medium (середня), minor (мала).
  R.Data.ranks = {
    capital:  { name: 'Столиця провінції', road: 'major',  pop: [14000, 38000], size: 5 },
    regional: { name: 'Центр регіону',     road: 'major',  pop: [3500, 13000],  size: 4 },
    town:     { name: 'Містечко',          road: 'medium', pop: [900, 3200],    size: 3 },
    village:  { name: 'Село',              road: 'minor',  pop: [120, 650],     size: 2 },
    hamlet:   { name: 'Хутір',             road: 'minor',  pop: [20, 110],      size: 1 },
    mine:     { name: 'Шахта',             road: 'minor',  pop: [10, 120],      size: 1 },
  };

  // Стани поселень (лише для не головних): занепале, зруйноване, покинуте, захоплене монстрами
  R.Data.states = {
    normal:   { name: 'Живе' },
    fallen:   { name: 'Занепале' },
    ruined:   { name: 'Зруйноване' },
    abandoned:{ name: 'Покинуте' },
    occupied: { name: 'Захоплене монстрами' },
  };

  // Ресурси шахт: [id, назва, вага, де]
  R.Data.ores = [
    ['iron', 'Залізо', 40, 'any'], ['copper', 'Мідь', 22, 'any'], ['coal', 'Вугілля', 18, 'hills'], ['salt', 'Сіль', 10, 'hills'],
    ['silver', 'Срібло', 12, 'mountain'], ['gold', 'Золото', 7, 'mountain'], ['gems', 'Самоцвіти', 7, 'mountain'], ['mithril', 'Мітріл', 2, 'peaks'],
  ];

  // Точки інтересу. cls: major (мала дорога) | minor (стежка). on: де можуть бути (ключі груп ландшафту)
  // shape — форма значка на карті (див. render/icons.js)
  R.Data.poi = {
    lake:        { name: 'Озеро',                 cls: 'major', shape: 'wave',    color: '#7fc3dc' },
    mountain:    { name: 'Гора',                  cls: 'major', shape: 'peak',    color: '#d8d2c4' },
    ruins:       { name: 'Старі руїни',           cls: 'major', shape: 'ruin',    color: '#b9a98c', on: ['land'] },
    monument:    { name: 'Давній пам’ятник',      cls: 'major', shape: 'obelisk', color: '#e0c98a', on: ['land'] },
    temple:      { name: 'Монастир чи храм',      cls: 'major', shape: 'temple',  color: '#f0e2b0', on: ['plain', 'hills'] },
    mage_tower:  { name: 'Вежа мага',             cls: 'major', shape: 'tower',   color: '#b08cf0', on: ['plain', 'hills', 'forest'] },
    waterfall:   { name: 'Водоспад',              cls: 'major', shape: 'wave',    color: '#a8dcef', on: ['river'] },
    glade:       { name: 'Галявина в лісі',       cls: 'minor', shape: 'dot',     color: '#cfe8a0', on: ['forest'] },
    small_mine:  { name: 'Покинута шахта',        cls: 'minor', shape: 'pick',    color: '#a89c8c', on: ['hills', 'mountain'] },
    viewpoint:   { name: 'Краєвидна площадка',    cls: 'minor', shape: 'flag',    color: '#f0d9a0', on: ['hills', 'mountain'] },
    small_monument: { name: 'Старий пам’ятний знак', cls: 'minor', shape: 'obelisk', color: '#d9c58e', on: ['land'] },
    park:        { name: 'Природний парк чи садок', cls: 'minor', shape: 'tree',  color: '#9fd18a', on: ['plain', 'forest'] },
    bandit_camp: { name: 'Табір бандитів',        cls: 'minor', shape: 'tent',    color: '#e07a5f', on: ['forest', 'hills', 'plain'], danger: 1 },
    treasure:    { name: 'Прихований скарб',     cls: 'minor', shape: 'flag',    color: '#f2c230', on: [] },
    wild_hamlet: { name: 'Оселя на дикому острові', cls: 'minor', shape: 'dot',  color: '#c9e0f0', on: [] },
    shrine:      { name: 'Придорожня капличка',   cls: 'minor', shape: 'dot',     color: '#f3e7bd', on: ['land'] },
    hermit:      { name: 'Хатина відлюдника',     cls: 'minor', shape: 'dot',     color: '#d7c3a1', on: ['forest', 'hills'] },
  };

  // Лігва: lair (лігво) і rest (місце відпочинку). tier: 1 звичайні, 2 міні-бос, 3 бос
  R.Data.lairKinds = { lair: 'Лігво', rest: 'Місце відпочинку', boss: 'Лігво боса' };
  R.Data.tierNames = { 1: 'звичайні монстри', 2: 'міні-бос', 3: 'бос' };

  // Дороги: клас → назва, швидкість (км/добу пішки), товщина, колір
  R.Data.roadClasses = {
    major:  { name: 'Велика дорога',   level: 4, speed: 34, width: 3.4, color: '#7a5a34' },
    medium: { name: 'Середня дорога',  level: 3, speed: 28, width: 2.4, color: '#8a6a40' },
    minor:  { name: 'Мала дорога',     level: 2, speed: 22, width: 1.6, color: '#9b7b4e' },
    trail:  { name: 'Стежка',          level: 1, speed: 14, width: 1.1, color: '#a0825a' },
  };
})();
