// Тести Colonist Foundry. Запуск: node colonist-foundry/test/colonist.test.js
const assert = require('node:assert/strict');
const C = require('../colonist-core.js');
let failed = 0, total = 0;
function test(name, fn) { total++; try { fn(); console.log('  ok   ' + name); } catch (e) { failed++; console.log('  FAIL ' + name + '\n       ' + String(e.message).split('\n').join('\n       ')); } }

console.log('Colonist Foundry');

test('детермінованість: той самий seed дає ту саму колонію, інший — іншу', () => {
  assert.deepEqual(C.generateColony('a', 8), C.generateColony('a', 8));
  assert.notDeepEqual(C.generateColony('a', 8).colonists, C.generateColony('b', 8).colonists);
});

test('збільшення кількості не змінює вже створених колоністів', () => {
  const a = C.generateColony('s', 5).colonists, b = C.generateColony('s', 9).colonists;
  for (let i = 0; i < 5; i++) assert.deepEqual(a[i], b[i]);
});

test('імена в колонії з 10 людей не повторюються', () => {
  for (let s = 0; s < 60; s++) { const names = C.generateColony('n' + s, 10).colonists.map(c => c.name); assert.equal(new Set(names).size, names.length); }
});

test('риси не конфліктують між собою; кількість 2–3; без повторів', () => {
  for (let s = 0; s < 80; s++) for (const c of C.generateColony('t' + s, 10).colonists) {
    assert.ok(c.traits.length >= 2 && c.traits.length <= 3, 'кількість рис ' + c.traits.length);
    assert.equal(new Set(c.traits).size, c.traits.length);
    for (const x of c.traits) for (const y of c.traits) assert.ok(!C.TRAIT_BY[x].conflicts.includes(y), `${x} ↔ ${y}`);
  }
});

test('навички в межах 0..20, пристрасті 0..2, не більше однієї «горить», вік дорослий', () => {
  for (let s = 0; s < 60; s++) for (const c of C.generateColony('k' + s, 10).colonists) {
    for (const sk of C.SKILLS) { assert.ok(c.skills[sk.id] >= 0 && c.skills[sk.id] <= 20); assert.ok([0, 1, 2].includes(c.passion[sk.id])); }
    assert.ok(Object.values(c.passion).filter(p => p === 2).length <= 1);
    assert.ok(Object.values(c.passion).some(p => p > 0));
    assert.ok(c.age >= 18 && c.age <= 65);
  }
});

test('зафіксований колоніст лишається, reroll міняє лише свій слот', () => {
  const col = C.generateColony('lock', 6), locked = col.colonists[2];
  assert.deepEqual(C.generateColony('lock', 6, { 2: locked }).colonists[2], locked);
  const r = C.reroll(col, 3, 'new');
  assert.notDeepEqual(r.colonists[3], col.colonists[3]);
  for (const i of [0, 1, 2, 4, 5]) assert.deepEqual(r.colonists[i], col.colonists[i]);
});

test('стосунки: індекси коректні, без дублів, пари не з собою; є хоч один зв\'язок у колонії з 8', () => {
  for (let s = 0; s < 30; s++) {
    const col = C.generateColony('r' + s, 8), seen = new Set();
    for (const r of col.relations) { assert.ok(r.a < r.b && r.b < 8); assert.ok(!seen.has(r.a + '-' + r.b)); seen.add(r.a + '-' + r.b); assert.ok(C.REL[r.type]); }
    assert.ok(col.relations.length >= 1);
  }
});

test('думка: суперник гірше за друга, пара краще за друга', () => {
  const col = C.generateColony('op', 8), base = (i, j) => C.baseOpinion(col.colonists[i], col.colonists[j]);
  for (const r of col.relations) {
    const d = C.opinion(col, r.a, r.b) - base(r.a, r.b);
    assert.equal(d, { sibling: 15, spouse: 35, friend: 22, rival: -28 }[r.type]);
  }
});

test('пріоритети: 0 для заборонених робіт, 1–4 для решти; висока навичка → вищий пріоритет', () => {
  const c = C.generateColony('pr', 1).colonists[0], p = C.priorities(c);
  for (const j of C.JOBS) assert.ok(c.noJobs.includes(j.id) ? p[j.id] === 0 : p[j.id] >= 1 && p[j.id] <= 4);
  const hi = Object.assign({}, c, { noJobs: [], skills: Object.assign({}, c.skills, { farm: 18, mine: 0 }), passion: Object.assign({}, c.passion, { farm: 0, mine: 0 }) });
  const q = C.priorities(hi); assert.ok(q.farm < q.mine);
});

test('симуляція доби: потреби в 0..1, настрій 0..100, детермінована, без NaN', () => {
  for (let s = 0; s < 20; s++) {
    const col = C.generateColony('sim' + s, 8), a = C.simulateDay(col, 1), b = C.simulateDay(col, 1);
    assert.deepEqual(a, b);
    for (const f of a.final) { assert.ok(f.mood >= 0 && f.mood <= 100); for (const v of Object.values(f.needs)) assert.ok(v >= 0 && v <= 1 && !Number.isNaN(v)); assert.ok(Number.isFinite(f.work)); assert.equal(f.acts.length, 24); }
    for (const e of a.log) assert.ok(e.h >= 0 && e.h < 24 && e.text);
  }
});

test('симуляція доби: люди сплять уночі, працюють удень, робота відповідає навичкам', () => {
  const col = C.generateColony('shape', 10), r = C.simulateDay(col, 3);
  let sleepNight = 0, workDay = 0, cnt = 0;
  for (const f of r.final) for (let h = 0; h < 24; h++) { cnt++; if ((h >= 1 && h <= 4) && f.acts[h] === 'сон') sleepNight++; if (h >= 9 && h <= 16 && f.acts[h].startsWith('робота')) workDay++; }
  assert.ok(sleepNight > r.final.length * 4 * .6, 'сон: ' + sleepNight);
  assert.ok(workDay > r.final.length * 8 * .5, 'робота: ' + workDay);
  assert.ok(Object.values(r.stats.work).some(v => v > 0));
  // сильніша колонія виробляє більше
  const strong = JSON.parse(JSON.stringify(col)); strong.colonists.forEach(c => { for (const k of Object.keys(c.skills)) c.skills[k] = Math.min(20, c.skills[k] + 6); });
  const sum = x => Object.values(x.stats.work).reduce((a, b) => a + b, 0);
  assert.ok(sum(C.simulateDay(strong, 3)) > sum(r));
});

test('експорт CSV має рядок на колоніста', () => {
  const col = C.generateColony('csv', 6), lines = C.toCsv(col).split('\n'); assert.equal(lines.length, 7);
});

console.log(failed ? `\nПровалено: ${failed} з ${total}` : `\nУсі ${total} тестів пройдено`);
process.exit(failed ? 1 : 0);
