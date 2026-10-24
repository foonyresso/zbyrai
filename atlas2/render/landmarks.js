// Атлас 2.0: значки місць за містами (старі споруди, пам'ятники, краєвиди, технології). Дрібні крапки здалеку, значки зблизька, підписи ще ближче.
(function () {
  'use strict';
  const A = globalThis.Atlas2, COL = { ruin: '#8a8f99', monument: '#d9a82e', vista: '#4fae6a', tech: '#2fa6b8' };
  A.LANDMARK_COL = COL;
  A.drawLandmarks = function (ctx, W, px, k, L) {
    if (!W.landmarks || k < 2.2 || L.sites === false) return; const full = k >= 6; ctx.lineJoin = 'round';
    for (const l of W.landmarks) {
      const x = l.x + 0.5, y = l.y + 0.5, r = 4.4 * px;
      if (!full) { ctx.beginPath(); ctx.arc(x, y, 1.8 * px, 0, 6.2832); ctx.fillStyle = COL[l.kind]; ctx.globalAlpha = 0.7; ctx.fill(); ctx.globalAlpha = 1; continue; }
      ctx.beginPath();
      if (l.kind === 'ruin') ctx.rect(x - r * 0.85, y - r * 0.85, r * 1.7, r * 1.7);
      else if (l.kind === 'monument') { ctx.moveTo(x, y - r * 1.4); ctx.lineTo(x + r * 0.7, y + r); ctx.lineTo(x - r * 0.7, y + r); ctx.closePath(); }
      else if (l.kind === 'vista') { ctx.moveTo(x - r * 1.2, y + r * 0.2); ctx.quadraticCurveTo(x, y - r * 1.5, x + r * 1.2, y + r * 0.2); ctx.quadraticCurveTo(x, y + r * 1.3, x - r * 1.2, y + r * 0.2); }
      else for (let i = 0; i < 16; i++) { const a = i / 16 * 6.2832, rr = i % 2 ? r * 0.8 : r * 1.2; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
      ctx.closePath(); ctx.fillStyle = COL[l.kind]; ctx.fill(); ctx.strokeStyle = 'rgba(30,25,20,.9)'; ctx.lineWidth = 1.1 * px; ctx.stroke();
      if (l.kind === 'vista' || l.kind === 'tech') { ctx.beginPath(); ctx.arc(x, y, r * 0.32, 0, 6.2832); ctx.fillStyle = '#fff'; ctx.fill(); }
      if (L.labels && k >= 9) { ctx.font = `italic 600 ${9.5 * px}px sans-serif`; ctx.fillStyle = '#2b2a20'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 3 * px; ctx.strokeText(l.name, x + r * 1.6, y); ctx.fillText(l.name, x + r * 1.6, y); }
    }
  };
})();
