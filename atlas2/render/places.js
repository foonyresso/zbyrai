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
  A.drawPlaces = function (ctx, W, px, k, L, PAL) {
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    const halo = (t, x, y) => { ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 3 * px; ctx.strokeText(t, x, y); ctx.fillText(t, x, y); };
    if (L.labels) {
      W.provinces.forEach(p => {
        if (!p.label || k > 9) return; const t = p.name.toUpperCase().split('').join('\u200a'), maxW = Math.sqrt(p.label.size) * 1.7;
        ctx.font = `700 ${22 * px}px sans-serif`; const wd = ctx.measureText(t).width, sz = Math.min(22, 22 * maxW / (wd / px));
        ctx.font = `700 ${Math.max(8, sz) * px}px sans-serif`; ctx.fillStyle = 'rgba(40,30,50,.62)'; ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 2.5 * px; ctx.strokeText(t, p.label.x, p.label.y); ctx.fillText(t, p.label.x, p.label.y);
      });
      if (k >= 5) W.regions.forEach(g => { if (!g.label) return; ctx.font = `italic 600 ${11 * px}px sans-serif`; ctx.fillStyle = 'rgba(50,40,30,.7)'; halo(g.name, g.label.x, g.label.y + 2.2); });
    }
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
