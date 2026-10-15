// Tessera: ядро генератора візерунків із фігур. Без DOM: сцена (список фігур) будується тут, малюється на canvas і зберігається в SVG.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(); else root.TesseraCore = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const TAU = Math.PI * 2, SQ3 = Math.sqrt(3), MAX_CELLS = 150000, MAX_SHAPES = 260000;

  /* ---------- випадковість ---------- */
  function hashSeed(s) { s = String(s); let h = 1779033703 ^ s.length; for (let i = 0; i < s.length; i++) { h = Math.imul(h ^ s.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); } return h >>> 0; }
  function rng(seed) {
    let a = typeof seed === 'number' ? seed >>> 0 : hashSeed(seed);
    return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  const randSeed = () => Math.random().toString(36).slice(2, 8).padEnd(6, '0');

  /* ---------- геометрія ---------- */
  const regPoly = (cx, cy, R, n, a0) => { a0 = a0 === undefined ? -Math.PI / 2 : a0; const o = []; for (let i = 0; i < n; i++) { const a = a0 + i * TAU / n; o.push(cx + R * Math.cos(a), cy + R * Math.sin(a)); } return o; };
  function areaCentroid(p) {
    let A = 0, cx = 0, cy = 0; const n = p.length / 2;
    for (let i = 0; i < n; i++) { const j = (i + 1) % n, x0 = p[2 * i], y0 = p[2 * i + 1], x1 = p[2 * j], y1 = p[2 * j + 1], f = x0 * y1 - x1 * y0; A += f; cx += (x0 + x1) * f; cy += (y0 + y1) * f; }
    if (Math.abs(A) < 1e-12) { let sx = 0, sy = 0; for (let i = 0; i < n; i++) { sx += p[2 * i]; sy += p[2 * i + 1]; } return [sx / n, sy / n]; }
    return [cx / (3 * A), cy / (3 * A)];
  }
  function minApothem(p, cx, cy) {
    let m = Infinity; const n = p.length / 2;
    for (let i = 0; i < n; i++) { const j = (i + 1) % n, ax = p[2 * i], ay = p[2 * i + 1], ex = p[2 * j] - ax, ey = p[2 * j + 1] - ay, len = Math.hypot(ex, ey); if (len < 1e-9) continue; const d = Math.abs((cx - ax) * ey - (cy - ay) * ex) / len; if (d < m) m = d; }
    return m;
  }
  function shrink(p, g) {
    if (!(g > 0)) return p;
    const c = areaCentroid(p), a = minApothem(p, c[0], c[1]); if (!(a > 1e-9)) return p;
    const f = Math.max(.04, (a - g / 2) / a), o = new Array(p.length);
    for (let i = 0; i < p.length; i += 2) { o[i] = c[0] + (p[i] - c[0]) * f; o[i + 1] = c[1] + (p[i + 1] - c[1]) * f; }
    return o;
  }
  function transformPoly(p, cx, cy, ang, sc) { const c = Math.cos(ang), s = Math.sin(ang), o = new Array(p.length); for (let i = 0; i < p.length; i += 2) { const x = (p[i] - cx) * sc, y = (p[i + 1] - cy) * sc; o[i] = cx + x * c - y * s; o[i + 1] = cy + x * s + y * c; } return o; }
  function pointInPoly(x, y, p) { let ins = false; const n = p.length / 2; for (let i = 0, j = n - 1; i < n; j = i++) { const xi = p[2 * i], yi = p[2 * i + 1], xj = p[2 * j], yj = p[2 * j + 1]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) ins = !ins; } return ins; }
  const span = (a0, a1, st) => [Math.floor(a0 / st) - 1, Math.ceil(a1 / st) + 1];

  /* ---------- щільна упаковка правильних n-кутників (чисельний пошук) ---------- */
  function satOverlap(a, b) {
    for (const poly of [a, b]) {
      const n = poly.length / 2;
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n, ex = poly[2 * j] - poly[2 * i], ey = poly[2 * j + 1] - poly[2 * i + 1], nx = -ey, ny = ex;
        let a0 = Infinity, a1 = -Infinity, b0 = Infinity, b1 = -Infinity;
        for (let k = 0; k < a.length; k += 2) { const d = a[k] * nx + a[k + 1] * ny; if (d < a0) a0 = d; if (d > a1) a1 = d; }
        for (let k = 0; k < b.length; k += 2) { const d = b[k] * nx + b[k + 1] * ny; if (d < b0) b0 = d; if (d > b1) b1 = d; }
        const l = Math.hypot(nx, ny) || 1;
        if (a1 - b0 <= 1e-7 * l || b1 - a0 <= 1e-7 * l) return false;
      }
    }
    return true;
  }
  const packCache = {};
  function packParams(n) {
    if (packCache[n]) return packCache[n];
    const a0 = -Math.PI / 2; let best = null;
    const cellPoly = (i, j, hx, vy, fl) => regPoly(i * hx + (j & 1) * hx / 2, j * vy, 1, n, a0 + (((i + j) & 1) ? fl : 0));
    const ok = (hx, vy, fl) => {
      for (const [bi, bj] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
        const A = cellPoly(bi, bj, hx, vy, fl);
        for (let di = -2; di <= 2; di++) for (let dj = -2; dj <= 2; dj++) { if (!di && !dj) continue; if (satOverlap(A, cellPoly(bi + di, bj + dj, hx, vy, fl))) return false; }
      }
      return true;
    };
    for (const fl of [0, Math.PI, Math.PI / n]) for (let vy = .5; vy <= 2.2; vy += .04) {
      let lo = .3, hi = 2.6; if (!ok(hi, vy, fl)) continue;
      for (let it = 0; it < 16; it++) { const mid = (lo + hi) / 2; if (ok(mid, vy, fl)) hi = mid; else lo = mid; }
      if (!best || hi * vy < best.area) best = { hx: hi, vy, fl, area: hi * vy };
    }
    best.hx *= 1.002; best.vy *= 1.002;
    return (packCache[n] = best);
  }

  /* ---------- генератори візерунків ---------- */
  // c = { S: розмір, G: відстань, K: форма, box: [x0,y0,x1,y1], E: випуск фігур, P: S+G }
  function family(c, angDeg, P, cb) {
    const [x0, y0, x1, y1] = c.box, a = angDeg * Math.PI / 180, dx = Math.cos(a), dy = Math.sin(a), nx = -dy, ny = dx;
    let mn = Infinity, mx = -Infinity;
    for (const [px, py] of [[x0, y0], [x1, y0], [x0, y1], [x1, y1]]) { const t = px * nx + py * ny; if (t < mn) mn = t; if (t > mx) mx = t; }
    const L = Math.hypot(Math.max(Math.abs(x0), Math.abs(x1)), Math.max(Math.abs(y0), Math.abs(y1))) + P;
    for (let i = Math.floor(mn / P) - 1; i <= Math.ceil(mx / P) + 1; i++) { const t = i * P, px = nx * t, py = ny * t; cb(i, [px - dx * L, py - dy * L, px + dx * L, py + dy * L]); }
  }
  function symbolGrid(c, make, stagger) {
    const { box: [x0, y0, x1, y1], E, P } = c, [j0, j1] = span(y0, y1, P);
    for (let j = j0; j <= j1; j++) { const off = stagger ? (j & 1) * P / 2 : 0, [i0, i1] = span(x0 - off, x1 - off, P); for (let i = i0; i <= i1; i++) make(i * P + off, j * P, i, j); }
  }
  function starPts(cx, cy, R, r, n, a0) { const o = []; for (let i = 0; i < 2 * n; i++) { const a = (a0 === undefined ? -Math.PI / 2 : a0) + i * Math.PI / n, rr = i % 2 ? r : R; o.push(cx + rr * Math.cos(a), cy + rr * Math.sin(a)); } return o; }
  function plusPts(cx, cy, h, t, rot) { const a = t / 2, q = [[-a, -h], [a, -h], [a, -a], [h, -a], [h, a], [a, a], [a, h], [-a, h], [-a, a], [-h, a], [-h, -a], [-a, -a]], c = Math.cos(rot || 0), s = Math.sin(rot || 0), o = []; for (const [x, y] of q) o.push(cx + x * c - y * s, cy + x * s + y * c); return o; }
  function heartPts(cx, cy, s) { const o = []; for (let i = 0; i < 40; i++) { const t = i / 40 * TAU, x = 16 * Math.pow(Math.sin(t), 3), y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)); o.push(cx + x / 17 * s, cy + (y + 2) / 17 * s); } return o; }
  function ellipsePts(cx, cy, rx, ry, ang, n) { const o = [], c = Math.cos(ang), s = Math.sin(ang); for (let i = 0; i < n; i++) { const t = i / n * TAU, x = rx * Math.cos(t), y = ry * Math.sin(t); o.push(cx + x * c - y * s, cy + x * s + y * c); } return o; }
  function wavePoly(c, i, P, lam, A, tri, vertical) {
    const [x0, y0, x1, y1] = c.box, lo = vertical ? y0 : x0, hi = vertical ? y1 : x1, step = tri ? lam / 2 : lam / 10, pts = [];
    for (let u = Math.floor(lo / step) * step - lam; u <= hi + lam; u += step) {
      const ph = tri ? (Math.round(u / step) % 2 ? 1 : -1) : Math.sin(TAU * u / lam), v = i * P + A * ph;
      if (vertical) pts.push(v, u); else pts.push(u, v);
    }
    return pts;
  }

  const PATTERNS = [
    /* --- щільні мозаїки --- */
    { id: 'hex', group: 'tile', name: 'Соти', desc: 'Правильні шестикутники: ідеальна мозаїка без щілин.', inset: true, size: 40,
      gen(c) { const { S, box: [x0, y0, x1, y1], E } = c, R = S / SQ3, dy = S * SQ3 / 2, [j0, j1] = span(y0, y1, dy); for (let j = j0; j <= j1; j++) { const off = (j & 1) * S / 2, [i0, i1] = span(x0 - off, x1 - off, S); for (let i = i0; i <= i1; i++) E.p(regPoly(i * S + off, j * dy, R, 6), i, j); } } },
    { id: 'tri', group: 'tile', name: 'Трикутники', desc: 'Рівносторонні трикутники, що лягають без щілин.', inset: true, size: 44,
      gen(c) { const { S, box: [x0, y0, x1, y1], E } = c, h = S * SQ3 / 2, [b0, b1] = span(y0, y1, h); for (let b = b0; b <= b1; b++) { const [a0, a1] = span(x0 - b * S / 2, x1 - b * S / 2, S), P = (a, bb) => [a * S + bb * S / 2, bb * h]; for (let a = a0; a <= a1; a++) { const p = P(a, b), q = P(a + 1, b), r = P(a, b + 1), s = P(a + 1, b + 1); E.p([p[0], p[1], q[0], q[1], r[0], r[1]], a, b, 0); E.p([q[0], q[1], s[0], s[1], r[0], r[1]], a, b, 1); } } } },
    { id: 'square', group: 'tile', name: 'Квадрати', desc: 'Квадратна сітка плиток.', inset: true, size: 40,
      gen(c) { const { S, box: [x0, y0, x1, y1], E } = c, [i0, i1] = span(x0, x1, S), [j0, j1] = span(y0, y1, S); for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) E.p([i * S, j * S, (i + 1) * S, j * S, (i + 1) * S, (j + 1) * S, i * S, (j + 1) * S], i, j); } },
    { id: 'rect', group: 'tile', name: 'Прямокутники', desc: 'Прямокутні плитки. Повзунок «Висота до ширини» міняє пропорції.', inset: true, size: 44, k: { label: 'Висота до ширини, %', min: 20, max: 300, def: 50, step: 5 },
      gen(c) { const { S, K, box: [x0, y0, x1, y1], E } = c, h = S * K / 100, [i0, i1] = span(x0, x1, S), [j0, j1] = span(y0, y1, h); for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) E.p([i * S, j * h, (i + 1) * S, j * h, (i + 1) * S, (j + 1) * h, i * S, (j + 1) * h], i, j); } },
    { id: 'rhomb', group: 'tile', name: 'Ромби', desc: 'Ромби, що лягають у діагональну сітку. Повзунок міняє витягнутість.', inset: true, size: 44, k: { label: 'Висота до ширини, %', min: 30, max: 250, def: 100, step: 5 },
      gen(c) { const { S, K, box: [x0, y0, x1, y1], E } = c, h = S * K / 100, [j0, j1] = span(y0, y1, h / 2); for (let j = j0; j <= j1; j++) { const off = (j & 1) * S / 2, [i0, i1] = span(x0 - off, x1 - off, S); for (let i = i0; i <= i1; i++) { const cx = i * S + off, cy = j * h / 2; E.p([cx, cy - h / 2, cx + S / 2, cy, cx, cy + h / 2, cx - S / 2, cy], i, j); } } } },
    { id: 'brick', group: 'tile', name: 'Цегла', desc: 'Цегляна кладка з півкрокового зсуву.', inset: true, size: 56, k: { label: 'Висота цеглини, %', min: 20, max: 150, def: 45, step: 5 },
      gen(c) { const { S, K, box: [x0, y0, x1, y1], E } = c, h = S * K / 100, [j0, j1] = span(y0, y1, h); for (let j = j0; j <= j1; j++) { const off = (j & 1) * S / 2, [i0, i1] = span(x0 - off, x1 - off, S); for (let i = i0; i <= i1; i++) { const x = i * S + off; E.p([x, j * h, x + S, j * h, x + S, (j + 1) * h, x, (j + 1) * h], i, j); } } } },
    { id: 'weave', group: 'tile', name: 'Плетіння', desc: 'Квадратні блоки з планок: горизонтальні й вертикальні по черзі, як у кошику.', inset: true, size: 56, k: { label: 'Планок у блоці', min: 2, max: 6, def: 3, step: 1 },
      gen(c) { const { S, K, box: [x0, y0, x1, y1], E } = c, [i0, i1] = span(x0, x1, S), [j0, j1] = span(y0, y1, S), n = Math.round(K), w = S / n; for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { const hor = ((i + j) & 1) === 0; for (let k = 0; k < n; k++) { const x = i * S, y = j * S; if (hor) E.p([x, y + k * w, x + S, y + k * w, x + S, y + (k + 1) * w, x, y + (k + 1) * w], i, j, k); else E.p([x + k * w, y, x + (k + 1) * w, y, x + (k + 1) * w, y + S, x + k * w, y + S], i, j, k); } } } },
    { id: 'herring', group: 'tile', name: 'Ялинка', desc: 'Паркетна «ялинка» з цеглин 2:1, покладених по діагоналі.', inset: true, size: 60,
      gen(c) { const { S, box: [x0, y0, x1, y1], E } = c, u = S / 2, [k0, k1] = [Math.floor(-y1 / u) - 3, Math.ceil(-y0 / u) + 3]; for (let k = k0; k <= k1; k++) { const [m0, m1] = [Math.floor((x0 / u - k) / 4) - 1, Math.ceil((x1 / u - k) / 4) + 1]; for (let m = m0; m <= m1; m++) { const X = (k + 4 * m) * u, Y = -k * u; E.p([X, Y, X + 2 * u, Y, X + 2 * u, Y + u, X, Y + u], m, k, 0); E.p([X + 2 * u, Y, X + 3 * u, Y, X + 3 * u, Y + 2 * u, X + 2 * u, Y + 2 * u], m, k, 1); } } } },
    { id: 'cairo', group: 'tile', name: 'П’ятикутники (Каїр)', desc: 'Каїрська мозаїка: справжня суцільна мозаїка з п’ятикутників без щілин.', inset: true, size: 60,
      gen(c) {
        const { S, box: [x0, y0, x1, y1], E } = c, a = (4 - Math.sqrt(7)) / 6, [i0, i1] = span(x0, x1, S), [j0, j1] = span(y0, y1, S);
        const put = (pts, ox, oy, i, j, co, tr) => { const o = []; for (let k = 0; k < pts.length; k += 2) { const x = tr ? pts[k + 1] : pts[k], y = tr ? pts[k] : pts[k + 1]; o.push(ox + x * S, oy + y * S); } E.p(o, i, j, co); };
        for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
          const ox = i * S, oy = j * S, top = [0, 1, a, .5, 1 - a, .5, 1, 1, .5, 1 + a], bot = [0, 0, a, .5, 1 - a, .5, 1, 0, .5, -a];
          if (((i + j) & 1) === 0) { put(top, ox, oy, i, j, 0, false); put(bot, ox, oy, i, j, 1, false); } else { put(top, ox, oy, i, j, 2, true); put(bot, ox, oy, i, j, 3, true); }
        }
      } },
    { id: 'ngon', group: 'tile', name: 'Щільні багатокутники', desc: 'Правильні n-кутники, покладені якнайщільніше (5, 7, 9… кутників мозаїки не мають, тож між ними лишаються зазори). Повзунок задає кількість сторін.', inset: true, size: 46, k: { label: 'Кількість сторін', min: 3, max: 12, def: 5, step: 1 },
      gen(c) {
        const { S, K, box: [x0, y0, x1, y1], E } = c, n = Math.round(K);
        if (n === 3) return PAT.tri.gen(c); if (n === 4) return PAT.square.gen(c); if (n === 6) return PAT.hex.gen(c);
        const pk = packParams(n), R = S / 2, hx = pk.hx * R, vy = pk.vy * R, [j0, j1] = span(y0, y1, vy);
        for (let j = j0; j <= j1; j++) { const off = (j & 1) * hx / 2, [i0, i1] = span(x0 - off, x1 - off, hx); for (let i = i0; i <= i1; i++) E.p(regPoly(i * hx + off, j * vy, R, n, -Math.PI / 2 + (((i + j) & 1) ? pk.fl : 0)), i, j); }
      } },
    { id: 'octsq', group: 'tile', name: 'Вісімкутники й квадрати', desc: 'Вісімкутники самі мозаїки не дають, тому проміжки заповнюють квадратами (мозаїка 4.8.8).', inset: true, size: 56,
      gen(c) { const { S, box: [x0, y0, x1, y1], E } = c, a = S / (1 + Math.SQRT2), R8 = a / (2 * Math.sin(Math.PI / 8)), [i0, i1] = span(x0, x1, S), [j0, j1] = span(y0, y1, S); for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { E.p(regPoly(i * S, j * S, R8, 8, Math.PI / 8), i, j, 0); E.p(regPoly((i + .5) * S, (j + .5) * S, a / Math.SQRT2, 4, 0), i, j, 1); } } },
    { id: 'trihex', group: 'tile', name: 'Шестикутники й трикутники', desc: 'Шестикутники з трикутниками між ними (мозаїка 3.6.3.6, «кагоме»).', inset: true, size: 60,
      gen(c) { const { S, box: [x0, y0, x1, y1], E } = c, a = S / 2, h = SQ3 * a / 2, [j0, j1] = span(y0, y1, SQ3 * a); for (let j = j0; j <= j1; j++) { const [i0, i1] = span(x0 - j * a, x1 - j * a, 2 * a); for (let i = i0; i <= i1; i++) { const cx = (2 * i + j) * a, cy = j * SQ3 * a; E.p(regPoly(cx, cy, a, 6, 0), i, j, 0); E.p([cx + a, cy, cx + a / 2, cy + h, cx + 1.5 * a, cy + h], i, j, 1); E.p([cx + 1.5 * a, cy + h, cx + 2.5 * a, cy + h, cx + 2 * a, cy + 2 * h], i, j, 2); } } } },
    { id: 'cubes', group: 'tile', name: 'Кубики (ромбова мозаїка)', desc: 'Три ромби в кожних сотах створюють об’ємні кубики. Кожна грань має свій колір.', inset: true, size: 50,
      gen(c) { const { S, box: [x0, y0, x1, y1], E } = c, R = S / SQ3, dy = S * SQ3 / 2, [j0, j1] = span(y0, y1, dy); for (let j = j0; j <= j1; j++) { const off = (j & 1) * S / 2, [i0, i1] = span(x0 - off, x1 - off, S); for (let i = i0; i <= i1; i++) { const cx = i * S + off, cy = j * dy, v = regPoly(cx, cy, R, 6); for (let f = 0; f < 3; f++) { const k = f * 2; E.p([cx, cy, v[2 * k], v[2 * k + 1], v[2 * ((k + 1) % 6)], v[2 * ((k + 1) % 6) + 1], v[2 * ((k + 2) % 6)], v[2 * ((k + 2) % 6) + 1]], i, j, f); } } } } },

    /* --- кола, луска, хвилі --- */
    { id: 'circ', group: 'round', name: 'Кружечки в ряд', desc: 'Кола в квадратній сітці: кружечок до кружечка.', inset: true, size: 36,
      gen(c) { const { S, G, box: [x0, y0, x1, y1], E } = c, [i0, i1] = span(x0, x1, S), [j0, j1] = span(y0, y1, S); for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) E.o((i + .5) * S, (j + .5) * S, Math.max(.5, S / 2 - G / 2), i, j); } },
    { id: 'circhex', group: 'round', name: 'Кола щільно', desc: 'Кола в шестикутній упаковці: найщільніше розташування.', inset: true, size: 36,
      gen(c) { const { S, G, box: [x0, y0, x1, y1], E } = c, dy = S * SQ3 / 2, [j0, j1] = span(y0, y1, dy); for (let j = j0; j <= j1; j++) { const off = (j & 1) * S / 2, [i0, i1] = span(x0 - off, x1 - off, S); for (let i = i0; i <= i1; i++) E.o(i * S + off, j * dy, Math.max(.5, S / 2 - G / 2), i, j); } } },
    { id: 'scales', group: 'round', name: 'Луска', desc: 'Кола, що перекривають одне одного рядами, як риб’яча луска.', inset: false, size: 40,
      gen(c) { const { P, box: [x0, y0, x1, y1], E } = c, [j0, j1] = span(y0, y1, P / 2); for (let j = j0; j <= j1; j++) { const off = (j & 1) * P / 2, [i0, i1] = span(x0 - off, x1 - off, P); for (let i = i0; i <= i1; i++) E.o(i * P + off, j * P / 2, P / 2, i, j); } } },
    { id: 'seigaiha', group: 'round', name: 'Хвилі (сейгайха)', desc: 'Японські хвилі: луска з концентричних дуг. Повзунок задає кількість дуг.', inset: false, size: 46, k: { label: 'Кількість дуг', min: 1, max: 6, def: 3, step: 1 },
      gen(c) { const { P, K, box: [x0, y0, x1, y1], E } = c, n = Math.round(K), [j0, j1] = span(y0, y1, P / 2); for (let j = j0; j <= j1; j++) { const off = (j & 1) * P / 2, [i0, i1] = span(x0 - off, x1 - off, P); for (let i = i0; i <= i1; i++) for (let r = 0; r < n; r++) E.o(i * P + off, j * P / 2, P / 2 * (1 - r / n), i, j, r); } } },
    { id: 'target', group: 'round', name: 'Мішені', desc: 'Концентричні кола в сітці. Повзунок задає кількість кілець.', inset: false, size: 56, k: { label: 'Кількість кілець', min: 1, max: 8, def: 3, step: 1 },
      gen(c) { const { P, K, box: [x0, y0, x1, y1], E } = c, n = Math.round(K); symbolGrid(c, (x, y, i, j) => { for (let r = 0; r < n; r++) E.o(x, y, P / 2 * .94 * (1 - r / n), i, j, r); }, false); } },
    { id: 'spiral', group: 'round', name: 'Спіралі', desc: 'Спіралі в сітці. Повзунок задає кількість витків.', inset: false, size: 60, k: { label: 'Кількість витків', min: 1, max: 8, def: 3, step: 1 },
      gen(c) { const { S, K, E } = c; symbolGrid(c, (x, y, i, j) => { const pts = [], steps = Math.round(K * 36); for (let s = 0; s <= steps; s++) { const t = s / steps, a = t * K * TAU; pts.push(x + S / 2 * .94 * t * Math.cos(a), y + S / 2 * .94 * t * Math.sin(a)); } E.l(pts, i, j); }, false); } },

    /* --- лінії --- */
    { id: 'hlines', group: 'lines', name: 'Горизонтальні лінії', desc: 'Прості горизонтальні смуги. Поворот перетворює їх на косі.', inset: false, line: true, size: 24,
      gen(c) { family(c, 0, c.P, (i, l) => c.E.l(l, i, 0)); } },
    { id: 'vlines', group: 'lines', name: 'Вертикальні лінії', desc: 'Вертикальні смуги.', inset: false, line: true, size: 24,
      gen(c) { family(c, 90, c.P, (i, l) => c.E.l(l, i, 0)); } },
    { id: 'dlines', group: 'lines', name: 'Косі лінії', desc: 'Діагональні смуги під 45°. Поворот міняє нахил.', inset: false, line: true, size: 24,
      gen(c) { family(c, 45, c.P, (i, l) => c.E.l(l, i, 0)); } },
    { id: 'hatch', group: 'lines', name: 'Навхрест', desc: 'Дві сім’ї діагональних ліній, що перетинаються (штрихування).', inset: false, line: true, size: 24,
      gen(c) { family(c, 45, c.P, (i, l) => c.E.l(l, i, 0)); family(c, -45, c.P, (i, l) => c.E.l(l, i, 1)); } },
    { id: 'waves', group: 'lines', name: 'Хвилясті лінії', desc: 'Синусоїдні лінії. Повзунок задає висоту хвилі.', inset: false, line: true, size: 28, k: { label: 'Висота хвилі, %', min: 5, max: 100, def: 40, step: 5 },
      gen(c) { const { P, K } = c, [j0, j1] = span(c.box[1], c.box[3], P); for (let i = j0; i <= j1; i++) c.E.l(wavePoly(c, i, P, P * 3, P * K / 100, false, false), i, 0); } },
    { id: 'zigzag', group: 'lines', name: 'Зиґзаґ', desc: 'Ламані лінії-зиґзаґи. Повзунок задає висоту зубців.', inset: false, line: true, size: 28, k: { label: 'Висота зубців, %', min: 5, max: 100, def: 40, step: 5 },
      gen(c) { const { P, K } = c, [j0, j1] = span(c.box[1], c.box[3], P); for (let i = j0; i <= j1; i++) c.E.l(wavePoly(c, i, P, P * 2, P * K / 100, true, false), i, 0); } },
    { id: 'crosswaves', group: 'lines', name: 'Хвилі навхрест', desc: 'Хвилясті лінії в двох напрямках: плетиво хвиль.', inset: false, line: true, size: 36, k: { label: 'Висота хвилі, %', min: 5, max: 100, def: 35, step: 5 },
      gen(c) { const { P, K } = c, [j0, j1] = span(c.box[1], c.box[3], P), [i0, i1] = span(c.box[0], c.box[2], P); for (let i = j0; i <= j1; i++) c.E.l(wavePoly(c, i, P, P * 3, P * K / 100, false, false), i, 0); for (let i = i0; i <= i1; i++) c.E.l(wavePoly(c, i, P, P * 3, P * K / 100, false, true), i, 1); } },

    /* --- зошит і сітки --- */
    { id: 'notebook', group: 'paper', name: 'Зошитна клітинка', desc: 'Як у шкільному зошиті: ледь помітні сині лінії на білому тлі.', inset: false, line: true, size: 24,
      preset: { bg: '#ffffff', colors: ['#c6dcf3', '#c6dcf3', '#c6dcf3', '#c6dcf3', '#c6dcf3', '#c6dcf3'], ncol: 1, cmode: 'single', stroke: 1, gap: 0, mode: 'outline' },
      gen(c) { family(c, 0, c.P, (i, l) => c.E.l(l, i, 0)); family(c, 90, c.P, (i, l) => c.E.l(l, i, 0)); } },
    { id: 'ruled', group: 'paper', name: 'Лінійка зошита', desc: 'Лінії зошита в лінійку з червоним полем ліворуч.', inset: false, line: true, size: 28,
      preset: { bg: '#ffffff', colors: ['#c6dcf3', '#ee9a9a', '#c6dcf3', '#c6dcf3', '#c6dcf3', '#c6dcf3'], ncol: 2, cmode: 'single', stroke: 1, gap: 0, mode: 'outline' },
      gen(c) { family(c, 0, c.P, (i, l) => c.E.l(l, i, 0, 0)); const x = c.box[0] + 3 * c.P; c.E.l([x, c.box[1] - c.P, x, c.box[3] + c.P], 0, 0, 1, 1.4); } },
    { id: 'graph', group: 'paper', name: 'Міліметрівка', desc: 'Дрібна сітка з виділеною кожною п’ятою лінією.', inset: false, line: true, size: 50,
      preset: { bg: '#fffdf8', colors: ['#e7b9b9', '#d98a8a', '#e7b9b9', '#e7b9b9', '#e7b9b9', '#e7b9b9'], ncol: 2, cmode: 'single', stroke: 1, gap: 0, mode: 'outline' },
      gen(c) { const f = c.P / 5; for (const ang of [0, 90]) family(c, ang, f, (i, l) => c.E.l(l, i, 0, i % 5 === 0 ? 1 : 0, i % 5 === 0 ? 1.5 : .6)); } },
    { id: 'dots', group: 'paper', name: 'Крапкова сітка', desc: 'Сітка з крапок, як у блокноті. Повзунок міняє розмір крапок.', inset: false, size: 24, k: { label: 'Розмір крапки, %', min: 3, max: 40, def: 10, step: 1 },
      preset: { bg: '#ffffff', colors: ['#b5bcc8', '#b5bcc8', '#b5bcc8', '#b5bcc8', '#b5bcc8', '#b5bcc8'], ncol: 1, cmode: 'single', gap: 0, mode: 'fill' },
      gen(c) { const { P, K, E } = c; symbolGrid(c, (x, y, i, j) => E.o(x, y, Math.max(.5, P * K / 200), i, j, 0, 1, true), false); } },
    { id: 'dothex', group: 'paper', name: 'Крапки зі зсувом', desc: 'Крапки в шаховому порядку, як у шестикутній сітці.', inset: false, size: 24, k: { label: 'Розмір крапки, %', min: 3, max: 40, def: 10, step: 1 },
      gen(c) { const { P, K, E } = c; symbolGrid(c, (x, y, i, j) => E.o(x, y, Math.max(.5, P * K / 200), i, j, 0, 1, true), true); } },
    { id: 'iso', group: 'paper', name: 'Ізометрична сітка', desc: 'Трикутна сітка ліній під 0°, 60° і 120°: для ізометричних малюнків.', inset: false, line: true, size: 36,
      preset: { bg: '#ffffff', colors: ['#c3d3e6', '#c3d3e6', '#c3d3e6', '#c3d3e6', '#c3d3e6', '#c3d3e6'], ncol: 1, cmode: 'single', stroke: 1, gap: 0, mode: 'outline' },
      gen(c) { const h = c.P * SQ3 / 2; for (const ang of [0, 60, 120]) family(c, ang, h, (i, l) => c.E.l(l, i, 0)); } },

    /* --- символи --- */
    { id: 'star5', group: 'sym', name: 'Зірки', desc: 'П’ятикутні зірки. Повзунок міняє гострість променів.', inset: false, size: 44, k: { label: 'Гострота, %', min: 15, max: 70, def: 40, step: 1 },
      gen(c) { const { S, K, E } = c; symbolGrid(c, (x, y, i, j) => E.p(starPts(x, y, S / 2, S / 2 * K / 100 * 1.2, 5), i, j), true); } },
    { id: 'sparkle', group: 'sym', name: 'Блискітки', desc: 'Чотирипроменеві зірочки. Повзунок міняє товщину променів.', inset: false, size: 40, k: { label: 'Товщина променів, %', min: 8, max: 60, def: 22, step: 1 },
      gen(c) { const { S, K, E } = c; symbolGrid(c, (x, y, i, j) => E.p(starPts(x, y, S / 2, S / 2 * K / 100, 4), i, j), true); } },
    { id: 'star6', group: 'sym', name: 'Шестикутні зірки', desc: 'Шестипроменеві зірки. Повзунок міняє гострість променів.', inset: false, size: 44, k: { label: 'Гострота, %', min: 25, max: 90, def: 55, step: 1 },
      gen(c) { const { S, K, E } = c; symbolGrid(c, (x, y, i, j) => E.p(starPts(x, y, S / 2, S / 2 * K / 100, 6), i, j), true); } },
    { id: 'plus', group: 'sym', name: 'Плюси', desc: 'Хрестики-плюси. Повзунок міняє товщину.', inset: false, size: 36, k: { label: 'Товщина, %', min: 8, max: 60, def: 30, step: 1 },
      gen(c) { const { S, K, E } = c; symbolGrid(c, (x, y, i, j) => E.p(plusPts(x, y, S / 2, S * K / 100), i, j), false); } },
    { id: 'cross', group: 'sym', name: 'Хрестики', desc: 'Косі хрестики (×). Повзунок міняє товщину.', inset: false, size: 36, k: { label: 'Товщина, %', min: 8, max: 60, def: 28, step: 1 },
      gen(c) { const { S, K, E } = c; symbolGrid(c, (x, y, i, j) => E.p(plusPts(x, y, S / 2, S * K / 100, Math.PI / 4), i, j), true); } },
    { id: 'heart', group: 'sym', name: 'Серця', desc: 'Серденька в шаховому порядку.', inset: false, size: 40,
      gen(c) { const { S, E } = c; symbolGrid(c, (x, y, i, j) => E.p(heartPts(x, y - S * .04, S * .5), i, j), true); } },
    { id: 'flower', group: 'sym', name: 'Квіточки', desc: 'Квітки з пелюстками навколо серединки. Повзунок задає кількість пелюсток.', inset: false, size: 52, k: { label: 'Кількість пелюсток', min: 3, max: 12, def: 5, step: 1 },
      gen(c) { const { S, K, E } = c, n = Math.round(K), pl = S / 4; symbolGrid(c, (x, y, i, j) => { for (let p = 0; p < n; p++) { const a = -Math.PI / 2 + p * TAU / n; E.p(ellipsePts(x + Math.cos(a) * pl, y + Math.sin(a) * pl, pl * 1.05, Math.min(pl * .62, pl * 3 / n * 1.1), a, 16), i, j); } E.o(x, y, S * .09, i, j, 1, 1, true); }, true); } },
    { id: 'chevron', group: 'sym', name: 'Шеврони', desc: 'Смуги з кутиків «ялинкою». Повзунок міняє висоту кутика.', inset: false, size: 48, k: { label: 'Висота кутика, %', min: 10, max: 100, def: 50, step: 1 },
      gen(c) { const { S, G, K, box: [x0, y0, x1, y1], E } = c, h = S * K / 200, t = h, py = 2 * h + G, [j0, j1] = span(y0, y1, py), [i0, i1] = span(x0, x1, S); for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { const x = i * S + S / 2, y = j * py; E.p([x - S / 2, y, x, y + h, x + S / 2, y, x + S / 2, y + t, x, y + h + t, x - S / 2, y + t], i, j); } } },
    { id: 'arrow', group: 'sym', name: 'Стрілки', desc: 'Стрілки, що вказують в один бік; поворот змінює напрям.', inset: false, size: 40,
      gen(c) { const { S, E } = c, q = [0, -.5, .4, 0, .15, 0, .15, .5, -.15, .5, -.15, 0, -.4, 0]; symbolGrid(c, (x, y, i, j) => E.p(q.map((v, k) => (k % 2 ? y : x) + v * S), i, j), true); } },
  ];
  const PAT = {}; PATTERNS.forEach(p => PAT[p.id] = p);
  const GROUPS = [['tile', 'Щільні мозаїки'], ['round', 'Кола, луска, хвилі'], ['lines', 'Лінії'], ['paper', 'Зошит і сітки'], ['sym', 'Символи']];
  const patK = id => (PAT[id] && PAT[id].k) || null;

  /* ---------- кольори ---------- */
  const PALETTES = [
    { name: 'Зошит', bg: '#ffffff', colors: ['#c6dcf3', '#ee9a9a', '#cfe8cf', '#f6e3a8', '#d9c9ef', '#f3c7a6'] },
    { name: 'Сутінки', bg: '#14161d', colors: ['#c9a766', '#e6d3a0', '#8a6f3a', '#5c7f8f', '#b4543a', '#6e5b8c'] },
    { name: 'Пастель', bg: '#fbf6f0', colors: ['#f4b6c2', '#a8d8ea', '#fde2a7', '#b8e0c8', '#d4c1ec', '#fbc9a8'] },
    { name: 'Земля', bg: '#2a2118', colors: ['#c8814a', '#9c6b3c', '#d9b077', '#6d7a4a', '#a24b36', '#e8d3a2'] },
    { name: 'Неон', bg: '#0a0a12', colors: ['#ff2e93', '#2effd1', '#ffe92e', '#7a5cff', '#ff7a2e', '#2ec4ff'] },
    { name: 'Океан', bg: '#0b1d2b', colors: ['#1d6f8f', '#3fb0c4', '#9fe0dd', '#e8f6f3', '#235a7a', '#5ec2a8'] },
    { name: 'Ретро', bg: '#f1e6cf', colors: ['#d1495b', '#edae49', '#00798c', '#30638e', '#66a182', '#8d5b4c'] },
    { name: 'Цукерки', bg: '#fff4f8', colors: ['#ff6fa5', '#7ad7f0', '#ffd86b', '#a98bf0', '#6fe3b2', '#ff9a6b'] },
    { name: 'Ліс', bg: '#10190f', colors: ['#3e7d3c', '#7db55a', '#c2d97a', '#2b5d34', '#8c6d3f', '#d8c78a'] },
    { name: 'Захід', bg: '#1b1230', colors: ['#ff5e5b', '#ff9a3c', '#ffd166', '#c13a7a', '#6b3fa0', '#f78fb3'] },
    { name: 'Чорно-білий', bg: '#ffffff', colors: ['#111111', '#777777', '#bbbbbb', '#333333', '#999999', '#dddddd'] },
    { name: 'Крейда', bg: '#1f3b34', colors: ['#f2f2ec', '#cfe3d4', '#9ec9b1', '#e9d8a6', '#f4a6a0', '#b5d3e7'] },
  ];
  const hex2 = v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0');
  function hsl(h, s, l) {
    h = ((h % 360) + 360) % 360; s = Math.max(0, Math.min(1, s)); l = Math.max(0, Math.min(1, l));
    const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l), f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return '#' + hex2(f(0) * 255) + hex2(f(8) * 255) + hex2(f(4) * 255);
  }
  function randomPalette(r) {
    const base = r() * 360, dark = r() < .5, schemes = [[0, 25, -25, 50, -50, 75], [0, 180, 20, 200, -20, 160], [0, 120, 240, 60, 180, 300], [0, 90, 180, 270, 45, 225], [0, 150, 210, 30, 180, 330], [0, 8, -8, 16, -16, 24]], sc = schemes[Math.floor(r() * schemes.length)];
    const sat = .45 + r() * .4, bg = hsl(base + (r() < .5 ? 0 : 180), dark ? .25 + r() * .25 : .25 + r() * .3, dark ? .07 + r() * .08 : .93 + r() * .05);
    const colors = sc.map((d, i) => hsl(base + d + (r() - .5) * 8, sat * (.8 + r() * .3), dark ? .5 + r() * .22 : .38 + r() * .2 + (i % 2) * .08));
    return { bg, colors };
  }

  /* ---------- параметри ---------- */
  const MODES = ['fill', 'outline', 'both'], CMODES = ['single', 'rows', 'cols', 'diag', 'checker', 'random', 'rings', 'seq'];
  const hexOk = v => typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v);
  const clampN = (v, lo, hi, d) => { v = Number(v); return Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d; };
  function defaults(id) {
    const d = PAT[id || 'hex'], pal = PALETTES[1], k = d.k;
    return { pattern: d.id, W: 1600, H: 1000, size: d.size, gap: 4, stroke: 2, rot: 0, k: k ? k.def : 50, mode: 'fill', cmode: 'checker', ncol: 3, colors: pal.colors.slice(), bg: pal.bg, lineColor: '#0c0d11', seed: 'zbyrai', chaos: 0, turn: 0 };
  }
  function clampParams(p) {
    p = p || {}; const id = PAT[p.pattern] ? p.pattern : 'hex', d = defaults(id), k = PAT[id].k, o = {};
    o.pattern = id; o.W = Math.round(clampN(p.W, 64, 8192, d.W)); o.H = Math.round(clampN(p.H, 64, 8192, d.H));
    while (o.W * o.H > 50e6) { o.W = Math.round(o.W * .9); o.H = Math.round(o.H * .9); }
    o.size = clampN(p.size, 4, 400, d.size); o.gap = clampN(p.gap, 0, 120, d.gap); o.stroke = clampN(p.stroke, .25, 40, d.stroke); o.rot = ((clampN(p.rot, -3600, 3600, 0) % 360) + 360) % 360;
    o.k = k ? clampN(p.k, k.min, k.max, k.def) : 50; if (k && k.step === 1) o.k = Math.round(o.k);
    o.mode = MODES.includes(p.mode) ? p.mode : d.mode; o.cmode = CMODES.includes(p.cmode) ? p.cmode : d.cmode; o.ncol = Math.round(clampN(p.ncol, 1, 6, d.ncol));
    const cols = Array.isArray(p.colors) ? p.colors.filter(hexOk).slice(0, 6) : []; while (cols.length < 6) cols.push(d.colors[cols.length]); o.colors = cols;
    o.bg = hexOk(p.bg) ? p.bg : d.bg; o.lineColor = hexOk(p.lineColor) ? p.lineColor : d.lineColor; o.seed = String(p.seed === undefined ? d.seed : p.seed).slice(0, 24) || d.seed; o.chaos = clampN(p.chaos, 0, 1, 0); o.turn = clampN(p.turn, -180, 180, 0);
    return o;
  }

  /* ---------- побудова сцени ---------- */
  function buildScene(params) {
    const p = clampParams(params), def = PAT[p.pattern], W = p.W, H = p.H, rot = p.rot * Math.PI / 180;
    let S = p.size, clamped = false; const minS = Math.sqrt(W * H / MAX_CELLS); if (!def.line && S < minS) { S = minS; clamped = true; }
    if (def.line && S + p.gap < minS / 2) { S = minS / 2; clamped = true; }
    const G = p.gap, P = S + G, cr = Math.cos(-rot), sr = Math.sin(-rot);
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const [cx, cy] of [[-W / 2, -H / 2], [W / 2, -H / 2], [W / 2, H / 2], [-W / 2, H / 2]]) { const fx = cx * cr - cy * sr, fy = cx * sr + cy * cr; x0 = Math.min(x0, fx); x1 = Math.max(x1, fx); y0 = Math.min(y0, fy); y1 = Math.max(y1, fy); }
    const pad = S * .6 + (def.inset ? 0 : G); const box = [x0 - pad, y0 - pad, x1 + pad, y1 + pad];
    const shapes = []; let truncated = false;
    const push = o => { if (shapes.length >= MAX_SHAPES) { truncated = true; return; } shapes.push(o); };
    const E = {
      p(pts, gi, gj, co, w) { push({ t: 'p', pts: def.inset ? shrink(pts, G) : pts, gi: gi | 0, gj: gj | 0, co: co | 0, w: w || 1 }); },
      o(x, y, r, gi, gj, co, w, solid) { push({ t: 'o', x, y, r, gi: gi | 0, gj: gj | 0, co: co | 0, w: w || 1, solid: !!solid }); },
      l(pts, gi, gj, co, w) { push({ t: 'l', pts, gi: gi | 0, gj: gj | 0, co: co | 0, w: w || 1 }); },
    };
    def.gen({ S, G, P, K: p.k, box, E });
    // кольори: індекс у палітрі за режимом чергування
    const n = p.ncol, rc = rng(p.seed + '|c'), rj = rng(p.seed + '|j'), mod = (a, m) => ((a % m) + m) % m;
    for (let i = 0; i < shapes.length; i++) {
      const s = shapes[i]; let base = 0;
      switch (p.cmode) {
        case 'rows': base = s.gj; break; case 'cols': base = s.gi; break; case 'diag': base = s.gi + s.gj; break;
        case 'checker': base = (s.gi & 1) ^ (s.gj & 1); break; case 'random': base = Math.floor(rc() * n); break; case 'seq': base = s.gi + s.gj * 2; break;
        case 'rings': { let cx, cy; if (s.t === 'o') { cx = s.x; cy = s.y; } else { cx = s.pts[0]; cy = s.pts[1]; } base = Math.floor(Math.hypot(cx, cy) / (S * 1.5)); break; }
        default: base = 0;
      }
      s.ci = mod(mod(base, n) + s.co, n);
      if ((p.chaos > 0 || p.turn) && s.t !== 'l') {
        const a = (p.chaos > 0 ? (rj() - .5) * p.chaos * Math.PI : 0) + p.turn * Math.PI / 180, sc = p.chaos > 0 ? 1 - rj() * p.chaos * .4 : 1;
        if (s.t === 'o') s.r *= sc; else { const c = areaCentroid(s.pts); s.pts = transformPoly(s.pts, c[0], c[1], a, sc); }
      }
    }
    return { W, H, rot: p.rot, bg: p.bg, pal: p.colors.slice(0, 6), ncol: n, mode: p.mode, lineColor: p.lineColor, stroke: p.stroke, seam: p.mode === 'fill' && (!def.inset || G <= .01), shapes, count: shapes.length, size: S, clamped, truncated, pattern: p.pattern };
  }

  /* ---------- малювання на canvas ---------- */
  function draw(ctx, sc, scale) {
    scale = scale || 1; ctx.save();
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.fillStyle = sc.bg; ctx.fillRect(0, 0, sc.W, sc.H);
    ctx.translate(sc.W / 2, sc.H / 2); ctx.rotate(sc.rot * Math.PI / 180);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    let lf = null, ls = null, lw = null;
    const setF = c => { if (c !== lf) { ctx.fillStyle = c; lf = c; } }, setS = c => { if (c !== ls) { ctx.strokeStyle = c; ls = c; } }, setW = w => { if (w !== lw) { ctx.lineWidth = w; lw = w; } };
    for (const s of sc.shapes) {
      const col = sc.pal[s.ci];
      if (s.t === 'l') { ctx.beginPath(); ctx.moveTo(s.pts[0], s.pts[1]); for (let k = 2; k < s.pts.length; k += 2) ctx.lineTo(s.pts[k], s.pts[k + 1]); setS(col); setW(sc.stroke * s.w); ctx.stroke(); continue; }
      ctx.beginPath();
      if (s.t === 'o') ctx.arc(s.x, s.y, Math.max(.01, s.r), 0, TAU); else { ctx.moveTo(s.pts[0], s.pts[1]); for (let k = 2; k < s.pts.length; k += 2) ctx.lineTo(s.pts[k], s.pts[k + 1]); ctx.closePath(); }
      if (s.solid) { setF(col); ctx.fill(); continue; }
      if (sc.mode !== 'outline') { setF(col); ctx.fill(); }
      if (sc.mode === 'fill') { if (sc.seam) { setS(col); setW(.6); ctx.stroke(); } } else { setS(sc.mode === 'outline' ? col : sc.lineColor); setW(sc.stroke * s.w); ctx.stroke(); }
    }
    ctx.restore();
  }

  /* ---------- SVG ---------- */
  const f2 = v => String(+v.toFixed(2));
  function toSVG(sc) {
    const css = [], n = sc.ncol; let body = '';
    for (let i = 0; i < n; i++) {
      const c = sc.pal[i];
      css.push(`.a${i}{${sc.mode === 'outline' ? 'fill:none;stroke:' + c : sc.mode === 'both' ? 'fill:' + c + ';stroke:' + sc.lineColor : 'fill:' + c + (sc.seam ? ';stroke:' + c + ';stroke-width:.6' : '')}}`);
      css.push(`.s${i}{fill:${c};stroke:none}`, `.l${i}{fill:none;stroke:${c}}`);
    }
    for (const s of sc.shapes) {
      const w = s.w !== 1 && !(s.solid) && !(sc.seam && s.t === 'p') ? ` stroke-width="${f2(sc.stroke * s.w)}"` : '';
      if (s.t === 'l') { let d = ''; for (let k = 0; k < s.pts.length; k += 2) d += (k ? 'L' : 'M') + f2(s.pts[k]) + ' ' + f2(s.pts[k + 1]); body += `<path class="l${s.ci}"${w} d="${d}"/>`; }
      else if (s.t === 'o') body += `<circle class="${s.solid ? 's' : 'a'}${s.ci}"${w} cx="${f2(s.x)}" cy="${f2(s.y)}" r="${f2(Math.max(.01, s.r))}"/>`;
      else { let d = ''; for (let k = 0; k < s.pts.length; k += 2) d += (k ? 'L' : 'M') + f2(s.pts[k]) + ' ' + f2(s.pts[k + 1]); body += `<path class="a${s.ci}"${w} d="${d}Z"/>`; }
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${sc.W}" height="${sc.H}" viewBox="0 0 ${sc.W} ${sc.H}"><style>g{stroke-width:${f2(sc.stroke)};stroke-linejoin:round;stroke-linecap:round}${css.join('')}</style><rect width="${sc.W}" height="${sc.H}" fill="${sc.bg}"/><g transform="translate(${f2(sc.W / 2)} ${f2(sc.H / 2)}) rotate(${f2(sc.rot)})">${body}</g></svg>`;
  }

  /* ---------- JSON і посилання ---------- */
  const toJSON = params => ({ tool: 'tessera', version: 1, params: clampParams(params) });
  function fromJSON(obj) {
    if (typeof obj === 'string') obj = JSON.parse(obj);
    if (!obj || typeof obj !== 'object') throw new Error('Це не файл Tessera');
    const raw = obj.tool === 'tessera' && obj.params ? obj.params : obj;
    if (!raw || !PAT[raw.pattern]) throw new Error('Невідомий візерунок у файлі');
    return clampParams(raw);
  }

  /* ---------- випадкові налаштування ---------- */
  function randomize(cur, locks, r) {
    locks = locks || {}; r = r || Math.random; const pick = a => a[Math.floor(r() * a.length)], o = Object.assign({}, cur);
    if (!locks.pattern) { const pool = PATTERNS.filter(p => !p.preset); o.pattern = pick(pool).id; }
    const d = PAT[o.pattern];
    o.size = Math.round((d.line ? 14 + r() * 40 : 26 + r() * 70) * (Math.min(o.W, o.H) / 1000 > 1.6 ? 1.5 : 1));
    o.gap = r() < .45 ? 0 : Math.round(r() * o.size * .25 * 10) / 10; o.stroke = Math.round((1 + r() * 5) * 2) / 2;
    o.rot = r() < .5 ? 0 : r() < .6 ? pick([15, 30, 45, 60, 90]) : Math.round(r() * 360);
    o.k = d.k ? (d.k.step === 1 ? Math.round(d.k.min + r() * (d.k.max - d.k.min)) : d.k.min + Math.round((r() * (d.k.max - d.k.min)) / d.k.step) * d.k.step) : 50;
    o.mode = d.line ? 'outline' : pick(['fill', 'fill', 'fill', 'outline', 'both']); o.cmode = pick(['checker', 'rows', 'cols', 'diag', 'random', 'random', 'rings', 'seq']);
    o.chaos = r() < .85 ? 0 : Math.round(r() * 40) / 100; o.seed = randSeed();
    if (!locks.colors) { const pal = randomPalette(r); o.bg = pal.bg; o.colors = pal.colors; o.ncol = 2 + Math.floor(r() * 5); o.lineColor = pal.bg; }
    return clampParams(o);
  }

  return { PATTERNS, PAT, GROUPS, PALETTES, MODES, CMODES, defaults, clampParams, buildScene, draw, toSVG, toJSON, fromJSON, randomize, randomPalette, rng, randSeed, hsl, patK, packParams, pointInPoly, shrink, areaCentroid, regPoly, satOverlap, MAX_CELLS };
});
