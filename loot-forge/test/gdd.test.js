// Тести шару GodsDontDie. Запуск: node loot-forge/test/gdd.test.js
// Без залежностей: лише вбудовані модулі Node.
const assert = require('node:assert/strict');
const L = require('../loot-core.js');
const G = require('../gdd-core.js');
const DATA = require('../gdd-data.js');

let failed = 0, total = 0;
function test(name, fn) {
  total++;
  try { fn(); console.log('  ok   ' + name); }
  catch (e) { failed++; console.log('  FAIL ' + name + '\n       ' + String(e.message).split('\n').join('\n       ')); }
}
const near = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) <= eps, `${a} ≠ ${b}`);
const game = () => L.PRESETS.gdd();

console.log('Loot Forge, шар GodsDontDie: тести');

test('дані гри цілі: усі посилання на ефекти, класи й руни існують, пресет проходить перевірку', () => {
  const cfg = game();
  assert.deepEqual(L.validate(cfg), []);
  const g = cfg.game;
  assert.ok(g.effects.length >= 300 && g.bases.length >= 200 && g.sets.length >= 100 && g.runewords.length >= 24 && g.runes.length === 24 && g.gems.length === 8 && g.cards.length >= 12);
  assert.equal(g.qualities.filter(q => !q.theme).length, 12);
  assert.equal(g.qualities.filter(q => q.theme).length, 7);
  assert.equal(g.gemTiers.length, 7);
  assert.ok(g.classes.length === 10 && g.slots.length >= 20);
});

test('формули: Stat(рівень), запас рівня, зірки й гнізда за зірки', () => {
  const g = game().game;
  near(G.stat(g, 1), 10);
  near(G.stat(g, 21), 10 * Math.pow(1.05, 20));
  assert.ok(G.canEquip(g, 25, 20) && !G.canEquip(g, 26, 20));
  assert.equal(G.essenceCost(g, 1), 1);
  assert.equal(G.essenceCost(g, 11), Math.ceil(Math.pow(1.25, 10)));
  assert.deepEqual([9, 10, 19, 20, 29, 30].map(h => G.starSockets(g, h)), [0, 1, 1, 2, 2, 3]);
});

test('точіння: шанс, камені, бонуси на +5/+10/+15/+20 і далі кожні +10', () => {
  const g = game().game;
  near(G.enhanceChance(g, 0), 0.95);
  near(G.enhanceChance(g, 10), 0.95 * Math.pow(0.92, 10));
  near(G.enhanceChance(g, 100), 0.01);
  near(G.enhanceChance(g, 0, 10, true), 1);
  near(G.enhanceChance(g, 20, 3, false), 0.95 * Math.pow(0.92, 20) + 0.03);
  assert.deepEqual([0, 9, 10, 25].map(p => G.stonesNeeded(g, p)), [1, 1, 2, 3]);
  assert.deepEqual([0, 4, 5, 10, 15, 19, 20, 29, 30, 40].map(G.bonusCount), [0, 0, 1, 2, 3, 3, 4, 4, 5, 6]);
  assert.deepEqual([4, 5, 10, 20, 25, 30].map(G.isBonusMilestone), [false, true, true, true, false, true]);
  near(G.enhStatMult(g, 10), Math.pow(1.06, 10));
  near(G.enhAffixMult(g, 10), 1.2);
});

