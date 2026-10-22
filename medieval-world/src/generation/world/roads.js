const wetP = (x, y) => {
    const p = tsamp(x, y, 4);
    return p.E <= 0 || p.rv > .4 || riverBank(x, y) < 2;
  },
  inC = (x, y) => Math.hypot(x, y) < Rat(Math.atan2(y, x)) + 46;
/* ---- прокладання доріг: A* по ґратці з вартістю місцевості ---- */
function cinfo(i, j) {
  const k = (i + 65536) * 131072 + (j + 65536), m = WLD.cc;
  let c = m.get(k);
  if (c) return c;
  const x = (i + .5) * CS, y = (j + .5) * CS;
  if (Math.hypot(x, y) < Rat(Math.atan2(y, x)) + 60) {
    c = { b: 1, w: 1, E: 0, n: 1, r: 0 };
  } else {
    const p = tsamp(x, y, CS);
    let w = 1, r = 0;
    if (p.E > 0) {
      w = 1 + Math.max(0, p.E - .2) * 10 + p.fo * .9 +
        (p.bk == "swamp" ? .9 : 0) + (p.bk == "snow" ? .3 : 0) +
        (p.E > .55 ? 4 : 0);
      if (p.rv > .4 || riverBank(x, y) < CS * .4) {
        w += 7;
        r = 1;
      }
    }
    c = {
      b: p.E <= 0 ? 1 : 0,
      w,
      E: p.E,
      n: .85 + H2(i, j, WLD.s + 70) * .3,
      r,
    };
  }
  m.set(k, c);
  return c;
}
function astar(a, b) {
  const i0 = Math.floor(a[0] / CS),
    j0 = Math.floor(a[1] / CS),
    i1 = Math.floor(b[0] / CS),
    j1 = Math.floor(b[1] / CS),
    dx = b[0] - a[0],
    dy = b[1] - a[1],
    D = Math.hypot(dx, dy) || 1,
    ux = dx / D,
    uy = dy / D,
    band = Math.max(260, D * .42),
    KY = (i, j) => (i + 65536) * 131072 + (j + 65536),
    g = new Map(),
    fr = new Map(),
    cs = new Set(),
    hp = [],
    push = (f, i, j) => {
      hp.push([f, i, j]);
      let n = hp.length - 1;
      while (n > 0) {
        const p = (n - 1) >> 1;
        if (hp[p][0] <= hp[n][0]) break;
        [hp[p], hp[n]] = [hp[n], hp[p]];
        n = p;
      }
    },
    pop = () => {
      const t = hp[0], l = hp.pop();
      if (hp.length) {
        hp[0] = l;
        let n = 0;
        for (;;) {
          let m = n;
          const lc = 2 * n + 1, rc2 = lc + 1;
          if (lc < hp.length && hp[lc][0] < hp[m][0]) m = lc;
          if (rc2 < hp.length && hp[rc2][0] < hp[m][0]) m = rc2;
          if (m == n) break;
          [hp[m], hp[n]] = [hp[n], hp[m]];
          n = m;
        }
      }
      return t;
    },
    K = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
      [2, 1],
      [2, -1],
      [-2, 1],
      [-2, -1],
      [1, 2],
      [1, -2],
      [-1, 2],
      [-1, -2],
    ],
    k0 = KY(i0, j0),
    kg = KY(i1, j1);
  g.set(k0, 0);
  push(0, i0, j0);
  let it = 0, found = false;
  while (hp.length && it++ < Math.max(7000, D / CS * 90)) {
    const [, i, j] = pop(), ki = KY(i, j);
    if (cs.has(ki)) continue;
    cs.add(ki);
    if (ki == kg) {
      found = true;
      break;
    }
    const gi = g.get(ki), ci = cinfo(i, j);
    for (const [di, dj] of K) {
      const ni = i + di,
        nj = j + dj,
        x = (ni + .5) * CS,
        y = (nj + .5) * CS,
        rx = x - a[0],
        ry = y - a[1],
        al = rx * ux + ry * uy;
      if (Math.abs(-rx * uy + ry * ux) > band || al < -band || al > D + band) {
        continue;
      }
      const kn = KY(ni, nj);
      if (cs.has(kn)) continue;
      const cn = cinfo(ni, nj);
      if (cn.b && kn != kg) continue;
      const len = Math.hypot(di, dj) * CS,
        ng = gi + len * (ci.w + cn.w) / 2 * cn.n +
          CS * 90 * Math.abs(cn.E - ci.E),
        old = g.get(kn);
      if (old === undefined || ng < old) {
        g.set(kn, ng);
        fr.set(kn, ki);
        push(ng + Math.hypot((ni - i1) * CS, (nj - j1) * CS), ni, nj);
      }
    }
  }
  if (!found) return null;
  const o = [];
  let k = kg;
  while (k !== undefined) {
    o.push([Math.floor(k / 131072) - 65536, k % 131072 - 65536]);
    k = fr.get(k);
  }
  return o.reverse();
}
function roadPath(a, b, rs) {
  const cells = astar(a, b);
  if (!cells) return null;
  let P = [
      a,
      ...cells.slice(1, -1).map(([i, j]) => [(i + .5) * CS, (j + .5) * CS]),
      b,
    ],
    len = 0;
  for (let i = 1; i < P.length; i++) {
    len += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]);
  }
  if (len > Math.hypot(b[0] - a[0], b[1] - a[1]) * 2.4) return null;
  const raw = P,
    land = (q) => inC(q[0], q[1]) || tsamp(q[0], q[1], 4).E > .004;
  for (let it = 0; it < 2; it++) {
    const o = [P[0]];
    for (let i = 0; i < P.length - 1; i++) {
      const p = P[i], q = P[i + 1];
      o.push([p[0] * .75 + q[0] * .25, p[1] * .75 + q[1] * .25], [
        p[0] * .25 + q[0] * .75,
        p[1] * .25 + q[1] * .75,
      ]);
    }
    o.push(P[P.length - 1]);
    P = o;
  }
  /* згладжування не має зрізати затоки: точки у воді повертаємо до найближчої сухої точки шляху */
  P = P.map((q, i) => {
    if (i == 0 || i == P.length - 1 || land(q)) return q;
    let best = raw[0], bd = 1e9;
    for (const r of raw) {
      const d = Math.hypot(r[0] - q[0], r[1] - q[1]);
      if (d < bd) {
        bd = d;
        best = r;
      }
    }
    for (const t of [.5, .75, .9]) {
      const c = [q[0] + (best[0] - q[0]) * t, q[1] + (best[1] - q[1]) * t];
      if (land(c)) return c;
    }
    return best;
  });
  const wet = P.map((q) => {
    const c = cinfo(Math.floor(q[0] / CS), Math.floor(q[1] / CS));
    return c.r ? wetP(q[0], q[1]) : false;
  });
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const q of P) {
    x0 = Math.min(x0, q[0]);
    y0 = Math.min(y0, q[1]);
    x1 = Math.max(x1, q[0]);
    y1 = Math.max(y1, q[1]);
  }
  return {
    pts: P,
    wet,
    al: rs < .35,
    bb: [x0 - 10, y0 - 10, x1 + 10, y1 + 10],
  };
}
function vroad(a, b, force) {
  const key = "v" + a.id + ">" + b.id, m = WLD.lg;
  if (m.has(key)) return m.get(key);
  if (!force && !tick()) {
    WPEND = true;
    return undefined;
  }
  const g = roadPath(
    [a.x, a.y],
    [b.x, b.y],
    H2(a.i * 7 + b.i, a.j * 5 + b.j, WLD.s + 60),
  );
  m.set(key, g);
  return g;
}
/* Від кожних воріт міста — одна дорога до найвдалішого села (з перевагою за напрямком воріт) */
function wgates() {
  if (WLD.gl) return WLD.gl;
  if (WON) return WLD.gl = [];
  const o = [], used = new Set();
  RDS.forEach((rd, k) => {
    const e = rd[rd.length - 1],
      pv = rd[rd.length - 2],
      dl = Math.hypot(e[0] - pv[0], e[1] - pv[1]) || 1,
      dx = (e[0] - pv[0]) / dl,
      dy = (e[1] - pv[1]) / dl,
      c = vlist(e[0] - 3600, e[1] - 3600, e[0] + 3600, e[1] + 3600).filter(
        (v) => !used.has(v.id),
      ).map((v) => {
        const ex = v.x - e[0], ey = v.y - e[1], d = Math.hypot(ex, ey);
        return [d * (1.7 - (ex * dx + ey * dy) / d), d, v];
      }).filter((a) => a[1] < 3600).sort((a, b) => a[0] - b[0]);
    for (const [, , v] of c.slice(0, 3)) {
      const key = "g" + Math.round(e[0]) + "," + Math.round(e[1]) + ">" + v.id;
      let g = WLD.lg.get(key);
      if (g === undefined) {
        g = roadPath(e, [v.x, v.y], H2(k, v.i, WLD.s + 61));
        WLD.lg.set(key, g);
      }
      if (g) {
        g.to = v;
        used.add(v.id);
        o.push(g);
        break;
      }
    }
  });
  WLD.gl = o;
  return o;
}
/* Магістралі: міста (великі й містечка) з'єднані між собою навіть там, де між ними є села.
   «Відносний сусідський граф» серед міст у межах TRUNK_R (міста між собою) або TRUNK_T (якщо одне з них містечко); кеш у v.te.
   Клас дороги: обидва кінці місто й більше — велика, містечко — середня */
