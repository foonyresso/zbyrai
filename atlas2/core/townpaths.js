// Атлас 2.0, місто: стежки. Кожна споруда без виходу на вулицю (двори між вулицями), кожна ферма, колодязь, хутір і поле за містом сполучені стежкою з найближчою дорогою або іншою стежкою; стежки вужчі й світліші за дороги, плавні, без обривів (кінець або в дверях споруди, на краю поля, біля колодязя, або у вузлі на дорозі чи іншій стежці). Окремий растр 2,5 м (вода, мури, споруди, ставки, місця — перепони; поля — дорожчі за обхід; дороги, площі й попередні стежки — вже «мережа»), пошук Дейкстри від кожного вузла до мережі, потім Дуґлас-Пейкер і згладжування Чайкіна. Свій генератор випадкових чисел: решта міста від стежок не змінюється.
(function () {
  'use strict';
  const A = globalThis.Atlas2, CS = 2.5, W_YARD = 1.5, W_FARM = 2.0, W_FIELD = 2.0, DIAG = Math.SQRT2;
  const pip = (p, x, y) => { let c = false; for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) if ((p[i + 1] > y) !== (p[j + 1] > y) && x < (p[j] - p[i]) * (y - p[i + 1]) / (p[j + 1] - p[i + 1]) + p[i]) c = !c; return c; };
  const hash2 = (i, j) => { let h = (Math.imul(i, 374761393) + Math.imul(j, 668265263)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  // Дуґлас-Пейкер для плоского масиву
  function simplify(p, tol) {
    const n = p.length / 2, keep = new Uint8Array(n); keep[0] = keep[n - 1] = 1;
    const rec = (a, b) => { let m = 0, mi = -1; const ax = p[a * 2], ay = p[a * 2 + 1], dx = p[b * 2] - ax, dy = p[b * 2 + 1] - ay, L = Math.hypot(dx, dy) || 1e-9;
      for (let i = a + 1; i < b; i++) { const d = Math.abs((p[i * 2] - ax) * dy - (p[i * 2 + 1] - ay) * dx) / L; if (d > m) { m = d; mi = i; } } if (m > tol) { keep[mi] = 1; rec(a, mi); rec(mi, b); } };
    if (n > 2) rec(0, n - 1); const o = []; for (let i = 0; i < n; i++) if (keep[i]) o.push(p[i * 2], p[i * 2 + 1]); return o;
  }
  function chaikin(p, it) {
    for (let k = 0; k < it; k++) { const n = p.length / 2; if (n < 3) return p; const q = [p[0], p[1]];
      for (let i = 0; i < n - 1; i++) { const ax = p[i * 2], ay = p[i * 2 + 1], bx = p[i * 2 + 2], by = p[i * 2 + 3]; if (i > 0) q.push(ax * 0.75 + bx * 0.25, ay * 0.75 + by * 0.25); if (i < n - 2) q.push(ax * 0.25 + bx * 0.75, ay * 0.25 + by * 0.75); }
      q.push(p[(n - 1) * 2], p[(n - 1) * 2 + 1]); p = q; }
    return p;
  }
  // найближча точка ламаної
  function nearestOn(p, x, y) { let best = null, bd = 1e18; for (let i = 2; i < p.length; i += 2) { const ax = p[i - 2], ay = p[i - 1], dx = p[i] - ax, dy = p[i + 1] - ay, t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1e-9))), qx = ax + dx * t, qy = ay + dy * t, d = (qx - x) * (qx - x) + (qy - y) * (qy - y); if (d < bd) { bd = d; best = [qx, qy]; } } return best && { x: best[0], y: best[1], d: Math.sqrt(bd) }; }
  const SKIP = new Set(['lighthouse']);
  // o: {r, tier, R, Rmap, x0, y0, streets, B, F, props, fields, sites, WK, d0, wall, blocked(x, y) — додаткові перепони (замок, оборонна лінія)}
  function make(o) {
    const { r, tier, R, Rmap, x0, y0, streets, B, F, props, fields, WK, wall } = o, trails = [];
    const H = Math.min(Rmap, R * (tier >= 3 ? 2.7 : 2.4)) + 30, gx0 = x0 - H, gy0 = y0 - H, N = Math.ceil(H * 2 / CS), NN = N * N;
    const cx = x => Math.floor((x - gx0) / CS), cy = y => Math.floor((y - gy0) / CS), inG = (i, j) => i >= 0 && j >= 0 && i < N && j < N;
    const blk = new Uint8Array(NN), solid = new Uint8Array(NN), net = new Uint8Array(NN), soft = new Uint8Array(NN), ref = new Int32Array(NN), lz = new Uint8Array(NN), trl = new Uint8Array(NN);
    // растр: перепони
    const discBlock = (x, y, rad, val) => { for (let j = cy(y - rad); j <= cy(y + rad); j++) for (let i = cx(x - rad); i <= cx(x + rad); i++) if (inG(i, j) && Math.hypot(gx0 + (i + 0.5) * CS - x, gy0 + (j + 0.5) * CS - y) <= rad) blk[j * N + i] = val; };
    const rectBlock = (b, pad, clear) => { const c = Math.cos(b.a), s = Math.sin(b.a), hw = b.w / 2 + pad, hh = b.h / 2 + pad, rad = Math.hypot(hw, hh), cells = [];
      for (let j = cy(b.y - rad); j <= cy(b.y + rad); j++) for (let i = cx(b.x - rad); i <= cx(b.x + rad); i++) { if (!inG(i, j)) continue; const dx = gx0 + (i + 0.5) * CS - b.x, dy = gy0 + (j + 0.5) * CS - b.y; if (Math.abs(dx * c + dy * s) <= hw && Math.abs(-dx * s + dy * c) <= hh) { if (clear) cells.push(j * N + i); else blk[j * N + i] = 1; } }
      return cells; };
    for (const f of F) { if (f.t === 'pond') discBlock(f.x, f.y, f.r * 0.9 + 1, 1); else if (f.t === 'site') discBlock(f.x, f.y, f.r * 0.92, 1); }
    if (wall && wall.on) for (const run of wall.runs) for (let i = 2; i < run.length; i += 2) { const ax = run[i - 2], ay = run[i - 1], L = Math.hypot(run[i] - ax, run[i + 1] - ay), m = Math.max(1, Math.ceil(L / 1.2)); for (let t = 0; t <= m; t++) discBlock(ax + (run[i] - ax) * t / m, ay + (run[i + 1] - ay) * t / m, wall.w / 2 + 1.6, 1); }
    for (const b of B) { rectBlock(b, 0.9, false); for (const k of rectBlock(b, 0.35, true)) solid[k] = 1; }
    for (const f of fields) { const bb = f.bb; for (let j = cy(bb[1]); j <= cy(bb[3]); j++) for (let i = cx(bb[0]); i <= cx(bb[2]); i++) if (inG(i, j) && pip(f.pts, gx0 + (i + 0.5) * CS, gy0 + (j + 0.5) * CS)) soft[j * N + i] = 1; }
    // растр: мережа (дороги, площі)
    const mark = (x, y, rad, id, clearBlk) => { for (let j = cy(y - rad); j <= cy(y + rad); j++) for (let i = cx(x - rad); i <= cx(x + rad); i++) { if (!inG(i, j)) continue; const k = j * N + i; if (Math.hypot(gx0 + (i + 0.5) * CS - x, gy0 + (j + 0.5) * CS - y) > rad) continue; if (blk[k] && !clearBlk) continue; if (clearBlk) blk[k] = 0; net[k] = 1; ref[k] = id; } };
    streets.forEach((st, si) => { const p = st.pts; for (let i = 2; i < p.length; i += 2) { if (st.br[i / 2] || st.br[i / 2 - 1]) continue; const ax = p[i - 2], ay = p[i - 1], L = Math.hypot(p[i] - ax, p[i + 1] - ay), m = Math.max(1, Math.ceil(L / 1.2)); for (let t = 0; t <= m; t++) mark(ax + (p[i] - ax) * t / m, ay + (p[i + 1] - ay) * t / m, st.hw + 0.6, si + 1, true); } });
    F.forEach((f, fi) => { if (f.t === 'plaza') mark(f.x, f.y, f.r, 1 << 28, true); });
    // вільність клітини: розбір води й додаткових перепон ліниво
    const free = k => { if (solid[k] || blk[k]) return false; if (net[k]) return true; let s = lz[k]; if (!s) { const x = gx0 + ((k % N) + 0.5) * CS, y = gy0 + (((k / N) | 0) + 0.5) * CS; s = lz[k] = WK(x, y) !== 0 || (o.blocked && o.blocked(x, y)) ? 2 : 1; } return s === 1; };
    const freeAt = (x, y) => { const i = cx(x), j = cy(y); return inG(i, j) && free(j * N + i); };
    // купа
    const hk = [], hv = [];
    const hpush = (key, val) => { let i = hk.length; hk.push(key); hv.push(val); while (i > 0) { const p = (i - 1) >> 1; if (hk[p] <= key) break; hk[i] = hk[p]; hv[i] = hv[p]; i = p; } hk[i] = key; hv[i] = val; };
    const hpop = () => { const top = hv[0], lk = hk.pop(), lv = hv.pop(), n = hk.length; if (n) { let i = 0; for (;;) { let c = 2 * i + 1; if (c >= n) break; if (c + 1 < n && hk[c + 1] < hk[c]) c++; if (hk[c] >= lk) break; hk[i] = hk[c]; hv[i] = hv[c]; i = c; } hk[i] = lk; hv[i] = lv; } return top; };
    const dist = new Float32Array(NN), prev = new Int32Array(NN), seen = new Int32Array(NN); let stamp = 0;
    const DX = [1, -1, 0, 0, 1, 1, -1, -1], DY = [0, 0, 1, -1, 1, -1, 1, -1];
    // Дейкстра від кількох клітин до найближчої клітини мережі; повертає ланцюг клітин від кінця (мережа) до початку
    function route(src, cap) {
      stamp++; hk.length = hv.length = 0; for (const k of src) { seen[k] = stamp; dist[k] = 0; prev[k] = -1; hpush(0, k); }
      while (hk.length) { const d = hk[0], k = hpop(); if (d > dist[k] + 1e-6) continue; if (d > cap) return null; if (net[k]) { const out = []; for (let q = k; q >= 0; q = prev[q]) out.push(q); return out; }
        const i0 = k % N, j0 = (k / N) | 0;
        for (let n = 0; n < 8; n++) { const i = i0 + DX[n], j = j0 + DY[n]; if (!inG(i, j)) continue; const q = j * N + i; if (!free(q)) continue; if (n > 3 && !(free(j0 * N + i) && free(j * N + i0))) continue;
          const nd = d + (n > 3 ? DIAG : 1) * CS * (1 + soft[q] * 3.5 + hash2(i, j) * 0.5); if (seen[q] !== stamp || nd < dist[q]) { seen[q] = stamp; dist[q] = nd; prev[q] = k; hpush(nd, q); } } }
      return null;
    }
    const cellPt = k => [gx0 + ((k % N) + 0.5) * CS, gy0 + (((k / N) | 0) + 0.5) * CS];
    // ламана вільна від перепон (перші skip метрів від початку не перевіряються: двері й обвід споруди)
    const clear = (p, skip) => { let acc = 0; for (let i = 2; i < p.length; i += 2) { const ax = p[i - 2], ay = p[i - 1], dx = p[i] - ax, dy = p[i + 1] - ay, L = Math.hypot(dx, dy), m = Math.max(1, Math.ceil(L / 1.1)); for (let t = 0; t <= m; t++) { if (acc + L * t / m >= skip) { const x = ax + dx * t / m, y = ay + dy * t / m; if (!freeAt(x, y) || WK(x, y) !== 0) return false; } } acc += L; } return true; };
    const trailLen = p => { let L = 0; for (let i = 2; i < p.length; i += 2) L += Math.hypot(p[i] - p[i - 2], p[i + 1] - p[i - 1]); return L; };
    // згладжена стежка: клітини → ламана з легким мандруванням → Чайкін; відкат до менш згладженої, якщо зачепила перепони
    function shape(raw, skip) {
      const base = simplify(raw, 1.1), tries = [];
      const meander = p => { const q = [p[0], p[1]]; for (let i = 2; i < p.length; i += 2) { const ax = p[i - 2], ay = p[i - 1], dx = p[i] - ax, dy = p[i + 1] - ay, L = Math.hypot(dx, dy); if (L > 26) { const off = (r() - 0.5) * Math.min(3.5, L * 0.1); q.push(ax + dx / 2 - dy / L * off, ay + dy / 2 + dx / L * off); } q.push(p[i], p[i + 1]); } return q; };
      tries.push(chaikin(meander(base), 3), chaikin(base, 3), chaikin(base, 2), chaikin(raw, 2), chaikin(base, 1), base);
      for (const t of tries) if (clear(t, skip)) return t; return null;
    }
    const addTrail = (pts, w, kind, name) => { const id = trails.length; trails.push({ pts: pts.map(v => Math.round(v * 10) / 10), w, kind, to: name || null });
      for (let i = 2; i < pts.length; i += 2) { const ax = pts[i - 2], ay = pts[i - 1], L = Math.hypot(pts[i] - ax, pts[i + 1] - ay), m = Math.max(1, Math.ceil(L / 1)); for (let t = 0; t <= m; t++) { const x = ax + (pts[i] - ax) * t / m, y = ay + (pts[i + 1] - ay) * t / m; for (let j = cy(y - 1.4); j <= cy(y + 1.4); j++) for (let q = cx(x - 1.4); q <= cx(x + 1.4); q++) { if (!inG(q, j)) continue; const k = j * N + q; if (!free(k) || Math.hypot(gx0 + (q + 0.5) * CS - x, gy0 + (j + 0.5) * CS - y) > 1.4) continue; trl[k] = 1; if (!net[k]) { net[k] = 1; ref[k] = -(id + 1); } } } } };
    // кінець: прив'язка до лінії, на якій закінчився пошук (дорога чи стежка)
    const snapEnd = (p, k) => { const id = ref[k]; if (id > 0 && id < (1 << 28)) { const q = nearestOn(streets[id - 1].pts, p[p.length - 2], p[p.length - 1]); if (q && q.d < 4) { p[p.length - 2] = q.x; p[p.length - 1] = q.y; } } else if (id < 0) { const q = nearestOn(trails[-id - 1].pts, p[p.length - 2], p[p.length - 1]); if (q && q.d < 4) { p[p.length - 2] = q.x; p[p.length - 1] = q.y; } } };
    // вузли: споруди, поля, колодязі, хутори
    const nodes = [], sv = []; // sv: вибірка вершин вулиць для грубої відстані
    for (const st of streets) { const p = st.pts; for (let i = 0; i < p.length; i += 2) if (!(i % 6)) sv.push(p[i], p[i + 1]); }
    const roadDist = (x, y) => { let m = 1e9; for (let i = 0; i < sv.length; i += 2) { const d = Math.abs(sv[i] - x) + Math.abs(sv[i + 1] - y); if (d < m) m = d; } return m; };
    const kindOfB = b => b.type === 'farm' || b.type === 'farmstead' || b.type === 'stable' || b.type === 'windmill' || b.type === 'mill' || b.type === 'hut' ? 'farm' : 'yard';
    for (const b of B) { if (b.site || b.rampart || b.kp || SKIP.has(b.type)) continue; const i = cx(b.x), j = cy(b.y); if (!inG(i, j)) continue; nodes.push({ t: 'b', b, x: b.x, y: b.y, kind: kindOfB(b) }); }
    for (const f of fields) nodes.push({ t: 'f', f, x: f.x, y: f.y, kind: 'field' });
    for (const p of props) if (p.t === 'well' && !F.some(f => f.t === 'site' && Math.hypot(f.x - p.x, f.y - p.y) < f.r * 1.05)) nodes.push({ t: 'w', p, x: p.x, y: p.y, kind: 'farm' });
    for (const f of F) if (f.t === 'site' && f.kind !== 'graveyard') nodes.push({ t: 's', f, x: f.x, y: f.y, kind: 'farm', name: f.name });
    for (const nd of nodes) nd.rd = roadDist(nd.x, nd.y);
    nodes.sort((p, q) => p.rd - q.rd);
    let linked = 0, failed = 0, skipped = 0;
    const outline = (pts, step) => { const out = []; for (let i = 0; i < pts.length; i += 2) { const j = (i + 2) % pts.length, ax = pts[i], ay = pts[i + 1], L = Math.hypot(pts[j] - ax, pts[j + 1] - ay), m = Math.max(1, Math.ceil(L / step)); for (let t = 0; t < m; t++) out.push([ax + (pts[j] - ax) * t / m, ay + (pts[j + 1] - ay) * t / m]); } return out; };
    for (const nd of nodes) {
      let src = [], restore = [], door = null, cap = nd.kind === 'yard' ? 190 : 480;
      if (nd.t === 'b') { const b = nd.b, cells = rectBlock(b, 1.4, true); for (const k of cells) { if (blk[k]) { restore.push(k); blk[k] = 0; } } const c = Math.cos(b.a), s = Math.sin(b.a);
        for (const k of cells) { const [px, py] = cellPt(k), dx = px - b.x, dy = py - b.y, u = dx * c + dy * s, v = -dx * s + dy * c; if (Math.abs(u) > b.w / 2 + 0.05 || Math.abs(v) > b.h / 2 + 0.05) { if (free(k)) src.push(k); } } }
      else if (nd.t === 'f') { for (const [x, y] of outline(nd.f.pts, CS * 0.8)) { const i = cx(x), j = cy(y); if (inG(i, j) && free(j * N + i)) src.push(j * N + i); } src = [...new Set(src)]; }
      else if (nd.t === 'w') { const i = cx(nd.x), j = cy(nd.y); if (inG(i, j)) { for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) { const q = (j + dj) * N + i + di; if (inG(i + di, j + dj) && free(q)) src.push(q); } } }
      else { const f = nd.f; if (streets.some(st => { const q = nearestOn(st.pts, f.x, f.y); return q && q.d < f.r * 1.4 + st.hw; })) { skipped++; continue; }
        for (const [x, y] of outline(Array.from({ length: 24 }, (_, i) => [f.x + Math.cos(i / 24 * Math.PI * 2) * f.r * 0.96, f.y + Math.sin(i / 24 * Math.PI * 2) * f.r * 0.96]).flat(), CS * 0.8)) { const i = cx(x), j = cy(y); if (inG(i, j) && !net[j * N + i]) { const q = j * N + i; if (blk[q]) { blk[q] = 0; restore.push(q); } src.push(q); } } src = [...new Set(src)]; cap = 560; }
      let ok = false;
      if (src.length) {
        const route0 = route(src, cap);
        if (route0) { const k = route0[0], raw = []; for (let q = route0.length - 1; q >= 0; q--) { const [x, y] = cellPt(route0[q]); raw.push(x, y); } // від вузла до мережі
          let pts = raw.slice();
          if (nd.t === 'b') { const b = nd.b, c = Math.cos(b.a), s = Math.sin(b.a), dx = pts[0] - b.x, dy = pts[1] - b.y, u = Math.max(-b.w / 2, Math.min(b.w / 2, dx * c + dy * s)), v = Math.max(-b.h / 2, Math.min(b.h / 2, -dx * s + dy * c)); pts = [b.x + u * c - v * s, b.y + u * s + v * c].concat(pts); }
          const k0 = route0.length === 1; // вузол торкається мережі
          if (k0 && nd.t !== 'b') { ok = true; skipped++; }
          else { const sh = pts.length >= 4 ? shape(pts, nd.t === 'b' ? 2.4 : 0) : pts;
          if (sh && sh.length >= 4) { snapEnd(sh, k); if (trailLen(sh) >= (nd.t === 'b' ? 1.4 : 4) || !k0) { addTrail(sh, nd.kind === 'yard' ? W_YARD : nd.kind === 'field' ? W_FIELD : W_FARM, nd.kind, nd.t === 's' ? nd.name : null); linked++; ok = true; } else { ok = true; skipped++; } } } }
      }
      for (const k of restore) blk[k] = 1;
      if (!ok) failed++;
    }
    return { trails, trl, N, gx0, gy0, stats: { nodes: nodes.length, linked, failed, skipped } };
  }
  // дерева на стежці й впритул прибираються
  function clearTrees(res, trees) {
    const { trl, N, gx0, gy0 } = res, hit = (x, y) => { const i = Math.floor((x - gx0) / CS), j = Math.floor((y - gy0) / CS); return i >= 0 && j >= 0 && i < N && j < N && trl[j * N + i] === 1; };
    return trees.filter(t => { const q = t.r * 0.55; return !(hit(t.x, t.y) || hit(t.x + q, t.y) || hit(t.x - q, t.y) || hit(t.x, t.y + q) || hit(t.x, t.y - q)); });
  }
  // плавна лінія між двома точками (без випадкових чисел): легкий S-вигин, що затихає на кінцях
  function bend(x1, y1, x2, y2) { const L = Math.hypot(x2 - x1, y2 - y1) || 1e-9, m = Math.max(2, Math.ceil(L / 8)), amp = Math.min(5, L * 0.04), ph = (x1 * 0.13 + y1 * 0.29) % 6.28, o = []; for (let k = 0; k <= m; k++) { const t = k / m, off = amp * Math.sin(Math.PI * t) * Math.sin(t * 5.1 + ph); o.push(x1 + (x2 - x1) * t - (y2 - y1) / L * off, y1 + (y2 - y1) * t + (x2 - x1) / L * off); } return chaikin(o, 1); }
  A.TownPaths = { make, clearTrees, simplify, chaikin, bend };
})();
