// Атлас 2.0: геометрія доріг і водних шляхів для малювання. Шлях по клітинах → звивистий (зсув упоперек за плавним шумом, залежним лише від місця, тож спільні ділянки збігаються) → згладжений без прямих кутів.
(function () {
  'use strict';
  const A = globalThis.Atlas2, C = A.Contours;

  function build(W) {
    const { w, h } = W, nz = A.Noise.make(W.params.seed + '|wave'), near = new Float32Array(w * h).fill(99), q = [];
    for (const s of W.settlements) { near[s.i] = 0; q.push(s.i); } // біля поселень дорога не зміщується: вузли лишаються на місці
    for (let k = 0; k < q.length; k++) { const i = q[k]; if (near[i] >= 4) continue; const x = i % w, y = (i / w) | 0; for (let d = 0; d < 8; d++) { const nx = x + A.Grid.DX[d], ny = y + A.Grid.DY[d]; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue; const j = ny * w + nx; if (near[j] > near[i] + 1) { near[j] = near[i] + 1; q.push(j); } } }
    const off = (x, y) => (nz.fbm(x * 0.11 + 3, y * 0.11 + 7, 2) - 0.5) * 3.4 + (nz.fbm(x * 0.29 + 50, y * 0.29, 1) - 0.5) * 0.9;
    function wavy(cells, amp, fixedEnds) {
      const P = []; cells.forEach((i, n) => {
        const x = (i % w) + 0.5, y = ((i / w) | 0) + 0.5, pi = cells[Math.max(0, n - 1)], ni = cells[Math.min(cells.length - 1, n + 1)];
        let dx = (ni % w) - (pi % w), dy = ((ni / w) | 0) - ((pi / w) | 0); const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
        const t = Math.min(1, near[i] / 3), o = off(x, y) * amp * (fixedEnds ? t : 1); P.push(x - dy * o, y + dx * o);
      });
      return C.chaikin(C.relaxOpen(P, 3), 2, false);
    }
    return { roads: W.roads.map(r => ({ level: r.level, pts: wavy(r.cells, 1, true) })), sea: (W.seaRoutes || []).map(r => ({ pts: wavy(r.cells, 0.35, false) })) };
  }
  A.RoadGeom = { build };
})();
