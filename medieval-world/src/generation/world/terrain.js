// ===================== СВІТ =====================
var WON = true,
  WRD = true,
  WLD = null,
  BIOK = "grass",
  WSK = new Set(["field", "forest", "farmstead", "windmill", "hut"]),
  VC = 720,
  CS = 48,
  TP = 512,
  WPEND = false,
  RT0 = 0,
  OPS = 0,
  bdirty = true,
  bc = null,
  bx = null,
  bkey = "";
const H2 = (a, b, s) => {
    let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263) +
      Math.imul(s | 0, 1442695041)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  },
  vn = (x, y, s) => {
    const i = Math.floor(x),
      j = Math.floor(y),
      fx = x - i,
      fy = y - j,
      u = fx * fx * (3 - 2 * fx),
      v = fy * fy * (3 - 2 * fy),
      a = H2(i, j, s),
      b = H2(i + 1, j, s),
      c = H2(i, j + 1, s),
      d = H2(i + 1, j + 1, s);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  },
  fbm = (x, y, s, o) => {
    let a = .5, f = 1, t = 0, n = 0;
    for (let i = 0; i < o; i++) {
      t += a * vn(x * f, y * f, s + i * 131);
      n += a;
      a *= .5;
      f *= 2.02;
    }
    return t / n;
  },
  sst = (a, b, x) => {
    const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  },
  cl01 = (v) => v < 0 ? 0 : v > 1 ? 1 : v,
  hx = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)),
  FP = {
    grass: ["#efe4a8", "#e6e3a8", "#e0e2b2", "#ecdba4"],
    snow: ["#e9eef0", "#dfe7ea", "#e4eaec"],
    desert: ["#e8d29c", "#dfc994", "#ebd9aa"],
    swamp: ["#d6d99e", "#ccd3a2", "#d9dba8"],
  },
  ROOF = ["#b8a085", "#ab9378", "#c4ab8e", "#a8917a"],
  tick = () => {
    if (OPS > 0 && performance.now() - RT0 > 14) return false;
    OPS++;
    return true;
  };

