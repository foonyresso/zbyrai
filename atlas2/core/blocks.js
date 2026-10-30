// Атлас 2.0: безкінечний основний світ. Що тут: сітка блоків-материків (кожен блок — звичайна карта з океанським краєм, зерно = хеш від зерна світу й координат), ліниве створення, вивантаження далеких, морські шляхи між портами сусідніх блоків. Опис: docs/atlas2/infinite.md
(function () {
  'use strict';
  const A = globalThis.Atlas2, { DX, DY } = A.Grid;
  const key = (bx, by) => bx + ',' + by;
  // домашній блок (0,0) має зерно світу без змін: збережені карти й посилання відкриваються так само, як раніше
  const blockSeed = (seed, bx, by) => bx === 0 && by === 0 ? String(seed) : seed + '|' + bx + ',' + by;
  const blockParams = (base, bx, by) => A.Params.normalize(Object.assign({}, base, { seed: blockSeed(base.seed, bx, by), wseed: base.seed, bx, by }));

  // ---- морські шляхи між двома сусідніми блоками: пошук по спільній сітці води (океан обох блоків), нові відрізки зливаються з наявними шляхами блоків
  function portsOf(blk) { return blk.W.settlements.filter(s => s.port && s.body === -1 && !s.ruined); }
  function seaLinks(a, b, bw, bh) {
    const x0 = Math.min(a.ox, b.ox), y0 = Math.min(a.oy, b.oy), RW = Math.max(a.ox, b.ox) + bw - x0, RH = Math.max(a.oy, b.oy) + bh - y0, N = RW * RH;
    const water = new Uint8Array(N), net = new Uint8Array(N), ld = new Uint8Array(N).fill(255), cell = (blk, x, y) => (blk.oy - y0 + y) * RW + blk.ox - x0 + x;
    for (const blk of [a, b]) {
      const W = blk.W; for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) water[cell(blk, x, y)] = W.ocean[y * bw + x];
      for (const r of W.seaRoutes || []) for (const c of r.cells) net[cell(blk, c % bw, (c / bw) | 0)] = 1;
    }
    const q = []; for (let i = 0; i < N; i++) if (!water[i]) { ld[i] = 0; q.push(i); } // відстань від суші (клітини), як у core/searoutes.js
    for (let k = 0; k < q.length; k++) { const i = q[k]; if (ld[i] >= 14) continue; const x = i % RW, y = (i / RW) | 0; for (let d = 0; d < 4; d++) { const nx = x + DX[d], ny = y + DY[d]; if (nx < 0 || ny < 0 || nx >= RW || ny >= RH) continue; const j = ny * RW + nx; if (ld[j] > ld[i] + 1) { ld[j] = ld[i] + 1; q.push(j); } } }
    const wet = (blk, s) => { let bi = -1, bd = 1e9; for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) { const x = s.x + dx, y = s.y + dy; if (x < 0 || y < 0 || x >= bw || y >= bh) continue; if (blk.W.ocean[y * bw + x] && dx * dx + dy * dy < bd) { bd = dx * dx + dy * dy; bi = cell(blk, x, y); } } return bi; };
    const pa = portsOf(a).map(s => ({ s, blk: a, c: wet(a, s), gx: a.ox + s.x, gy: a.oy + s.y })).filter(o => o.c >= 0), pb = portsOf(b).map(s => ({ s, blk: b, c: wet(b, s), gx: b.ox + s.x, gy: b.oy + s.y })).filter(o => o.c >= 0);
    const pairs = []; for (const u of pa) for (const v of pb) pairs.push([Math.hypot(u.gx - v.gx, u.gy - v.gy), u, v]); pairs.sort((m, n) => m[0] - n[0]);
    const chosen = []; for (const p of pairs) { // найкоротша пара й до однієї запасної, з інших портів і не поруч з першою
      if (!chosen.length) { chosen.push(p); continue; } const f = chosen[0];
      if (chosen.length === 1 && p[0] <= f[0] * 1.8 + 60 && p[1] !== f[1] && p[2] !== f[2] && Math.hypot(p[1].gx - f[1].gx, p[1].gy - f[1].gy) > 20 && Math.hypot(p[2].gx - f[2].gx, p[2].gy - f[2].gy) > 20) chosen.push(p);
    }
    const dist = new Float32Array(N), prev = new Int32Array(N), heap = new A.Heap(), out = [];
    for (const [, u, v] of chosen) {
      dist.fill(1e30); prev.fill(-1); heap.k.length = 0; heap.v.length = 0; dist[u.c] = 0; heap.push(0, u.c); let ok = false;
      while (heap.size) {
        const i = heap.pop(); if (i === v.c) { ok = true; break; } const x = i % RW, y = (i / RW) | 0;
        for (let d = 0; d < 8; d++) {
          const nx = x + DX[d], ny = y + DY[d]; if (nx < 0 || ny < 0 || nx >= RW || ny >= RH) continue; const j = ny * RW + nx; if (!water[j]) continue;
          let c = (1 + 0.25 * Math.abs(Math.min(ld[j], 14) - 4)) * (d >= 4 ? 1.41 : 1); if (net[j]) c *= 0.15;
          const nd = dist[i] + c; if (nd < dist[j]) { dist[j] = nd; prev[j] = i; heap.push(nd, j); }
        }
      }
      if (!ok) continue; const path = []; for (let c = v.c; c >= 0; c = prev[c]) path.push(c); path.reverse();
      const segs = []; let k = 0; while (k < path.length) { // лише нові відрізки (з одним сусідом перекриття, щоб лінії сходились зі старими)
        if (net[path[k]]) { k++; continue; } let e = k; while (e + 1 < path.length && !net[path[e + 1]]) e++;
        const pts = []; for (let m = Math.max(0, k - 1); m <= Math.min(path.length - 1, e + 1); m++) pts.push(x0 + (path[m] % RW) + 0.5, y0 + ((path[m] / RW) | 0) + 0.5); segs.push(pts); for (let m = k; m <= e; m++) net[path[m]] = 1; k = e + 1;
      }
      out.push({ a: key(a.bx, a.by), b: key(b.bx, b.by), from: u.s.id, to: v.s.id, fromName: u.s.name, toName: v.s.name, km: Math.round(path.length * a.W.params.kmPerCell * 10) / 10, segs });
    }
    return out;
  }

  // ---- менеджер блоків: кеш світів, черга створення, вивантаження, шляхи між блоками
  // hooks: { progress(частка, назва кроку, bx, by), added(блок) }
  function create(params, hooks) {
    const base = A.Params.normalize(params), bw = base.w, bh = base.h, map = new Map(), links = [], linked = new Set(), h = hooks || {};
    let queue = [], wanted = new Set(), busy = false, dead = false, waiters = [];
    const self = {
      params: base, bw, bh, links, key,
      get: (bx, by) => map.get(key(bx, by)) || null,
      list: () => Array.from(map.values()),
      has: W => !!W && !!W.blk && map.get(key(W.blk.bx, W.blk.by)) === W.blk,
      // додає готовий світ як блок (bx, by); рахує морські шляхи до вже наявних сусідів
      add(bx, by, W) {
        const blk = { bx, by, ox: bx * bw, oy: by * bh, W }; W.blk = blk; map.set(key(bx, by), blk);
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const n = map.get(key(bx + dx, by + dy)); if (!n) continue; const a = dx + dy > 0 ? blk : n, b = a === blk ? n : blk, pk = key(a.bx, a.by) + '|' + key(b.bx, b.by);
          if (linked.has(pk)) continue; linked.add(pk); for (const l of seaLinks(a, b, bw, bh)) links.push(l);
        }
        return blk;
      },
      // бажані блоки (за порядком важливості): те, чого тут нема й нема в черзі, створюється по одному; зайве в черзі скасовується
      request(cells) {
        wanted = new Set(cells.map(c => key(c[0], c[1]))); queue = cells.filter(c => !map.has(key(c[0], c[1])));
        if (!busy && queue.length && !dead) run();
      },
      // вивантаження: лишається не більше max блоків, найдальші від (cx, cy) йдуть першими; keep — ключі, які не чіпати; повертає вивантажені
      evict(cx, cy, max, keep) {
        const out = []; while (map.size > max) {
          let worst = null, wd = -1; for (const b of map.values()) { if ((keep && keep.has(key(b.bx, b.by))) || (b.bx === 0 && b.by === 0)) continue; const d = Math.max(Math.abs(b.bx - cx), Math.abs(b.by - cy)) * 1000 + Math.hypot(b.bx - cx, b.by - cy); if (d > wd) { wd = d; worst = b; } }
          if (!worst) break; map.delete(key(worst.bx, worst.by)); worst.W.blk = null; out.push(worst);
        }
        return out;
      },
      busy: () => busy || queue.length > 0,
      idle: () => busy || queue.length ? new Promise(r => waiters.push(r)) : Promise.resolve(),
      dispose() { dead = true; queue = []; wanted.clear(); }
    };
    async function run() {
      busy = true;
      try {
        while (queue.length && !dead) {
          const [bx, by] = queue.shift(), k = key(bx, by); if (map.has(k)) continue;
          const W = await A.generateAsync(blockParams(base, bx, by), (f, l) => dead || !wanted.has(k) ? false : (h.progress && h.progress(f, l, bx, by), true));
          if (!W || dead) continue; const blk = self.add(bx, by, W); if (h.added) h.added(blk);
        }
      } finally { busy = false; const w = waiters; waiters = []; for (const r of w) r(); }
    }
    return self;
  }
  A.Blocks = { create, blockSeed, blockParams, key, seaLinks };
})();
