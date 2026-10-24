// Атлас 2.0: ще ~50 видів місць за містом (шаблони + теми), короткі історії та цвинтарі різних розмірів
(function () {
  'use strict';
  const A = (globalThis.Atlas2 = globalThis.Atlas2 || {}), S = A.TownSites, TAU = Math.PI * 2;
  const pick = (r, a) => a[Math.floor(r() * a.length) % a.length], rr = (r, a, b) => a + r() * (b - a), clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const T = () => A.CityData.T;
  // ---------- історії ----------
  const BUILDER = {
    holy: ['ордену Світлого Полум’я', 'братів-пустельників', 'жриць місячної богині', 'прочан із далекого краю', 'старого єпископа', 'мандрівного проповідника'],
    mil: ['королівського намісника', 'найманців «Чорний Вовк»', 'старого лицаря-вигнанця', 'прикордонного ордену', 'легіонів стародавньої імперії', 'ватажка ополчення'],
    craft: ['гномів-рудознавців', 'цеху винахідників', 'майстра-самітника', 'купецького дому', 'артілі ремісників', 'старого коваля та його синів'],
    arcane: ['мага-самітника', 'давніх ельфів', 'академії чародіїв', 'таємного братства', 'забутої цивілізації', 'учениці, що втекла від наставника'],
    nature: ['мисливців', 'лісових жерців', 'пастухів', 'вільних поселенців', 'кочівників', 'втікачів з кріпацтва'],
    trade: ['купецької гільдії', 'каравану-засновника', 'митників короля', 'торговців прянощами', 'спілки візників'],
    dark: ['культистів', 'некроманта', 'розбійників', 'втікачів-злочинців', 'вампірського роду', 'заколотників']
  };
  const EVENT = {
    ruin: ['занепав після чуми', 'був розграбований у війну', 'згорів дотла й так і не відбудувався', 'зазнав руйнувань від землетрусу', 'спорожнів, коли вичерпалися ресурси', 'був покинутий після загадкових зникнень', 'не пережив облоги', 'занепав, коли змінилася дорога'],
    alive: ['пережив облогу й відбудувався', 'розрісся за останні роки', 'славиться чесною роботою', 'став улюбленою зупинкою мандрівників', 'пережив голодні роки завдяки власним запасам', 'ледве втримався під час війни', 'перейшов у спадок до наступного покоління'],
    mystic: ['щоночі тут чутно тихий спів', 'мешканці бачили в небі дивні вогні', 'на цьому місці колись було диво, про яке тепер розповідають лише старі', 'тут зникало кілька мандрівників', 'тварини тут поводяться дивно', 'деякі стверджують, що тут чують голоси померлих']
  };
  const NOW = {
    active: ['Нині тут {n} мешканців.', 'Нині місце діє, і сюди заходять мандрівники.', 'Господарство ведуть старі мешканці та кілька наймитів.', 'Тепер тут порядкує {who}, і чужих приймають неохоче.', 'Місце процвітає, а його господар шукає охоронців.'],
    ruin: ['Нині тут нікого немає, лише вітер і вороння.', 'Стіни обвалилися, а в підвалах, подейкують, ховаються розбійники.', 'Місцеві обходять його стороною.', 'Тепер тут влаштовують привали ті, кому нічого втрачати.', 'Серед руїн блимає чуже світло.'],
    haunted: ['Нині тут по ночах блукає щось, що не боїться вогню.', 'Нині місце вважається прокляттям, і дехто досі шукає тут скарби.', 'Нині тут оселилися створіння, що не люблять гостей.']
  };
  const WHO = ['вдова колишнього власника', 'невідомий найманець', 'нащадок засновників', 'орендар зі столиці', 'старий староста', 'гільдійський урядник'];
  function story(r, p) {
    const bt = BUILDER[p.tag] ? p.tag : 'nature', st = p.state || 'active', age = Math.round(rr(r, 25, 420)), b = pick(r, BUILDER[bt]);
    const ev = st === 'active' ? (r() < 0.2 ? pick(r, EVENT.mystic) : pick(r, EVENT.alive)) : st === 'haunted' ? pick(r, EVENT.mystic) : pick(r, EVENT.ruin);
    const nowT = pick(r, NOW[st]).replace('{n}', String(Math.round(rr(r, 3, 60)))).replace('{who}', pick(r, WHO));
    return { age, state: st, text: `Збудовано близько ${age} років тому з ініціативи ${b}. Згодом місце ${ev}. ${nowT}` };
  }
  // ---------- форми й геометрія ----------
  const blob = (r, u, v, R, n) => { const p = [], ph = r() * TAU, a2 = r() * 0.25, a3 = r() * 0.2; for (let i = 0; i < (n || 24); i++) { const a = i / (n || 24) * TAU, k = 1 + a2 * Math.sin(2 * a + ph) + a3 * Math.sin(3 * a + 2 * ph); p.push(u + Math.cos(a) * R * k, v + Math.sin(a) * R * k * 0.9); } return p; };
  const chaikin = (p, it) => { for (let t = 0; t < it; t++) { const q = [p[0], p[1]]; for (let i = 2; i < p.length; i += 2) { const x0 = p[i - 2], y0 = p[i - 1], x1 = p[i], y1 = p[i + 1]; q.push(x0 * 0.75 + x1 * 0.25, y0 * 0.75 + y1 * 0.25, x0 * 0.25 + x1 * 0.75, y0 * 0.25 + y1 * 0.75); } q.push(p[p.length - 2], p[p.length - 1]); p = q; } return p; };
  const inPoly = (P, x, y) => { let c = false; for (let i = 0, j = P.length - 2; i < P.length; j = i, i += 2) if ((P[i + 1] > y) !== (P[j + 1] > y) && x < (P[j] - P[i]) * (y - P[i + 1]) / (P[j + 1] - P[i + 1]) + P[i]) c = !c; return c; };
  const dseg = (x, y, p) => { let m = 1e9; for (let i = 2; i < p.length; i += 2) { const dx = p[i] - p[i - 2], dy = p[i + 1] - p[i - 1], t = clamp(((x - p[i - 2]) * dx + (y - p[i - 1]) * dy) / (dx * dx + dy * dy || 1e-9), 0, 1); m = Math.min(m, Math.hypot(p[i - 2] + dx * t - x, p[i - 1] + dy * t - y)); } return m; };
  // ---------- шаблони розташування ----------
  const dim = (id, k) => { const t = T()[id] || T().house; return [t.w * (k || 1), t.h * (k || 1)]; };
  const scatter = (r, list, n, u0, u1, v0, v1) => { const o = []; for (let i = 0; i < n; i++) o.push({ t: pick(r, list), u: rr(r, u0, u1), v: rr(r, v0, v1), r: rr(r, 1.5, 3.2), rot: r() * TAU }); return o; };
  const LAY = {
    court(r, p) { const ext = Math.round(rr(r, 70, 110)), vh = Math.round(rr(r, 24, 36)), m = dim(p.main, 1.3), bl = [{ type: p.main, u: ext - m[0] / 2 - 8, v: 0, w: m[0], h: m[1], name: p.nm }];
      p.sides.forEach((id, i) => { const d = dim(id, 1.1), sd = i % 2 ? 1 : -1; bl.push({ type: id, u: 22 + Math.floor(i / 2) * (d[0] + 8), v: sd * (vh - d[1] / 2 - 4), w: d[0], h: d[1], name: T()[id].n + ' «' + p.nm2 + '»' }); });
      return { ext, exit: p.exit ? [ext, 0] : null, ground: [{ pts: [4, -vh - 6, ext - 4, -vh - 6, ext - 4, vh + 6, 4, vh + 6], col: p.col, edge: p.edge }], walls: p.wall === false ? [] : [{ pts: [8, -7, 8, -vh, ext - 8, -vh, ext - 8, vh, 8, vh, 8, 7], w: 2.4, col: p.wcol || '#7c7466' }], decos: scatter(r, p.deco || ['garden'], 2, 28, ext - 30, -vh + 8, vh - 8), bl, props: [{ t: 'well', u: 30, v: 0, r: 1.8, name: 'Колодязь у дворі' }] }; },
    cluster(r, p) { const R = Math.round(rr(r, 26, 40)), ext = R * 2 + 6, c = R + 3, m = dim(p.main, 1.2), bl = [{ type: p.main, u: c, v: 0, w: m[0], h: m[1], name: p.nm }], ph = r() * TAU;
      p.sides.forEach((id, i) => { const d = dim(id, 1.1), a = ph + (i + 1) / (p.sides.length + 1) * TAU, rad = R * 0.62 + d[0] * 0.2; bl.push({ type: id, u: c + Math.cos(a) * rad, v: Math.sin(a) * rad, w: d[0], h: d[1], rot: a + 1.57, name: T()[id].n + ' «' + p.nm2 + '»' }); });
      return { ext, exit: p.exit ? [ext, 0] : null, ground: [{ pts: blob(r, c, 0, R, 22), col: p.col, edge: p.edge }], walls: [], decos: scatter(r, p.deco || ['garden', 'tree'], 3, 8, ext - 8, -R * 0.7, R * 0.7), bl, props: p.well ? [{ t: 'well', u: c + 5, v: 6, r: 1.8, name: 'Колодязь' }] : [] }; },
    ring(r, p) { const R = Math.round(rr(r, 26, 36)), ext = R * 2 + 8, c = R + 4, m = dim(p.main, 1.2), bl = [{ type: p.main, u: c, v: 0, w: m[0], h: m[1], name: p.nm }];
      p.sides.forEach((id, i) => { const d = dim(id, 1), a = (i + 0.5) / p.sides.length * TAU + 0.4, rad = R * 0.68; bl.push({ type: id, u: c + Math.cos(a) * rad, v: Math.sin(a) * rad, w: d[0], h: d[1], rot: a + 1.57, name: T()[id].n + ' «' + p.nm2 + '»' }); });
      const wp = []; for (let i = 1; i < 27; i++) { const a = Math.PI + i / 27 * TAU; wp.push(c + Math.cos(a) * R, Math.sin(a) * R); }
      return { ext, exit: p.exit ? [ext, 0] : null, ground: [{ pts: blob(r, c, 0, R + 4, 26), col: p.col, edge: p.edge }], walls: [{ pts: wp, w: 2.2, col: p.wcol || '#7c7466' }], decos: scatter(r, p.deco || ['garden'], 3, c - R * 0.6, c + R * 0.6, -R * 0.6, R * 0.6), bl, props: [] }; },
    row(r, p) { const n = 4 + Math.floor(r() * 4), ext = n * 20 + 30, bl = [], ids = [p.main].concat(p.sides); for (let i = 0; i < n * 2; i++) { const id = i === 0 ? p.main : pick(r, ids), d = dim(id, 1), sd = i % 2 ? 1 : -1; bl.push({ type: id, u: 18 + Math.floor(i / 2) * 20 + rr(r, -2, 2), v: sd * (11 + d[1] / 2), w: d[0], h: d[1], name: (id === p.main ? p.nm : T()[id].n + ' «' + p.nm2 + '»'), cond: p.ruin ? 'ruined' : null }); }
      return { ext, exit: p.exit !== false ? [ext, 0] : null, ground: [{ pts: [2, -26, ext - 4, -26, ext - 4, 26, 2, 26], col: p.col, edge: p.edge }], walls: [], decos: scatter(r, p.deco || ['garden', 'tree'], 4, 20, ext - 20, -22, 22), bl, props: [{ t: 'well', u: ext / 2, v: 0, r: 1.8, name: 'Колодязь' }] }; },
    pit(r, p) { const R = Math.round(rr(r, 30, 44)), ext = R * 2 + 6, c = R + 3, m = dim(p.main, 1), bl = [{ type: p.main, u: c + 4, v: -4, w: m[0], h: m[1], name: p.nm }];
      p.sides.forEach((id, i) => { const d = dim(id, 1), a = 0.7 + i * 2.2; bl.push({ type: id, u: c + Math.cos(a) * R * 0.6, v: Math.sin(a) * R * 0.6, w: d[0], h: d[1], rot: a, name: T()[id].n + ' «' + p.nm2 + '»', cond: p.ruin ? 'ruined' : null }); });
      const dc = scatter(r, ['spoil', 'spoil', 'cart'], 8, 10, ext - 10, -R * 0.8, R * 0.8); return { ext, exit: p.exit ? [ext, 0] : null, ground: [{ pts: blob(r, c, 0, R, 26), col: p.col, edge: p.edge }], walls: [], decos: dc, bl, props: [] }; },
    camp(r, p) { const R = Math.round(rr(r, 22, 34)), ext = R * 2 + 6, c = R + 3, bl = [], dc = [{ t: 'fire', u: c, v: 0, r: 2 }]; const nt = 4 + Math.floor(r() * 5);
      for (let i = 0; i < nt; i++) { const a = i / nt * TAU + r() * 0.4; dc.push({ t: 'tent', u: c + Math.cos(a) * R * 0.62, v: Math.sin(a) * R * 0.62, r: rr(r, 4, 6), rot: a }); }
      [p.main].concat(p.sides).forEach((id, i) => { const d = dim(id, 1), a = 0.6 + i * 2.5; bl.push({ type: id, u: c + Math.cos(a) * R * 0.38, v: Math.sin(a) * R * 0.38, w: d[0], h: d[1], rot: a + 1.57, name: i ? T()[id].n : p.nm }); });
      return { ext, exit: p.exit ? [ext, 0] : null, ground: [{ pts: blob(r, c, 0, R, 20), col: p.col, edge: p.edge }], walls: [], decos: dc.concat(scatter(r, ['rack', 'cart'], 3, 8, ext - 8, -R * 0.7, R * 0.7)), bl, props: [] }; },
    ruin(r, p) { const ext = Math.round(rr(r, 70, 100)), vh = Math.round(rr(r, 22, 34)), m = dim(p.main, 1.3), bl = [{ type: p.main, u: ext * 0.62, v: 0, w: m[0], h: m[1], name: p.nm, cond: 'ruined' }];
      p.sides.forEach((id, i) => { const d = dim(id, 1), sd = i % 2 ? 1 : -1; bl.push({ type: id === 'fortkeep' || id === 'mtower' ? 'ruin' : id, u: 22 + i * 14, v: sd * (vh - d[1] / 2 - 4), w: d[0], h: d[1], name: 'Зруйнована ' + T()[id].n.toLowerCase(), cond: 'ruined' }); });
      if (p.dng !== false && r() < 0.7) bl.push({ type: 'dungeon', u: ext - 10, v: rr(r, -8, 8), w: 9, h: 9, name: 'Вхід до підземелля «' + p.nm2 + '»', cond: 'ruined' });
      const seg = (a, b, c2, d2) => ({ pts: [a, b, c2, d2], w: 2.2, col: '#837c70' }); return { ext, exit: null, ground: [{ pts: blob(r, ext / 2, 0, ext * 0.5, 26), col: p.col, edge: p.edge }], walls: [seg(6, -vh, ext * 0.35, -vh), seg(ext * 0.5, -vh, ext - 8, -vh), seg(ext - 8, -vh, ext - 8, -vh * 0.2), seg(ext - 8, vh * 0.3, ext - 8, vh), seg(6, vh, ext * 0.4, vh)], decos: scatter(r, ['tree', 'spoil', 'tree'], 8, 6, ext - 6, -vh, vh), bl, props: [] }; },
    field(r, p) { const R = Math.round(rr(r, 20, 30)), ext = R * 2 + 6, c = R + 3, m = dim(p.main, 1), dc = [], n = p.n || 8;
      for (let i = 0; i < n; i++) { const a = i / n * TAU + r() * 0.2; dc.push({ t: p.ringDeco || 'stone', u: c + Math.cos(a) * R * 0.7, v: Math.sin(a) * R * 0.7, r: rr(r, 1.4, 2.4) }); } if (p.glyph) dc.push({ t: 'glyph', u: c, v: 0, r: R * 0.45 });
      return { ext, exit: p.exit !== false ? [ext, 0] : null, ground: [{ pts: blob(r, c, 0, R, 22), col: p.col, edge: p.edge }], walls: [], decos: dc, bl: [{ type: p.main, u: c, v: 0, w: m[0], h: m[1], name: p.nm }].concat(p.sides.map((id, i) => { const d = dim(id, 1); return { type: id, u: c + (i ? 1 : -1) * R * 0.5, v: R * 0.45, w: d[0], h: d[1], name: T()[id].n }; })), props: [] }; }
  };
  // ---------- таблиця видів (ключ|назва|підпис|шаблон|головна|бічні|земля|кінець|тег|мін.|вага|стан за замовч.|опис) ----------
  const G = `inn_road|Заїзд|Постоялий двір на розстані|court|inn|stable,warehouse,house|#e0d3a0|#a8975c|trade|1|3|active|Двір із навісами, де міняють коней і ночують мандрівники.
customs|Митна застава|Митна застава|court|elder|barracks,hut|#d8cfae|#8d835f|trade|1|2|active|Шлагбаум, прапор і писарі, що рахують вози.
lodge|Лісничівка|Лісничівка|cluster|hut|hut,stable|#b9cf92|#6f8a54|nature|1|3|active|Хатина лісничого з господарськими прибудовами.
fishvillage|Рибальська слобідка|Рибальська слобідка|row|fishhut|fishhut,fishdry,hut|#d6d4b0|#9a9672|nature|1|2|active|Ряд хат і сушарень для риби вздовж дороги.
apiary|Пасіка|Пасіка|cluster|hut|hut,farm|#d4e0a0|#8aa05c|nature|1|2|active|Вулики серед квітучого лугу й хатина пасічника.
cheese|Сироварня|Сироварня|court|farm|farm,warehouse|#cfe0a8|#8da05e|nature|1|2|active|Господарство, що годує околиці молоком і сиром.
brewhut|Хутірська пивоварня|Пивоварня|court|brewery|house,warehouse,tavern|#dccf9c|#a08e58|craft|1|2|active|Невелика пивоварня з корчмою для відвідувачів.
roadsmith|Кузня при дорозі|Кузня на дорозі|cluster|smith|smith,hut,stable|#cfc9b8|#8a8470|craft|1|3|active|Кузня, де підковують коней і лагодять вози.
pottery|Гончарня|Гончарня|cluster|manufact|house,hut|#dcbfa0|#a07a52|craft|1|2|active|Печі для випалу й сушарні для глини.
quarry|Каменоломня|Каменоломня|pit|warehouse|hut,smith|#c9c6bd|#7c7a70|craft|1|3|active|Виробка у скелі, візки з каменем і склад.
claypit|Глиняний кар’єр|Глиняний кар’єр|pit|hut|hut,warehouse|#d6b896|#9a7a58|craft|1|2|active|Жовто-руда яма, звідки беруть глину для цегли.
sawmill|Лісопильня|Лісопильня|cluster|mill|warehouse,hut,hut|#c9d6a0|#7f9a58|craft|1|3|active|Водяна пилорама й штабелі колод.
watermill|Водяний млин|Водяний млин|cluster|mill|farmstead,warehouse|#bcd6c0|#6f9a80|craft|1|3|active|Млин на ставку з комірчиною й садибою мірошника.
guildyard|Склад гільдії|Гільдійський склад|court|warehouse|warehouse,gmerch,stable|#d9cfb0|#9a8e68|trade|2|2|active|Обгороджений склад, де зберігають каравани.
tradepost|Торговий пост|Торговий пост|cluster|gmerch|shop,warehouse,stable|#e2d0a4|#a8935c|trade|2|2|active|Лавки й склад, де міняють вироби, хутра й прянощі.
leprosarium|Притулок прокажених|Притулок|court|hospital|house,chapel|#cfd6c0|#8a947a|holy|2|1|active|Відокремлений притулок за огорожею, куди не вступає ніхто без потреби.
lazaret|Лазарет ордену|Лазарет|court|hospital|house,chapel,pharm|#d9e4d8|#8aa088|holy|2|2|active|Лікарня при ордені, відкрита для кожного.
fightschool|Бойова школа|Школа бойових мистецтв|court|school|barracks,house|#d4cba8|#8a7e58|mil|2|2|active|Тренувальний двір, де вчать фехтувати, стріляти й битися.
arcaneschool|Школа чародіїв|Чарівна школа|court|academy|library,mtower,house|#d6d0ee|#8a6ad0|arcane|3|1|active|Невелика школа, де вчать першим закляттям.
scriptorium|Скрипторій|Скрипторій|court|library|house,chapel|#e0d8b8|#9a8e60|holy|2|2|active|Книжники переписують рукописи й зберігають архіви.
alchemylab|Лабораторія алхіміка|Лабораторія|cluster|galch|hut,warehouse|#cfe0cb|#6f9a74|arcane|2|2|active|Закопчений дім із димарем, що пахне сіркою.
mercfort|Табір найманців|Табір найманців|court|gmerc|barracks,stable,tavern|#d6ccaa|#8a7a50|mil|2|2|active|Тренувальні двори й намети тих, хто воює за золото.
bandits|Сховище розбійників|Бандитська схованка|ruin|hut|hut,warehouse|#bfb59a|#7a6e50|dark|1|3|ruin|Відлюдна схованка за напівзруйнованими стінами.
darkshrine|Темне капище|Темне капище|field|shrine|hut|#bfb0c6|#6a4a78|dark|2|2|haunted|Почорнілий вівтар у колі каменів, оповитий недобрими чутками.
rfort|Зруйнований форт|Зруйнований форт|ruin|fortkeep|barracks,stable|#c6c0aa|#7c7660|mil|2|3|ruin|Колись грізний форт, тепер купа каменю й вежа без даху.
rtemple|Зруйнований храм|Зруйнований храм|ruin|temple|chapel|#d0ccc0|#7c7a6a|holy|2|3|ruin|Арки без склепіння й чорний від копоті вівтар.
rmage|Зруйнована вежа магів|Зруйнована вежа|ruin|mtower|hut|#cfc6dc|#7a5ad0|arcane|2|3|haunted|Напівзруйнована вежа, де ще блимають магічні вогні.
oldmine|Закинута шахта|Закинута шахта|pit|mineshaft|hut,warehouse|#bdb7a8|#7c7668|craft|1|3|ruin|Завалений вхід у штольню та іржаві вагонетки.
deadvillage|Покинуте село|Покинуте село|row|house|house,farmstead,hut|#b8c690|#7a8a58|nature|1|3|ruin|Хати без дахів, поросле бур’яном подвір’я та тиша.
stoneoftales|Камінь переказів|Камінь переказів|field|obelisk|hut|#d2cfbe|#948f7a|mystic|1|2|active|Давній камінь із вирізьбленими знаками, біля якого збираються оповідачі.
barrow|Курган|Курган|field|dungeon|obelisk|#bcc89a|#6f8a54|mystic|1|3|haunted|Земляний курган зі входом, закладеним плитою.
dolmen|Дольмен|Давній дольмен|field|shrine|obelisk|#cfd6b0|#7f9a5e|mystic|1|3|haunted|Кам’яні плити, складені велетнями, і вогонь свічок у щілинах.
forestchapel|Лісова каплиця|Лісова каплиця|cluster|chapel|hut|#bed6a0|#6f9a58|holy|1|3|active|Скромна каплиця серед дерев і хатина доглядача.
crossroads|Хрест на роздоріжжі|Придорожній хрест|field|shrine|hut|#d6dcb0|#8aa05c|holy|1|3|active|Кам’яний хрест, біля якого лишають дари подорожні.
magicwell|Чарівний колодязь|Чарівний колодязь|field|well|shrine|#cfe0e8|#6a9ab8|mystic|1|2|active|Колодязь, вода з якого, кажуть, лікує або зводить з розуму.
borderpost|Прикордонна застава|Прикордонна застава|court|barracks|hut,stable|#d4ccaa|#8a8058|mil|1|3|active|Стіна, ворота й вартові, що перевіряють кожну підводу.
capelight|Маяк на мисі|Маяк на мисі|cluster|lighthouse|fishhut,fishdry|#dce0e0|#8a9aa0|nature|2|1|active|Вежа маяка й хати доглядачів.
smugglers|Пристань контрабандистів|Пристань|cluster|warehouse|hut,tavern,fishhut|#cdc6b0|#7a7258|dark|2|2|active|Тихий причал, де розвантажують те, чого не показують митникам.
hermits|Оселя відлюдників|Оселя відлюдників|cluster|hut|hut,hut,chapel|#c3d6a6|#7a9a5a|holy|1|3|active|Хатки в лісі, де мовчанка цінується більше за слово.
pilgrims|Табір паломників|Табір паломників|camp|chapel|hut|#d6d8b0|#9aa05c|holy|1|3|active|Намети й вогнища тих, хто йде на прощу.
nomads|Стоянка кочівників|Стоянка кочівників|camp|stable|hut|#dcd0a0|#a8975c|nature|1|3|active|Вози, шатра й табун коней, що пасуться неподалік.
refugees|Табір біженців|Табір біженців|camp|hut|hut,hut|#cfcbb0|#8a8668|nature|1|2|active|Намети та сарайчики людей, що втекли від лиха.
ruinedarena|Руїни арени|Руїни арени|ruin|arena|ruin|#d2c6a8|#8a7a58|mil|3|1|ruin|Колись тут билися гладіатори, а тепер ростуть кущі й лунає луна.
greenhouse|Оранжерея алхіміка|Оранжерея|cluster|pharm|hut,farm|#c6e0b0|#6a9a58|arcane|2|2|active|Скляні теплиці з дивними травами.
mint|Монетний двір|Монетний двір|court|bank|barracks,warehouse|#e0d8a8|#a09858|trade|3|1|active|Укріплений двір, де карбують монету під сильною охороною.
manorfarm|Садиба барона|Садиба|court|estate|rich,stable,farm,house|#d4e0a8|#8aa058|trade|2|3|active|Родова садиба з маєтком, стайнею й службами.
huntinglodge|Мисливський будинок|Мисливський будинок|cluster|rich|stable,hut|#c8d6a0|#7a9a58|nature|2|2|active|Велика хата з рогами над дверима й псарнею.
penmine|Рудня-в’язниця|Копальня-в’язниця|pit|prison|hut,warehouse|#b6b2a8|#6f6c64|dark|3|1|active|Каторжанська копальня з вартовими на вишках.
holywell|Святий колодязь|Святий колодязь|field|well|chapel|#cfe0e0|#6a9a9a|holy|1|3|active|Джерело з каплицею, куди приходять по воду.
hillfort|Городище|Городище|ring|barracks|hut,stable,hut|#d0d0a8|#8a8a5a|mil|1|2|ruin|Давній вал із рову й частоколу.
beacon|Сигнальна вежа|Сигнальна вежа|ring|mtower|hut|#d6d0b0|#8a8058|mil|1|3|active|Вежа з багаттям, яке палять при небезпеці.
monkcell|Скит|Скит|ring|chapel|hut,hut|#d6e0c0|#7a9a60|holy|1|2|active|Невелика обитель, відрізана від світу частоколом.
orchard|Старий сад|Старий сад|cluster|farmstead|hut,farm|#cfe0a0|#7a9a50|nature|1|3|active|Яблуневі ряди, комора й хата садівника.
wolfden|Лігво вовкулак|Лігво|ruin|lair|hut|#b8aaa0|#6a5a50|dark|1|1|haunted|Нора між руїнами, де чути виття навіть удень.`.split('\n').map(l => l.split('|'));
  const NAMEP = ['', ''];
  G.forEach(g => {
    const [id, lab, sub, lay, main, sides, col, edge, tag, mn, w, st, d] = g;
    S.KINDS[id] = { min: +mn, w: +w, tag, st, f(r, q) {
      const nm = lab + ' «' + q.nm + '»', sp = LAY[lay](r, { main, sides: sides.split(','), col, edge, nm, nm2: q.nm2, tag, exit: lay !== 'court' && lay !== 'ruin' && lay !== 'pit' && r() < 0.7 || lay === 'row' || lay === 'field', ruin: st === 'ruin', deco: ['garden', 'tree'], well: r() < 0.6, glyph: tag === 'mystic' || tag === 'dark', n: 5 + Math.floor(r() * 8), ringDeco: tag === 'mystic' ? 'stone' : 'stone' });
      sp.name = nm; sp.sub = sub; sp.text = d; sp.rows = []; return sp; } };
  });
  // ---------- завершення: історія для всіх видів ----------
  const TAGOF = { fort: 'mil', manor: 'mil', abbey: 'holy', magetower: 'arcane', observatory: 'arcane', mine: 'craft', caravan: 'trade', prison: 'mil', shrine: 'holy', graveyard: 'holy', hunters: 'nature', hamlet: 'nature', obelisk: 'arcane', portal: 'arcane', techlab: 'craft', watchtower: 'mil' };
  const STOF = { manor: 'ruin', graveyard: 'active', portal: 'haunted' };
  const KEYS = Object.keys(S.KINDS);
  let dg = 0;
  S.make = function (r, o) {
    const X = A.CityText, pool = KEYS.filter(k => S.KINDS[k].min <= o.tier && (!o.small || ['caravan', 'shrine', 'hunters', 'hamlet', 'obelisk', 'watchtower', 'graveyard', 'inn_road', 'lodge', 'apiary', 'crossroads', 'holywell', 'orchard', 'pilgrims', 'nomads', 'barrow', 'dolmen', 'stoneoftales', 'forestchapel', 'magicwell', 'roadsmith', 'cheese', 'watermill', 'oldmine', 'deadvillage'].includes(k)) && !(o.ban || []).includes(k));
    const tot = pool.reduce((a, k) => a + S.KINDS[k].w, 0); let q = r() * tot, kind = pool[0]; for (const k of pool) { q -= S.KINDS[k].w; if (q <= 0) { kind = k; break; } }
    const K = S.KINDS[kind], sp = K.f(r, { nm: X.mkName(r), nm2: X.mkName(r) }), tag = K.tag || TAGOF[kind] || 'nature', st0 = K.st || STOF[kind] || 'active', st = st0 === 'active' && r() < 0.12 ? 'ruin' : st0 === 'ruin' && r() < 0.25 ? 'haunted' : st0;
    const h = story(r, { tag, state: st }); sp.kind = kind; sp.state = st; sp.age = h.age; sp.history = h.text; sp.text = sp.text + ' ' + h.text; sp.rows = (sp.rows || []).concat([['Збудовано', h.age + ' р. тому'], ['Стан', { active: 'діє', ruin: 'руїни', haunted: 'недобре місце' }[st]]]);
    if (st !== 'active') sp.bl.forEach(b => { if (!b.cond && r() < 0.7) b.cond = 'ruined'; });
    return sp;
  };
  S.dungeonId = () => ++dg;
  // ---------- цвинтар: розмір 0..4 ----------
  S.graveyard = function (r, n, q) {
    const hl = [12, 20, 32, 46, 64][n] * rr(r, 0.9, 1.15), hw = hl * rr(r, 0.55, 0.95), L = hl * 2, nm = pick(r, ['Цвинтар', 'Старий цвинтар', 'Кладовище', 'Місце спочинку']) + ' «' + q.nm + '»';
    const shape = n === 0 ? 'mound' : pick(r, ['rect', 'trap', 'round', 'hex']); let P;
    if (shape === 'trap') P = [0, -hw, L, -hw * rr(r, 0.5, 0.8), L, hw * rr(r, 0.5, 0.8), 0, hw]; else if (shape === 'hex') P = [0, -hw * 0.6, L * 0.25, -hw, L * 0.8, -hw * 0.95, L, -hw * 0.3, L, hw * 0.35, L * 0.75, hw, L * 0.25, hw * 0.9, 0, hw * 0.6];
    else if (shape === 'round') P = chaikin([0, -hw * 0.5, L * 0.15, -hw * 0.95, L * 0.6, -hw, L, -hw * 0.5, L, hw * 0.5, L * 0.6, hw, L * 0.15, hw * 0.95, 0, hw * 0.5], 2); else P = [0, -hw, L, -hw, L, hw, 0, hw];
    const g = Math.max(3, hw * 0.12), f0 = P[1], f1 = P[P.length - 1];
    const walls = n === 0 ? [] : [{ pts: [0, -g].concat(P, [0, g]), w: n >= 3 ? 2.2 : 1.3, col: n >= 3 ? '#8a8478' : '#8a6a44' }];
    const ground = [{ pts: P, col: n === 0 ? '#b6c796' : '#aebf8e', edge: '#6a7a52' }];
    // дороги й стежки
    const paths = [], pw = [1.2, 1.6, 2.2, 2.8, 3.4][n];
    paths.push({ pts: [-4, 0, L * 0.9, 0], w: pw });
    if (n >= 2) paths.push({ pts: [L * 0.45, -hw * 0.82, L * 0.45, hw * 0.82], w: pw * 0.8 });
    if (n >= 3) { const s = r() < 0.5 ? 1 : -1; paths.push({ pts: [L * 0.2, 0, L * 0.35, s * hw * 0.5, L * 0.7, s * hw * 0.55, L * 0.9, 0], w: pw * 0.7 }); }
    if (n >= 4) { paths.push({ pts: [L * 0.15, 0, L * 0.3, -hw * 0.55, L * 0.75, -hw * 0.55, L * 0.9, 0], w: pw * 0.7 }); paths.push({ pts: [L * 0.7, -hw * 0.9, L * 0.7, hw * 0.9], w: pw * 0.6 }); }
    if (n >= 1) for (let i = 0; i < n + 1; i++) { const u = rr(r, L * 0.2, L * 0.85), sd = r() < 0.5 ? 1 : -1; paths.push({ pts: [u, 0, u + rr(r, -6, 6), sd * hw * rr(r, 0.4, 0.8)], w: 0.9 }); }
    // споруди
    const bl = [], dc = [], tooClose = (u, v, d) => bl.some(b => Math.hypot(b.u - u, b.v - v) < d);
    if (n >= 1) bl.push({ type: 'chapel', u: L * 0.82, v: rr(r, -0.2, 0.2) * hw, w: 8 + n * 1.5, h: 6 + n, rot: 0, name: 'Каплиця цвинтаря «' + q.nm + '»' });
    const nc = n === 0 ? 0 : n + (r() < 0.5 ? 1 : 0), cr = [];
    for (let i = 0, tries = 0; i < nc && tries < 80; tries++) { const u = rr(r, L * 0.3, L * 0.9), v = rr(r, -0.8, 0.8) * hw; if (!inPoly(P, u, v) || !inPoly(P, u + 6, v + 5) || !inPoly(P, u - 6, v - 5) || tooClose(u, v, 14)) continue; if (paths.some(p => dseg(u, v, p.pts) < 4)) continue; const big = n >= 3 && i === 0; bl.push({ type: 'crypt', u, v, w: big ? 12 : 6 + r() * 3, h: big ? 10 : 6 + r() * 3, rot: 0, name: (big ? 'Мавзолей роду «' : 'Склеп «') + q.nm2 + (i ? i : '') + '»', desc: 'Вхід у підземелля: сходи вниз за кованими дверима. Мавзолей або склеп приховує далі галереї катакомб.', dungeon: true }); i++; cr.push(1); }
    // могили
    const sx = 3.6, sy = 4.6, maxG = [14, 60, 150, 320, 520][n];
    if (n === 0) { for (let i = 0; i < 9; i++) dc.push({ t: 'mound', u: rr(r, 2, L - 2), v: rr(r, -hw * 0.9, hw * 0.9), r: rr(r, 1.2, 2.2), rot: r() * 3 }); for (let i = 0; i < 4; i++) dc.push({ t: 'grave', u: rr(r, 2, L - 2), v: rr(r, -hw * 0.9, hw * 0.9) }); }
    else { let c = 0; for (let u = 4; u < L - 2 && c < maxG; u += sx) for (let v = -hw; v < hw && c < maxG; v += sy) { const x = u + rr(r, -0.6, 0.6), y = v + rr(r, -0.6, 0.6); if (r() < 0.25 || !inPoly(P, x, y) || !inPoly(P, x - 1.5, y - 1.5) || !inPoly(P, x + 1.5, y + 1.5)) continue; if (paths.some(p => dseg(x, y, p.pts) < p.w / 2 + 1.4)) continue; if (bl.some(b => Math.abs(b.u - x) < b.w / 2 + 2 && Math.abs(b.v - y) < b.h / 2 + 2)) continue; c++; const t = r(); dc.push({ t: t < 0.04 * (n + 1) ? 'statue' : t < 0.18 ? 'tomb' : t < 0.4 ? 'cross' : 'grave', u: x, v: y, r: t < 0.04 * (n + 1) ? rr(r, 1.4, 2.2) : 1, rot: 0 }); } }
    for (let i = 0; i < 4 + n * 4; i++) { const a = r() * TAU, k = rr(r, 0.4, 0.95), u = L / 2 + Math.cos(a) * hl * k, v = Math.sin(a) * hw * k; if (inPoly(P, u, v) && !paths.some(p => dseg(u, v, p.pts) < 2.5) && !bl.some(b => Math.abs(b.u - u) < b.w / 2 + 2 && Math.abs(b.v - v) < b.h / 2 + 2)) dc.push({ t: 'tree', u, v, r: rr(r, 2.2, 3.4), rot: 0 }); }
    const h = story(r, { tag: 'holy', state: 'active' });
    return { kind: 'graveyard', name: nm, sub: ['Кілька могил', 'Сільський цвинтар', 'Міський цвинтар', 'Великий цвинтар', 'Некрополь'][n], text: ['Кілька земляних горбків і хрестів просто край дороги.', 'Огороджений цвинтарик із хрестами й дерев’яною каплицею.', 'Охайний цвинтар зі стежками, склепами й каплицею.', 'Великий цвинтар із головною алеєю, родинними склепами й статуями.', 'Давній некрополь-місто: алеї, галереї склепів, мавзолеї знаті й вежа-каплиця.'][n] + ' ' + h.text, rows: [['Могил', '≈ ' + dc.filter(d => /grave|tomb|cross|statue|mound/.test(d.t)).length * (n >= 3 ? 3 : 1)], ['Склепів', String(bl.filter(b => b.dungeon).length)], ['Збудовано', h.age + ' р. тому']], ext: L, hl, hw, exit: null, ground, walls, paths, decos: dc, bl, props: [], state: 'active' };
  };
})();
