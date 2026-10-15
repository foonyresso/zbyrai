function dot(x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 7);
  ctx.fill();
}
function path(p) {
  ctx.beginPath();
  p.forEach((c, i) =>
    i
      ? ctx.lineTo(ox + c[0] * S, oy + c[1] * S)
      : ctx.moveTo(ox + c[0] * S, oy + c[1] * S)
  );
  ctx.closePath();
}
function castleGeo(C, ba, rc, sd) {
  const r = mk(sd + "cg"),
    E = [Math.cos(ba), Math.sin(ba)],
    U = [-E[1], E[0]],
    W = (
      u,
      v,
    ) => [C.x + (u * U[0] + v * E[0]) * rc, C.y + (u * U[1] + v * E[1]) * rc],
    vr = r(),
    V = vr < .4 ? "conc" : vr < .7 ? "bail" : "court",
    ax = 1 + r() * .3,
    f1 = r() * 6,
    f2 = r() * 6,
    n = V == "court" ? 8 + Math.floor(r() * 3) : 10 + Math.floor(r() * 4),
    lo = [];
  for (let i = 0; i < n; i++) {
    const th = i / n * PI2 + (r() - .5) * .25,
      ro = 1 + .15 * Math.sin(2 * th + f1) + .09 * Math.sin(3 * th + f2) +
        (r() - .5) * .1;
    lo.push([Math.cos(th) * ro * ax, Math.min(.92, Math.sin(th) * ro * .88)]);
  }
  const o2 = lo.filter((p, i) =>
      !(p[1] >= .92 && lo[(i + n - 1) % n][1] >= .92 &&
        lo[(i + 1) % n][1] >= .92)
    ),
    op = o2.map((p) => {
      const q = W(p[0], p[1]),
        d = Math.hypot(q[0], q[1]),
        lm = Rat(Math.atan2(q[1], q[0])) - 2 - WM;
      return d > lm ? [q[0] * lm / d, q[1] * lm / d] : q;
    }),
    m = op.length,
    cc = [
      op.reduce((a, q) => a + q[0], 0) / m,
      op.reduce((a, q) => a + q[1], 0) / m,
    ];
  let gi = 0, gd = 1e9;
  for (let i = 0; i < m; i++) {
    const a = op[i],
      c = op[(i + 1) % m],
      d = Math.hypot((a[0] + c[0]) / 2, (a[1] + c[1]) / 2);
    if (d < gd) {
      gd = d;
      gi = i;
    }
  }
  const ga = op[gi],
    gb = op[(gi + 1) % m],
    gm = [(ga[0] + gb[0]) / 2, (ga[1] + gb[1]) / 2],
    dl = Math.hypot(gm[0] - cc[0], gm[1] - cc[1]) || 1,
    dv = [(gm[0] - cc[0]) / dl, (gm[1] - cc[1]) / dl],
    tw = op.map((p) => [p[0], p[1], rc * (.055 + r() * .035)]);
  tw[gi][2] = tw[(gi + 1) % m][2] = rc * .085;
  const bar = [ga, [
    ga[0] + dv[0] * rc * .22 + (gm[0] - ga[0]) * .3,
    ga[1] + dv[1] * rc * .22 + (gm[1] - ga[1]) * .3,
  ], [
    gb[0] + dv[0] * rc * .22 + (gm[0] - gb[0]) * .3,
    gb[1] + dv[1] * rc * .22 + (gm[1] - gb[1]) * .3,
  ], gb];
  const rect = (
      u,
      v,
      w,
      h,
    ) => [
      W(u - w / 2, v - h / 2),
      W(u + w / 2, v - h / 2),
      W(u + w / 2, v + h / 2),
      W(u - w / 2, v + h / 2),
    ],
    bl = [],
    pal = ["#9a8a72", "#b8985a", "#5a6a8a", "#7a6a7a", "#a08a68"];
  let inner = null, itw = [], keep, mound = null;
  if (V == "conc") {
    const ni = 7 + Math.floor(r() * 3), pts = [];
    for (let i = 0; i < ni; i++) {
      const th = i / ni * PI2 + (r() - .5) * .2,
        ro = .52 + .05 * Math.sin(2 * th + f2) + (r() - .5) * .06;
      pts.push(W(Math.cos(th) * ro * ax * .9, .08 + Math.sin(th) * ro * .8));
    }
    inner = pts;
    itw = pts.map((q) => [q[0], q[1], rc * .055]);
    keep = {
      ...(() => {
        const q = W(0, .1);
        return { x: q[0], y: q[1] };
      })(),
      r: rc * .16,
      sq: r() < .4,
      ang: ba,
    };
    bl.push({ p: rect(-.22, -.06, .3, .13), c: "#a08a68" }, {
      p: rect(.24, -.1, .11, .16),
      c: "#d8d0f0",
    });
  } else if (V == "bail") {
    const sg = r() < .5 ? -1 : 1, q = W(sg * .42, .3);
    mound = [q[0], q[1], rc * .34];
    keep = { x: q[0], y: q[1], r: rc * .15, sq: false, ang: ba };
    bl.push({ p: rect(-sg * .2, -.2, .34, .15), c: "#a08a68" }, {
      p: rect(-sg * .5, .15, .12, .16),
      c: "#d8d0f0",
    });
  } else {
    let kv = 0, kd = -1;
    for (let i = 0; i < m; i++) {
      const d = Math.hypot(op[i][0] - gm[0], op[i][1] - gm[1]);
      if (d > kd && lo[0]) {
        kd = d;
        kv = i;
      }
    }
    const q = [
      op[kv][0] + (cc[0] - op[kv][0]) * .14,
      op[kv][1] + (cc[1] - op[kv][1]) * .14,
    ];
    keep = { x: q[0], y: q[1], r: rc * .14, sq: r() < .5, ang: ba };
    tw[kv][2] = rc * .11;
    bl.push({ p: rect(-.15, -.15, .34, .16), c: "#a08a68" }, {
      p: rect(.35, -.2, .13, .18),
      c: "#d8d0f0",
    });
  }
  for (let i = 0; i < m; i++) {
    if (i == gi) continue;
    const a = op[i],
      c = op[(i + 1) % m],
      ex = c[0] - a[0],
      ey = c[1] - a[1],
      L = Math.hypot(ex, ey);
    if (
      L < rc * .3 || (o2[i][1] >= .9 && o2[(i + 1) % m][1] >= .9) || r() < .2
    ) continue;
    const e = [ex / L, ey / L], md = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2];
    let nn = [-e[1], e[0]];
    if ((cc[0] - md[0]) * nn[0] + (cc[1] - md[1]) * nn[1] < 0) {
      nn = [-nn[0], -nn[1]];
    }
    const h = L * .32, d1 = rc * .1, d2 = rc * .2;
    bl.push({
      p: [
        [md[0] - e[0] * h + nn[0] * d1, md[1] - e[1] * h + nn[1] * d1],
        [md[0] + e[0] * h + nn[0] * d1, md[1] + e[1] * h + nn[1] * d1],
        [md[0] + e[0] * h + nn[0] * d2, md[1] + e[1] * h + nn[1] * d2],
        [md[0] - e[0] * h + nn[0] * d2, md[1] - e[1] * h + nn[1] * d2],
      ],
      c: pal[i % pal.length],
    });
  }
  return { poly: op, cc, inner, itw, tw, keep, bl, gm, dv, gi, bar, V, mound };
}
function drawCastle(b) {
  const g = b.g,
    rc = b.rc,
    P = b.poly,
    X = (q) => ox + q[0] * S,
    Yq = (q) => oy + q[1] * S,
    pp = (pts, col, st, lw) => {
      ctx.beginPath();
      pts.forEach((q, i) =>
        i ? ctx.lineTo(X(q), Yq(q)) : ctx.moveTo(X(q), Yq(q))
      );
      ctx.closePath();
      if (col) {
        ctx.fillStyle = col;
        ctx.fill();
      }
      if (st) {
        ctx.strokeStyle = st;
        ctx.lineWidth = lw;
        ctx.lineJoin = "round";
        ctx.stroke();
      }
    },
    sc = (pts, k) =>
      pts.map(
        (q) => [g.cc[0] + (q[0] - g.cc[0]) * k, g.cc[1] + (q[1] - g.cc[1]) * k],
      ),
    tw = (x, y, r) => {
      const px = ox + x * S, py = oy + y * S, rr = Math.max(2, r * S);
      ctx.fillStyle = "#2e2e36";
      dot(px, py, rr + 1.2);
      ctx.fillStyle = g.V == "bail" ? "#7a5a38" : "#8f8fa0";
      dot(px, py, rr);
      ctx.fillStyle = g.V == "bail" ? "#9a7a52" : "#b4b4c4";
      dot(px, py, rr * .45);
    };
  const ol = Math.hypot(g.gm[0], g.gm[1]) || 1,
    ex = [-g.gm[0] / ol, -g.gm[1] / ol],
    rd = Math.min(ol * .5, 48);
  ctx.strokeStyle = "#c4b080";
  ctx.lineWidth = Math.max(1, 5 * S);
  ctx.lineCap = "butt";
  ctx.beginPath();
  ctx.moveTo(X(g.gm), Yq(g.gm));
  ctx.lineTo(ox + (g.gm[0] + ex[0] * rd) * S, oy + (g.gm[1] + ex[1] * rd) * S);
  ctx.stroke();
  if (b.moat) pp(sc(P, 1.17), "#a8cde3", "#6f9fbd", Math.max(1, S * 1.3));
  pp(P, "#cfc3a3");
  if (g.mound) {
    const q = g.mound;
    ctx.fillStyle = "#a69c78";
    dot(ox + q[0] * S, oy + q[1] * S, q[2] * S);
    ctx.fillStyle = "#bbb08a";
    dot(ox + q[0] * S, oy + q[1] * S, q[2] * .72 * S);
    ctx.fillStyle = "#cdc39c";
    dot(ox + q[0] * S, oy + q[1] * S, q[2] * .5 * S);
  }
  if (g.inner) pp(g.inner, "#ddd3b8");
  for (const q of g.bl) pp(q.p, q.c, S >= .8 ? "#0007" : null, 1);
  const lw = Math.max(2, rc * .065 * S),
    wc = g.V == "bail" ? "#6b4a2b" : "#6e6e80";
  if (g.inner) pp(g.inner, null, "#6e6e80", lw * .8);
  pp(P, null, wc, lw);
  if (g.V != "bail") pp(P, null, "#aeaebb", lw * .4);
  if (g.inner) { for (const q of g.itw) tw(q[0], q[1], q[2]); }
  for (const q of g.tw) tw(q[0], q[1], q[2]);
  pp(g.bar, "#7c7c8c", "#2e2e36", 1);
  if (b.moat) {
    ctx.strokeStyle = "#8a6a45";
    ctx.lineWidth = Math.max(2, rc * .1 * S);
    ctx.beginPath();
    const a = [g.gm[0] + g.dv[0] * rc * .22, g.gm[1] + g.dv[1] * rc * .22],
      c = [g.gm[0] + g.dv[0] * rc * .46, g.gm[1] + g.dv[1] * rc * .46];
    ctx.moveTo(X(a), Yq(a));
    ctx.lineTo(X(c), Yq(c));
    ctx.stroke();
  }
  const k = g.keep,
    kx = ox + k.x * S,
    ky = oy + k.y * S,
    kr = Math.max(3, k.r * S);
  if (k.sq) {
    const c = Math.cos(k.ang),
      s = Math.sin(k.ang),
      sq = (f, col) => {
        ctx.beginPath();
        [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([a, d], i) => {
          const u = a * kr * f,
            v = d * kr * f,
            x = kx + u * c - v * s,
            y = ky + u * s + v * c;
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        });
        ctx.closePath();
        ctx.fillStyle = col;
        ctx.fill();
      };
    sq(1.15, "#2e2e36");
    sq(1, "#6e6e80");
    sq(.62, "#8c8ca0");
  } else {
    ctx.fillStyle = "#2e2e36";
    dot(kx, ky, kr + 1.5);
    ctx.fillStyle = "#6e6e80";
    dot(kx, ky, kr);
    ctx.fillStyle = "#8c8ca0";
    dot(kx, ky, kr * .6);
  }
  ctx.fillStyle = "#c04a4a";
  dot(kx, ky, Math.max(1.5, rc * .035 * S));
}
/* будівля й прикраса народу (people-style.js) */
function drawB(b) {
  drawB0(b);
  pplDecor(b);
}
function drawB0(b) {
  const x = ox + b.cx * S, y = oy + b.cy * S, rs = b.r * S;
  if (x + rs < 0 || y + rs < 0 || x - rs > W || y - rs > H) return;
  const D = T[b.t], cc = pplCol(tint(LM.has(b.t) ? D.lc : D.mc), b, !!b.rc);
  if (b.t == "forest") {
    ctx.fillStyle = BIO.tr;
    dot(x, y, rs);
    return;
  }
  if (b.t == "well" || b.t == "fountain") {
    ctx.fillStyle = D.col;
    dot(x, y, rs);
    return;
  }
  if (b.t == "castle") {
    drawCastle(b);
    return;
  }
  if (b.t == "park") {
    path(b.poly);
    ctx.fillStyle = "#8fbf78";
    ctx.fill();
    if (S >= 1) {
      ctx.fillStyle = "#4f8a4a";
      for (const q of b.tr) {
        dot(ox + q[0] * S, oy + q[1] * S, Math.max(1, 1.4 * S));
      }
    }
    return;
  }
  if (b.t == "plaza") {
    path(b.poly);
    ctx.fillStyle = "#d6cdb2";
    ctx.fill();
    return;
  }
  if (b.rc) {
    path(b.poly);
    const res = HS.has(b.t) || b.t == "estate";
    ctx.fillStyle = res
      ? [
        "#a9c088",
        "#b3c48f",
        "#9fba82",
      ][Math.floor(Math.abs(b.cx * 12.9 + b.cy * 7.3)) % 3]
      : "#bfb394";
    ctx.fill();
    if (res && S >= 1) {
      ctx.strokeStyle = "#7a5a38";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    const rs2 = b.rcs || [b.rc];
    if (S >= 1) {
      ctx.strokeStyle = "#0005";
      ctx.lineWidth = 2;
      for (const q of rs2) {
        path(q);
        ctx.stroke();
      }
    }
    ctx.fillStyle = cc;
    for (const q of rs2) {
      path(q);
      ctx.fill();
    }
    if (b.t == "cathedral") {
      ctx.fillStyle = "#d9d4c4";
      const m = cen(b.rc);
      dot(
        ox + m[0] * S,
        oy + m[1] * S,
        Math.max(1, Math.min(b.r * .18, 5) * S),
      );
    }
    if (b.t == "mtower") {
      ctx.fillStyle = "#7a6ad8";
      const m = cen(b.rc);
      dot(ox + m[0] * S, oy + m[1] * S, Math.min(b.r * .6, 6) * S);
    }
    return;
  }
  path(b.poly);
  if (b.t == "field") {
    ctx.fillStyle = BIO.fl;
    ctx.fill();
    ctx.strokeStyle = BIO.fs;
    ctx.lineWidth = 1;
    ctx.stroke();
    return;
  }
  if (HS.has(b.t)) {
    ctx.fillStyle = "#a9c088";
    ctx.fill();
    if (S >= 1.2) {
      ctx.strokeStyle = "#7a5a38";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    if (PPLC && RLAY.pp && PPLC.look.round) {
      ctx.beginPath();
      ctx.arc(x, y, Math.max(1, rs * .62), 0, PI2);
    } else {
      path(
        b.poly.map((c) => [b.cx + (c[0] - b.cx) * .6, b.cy + (c[1] - b.cy) * .6]),
      );
    }
    ctx.fillStyle = cc;
    ctx.fill();
    return;
  }
  ctx.fillStyle = cc;
  ctx.fill();
  if (S >= 1.2 && b.t != "garden") {
    ctx.strokeStyle = "#0006";
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}
