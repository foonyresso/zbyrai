// Атлас 2.0, місто: прибирання вуличної мережі. Згладжує вулиці й стежки, прибирає шпильки (розвороти назад), розв'язує перетини (перехрестя з вузлом або T-стик, без накладань), зливає кінці з вузлами інших вулиць, видаляє дублі й обрізає вулиці перед цвинтарями та іншими місцями.
(function () {
  'use strict';
  const A = globalThis.Atlas2, RANK = { avenue: 5, ring: 4, embankment: 4, street: 3, lane: 2, path: 1 }, SMOOTH = new Set(['street', 'lane', 'path']), GK = 48;
  const rk = st => RANK[st.kind] || 2;
  // перетин відрізків: лише внутрішній (кінці не рахуються)
  function segInt(ax, ay, bx, by, cx, cy, dx, dy) {
    const d = (bx - ax) * (dy - cy) - (by - ay) * (dx - cx); if (Math.abs(d) < 1e-9) return null;
    const t = ((cx - ax) * (dy - cy) - (cy - ay) * (dx - cx)) / d, u = ((cx - ax) * (by - ay) - (cy - ay) * (bx - ax)) / d;
    return t > 1e-3 && t < 1 - 1e-3 && u > 1e-3 && u < 1 - 1e-3 ? [t, u, ax + (bx - ax) * t, ay + (by - ay) * t] : null;
  }
  // шпильки: вершини, де напрям змінюється більше за lim, відкидаються
  function despike(st, lim) {
    const p = st.pts, b = st.br, cl = Math.cos(lim); let ch = true;
    while (ch && p.length >= 6) { ch = false; for (let i = 2; i < p.length - 2; i += 2) { const ux = p[i] - p[i - 2], uy = p[i + 1] - p[i - 1], vx = p[i + 2] - p[i], vy = p[i + 3] - p[i + 1], lu = Math.hypot(ux, uy), lv = Math.hypot(vx, vy);
      if (!lu || !lv || (ux * vx + uy * vy) / (lu * lv) < cl) { p.splice(i, 2); b.splice(i / 2, 1); ch = true; break; } } }
  }
  function chaikin(st, it) {
    for (let k = 0; k < it; k++) { const p = st.pts, b = st.br, n = p.length / 2; if (n < 3) return; const q = [p[0], p[1]], nb = [b[0]];
      for (let i = 0; i < n - 1; i++) { const ax = p[i * 2], ay = p[i * 2 + 1], bx = p[i * 2 + 2], by = p[i * 2 + 3], f = b[i] || b[i + 1] ? 1 : 0;
        if (i > 0) { q.push(ax * 0.75 + bx * 0.25, ay * 0.75 + by * 0.25); nb.push(f); } if (i < n - 2) { q.push(ax * 0.25 + bx * 0.75, ay * 0.25 + by * 0.75); nb.push(f); } }
      q.push(p[(n - 1) * 2], p[(n - 1) * 2 + 1]); nb.push(b[n - 1]); st.pts = q; st.br = nb; }
  }
  function index(streets) {
    const grid = new Map(), segs = [];
    streets.forEach((st, si) => { const p = st.pts; for (let i = 2; i < p.length; i += 2) { const q = { si, i, ax: p[i - 2], ay: p[i - 1], bx: p[i], by: p[i + 1] }; segs.push(q);
      for (let gx = Math.floor((Math.min(q.ax, q.bx) - 1) / GK); gx <= Math.floor((Math.max(q.ax, q.bx) + 1) / GK); gx++) for (let gy = Math.floor((Math.min(q.ay, q.by) - 1) / GK); gy <= Math.floor((Math.max(q.ay, q.by) + 1) / GK); gy++) { const k = gx * 100003 + gy; (grid.get(k) || grid.set(k, []).get(k)).push(q); } } });
    return { grid, segs };
  }
  function insertNode(st, i, x, y) { // після вершини i/2-1: нова вершина між кінцями відрізка i
    const p = st.pts, b = st.br; if (i < 2 || i > p.length - 0) return; p.splice(i, 0, x, y); b.splice(i / 2, 0, b[i / 2 - 1] && b[i / 2] ? 1 : 0);
  }
  // перетини: перехрестя (обидві з вузлом) або T-стик (менша вулиця обривається на більшій)
  function crossings(streets, from) {
    for (let iter = 0; iter < 8; iter++) {
      const { grid } = index(streets), seen = new Set(), ins = [], cut = new Map(); let found = false;
      for (const g of grid.values()) for (let a = 0; a < g.length; a++) for (let c = a + 1; c < g.length; c++) {
        const s = g[a], t = g[c]; if (s === t) continue; const key = s.si + ':' + s.i + '|' + t.si + ':' + t.i; if (seen.has(key)) continue; seen.add(key);
        if (s.si === t.si && Math.abs(s.i - t.i) < 6) continue; const hit = segInt(s.ax, s.ay, s.bx, s.by, t.ax, t.ay, t.bx, t.by); if (!hit) continue; found = true;
        const A1 = streets[s.si], B1 = streets[t.si], ra = rk(A1), rb = rk(B1), P = [hit[2], hit[3]];
        if (s.si === t.si) { if (SMOOTH.has(A1.kind)) { const lo = s.i < t.i ? s : t, o = cut.get(s.si); const pos = lo.i + (lo === s ? hit[0] : hit[1]); if (!o || pos < o.pos) cut.set(s.si, { i: lo.i, x: P[0], y: P[1], pos }); } continue; }
        if (ra >= 4 && rb >= 4) { ins.push([s.si, s.i, hit[0], P], [t.si, t.i, hit[1], P]); continue; }
        const minor = ra < rb || (ra === rb && A1.id > B1.id) ? [s, hit[0]] : [t, hit[1]], major = minor[0] === s ? t : s, majorT = minor[0] === s ? hit[1] : hit[0];
        if (minor[0].si < from) { ins.push([s.si, s.i, hit[0], P], [t.si, t.i, hit[1], P]); continue; } // ранні вулиці не обрізаємо в пізньому проході
        const pos = minor[0].i + minor[1], o = cut.get(minor[0].si); if (!o || pos < o.pos) cut.set(minor[0].si, { i: minor[0].i, x: P[0], y: P[1], pos, major: major.si, mi: major.i, mt: majorT });
      }
      if (!found) break;
      for (const [si, o] of cut) { const st = streets[si]; st.pts.length = o.i; st.br.length = o.i / 2; st.pts.push(o.x, o.y); st.br.push(st.br[st.br.length - 1] || 0); st.joined = true; if (o.major != null) ins.push([o.major, o.mi, o.mt, [o.x, o.y]]); }
      ins.sort((p, q) => p[0] - q[0] || q[1] - p[1] || q[2] - p[2]);
      for (const [si, i, t, P] of ins) { const st = streets[si]; if (i >= st.pts.length) continue; insertNode(st, i, P[0], P[1]); }
    }
  }
  // кінець вулиці в межах 9 м від іншої вулиці зливається з нею: вузол на цій вулиці, кінець у вузлі
  function snap(streets, from, WK) {
    for (let si = from; si < streets.length; si++) { const st = streets[si]; if (st.kind === 'avenue' || st.kind === 'ring' || st.kind === 'embankment' || st.pts.length < 4) continue; const idx = index(streets);
      for (const end of [0, 1]) { const p = st.pts, n = p.length / 2, vi = end ? n - 1 : 0, x = p[vi * 2], y = p[vi * 2 + 1]; let best = null, bd = 9;
        const near = new Set(); for (let gx = Math.floor((x - 9) / GK); gx <= Math.floor((x + 9) / GK); gx++) for (let gy = Math.floor((y - 9) / GK); gy <= Math.floor((y + 9) / GK); gy++) for (const q of idx.grid.get(gx * 100003 + gy) || []) near.add(q);
        for (const q of near) { if (q.si === si) continue; const dx = q.bx - q.ax, dy = q.by - q.ay, t = Math.max(0, Math.min(1, ((x - q.ax) * dx + (y - q.ay) * dy) / (dx * dx + dy * dy || 1e-9))), d = Math.hypot(q.ax + dx * t - x, q.ay + dy * t - y); if (d < bd && WK(q.ax + dx * t, q.ay + dy * t) !== 2) { bd = d; best = [q, t, q.ax + dx * t, q.ay + dy * t]; } }
        if (!best) continue; const [q, t, px, py] = best, other = streets[q.si]; let nx = px, ny = py;
        if (t < 0.12) { nx = q.ax; ny = q.ay; } else if (t > 0.88) { nx = q.bx; ny = q.by; } else insertNode(other, q.i, px, py);
        p[vi * 2] = nx; p[vi * 2 + 1] = ny; st.joined = true;
        // кінець, що зсунувся, не має давати різкого вигину: передостанні вершини, що ламають лінію, відкидаються
        for (let g = 0; g < 4 && st.pts.length >= 6; g++) { const q = st.pts, m = q.length / 2, e = end ? m - 1 : 0, w = end ? m - 2 : 1, z = end ? m - 3 : 2, ux = q[w * 2] - q[z * 2], uy = q[w * 2 + 1] - q[z * 2 + 1], vx = q[e * 2] - q[w * 2], vy = q[e * 2 + 1] - q[w * 2 + 1], lu = Math.hypot(ux, uy), lv = Math.hypot(vx, vy); if (lu && lv && (ux * vx + uy * vy) / (lu * lv) > 0.34) break; q.splice(w * 2, 2); st.br.splice(w, 1); } st.snapped = (st.snapped || 0) + 1; }
    }
  }
  // дублі: вулиця, що здебільшого лежить на іншій, видаляється
  function dedupe(streets, from) {
    const { grid } = index(streets), dead = new Set();
    streets.forEach((st, si) => { if (si < from || !SMOOTH.has(st.kind) || st.pts.length < 4) return; let n = 0, on = 0; const p = st.pts;
      for (let i = 2; i < p.length; i += 2) { const L = Math.hypot(p[i] - p[i - 2], p[i + 1] - p[i - 1]); for (let s = 0; s < L; s += 5) { const x = p[i - 2] + (p[i] - p[i - 2]) * s / L, y = p[i - 1] + (p[i + 1] - p[i - 1]) * s / L; n++;
        let hit = false; for (const q of grid.get(Math.floor(x / GK) * 100003 + Math.floor(y / GK)) || []) { if (q.si === si || dead.has(q.si)) continue; const dx = q.bx - q.ax, dy = q.by - q.ay, t = Math.max(0, Math.min(1, ((x - q.ax) * dx + (y - q.ay) * dy) / (dx * dx + dy * dy || 1e-9))); if (Math.hypot(q.ax + dx * t - x, q.ay + dy * t - y) < 2.4) { hit = true; break; } } if (hit) on++; } }
      if (n && on / n > 0.5) dead.add(si); });
    return dead;
  }
  // вершини в морі чи озері (поза мостами) відсікаються
  function landClip(st, WK) { for (let i = 0; i < st.pts.length / 2; i++) if (!st.br[i] && WK(st.pts[i * 2], st.pts[i * 2 + 1]) === 2) { st.pts.length = i * 2; st.br.length = i; return; } }
  // короткі хвости біля кінців (після зливання) прибираємо: передостання вершина ближче 3 м до кінця
  function trim(streets) { for (const st of streets) { if (st.kind === 'avenue') continue; for (const end of [0, 1]) { const p = st.pts; while (p.length > 6) { const n = p.length, a = end ? n - 4 : 2, b = end ? n - 2 : 0; if (Math.hypot(p[a] - p[b], p[a + 1] - p[b + 1]) >= 3) break; if (end) { p.splice(n - 4, 2); st.br.splice(st.br.length - 2, 1); } else { p.splice(2, 2); st.br.splice(1, 1); } } } } }
  function renumber(streets) { const map = new Map(); streets.forEach((st, i) => { map.set(st.id, i); }); streets.forEach((st, i) => { st.id = i; st.parent = map.has(st.parent) ? map.get(st.parent) : -1; }); }
  // ранній прохід: до споруд і місць (можна видаляти й перенумеровувати)
  function clean(streets, net) {
    for (const st of streets) { if (st.kind === 'avenue') despike(st, Math.PI * 0.72); else if (SMOOTH.has(st.kind)) { despike(st, Math.PI * 0.55); chaikin(st, 2); landClip(st, net.WK); } }
    for (let i = streets.length - 1; i >= 0; i--) if (streets[i].pts.length < 4) streets.splice(i, 1);
    renumber(streets); crossings(streets, 0); snap(streets, 0, net.WK); trim(streets); crossings(streets, 0); trim(streets);
    const dead = dedupe(streets, 0); for (let i = streets.length - 1; i >= 0; i--) if (dead.has(i)) streets.splice(i, 1);
    for (let i = streets.length - 1; i >= 0; i--) if (streets[i].pts.length < 4) streets.splice(i, 1);
    const len = st => { let L = 0; for (let i = 2; i < st.pts.length; i += 2) L += Math.hypot(st.pts[i] - st.pts[i - 2], st.pts[i + 1] - st.pts[i - 1]); return L; };
    for (let i = streets.length - 1; i >= 0; i--) if (SMOOTH.has(streets[i].kind) && len(streets[i]) < 14) streets.splice(i, 1);
    renumber(streets); net.rebuild();
  }
  // пізній прохід: нові стежки (від місць і застав) обрізаються перед перетинами й місцями, кінці зливаються; нічого не видаляється й не перенумеровується
  function late(streets, from, sites, net) {
    for (let si = from; si < streets.length; si++) { const st = streets[si]; if (st.kind === 'avenue') continue; landClip(st, net.WK); despike(st, Math.PI * 0.55); if (st.pts.length < 4) continue; const p = st.pts;
      for (let i = 2; i < p.length; i += 2) { const mx = (p[i] + p[i - 2]) / 2, my = (p[i + 1] + p[i - 1]) / 2; if (sites.some(f => f.name !== st.to && !st.br[i / 2] && Math.hypot(f.x - mx, f.y - my) < f.r * 0.8)) { if (i >= 4) { p.length = i; st.br.length = i / 2; } else { p.length = 2; st.br.length = 1; } break; } } }
    crossings(streets, from); snap(streets, from, net.WK); trim(streets); crossings(streets, from); trim(streets); const dead = dedupe(streets, from); for (let i = streets.length - 1; i >= from; i--) if (dead.has(i) || streets[i].pts.length < 4) streets.splice(i, 1);
    renumber(streets); net.rebuild();
  }
  A.TownRoads = { clean, late, segInt };
})();
