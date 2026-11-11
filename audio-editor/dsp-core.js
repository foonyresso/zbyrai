// Аудіо редактор: чиста обробка звуку без DOM (ресемплінг, розтягування в часі без зміни тону, фейди, нормалізація).
// Працює і в браузері (window.AudioDSP), і у воркері, і в Node (тести).
(function (root) {
  'use strict';
  var PH = 1024; // кроків фази в таблиці ядра ресемплера

  function dbToGain(db) { return Math.pow(10, db / 20); }
  function gainToDb(g) { return g > 1e-9 ? 20 * Math.log10(g) : -180; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function semiToRatio(s) { return Math.pow(2, s / 12); }

  function makeKernel(cut, a) {
    var H = Math.max(a, Math.ceil(a / cut)), T = 2 * H, tab = new Float32Array((PH + 1) * T);
    for (var p = 0; p <= PH; p++) {
      var frac = p / PH, sum = 0, row = p * T;
      for (var t = 0; t < T; t++) {
        var d = (t - H + 1) - frac, v = 0;
        if (Math.abs(d) < H) {
          var x = cut * d, s = x === 0 ? 1 : Math.sin(Math.PI * x) / (Math.PI * x);
          v = cut * s * (0.5 + 0.5 * Math.cos(Math.PI * d / H));
        }
        tab[row + t] = v; sum += v;
      }
      if (sum) for (t = 0; t < T; t++) tab[row + t] /= sum;
    }
    return { tab: tab, H: H, T: T };
  }

  // Змінює швидкість відтворення в ratio разів (тон змінюється разом з тривалістю). ratio = вхідна частота / вихідна.
  function resample(x, ratio) {
    var n = x.length;
    if (Math.abs(ratio - 1) < 1e-9) return Float32Array.from(x);
    var m = Math.max(1, Math.round(n / ratio)), out = new Float32Array(m);
    var k = makeKernel(ratio > 1 ? 1 / ratio : 1, 8), tab = k.tab, H = k.H, T = k.T;
    for (var i = 0; i < m; i++) {
      var pos = i * ratio, idx = Math.floor(pos), p = Math.round((pos - idx) * PH);
      if (p === PH) { p = 0; idx++; }
      var base = p * T, start = idx - H + 1, s = 0, t;
      if (start >= 0 && start + T <= n) { for (t = 0; t < T; t++) s += tab[base + t] * x[start + t]; }
      else { for (t = 0; t < T; t++) { var j = start + t; if (j >= 0 && j < n) s += tab[base + t] * x[j]; } }
      out[i] = s;
    }
    return out;
  }

  // Розтягує в часі в factor разів без зміни тону (WSOLA). Зсуви беруться з моно-суміші й однакові для всіх каналів.
  function stretch(chs, factor, sr) {
    var n = chs[0].length, nc = chs.length;
    if (Math.abs(factor - 1) < 1e-6) return chs.map(function (c) { return Float32Array.from(c); });
    var outLen = Math.max(1, Math.round(n * factor));
    var frame = 2 * Math.round(sr * 0.02), hs = frame / 2, tol = Math.round(sr * 0.012), D = 4, i, c;
    var mono = new Float32Array(n);
    for (c = 0; c < nc; c++) for (i = 0; i < n; i++) mono[i] += chs[c][i] / nc;
    var nd = Math.floor(n / D), dm = new Float32Array(nd), ps = new Float64Array(nd + 1);
    for (i = 0; i < nd; i++) { var a = 0; for (var q = 0; q < D; q++) a += mono[i * D + q]; dm[i] = a / D; ps[i + 1] = ps[i] + dm[i] * dm[i]; }
    var win = new Float32Array(frame);
    for (i = 0; i < frame; i++) win[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / frame);
    var out = chs.map(function () { return new Float32Array(outLen + frame); });
    var hsD = Math.floor(hs / D), prev = 0;
    for (var k = 0; k * hs < outLen; k++) {
      var outPos = k * hs, target = Math.round(outPos / factor), start;
      if (k === 0) start = 0;
      else {
        var ref = prev + hs, refD = Math.floor(ref / D);
        start = clamp(target, 0, Math.max(0, n - 1));
        var lo = Math.max(0, target - tol), hi = Math.min(n - frame, target + tol);
        if (hi >= lo && refD + hsD <= nd) {
          var loD = Math.ceil(lo / D), hiD = Math.floor(hi / D), best = -Infinity, bc = -1;
          for (var cd = loD; cd <= hiD; cd++) {
            if (cd + hsD > nd) break;
            var cr = 0;
            for (var j = 0; j < hsD; j += 2) cr += dm[cd + j] * dm[refD + j];
            var e = ps[cd + hsD] - ps[cd];
            var score = cr / Math.sqrt(e + 1e-9);
            if (score > best) { best = score; bc = cd; }
          }
          if (bc >= 0) {
            // уточнення на повній частоті навколо грубого збігу
            var bs = bc * D, bb = -Infinity, bbs = bs;
            for (var cs = Math.max(0, bs - D); cs <= Math.min(n - hs - 1, bs + D); cs++) {
              var r2 = 0, e2 = 0;
              if (ref + hs > n) break;
              for (var jj = 0; jj < hs; jj += 2) { r2 += mono[cs + jj] * mono[ref + jj]; e2 += mono[cs + jj] * mono[cs + jj]; }
              var sc = r2 / Math.sqrt(e2 + 1e-9);
              if (sc > bb) { bb = sc; bbs = cs; }
            }
            start = bbs;
          }
        }
      }
      prev = start;
      for (c = 0; c < nc; c++) {
        var src = chs[c], dst = out[c];
        for (i = 0; i < frame; i++) {
          var si = start + i; if (si >= n) break;
          dst[outPos + i] += (k === 0 && i < hs ? 1 : win[i]) * src[si];
        }
      }
    }
    return out.map(function (o) { return o.subarray(0, outLen); });
  }

  function peakOf(chs) {
    var p = 0;
    for (var c = 0; c < chs.length; c++) { var x = chs[c]; for (var i = 0; i < x.length; i++) { var v = x[i] < 0 ? -x[i] : x[i]; if (v > p) p = v; } }
    return p;
  }
  function applyGain(chs, g) {
    if (g === 1) return;
    for (var c = 0; c < chs.length; c++) { var x = chs[c]; for (var i = 0; i < x.length; i++) x[i] *= g; }
  }
  // Лінійні фейди на початку (nIn відліків) і наприкінці (nOut відліків).
  function applyFades(chs, nIn, nOut) {
    for (var c = 0; c < chs.length; c++) {
      var x = chs[c], n = x.length, i;
      nIn = Math.min(nIn | 0, n); nOut = Math.min(nOut | 0, n);
      for (i = 0; i < nIn; i++) x[i] *= i / nIn;
      for (i = 0; i < nOut; i++) x[n - 1 - i] *= i / nOut;
    }
  }
  function toMono(chs) {
    if (chs.length === 1) return [chs[0]];
    var n = chs[0].length, o = new Float32Array(n);
    for (var c = 0; c < chs.length; c++) for (var i = 0; i < n; i++) o[i] += chs[c][i] / chs.length;
    return [o];
  }

  root.AudioDSP = { dbToGain: dbToGain, gainToDb: gainToDb, clamp: clamp, semiToRatio: semiToRatio, resample: resample, stretch: stretch, peakOf: peakOf, applyGain: applyGain, applyFades: applyFades, toMono: toMono };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.AudioDSP;
})(typeof self !== 'undefined' ? self : this);
