// Тести ядра Loot Forge. Запуск: node loot-forge/test/loot.test.js
// Без залежностей: лише вбудовані модулі Node.
const assert = require('node:assert/strict');
const L = require('../loot-core.js');

let failed = 0, total = 0;
function test(name, fn) {
  total++;
  try { fn(); console.log('  ok   ' + name); }
  catch (e) { failed++; console.log('  FAIL ' + name + '\n       ' + String(e.message).split('\n').join('\n       ')); }
}

console.log('Loot Forge: тести');

test('той самий seed дає ті самі предмети, інший seed дає інші', () => {
  const cfg = L.PRESETS.fantasy();
  const a = L.rollMany(cfg, 50, 'abc', { ilvl: 5, humor: 2 });
  const b = L.rollMany(cfg, 50, 'abc', { ilvl: 5, humor: 2 });
  const c = L.rollMany(cfg, 50, 'abd', { ilvl: 5, humor: 2 });
  assert.deepEqual(a, b);
  assert.notDeepEqual(a, c);
});

test('частоти рідкостей збігаються з вагами (100 000 кидків, допуск 0.6 в.п.)', () => {
  for (const key of ['fantasy', 'survival']) {
    const cfg = L.PRESETS[key]();
    const sim = L.simulate(cfg, 100000, 'freq-' + key);
    for (const r of sim.byRarity) assert.ok(Math.abs(r.actual - r.expected) < .006, `${key}/${r.id}: очікувано ${r.expected}, є ${r.actual}`);
  }
});

test('значення афіксів лежать у [min·k, max·k], кількість афіксів у межах рідкості, афікси не повторюються', () => {
  const cfg = L.PRESETS.fantasy();
  for (const ilvl of [1, 10, 50]) {
    const items = L.rollMany(cfg, 4000, 'range' + ilvl, { ilvl });
    for (const it of items) {
      const r = cfg.rarities.find(x => x.id === it.rarity), k = L.itemScale(cfg, r, ilvl);
      assert.ok(it.affixes.length >= Math.min(r.min, 1) - 1 && it.affixes.length <= r.max, 'кількість афіксів');
      assert.equal(new Set(it.affixes.map(a => a.id)).size, it.affixes.length, 'повтор афікса');
      for (const a of it.affixes) {
        const def = cfg.affixes.find(x => x.id === a.id), st = cfg.stats[a.stat];
        const lo = Math.max(def.min > 0 ? (st.pct ? .1 : 1) : 0, L.fmtVal(st, def.min * k)), hi = L.fmtVal(st, def.max * k);
        assert.ok(a.value >= lo - 1e-9 && a.value <= hi + 1e-9, `${a.id}: ${a.value} поза [${lo}, ${hi}] (ilvl ${ilvl})`);
      }
    }
  }
});

test('афікси з вимогою рівня не з’являються нижче цього рівня; теги слотів дотримані', () => {
  const cfg = L.PRESETS.fantasy();
  const low = L.rollMany(cfg, 5000, 'lvl', { ilvl: 3 });
  assert.ok(low.every(it => it.affixes.every(a => a.id !== 'a_vamp')), 'вампіризм на рівні 3');
  const high = L.rollMany(cfg, 5000, 'lvl', { ilvl: 20 });
  assert.ok(high.some(it => it.affixes.some(a => a.id === 'a_vamp')), 'вампіризм на рівні 20 мав би траплятися');
  for (const it of high) {
    const slot = cfg.slots.find(s => s.id === it.slot);
    for (const a of it.affixes) {
      const def = cfg.affixes.find(x => x.id === a.id);
      assert.ok(def.tags.includes('any') || def.tags.some(t => slot.tags.includes(t)), `${a.id} недоступний для ${slot.id}`);
    }
  }
});

test('сила предмета зростає з рівнем і рідкістю (у середньому)', () => {
  const cfg = L.PRESETS.fantasy();
  const avg = o => { const xs = L.rollMany(cfg, 3000, 'pw', o); return xs.reduce((s, x) => s + x.power, 0) / xs.length; };
  assert.ok(avg({ ilvl: 20 }) > avg({ ilvl: 1 }) * 1.5);
  assert.ok(avg({ ilvl: 10, rarity: 'legendary' }) > avg({ ilvl: 10, rarity: 'common' }) * 2);
});

test('примусова рідкість і тип працюють', () => {
  const cfg = L.PRESETS.fantasy();
  const xs = L.rollMany(cfg, 200, 'force', { rarity: 'epic', slot: 'ring' });
  assert.ok(xs.every(x => x.rarity === 'epic' && x.slot === 'ring'));
});

