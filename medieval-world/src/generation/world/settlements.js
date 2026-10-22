/* ---- села: тип (хутір/село/велике село) і позиція; саму забудову будує генератор міст ---- */
const BC = 3000;
/* частота міст (параметр виміру «Міста»): імовірність міста в клітинці сітки; «немає» лишає лише села й хутори */
const CITY_P = { n: .62, r: .17, 0: 0 };
function nearBig(x, y, r) {
  for (
    let a = Math.floor((x - 700) / BC);
    a <= Math.floor((x + 700) / BC);
    a++
  ) {
    for (
      let b = Math.floor((y - 700) / BC);
      b <= Math.floor((y + 700) / BC);
      b++
    ) {
      const c = bigC(a, b);
      if (c && Math.hypot(c.x - x, c.y - y) < c.rad + r + 120) return true;
    }
  }
  return false;
}
/* міста й містечка: рідка сітка, розмір від містечка до столиці; якщо місця мало — менший розмір */
function bigC(i, j) {
  const key = "B" + i + "," + j, m = WLD.v;
  if (m.has(key)) return m.get(key);
  let v = null;
  const s = WLD.s;
  if (H2(i, j, s + 141) < (CITY_P[$("#wcities").value] ?? .62)) {
    const u = H2(i, j, s + 146),
      t0 = u < .45 ? 3 : u < .75 ? 4 : u < .92 ? 5 : 6;
    for (let t = 0; t < 3 && !v; t++) {
      const x = (i + .15 + H2(i, j, s + 142 + t * 7) * .7) * BC,
        y = (j + .15 + H2(i, j, s + 143 + t * 7) * .7) * BC;
      if (Math.hypot(x, y) < Rm * 1.7 + 700) continue;
      const p = tsamp(x, y, 4);
      if (!(p.E > .05 && p.E < .34 && p.rd > .01 && p.fo < .8)) continue;
      for (let tr = t0; tr >= 3 && !v; tr--) {
        const rad = RB[tr] * 1.35;
        if (
          !(riverBank(x, y) < rad) &&
          [[1, 0], [-1, 0], [0, 1], [0, -1], [.7, .7], [-.7, -.7], [.7, -.7], [
            -.7,
            .7,
          ]].every(([a, b]) => {
            const q = tsamp(x + a * rad * .8, y + b * rad * .8, 4);
            return q.E > .02 && q.E < .5 && q.rd > 0;
          })
        ) {
          v = {
            i,
            j,
            x,
            y,
            id: key,
            tier: tr,
            rad,
            bk: p.bk,
            name: cname(s + "v" + key),
            st: undefined,
            ed: null,
          };
        }
      }
    }
  }
  m.set(key, v);
  return v;
}
function village(i, j) {
  const key = i + "," + j, m = WLD.v;
  if (m.has(key)) return m.get(key);
  let v = null;
  const s = WLD.s;
  if (H2(i, j, s + 41) < .62) {
    const x = (i + .15 + H2(i, j, s + 42) * .7) * VC,
      y = (j + .15 + H2(i, j, s + 43) * .7) * VC;
    if (Math.hypot(x, y) > Rm * 1.7 + 300 && !nearBig(x, y, 70)) {
      const p = tsamp(x, y, 4);
      if (
        p.E > .05 && p.E < .4 && p.rv < .2 && p.fo < .7 &&
        !(riverBank(x, y) < 40)
      ) {
        const tr = H2(i, j, s + 46),
          tr2 = tr < .45 ? 0 : tr < .85 ? 1 : 2,
          rad = RB[tr2] * 1.3;
        if (
          [[1, 0], [-1, 0], [0, 1], [0, -1]].every(([a, b]) => {
            const q = tsamp(x + a * rad, y + b * rad, 4);
            return q.E > .02 && q.rv < .5;
          }) && !(riverBank(x, y) < rad * .8)
        ) {
          v = {
            i,
            j,
            x,
            y,
            id: key,
            tier: tr2,
            rad,
            bk: p.bk,
            name: cname(s + "v" + key),
            st: undefined,
            ed: null,
          };
        }
      }
    }
  }
  m.set(key, v);
  return v;
}
function vlist(x0, y0, x1, y1) {
  const o = [];
  for (let i = Math.floor(x0 / VC); i <= Math.floor(x1 / VC); i++) {
    for (let j = Math.floor(y0 / VC); j <= Math.floor(y1 / VC); j++) {
      const v = village(i, j);
      if (v) {
        o.push(v);
      }
    }
  }
  for (let i = Math.floor(x0 / BC); i <= Math.floor(x1 / BC); i++) {
    for (let j = Math.floor(y0 / BC); j <= Math.floor(y1 / BC); j++) {
      const v = bigC(i, j);
      if (v) {
        o.push(v);
      }
    }
  }
  return o;
}
/* Граф доріг між селами: «відносний сусідський граф» — дорога є, якщо між двома селами немає третього, ближчого до обох */
function vedges(v) {
  if (v.ed) return v.ed;
  const c = vlist(
      v.x - VC * 3.5,
      v.y - VC * 3.5,
      v.x + VC * 3.5,
      v.y + VC * 3.5,
    ).filter((w) => w !== v),
    o = [];
  for (const u of c) {
    const d = Math.hypot(u.x - v.x, u.y - v.y);
    if (d > VC * 3.4) continue;
    let ok = true;
    for (const w of c) {
      if (w === u) continue;
      if (
        Math.hypot(w.x - v.x, w.y - v.y) < d &&
        Math.hypot(w.x - u.x, w.y - u.y) < d
      ) {
        ok = false;
        break;
      }
    }
    if (ok) o.push(u);
  }
  return v.ed = o;
}
