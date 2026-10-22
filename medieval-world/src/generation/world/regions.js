const RWT = [.6, .7, .85, 1, 1.3, 1.7, 2.2], MAXN = [1, 1, 1, 3, 8, 17, 27];
function adj(nm, fem) {
  const l = nm.slice(-1),
    a = l == "ь"
      ? nm + "ський"
      : l == "к"
      ? nm.slice(0, -1) + "цький"
      : l == "г"
      ? nm.slice(0, -1) + "зький"
      : l == "с"
      ? nm + "івський"
      : nm + "ський";
  return fem ? a.replace(/ий$/, "а") : a;
}
const regName = (h) => adj(h.name, 0) + " регіон",
  provName = (c) => adj(c.name, 1) + " провінція";
function hh() {
  const k = tier + "|" + $("#seed").value;
  if (WLD.hk !== k) {
    WLD.hk = k;
    WLD.hc = new Map();
    WLD.hd = {
      x: 0,
      y: 0,
      tier,
      rad: Rm,
      name: cname($("#seed").value),
      home: true,
    };
  }
  return WLD.hd;
}
function hbox(x0, y0, x1, y1) {
  const o = [], H = hh();
  for (let a = Math.floor(x0 / BC); a <= Math.floor(x1 / BC); a++) {
    for (let b = Math.floor(y0 / BC); b <= Math.floor(y1 / BC); b++) {
      const c = bigC(a, b);
      if (c) {
        o.push(c);
      }
    }
  }
  if (H.x >= x0 && H.x <= x1 && H.y >= y0 && H.y <= y1) o.push(H);
  return o;
}
function hlist(x, y) {
  const ci = Math.floor(x / 6000), cj = Math.floor(y / 6000);
  hh();
  const k = ci + "," + cj;
  let l = WLD.hc.get(k);
  if (!l) {
    l = hbox(
      ci * 6000 - 12000,
      cj * 6000 - 12000,
      ci * 6000 + 18000,
      cj * 6000 + 18000,
    );
    WLD.hc.set(k, l);
  }
  return l;
}
/* ==== РЕГІОНИ ПЕРШІ, ПРОВІНЦІЇ — ГРУПИ СУСІДНІХ РЕГІОНІВ ====
   1) Кожне місто (від містечка) має свій регіон: територія біля нього, межі м'яко викривлені шумом.
   2) Сусідство регіонів — граф Габріеля між містами; шлях через воду «коштує» дорожче, ніж по суші.
   3) Столиця — місто, поруч з яким (за вартістю шляху) немає сильнішої столиці. Решта міст належить найближчій столиці
      за вартістю шляху — тож провінція завжди суцільна група сусідніх регіонів, а її межа складається з меж регіонів.
   4) Ліміт регіонів залежить від розміру столиці (3 / 8 / 17 / 27); найближчі до столиці міста входять, зайві стають окремими провінціями. */
