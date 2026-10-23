// Атлас 2.0: межі з міток комірок. Ребра комірок → замкнені контури → згладжування Чайкіна (однакове для сусідніх міток, тож межі збігаються).
(function () {
  'use strict';
  const A = globalThis.Atlas2;
  // inside(i) → чи належить комірка контуру; повертає масив контурів [[x,y,x,y,...], ...] у координатах комірок
  function loops(w, h, inside) {
    const W1 = w + 1, edges = [], out = new Map();
    const add = (x0, y0, x1, y1) => { const k = y0 * W1 + x0; const e = { x0, y0, x1, y1, used: false }; edges.push(e); (out.get(k) || out.set(k, []).get(k)).push(e); };
    const is = (x, y) => x >= 0 && y >= 0 && x < w && y < h && inside(y * w + x);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (!is(x, y)) continue;
      if (!is(x, y - 1)) add(x, y, x + 1, y);
      if (!is(x + 1, y)) add(x + 1, y, x + 1, y + 1);
      if (!is(x, y + 1)) add(x + 1, y + 1, x, y + 1);
      if (!is(x - 1, y)) add(x, y + 1, x, y);
    }
    const res = [];
    for (const e0 of edges) {
      if (e0.used) continue; const pts = []; let e = e0;
      while (e && !e.used) {
        e.used = true; pts.push(e.x0, e.y0);
        const nxt = out.get(e.y1 * W1 + e.x1) || []; e = nxt.find(n => !n.used);
      }
      if (pts.length >= 8) res.push(pts);
    }
    return res;
  }
  function chaikin(pts, iters, closed) {
    for (let t = 0; t < iters; t++) {
      const out = [], n = pts.length / 2;
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n; if (!closed && i === n - 1) break;
        const x0 = pts[i * 2], y0 = pts[i * 2 + 1], x1 = pts[j * 2], y1 = pts[j * 2 + 1];
        out.push(0.75 * x0 + 0.25 * x1, 0.75 * y0 + 0.25 * y1, 0.25 * x0 + 0.75 * x1, 0.25 * y0 + 0.75 * y1);
      }
      if (!closed) { out.unshift(pts[0], pts[1]); out.push(pts[pts.length - 2], pts[pts.length - 1]); }
      pts = out;
    }
    return pts;
  }
  // згладжування сходинок: кожна точка зсувається до середнього сусідів (замкнений контур)
  function relax(pts, passes) {
    const n = pts.length / 2; if (n < 6) return pts;
    for (let t = 0; t < passes; t++) { const o = pts.slice(); for (let i = 0; i < n; i++) { const a = (i + n - 1) % n, b = (i + 1) % n; o[i * 2] = 0.5 * pts[i * 2] + 0.25 * (pts[a * 2] + pts[b * 2]); o[i * 2 + 1] = 0.5 * pts[i * 2 + 1] + 0.25 * (pts[a * 2 + 1] + pts[b * 2 + 1]); } pts = o; }
    return pts;
  }
  A.Contours = { loops, chaikin, smoothLoops: (w, h, inside, it = 3) => loops(w, h, inside).map(p => chaikin(relax(p, 3), it, true)) };
})();
