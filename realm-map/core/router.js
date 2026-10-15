// Маршрутизатор по сітці: Дейкстра з багатьма цілями та вартістю кроку, що залежить від класу дороги.
// Існуючі дороги дешевші, тому нові дороги гуртуються на «магістралях» і розгалужуються від них.
(function () {
  'use strict';
  const R = (globalThis.RealmMap = globalThis.RealmMap || {});
  const LEVEL = { major: 4, medium: 3, minor: 2, trail: 1 };
  const RIVER_PEN = { 4: 5, 3: 4, 2: 3, 1: 2 }; // міст або брід коштує дорожче за суху ділянку

  function makeRouter(world) {
    const g = world.grid, n = g.n, best = new Float64Array(n), prev = new Int32Array(n), stamp = new Int32Array(n), H = new R.MinHeap(), nb = new Int32Array(8);
    let gen = 0;
    const biomes = R.Data.biomes;
    function stepCost(L, a, b, diag) {
      let c = biomes[world.bio[b]].move; if (c === undefined) return Infinity;
      if (L === 4 && c >= 5) c *= 1.6; else if (L === 1) c *= 0.85;
      c += Math.abs(world.height[a] - world.height[b]) * (L >= 3 ? 45 : 30);
      if (world.river[b]) c += RIVER_PEN[L];
      if (L >= 2) c += world.danger[b] / 255 * 6;
      const lv = world.roadLevel[b];
      if (lv) c *= lv > L ? 0.12 : lv === L ? (L >= 3 ? 0.12 : 0.35) : 0.55;
      return c * (diag ? 1.414 : 1);
    }
    // route(src, isTarget, L, maxCost) → { cells: [src..target], cost } | null
    function route(src, isTarget, L, maxCost) {
      gen++; H.k.length = 0; H.v.length = 0;
      best[src] = 0; stamp[src] = gen; prev[src] = -1; H.push(0, src);
      let hit = -1;
      while (H.size) {
        const c = H.pop(), d = H.lastKey;
        if (d > best[c]) continue;
        if (c !== src && isTarget(c)) { hit = c; break; }
        if (maxCost && d > maxCost) break;
        const cx = c % g.w, cy = (c / g.w) | 0, m = R.Grid.neighbors(g, c, true, nb);
        for (let k = 0; k < m; k++) {
          const j = nb[k]; if (world.water[j] !== 0) continue;
          const diag = (j % g.w !== cx) && (((j / g.w) | 0) !== cy);
          const nd = d + stepCost(L, c, j, diag);
          if (stamp[j] !== gen || nd < best[j]) { stamp[j] = gen; best[j] = nd; prev[j] = c; H.push(nd, j); }
        }
      }
      if (hit < 0) return null;
      const cells = []; for (let c = hit; c >= 0; c = prev[c]) cells.push(c);
      cells.reverse(); return { cells, cost: best[hit] };
    }
    return { route, stepCost };
  }
  R.Router = { makeRouter, LEVEL };
})();
