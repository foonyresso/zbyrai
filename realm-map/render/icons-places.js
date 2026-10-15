// Значки точок інтересу та лігв монстрів.
(function () {
  'use strict';
  const R = (globalThis.RealmMap = globalThis.RealmMap || {});
  const INK = '#2f2418';
  function ring(ctx, x, y, r, fill, stroke, lw) { ctx.beginPath(); ctx.arc(x, y, r, 0, 6.3); ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = stroke || INK; ctx.lineWidth = lw || Math.max(0.8, r * 0.18); ctx.stroke(); }
  const SH = {
    dot(ctx, x, y, s, c) { ring(ctx, x, y, s * 0.4, c); },
    wave(ctx, x, y, s, c) { ring(ctx, x, y, s * 0.55, c); ctx.strokeStyle = '#1f5f7a'; ctx.lineWidth = Math.max(0.8, s * 0.1); ctx.beginPath(); ctx.moveTo(x - s * 0.35, y - s * 0.1); ctx.quadraticCurveTo(x - s * 0.17, y - s * 0.3, x, y - s * 0.1); ctx.quadraticCurveTo(x + s * 0.17, y + s * 0.1, x + s * 0.35, y - s * 0.1); ctx.moveTo(x - s * 0.35, y + s * 0.15); ctx.quadraticCurveTo(x - s * 0.17, y - s * 0.05, x, y + s * 0.15); ctx.quadraticCurveTo(x + s * 0.17, y + s * 0.35, x + s * 0.35, y + s * 0.15); ctx.stroke(); },
    peak(ctx, x, y, s, c) { ctx.beginPath(); ctx.moveTo(x - s * 0.6, y + s * 0.4); ctx.lineTo(x, y - s * 0.65); ctx.lineTo(x + s * 0.6, y + s * 0.4); ctx.closePath(); ctx.fillStyle = c; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = Math.max(0.8, s * 0.1); ctx.stroke(); ctx.fillStyle = INK; ctx.fillRect(x - s * 0.04, y - s * 0.9, s * 0.08, s * 0.3); },
    ruin(ctx, x, y, s, c) { ring(ctx, x, y, s * 0.55, c); ctx.strokeStyle = INK; ctx.lineWidth = Math.max(0.8, s * 0.12); ctx.beginPath(); ctx.moveTo(x - s * 0.3, y + s * 0.3); ctx.lineTo(x - s * 0.3, y - s * 0.1); ctx.lineTo(x - s * 0.1, y - s * 0.3); ctx.moveTo(x + s * 0.3, y + s * 0.3); ctx.lineTo(x + s * 0.3, y); ctx.stroke(); },
    obelisk(ctx, x, y, s, c) { ctx.beginPath(); ctx.moveTo(x - s * 0.22, y + s * 0.45); ctx.lineTo(x - s * 0.14, y - s * 0.4); ctx.lineTo(x, y - s * 0.65); ctx.lineTo(x + s * 0.14, y - s * 0.4); ctx.lineTo(x + s * 0.22, y + s * 0.45); ctx.closePath(); ctx.fillStyle = c; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = Math.max(0.8, s * 0.1); ctx.stroke(); },
    temple(ctx, x, y, s, c) { ctx.fillStyle = c; ctx.fillRect(x - s * 0.45, y - s * 0.1, s * 0.9, s * 0.5); ctx.beginPath(); ctx.moveTo(x - s * 0.55, y - s * 0.1); ctx.lineTo(x, y - s * 0.55); ctx.lineTo(x + s * 0.55, y - s * 0.1); ctx.closePath(); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = Math.max(0.8, s * 0.1); ctx.stroke(); ctx.strokeRect(x - s * 0.45, y - s * 0.1, s * 0.9, s * 0.5); ctx.beginPath(); ctx.moveTo(x, y - s * 0.55); ctx.lineTo(x, y - s * 0.9); ctx.moveTo(x - s * 0.15, y - s * 0.75); ctx.lineTo(x + s * 0.15, y - s * 0.75); ctx.stroke(); },
    tower(ctx, x, y, s, c) { ctx.fillStyle = c; ctx.fillRect(x - s * 0.2, y - s * 0.6, s * 0.4, s * 1.0); ctx.beginPath(); ctx.moveTo(x - s * 0.32, y - s * 0.6); ctx.lineTo(x, y - s * 1.05); ctx.lineTo(x + s * 0.32, y - s * 0.6); ctx.closePath(); ctx.fillStyle = '#6a3fc0'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = Math.max(0.8, s * 0.1); ctx.stroke(); ctx.strokeRect(x - s * 0.2, y - s * 0.6, s * 0.4, s * 1.0); },
    pick(ctx, x, y, s, c) { ring(ctx, x, y, s * 0.45, c); ctx.strokeStyle = INK; ctx.lineWidth = Math.max(0.8, s * 0.12); ctx.beginPath(); ctx.moveTo(x - s * 0.3, y + s * 0.3); ctx.lineTo(x + s * 0.3, y - s * 0.3); ctx.moveTo(x - s * 0.1, y - s * 0.35); ctx.quadraticCurveTo(x + s * 0.2, y - s * 0.4, x + s * 0.4, y - s * 0.1); ctx.stroke(); },
    flag(ctx, x, y, s, c) { ctx.strokeStyle = INK; ctx.lineWidth = Math.max(0.8, s * 0.1); ctx.beginPath(); ctx.moveTo(x - s * 0.2, y + s * 0.45); ctx.lineTo(x - s * 0.2, y - s * 0.6); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x - s * 0.2, y - s * 0.6); ctx.lineTo(x + s * 0.45, y - s * 0.4); ctx.lineTo(x - s * 0.2, y - s * 0.15); ctx.closePath(); ctx.fillStyle = c; ctx.fill(); ctx.stroke(); },
    tree(ctx, x, y, s, c) { ring(ctx, x, y - s * 0.15, s * 0.45, c); ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(x, y + s * 0.3); ctx.lineTo(x, y + s * 0.6); ctx.stroke(); },
    tent(ctx, x, y, s, c) { ctx.beginPath(); ctx.moveTo(x - s * 0.55, y + s * 0.4); ctx.lineTo(x, y - s * 0.55); ctx.lineTo(x + s * 0.55, y + s * 0.4); ctx.closePath(); ctx.fillStyle = c; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = Math.max(0.8, s * 0.1); ctx.stroke(); ctx.fillStyle = INK; ctx.fillRect(x - s * 0.08, y, s * 0.16, s * 0.4); },
  };
  function drawPoi(ctx, o, sx, sy, k) { const def = R.Data.poi[o.type], s = (def.cls === 'major' ? 8 : 6) * k; (SH[def.shape] || SH.dot)(ctx, sx, sy, s, def.color); }

  // Лігва: рівень 1 — темно-червона мітка (лігво) чи помаранчева (відпочинок); 2 — ромб із черепом; 3 — зірка з ореолом. Морські — синьо-чорні.
  function drawLair(ctx, l, sx, sy, k, t) {
    const sea = l.domain === 'sea', base = sea ? '#12304a' : '#7a1c1c', glow = sea ? 'rgba(80,160,255,.35)' : 'rgba(255,60,40,.35)';
    if (l.tier === 3) { const pulse = 1 + 0.12 * Math.sin((t || 0) / 380); ctx.beginPath(); ctx.arc(sx, sy, 15 * k * pulse, 0, 6.3); ctx.fillStyle = glow; ctx.fill(); }
    if (l.tier === 1) {
      const s = 5 * k; ring(ctx, sx, sy, s, l.kind === 'rest' ? (sea ? '#4b7a9c' : '#c98a3d') : base, '#f0e4cc', Math.max(0.8, s * 0.2));
      ctx.fillStyle = '#f0e4cc'; ctx.fillRect(sx - s * 0.5, sy - s * 0.25, s * 0.3, s * 0.3); ctx.fillRect(sx + s * 0.2, sy - s * 0.25, s * 0.3, s * 0.3);
    } else if (l.tier === 2) {
      const s = 8.5 * k; ctx.beginPath(); ctx.moveTo(sx, sy - s); ctx.lineTo(sx + s, sy); ctx.lineTo(sx, sy + s); ctx.lineTo(sx - s, sy); ctx.closePath(); ctx.fillStyle = base; ctx.fill(); ctx.strokeStyle = '#f0e4cc'; ctx.lineWidth = Math.max(1, s * 0.15); ctx.stroke();
      ctx.fillStyle = '#f0e4cc'; ctx.beginPath(); ctx.arc(sx, sy - s * 0.1, s * 0.35, 0, 6.3); ctx.fill(); ctx.fillStyle = base; ctx.fillRect(sx - s * 0.2, sy - s * 0.2, s * 0.15, s * 0.18); ctx.fillRect(sx + s * 0.06, sy - s * 0.2, s * 0.15, s * 0.18);
    } else {
      const s = 11 * k; ctx.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? s * 0.5 : s, a = -Math.PI / 2 + i * Math.PI / 5; ctx.lineTo(sx + Math.cos(a) * r, sy + Math.sin(a) * r); } ctx.closePath();
      ctx.fillStyle = sea ? '#0a1c30' : '#1a0b0b'; ctx.fill(); ctx.strokeStyle = sea ? '#7fd0ff' : '#ff5a3c'; ctx.lineWidth = Math.max(1.2, s * 0.14); ctx.stroke();
      ctx.fillStyle = '#f0e4cc'; ctx.beginPath(); ctx.arc(sx, sy, s * 0.28, 0, 6.3); ctx.fill();
    }
  }
  R.IconsPlaces = { drawPoi, drawLair };
})();
