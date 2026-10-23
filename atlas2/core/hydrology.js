// Атлас 2.0, етап 2: вода за правилами. Priority-flood: кожна клітина суші стікає вниз до океану (ніколи вгору, без циклів).
// Западини заповнюються: озеро = заповнена западина з одним витоком (точка переливу). Річка = клітини з великим накопиченням стоку.
(function () {
  'use strict';
  const A = globalThis.Atlas2, { DX, DY, components } = A.Grid;

  function hydrology(p, T) {
    const { w, h } = p, N = w * h, nz = A.Noise.make(p.seed + '|rain');
    const rain = new Float32Array(N);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) rain[y * w + x] = nz.fbm(x / w * 3.5 + 11, y / h * 3.5 + 5, 4);
    const fill = new Float64Array(N), down = new Int32Array(N).fill(-1), seen = new Uint8Array(N), order = [];
    const heap = new A.Heap();
    for (let i = 0; i < N; i++) if (T.ocean[i]) { fill[i] = T.height[i]; seen[i] = 1; heap.push(fill[i], i); }
    const eps = 4e-6, jr = A.Rng.stream(p.seed, 'flat');
    while (heap.size) {
      const c = heap.pop(); order.push(c); const x = c % w, y = (c / w) | 0;
      for (let d = 0; d < 8; d++) {
        const nx = x + DX[d], ny = y + DY[d]; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const n = ny * w + nx; if (seen[n]) continue; seen[n] = 1;
        fill[n] = Math.max(T.height[n], fill[c] + eps * (0.3 + 1.7 * jr()) * (d < 4 ? 1 : 1.4)); down[n] = c; heap.push(fill[n], n);
      }
    }
    // озера: западини глибше порога (і внутрішня вода нижче рівня моря), компоненти ≥ 4 клітин
    const depth = new Float32Array(N); for (let i = 0; i < N; i++) if (!T.ocean[i]) depth[i] = fill[i] - T.height[i];
    const cand = new Uint8Array(N); for (let i = 0; i < N; i++) cand[i] = !T.ocean[i] && (depth[i] > p.lakeDepth || !T.land[i]) ? 1 : 0;
    const acc0 = new Float32Array(N); for (let i = 0; i < N; i++) if (!T.ocean[i]) acc0[i] = 0.4 + rain[i];
    for (let k = order.length - 1; k >= 0; k--) { const c = order[k], d = down[c]; if (d >= 0 && !T.ocean[c]) acc0[d] += acc0[c]; }
    const lc = components(w, h, i => cand[i] === 1), lake = new Uint8Array(N), lakeId = new Int32Array(N).fill(-1), lakes = [];
    const maxAcc = new Float32Array(lc.sizes.length); for (let i = 0; i < N; i++) if (lc.id[i] >= 0 && acc0[i] > maxAcc[lc.id[i]]) maxAcc[lc.id[i]] = acc0[i];
    lc.sizes.forEach((s, k) => { if (s >= 8 && maxAcc[k] >= p.lakeFlow) lakes.push({ id: lakes.length, cells: [], size: s, comp: k }); }); // озеро: западина з притоком води
    const byComp = new Map(lakes.map(l => [l.comp, l]));
    for (let i = 0; i < N; i++) { const l = byComp.get(lc.id[i]); if (cand[i] && l) { lake[i] = 1; lakeId[i] = l.id; l.cells.push(i); } }
    // накопичення стоку (у порядку від найвищих до океану)
    const acc = new Float32Array(N);
    for (let i = 0; i < N; i++) if (!T.ocean[i]) acc[i] = 0.4 + rain[i];
    for (let k = order.length - 1; k >= 0; k--) { const c = order[k], d = down[c]; if (d >= 0 && !T.ocean[c]) acc[d] += acc[c]; }
    let landN = 0; for (let i = 0; i < N; i++) if (!T.ocean[i]) landN++;
    const thr = Math.max(8, landN / (320 * p.riverDensity));
    const river = new Uint8Array(N);
    for (let i = 0; i < N; i++) if (!T.ocean[i] && !lake[i] && acc[i] >= thr) river[i] = 1;
    // шляхи річок: від витоку вниз до океану або до вже накресленої річки
    const inflow = new Uint8Array(N); for (let i = 0; i < N; i++) if (river[i] && down[i] >= 0 && river[down[i]]) inflow[down[i]]++;
    const used = new Uint8Array(N), rivers = [];
    const src = []; for (let i = 0; i < N; i++) if (river[i] && !inflow[i]) src.push(i);
    src.sort((a, b) => acc[b] - acc[a]);
    for (const s of src) {
      const path = []; let c = s;
      for (;;) {
        path.push(c); if (used[c]) break; used[c] = 1;
        const d = down[c]; if (d < 0) break; c = d; if (T.ocean[c]) { path.push(c); break; }
      }
      if (path.length >= 3) rivers.push(path);
    }
    // річка закінчується в першій клітині біля океану (гирло): не йде вздовж берега й не виходить з океану в океан
    const oceanNb = i => { const x = i % w, y = (i / w) | 0; if (down[i] >= 0 && T.ocean[down[i]]) return down[i]; for (let d = 0; d < 8; d++) { const nx = x + DX[d], ny = y + DY[d]; if (nx >= 0 && ny >= 0 && nx < w && ny < h && T.ocean[ny * w + nx]) return ny * w + nx; } return -1; };
    // усі шляхи обрізаються по гирлу; короткі зберігаються, якщо в них впадає інша річка (щоб притоки не обривались у порожнечі)
    const cut = [];
    for (const pa of rivers) {
      const cells = []; let mouth = -1;
      for (const c of pa) { if (T.ocean[c]) break; cells.push(c); const o = oceanNb(c); if (o >= 0) { mouth = o; break; } }
      if (mouth >= 0) cells.push(mouth); if (cells.length >= 2) cut.push({ cells, ok: cells.length >= 9 });
    }
    for (let it = 0; it < 6; it++) {
      const tgt = new Set(); for (const r of cut) if (r.ok) { const l = r.cells[r.cells.length - 1]; if (!T.ocean[l]) tgt.add(l); }
      let ch = false; for (const r of cut) if (!r.ok && r.cells.some(c => tgt.has(c))) { r.ok = true; ch = true; } if (!ch) break;
    }
    const keep = cut.filter(r => r.ok).map(r => r.cells);
    // річки не течуть упритул паралельно: шлях, що підійшов до клітини вже накресленої (більшої) річки, зливається з нею там
    const claimed = new Uint8Array(N);
    for (const cells of keep) {
      const mine = new Set(cells.slice(0, 2)); let end = cells.length;
      for (let k = 0; k < cells.length && end === cells.length; k++) {
        const c = cells[k]; if (T.ocean[c]) break;
        if (claimed[c]) { end = k + 1; break; }
        if (k < 2) continue;
        const x = c % w, y = (c / w) | 0;
        for (let d = 0; d < 8; d++) { const nx = x + DX[d], ny = y + DY[d]; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue; const j = ny * w + nx; if (claimed[j] && !mine.has(j)) { cells.length = k + 1; cells.push(j); end = -1; break; } }
        if (end === -1) break; mine.add(c);
      }
      if (end > 0 && end < cells.length) cells.length = end;
      for (const c of cells) claimed[c] = 1;
    }
    // кожна річка доходить до моря: якщо шлях закінчився на чужому руслі, воно вже веде до моря; якщо ні, добудовуємо вниз за стоком
    const inKeep = new Set(); for (const c of keep) for (const x of c) inKeep.add(x);
    for (const cells of keep) {
      let c = cells[cells.length - 1], g = 0;
      while (!T.ocean[c] && g++ < 4000) { const d = down[c]; if (d < 0) break; cells.push(d); if (T.ocean[d] || (inKeep.has(d) && d !== c && !cells.slice(0, -1).includes(d) && g > 0 && river[d])) break; c = d; }
      for (const x of cells) inKeep.add(x);
    }
    const live = new Uint8Array(N); for (const pa of keep) for (const c of pa) live[c] = 1;
    for (let i = 0; i < N; i++) if (river[i] && !live[i]) river[i] = 0;
    rivers.length = 0; rivers.push(...keep);
    return { rain, fill, down, depth, lake, lakeId, lakes, acc, river, rivers, riverThr: thr };
  }
  A.hydrology = hydrology;
})();
