/* Loot Forge: ядро. Генерація предметів, симуляція дропу, калькулятор шансів, перевірка й імпорт конфігу.
   Без DOM: працює і в браузері (глобал LootCore), і в Node (module.exports), тож його можна тестувати.

   Конфіг (усе, що потрібно грі):
     stats:     { id: { name, w, pct } }          w = вага характеристики в «силі» предмета, pct = відсоток
     rarities:  [{ id, name, color, weight, min, max, mult }]   min..max афіксів, mult множить значення
     slots:     [{ id, name, tags, base: { stat: [lo, hi] }, on }]
     affixes:   [{ id, stat, min, max, tags, lvl, on }]          tags: 'any' або теги слотів; lvl = мін. рівень предмета
     levelScale: приріст значень за кожен рівень предмета понад 1 (0.08 = +8%)
     game:      (необов'язково) шар GodsDontDie, див. gdd-core.js; коли game.enabled, предмети генеруються за правилами гри */
const LootCore = (() => {
  /* ---------- детермінований генератор ---------- */
  function xmur3(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
    return () => { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return (h ^= h >>> 16) >>> 0; };
  }
  function mulberry32(a) {
    return () => {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rngFromSeed = seed => mulberry32(xmur3(String(seed))());
  const randomSeed = () => Math.random().toString(36).slice(2, 8);

  const randInt = (rng, lo, hi) => lo + Math.floor(rng() * (hi - lo + 1));
  const lerp = (a, b, t) => a + (b - a) * t;
  function pickWeighted(list, rng) {
    let total = 0;
    for (const x of list) total += Math.max(0, x.weight);
    if (total <= 0) return list[0];
    let r = rng() * total;
    for (const x of list) { r -= Math.max(0, x.weight); if (r < 0) return x; }
    return list[list.length - 1];
  }

  /* ---------- назви й тексти ---------- */
  const NAMES = {
    epithets: ['Тихий кінець', 'Остання зоря', 'Вовчий слід', 'Шепіт попелу', 'Залізна клятва', 'Крижаний подих', 'Гнів старої вежі', 'Подих бурі',
      'Сталевий світанок', 'Тінь короля', 'Іскра в темряві', 'Мовчання гір', 'Червоний місяць', 'Забута присяга', 'Серце пустки', 'Крик ворона',
      'Полум’я півночі', 'Холодна ласка', 'Шлях без вороття', 'Вірний борг'],
    funny: ['Мамин борщ', 'Знижка тридцять відсотків', 'Пробач, сусіде', 'Кредит під заставу', 'Дядько Богдан', 'Останній у черзі', 'Сто гривень на каву',
      'Той самий, що минулого разу', 'Подарунок від тещі', 'Виклик до директора', 'Ні, це не мій', 'Гарантія до першої смерті', 'Тест на довіру',
      'Дембельський', 'Витік інформації', 'Чужий вибір', 'Шосте почуття (не працює)', 'Нещасний випадок №7'],
    flavor: ['Колись його стискала рука, яка знала, що робить.', 'Метал пам’ятає кожен бій.', 'Кажуть, він вибирає господаря сам.', 'Не прикрашений, але надійний.',
      'У ньому ще лишилося тепло кузні.', 'Знайдений там, де нікого не шукали.', 'Лезо дивиться на тебе з повагою.', 'Річ, що пережила власників.'],
    flavorFunny: ['Попередній власник більше не скаржиться.', 'Гарантія діє, поки ти живий.', 'Працює краще, якщо вірити. Або якщо цілитися.',
      'Інструкція загубилася разом з інструктором.', 'Продавець клявся, що не проклятий. Продавця не знайти.', 'Якщо болить, значить, працює.',
      'Не залишати без нагляду. Особливо без нагляду.', 'Колись належав людині, яка тепер не потребує нічого.', 'Повертається в інвентар, навіть якщо його продати.',
      'Створений у темряві, але з любов’ю до штрафів.', 'Три з п’яти магів рекомендують. Двох уже не питали.', 'На вигляд дорого, на дотик підозріло.'],
  };
  const FUNNY_P = [0, .25, .6, 1];

  function makeText(slotName, rarityIdx, humor, rng) {
    const fp = FUNNY_P[Math.min(3, Math.max(0, humor | 0))];
    let name = slotName;
    if (rarityIdx >= 1) {
      const pool = rng() < fp ? NAMES.funny : NAMES.epithets;
      name += ' «' + pool[Math.floor(rng() * pool.length)] + '»';
    }
    let flavor = '';
    if (rarityIdx >= 2 || humor >= 3) {
      const pool = rng() < fp ? NAMES.flavorFunny : NAMES.flavor;
      flavor = pool[Math.floor(rng() * pool.length)];
    }
    return { name, flavor };
  }

  /* ---------- пресети ---------- */
  const PRESETS = {
    fantasy: () => ({
      version: 1, name: 'Фентезі-RPG', levelScale: 0.08, uniqueChance: 2,
      sets: [{ id: 'wolf', name: 'Вовча зграя', bonuses: [{ n: 2, stats: { ms: 8 } }, { n: 3, stats: { crit: 10, vamp: 3 } }] }],
      uniques: [
        { id: 'u_wolfblade', name: 'Іклоріз', slot: 'sword', set: 'wolf', lvl: 1, weight: 1, fixed: { dmg: 8, crit: 6 }, flavor: 'Пахне лісом і трохи кров’ю.' },
        { id: 'u_wolfhelm', name: 'Череп вожака', slot: 'helm', set: 'wolf', lvl: 1, weight: 1, fixed: { armor: 10, ms: 5 }, flavor: '' },
        { id: 'u_wolfring', name: 'Кільце зграї', slot: 'ring', set: 'wolf', lvl: 1, weight: 1, fixed: { agi: 8, luck: 6 }, flavor: '' },
        { id: 'u_spark', name: 'Остання іскра', slot: 'staff', lvl: 5, weight: 1, fixed: { int: 14, aspd: 10 }, flavor: 'Горить, навіть коли ніхто не дивиться.' },
      ],
      stats: {
        dmg: { name: 'Шкода', w: 1 }, crit: { name: 'Шанс крита', w: 4, pct: true }, aspd: { name: 'Швидкість атаки', w: 2.5, pct: true },
        str: { name: 'Сила', w: 1.5 }, agi: { name: 'Спритність', w: 1.5 }, int: { name: 'Інтелект', w: 1.5 },
        hp: { name: 'Здоров’я', w: 0.25 }, armor: { name: 'Броня', w: 0.8 }, res: { name: 'Опір магії', w: 2, pct: true },
        ms: { name: 'Швидкість руху', w: 3, pct: true }, luck: { name: 'Удача', w: 2, pct: true }, vamp: { name: 'Вампіризм', w: 6, pct: true },
      },
      rarities: [
        { id: 'common', name: 'Звичайний', color: '#a39e93', weight: 600, min: 0, max: 1, mult: 1 },
        { id: 'uncommon', name: 'Незвичайний', color: '#8dbf95', weight: 250, min: 1, max: 2, mult: 1.15 },
        { id: 'rare', name: 'Рідкісний', color: '#88a9d6', weight: 110, min: 2, max: 3, mult: 1.35 },
        { id: 'epic', name: 'Епічний', color: '#b48be0', weight: 35, min: 3, max: 4, mult: 1.65 },
        { id: 'legendary', name: 'Легендарний', color: '#e8b04a', weight: 5, min: 4, max: 5, mult: 2.1 },
      ],
      slots: [
        { id: 'sword', name: 'Меч', tags: ['weapon'], base: { dmg: [8, 14] }, on: true, weight: 1 },
        { id: 'bow', name: 'Лук', tags: ['weapon', 'ranged'], base: { dmg: [6, 12] }, on: true },
        { id: 'staff', name: 'Посох', tags: ['weapon', 'magic'], base: { dmg: [5, 10], int: [3, 6] }, on: true },
        { id: 'helm', name: 'Шолом', tags: ['armor'], base: { armor: [4, 8] }, on: true },
        { id: 'chest', name: 'Обладунок', tags: ['armor'], base: { armor: [10, 18], hp: [10, 20] }, on: true },
        { id: 'ring', name: 'Кільце', tags: ['jewelry'], base: {}, on: true },
      ],
      affixes: [
        { id: 'a_dmg', stat: 'dmg', min: 2, max: 6, tags: ['weapon'], lvl: 1, on: true },
        { id: 'a_crit', stat: 'crit', min: 2, max: 8, tags: ['weapon', 'jewelry'], lvl: 1, on: true },
        { id: 'a_aspd', stat: 'aspd', min: 4, max: 12, tags: ['weapon'], lvl: 1, on: true },
        { id: 'a_str', stat: 'str', min: 2, max: 8, tags: ['any'], lvl: 1, on: true },
        { id: 'a_agi', stat: 'agi', min: 2, max: 8, tags: ['any'], lvl: 1, on: true },
        { id: 'a_int', stat: 'int', min: 2, max: 8, tags: ['any'], lvl: 1, on: true },
        { id: 'a_hp', stat: 'hp', min: 10, max: 40, tags: ['armor', 'jewelry'], lvl: 1, on: true },
        { id: 'a_armor', stat: 'armor', min: 3, max: 10, tags: ['armor'], lvl: 1, on: true },
        { id: 'a_res', stat: 'res', min: 4, max: 12, tags: ['armor', 'jewelry'], lvl: 1, on: true },
        { id: 'a_ms', stat: 'ms', min: 3, max: 8, tags: ['armor'], lvl: 1, on: true },
        { id: 'a_luck', stat: 'luck', min: 3, max: 10, tags: ['jewelry'], lvl: 1, on: true },
        { id: 'a_vamp', stat: 'vamp', min: 1, max: 3, tags: ['weapon', 'jewelry'], lvl: 8, on: true },
      ],
    }),
    survival: () => ({
      version: 1, name: 'Виживання', levelScale: 0.06, uniqueChance: 0, uniques: [], sets: [],
      stats: {
        dmg: { name: 'Шкода', w: 1 }, dur: { name: 'Міцність', w: 0.2 }, work: { name: 'Швидкість добування', w: 3, pct: true },
        yield: { name: 'Додатковий видобуток', w: 5, pct: true }, carry: { name: 'Вантаж', w: 0.6 }, cold: { name: 'Захист від холоду', w: 1.5 },
        quiet: { name: 'Тихість', w: 2, pct: true },
      },
      rarities: [
        { id: 'junk', name: 'Саморобний', color: '#a39e93', weight: 550, min: 0, max: 1, mult: 1 },
        { id: 'worker', name: 'Робочий', color: '#8dbf95', weight: 260, min: 1, max: 2, mult: 1.2 },
        { id: 'good', name: 'Якісний', color: '#88a9d6', weight: 120, min: 2, max: 3, mult: 1.45 },
        { id: 'master', name: 'Майстерний', color: '#b48be0', weight: 55, min: 2, max: 4, mult: 1.8 },
        { id: 'unique', name: 'Унікальний', color: '#e8b04a', weight: 15, min: 3, max: 5, mult: 2.4 },
      ],
      slots: [
        { id: 'axe', name: 'Сокира', tags: ['tool', 'weapon'], base: { dmg: [6, 10], dur: [80, 140] }, on: true },
        { id: 'pick', name: 'Кирка', tags: ['tool'], base: { dmg: [3, 6], dur: [90, 160] }, on: true },
        { id: 'knife', name: 'Ніж', tags: ['weapon'], base: { dmg: [4, 8], dur: [60, 100] }, on: true },
        { id: 'coat', name: 'Куртка', tags: ['armor'], base: { cold: [4, 9], dur: [70, 120] }, on: true },
        { id: 'boots', name: 'Чоботи', tags: ['armor'], base: { cold: [2, 5], dur: [60, 110] }, on: true },
        { id: 'pack', name: 'Рюкзак', tags: ['bag'], base: { carry: [10, 20] }, on: true },
      ],
      affixes: [
        { id: 'a_dmg', stat: 'dmg', min: 1, max: 4, tags: ['weapon'], lvl: 1, on: true },
        { id: 'a_dur', stat: 'dur', min: 15, max: 60, tags: ['any'], lvl: 1, on: true },
        { id: 'a_work', stat: 'work', min: 5, max: 20, tags: ['tool'], lvl: 1, on: true },
        { id: 'a_yield', stat: 'yield', min: 3, max: 12, tags: ['tool'], lvl: 3, on: true },
        { id: 'a_carry', stat: 'carry', min: 3, max: 15, tags: ['bag', 'armor'], lvl: 1, on: true },
        { id: 'a_cold', stat: 'cold', min: 2, max: 8, tags: ['armor'], lvl: 1, on: true },
        { id: 'a_quiet', stat: 'quiet', min: 5, max: 20, tags: ['armor', 'weapon'], lvl: 2, on: true },
      ],
    }),
  };
  const PRESET_NAMES = { fantasy: 'Фентезі-RPG', survival: 'Виживання' };

  /* ---------- шар GodsDontDie (gdd-core.js реєструє себе сам) ---------- */
  const hooks = { game: null };
  function registerGame(game) {
    hooks.game = game;
    PRESETS.gdd = () => game.preset();
    PRESET_NAMES.gdd = 'GodsDontDie';
  }
  const isGame = cfg => !!(hooks.game && cfg && cfg.game && cfg.game.enabled);

  /* ---------- допоміжне ---------- */
  const fmtVal = (stat, v) => (stat && stat.pct ? Math.round(v * 10) / 10 : Math.round(v));
  const itemScale = (cfg, rarity, ilvl) => (1 + cfg.levelScale * (Math.max(1, ilvl) - 1)) * rarity.mult;

  function allowedAffixes(cfg, slot, ilvl) {
    return cfg.affixes.filter(a => a.on !== false && (a.lvl || 1) <= ilvl && cfg.stats[a.stat] &&
      (a.tags.includes('any') || a.tags.some(t => slot.tags.includes(t))));
  }
  const activeSlots = cfg => cfg.slots.filter(s => s.on !== false);

  // opts (лише для шару гри): { ilvl, source, luck }: шанси якостей залежать від рівня й джерела.
  function rarityProbs(cfg, opts) {
    if (isGame(cfg)) return hooks.game.qualityProbs(cfg, opts || {});
    const total = cfg.rarities.reduce((s, r) => s + Math.max(0, r.weight), 0);
    return cfg.rarities.map(r => (total > 0 ? Math.max(0, r.weight) / total : 0));
  }

  /* ---------- унікальні предмети й комплекти ---------- */
  // cfg.uniqueChance = відсоток предметів, що стають унікальними (0 = вимкнено)
  function pickUnique(cfg, rng, ilvl) {
    if (!(cfg.uniqueChance > 0) || !cfg.uniques || !cfg.uniques.length) return null;
    if (rng() * 100 >= cfg.uniqueChance) return null;
    const pool = cfg.uniques.filter(u => (u.lvl || 1) <= ilvl && cfg.slots.some(s => s.id === u.slot));
    return pool.length ? pickWeighted(pool.map(u => ({ u, weight: u.weight == null ? 1 : u.weight })), rng).u : null;
  }
  function makeUnique(cfg, u, ilvl, rng) {
    const slot = cfg.slots.find(s => s.id === u.slot);
    const rarity = cfg.rarities.find(r => r.id === u.rarity) || cfg.rarities[cfg.rarities.length - 1];
    const k = itemScale(cfg, rarity, ilvl);
    const base = {};
    for (const [stat, [lo, hi]] of Object.entries(slot.base || {})) if (cfg.stats[stat]) base[stat] = Math.max(0, fmtVal(cfg.stats[stat], lerp(lo, hi, rng()) * k));
    const affixes = [];
    for (const [stat, v] of Object.entries(u.fixed || {})) if (cfg.stats[stat]) affixes.push({ id: 'fixed_' + stat, stat, value: fmtVal(cfg.stats[stat], v * (1 + cfg.levelScale * (ilvl - 1))) });
    let power = 0;
    for (const [s, v] of Object.entries(base)) power += v * cfg.stats[s].w;
    for (const a of affixes) power += a.value * cfg.stats[a.stat].w;
    const set = u.set && (cfg.sets || []).find(x => x.id === u.set);
    return { slot: slot.id, slotName: slot.name, rarity: rarity.id, rarityName: rarity.name, color: rarity.color, ilvl, name: u.name, flavor: u.flavor || '', base, affixes, power: Math.round(power * 10) / 10, unique: true, set: set ? set.id : undefined, setName: set ? set.name : undefined };
  }
  // Бонуси комплектів для набору предметів: [{ set, name, count, active:[{n, stats}] }]
  function setBonuses(cfg, items) {
    const cnt = {};
    for (const it of items || []) if (it && it.set) cnt[it.set] = (cnt[it.set] || 0) + 1;
    return (cfg.sets || []).filter(s => cnt[s.id]).map(s => ({ set: s.id, name: s.name, count: cnt[s.id], active: (s.bonuses || []).filter(b => b.n <= cnt[s.id]) }));
  }

  /* ---------- генерація одного предмета ---------- */
  function rollItem(cfg, rng, opts = {}) {
    if (isGame(cfg)) return hooks.game.rollItem(cfg, rng, opts);
    const ilvl = Math.max(1, opts.ilvl | 0 || 1);
    const rarity = (opts.rarity && cfg.rarities.find(r => r.id === opts.rarity)) || pickWeighted(cfg.rarities, rng);
    const rIdx = cfg.rarities.indexOf(rarity);
    const slots = activeSlots(cfg);
    const uq = !opts.rarity && !opts.slot ? pickUnique(cfg, rng, ilvl) : null;
    if (uq) return makeUnique(cfg, uq, ilvl, rng);
    const slot = (opts.slot && slots.find(s => s.id === opts.slot)) || pickWeighted(slots.map(x => ({ x, weight: x.weight == null ? 1 : x.weight })), rng).x;
    const k = itemScale(cfg, rarity, ilvl);

    const base = {};
    for (const [stat, [lo, hi]] of Object.entries(slot.base || {})) {
      if (cfg.stats[stat]) base[stat] = Math.max(0, fmtVal(cfg.stats[stat], lerp(lo, hi, rng()) * k));
    }

    const pool = allowedAffixes(cfg, slot, ilvl).slice();
    const want = randInt(rng, rarity.min, Math.max(rarity.min, rarity.max));
    const n = Math.min(want, pool.length);
    const affixes = [];
    for (let i = 0; i < n; i++) {
      const j = Math.floor(rng() * pool.length);
      const a = pool.splice(j, 1)[0];
      const st = cfg.stats[a.stat];
      const raw = lerp(a.min, a.max, rng()) * k;
      affixes.push({ id: a.id, stat: a.stat, value: Math.max(a.min > 0 ? (st.pct ? .1 : 1) : 0, fmtVal(st, raw)) });
    }

    let power = 0;
    for (const [s, v] of Object.entries(base)) power += v * cfg.stats[s].w;
    for (const a of affixes) power += a.value * cfg.stats[a.stat].w;

    const text = makeText(slot.name, rIdx, opts.humor | 0, rng);
    return { slot: slot.id, slotName: slot.name, rarity: rarity.id, rarityName: rarity.name, color: rarity.color, ilvl, name: text.name, flavor: text.flavor, base, affixes, power: Math.round(power * 10) / 10 };
  }

  function rollMany(cfg, count, seed, opts = {}) {
    const rng = rngFromSeed(seed);
    return Array.from({ length: count }, () => rollItem(cfg, rng, opts));
  }

  /* ---------- симуляція дропу ---------- */
  function simulate(cfg, n, seed, opts = {}) {
    if (isGame(cfg)) return hooks.game.simulate(cfg, n, seed, opts);
    const rng = rngFromSeed(seed);
    const ilvl = opts.ilvl || 1;
    const probs = rarityProbs(cfg);
    const byRarity = cfg.rarities.map((r, i) => ({ id: r.id, name: r.name, color: r.color, count: 0, expected: probs[i] }));
    const bySlot = {};
    let uniques = 0;
    const stats = {};
    const powers = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      const it = rollItem(cfg, rng, { ilvl, humor: 0 });
      byRarity[cfg.rarities.findIndex(r => r.id === it.rarity)].count++;
      bySlot[it.slot] = (bySlot[it.slot] || 0) + 1;
      if (it.unique) uniques++;
      powers[i] = it.power;
      const seen = Object.assign({}, it.base);
      for (const a of it.affixes) seen[a.stat] = (seen[a.stat] || 0) + a.value;
      for (const [s, v] of Object.entries(seen)) {
        const o = stats[s] || (stats[s] = { id: s, name: cfg.stats[s].name, pct: !!cfg.stats[s].pct, min: Infinity, max: -Infinity, sum: 0, count: 0 });
        o.min = Math.min(o.min, v); o.max = Math.max(o.max, v); o.sum += v; o.count++;
      }
    }
    for (const r of byRarity) r.actual = n ? r.count / n : 0;
    const sorted = Float64Array.from(powers).sort();
    const q = p => (n ? sorted[Math.min(n - 1, Math.floor(p * n))] : 0);
    const mean = n ? powers.reduce((s, v) => s + v, 0) / n : 0;
    const lo = n ? sorted[0] : 0, hi = n ? sorted[n - 1] : 0;
    const bins = 24, hist = new Array(bins).fill(0);
    for (const v of powers) hist[hi > lo ? Math.min(bins - 1, Math.floor((v - lo) / (hi - lo) * bins)) : 0]++;
    const power = { mean, median: q(.5), p95: q(.95), p99: q(.99), min: lo, max: hi, hist };

    const warnings = [];
    if (power.p99 > 0 && power.max > power.p99 * 2.5) warnings.push(`Найсильніший предмет у ${(power.max / power.p99).toFixed(1)} раза сильніший за 99-й перцентиль: це викид. Перевір множники рідкості й діапазони афіксів.`);
    const top = byRarity[byRarity.length - 1];
    if (top && n >= 1000 && top.count === 0) warnings.push(`За ${n.toLocaleString('uk-UA')} кидків жодного «${top.name}»: шанс надто малий або вага нульова.`);
    if (top && top.actual > 0 && top.actual < .0005) warnings.push(`«${top.name}» випадає рідше, ніж 1 на ${Math.round(1 / top.actual).toLocaleString('uk-UA')} предметів.`);
    const maxWant = Math.max(0, ...cfg.rarities.map(r => r.max));
    for (const s of activeSlots(cfg)) {
      const pool = allowedAffixes(cfg, s, ilvl).length;
      if (pool < maxWant) warnings.push(`Для «${s.name}» на рівні ${ilvl} доступно лише ${pool} афіксів, а найвища рідкість просить до ${maxWant}.`);
    }
    return { n, uniques, byRarity, bySlot, stats: Object.values(stats).map(o => ({ id: o.id, name: o.name, pct: o.pct, min: o.min, max: o.max, avg: o.sum / o.count, count: o.count })), power, warnings };
  }

  /* ---------- шанси: скільки вбивств до потрібного предмета ---------- */
  // p = ймовірність успіху за одну спробу; pity = жорстка гарантія на N-й спробі (0 = нема)
  function expectedTries(p, pity = 0) {
    if (p <= 0) return Infinity;
    if (p >= 1) return 1;
    return pity > 0 ? (1 - Math.pow(1 - p, pity)) / p : 1 / p;
  }
  function triesForChance(p, q, pity = 0) {
    if (p <= 0) return pity > 0 ? pity : Infinity;
    const t = p >= 1 ? 1 : Math.ceil(Math.log(1 - q) / Math.log(1 - p));
    return pity > 0 ? Math.min(t, pity) : t;
  }
  function formatMinutes(min) {
    if (!isFinite(min)) return '∞';
    if (min < 1) return 'менше хвилини';
    const h = Math.floor(min / 60), m = Math.round(min % 60);
    if (h >= 48) return `≈ ${Math.round(h / 24)} діб`;
    return h ? `≈ ${h} год${m ? ' ' + m + ' хв' : ''}` : `≈ ${m} хв`;
  }

  /* ---------- перевірка й імпорт ---------- */
  function validate(cfg) {
    const out = [];
    if (!cfg || typeof cfg !== 'object') return ['Конфіг порожній.'];
    if (isGame(cfg)) return hooks.game.validate(cfg);
    if (!cfg.stats || !Object.keys(cfg.stats).length) out.push('Немає жодної характеристики.');
    if (!Array.isArray(cfg.rarities) || !cfg.rarities.length) out.push('Немає жодної рідкості.');
    else if (cfg.rarities.every(r => !(r.weight > 0))) out.push('У всіх рідкостей нульова вага: нічого не випаде.');
    if (!Array.isArray(cfg.slots) || !activeSlots(cfg).length) out.push('Немає жодного активного типу предметів.');
    for (const a of cfg.affixes || []) {
      if (!cfg.stats || !cfg.stats[a.stat]) out.push(`Афікс «${a.id}» посилається на невідому характеристику «${a.stat}».`);
      if (a.min > a.max) out.push(`Афікс «${a.id}»: мінімум більший за максимум.`);
    }
    for (const r of cfg.rarities || []) if (r.min > r.max) out.push(`Рідкість «${r.name}»: мінімум афіксів більший за максимум.`);
    for (const s of cfg.slots || []) for (const k of Object.keys(s.base || {})) if (!cfg.stats || !cfg.stats[k]) out.push(`Тип «${s.name}»: база посилається на невідому характеристику «${k}».`);
    for (const u of cfg.uniques || []) {
      if (!(cfg.slots || []).some(s => s.id === u.slot)) out.push(`Унікальний «${u.name}»: невідомий тип «${u.slot}».`);
      if (u.set && !(cfg.sets || []).some(x => x.id === u.set)) out.push(`Унікальний «${u.name}»: невідомий комплект «${u.set}».`);
    }
    return out;
  }

  const num = (v, d, lo = -Infinity, hi = Infinity) => { v = Number(v); return Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d; };
  const str = (v, d) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, 60) : d);

  // Приймає або обгортку {format, config}, або «голий» конфіг; повертає очищений клон або кидає Error.
  function sanitize(raw) {
    const src = raw && raw.config ? raw.config : raw;
    if (!src || typeof src !== 'object') throw new Error('Це не схоже на конфіг Loot Forge.');
    const cfg = { version: 1, name: str(src.name, 'Без назви'), levelScale: num(src.levelScale, .08, 0, 2), stats: {}, rarities: [], slots: [], affixes: [], uniqueChance: num(src.uniqueChance, 0, 0, 100), uniques: [], sets: [] };
    for (const [id, s] of Object.entries(src.stats || {})) {
      if (!s || typeof s !== 'object') continue;
      const o = { name: str(s.name, id), w: num(s.w, 1, 0, 1000) };
      if (s.pct) o.pct = true;
      cfg.stats[String(id).slice(0, 24)] = o;
    }
    (src.rarities || []).forEach((r, i) => cfg.rarities.push({
      id: str(r.id, 'r' + i), name: str(r.name, 'Рідкість ' + (i + 1)), color: /^#[0-9a-f]{3,8}$/i.test(r.color || '') ? r.color : '#a39e93',
      weight: num(r.weight, 1, 0, 1e6), min: Math.round(num(r.min, 0, 0, 12)), max: Math.round(num(r.max, 0, 0, 12)), mult: num(r.mult, 1, 0, 100),
    }));
    (src.slots || []).forEach((s, i) => {
      const base = {};
      for (const [k, v] of Object.entries(s.base || {})) if (Array.isArray(v) && v.length === 2) base[k] = [num(v[0], 0), num(v[1], 0)];
      cfg.slots.push({ id: str(s.id, 's' + i), name: str(s.name, 'Тип ' + (i + 1)), tags: (Array.isArray(s.tags) ? s.tags : []).map(String), base, on: s.on !== false, ...(s.weight != null ? { weight: num(s.weight, 1, 0, 1000) } : {}) });
    });
    (src.affixes || []).forEach((a, i) => cfg.affixes.push({
      id: str(a.id, 'a' + i), stat: String(a.stat || ''), min: num(a.min, 0), max: num(a.max, 0),
      tags: (Array.isArray(a.tags) && a.tags.length ? a.tags : ['any']).map(String), lvl: Math.round(num(a.lvl, 1, 1, 999)), on: a.on !== false,
    }));
    const statsOnly = o => { const r = {}; for (const [k, v] of Object.entries(o || {})) if (cfg.stats[k]) r[k] = num(v, 0); return r; };
    (src.sets || []).forEach((x, i) => cfg.sets.push({ id: str(x.id, 'set' + i), name: str(x.name, 'Комплект ' + (i + 1)),
      bonuses: (Array.isArray(x.bonuses) ? x.bonuses : []).map(b => ({ n: Math.round(num(b.n, 2, 1, 12)), stats: statsOnly(b.stats) })) }));
    (src.uniques || []).forEach((u, i) => cfg.uniques.push({ id: str(u.id, 'u' + i), name: str(u.name, 'Унікальний ' + (i + 1)), slot: String(u.slot || ''),
      ...(u.rarity ? { rarity: String(u.rarity) } : {}), ...(u.set ? { set: String(u.set) } : {}), lvl: Math.round(num(u.lvl, 1, 1, 999)), weight: num(u.weight, 1, 0, 1000),
      fixed: statsOnly(u.fixed), flavor: typeof u.flavor === 'string' ? u.flavor.slice(0, 140) : '' }));
    // Шар GodsDontDie необов'язковий: старі конфіги без `game` працюють як раніше.
    if (src.game && typeof src.game === 'object') cfg.game = hooks.game ? hooks.game.sanitize(src.game) : JSON.parse(JSON.stringify(src.game));
    const problems = validate(cfg);
    if (problems.length) throw new Error(problems[0]);
    return cfg;
  }

  function exportJSON(cfg, samples) {
    const out = { format: 'zbyrai.loot-forge', version: 1, config: cfg };
    if (samples && samples.length) out.samples = samples;
    return JSON.stringify(out, null, 2);
  }

  /* ---------- «база» у вигляді тексту: dmg:8-14, hp:10-20 ---------- */
  function baseToText(base) {
    return Object.entries(base || {}).map(([k, [lo, hi]]) => `${k}:${lo}-${hi}`).join(', ');
  }
  function textToBase(text, stats) {
    const base = {};
    for (const part of String(text || '').split(',')) {
      const m = part.trim().match(/^([\w]+)\s*:\s*(-?[\d.]+)\s*-\s*(-?[\d.]+)$/);
      if (m && stats[m[1]]) base[m[1]] = [Number(m[2]), Number(m[3])];
    }
    return base;
  }

  return {
    rngFromSeed, randomSeed, PRESETS, PRESET_NAMES, NAMES, makeText, pickWeighted, randInt, registerGame, isGame, rarityProbs, allowedAffixes, activeSlots, itemScale, fmtVal,
    rollItem, rollMany, setBonuses, simulate, expectedTries, triesForChance, formatMinutes, validate, sanitize, exportJSON, baseToText, textToBase,
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = LootCore;
  require('./gdd-core.js'); // реєструє шар GodsDontDie (у браузері його підключає index.html)
}
