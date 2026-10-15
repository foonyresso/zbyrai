// Векторні шари поверх растру: межі, річки, дороги, морські шляхи, небезпека. Малюються в координатах комірок; товщини задаються в пікселях екрана.
(function () {
  'use strict';
  const R = (globalThis.RealmMap = globalThis.RealmMap || {});

  function stroke(ctx, pts, k) {
    if (pts.length < 4) return;
    ctx.beginPath(); ctx.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]); ctx.stroke();
  }
  function style(ctx, k, color, px, dash, cap) { ctx.strokeStyle = color; ctx.lineWidth = px / k; ctx.setLineDash(dash ? dash.map(d => d / k) : []); ctx.lineCap = cap || 'round'; ctx.lineJoin = 'round'; }
  const wscale = k => Math.max(0.7, Math.min(2.2, Math.sqrt(k / 8)));

  function drawBorders(ctx, geom, world, view, L) {
    const k = view.k, ws = wscale(k);
    if (L.regionBorders) { style(ctx, k, 'rgba(70,45,30,.55)', 1.1 * ws, [5 * ws, 4 * ws], 'butt'); for (const l of geom.regionBorders) stroke(ctx, l.pts, k); }
    if (L.provinceBorders) {
      style(ctx, k, 'rgba(255,255,255,.35)', 6 * ws); for (const l of geom.provinceBorders) stroke(ctx, l.pts, k);
      style(ctx, k, R.Palette.theme.border, 1.9 * ws, [10 * ws, 3 * ws, 2 * ws, 3 * ws], 'butt'); for (const l of geom.provinceBorders) stroke(ctx, l.pts, k);
    }
  }
  function drawRivers(ctx, geom, view) {
    const k = view.k, ws = wscale(k);
    for (const r of geom.rivers) { style(ctx, k, R.Palette.theme.river, Math.min(3.4, 0.9 + Math.log2(1 + r.flow / 14) * 0.55) * ws); stroke(ctx, r.pts, k); }
  }
  const ROAD = {
    major:  { casing: '#2e2113', cw: 5.0, color: '#e2c27f', w: 3.0 },
    medium: { casing: '#2e2113', cw: 3.6, color: '#d1a967', w: 2.0 },
    minor:  { color: '#6b4a2a', w: 1.5 },
    trail:  { color: '#6b4a2a', w: 1.15, dash: [2.6, 3.2] },
  };
  // дороги за кольорами теми світу
  function themed(cls) { const st = Object.assign({}, ROAD[cls]), rt = R.Palette.theme.roads; if (cls === 'major' || cls === 'medium') { st.color = rt[cls]; st.casing = rt.casing; } else st.color = rt.minor; return st; }
  function drawRoads(ctx, geom, view, L) {
    const k = view.k, ws = wscale(k);
    for (const cls of ['trail', 'minor', 'medium', 'major']) {
      if (!L['road_' + cls]) continue; const st = themed(cls), list = geom.roadsByClass[cls];
      if (st.casing) { style(ctx, k, st.casing, st.cw * ws); for (const r of list) stroke(ctx, r.pts, k); }
      style(ctx, k, st.color, st.w * ws, st.dash ? st.dash.map(d => d * ws) : null, st.dash ? 'butt' : 'round'); for (const r of list) stroke(ctx, r.pts, k);
    }
    // мости: невеликі поперечні позначки на річках
    if (L.bridges !== false && k > 6) {
      ctx.fillStyle = '#e9d9b6'; ctx.strokeStyle = '#2e2113'; ctx.lineWidth = 0.9 / k; const g = geom.world.grid;
      for (const cls of ['major', 'medium', 'minor']) { if (!L['road_' + cls]) continue; for (const r of geom.roadsByClass[cls]) for (const b of r.bridges) { const s = 2.1 / k * ws; ctx.fillRect(g.cx[b] - s, g.cy[b] - s * 0.6, s * 2, s * 1.2); ctx.strokeRect(g.cx[b] - s, g.cy[b] - s * 0.6, s * 2, s * 1.2); } }
    }
  }
  function drawSeaRoutes(ctx, geom, world, view) {
    const k = view.k, ws = wscale(k);
    style(ctx, k, 'rgba(12,38,64,.55)', 3 * ws); for (const r of geom.sea) stroke(ctx, r.pts, k);
    style(ctx, k, R.Palette.theme.route, 1.5 * ws, [6 * ws, 5 * ws], 'butt'); for (const r of geom.sea) stroke(ctx, r.pts, k);
    // сполучення порту з початком шляху
    style(ctx, k, 'rgba(243,251,255,.85)', 1.1 * ws, [2 * ws, 2.5 * ws], 'butt');
    for (const s of world.settlements) if (s.port && s.dock >= 0) { ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(world.grid.cx[s.dock], world.grid.cy[s.dock]); ctx.stroke(); }
  }
  // Небезпека: червоне сяйво навколо лігв (маленький растр, що масштабується згладжено)
  function dangerCanvas(world) {
    const g = world.grid, cv = R.BaseLayer.mkCanvas(g.w, g.h), cx = cv.getContext('2d'), img = cx.createImageData(g.w, g.h);
    for (let i = 0; i < g.n; i++) { const d = world.danger[i]; img.data[4 * i] = 210; img.data[4 * i + 1] = 30; img.data[4 * i + 2] = 40; img.data[4 * i + 3] = Math.min(150, d * 1.1); }
    cx.putImageData(img, 0, 0); return cv;
  }
  function drawRoute(ctx, cells, world, view) {
    if (!cells || cells.length < 2) return; const k = view.k, g = world.grid, pts = R.Contours.pathLine(g, cells, 1);
    style(ctx, k, 'rgba(0,0,0,.65)', 6); stroke(ctx, pts, k); style(ctx, k, '#ff5a3c', 3.2, [8, 5], 'butt'); stroke(ctx, pts, k);
  }
  R.Vectors = { drawBorders, drawRivers, drawRoads, drawSeaRoutes, dangerCanvas, drawRoute, wscale };
})();
