/* ---- порти й морські шляхи між ними (п'ятий тип доріг) ----
   Порт: живе прибережне поселення з виходом у море (великі села й міста: їхні значки видно від масштабу .045). Шлях: пошук A* по клітинках води,
   кораблі тримаються біля берега (2–3 клітинки), у відкритому морі шлях дорожчий. Усе кешується в WLD.rx. */
const SR_R = 7500;
function srCache() {
  const r = rx();
  return r.sr || (r.sr = { path: new Map(), land: new Map(), fine: new Map() });
}
function srPort(v) {
  if (v.rxp !== undefined) return v.rxp;
  if (v.tier < 2 || rxState(v) != "normal") return v.rxp = null;
  for (const k of [1, 1.3, 1.7, 2.2, 3]) {
    for (let a = 0; a < 16; a++) {
      const x = v.x + Math.cos(a / 16 * PI2) * v.rad * k, y = v.y + Math.sin(a / 16 * PI2) * v.rad * k,
        p = tsamp(x, y, 4);
      if (p.E <= 0 && !p.lake && seaBody(x, y)) return v.rxp = { x, y, v };
    }
  }
  return v.rxp = null;
}
/* порти поруч: «відносний сусідський граф» як у наземних доріг — зв'язок є, якщо між двома портами немає третього, ближчого до обох */
function srEdges(v) {
  if (v.rxe) return v.rxe;
  const pa = srPort(v);
  if (!pa) return v.rxe = [];
  const c = vlist(v.x - SR_R, v.y - SR_R, v.x + SR_R, v.y + SR_R)
    .filter((w) => w !== v && Math.hypot(w.x - v.x, w.y - v.y) < SR_R).map(srPort).filter(Boolean),
    o = [];
  for (const u of c) {
    const d = Math.hypot(u.x - pa.x, u.y - pa.y);
    if (!c.some((w) => w !== u && Math.hypot(w.x - pa.x, w.y - pa.y) < d && Math.hypot(w.x - u.x, w.y - u.y) < d)) o.push(u);
  }
  return v.rxe = o;
}
/* клітинка проходима для кораблів: море, і вода справді навколо центра (ґратка груба, берег дрібніший) */
function srSea(i, j) {
  if (!(wetCell(i, j) && bodyOf(i, j) == 1)) return false;
  const m = srCache().fine, k = i + "," + j;
  let f = m.get(k);
  if (f === undefined) {
    const x = (i + .5) * WG, y = (j + .5) * WG, d = WG * .42;
    f = [[0, 0], [d, 0], [-d, 0], [0, d], [0, -d], [d, d], [-d, -d], [d, -d], [-d, d]].every(([a, b]) => tsamp(x + a, y + b, 4).E <= 0);
    m.set(k, f);
  }
  return f;
}
/* відстань до суші в клітинках (до 3): шляхи тримаються 2–3 клітинки від берега */
function srLand(i, j) {
  const m = srCache().land, k = i + "," + j;
  let d = m.get(k);
  if (d === undefined) {
    d = 4;
    for (let r = 1; r <= 3 && d == 4; r++) {
      for (let a = -r; a <= r && d == 4; a++) {
        if (!wetCell(i + a, j - r) || !wetCell(i + a, j + r) || !wetCell(i - r, j + a) || !wetCell(i + r, j + a)) d = r;
      }
    }
    m.set(k, d);
  }
  return d;
}
function srAstar(a, b) {
  const i0 = Math.floor(a.x / WG), j0 = Math.floor(a.y / WG), i1 = Math.floor(b.x / WG), j1 = Math.floor(b.y / WG),
    key = (i, j) => i + "," + j, open = [[0, i0, j0]], g = new Map([[key(i0, j0), 0]]), from = new Map();
  let n = 0;
  while (open.length && n++ < 4000) {
    let bi = 0;
    for (let k = 1; k < open.length; k++) if (open[k][0] < open[bi][0]) bi = k;
    const [, i, j] = open.splice(bi, 1)[0];
    if (i == i1 && j == j1) {
      const pts = [[b.x, b.y]];
      for (let c = key(i, j); from.has(c);) {
        const [ci, cj] = c.split(",").map(Number);
        pts.push([(ci + .5) * WG, (cj + .5) * WG]);
        c = from.get(c);
      }
      pts.push([a.x, a.y]);
      return pts.reverse();
    }
    for (const [da, db] of N8) {
      const ni = i + da, nj = j + db;
      if (!srSea(ni, nj) && !(ni == i1 && nj == j1) && !(ni == i0 && nj == j0)) continue;
      if (da && db && !(srSea(i + da, j) && srSea(i, j + db))) continue;
      const dl = srLand(ni, nj), cost = (da && db ? 1.41 : 1) * (dl <= 1 ? 1.5 : dl <= 3 ? 1 : 3),
        ng = g.get(key(i, j)) + cost, nk = key(ni, nj);
      if (ng < (g.has(nk) ? g.get(nk) : 1e9)) {
        g.set(nk, ng);
        from.set(nk, key(i, j));
        open.push([ng + Math.hypot(ni - i1, nj - j1), ni, nj]);
      }
    }
  }
  return null;
}
/* два проходи згладжування ламаної */
function srSmooth(p) {
  for (let t = 0; t < 2; t++) {
    p = p.map((q, i) => i == 0 || i == p.length - 1 ? q : [(p[i - 1][0] + q[0] * 2 + p[i + 1][0]) / 4, (p[i - 1][1] + q[1] * 2 + p[i + 1][1]) / 4]);
  }
  return p;
}
/* чи вся ламана у воді (перевірка через кожні ~40 м, крім перших і останніх 300 м біля портів) */
function srWet(p) {
  for (let i = 1; i < p.length; i++) {
    const [x0, y0] = p[i - 1], [x1, y1] = p[i], L = Math.hypot(x1 - x0, y1 - y0), n = Math.ceil(L / 40);
    for (let k = 0; k <= n; k++) {
      const t = k / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
      if (i == 1 && Math.hypot(x - p[0][0], y - p[0][1]) < 300 || i == p.length - 1 && Math.hypot(x - p[i][0], y - p[i][1]) < 300) continue;
      if (tsamp(x, y, 4).E > 0) return false;
    }
  }
  return true;
}
/* шлях між портами a і b (null — моря не з'єднані); undefined — ще не пораховано (бракує часу кадру) */
function srRoute(a, b) {
  const c = srCache().path, key = a.v.id < b.v.id ? a.v.id + ">" + b.v.id : b.v.id + ">" + a.v.id;
  if (c.has(key)) return c.get(key);
  if (!tick()) {
    WPEND = true;
    return undefined;
  }
  let pts = srAstar(a, b);
  /* згладжена лінія не має зрізати сушу: інакше лишаємо ламану по клітинках води, а якщо й вона зачіпає сушу — шляху немає */
  if (pts) {
    const sm = srSmooth(pts);
    pts = srWet(sm) ? sm : srWet(pts) ? pts : null;
  }
  const r = pts ? { pts, bb: null } : null;
  if (r) {
    const xs = r.pts.map((q) => q[0]), ys = r.pts.map((q) => q[1]);
    r.bb = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
  }
  c.set(key, r);
  return r;
}