/* ---- суша: три масштаби (материки ~10000, моря/затоки ~3000, узбережжя/острівці ~800) ---- */
const WT = {
  cont: { lv: .52, w: [1.15, .55, .3], tg: .6 },
  arch: { lv: .57, w: [.35, .95, .6], tg: .4 },
  land: { lv: .43, w: [.95, .6, .3], tg: .8 },
};
function cont(x, y, s, ox, oy, w) {
  const wx = (fbm(x / 3000 + 3.1, y / 3000 - 1.7, s + 1, 3) - .5) * 2600,
    wy = (fbm(x / 3000 - 5.2, y / 3000 + 2.2, s + 2, 3) - .5) * 2600,
    X = x + ox + wx,
    Y = y + oy + wy;
  return .5 + (fbm(X / 10000, Y / 10000, s + 3, 3) - .5) * w[0] +
    (fbm(X / 3000 + 7, Y / 3000 - 4, s + 4, 3) - .5) * w[1] +
    (fbm(X / 800 - 3, Y / 800 + 8, s + 6, 2) - .5) * w[2];
}
function wsetup() {
  const s = hs(($("#wseed").value || $("#seed").value) + "W"),
    t = WT[$("#wtype").value] || WT.cont;
  let bo = [0, 0], bd = 1e9;
  for (let k = 0; k < 90; k++) {
    const ox = (H2(k, 0, s + 5) - .5) * 80000,
      oy = (H2(k, 1, s + 5) - .5) * 80000;
    let sc = 0;
    for (let a = 0; a < 16; a++) {
      for (const r of [1500, 4000, 9000]) {
        if (
          cont(
            Math.cos(a / 16 * PI2) * r,
            Math.sin(a / 16 * PI2) * r,
            s,
            ox,
            oy,
            t.w,
          ) > t.lv
        ) sc++;
      }
    }
    const dd = Math.abs(sc - 48 * t.tg);
    if (dd < bd) {
      bd = dd;
      bo = [ox, oy];
    }
  }
  WLD = {
    s,
    lv: t.lv,
    w: t.w,
    ox: bo[0],
    oy: bo[1],
    t: new Map(),
    v: new Map(),
    lg: new Map(),
    cc: new Map(),
    gl: null,
    rl: [],
    rk: new Set(),
    re: new Set(),
    kc: new Map(),
    zt: new Map(),
    bt: new Map(),
  };
}
/* Річка міста у світі скінченна: тече від витоку до моря чи озера, далі суходолом не продовжується */
function rvRange() {
  if (WLD.rq && WLD.rq.rv === RV) return WLD.rq;
  const f = RV.f,
    q0 = -f.sx * f.ux - f.sy * f.uy,
    pos = (q) => {
      const o = f.o(q);
      return [f.ux * q - f.uy * o + f.sx, f.uy * q + f.ux * o + f.sy];
    },
    walk = (dir, lim) => {
      let q = q0;
      for (let i = 0; i < lim / 20; i++) {
        const p = pos(q + dir * 20);
        if (tsamp(p[0], p[1], 20).E <= .004) break;
        q += dir * 20;
      }
      return q;
    };
  return WLD.rq = {
    rv: RV,
    a: walk(-1, 2500 + H2(5, 1, WLD.s) * 3500),
    b: walk(1, 2500 + H2(5, 2, WLD.s) * 3500),
  };
}
function rfarD(x, y) {
  const f = RV.f,
    X = x - f.sx,
    Y = y - f.sy,
    q = X * f.ux + Y * f.uy,
    rg = rvRange();
  if (q < rg.a - 10 || q > rg.b + 10) return 1e9;
  const p = -X * f.uy + Y * f.ux,
    o = f.o(q),
    sl = (f.o(q + 2) - f.o(q - 2)) / 4;
  return Math.abs(p - o) / Math.sqrt(1 + sl * sl);
}
const BTG = {
  grass: [.5, .6],
  snow: [.5, .2],
  desert: [.2, .66],
  swamp: [.82, .6],
};
/* Висота суші до рельєфних доповнень: e<0 — вода; враховує море рідного міста */
function eBase(x, y, d) {
  let e = cont(x, y, WLD.s, WLD.ox, WLD.oy, WLD.w) +
    Math.pow(Math.max(0, 1 - d / 1500), 2) * .25 - WLD.lv;
  if (SE) {
    const q = seaD(x, y);
    if (q > 0) {
      const sw = 1 - sst(2800, 6500, d);
      e += (-.03 - Math.min(.35, q / 900) * .4 - e) * sw;
    } else if (d < 1800) e = Math.max(e, .02);
  }
  return e;
}
/* Море — водойма з поперечником від 5 км, менші водойми — озера.
   Заливка сітки WG знаходить водойму точки; результат кешується в WLD.kc (клітинка → 1 море, 0 озеро) */
const WG = 250, WSEA = 5000;
const wetCell = (i, j) =>
  eBase(
    (i + .5) * WG,
    (j + .5) * WG,
    Math.hypot((i + .5) * WG, (j + .5) * WG),
  ) < 0;
