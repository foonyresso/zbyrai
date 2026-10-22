/* ---- вода біля поселень світу: місто стає на берег моря, озера чи річки й підлаштовується під справжню лінію берега/русла ----
   siteWater(x, y, rad) шукає воду поруч і повертає зсунуту позицію міста (берег на відстані ~.55 rad від центру);
   coastSE(v) будує SE міста з реального берега світу (таблиця відстаней до води вздовж напрямку на воду);
   riverRV(v) бере русло з річок світу (WLD.rl). Далі працює той самий генератор міст, що й для рідного міста. */
const SW_DIRS = 16, SW_REACH = 1500;
const isWater = (x, y) => tsamp(x, y, 4).E <= 0;
/* перша вода вздовж променя від (x,y): відстань, уточнена бісекцією, або -1 */
function rayWater(x, y, ux, uy, max, step) {
  for (let t = step; t <= max; t += step) {
    if (isWater(x + ux * t, y + uy * t)) {
      let a = t - step, b = t;
      for (let k = 0; k < 5; k++) {
        const m = (a + b) / 2;
        isWater(x + ux * m, y + uy * m) ? (b = m) : (a = m);
      }
      return b;
    }
  }
  return -1;
}
/* найближчий берег води (моря, затоки чи озера) від точки: { a, d } — напрямок і відстань до води */
function nearWater(x, y) {
  let best = null;
  for (let k = 0; k < SW_DIRS; k++) {
    const a = k / SW_DIRS * PI2 + H2(Math.round(x), Math.round(y), WLD.s + 151) * .3,
      ux = Math.cos(a), uy = Math.sin(a), d = rayWater(x, y, ux, uy, SW_REACH, 100);
    if (d >= 0 && (!best || d < best.d)) best = { a, d };
  }
  return best;
}
/* найближча широка (від 5 м) річка світу: точка русла й ширина */
function nearRiver(x, y, reach) {
  ensureRivers(x, y);
  let best = null;
  for (const r of WLD.rl) {
    const b = r.bb;
    if (x < b[0] - reach || x > b[2] + reach || y < b[1] - reach || y > b[3] + reach) continue;
    for (let i = 0; i < r.pts.length; i++) {
      if (!r.dry[i] || r.w[i] < 5) continue;
      const d = Math.hypot(x - r.pts[i][0], y - r.pts[i][1]);
      if (d < reach && (!best || d < best.d)) best = { r, i, d };
    }
  }
  return best;
}
/* вода поруч із точкою: { water: "sea"|"river", a, d, p } або null; shiftSite ставить місто на берег */
function findWater(x, y) {
  const river = (nr) => ({ water: "river", a: 0, d: nr.d, p: nr.r.pts[nr.i], w: nr.r.w[nr.i] });
  const nr = nearRiver(x, y, 900);
  if (nr && nr.r.w[nr.i] >= 8 && H2(Math.round(x), Math.round(y), WLD.s + 152) < .5) return river(nr);
  const nw = nearWater(x, y);
  if (nw) return { water: "sea", a: nw.a, d: nw.d };
  return nr ? river(nr) : null;
}
function shiftSite(s, x, y, rad) {
  if (s.water == "sea") {
    const ux = Math.cos(s.a), uy = Math.sin(s.a), k = s.d - rad * .4;
    return [x + ux * k, y + uy * k];
  }
  const sx = x - s.p[0], sy = y - s.p[1], l = Math.hypot(sx, sy) || 1, off = s.w / 2 + rad * .3;
  return [s.p[0] + sx / l * off, s.p[1] + sy / l * off];
}
/* SE міста з реального берега: поперечна координата q → відстань від центру до води вздовж (ux,uy) */
function coastSE(v) {
  const a = v.wa, ux = Math.cos(a), uy = Math.sin(a), mx = Rm * 1.6 + 80, tab = [], st = 16, far = mx + 260;
  for (let q = -mx - 32; q <= mx + 32; q += st) {
    const bx = v.x - uy * q, by = v.y + ux * q, d = rayWater(bx, by, ux, uy, far, 12);
    tab.push(d < 0 ? far : d);
  }
  const deep = tsamp(v.x + ux * (Rm + 500), v.y + uy * (Rm + 500), 4).E < -.1;
  return {
    ux,
    uy,
    kind: deep && tier >= 3 ? "ocean" : "sea",
    D: tab[tab.length >> 1],
    a,
    sb: hs(seed + "sb"),
    bayR: 1e9,
    bayMax: 0,
    f: (q) => {
      const k = Math.max(0, Math.min(tab.length - 1.001, (q + mx + 32) / st)), i = Math.floor(k);
      return tab[i] + (tab[i + 1] - tab[i]) * (k - i);
    },
  };
}
/* русло міста з річки світу, у координатах міста */
function riverRV(v) {
  const nr = nearRiver(v.x, v.y, v.rad * 1.2);
  if (!nr) return null;
  const P = nr.r.pts, lim = Rm * 1.6 + 120, pts = [];
  const take = (i) => [P[i][0] - v.x, P[i][1] - v.y];
  let a = nr.i, b = nr.i;
  while (a > 0 && P[a - 1] && Math.hypot(P[a - 1][0] - v.x, P[a - 1][1] - v.y) < lim && nr.r.dry[a - 1]) a--;
  while (b < P.length - 1 && Math.hypot(P[b + 1][0] - v.x, P[b + 1][1] - v.y) < lim && nr.r.dry[b + 1]) b++;
  for (let i = a; i <= b; i++) pts.push(take(i));
  if (pts.length < 2) return null;
  const e = pts[pts.length - 1], s = pts[0], l = Math.hypot(e[0] - s[0], e[1] - s[1]) || 1;
  return { pts, w: Math.max(6, nr.r.w[nr.i]), f: { ux: (e[0] - s[0]) / l, uy: (e[1] - s[1]) / l, o: () => 0, sx: 0, sy: 0 } };
}
