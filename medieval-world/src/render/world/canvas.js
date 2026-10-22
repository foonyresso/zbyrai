/* ---- деталі тайла: річка міста, поля, дерева ---- */
function wdet(c, X0, Y0, TW, P) {
  const k = P / TW,
    X1 = X0 + TW,
    Y1 = Y0 + TW,
    s = WLD.s,
    full = TW <= 1024,
    tx = (x) => (x - X0) * k,
    ty = (y) => (y - Y0) * k,
    rw = RV ? RV.w : 0,
    rf = riverBank,
    dc = (x, y, r) => {
      c.beginPath();
      c.arc(tx(x), ty(y), Math.max(.6, r * k), 0, PI2);
      c.fill();
    },
    rc = (x, y, w, h, a, fill, ec) => {
      const ca = Math.cos(a), sa = Math.sin(a);
      c.beginPath();
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([u, v], i) => {
        const px = x + (u * w * ca - v * h * sa) / 2,
          py = y + (u * w * sa + v * h * ca) / 2;
        i ? c.lineTo(tx(px), ty(py)) : c.moveTo(tx(px), ty(py));
      });
      c.closePath();
      c.fillStyle = fill;
      c.fill();
      if (ec && k >= .9) {
        c.strokeStyle = ec;
        c.lineWidth = 1;
        c.stroke();
      }
    };
  if (RV && TW <= 65536) {
    const f = RV.f,
      rg = rvRange(),
      cs = [[X0, Y0], [X1, Y0], [X1, Y1], [X0, Y1]].map(([x, y]) =>
        (x - f.sx) * f.ux + (y - f.sy) * f.uy
      ),
      q0 = Math.max(rg.a, Math.min(...cs) - 20),
      q1 = Math.min(rg.b, Math.max(...cs) + 20),
      st = Math.max(10, TW / 150),
      pts = [];
    for (let q = q0; q <= q1; q += st) {
      const o = f.o(q);
      pts.push([f.ux * q - f.uy * o + f.sx, f.uy * q + f.ux * o + f.sy]);
    }
    c.lineJoin = "round";
    c.lineCap = "round";
    for (
      const [w, col] of pts.length > 1
        ? [[rw + 3, WSTYLE.riverEdge], [rw, WSTYLE.river]]
        : []
    ) {
      c.strokeStyle = col;
      c.lineWidth = w * k;
      c.beginPath();
      pts.forEach((p, i) =>
        i ? c.lineTo(tx(p[0]), ty(p[1])) : c.moveTo(tx(p[0]), ty(p[1]))
      );
      c.stroke();
    }
  }
  if (!full) return;
  const vs = vlist(X0 - 300, Y0 - 300, X1 + 300, Y1 + 300),
    inT = (x, y, m) => x > X0 - m && x < X1 + m && y > Y0 - m && y < Y1 + m,
    inV = (x, y, m) => vs.some((v) => Math.hypot(v.x - x, v.y - y) < v.rad * m),
    FC = 40,
    pr = (x, y) => {
      let m = 0;
      for (const v of vs) {
        const d = Math.hypot(v.x - x, v.y - y);
        if (d < 350) m = Math.max(m, Math.exp(-d / 170));
      }
      return m;
    };
  for (let i = Math.floor(X0 / FC) - 1; i <= Math.ceil(X1 / FC); i++) {
    for (let j = Math.floor(Y0 / FC) - 1; j <= Math.ceil(Y1 / FC); j++) {
      const cx = (i + .5 + (H2(i, j, s + 32) - .5) * .4) * FC,
        cy = (j + .5 + (H2(i, j, s + 34) - .5) * .4) * FC;
      if (inC(cx, cy) || inV(cx, cy, 1.05)) {
        continue;
      }
      const p = tsamp(cx, cy, 4);
      if (
        p.E <= .012 || p.E > .4 || p.rv > .3 || rf(cx, cy) < 12
      ) continue;
      if (
        [[-24, -18], [24, -18], [24, 18], [-24, 18]].some(([a, b]) =>
          tsamp(cx + a, cy + b, 4).E <= .012
        )
      ) continue;
      const r = H2(i, j, s + 31), pb = Math.max(p.fa, pr(cx, cy) * .85);
      if (r > pb * .6) continue;
      const pl = FP[p.bk] || FP.grass,
        col = pl[Math.floor(H2(i, j, s + 35) * pl.length)],
        an = Math.floor(H2(i >> 2, j >> 2, s + 33) * 4) * Math.PI / 8 +
          (H2(i, j, s + 36) - .5) * .1;
      rc(
        cx,
        cy,
        FC * (.82 + H2(i, j, s + 37) * .3),
        FC * (.55 + H2(i, j, s + 38) * .3),
        an,
        col,
        "#9a8a5a66",
      );
      if (H2(i, j, s + 39) < .1) {
        c.fillStyle = "#6f8a4a";
        for (let a = -1; a <= 1; a++) {
          for (let b2 = -1; b2 <= 1; b2++) dc(cx + a * 8, cy + b2 * 6, 1.6);
        }
      } else if (H2(i, j, s + 40) < .05 * (1 + pr(cx, cy) * 3)) {
        rc(
          cx + 10,
          cy - 8,
          8,
          5.5,
          an,
          ROOF[Math.floor(H2(i, j, s + 48) * ROOF.length)],
          "#6a5a4a",
        );
        rc(cx + 3, cy - 8, 5, 4, an, "#d2c7ad", "#6a5a4a");
      }
    }
  }
  const TC = 34;
  for (let i = Math.floor(X0 / TC) - 1; i <= Math.ceil(X1 / TC); i++) {
    for (let j = Math.floor(Y0 / TC) - 1; j <= Math.ceil(Y1 / TC); j++) {
      const cx = (i + .5) * TC, cy = (j + .5) * TC;
      if (inC(cx, cy) || inV(cx, cy, 1)) {
        continue;
      }
      const p = tsamp(cx, cy, 4);
      if (
        p.E <= .012 || p.rd < 0 || p.fo < .3 || rf(cx, cy) < 8
      ) continue;
      const n = Math.round(p.fo * 9 * (.5 + H2(i, j, s + 51))) +
        (H2(i, j, s + 52) < p.fa * .12 ? 1 : 0);
      if (!n) continue;
      const fc = BIOS[p.bk].tr;
      for (let q = 0; q < n; q++) {
        const x = cx + (H2(i, j, s + 53 + q) - .5) * TC,
          y = cy + (H2(i, j, s + 80 + q) - .5) * TC;
        if (inC(x, y) || !inT(x, y, 6) || inV(x, y, 1)) continue;
        if (tsamp(x, y, 4).E <= .012 || rf(x, y) < 5) continue;
        const r = 2 + H2(i, j, s + 110 + q) * 1.6;
        c.fillStyle = fc;
        dc(x, y, r);
      }
    }
  }
}
function drawWorld() {
  if (!WLD) wsetup();
  const b = Math.min(17, Math.max(5, Math.ceil(Math.log2(384 / S)))),
    TW = 2 ** b,
    x0 = Math.floor(-ox / S / TW),
    x1 = Math.floor((W - ox) / S / TW),
    y0 = Math.floor(-oy / S / TW),
    y1 = Math.floor((H - oy) / S / TW);
  ctx.fillStyle = BIO.g;
  ctx.fillRect(0, 0, W, H);
  ctx.imageSmoothingEnabled = true;
  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      const key = b + ":" + tx + ":" + ty;
      let t = WLD.t.get(key);
      const dx = Math.floor(ox + tx * TW * S),
        dy = Math.floor(oy + ty * TW * S),
        dw = Math.ceil(TW * S) + 1;
      if (!t) {
        if (tick()) t = mkTile(b, tx, ty);
        else {
          WPEND = true;
          let ok = false;
          for (let up = 1; up <= 3 && !ok; up++) {
            const n = 2 ** up,
              ptx = Math.floor(tx / n),
              pty = Math.floor(ty / n),
              pt = WLD.t.get((b + up) + ":" + ptx + ":" + pty);
            if (pt) {
              const sz = TP / n;
              ctx.drawImage(
                pt,
                (tx - ptx * n) * sz,
                (ty - pty * n) * sz,
                sz,
                sz,
                dx,
                dy,
                dw,
                dw,
              );
              ok = true;
            }
          }
          if (!ok && b > 5) {
            for (let j = 0; j < 2; j++) {
              for (let i = 0; i < 2; i++) {
                const ct = WLD.t.get(
                  (b - 1) + ":" + (tx * 2 + i) + ":" + (ty * 2 + j),
                );
                if (ct) {
                  ctx.drawImage(
                    ct,
                    dx + i * dw / 2,
                    dy + j * dw / 2,
                    dw / 2 + 1,
                    dw / 2 + 1,
                  );
                }
              }
            }
          }
          continue;
        }
      } else WLD.t.delete(key);
      WLD.t.set(key, t);
      ctx.drawImage(t, dx, dy, dw, dw);
    }
  }
  while (WLD.t.size > 80) WLD.t.delete(WLD.t.keys().next().value);
}
/* ---- дороги й села поверх тайлів (векторно, без швів) ---- */
function strokeRoad(g, w, col, bw, bcol, dash, cw, ccol) {
  const P = g.pts, wt = g.wet;
  ctx.lineJoin = "round";
  ctx.lineCap = "butt";
  for (const pass of [-1, 0, 1]) {
    if (pass == -1 && !cw) continue;
    if (pass == 1 && !wt.some(Boolean)) break;
    ctx.strokeStyle = pass < 0 ? ccol : pass ? bcol : col;
    ctx.lineWidth = pass < 0 ? cw : pass ? bw : w;
    ctx.setLineDash(dash && pass == 0 ? dash : []);
    ctx.beginPath();
    let on = false;
    for (let i = 1; i < P.length; i++) {
      const hit = pass > 0 ? (wt[i - 1] || wt[i]) : !(wt[i - 1] || wt[i]);
      if (!hit) {
        on = false;
        continue;
      }
      if (!on) {
        ctx.moveTo(ox + P[i - 1][0] * S, oy + P[i - 1][1] * S);
        on = true;
      }
      ctx.lineTo(ox + P[i][0] * S, oy + P[i][1] * S);
    }
    ctx.stroke();
  }
  ctx.setLineDash([]);
  if (g.al && S >= .7) {
    ctx.fillStyle = "#3f6e3f";
    for (let i = 3; i < P.length - 3; i += 3) {
      if (wt[i]) continue;
      const a = P[i - 1],
        b = P[i + 1],
        l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1,
        nx = -(b[1] - a[1]) / l * 5.5,
        ny = (b[0] - a[0]) / l * 5.5;
      if (
        Math.hypot(P[i][0], P[i][1]) < Rat(Math.atan2(P[i][1], P[i][0])) + 30
      ) continue;
      dot(
        ox + (P[i][0] + nx) * S,
        oy + (P[i][1] + ny) * S,
        Math.max(1, 2.1 * S),
      );
      dot(
        ox + (P[i][0] - nx) * S,
        oy + (P[i][1] - ny) * S,
        Math.max(1, 2.1 * S),
      );
    }
  }
}
/* чотири типи доріг за рангом нижчого кінця: велика (між містами й столицями), середня (до містечок), мала (до сіл і великих сіл), стежка (до хуторів) */
const ROAD_STYLE = {
  major: [3, "#e2c27f", 7.4, "#8a6a45", 5, "#2e2113"],
  medium: [2, "#d1a967", 5.8, "#8a6a45", 3.6, "#2e2113"],
  minor: [1.5, "#6b4a2a", 4.6, "#8a6a45"],
  trail: [1.15, "#6b4a2a", 3, "#8a6a45"],
};
function roadClass(v, u) {
  const m = Math.min(v.tier, u.tier);
  return m >= 4 ? "major" : m == 3 ? "medium" : m >= 1 ? "minor" : "trail";
}
function drawRoads() {
  if (!WRD || S < .04) return;
  const x0 = -ox / S,
    y0 = -oy / S,
    x1 = (W - ox) / S,
    y1 = (H - oy) / S,
    m = VC * 3.5,
    can = S >= .12,
    vs = vlist(x0 - m, y0 - m, x1 + m, y1 + m),
    vis = (g) =>
      g && g.bb[2] > x0 && g.bb[0] < x1 && g.bb[3] > y0 && g.bb[1] < y1;
  for (const v of vs) {
    for (const u of redges(v)) {
      if (v.id >= u.id) continue;
      const cls = roadClass(v, u);
      if (!WRT[cls]) continue;
      let g = WLD.lg.get("v" + v.id + ">" + u.id);
      if (g === undefined && can) g = vroad(v, u);
      if (vis(g)) {
        const [w, col, bw, bcol, cw, ccol] = ROAD_STYLE[cls], k = Math.max(.7, Math.min(2.2, Math.sqrt(S * 8)));
        strokeRoad(g, Math.max(1, w * k), col, Math.max(2, bw * k), bcol, cls == "trail" ? [Math.max(3, 2.6 * k), Math.max(2, 3.2 * k)] : null, cw && Math.max(2, cw * k), ccol);
      }
    }
  }
  for (const g of WRT.major ? wgates() : []) {
    if (vis(g)) {
      strokeRoad(
        g,
        Math.max(1.2, 3 * S),
        ROAD_STYLE.major[1],
        Math.max(2, 7 * S),
        "#8a6a45",
        null,
        Math.max(2, 5 * S),
        ROAD_STYLE.major[5],
      );
    }
  }
}
/* ==== ПРОВІНЦІЇ → РЕГІОНИ → ГОЛОВНІ МІСТА ====
   Кожне місто (містечко і більше) — головне місто свого регіону. Територія регіону росте з розміром міста;
   Місто рівня «Велике місто» і вище — столиця провінції, і її регіон завжди найбільший.
   Решта міст належить до найближчої столиці: чим більша столиця, тим більше регіонів у провінції. */
