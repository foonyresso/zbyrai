// Ієрархія: провінції → регіони → міста-центри; столиця має найбільший регіон. Запуск: node medieval-world/worlds/continent/test/hierarchy.test.js
const { R, assert, test, world, SAMPLES, finish } = require('./helpers.js');
console.log('Карта королівств: ієрархія');
for (const params of SAMPLES) {
  const w = world(params), tag = `[${params.seed}/${params.worldType}] `;
  test(tag + 'кожна комірка суші має провінцію й регіон, вода — ні', () => {
    for (let i = 0; i < w.grid.n; i++) {
      if (w.water[i] === 0) { assert.ok(w.province[i] >= 0 && w.region[i] >= 0, 'суша без мітки ' + i); assert.equal(w.regions[w.region[i]].province, w.province[i], 'регіон не в своїй провінції'); }
      else assert.equal(w.region[i], -1);
    }
  });
  test(tag + 'у кожного регіону рівно одне місто-центр, і воно стоїть у своєму регіоні', () => {
    const centers = w.settlements.filter(s => s.rank === 'capital' || s.rank === 'regional');
    assert.equal(centers.length, w.regions.length);
    for (const r of w.regions) { const s = w.settlements[r.center]; assert.ok(s.rank === 'capital' || s.rank === 'regional'); assert.equal(s.region, r.id); assert.equal(w.region[s.cell], r.id); assert.equal(s.state, 'normal'); }
  });
  test(tag + 'столиця провінції — центр найбільшого регіону провінції', () => {
    for (const pv of w.provinces) {
      const caps = w.settlements.filter(s => s.rank === 'capital' && s.province === pv.id);
      assert.equal(caps.length, 1, 'у провінції має бути одна столиця');
      const capRegion = w.regions[caps[0].region];
      for (const rid of pv.regions) if (rid !== capRegion.id) assert.ok(capRegion.cells > w.regions[rid].cells, `${pv.name}: регіон столиці (${capRegion.cells}) не найбільший (${w.regions[rid].cells})`);
    }
  });
  test(tag + 'кількість провінцій відповідає параметру, кожна має ≥ 1 регіон', () => {
    assert.ok(w.provinces.length >= 1 && w.provinces.length <= w.params.provinces);
    assert.ok(w.provinces.length >= Math.min(w.params.provinces, 2) - 0 || w.params.worldType === 'island');
    for (const pv of w.provinces) assert.ok(pv.regions.length >= 1);
  });
  test(tag + 'поселення мають унікальні назви, а їхні комірки — суша', () => {
    const names = new Set(); for (const s of w.settlements) { assert.ok(!names.has(s.name), 'повтор назви ' + s.name); names.add(s.name); assert.equal(w.water[s.cell], 0); }
  });
}
test('рангові поселення мають коректні стани: головні завжди живі', () => {
  const w = world(SAMPLES[0]); for (const s of w.settlements) if (s.rank === 'capital' || s.rank === 'regional') assert.equal(s.state, 'normal');
  const states = new Set(w.settlements.map(s => s.state)); assert.ok(states.has('normal') && states.size >= 3, 'очікується різноманіття станів');
});
finish();
