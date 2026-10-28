// Атлас 2.0, місто: замок (рангу «обласне місто» і «столиця»). Ділянка вирізається з готового плану міста (castleplot), по ній будується мур з баштами й брамами (castlewall),
// всередині комплекс споруд (castletypes, castlelayout), вулиці всередині зникають, а до воріт підводяться дороги (castleroads). Тут усе збирається докупи; місту замок дає запити:
// чи заважає споруда замку (clash), чи точка в замку (inside).
(function () {
  'use strict';
  const A = globalThis.Atlas2, G = A.KeepGeo, clamp = G.clamp;
  const flat = P => { const o = []; for (const p of P) o.push(p[0], p[1]); o.push(P[0][0], P[0][1]); return o; };
  // руїни: мур обривається проваллями (gap — ймовірність провалу після відрізка); повертає {runs, gaps: середини провалів}
  function breakRuns(runs, r, gap) {
    const out = [], gaps = [];
    for (const run of runs) {
      const n = run.length / 2, L = []; let tot = 0; for (let i = 1; i < n; i++) { const d = Math.hypot(run[i * 2] - run[i * 2 - 2], run[i * 2 + 1] - run[i * 2 - 1]); L.push(d); tot += d; }
      const at = s => { let acc = 0; for (let i = 0; i < L.length; i++) { if (s <= acc + L[i] || i === L.length - 1) { const t = clamp((s - acc) / (L[i] || 1), 0, 1); return [run[i * 2] + (run[i * 2 + 2] - run[i * 2]) * t, run[i * 2 + 1] + (run[i * 2 + 3] - run[i * 2 + 1]) * t]; } acc += L[i]; } return [run[0], run[1]]; };
      const slice = (s0, s1) => { const o = [], p0 = at(s0); o.push(p0[0], p0[1]); let acc = 0; for (let i = 0; i < L.length; i++) { acc += L[i]; if (acc > s0 + 0.5 && acc < s1 - 0.5) o.push(run[i * 2 + 2], run[i * 2 + 3]); } const p1 = at(s1); o.push(p1[0], p1[1]); return o; };
      for (let s = 0; s < tot;) { let e = s + 14 + r() * 46; while (e < tot && r() >= gap) e += 14 + r() * 46; e = Math.min(tot, e); if (e - s > 3) out.push(slice(s, e)); const g = 5 + r() * 15; if (e + g < tot) { const m = at(e + g / 2); gaps.push([m[0], m[1]]); } s = e + g; }
    }
    return { runs: out, gaps };
  }
  // o: контекст міста (див. виклик у town.js); повертає об'єкт замку або null
  function build(o) {
    const r = A.Rng.stream(o.seed, 'castle|' + o.sid), { tier, R } = o, fate = o.fate || null, c0 = [o.x0, o.y0], KT = A.KeepTypes, KW = A.KeepWall;
    const A0 = clamp(R * R * (tier >= 4 ? 0.12 : 0.17), 8000, 46000) * (0.9 + 0.2 * r());
    let wet = 0, tot = 0; for (let j = -8; j <= 8; j++) for (let i = -8; i <= 8; i++) { const x = o.x0 + i * R / 9, y = o.y0 + j * R / 9; if (Math.hypot(x - o.x0, y - o.y0) > R * 0.9) continue; tot++; if (o.WK(x, y) !== 0) wet++; }
    const cx = { hilly: o.hilly || 0, tier, fort: !!o.fort, walled: !!o.walled, waterAvail: wet / tot > 0.02 }, want = KT.want(cx, r);
    const plot = A.KeepPlot.find({ x0: o.x0, y0: o.y0, R, WK: o.WK, streets: o.streets, F: o.F, B: o.B, walled: o.walled, wallR: o.wallR, wtCity: o.wtCity, fort: o.fort, fortDeep: A.TownFort ? A.TownFort.DEEP + 8 : 0, anchor: o.anchor, bias: KT.bias(want), accept: P => !o.F.some(f => (f.t === 'plaza' || f.t === 'site' || f.t === 'cemetery') && (G.inside(P, f.x, f.y) || G.edgeDist(P, f.x, f.y) < f.r * 0.4)) }, A0, r);
    if (!plot) return null;
    const ty = KT.choose(plot.m, { hilly: o.hilly || 0, tier, fort: !!o.fort, A: plot.area }, r, want), nm = o.cname(), w = ty.w[0] + r() * (ty.w[1] - ty.w[0]);
    const P = A.KeepRoads.fit(plot.poly, { streets: o.streets, hard: plot.hard, w, WK: o.WK }), area = G.area(P), ce = G.centroid(P); let rr = 0; for (const q of P) rr = Math.max(rr, Math.hypot(q[0] - ce[0], q[1] - ce[1]));
    const sc = clamp(Math.sqrt(area / 6500), 0.75, 1.3), wc = { WK: o.WK, near: o.net.near, streets: o.streets, c0, walled: o.walled, wallR: o.wallR, wtCity: o.wtCity, w };
    // парки й ставки, що опинилися всередині, зникають (замок не міський сад): місце вільне для двору
    for (let i = o.F.length - 1; i >= 0; i--) { const f = o.F[i]; if ((f.t === 'park' || f.t === 'pond') && G.inside(P, f.x, f.y)) o.F.splice(i, 1); }
    // мур: сторони (вода, мур міста, дороги), ворота, вежі
    const S = KW.sides(P, wc), gts = KW.gates(P, S, wc, { rear: !!ty.gates.rear, water: !!ty.gates.water, sally: !!ty.gates.sally, hw: 3.2 }, r);
    let towers = KW.towers(P, S, gts, ty.tower, ty.tower.step, r), runs = KW.runs(P, S), gaps = [];
    const ws = S.filter(s => s.water >= 0.35).sort((a, b) => b.len - a.len)[0], waterPt = ws ? [ws.mid[0] + ws.n[0] * 8, ws.mid[1] + ws.n[1] * 8] : null;
    // двори й споруди
    const L = A.KeepLayout.make({ P, ty, r, w, gates: gts, towers, A: area, nm, sc, cx: ce[0], cy: ce[1], waterPt, hasWater: !!ws, tier });
    if (fate) { const br = breakRuns(runs, r, fate === 'ruined' ? 0.55 : 0.18); runs = br.runs; gaps = br.gaps; towers = towers.filter(() => r() >= (fate === 'ruined' ? 0.5 : 0.12)); }
    // вулиці: усередині мурів зникають, до воріт підводяться дороги
    const rd = A.KeepRoads.carve({ streets: o.streets, nA: o.nA, poly: P, w, hard: plot.hard, gates: gts, F: o.F, WK: o.WK }); o.net.rebuild();
    const ids = []; for (const b of L.bl) { b.st = -1; b.side = 1; ids.push(o.addB(b).id); }
    for (const p of L.props) o.props.push({ t: p.t, x: p.x, y: p.y, r: p.r, name: p.name });
    const rub = gaps.map(q => ({ t: 'spoil', x: q[0] + (r() - 0.5) * 3, y: q[1] + (r() - 0.5) * 3, r: 1.8 + r() * 1.5 }));
    if (o.anchor) { o.anchor.x = ce[0]; o.anchor.y = ce[1]; }
    const keep = { type: ty.id, tn: ty.n, name: 'Замок «' + nm + '»', nm, desc: ty.d, x: ce[0], y: ce[1], r: rr, area, poly: P, w, mat: ty.mat, fate, slope: !!ty.slope,
      runs, towers, gates: gts, wards: L.wards.map(q => ({ poly: flat(q.poly), kind: q.kind })), inner: L.inner && { poly: flat(L.inner.poly), w: L.inner.w, gate: L.inner.gate, circle: L.inner.circle || null, towers: L.inner.towers || [] },
      paths: L.paths, decos: L.decos.concat(rub), ground: L.ground.map(q => ({ poly: flat(q.poly), kind: q.kind })), ids, nA: rd.nA, stubs: rd.stubs.length, pass: plot.pass, m: { water: plot.m.water, wall: plot.m.wall, conv: plot.m.conv } };
    const nb = o.net.blocked; o.net.blocked = (x, y) => (nb && nb(x, y)) || inside(keep, x, y, 2);
    return keep;
  }
  // споруда b (повернутий прямокутник) заважає замку: перетинає мур з відступом pad
  function clash(k, b, pad) {
    pad = (pad == null ? 4 : pad) + k.w / 2; if (Math.hypot(b.x - k.x, b.y - k.y) > k.r + Math.hypot(b.w, b.h) / 2 + pad + 4) return false;
    if (G.inside(k.poly, b.x, b.y) || G.edgeDist(k.poly, b.x, b.y) < pad + Math.min(b.w, b.h) / 2) return true;
    for (const c of G.rectCorners(b, 0)) if (G.inside(k.poly, c[0], c[1]) || G.edgeDist(k.poly, c[0], c[1]) < pad) return true;
    return false;
  }
  const inside = (k, x, y, pad) => !!k && (G.inside(k.poly, x, y) || G.edgeDist(k.poly, x, y) < (pad || 0) + k.w / 2);
  A.TownKeep = { build, clash, inside };
})();
