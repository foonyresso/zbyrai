// Варіанти обкладинок дизайну «Світла класика» (головний, адаптивний дизайн).
// Окремі статичні дизайни з власною стилістикою додаються пізніше в designs.js; їхні обкладинки можна реєструвати тут же з полем design.
// Варіант: { id, name, note, cats: [id категорій] | null (усі), photo: чи є фото, pr: {top,h,asp} місце фото (частки висоти розвороту),
//   bg: колір | [верх, низ], deco(g) — малюнок позаду фото (обидві половини), text(g) — написи поверх; g: див. render.js (cover).
// Малюнки й візерунки власні (прості фігури на canvas), шрифти з fonts/ (ліцензії в fonts/NOTICE.md).
(function (root) {
  function circle(c, x, y, r, fill, stroke, lw) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 0.4; c.stroke(); } }
  function star(c, x, y, r, fill, rot) {
    c.beginPath(); for (var i = 0; i < 10; i++) { var a = (rot || -Math.PI / 2) + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    c.closePath(); c.fillStyle = fill; c.fill();
  }
  function tri(c, x, y, r, fill, rot) { c.beginPath(); for (var i = 0; i < 3; i++) { var a = (rot || 0) + i * 2.094; c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } c.closePath(); c.fillStyle = fill; c.fill(); }
  function line(c, x1, y1, x2, y2, col, lw) { c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.strokeStyle = col; c.lineWidth = lw || 0.35; c.stroke(); }
  function frame(c, x, y, w, h, col, lw) { c.strokeStyle = col; c.lineWidth = lw || 0.35; c.strokeRect(x, y, w, h); }
  function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  // Псевдовипадкові числа з зерном: візерунок однаковий на екрані й в експорті
  function rnd(seed) { var s = seed >>> 0 || 1; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  // Гілочка: вигнутий стебель з парами листочків
  function sprig(c, x, y, len, ang, col, n) {
    c.save(); c.translate(x, y); c.rotate(ang); c.strokeStyle = col; c.fillStyle = col; c.lineWidth = 0.4;
    c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(len * 0.25, -len * 0.08, len, 0); c.stroke();
    n = n || 7;
    for (var i = 1; i <= n; i++) {
      var t = i / (n + 1), px = len * t, py = -len * 0.08 * 2 * t * (1 - t) * 1, ls = len * 0.12 * (1 - t * 0.35);
      [-1, 1].forEach(function (s) { c.save(); c.translate(px, py); c.rotate(s * 0.9); c.beginPath(); c.ellipse(ls * 0.5, 0, ls * 0.5, ls * 0.24, 0, 0, Math.PI * 2); c.fill(); c.restore(); });
    }
    c.restore();
  }
  function wave(c, x0, x1, y, amp, len, col, lw) {
    c.beginPath(); for (var x = x0; x <= x1; x += 0.8) { var yy = y + Math.sin((x - x0) / len * Math.PI * 2) * amp; if (x === x0) c.moveTo(x, yy); else c.lineTo(x, yy); }
    c.strokeStyle = col; c.lineWidth = lw || 0.4; c.stroke();
  }
  function fillWave(c, x0, x1, y, amp, len, ph, col, bottom) {
    c.beginPath(); c.moveTo(x0, bottom); for (var x = x0; x <= x1; x += 0.8) c.lineTo(x, y + Math.sin((x - x0) / len * Math.PI * 2 + ph) * amp); c.lineTo(x1, bottom); c.closePath(); c.fillStyle = col; c.fill();
  }
  // Контур фігури для обрізання фото й рамок: rect | arch | oval | circle | diamond | hex | heart
  function shapePath(c, r, shape) {
    var x = r.x, y = r.y, w = r.w, h = r.h, cx = x + w / 2, cy = y + h / 2;
    c.beginPath();
    if (shape === 'arch') { c.moveTo(x, y + h); c.lineTo(x, y + w / 2); c.arc(cx, y + w / 2, w / 2, Math.PI, 0); c.lineTo(x + w, y + h); c.closePath(); }
    else if (shape === 'oval' || shape === 'circle') c.ellipse(cx, cy, w / 2, h / 2, 0, 0, Math.PI * 2);
    else if (shape === 'diamond') { c.moveTo(cx, y); c.lineTo(x + w, cy); c.lineTo(cx, y + h); c.lineTo(x, cy); c.closePath(); }
    else if (shape === 'hex') { c.moveTo(cx, y); c.lineTo(x + w, y + h * 0.25); c.lineTo(x + w, y + h * 0.75); c.lineTo(cx, y + h); c.lineTo(x, y + h * 0.75); c.lineTo(x, y + h * 0.25); c.closePath(); }
    else if (shape === 'heart') { c.moveTo(cx, y + h); c.bezierCurveTo(x - w * 0.15, y + h * 0.62, x + w * 0.02, y - h * 0.08, cx, y + h * 0.28); c.bezierCurveTo(x + w * 0.98, y - h * 0.08, x + w * 1.15, y + h * 0.62, cx, y + h); c.closePath(); }
    else c.rect(x, y, w, h);
  }
  // Обвідка фігури, збільшеної на grow мм з усіх боків
  function outline(c, r, shape, grow, col, lw) { shapePath(c, { x: r.x - grow, y: r.y - grow, w: r.w + 2 * grow, h: r.h + 2 * grow }, shape); c.strokeStyle = col; c.lineWidth = lw || 0.4; c.stroke(); }
  function flower(c, x, y, r, col, mid, n, rot) { for (var i = 0; i < (n || 6); i++) { c.save(); c.translate(x, y); c.rotate((rot || 0) + i * Math.PI * 2 / (n || 6)); c.beginPath(); c.ellipse(r * 0.55, 0, r * 0.55, r * 0.3, 0, 0, Math.PI * 2); c.fillStyle = col; c.fill(); c.restore(); } circle(c, x, y, r * 0.26, mid); }
  function leaf(c, x, y, len, ang, col) { c.save(); c.translate(x, y); c.rotate(ang); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(len * 0.5, -len * 0.38, len, 0); c.quadraticCurveTo(len * 0.5, len * 0.38, 0, 0); c.fillStyle = col; c.fill(); c.restore(); }
  // Акварельна пляма: rgb = 'r,g,b'
  function wash(c, x, y, r, rgb, a) { var g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(' + rgb + ',' + a + ')'); g.addColorStop(1, 'rgba(' + rgb + ',0)'); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); }
  function spray(c, x, y, r1, r2, n, cols, seed, smax) { var r = rnd(seed); for (var i = 0; i < n; i++) { var a = r() * 6.283, d = r1 + r() * (r2 - r1); circle(c, x + Math.cos(a) * d, y + Math.sin(a) * d, 0.4 + r() * (smax || 1.6), cols[i % cols.length]); } }
  // Кущик квітів з листям (акварельний): центр, масштаб
  function bouquet(c, x, y, k, rot, pal) {
    c.save(); c.translate(x, y); c.rotate(rot || 0);
    for (var i = 0; i < 7; i++) leaf(c, 0, 0, k * 1.05, -2.6 + i * 0.5, i % 2 ? pal[3] : pal[4]);
    flower(c, -k * 0.2, -k * 0.1, k * 0.5, pal[0], pal[2], 6, 0.3); flower(c, k * 0.28, k * 0.1, k * 0.4, pal[1], pal[2], 5, 1); flower(c, k * 0.05, -k * 0.38, k * 0.28, pal[0], pal[2], 5, 0.1);
    c.restore();
  }
  // Спільна розкладка написів: усе необов'язкове, шрифти й кольори задає варіант
  function std(g, o) {
    var H = g.H, cx = g.cx, W = g.W, mw = (g.x1 - g.x0) - 2 * g.sb * 0.6;
    var title = g.titleOverride || o.title;
    if (title) g.tx('ctitle', title, cx, o.ty, o.tsize, mw * (o.tw || 1), o.tfont, o.tcol, o.tw8 || '400', 'center', o.tsp == null ? 0.04 : o.tsp, o.tcase || 'as');
    if (o.sub) g.tx('csub', o.sub, cx, o.sy, o.ssize || o.tsize * 0.4, mw, o.sfont || o.tfont, o.scol || o.tcol, '400', 'center', o.ssp == null ? 0.18 : o.ssp, o.scase || 'upper');
    if (g.year && o.yy != null) g.tx('year', g.year, cx, o.yy, o.ysize, mw, o.yfont, o.ycol, o.y8 || '400', 'center', o.ysp == null ? 0.04 : o.ysp, 'as');
    if (g.owner && o.ny != null) g.tx('name', g.owner, cx, o.ny, o.nsize || H * 0.034, mw, o.nfont, o.ncol, '400', 'center', o.nsp == null ? 0.1 : o.nsp, o.ncase || 'upper');
    if (g.inst && o.iy != null) g.tx('inst', g.inst, cx, o.iy, o.isize || H * 0.02, mw, o.ifont || o.nfont, o.icol || o.ncol, '400', 'center', 0.08, 'upper');
  }

  var KG = ['kindergarten'], P4 = ['grade4'], G9 = ['grade9'], HI = ['grade11', 'university'], SCH = ['grade9', 'grade11', 'university'];
  var V = [
    {
      id: 'classic', name: 'Класика з фото', note: 'Фото зверху, великий рік під ним', cats: null, photo: true, builtin: true
    },
    {
      id: 'frame', name: 'Рамка з фото', note: 'Тонка подвійна рамка, фото по центру, ледь помітний напис «Випуск»', cats: null, photo: true, pr: { top: 0.2, h: 0.5, asp: 0.85 }, bg: '#fbf9f5',
      deco: function (g) { var c = g.ctx, a = g.sb * 0.7; frame(c, g.x0 + a, a, g.x1 - g.x0 - 2 * a, g.H - 2 * a, '#b9ad98', 0.35); frame(c, g.x0 + a + 2, a + 2, g.x1 - g.x0 - 2 * a - 4, g.H - 2 * a - 4, '#d6cdbb', 0.25); },
      text: function (g) { std(g, { title: g.t('Випуск'), ty: g.H * 0.135, tsize: g.H * 0.05, tfont: 'Cormorant Garamond', tcol: '#6d6454', tw8: '700', tsp: 0.3, tcase: 'upper', yy: g.H * 0.8, ysize: g.H * 0.075, yfont: 'Cormorant Garamond', ycol: '#8c8372', ny: g.H * 0.865, ncol: '#6d6454', nfont: 'Cormorant Garamond', iy: g.H * 0.9, icol: '#9a917f' }); }
    },
    {
      id: 'grad-photo', name: 'Graduation з фото', note: 'Темно-синій фон, золоті лінії, англійський напис', cats: SCH, photo: true, pr: { top: 0.2, h: 0.5, asp: 0.85 }, bg: ['#14213d', '#0d1530'],
      deco: function (g) { var c = g.ctx, a = g.sb * 0.7; frame(c, g.x0 + a, a, g.x1 - g.x0 - 2 * a, g.H - 2 * a, '#c9a45c', 0.4); var pw = g.H * 0.5 * 0.85, ph = g.H * 0.5; frame(c, g.cx - pw / 2 - 1.8, g.H * 0.2 - 1.8, pw + 3.6, ph + 3.6, '#c9a45c', 0.35); },
      text: function (g) { std(g, { title: g.t('Graduation'), ty: g.H * 0.135, tsize: g.H * 0.062, tfont: 'Playfair Display', tcol: '#e3c987', tsp: 0.14, tcase: 'upper', yy: g.H * 0.815, ysize: g.H * 0.07, yfont: 'Playfair Display', ycol: '#c9a45c', ny: g.H * 0.875, nsize: g.H * 0.03, ncol: '#f1e6c8', nfont: 'Montserrat', iy: g.H * 0.91, icol: '#a9b0c6' }); }
    },
    {
      id: 'kg-sun', name: 'Сонечко з фото', note: 'Для садочка: сонце, хмаринки й веселий напис', cats: KG, photo: true, pr: { top: 0.24, h: 0.46, asp: 0.85 }, bg: ['#fff4cf', '#fffaf0'],
      deco: function (g) {
        var c = g.ctx, sx = g.x1 - g.H * 0.16, sy = g.H * 0.17;
        for (var i = 0; i < 14; i++) { var a = i * Math.PI / 7; line(c, sx + Math.cos(a) * g.H * 0.085, sy + Math.sin(a) * g.H * 0.085, sx + Math.cos(a) * g.H * 0.12, sy + Math.sin(a) * g.H * 0.12, '#f4b73c', 1.2); }
        circle(c, sx, sy, g.H * 0.07, '#ffd35c'); fillWave(c, g.bx0, g.bx1, g.H * 0.93, 1.6, 40, 0, '#bfe3a1', g.H + 1); fillWave(c, g.bx0, g.bx1, g.H * 0.96, 1.4, 30, 1.5, '#9ed17c', g.H + 1);
        [[g.x0 + g.H * 0.12, g.H * 0.2], [g.x0 + g.H * 0.2, g.H * 0.15]].forEach(function (p, i) { circle(c, p[0], p[1], g.H * (0.035 - i * 0.008), '#ffffff'); circle(c, p[0] + g.H * 0.03, p[1] + 1, g.H * 0.028, '#ffffff'); });
      },
      text: function (g) { std(g, { title: g.t('Прощавай, садочку!'), ty: g.H * 0.17, tsize: g.H * 0.06, tfont: 'Pangolin', tcol: '#e07a1f', tsp: 0.01, tcase: 'as', yy: g.H * 0.8, ysize: g.H * 0.06, yfont: 'Pangolin', ycol: '#e07a1f', ny: g.H * 0.855, nsize: g.H * 0.034, ncol: '#6a4b1d', nfont: 'Pangolin', iy: g.H * 0.89, icol: '#8c6a3a' }); }
    },
    {
      id: 'kg-confetti', name: 'Конфетті', note: 'Садочок без фото: кольорові фігурки та рукописний заголовок', cats: KG, photo: false, bg: '#fffdf8',
      deco: function (g) {
        var c = g.ctx, r = rnd(7), cols = ['#ff8a80', '#ffd54f', '#81c784', '#64b5f6', '#ba68c8', '#ffb74d'];
        for (var i = 0; i < 70; i++) { var x = g.bx0 + r() * (g.bx1 - g.bx0), y = r() * g.H, s = 1.5 + r() * 3.2, col = cols[i % cols.length]; if (Math.abs(x - g.cx) < g.H * 0.28 && y > g.H * 0.22 && y < g.H * 0.8 && x > g.W / 2) continue; var k = i % 3; if (k === 0) circle(c, x, y, s, col); else if (k === 1) star(c, x, y, s * 1.3, col, r() * 6); else tri(c, x, y, s * 1.3, col, r() * 6); }
      },
      text: function (g) { std(g, { title: g.t('Мій садочок'), ty: g.H * 0.42, tsize: g.H * 0.095, tfont: 'Pangolin', tcol: '#ef6c57', tsp: 0.01, tcase: 'as', sub: g.t2('випуск'), sy: g.H * 0.49, sfont: 'Pangolin', scol: '#6a8f4f', ssize: g.H * 0.036, ssp: 0.3, yy: g.H * 0.62, ysize: g.H * 0.1, yfont: 'Pangolin', ycol: '#f5a623', ny: g.H * 0.72, nfont: 'Pangolin', ncol: '#5a5a5a', nsize: g.H * 0.04, ncase: 'as', iy: g.H * 0.78, icol: '#8a8a8a' }); }
    },
    {
      id: 'kg-stars', name: 'Зірочки', note: 'Садочок без фото: нічне небо, місяць і зірки', cats: KG, photo: false, bg: ['#25356b', '#3f5aa6'],
      deco: function (g) {
        var c = g.ctx, r = rnd(11);
        for (var i = 0; i < 60; i++) { var x = g.bx0 + r() * (g.bx1 - g.bx0), y = r() * g.H * 0.95, s = 0.5 + r() * 2.4; if (i % 4 === 0) star(c, x, y, s * 1.6, '#ffe58f', r() * 3); else circle(c, x, y, s * 0.4, 'rgba(255,255,255,.8)'); }
        var mx = g.cx, my = g.H * 0.22, mr = g.H * 0.09; var mx = g.cx, my = g.H * 0.22, mr = g.H * 0.09;
        circle(c, mx, my, mr * 1.7, 'rgba(255,243,196,.10)'); circle(c, mx, my, mr * 1.35, 'rgba(255,243,196,.14)');
        c.save(); c.beginPath(); c.arc(mx, my, mr, 0, Math.PI * 2); c.clip(); c.beginPath(); c.rect(mx - mr * 2, my - mr * 2, mr * 4, mr * 4); c.arc(mx + mr * 0.5, my - mr * 0.18, mr * 0.82, 0, Math.PI * 2); c.fillStyle = '#fff3c4'; c.fill('evenodd'); c.restore();
      },
      text: function (g) { std(g, { title: g.t('Добраніч, садочку'), ty: g.H * 0.49, tsize: g.H * 0.07, tfont: 'Marck Script', tcol: '#fff3c4', tsp: 0.02, tcase: 'as', sub: g.t2('випуск'), sy: g.H * 0.55, scol: '#c8d4ff', sfont: 'Montserrat', ssize: g.H * 0.03, yy: g.H * 0.68, ysize: g.H * 0.09, yfont: 'Comfortaa', ycol: '#ffe58f', ny: g.H * 0.78, nfont: 'Comfortaa', ncol: '#ffffff', nsize: g.H * 0.036, iy: g.H * 0.83, icol: '#c8d4ff' }); }
    },
    {
      id: 'p-pencils', name: 'Олівці', note: '4 клас без фото: кольорові олівці внизу, прощання з початковою школою', cats: P4, photo: false, bg: '#fffaf0',
      deco: function (g) {
        var c = g.ctx, cols = ['#ef5350', '#ff9800', '#fdd835', '#66bb6a', '#29b6f6', '#7e57c2'], n = 12, x0 = g.bx0, w = (g.bx1 - g.bx0) / n, y0 = g.H * 0.8;
        for (var i = 0; i < n; i++) { var x = x0 + i * w, col = cols[i % cols.length], h = g.H - y0 + (i % 3) * 3; c.fillStyle = col; c.fillRect(x + 0.4, y0 + (i % 3) * 2, w - 0.8, h); c.beginPath(); c.moveTo(x + 0.4, y0 + (i % 3) * 2); c.lineTo(x + w / 2, y0 - 7 + (i % 3) * 2); c.lineTo(x + w - 0.4, y0 + (i % 3) * 2); c.closePath(); c.fillStyle = '#f3d7ae'; c.fill(); c.beginPath(); c.moveTo(x + w * 0.38, y0 - 3 + (i % 3) * 2); c.lineTo(x + w / 2, y0 - 7 + (i % 3) * 2); c.lineTo(x + w * 0.62, y0 - 3 + (i % 3) * 2); c.closePath(); c.fillStyle = col; c.fill(); }
        for (var k = 0; k < 18; k++) { var r = rnd(k + 3); circle(c, g.bx0 + r() * (g.bx1 - g.bx0), r() * g.H * 0.7, 1 + r() * 1.5, cols[k % 6] + '88'); }
      },
      text: function (g) { std(g, { title: g.t('Прощавай, початкова школо!'), ty: g.H * 0.3, tsize: g.H * 0.07, tfont: 'Neucha', tcol: '#e5573d', tw: 1, tsp: 0.01, tcase: 'as', yy: g.H * 0.5, ysize: g.H * 0.1, yfont: 'Neucha', ycol: '#3d7ea6', ny: g.H * 0.6, nfont: 'Neucha', ncol: '#4a4a4a', nsize: g.H * 0.04, ncase: 'as', iy: g.H * 0.66, icol: '#8a8a8a' }); }
    },
    {
      id: 'p-bubbles', name: 'Бульбашки', note: '4 клас без фото: прозорі кольорові кола, велика цифра класу', cats: P4, photo: false, bg: ['#f2fbff', '#e6f4ff'],
      deco: function (g) {
        var c = g.ctx, r = rnd(5), cols = ['rgba(255,138,128,.28)', 'rgba(255,213,79,.32)', 'rgba(129,199,132,.3)', 'rgba(100,181,246,.3)', 'rgba(186,104,200,.25)'];
        for (var i = 0; i < 26; i++) { var rad = 4 + r() * 16; circle(c, g.bx0 + r() * (g.bx1 - g.bx0), r() * g.H, rad, cols[i % 5], 'rgba(255,255,255,.7)', 0.5); }
      },
      text: function (g) { std(g, { title: '4', ty: g.H * 0.5, tsize: g.H * 0.42, tfont: 'Rubik Bubbles', tcol: '#4a90c2', tw: 0.5, tsp: 0, tcase: 'as', sub: g.t2('клас'), sy: g.H * 0.6, sfont: 'Comfortaa', scol: '#4a90c2', ssize: g.H * 0.05, ssp: 0.4, yy: g.H * 0.72, ysize: g.H * 0.06, yfont: 'Comfortaa', ycol: '#8a7a4a', ny: g.H * 0.8, nfont: 'Comfortaa', ncol: '#4a4a4a', nsize: g.H * 0.034, iy: g.H * 0.85, icol: '#7a8a9a' }); }
    },
    {
      id: 'g9-geo', name: 'Геометрія', note: '9 клас без фото: графічні лінії та трикутники на глибокому зеленому', cats: G9, photo: false, bg: '#16413a',
      deco: function (g) {
        var c = g.ctx, x0 = g.W / 2, i;
        c.save(); c.beginPath(); c.rect(g.bx0, 0, g.bx1 - g.bx0, g.H); c.clip();
        for (i = 0; i < 9; i++) line(c, g.bx0 + i * 30 - 20, g.H, g.bx0 + i * 30 + g.H * 0.6, 0, 'rgba(255,255,255,.06)', 5);
        tri(c, g.x1 - g.H * 0.18, g.H * 0.2, g.H * 0.2, 'rgba(240,200,110,.9)', -Math.PI / 2); tri(c, g.x1 - g.H * 0.08, g.H * 0.26, g.H * 0.13, 'rgba(240,200,110,.4)', Math.PI / 6);
        frame(c, g.x0 + g.sb * 0.6, g.sb * 0.6, g.x1 - g.x0 - g.sb * 1.2, g.H - g.sb * 1.2, 'rgba(240,200,110,.7)', 0.35);
        for (i = 0; i < 6; i++) circle(c, g.x0 + g.sb * 1.3 + i * 4.5, g.H * 0.92, 0.8, 'rgba(240,200,110,.8)');
        c.restore();
      },
      text: function (g) { std(g, { title: '9', ty: g.H * 0.5, tsize: g.H * 0.4, tfont: 'Oswald', tcol: '#f0c86e', tw: 0.6, tw8: '700', tsp: 0, tcase: 'as', sub: g.t2('клас · випуск'), sy: g.H * 0.58, sfont: 'Montserrat', scol: '#cfe6dc', ssize: g.H * 0.036, ssp: 0.3, yy: g.H * 0.7, ysize: g.H * 0.07, yfont: 'Oswald', ycol: '#f0c86e', ny: g.H * 0.8, nfont: 'Montserrat', ncol: '#ffffff', nsize: g.H * 0.032, iy: g.H * 0.85, icol: '#9fc2b4' }); }
    },
    {
      id: 'g9-wave', name: 'Хвилі', note: '9 клас без фото: плавні хвилі від бірюзового до синього', cats: G9, photo: false, bg: ['#eaf6fa', '#d4ecf5'],
      deco: function (g) {
        var c = g.ctx, cols = ['rgba(95,170,200,.35)', 'rgba(60,130,180,.45)', 'rgba(35,95,150,.65)', 'rgba(20,60,110,.9)'];
        cols.forEach(function (col, i) { fillWave(c, g.bx0, g.bx1, g.H * (0.74 + i * 0.065), 3 + i, 60 - i * 6, i * 1.3, col, g.H); });
      },
      text: function (g) { std(g, { title: g.t('Випуск'), ty: g.H * 0.3, tsize: g.H * 0.08, tfont: 'Raleway', tcol: '#1f4f78', tw8: '700', tsp: 0.32, tcase: 'upper', sub: g.t2('9 клас'), sy: g.H * 0.37, sfont: 'Raleway', scol: '#4a86ab', ssize: g.H * 0.036, yy: g.H * 0.54, ysize: g.H * 0.15, yfont: 'Raleway', ycol: '#3a7ea6', y8: '700', ysp: 0.04, ny: g.H * 0.62, nfont: 'Raleway', ncol: '#1f4f78', nsize: g.H * 0.032, iy: g.H * 0.66, icol: '#5a8aa8' }); }
    },
    {
      id: 'g11-gold', name: 'Graduation Gold', note: '11 клас та виші без фото: темно-синій фон, золота рамка, великий «Graduation»', cats: HI, photo: false, bg: ['#14213d', '#0b1226'],
      deco: function (g) {
        var c = g.ctx, a = g.sb * 0.7, x = g.x0 + a, w = g.x1 - g.x0 - 2 * a;
        frame(c, x, a, w, g.H - 2 * a, '#c9a45c', 0.45); frame(c, x + 2, a + 2, w - 4, g.H - 2 * a - 4, '#8f7440', 0.25);
        [[x, a], [x + w, a], [x, g.H - a], [x + w, g.H - a]].forEach(function (p) { circle(c, p[0], p[1], 1.6, '#c9a45c'); });
        line(c, g.cx - 22, g.H * 0.6, g.cx + 22, g.H * 0.6, '#c9a45c', 0.4); star(c, g.cx, g.H * 0.6, 2.2, '#c9a45c');
      },
      text: function (g) { std(g, { title: g.t('Graduation'), ty: g.H * 0.4, tsize: g.H * 0.095, tfont: 'Playfair Display', tcol: '#e3c987', tsp: 0.12, tcase: 'upper', sub: g.t2('class of'), sy: g.H * 0.3, sfont: 'Cormorant Garamond', scol: '#c9a45c', ssize: g.H * 0.035, ssp: 0.4, yy: g.H * 0.55, ysize: g.H * 0.11, yfont: 'Playfair Display', ycol: '#c9a45c', ny: g.H * 0.72, nfont: 'Montserrat', ncol: '#f1e6c8', nsize: g.H * 0.032, iy: g.H * 0.77, icol: '#a9b0c6' }); }
    },
    {
      id: 'g11-class', name: 'Graduate мінімал', note: '11 клас та виші без фото: світлий мінімалізм, великий рік контуром', cats: HI, photo: false, bg: '#f7f5f2',
      deco: function (g) { var c = g.ctx; line(c, g.cx - 30, g.H * 0.31, g.cx + 30, g.H * 0.31, '#1e1e1e', 0.5); line(c, g.cx - 30, g.H * 0.72, g.cx + 30, g.H * 0.72, '#1e1e1e', 0.5); },
      text: function (g) { std(g, { title: g.t('Graduate'), ty: g.H * 0.45, tsize: g.H * 0.11, tfont: 'Montserrat', tcol: '#1e1e1e', tw8: '700', tsp: 0.12, tcase: 'upper', sub: g.t2('class of'), sy: g.H * 0.28, sfont: 'Montserrat', scol: '#7d7d7d', ssize: g.H * 0.025, ssp: 0.5, yy: g.H * 0.6, ysize: g.H * 0.12, yfont: 'Montserrat', ycol: '#bdb8b0', y8: '700', ysp: 0.05, ny: g.H * 0.8, nfont: 'Montserrat', ncol: '#1e1e1e', nsize: g.H * 0.028, nsp: 0.2, iy: g.H * 0.85, icol: '#8d8d8d' }); }
    },
    {
      id: 'u-alumni', name: 'Alumni', note: 'Виші без фото: бордовий фон, коло-герб та тонкі лінії', cats: ['university'], photo: false, bg: ['#5a1a2b', '#3d0f1d'],
      deco: function (g) {
        var c = g.ctx, r = g.H * 0.17, y = g.H * 0.3; circle(c, g.cx, y, r, null, '#d9b98a', 0.5); circle(c, g.cx, y, r * 0.86, null, '#d9b98a', 0.25);
        for (var i = 0; i < 24; i++) { var a = i * Math.PI / 12; line(c, g.cx + Math.cos(a) * r * 0.86, y + Math.sin(a) * r * 0.86, g.cx + Math.cos(a) * r, y + Math.sin(a) * r, '#d9b98a', 0.25); }
        star(c, g.cx, y, r * 0.35, '#d9b98a'); line(c, g.cx - 25, g.H * 0.66, g.cx + 25, g.H * 0.66, '#d9b98a', 0.3);
      },
      text: function (g) { std(g, { title: g.t('Alumni'), ty: g.H * 0.6, tsize: g.H * 0.085, tfont: 'Cormorant Garamond', tcol: '#f2e3c6', tw8: '700', tsp: 0.2, tcase: 'upper', yy: g.H * 0.775, ysize: g.H * 0.065, yfont: 'Cormorant Garamond', ycol: '#d9b98a', y8: '700', ny: g.H * 0.855, nfont: 'Montserrat', ncol: '#f2e3c6', nsize: g.H * 0.028, iy: g.H * 0.9, icol: '#c7a5a0' }); }
    },
    {
      id: 'abstract', name: 'Абстракція', note: 'Універсальна, без фото: накладені напівпрозорі форми та елегантний шрифт', cats: null, photo: false, bg: '#fbf7f2',
      deco: function (g) {
        var c = g.ctx, cx = g.cx, cols = ['rgba(233,150,122,.5)', 'rgba(232,193,112,.5)', 'rgba(138,176,171,.5)', 'rgba(150,140,190,.4)'];
        c.save(); c.beginPath(); c.rect(g.bx0, 0, g.bx1 - g.bx0, g.H); c.clip();
        circle(c, cx - g.H * 0.18, g.H * 0.2, g.H * 0.22, cols[0]); circle(c, cx + g.H * 0.05, g.H * 0.16, g.H * 0.17, cols[1]); circle(c, cx + g.H * 0.2, g.H * 0.3, g.H * 0.2, cols[2]); circle(c, g.W * 0.25, g.H * 0.9, g.H * 0.26, cols[3]); circle(c, g.W * 0.12, g.H * 0.6, g.H * 0.13, cols[0]);
        c.restore();
      },
      text: function (g) { std(g, { title: g.t('Випускний альбом'), ty: g.H * 0.62, tsize: g.H * 0.07, tfont: 'Playfair Display', tcol: '#3d3a38', tsp: 0.02, tcase: 'as', yy: g.H * 0.72, ysize: g.H * 0.06, yfont: 'Playfair Display', ycol: '#c27a5f', ny: g.H * 0.83, nfont: 'Montserrat', ncol: '#3d3a38', nsize: g.H * 0.028, nsp: 0.2, iy: g.H * 0.87, icol: '#8d8680' }); }
    },
    {
      id: 'botanic', name: 'Гілочки', note: 'Універсальна, без фото: листя оливкової гілочки та каліграфічний заголовок', cats: null, photo: false, bg: '#ffffff',
      deco: function (g) {
        var c = g.ctx, cx = g.cx; sprig(c, cx - g.H * 0.28, g.H * 0.62, g.H * 0.3, -Math.PI * 0.08, '#8aa17a', 9); sprig(c, cx + g.H * 0.28, g.H * 0.62, g.H * 0.3, Math.PI * 1.08, '#8aa17a', 9);
        sprig(c, g.W * 0.2, g.H * 0.92, g.H * 0.45, -Math.PI * 0.4, '#c9d6bf', 10); sprig(c, g.W * 0.3, g.H * 0.95, g.H * 0.3, -Math.PI * 0.5, '#dfe7d8', 8);
      },
      text: function (g) { std(g, { title: g.t('Випускний альбом'), ty: g.H * 0.34, tsize: g.H * 0.075, tfont: 'Marck Script', tcol: '#4d6340', tsp: 0.02, tcase: 'as', yy: g.H * 0.48, ysize: g.H * 0.055, yfont: 'Cormorant Garamond', ycol: '#8aa17a', y8: '700', ysp: 0.2, ny: g.H * 0.75, nfont: 'Cormorant Garamond', ncol: '#4d6340', nsize: g.H * 0.034, nsp: 0.16, iy: g.H * 0.8, icol: '#8d9a85' }); }
    },
    {
      id: 'lines', name: 'Лінії', note: 'Універсальна, без фото: тонкі діагоналі та великий рік', cats: null, photo: false, bg: '#f4f4f2',
      deco: function (g) {
        var c = g.ctx; c.save(); c.beginPath(); c.rect(g.bx0, 0, g.bx1 - g.bx0, g.H); c.clip();
        for (var i = -10; i < 40; i++) line(c, g.bx0 + i * 6, g.H, g.bx0 + i * 6 + g.H, 0, 'rgba(0,0,0,.055)', 0.25);
        c.restore(); c.fillStyle = '#f4f4f2'; var bw = (g.x1 - g.x0) * 0.62, bh = g.H * 0.48; c.fillRect(g.cx - bw / 2, g.H * 0.26, bw, bh); frame(c, g.cx - bw / 2, g.H * 0.26, bw, bh, '#2b2b2b', 0.4);
      },
      text: function (g) { std(g, { title: g.t('Випуск'), ty: g.H * 0.37, tsize: g.H * 0.065, tfont: 'Tenor Sans', tcol: '#2b2b2b', tsp: 0.3, tcase: 'upper', yy: g.H * 0.55, ysize: g.H * 0.12, yfont: 'Tenor Sans', ycol: '#2b2b2b', ysp: 0.06, ny: g.H * 0.64, nfont: 'Tenor Sans', ncol: '#2b2b2b', nsize: g.H * 0.026, nsp: 0.22, iy: g.H * 0.68, icol: '#777777' }); }
    }
    ,{
      id: 'arch', name: 'Бохо-арка', note: 'Фото в формі арки, гілочки злегка заходять на краї', cats: null, photo: true, shape: 'arch', pr: { top: 0.05, h: 0.74, asp: 0.76 }, bg: '#f3ece1',
      deco: function (g) { outline(g.ctx, g.ph, 'arch', 2.6, '#d8c3a5', 0.5); outline(g.ctx, g.ph, 'arch', 5.2, '#c9aa86', 0.4); },
      over: function (g) {
        var c = g.ctx, p = g.ph; sprig(c, p.x - 2, p.y + p.h * 0.97, g.H * 0.26, -Math.PI * 0.42, '#8f9a78', 8); sprig(c, p.x + p.w + 2, p.y + p.h * 0.97, g.H * 0.26, -Math.PI * 0.58, '#a7b08e', 8);
        flower(c, p.x + 3, p.y + p.h * 0.93, 5, '#e9b8a4', '#c98467', 6, 0.2); flower(c, p.x + p.w - 2, p.y + p.h * 0.95, 4, '#f1d29a', '#c98467', 5, 0.7);
      },
      text: function (g) { std(g, { title: g.t('Наш випуск'), ty: g.H * 0.855, tsize: g.H * 0.05, tfont: 'Marck Script', tcol: '#7a5b3d', tsp: 0.02, tcase: 'as', yy: g.H * 0.9, ysize: g.H * 0.034, yfont: 'Cormorant Garamond', ycol: '#a07c58', y8: '700', ysp: 0.3, ny: g.H * 0.94, nsize: g.H * 0.022, ncol: '#7a5b3d', nfont: 'Cormorant Garamond', iy: g.H * 0.962, icol: '#a08c76' }); }
    }
    ,{
      id: 'oval-flowers', name: 'Овал і квіти', note: 'Овальне фото, акварельні квіти заходять на краї', cats: null, photo: true, shape: 'oval', pr: { top: 0.1, h: 0.6, asp: 0.8 }, bg: ['#fff9f3', '#fdeff0'],
      deco: function (g) { wash(g.ctx, g.cx - 30, g.H * 0.2, 80, '255,200,200', 0.35); wash(g.ctx, g.cx + 40, g.H * 0.75, 80, '200,230,200', 0.4); outline(g.ctx, g.ph, 'oval', 2.4, '#e5b8b8', 0.5); },
      over: function (g) { var p = g.ph, pal = ['#ef9aa6', '#f7c873', '#b5483f', '#6fae6b', '#4f8f57']; bouquet(g.ctx, p.x + 1, p.y + p.h * 0.88, g.H * 0.11, -0.4, pal); bouquet(g.ctx, p.x + p.w - 1, p.y + p.h * 0.1, g.H * 0.09, 2.6, pal); },
      text: function (g) { std(g, { title: g.t('Мої спогади'), ty: g.H * 0.82, tsize: g.H * 0.06, tfont: 'Bad Script', tcol: '#8a4a55', tsp: 0.02, tcase: 'as', yy: g.H * 0.88, ysize: g.H * 0.04, yfont: 'Cormorant Garamond', ycol: '#b0707a', y8: '700', ysp: 0.3, ny: g.H * 0.93, nsize: g.H * 0.026, ncol: '#8a4a55', nfont: 'Cormorant Garamond' }); }
    }
    ,{
      id: 'circle-sun', name: 'Коло й сонце', note: 'Кругле фото з сонячними променями та хмаринкою', cats: ['kindergarten', 'grade4'], photo: true, shape: 'circle', pr: { top: 0.14, h: 0.52, asp: 1 }, bg: ['#dff2ff', '#f6fbff'],
      deco: function (g) { var c = g.ctx, p = g.ph, cx = p.x + p.w / 2, cy = p.y + p.h / 2, R = p.w / 2; for (var i = 0; i < 24; i++) { var a = i * Math.PI / 12; line(c, cx + Math.cos(a) * (R + 4), cy + Math.sin(a) * (R + 4), cx + Math.cos(a) * (R + (i % 2 ? 9 : 14)), cy + Math.sin(a) * (R + (i % 2 ? 9 : 14)), '#f7b733', 1.1); } outline(c, p, 'circle', 2, '#ffd35c', 2); },
      over: function (g) { var c = g.ctx, p = g.ph, x = p.x + 4, y = p.y + p.h * 0.85; [[0, 0, 7], [8, -2, 6], [-8, 1, 5], [3, -5, 5]].forEach(function (q) { circle(c, x + q[0], y + q[1], q[2], '#ffffff'); }); },
      text: function (g) { std(g, { title: g.t('Наш випускний'), ty: g.H * 0.8, tsize: g.H * 0.06, tfont: 'Pangolin', tcol: '#e07a1f', tsp: 0.01, tcase: 'as', yy: g.H * 0.87, ysize: g.H * 0.06, yfont: 'Pangolin', ycol: '#3d7ea6', ny: g.H * 0.925, nsize: g.H * 0.03, ncol: '#4a4a4a', nfont: 'Pangolin', ncase: 'as' }); }
    }
    ,{
      id: 'diamond', name: 'Ромб', note: 'Фото в ромбі з тонкими подвійними лініями', cats: SCH, photo: true, shape: 'diamond', pr: { top: 0.1, h: 0.62, asp: 0.9 }, bg: '#f5f2ec',
      deco: function (g) { var c = g.ctx; outline(c, g.ph, 'diamond', 3, '#1e1e1e', 0.5); outline(c, g.ph, 'diamond', 6, '#b59a64', 0.3); },
      over: function (g) { var c = g.ctx, p = g.ph; star(c, p.x + p.w / 2, p.y - 6.5, 2.4, '#b59a64'); star(c, p.x + p.w / 2, p.y + p.h + 6.5, 2.4, '#b59a64'); },
      text: function (g) { std(g, { title: g.t('Випуск'), ty: g.H * 0.84, tsize: g.H * 0.05, tfont: 'Tenor Sans', tcol: '#1e1e1e', tsp: 0.3, tcase: 'upper', yy: g.H * 0.9, ysize: g.H * 0.04, yfont: 'Tenor Sans', ycol: '#8c7a54', ysp: 0.3, ny: g.H * 0.94, nsize: g.H * 0.022, ncol: '#1e1e1e', nfont: 'Tenor Sans', nsp: 0.22 }); }
    }
    ,{
      id: 'hexagon', name: 'Шестикутник неон', note: 'Фото в шестикутнику, неонові лінії на темно-фіолетовому', cats: SCH.concat(P4), photo: true, shape: 'hex', pr: { top: 0.1, h: 0.6, asp: 0.87 }, bg: ['#1b1035', '#0e0820'],
      deco: function (g) { var c = g.ctx; spray(c, g.cx, g.H * 0.4, g.H * 0.3, g.H * 0.55, 70, ['rgba(255,80,200,.5)', 'rgba(80,220,255,.5)', 'rgba(255,255,255,.4)'], 21, 0.9); outline(c, g.ph, 'hex', 3, 'rgba(255,60,190,.45)', 2.4); outline(c, g.ph, 'hex', 3, '#ff4fc3', 0.6); outline(c, g.ph, 'hex', 7, '#4fe3ff', 0.5); },
      text: function (g) { std(g, { title: g.t('Graduation'), ty: g.H * 0.84, tsize: g.H * 0.05, tfont: 'Unbounded', tcol: '#ffffff', tsp: 0.14, tcase: 'upper', yy: g.H * 0.9, ysize: g.H * 0.05, yfont: 'Unbounded', ycol: '#4fe3ff', ny: g.H * 0.945, nsize: g.H * 0.024, ncol: '#ff9be0', nfont: 'Montserrat', nsp: 0.2 }); }
    }
    ,{
      id: 'heart', name: 'Сердечко', note: 'Фото в сердечку, рожеві сердечка навколо', cats: ['kindergarten', 'grade4'], photo: true, shape: 'heart', pr: { top: 0.12, h: 0.52, asp: 1 }, bg: ['#fff0f4', '#ffe3ec'],
      deco: function (g) { var c = g.ctx, r = rnd(4), i; for (i = 0; i < 22; i++) { var x = g.x0 + 8 + r() * (g.x1 - g.x0 - 16), y = r() * g.H, s = 4 + r() * 9; shapePath(c, { x: x, y: y, w: s, h: s }, 'heart'); c.fillStyle = ['rgba(255,150,180,.35)', 'rgba(255,200,215,.5)', 'rgba(250,120,150,.25)'][i % 3]; c.fill(); } outline(c, g.ph, 'heart', 2, '#f48fb1', 1.6); },
      text: function (g) { std(g, { title: g.t('Наш садочок'), ty: g.H * 0.78, tsize: g.H * 0.075, tfont: 'Marck Script', tcol: '#c2185b', tsp: 0.02, tcase: 'as', yy: g.H * 0.86, ysize: g.H * 0.05, yfont: 'Comfortaa', ycol: '#e57399', ny: g.H * 0.92, nsize: g.H * 0.028, ncol: '#8a3a56', nfont: 'Comfortaa', ncase: 'as' }); }
    }
    ,{
      id: 'watercolor', name: 'Акварель з квітами', note: 'Без фото: акварельні плями й квіти по кутах, тонкі лінії та рукописний заголовок', cats: null, photo: false, bg: '#fffefb',
      deco: function (g) {
        var c = g.ctx, pal = ['#ef8f9c', '#f6c56f', '#b5483f', '#5fa35f', '#7fbf6e'], W = g.W, H = g.H;
        wash(c, W * 0.1, H * 0.15, 90, '255,214,150', 0.5); wash(c, W * 0.38, H * 0.35, 80, '190,235,200', 0.45); wash(c, W * 0.7, H * 0.1, 90, '255,200,205', 0.4); wash(c, W * 0.9, H * 0.6, 90, '200,230,190', 0.45); wash(c, W * 0.25, H * 0.9, 90, '255,225,170', 0.5); wash(c, W * 0.8, H * 0.95, 80, '255,200,205', 0.4);
        bouquet(c, g.x0 + 20, 14, H * 0.14, 0.9, pal); bouquet(c, g.x1 - 20, 14, H * 0.14, 2.2, pal); bouquet(c, g.x0 + 20, H - 14, H * 0.14, -0.9, pal); bouquet(c, g.x1 - 20, H - 14, H * 0.14, -2.2, pal);
        bouquet(c, 22, H - 16, H * 0.12, -0.8, pal); bouquet(c, 20, 18, H * 0.1, 0.7, pal);
        line(c, g.cx - 38, H * 0.37, g.cx + 38, H * 0.37, '#b9b0a3', 0.3); line(c, g.cx - 38, H * 0.66, g.cx + 38, H * 0.66, '#b9b0a3', 0.3);
      },
      text: function (g) { std(g, { title: g.t('Наш випуск'), ty: g.H * 0.55, tsize: g.H * 0.095, tfont: 'Marck Script', tcol: '#4d4a46', tsp: 0.02, tcase: 'as', sub: g.t2('спогади дитинства'), sy: g.H * 0.345, sfont: 'Cormorant Garamond', scol: '#8a847b', ssize: g.H * 0.026, ssp: 0.3, yy: g.H * 0.72, ysize: g.H * 0.034, yfont: 'Cormorant Garamond', ycol: '#8a847b', ysp: 0.3, ny: g.H * 0.78, nfont: 'Cormorant Garamond', ncol: '#4d4a46', nsize: g.H * 0.026, nsp: 0.2, iy: g.H * 0.81, icol: '#9a948b' }); }
    }
    ,{
      id: 'black-gold', name: 'Чорне золото', note: 'Без фото: чорний фон, золоті діагоналі й пил, рік у рамці', cats: SCH, photo: false, bg: '#0e0e0f',
      deco: function (g) {
        var c = g.ctx, H = g.H, x1 = g.W, gold = c.createLinearGradient(0, 0, 80, 80); gold.addColorStop(0, '#7a5a1c'); gold.addColorStop(0.5, '#f3d27a'); gold.addColorStop(1, '#a97c25');
        c.save(); c.beginPath(); c.rect(g.x0, 0, x1 - g.x0, H); c.clip();
        [[0, 6, 0.5], [12, 2, 0.9], [18, 1, 0.5]].forEach(function (b) { c.beginPath(); c.moveTo(x1 - 60 + b[0], 0); c.lineTo(x1 - 60 + b[0] + b[1], 0); c.lineTo(x1 + b[0] + b[1] - 8, 60); c.lineTo(x1 + b[0] - 8, 60); c.closePath(); c.fillStyle = gold; c.globalAlpha = b[2] + 0.1; c.fill(); });
        c.globalAlpha = 1;[[0, 6], [10, 3], [16, 1.2]].forEach(function (b) { c.beginPath(); c.moveTo(x1 - 70 + b[0], H); c.lineTo(x1 - 70 + b[0] + b[1], H); c.lineTo(x1 + 20 + b[0] + b[1], H - 80); c.lineTo(x1 + 20 + b[0], H - 80); c.closePath(); c.fillStyle = gold; c.fill(); });
        spray(c, g.x1 - 30, H * 0.45, 8, 60, 160, ['rgba(243,210,122,.8)', 'rgba(169,124,37,.7)', 'rgba(255,240,190,.6)'], 33, 0.8);
        c.restore(); line(c, g.x0 + 3, 0, g.x0 + 3, H, '#c9a45c', 0.8);
        var bw = (g.x1 - g.x0) * 0.5, bx = g.cx - bw / 2 + 4; frame(c, bx, H * 0.2, bw, bw * 1.18, '#e0bd6b', 0.7);
      },
      text: function (g) { var c = g.ctx, bw = (g.x1 - g.x0) * 0.5, bx = g.cx + 4, y0 = g.H * 0.2; if (g.year) { g.tx('year', g.year.slice(0, 2), bx, y0 + bw * 0.5, bw * 0.34, bw * 0.8, 'Oswald', '#f0cd78', '700', 'center', 0.02, 'as'); g.fx('year', g.year.slice(2), bx, y0 + bw * 0.92, bw * 0.34, bw * 0.8, 'Oswald', '#f0cd78', '700', 'center', 0.02, 'as'); }
        std(g, { title: g.t('Випускний альбом'), ty: y0 + bw * 1.08, tsize: g.H * 0.028, tfont: 'Montserrat', tcol: '#e0bd6b', tsp: 0.08, tcase: 'upper', ny: g.H * 0.82, nsize: g.H * 0.028, ncol: '#f4e6c4', nfont: 'Montserrat', nsp: 0.2, iy: g.H * 0.86, icol: '#c9a45c' }); }
    }
    ,{
      id: 'splash', name: 'Кольорові бризки', note: 'Без фото: яскраві бризки фарби та рік у рамці', cats: null, photo: false, bg: ['#fff6fb', '#fffdf4'],
      deco: function (g) {
        var c = g.ctx, W = g.W, H = g.H, bx = g.cx, by = H * 0.42;
        wash(c, W * 0.12, H * 0.2, 100, '255,170,230', 0.45); wash(c, W * 0.08, H * 0.85, 100, '255,215,120', 0.5); wash(c, W * 0.3, H * 0.5, 80, '200,170,255', 0.3);
        wash(c, bx, by, 95, '255,90,170', 0.55); wash(c, bx + 25, by + 15, 85, '110,120,255', 0.5); wash(c, bx - 25, by - 10, 80, '255,200,60', 0.5); wash(c, bx + 20, by - 30, 70, '70,210,200', 0.45);
        spray(c, bx, by, 45, 105, 140, ['#ff4fa3', '#ffc83d', '#4fc3f7', '#7c5cff', '#46d6a0'], 5, 1.4); spray(c, W * 0.12, H * 0.2, 5, 50, 50, ['#ff9fd6', '#ffd36e'], 8, 1.1);
        frame(c, bx - 33, by - 38, 66, 76, '#2b2b33', 0.7);
      },
      text: function (g) { var bx = g.cx, by = g.H * 0.42; if (g.year) { g.tx('year', g.year.slice(0, 2), bx - 14, by - 6, 24, 30, 'Montserrat', '#ffffff', '700', 'center', 0.02, 'as'); g.fx('year', g.year.slice(2), bx - 14, by + 19, 24, 30, 'Montserrat', '#ffffff', '700', 'center', 0.02, 'as'); }
        std(g, { title: g.inst || g.t('Назва закладу'), ty: by + 29, tsize: g.H * 0.02, tfont: 'Montserrat', tcol: '#ffffff', tsp: 0.08, tcase: 'upper', ny: g.H * 0.82, nsize: g.H * 0.028, ncol: '#3a3a44', nfont: 'Montserrat', nsp: 0.2 }); }
    }
    ,{
      id: 'big-year', name: 'Великий рік', note: 'Лише рік: величезні контурні цифри, мало тексту', cats: null, photo: false, bg: '#ffffff',
      text: function (g) { var c = g.ctx, y = g.year || ''; if (y) { c.save(); c.beginPath(); c.rect(g.x0, 0, g.W - g.x0, g.H); c.clip(); g.tx('year', y.slice(0, 2), g.cx + 18, g.H * 0.46, g.H * 0.5, g.H * 0.9, 'Montserrat', '#ddd8d4', '700', 'center', 0, 'as'); g.fx('year', y.slice(2), g.cx + 18, g.H * 0.95, g.H * 0.5, g.H * 0.9, 'Montserrat', '#ddd8d4', '700', 'center', 0, 'as'); c.restore(); }
        std(g, { title: g.t('Випускний альбом'), ty: g.H * 0.8, tsize: g.H * 0.022, tfont: 'Montserrat', tcol: '#7d7872', tsp: 0.16, tcase: 'upper', tw: 0.5, ny: g.H * 0.855, nsize: g.H * 0.02, ncol: '#7d7872', nfont: 'Montserrat', nsp: 0.2 }); }
    }
    ,{
      id: 'marble', name: 'Мармур', note: 'Без фото: світлий мармур із прожилками та золотим акцентом, вертикальний напис', cats: SCH, photo: false, bg: ['#f4f4f2', '#e7e7e5'],
      deco: function (g) {
        var c = g.ctx, r = rnd(17), i; c.save(); c.beginPath(); c.rect(g.bx0, 0, g.bx1 - g.bx0, g.H); c.clip();
        for (i = 0; i < 16; i++) { var x = r() * g.W, y = r() * g.H; c.beginPath(); c.moveTo(x, y); for (var k = 0; k < 5; k++) { x += (r() - 0.35) * 40; y += (r() - 0.5) * 40; c.quadraticCurveTo(x - 10 + r() * 20, y - 10 + r() * 20, x, y); } c.strokeStyle = 'rgba(90,95,105,' + (0.08 + r() * 0.2) + ')'; c.lineWidth = 0.2 + r() * 0.9; c.stroke(); }
        c.restore(); line(c, g.cx - 14, g.H * 0.25, g.cx - 14, g.H * 0.75, '#b8955a', 0.5);
      },
      text: function (g) { var c = g.ctx; if (g.year) { c.save(); c.translate(g.cx, g.H * 0.5); c.rotate(Math.PI / 2); g.fx('year', g.year, 0, 0, g.H * 0.12, g.H * 0.4, 'Cormorant Garamond', '#2f3036', '700', 'center', 0.08, 'as'); c.restore(); }
        std(g, { title: g.t('Випускний альбом'), ty: g.H * 0.84, tsize: g.H * 0.024, tfont: 'Cormorant Garamond', tcol: '#2f3036', tw8: '700', tsp: 0.2, tcase: 'upper', tw: 0.5, sub: g.t2('випускний клас'), sy: g.H * 0.88, sfont: 'Cormorant Garamond', scol: '#7a7c85', ssize: g.H * 0.018, ny: g.H * 0.2, nsize: g.H * 0.022, ncol: '#2f3036', nfont: 'Cormorant Garamond', nsp: 0.2 }); }
    }
    ,{
      id: 'doodles', name: 'Малюнки', note: 'Дитячі малюнки: кулька, сонце, веселка, ракета; весело й багато кольору', cats: ['kindergarten', 'grade4'], photo: false, bg: '#fbfaf7',
      deco: function (g) {
        var c = g.ctx, H = g.H, W = g.W, x = g.x0;
        circle(c, x + 40, H * 0.2, 12, '#ffd54f'); for (var i = 0; i < 12; i++) { var a = i * Math.PI / 6; line(c, x + 40 + Math.cos(a) * 15, H * 0.2 + Math.sin(a) * 15, x + 40 + Math.cos(a) * 20, H * 0.2 + Math.sin(a) * 20, '#ffb300', 1); }
        ['#ef5350', '#ff9800', '#fdd835', '#66bb6a', '#42a5f5'].forEach(function (col, k) { c.beginPath(); c.arc(g.x1 - 50, H * 0.78, 34 - k * 4, Math.PI, 0); c.strokeStyle = col; c.lineWidth = 3; c.stroke(); });
        [[g.x1 - 34, H * 0.2, '#ef5350'], [g.x1 - 70, H * 0.12, '#42a5f5'], [x + 70, H * 0.7, '#ab47bc']].forEach(function (b) { c.beginPath(); c.ellipse(b[0], b[1], 10, 12, 0, 0, Math.PI * 2); c.fillStyle = b[2]; c.fill(); line(c, b[0], b[1] + 12, b[0] - 2, b[1] + 32, '#777', 0.4); });
        [[x + 25, H * 0.82], [x + 85, H * 0.88], [g.x1 - 20, H * 0.45]].forEach(function (b) { circle(c, b[0], b[1], 7, '#e1f1fb'); circle(c, b[0] + 7, b[1] + 1, 6, '#e1f1fb'); circle(c, b[0] - 6, b[1] + 2, 5, '#e1f1fb'); });
        c.save(); c.translate(x + 30, H * 0.5); c.rotate(-0.4); c.beginPath(); c.moveTo(0, -18); c.quadraticCurveTo(8, -6, 6, 10); c.lineTo(-6, 10); c.quadraticCurveTo(-8, -6, 0, -18); c.fillStyle = '#e0e0e0'; c.fill(); tri(c, 0, -17, 5, '#ef5350', -Math.PI / 2); c.fillStyle = '#42a5f5'; c.fillRect(-2, -2, 4, 5); c.restore();
        star(c, g.x1 - 20, H * 0.6, 4, '#ffca28'); star(c, x + 60, H * 0.45, 3, '#ffca28'); star(c, x + 20, H * 0.15, 3, '#ef5350');
      },
      text: function (g) { std(g, { title: g.t('Мій дуже веселий садочок'), ty: g.H * 0.4, tsize: g.H * 0.055, tfont: 'Pangolin', tcol: '#e5573d', tw: 0.8, tsp: 0.01, tcase: 'as', yy: g.H * 0.55, ysize: g.H * 0.06, yfont: 'Pangolin', ycol: '#3d7ea6', ny: g.H * 0.62, nfont: 'Pangolin', ncol: '#4a4a4a', nsize: g.H * 0.034, ncase: 'as', iy: g.H * 0.67, icol: '#8a8a8a' }); }
    }
    ,{
      id: 'letters', name: 'Кольорові літери', note: 'Слово «ВИПУСК» великими різнокольоровими літерами, дитячий стиль', cats: ['kindergarten', 'grade4', 'grade9'], photo: false, bg: '#fdf7ec',
      deco: function (g) { var c = g.ctx, r = rnd(9); for (var i = 0; i < 26; i++) { var x = g.x0 + r() * (g.x1 - g.x0), y = r() * g.H, s = 1.5 + r() * 3; (i % 2 ? tri : function (cc, a, b, d, f) { circle(cc, a, b, d * 0.7, f); })(c, x, y, s, ['#ff8a80', '#ffd54f', '#81c784', '#64b5f6', '#ba68c8'][i % 5], r() * 6); } },
      text: function (g) {
        var c = g.ctx, letters = (g.get('ctitle', 'ВИПУСК') || '').split(''), cols = ['#ef6c57', '#f7b733', '#5fb36b', '#4a9fe0', '#a066c9', '#f27da5'], sz = g.H * 0.15, x0 = g.cx - sz * 0.62, y0 = g.H * 0.2;
        letters.forEach(function (ch, i) { var col = i % 2, row = Math.floor(i / 2), x = x0 + col * sz * 1.25 + (row % 2) * 3, y = y0 + row * sz * 1.18; circle(c, x, y - sz * 0.32, sz * 0.52, cols[i % cols.length] + '33'); g.fx('ctitle', ch, x, y, sz, sz, 'Unbounded', cols[i % cols.length], '700', 'center', 0, 'as'); });
        if (g.year) g.tx('year', g.year, g.cx, g.H * 0.8, g.H * 0.065, (g.x1 - g.x0) * 0.6, 'Unbounded', '#4a4a4a', '700', 'center', 0.1, 'as');
        std(g, { ny: g.H * 0.87, nsize: g.H * 0.03, ncol: '#4a4a4a', nfont: 'Unbounded', ncase: 'as', iy: g.H * 0.91, icol: '#8a8a8a', ifont: 'Montserrat' });
      }
    }
    ,{
      id: 'clouds', name: 'Хмаринки', note: 'Садочок без фото: пастельні хмаринки, краплі й кілька слів', cats: ['kindergarten'], photo: false, bg: '#fdf3e3',
      deco: function (g) {
        var c = g.ctx, r = rnd(12), i, cloud = function (x, y, s, col) { circle(c, x, y, s, col); circle(c, x + s * 1.1, y + s * 0.2, s * 0.8, col); circle(c, x - s * 1.1, y + s * 0.25, s * 0.7, col); c.fillStyle = col; c.fillRect(x - s * 1.1, y + s * 0.2, s * 2.2, s * 0.8); };
        for (i = 0; i < 9; i++) cloud(g.bx0 + r() * (g.bx1 - g.bx0), g.H * (0.1 + r() * 0.8), 5 + r() * 5, 'rgba(180,205,210,.55)');
        for (i = 0; i < 40; i++) { var x = g.bx0 + r() * (g.bx1 - g.bx0), y = r() * g.H; line(c, x, y, x - 0.8, y + 3, 'rgba(120,170,200,.5)', 0.6); }
        circle(c, g.x1 - 22, g.H * 0.14, 6, '#f7c873');
      },
      text: function (g) { std(g, { title: g.t('Наш любий дитячий садок'), ty: g.H * 0.45, tsize: g.H * 0.058, tfont: 'Marmelad', tcol: '#e0842f', tw: 0.8, tsp: 0.01, tcase: 'as', yy: g.H * 0.6, ysize: g.H * 0.045, yfont: 'Marmelad', ycol: '#7a8f6a', ny: g.H * 0.68, nfont: 'Marmelad', ncol: '#6a5a4a', nsize: g.H * 0.03, ncase: 'as', iy: g.H * 0.73, icol: '#9a8a7a' }); }
    }
    ,{
      id: 'noir', name: 'Чорний мінімал', note: 'Лише рік: чорний фон і тонкий вертикальний напис', cats: null, photo: false, bg: '#050505',
      deco: function (g) { line(g.ctx, g.cx, g.H * 0.4, g.cx, g.H * 0.6, '#6a6a6a', 0.25); },
      text: function (g) { var c = g.ctx; if (g.year) { c.save(); c.translate(g.cx - 6, g.H * 0.5); c.rotate(-Math.PI / 2); g.fx('year', g.year, 0, 0, g.H * 0.05, g.H * 0.3, 'Montserrat', '#f2f2f2', '400', 'center', 0.2, 'as'); c.restore(); }
        c.save(); c.translate(g.cx + 6, g.H * 0.5); c.rotate(-Math.PI / 2); g.fx('ctitle', g.get('ctitle', 'Випускний альбом'), 0, 0, g.H * 0.018, g.H * 0.3, 'Montserrat', '#9a9a9a', '400', 'center', 0.2, 'upper'); c.restore(); }
    }
    ,{
      id: 'silver', name: 'Сріблясті лінії', note: 'Без фото: сірий градієнт із діагональними штрихами, рік розвернутий', cats: SCH, photo: false, bg: ['#e9e9ea', '#c9cbcf'],
      deco: function (g) { var c = g.ctx, r = rnd(31); c.save(); c.beginPath(); c.rect(g.bx0, 0, g.bx1 - g.bx0, g.H); c.clip(); for (var i = 0; i < 90; i++) { var x = r() * g.W; line(c, x, 0, x + g.H * 0.4, g.H, 'rgba(255,255,255,' + (0.2 + r() * 0.4) + ')', 0.2 + r() * 0.8); } c.restore(); line(c, g.cx - 20, g.H * 0.28, g.cx - 20, g.H * 0.72, '#2a2a2e', 0.4); },
      text: function (g) { var c = g.ctx; if (g.year) { c.save(); c.translate(g.cx - 12, g.H * 0.5); c.rotate(-Math.PI / 2); g.fx('year', g.year, 0, 0, g.H * 0.1, g.H * 0.4, 'Montserrat', '#2a2a2e', '700', 'center', 0.1, 'as'); c.restore(); }
        std(g, { title: g.t('Випускний альбом'), ty: g.H * 0.85, tsize: g.H * 0.026, tfont: 'Montserrat', tcol: '#2a2a2e', tw8: '700', tw: 0.5, tsp: 0.08, tcase: 'upper', sub: g.t2('11 клас'), sy: g.H * 0.89, ssize: g.H * 0.02, sfont: 'Montserrat', scol: '#55565c', scase: 'upper' }); }
    }
    ,{
      id: 'script-year', name: 'Рік і каліграфія', note: 'Блідий рожевий фон, великий контурний рік і рукописне слово поверх нього', cats: null, photo: false, bg: ['#f2e9ec', '#e8dbe0'],
      text: function (g) { var c = g.ctx, y = g.year || '';
        if (y) { c.save(); c.beginPath(); c.rect(g.x0, 0, g.W - g.x0, g.H); c.clip(); c.strokeStyle = '#b9aab0'; c.lineWidth = 0.5; c.font = '700 ' + g.H * 0.36 + 'px "Montserrat", sans-serif'; c.textAlign = 'center'; c.strokeText(y.slice(0, 2), g.cx + 10, g.H * 0.4); c.strokeText(y.slice(2), g.cx + 10, g.H * 0.8); c.restore(); g.tx('year', y, g.cx, g.H * 0.93, g.H * 0.022, 80, 'Montserrat', '#8b7b83', '400', 'center', 0.4, 'as'); }
        std(g, { title: g.t('Випуск'), ty: g.H * 0.62, tsize: g.H * 0.15, tfont: 'Marck Script', tcol: '#2d2428', tsp: 0, tcase: 'as', ny: g.H * 0.85, nsize: g.H * 0.024, ncol: '#4a3e44', nfont: 'Montserrat', nsp: 0.2, iy: g.H * 0.885, icol: '#8b7b83' }); }
    }
    ,{
      id: 'only-year', name: 'Лише рік', note: 'Максимум повітря: маленький рік угорі й рукописний підпис унизу', cats: null, photo: false, bg: '#ffffff',
      text: function (g) { var c = g.ctx; if (g.year) g.tx('year', g.year, g.x1 - g.sb - 16, g.sb + 6, g.H * 0.03, 40, 'Montserrat', '#222222', '700', 'center', 0.05, 'as');
        std(g, { sub: g.t2('випускний альбом'), sy: g.sb + 11, ssize: g.H * 0.012, sfont: 'Montserrat', scol: '#888888', ssp: 0.05, scase: 'as', title: g.t('Випуск'), ty: g.H * 0.92, tsize: g.H * 0.06, tfont: 'Marck Script', tcol: '#3a3a3a', tsp: 0, tcase: 'as', ny: g.H * 0.8, nsize: g.H * 0.02, ncol: '#555555', nfont: 'Montserrat', nsp: 0.2 }); }
    }
    ,{
      id: 'gp-frame', name: 'Класне фото в рамці', note: 'Одне загальне фото класу, одна обкладинка на всіх (прізвище за прапорцем)', cats: null, photo: false, general: true, bg: '#fbf8f2',
      cells: function (f) { var w = (f.x1 - f.x0) * 0.8, h = w * 0.64; return [{ x: f.cx - w / 2, y: f.H * 0.12, w: w, h: h }]; },
      deco: function (g) { var w = (g.x1 - g.x0) * 0.8, h = w * 0.64; frame(g.ctx, g.cx - w / 2 - 3, g.H * 0.12 - 3, w + 6, h + 6, '#b9ad98', 0.4); },
      text: function (g) { std(g, { title: g.t('Наш клас'), ty: g.H * 0.76, tsize: g.H * 0.07, tfont: 'Marck Script', tcol: '#6d6454', tsp: 0.02, tcase: 'as', yy: g.H * 0.83, ysize: g.H * 0.045, yfont: 'Cormorant Garamond', ycol: '#8c8372', y8: '700', ysp: 0.3, ny: g.H * 0.89, nsize: g.H * 0.026, ncol: '#6d6454', nfont: 'Cormorant Garamond', iy: g.H * 0.93, icol: '#9a917f' }); }
    }
    ,{
      id: 'gp-full', name: 'Класне фото на всю ширину', note: 'Велике фото класу зверху, нижче білий блок з рік й назвою', cats: null, photo: false, general: true, bg: '#ffffff',
      cells: function (f) { return [{ x: f.x0, y: 0, w: f.W - f.x0, h: f.H * 0.7 }]; },
      text: function (g) { std(g, { title: g.t('Випуск'), ty: g.H * 0.8, tsize: g.H * 0.06, tfont: 'Montserrat', tcol: '#222', tw8: '700', tsp: 0.2, tcase: 'upper', yy: g.H * 0.9, ysize: g.H * 0.06, yfont: 'Montserrat', ycol: '#b9b2a8', y8: '700', ny: g.H * 0.945, nsize: g.H * 0.02, ncol: '#555', nfont: 'Montserrat', nsp: 0.2 }); }
    }
    ,{
      id: 'gp-oval', name: 'Класне фото в овалі', note: 'Загальне фото класу в широкому овалі з тонкою лінією', cats: null, photo: false, general: true, cellShape: 'oval', bg: ['#f3efe9', '#e9e3da'],
      cells: function (f) { var w = (f.x1 - f.x0) * 0.78, h = w * 0.7; return [{ x: f.cx - w / 2, y: f.H * 0.14, w: w, h: h }]; },
      deco: function (g) { var w = (g.x1 - g.x0) * 0.78, h = w * 0.7, r = { x: g.cx - w / 2, y: g.H * 0.14, w: w, h: h }; outline(g.ctx, r, 'oval', 2.5, '#a99372', 0.5); outline(g.ctx, r, 'oval', 5, '#cdbb9b', 0.3); },
      text: function (g) { std(g, { title: g.t('Наш випуск'), ty: g.H * 0.82, tsize: g.H * 0.065, tfont: 'Playfair Display', tcol: '#4a3f33', tsp: 0.02, tcase: 'as', yy: g.H * 0.885, ysize: g.H * 0.04, yfont: 'Playfair Display', ycol: '#a99372', ny: g.H * 0.935, nsize: g.H * 0.024, ncol: '#4a3f33', nfont: 'Montserrat', nsp: 0.2 }); }
    }
    ,{
      id: 'gp-3', name: 'Колаж із 3 фото', note: 'Одне велике й два менших фото класу, загальна обкладинка', cats: null, photo: false, general: true, bg: '#f6f4f0',
      cells: function (f) { var m = f.sb + 4, iw = f.x1 - f.x0 - 2 * m, y = f.H * 0.09, ah = f.H * 0.62, g = 3, bw = iw * 0.62; return [{ x: f.x0 + m, y: y, w: bw, h: ah }, { x: f.x0 + m + bw + g, y: y, w: iw - bw - g, h: (ah - g) / 2 }, { x: f.x0 + m + bw + g, y: y + (ah - g) / 2 + g, w: iw - bw - g, h: (ah - g) / 2 }]; },
      text: function (g) { std(g, { title: g.t('Наш клас'), ty: g.H * 0.8, tsize: g.H * 0.075, tfont: 'Marck Script', tcol: '#3d3a38', tsp: 0.02, tcase: 'as', yy: g.H * 0.88, ysize: g.H * 0.045, yfont: 'Montserrat', ycol: '#c27a5f', y8: '700', ysp: 0.2, ny: g.H * 0.935, nsize: g.H * 0.022, ncol: '#3d3a38', nfont: 'Montserrat', nsp: 0.2 }); }
    }
    ,{
      id: 'gp-5', name: 'Колаж із 5 фото', note: 'Широке фото зверху та чотири квадрати під ним', cats: null, photo: false, general: true, bg: '#ffffff',
      cells: function (f) { var m = f.sb + 4, iw = f.x1 - f.x0 - 2 * m, g = 3, y = f.H * 0.08, hh = f.H * 0.34, sq = (iw - 3 * g) / 4, out = [{ x: f.x0 + m, y: y, w: iw, h: hh }]; for (var i = 0; i < 4; i++) out.push({ x: f.x0 + m + i * (sq + g), y: y + hh + g, w: sq, h: sq * 1.15 }); return out; },
      text: function (g) { std(g, { title: g.t('Випуск'), ty: g.H * 0.78, tsize: g.H * 0.055, tfont: 'Tenor Sans', tcol: '#222', tsp: 0.3, tcase: 'upper', yy: g.H * 0.86, ysize: g.H * 0.045, yfont: 'Tenor Sans', ycol: '#8c7a54', ysp: 0.3, ny: g.H * 0.93, nsize: g.H * 0.022, ncol: '#222', nfont: 'Tenor Sans', nsp: 0.2 }); }
    }
    ,{
      id: 'gp-strips', name: 'Колаж: три смуги', note: 'Три вертикальні смуги з різних фото класу', cats: null, photo: false, general: true, bg: ['#14213d', '#0d1530'],
      cells: function (f) { var m = f.sb + 4, iw = f.x1 - f.x0 - 2 * m, g = 3, w = (iw - 2 * g) / 3, y = f.H * 0.08, h = f.H * 0.66; return [0, 1, 2].map(function (i) { return { x: f.x0 + m + i * (w + g), y: y, w: w, h: h }; }); },
      text: function (g) { std(g, { title: g.t('Graduation'), ty: g.H * 0.84, tsize: g.H * 0.06, tfont: 'Playfair Display', tcol: '#e3c987', tsp: 0.14, tcase: 'upper', yy: g.H * 0.9, ysize: g.H * 0.045, yfont: 'Playfair Display', ycol: '#c9a45c', ny: g.H * 0.945, nsize: g.H * 0.022, ncol: '#f1e6c8', nfont: 'Montserrat', nsp: 0.2 }); }
    }
  ];
  function byId(id) { return V.filter(function (v) { return v.id === id; })[0] || V[0]; }
  function forCat(catId) { return V.filter(function (v) { return !v.cats || v.cats.indexOf(catId) >= 0; }); }
  // Шрифти всіх написів варіанта (для завантаження перед малюванням)
  function fontsOf(id) { var v = byId(id), out = {}, src = String(v.text || ''); (src.match(/'[A-Z][A-Za-z0-9 ]+'/g) || []).forEach(function (s) { out[s.slice(1, -1)] = 1; }); return Object.keys(out); }
  // Стандартні тексти варіанта (для полів редагування): { ctitle, csub }
  function defaults(id) {
    var v = byId(id), out = {}, cap = function (key, text) { if (key === 'ctitle' || key === 'csub') out[key] = text; return 0; };
    if (v.text) try { v.text({ H: 100, W: 200, cx: 150, x0: 100, x1: 200, sb: 8, year: '', owner: '', inst: '', t: function (x) { return x; }, t2: function (x) { return x; }, get: function (k, d) { cap(k, d); return d; }, tx: cap, fx: function () { return 0; } }); } catch (e) {}
    return out;
  }
  var api = { shapePath: shapePath, defaults: defaults, VARIANTS: V, byId: byId, forCat: forCat, fontsOf: fontsOf, std: std };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.AlbumCoverVariants = api;
})(typeof self !== 'undefined' ? self : this);
