// Кольори карти: оттінки моря за відстанню до берега, колір провінції за відтінком, затінення рельєфу.
(function () {
  'use strict';
  const R = (globalThis.RealmMap = globalThis.RealmMap || {});
  const SEA = ['#9fd0dc', '#88c0d2', '#74afc6', '#629eb9', '#518cac', '#437b9d', '#386d8f'];
  const hash = (x, y, k) => { let h = Math.imul(x * 374761393 + y * 668265263 + (k || 0) * 2147483647, 1274126177); h = Math.imul(h ^ (h >>> 13), 1103515245); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  function hex2rgb(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  const rgb = (r, g, b) => 'rgb(' + Math.round(Math.max(0, Math.min(255, r))) + ',' + Math.round(Math.max(0, Math.min(255, g))) + ',' + Math.round(Math.max(0, Math.min(255, b))) + ')';
  function shade(hex, f) { const c = hex2rgb(hex); return rgb(c[0] * f, c[1] * f, c[2] * f); }
  R.Palette = {
    hash, shade, hex2rgb,
    sea: d => SEA[Math.min(SEA.length - 1, Math.max(0, d - 1))],
    lake: '#7cbcd2', coast: '#4b3b2a', land: '#d9cfae',
    province: (hue, a) => 'hsla(' + Math.round(hue) + ',62%,52%,' + a + ')',
    provinceSolid: hue => 'hsl(' + Math.round(hue) + ',55%,38%)',
    ink: '#2f2418', paper: '#f4ead2',
  };
})();