test('ймовірності якостей: сума 1, мінімальний рівень і «лише могутні» дотримані, бос зсуває вгору', () => {
  const cfg = game(), g = cfg.game;
  const sum = a => a.reduce((s, v) => s + v, 0);
  const lo = G.qualityProbs(cfg, { ilvl: 1 });
  near(sum(lo), 1, 1e-9);
  const idx = id => g.qualities.findIndex(q => q.id === id);
  assert.equal(lo[idx('quality.orange')], 0, 'оранжева з рівня 10');
  assert.equal(G.qualityProbs(cfg, { ilvl: 60 })[idx('quality.pearl')], 0, 'перламутрова лише з могутніх');
  assert.ok(G.qualityProbs(cfg, { ilvl: 60, source: 'boss' })[idx('quality.pearl')] > 0);
  assert.equal(G.qualityProbs(cfg, { ilvl: 79, source: 'boss' })[idx('variant.ghostly')], 0, 'варіанти з рівня 80');
  assert.ok(G.qualityProbs(cfg, { ilvl: 80, source: 'boss' })[idx('variant.ghostly')] > 0);
  const mob = G.qualityProbs(cfg, { ilvl: 40 }), boss = G.qualityProbs(cfg, { ilvl: 40, source: 'boss', luck: 100 });
  assert.ok(boss[idx('quality.purple')] > mob[idx('quality.purple')]);
  assert.ok(boss[idx('quality.white')] < mob[idx('quality.white')]);
});

test('той самий seed дає ті самі предмети, інший seed дає інші', () => {
  const cfg = game();
  const a = L.rollMany(cfg, 40, 'abc', { ilvl: 30, humor: 2, source: 'boss' });
  const b = L.rollMany(cfg, 40, 'abc', { ilvl: 30, humor: 2, source: 'boss' });
  const c = L.rollMany(cfg, 40, 'abd', { ilvl: 30, humor: 2, source: 'boss' });
  assert.deepEqual(a, b);
  assert.notDeepEqual(a, c);
});

test('інваріанти предмета (6000 кидків): ефекти за якістю й класом, гнізда, зірки, сила', () => {
  const cfg = game(), g = cfg.game, ix = G.idx(g);
  for (const [lvl, source] of [[1, 'mob'], [25, 'elite'], [90, 'boss'], [200, 'mighty']]) {
    for (const it of L.rollMany(cfg, 1500, 'inv' + lvl, { ilvl: lvl, source })) {
      const cls = ix.cls.get(it.cls), q = ix.qual.get(it.quality), base = ix.base.get(it.baseCode);
      assert.ok(it.halfStars >= 1 && it.halfStars <= 6, 'зірки при випадінні 0,5–3');
      assert.ok(it.sockets <= cls.maxSockets && it.inserts.length === it.sockets, 'гнізда');
      assert.ok(base.slot !== 'Bag' && base.slot !== 'None', 'випадає лише спорядження');
      if (!cls.hasStats) { assert.equal(it.power, 0); assert.equal(it.bonuses.length + it.uniques.length, 0); continue; }
      assert.ok(it.bonuses.length === q.bonus && new Set(it.bonuses.map(b => b.id)).size === q.bonus, 'бонуси за якістю');
      assert.equal(it.uniques.length, q.unique);
      if (q.theme) assert.ok(it.uniques.includes(q.theme));
      for (const b of it.bonuses) { const e = ix.eff.get(b.id); assert.ok(e.use.includes('bonus') && (!e.classes || e.classes.includes(cls.id)), b.id + ' у ' + cls.id); assert.ok(b.roll >= 0 && b.roll < 1); }
      near(it.mainStat, G.stat(g, lvl) * base.mult * q.mult * (1 + 0.05 * it.halfStars), 1e-6);
      assert.ok(it.power > 0 && it.mainStat > 0);
    }
  }
});

test('значення ефектів: число росте з рівнем, відсоток ні, механіка = 1', () => {
  const g = game().game, ix = G.idx(g);
  const flat = ix.eff.get('stat.strength'), pct = ix.eff.get('pct.damage'), flag = ix.eff.get('unique.chain_lightning');
  near(G.effValue(g, flat, 0, 1), 2); near(G.effValue(g, flat, 1, 1), 4);
  near(G.effValue(g, flat, 1, 21), 4 * Math.pow(1.05, 20));
  near(G.effValue(g, pct, 0.5, 1), G.effValue(g, pct, 0.5, 300));
  assert.equal(G.effValue(g, flag, 0.3, 50), 1);
  near(G.effPower(g, pct, 1, 1), pct.power * 10);
  near(G.effPower(g, pct, 0, 1), pct.power * (pct.min / pct.max) * 10);
});