const N8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [
  -1,
  1,
]];
/* водойма мокрої клітинки: 8-зв'язна заливка, зупиняється, щойно габарит перевищує WSEA */
function bodyOf(i0, j0) {
  const ks = i0 + "," + j0, v = WLD.kc.get(ks);
  if (v !== undefined) return v;
  const seen = new Set([ks]), q = [[i0, j0]];
  let a0 = i0, a1 = i0, b0 = j0, b1 = j0, sea = 0;
  for (let h = 0; h < q.length; h++) {
    const [i, j] = q[h];
    a0 = Math.min(a0, i);
    a1 = Math.max(a1, i);
    b0 = Math.min(b0, j);
    b1 = Math.max(b1, j);
    if ((a1 - a0 + 1) * WG > WSEA || (b1 - b0 + 1) * WG > WSEA) {
      sea = 1;
      break;
    }
    for (const [a, b] of N8) {
      const k = (i + a) + "," + (j + b);
      if (!seen.has(k) && wetCell(i + a, j + b)) {
        seen.add(k);
        q.push([i + a, j + b]);
      }
    }
  }
  for (const k of seen) WLD.kc.set(k, sea);
  return sea;
}
/* 1 — море, 0 — озеро (чи суша). Берегова клітина біля моря теж вважається морем, щоб берег не рвався на «озера» */
function seaBody(x, y) {
  const ci = Math.floor(x / WG), cj = Math.floor(y / WG), k0 = ci + "," + cj;
  let v = WLD.kc.get(k0);
  if (v !== undefined) return v;
  if (wetCell(ci, cj)) return bodyOf(ci, cj);
  v = 0;
  for (const [a, b] of N8) {
    if (wetCell(ci + a, cj + b) && bodyOf(ci + a, cj + b)) {
      v = 1;
      break;
    }
  }
  WLD.kc.set(k0, v);
  return v;
}
function tsamp(x, y, sp) {
  const s = WLD.s,
    d = Math.hypot(x, y),
    cw = sst(2600, 1000, d),
    e = eBase(x, y, d);
  let E = e > 0 ? e * .45 : e * .5, rv = 0, rd = -.003, lake = 0;
  if (e < -.06) {
    return { E, rv, rd, lake, mo: .5, tp: .5, bk: "grass", fo: 0, fa: 0, cw };
  }
  /* біом біля рідного міста плавно підлаштований під біом міста */
  const tg = BTG[BIOK] || BTG.grass,
    mo = cl01(.5 + (fbm(x / 4200 + 40, y / 4200, s + 15, 3) - .5) * 1.8) *
        (1 - cw) + tg[0] * cw,
    tp0 = cl01(.5 + (fbm(x / 6000 - 7, y / 6000 + 3, s + 17, 3) - .5) * 1.8) *
        (1 - cw) + tg[1] * cw;
  if (e > 0) {
    const mm = sst(.5, .66, fbm(x / 4500 + 9, y / 4500, s + 8, 3)) *
        sst(450, 1500, d),
      rg = Math.pow(
        1 - Math.abs(2 * fbm(x / 1700, y / 1700, s + 7, 3) - 1),
        3.2,
      ),
      hl = fbm(x / 380, y / 380, s + 9, 3) - .5;
    E += mm * rg * .7 + hl * .14 * sst(0, .15, e) + sst(.2, .5, e) * .1;
    /* річки світу трасуються окремо (rivers.js); тут лише суша без води */
    rd = 1;
    const lk = fbm(x / 700 - 4, y / 700 + 6, s + 13, 3);
    if (lk > .72 && E < .3 && d > 800) {
      lake = 1;
      E = -.03;
      rd = -.003;
      rv = 0;
    }
  }
  const tp = tp0 - Math.max(0, E - .2) * .5,
    bk = tp < .36
      ? "snow"
      : (mo < .38 && tp > .45)
      ? "desert"
      : mo > .64
      ? "swamp"
      : "grass",
    ff = .6 * fbm(x / 1400 + 30, y / 1400, s + 19, 3) +
      .4 * fbm(x / 420, y / 420, s + 20, 3),
    fo = E > 0 ? sst(.48, .66, ff * (.7 + mo * .6)) * (1 - sst(.45, .7, E)) : 0;
  let fa = E > 0
    ? sst(.58, .72, fbm(x / 1400 - 12, y / 1400, s + 21, 3)) *
      sst(.35, .15, E) * (1 - sst(.3, .5, fo)) * (mo > .3 ? .55 : .25)
    : 0;
  fa = Math.max(fa, sst(1100, 450, d) * .5 * (1 - fo));
  if (E <= 0) {
    fa = 0;
    rd = -.003;
  }
  return { E, rv, rd, lake, mo, tp, bk, fo, fa, cw };
}
