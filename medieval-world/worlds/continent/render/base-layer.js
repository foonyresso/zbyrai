// Растровий шар місцевості: море, суша за біомами з тінями рельєфу, берег; окремо — політичне забарвлення та «декор» (дерева, гори).
(function () {
  'use strict';
  const R = (globalThis.RealmMap = globalThis.RealmMap || {});
  const mkCanvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

  function quad(ctx, g, x, y, S) {
    const vw = g.vw, a = y * vw + x, b = a + 1, c = a + vw, d = c + 1;
    ctx.beginPath(); ctx.moveTo(g.vx[a] * S, g.vy[a] * S); ctx.lineTo(g.vx[b] * S, g.vy[b] * S); ctx.lineTo(g.vx[d] * S, g.vy[d] * S); ctx.lineTo(g.vx[c] * S, g.vy[c] * S); ctx.closePath();
  }
  function tracePath(ctx, lines, S) {
    for (const l of lines) { const p = l.pts; if (p.length < 4) continue; ctx.moveTo(p[0] * S, p[1] * S); for (let i = 2; i < p.length; i += 2) ctx.lineTo(p[i] * S, p[i + 1] * S); if (l.closed) ctx.closePath(); }
  }

  function renderBase(world, geom, S) {
    const g = world.grid, cv = mkCanvas(Math.ceil(g.w * S), Math.ceil(g.h * S)), ctx = cv.getContext('2d'), P = R.Palette, B = R.Data.biomes;
    ctx.fillStyle = P.sea(7); ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.lineJoin = 'round'; ctx.lineWidth = 1;
    // вода: відтінок за відстанню до берега
    for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
      const i = y * g.w + x, wt = world.water[i]; if (wt === 0) continue;
      const col = wt === 2 ? P.lake : P.sea(world.shore[i] + (P.hash(x, y, 1) < 0.25 ? 1 : 0));
      ctx.fillStyle = col; ctx.strokeStyle = col; quad(ctx, g, x, y, S); ctx.fill(); ctx.stroke();
    }
    // світле «сяйво» мілководдя біля берега
    ctx.save(); ctx.beginPath(); tracePath(ctx, geom.coast, S); ctx.strokeStyle = 'rgba(214,240,246,.5)'; ctx.lineWidth = S * 1.5; ctx.stroke(); ctx.restore();
    // суша в межах згладженого берега
    ctx.save(); ctx.beginPath(); tracePath(ctx, geom.coast, S); ctx.clip('evenodd');
    const h = world.height;
    for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
      const i = y * g.w + x; if (world.water[i] !== 0) continue;
      const nw = h[Math.max(0, y - 1) * g.w + Math.max(0, x - 1)], se = h[Math.min(g.h - 1, y + 1) * g.w + Math.min(g.w - 1, x + 1)];
      const sh = Math.max(0.8, Math.min(1.22, 1 + (nw - se) * 8)), nz = 0.94 + P.hash(x, y, 2) * 0.12;
      const b = B[world.bio[i]], col = P.shade(b.color, sh * nz * (b.id === 'peaks' ? 1 : 1));
      ctx.fillStyle = col; ctx.strokeStyle = col; quad(ctx, g, x, y, S); ctx.fill(); ctx.stroke();
    }
    ctx.restore();
    // лінія берега
    ctx.beginPath(); tracePath(ctx, geom.coast, S); ctx.strokeStyle = 'rgba(58,44,30,.85)'; ctx.lineWidth = Math.max(1, S * 0.14); ctx.stroke();
    return cv;
  }

  // Політичне забарвлення: напівпрозорий колір провінції на суші
  function renderPolitical(world, geom, S) {
    const g = world.grid, cv = mkCanvas(Math.ceil(g.w * S), Math.ceil(g.h * S)), ctx = cv.getContext('2d'), P = R.Palette;
    ctx.save(); ctx.beginPath(); tracePath(ctx, geom.coast, S); ctx.clip('evenodd');
    for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
      const i = y * g.w + x, pv = world.province[i]; if (pv < 0 || world.water[i] !== 0) continue;
      const col = P.province(world.provinces[pv].hue, 0.30); ctx.fillStyle = col; ctx.strokeStyle = col; quad(ctx, g, x, y, S); ctx.fill(); ctx.stroke();
    }
    ctx.restore(); return cv;
  }
  R.BaseLayer = { renderBase, renderPolitical, tracePath, mkCanvas };
})();