test('вставки: підходять за слотом і класом, самоцвіт читає тип предмета, злиття 3 → наступний ступінь', () => {
  const cfg = game(), g = cfg.game;
  const it = G.rollItem(cfg, L.rngFromSeed('ins'), { ilvl: 40, slot: 'base.sword', lean: false });
  it.baseSockets = 2; G.derive(g, it);
  assert.equal(it.sockets, 2);
  assert.ok(G.insert(g, it, 0, 'gem.ruby.normal'));
  assert.ok(!G.insert(g, it, 0, 'gem.ruby.normal'), 'зайняте гніздо');
  assert.ok(!G.insert(g, it, 1, 'card.forest_wolf'), 'картка вовка лише в ноги');
  assert.ok(G.insert(g, it, 1, 'card.night_reaper'), 'жнець у зброю');
  const card = G.insertCard(g, 'gem.ruby.normal');
  const eff = G.insertEffects(card, G.idx(g).cls.get(it.cls));
  assert.equal(eff[0].effect, 'stat.fire_damage', 'рубін у зброї дає вогняну шкоду');
  const armor = G.rollItem(cfg, L.rngFromSeed('ins2'), { ilvl: 40, slot: 'base.chest_cloth' });
  assert.equal(G.insertEffects(card, G.idx(g).cls.get(armor.cls))[0].effect, 'stat.hp', 'у броні — HP');
  near(G.insertCard(g, 'gem.ruby.clean').tierMult, Math.pow(1.5, 3));
  assert.equal(G.mergeInto(g, 'gem.ruby.shard', 3), 'gem.ruby.cracked');
  assert.equal(G.mergeInto(g, 'gem.ruby.shard', 2), null);
  assert.equal(G.mergeInto(g, 'gem.ruby.starry', 3), null, 'вищий ступінь не зливається');
  assert.equal(G.removeInsert(it, 0, false), null);
  assert.equal(it.inserts[0], null);
});

test('рунне слово: потрібен точний порядок, точна кількість гнізд і вид предмета', () => {
  const cfg = game(), g = cfg.game;
  const rw = g.runewords.find(r => r.id === 'runeword.storm_wrath'); // Тал Ор Зен, одно- і дворучна
  assert.deepEqual(rw.runes, ['tal', 'or', 'zen']);
  const mk = slot => { const i = G.rollItem(cfg, L.rngFromSeed('rw' + slot), { ilvl: 30, slot }); i.halfStars = 1; i.baseSockets = 3; G.derive(g, i); return i; };
  const sword = mk('base.sword');
  rw.runes.forEach((r, k) => G.insert(g, sword, k, 'rune.' + r));
  G.derive(g, sword);
  assert.equal(sword.runeword, 'runeword.storm_wrath');
  assert.ok(sword.powerParts.inserts > 0);
  const swapped = mk('base.sword');
  ['or', 'tal', 'zen'].forEach((r, k) => G.insert(g, swapped, k, 'rune.' + r));
  G.derive(g, swapped);
  assert.equal(swapped.runeword, undefined, 'інший порядок руни');
  const chest = mk('base.chest_cloth');
  rw.runes.forEach((r, k) => G.insert(g, chest, k, 'rune.' + r));
  G.derive(g, chest);
  assert.equal(chest.runeword, undefined, 'вид «броня» не підходить');
  const four = mk('base.sword'); four.baseSockets = 3;
  assert.ok(G.derive(g, four).sockets === 3);
  // руни у рунному слові не додають сили поодинці
  const alone = G.insertCard(g, 'rune.tal');
  assert.ok(G.insertPowerIn(g, alone, sword) > 0);
});

