// Кольори карти: оттінки моря за відстанню до берега, колір провінції за відтінком, затінення рельєфу.
(function () {
  'use strict';
  const R = (globalThis.RealmMap = globalThis.RealmMap || {});
  const hash = (x, y, k) => { let h = Math.imul(x * 374761393 + y * 668265263 + (k || 0) * 2147483647, 1274126177); h = Math.imul(h ^ (h >>> 13), 1103515245); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  function hex2rgb(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  const rgb = (r, g, b) => 'rgb(' + Math.round(Math.max(0, Math.min(255, r))) + ',' + Math.round(Math.max(0, Math.min(255, g))) + ',' + Math.round(Math.max(0, Math.min(255, b))) + ')';
  function shade(hex, f) { const c = hex2rgb(hex); return rgb(c[0] * f, c[1] * f, c[2] * f); }
  function rgb2hsl(r, g, b) { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2; if (mx === mn) return [0, 0, l]; const d = mx - mn, s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); const h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return [h * 60, s, l]; }
  function hsl2rgb(h, s, l) { h = ((h % 360) + 360) % 360 / 360; const f = (p, q, t) => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; }; if (!s) return [l * 255, l * 255, l * 255]; const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q; return [f(p, q, h + 1 / 3) * 255, f(p, q, h) * 255, f(p, q, h - 1 / 3) * 255]; }
  const tintCache = new Map();
  R.Palette = {
    hash, shade, hex2rgb,
    theme: R.Themes.continent,
    setTheme(id) { this.theme = R.Themes[id] || R.Themes.continent; tintCache.clear(); },
    // перефарбування кольору біому темою світу (кеш за кольором)
    tint(hex) {
      const t = this.theme.tint; if (t.h === 0 && t.s === 1 && t.l === 0 && !t.mix[1]) return hex;
      let v = tintCache.get(hex); if (v) return v;
      const c = hex2rgb(hex); let [h, s, l] = rgb2hsl(c[0], c[1], c[2]); let o = hsl2rgb(h + t.h, Math.min(1, s * t.s), Math.max(0, Math.min(1, l + t.l)));
      const m = hex2rgb(t.mix[0]), a = t.mix[1]; o = [o[0] + (m[0] - o[0]) * a, o[1] + (m[1] - o[1]) * a, o[2] + (m[2] - o[2]) * a];
      v = '#' + o.map(x => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, '0')).join(''); tintCache.set(hex, v); return v;
    },
    sea(d) { const S = this.theme.sea; return S[Math.min(S.length - 1, Math.max(0, d - 1))]; },
    get lake() { return this.theme.lake; }, land: '#d9cfae',
    province(hue, a) { return 'hsla(' + Math.round(hue) + ',62%,52%,' + a + ')'; },
    provinceSolid: hue => 'hsl(' + Math.round(hue) + ',55%,38%)',
    ink: '#2f2418', paper: '#f4ead2',
  };
})();
