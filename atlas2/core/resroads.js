// Атлас 2.0: дороги до точок ресурсів (W.resRoads). Шахти, каменоломні, ліс, поля — возові шляхи (cart), угіддя, трави, вода — стежки (trail).
// Шлях тягнеться від точки до найближчої дороги (карти або вже прокладеної) чи до поселення; нові відрізки не дублюють існуючі.
(function () {
  'use strict';
  const A = globalThis.Atlas2, { DX, DY } = A.Grid;
  function build(W, nodes) {
    const { w, h } = W, N = w * h, lv = W.roadLevel, mine = new Uint8Array(N), dist = new Float32Array(N).fill(1e30), prev = new Int32Array(N).fill(-1), heap = new A.Heap(), list = [], big = (W.riverThr || 20) * 5;
    const S = W.settlements, order = nodes.filter(n => n.road && n.sid != null).map(n => ({ n, d: Math.hypot(S[n.sid].x - n.x, S[n.sid].y - n.y) })).sort((a, b) => a.d - b.d);
    for (const { n } of order) {
      const s = S[n.sid]; let start = n.i;
      if (!W.land[start] || W.lake[start]) { start = -1; for (let R = 1; R <= 3 && start < 0; R++) for (let d = 0; d < 8 && start < 0; d++) { const x = n.i % w + DX[d] * R, y = ((n.i / w) | 0) + DY[d] * R; if (x >= 0 && y >= 0 && x < w && y < h && W.land[y * w + x] && !W.lake[y * w + x]) start = y * w + x; } if (start < 0) continue; }
      const touched = [start]; dist[start] = 0; heap.k.length = 0; heap.v.length = 0; heap.push(0, start); let hit = -1;
      while (heap.size) {
        const i = heap.pop(), d0 = dist[i]; if (d0 > dist[i] + 1e-9) continue;
        if (i !== start && (lv[i] || mine[i] || i === s.i)) { hit = i; break; } if (d0 > 400) break;
        const x = i % w, y = (i / w) | 0;
        for (let d = 0; d < 8; d++) {
          const nx = x + DX[d], ny = y + DY[d]; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue; const j = ny * w + nx;
          if (W.ocean[j] || W.lake[j] || (W.wallMask && W.wallMask[j] && !W.gateMask[j])) continue;
          let c = A.BIOMES[W.bio[j]].move + Math.abs(W.elev[j] - W.elev[i]) * 40; if (W.river[j]) c += W.acc[j] > big ? 14 : 3; if (lv[j] || mine[j]) c *= 0.12; if (d >= 4) c *= 1.41;
          const nd = d0 + c; if (nd < dist[j]) { if (dist[j] > 1e29) touched.push(j); dist[j] = nd; prev[j] = i; heap.push(nd, j); }
        }
      }
      if (hit >= 0) {
        const p = []; for (let c = hit; c >= 0; c = prev[c]) p.push(c); p.reverse(); // від точки до дороги
        let k = 0; while (k < p.length) {
          if (lv[p[k]] || mine[p[k]]) { k++; continue; } let e = k; while (e + 1 < p.length && !lv[p[e + 1]] && !mine[p[e + 1]]) e++;
          const cells = p.slice(Math.max(0, k - 1), Math.min(p.length, e + 2)); for (let q = k; q <= e; q++) mine[p[q]] = n.road === 'cart' ? 2 : 1;
          list.push({ kind: n.road, node: n.id, sid: n.sid, cells }); k = e + 1;
        }
        n.linked = true;
      }
      for (const c of touched) { dist[c] = 1e30; prev[c] = -1; }
    }
    W.resRoads = list;
  }
  A.ResRoads = { run: build };
})();
