// Атлас 2.0: шум Перліна 2D із зерна й фрактальний шум (fbm).
(function () {
  'use strict';
  const A = globalThis.Atlas2;
  function make(seed) {
    const r = A.Rng.stream(seed, 'noise'), p = new Uint8Array(512), g = new Float32Array(512 * 2);
    const base = Array.from({ length: 256 }, (_, i) => i);
    for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [base[i], base[j]] = [base[j], base[i]]; }
    for (let i = 0; i < 512; i++) { p[i] = base[i & 255]; const a = (p[i] / 256) * Math.PI * 2; g[i * 2] = Math.cos(a); g[i * 2 + 1] = Math.sin(a); }
    const fade = t => t * t * t * (t * (t * 6 - 15) + 10);
    function perlin(x, y) {
      const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, X = xi & 255, Y = yi & 255;
      const dot = (hx, hy, dx, dy) => { const k = p[p[X + hx] + Y + hy]; return g[k * 2] * dx + g[k * 2 + 1] * dy; };
      const u = fade(xf), v = fade(yf);
      const a = dot(0, 0, xf, yf), b = dot(1, 0, xf - 1, yf), c = dot(0, 1, xf, yf - 1), d = dot(1, 1, xf - 1, yf - 1);
      return (a + u * (b - a)) + v * ((c + u * (d - c)) - (a + u * (b - a)));
    }
    // fbm у діапазоні приблизно [0,1]
    function fbm(x, y, oct = 5, lac = 2, gain = 0.5) {
      let s = 0, amp = 1, f = 1, n = 0;
      for (let i = 0; i < oct; i++) { s += perlin(x * f + i * 17.3, y * f - i * 9.1) * amp; n += amp; amp *= gain; f *= lac; }
      return Math.min(1, Math.max(0, 0.5 + 0.7 * s / n));
    }
    return { perlin, fbm };
  }
  A.Noise = { make };
})();
