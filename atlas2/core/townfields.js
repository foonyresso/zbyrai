// Атлас 2.0, місто: поля за містом. Поля лежать тісними групами біля брам, доріг і хуторів, а не суцільним поясом: кожна група — ділянка, поділена на охайні багатокутники (4–6 сторін, різні розміри, не довші за ~3 ширини), кожне поле своєї культури (оранка, сад, виноградник, луг), штрихи вздовж довгої сторони, живопліт по краю. Проміжки лишаються лісу, лукам і дорогам.
(function () {
  'use strict';
  const A = globalThis.Atlas2;
  const HUBS = [2, 3, 6, 9, 12], CAP = [10, 30, 80, 140, 200], SP = 10;
  const pip = (p, x, y) => { let c = false; for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) if ((p[i + 1] > y) !== (p[j + 1] > y) && x < (p[j] - p[i]) * (y - p[i + 1]) / (p[j + 1] - p[i + 1]) + p[i]) c = !c; return c; };
  const inField = (f, x, y) => x > f.bb[0] && x < f.bb[2] && y > f.bb[1] && y < f.bb[3] && pip(f.pts, x, y);
  const area = p => { let s = 0; for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) s += p[j] * p[i + 1] - p[i] * p[j + 1]; return Math.abs(s) / 2; };
  const centroid = p => { let x = 0, y = 0; for (let i = 0; i < p.length; i += 2) { x += p[i]; y += p[i + 1]; } return [x / (p.length / 2), y / (p.length / 2)]; };
  // розсікання опуклого багатокутника прямою (точка, напрям): повертає дві половини
  function split(p, px, py, dx, dy) {
    const side = (x, y) => (x - px) * -dy + (y - py) * dx, A1 = [], B1 = [], n = p.length / 2;
    for (let i = 0; i < n; i++) { const x = p[i * 2], y = p[i * 2 + 1], j = (i + 1) % n, x2 = p[j * 2], y2 = p[j * 2 + 1], s1 = side(x, y), s2 = side(x2, y2); (s1 >= 0 ? A1 : B1).push(x, y); if ((s1 >= 0) !== (s2 >= 0)) { const t = s1 / (s1 - s2), cx = x + (x2 - x) * t, cy = y + (y2 - y) * t; A1.push(cx, cy); B1.push(cx, cy); } }
    return [A1, B1];
  }
  // довга сторона й відношення сторін (грубо, за найдовшим ребром і площею)
  function shape(p) { let best = 0, ang = 0; for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) { const L = Math.hypot(p[i] - p[j], p[i + 1] - p[j + 1]); if (L > best) { best = L; ang = Math.atan2(p[i + 1] - p[j + 1], p[i] - p[j]); } } return { len: best, ang, asp: best * best / Math.max(1, area(p)) }; }
  function sharp(p) { const n = p.length / 2; for (let i = 0; i < n; i++) { const a = (i + n - 1) % n, b = (i + 1) % n, ux = p[a * 2] - p[i * 2], uy = p[a * 2 + 1] - p[i * 2 + 1], vx = p[b * 2] - p[i * 2], vy = p[b * 2 + 1] - p[i * 2 + 1], c = (ux * vx + uy * vy) / (Math.hypot(ux, uy) * Math.hypot(vx, vy) || 1); if (c > 0.64) return true; } return false; }
  function resample(p) { const out = []; let carry = 0; for (let i = 2; i < p.length; i += 2) { const ax = p[i - 2], ay = p[i - 1], L = Math.hypot(p[i] - ax, p[i + 1] - ay); if (!L) continue; const tx = (p[i] - ax) / L, ty = (p[i + 1] - ay) / L; for (let s = carry; s < L; s += SP) { out.push({ x: ax + tx * s, y: ay + ty * s, tx, ty }); carry = s + SP - L; } } return out; }
  // o: {r, tier, R, Rmap, streets, WK, near, B, F, d0, inside(x,y), warm}
  function make(o) {
    const { r, tier, R, Rmap, streets, WK, near, B, F, d0 } = o, fields = [], clusters = [], lim = Math.min(Rmap * 0.95, R * (tier >= 3 ? 2.6 : 2.3)), cap = CAP[tier];
    const okPt = (x, y) => WK(x, y) === 0 && !o.inside(x, y) && near(x, y, 10, -1, -2) > 2.5 && d0(x, y) < lim;
    const fits = f => {
      const n = f.pts.length / 2; for (let i = 0; i < n; i++) { const x = f.pts[i * 2], y = f.pts[i * 2 + 1], j = (i + 1) % n; if (!okPt(x, y) || !okPt((x + f.pts[j * 2]) / 2, (y + f.pts[j * 2 + 1]) / 2) || !okPt((x + f.x) / 2, (y + f.y) / 2)) return false; }
      if (!okPt(f.x, f.y)) return false;
      for (const q of fields) if (f.bb[0] < q.bb[2] && f.bb[2] > q.bb[0] && f.bb[1] < q.bb[3] && f.bb[3] > q.bb[1]) { if (inField(q, f.x, f.y) || inField(f, q.x, q.y)) return false; for (let i = 0; i < f.pts.length; i += 2) if (inField(q, f.pts[i], f.pts[i + 1])) return false; for (let i = 0; i < q.pts.length; i += 2) if (inField(f, q.pts[i], q.pts[i + 1])) return false; }
      for (const b of B) { const rr = Math.max(b.w, b.h) * 0.7; if (Math.hypot(b.x - f.x, b.y - f.y) < f.r + rr) { if (inField(f, b.x, b.y)) return false; const c = Math.cos(b.a), s = Math.sin(b.a); for (const [u, v] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) if (inField(f, b.x + c * u * b.w / 2 - s * v * b.h / 2, b.y + s * u * b.w / 2 + c * v * b.h / 2)) return false; } }
      for (const q of F) if (Math.hypot(q.x - f.x, q.y - f.y) < q.r + f.r * 0.7 && (inField(f, q.x, q.y) || Math.hypot(q.x - f.x, q.y - f.y) < q.r + 6)) return false;
      return true;
    };
    const kindAt = (dd, h) => {
      const u = dd / R;
      if (u < 1.4) return h < 0.2 ? 'garden' : h < 0.34 ? 'orchard' : h < 0.45 ? 'meadow' : 'arable';
      return h < 0.5 ? 'arable' : h < 0.66 ? 'meadow' : h < 0.78 && o.warm ? 'vineyard' : h < 0.88 ? 'orchard' : 'arable';
    };
    // осередки: точки на дорогах за мурами; віддаємо перевагу тим, що ближче до міста й далеко від інших осередків
    const pts = []; for (const st of streets) { if (st.kind === 'embankment' || st.kind === 'ring' || st.pts.length < 4) continue; for (const p of resample(st.pts)) { const dd = d0(p.x, p.y); if (dd > R * 1.0 && dd < lim * 0.9 && WK(p.x, p.y) === 0 && !o.inside(p.x, p.y)) pts.push(p); } }
    const hubs = []; for (let h = 0; h < HUBS[tier] && pts.length; h++) { let best = null, bs = -1e9; for (let k = 0; k < 70; k++) { const p = pts[Math.floor(r() * pts.length)]; let m = 1e9; for (const q of hubs) m = Math.min(m, Math.hypot(q.x - p.x, q.y - p.y)); const sc = Math.min(m, 260) - 0.25 * d0(p.x, p.y) + r() * 30; if (m > 170 && sc > bs) { bs = sc; best = p; } } if (best) hubs.push(best); }
    for (const hub of hubs) {
      if (fields.length >= cap) break; const rot = Math.atan2(hub.ty, hub.tx) + (r() - 0.5) * 0.4, L = 170 + r() * 130, Wd = 120 + r() * 90, c = Math.cos(rot), s = Math.sin(rot), sd = r() < 0.5 ? 1 : -1, off = Wd / 2 + 9, ox = hub.x + (r() - 0.5) * 60 - hub.ty * sd * off, oy = hub.y + (r() - 0.5) * 60 + hub.tx * sd * off;
      const base = [[-1, -1], [1, -1], [1, 1], [-1, 1]].flatMap(([u, v]) => [ox + c * u * L / 2 - s * v * Wd / 2, oy + s * u * L / 2 + c * v * Wd / 2]), cells = [];
      const cut = (p, depth) => { const a = area(p), sh = shape(p); if (p.length < 6) return; if ((a < 2600 + r() * 4500 && depth > 0) || a < 1400 || depth > 6) { cells.push(p); return; }
        const [cx, cy] = centroid(p), ang = sh.ang + Math.PI / 2 + (r() - 0.5) * 0.5, t = (r() - 0.5) * 0.3 * sh.len, nx = cx + Math.cos(sh.ang) * t, ny = cy + Math.sin(sh.ang) * t, [p1, p2] = split(p, nx, ny, Math.cos(ang), Math.sin(ang)); if (p1.length < 6 || p2.length < 6) { cells.push(p); return; } cut(p1, depth + 1); cut(p2, depth + 1); };
      cut(base, 0); const cl = { x: ox, y: oy, r: Math.hypot(L, Wd) / 2, n: 0 }, hk = r();
      for (const cell of cells) { if (fields.length >= cap) break;
        for (const k of [0, 0.15]) { // за потреби поле трохи стискається, щоб не лізти на дорогу чи воду
          const [cx, cy] = centroid(cell), poly = []; for (let i = 0; i < cell.length; i += 2) { const dx = cx - cell[i], dy = cy - cell[i + 1], d = Math.hypot(dx, dy) || 1, mv = Math.min(d * 0.4, 2.6 + k * d); poly.push(cell[i] + dx / d * mv + (r() - 0.5) * 2.4, cell[i + 1] + dy / d * mv + (r() - 0.5) * 2.4); }
          if (sharp(poly)) continue; const sh = shape(poly), ar = area(poly); if (ar < 900 || sh.asp > 4.2) continue;
          let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (let i = 0; i < poly.length; i += 2) { x0 = Math.min(x0, poly[i]); x1 = Math.max(x1, poly[i]); y0 = Math.min(y0, poly[i + 1]); y1 = Math.max(y1, poly[i + 1]); }
          const [fx, fy] = centroid(poly), f = { pts: poly, x: fx, y: fy, bb: [x0, y0, x1, y1], r: Math.hypot(x1 - x0, y1 - y0) / 2, a: sh.ang + (r() - 0.5) * 0.12 };
          if (!fits(f)) continue; const hh = (r() * 0.45 + hk * 0.55) % 1; f.k = kindAt(d0(fx, fy), hh); f.crop = Math.floor(r() * 4); fields.push(f); cl.n++; break; } }
      if (cl.n) clusters.push(cl);
    }
    fields.clusters = clusters; return fields;
  }
  A.TownFields = { make, inField };
})();
