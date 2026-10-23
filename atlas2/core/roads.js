// Атлас 2.0, етап 6: дорожня мережа. Від головного до дрібного: столиці → центри регіонів → міста → села → хутори.
// Маршрут шукається по вартості рельєфу; існуючі дороги дешевші, тож нові зливаються з мережею, а не плутаються. Вода: броди й мости.
(function () {
  'use strict';
  const A = globalThis.Atlas2, { DX, DY } = A.Grid, LEVEL = { capital: 1, regional: 2, town: 3, village: 4, hamlet: 4 };

  function roads(W) {
    const { w, h } = W, N = w * h, S = W.settlements, level = new Uint8Array(N), bridges = new Set(), list = [], big = (W.riverThr || 20) * 5;
    const dist = new Float32Array(N), prev = new Int32Array(N), heap = new A.Heap(), rank = s => A.RANKS.indexOf(s.rank);
    // два гладких поля «примх» рельєфу; кожна дорога змішує їх по-своєму, тож маршрути різні й звивисті, а не однаково найкоротші
    const nzr = A.Noise.make(W.params.seed + '|roads'), F1 = new Float32Array(N), F2 = new Float32Array(N), rr = A.Rng.stream(W.params.seed, 'roads');
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { F1[y * w + x] = nzr.fbm(x * 0.09, y * 0.09, 3); F2[y * w + x] = nzr.fbm(x * 0.05 + 40, y * 0.05 + 70, 3); }
    let mixA = 0.5, mixB = 0.5, wild = 0.8;
    const cellCost = (j, i, diag) => {
      if (W.ocean[j] || W.lake[j]) return Infinity;
      let c = A.BIOMES[W.bio[j]].move + Math.abs(W.elev[j] - W.elev[i]) * 40;
      if (W.river[j]) c += W.acc[j] > big ? 14 : 3;
      c *= 1 + wild * (mixA * F1[j] + mixB * F2[j]);
      if (level[j]) c *= 0.12;
      return c * (diag ? 1.41 : 1);
    };
    // Дейкстра від s до найближчої клітини з isTarget; повертає шлях (від s) або null
    function route(src, isTarget) {
      mixA = rr(); mixB = 1 - mixA; wild = 0.5 + 1.6 * rr();
      dist.fill(1e30); prev.fill(-1); heap.k.length = 0; heap.v.length = 0; dist[src] = 0; heap.push(0, src);
      while (heap.size) {
        const i = heap.pop(); const d0 = dist[i]; if (i !== src && isTarget(i)) { const p = []; for (let c = i; c >= 0; c = prev[c]) p.push(c); return p.reverse().reverse(); }
        const x = i % w, y = (i / w) | 0;
        for (let d = 0; d < 8; d++) {
          const nx = x + DX[d], ny = y + DY[d]; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          const j = ny * w + nx, c = cellCost(j, i, d >= 4); if (c === Infinity) continue;
          const nd = d0 + c; if (nd < dist[j]) { dist[j] = nd; prev[j] = i; heap.push(nd, j); }
        }
      }
      return null;
    }
    const cellOwner = new Map(); // клітина поселення → поселення
    for (const s of S) cellOwner.set(s.i, s);
    const byLm = new Map(); for (const s of S) (byLm.get(s.landmass) || byLm.set(s.landmass, []).get(s.landmass)).push(s);
    for (const group of byLm.values()) {
      group.sort((a, b) => rank(a) - rank(b) || b.pop - a.pop);
      const hub = group[0], connected = [hub];
      const rest = group.slice(1).sort((a, b) => rank(a) - rank(b) || Math.hypot(a.x - hub.x, a.y - hub.y) - Math.hypot(b.x - hub.x, b.y - hub.y));
      for (const s of rest) {
        const lvl = LEVEL[s.rank], tcells = new Set(connected.filter(t => rank(t) <= rank(s) || (s.rank === 'hamlet' && rank(t) <= 3)).map(t => t.i));
        if (!tcells.size) connected.forEach(t => tcells.add(t.i));
        const p = route(s.i, i => tcells.has(i)); if (!p) continue; // шлях: від цілі до s (prev йде назад)
        const to = cellOwner.get(p[0]) || cellOwner.get(p[p.length - 1]);
        for (const c of p) { if (!level[c] || lvl < level[c]) level[c] = lvl; if (W.river[c]) bridges.add(c); }
        list.push({ level: lvl, from: s.id, to: to ? to.id : -1, cells: p }); connected.push(s);
      }
    }
    // додаткові зв'язки: міста з'єднуються не лише деревом, а й сусідніми містами (петлі мережі)
    const linked = new Set(list.map(r => Math.min(r.from, r.to) + '-' + Math.max(r.from, r.to)));
    for (const s of S) {
      if (rank(s) > 2 || rr() < 0.35) continue;
      const cand = S.filter(t => t !== s && t.landmass === s.landmass && rank(t) <= 2 && Math.hypot(t.x - s.x, t.y - s.y) < 30 && !linked.has(Math.min(s.id, t.id) + '-' + Math.max(s.id, t.id))).sort((a, b) => Math.hypot(a.x - s.x, a.y - s.y) - Math.hypot(b.x - s.x, b.y - s.y));
      const t = cand[Math.floor(rr() * Math.min(2, cand.length))]; if (!t) continue;
      const p = route(s.i, i => i === t.i); if (!p) continue;
      for (const c of p) { if (!level[c] || 3 < level[c]) level[c] = Math.min(level[c] || 3, 3); if (W.river[c]) bridges.add(c); }
      list.push({ level: 3, from: s.id, to: t.id, cells: p }); linked.add(Math.min(s.id, t.id) + '-' + Math.max(s.id, t.id));
    }
    W.roadLevel = level; W.roads = list; W.bridges = Array.from(bridges);
  }
  A.roads = roads;
  (A.stages = A.stages || []).push(roads);
})();
