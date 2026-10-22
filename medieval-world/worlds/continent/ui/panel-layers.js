// Вкладка «Шари»: перемикачі шарів і готові набори.
(function () {
  'use strict';
  const R = (globalThis.RealmMap = globalThis.RealmMap || {}), U = R.UI, App = U.App;
  const GROUPS = [
    ['Територія', [['political', 'Колір провінцій', 'Забарвлення суші за провінціями'], ['provinceBorders', 'Межі провінцій', 'Товсті межі між провінціями (країнами)'], ['regionBorders', 'Межі регіонів', 'Тонкі пунктирні межі між регіонами (областями)'], ['relief', 'Гори, ліси, пагорби', 'Значки рельєфу й рослинності'], ['rivers', 'Річки', 'Річки та їхні притоки']]],
    ['Дороги', [['road_major', 'Великі дороги', 'Між центрами регіонів і столицями', '#7a5a34', ''], ['road_medium', 'Середні дороги', 'Від великих до менших міст, занепалих і захоплених', '#8a6a40', ''], ['road_minor', 'Малі дороги', 'До сіл, шахт, озер, гір, руїн і давніх пам’ятників', '#9b7b4e', ''], ['road_trail', 'Стежки', 'До дрібних місць, лісових проходів, таборів і лігв', '#a0825a', 'dot'], ['sea', 'Морські шляхи', 'Між портами, поблизу берега, повз лігва глибин', '#8fd0f0', 'dash']]],
    ['Об’єкти', [['settlements', 'Поселення', 'Столиці, міста, села, хутори, шахти'], ['pois', 'Цікаві місця', 'Озера, гори, руїни, пам’ятники, галявини, табори'], ['lairs', 'Лігва монстрів і боси', 'Звичайні лігва, міні-боси й боси гір, лісів і морів'], ['danger', 'Карта небезпеки', 'Червоне сяйво навколо лігв і захоплених поселень']]],
  ];
  const PRESETS = {
    all: { label: 'Усе', title: 'Увімкнути всі шари, крім карти небезпеки', set: L => { for (const k in L) L[k] = k !== 'danger'; } },
    political: { label: 'Політична', title: 'Провінції, межі, великі дороги й назви без дрібниць', set: L => { for (const k in L) L[k] = false; Object.assign(L, { political: true, provinceBorders: true, regionBorders: true, rivers: true, road_major: true, settlements: true, scale: true }); } },
    roads: { label: 'Дороги', title: 'Усі чотири типи доріг і поселення', set: L => { for (const k in L) L[k] = false; Object.assign(L, { rivers: true, relief: true, road_major: true, road_medium: true, road_minor: true, road_trail: true, settlements: true, scale: true }); } },
    danger: { label: 'Небезпека', title: 'Лігва, боси, морські шляхи й карта небезпеки', set: L => { for (const k in L) L[k] = false; Object.assign(L, { relief: true, rivers: true, road_major: true, road_medium: true, sea: true, settlements: true, lairs: true, danger: true, scale: true }); } },
  };
  App.buildLayersPanel = function () {
    const pn = U.$('pnLayers'); pn.textContent = ''; const checks = [];
    pn.append(U.el('h2', { text: 'Набори' }));
    pn.append(U.el('div', { class: 'row', style: 'flex-wrap:wrap' }, Object.values(PRESETS).map(p => U.el('button', { text: p.label, title: p.title, onclick: () => { p.set(App.scene.layers); checks.forEach(c => c.sync()); App.scene.dirty = true; U.store.set('layers', App.scene.layers); } }))));
    for (const [title, items] of GROUPS) {
      pn.append(U.el('h2', { text: title }));
      for (const [key, label, tip, sw, dash] of items) checks.push(U.check(pn, { label, title: tip, swatch: sw, dash, get: () => App.scene.layers[key], set: v => { App.scene.layers[key] = v; App.scene.dirty = true; U.store.set('layers', App.scene.layers); } }));
    }
    pn.append(U.el('p', { class: 'hint', text: 'Дрібні значки з’являються при наближенні: хутори, шахти, малі місця й звичайні лігва. Столиці, центри регіонів і містечка видно завжди.' }));
  };
})();
