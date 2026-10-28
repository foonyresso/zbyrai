// Атлас 2.0, місто: малювання замку. Земля дворів (двори, мотт, сад, стежки, дерева, завали) іде під вулиці, а мур з баштами, внутрішнім муром, воротами й причалом — поверх споруд.
// x: {g, k, lod, setA, vis, TAU} — полотно й допоміжні функції з render/town.js.
(function () {
  'use strict';
  const A = globalThis.Atlas2, TAU = Math.PI * 2;
  const COL = { outer: '#d3cdb8', inner: '#ded8c4', slope: '#bfae86', garden: '#b4c97e', ruinOuter: '#c9c9a8', ruinInner: '#cfcdb0', wall: ['#4c4c58', '#a4a4b2', '#8a8a98'], tower: ['#9090a2', '#3f3f4c'] };
  const path = (g, p, k) => { g.beginPath(); g.moveTo(p[0] * k, p[1] * k); for (let i = 2; i < p.length; i += 2) g.lineTo(p[i] * k, p[i + 1] * k); };
  // земля замку: двори, мотт (насипний горб), сад, стежки, дерева й завали
  function ground(x, c) {
    const kp = c.keep; if (!kp) return; const { g, k } = x; x.setA(x.lod(0.03, 0.1)); if (g.globalAlpha < 0.02) return; const ru = kp.fate === 'ruined';
    g.lineJoin = 'round'; g.lineCap = 'round';
    for (const wd of kp.wards) { path(g, wd.poly, k); g.closePath(); g.fillStyle = wd.kind === 'motte' ? COL.slope : wd.kind === 'inner' ? (ru ? COL.ruinInner : COL.inner) : (ru ? COL.ruinOuter : COL.outer); g.fill(); }
    if (kp.inner && kp.inner.circle) { const m = kp.inner.circle; for (const [f, col] of [[1.35, 'rgba(139,120,80,.32)'], [1.12, 'rgba(139,120,80,.4)'], [0.62, 'rgba(205,190,145,.7)']]) { g.beginPath(); g.arc(m.x * k, m.y * k, m.r * f * k, 0, TAU); g.fillStyle = col; g.fill(); } }
    for (const q of kp.ground) { path(g, q.poly, k); g.closePath(); g.fillStyle = COL.garden; g.fill(); if (k > 0.6) { g.strokeStyle = 'rgba(80,120,60,.55)'; g.lineWidth = Math.max(0.6, 0.4 * k); g.stroke(); } }
    for (const q of kp.paths) { path(g, q.pts, k); g.strokeStyle = '#a99a79'; g.lineWidth = Math.max(1.4, (q.w + 1) * k); g.stroke(); g.strokeStyle = '#e8dcc0'; g.lineWidth = Math.max(0.8, q.w * k); g.stroke(); }
    if (k > 0.15) for (const d of kp.decos) { if (!x.vis(d.x, d.y, d.r + 2)) continue; g.beginPath(); g.arc(d.x * k, d.y * k, Math.max(1.2, d.r * k), 0, TAU); if (d.t === 'spoil') { g.fillStyle = '#8f887a'; g.fill(); } else { g.fillStyle = 'rgba(70,120,60,.85)'; g.fill(); } }
  }
  // башта: кругла, квадратна (повернута) чи бастіон (вістря назовні)
  function tower(g, q, k, w) {
    const R = Math.max(2, q.r * k); g.save(); g.translate(q.x * k, q.y * k); g.fillStyle = COL.tower[0]; g.strokeStyle = COL.tower[1]; g.lineWidth = Math.max(1, 0.9 * k);
    if (q.k === 'square') { g.rotate(q.a || 0); g.beginPath(); g.rect(-R * 0.9, -R * 0.9, R * 1.8, R * 1.8); }
    else if (q.k === 'bastion') { g.rotate(q.a || 0); g.beginPath(); g.moveTo(-R * 0.9, -R * 0.95); g.lineTo(R * 0.25, -R); g.lineTo(R * 1.3, 0); g.lineTo(R * 0.25, R); g.lineTo(-R * 0.9, R * 0.95); g.closePath(); }
    else { g.beginPath(); g.arc(0, 0, R, 0, TAU); }
    g.fill(); g.stroke(); if (k > 0.5) { g.beginPath(); if (q.k === 'round' || !q.k) g.arc(0, 0, R * 0.55, 0, TAU); else g.rect(-R * 0.45, -R * 0.45, R * 0.9, R * 0.9); g.strokeStyle = 'rgba(40,40,56,.55)'; g.lineWidth = Math.max(0.6, 0.45 * k); g.stroke(); } g.restore();
  }
  // брама: кам'яна надбрамна споруда з проїздом
  function gate(g, q, k, w, inner) {
    g.save(); g.translate(q.x * k, q.y * k); g.rotate(q.a); const gl = (w + (inner ? 3.5 : 7)) * k, gw = (q.hw * 2 + (inner ? 4.2 : 8.5)) * k, pw = q.hw * 2 * k;
    g.fillStyle = q.main ? '#8f8fa0' : '#9a9aaa'; g.fillRect(-gl / 2, -gw / 2, gl, gw); g.strokeStyle = '#3f3f4c'; g.lineWidth = Math.max(1, 0.9 * k); g.strokeRect(-gl / 2, -gw / 2, gl, gw);
    g.fillStyle = '#8b6a45'; g.fillRect(-gl / 2 - 0.5, -pw / 2, gl + 1, pw); g.strokeStyle = '#3d2c1c'; g.lineWidth = Math.max(0.8, 0.6 * k); g.strokeRect(-gl / 2, -pw / 2, gl, pw);
    if (q.kind === 'water') { g.fillStyle = '#5d4630'; g.fillRect(gl / 2, -pw * 0.45, 15 * k, pw * 0.9); g.fillStyle = '#a98558'; g.fillRect(gl / 2, -pw * 0.35, 15 * k, pw * 0.7); }
    g.restore();
  }
  function walls(x, c) {
    const kp = c.keep; if (!kp) return; const { g, k } = x; x.setA(x.lod(0.03, 0.08)); if (g.globalAlpha < 0.02) return; g.lineJoin = 'round'; g.lineCap = 'round';
    const stroke = (p, w, close) => { path(g, p, k); if (close) g.closePath(); g.strokeStyle = COL.wall[0]; g.lineWidth = Math.max(2, (w + 2) * k); g.stroke(); g.strokeStyle = COL.wall[1]; g.lineWidth = Math.max(1, w * k); g.stroke(); g.strokeStyle = COL.wall[2]; g.lineWidth = Math.max(0.6, w * 0.3 * k); g.stroke(); if (k > 0.5) { g.setLineDash([1 * k, 1 * k]); g.strokeStyle = COL.wall[0]; g.lineWidth = Math.max(0.8, w * 0.85 * k); g.stroke(); g.setLineDash([]); } };
    if (kp.inner) stroke(kp.inner.poly, kp.inner.w, false);
    for (const run of kp.runs) stroke(run, kp.w, false);
    x.setA(x.lod(0.2, 0.4)); for (const q of kp.inner ? kp.inner.towers : []) tower(g, { x: q[0], y: q[1], r: kp.inner.w * 1.05 + 1.4, k: 'round' }, k, kp.w);
    for (const q of kp.towers) tower(g, q, k, kp.w);
    x.setA(x.lod(0.15, 0.3)); for (const q of kp.gates) gate(g, q, k, kp.w, false); if (kp.inner) gate(g, kp.inner.gate, k, kp.inner.w, true);
  }
  // підпис замку: назва й вид посередині; з наближенням зникає (далі підписані самі споруди)
  function label(x, c) {
    const kp = c.keep, { g, k } = x; if (k < 0.5 || k > 2) return; const a = Math.min(1, (2 - k) / 0.6) * x.lod(0.4, 0.7); x.setA(a); if (g.globalAlpha < 0.02 || !x.vis(kp.x, kp.y, kp.r)) return;
    g.textAlign = 'center'; g.font = `700 ${Math.max(10, Math.min(16, 3.8 * k))}px sans-serif`; x.halo(kp.name, kp.x * k, kp.y * k, '#2b2b3a'); if (k > 0.9) { g.font = `600 ${Math.max(9, Math.min(12, 2.8 * k))}px sans-serif`; x.halo(kp.tn, kp.x * k, kp.y * k + Math.max(11, 3.6 * k), '#4a4a5a'); }
  }
  A.TownKeepDraw = { ground, walls, label };
})();
