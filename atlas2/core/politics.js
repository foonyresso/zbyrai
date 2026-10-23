// Атлас 2.0, етап 4b: провінції (як країни) і регіони (як області). Столиці → ріст за вартістю шляху → згладжені межі без уламків.
(function () {
  'use strict';
  const A = globalThis.Atlas2, { components } = A.Grid, G = A.Grow;

  function farthest(W, cells, chosen, r, suit, k) {
    const w = W.w, out = [];
    const near = (c) => { let m = 1e9; for (const o of chosen.concat(out)) m = Math.min(m, Math.hypot((c % w) - (o % w), ((c / w) | 0) - ((o / w) | 0))); return m; };
    for (let n = 0; n < k; n++) {
      let best = -1, bs = -1;
      for (let q = 0; q < cells.length; q += 2) { const c = cells[q], s = (chosen.length + out.length ? Math.min(near(c), 60) : 30) * (0.35 + suit[c]) * (0.85 + 0.3 * r()); if (s > bs) { bs = s; best = c; } }
      if (best < 0) break; out.push(best);
    }
    return out;
  }
  function pickCapitals(W, r) {
    const lm = W.lm.list, n = W.params.provinces, elig = lm.filter(m => m.area >= 500); if (!elig.length) elig.push(lm[0]);
    const tot = elig.reduce((s, m) => s + m.area, 0), room = elig.map(m => Math.max(1, Math.floor(m.area / 900))), cnt = elig.map((m, k) => Math.min(room[k], Math.floor(n * m.area / tot)));
    for (let left = n - cnt.reduce((a, b) => a + b, 0); left > 0; left--) { // решта: суходолу з найбільшою неврахованою часткою, де ще є місце (провінція не менша ~900 клітин)
      let bk = -1, bv = -1; elig.forEach((m, k) => { const v = n * m.area / tot - cnt[k]; if (cnt[k] < room[k] && v > bv) { bv = v; bk = k; } }); if (bk < 0) break; cnt[bk]++;
    }
    const caps = [], w = W.w;
    elig.forEach((m, k) => {
      if (!cnt[k]) return;
      const cells = []; for (let i = 0; i < W.land.length; i++) if (W.landmass[i] === m.id && W.suit[i] > 0.4) cells.push(i);
      if (!cells.length) return; const rad = Math.sqrt(m.area / Math.PI);
      let best = cells[0], bs = -9;
      for (const c of cells) { const s = W.suit[c] - 0.8 * Math.hypot((c % w) - m.cx, ((c / w) | 0) - m.cy) / rad + 0.05 * r(); if (s > bs) { bs = s; best = c; } }
      const mine = [best]; if (cnt[k] > 1) mine.push(...farthest(W, cells, mine, r, W.suit, cnt[k] - 1));
      caps.push(...mine);
    });
    return caps;
  }
  // гарантія: регіон столиці найбільший серед регіонів на її суходолі (віддаємо клітини найбільшого суперника, що межують зі столичним)
  function growCapital(W, lab, cells, centers, cap) {
    const { w, h } = W, ci = centers.indexOf(cap), lm = W.landmass[cap], area = new Array(centers.length).fill(0), same = centers.map(c => W.landmass[c] === lm);
    for (const i of cells) area[lab[i]]++;
    for (let it = 0; it < 60; it++) {
      let rv = -1; for (let q = 0; q < centers.length; q++) if (q !== ci && same[q] && (rv < 0 || area[q] > area[rv])) rv = q;
      if (rv < 0 || area[ci] > area[rv] * 1.02) return;
      const move = []; for (const i of cells) if (lab[i] === rv) { const x = i % w, y = (i / w) | 0; for (let d = 0; d < 4; d++) { const nx = x + A.Grid.DX[d], ny = y + A.Grid.DY[d]; if (nx >= 0 && ny >= 0 && nx < w && ny < h && lab[ny * w + nx] === ci) { move.push(i); break; } } }
      if (!move.length) return; const want = Math.max(1, Math.ceil((area[rv] - area[ci]) / 2));
      move.sort((a, b) => Math.hypot((a % w) - (cap % w), ((a / w) | 0) - ((cap / w) | 0)) - Math.hypot((b % w) - (cap % w), ((b / w) | 0) - ((cap / w) | 0)));
      for (const i of move.slice(0, want)) { lab[i] = ci; area[ci]++; area[rv]--; }
    }
  }
  // «територіальні води»: озеро чи море належить провінції/регіону лише на відстані до R клітин (2 км) від їхнього берега, далі вода нічия.
  // Лише для підсвітки й наведення: W.provW/W.regW (суша + прибережна вода); W.province/W.region лишаються по суші.
  function waters(W, R) {
    const { w, h } = W, N = w * h, pw = new Int16Array(N).fill(-1), rw = new Int16Array(N).fill(-1), dist = new Float32Array(N).fill(1e9), heap = new A.Heap(), wob = G.wobble(W);
    const lc = A.Grid.components(w, h, i => W.land[i] && !W.lake[i] && W.province[i] >= 0); // острівці менші за 20 клітин води не «приносять»
    for (let i = 0; i < N; i++) if (W.land[i] && !W.lake[i] && W.province[i] >= 0) { pw[i] = W.province[i]; if (lc.sizes[lc.id[i]] < 20) continue; rw[i] = W.region[i]; dist[i] = 0; heap.push(0, i); }
    while (heap.size) {
      const i = heap.pop(), d0 = dist[i]; if (d0 > dist[i]) continue; const x = i % w, y = (i / w) | 0;
      for (let d = 0; d < 8; d++) {
        const nx = x + A.Grid.DX[d], ny = y + A.Grid.DY[d]; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const j = ny * w + nx; if (W.land[j] && !W.lake[j]) continue; const nd = d0 + (d >= 4 ? 1.41 : 1) * wob[j]; if (nd > R || nd >= dist[j]) continue;
        dist[j] = nd; pw[j] = pw[i]; rw[j] = rw[i]; heap.push(nd, j);
      }
    }
    W.provW = pw; W.regW = rw;
  }
  function politics(W) {
    const { w, h } = W, N = w * h, r = A.Rng.stream(W.params.seed, 'politics'), land = i => W.land[i] === 1 && !W.lake[i];
    W.suit = A.suitability(W); W.lm = A.landmasses(W); W.landmass = W.lm.id;
    const caps = pickCapitals(W, r), P = caps.length;
    let prov = G.grow(W, caps.map((c, k) => ({ i: c, label: k, mul: 0.65 + 0.9 * r() })), land); // різний «апетит» провінцій: є великі й малі
    // суходоли без столиці: ближче FAR клітин від провінції — належать найближчій; далі в океані — нічиї (prov -1)
    const FAR = 36, un = new Map(); for (let i = 0; i < N; i++) if (land(i) && prov[i] < 0) (un.get(W.landmass[i]) || un.set(W.landmass[i], []).get(W.landmass[i])).push(i);
    for (const cells of un.values()) {
      let got = -1;
      for (let g = 0; g < FAR && got < 0; g++) for (const i of cells) { const x = i % w, y = (i / w) | 0; for (let d = 0; d < 8; d++) { const nx = x + A.Grid.DX[d] * (g + 1), ny = y + A.Grid.DY[d] * (g + 1); if (nx >= 0 && ny >= 0 && nx < w && ny < h && prov[ny * w + nx] >= 0) { got = prov[ny * w + nx]; break; } } if (got >= 0) break; }
      if (got >= 0) for (const i of cells) prov[i] = got;
    }
    for (let i = 0; i < N; i++) if (!land(i)) prov[i] = -1;
    // малий острів належить одній провінції (не ділиться): віддаємо його провінції з найбільшою часткою (або тій, чия столиця на ньому)
    for (const m of W.lm.list) {
      if (m.area >= 700) continue; const cnt = new Map(), cells = []; for (let i = 0; i < N; i++) if (W.landmass[i] === m.id) { cells.push(i); cnt.set(prov[i], (cnt.get(prov[i]) || 0) + 1); }
      const capHere = caps.findIndex(c => W.landmass[c] === m.id); let best = capHere, bc = -1;
      if (best < 0) for (const [L, c] of cnt) if (L >= 0 && c > bc) { bc = c; best = L; }
      if (best >= 0) for (const i of cells) prov[i] = best;
    }
    G.smooth(prov, w, h, () => true, 2);
    G.fixFragments(prov, w, h, caps, 25, () => true);
    G.trimArms(prov, w, h, caps, W);
    G.fixFragments(prov, w, h, caps, 25, () => true);
    G.joinParts(prov, w, h, W.landmass, L => caps[L], () => true); // кожна провінція в межах суходолу — суцільна
    // регіони всередині кожної провінції
    const region = new Int16Array(N).fill(-1), regions = [];
    for (let k = 0; k < P; k++) {
      const cells = []; for (let i = 0; i < N; i++) if (prov[i] === k) cells.push(i);
      const part = components(w, h, i => prov[i] === k); let kk = Math.max(1, Math.min(24, Math.max(Math.round(W.params.regionsPerProvince * (0.45 + 1.1 * r())), Math.floor(cells.length / 1600)), Math.floor(cells.length / 200))); if (cells.length >= 360) kk = Math.max(3, kk); // регіон не менший ~200 клітин; у провінції зі столицею щонайменше 3 регіони
      const parts = part.sizes.map((s, id) => ({ id, s })).filter(p => p.s >= 40).sort((a, b) => b.s - a.s);
      const cpart = part.id[caps[k]], order = parts.filter(p => p.id === cpart).concat(parts.filter(p => p.id !== cpart));
      const tot = order.reduce((s, p) => s + p.s, 0) || 1; let left = Math.max(kk, order.length);
      const take = order.map(() => 1); left -= order.length;
      for (let q = 0; left > 0; q = (q + 1) % order.length, left--) if (order[q].s >= 200 && (order[q].s / tot * kk > take[q] - 0.4 || q === 0)) take[q]++; else if (q === 0) take[0]++;
      let centers = [];
      order.forEach((p, q) => {
        const pc = cells.filter(i => part.id[i] === p.id), first = p.id === cpart ? [caps[k]] : [];
        if (!first.length) first.push(...farthest(W, pc, [], r, W.suit, 1));
        centers.push(...first, ...farthest(W, pc, first, r, W.suit, take[q] - 1));
      });
      const wts = centers.map(() => 0.85 + 0.4 * r());
      let mulCap = 0.55, lab;
      for (let t = 0; t < 5; t++) {
        lab = G.grow(W, centers.map((c, q) => ({ i: c, label: q, mul: c === caps[k] ? mulCap : wts[q] })), i => prov[i] === k);
        const area = new Array(centers.length).fill(0); for (const i of cells) if (lab[i] >= 0) area[lab[i]]++;
        const ci = centers.indexOf(caps[k]), same = centers.map((c, q) => W.landmass[c] === W.landmass[caps[k]] ? area[q] : 0); if (area[ci] >= Math.max(...same)) break; mulCap *= 0.6;
      }
      for (const i of cells) if (lab[i] < 0) lab[i] = 0;
      growCapital(W, lab, cells, centers, caps[k]);
      const base = regions.length;
      centers.forEach((c, q) => regions.push({ id: base + q, prov: k, centerCell: c, isCapitalRegion: c === caps[k] }));
      for (const i of cells) region[i] = base + lab[i];
    }
    const anchors = {}; regions.forEach(g => anchors[g.id] = g.centerCell), ok = (i, L) => regions[L].prov === prov[i];
    var ok;
    G.smooth(region, w, h, ok, 2); G.fixFragments(region, w, h, anchors, 40, ok);
    // озера всередині суші: мітка найближчого берега, щоб заливка меж була суцільною
    for (let g = 0; g < 6; g++) for (let i = 0; i < N; i++) if (W.lake[i] && region[i] < 0) { const t = G.topNeighbor(region, w, h, i, () => true, false); if (t.label >= 0) region[i] = t.label; }
    G.joinParts(region, w, h, W.landmass, id => regions[id] ? regions[id].centerCell : null, (a, b) => regions[a].prov === regions[b].prov); // кожен регіон — суцільний
    for (let i = 0; i < N; i++) prov[i] = region[i] >= 0 ? regions[region[i]].prov : -1;
    // уламки провінції (<25 клітин) на великому суходолі віддаємо сусідній провінції разом із регіоном
    for (let pass = 0; pass < 3; pass++) {
      const pc = components(w, h, i => prov[i] >= 0 && false), seen = new Int32Array(N).fill(-1); let n = 0;
      for (let s0 = 0; s0 < N; s0++) {
        if (prov[s0] < 0 || seen[s0] >= 0) continue; const L = prov[s0], cells = [s0], st = [s0]; seen[s0] = n;
        while (st.length) { const i = st.pop(), x = i % w, y = (i / w) | 0; for (let d = 0; d < 4; d++) { const nx = x + A.Grid.DX[d], ny = y + A.Grid.DY[d]; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue; const j = ny * w + nx; if (prov[j] === L && seen[j] < 0) { seen[j] = n; cells.push(j); st.push(j); } } }
        n++; if (cells.length >= 25 || cells.includes(caps[L])) continue;
        const lmArea = W.lm.list.find(m => m.id === W.landmass[cells[0]]); if (lmArea && lmArea.area <= cells.length + 2) continue;
        for (const i of cells) { const t = G.topNeighbor(region, w, h, i, q => regions[q].prov !== L, true); if (t.label >= 0) { region[i] = t.label; prov[i] = regions[t.label].prov; } }
      }
    }
    // надто малі регіони (<150 клітин, окрім регіону столиці) зливаються з найбільшим сусідом у тій самій провінції
    {
      const area = new Array(regions.length).fill(0); for (let i = 0; i < N; i++) if (region[i] >= 0) area[region[i]]++;
      const dead = new Set();
      for (let it = 0; it < regions.length; it++) {
        let sm = -1; regions.forEach((g, id) => { if (!dead.has(id) && !g.isCapitalRegion && area[id] < 150 && (sm < 0 || area[id] < area[sm]) && regions.filter((q, qi) => q.prov === g.prov && !dead.has(qi)).length > 3) sm = id; });
        if (sm < 0) break; const adj = new Map();
        for (let i = 0; i < N; i++) if (region[i] === sm) { const x = i % w, y = (i / w) | 0; for (let d = 0; d < 8; d++) { const nx = x + A.Grid.DX[d], ny = y + A.Grid.DY[d]; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue; const L = region[ny * w + nx]; if (L >= 0 && L !== sm && !dead.has(L) && regions[L].prov === regions[sm].prov) adj.set(L, (adj.get(L) || 0) + 1); } }
        let to = -1, bc = 0; for (const [L, c] of adj) if (c > bc) { bc = c; to = L; }
        if (to < 0) { area[sm] = 1e9; continue; } // острівний регіон без сусіда лишається
        for (let i = 0; i < N; i++) if (region[i] === sm) region[i] = to; area[to] += area[sm]; dead.add(sm);
      }
      if (dead.size) { const map = new Map(), keep = []; regions.forEach((g, id) => { if (!dead.has(id)) { map.set(id, keep.length); g.id = keep.length; keep.push(g); } }); for (let i = 0; i < N; i++) if (region[i] >= 0) region[i] = map.get(region[i]); regions.length = 0; regions.push(...keep); }
    }
    // у кожній провінції щонайменше 3 регіони: найбільший ділиться навпіл
    for (let k = 0; k < P; k++) {
      for (let guard = 0; guard < 4; guard++) {
        const mine = regions.filter(g => g.prov === k); if (mine.length >= 3) break;
        const ar = new Map(mine.map(g => [g.id, 0])); for (let i = 0; i < N; i++) if (ar.has(region[i])) ar.set(region[i], ar.get(region[i]) + 1);
        const big = mine.sort((a, b) => ar.get(b.id) - ar.get(a.id))[0]; if (ar.get(big.id) < 120) break;
        const cs = []; for (let i = 0; i < N; i++) if (region[i] === big.id) cs.push(i);
        const nc = farthest(W, cs, [big.centerCell], r, W.suit, 1)[0]; if (nc == null) break;
        const lab = G.grow(W, [{ i: big.centerCell, label: 0 }, { i: nc, label: 1 }], i => region[i] === big.id), nid = regions.length;
        regions.push({ id: nid, prov: k, centerCell: nc, isCapitalRegion: false }); for (const i of cs) if (lab[i] === 1) region[i] = nid;
      }
    }
    // центр регіону, що опинився поза власним регіоном (після згладжування/зливання), переноситься в його клітину, найближчу до колишнього центру
    for (const g of regions) {
      if (region[g.centerCell] === g.id) continue; const cx = g.centerCell % w, cy = (g.centerCell / w) | 0; let b = -1, bd = 1e18;
      for (let i = 0; i < N; i++) if (region[i] === g.id) { const d = (i % w - cx) ** 2 + (((i / w) | 0) - cy) ** 2; if (d < bd) { bd = d; b = i; } }
      if (b >= 0) g.centerCell = b;
    }
    for (const g of regions) { region[g.centerCell] = g.id; prov[g.centerCell] = g.prov; } // центр регіону завжди у своєму регіоні
    G.joinParts(region, w, h, W.landmass, id => regions[id].centerCell, (a, b) => regions[a].prov === regions[b].prov); // після переносу центрів і поділів: ніяких одиночних клітин-«ексклавів»
    for (let i = 0; i < N; i++) prov[i] = region[i] >= 0 ? regions[region[i]].prov : -1;
    const provinces = caps.map((c, k) => ({ id: k, capitalCell: c, regions: [], area: 0 }));
    for (const g of regions) provinces[g.prov].regions.push(g.id);
    W.province = prov; W.region = region; waters(W, 8); W.provinces = provinces; W.regions = regions;
  }
  A.politics = politics;
  (A.stages = A.stages || []).push(politics);
})();
