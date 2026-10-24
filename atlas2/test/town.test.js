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
    for (const d of c.districts) assert.ok(A.Town.describe(c, { kind: 'district', o: d }).title);
  }
}
console.log(`town: ${n} міст, найдовше ${ms} мс`);
