// Народи й раси на «Материку»: кожна провінція має народ, поселення — склад рас, решта світу не змінюється. Запуск: node medieval-world/worlds/continent/test/peoples.test.js
const { R, assert, test, world, SAMPLES, finish } = require('./helpers.js');
console.log('Карта королівств: народи й раси');
test('кожна провінція має народ, кожне поселення — народ провінції й склад рас', () => {
  for (const sp of SAMPLES) {
    const w = world(sp);
    for (const pv of w.provinces) assert.ok(pv.people && pv.peopleName, 'провінція без народу');
    for (const s of w.settlements) { assert.equal(s.people, w.provinces[s.province].people); assert.ok(s.races && s.races.length >= 1); assert.ok(Math.abs(s.races.reduce((a, r) => a + r.share, 0) - 1) < 0.02); }
  }
});
test('малі поселення вміщають менше рас, ніж центри регіонів', () => {
  const w = world(SAMPLES[4]), n = k => Math.max(...w.settlements.filter(s => s.rank === k).map(s => s.races.length), 0);
  assert.ok(n('hamlet') <= 3 && n('village') <= 5 && n('town') <= 9); assert.ok(n('capital') >= n('town'));
});
test('народи різноманітні: у великому світі більше одного народу', () => { assert.ok(new Set(world(SAMPLES[4]).provinces.map(p => p.people)).size >= 2); });
test('народи не змінюють решту світу: біоми, назви й дороги ті самі, детермінізм', () => {
  const a = R.generate({ seed: 'pp1', size: 's' }), b = R.generate({ seed: 'pp1', size: 's' });
  assert.deepEqual(a.settlements.map(s => [s.name, s.people, s.races.map(r => r.id).join()]), b.settlements.map(s => [s.name, s.people, s.races.map(r => r.id).join()]));
});
test('експорт містить народи провінцій і раси поселень', () => {
  const w = world(SAMPLES[2]), o = JSON.parse(R.Serialize.worldToJSON(w));
  assert.ok(o.provinces.every(p => p.people)); assert.ok(o.settlements.every(s => Array.isArray(s.races)));
});
finish();
