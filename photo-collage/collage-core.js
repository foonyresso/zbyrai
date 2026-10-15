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

  // Режими розкладки: ключ -> назва.
  var MODES = { tree: 'Мозаїка (випадкові розрізи)', rows: 'Рядки', columns: 'Стовпці', grid: 'Сітка', hero: 'Одне велике + решта' };

  // Перемішаний ряд індексів 0..n-1 (детерміновано від rand).
  function shuffled(n, rand) {
    var a = [], i, j, t;
    for (i = 0; i < n; i++) a.push(i);
    for (i = n - 1; i > 0; i--) { j = Math.floor(rand() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  // Рядки з однаковою шириною: фото в рядку мають висоту за пропорціями, рядки розтягнуті на всю висоту прямокутника.
  // asp[k] = ширина/висота k-го фото у порядку розкладки. Повертає комірки у тому ж порядку.
  function rowsRect(asp, r, gap, rowsCount) {
    var n = asp.length, rows = Math.max(1, Math.min(n, rowsCount || 1)), out = new Array(n), k = 0, i, j;
    var groups = [];
    for (i = 0; i < rows; i++) {
      var take = Math.floor(n / rows) + (i < n % rows ? 1 : 0);
      groups.push(asp.slice(k, k + take).map(function (a, q) { return { a: Math.max(0.2, a), idx: k + q }; })); k += take;
    }
    var nat = groups.map(function (g) {
      var sum = 0; g.forEach(function (c) { sum += c.a; });
      return (r.w - (g.length - 1) * gap) / sum;       // природна висота рядка
    });
    var totalNat = 0; nat.forEach(function (h) { totalNat += h; });
    var availH = r.h - (rows - 1) * gap, y = r.y;
    for (i = 0; i < rows; i++) {
      var g = groups[i], h = i === rows - 1 ? r.y + r.h - y : Math.round(availH * nat[i] / totalNat), x = r.x, sum = 0;
      g.forEach(function (c) { sum += c.a; });
      var availW = r.w - (g.length - 1) * gap;
      for (j = 0; j < g.length; j++) {
        var w = j === g.length - 1 ? r.x + r.w - x : Math.round(availW * g[j].a / sum);
        out[g[j].idx] = { x: x, y: y, w: w, h: h };
        x += w + gap;
      }
      y += h + gap;
    }
    return out;
  }

  function bestRows(asp, r, gap) {
    var n = asp.length, sum = 0; asp.forEach(function (a) { sum += a; });
    var avg = sum / n, guess = Math.round(Math.sqrt(n * r.h * avg / r.w));
    return Math.max(1, Math.min(n, guess || 1));
  }

  function gridRect(n, r, gap) {
    var cols = Math.max(1, Math.round(Math.sqrt(n * r.w / Math.max(1, r.h)))), rows = Math.ceil(n / cols);
    cols = Math.ceil(n / rows);
    var out = [], y = r.y, i = 0;
    for (var ro = 0; ro < rows; ro++) {
      var inRow = ro === rows - 1 ? n - i : Math.min(cols, n - i), h = ro === rows - 1 ? r.y + r.h - y : Math.round((r.h - (rows - 1) * gap) / rows), x = r.x, availW = r.w - (inRow - 1) * gap;
      for (var c = 0; c < inRow; c++) {
        var w = c === inRow - 1 ? r.x + r.w - x : Math.round(availW / inRow);
        out.push({ x: x, y: y, w: w, h: h }); x += w + gap;
      }
      i += inRow; y += h + gap;
    }
    return out;
  }

  // Розкладка n фото на полотні W×H. Повертає n комірок {x,y,w,h}, що не перекриваються.
  // mode: tree (за замовчуванням), rows, columns, grid, hero. aspects[i] = ширина/висота i-го фото (для rows, columns, hero).
  function layout(n, W, H, gap, seed, mode, aspects) {
    var out = [];
    if (n < 1) return out;
    var rand = rng(seed);
    gap = Math.max(0, gap | 0);
    var rect = { x: gap, y: gap, w: W - 2 * gap, h: H - 2 * gap };
    mode = MODES[mode] ? mode : 'tree';
    var asp = [], i;
    for (i = 0; i < n; i++) asp.push(aspects && aspects[i] > 0 ? aspects[i] : 1);
    if (mode === 'tree') {
      splitRect(rect, n, gap, rand, out);
      // перемішуємо, щоб фото потрапляли в різні комірки
      for (i = out.length - 1; i > 0; i--) {
        var j = Math.floor(rand() * (i + 1)), t = out[i]; out[i] = out[j]; out[j] = t;
      }
      return out;
    }
    var perm = shuffled(n, rand), cells;
    if (mode === 'rows' || mode === 'columns') {
      var seq = perm.map(function (p) { return asp[p]; });
      if (mode === 'rows') cells = rowsRect(seq, rect, gap, bestRows(seq, rect, gap));
      else {
        var tr = rowsRect(seq.map(function (a) { return 1 / a; }), { x: rect.y, y: rect.x, w: rect.h, h: rect.w }, gap, bestRows(seq.map(function (a) { return 1 / a; }), { x: rect.y, y: rect.x, w: rect.h, h: rect.w }, gap));
        cells = tr.map(function (c) { return { x: c.y, y: c.x, w: c.h, h: c.w }; });
      }
    } else if (mode === 'grid') {
      cells = gridRect(n, rect, gap);
    } else { // hero: одне велике зліва/зверху, решта сіткою
      if (n === 1) cells = [rect];
      else if (rect.w >= rect.h) {
        var hw = Math.round((rect.w - gap) * 0.6);
        cells = [{ x: rect.x, y: rect.y, w: hw, h: rect.h }].concat(gridRect(n - 1, { x: rect.x + hw + gap, y: rect.y, w: rect.w - hw - gap, h: rect.h }, gap));
      } else {
        var hh = Math.round((rect.h - gap) * 0.6);
        cells = [{ x: rect.x, y: rect.y, w: rect.w, h: hh }].concat(gridRect(n - 1, { x: rect.x, y: rect.y + hh + gap, w: rect.w, h: rect.h - hh - gap }, gap));
      }
    }
    out = new Array(n);
    for (i = 0; i < n; i++) out[perm[i]] = cells[i];
    return out;
  }

  // Ділянка джерела (sx,sy,sw,sh), що заповнює комірку (як object-fit: cover).
  // zoom >= 1 додатково наближає; fx, fy (0..1) зсувають кадр по вільному місцю (0.5 = по центру).
  function coverCrop(iw, ih, cw, ch, zoom, fx, fy) {
    zoom = Math.max(1, zoom || 1); fx = fx == null ? 0.5 : Math.min(1, Math.max(0, fx)); fy = fy == null ? 0.5 : Math.min(1, Math.max(0, fy));
    var s = Math.max(cw / iw, ch / ih) * zoom, sw = cw / s, sh = ch / s;
    return { sx: (iw - sw) * fx, sy: (ih - sh) * fy, sw: sw, sh: sh };
  }

  var PRESETS = {
    '1:1': [2000, 2000], '4:3': [2400, 1800], '3:4': [1800, 2400], '16:9': [2560, 1440], '9:16': [1440, 2560], '3:2': [2400, 1600]
  };

  var api = { rng: rng, layout: layout, coverCrop: coverCrop, PRESETS: PRESETS, MODES: MODES };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.CollageCore = api;
})(typeof self !== 'undefined' ? self : this);
