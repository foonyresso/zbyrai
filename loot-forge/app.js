// Loot Forge: інтерфейс. Уся логіка генерації й розрахунків живе в loot-core.js.
(function () {
  'use strict';
  const L = LootCore;
  const $ = id => document.getElementById(id);

  /* ---------- допоміжне ---------- */
  function h(tag, props, ...kids) {
    const e = document.createElement(tag);
    if (props) for (const [k, v] of Object.entries(props)) {
      if (v == null || v === false) continue;
      if (k === 'class') e.className = v;
      else if (k === 'text') e.textContent = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else if (v === true) e.setAttribute(k, '');
      else e.setAttribute(k, v);
    }
    for (const c of kids.flat()) { if (c == null || c === false) continue; e.append(c.nodeType ? c : document.createTextNode(String(c))); }
    return e;
  }
  const store = {
    get(k, d) { try { const v = localStorage.getItem('lf_' + k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem('lf_' + k, JSON.stringify(v)); } catch {} },
  };
  let toastTimer;
  function toast(msg) {
    const t = $('toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
  }
  const fmtNum = n => (isFinite(n) ? (Math.round(n * 100) / 100).toLocaleString('uk-UA') : '∞');
  const pctText = p => (p >= .1 ? (p * 100).toFixed(1) : p >= .001 ? (p * 100).toFixed(2) : (p * 100).toFixed(3)) + '%';
  const uid = prefix => prefix + Math.random().toString(36).slice(2, 6);
  const clampNum = (v, d, lo, hi) => (Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d);

  /* ---------- стан ---------- */
  const saved = store.get('state', null);
  let S;
  try {
    S = saved && saved.cfg ? Object.assign({}, saved, { cfg: L.sanitize(saved.cfg) }) : null;
  } catch { S = null; }
  if (!S) S = { preset: 'fantasy', cfg: L.PRESETS.fantasy() };
  S = Object.assign({
    seed: L.randomSeed(), ilvl: 10, humor: 1, count: 6, rarity: 'any', slot: 'any', tab: 'items',
    simN: 10000, drop: 20, pity: 0, kpm: 6, open: { roll: true, rar: true, gdd: true },
    src: 'mob', luck: 0, setCode: '', setChance: 0, gemTier: 0,
  }, S);
  let items = [];       // поточні предмети
  let legacySel = null; // вибраний предмет у ляльці героя
  let simResult = null; // результат останньої симуляції

  function save() {
    if (S.cfg && S.cfg.game && typeof GddCore !== 'undefined') GddCore.touch(S.cfg.game);
    store.set('state', S);
  }
  const cfg = () => S.cfg;
  const statLine = (st, v, plus) => `${st.name}: ${plus ? '+' : ''}${v}${st.pct ? '%' : ''}`;

  /* ---------- шапка ---------- */
  const selPreset = $('selPreset');
  for (const [k, n] of Object.entries(L.PRESET_NAMES)) selPreset.append(h('option', { value: k }, n));
  selPreset.append(h('option', { value: 'custom' }, 'Свій (імпорт)'));
  selPreset.value = L.PRESETS[S.preset] ? S.preset : 'custom';
  selPreset.addEventListener('change', () => {
    if (selPreset.value === 'custom') return;
    S.preset = selPreset.value; S.cfg = L.PRESETS[S.preset](); afterStructure(); toast('Набір «' + L.PRESET_NAMES[S.preset] + '»');
  });
  $('btnReset').addEventListener('click', () => {
    if (!L.PRESETS[S.preset]) { toast('Це імпортований набір: скинути нікуди'); return; }
    S.cfg = L.PRESETS[S.preset](); afterStructure(); toast('Набір повернуто до початкового');
  });

  /* ---------- ліва панель ---------- */
  function section(key, title, count, body) {
    const d = h('details', { class: 'sec', open: !!S.open[key] }, h('summary', null, title, count != null ? h('span', { class: 'n' }, count) : null), h('div', { class: 'sec-b' }, body));
    d.addEventListener('toggle', () => { S.open[key] = d.open; save(); });
    return d;
  }
  const numIn = (value, on, o = {}) => h('input', { type: 'number', class: 'num', value, min: o.min, max: o.max, step: o.step || 'any', 'aria-label': o.label, onchange: e => on(parseFloat(e.target.value)) });
  const txtIn = (value, on, o = {}) => h('input', { type: 'text', class: 'txt', value, 'aria-label': o.label, onchange: e => on(e.target.value) });

  /* ---------- шар GodsDontDie (gdd-ui.js) ---------- */
  const GAME = typeof GddCore !== 'undefined' && typeof GddUI !== 'undefined';
  const isGame = () => GAME && GddCore.isOn(cfg());
  const GUI = GAME ? GddUI.create({
    h, S, L, cfg, section, numIn, txtIn, fmtNum, pctText, clampNum, save, toast, copyText,
    getItems: () => items, roll: () => roll(), reseedAndRoll: () => reseedAndRoll(), renderOut: () => renderOut(), renderRules: () => renderRules(),
    afterStructure: () => afterStructure(), makeRuneword: rw => makeRuneword(rw), makeNamed: id => makeNamed(id),
  }) : null;
  function pushItem(it) { items.unshift(it); S.tab = 'items'; save(); renderOut(); }
  function makeRuneword(rw) {
    const C = cfg(), g = C.game, ix = GddCore.idx(g);
    const bases = ix.gear.filter(b => { const k = ix.cls.get(b.cls); return k && k.hasStats && k.maxSockets >= rw.runes.length && (rw.kinds.includes(k.insertKind) || rw.kinds.includes(k.id)); });
    if (!bases.length) { toast('Немає типу предмета, куди влізе це рунне слово'); return; }
    const rng = L.rngFromSeed(S.seed + ':rw:' + rw.id + ':' + (items.length));
    const base = bases[Math.floor(rng() * bases.length)];
    const it = GddCore.rollItem(C, rng, { ilvl: S.ilvl, source: S.src, luck: S.luck, humor: S.humor, slot: base.id });
    it.halfStars = 1; it.baseSockets = rw.runes.length; it.setCode = null;
    GddCore.derive(g, it);
    rw.runes.forEach((r, i) => GddCore.insert(g, it, i, 'rune.' + r));
    GddCore.derive(g, it);
    pushItem(it); toast('Зібрано «' + rw.name + '»');
  }
  function makeNamed(id) {
    try { pushItem(GddCore.rollNamed(cfg(), L.rngFromSeed(S.seed + ':named:' + id + ':' + items.length), id, S.ilvl)); } catch (e) { toast(e.message); }
  }

  function chanceCells() {
    const pr = L.rarityProbs(cfg());
    document.querySelectorAll('[data-chance]').forEach(c => { c.textContent = pctText(pr[+c.dataset.chance] || 0); });
  }

  function renderRules() {
    const root = $('rules'); root.textContent = '';
    const C = cfg();
    if (GUI) {
      root.append(GUI.modeSection());
      if (GddCore.isOn(C)) { GUI.rules(root); return; }
    }

    // кидок
    const seedIn = h('input', { type: 'text', value: S.seed, 'aria-label': 'Seed', onchange: e => { S.seed = e.target.value.trim() || L.randomSeed(); e.target.value = S.seed; save(); roll(); } });
    root.append(section('roll', 'Кидок', null, [
      h('div', { class: 'row' }, h('label', null, 'Seed'), seedIn, h('button', { title: 'Новий випадковий seed', onclick: () => { S.seed = L.randomSeed(); seedIn.value = S.seed; save(); roll(); } }, '🎲')),
      h('div', { class: 'row' }, h('label', null, 'Рівень предмета'), numIn(S.ilvl, v => { S.ilvl = Math.round(clampNum(v, 1, 1, 200)); save(); roll(); }, { min: 1, max: 200, step: 1, label: 'Рівень предмета' }), h('span', { class: 'hint' }, 'відкриває афікси з вимогою рівня')),
      h('div', { class: 'row' }, h('label', null, 'Приріст за рівень'), numIn(Math.round(C.levelScale * 1000) / 10, v => { C.levelScale = clampNum(v, 8, 0, 200) / 100; save(); roll(); }, { min: 0, max: 200, step: 0.5, label: 'Приріст за рівень, відсотків' }), h('span', { class: 'hint' }, '% до значень на кожен рівень')),
      h('div', { class: 'row' }, h('label', null, 'Шанс унікального'), numIn(C.uniqueChance || 0, v => { C.uniqueChance = clampNum(v, 0, 0, 100); save(); roll(); }, { min: 0, max: 100, step: 0.5, label: 'Шанс унікального предмета, відсотків' }), h('span', { class: 'hint' }, '% предметів стають унікальними (список унікальних і комплектів задається в JSON-конфігу)')),
      h('div', { class: 'row' }, h('label', null, 'Гумор текстів'),
        h('div', { class: 'seg small', role: 'group', 'aria-label': 'Гумор текстів' }, ['Серйозно', 'Іронічно', 'Чорний', 'Без гальм'].map((n, i) =>
          h('button', { class: S.humor === i ? 'on' : '', onclick: () => { S.humor = i; save(); renderRules(); roll(); } }, n)))),
    ]));

    // рідкості
    const rar = h('div', { class: 'tbl' }, h('div', { class: 'tr head rar' }, h('span'), h('span', null, 'Назва'), h('span', null, 'Вага'), h('span', null, 'Від'), h('span', null, 'До'), h('span', null, '×'), h('span', { style: 'text-align:right' }, 'Шанс')));
    C.rarities.forEach((r, i) => rar.append(h('div', { class: 'tr rar' },
      h('input', { type: 'color', value: /^#[0-9a-f]{6}$/i.test(r.color) ? r.color : '#a39e93', 'aria-label': 'Колір', onchange: e => { r.color = e.target.value; save(); renderOut(); } }),
      txtIn(r.name, v => { r.name = v.trim() || r.name; save(); renderOut(); }, { label: 'Назва рідкості' }),
      numIn(r.weight, v => { r.weight = clampNum(v, 1, 0, 1e6); save(); chanceCells(); }, { min: 0, label: 'Вага' }),
      numIn(r.min, v => { r.min = Math.round(clampNum(v, 0, 0, 12)); save(); }, { min: 0, max: 12, step: 1, label: 'Мін. афіксів' }),
      numIn(r.max, v => { r.max = Math.round(clampNum(v, 0, 0, 12)); save(); }, { min: 0, max: 12, step: 1, label: 'Макс. афіксів' }),
      numIn(r.mult, v => { r.mult = clampNum(v, 1, 0, 100); save(); }, { min: 0, step: 0.05, label: 'Множник значень' }),
      h('span', { class: 'chance', 'data-chance': i }),
    )));
    root.append(section('rar', 'Рідкості', C.rarities.length, [rar, h('p', { class: 'hint' }, 'Вага задає відносну частоту. «Від»/«До» кількість афіксів. «×» множить усі значення предмета.')]));

    // характеристики
    const st = h('div', { class: 'tbl' }, h('div', { class: 'tr head stat' }, h('span', null, 'Ключ'), h('span', null, 'Назва'), h('span', null, 'Вага'), h('span', null, '%'), h('span')));
    for (const [id, s] of Object.entries(C.stats)) st.append(h('div', { class: 'tr stat' },
      h('span', { class: 'id', title: id }, id),
      txtIn(s.name, v => { s.name = v.trim() || s.name; save(); renderOut(); }, { label: 'Назва характеристики' }),
      numIn(s.w, v => { s.w = clampNum(v, 1, 0, 1000); save(); }, { min: 0, step: 0.05, label: 'Вага в силі предмета' }),
      h('input', { type: 'checkbox', checked: !!s.pct, 'aria-label': 'Відсоток', onchange: e => { if (e.target.checked) s.pct = true; else delete s.pct; save(); renderOut(); } }),
      h('button', { class: 'x', title: 'Видалити (разом з афіксами й базою, що її використовують)', onclick: () => removeStat(id) }, '✕'),
    ));
    st.append(h('button', { class: 'add', onclick: () => { C.stats[uid('stat_')] = { name: 'Нова характеристика', w: 1 }; save(); renderRules(); } }, '+ характеристика'));
    root.append(section('stat', 'Характеристики', Object.keys(C.stats).length, [st, h('p', { class: 'hint' }, 'Вага визначає внесок у «силу» предмета: так порівнюються різні стати.')]));

    // типи предметів
    const sl = h('div', { class: 'tbl' }, h('div', { class: 'tr head slot' }, h('span'), h('span', null, 'Тип'), h('span', null, 'Теги'), h('span', null, 'Вага'), h('span', null, 'База (ключ:від-до)'), h('span')));
    C.slots.forEach((s, i) => sl.append(h('div', { class: 'tr slot' },
      h('input', { type: 'checkbox', checked: s.on !== false, 'aria-label': 'Увімкнено', onchange: e => { s.on = e.target.checked; save(); } }),
      txtIn(s.name, v => { s.name = v.trim() || s.name; save(); }, { label: 'Назва типу' }),
      txtIn(s.tags.join(', '), v => { s.tags = v.split(',').map(x => x.trim()).filter(Boolean); save(); }, { label: 'Теги' }),
      numIn(s.weight == null ? 1 : s.weight, v => { s.weight = clampNum(v, 1, 0, 1000); save(); }, { min: 0, step: 0.1, label: 'Вага випадіння типу' }),
      txtIn(L.baseToText(s.base), v => { s.base = L.textToBase(v, C.stats); save(); renderRules(); }, { label: 'База' }),
      h('button', { class: 'x', title: 'Видалити тип', onclick: () => { C.slots.splice(i, 1); save(); renderRules(); } }, '✕'),
    )));
    sl.append(h('button', { class: 'add', onclick: () => { C.slots.push({ id: uid('slot_'), name: 'Новий тип', tags: ['weapon'], base: {}, on: true }); save(); renderRules(); } }, '+ тип предмета'));
    root.append(section('slot', 'Типи предметів', C.slots.length, [sl, h('p', { class: 'hint' }, 'Теги вирішують, які афікси сюди підходять (афікс з тегом «any» підходить усім). Вага типу: чим більша, тим частіше випадає (0 = ніколи).')]));

    // афікси
    const af = h('div', { class: 'tbl' }, h('div', { class: 'tr head aff' }, h('span'), h('span', null, 'Стат'), h('span', null, 'Від'), h('span', null, 'До'), h('span', { class: 'tg' }, 'Теги'), h('span', { class: 'lv' }, 'Рів.'), h('span')));
    C.affixes.forEach((a, i) => af.append(h('div', { class: 'tr aff' },
      h('input', { type: 'checkbox', checked: a.on !== false, 'aria-label': 'Увімкнено', onchange: e => { a.on = e.target.checked; save(); } }),
      h('select', { 'aria-label': 'Характеристика', onchange: e => { a.stat = e.target.value; save(); } }, Object.entries(C.stats).map(([id, s]) => h('option', { value: id, selected: id === a.stat }, s.name))),
      numIn(a.min, v => { a.min = clampNum(v, 0, -1e6, 1e6); save(); }, { label: 'Мінімум' }),
      numIn(a.max, v => { a.max = clampNum(v, 0, -1e6, 1e6); save(); }, { label: 'Максимум' }),
      h('span', { class: 'tg' }, txtIn(a.tags.join(', '), v => { a.tags = v.split(',').map(x => x.trim()).filter(Boolean); if (!a.tags.length) a.tags = ['any']; save(); }, { label: 'Теги' })),
      h('span', { class: 'lv' }, numIn(a.lvl || 1, v => { a.lvl = Math.round(clampNum(v, 1, 1, 999)); save(); }, { min: 1, step: 1, label: 'Мінімальний рівень' })),
      h('button', { class: 'x', title: 'Видалити афікс', onclick: () => { C.affixes.splice(i, 1); save(); renderRules(); } }, '✕'),
    )));
    af.append(h('button', { class: 'add', onclick: () => { const first = Object.keys(C.stats)[0]; if (!first) return; C.affixes.push({ id: uid('a_'), stat: first, min: 1, max: 5, tags: ['any'], lvl: 1, on: true }); save(); renderRules(); } }, '+ афікс'));
    root.append(section('aff', 'Афікси', C.affixes.length, [af, h('p', { class: 'hint' }, 'Діапазон значення афікса до множників рівня й рідкості.')]));

    chanceCells();
  }

  function removeStat(id) {
    const C = cfg();
    delete C.stats[id];
    C.affixes = C.affixes.filter(a => a.stat !== id);
    C.slots.forEach(s => { delete s.base[id]; });
    afterStructure();
  }

  /* ---------- права панель ---------- */
  function afterStructure() { S.rarity = 'any'; S.slot = 'any'; save(); selPreset.value = L.PRESETS[S.preset] ? S.preset : 'custom'; renderRules(); roll(); }

  function roll() {
    const C = cfg();
    try {
      const bad = L.validate(C);
      if (bad.length) { items = []; renderOut(bad[0]); return; }
      const o = { ilvl: S.ilvl, humor: S.humor, rarity: S.rarity === 'any' ? null : S.rarity, slot: S.slot === 'any' ? null : S.slot };
      if (isGame()) {
        o.source = S.src; o.luck = S.luck; o.setChance = S.setChance;
        o.setCode = S.setCode === '__random' ? GddCore.randomSetCode(L.rngFromSeed(S.seed + ':set')() * 2147483647) : (S.setCode || null);
      }
      items = L.rollMany(C, S.count, S.seed, o);
      renderOut();
    } catch (e) { items = []; renderOut('Не вдалося згенерувати: ' + e.message); }
  }
  function reseedAndRoll() { S.seed = L.randomSeed(); save(); const i = document.querySelector('#rules input[aria-label="Seed"]'); if (i) i.value = S.seed; roll(); }

  document.querySelectorAll('#tabs button').forEach(b => b.addEventListener('click', () => { S.tab = b.dataset.tab; save(); renderOut(); }));

  function renderOut(problem) {
    const game = isGame();
    if (!game && (S.tab === 'gcalc' || S.tab === 'gcat')) S.tab = 'items';
    document.querySelectorAll('#tabs button').forEach(b => {
      b.hidden = (b.dataset.tab === 'gcalc' || b.dataset.tab === 'gcat') && !game;
      const on = b.dataset.tab === S.tab; b.classList.toggle('on', on); b.setAttribute('aria-selected', on);
    });
    const out = $('out'); out.textContent = '';
    if (problem) { out.append(h('div', { class: 'warns' }, h('div', { class: 'warn' }, problem))); return; }
    if (S.tab === 'items') renderItems(out); else if (S.tab === 'sim') renderSim(out); else if (S.tab === 'gcalc') GUI.renderGameCalc(out); else if (S.tab === 'gcat') GUI.renderCatalog(out); else renderCalc(out);
  }

  function renderItems(out) {
    if (isGame()) { GUI.renderItems(out); return; }
    const C = cfg();
    const sel = (opts, cur, on, label) => h('select', { 'aria-label': label, onchange: e => on(e.target.value) }, opts.map(([v, t]) => h('option', { value: v, selected: v === cur }, t)));
    out.append(h('div', { class: 'bar-tools' },
      h('button', { class: 'btn-forge', onclick: reseedAndRoll }, 'Кинути'), h('kbd', null, 'Пробіл'),
      h('label', null, 'Скільки', sel([[3, '3'], [6, '6'], [12, '12'], [24, '24']], S.count, v => { S.count = +v; save(); roll(); }, 'Кількість предметів')),
      h('label', null, 'Рідкість', sel([['any', 'Будь-яка']].concat(C.rarities.map(r => [r.id, r.name])), S.rarity, v => { S.rarity = v; save(); roll(); }, 'Рідкість')),
      h('label', { title: 'Кидати тільки предмети одного типу' }, 'Тип', sel([['any', 'Будь-який']].concat(L.activeSlots(C).map(s => [s.id, s.name])), S.slot, v => { S.slot = v; save(); roll(); }, 'Тип')),
      h('span', { class: 'seg mini', role: 'group', 'aria-label': 'Вигляд' },
        [['slots', 'Слоти героя', 'Предмети лежать у слотах спорядження героя'], ['cards', 'Картки', 'Усі предмети окремими картками']].map(([v, t, tip]) => h('button', { class: (S.view || 'slots') === v ? 'on' : '', title: tip, onclick: () => { S.view = v; save(); renderOut(); } }, t))),
    ));
    const cardOf = it => {
      const li = [];
      for (const [s, v] of Object.entries(it.base)) li.push(h('li', null, statLine(C.stats[s], v)));
      return h('article', { class: 'item', style: `--c:${/^#[0-9a-f]{3,8}$/i.test(it.color) ? it.color : '#a39e93'}` },
        h('div', { class: 'sub' }, `${it.unique ? '★ Унікальний · ' : ''}${it.rarityName} · рів. ${it.ilvl}${it.setName ? ' · ' + it.setName : ''}`),
        h('h3', null, it.name),
        li.length ? h('ul', { class: 'base' }, li) : null,
        it.affixes.length ? h('ul', { class: 'aff' }, it.affixes.map(a => h('li', null, statLine(C.stats[a.stat], a.value, true)))) : null,
        it.flavor ? h('p', { class: 'flavor' }, it.flavor) : null,
        h('div', { class: 'foot' }, h('span', null, 'Сила ', h('b', null, fmtNum(it.power))),
          h('button', { title: 'Скопіювати цей предмет як JSON', onclick: () => copyText(JSON.stringify(it, null, 2), 'Предмет скопійовано') }, 'JSON')));
    };
    const colorOf = it => (/^#[0-9a-f]{3,8}$/i.test(it.color) ? it.color : '#a39e93');
    const grid = h('div', { class: 'items' });
    if (S.view === 'cards') { for (const it of items) grid.append(cardOf(it)); out.append(grid); }
    else {
      if (!items.includes(legacySel)) legacySel = items[0] || null;
      const slots = L.activeSlots(C);
      out.append(LootUI.view({
        h, items, cells: slots.map(sl => ({ id: sl.id, name: sl.name, group: 'all', accepts: [sl.id] })), groups: [{ id: 'all', name: 'Слоти героя' }],
        itemSlot: it => it.slot, isTwoHand: null, selected: legacySel,
        mini: it => ({ name: it.name, sub: `${it.rarityName} · сила ${fmtNum(it.power)}`, color: colorOf(it), slot: (slots.find(x => x.id === it.slot) || {}).name }),
        tip: it => { const c = cardOf(it); c.classList.add('tipc'); c.querySelector('.foot')?.remove(); return c; },
        onSelect: it => { legacySel = it; LootUI.hide(); renderOut(); },
        detail: cardOf,
      }));
    }
    const sb = L.setBonuses(C, items);
    if (sb.length) out.append(h('div', { class: 'sets' }, sb.map(b => h('p', { class: 'hint' },
      '⛓ ' + b.name + ': ' + b.count + ' шт. у кидку. ' + ((C.sets.find(x => x.id === b.set).bonuses || []).map(x => x.n + ' → ' + Object.entries(x.stats).map(([k, v]) => (C.stats[k] ? C.stats[k].name : k) + ' +' + v).join(', ') + (x.n <= b.count ? ' ✓' : '')).join(' · '))))));
    out.append(h('p', { class: 'hint' }, 'Seed «' + S.seed + '» дає ті самі предмети щоразу: запиши його, щоб повернутися до цього кидка.'));
  }

  function renderSim(out) {
    const C = cfg();
    out.append(h('div', { class: 'bar-tools' },
      h('button', { class: 'btn-forge', onclick: runSim }, 'Запустити'),
      h('label', null, 'Кидків', h('select', { 'aria-label': 'Кількість кидків', onchange: e => { S.simN = +e.target.value; save(); } },
        [1000, 10000, 100000, 300000].map(n => h('option', { value: n, selected: n === S.simN }, n.toLocaleString('uk-UA'))))),
      h('span', { class: 'hint' }, isGame() ? `Рівень ${S.ilvl}, джерело «${GddCore.sourceChoices.find(x => x[0] === S.src)[1]}», Удача ${S.luck}, seed «${S.seed}»` : `Рівень ${S.ilvl}, seed «${S.seed}»`),
    ));
    if (!simResult || simResult.stamp !== simStamp()) { out.append(h('p', { class: 'empty' }, 'Натисни «Запустити»: побачиш розподіл рідкостей, діапазони статів і силу предметів.')); return; }
    const R = simResult.r;
    out.append(h('div', { class: 'stat-cards' },
      [['Кидків', R.n.toLocaleString('uk-UA')], ['Сила, медіана', fmtNum(R.power.median)], ['Сила, топ 5%', fmtNum(R.power.p95)], ['Сила, максимум', fmtNum(R.power.max)]].map(([a, b]) => h('div', { class: 'stat-card' }, h('small', null, a), h('b', null, b)))));
    out.append(R.warnings.length ? h('div', { class: 'warns' }, R.warnings.map(w => h('div', { class: 'warn' }, w))) : h('div', { class: 'ok' }, 'Явних проблем не знайдено: частоти збігаються з вагами, а сила предметів у розумних межах.'));

    out.append(h('h3', { class: 't' }, 'Рідкості: очікувано та фактично'));
    const maxP = Math.max(...R.byRarity.map(r => Math.max(r.actual, r.expected)), 1e-9);
    out.append(h('div', { class: 'dist' }, R.byRarity.map(r => h('div', { class: 'dist-row', style: `--c:${r.color}` },
      h('span', { class: 'nm', title: r.name }, r.name),
      h('span', { class: 'tr-bar' }, h('i', { style: `width:${(r.actual / maxP * 100).toFixed(2)}%` }), h('u', { style: `left:calc(${(r.expected / maxP * 100).toFixed(2)}% - 1px)`, title: 'очікувано ' + pctText(r.expected) })),
      h('span', { class: 'val' }, `${pctText(r.actual)} (${r.count.toLocaleString('uk-UA')}) · 1 з ${r.actual ? Math.round(1 / r.actual).toLocaleString('uk-UA') : '∞'}`)))));
    out.append(h('p', { class: 'hint' }, 'Біла риска: очікувана частка з ваг. Стовпчик: що вийшло в симуляції.'));

    out.append(h('h3', { class: 't' }, 'Розподіл сили предметів'));
    const mx = Math.max(...R.power.hist, 1);
    out.append(h('div', { class: 'hist', role: 'img', 'aria-label': 'Гістограма сили предметів' }, R.power.hist.map(c => h('i', { style: `height:${Math.max(1, c / mx * 100)}%`, title: c.toLocaleString('uk-UA') }))));
    out.append(h('div', { class: 'hist-ax' }, h('span', null, fmtNum(R.power.min)), h('span', null, 'середня ' + fmtNum(R.power.mean)), h('span', null, fmtNum(R.power.max))));

    out.append(h('h3', { class: 't' }, 'Характеристики на предметах'));
    out.append(h('table', { class: 'dt' }, h('thead', null, h('tr', null, h('th', null, 'Стат'), h('th', { class: 'm' }, 'Мін'), h('th', { class: 'm' }, 'Середнє'), h('th', { class: 'm' }, 'Макс'), h('th', { class: 'm' }, 'Частка'))),
      h('tbody', null, R.stats.sort((a, b) => b.count - a.count).map(s => h('tr', null, h('td', { class: 'n' }, s.name), h('td', { class: 'm' }, fmtNum(s.min)), h('td', { class: 'm' }, fmtNum(s.avg)), h('td', { class: 'm' }, fmtNum(s.max)), h('td', { class: 'm' }, pctText(s.count / R.n)))))));
    if (GUI && R.game) GUI.simExtras(out, R);
  }
  const simStamp = () => JSON.stringify([S.cfg, S.seed, S.ilvl, S.simN, S.src, S.luck]);
  function runSim() {
    const C = cfg();
    const bad = L.validate(C);
    if (bad.length) { toast(bad[0]); return; }
    const t = performance.now();
    simResult = { stamp: simStamp(), r: L.simulate(C, S.simN, S.seed, { ilvl: S.ilvl, source: S.src, luck: S.luck }) };
    renderOut();
    toast(`Готово за ${Math.max(1, Math.round(performance.now() - t))} мс`);
  }

  function renderCalc(out) {
    const C = cfg();
    const game = isGame();
    const pr = L.rarityProbs(C, { ilvl: S.ilvl, source: S.src, luck: S.luck });
    const rars = game ? C.game.qualities : C.rarities;
    const field = (label, value, on, hint, o = {}) => h('div', { class: 'row' }, h('label', null, label), numIn(value, on, Object.assign({ label }, o)), h('span', { class: 'hint' }, hint));
    out.append(
      field('Шанс дропу, %', S.drop, v => { S.drop = clampNum(v, 20, 0, 100); save(); renderOut(); }, 'скільки вбивств дають предмет (20 = кожне п’яте)', { min: 0, max: 100 }),
      field('Гарантія, вбивств', S.pity, v => { S.pity = Math.round(clampNum(v, 0, 0, 100000)); save(); renderOut(); }, '0 = без гарантії; N = жорстка гарантія на N-му вбивстві', { min: 0, step: 1 }),
      field('Вбивств за хвилину', S.kpm, v => { S.kpm = clampNum(v, 6, 0.1, 10000); save(); renderOut(); }, 'для оцінки часу', { min: 0.1 }),
    );
    const drop = S.drop / 100;
    out.append(h('h3', { class: 't' }, game ? `Скільки вбивств до предмета якості (рівень ${S.ilvl}, джерело «${GddCore.sourceChoices.find(x => x[0] === S.src)[1]}»)` : 'Скільки вбивств до предмета рідкості'));
    out.append(h('table', { class: 'dt' }, h('thead', null, h('tr', null, h('th', null, 'Рідкість'), h('th', { class: 'm' }, 'З предмета'), h('th', { class: 'm' }, 'За вбивство'), h('th', { class: 'm' }, 'У середньому'), h('th', { class: 'm' }, '50%'), h('th', { class: 'm' }, '90%'), h('th', { class: 'm' }, '99%'), h('th', { class: 'm' }, 'Час'))),
      h('tbody', null, rars.map((r, i) => {
        const p = drop * pr[i], mean = L.expectedTries(p, S.pity);
        return h('tr', null,
          h('td', { class: 'n', style: `color:${r.color}` }, r.name), h('td', { class: 'm' }, pctText(pr[i])), h('td', { class: 'm' }, pctText(p)),
          h('td', { class: 'm' }, fmtNum(mean)), ...[.5, .9, .99].map(q => h('td', { class: 'm' }, fmtNum(L.triesForChance(p, q, S.pity)))),
          h('td', { class: 'm' }, L.formatMinutes(mean / S.kpm)));
      }))));
    out.append(h('p', { class: 'hint' }, '«50% / 90% / 99%»: скільки вбивств потрібно, щоб з такою ймовірністю хоч раз отримати цю рідкість. Це відповідає на питання «скільки гриндити», а не «скільки гриндить типовий гравець». Гарантія зменшує і середнє, і хвіст.'));
  }

  /* ---------- імпорт / експорт ---------- */
  async function copyText(text, okMsg) {
    try { await navigator.clipboard.writeText(text); toast(okMsg); return; } catch {}
    const ta = h('textarea', { style: 'position:fixed;left:-9999px' }); ta.value = text; document.body.append(ta); ta.select();
    try { document.execCommand('copy'); toast(okMsg); } catch { toast('Не вдалося скопіювати'); }
    ta.remove();
  }
  const exportText = () => L.exportJSON(cfg(), items);
  $('btnCopy').addEventListener('click', () => copyText(exportText(), 'JSON скопійовано'));
  $('btnSave').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([exportText()], { type: 'application/json' }));
    const a = h('a', { href: url, download: 'items.json' }); document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000); toast('items.json збережено');
  });
  const dlg = $('dlgImport');
  $('btnImport').addEventListener('click', () => { $('importErr').textContent = ''; $('importText').value = ''; dlg.showModal(); });
  $('importFile').addEventListener('click', () => $('importFileInput').click());
  $('importFileInput').addEventListener('change', e => {
    const f = e.target.files[0]; if (!f) return;
    const rd = new FileReader(); rd.onload = () => { $('importText').value = String(rd.result); }; rd.readAsText(f); e.target.value = '';
  });
  $('importGo').addEventListener('click', () => {
    try {
      S.cfg = L.sanitize(JSON.parse($('importText').value));
      S.preset = 'custom'; dlg.close(); afterStructure(); toast('Конфіг імпортовано');
    } catch (e) { $('importErr').textContent = e instanceof SyntaxError ? 'Це не схоже на JSON.' : e.message; }
  });

  document.addEventListener('keydown', e => {
    if (e.code !== 'Space' || e.repeat || S.tab !== 'items') return;
    if (/^(INPUT|TEXTAREA|SELECT|BUTTON|SUMMARY)$/.test(document.activeElement.tagName) || dlg.open) return;
    e.preventDefault(); reseedAndRoll();
  });

  renderRules();
  roll();
})();
