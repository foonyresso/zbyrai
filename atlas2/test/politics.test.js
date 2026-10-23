// Тести провінцій і регіонів.
'use strict';
const assert = require('node:assert/strict'), A = require('../core/index.js'), { components } = A.Grid;
for (const worldType of ['continent', 'islands']) for (const seed of ['a', 'b', 'zbyrai', '42', 'k']) {
  const t = `${worldType}/${seed}`, W = A.generate({ seed, worldType, size: 'small' }), N = W.w * W.h;
  assert.ok(W.provinces.length >= 1, t);
  const owned = new Set(); for (let i = 0; i < N; i++) if (W.province[i] >= 0) owned.add(W.landmass[i]);
  for (let i = 0; i < N; i++) if (W.land[i] && !W.lake[i] && !owned.has(W.landmass[i])) assert.equal(W.region[i], -1, `${t}: нічия земля має регіон`); // нічиї острови без провінцій
  for (let i = 0; i < N; i++) if (W.land[i] && !W.lake[i] && owned.has(W.landmass[i])) { assert.ok(W.region[i] >= 0, `${t}: суша без регіону`); assert.equal(W.province[i], W.regions[W.region[i]].prov, `${t}: регіон виходить за провінцію`); } else if (W.ocean[i]) assert.equal(W.region[i], -1);
  const area = new Array(W.regions.length).fill(0); for (let i = 0; i < N; i++) if (W.region[i] >= 0) area[W.region[i]]++;
  for (const p of W.provinces) {
    assert.ok(p.regions.length >= 1);
    const cap = W.regions.find(g => g.prov === p.id && g.isCapitalRegion); assert.ok(cap, `${t}: нема регіону столиці`);
    // регіон столиці найбільший серед регіонів провінції на тому ж суходолі (допуск 30% через згладжування)
    const mx = Math.max(...p.regions.filter(id => W.landmass[W.regions[id].centerCell] === W.landmass[cap.centerCell]).map(id => area[id])); assert.ok(p.regions.reduce((a, id) => a + area[id], 0) < 600 || area[cap.id] >= mx * 0.7, `${t}: регіон столиці не найбільший`);
  }
  // провінція зв'язна в межах суходолу: у кожної провінції не більше 1 уламка <25 клітин на суходіл
  for (const p of W.provinces) { const c = components(W.w, W.h, i => W.province[i] === p.id); for (let k = 0; k < c.sizes.length; k++) if (c.sizes[k] < 25 && c.sizes[k] > 3) { const cell = c.id.indexOf(k); if (W.province[cell] !== p.id) continue; const lmA = W.lm.list.find(m => m.id === W.landmass[cell]).area; if (lmA < 40) continue; assert.equal(lmA, c.sizes[k], `${t}: дрібний уламок провінції ${p.id}, що не є окремим островом`); } }
}
const a = A.generate({ seed: 'q', size: 'small' }), b = A.generate({ seed: 'q', size: 'small' });
assert.deepEqual(Array.from(a.region), Array.from(b.region));
console.log('politics.test.js ok');
// у кожній провінції не менше 3 регіонів (якщо провінція має понад 300 клітин)
for (const seed of ['a', 'b', 'zbyrai', '42', 'k']) {
  const W = A.generate({ seed, size: 'small' }), N = W.w * W.h, pa = new Array(W.provinces.length).fill(0);
  for (let i = 0; i < N; i++) if (W.province[i] >= 0) pa[W.province[i]]++;
  for (const p of W.provinces) if (pa[p.id] >= 300) assert.ok(p.regions.length >= 3, `${seed}: провінція ${p.id} має ${p.regions.length} регіонів`);
}
console.log('min 3 regions ok');
