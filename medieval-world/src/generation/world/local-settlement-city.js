/* ---- сусідні села будує той самий генератор: підміняємо глобальний стан на стан села ---- */
function getG() {
  return {
    R,
    G,
    RDS,
    GP,
    B,
    L,
    Y,
    YK,
    YD,
    YC,
    DCL,
    ZB,
    tier,
    Rm,
    PR,
    PRD,
    WM,
    TS,
    RV,
    SE,
    SHORE,
    RC,
    BR,
    CAS,
    CP,
    ST,
    LAY,
    seed,
    lists,
    sums,
    RL,
    RS,
    UG,
    DS,
    del,
    add,
  };
}
function setG(o) {
  ({
    R,
    G,
    RDS,
    GP,
    B,
    L,
    Y,
    YK,
    YD,
    YC,
    DCL,
    ZB,
    tier,
    Rm,
    PR,
    PRD,
    WM,
    TS,
    RV,
    SE,
    SHORE,
    RC,
    BR,
    CAS,
    CP,
    ST,
    LAY,
    seed,
    lists,
    sums,
    RL,
    RS,
    UG,
    DS,
    del,
    add,
  } = o);
}
const BLK = () => ({
  R: [],
  G: [],
  RDS: [],
  GP: [],
  B: [],
  L: [],
  Y: [],
  YK: [],
  YD: [],
  YC: [],
  DCL: [],
  ZB: new Map(),
  tier: 0,
  Rm: 26,
  PR: 80,
  PRD: 4,
  WM: 0,
  TS: 12,
  RV: null,
  SE: null,
  SHORE: "none",
  RC: null,
  BR: [],
  CAS: null,
  CP: null,
  ST: null,
  LAY: "rad",
  seed: 0,
  lists: null,
  sums: null,
  RL: null,
  RS: [],
  UG: null,
  DS: null,
  del: new Set(),
  add: [],
});
function settleAngles(v) {
  const A = [],
    add = (a) => {
      if (A.every((q) => Math.abs(nrm(q - a)) > .5)) A.push(a);
    },
    dir = (g, st) => {
      const P = g.pts, n = P.length;
      return st
        ? Math.atan2(
          P[Math.min(3, n - 1)][1] - P[0][1],
          P[Math.min(3, n - 1)][0] - P[0][0],
        )
        : Math.atan2(
          P[Math.max(0, n - 4)][1] - P[n - 1][1],
          P[Math.max(0, n - 4)][0] - P[n - 1][0],
        );
    };
  for (const u of redges(v)) {
    const a = v.id < u.id ? v : u, b = a === v ? u : v, g = vroad(a, b, true);
    if (g) add(dir(g, a === v));
  }
  for (const g of wgates()) if (g.to === v) add(dir(g, false));
  return A;
}
function mkSettle(v) {
  if (v.st !== undefined) return v.st;
  let ang = [];
  try {
    ang = settleAngles(v);
  } catch (e) {
    console.warn(e);
  }
  const base = getG();
  v.st = null;
  try {
    setG(BLK());
    seed = hs(WLD.s + "S" + v.id);
    tier = v.tier;
    Rm = RB[tier];
    PR = Rm * 1.7 + 30;
    LAY = ["rad", "wind", "rad", "long"][Math.floor(mk(seed + "L")() * 4)];
    const r = mk(seed + "w"), p1 = r() * 6.28, p2 = r() * 6.28;
    R = Array.from({ length: N }, (_, k) => {
      const a = -Math.PI + k / N * PI2,
        b = 1 + .1 * Math.sin(3 * a + p1) + .06 * Math.sin(5 * a + p2);
      return LAY == "long"
        ? Rm * b * (1 + .3 * Math.cos(2 * (a - p1)))
        : Rm * b;
    });
    polyR();
    mkGates();
    {
      const rg = mk(seed + "ga");
      G = ang.slice(0, GN[tier]);
      const need = Math.min(GN[tier], tier >= 3 ? 3 : 1);
      let gd = 0;
      while (G.length < need && gd++ < 30) {
        const a = rg() * PI2 - Math.PI;
        if (G.every((q) => Math.abs(nrm(q - a)) > .9)) G.push(a);
      }
    }
    setup();
    build();
    makeL();
    let n = 0, p = 0;
    for (const b of L) {
      if (!b.o && !["well", "fountain", "garden"].includes(b.t)) {
        n++;
        if (T[b.t].c === "Житлова") p += 5;
      }
    }
    RDS = RDS.map((rd) => {
      const o = [];
      for (const q of rd) {
        o.push(q);
        if (Math.hypot(q[0], q[1]) >= Rat(Math.atan2(q[1], q[0])) + 2) break;
      }
      return o;
    });
    v.st = getG();
    v.st.n = n;
    v.st.p = p;
  } catch (e) {
    v.st = null;
    console.warn(e);
  } finally {
    setG(base);
  }
  return v.st;
}
function drawSettle(v) {
  const st = mkSettle(v);
  if (!st) return false;
  const x = ox + v.x * S, y = oy + v.y * S, rr = (Math.max(...st.R) + 20) * S;
  if (x + rr < 0 || y + rr < 0 || x - rr > W || y - rr > H) return true;
  const bo = BIO, sx = ox, sy = oy, old = getG(), pp0 = raceEnter(v);
  try {
    setG(st);
    BIO = BIOS[v.bk] || bo;
    ox = sx + v.x * S;
    oy = sy + v.y * S;
    wpath();
    ctx.fillStyle = "#cdbf9e";
    ctx.fill();
    ctx.strokeStyle = "#c4b080";
    ctx.lineWidth = Math.max(1, S * 7);
    ctx.lineCap = "butt";
    ctx.lineJoin = "round";
    for (const p of RDS) {
      path0(p);
      ctx.stroke();
    }
    ctx.fillStyle = "#d6cdb2";
    dot(ox, oy, PRD * S);
    ctx.fillStyle = "#c3b690";
    for (const p of Y) {
      path(p);
      ctx.fill();
    }
    const sst = v.tier < 3 ? rxState(v) : "normal";
    for (const b of L) if (!b.o) { if (sst == "normal") drawB(b); else stDraw(b, sst); }
    drawWall();
  } finally {
    raceLeave(pp0);
    setG(old);
    BIO = bo;
    ox = sx;
    oy = sy;
  }
  return true;
}
