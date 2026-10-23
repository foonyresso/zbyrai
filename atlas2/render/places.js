// Атлас 2.0: дороги, морські шляхи, поселення й підписи. Одиниця координат: комірка; px = розмір пікселя екрана в комірках.
(function () {
  'use strict';
  const A = globalThis.Atlas2;
  const STYLE = { 1: ['#5a3d22', 3.2, []], 2: ['#7a4f2a', 2.2, []], 3: ['#8a6a44', 1.5, []], 4: ['#a3855a', 1.1, [3, 2.5]] }; // дрібні шляхи — пунктиром
  const cxy = (W, i) => [(i % W.w) + 0.5, ((i / W.w) | 0) + 0.5];
  function smoothPath(ctx, W, cells) {
    const P = cells.map(i => cxy(W, i)); if (P.length < 2) return;
    ctx.moveTo(P[0][0], P[0][1]);
    for (let k = 1; k < P.length - 1; k++) ctx.quadraticCurveTo(P[k][0], P[k][1], (P[k][0] + P[k + 1][0]) / 2, (P[k][1] + P[k + 1][1]) / 2);
    ctx.lineTo(P[P.length - 1][0], P[P.length - 1][1]);
  }
  A.drawRoads = function (ctx, W, px, k) {
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const lvl of [4, 3, 2, 1]) {
      const [col, wd, dash] = STYLE[lvl];
      for (const pass of [0, 1]) { // обвідка, потім лінія
        ctx.beginPath(); for (const r of W.roads) if (r.level === lvl) smoothPath(ctx, W, r.cells);
        ctx.strokeStyle = pass ? col : 'rgba(255,248,230,.6)'; ctx.lineWidth = (pass ? wd : wd + (dash.length ? 0 : 1.4)) * px; ctx.setLineDash(pass ? dash.map(v => v * px * 1.4) : []); ctx.stroke(); ctx.setLineDash([]);
      }
    }
    ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 1.1 * px; ctx.setLineDash([5 * px, 4 * px]);
    ctx.beginPath(); for (const r of W.seaRoutes || []) smoothPath(ctx, W, r.cells); ctx.stroke(); ctx.setLineDash([]);
    if (k >= 5) { ctx.fillStyle = '#3b2a18'; for (const c of W.bridges || []) { const [x, y] = cxy(W, c); ctx.fillRect(x - 1.4 * px, y - 1.4 * px, 2.8 * px, 2.8 * px); } }
  };
  const R = { capital: 5.2, regional: 3.8, town: 2.8, village: 1.9, hamlet: 1.3 }, MINK = { capital: 0, regional: 0, town: 3, village: 5.5, hamlet: 8 };
  const LBLK = { capital: 0, regional: 3.2, town: 5.5, village: 9, hamlet: 99 };
  // назви провінцій: один розмір для всіх, у клітинах карти (масштабуються разом з картою, ніби написані по ній), літери з розрідженням уздовж осі провінції
  const PS = 5.2, RS = 1.7;
  function alongPath(ctx, pts, text, S, spacing, alpha, fill, halo) {
    const seg = []; let L = 0; for (let i = 2; i < pts.length; i += 2) { const d = Math.hypot(pts[i] - pts[i - 2], pts[i + 1] - pts[i - 1]); seg.push(d); L += d; }
    const ws = Array.from(text).map(ch => ctx.measureText(ch).width + spacing), tw = ws.reduce((a, b) => a + b, 0) - spacing; if (tw > L * 1.05) return false;
    let pos = (L - tw) / 2, si = 0, acc = 0; ctx.globalAlpha = alpha; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    Array.from(text).forEach((ch, n) => {
      const mid = pos + ws[n] / 2 - spacing / 2 * 0; while (si < seg.length - 1 && acc + seg[si] < mid) { acc += seg[si]; si++; }
      const t = Math.min(1, Math.max(0, (mid - acc) / (seg[si] || 1))), x = pts[si * 2] + (pts[si * 2 + 2] - pts[si * 2]) * t, y = pts[si * 2 + 1] + (pts[si * 2 + 3] - pts[si * 2 + 1]) * t, ang = Math.atan2(pts[si * 2 + 3] - pts[si * 2 + 1], pts[si * 2 + 2] - pts[si * 2]);
      ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.strokeStyle = halo; ctx.lineWidth = S * 0.16; ctx.strokeText(ch, 0, 0); ctx.fillStyle = fill; ctx.fillText(ch, 0, 0); ctx.restore(); pos += ws[n];
    });
    ctx.globalAlpha = 1; return true;
  }
  function drawNames(ctx, W, px, k) {
    const fade = (v, a, b, c, d) => v < a || v > d ? 0 : v < b ? (v - a) / (b - a) : v > c ? (d - v) / (d - c) : 1; // плавна поява й зникнення за екранним розміром літер
    const ps = PS * k, pa = fade(ps, 8, 14, 60, 110);
    if (pa > 0.02) { ctx.font = `700 ${PS}px Georgia, 'Times New Roman', serif`; for (const p of W.provinces) if (p.label && p.label.line) alongPath(ctx, p.label.line, p.name.toUpperCase(), PS, PS * 0.42, pa * 0.82, 'rgba(48,32,64,1)', 'rgba(255,255,255,.55)'); }
    const rs = RS * k, ra = fade(rs, 9, 14, 40, 70);
    if (ra > 0.02) { ctx.font = `italic 600 ${RS}px Georgia, 'Times New Roman', serif`; for (const g of W.regions) if (g.label) { const wd = ctx.measureText(g.name).width; if (wd > Math.sqrt(g.label.size) * 1.9) continue; alongPath(ctx, [g.label.x - wd / 2, g.label.y, g.label.x + wd / 2, g.label.y], g.name, RS, 0.08, ra * 0.8, 'rgba(60,44,30,1)', 'rgba(255,255,255,.6)'); } }
  }
  A.drawPlaces = function (ctx, W, px, k, L, PAL) {
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    const halo = (t, x, y) => { ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 3 * px; ctx.strokeText(t, x, y); ctx.fillText(t, x, y); };
    if (L.labels) drawNames(ctx, W, px, k);
    if (!L.places) return;
    for (const rank of ['hamlet', 'village', 'town', 'regional', 'capital']) {
      if (k < MINK[rank]) continue; const r = R[rank] * px;
      for (const s of W.settlements) {
        if (s.rank !== rank) continue; const x = s.x + 0.5, y = s.y + 0.5;
        ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fillStyle = s.port ? '#bfe0ff' : rank === 'capital' ? '#fff3c4' : '#fff'; ctx.fill(); ctx.strokeStyle = s.port ? '#1f5f9f' : '#2a2018'; ctx.lineWidth = (rank === 'capital' ? 2 : 1.3) * px; ctx.stroke();
        if (s.port && k >= 3) { ctx.beginPath(); ctx.arc(x, y, r + 2.2 * px, 0, 6.2832); ctx.strokeStyle = '#1f5f9f'; ctx.lineWidth = 1 * px; ctx.stroke(); }
        if (rank === 'capital') { ctx.beginPath(); ctx.arc(x, y, r * 0.45, 0, 6.2832); ctx.fillStyle = '#2a2018'; ctx.fill(); }
        if (L.labels && k >= LBLK[rank]) { ctx.font = `${rank === 'capital' ? 700 : 600} ${(rank === 'capital' ? 13 : rank === 'regional' ? 11.5 : 10.5) * px}px sans-serif`; ctx.fillStyle = '#20180f'; ctx.textAlign = 'left'; ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 3 * px; ctx.strokeText(s.name, x + r + 2 * px, y); ctx.fillText(s.name, x + r + 2 * px, y); ctx.textAlign = 'center'; }
      }
    }
  };
})();
