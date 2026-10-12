// Loot Forge: інтерфейс шару GodsDontDie. Логіка живе в gdd-core.js, тут лише розмітка.
// app.js передає сюди свої помічники (ctx) і підключає цей модуль до панелей.
const GddUI = (() => {
  'use strict';
  const G = typeof GddCore !== 'undefined' ? GddCore : null;

  function create(ctx) {
    const { h, S, section, numIn, txtIn, fmtNum, pctText, clampNum, L } = ctx;
    const cfg = () => ctx.cfg();
    const gm = () => cfg().game;
    const MAX_ROWS = 40;
    const filters = {};

    /* ---------- спільне ---------- */
    const th = list => list.map(x => h('span', null, x));
    function withFilter(key, placeholder, rows, matches, build, extra) {
      const q = (filters[key] || '').toLowerCase();
      const shown = q ? rows.filter(r => matches(r, q)) : rows;
      const box = h('div', { class: 'tbl' });
      const list = h('div', { class: 'tbl' });
      const draw = () => {
        list.textContent = '';
        const qq = (filters[key] || '').toLowerCase();
        const arr = qq ? rows.filter(r => matches(r, qq)) : rows;
        for (const r of arr.slice(0, MAX_ROWS)) list.append(build(r));
        if (arr.length > MAX_ROWS) list.append(h('p', { class: 'hint' }, `Показано ${MAX_ROWS} з ${arr.length}: уточни пошук.`));
        if (!arr.length) list.append(h('p', { class: 'hint' }, 'Нічого не знайдено.'));
      };
      const input = h('input', { type: 'text', class: 'txt', placeholder, value: filters[key] || '', 'aria-label': placeholder, oninput: e => { filters[key] = e.target.value; draw(); } });
      box.append(h('div', { class: 'row' }, input, extra || null));
      draw();
      void shown;
      return [box, list];
    }
    const effName = id => { const e = G.idx(gm()).eff.get(id); return e ? e.name : id; };
    const effLine = (id, roll = 1, level = 1) => { const e = G.idx(gm()).eff.get(id); return e ? G.effText(e, G.effValue(gm(), e, roll, level), id) : id; };
    const edited = () => { G.touch(gm()); ctx.save(); };
    const slotName = id => { const s = gm().slots.find(x => x.id === id); return s ? s.name : id; };
    const q = k => (gm().qualities.find(x => x.id === k) || { name: k }).name;

    /* ---------- перемикач режиму ---------- */
    function modeSection() {
      const C = cfg();
      const on = G.isOn(C);
      const cb = h('input', { type: 'checkbox', checked: on, 'aria-label': 'Правила GodsDontDie', onchange: e => { G.ensureGame(cfg(), e.target.checked); ctx.afterStructure(); } });
      const meta = C.game && C.game.meta && C.game.meta.commit ? `Дані з GodsDontDie, коміт ${C.game.meta.commit.slice(0, 7)}.` : '';
      return section('gdd', 'Режим GodsDontDie', on ? 'увімкнено' : 'вимкнено', [
        h('div', { class: 'row' }, h('label', null, h('span', null, cb, ' Предмети за правилами гри')),
          h('span', { class: 'hint' }, 'Типи, слоти, якості, ефекти, вставки й комплекти як у грі. Універсальні правила нижче зберігаються і вмикаються знову, якщо вимкнути режим.')),
        meta ? h('p', { class: 'hint' }, meta + ' Оновлення: python3 loot-forge/sync/extract-gdd.py <шлях до GodsDontDie>.') : null,
      ]);
    }

    /* ---------- ліва панель ---------- */
    function rollSection() {
      const C = cfg(), g = C.game;
      const seedIn = h('input', { type: 'text', value: S.seed, 'aria-label': 'Seed', onchange: e => { S.seed = e.target.value.trim() || L.randomSeed(); e.target.value = S.seed; ctx.save(); ctx.roll(); } });
      const sets = [['', 'Без комплекту'], ['__random', 'Випадковий комплект (rset)']].concat(g.sets.filter(s => s.on !== false).map(s => [s.id, s.name]));
      return section('roll', 'Кидок', null, [
        h('div', { class: 'row' }, h('label', null, 'Seed'), seedIn, h('button', { title: 'Новий випадковий seed', onclick: () => { S.seed = L.randomSeed(); seedIn.value = S.seed; ctx.save(); ctx.roll(); } }, '🎲')),
        h('div', { class: 'row' }, h('label', null, 'Рівень джерела'), numIn(S.ilvl, v => { S.ilvl = Math.round(clampNum(v, 1, 1, 5000)); ctx.save(); ctx.roll(); }, { min: 1, max: 5000, step: 1, label: 'Рівень джерела' }),
          h('span', { class: 'hint' }, 'рівень предмета; сила росте як Stat(рівень)')),
        h('div', { class: 'row' }, h('label', null, 'Джерело'),
          h('select', { 'aria-label': 'Джерело дропу', onchange: e => { S.src = e.target.value; ctx.save(); ctx.roll(); } }, G.sourceChoices.map(([v, t]) => h('option', { value: v, selected: v === S.src }, t))),
          h('span', { class: 'hint' }, 'бос і вимір відкривають перламутрові, райдужні й унікальні варіанти')),
        h('div', { class: 'row' }, h('label', null, 'Удача'), numIn(S.luck, v => { S.luck = clampNum(v, 0, 0, 100000); ctx.save(); ctx.roll(); }, { min: 0, step: 1, label: 'Удача гравця' }), h('span', { class: 'hint' }, '+0,2% до шансу кращої якості за одиницю')),
        h('div', { class: 'row' }, h('label', null, 'Комплект джерела'),
          h('select', { 'aria-label': 'Комплект джерела', onchange: e => { S.setCode = e.target.value; ctx.save(); ctx.roll(); } }, sets.map(([v, t]) => h('option', { value: v, selected: v === S.setCode }, t)))),
        h('div', { class: 'row' }, h('label', null, 'Шанс частини'), numIn(S.setChance, v => { S.setChance = clampNum(v, 0, 0, 100); ctx.save(); ctx.roll(); }, { min: 0, max: 100, step: 1, label: 'Шанс частини комплекту, відсотків' }), h('span', { class: 'hint' }, '% предметів стають частиною комплекту')),
        h('div', { class: 'row' }, h('label', null, 'Гумор текстів'),
          h('div', { class: 'seg small', role: 'group', 'aria-label': 'Гумор текстів' }, ['Серйозно', 'Іронічно', 'Чорний', 'Без гальм'].map((n, i) =>
            h('button', { class: S.humor === i ? 'on' : '', onclick: () => { S.humor = i; ctx.save(); ctx.renderRules(); ctx.roll(); } }, n)))),
      ]);
    }

    function qualitiesSection() {
      const g = gm();
      const t = h('div', { class: 'tbl' }, h('div', { class: 'tr head gq' }, th(['', '', 'Назва', 'Вага', '×стат', 'Бон.', 'Унік.', 'Ріст', 'Від рів.', 'Бос', 'Шанс'])));
      const probs = L.rarityProbs(cfg(), { ilvl: S.ilvl, source: S.src, luck: S.luck });
      g.qualities.forEach((x, i) => t.append(h('div', { class: 'tr gq' },
        h('input', { type: 'checkbox', checked: x.on !== false, 'aria-label': 'Увімкнено', onchange: e => { if (e.target.checked) delete x.on; else x.on = false; edited(); } }),
        h('input', { type: 'color', value: /^#[0-9a-f]{6}$/i.test(x.color) ? x.color : '#a39e93', 'aria-label': 'Колір', onchange: e => { x.color = e.target.value; edited(); ctx.renderOut(); } }),
        txtIn(x.name, v => { x.name = v.trim() || x.name; edited(); ctx.renderOut(); }, { label: 'Назва якості' }),
        numIn(x.weight, v => { x.weight = clampNum(v, 0, 0, 1e9); edited(); }, { min: 0, step: 'any', label: 'Вага' }),
        numIn(x.mult, v => { x.mult = clampNum(v, 1, 0, 1000); edited(); }, { min: 0, step: 0.05, label: 'Множник характеристик' }),
        numIn(x.bonus, v => { x.bonus = Math.round(clampNum(v, 0, 0, 24)); edited(); }, { min: 0, step: 1, label: 'Бонусних властивостей' }),
        numIn(x.unique, v => { x.unique = Math.round(clampNum(v, 0, 0, 24)); edited(); }, { min: 0, step: 1, label: 'Унікальних ефектів' }),
        numIn(x.growth, v => { x.growth = clampNum(v, 0, -10, 10); edited(); }, { step: 0.1, label: 'Ріст ваги з рівнем' }),
        numIn(x.minLvl, v => { x.minLvl = Math.round(clampNum(v, 0, 0, 9999)); edited(); }, { min: 0, step: 1, label: 'Мінімальний рівень джерела' }),
        h('input', { type: 'checkbox', checked: !!x.mighty, title: 'Лише з босів, глибоких вимірів і героїв', 'aria-label': 'Лише могутні джерела', onchange: e => { x.mighty = e.target.checked; edited(); } }),
        h('span', { class: 'chance gqc', title: x.theme ? 'Тематичний ефект: ' + effName(x.theme) : 'Шанс на цьому рівні й джерелі' }, pctText(probs[i] || 0)),
      )));
      return section('gq', 'Якості', g.qualities.length, [t, h('p', { class: 'hint' },
        'Вага × (1 + рівень/50)^ріст × (1 + бонус джерела)^ранг. «×стат» множить основну характеристику, «Бон.» — кількість бонусних властивостей, «Унік.» — унікальних ефектів. Унікальні варіанти мають тематичний ефект замість одного унікального. Шанс справа — для рівня й джерела з «Кидка».')]);
    }

    function classesSection() {
      const g = gm();
      const t = h('div', { class: 'tbl' }, h('div', { class: 'tr head gc' }, th(['Клас', 'Ген. від', 'Ген. до', 'Макс', 'Міцн.', 'Вставки', 'Основна'])));
      const sel = (opts, cur, on, label) => h('select', { 'aria-label': label, onchange: e => on(e.target.value) }, opts.map(o => h('option', { value: o, selected: o === cur }, o)));
      for (const k of g.classes) t.append(h('div', { class: 'tr gc', title: 'Пул бонусів точіння: ' + k.enhancePool.map(effName).join('; ') },
        txtIn(k.name, v => { k.name = v.trim() || k.name; edited(); }, { label: 'Назва класу' }),
        numIn(k.genSockets[0], v => { k.genSockets[0] = Math.round(clampNum(v, 0, 0, 12)); edited(); }, { min: 0, step: 1, label: 'Гнізд при генерації, від' }),
        numIn(k.genSockets[1], v => { k.genSockets[1] = Math.round(clampNum(v, 0, 0, 12)); edited(); }, { min: 0, step: 1, label: 'Гнізд при генерації, до' }),
        numIn(k.maxSockets, v => { k.maxSockets = Math.round(clampNum(v, 0, 0, 12)); edited(); }, { min: 0, step: 1, label: 'Максимум гнізд' }),
        numIn(k.maxDurability, v => { k.maxDurability = Math.round(clampNum(v, 0, 0, 1e6)); edited(); }, { min: 0, step: 10, label: 'Міцність' }),
        sel(['weapon', 'armor', 'jewelry'], k.insertKind, v => { k.insertKind = v; edited(); }, 'Як вставки читають предмет'),
        sel(['damage', 'armor'], k.mainStat, v => { k.mainStat = v; edited(); ctx.roll(); }, 'Основна характеристика')));
      return section('gc', 'Класи предметів', g.classes.length, [t, h('p', { class: 'hint' },
        'Клас задає гнізда (при генерації від–до, межа з зірками й ювеліром), міцність (0 — не зношується), вид вставок (самоцвіт має різний ефект у зброї, броні й прикрасах) і основну характеристику. Наведи на рядок: пул бонусів точіння класу.')]);
    }

    function basesSection() {
      const g = gm();
      const slots = g.slots.map(s => s.id).concat(['None']);
      const [box, list] = withFilter('bases', 'Пошук типу: меч, шолом, mount…', g.bases,
        (b, s) => (b.name + ' ' + b.id + ' ' + slotName(b.slot)).toLowerCase().includes(s),
        b => h('div', { class: 'tr gb' },
          h('input', { type: 'checkbox', checked: b.on !== false, 'aria-label': 'Увімкнено', onchange: e => { if (e.target.checked) delete b.on; else b.on = false; edited(); } }),
          h('span', { title: b.id }, b.name),
          h('select', { 'aria-label': 'Слот', onchange: e => { b.slot = e.target.value; edited(); } }, slots.map(s => h('option', { value: s, selected: s === b.slot }, s === 'None' ? 'лише лежить' : slotName(s)))),
          h('select', { 'aria-label': 'Клас', onchange: e => { b.cls = e.target.value; edited(); } }, g.classes.map(k => h('option', { value: k.id, selected: k.id === b.cls }, k.name))),
          numIn(b.mult, v => { b.mult = clampNum(v, 1, 0, 1000); edited(); }, { min: 0, step: 0.05, label: 'Множник типу' })));
      return section('gb', 'Типи предметів', g.bases.length, [box, list, h('p', { class: 'hint' }, 'База предмета: Stat(рівень) × множник типу × множник якості. Сумки, сорочка й герб не мають характеристик; випадково падає лише спорядження (не сумки й не лут).')]);
    }

    const USE_LABELS = { bonus: 'бонус', unique: 'унік.', theme: 'тема', enhance: 'точіння', set: 'комплект', insert: 'вставка', named: 'імен.' };
    const KIND_LABELS = { flat: 'число', percent: '%', flag: 'механіка' };
    function effectsSection() {
      const g = gm();
      const groups = Array.from(new Set(g.effects.map(e => e.group)));
      let grp = filters.effGroup || '';
      const groupSel = h('select', { 'aria-label': 'Група ефектів', onchange: e => { filters.effGroup = e.target.value; grp = e.target.value; ctx.renderRules(); } },
        [h('option', { value: '' }, 'Усі групи')].concat(groups.map(x => h('option', { value: x, selected: x === grp }, x))));
      const rows = grp ? g.effects.filter(e => e.group === grp) : g.effects;
      const [box, list] = withFilter('effects', 'Пошук ефекту: вогонь, крит, vs_beast…', rows,
        (e, s) => (e.name + ' ' + e.id + ' ' + e.tags.join(' ')).toLowerCase().includes(s),
        e => h('div', { class: 'tr ge' },
          h('input', { type: 'checkbox', checked: e.on !== false, 'aria-label': 'Увімкнено', onchange: ev => { if (ev.target.checked) delete e.on; else e.on = false; edited(); } }),
          h('span', { title: e.id + (e.classes ? '\nКласи: ' + e.classes.join(', ') : '') }, e.name.replace('{0}', '…'), h('small', { class: 'id' }, ' ' + e.id)),
          h('span', { class: 'kind' }, KIND_LABELS[e.kind]),
          e.kind === 'flag' ? h('span') : numIn(e.min, v => { e.min = clampNum(v, 0, -1e9, 1e9); edited(); }, { step: 'any', label: 'Мінімум' }),
          e.kind === 'flag' ? h('span') : numIn(e.max, v => { e.max = clampNum(v, 0, -1e9, 1e9); edited(); }, { step: 'any', label: 'Максимум' }),
          numIn(e.power, v => { e.power = clampNum(v, 0, 0, 100); edited(); }, { min: 0, step: 0.01, label: 'Сила' }),
          numIn(e.weight == null ? 1 : e.weight, v => { e.weight = clampNum(v, 1, 0, 1000); edited(); }, { min: 0, step: 0.1, label: 'Вага вибору' }),
          h('div', { class: 'uses' }, Object.keys(USE_LABELS).map(u => h('button', {
            class: 'chip' + (e.use.includes(u) ? ' on' : ''), title: 'Де ефект може з’являтися',
            onclick: ev => { const i = e.use.indexOf(u); if (i >= 0) e.use.splice(i, 1); else e.use.push(u); ev.target.classList.toggle('on'); edited(); },
          }, USE_LABELS[u])))),
        groupSel);
      return section('ge', 'Ефекти', g.effects.length, [box, list, h('p', { class: 'hint' },
        'Бібліотека ефектів. «число» росте з рівнем як 1,05^(рівень−1), «%» не залежить від рівня, «механіка» — без числа. «Сила» — частка від одиниці сили рівня при максимальному значенні. Чіпи нижче рядка: де ефект може випасти (бонус якості, унікальний, тематичний, точіння, комплект, вставка, іменований). Класи ефекту видно у підказці.')]);
    }

    function insertsSection() {
      const g = gm();
      const rows = []
        .concat(g.gems.map(x => ({ kind: 'Самоцвіт', ref: x, name: x.name, info: `зброя: ${effName(x.weapon)} · броня: ${effName(x.armor)} · прикраси: ${effName(x.jewelry)}` })))
        .concat(g.runes.map((x, i) => ({ kind: 'Руна', ref: x, name: x.name, info: `№${i + 1}: ${effName(g.runeWeak[i % g.runeWeak.length])} ×${(g.runeStrength[0] + g.runeStrength[1] * i).toFixed(2)}` })))
        .concat(g.cards.map(x => ({ kind: 'Картка', ref: x, name: x.name, info: (x.slots ? slotsText(x.slots) + ': ' : 'будь-який предмет: ') + x.effects.map(([e, s]) => effName(e) + (s !== 1 ? ' ×' + s : '')).join('; ') })))
        .concat(g.runewords.map(x => ({ kind: 'Рунне слово', ref: x, name: x.name, info: x.runes.map(r => (g.runes.find(y => y.id === r) || { name: r }).name.replace('Руна ', '')).join(' + ') + ' → ' + effName(x.effect) })));
      const [box, list] = withFilter('inserts', 'Пошук: рубін, Ар, вовк, шторм…', rows, (r, s) => (r.name + ' ' + r.kind + ' ' + r.info).toLowerCase().includes(s),
        r => h('div', { class: 'tr gi' },
          h('input', { type: 'checkbox', checked: r.ref.on !== false, 'aria-label': 'Увімкнено', onchange: e => { if (e.target.checked) delete r.ref.on; else r.ref.on = false; edited(); } }),
          h('span', null, r.name, h('small', { class: 'id' }, ' ' + r.kind)), h('span', { class: 'info' }, r.info)));
      return section('gi', 'Вставки: самоцвіти, руни, картки', rows.length, [box, list, h('p', { class: 'hint' },
        'Самоцвіт має сім ступенів (×1,5 до ефекту за ступінь, три однакові зливаються у вищий). Сама руна слабка, але руни у точному порядку в предметі потрібного виду з точною кількістю гнізд дають рунне слово. Картка моба дає той самий бонус завжди.')]);
    }
    const slotsText = arr => arr.map(slotName).join(', ');

    function setsSection() {
      const g = gm();
      const [box, list] = withFilter('sets', 'Пошук комплекту: назва, джерело, гра…', g.sets,
        (s, t) => (s.name + ' ' + s.source + ' ' + s.ref).toLowerCase().includes(t),
        s => h('div', { class: 'tr gs' },
          h('input', { type: 'checkbox', checked: s.on !== false, 'aria-label': 'Увімкнено', onchange: e => { if (e.target.checked) delete s.on; else s.on = false; edited(); } }),
          h('span', null, s.name, h('small', { class: 'id' }, ' ' + s.source + (s.ref ? ' · ' + s.ref : ''))),
          h('span', { class: 'info' }, s.slots.length + ' ч.: ' + s.bonuses.map(b => b[0] + '→' + effName(b[1])).join(' · '))));
      return section('gs', 'Комплекти', g.sets.length, [box, list, h('p', { class: 'hint' },
        'Продумані комплекти: слоти частин і бонуси за 2/4/6/8 частин. Окрім них є випадкові (код rset.N): тема, слоти, бонуси з бібліотеки за тегами теми. Вони відтворюються з коду, тож зберігається лише він.')]);
    }

    const PARAMS = [
      ['statBase', 'Stat(1)', 'База характеристик рівня 1'], ['levelGrowth', 'Ріст за рівень', 'Stat(рівень) = База × ріст^(рівень−1)'], ['equipSlack', 'Запас рівня', 'можна одягти предмет на стільки вище рівня персонажа'],
      ['starStep', 'Зірка, +%', 'на половинку зірки (0,05 = +5%)'], ['maxHalfStars', 'Макс. половинок', '30 = 15★'], ['socketStars', 'Гнізда за зірки', 'половинки через кому: на 5★, 10★, 15★'], ['essenceGrowth', 'Ціна зірки ×', 'кожна наступна половинка дорожча'],
      ['starDrop.base', 'Зірки: основа', 'шанс ще однієї половинки при випадінні'], ['starDrop.levelCap', 'Зірки: від рівня', 'максимум додатку від рівня'], ['starDrop.elite', 'Зірки: еліта', ''], ['starDrop.boss', 'Зірки: бос', ''], ['starDrop.cap', 'Зірки: стеля', ''], ['starDrop.max', 'Зірки: макс. при дропі', 'половинок'],
      ['enhance.stat', 'Точіння: стати ×', 'за кожен плюс'], ['enhance.affix', 'Точіння: бонуси +', 'за кожен плюс (0,02 = +2%)'], ['enhance.chance', 'Точіння: шанс +0', ''], ['enhance.decay', 'Точіння: спад', 'шанс × спад^плюс'], ['enhance.minChance', 'Точіння: мін. шанс', ''],
      ['enhance.dustMax', 'Пил: максимум', ''], ['enhance.dustStep', 'Пил: за одиницю', ''], ['enhance.blessing', 'Благословення', ''], ['enhance.dropFrom', 'Плюс падає з', 'при невдачі'], ['enhance.stonesPer', 'Каменів: кожні N плюсів', '1 + плюс/N'], ['enhance.keep', 'Перенос плюса', 'частка, що зберігається'],
      ['rarity.elite', 'Якість: еліта', 'бонус до рангу якості'], ['rarity.boss', 'Якість: бос', ''], ['rarity.luck', 'Якість: Удача', 'за одиницю'],
      ['durability.weapon', 'Знос зброї', 'шанс −1 за удар'], ['durability.armor', 'Знос броні', 'шанс −1 за отриманий удар'], ['durability.death', 'Знос від смерті', 'частка міцності'], ['durability.repair', 'Ремонт', 'ціна за одиницю'], ['durability.repairRank', 'Ремонт: за ранг', ''],
      ['value.base', 'Ціна: база', '3 × (1+ранг)² × рівень'], ['value.plus', 'Ціна: за плюс', ''], ['value.bag', 'Ціна сумки', 'за комірку'],
      ['inserts.cardMob', 'Картка: моб', 'шанс з луту'], ['inserts.cardElite', 'Картка: еліта', ''], ['inserts.cardBoss', 'Картка: бос', ''], ['inserts.rune', 'Шанс руни', ''], ['inserts.tierGrowth', 'Ступінь ×', 'до ефекту вставки за ступінь'], ['inserts.mergeCount', 'Злиття, штук', 'однакових самоцвітів'],
    ];
    const getp = (o, path) => path.split('.').reduce((a, k) => a[k], o);
    const setp = (o, path, v) => { const ks = path.split('.'); const last = ks.pop(); ks.reduce((a, k) => a[k], o)[last] = v; };
    function paramsSection() {
      const g = gm();
      const rows = PARAMS.map(([path, label, hint]) => {
        const val = getp(g.params, path);
        const control = Array.isArray(val)
          ? txtIn(val.join(', '), v => { const a = v.split(',').map(x => Number(x.trim())).filter(x => Number.isFinite(x) && x > 0); if (a.length) { setp(g.params, path, a); edited(); ctx.roll(); } }, { label })
          : numIn(val, v => { setp(g.params, path, clampNum(v, val, -1e9, 1e9)); edited(); ctx.roll(); }, { step: 'any', label });
        return h('div', { class: 'row' }, h('label', null, label), control, hint ? h('span', { class: 'hint' }, hint) : null);
      });
      rows.push(h('div', { class: 'row' }, h('label', null, 'Сила самоцвіта'), numIn(g.gemStrength, v => { g.gemStrength = clampNum(v, 0.3, 0, 100); edited(); ctx.roll(); }, { min: 0, step: 0.05, label: 'Сила самоцвіта' }), h('span', { class: 'hint' }, 'частка від максимального ефекту')));
      return section('gp', 'Формули і числа', PARAMS.length + 1, rows);
    }

    function rules(root) {
      root.append(rollSection(), qualitiesSection(), classesSection(), basesSection(), effectsSection(), insertsSection(), setsSection(), paramsSection());
    }

    /* ---------- предмети ---------- */
    const enhState = () => S.enh || (S.enh = { dust: 0, blessing: false, protection: false });
    function act(fn) { fn(); ctx.save(); ctx.renderOut(); }
    function insertOptions(it) {
      const g = gm(), c = G.idx(g), out = [];
      const tier = S.gemTier == null ? 0 : S.gemTier;
      const fits = card => G.insertFits(g, card, it);
      const gems = [], runes = [], cards = [];
      for (const card of c.ins.values()) {
        if (!fits(card)) continue;
        if (card.kind === 'gem' && card.tier === tier) gems.push(card);
        else if (card.kind === 'rune') runes.push(card);
        else if (card.kind === 'card') cards.push(card);
      }
      for (const [label, list] of [['Самоцвіти (ступінь ' + (g.gemTierNames[tier] || tier) + ')', gems], ['Руни', runes], ['Картки', cards]]) {
        if (list.length) out.push(h('optgroup', { label }, list.map(card => h('option', { value: card.code }, card.name))));
      }
      return out;
    }
    function itemCard(it, i) {
      const C = cfg(), g = C.game, d = G.describe(C, it);
      const set = d.set;
      const counts = G.setCounts(ctx.getItems());
      const have = it.setCode ? counts[it.setCode] || 0 : 0;
      const E = enhState();
      it.tries = it.tries || 0;
      const spent = it.spent || (it.spent = { essence: 0, stones: 0 });
      const e2 = (arr, cls) => (arr.length ? h('ul', { class: cls }, arr.map(x => h('li', { class: x.flag ? 'flag' : '' }, x.text))) : null);
      const sockets = it.inserts.length ? h('div', { class: 'socks' }, d.inserts.map((s, k) => h('span', { class: 'sock' + (s.code ? ' on' : '') + (s.muted ? ' muted' : ''), style: s.color ? `--g:${s.color}` : '', title: s.code ? s.name + (s.lines.length ? ': ' + s.lines.join('; ') : '') : 'Порожнє гніздо' },
        s.code ? h('b', null, s.name.replace(/^Картка: /, '').replace(/^Руна /, '')) : '○',
        s.code ? h('button', { class: 'x', title: 'Зняти (вставка зникає, як без сувою)', onclick: () => act(() => { G.removeInsert(it, k, false); G.derive(g, it); }) }, '✕') : null))) : null;
      const insLines = d.inserts.filter(s => s.code && s.lines.length).map(s => h('li', { class: s.muted ? 'muted' : '' }, h('b', { style: `color:${s.color}` }, s.name), ': ', s.lines.join('; ')));
      const opts = insertOptions(it);
      const stoneNeed = G.stonesNeeded(g, it.plus);
      const chance = G.enhanceChance(g, it.plus, E.dust, E.blessing);
      const card = h('article', { class: 'item gitem', style: `--c:${/^#[0-9a-f]{3,8}$/i.test(it.color) ? it.color : '#a39e93'}` },
        h('div', { class: 'sub' }, `${it.rarityName} · ${it.slotName} · рів. ${it.level}${it.named ? ' · іменований' : ''}`),
        h('h3', null, it.name, it.plus ? h('span', { class: 'plus' }, ' +' + it.plus) : null),
        h('div', { class: 'sub' }, h('span', { class: 'stars' }, `${it.stars}★`), ` · гнізд ${it.sockets}/${g.classes.find(k => k.id === it.cls).maxSockets}`),
        d.main ? h('ul', { class: 'base' }, h('li', null, d.main)) : null,
        e2(d.bonuses, 'aff'),
        e2(d.uniques, 'aff uniq'),
        d.enhance.length ? h('ul', { class: 'aff enh' }, d.enhance.map(x => h('li', null, '⚒ ' + x.text))) : null,
        sockets,
        insLines.length ? h('ul', { class: 'ins' }, insLines) : null,
        d.runeword ? h('p', { class: 'rw' }, '᛭ Рунне слово «' + d.runeword.name + '»: ' + d.runeword.text) : null,
        set ? h('div', { class: 'setbox' }, h('b', null, set.name), ` (${have}/${set.parts}${set.ref ? ', ' + set.ref : ''})`,
          h('ul', null, set.bonuses.map(b => h('li', { class: have >= b.n ? 'on' : '' }, `${b.n}: ${b.text}`)))) : null,
        it.flavor ? h('p', { class: 'flavor' }, it.flavor) : null,
        h('div', { class: 'foot' }, h('span', null, 'Сила ', h('b', null, fmtNum(it.power)), it.powerParts.inserts ? ` (вставки ${fmtNum(it.powerParts.inserts)})` : ''),
          h('span', null, d.durability ? 'Міцн. ' + d.durability : '', ' · ', fmtNum(d.sell), ' ⛁'),
          h('button', { title: 'Скопіювати цей предмет як JSON', onclick: () => ctx.copyText(JSON.stringify(it, null, 2), 'Предмет скопійовано') }, 'JSON')),
        h('div', { class: 'acts' },
          h('button', { title: `Додати половинку зірки: ${G.essenceCost(g, it.halfStars)} зоряної есенції`, disabled: it.halfStars >= g.params.maxHalfStars, onclick: () => act(() => { spent.essence += G.addHalfStar(C, it); }) }, '★+½'),
          h('button', { title: `Точіння: шанс ${pctText(chance)}, каменів ${stoneNeed}`, onclick: () => act(() => {
            const rng = L.rngFromSeed(`${it.seed}:try:${it.tries++}`);
            const inp = { stones: stoneNeed, stoneLevel: it.level, dust: E.dust, blessing: E.blessing, protection: E.protection };
            const r = G.enhanceAttempt(C, it, rng, inp);
            spent.stones += stoneNeed - inp.stones === 0 ? 0 : stoneNeed - inp.stones;
            ctx.toast(G.resultText[r] || r);
          }) }, `Точити ${pctText(chance)}`),
          h('button', { title: 'Ювелір додає гніздо (до максимуму класу)', disabled: it.sockets >= g.classes.find(k => k.id === it.cls).maxSockets, onclick: () => act(() => { G.addSocket(C, it); }) }, '＋гніздо'),
          opts.length && it.inserts.includes(null) ? h('select', { 'aria-label': 'Вставити в гніздо', onchange: e => { const v = e.target.value; if (!v) return; act(() => { if (!G.insert(g, it, it.inserts.indexOf(null), v)) ctx.toast('Не підходить'); G.derive(g, it); }); } },
            [h('option', { value: '' }, 'Вставити…')].concat(opts)) : null,
          it.durMax ? h('button', { title: 'Знос на 25% міцності', onclick: () => act(() => { G.wearItem(g, it, Math.ceil(it.durMax * 0.25)); }) }, 'Знос') : null,
          it.wear ? h('button', { title: `Ремонт: ${fmtNum(d.repair)} золота`, onclick: () => act(() => { it.wear = 0; G.derive(g, it); }) }, 'Ремонт') : null),
        spent.essence || spent.stones ? h('p', { class: 'hint' }, `Витрачено: есенції ${fmtNum(spent.essence)}, каменів точіння ${fmtNum(spent.stones)}.`) : null);
      return card;
    }
    /* ---------- лялька героя ---------- */
    const DOLL = [
      ['armor', 'Броня', [['Head', 'Голова'], ['Shoulders', 'Плечі'], ['Cloak', 'Плащ'], ['Chest', 'Груди'], ['Shirt', 'Сорочка'], ['Tabard', 'Гербова накидка'], ['Wrists', "Зап'ястя"], ['Hands', 'Руки'], ['Waist', 'Пояс'], ['Legs', 'Ноги'], ['Feet', 'Ступні']]],
      ['jewel', 'Прикраси', [['Neck', 'Шия'], ['Ring', 'Кільце 1'], ['Ring', 'Кільце 2'], ['Trinket', 'Аксесуар 1'], ['Trinket', 'Аксесуар 2']]],
      ['weapon', 'Зброя та інше', [['MainHand', 'Основна рука'], ['OffHand', 'Друга рука'], ['Extra', 'Додатковий'], ['Glider', 'Планер'], ['Mount', 'Маунт']]],
    ];
    function dollCells() {
      const cells = [];
      for (const [grp, , list] of DOLL) {
        const seen = {};
        for (const [slot, name] of list) {
          seen[slot] = (seen[slot] || 0) + 1;
          const id = slot + seen[slot];
          const accepts = slot === 'MainHand' ? ['MainHand', 'TwoHand'] : [slot];
          cells.push({ id, name, group: grp, accepts, blocks: slot === 'MainHand' ? 'OffHand1' : null });
        }
      }
      return cells;
    }
    let selItem = null;
    const miniOf = it => ({ name: it.name + (it.plus ? ' +' + it.plus : ''), sub: `${it.rarityName} · ${it.stars}★ · ${it.sockets} гн.`, color: /^#[0-9a-f]{3,8}$/i.test(it.color) ? it.color : '#a39e93', slot: it.slotName });
    function tipNode(it) {
      const C = cfg(), d = G.describe(C, it);
      const li = (arr, cls) => (arr && arr.length ? h('ul', { class: cls }, arr.map(x => h('li', { class: x.flag ? 'flag' : '' }, x.text))) : null);
      const m = miniOf(it);
      return h('div', { class: 'tipc', style: `--c:${m.color}` },
        h('div', { class: 'sub' }, `${it.rarityName} · ${it.slotName} · рів. ${it.level}${it.named ? ' · іменований' : ''}`),
        h('h4', null, m.name),
        h('div', { class: 'sub' }, `${it.stars}★ · гнізд ${it.sockets}`),
        d.main ? h('p', { class: 'base' }, d.main) : null,
        li(d.bonuses, 'aff'), li(d.uniques, 'aff uniq'),
        d.enhance.length ? h('ul', { class: 'aff enh' }, d.enhance.map(x => h('li', null, '⚒ ' + x.text))) : null,
        d.inserts.some(s => s.code) ? h('ul', { class: 'ins' }, d.inserts.filter(s => s.code).map(s => h('li', { class: s.muted ? 'muted' : '' }, h('b', { style: `color:${s.color}` }, s.name), s.lines.length ? ': ' + s.lines.join('; ') : ''))) : null,
        d.inserts.some(s => !s.code) ? h('p', { class: 'hint' }, `Порожніх гнізд: ${d.inserts.filter(s => !s.code).length}`) : null,
        d.runeword ? h('p', { class: 'rw' }, '᛭ «' + d.runeword.name + '»: ' + d.runeword.text) : null,
        d.set ? h('p', { class: 'hint' }, 'Комплект: ' + d.set.name) : null,
        h('p', { class: 'hint' }, `Сила ${fmtNum(it.power)}${d.durability ? ' · Міцн. ' + d.durability : ''} · ${fmtNum(d.sell)} ⛁`));
    }

    function renderItems(out) {
      const C = cfg(), g = C.game;
      const sel = (opts, cur, on, label, tip) => h('select', { 'aria-label': label, title: tip, onchange: e => on(e.target.value) }, opts.map(([v, t]) => h('option', { value: v, selected: String(v) === String(cur) }, t)));
      const E = enhState();
      out.append(h('div', { class: 'bar-tools' },
        h('button', { class: 'btn-forge', title: 'Згенерувати нові предмети з новим seed (Пробіл)', onclick: ctx.reseedAndRoll }, 'Кинути'), h('kbd', null, 'Пробіл'),
        h('label', { title: 'Скільки предметів випадає за один кидок' }, 'Скільки', sel([[3, '3'], [6, '6'], [12, '12'], [24, '24']], S.count, v => { S.count = +v; ctx.save(); ctx.roll(); }, 'Кількість предметів')),
        h('label', { title: 'Обмежити кидок однією якістю. «Будь-яка»: за шансами правил' }, 'Якість', sel([['any', 'Будь-яка']].concat(g.qualities.filter(x => x.on !== false).map(x => [x.id, x.name])), S.rarity, v => { S.rarity = v; ctx.save(); ctx.roll(); }, 'Якість')),
        h('label', { title: 'Кидати тільки предмети для одного слота героя' }, 'Слот', sel([['any', 'Будь-який']].concat(G.slotChoices(C)), S.slot, v => { S.slot = v; ctx.save(); ctx.roll(); }, 'Слот')),
        h('span', { class: 'seg mini', role: 'group', 'aria-label': 'Вигляд' },
          ['slots:Слоти героя:Предмети лежать у слотах спорядження героя', 'cards:Картки:Усі предмети окремими картками'].map(x => { const [v, t, tip] = x.split(':'); return h('button', { class: (S.view || 'slots') === v ? 'on' : '', title: tip, onclick: () => { S.view = v; ctx.save(); ctx.renderOut(); } }, t); }))));
      out.append(h('details', { class: 'more' }, h('summary', { title: 'Налаштування для кнопок «Точити» і «Вставити» на картках' }, 'Точіння та вставки'),
        h('div', { class: 'bar-tools' },
          h('label', { title: 'Ступінь самоцвітів у списку «Вставити…»' }, 'Самоцвіти', sel(g.gemTiers.map((t, i) => [i, g.gemTierNames[i] || t]), S.gemTier || 0, v => { S.gemTier = +v; ctx.save(); ctx.renderOut(); }, 'Ступінь самоцвітів у списку вставок')),
          h('label', { title: 'Пил точіння: +1% до шансу за кожну одиницю, до 10' }, 'Пил', numIn(E.dust, v => { E.dust = Math.round(clampNum(v, 0, 0, 10)); ctx.save(); ctx.renderOut(); }, { min: 0, max: 10, step: 1, label: 'Пил точіння' })),
          h('label', { title: 'Благословення: +15% до шансу точіння' }, h('input', { type: 'checkbox', checked: E.blessing, onchange: e => { E.blessing = e.target.checked; ctx.save(); ctx.renderOut(); } }), 'Благословення'),
          h('label', { title: 'Сувій захисту: невдале точіння не знижує рівень' }, h('input', { type: 'checkbox', checked: E.protection, onchange: e => { E.protection = e.target.checked; ctx.save(); ctx.renderOut(); } }), 'Захист'))));
      const items = ctx.getItems();
      if (!items.includes(selItem)) selItem = items[0] || null;
      if ((S.view || 'slots') === 'cards') {
        const grid = h('div', { class: 'items' });
        items.forEach((it, i) => grid.append(itemCard(it, i)));
        out.append(grid);
      } else {
        const cells = dollCells();
        out.append(LootUI.view({
          h, items, cells, groups: DOLL.map(d => ({ id: d[0], name: d[1] })),
          itemSlot: it => it.gslot, isTwoHand: it => it.gslot === 'TwoHand',
          tip: tipNode, mini: miniOf, selected: selItem,
          onSelect: it => { selItem = it; LootUI.hide(); ctx.renderOut(); },
          detail: it => itemCard(it, items.indexOf(it)),
        }));
      }
      const chars = items.length ? G.characterPower(C, items) : 0;
      const sets = G.setCounts(items);
      const lines = Object.entries(sets).filter(([, n]) => n >= 2).map(([code, n]) => {
        const s = G.getSet(g, code);
        return h('p', { class: 'hint' }, '⛓ ' + s.name + ': ' + n + ' шт. у кидку, активні бонуси: ' + (G.activeSetBonuses(s, n).map(b => effLine(b[1], 1, S.ilvl)).join('; ') || 'ще нема'));
      });
      const cs = G.activeCardSets(g, items);
      out.append(h('div', { class: 'sets' }, lines, cs.map(s => h('p', { class: 'hint' }, '🂠 ' + s.name + ': ' + s.effects.map(([e]) => effName(e)).join('; ')))));
      out.append(h('p', { class: 'hint' }, `Seed «${S.seed}» дає ті самі предмети щоразу. Сила всіх предметів разом із комплектами й наборами карток: ${fmtNum(chars)}.`));
    }

    /* ---------- симуляція: доповнення ---------- */
    function simExtras(out, R) {
      if (!R.game) return;
      const g = gm(), n = R.n;
      const bar = (rows, color) => {
        const mx = Math.max(...rows.map(r => r[1]), 1e-9);
        return h('div', { class: 'dist' }, rows.map(([name, v, txt]) => h('div', { class: 'dist-row', style: `--c:${color}` },
          h('span', { class: 'nm', title: name }, name), h('span', { class: 'tr-bar' }, h('i', { style: `width:${(v / mx * 100).toFixed(2)}%` })), h('span', { class: 'val' }, txt))));
      };
      out.append(h('h3', { class: 't' }, 'Класи предметів'));
      out.append(bar(Object.entries(R.byClass).sort((a, b) => b[1] - a[1]).map(([id, k]) => [(g.classes.find(x => x.id === id) || { name: id }).name, k, `${pctText(k / n)} (${k.toLocaleString('uk-UA')})`]), '#e8924a'));
      out.append(h('h3', { class: 't' }, 'Зірки при випадінні'));
      out.append(bar(R.stars.map((k, i) => [(i / 2) + '★', k, pctText(k / n)]).filter(r => r[1] > 0), '#e8b04a'));
      out.append(h('h3', { class: 't' }, 'Гнізда'));
      out.append(bar(Object.entries(R.sockets).sort((a, b) => a[0] - b[0]).map(([s, k]) => [s + ' гн.', k, pctText(k / n)]), '#88a9d6'));
      out.append(h('p', { class: 'hint' }, `Частини комплектів: ${pctText(R.sets / n)} · з унікальними ефектами: ${pctText(R.uniques / n)}${R.runewords ? ' · рунних слів: ' + R.runewords : ''}.`));
      if (R.topUniques.length) {
        out.append(h('h3', { class: 't' }, 'Найчастіші унікальні ефекти'));
        out.append(bar(R.topUniques.map(u => [u.name, u.count, pctText(u.share)]), '#b48be0'));
      }
    }

    /* ---------- калькулятор гри ---------- */
    function renderGameCalc(out) {
      const C = cfg(), g = C.game, p = g.params;
      const lvl = S.ilvl;
      const field = (label, value, on, hint, o = {}) => h('div', { class: 'row' }, h('label', null, label), numIn(value, on, Object.assign({ label }, o)), h('span', { class: 'hint' }, hint));
      const gc = S.gcalc || (S.gcalc = { char: 20, plus: 12, dust: 0, blessing: false, wear: 40, quality: 'quality.blue', plusMax: 20 });
      const redraw = () => { ctx.save(); ctx.renderOut(); };
      out.append(
        field('Рівень предмета', lvl, v => { S.ilvl = Math.round(clampNum(v, 1, 1, 5000)); redraw(); }, 'береться з «Кидка»', { min: 1, step: 1 }),
        field('Рівень персонажа', gc.char, v => { gc.char = Math.round(clampNum(v, 1, 1, 5000)); redraw(); }, `одягне предмети до рівня ${gc.char + p.equipSlack}`, { min: 1, step: 1 }),
      );
      const stat = G.stat(g, lvl);
      out.append(h('div', { class: 'stat-cards' }, [
        ['Stat(рівень)', fmtNum(stat)], ['Множник рівня', '×' + fmtNum(G.scale(g, lvl))], ['Можна одягти', G.canEquip(g, lvl, gc.char) ? 'так' : 'ні, потрібен рівень ' + (lvl - p.equipSlack)],
        ['Одиниця сили', fmtNum(stat)]].map(([a, b]) => h('div', { class: 'stat-card' }, h('small', null, a), h('b', null, b)))));

      // Точіння
      out.append(h('h3', { class: 't' }, 'Точіння'));
      out.append(field('Пил, од.', gc.dust, v => { gc.dust = Math.round(clampNum(v, 0, 0, p.enhance.dustMax)); redraw(); }, `+${(p.enhance.dustStep * 100).toFixed(0)}% за одиницю, до ${p.enhance.dustMax}`, { min: 0, max: p.enhance.dustMax, step: 1 }));
      out.append(h('div', { class: 'row' }, h('label', null, 'Благословення'), h('input', { type: 'checkbox', checked: gc.blessing, 'aria-label': 'Сувій благословення', onchange: e => { gc.blessing = e.target.checked; redraw(); } }), h('span', { class: 'hint' }, `+${p.enhance.blessing * 100}% на одну спробу`)));
      const rows = [];
      let cumTries = 0, cumStones = 0;
      for (let pl = 0; pl < gc.plusMax; pl++) {
        const ch = G.enhanceChance(g, pl, gc.dust, gc.blessing), tries = 1 / ch, st = G.stonesNeeded(g, pl);
        cumTries += tries; cumStones += tries * st;
        rows.push(h('tr', null, h('td', { class: 'n' }, `+${pl} → +${pl + 1}`), h('td', { class: 'm' }, pctText(ch)), h('td', { class: 'm' }, st), h('td', { class: 'm' }, fmtNum(tries)), h('td', { class: 'm' }, fmtNum(cumStones)),
          h('td', { class: 'm' }, '×' + fmtNum(G.enhStatMult(g, pl + 1))), h('td', { class: 'm' }, '+' + Math.round((G.enhAffixMult(g, pl + 1) - 1) * 100) + '%'),
          h('td', { class: 'm' }, G.isBonusMilestone(pl + 1) ? 'новий бонус' : ''), h('td', { class: 'm' }, pl + 1 >= p.enhance.dropFrom ? 'падає' : '')));
      }
      out.append(field('Таблиця до +', gc.plusMax, v => { gc.plusMax = Math.round(clampNum(v, 1, 1, 60)); redraw(); }, 'скільки рядків показати', { min: 1, max: 60, step: 1 }));
      out.append(h('table', { class: 'dt' }, h('thead', null, h('tr', null, ['Крок', 'Шанс', 'Каменів', 'Спроб', 'Каменів разом', 'Стати', 'Бонуси', '', 'Невдача'].map((x, i) => h('th', { class: i ? 'm' : '' }, x)))), h('tbody', null, rows)));
      out.append(h('p', { class: 'hint' }, `Спроб = 1/шанс. «Каменів разом» — очікувана сума до цього кроку без сувою захисту. Бонус точіння дається на +5, +10, +15, +20 і далі кожні +10. З +${p.enhance.dropFrom} невдача знижує плюс на 1; сувій захисту це скасовує.`));

      // Зірки
      out.append(h('h3', { class: 't' }, 'Зірки та гнізда'));
      const srows = [];
      let cum = 0;
      for (let hs = 1; hs <= p.maxHalfStars; hs++) {
        const cost = hs < p.maxHalfStars ? G.essenceCost(g, hs) : 0;
        srows.push(h('tr', null, h('td', { class: 'n' }, (hs / 2) + '★'), h('td', { class: 'm' }, '+' + Math.round(p.starStep * hs * 100) + '%'), h('td', { class: 'm' }, G.starSockets(g, hs)),
          h('td', { class: 'm' }, hs < p.maxHalfStars ? fmtNum(cost) : '—'), h('td', { class: 'm' }, fmtNum(cum))));
        cum += cost;
      }
      out.append(h('table', { class: 'dt' }, h('thead', null, h('tr', null, ['Зірки', 'До характеристик', 'Гнізд за зірки', 'Наступна половинка', 'Есенції разом'].map((x, i) => h('th', { class: i ? 'm' : '' }, x)))), h('tbody', null, srows)));
      out.append(h('p', { class: 'hint' }, 'Кожна наступна половинка дорожча (×' + p.essenceGrowth + '). Гнізда за зірки відкриваються на ' + p.socketStars.map(x => x / 2 + '★').join(', ') + ' і не перевищують максимум класу.'));

      // Ремонт і ціна
      out.append(h('h3', { class: 't' }, 'Міцність і ціна'));
      out.append(h('div', { class: 'row' }, h('label', null, 'Якість'), h('select', { 'aria-label': 'Якість', onchange: e => { gc.quality = e.target.value; redraw(); } }, g.qualities.map(x => h('option', { value: x.id, selected: x.id === gc.quality }, x.name)))));
      out.append(field('Плюс', gc.plus, v => { gc.plus = Math.round(clampNum(v, 0, 0, 200)); redraw(); }, 'впливає на ціну продажу', { min: 0, step: 1 }));
      out.append(field('Зношено, од.', gc.wear, v => { gc.wear = Math.round(clampNum(v, 0, 0, 1e6)); redraw(); }, 'зі шкали міцності класу', { min: 0, step: 5 }));
      const fake = { baseCode: (G.idx(g).gear[0] || {}).id, level: lvl, quality: gc.quality, plus: gc.plus, wear: gc.wear };
      const rrows = g.classes.filter(k => k.maxDurability > 0).map(k => {
        const probe = Object.assign({}, fake, { cls: k.id, wear: Math.min(gc.wear, k.maxDurability) });
        const rq = g.qualities.find(x => x.id === gc.quality) || g.qualities[0];
        const cost = probe.wear * p.durability.repair * G.scale(g, lvl) * (1 + p.durability.repairRank * rq.rank);
        return h('tr', null, h('td', { class: 'n' }, k.name), h('td', { class: 'm' }, k.maxDurability), h('td', { class: 'm' }, fmtNum(cost)), h('td', { class: 'm' }, fmtNum(cost / Math.max(1, probe.wear) * k.maxDurability)));
      });
      const rq = g.qualities.find(x => x.id === gc.quality) || g.qualities[0];
      const price = Math.max(1, Math.round(p.value.base * (1 + rq.rank) * (1 + rq.rank) * G.scale(g, lvl) * (1 + p.value.plus * gc.plus)));
      out.append(h('table', { class: 'dt' }, h('thead', null, h('tr', null, ['Клас', 'Макс. міцність', 'Ремонт зараз', 'Повний ремонт'].map((x, i) => h('th', { class: i ? 'm' : '' }, x)))), h('tbody', null, rrows)));
      out.append(h('p', { class: 'hint' }, `Ціна продажу спорядження цієї якості, рівня ${lvl} і +${gc.plus}: ${fmtNum(price)}. Смерть забирає ${p.durability.death * 100}% міцності; зламаний предмет не дає характеристик.`));

      // Вставки
      out.append(h('h3', { class: 't' }, 'Самоцвіти на цьому рівні'));
      const grows = g.gems.map(gem => h('tr', null, h('td', { class: 'n', style: `color:${gem.color}` }, gem.name),
        ...['weapon', 'armor', 'jewelry'].map(kind => {
          const e = G.idx(g).eff.get(gem[kind]);
          return h('td', { class: 'm', title: 'ступінь «' + (g.gemTierNames[0] || '') + '» → «' + (g.gemTierNames[g.gemTierNames.length - 1] || '') + '»' },
            e ? G.effText(e, G.effValue(g, e, 1, lvl) * g.gemStrength, gem[kind]) + ' … ' + fmtNum(G.effValue(g, e, 1, lvl) * g.gemStrength * Math.pow(p.inserts.tierGrowth, g.gemTiers.length - 1)) : '—');
        })));
      out.append(h('table', { class: 'dt' }, h('thead', null, h('tr', null, ['Самоцвіт', 'У зброї', 'У броні', 'У прикрасах'].map((x, i) => h('th', { class: i ? 'm' : '' }, x)))), h('tbody', null, grows)));
      out.append(h('p', { class: 'hint' }, `Ефект самоцвіта = максимум ефекту × ${g.gemStrength} × ${p.inserts.tierGrowth}^ступінь. Три однакові зливаються у вищий ступінь: найвищий (${g.gemTierNames[g.gemTierNames.length - 1] || ''}) коштує ${Math.pow(p.inserts.mergeCount, g.gemTiers.length - 1).toLocaleString('uk-UA')} уламків.`));
    }

    /* ---------- каталог ---------- */
    function renderCatalog(out) {
      const C = cfg(), g = C.game;
      const f = (filters.cat || '').toLowerCase();
      const inp = h('input', { type: 'text', class: 'txt', placeholder: 'Пошук по каталогу…', value: filters.cat || '', 'aria-label': 'Пошук по каталогу', oninput: e => { filters.cat = e.target.value; const pos = e.target.selectionStart; ctx.renderOut(); const n = document.querySelector('#out input[aria-label="Пошук по каталогу"]'); if (n) { n.focus(); n.setSelectionRange(pos, pos); } } });
      out.append(h('div', { class: 'bar-tools' }, inp));
      const has = s => !f || s.toLowerCase().includes(f);
      const block = (title, count, node) => { if (node) out.append(h('h3', { class: 't' }, `${title} (${count})`), node); };
      const runeName = r => (g.runes.find(x => x.id === r) || { name: r }).name.replace('Руна ', '');

      const rws = g.runewords.filter(r => has(r.name + ' ' + r.runes.join(' ') + ' ' + effName(r.effect)));
      block('Рунні слова', rws.length, rws.length ? h('div', { class: 'tbl' }, rws.map(r => h('div', { class: 'cat-row' },
        h('div', null, h('b', null, r.name), ' ', h('span', { class: 'runes' }, r.runes.map(runeName).join(' ▸ '))),
        h('div', { class: 'hint' }, `${r.kinds.map(k => (g.classes.find(c => c.id === k) || { name: { weapon: 'зброя', armor: 'броня', jewelry: 'прикраси' }[k] || k }).name).join(', ')} · точно ${r.runes.length} гн. · ${effName(r.effect)}`),
        h('button', { title: 'Створити предмет із цим рунним словом', onclick: () => ctx.makeRuneword(r) }, 'Зібрати')))) : null);

      const cards = g.cards.filter(c => has(c.name + ' ' + c.effects.map(e => effName(e[0])).join(' ')));
      block('Картки монстрів', cards.length, cards.length ? h('div', { class: 'tbl' }, cards.map(c => h('div', { class: 'cat-row' }, h('b', null, c.name),
        h('div', { class: 'hint' }, (c.slots ? slotsText(c.slots) : 'будь-який предмет') + ': ' + c.effects.map(([e, s]) => effLine(e, 1, S.ilvl) + (s !== 1 ? ' ×' + s : '')).join('; '))))) : null);
      const csets = g.cardSets.filter(c => has(c.name));
      block('Набори карток', csets.length, csets.length ? h('div', { class: 'tbl' }, csets.map(c => h('div', { class: 'cat-row' }, h('b', null, c.name),
        h('div', { class: 'hint' }, c.cards.map(id => (g.cards.find(x => x.id === id) || { name: id }).name).join(' + ') + ' → ' + c.effects.map(([e]) => effName(e)).join('; '))))) : null);

      const sets = g.sets.filter(s => has(s.name + ' ' + s.source + ' ' + s.ref));
      block('Комплекти', sets.length, sets.length ? h('div', { class: 'tbl' }, sets.slice(0, 60).map(s => h('div', { class: 'cat-row' },
        h('div', null, h('b', null, s.name), h('small', { class: 'id' }, ` ${s.source}${s.ref ? ' · ' + s.ref : ''}${s.named ? ' · героя' : ''}`)),
        h('div', { class: 'hint' }, slotsText(s.slots)),
        h('ul', { class: 'bl' }, s.bonuses.map(b => h('li', null, `${b[0]}: ${effLine(b[1], 1, S.ilvl)}`))))),
        sets.length > 60 ? h('p', { class: 'hint' }, 'Показано 60: уточни пошук.') : null) : null);

      const nm = g.named.filter(n => has(n.name + ' ' + n.source + ' ' + n.ref));
      block('Іменовані предмети (вибірка)', nm.length, nm.length ? h('div', { class: 'tbl' }, nm.map(n => {
        const b = g.bases.find(x => x.id === n.base);
        return h('div', { class: 'cat-row' }, h('div', null, h('b', { style: `color:${(g.qualities.find(x => x.id === n.quality) || {}).color}` }, n.name), h('small', { class: 'id' }, ` ${b ? b.name : n.base} · ${n.source}${n.ref ? ' · ' + n.ref : ''}`)),
          h('div', { class: 'hint' }, n.bonuses.map(([e]) => effName(e)).concat(n.uniques.map(effName)).join('; ')),
          h('button', { title: 'Згенерувати цей предмет на поточному рівні', onclick: () => ctx.makeNamed(n.id) }, 'Створити'));
      })) : null);

      const bases = g.bases.filter(b => has(b.name + ' ' + slotName(b.slot) + ' ' + b.id));
      const bySlot = {};
      for (const b of bases) (bySlot[b.slot] = bySlot[b.slot] || []).push(b);
      block('Типи предметів за слотами', bases.length, bases.length ? h('table', { class: 'dt' }, h('tbody', null, Object.entries(bySlot).map(([s, list]) =>
        h('tr', null, h('td', { class: 'n' }, slotName(s)), h('td', null, list.map(b => b.name + (b.mult !== 1 ? ` ×${b.mult}` : '')).join(', ')))))) : null);

      const groups = {};
      for (const e of g.effects) groups[e.group] = (groups[e.group] || 0) + 1;
      block('Групи ефектів', g.effects.length, h('p', { class: 'hint' }, Object.entries(groups).map(([k, v]) => `${k}: ${v}`).join(' · ')));
    }

    return { modeSection, rules, renderItems, itemCard, simExtras, renderGameCalc, renderCatalog };
  }

  return { create };
})();
