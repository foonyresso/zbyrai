// Тести поселень і доріг.
'use strict';
const assert = require('node:assert/strict'), A = require('../core/index.js');
for (const worldType of ['continent', 'islands']) for (const seed of ['a', 'b', 'zbyrai', '42', 'k']) {
  const t = `${worldType}/${seed}`, W = A.generate({ seed, worldType, size: 'small' }), w = W.w, S = W.settlements;
  assert.ok(S.length >= W.regions.length, t);
  for (const s of S) { assert.ok(W.land[s.i] && !W.lake[s.i], `${t}: поселення у воді`); assert.equal(W.region[s.i], s.region); }
  for (const g of W.regions) assert.equal(S[g.center].region, g.id, `${t}: центр регіону поза регіоном`);
  // дороги: тільки по суші, сусідні клітини шляху суміжні, жодної по воді
  for (let i = 0; i < W.land.length; i++) if (W.roadLevel[i]) assert.ok(W.land[i] && !W.lake[i], `${t}: дорога по воді`);
  for (const r of W.roads) for (let k = 1; k < r.cells.length; k++) { const a = r.cells[k - 1], b = r.cells[k]; assert.ok(Math.abs((a % w) - (b % w)) <= 1 && Math.abs(((a / w) | 0) - ((b / w) | 0)) <= 1, `${t}: розрив дороги`); }
  // зв'язність: усі поселення одного суходолу з'єднані дорогами в одну мережу
  const par = S.map((_, i) => i), f = x => par[x] === x ? x : (par[x] = f(par[x]));
  for (const r of W.roads) if (r.to >= 0) par[f(r.from)] = f(r.to);
  const comp = new Map(); for (const s of S) { const k = s.landmass; (comp.get(k) || comp.set(k, new Set()).get(k)).add(f(s.id)); }
  for (const [k, set] of comp) assert.equal(set.size, 1, `${t}: суходіл ${k} має ${set.size} роз'єднаних мереж доріг`);
  // морські шляхи лише по океану
  for (const r of W.seaRoutes) for (const c of r.cells) assert.ok(W.ocean[c] || W.lake[c], `${t}: водний шлях по суші`);
}
console.log('roads.test.js ok');
