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
    ctx.setTransform(k, 0, 0, k, tx, ty); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'medium';
    ctx.drawImage(c.ocean, 0, 0, W.w, W.h);
    // берег: світле сяйво
    ctx.save(); path(ctx, c.land); ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 7 * px; ctx.stroke(); ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 3.5 * px; ctx.stroke(); ctx.restore();
    ctx.save(); path(ctx, c.land); ctx.clip(); ctx.drawImage(c.landImg, 0, 0, W.w, W.h);
    if (L.fill) W.provinces.forEach((p, n) => { path(ctx, c.provs[n]); ctx.fillStyle = PALETTE[n % PALETTE.length] + '70'; ctx.fill('evenodd'); });
    if (L.borders) {
      ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.strokeStyle = 'rgba(70,50,30,.45)'; ctx.lineWidth = 1 * px; ctx.setLineDash([4 * px, 3 * px]);
      c.regs.forEach(l => { path(ctx, l); ctx.stroke(); }); ctx.setLineDash([]);
      c.provs.forEach((l, n) => { path(ctx, l); ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 4.2 * px; ctx.stroke(); ctx.strokeStyle = 'rgba(60,40,70,.75)'; ctx.lineWidth = 1.8 * px; ctx.stroke(); });
    }
    ctx.restore();
    // озера
    path(ctx, c.lakes); ctx.fillStyle = '#7fb2e0'; ctx.fill('evenodd'); ctx.strokeStyle = 'rgba(70,110,160,.8)'; ctx.lineWidth = 1 * px; ctx.stroke();
    if (L.rivers) { ctx.save(); path(ctx, c.land); ctx.clip(); drawRivers(ctx, W, c, px); ctx.restore(); } // річки лише по суші: частина ландшафту, не малюнок поверх моря
    if (A.drawRoads && L.roads) A.drawRoads(ctx, W, px, k);
    if (A.drawPlaces && (L.places || L.labels)) A.drawPlaces(ctx, W, px, k, L, PALETTE);
    scaleBar(ctx, cv, W, k);
  }
  // лінійка відстані (екранні координати): «гарне» число кілометрів, довжина смуги ~ 110–200 пікселів
  function scaleBar(ctx, cv, W, k) {
    const dpr = cv.width / Math.max(1, cv.clientWidth || cv.width), kmPx = W.params.kmPerCell / k, target = 150 * dpr * kmPx;
    const nice = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000].filter(v => v <= target).pop() || 1, len = nice / kmPx, x = 18 * dpr, y = cv.height - 26 * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.fillRect(x - 8 * dpr, y - 20 * dpr, len + 16 * dpr, 34 * dpr);
    ctx.strokeStyle = '#222'; ctx.fillStyle = '#222'; ctx.lineWidth = 2 * dpr; ctx.beginPath(); ctx.moveTo(x, y - 5 * dpr); ctx.lineTo(x, y + 4 * dpr); ctx.lineTo(x + len, y + 4 * dpr); ctx.lineTo(x + len, y - 5 * dpr); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + len / 2, y + 4 * dpr); ctx.lineTo(x + len / 2, y - 1 * dpr); ctx.stroke();
    ctx.font = `600 ${12 * dpr}px sans-serif`; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText(nice + ' км', x, y - 9 * dpr);
  }
  // річки пакетами за товщиною (кілька шляхів canvas замість тисяч окремих відрізків)
  function drawRivers(ctx, W, c, px) {
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#5b94cf'; const B = 5, paths = Array.from({ length: B }, () => new Path2D());
    for (const cells of W.rivers) {
      const pts = []; cells.forEach(i => pts.push((i % W.w) + 0.5, ((i / W.w) | 0) + 0.5));
      const sm = C.chaikin(pts, 2, false), m = sm.length / 2;
      for (let q = 1; q < m; q++) {
        const ci = cells[Math.min(cells.length - 1, Math.floor(q / m * cells.length))]; if (W.lake[ci]) continue;
        const b = Math.min(B - 1, Math.floor(Math.sqrt(W.acc[ci] / c.maxAcc) * B * 1.6)); paths[b].moveTo(sm[(q - 1) * 2], sm[(q - 1) * 2 + 1]); paths[b].lineTo(sm[q * 2], sm[q * 2 + 1]);
      }
    }
    paths.forEach((pa, b) => { ctx.lineWidth = (1.4 + b * 1.1) * px * 1.5; ctx.stroke(pa); });
  }
  // підсвітка регіону при наведенні на окремому шарі (без перемальовування карти)
  function drawHover(cv, W, view, id) {
    const ctx = cv.getContext('2d'); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
    const c = prep(W); if (id == null || !c.regs[id]) return;
    ctx.setTransform(view.k, 0, 0, view.k, view.tx, view.ty); path(ctx, c.regs[id]); ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fill('evenodd'); ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 2 / view.k; ctx.stroke();
  }
  A.draw = { draw, drawHover, prep, PALETTE };
})();
