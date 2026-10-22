// Раси на «Материку»: поселення мають склад рас, народів немає, решта світу не змінюється. Запуск: node medieval-world/worlds/continent/test/races.test.js
const { R, assert, test, world, SAMPLES, finish } = require('./helpers.js');
console.log('Карта королівств: раси');
test('кожне поселення має склад рас, частки дають 1, народів у даних немає', () => {
  for (const sp of SAMPLES) {
    const w = world(sp);
    for (const pv of w.provinces) assert.ok(!('people' in pv) && !('peopleName' in pv), 'у провінції лишився народ');
    for (const s of w.settlements) { assert.ok(!('people' in s) && !('look' in s), 'у поселенні лишився народ'); assert.ok(s.races && s.races.length >= 1); assert.ok(Math.abs(s.races.reduce((a, r) => a + r.share, 0) - 1) < 0.02); }
  }
});
test('малі поселення вміщають менше рас, ніж центри регіонів', () => {
  const w = world(SAMPLES[4]), n = k => Math.max(...w.settlements.filter(s => s.rank === k).map(s => s.races.length), 0);
  assert.ok(n('hamlet') <= 3 && n('village') <= 5 && n('town') <= 9); assert.ok(n('capital') >= n('town'));
});
test('раси не змінюють решту світу: детермінізм складу', () => {
  const a = R.generate({ seed: 'pp1', size: 's' }), b = R.generate({ seed: 'pp1', size: 's' });
  assert.deepEqual(a.settlements.map(s => [s.name, s.races.map(r => r.id).join()]), b.settlements.map(s => [s.name, s.races.map(r => r.id).join()]));
});
test('експорт містить раси поселень і не містить народів', () => {
  const w = world(SAMPLES[2]), t = R.Serialize.worldToJSON(w), o = JSON.parse(t);
  assert.ok(o.settlements.every(s => Array.isArray(s.races))); assert.ok(!/"people"/.test(t));
});
finish();
