// Атлас 2.0, етап: назви водойм. Озера мають назви; океан біля берегів ділиться на моря, далі йдуть 2–5 велетенських океанів.
// W.waterBody[i] = індекс у W.waterBodies (або -1 на суші): {id, kind: 'ocean'|'sea'|'lake', name, cells, cx, cy, radius}.
(function () {
  'use strict';
  const A = globalThis.Atlas2, { DX, DY } = A.Grid;

  // відстань (хамфер 1 / 1.41) від джерел до всіх клітин
  function chamfer(w, h, isSrc) {
    const N = w * h, d = new Float32Array(N); for (let i = 0; i < N; i++) d[i] = isSrc(i) ? 0 : 1e9;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y * w + x; let v = d[i]; if (x) v = Math.min(v, d[i - 1] + 1); if (y) { v = Math.min(v, d[i - w] + 1); if (x) v = Math.min(v, d[i - w - 1] + 1.414); if (x < w - 1) v = Math.min(v, d[i - w + 1] + 1.414); } d[i] = v; }
    for (let y = h - 1; y >= 0; y--) for (let x = w - 1; x >= 0; x--) { const i = y * w + x; let v = d[i]; if (x < w - 1) v = Math.min(v, d[i + 1] + 1); if (y < h - 1) { v = Math.min(v, d[i + w] + 1); if (x < w - 1) v = Math.min(v, d[i + w + 1] + 1.414); if (x) v = Math.min(v, d[i + w - 1] + 1.414); } d[i] = v; }
    return d;
  }

  function seas(W) {
    const { w, h } = W, N = w * h, r = A.Rng.stream(W.params.seed, 'seas'), names = A.Names.make(W.params.seed + '|seas'), body = new Int16Array(N).fill(-1), list = [];
    const add = (kind, name) => { const b = { id: list.length, kind, name, cells: 0, cx: 0, cy: 0, radius: 0 }; list.push(b); return b.id; };
    // озера
    for (const l of W.lakes) { const id = add('lake', 'Озеро ' + names.region(names.lang())); l.waterBody = id; for (const c of l.cells) body[c] = id; }
    // океан: смуга моря біля суші, далі — океани
    const ocean = []; for (let i = 0; i < N; i++) if (W.ocean[i]) ocean.push(i);
    if (ocean.length) {
      // «берегом» вважаємо великі суходоли (дрібні далекі острови не обривають океан)
      const lc = A.Grid.components(w, h, i => !W.ocean[i]), bigMin = Math.max(1500, 0.08 * Math.max(...lc.sizes));
      const dl = chamfer(w, h, i => !W.ocean[i] && lc.sizes[lc.id[i]] >= bigMin), ds = ocean.map(i => dl[i]).sort((a, b) => a - b);
      const BAND = Math.max(36, Math.min(200, ds[Math.floor(ds.length * 0.5)])), far = new Uint8Array(N);
      for (const i of ocean) if (dl[i] > BAND) far[i] = 1;
      // дрібні відокремлені «далекі» плями (затоки глибше за смугу) лишаються морем
      const fc = A.Grid.components(w, h, i => far[i] === 1), minFar = ocean.length * 0.02;
      for (let i = 0; i < N; i++) if (far[i] && fc.sizes[fc.id[i]] < minFar) far[i] = 0;
      const owner = new Int16Array(N).fill(-1), heap = new A.Heap(), dist = new Float32Array(N).fill(1e30);
      const flood = (seeds, allowed) => { // Дейкстра від насіння по дозволених клітинах: прилеглі області однієї водойми суцільні
        heap.k.length = 0; heap.v.length = 0; for (const [c, id] of seeds) { owner[c] = id; dist[c] = 0; heap.push(0, c); }
        while (heap.size) { const i = heap.pop(), x = i % w, y = (i / w) | 0, di = dist[i]; for (let d = 0; d < 8; d++) { const nx = x + DX[d], ny = y + DY[d]; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue; const j = ny * w + nx; if (!allowed(j)) continue; const nd = di + (d >= 4 ? 1.414 : 1); if (nd < dist[j]) { dist[j] = nd; owner[j] = owner[i]; heap.push(nd, j); } } }
      };
      const pick = (cells, existing, spacing, tries) => { // насіння на відстані від наявного, кандидати випадкові
        let best = -1, bs = -1; for (let t = 0; t < tries; t++) { const c = cells[Math.floor(r() * cells.length)], x = c % w, y = (c / w) | 0; let m = 1e9; for (const e of existing) m = Math.min(m, Math.hypot(e[0] - x, e[1] - y)); if (m > bs) { bs = m; best = c; } }
        return bs >= spacing ? best : -1;
      };
      // океани: 2–5 штук серед далеких клітин (за кількістю плям і розміром)
      const farCells = ocean.filter(i => far[i]), K = 2 + Math.floor(r() * 4), oceanIds = [], oseeds = [], oex = [];
      if (farCells.length > 400) {
        const nK = Math.min(K, Math.max(1, Math.floor(farCells.length / 2500)));
        for (let k = 0; k < nK; k++) { const c = pick(farCells, oex, 0, 400); if (c < 0) break; oex.push([c % w, (c / w) | 0]); const id = add('ocean', 'Океан ' + names.region(names.lang())); oceanIds.push(id); oseeds.push([c, id]); }
        flood(oseeds, j => far[j] === 1);
      }
      // моря: насіння по смузі біля суші, не ближче ~2 півширин смуги одне від одного; кожна пляма води має хоч одне
      const bandCells = ocean.filter(i => !far[i] || owner[i] < 0), spacing = BAND * 3, sex = [], sseeds = [];
      for (let t = 0; t < 400 && bandCells.length; t++) { const c = pick(bandCells, sex, spacing, 40); if (c < 0) break; sex.push([c % w, (c / w) | 0]); sseeds.push([c, add('sea', 'Море ' + names.region(names.lang()))]); }
      const ownerO = owner.slice(); owner.fill(-1); dist.fill(1e30);
      flood(sseeds, j => W.ocean[j] && !(far[j] && ownerO[j] >= 0));
      // пляма смуги, до якої насіння не дійшло, стає окремим морем
      const bc = A.Grid.components(w, h, j => W.ocean[j] && !(far[j] && ownerO[j] >= 0)), seen = new Set();
      for (let i = 0; i < N; i++) if (W.ocean[i] && !(far[i] && ownerO[i] >= 0) && owner[i] < 0 && !seen.has(bc.id[i]) && bc.sizes[bc.id[i]] >= 12) { seen.add(bc.id[i]); const id = add('sea', 'Море ' + names.region(names.lang())); flood([[i, id]], j => W.ocean[j] && !(far[j] && ownerO[j] >= 0) && owner[j] < 0); }
      for (const i of ocean) body[i] = far[i] && ownerO[i] >= 0 ? ownerO[i] : owner[i];
    }
    // підписи: найглибша точка водойми (відстань до суші, іншої водойми й краю карти)
    const diff = chamfer(w, h, i => { if (body[i] < 0) return true; const x = i % w, y = (i / w) | 0; if (x === 0 || y === 0 || x === w - 1 || y === h - 1) return true; for (let d = 0; d < 4; d++) if (body[(y + DY[d]) * w + x + DX[d]] !== body[i]) return true; return false; });
    const bestD = list.map(() => -1);
    for (let i = 0; i < N; i++) { const b = body[i]; if (b < 0) continue; const o = list[b]; o.cells++; if (diff[i] > bestD[b]) { bestD[b] = diff[i]; o.cx = i % w; o.cy = (i / w) | 0; o.radius = diff[i]; } }
    W.waterBody = body; W.waterBodies = list;
  }
  A.seas = seas; A.chamfer = chamfer;
  (A.stages = A.stages || []).push(seas);
})();
