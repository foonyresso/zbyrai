// Параметри генерації: значення за замовчуванням, межі, розміри карти.
(function () {
  'use strict';
  const R = (globalThis.RealmMap = globalThis.RealmMap || {});
  const SIZES = { s: { w: 120, h: 76, provinces: 3, name: 'Мала' }, m: { w: 168, h: 106, provinces: 5, name: 'Середня' }, l: { w: 240, h: 150, provinces: 7, name: 'Велика' } };
  const clamp = (v, a, b, d) => { v = Number(v); return Number.isFinite(v) ? Math.min(b, Math.max(a, v)) : d; };

  function defaults() {
    return { seed: 'zbyrai', size: 'm', worldType: 'continent', provinces: 5, regionsPerProvince: 5, density: 1, monsters: 1, kmPerCell: 2, ruggedness: 0.5, wet: 0, warm: 0, fantasy: 1, riverDensity: 1 };
  }
  // Повна нормалізація: будь-який об’єкт (з посилання, JSON, форми) → коректні параметри
  function normalize(inp) {
    const d = defaults(), p = Object.assign({}, d, inp || {});
    p.seed = String(p.seed === undefined || p.seed === '' ? d.seed : p.seed).slice(0, 40);
    if (!SIZES[p.size]) p.size = d.size;
    if (!R.Terrain.WORLD_TYPES[p.worldType]) p.worldType = d.worldType;
    p.provinces = Math.round(clamp(p.provinces, 1, 10, SIZES[p.size].provinces));
    p.regionsPerProvince = Math.round(clamp(p.regionsPerProvince, 2, 9, d.regionsPerProvince));
    p.density = clamp(p.density, 0.3, 2.2, 1); p.monsters = clamp(p.monsters, 0, 2.5, 1);
    p.kmPerCell = clamp(p.kmPerCell, 0.5, 20, 2); p.ruggedness = clamp(p.ruggedness, 0, 1, 0.5);
    p.wet = clamp(p.wet, -0.3, 0.3, 0); p.warm = clamp(p.warm, -0.3, 0.3, 0); p.fantasy = clamp(p.fantasy, 0, 2, 1); p.riverDensity = clamp(p.riverDensity, 0.3, 2.5, 1);
    // морські шляхи: бажана смуга від берега 2–4 км → у комірках; глибина лігв далі за смугу
    p.seaPrefMax = Math.max(1, Math.round(4 / p.kmPerCell)); p.seaDeepMin = p.seaPrefMax + 2;
    return p;
  }
  R.Params = { SIZES, defaults, normalize };
})();