const WCP = [0, 0, 0, 0, 300, 700, 1200];
function nb(h) {
  const k = WLD.hk;
  if (h.nk === k) return h.nl;
  const P = hbox(h.x - 13500, h.y - 13500, h.x + 13500, h.y + 13500), o = [];
  for (const u of P) {
    if (u === h) continue;
    const d = Math.hypot(u.x - h.x, u.y - h.y);
    if (d > 9000) continue;
    const mx = (u.x + h.x) / 2, my = (u.y + h.y) / 2;
    let ok = true;
    for (const w of P) {
      if (w === u || w === h) continue;
      if (Math.hypot(w.x - mx, w.y - my) < d / 2) {
        ok = false;
        break;
      }
    }
    if (ok) {
      let wet = 0;
      for (let t = 1; t < 8; t++) {
        if (eland(h.x + (u.x - h.x) * t / 8, h.y + (u.y - h.y) * t / 8) <= 0) {
          wet++;
        }
      }
      o.push([u, d * (1 + 1.6 * wet / 7)]);
    }
  }
  h.nk = k;
  h.nl = o;
  return o;
}
function reach(h) {
  const k = WLD.hk;
  if (h.dk === k) return h.dm;
  const dist = new Map([[h, 0]]), done = new Set();
  for (;;) {
    let b = null, bd = 1e9;
    for (const [n, d] of dist) {
      if (!done.has(n) && d < bd) {
        bd = d;
        b = n;
      }
    }
    if (!b) break;
    done.add(b);
    for (const [u, c] of nb(b)) {
      const nd = bd + c;
      if (nd < 48000 && (!dist.has(u) || nd < dist.get(u))) dist.set(u, nd);
    }
  }
  h.dk = k;
  h.dm = dist;
  return dist;
}
function isCap(h) {
  const k = WLD.hk;
  if (h.ck === k) return h.cv;
  let v = true;
  if (h.tier < 6) {
    for (const [c, d] of reach(h)) {
      if (c.tier > h.tier && d < 26000 && isCap(c)) {
        v = false;
        break;
      }
    }
  }
  h.ck = k;
  h.cv = v;
  return v;
}
function rawCap(h) {
  const k = WLD.hk;
  if (h.rck === k) return h.rcv;
  let b = null, bd = 1e9;
  for (const [c, d] of reach(h)) {
    if (!isCap(c)) continue;
    const v = d - WCP[c.tier];
    if (v < bd) {
      bd = v;
      b = c;
    }
  }
  h.rck = k;
  h.rcv = b;
  return b;
}
function roster(c) {
  const k = WLD.hk;
  if (c.rk === k) return c.ro;
  const l = [];
  for (const [x, d] of reach(c)) {
    if (x !== c && !isCap(x) && rawCap(x) === c) l.push([d, x]);
  }
  l.sort((a, b) => a[0] - b[0]);
  c.ro = new Set(l.slice(0, MAXN[c.tier] - 1).map((a) => a[1]));
  c.rk = k;
  return c.ro;
}
function provOf(h) {
  const k = WLD.hk;
  if (h.pk === k) return h.pv;
  let pv = h;
  if (!isCap(h)) {
    const c = rawCap(h);
    if (c && roster(c).has(h)) pv = c;
  }
  h.pk = k;
  h.pv = pv;
  return pv;
}
const PV = (h) => h.iso ? h.pv : provOf(h);
/* малі острови / глушина: належать провінції, але не конкретному регіону */
function isl(pv) {
  if (pv.imk !== WLD.hk) {
    pv.im = { iso: true, pv, name: pv.name + "~", tier: 0, x: pv.x, y: pv.y };
    pv.imk = WLD.hk;
  }
  return pv.im;
}
/* рівні: ростуть із відстанню від (0,0) прямо по координатах (плавний шум ±10 %); монстри ≈ базовий рівень, NPC трохи нижчі */
function lvlAt(x, y) {
  const b = 1 + Math.hypot(x, y) / 800,
    r = fbm(x / 3000 + 61, y / 3000, WLD.s + 601, 2),
    q = fbm(x / 3000, y / 3000 + 62, WLD.s + 602, 2);
  return [
    Math.max(1, Math.round(b * (.9 + .2 * r))),
    Math.max(1, Math.round(b * (.55 + .3 * q))),
  ];
}
const lvl = (h) => lvlAt(h.x, h.y);
const provMem = (p) => isCap(p) ? [p, ...roster(p)] : [p];
/* рівень провінції = середнє значень рівня по точках її суші (ґратка навколо регіонів), тож залежить від форми провінції; lr — найменший і найбільший */
function provLv(p) {
  if (p.lk === WLD.hk) return p.lv;
  const pts = [];
  for (const h of provMem(p)) {
    for (const r of [0, 1100, 2300]) {
      for (const [a, b] of r ? [[1, 0], [-1, 0], [0, 1], [0, -1], [.7, .7], [-.7, -.7], [.7, -.7], [-.7, .7]] : [[0, 0]]) {
        const x = h.x + a * r, y = h.y + b * r;
        if (eland(x, y) > 0 && (!r || PV(regAt(x, y) || h) === p)) pts.push(lvlAt(x, y));
      }
    }
  }
  if (!pts.length) pts.push(lvl(p));
  p.lv = [0, 1].map((n) => Math.round(pts.reduce((s, v) => s + v[n], 0) / pts.length));
  const m = pts.map((v) => v[0]);
  p.lr = [Math.min(...m), Math.max(...m)];
  p.lk = WLD.hk;
  return p.lv;
}
const provLvl = (p) => provLv(p)[0];
const PAL = [
  [246, 190, 166],
  [184, 214, 160],
  [248, 226, 140],
  [198, 170, 216],
  [232, 170, 186],
  [168, 214, 196],
  [216, 198, 160],
  [170, 190, 230],
];
function provNeigh(p) {
  if (p.gk === WLD.hk) return p.gn;
  const st = new Set();
  for (const m of provMem(p)) {
    for (const [u] of nb(m)) {
      const q = provOf(u);
      if (q !== p) st.add(q);
    }
  }
  p.gk = WLD.hk;
  p.gn = [...st];
  return p.gn;
}
const prio = (p) => H2(Math.round(p.x), Math.round(p.y), WLD.s + 611);
function provIdx(p) {
  if (p.ik === WLD.hk) return p.ic;
  const used = new Set(), pp = prio(p);
  for (const q of provNeigh(p)) if (prio(q) < pp) used.add(provIdx(q));
  let c = 0;
  while (used.has(c)) c++;
  p.ik = WLD.hk;
  p.ic = c;
  return c;
}
const provCol = (p) => PAL[provIdx(p) % PAL.length];
const RW = [0, 0, 0, 0, 250, 500, 800];
/* регіон точки: найближче місто з адитивними вагами; координати «розхитані» шумом → межі органічні, а не прямі */
function regAt(x, y) {
  const sd = WLD.s,
    wx = x + (fbm(x / 2600 + 11, y / 2600, sd + 501, 3) - .5) * 3200,
    wy = y + (fbm(x / 2600, y / 2600 + 7, sd + 502, 3) - .5) * 3200;
  let best = null, bd = 1e9;
  for (const h of hlist(x, y)) {
    const dd = Math.hypot(h.x - wx, h.y - wy);
    if (dd > 10000) continue;
    const d = dd - RW[h.tier] - (isCap(h) ? 400 : 0);
    if (d < bd) {
      bd = d;
      best = h;
    }
  }
  if (best && eland(x, y) > 0) {
    let w = 0;
    for (let t = 1; t <= 5; t++) {
      if (eland(x + (best.x - x) * t / 6, y + (best.y - y) * t / 6) <= 0) w++;
    }
    if (w >= 3) return isl(provOf(best));
  }
  return best;
}
/* Територіальні води: від берега 2–3 км (змінюється шумом), далі — дикий океан зі своїм рівнем */
const terrW = (x, y) =>
  2000 +
  1000 * cl01((fbm(x / 7000 + 21, y / 7000 - 9, WLD.s + 503, 2) - .3) / .4);
