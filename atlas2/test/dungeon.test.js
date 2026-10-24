// Тести підземель: детермінованість, зв'язність кімнат, відсутність перетинів по глибині, глибина великих, бос і сходи.
'use strict';
const assert = require('node:assert/strict'), A = require('../core/index.js');
let nd = 0, nbig = 0, nlinks = 0, ms = 0;
for (const seed of ['a', 'zbyrai', '7']) {
  const W = A.generate({ seed, worldType: 'continent', size: 'small' });
  for (const s of W.settlements.filter(q => !q.ruined).slice(0, 14)) {
    const list = A.DungeonPlace.forTown(W, s), t = `${seed}/${s.name}/${s.rank}`;
    if (s.rank === 'town' || s.rank === 'regional' || s.rank === 'capital') assert.ok(list.length >= 1, t + ': місто без підземелля');
    assert.deepEqual(A.DungeonPlace.forTown(W, s).map(d => d.id), list.map(d => d.id));
    for (let i = 0; i < list.length; i++) for (let k = i + 1; k < list.length; k++) { const p = list[i], q = list[k]; if (p.d0 < q.d1 && q.d0 < p.d1) assert.ok(Math.hypot(p.x - q.x, p.y - q.y) >= p.R + q.R, t + ': перетин підземель'); }
    for (const d of list) {
      if (d.size === 'big') { nbig++; assert.ok(list.every(q => q === d || q.size === 'big' || q.depthEnd < d.depth), t + ': велике не глибше'); }
      nlinks += d.links.length; const t0 = Date.now(), D = A.Dungeon.generate(A.DungeonPlace.specOf(W, s, d)); ms = Math.max(ms, Date.now() - t0); nd++;
      assert.equal(D.floors.length, d.floors); assert.deepEqual(A.Dungeon.toJSON(A.Dungeon.generate(A.DungeonPlace.specOf(W, s, d))), A.Dungeon.toJSON(D), t + ': недетерміновано');
      for (const f of D.floors) {
        assert.ok(f.rooms.length >= 3, t + ': мало кімнат'); assert.ok(f.up, t + ': без сходів нагору');
        const seen = new Set([f.rooms[0].id]), adj = {}; for (const c of f.cors) { (adj[c.a] = adj[c.a] || []).push(c.b); (adj[c.b] = adj[c.b] || []).push(c.a); } const st = [f.rooms[0].id]; while (st.length) { const v = st.pop(); for (const u of adj[v] || []) if (!seen.has(u)) { seen.add(u); st.push(u); } }
        assert.equal(seen.size, f.rooms.length, t + ': кімнати не зв’язані');
        if (f.n < D.floors.length - 1) assert.ok(f.down, t + ': без сходів униз');
      }
      assert.ok(D.floors[D.floors.length - 1].monsters.some(m => m.boss), t + ': без боса');
    }
  }
}
console.log(`dungeon: ${nd} підземель (великих ${nbig}, зв’язків ${nlinks}), найдовше ${ms} мс`);
