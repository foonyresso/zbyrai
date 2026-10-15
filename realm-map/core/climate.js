// Клімат і біоми: температура (широта + висота), вологість (шум + близькість до води + річки), потім біом кожної комірки.
(function () {
  'use strict';
  const R = (globalThis.RealmMap = globalThis.RealmMap || {});

  // Повертає {temp, moist, el (відносна висота суші 0..1), shoreDist}
  function genClimate(g, ht, water, sl, p, nz) {
    const n = g.n, temp = new Float32Array(n), moist = new Float32Array(n), el = new Float32Array(n);
    let maxH = sl; for (let i = 0; i < n; i++) if (ht[i] > maxH) maxH = ht[i];
    const waterSrc = []; for (let i = 0; i < n; i++) if (water[i]) waterSrc.push(i);
    const wd = R.Grid.distanceField(g, waterSrc, () => true, true);
    const ar = g.w / g.h;
    // висота суші — перцентиль серед усієї суші: частки гір і пагорбів стабільні для будь-якого зерна
    const land = []; for (let i = 0; i < n; i++) if (!water[i]) land.push(ht[i]);
    land.sort((a, b) => a - b);
    const pct = v => { let lo = 0, hi = land.length; while (lo < hi) { const m = (lo + hi) >> 1; if (land[m] < v) lo = m + 1; else hi = m; } return land.length ? lo / land.length : 0; };
    for (let i = 0; i < n; i++) {
      const x = i % g.w, y = (i / g.w) | 0, nx = x / g.w, ny = y / g.h;
      el[i] = water[i] ? 0 : pct(ht[i]);
      temp[i] = 0.08 + 0.78 * ny + p.warm + nz.fbm(nx * ar * 2.1 + 5, ny * 2.1 + 5, 3) * 0.08 - Math.max(0, el[i] - 0.6) * 1.1;
      const coast = Math.exp(-wd[i] / 9) * 0.22;
      moist[i] = 0.5 + nz.fbm(nx * ar * 3 + 70, ny * 3 + 70, 4) * 0.5 + coast + p.wet;
    }
    // вологість і «магія» — теж перцентилі по суші, щоб частки біомів не залежали від зерна
    const rank = arr => { const idx = []; for (let i = 0; i < n; i++) if (!water[i]) idx.push(i); idx.sort((a, b) => arr[a] - arr[b] || a - b); const o = new Float32Array(n); idx.forEach((i, k) => { o[i] = (k + 0.5) / idx.length; }); return o; };
    const mr = rank(moist);
    const magic = new Float32Array(n);
    for (let i = 0; i < n; i++) { const x = i % g.w, y = (i / g.w) | 0; magic[i] = nz.fbm((x / g.w) * ar * 3.4 + 200, (y / g.h) * 3.4 + 200, 4); }
    return { temp, moist: mr, el, waterDist: wd, magic: rank(magic) };
  }

  // Ширші зони води: глибоке море — далі за 3 комірки від суші
  function assignBiomes(g, water, clim, riverMask, p, nz) {
    const B = R.Data.B, n = g.n, bio = new Uint8Array(n);
    const landSrc = []; for (let i = 0; i < n; i++) if (!water[i]) landSrc.push(i);
    const shore = R.Grid.distanceField(g, landSrc, () => true, true); // для води: відстань до суші
    for (let i = 0; i < n; i++) {
      if (water[i] === 2) { bio[i] = B.LAKE; continue; }
      if (water[i] === 1) { bio[i] = shore[i] > 3 ? B.DEEP : B.SEA; continue; }
      const el = clim.el[i], t = clim.temp[i];
      let m = clim.moist[i]; if (riverMask[i]) m += 0.06;
      const magic = clim.magic[i];
      let b;
      const rg = p.ruggedness; // 0..1: більше гір
      if (el > 1 - 0.035 * (0.5 + rg) || (t < 0.12 && el > 0.9)) b = B.PEAKS;
      else if (el > 1 - 0.12 * (0.5 + rg)) b = B.MOUNTAIN;
      else if (el > 1 - 0.30 * (0.5 + rg)) b = B.HILLS;
      else if (t < 0.22) b = m > 0.5 ? B.TAIGA : B.TUNDRA;
      else if (m > 0.955 && el < 0.2) b = B.SWAMP;
      else if (m < 0.1 && t > 0.55) b = B.DESERT;
      else if (m < 0.24) b = B.STEPPE;
      else if (m > 0.62) b = t < 0.34 ? B.TAIGA : B.FOREST;
      else b = B.GRASS;
      if ((b === B.FOREST || b === B.TAIGA) && magic > 1 - 0.14 * p.fantasy) b = B.ENCHANTED;
      else if ((b === B.GRASS || b === B.STEPPE || b === B.DESERT) && magic < 0.08 * p.fantasy) b = B.WASTELAND;
      bio[i] = b;
    }
    return { bio, shore };
  }
  R.Climate = { genClimate, assignBiomes };
})();
