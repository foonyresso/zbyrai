// Атлас 2.0, місто: довкілля поселення (вода, річки, висота, напрямки доріг). Координати в метрах від клітини поселення, y вниз.
(function () {
  'use strict';
  const A = globalThis.Atlas2, TAU = Math.PI * 2;
  const hash = (x, y, s) => { let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ s; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  const vnoise = (x, y, s) => { const fx = Math.floor(x), fy = Math.floor(y); let tx = x - fx, ty = y - fy; tx = tx * tx * (3 - 2 * tx); ty = ty * ty * (3 - 2 * ty); const a = hash(fx, fy, s), b = hash(fx + 1, fy, s), c = hash(fx, fy + 1, s), d = hash(fx + 1, fy + 1, s); return (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty; };
  const segDist = (px, py, ax, ay, bx, by) => { const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy || 1e-9, t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l2)); return Math.hypot(px - ax - dx * t, py - ay - dy * t); };
  const chaikin = (p, it) => { for (let k = 0; k < it; k++) { const q = [p[0]]; for (let i = 1; i < p.length; i++) { const a = p[i - 1], b = p[i]; q.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25, a[2]], [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75, b[2]]); } q.push(p[p.length - 1]); p = q; } return p; };

  const Rmax = R => R * 1.45;
  // R — радіус міста (м); Rmap — радіус всієї області карти міста
  function make(W, s, R, Rmap, seedInt, opts) {
    opts = opts || {};
    const CS = W.params.kmPerCell * 1000, w = W.w, h = W.h, cx = s.x + 0.5, cy = s.y + 0.5, ext = Rmap + 300;
    const landF = (ix, iy) => ix < 0 || iy < 0 || ix >= w || iy >= h ? 0 : (W.land[iy * w + ix] && !W.lake[iy * w + ix] ? 1 : 0);
    const landAt = (x, y) => { const u = cx + x / CS - 0.5, v = cy + y / CS - 0.5, fx = Math.floor(u), fy = Math.floor(v), tx = u - fx, ty = v - fy; return (landF(fx, fy) * (1 - tx) + landF(fx + 1, fy) * tx) * (1 - ty) + (landF(fx, fy + 1) * (1 - tx) + landF(fx + 1, fy + 1) * tx) * ty; };
    // річки: шляхи клітин у локальних координатах, згладжені; сітка відрізків для швидкого запиту
    const rivers = [], rg = new Map(), RK = 80;
    for (const path of W.rivers || []) {
      let cur = []; const flush = () => { if (cur.length >= 2) { const sm = chaikin(cur, 2); rivers.push({ pts: sm }); } cur = []; };
      path.forEach((c, i) => { const x = ((c % w) + 0.5 - cx) * CS, y = (((c / w) | 0) + 0.5 - cy) * CS; if (Math.abs(x) < ext && Math.abs(y) < ext) cur.push([x, y, 5 + 17 * Math.min(1, i / Math.max(1, path.length - 1))]); else flush(); });
      flush();
    }
    rivers.forEach((rv, ri) => { for (let i = 1; i < rv.pts.length; i++) { const a = rv.pts[i - 1], b = rv.pts[i]; for (let gx = Math.floor((Math.min(a[0], b[0]) - 30) / RK); gx <= Math.floor((Math.max(a[0], b[0]) + 30) / RK); gx++) for (let gy = Math.floor((Math.min(a[1], b[1]) - 30) / RK); gy <= Math.floor((Math.max(a[1], b[1]) + 30) / RK); gy++) { const k = gx * 100003 + gy; (rg.get(k) || rg.set(k, []).get(k)).push([a[0], a[1], b[0], b[1], (a[2] + b[2]) / 4]); } } });
    const riverAt = (x, y) => { const g = rg.get(Math.floor(x / RK) * 100003 + Math.floor(y / RK)); if (!g) return false; for (const q of g) if (segDist(x, y, q[0], q[1], q[2], q[3]) < q[4]) return true; return false; };
    // 0 суша, 1 річка, 2 море чи озеро
    const mask = opts.mask, waterKind = mask ? (x, y) => { const i = Math.floor((x + mask.E) / mask.PX), j = Math.floor((y + mask.E) / mask.PX); return i < 0 || j < 0 || i >= mask.n || j >= mask.n ? 2 : mask.cls[j * mask.n + i]; } : (x, y) => { const v = landAt(x, y) + (vnoise(x / 70, y / 70, seedInt) - 0.5) * 0.34 + (vnoise(x / 24, y / 24, seedInt + 7) - 0.5) * 0.12; if (v < 0.5) return 2; return riverAt(x, y) ? 1 : 0; };
    const elevAt = (x, y) => { const ix = Math.floor(cx + x / CS), iy = Math.floor(cy + y / CS); return ix < 0 || iy < 0 || ix >= w || iy >= h ? 0 : W.elev[iy * w + ix]; };
    // дороги карти (та сама геометрія, що малюється на карті) → відрізки в локальних метрах, обрізані колом lim; центр міста лежить на дорозі
    const roads = opts.geom ? opts.geom.roads : (W.roads || []).map(rd => ({ level: rd.level, pts: rd.cells.flatMap(c => [(c % w) + 0.5, ((c / w) | 0) + 0.5]) })), lim = Rmax(R) * 1.45 + 150, runs = [], seen = new Set();
    const cross = (a, b) => { const A0 = Math.hypot(a[0], a[1]), B0 = Math.hypot(b[0], b[1]), t = (lim - A0) / (B0 - A0 || 1); return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; };
    for (const rd of roads) {
      let cur = [], prev = null; const flush = () => { if (cur.length >= 2) { let dup = 0; for (const q of cur) if (seen.has(Math.round(q[0] / 2) + '|' + Math.round(q[1] / 2))) dup++; if (dup < cur.length * 0.8) { for (const q of cur) seen.add(Math.round(q[0] / 2) + '|' + Math.round(q[1] / 2)); runs.push({ level: rd.level, pts: cur.flatMap(q => q) }); } } cur = []; };
      for (let i = 0; i < rd.pts.length; i += 2) { const p = [(rd.pts[i] - cx) * CS, (rd.pts[i + 1] - cy) * CS], ins = Math.hypot(p[0], p[1]) < lim; if (ins) { if (!cur.length && prev) cur.push(cross(p, prev)); cur.push(p); } else if (cur.length) { cur.push(cross(cur[cur.length - 1], p)); flush(); } prev = p; }
      flush();
    }
    let c0 = null, cd = 120; for (const r of runs) for (let i = 2; i < r.pts.length; i += 2) { const ax = r.pts[i - 2], ay = r.pts[i - 1], dx = r.pts[i] - ax, dy = r.pts[i + 1] - ay, t = Math.max(0, Math.min(1, -(ax * dx + ay * dy) / (dx * dx + dy * dy || 1e-9))), px = ax + dx * t, py = ay + dy * t, d = Math.hypot(px, py); if (d < cd) { cd = d; c0 = [px, py]; } }
    return { CS, cx, cy, rivers, waterKind, elevAt, runs, c0, hash, vnoise, segDist, TAU, seedInt };
  }
  A.TownEnv = { make, hash, vnoise, segDist };
})();
