// Тести покрокової симуляції колонії (поселення, погода, хвороби, події, стосунки, історія). Запуск: node colonist-foundry/test/sim.test.js
const assert = require('node:assert/strict');
const C = require('../colonist-core.js'), S = require('../colony-sim.js'), W = require('../colony-world.js'), G = require('../colony-grammar.js'), E = require('../colony-events.js');
let failed = 0, total = 0;
function test(name, fn) { total++; try { fn(); console.log('  ok   ' + name); } catch (e) { failed++; console.log('  FAIL ' + name + '\n       ' + String(e.message).split('\n').join('\n       ')); } }
const pl = (biome, kind = 'village') => ({ planet: 'Тест', biome, kind });

console.log('Симуляція колонії: рушій');

test('відтворюваність: однакові вхідні дають однаковий стан; крок за кроком = пакетом', () => {
  const col = C.generateColony('rp', 8), a = S.replay(col, pl('jungle'), 3, 100), b = S.create(col, pl('jungle'), 3);
  for (let k = 0; k < 100; k++) S.step(b);
  assert.deepEqual(a.log, b.log); assert.deepEqual(a.ops, b.ops); assert.deepEqual(a.needs, b.needs);
  assert.notDeepEqual(S.replay(col, pl('jungle'), 4, 100).log, a.log);
});

test('значення в межах: потреби 0–1, настрій 0–100, думки без NaN', () => {
  for (const biome of Object.keys(W.BIOMES)) {
    const s = S.replay(C.generateColony('lim' + biome, 10), pl(biome, 'city'), 1, 24 * 12);
    for (let i = 0; i < 10; i++) {
      for (const v of Object.values(s.needs[i])) assert.ok(v >= 0 && v <= 1, biome);
      const m = S.moodOf(s, i); assert.ok(m >= 0 && m <= 100 && Number.isFinite(m));
      for (const p of S.moodParts(s, i)) assert.ok(Number.isFinite(p.v) && p.l);
    }
  }
});

test('місцевість впливає: у джунглях хворіють частіше, ніж у помірному поясі', () => {
  let jungle = 0, mild = 0;
  for (let k = 0; k < 6; k++) { const col = C.generateColony('ill' + k, 10); jungle += S.replay(col, pl('jungle'), 1, 24 * 20).stats.illnesses; mild += S.replay(col, pl('temperate'), 1, 24 * 20).stats.illnesses; }
  assert.ok(jungle > mild, `${jungle} проти ${mild}`);
});

test('хвороби минають: хворі одужують, про одужання є запис у журналі', () => {
  const s = S.replay(C.generateColony('rec', 10), pl('swamp'), 1, 24 * 15);
  assert.ok(s.stats.illnesses > 0); assert.ok(s.log.some(e => e.scope === 'health' && /одужа/.test(e.text)));
  for (const x of s.ill) if (x) assert.ok(W.ILLNESS[x.id]);
});

test('погода змінюється й записується; усі види погоди відомі', () => {
  const s = S.replay(C.generateColony('wt', 6), pl('tundra'), 1, 24 * 10);
  const w = s.log.filter(e => e.scope === 'weather'); assert.ok(w.length >= 5);
  assert.ok(W.WEATHER[s.weather]);
});

test('події трьох видів трапляються й мають авторів у who або глобальні', () => {
  const s = S.replay(C.generateColony('evs', 10), pl('mountain'), 1, 24 * 20), scopes = new Set(s.log.map(e => e.scope));
  for (const k of ['global', 'job', 'person']) assert.ok(scopes.has(k), 'немає ' + k);
  for (const e of s.log) { assert.ok(e.text && ['good', 'bad', 'info'].includes(e.kind)); assert.ok(Array.isArray(e.who)); }
  assert.ok(E.EVENTS.every(x => ['global', 'job', 'person'].includes(x.scope) && x.p > 0));
  assert.ok(E.EVENTS.filter(x => x.scope === 'job').every(x => C.JOBS.some(j => j.id === x.job)));
});

test('стосунки змінюються з часом, типи лишаються коректними, пара не має двох партнерів', () => {
  let changes = 0;
  for (let k = 0; k < 6; k++) {
    const s = S.replay(C.generateColony('rel' + k, 10), pl('temperate'), 1, 24 * 30); changes += s.stats.bondChanges;
    for (const r of s.rel) assert.ok(C.REL[r.type] && r.a < r.b);
    for (let i = 0; i < 10; i++) assert.ok(s.rel.filter(r => (r.a === i || r.b === i) && (r.type === 'couple' || r.type === 'spouse')).length <= 1, 'два партнери');
    for (const x of s.ops.flat()) assert.ok(x >= -100 && x <= 100);
  }
  assert.ok(changes >= 6, 'стосунки майже не мінялись: ' + changes);
});

test('історія колоніста: блоки покривають добу без дірок, події прив’язані до годин', () => {
  const s = S.replay(C.generateColony('his', 8), pl('desert', 'city'), 1, 48), hs = S.history(s, 2, 1);
  assert.equal(hs[0].from, 0); assert.equal(hs[hs.length - 1].to, 24);
  for (let k = 1; k < hs.length; k++) assert.equal(hs[k].from, hs[k - 1].to);
  for (const b of hs) for (const e of b.events) assert.ok(e.who.includes(2) && e.h >= b.from && e.h < b.to);
  assert.deepEqual(S.history(s, 2, 3), []);
});

test('поселення: нормалізація, рандом за зерном, опис проблем', () => {
  assert.deepEqual(W.normPlace({ biome: 'x', kind: 'y' }), { planet: 'Орвелія', biome: 'temperate', kind: 'village' });
  const R1 = C.rngFromSeed('p'), R2 = C.rngFromSeed('p'); assert.deepEqual(W.randomPlace(R1), W.randomPlace(R2));
  for (const b of Object.keys(W.BIOMES)) for (const k of Object.keys(W.KINDS)) assert.ok(W.problemsOf({ biome: b, kind: k }).length >= 2);
});

test('відмінювання імен: орудний, давальний, знахідний, родовий', () => {
  assert.equal(G.inflect('Ратибор', false, 'ins'), 'Ратибором'); assert.equal(G.inflect('Левко', false, 'dat'), 'Левку');
  assert.equal(G.inflect('Гордій', false, 'ins'), 'Гордієм'); assert.equal(G.inflect('Лада', true, 'dat'), 'Ладі');
  assert.equal(G.inflect('Одарка', true, 'dat'), 'Одарці'); assert.equal(G.inflect('Леся', true, 'ins'), 'Лесею'); assert.equal(G.inflect('Меланія', true, 'gen'), 'Меланії');
});

console.log(failed ? `\nПровалено: ${failed} з ${total}` : `\nУсі ${total} тестів пройдено`);
process.exit(failed ? 1 : 0);
