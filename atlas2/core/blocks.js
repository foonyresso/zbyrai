// Атлас 2.0: безкінечний основний світ. Що тут: менеджер материків (ліниве створення за кліком на хмару, вивантаження далеких, морські шляхи між портами сусідніх материків). Тайли й контури живуть у core/tiles.js. Опис: docs/atlas2/layout.md
(function () {
  'use strict';
  const A = globalThis.Atlas2, { DX, DY } = A.Grid;
  const key = (bx, by) => bx + ',' + by; // ключ старого формату (лишився в експорті ключів шляхів)

  // ---- морські шляхи між двома сусідніми блоками: пошук по спільній сітці води (океан обох блоків), нові відрізки зливаються з наявними шляхами блоків
  function portsOf(blk) { return blk.W.settlements.filter(s => s.port && s.body === -1 && !s.ruined); }
  function seaLinks(a, b) {
    const x0 = Math.min(a.ox, b.ox), y0 = Math.min(a.oy, b.oy), RW = Math.max(a.ox + a.W.w, b.ox + b.W.w) - x0, RH = Math.max(a.oy + a.W.h, b.oy + b.W.h) - y0, N = RW * RH;
    const water = new Uint8Array(N).fill(1), net = new Uint8Array(N), ld = new Uint8Array(N).fill(255), cell = (blk, x, y) => (blk.oy - y0 + y) * RW + blk.ox - x0 + x; // вода: усе, що не суша й не озеро жодного з двох материків (смуга між тайлами теж море)
    for (const blk of [a, b]) {
      const W = blk.W, bw = W.w, bh = W.h; for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) if (!W.ocean[y * bw + x]) water[cell(blk, x, y)] = 0;
      for (const r of W.seaRoutes || []) for (const c of r.cells) net[cell(blk, c % bw, (c / bw) | 0)] = 1;
    }
    const q = []; for (let i = 0; i < N; i++) if (!water[i]) { ld[i] = 0; q.push(i); } // відстань від суші (клітини), як у core/searoutes.js
    for (let k = 0; k < q.length; k++) { const i = q[k]; if (ld[i] >= 14) continue; const x = i % RW, y = (i / RW) | 0; for (let d = 0; d < 4; d++) { const nx = x + DX[d], ny = y + DY[d]; if (nx < 0 || ny < 0 || nx >= RW || ny >= RH) continue; const j = ny * RW + nx; if (ld[j] > ld[i] + 1) { ld[j] = ld[i] + 1; q.push(j); } } }
    const wet = (blk, s) => { const bw = blk.W.w, bh = blk.W.h; let bi = -1, bd = 1e9; for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) { const x = s.x + dx, y = s.y + dy; if (x < 0 || y < 0 || x >= bw || y >= bh) continue; if (blk.W.ocean[y * bw + x] && dx * dx + dy * dy < bd) { bd = dx * dx + dy * dy; bi = cell(blk, x, y); } } return bi; };
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
      out.push({ a: a.id, b: b.id, from: u.s.id, to: v.s.id, fromName: u.s.name, toName: v.s.name, km: Math.round(path.length * a.W.params.kmPerCell * 10) / 10, segs });
    }
    return out;
  }

  // ---- менеджер материків: кеш світів, черга створення (за кліком на хмару), вивантаження, шляхи між сусідніми материками
  // hooks: { progress(частка, назва кроку, desc), added(блок) }
  function create(params, hooks) {
    const base = A.Params.normalize(params), prov = A.Tiles.create(base), gen = (hooks && hooks.generate) || A.generateAsync, map = new Map(), links = [], linked = new Set(), h = hooks || {};
    let queue = [], busy = false, dead = false, waiters = [], current = null;
    const self = {
      params: base, prov, home: prov.home, links, key,
      paramsOf: d => prov.paramsOf(d),
      get: id => map.get(id) || null,
      list: () => Array.from(map.values()),
      has: W => !!W && !!W.blk && map.get(W.blk.id) === W.blk,
      descsIn: (x0, y0, x1, y1) => prov.descsIn(x0, y0, x1, y1),
      // материк (опис), що містить точку світу; null, якщо там відкрите море
      at: (gx, gy) => prov.at(gx, gy),
      // додає готовий світ як материк d; рахує морські шляхи до вже створених сусідів
      add(d, W) {
        const blk = { id: d.id, desc: d, bx: d.bx | 0, by: d.by | 0, ox: d.ox, oy: d.oy, W }; W.blk = blk; map.set(d.id, blk);
        for (const o of prov.near(d)) {
          const n = map.get(o.id); if (!n) continue; const a = blk.id < n.id ? blk : n, b = a === blk ? n : blk, pk = a.id + '|' + b.id;
          if (linked.has(pk)) continue; linked.add(pk); for (const l of seaLinks(a, b)) links.push(l);
        }
        return blk;
      },
      // відкрити материк: поставити в чергу створення (по одному)
      open(id) {
        const d = prov.get(id); if (!d || map.has(id) || queue.some(q => q.id === id) || (current && current.id === id) || dead) return false;
        queue.push(d); if (!busy) run(); return true;
      },
      opening: () => current ? current.id : queue.length ? queue[0].id : null,
      // вивантаження: лишається не більше max материків, найдальші від точки (cx, cy) світу йдуть першими; keep — id, які не чіпати; повертає вивантажені
      evict(cx, cy, max, keep) {
        const out = []; while (map.size > max) {
          let worst = null, wd = -1; for (const b of map.values()) { if ((keep && keep.has(b.id)) || b.desc.home) continue; const d = Math.hypot(b.ox + b.W.w / 2 - cx, b.oy + b.W.h / 2 - cy); if (d > wd) { wd = d; worst = b; } }
          if (!worst) break; map.delete(worst.id); worst.W.blk = null; out.push(worst);
        }
        return out;
      },
      busy: () => busy || queue.length > 0,
      idle: () => busy || queue.length ? new Promise(r => waiters.push(r)) : Promise.resolve(),
      dispose() { dead = true; queue = []; }
    };
    async function run() {
      busy = true;
      try {
        while (queue.length && !dead) {
          const d = queue.shift(); if (map.has(d.id)) continue; current = d;
          const W = await gen(prov.paramsOf(d), (f, l) => dead ? false : (h.progress && h.progress(f, l, d), true));
          if (!W || dead) continue; const blk = self.add(d, W); if (h.added) h.added(blk);
        }
      } finally { busy = false; current = null; const w = waiters; waiters = []; for (const r of w) r(); }
    }
    return self;
  }
  A.Blocks = { create, key, seaLinks };
})();
