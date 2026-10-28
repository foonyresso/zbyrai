// Атлас 2.0, замок: внутрішній устрій. Двори (зовнішній і внутрішній за окремим муром, якщо ділянка велика; на пагорбі — мотт), брама внутрішнього муру, головна дорога від воріт до донжона,
// споруди комплексу за програмою виду (донжон, палац, каплиця, казарми, стайня, кузня, арсенал, комори, кухня, господарські двори, цистерна, плац…): кожна ставиться на найкращу
// з кандидатних позицій (вздовж муру або вільно у дворі) з урахуванням бажаних відстаней, перетинів, запасу від муру й дорожнього коридору. Колодязь і дерева — у вільних місцях.
(function () {
  'use strict';
  const A = globalThis.Atlas2, G = A.KeepGeo, TAU = Math.PI * 2, clamp = G.clamp;
  // розтин ділянки на двори лінією майже впоперек осі «брама → вглиб»; frac — частка площі внутрішнього двору; {inner, outer, cut, n} (n — напрям у внутрішній двір) або null
  function split(P, g, frac, r) {
    const A0 = G.area(P), ia = g.a + Math.PI + (r() - 0.5) * 0.7, nx = Math.cos(ia), ny = Math.sin(ia); let lo = 1e18, hi = -1e18;
    for (const p of P) { const d = p[0] * nx + p[1] * ny; if (d < lo) lo = d; if (d > hi) hi = d; }
    let a = lo, b = hi; for (let it = 0; it < 26; it++) { const m = (a + b) / 2; if (G.area(G.clipHalf(P, nx, ny, m)) > A0 * frac) a = m; else b = m; }
    const t = (a + b) / 2, inner = G.clipHalf(P, nx, ny, t), outer = G.clipHalf(P, -nx, -ny, -t); if (inner.length < 3 || outer.length < 3) return null;
    const cut = inner.filter(p => Math.abs(p[0] * nx + p[1] * ny - t) < 1e-3); if (cut.length !== 2 || !G.simple(inner) || !G.simple(outer)) return null;
    if (G.area(inner) < A0 * 0.2 || G.area(outer) < A0 * 0.25) return null; return { inner, outer, cut, n: [nx, ny] };
  }
  const circle = (x, y, rad, k) => { const o = []; for (let i = 0; i < k; i++) { const a = i / k * TAU; o.push([x + Math.cos(a) * rad, y + Math.sin(a) * rad]); } return o; };
  // полюс багатокутника: точка найбільшого запасу до краю (решітка зі кроком step)
  function pole(P, step) { const [x0, y0, x1, y1] = G.bbox(P); let best = null, bd = -1; for (let y = y0; y <= y1; y += step) for (let x = x0; x <= x1; x += step) { if (!G.inside(P, x, y)) continue; const d = G.edgeDist(P, x, y); if (d > bd) { bd = d; best = [x, y]; } } return best ? { x: best[0], y: best[1], d: bd } : null; }
  // відрізок перетинає повернутий прямокутник b, збільшений на pad (відсікання за плитами)
  function segHitsRect(ax, ay, bx, by, b, pad) {
    const c = Math.cos(b.a), s = Math.sin(b.a), l = (x, y) => [(x - b.x) * c + (y - b.y) * s, -(x - b.x) * s + (y - b.y) * c], p = l(ax, ay), q = l(bx, by), hw = b.w / 2 + pad, hh = b.h / 2 + pad;
    let t0 = 0, t1 = 1; const dx = q[0] - p[0], dy = q[1] - p[1];
    for (const [pp, dd, lim] of [[p[0], dx, hw], [p[1], dy, hh]]) { if (Math.abs(dd) < 1e-9) { if (Math.abs(pp) > lim) return false; continue; } let u0 = (-lim - pp) / dd, u1 = (lim - pp) / dd; if (u0 > u1) { const t = u0; u0 = u1; u1 = t; } t0 = Math.max(t0, u0); t1 = Math.min(t1, u1); if (t0 > t1) return false; }
    return true;
  }
  // o: {P, ty, r, T, w, gates, A, nm, sc}; повертає {wards, inner, bl, paths, decos, props, ground}
  function make(o) {
    const { P, ty, r, w } = o, out = { wards: [], inner: null, bl: [], paths: [], decos: [], props: [], ground: [] }, main = o.gates.find(g => g.main) || o.gates[0], dirOut = g => [Math.cos(g.a), Math.sin(g.a)];
    const gin = (g, d) => [g.x - Math.cos(g.a) * d, g.y - Math.sin(g.a) * d];
    // ---- двори
    let outer = P, inner = null, motte = null;
    if (ty.ward === 'motte') {
      const pl = pole(P, 3) || { x: o.cx, y: o.cy, d: 8 }, rad = clamp(Math.sqrt(o.A) * 0.21, 15, 24), cand = []; const sp = Math.sqrt(o.A) * 0.45;
      for (let t = 0; t < 120; t++) { const q = [pl.x + (r() - 0.5) * 2 * sp, pl.y + (r() - 0.5) * 2 * sp]; if (!G.inside(P, q[0], q[1]) || G.edgeDist(P, q[0], q[1]) < rad + w / 2 + 1) continue; cand.push([q, Math.hypot(q[0] - main.x, q[1] - main.y) * 0.8 + G.edgeDist(P, q[0], q[1]) * 0.3]); }
      cand.sort((a, b) => b[1] - a[1]); if (cand.length) { const q = cand[0][0]; motte = { x: q[0], y: q[1], r: rad }; inner = circle(q[0], q[1], rad, 22); }
    } else if ((ty.ward === 'two' && o.A > 4200) || (ty.ward === 'one' && o.A > 14000)) {
      const fr = ty.innerFrac || [0.2, 0.28], sp = split(P, main, fr[0] + r() * (fr[1] - fr[0]), r); if (sp) { inner = sp.inner; outer = sp.outer; out.cutN = sp.n; out.cut = sp.cut; }
    }
    out.wards.push({ poly: outer, kind: 'outer' }); if (inner) out.wards.push({ poly: inner, kind: motte ? 'motte' : 'inner' });
    if (inner && motte) { const ag = Math.atan2(main.y - motte.y, main.x - motte.x); out.inner = { poly: inner, circle: motte, w: Math.max(2.8, w * 0.8), gate: { x: motte.x + Math.cos(ag) * motte.r, y: motte.y + Math.sin(ag) * motte.r, a: ag, hw: 2.4, kind: 'inner' } }; }
    else if (inner && out.cut) { const [c0, c1] = out.cut, t = 0.5 + (r() - 0.5) * 0.3; out.inner = { poly: inner, cut: out.cut, w: Math.max(2.6, w * 0.75), gate: { x: c0[0] + (c1[0] - c0[0]) * t, y: c0[1] + (c1[1] - c0[1]) * t, a: Math.atan2(-out.cutN[1], -out.cutN[0]), hw: 2.6, kind: 'inner' }, towers: [c0, c1] }; }
    delete out.cutN; delete out.cut;
    // ---- розміщувач
    const occ = [], cor = [], tw = (o.towers || []).map(t => [t.x, t.y, t.r + 1.4]), gz = o.gates.map(g => { const q = gin(g, 7); return [q[0], q[1], 11 + g.hw]; }), clearW = w / 2 + (out.inner ? 1.8 : 1.2), ctr = G.centroid(P), dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
    if (out.inner) { const g2 = out.inner.gate, q = [g2.x - Math.cos(g2.a) * 4, g2.y - Math.sin(g2.a) * 4], q2 = [g2.x + Math.cos(g2.a) * 4, g2.y + Math.sin(g2.a) * 4]; gz.push([q[0], q[1], 4.6], [q2[0], q2[1], 4.6]); }
    if (out.inner && out.inner.towers) for (const q of out.inner.towers) tw.push([q[0], q[1], out.inner.w * 1.05 + 2.8]);
    const wardOf = k => (k === 'inner' && inner ? inner : outer), md = b => Math.max(b.w, b.h);
    const free = (b, poly, clear, gap, relax) => {
      if (b.round) { if (!G.inside(poly, b.x, b.y) || G.edgeDist(poly, b.x, b.y) < b.w / 2 + clear) return false; } else if (!G.rectIn(poly, b, clear)) return false;
      for (const q of occ) if (Math.hypot(q.x - b.x, q.y - b.y) < (md(q) + md(b)) * 0.75 + gap && G.rectsHit(b, q, gap)) return false;
      if (!relax) { for (const c of cor) if (segHitsRect(c[0], c[1], c[2], c[3], b, c[4])) return false;
        for (const z of gz) if (Math.hypot(b.x - z[0], b.y - z[1]) < z[2] + md(b) * 0.4) return false; }
      for (const t of tw) { const dx = b.x - t[0], dy = b.y - t[1]; if (Math.hypot(dx, dy) > md(b) * 0.8 + t[2]) continue; if (b.round) { if (Math.hypot(dx, dy) < t[2] + b.w / 2) return false; continue; } const c = Math.cos(b.a), sn = Math.sin(b.a), lx = dx * c + dy * sn, ly = -dx * sn + dy * c; if (Math.hypot(Math.max(Math.abs(lx) - b.w / 2, 0), Math.max(Math.abs(ly) - b.h / 2, 0)) < t[2]) return false; }
      if (motte && poly === outer && Math.hypot(b.x - motte.x, b.y - motte.y) < motte.r + md(b) * 0.55 + 4) return false;
      return true;
    };
    const cands = (poly, w0, h0, mode, N) => {
      const res = [], n = poly.length;
      if (mode !== 'free') for (let i = 0; i < n; i++) { const e = G.edge(poly, i); if (e.len < w0 * 0.8) continue; const off = clearW + h0 / 2 + 0.6, ang = Math.atan2(e.dy, e.dx);
        for (let s = w0 / 2 + 3; s <= e.len - w0 / 2 - 3; s += Math.max(2.5, w0 / 5)) res.push({ x: e.ax + e.dx * s - e.nx * off, y: e.ay + e.dy * s - e.ny * off, a: ang, wall: 1 }); }
      if (mode !== 'wall') { const [x0, y0, x1, y1] = G.bbox(poly), st = Math.max(2.4, Math.sqrt(Math.abs(G.area(poly)) / N)); for (let gy = y0 + st / 2; gy < y1; gy += st) for (let gx = x0 + st / 2; gx < x1; gx += st) { const x = gx + (r() - 0.5) * st, y = gy + (r() - 0.5) * st; if (!G.inside(poly, x, y)) continue; let bi = 0, bd = 1e18; for (let i = 0; i < n; i++) { const d = G.segDist(x, y, poly[i][0], poly[i][1], poly[(i + 1) % n][0], poly[(i + 1) % n][1]); if (d < bd) { bd = d; bi = i; } } const e = G.edge(poly, bi); res.push({ x, y, a: Math.atan2(e.dy, e.dx) + (r() - 0.5) * 0.1, wall: 0 }); } }
      return res;
    };
    const find = t => out.bl.find(b => b.type === t);
    // spec: {type, w, h, ward, mode, rot, pole, wall, gate, rear, nearT:[тип, d], near:[[x,y], d], water:[x,y], ctr, name, desc, uniq, round}
    const placeTry = (spec, relax) => {
      const poly = wardOf(spec.ward), clear = spec.clear != null ? spec.clear : (relax ? clearW - 1 : clearW), ref = spec.nearT && find(spec.nearT[0]), near = spec.near || (ref ? [[ref.x, ref.y], spec.nearT[1]] : null); let best = null, bs = -1e18;
      for (const rot of spec.rot || [0]) { const w0 = rot ? spec.h : spec.w, h0 = rot ? spec.w : spec.h;
        for (const c of cands(poly, w0, h0, spec.mode || 'both', relax ? 420 : 240)) {
          const b = { x: c.x, y: c.y, w: w0, h: h0, a: c.a, round: !!spec.round }; if (!free(b, poly, clear, spec.gap == null ? (relax ? 1.2 : 2.2) : spec.gap, relax)) continue;
          const ed = G.edgeDist(poly, c.x, c.y), p = [c.x, c.y]; let sc = r() * 0.8 + (c.wall ? (spec.wall || 0) : 0);
          if (spec.pole) sc += ed * spec.pole; if (spec.wall) sc -= Math.max(0, ed - clearW - h0 / 2) * 0.12 * spec.wall;
          if (spec.gate) sc -= dist(p, gin(main, 6)) * 0.045 * spec.gate; if (spec.rear) sc += dist(p, gin(main, 6)) * 0.04 * spec.rear;
          if (near) sc -= Math.abs(dist(p, near[0]) - near[1]) * 0.1; if (spec.water && o.waterPt) sc -= dist(p, o.waterPt) * 0.06; if (spec.ctr) sc -= dist(p, ctr) * 0.05 * spec.ctr;
          if (sc > bs) { bs = sc; best = b; } } }
      if (!best) return null; Object.assign(best, { type: spec.type, pname: spec.name || null, pdesc: spec.desc || null, kp: true, uniq: !!spec.uniq, inner: wardOf(spec.ward) === inner && inner !== outer }); occ.push(best); out.bl.push(best); return best;
    };
    // спроби розміщення: [двір, [масштаб, послаблення]]. Головні споруди (донжон, палац, каплиця) мусять бути: спершу у своєму дворі зі слабшими запасами й меншими розмірами, потім в іншому.
    // Казарми теж обов'язкові (без послаблення коридору й воріт); решта в разі тісноти меншає, а далі йде в інший двір.
    const CH = { first: [[1, 0], [1, 1], [0.88, 1], [0.76, 1]], must: [[1, 0], [0.88, 0], [0.76, 0], [0.76, 1]], opt: [[1, 0], [0.84, 0], [0.7, 0]] };
    const place = spec => {
      const wds = inner && !motte ? [spec.ward, spec.ward === 'inner' ? 'outer' : 'inner'] : [spec.ward], ch = spec.first ? CH.first : spec.must ? CH.must : CH.opt, tries = [];
      if (spec.first) for (const wd of wds) for (const c of ch) tries.push([wd, c]); else for (const c of ch) for (const wd of wds) tries.push([wd, c]);
      for (const [wd, [f, relax]] of tries) { const b = placeTry(Object.assign({}, spec, { ward: wd }, f === 1 ? {} : { w: spec.w * f, h: spec.h * f }), relax); if (b) return b; }
      return null;
    };
    const sz = o.sc, U = (a, b) => (a + r() * (b - a)) * sz, specs = ty.prog(o, { U, sz });
    // 1. донжон, палац, каплиця (першими: решта підлаштовується)
    for (const s of specs.filter(q => q.first)) place(s);
    // 2. головна вісь: ворота → (брама внутрішнього муру) → вхід у донжон; споруди її не перекривають
    const dj = find('donjon'), pl = pole(inner || outer, 2.5) || { x: ctr[0], y: ctr[1] }, P0 = gin(main, w / 2 + 1.5), pts = [P0[0], P0[1]], dir = dirOut(main), add = (x, y) => { const n = pts.length; if (Math.hypot(x - pts[n - 2], y - pts[n - 1]) > 1) pts.push(x, y); };
    add(P0[0] - dir[0] * 9, P0[1] - dir[1] * 9);
    if (out.inner) { const g2 = out.inner.gate, d2 = [Math.cos(g2.a), Math.sin(g2.a)]; add(g2.x + d2[0] * 6, g2.y + d2[1] * 6); add(g2.x - d2[0] * 6, g2.y - d2[1] * 6); }
    const tg = dj ? [dj.x, dj.y] : [pl.x, pl.y], tl = pts.length, dx = tg[0] - pts[tl - 2], dy = tg[1] - pts[tl - 1], dl = Math.hypot(dx, dy) || 1, stop = dj ? md(dj) / 2 + 2.5 : 0; if (dl > stop + 3) add(pts[tl - 2] + dx / dl * (dl - stop), pts[tl - 1] + dy / dl * (dl - stop));
    out.paths.push({ pts, w: 4.2 }); for (let i = 2; i < pts.length; i += 2) cor.push([pts[i - 2], pts[i - 1], pts[i], pts[i + 1], 2.1 + 1.1]);
    // 3. решта за програмою
    for (const s of specs.filter(q => !q.first)) for (let k = 0, n = s.n || 1; k < n; k++) { const b = place(Object.assign({}, s, { w: s.w * (k ? 0.92 + r() * 0.16 : 1), h: s.h * (k ? 0.92 + r() * 0.16 : 1) })); if (!b) break; }
    // 4. колодязь, клумба, дерева
    const spots = (poly, n, rad) => { const [x0, y0, x1, y1] = G.bbox(poly), res = []; for (let t = 0; t < 240 && res.length < n; t++) { const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0); if (!G.inside(poly, x, y) || G.edgeDist(poly, x, y) < clearW + rad) continue; let ok = true;
      for (const q of occ) if (Math.hypot(q.x - x, q.y - y) < md(q) * 0.62 + rad + 1) { ok = false; break; } if (ok) for (const c of cor) if (G.segDist(x, y, c[0], c[1], c[2], c[3]) < c[4] + rad) { ok = false; break; } if (ok) for (const z of gz) if (Math.hypot(x - z[0], y - z[1]) < z[2] + rad) { ok = false; break; } if (ok) for (const t of tw) if (Math.hypot(x - t[0], y - t[1]) < t[2] + rad) { ok = false; break; }
      if (ok && motte && poly === outer && Math.hypot(x - motte.x, y - motte.y) < motte.r + rad + 3) ok = false; if (ok) for (const q of res) if (Math.hypot(q[0] - x, q[1] - y) < rad * 2.2) { ok = false; break; } if (ok) res.push([x, y]); } return res; };
    const wl = spots(outer, 1, 3.4); if (wl.length) out.props.push({ t: 'well', x: wl[0][0], y: wl[0][1], r: 2.2, name: 'Колодязь замку' });
    for (const wd of out.wards) { const n = Math.round(Math.sqrt(G.area(wd.poly)) / 13); for (const q of spots(wd.poly, n, 3)) out.decos.push({ t: 'tree', x: q[0], y: q[1], r: 2.6 + r() * 1.6 }); }
    const gp = inner && ty.ward !== 'motte' ? spots(inner, 1, 7) : []; if (gp.length) { const a = Math.atan2(out.inner.gate.y - gp[0][1], out.inner.gate.x - gp[0][0]); out.ground.push({ poly: G.rectCorners({ x: gp[0][0], y: gp[0][1], w: 11 * sz, h: 8 * sz, a }, 0), kind: 'garden' }); }
    return out;
  }
  A.KeepLayout = { split, make, pole, circle, segHitsRect };
})();
