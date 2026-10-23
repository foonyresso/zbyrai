// Атлас 2.0, етап 1: ландшафт. Висота, рівень моря, суша/океан/озеро-западини. Край карти завжди океан.
(function () {
  'use strict';
  const A = globalThis.Atlas2, { components } = A.Grid;
  const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

  function terrain(p) {
    const { w, h } = p, N = w * h, nz = A.Noise.make(p.seed + '|t');
    const hh = new Float32Array(N), isl = p.worldType === 'islands';
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const nx = x / w, ny = y / h;
      const wx = nx + 0.14 * (nz.fbm(nx * 2.3 + 7, ny * 2.3 + 3, 3) - 0.5), wy = ny + 0.14 * (nz.fbm(nx * 2.3 + 31, ny * 2.3 + 19, 3) - 0.5);
      const base = nz.fbm(wx * 4.2, wy * 4.2, 6);
      let v;
      if (isl) { const m = nz.fbm(wx * 3.4 + 50, wy * 3.4 + 50, 4); v = 0.62 * m + 0.38 * base; }
      else {
        const dd = Math.hypot((nx - 0.5) * 2, (ny - 0.5) * 2) + 0.55 * (nz.fbm(nx * 1.7 + 90, ny * 1.7 + 40, 4) - 0.5);
        v = 0.65 * (1 - sstep(0.45, 1.0, dd)) + 0.5 * (base - 0.5) * (0.4 + 0.6 * (1 - sstep(0.3, 1.0, dd))) + 0.05;
      }
      const ridge = 1 - Math.abs(2 * nz.fbm(wx * 5 + 200, wy * 5 + 200, 4) - 1);
      v += p.rugged * 0.22 * Math.pow(ridge, 3) * sstep(0.4, 0.7, v);
      const edge = Math.min(nx, 1 - nx, ny, 1 - ny) * Math.min(w, h);
      hh[i2(x, y, w)] = v * sstep(2, Math.min(w, h) * 0.07, edge);
    }
    // рівень моря: квантиль під потрібну частку суші
    const sorted = Float32Array.from(hh).sort(), sea = sorted[Math.floor((1 - p.landFrac) * (N - 1))];
    let land = new Uint8Array(N); for (let i = 0; i < N; i++) land[i] = hh[i] > sea ? 1 : 0;
    // дрібні клаптики суші прибираємо
    const cc = components(w, h, i => land[i] === 1), minIsl = isl ? 14 : 40;
    for (let i = 0; i < N; i++) if (land[i] && cc.sizes[cc.id[i]] < minIsl) { land[i] = 0; hh[i] = sea - 0.002; }
    // океан = вода, пов'язана з краєм; решта води нижче рівня моря = озера-западини
    const wc = components(w, h, i => land[i] === 0), ocean = new Uint8Array(N), edgeIds = new Set();
    for (let x = 0; x < w; x++) { edgeIds.add(wc.id[x]); edgeIds.add(wc.id[(h - 1) * w + x]); }
    for (let y = 0; y < h; y++) { edgeIds.add(wc.id[y * w]); edgeIds.add(wc.id[y * w + w - 1]); }
    for (let i = 0; i < N; i++) if (!land[i] && edgeIds.has(wc.id[i])) ocean[i] = 1;
    // висота над морем 0..1 (для суші), під морем <0
    const elev = new Float32Array(N), mx = 1 - sea || 1;
    for (let i = 0; i < N; i++) elev[i] = (hh[i] - sea) / mx;
    return { height: hh, elev, sea, land, ocean };
  }
  function i2(x, y, w) { return y * w + x; }
  A.terrain = terrain;
})();
