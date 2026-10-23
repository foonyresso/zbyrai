// Атлас 2.0, етап 7: морські шляхи між портами різних суходолів (дороги по воді не прокладаються).
(function () {
  'use strict';
  const A = globalThis.Atlas2, { DX, DY } = A.Grid;
  function searoutes(W) {
    const { w, h } = W, N = w * h, S = W.settlements, ports = S.filter(s => s.port), routes = [];
    const byLm = new Map(); for (const s of ports) (byLm.get(s.landmass) || byLm.set(s.landmass, []).get(s.landmass)).push(s);
    const lms = Array.from(byLm.keys()); if (lms.length < 2) { W.seaRoutes = routes; return; }
    const dist = new Float32Array(N), prev = new Int32Array(N), heap = new A.Heap();
    // океанська клітина біля порту
    const wet = s => { let b = -1, bd = 1e9; for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) { const x = s.x + dx, y = s.y + dy; if (x >= 0 && y >= 0 && x < w && y < h && W.ocean[y * w + x] && dx * dx + dy * dy < bd) { bd = dx * dx + dy * dy; b = y * w + x; } } return b; };
    function sea(a, bcell) {
      dist.fill(1e30); prev.fill(-1); heap.k.length = 0; heap.v.length = 0; dist[a] = 0; heap.push(0, a);
      while (heap.size) {
        const i = heap.pop(); if (i === bcell) { const p = []; for (let c = i; c >= 0; c = prev[c]) p.push(c); return p.reverse(); }
        const x = i % w, y = (i / w) | 0;
        for (let d = 0; d < 8; d++) { const nx = x + DX[d], ny = y + DY[d]; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue; const j = ny * w + nx; if (!W.ocean[j]) continue; const nd = dist[i] + (d >= 4 ? 1.41 : 1) * (W.landDistNear && W.landDistNear[j] ? 1 : 1); if (nd < dist[j]) { dist[j] = nd; prev[j] = i; heap.push(nd, j); } }
      }
      return null;
    }
    // Прім по суходолах: кожен суходіл з'єднується з найближчим уже з'єднаним
    const done = [lms[0]], todo = lms.slice(1);
    while (todo.length) {
      let best = null;
      for (const t of todo) for (const a of byLm.get(t)) for (const lm of done) for (const b of byLm.get(lm)) { const d = Math.hypot(a.x - b.x, a.y - b.y); if (!best || d < best.d) best = { d, a, b, t }; }
      todo.splice(todo.indexOf(best.t), 1); done.push(best.t);
      const ca = wet(best.a), cb = wet(best.b); if (ca < 0 || cb < 0) continue;
      const p = sea(ca, cb); if (p) routes.push({ from: best.a.id, to: best.b.id, cells: p });
    }
    W.seaRoutes = routes;
  }
  A.searoutes = searoutes;
  (A.stages = A.stages || []).push(searoutes);
})();
