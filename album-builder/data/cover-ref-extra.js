// Обкладинки «за зразками»: групи «Мінімалізм і лукбук» (3), «Ніжні й весільні» (2), «Шкільні й дитячі» (3). Правила складання: див. cover-ref-photo.js.
(function (root) {
  var CV = root.AlbumCoverVariants || (typeof require !== 'undefined' ? require('./cover-variants.js') : null);
  if (typeof require !== 'undefined' && !CV.K) require('./cover-ref-kit.js');
  var K = CV.K, H = CV.H, SCH = H.SCH, G3 = 'Мінімалізм і лукбук', G4 = 'Ніжні й весільні', G5 = 'Шкільні й дитячі';
  function cat(g) { return g.W - g.x0; }
  var V = [
    {
      id: 'min-wordmark', grp: G3, name: 'Сірий мінімал', note: 'Однотонне тло, маленький розріджений напис у тонкій рамці й дрібні рядки по кутах', cats: null, photo: false, bg: ['#dcd9d3', '#d3d0c9'], fonts: ['Montserrat'],
      deco: function (g) { var c = g.ctx; K.grain(c, g.x0, 0, g.W - g.x0, g.H, 900, 6, 0.05); var w = cat(g) * 0.5, h = g.H * 0.13; c.strokeStyle = '#2b2b2b'; c.lineWidth = 0.3; c.strokeRect(g.cx - w / 2, g.H * 0.44, w, h); },
      text: function (g) { g = K.safe(g);
        var T = g.get('ctitle', 'Випускний альбом'), S = g.get('csub', 'клас 2025'), c = g.ctx; if (!c) return; var L = g.x0 + g.sb * 1.2, R = g.W - g.sb * 1.2;
        g.tx('ctitle', T, g.cx, g.H * 0.512, g.H * 0.022, cat(g) * 0.46, 'Montserrat', '#1f1f1f', '500', 'center', 0.5, 'upper');
        g.tx('csub', S, g.cx, g.H * 0.53 + g.H * 0.035, g.H * 0.012, cat(g) * 0.4, 'Montserrat', '#66645f', '400', 'center', 0.3, 'upper');
        g.tx('year', g.year, L, g.H - g.sb * 1.3, g.H * 0.014, cat(g) * 0.3, 'Montserrat', '#2b2b2b', '600', 'left', 0.3, 'as');
        g.tx('name', g.owner, R, g.H - g.sb * 1.3 - g.H * 0.022, g.H * 0.014, cat(g) * 0.4, 'Montserrat', '#2b2b2b', '600', 'right', 0.24, 'upper');
        g.tx('inst', g.inst, R, g.H - g.sb * 1.3, g.H * 0.012, cat(g) * 0.4, 'Montserrat', '#77746e', '400', 'right', 0.1, 'as');
      }
    },
    {
      id: 'min-dark', grp: G3, name: 'Графіт із золотою лінією', note: 'Темно-сіре тло, тонкі золоті лінії, розріджений напис із засічками по центру', cats: SCH, photo: false, bg: ['#2a2a2e', '#212125'], fonts: ['Prata', 'Cormorant Garamond'],
      deco: function (g) {
        var c = g.ctx, a = g.sb * 0.7; K.grain(c, g.x0, 0, g.W - g.x0, g.H, 600, 7, 0.05); c.strokeStyle = 'rgba(214,178,97,.35)'; c.lineWidth = 0.3; c.strokeRect(g.x0 + a, a, g.W - g.x0 - 2 * a, g.H - 2 * a);
        c.strokeStyle = '#d6b261'; c.lineWidth = 0.4; c.beginPath(); c.moveTo(g.cx, g.H * 0.22); c.lineTo(g.cx, g.H * 0.4); c.moveTo(g.cx, g.H * 0.64); c.lineTo(g.cx, g.H * 0.78); c.stroke(); H.circle(c, g.cx, g.H * 0.22, 0.9, '#d6b261'); H.circle(c, g.cx, g.H * 0.78, 0.9, '#d6b261');
      },
      text: function (g) { g = K.safe(g);
        var T = g.get('ctitle', 'Випуск'), S = g.get('csub', 'випускний альбом'), c = g.ctx; if (!c) return;
        g.tx('ctitle', T, g.cx, g.H * 0.5, g.H * 0.075, cat(g) * 0.8, 'Prata', '#f1ece2', '400', 'center', 0.28, 'upper');
        g.tx('csub', S, g.cx, g.H * 0.555, g.H * 0.026, cat(g) * 0.7, 'Cormorant Garamond', '#d6b261', 'italic 500', 'center', 0.1, 'as');
        g.tx('year', g.year, g.cx, g.H * 0.61, g.H * 0.026, cat(g) * 0.4, 'Prata', '#d6b261', '400', 'center', 0.5, 'as');
        g.tx('name', g.owner, g.cx, g.H * 0.86, g.H * 0.024, cat(g) * 0.7, 'Prata', '#e9e3d6', '400', 'center', 0.3, 'upper');
        g.tx('inst', g.inst, g.cx, g.H * 0.895, g.H * 0.018, cat(g) * 0.7, 'Cormorant Garamond', '#a9a49a', '500', 'center', 0.2, 'upper');
      }
    },
    {
      id: 'min-lookbook', grp: G3, name: 'Фото-лукбук', note: 'Світле тло, тонкий розріджений заголовок і велике горизонтальне фото з полями', cats: SCH, photo: true, bg: '#f4f2ee', fonts: ['Montserrat'],
      prf: function (f) { var m = f.sb * 1.1; return K.rectM(f, { x: f.x0 + m, y: f.H * 0.2, w: f.x1 - f.x0 - 2 * m, h: f.H * 0.62 }); },
      text: function (g) { g = K.safe(g);
        var T = g.get('ctitle', 'Альбом'), S = g.get('csub', 'випуск'), c = g.ctx; if (!c) return; var L = g.x0 + g.sb * 1.1, R = g.W - g.sb * 1.1;
        g.tx('ctitle', T, g.cx, g.H * 0.125, g.H * 0.06, cat(g) * 0.8, 'Montserrat', '#1a1a1a', '300', 'center', 0.55, 'upper');
        g.tx('csub', S, g.cx, g.H * 0.16, g.H * 0.014, cat(g) * 0.5, 'Montserrat', '#6e6b66', '400', 'center', 0.5, 'upper');
        g.tx('year', g.year, L, g.H * 0.875, g.H * 0.02, cat(g) * 0.3, 'Montserrat', '#1a1a1a', '500', 'left', 0.2, 'as');
        g.tx('name', g.owner, R, g.H * 0.875, g.H * 0.02, cat(g) * 0.5, 'Montserrat', '#1a1a1a', '500', 'right', 0.24, 'upper');
        g.tx('inst', g.inst, R, g.H * 0.905, g.H * 0.015, cat(g) * 0.5, 'Montserrat', '#77746e', '400', 'right', 0.08, 'as');
      }
    },
    {
      id: 'soft-botanic', grp: G4, name: 'Оливкова гілка', note: 'Кремове тло, тонка лінійна оливкова гілка зверху й курсивний заголовок', cats: null, photo: false, bg: ['#f7f3ea', '#f0ebdf'], fonts: ['Cormorant Garamond'],
      deco: function (g) {
        var c = g.ctx, x0 = g.x0, w = g.W - x0; c.save(); c.beginPath(); c.rect(x0, 0, w, g.H); c.clip(); K.grain(c, x0, 0, w, g.H, 500, 8, 0.04);
        K.olive(c, g.W - g.sb * 0.4, g.sb * 0.5, g.H * 0.4, Math.PI * 0.66, '#6b7a5c', 0.4, 10);
        K.olive(c, x0 + g.sb * 0.4, g.H * 0.99, g.H * 0.32, -Math.PI * 0.3, '#8a9778', 0.35, 8, true);
        c.restore();
      },
      text: function (g) { g = K.safe(g);
        var T = g.get('ctitle', 'Випуск'), S = g.get('csub', 'випускний альбом'), c = g.ctx; if (!c) return;
        g.tx('ctitle', T, g.cx, g.H * 0.5, g.H * 0.115, cat(g) * 0.8, 'Cormorant Garamond', '#3d4636', 'italic 500', 'center', 0.02, 'as');
        g.tx('csub', S, g.cx, g.H * 0.565, g.H * 0.022, cat(g) * 0.7, 'Cormorant Garamond', '#6b7a5c', '600', 'center', 0.5, 'upper');
        g.tx('year', g.year, g.cx, g.H * 0.625, g.H * 0.03, cat(g) * 0.4, 'Cormorant Garamond', '#3d4636', '500', 'center', 0.5, 'as');
        g.tx('name', g.owner, g.cx, g.H * 0.82, g.H * 0.03, cat(g) * 0.7, 'Cormorant Garamond', '#3d4636', '600', 'center', 0.34, 'upper');
        g.tx('inst', g.inst, g.cx, g.H * 0.86, g.H * 0.024, cat(g) * 0.7, 'Cormorant Garamond', '#7b8570', 'italic 500', 'center', 0.06, 'as');
      }
    },
    {
      id: 'soft-monogram', grp: G4, name: 'Монограма у вінку', note: 'Велика каліграфічна літера в тонкому лавровому вінку, розріджений підпис під нею', cats: SCH, photo: false, bg: ['#f3efe7', '#ece7dd'], fonts: ['Great Vibes', 'Cormorant Garamond'],
      deco: function (g) {
        var c = g.ctx; K.grain(c, g.x0, 0, g.W - g.x0, g.H, 500, 9, 0.04); K.wreath(c, g.cx, g.H * 0.4, g.H * 0.215, '#7a8869', 0.4, 14, 0.5);
        c.strokeStyle = '#b9a073'; c.lineWidth = 0.3; c.beginPath(); c.arc(g.cx, g.H * 0.4, g.H * 0.145, 0, Math.PI * 2); c.stroke();
      },
      text: function (g) { g = K.safe(g);
        var T = g.get('ctitle', 'В'), S = g.get('csub', 'випускний альбом'), c = g.ctx; if (!c) return;
        g.tx('ctitle', T, g.cx, g.H * 0.475, g.H * 0.26, cat(g) * 0.2, 'Great Vibes', '#3d4636', '400', 'center', 0, 'as');
        g.tx('csub', S, g.cx, g.H * 0.74, g.H * 0.027, cat(g) * 0.8, 'Cormorant Garamond', '#6b7a5c', '600', 'center', 0.5, 'upper');
        g.tx('year', g.year, g.cx, g.H * 0.785, g.H * 0.026, cat(g) * 0.4, 'Cormorant Garamond', '#a98e58', '600', 'center', 0.5, 'as');
        g.tx('name', g.owner, g.cx, g.H * 0.875, g.H * 0.03, cat(g) * 0.7, 'Cormorant Garamond', '#3d4636', '600', 'center', 0.34, 'upper');
        g.tx('inst', g.inst, g.cx, g.H * 0.912, g.H * 0.022, cat(g) * 0.8, 'Cormorant Garamond', '#7b8570', 'italic 500', 'center', 0.06, 'as');
      }
    },
    {
      id: 'sch-chalk', grp: G5, name: 'Шкільна дошка', note: 'Чорно-зелена крейдяна дошка в дерев\'яній рамі, формули й малюнки крейдою, великий клас', cats: ['grade4', 'grade9', 'grade11'], photo: false, bg: ['#34423c', '#2a3631'], fonts: ['Amatic SC', 'Caveat'],
      deco: function (g) {
        var c = g.ctx, x0 = g.x0, W = g.W, h = g.H, f = Math.max(g.sb * 0.75, 7); H.wash(c, g.cx - 20, h * 0.3, 90, '255,255,255', 0.07); H.wash(c, g.cx + 30, h * 0.75, 80, '255,255,255', 0.05);
        var ch = 'rgba(244,242,235,.85)';
        K.chalkCircle(c, x0 + f + 26, h * 0.2, 11, 4.4, 0.5, ch, 0.5, 1); K.chalkCircle(c, x0 + f + 26, h * 0.2, 11, 4.4, -0.5, ch, 0.5, 2); K.chalkCircle(c, x0 + f + 26, h * 0.2, 11, 4.4, 1.57, ch, 0.5, 3); H.circle(c, x0 + f + 26, h * 0.2, 1.6, ch);
        K.chalk(c, [[W - f - 48, h * 0.26], [W - f - 14, h * 0.26], [W - f - 48, h * 0.12], [W - f - 48, h * 0.26]], ch, 0.55, 4, 3);
        K.chalk(c, [[W - f - 48, h * 0.245], [W - f - 43, h * 0.245], [W - f - 43, h * 0.26]], ch, 0.4, 5, 2);
        K.chalk(c, [[x0 + f + 8, h * 0.62], [x0 + f + 62, h * 0.62]], ch, 0.6, 6, 3); K.chalk(c, [[g.cx - 40, h * 0.585], [g.cx + 46, h * 0.59]], ch, 0.55, 7, 3);
        [[W - f - 20, h * 0.7, 3.2], [x0 + f + 16, h * 0.47, 2.4], [W - f - 40, h * 0.5, 2]].forEach(function (s) { var pts = []; for (var i = 0; i <= 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? s[2] * 0.45 : s[2]; pts.push([s[0] + Math.cos(a) * rr, s[1] + Math.sin(a) * rr]); } K.chalk(c, pts, ch, 0.45, 8, 2); });
        K.chalk(c, [[x0 + f + 12, h * 0.8], [x0 + f + 28, h * 0.74], [x0 + f + 28, h * 0.8], [x0 + f + 12, h * 0.8]], ch, 0.5, 9, 2);
        c.save(); c.lineWidth = f; c.strokeStyle = '#8a5a34'; c.strokeRect(x0 + f / 2, f / 2, W - x0 - f, h - f); c.lineWidth = 0.3;
        var r = H.rnd(12); for (var i = 0; i < 160; i++) { var edge = i % 4, t = r(); c.strokeStyle = 'rgba(60,30,10,' + (0.15 + r() * 0.3) + ')'; c.beginPath(); if (edge === 0) { c.moveTo(x0 + t * (W - x0), r() * f); c.lineTo(x0 + t * (W - x0) + 8 + r() * 14, r() * f); } else if (edge === 1) { c.moveTo(x0 + t * (W - x0), h - r() * f); c.lineTo(x0 + t * (W - x0) + 8 + r() * 14, h - r() * f); } else if (edge === 2) { c.moveTo(x0 + r() * f, t * h); c.lineTo(x0 + r() * f, t * h + 8 + r() * 14); } else { c.moveTo(W - r() * f, t * h); c.lineTo(W - r() * f, t * h + 8 + r() * 14); } c.stroke(); }
        c.strokeStyle = 'rgba(255,230,190,.35)'; c.lineWidth = 0.4; c.strokeRect(x0 + 0.5, 0.5, W - x0 - 1, h - 1); c.strokeStyle = 'rgba(0,0,0,.35)'; c.strokeRect(x0 + f, f, W - x0 - 2 * f, h - 2 * f); c.restore();
      },
      text: function (g) { g = K.safe(g);
        var T = g.get('ctitle', '11-А'), S = g.get('csub', 'випускний клас'), c = g.ctx; if (!c) return; var ch = '#f4f2eb';
        c.save(); c.shadowColor = 'rgba(255,255,255,.35)'; c.shadowBlur = 1.2;
        g.tx('csub', S, g.cx, g.H * 0.285, g.H * 0.062, cat(g) * 0.6, 'Amatic SC', ch, '700', 'center', 0.12, 'upper');
        g.tx('ctitle', T, g.cx, g.H * 0.54, g.H * 0.25, cat(g) * 0.7, 'Amatic SC', ch, '700', 'center', 0.02, 'upper');
        g.tx('year', g.year, g.cx, g.H * 0.69, g.H * 0.085, cat(g) * 0.6, 'Amatic SC', '#f6d98a', '700', 'center', 0.1, 'as');
        g.tx('name', g.owner, g.cx, g.H * 0.8, g.H * 0.06, cat(g) * 0.7, 'Caveat', ch, '700', 'center', 0.02, 'as');
        g.tx('inst', g.inst, g.cx, g.H * 0.855, g.H * 0.042, cat(g) * 0.7, 'Caveat', '#cdd5cf', '400', 'center', 0.02, 'as');
        c.restore();
      }
    },
    {
      id: 'sch-class', grp: G5, name: 'Табличка «11-А»', note: 'Світла дерев\'яна підлога-стіна, велика цифра класу з буквою й тонка рамка, строга шкільна класика', cats: ['grade4', 'grade9', 'grade11'], photo: false, bg: '#d9d2c6', fonts: ['Old Standard TT', 'Cormorant Garamond'],
      deco: function (g) {
        var c = g.ctx, x0 = g.x0, W = g.W, h = g.H; c.save(); c.beginPath(); c.rect(x0, 0, W - x0, h); c.clip(); K.planks(c, x0, W, h, ['#d8d0c3', '#d1c8ba', '#dcd5c9', '#cec5b6'], 38, 7, 'rgba(110,90,60,.22)');
        var a = g.sb * 0.8; c.strokeStyle = 'rgba(60,45,30,.7)'; c.lineWidth = 0.6; c.strokeRect(x0 + a, a, W - x0 - 2 * a, h - 2 * a); c.lineWidth = 0.25; c.strokeRect(x0 + a + 2, a + 2, W - x0 - 2 * a - 4, h - 2 * a - 4); c.restore();
        c.fillStyle = 'rgba(244,238,228,.82)'; c.fillRect(g.cx - cat(g) * 0.36, h * 0.17, cat(g) * 0.72, h * 0.66);
      },
      text: function (g) { g = K.safe(g);
        var T = g.get('ctitle', '11-А'), S = g.get('csub', 'клас'), c = g.ctx; if (!c) return; var ink = '#2c2620';
        g.tx('inst', g.inst, g.cx, g.H * 0.235, g.H * 0.034, cat(g) * 0.66, 'Old Standard TT', ink, '700', 'center', 0.14, 'upper');
        H.line(c, g.cx - 22, K.map(g, g.H * 0.28), g.cx + 22, K.map(g, g.H * 0.28), '#6d5d49', 0.35); H.circle(c, g.cx, K.map(g, g.H * 0.28), 1.1, '#6d5d49');
        c.save(); c.shadowColor = 'rgba(255,255,255,.7)'; c.shadowOffsetY = 0.8; c.shadowBlur = 0;
        g.tx('ctitle', T, g.cx, g.H * 0.52, g.H * 0.26, cat(g) * 0.66, 'Old Standard TT', ink, '700', 'center', 0.02, 'upper'); c.restore();
        g.tx('csub', S, g.cx, g.H * 0.6, g.H * 0.05, cat(g) * 0.66, 'Old Standard TT', ink, '700', 'center', 0.5, 'upper');
        H.line(c, g.cx - 22, K.map(g, g.H * 0.65), g.cx + 22, K.map(g, g.H * 0.65), '#6d5d49', 0.35); H.circle(c, g.cx, K.map(g, g.H * 0.65), 1.1, '#6d5d49');
        g.tx('year', g.year, g.cx, g.H * 0.72, g.H * 0.052, cat(g) * 0.5, 'Old Standard TT', ink, '700', 'center', 0.18, 'as');
        g.tx('name', g.owner, g.cx, g.H * 0.775, g.H * 0.026, cat(g) * 0.66, 'Cormorant Garamond', '#4a4036', '700', 'center', 0.3, 'upper');
      }
    },
    {
      id: 'kid-balloon', grp: G5, name: 'Повітряна куля', note: 'Для садочка й початкової школи: кругле фото-«куля» з кошиком і хмаринками, акварельне небо', cats: ['kindergarten', 'grade4'], photo: true, shape: 'circle', bg: ['#fdf5e4', '#e4f1f3'], fonts: ['Pangolin', 'Marmelad'],
      prf: function (f) { var d = f.H * 0.46; return K.rectM(f, { x: f.cx - d / 2, y: f.H * 0.1, w: d, h: d }); },
      deco: function (g) {
        var c = g.ctx, p = g.ph, x0 = g.x0, W = g.W, h = g.H, r0 = p.w / 2, cx = p.x + r0, cy = p.y + r0, cols = ['#ef6c57', '#f7b733', '#5fb36b', '#4a9fe0', '#a066c9', '#f27da5'];
        H.wash(c, x0 + 10, h * 0.15, 70, '255,214,150', 0.38); H.wash(c, W - 6, h * 0.5, 80, '190,226,236', 0.55); H.wash(c, x0 + 40, h * 0.88, 80, '215,236,190', 0.45); H.wash(c, W - 30, h * 0.92, 70, '255,205,205', 0.4);
        var cloud = function (x, y, s, col) { H.circle(c, x, y, s, col); H.circle(c, x + s * 1.1, y + s * 0.2, s * 0.8, col); H.circle(c, x - s * 1.1, y + s * 0.25, s * 0.7, col); c.fillStyle = col; c.fillRect(x - s * 1.1, y + s * 0.2, s * 2.2, s * 0.8); };
        cloud(x0 + 28, h * 0.2, 6, 'rgba(255,255,255,.85)'); cloud(W - 30, h * 0.34, 7, 'rgba(255,255,255,.8)'); cloud(x0 + 24, h * 0.6, 5, 'rgba(255,255,255,.75)');
        // кольорове кільце-«оболонка» кулі
        for (var i = 0; i < 12; i++) { c.beginPath(); c.arc(cx, cy, r0 + 3.4, i * Math.PI / 6, (i + 1) * Math.PI / 6); c.strokeStyle = cols[i % cols.length]; c.lineWidth = 5; c.stroke(); }
        // линви й кошик
        var by = p.y + p.h + h * 0.07; c.strokeStyle = '#8a6b48'; c.lineWidth = 0.4; [-0.5, -0.17, 0.17, 0.5].forEach(function (k) { c.beginPath(); c.moveTo(cx + Math.sin(k * 1.2) * (r0 + 3), cy + Math.cos(k * 1.2) * (r0 + 3)); c.lineTo(cx + k * 18, by); c.stroke(); });
        c.fillStyle = '#c4894f'; H.rr(c, cx - 11, by, 22, 13, 2); c.fill(); c.strokeStyle = 'rgba(90,55,25,.55)'; c.lineWidth = 0.3; for (var j = 1; j < 5; j++) { H.line(c, cx - 11 + j * 4.4, by + 1, cx - 11 + j * 4.4, by + 12, 'rgba(90,55,25,.5)', 0.3); } H.line(c, cx - 11, by + 6, cx + 11, by + 6, 'rgba(90,55,25,.5)', 0.3);
        [[x0 + 70, h * 0.12], [W - 24, h * 0.15], [x0 + 22, h * 0.42]].forEach(function (b) { c.strokeStyle = '#6a8794'; c.lineWidth = 0.45; c.beginPath(); c.moveTo(b[0] - 3, b[1] + 1); c.quadraticCurveTo(b[0] - 1.5, b[1] - 2, b[0], b[1]); c.quadraticCurveTo(b[0] + 1.5, b[1] - 2, b[0] + 3, b[1] + 1); c.stroke(); });
        H.star(c, W - 20, h * 0.58, 3.5, '#f7b733'); H.star(c, x0 + 20, h * 0.35, 2.6, '#f27da5'); H.star(c, W - 58, h * 0.07, 2.4, '#4a9fe0');
      },
      text: function (g) { g = K.safe(g);
        var T = g.get('ctitle', 'Мій садочок'), S = g.get('csub', 'випускний альбом'), c = g.ctx; if (!c) return;
        g.tx('ctitle', T, g.cx, g.H * 0.8, g.H * 0.07, cat(g) * 0.84, 'Pangolin', '#e0642f', '400', 'center', 0.01, 'as');
        g.tx('csub', S, g.cx, g.H * 0.845, g.H * 0.026, cat(g) * 0.7, 'Marmelad', '#5c8f6a', '400', 'center', 0.15, 'as');
        g.tx('year', g.year, g.cx, g.H * 0.895, g.H * 0.04, cat(g) * 0.4, 'Pangolin', '#3d7ea6', '400', 'center', 0.1, 'as');
        g.tx('name', g.owner, g.cx, g.H * 0.935, g.H * 0.03, cat(g) * 0.8, 'Marmelad', '#5a4a3a', '400', 'center', 0.06, 'as');
        g.tx('inst', g.inst, g.cx, g.H * 0.97, g.H * 0.022, cat(g) * 0.8, 'Marmelad', '#8a7a68', '400', 'center', 0.05, 'as');
      }
    }
  ];
  V.forEach(function (v) { CV.VARIANTS.push(v); });
})(typeof self !== 'undefined' ? self : this);
