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
    const lm = W.lm.list, n = W.params.provinces, elig = lm.filter(m => m.area >= 120); if (!elig.length) elig.push(lm[0]);
    const tot = elig.reduce((s, m) => s + m.area, 0), cnt = elig.map(m => Math.floor(n * m.area / tot));
    const rem = elig.map((m, k) => [n * m.area / tot - cnt[k], k]).sort((a, b) => b[0] - a[0]);
    for (let left = n - cnt.reduce((a, b) => a + b, 0), k = 0; left > 0; left--, k = (k + 1) % rem.length) cnt[rem[k][1]]++;
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
  function politics(W) {
    const { w, h } = W, N = w * h, r = A.Rng.stream(W.params.seed, 'politics'), land = i => W.land[i] === 1 && !W.lake[i];
    W.suit = A.suitability(W); W.lm = A.landmasses(W); W.landmass = W.lm.id;
    const caps = pickCapitals(W, r), P = caps.length;
    let prov = G.grow(W, caps.map((c, k) => ({ i: c, label: k })), land);
    // суходоли без столиці: найближча провінція через воду
    const un = []; for (let i = 0; i < N; i++) if (land(i) && prov[i] < 0) un.push(i);
    if (un.length) for (let g = 0; g < 80 && un.some(i => prov[i] < 0); g++) {
      const snap = prov.slice(); for (const i of un) if (prov[i] < 0) { const x = i % w, y = (i / w) | 0; for (let d = 0; d < 8; d++) { const nx = x + A.Grid.DX[d] * (g + 1), ny = y + A.Grid.DY[d] * (g + 1); if (nx >= 0 && ny >= 0 && nx < w && ny < h && snap[ny * w + nx] >= 0) { prov[i] = snap[ny * w + nx]; break; } } }
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
    // регіони всередині кожної провінції
    const region = new Int16Array(N).fill(-1), regions = [];
    for (let k = 0; k < P; k++) {
      const cells = []; for (let i = 0; i < N; i++) if (prov[i] === k) cells.push(i);
      const part = components(w, h, i => prov[i] === k), kk = Math.max(1, Math.min(9, Math.round(W.params.regionsPerProvince * (0.75 + 0.5 * r())), Math.floor(cells.length / 90)));
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
      let mulCap = 0.55, lab;
      for (let t = 0; t < 5; t++) {
        lab = G.grow(W, centers.map((c, q) => ({ i: c, label: q, mul: c === caps[k] ? mulCap : 1 })), i => prov[i] === k);
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
    for (const g of regions) { region[g.centerCell] = g.id; prov[g.centerCell] = g.prov; } // центр регіону завжди у своєму регіоні
    const provinces = caps.map((c, k) => ({ id: k, capitalCell: c, regions: [], area: 0 }));
    for (const g of regions) provinces[g.prov].regions.push(g.id);
    W.province = prov; W.region = region; W.provinces = provinces; W.regions = regions;
  }
  A.politics = politics;
  (A.stages = A.stages || []).push(politics);
})();
