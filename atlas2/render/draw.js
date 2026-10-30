// Атлас 2.0: малювання карти на canvas. Растр рельєфу (кеш) + векторні шари з плавними контурами. Одиниця координат: комірка.
(function () {
  'use strict';
  const A = globalThis.Atlas2, C = A.Contours;
  const PALETTE = ['#b58fd1', '#e0a35f', '#7fbf7f', '#e08f8f', '#6fb8c9', '#d6c75a', '#9aa0e0', '#d98fc0', '#8fc9a6', '#c9a07a'];
  const cache = new WeakMap();

  function prep(W) {
    let c = cache.get(W); if (c) return c; const { w, h } = W;
    const pn = C.net(w, h, i => W.province[i] >= 0 ? W.province[i] : W.land[i] && !W.lake[i] ? -2 : -1), // -2: нічия суша (без провінції)
       rn = C.net(w, h, i => W.region[i]);
    const pnW = C.net(w, h, i => W.provW[i]), rnW = C.net(w, h, i => W.regW[i]);
    c = { pn, rn, land: C.polys(pn, l => l !== -1), lakes: C.smoothLoops(w, h, i => W.lake[i] === 1, 3), provs: W.provinces.map(p => C.polys(pnW, l => l === p.id)), regs: W.regions.map(g => C.polys(rnW, l => l === g.id)) }; // для підсвітки: суша + прибережна вода
    c.geom = A.RoadGeom.build(W);
    const S = 4, img = A.Raster.build(W, S, (a, b) => new ImageData(a, b));
    const toCanvas = d => { const cv = document.createElement('canvas'); cv.width = d.width; cv.height = d.height; cv.getContext('2d').putImageData(d, 0, 0); return cv; };
    c.ocean = toCanvas(img.ocean); c.landImg = toCanvas(img.land);
    if (A.Params.isVoid(W.params)) c.roots = A.Void.roots(W, c.land); else if (A.Void) c.sub = A.Void.subLayer(W, toCanvas);
    if (W.tier) { // шар небезпеки: по пікселю на клітину, масштабується згладжено
      const d = new ImageData(w, h), COL = [null, [255, 232, 110, 70], [255, 170, 60, 85], [240, 100, 45, 100], [205, 45, 45, 115], [150, 20, 75, 135], [60, 0, 70, 150]];
      for (let i = 0; i < w * h; i++) { const q = COL[W.tier[i]]; if (q) { d.data[i * 4] = q[0]; d.data[i * 4 + 1] = q[1]; d.data[i * 4 + 2] = q[2]; d.data[i * 4 + 3] = q[3]; } }
      c.danger = toCanvas(d);
    }
    c.maxAcc = 1; for (let i = 0; i < W.acc.length; i++) if (W.acc[i] > c.maxAcc) c.maxAcc = W.acc[i]; cache.set(W, c); return c;
  }
  const path = (ctx, loops) => { ctx.beginPath(); for (const p of loops) { ctx.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) ctx.lineTo(p[i], p[i + 1]); ctx.closePath(); } };

  // view: {k px/клітина, tx, ty}; opts: {layers:{...}, hoverRegion, selRegion}
  function draw(cv, W, view, opts) {
    const c = prep(W), ctx = cv.getContext('2d'), L = opts.layers, { k, tx, ty } = view, px = 1 / k;
    const VOID = A.Params.isVoid(W.params);
    ctx.globalAlpha = 1; ctx.setTransform(1, 0, 0, 1, 0, 0); if (VOID) A.Void.backdrop(ctx, cv, view); else { ctx.fillStyle = '#527aae'; ctx.fillRect(0, 0, cv.width, cv.height); }
    ctx.setTransform(k, 0, 0, k, tx, ty); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'medium';
    ctx.drawImage(c.ocean, 0, 0, W.w, W.h);
    if (VOID) { // обрив: корені звисають у безодню, під краєм темна тінь і бірюзове світіння
      A.Void.drawRoots(ctx, c.roots, px);
      ctx.save(); path(ctx, c.land); ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(0,0,0,.5)'; ctx.lineWidth = 9 * px; ctx.stroke(); ctx.strokeStyle = 'rgba(47,224,198,.4)'; ctx.lineWidth = 3.5 * px; ctx.stroke(); ctx.restore();
    } else { // берег: світле сяйво
      ctx.save(); path(ctx, c.land); ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 7 * px; ctx.stroke(); ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 3.5 * px; ctx.stroke(); ctx.restore();
    }
    ctx.save(); path(ctx, c.land); ctx.clip(); ctx.drawImage(c.landImg, 0, 0, W.w, W.h);
    if (c.sub && L.sub !== false) ctx.drawImage(c.sub, 0, 0, W.w, W.h); // плями біомів основного світу
    if (L.fill) W.provinces.forEach((p, n) => { path(ctx, c.provs[n]); ctx.fillStyle = PALETTE[n % PALETTE.length] + '70'; ctx.fill('evenodd'); });
    if (L.borders) {
      ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.strokeStyle = 'rgba(70,50,30,.45)'; ctx.lineWidth = 1 * px; ctx.setLineDash([4 * px, 3 * px]);
      const strokeChains = (chains, ok) => { ctx.beginPath(); for (const ch of chains) { if (!ok(ch)) continue; const p = ch.pts; ctx.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) ctx.lineTo(p[i], p[i + 1]); if (ch.closed) ctx.closePath(); } ctx.stroke(); };
      strokeChains(c.rn, ch => ch.lo >= 0 && ch.hi >= 0 && W.regions[ch.lo].prov === W.regions[ch.hi].prov); ctx.setLineDash([]);
      ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 4.2 * px; strokeChains(c.pn, ch => ch.lo >= 0 && ch.hi >= 0);
      ctx.strokeStyle = 'rgba(60,40,70,.75)'; ctx.lineWidth = 1.8 * px; strokeChains(c.pn, ch => ch.lo >= 0 && ch.hi >= 0);
    }
    ctx.restore();
    if (L.rivers) { ctx.save(); path(ctx, c.land); ctx.clip(); drawRivers(ctx, W, c, px); ctx.restore(); } // річки лише по суші; озера малюються поверх, тож річка входить у озеро й виходить з нього
    path(ctx, c.lakes); ctx.fillStyle = '#7fb2e0'; ctx.fill('evenodd'); ctx.strokeStyle = 'rgba(70,110,160,.8)'; ctx.lineWidth = 1 * px; ctx.stroke();
    if (L.danger && c.danger) ctx.drawImage(c.danger, 0, 0, W.w, W.h); // небезпека покриває і воду: моря, океани, озера
    if (A.drawRoads && L.roads) A.drawRoads(ctx, W, px, k, c.geom);
    if (VOID) { A.Void.drawBigRoots(ctx, W, px); if (L.roads) A.Void.drawTunnels(ctx, W, px); if (L.wall !== false) A.Void.drawWall(ctx, W, px, k); A.Void.drawTree(ctx, W, px, k); } // коріння й дерево зверху карти, стіна з фортецями
    if (A.TownMap) A.TownMap.draw(cv, W, view, L, c.geom); // міста з'являються на карті з наближенням, дороги збігаються з дорогами карти
    if (A.drawLandmarks) A.drawLandmarks(ctx, W, px, k, L);
    if (A.drawResources && L.resources) A.drawResources(ctx, W, px, k, L);
    if (A.drawSites && L.sites) A.drawSites(ctx, W, px, k, L);
    if (A.drawPlaces && (L.places || L.labels)) A.drawPlaces(ctx, W, px, k, L, PALETTE);
  }
  // лінійка відстані (екранні координати): «гарне» число кілометрів, довжина смуги ~ 110–200 пікселів
  function scaleBar(ctx, cv, W, k) {
    const dpr = devicePixelRatio || 1, kmPx = W.params.kmPerCell / k, target = 150 * dpr * kmPx;
    const nice = [0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000].filter(v => v <= target).pop() || 0.02, len = nice / kmPx, x = cv.width - 26 * dpr - len, y = cv.height - 26 * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.fillRect(x - 8 * dpr, y - 20 * dpr, len + 16 * dpr, 34 * dpr);
    ctx.strokeStyle = '#222'; ctx.fillStyle = '#222'; ctx.lineWidth = 2 * dpr; ctx.beginPath(); ctx.moveTo(x, y - 5 * dpr); ctx.lineTo(x, y + 4 * dpr); ctx.lineTo(x + len, y + 4 * dpr); ctx.lineTo(x + len, y - 5 * dpr); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + len / 2, y + 4 * dpr); ctx.lineTo(x + len / 2, y - 1 * dpr); ctx.stroke();
    ctx.font = `600 ${12 * dpr}px sans-serif`; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText(nice < 1 ? Math.round(nice * 1000) + ' м' : nice + ' км', x, y - 9 * dpr);
  }
  // річки пакетами за товщиною (кілька шляхів canvas замість тисяч окремих відрізків)
  function drawRivers(ctx, W, c, px) {
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#5b94cf'; const B = 5, paths = Array.from({ length: B }, () => new Path2D());
    for (const cells of W.rivers) {
      const pts = []; // русло звивається: точки зсуваються впоперек течії на стабільну «випадкову» величину від клітини
      cells.forEach((i, n) => {
        const x = (i % W.w) + 0.5, y = ((i / W.w) | 0) + 0.5, pi = cells[Math.max(0, n - 1)], ni = cells[Math.min(cells.length - 1, n + 1)];
        let dx = (ni % W.w) - (pi % W.w), dy = ((ni / W.w) | 0) - ((pi / W.w) | 0); const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
        const hsh = ((Math.imul(i, 2654435761) >>> 8) & 1023) / 1023 - 0.5, off = (n === 0 || n === cells.length - 1) ? 0 : hsh * 1.1;
        pts.push(x - dy * off, y + dx * off);
      });
      const sm = C.chaikin(pts, 2, false), m = sm.length / 2;
      for (let q = 1; q < m; q++) {
        const ci = cells[Math.min(cells.length - 1, Math.floor(q / m * cells.length))];
        const b = Math.min(B - 1, Math.floor(Math.log2(1 + W.acc[ci] / (W.riverThr || 20)) * 0.9)); paths[b].moveTo(sm[(q - 1) * 2], sm[(q - 1) * 2 + 1]); paths[b].lineTo(sm[q * 2], sm[q * 2 + 1]);
      }
    }
    // товщина в клітинах карти (росте й зменшується разом з масштабом), але не тонша за 1 піксель
    paths.forEach((pa, b) => { ctx.lineWidth = Math.max(1.7 * px, 0.12 + b * 0.07); ctx.stroke(pa); });
  }
  // підсвітка регіону при наведенні на окремому шарі (без перемальовування карти)
  function drawHover0(cv, W, view, id, level, mark) {
    if (!W) return;
    const ctx = cv.getContext('2d'); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
    scaleBar(ctx, cv, W, view.k); // лінійка на шарі поверх карти: під час руху камери перераховується, а не їде разом із картинкою
    ctx.setTransform(view.k, 0, 0, view.k, view.tx, view.ty);
    if (mark) { ctx.beginPath(); ctx.arc(mark.x + 0.5 + (mark.ox || 0), mark.y + 0.5 + (mark.oy || 0), 9 / view.k, 0, 6.2832); ctx.strokeStyle = 'rgba(255,255,255,.95)'; ctx.lineWidth = 2.5 / view.k; ctx.stroke(); ctx.strokeStyle = 'rgba(30,20,10,.9)'; ctx.lineWidth = 1 / view.k; ctx.stroke(); }
    const c = prep(W), polys = level === 'prov' ? c.provs : c.regs; if (id == null || !level || !polys[id]) return;
    path(ctx, polys[id]); ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fill('evenodd'); ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 2 / view.k; ctx.stroke();
  }
  function drawHover(cv, W, view, id, level, mark) { drawHover0(cv, W, view, id, level, mark); if (W && A.TownMap) A.TownMap.drawOver(cv, W, view); }
  A.draw = { draw, drawHover, prep, drawRivers, PALETTE };
})();
