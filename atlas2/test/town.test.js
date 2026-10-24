// Тести детального міста: усі ранги, рівні руйнування, вода, детермінованість, відсутність споруд у воді.
'use strict';
const assert = require('node:assert/strict'), A = require('../core/index.js');
let n = 0, ms = 0;
for (const worldType of ['continent', 'islands']) for (const seed of ['a', 'zbyrai', '7']) {
  const W = A.generate({ seed, worldType, size: 'small' }), ranks = {};
  for (const s of W.settlements) { const key = s.rank + (s.fate || (s.ruined ? 'ruined' : '')) + (s.port ? 'P' : ''); if (ranks[key] >= 2) continue; ranks[key] = (ranks[key] || 0) + 1;
    const t0 = Date.now(), c = A.Town.build(W, s); ms = Math.max(ms, Date.now() - t0); n++;
    const t = `${worldType}/${seed}/${s.name}/${key}`;
    assert.ok(c.buildings.length >= 1, t + ': порожньо'); assert.ok(c.streets.length >= 1, t + ': без вулиць');
    for (const b of c.buildings) assert.ok(c.env.waterKind(b.x, b.y) === 0, t + ': споруда у воді');
    if (c.tier >= 2) assert.ok(c.districts.length >= 2, t + ': мало районів'); if (c.tier === 0) assert.equal(c.districts.length, 0, t + ': хутір з районами');
    const c2 = A.Town.build(W, s); assert.equal(c2.buildings.length, c.buildings.length, t + ': недетерміновано'); assert.equal(c2.buildings[0] && c2.buildings[0].name, c.buildings[0] && c.buildings[0].name);
    if (c.buildings[0]) { const b = c.buildings[0], h = A.Town.hit(c, b.x, b.y); assert.ok(h && A.Town.describe(c, h).title, t + ': опис споруди'); }
    // дороги карти проходять через місто тими самими точками: кожна вершина проспекту лежить на лінії дороги карти
    const CS = W.params.kmPerCell * 1000, segs = []; for (const rd of W.roads) for (let i = 1; i < rd.cells.length; i++) { const a = rd.cells[i - 1], b = rd.cells[i]; segs.push([((a % W.w) + 0.5 - s.x - 0.5) * CS, (((a / W.w) | 0) + 0.5 - s.y - 0.5) * CS, ((b % W.w) + 0.5 - s.x - 0.5) * CS, (((b / W.w) | 0) + 0.5 - s.y - 0.5) * CS]); }
    for (const st of c.streets) if (st.kind === 'avenue') for (let i = 0; i < st.pts.length; i += 2) { let m = 1e9; for (const g of segs) { const d = c.env.segDist(st.pts[i], st.pts[i + 1], g[0], g[1], g[2], g[3]); if (d < m) m = d; } assert.ok(m < 0.5, t + ': проспект відхилився від дороги карти на ' + m); }
    // поля лежать на суходолі й не під спорудами; замковий мур тримається всередині міста
    for (const f of c.fields) { assert.ok(c.env.waterKind(f.x, f.y) === 0, t + ': поле у воді'); for (const b of c.buildings) assert.ok(Math.hypot(b.x - f.x, b.y - f.y) > 3, t + ': поле під спорудою'); }
    if (c.keep) assert.ok(Math.hypot(c.keep.x - c.c0[0], c.keep.y - c.c0[1]) + c.keep.r < c.R * 1.1, t + ': замок за межами міста');
    for (const d of c.districts) assert.ok(A.Town.describe(c, { kind: 'district', o: d }).title);
  }
}
console.log(`town: ${n} міст, найдовше ${ms} мс`);
