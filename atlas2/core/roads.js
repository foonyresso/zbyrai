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
    const cellOwner = new Map(); // клітина поселення → поселення
    for (const s of S) cellOwner.set(s.i, s);
    // правило вузла: з міста виходить щонайбільше 3 дороги і лише в різні боки (кут ≥ 60°); решта відгалужується від існуючої дороги на відстані від міста
    const deps = new Map(), D = id => deps.get(id) || deps.set(id, []).get(id);
    const ang = (a, b) => Math.atan2(((b / w) | 0) - ((a / w) | 0), (b % w) - (a % w));
    const adiff = (a, b) => { const d = Math.abs(a - b) % (2 * Math.PI); return d > Math.PI ? 2 * Math.PI - d : d; };
    const conflict = (list, a) => list.length >= 3 || list.some(d => adiff(d.ang, a) < 1.05);
    const tail = list => { const out = []; for (const d of list) for (let k = 4; k < d.cells.length; k++) out.push(d.cells[k]); return out; };
    function connect(s, isTarget, lvl) {
      let p = route([s.i], isTarget); if (!p) return false; p.reverse(); // від s до цілі
      const dS = D(s.id), aS = ang(s.i, p[Math.min(4, p.length - 1)]); let branch = false;
      if (dS.length && conflict(dS, aS)) { const src = tail(dS); if (src.length) { const q = route(src, isTarget); if (q) { p = q.reverse(); branch = true; } } }
      const t = cellOwner.get(p[p.length - 1]);
      if (t && t !== s) {
        const dT = D(t.id), back = p.slice().reverse(), aT = ang(t.i, back[Math.min(4, back.length - 1)]);
        if (dT.length && conflict(dT, aT)) { const near = new Set(tail(dT)), idx = p.findIndex(c => near.has(c)); if (idx > 0) p = p.slice(0, idx + 1); }
        else dT.push({ ang: aT, cells: back });
      }
      if (!branch) dS.push({ ang: aS, cells: p });
      for (const c of p) { if (!level[c] || lvl < level[c]) level[c] = lvl; if (W.river[c]) bridges.add(c); }
      list.push({ level: lvl, from: s.id, to: t ? t.id : -1, cells: p }); return true;
    }
    const byLm = new Map(); for (const s of S) (byLm.get(s.landmass) || byLm.set(s.landmass, []).get(s.landmass)).push(s);
    for (const group of byLm.values()) {
      group.sort((a, b) => rank(a) - rank(b) || b.pop - a.pop);
      const hub = group[0], connected = [hub];
      const rest = group.slice(1).sort((a, b) => rank(a) - rank(b) || Math.hypot(a.x - hub.x, a.y - hub.y) - Math.hypot(b.x - hub.x, b.y - hub.y));
      for (const s of rest) {
        const tcells = new Set(connected.filter(t => rank(t) <= rank(s) || (s.rank === 'hamlet' && rank(t) <= 3)).map(t => t.i));
        if (!tcells.size) connected.forEach(t => tcells.add(t.i));
        if (connect(s, i => tcells.has(i), LEVEL[s.rank])) connected.push(s);
      }
    }
    // додаткові зв'язки: міста з'єднуються не лише деревом, а й сусідніми містами (петлі мережі); тільки якщо вузол ще має вільний напрямок
    const linked = new Set(list.map(r => Math.min(r.from, r.to) + '-' + Math.max(r.from, r.to)));
    for (const s of S) {
      if (rank(s) > 2 || rr() < 0.35 || D(s.id).length >= 3) continue;
      const cand = S.filter(t => t !== s && t.landmass === s.landmass && rank(t) <= 2 && D(t.id).length < 3 && Math.hypot(t.x - s.x, t.y - s.y) < 40 && !linked.has(Math.min(s.id, t.id) + '-' + Math.max(s.id, t.id))).sort((a, b) => Math.hypot(a.x - s.x, a.y - s.y) - Math.hypot(b.x - s.x, b.y - s.y));
      const t = cand[Math.floor(rr() * Math.min(2, cand.length))]; if (!t) continue;
      if (connect(s, i => i === t.i, 3)) linked.add(Math.min(s.id, t.id) + '-' + Math.max(s.id, t.id));
    }
    W.roadLevel = level; W.roads = list; W.bridges = Array.from(bridges);
  }
  A.roads = roads;
  (A.stages = A.stages || []).push(roads);
})();
