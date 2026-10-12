/* Loot Forge: шар GodsDontDie. Система предметів гри GodsDontDie поверх ядра (loot-core.js).
   Без DOM: працює і в браузері (глобал GddCore), і в Node (module.exports), тож його можна тестувати.

   Усе живе в необов'язковому блоці конфігу `game` (формат zbyrai.loot-forge, version 1, старі файли без нього працюють як раніше):
     enabled   чи генерувати предмети за правилами гри
     params    числа формул: Stat(рівень), зірки, точіння, міцність, ціни, шанси вставок
     slots     слоти (Head, MainHand, TwoHand…)
     classes   класи предметів: гнізда, основна стата, пул бонусів точіння, вид вставок, міцність
     bases     базові типи: слот, клас, множник типу
     qualities якості (12 звичайних + унікальні варіанти): множник, бонуси, унікальні ефекти, вага, ріст з рівнем
     effects   бібліотека ефектів: група, вид (flat/percent/flag), діапазон, сила, де використовується (use), класи
     gems, runes, cards, runewords, cardSets   вставки
     sets, randomSets, named                   комплекти, випадкові комплекти, іменовані предмети
   Коди (quality.red, base.sword, pct.damage…) ті самі, що в грі, тож конфіг легко зіставити з db/*.yml і Items/*.cs.
   Дані витягує loot-forge/sync/extract-gdd.py у gdd-data.js. Формули повторюють Items/*.cs гри; генератор випадкових
   чисел власний (JS), тож однаковий seed у грі й тут дає однакові правила, а не побітово однакові предмети. */
