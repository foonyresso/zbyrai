const pb = (o) => {
  if (
    o &&
    !(CP && (pip(CP, o.cx, o.cy) || o.poly.some((q) => pip(CP, q[0], q[1]))))
  ) B.push(o);
};
const seaD = (x, y) => {
  const q = -x * SE.uy + y * SE.ux;
  return (x * SE.ux + y * SE.uy) - shoreAt(q);
};
function rivD(x, y) {
  let m = 1e9;
  const P = RV.pts;
  for (let i = 0; i < P.length - 1; i++) {
    const a = P[i],
      b = P[i + 1],
      dx = b[0] - a[0],
      dy = b[1] - a[1],
      tt = Math.max(
        0,
        Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy)),
      );
    m = Math.min(m, Math.hypot(x - a[0] - dx * tt, y - a[1] - dy * tt));
  }
  return m;
}
function water() {
  const r = mk(seed + "wt"),
    op = (v) => v == "1" ? 1 : v == "0" ? 0 : null,
    sh = pickShore(r, tier, $("#shore").value, op($("#riv").value), op($("#sea").value)),
    hr = sh.river,
    mx = Rm * 1.6 + 80;
  RV = null;
  SE = null;
  RC = null;
  SHORE = sh.sea ? (hr ? "delta" : sh.sea) : hr ? "river" : "none";
  if (sh.sea) {
    const a = r() * PI2;
    SE = {
      ux: Math.cos(a),
      uy: Math.sin(a),
      kind: sh.sea,
      D: Rm * (sh.sea == "ocean" ? .85 : .75),
      a,
      sb: hs(seed + "sb"),
      /* море — затока: вода підходить ближче по боках; океан — майже пряма хвиляста лінія */
      bayR: Rm * 3,
      bayMax: sh.sea == "sea" ? Rm * .55 : 0,
    };
    if (sh.sea == "ocean") SE.bayR = 1e9;
  }
  if (hr) {
    /* з морем річка тече до моря (під невеликим кутом до берега); без моря — у довільному напрямку */
    const a = SE ? SE.a + (r() - .5) * 1.1 : r() * PI2,
      ux = Math.cos(a),
      uy = Math.sin(a),
      bank = !SE && r() < .35,
      off = bank ? (r() < .5 ? -1 : 1) * Rm * .6 : (r() - .5) * Rm * .5,
      A = Rm * .12,
      ph = r() * 6,
      pts = [];
    const sdr = hs(seed + "rv"),
      oFn = (q) =>
        off + A * Math.sin(q * .02 + ph) +
        Rm * 2.5 * (vn(q * .0011 + ph, 3.3, sdr) - .5);
    for (let q = -mx; q <= mx; q += 8) {
      const o = oFn(q);
      pts.push([ux * q - uy * o, uy * q + ux * o]);
    }
    RV = {
      pts,
      w: tier < 2 ? 5 : 6 + tier * 4,
      f: { ux, uy, o: oFn, sx: 0, sy: 0 },
    };
    {
      const nd = RV.w / 2 + [4, 5, 9, 12, 14, 16, 18][tier] + 14,
        d0 = rivD(0, 0);
      if (d0 < nd) {
        let k = 0, m = 1e9;
        pts.forEach((p, i) => {
          const e = Math.hypot(p[0], p[1]);
          if (e < m) {
            m = e;
            k = i;
          }
        });
        let vx = pts[k][0], vy = pts[k][1], l = Math.hypot(vx, vy);
        if (l < 1) {
          const a = pts[Math.min(pts.length - 1, k + 1)],
            b = pts[Math.max(0, k - 1)];
          vx = -(a[1] - b[1]);
          vy = a[0] - b[0];
          l = Math.hypot(vx, vy) || 1;
        }
        const sh = (nd - d0) / l;
        pts.forEach((p) => {
          p[0] += vx * sh;
          p[1] += vy * sh;
        });
        RV.f.sx = vx * sh;
        RV.f.sy = vy * sh;
      }
    }
  }
  if (SE) {
    if (RV) {
      /* річка закінчується гирлом на березі, а не тече морем */
      const P = RV.pts;
      let k = 0, m = 1e9;
      P.forEach((p, i) => {
        const e = Math.hypot(p[0], p[1]);
        if (e < m) {
          m = e;
          k = i;
        }
      });
      let a = k, b = k;
      while (a > 0 && seaD(P[a][0], P[a][1]) <= 0) a--;
      while (b < P.length - 1 && seaD(P[b][0], P[b][1]) <= 0) b++;
      if (seaD(P[a][0], P[a][1]) > 0) a++;
      if (seaD(P[b][0], P[b][1]) > 0) b--;
      RV.pts = P.slice(a, b + 1);
    }
  }
}
function clampSea() {
  if (!SE) return;
  RC = R.map((_, k) => {
    const a = -Math.PI + k / N * PI2;
    let q = 8;
    while (q < PR * 1.5 && seaD(Math.cos(a) * q, Math.sin(a) * q) < 0) q += 1;
    return q;
  });
  /* місто розтягується вздовж берега (а не зрізається колом), далі береже відступ від води */
  R = R.map((v, k) => {
    const a = -Math.PI + k / N * PI2;
    return Math.max(10, Math.min(v * shoreStretch(a), RC[k] - 3));
  });
}
