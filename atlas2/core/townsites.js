// Атлас 2.0: місця на кінцях доріг за містом (форти, помістя, монастирі, шахти…) у локальних координатах:
// (0,0) — вхід, u — вперед від міста, v — убік
(function () {
  'use strict';
  const A = (globalThis.Atlas2 = globalThis.Atlas2 || {}), X = () => A.CityText, TAU = Math.PI * 2;
  const pick = (r, a) => a[Math.floor(r() * a.length) % a.length], rr = (r, a, b) => a + r() * (b - a);
  const circ = (u, v, R, n) => { const p = []; for (let i = 0; i < (n || 24); i++) p.push(u + Math.cos(i / (n || 24) * TAU) * R, v + Math.sin(i / (n || 24) * TAU) * R); return p; };
  // стіна-прямокутник із проломом-брамою спереду (u0), g — півширина проходу
  const rect = (u0, u1, vh, g) => [u0, -g, u0, -vh, u1, -vh, u1, vh, u0, vh, u0, g];
  const box = (u0, u1, vh) => [u0, -vh, u1, -vh, u1, vh, u0, vh, u0, -vh];

  const KINDS = {
    fort: { min: 2, w: 3, f(r, q) {
      const ext = 90, vh = 32, nm = pick(r, ['Форт', 'Застава', 'Фортеця', 'Бастіон']) + ' «' + q.nm + '»';
      return { name: nm, sub: 'Військовий форт', ext, exit: null, text: 'Кам’яна застава з гарнізоном: контролює дорогу, збирає мито й вирушає на виклики. Двері до внутрішнього двору замикають на ніч.',
        ground: [{ pts: box(6, ext - 4, vh + 6), col: '#c9bd9a', edge: '#8a7d5a' }], walls: [{ pts: rect(8, ext - 8, vh, 7), w: 3.2, col: '#6a6a78' }],
        decos: [[8, -vh], [8, vh], [ext - 8, -vh], [ext - 8, vh]].map(p => ({ t: 'tower', u: p[0], v: p[1], r: 4.5 })),
        bl: [{ type: 'barracks', u: 46, v: -17, w: 34, h: 13, name: 'Казарми «' + q.nm + '»' }, { type: 'stable', u: 46, v: 19, w: 22, h: 12, name: 'Стайня гарнізону' }, { type: 'smith', u: 24, v: -22, w: 12, h: 10, name: 'Кузня гарнізону' }, { type: 'fortkeep', u: ext - 22, v: 0, w: 22, h: 22, name: 'Цитадель «' + q.nm + '»' }],
        props: [{ t: 'well', u: 26, v: 12, r: 1.8, name: 'Колодязь у дворі форту' }], rows: [['Гарнізон', '≈ ' + Math.round(rr(r, 30, 120))]] };
    } },
    manor: { min: 1, w: 3, f(r, q) {
      const ext = 100, nm = 'Зруйноване помістя «' + q.nm + '»';
      return { name: nm, sub: 'Руїни помістя', ext, exit: null, text: 'Колись багатий рід володів цим маєтком, поки його не спіткала лиха доля. Стіни обвалилися, у садку розрослася лозина, а в льосі, кажуть, хтось досі ходить: біля східців чути гуркіт і блимає світло.',
        ground: [{ pts: box(4, ext - 6, 40), col: '#a9b585', edge: '#6e7a52' }], walls: [{ pts: [6, -26, 6, -40, 40, -40, 44, -40], w: 2.4, col: '#7a7468' }, { pts: [60, -40, ext - 8, -40, ext - 8, 8], w: 2.4, col: '#7a7468' }, { pts: [ext - 8, 24, ext - 8, 40, 66, 40], w: 2.4, col: '#7a7468' }, { pts: [30, 40, 6, 40, 6, 28], w: 2.4, col: '#7a7468' }],
        decos: [{ t: 'garden', u: 30, v: 26, r: 14 }, { t: 'garden', u: 30, v: -26, r: 12 }],
        bl: [{ type: 'estate', u: 58, v: 0, w: 34, h: 20, name: 'Покинутий маєток', cond: 'ruined' }, { type: 'ruin', u: 38, v: -26, w: 12, h: 10, name: 'Зруйнована кухня', cond: 'ruined' }, { type: 'ruin', u: 40, v: 24, w: 14, h: 9, name: 'Обвалена конюшня', cond: 'ruined' }, { type: 'dungeon', u: ext - 16, v: -8, w: 9, h: 9, name: 'Вхід до підземелля помістя', cond: 'ruined', desc: 'Східці вниз до льоху: за легендами, під маєтком ціла система склепів і казематів.' }],
        props: [], rows: [['Стан', 'руїни'], ['Підземелля', 'так']] };
    } },
    abbey: { min: 2, w: 2, f(r, q) {
      const ext = 96, vh = 34, nm = pick(r, ['Монастир', 'Абатство', 'Обитель']) + ' «' + q.nm + '»';
      return { name: nm, sub: 'Монастир', ext, exit: null, text: 'Чернечий орден живе тут за статутом: вирощує сад і город, переписує книги й приймає прочан. Брама відчинена для кожного до заходу сонця.',
        ground: [{ pts: box(6, ext - 4, vh + 6), col: '#c3cf9a', edge: '#85935e' }], walls: [{ pts: rect(8, ext - 8, vh, 6), w: 2.4, col: '#8a8470' }],
        decos: [{ t: 'garden', u: 28, v: -20, r: 11 }, { t: 'garden', u: 28, v: 20, r: 11 }, { t: 'grave', u: ext - 24, v: 24 }, { t: 'grave', u: ext - 20, v: 26 }, { t: 'grave', u: ext - 28, v: 27 }, { t: 'grave', u: ext - 22, v: 21 }],
        bl: [{ type: 'monast', u: 60, v: 0, w: 38, h: 20, name: nm }, { type: 'library', u: 44, v: -22, w: 16, h: 11, name: 'Скрипторій' }, { type: 'house', u: 42, v: 22, w: 14, h: 9, name: 'Келії братів' }, { type: 'hospital', u: ext - 20, v: -22, w: 14, h: 10, name: 'Лікарня обителі' }],
        props: [{ t: 'well', u: 24, v: 0, r: 1.8, name: 'Колодязь обителі' }], rows: [['Братів', '≈ ' + Math.round(rr(r, 12, 60))]] };
    } },
    magetower: { min: 2, w: 2.5, f(r, q) {
      const ext = 84, nm = 'Вежа чарівника «' + q.nm + '»';
      const st = []; for (let i = 0; i < 8; i++) st.push({ t: 'stone', u: 52 + Math.cos(i / 8 * TAU) * 28, v: Math.sin(i / 8 * TAU) * 28, r: 1.6 });
      return { name: nm, sub: 'Вежа магів', ext, exit: null, text: 'Висока вежа самітника чи малого ордену. Навколо коло стоячих каменів, а зі шпиля вночі б’є ледь помітне світло. Місцеві обходять її стороною, але вдаються по зілля та амулети.',
        ground: [{ pts: circ(52, 0, 36, 28), col: '#cbbfe0', edge: '#8a6ad0' }], walls: [], decos: st.concat([{ t: 'glyph', u: 52, v: 0, r: 22 }]),
        bl: [{ type: 'mtower', u: 52, v: 0, w: 15, h: 15, name: nm }, { type: 'hut', u: 28, v: -20, w: 9, h: 8, name: 'Хатина учнів' }, { type: 'galch', u: 28, v: 20, w: 11, h: 9, name: 'Лабораторія зіль' }],
        props: [], rows: [['Мешканців', '≈ ' + Math.round(rr(r, 3, 14))]] };
    } },
    observatory: { min: 2, w: 1.5, f(r, q) {
      const ext = 76, nm = 'Обсерваторія «' + q.nm + '»';
      return { name: nm, sub: 'Обсерваторія', ext, exit: null, text: 'Купол на пагорбі, звідки астрономи стежать за зорями, затемненнями й комітами; дехто каже, що вони ще й пророкують війни та неврожаї.',
        ground: [{ pts: circ(44, 0, 30, 26), col: '#d6d0b4', edge: '#948a68' }], walls: [{ pts: circ(44, 0, 28, 26), w: 1.8, col: '#8a8470' }],
        decos: [], bl: [{ type: 'observ', u: 44, v: 0, w: 18, h: 18, name: nm }, { type: 'house', u: 20, v: -20, w: 11, h: 9, name: 'Дім астрономів' }, { type: 'library', u: 66, v: 14, w: 10, h: 8, name: 'Архів спостережень' }], props: [], rows: [] };
    } },
    mine: { min: 1, w: 2.5, f(r, q) {
      const ext = 92, nm = pick(r, ['Шахта', 'Копальня', 'Рудник']) + ' «' + q.nm + '»', ore = pick(r, ['залізної руди', 'міді', 'срібла', 'вугілля', 'самоцвітів']);
      const d = []; for (let i = 0; i < 7; i++) d.push({ t: 'spoil', u: rr(r, 36, 84), v: rr(r, -30, 30), r: rr(r, 2.5, 6) });
      return { name: nm, sub: 'Шахта', ext, exit: null, text: 'Дерев’яний шахтний ствол, відвали породи й візки з ' + ore + '. Штреки сягають глибоко, а гірники подейкують про глухі стуки з-під землі.',
        ground: [{ pts: circ(52, 0, 40, 26), col: '#bdb7a8', edge: '#7c7668' }], walls: [], decos: d.concat([{ t: 'cart', u: 30, v: 8, r: 3 }, { t: 'cart', u: 36, v: -6, r: 3 }]),
        bl: [{ type: 'mineshaft', u: 60, v: -4, w: 12, h: 12, name: nm }, { type: 'warehouse', u: 26, v: -22, w: 18, h: 12, name: 'Склад руди' }, { type: 'smith', u: 24, v: 22, w: 12, h: 10, name: 'Кузня шахти' }, { type: 'hut', u: 44, v: 24, w: 9, h: 7, name: 'Барак гірників' }, { type: 'hut', u: 62, v: 26, w: 9, h: 7, name: 'Барак гірників' }],
        props: [], rows: [['Видобуток', ore]] };
    } },
    caravan: { min: 1, w: 3, f(r, q) {
      const ext = 78, vh = 28, nm = 'Караван-сарай «' + q.nm + '»';
      return { name: nm, sub: 'Караван-сарай', ext, exit: [ext, 0], text: 'Обгороджений двір з навісами для верблюдів і возів. Тут міняють коней, торгують із возів і слухають чутки з усіх кінців світу. Дорога йде далі повз нього.',
        ground: [{ pts: box(4, ext, vh + 8), col: '#e0cf9a', edge: '#a8975c' }], walls: [{ pts: rect(10, ext - 14, vh, 7), w: 2.4, col: '#8a7a58' }],
        decos: [{ t: 'tent', u: 0, v: -vh - 10, r: 6, rot: 0.3 }, { t: 'tent', u: 8, v: vh + 11, r: 6, rot: -0.2 }, { t: 'fire', u: 4, v: vh + 4, r: 1.6 }],
        bl: [{ type: 'inn', u: ext - 24, v: 0, w: 14, h: 40, name: nm }, { type: 'stable', u: 36, v: -20, w: 30, h: 10, name: 'Стійла' }, { type: 'stable', u: 36, v: 20, w: 30, h: 10, name: 'Навіси для возів' }, { type: 'warehouse', u: ext - 24, v: -32, w: 14, h: 8, name: 'Комора караванів' }],
        props: [{ t: 'well', u: 34, v: 0, r: 2, name: 'Колодязь двору' }], rows: [['Місць для возів', '≈ ' + Math.round(rr(r, 10, 30))]] };
    } },
    prison: { min: 3, w: 1.5, f(r, q) {
      const ext = 76, vh = 26, nm = 'Острог «' + q.nm + '»';
      return { name: nm, sub: 'В’язниця', ext, exit: null, text: 'Окремий каземат далеко від міста: тут тримають небезпечних і впливових в’язнів. Тікати нікуди, а вночі у вікнах не горить жодне світло.',
        ground: [{ pts: box(6, ext - 4, vh + 6), col: '#b9b6ae', edge: '#6f6c66' }], walls: [{ pts: rect(8, ext - 8, vh, 6), w: 3, col: '#55555e' }],
        decos: [[8, -vh], [8, vh], [ext - 8, -vh], [ext - 8, vh]].map(p => ({ t: 'tower', u: p[0], v: p[1], r: 4 })),
        bl: [{ type: 'prison', u: 48, v: 0, w: 34, h: 24, name: nm }, { type: 'barracks', u: 28, v: -17, w: 18, h: 9, name: 'Казарма наглядачів' }, { type: 'hut', u: 24, v: 18, w: 10, h: 8, name: 'Будка вартового' }], props: [], rows: [['В’язнів', '≈ ' + Math.round(rr(r, 20, 150))]] };
    } },
    shrine: { min: 1, w: 3, f(r, q) {
      const ext = 56, nm = pick(r, ['Святилище', 'Каплиця при дорозі', 'Давнє капище']) + ' «' + q.nm + '»', st = [];
      for (let i = 0; i < 7; i++) st.push({ t: 'stone', u: 30 + Math.cos(i / 7 * TAU) * 17, v: Math.sin(i / 7 * TAU) * 17, r: 1.8 });
      return { name: nm, sub: 'Святилище', ext, exit: [ext, 0], text: 'Камінь і невелика споруда в колі вікових дерев. Подорожні лишають монети, стрічки й хліб; хтось у це вірить, хтось просто звик.',
        ground: [{ pts: circ(30, 0, 24, 22), col: '#c6d6a2', edge: '#7f9a5e' }], walls: [], decos: st.concat([{ t: 'fire', u: 30, v: 8, r: 1.2 }]),
        bl: [{ type: 'shrine', u: 30, v: 0, w: 7, h: 7, name: nm }, { type: 'hut', u: 46, v: -16, w: 8, h: 7, name: 'Хатина доглядача' }], props: [], rows: [] };
    } },
    graveyard: { min: 1, w: 1.5, f(r, q) {
      const ext = 70, nm = 'Старий цвинтар «' + q.nm + '»', d = [];
      for (let i = 0; i < 28; i++) d.push({ t: 'grave', u: 14 + (i % 7) * 7.2, v: -17 + Math.floor(i / 7) * 11 + (i % 3) });
      return { name: nm, sub: 'Цвинтар', ext, exit: null, text: 'Повалені надгробки, склеп і нашорошена варта сторожа. Подейкують, що в повню тут ходить хтось незваний.',
        ground: [{ pts: box(6, ext - 4, 28), col: '#a9bd96', edge: '#677a58' }], walls: [{ pts: rect(8, ext - 8, 25, 5), w: 1.6, col: '#7a7468' }], decos: d,
        bl: [{ type: 'chapel', u: ext - 20, v: 0, w: 14, h: 10, name: 'Каплиця цвинтаря' }, { type: 'crypt', u: ext - 22, v: -16, w: 9, h: 9, name: 'Родовий склеп', desc: 'Тут ховали рід, що давно вимер; вхід замурований, але недостатньо надійно.' }, { type: 'hut', u: 22, v: 22, w: 8, h: 7, name: 'Хатка сторожа' }], props: [], rows: [] };
    } },
    hunters: { min: 1, w: 3, f(r, q) {
      const ext = 62, nm = 'Табір мисливців «' + q.nm + '»', d = [];
      for (let i = 0; i < 3; i++) d.push({ t: 'rack', u: rr(r, 44, 56), v: rr(r, -20, 20), r: 4, rot: r() });
      return { name: nm, sub: 'Мисливський табір', ext, exit: [ext, 0], text: 'Табір вільних стрільців: намети й шкури на жердинах, дим від багаття. Тут можна купити хутро й дізнатися, де нині водиться звір.',
        ground: [{ pts: circ(32, 0, 26, 20), col: '#b4c78d', edge: '#6f8a54' }], walls: [], decos: d.concat([{ t: 'fire', u: 32, v: 0, r: 2 }, { t: 'tent', u: 20, v: -14, r: 5, rot: 0.4 }, { t: 'tent', u: 20, v: 15, r: 5, rot: -0.4 }, { t: 'tent', u: 42, v: -18, r: 5, rot: 0.2 }]),
        bl: [{ type: 'hut', u: 46, v: 14, w: 11, h: 9, name: 'Хатина ватажка' }, { type: 'hut', u: 14, v: 0, w: 9, h: 8, name: 'Хатина мисливця' }], props: [], rows: [] };
    } },
    hamlet: { min: 1, w: 3, f(r, q) {
      const ext = 84, nm = 'Хутір «' + q.nm + '»';
      return { name: nm, sub: 'Хутір з вітряком', ext, exit: [ext, 0], text: 'Кілька садиб, вітряк і загони. Хутір живить місто хлібом і молоком, а дорога тут розходиться далі, до інших ферм.',
        ground: [{ pts: circ(40, 0, 36, 24), col: '#cfd9a0', edge: '#8da05e' }], walls: [], decos: [{ t: 'garden', u: 30, v: -26, r: 9 }, { t: 'garden', u: 56, v: 28, r: 9 }],
        bl: [{ type: 'windmill', u: 40, v: -2, w: 9, h: 9, name: 'Вітряк хутора' }, { type: 'farmstead', u: 18, v: -22, w: 13, h: 11, name: 'Садиба ' + q.nm }, { type: 'farmstead', u: 60, v: -20, w: 13, h: 11, name: 'Садиба ' + q.nm2 }, { type: 'farm', u: 24, v: 24, w: 15, h: 13, name: 'Ферма ' + q.nm2 }, { type: 'tavern', u: 58, v: 18, w: 13, h: 11, name: 'Корчма «Біля вітряка»' }],
        props: [{ t: 'well', u: 36, v: 14, r: 1.8, name: 'Колодязь хутора' }], rows: [] };
    } },
    obelisk: { min: 2, w: 1.5, f(r, q) {
      const ext = 54, nm = pick(r, ['Обеліск', 'Колона', 'Давній монумент']) + ' «' + q.nm + '»', st = [];
      for (let i = 0; i < 12; i++) st.push({ t: 'stone', u: 28 + Math.cos(i / 12 * TAU) * 20, v: Math.sin(i / 12 * TAU) * 20, r: 1.3 });
      return { name: nm, sub: 'Давній монумент', ext, exit: [ext, 0], text: 'Вікова кам’яна споруда з нерозбірливими написами. Кажуть, його звели ще до королівств; дехто знаходить у різьбленні карти й пророцтва.',
        ground: [{ pts: circ(28, 0, 24, 24), col: '#d6d2c0', edge: '#948f7a' }], walls: [], decos: st, bl: [{ type: 'obelisk', u: 28, v: 0, w: 6, h: 6, name: nm }], props: [], rows: [] };
    } },
    portal: { min: 3, w: 1, f(r, q) {
      const ext = 66, nm = 'Коло порталу «' + q.nm + '»', st = [];
      for (let i = 0; i < 6; i++) st.push({ t: 'stone', u: 36 + Math.cos(i / 6 * TAU) * 24, v: Math.sin(i / 6 * TAU) * 24, r: 2.4 });
      return { name: nm, sub: 'Ритуальне коло', ext, exit: null, text: 'Шість моноліт з блакитним світінням і розбита площа з символами. Колись це був вузол мережі порталів; тепер повітря тут лунає низьким гулом, а птахи облітають місце стороною.',
        ground: [{ pts: circ(36, 0, 30, 26), col: '#cfc2e6', edge: '#7a5ad0' }], walls: [], decos: st.concat([{ t: 'glyph', u: 36, v: 0, r: 16 }, { t: 'glyph', u: 36, v: 0, r: 8 }]),
        bl: [{ type: 'portal', u: 36, v: 0, w: 11, h: 11, name: nm }], props: [], rows: [['Небезпека', 'магічна']] };
    } },
    techlab: { min: 3, w: 1.5, f(r, q) {
      const ext = 86, vh = 30, nm = 'Майстерня «' + q.nm + '»';
      return { name: nm, sub: 'Майстерня винахідників', ext, exit: null, text: 'Огороджена територія з гулом механізмів: тут конструюють парові двигуни, ґвинтові механізми й дивну зброю. Подейкують про нещасні випадки.',
        ground: [{ pts: box(6, ext - 4, vh + 6), col: '#c9c6bd', edge: '#8a867a' }], walls: [{ pts: rect(8, ext - 8, vh, 6), w: 2, col: '#6c6c76' }], decos: [{ t: 'cart', u: 22, v: -12, r: 3 }, { t: 'spoil', u: ext - 16, v: 24, r: 4 }, { t: 'spoil', u: ext - 12, v: 20, r: 3 }],
        bl: [{ type: 'techlab', u: 52, v: 0, w: 30, h: 18, name: nm }, { type: 'manufact', u: 30, v: -20, w: 20, h: 12, name: 'Цех складання' }, { type: 'warehouse', u: 30, v: 20, w: 16, h: 10, name: 'Склад деталей' }, { type: 'hut', u: ext - 16, v: -20, w: 9, h: 8, name: 'Житло інженерів' }], props: [], rows: [] };
    } },
    watchtower: { min: 1, w: 3, f(r, q) {
      const ext = 54, nm = 'Сторожова вежа «' + q.nm + '»';
      return { name: nm, sub: 'Сторожова вежа', ext, exit: [ext, 0], text: 'Вежа з частоколом: стежить за дорогою, у разі лиха палить сигнальний вогонь. Дорога проходить прямо повз неї.',
        ground: [{ pts: circ(30, 0, 22, 20), col: '#cfc7a8', edge: '#8a8060' }], walls: [{ pts: circ(30, 0, 20, 20), w: 1.8, col: '#7a5a38' }], decos: [{ t: 'fire', u: 30, v: 12, r: 1.4 }],
        bl: [{ type: 'mtower', u: 30, v: 0, w: 9, h: 9, name: nm }, { type: 'hut', u: 40, v: 11, w: 8, h: 7, name: 'Барак сторожі' }], props: [], rows: [] };
    } }
  };
  const SMALL = ['caravan', 'shrine', 'hunters', 'hamlet', 'obelisk', 'watchtower', 'graveyard'];
  const BY_TIER = Object.keys(KINDS);
  function make(r, o) {
    const X_ = X(), pool = BY_TIER.filter(k => KINDS[k].min <= o.tier && (!o.small || SMALL.includes(k)) && !(o.ban || []).includes(k)); const tot = pool.reduce((a, k) => a + KINDS[k].w, 0);
    let q = r() * tot, kind = pool[0]; for (const k of pool) { q -= KINDS[k].w; if (q <= 0) { kind = k; break; } }
    const spec = KINDS[kind].f(r, { nm: X_.mkName(r), nm2: X_.mkName(r) }); spec.kind = kind; return spec;
  }
  A.TownSites = { make, KINDS, circ };
})();
