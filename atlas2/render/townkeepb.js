// Атлас 2.0, місто: малювання споруд замку. Одна кам'яна палітра за призначенням (головні — найсвітліші, військові — сланцеві, господарські — теплі сірі), тінь від світла з північного заходу,
// двосхилий дах із гребенем, донжон із зубцями й башточками на кутах (на моті — круглий із дахом-шатром), каплиця з апсидою, плац і господарський двір просто неба. Повертає false для руїн, згарищ і кубла: їх малює загальний код.
// x: {g, k} — полотно й масштаб з render/town.js; b — споруда замку (kp), c — місто.
(function () {
  'use strict';
  const A = globalThis.Atlas2, TAU = Math.PI * 2;
  const OUT = '#2f2f3c', SH = 'rgba(28,28,44,.3)', FLAG = '#b5483c';
  const ROLE = { donjon: 'keep', palas: 'keep', chapel: 'holy', library: 'holy', hospital: 'holy', barracks: 'mil', hq: 'mil', armory: 'mil', stable: 'mil', prison: 'mil', smith: 'mil', drill: 'yard', farmyard: 'yard' };
  const FILL = { keep: ['#d6d4e6', '#bebcd4'], holy: ['#e6e2f0', '#d0ccde'], mil: ['#aaa9c3', '#9392af'], svc: ['#beb6ac', '#a9a196'] };
  // чи перша половина даху (ліва для вертикального гребеня, верхня для горизонтального) повернута до світла з північного заходу
  const lit = (a, vert) => (vert ? Math.cos(a) + Math.sin(a) : Math.cos(a) - Math.sin(a)) >= 0;
  function donjonRound(g, b, k) {
    const R = Math.max(2, b.w / 2 * k);
    g.beginPath(); g.arc(R * 0.4, R * 0.55, R * 1.05, 0, TAU); g.fillStyle = SH; g.fill(); g.beginPath(); g.arc(R * 0.2, R * 0.28, R * 1.03, 0, TAU); g.fill();
    g.beginPath(); g.arc(0, 0, R, 0, TAU); g.fillStyle = FILL.keep[0]; g.fill(); g.lineWidth = Math.max(1.2, 1.1 * k); g.strokeStyle = OUT; g.stroke();
    if (R > 6) { const n = Math.max(10, Math.round(R / 1.3)), per = TAU * R * 0.86 / n; g.beginPath(); g.arc(0, 0, R * 0.86, 0, TAU); g.setLineDash([per * 0.58, per * 0.42]); g.lineWidth = Math.max(1, R * 0.12); g.stroke(); g.setLineDash([]); }
    const rr = R * 0.66; for (let i = 0; i < 8; i++) { g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, rr, i * TAU / 8 - 0.3, (i + 1) * TAU / 8 - 0.3); g.closePath(); g.fillStyle = FILL.keep[i & 1]; g.fill(); }
    g.beginPath(); g.arc(0, 0, rr, 0, TAU); g.lineWidth = Math.max(0.7, 0.5 * k); g.stroke();
    if (R > 8) { g.fillStyle = FLAG; g.beginPath(); g.moveTo(0, 0); g.lineTo(R * 0.5, -R * 0.1); g.lineTo(0, -R * 0.24); g.closePath(); g.fill(); }
  }
  function donjonSquare(g, b, k, w, h) {
    g.fillStyle = FILL.keep[0]; g.fillRect(-w / 2, -h / 2, w, h); g.lineWidth = Math.max(1.3, 1.2 * k); g.strokeStyle = OUT; g.strokeRect(-w / 2, -h / 2, w, h);
    const m = Math.max(1.2, 1.2 * k), iw = w - m * 2, ih = h - m * 2; if (Math.min(w, h) > 10) { const per = Math.max(3, Math.min(w, h) * 0.12); g.setLineDash([per * 0.6, per * 0.4]); g.lineWidth = Math.max(1, 0.9 * k); g.strokeRect(-iw / 2, -ih / 2, iw, ih); g.setLineDash([]); }
    const rw = w * 0.62, rh = h * 0.62; g.fillStyle = FILL.keep[1]; g.fillRect(-rw / 2, -rh / 2, rw, rh); g.lineWidth = Math.max(0.7, 0.5 * k); g.strokeRect(-rw / 2, -rh / 2, rw, rh);
    g.beginPath(); g.moveTo(-rw / 2, -rh / 2); g.lineTo(rw / 2, rh / 2); g.moveTo(rw / 2, -rh / 2); g.lineTo(-rw / 2, rh / 2); g.stroke();
    const tr = Math.max(2.2, Math.min(w, h) * 0.13); for (const sx of [-1, 1]) for (const sy of [-1, 1]) { g.beginPath(); g.arc(sx * (w / 2 - tr * 0.4), sy * (h / 2 - tr * 0.4), tr, 0, TAU); g.fillStyle = FILL.keep[1]; g.fill(); g.lineWidth = Math.max(1, 0.9 * k); g.stroke(); }
    if (Math.min(w, h) > 14) { g.fillStyle = FLAG; g.beginPath(); g.moveTo(0, 0); g.lineTo(w * 0.17, -h * 0.03); g.lineTo(0, -h * 0.07); g.closePath(); g.fill(); }
  }
  // повертає true, якщо намалював
  function draw(x, b, c) {
    if (b.cond === 'ruined' || b.cond === 'burnt' || b.cond === 'lair' || b.type === 'castle') return false;
    const { g, k } = x, w = b.w * k, h = b.h * k, role = ROLE[b.type] || 'svc', yard = role === 'yard', sx = Math.max(0.8, 0.9 * k), sy = Math.max(1.1, 1.3 * k);
    g.save(); g.translate(b.x * k, b.y * k);
    if (!yard) { const hh = b.type === 'donjon' && !b.round ? 2.2 : 1; g.save(); g.translate(sx * hh, sy * hh); g.rotate(b.a); if (b.round) { g.beginPath(); g.arc(0, 0, Math.max(2, w / 2 * 1.02), 0, TAU); } else { g.beginPath(); g.rect(-w / 2, -h / 2, w, h); } g.fillStyle = SH; g.fill(); g.restore(); }
    g.rotate(b.a);
    if (b.round) donjonRound(g, b, k);
    else if (b.type === 'donjon') donjonSquare(g, b, k, w, h);
    else if (yard) {
      g.fillStyle = b.type === 'drill' ? '#e6d9ae' : '#e0d6ac'; g.fillRect(-w / 2, -h / 2, w, h); g.lineWidth = Math.max(1, 0.9 * k); g.strokeStyle = b.type === 'drill' ? '#9b8a5a' : '#7a6a44'; g.setLineDash([Math.max(2, 2 * k), Math.max(1.5, 1.4 * k)]); g.strokeRect(-w / 2, -h / 2, w, h); g.setLineDash([]);
      if (k > 0.5) { g.strokeStyle = 'rgba(122,106,68,.4)'; g.lineWidth = Math.max(0.6, 0.4 * k); g.beginPath(); const st = Math.max(4, 3.2 * k); for (let y = -h / 2 + st; y < h / 2 - 1; y += st) { g.moveTo(-w / 2 + 2, y); g.lineTo(w / 2 - 2, y); } g.stroke(); }
    } else {
      const vert = b.w < b.h, [c0, c1] = FILL[role], sw = lit(b.a, vert);
      g.fillStyle = sw ? c0 : c1; if (vert) g.fillRect(-w / 2, -h / 2, w / 2, h); else g.fillRect(-w / 2, -h / 2, w, h / 2);
      g.fillStyle = sw ? c1 : c0; if (vert) g.fillRect(0, -h / 2, w / 2, h); else g.fillRect(-w / 2, 0, w, h / 2);
      if (b.type === 'chapel' && w < h) { const r = w * 0.36; g.beginPath(); g.arc(0, h / 2, r, 0, Math.PI); g.fillStyle = c1; g.fill(); g.lineWidth = Math.max(1, 0.9 * k); g.strokeStyle = OUT; g.stroke(); }
      g.lineWidth = Math.max(1, 0.95 * k); g.strokeStyle = OUT; g.strokeRect(-w / 2, -h / 2, w, h);
      if (k > 0.3) { g.lineWidth = Math.max(0.7, 0.5 * k); g.strokeStyle = 'rgba(41,41,56,.55)'; g.beginPath(); if (vert) { g.moveTo(0, -h / 2); g.lineTo(0, h / 2); } else { g.moveTo(-w / 2, 0); g.lineTo(w / 2, 0); } g.stroke(); }
      if (k > 0.55) { g.lineWidth = Math.max(0.6, 0.4 * k); g.strokeStyle = 'rgba(41,41,56,.4)'; g.beginPath();
        if (b.type === 'stable' || b.type === 'barracks' || b.type === 'granary' || b.type === 'warehouse') { const n = Math.max(2, Math.round((vert ? b.h : b.w) / (b.type === 'barracks' ? 6.5 : 4.5))); for (let i = 1; i < n; i++) { const t = i / n - 0.5; if (vert) { g.moveTo(-w / 2, t * h); g.lineTo(w / 2, t * h); } else { g.moveTo(t * w, -h / 2); g.lineTo(t * w, h / 2); } } }
        else if (b.type === 'chapel' || b.type === 'hospital') { g.lineWidth = Math.max(1, 0.8 * k); const cw = Math.min(w, h) * 0.34; g.moveTo(-cw / 2, 0); g.lineTo(cw / 2, 0); g.moveTo(0, -cw / 2); g.lineTo(0, cw / 2); }
        else if (b.type === 'smith' || b.type === 'kitchen' || b.type === 'brewery') { const q = Math.min(w, h) * 0.18; g.rect(-q / 2 + (vert ? 0 : w * 0.22), -q / 2, q, q); g.fillStyle = 'rgba(41,41,56,.55)'; g.fill(); }
        g.stroke(); }
    }
    g.restore(); return true;
  }
  A.TownKeepBuild = { draw };
})();
