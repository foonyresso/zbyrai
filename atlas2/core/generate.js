// Атлас 2.0: конвеєр генерації. Кожна стадія додає свої шари до світу. Детерміновано від seed + параметрів.
(function () {
  'use strict';
  const A = globalThis.Atlas2;
  function generate(input) {
    const p = A.Params.normalize(input), T = A.terrain(p), H = A.hydrology(p, T), C = A.climate(p, T, H);
    const world = { version: 1, params: p, w: p.w, h: p.h, sea: T.sea, height: T.height, elev: T.elev, land: T.land, ocean: T.ocean, lake: H.lake, river: H.river, acc: H.acc, down: H.down, rivers: H.rivers, lakes: H.lakes, temp: C.temp, moist: C.moist, bio: C.bio, waterDist: C.waterDist, riverThr: H.riverThr };
    for (const stage of A.stages || []) stage(world);
    return world;
  }
  A.generate = generate;
})();
