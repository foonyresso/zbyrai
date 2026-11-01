// Варіанти розкладки заміною комірок: «злиття» двох сусідніх комірок в одну більшу (дві вертикальні → одна горизонтальна тощо) і «поділ» комірки навпіл. Без DOM.
(function (root) {
  function gcd(a, b) { return b ? gcd(b, a % b) : a; }
  function norm(cols, rows, cells) {
    var g = 0, h = 0; cells.forEach(function (c) { g = gcd(gcd(g, c[0]), gcd(c[2], g)); h = gcd(gcd(h, c[1]), gcd(c[3], h)); });
    g = gcd(g, cols) || 1; h = gcd(h, rows) || 1;
    return { cols: cols / g, rows: rows / h, cells: cells.map(function (c) { return [c[0] / g, c[1] / h, c[2] / g, c[3] / h]; }) };
  }
  function key(t) { var n = norm(t.cols, t.rows, t.cells); return n.cols + 'x' + n.rows + ':' + n.cells.map(function (c) { return c.join(','); }).sort().join('|'); }
  // Усі результати одного кроку: злиття пар сусідніх комірок, що разом дають прямокутник, і поділ кожної комірки навпіл (по довшій і по коротшій стороні).
  function step(t, o) {
    var out = [], cs = t.cells, i, j;
    for (i = 0; i < cs.length; i++) for (j = i + 1; j < cs.length; j++) {
      var a = cs[i], b = cs[j], u = null;
      if (a[1] === b[1] && a[3] === b[3] && (a[0] + a[2] === b[0] || b[0] + b[2] === a[0])) u = [Math.min(a[0], b[0]), a[1], a[2] + b[2], a[3]];
      else if (a[0] === b[0] && a[2] === b[2] && (a[1] + a[3] === b[1] || b[1] + b[3] === a[1])) u = [a[0], Math.min(a[1], b[1]), a[2], a[3] + b[3]];
      if (u) out.push({ cols: t.cols, rows: t.rows, cells: cs.filter(function (_, k) { return k !== i && k !== j; }).concat([u]) });
    }
    if (o && o.split) cs.forEach(function (c, k) {
      var rest = cs.filter(function (_, m) { return m !== k; });
      var X = rest.map(function (r) { return [r[0] * 2, r[1], r[2] * 2, r[3]]; }), Y = rest.map(function (r) { return [r[0], r[1] * 2, r[2], r[3] * 2]; });
      out.push({ cols: t.cols * 2, rows: t.rows, cells: X.concat([[c[0] * 2, c[1], c[2], c[3]], [c[0] * 2 + c[2], c[1], c[2], c[3]]]) });
      out.push({ cols: t.cols, rows: t.rows * 2, cells: Y.concat([[c[0], c[1] * 2, c[2], c[3]], [c[0], c[1] * 2 + c[3], c[2], c[3]]]) });
    });
    return out.map(function (r) { return norm(r.cols, r.rows, r.cells); });
  }
  // Один крок за номером (для відновлення розкладки з id), результат уже нормалізований.
  function apply(t, path, o) { var cur = t; path.forEach(function (i) { cur = step(cur, o)[i]; }); return cur; }
  // Варіанти до depth кроків: [{ t, path }], унікальні за ключем (seen — спільний набір ключів для дедуплікації між розкладками).
  function variants(t, depth, o, seen) {
    seen = seen || {}; var res = [], frontier = [{ t: { cols: t.cols, rows: t.rows, cells: t.cells }, path: [] }]; seen[key(t)] = 1;
    for (var d = 0; d < depth; d++) {
      var next = [];
      frontier.forEach(function (f) { step(f.t, o).forEach(function (v, i) { var k = key(v); if (seen[k]) return; seen[k] = 1; var r = { t: v, path: f.path.concat([i]) }; next.push(r); res.push(r); }); });
      frontier = next;
    }
    return res;
  }
  var api = { variants: variants, apply: apply, step: step, key: key, norm: norm };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.AlbumVariants = api;
})(typeof self !== 'undefined' ? self : this);
