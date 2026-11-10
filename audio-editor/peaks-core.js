// Аудіо редактор: піраміда піків для швидкого малювання хвилі. Без DOM.
(function (root) {
  'use strict';
  var BLOCK = 256;
  // Для кожного блоку з block відліків (за замовчуванням BLOCK) зберігає мінімум і максимум серед усіх каналів.
  function build(chs, block) {
    block = block || BLOCK;
    var n = chs[0].length, nb = Math.ceil(n / block) || 1, mn = new Float32Array(nb), mx = new Float32Array(nb);
    for (var b = 0; b < nb; b++) {
      var lo = 0, hi = 0, e = Math.min(n, (b + 1) * block);
      for (var c = 0; c < chs.length; c++) { var x = chs[c]; for (var i = b * block; i < e; i++) { var v = x[i]; if (v < lo) lo = v; if (v > hi) hi = v; } }
      mn[b] = lo; mx[b] = hi;
    }
    return { block: block, min: mn, max: mx, length: n };
  }
  // Мінімум і максимум на ділянці відліків [i0, i1) (за блоками; для дуже коротких ділянок точність до блоку).
  function range(p, i0, i1, out) {
    var b0 = Math.max(0, Math.floor(i0 / p.block)), b1 = Math.min(p.min.length - 1, Math.floor(Math.max(i0, i1 - 1) / p.block)), lo = 0, hi = 0;
    for (var b = b0; b <= b1; b++) { if (p.min[b] < lo) lo = p.min[b]; if (p.max[b] > hi) hi = p.max[b]; }
    out[0] = lo; out[1] = hi; return out;
  }
  root.PeaksCore = { build: build, range: range, BLOCK: BLOCK };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.PeaksCore;
})(typeof self !== 'undefined' ? self : this);
