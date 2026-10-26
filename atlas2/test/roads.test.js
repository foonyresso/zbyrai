// Тести поселень і доріг.
'use strict';
const assert = require('node:assert/strict'), A = require('../core/index.js');
for (const worldType of ['continent']) for (const seed of ['a', 'b', 'zbyrai', '42', 'k']) {
  const t = `${worldType}/${seed}`, W = A.generate({ seed, worldType, size: 'small' }), w = W.w, S = W.settlements;
  assert.ok(S.length >= W.regions.length, t);
  for (const s of S) { assert.ok(W.land[s.i] && !W.lake[s.i], `${t}: поселення у воді`); assert.equal(W.region[s.i], s.region); if (s.ruined) assert.equal(W.province[s.i], -1, `${t}: руїни в провінції`); }
  for (const g of W.regions) assert.equal(S[g.center].region, g.id, `${t}: центр регіону поза регіоном`);
  // дороги: тільки по суші, сусідні клітини шляху суміжні, жодної по воді
  for (let i = 0; i < W.land.length; i++) if (W.roadLevel[i]) assert.ok(W.land[i] && !W.lake[i], `${t}: дорога по воді`);
  for (const r of W.roads) for (let k = 1; k < r.cells.length; k++) { const a = r.cells[k - 1], b = r.cells[k]; assert.ok(Math.abs((a % w) - (b % w)) <= 1 && Math.abs(((a / w) | 0) - ((b / w) | 0)) <= 1, `${t}: розрив дороги`); }
  // зв'язність: усі поселення одного суходолу лежать в одній мережі доріг (зв'язні клітини з дорогою або поселенням)
  const net = new Int32Array(W.land.length).fill(-1), isNode = new Uint8Array(W.land.length); for (const s of S) isNode[s.i] = 1;
  let nid = 0; for (let i0 = 0; i0 < net.length; i0++) { if (net[i0] >= 0 || !W.roadLevel[i0]) continue; const st = [i0]; net[i0] = nid; while (st.length) { const i = st.pop(), x = i % w, y = (i / w) | 0; for (let d = 0; d < 8; d++) { const nx = x + A.Grid.DX[d], ny = y + A.Grid.DY[d]; if (nx < 0 || ny < 0 || nx >= w || ny >= W.h) continue; const j = ny * w + nx; if (W.roadLevel[j] && net[j] < 0) { net[j] = nid; st.push(j); } } } nid++; }
  const comp = new Map(); for (const s of S) if (!s.ruined) { const k = s.landmass; (comp.get(k) || comp.set(k, new Set()).get(k)).add(net[s.i]); }
  for (const [k, set] of comp) if (S.filter(s => !s.ruined && s.landmass === k).length > 1) assert.ok(set.size === 1 && !set.has(-1), `${t}: суходіл ${k} має ${set.size} роз'єднаних мереж доріг`);
  // морські шляхи лише по океану
  for (const r of W.seaRoutes) for (const c of r.cells) assert.ok(W.ocean[c] || W.lake[c], `${t}: водний шлях по суші`);
}
console.log('roads.test.js ok');
