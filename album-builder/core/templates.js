// Розкладки групових фото за готовими шаблонами: геометрія, підбір під кількість і пропорції фото. Без DOM.
(function (root) {
  var D = typeof require !== 'undefined' ? require('../data/group-layouts.js') : root.AlbumLayouts;
  // Прямокутники шаблону в мм. gap — просвіт між фото (по краях розвороту фото йдуть до краю), margin — біла рамка. tilt: усе полотно поворочено й збільшено, щоб краї виходили за розворот.
  var CB = typeof require !== 'undefined' ? require('./combos.js') : root.AlbumCombos;
  var VR = typeof require !== 'undefined' ? require('./variants.js') : root.AlbumVariants;
  var COMBOS = CB.build(D.LIST), CMAP = {}; COMBOS.forEach(function (t) { CMAP[t.id] = t; });
  // Варіанти заміни комірок (id = «база~кроки», напр. g12~3.5): база — 2 кроки, комбіновані — 1 крок. Будуються за потреби й кешуються.
  var VARS = null, VOPT = { split: true };
  function mk(parent, v, path) { return { id: parent.id + '~' + path.join('.'), name: parent.name + ' · заміна комірок', n: v.cells.length, cols: v.cols, rows: v.rows, cells: v.cells, tilt: 0, variant: true, nl: parent.nl, nr: parent.nr }; }
  function variantsAll() {
    if (VARS) return VARS; var seen = {}, out = []; D.LIST.concat(COMBOS).forEach(function (t) { if (!t.tilt) seen[VR.key(t)] = 1; });
    D.LIST.forEach(function (t) { if (!t.tilt) VR.variants(t, 2, VOPT, seen).forEach(function (r) { out.push(mk(t, r.t, r.path)); }); });
    COMBOS.forEach(function (t) { VR.variants(t, 1, VOPT, seen).forEach(function (r) { out.push(mk(t, r.t, r.path)); }); });
    return (VARS = out.sort(function (a, b) { return a.n - b.n; }));
  }
  function byIdAny(id) {
    var base = D.byId(id) || CMAP[id]; if (base) return base; var m = /^([^~]+)~([\d.]+)$/.exec(id); if (!m) return null;
    var p = D.byId(m[1]) || CMAP[m[1]]; if (!p || p.tilt) return null; var path = m[2].split('.').map(Number), v;
    try { v = VR.apply(p, path, VOPT); } catch (e) { return null; } return v && v.cells ? mk(p, v, path) : null;
  }
  function rects(tpl, W, H, gap, margin) {
    var area = { x: margin, y: margin, w: W - 2 * margin, h: H - 2 * margin }, rot = 0, piv = null;
    if (tpl.tilt) { var s = 1.16; area = { x: -(s - 1) / 2 * W, y: -(s - 1) / 2 * H, w: s * W, h: s * H }; rot = tpl.tilt * Math.PI / 180; piv = { x: W / 2, y: H / 2 }; }
    var uw = area.w / tpl.cols, uh = area.h / tpl.rows, out = [], g = tpl.tilt ? Math.max(gap, 1.6) : gap;
    tpl.cells.forEach(function (c, i) {
      var x0 = area.x + c[0] * uw, y0 = area.y + c[1] * uh, x1 = x0 + c[2] * uw, y1 = y0 + c[3] * uh;
      if (c[0] > 0) x0 += g / 2; if (c[0] + c[2] < tpl.cols) x1 -= g / 2; if (c[1] > 0) y0 += g / 2; if (c[1] + c[3] < tpl.rows) y1 -= g / 2;
      out.push({ x: x0, y: y0, w: x1 - x0, h: y1 - y0, i: i, rot: rot, pivot: piv });
    });
    return out;
  }
  // Підбір фото до вікон за пропорціями: великі вікна першими. Повертає для кожного вікна індекс фото або -1.
  function assign(cells, aspects) {
    var res = cells.map(function () { return -1; }), left = aspects.map(function (_, i) { return i; });
    var order = cells.map(function (_, i) { return i; }).sort(function (a, b) { return cells[b].w * cells[b].h - cells[a].w * cells[a].h; });
    order.forEach(function (ci) {
      if (!left.length) return; var ca = cells[ci].w / cells[ci].h, best = 0, bs = Infinity;
      left.forEach(function (pi, k) { var sc = Math.abs(Math.log(aspects[pi] / ca)); if (sc < bs) { bs = sc; best = k; } });
      res[ci] = left.splice(best, 1)[0];
    });
    return res;
  }
  // Найкраща розкладка (без нахилу) для фото з такими пропорціями: мінімум спотворення кадру й порожніх вікон. null, якщо вікон ніде не вистачає.
  function pick(aspects, W, H, gap) {
    var best = null, bs = Infinity, n = aspects.length;
    D.LIST.forEach(function (tpl) {
      if (tpl.tilt || tpl.n < n) return;
      var r = rects(tpl, W, H, gap, 0), a = assign(r, aspects), sc = 0;
      a.forEach(function (pi, ci) { if (pi >= 0) sc += Math.abs(Math.log(aspects[pi] / (r[ci].w / r[ci].h))); });
      sc = sc / Math.max(1, n) + (tpl.n - n) * 0.25;
      if (sc < bs) { bs = sc; best = tpl; }
    });
    return best;
  }
  var api = { rects: rects, assign: assign, pick: pick, LIST: D.LIST, COMBOS: COMBOS, variants: variantsAll, byId: byIdAny };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.AlbumTemplates = api;
})(typeof self !== 'undefined' ? self : this);
