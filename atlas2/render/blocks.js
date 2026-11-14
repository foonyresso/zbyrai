// Атлас 2.0: малювання безкінечного світу. Що тут: створені материки малюються звичайним A.draw.draw зі зсувом (спершу вода всіх, потім суша), закриті — хмарами (render/clouds.js), між створеними морські шляхи. Логіка материків: core/blocks.js, core/tiles.js
(function () {
  'use strict';
  const A = globalThis.Atlas2;
  const local = (b, view) => ({ k: view.k, tx: view.tx + b.ox * view.k, ty: view.ty + b.oy * view.k }); // вигляд у координатах клітин самого материка
  // вікно екрана в клітинах світу, з запасом m частки вікна
  function window_(cv, view, m) {
    const x0 = -view.tx / view.k, x1 = (cv.width - view.tx) / view.k, y0 = -view.ty / view.k, y1 = (cv.height - view.ty) / view.k, dx = (x1 - x0) * (m || 0), dy = (y1 - y0) * (m || 0);
    return { x0: x0 - dx, y0: y0 - dy, x1: x1 + dx, y1: y1 + dy };
  }
  const visible = (B, cv, view, m) => { const r = window_(cv, view, m); return B.descsIn(r.x0, r.y0, r.x1, r.y1); };
  // opts: { layers, opening: {id, f, label} — материк, що створюється, warm(блок) — підготувати растри }
  function drawBlocks(cv, B, view, opts) {
    const ctx = cv.getContext('2d'), L = opts.layers, descs = visible(B, cv, view, 0), built = [], clouds = [];
    for (const d of descs) { const b = B.get(d.id); if (b && A.draw.ready(b.W)) built.push(b); else { clouds.push(d); if (b && opts.warm && !b.warming) { b.warming = true; opts.warm(b); } } } // растри материка готуються кроками (не готові — ще під хмарою)
    ctx.globalAlpha = 1; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#527aae'; ctx.fillRect(0, 0, cv.width, cv.height); // глибокий океан: тло карти
    if (L.danger !== false) { ctx.fillStyle = 'rgba(60,0,70,.588)'; ctx.fillRect(0, 0, cv.width, cv.height); } // найвищий рівень небезпеки над водою: смуги моря між материками мають той самий колір, що й край кожного материка
    for (const b of built) A.draw.draw(cv, b.W, local(b, view), { layers: L, keep: true, pass: 'ocean' });
    for (const b of built) A.draw.draw(cv, b.W, local(b, view), { layers: L, keep: true, pass: 'land' });
    if (L.roads !== false && B.links.length) {
      const px = 1 / view.k; ctx.setTransform(view.k, 0, 0, view.k, view.tx, view.ty); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 1.1 * px; ctx.setLineDash([6 * px, 4 * px]); ctx.beginPath();
      for (const l of B.links) for (const s of l.segs) { const p = A.Contours.chaikin(A.Contours.relaxOpen(s, 3), 2, false); ctx.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) ctx.lineTo(p[i], p[i + 1]); }
      ctx.stroke(); ctx.setLineDash([]);
    }
    if (clouds.length) { ctx.setTransform(view.k, 0, 0, view.k, view.tx, view.ty); for (const d of clouds) A.Clouds.draw(ctx, d, view.k, 1 / view.k); for (const d of clouds) A.Clouds.label(ctx, d, view, opts.opening && opts.opening.id === d.id ? opts.opening : B.get(d.id) ? { f: 1, label: 'Готую малюнок' } : null); }
  }
  A.BlocksView = { local, window: window_, visible, drawBlocks };
})();
