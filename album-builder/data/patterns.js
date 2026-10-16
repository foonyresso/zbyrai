// Візерунки для порожніх клітинок: малюються кодом (без файлів), тому чіткі у будь-якому розмірі друку.
// draw(ctx, x, y, w, h, s, color): s = крок візерунка в мм; усе обрізається по клітинці.
(function (root) {
  function tile(ctx, x, y, w, h, s, fn, off) {
    var rows = Math.ceil(h / s) + 1, cols = Math.ceil(w / s) + 1;
    for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) fn(x + c * s + (off && r % 2 ? s / 2 : 0), y + r * s, r, c);
  }
  function rng(seed) { var t = seed >>> 0; return function () { t = (t + 0x6D2B79F5) >>> 0; var r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; }; }
  function star(ctx, cx, cy, R, r, n, rot) { ctx.beginPath(); for (var i = 0; i < n * 2; i++) { var a = rot + i * Math.PI / n, q = i % 2 ? r : R; ctx.lineTo(cx + Math.cos(a) * q, cy + Math.sin(a) * q); } ctx.closePath(); }
  function heart(ctx, cx, cy, s) { ctx.beginPath(); ctx.moveTo(cx, cy + s * 0.4); ctx.bezierCurveTo(cx - s * 0.75, cy - s * 0.05, cx - s * 0.35, cy - s * 0.65, cx, cy - s * 0.2); ctx.bezierCurveTo(cx + s * 0.35, cy - s * 0.65, cx + s * 0.75, cy - s * 0.05, cx, cy + s * 0.4); ctx.closePath(); }
  function line(ctx, a, b, c, d) { ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo(c, d); ctx.stroke(); }
  var P = [
    { id: 'dots', name: 'Крапки', draw: function (g, x, y, w, h, s) { tile(g, x, y, w, h, s, function (px, py) { g.beginPath(); g.arc(px + s / 2, py + s / 2, s * 0.14, 0, 6.3); g.fill(); }); } },
    { id: 'polka', name: 'Горошок', draw: function (g, x, y, w, h, s) { tile(g, x, y, w, h, s, function (px, py) { g.beginPath(); g.arc(px + s / 2, py + s / 2, s * 0.25, 0, 6.3); g.fill(); }, true); } },
    { id: 'grid', name: 'Клітинка', draw: function (g, x, y, w, h, s) { for (var i = 0; i <= w / s; i++) line(g, x + i * s, y, x + i * s, y + h); for (var j = 0; j <= h / s; j++) line(g, x, y + j * s, x + w, y + j * s); } },
    { id: 'diag', name: 'Косі лінії', draw: function (g, x, y, w, h, s) { for (var i = -h; i < w; i += s) line(g, x + i, y + h, x + i + h, y); } },
    { id: 'cross', name: 'Сітка ромбів', draw: function (g, x, y, w, h, s) { for (var i = -h; i < w; i += s) { line(g, x + i, y + h, x + i + h, y); line(g, x + i, y, x + i + h, y + h); } } },
    { id: 'hstripe', name: 'Смужки', draw: function (g, x, y, w, h, s) { for (var j = 0; j < h; j += s) g.fillRect(x, y + j, w, s / 2); } },
    { id: 'vstripe', name: 'Вертикальні смужки', draw: function (g, x, y, w, h, s) { for (var i = 0; i < w; i += s) g.fillRect(x + i, y, s / 2, h); } },
    { id: 'checker', name: 'Шахівниця', draw: function (g, x, y, w, h, s) { tile(g, x, y, w, h, s, function (px, py, r, c) { if ((r + c) % 2 === 0) g.fillRect(px, py, s, s); }); } },
    { id: 'zigzag', name: 'Зигзаг', draw: function (g, x, y, w, h, s) { for (var j = 0; j <= h / s; j++) { g.beginPath(); for (var i = 0; i <= w / (s / 2) + 1; i++) g.lineTo(x + i * s / 2, y + j * s + (i % 2 ? s * 0.35 : 0)); g.stroke(); } } },
    { id: 'wave', name: 'Хвилі', draw: function (g, x, y, w, h, s) { for (var j = 0; j <= h / s + 1; j++) { g.beginPath(); for (var i = 0; i <= w; i += s / 6) g.lineTo(x + i, y + j * s + Math.sin(i / s * 6.283) * s * 0.22); g.stroke(); } } },
    { id: 'scales', name: 'Луска', draw: function (g, x, y, w, h, s) { tile(g, x - s / 2, y, w + s, h, s, function (px, py) { g.beginPath(); g.arc(px + s / 2, py + s / 2, s / 2, Math.PI, 0); g.stroke(); }, true); } },
    { id: 'seigaiha', name: 'Дуги-кола', draw: function (g, x, y, w, h, s) { tile(g, x - s, y - s, w + 2 * s, h + 2 * s, s, function (px, py) { for (var k = 1; k <= 3; k++) { g.beginPath(); g.arc(px + s / 2, py + s, s * k / 6, Math.PI, 0); g.stroke(); } }, true); } },
    { id: 'hex', name: 'Соти', draw: function (g, x, y, w, h, s) { var r = s * 0.5, dy = r * 1.5; for (var j = 0, yy = y; yy < y + h + r; j++, yy += dy) for (var xx = x + (j % 2 ? r * 0.866 : 0); xx < x + w + r; xx += r * 1.732) { g.beginPath(); for (var k = 0; k < 6; k++) g.lineTo(xx + Math.cos(k * 1.0472 + 0.5236) * r, yy + Math.sin(k * 1.0472 + 0.5236) * r); g.closePath(); g.stroke(); } } },
    { id: 'tri', name: 'Трикутники', draw: function (g, x, y, w, h, s) { tile(g, x, y, w, h, s, function (px, py, r) { g.beginPath(); g.moveTo(px, py + s); g.lineTo(px + s / 2, py); g.lineTo(px + s, py + s); g.closePath(); g.stroke(); }, true); } },
    { id: 'chevron', name: 'Шеврони', draw: function (g, x, y, w, h, s) { for (var j = -1; j <= h / (s * 0.5) + 1; j++) { g.beginPath(); for (var i = 0; i <= w / (s / 2) + 1; i++) g.lineTo(x + i * s / 2, y + j * s * 0.5 + (i % 2 ? s * 0.3 : 0)); g.stroke(); } } },
    { id: 'plus', name: 'Хрестики', draw: function (g, x, y, w, h, s) { tile(g, x, y, w, h, s, function (px, py) { var a = s * 0.18, cx = px + s / 2, cy = py + s / 2; line(g, cx - a, cy, cx + a, cy); line(g, cx, cy - a, cx, cy + a); }); } },
    { id: 'stars', name: 'Зірочки', draw: function (g, x, y, w, h, s) { tile(g, x, y, w, h, s, function (px, py) { star(g, px + s / 2, py + s / 2, s * 0.22, s * 0.09, 5, -1.5708); g.fill(); }, true); } },
    { id: 'hearts', name: 'Сердечка', draw: function (g, x, y, w, h, s) { tile(g, x, y, w, h, s, function (px, py) { heart(g, px + s / 2, py + s / 2, s * 0.45); g.fill(); }, true); } },
    { id: 'leaves', name: 'Листочки', draw: function (g, x, y, w, h, s) { tile(g, x, y, w, h, s, function (px, py, r, c) { g.save(); g.translate(px + s / 2, py + s / 2); g.rotate((r + c) % 2 ? 0.8 : -0.8); g.beginPath(); g.ellipse(0, 0, s * 0.28, s * 0.1, 0, 0, 6.3); g.fill(); g.restore(); }, true); } },
    { id: 'flowers', name: 'Квіточки', draw: function (g, x, y, w, h, s) { tile(g, x, y, w, h, s, function (px, py) { var cx = px + s / 2, cy = py + s / 2; for (var k = 0; k < 5; k++) { g.beginPath(); g.arc(cx + Math.cos(k * 1.2566) * s * 0.14, cy + Math.sin(k * 1.2566) * s * 0.14, s * 0.1, 0, 6.3); g.fill(); } }, true); } },
    { id: 'diamond', name: 'Ромби', draw: function (g, x, y, w, h, s) { tile(g, x, y, w, h, s, function (px, py) { g.beginPath(); g.moveTo(px + s / 2, py + s * 0.2); g.lineTo(px + s * 0.8, py + s / 2); g.lineTo(px + s / 2, py + s * 0.8); g.lineTo(px + s * 0.2, py + s / 2); g.closePath(); g.fill(); }); } },
    { id: 'rings', name: 'Кільця', draw: function (g, x, y, w, h, s) { var cx = x + w / 2, cy = y + h / 2, R = Math.hypot(w, h) / 2; for (var r = s / 2; r < R; r += s / 2) { g.beginPath(); g.arc(cx, cy, r, 0, 6.3); g.stroke(); } } },
    { id: 'rays', name: 'Промені', draw: function (g, x, y, w, h, s) { var cx = x + w / 2, cy = y + h / 2, R = Math.hypot(w, h), n = Math.max(12, Math.round(60 / s * 3)); for (var i = 0; i < n; i++) { var a = i * 6.283 / n; line(g, cx, cy, cx + Math.cos(a) * R, cy + Math.sin(a) * R); } } },
    { id: 'confetti', name: 'Конфеті', draw: function (g, x, y, w, h, s) { var r = rng(7), n = Math.round(w * h / (s * s) * 1.4); for (var i = 0; i < n; i++) { g.save(); g.translate(x + r() * w, y + r() * h); g.rotate(r() * 6.28); g.fillRect(-s * 0.1, -s * 0.04, s * 0.2, s * 0.08); g.restore(); } } },
    { id: 'squares', name: 'Квадратики', draw: function (g, x, y, w, h, s) { tile(g, x, y, w, h, s, function (px, py, r, c) { g.save(); g.translate(px + s / 2, py + s / 2); g.rotate(((r * 7 + c * 3) % 5) * 0.3); g.strokeRect(-s * 0.18, -s * 0.18, s * 0.36, s * 0.36); g.restore(); }); } },
    { id: 'bricks', name: 'Цегла', draw: function (g, x, y, w, h, s) { for (var j = 0; j <= h / (s / 2); j++) { line(g, x, y + j * s / 2, x + w, y + j * s / 2); for (var i = (j % 2) * s / 2; i <= w; i += s) line(g, x + i, y + j * s / 2, x + i, y + (j + 1) * s / 2); } } },
    { id: 'curls', name: 'Завитки', draw: function (g, x, y, w, h, s) { tile(g, x, y, w, h, s, function (px, py) { g.beginPath(); for (var t = 0; t < 12; t += 0.4) g.lineTo(px + s / 2 + Math.cos(t) * t * s * 0.028, py + s / 2 + Math.sin(t) * t * s * 0.028); g.stroke(); }, true); } },
    { id: 'caps', name: 'Випускні шапочки', draw: function (g, x, y, w, h, s) { tile(g, x, y, w, h, s * 1.4, function (px, py) { var cx = px + s * 0.7, cy = py + s * 0.7, a = s * 0.4; g.beginPath(); g.moveTo(cx, cy - a * 0.5); g.lineTo(cx + a, cy); g.lineTo(cx, cy + a * 0.5); g.lineTo(cx - a, cy); g.closePath(); g.fill(); g.beginPath(); g.moveTo(cx - a * 0.55, cy + a * 0.2); g.lineTo(cx - a * 0.55, cy + a * 0.65); g.quadraticCurveTo(cx, cy + a * 0.95, cx + a * 0.55, cy + a * 0.65); g.lineTo(cx + a * 0.55, cy + a * 0.2); g.stroke(); line(g, cx + a, cy, cx + a, cy + a * 0.6); }, true); } },
    { id: 'branch', name: 'Гілочки', draw: function (g, x, y, w, h, s) { for (var j = 0; j < h / (s * 1.2) + 1; j++) { var yy = y + j * s * 1.2 + s / 2; line(g, x, yy, x + w, yy); for (var i = 0; i < w; i += s * 0.6) { g.save(); g.translate(x + i, yy); g.rotate(-0.7); g.beginPath(); g.ellipse(s * 0.18, 0, s * 0.18, s * 0.06, 0, 0, 6.3); g.fill(); g.restore(); g.save(); g.translate(x + i, yy); g.rotate(0.7); g.beginPath(); g.ellipse(s * 0.18, 0, s * 0.18, s * 0.06, 0, 0, 6.3); g.fill(); g.restore(); } } } },
    { id: 'frame', name: 'Подвійна рамка', draw: function (g, x, y, w, h, s) { var m = Math.min(s * 0.5, w / 6, h / 6); g.strokeRect(x + m, y + m, w - 2 * m, h - 2 * m); g.strokeRect(x + m * 1.8, y + m * 1.8, w - 3.6 * m, h - 3.6 * m); } },
    { id: 'corners', name: 'Куточки', draw: function (g, x, y, w, h, s) { var m = Math.min(s * 0.5, w / 6, h / 6), L = Math.min(w, h) * 0.22; [[x + m, y + m, 1, 1], [x + w - m, y + m, -1, 1], [x + m, y + h - m, 1, -1], [x + w - m, y + h - m, -1, -1]].forEach(function (c) { g.beginPath(); g.moveTo(c[0] + c[2] * L, c[1]); g.lineTo(c[0], c[1]); g.lineTo(c[0], c[1] + c[3] * L); g.stroke(); g.beginPath(); g.arc(c[0] + c[2] * L * 0.28, c[1] + c[3] * L * 0.28, L * 0.1, 0, 6.3); g.stroke(); }); } }
  ];
  var byId = {}; P.forEach(function (p) { byId[p.id] = p; });
  var COLORS = [['#c9c9c9', 'Сірий'], ['#b9a0e6', 'Бузковий'], ['#d9b8b8', 'Рожевий'], ['#a9c4d6', 'Блакитний'], ['#b8cdb2', 'М\'ятний'], ['#d9c58f', 'Золотий'], ['#6b6b6b', 'Темно-сірий']];
  // Малює візерунок p ({id, c: колір, s: крок мм, img: ключ власної картинки}) у прямокутник r.
  function draw(ctx, r, p, imgs) {
    if (!p) return;
    ctx.save(); ctx.beginPath(); ctx.rect(r.x, r.y, r.w, r.h); ctx.clip();
    var s = p.s || 6;
    if (p.id === 'img') {
      var im = imgs && imgs.get(p.img);
      if (im) { var pat = ctx.createPattern(im, 'repeat'), k = s * 3 / Math.max(im.naturalWidth, im.naturalHeight, 1); ctx.translate(r.x, r.y); ctx.scale(k, k); ctx.fillStyle = pat; ctx.fillRect(0, 0, r.w / k, r.h / k); }
    } else if (byId[p.id]) {
      ctx.fillStyle = ctx.strokeStyle = p.c || '#c9c9c9'; ctx.lineWidth = Math.max(0.2, s * 0.045); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      byId[p.id].draw(ctx, r.x, r.y, r.w, r.h, s, p.c || '#c9c9c9');
    }
    ctx.restore();
  }
  var api = { LIST: P, byId: byId, COLORS: COLORS, draw: draw };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.AlbumPatterns = api;
})(typeof self !== 'undefined' ? self : this);
