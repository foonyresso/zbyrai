// Сітка комірок зі зрушеними вершинами: комірка (x,y) — чотирикутник, сусідство — 4 або 8 напрямків.
// Усі масиви плоскі (індекс i = y*w + x), тому структура напряму переноситься на C# (float[], int[]).
(function () {
  'use strict';
  const R = (globalThis.RealmMap = globalThis.RealmMap || {});

  const DX8 = [1, 0, -1, 0, 1, -1, -1, 1], DY8 = [0, 1, 0, -1, 1, 1, -1, -1]; // перші 4 — прямі сусіди

  function makeGrid(w, h, seed, jitter) {
    jitter = jitter === undefined ? 0.32 : jitter;
    const r = R.Rng.stream(seed, 'grid'), vw = w + 1, vh = h + 1;
    const vx = new Float32Array(vw * vh), vy = new Float32Array(vw * vh);
    for (let y = 0; y < vh; y++) for (let x = 0; x < vw; x++) {
      const edge = x === 0 || y === 0 || x === w || y === h, j = edge ? 0 : jitter, k = y * vw + x;
      vx[k] = x + (r() - .5) * 2 * j; vy[k] = y + (r() - .5) * 2 * j;
    }
    const cx = new Float32Array(w * h), cy = new Float32Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const a = y * vw + x, b = a + 1, c = a + vw, d = c + 1;
      cx[y * w + x] = (vx[a] + vx[b] + vx[c] + vx[d]) / 4; cy[y * w + x] = (vy[a] + vy[b] + vy[c] + vy[d]) / 4;
    }
    return { w, h, n: w * h, vw, vh, vx, vy, cx, cy };
  }
  const X = (g, i) => i % g.w, Y = (g, i) => (i / g.w) | 0;
  // сусіди комірки: заповнює масив out (довжина >= 8), повертає кількість; diag — чи брати діагоналі
  function neighbors(g, i, diag, out) {
    const x = i % g.w, y = (i / g.w) | 0, m = diag ? 8 : 4; let c = 0;
    for (let k = 0; k < m; k++) { const nx = x + DX8[k], ny = y + DY8[k]; if (nx >= 0 && ny >= 0 && nx < g.w && ny < g.h) out[c++] = ny * g.w + nx; }
    return c;
  }
  const dist = (g, a, b) => Math.hypot(g.cx[a] - g.cx[b], g.cy[a] - g.cy[b]);

  // BFS-відстань (у комірках) від множини джерел крізь комірки, що проходять тест pass(i)
  function distanceField(g, sources, pass, diag) {
    const d = new Int32Array(g.n).fill(-1), q = new Int32Array(g.n), nb = new Int32Array(8); let qh = 0, qt = 0;
    for (const s of sources) if (d[s] < 0) { d[s] = 0; q[qt++] = s; }
    while (qh < qt) { const c = q[qh++], m = neighbors(g, c, diag, nb); for (let k = 0; k < m; k++) { const j = nb[k]; if (d[j] < 0 && pass(j)) { d[j] = d[c] + 1; q[qt++] = j; } } }
    return d;
  }
  // зв’язні компоненти за мітками: повертає {id: Int32Array, sizes: []}
  function components(g, test, diag) {
    const id = new Int32Array(g.n).fill(-1), sizes = [], nb = new Int32Array(8), st = [];
    for (let s = 0; s < g.n; s++) {
      if (id[s] >= 0 || !test(s)) continue;
      const cid = sizes.length; let cnt = 0; id[s] = cid; st.push(s);
      while (st.length) { const c = st.pop(); cnt++; const m = neighbors(g, c, diag, nb); for (let k = 0; k < m; k++) { const j = nb[k]; if (id[j] < 0 && test(j)) { id[j] = cid; st.push(j); } } }
      sizes.push(cnt);
    }
    return { id, sizes };
  }
  R.Grid = { DX8, DY8, makeGrid, X, Y, neighbors, dist, distanceField, components };
})();
