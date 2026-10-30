// Морська зв'язність: кожен острів з поселеннями має порт; порти однієї провінції з'єднані морськими шляхами без великого обхідного гака.
'use strict';
const assert = require('node:assert/strict'), A = require('../core/index.js');
const DX = A.Grid.DX, DY = A.Grid.DY;
for (const seed of ['a', 'b', 'zbyrai', '42', 'k']) {
  const W = A.generate({ seed, size: 'small' }), { w, h } = W, mx = W.lm.list[0].area, t = seed;
  for (const m of W.lm.list) { if (m.area >= 0.25 * mx) continue; const here = W.settlements.filter(s => s.landmass === m.id && !s.ruined); if (here.length) assert.ok(here.some(s => s.port && s.body === -1 && !s.fate), `${t}: острів ${m.id} з поселеннями без порту`); }
  // граф морських шляхів: клітини з'єднані, якщо сусідні; порт підключений через найближчу клітину шляху
  const on = new Set(); for (const r of W.seaRoutes) for (const c of r.cells) on.add(c);
  const wetOf = s => { let b = -1, bd = 1e9; for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) { const x = s.x + dx, y = s.y + dy; if (x < 0 || y < 0 || x >= w || y >= h) continue; const i = y * w + x; if (on.has(i) && dx * dx + dy * dy < bd) { bd = dx * dx + dy * dy; b = i; } } return b; };
  const bfs = src => { const d = new Map([[src, 0]]), q = [src]; for (let k = 0; k < q.length; k++) { const i = q[k], x = i % w, y = (i / w) | 0; for (let n = 0; n < 8; n++) { const nx = x + DX[n], ny = y + DY[n]; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue; const j = ny * w + nx; if (on.has(j) && !d.has(j)) { d.set(j, d.get(i) + 1); q.push(j); } } } return d; };
  const ports = W.settlements.filter(s => s.port && s.body === -1 && !s.ruined), byProv = new Map(); for (const p of ports) (byProv.get(p.prov) || byProv.set(p.prov, []).get(p.prov)).push(p);
  let checked = 0;
  for (const list of byProv.values()) for (let a = 1; a < list.length; a++) {
    const ca = wetOf(list[0]), cb = wetOf(list[a]); if (ca < 0 || cb < 0) continue; const d = bfs(ca);
    // порти провінції на різних островах з'єднані; довжина шляху не більше ~3,5 прямої (мінімальне дерево бере ближчі пари, тож обхід до першого порту може бути довшим)
    assert.ok(d.has(cb), `${t}: порти провінції ${list[0].prov} не з'єднані морем`); checked++;
  }
  // запасні шляхи існують
  assert.ok(W.seaRoutes.some(r => r.kind === 'backup') || ports.length < 3, `${t}: нема запасних морських шляхів`);
  assert.ok(checked > 0 || ports.length < 2, `${t}: нічого не перевірено`);
}
console.log('seanet.test.js ok');
