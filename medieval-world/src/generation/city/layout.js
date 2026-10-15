function roadPts(g, mx) {
  const d = [Math.cos(g), Math.sin(g)],
    n = [-d[1], d[0]],
    A = LAY == "grid"
      ? 0
      : LAY == "wind"
      ? Math.min(55, Rm * .3)
      : Math.min(30, Rm * .15),
    p = [];
  for (let t = 0; t <= mx; t += 10) {
    const o = A * Math.sin(t * (LAY == "wind" ? .015 : .025) + g * 7) *
      Math.min(1, t / 50);
    p.push([d[0] * t + n[0] * o, d[1] * t + n[1] * o]);
  }
  return p;
}
function gateOf(p) {
  for (let i = 1; i < p.length; i++) {
    const a = p[i - 1], b = p[i];
    if (Math.hypot(b[0], b[1]) >= Rat(Math.atan2(b[1], b[0]))) {
      let lo = 0, hi = 1;
      for (let k = 0; k < 8; k++) {
        const m = (lo + hi) / 2,
          x = a[0] + (b[0] - a[0]) * m,
          y = a[1] + (b[1] - a[1]) * m;
        Math.hypot(x, y) >= Rat(Math.atan2(y, x)) ? hi = m : lo = m;
      }
      const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
      return [
        a[0] + (b[0] - a[0]) * hi,
        a[1] + (b[1] - a[1]) * hi,
        -(b[1] - a[1]) / l,
        (b[0] - a[0]) / l,
      ];
    }
  }
  return [0, 0, 0, 0];
}
function build() {
  B = [];
  Y = [];
  YK = [];
  YD = [];
  YC = [];
  ZB = new Map();
  DS = null;
  CAS = null;
  CP = null;
  RL = null;
  UG = null;
  const mx = Math.max(...R);
  RDS = G.map((g) => roadPts(g, mx + 90));
  BR = [];
  if (RV) {
    const P = RV.pts,
      hw = RV.w / 2 + 6,
      ins = (p) => rivD(p[0], p[1]) < RV.w / 2 + 3,
      ct = (q) => {
        let k = 0, m = 1e9;
        for (let i = 0; i < P.length; i++) {
          const e = Math.hypot(P[i][0] - q[0], P[i][1] - q[1]);
          if (e < m) {
            m = e;
            k = i;
          }
        }
        const a = P[Math.max(0, k - 1)],
          b = P[Math.min(P.length - 1, k + 1)],
          l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
        return { c: P[k], n: [-(b[1] - a[1]) / l, (b[0] - a[0]) / l] };
      },
      sd = (q, c) =>
        Math.sign((q[0] - c.c[0]) * c.n[0] + (q[1] - c.c[1]) * c.n[1]) || 1;
    RDS = RDS.map((rd) => {
      const o = [];
      let i = 0;
      while (i < rd.length) {
        if (!ins(rd[i])) {
          o.push(rd[i]);
          i++;
          continue;
        }
        let j = i;
        while (j < rd.length && ins(rd[j])) j++;
        if (i > 0 && j < rd.length) {
          let k = i, mn = 1e9;
          for (let q = i; q < j; q++) {
            const e = rivD(rd[q][0], rd[q][1]);
            if (e < mn) {
              mn = e;
              k = q;
            }
          }
          let c = ct(rd[k]);
          {
            const t0 = [c.n[1], -c.n[0]];
            for (const off of [0, 38, -38, 76, -76]) {
              const c2 = ct([c.c[0] + t0[0] * off, c.c[1] + t0[1] * off]);
              if (
                BR.every((b) =>
                  Math.hypot(
                    (b[0][0] + b[1][0]) / 2 - c2.c[0],
                    (b[0][1] + b[1][1]) / 2 - c2.c[1],
                  ) > 36
                )
              ) {
                c = c2;
                break;
              }
            }
          }
          const s1 = sd(rd[i - 1], c);
          if (s1 != sd(rd[j], c)) {
            const a0 = rd[Math.max(0, k - 1)],
              a1 = rd[Math.min(rd.length - 1, k + 1)],
              ul = Math.hypot(a1[0] - a0[0], a1[1] - a0[1]) || 1,
              u = [(a1[0] - a0[0]) / ul, (a1[1] - a0[1]) / ul],
              tt = [c.n[1], -c.n[0]],
              un = u[0] * c.n[0] + u[1] * c.n[1],
              ut = Math.max(-.57, Math.min(.57, u[0] * tt[0] + u[1] * tt[1])),
              sg = Math.sign(un) || -s1,
              un2 = sg * Math.sqrt(1 - ut * ut),
              u2 = [c.n[0] * un2 + tt[0] * ut, c.n[1] * un2 + tt[1] * ut],
              h = hw / Math.abs(un2) + 2,
              A = [c.c[0] - u2[0] * h, c.c[1] - u2[1] * h],
              Z = [c.c[0] + u2[0] * h, c.c[1] + u2[1] * h];
            while (
              o.length > 1 &&
              Math.hypot(o[o.length - 1][0] - A[0], o[o.length - 1][1] - A[1]) <
                16
            ) o.pop();
            o.push(A, Z);
            BR.push([A, Z]);
            while (
              j < rd.length && Math.hypot(rd[j][0] - Z[0], rd[j][1] - Z[1]) < 16
            ) j++;
          }
        }
        i = j;
      }
      return o;
    });
  }
  if (SE) {
    /* дороги не заходять у море: біля берега вони стають вздовж нього */
    RDS = RDS.map((rd) =>
      rd.map((p) => {
        const q = seaD(p[0], p[1]);
        return q > -8 ? [p[0] - SE.ux * (q + 8), p[1] - SE.uy * (q + 8)] : p;
      })
    );
  }
  GP = RDS.map(gateOf);
  const CORR = RDS.map((p) => ({ p, hw: 3.5, sk: 2 }));
  if (RV) CORR.push({ p: RV.pts, hw: RV.w / 2 + 3, sk: 0 });
  const bad = (x, y) =>
    (RV && rivD(x, y) < RV.w / 2 + 8) || (SE && seaD(x, y) > -10);
  const KS = tier >= 3
      ? ["rich", "trade", "craft", "poor", "slum", "industry"]
      : tier == 2
      ? ["trade", "craft", "poor"]
      : [],
    BK = [],
    dc = Array.from({ length: 4 + tier * 3 }, (_, i) => {
      const r = mk(seed + "d" + i), a = r() * PI2, rr = Math.sqrt(r()) * mx;
      return {
        x: Math.cos(a) * rr,
        y: Math.sin(a) * rr,
        k: .7 + r() * .5,
        kind: KS.length ? KS[Math.floor(r() * KS.length)] : undefined,
      };
    }),
    nd = (x, y) => {
      let b = 0, bd = 1e9;
      dc.forEach((c, i) => {
        const d = Math.hypot(c.x - x, c.y - y);
        if (d < bd) {
          bd = d;
          b = i;
        }
      });
      return b;
    };
  let CS = null;
  if (tier >= 3) {
    const gs = [...G].sort((a, b) => a - b);
    let ba = 0, bg = 0;
    gs.forEach((g, i) => {
      const d = (i < gs.length - 1 ? gs[i + 1] : gs[0] + PI2) - g;
      if (d > bg) {
        bg = d;
        ba = g + d / 2;
      }
    });
    const rc2 = Rm * .18, rr = Rat(ba) - rc2 * 1.05 - 3;
    CS = { x: Math.cos(ba) * rr, y: Math.sin(ba) * rr, r: rc2 * 1.15 };
    const GG = castleGeo(CS, ba, rc2, seed);
    CAS = Object.assign(mkb("castle", "castle", GG.poly), {
      r: rc2 * 1.5,
      rc: rc2,
      ang: ba,
      g: GG,
      moat: mk(seed + "mo")() < .6,
    });
    CP = GG.poly.map(
      (q) => [CAS.cx + (q[0] - CAS.cx) * 1.25, CAS.cy + (q[1] - CAS.cy) * 1.25],
    );
  }
  if (KS.length) {
    const r = mk(seed + "pl"),
      P = [],
      ad = (x, y, kind) => P.push({ x, y, k: 1, kind }),
      rat = (a) => Rat(a);
    ad(0, 0, "trade");
    let rx, ry;
    if (CS) {
      rx = CS.x * .5;
      ry = CS.y * .5;
    } else {
      const a = r() * PI2;
      rx = Math.cos(a) * Rm * .4;
      ry = Math.sin(a) * Rm * .4;
    }
    if (tier >= 3) ad(rx, ry, "rich");
    G.forEach((g, i) =>
      ad(
        Math.cos(g) * rat(g) * .72,
        Math.sin(g) * rat(g) * .72,
        i == 0 ? "trade" : "craft",
      )
    );
    let ix, iy, bs = -1;
    if (RV) {
      RV.pts.forEach((p) => {
        const d = Math.hypot(p[0], p[1]);
        if (d < Rm * .9 && d > Rm * .35) {
          const s = Math.hypot(p[0] - rx, p[1] - ry);
          if (s > bs) {
            bs = s;
            ix = p[0] * .9;
            iy = p[1] * .9;
          }
        }
      });
    }
    if (bs < 0) {
      const a = CS ? Math.atan2(CS.y, CS.x) + Math.PI : r() * PI2;
      ix = Math.cos(a) * Rm * .6;
      iy = Math.sin(a) * Rm * .6;
    }
    if (tier >= 3) ad(ix, iy, "industry");
    const gs = [...G].sort((a, b) => a - b);
    let sl = -1, sd = -1;
    gs.forEach((g, i) => {
      const g2 = i < gs.length - 1 ? gs[i + 1] : gs[0] + PI2,
        am = (g + g2) / 2,
        x = Math.cos(am) * rat(am) * .8,
        y = Math.sin(am) * rat(am) * .8,
        dd = Math.hypot(x - rx, y - ry);
      ad(x, y, "poor");
      if (dd > sd) {
        sd = dd;
        sl = P.length - 1;
      }
    });
    if (tier >= 3 && sl >= 0) P[sl].kind = "slum";
    dc.length = 0;
    dc.push(...P);
  }
  const kd = (x, y) => {
      if ((SE && seaD(x, y) > -28) || (RV && tier >= 1 && rivD(x, y) < RV.w / 2 + 14)) return "port";
      if (CS && Math.hypot(x - CS.x, y - CS.y) < CS.r + 32) return "rich";
      let a = 0, ad = 1e9, b = 0, bd = 1e9;
      dc.forEach((c, i) => {
        const d = Math.hypot(c.x - x, c.y - y);
        if (d < ad) {
          b = a;
          bd = ad;
          a = i;
          ad = d;
        } else if (d < bd) {
          b = i;
          bd = d;
        }
      });
      return dc[
        bd - ad < 14 &&
          Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1 < .45
          ? b
          : a
      ].kind;
    },
    KF = {
      rich: 1.3,
      industry: 1.3,
      trade: .9,
      craft: .95,
      poor: .75,
      slum: .65,
      port: .9,
    };
  DCL = dc.filter((c) => c.kind && Math.hypot(c.x, c.y) < Rm * .85).map((
    c,
    i,
  ) => ({
    x: c.x,
    y: c.y,
    n: ({
      rich: "Золотий квартал",
      trade: "Торговий ряд",
      craft: "Ремісничий кінець",
      poor: "Бідний куток",
      slum: "Нетрі",
      industry: "Промзона",
    }[c.kind] || "Район") + " «" + cname(seed + "d" + i) + "»",
  }));
  const rc = mk(seed + "c"), C = [], nc = Math.round(PR * PR * .09), pr = PRD;
  for (let i = 0; i < nc; i++) {
    C.push({ i, r: PR * Math.sqrt(rc()), a: rc() * PI2, j: rc() });
  }
  C.sort((a, b) => a.r - b.r);
  const grid = new Map(),
    out = [],
    gk = (x, y) => (Math.floor(x / 20) + 200) * 1000 + Math.floor(y / 20) + 200,
    near = (x, y, k) => {
      const r = [];
      for (let i = -k; i <= k; i++) {
        for (let j = -k; j <= k; j++) {
          const g = grid.get(gk(x + i * 20, y + j * 20));
          if (g) r.push(...g);
        }
      }
      return r;
    };
  for (const c of C) {
    if (c.r > mx) break;
    if (c.r < pr + 1.5 || c.r > Rat(c.a) - 4 - WM) continue;
    const x = Math.cos(c.a) * c.r,
      y = Math.sin(c.a) * c.r,
      dm = (8 + 9 * Math.pow(Math.min(1, c.r / Rm), .8)) * (.55 + .9 * c.j) *
        (KF[kd(x, y)] || 1) * (tier < 2 ? .5 : 1);
    if ((RV && rivD(x, y) < RV.w / 2 + 1) || (SE && seaD(x, y) > -3)) continue;
    if (
      near(x, y, 1).some((s) => Math.hypot(x - s.x, y - s.y) < (dm + s.dm) / 2)
    ) continue;
    const s = { i: c.i, x, y, a: c.a, r: c.r, dm, d: nd(x, y), k: kd(x, y) },
      k = gk(x, y);
    if (!grid.has(k)) grid.set(k, []);
    grid.get(k).push(s);
    out.push(s);
  }
  for (const s of out) {
    const rb = Rat(s.a) - 2.5 - WM;
    if (rb - s.r < 25) {
      const rg = 2 * rb - s.r,
        g = { x: Math.cos(s.a) * rg, y: Math.sin(s.a) * rg, d: s.d },
        k = gk(g.x, g.y);
      if (!grid.has(k)) grid.set(k, []);
      grid.get(k).push(g);
    }
  }
  for (const s of out) {
    if (CS && Math.hypot(s.x - CS.x, s.y - CS.y) < CS.r) continue;
    let p = [[s.x - 45, s.y - 45], [s.x + 45, s.y - 45], [s.x + 45, s.y + 45], [
      s.x - 45,
      s.y + 45,
    ]];
    const nb = near(s.x, s.y, 3).filter((t) => t !== s).sort((a, b) =>
      Math.hypot(a.x - s.x, a.y - s.y) - Math.hypot(b.x - s.x, b.y - s.y)
    );
    for (const t of nb) {
      let m = 0;
      for (const v of p) m = Math.max(m, Math.hypot(v[0] - s.x, v[1] - s.y));
      if (Math.hypot(t.x - s.x, t.y - s.y) / 2 > m) break;
      p = clip(
        p,
        t.x - s.x,
        t.y - s.y,
        (t.x * t.x + t.y * t.y - s.x * s.x - s.y * s.y) / 2,
      );
    }
    p = clip(p, Math.cos(s.a), Math.sin(s.a), Rat(s.a) - 2.5 - WM);
    if (s.r < pr + 30) p = clip(p, -Math.cos(s.a), -Math.sin(s.a), -pr);
    for (const cr of CORR) {
      const rd = cr.p, hw = cr.hw;
      for (let k = cr.sk; k < rd.length - 1; k++) {
        const a = rd[k],
          b = rd[k + 1],
          ln = Math.hypot(b[0] - a[0], b[1] - a[1]),
          dx = (b[0] - a[0]) / ln,
          dy = (b[1] - a[1]) / ln,
          nx = -dy,
          ny = dx;
        if (Math.hypot(a[0] - s.x, a[1] - s.y) > 60) continue;
        let lo = 1e9, hi = -1e9, al = 1e9, ah = -1e9;
        for (const v of p) {
          const l = (v[0] - a[0]) * nx + (v[1] - a[1]) * ny,
            u = (v[0] - a[0]) * dx + (v[1] - a[1]) * dy;
          lo = Math.min(lo, l);
          hi = Math.max(hi, l);
          al = Math.min(al, u);
          ah = Math.max(ah, u);
        }
        if (ah > 0 && al < ln && hi > -hw && lo < hw) {
          const c0 = a[0] * nx + a[1] * ny;
          p = (s.x * nx + s.y * ny) - c0 >= 0
            ? clip(p, -nx, -ny, -hw - c0)
            : clip(p, nx, ny, c0 - hw);
        }
      }
    }
    if (p.length < 3 || area(p) < 8) continue;
    const sr = mk(seed + "L" + s.i),
      wb = (s.k == "poor" || s.k == "slum" ? .45 : .7) + sr() * .5,
      ins = inset(p, (i, a, b) => {
        const mx2 = (a[0] + b[0]) / 2, my2 = (a[1] + b[1]) / 2;
        let bt = null, bd = 1e9;
        for (const t of nb) {
          const d2 = Math.hypot(t.x - mx2, t.y - my2);
          if (d2 < bd) {
            bd = d2;
            bt = t;
          }
        }
        return bt && bt.d != s.d && bd < Math.hypot(s.x - mx2, s.y - my2) + .5
          ? wb + 1.4
          : wb;
      });
    if (ins.length < 3 || area(ins) < 4) continue;
    Y.push(ins);
    YK.push(s.k || "res");
    YD.push(s.d);
    YC.push(cen(ins));
    ZB.set(s.i, s.d);
    BK.push({ s, ins, sr, A: area(ins) });
  }
  {
    const g = new Map();
    for (const k of BK) {
      const s = k.s,
        e = g.get(s.d) || { x: 0, y: 0, n: 0, c: {} },
        kk = s.k || "res";
      e.x += s.x;
      e.y += s.y;
      e.n++;
      e.c[kk] = (e.c[kk] || 0) + 1;
      g.set(s.d, e);
    }
    const cnt = {};
    DCL = [...g.entries()].filter(([d, e]) => e.n >= 3).map(([d, e], i) => {
      const k = Object.entries(e.c).sort((a, b) => b[1] - a[1])[0][0];
      return {
        d,
        x: e.x / e.n,
        y: e.y / e.n,
        k,
        n: ((NP[k] || [])[(cnt[k] = (cnt[k] || 0) + 1) - 1] ||
          (ZK[k] ? ZK[k][0] : "Район")) + " «" + cname(seed + "d" + i) + "»",
      };
    });
  }
  let ch = 0, hl = 0, pk = 0, sq = 0;
  const BM = tier >= 3 ? 110 : tier == 2 ? 70 : 1e9;
  for (const k of BK) {
    const { s, ins, sr, A } = k,
      f = Math.min(1, s.r / Rm),
      dk = s.k,
      z = tier < 2 ? 2 : f < .3 ? 0 : f < .65 ? 1 : 2,
      id = s.i,
      [cx, cy] = cen(ins);
    let kind = "lots";
    if (A >= BM) {
      const r = sr();
      if (tier >= 3 && !ch) {
        kind = "cathedral";
        ch = 1;
      } else if (tier >= 2 && !hl) {
        kind = "hall";
        hl = 1;
      } else if (
        tier >= 4 && pk < (tier >= 5 ? 3 : 1) && dk == "rich" && r < .3
      ) {
        kind = "park";
        pk++;
      } else if (tier >= 3 && sq < tier - 2 && dk == "trade" && r < .3) {
        kind = "square";
        sq++;
      } else if (dk == "rich") kind = "estate";
      else if (tier >= 3 && r < .35 && dk != "slum" && dk != "poor") {
        kind = "inst";
      }
    }
    if (kind == "park" || kind == "square") {
      const o = mkb(kind == "park" ? "park" : "plaza", id + "p", ins);
      if (kind == "park") o.tr = trees(ins, sr);
      B.push(o);
      if (kind == "square") B.push(mkb("well", id + "f", rp(cx, cy, 3, 3, 0)));
      continue;
    }
    if (kind != "lots") {
      const lo = inset(ins, .5),
        t = ["cathedral", "hall", "estate"].includes(kind)
          ? kind
          : pick(z, 1, sr(), dk);
      pb(bld(t, id + "b", lo, sr));
      continue;
    }
    const poor = dk == "poor" || dk == "slum",
      lots = [],
      dens = tier < 2 ? .85 : 1;
    split(
      ins,
      tier < 2
        ? (14 + 24 * f) * .65 * (.7 + .6 * sr())
        : poor
        ? 15 + sr() * 8
        : A > 110
        ? A / (1.8 + sr() * 1.4)
        : 1e9,
      sr,
      lots,
      0,
    );
    lots.forEach((lp, n) => {
      if (sr() > dens) return;
      const lo = inset(lp, .35 + (lots.length == 1 ? sr() * .8 : 0)),
        A2 = area(lo);
      if (lo.length < 3 || A2 < 3) return;
      pb(
        bld(
          pick(z, tier >= 2 && A2 > 55 && sr() < .2, sr(), dk),
          id + "." + n,
          lo,
          sr,
          poor,
        ),
      );
    });
  }
  const sp = [];
  if (tier >= 1 && !hl) sp.push(tier >= 2 ? "hall" : "elder");
  if (tier >= 1 && !ch) sp.push("temple");
  if (tier >= 2) sp.push("market");
  B.filter((b) =>
    b.rc && b.A >= 18 && !["estate", "cathedral", "hall"].includes(b.t)
  ).sort((a, b) => Math.hypot(a.cx, a.cy) - Math.hypot(b.cx, b.cy)).slice(
    0,
    sp.length,
  ).forEach((b, i) => b.t = sp[i]);
  B.push(mkb(tier >= 2 ? "fountain" : "well", "c", rp(0, 0, 3, 3, 0)));
  if (CAS) B.push(CAS);
  waterfront(mx);
  const fs = [],
    so = mk(seed + "o"),
    gp = (a) => G.some((g) => Math.abs(nrm(a - g)) * (Rat(a) + 30) < 12);
  for (let m = 0, nf = Math.round(mx * .4); m < nf; m++) {
    const a = so() * PI2,
      r0 = so(),
      tp = so(),
      s1 = so(),
      s2 = so(),
      r = Rat(a) + 10 + r0 * 60;
    if (gp(a) || bad(Math.cos(a) * r, Math.sin(a) * r)) continue;
    const t = tp < .07 ? "windmill" : tp < .12 ? "farmstead" : "field",
      fl = t == "field";
    const fx = Math.cos(a) * r, fy = Math.sin(a) * r;
    if (fl) {
      if (fs.some((q) => Math.hypot(q[0] - fx, q[1] - fy) < 24)) continue;
      fs.push([fx, fy]);
    }
    B.push(
      mkb(
        t,
        "o" + m,
        rp(
          Math.cos(a) * r,
          Math.sin(a) * r,
          fl ? 14 + s1 * 18 : 6,
          fl ? 9 + s2 * 10 : 6,
          a + 1.5708 + (s1 - .5) * .7,
        ),
        1,
      ),
    );
  }
  if (tier >= 1) {
    const sb = mk(seed + "sb");
    RDS.forEach((rd, ri) => {
      for (let i = 1; i < rd.length - 1; i++) {
        const p = rd[i],
          d = Math.hypot(p[0], p[1]),
          rr = Rat(Math.atan2(p[1], p[0]));
        if (d < rr + 7 || d > rr + (tier >= 3 ? 90 : 50)) continue;
        const dx = rd[i + 1][0] - rd[i - 1][0],
          dy = rd[i + 1][1] - rd[i - 1][1],
          l = Math.hypot(dx, dy) || 1,
          ux = dx / l,
          uy = dy / l,
          an = Math.atan2(uy, ux);
        for (const sd of [-1, 1]) {
          if (sb() > .6) continue;
          const o = 10 + sb() * 6,
            x = p[0] - uy * sd * o,
            y = p[1] + ux * sd * o;
          if (bad(x, y)) continue;
          B.push(
            mkb(
              "house",
              "sb" + ri + "_" + i + "_" + sd,
              rp(x, y, 6 + sb() * 3, 4 + sb() * 2, an),
              1,
            ),
          );
        }
      }
    });
    const sq = mk(seed + "st");
    ST = null;
    for (let k = 0; k < 20 && !ST; k++) {
      const a = sq() * PI2,
        r = Rat(a) + 90 + sq() * 70,
        x = Math.cos(a) * r,
        y = Math.sin(a) * r;
      if (!gp(a) && !bad(x, y) && !bad(x + 14, y) && !bad(x - 14, y)) {
        ST = { x, y };
      }
    }
  }
  for (let m = 0, nt = Math.round(mx * 2.5); m < nt; m++) {
    const a = so() * PI2,
      r0 = so(),
      tp = so(),
      s1 = so(),
      r = Rat(a) + 40 + r0 * 100;
    if (gp(a) || bad(Math.cos(a) * r, Math.sin(a) * r)) continue;
    const hut = tp < .015, w = hut ? 5 : 4 + s1 * 5;
    B.push(
      mkb(
        hut ? "hut" : "forest",
        "t" + m,
        rp(Math.cos(a) * r, Math.sin(a) * r, w, w, a),
        1,
      ),
    );
  }
}
