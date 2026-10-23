// Атлас 2.0: малювання карти на canvas. Растр рельєфу (кеш) + векторні шари з плавними контурами. Одиниця координат: комірка.
(function () {
  'use strict';
  const A = globalThis.Atlas2, C = A.Contours;
  const PALETTE = ['#b58fd1', '#e0a35f', '#7fbf7f', '#e08f8f', '#6fb8c9', '#d6c75a', '#9aa0e0', '#d98fc0', '#8fc9a6', '#c9a07a'];
  const cache = new WeakMap();

  function prep(W) {
    let c = cache.get(W); if (c) return c; const { w, h } = W;
    c = { land: C.smoothLoops(w, h, i => W.land[i] === 1 && !W.lake[i] || W.lake[i] === 1 && W.region[i] >= 0, 3), lakes: C.smoothLoops(w, h, i => W.lake[i] === 1, 3), provs: [], regs: [] };
    W.provinces.forEach(p => c.provs.push(C.smoothLoops(w, h, i => W.province[i] === p.id, 3)));
    W.regions.forEach(g => c.regs.push(C.smoothLoops(w, h, i => W.region[i] === g.id, 3)));
    const S = 4, img = A.Raster.build(W, S, (a, b) => new ImageData(a, b));
    const toCanvas = d => { const cv = document.createElement('canvas'); cv.width = d.width; cv.height = d.height; cv.getContext('2d').putImageData(d, 0, 0); return cv; };
    c.ocean = toCanvas(img.ocean); c.landImg = toCanvas(img.land);
    c.maxAcc = Math.max(1, ...Array.from(W.acc)); cache.set(W, c); return c;
  }
  const path = (ctx, loops) => { ctx.beginPath(); for (const p of loops) { ctx.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) ctx.lineTo(p[i], p[i + 1]); ctx.closePath(); } };

  // view: {k px/клітина, tx, ty}; opts: {layers:{...}, hoverRegion, selRegion}
  function draw(cv, W, view, opts) {
    const c = prep(W), ctx = cv.getContext('2d'), L = opts.layers, { k, tx, ty } = view, px = 1 / k;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#527aae'; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.setTransform(k, 0, 0, k, tx, ty); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(c.ocean, 0, 0, W.w, W.h);
    // берег: світле сяйво
    ctx.save(); path(ctx, c.land); ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 7 * px; ctx.stroke(); ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 3.5 * px; ctx.stroke(); ctx.restore();
    ctx.save(); path(ctx, c.land); ctx.clip(); ctx.drawImage(c.landImg, 0, 0, W.w, W.h);
    if (L.fill) W.provinces.forEach((p, n) => { path(ctx, c.provs[n]); ctx.fillStyle = PALETTE[n % PALETTE.length] + '55'; ctx.fill('evenodd'); });
    if (opts.hoverRegion != null && c.regs[opts.hoverRegion]) { path(ctx, c.regs[opts.hoverRegion]); ctx.fillStyle = 'rgba(255,255,255,.28)'; ctx.fill('evenodd'); }
    if (L.borders) {
      ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.strokeStyle = 'rgba(70,50,30,.45)'; ctx.lineWidth = 1 * px; ctx.setLineDash([4 * px, 3 * px]);
      c.regs.forEach(l => { path(ctx, l); ctx.stroke(); }); ctx.setLineDash([]);
      c.provs.forEach((l, n) => { path(ctx, l); ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 4.2 * px; ctx.stroke(); ctx.strokeStyle = 'rgba(60,40,70,.75)'; ctx.lineWidth = 1.8 * px; ctx.stroke(); });
    }
    ctx.restore();
    // озера
    path(ctx, c.lakes); ctx.fillStyle = '#7fb2e0'; ctx.fill('evenodd'); ctx.strokeStyle = 'rgba(70,110,160,.8)'; ctx.lineWidth = 1 * px; ctx.stroke();
    if (L.rivers) drawRivers(ctx, W, c, px);
    if (A.drawRoads && L.roads) A.drawRoads(ctx, W, px, k);
    if (A.drawPlaces && (L.places || L.labels)) A.drawPlaces(ctx, W, px, k, L, PALETTE);
  }
  function drawRivers(ctx, W, c, px) {
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#5b94cf';
    for (const cells of W.rivers) {
      let pts = []; cells.forEach((i, n) => { let x = (i % W.w) + 0.5, y = ((i / W.w) | 0) + 0.5; if (W.ocean[i] && n) { const j = cells[n - 1]; x = (x + (j % W.w) + 0.5) / 2; y = (y + ((j / W.w) | 0) + 0.5) / 2; } pts.push(x, y); });
      const sm = C.chaikin(pts, 2, false), m = sm.length / 2;
      for (let q = 1; q < m; q++) {
        const ci = cells[Math.min(cells.length - 1, Math.floor(q / m * cells.length))]; if (W.lake[ci]) continue;
        ctx.lineWidth = (0.9 + 3.2 * Math.sqrt(W.acc[ci] / c.maxAcc)) * px * 1.6; ctx.beginPath(); ctx.moveTo(sm[(q - 1) * 2], sm[(q - 1) * 2 + 1]); ctx.lineTo(sm[q * 2], sm[q * 2 + 1]); ctx.stroke();
      }
    }
  }
  A.draw = { draw, prep, PALETTE };
})();
