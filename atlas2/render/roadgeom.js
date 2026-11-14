// Атлас 2.0: геометрія доріг і водних шляхів для малювання. Шлях по клітинах → звивистий (зсув упоперек за плавним шумом, залежним лише від місця, тож спільні ділянки збігаються) → згладжений без прямих кутів.
(function () {
  'use strict';
  const A = globalThis.Atlas2, C = A.Contours;

  function build(W) {
    const { w, h } = W, nz = A.Noise.make(W.params.seed + '|wave'), near = new Float32Array(w * h).fill(99), q = [];
    const ALL = W.roads.concat((W.resRoads || []).map(r => ({ level: r.kind === 'cart' ? 5 : 6, cells: r.cells, sid: r.sid }))); // дороги до точок ресурсів малюються так само звивисто, але до міст не передаються
    for (const s of W.settlements.concat(W.landmarks || [], W.resources || [])) { near[s.i] = 0; q.push(s.i); } // біля поселень дорога не зміщується: вузли лишаються на місці
    for (let k = 0; k < q.length; k++) { const i = q[k]; if (near[i] >= 4) continue; const x = i % w, y = (i / w) | 0; for (let d = 0; d < 8; d++) { const nx = x + A.Grid.DX[d], ny = y + A.Grid.DY[d]; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue; const j = ny * w + nx; if (near[j] > near[i] + 1) { near[j] = near[i] + 1; q.push(j); } } }
    // зсув — гладке двовимірне поле від місця (не від напрямку дороги), тож дороги на спільних клітинах збігаються точно
    const ox = (x, y) => (nz.fbm(x * 0.11 + 3, y * 0.11 + 7, 2) - 0.5) * 7.5 + (nz.fbm(x * 0.29 + 50, y * 0.29, 1) - 0.5) * 2.4;
    const oy = (x, y) => (nz.fbm(x * 0.11 + 91, y * 0.11 + 13, 2) - 0.5) * 7.5 + (nz.fbm(x * 0.29, y * 0.29 + 70, 1) - 0.5) * 2.4;
    function wavy(cells, amp, fixedEnds) {
      const P = []; cells.forEach(i => {
        const x = (i % w) + 0.5, y = ((i / w) | 0) + 0.5, u = fixedEnds ? Math.min(1, near[i] / 4) : 1, t = u * u * (3 - 2 * u);
        P.push(x + ox(x, y) * amp * t, y + oy(x, y) * amp * t);
      });
      const Q = C.chaikin(C.relaxOpen(P, 3), 2, false); // дрібний звивистий зсув у масштабі клітини: при великому наближенні дорога не рівна, як лінійка; біля поселень без зсуву
      for (let k = 0; k < Q.length; k += 2) { const x = Q[k], y = Q[k + 1], cx = Math.min(w - 1, Math.max(0, Math.floor(x))), cy = Math.min(h - 1, Math.max(0, Math.floor(y))), u = fixedEnds ? Math.min(1, near[cy * w + cx] / 1.4) : 1, t = u * u * (3 - 2 * u) * amp; if (t > 0) { Q[k] += (nz.fbm(x * 0.7 + 11, y * 0.7 + 5, 2) - 0.5) * 1.8 * t; Q[k + 1] += (nz.fbm(x * 0.7 + 37, y * 0.7 + 83, 2) - 0.5) * 1.8 * t; } }
      return C.chaikin(Q, 1, false);
    }
    // стики: якщо відрізок кінчається в клітині, що є серединою іншого, той розрізається там — кінці згладжуються нерухомими, тож стик точний
    const inner = new Map(); ALL.forEach((r, n) => { for (let k = 1; k < r.cells.length - 1; k++) (inner.get(r.cells[k]) || inner.set(r.cells[k], []).get(r.cells[k])).push(n); });
    const cuts = new Map(); for (const r of ALL) for (const e of [r.cells[0], r.cells[r.cells.length - 1]]) for (const n of inner.get(e) || []) (cuts.get(n) || cuts.set(n, new Set()).get(n)).add(e);
    const pieces = []; ALL.forEach((r, n) => {
      const cs = cuts.get(n); if (!cs) { pieces.push(r); return; }
      let from = 0; for (let k = 1; k < r.cells.length; k++) if (cs.has(r.cells[k]) || k === r.cells.length - 1) { if (k - from >= 1) pieces.push({ level: r.level, sid: r.sid, cells: r.cells.slice(from, k + 1) }); from = k; }
    });
    const pts = pieces.map(r => ({ level: r.level, sid: r.sid, pts: wavy(r.cells, 1, true) }));
    return { roads: pts.filter(r => r.level <= 4), res: pts.filter(r => r.level > 4), sea: (W.seaRoutes || []).map(r => ({ pts: wavy(r.cells, 0.35, false) })) };
  }
  A.RoadGeom = { build };
})();
