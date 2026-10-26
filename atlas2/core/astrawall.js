// Атлас 2.0, вимір «Астракор»: Велика стіна й гігантські фортеці. Цивілізація тримається навколо дерева; на 70 % радіуса (від дерева до обриву) її межує
// стіна з фортецями; за стіною лише захоплені монстрами землі, що чим далі, тим небезпечніші (див. danger.js). W.wall = {pts} (замкнена ламана),
// W.fortresses[], маски W.wallMask (стіна) і W.gateMask (ворота: 3 клітини навколо фортеці, лише тут дороги перетинають стіну).
(function () {
  'use strict';
  const A = globalThis.Atlas2, WALL = 0.7;

  function astrawall(W) {
    const { w, h } = W, N = w * h, cx = w / 2, cy = h / 2, r = A.Rng.stream(W.params.seed, 'wall'), names = A.Names.make(W.params.seed + '|fort');
    const fr = (x, y) => { const X = Math.round(x), Y = Math.round(y); return X < 0 || Y < 0 || X >= w || Y >= h ? 9 : W.fr[Y * w + X]; };
    // стіна: контур fr = 0.7 (шлях променями від дерева), трохи згладжений
    const NA = Math.max(360, Math.round(Math.min(w, h) * 1.2)), raw = [];
    for (let k = 0; k < NA; k++) { const a = k / NA * 6.2832, c = Math.cos(a), s = Math.sin(a); let d = 0; while (d < w && fr(cx + c * d, cy + s * d) < WALL) d += 0.5; raw.push([cx + c * d, cy + s * d]); }
    const pts = raw.map((_, k) => { let x = 0, y = 0; for (let q = -4; q <= 4; q++) { const p = raw[(k + q + NA) % NA]; x += p[0]; y += p[1]; } return [x / 9, y / 9]; });
    const wallMask = new Uint8Array(N), gateMask = new Uint8Array(N);
    for (let k = 0; k < NA; k++) {
      const a = pts[k], b = pts[(k + 1) % NA], n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) * 2) + 1;
      for (let q = 0; q <= n; q++) { const x = Math.round(a[0] + (b[0] - a[0]) * q / n), y = Math.round(a[1] + (b[1] - a[1]) * q / n); for (const [dx, dy] of [[0, 0], [1, 0], [0, 1]]) { const X = x + dx, Y = y + dy; if (X >= 0 && Y >= 0 && X < w && Y < h) wallMask[Y * w + X] = 1; } }
    }
    // фортеці: рівномірно по колу, не на коренях, озерах і річках (зсув уздовж стіни)
    let per = 0; for (let k = 0; k < NA; k++) per += Math.hypot(pts[(k + 1) % NA][0] - pts[k][0], pts[(k + 1) % NA][1] - pts[k][1]);
    const nF = Math.min(36, Math.max(10, Math.round(per / 55))), bad = (x, y) => { for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const X = Math.round(x) + dx, Y = Math.round(y) + dy; if (X < 0 || Y < 0 || X >= w || Y >= h) return true; const i = Y * w + X; if (W.root[i] || W.lake[i] || !W.land[i]) return true; } return false; };
    const F = [], used = new Set(), off = Math.floor(r() * NA / nF);
    for (let f = 0; f < nF; f++) {
      const base = Math.floor((f + 0.5 + (r() - 0.5) * 0.4) * NA / nF + off); let pick = -1;
      for (let s = 0; s <= NA / nF / 2 && pick < 0; s++) for (const sg of s ? [1, -1] : [1]) { const k = (base + sg * s + NA * 4) % NA; if (!bad(pts[k][0], pts[k][1]) && !used.has(k)) { pick = k; break; } }
      if (pick < 0) continue; used.add(pick);
      const x = Math.round(pts[pick][0]), y = Math.round(pts[pick][1]), i = y * w + x;
      F.push({ id: F.length, name: names.town(names.lang()), x, y, i, prov: W.province[i], region: W.region[i], fr: +W.fr[i].toFixed(3) });
    }
    for (const f of F) for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) { const X = f.x + dx, Y = f.y + dy; if (dx * dx + dy * dy <= 10 && X >= 0 && Y >= 0 && X < w && Y < h) gateMask[Y * w + X] = 1; }
    for (const q of W.settlements) if (wallMask[q.i]) for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const X = q.x + dx, Y = q.y + dy; if (X >= 0 && Y >= 0 && X < w && Y < h) gateMask[Y * w + X] = 1; } // поселення на лінії стіни: стіна має в нього прохід
    W.wall = { pts: pts.flatMap(p => [Math.round(p[0] * 100) / 100, Math.round(p[1] * 100) / 100]), radius: WALL }; W.fortresses = F; W.wallMask = wallMask; W.gateMask = gateMask;
  }
  astrawall.dims = ['astrakor'];
  A.WALL_FR = WALL;
  (A.stages = A.stages || []).push(astrawall);
})();
