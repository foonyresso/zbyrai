// Комбіновані розвороти: сторінки (половини й цілі шаблони, зі дзеркалами) з наявних розкладок парами «ліва + права». Без DOM, без дублікатів.
(function (root) {
  function gcd(a, b) { return b ? gcd(b, a % b) : a; }
  function lcm(a, b) { return a / gcd(a, b) * b; }
  // Підпис набору клітинок у частках площі: однакові розкладки дають однаковий рядок.
  function sig(cols, rows, cells, xo, xs) {
    return cells.map(function (c) { return [(xo + c[0] / cols * xs), c[1] / rows, c[2] / cols * xs, c[3] / rows].map(function (v) { return Math.round(v * 1e4); }).join(','); }).sort().join('|');
  }
  function flip(p) { return { cols: p.cols, rows: p.rows, cells: p.cells.map(function (c) { return [c[0], p.rows - c[1] - c[3], c[2], c[3]]; }) }; }
  function mirror(p) { return { cols: p.cols, rows: p.rows, cells: p.cells.map(function (c) { return [p.cols - c[0] - c[2], c[1], c[2], c[3]]; }) }; }
  // Усі унікальні сторінки з базових шаблонів (без нахилу): ціла розкладка на сторінці, ліва/права половина, дзеркала.
  // Сторінка майже квадратних комірок → версії з вертикальними (3:4, 2:3) та горизонтальним (3:2) прямокутниками й білими полями. Сторінка вважається квадратною за пропорціями.
  var PAGE_ASPECT = 1;
  function insets(p) {
    var as = p.cells.map(function (c) { return PAGE_ASPECT * (c[2] / p.cols) / (c[3] / p.rows); });
    if (!as.every(function (a) { return a > 0.8 && a < 1.3; })) return [];
    var avg = as.reduce(function (a, b) { return a + b; }, 0) / as.length, out = [];
    [[0.75, 'вертикальні 3:4'], [0.667, 'вертикальні 2:3']].forEach(function (v) {
      var k = Math.round(16 * v[0] / avg); out.push({ cols: 32 * p.cols, rows: p.rows, cells: p.cells.map(function (c) { return [(2 * c[0] - p.cols) * k + 16 * p.cols, c[1], 2 * c[2] * k, c[3]]; }), tag: v[1] });
    });
    var k2 = Math.round(16 * avg / 1.4); out.push({ cols: p.cols, rows: 32 * p.rows, cells: p.cells.map(function (c) { return [c[0], (2 * c[1] - p.rows) * k2 + 16 * p.rows, c[2], 2 * c[3] * k2]; }), tag: 'горизонтальні 3:2' });
    return out;
  }
  function pages(list) {
    var out = [], seen = {};
    function add(p, desc, noInset) {
      if (!noInset) insets(p).forEach(function (q) { add(q, desc + ', ' + q.tag, true); });
      [p, mirror(p), flip(p), flip(mirror(p))].forEach(function (q, k) {
        if (q.cells.length > 10) return; var s = sig(q.cols, q.rows, q.cells, 0, 1); if (seen[s]) return; seen[s] = 1;
        out.push({ id: 'p' + out.length, desc: desc + (k ? (k === 1 ? ' (дзеркально)' : k === 2 ? ' (догори дном)' : ' (дзеркально, догори дном)') : ''), cols: q.cols, rows: q.rows, cells: q.cells, n: q.cells.length });
      });
    }
    list.forEach(function (t) {
      if (t.tilt) return;
      add({ cols: t.cols, rows: t.rows, cells: t.cells }, t.name);
      var h = t.cols / 2, L = [], R = [];
      t.cells.forEach(function (c) { if (c[0] + c[2] <= h + 1e-9) L.push([2 * c[0], c[1], 2 * c[2], c[3]]); else if (c[0] >= h - 1e-9) R.push([2 * c[0] - t.cols, c[1], 2 * c[2], c[3]]); });
      if (L.length + R.length === t.cells.length && L.length && R.length) { add({ cols: t.cols, rows: t.rows, cells: L }, t.name + ', ліва половина'); add({ cols: t.cols, rows: t.rows, cells: R }, t.name + ', права половина'); }
    });
    return out;
  }
  function join(L, R) {
    var C = lcm(L.cols, R.cols), Rw = lcm(L.rows, R.rows), kl = C / L.cols, kr = C / R.cols, ml = Rw / L.rows, mr = Rw / R.rows, cells = [];
    L.cells.forEach(function (c) { cells.push([c[0] * kl, c[1] * ml, c[2] * kl, c[3] * ml]); });
    R.cells.forEach(function (c) { cells.push([C + c[0] * kr, c[1] * mr, c[2] * kr, c[3] * mr]); });
    return { cols: 2 * C, rows: Rw, cells: cells };
  }
  // Повертає масив шаблонів у форматі data/group-layouts.js; id = 'c<ліва>_<права>' (стабільні для збережених альбомів).
  function build(list) {
    var P = pages(list), seen = {}, out = [];
    list.forEach(function (t) { seen[sig(t.cols, t.rows, t.cells, 0, 1)] = 1; });
    P.forEach(function (l, i) { P.forEach(function (r, j) {
      var j2 = join(l, r), s = sig(j2.cols, j2.rows, j2.cells, 0, 1); if (seen[s]) return; seen[s] = 1;
      out.push({ id: 'c' + i + '_' + j, name: 'Ліва: ' + l.desc + ' + права: ' + r.desc, n: j2.cells.length, nl: l.n, nr: r.n, cols: j2.cols, rows: j2.rows, cells: j2.cells, tilt: 0, combo: true });
    }); });
    out.sort(function (a, b) { return a.n - b.n; });
    return out;
  }
  var api = { build: build, pages: pages };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.AlbumCombos = api;
})(typeof self !== 'undefined' ? self : this);
