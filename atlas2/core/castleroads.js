// Атлас 2.0, замок: вулиці навколо замку. Мур не лягає на проспект, кільце чи набережну (багатокутник відсувається від них), усе, що опиняється всередині муру, прибирається
// (ламана ділиться, зовнішні частини лишаються тупиками біля муру), а до воріт підводяться дороги від найближчих вулиць.
(function () {
  'use strict';
  const A = globalThis.Atlas2, G = A.KeepGeo, clamp = G.clamp;
  const RANKB = { avenue: -8, ring: -6, embankment: -5, street: -3, lane: 0, path: 5 };
  const plen = p => { let s = 0; for (let i = 2; i < p.length; i += 2) s += Math.hypot(p[i] - p[i - 2], p[i + 1] - p[i - 1]); return s; };
  // відсуває вершини й середини сторін багатокутника P від «твердих» доріг (kinds) на hw + w/2 + pad; повертає новий багатокутник (або P, якщо не вдалося лишити його простим)
  function fit(P, c) {
    const segs = []; for (const st of c.streets) { if (!c.hard.has(st.kind)) continue; const p = st.pts; for (let i = 2; i < p.length; i += 2) segs.push([p[i - 2], p[i - 1], p[i], p[i + 1], st.hw + c.w / 2 + (c.pad == null ? 1.2 : c.pad)]); }
    if (!segs.length) return P;
    const probe = (x, y) => { let bd = 1e18, bs = null; for (const s of segs) { const d = G.segDist(x, y, s[0], s[1], s[2], s[3]) - s[4]; if (d < bd) { bd = d; bs = s; } } return bs ? { d: bd, s: bs } : null; };
    const push = (v, q) => { const s = q.s, ex = s[2] - s[0], ey = s[3] - s[1], l2 = ex * ex + ey * ey || 1e-9, t = clamp(((v[0] - s[0]) * ex + (v[1] - s[1]) * ey) / l2, 0, 1), px = s[0] + ex * t, py = s[1] + ey * t, dd = Math.hypot(v[0] - px, v[1] - py) || 1e-9, k = (-q.d + 0.35) / dd, nx = v[0] + (v[0] - px) * k, ny = v[1] + (v[1] - py) * k; if (c.WK(nx, ny) !== 0) return false; v[0] = nx; v[1] = ny; return true; };
    let Q = P.map(p => p.slice()), ch = false;
    for (let it = 0; it < 8; it++) {
      let moved = false;
      for (const v of Q) { const q = probe(v[0], v[1]); if (q && q.d < 0 && push(v, q)) moved = true; }
      for (let i = 0; i < Q.length; i++) { const a = Q[i], b = Q[(i + 1) % Q.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (L < 9) continue;
        for (const t of [0.25, 0.5, 0.75]) { const v = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], q = probe(v[0], v[1]); if (q && q.d < 0 && push(v, q)) { Q.splice(i + 1, 0, v); moved = true; break; } } }
      if (!moved) break; ch = true;
    }
    if (!ch) return P; Q = G.tidy(Q, 5, 0.1); return Q.length >= 4 && G.simple(Q) && G.area(Q) > G.area(P) * 0.6 ? G.orient(Q) : P;
  }
  // розтин ламаної st: частини поза (ins === false), кінці — у точках перетину
  function cutStreet(st, ins) {
    const p = st.pts, b = st.br, n = p.length / 2, parts = []; let cur = null, ps = null;
    for (let i = 0; i < n; i++) {
      const x = p[i * 2], y = p[i * 2 + 1], s = ins(x, y);
      if (i && s !== ps) { const ax = p[i * 2 - 2], ay = p[i * 2 - 1]; let lo = 0, hi = 1; for (let k = 0; k < 20; k++) { const m = (lo + hi) / 2; if (ins(ax + (x - ax) * m, ay + (y - ay) * m) === ps) lo = m; else hi = m; }
        const t = (lo + hi) / 2, qx = ax + (x - ax) * t, qy = ay + (y - ay) * t; if (!ps && cur) { cur.pts.push(qx, qy); cur.br.push(b[i]); cur.ce = 1; parts.push(cur); cur = null; } else if (ps) cur = { pts: [qx, qy], br: [0], cs: 1 }; }
      if (!s) { if (!cur) cur = { pts: [], br: [] }; cur.br.push(cur.pts.length ? b[i] : 0); cur.pts.push(x, y); }
      ps = s;
    }
    if (cur) parts.push(cur); return parts;
  }
  // згладжування ламаної (Чайкін), кінці лишаються
  function chaikin(p, it) { for (let k = 0; k < it; k++) { const o = [p[0], p[1]]; for (let i = 2; i < p.length; i += 2) { const ax = p[i - 2], ay = p[i - 1], bx = p[i], by = p[i + 1]; o.push(ax * 0.75 + bx * 0.25, ay * 0.75 + by * 0.25, ax * 0.25 + bx * 0.75, ay * 0.25 + by * 0.75); } o.push(p[p.length - 2], p[p.length - 1]); p = o; } return p; }
  const renumber = streets => { const map = new Map(); streets.forEach((st, i) => map.set(st.id, i)); streets.forEach((st, i) => { st.id = i; st.parent = map.has(st.parent) ? map.get(st.parent) : -1; }); };
  // кандидати для підведення дороги від воріт (gx,gy) у напрямку виходу (dx,dy): найближчі вуличні точки, найкращі першими: [{st, i, x, y, d}]
  function targets(c, gx, gy, dx, dy, reach) {
    const out = [];
    for (const st of c.streets) { const p = st.pts; if (p.length < 4) continue; let best = null, bs = 1e18; for (let i = 2; i < p.length; i += 2) {
      const ax = p[i - 2], ay = p[i - 1], ex = p[i] - ax, ey = p[i + 1] - ay, l2 = ex * ex + ey * ey || 1e-9, t = clamp(((gx - ax) * ex + (gy - ay) * ey) / l2, 0, 1), qx = ax + ex * t, qy = ay + ey * t, d = Math.hypot(qx - gx, qy - gy); if (d > reach) continue;
      const cs = d > 0.5 ? ((qx - gx) * dx + (qy - gy) * dy) / d : 1; if (cs < 0.15 || G.inside(c.poly, qx, qy) || G.crossesEdge(c.poly, gx, gy, qx, qy)) continue;
      const sc = d + (1 - cs) * 30 + (RANKB[st.kind] || 0); if (sc < bs) { bs = sc; best = { st, i, x: qx, y: qy, d, sc }; } }
      if (best) out.push(best); }
    return out.sort((a, b) => a.sc - b.sc).slice(0, 6);
  }
  // дорога не перетинає інші вулиці (крім стику на кінці) і не заходить у замок
  function stubOK(c, pts) {
    for (let i = 0; i < pts.length; i += 2) if (G.sdist(c.poly, pts[i], pts[i + 1]) > -c.w / 2) return false;
    for (let i = 2; i < pts.length; i += 2) { const last = i === pts.length - 2;
      for (const st of c.streets) { const p = st.pts; for (let j = 2; j < p.length; j += 2) { const h = G.segHit(pts[i - 2], pts[i - 1], pts[i], pts[i + 1], p[j - 2], p[j - 1], p[j], p[j + 1]); if (h && !(last && h[0] > 0.9)) return false; } } }
    return true;
  }
  // c: {streets, nA, poly, w, hard, gates, F, WK}; змінює масив streets на місці (вулиці всередині зникають, нові дороги до воріт, нумерація заново); повертає {nA, stubs}
  function carve(c) {
    const { streets, poly } = c, margin = c.w / 2 + 0.7, ins = (x, y) => G.sdist(poly, x, y) > -margin, bb = G.bbox(poly), lim = c.nA, old = [], young = [], cuts = []; let nid = 1e6;
    streets.forEach((st, i) => {
      const dst = i < lim ? old : young; if (c.hard.has(st.kind) || st.pts.length < 4) { dst.push(st); return; }
      const p = st.pts; let x0 = 1e18, y0 = 1e18, x1 = -1e18, y1 = -1e18; for (let k = 0; k < p.length; k += 2) { if (p[k] < x0) x0 = p[k]; if (p[k] > x1) x1 = p[k]; if (p[k + 1] < y0) y0 = p[k + 1]; if (p[k + 1] > y1) y1 = p[k + 1]; }
      if (x1 < bb[0] - margin || x0 > bb[2] + margin || y1 < bb[1] - margin || y0 > bb[3] + margin) { dst.push(st); return; }
      const parts = cutStreet(st, ins).filter(q => plen(q.pts) >= 6);
      parts.forEach((q, k) => { const s2 = k === 0 ? st : Object.assign({}, st, { id: nid++ }); s2.pts = q.pts; s2.br = q.br; dst.push(s2); if (q.cs || q.ce) cuts.push({ st: s2, cs: q.cs, ce: q.ce }); });
    });
    // концям розрізу, що впали на кілька десятків сантиметрів від вершини іншої вулиці, лишаємо ту саму вершину (без майже збіжних кінців)
    { const vs = []; for (const st of old.concat(young)) for (let i = 0; i < st.pts.length; i += 2) vs.push([st.pts[i], st.pts[i + 1], st]);
      for (const q of cuts) for (const end of [0, 1]) { if (!(end ? q.ce : q.cs)) continue; const p = q.st.pts, idx = end ? p.length - 2 : 0; let bv = null, bd = 1.5; for (const v of vs) { if (v[2] === q.st) continue; const d = Math.hypot(v[0] - p[idx], v[1] - p[idx + 1]); if (d < bd && d > 1e-9) { bd = d; bv = v; } } if (bv && !ins(bv[0], bv[1])) { p[idx] = bv[0]; p[idx + 1] = bv[1]; } } }
    // дороги до воріт: від найближчої вулиці без перетинів; головна може бути довгою
    const stubs = [], all = old.concat(young), cc = { streets: all, poly, w: c.w };
    for (const g of c.gates) {
      if (g.kind === 'water' || g.kind === 'sally') continue;
      const dx = Math.cos(g.a), dy = Math.sin(g.a), off = c.w / 2 + 0.6, gx = g.x + dx * off, gy = g.y + dy * off; let pick = null, served = false;
      if (c.F && c.F.some(f => f.t === 'plaza' && Math.hypot(f.x - gx, f.y - gy) < f.r + 3)) served = true; // брама виходить просто на площу
      for (const st of all) { if (served) break; const p = st.pts; for (let i = 2; i < p.length && !served; i += 2) if (G.segDist(gx, gy, p[i - 2], p[i - 1], p[i], p[i + 1]) - st.hw < 2.5) served = true; }
      if (served) continue;
      for (const reach of g.main ? [95, 170] : g.kind === 'rear' ? [55] : [32]) {
        for (const tg of targets(cc, gx, gy, dx, dy, reach)) {
          if (tg.d <= 5) { pick = { tg, pts: null }; break; }
          if (c.F && c.F.some(f => (f.t === 'pond' || f.t === 'site') && G.segDist(f.x, f.y, gx, gy, tg.x, tg.y) < f.r + 2)) continue;
          const s1 = Math.min(6, tg.d * 0.35); let pts = [gx, gy, gx + dx * s1, gy + dy * s1]; if (tg.d > 24) pts.push((gx + dx * s1 + tg.x) / 2, (gy + dy * s1 + tg.y) / 2); pts.push(tg.x, tg.y); pts = chaikin(pts, 1);
          if (pts.some((v, k) => k % 2 === 0 && c.WK(v, pts[k + 1]) === 2) || !stubOK(cc, pts)) continue; pick = { tg, pts }; break; }
        if (pick) break; }
      if (!pick || !pick.pts) continue; const { tg, pts } = pick;
      const kind = g.main ? 'street' : 'lane', hw = g.main ? clamp(tg.st.hw, 3, 4.6) : 2.4, ps = tg.st.pts, k = tg.i;
      const hj = Math.hypot(ps[k - 2] - tg.x, ps[k - 1] - tg.y) < 1.5 ? [ps[k - 2], ps[k - 1]] : Math.hypot(ps[k] - tg.x, ps[k + 1] - tg.y) < 1.5 ? [ps[k], ps[k + 1]] : null;
      if (hj) { pts[pts.length - 2] = hj[0]; pts[pts.length - 1] = hj[1]; } else { ps.splice(k, 0, tg.x, tg.y); tg.st.br.splice(k / 2, 0, tg.st.br[k / 2] ? 1 : 0); }
      const st = { id: nid++, kind, hw, parent: tg.st.id, pts, br: new Array(pts.length / 2).fill(0), look: kind, fname: g.main ? 'Замкова вулиця' : 'Брамний провулок', keepRoad: g.kind }; stubs.push(st); all.push(st);
    }
    const ordered = old.concat(stubs, young); streets.length = 0; for (const st of ordered) streets.push(st); renumber(streets);
    return { nA: old.length + stubs.length, stubs };
  }
  A.KeepRoads = { fit, carve, cutStreet, chaikin };
})();
