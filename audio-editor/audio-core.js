// Аудіо редактор: модель монтажу без DOM. Проєкт = послідовність фрагментів джерела (початок і кінець у секундах джерела)
// зі своїми швидкістю, тоном і гучністю. Розрізання, видалення й обрізка лише змінюють цей список; звук не копіюється.
// Час на таймлайні (t) вимірюється у вихідних секундах: тривалість фрагмента = (b - a) / speed.
(function (root) {
  'use strict';
  var MIN_GAP = 0.005; // розрізи ближче за 5 мс до межі не робляться

  function newSeg(a, b, o) {
    o = o || {};
    return { a: a, b: b, speed: o.speed || 1, pitch: o.pitch || 0, gain: o.gain || 0, tape: !!o.tape };
  }
  function newProject(duration) { return [newSeg(0, duration)]; }
  function clone(segs) { return segs.map(function (s) { return Object.assign({}, s); }); }
  function segDur(s) { return (s.b - s.a) / s.speed; }
  function total(segs) { var t = 0; for (var i = 0; i < segs.length; i++) t += segDur(segs[i]); return t; }
  function starts(segs) { var r = [], t = 0; for (var i = 0; i < segs.length; i++) { r.push(t); t += segDur(segs[i]); } return r; }

  // Номер фрагмента під часом t (останній, якщо t за межею) і зсув усередині нього.
  function locate(segs, t) {
    var acc = 0;
    for (var i = 0; i < segs.length; i++) {
      var d = segDur(segs[i]);
      if (t < acc + d || i === segs.length - 1) return { i: i, off: Math.max(0, Math.min(d, t - acc)), start: acc };
      acc += d;
    }
    return { i: -1, off: 0, start: 0 };
  }

  // Розрізає у час t. Повертає номер фрагмента, що починається в t (segs.length, якщо t = кінець).
  function cut(segs, t) {
    if (!segs.length || t <= MIN_GAP) return 0;
    var st = starts(segs), tot = total(segs);
    if (t >= tot - MIN_GAP) return segs.length;
    var L = locate(segs, t), s = segs[L.i];
    if (L.off <= MIN_GAP) return L.i;
    if (segDur(s) - L.off <= MIN_GAP) return L.i + 1;
    var m = s.a + L.off * s.speed, right = Object.assign({}, s);
    right.a = m; s.b = m;
    segs.splice(L.i + 1, 0, right);
    return L.i + 1;
  }
  // Виділяє діапазон [t0, t1) окремими фрагментами. Повертає [перший, після останнього).
  function isolate(segs, t0, t1) {
    if (t1 < t0) { var x = t0; t0 = t1; t1 = x; }
    var i0 = cut(segs, t0), i1 = cut(segs, t1);
    return [i0, i1];
  }
  function removeRange(segs, t0, t1) { var r = isolate(segs, t0, t1); segs.splice(r[0], r[1] - r[0]); return r; }
  function cropTo(segs, t0, t1) { var tot = total(segs); removeRange(segs, t1, tot + 1); removeRange(segs, 0, t0); }
  function setProps(segs, i0, i1, props) { for (var i = i0; i < i1; i++) Object.assign(segs[i], props); }

  function fmtTime(t, frac) {
    if (!isFinite(t) || t < 0) t = 0;
    var m = Math.floor(t / 60), s = t - m * 60, f = frac === undefined ? 2 : frac;
    var str = s.toFixed(f); if (parseFloat(str) >= 60) { m++; str = (0).toFixed(f); }
    return m + ':' + (parseFloat(str) < 10 ? '0' : '') + str;
  }
  function parseTime(str) {
    str = String(str).trim().replace(',', '.');
    var m = /^(?:(\d+):)?(\d+(?:\.\d+)?)$/.exec(str);
    if (!m) return NaN;
    return (m[1] ? parseInt(m[1], 10) * 60 : 0) + parseFloat(m[2]);
  }

  root.AudioCore = { newSeg: newSeg, newProject: newProject, clone: clone, segDur: segDur, total: total, starts: starts, locate: locate, cut: cut, isolate: isolate, removeRange: removeRange, cropTo: cropTo, setProps: setProps, fmtTime: fmtTime, parseTime: parseTime, MIN_GAP: MIN_GAP };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.AudioCore;
})(typeof self !== 'undefined' ? self : this);
