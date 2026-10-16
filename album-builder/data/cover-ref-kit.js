// Малювальні допоміжні функції для обкладинок «за зразками» (data/cover-ref-*.js): золотий пил, текст, що змінює колір на фото, текст по дузі, лаврові й оливкові гілки, дошки, крейда.
// Усе власне (прості фігури canvas), без чужої графіки. Підключається після cover-variants.js; доступно як AlbumCoverVariants.K.
(function (root) {
  var CV = root.AlbumCoverVariants || (typeof require !== 'undefined' ? require('./cover-variants.js') : null);
  var H = CV.H, rnd = H.rnd;
  // Золотий пил: крапки й чотирикутні блискітки в прямокутнику
  function sparkle(c, x, y, r, col) {
    c.beginPath(); c.moveTo(x, y - r); c.quadraticCurveTo(x, y, x + r, y); c.quadraticCurveTo(x, y, x, y + r); c.quadraticCurveTo(x, y, x - r, y); c.quadraticCurveTo(x, y, x, y - r); c.closePath(); c.fillStyle = col; c.fill();
  }
  function dust(c, x, y, w, h, n, cols, seed, smax) {
    var r = rnd(seed);
    for (var i = 0; i < n; i++) { var px = x + r() * w, py = y + r() * h, s = 0.25 + r() * (smax || 1.1); if (i % 11 === 0) sparkle(c, px, py, s * 3.2, cols[i % cols.length]); else H.circle(c, px, py, s, cols[i % cols.length]); }
  }
  // Дрібне зерно паперу
  function grain(c, x, y, w, h, n, seed, a) {
    var r = rnd(seed); for (var i = 0; i < n; i++) { c.fillStyle = (i % 2 ? 'rgba(0,0,0,' : 'rgba(255,255,255,') + (a * (0.4 + r())) + ')'; c.fillRect(x + r() * w, y + r() * h, 0.35 + r() * 0.5, 0.35 + r() * 0.5); }
  }
  // Малює двічі: усередині rect (drawIn) і поза ним (drawOut): напис «змінює колір», коли перетинає край фото
  function splitClip(c, g, rect, drawIn, drawOut) {
    c.save(); c.beginPath(); c.rect(rect.x, rect.y, rect.w, rect.h); c.clip(); drawIn(); c.restore();
    c.save(); c.beginPath(); c.rect(0, 0, g.W, g.H); c.rect(rect.x, rect.y, rect.w, rect.h); c.clip('evenodd'); drawOut(); c.restore();
  }
  // Текст по дузі кола (центр дуги вгорі): cx, cy центр кола, r радіус, sp додатковий інтервал у мм
  function arcText(c, text, cx, cy, r, size, font, col, weight, sp) {
    c.save(); c.font = (weight || '400') + ' ' + size + 'px ' + font; c.fillStyle = col; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
    var ws = [], tot = 0, i; for (i = 0; i < text.length; i++) { var w = c.measureText(text[i]).width + (sp || 0); ws.push(w); tot += w; }
    var a = -Math.PI / 2 - (tot / r) / 2;
    for (i = 0; i < text.length; i++) { var da = ws[i] / r, am = a + da / 2; c.save(); c.translate(cx + Math.cos(am) * r, cy + Math.sin(am) * r); c.rotate(am + Math.PI / 2); c.fillText(text[i], 0, 0); c.restore(); a += da; }
    c.restore();
  }
  // Золотий градієнт у локальних координатах напису (його малює fitText з переносом у точку напису)
  function goldLocal(c, size, w, light) {
    var g = c.createLinearGradient(-w / 2, -size * 0.9, w / 2, size * 0.3);
    g.addColorStop(0, light ? '#e9cf8a' : '#b88a2e'); g.addColorStop(0.45, light ? '#fff0b8' : '#e5c36a'); g.addColorStop(1, light ? '#d6b261' : '#a97c25'); return g;
  }
  // Контурна оливкова гілка: стебло й листки-мигдалини лише лінією
  function olive(c, x, y, len, ang, col, lw, n, flip) {
    c.save(); c.translate(x, y); c.rotate(ang); if (flip) c.scale(1, -1); c.strokeStyle = col; c.lineWidth = lw || 0.35; c.lineCap = 'round';
    c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(len * 0.3, -len * 0.07, len * 0.65, len * 0.05, len, -len * 0.02); c.stroke();
    n = n || 9;
    for (var i = 1; i <= n; i++) {
      var t = i / (n + 0.6), px = len * t, py = -len * 0.02 * t + Math.sin(t * 3.1) * len * 0.015, ls = len * 0.095 * (1 - t * 0.45);
      [-1, 1].forEach(function (s, k) {
        c.save(); c.translate(px, py); c.rotate(s * (0.75 + (i % 2) * 0.12)); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(ls * 0.5, -ls * 0.3 * s, ls, 0); c.quadraticCurveTo(ls * 0.5, ls * 0.3 * s, 0, 0); c.stroke(); c.restore();
      });
    }
    c.beginPath(); c.moveTo(len, -len * 0.02); c.quadraticCurveTo(len + len * 0.05, -len * 0.045, len + len * 0.11, -len * 0.02); c.quadraticCurveTo(len + len * 0.05, len * 0.02, len, -len * 0.02); c.stroke();
    c.restore();
  }
  // Лавровий вінок: дві гілки з листків навколо кола; листок рисується контуром
  function wreath(c, cx, cy, r, col, lw, n, gap) {
    c.save(); c.strokeStyle = col; c.lineWidth = lw || 0.35; c.lineCap = 'round'; n = n || 15; gap = gap == null ? 0.45 : gap;
    [-1, 1].forEach(function (side) {
      c.beginPath(); for (var k = 0; k <= 40; k++) { var a = Math.PI / 2 + side * (gap + (Math.PI - gap - 0.3) * k / 40); var x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r; if (k === 0) c.moveTo(x, y); else c.lineTo(x, y); } c.stroke();
      for (var i = 0; i < n; i++) {
        var t = (i + 0.5) / n, a2 = Math.PI / 2 + side * (gap + (Math.PI - gap - 0.3) * t), px = cx + Math.cos(a2) * r, py = cy + Math.sin(a2) * r, ls = r * (0.16 - t * 0.04);
        [-1, 1].forEach(function (q) { c.save(); c.translate(px, py); c.rotate(a2 + side * Math.PI / 2 + q * 0.62); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(ls * 0.5, -ls * 0.32, ls, 0); c.quadraticCurveTo(ls * 0.5, ls * 0.32, 0, 0); c.stroke(); c.restore(); });
      }
    });
    c.restore();
  }
  // Дерев'яні дошки по горизонталі: base — масив відтінків, лінії стиків і прожилки
  function planks(c, x0, x1, h, base, ph, seed, vein) {
    var r = rnd(seed), y = 0, i = 0;
    while (y < h) { var bh = ph * (0.85 + r() * 0.3); c.fillStyle = base[i % base.length]; c.fillRect(x0, y, x1 - x0, bh); for (var k = 0; k < 9; k++) { var yy = y + r() * bh; c.strokeStyle = vein; c.lineWidth = 0.15 + r() * 0.25; c.beginPath(); c.moveTo(x0 + r() * 20, yy); c.bezierCurveTo(x0 + (x1 - x0) * 0.3, yy + (r() - 0.5) * 2, x0 + (x1 - x0) * 0.6, yy + (r() - 0.5) * 2, x1, yy + (r() - 0.5) * 1.5); c.stroke(); } c.fillStyle = 'rgba(0,0,0,.22)'; c.fillRect(x0, y + bh - 0.35, x1 - x0, 0.35); y += bh; i++; }
  }
  // «Крейдяна» ламана: кілька проходів з тремтінням і напівпрозорістю
  function chalk(c, pts, col, lw, seed, passes) {
    var r = rnd(seed || 5); c.save(); c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = col;
    for (var p = 0; p < (passes || 3); p++) { c.globalAlpha = 0.5 + r() * 0.3; c.lineWidth = lw * (0.7 + r() * 0.5); c.beginPath(); pts.forEach(function (q, i) { var x = q[0] + (r() - 0.5) * 0.5, y = q[1] + (r() - 0.5) * 0.5; if (i === 0) c.moveTo(x, y); else c.lineTo(x, y); }); c.stroke(); }
    c.restore();
  }
  function chalkCircle(c, x, y, rx, ry, rot, col, lw, seed) {
    var pts = []; for (var i = 0; i <= 36; i++) { var a = i / 36 * Math.PI * 2; pts.push([x + Math.cos(rot) * Math.cos(a) * rx - Math.sin(rot) * Math.sin(a) * ry, y + Math.sin(rot) * Math.cos(a) * rx + Math.cos(rot) * Math.sin(a) * ry]); }
    chalk(c, pts, col, lw, seed, 2);
  }
  // Вертикальне розташування тексту: рисує fn у системі, повернутій на -90° навколо (x,y)
  function rot90(c, x, y, fn) { c.save(); c.translate(x, y); c.rotate(-Math.PI / 2); fn(); c.restore(); }
  // Безпечна зона: рядки тексту задано в частках висоти для смуги 0.04H...0.96H; map стискає їх у реальну безпечну смугу [sb, H - sb] (центр на місці).
  function map(f, y) { return Math.max(f.sb, Math.min(f.H - f.sb, f.sb + (y - 0.04 * f.H) * (f.H - 2 * f.sb) / (0.92 * f.H))); }
  function rectM(f, r) { var y = map(f, r.y), y2 = map(f, r.y + r.h); return { x: r.x, y: y, w: r.w, h: y2 - y }; }
  // Обгортка g: tx/fx стискають свій y (4-й аргумент) у безпечну смугу; rtx/rfx лишаються як є (для обертання й координат від фото)
  function safe(g) {
    var s = Object.create(g); s.tx = function () { var a = [].slice.call(arguments); a[3] = map(g, a[3]); return g.tx.apply(g, a); }; s.fx = function () { var a = [].slice.call(arguments); a[3] = map(g, a[3]); return g.fx.apply(g, a); };
    s.rtx = g.tx; s.rfx = g.fx; return s;
  }
  CV.K = { map: map, rectM: rectM, safe: safe, sparkle: sparkle, dust: dust, grain: grain, splitClip: splitClip, arcText: arcText, goldLocal: goldLocal, olive: olive, wreath: wreath, planks: planks, chalk: chalk, chalkCircle: chalkCircle, rot90: rot90 };
})(typeof self !== 'undefined' ? self : this);
