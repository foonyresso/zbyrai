// Атлас 2.0: зв'язність доріг. Окуповане поселення не може стояти на дорозі, що з'єднує живі поселення (порт з містами): лише відгалуження.
(function () {
  'use strict';
  const A = globalThis.Atlas2, { DX, DY } = A.Grid, BR = { capital: 3, regional: 3, town: 3, village: 2, hamlet: 1.5 }; // радіус забудови в клітинах: так далеко дорога вважається перекритою
  // позначає компоненти доріг, не заходячи в blocked; повертає Int32Array міток (-1 — нема дороги)
  function label(W, blocked) {
    const { w, h } = W, N = w * h, lv = W.roadLevel, lab = new Int32Array(N).fill(-1); let n = 0;
    for (let s0 = 0; s0 < N; s0++) {
      if (!lv[s0] || lab[s0] >= 0 || blocked.has(s0)) continue; const st = [s0]; lab[s0] = n;
      while (st.length) { const i = st.pop(), x = i % w, y = (i / w) | 0; for (let d = 0; d < 8; d++) { const nx = x + DX[d], ny = y + DY[d]; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue; const j = ny * w + nx; if (lv[j] && lab[j] < 0 && !blocked.has(j)) { lab[j] = n; st.push(j); } } }
      n++;
    }
    return lab;
  }
  const alive = s => !s.ruined && !s.fate && !s.fortress;
  // кількість окремих груп живих поселень суходолу (поселення на одній дорозі — одна група)
  function groups(W, lab, lm, skip, blocked) {
    const seen = new Set(); let lone = 0;
    for (const s of W.settlements) { if (s === skip || !alive(s) || s.landmass !== lm) continue; if (blocked.has(s.i)) continue; const l = lab[s.i]; if (l >= 0) seen.add(l); else lone++; }
    return seen.size + lone;
  }
  function cellsAround(W, s) { const r = BR[s.rank] || 2, out = [], { w, h } = W; for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) { const x = s.x + dx, y = s.y + dy; if (x >= 0 && y >= 0 && x < w && y < h && Math.hypot(dx, dy) <= r) out.push(y * w + x); } return out; }
  // чи можна окупувати s, не розірвавши зв'язність живих поселень свого суходолу; якщо так, її клітини запам'ятовуються як перекриті
  function canBlock(W, s) {
    const blocked = W._blocked || (W._blocked = new Set()), add = cellsAround(W, s), both = new Set([...blocked, ...add]);
    const before = groups(W, label(W, blocked), s.landmass, s, blocked), after = groups(W, label(W, both), s.landmass, s, both);
    if (after > before) return false; for (const c of add) blocked.add(c); return true;
  }
  // перевірка для тестів: чи всі живі поселення суходолу, що були з'єднані дорогою, лишаються з'єднаними при перекритих окупованих
  function connected(W) {
    const blocked = new Set(); for (const s of W.settlements) if (s.fate === 'occupied') for (const c of cellsAround(W, s)) blocked.add(c);
    const lab0 = label(W, new Set()), lab1 = label(W, blocked), bad = [];
    for (const a of W.settlements) for (const b of W.settlements) { if (a.id >= b.id || !alive(a) || !alive(b) || a.landmass !== b.landmass || blocked.has(a.i) || blocked.has(b.i)) continue; if (lab0[a.i] >= 0 && lab0[a.i] === lab0[b.i] && lab1[a.i] !== lab1[b.i]) bad.push([a.id, b.id]); }
    return bad;
  }
  A.RoadGraph = { canBlock, connected, cellsAround };
})();
