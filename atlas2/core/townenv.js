// Атлас 2.0, місто: довкілля поселення (вода, річки, висота, напрямки доріг). Координати в метрах від клітини поселення, y вниз.
(function () {
  'use strict';
  const A = globalThis.Atlas2, TAU = Math.PI * 2;
  const hash = (x, y, s) => { let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ s; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  const vnoise = (x, y, s) => { const fx = Math.floor(x), fy = Math.floor(y); let tx = x - fx, ty = y - fy; tx = tx * tx * (3 - 2 * tx); ty = ty * ty * (3 - 2 * ty); const a = hash(fx, fy, s), b = hash(fx + 1, fy, s), c = hash(fx, fy + 1, s), d = hash(fx + 1, fy + 1, s); return (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty; };
  const segDist = (px, py, ax, ay, bx, by) => { const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy || 1e-9, t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l2)); return Math.hypot(px - ax - dx * t, py - ay - dy * t); };
  const chaikin = (p, it) => { for (let k = 0; k < it; k++) { const q = [p[0]]; for (let i = 1; i < p.length; i++) { const a = p[i - 1], b = p[i]; q.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25, a[2]], [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75, b[2]]); } q.push(p[p.length - 1]); p = q; } return p; };

  // R — радіус міста (м); Rmap — радіус всієї області карти міста
  function make(W, s, R, Rmap, seedInt) {
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
    const waterKind = (x, y) => { const v = landAt(x, y) + (vnoise(x / 70, y / 70, seedInt) - 0.5) * 0.34 + (vnoise(x / 24, y / 24, seedInt + 7) - 0.5) * 0.12; if (v < 0.5) return 2; return riverAt(x, y) ? 1 : 0; };
    const elevAt = (x, y) => { const ix = Math.floor(cx + x / CS), iy = Math.floor(cy + y / CS); return ix < 0 || iy < 0 || ix >= w || iy >= h ? 0 : W.elev[iy * w + ix]; };
    // напрямки доріг, що заходять у поселення (кути й рівень 1 головна … 3 стежка)
    const gates = [];
    for (const rd of W.roads || []) {
      const cells = rd.cells; let bi = -1, bd = 3; for (let i = 0; i < cells.length; i++) { const d = Math.hypot((cells[i] % w) + 0.5 - cx, ((cells[i] / w) | 0) + 0.5 - cy); if (d < bd) { bd = d; bi = i; } }
      if (bi < 0 || bd > 1.2) continue;
      for (const dir of [-1, 1]) { let j = bi, hit = null; while (j + dir >= 0 && j + dir < cells.length) { j += dir; const dx = ((cells[j] % w) + 0.5 - cx) * CS, dy = (((cells[j] / w) | 0) + 0.5 - cy) * CS; if (Math.hypot(dx, dy) > Math.max(R * 1.6, 450)) { hit = Math.atan2(dy, dx); break; } } if (hit !== null && !gates.some(g => Math.abs(Math.atan2(Math.sin(g.a - hit), Math.cos(g.a - hit))) < 0.45)) gates.push({ a: hit, level: rd.level }); }
    }
    return { CS, cx, cy, rivers, waterKind, elevAt, gates, hash, vnoise, segDist, TAU, seedInt };
  }
  A.TownEnv = { make, hash, vnoise, segDist };
})();
