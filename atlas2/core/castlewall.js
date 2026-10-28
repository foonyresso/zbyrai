// Атлас 2.0, замок: мур по багатокутнику ділянки. Сторони (вода, мур міста, дорога, відкрите), ворота (головні до дороги, що веде до міста; задні; водяні; вилазні),
// вежі (парні біля головної й задньої брами, кутові за поворотом, проміжні за кроком), суцільні відрізки муру без спільних із міським муром ділянок.
(function () {
  'use strict';
  const A = globalThis.Atlas2, G = A.KeepGeo, TAU = Math.PI * 2, clamp = G.clamp;
  const RANK = { avenue: 3, ring: 2.6, embankment: 2.2, street: 2, lane: 1, path: 0.5 };
  // c: {WK, near, c0:[x,y], walled, wallR, wtCity, w}; повертає масив сторін
  function sides(P, c) {
    const out = [], [x0, y0] = c.c0;
    for (let i = 0; i < P.length; i++) {
      const e = G.edge(P, i), mx = (e.ax + e.bx) / 2, my = (e.ay + e.by) / 2, s = { i, len: e.len, a: Math.atan2(e.dy, e.dx), n: [e.nx, e.ny], d: [e.dx, e.dy], mid: [mx, my], water: 0, city: 0, road: null, e };
      const N = Math.max(2, Math.round(e.len / 6)); let wat = 0, cit = 0, rd = null, rdN = 0;
      for (let k = 0; k < N; k++) { const t = (k + 0.5) / N, x = e.ax + (e.bx - e.ax) * t + e.nx * (c.w / 2 + 4), y = e.ay + (e.by - e.ay) * t + e.ny * (c.w / 2 + 4);
        if (c.WK(x, y) !== 0 || c.WK(x + e.nx * 6, y + e.ny * 6) !== 0) wat++;
        if (c.walled && Math.abs(Math.hypot(x - x0, y - y0) - c.wallR(Math.atan2(y - y0, x - x0))) < (c.wtCity || 6) / 2 + 5) cit++;
        const d = c.near(x, y, 22, -1, -2); if (d < 11 && c.near.q) { const q = c.near.q, st = c.streets[q.st]; if (st) { const rk = RANK[st.kind] || 1; if (!rd || rk > rd.rank) rd = { rank: rk, kind: st.kind, st: st.id, d, ang: Math.atan2(q.by - q.ay, q.bx - q.ax), hw: st.hw }; rdN++; } } }
      s.water = wat / N; s.city = cit / N; s.road = rd && rdN >= N * 0.3 ? rd : null; out.push(s);
    }
    return out;
  }
  // позиція на стороні, найближча до дороги (у межах відступу від кутів); повертає довжину від початку сторони
  function nearRoad(s, c, margin) {
    const e = s.e; let best = s.len / 2, bd = 1e18; for (let t = margin; t <= s.len - margin; t += 3) { const x = e.ax + e.dx * t + e.nx * (c.w / 2 + 4), y = e.ay + e.dy * t + e.ny * (c.w / 2 + 4), d = c.near(x, y, 30, -1, -2) + Math.abs(t - s.len / 2) * 0.02; if (d < bd) { bd = d; best = t; } } return best;
  }
  // ворота: головні дивляться на дорогу й місто; опційно задні, водяні, вилазні (через мур міста)
  // o: {rear (0/1), water (0/1), sally (0/1), hw}
  function gates(P, S, c, o, r) {
    const out = [], [x0, y0] = c.c0, hw = o.hw || 3.2;
    const pos = (s, margin) => { margin = Math.min(margin, s.len / 2 - 0.5); const t = s.road ? nearRoad(s, c, margin) : clamp(s.len / 2 + (r() - 0.5) * s.len * 0.3, margin, s.len - margin); const e = s.e; return { x: e.ax + e.dx * t, y: e.ay + e.dy * t, t }; };
    const add = (s, kind, nm, main) => { const p = pos(s, 12 + hw); out.push({ x: p.x, y: p.y, a: Math.atan2(s.n[1], s.n[0]), hw, kind, main, e: s.i, t: p.t, name: nm }); return out[out.length - 1]; };
    const toC = s => { const dx = x0 - s.mid[0], dy = y0 - s.mid[1], l = Math.hypot(dx, dy) || 1; return (s.n[0] * dx + s.n[1] * dy) / l; };
    const okSide = s => s.len >= 16 + hw * 2 && s.water < 0.4 && s.city < 0.4;
    const cand = S.filter(okSide).map(s => ({ s, v: (s.road ? s.road.rank : 0) + 0.8 * toC(s) + 0.9 * Math.min(1, s.len / 50) + r() * 0.15 })).sort((a, b) => b.v - a.v);
    if (!cand.length) { const s = S.slice().sort((a, b) => b.len - a.len)[0]; add(s, 'main', 'Головна брама', true); return out; }
    const m = add(cand[0].s, 'main', 'Головна брама', true);
    if (o.rear) { const far = cand.filter(q => q.s !== cand[0].s).map(q => { let da = Math.abs(Math.atan2(Math.sin(Math.atan2(q.s.n[1], q.s.n[0]) - m.a), Math.cos(Math.atan2(q.s.n[1], q.s.n[0]) - m.a))); return { s: q.s, v: q.v + da * 0.9 }; }).sort((a, b) => b.v - a.v); if (far.length) add(far[0].s, 'rear', 'Задня брама', false); }
    if (o.water) { const ws = S.filter(s => s.water >= 0.5 && s.len >= 14 + hw * 2).sort((a, b) => b.len - a.len); if (ws.length) add(ws[0], 'water', 'Водяна брама', false); }
    if (o.sally) { const cs = S.filter(s => s.city >= 0.5 && s.len >= 14 + hw * 2).sort((a, b) => b.len - a.len); if (cs.length) add(cs[0], 'sally', 'Вилазна брама', false); }
    if (!o.rear && !o.water && !o.sally && cand.length > 1 && r() < 0.5) { const far = cand.slice(1).filter(q => Math.abs(q.s.i - cand[0].s.i) > 0 && q.v > 0.8)[0]; if (far) add(far.s, 'postern', 'Хвіртка', false); }
    return out;
  }
  // вежі: біля воріт (головної й задньої) дві парні, далі кутові (поворот ≥ ang) і проміжні (крок step); сторони, що збігаються з муром міста, вежами не обставляємо;
  // вежі, що налізають на важливіші (брама > кут > проміжна), відпадають
  // style: {corner:'round'|'square'|'bastion', mid:'round'|'square'|'none', r:[min,max]}
  function towers(P, S, gts, st, step, r) {
    const out = [], n = P.length, near = (x, y) => gts.some(g => Math.hypot(g.x - x, g.y - y) < g.hw + 13);
    const rr = () => st.r[0] + r() * (st.r[1] - st.r[0]);
    for (const g of gts) {
      if (!(g.main || g.kind === 'rear')) continue; const s = S[g.e], e = s && s.e, rg = st.r[0] * 0.82, d = g.hw + rg * 0.9 + 1; if (!e || g.t - d < 1 || g.t + d > s.len - 1) continue;
      for (const sg of [-1, 1]) out.push({ x: e.ax + e.dx * (g.t + sg * d), y: e.ay + e.dy * (g.t + sg * d), r: rg, k: st.corner === 'square' ? 'square' : 'round', a: g.a, corner: false, gate: true });
    }
    for (let i = 0; i < n; i++) {
      const a = S[(i + n - 1) % n], b = S[i], cr = a.d[0] * b.d[1] - a.d[1] * b.d[0], dt = a.d[0] * b.d[0] + a.d[1] * b.d[1], th = Math.atan2(cr, dt), v = P[i];
      if (a.city > 0.6 && b.city > 0.6) continue; if (near(v[0], v[1])) continue;
      if (th >= st.ang) out.push({ x: v[0], y: v[1], r: rr() * (st.corner === 'bastion' ? 1.35 : 1), k: st.corner, a: Math.atan2(a.n[1] + b.n[1], a.n[0] + b.n[0]), corner: true });
      else if (th <= -0.5) out.push({ x: v[0], y: v[1], r: rr() * 0.8, k: 'square', a: b.a, corner: true });
    }
    if (st.mid !== 'none') for (const s of S) {
      if (s.city > 0.6 || s.len < step * 1.3) continue; const k = Math.floor(s.len / step), e = s.e;
      for (let j = 1; j < k; j++) { const t = s.len * j / k, x = e.ax + e.dx * t, y = e.ay + e.dy * t; if (near(x, y)) continue; out.push({ x, y, r: rr() * 0.8, k: st.mid, a: s.a, corner: false }); }
    }
    const rank = q => q.gate ? 2 : q.corner ? 1 : 0, kept = [];
    for (const q of out.slice().sort((a, b) => rank(b) - rank(a))) if (!kept.some(o => Math.hypot(o.x - q.x, o.y - q.y) < (o.r + q.r) * 0.85)) kept.push(q);
    return kept;
  }
  // суцільні відрізки муру: сторони, що не збігаються з муром міста (city < 0.6); skip(i) — пропуск сторони; сусідні зливаються в одну ламану
  function runs(P, S, skip) {
    const n = P.length, inc = S.map(s => !(s.city > 0.6) && !(skip && skip(s))), out = []; if (inc.every(Boolean)) { const f = []; for (const p of P) f.push(p[0], p[1]); f.push(P[0][0], P[0][1]); return [f]; }
    let st = inc.findIndex(v => !v); if (st < 0) return out; st = (st + 1) % n; let cur = null;
    for (let k = 0; k < n; k++) { const i = (st + k) % n; if (inc[i]) { if (!cur) cur = [P[i][0], P[i][1]]; cur.push(P[(i + 1) % n][0], P[(i + 1) % n][1]); } else if (cur) { out.push(cur); cur = null; } }
    if (cur) out.push(cur); return out;
  }
  A.KeepWall = { sides, gates, towers, runs, RANK };
})();
