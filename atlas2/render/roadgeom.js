// Атлас 2.0: геометрія доріг і водних шляхів для малювання. Шлях по клітинах → звивистий (зсув упоперек за плавним шумом, залежним лише від місця, тож спільні ділянки збігаються) → згладжений без прямих кутів.
(function () {
  'use strict';
  const A = globalThis.Atlas2, C = A.Contours;

  function build(W) {
    const { w, h } = W, nz = A.Noise.make(W.params.seed + '|wave'), near = new Float32Array(w * h).fill(99), q = [];
    for (const s of W.settlements) { near[s.i] = 0; q.push(s.i); } // біля поселень дорога не зміщується: вузли лишаються на місці
    for (let k = 0; k < q.length; k++) { const i = q[k]; if (near[i] >= 4) continue; const x = i % w, y = (i / w) | 0; for (let d = 0; d < 8; d++) { const nx = x + A.Grid.DX[d], ny = y + A.Grid.DY[d]; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue; const j = ny * w + nx; if (near[j] > near[i] + 1) { near[j] = near[i] + 1; q.push(j); } } }
    // зсув — гладке двовимірне поле від місця (не від напрямку дороги), тож дороги на спільних клітинах збігаються точно
    const ox = (x, y) => (nz.fbm(x * 0.11 + 3, y * 0.11 + 7, 2) - 0.5) * 3.2 + (nz.fbm(x * 0.29 + 50, y * 0.29, 1) - 0.5) * 0.8;
    const oy = (x, y) => (nz.fbm(x * 0.11 + 91, y * 0.11 + 13, 2) - 0.5) * 3.2 + (nz.fbm(x * 0.29, y * 0.29 + 70, 1) - 0.5) * 0.8;
    function wavy(cells, amp, fixedEnds) {
      const P = []; cells.forEach(i => {
        const x = (i % w) + 0.5, y = ((i / w) | 0) + 0.5, t = fixedEnds ? Math.min(1, near[i] / 3) : 1;
        P.push(x + ox(x, y) * amp * t, y + oy(x, y) * amp * t);
      });
      return C.chaikin(C.relaxOpen(P, 3), 2, false);
    }
    return { roads: W.roads.map(r => ({ level: r.level, pts: wavy(r.cells, 1, true) })), sea: (W.seaRoutes || []).map(r => ({ pts: wavy(r.cells, 0.35, false) })) };
  }
  A.RoadGeom = { build };
})();
