/* Закладини: малювання поселення й світової карти на canvas. Без стану гри: усе, що малювати, приходить параметрами. */
(function (root) {
  'use strict';
  const Z = root.Zak = root.Zak || {}, M = root.Mech, B = M.Building;
  const TS = 16, WS = 12; // піксель на клітину поселення / світу
  const COL = ['#2c4a63', '#b3a370', '#58744c', '#2f5238', '#7d7459', '#6f6f7a', '#4b5b46'];
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  let worldImg = null, worldSeed = null;

  const drawLine = (ctx, pts, w, c) => { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); };

  function townSize() { return B.N * TS; }
  function drawTown(ctx, G, ui) {
    const t = G.s.town, N = B.N, accent = css('--accent') || '#d9a25a';
    ctx.canvas.width = ctx.canvas.height = N * TS; ctx.clearRect(0, 0, N * TS, N * TS);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { ctx.fillStyle = COL[t.terrain[y * N + x]]; ctx.fillRect(x * TS, y * TS, TS, TS); if ((x + y) % 2 && t.terrain[y * N + x] > 1) { ctx.fillStyle = 'rgba(0,0,0,.05)'; ctx.fillRect(x * TS, y * TS, TS, TS); } }
    // дороги: лінії між центрами сусідніх клітин
    const R = (x, y) => x >= 0 && y >= 0 && x < N && y < N && t.roads[y * N + x];
    ctx.strokeStyle = '#cdb98f'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (R(x, y)) {
      ctx.beginPath(); ctx.moveTo(x * TS + TS / 2, y * TS + TS / 2); ctx.lineTo(x * TS + TS / 2 + 0.01, y * TS + TS / 2); ctx.stroke();
      if (R(x + 1, y)) { ctx.beginPath(); ctx.moveTo(x * TS + TS / 2, y * TS + TS / 2); ctx.lineTo((x + 1) * TS + TS / 2, y * TS + TS / 2); ctx.stroke(); }
      if (R(x, y + 1)) { ctx.beginPath(); ctx.moveTo(x * TS + TS / 2, y * TS + TS / 2); ctx.lineTo(x * TS + TS / 2, (y + 1) * TS + TS / 2); ctx.stroke(); }
    }
    // площа
    ctx.fillStyle = '#ddd2b0'; ctx.fillRect((B.C - 1) * TS, (B.C - 1) * TS, TS * 3, TS * 3); ctx.strokeStyle = '#a89868'; ctx.lineWidth = 2; ctx.strokeRect((B.C - 1) * TS + 1, (B.C - 1) * TS + 1, TS * 3 - 2, TS * 3 - 2);
    ctx.fillStyle = '#a89868'; ctx.beginPath(); ctx.arc((B.C + .5) * TS, (B.C + .5) * TS, 5, 0, 7); ctx.fill();
    // радіус видобутку вибраної будівлі
    const sb = ui.sel && ui.sel.kind === 'building' ? B.byId(t, ui.sel.id) : null;
    if (sb && B.TYPES[sb.type].yields) { const r = B.TYPES[sb.type].yields.r; ctx.strokeStyle = accent; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc((sb.x + .5) * TS, (sb.y + .5) * TS, (r + .5) * TS, 0, 7); ctx.stroke(); ctx.setLineDash([]); }
    // будівлі
    const w = G.s.settlers;
    for (const b of t.buildings) {
      const T = B.TYPES[b.type], big = b.type === 'hall', x = b.x * TS, y = b.y * TS, s = big ? TS * 2 : TS;
      ctx.fillStyle = T.color; ctx.fillRect(x + 1, y + 1, s - 2, s - 2); ctx.strokeStyle = 'rgba(0,0,0,.55)'; ctx.lineWidth = 1; ctx.strokeRect(x + 1.5, y + 1.5, s - 3, s - 3);
      ctx.fillStyle = '#14110b'; ctx.font = (big ? '15' : '10') + 'px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(T.icon, x + s / 2, y + s / 2 + 0.5);
      if (T.jobs) { const n = w.residents.filter(c => c.work === b.id).length; ctx.fillStyle = n ? '#8dbf95' : '#d9786f'; ctx.fillRect(x + 2, y + s - 4, Math.max(2, (s - 4) * n / T.jobs), 2); }
      if (T.house) { const n = w.residents.filter(c => c.home === b.id).length; ctx.fillStyle = '#e8d29e'; for (let i = 0; i < n; i++) ctx.fillRect(x + 3 + i * 3, y + 2, 2, 2); }
      if (ui.sel && ui.sel.kind === 'building' && ui.sel.id === b.id) { ctx.strokeStyle = accent; ctx.lineWidth = 2; ctx.strokeRect(x - 1, y - 1, s + 2, s + 2); }
    }
    // прибульці на площі
    w.arrivals.forEach((c, i) => { const x = (B.C - 1 + i) * TS + TS / 2, y = (B.C + 1) * TS + TS / 2, sel = ui.sel && ui.sel.kind === 'arrival' && ui.sel.id === c.id; ctx.fillStyle = sel ? accent : '#f2ecd8'; ctx.beginPath(); ctx.arc(x, y - 1, 4.5, 0, 7); ctx.fill(); ctx.strokeStyle = '#3a6b4a'; ctx.lineWidth = 2; ctx.stroke(); });
    // підказка розміщення
    if (ui.hover && ui.tool && ui.tool.startsWith('build:')) {
      const type = ui.tool.slice(6), [hx, hy] = ui.hover, r = B.canPlace(t, type, hx, hy);
      if (r.ok) { ctx.fillStyle = 'rgba(224,200,110,.45)'; for (const [px, py] of r.path) ctx.fillRect(px * TS + 3, py * TS + 3, TS - 6, TS - 6); }
      ctx.fillStyle = r.ok ? 'rgba(141,191,149,.55)' : 'rgba(217,120,111,.55)'; ctx.fillRect(hx * TS, hy * TS, TS, TS);
      if (r.ok && B.TYPES[type].yields) { const Y = B.TYPES[type].yields; ctx.strokeStyle = 'rgba(141,191,149,.7)'; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.arc((hx + .5) * TS, (hy + .5) * TS, (Y.r + .5) * TS, 0, 7); ctx.stroke(); ctx.setLineDash([]); }
    } else if (ui.hover) { ctx.strokeStyle = ui.tool === 'demolish' ? '#d9786f' : 'rgba(255,255,255,.5)'; ctx.lineWidth = 1.5; ctx.strokeRect(ui.hover[0] * TS + .5, ui.hover[1] * TS + .5, TS - 1, TS - 1); }
  }

  function worldBase(world) {
    if (worldImg && worldSeed === world.seed) return worldImg;
    const c = document.createElement('canvas'); c.width = world.w * WS; c.height = world.h * WS; const g = c.getContext('2d');
    for (let y = 0; y < world.h; y++) for (let x = 0; x < world.w; x++) { g.fillStyle = COL[world.biome[y * world.w + x]]; g.fillRect(x * WS, y * WS, WS + 0.5, WS + 0.5); }
    for (const r of world.routes) drawLine(g, r.path.map(([x, y]) => [(x + .5) * WS, (y + .5) * WS]), 2.2, 'rgba(225,205,150,.85)');
    worldSeed = world.seed; return (worldImg = c);
  }
  function drawWorld(ctx, G, ui, frac) {
    const world = G.world; ctx.canvas.width = world.w * WS; ctx.canvas.height = world.h * WS;
    ctx.drawImage(worldBase(world), 0, 0);
    const accent = css('--accent') || '#d9a25a', P = ([x, y]) => [(x + .5) * WS, (y + .5) * WS];
    for (const l of world.lairs) { const [x, y] = P([l.x, l.y]); ctx.fillStyle = '#c0453b'; ctx.strokeStyle = '#2a0c0a'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, y - 7); ctx.lineTo(x + 6.5, y + 5); ctx.lineTo(x - 6.5, y + 5); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.font = 'bold 8px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(l.danger, x, y + 1.5);
      if (ui.sel && ui.sel.kind === 'lair' && ui.sel.id === l.id) { ctx.strokeStyle = accent; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 11, 0, 7); ctx.stroke(); } }
    for (const s of world.S) {
      const [x, y] = P([s.x, s.y]), me = s.id === world.start, r = me ? 7 : s.rank === 'town' ? 6 : 4.5;
      ctx.fillStyle = me ? accent : '#f2ecd8'; ctx.strokeStyle = '#14110b'; ctx.lineWidth = 2;
      if (me) { ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.strokeRect(x - r, y - r, r * 2, r * 2); } else { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.stroke(); }
      ctx.font = '11px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.75)'; const label = me ? 'Ваше' : s.name; ctx.strokeText(label, x, y - r - 4); ctx.fillStyle = me ? accent : '#ece8df'; ctx.fillText(label, x, y - r - 4);
      if (ui.sel && ui.sel.kind === 'settlement' && ui.sel.id === s.id) { ctx.strokeStyle = accent; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, r + 5, 0, 7); ctx.stroke(); }
    }
    for (const c of G.s.caravans) {
      if (!c.path) continue;
      const p = Math.max(0, Math.min(c.path.length - 1, c.pos + c.dir * 5 * (frac || 0))), i = Math.floor(p), a = c.path[i], b = c.path[Math.min(c.path.length - 1, i + 1)], f = p - i;
      const x = (a[0] + (b[0] - a[0]) * f + .5) * WS, y = (a[1] + (b[1] - a[1]) * f + .5) * WS;
      ctx.fillStyle = c.status === 'out' ? '#ffd76a' : '#b9b08a'; ctx.strokeStyle = '#14110b'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, y - 6); ctx.lineTo(x + 6, y); ctx.lineTo(x, y + 6); ctx.lineTo(x - 6, y); ctx.closePath(); ctx.fill(); ctx.stroke();
      if (c.escort) { ctx.fillStyle = '#6a7fd0'; ctx.fillRect(x - 1.5, y - 1.5, 3, 3); }
    }
  }
  // клітина під курсором: клієнтські координати в клітину
  function cellAt(canvas, ev, cell, n) { const r = canvas.getBoundingClientRect(), x = Math.floor((ev.clientX - r.left) / r.width * canvas.width / cell), y = Math.floor((ev.clientY - r.top) / r.height * canvas.height / cell); return x >= 0 && y >= 0 && x < n[0] && y < n[1] ? [x, y] : null; }
  Z.Render = { TS, WS, drawTown, drawWorld, cellAt, townSize };
})(globalThis);
