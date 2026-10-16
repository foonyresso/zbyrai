// Геометрія розворотів у мм: сітка портретів, групові фото, вчителі, обкладинка, перший розворот. Без DOM.
(function (root) {
  function rng(seed) {
    var a = seed >>> 0;
    return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  var KS = [8, 12, 16, 32];
  // Найкраще k: мінімум порожніх вікон; за рівності віддаємо 2 розвороти (16 → 2×8, 24 → 2×12).
  function autoK(n) {
    var best = 8, bs = Infinity;
    KS.forEach(function (k) {
      var sp = Math.max(1, Math.ceil(n / k)), s = (sp * k - n) + Math.abs(sp - 2) * 0.5;
      if (s < bs - 1e-9) { bs = s; best = k; }
    });
    return best;
  }
  // Підбір cols×rows так, щоб комірка була близька до aspect (ширина/висота).
  function gridFor(n, W, H, aspect) {
    var best = { cols: n, rows: 1 }, bs = Infinity;
    for (var c = 1; c <= n; c++) {
      if (n % c) continue;
      var r = n / c, d = Math.abs(Math.log((W / c) / (H / r) / aspect));
      if (d < bs) { bs = d; best = { cols: c, rows: r }; }
    }
    return best;
  }
  function gridRects(cols, rows, area, gap) {
    var cw = (area.w - gap * (cols - 1)) / cols, ch = (area.h - gap * (rows - 1)) / rows, out = [];
    for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) out.push({ x: area.x + c * (cw + gap), y: area.y + r * (ch + gap), w: cw, h: ch });
    return out;
  }
  function portraitSlots(k, W, H, gap) {
    var g = gridFor(k, W, H, 0.8);
    return gridRects(g.cols, g.rows, { x: 0, y: 0, w: W, h: H }, gap);
  }
  function split(r, n, gap, rand, out) {
    if (n === 1) { out.push(r); return; }
    var k = 1 + Math.floor(rand() * (n - 1)), ratio = Math.min(0.78, Math.max(0.22, k / n + (rand() - 0.5) * 0.16));
    if (r.w >= r.h) {
      var w1 = (r.w - gap) * ratio;
      split({ x: r.x, y: r.y, w: w1, h: r.h }, k, gap, rand, out);
      split({ x: r.x + w1 + gap, y: r.y, w: r.w - w1 - gap, h: r.h }, n - k, gap, rand, out);
    } else {
      var h1 = (r.h - gap) * ratio;
      split({ x: r.x, y: r.y, w: r.w, h: h1 }, k, gap, rand, out);
      split({ x: r.x, y: r.y + h1 + gap, w: r.w, h: r.h - h1 - gap }, n - k, gap, rand, out);
    }
  }
  function groupSlots(n, W, H, gap, margin, seed) {
    var out = [];
    if (n > 0) split({ x: margin, y: margin, w: W - 2 * margin, h: H - 2 * margin }, n, gap, rng(seed || 1), out);
    return out;
  }
  // Вчителі: вікна фото зі смугою під підпис (capH мм) в області лівої сторінки першого розвороту.
  function teacherSlots(n, W, H) {
    var area = { x: W * 0.04, y: H * 0.07, w: W * 0.43, h: H * 0.74 }, capH = Math.max(9, H * 0.075), gap = 3;
    if (n <= 0) return [];
    var best = { cols: n, rows: 1 }, bs = Infinity;
    for (var c = 1; c <= n; c++) {
      var r = Math.ceil(n / c), cw = (area.w - gap * (c - 1)) / c, ch = (area.h - gap * (r - 1)) / r, d = Math.abs(Math.log(cw / ch / 0.72)) + (c * r - n) * 0.15;
      if (d < bs) { bs = d; best = { cols: c, rows: r }; }
    }
    var cells = gridRects(best.cols, best.rows, area, gap), out = [];
    for (var i = 0; i < n; i++) { var q = cells[i]; out.push({ photo: { x: q.x, y: q.y, w: q.w, h: q.h - capH }, cap: { x: q.x, y: q.y + q.h - capH, w: q.w, h: capH } }); }
    return out;
  }
  function coverLayout(W, H) {
    return { photo: { x: W * 0.64, y: 0, w: W * 0.28, h: H * 0.94 }, year: { x: W * 0.93, y: H * 0.8, size: H * 0.24 }, name: { x: W * 0.78, y: H * 0.955 } };
  }
  function firstLayout(W, H) {
    return { group: { x: 0, y: H * 0.07, w: W * 0.49, h: H * 0.74 }, portrait: { x: W * 0.56, y: 0, w: W * 0.36, h: H }, text: { x: W * 0.245, y: H * 0.9 } };
  }
  var api = { rng: rng, autoK: autoK, gridFor: gridFor, portraitSlots: portraitSlots, groupSlots: groupSlots, teacherSlots: teacherSlots, coverLayout: coverLayout, firstLayout: firstLayout, KS: KS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.AlbumLayout = api;
})(typeof self !== 'undefined' ? self : this);