/* Поле територіальних вод у світовій ґратці TC (не залежить від масштабу й вікна), плитки TN×TN кешуються в WLD.zt.
   G = відстань до суші мінус terrW; дикий океан — де в крузі радіуса RC є вузол із G>RC (морфологічне відкриття):
   закриті кишені між островами стають територією, відкритий океан не змінюється. terrZ>0 — територія, <0 — дикий океан */
const TC = 500, TN = 64, TH = 28, ZRC = 4500;
function zTile(ti, tj) {
  const key = ti + "," + tj;
  let t = WLD.zt.get(key);
  if (t) return t;
  const M = TN + 2 * TH,
    Dc = new Float32Array(M * M),
    G = new Float32Array(M * M),
    rc = ZRC / TC;
  for (let j = 0; j < M; j++) {
    for (let i = 0; i < M; i++) {
      Dc[j * M + i] =
        eland((ti * TN + i - TH) * TC, (tj * TN + j - TH) * TC) > 0 ? 0 : 1e9;
    }
  }
  for (let j = 0; j < M; j++) {
    for (let i = 0; i < M; i++) {
      const k = j * M + i;
      let d = Dc[k];
      if (i > 0) d = Math.min(d, Dc[k - 1] + 1);
      if (j > 0) {
        d = Math.min(d, Dc[k - M] + 1);
        if (i > 0) d = Math.min(d, Dc[k - M - 1] + 1.414);
        if (i < M - 1) d = Math.min(d, Dc[k - M + 1] + 1.414);
      }
      Dc[k] = d;
    }
  }
  for (let j = M - 1; j >= 0; j--) {
    for (let i = M - 1; i >= 0; i--) {
      const k = j * M + i;
      let d = Dc[k];
      if (i < M - 1) d = Math.min(d, Dc[k + 1] + 1);
      if (j < M - 1) {
        d = Math.min(d, Dc[k + M] + 1);
        if (i < M - 1) d = Math.min(d, Dc[k + M + 1] + 1.414);
        if (i > 0) d = Math.min(d, Dc[k + M - 1] + 1.414);
      }
      Dc[k] = d;
    }
  }
  for (let j = 0; j < M; j++) {
    for (let i = 0; i < M; i++) {
      G[j * M + i] = Math.min(Dc[j * M + i] * TC, 1e6) -
        terrW((ti * TN + i - TH) * TC, (tj * TN + j - TH) * TC);
    }
  }
  /* відстань до суші (м) у центральній частині плитки: море чи океан для розфарбування */
  const dc = new Float32Array(TN * TN);
  for (let j = 0; j < TN; j++) {
    for (let i = 0; i < TN; i++) dc[j * TN + i] = Dc[(j + TH) * M + i + TH] * TC;
  }
  WLD.zd.set(key, dc);
  t = new Float32Array(TN * TN);
  for (let j = TH; j < TH + TN; j++) {
    for (let i = TH; i < TH + TN; i++) {
      let m = -1e9;
      for (let dj = -rc; dj <= rc; dj++) {
        const w = Math.floor(Math.sqrt(rc * rc - dj * dj));
        for (let di = -w; di <= w; di++) {
          const v = G[(j + dj) * M + i + di];
          if (v > m) m = v;
        }
      }
      t[(j - TH) * TN + i - TH] = ZRC - m;
    }
  }
  WLD.zt.set(key, t);
  return t;
}
function zNode(i, j) {
  const ti = Math.floor(i / TN), tj = Math.floor(j / TN);
  return zTile(ti, tj)[(j - tj * TN) * TN + i - ti * TN];
}
function coastD(x, y) {
  const fx = x / TC, fy = y / TC, i = Math.floor(fx), j = Math.floor(fy), u = fx - i, v = fy - j,
    n = (a, b) => {
      const ti = Math.floor(a / TN), tj = Math.floor(b / TN);
      zTile(ti, tj);
      return WLD.zd.get(ti + "," + tj)[(b - tj * TN) * TN + a - ti * TN];
    };
  return n(i, j) * (1 - u) * (1 - v) + n(i + 1, j) * u * (1 - v) + n(i, j + 1) * (1 - u) * v + n(i + 1, j + 1) * u * v;
}
function terrZ(x, y) {
  const fx = x / TC,
    fy = y / TC,
    i = Math.floor(fx),
    j = Math.floor(fy),
    u = fx - i,
    v = fy - j;
  return zNode(i, j) * (1 - u) * (1 - v) + zNode(i + 1, j) * u * (1 - v) +
    zNode(i, j + 1) * (1 - u) * v + zNode(i + 1, j + 1) * u * v;
}
const isWild = (x, y) =>
  eland(x, y) <= 0 &&
  terrZ(x, y) <
    0; /* рівень дикого океану: ґратка 4 км, монстри трохи сильніші, NPC немає */
