// Чотири типи доріг. Великі — між центрами регіонів і столицями; середні — від великих до менших міст (у тому числі занепалих і захоплених);
// малі — від великих/середніх до сіл, хуторів, шахт і значних місць; стежки — до дрібних місць, лігв монстрів і через ліси.
(function () {
  'use strict';
  const R = (globalThis.RealmMap = globalThis.RealmMap || {});

  function buildRoads(world, p, settlements, pois, lairs) {
    const g = world.grid, rnd = R.Rng.stream(p.seed, 'roads'), router = R.Router.makeRouter(world), roads = [], L = R.Router.LEVEL, km = p.kmPerCell;
    world.roadLevel = new Uint8Array(g.n);
    const comp = world.landComp.id;
    function commit(cls, res, from, to) {
      const level = L[cls], bridges = []; let len = 0;
      res.cells.forEach((c, k) => {
        if (world.roadLevel[c] < level) world.roadLevel[c] = level;
        if (k > 0) len += R.Grid.dist(g, res.cells[k - 1], c);
        if (world.river[c] && (k === 0 || !world.river[res.cells[k - 1]])) bridges.push(c);
      });
      const r = { id: roads.length, cls, from, to, cells: res.cells, bridges, lenKm: Math.round(len * km * 10) / 10 };
      roads.push(r); return r;
    }
    // вузли великих доріг — центри регіонів
    const centers = settlements.filter(s => s.rank === 'capital' || s.rank === 'regional');
    for (const s of centers) world.roadLevel[s.cell] = Math.max(world.roadLevel[s.cell], L.major);
    // 1. великі дороги: MST з перевагою всередині провінції + 2 зв’язки у столиці + кілька додаткових (кільця)
    const edges = [], key = (a, b) => (a < b ? a + '_' + b : b + '_' + a), seen = new Set();
    const addEdge = (a, b) => { const k = key(a.id, b.id); if (seen.has(k)) return; seen.add(k); edges.push([a, b, R.Grid.dist(g, a.cell, b.cell)]); };
    const cand = [];
    for (let i = 0; i < centers.length; i++) for (let j = i + 1; j < centers.length; j++) {
      const a = centers[i], b = centers[j]; if (comp[a.cell] !== comp[b.cell]) continue;
      cand.push([a, b, R.Grid.dist(g, a.cell, b.cell) * (a.province === b.province ? 0.7 : 1)]);
    }
    cand.sort((x, y) => x[2] - y[2]);
    const uf = new Map(); const find = x => { while (uf.get(x) !== x) { uf.set(x, uf.get(uf.get(x))); x = uf.get(x); } return x; };
    for (const s of centers) uf.set(s.id, s.id);
    for (const [a, b] of cand) { const ra = find(a.id), rb = find(b.id); if (ra !== rb) { uf.set(ra, rb); addEdge(a, b); } }
    const nearest = (s, k, filter) => centers.filter(o => o !== s && comp[o.cell] === comp[s.cell] && filter(o)).sort((a, b) => R.Grid.dist(g, s.cell, a.cell) - R.Grid.dist(g, s.cell, b.cell)).slice(0, k);
    for (const pv of world.provinces) { const cap = settlements[pv.capital]; for (const o of nearest(cap, 2, o => o.province === pv.id)) addEdge(cap, o); }
    for (const s of centers) for (const o of nearest(s, 2, () => true)) if (rnd() < 0.3) addEdge(s, o);
    edges.sort((x, y) => x[2] - y[2]);
    for (const [a, b] of edges) { const res = router.route(a.cell, c => c === b.cell, L.major, 0); if (res) commit('major', res, { t: 's', id: a.id }, { t: 's', id: b.id }); }

    // допоміжне: підключити об’єкт у клітині src до мережі рівня >= minLevel
    function connect(cls, src, minLevel, from, maxCost) {
      let res = router.route(src, c => world.roadLevel[c] >= minLevel, L[cls], maxCost || 0);
      if (!res && cls !== 'trail') res = router.route(src, c => world.roadLevel[c] >= 2, L[cls], maxCost || 0); // острівці без великих доріг
      if (res) commit(cls, res, from, null);
      return !!res;
    }
    const distToNet = (cell, lvl) => { let d = 1e9; for (const r of roads) { if (L[r.cls] < lvl) continue; for (let k = 0; k < r.cells.length; k += 3) { const dd = R.Grid.dist(g, cell, r.cells[k]); if (dd < d) d = dd; } } return d; };
    const byDist = (items, cellOf, lvl) => items.map(o => [o, distToNet(cellOf(o), lvl)]).sort((a, b) => a[1] - b[1] || a[0].id - b[0].id).map(x => x[0]);

    // 2. середні: від великих/середніх до менших міст
    const towns = byDist(settlements.filter(s => s.rank === 'town'), s => s.cell, 3);
    for (const s of towns) if (connect('medium', s.cell, 3, { t: 's', id: s.id })) world.roadLevel[s.cell] = Math.max(world.roadLevel[s.cell], L.medium);
    // 3. малі: села, хутори, шахти, великі місця
    const smallSettle = byDist(settlements.filter(s => s.rank === 'village' || s.rank === 'hamlet' || s.rank === 'mine'), s => s.cell, 3);
    for (const s of smallSettle) connect('minor', s.cell, 3, { t: 's', id: s.id });
    const majors = byDist(pois.filter(o => o.cls === 'major'), o => o.access, 3);
    for (const o of majors) connect('minor', o.access, 3, { t: 'p', id: o.id });
    // 4. стежки: дрібні місця, лігва (і боси: частина прихована), лісові проходи
    const trailChance = { poi: 0.9, lair1: 0.85, lair23: 0.6 };
    const minors = byDist(pois.filter(o => o.cls === 'minor'), o => o.access, 1);
    for (const o of minors) if (rnd() < trailChance.poi) connect('trail', o.access, 1, { t: 'p', id: o.id }, 110);
    const landLairs = byDist(lairs.filter(l => l.domain !== 'sea'), l => l.cell, 1);
    for (const l of landLairs) if (rnd() < (l.tier === 1 ? trailChance.lair1 : trailChance.lair23)) l.trail = connect('trail', l.cell, 1, { t: 'l', id: l.id }, l.tier > 1 ? 220 : 120);
    // лісові проходи між двома дорогами
    const roadCells = []; for (let i = 0; i < g.n; i++) if (world.roadLevel[i] >= 2) roadCells.push(i);
    const forestish = c => { const m = R.Data.biomes[world.bio[c]].mon; return m === 'forest'; };
    let passes = Math.round(world.regions.length * 0.5 * p.density);
    for (let t = 0; passes > 0 && t < passes * 30 && roadCells.length > 10; t++) {
      const a = roadCells[Math.floor(rnd() * roadCells.length)], b = roadCells[Math.floor(rnd() * roadCells.length)], d = R.Grid.dist(g, a, b);
      if (d < 9 || d > 22 || comp[a] !== comp[b]) continue;
      const res = router.route(a, c => c === b, L.trail, 90); if (!res) continue;
      const fo = res.cells.filter(forestish).length; if (fo < res.cells.length * 0.5 || res.cells.length < 8) continue;
      const fresh = res.cells.filter(c => world.roadLevel[c] === 0).length; if (fresh < res.cells.length * 0.6) continue;
      commit('trail', res, { t: 'x', id: -1 }, { t: 'x', id: -1 }).pass = true; passes--;
    }
    return roads;
  }
  R.Roads = { buildRoads };
})();
