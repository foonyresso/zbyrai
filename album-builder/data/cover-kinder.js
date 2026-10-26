// Обкладинка «Садочок: малюнки олівцями» (за макетом автора cover_6): фон-малюнок assets/kinder-cover.jpg (текст прибрано), написи редаговані.
// Малюнок на весь розворот (cover-fit, ліва половина — задня, права — передня); заголовок із чотирьох слів: кожне слово має свій колір.
// Шрифт заголовка — Pudelinka (файл автора, fonts/pudelinka.ttf); його можна замінити в FONT нижче.
(function (root) {
  var CV = root.AlbumCoverVariants || (typeof require !== 'undefined' ? require('./cover-variants.js') : null);
  var FONT = 'Pudelinka', IMG_SRC = './assets/kinder-cover.jpg', IW = 3600, IH = 2526, BG = '#f6f6f6';
  // Позиції написів у частках зображення (виміряно за макетом): центр блоку, базова лінія, розмір (частка висоти), колір
  var LINES = [{ x: 0.628, y: 0.190, s: 0.085, c: '#e8341f' }, { x: 0.628, y: 0.249, s: 0.085, c: '#f08a2a' }, { x: 0.628, y: 0.298, s: 0.062, c: '#6f9bdc' }, { x: 0.628, y: 0.358, s: 0.066, c: '#a054bd' }];
  var img = null;
  function load() {
    if (img || typeof Image === 'undefined') return img;
    img = new Image(); img.onload = function () { if (root.dispatchEvent && typeof Event !== 'undefined') root.dispatchEvent(new Event('album-asset')); }; img.src = IMG_SRC; return img;
  }
  load();
  // Малюнок не розтягується під формат: кожна половина (задня й передня) стоїть по центру своєї сторінки, масштаб за висотою (або шириною, якщо не влізає)
  function fit(W, H) { var s = Math.min(H / IH, W / IW), hw = IW * s / 2; return { s: s, oy: (H - IH * s) / 2, lx: (W / 2 - hw) / 2, rx: W / 2 + (W / 2 - hw) / 2, hw: hw }; }
  var V = [{
    id: 'kg-crayon', grp: 'Шкільні й дитячі', name: 'Садочок: олівцями', note: 'Малюнки кольоровими олівцями: сонце, райдуга, ракета, будиночок; без фото, спільна обкладинка', cats: ['kindergarten'], photo: false, general: true, bg: BG, fonts: [FONT],
    deco: function (g) { var im = load(); if (!im || !im.complete || !im.naturalWidth) return; var f = fit(g.W, g.H); var c = g.ctx, hw = IW / 2; c.drawImage(im, 0, 0, hw, IH, f.lx, f.oy, f.hw, IH * f.s); c.drawImage(im, hw, 0, hw, IH, f.rx, f.oy, f.hw, IH * f.s); },
    text: function (g) {
      var f = fit(g.W, g.H), words = String(g.get('ctitle', 'Наш Любимий дитячий садок')).normalize('NFC').trim().split(/\s+/).filter(Boolean);
      if (words.length > 4) words = words.slice(0, 3).concat(words.slice(3).join(' '));
      words.forEach(function (w, i) {
        var L = LINES[i], x = f.rx + (L.x - 0.5) * IW * f.s, y = f.oy + L.y * IH * f.s, sz = L.s * IH * f.s;
        g.tx('ctitle' + (i + 1), w, x, y, sz, IW * f.s * 0.2, FONT, L.c, '400', 'center', 0, 'as');
      });
      g.tx('csub', g.get('csub', ''), f.rx + 0.128 * IW * f.s, f.oy + 0.43 * IH * f.s, 0.03 * IH * f.s, IW * f.s * 0.2, FONT, '#a054bd', '400', 'center', 0.02, 'as');
    }
  }];
  V.forEach(function (v) { CV.VARIANTS.push(v); });
  CV.KINDER = { fit: fit, IW: IW, IH: IH };
})(typeof self !== 'undefined' ? self : this);
