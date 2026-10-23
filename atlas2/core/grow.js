// Атлас 2.0: спільні допоміжні для політики: ріст міток хвилею Дейкстри за вартістю шляху, згладжування меж, виправлення уламків.
(function () {
  'use strict';
  const A = globalThis.Atlas2, { DX, DY, components } = A.Grid;

  // вартість кроку i→j: гори, болота, лісу й великі річки «дорожчі», тож межі лягають по хребтах і річках
  function stepCost(W, j, diag) {
    const slope = Math.abs(W.elev[j] - W.elev[j - (diag ? 0 : 0)]);
    return (1 + (A.BIOMES[W.bio[j]].move - 1) * 0.6) * (1 + slope * 0) * (W.river[j] && W.acc[j] > 60 ? 2.2 : 1) * (diag ? 1.41 : 1);
  }
  // гладке поле «норову» ґрунту: ріст провінцій і вод іде нерівномірно, тож межі звивисті, а не прямі під 0/45/90°
  function wobble(W) {
    if (W._wob) return W._wob; const { w, h } = W, f = new Float32Array(w * h), nz = A.Noise.make(W.params.seed + '|wobble'), rr = A.Rng.stream(W.params.seed, 'wobble');
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) f[y * w + x] = Math.min(1.9, Math.max(0.45, 1 + 4 * (nz.fbm(x * 0.045, y * 0.045, 3) - 0.5) + 2 * (nz.fbm(x * 0.15 + 30, y * 0.15 + 9, 2) - 0.5) + (rr() - 0.5) * 0.9));
    return (W._wob = f);
  }
  // seeds: [{i,label,mul}]; allowed(i) → bool; повертає Int16Array міток (-1 без мітки)
  function grow(W, seeds, allowed) {
    const { w, h } = W, N = w * h, dist = new Float32Array(N).fill(1e9), lab = new Int16Array(N).fill(-1), mul = new Float32Array(N), heap = new A.Heap(), wob = wobble(W);
    for (const s of seeds) { dist[s.i] = 0; lab[s.i] = s.label; mul[s.i] = s.mul || 1; heap.push(0, s.i); }
    while (heap.size) {
      const i = heap.pop(), d0 = dist[i], x = i % w, y = (i / w) | 0;
      for (let d = 0; d < 8; d++) {
        const nx = x + DX[d], ny = y + DY[d]; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const j = ny * w + nx; if (!allowed(j)) continue;
        const slope = Math.abs(W.elev[j] - W.elev[i]) * 12;
        const nd = d0 + (stepCost(W, j, d >= 4) + slope) * mul[i] * wob[j];
        if (nd < dist[j]) { dist[j] = nd; lab[j] = lab[i]; mul[j] = mul[i]; heap.push(nd, j); }
      }
    }
    return lab;
  }
  // найчастіша мітка серед сусідів (4 або 8), окрім виключених; −1 якщо нема
  function topNeighbor(lab, w, h, i, ok, n8) {
    const x = i % w, y = (i / w) | 0, cnt = new Map(); let best = -1, bc = 0;
    for (let d = 0; d < (n8 ? 8 : 4); d++) {
      const nx = x + DX[d], ny = y + DY[d]; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      const L = lab[ny * w + nx]; if (L < 0 || !ok(L)) continue; const c = (cnt.get(L) || 0) + 1; cnt.set(L, c); if (c > bc) { bc = c; best = L; }
    }
    return { label: best, count: bc };
  }
  // згладжування: клітина переходить до сусідньої мітки, якщо вона домінує серед 8 сусідів (прибирає зубці й дірки)
  function smooth(lab, w, h, ok, passes) {
    for (let p = 0; p < passes; p++) {
      const out = lab.slice();
      for (let i = 0; i < lab.length; i++) {
        if (lab[i] < 0) continue; const t = topNeighbor(lab, w, h, i, L => ok(i, L), true);
        if (t.label >= 0 && t.label !== lab[i] && t.count >= 5) out[i] = t.label;
      }
      lab.set(out);
    }
  }
  // уламки: компоненти мітки, окрім головної (зі «стрижнем» або найбільшої), що менші за minKeep, віддаємо сусідній мітці
  function fixFragments(lab, w, h, anchors, minKeep, ok) {
    const cc = components(w, h, i => lab[i] >= 0 && false), comp = new Int32Array(w * h).fill(-1);
    let changed = true, guard = 0;
    while (changed && guard++ < 4) {
      changed = false; comp.fill(-1); const info = [];
      for (let s = 0; s < w * h; s++) {
        if (lab[s] < 0 || comp[s] >= 0) continue; const L = lab[s], cells = [s], st = [s]; comp[s] = info.length;
        while (st.length) { const i = st.pop(), x = i % w, y = (i / w) | 0; for (let d = 0; d < 4; d++) { const nx = x + DX[d], ny = y + DY[d]; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue; const j = ny * w + nx; if (lab[j] === L && comp[j] < 0) { comp[j] = info.length; cells.push(j); st.push(j); } } }
        info.push({ L, cells });
      }
      const main = new Map();
      for (const c of info) { const a = anchors[c.L]; const m = main.get(c.L); const hasAnchor = a != null && c.cells.includes(a); if (!m || hasAnchor || (!m.anchor && c.cells.length > m.cells.length)) main.set(c.L, { cells: c.cells, anchor: hasAnchor || (m && m.anchor) }); }
      for (const c of info) {
        if (main.get(c.L).cells === c.cells || c.cells.length >= minKeep) continue;
        for (const i of c.cells) { const t = topNeighbor(lab, w, h, i, L => L !== c.L && ok(i, L), false); if (t.label >= 0) { lab[i] = t.label; changed = true; } }
      }
    }
  }
  // відстань (хамфер 1 / 1.41, наближено евклідова) усередині однієї мітки; d: 0 у джерелах, 1e9 інакше
  function chamfer(d, lab, w, h) {
    const F = [[-1, -1, 1.414], [0, -1, 1], [1, -1, 1.414], [-1, 0, 1]], B = [[1, 1, 1.414], [0, 1, 1], [-1, 1, 1.414], [1, 0, 1]];
    const pass = (list, y0, y1, dy, x0, x1, dx) => { for (let y = y0; y !== y1; y += dy) for (let x = x0; x !== x1; x += dx) { const i = y * w + x; if (lab[i] < 0) continue; for (const [ox, oy, c] of list) { const nx = x + ox, ny = y + oy; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue; const j = ny * w + nx; if (lab[j] === lab[i] && d[j] + c < d[i]) d[i] = d[j] + c; } } };
    pass(F, 0, h, 1, 0, w, 1); pass(B, h - 1, -1, -1, w - 1, -1, -1);
  }
  // довгі тонкі «щупальця» провінцій: ядро = клітини глибше R від межі провінції; усе, що далі R від ядра, віддаємо сусідній провінції
  function trimArms(lab, w, h, anchors, W) {
    const N = w * h, wob = wobble(W), D = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        const area = new Map(); for (let i = 0; i < N; i++) if (lab[i] >= 0) area.set(lab[i], (area.get(lab[i]) || 0) + 1);
    const first = lab.slice(), csize = (l, c) => { if (l[c] < 0) return 0; const L = l[c], seen = new Set([c]), st = [c]; while (st.length) { const i = st.pop(), x = i % w, y = (i / w) | 0; for (const [dx, dy] of D) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue; const j = ny * w + nx; if (l[j] === L && !seen.has(j)) { seen.add(j); st.push(j); } } } return seen.size; };
    const base = anchors.map(c => csize(first, c));
    for (let pass = 0; pass < 3; pass++) {
      // глибина від межі провінції (берег теж межа)
      const dep = new Float32Array(N).fill(1e9);
      for (let i = 0; i < N; i++) if (lab[i] >= 0) { let edge = false; const x = i % w, y = (i / w) | 0; for (const [dx, dy] of D) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= w || ny >= h || lab[ny * w + nx] !== lab[i]) { edge = true; break; } } if (edge) dep[i] = 0; }
      chamfer(dep, lab, w, h);
      const R = new Map(); for (const [L, a] of area) R.set(L, Math.max(3, Math.min(16, Math.round(0.2 * Math.sqrt(a / Math.PI)))));
      // ядро й його розширення на R клітин
      const near = new Float32Array(N).fill(1e9), hasCore = new Set();
      for (let i = 0; i < N; i++) if (lab[i] >= 0 && dep[i] >= R.get(lab[i])) { near[i] = 0; hasCore.add(lab[i]); }
      chamfer(near, lab, w, h);
      // «щупальця» віддаються сусідам: Дейкстра з нерівномірною вартістю від решти клітин (клітина не може відійти своїй же провінції), тож межа не рівна
      const arm = new Uint8Array(N), orig = lab.slice(), dst = new Float32Array(N).fill(1e9), hp = new A.Heap(); let ch = 0;
      for (let i = 0; i < N; i++) { const L = lab[i]; if (L >= 0 && near[i] > R.get(L) && hasCore.has(L) && anchors[L] !== i) arm[i] = 1; }
      for (let i = 0; i < N; i++) if (lab[i] >= 0 && !arm[i]) { dst[i] = 0; hp.push(0, i); }
      while (hp.size) {
        const i = hp.pop(), d0 = dst[i], x = i % w, y = (i / w) | 0; if (d0 > dst[i]) continue;
        for (let d = 0; d < 8; d++) {
          const nx = x + DX[d], ny = y + DY[d]; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          const j = ny * w + nx; if (!arm[j] || lab[i] === orig[j]) continue;
          const nd = d0 + (d >= 4 ? 1.41 : 1) * wob[j]; if (nd < dst[j]) { dst[j] = nd; lab[j] = lab[i]; hp.push(nd, j); }
        }
      }
      for (let i = 0; i < N; i++) if (arm[i] && lab[i] !== orig[i]) ch++;
      if (!ch) break;
      area.clear(); for (let i = 0; i < N; i++) if (lab[i] >= 0) area.set(lab[i], (area.get(lab[i]) || 0) + 1);
    }
    // обрізання не повинно відрізати столицю від решти провінції: інакше провінція повертається як була
    anchors.forEach((c, L) => { if (c == null || lab[c] !== L) return; const now = csize(lab, c); if (now < 40 || now < 0.5 * base[L]) for (let i = 0; i < N; i++) if (first[i] === L) lab[i] = L; });
  }
  // суцільність: у межах одного суходолу кожна мітка має одну частину (ту, де «якір», або найбільшу); решту віддаємо сусідній мітці, яку дозволяє ok(від, до)
  function joinParts(lab, w, h, landmass, anchorOf, ok) {
    const N = w * h, D = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    for (let pass = 0; pass < 6; pass++) {
      const seen = new Uint8Array(N), comps = new Map(); // ключ мітка|суходіл → [{cells}]
      for (let s = 0; s < N; s++) {
        const L = lab[s], lm = landmass[s]; if (L < 0 || lm < 0 || seen[s]) continue;
        const cells = [s], st = [s]; seen[s] = 1;
        while (st.length) { const i = st.pop(), x = i % w, y = (i / w) | 0; for (const [dx, dy] of D) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue; const j = ny * w + nx; if (!seen[j] && lab[j] === L && landmass[j] === lm) { seen[j] = 1; cells.push(j); st.push(j); } } }
        const key = L + '|' + lm; (comps.get(key) || comps.set(key, []).get(key)).push(cells);
      }
      let moved = 0;
      for (const [key, list] of comps) {
        if (list.length < 2) continue; const L = +key.split('|')[0], a = anchorOf(L);
        let main = list.findIndex(c => a != null && c.includes(a)); if (main < 0) { main = 0; list.forEach((c, k) => { if (c.length > list[main].length) main = k; }); }
        list.forEach((cells, k) => {
          if (k === main) return; const cnt = new Map();
          for (const i of cells) { const x = i % w, y = (i / w) | 0; for (const [dx, dy] of D) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue; const q = lab[ny * w + nx]; if (q >= 0 && q !== L && landmass[ny * w + nx] >= 0 && ok(L, q)) cnt.set(q, (cnt.get(q) || 0) + 1); } }
          let best = -1, bc = 0; for (const [q, c] of cnt) if (c > bc) { bc = c; best = q; }
          if (best >= 0) { for (const i of cells) lab[i] = best; moved++; }
        });
      }
      if (!moved) break;
    }
  }
  A.Grow = { joinParts, wobble, trimArms, grow, smooth, fixFragments, topNeighbor, stepCost };
})();
