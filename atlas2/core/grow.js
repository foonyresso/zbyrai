// Атлас 2.0: спільні допоміжні для політики: ріст міток хвилею Дейкстри за вартістю шляху, згладжування меж, виправлення уламків.
(function () {
  'use strict';
  const A = globalThis.Atlas2, { DX, DY, components } = A.Grid;

  // вартість кроку i→j: гори, болота, лісу й великі річки «дорожчі», тож межі лягають по хребтах і річках
  function stepCost(W, j, diag) {
    const slope = Math.abs(W.elev[j] - W.elev[j - (diag ? 0 : 0)]);
    return A.BIOMES[W.bio[j]].move * (1 + slope * 0) * (W.river[j] && W.acc[j] > 60 ? 2.2 : 1) * (diag ? 1.41 : 1);
  }
  // seeds: [{i,label,mul}]; allowed(i) → bool; повертає Int16Array міток (-1 без мітки)
  function grow(W, seeds, allowed) {
    const { w, h } = W, N = w * h, dist = new Float32Array(N).fill(1e9), lab = new Int16Array(N).fill(-1), mul = new Float32Array(N), heap = new A.Heap();
    for (const s of seeds) { dist[s.i] = 0; lab[s.i] = s.label; mul[s.i] = s.mul || 1; heap.push(0, s.i); }
    while (heap.size) {
      const i = heap.pop(), d0 = dist[i], x = i % w, y = (i / w) | 0;
      for (let d = 0; d < 8; d++) {
        const nx = x + DX[d], ny = y + DY[d]; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const j = ny * w + nx; if (!allowed(j)) continue;
        const slope = Math.abs(W.elev[j] - W.elev[i]) * 12;
        const nd = d0 + (stepCost(W, j, d >= 4) + slope) * mul[i];
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
  A.Grow = { grow, smooth, fixFragments, topNeighbor, stepCost };
})();