test('набір карток діє лише коли всі картки вставлено в одяг', () => {
  const cfg = game(), g = cfg.game;
  const set = g.cardSets[0];
  assert.deepEqual(set.cards.length, 4);
  const pieces = set.cards.map((c, i) => {
    const card = g.cards.find(x => x.id === c);
    const slot = card.slots ? card.slots[0] : 'Head';
    const base = g.bases.find(b => b.slot === slot && G.idx(g).cls.get(b.cls).maxSockets > 0);
    const it = G.rollItem(cfg, L.rngFromSeed('cs' + i), { ilvl: 20, slot: base.id });
    it.baseSockets = 1; it.halfStars = 1; G.derive(g, it); return it;
  });
  pieces.slice(0, 3).forEach((it, i) => G.insert(g, it, 0, set.cards[i]));
  assert.equal(G.cardSetPower(g, pieces), 0);
  G.insert(g, pieces[3], 0, set.cards[3]);
  assert.ok(G.cardSetPower(g, pieces) > 0);
  assert.equal(G.activeCardSets(g, pieces).length, 1);
});

test('точіння: детерміноване, плюс не падає нижче 0 і до +10, камінь нижчого рівня відхиляється, бонус на +5', () => {
  const cfg = game(), g = cfg.game;
  const run = seed => {
    const it = G.rollItem(cfg, L.rngFromSeed('enh'), { ilvl: 30, slot: 'base.sword' });
    const rng = L.rngFromSeed(seed), log = [];
    for (let i = 0; i < 80; i++) {
      const inp = { stones: 99, stoneLevel: 30, dust: 0, blessing: false, protection: false };
      const before = it.plus, r = G.enhanceAttempt(cfg, it, rng, inp);
      log.push(r + it.plus);
      if (before < 10) assert.ok(it.plus >= before, 'до +10 не падає');
      assert.ok(it.plus >= 0);
      if (r === 'success') assert.equal(it.plus, before + 1);
      assert.equal(it.enhanceBonuses.length >= G.bonusCount(it.plus), true);
    }
    return [it.plus, log.join()];
  };
  assert.deepEqual(run('s1'), run('s1'));
  const it = G.rollItem(cfg, L.rngFromSeed('enh'), { ilvl: 30, slot: 'base.sword' });
  assert.equal(G.enhanceAttempt(cfg, it, () => 0, { stones: 5, stoneLevel: 29, dust: 0 }), 'stone_too_low');
  assert.equal(G.enhanceAttempt(cfg, it, () => 0, { stones: 0, stoneLevel: 30, dust: 0 }), 'not_enough_stones');
  const lucky = () => 0;
  for (let i = 0; i < 5; i++) assert.equal(G.enhanceAttempt(cfg, it, lucky, { stones: 9, stoneLevel: 30, dust: 0 }), 'success');
  assert.equal(it.plus, 5);
  assert.equal(it.enhanceBonuses.length, 1);
  assert.ok(g.classes.find(k => k.id === it.cls).enhancePool.includes(it.enhanceBonuses[0].id));
  assert.ok(it.mainStat > G.stat(g, 30) * 1.0 * 1.06 ** 5 * 0.99, 'основна характеристика росте ×1,06 за плюс');
  const unlucky = () => 0.999999;
  const pr = { stones: 9, stoneLevel: 30, dust: 0, protection: true };
  while (it.plus < 10) { G.setPlus(cfg, it, it.plus + 1); }
  assert.equal(G.enhanceAttempt(cfg, it, unlucky, pr), 'fail_protected');
  assert.equal(it.plus, 10);
  assert.equal(G.enhanceAttempt(cfg, it, unlucky, { stones: 9, stoneLevel: 30, dust: 0 }), 'fail_drop');
  assert.equal(it.plus, 9);
  const to = G.rollItem(cfg, L.rngFromSeed('tr'), { ilvl: 30, slot: 'base.sword_iron' });
  assert.ok(G.transferPlus(cfg, it, to));
  assert.equal(to.plus, Math.floor(9 * 0.8));
});

