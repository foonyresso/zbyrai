// Атлас 2.0, місто: пояс полів за містом. Ділянки лягають суцільними смугами обабіч доріг і вулиць (як реальні «фурлонги»): біля мурів сади й городи, далі лани й виноградники, на краю луки й пасовища; сусідні ділянки спільні за культурою й напрямом оранки, між ними живопліт.
(function () {
  'use strict';
  const A = globalThis.Atlas2;
  const CAP = [14, 60, 140, 220, 320], DEPTH = [1, 2, 3, 4, 4];
  // o: {r, tier, R, Rmap, x0, y0, streets, WK, near, B, F, d0, inside(x,y), rectCorners, overlap, warm}
  function make(o) {
    const { r, tier, R, Rmap, x0, y0, streets, WK, near, B, F, d0, rectCorners, overlap } = o, fields = [], lim = Math.min(Rmap * 0.95, R * (tier >= 3 ? 2.6 : 2.3)), cap = CAP[tier], rows = DEPTH[tier];
    const fits = f => {
      if (d0(f.x, f.y) > lim || o.inside(f.x, f.y)) return false;
      for (const c of rectCorners(f, 0)) if (WK(c[0], c[1]) !== 0 || o.inside(c[0], c[1]) || near(c[0], c[1], 10, -1, -2) < 1.8) return false;
      const ca = Math.cos(f.a), sa = Math.sin(f.a); for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) { const u = i * f.w / 4, v = j * f.h / 4; if (WK(f.x + ca * u - sa * v, f.y + sa * u + ca * v) !== 0) return false; }
      if (near(f.x, f.y, 14, -1, -2) < 1.8) return false;
      const rd = Math.hypot(f.w, f.h) / 2;
      for (const q of fields) if (Math.hypot(q.x - f.x, q.y - f.y) < (Math.hypot(q.w, q.h) + Math.hypot(f.w, f.h)) / 2 + 1 && overlap(f, q)) return false;
      for (const b of B) if (Math.hypot(b.x - f.x, b.y - f.y) < rd + Math.max(b.w, b.h) && overlap(f, b)) return false;
      for (const q of F) if (Math.hypot(q.x - f.x, q.y - f.y) < q.r + rd * 0.8) return false;
      return true;
    };
    // у яких смугах роду культур: біля міста сади, далі змішані лани, на краю луки
    const kindAt = (dd, run) => {
      const u = dd / R, h = (run * 2654435761 >>> 0) / 4294967296;
      if (u < 1.35) return h < 0.4 ? 'garden' : h < 0.55 ? 'orchard' : 'arable';
      if (u < 1.9) return h < 0.68 ? 'arable' : h < 0.8 && o.warm ? 'vineyard' : h < 0.88 ? 'orchard' : 'meadow';
      return h < 0.45 ? 'arable' : h < 0.7 ? 'meadow' : h < 0.8 && o.warm ? 'vineyard' : 'arable';
    };
    const roads = streets.filter(st => st.kind !== 'embankment' && st.kind !== 'ring' && st.pts.length >= 4).sort((p, q) => (p.kind === 'avenue' ? 0 : 1) - (q.kind === 'avenue' ? 0 : 1) || r() - 0.5);
    // стовпці: рівні кроки вздовж дороги; кожна дорога й бік мають свої глибини рядів, щоб ряди складались у сітку
    const cols = [];
    roads.forEach(st => { const cw = 36 + r() * 30, p = st.pts; for (const sd of [1, -1]) {
      const hs = []; for (let k = 0; k < rows; k++) hs.push(44 + r() * 40); let acc = r() * cw, runId = 0, lastRun = -1;
      for (let i = 2; i < p.length; i += 2) { const ax = p[i - 2], ay = p[i - 1], L = Math.hypot(p[i] - ax, p[i + 1] - ay), an = Math.atan2(p[i + 1] - ay, p[i] - ax);
        for (; acc < L; acc += cw) { const px = ax + Math.cos(an) * acc, py = ay + Math.sin(an) * acc, dd = d0(px, py); if (dd < R * 0.9 || dd > lim) continue; const run = Math.floor((st.id * 7 + (sd > 0 ? 3 : 0) + i / 2 * 0.31 + acc / cw / 3)); if (run !== lastRun) { lastRun = run; runId = run; }
          cols.push({ st, sd, px, py, an, cw, hs, run: runId }); } acc -= L; } } });
    for (let row = 0; row < rows && fields.length < cap; row++) for (const c of cols) {
      if (fields.length >= cap) break; let off = c.st.hw + 3.5; for (let k = 0; k < row; k++) off += c.hs[k] + 2.5;
      const h = c.hs[row], cx = c.px - Math.sin(c.an) * c.sd * (off + h / 2), cy = c.py + Math.cos(c.an) * c.sd * (off + h / 2), f = { x: cx, y: cy, w: c.cw - 2, h, a: c.an };
      f.k = kindAt(d0(cx, cy), c.run + row * 3); f.dir = ((c.run * 40503) >>> 8 & 1) ? 1 : 0; f.crop = ((c.run * 2246822519) >>> 11) % 4;
      if (fits(f)) fields.push(f);
    }
    return fields;
  }
  A.TownFields = { make };
})();
