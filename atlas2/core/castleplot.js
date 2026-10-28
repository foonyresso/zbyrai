// Атлас 2.0, замок: ділянка вирізається з готового плану міста. Растр вільного простору (дороги за вагою, вода, мур міста, місця, споруди) → кандидати-території
// (ріст за вартістю від зерна в повернутому вздовж дороги вікні: дорогу перетнути дорого, воду й проспекти не можна) → оцінка (межа лежить на дорогах і воді, форма цільна, площа
// близька до потрібної, не в самому центрі) → найкраща → згладжена ізолінія → спрощений багатокутник, сторони якого повторюють вулиці й берег.
(function () {
  'use strict';
  const A = globalThis.Atlas2, G = A.KeepGeo, TAU = Math.PI * 2, clamp = G.clamp;
  const FREE = 0, SOFT = 1, MED = 2, HARD = 3, WATER = 4, BLOCK = 5, WALLIN = 6, OUT = 7;
  const RK = { avenue: HARD, ring: HARD, embankment: HARD, street: MED, lane: SOFT, path: SOFT };
  // растр: c {x0,y0,R,WK,d0,streets,F,B,walled,wallR,wtCity,fort,gap,hard}; hard — множина видів доріг, які не перетинаються (за замовчуванням проспект, кільце, набережна)
  function space(c) {
    const PX = c.R > 420 ? 4 : 3, L = c.R * 1.04, n = Math.ceil(2 * L / PX) + 6, ox = c.x0 - L - 3 * PX, oy = c.y0 - L - 3 * PX, cls = new Uint8Array(n * n), S = { n, PX, ox, oy, cls, x0: c.x0, y0: c.y0, L };
    const hwB = (c.wtCity || 6) / 2 + 3;
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const x = ox + (i + 0.5) * PX, y = oy + (j + 0.5) * PX, d = Math.hypot(x - c.x0, y - c.y0), k = j * n + i; if (d > L) { cls[k] = OUT; continue; }
      if (c.WK(x, y) !== 0) { cls[k] = WATER; continue; }
      if (c.walled) { const u = d - c.wallR(Math.atan2(y - c.y0, x - c.x0)); if (u > hwB) { cls[k] = OUT; continue; } if (u > 0) { cls[k] = OUT; continue; } if (u > -hwB) { cls[k] = WALLIN; continue; } } else if (d > c.R * 0.97) { cls[k] = OUT; continue; }
      if (c.fort && c.fort.sd(x, y) < c.fortDeep) cls[k] = OUT;
    }
    // берег: смуга в одну клітину теж вода (мур не стоїть у воді)
    const wet = []; for (let j = 1; j < n - 1; j++) for (let i = 1; i < n - 1; i++) { const k = j * n + i; if (cls[k] === FREE && (cls[k - 1] === WATER || cls[k + 1] === WATER || cls[k - n] === WATER || cls[k + n] === WATER)) wet.push(k); } for (const k of wet) cls[k] = WATER;
    const mark = (cx, cy, rad, v) => { const i0 = Math.max(0, Math.floor((cx - rad - ox) / PX)), i1 = Math.min(n - 1, Math.floor((cx + rad - ox) / PX)), j0 = Math.max(0, Math.floor((cy - rad - oy) / PX)), j1 = Math.min(n - 1, Math.floor((cy + rad - oy) / PX)); for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { const k = j * n + i; if (cls[k] === FREE && Math.hypot(ox + (i + 0.5) * PX - cx, oy + (j + 0.5) * PX - cy) < rad) cls[k] = v; } };
    for (const f of c.F) if (f.t === 'plaza' || f.t === 'park' || f.t === 'pond' || f.t === 'site') mark(f.x, f.y, f.r + 3, BLOCK);
    for (const b of c.B) mark(b.x, b.y, Math.hypot(b.w, b.h) / 2 + 2, BLOCK);
    // дороги
    const hard = c.hard || null;
    for (const st of c.streets) {
      let cl = RK[st.kind] || MED; if (hard && cl >= SOFT && cl <= HARD) cl = hard.has(st.kind) ? HARD : st.kind === 'street' || st.kind === 'ring' ? MED : cl < HARD ? cl : MED; const rad = st.hw + c.gap, p = st.pts;
      for (let q = 2; q < p.length; q += 2) {
        const ax = p[q - 2], ay = p[q - 1], bx = p[q], by = p[q + 1], i0 = Math.max(0, Math.floor((Math.min(ax, bx) - rad - ox) / PX)), i1 = Math.min(n - 1, Math.floor((Math.max(ax, bx) + rad - ox) / PX)), j0 = Math.max(0, Math.floor((Math.min(ay, by) - rad - oy) / PX)), j1 = Math.min(n - 1, Math.floor((Math.max(ay, by) + rad - oy) / PX));
        for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { const k = j * n + i, cur = cls[k]; if (cur !== FREE && !(cur >= SOFT && cur <= HARD && cur < cl)) continue; if (G.segDist(ox + (i + 0.5) * PX, oy + (j + 0.5) * PX, ax, ay, bx, by) < rad) cls[k] = cl; }
      }
    }
    // відстань до найближчої не вільної клітини (в клітинках, чебишов): для зерен і запасу від країв
    const dt = new Uint8Array(n * n).fill(255), q = []; for (let k = 0; k < n * n; k++) if (cls[k] !== FREE) { dt[k] = 0; q.push(k); }
    for (let h = 0; h < q.length; h++) { const k = q[h], i = k % n, j = (k / n) | 0, v = dt[k] + 1; if (v > 60) continue; for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) { const a = i + di, b = j + dj; if (a < 0 || b < 0 || a >= n || b >= n) continue; const kk = b * n + a; if (dt[kk] > v) { dt[kk] = v; q.push(kk); } } }
    S.dt = dt; return S;
  }
  // компоненти вільних клітин (4-зв'язність): масив {cells, pole, area}
  function blocks(S) {
    const { n, cls, dt } = S, lab = new Int32Array(n * n).fill(-1), out = [];
    for (let s = 0; s < n * n; s++) { if (cls[s] !== FREE || lab[s] >= 0) continue; const id = out.length, cells = [s]; lab[s] = id; let pole = s;
      for (let h = 0; h < cells.length; h++) { const k = cells[h]; if (dt[k] > dt[pole]) pole = k; const i = k % n; if (i > 0 && cls[k - 1] === FREE && lab[k - 1] < 0) { lab[k - 1] = id; cells.push(k - 1); } if (i < n - 1 && cls[k + 1] === FREE && lab[k + 1] < 0) { lab[k + 1] = id; cells.push(k + 1); } if (k >= n && cls[k - n] === FREE && lab[k - n] < 0) { lab[k - n] = id; cells.push(k - n); } if (k < n * n - n && cls[k + n] === FREE && lab[k + n] < 0) { lab[k + n] = id; cells.push(k + n); } }
      out.push({ id, cells, pole, area: cells.length * S.PX * S.PX }); }
    return out;
  }
  // ріст території від зерна: Дейкстра за вартістю; дорога (SOFT/MED) дорожча, HARD/вода/мур/споруди непрохідні; вікно win {cx,cy,c,s,hw,hh} (повернутий прямокутник) обмежує
  function grow(S, seed, N, win, K) {
    // tag[k] === T: у черзі з відомою вартістю best[k]; tag[k] === -T: уже взята в територію (T змінюється з кожним викликом, тож старі мітки не заважають)
    const { n, cls, PX, ox, oy } = S, heap = new A.Heap(), best = grow.best && grow.best.length === n * n ? grow.best : (grow.best = new Float32Array(n * n)), tag = grow.tag && grow.tag.length === n * n ? grow.tag : (grow.tag = new Int32Array(n * n)), cells = []; grow.t = (grow.t || 0) + 1; const T = grow.t, mult = [1, 1 + K.soft, 1 + K.med];
    const okc = k => { if (cls[k] > MED) return false; if (win) { const x = ox + ((k % n) + 0.5) * PX - win.cx, y = oy + (((k / n) | 0) + 0.5) * PX - win.cy, u = x * win.c + y * win.s, v = -x * win.s + y * win.c; if (Math.abs(u) > win.hw || Math.abs(v) > win.hh) return false; } return true; };
    tag[seed] = T; best[seed] = 0; heap.push(0, seed);
    while (heap.size && cells.length < N) {
      const k = heap.pop(); if (tag[k] === -T) continue; const g = best[k]; cells.push(k); tag[k] = -T;
      const i = k % n, j = (k / n) | 0;
      for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) { if (!di && !dj) continue; const a = i + di, b = j + dj; if (a < 1 || b < 1 || a >= n - 1 || b >= n - 1) continue; const kk = b * n + a; if (tag[kk] === -T || !okc(kk)) continue; const g2 = g + PX * mult[cls[kk]] * (di && dj ? 1.4142 : 1); if (tag[kk] !== T || g2 < best[kk]) { tag[kk] = T; best[kk] = g2; heap.push(g2, kk); } }
    }
    for (const k of cells) tag[k] = 0; // чистимо мітки: ключі T вже використані, а -T зайві
    return cells;
  }
  // метрики території: довжина межі за сусіднім класом, опуклість, поглинуті дороги
  function metrics(S, cells) {
    const { n, cls, PX } = S, inT = metrics.m && metrics.m.length === n * n ? metrics.m : (metrics.m = new Uint8Array(n * n)); for (const k of cells) inT[k] = 1;
    const per = { cut: 0, soft: 0, med: 0, hard: 0, water: 0, block: 0, wall: 0, out: 0 }, edge = [], bd = []; let soft = 0, med = 0, sx = 0, sy = 0;
    for (const k of cells) { const i = k % n, j = (k / n) | 0; sx += i; sy += j; if (cls[k] === SOFT) soft++; else if (cls[k] === MED) med++; let isEdge = false;
      for (const kk of [k - 1, k + 1, k - n, k + n]) { if (inT[kk]) continue; isEdge = true; const c0 = cls[kk]; per[c0 === FREE ? 'cut' : c0 === SOFT ? 'soft' : c0 === MED ? 'med' : c0 === HARD ? 'hard' : c0 === WATER ? 'water' : c0 === BLOCK ? 'block' : c0 === WALLIN ? 'wall' : 'out'] += PX; }
      if (isEdge) { edge.push([(k % n + 0.5) * PX, (((k / n) | 0) + 0.5) * PX]); bd.push(k); } }
    // запас до краю: найбільша відстань від межі вглиб території (клітинки, чебишов); тонка смужка має малий запас
    const dd = metrics.d && metrics.d.length === n * n ? metrics.d : (metrics.d = new Uint8Array(n * n)); for (const k of cells) dd[k] = 255; for (const k of bd) dd[k] = 1; let mx = 1;
    const q = bd.slice();
    for (let h = 0; h < q.length; h++) { const k = q[h], i = k % n, v = dd[k] + 1; for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) { if (i + di < 0 || i + di >= n) continue; const kk = k + dj * n + di; if (kk >= 0 && kk < n * n && inT[kk] && dd[kk] > v) { dd[kk] = v; if (v > mx) mx = v; q.push(kk); } } }
    for (const k of cells) inT[k] = 0;
    const mr = edge.length >= 3 ? G.minRect(edge) : null, asp = mr ? mr.w / Math.max(mr.h, PX * 2) : 1;
    const tot = per.cut + per.soft + per.med + per.hard + per.water + per.block + per.wall + per.out || 1, A = cells.length * PX * PX, H = edge.length >= 3 ? G.area(G.hull(edge)) + PX * Math.sqrt(A) : A;
    const nat = (per.hard + per.med + per.water + per.wall + per.soft * 0.8 + per.block * 0.5 + per.out * 0.25) / tot;
    return { A, per, tot, nat, asp, conv: clamp(A / (H || A), 0, 1), clear: mx * PX, soft: soft * PX * PX, med: med * PX * PX, cx: S.ox + (sx / cells.length + 0.5) * PX, cy: S.oy + (sy / cells.length + 0.5) * PX, water: per.water / tot, wall: per.wall / tot, road: (per.hard + per.med + per.soft) / tot, open: per.cut / tot };
  }
  // багатокутник території: маска (з дірками залитими, з виходом до стіни міста) → розмиття → ізолінія → спрощення
  function polygon(S, cells, o) {
    const { n, cls, PX, ox, oy } = S, mask = new Uint8Array(n * n); for (const k of cells) mask[k] = 1;
    if (o.toWall) { // продовжити до осі стіни міста: клітини смуги «усередині» поруч із територією
      for (let it = 0; it < 4; it++) { const add = []; for (let k = n; k < n * n - n; k++) if (cls[k] === WALLIN && !mask[k] && (mask[k - 1] || mask[k + 1] || mask[k - n] || mask[k + n])) add.push(k); for (const k of add) mask[k] = 1; } }
    // діри: заливка зовні від рамки; усе, що не досягнуте і не маска, стає маскою
    const out = new Uint8Array(n * n), q = [0]; out[0] = 1; for (let h = 0; h < q.length; h++) { const k = q[h], i = k % n, j = (k / n) | 0; for (const [a, b] of [[i - 1, j], [i + 1, j], [i, j - 1], [i, j + 1]]) { if (a < 0 || b < 0 || a >= n || b >= n) continue; const kk = b * n + a; if (!out[kk] && !mask[kk]) { out[kk] = 1; q.push(kk); } } }
    for (let k = 0; k < n * n; k++) if (!out[k]) mask[k] = 1;
    const f = G.blur(mask, n, 2); let loops = G.contour(f, n, PX, ox, oy, 0.5); if (!loops.length) return null;
    let P = null, ba = 0; for (const lp of loops) { const a = Math.abs(G.area(lp)); if (a > ba) { ba = a; P = lp; } } P = G.orient(P);
    for (const tol of [o.tol, o.tol * 1.5, o.tol * 2.2]) { let Q = G.tidy(G.simplify(P, tol), o.minLen, o.minAng); if (Q.length >= 4 && G.simple(Q) && G.area(Q) > ba * 0.7) return Q; }
    return null;
  }
  // зерна: полюси великих блоків, решітка в завеликих, найближча до якоря вільна клітина
  function seeds(S, bl, c, A0) {
    const { n, PX, dt } = S, out = [], seen = new Set(), add = (k, why) => { if (k == null || seen.has(k) || dt[k] < 2) return; const x = S.ox + ((k % n) + 0.5) * PX, y = S.oy + (((k / n) | 0) + 0.5) * PX, d = Math.hypot(x - c.x0, y - c.y0); if (d < c.R * 0.1 || d > c.R * 0.97) return; seen.add(k); out.push({ k, x, y, why }); };
    const list = bl.filter(b => b.area >= A0 * 0.22).sort((p, q) => q.area - p.area).slice(0, 36); for (const b of list) add(b.pole, 'pole');
    const step = Math.max(2, Math.round(Math.max(PX * 5, Math.sqrt(A0) * 0.55) / PX));
    for (const b of list.filter(b => b.area > A0 * 1.5).slice(0, 8)) { let cnt = 0; for (const k of b.cells) { if (cnt >= 10) break; if ((k % n) % step === 0 && ((k / n) | 0) % step === 0) { const before = out.length; add(k, 'grid'); if (out.length > before) cnt++; } } }
    if (c.anchor) { let bk = null, bd = 1e18; for (const b of bl) { if (b.area < A0 * 0.1) continue; for (let t = 0; t < b.cells.length; t += 3) { const k = b.cells[t], x = S.ox + ((k % n) + 0.5) * PX, y = S.oy + (((k / n) | 0) + 0.5) * PX, d = Math.hypot(x - c.anchor.x, y - c.anchor.y); if (d < bd && dt[k] >= 2) { bd = d; bk = k; } } } add(bk, 'anchor'); }
    return out;
  }
  // напрям найближчої дороги до точки (кут), або null
  function roadAngle(c, x, y) { let bd = 1e18, ba = null; for (const st of c.streets) { if (st.kind === 'path') continue; const p = st.pts; for (let i = 2; i < p.length; i += 2) { const d = G.segDist(x, y, p[i - 2], p[i - 1], p[i], p[i + 1]) - st.hw; if (d < bd) { bd = d; ba = Math.atan2(p[i + 1] - p[i - 1], p[i] - p[i - 2]); } } } return ba; }
  // одна спроба: pass задає, які дороги непрохідні й наскільки дорого їх перетинати
  function attempt(c, o) {
    const S = space(Object.assign({}, c, { gap: o.gap, hard: o.hard })), bl = blocks(S), A0 = o.A0, N = Math.round(A0 / (S.PX * S.PX)), sd = seeds(S, bl, c, A0), K = o.K, cand = [];
    for (const sdd of sd) {
      const th0 = roadAngle(c, sdd.x, sdd.y), ths = th0 == null ? [0] : [th0], asp = [1, 1.45];
      for (const th of ths) for (const al of asp) {
        const hh = Math.sqrt(A0 * 2 / al) / 2, hw = hh * al, win = { cx: sdd.x, cy: sdd.y, c: Math.cos(th), s: Math.sin(th), hw, hh }, cells = grow(S, sdd.k, N, win, K); if (cells.length < N * 0.45) continue;
        const m = metrics(S, cells), d0 = Math.hypot(m.cx - c.x0, m.cy - c.y0) / c.R, da = c.anchor ? Math.hypot(m.cx - c.anchor.x, m.cy - c.anchor.y) / (0.4 * c.R) : 9;
        const areaT = -Math.max(0, (0.9 * A0 - m.A) / A0) * 5.5 - Math.max(0, m.A / A0 - 1.25) * 1.5, cen = -1.5 * Math.max(0, 0.2 - d0) / 0.2 - 0.8 * Math.max(0, d0 - 0.8) / 0.2, anc = 0.5 * Math.exp(-da * da), sw = 0.25 * m.soft / 1000 + 0.9 * m.med / 1000;
        const thin = clamp(m.clear / (0.62 * Math.sqrt(A0 / Math.PI)), 0, 1), score = 2.2 * m.nat + 1.0 * m.conv + 0.9 * areaT + cen + anc - sw + 1.6 * thin - 5 * Math.max(0, 0.75 - thin) - 1.1 * Math.max(0, m.asp - 2) + (o.bias ? o.bias(m) : 0);
        cand.push({ cells, m, score, seed: sdd, th, al });
      }
    }
    return { S, cand };
  }
  // ціль: площа A0; повертає {poly, area, cx, cy, r, m (метрики), S, hard} або null. Спершу дороги тверді (кільця теж), далі кільця й вулиці можна поглинати, якщо ділянка вийшла замалою
  function find(c, A0, r) {
    const base = { gap: c.gap || 5.5, A0, K: { soft: 2.5, med: 8 }, bias: c.bias };
    const passes = [{ hard: null }, { hard: new Set(['avenue', 'embankment']), K: { soft: 1.5, med: 3.5 } }, { hard: new Set(['avenue']), K: { soft: 1, med: 2 } }];
    let best = null;
    for (let pi = 0; pi < passes.length; pi++) {
      const p = passes[pi], { S, cand } = attempt(c, Object.assign({}, base, p)); if (!cand.length) continue;
      cand.sort((a, b) => b.score - a.score); const top = cand.slice(0, 6), mx = top[0].score; let pick = top[0]; const w = top.map(t => Math.exp((t.score - mx) * 2.5)), sum = w.reduce((s, v) => s + v, 0); let u = r() * sum; for (let i = 0; i < top.length; i++) { u -= w[i]; if (u <= 0) { pick = top[i]; break; } }
      for (const t of [pick].concat(top.filter(x => x !== pick))) {
        const poly = polygon(S, t.cells, { toWall: t.m.wall > 0.1, tol: S.PX * 1.15, minLen: 7, minAng: 0.17 }); if (!poly) continue;
        const a = G.area(poly); if (a < A0 * 0.45 || (c.accept && !c.accept(poly))) continue; const ce = G.centroid(poly); let rr = 0; for (const q of poly) rr = Math.max(rr, Math.hypot(q[0] - ce[0], q[1] - ce[1]));
        const res = { poly, area: a, cx: ce[0], cy: ce[1], r: rr, m: t.m, S, seed: t.seed, th: t.th, pass: pi, cands: cand.length, hard: p.hard || new Set(['avenue', 'ring', 'embankment']), score: t.score };
        if (!best || res.score > best.score + 0.4) best = res; break;
      }
      if (best && best.area >= A0 * 0.72) break;
    }
    return best;
  }
  A.KeepPlot = { space, blocks, grow, metrics, polygon, find, attempt, roadAngle, CLS: { FREE, SOFT, MED, HARD, WATER, BLOCK, WALLIN, OUT } };
})();
