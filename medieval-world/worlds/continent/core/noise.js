// Шум Перліна 2D і фрактальна сума (fbm). Таблиця градієнтів будується із зерна.
(function () {
  'use strict';
  const R = (globalThis.RealmMap = globalThis.RealmMap || {});

  function makeNoise(seedStr) {
    const r = R.Rng.stream(seedStr, 'noise'), perm = new Uint8Array(512), p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = p[i]; p[i] = p[j]; p[j] = t; }
    for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
    const fade = t => t * t * t * (t * (t * 6 - 15) + 10);
    const grad = (h, x, y) => { switch (h & 7) { case 0: return x + y; case 1: return x - y; case 2: return -x + y; case 3: return -x - y; case 4: return x; case 5: return -x; case 6: return y; default: return -y; } };
    // значення приблизно в [-1,1]
    function noise2(x, y) {
      const xi = Math.floor(x), yi = Math.floor(y), X = xi & 255, Y = yi & 255, xf = x - xi, yf = y - yi, u = fade(xf), v = fade(yf);
      const aa = perm[perm[X] + Y], ab = perm[perm[X] + Y + 1], ba = perm[perm[X + 1] + Y], bb = perm[perm[X + 1] + Y + 1];
      const l1 = grad(aa, xf, yf) + u * (grad(ba, xf - 1, yf) - grad(aa, xf, yf));
      const l2 = grad(ab, xf, yf - 1) + u * (grad(bb, xf - 1, yf - 1) - grad(ab, xf, yf - 1));
      return (l1 + v * (l2 - l1)) * 0.7;
    }
    // fbm у [-1,1]
    function fbm(x, y, oct, lac, gain) {
      oct = oct || 5; lac = lac || 2; gain = gain || 0.5;
      let a = 1, f = 1, s = 0, n = 0;
      for (let i = 0; i < oct; i++) { s += a * noise2(x * f + i * 17.3, y * f - i * 9.1); n += a; a *= gain; f *= lac; }
      return s / n;
    }
    return { noise2, fbm };
  }
  R.Noise = { makeNoise };
})();
