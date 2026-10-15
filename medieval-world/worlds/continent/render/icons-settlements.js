// Значки поселень: столиця — замок, центр регіону — місто з муром, містечко, село, хутір, шахта. Стан змінює вигляд.
(function () {
  'use strict';
  const R = (globalThis.RealmMap = globalThis.RealmMap || {});
  const INK = '#2f2418';
  // Тонування за станом без ctx.filter (він дуже повільний у програмному растеризаторі): сірий для зруйнованих і покинутих, червонуватий для захоплених
  let mode = '';
  function T(hex) {
    if (!mode || hex[0] !== '#') return hex;
    const c = R.Palette.hex2rgb(hex), gray = (c[0] + c[1] + c[2]) / 3;
    if (mode === 'gray') return 'rgb(' + Math.round(gray * 0.92) + ',' + Math.round(gray * 0.9) + ',' + Math.round(gray * 0.88) + ')';
    return 'rgb(' + Math.round(Math.min(255, c[0] * 0.8 + 70)) + ',' + Math.round(c[1] * 0.55) + ',' + Math.round(c[2] * 0.5) + ')';
  }

  function house(ctx, x, y, w, h, roof, wall) {
    ctx.fillStyle = T(wall); ctx.fillRect(x - w / 2, y - h * 0.55, w, h * 0.55);
    ctx.beginPath(); ctx.moveTo(x - w * 0.62, y - h * 0.55); ctx.lineTo(x, y - h); ctx.lineTo(x + w * 0.62, y - h * 0.55); ctx.closePath(); ctx.fillStyle = T(roof); ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = Math.max(0.7, w * 0.09); ctx.strokeRect(x - w / 2, y - h * 0.55, w, h * 0.55); ctx.stroke();
  }
  function tower(ctx, x, y, w, h, wall, roof) {
    ctx.fillStyle = T(wall); ctx.fillRect(x - w / 2, y - h, w, h); ctx.strokeStyle = INK; ctx.lineWidth = Math.max(0.7, w * 0.1); ctx.strokeRect(x - w / 2, y - h, w, h);
    ctx.beginPath(); ctx.moveTo(x - w * 0.65, y - h); ctx.lineTo(x, y - h - w * 0.9); ctx.lineTo(x + w * 0.65, y - h); ctx.closePath(); ctx.fillStyle = T(roof); ctx.fill(); ctx.stroke();
  }
  function castle(ctx, x, y, s) {
    const wall = '#ece0bf', roof = '#b3402f';
    ctx.fillStyle = T(wall); ctx.fillRect(x - s * 0.7, y - s * 0.55, s * 1.4, s * 0.55); ctx.strokeStyle = INK; ctx.lineWidth = Math.max(0.9, s * 0.07); ctx.strokeRect(x - s * 0.7, y - s * 0.55, s * 1.4, s * 0.55);
    tower(ctx, x - s * 0.66, y, s * 0.32, s * 0.95, wall, roof); tower(ctx, x + s * 0.66, y, s * 0.32, s * 0.95, wall, roof); tower(ctx, x, y - s * 0.1, s * 0.42, s * 1.3, wall, roof);
    ctx.fillStyle = INK; ctx.fillRect(x - s * 0.1, y - s * 0.3, s * 0.2, s * 0.3);
    ctx.beginPath(); ctx.moveTo(x, y - s * 1.75); ctx.lineTo(x, y - s * 2.15); ctx.lineTo(x + s * 0.4, y - s * 2.0); ctx.lineTo(x, y - s * 1.88); ctx.fillStyle = '#e8c04a'; ctx.fill(); ctx.stroke();
  }
  function city(ctx, x, y, s) {
    const wall = '#e6dcc0', roof = '#a8472f';
    ctx.fillStyle = T('#cfc3a2'); ctx.fillRect(x - s * 0.8, y - s * 0.4, s * 1.6, s * 0.4); ctx.strokeStyle = INK; ctx.lineWidth = Math.max(0.8, s * 0.07); ctx.strokeRect(x - s * 0.8, y - s * 0.4, s * 1.6, s * 0.4);
    house(ctx, x - s * 0.42, y - s * 0.35, s * 0.5, s * 0.55, roof, wall); house(ctx, x + s * 0.45, y - s * 0.35, s * 0.5, s * 0.55, roof, wall); tower(ctx, x, y - s * 0.1, s * 0.4, s * 0.95, wall, roof);
  }
  function town(ctx, x, y, s) { house(ctx, x - s * 0.5, y, s * 0.55, s * 0.6, '#a8472f', '#e6dcc0'); house(ctx, x + s * 0.5, y, s * 0.55, s * 0.6, '#a8472f', '#e6dcc0'); house(ctx, x, y - s * 0.12, s * 0.7, s * 0.8, '#b9553a', '#efe5c8'); }
  function village(ctx, x, y, s) { house(ctx, x - s * 0.38, y, s * 0.55, s * 0.6, '#9a5a35', '#e1d6b8'); house(ctx, x + s * 0.4, y - s * 0.05, s * 0.5, s * 0.55, '#9a5a35', '#e1d6b8'); }
  function hamlet(ctx, x, y, s) { house(ctx, x, y, s * 0.7, s * 0.75, '#8a5a38', '#e1d6b8'); }
  function mine(ctx, x, y, s) {
    ctx.fillStyle = T('#6b6258'); ctx.beginPath(); ctx.arc(x, y, s * 0.55, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = Math.max(0.8, s * 0.1); ctx.stroke();
    ctx.fillStyle = '#17120e'; ctx.fillRect(x - s * 0.18, y - s * 0.3, s * 0.36, s * 0.3);
    ctx.beginPath(); ctx.moveTo(x - s * 0.6, y - s * 0.95); ctx.lineTo(x + s * 0.6, y - s * 0.25); ctx.moveTo(x + s * 0.6, y - s * 0.95); ctx.lineTo(x - s * 0.6, y - s * 0.25); ctx.stroke();
  }
  const DRAW = { capital: [castle, 11], regional: [city, 9], town: [town, 7.5], village: [village, 6], hamlet: [hamlet, 4.8], mine: [mine, 5.4] };

  function anchor(ctx, x, y, s) { ctx.strokeStyle = '#0f3a5a'; ctx.lineWidth = Math.max(0.9, s * 0.18); ctx.beginPath(); ctx.arc(x, y - s * 0.55, s * 0.15, 0, 6.3); ctx.moveTo(x, y - s * 0.4); ctx.lineTo(x, y + s * 0.4); ctx.moveTo(x - s * 0.3, y - s * 0.15); ctx.lineTo(x + s * 0.3, y - s * 0.15); ctx.moveTo(x - s * 0.4, y + s * 0.05); ctx.quadraticCurveTo(x, y + s * 0.65, x + s * 0.4, y + s * 0.05); ctx.stroke(); }
  function skull(ctx, x, y, s) { ctx.fillStyle = '#f3efe6'; ctx.beginPath(); ctx.arc(x, y, s * 0.5, 0, 6.3); ctx.fill(); ctx.strokeStyle = '#7a1c1c'; ctx.lineWidth = Math.max(0.8, s * 0.12); ctx.stroke(); ctx.fillStyle = '#7a1c1c'; ctx.fillRect(x - s * 0.28, y - s * 0.12, s * 0.2, s * 0.22); ctx.fillRect(x + s * 0.08, y - s * 0.12, s * 0.2, s * 0.22); }

  // Малює поселення зі станом: k — множник розміру (за масштабом карти)
  function drawSettlement(ctx, s, sx, sy, k) {
    const d = DRAW[s.rank], size = d[1] * k;
    ctx.save();
    if (s.state === 'abandoned') ctx.globalAlpha = 0.5;
    if (s.state === 'fallen') ctx.globalAlpha = 0.82;
    mode = s.state === 'ruined' || s.state === 'abandoned' ? 'gray' : s.state === 'occupied' ? 'red' : '';
    // ореол столиць і центрів
    if (s.rank === 'capital' || s.rank === 'regional') { ctx.beginPath(); ctx.arc(sx, sy - size * 0.35, size * (s.rank === 'capital' ? 1.55 : 1.2), 0, 6.3); ctx.fillStyle = 'rgba(255,244,214,.45)'; ctx.fill(); }
    d[0](ctx, sx, sy, size); mode = '';
    ctx.restore();
    if (s.state === 'ruined') { ctx.strokeStyle = '#4a3b30'; ctx.lineWidth = Math.max(1, size * 0.12); ctx.beginPath(); ctx.moveTo(sx - size * 0.6, sy - size * 0.1); ctx.lineTo(sx + size * 0.6, sy - size * 0.7); ctx.moveTo(sx - size * 0.6, sy - size * 0.7); ctx.lineTo(sx + size * 0.6, sy - size * 0.1); ctx.stroke(); }
    if (s.state === 'occupied') skull(ctx, sx + size * 0.75, sy - size * 0.85, size * 0.6);
    if (s.state === 'fallen') { ctx.fillStyle = '#6a4a2a'; ctx.beginPath(); ctx.moveTo(sx + size * 0.5, sy - size * 1.05); ctx.lineTo(sx + size * 0.95, sy - size * 1.05); ctx.lineTo(sx + size * 0.72, sy - size * 0.65); ctx.closePath(); ctx.fill(); }
    if (s.port) anchor(ctx, sx + size * 0.85, sy + size * 0.25, size * 0.7);
  }
  R.IconsSettlements = { drawSettlement, SIZE: k => k };
})();
