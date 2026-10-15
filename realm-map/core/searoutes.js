// Морські шляхи між портами: корабель тримається поблизу берега (за замовчуванням 2–4 км), у глибини не заходить — там лігва морських монстрів.
(function () {
  'use strict';
  const R = (globalThis.RealmMap = globalThis.RealmMap || {});

  // карта штрафу за близькість до морських лігв
  function seaDangerField(world, lairs) {
    const g = world.grid, f = new Float32Array(g.n);
    for (const l of lairs) {
      if (l.domain !== 'sea') continue;
      const r = l.radius + 1;
      for (let y = Math.max(0, Math.floor(g.cy[l.cell] - r)); y <= Math.min(g.h - 1, Math.ceil(g.cy[l.cell] + r)); y++)
        for (let x = Math.max(0, Math.floor(g.cx[l.cell] - r)); x <= Math.min(g.w - 1, Math.ceil(g.cx[l.cell] + r)); x++) {
          const i = y * g.w + x, d = Math.hypot(g.cx[i] - g.cx[l.cell], g.cy[i] - g.cy[l.cell]); if (d < r) f[i] += 40 * (1 - d / r) + 6;
        }
    }
    return f;
  }

  function buildSeaRoutes(world, p, settlements, lairs) {
    const g = world.grid, ports = settlements.filter(s => s.port), routes = [], pref = p.seaPrefMax, km = p.kmPerCell;
    if (ports.length < 2) return routes;
    const sdf = seaDangerField(world, lairs), best = new Float64Array(g.n), prev = new Int32Array(g.n), stamp = new Int32Array(g.n), nb = new Int32Array(8), H = new R.MinHeap();
    const used = new Uint8Array(g.n); let gen = 0;
    const seaComp = R.Grid.components(g, i => world.water[i] === 1, true);
    const cost = (j, diag) => {
      const ds = world.shore[j];
      let c = ds <= pref ? 1 + 0.15 * (ds - 1) : ds <= pref + 2 ? 3.5 : 10;
      c += sdf[j]; if (used[j]) c *= 0.6;
      return c * (diag ? 1.414 : 1);
    };
    function route(a, b) {
      gen++; H.k.length = 0; H.v.length = 0; best[a] = 0; stamp[a] = gen; prev[a] = -1; H.push(0, a);
      while (H.size) {
        const c = H.pop(), d = H.lastKey; if (d > best[c]) continue; if (c === b) break;
        const cx = c % g.w, cy = (c / g.w) | 0, m = R.Grid.neighbors(g, c, true, nb);
        for (let k = 0; k < m; k++) {
          const j = nb[k]; if (world.water[j] !== 1) continue;
          const nd = d + cost(j, (j % g.w !== cx) && (((j / g.w) | 0) !== cy));
          if (stamp[j] !== gen || nd < best[j]) { stamp[j] = gen; best[j] = nd; prev[j] = c; H.push(nd, j); }
        }
      }
      if (stamp[b] !== gen) return null;
      const cells = []; for (let c = b; c >= 0; c = prev[c]) cells.push(c); return cells.reverse();
    }
    // ребра: у кожному морі — MST за відстанню + найближчі сусіди
    const bySea = new Map();
    for (const s of ports) { const id = seaComp.id[s.dock]; if (id < 0) continue; if (!bySea.has(id)) bySea.set(id, []); bySea.get(id).push(s); }
    const rnd = R.Rng.stream(p.seed, 'sea'), edges = [], seen = new Set();
    const addE = (a, b) => { const k = a.id < b.id ? a.id + '_' + b.id : b.id + '_' + a.id; if (!seen.has(k)) { seen.add(k); edges.push([a, b, R.Grid.dist(g, a.cell, b.cell)]); } };
    for (const list of bySea.values()) {
      if (list.length < 2) continue;
      const cand = []; for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) cand.push([list[i], list[j], R.Grid.dist(g, list[i].cell, list[j].cell)]);
      cand.sort((x, y) => x[2] - y[2]);
      const par = new Map(list.map(s => [s.id, s.id])); const find = x => { while (par.get(x) !== x) x = par.get(x); return x; };
      for (const [a, b] of cand) { const ra = find(a.id), rb = find(b.id); if (ra !== rb) { par.set(ra, rb); addE(a, b); } }
      for (const s of list) { const near = list.filter(o => o !== s).sort((x, y) => R.Grid.dist(g, s.cell, x.cell) - R.Grid.dist(g, s.cell, y.cell)).slice(0, 2); for (const o of near) if (rnd() < 0.4) addE(s, o); }
    }
    edges.sort((x, y) => x[2] - y[2]);
    for (const [a, b] of edges) {
      const cells = route(a.dock, b.dock); if (!cells) continue;
      let len = 0, hug = 0, dmax = 0;
      cells.forEach((c, k) => { used[c] = 1; if (k) len += R.Grid.dist(g, cells[k - 1], c); if (world.shore[c] <= pref) hug++; if (sdf[c] > dmax) dmax = sdf[c]; });
      routes.push({ id: routes.length, from: a.id, to: b.id, cells, lenKm: Math.round(len * km * 10) / 10, hug: Math.round(hug / cells.length * 100) / 100, danger: Math.round(dmax) });
    }
    return routes;
  }
  R.SeaRoutes = { buildSeaRoutes, seaDangerField };
})();
