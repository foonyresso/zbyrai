// Атлас 2.0: малювання безкінечного світу. Що тут: видимі блоки-материки малюються звичайним A.draw.draw зі зсувом, між ними морські шляхи. Логіка блоків: core/blocks.js
(function () {
  'use strict';
  const A = globalThis.Atlas2;
  const local = (b, view) => ({ k: view.k, tx: view.tx + b.ox * view.k, ty: view.ty + b.oy * view.k }); // вигляд у координатах клітин самого блока
  // діапазон номерів блоків, що потрапляють у вікно (з запасом m частки блока)
  function range(B, cv, view, m) {
    const x0 = -view.tx / view.k, x1 = (cv.width - view.tx) / view.k, y0 = -view.ty / view.k, y1 = (cv.height - view.ty) / view.k;
    return { bx0: Math.floor((x0 - m * B.bw) / B.bw), bx1: Math.floor((x1 + m * B.bw) / B.bw), by0: Math.floor((y0 - m * B.bh) / B.bh), by1: Math.floor((y1 + m * B.bh) / B.bh) };
  }
  function drawBlocks(cv, B, view, opts) {
    const ctx = cv.getContext('2d'), r = range(B, cv, view, 0), L = opts.layers;
    ctx.globalAlpha = 1; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#527aae'; ctx.fillRect(0, 0, cv.width, cv.height); // глибокий океан: так само фарбується край кожного блока, тож шва немає
    for (let by = r.by0; by <= r.by1; by++) for (let bx = r.bx0; bx <= r.bx1; bx++) { const b = B.get(bx, by); if (b) A.draw.draw(cv, b.W, local(b, view), { layers: L, keep: true }); }
    if (L.roads === false || !B.links.length) return;
    const px = 1 / view.k; ctx.setTransform(view.k, 0, 0, view.k, view.tx, view.ty); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 1.1 * px; ctx.setLineDash([6 * px, 4 * px]); ctx.beginPath();
    for (const l of B.links) for (const s of l.segs) { const p = A.Contours.chaikin(A.Contours.relaxOpen(s, 3), 2, false); ctx.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) ctx.lineTo(p[i], p[i + 1]); }
    ctx.stroke(); ctx.setLineDash([]);
  }
  A.BlocksView = { local, range, drawBlocks };
})();
