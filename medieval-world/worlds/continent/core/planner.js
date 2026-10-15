// Планувальник подорожі: найшвидший шлях між двома комірками з урахуванням доріг, рельєфу й небезпеки.
(function () {
  'use strict';
  const R = (globalThis.RealmMap = globalThis.RealmMap || {});
  const SPEED = { 4: 34, 3: 28, 2: 22, 1: 14 }; // км/добу пішки по дорогах (рівні 4..1)
  const CLASS_BY_LEVEL = { 4: 'major', 3: 'medium', 2: 'minor', 1: 'trail' };

  // opts: { avoidDanger: 0..1, kmPerCell }. Повертає шлях і підсумок
  function planRoute(world, from, to, opts) {
    opts = opts || {}; const g = world.grid, km = opts.kmPerCell || world.params.kmPerCell, avoid = opts.avoidDanger === undefined ? 0.5 : opts.avoidDanger;
    const best = new Float64Array(g.n).fill(Infinity), prev = new Int32Array(g.n).fill(-1), H = new R.MinHeap(), nb = new Int32Array(8);
    const speedAt = c => { const lv = world.roadLevel[c]; return lv ? SPEED[lv] : (R.Data.biomes[world.bio[c]].speed || 10); };
    best[from] = 0; H.push(0, from);
    while (H.size) {
      const c = H.pop(), d = H.lastKey; if (d > best[c]) continue; if (c === to) break;
      const m = R.Grid.neighbors(g, c, true, nb);
      for (let k = 0; k < m; k++) {
        const j = nb[k]; if (world.water[j] !== 0) continue;
        const dd = R.Grid.dist(g, c, j) * km, sp = (speedAt(c) + speedAt(j)) / 2;
        let t = dd / sp; if (!world.roadLevel[j] && world.river[j]) t *= 2.2; // брід без мосту
        t *= 1 + avoid * world.danger[j] / 40;
        const nd = d + t; if (nd < best[j]) { best[j] = nd; prev[j] = c; H.push(nd, j); }
      }
    }
    if (best[to] === Infinity) return null;
    const cells = []; for (let c = to; c >= 0; c = prev[c]) cells.push(c); cells.reverse();
    let lenKm = 0, days = 0, maxDanger = 0, sumDanger = 0; const byClass = { major: 0, medium: 0, minor: 0, trail: 0, offroad: 0 };
    for (let k = 1; k < cells.length; k++) {
      const a = cells[k - 1], b = cells[k], dd = R.Grid.dist(g, a, b) * km, lv = Math.min(world.roadLevel[a], world.roadLevel[b]);
      lenKm += dd; days += dd / ((speedAt(a) + speedAt(b)) / 2); byClass[lv ? CLASS_BY_LEVEL[lv] : 'offroad'] += dd;
      maxDanger = Math.max(maxDanger, world.danger[b]); sumDanger += world.danger[b];
    }
    const set = new Set(cells), meet = [];
    for (const l of world.lairs) { const r = l.radius; for (const c of cells) { if (R.Grid.dist(g, c, l.cell) <= r) { meet.push(l.id); break; } } }
    const towns = world.settlements.filter(s => cells.some(c => R.Grid.dist(g, c, s.cell) < 1.5) && s.rank !== 'hamlet').map(s => s.id);
    const avgDanger = sumDanger / Math.max(1, cells.length);
    const rating = maxDanger > 160 ? 'смертельна' : maxDanger > 80 ? 'небезпечна' : maxDanger > 20 ? 'насторожена' : 'безпечна';
    for (const k in byClass) byClass[k] = Math.round(byClass[k] * 10) / 10;
    return { cells, lenKm: Math.round(lenKm * 10) / 10, days: Math.round(days * 10) / 10, byClass, maxDanger, avgDanger: Math.round(avgDanger), rating, lairs: meet, towns };
  }
  R.Planner = { planRoute, SPEED };
})();
