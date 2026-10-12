// Character Roller: інтерфейс. Уся логіка генерації живе в char-core.js, дані SRD в srd-*.js.
(function () {
  'use strict';
  const C = CharCore;
  const SRD = C.SRD;
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
    get(k, d) { try { const v = localStorage.getItem('cr_' + k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem('cr_' + k, JSON.stringify(v)); } catch {} },
  };
  let toastTimer;
  function toast(msg) {
    const t = $('toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
  }
  const sign = C.sign;

  /* ---------- стан ---------- */
  const DEFAULTS = () => ({
    race: 'any', subrace: 'any', cls: 'any', subclass: 'any', level: 'any', levelMin: 1, levelMax: 20, background: 'any', alignment: 'any',
    method: '4d6', assign: 'smart', hp: 'average', smartGear: true, abilities: {}, skills: [], trait: '', ideal: '', bond: '', flaw: '',
  });
  const saved = store.get('state', null);
  const S = Object.assign({ seed: C.randomSeed(), name: '', params: DEFAULTS(), open: { main: true, abil: true } }, saved || {});
  S.params = Object.assign(DEFAULTS(), S.params || {});
  let ch = null;

  function save() { store.set('state', { seed: S.seed, name: S.name, params: S.params, open: S.open }); }

  function regen() {
    try {
      ch = C.generate(Object.assign({}, S.params, { name: S.name }), S.seed);
      renderSheet();
    } catch (e) { $('sheet').textContent = ''; $('sheet').append(h('div', { class: 'warn' }, 'Не вдалося згенерувати: ' + e.message)); console.error(e); }
  }
  function setP(patch, rebuild) {
    Object.assign(S.params, patch); save(); if (rebuild !== false) renderParams(); regen();
  }

  /* ---------- панель параметрів ---------- */
  const opt = (v, t) => [v, t];
  function sel(options, cur, on, label) {
    return h('select', { 'aria-label': label, onchange: e => on(e.target.value) },
      options.map(([v, t]) => h('option', { value: v, selected: String(v) === String(cur) }, t)));
  }
  function field(label, control) { return h('div', { class: 'row' }, h('label', null, label), control); }
  function section(key, title, badge, ...body) {
    const d = h('details', { class: 'sec', open: !!S.open[key] }, h('summary', null, title, badge ? h('span', { class: 'n' }, badge) : null), h('div', { class: 'sec-b' }, body));
    d.addEventListener('toggle', () => { S.open[key] = d.open; save(); });
    return d;
  }
  const ANY = 'any';
  function renderParams() {
    const P = S.params; const root = $('params'); root.textContent = '';
    const race = SRD.RACES.find(r => r.id === P.race);
    const levelRange = P.level === ANY;

    root.append(section('main', 'Основне', null,
      field('Seed', h('span', { class: 'inline' },
        h('input', { class: 'txt', value: S.seed, 'aria-label': 'Seed', spellcheck: 'false', onchange: e => { S.seed = e.target.value.trim() || C.randomSeed(); save(); regen(); } }),
        h('button', { class: 'x', title: 'Новий seed', onclick: () => roll() }, '🎲'))),
      field('Раса', sel([opt(ANY, '🎲 Випадково')].concat(SRD.RACES.map(r => opt(r.id, r.name))), P.race, v => setP({ race: v, subrace: ANY }), 'Раса')),
      race && race.subraces.length ? field('Підраса', sel([opt(ANY, '🎲 Випадково')].concat(race.subraces.map(s => opt(s.id, s.name))), P.subrace, v => setP({ subrace: v }), 'Підраса')) : null,
      field('Клас', sel([opt(ANY, '🎲 Випадково')].concat(SRD.CLASSES.map(c => opt(c.id, c.name))), P.cls, v => setP({ cls: v, subclass: ANY }), 'Клас')),
      field('Підклас', sel([opt(ANY, '🎲 Єдиний варіант SRD')].concat(SRD.CLASSES.filter(c => P.cls === ANY || c.id === P.cls).map(c => opt(c.subclass.id, c.subclass.name))), P.subclass, v => setP({ subclass: v }), 'Підклас')),
      field('Рівень', sel([opt(ANY, '🎲 Випадковий')].concat(Array.from({ length: 20 }, (_, i) => opt(i + 1, String(i + 1)))), P.level, v => setP({ level: v === ANY ? ANY : Number(v) }), 'Рівень')),
      levelRange ? field('Діапазон', h('span', { class: 'inline' },
        h('input', { class: 'num', type: 'number', min: 1, max: 20, value: P.levelMin, 'aria-label': 'Від рівня', onchange: e => setP({ levelMin: +e.target.value }) }), '—',
        h('input', { class: 'num', type: 'number', min: 1, max: 20, value: P.levelMax, 'aria-label': 'До рівня', onchange: e => setP({ levelMax: +e.target.value }) }))) : null,
      field('Передісторія', sel([opt(ANY, '🎲 Випадково')].concat(SRD.BACKGROUNDS.map(b => opt(b.id, b.name))), P.background, v => setP({ background: v }), 'Передісторія')),
      field('Світогляд', sel([opt(ANY, '🎲 Випадково')].concat(SRD.ALIGNMENTS.map(a => opt(a.id, a.name))), P.alignment, v => setP({ alignment: v }), 'Світогляд')),
      h('p', { class: 'hint' }, 'SRD 5.1 містить лише одну передісторію («Послушник») і по одному підкласу на клас: інших у правилах SRD немає.'),
    ));

    const abil = h('div', { class: 'abil-in' }, SRD.ABILITIES.map(a => h('label', null, h('span', null, a.short),
      h('input', { class: 'num', type: 'number', min: 3, max: 20, placeholder: '🎲', value: P.abilities[a.id] == null ? '' : P.abilities[a.id], 'aria-label': a.name + ' (базове значення)',
        onchange: e => { const ab = Object.assign({}, P.abilities); const v = e.target.value.trim(); if (v === '') delete ab[a.id]; else ab[a.id] = Math.min(20, Math.max(3, Math.round(+v) || 10)); setP({ abilities: ab }); } }))));
    root.append(section('abil', 'Характеристики та HP', null,
      field('Метод', sel([opt(ANY, '🎲 Випадковий метод')].concat(C.METHODS), P.method, v => setP({ method: v }), 'Метод')),
      field('Розподіл', sel([opt('smart', 'За пріоритетами класу'), opt('random', 'Випадково'), opt(ANY, '🎲 Будь-як')], P.assign, v => setP({ assign: v }), 'Розподіл')),
      field('HP за рівень', sel([opt('average', 'Середнє значення'), opt('roll', 'Кидок кістки')], P.hp, v => setP({ hp: v }), 'HP')),
      h('p', { class: 'hint' }, 'Зафіксуй базове значення (до расових бонусів): порожнє поле означає випадкове.'), abil));

    const sk = h('div', { class: 'checks' }, SRD.SKILLS.map(s => h('label', null,
      h('input', { type: 'checkbox', checked: P.skills.includes(s.id), onchange: e => { const set = new Set(P.skills); if (e.target.checked) set.add(s.id); else set.delete(s.id); setP({ skills: [...set] }, false); } }), s.name)));
    root.append(section('skills', 'Бажані навички', P.skills.length ? String(P.skills.length) : null, sk,
      h('p', { class: 'hint' }, 'Якщо клас, раса чи передісторія дозволяють, ці навички будуть вибрані першими.')));

    const bg = SRD.BACKGROUNDS.find(b => b.id === (P.background === ANY ? SRD.BACKGROUNDS[0].id : P.background));
    const trSel = (key, label, list) => field(label, sel([opt('', '🎲 Випадково')].concat(list.map((t, i) => opt(i, (t.t || t).slice(0, 70) + ((t.t || t).length > 70 ? '…' : '')))), P[key], v => setP({ [key]: v === '' ? '' : Number(v) }, false), label));
    root.append(section('pers', 'Особистість', null,
      trSel('trait', 'Риса', bg.traits), trSel('ideal', 'Ідеал', bg.ideals), trSel('bond', 'Прив’язка', bg.bonds), trSel('flaw', 'Вада', bg.flaws)));

    root.append(section('more', 'Додатково', null,
      h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: P.smartGear, onchange: e => setP({ smartGear: e.target.checked }, false) }), ' Розумний добір спорядження й бойового стилю'),
      h('p', { class: 'hint' }, 'Вимкнено: спорядження та стилі обираються цілком випадково. Однакові параметри й seed завжди дають того самого персонажа.')));
  }

  /* ---------- листок ---------- */
  const SRC_NAMES = { race: 'Расові риси', bg: 'Передісторія', class: 'Риси класу', subclass: 'Риси підкласу', feat: 'Риси (feats)' };
  const ABN = Object.fromEntries(SRD.ABILITIES.map(a => [a.id, a]));
  const dot = p => p === 2 ? '◆' : p === 1 ? '●' : '○';

  function box(label, value, sub, cls) {
    return h('div', { class: 'stat-box ' + (cls || '') }, h('small', null, label), h('b', null, value), sub ? h('em', null, sub) : null);
  }
  function groupByLevel(list) {
    const m = {}; for (const s of list) (m[s.lvl] = m[s.lvl] || []).push(s); return m;
  }
  function spellChip(s, extra) {
    return h('li', { class: 'sp' + (extra && extra.prep === false ? ' off' : ''), title: `${s.en}, ${s.school}${s.src ? ', ' + s.src : ''}` },
      extra && extra.mark ? h('i', null, extra.mark) : null, s.name, h('small', null, s.en));
  }
  function spellList(title, list, opts) {
    if (!list || !list.length) return null;
    const g = groupByLevel(list);
    return h('div', { class: 'spl' }, h('h4', null, title),
      Object.keys(g).sort((a, b) => a - b).map(l => h('div', { class: 'spl-lvl' }, h('span', { class: 'lv' }, l === '0' ? 'Трюки' : l + ' рів.'),
        h('ul', null, g[l].map(s => spellChip(s, opts && opts.fn ? opts.fn(s) : null))))));
  }

  function renderSheet() {
    const root = $('sheet'); root.textContent = '';
    if (!ch) return;
    const mods = ch.abilities;
    const subTxt = ch.subclass ? ch.subclass.name : `${ch.subclassPlanned.kind} з ${ch.subclassPlanned.lvl} рівня`;

    // шапка
    root.append(h('div', { class: 'sh-head' },
      h('input', { class: 'sh-name', value: ch.name, placeholder: 'Ім’я персонажа', 'aria-label': 'Ім’я персонажа', oninput: e => { ch.name = e.target.value; S.name = e.target.value; save(); } }),
      h('div', { class: 'sh-sub' },
        h('b', null, `${ch.cls.name} ${ch.level} рів.`), ' · ', ch.race.full, ' · ', ch.background.name, ' · ', ch.alignment.name, ' · ', `${ch.xp.toLocaleString('uk-UA')} XP`),
      h('div', { class: 'sh-sub dim' }, 'Підклас: ', subTxt, ch.fightingStyles.length ? ' · Бойовий стиль: ' + ch.fightingStyles.join(', ') : '', ch.pact ? ' · Дар угоди: ' + ch.pact.split(':')[0] : ''),
    ));

    // основні числа
    const hpExtra = ch.hp.method === 'roll' ? 'кидки' : 'середнє';
    root.append(h('div', { class: 'stats' },
      box('Бонус майстерності', sign(ch.proficiency)), box('Клас броні', ch.ac.value, ch.ac.note, 'ac'),
      box('Ініціатива', sign(ch.initiative)), box('Швидкість', ch.speed.text, ch.speed.notes.join(', '), 'sm'),
      box('HP (макс.)', ch.hp.max, `кістки хітів ${ch.hp.dice}, ${hpExtra}`, 'hp'),
      box('Пасивна уважність', ch.passive.perception, `Проникливість ${ch.passive.insight}, Розслідування ${ch.passive.investigation}`),
      box('Натхнення', '☐'),
    ));

    const cols = h('div', { class: 'sh-cols' });
    root.append(cols);

    // стовпець 1: характеристики, рятівні, навички
    const c1 = h('div', { class: 'col' });
    c1.append(h('div', { class: 'abils' }, SRD.ABILITIES.map(a => { const x = mods[a.id];
      return h('div', { class: 'abil', title: `База ${x.base}, раса ${sign(x.racial)}, підвищення ${sign(x.asi)}` + (x.capped ? ' (обмежено 20)' : '') },
        h('small', null, a.name), h('b', null, sign(x.mod)), h('span', null, x.score)); })));
    c1.append(h('h3', { class: 't' }, 'Рятівні кидки'),
      h('ul', { class: 'plist' }, ch.saves.map(s => h('li', { class: s.prof ? 'on' : '' }, h('i', null, dot(s.prof ? 1 : 0)), h('b', null, sign(s.bonus)), ABN[s.ab].name))));
    c1.append(h('h3', { class: 't' }, 'Навички'),
      h('ul', { class: 'plist' }, ch.skills.map(s => h('li', { class: s.prof ? 'on' : '', title: s.src || (s.half ? 'половина бонусу майстерності' : '') },
        h('i', null, dot(s.prof)), h('b', null, sign(s.bonus)), s.name, h('small', null, ABN[s.ab].short)))));
    c1.append(h('p', { class: 'hint' }, '● володіння, ◆ експертиза (подвоєний бонус).', ch.ac.stealthDisadvantage ? ' Обладунок накладає невигоду на Скритність.' : ''));
    cols.append(c1);

    // стовпець 2: атаки, спорядження, заклинання коротко
    const c2 = h('div', { class: 'col' });
    c2.append(h('h3', { class: 't' }, 'Атаки'),
      h('table', { class: 'dt' }, h('thead', null, h('tr', null, h('th', null, 'Зброя'), h('th', { class: 'm' }, 'Атака'), h('th', null, 'Шкода'))),
        h('tbody', null, ch.attacks.map(a => h('tr', null, h('td', { class: 'n' }, a.name, a.notes ? h('small', null, a.notes) : null), h('td', { class: 'm' }, sign(a.bonus)), h('td', null, a.damage))))));
    c2.append(h('h3', { class: 't' }, 'Спорядження'),
      h('ul', { class: 'eq' }, ch.equipment.map(i => i.contents
        ? h('li', null, i.name, h('span', { class: 'pack' }, i.contents.join(', ')))
        : h('li', null, (i.qty > 1 ? i.qty + '× ' : '') + i.name))),
      h('p', { class: 'hint' }, `Золото: ${ch.gold} зм (з передісторії). Вантажопідйомність ${ch.carry.capacity} фунтів, підняти/тягти до ${ch.carry.lift}.`));
    c2.append(h('h3', { class: 't' }, 'Володіння й мови'),
      h('dl', { class: 'dl' },
        h('dt', null, 'Обладунки'), h('dd', null, ch.profs.armor.join(', ') || 'немає'),
        h('dt', null, 'Зброя'), h('dd', null, ch.profs.weapons.join(', ') || 'немає'),
        h('dt', null, 'Інструменти'), h('dd', null, ch.profs.tools.join(', ') || 'немає'),
        h('dt', null, 'Мови'), h('dd', null, ch.languages.join(', '))));
    cols.append(c2);

    // стовпець 3: особистість, смерть, лог
    const c3 = h('div', { class: 'col' });
    const p = ch.personality;
    c3.append(h('h3', { class: 't' }, 'Особистість'),
      h('dl', { class: 'dl' },
        h('dt', null, 'Риси'), h('dd', null, h('ul', { class: 'plain' }, p.traits.map(t => h('li', null, t)))),
        h('dt', null, 'Ідеал'), h('dd', null, p.ideal), h('dt', null, 'Прив’язка'), h('dd', null, p.bond), h('dt', null, 'Вада'), h('dd', null, p.flaw)));
    c3.append(h('h3', { class: 't' }, 'Рятівні кидки від смерті'),
      h('p', { class: 'death' }, 'Успіхи ☐ ☐ ☐ · Провали ☐ ☐ ☐'));
    c3.append(h('details', { class: 'log' }, h('summary', null, 'Як вийшли числа'),
      h('p', { class: 'hint' }, `Метод: ${(C.METHODS.find(m => m[0] === ch.method.id) || [0, ch.method.id])[1]}. Результати: ${ch.method.rolls.length ? ch.method.rolls.map(r => Array.isArray(r) ? '[' + r.join(' ') + ']' : r).join(', ') : 'зафіксовано'}.`),
      h('p', { class: 'hint' }, 'Бонуси раси: ', SRD.ABILITIES.filter(a => mods[a.id].racial).map(a => `${a.short} ${sign(mods[a.id].racial)}`).join(', ') || 'немає', '.'),
      ch.log.asi.length ? h('p', { class: 'hint' }, 'Покращення: ', ch.log.asi.map(a => `${a.lvl} рів.: ${a.text}`).join('; '), '.') : h('p', { class: 'hint' }, 'Покращень характеристик іще немає (з 4 рівня).'),
      h('p', { class: 'hint' }, 'HP за рівнями: ', ch.log.hp.map(x => x.total).join(', '), ` (кістка d${ch.cls.hd}, мод. Статури ${sign(mods.con.mod)}).`)));
    cols.append(c3);

    // закляття
    if (ch.spellcasting) root.append(renderSpells(ch.spellcasting));

    // риси
    const feat = h('div', { class: 'features' }, h('h3', { class: 't' }, 'Риси й особливості'));
    for (const key of ['race', 'bg', 'class', 'subclass', 'feat']) {
      const list = ch.features.filter(f => f.src === key); if (!list.length) continue;
      feat.append(h('h4', null, SRC_NAMES[key]), h('div', { class: 'feat-grid' }, list.map(f => h('div', { class: 'feat' },
        h('b', null, f.name, f.lvl > 1 ? h('em', null, f.lvl + ' рів.') : null), h('p', null, f.desc)))));
    }
    if (ch.invocations.length) feat.append(h('h4', null, 'Містичні прохання'), h('div', { class: 'feat-grid' }, ch.invocations.map(i => h('div', { class: 'feat' }, h('b', null, i.name), h('p', null, i.desc)))));
    if (ch.metamagic.length) feat.append(h('h4', null, 'Метамагія'), h('div', { class: 'feat-grid' }, ch.metamagic.map(i => h('div', { class: 'feat' }, h('b', null, i.name), h('p', null, i.desc)))));
    root.append(feat);
    root.append(h('p', { class: 'foot-note' }, `Seed «${ch.seed}». Правила: D&D 5e SRD 5.1 (CC-BY 4.0). Номер листка відтворюється за seed і параметрами.`));
  }

  function renderSpells(sp) {
    const wrap = h('div', { class: 'spells' }, h('h3', { class: 't' }, 'Закляття'));
    if (sp.class) {
      const mode = { known: 'відомі закляття', prepared: 'підготовлені закляття', book: 'книга заклять' }[sp.mode];
      wrap.append(h('div', { class: 'stats small' },
        box('Характеристика', ABN[sp.ability].name), box('Складність рятівного (КС)', sp.dc), box('Бонус атаки закляттям', sign(sp.attack)), box('Тип', mode)));
      if (sp.slots.length) {
        wrap.append(h('div', { class: 'slots' }, sp.slots.map((n, i) => h('div', { class: 'slot' }, h('small', null, (i + 1) + ' рів.'), h('span', null, '○'.repeat(n))))));
      } else if (sp.pact) wrap.append(h('div', { class: 'slots' }, h('div', { class: 'slot wide' }, h('small', null, `Комірки угоди: ${sp.pact.count} × ${sp.pact.level} рівня`), h('span', null, '○'.repeat(sp.pact.count)))));
    } else {
      wrap.append(h('p', { class: 'hint' }, 'Закляття з расових рис (без комірок класу).'));
    }
    const lists = [];
    if (sp.cantrips.length) lists.push(spellList('Трюки', sp.cantrips));
    if (sp.raceCantrip) lists.push(spellList('Трюк високого ельфа (Інтелект)', [sp.raceCantrip]));
    if (sp.known.length) lists.push(spellList('Відомі закляття', sp.known));
    if (sp.mode === 'book') lists.push(spellList('Книга заклять (● підготовлено)', sp.book, { fn: s => ({ mark: s.prepared ? '●' : '○', prep: s.prepared }) }));
    else if (sp.prepared.length) lists.push(spellList(`Підготовлені закляття (${sp.preparedCount})`, sp.prepared));
    if (sp.always.length) lists.push(spellList('Завжди підготовлені (домен, клятва, коло, дар)', sp.always));
    if (sp.arcanum.length) lists.push(spellList('Містичний аркан (раз на довгий відпочинок)', sp.arcanum, { fn: s => ({ mark: s.lvl + '' }) }));
    if (sp.secrets.length) lists.push(spellList('Магічні таємниці (з будь-яких списків)', sp.secrets));
    if (sp.innate.length) lists.push(h('div', { class: 'spl' }, h('h4', null, 'Расові закляття (Харизма)'),
      h('ul', null, sp.innate.map(i => h('li', { class: 'sp' }, i.spell.name, h('small', null, i.spell.en + (i.slotLevel ? `, ${i.slotLevel} рів.` : '') + (i.perDay ? ', раз на день' : ', без обмеження')))))));
    wrap.append(h('div', { class: 'spl-wrap' }, lists));
    for (const n of sp.notes) wrap.append(h('p', { class: 'hint' }, n));
    return wrap;
  }

  /* ---------- дії ---------- */
  function roll() { S.seed = C.randomSeed(); save(); renderParams(); regen(); }
  function copyText(text, msg) {
    const done = () => toast(msg);
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, () => fallback());
    else fallback();
    function fallback() {
      const ta = h('textarea', { style: 'position:fixed;opacity:0' }); ta.value = text; document.body.append(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch { toast('Не вдалося скопіювати'); } ta.remove();
    }
  }
  function download(name, text) {
    const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
    const a = h('a', { href: url, download: name }); document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 500);
  }
  $('btnRoll').addEventListener('click', roll);
  $('btnPrint').addEventListener('click', () => window.print());
  $('btnCopy').addEventListener('click', () => copyText(C.exportJSON(ch), 'JSON скопійовано'));
  $('btnSave').addEventListener('click', () => {
    const base = (ch.name || `${ch.cls.id}-${ch.level}`).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '') || 'character';
    download(base + '.json', C.exportJSON(ch)); toast('Збережено ' + base + '.json');
  });
  $('btnClear').addEventListener('click', () => { S.params = DEFAULTS(); save(); renderParams(); regen(); toast('Параметри скинуто'); });
  $('btnChaos').addEventListener('click', () => { S.params = Object.assign(DEFAULTS(), { method: 'any', assign: 'any' }); roll(); toast('Повний хаос'); });
  $('btnPin').addEventListener('click', () => {
    Object.assign(S.params, { race: ch.race.id, subrace: ch.race.subId || ANY, cls: ch.cls.id, subclass: ANY, level: ch.level, background: ch.background.id, alignment: ch.alignment.id });
    save(); renderParams(); toast('Расу, клас, рівень, передісторію й світогляд закріплено');
  });
  document.addEventListener('keydown', e => {
    if (e.code !== 'Space' || e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target; if (t && (/^(INPUT|SELECT|TEXTAREA|BUTTON|SUMMARY)$/.test(t.tagName) || t.isContentEditable)) return;
    e.preventDefault(); roll();
  });

  renderParams();
  regen();
})();