const TRUNK_R = 15000, TRUNK_T = 9000;
function trunkEdges(v) {
  if (v.te) return v.te;
  if (v.tier < 3) return v.te = [];
  const c = [];
  for (let a = Math.floor((v.x - TRUNK_R) / BC); a <= Math.floor((v.x + TRUNK_R) / BC); a++) {
    for (let b = Math.floor((v.y - TRUNK_R) / BC); b <= Math.floor((v.y + TRUNK_R) / BC); b++) {
      const w = bigC(a, b);
      if (w && w.tier >= 3 && Math.hypot(w.x - v.x, w.y - v.y) < TRUNK_R) c.push(w);
    }
  }
  const d2 = (p, q) => Math.hypot(p.x - q.x, p.y - q.y);
  return v.te = c.filter((u) => u !== v && d2(u, v) < (Math.min(u.tier, v.tier) >= 4 ? TRUNK_R : TRUNK_T) &&
    !c.some((w) => w !== u && w !== v && (Math.min(u.tier, v.tier) < 4 || w.tier >= 4) && d2(w, v) < d2(u, v) && d2(w, u) < d2(u, v)));
}
/* усі дорожні зв'язки поселення: сусідні села плюс магістралі між містами */
function redges(v) {
  if (v.re) return v.re;
  const o = vedges(v).slice();
  for (const u of trunkEdges(v)) if (!o.includes(u)) o.push(u);
  return v.re = o;
}
