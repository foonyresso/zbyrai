// Обкладинки «за зразками»: групи «Фото й каліграфія» (8) і «Типографіка й цифри» (4). Стилістику зразків відтворено власними засобами: шрифти з fonts/ (кирилиця), прості фігури canvas.
// Правила складання: написи йдуть після фото (поверх), тому спершу g.get(...) дефолтів ctitle/csub (їх зчитує defaults()), потім малювання; шрифти вказані літералами в text() або в полі fonts.
(function (root) {
  var CV = root.AlbumCoverVariants || (typeof require !== 'undefined' ? require('./cover-variants.js') : null);
  if (typeof require !== 'undefined' && !CV.K) require('./cover-ref-kit.js');
  var K = CV.K, H = CV.H, SCH = H.SCH, G1 = 'Фото й каліграфія', G2 = 'Типографіка й цифри';
  function pg(g) { return { L: g.x0 + g.sb * 0.8, R: g.W - g.sb, w: g.W - g.x0 - g.sb * 1.8 }; }
  function cat(g) { return g.W - g.x0; }
  var V = [
    {
      id: 'cal-taupe', grp: G1, name: 'Каліграфія на таупі', note: 'Тепле таупе, фото з рукописним словом, що перетинає край фото і міняє колір', cats: SCH, photo: true, bg: ['#cfc4b8', '#c2b6a9'], fonts: ['Great Vibes', 'Cormorant Garamond'],
      prf: function (f) { var h = f.H * 0.56, w = h * 0.8; return K.rectM(f, { x: f.cx - w / 2, y: f.H * 0.2, w: w, h: h }); },
      deco: function (g) { K.grain(g.ctx, g.x0, 0, g.W - g.x0, g.H, 700, 3, 0.05); },
      text: function (g) { g = K.safe(g);
        var T = g.get('ctitle', 'Випуск'), S = g.get('csub', 'випускний альбом'), c = g.ctx, p = g.ph; if (!c) return;
        var sz = g.H * 0.2, y = g.H * 0.37, mw = cat(g) * 0.96, x = g.cx - g.H * 0.04;
        K.splitClip(c, g, p, function () { g.fx('ctitle', T, x, y, sz, mw, 'Great Vibes', '#fffaf2', '400', 'center', 0, 'as'); }, function () { g.tx('ctitle', T, x, y, sz, mw, 'Great Vibes', '#2f2c2a', '400', 'center', 0, 'as'); });
        g.tx('csub', S, g.cx, g.H * 0.805, g.H * 0.03, cat(g) * 0.7, 'Cormorant Garamond', '#6b6258', 'italic 500', 'center', 0.04, 'as');
        g.tx('year', g.year, g.cx, g.H * 0.855, g.H * 0.026, cat(g) * 0.6, 'Cormorant Garamond', '#f6f1e9', '600', 'center', 0.45, 'as');
        g.tx('name', g.owner, g.cx, g.H * 0.905, g.H * 0.036, cat(g) * 0.8, 'Cormorant Garamond', '#fbf7f0', '600', 'center', 0.32, 'upper');
        g.tx('inst', g.inst, g.cx, g.H * 0.945, g.H * 0.026, cat(g) * 0.8, 'Cormorant Garamond', '#6b6258', 'italic 500', 'center', 0.06, 'as');
      }
    },
    {
      id: 'cal-virtual', grp: G1, name: 'Біла листівка з рамкою', note: 'Біле мармурове тло, фото з тонкою внутрішньою рамкою, велике каліграфічне слово', cats: SCH, photo: true, bg: '#fbfaf8', fonts: ['Great Vibes', 'Cormorant Garamond'],
      prf: function (f) { var h = f.H * 0.5, w = h * 0.9; return K.rectM(f, { x: f.cx - w / 2, y: f.H * 0.11, w: w, h: h }); },
      deco: function (g) {
        var c = g.ctx, x0 = g.x0; H.wash(c, x0 + 6, g.H * 0.18, g.H * 0.4, '190,190,196', 0.2); H.wash(c, g.W - 8, g.H * 0.9, g.H * 0.4, '190,190,196', 0.18);
        c.save(); c.beginPath(); c.rect(x0, 0, g.W - x0, g.H); c.clip(); c.strokeStyle = 'rgba(150,150,160,.16)'; c.lineWidth = 0.35;
        [[0.0, 0.25, 0.25, 0.12, 0.4, 0.4], [0.0, 0.7, 0.18, 0.55, 0.35, 0.8], [0.7, 1.0, 0.85, 0.85, 1.0, 0.7]].forEach(function (b) { c.beginPath(); c.moveTo(x0 + (g.W - x0) * b[0], g.H * b[1]); c.bezierCurveTo(x0 + (g.W - x0) * b[2], g.H * b[3], x0 + (g.W - x0) * b[4], g.H * b[5], x0 + (g.W - x0) * (b[4] + 0.1), g.H * (b[5] + 0.1)); c.stroke(); }); c.restore();
      },
      over: function (g) { var c = g.ctx, p = g.ph, a = 2.4; c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 0.55; c.strokeRect(p.x + a, p.y + a, p.w - 2 * a, p.h - 2 * a); c.strokeStyle = 'rgba(70,100,80,.55)'; c.lineWidth = 0.3; c.strokeRect(p.x + a + 1.2, p.y + a + 1.2, p.w - 2 * a - 2.4, p.h - 2 * a - 2.4); },
      text: function (g) { g = K.safe(g);
        var T = g.get('ctitle', 'Випуск'), S = g.get('csub', 'випускний'), c = g.ctx; if (!c) return;
        g.tx('name', g.owner, g.cx, g.H * 0.075, g.H * 0.026, cat(g) * 0.8, 'Cormorant Garamond', '#3f3d3a', '600', 'center', 0.4, 'upper');
        g.tx('csub', S, g.cx, g.H * 0.685, g.H * 0.03, cat(g) * 0.7, 'Cormorant Garamond', '#4a4743', '600', 'center', 0.5, 'upper');
        g.tx('ctitle', T, g.cx, g.H * 0.83, g.H * 0.16, cat(g) * 0.9, 'Great Vibes', '#26231f', '400', 'center', 0, 'as');
        g.tx('year', g.year, g.cx, g.H * 0.89, g.H * 0.03, cat(g) * 0.5, 'Cormorant Garamond', '#6b6862', '600', 'center', 0.5, 'as');
        g.tx('inst', g.inst, g.cx, g.H * 0.925, g.H * 0.024, cat(g) * 0.8, 'Cormorant Garamond', '#8a867f', '500', 'center', 0.3, 'upper');
      }
    },
    {
      id: 'cal-fullphoto', grp: G1, name: 'Фото на всю обкладинку', note: 'Фото на всю сторінку, білий розмашистий напис і дрібний текст по дузі', cats: SCH, photo: true, bg: '#1b1b1b', fonts: ['Great Vibes', 'Cormorant Garamond'],
      prf: function (f) { return { x: f.x0, y: 0, w: f.bx1 - f.x0, h: f.H }; },
      over: function (g) {
        var c = g.ctx, x0 = g.x0, w = g.W - x0, a = c.createLinearGradient(0, 0, 0, g.H * 0.5); a.addColorStop(0, 'rgba(0,0,0,.42)'); a.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = a; c.fillRect(x0, 0, w, g.H * 0.5);
        var b = c.createLinearGradient(0, g.H * 0.68, 0, g.H); b.addColorStop(0, 'rgba(0,0,0,0)'); b.addColorStop(1, 'rgba(0,0,0,.55)'); c.fillStyle = b; c.fillRect(x0, g.H * 0.68, w, g.H * 0.32);
      },
      text: function (g) { g = K.safe(g);
        var T = g.get('ctitle', 'Випуск'), S = g.get('csub', 'на порозі нового'), c = g.ctx; if (!c) return;
        c.save(); c.shadowColor = 'rgba(0,0,0,.35)'; c.shadowBlur = 6;
        if (S) K.arcText(c, S.toUpperCase(), g.cx, g.H * 0.17 + g.H * 1.1, g.H * 1.1, g.H * 0.032, '"Cormorant Garamond", serif', '#ffffff', '600', g.H * 0.012, g.box);
        g.tx('ctitle', T, g.cx, g.H * 0.4, g.H * 0.27, cat(g) * 0.96, 'Great Vibes', '#ffffff', '400', 'center', 0, 'as');
        g.tx('year', g.year, g.cx, g.H * 0.875, g.H * 0.034, cat(g) * 0.6, 'Cormorant Garamond', '#ffffff', '600', 'center', 0.4, 'as');
        g.tx('name', g.owner, g.cx, g.H * 0.925, g.H * 0.036, cat(g) * 0.85, 'Cormorant Garamond', '#ffffff', '600', 'center', 0.32, 'upper');
        g.tx('inst', g.inst, g.cx, g.H * 0.96, g.H * 0.024, cat(g) * 0.85, 'Cormorant Garamond', '#f1ede6', 'italic 500', 'center', 0.08, 'as');
        c.restore();
      }
    },
    {
      id: 'cal-brush', grp: G1, name: 'Пензлем по чорно-білому', note: 'Чорно-біле фото на всю сторінку, великий пензлевий напис унизу', cats: SCH, photo: true, bg: '#0b0b0b', fonts: ['Comforter Brush', 'Montserrat'],
      prf: function (f) { return { x: f.x0, y: 0, w: f.bx1 - f.x0, h: f.H }; },
      over: function (g) {
        var c = g.ctx, x0 = g.x0, w = g.W - x0; c.save(); c.beginPath(); c.rect(x0, 0, w, g.H); c.clip(); c.globalCompositeOperation = 'saturation'; c.fillStyle = '#000'; c.fillRect(x0, 0, w, g.H); c.globalCompositeOperation = 'source-over';
        var b = c.createLinearGradient(0, g.H * 0.55, 0, g.H); b.addColorStop(0, 'rgba(0,0,0,0)'); b.addColorStop(1, 'rgba(0,0,0,.62)'); c.fillStyle = b; c.fillRect(x0, 0, w, g.H); c.restore();
      },
      text: function (g) { g = K.safe(g);
        var T = g.get('ctitle', 'випуск'), c = g.ctx; if (!c) return;
        c.save(); c.shadowColor = 'rgba(0,0,0,.4)'; c.shadowBlur = 5;
        for (var k = 0; k < 3; k++) g.tx('ctitle', T, g.cx + (k - 1) * 0.55 - g.H * 0.02, g.H * 0.7 + (k % 2) * 0.3, g.H * 0.28, cat(g) * 0.96, 'Comforter Brush', '#fbfaf7', '400', 'center', -0.02, 'as');
        c.restore();
        g.tx('name', g.owner, g.cx, g.H * 0.875, g.H * 0.03, cat(g) * 0.8, 'Montserrat', '#ffffff', '600', 'center', 0.32, 'upper');
        g.tx('inst', g.inst, g.cx, g.H * 0.915, g.H * 0.02, cat(g) * 0.8, 'Montserrat', '#d9d6d1', '400', 'center', 0.16, 'as');
        g.tx('year', g.year, g.cx, g.H * 0.95, g.H * 0.022, cat(g) * 0.5, 'Montserrat', '#d9d6d1', '400', 'center', 0.4, 'as');
      }
    },
    {
      id: 'cal-peach', grp: G1, name: 'Персик і мідний ромб', note: 'Персикове тло, фото й тонкий мідний ромб, що перетинає край, підпис ліворуч', cats: SCH, photo: true, bg: ['#f2d0b9', '#edc0a4'], fonts: ['Montserrat', 'Cormorant Garamond'],
      prf: function (f) { var h = f.H * 0.5, w = h * 0.9; return K.rectM(f, { x: f.cx - w / 2 + f.H * 0.02, y: f.H * 0.14, w: w, h: h }); },
      deco: function (g) { K.grain(g.ctx, g.x0, 0, g.W - g.x0, g.H, 500, 4, 0.04); },
      over: function (g) {
        var c = g.ctx, p = g.ph, cx = p.x + p.w * 0.1, cy = p.y + p.h * 0.3, d = p.w * 0.46; c.save(); c.beginPath(); c.rect(g.x0, 0, g.W - g.x0, g.H); c.clip(); c.strokeStyle = '#b9764d'; c.lineWidth = 0.5;
        c.beginPath(); c.moveTo(cx, cy - d); c.lineTo(cx + d, cy); c.lineTo(cx, cy + d); c.lineTo(cx - d, cy); c.closePath(); c.stroke();
        c.beginPath(); c.moveTo(cx - d, cy); c.lineTo(cx - d, cy + d * 0.42); c.moveTo(cx - d + 4.5, cy + 4.5); c.lineTo(cx - d + 4.5, cy + d * 0.3); c.stroke(); H.circle(c, cx - d, cy + d * 0.42 + 1.6, 1.4, null, '#b9764d', 0.5); H.circle(c, cx - d + 4.5, cy + d * 0.3 + 1.6, 1.4, null, '#b9764d', 0.5);
        c.restore();
      },
      text: function (g) { g = K.safe(g);
        var T = g.get('ctitle', 'випускник'), S = g.get('csub', 'Випускний альбом'), c = g.ctx, p = g.ph; if (!c) return; var x = p.x - g.H * 0.012;
        g.tx('name', g.owner || T, x, g.H * 0.775, g.H * 0.03, cat(g) * 0.6, 'Montserrat', '#6b3f28', '600', 'left', 0.34, 'upper');
        g.tx('csub', S, x, g.H * 0.815, g.H * 0.024, cat(g) * 0.7, 'Cormorant Garamond', '#9a6a4c', 'italic 500', 'left', 0.06, 'as');
        g.tx('inst', g.inst, x, g.H * 0.85, g.H * 0.024, cat(g) * 0.7, 'Cormorant Garamond', '#9a6a4c', 'italic 500', 'left', 0.06, 'as');
        g.tx('year', g.year, x, g.H * 0.885, g.H * 0.024, cat(g) * 0.6, 'Montserrat', '#9a6a4c', '500', 'left', 0.34, 'as');
      }
    },
    {
      id: 'cal-gold', grp: G1, name: 'Золотий розчерк', note: 'Світле тло, великий золотий напис угорі, фото на нижню половину зі м\'яким переходом', cats: SCH, photo: true, bg: ['#f0ece7', '#e8e2da'], fonts: ['Great Vibes', 'Cormorant Garamond'],
      prf: function (f) { return { x: f.x0, y: f.H * 0.44, w: f.bx1 - f.x0, h: f.H * 0.56 }; },
      over: function (g) { var c = g.ctx, y = g.H * 0.44 - 0.8, a = c.createLinearGradient(0, y, 0, y + g.H * 0.14); a.addColorStop(0, 'rgba(236,232,225,1)'); a.addColorStop(1, 'rgba(236,232,225,0)'); c.fillStyle = a; c.fillRect(g.x0, y, g.W - g.x0, g.H * 0.14); },
      text: function (g) { g = K.safe(g);
        var T = g.get('ctitle', 'Випуск'), S = g.get('csub', 'випускний альбом'), c = g.ctx; if (!c) return; var big = g.owner || T, key = g.owner ? 'name' : 'ctitle', sz = g.H * 0.17, mw = cat(g) * 0.84;
        g.tx(key, big, g.cx, g.H * 0.2, sz, mw, 'Great Vibes', K.goldLocal(c, sz, mw * 0.8), '400', 'center', 0, 'as');
        g.tx('csub', S, g.cx, g.H * 0.275, g.H * 0.026, cat(g) * 0.8, 'Cormorant Garamond', '#b08a3c', '600', 'center', 0.5, 'upper');
        g.tx('inst', g.inst, g.cx, g.H * 0.325, g.H * 0.022, cat(g) * 0.8, 'Cormorant Garamond', '#b9a073', 'italic 500', 'center', 0.1, 'as');
        g.tx('year', g.year, g.cx, g.H * 0.37, g.H * 0.022, cat(g) * 0.4, 'Cormorant Garamond', '#b9a073', '600', 'center', 0.5, 'as');
      }
    },
    {
      id: 'cal-sparkle', grp: G1, name: 'Золотий пил', note: 'Біле тло, акварельні золоті мазки й блискітки по краях, фото й розріджений підпис', cats: SCH, photo: true, bg: '#fffefc', fonts: ['Cormorant Garamond', 'Great Vibes'],
      prf: function (f) { var h = f.H * 0.58, w = h * 0.84; return K.rectM(f, { x: f.cx - w / 2, y: f.H * 0.1, w: w, h: h }); },
      deco: function (g) {
        var c = g.ctx, x0 = g.x0, w = g.W - x0; H.wash(c, x0 + 4, g.H * 0.2, g.H * 0.3, '233,205,150', 0.34); H.wash(c, x0 + 2, g.H * 0.62, g.H * 0.22, '233,205,150', 0.22); H.wash(c, g.W - 3, g.H * 0.75, g.H * 0.34, '233,205,150', 0.3);
        var cols = ['rgba(201,162,76,.85)', 'rgba(231,200,125,.8)', 'rgba(170,130,55,.7)']; K.dust(c, x0, 0, w * 0.2, g.H, 90, cols, 8, 0.9); K.dust(c, g.W - w * 0.2, g.H * 0.3, w * 0.2, g.H * 0.7, 80, cols, 9, 0.9);
      },
      text: function (g) { g = K.safe(g);
        var T = g.get('ctitle', 'Випуск'), S = g.get('csub', 'випускний альбом'), c = g.ctx; if (!c) return;
        g.tx('name', g.owner || T, g.cx, g.H * 0.855, g.H * 0.034, cat(g) * 0.8, 'Cormorant Garamond', '#5d4e3a', '600', 'center', 0.4, 'upper');
        g.tx('inst', g.inst, g.cx, g.H * 0.895, g.H * 0.026, cat(g) * 0.8, 'Cormorant Garamond', '#b9954a', 'italic 500', 'center', 0.06, 'as');
        g.tx('csub', S, g.cx, g.H * 0.93, g.H * 0.02, cat(g) * 0.7, 'Cormorant Garamond', '#9b8a6b', '500', 'center', 0.4, 'upper');
        g.tx('year', g.year, g.cx, g.H * 0.955, g.H * 0.02, cat(g) * 0.4, 'Cormorant Garamond', '#9b8a6b', '600', 'center', 0.5, 'as');
      }
    },
    {
      id: 'cal-black', grp: G1, name: 'Чорна з золотою рамкою', note: 'Чорне тло, фото з зсунутою тонкою золотою рамкою й золотий напис, що заходить на фото', cats: SCH, photo: true, bg: ['#0e0e0e', '#1a1917'], fonts: ['Great Vibes', 'Cormorant Garamond'],
      prf: function (f) { var h = f.H * 0.56, w = h * 0.82; return K.rectM(f, { x: f.cx - w / 2 - f.H * 0.012, y: f.H * 0.09, w: w, h: h }); },
      deco: function (g) { var c = g.ctx, p = g.ph, o = 5; c.strokeStyle = '#c8a24c'; c.lineWidth = 0.5; c.strokeRect(p.x + o, p.y + o, p.w, p.h); },
      text: function (g) { g = K.safe(g);
        var T = g.get('ctitle', 'Випуск'), S = g.get('csub', 'випускний альбом'), c = g.ctx, p = g.ph; if (!c) return; var sz = g.H * 0.2, mw = cat(g) * 0.9;
        g.rtx('ctitle', T, g.cx + g.H * 0.05, p.y + p.h + g.H * 0.02, sz, mw, 'Great Vibes', K.goldLocal(c, sz, mw * 0.55, true), '400', 'center', 0, 'as');
        g.tx('name', g.owner, g.cx, g.H * 0.855, g.H * 0.032, cat(g) * 0.8, 'Cormorant Garamond', '#e3c987', '600', 'center', 0.4, 'upper');
        g.tx('csub', S, g.cx, g.H * 0.895, g.H * 0.022, cat(g) * 0.7, 'Cormorant Garamond', '#a9a39a', 'italic 500', 'center', 0.1, 'as');
        g.tx('inst', g.inst, g.cx, g.H * 0.93, g.H * 0.022, cat(g) * 0.8, 'Cormorant Garamond', '#a9a39a', '500', 'center', 0.3, 'upper');
        g.tx('year', g.year, g.cx, g.H * 0.96, g.H * 0.022, cat(g) * 0.4, 'Cormorant Garamond', '#c8a24c', '600', 'center', 0.5, 'as');
      }
    },
    // ---- Типографіка й цифри ----
    {
      id: 'typ-vert-year', grp: G2, name: 'Рік по вертикалі', note: 'Велике вертикальне число року поруч із фото, рукописне слово накладається на край фото', cats: SCH, photo: true, bg: '#f8f7f4', fonts: ['Montserrat', 'Marck Script'],
      prf: function (f) { var w = (f.x1 - f.x0) * 0.56; return { x: f.x0 + f.sb * 0.9, y: f.sb * 0.9, w: w, h: f.H * 0.78 }; },
      text: function (g) { g = K.safe(g);
        var T = g.get('ctitle', 'випуск'), S = g.get('csub', 'випускний клас'), c = g.ctx, p = g.ph; if (!c) return; var cxr = (p.x + p.w + g.W - g.sb) / 2;
        K.rot90(c, cxr + g.H * 0.075, g.sb * 1.1 + g.H * 0.3, function () { g.rfx('year', g.year, 0, 0, g.H * 0.25, g.H * 0.66, 'Montserrat', '#0c0c0c', '500', 'center', 0.02, 'as'); });
        K.rot90(c, cxr + g.H * 0.075 + g.H * 0.052, g.H * 0.6 + g.sb * 0.2, function () { g.rfx('csub', S, 0, 0, g.H * 0.024, g.H * 0.3, 'Montserrat', '#333', '500', 'center', 0.2, 'upper'); });
        var y = g.H * 0.86, sz = g.H * 0.17;
        K.splitClip(c, g, p, function () { g.fx('ctitle', T, p.x + sz * 0.12, y, sz, p.w * 1.15, 'Marck Script', '#ffffff', '700', 'left', 0, 'as'); }, function () { g.tx('ctitle', T, p.x + sz * 0.12, y, sz, p.w * 1.15, 'Marck Script', '#0c0c0c', '700', 'left', 0, 'as'); });
        g.tx('name', g.owner, g.W - g.sb, g.H * 0.905, g.H * 0.02, cat(g) * 0.4, 'Montserrat', '#222', '600', 'right', 0.24, 'upper');
        g.tx('inst', g.inst, g.W - g.sb, g.H * 0.935, g.H * 0.017, cat(g) * 0.4, 'Montserrat', '#777', '400', 'right', 0.1, 'as');
      }
    },
    {
      id: 'typ-grad-tall', grp: G2, name: 'Висока вертикаль', note: 'Дуже висока вузька «ВИПУСК» уздовж лівого краю, що заходить на фото й змінює колір', cats: SCH, photo: true, bg: '#eeeae3', fonts: ['Sofia Sans Extra Condensed', 'Montserrat'],
      prf: function (f) { var x = f.x0 + (f.x1 - f.x0) * 0.3; return { x: x, y: 0, w: f.bx1 - x, h: f.H * 0.8 }; },
      text: function (g) { g = K.safe(g);
        var T = g.get('ctitle', 'ВИПУСК'), S = g.get('csub', 'випускний альбом'), c = g.ctx, p = g.ph; if (!c) return; var sz = Math.min(g.H * 0.38, cat(g) * 0.42), len = (g.H - 2 * g.sb) * 0.98, bx = g.x0 + g.sb * 0.9 + sz * 0.66;
        var dr = function (col, tx) { K.rot90(c, bx, g.H * 0.5 + len / 2, function () { (tx ? g.rtx : g.rfx)('ctitle', T, len / 2, 0, sz, len, 'Sofia Sans Extra Condensed', col, '800', 'center', 0.02, 'upper'); }); };
        K.splitClip(c, g, p, function () { dr('#ffffff', false); }, function () { dr('#241f1c', false); });
        // область для клацання: рисуємо невидимо
        c.save(); c.globalAlpha = 0; K.rot90(c, bx, g.H * 0.5 + len / 2, function () { g.rtx('ctitle', T, len / 2, 0, sz, len, 'Sofia Sans Extra Condensed', '#000', '800', 'center', 0.02, 'upper'); }); c.restore();
        var px = p.x + p.w / 2;
        g.tx('year', g.year, px, g.H * 0.895, g.H * 0.05, cat(g) * 0.5, 'Sofia Sans Extra Condensed', '#241f1c', '600', 'center', 0.2, 'as');
        g.tx('name', g.owner, px, g.H * 0.935, g.H * 0.024, cat(g) * 0.6, 'Montserrat', '#241f1c', '600', 'center', 0.3, 'upper');
        g.tx('csub', S, px, g.H * 0.96, g.H * 0.017, cat(g) * 0.6, 'Montserrat', '#6c655d', '400', 'center', 0.2, 'upper');
      }
    },
    {
      id: 'typ-numerals', grp: G2, name: 'Дидонівські цифри', note: 'Контрастні цифри року двома рядками на теплому папері, невелике фото праворуч', cats: SCH, photo: true, bg: ['#efe9e0', '#e9e2d7'], fonts: ['Playfair Display', 'Cormorant Garamond', 'Montserrat'],
      prf: function (f) { var w = (f.x1 - f.x0) * 0.3, x = f.bx1 - f.sb * 1.1 - w; return K.rectM(f, { x: x, y: f.H * 0.13, w: w, h: f.H * 0.5 }); },
      deco: function (g) { K.grain(g.ctx, g.x0, 0, g.W - g.x0, g.H, 500, 5, 0.04); },
      text: function (g) { g = K.safe(g);
        var T = g.get('ctitle', 'Випуск'), S = g.get('csub', 'випускний альбом'), c = g.ctx, p = g.ph; if (!c) return; var L = g.x0 + g.sb * 0.9, yr = String(g.year || ''), sz = Math.min(g.H * 0.4, cat(g) * 0.4);
        g.tx('year', yr.slice(0, 2), L - g.H * 0.02, g.H * 0.4, sz, cat(g) * 0.6, 'Playfair Display', '#1c1a18', '900', 'left', -0.02, 'as');
        g.fx('year', yr.slice(2), L - g.H * 0.02, g.H * 0.8, sz, cat(g) * 0.6, 'Playfair Display', '#1c1a18', '900', 'left', -0.02, 'as');
        var x = p.x;
        g.rtx('ctitle', T, x, p.y + p.h + g.H * 0.075, g.H * 0.034, p.w * 1.15, 'Cormorant Garamond', '#1c1a18', '600', 'left', 0.4, 'upper');
        g.rtx('csub', S, x, p.y + p.h + g.H * 0.108, g.H * 0.024, p.w * 1.15, 'Cormorant Garamond', '#6d655b', 'italic 500', 'left', 0.04, 'as');
        g.tx('name', g.owner, x, g.H * 0.88, g.H * 0.022, p.w * 1.2, 'Montserrat', '#1c1a18', '600', 'left', 0.2, 'upper');
        g.tx('inst', g.inst, x, g.H * 0.91, g.H * 0.018, p.w * 1.2, 'Montserrat', '#7a7268', '400', 'left', 0.08, 'as');
      }
    },
    {
      id: 'typ-year-geo', grp: G2, name: 'Геометричні арки', note: 'Без фото: тонкий великий рік зверху й землисті арки, півкола та стовпи внизу', cats: null, photo: false, bg: '#f5efe4', fonts: ['Montserrat', 'Prata'],
      deco: function (g) {
        var c = g.ctx, x0 = g.x0, W = g.W, H = g.H, cols = ['#c8694b', '#e2a64e', '#8fa78b', '#3e6b70', '#ebb9a1', '#d8cdb8'], by = H * 0.8, u = (W - x0) / 10;
        c.save(); c.beginPath(); c.rect(x0, 0, W - x0, H); c.clip();
        var arc = function (cx, r, col) { c.beginPath(); c.arc(cx, by, r, Math.PI, 0); c.closePath(); c.fillStyle = col; c.fill(); };
        [[2.4, 2.4, 0], [2.4, 1.8, 3], [2.4, 1.2, 1], [2.4, 0.6, 5]].forEach(function (a) { arc(x0 + u * a[0], u * a[1] + 0.001, cols[a[2]]); });
        c.fillStyle = cols[3]; c.fillRect(x0 + u * 5.2, by - u * 3.2, u * 1.4, u * 3.2 + 1); c.beginPath(); c.arc(x0 + u * 5.9, by - u * 3.2, u * 0.7, Math.PI, 0); c.fill();
        c.fillStyle = cols[1]; c.fillRect(x0 + u * 6.8, by - u * 2.1, u * 1.4, u * 2.1 + 1); c.beginPath(); c.arc(x0 + u * 7.5, by - u * 2.1, u * 0.7, Math.PI, 0); c.fill();
        c.beginPath(); c.arc(x0 + u * 9.6, by, u * 1.8, Math.PI, 3 * Math.PI / 2); c.lineTo(x0 + u * 9.6, by); c.closePath(); c.fillStyle = cols[0]; c.fill();
        c.beginPath(); c.arc(x0 + u * 9.6, by, u * 1.0, Math.PI, 3 * Math.PI / 2); c.lineTo(x0 + u * 9.6, by); c.closePath(); c.fillStyle = cols[4]; c.fill();
        c.fillStyle = '#f5efe4'; c.fillRect(x0, by, W - x0, H - by); c.restore();
      },
      text: function (g) { g = K.safe(g);
        var T = g.get('ctitle', 'Випуск'), S = g.get('csub', 'випускний альбом'), c = g.ctx; if (!c) return;
        g.tx('ctitle', T, g.cx, g.H * 0.15, g.H * 0.034, cat(g) * 0.7, 'Prata', '#3a2f2a', '400', 'center', 0.5, 'upper');
        g.tx('year', g.year, g.cx, g.H * 0.32, g.H * 0.2, cat(g) * 0.92, 'Montserrat', '#3a2f2a', '200', 'center', 0.04, 'as');
        g.tx('csub', S, g.cx, g.H * 0.385, g.H * 0.022, cat(g) * 0.7, 'Montserrat', '#7a6b5f', '500', 'center', 0.4, 'upper');
        g.tx('name', g.owner, g.cx, g.H * 0.925, g.H * 0.026, cat(g) * 0.8, 'Montserrat', '#3a2f2a', '600', 'center', 0.3, 'upper');
        g.tx('inst', g.inst, g.cx, g.H * 0.96, g.H * 0.016, cat(g) * 0.8, 'Montserrat', '#7a6b5f', '400', 'center', 0.12, 'as');
      }
    }
  ];
  V.forEach(function (v) { CV.VARIANTS.push(v); });
})(typeof self !== 'undefined' ? self : this);
