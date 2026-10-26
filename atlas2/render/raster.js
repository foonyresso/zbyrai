// Атлас 2.0: растр рельєфу. Океан (глибина від берега) і суша (колір біому + світлотінь), білінійно між центрами комірок.
(function () {
  'use strict';
  const A = globalThis.Atlas2;
  const hex = c => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
  function landDist(W) { // відстань від суші через океан (клітини)
    const { w, h } = W, N = w * h, d = new Float32Array(N).fill(1e9), q = [];
    for (let i = 0; i < N; i++) if (W.land[i]) { d[i] = 0; q.push(i); }
    for (let k = 0; k < q.length; k++) { const i = q[k], x = i % w, y = (i / w) | 0; for (let n = 0; n < 4; n++) { const nx = x + A.Grid.DX[n], ny = y + A.Grid.DY[n]; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue; const j = ny * w + nx; if (d[j] > d[i] + 1) { d[j] = d[i] + 1; q.push(j); } } }
    return d;
  }
  // повертає {ocean, land}: ImageData розміром (w*S)×(h*S)
  function build(W, S, makeImage) {
    const { w, h } = W, pw = w * S, ph = h * S, VOID = A.Params.isVoid(W.params), pal = VOID ? A.Astrakor.PALETTE : null, cols = A.BIOMES.map(b => hex((pal && pal[b.id]) || b.color)), ld = landDist(W), rcols = cols.map(c => [c[0] * 0.55 + 38, c[1] * 0.55 + 27, c[2] * 0.55 + 17]), RT = VOID && W.root; // RT: корені Астракора темнішають до кольору дерева
    const oc = makeImage(pw, ph), lc = makeImage(pw, ph), O = oc.data, L = lc.data;
    const el = i => W.land[i] ? W.elev[i] : 0, rg = W.params.rugged;
    for (let py = 0; py < ph; py++) for (let px = 0; px < pw; px++) {
      const fx = (px + 0.5) / S - 0.5, fy = (py + 0.5) / S - 0.5, x0 = Math.floor(fx), y0 = Math.floor(fy), tx = fx - x0, ty = fy - y0;
      const xs = [Math.min(w - 1, Math.max(0, x0)), Math.min(w - 1, Math.max(0, x0 + 1))], ys = [Math.min(h - 1, Math.max(0, y0)), Math.min(h - 1, Math.max(0, y0 + 1))];
      const ci = [ys[0] * w + xs[0], ys[0] * w + xs[1], ys[1] * w + xs[0], ys[1] * w + xs[1]], wt = [(1 - tx) * (1 - ty), tx * (1 - ty), (1 - tx) * ty, tx * ty];
      let e = 0, dd = 0, r = 0, g = 0, b = 0, ws = 0, cr = 0, cg = 0, cb = 0;
      for (let k = 0; k < 4; k++) {
        const i = ci[k]; e += el(i) * wt[k]; dd += Math.min(ld[i], 12) * wt[k]; const c = (RT && RT[i] ? rcols : cols)[W.bio[i]]; cr += c[0] * wt[k]; cg += c[1] * wt[k]; cb += c[2] * wt[k];
        if (W.land[i]) { r += c[0] * wt[k]; g += c[1] * wt[k]; b += c[2] * wt[k]; ws += wt[k]; }
      }
      if (ws > 0.001) { r /= ws; g /= ws; b /= ws; } else { r = cr; g = cg; b = cb; }
      // світлотінь: градієнт висоти (світло з північного заходу)
      const ex = (el(ci[1]) - el(ci[0])) * (1 - ty) + (el(ci[3]) - el(ci[2])) * ty, ey = (el(ci[2]) - el(ci[0])) * (1 - tx) + (el(ci[3]) - el(ci[1])) * tx;
      const sh = Math.max(-0.35, Math.min(0.35, (-ex - ey) * 5.5 * (0.6 + 0.5 * rg))), mt = Math.max(0, e - 0.35) * 0.35;
      const f = 1 + sh - mt * 0.2, p = (py * pw + px) * 4;
      L[p] = Math.min(255, r * f); L[p + 1] = Math.min(255, g * f); L[p + 2] = Math.min(255, b * f); L[p + 3] = 255;
      const t = Math.min(1, dd / 10); // океан: світліший біля берега
      if (VOID) { const g = (1 - t) * (1 - t); O[p] = 10; O[p + 1] = 60; O[p + 2] = 70; O[p + 3] = Math.round(150 * g); continue; } // космос: прозоре, лише бірюзове сяйво біля обриву (зорі малює draw.js)
      O[p] = 128 - 46 * t; O[p + 1] = 178 - 56 * t; O[p + 2] = 220 - 46 * t; O[p + 3] = 255;
    }
    return { ocean: oc, land: lc };
  }
  A.Raster = { build };
})();
