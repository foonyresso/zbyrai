// Теми оформлення карти: кожен світ має власну палітру моря й суші, колір берега, доріг, річок, меж і значків. Тема береться з параметра theme.
// Поля: sea (7 відтінків за відстанню до берега), lake, glow (світлий край мілководдя), coast (лінія берега), bg (тло поза картою),
// tint (перефарбування біомів: h — зсув відтінку °, s — множник насиченості, l — додаток яскравості, mix — [колір, частка]),
// river, borders (межі провінцій), roads (великі, середні, малі й стежки), route (морські шляхи), tree, rock, alpha (сила кольору провінцій).
(function () {
  'use strict';
  const R = (globalThis.RealmMap = globalThis.RealmMap || {});
  const base = { tint: { h: 0, s: 1, l: 0, mix: ['#000000', 0] }, alpha: 0.30 };
  const T = {
    // «Материк»: класична зелена карта з теплим пергаментним тоном
    continent: Object.assign({}, base, {
      name: 'Класична', sea: ['#9fd0dc', '#88c0d2', '#74afc6', '#629eb9', '#518cac', '#437b9d', '#386d8f'], lake: '#7cbcd2', glow: 'rgba(214,240,246,.5)', coast: 'rgba(58,44,30,.85)', bg: '#242833',
      river: '#4f93b0', border: '#3a2432', roads: { major: '#e2c27f', medium: '#d1a967', minor: '#6b4a2a', casing: '#2e2113' }, route: '#f3fbff', tree: '#4d7e3a', rock: ['#b3aa9a', '#8a8274'],
    }),
    // «Архіпелаг»: тропіки, бірюзове море, пісочні пляжі, соковита зелень
    archipelago: Object.assign({}, base, {
      name: 'Тропіки', sea: ['#c5f3ec', '#98e8de', '#6bdad2', '#44c5cc', '#2fabc0', '#2490b5', '#1b749f'], lake: '#6fe0d6', glow: 'rgba(255,246,206,.75)', coast: 'rgba(122,86,40,.9)', bg: '#143f4a',
      tint: { h: 8, s: 1.32, l: 0.04, mix: ['#f2e2a0', 0.1] }, alpha: 0.24,
      river: '#2fb0c4', border: '#6a2a3c', roads: { major: '#f6d98c', medium: '#e6bf72', minor: '#7a5a30', casing: '#4a3418' }, route: '#fffbe0', tree: '#2f9a4a', rock: ['#c8bca4', '#9a8c70'],
    }),
    // «Один острів»: північний, холодний, приглушений, туманний
    island: Object.assign({}, base, {
      name: 'Північ', sea: ['#b5c6d3', '#9bb2c3', '#829db3', '#6a88a1', '#56738f', '#445f7b', '#344c68'], lake: '#7897ae', glow: 'rgba(226,238,246,.6)', coast: 'rgba(36,40,48,.9)', bg: '#1a212c',
      tint: { h: 14, s: 0.62, l: -0.05, mix: ['#7b8a96', 0.18] }, alpha: 0.2,
      river: '#6a93ae', border: '#2c3446', roads: { major: '#cfc2a2', medium: '#b9ab8a', minor: '#4e4a42', casing: '#23262d' }, route: '#e8f2fa', tree: '#456b57', rock: ['#a4abb2', '#7a828b'],
    }),
    // «Суходіл із морями»: давній, посушливий, охра й теракота, мутні внутрішні моря
    pangea: Object.assign({}, base, {
      name: 'Пустельна давнина', sea: ['#cfdccb', '#b2cdc0', '#94bdb3', '#79ada6', '#629a98', '#4e8688', '#3f7479'], lake: '#86b8a8', glow: 'rgba(244,222,176,.65)', coast: 'rgba(74,44,22,.92)', bg: '#2a2019',
      tint: { h: -12, s: 1.12, l: 0.02, mix: ['#cf9a5c', 0.2] }, alpha: 0.32,
      river: '#5fa3a0', border: '#4a2418', roads: { major: '#f0cf8a', medium: '#d8ae6c', minor: '#6a4426', casing: '#3a2412' }, route: '#fff1cf', tree: '#7f8a3c', rock: ['#c0a888', '#947a5c'],
    }),
  };
  R.Themes = T;
})();
