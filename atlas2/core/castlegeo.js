// Атлас 2.0, замок: геометрія без DOM. Багатокутник = масив [x, y] з додатною площею (за шнурівкою; всередину веде нормаль (-dy, dx)); растри — Uint8Array n×n.
// Площа, центр, «точка всередині», відстань до краю, спрощення, відсікання півплощиною, ізолінія маски (marching squares), прямокутники (перетин, вміщення), мінімальний обертовий прямокутник.
(function () {
  'use strict';
  const A = (globalThis.Atlas2 = globalThis.Atlas2 || {}), TAU = Math.PI * 2;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const area = P => { let s = 0; for (let i = 0, j = P.length - 1; i < P.length; j = i++) s += P[j][0] * P[i][1] - P[i][0] * P[j][1]; return s / 2; };
  const orient = P => (area(P) < 0 ? P.slice().reverse() : P);
  const perimeter = P => { let s = 0; for (let i = 0, j = P.length - 1; i < P.length; j = i++) s += Math.hypot(P[i][0] - P[j][0], P[i][1] - P[j][1]); return s; };
  function centroid(P) { let a = 0, x = 0, y = 0; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const f = P[j][0] * P[i][1] - P[i][0] * P[j][1]; a += f; x += (P[j][0] + P[i][0]) * f; y += (P[j][1] + P[i][1]) * f; } if (Math.abs(a) < 1e-6) { const q = P.reduce((s, p) => [s[0] + p[0], s[1] + p[1]], [0, 0]); return [q[0] / P.length, q[1] / P.length]; } return [x / (3 * a), y / (3 * a)]; }
  const bbox = P => { let a = 1e18, b = 1e18, c = -1e18, d = -1e18; for (const p of P) { if (p[0] < a) a = p[0]; if (p[1] < b) b = p[1]; if (p[0] > c) c = p[0]; if (p[1] > d) d = p[1]; } return [a, b, c, d]; };
  const inside = (P, x, y) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) if ((P[i][1] > y) !== (P[j][1] > y) && x < (P[j][0] - P[i][0]) * (y - P[i][1]) / (P[j][1] - P[i][1]) + P[i][0]) c = !c; return c; };
  const segDist = (px, py, ax, ay, bx, by) => { const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy || 1e-9, t = clamp(((px - ax) * dx + (py - ay) * dy) / l2, 0, 1); return Math.hypot(px - ax - dx * t, py - ay - dy * t); };
  // відстань до межі (завжди ≥ 0) і знакова (плюс — всередині)
  function edgeDist(P, x, y) { let m = 1e18; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const d = segDist(x, y, P[j][0], P[j][1], P[i][0], P[i][1]); if (d < m) m = d; } return m; }
  const sdist = (P, x, y) => (inside(P, x, y) ? 1 : -1) * edgeDist(P, x, y);
  // перетин відрізків (внутрішній і по кінцях): повертає [t, u] або null
  function segHit(ax, ay, bx, by, cx, cy, dx, dy) { const d = (bx - ax) * (dy - cy) - (by - ay) * (dx - cx); if (Math.abs(d) < 1e-12) return null; const t = ((cx - ax) * (dy - cy) - (cy - ay) * (dx - cx)) / d, u = ((cx - ax) * (by - ay) - (cy - ay) * (bx - ax)) / d; return t >= 0 && t <= 1 && u >= 0 && u <= 1 ? [t, u] : null; }
  // звичайний (простий) багатокутник: сторони не перетинаються (суміжні не рахуємо)
  function simple(P) { const n = P.length; if (n < 3) return false; for (let i = 0; i < n; i++) for (let k = i + 2; k < n; k++) { if (i === 0 && k === n - 1) continue; const a = P[i], b = P[(i + 1) % n], c = P[k], d = P[(k + 1) % n], h = segHit(a[0], a[1], b[0], b[1], c[0], c[1], d[0], d[1]); if (h && h[0] > 1e-6 && h[0] < 1 - 1e-6 && h[1] > 1e-6 && h[1] < 1 - 1e-6) return false; } return true; }
  // найпотужніша вершина-опора для спрощення замкненої лінії: Дуґлас-Пейкер від двох найвіддаленіших точок
  function simplify(P, tol) {
    const n = P.length; if (n < 5) return P.slice(); let a = 0, b = 0, best = -1;
    for (let i = 0; i < n; i += Math.max(1, n >> 6)) for (let j = i + 1; j < n; j++) { const d = Math.hypot(P[i][0] - P[j][0], P[i][1] - P[j][1]); if (d > best) { best = d; a = i; b = j; } }
    const keep = new Uint8Array(n); keep[a] = keep[b] = 1;
    const dp = (i, j) => { // i<j у циклічному порядку, обидва кінці вже взяті
      let m = -1, mi = -1; const L = j >= i ? j : j + n; for (let k = i + 1; k < L; k++) { const q = P[k % n], d = segDist(q[0], q[1], P[i][0], P[i][1], P[j % n][0], P[j % n][1]); if (d > m) { m = d; mi = k % n; } }
      if (m > tol && mi >= 0) { keep[mi] = 1; dp(i, mi); dp(mi, j); }
    };
    dp(a, b); dp(b, a); const out = []; for (let i = 0; i < n; i++) if (keep[i]) out.push(P[i]); return out;
  }
  // чистка: короткі сторони (< minLen) стискаються в середину, майже пряма вершина (відхилення < minAng) прибирається
  function tidy(P, minLen, minAng) {
    P = P.map(p => p.slice()); const ca = Math.cos(minAng);
    for (let it = 0; it < 40 && P.length > 3; it++) {
      let ch = false;
      for (let i = 0; i < P.length && P.length > 3; i++) { const a = P[i], b = P[(i + 1) % P.length]; if (Math.hypot(b[0] - a[0], b[1] - a[1]) < minLen) { const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; P[i] = m; P.splice((i + 1) % P.length, 1); ch = true; break; } }
      if (ch) continue;
      for (let i = 0; i < P.length && P.length > 3; i++) { const a = P[(i + P.length - 1) % P.length], b = P[i], c = P[(i + 1) % P.length], ux = b[0] - a[0], uy = b[1] - a[1], vx = c[0] - b[0], vy = c[1] - b[1], lu = Math.hypot(ux, uy), lv = Math.hypot(vx, vy); if (!lu || !lv || (ux * vx + uy * vy) / (lu * lv) > ca) { P.splice(i, 1); ch = true; break; } }
      if (!ch) break;
    }
    return P;
  }
  // відсікання півплощиною: лишається частина, де nx·x + ny·y ≥ c (Сазерленд-Ходжман; для майже опуклих ділянок)
  function clipHalf(P, nx, ny, c) {
    const out = [], n = P.length;
    for (let i = 0; i < n; i++) { const a = P[i], b = P[(i + 1) % n], da = a[0] * nx + a[1] * ny - c, db = b[0] * nx + b[1] * ny - c;
      if (da >= 0) out.push(a); if ((da >= 0) !== (db >= 0)) { const t = da / (da - db); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); } }
    return out;
  }
  // опукла оболонка (Ендрю)
  function hull(pts) {
    const p = pts.slice().sort((u, v) => u[0] - v[0] || u[1] - v[1]); if (p.length < 3) return p;
    const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = [];
    for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
    for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
    lo.pop(); up.pop(); return lo.concat(up);
  }
  // мінімальний обертовий прямокутник точок: {x, y — центр, w ≥ h, a — напрям довгої осі}
  function minRect(pts) {
    const H = hull(pts); let best = null;
    for (let i = 0; i < H.length; i++) { const a = H[i], b = H[(i + 1) % H.length], ang = Math.atan2(b[1] - a[1], b[0] - a[0]), c = Math.cos(ang), s = Math.sin(ang); let u0 = 1e18, u1 = -1e18, v0 = 1e18, v1 = -1e18;
      for (const q of H) { const u = q[0] * c + q[1] * s, v = -q[0] * s + q[1] * c; if (u < u0) u0 = u; if (u > u1) u1 = u; if (v < v0) v0 = v; if (v > v1) v1 = v; }
      const w = u1 - u0, h = v1 - v0; if (!best || w * h < best.ar) { const cu = (u0 + u1) / 2, cv = (v0 + v1) / 2; best = { ar: w * h, x: cu * c - cv * s, y: cu * s + cv * c, w, h, a: ang }; } }
    if (!best) return { x: 0, y: 0, w: 1, h: 1, a: 0 }; if (best.h > best.w) { const t = best.w; best.w = best.h; best.h = t; best.a += Math.PI / 2; } return best;
  }
  // обертовий прямокутник b {x,y,w,h,a}: кути й перетин (SAT)
  function rectCorners(b, pad) { pad = pad || 0; const c = Math.cos(b.a), s = Math.sin(b.a), hw = b.w / 2 + pad, hh = b.h / 2 + pad; return [[b.x + c * hw - s * hh, b.y + s * hw + c * hh], [b.x - c * hw - s * hh, b.y - s * hw + c * hh], [b.x - c * hw + s * hh, b.y - s * hw - c * hh], [b.x + c * hw + s * hh, b.y + s * hw - c * hh]]; }
  function rectsHit(p, q, pad) {
    const ca = rectCorners(p, pad), cb = rectCorners(q, 0);
    for (const r of [p, q]) for (const ang of [r.a, r.a + Math.PI / 2]) { const ax = Math.cos(ang), ay = Math.sin(ang); let a0 = 1e18, a1 = -1e18, b0 = 1e18, b1 = -1e18; for (const c of ca) { const d = c[0] * ax + c[1] * ay; if (d < a0) a0 = d; if (d > a1) a1 = d; } for (const c of cb) { const d = c[0] * ax + c[1] * ay; if (d < b0) b0 = d; if (d > b1) b1 = d; } if (a1 < b0 || b1 < a0) return false; }
    return true;
  }
  // прямокутник повністю в багатокутнику з запасом від краю clear
  function rectIn(P, b, clear) { for (const c of rectCorners(b, 0)) if (!inside(P, c[0], c[1]) || edgeDist(P, c[0], c[1]) < clear) return false; return inside(P, b.x, b.y) && edgeDist(P, b.x, b.y) >= clear; }
  // чи відрізок (ax,ay)-(bx,by) перетинає край багатокутника
  function crossesEdge(P, ax, ay, bx, by) { for (let i = 0, j = P.length - 1; i < P.length; j = i++) if (segHit(ax, ay, bx, by, P[j][0], P[j][1], P[i][0], P[i][1])) return true; return false; }
  // ламана (плоский масив [x,y,x,y…]) торкається багатокутника: хоч одна вершина ближче pad до внутрішності чи перетин краю
  function polylineNear(P, pts, pad) { for (let i = 0; i < pts.length; i += 2) { if (inside(P, pts[i], pts[i + 1]) || edgeDist(P, pts[i], pts[i + 1]) < pad) return true; if (i && crossesEdge(P, pts[i - 2], pts[i - 1], pts[i], pts[i + 1])) return true; } return false; }
  // зсув (відступ) опуклої частини: точка на відстані d від краю всередину відшукується растром, тож для нього є лише перевірка edgeDist; тут — масштабування навколо центру
  const scalePoly = (P, c, k) => P.map(p => [c[0] + (p[0] - c[0]) * k, c[1] + (p[1] - c[1]) * k]);
  // кут напрямку й нормалі сторони i (назовні): [ax, ay, bx, by, len, dx, dy, nx, ny] для багатокутника з додатною площею
  function edge(P, i) { const a = P[i], b = P[(i + 1) % P.length], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1e-9; return { ax: a[0], ay: a[1], bx: b[0], by: b[1], len: l, dx: dx / l, dy: dy / l, nx: dy / l, ny: -dx / l }; }
  // точка на периметрі за довжиною від початку: {x, y, i, e}
  function along(P, s) { const n = P.length; for (let i = 0; i < n; i++) { const e = edge(P, i); if (s <= e.len || i === n - 1) { const t = clamp(s, 0, e.len); return { x: e.ax + e.dx * t, y: e.ay + e.dy * t, i, e }; } s -= e.len; } return null; }
  // ---- ізолінія маски: поле f (n×n, значення вузлів у центрах клітин), рівень lv → замкнені лінії [[x, y], …]; клітина (i, j) має центр (ox + (i + 0.5)·PX, oy + (j + 0.5)·PX)
  function contour(f, n, PX, ox, oy, lv) {
    const adj = new Map(), H = (i, j) => 2 * (j * n + i), V = (i, j) => 2 * (j * n + i) + 1, link = (p, q) => { (adj.get(p) || adj.set(p, []).get(p)).push(q); (adj.get(q) || adj.set(q, []).get(q)).push(p); };
    const hp = k => { const m = k >> 1, i = m % n, j = (m / n) | 0, a = f[m], b = f[m + 1], t = (lv - a) / (b - a || 1e-9); return [ox + (i + 0.5 + t) * PX, oy + (j + 0.5) * PX]; };
    const vp = k => { const m = k >> 1, i = m % n, j = (m / n) | 0, a = f[m], b = f[m + n], t = (lv - a) / (b - a || 1e-9); return [ox + (i + 0.5) * PX, oy + (j + 0.5 + t) * PX]; };
    for (let j = 0; j < n - 1; j++) for (let i = 0; i < n - 1; i++) {
      const a = f[j * n + i], b = f[j * n + i + 1], c = f[(j + 1) * n + i + 1], d = f[(j + 1) * n + i], code = (a >= lv ? 1 : 0) | (b >= lv ? 2 : 0) | (c >= lv ? 4 : 0) | (d >= lv ? 8 : 0); if (code === 0 || code === 15) continue;
      const T = H(i, j), Bm = H(i, j + 1), Lf = V(i, j), Rt = V(i + 1, j), mid = (a + b + c + d) / 4 >= lv;
      switch (code) {
        case 1: case 14: link(Lf, T); break; case 2: case 13: link(T, Rt); break; case 3: case 12: link(Lf, Rt); break; case 4: case 11: link(Rt, Bm); break; case 6: case 9: link(T, Bm); break; case 7: case 8: link(Lf, Bm); break;
        case 5: if (mid) { link(T, Rt); link(Lf, Bm); } else { link(Lf, T); link(Rt, Bm); } break;
        case 10: if (mid) { link(Lf, T); link(Rt, Bm); } else { link(T, Rt); link(Lf, Bm); } break;
      }
    }
    // кожне ребро має двох сусідів: обходимо ланцюг, поки не повернемось
    const loops = [], seen = new Set();
    for (const s of adj.keys()) { if (seen.has(s)) continue; const loop = []; let prev = -1, cur = s;
      for (let g = 0; g < 400000; g++) { seen.add(cur); loop.push(cur & 1 ? vp(cur) : hp(cur)); const nb = adj.get(cur), nx = nb[0] !== prev ? nb[0] : nb[1]; if (nx == null || nx === s || seen.has(nx)) break; prev = cur; cur = nx; }
      if (loop.length >= 3) loops.push(loop); }
    return loops;
  }
  // розмиття маски (середнє 3×3, passes разів) у Float32Array
  function blur(mask, n, passes) {
    let a = new Float32Array(n * n), b = new Float32Array(n * n); for (let i = 0; i < a.length; i++) a[i] = mask[i] ? 1 : 0;
    for (let p = 0; p < passes; p++) { for (let j = 1; j < n - 1; j++) for (let i = 1; i < n - 1; i++) { const k = j * n + i; b[k] = (a[k - n - 1] + a[k - n] + a[k - n + 1] + a[k - 1] + a[k] + a[k + 1] + a[k + n - 1] + a[k + n] + a[k + n + 1]) / 9; } const t = a; a = b; b = t; }
    return a;
  }
  A.KeepGeo = { TAU, clamp, area, orient, perimeter, centroid, bbox, inside, segDist, edgeDist, sdist, segHit, simple, simplify, tidy, clipHalf, hull, minRect, rectCorners, rectsHit, rectIn, crossesEdge, polylineNear, scalePoly, edge, along, contour, blur };
})();
