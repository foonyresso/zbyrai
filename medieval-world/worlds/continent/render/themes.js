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
    // «Астракор»: космос замість моря, смарагдова суша, бірюзове світіння, золоті кристали
    astrakor: Object.assign({}, base, {
      name: 'Космос і корені', sea: ['#222a55', '#1c2347', '#161c3b', '#111530', '#0d1126', '#0a0d1d', '#070a17'], lake: '#1d6a66', glow: 'rgba(64,224,198,.35)', coast: 'rgba(10,60,50,.95)', bg: '#05070f',
      tint: { h: 6, s: 1.2, l: -0.08, mix: ['#0f4a3c', 0.14] }, alpha: 0.2,
      river: '#2fe0c6', border: '#d6b45a', roads: { major: '#e6c76a', medium: '#c9a84e', minor: '#6a5a30', casing: '#1a1408' }, route: '#7ff0e0', tree: '#1f7a3c', rock: ['#4a3a2a', '#2a1f14'],
    }),
    // «Останки»: вицвілі кольори, сірий камінь, порожнеча між уламками
    ostanky: Object.assign({}, base, {
      name: 'Мертві історії', sea: ['#5a5f6c', '#4f5461', '#454a57', '#3b404c', '#323641', '#2a2d37', '#22252d'], lake: '#59666e', glow: 'rgba(200,196,184,.3)', coast: 'rgba(30,28,24,.9)', bg: '#1d1e24',
      tint: { h: 4, s: 0.45, l: -0.02, mix: ['#8a8578', 0.22] }, alpha: 0.16,
      river: '#6f8088', border: '#3a3a40', roads: { major: '#b8ad94', medium: '#9a9078', minor: '#5a5448', casing: '#25231f' }, route: '#c8c4b8', tree: '#5a6a4a', rock: ['#9a9486', '#6e6a5e'],
    }),
    // «Кровостеп»: червоні рівнини, чорні скелі, багряні шляхи
    krovostep: Object.assign({}, base, {
      name: 'Червоний голод', sea: ['#7a2a2a', '#6a2024', '#5a181e', '#4a1218', '#3b0e14', '#2d0a10', '#22070c'], lake: '#8a2b2b', glow: 'rgba(200,60,50,.3)', coast: 'rgba(20,6,6,.95)', bg: '#1a0b0b',
      tint: { h: -95, s: 0.95, l: -0.1, mix: ['#7a2418', 0.38] }, alpha: 0.12,
      river: '#a02a2e', border: '#2a0f10', roads: { major: '#c89a68', medium: '#a8805a', minor: '#5a3a2a', casing: '#1a0a08' }, route: '#e8c8a8', tree: '#6a2a22', rock: ['#3a2a2a', '#1f1515'],
    }),
    // «Вершинниця»: насичена зелень велетенських крон, туман між стовбурами
    vershynnytsia: Object.assign({}, base, {
      name: 'Крони', sea: ['#86b0a0', '#729f90', '#608e80', '#507d70', '#406c60', '#325b51', '#264a41'], lake: '#5aa8a0', glow: 'rgba(220,240,200,.4)', coast: 'rgba(14,40,24,.9)', bg: '#0b1f14',
      tint: { h: 8, s: 1.38, l: -0.1, mix: ['#0e3a1e', 0.16] }, alpha: 0.2,
      river: '#4fb0a0', border: '#1f3a28', roads: { major: '#d8c890', medium: '#b8a870', minor: '#5a4a30', casing: '#1a2a1a' }, route: '#e8f4e0', tree: '#1f6a2a', rock: ['#6a6a58', '#44443a'],
    }),
    // «Неборід»: білі хмарні платформи, сині провалля, темні шпилі
    neborid: Object.assign({}, base, {
      name: 'Хмарні гори', sea: ['#b4dcf4', '#98cdee', '#7cbce4', '#65aad6', '#5198c8', '#4186b8', '#3374a4'], lake: '#7cbce4', glow: 'rgba(250,252,255,.7)', coast: 'rgba(60,66,84,.9)', bg: '#243a56',
      tint: { h: 24, s: 0.3, l: 0.14, mix: ['#f4f6fa', 0.42] }, alpha: 0.14,
      river: '#7cbce4', border: '#3c4258', roads: { major: '#e4e4ec', medium: '#c4c4d0', minor: '#6a6a7a', casing: '#2a2e3e' }, route: '#ffffff', tree: '#7f9aa8', rock: ['#5a5f6e', '#3c404e'],
    }),
    // «Міднокрил»: мідь, гірська зелень, хмари на рівні скель
    midnokryl: Object.assign({}, base, {
      name: 'Мідні гнізда', sea: ['#cfe3e4', '#b8d6d8', '#9bbcc3', '#7f9fab', '#68899a', '#536979', '#46596a'], lake: '#9bbcc3', glow: 'rgba(232,242,240,.55)', coast: 'rgba(66,63,73,.9)', bg: '#423F49',
      tint: { h: -6, s: 0.62, l: 0, mix: ['#A77750', 0.14] }, alpha: 0.2,
      river: '#7f9fab', border: '#423F49', roads: { major: '#D7C8A6', medium: '#c0a97f', minor: '#6a5a48', casing: '#2b2830' }, route: '#e8f2f0', tree: '#6f8f77', rock: ['#5B5B65', '#3e3e48'],
    }),
  };
  R.Themes = T;
})();
