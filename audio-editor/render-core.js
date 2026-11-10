// Аудіо редактор: збирання готового звуку за монтажем (фрагменти → швидкість/тон → гучність → фейди → нормалізація → канали → частота).
// Без DOM: працює у воркері, на головному потоці й у Node. Залежить від dsp-core.js і audio-core.js.
(function (root) {
  'use strict';
  var D = root.AudioDSP || (typeof require !== 'undefined' ? require('./dsp-core.js') : null);
  var A = root.AudioCore || (typeof require !== 'undefined' ? require('./audio-core.js') : null);

  function processSeg(slice, seg, sr) {
    var s = seg.speed || 1, r = D.semiToRatio(seg.pitch || 0), chs;
    if (seg.tape) chs = slice.map(function (c) { return D.resample(c, s * r); });
    else {
      chs = D.stretch(slice, r / s, sr);
      if (Math.abs(r - 1) > 1e-9) chs = chs.map(function (c) { return D.resample(c, r); });
    }
    return chs;
  }

  // Фрагменти йдуть у джерелі підряд і з однаковими налаштуваннями: стик безшовний.
  function joined(x, y) { return Math.abs(x.b - y.a) < 1e-6 && x.speed === y.speed && x.pitch === y.pitch && x.gain === y.gain && x.tape === y.tape; }

  // src = { sr, channels: Float32Array[] }; segs — список фрагментів; o — загальні налаштування:
  // { gainDb, fadeIn, fadeOut, normalize: {on, peakDb}, channels: 0|1|2 (0 = як у джерелі), rate: 0|Гц (0 = як у джерелі) }
  function render(src, segs, o, progress) {
    o = o || {}; progress = progress || function () {};
    var sr = src.sr, nch = src.channels.length, join = Math.max(1, Math.round(sr * 0.003)), chunks = [], len = 0, i, c;
    for (i = 0; i < segs.length; i++) {
      var sg = segs[i], ia = Math.max(0, Math.round(sg.a * sr)), ib = Math.min(src.channels[0].length, Math.round(sg.b * sr));
      if (ib <= ia) continue;
      var out = processSeg(src.channels.map(function (ch) { return ch.subarray(ia, ib); }), sg, sr);
      D.applyGain(out, D.dbToGain(sg.gain || 0));
      // короткі фейди на стиках, де звук стрибає в інше місце джерела, прибирають клацання
      var prev = segs[i - 1], next = segs[i + 1];
      D.applyFades(out, !prev || !joined(prev, sg) ? join : 0, !next || !joined(sg, next) ? join : 0);
      chunks.push(out); len += out[0].length;
      progress(0.8 * (i + 1) / segs.length);
    }
    var res = []; for (c = 0; c < nch; c++) res.push(new Float32Array(len));
    var pos = 0;
    chunks.forEach(function (ch) { for (var k = 0; k < nch; k++) res[k].set(ch[k], pos); pos += ch[0].length; });
    if (len) D.applyFades(res, Math.round((o.fadeIn || 0) * sr), Math.round((o.fadeOut || 0) * sr));
    D.applyGain(res, D.dbToGain(o.gainDb || 0));
    if (o.normalize && o.normalize.on) {
      var pk = D.peakOf(res);
      if (pk > 1e-6) D.applyGain(res, D.dbToGain(o.normalize.peakDb === undefined ? -1 : o.normalize.peakDb) / pk);
    }
    progress(0.85);
    if (o.channels === 1 && res.length > 1) res = D.toMono(res);
    else if (o.channels === 2 && res.length === 1) res = [res[0], Float32Array.from(res[0])];
    var outSr = sr;
    if (o.rate && o.rate !== sr) { var ratio = sr / o.rate; res = res.map(function (x) { return D.resample(x, ratio); }); outSr = o.rate; }
    progress(1);
    return { sr: outSr, channels: res, peak: D.peakOf(res), duration: res[0].length / outSr };
  }

  root.AudioRender = { render: render, processSeg: processSeg };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.AudioRender;
})(typeof self !== 'undefined' ? self : this);
