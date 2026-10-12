const NAMES = [
    "Хутір",
    "Село",
    "Велике село",
    "Містечко",
    "Місто",
    "Велике місто",
    "Столиця",
  ],
  RB = [26, 36, 50, 70, 110, 150, 200],
  GN = [2, 2, 2, 3, 4, 5, 6],
  HS = new Set(["house", "rich", "slum", "farmstead"]),
  SC = new Set(["field", "forest"]),
  N = 96,
  PI2 = 6.2832;
const BIG = new Set(
  "barracks prison court school library chapel cemetery gmerch gmerc gmage galch gthief theater bank warehouse brewery tannery mine sawmill manufact academy arena hospital shipyard"
    .split(" "),
);
const $ = (s) => document.querySelector(s),
  cv = $("#cv"),
  tip = $("#tip"),
  sel = $("#type");
let ctx = cv.getContext("2d");
let W,
  H,
  S = 2,
  ox = 0,
  oy = 0,
  R,
  G,
  tier,
  Rm,
  PR,
  seed,
  B = [],
  Y = [],
  L = [],
  PRD = 4,
  RDS = [],
  GP = [],
  RV = null,
  SE = null,
  RC = null,
  BR = [],
  CAS = null,
  CP = null,
  del = new Set(),
  add = [],
  undo = [],
  lists,
  sums,
  mode = "info",
  hov = null,
  pts = null,
  drag = null,
  q = 0;
Object.keys(T).filter((k) =>
  T[k].c !== "Місцевість" && !SC.has(k) && !["park", "castle"].includes(k)
).forEach((k) => sel.add(new Option(T[k].n + " (" + T[k].c + ")", k)));
const hs = (s) =>
  [...String(s)].reduce((a, c) => (Math.imul(a, 31) + c.charCodeAt(0)) | 0, 7);
var NP = {
    trade: [
      "Торговий ряд",
      "Ринковий квартал",
      "Брамний ряд",
      "Караванний двір",
    ],
    craft: [
      "Ремісничий кінець",
      "Цеховий квартал",
      "Брамна слобода",
      "Майстровий ряд",
    ],
    rich: ["Золотий квартал", "Верхнє місто"],
    poor: ["Бідний куток", "Нижня слобода", "Глинище", "Околиця", "Мотлох"],
    slum: ["Нетрі"],
    industry: ["Промзона", "Гарбарний кут"],
    port: ["Порт", "Пристань"],
    res: ["Житлова зона"],
  },
  KD = {
    rich: "Просторі садиби, храми й гільдії. Найспокійніший район.",
    trade: "Крамниці, таверни, склади й заїжджі двори. Тут жваво.",
    craft: "Кузні, пекарні й майстерні. Шумно, але працьовито.",
    poor: "Скромні будинки, мало закладів.",
    slum: "Тіснява й халупи. Високий ризик злочинності.",
    industry: "Гарбарні, пивоварні, мануфактури. Сморід і дим.",
    port: "Верфі, склади й моряки.",
    res: "Житлова забудова.",
  },
  CT = {
    "Житлова": "Житло",
    "Переробка": "Ремесло",
    "Державна": "Державні",
    "Добування": "Добування",
    "Торгівля": "Торгівля",
    "Релакс": "Дозвілля",
    "Релігія": "Релігія",
    "Гільдія": "Гільдії",
    "Інше": "Інше",
  };
var ZK = {
    rich: ["Золотий квартал", "#a56bd8"],
    trade: ["Торговий ряд", "#4a90d9"],
    craft: ["Ремісничий кінець", "#ec8f3a"],
    poor: ["Бідний куток", "#6dbd62"],
    slum: ["Нетрі", "#c9524a"],
    industry: ["Промзона", "#d2c23a"],
    port: ["Порт", "#2fb5b0"],
    res: ["Житлова зона", "#6dbd62"],
    castle: ["Замок", "#7b86e8"],
  },
  ZC = null,
  YK = [],
  YD = [],
  YC = [],
  ZB = new Map(),
  DS = null,
  HV = null;
