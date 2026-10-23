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
    // Дейкстра від джерел до найближчої клітини з isTarget; повертає шлях від цілі до джерела (p[0] — ціль)
    function route(srcs, isTarget) {
      mixA = rr(); mixB = 1 - mixA; wild = 0.5 + 1.6 * rr();
      dist.fill(1e30); prev.fill(-1); heap.k.length = 0; heap.v.length = 0; for (const c of srcs) { dist[c] = 0; heap.push(0, c); }
      while (heap.size) {
        const i = heap.pop(), d0 = dist[i]; if (d0 > 0 && isTarget(i)) { const p = []; for (let c = i; c >= 0; c = prev[c]) p.push(c); return p; }
        const x = i % w, y = (i / w) | 0;
        for (let d = 0; d < 8; d++) {
          const nx = x + DX[d], ny = y + DY[d]; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          const j = ny * w + nx, c = cellCost(j, i, d >= 4); if (c === Infinity) continue;
          const nd = d0 + c; if (nd < dist[j]) { dist[j] = nd; prev[j] = i; heap.push(nd, j); }
        }
      }
      return null;
    }
    // мережа — граф: кожне поселення з'єднується з найближчим уже під'єднаним, що має вільний «слот» (степінь ≤ 3);
    // тому кожна дорога починається і закінчується в місті, а з міста виходить не більше трьох доріг
    const deg = new Map(), dg = id => deg.get(id) || 0, MAXD = 3;
    const dst = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    function connect(s, t, lvl) {
      const p = route([s.i], i => i === t.i); if (!p) return false; p.reverse(); // від s до t
      deg.set(s.id, dg(s.id) + 1); deg.set(t.id, dg(t.id) + 1);
      for (const c of p) { if (!level[c] || lvl < level[c]) level[c] = lvl; if (W.river[c]) bridges.add(c); }
      list.push({ level: lvl, from: s.id, to: t.id, cells: p }); return true;
    }
    const byLm = new Map(); for (const s of S) (byLm.get(s.landmass) || byLm.set(s.landmass, []).get(s.landmass)).push(s);
    for (const group of byLm.values()) {
      group.sort((a, b) => rank(a) - rank(b) || b.pop - a.pop);
      const hub = group[0], connected = [hub];
      const rest = group.slice(1).sort((a, b) => rank(a) - rank(b) || dst(a, hub) - dst(b, hub));
      for (const s of rest) {
        const free = connected.filter(t => dg(t.id) < MAXD), pool = free.length ? free : connected;
        const near = pool.filter(t => rank(t) <= rank(s) || s.rank === 'hamlet').sort((a, b) => dst(a, s) - dst(b, s));
        const cand = near.length ? near : pool.slice().sort((a, b) => dst(a, s) - dst(b, s));
        let ok = false; for (const t of cand.slice(0, 3)) if (connect(s, t, LEVEL[s.rank])) { ok = true; break; }
        if (ok) connected.push(s);
      }
    }
    // додаткові зв'язки: сусідні міста вищого рангу з'єднуються ще й напряму (петлі мережі), якщо в обох є вільний слот
    const linked = new Set(list.map(r => Math.min(r.from, r.to) + '-' + Math.max(r.from, r.to)));
    for (const s of S) {
      if (rank(s) > 2 || rr() < 0.35 || dg(s.id) >= MAXD) continue;
      const cand = S.filter(t => t !== s && t.landmass === s.landmass && rank(t) <= 2 && dg(t.id) < MAXD && dst(t, s) < 40 && !linked.has(Math.min(s.id, t.id) + '-' + Math.max(s.id, t.id))).sort((a, b) => dst(a, s) - dst(b, s));
      const t = cand[Math.floor(rr() * Math.min(2, cand.length))]; if (!t) continue;
      if (connect(s, t, 3)) linked.add(Math.min(s.id, t.id) + '-' + Math.max(s.id, t.id));
    }
    W.roadLevel = level; W.roads = list; W.bridges = Array.from(bridges);
  }
  A.roads = roads;
  (A.stages = A.stages || []).push(roads);
})();
