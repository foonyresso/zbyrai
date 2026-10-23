// Атлас 2.0, етап 4a: придатність місць для життя та суходоли (материки/острови).
(function () {
  'use strict';
  const A = globalThis.Atlas2, { DX, DY, components } = A.Grid;

  // suit[i] 0..1: рівнина, вода поруч, річка, берег; гори й вода дають 0
  function suitability(W) {
    const { w, h } = W, N = w * h, suit = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      if (!W.land[i] || W.lake[i]) continue;
      const x = i % w, y = (i / w) | 0; let slope = 0, coast = 0, lake = 0, river = 0;
      for (let d = 0; d < 8; d++) {
        const nx = x + DX[d], ny = y + DY[d]; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const j = ny * w + nx; slope = Math.max(slope, Math.abs(W.elev[j] - W.elev[i]));
        if (W.ocean[j]) coast = 1; if (W.lake[j]) lake = 1; if (W.river[j]) river = 1;
      }
      const wd = W.waterDist ? W.waterDist[i] : 9;
      let s = A.BIOMES[W.bio[i]].live * (1 - Math.min(1, slope * 14));
      s += 0.3 * (river || W.river[i] ? 1 : 0) + 0.22 * coast + 0.15 * lake + 0.12 * Math.exp(-wd / 5);
      suit[i] = Math.min(1, Math.max(0, s));
    }
    return suit;
  }
  // суходоли: id клітини → номер, список {id, area, cx, cy}
  function landmasses(W) {
    const { w, h } = W, c = components(w, h, i => W.land[i] === 1 && !W.lake[i]), list = c.sizes.map((s, id) => ({ id, area: s, cx: 0, cy: 0 }));
    for (let i = 0; i < w * h; i++) if (c.id[i] >= 0) { const m = list[c.id[i]]; m.cx += (i % w) / m.area; m.cy += ((i / w) | 0) / m.area; }
    return { id: c.id, list: list.sort((a, b) => b.area - a.area) };
  }
  A.suitability = suitability; A.landmasses = landmasses;
})();