var tint = (c) => {
  if (!BIO.t) return c;
  const k = .3, m = BIO.t;
  return "#" +
    [1, 3, 5].map((i) =>
      Math.round(
        parseInt(c.slice(i, i + 2), 16) * (1 - k) +
          parseInt(m.slice(i, i + 2), 16) * k,
      ).toString(16).padStart(2, "0")
    ).join("");
};
var LAY = "rad",
  MAG = false,
  ST = null,
  BIOS = {
    grass: {
      g: "#ebe8d2",
      f: "#d0dcaf",
      tr: "#9bb580",
      fl: "#efe3a9",
      fs: "#cdbb78",
    },
    snow: {
      t: "#ffffff",
      g: "#f1f4f4",
      f: "#dbe7e1",
      tr: "#9db8ad",
      fl: "#e6ecef",
      fs: "#c3cfd6",
    },
    desert: {
      t: "#d9a050",
      g: "#f0e0b8",
      f: "#dadaa4",
      tr: "#a9b57e",
      fl: "#e8d194",
      fs: "#c9ad6a",
    },
    swamp: {
      t: "#4a6a50",
      g: "#dce2c2",
      f: "#c0d1a0",
      tr: "#7f9d6c",
      fl: "#d8d89e",
      fs: "#b3b070",
    },
  },
  BIO = BIOS.grass,
  F = {},
  RL = null,
  RS = [],
  UG = null,
  DCL = [],
  HP = [0, 0, 0, 0];
