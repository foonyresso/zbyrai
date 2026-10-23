// Атлас 2.0: параметри й межі. Усе детерміноване від seed + параметрів.
(function () {
  'use strict';
  const A = globalThis.Atlas2;
  const SIZES = { small: [200, 130], medium: [300, 200], large: [420, 280] };
  const DEF = { seed: 'atlas', size: 'medium', worldType: 'continent', provinces: 6, regionsPerProvince: 5, density: 1, rugged: 1, riverDensity: 1, landFrac: 0, lakeDepth: 0.014, lakeFlow: 40, kmPerCell: 2 };
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  function normalize(inp) {
    const p = Object.assign({}, DEF, inp || {});
    p.seed = String(p.seed || DEF.seed);
    if (!SIZES[p.size]) p.size = 'medium';
    [p.w, p.h] = SIZES[p.size];
    if (p.worldType !== 'islands') p.worldType = 'continent';
    p.provinces = clamp(Math.round(p.provinces), 1, 10);
    p.regionsPerProvince = clamp(Math.round(p.regionsPerProvince), 2, 9);
    p.density = clamp(+p.density, 0.3, 2.2); p.rugged = clamp(+p.rugged, 0, 2); p.riverDensity = clamp(+p.riverDensity, 0.1, 2.5);
    if (!(p.landFrac > 0)) p.landFrac = p.worldType === 'islands' ? 0.3 : 0.42;
    p.landFrac = clamp(+p.landFrac, 0.15, 0.7);
    return p;
  }
  A.Params = { SIZES, DEF, normalize };
})();
