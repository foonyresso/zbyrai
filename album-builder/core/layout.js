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
  // Рівні ряди: кожен ряд однієї висоти, у ряду фото однакової ширини.
  function rowSlots(n, W, H, gap, margin) {
    var area = { x: margin, y: margin, w: W - 2 * margin, h: H - 2 * margin }, rows = Math.max(1, Math.min(n, Math.round(Math.sqrt(n * area.h / area.w * 1.6)))), out = [], idx = 0;
    var rh = (area.h - gap * (rows - 1)) / rows;
    for (var r = 0; r < rows; r++) {
      var cnt = Math.floor(n / rows) + (r < n % rows ? 1 : 0), cw = (area.w - gap * (cnt - 1)) / cnt;
      for (var c = 0; c < cnt; c++) { out.push({ x: area.x + c * (cw + gap), y: area.y + r * (rh + gap), w: cw, h: rh, i: idx++ }); }
    }
    return out;
  }
  // «Вклеєні в альбом»: фото з білими полями, трохи нахилені, місцями накладаються. rot у радіанах; порядок масиву = порядок малювання.
  function scrapSlots(n, W, H, margin, seed) {
    if (n <= 0) return [];
    var rand = rng((seed || 1) * 7919), area = { x: margin + 6, y: margin + 6, w: W - 2 * margin - 12, h: H - 2 * margin - 12 }, out = [];
    var cols = Math.max(1, Math.min(n, Math.round(Math.sqrt(n * area.w / area.h * 0.8)))), rows = Math.ceil(n / cols), cw = area.w / cols, ch = area.h / rows;
    for (var i = 0; i < n; i++) {
      var r = Math.floor(i / cols), c = i % cols, cnt = r === rows - 1 ? n - r * cols : cols, off = (cols - cnt) * cw / 2;
      var w = cw * (n === 1 ? 0.8 : 1.06), h = ch * (n === 1 ? 0.8 : 1.06);
      var cx = area.x + off + (c + 0.5) * cw + (rand() - 0.5) * cw * 0.12, cy = area.y + (r + 0.5) * ch + (rand() - 0.5) * ch * 0.12;
      out.push({ x: Math.max(2, cx - w / 2), y: Math.max(2, cy - h / 2), w: w, h: h, rot: n === 1 ? 0 : (rand() - 0.5) * 0.13, i: i, z: rand() });
    }
    out.sort(function (a, b) { return a.z - b.z; });
    return out;
  }
  // Групові фото: style = mosaic (за замовчуванням), rows, scrap. Кожен елемент має i — номер фото в списку розвороту.
  function groupSlots(n, W, H, gap, margin, seed, style) {
    if (n <= 0) return [];
    if (style === 'rows') return rowSlots(n, W, H, gap, margin);
    if (style === 'scrap') return scrapSlots(n, W, H, margin, seed);
    var out = []; split({ x: margin, y: margin, w: W - 2 * margin, h: H - 2 * margin }, n, gap, rng(seed || 1), out);
    return out.map(function (r, i) { r.i = i; return r; });
  }
  // Вчителі: фото (висота = asp × ширина) зі смугою під підпис, ряди по центру лівої сторінки. cfg: {rows: [[індекси]], size: % від максимуму, asp, gap}.
  // Повертає масив за номером вчителя: {photo, cap}. Без cfg.rows ряди беруться з teacherRows(n).
  var TEACHER_AREA = { x: 0.04, y: 0.06, w: 0.43, h: 0.74 };
  // Типові ряди для n вчителів: 2 → [2], 3 → [2,1], 4 → [2,2], 5 → [3,2], 6 → [3,3], 7 → [4,3] …
  function teacherRows(n) {
    var rows = [], rest = n, per = n <= 2 ? n : n <= 4 ? 2 : n <= 6 ? 3 : n <= 8 ? 4 : n <= 12 ? 4 : 5, i = 0;
    var cnt = Math.ceil(n / per); per = Math.ceil(n / cnt);
    while (rest > 0) { var c = Math.min(per, rest); rows.push(Array.from({ length: c }, function (_, k) { return i + k; })); i += c; rest -= c; }
    return rows;
  }
  // Усі розумні розбивки n вчителів на 1–3 ряди (для готових варіантів): кожен ряд 1–6, різниця сусідніх рядів не більше 2.
  function teacherPresets(n) {
    var out = [];
    function rec(rest, cur) {
      if (cur.length > 3) return;
      if (!rest) { if (cur.every(function (c, k) { return k === 0 || Math.abs(c - cur[k - 1]) <= 2; })) out.push(cur.slice()); return; }
      for (var c = Math.min(6, rest); c >= 1; c--) { cur.push(c); rec(rest - c, cur); cur.pop(); }
    }
    rec(n, []);
    out.sort(function (a, b) { return a.length - b.length || Math.max.apply(0, a) - Math.max.apply(0, b) || 0; });
    return out.slice(0, 8);
  }
  // Приводить ряди до дійсного вигляду: кожен індекс 0..n-1 рівно один раз, порожні ряди прибрані.
  function normRows(rows, n) {
    var seen = {}, out = [];
    (rows || []).forEach(function (r) { var q = (r || []).filter(function (x) { return x >= 0 && x < n && !seen[x] && (seen[x] = 1); }); if (q.length) out.push(q); });
    for (var k = 0; k < n; k++) if (!seen[k]) { if (!out.length) out.push([]); out[out.length - 1].push(k); }
    return out;
  }
  function teacherSlots(n, W, H, cfg) {
    cfg = cfg || {};
    var area = { x: W * TEACHER_AREA.x, y: H * TEACHER_AREA.y, w: W * TEACHER_AREA.w, h: H * TEACHER_AREA.h }, capH = Math.max(10, H * 0.07), gap = cfg.gap != null ? cfg.gap : 10, asp = cfg.asp || 1.1;
    if (n <= 0) return [];
    if (cfg.cx != null) area.x = cfg.cx - area.w / 2;
    var rows = cfg.rows && cfg.rows.length ? normRows(cfg.rows, n) : teacherRows(n), nr = rows.length, mc = Math.max.apply(0, rows.map(function (r) { return r.length; }));
    var cw = Math.min((area.w - gap * (mc - 1)) / mc, (area.h - (nr - 1) * gap - nr * capH) / (nr * asp));
    cw = Math.max(4, cw) * Math.min(1, Math.max(0.3, (cfg.size == null ? 100 : cfg.size) / 100));
    var ph = cw * asp, cellH = ph + capH, totH = nr * cellH + (nr - 1) * gap, y0 = area.y + (area.h - totH) / 2, out = [];
    rows.forEach(function (r, ri) {
      var totW = r.length * cw + (r.length - 1) * gap, x0 = area.x + (area.w - totW) / 2, y = y0 + ri * (cellH + gap);
      r.forEach(function (idx, ci) { var x = x0 + ci * (cw + gap); out[idx] = { photo: { x: x, y: y, w: cw, h: ph }, cap: { x: x - gap / 2, y: y + ph, w: cw + gap, h: capH } }; });
    });
    return out;
  }
  // sb = відстань від краю полотна до безпечної межі (виліт + безпечна зона): текст не заходить далі.
  // Обкладинка = задня частина + корінець + передня на одному полотні. Центр передньої сторони: між краєм корінця (W/2 + spine/2) і лінією обрізу праворуч (W - bleed).
  // Портрет майже квадратний (трохи витягнутий), ~70% висоти, зверху до краю; рік центрований і перекриває його низ; ім'я й заклад центровані під ним.
  function coverLayout(W, H, sb, z) {
    sb = sb || 8; var bleed = (z && z.bleed) || 3, spine = (z && z.spine) || 0;
    var cx = ((W / 2 + spine / 2) + (W - bleed)) / 2, ph = Math.min(H * 0.7, H - sb - 40), pw = ph * 0.85;
    return { cx: cx, photo: { x: cx - pw / 2, y: 0, w: pw, h: ph }, year: { x: cx, y: ph + H * 0.012, size: H * 0.2 }, name: { x: cx, y: Math.min(H * 0.915, H - sb - 3), line: ph + H * 0.1 } };
  }
  function firstLayout(W, H, sb, cx, cxr) {
    sb = sb || 8;
    return { group: { x: 0, y: H * 0.07, w: W * 0.49, h: H * 0.74 }, portrait: { x: (cxr != null ? cxr : W * 0.74) - W * 0.18, y: 0, w: W * 0.36, h: H }, text: { x: cx != null ? cx : W * 0.245, y: Math.min(H * 0.865, H - sb - H * 0.058) } };
  }
  // Край зображення = середина між лінією обрізу й безпечною межею; центр сторінки рахується від цього краю до осі розвороту.
  function pageCenters(W, bleed, safe) { var e = bleed + safe / 2; return { edge: e, left: (e + W / 2) / 2, right: (W / 2 + W - e) / 2 }; }
  var api = { pageCenters: pageCenters, rowSlots: rowSlots, scrapSlots: scrapSlots, rng: rng, autoK: autoK, gridFor: gridFor, portraitSlots: portraitSlots, groupSlots: groupSlots, teacherSlots: teacherSlots, teacherRows: teacherRows, teacherPresets: teacherPresets, normRows: normRows, coverLayout: coverLayout, firstLayout: firstLayout, KS: KS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.AlbumLayout = api;
})(typeof self !== 'undefined' ? self : this);