const LAYN = {
  rad: "радіальне",
  grid: "решітка",
  wind: "звивисте",
  long: "витягнуте",
};
const cname = (s) => {
  const r = mk(s + "nm"), p = (a) => a[Math.floor(r() * a.length)];
  return p([
    "Ал",
    "Бер",
    "Вер",
    "Гор",
    "Дрон",
    "Ель",
    "Кар",
    "Лор",
    "Мір",
    "Нов",
    "Ост",
    "Рів",
    "Сір",
    "Тар",
    "Вел",
    "Зар",
  ]) + (r() < .5 ? p(["ен", "ов", "ір", "ан", "ег", "ар"]) : "") +
    p([
      "бург",
      "град",
      "валь",
      "мор",
      "поль",
      "гард",
      "дол",
      "брук",
      "тон",
      "ліс",
    ]);
};
function mk(s) {
  let a = hs(s);
  return () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const nrm = (a) => ((a + Math.PI) % PI2 + PI2) % PI2 - Math.PI;
function Rat(a) {
  a = nrm(a);
  const u = (a + Math.PI) / PI2 * N, f = Math.floor(u), k = f % N;
  return R[k] * (1 - (u - f)) + R[(k + 1) % N] * (u - f);
}
const KM = {
  rich: {
    rich: 8,
    garden: 3,
    jewel: 2,
    theater: 2,
    library: 2,
    school: 2,
    gmage: 2,
    slum: 0,
    house: .4,
    tannery: 0,
    brothel: 0,
  },
  trade: {
    shop: 4,
    inn: 2,
    tavern: 2,
    gmerch: 3,
    warehouse: 2,
    bank: 3,
    pharm: 1,
    jewel: 1,
  },
  craft: {
    smith: 4,
    bakery: 3,
    weaver: 3,
    tannery: 2,
    brewery: 2,
    mill: 2,
    sawmill: 2,
    house: 1.5,
  },
  poor: {
    slum: 6,
    house: 2,
    rich: 0,
    jewel: 0,
    theater: 0,
    bank: 0,
    tavern: 1.5,
  },
  slum: {
    slum: 9,
    brothel: 1,
    gthief: 2,
    tavern: 1.5,
    rich: 0,
    house: .4,
    shop: .3,
  },
  industry: {
    tannery: 4,
    brewery: 3,
    warehouse: 4,
    manufact: 5,
    mine: 3,
    smith: 3,
    sawmill: 3,
    mill: 2,
    house: .4,
    rich: 0,
  },
  port: {
    shipyard: 8,
    warehouse: 6,
    tavern: 3,
    inn: 2,
    fishhut: 8,
    brothel: 1.5,
    house: .6,
    slum: 1.5,
    rich: 0,
    jewel: 0,
    bank: 0,
    theater: 0,
  },
};
function pick(z, big, u, dk) {
  const l = lists[z][big ? 1 : 0], m = KM[dk] || {};
  let tot = 0;
  const ws = l.map(([k, w]) => {
    const x =
      k == "garden" || ((k == "shipyard" || k == "fishhut") && dk != "port")
        ? 0
        : w * (m[k] === undefined ? 1 : m[k]);
    tot += x;
    return x;
  });
  if (!tot) return "house";
  let a = u * tot;
  for (let i = 0; i < l.length; i++) {
    a -= ws[i];
    if (a < 0) return l[i][0];
  }
  return l[0][0];
}
const LM = new Set(
  "cathedral castle estate academy mtower hospital arena hall temple market elder gmerch gmerc gmage galch gthief barracks prison court library theater bank school chapel"
    .split(" "),
);
const mixc = (h) =>
  "#" +
  [1, 3, 5].map((i) =>
    Math.round(
      parseInt(h.slice(i, i + 2), 16) * .3 +
        [0xc9, 0xb7, 0x9a][(i - 1) / 2] * .7,
    ).toString(16).padStart(2, "0")
  ).join("");
function setup() {
  const mixk = (h, k) =>
    "#" +
    [1, 3, 5].map((i) =>
      Math.round(
        parseInt(h.slice(i, i + 2), 16) * k +
          [0xc9, 0xb7, 0x9a][(i - 1) / 2] * (1 - k),
      ).toString(16).padStart(2, "0")
    ).join("");
  Object.values(T).forEach((d) => {
    d.mc = mixc(d.col);
    d.lc = mixk(d.col, .5);
  });
  lists = [0, 1, 2].map((z) =>
    [0, 1].map((b) =>
      Object.keys(T).filter((k) =>
        T[k].t <= tier && T[k].w[z] > 0 && BIG.has(k) == !!b
      ).map((k) => [k, T[k].w[z]])
    )
  );
  sums = lists.map((zz) => zz.map((l) => l.reduce((a, x) => a + x[1], 0)));
  PRD = [4, 5, 9, 12, 14, 16, 18][tier];
}
const area = (p) => {
  let a = 0;
  for (let i = 0; i < p.length; i++) {
    const u = p[i], v = p[(i + 1) % p.length];
    a += u[0] * v[1] - v[0] * u[1];
  }
  return a / 2;
};
function clip(p, nx, ny, c) {
  const o = [];
  for (let i = 0; i < p.length; i++) {
    const a = p[i],
      b = p[(i + 1) % p.length],
      da = nx * a[0] + ny * a[1] - c,
      db = nx * b[0] + ny * b[1] - c;
    if (da <= 0) o.push(a);
    if ((da < 0 && db > 0) || (da > 0 && db < 0)) {
      const t = da / (da - db);
      o.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
  }
  return o;
}
function inset(p, w) {
  let o = p;
  for (let i = 0; i < p.length && o.length > 2; i++) {
    const a = p[i],
      b = p[(i + 1) % p.length],
      dx = b[0] - a[0],
      dy = b[1] - a[1],
      l = Math.hypot(dx, dy) || 1,
      nx = dy / l,
      ny = -dx / l;
    o = clip(
      o,
      nx,
      ny,
      nx * a[0] + ny * a[1] - (typeof w == "function" ? w(i, a, b) : w),
    );
  }
  return o;
}
function split(p, tg, sr, out, dep) {
  const A = area(p);
  if (A < tg || dep > 6) {
    if (A > 5) out.push(p);
    return;
  }
  let bi = 0, bl = 0;
  for (let i = 0; i < p.length; i++) {
    const l = Math.hypot(
      p[(i + 1) % p.length][0] - p[i][0],
      p[(i + 1) % p.length][1] - p[i][1],
    );
    if (l > bl) {
      bl = l;
      bi = i;
    }
  }
  const a = p[bi],
    b = p[(bi + 1) % p.length],
    t = .35 + sr() * .3,
    mx = a[0] + (b[0] - a[0]) * t,
    my = a[1] + (b[1] - a[1]) * t,
    ang = Math.atan2(b[1] - a[1], b[0] - a[0]) + (sr() - .5) * .3,
    nx = Math.cos(ang),
    ny = Math.sin(ang),
    c = nx * mx + ny * my;
  split(clip(p, nx, ny, c), tg, sr, out, dep + 1);
  split(clip(p, -nx, -ny, -c), tg, sr, out, dep + 1);
}
function rp(x, y, w, h, a) {
  const c = Math.cos(a), s = Math.sin(a);
  return [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]]
    .map(([u, v]) => [x + u * c - v * s, y + u * s + v * c]);
}
function mkb(t, id, poly, o) {
  let cx = 0, cy = 0, r = 0;
  poly.forEach((p) => {
    cx += p[0];
    cy += p[1];
  });
  cx /= poly.length;
  cy /= poly.length;
  poly.forEach((p) => {
    r = Math.max(r, Math.hypot(p[0] - cx, p[1] - cy));
  });
  return { t, id, poly, o, cx, cy, r, A: Math.abs(area(poly)) };
}
const cen = (p) => [
  p.reduce((a, q) => a + q[0], 0) / p.length,
  p.reduce((a, q) => a + q[1], 0) / p.length,
];
function trees(p, sr) {
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  p.forEach((q) => {
    x0 = Math.min(x0, q[0]);
    x1 = Math.max(x1, q[0]);
    y0 = Math.min(y0, q[1]);
    y1 = Math.max(y1, q[1]);
  });
  const o = [], n = Math.min(45, Math.round(Math.abs(area(p)) / 14));
  for (let i = 0; i < n * 3 && o.length < n; i++) {
    const x = x0 + sr() * (x1 - x0), y = y0 + sr() * (y1 - y0);
    if (pip(p, x, y)) o.push([x, y]);
  }
  return o;
}
function bld(t, id, lo, sr, dn) {
  const n = lo.length;
  let bi = 0, bl = 0;
  for (let i = 0; i < n; i++) {
    const l = Math.hypot(
      lo[(i + 1) % n][0] - lo[i][0],
      lo[(i + 1) % n][1] - lo[i][1],
    );
    if (l > bl) {
      bl = l;
      bi = i;
    }
  }
  const a = lo[bi],
    b = lo[(bi + 1) % n],
    th = Math.atan2(b[1] - a[1], b[0] - a[0]),
    c = Math.cos(th),
    s = Math.sin(th),
    [cx, cy] = cen(lo);
  let u0 = 1e9, u1 = -1e9, v0 = 1e9, v1 = -1e9;
  lo.forEach((p) => {
    const u = (p[0] - cx) * c + (p[1] - cy) * s,
      v = (p[1] - cy) * c - (p[0] - cx) * s;
    u0 = Math.min(u0, u);
    u1 = Math.max(u1, u);
    v0 = Math.min(v0, v);
    v1 = Math.max(v1, v);
  });
  const W2 = (u, v) => [cx + u * c - v * s, cy + u * s + v * c],
    box = (u, v, w, h) =>
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([x, y]) =>
        W2(u + x * w, v + y * h)
      ),
    ins = (q) => q.every((p) => pip(lo, p[0], p[1]));
  const bg = BIG.has(t) || ["hall", "cathedral", "estate", "rich"].includes(t),
    hu = (u1 - u0) / 2,
    hv = (v1 - v0) / 2,
    mu = (u0 + u1) / 2,
    mid = sr() < .25 && !bg && !dn;
  let fw = bg ? .92 : dn ? .8 + sr() * .12 : .7 + sr() * .25,
    fh = bg ? .7 : dn ? .7 + sr() * .15 : .42 + sr() * .3,
    ok = 0,
    rc,
    uc,
    vc,
    hw,
    hh;
  for (let k = 0; k < 14 && !ok; k++) {
    hw = hu * fw;
    hh = hv * fh;
    vc = mid ? (v0 + v1) / 2 : v0 + (dn ? .3 : .7) + hh;
    uc = mu + (mid ? 0 : (sr() - .5) * (hu - hw));
    rc = box(uc, vc, hw, hh);
    ok = ins(rc);
    fw *= .93;
    fh *= .93;
  }
  if (!ok) {
    if (sr !== Math.random) return null;
    hw = hu * .5;
    hh = hv * .5;
    uc = mu;
    vc = (v0 + v1) / 2;
    rc = box(uc, vc, hw, hh);
  }
  const rcs = [rc],
    room = v1 - (vc + hh) - .4,
    r = sr(),
    big = bg || BIG.has(t),
    wing = (u, w, len) => {
      for (const f of [1, .6, .35]) {
        const q = box(u, vc + hh + len * f / 2 - .2, w, len * f / 2 + .2);
        if (ins(q)) {
          rcs.push(q);
          return;
        }
      }
    },
    annex = () => {
      for (const f of [1, .6]) {
        const q = box(
          uc + hw + hw * .3 * f,
          vc - hh + hh * .45 * f,
          hw * .3 * f,
          hh * .45 * f,
        );
        if (ins(q)) {
          rcs.push(q);
          return;
        }
      }
    };
  if (t == "cathedral") {
    rcs.length = 0;
    const nv = hh * .4;
    rcs.push(box(uc, vc, hw, nv), box(uc, vc, hw * .2, hh));
    const q = box(uc - hw * 1.12, vc, hw * .12, nv * .7);
    if (ins(q)) rcs.push(q);
  } else if (t == "mtower") {
    rcs.length = 0;
    const m = Math.min(hw, hh) * .65;
    rcs.push(box(uc, vc, m, m));
  } else if (dn) { if (r < .2) annex(); }
  else if (room > 1.8) {
    const len = Math.min(room * .9, hh * 1.4 + 1);
    if (r < (big ? .3 : .28)) wing(uc - hw + hw * .28, hw * .28, len);
    else if (r < (big ? .6 : .42)) {
      wing(uc - hw + hw * .22, hw * .22, len);
      wing(uc + hw - hw * .22, hw * .22, len);
    } else if (big && r < .75) wing(uc, hw * .25, len);
    else if (r < (big ? .9 : .6)) annex();
  } else if (r < .35) annex();
  const o = mkb(t, id, lo);
  o.rc = rc;
  o.rcs = rcs;
  return o;
}
