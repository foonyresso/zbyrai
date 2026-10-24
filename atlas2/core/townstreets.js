// Атлас 2.0, місто: вуличне полотно. Проспекти від центру до воріт (за напрямками доріг), кільцеві вулиці, набережна, бічні вулиці й провулки, що ростуть від них і з'єднуються або тупикують.
(function () {
  'use strict';
  const A = globalThis.Atlas2, TAU = Math.PI * 2, STEP = 16;
  // o: {x0,y0 центр, R радіус міста, Rmax межа вулиць, tier 0..4, walled}
  function build(env, r, o) {
    const WK = env.waterKind, { segDist } = env, streets = [], segs = [], grid = new Map(), GK = 40, { x0, y0, R, tier } = o;
    const addSeg = (st, ax, ay, bx, by, br) => {
      const q = { ax, ay, bx, by, hw: st.hw, st: st.id, br }; segs.push(q);
      for (let gx = Math.floor((Math.min(ax, bx) - 1) / GK); gx <= Math.floor((Math.max(ax, bx) + 1) / GK); gx++) for (let gy = Math.floor((Math.min(ay, by) - 1) / GK); gy <= Math.floor((Math.max(ay, by) + 1) / GK); gy++) { const k = gx * 100003 + gy; (grid.get(k) || grid.set(k, []).get(k)).push(q); }
    };
    // відстань від точки до краю найближчої вулиці (мінус півширини); ign1/ign2 — вулиці, які не враховуємо
    function near(x, y, rad, ign1, ign2) {
      let best = 1e9; for (let gx = Math.floor((x - rad) / GK); gx <= Math.floor((x + rad) / GK); gx++) for (let gy = Math.floor((y - rad) / GK); gy <= Math.floor((y + rad) / GK); gy++) { const g = grid.get(gx * 100003 + gy); if (!g) continue; for (const q of g) { if (q.st === ign1 || q.st === ign2) continue; const d = segDist(x, y, q.ax, q.ay, q.bx, q.by) - q.hw; if (d < best) { best = d; near.q = q; } } }
      return best;
    }
    const mkSt = (kind, hw, parent) => { const st = { id: streets.length, kind, hw, parent: parent == null ? -1 : parent, pts: [], br: [] }; streets.push(st); return st; };
    const push = (st, x, y, br) => { const n = st.pts.length; if (n >= 2) addSeg(st, st.pts[n - 2], st.pts[n - 1], x, y, br); st.pts.push(x, y); st.br.push(br ? 1 : 0); };
    function grow(st, x, y, ang, len, curve, join) {
      push(st, x, y, 0); let px = x, py = y, pw = 0;
      for (let i = 0, n = Math.floor(len / STEP); i < n; i++) {
        ang += (r() - 0.5) * curve; const nx = px + Math.cos(ang) * STEP, ny = py + Math.sin(ang) * STEP;
        if (Math.hypot(nx - x0, ny - y0) > o.Rmax) break; const wk = WK(nx, ny); if (wk === 2) break;
        if (wk === 1) { let ok = false; for (let k = 1; k <= 7; k++) { const w2 = WK(nx + Math.cos(ang) * STEP * k, ny + Math.sin(ang) * STEP * k); if (w2 === 2) break; if (w2 === 0) { ok = true; break; } } if (!ok) break; }
        if (join && i >= 1 && near(nx, ny, STEP * 1.3, st.id, i < 3 ? st.parent : -2) < 5) { push(st, nx, ny, wk === 1 || pw === 1); st.joined = true; return st; }
        push(st, nx, ny, wk === 1 || pw === 1); px = nx; py = ny; pw = wk;
      }
      return st;
    }
    // 1. проспекти: від центру до воріт
    let gates = o.gates.slice(); if (!gates.length && tier >= 1) { const a = r() * TAU; gates = [{ a, level: 2 }, { a: a + Math.PI * (0.8 + 0.4 * r()), level: 2 }]; if (tier >= 3) gates.push({ a: a + Math.PI * 0.5, level: 2 }); }
    if (tier === 0 && gates.length < 2) { const a = gates.length ? gates[0].a + Math.PI : r() * TAU; gates.push({ a, level: 3 }); }
    for (const g of gates) { const st = mkSt('avenue', tier === 0 ? 3 : g.level === 1 || tier >= 3 ? 7 : 5.5); st.gate = g.a; grow(st, x0, y0, g.a, o.Rmax, 0.2, false); }
    // 2. кільцеві вулиці (дуги між водою)
    const addPoly = (kind, hw, pts, min) => { if (pts.length < min) return null; const st = mkSt(kind, hw); for (const q of pts) push(st, q[0], q[1], q[2]); return st; };
    const rings = tier >= 4 ? [0.3, 0.55, 0.8] : tier === 3 ? [0.38, 0.7] : tier === 2 ? [0.5] : [];
    for (const f of rings) {
      const ph = r() * TAU, k1 = (r() - 0.5) * 0.1, k2 = (r() - 0.5) * 0.08; let cur = [];
      for (let t = 0; t <= 61; t++) { const th = t / 60 * TAU, rr = R * f * (1 + k1 * Math.sin(2 * th + ph) + k2 * Math.sin(5 * th + ph)), x = x0 + Math.cos(th) * rr, y = y0 + Math.sin(th) * rr, wk = WK(x, y);
        if (wk === 2) { addPoly('ring', 4.5, cur, 4); cur = []; continue; } cur.push([x, y, wk === 1]); }
      addPoly('ring', 4.5, cur, 4);
    }
    // 3. набережна уздовж берега
    const shore = []; let cur = [], lastD = 0;
    if (tier >= 1) for (let t = 0; t <= 90; t++) {
      const th = t / 90 * TAU, ux = Math.cos(th), uy = Math.sin(th); let hitD = -1;
      for (let d = 15; d < R * 1.15; d += 6) if (WK(x0 + ux * d, y0 + uy * d) === 2) { hitD = d; break; }
      if (hitD < 0 || (cur.length && Math.abs(hitD - lastD) > 70)) { if (tier >= 2 || o.port) addPoly('embankment', 5, cur, 6); cur = []; if (hitD < 0) continue; }
      const px = x0 + ux * (hitD - 14), py = y0 + uy * (hitD - 14); if (WK(px, py) !== 0) continue; lastD = hitD;
      shore.push({ x: px, y: py, nx: ux, ny: uy, d: hitD }); cur.push([px, py, 0]);
    }
    if (tier >= 2 || o.port) addPoly('embankment', 5, cur, 6);
    return { streets, near, grow, mkSt, shore, segs, addSeg };
  }
  A.TownNet = { build, STEP, TAU };
})();
