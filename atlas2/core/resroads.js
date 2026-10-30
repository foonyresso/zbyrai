// Атлас 2.0: дороги до точок ресурсів (W.resRoads). Шахти, каменоломні, ліс, поля — возові шляхи (cart), угіддя, трави, вода — стежки (trail).
// Шлях тягнеться від точки до найближчої дороги (карти або вже прокладеної) чи до поселення; нові відрізки не дублюють існуючі.
(function () {
  'use strict';
  const A = globalThis.Atlas2, { DX, DY } = A.Grid;
  function build(W, nodes) {
    const { w, h } = W, N = w * h, lv = W.roadLevel, mine = new Uint8Array(N), dist = new Float32Array(N).fill(1e30), prev = new Int32Array(N).fill(-1), heap = new A.Heap(), list = [], big = (W.riverThr || 20) * 5;
    // примхи рельєфу (як у основних доріг): кожен шлях змішує два гладкі поля, тож вигинається; низини трохи дешевші; чужі міста з полями обходяться
    const nzr = A.Noise.make(W.params.seed + '|resroads'), F1 = new Float32Array(N), F2 = new Float32Array(N), rr = A.Rng.stream(W.params.seed, 'resroads'), owner = new Int32Array(N).fill(-1);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { F1[y * w + x] = nzr.fbm(x * 0.2, y * 0.2, 3); F2[y * w + x] = nzr.fbm(x * 0.11 + 40, y * 0.11 + 70, 3); }
    const BLK = { capital: 2400, regional: 1900, town: 1400, village: 800, hamlet: 450 }, cmm = W.params.kmPerCell * 1000;
    for (const s of W.settlements) { const R = BLK[s.rank] / cmm, r2 = Math.ceil(R); for (let dy = -r2; dy <= r2; dy++) for (let dx = -r2; dx <= r2; dx++) { const x = s.x + dx, y = s.y + dy; if (x >= 0 && y >= 0 && x < w && y < h && Math.hypot(dx, dy) <= R) owner[y * w + x] = s.id; } }
    const S = W.settlements, order = nodes.filter(n => n.road && n.sid != null).map(n => ({ n, d: Math.hypot(S[n.sid].x - n.x, S[n.sid].y - n.y) })).sort((a, b) => a.d - b.d);
    for (const { n } of order) {
      const s = S[n.sid], cart = n.road === 'cart', onNet = j => lv[j] || (cart ? mine[j] === 2 : mine[j] > 0); // гілка не може бути більшою за батьківську: возовий шлях відгалужується лише від основних доріг чи возових, стежка від будь-якої
      let start = n.i;
      if (!W.land[start] || W.lake[start]) { start = -1; for (let R = 1; R <= 3 && start < 0; R++) for (let d = 0; d < 8 && start < 0; d++) { const x = n.i % w + DX[d] * R, y = ((n.i / w) | 0) + DY[d] * R; if (x >= 0 && y >= 0 && x < w && y < h && W.land[y * w + x] && !W.lake[y * w + x]) start = y * w + x; } if (start < 0) continue; }
      const mA = rr(), wild = 1.6 + 2.4 * rr(), touched = [start]; dist[start] = 0; heap.k.length = 0; heap.v.length = 0; heap.push(0, start); let hit = -1;
      while (heap.size) {
        const i = heap.pop(), d0 = dist[i]; if (d0 > dist[i] + 1e-9) continue;
        if (i !== start && (onNet(i) || i === s.i)) { hit = i; break; } if (d0 > 400) break;
        const x = i % w, y = (i / w) | 0;
        for (let d = 0; d < 8; d++) {
          const nx = x + DX[d], ny = y + DY[d]; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue; const j = ny * w + nx;
          if (W.ocean[j] || W.lake[j] || (W.wallMask && W.wallMask[j] && !W.gateMask[j])) continue;
          let c = A.BIOMES[W.bio[j]].move + Math.abs(W.elev[j] - W.elev[i]) * 40; c += W.elev[j] * 3; if (W.river[j]) c += W.acc[j] > big ? 14 : 3; c *= 1 + wild * (mA * F1[j] + (1 - mA) * F2[j]); if (owner[j] >= 0 && owner[j] !== n.sid) c *= 5; if (onNet(j)) c *= 0.12; if (d >= 4) c *= 1.41;
          const nd = d0 + c; if (nd < dist[j]) { if (dist[j] > 1e29) touched.push(j); dist[j] = nd; prev[j] = i; heap.push(nd, j); }
        }
      }
      if (hit >= 0) {
        const p = []; for (let c = hit; c >= 0; c = prev[c]) p.push(c); p.reverse(); // від точки до дороги
        let k = 0; while (k < p.length) {
          if (onNet(p[k])) { k++; continue; } let e = k; while (e + 1 < p.length && !onNet(p[e + 1])) e++;
          const cells = p.slice(Math.max(0, k - 1), Math.min(p.length, e + 2)); for (let q = k; q <= e; q++) mine[p[q]] = Math.max(mine[p[q]], cart ? 2 : 1);
          list.push({ kind: n.road, node: n.id, sid: n.sid, cells }); k = e + 1;
        }
        n.linked = true; mine[n.i] = mine[n.i] || (cart ? 2 : 1); // точка сама стає вузлом мережі: від неї можуть іти гілки до інших точок
      }
      for (const c of touched) { dist[c] = 1e30; prev[c] = -1; }
    }
    W.resRoads = list;
  }
  A.ResRoads = { run: build };
})();
