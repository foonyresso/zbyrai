// Контури з меж комірок: ребра між комірками з різними мітками → ланцюжки точок → згладжування (Чайкін).
// Чиста геометрія, без DOM: однаково працює для малювання на canvas, експорту SVG і для гри.
(function () {
  'use strict';
  const R = (globalThis.RealmMap = globalThis.RealmMap || {});

  // Ребра між сусідніми (4-зв’язно) комірками, де pairTest(a, b) істинний. Ребро = пара індексів вершин.
  function boundaryEdges(g, pairTest) {
    const vw = g.vw, E = [];
    for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
      const i = y * g.w + x, a = y * vw + x;
      if (x + 1 < g.w && pairTest(i, i + 1)) E.push(a + 1, a + 1 + vw); // спільне ребро справа
      if (y + 1 < g.h && pairTest(i, i + g.w)) E.push(a + vw, a + vw + 1); // спільне ребро знизу
    }
    return E;
  }
  // Ланцюжки ребер → полілінії (масиви індексів вершин); closed — чи замкнені
  function chainEdges(E) {
    const m = E.length / 2, adj = new Map();
    for (let e = 0; e < m; e++) for (const v of [E[2 * e], E[2 * e + 1]]) { if (!adj.has(v)) adj.set(v, []); adj.get(v).push(e); }
    const used = new Uint8Array(m), out = [];
    const other = (e, v) => (E[2 * e] === v ? E[2 * e + 1] : E[2 * e]);
    function walk(startV, e0) {
      const path = [startV]; let v = startV, e = e0;
      while (e >= 0 && !used[e]) {
        used[e] = 1; v = other(e, v); path.push(v);
        const list = adj.get(v); e = -1;
        for (const c of list) if (!used[c]) { e = c; break; }
      }
      return path;
    }
    for (const [v, list] of adj) if (list.length !== 2) for (const e of list) if (!used[e]) out.push({ v: walk(v, e), closed: false });
    for (let e = 0; e < m; e++) if (!used[e]) { const p = walk(E[2 * e], e); out.push({ v: p, closed: p[0] === p[p.length - 1] }); }
    return out;
  }
  function toPoints(g, vs) { const o = new Float32Array(vs.length * 2); vs.forEach((v, k) => { o[2 * k] = g.vx[v]; o[2 * k + 1] = g.vy[v]; }); return o; }
  // Чайкін: кожен відрізок замінюється двома точками на 1/4 і 3/4; кінці відкритих ліній лишаються на місці
  function chaikin(pts, closed, iters) {
    let p = pts;
    for (let it = 0; it < iters; it++) {
      const n = p.length / 2, out = [];
      if (!closed) out.push(p[0], p[1]);
      const last = closed ? n : n - 1;
      for (let i = 0; i < last; i++) {
        const j = (i + 1) % n, x0 = p[2 * i], y0 = p[2 * i + 1], x1 = p[2 * j], y1 = p[2 * j + 1];
        out.push(.75 * x0 + .25 * x1, .75 * y0 + .25 * y1, .25 * x0 + .75 * x1, .25 * y0 + .75 * y1);
      }
      if (!closed) out.push(p[2 * n - 2], p[2 * n - 1]);
      p = Float32Array.from(out);
    }
    return p;
  }
  // Готові згладжені лінії для заданого тесту меж
  function lines(g, pairTest, iters) {
    iters = iters === undefined ? 2 : iters;
    return chainEdges(boundaryEdges(g, pairTest)).map(c => { let closed = c.closed; const vs = closed ? c.v.slice(0, -1) : c.v; return { pts: chaikin(toPoints(g, vs), closed, iters), closed }; });
  }
  // Лінія шляху через центри комірок, згладжена
  function pathLine(g, cells, iters) {
    const pts = new Float32Array(cells.length * 2); cells.forEach((c, k) => { pts[2 * k] = g.cx[c]; pts[2 * k + 1] = g.cy[c]; });
    return chaikin(pts, false, iters === undefined ? 2 : iters);
  }

  // Найвіддаленіша від меж комірка кожної мітки: місце для підпису. labelOf(i) = мітка або -1
  function anchors(g, labelOf, count) {
    const edge = [], nb = new Int32Array(8);
    for (let i = 0; i < g.n; i++) { const l = labelOf(i); if (l < 0) continue; const m = R.Grid.neighbors(g, i, false, nb); let b = m < 4; for (let k = 0; k < m; k++) if (labelOf(nb[k]) !== l) b = true; if (b) edge.push(i); }
    const d = R.Grid.distanceField(g, edge, i => labelOf(i) >= 0, false), best = new Array(count).fill(-1);
    for (let i = 0; i < g.n; i++) { const l = labelOf(i); if (l < 0) continue; if (best[l] < 0 || d[i] > d[best[l]]) best[l] = i; }
    return best;
  }
  R.Contours = { boundaryEdges, chainEdges, chaikin, lines, pathLine, anchors };
})();
