// Рельєф: висоти з шуму та масок за типом світу, рівень моря за часткою суші, поділ води на море й озера.
(function () {
  'use strict';
  const R = (globalThis.RealmMap = globalThis.RealmMap || {});
  const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

  // Частка суші за типом світу
  const WORLD_TYPES = {
    continent: { name: 'Материки', land: 0.44 },
    archipelago: { name: 'Архіпелаг', land: 0.30 },
    island: { name: 'Один острів', land: 0.34 },
    pangea: { name: 'Суходіл із морями', land: 0.58 },
  };

  function genHeight(g, p, nz) {
    const { w, h } = g, ht = new Float32Array(g.n), t = p.worldType, rug = p.ruggedness;
    const f = t === 'archipelago' ? 4.2 : t === 'pangea' ? 2.0 : 2.7, ar = w / h;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x, nx = x / w, ny = y / h, px = nx * ar * f, py = ny * f;
      // доменне викривлення для менш «шумного» вигляду берегів
      const wx = px + nz.fbm(px * .6 + 40, py * .6, 3) * .55, wy = py + nz.fbm(px * .6, py * .6 + 40, 3) * .55;
      let v = nz.fbm(wx, wy, 6, 2, .5) * .5 + .5;
      const d = Math.hypot((nx - .5) / .5, (ny - .5) / .5);
      if (t === 'island') v = v * .5 + (1 - smooth(.18, .9, d)) * .62;
      else if (t === 'continent') { const low = nz.fbm(nx * ar * 1.25 + 90, ny * 1.25, 3) * .5 + .5; v = v * .5 + low * .3 + (1 - smooth(.5, 1.15, d)) * .2; }
      else if (t === 'pangea') v = v * .72 + (1 - smooth(.55, 1.2, d)) * .3;
      // гірські пасма: гребені шуму, що проявляються на високих ділянках
      const rid = 1 - Math.abs(nz.fbm(px * 1.4 + 11, py * 1.4 - 7, 5)), ridge = rid * rid * rid;
      v += ridge * (.16 + .16 * rug) * smooth(.42, .68, v);
      const edge = Math.min(nx, 1 - nx, ny, 1 - ny); v *= smooth(0, .09, edge);
      ht[i] = v;
    }
    // легке згладжування, щоб не було «зубців»
    const o = new Float32Array(ht), nb = new Int32Array(8);
    for (let i = 0; i < g.n; i++) { const m = R.Grid.neighbors(g, i, true, nb); let s = ht[i] * 2; for (let k = 0; k < m; k++) s += ht[nb[k]]; o[i] = s / (m + 2); }
    return o;
  }

  // рівень моря: квантиль висот так, щоб частка суші відповідала світу
  function seaLevel(ht, landFrac) {
    const s = Float32Array.from(ht).sort(); return s[Math.min(s.length - 1, Math.floor(s.length * (1 - landFrac)))];
  }

  // Вода: 0 — суша, 1 — море (з’єднане з краєм або велике), 2 — озеро.
  function classifyWater(g, ht, sl) {
    const water = new Uint8Array(g.n);
    const comp = R.Grid.components(g, i => ht[i] <= sl, false), edgeTouch = new Uint8Array(comp.sizes.length);
    for (let i = 0; i < g.n; i++) if (comp.id[i] >= 0) { const x = i % g.w, y = (i / g.w) | 0; if (x === 0 || y === 0 || x === g.w - 1 || y === g.h - 1) edgeTouch[comp.id[i]] = 1; }
    const seaMin = Math.max(60, g.n * 0.012);
    for (let i = 0; i < g.n; i++) { const c = comp.id[i]; if (c >= 0) water[i] = (edgeTouch[c] || comp.sizes[c] >= seaMin) ? 1 : 2; }
    return water;
  }
  R.Terrain = { WORLD_TYPES, genHeight, seaLevel, classifyWater, smooth };
})();
