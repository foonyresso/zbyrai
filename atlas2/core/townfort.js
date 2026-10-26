// Атлас 2.0, місто-фортеця (Астракор): гігантське місто лежить повністю з внутрішнього боку Великої стіни й прилягає до неї; вздовж усієї ділянки, де місто торкається стіни, тягнеться оборонний пояс
// (бастіони, метальні машини, вежі, надбрамні твердині), за ним мурова дорога, далі арсенали й казарми. За стіною для міста «порожнеча»: туди не будується нічого.
(function () {
  'use strict';
  const A = globalThis.Atlas2, M = 9, WT = 14, BELT = 34, DEEP = 72; // M — відстань від осі стіни, ближче якої будувати не можна; BELT — вісь мурової дороги; DEEP — ширина оборонного району (м)
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  // стіна біля поселення в локальних метрах (початок — центр клітини): точка стіни, напрям, внутрішня нормаль (до дерева), знакова відстань sd (плюс — всередині)
  function geom(W, s) {
    const CS = W.params.kmPerCell * 1000, px = (s.wf[0] - s.x - 0.5) * CS, py = (s.wf[1] - s.y - 0.5) * CS, tx = Math.cos(s.wa), ty = Math.sin(s.wa), seed = A.Rng.hashSeed(W.params.seed + '|fw' + s.id) & 0x7fffffff;
    let nx = -ty, ny = tx; if ((W.w / 2 - s.wf[0]) * nx + (W.h / 2 - s.wf[1]) * ny < 0) { nx = -nx; ny = -ny; }
    const wob = u => 5 * (A.TownEnv.vnoise(u / 140 + 60, 0.5, seed) - 0.5); // стіна не ідеально пряма
    return { px, py, tx, ty, nx, ny, wob, sd: (x, y) => (x - px) * nx + (y - py) * ny + wob((x - px) * tx + (y - py) * ty), u: (x, y) => (x - px) * tx + (y - py) * ty, at: (u, d) => [px + tx * u + nx * (d - wob(u)), py + ty * u + ny * (d - wob(u))], gates: [] };
  }

  // для міста за стіною «порожнеча» (вода класу 2), дороги карти обрізані по зоні оборонної лінії; кожна дорога, що доходить до стіни (або вела до фортеці), завершується
  // плавною кривою й прямим проїздом упритул до воріт; близькі проїзди зливаються в одні ворота
  function attach(env, g, lim) {
    const base = env.waterKind, T0 = M + 0.5, T1 = BELT - 4, runs = [], hwOf = l => l === 1 ? 7 : l === 2 ? 5.5 : l === 3 ? 4.2 : 3;
    env.waterKind = (x, y) => g.sd(x, y) < M ? 2 : base(x, y); env.outer = (x, y) => g.sd(x, y) < M; env.fort = g;
    const toWall = (arr, atStart, level) => { // продовжити кінець дороги до воріт
      const n = arr.length, i = atStart ? 0 : n - 2, px = arr[i], py = arr[i + 1], qx = atStart ? arr[2] : arr[n - 4], qy = atStart ? arr[3] : arr[n - 3], dl = Math.hypot(px - qx, py - qy) || 1, dx = (px - qx) / dl, dy = (py - qy) / dl;
      let uf = g.u(px, py); const ex = g.gates.find(q => Math.abs(q.u - uf) < 70); if (ex) uf = ex.u; const f = g.at(uf, T0), D = Math.hypot(f[0] - px, f[1] - py), L1 = Math.min(40, D * 0.45), L2 = D * 0.5, out = [];
      const p1 = [px + dx * L1, py + dy * L1], p2 = [f[0] + g.nx * L2, f[1] + g.ny * L2];
      for (let k = 1; k <= 8; k++) { const s = k / 8, u = 1 - s, c0 = u * u * u, c1 = 3 * u * u * s, c2 = 3 * u * s * s, c3 = s * s * s; out.push(c0 * px + c1 * p1[0] + c2 * p2[0] + c3 * f[0], c0 * py + c1 * p1[1] + c2 * p2[1] + c3 * f[1]); }
      if (atStart) { const rev = []; for (let k = out.length - 2; k >= 0; k -= 2) rev.push(out[k], out[k + 1]); arr.unshift(...rev); } else arr.push(...out);
      if (!ex) g.gates.push({ x: f[0], y: f[1], a: Math.atan2(-g.ny, -g.nx), level, hw: hwOf(level), main: true, u: uf });
    };
    for (const rn of env.runs) {
      const p = rn.pts; let cur = [], prev = null, ps = 0, ends = [0, 0];
      const flush = () => { if (cur.length >= 4) { if (ends[0]) toWall(cur, true, rn.level); if (ends[1]) toWall(cur, false, rn.level); runs.push({ level: rn.level, pts: cur }); } cur = []; ends = [0, 0]; }, cut = (b, sb) => { const t = (T1 - ps) / (sb - ps); return [prev[0] + (b[0] - prev[0]) * t, prev[1] + (b[1] - prev[1]) * t]; };
      for (let i = 0; i < p.length; i += 2) {
        const x = p[i], y = p[i + 1], s = g.sd(x, y);
        if (s >= T1) { if (!cur.length && prev) { const c = cut([x, y], s); cur.push(c[0], c[1]); ends[0] = 1; } cur.push(x, y); }
        else if (cur.length) { const c = cut([x, y], s); cur.push(c[0], c[1]); ends[1] = 1; flush(); }
        prev = [x, y]; ps = s;
      }
      if (cur.length >= 4) { const n = cur.length; // дорога закінчується в місті (вела до фортеці): кінець дотягується до воріт; обрізані колом lim кінці не чіпаємо
        if (!ends[1] && Math.hypot(cur[n - 2], cur[n - 1]) < lim * 0.85) ends[1] = 1; if (!ends[0] && Math.hypot(cur[0], cur[1]) < lim * 0.85) ends[0] = 1; }
      flush();
    }
    env.runs = runs;
  }

  // центр міста: вглиб від стіни
  const centre = (g, R) => g.at(0, R * 0.38);
  // половина довжини ділянки, де місто торкається стіни (круг радіусом Rb навколо центру перетинає лінію стіни)
  const reach = (g, x0, y0, Rb) => { const d = g.sd(x0, y0); return Math.sqrt(Math.max(0, Rb * Rb - d * d)); };

  // вулиці: мурова дорога паралельно стіні та вилазні брами (вулиці, що перетинають мурову дорогу й упираються в стіну)
  function streets(g, net, o) {
    const { x0, y0, Rmax, WK, U, cname, r } = o, mk = (kind, hw, pts) => { const st = net.mkSt(kind, hw); for (let i = 0; i < pts.length; i += 2) { const n = st.pts.length; if (n >= 2) net.addSeg(st, st.pts[n - 2], st.pts[n - 1], pts[i], pts[i + 1], 0); st.pts.push(pts[i], pts[i + 1]); st.br.push(0); } return st; };
    const uc = g.u(x0, y0), ur = U * 1.12; let run = [];
    const end = () => { if (run.length >= 8) { const st = mk('ring', 4.5, run); st.wallRoad = true; st.fname = 'Мурова дорога'; } run = []; };
    for (let u = uc - ur; u <= uc + ur; u += 22) { const q = g.at(u, BELT); if (WK(q[0], q[1]) !== 0 || Math.hypot(q[0] - x0, q[1] - y0) > Rmax) { end(); continue; } run.push(q[0], q[1]); } end();
    // вилазні брами: щонайменше дві на ділянку, подалі від основних
    for (const du of [-0.55, 0.55]) {
      const u = uc + U * du; if (g.gates.some(q => Math.abs(q.u - u) < 160)) continue; const a = g.at(u, DEEP + 20), b = g.at(u, M + 0.5); if (WK(a[0], a[1]) !== 0 || WK(b[0], b[1]) !== 0) continue;
      const nm = cname(); g.gates.push({ x: b[0], y: b[1], a: Math.atan2(g.ny, g.nx), hw: 4.2, main: false, u, name: 'Вилазна брама «' + nm + '»' }); const st = mk('street', 4.2, [a[0], a[1], b[0], b[1]]); st.fname = 'Дорога до вилазної брами «' + nm + '»';
    }
    g.gates.forEach((q, k) => { if (!q.name) q.name = (q.level && q.level <= 2 ? 'Головна брама «' : 'Брама «') + cname() + '»'; });
  }

  // оборонна лінія вздовж стіни: кожні 30 м споруда; на воротах дві надбрамні твердині збоку проїзду. Повертає кількість споруд
  function line(g, c) {
    const { r, addB, canPlace, T, U, uc } = c, seq = ['bastion', 'ballista', 'wtower'], out = [];
    const put = (type, u, jit) => {
      const t = T[type], w = t.w * (jit ? 0.92 + r() * 0.16 : 1), h = t.h * (jit ? 0.92 + r() * 0.16 : 1);
      for (const du of [0, 6, -6, 12, -12, 18, -18]) { const p = g.at(u + du, M + 1 + h / 2), b = { type, x: p[0], y: p[1], w, h, a: Math.atan2(g.ty, g.tx), st: -1, side: 1, rampart: true, u: Math.round(u + du) }; if (canPlace(b, false, false)) { out.push(addB(b)); return true; } }
      return false;
    };
    for (const q of g.gates) { if (Math.abs(q.u - uc) > U) continue; put('gatehouse', q.u - 25, false); put('gatehouse', q.u + 25, false); }
    let k = 0; for (let u = uc - U; u <= uc + U; u += 30, k++) {
      if (g.gates.some(q => Math.abs(q.u - u) < 18)) continue; // проїзд брами лишається вільним
      const type = seq[k % 3] === 'wtower' && r() < 0.3 ? 'wardtower' : seq[k % 3]; if (!put(type, u, true)) put('wtower', u, true);
    }
    return out;
  }

  // стіна у вигляді об'єкта міста: суцільна лінія, вежі кожні 36 м, ворота
  function wall(g, L) {
    const runs = [], towers = [], pts = []; for (let u = -L; u <= L; u += 20) { const p = g.at(u, 0); pts.push(p[0], p[1]); }
    for (let u = -L; u <= L; u += 36) if (!g.gates.some(q => Math.abs(q.u - u) < 26)) { const p = g.at(u, 0); towers.push(p); }
    runs.push(pts);
    return { on: true, mat: 'stone', w: WT, R: 0, ph: 0, runs, towers, gates: g.gates.map(q => { const p = g.at(q.u, 0); return { x: p[0], y: p[1], a: q.a, hw: q.hw, main: q.main, name: q.name }; }) };
  }

  A.TownFort = { M, WT, BELT, DEEP, geom, attach, centre, reach, streets, line, wall };
})();
