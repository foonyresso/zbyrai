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
      id: 'arch', name: 'Бохо-арка з фото', note: 'Арки та гілочки навколо фото, тепла бежева гама', cats: null, photo: true, pr: { top: 0.2, h: 0.5, asp: 0.8 }, bg: '#f3ece1',
      deco: function (g) {
        var c = g.ctx, cx = g.cx, t = g.H * 0.2, w = g.H * 0.5 * 0.8;
        [1.34, 1.2, 1.07].forEach(function (k, i) { var rw = w * k / 2; c.beginPath(); c.moveTo(cx - rw, g.H * 0.74); c.lineTo(cx - rw, t + rw * 0.9); c.arc(cx, t + rw * 0.9, rw, Math.PI, 0); c.lineTo(cx + rw, g.H * 0.74); c.strokeStyle = ['#d8c3a5', '#c9aa86', '#b88f66'][i]; c.lineWidth = 0.5; c.stroke(); });
        sprig(c, cx - w * 0.78, g.H * 0.78, g.H * 0.2, -Math.PI * 0.5, '#9aa383', 8); sprig(c, cx + w * 0.78, g.H * 0.78, g.H * 0.2, -Math.PI * 0.5, '#9aa383', 8);
      },
      text: function (g) { std(g, { title: g.t('Наш випуск'), ty: g.H * 0.115, tsize: g.H * 0.058, tfont: 'Marck Script', tcol: '#7a5b3d', tsp: 0.02, tcase: 'as', yy: g.H * 0.835, ysize: g.H * 0.05, yfont: 'Cormorant Garamond', ycol: '#a07c58', y8: '700', ny: g.H * 0.89, nsize: g.H * 0.03, ncol: '#7a5b3d', nfont: 'Cormorant Garamond', iy: g.H * 0.925, icol: '#a08c76' }); }
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
  ];
  function byId(id) { return V.filter(function (v) { return v.id === id; })[0] || V[0]; }
  function forCat(catId) { return V.filter(function (v) { return !v.cats || v.cats.indexOf(catId) >= 0; }); }
  // Шрифти всіх написів варіанта (для завантаження перед малюванням)
  function fontsOf(id) { var v = byId(id), out = {}, src = String(v.text || ''); (src.match(/'[A-Z][A-Za-z0-9 ]+'/g) || []).forEach(function (s) { out[s.slice(1, -1)] = 1; }); return Object.keys(out); }
  // Стандартні тексти варіанта (для полів редагування): { ctitle, csub }
  function defaults(id) {
    var v = byId(id), out = {}, cap = function (key, text) { if (key === 'ctitle' || key === 'csub') out[key] = text; return 0; };
    if (v.text) try { v.text({ H: 100, W: 200, cx: 150, x0: 100, x1: 200, sb: 8, year: '', owner: '', inst: '', t: function (x) { return x; }, t2: function (x) { return x; }, tx: cap, fx: cap }); } catch (e) {}
    return out;
  }
  var api = { defaults: defaults, VARIANTS: V, byId: byId, forCat: forCat, fontsOf: fontsOf, std: std };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.AlbumCoverVariants = api;
})(typeof self !== 'undefined' ? self : this);
