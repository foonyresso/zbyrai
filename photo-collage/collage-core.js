// Колаж фото: логіка без DOM (розкладка, обрізання, зерно). Підключається і в браузері, і в Node-тестах.
(function (root) {
  // Детермінований генератор випадкових чисел із зерна.
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Ділить прямокутник на n комірок рекурсивним розрізанням; gap — проміжок між комірками.
  function splitRect(r, n, gap, rand, out) {
    if (n === 1) { out.push({ x: r.x, y: r.y, w: r.w, h: r.h }); return; }
    var k = 1 + Math.floor(rand() * (n - 1));          // скільки фото в першій частині
    var ratio = k / n + (rand() - 0.5) * 0.18;         // частка площі, з невеликим розкидом
    ratio = Math.min(0.8, Math.max(0.2, ratio));
    if (r.w >= r.h) {
      var w1 = Math.round((r.w - gap) * ratio);
      splitRect({ x: r.x, y: r.y, w: w1, h: r.h }, k, gap, rand, out);
      splitRect({ x: r.x + w1 + gap, y: r.y, w: r.w - w1 - gap, h: r.h }, n - k, gap, rand, out);
    } else {
      var h1 = Math.round((r.h - gap) * ratio);
      splitRect({ x: r.x, y: r.y, w: r.w, h: h1 }, k, gap, rand, out);
      splitRect({ x: r.x, y: r.y + h1 + gap, w: r.w, h: r.h - h1 - gap }, n - k, gap, rand, out);
    }
  }

  // Розкладка n фото на полотні W×H. Повертає n комірок {x,y,w,h}, що не перекриваються.
  function layout(n, W, H, gap, seed) {
    var out = [];
    if (n < 1) return out;
    var rand = rng(seed);
    gap = Math.max(0, gap | 0);
    splitRect({ x: gap, y: gap, w: W - 2 * gap, h: H - 2 * gap }, n, gap, rand, out);
    // перемішуємо, щоб фото потрапляли в різні комірки
    for (var i = out.length - 1; i > 0; i--) {
      var j = Math.floor(rand() * (i + 1)), t = out[i]; out[i] = out[j]; out[j] = t;
    }
    return out;
  }

  // Ділянка джерела (sx,sy,sw,sh), що заповнює комірку з обрізанням по центру (як object-fit: cover).
  function coverCrop(iw, ih, cw, ch) {
    var s = Math.max(cw / iw, ch / ih), sw = cw / s, sh = ch / s;
    return { sx: (iw - sw) / 2, sy: (ih - sh) / 2, sw: sw, sh: sh };
  }

  var PRESETS = {
    '1:1': [2000, 2000], '4:3': [2400, 1800], '3:4': [1800, 2400], '16:9': [2560, 1440], '9:16': [1440, 2560], '3:2': [2400, 1600]
  };

  var api = { rng: rng, layout: layout, coverCrop: coverCrop, PRESETS: PRESETS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.CollageCore = api;
})(typeof self !== 'undefined' ? self : this);
