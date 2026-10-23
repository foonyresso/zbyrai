// Атлас 2.0: дороги, морські шляхи, поселення й підписи. Одиниця координат: комірка; px = розмір пікселя екрана в комірках.
(function () {
  'use strict';
  const A = globalThis.Atlas2;
  const STYLE = { 1: ['#5a3d22', 3.2, []], 2: ['#7a4f2a', 2.2, []], 3: ['#8a6a44', 1.5, []], 4: ['#a3855a', 1.1, [3, 2.5]] }; // дрібні шляхи — пунктиром
  const cxy = (W, i) => [(i % W.w) + 0.5, ((i / W.w) | 0) + 0.5];
  const poly = (ctx, p) => { ctx.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) ctx.lineTo(p[i], p[i + 1]); };
  A.drawRoads = function (ctx, W, px, k, geom) {
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const lvl of [4, 3, 2, 1]) {
      const [col, wd, dash] = STYLE[lvl];
      for (const pass of [0, 1]) { // обвідка, потім лінія
        ctx.beginPath(); for (const r of geom.roads) if (r.level === lvl) poly(ctx, r.pts);
        ctx.strokeStyle = pass ? col : 'rgba(255,248,230,.6)'; ctx.lineWidth = (pass ? wd : wd + (dash.length ? 0 : 1.4)) * px; ctx.setLineDash(pass ? dash.map(v => v * px * 1.4) : []); ctx.stroke(); ctx.setLineDash([]);
      }
    }
    ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 1.1 * px; ctx.setLineDash([6 * px, 4 * px]); ctx.beginPath(); for (const r of geom.sea) poly(ctx, r.pts); ctx.stroke(); ctx.setLineDash([]);
    if (k >= 5) { ctx.fillStyle = '#3b2a18'; for (const c of W.bridges || []) { const [x, y] = [(c % W.w) + 0.5, ((c / W.w) | 0) + 0.5]; ctx.fillRect(x - 1.4 * px, y - 1.4 * px, 2.8 * px, 2.8 * px); } }
  };
  // значок порту: якір на білому колі
  function anchor(ctx, x, y, px0) {
    const px = px0 * 1.5;
    ctx.beginPath(); ctx.arc(x, y, 5.2 * px, 0, 6.2832); ctx.fillStyle = 'rgba(255,255,255,.95)'; ctx.fill(); ctx.strokeStyle = '#1f5f9f'; ctx.lineWidth = 1 * px; ctx.stroke();
    ctx.lineWidth = 1.3 * px; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(x, y - 3 * px, 0.9 * px, 0, 6.2832); ctx.moveTo(x, y - 2 * px); ctx.lineTo(x, y + 3 * px); ctx.moveTo(x - 1.8 * px, y - 0.6 * px); ctx.lineTo(x + 1.8 * px, y - 0.6 * px); ctx.moveTo(x - 3 * px, y + 0.8 * px); ctx.quadraticCurveTo(x - 2.6 * px, y + 3.4 * px, x, y + 3.2 * px); ctx.quadraticCurveTo(x + 2.6 * px, y + 3.4 * px, x + 3 * px, y + 0.8 * px); ctx.stroke();
  }
  const R = { capital: 5.2, regional: 3.8, town: 2.8, village: 1.9, hamlet: 1.3 }, MINK = { capital: 0, regional: 0, town: 3, village: 5.5, hamlet: 8 };
  const LBLK = { capital: 0, regional: 3.2, town: 5.5, village: 9, hamlet: 99 };
  // назви провінцій: один розмір для всіх, у клітинах карти (масштабуються разом з картою, ніби написані по ній), літери з розрідженням уздовж осі провінції
  const PS = 10, RS = 3.1;
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
  // локації: форма й колір за категорією; більші небезпеки видно здалеку, дрібні — лише зблизька
  const SC = { m: '#c0392b', b: '#d9822b', r: '#8a8578', n: '#4f9a52', e: '#8b6b3e', k: '#d4b13a' };
  A.drawSites = function (ctx, W, px, k, L) {
    if (!W.sites) return; const minTier = k >= 5 ? 0 : k >= 3 ? 3 : k >= 1.2 ? 4 : 99; ctx.lineJoin = 'round';
    for (const s of W.sites) {
      if (s.tier < minTier && !(s.tier >= 3 && k >= 3)) continue; const x = s.x + 0.5, y = s.y + 0.5, r = (s.tier >= 4 ? 5.2 : s.tier >= 3 ? 4.4 : 3.4) * px;
      ctx.beginPath();
      if (s.cat === 'm') { ctx.moveTo(x, y - r * 1.2); ctx.lineTo(x + r, y); ctx.lineTo(x, y + r * 1.2); ctx.lineTo(x - r, y); ctx.closePath(); }
      else if (s.cat === 'b') { ctx.moveTo(x, y - r * 1.15); ctx.lineTo(x + r * 1.05, y + r * 0.8); ctx.lineTo(x - r * 1.05, y + r * 0.8); ctx.closePath(); }
      else if (s.cat === 'r' || s.cat === 'e') ctx.rect(x - r * 0.85, y - r * 0.85, r * 1.7, r * 1.7);
      else ctx.arc(x, y, r * 0.9, 0, 6.2832);
      ctx.fillStyle = SC[s.cat]; ctx.fill(); ctx.strokeStyle = s.tier >= 3 ? '#2a0f0f' : 'rgba(30,20,10,.85)'; ctx.lineWidth = (s.tier >= 3 ? 1.6 : 1) * px; ctx.stroke();
      if (L.labels && k >= 9) { ctx.font = `italic 600 ${9.5 * px}px sans-serif`; ctx.fillStyle = '#3a2a22'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 3 * px; ctx.strokeText(s.name, x + r + 3 * px, y); ctx.fillText(s.name, x + r + 3 * px, y); }
    }
  };
  A.SITE_COLORS = SC;
  A.drawPlaces = function (ctx, W, px, k, L, PAL) {
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    const halo = (t, x, y) => { ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 3 * px; ctx.strokeText(t, x, y); ctx.fillText(t, x, y); };
    if (L.labels) drawNames(ctx, W, px, k);
    if (!L.places) return;
    for (const rank of ['hamlet', 'village', 'town', 'regional', 'capital']) {
      if (k < MINK[rank]) continue; const r = R[rank] * px;
      for (const s of W.settlements) {
        if (s.rank !== rank) continue; const x = s.x + 0.5, y = s.y + 0.5;
        if (s.ruined) { // руїни: сіре порожнє коло із хрестиком
          ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fillStyle = 'rgba(210,205,195,.85)'; ctx.fill(); ctx.strokeStyle = '#6a6358'; ctx.lineWidth = 1.2 * px; ctx.stroke();
          ctx.beginPath(); ctx.moveTo(x - r * 0.55, y - r * 0.55); ctx.lineTo(x + r * 0.55, y + r * 0.55); ctx.moveTo(x + r * 0.55, y - r * 0.55); ctx.lineTo(x - r * 0.55, y + r * 0.55); ctx.stroke();
          if (L.labels && k >= LBLK[rank]) { ctx.font = `italic 600 ${10 * px}px sans-serif`; ctx.fillStyle = '#5a5348'; ctx.textAlign = 'left'; ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 3 * px; ctx.strokeText(s.name + ' (руїни)', x + r + 2 * px, y); ctx.fillText(s.name + ' (руїни)', x + r + 2 * px, y); ctx.textAlign = 'center'; }
          continue;
        }
        ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fillStyle = s.port ? '#bfe0ff' : rank === 'capital' ? '#fff3c4' : '#fff'; ctx.fill(); ctx.strokeStyle = s.port ? '#1f5f9f' : '#2a2018'; ctx.lineWidth = (rank === 'capital' ? 2 : 1.3) * px; ctx.stroke();
        if (s.port && k >= 2.5) anchor(ctx, x + (r + 8) * px, y - (r + 8) * px, px);
        if (rank === 'capital') { ctx.beginPath(); ctx.arc(x, y, r * 0.45, 0, 6.2832); ctx.fillStyle = '#2a2018'; ctx.fill(); }
        if (L.labels && k >= LBLK[rank]) { ctx.font = `${rank === 'capital' ? 700 : 600} ${(rank === 'capital' ? 13 : rank === 'regional' ? 11.5 : 10.5) * px}px sans-serif`; ctx.fillStyle = '#20180f'; ctx.textAlign = 'left'; ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 3 * px; ctx.strokeText(s.name, x + r + 2 * px, y); ctx.fillText(s.name, x + r + 2 * px, y); ctx.textAlign = 'center'; }
      }
    }
  };
})();
