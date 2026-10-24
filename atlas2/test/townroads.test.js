// Тести вуличної мережі міст: без самоперетинів і накладань, без шпильок, без доріг крізь місця й воду, кінці стежок у вузлах.
'use strict';
const assert = require('node:assert/strict'), A = require('../core/index.js'), segInt = A.TownRoads.segInt;
let n = 0, bad = { cross: 0, turn: 0, over: 0, site: 0, water: 0, ends: 0 };
const vt = (st, i) => [st.pts[i * 2], st.pts[i * 2 + 1]];
for (const worldType of ['continent', 'islands']) for (const seed of ['a', 'zbyrai', '7', 'oqmeyg']) {
  const W = A.generate({ seed, worldType, size: 'small' });
  for (const s of W.settlements) { if (s.ruined || s.rank === 'hamlet') continue; const c = A.Town.build(W, s), t = `${worldType}/${seed}/${s.name}/${s.rank}`, S = c.streets; n++;
    // 1. перетини: жодного внутрішнього перетину відрізків різних (і однієї) вулиці
    const segs = []; S.forEach((st, si) => { for (let i = 1; i < st.pts.length / 2; i++) { const a = vt(st, i - 1), b = vt(st, i); segs.push({ si, i, a, b }); } });
    for (let p = 0; p < segs.length; p++) for (let q = p + 1; q < segs.length; q++) { const u = segs[p], v = segs[q]; if (u.si === v.si && (Math.abs(u.i - v.i) < 3 || (S[u.si].kind === 'ring' && (u.i < 3 || v.i > S[u.si].pts.length / 2 - 3)))) continue; if (Math.min(u.a[0], u.b[0]) > Math.max(v.a[0], v.b[0]) || Math.max(u.a[0], u.b[0]) < Math.min(v.a[0], v.b[0]) || Math.min(u.a[1], u.b[1]) > Math.max(v.a[1], v.b[1]) || Math.max(u.a[1], u.b[1]) < Math.min(v.a[1], v.b[1])) continue; assert.ok(!segInt(u.a[0], u.a[1], u.b[0], u.b[1], v.a[0], v.a[1], v.b[0], v.b[1]), `${t}: перетин ${S[u.si].name} × ${S[v.si].name}`); }
    for (const st of S) {
      // 2. шпильки: поворот між сусідніми відрізками не більше 110° (вулиці, провулки, стежки)
      if (st.kind === 'street' || st.kind === 'lane' || st.kind === 'path') for (let i = 1; i < st.pts.length / 2 - 1; i++) { const a = vt(st, i - 1), b = vt(st, i), d = vt(st, i + 1), ux = b[0] - a[0], uy = b[1] - a[1], vx = d[0] - b[0], vy = d[1] - b[1], lu = Math.hypot(ux, uy), lv = Math.hypot(vx, vy); if (lu < 1.5 || lv < 1.5) continue; assert.ok((ux * vx + uy * vy) / (lu * lv) > Math.cos(Math.PI * 0.62), `${t}: шпилька на ${st.name}`); }
      // 3. вода: вершини без мосту на суходолі
      if (st.kind !== 'embankment' && st.kind !== 'avenue') for (let i = 0; i < st.pts.length / 2; i++) if (!st.br[i]) assert.ok(c.env.waterKind(st.pts[i * 2], st.pts[i * 2 + 1]) !== 2, `${t}: ${st.name} у воді`);
      // 4. місця: відрізки не заходять у цвинтарі й інші місця (крім власної цілі)
      if (st.kind !== 'embankment') for (let i = 1; i < st.pts.length / 2; i++) { if (st.br[i]) continue; const a = vt(st, i - 1), b = vt(st, i), mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2; for (const f of c.features) if (f.t === 'site' && f.name !== st.to) assert.ok(Math.hypot(f.x - mx, f.y - my) > f.r * 0.7, `${t}: ${st.name} через «${f.name}»`); }
    }
    // 5. дублі: більше половини вулиці не лежить на іншій
    for (const st of S) { if (st.kind === 'avenue' || st.kind === 'ring' || st.kind === 'embankment' || st.pts.length < 10) continue; let tot = 0, on = 0; for (let i = 1; i < st.pts.length / 2; i++) { const a = vt(st, i - 1), b = vt(st, i), L = Math.hypot(b[0] - a[0], b[1] - a[1]); for (let k = 0; k < L; k += 5) { const x = a[0] + (b[0] - a[0]) * k / L, y = a[1] + (b[1] - a[1]) * k / L; tot++; let hit = false; for (const o of S) { if (o === st) continue; for (let j = 1; j < o.pts.length / 2 && !hit; j++) { const p = vt(o, j - 1), q = vt(o, j); if (c.env.segDist(x, y, p[0], p[1], q[0], q[1]) < 1.6) hit = true; } if (hit) break; } if (hit) on++; } } assert.ok(on / tot < 0.5, `${t}: ${st.name} дублює іншу вулицю`); }
    // 6. кінці стежок: у вузлі іншої вулиці або біля свого місця
    for (const st of S) { if (st.kind !== 'path') continue; for (const end of [0, 1]) { const p = vt(st, end ? st.pts.length / 2 - 1 : 0); let ok = c.features.some(f => f.t === 'site' && Math.hypot(f.x - p[0], f.y - p[1]) < f.r * 1.6) || c.features.some(f => f.t === 'plaza' && Math.hypot(f.x - p[0], f.y - p[1]) < f.r + 6); for (const o of S) { if (o === st || ok) continue; for (let j = 0; j < o.pts.length / 2; j++) { const q = vt(o, j); if (Math.hypot(q[0] - p[0], q[1] - p[1]) < 1.5) { ok = true; break; } } } if (!ok) { bad.ends++; } } }
  }
}
console.log(`townroads: ${n} міст, вільних кінців стежок ${bad.ends}`);
assert.ok(bad.ends <= n * 0.25, 'забагато вільних кінців стежок');
