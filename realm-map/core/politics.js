// Політична карта: провінції (як країни) → регіони (як області) → кожен регіон належить до свого міста-центру.
// Столиця провінції — центр її найбільшого регіону. Межі ростуть хвилею Дейкстри по вартості проходу (гори, ріки, болота стримують).
(function () {
  'use strict';
  const R = (globalThis.RealmMap = globalThis.RealmMap || {});

  function stepCost(world, i) {
    const b = R.Data.biomes[world.bio[i]]; let c = b.move || 99;
    if (world.river[i]) c += 1.6; // ріка — природний рубіж
    return c;
  }

  // Мультиджерельна хвиля. seeds: [{cell, label, mult}], allowed(i) — де можна розширюватись. Повертає Int32Array міток (-1 поза зоною).
  function flood(world, seeds, allowed) {
    const g = world.grid, lab = new Int32Array(g.n).fill(-1), best = new Float64Array(g.n).fill(Infinity), H = new R.MinHeap(), nb = new Int32Array(8);
    const mult = {};
    for (const s of seeds) { best[s.cell] = 0; lab[s.cell] = s.label; mult[s.label] = s.mult; H.push(0, s.cell); }
    while (H.size) {
      const c = H.pop(), d = H.lastKey; if (d > best[c]) continue;
      const m = R.Grid.neighbors(g, c, true, nb);
      for (let k = 0; k < m; k++) {
        const j = nb[k]; if (!allowed(j)) continue;
        const diag = (Math.abs((j % g.w) - (c % g.w)) === 1 && Math.abs(((j / g.w) | 0) - ((c / g.w) | 0)) === 1) ? 1.414 : 1;
        const nd = d + stepCost(world, j) * mult[lab[c]] * diag;
        if (nd < best[j]) { best[j] = nd; lab[j] = lab[c]; H.push(nd, j); }
      }
    }
    return lab;
  }

  // фарфест-пойнт вибір точок серед кандидатів: максимізує відстань до вже вибраних, зважену придатністю
  function farthest(g, cands, chosen, count, suit, minDist, rnd) {
    const out = [];
    const all = chosen.slice();
    for (let n = 0; n < count; n++) {
      let bestC = -1, bestV = -1;
      for (const c of cands) {
        let md = 1e9; for (const o of all) { const d = R.Grid.dist(g, c, o); if (d < md) md = d; }
        if (all.length && md < minDist) continue;
        const v = (all.length ? md : 1) * (0.35 + suit[c]) * (0.85 + rnd() * 0.3);
        if (v > bestV) { bestV = v; bestC = c; }
      }
      if (bestC < 0) break;
      out.push(bestC); all.push(bestC);
    }
    return out;
  }
  function sample(arr, max, rnd) { if (arr.length <= max) return arr; const o = [], step = arr.length / max; for (let k = 0; k < max; k++) o.push(arr[Math.floor(k * step + rnd() * step)]); return o; }

  function buildPolitics(world, p) {
    const g = world.grid, n = g.n, rnd = R.Rng.stream(p.seed, 'politics'), land = i => world.water[i] === 0;
    // 1. суходільні компоненти й розподіл столиць провінцій
    const comp = R.Grid.components(g, land, true), total = comp.sizes.reduce((a, b) => a + b, 0), minComp = Math.max(40, Math.floor(total * 0.025));
    // розподіл провінцій між суходолами пропорційно площі (дрібні острівці провінцій не отримують)
    const avg = total / p.provinces, counts = comp.sizes.map(sz => (sz >= avg * 0.5 ? Math.max(1, Math.round(sz / avg)) : 0));
    const big = comp.sizes.indexOf(Math.max(...comp.sizes)); if (counts.length && !counts[big]) counts[big] = 1;
    const sum = () => counts.reduce((a, b) => a + b, 0);
    while (sum() > p.provinces) { let bc = -1, bv = 1e18; counts.forEach((c, k) => { if (c > 1 && comp.sizes[k] / c < bv) { bv = comp.sizes[k] / c; bc = k; } }); if (bc < 0) break; counts[bc]--; }
    while (sum() < p.provinces) { let bc = -1, bv = -1; counts.forEach((c, k) => { if (c > 0 || comp.sizes[k] >= avg * 0.3) { const v = comp.sizes[k] / (c + 1); if (v > bv) { bv = v; bc = k; } } }); if (bc < 0) break; counts[bc]++; }
    const eligible = counts.map((c, k) => k).filter(k => counts[k] > 0);
    const capCells = [];
    for (const c of eligible) {
      if (!counts[c]) continue;
      const cells = []; let sx = 0, sy = 0;
      for (let i = 0; i < n; i++) if (comp.id[i] === c) { cells.push(i); sx += g.cx[i]; sy += g.cy[i]; }
      sx /= cells.length; sy /= cells.length;
      const good = cells.filter(i => world.suit[i] > 0.55), cands = sample(good.length >= counts[c] * 8 ? good : cells, 500, rnd);
      const first = cands.reduce((a, b) => (world.suit[b] * (1 - Math.hypot(g.cx[b] - sx, g.cy[b] - sy) / 80) > world.suit[a] * (1 - Math.hypot(g.cx[a] - sx, g.cy[a] - sy) / 80) ? b : a), cands[0]);
      const picks = [first].concat(counts[c] > 1 ? farthest(g, cands, [first], counts[c] - 1, world.suit, 8, rnd) : []);
      for (const x of picks) capCells.push(x);
    }
    // 2. провінції: хвиля від столиць
    const pw = capCells.map(() => 0.9 + rnd() * 0.25);
    let prov = flood(world, capCells.map((cell, k) => ({ cell, label: k, mult: pw[k] })), land);
    prov = fillLand(world, prov, n);
    // 3. регіони в межах кожної провінції
    const region = new Int32Array(n).fill(-1), regions = [], provinces = [];
    const avgArea = total / Math.max(1, capCells.length);
    capCells.forEach((cap, pi) => {
      const cells = []; for (let i = 0; i < n; i++) if (prov[i] === pi) cells.push(i);
      const k = Math.max(3, Math.min(10, Math.round(p.regionsPerProvince * Math.sqrt(cells.length / avgArea) * (0.9 + rnd() * 0.2))));
      const cset = new Uint8Array(n); for (const c of cells) cset[c] = 1;
      const pcomp = R.Grid.components(g, i => cset[i] === 1, true), seeds = [cap];
      pcomp.sizes.forEach((sz, ci) => { // кожна окрема частина (острів) отримує центр
        if (sz < 12) return;
        let has = false; for (const s of seeds) if (pcomp.id[s] === ci) has = true;
        if (has) return;
        let b = -1; for (let i = 0; i < n; i++) if (pcomp.id[i] === ci && (b < 0 || world.suit[i] > world.suit[b])) b = i;
        seeds.push(b);
      });
      const cands = sample(cells.filter(i => world.suit[i] > 0.4), 400, rnd);
      const extra = farthest(g, cands.length ? cands : sample(cells, 300, rnd), seeds, Math.max(0, k - seeds.length), world.suit, 5, rnd);
      const centers = seeds.concat(extra);
      let lab = null, capSize = 0, maxOther = 0;
      for (const capMult of [0.5, 0.4, 0.3, 0.22, 0.15, 0.1]) {
        const sd = centers.map((cell, j) => ({ cell, label: j, mult: j === 0 ? capMult : 0.85 + rnd() * 0.3 }));
        lab = flood(world, sd, i => cset[i] === 1);
        const sizes = new Array(centers.length).fill(0); for (const c of cells) if (lab[c] >= 0) sizes[lab[c]]++;
        capSize = sizes[0]; maxOther = Math.max(0, ...sizes.slice(1));
        if (capSize > maxOther) break;
      }
      // дрібні відрізані клаптики → найближчий центр цієї ж провінції
      for (const c of cells) if (lab[c] < 0) { let bj = 0, bd = 1e9; centers.forEach((cc, j) => { const d = R.Grid.dist(g, c, cc); if (d < bd) { bd = d; bj = j; } }); lab[c] = bj; }
      const baseId = regions.length;
      centers.forEach((cell, j) => regions.push({ id: baseId + j, province: pi, centerCell: cell, cells: 0 }));
      for (const c of cells) region[c] = baseId + lab[c];
      provinces.push({ id: pi, capitalCell: cap, regions: centers.map((c, j) => baseId + j), cells: cells.length, hue: (pi * 137.508 + 20) % 360 });
    });
    for (let i = 0; i < n; i++) if (region[i] >= 0) regions[region[i]].cells++;
    return { province: prov, region, regions, provinces, landComp: comp };
  }

  // клітинки суші без мітки отримують мітку найближчої (BFS крізь воду), щоб малі острови не лишались «нічиїми»
  function fillLand(world, lab, n) {
    const g = world.grid, tl = new Int32Array(lab), q = new Int32Array(n), nb = new Int32Array(8); let qh = 0, qt = 0;
    for (let i = 0; i < n; i++) if (tl[i] >= 0) q[qt++] = i;
    while (qh < qt) { const c = q[qh++], m = R.Grid.neighbors(g, c, true, nb); for (let k = 0; k < m; k++) { const j = nb[k]; if (tl[j] < 0) { tl[j] = tl[c]; q[qt++] = j; } } }
    const out = new Int32Array(n).fill(-1); for (let i = 0; i < n; i++) if (world.water[i] === 0) out[i] = tl[i];
    return out;
  }
  R.Politics = { buildPolitics, flood };
})();
