// Тести стежок міст: плавні (без шпильок), на суходолі, не крізь споруди й ставки, кінці у вузлах (дорога, інша стежка, площа, поле), майже всі двори, ферми й поля мають стежку; детермінованість.
'use strict';
const assert = require('node:assert/strict'), A = require('../core/index.js');
const rectHit = (b, x, y, pad) => { const c = Math.cos(b.a), s = Math.sin(b.a), dx = x - b.x, dy = y - b.y; return Math.abs(dx * c + dy * s) <= b.w / 2 + pad && Math.abs(-dx * s + dy * c) <= b.h / 2 + pad; };
const nearest = (p, x, y) => { let m = 1e9; for (let i = 2; i < p.length; i += 2) { const ax = p[i - 2], ay = p[i - 1], dx = p[i] - ax, dy = p[i + 1] - ay, t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1e-9))); m = Math.min(m, Math.hypot(ax + dx * t - x, ay + dy * t - y)); } return m; };
let n = 0, towns = 0, trailsN = 0, nodes = 0, failed = 0, ends = 0, loose = 0, ms = 0;
for (const seed of ['a', 'zbyrai', '7']) {
  const W = A.generate({ seed, worldType: 'continent', size: 'small' }), ranks = {};
  for (const s of W.settlements) { if (s.ruined || s.fate || s.fortress) continue; const key = s.rank; if (ranks[key] >= 2) continue; ranks[key] = (ranks[key] || 0) + 1;
    const t0 = Date.now(), c = A.Town.build(W, s); ms = Math.max(ms, Date.now() - t0); const t = `${seed}/${s.name}/${key}`; towns++;
    assert.ok(Array.isArray(c.trails), t + ': немає trails');
    if (!c.trailStats) continue; nodes += c.trailStats.nodes; failed += c.trailStats.failed;
    const minHw = Math.min(...c.streets.map(q => q.hw));
    c.trails.forEach((tr, ti) => { const p = tr.pts; n++; trailsN++;
      assert.ok(p.length >= 4 && p.every(Number.isFinite), t + ': порожня стежка'); assert.ok(tr.w < minHw * 2, t + ': стежка не вужча за дорогу');
      for (let i = 0; i < p.length; i += 2) { assert.ok(c.env.waterKind(p[i], p[i + 1]) === 0, t + ': стежка у воді');
        if (i > 0) for (const f of c.features) if (f.t === 'pond' && Math.hypot(f.x - p[i], f.y - p[i + 1]) < f.rad * 0.8) assert.fail(t + ': стежка у ставку'); }
      // шпильки: поворот між сусідніми відрізками не більше 100°
      for (let i = 2; i < p.length - 2; i += 2) { const ux = p[i] - p[i - 2], uy = p[i + 1] - p[i - 1], vx = p[i + 2] - p[i], vy = p[i + 3] - p[i + 1], lu = Math.hypot(ux, uy), lv = Math.hypot(vx, vy); if (lu > 0.3 && lv > 0.3) assert.ok((ux * vx + uy * vy) / (lu * lv) > Math.cos(Math.PI * 100 / 180), t + ': шпилька на стежці'); }
      // не крізь споруди: проміжні точки (не двері) поза прямокутниками
      for (let i = 4; i < p.length - 2; i += 2) for (const b of c.buildings) { if (Math.abs(b.x - p[i]) < 40 && Math.abs(b.y - p[i + 1]) < 40) assert.ok(!rectHit(b, p[i], p[i + 1], -0.2), t + ': стежка крізь споруду'); }
      // кінці: дорога, інша стежка, площа, колодязь чи край поля чи місця
      ends++; const e = [p[p.length - 2], p[p.length - 1]];
      let ok = c.streets.some(q => nearest(q.pts, e[0], e[1]) < q.hw + 1.5) || c.trails.some((o, oi) => oi !== ti && nearest(o.pts, e[0], e[1]) < 1.2) || c.plazas.some(f => Math.hypot(f.x - e[0], f.y - e[1]) < f.r + 1.5);
      if (!ok) loose++;
    });
    const c2 = A.Town.build(W, s); assert.equal(c2.trails.length, c.trails.length, t + ': недетерміновано'); assert.deepEqual(c2.trails[0] && c2.trails[0].pts, c.trails[0] && c.trails[0].pts);
  }
}
console.log(`townpaths: ${towns} міст, ${trailsN} стежок, вузлів без стежки ${failed} з ${nodes}, вільних кінців ${loose}, найдовша побудова міста ${ms} мс`);
assert.ok(trailsN > 0, 'жодної стежки'); assert.ok(failed <= nodes * 0.08, 'забагато вузлів без стежки'); assert.ok(loose === 0, 'є стежки, що обриваються без вузла');
