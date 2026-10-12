/* ---- річки світу: річкові системи з притоками ----
   Кожна клітинка RIVC може дати систему: головна річка йде від витоку за спадом висоти до моря чи озера,
   а притоки відходять угору за схилом і впадають у неї. Ширина залежить від накопиченого стоку,
   тому струмок на витоку тонкий, а біля гирла річка широка й розливається. Усе детерміновано seed світу
   і кешується в WLD.rl (кожна гілка: pts, w — ширина в точці, bb). */
const RIVC = 3000,
  RIVN = 4,
  RIVSTEP = 150,
  RIVMAX = 56,
  RSUB = 4,
  RMEAN = 130;
/* RIVMAX*RIVSTEP + притоки (до ~1700 + ~1000) + меандри < RIVN*RIVC: річка з непідвантаженої клітинки
   не може дістатися до точки запиту, тому riverBank не залежить від порядку перегляду */
const rivW = (f) => 2 + 1.6 * Math.sqrt(f);
/* Згладжує ламану (Catmull-Rom) і додає меандри: бічне зміщення з двох синусоїд; у кінцях зміщення 0 */
function meander(c, ma) {
  const n = c.length,
    sx = Math.round(c[0][0] / 10),
    sy = Math.round(c[0][1] / 10),
    ph1 = H2(sx, sy, WLD.s + 71) * PI2,
    ph2 = H2(sx, sy, WLD.s + 72) * PI2,
    out = [],
    g = (i) => c[Math.max(0, Math.min(n - 1, i))];
  for (let i = 0; i < n - 1; i++) {
    for (let k = 0; k < RSUB; k++) {
      const u = k / RSUB,
        t = i + u,
        p0 = g(i - 1),
        p1 = g(i),
        p2 = g(i + 1),
        p3 = g(i + 2),
        u2 = u * u,
        u3 = u2 * u,
        cr = (a, b, d, e) =>
          .5 * (2 * b + (-a + d) * u + (2 * a - 5 * b + 4 * d - e) * u2 +
            (-a + 3 * b - 3 * d + e) * u3),
        x = cr(p0[0], p1[0], p2[0], p3[0]),
        y = cr(p0[1], p1[1], p2[1], p3[1]),
        tx = p2[0] - p1[0],
        ty = p2[1] - p1[1],
        tl = Math.hypot(tx, ty) || 1,
        taper = Math.min(1, t / 3, (n - 1 - t) / 3),
        amp = RMEAN * ma * (.3 + .7 * Math.min(1, t / 40)) * taper,
        o = amp *
          (.62 * Math.sin(t * .85 + ph1) + .38 * Math.sin(t * 2.2 + ph2));
      let m = 1, px = x - ty / tl * o, py = y + tx / tl * o;
      for (let q = 0; q < 3 && tsamp(px, py, 60).E <= .01; q++) {
        m *= .5;
        px = x - ty / tl * o * m;
        py = y + tx / tl * o * m;
      }
      out.push(tsamp(px, py, 60).E <= .01 ? [x, y] : [px, py]);
    }
  }
  out.push(c[n - 1]);
  return out;
}
/* Головна річка: спуск за спадом висоти з інерцією до моря чи озера; без гирла відкидається */
function traceRiver(x0, y0) {
  const pts = [[x0, y0]];
  let x = x0,
    y = y0,
    dx = 0,
    dy = 0,
    minE = tsamp(x, y, 60).E,
    stall = 0,
    mouth = false;
  for (let i = 0; i < RIVMAX; i++) {
    let best = 1e9, bx = 0, by = 0;
    for (let k = 0; k < 16; k++) {
      const a = k / 16 * PI2,
        ca = Math.cos(a),
        sa = Math.sin(a),
        q = tsamp(x + ca * 300, y + sa * 300, 60).E +
          tsamp(x + ca * 900, y + sa * 900, 60).E +
          tsamp(x + ca * 2200, y + sa * 2200, 60).E;
      if (q < best) {
        best = q;
        bx = ca;
        by = sa;
      }
    }
    dx = dx * .8 + bx * .2;
    dy = dy * .8 + by * .2;
    const l = Math.hypot(dx, dy) || 1;
    dx /= l;
    dy /= l;
    const nx = x + dx * RIVSTEP, ny = y + dy * RIVSTEP, p = tsamp(nx, ny, 60);
    if (p.E <= .004) {
      /* гирло: закінчуємо точно на березі */
      let lo = 0, hi = 1;
      for (let k = 0; k < 6; k++) {
        const m = (lo + hi) / 2;
        tsamp(x + dx * RIVSTEP * m, y + dy * RIVSTEP * m, 60).E <= .004
          ? hi = m
          : lo = m;
      }
      pts.push([x + dx * RIVSTEP * lo, y + dy * RIVSTEP * lo]);
      mouth = true;
      break;
    }
    x = nx;
    y = ny;
    pts.push([x, y]);
    if (p.E < minE - .0005) {
      minE = p.E;
      stall = 0;
    } else if (++stall > 60) break;
    if (Math.hypot(x, y) < 900) break;
  }
  return !mouth || pts.length < 14 ? null : pts;
}
/* Притока: від місця впадіння угору за схилом, поки висота росте */
function traceUp(x0, y0, dx, dy, steps) {
  const pts = [[x0, y0]], st = RIVSTEP * .8;
  let x = x0, y = y0;
  for (let i = 0; i < steps; i++) {
    let best = -1e9, bx = dx, by = dy;
    for (let k = 0; k < 12; k++) {
      const a = k / 12 * PI2,
        ca = Math.cos(a),
        sa = Math.sin(a),
        q = tsamp(x + ca * 250, y + sa * 250, 60).E +
          tsamp(x + ca * 700, y + sa * 700, 60).E;
      if (q > best) {
        best = q;
        bx = ca;
        by = sa;
      }
    }
    dx = dx * .75 + bx * .25;
    dy = dy * .75 + by * .25;
    const l = Math.hypot(dx, dy) || 1;
    dx /= l;
    dy /= l;
    x += dx * st;
    y += dy * st;
    const p = tsamp(x, y, 60);
    if (p.E <= .02 || p.lake) break;
    pts.push([x, y]);
    if (p.E > .9) break;
  }
  return pts;
}
/* Гілка від витоку до гирла (або місця впадіння): згладжування, притоки, стік і ширина */
function riverBranch(ctrl, depth, out) {
  const n = ctrl.length,
    dense = meander(ctrl, [1, .6, .4][depth]),
    att = [],
    sx = Math.round(ctrl[0][0] / 10),
    sy = Math.round(ctrl[0][1] / 10),
    used = [];
  if (depth < 2 && n >= 9) {
    const h = H2(sx, sy, WLD.s + 81),
      nt = depth ? (h < .5 ? 1 : 0) : 2 + Math.floor(h * 3);
    for (let t = 0; t < nt; t++) {
      const j = 3 + Math.floor(H2(sx, sy, WLD.s + 82 + t) * Math.max(1, n - 8));
      if (j > n - 4 || used.some((u) => Math.abs(u - j) < 3)) continue;
      used.push(j);
      const d0 = j * RSUB,
        a = dense[d0 - 1],
        b = dense[d0 + 1],
        tl = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1,
        ang = (H2(sx, sy, WLD.s + 85 + t) < .5 ? -1 : 1) *
          (.95 + .6 * H2(sx, sy, WLD.s + 88 + t)),
        ca = Math.cos(ang),
        sa = Math.sin(ang),
        ux = (b[0] - a[0]) / tl,
        uy = (b[1] - a[1]) / tl,
        up = traceUp(
          dense[d0][0],
          dense[d0][1],
          ux * ca - uy * sa,
          ux * sa + uy * ca,
          depth
            ? 5 + Math.floor(H2(sx, sy, WLD.s + 91 + t) * 4)
            : 7 + Math.floor(H2(sx, sy, WLD.s + 91 + t) * 8),
        );
      if (up.length < 4) continue;
      att[j] = (att[j] || 0) + riverBranch(up.reverse(), depth + 1, out).fin;
    }
  }
  const f = [1];
  for (let i = 1; i < n; i++) f.push(f[i - 1] + 1 + (att[i] || 0));
  const w = [];
  let x1 = 1e9, y1 = 1e9, x2 = -1e9, y2 = -1e9, wm = 0;
  dense.forEach((p, d) => {
    const i = d / RSUB,
      i0 = Math.min(n - 1, Math.floor(i)),
      i1 = Math.min(n - 1, i0 + 1);
    let v = rivW(f[i0] + (f[i1] - f[i0]) * (i - i0));
    if (!depth) {
      const s = Math.max(0, Math.min(1, (i - (n - 8)) / 7));
      v *= 1 + 5 * s * s;
    }
    w.push(v);
    wm = Math.max(wm, v);
    x1 = Math.min(x1, p[0]);
    y1 = Math.min(y1, p[1]);
    x2 = Math.max(x2, p[0]);
    y2 = Math.max(y2, p[1]);
  });
  const pd = wm / 2 + 40,
    r = {
      pts: dense,
      w,
      fin: f[n - 1],
      bb: [x1 - pd, y1 - pd, x2 + pd, y2 + pd],
    };
  out.push(r);
  return r;
}
function riverFrom(i, j) {
  const s = WLD.s;
  if (H2(i, j, s + 95) > .85) return null;
  for (let k = 0; k < 6; k++) {
    const x = (i + H2(i, j, s + 91 + k * 3)) * RIVC,
      y = (j + H2(i, j, s + 92 + k * 3)) * RIVC;
    if (Math.hypot(x, y) < 1500) continue;
    const p = tsamp(x, y, 60);
    if (p.E > .12 && p.E < .75 && !p.lake) {
      const c = traceRiver(x, y);
      if (c) {
        const out = [];
        riverBranch(c, 0, out);
        return out;
      }
    }
  }
  return null;
}
function ensureRivers(x, y) {
  const ci = Math.floor(x / RIVC),
    cj = Math.floor(y / RIVC),
    key = ci + "," + cj;
  if (WLD.re.has(key)) return;
  WLD.re.add(key);
  for (let i = ci - RIVN; i <= ci + RIVN; i++) {
    for (let j = cj - RIVN; j <= cj + RIVN; j++) {
      const k = i + "," + j;
      if (WLD.rk.has(k)) continue;
      WLD.rk.add(k);
      const r = riverFrom(i, j);
      if (r) WLD.rl.push(...r);
    }
  }
}
/* Відстань до берега найближчої річки (річка міста або світу); всередині річки — від'ємна */
function riverBank(x, y) {
  let m = RV ? rfarD(x, y) - RV.w / 2 : 1e9;
  ensureRivers(x, y);
  for (const r of WLD.rl) {
    const b = r.bb;
    if (x < b[0] || x > b[2] || y < b[1] || y > b[3]) continue;
    const P = r.pts, W = r.w;
    for (let i = 0; i < P.length - 1; i++) {
      const a = P[i],
        c = P[i + 1],
        dx = c[0] - a[0],
        dy = c[1] - a[1],
        t = Math.max(
          0,
          Math.min(
            1,
            ((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy || 1),
          ),
        );
      m = Math.min(
        m,
        Math.hypot(x - a[0] - dx * t, y - a[1] - dy * t) -
          (W[i] + (W[i + 1] - W[i]) * t) / 2,
      );
    }
  }
  return m;
}
/* Розтеризація річок світу в сітку тайла: R[i] — відстань до берега в пікселях (від'ємна всередині), мін. півширина .55 px */
function riverRaster(X0, Y0, TW, Q, QB, R) {
  const pm = TW / Q, X1 = X0 + TW, Y1 = Y0 + TW;
  for (let x = X0; x < X1 + RIVC; x += RIVC) {
    for (let y = Y0; y < Y1 + RIVC; y += RIVC) ensureRivers(x, y);
  }
  const cl = (v) => Math.max(-1, Math.min(Q, v));
  for (const r of WLD.rl) {
    const b = r.bb;
    if (b[2] < X0 || b[0] > X1 || b[3] < Y0 || b[1] > Y1) continue;
    const P = r.pts, W = r.w;
    for (let s = 0; s < P.length - 1; s++) {
      const a = P[s],
        c = P[s + 1],
        dx = c[0] - a[0],
        dy = c[1] - a[1],
        l2 = dx * dx + dy * dy || 1,
        pad = Math.max(W[s], W[s + 1], pm * 1.1) / 2 + pm * 2,
        i0 = cl(Math.floor((Math.min(a[0], c[0]) - pad - X0) / pm - .5)),
        i1 = cl(Math.ceil((Math.max(a[0], c[0]) + pad - X0) / pm - .5)),
        j0 = cl(Math.floor((Math.min(a[1], c[1]) - pad - Y0) / pm - .5)),
        j1 = cl(Math.ceil((Math.max(a[1], c[1]) + pad - Y0) / pm - .5));
      for (let py = j0; py <= j1; py++) {
        const wy = Y0 + (py + .5) * pm;
        for (let px = i0; px <= i1; px++) {
          const wx = X0 + (px + .5) * pm,
            t = Math.max(
              0,
              Math.min(1, ((wx - a[0]) * dx + (wy - a[1]) * dy) / l2),
            ),
            d = Math.hypot(wx - a[0] - dx * t, wy - a[1] - dy * t),
            v = (d - Math.max((W[s] + (W[s + 1] - W[s]) * t) / 2, pm * .55)) /
              pm,
            i = (py + 1) * QB + px + 1;
          if (v < R[i]) R[i] = v;
        }
      }
    }
  }
}
