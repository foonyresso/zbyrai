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
  // Спільна мережа меж: ребра між комірками з різними мітками збираються в ланцюги від вузла до вузла (вузол = кут, де сходяться ≠2 ребра).
  // Кожен ланцюг згладжується один раз і належить обом сусіднім міткам, тож між областями немає щілин і накладань.
  function net(w, h, label) {
    const W1 = w + 1, lab = (x, y) => (x < 0 || y < 0 || x >= w || y >= h) ? -1 : label(y * w + x), out = new Map(), deg = new Map(), edges = [];
    const add = (x0, y0, x1, y1, lo, hi) => { const e = { x0, y0, x1, y1, lo, hi, used: false }; edges.push(e); const k = y0 * W1 + x0; (out.get(k) || out.set(k, []).get(k)).push(e); deg.set(k, (deg.get(k) || 0) + 1); const k2 = y1 * W1 + x1; deg.set(k2, (deg.get(k2) || 0) + 1); };
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const a = lab(x, y); // ребро ставимо від комірки з більшою міткою (вона праворуч від напрямку)
      let b = lab(x, y - 1); if (a > b) add(x, y, x + 1, y, b, a);
      b = lab(x + 1, y); if (a > b) add(x + 1, y, x + 1, y + 1, b, a);
      b = lab(x, y + 1); if (a > b) add(x + 1, y + 1, x, y + 1, b, a);
      b = lab(x - 1, y); if (a > b) add(x, y + 1, x, y, b, a);
    }
    const chains = [], key = (x, y) => y * W1 + x, junction = k => deg.get(k) !== 2;
    const walk = (e0, closed) => {
      const pts = [], first = e0; let e = e0;
      while (e && !e.used) {
        e.used = true; pts.push(e.x0, e.y0); const k = key(e.x1, e.y1);
        if (!closed && junction(k)) { pts.push(e.x1, e.y1); return { pts, sk: key(first.x0, first.y0), ek: k, lo: first.lo, hi: first.hi, closed: false }; }
        e = (out.get(k) || []).find(n => !n.used);
      }
      return { pts, sk: key(first.x0, first.y0), ek: key(first.x0, first.y0), lo: first.lo, hi: first.hi, closed: true };
    };
    for (const e of edges) if (!e.used && junction(key(e.x0, e.y0))) chains.push(walk(e, false));
    for (const e of edges) if (!e.used) chains.push(walk(e, true));
    for (const c of chains) c.pts = c.closed ? chaikin(relax(c.pts, 3), 3, true) : chaikin(relaxOpen(c.pts, 3), 3, false);
    return chains;
  }
  function relaxOpen(pts, passes) {
    const n = pts.length / 2; if (n < 3) return pts;
    for (let t = 0; t < passes; t++) { const o = pts.slice(); for (let i = 1; i < n - 1; i++) { o[i * 2] = 0.5 * pts[i * 2] + 0.25 * (pts[i * 2 - 2] + pts[i * 2 + 2]); o[i * 2 + 1] = 0.5 * pts[i * 2 + 1] + 0.25 * (pts[i * 2 - 1] + pts[i * 2 + 3]); } pts = o; }
    return pts;
  }
  const rev = p => { const o = []; for (let i = p.length - 2; i >= 0; i -= 2) o.push(p[i], p[i + 1]); return o; };
  // замкнені контури області з мережі: inside(мітка) → чи належить мітка області
  function polys(chains, inside) {
    const sel = [];
    for (const c of chains) {
      const a = inside(c.lo), b = inside(c.hi); if (a === b) continue;
      sel.push(b ? { pts: c.pts, sk: c.sk, ek: c.ek, closed: c.closed } : { pts: rev(c.pts), sk: c.ek, ek: c.sk, closed: c.closed });
    }
    const by = new Map(); for (const c of sel) (by.get(c.sk) || by.set(c.sk, []).get(c.sk)).push(c);
    const res = [];
    for (const c0 of sel) {
      if (c0.used) continue; let pts = [], c = c0; const start = c0.sk;
      while (c && !c.used) { c.used = true; pts = pts.concat(c.pts); if (c.closed || c.ek === start) break; c = (by.get(c.ek) || []).find(n => !n.used); }
      if (pts.length >= 6) res.push(pts);
    }
    return res;
  }
  A.Contours = { net, polys, loops, chaikin, smoothLoops: (w, h, inside, it = 3) => loops(w, h, inside).map(p => chaikin(relax(p, 3), it, true)) };
})();
