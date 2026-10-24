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
    // 1. дороги карти проходять через місто тими самими лініями; решта вибудовується від них
    for (const rn of o.runs) { const st = mkSt('avenue', rn.level === 1 ? 7 : rn.level === 2 ? 5.5 : rn.level === 3 ? 4.2 : 3); st.level = rn.level; const p = rn.pts; for (let i = 0; i < p.length; i += 2) { const br = i > 0 && (WK((p[i] + p[i - 2]) / 2, (p[i + 1] + p[i - 1]) / 2) !== 0 || WK(p[i], p[i + 1]) !== 0); push(st, p[i], p[i + 1], br); } let far = 0; for (let i = 0; i < p.length; i += 2) { const d = Math.hypot(p[i] - x0, p[i + 1] - y0); if (d > far) { far = d; st.gate = Math.atan2(p[i + 1] - y0, p[i] - x0); } } }
    if (!streets.length && tier >= 1) for (let k = 0; k < 2; k++) { const st = mkSt('street', 4.2); grow(st, x0, y0, r() * TAU, R * 1.1, 0.2, false); }
    // 2. кільцеві вулиці (дуги між водою)
    const addPoly = (kind, hw, pts, min) => { if (pts.length < min) return null; const st = mkSt(kind, hw); for (const q of pts) push(st, q[0], q[1], q[2]); return st; };
    const rings = tier >= 4 ? [0.28, 0.5, 0.72] : tier === 3 ? [0.36, 0.66] : tier === 2 ? [0.34, 0.66] : tier === 1 ? [0.32] : [];
    for (const f of rings) {
      const ph = r() * TAU, k1 = (r() - 0.5) * 0.24, k2 = (r() - 0.5) * 0.16, k3 = (r() - 0.5) * 0.12; let cur = [];
      for (let t = 0; t <= 61; t++) { const th = t / 60 * TAU, rr = R * f * (1 + k1 * Math.sin(2 * th + ph) + k2 * Math.sin(3 * th + 2 * ph) + k3 * Math.sin(5 * th + ph)), x = x0 + Math.cos(th) * rr, y = y0 + Math.sin(th) * rr, wk = WK(x, y);
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
    // стежка до цілі шукається по сітці (A*) в обхід води, споруд і місць, потім згладжується; кінець точно в цілі
    const api = { blocked: null, WK };
    function findPath(own, x, y, tx, ty, maxLen) {
      const C = 7, mg = 60, x0 = Math.min(x, tx) - mg, y0 = Math.min(y, ty) - mg, nx = Math.ceil((Math.max(x, tx) + mg - x0) / C), ny = Math.ceil((Math.max(y, ty) + mg - y0) / C); if (nx * ny > 45000) return null;
      const ci = v => Math.max(0, Math.min(nx - 1, Math.floor((v - x0) / C))), cj = v => Math.max(0, Math.min(ny - 1, Math.floor((v - y0) / C))), si = ci(x), sj = cj(y), ti = ci(tx), tj = cj(ty), G = new Float32Array(nx * ny).fill(1e9), P = new Int32Array(nx * ny).fill(-1), cost = new Float32Array(nx * ny).fill(-1), heap = new A.Heap();
      const cc = (i, j) => { const k = j * nx + i; if (cost[k] >= 0) return cost[k]; const cx = x0 + (i + 0.5) * C, cy = y0 + (j + 0.5) * C, wk = WK(cx, cy); let c = 1e9; if (wk !== 2 && !(api.blocked && api.blocked(cx, cy))) { c = 1 + (wk === 1 ? 10 : 0); if (Math.hypot(cx - tx, cy - ty) > 14 && Math.hypot(cx - x, cy - y) > 14 && near(cx, cy, 8, own.id, own.parent) < 2.5) c += 6; c *= 1 + 0.5 * env.vnoise(cx / 45, cy / 45, env.seedInt); } return (cost[k] = c); };
      G[sj * nx + si] = 0; heap.push(0, sj * nx + si); let found = false;
      while (heap.size) { const k = heap.pop(), i = k % nx, j = (k / nx) | 0; if (i === ti && j === tj) { found = true; break; }
        for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++) { if (!di && !dj) continue; const a = i + di, b = j + dj; if (a < 0 || b < 0 || a >= nx || b >= ny) continue; const c = cc(a, b); if (c >= 1e8) continue; const g = G[k] + c * (di && dj ? 1.414 : 1) * C, kk = b * nx + a; if (g < G[kk]) { G[kk] = g; P[kk] = k; heap.push(g + Math.hypot(a - ti, b - tj) * C, kk); } } }
      if (!found) return null; const cells = []; for (let k = tj * nx + ti; k >= 0; k = P[k]) cells.push([x0 + ((k % nx) + 0.5) * C, y0 + (((k / nx) | 0) + 0.5) * C]); cells.reverse();
      cells[0] = [x, y]; cells[cells.length - 1] = [tx, ty]; let len = 0; for (let i = 1; i < cells.length; i++) len += Math.hypot(cells[i][0] - cells[i - 1][0], cells[i][1] - cells[i - 1][1]); if (len > maxLen * 1.4 + 60) return null;
      return cells;
    }
    function reach(st, x, y, ang, tx, ty, maxLen, str) {
      push(st, x, y, 0); const cells = findPath(st, x, y, tx, ty, maxLen); if (!cells) return st;
      // згладжування: прорідження (Дуґлас-Пейкер 5 м) і дугова згладжувальна крива
      const keep = new Array(cells.length).fill(false); keep[0] = keep[cells.length - 1] = true; const dp = (a, b) => { let m = 0, mi = -1; const [ax, ay] = cells[a], [bx, by] = cells[b]; for (let i = a + 1; i < b; i++) { const d = segDist(cells[i][0], cells[i][1], ax, ay, bx, by); if (d > m) { m = d; mi = i; } } if (m > 5 && mi >= 0) { keep[mi] = true; dp(a, mi); dp(mi, b); } }; dp(0, cells.length - 1);
      const tmp = { pts: [], br: [] }; cells.forEach((q, i) => { if (keep[i]) { tmp.pts.push(q[0], q[1]); tmp.br.push(0); } }); chaikinPath(tmp, 3);
      for (let i = 2; i < tmp.pts.length; i += 2) { const mx = (tmp.pts[i] + tmp.pts[i - 2]) / 2, my = (tmp.pts[i + 1] + tmp.pts[i - 1]) / 2; push(st, tmp.pts[i], tmp.pts[i + 1], WK(tmp.pts[i], tmp.pts[i + 1]) === 1 || WK(mx, my) === 1); }
      st.joined = true; return st;
    }
    function chaikinPath(t, it) { for (let k = 0; k < it; k++) { const p = t.pts, n = p.length / 2; if (n < 3) return; const q = [p[0], p[1]]; for (let i = 0; i < n - 1; i++) { const ax = p[i * 2], ay = p[i * 2 + 1], bx = p[i * 2 + 2], by = p[i * 2 + 3]; if (i > 0) q.push(ax * 0.75 + bx * 0.25, ay * 0.75 + by * 0.25); if (i < n - 2) q.push(ax * 0.25 + bx * 0.75, ay * 0.25 + by * 0.75); } q.push(p[(n - 1) * 2], p[(n - 1) * 2 + 1]); t.pts = q; t.br = new Array(q.length / 2).fill(0); } }
    const rebuild = () => { grid.clear(); segs.length = 0; for (const st of streets) { const p = st.pts; for (let i = 2; i < p.length; i += 2) addSeg(st, p[i - 2], p[i - 1], p[i], p[i + 1], st.br[i / 2]); } };
    return Object.assign(api, { streets, near, grow, mkSt, shore, segs, addSeg, reach, rebuild });
  }
  A.TownNet = { build, STEP, TAU };
})();
