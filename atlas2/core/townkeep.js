// Атлас 2.0, місто: замковий мур навколо замку (цитадель на горбі): кам'яне кільце з вигином, баштами й брамами там, де його перетинають вулиці; усередині двір без звичайної забудови.
(function () {
  'use strict';
  const A = globalThis.Atlas2, TAU = Math.PI * 2;
  // o: {b — споруда замку, WK, r, tier}
  function make(o) {
    const { b, WK, r, tier } = o, rk = Math.max(b.w, b.h) * 0.65 + 14 + tier * 3, ph = r() * TAU, kr = th => rk * (1 + 0.1 * Math.sin(2 * th + ph) + 0.06 * Math.sin(3 * th + 2 * ph)), w = tier >= 4 ? 4.5 : 3.5;
    const runs = [], towers = []; let run = []; const N = 72;
    for (let k = 0; k <= N; k++) { const th = k / N * TAU, rr = kr(th), x = b.x + Math.cos(th) * rr, y = b.y + Math.sin(th) * rr; if (WK(x, y) === 0) { run.push(x, y); if (k % 6 === 0 && k < N) towers.push([x, y]); } else { if (run.length >= 4) runs.push(run); run = []; } }
    if (run.length >= 4) runs.push(run);
    return { x: b.x, y: b.y, r: rk, kr, w, runs, towers, gates: [] };
  }
  // брами: кожна вулиця, що перетинає мур, дістає прохід
  function gates(keep, streets) {
    for (const st of streets) { if (st.kind === 'embankment' || st.pts.length < 4) continue; const p = st.pts; let cnt = 0;
      for (let i = 2; i < p.length && cnt < 2; i += 2) { const f = (x, y) => Math.hypot(x - keep.x, y - keep.y) - keep.kr(Math.atan2(y - keep.y, x - keep.x)), da = f(p[i - 2], p[i - 1]), db = f(p[i], p[i + 1]);
        if ((da < 0) !== (db < 0) && !st.br[i / 2]) { const t = da / (da - db); keep.gates.push({ x: p[i - 2] + (p[i] - p[i - 2]) * t, y: p[i - 1] + (p[i + 1] - p[i - 1]) * t, a: Math.atan2(p[i + 1] - p[i - 1], p[i] - p[i - 2]), hw: st.hw, main: false }); cnt++; } } }
  }
  A.TownKeep = { make, gates };
})();
