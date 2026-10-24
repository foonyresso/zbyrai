// Атлас 2.0, місто: пояс полів за містом. Ділянки неправильних форм (багатокутники з нерівними межами, трапеції, смуги, що вигинаються) лягають рядами вздовж доріг і вулиць, огинають воду, споруди й сусідні поля; біля мурів сади й городи, далі лани, виноградники, луки. Напрям оранки в кожній ділянці свій і йде вздовж її довгої сторони; між ділянками живопліт.
(function () {
  'use strict';
  const A = globalThis.Atlas2;
  const CAP = [14, 60, 140, 220, 320], DEPTH = [1, 2, 3, 4, 4], SP = 8, GAP = 2.5;
  const pip = (p, x, y) => { let c = false; for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) if ((p[i + 1] > y) !== (p[j + 1] > y) && x < (p[j] - p[i]) * (y - p[i + 1]) / (p[j + 1] - p[i + 1]) + p[i]) c = !c; return c; };
  const inField = (f, x, y) => x > f.bb[0] && x < f.bb[2] && y > f.bb[1] && y < f.bb[3] && pip(f.pts, x, y);
  // дорога → точки з кроком SP м: {x, y, tx, ty}
  function resample(p) {
    const out = []; let carry = 0;
    for (let i = 2; i < p.length; i += 2) { const ax = p[i - 2], ay = p[i - 1], L = Math.hypot(p[i] - ax, p[i + 1] - ay); if (!L) continue; const tx = (p[i] - ax) / L, ty = (p[i + 1] - ay) / L; for (let s = carry; s < L; s += SP) { out.push({ x: ax + tx * s, y: ay + ty * s, tx, ty }); carry = s + SP - L; } }
    return out;
  }
  // o: {r, tier, R, Rmap, x0, y0, streets, WK, near, B, F, d0, inside(x,y), warm}
  function make(o) {
    const { r, tier, R, Rmap, streets, WK, near, B, F, d0 } = o, fields = [], lim = Math.min(Rmap * 0.95, R * (tier >= 3 ? 2.6 : 2.3)), cap = CAP[tier], rows = DEPTH[tier];
    const okPt = (x, y) => WK(x, y) === 0 && !o.inside(x, y) && near(x, y, 10, -1, -2) > 1.8 && d0(x, y) < lim;
    const fits = f => {
      for (let i = 0; i < f.pts.length; i += 2) if (!okPt(f.pts[i], f.pts[i + 1])) return false;
      const n = f.pts.length / 4; for (let i = 0; i < n; i++) { const j = f.pts.length / 2 - 1 - i, mx = (f.pts[i * 2] + f.pts[j * 2]) / 2, my = (f.pts[i * 2 + 1] + f.pts[j * 2 + 1]) / 2; if (!okPt(mx, my)) return false; }
      for (const q of fields) if (f.bb[0] < q.bb[2] && f.bb[2] > q.bb[0] && f.bb[1] < q.bb[3] && f.bb[3] > q.bb[1]) { if (inField(q, f.x, f.y) || inField(f, q.x, q.y)) return false; for (let i = 0; i < f.pts.length; i += 2) if (inField(q, f.pts[i], f.pts[i + 1])) return false; for (let i = 0; i < q.pts.length; i += 2) if (inField(f, q.pts[i], q.pts[i + 1])) return false; }
      for (const b of B) { const rr = Math.max(b.w, b.h) * 0.7; if (Math.hypot(b.x - f.x, b.y - f.y) < f.r + rr && inField(f, b.x, b.y)) return false; if (Math.hypot(b.x - f.x, b.y - f.y) < f.r + rr) { const c = Math.cos(b.a), s = Math.sin(b.a); for (const [u, v] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) if (inField(f, b.x + c * u * b.w / 2 - s * v * b.h / 2, b.y + s * u * b.w / 2 + c * v * b.h / 2)) return false; } }
      for (const q of F) if (Math.hypot(q.x - f.x, q.y - f.y) < q.r + f.r * 0.7 && (inField(f, q.x, q.y) || Math.hypot(q.x - f.x, q.y - f.y) < q.r + 6)) return false;
      return true;
    };
    const kindAt = (dd, run) => {
      const u = dd / R, h = (run * 2654435761 >>> 0) / 4294967296;
      if (u < 1.35) return h < 0.4 ? 'garden' : h < 0.55 ? 'orchard' : 'arable';
      if (u < 1.9) return h < 0.68 ? 'arable' : h < 0.8 && o.warm ? 'vineyard' : h < 0.88 ? 'orchard' : 'meadow';
      return h < 0.45 ? 'arable' : h < 0.7 ? 'meadow' : h < 0.8 && o.warm ? 'vineyard' : 'arable';
    };
    const roads = streets.filter(st => st.kind !== 'embankment' && st.kind !== 'ring' && st.pts.length >= 4).sort((p, q) => (p.kind === 'avenue' ? 0 : 1) - (q.kind === 'avenue' ? 0 : 1) || r() - 0.5);
    // стовпці різної ширини вздовж дороги; спільні межі між сусідніми стовпцями мають спільну глибину й нахил
    const cols = [];
    roads.forEach(st => { const P = resample(st.pts); if (P.length < 4) return; for (const sd of [1, -1]) {
      let i = Math.floor(r() * 5), run = Math.floor(st.id * 7 + (sd > 0 ? 3 : 0)), left = 0;
      const bd = () => 0.8 + r() * 0.45, tl = () => (r() - 0.5) * 14, mk = () => Array.from({ length: rows }, () => ({ d: bd(), t: tl() }));
      let bL = mk();
      while (i < P.length - 4) { const wN = 4 + Math.floor(r() * 8), i1 = Math.min(P.length - 1, i + wN), bR = mk(), mid = P[(i + i1) >> 1], dd = d0(mid.x, mid.y); if (--left <= 0) { run++; left = 1 + Math.floor(r() * 3); }
        if (dd > R * 0.9 && dd < lim) cols.push({ st, sd, pts: P.slice(i, i1 + 1), bL, bR, run, out: null, dead: false, base: 40 + r() * 45 }); bL = bR; i = i1 + 1 + (r() < 0.12 ? 2 : 0); } } });
    for (let row = 0; row < rows && fields.length < cap; row++) for (const c of cols) {
      if (fields.length >= cap) break; if (c.dead) continue; const n = c.pts.length; if (!c.out) c.out = c.pts.map(() => c.st.hw + 3.5); else c.out = c.out.map(v => v + GAP);
      const inn = c.out.slice(); let done = false;
      for (const sc of [1, 0.72, 0.5]) {
        const dep = c.pts.map((_, i) => { const t = i / (n - 1), w = c.bL[row].d * (1 - t) + c.bR[row].d * t; return c.base * sc * w * (1 + 0.09 * Math.sin(i * 0.4 + c.run)); });
        const outer = inn.map((v, i) => v + dep[i]), poly = [], rev = [], shn = [];
        c.pts.forEach((p, i) => { const nx = -p.ty * c.sd, ny = p.tx * c.sd; const ps = c.shift ? c.shift[i] : 0; poly.push(p.x + nx * inn[i] + p.tx * ps, p.y + ny * inn[i] + p.ty * ps); const t = i / (n - 1), sh = c.bL[row].t * (1 - t) + c.bR[row].t * t; shn[i] = sh; rev.push(p.x + nx * outer[i] + p.tx * sh, p.y + ny * outer[i] + p.ty * sh); });
        for (let i = n - 1; i >= 0; i--) poly.push(rev[i * 2], rev[i * 2 + 1]);
        let sx = 0, sy = 0, m = poly.length / 2, x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (let i = 0; i < poly.length; i += 2) { sx += poly[i]; sy += poly[i + 1]; x0 = Math.min(x0, poly[i]); x1 = Math.max(x1, poly[i]); y0 = Math.min(y0, poly[i + 1]); y1 = Math.max(y1, poly[i + 1]); }
        const f = { pts: poly, x: sx / m, y: sy / m, bb: [x0, y0, x1, y1] }; f.r = Math.hypot(x1 - x0, y1 - y0) / 2;
        if (!fits(f)) continue;
        const mp = c.pts[n >> 1], len = n * SP, avg = dep.reduce((a, b) => a + b, 0) / n; f.a = Math.atan2(mp.ty, mp.tx) + (len >= avg ? 0 : Math.PI / 2) + (r() - 0.5) * 0.35;
        f.k = kindAt(d0(f.x, f.y), c.run + row * 3); f.crop = ((c.run * 2246822519) >>> 11) % 4;
        fields.push(f); c.out = outer; c.shift = shn; done = true; break;
      }
      if (!done) c.dead = true;
    }
    return fields;
  }
  A.TownFields = { make, inField };
})();