function oceanLv(x, y) {
  const l = lvl({
    x: Math.round(x / 4000) * 4000,
    y: Math.round(y / 4000) * 4000,
  });
  return [Math.round(l[0] * 1.25), 0];
}
/* висота суші без річок/озер (дешево): береги регіонів точно збігаються з берегом на карті.
   Малі водойми (озера, див. seaBody) рахуються землею регіону: без берегового контуру */
function eland(x, y) {
  const e = eBase(x, y, Math.hypot(x, y));
  return e <= 0 && !seaBody(x, y) ? .001 : e;
}
const HUE = new Map();
function hue(nm, sa, l) {
  const kk = nm + sa + l;
  let c = HUE.get(kk);
  if (!c) {
    let hv = 0;
    for (const ch of nm) hv = (hv * 37 + ch.charCodeAt(0)) % 360;
    const k = (n) => (n + hv / 30) % 12,
      a = sa * Math.min(l, 1 - l),
      f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
    c = [f(0), f(8), f(4)].map((v) => Math.round(v * 255));
    HUE.set(kk, c);
  }
  return c;
}
function provN(cap) {
  return isCap(cap) ? 1 + roster(cap).size : 1;
}
const PCOL = new Map();
function pcol(pv) {
  let c = PCOL.get(pv.name);
  if (!c) {
    let hv = 0;
    for (const ch of pv.name) hv = (hv * 37 + ch.charCodeAt(0)) % 360;
    const sa = .6,
      l = .6,
      k = (n) => (n + hv / 30) % 12,
      a = sa * Math.min(l, 1 - l),
      f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
    c = [f(0), f(8), f(4)].map((v) => Math.round(v * 255));
    PCOL.set(pv.name, c);
  }
  return c;
}