test('калькулятор: очікування 1/p, із гарантією (1−(1−p)^N)/p, кількість спроб для шансу', () => {
  assert.equal(L.expectedTries(.1), 10);
  assert.ok(Math.abs(L.expectedTries(.1, 5) - (1 - Math.pow(.9, 5)) / .1) < 1e-12);
  assert.ok(L.expectedTries(.1, 5) < L.expectedTries(.1));
  assert.equal(L.expectedTries(0), Infinity);
  assert.equal(L.triesForChance(.5, .5), 1);
  const t = L.triesForChance(.01, .9);
  assert.ok(1 - Math.pow(.99, t) >= .9 && 1 - Math.pow(.99, t - 1) < .9, 'мінімальна кількість спроб');
  assert.equal(L.triesForChance(.01, .99, 50), 50, 'гарантія обрізає');
});

test('калькулятор збігається з Монте-Карло (p=0.07, гарантія 20)', () => {
  const rng = L.rngFromSeed('mc'), p = .07, pity = 20;
  let sum = 0; const runs = 60000;
  for (let i = 0; i < runs; i++) { let k = 1; while (k < pity && rng() >= p) k++; sum += k; }
  assert.ok(Math.abs(sum / runs - L.expectedTries(p, pity)) < .08, `${sum / runs} проти ${L.expectedTries(p, pity)}`);
});

test('форматування часу', () => {
  assert.equal(L.formatMinutes(0.4), 'менше хвилини');
  assert.equal(L.formatMinutes(45), '≈ 45 хв');
  assert.equal(L.formatMinutes(200), '≈ 3 год 20 хв');
  assert.equal(L.formatMinutes(Infinity), '∞');
});

test('експорт → імпорт повертає той самий конфіг; обгортка й «голий» конфіг приймаються однаково', () => {
  for (const key of Object.keys(L.PRESETS)) {
    const cfg = L.PRESETS[key]();
    const back = L.sanitize(JSON.parse(L.exportJSON(cfg)));
    assert.deepEqual(back, cfg);
    assert.deepEqual(L.sanitize(JSON.parse(JSON.stringify(cfg))), cfg);
  }
});

test('перевірка конфігу ловить биті посилання, мінімум більший за максимум і нульові ваги', () => {
  const bad = L.PRESETS.fantasy();
  bad.affixes.push({ id: 'x', stat: 'nope', min: 5, max: 1, tags: ['any'], lvl: 1, on: true });
  const p = L.validate(bad);
  assert.ok(p.some(s => s.includes('невідому характеристику')) && p.some(s => s.includes('мінімум більший')));
  const dead = L.PRESETS.fantasy(); dead.rarities.forEach(r => (r.weight = 0));
  assert.ok(L.validate(dead).some(s => s.includes('нульова вага')));
  assert.throws(() => L.sanitize({ config: { stats: {}, rarities: [], slots: [], affixes: [] } }));
  assert.throws(() => L.sanitize(42));
});

test('сміттєвий імпорт не ламає ядро: числа обмежуються, кольори перевіряються', () => {
  const cfg = L.PRESETS.fantasy();
  cfg.rarities[0].weight = 'abc'; cfg.rarities[0].color = 'url(javascript:alert(1))'; cfg.levelScale = 99;
  const clean = L.sanitize(cfg);
  assert.equal(clean.rarities[0].weight, 1);
  assert.equal(clean.rarities[0].color, '#a39e93');
  assert.equal(clean.levelScale, 2);
});

test('текст бази ⇄ об’єкт', () => {
  const cfg = L.PRESETS.fantasy();
  const text = L.baseToText({ dmg: [5, 10], int: [3, 6] });
  assert.equal(text, 'dmg:5-10, int:3-6');
  assert.deepEqual(L.textToBase(text, cfg.stats), { dmg: [5, 10], int: [3, 6] });
  assert.deepEqual(L.textToBase('zzz:1-2, dmg:x', cfg.stats), {});
});

test('симуляція: попередження про надто рідкісну легендарку', () => {
  const cfg = L.PRESETS.fantasy(); cfg.rarities[4].weight = .001;
  const sim = L.simulate(cfg, 5000, 'warn');
  assert.ok(sim.warnings.length > 0);
});

console.log(failed ? `\nПровалено: ${failed} з ${total}` : `\nУсі ${total} тестів пройдено`);
process.exit(failed ? 1 : 0);
