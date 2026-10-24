/* Механіка «rng»: детермінований генератор випадкових чисел і шум за зерном. Без DOM. Глобал Mech.Rng / module.exports. */
(function (root) {
  'use strict';
  const Mech = root.Mech = root.Mech || {};
  function xmur3(str) { let h = 1779033703 ^ str.length; for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = h << 13 | h >>> 19; } return () => { h = Math.imul(h ^ h >>> 16, 2246822507); h = Math.imul(h ^ h >>> 13, 3266489909); return (h ^= h >>> 16) >>> 0; }; }
  function mulberry32(a) { return () => { a |= 0; a = a + 0x6d2b79f5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  // потік за зерном і назвою: різні назви дають незалежні послідовності
  const stream = (seed, name) => mulberry32(xmur3(seed + '|' + name)());
  const hash2 = (seed, x, y) => { const h = xmur3(seed + '|' + x + ',' + y); return h() / 4294967296; };
  const smooth = t => t * t * (3 - 2 * t);
  // value-noise 0..1 з гладкою інтерполяцією на цілій решітці
  function noise2(seed, x, y) {
    const x0 = Math.floor(x), y0 = Math.floor(y), fx = smooth(x - x0), fy = smooth(y - y0);
    const a = hash2(seed, x0, y0), b = hash2(seed, x0 + 1, y0), c = hash2(seed, x0, y0 + 1), d = hash2(seed, x0 + 1, y0 + 1);
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
  }
  // кілька октав шуму, результат 0..1
  function fbm(seed, x, y, oct = 3) { let v = 0, amp = 1, sum = 0, f = 1; for (let i = 0; i < oct; i++) { v += amp * noise2(seed + i, x * f, y * f); sum += amp; amp /= 2; f *= 2; } return v / sum; }
  const pick = (R, l) => l[Math.floor(R() * l.length)];
  const api = { stream, noise2, fbm, pick, hash2 };
  Mech.Rng = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(globalThis);
