// Атлас 2.0, етап 5: поселення (столиці, центри регіонів, міста, села, хутори), назви, зведення по регіонах і провінціях.
(function () {
  'use strict';
  const A = globalThis.Atlas2, { DX, DY } = A.Grid;
  const RANKS = ['capital', 'regional', 'town', 'village', 'hamlet'];
  const POP = { capital: [14000, 38000], regional: [3500, 13000], town: [900, 3200], village: [120, 650], hamlet: [20, 110] };
  const MIND = { town: 24, village: 14, hamlet: 9 }; // мінімальні відстані в клітинах (1 клітина = 2 км); кожному поселенню — випадковий множник

  function settlements(W) {
    const { w, h } = W, N = w * h, r = A.Rng.stream(W.params.seed, 'settle'), names = A.Names.make(W.params.seed), S = [], buckets = new Map();
    const bk = (x, y) => ((y / 8) | 0) * 1000 + ((x / 8) | 0);
    const near = (x, y, d) => { for (let by = Math.floor((y - d) / 8); by <= Math.floor((y + d) / 8); by++) for (let bx = Math.floor((x - d) / 8); bx <= Math.floor((x + d) / 8); bx++) for (const s of buckets.get(by * 1000 + bx) || []) if (Math.hypot(s.x - x, s.y - y) < d) return true; return false; };
    function add(i, rank) {
      const x = i % w, y = (i / w) | 0, pr = POP[rank]; let coast = 0;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const nx = x + dx, ny = y + dy; if (nx >= 0 && ny >= 0 && nx < w && ny < h && W.ocean[ny * w + nx]) coast = 1; }
      const s = { id: S.length, name: names.town(), rank, i, x, y, prov: W.province[i], region: W.region[i], landmass: W.landmass[i], port: coast && RANKS.indexOf(rank) <= 2, river: false, pop: Math.round(pr[0] + (pr[1] - pr[0]) * Math.pow(r(), 1.5)) };
      for (let d = 0; d < 8; d++) { const nx = x + DX[d], ny = y + DY[d]; if (nx >= 0 && ny >= 0 && nx < w && ny < h && W.river[ny * w + nx]) s.river = true; }
      S.push(s); const k = bk(x, y); (buckets.get(k) || buckets.set(k, []).get(k)).push(s); return s;
    }
    // провінції й регіони: назви, центри
    W.provinces.forEach(p => { p.name = names.province(); });
    W.regions.forEach(g => { g.name = names.region(); const s = add(g.centerCell, g.isCapitalRegion ? 'capital' : 'regional'); g.center = s.id; g.centerName = s.name; if (g.isCapitalRegion) W.provinces[g.prov].capital = s.id; });
    // міста, села, хутори: за придатністю з мінімальними відстанями
    const byRegion = W.regions.map(() => []);
    for (let i = 0; i < N; i++) if (W.region[i] >= 0 && W.land[i] && !W.lake[i] && !W.river[i] && W.suit[i] >= 0.12) byRegion[W.region[i]].push(i);
    const DIV = { town: 330, village: 120, hamlet: 220 };
    for (const rank of ['town', 'village', 'hamlet']) W.regions.forEach(g => {
      const cells = byRegion[g.id], want = Math.round(cells.length / DIV[rank] * W.params.density * (0.8 + 0.4 * r()));
      const sc = cells.map(i => [Math.pow(W.suit[i], 0.4) * (0.25 + r()) * (W.waterDist && W.waterDist[i] <= 2 && !W.river[i] ? 0.5 : 1), i]).sort((a, b) => b[0] - a[0]); let got = 0;
      for (const [, i] of sc) { if (got >= want) break; const x = i % w, y = (i / w) | 0; if (near(x, y, MIND[rank] * (0.7 + 0.7 * r()))) continue; add(i, rank); got++; }
    });
    // зведення
    const regs = W.regions.map(g => ({ area: 0, bio: {} }));
    for (let i = 0; i < N; i++) if (W.region[i] >= 0) { const a = regs[W.region[i]]; a.area++; a.bio[W.bio[i]] = (a.bio[W.bio[i]] || 0) + 1; }
    W.regions.forEach((g, k) => { g.area = regs[k].area; g.pop = 0; const top = Object.entries(regs[k].bio).sort((a, b) => b[1] - a[1]).slice(0, 2).map(e => A.BIOMES[+e[0]].name); g.terrain = top.join(' та ').toLowerCase().replace(/^./, c => c.toUpperCase()); });
    for (const s of S) { W.regions[s.region].pop += s.pop; }
    const maxPop = Math.max(1, ...W.regions.map(g => g.pop));
    W.regions.forEach(g => { g.level = Math.max(1, Math.round(1 + 9 * g.pop / maxPop)); });
    W.provinces.forEach(p => { p.pop = 0; p.area = 0; for (const id of p.regions) { p.pop += W.regions[id].pop; p.area += W.regions[id].area; } });
    W.settlements = S;
    labelAnchors(W);
  }
  // точка підпису: клітина області, найближча до центра найбільшої зв'язної частини
  function labelAnchors(W) {
    const { w, h } = W, put = (obj, test) => {
      const c = A.Grid.components(w, h, test); if (!c.sizes.length) return; let big = 0; c.sizes.forEach((s, k) => { if (s > c.sizes[big]) big = k; });
      let cx = 0, cy = 0, n = 0; for (let i = 0; i < w * h; i++) if (c.id[i] === big) { cx += i % w; cy += (i / w) | 0; n++; } cx /= n; cy /= n;
      let best = -1, bd = 1e9; for (let i = 0; i < w * h; i++) if (c.id[i] === big) { const d = Math.hypot((i % w) - cx, ((i / w) | 0) - cy); if (d < bd) { bd = d; best = i; } }
      obj.label = { x: (best % w) + 0.5, y: ((best / w) | 0) + 0.5, size: n };
    };
    W.provinces.forEach(p => put(p, i => W.province[i] === p.id));
    W.regions.forEach(g => put(g, i => W.region[i] === g.id));
  }
  A.RANKS = RANKS;
  (A.stages = A.stages || []).push(settlements);
})();
