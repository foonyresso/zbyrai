// Тести порожніх островів і точок ресурсів.
'use strict';
const assert = require('node:assert/strict'), A = require('../core/index.js');
for (const seed of ['a', 'b', 'zbyrai', '42', 'k']) {
  const W = A.generate({ seed, size: 'small' }), N = W.w * W.h, t = seed;
  // острів з однією провінцією: щонайменше 3 регіони й морський порт, інакше пустий
  const lmProv = new Map(); for (let i = 0; i < N; i++) if (W.province[i] >= 0) (lmProv.get(W.landmass[i]) || lmProv.set(W.landmass[i], new Set()).get(W.landmass[i])).add(W.province[i]);
  for (const [m, ps] of lmProv) if (ps.size === 1 && [...lmProv.values()].filter(q => q.has([...ps][0])).length === 1) { const k = [...ps][0]; assert.ok(W.provinces[k].regions.length >= 3, `${t}: острів ${m} має <3 регіонів`); assert.ok(W.settlements.some(s => s.prov === k && s.port && s.body === -1), `${t}: острів ${m} без порту`); }
  // порожній острів: нічого на ньому нема
  for (const s of W.settlements) if (!s.ruined) assert.ok(lmProv.has(s.landmass), `${t}: поселення на порожньому острові`);
  W.settlements.forEach((s, n) => assert.equal(s.id, n)); W.regions.forEach((g, n) => { assert.equal(g.id, n); assert.equal(W.settlements[g.center].region, n); });
  W.provinces.forEach((p, n) => { assert.equal(p.id, n); assert.equal(W.settlements[p.capital].prov, n); });
  // точки ресурсів: у регіонах, без дублів поряд, без порожніх островів
  assert.ok(W.resources.length > 200, `${t}: мало ресурсів`);
  const seen = new Set(W.resources.map(n => n.type)); for (const must of ['resource.iron', 'resource.oak_grove', 'resource.river_pool', 'resource.meadow_herbs', 'resource.quarry']) assert.ok(seen.has(must), `${t}: нема ${must}`);
  for (const n of W.resources) { const d = A.ResData.byId[n.type]; assert.ok(d); if (d.on !== 'deep') assert.ok(n.region >= 0 && n.region < W.regions.length, `${t}: ресурс поза регіоном`); }
  const byType = new Map(); for (const n of W.resources) (byType.get(n.type) || byType.set(n.type, []).get(n.type)).push(n);
  for (const [id, list] of byType) { const md = Math.max(0.5, A.ResData.byId[id].dist / (W.params.kmPerCell * 1000)); for (let a = 0; a < list.length; a++) for (let b = a + 1; b < list.length; b++) assert.ok(Math.hypot(list[a].x - list[b].x, list[a].y - list[b].y) >= md - 1e-6, `${t}: ${id} надто близько`); }
}
const a = A.generate({ seed: 'q', size: 'small' }), b = A.generate({ seed: 'q', size: 'small' });
assert.deepEqual(a.resources, b.resources);
console.log('resources.test.js ok');
