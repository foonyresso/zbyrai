// Атлас 2.0: сітка w×h, індекс i = y*w+x, сусіди (8 напрямків), зв'язні компоненти.
(function () {
  'use strict';
  const A = globalThis.Atlas2;
  const DX = [1, -1, 0, 0, 1, 1, -1, -1], DY = [0, 0, 1, -1, 1, -1, 1, -1];
  // компоненти за предикатом (4-сусідство); повертає {id: Int32Array (-1 поза), sizes: []}
  function components(w, h, pred) {
    const id = new Int32Array(w * h).fill(-1), sizes = [], st = [];
    for (let s = 0; s < w * h; s++) {
      if (id[s] >= 0 || !pred(s)) continue;
      const c = sizes.length; let n = 0; id[s] = c; st.length = 0; st.push(s);
      while (st.length) {
        const i = st.pop(); n++; const x = i % w, y = (i / w) | 0;
        for (let d = 0; d < 4; d++) {
          const nx = x + DX[d], ny = y + DY[d]; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          const j = ny * w + nx; if (id[j] < 0 && pred(j)) { id[j] = c; st.push(j); }
        }
      }
      sizes.push(n);
    }
    return { id, sizes };
  }
  A.Grid = { DX, DY, components };
})();