test('зірки, гнізда, міцність і ціна', () => {
  const cfg = game(), g = cfg.game;
  const it = G.rollItem(cfg, L.rngFromSeed('st'), { ilvl: 20, slot: 'base.sword' });
  it.baseSockets = 0; it.halfStars = 9; G.derive(g, it);
  assert.equal(it.sockets, 0);
  const cost = G.addHalfStar(cfg, it);
  assert.equal(cost, G.essenceCost(g, 9));
  assert.equal(it.halfStars, 10); assert.equal(it.sockets, 1, 'на 5★ відкривається гніздо');
  it.halfStars = 1; G.derive(g, it);
  assert.ok(G.addSocket(cfg, it) && it.sockets === 1, 'ювелір додає гніздо');
  it.halfStars = 30; G.derive(g, it);
  assert.equal(G.addHalfStar(cfg, it), 0, 'стеля 15★');
  assert.equal(it.sockets, g.classes.find(k => k.id === it.cls).maxSockets, 'не більше максимуму класу');
  assert.equal(G.addSocket(cfg, it), false);
  assert.equal(it.durMax, 500);
  assert.equal(G.wearItem(g, it, 499), false);
  assert.equal(G.wearItem(g, it, 5), true);
  assert.ok(it.broken && it.durability === 0);
  assert.ok(G.repairCost(g, it) > 0);
  it.wear = 0; G.derive(g, it);
  assert.equal(G.repairCost(g, it), 0);
  const ring = G.rollItem(cfg, L.rngFromSeed('ring'), { ilvl: 20, slot: g.bases.find(b => b.slot === 'Ring').id });
  assert.equal(ring.durMax, 0, 'прикраси не зношуються');
  const white = G.rollItem(cfg, L.rngFromSeed('p'), { ilvl: 1, slot: 'base.sword', rarity: 'quality.white' });
  assert.equal(G.sellPrice(g, white), Math.round(3 * 9 * 1));
});

test('комплекти: продумані й випадкові (rset.N) відтворюються з коду, бонуси за кількістю частин', () => {
  const cfg = game(), g = cfg.game;
  const a = G.getSet(g, 'rset.12345'), b = G.getSet(g, 'rset.12345'), c = G.getSet(g, 'rset.12346');
  assert.equal(a, b); assert.notDeepEqual(a.bonuses, c.bonuses);
  assert.ok(a.slots.length >= 4 && a.bonuses.length >= 2 && a.name.startsWith('Комплект '));
  assert.ok(!(a.slots.includes('TwoHand') && a.slots.includes('MainHand')));
  for (const [, id] of a.bonuses) assert.ok(G.idx(g).eff.has(id));
  const ember = G.getSet(g, 'set.ember_lord');
  assert.equal(G.activeSetBonuses(ember, 5).length, 2);
  assert.equal(G.activeSetBonuses(ember, 8).length, 4);
  const items = L.rollMany(cfg, 200, 'sets', { ilvl: 30, setCode: 'set.ember_lord', setChance: 100 });
  assert.ok(items.every(i => i.setCode === 'set.ember_lord' && ember.slots.includes(i.slot)));
  assert.ok(G.setPower(g, items.slice(0, 2)) > 0);
  const random = L.rollMany(cfg, 50, 'sets2', { ilvl: 30, setCode: 'rset.777', setChance: 100 });
  assert.ok(random.every(i => i.setCode === 'rset.777' && G.getSet(g, 'rset.777').slots.includes(i.slot)));
  assert.ok(L.rollMany(cfg, 200, 'sets3', { ilvl: 30, setCode: 'set.ember_lord', setChance: 0 }).every(i => !i.setCode));
});

