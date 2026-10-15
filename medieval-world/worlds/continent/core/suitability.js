// Придатність комірки для поселення: біом, близькість до річки, берега, озера, нахил. Використовується для столиць, міст, сіл.
(function () {
  'use strict';
  const R = (globalThis.RealmMap = globalThis.RealmMap || {});
  const BIOME_SUIT = { grass: 1.0, steppe: 0.8, forest: 0.55, taiga: 0.4, enchanted: 0.3, hills: 0.5, mountain: 0.12, peaks: 0, swamp: 0.18, desert: 0.22, tundra: 0.25, wasteland: 0.18 };

  function suitability(g, bio, water, river, ht, seed) {
    const out = new Float32Array(g.n), nb = new Int32Array(8), rnd = R.Rng.stream(seed, 'suit'), biomes = R.Data.biomes;
    for (let i = 0; i < g.n; i++) {
      if (water[i]) continue;
      let s = BIOME_SUIT[biomes[bio[i]].id] || 0.1, nearRiver = river[i] ? 1 : 0, nearSea = 0, nearLake = 0, slope = 0;
      const m = R.Grid.neighbors(g, i, true, nb);
      for (let k = 0; k < m; k++) { const j = nb[k]; if (river[j]) nearRiver = 1; if (water[j] === 1) nearSea = 1; else if (water[j] === 2) nearLake = 1; slope = Math.max(slope, Math.abs(ht[i] - ht[j])); }
      s += nearRiver * 0.4 + nearSea * 0.25 + nearLake * 0.25 - Math.min(0.5, slope * 6);
      out[i] = Math.max(0, s) * (0.88 + rnd() * 0.24);
    }
    return out;
  }
  R.Suitability = { suitability };
})();
