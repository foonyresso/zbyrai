// Монстри й боси: повні списки, лігва за біомами, море. Запуск: node medieval-world/worlds/continent/test/monsters.test.js
const { R, assert, test, world, SAMPLES, finish } = require('./helpers.js');
console.log('Карта королівств: монстри й боси');
test('списки: гори 16 монстрів і 15 босів, ліси 15 і 15, моря 19 і 20', () => {
  assert.equal(R.Data.mountain.monsters.length, 16); assert.equal(R.Data.mountain.bosses.length, 15);
  assert.equal(R.Data.forest.monsters.length, 15); assert.equal(R.Data.forest.bosses.length, 15);
  assert.equal(R.Data.sea.monsters.length, 19); assert.equal(R.Data.sea.bosses.length, 20);
});
test('у списках немає дублів у межах однієї групи, окрім «буглерів» у горах і лісах', () => {
  for (const d of [R.Data.mountain, R.Data.forest, R.Data.sea]) { assert.equal(new Set(d.monsters).size, d.monsters.length); assert.equal(new Set(d.bosses.map(b => b.n)).size, d.bosses.length); }
  assert.ok(R.Data.mountain.monsters.includes('буглери') && R.Data.forest.monsters.includes('буглери'));
});
test('боси мають рівень 2 або 3', () => { for (const d of [R.Data.mountain, R.Data.forest, R.Data.sea]) for (const b of d.bosses) assert.ok(b.tier === 2 || b.tier === 3, b.n); });
for (const params of SAMPLES) {
  const w = world(params), tag = `[${params.seed}/${params.worldType}] `, g = w.grid, B = R.Data.biomes;
  test(tag + 'сухопутні лігва стоять у своєму біомі й беруть монстрів зі свого списку', () => {
    for (const l of w.lairs.filter(l => l.domain !== 'sea')) {
      assert.equal(B[w.bio[l.cell]].mon, l.domain, 'лігво не в своєму біомі: ' + l.name);
      const d = R.Data[l.domain]; if (l.tier === 1) assert.ok(d.monsters.includes(l.monster)); else assert.ok(d.bosses.some(b => l.monster.startsWith(b.n)), l.monster);
    }
  });
  test(tag + 'морські лігва лише в глибині, далі за смугу кораблів', () => {
    for (const l of w.lairs.filter(l => l.domain === 'sea')) { assert.equal(w.water[l.cell], 1); assert.ok(w.shore[l.cell] >= w.params.seaDeepMin, 'лігво надто близько до берега'); const d = R.Data.sea; if (l.tier === 1) assert.ok(d.monsters.includes(l.monster)); else assert.ok(d.bosses.some(b => b.n === l.monster)); }
  });
  test(tag + 'боси далеко від поселень', () => {
    for (const l of w.lairs.filter(l => l.tier > 1 && l.domain !== 'sea')) for (const s of w.settlements) assert.ok(R.Grid.dist(g, l.cell, s.cell) >= 3, 'бос поруч із ' + s.name);
  });
}
test('є міні-боси й боси на суходолі', () => { const w = world(SAMPLES[0]); assert.ok(w.lairs.some(l => l.tier >= 2 && l.domain !== 'sea')); assert.ok(w.lairs.some(l => l.domain === 'mountain') && w.lairs.some(l => l.domain === 'forest')); });
test('монстри 0 прибирає всі лігва', () => { const w = R.generate({ seed: 'alpha', size: 's', monsters: 0 }); assert.equal(w.lairs.length, 0); });
test('захоплені поселення мають монстрів зі списків або розбійників', () => {
  const w = world(SAMPLES[0]); const all = R.Data.mountain.monsters.concat(R.Data.forest.monsters, ['розбійники', 'нежить', 'банда мародерів', 'культисти']);
  for (const s of w.settlements.filter(s => s.state === 'occupied')) assert.ok(all.includes(s.occupant.name));
});
finish();
