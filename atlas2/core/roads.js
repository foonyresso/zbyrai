// Атлас 2.0, етап 6: дорожня мережа. Від головного до дрібного: столиці → центри регіонів → міста → села → хутори.
// Маршрут шукається по вартості рельєфу; існуючі дороги дешевші, тож нові зливаються з мережею, а не плутаються. Вода: броди й мости.
(function () {
  'use strict';
  const A = globalThis.Atlas2, { DX, DY } = A.Grid, LEVEL = { capital: 1, regional: 1, town: 2, village: 3, hamlet: 4 };

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
      if (W.root && W.root[j]) c *= 0.7; // корені: природні шляхи Астракора
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
    // Принцип: головні дороги — між великими містами (столиці, центри регіонів); середні — від міст до головної мережі або до інших міст;
    // малі — від сіл і хуторів до найближчої дороги будь-якого рангу. Нова дорога кінчається на першій же існуючій (Т-стик) і не дублює її:
    // у мережу додаються лише нові відрізки.
    const dst = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    function commit(p, lvl) { // p — шлях від поселення до цілі; нові відрізки (клітини без дороги) + по одній клітині з боків, щоб стик був у дорозі
      let n = 0, k = 0;
      while (k < p.length) {
        if (level[p[k]]) { k++; continue; }
        let e = k; while (e + 1 < p.length && !level[p[e + 1]]) e++;
        const cells = p.slice(Math.max(0, k - 1), Math.min(p.length, e + 2));
        for (let q = k; q <= e; q++) { level[p[q]] = lvl; if (W.river[p[q]]) bridges.add(p[q]); }
        list.push({ level: lvl, cells }); n += e - k + 1; k = e + 1;
      }
      return n;
    }
    const roadNear = s => { let n = 0; const x = s.i % w, y = (s.i / w) | 0; for (let d = 0; d < 8; d++) { const nx = x + DX[d], ny = y + DY[d]; if (nx >= 0 && ny >= 0 && nx < w && ny < h && level[ny * w + nx]) n++; } return n; };
    function connect(s, isTarget, lvl, minNew) {
      const p = route([s.i], isTarget); if (!p) return false; p.reverse();
      if (minNew) { let n = 0; for (const c of p) if (!level[c]) n++; if (n < minNew) return false; }
      commit(p, lvl); return true;
    }
    const byLm = new Map(); for (const s of S) if (!s.ruined) (byLm.get(s.landmass) || byLm.set(s.landmass, []).get(s.landmass)).push(s);
    for (const group of byLm.values()) {
      group.sort((a, b) => rank(a) - rank(b) || b.pop - a.pop);
      const cellsOf = new Set(); // клітини під'єднаних поселень
      // один етап: поселення групи по порядку «найближче до вже під'єднаних»; ціль — дороги потрібного рангу або під'єднані поселення
      function stage(nodes, maxRoad, maxRank, lvl) {
        const todo = nodes.filter(s => !level[s.i]); for (const s of nodes) if (level[s.i]) cellsOf.add(s.i);
        const con = group.filter(t => cellsOf.has(t.i)), md = new Map();
        for (const s of todo) md.set(s, con.length ? Math.min(...con.map(t => dst(s, t))) : 0);
        while (todo.length) {
          let bi = 0; for (let i = 1; i < todo.length; i++) if (md.get(todo[i]) < md.get(todo[bi])) bi = i;
          const s = todo.splice(bi, 1)[0];
          const conn = s2 => cellsOf.has(s2.i) && rank(s2) <= maxRank;
          const okSet = new Set(group.filter(conn).map(t => t.i));
          if (level[s.i]) { cellsOf.add(s.i); } else if (connect(s, i => (level[i] && level[i] <= maxRoad) || okSet.has(i), lvl)) cellsOf.add(s.i); else continue;
          for (const t of todo) md.set(t, Math.min(md.get(t), dst(t, s)));
        }
      }
      const main = group.filter(s => rank(s) <= 1), mid = group.filter(s => rank(s) === 2), small = group.filter(s => rank(s) > 2);
      cellsOf.add(group[0].i);
      stage(main, 1, 1, 1); stage(mid, 2, 2, 2);
      stage(small.filter(s => s.rank === 'village'), 9, 9, 3); stage(small.filter(s => s.rank === 'hamlet'), 9, 9, 4);
      // близькі міста й села без нормального зв'язку (мережею довше ніж у ~2.2 рази) з'єднуються напряму
      const reach = (a, b, lim) => { const seen = new Set([a]); let fr = [a]; for (let st = 0; st < lim && fr.length; st++) { const nx = []; for (const i of fr) { if (i === b) return true; const x = i % w, y = (i / w) | 0; for (let d = 0; d < 8; d++) { const X = x + DX[d], Y = y + DY[d]; if (X < 0 || Y < 0 || X >= w || Y >= h) continue; const j = Y * w + X; if ((level[j] || j === b) && !seen.has(j)) { seen.add(j); nx.push(j); } } } fr = nx; } return seen.has(b); };
      const near = []; for (let a = 0; a < group.length; a++) for (let b = a + 1; b < group.length; b++) { const s = group[a], t = group[b], r = Math.max(rank(s), rank(t)), lim = r <= 2 ? 18 : r === 3 ? 11 : 0; if (lim && dst(s, t) < lim) near.push([dst(s, t), s, t, r]); }
      near.sort((x, y) => x[0] - y[0]);
      for (const [d, s, t, r] of near) if (!reach(s.i, t.i, Math.ceil(d * 2.2) + 4)) connect(s, i => i === t.i, r <= 2 ? Math.min(LEVEL[s.rank], LEVEL[t.rank]) === 1 && r <= 1 ? 1 : 2 : 3, 3);
      // петлі: сусідні міста вищого рангу з'єднуються ще й напряму, якщо це дає помітний новий відрізок
      for (const s of main.concat(mid)) {
        if (rr() < 0.4 || roadNear(s) >= 3) continue;
        const cand = main.concat(mid).filter(t => t !== s && dst(t, s) < 45 && (rank(s) > 1 || rank(t) <= 1 || rr() < 0.3)).sort((a, b) => dst(a, s) - dst(b, s));
        const t = cand[1 + Math.floor(rr() * 2)] || cand[0]; if (!t || roadNear(t) >= 3) continue;
        connect(s, i => i === t.i, Math.max(LEVEL[s.rank], LEVEL[t.rank]) === 1 ? 1 : 2, 8);
      }
    }
    W.roadLevel = level; W.roads = list; W.bridges = Array.from(bridges);
  }
  A.roads = roads;
  (A.stages = A.stages || []).push(roads);
})();
