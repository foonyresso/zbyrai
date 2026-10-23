// Атлас 2.0, етап 1: ландшафт. Висота, рівень моря, суша/океан/озеро-западини. Край карти завжди океан.
(function () {
  'use strict';
  const A = globalThis.Atlas2, { components } = A.Grid;
  const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

  // «хребти» материка: головний (довгий, будь-якого напрямку) і відгалуження від нього
  function makeSpines(p) {
    const r = A.Rng.stream(p.seed, 'shape'), { w, h } = p, out = [], rr = (a, b) => a + (b - a) * r();
    const ang0 = rr(-0.7, 0.7) + (r() < 0.25 ? Math.PI / 2 : 0), len0 = rr(0.4, 0.62) * (Math.abs(Math.cos(ang0)) > 0.6 ? w : h * 1.3), cx = w * rr(0.4, 0.6), cy = h * rr(0.4, 0.6);
    out.push({ x0: cx - Math.cos(ang0) * len0 / 2, y0: cy - Math.sin(ang0) * len0 / 2, x1: cx + Math.cos(ang0) * len0 / 2, y1: cy + Math.sin(ang0) * len0 / 2, w0: rr(0.11, 0.18), w1: rr(0.11, 0.18) });
    for (let k = 0, n = 2 + Math.floor(r() * 3); k < n; k++) {
      const par = out[Math.floor(r() * out.length)], t = rr(0.15, 0.85), sx = par.x0 + (par.x1 - par.x0) * t, sy = par.y0 + (par.y1 - par.y0) * t;
      const a = Math.atan2(par.y1 - par.y0, par.x1 - par.x0) + (r() < 0.5 ? 1 : -1) * rr(0.5, 1.4), len = rr(0.18, 0.4) * w;
      out.push({ x0: sx, y0: sy, x1: sx + Math.cos(a) * len, y1: sy + Math.sin(a) * len, w0: rr(0.08, 0.13), w1: rr(0.05, 0.09) });
    }
    return out;
  }
  function terrain(p) {
    const { w, h } = p, N = w * h, nz = A.Noise.make(p.seed + '|t');
    const spines = makeSpines(p), jr = A.Rng.stream(p.seed, 'micro'), hh = new Float32Array(N), isl = p.worldType === 'islands';
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const nx = x / w, ny = y / h;
      const wx = nx + 0.14 * (nz.fbm(nx * 2.3 + 7, ny * 2.3 + 3, 3) - 0.5), wy = ny + 0.14 * (nz.fbm(nx * 2.3 + 31, ny * 2.3 + 19, 3) - 0.5);
      const base = nz.fbm(wx * 4.2, wy * 4.2, 6);
      let v;
      if (isl) { const m = nz.fbm(wx * 3.4 + 50, wy * 3.4 + 50, 4); v = 0.62 * m + 0.38 * base; }
      else {
        // материк із «хребтів»: витягнуті частки різної довжини й напрямку + сильне викривлення = півострови, затоки, неправильна форма
        const X = wx * w, Y = wy * h;
        let dd = 9; for (const sp of spines) { const dx = sp.x1 - sp.x0, dy = sp.y1 - sp.y0, t = Math.max(0, Math.min(1, ((X - sp.x0) * dx + (Y - sp.y0) * dy) / (dx * dx + dy * dy))), wd = sp.w0 + (sp.w1 - sp.w0) * t; dd = Math.min(dd, Math.hypot(X - (sp.x0 + dx * t), Y - (sp.y0 + dy * t)) / (wd * w)); }
        dd += 0.6 * (nz.fbm(nx * 3.1 + 90, ny * 3.1 + 40, 5) - 0.5);
        v = 0.65 * (1 - sstep(0.55, 1.2, dd)) + 0.5 * (base - 0.5) * (0.4 + 0.6 * (1 - sstep(0.3, 1.2, dd))) + 0.05;
      }
      const ridge = 1 - Math.abs(2 * nz.fbm(wx * 5 + 200, wy * 5 + 200, 4) - 1);
      v += p.rugged * 0.22 * Math.pow(ridge, 3) * sstep(0.4, 0.7, v);
      const edge = Math.min(nx, 1 - nx, ny, 1 - ny) * Math.min(w, h);
      v += 0.012 * (jr() - 0.5); // мікрорельєф: річки не біжать рівними діагоналями
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
    for (let i = 0; i < N; i++) if (!land[i] && !ocean[i]) { land[i] = 1; hh[i] = sea + 0.002; } // внутрішня вода нижче моря не береться: озера утворюються лише в западинах за правилами стоку
    // висота над морем 0..1 (для суші), під морем <0
    let top = sea + 0.01; for (let i = 0; i < N; i++) if (hh[i] > top) top = hh[i];
    const elev = new Float32Array(N), mx = top - sea;
    for (let i = 0; i < N; i++) elev[i] = (hh[i] - sea) / mx;
    return { height: hh, elev, sea, land, ocean };
  }
  function i2(x, y, w) { return y * w + x; }
  A.terrain = terrain;
})();
