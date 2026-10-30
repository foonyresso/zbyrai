// Атлас 2.0, етап 7: водні шляхи. Одна мережа на водойму (море або велике озеро): порти з'єднуються в дерево, а не парами.
// Маршрут тримається ~1 км від берега, існуючий шлях дешевший, тож нові порти приєднуються до спільної траси й виходять тим самим шляхом.
(function () {
  'use strict';
  const A = globalThis.Atlas2, { DX, DY } = A.Grid;
  const BIG_LAKE = 80; // клітин (≈5 км²): менші озера без портів

  function searoutes(W) {
    const { w, h } = W, N = w * h, S = W.settlements, routes = [];
    const lakeOf = W.lakeOf, bodyOf = i => W.ocean[i] ? -1 : lakeOf[i];
    // відстань від суші в клітинах через воду (для утримання траси ~1 км = 4 клітини від берега)
    const land = new Float32Array(N).fill(1e9), q = [];
    for (let i = 0; i < N; i++) if (!W.ocean[i] && !W.lake[i]) { land[i] = 0; q.push(i); }
    for (let k = 0; k < q.length; k++) { const i = q[k], x = i % w, y = (i / w) | 0; for (let d = 0; d < 4; d++) { const nx = x + DX[d], ny = y + DY[d]; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue; const j = ny * w + nx; if (land[j] > land[i] + 1) { land[j] = land[i] + 1; q.push(j); } } }
    const dist = new Float32Array(N), prev = new Int32Array(N), heap = new A.Heap(), net = new Uint8Array(N);
    const wet = (s, body) => { let b = -1, bd = 1e9; for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) { const x = s.x + dx, y = s.y + dy; if (x < 0 || y < 0 || x >= w || y >= h) continue; const i = y * w + x; if ((W.ocean[i] || W.lake[i]) && bodyOf(i) === body && dx * dx + dy * dy < bd) { bd = dx * dx + dy * dy; b = i; } } return b; };
    const byBody = new Map();
    for (const s of S) if (s.port) (byBody.get(s.body) || byBody.set(s.body, []).get(s.body)).push(s);
    for (const [body, ports] of byBody) {
      if (ports.length < 2) continue;
      const cells = ports.map(p => ({ p, c: wet(p, body) })).filter(o => o.c >= 0); if (cells.length < 2) continue;
      cells.sort((a, b) => a.p.x - b.p.x || a.p.y - b.p.y); const connected = [cells[0]]; net[cells[0].c] = 1;
      // порти приєднуються від найближчого до вже з'єднаних
      const rest = cells.slice(1); while (rest.length) {
        let bi = 0, bd = 1e9; rest.forEach((o, k) => { for (const c of connected) { const d = Math.hypot(o.p.x - c.p.x, o.p.y - c.p.y); if (d < bd) { bd = d; bi = k; } } });
        const o = rest.splice(bi, 1)[0];
        dist.fill(1e30); prev.fill(-1); heap.k.length = 0; heap.v.length = 0; dist[o.c] = 0; heap.push(0, o.c); let found = -1;
        while (heap.size) {
          const i = heap.pop(); if (i !== o.c && net[i]) { found = i; break; } const x = i % w, y = (i / w) | 0;
          for (let d = 0; d < 8; d++) {
            const nx = x + DX[d], ny = y + DY[d]; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue; const j = ny * w + nx;
            if (!(W.ocean[j] || W.lake[j]) || bodyOf(j) !== body) continue;
            let c = (1 + 0.25 * Math.abs(Math.min(land[j], 14) - 4)) * (d >= 4 ? 1.41 : 1); if (net[j]) c *= 0.12;
            const nd = dist[i] + c; if (nd < dist[j]) { dist[j] = nd; prev[j] = i; heap.push(nd, j); }
          }
        }
        if (found < 0) continue; const path = []; for (let c = found; c >= 0; c = prev[c]) path.push(c); path.reverse(); path.reverse();
        for (const c of path) net[c] = 1; routes.push({ from: o.p.id, to: -1, body, cells: path }); connected.push(o);
      }
    }
    // Усі порти однієї провінції з'єднуються між собою напряму (мінімальне дерево за відстанню), а не лише через спільну трасу з іншими провінціями;
    // до того ж кожен порт отримує до двох запасних шляхів до найближчих портів: обхід, якщо порт чи траса стануть недоступні. Нові шляхи додають лише нові відрізки.
    const kmc = W.params.kmPerCell;
    function link(a, b, disc, kind) {
      dist.fill(1e30); prev.fill(-1); heap.k.length = 0; heap.v.length = 0; dist[a.c] = 0; heap.push(0, a.c); let ok = false;
      while (heap.size) {
        const i = heap.pop(); if (i === b.c) { ok = true; break; } const x = i % w, y = (i / w) | 0;
        for (let d = 0; d < 8; d++) {
          const nx = x + DX[d], ny = y + DY[d]; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue; const j = ny * w + nx;
          if (!(W.ocean[j] || W.lake[j]) || bodyOf(j) !== a.body) continue;
          let c = (1 + 0.25 * Math.abs(Math.min(land[j], 14) - 4)) * (d >= 4 ? 1.41 : 1); if (net[j]) c *= disc;
          const nd = dist[i] + c; if (nd < dist[j]) { dist[j] = nd; prev[j] = i; heap.push(nd, j); }
        }
      }
      if (!ok) return false; const path = []; for (let c = b.c; c >= 0; c = prev[c]) path.push(c); path.reverse();
      let added = 0, k = 0; while (k < path.length) {
        if (net[path[k]]) { k++; continue; } let e = k; while (e + 1 < path.length && !net[path[e + 1]]) e++;
        routes.push({ from: a.p.id, to: b.p.id, body: a.body, kind, cells: path.slice(Math.max(0, k - 1), Math.min(path.length, e + 2)) }); for (let q = k; q <= e; q++) net[path[q]] = 1; added += e - k + 1; k = e + 1;
      }
      return added > 0;
    }
    const sea = []; for (const s of S) if (s.port && s.body === -1 && !s.ruined) { const c = wet(s, -1); if (c >= 0) sea.push({ p: s, c, body: -1 }); }
    const pairs = new Set(), key = (a, b) => Math.min(a.p.id, b.p.id) * 100000 + Math.max(a.p.id, b.p.id), dd = (a, b) => Math.hypot(a.p.x - b.p.x, a.p.y - b.p.y);
    const byProv = new Map(); for (const o of sea) (byProv.get(o.p.prov) || byProv.set(o.p.prov, []).get(o.p.prov)).push(o);
    for (const list of byProv.values()) {
      if (list.length < 2) continue; const inT = [list[0]], rest = list.slice(1);
      while (rest.length) { let bi = 0, bj = 0, bd = 1e9; rest.forEach((o, k) => inT.forEach((t, m) => { const d = dd(o, t); if (d < bd) { bd = d; bi = k; bj = m; } })); const o = rest.splice(bi, 1)[0], t = inT[bj]; pairs.add(key(o, t)); link(o, t, 0.8, 'province'); inT.push(o); }
    }
    for (const a of sea) for (const b of sea.filter(o => o !== a).sort((x, y) => dd(a, x) - dd(a, y)).slice(0, 2)) { if (dd(a, b) * kmc > 20 || pairs.has(key(a, b))) continue; pairs.add(key(a, b)); link(a, b, 0.85, 'backup'); }
    W.seaRoutes = routes;
  }
  A.searoutes = searoutes; A.BIG_LAKE = BIG_LAKE;
  (A.stages = A.stages || []).push(searoutes);
})();