test('іменований предмет: фіксована назва й обов’язкові ефекти, решта докидається до кількості якості', () => {
  const cfg = game(), g = cfg.game, n = g.named[0];
  const it = G.rollNamed(cfg, L.rngFromSeed('nm'), n.id, 40);
  assert.equal(it.name, n.name); assert.equal(it.quality, n.quality);
  for (const [e] of n.bonuses) assert.ok(it.bonuses.some(b => b.id === e));
  for (const u of n.uniques) assert.ok(it.uniques.includes(u));
  assert.equal(it.bonuses.length, G.idx(g).qual.get(n.quality).bonus);
  assert.throws(() => G.rollNamed(cfg, L.rngFromSeed('x'), 'named.nope', 1));
});

test('випадкова вставка: гнізда руни залежать від рівня, ступінь самоцвіта росте з рівнем і босом', () => {
  const g = game().game;
  const rng = L.rngFromSeed('ri');
  const seen = { gem: 0, rune: 0, card: 0 };
  let maxTierLow = 0, maxTierHigh = 0;
  for (let i = 0; i < 4000; i++) {
    const lo = G.rollInsert(g, rng, 1, false, false), hi = G.rollInsert(g, rng, 200, false, true);
    assert.ok(G.insertCard(g, lo) && G.insertCard(g, hi), lo + ' ' + hi);
    seen[G.insertCard(g, lo).kind]++;
    if (G.insertCard(g, lo).kind === 'gem') maxTierLow = Math.max(maxTierLow, G.insertCard(g, lo).tier);
    if (G.insertCard(g, hi).kind === 'gem') maxTierHigh = Math.max(maxTierHigh, G.insertCard(g, hi).tier);
  }
  assert.ok(seen.gem > seen.rune && seen.rune > seen.card && seen.card > 0);
  assert.ok(maxTierHigh > maxTierLow);
});

test('симуляція: частоти якостей збігаються з очікуваними, є розподіли зірок і гнізд, попередження про нестачу ефектів працюють', () => {
  const cfg = game();
  const sim = L.simulate(cfg, 40000, 'sim', { ilvl: 90, source: 'boss' });
  for (const r of sim.byRarity) assert.ok(Math.abs(r.actual - r.expected) < 0.01, `${r.id}: ${r.expected} vs ${r.actual}`);
  assert.equal(sim.n, 40000);
  assert.equal(sim.stars.reduce((s, v) => s + v, 0), 40000);
  assert.ok(sim.byClass['class.armor'] > 0 && sim.power.max >= sim.power.median);
  assert.deepEqual(sim.warnings.filter(w => w.includes('доступно лише')), []);
  const poor = game();
  poor.game.effects.forEach(e => { if (e.use.includes('bonus')) e.use = e.use.filter(u => u !== 'bonus'); });
  assert.ok(L.simulate(poor, 2000, 'x', { ilvl: 90, source: 'boss' }).warnings.some(w => w.includes('доступно лише')));
});

test('сумісність: старий конфіг без game працює як раніше, режим гри вмикається й вимикається без втрат', () => {
  const fantasy = L.PRESETS.fantasy();
  assert.equal(fantasy.game, undefined);
  const before = L.rollMany(fantasy, 30, 'compat', { ilvl: 5 });
  const cfg = game();
  cfg.game.enabled = false;
  assert.deepEqual(L.rollMany(Object.assign({}, fantasy, { game: cfg.game }), 30, 'compat', { ilvl: 5 }), before, 'шар вимкнено → той самий результат');
  const wrapped = JSON.parse(L.exportJSON(fantasy));
  assert.equal(wrapped.config.game, undefined);
  assert.deepEqual(L.sanitize(wrapped), fantasy);
  const on = G.ensureGame(L.PRESETS.survival(), true);
  assert.ok(G.isOn(on) && on.game.bases.length > 100 && on.stats.dur, 'дані гри додаються до чужого набору');
  assert.deepEqual(L.validate(on), []);
  G.ensureGame(on, false);
  assert.ok(L.rollMany(on, 5, 's', {}).every(i => i.game === undefined), 'вимкнено → звичайні предмети');
});

