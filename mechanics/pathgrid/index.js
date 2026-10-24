/* Механіка «pathgrid»: сітка перешкод і пошук шляху A* для істот. Без DOM.
   Світ у пікселях, клітинка cell; шлях — ламана у світових координатах, спрощена до прямої видимості. */
(function (root) {
  'use strict';
  const Mech = root.Mech = root.Mech || {};
  function create(w, h, cell = 8) {
    const cols = Math.ceil(w / cell), rows = Math.ceil(h / cell);
    return { w, h, cell, cols, rows, blk: new Uint8Array(cols * rows) };
  }
  const idx = (g, cx, cy) => cy * g.cols + cx;
  const inside = (g, cx, cy) => cx >= 0 && cy >= 0 && cx < g.cols && cy < g.rows;
  const blocked = (g, cx, cy) => !inside(g, cx, cy) || g.blk[idx(g, cx, cy)] === 1;
  function blockRect(g, x0, y0, x1, y1, v = 1) {
    const c = g.cell;
    for (let cy = Math.max(0, Math.floor(y0 / c)); cy <= Math.min(g.rows - 1, Math.floor((y1 - 0.01) / c)); cy++)
      for (let cx = Math.max(0, Math.floor(x0 / c)); cx <= Math.min(g.cols - 1, Math.floor((x1 - 0.01) / c)); cx++) g.blk[idx(g, cx, cy)] = v;
  }
  function blockEllipse(g, cx, cy, rx, ry, v = 1) {
    const c = g.cell;
    for (let j = Math.floor((cy - ry) / c); j <= Math.floor((cy + ry) / c); j++)
      for (let i = Math.floor((cx - rx) / c); i <= Math.floor((cx + rx) / c); i++) {
        if (!inside(g, i, j)) continue;
        const nx = ((i + 0.5) * c - cx) / rx, ny = ((j + 0.5) * c - cy) / ry;
        if (nx * nx + ny * ny <= 1) g.blk[idx(g, i, j)] = v;
      }
  }
  const cellOf = (g, x, y) => [Math.max(0, Math.min(g.cols - 1, Math.floor(x / g.cell))), Math.max(0, Math.min(g.rows - 1, Math.floor(y / g.cell)))];
  const center = (g, cx, cy) => [(cx + 0.5) * g.cell, (cy + 0.5) * g.cell];
  // найближча вільна клітинка спіраллю
  function nearestFree(g, cx, cy) {
    if (!blocked(g, cx, cy)) return [cx, cy];
    for (let r = 1; r < 40; r++)
      for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        if (!blocked(g, cx + dx, cy + dy)) return [cx + dx, cy + dy];
      }
    return null;
  }
  function lineClear(g, x0, y0, x1, y1) {
    const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / (g.cell / 2));
    for (let i = 0; i <= n; i++) { const t = n ? i / n : 0; const [cx, cy] = cellOf(g, x0 + (x1 - x0) * t, y0 + (y1 - y0) * t); if (blocked(g, cx, cy)) return false; }
    return true;
  }
  function find(g, x0, y0, x1, y1) {
    const s = nearestFree(g, ...cellOf(g, x0, y0)), e = nearestFree(g, ...cellOf(g, x1, y1));
    if (!s || !e) return null;
    const goalFree = !blocked(g, ...cellOf(g, x1, y1)), end = goalFree ? [x1, y1] : center(g, e[0], e[1]);
    if (s[0] === e[0] && s[1] === e[1]) return [end];
    const N = g.cols * g.rows, gs = new Float32Array(N).fill(Infinity), prev = new Int32Array(N).fill(-1), done = new Uint8Array(N);
    const heap = [];
    const push = (f, i) => { heap.push([f, i]); let k = heap.length - 1; while (k > 0) { const p = (k - 1) >> 1; if (heap[p][0] <= heap[k][0]) break; [heap[p], heap[k]] = [heap[k], heap[p]]; k = p; } };
    const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let k = 0; for (;;) { const l = 2 * k + 1, r = l + 1; let m = k; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === k) break; [heap[m], heap[k]] = [heap[k], heap[m]]; k = m; } } return top; };
    const h = (cx, cy) => { const dx = Math.abs(cx - e[0]), dy = Math.abs(cy - e[1]); return dx + dy + (Math.SQRT2 - 2) * Math.min(dx, dy); };
    const si = idx(g, s[0], s[1]), ei = idx(g, e[0], e[1]);
    gs[si] = 0; push(h(s[0], s[1]), si);
    while (heap.length) {
      const [, i] = pop(); if (done[i]) continue; done[i] = 1; if (i === ei) break;
      const cx = i % g.cols, cy = (i / g.cols) | 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const nx = cx + dx, ny = cy + dy; if (blocked(g, nx, ny)) continue;
        if (dx && dy && (blocked(g, cx + dx, cy) || blocked(g, cx, cy + dy))) continue; // без зрізання кутів
        const ni = idx(g, nx, ny), ng = gs[i] + (dx && dy ? Math.SQRT2 : 1);
        if (ng < gs[ni]) { gs[ni] = ng; prev[ni] = i; push(ng + h(nx, ny), ni); }
      }
    }
    if (!done[ei]) return null;
    const cells = []; for (let i = ei; i !== -1; i = prev[i]) cells.push(center(g, i % g.cols, (i / g.cols) | 0));
    cells.reverse(); cells[0] = [x0, y0]; cells[cells.length - 1] = end;
    const out = []; let a = 0; // спрощення: з кожної точки до найдальшої видимої
    while (a < cells.length - 1) { let b = cells.length - 1; while (b > a + 1 && !lineClear(g, cells[a][0], cells[a][1], cells[b][0], cells[b][1])) b--; out.push(cells[b]); a = b; }
    return out;
  }
  const api = { create, blockRect, blockEllipse, blocked, cellOf, find, lineClear, nearestFree };
  Mech.Pathgrid = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(globalThis);
