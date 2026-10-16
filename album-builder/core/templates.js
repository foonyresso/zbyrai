// Розкладки групових фото за готовими шаблонами: геометрія, підбір під кількість і пропорції фото. Без DOM.
(function (root) {
  var D = typeof require !== 'undefined' ? require('../data/group-layouts.js') : root.AlbumLayouts;
  // Прямокутники шаблону в мм. gap — просвіт між фото (по краях розвороту фото йдуть до краю), margin — біла рамка. tilt: усе полотно поворочено й збільшено, щоб краї виходили за розворот.
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
  var api = { rects: rects, assign: assign, pick: pick, LIST: D.LIST, byId: D.byId };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.AlbumTemplates = api;
})(typeof self !== 'undefined' ? self : this);
