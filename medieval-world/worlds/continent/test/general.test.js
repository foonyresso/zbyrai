// Загальне: детермінізм, експорт/імпорт, планувальник подорожі. Запуск: node medieval-world/worlds/continent/test/general.test.js
const { R, assert, test, world, SAMPLES, finish } = require('./helpers.js');
console.log('Карта королівств: загальне');
test('те саме зерно дає той самий світ, інше — інший', () => {
  const a = R.generate({ seed: 'x1', size: 's' }), b = R.generate({ seed: 'x1', size: 's' }), c = R.generate({ seed: 'x2', size: 's' });
  assert.deepEqual(Array.from(a.bio), Array.from(b.bio)); assert.deepEqual(a.stats, b.stats); assert.equal(a.settlements[0].name, b.settlements[0].name);
  assert.notDeepEqual(Array.from(a.bio), Array.from(c.bio));
});
test('параметри нормалізуються: сміття замінюється значеннями за замовчуванням', () => {
  const p = R.Params.normalize({ size: 'zz', provinces: 'abc', density: -5, worldType: 'q', seed: '' });
  assert.equal(p.size, 'm'); assert.ok(p.density >= 0.3); assert.equal(p.worldType, 'continent'); assert.ok(p.seed.length > 0);
});
test('параметри JSON → ті самі параметри; чужий файл відхиляється', () => {
  const w = world(SAMPLES[0]), back = R.Serialize.paramsFromJSON(R.Serialize.paramsToJSON(w.params)); assert.deepEqual(back, w.params);
  assert.throws(() => R.Serialize.paramsFromJSON('{"a":1}'));
});
test('повний експорт світу розбирається назад, RLE шарів без втрат', () => {
  const w = world(SAMPLES[2]), o = JSON.parse(R.Serialize.worldToJSON(w));
  assert.equal(o.settlements.length, w.settlements.length); assert.equal(o.roads.length, w.roads.length);
  assert.deepEqual(R.Serialize.unrle(o.layers.region), Array.from(w.region)); assert.deepEqual(R.Serialize.unrle(o.layers.biome), Array.from(w.bio));
});
test('CSV поселень має рядок на кожне поселення', () => { const w = world(SAMPLES[2]); assert.equal(R.Serialize.settlementsCSV(w).split('\n').length, w.settlements.length + 1); });
test('планувальник: шлях між столицями по дорогах, швидший за шлях навпростець', () => {
  const w = world(SAMPLES[1]), caps = w.settlements.filter(s => s.rank === 'capital'); assert.ok(caps.length >= 2);
  let pair = null; for (const a of caps) for (const b of caps) if (a !== b && w.landComp.id[a.cell] === w.landComp.id[b.cell]) pair = [a, b];
  assert.ok(pair, 'потрібні дві столиці на одному суходолі');
  const r = R.Planner.planRoute(w, pair[0].cell, pair[1].cell, { avoidDanger: 0.5 }); assert.ok(r && r.days > 0 && r.lenKm > 0);
  const sum = Object.values(r.byClass).reduce((a, b) => a + b, 0); assert.ok(Math.abs(sum - r.lenKm) < 0.5);
  assert.ok(r.byClass.major + r.byClass.medium + r.byClass.minor > r.byClass.offroad, 'шлях має йти переважно дорогами');
  assert.equal(R.Planner.planRoute(w, pair[0].cell, w.grid.n - 1) === null || w.water[w.grid.n - 1] === 0, true);
});
test('планувальник: обхід небезпеки не робить шлях небезпечнішим', () => {
  const w = world(SAMPLES[0]), s = w.settlements.filter(s => s.rank === 'regional' || s.rank === 'capital');
  let n = 0; for (let i = 0; i < s.length && n < 6; i++) for (let j = i + 1; j < s.length && n < 6; j++) if (w.landComp.id[s[i].cell] === w.landComp.id[s[j].cell]) {
    const a = R.Planner.planRoute(w, s[i].cell, s[j].cell, { avoidDanger: 0 }), b = R.Planner.planRoute(w, s[i].cell, s[j].cell, { avoidDanger: 1 }); assert.ok(b.avgDanger <= a.avgDanger + 1); n++;
  }
  assert.ok(n > 0);
});
test('усі біоми мають назву й колір; поверхня різноманітна', () => {
  const w = world(SAMPLES[0]); const ids = new Set(Array.from(w.bio).map(b => R.Data.biomes[b].id)); for (const b of R.Data.biomes) assert.ok(b.name && b.color);
  for (const id of ['deep', 'sea', 'grass', 'forest', 'hills', 'mountain']) assert.ok(ids.has(id), 'немає біому ' + id);
});
test('контури: берег дає замкнені лінії, межі провінцій — лише між сушею', () => {
  const w = world(SAMPLES[2]), g = w.grid, coast = R.Contours.lines(g, (a, b) => (w.water[a] === 0) !== (w.water[b] === 0));
  assert.ok(coast.length > 0 && coast.some(l => l.closed)); for (const l of coast) assert.ok(l.pts.length >= 4);
  const borders = R.Contours.lines(g, (a, b) => w.province[a] >= 0 && w.province[b] >= 0 && w.province[a] !== w.province[b]); assert.ok(borders.length > 0 || w.provinces.length === 1);
  const sm = R.Contours.chaikin(Float32Array.from([0, 0, 4, 0, 4, 4]), false, 2); assert.equal(sm[0], 0); assert.equal(sm[sm.length - 1], 4); assert.ok(sm.length > 6);
});
test('генерація швидка: велика карта < 5 с', () => { const t = Date.now(); R.generate({ seed: 'perf', size: 'l' }); assert.ok(Date.now() - t < 5000); });
finish();