const GddCore = (() => {
  const L = typeof LootCore !== 'undefined' ? LootCore : require('./loot-core.js');
  const DATA = typeof GDD_DATA !== 'undefined' ? GDD_DATA : require('./gdd-data.js');

  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const randInt = (rng, lo, hi) => lo + Math.floor(rng() * (hi - lo + 1));
  const round1 = v => Math.round(v * 10) / 10;
  const clone = o => JSON.parse(JSON.stringify(o));
  const USES = ['bonus', 'unique', 'theme', 'enhance', 'set', 'insert', 'named'];
  const WEAPON_CLASSES = ['class.one_hand', 'class.two_hand', 'class.extra'];

  /* ---------- параметри й пресет ---------- */
  function defaultParams() {
    return {
      statBase: 10, levelGrowth: 1.05, equipSlack: 5,
      starStep: 0.05, maxHalfStars: 30, socketStars: [10, 20, 30], essenceGrowth: 1.25,
      starDrop: { base: 0.35, perLevel: 0.0025, levelCap: 0.25, elite: 0.1, boss: 0.2, cap: 0.85, max: 6 },
      enhance: { stat: 1.06, affix: 0.02, chance: 0.95, decay: 0.92, minChance: 0.01, dustMax: 10, dustStep: 0.01, blessing: 0.15, dropFrom: 10, stonesPer: 10, keep: 0.8 },
      rarity: { elite: 0.1, boss: 0.3, luck: 0.002 },
      durability: { weapon: 0.12, armor: 0.3, death: 0.05, low: 0.2, repair: 0.004, repairRank: 0.5 },
      value: { base: 3, plus: 0.1, bag: 4 },
      inserts: { cardMob: 0.01, cardElite: 0.05, cardBoss: 0.15, rune: 0.22, runeMin: 4, runeLevelDiv: 4, runeBoss: 6, gemLevelDiv: 20, gemBossTier: 2, gemEliteTier: 1, gemUpChance: 0.1, mergeCount: 3, tierGrowth: 1.5 },
      mainStatNames: { damage: 'Шкода', armor: 'Броня' },
    };
  }
  const SECTIONS = ['slots', 'classes', 'bases', 'qualities', 'effects', 'gems', 'gemTiers', 'gemTierNames', 'gemStrength', 'runes', 'runeWeak', 'runeStrength',
    'runewords', 'cards', 'cardSets', 'sets', 'randomSets', 'named'];

  function defaultGame() {
    const g = { enabled: true, meta: clone(DATA.meta), params: defaultParams() };
    for (const k of SECTIONS) g[k] = clone(DATA[k]);
    return g;
  }
  function preset() {
    const cfg = L.PRESETS.fantasy();
    cfg.name = 'GodsDontDie';
    cfg.game = defaultGame();
    return cfg;
  }
  // Увімкнути/вимкнути шар на будь-якому наборі правил (дані гри додаються, якщо їх ще нема).
  function ensureGame(cfg, enabled) {
    if (!cfg.game) cfg.game = defaultGame();
    cfg.game.enabled = !!enabled;
    return cfg;
  }
  const isOn = cfg => !!(cfg && cfg.game && cfg.game.enabled);

  /* ---------- індекси (кеш на об'єкт game; після правок викликай touch) ---------- */
  const caches = new WeakMap();
  const touch = g => { if (g) caches.delete(g); };
  function idx(g) {
    let c = caches.get(g);
    if (c) return c;
    c = { eff: new Map(), base: new Map(), cls: new Map(), qual: new Map(), slot: new Map(), set: new Map(), ins: new Map(), rw: [], pools: new Map(), gear: null };
    for (const e of g.effects) c.eff.set(e.id, e);
    for (const b of g.bases) c.base.set(b.id, b);
    for (const k of g.classes) c.cls.set(k.id, k);
    for (const q of g.qualities) c.qual.set(q.id, q);
    for (const s of g.slots) c.slot.set(s.id, s);
    for (const s of g.sets) c.set.set(s.id, s);
    buildInserts(g, c);
    c.gear = g.bases.filter(b => b.on !== false && b.slot !== 'Bag' && b.slot !== 'None');
    c.rw = g.runewords.filter(r => r.on !== false);
    caches.set(g, c);
    return c;
  }

  /* ---------- формули рівня ---------- */
  const scale = (g, level) => Math.pow(g.params.levelGrowth, Math.max(1, level) - 1);
  const stat = (g, level) => g.params.statBase * scale(g, level);
  const canEquip = (g, itemLevel, charLevel) => itemLevel <= charLevel + g.params.equipSlack;

  /* ---------- ефекти ---------- */
  function effValue(g, e, roll, level) {
    if (!e || e.kind === 'flag') return 1;
    const v = e.min + (e.max - e.min) * clamp(roll, 0, 1);
    return e.kind === 'flat' ? v * scale(g, level) : v;
  }
  // Сила = частка від одиниці сили рівня (Stat(рівень)); ефект з максимальним кидком дає Power.
  function effPower(g, e, roll, level) {
    if (!e) return 0;
    const frac = e.kind === 'flag' || e.max <= 0 ? 1 : (e.min + (e.max - e.min) * clamp(roll, 0, 1)) / e.max;
    return e.power * frac * stat(g, level);
  }
  const fmtV = (e, v) => (e.kind === 'percent' ? String(round1(v)) : String(Math.round(v)));
  function effText(e, v, id) {
    if (!e) return id || '?';
    return e.kind === 'flag' ? e.name : e.name.replace('{0}', fmtV(e, v));
  }
  function poolFor(g, use, clsId) {
    const c = idx(g), key = use + '|' + clsId;
    let p = c.pools.get(key);
    if (!p) {
      p = g.effects.filter(e => e.on !== false && e.use.includes(use) && (!e.classes || e.classes.includes(clsId)));
      c.pools.set(key, p);
    }
    return p;
  }
  function pickDistinct(rng, pool, count, exclude) {
    const left = pool.filter(e => !exclude || !exclude.has(e.id));
    const out = [];
    while (out.length < count && left.length) {
      let sum = 0;
      for (const e of left) sum += Math.max(0, e.weight == null ? 1 : e.weight);
      if (sum <= 0) break;
      let r = rng() * sum, i = 0;
      for (; i < left.length; i++) { r -= Math.max(0, left[i].weight == null ? 1 : left[i].weight); if (r < 0) break; }
      if (i >= left.length) i = left.length - 1;
      out.push(left[i]);
      left.splice(i, 1);
    }
    return out;
  }

  /* ---------- якості ---------- */
  function sourceFrom(opts = {}) {
    const k = opts.source || 'mob';
    return {
      level: Math.max(1, (opts.ilvl | 0) || 1), elite: k === 'elite', boss: k === 'boss', mighty: k === 'boss' || k === 'mighty',
      luck: Number(opts.luck) || 0, setCode: opts.setCode || null, setChance: opts.setChance == null ? 0 : Number(opts.setChance) / 100,
    };
  }
  const rarityBonus = (g, src) => (src.boss ? g.params.rarity.boss : src.elite ? g.params.rarity.elite : 0) + Math.max(0, src.luck) * g.params.rarity.luck;
  function qualityWeight(q, level, mighty, rb) {
    if (q.on === false || level < q.minLvl || (q.mighty && !mighty)) return 0;
    return Math.max(0, q.weight) * Math.pow(1 + Math.max(0, level) / 50, q.growth) * Math.pow(1 + rb, q.rank);
  }
  function qualityProbs(cfg, opts = {}) {
    const g = cfg.game, src = sourceFrom(opts), rb = rarityBonus(g, src);
    const w = g.qualities.map(q => qualityWeight(q, src.level, src.mighty, rb));
    const total = w.reduce((s, v) => s + v, 0);
    return w.map(v => (total > 0 ? v / total : 0));
  }
  function rollQuality(g, rng, src) {
    const rb = rarityBonus(g, src);
    const w = g.qualities.map(q => qualityWeight(q, src.level, src.mighty, rb));
    const total = w.reduce((s, v) => s + v, 0);
    if (total <= 0) return idx(g).qual.get('quality.white') || g.qualities[0];
    let r = rng() * total;
    for (let i = 0; i < w.length; i++) { r -= w[i]; if (r < 0) return g.qualities[i]; }
    return g.qualities[g.qualities.length - 1];
  }

  /* ---------- зірки, гнізда ---------- */
  function rollStars(g, rng, src) {
    const d = g.params.starDrop;
    let p = d.base + Math.min(d.levelCap, Math.max(0, src.level) * d.perLevel) + (src.boss ? d.boss : src.elite ? d.elite : 0);
    p = Math.min(p, d.cap);
    let half = 1;
    while (half < d.max && rng() < p) half++;
    return half;
  }
  const essenceCost = (g, half) => Math.ceil(Math.pow(g.params.essenceGrowth, Math.max(0, half - 1)));
  const starSockets = (g, half) => g.params.socketStars.filter(m => half >= m).length;

  /* ---------- вставки: каталог ---------- */
  function buildInserts(g, c) {
    const tg = g.params.inserts.tierGrowth;
    const add = card => { card.tierMult = Math.pow(tg, card.tier || 0); c.ins.set(card.code, card); };
    for (const gem of g.gems) {
      if (gem.on === false) continue;
      g.gemTiers.forEach((t, i) => add({
        code: `gem.${gem.id}.${t}`, kind: 'gem', name: `${gem.name} (${g.gemTierNames[i] || t})`, short: gem.name, tier: i, color: gem.color, slots: null,
        merge: i + 1 < g.gemTiers.length ? `gem.${gem.id}.${g.gemTiers[i + 1]}` : null,
        by: ['weapon', 'armor', 'jewelry'].reduce((o, k) => { o[k] = [{ effect: gem[k], strength: g.gemStrength }]; return o; }, {}),
      }));
    }
    g.runes.forEach((r, i) => {
      if (r.on === false) return;
      add({ code: 'rune.' + r.id, kind: 'rune', name: r.name, short: r.name, tier: 0, rank: i + 1, color: '#9fb4c8', slots: null, merge: null,
        by: { any: [{ effect: g.runeWeak[i % g.runeWeak.length], strength: g.runeStrength[0] + g.runeStrength[1] * i }] } });
    });
    for (const cd of g.cards) {
      if (cd.on === false) continue;
      add({ code: cd.id, kind: 'card', name: cd.name, short: cd.name, tier: 0, color: '#e8d6a8', slots: cd.slots, merge: null,
        by: { any: cd.effects.map(([effect, strength]) => ({ effect, strength })) } });
    }
  }
  const insertCard = (g, code) => (code ? idx(g).ins.get(code) : null);
  function insertEffects(card, cls) {
    return card.by[cls.insertKind] || card.by.any || [];
  }
  function insertFits(g, card, item) {
    const cls = idx(g).cls.get(item.cls);
    return !!(cls && cls.hasStats && (!card.slots || card.slots.includes(item.gslot)));
  }
  function insertValue(g, card, item, ie) {
    return effValue(g, idx(g).eff.get(ie.effect), 1, item.level) * ie.strength * card.tierMult;
  }
  function insertPowerIn(g, card, item) {
    const cls = idx(g).cls.get(item.cls);
    let p = 0;
    for (const ie of insertEffects(card, cls)) p += effPower(g, idx(g).eff.get(ie.effect), 1, item.level) * ie.strength * card.tierMult;
    return p;
  }
  // Рунне слово: руни в точному порядку, предмет потрібного виду з точною кількістю гнізд.
  function activeRuneword(g, item) {
    const cls = idx(g).cls.get(item.cls);
    for (const rw of idx(g).rw) {
      if (item.sockets !== rw.runes.length || item.inserts.length !== rw.runes.length) continue;
      if (!rw.kinds.includes(cls.insertKind) && !rw.kinds.includes(cls.id)) continue;
      if (rw.runes.every((r, i) => item.inserts[i] === 'rune.' + r)) return rw;
    }
    return null;
  }
  function insertsPower(g, item) {
    const rw = activeRuneword(g, item);
    let p = 0;
    for (const code of item.inserts) {
      const card = insertCard(g, code);
      if (!card || (rw && card.kind === 'rune')) continue;
      p += insertPowerIn(g, card, item);
    }
    if (rw) p += effPower(g, idx(g).eff.get(rw.effect), 1, item.level) * rw.strength;
    return p;
  }
  function cardSetPower(g, items) {
    const have = new Set();
    let lvl = 0, n = 0;
    for (const it of items) { if (!it) continue; for (const c of it.inserts) if (c) have.add(c); lvl += it.level; n++; }
    if (!n) return 0;
    let p = 0;
    for (const s of g.cardSets) if (s.on !== false && s.cards.every(c => have.has(c))) for (const [e, st] of s.effects) p += effPower(g, idx(g).eff.get(e), 1, Math.round(lvl / n)) * st;
    return p;
  }
  const activeCardSets = (g, items) => {
    const have = new Set();
    for (const it of items) if (it) for (const c of it.inserts) if (c) have.add(c);
    return g.cardSets.filter(s => s.on !== false && s.cards.every(c => have.has(c)));
  };
  function insert(g, item, slotIndex, code) {
    const card = insertCard(g, code);
    if (!card || slotIndex < 0 || slotIndex >= item.inserts.length || item.inserts[slotIndex]) return false;
    if (!insertFits(g, card, item)) return false;
    item.inserts[slotIndex] = code;
    return true;
  }
  function removeInsert(item, slotIndex, withScroll) {
    const code = item.inserts[slotIndex];
    if (!code) return null;
    item.inserts[slotIndex] = null;
    return withScroll ? code : null;
  }
  const mergeInto = (g, code, count) => (count >= g.params.inserts.mergeCount ? (insertCard(g, code) || {}).merge || null : null);
  // Випадкова вставка для дропу: самоцвіти частіше, руни рідше, картки рідко (у босів частіше).
  function rollInsert(g, rng, level, elite, boss) {
    const p = g.params.inserts, c = idx(g);
    const card = boss ? p.cardBoss : elite ? p.cardElite : p.cardMob;
    const r = rng();
    const cards = g.cards.filter(x => x.on !== false);
    if (r < card && cards.length) return cards[randInt(rng, 0, cards.length - 1)].id;
    const runes = g.runes.filter(x => x.on !== false);
    if (r < card + p.rune && runes.length) {
      const max = clamp(p.runeMin + Math.floor(level / p.runeLevelDiv) + (boss ? p.runeBoss : 0), p.runeMin, g.runes.length);
      return 'rune.' + g.runes[randInt(rng, 0, max - 1)].id;
    }
    const gems = g.gems.filter(x => x.on !== false);
    const tier = clamp(Math.floor(level / p.gemLevelDiv) + (boss ? p.gemBossTier : elite ? p.gemEliteTier : 0) + (rng() < p.gemUpChance ? 1 : 0), 0, g.gemTiers.length - 1);
    return `gem.${gems[randInt(rng, 0, gems.length - 1)].id}.${g.gemTiers[tier]}`;
  }

  /* ---------- комплекти ---------- */
  function randomSet(g, code) {
    const m = /^rset\.(\d+)$/.exec(code || '');
    const R = g.randomSets;
    if (!m || !R || !R.themes.length) return null;
    const c = idx(g);
    if (!c.rset) c.rset = new Map();
    if (c.rset.has(code)) return c.rset.get(code);
    const rng = L.rngFromSeed(code);
    const theme = R.themes[randInt(rng, 0, R.themes.length - 1)];
    const parts = R.parts[randInt(rng, 0, R.parts.length - 1)];
    const pool = R.slotPool.slice(), slots = [];
    while (slots.length < parts && pool.length) {
      const s = pool.splice(randInt(rng, 0, pool.length - 1), 1)[0];
      if ((s === 'TwoHand' && slots.includes('MainHand')) || (s === 'MainHand' && slots.includes('TwoHand'))) continue;
      slots.push(s);
    }
    const used = new Set();
    const pick = flag => {
      const any = [], themed = [];
      for (const e of g.effects) {
        if (e.on === false || !e.use.includes('set') || used.has(e.id) || e.group === 'set_special' || e.group === 'set') continue;
        if ((e.kind === 'flag') !== flag) continue;
        any.push(e.id);
        if (e.tags.some(t => theme.tags.includes(t))) themed.push(e.id);
      }
      const list = themed.length ? themed : any;
      const id = list.length ? list[randInt(rng, 0, list.length - 1)] : 'stat.hp';
      used.add(id);
      return id;
    };
    const bonuses = [[2, pick(false)], [4, pick(true)]];
    if (parts >= 6) bonuses.push([6, rng() < 0.5 ? 'set.skill_echo' : pick(false)]);
    if (parts >= 8) bonuses.push([8, theme.special]);
    const fem = rng() < 0.4;
    const nouns = fem ? theme.nounsF : theme.nounsM;
    const adj = theme.adj[randInt(rng, 0, theme.adj.length - 1)];
    const noun = nouns[randInt(rng, 0, nouns.length - 1)];
    const name = R.format.replace('{0}', (R.adjectives[adj] || [adj, adj])[fem ? 1 : 0]).replace('{1}', R.nouns[noun] || noun);
    const set = { id: code, name, source: 'random', named: false, ref: '', slots, bonuses, random: true, theme: theme.id };
    c.rset.set(code, set);
    return set;
  }
  const getSet = (g, code) => (code ? idx(g).set.get(code) || randomSet(g, code) : null);
  const randomSetCode = seed => 'rset.' + (Math.abs(Math.floor(Number(seed) || 0)) >>> 0);
  function activeSetBonuses(set, count) {
    return set.bonuses.filter(b => count >= b[0]);
  }
  function setCounts(items) {
    const d = {};
    for (const it of items) if (it && it.setCode) d[it.setCode] = (d[it.setCode] || 0) + 1;
    return d;
  }
  function setPower(g, items) {
    const lv = {};
    for (const it of items) if (it && getSet(g, it.setCode)) { const o = lv[it.setCode] || (lv[it.setCode] = { sum: 0, n: 0 }); o.sum += it.level; o.n++; }
    let p = 0;
    for (const [code, o] of Object.entries(lv)) for (const b of activeSetBonuses(getSet(g, code), o.n)) p += effPower(g, idx(g).eff.get(b[1]), 1, Math.round(o.sum / o.n));
    return p;
  }

  /* ---------- точіння ---------- */
  const enhStatMult = (g, plus) => Math.pow(g.params.enhance.stat, Math.max(0, plus));
  const enhAffixMult = (g, plus) => 1 + g.params.enhance.affix * Math.max(0, plus);
  function enhanceChance(g, plus, dust = 0, blessing = false) {
    const e = g.params.enhance;
    let p = Math.max(e.minChance, e.chance * Math.pow(e.decay, Math.max(0, plus)));
    p += clamp(dust, 0, e.dustMax) * e.dustStep + (blessing ? e.blessing : 0);
    return Math.min(1, p);
  }
  const stonesNeeded = (g, plus) => 1 + Math.floor(Math.max(0, plus) / g.params.enhance.stonesPer);
  function bonusCount(plus) {
    if (plus < 5) return 0;
    if (plus < 20) return Math.floor(plus / 5);
    return 4 + Math.floor((plus - 20) / 10);
  }
  const isBonusMilestone = plus => plus === 5 || plus === 10 || plus === 15 || plus === 20 || (plus > 20 && plus % 10 === 0);
  const enhanceVisual = plus => Math.min(3, Math.floor(Math.max(0, plus) / 10));
  function setPlus(cfg, item, plus) {
    const g = cfg.game, cls = idx(g).cls.get(item.cls);
    item.plus = Math.max(0, plus);
    const need = bonusCount(item.plus), pool = cls.enhancePool.filter(id => idx(g).eff.has(id));
    while (item.enhanceBonuses.length < need && pool.length) {
      const rng = L.rngFromSeed(`${item.seed}:enh:${item.enhanceBonuses.length}`);
      item.enhanceBonuses.push({ id: pool[randInt(rng, 0, pool.length - 1)], roll: rng() });
    }
    derive(g, item);
  }
  // Одна спроба точіння; input = {stones, stoneLevel, dust, blessing, protection} змінюється (матеріали витрачаються).
  function enhanceAttempt(cfg, item, rng, input) {
    const g = cfg.game, need = stonesNeeded(g, item.plus);
    if (input.stoneLevel < item.level) return 'stone_too_low';
    if (input.stones < need) return 'not_enough_stones';
    const p = enhanceChance(g, item.plus, input.dust, input.blessing);
    input.stones -= need;
    input.dust = Math.max(0, input.dust - g.params.enhance.dustMax);
    input.blessing = false;
    if (rng() < p) { setPlus(cfg, item, item.plus + 1); return 'success'; }
    if (item.plus < g.params.enhance.dropFrom) return 'fail_keep';
    if (input.protection) { input.protection = false; return 'fail_protected'; }
    setPlus(cfg, item, item.plus - 1);
    return 'fail_drop';
  }
  function transferPlus(cfg, from, to) {
    if (!from || !to || from === to || from.gslot !== to.gslot) return false;
    setPlus(cfg, to, Math.max(to.plus, Math.floor(from.plus * cfg.game.params.enhance.keep)));
    return true;
  }
  function addHalfStar(cfg, item) {
    const g = cfg.game;
    if (item.halfStars >= g.params.maxHalfStars) return 0;
    const cost = essenceCost(g, item.halfStars);
    item.halfStars++;
    derive(g, item);
    return cost;
  }
  function addSocket(cfg, item) {
    const g = cfg.game, cls = idx(g).cls.get(item.cls);
    if (item.sockets >= cls.maxSockets) return false;
    item.baseSockets++;
    derive(g, item);
    return true;
  }

  /* ---------- міцність, ціна ---------- */
  const maxDurability = (g, item) => idx(g).cls.get(item.cls).maxDurability;
  function repairCost(g, item) {
    const max = maxDurability(g, item), q = idx(g).qual.get(item.quality);
    return max > 0 ? Math.min(item.wear, max) * g.params.durability.repair * scale(g, item.level) * (1 + g.params.durability.repairRank * (q ? q.rank : 0)) : 0;
  }
  function sellPrice(g, item) {
    const base = idx(g).base.get(item.baseCode), q = idx(g).qual.get(item.quality), v = g.params.value;
    if (!base) return 0;
    if (base.slot === 'Bag') return Math.max(1, v.bag * Math.max(1, base.bagSlots || 1));
    const rank = q ? q.rank : 0;
    return Math.max(1, Math.round(v.base * (1 + rank) * (1 + rank) * scale(g, item.level) * (1 + v.plus * item.plus)));
  }
  function wearItem(g, item, points) {
    const max = maxDurability(g, item);
    if (max <= 0) return false;
    item.wear = Math.min(max, item.wear + Math.max(0, points));
    derive(g, item);
    return item.broken;
  }

  /* ---------- похідні поля предмета ---------- */
  // Стан предмета (зберігається): baseCode, level, quality, bonuses, uniques, halfStars, baseSockets, inserts, plus, enhanceBonuses,
  // setCode, wear, named, seed. Усе інше рахується тут.
  function derive(g, it) {
    const c = idx(g);
    const base = c.base.get(it.baseCode), cls = c.cls.get(base.cls), q = c.qual.get(it.quality) || g.qualities[0];
    it.cls = cls.id;
    it.gslot = base.slot;
    it.ilvl = it.level;
    it.stars = it.halfStars / 2;
    it.sockets = Math.min(cls.maxSockets, it.baseSockets + starSockets(g, it.halfStars));
    while (it.inserts.length < it.sockets) it.inserts.push(null);
    while (it.inserts.length > it.sockets) it.inserts.pop();
    const baseStat = cls.hasStats ? stat(g, it.level) * base.mult * q.mult : 0;
    const main = baseStat * (1 + g.params.starStep * it.halfStars) * enhStatMult(g, it.plus);
    it.mainStatKey = cls.hasStats ? cls.mainStat : null;
    it.base = cls.hasStats ? { [cls.mainStat]: Math.round(main) } : {};
    it.mainStat = main;
    const am = enhAffixMult(g, it.plus);
    it.affixes = it.bonuses.map(b => {
      const e = c.eff.get(b.id);
      return { id: b.id, stat: b.id, roll: b.roll, value: e ? (e.kind === 'flag' ? 1 : round1(effValue(g, e, b.roll, it.level) * am * 100) / 100) : 0 };
    });
    const active = Math.min(bonusCount(it.plus), it.enhanceBonuses.length);
    let itemPower = cls.hasStats ? main : 0;
    if (cls.hasStats) {
      for (const b of it.bonuses) itemPower += effPower(g, c.eff.get(b.id), b.roll, it.level) * am;
      for (const u of it.uniques) itemPower += effPower(g, c.eff.get(u), 1, it.level);
      for (let i = 0; i < active; i++) itemPower += effPower(g, c.eff.get(it.enhanceBonuses[i].id), it.enhanceBonuses[i].roll, it.level) * am;
    }
    const insPower = cls.hasStats ? insertsPower(g, it) : 0;
    it.durMax = cls.maxDurability;
    it.durability = Math.max(0, cls.maxDurability - it.wear);
    it.broken = cls.maxDurability > 0 && it.durability <= 0;
    it.powerParts = { item: Math.round(itemPower * 10) / 10, inserts: Math.round(insPower * 10) / 10 };
    it.power = Math.round((itemPower + insPower) * 10) / 10;
    const set = getSet(g, it.setCode);
    it.setName = set ? set.name : undefined;
    it.set = set ? set.id : undefined;
    const rw = cls.hasStats ? activeRuneword(g, it) : null;
    it.runeword = rw ? rw.id : undefined;
    return it;
  }

  /* ---------- генерація ---------- */
  function rollSet(g, rng, src, forced) {
    if (!src.setCode || !(rng() < src.setChance)) return null;
    const set = getSet(g, src.setCode);
    if (!set || (forced && !set.slots.includes(forced.slot))) return null;
    return set;
  }
  function pickBase(g, rng, set) {
    const gear = idx(g).gear;
    if (set) {
      const slot = set.slots[randInt(rng, 0, set.slots.length - 1)];
      const list = gear.filter(b => b.slot === slot);
      if (list.length) return list[randInt(rng, 0, list.length - 1)];
    }
    return gear[randInt(rng, 0, gear.length - 1)];
  }
  function rollAffixes(g, rng, item) {
    const cls = idx(g).cls.get(item.cls), q = idx(g).qual.get(item.quality);
    item.bonuses = []; item.uniques = [];
    if (!cls.hasStats) return;
    for (const e of pickDistinct(rng, poolFor(g, 'bonus', cls.id), q.bonus)) item.bonuses.push({ id: e.id, roll: rng() });
    const plain = q.unique - (q.theme ? 1 : 0);
    if (q.theme) item.uniques.push(q.theme);
    for (const e of pickDistinct(rng, poolFor(g, 'unique', cls.id), Math.max(0, plain))) item.uniques.push(e.id);
  }
  function blank(base, level, quality, seed) {
    return { game: true, baseCode: base.id, level, quality, seed, halfStars: 1, baseSockets: 0, inserts: [], plus: 0, enhanceBonuses: [], bonuses: [], uniques: [], wear: 0, setCode: null };
  }
  function nameFor(g, it, base, q, humor, rng) {
    const rankIdx = q.rank >= 6 ? 2 : q.rank >= 3 ? 1 : 0;
    const t = L.makeText(base.name, rankIdx, humor | 0, rng);
    return t;
  }
  function rollItem(cfg, rng, opts = {}) {
    const g = cfg.game, c = idx(g), src = sourceFrom(opts);
    if (opts.named && c.named === undefined) c.named = null;
    if (opts.named) return rollNamed(cfg, rng, opts.named, src.level, opts);
    let forced = null;
    if (opts.slot) forced = c.base.get(opts.slot) || null;
    const slotFilter = opts.slot && !forced ? opts.slot : null;
    const set = rollSet(g, rng, src, forced || (slotFilter ? { slot: slotFilter } : null));
    let base = forced;
    if (!base) {
      if (slotFilter) {
        const list = c.gear.filter(b => b.slot === slotFilter);
        base = list.length ? list[randInt(rng, 0, list.length - 1)] : pickBase(g, rng, set);
      } else base = pickBase(g, rng, set);
    }
    const q = opts.rarity && c.qual.get(opts.rarity) ? c.qual.get(opts.rarity) : rollQuality(g, rng, src);
    const it = blank(base, src.level, q.id, Math.floor(rng() * 2147483647));
    it.setCode = set ? set.id : null;
    it.cls = base.cls;
    rollAffixes(g, rng, it);
    it.halfStars = rollStars(g, rng, src);
    const cls = c.cls.get(base.cls);
    it.baseSockets = cls.genSockets[1] <= 0 ? 0 : randInt(rng, cls.genSockets[0], cls.genSockets[1]);
    derive(g, it);
    if (!opts.lean) {
      const t = nameFor(g, it, base, q, opts.humor, rng);
      it.name = t.name; it.flavor = t.flavor;
      it.slotName = (c.slot.get(base.slot) || { name: base.slot }).name;
      it.baseName = base.name;
      it.rarity = q.id; it.rarityName = q.name; it.color = q.color; it.slot = base.slot;
    } else { it.rarity = q.id; it.slot = base.slot; }
    return it;
  }
  function rollNamed(cfg, rng, namedId, level, opts = {}) {
    const g = cfg.game, c = idx(g), n = g.named.find(x => x.id === namedId);
    if (!n) throw new Error('Невідомий іменований предмет: ' + namedId);
    const base = c.base.get(n.base) || c.gear[0], q = c.qual.get(n.quality) || g.qualities[0];
    const it = blank(base, Math.max(1, level | 0 || 1), q.id, Math.floor(rng() * 2147483647));
    it.cls = base.cls;
    it.named = n.id;
    const cls = c.cls.get(base.cls);
    if (cls.hasStats) {
      const taken = new Set();
      for (const [e, roll] of n.bonuses) { it.bonuses.push({ id: e, roll }); taken.add(e); }
      for (const e of pickDistinct(rng, poolFor(g, 'bonus', cls.id), q.bonus - it.bonuses.length, taken)) it.bonuses.push({ id: e.id, roll: rng() });
      it.uniques.push(...n.uniques);
      const have = new Set(n.uniques);
      for (const e of pickDistinct(rng, poolFor(g, 'unique', cls.id), q.unique - it.uniques.length, have)) it.uniques.push(e.id);
    }
    it.halfStars = rollStars(g, rng, { level: it.level, boss: true, elite: false });
    it.baseSockets = cls.genSockets[1] <= 0 ? 0 : randInt(rng, cls.genSockets[0], cls.genSockets[1]);
    derive(g, it);
    it.name = n.name; it.flavor = n.desc || ''; it.named = n.id;
    it.slotName = (c.slot.get(base.slot) || { name: base.slot }).name; it.baseName = base.name;
    it.rarity = q.id; it.rarityName = q.name; it.color = q.color; it.slot = base.slot;
    return it;
  }

  /* ---------- опис предмета для інтерфейсу ---------- */
  function describe(cfg, it) {
    const g = cfg.game, c = idx(g), am = enhAffixMult(g, it.plus), cls = c.cls.get(it.cls);
    const line = (id, roll, mult) => { const e = c.eff.get(id); return { id, text: effText(e, effValue(g, e, roll, it.level) * mult, id), flag: !e || e.kind === 'flag', group: e ? e.group : '' }; };
    const q = c.qual.get(it.quality);
    const active = Math.min(bonusCount(it.plus), it.enhanceBonuses.length);
    const rw = it.runeword ? g.runewords.find(r => r.id === it.runeword) : null;
    const set = getSet(g, it.setCode);
    return {
      main: cls.hasStats ? `${g.params.mainStatNames[cls.mainStat] || cls.mainStat}: ${Math.round(it.mainStat)}` : '',
      bonuses: it.bonuses.map(b => line(b.id, b.roll, am)),
      uniques: it.uniques.map(u => line(u, 1, 1)),
      enhance: it.enhanceBonuses.slice(0, active).map(b => line(b.id, b.roll, am)),
      nextEnhanceBonus: isBonusMilestone(it.plus + 1),
      inserts: it.inserts.map(code => {
        const card = insertCard(g, code);
        if (!card) return { code: null, name: 'порожнє гніздо', lines: [], color: '' };
        const lines = insertEffects(card, cls).map(ie => {
          const e = c.eff.get(ie.effect);
          return effText(e, insertValue(g, card, it, ie), ie.effect);
        });
        return { code, name: card.name, kind: card.kind, color: card.color, lines, muted: !!(rw && card.kind === 'rune') };
      }),
      runeword: rw ? { name: rw.name, text: effText(c.eff.get(rw.effect), 1, rw.effect) } : null,
      set: set ? { name: set.name, ref: set.ref || '', parts: set.slots.length, slots: set.slots.map(s => (c.slot.get(s) || { name: s }).name),
        bonuses: set.bonuses.map(b => ({ n: b[0], text: effText(c.eff.get(b[1]), effValue(g, c.eff.get(b[1]), 1, it.level), b[1]) })) } : null,
      qualityLine: q ? `${q.name}${q.theme ? ' (унікальний варіант)' : ''}` : '',
      starText: `${it.stars}★`,
      durability: it.durMax > 0 ? `${it.durability}/${it.durMax}` : '',
      repair: round1(repairCost(g, it)),
      sell: sellPrice(g, it),
      canEquipAt: Math.max(1, it.level - g.params.equipSlack),
    };
  }

  /* ---------- симуляція ---------- */
  function simulate(cfg, n, seed, opts = {}) {
    const g = cfg.game, c = idx(g), rng = L.rngFromSeed(seed);
    const o = Object.assign({}, opts, { lean: true });
    const probs = qualityProbs(cfg, o);
    const qIdx = new Map(g.qualities.map((q, i) => [q.id, i]));
    const byRarity = g.qualities.map((q, i) => ({ id: q.id, name: q.name, color: q.color, count: 0, expected: probs[i], actual: 0 }));
    const bySlot = {}, byClass = {}, stars = new Array(g.params.maxHalfStars + 1).fill(0), sockets = {}, uniqCount = {}, stats = {};
    let sets = 0, uniques = 0, runewords = 0;
    const powers = new Float64Array(n);
    const note = (id, name, pct, v) => {
      const s = stats[id] || (stats[id] = { id, name, pct, min: Infinity, max: -Infinity, sum: 0, count: 0 });
      s.min = Math.min(s.min, v); s.max = Math.max(s.max, v); s.sum += v; s.count++;
    };
    for (let i = 0; i < n; i++) {
      const it = rollItem(cfg, rng, o);
      byRarity[qIdx.get(it.quality)].count++;
      bySlot[it.slot] = (bySlot[it.slot] || 0) + 1;
      byClass[it.cls] = (byClass[it.cls] || 0) + 1;
      stars[it.halfStars]++;
      sockets[it.sockets] = (sockets[it.sockets] || 0) + 1;
      if (it.setCode) sets++;
      if (it.uniques.length) uniques++;
      if (it.runeword) runewords++;
      for (const u of it.uniques) uniqCount[u] = (uniqCount[u] || 0) + 1;
      powers[i] = it.power;
      if (it.mainStatKey) note('main.' + it.mainStatKey, g.params.mainStatNames[it.mainStatKey] || it.mainStatKey, false, it.mainStat);
      for (const a of it.affixes) {
        const e = c.eff.get(a.id);
        if (e && e.kind !== 'flag') note(a.id, e.name.replace('{0}', '').replace(/^[+−-]\s*/, '').trim() || a.id, e.kind === 'percent', a.value);
      }
    }
    for (const r of byRarity) r.actual = n ? r.count / n : 0;
    const sorted = Float64Array.from(powers).sort();
    const q = p => (n ? sorted[Math.min(n - 1, Math.floor(p * n))] : 0);
    const mean = n ? powers.reduce((s, v) => s + v, 0) / n : 0, lo = n ? sorted[0] : 0, hi = n ? sorted[n - 1] : 0;
    const bins = 24, hist = new Array(bins).fill(0);
    for (const v of powers) hist[hi > lo ? Math.min(bins - 1, Math.floor((v - lo) / (hi - lo) * bins)) : 0]++;
    const power = { mean, median: q(0.5), p95: q(0.95), p99: q(0.99), min: lo, max: hi, hist };
    const warnings = [];
    if (power.p99 > 0 && power.max > power.p99 * 2.5) warnings.push(`Найсильніший предмет у ${(power.max / power.p99).toFixed(1)} раза сильніший за 99-й перцентиль: це викид. Перевір множники якості, зірки й точіння.`);
    const reachable = byRarity.filter(r => r.expected > 0);
    const top = reachable[reachable.length - 1];
    if (top && n >= 1000 && top.count === 0) warnings.push(`За ${n.toLocaleString('uk-UA')} кидків жодного «${top.name}»: шанс надто малий. Спробуй джерело «Бос» і вищий рівень.`);
    const maxBonus = Math.max(0, ...g.qualities.filter(x => x.on !== false).map(x => x.bonus)), maxUniq = Math.max(0, ...g.qualities.filter(x => x.on !== false).map(x => x.unique));
    for (const k of g.classes) {
      if (!k.hasStats || !c.gear.some(b => b.cls === k.id)) continue;
      const pb = poolFor(g, 'bonus', k.id).length, pu = poolFor(g, 'unique', k.id).length;
      if (pb < maxBonus) warnings.push(`Для класу «${k.name}» доступно лише ${pb} бонусних ефектів, а найвища якість просить ${maxBonus}.`);
      if (pu < maxUniq) warnings.push(`Для класу «${k.name}» доступно лише ${pu} унікальних ефектів, а найвища якість просить ${maxUniq}.`);
    }
    const nameOf = id => (c.eff.get(id) || { name: id }).name;
    const topUniques = Object.entries(uniqCount).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([id, k]) => ({ id, name: nameOf(id), count: k, share: k / n }));
    return {
      n, uniques, game: true, byRarity, bySlot, byClass, stars, sockets, sets, runewords, topUniques,
      stats: Object.values(stats).map(o2 => ({ id: o2.id, name: o2.name, pct: o2.pct, min: o2.min, max: o2.max, avg: o2.sum / o2.count, count: o2.count })), power, warnings,
    };
  }

  /* ---------- перевірка й очищення ---------- */
  function validate(cfg) {
    const g = cfg.game, out = [];
    if (!g) return ['Немає блоку game.'];
    const eff = new Set(g.effects.map(e => e.id)), cls = new Set(g.classes.map(k => k.id)), slots = new Set(g.slots.map(s => s.id));
    const need = (what, id) => { if (!eff.has(id)) out.push(`${what}: невідомий ефект «${id}».`); };
    if (!g.bases.some(b => b.on !== false && b.slot !== 'Bag' && b.slot !== 'None')) out.push('Немає жодного типу спорядження (bases).');
    if (!g.qualities.some(q => q.on !== false && q.weight > 0)) out.push('У всіх якостей нульова вага: нічого не випаде.');
    for (const b of g.bases) { if (!cls.has(b.cls)) out.push(`Тип «${b.name}»: невідомий клас «${b.cls}».`); if (!slots.has(b.slot) && b.slot !== 'None') out.push(`Тип «${b.name}»: невідомий слот «${b.slot}».`); }
    for (const k of g.classes) for (const id of k.enhancePool) need(`Клас «${k.name}», пул точіння`, id);
    for (const s of g.sets) for (const b of s.bonuses) need(`Комплект «${s.name}»`, b[1]);
    for (const r of g.runewords) { need(`Рунне слово «${r.name}»`, r.effect); for (const x of r.runes) if (!g.runes.some(q => q.id === x)) out.push(`Рунне слово «${r.name}»: невідома руна «${x}».`); }
    for (const cd of g.cards) for (const [e] of cd.effects) need(`Картка «${cd.name}»`, e);
    for (const gm of g.gems) for (const k of ['weapon', 'armor', 'jewelry']) need(`Самоцвіт «${gm.name}»`, gm[k]);
    for (const e of g.runeWeak) need('Руни', e);
    for (const q of g.qualities) if (q.theme) need(`Якість «${q.name}»`, q.theme);
    for (const t of g.randomSets.themes) need(`Тема випадкових комплектів «${t.id}»`, t.special);
    for (const e of g.effects) if (e.min > e.max) out.push(`Ефект «${e.id}»: мінімум більший за максимум.`);
    return out.slice(0, 20);
  }

  const num = (v, d, lo = -Infinity, hi = Infinity) => { v = Number(v); return Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d; };
  const str = (v, d = '', n = 160) => (typeof v === 'string' ? v.slice(0, n) : d);
  const arr = (v, fn, max = 5000) => (Array.isArray(v) ? v.slice(0, max).map(fn).filter(x => x != null) : []);
  const strs = (v, max = 64) => arr(v, x => (typeof x === 'string' ? x.slice(0, 80) : null), max);
  const flag = o => (o && o.on === false ? { on: false } : {});
  function mergeDeep(def, src) {
    if (Array.isArray(def)) return Array.isArray(src) ? src.map((x, i) => (typeof def[i] === 'number' ? num(x, def[i]) : x)) : def.slice();
    if (def && typeof def === 'object') {
      const o = {};
      for (const k of Object.keys(def)) o[k] = mergeDeep(def[k], src && typeof src === 'object' ? src[k] : undefined);
      return o;
    }
    if (typeof def === 'number') return num(src, def);
    return typeof src === 'string' ? src.slice(0, 40) : def;
  }
  function sanitize(src) {
    if (!src || typeof src !== 'object') return null;
    const D = DATA;
    const g = { enabled: src.enabled !== false, meta: src.meta && typeof src.meta === 'object' ? { source: str(src.meta.source, '', 80), commit: str(src.meta.commit, '', 80), commitDate: str(src.meta.commitDate, '', 40), note: str(src.meta.note, '', 200) } : clone(D.meta) };
    g.params = mergeDeep(defaultParams(), src.params);
    g.slots = arr(src.slots, s => (s && s.id ? { id: str(s.id, '', 40), name: str(s.name, s.id, 60) } : null), 64);
    g.classes = arr(src.classes, k => (k && k.id ? {
      id: str(k.id, '', 60), name: str(k.name, k.id, 60), genSockets: [Math.round(num(k.genSockets && k.genSockets[0], 0, 0, 12)), Math.round(num(k.genSockets && k.genSockets[1], 0, 0, 12))],
      maxSockets: Math.round(num(k.maxSockets, 0, 0, 12)), hasStats: k.hasStats !== false, mainStat: str(k.mainStat, 'armor', 20), enhancePool: strs(k.enhancePool),
      insertKind: str(k.insertKind, 'armor', 20), maxDurability: Math.round(num(k.maxDurability, 0, 0, 1e6)), maxStack: k.maxStack === 'inf' ? 'inf' : Math.round(num(k.maxStack, 1, 1, 1e9)),
    } : null), 64);
    g.bases = arr(src.bases, b => (b && b.id ? { id: str(b.id, '', 80), name: str(b.name, b.id, 80), slot: str(b.slot, 'None', 30), cls: str(b.cls, 'class.armor', 60), mult: num(b.mult, 1, 0, 1000), ...(b.bagSlots ? { bagSlots: Math.round(num(b.bagSlots, 0, 0, 999)) } : {}), ...flag(b) } : null), 3000);
    g.qualities = arr(src.qualities, q => (q && q.id ? {
      id: str(q.id, '', 60), name: str(q.name, q.id, 60), rank: Math.round(num(q.rank, 0, 0, 99)), color: /^#[0-9a-f]{3,8}$/i.test(q.color || '') ? q.color : '#a39e93',
      mult: num(q.mult, 1, 0, 1000), bonus: Math.round(num(q.bonus, 0, 0, 24)), unique: Math.round(num(q.unique, 0, 0, 24)), weight: num(q.weight, 0, 0, 1e9),
      growth: num(q.growth, 0, -10, 10), minLvl: Math.round(num(q.minLvl, 0, 0, 9999)), mighty: !!q.mighty, glow: Math.round(num(q.glow, 0, 0, 9)), iridescent: !!q.iridescent,
      ...(q.theme ? { theme: str(q.theme, '', 80) } : {}), ...flag(q),
    } : null), 128);
    g.effects = arr(src.effects, e => (e && e.id ? {
      id: str(e.id, '', 80), name: str(e.name, e.id, 300), group: str(e.group, 'stat', 30), kind: ['flat', 'percent', 'flag'].includes(e.kind) ? e.kind : 'flag',
      min: num(e.min, 0), max: num(e.max, 0), power: num(e.power, 0, 0, 100), use: strs(e.use, 8).filter(u => USES.includes(u)),
      classes: Array.isArray(e.classes) ? strs(e.classes) : null, tags: strs(e.tags, 16), ...(e.weight != null ? { weight: num(e.weight, 1, 0, 1000) } : {}), ...flag(e),
    } : null), 5000);
    g.gems = arr(src.gems, x => (x && x.id ? { id: str(x.id, '', 40), name: str(x.name, x.id, 60), weapon: str(x.weapon, '', 80), armor: str(x.armor, '', 80), jewelry: str(x.jewelry, '', 80), color: /^#[0-9a-f]{3,8}$/i.test(x.color || '') ? x.color : '#cccccc', ...flag(x) } : null), 64);
    g.gemTiers = strs(src.gemTiers, 16);
    g.gemTierNames = strs(src.gemTierNames, 16);
    g.gemStrength = num(src.gemStrength, 0.3, 0, 100);
    g.runes = arr(src.runes, x => (x && x.id ? { id: str(x.id, '', 40), name: str(x.name, x.id, 60), ...flag(x) } : null), 128);
    g.runeWeak = strs(src.runeWeak, 64);
    g.runeStrength = [num(src.runeStrength && src.runeStrength[0], 0.2, 0, 100), num(src.runeStrength && src.runeStrength[1], 0.02, 0, 100)];
    g.runewords = arr(src.runewords, r => (r && r.id ? { id: str(r.id, '', 80), name: str(r.name, r.id, 80), kinds: strs(r.kinds, 8), runes: strs(r.runes, 8), effect: str(r.effect, '', 80), strength: num(r.strength, 1, 0, 100), ...flag(r) } : null), 500);
    const eff2 = v => arr(v, p => (Array.isArray(p) && typeof p[0] === 'string' ? [p[0].slice(0, 80), num(p[1], 1, 0, 100)] : null), 16);
    g.cards = arr(src.cards, x => (x && x.id ? { id: str(x.id, '', 80), name: str(x.name, x.id, 80), slots: Array.isArray(x.slots) ? strs(x.slots, 24) : null, effects: eff2(x.effects), ...flag(x) } : null), 1000);
    g.cardSets = arr(src.cardSets, x => (x && x.id ? { id: str(x.id, '', 80), name: str(x.name, x.id, 80), cards: strs(x.cards, 16), effects: eff2(x.effects), ...flag(x) } : null), 200);
    g.sets = arr(src.sets, s => (s && s.id ? {
      id: str(s.id, '', 80), name: str(s.name, s.id, 100), source: str(s.source, '', 80), named: !!s.named, ref: str(s.ref, '', 80), slots: strs(s.slots, 12),
      bonuses: arr(s.bonuses, b => (Array.isArray(b) && typeof b[1] === 'string' ? [Math.round(num(b[0], 2, 1, 12)), b[1].slice(0, 80)] : null), 8), ...flag(s),
    } : null), 2000);
    const R = src.randomSets && typeof src.randomSets === 'object' ? src.randomSets : D.randomSets;
    g.randomSets = {
      themes: arr(R.themes, t => (t && t.id ? { id: str(t.id, '', 40), tags: strs(t.tags, 16), adj: strs(t.adj, 16), nounsM: strs(t.nounsM, 16), nounsF: strs(t.nounsF, 16), special: str(t.special, '', 80) } : null), 100),
      adjectives: Object.fromEntries(Object.entries(R.adjectives || {}).slice(0, 500).map(([k, v]) => [k.slice(0, 40), strs(v, 2)])),
      nouns: Object.fromEntries(Object.entries(R.nouns || {}).slice(0, 500).map(([k, v]) => [k.slice(0, 40), str(v, k, 60)])),
      slotPool: strs(R.slotPool, 30), parts: arr(R.parts, x => Math.round(num(x, 4, 1, 12)), 20), format: str(R.format, 'Комплект {0} {1}', 60),
    };
    if (!g.randomSets.parts.length) g.randomSets.parts = [4];
    g.named = arr(src.named, n => (n && n.id ? {
      id: str(n.id, '', 80), name: str(n.name, n.id, 100), desc: str(n.desc, '', 400), base: str(n.base, '', 80), quality: str(n.quality, '', 60), source: str(n.source, '', 30), ref: str(n.ref, '', 80),
      bonuses: eff2(n.bonuses), uniques: strs(n.uniques, 8),
    } : null), 3000);
    return g;
  }

  /* ---------- допоміжне для інтерфейсу ---------- */
  const slotChoices = cfg => cfg.game.slots.filter(s => s.id !== 'Bag').map(s => [s.id, s.name]);
  const sourceChoices = [['mob', 'Звичайний моб'], ['elite', 'Еліта'], ['boss', 'Бос'], ['mighty', 'Глибокий вимір / герой']];
  const resultText = {
    success: 'Успіх: +1', fail_keep: 'Невдача: плюс лишився', fail_drop: 'Невдача: плюс упав на 1', fail_protected: 'Невдача: сувій захисту зберіг плюс',
    stone_too_low: 'Камінь нижчого рівня, ніж предмет', not_enough_stones: 'Не вистачає каменів',
  };

  const api = {
    defaultParams, defaultGame, preset, ensureGame, isOn, touch, idx,
    scale, stat, canEquip, effValue, effPower, effText, poolFor, pickDistinct,
    sourceFrom, rarityBonus, qualityWeight, qualityProbs, rollQuality, rollStars, essenceCost, starSockets,
    insertCard, insertEffects, insertFits, insertValue, insertPowerIn, activeRuneword, insertsPower, cardSetPower, activeCardSets, insert, removeInsert, mergeInto, rollInsert,
    randomSet, getSet, randomSetCode, activeSetBonuses, setCounts, setPower,
    enhStatMult, enhAffixMult, enhanceChance, stonesNeeded, bonusCount, isBonusMilestone, enhanceVisual, setPlus, enhanceAttempt, transferPlus, addHalfStar, addSocket,
    maxDurability, repairCost, sellPrice, wearItem,
    derive, rollItem, rollNamed, describe, simulate, validate, sanitize, slotChoices, sourceChoices, resultText, round1,
    characterPower(cfg, items) {
      const g = cfg.game, list = items.filter(Boolean);
      return list.reduce((s, it) => s + it.power, 0) + setPower(g, list) + cardSetPower(g, list);
    },
  };
  if (typeof LootCore !== 'undefined' || L.registerGame) L.registerGame(api);
  return api;
})();

if (typeof module !== 'undefined' && module.exports) module.exports = GddCore;
