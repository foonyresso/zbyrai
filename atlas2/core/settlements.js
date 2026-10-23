// Атлас 2.0, етап 5: поселення (столиці, центри регіонів, міста, села, хутори), назви, зведення по регіонах і провінціях.
(function () {
  'use strict';
  const A = globalThis.Atlas2, { DX, DY } = A.Grid;
  const RANKS = ['capital', 'regional', 'town', 'village', 'hamlet'];
  const POP = { capital: [14000, 38000], regional: [3500, 13000], town: [900, 3200], village: [120, 650], hamlet: [20, 110] };
  const MIND = { town: 24, village: 14, hamlet: 9 }; // мінімальні відстані в клітинах (1 клітина = 2 км); кожному поселенню — випадковий множник

  function settlements(W) {
    const { w, h } = W, N = w * h, r = A.Rng.stream(W.params.seed, 'settle'), names = A.Names.make(W.params.seed), S = [], buckets = new Map();
    W.lakeOf = new Int32Array(N).fill(-1); const bigLake = new Set(); for (const l of W.lakes) { for (const c of l.cells) W.lakeOf[c] = l.id; if (l.size >= A.BIG_LAKE) bigLake.add(l.id); }
    const bk = (x, y) => ((y / 8) | 0) * 1000 + ((x / 8) | 0);
    const near = (x, y, d) => { for (let by = Math.floor((y - d) / 8); by <= Math.floor((y + d) / 8); by++) for (let bx = Math.floor((x - d) / 8); bx <= Math.floor((x + d) / 8); bx++) for (const s of buckets.get(by * 1000 + bx) || []) if (Math.hypot(s.x - x, s.y - y) < d) return true; return false; };
    const wetNb = j => { const x = j % w, y = (j / w) | 0; for (let d = 0; d < 8; d++) { const nx = x + DX[d], ny = y + DY[d]; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue; const q = ny * w + nx; if (W.ocean[q] || (W.lake[q] && bigLake.has(W.lakeOf[q]))) return true; } return false; };
    // місто (від містечка вище) поблизу води частіше стає саме на берег, щоб бути портом
    const snap = i => {
      const x = i % w, y = (i / w) | 0; let best = -1, bd = 1e9;
      for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue; const j = ny * w + nx; if (!W.land[j] || W.lake[j] || W.river[j] || W.region[j] !== W.region[i] || !wetNb(j) || near(nx, ny, 2.5)) continue; const d = dx * dx + dy * dy; if (d < bd) { bd = d; best = j; } }
      return best;
    };
    function add(i, rank) {
      if (RANKS.indexOf(rank) <= 2 && r() < 0.65) { const j = snap(i); if (j >= 0) i = j; }
      const x = i % w, y = (i / w) | 0, pr = POP[rank]; let coast = 0, body = null;
      for (let dy = -1; dy <= 1 && body === null; dy++) for (let dx = -1; dx <= 1; dx++) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue; const j = ny * w + nx; if (W.ocean[j]) { coast = 1; body = -1; break; } if (W.lake[j] && bigLake.has(W.lakeOf[j])) { coast = 1; body = W.lakeOf[j]; } }
      const s = { id: S.length, name: names.town(names.lang()), rank, i, x, y, prov: W.province[i], region: W.region[i], landmass: W.landmass[i], port: !!coast && RANKS.indexOf(rank) <= 2, body, river: false, pop: Math.round(pr[0] + (pr[1] - pr[0]) * Math.pow(r(), 1.5)) };
      for (let d = 0; d < 8; d++) { const nx = x + DX[d], ny = y + DY[d]; if (nx >= 0 && ny >= 0 && nx < w && ny < h && W.river[ny * w + nx]) s.river = true; }
      S.push(s); const k = bk(x, y); (buckets.get(k) || buckets.set(k, []).get(k)).push(s); return s;
    }
    // провінції й регіони: назви, центри
    W.provinces.forEach(p => { p.name = names.province(names.lang()); });
    W.regions.forEach(g => { g.name = names.region(names.lang()); const s = add(g.centerCell, g.isCapitalRegion ? 'capital' : 'regional'); g.centerCell = s.i; g.center = s.id; g.centerName = s.name; if (g.isCapitalRegion) W.provinces[g.prov].capital = s.id; });
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
    // розмір міста-центру від площі регіону (великий регіон — велике головне місто); столиця більша за центри своєї провінції
    W.regions.forEach(g => { const c = S[g.center], k = 0.75 + 0.5 * r(); c.pop = Math.round(g.isCapitalRegion ? (4000 + g.area * 9) * k : (600 + g.area * 5.5) * k); });
    W.provinces.forEach(p => { const reg = p.regions.map(id => S[W.regions[id].center]).filter(c => c.rank === 'regional'), mx = Math.max(0, ...reg.map(c => c.pop)), cap = S[p.capital]; if (cap.pop < mx * 1.5) cap.pop = Math.round(mx * 1.5 * (1 + 0.2 * r())); });
    for (const s of S) if (s.rank === 'town') { const cap = S[W.regions[s.region].center].pop; s.pop = Math.min(s.pop, Math.round(cap * 0.55)); }
    for (const s of S) { if (s.region >= 0) W.regions[s.region].pop += s.pop; }
    const maxPop = Math.max(1, ...W.regions.map(g => g.pop));
    W.regions.forEach(g => { g.level = Math.max(1, Math.round(1 + 9 * g.pop / maxPop)); });
    W.provinces.forEach(p => { p.pop = 0; p.area = 0; for (const id of p.regions) { p.pop += W.regions[id].pop; p.area += W.regions[id].area; } });
    // нічиї острови (далеко від провінцій): лише зруйновані поселення, без населення й доріг
    const own = new Set(); for (const g of S) own.add(g.landmass);
    for (const m of W.lm.list) {
      if (own.has(m.id) || m.area < 12) continue; const cells = []; let owned = false; for (let i = 0; i < N; i++) if (W.landmass[i] === m.id) { if (W.province[i] >= 0) owned = true; if (!W.lake[i] && !W.river[i] && W.suit[i] >= 0.1) cells.push(i); }
      if (owned) continue;
      const want = Math.min(12, Math.max(1, Math.round(cells.length / 500 * (0.6 + 0.8 * r())))), sc = cells.map(i => [Math.pow(W.suit[i], 0.4) * (0.3 + r()), i]).sort((a, b) => b[0] - a[0]); let got = 0;
      for (const [, i] of sc) { if (got >= want) break; if (near(i % w, (i / w) | 0, 8 * (0.7 + 0.7 * r()))) continue; const rk = got === 0 && cells.length > 400 ? 'town' : got < 3 ? 'village' : 'hamlet', x = i % w, y = (i / w) | 0; const s = { id: S.length, name: names.town(names.lang()), rank: rk, i, x, y, prov: -1, region: -1, landmass: m.id, port: false, body: null, river: false, pop: 0, ruined: true }; S.push(s); (buckets.get(bk(x, y)) || buckets.set(bk(x, y), []).get(bk(x, y))).push(s); got++; }
    }
    W.settlements = S;
    labelAnchors(W);
  }
  // підпис провінції: ламана вздовж головної осі найбільшої частини (як літери, написані по карті); регіону: точка біля центру
  function labelAnchors(W) {
    const { w, h } = W, put = (obj, test, line) => {
      const c = A.Grid.components(w, h, test); if (!c.sizes.length) return; let big = 0; c.sizes.forEach((s, k) => { if (s > c.sizes[big]) big = k; });
      const xs = [], ys = []; for (let i = 0; i < w * h; i++) if (c.id[i] === big) { xs.push((i % w) + 0.5); ys.push(((i / w) | 0) + 0.5); }
      const n = xs.length; let cx = 0, cy = 0; for (let k = 0; k < n; k++) { cx += xs[k]; cy += ys[k]; } cx /= n; cy /= n;
      let best = 0, bd = 1e9; for (let k = 0; k < n; k++) { const d = Math.hypot(xs[k] - cx, ys[k] - cy); if (d < bd) { bd = d; best = k; } }
      obj.label = { x: xs[best], y: ys[best], size: n };
      if (!line) return;
      let sxx = 0, syy = 0, sxy = 0; for (let k = 0; k < n; k++) { const dx = xs[k] - cx, dy = ys[k] - cy; sxx += dx * dx; syy += dy * dy; sxy += dx * dy; }
      let ang = 0.5 * Math.atan2(2 * sxy, sxx - syy); if (Math.abs(ang) > 1.05) ang = ang > 0 ? 1.05 : -1.05; // не крутіше ~60°, щоб текст читався
      const ax = Math.cos(ang), ay = Math.sin(ang), nx = -ay, ny = ax, B = 9, bins = Array.from({ length: B }, () => [0, 0]);
      let tmin = 1e9, tmax = -1e9; const T = new Float32Array(n);
      for (let k = 0; k < n; k++) { const t = (xs[k] - cx) * ax + (ys[k] - cy) * ay; T[k] = t; if (t < tmin) tmin = t; if (t > tmax) tmax = t; }
      const lo = tmin + (tmax - tmin) * 0.12, hi = tmax - (tmax - tmin) * 0.12, bw = (hi - lo) / B;
      for (let k = 0; k < n; k++) { const q = (xs[k] - cx) * nx + (ys[k] - cy) * ny, bi = Math.floor((T[k] - lo) / bw); if (bi >= 0 && bi < B) { bins[bi][0] += q; bins[bi][1]++; } }
      const pts = []; let prev = 0;
      for (let bI = 0; bI < B; bI++) { const q = bins[bI][1] > 3 ? bins[bI][0] / bins[bI][1] : prev; prev = q; const t = lo + (bI + 0.5) * bw; pts.push([cx + ax * t + nx * q * 0.8, cy + ay * t + ny * q * 0.8]); }
      const ext = (a, b2) => [a[0] + (a[0] - b2[0]) * 0.8, a[1] + (a[1] - b2[1]) * 0.8];
      pts.unshift(ext(pts[0], pts[1])); pts.push(ext(pts[pts.length - 1], pts[pts.length - 2]));
      if (pts[0][0] > pts[pts.length - 1][0]) pts.reverse();
      obj.label.line = pts.flat().map(v => Math.round(v * 100) / 100);
    };
    W.provinces.forEach(p => put(p, i => W.province[i] === p.id, true));
    W.regions.forEach(g => put(g, i => W.region[i] === g.id, false));
  }
  A.RANKS = RANKS;
  (A.stages = A.stages || []).push(settlements);
})();
