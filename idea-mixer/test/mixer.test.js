// Тести ядра Idea Mixer. Запуск: node idea-mixer/test/mixer.test.js
// Без залежностей: лише вбудовані модулі Node.
const assert = require('node:assert/strict');
const M = require('../mixer-core.js');

let failed = 0, total = 0;
function test(name, fn) {
  total++;
  try { fn(); console.log('  ok   ' + name); }
  catch (e) { failed++; console.log('  FAIL ' + name + '\n       ' + String(e.message).split('\n').join('\n       ')); }
}

console.log('Idea Mixer: тести');

test('усі слоти мають достатньо варіантів і непорожні тексти', () => {
  for (const s of M.SLOTS) {
    const list = M.POOLS[s.id];
    assert.ok(list.length >= 6, `${s.id}: лише ${list.length}`);
    assert.ok(list.every(x => typeof x.t === 'string' && x.t.length > 3 && Array.isArray(x.from)), `${s.id}: порожній запис`);
    assert.equal(new Set(list.map(x => x.t)).size, list.length, `${s.id}: повтори`);
  }
});

test('той самий seed дає ту саму ідею', () => {
  const pools = M.mergePools();
  const a = M.rollAll(M.rngFromSeed('s1'), pools, null), b = M.rollAll(M.rngFromSeed('s1'), pools, null), c = M.rollAll(M.rngFromSeed('s2'), pools, null);
  assert.deepEqual(a, b);
  assert.notDeepEqual(a, c);
});

test('зафіксовані слоти не змінюються, решта перекидається', () => {
  const pools = M.mergePools(), rng = M.rngFromSeed('lock');
  let idea = M.rollAll(rng, pools, null);
  const locks = { core: true, tone: true, title: true };
  let changedOthers = 0;
  for (let i = 0; i < 40; i++) {
    const next = M.rollAll(rng, pools, idea, locks);
    assert.equal(next.picks.core, idea.picks.core); assert.equal(next.picks.tone, idea.picks.tone); assert.equal(next.title, idea.title);
    for (const s of ['prog', 'world', 'twist', 'limit', 'view']) if (next.picks[s] !== idea.picks[s]) changedOthers++;
    idea = next;
  }
  assert.ok(changedOthers > 100, 'решта слотів мала б змінюватися: ' + changedOthers);
});

test('перекидання одного слота завжди дає інший варіант і не чіпає решту', () => {
  const pools = M.mergePools(), rng = M.rngFromSeed('one');
  const idea = M.rollAll(rng, pools, null);
  for (const s of M.SLOTS) {
    for (let i = 0; i < 30; i++) {
      const next = M.rollSlot(rng, pools, idea, s.id);
      assert.notEqual(next.picks[s.id].t, idea.picks[s.id].t, s.id);
      for (const o of M.SLOTS) if (o.id !== s.id) assert.equal(next.picks[o.id], idea.picks[o.id]);
    }
  }
});

test('кидок по новому не повторює ті самі варіанти поспіль (там, де є вибір)', () => {
  const pools = M.mergePools(), rng = M.rngFromSeed('avoid');
  let idea = M.rollAll(rng, pools, null);
  for (let i = 0; i < 60; i++) {
    const next = M.rollAll(rng, pools, idea);
    for (const s of M.SLOTS) assert.notEqual(next.picks[s.id].t, idea.picks[s.id].t, s.id);
    idea = next;
  }
});

test('усі комбінації валідні: кожен слот заповнено, назва є', () => {
  const pools = M.mergePools(), rng = M.rngFromSeed('many');
  for (let i = 0; i < 500; i++) {
    const idea = M.rollAll(rng, pools, null);
    assert.ok(/^\S+ \S+$/.test(idea.title));
    for (const s of M.SLOTS) assert.ok(idea.picks[s.id] && idea.picks[s.id].t);
  }
});

test('власні механіки додаються до пулу й можуть випасти', () => {
  const pools = M.mergePools({ twist: ['  Моя дивна механіка  ', '', 42] });
  assert.equal(pools.twist.length, M.POOLS.twist.length + 1);
  const mine = pools.twist.find(x => x.custom);
  assert.equal(mine.t, 'Моя дивна механіка');
  const rng = M.rngFromSeed('custom');
  assert.ok(Array.from({ length: 400 }, () => M.rollAll(rng, pools, null)).some(i => i.picks.twist.custom));
  assert.equal(M.mergePools().twist.length, M.POOLS.twist.length, 'вбудовані пули не мутують');
});

test('пітч у Markdown містить усі пункти й унікальні джерела', () => {
  const pools = M.mergePools(), idea = M.rollAll(M.rngFromSeed('pitch'), pools, null);
  const md = M.pitch(idea);
  assert.ok(md.startsWith('# ' + idea.title));
  for (const s of M.SLOTS) assert.ok(md.includes(`**${s.name}:** ${idea.picks[s.id].t}`));
  const src = M.sources(idea);
  assert.equal(new Set(src).size, src.length);
  if (src.length) assert.ok(md.includes('*Основа: ' + src.join(', ') + '*'));
});

test('відновлення ідеї: правильну приймає, биту відхиляє', () => {
  const idea = M.rollAll(M.rngFromSeed('san'), M.mergePools(), null);
  assert.deepEqual(M.sanitizeIdea(JSON.parse(JSON.stringify(idea))), idea);
  assert.equal(M.sanitizeIdea(null), null);
  assert.equal(M.sanitizeIdea({ picks: { core: { t: 'x' } } }), null);
  const long = JSON.parse(JSON.stringify(idea)); long.title = 'x'.repeat(500);
  assert.equal(M.sanitizeIdea(long).title.length, 60);
});

test('імпорт/експорт власних механік', () => {
  const ex = M.exportCustom({ core: ['а', 'б'] });
  assert.equal(ex.format, 'zbyrai-idea-mixer-1');
  const r = M.importCustom(JSON.parse(JSON.stringify(ex)), { core: ['а'] });
  assert.equal(r.added, 1);
  assert.deepEqual(r.custom.core, ['а', 'б']);
  assert.equal(M.importCustom({ format: 'x' }, {}).added, 0);
  assert.ok(M.importCustom(null, {}).error);
});

test('пули без дублікатів тексту', () => {
  const p = M.mergePools();
  for (const k of Object.keys(p)) { const t = p[k].map(x => x.t || x); assert.equal(new Set(t).size, t.length, k); }
});

console.log(failed ? `\nПровалено: ${failed} з ${total}` : `\nУсі ${total} тестів пройдено`);
process.exit(failed ? 1 : 0);