test('експорт → імпорт повертає той самий конфіг гри; предмети гри серіалізуються', () => {
  const cfg = game();
  const items = L.rollMany(cfg, 5, 'ex', { ilvl: 50, source: 'boss' });
  const text = L.exportJSON(cfg, items);
  const parsed = JSON.parse(text);
  assert.equal(parsed.format, 'zbyrai.loot-forge'); assert.equal(parsed.version, 1);
  assert.equal(parsed.samples.length, 5);
  const back = L.sanitize(parsed);
  assert.deepEqual(back, cfg);
  const again = L.rollMany(back, 5, 'ex', { ilvl: 50, source: 'boss' });
  assert.deepEqual(again, items);
  // предмет відновлюється зі збереженого стану
  const it = JSON.parse(JSON.stringify(items[0]));
  const before = it.power;
  G.derive(cfg.game, it);
  assert.equal(it.power, before);
});

test('перевірка й очищення: биті посилання відхиляються, сміття обмежується', () => {
  const cfg = game();
  cfg.game.sets[0].bonuses[0][1] = 'nope.effect';
  assert.ok(L.validate(cfg)[0].includes('nope.effect'));
  assert.throws(() => L.sanitize(JSON.parse(JSON.stringify({ config: cfg }))), /nope\.effect/);
  const junk = game();
  junk.game.params.statBase = 'abc';
  junk.game.params.enhance.chance = 99999;
  junk.game.qualities[0].color = 'url(javascript:1)';
  junk.game.qualities[0].bonus = 1e9;
  junk.game.effects[0].kind = 'evil';
  junk.game.effects[0].use = ['bonus', 'hack'];
  junk.game.bases = junk.game.bases.slice(-3);
  junk.game.bases.push({ id: 'x'.repeat(500), cls: 7, mult: 'big' });
  const clean = L.sanitize(JSON.parse(JSON.stringify({ config: junk })));
  assert.equal(clean.game.params.statBase, 10);
  assert.equal(clean.game.params.enhance.chance, 99999);
  assert.ok(/^#[0-9a-f]{3,8}$/i.test(clean.game.qualities[0].color));
  assert.equal(clean.game.qualities[0].bonus, 24);
  assert.equal(clean.game.effects[0].kind, 'flag');
  assert.deepEqual(clean.game.effects[0].use, ['bonus']);
  assert.ok(clean.game.bases.every(b => b.id.length <= 80 && b.mult >= 0));
  const noBases = game(); noBases.game.bases = [];
  assert.ok(L.validate(noBases).some(m => m.includes('спорядження')));
  const allZero = game(); allZero.game.qualities.forEach(q => { q.weight = 0; });
  assert.ok(L.validate(allZero).some(m => m.includes('нульова вага')));
});

test('опис предмета для інтерфейсу: рядки ефектів, гнізда, комплект, рунне слово', () => {
  const cfg = game();
  const it = L.rollMany(cfg, 1, 'desc', { ilvl: 120, source: 'boss', rarity: 'quality.red', setCode: 'set.ember_lord', setChance: 100 })[0];
  const d = G.describe(cfg, it);
  assert.equal(d.bonuses.length, 6); assert.equal(d.uniques.length, 2);
  assert.ok(d.bonuses.every(b => b.text && !b.text.includes('{0}')));
  assert.ok(d.set && d.set.bonuses.length === 4 && d.set.name === 'Комплект Володаря жару');
  assert.ok(d.main.includes(':') && d.durability !== undefined && d.sell > 0);
  assert.equal(d.inserts.length, it.sockets);
});

console.log(failed ? `\nПровалено ${failed} з ${total}` : `\nУсі ${total} тестів пройдено`);
process.exit(failed ? 1 : 0);
