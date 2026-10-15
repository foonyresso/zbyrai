// Річки й озера: заповнення западин (priority-flood) → напрямок стоку → накопичення потоку → шляхи від витоків до гирла.
(function () {
  'use strict';
  const R = (globalThis.RealmMap = globalThis.RealmMap || {});

  // Повертає {flow, dir, river(0/1), rivers[], lakeCells}. water оновлюється: западини глибше за поріг стають озерами (2).
  function buildRivers(g, ht, water, moist, p) {
    const n = g.n, filled = new Float32Array(n).fill(1e9), done = new Uint8Array(n), nb = new Int32Array(8), H = new R.MinHeap();
    for (let i = 0; i < n; i++) if (water[i] === 1) { filled[i] = ht[i]; done[i] = 1; H.push(ht[i], i); }
    while (H.size) {
      const c = H.pop(), m = R.Grid.neighbors(g, c, true, nb);
      for (let k = 0; k < m; k++) { const j = nb[k]; if (done[j]) continue; done[j] = 1; filled[j] = Math.max(ht[j], filled[c] + 1e-5); H.push(filled[j], j); }
    }
    // озера: де заповнення піднімає поверхню помітно, і западина не крихітна
    const lakeDepth = 0.013 * (1.2 - p.wet);
    const cand = new Uint8Array(n);
    for (let i = 0; i < n; i++) if (water[i] === 0 && filled[i] - ht[i] > lakeDepth) cand[i] = 1;
    const comp = R.Grid.components(g, i => cand[i] === 1, true);
    for (let i = 0; i < n; i++) if (comp.id[i] >= 0 && comp.sizes[comp.id[i]] >= 3) water[i] = 2;
    // напрямок стоку: найнижчий сусід за заповненою поверхнею
    const dir = new Int32Array(n).fill(-1), order = [];
    for (let i = 0; i < n; i++) order.push(i);
    order.sort((a, b) => filled[b] - filled[a] || a - b);
    for (let i = 0; i < n; i++) {
      if (water[i] === 1) continue;
      const m = R.Grid.neighbors(g, i, true, nb); let best = -1, bf = filled[i];
      for (let k = 0; k < m; k++) { const j = nb[k]; if (filled[j] < bf - 1e-9) { bf = filled[j]; best = j; } }
      dir[i] = best;
    }
    const flow = new Float32Array(n);
    for (let i = 0; i < n; i++) if (water[i] !== 1) flow[i] = 0.4 + moist[i];
    for (const i of order) { if (water[i] === 1) continue; const d = dir[i]; if (d >= 0) flow[d] += flow[i]; }
    const thr = Math.max(14, Math.sqrt(n) * 0.14 / p.riverDensity);
    const river = new Uint8Array(n);
    for (let i = 0; i < n; i++) if (water[i] === 0 && flow[i] >= thr) river[i] = 1;
    // шляхи: від клітин без річкового припливу вниз за течією до моря, озера або вже пройденої клітини
    const hasIn = new Uint8Array(n);
    for (let i = 0; i < n; i++) if (river[i] && dir[i] >= 0 && river[dir[i]]) hasIn[dir[i]] = 1;
    const seen = new Uint8Array(n), rivers = [];
    const starts = []; for (let i = 0; i < n; i++) if (river[i] && !hasIn[i]) starts.push(i);
    starts.sort((a, b) => flow[b] - flow[a] || a - b);
    for (const s of starts) {
      const path = []; let c = s;
      while (c >= 0) {
        path.push(c);
        if (water[c] !== 0) break;
        if (seen[c] && c !== s) break;
        seen[c] = 1; const d = dir[c];
        if (d < 0) break;
        if (!river[d] && water[d] === 0) break;
        c = d;
      }
      if (path.length >= 3) { let last = path.length - 1; while (last > 0 && water[path[last]] !== 0) last--; rivers.push({ cells: path, flow: flow[path[last]] }); }
    }
    return { flow, dir, river, rivers, filled };
  }
  R.Rivers = { buildRivers };
})();
