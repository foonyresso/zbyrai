// Атлас 2.0, місто: малювання замку. Земля дворів (світлі двори з тінню від муру, мотт, сад, стежки, дерева, завали) іде під вулиці й споруди, а темний зубчастий мур із великими баштами,
// внутрішнім муром, брамами (надбрамна споруда, барбакан, причал) — поверх споруд; на дворі плашка з назвою. Споруди замку малює render/townkeepb.js.
// x: {g, k, lod, setA, vis, TAU, halo} — полотно й допоміжні функції з render/town.js (halo з'являється пізніше за walls).
(function () {
  'use strict';
  const A = globalThis.Atlas2, TAU = Math.PI * 2;
  // єдина палітра каменю: світлі двори, темний мур, світліші дахи башт; прапорці — один колір на всі замки
  const COL = { outer: '#ede8d5', inner: '#f5f0df', ruinOuter: '#dedbc3', ruinInner: '#e4e1ca', slope: 'rgba(150,128,84,.36)', top: '#dccfa6', garden: '#b4c97e', line: '#292933', body: '#85849a', walk: '#b9b8ca', ruBody: '#908f9d', ruWalk: '#b5b4c0',
    tower: '#a2a1b8', ruTower: '#9c9ba8', cap: ['#d8d7e8', '#b6b5cd'], flag: '#b5483c', road: '#e4d9bb', shadow: 'rgba(28,28,44,.3)', gate: '#9d9cb4' };
  const path = (g, p, k) => { g.beginPath(); g.moveTo(p[0] * k, p[1] * k); for (let i = 2; i < p.length; i += 2) g.lineTo(p[i] * k, p[i + 1] * k); };
  // земля замку: двори (з тінню від муру по краю), мотт (насипний горб із насічками), сад, стежки, дерева й завали
  function ground(x, c) {
    const kp = c.keep; if (!kp) return; const { g, k } = x; x.setA(x.lod(0.03, 0.1)); if (g.globalAlpha < 0.02) return; const ru = kp.fate === 'ruined';
    g.lineJoin = 'round'; g.lineCap = 'round';
    for (const wd of kp.wards) { path(g, wd.poly, k); g.closePath(); g.fillStyle = wd.kind === 'motte' ? COL.top : wd.kind === 'inner' ? (ru ? COL.ruinInner : COL.inner) : (ru ? COL.ruinOuter : COL.outer); g.fill();
      if (k > 0.2) { g.save(); g.clip(); path(g, wd.poly, k); g.closePath(); g.strokeStyle = 'rgba(40,40,64,.2)'; g.lineWidth = Math.max(3, (kp.w * 1.9 + 2) * k); g.stroke(); g.strokeStyle = 'rgba(40,40,64,.1)'; g.lineWidth = Math.max(5, (kp.w * 3.4 + 3) * k); g.stroke(); g.restore(); } }
    if (kp.inner && kp.inner.circle) { const m = kp.inner.circle; for (const [f, col] of [[1.4, COL.slope], [1.15, COL.slope]]) { g.beginPath(); g.arc(m.x * k, m.y * k, m.r * f * k, 0, TAU); g.fillStyle = col; g.fill(); }
      g.beginPath(); g.arc(m.x * k, m.y * k, m.r * 0.78 * k, 0, TAU); g.fillStyle = COL.top; g.fill();
      if (k > 0.6) { g.strokeStyle = 'rgba(110,90,52,.45)'; g.lineWidth = Math.max(0.7, 0.35 * k); g.beginPath(); for (let i = 0; i < 30; i++) { const a = i / 30 * TAU, r0 = m.r * (i % 2 ? 0.9 : 0.82), r1 = m.r * (i % 2 ? 1.2 : 1.34); g.moveTo(m.x * k + Math.cos(a) * r0 * k, m.y * k + Math.sin(a) * r0 * k); g.lineTo(m.x * k + Math.cos(a) * r1 * k, m.y * k + Math.sin(a) * r1 * k); } g.stroke(); } }
    for (const q of kp.ground) { path(g, q.poly, k); g.closePath(); g.fillStyle = COL.garden; g.fill(); if (k > 0.6) { g.strokeStyle = 'rgba(80,120,60,.55)'; g.lineWidth = Math.max(0.6, 0.4 * k); g.stroke(); } }
    for (const q of kp.paths) { path(g, q.pts, k); g.strokeStyle = '#bfb08a'; g.lineWidth = Math.max(1.4, (q.w + 1) * k); g.stroke(); g.strokeStyle = '#dccfa8'; g.lineWidth = Math.max(0.8, q.w * k); g.stroke(); }
    if (k > 0.15) for (const d of kp.decos) { if (!x.vis(d.x, d.y, d.r + 2)) continue; g.beginPath(); g.arc(d.x * k, d.y * k, Math.max(1.2, d.r * k), 0, TAU); if (d.t === 'spoil') { g.fillStyle = '#8f887a'; g.fill(); } else { g.fillStyle = 'rgba(70,120,60,.85)'; g.fill(); } }
  }
  // контур башти у локальних координатах: кругла, квадратна чи бастіон (вістря вперед); f — масштаб
  function shape(g, kind, R, f) {
    const r = R * f; g.beginPath();
    if (kind === 'square') g.rect(-r * 0.92, -r * 0.92, r * 1.84, r * 1.84);
    else if (kind === 'bastion') { g.moveTo(-r * 0.92, -r * 0.98); g.lineTo(r * 0.3, -r); g.lineTo(r * 1.3, 0); g.lineTo(r * 0.3, r); g.lineTo(-r * 0.92, r * 0.98); g.closePath(); }
    else g.arc(0, 0, r, 0, TAU);
  }
  // башта: тінь, кам'яне тіло, зубці по колу, дах-шатро (кругла — вісім клинів), прапорець на вежах брами
  function tower(g, q, k, ru) {
    const R = Math.max(3.4, q.r * k), kind = q.k || 'round', rot = kind !== 'round', lw = Math.max(1.1, 0.95 * k);
    g.save(); g.translate(q.x * k + R * 0.22, q.y * k + R * 0.3); if (rot) g.rotate(q.a || 0); shape(g, kind, R, 1.03); g.fillStyle = COL.shadow; g.fill(); g.restore();
    g.save(); g.translate(q.x * k, q.y * k); if (rot) g.rotate(q.a || 0);
    shape(g, kind, R, 1); g.fillStyle = ru ? COL.ruTower : COL.tower; g.fill(); g.lineWidth = lw; g.strokeStyle = COL.line; g.stroke();
    if (R > 5.5) { const n = Math.max(8, Math.round(R / 1.1)), per = (kind === 'square' ? 7.36 : kind === 'bastion' ? 7.6 : TAU) * R * 0.82 / n; shape(g, kind, R, 0.82); g.setLineDash([per * 0.58, per * 0.42]); g.lineWidth = Math.max(1, R * 0.15); g.stroke(); g.setLineDash([]); }
    const rr = R * 0.6;
    if (ru) { shape(g, kind, R, 0.62); g.fillStyle = '#6f6e7b'; g.fill(); }
    else if (rr >= 3.6 && kind === 'round') { for (let i = 0; i < 8; i++) { g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, rr, i * TAU / 8 - 0.3, (i + 1) * TAU / 8 - 0.3); g.closePath(); g.fillStyle = COL.cap[i & 1]; g.fill(); } g.beginPath(); g.arc(0, 0, rr, 0, TAU); g.lineWidth = Math.max(0.6, 0.4 * k); g.strokeStyle = 'rgba(41,41,51,.6)'; g.stroke(); }
    else { shape(g, kind, R, 0.6); g.fillStyle = COL.cap[0]; g.fill(); if (rr >= 3.6) { g.lineWidth = Math.max(0.6, 0.4 * k); g.strokeStyle = 'rgba(41,41,51,.55)'; g.beginPath(); g.moveTo(-rr * 0.9, -rr * 0.9); g.lineTo(rr * 0.9, rr * 0.9); g.moveTo(rr * 0.9, -rr * 0.9); g.lineTo(-rr * 0.9, rr * 0.9); g.stroke(); shape(g, kind, R, 0.6); g.stroke(); } }
    if (q.gate && !ru && R > 6) { g.rotate(-(rot ? q.a || 0 : 0)); g.fillStyle = COL.flag; g.beginPath(); g.moveTo(0, 0); g.lineTo(R * 0.62, -R * 0.12); g.lineTo(0, -R * 0.3); g.closePath(); g.fill(); }
    g.restore();
  }
  // брама (x — назовні, y — вздовж муру, в метрах): надбрамна споруда з проїздом і решітками; головна й задня — ще барбакан (два короткі мури з кам'яними стовпами) до дороги; водяна — причал
  function gate(g, q, k, w, inner, ru) {
    g.save(); g.translate(q.x * k, q.y * k); g.rotate(q.a); g.scale(k, k);
    const hw = q.hw, big = !inner && (q.main || q.kind === 'rear'), L = w / 2 + (inner ? 1.4 : 2.2), Wd = hw + (inner ? 1.7 : big ? 2.8 : 2.1), lw = v => Math.max(v, 0.9 / k), body = ru ? COL.ruBody : COL.gate;
    if (big) { const Lb = q.main ? 11 : 8, tw = Math.max(2.4, w * 0.6);
      g.fillStyle = COL.road; g.fillRect(L - 0.5, -hw - 0.4, Lb + 0.5, hw * 2 + 0.8); g.lineWidth = lw(0.7); g.strokeStyle = COL.line;
      for (const s of [-1, 1]) { const y0 = s > 0 ? hw + 0.4 : -hw - 0.4 - tw; g.fillStyle = ru ? COL.ruBody : COL.body; g.fillRect(L - 0.5, y0, Lb, tw); g.strokeRect(L - 0.5, y0, Lb, tw); g.fillStyle = COL.tower; const py = s > 0 ? hw + 0.4 + tw / 2 : -hw - 0.4 - tw / 2; g.fillRect(L + Lb - 3.4, py - tw * 0.8, 3.4, tw * 1.6); g.strokeRect(L + Lb - 3.4, py - tw * 0.8, 3.4, tw * 1.6); } }
    if (q.kind === 'water') { g.fillStyle = '#5d4630'; g.fillRect(L, -hw * 0.95, 15, hw * 1.9); g.fillStyle = '#a98558'; g.fillRect(L, -hw * 0.72, 15, hw * 1.44); }
    g.fillStyle = body; g.fillRect(-L, -Wd, L * 2, Wd * 2); g.lineWidth = lw(0.8); g.strokeStyle = COL.line; g.strokeRect(-L, -Wd, L * 2, Wd * 2);
    g.fillStyle = COL.road; g.fillRect(-L - 0.1, -hw, L * 2 + 0.2, hw * 2); g.strokeStyle = '#4a3a2a'; g.lineWidth = lw(0.55); g.beginPath(); g.moveTo(-L * 0.5, -hw); g.lineTo(-L * 0.5, hw); g.moveTo(L * 0.5, -hw); g.lineTo(L * 0.5, hw); g.stroke();
    g.restore();
  }
  // мур: тінь, темна обвідка, кам'яне тіло, зубці (пунктир на всю товщину) і світла стежка по верху
  function wall(g, p, w, k, ru, close) {
    path(g, p, k); if (close) g.closePath();
    g.strokeStyle = COL.line; g.lineWidth = Math.max(3, (w + 2.2) * k); g.stroke();
    g.strokeStyle = ru ? COL.ruBody : COL.body; g.lineWidth = Math.max(1.6, w * k); g.stroke();
    if (k > 0.45) { const d = Math.max(2.2, 1.7 * k); g.setLineDash([d, d * 0.85]); g.strokeStyle = COL.line; g.lineWidth = Math.max(1.6, w * k * 0.98); g.stroke(); g.setLineDash([]); g.strokeStyle = ru ? COL.ruWalk : COL.walk; g.lineWidth = Math.max(0.8, w * k * 0.44); g.stroke(); }
    else { g.strokeStyle = ru ? COL.ruWalk : COL.walk; g.lineWidth = Math.max(0.8, w * k * 0.4); g.stroke(); }
  }
  function walls(x, c) {
    const kp = c.keep; if (!kp) return; const { g, k } = x; x.setA(x.lod(0.03, 0.08)); if (g.globalAlpha < 0.02) return; const ru = kp.fate === 'ruined'; g.lineJoin = 'round'; g.lineCap = 'round';
    g.save(); g.translate(0.8 * k, 1.1 * k); g.strokeStyle = 'rgba(28,28,44,.2)'; g.lineWidth = Math.max(3, (kp.w + 3.4) * k); for (const run of kp.runs) { path(g, run, k); g.stroke(); } g.restore();
    if (kp.inner) wall(g, kp.inner.poly, kp.inner.w, k, ru, false);
    for (const run of kp.runs) wall(g, run, kp.w, k, ru, false);
    x.setA(x.lod(0.15, 0.3)); for (const q of kp.gates) gate(g, q, k, kp.w, false, ru); if (kp.inner) gate(g, kp.inner.gate, k, kp.inner.w, true, ru);
    x.setA(x.lod(0.2, 0.4)); for (const q of kp.inner ? kp.inner.towers : []) tower(g, { x: q[0], y: q[1], r: kp.inner.w * 1.5 + 2.2, k: 'round' }, k, ru);
    for (const q of kp.towers) tower(g, q, k, ru);
  }
  // верхня точка багатокутника на вертикалі x
  function topAt(P, x) { let y = 1e18; for (let i = 0, n = P.length; i < n; i++) { const a = P[i], b = P[(i + 1) % n]; if ((a[0] - x) * (b[0] - x) > 0) continue; const dx = b[0] - a[0], t = Math.abs(dx) < 1e-9 ? 0 : (x - a[0]) / dx, yy = a[1] + (b[1] - a[1]) * t; if (yy < y) y = yy; } return y === 1e18 ? Math.min(...P.map(p => p[1])) : y; }
  // плашка з назвою замку над північним муром (не закриває двір; з наближенням зникає: далі підписані самі споруди) і підпис головної брами
  function label(x, c) {
    const kp = c.keep, { g, k } = x; if (k < 0.3 || k > 3.6) return; const a = Math.min(1, (3.6 - k) / 0.8) * Math.min(1, (k - 0.3) / 0.15) * x.lod(0.4, 0.7); x.setA(a); if (g.globalAlpha < 0.02) return;
    if (!x.vis(kp.x, kp.y, kp.r + 30)) return; const sub = kp.tn + (kp.fate === 'ruined' ? ' · руїни' : kp.fate === 'occupied' ? ' · захоплений' : ''), fs = Math.max(10, Math.min(17, kp.r * k * 0.17)), two = k > 0.8, f2 = fs * 0.76; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `700 ${fs}px sans-serif`;
    let tw = g.measureText(kp.name).width; if (two) { g.font = `600 ${f2}px sans-serif`; tw = Math.max(tw, g.measureText(sub).width); } const pw = tw + 14, ph = two ? fs + f2 + 12 : fs + 9, px = kp.x * k - pw / 2, py = (topAt(kp.poly, kp.x) - 11) * k - ph - 5, rd = 4;
    g.beginPath(); g.moveTo(px + rd, py); g.arcTo(px + pw, py, px + pw, py + ph, rd); g.arcTo(px + pw, py + ph, px, py + ph, rd); g.arcTo(px, py + ph, px, py, rd); g.arcTo(px, py, px + pw, py, rd); g.closePath(); g.fillStyle = 'rgba(38,38,52,.88)'; g.fill(); g.strokeStyle = 'rgba(245,240,222,.55)'; g.lineWidth = 1; g.stroke();
    g.fillStyle = '#f6f1e0'; g.font = `700 ${fs}px sans-serif`; g.fillText(kp.name, kp.x * k, py + (two ? 6 + fs / 2 : ph / 2)); if (two) { g.fillStyle = '#d6d2e2'; g.font = `600 ${f2}px sans-serif`; g.fillText(sub, kp.x * k, py + ph - 6 - f2 / 2); }
    const mg = k > 1.1 && k < 4 && kp.gates.find(q => q.main); if (mg && x.vis(mg.x, mg.y, 40)) { g.font = `600 ${Math.max(9, Math.min(12, 3 * k))}px sans-serif`; x.halo(mg.name, (mg.x + Math.cos(mg.a) * (kp.w / 2 + 19)) * k, (mg.y + Math.sin(mg.a) * (kp.w / 2 + 19)) * k, '#2b2b3a'); }
  }
  A.TownKeepDraw = { ground, walls, label };
})();
