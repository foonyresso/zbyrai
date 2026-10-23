// Атлас 2.0: конвеєр генерації. Кожна стадія додає свої шари до світу. Детерміновано від seed + параметрів.
(function () {
  'use strict';
  const A = globalThis.Atlas2;
  // річкові долини: русло знижує рельєф, тож річка стає частиною ландшафту (світлотінь, схили доріг)
  function carveValleys(T, H) {
    let mx = 1; for (let i = 0; i < H.acc.length; i++) if (H.acc[i] > mx) mx = H.acc[i];
    for (let i = 0; i < H.river.length; i++) if (H.river[i]) T.elev[i] -= 0.012 + 0.035 * Math.sqrt(H.acc[i] / mx);
    return true;
  }
  function generate(input) {
    const p = A.Params.normalize(input), T = A.terrain(p), H = A.hydrology(p, T), carve = carveValleys(T, H), C = A.climate(p, T, H);
    const world = { version: 1, params: p, w: p.w, h: p.h, sea: T.sea, height: T.height, elev: T.elev, land: T.land, ocean: T.ocean, lake: H.lake, river: H.river, acc: H.acc, down: H.down, rivers: H.rivers, lakes: H.lakes, temp: C.temp, moist: C.moist, bio: C.bio, waterDist: C.waterDist, riverThr: H.riverThr };
    for (const stage of A.stages || []) stage(world);
    return world;
  }
  A.generate = generate;
})();
