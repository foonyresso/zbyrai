/* Закладини: ігровий шар поверх карти Атласу (на canvas #over): каравани, курсор будівництва, прибульці, виділення. Координати: клітини карти (Атлас) і плитки ділянки (метри від центру). */
(function (root) {
  'use strict';
  const Z = root.Zak = root.Zak || {}, B = root.Mech.Building, CSM = 250; // метрів у клітині карти
  const accent = '#efc88c';
  const geo = G => { const s = G.world.S[G.world.start]; return { cx: s.x + 0.5, cy: s.y + 0.5 }; };
  // плитка ↔ клітина карти
  const tileCenter = (G, tx, ty) => { const g = geo(G); return [g.cx + (tx - B.C) * B.TILE / CSM, g.cy + (ty - B.C) * B.TILE / CSM]; };
  const cellToTile = (G, fx, fy) => { const g = geo(G); return [Math.round((fx - g.cx) * CSM / B.TILE) + B.C, Math.round((fy - g.cy) * CSM / B.TILE) + B.C]; };
  const townScale = view => view.k / CSM; // пікселів у метрі
  const townVisible = view => townScale(view) >= 0.22;

  function draw(ov, G, ui, view, frac) {
    const g = ov.getContext('2d'), dpr = root.devicePixelRatio || 1, S = (x, y) => [view.tx + x * view.k, view.ty + y * view.k], m = townScale(view);
    g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
    const home = geo(G), [hx, hy] = S(home.cx, home.cy);
    // позначка вашого поселення здалеку
    if (view.k < 70) { const r = (11 + 2 * Math.sin(Date.now() / 400)) * dpr; g.beginPath(); g.arc(hx, hy, r, 0, 7); g.strokeStyle = accent; g.lineWidth = 2.5 * dpr; g.stroke(); g.strokeStyle = 'rgba(0,0,0,.6)'; g.lineWidth = 1 * dpr; g.stroke(); g.font = `700 ${12 * dpr}px sans-serif`; g.textAlign = 'center'; g.fillStyle = accent; g.strokeStyle = 'rgba(0,0,0,.8)'; g.lineWidth = 3 * dpr; g.strokeText('Ваше поселення', hx, hy + r + 14 * dpr); g.fillText('Ваше поселення', hx, hy + r + 14 * dpr); }
    // каравани: маршрут і значок, що їде дорогою
    for (const c of G.s.caravans) {
      if (!c.path) continue; const sp = G.world.SPEED_CELLS;
      g.beginPath(); c.path.forEach(([x, y], i) => { const [px, py] = S(x + 0.5, y + 0.5); i ? g.lineTo(px, py) : g.moveTo(px, py); }); g.strokeStyle = 'rgba(255,215,106,.55)'; g.lineWidth = 2.2 * dpr; g.setLineDash([6 * dpr, 5 * dpr]); g.stroke(); g.setLineDash([]);
      const p = Math.max(0, Math.min(c.path.length - 1, c.pos + c.dir * sp * (frac || 0))), i = Math.floor(p), a = c.path[i], b = c.path[Math.min(c.path.length - 1, i + 1)], f = p - i, [x, y] = S(a[0] + (b[0] - a[0]) * f + 0.5, a[1] + (b[1] - a[1]) * f + 0.5), r = 8 * dpr;
      g.beginPath(); g.moveTo(x, y - r); g.lineTo(x + r, y); g.lineTo(x, y + r); g.lineTo(x - r, y); g.closePath(); g.fillStyle = c.status === 'out' ? '#ffd76a' : '#cfc79a'; g.fill(); g.strokeStyle = '#1b1408'; g.lineWidth = 1.8 * dpr; g.stroke();
      g.fillStyle = '#1b1408'; g.fillRect(x - 3 * dpr, y - 1.5 * dpr, 6 * dpr, 3 * dpr); if (c.escort) { g.fillStyle = '#6a7fd0'; g.fillRect(x - 1.5 * dpr, y - 5 * dpr, 3 * dpr, 3 * dpr); }
    }
    if (townVisible(view)) {
      const T = B.TILE, [ox, oy] = S(home.cx, home.cy), pxm = m, X = tx => ox + (tx - B.C) * T * pxm, Y = ty => oy + (ty - B.C) * T * pxm, ts = T * pxm;
      // прибульці на площі
      G.s.settlers.arrivals.forEach((c, i) => { const x = X(B.C - 1 + i) , y = Y(B.C + 1), sel = ui.sel && ui.sel.kind === 'arrival' && ui.sel.id === c.id, r = Math.max(4 * dpr, ts * 0.22); g.beginPath(); g.arc(x, y, r, 0, 7); g.fillStyle = sel ? accent : '#f2ecd8'; g.fill(); g.strokeStyle = '#3a6b4a'; g.lineWidth = 2 * dpr; g.stroke(); });
      const sb = ui.sel && ui.sel.kind === 'building' && B.byId(G.s.town, ui.sel.id);
      if (sb) { const k = sb.type === 'hall' ? 2 : 1; g.strokeStyle = accent; g.lineWidth = 2.5 * dpr; g.strokeRect(X(sb.x) - ts / 2, Y(sb.y) - ts / 2, ts * k, ts * k); const Yd = B.TYPES[sb.type].yields; if (Yd) { g.setLineDash([6 * dpr, 5 * dpr]); g.beginPath(); g.arc(X(sb.x), Y(sb.y), Yd.r * CSM * pxm, 0, 7); g.strokeStyle = 'rgba(239,200,140,.55)'; g.lineWidth = 1.5 * dpr; g.stroke(); g.setLineDash([]); } }
      // курсор будівництва
      if (ui.hoverTile) {
        const [tx, ty] = ui.hoverTile, tool = ui.tool || 'select';
        if (tool.startsWith('build:')) {
          const type = tool.slice(6), r = B.canPlace(G.s.town, type, tx, ty);
          if (r.ok) { g.fillStyle = 'rgba(224,200,110,.5)'; for (const [px, py] of r.path) g.fillRect(X(px) - ts * 0.3, Y(py) - ts * 0.3, ts * 0.6, ts * 0.6); }
          g.fillStyle = r.ok ? 'rgba(120,200,130,.5)' : 'rgba(220,100,90,.5)'; g.fillRect(X(tx) - ts / 2, Y(ty) - ts / 2, ts, ts); g.strokeStyle = r.ok ? '#8dd29a' : '#e07a70'; g.lineWidth = 2 * dpr; g.strokeRect(X(tx) - ts / 2, Y(ty) - ts / 2, ts, ts);
          const Yd = B.TYPES[type].yields; if (r.ok && Yd) { g.setLineDash([6 * dpr, 5 * dpr]); g.beginPath(); g.arc(X(tx), Y(ty), Yd.r * CSM * pxm, 0, 7); g.strokeStyle = 'rgba(141,210,154,.75)'; g.lineWidth = 1.5 * dpr; g.stroke(); g.setLineDash([]); }
        } else if (tool === 'demolish') { const id = G.s.town.occ[ty * B.N + tx]; if (id > 0) { const b = B.byId(G.s.town, id), k = b.type === 'hall' ? 2 : 1; g.strokeStyle = '#e07a70'; g.lineWidth = 3 * dpr; g.strokeRect(X(b.x) - ts / 2, Y(b.y) - ts / 2, ts * k, ts * k); } }
        else { g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 1.5 * dpr; g.strokeRect(X(tx) - ts / 2, Y(ty) - ts / 2, ts, ts); }
      }
    }
    g.restore();
  }
  Z.Overlay = { draw, cellToTile, tileCenter, townVisible, townScale, geo };
})(globalThis);
