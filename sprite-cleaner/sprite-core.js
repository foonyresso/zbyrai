/* Sprite Sheet Cleaner: обчислення без DOM (браузер: глобал SpriteCore; Node: module.exports).
   Зображення = { data: Uint8ClampedArray (RGBA), width, height }. Усі функції повертають нове зображення, вхідне не змінюють. */
const SpriteCore = (() => {
  const px = (img, x, y) => (y * img.width + x) * 4;
  const clone = img => ({ data: new Uint8ClampedArray(img.data), width: img.width, height: img.height });
  const dist = (d, i, c) => Math.hypot(d[i] - c[0], d[i + 1] - c[1], d[i + 2] - c[2]) / 441.6729559; // 0..1

  /* ---------- фон ---------- */
  // найчастіший колір серед пікселів по периметру (з округленням до 4 значень на канал, щоб шум JPEG не заважав)
  function detectBg(img) {
    const W = img.width, H = img.height, d = img.data, cnt = new Map();
    const add = (x, y) => { const i = px(img, x, y), k = (d[i] >> 2) << 16 | (d[i + 1] >> 2) << 8 | (d[i + 2] >> 2); const e = cnt.get(k) || [0, 0, 0, 0]; e[0]++; e[1] += d[i]; e[2] += d[i + 1]; e[3] += d[i + 2]; cnt.set(k, e); };
    for (let x = 0; x < W; x++) { add(x, 0); add(x, H - 1); }
    for (let y = 1; y < H - 1; y++) { add(0, y); add(W - 1, y); }
    let best = null; for (const e of cnt.values()) if (!best || e[0] > best[0]) best = e;
    return [Math.round(best[1] / best[0]), Math.round(best[2] / best[0]), Math.round(best[3] / best[0])];
  }

  /* Прибрати кілька кольорів фону. colors = [{ color:[r,g,b], tol:0..100 }] (кожен зі своїм допуском, %), feather 0..50 (м'який перехід
     за межею допуску), mode 'flood' — лише області, з'єднані з краєм (однакові кольори всередині спрайта лишаються), 'global' — усі пікселі.
     Піксель прозорий, якщо він близький до БУДЬ-ЯКОГО з кольорів; на межі допуску альфа росте плавно. */
  function removeColors(img, o) {
    const out = clone(img), W = img.width, H = img.height, d = out.data, f = Math.max(0, o.feather || 0) / 100;
    const cs = (o.colors || []).map(e => ({ c: e.color, t: Math.max(0, e.tol) / 100 }));
    if (!cs.length) return out;
    const alphaAt = i => {
      let a = 1;
      for (const e of cs) { const dd = dist(d, i, e.c), v = dd <= e.t ? 0 : f > 0 && dd < e.t + f ? (dd - e.t) / f : 1; if (v < a) { a = v; if (!a) break; } }
      return a;
    };
    if (o.mode === 'global') {
      for (let i = 0; i < d.length; i += 4) d[i + 3] = Math.round(d[i + 3] * alphaAt(i));
      return out;
    }
    const seen = new Uint8Array(W * H), stack = [], a0 = new Float32Array(W * H);
    for (let p = 0; p < W * H; p++) a0[p] = alphaAt(p * 4);
    const push = (x, y) => { const p = y * W + x; if (!seen[p] && a0[p] < 1) { seen[p] = 1; stack.push(p); } };
    for (let x = 0; x < W; x++) { push(x, 0); push(x, H - 1); }
    for (let y = 0; y < H; y++) { push(0, y); push(W - 1, y); }
    while (stack.length) {
      const p = stack.pop(), x = p % W, y = (p - x) / W;
      if (x > 0) push(x - 1, y); if (x < W - 1) push(x + 1, y); if (y > 0) push(x, y - 1); if (y < H - 1) push(x, y + 1);
    }
    for (let p = 0; p < W * H; p++) if (seen[p]) d[p * 4 + 3] = Math.round(d[p * 4 + 3] * a0[p]);
    return out;
  }
  // один колір (сумісність): color = [r,g,b], tol %, feather %, mode
  const removeBg = (img, o) => removeColors(img, { colors: [{ color: o.color, tol: o.tol }], feather: o.feather, mode: o.mode });

  // до n найпоширеніших «різних» кольорів по периметру (для складного фону: небо + море тощо); [{color, share}]
  function edgeColors(img, n = 3, minDist = 0.12) {
    const W = img.width, H = img.height, d = img.data, cnt = new Map();
    const add = (x, y) => { const i = px(img, x, y), k = (d[i] >> 3) << 10 | (d[i + 1] >> 3) << 5 | (d[i + 2] >> 3); const e = cnt.get(k) || [0, 0, 0, 0]; e[0]++; e[1] += d[i]; e[2] += d[i + 1]; e[3] += d[i + 2]; cnt.set(k, e); };
    for (let x = 0; x < W; x++) { add(x, 0); add(x, H - 1); }
    for (let y = 1; y < H - 1; y++) { add(0, y); add(W - 1, y); }
    const total = 2 * W + 2 * Math.max(0, H - 2), res = [];
    for (const e of [...cnt.values()].sort((a, b) => b[0] - a[0])) {
      const c = [Math.round(e[1] / e[0]), Math.round(e[2] / e[0]), Math.round(e[3] / e[0])];
      if (res.every(r => Math.hypot(r.color[0] - c[0], r.color[1] - c[1], r.color[2] - c[2]) / 441.6729559 >= minDist)) res.push({ color: c, share: e[0] / total });
      if (res.length >= n) break;
    }
    return res;
  }

  /* ---------- ручні правки: маска em (Uint8Array W*H): 0 — без змін, 1 — стерто, 2 — відновлено з оригіналу ---------- */
  // чарівна паличка: усі (contiguous=false) або з'єднані з (x,y) пікселі, схожі на колір у (x,y) з допуском tol (%) — у маску значення val; повертає кількість
  function wandMask(em, img, x, y, tol, contiguous, val) {
    const W = img.width, H = img.height, d = img.data, i0 = px(img, x, y), c = [d[i0], d[i0 + 1], d[i0 + 2]], t = tol / 100;
    const near = p => dist(d, p * 4, c) <= t;
    let n = 0;
    if (!contiguous) { for (let p = 0; p < W * H; p++) if (near(p)) { em[p] = val; n++; } return n; }
    const seen = new Uint8Array(W * H), st = [y * W + x]; seen[st[0]] = 1;
    while (st.length) {
      const p = st.pop(); em[p] = val; n++;
      const px_ = p % W, py_ = (p - px_) / W;
      const go = q => { if (!seen[q] && near(q)) { seen[q] = 1; st.push(q); } };
      if (px_ > 0) go(p - 1); if (px_ < W - 1) go(p + 1); if (py_ > 0) go(p - W); if (py_ < H - 1) go(p + W);
    }
    return n;
  }
  function paintCircle(em, W, H, cx, cy, r, val) {
    const r2 = r * r, x0 = Math.max(0, Math.floor(cx - r)), x1 = Math.min(W - 1, Math.ceil(cx + r)), y0 = Math.max(0, Math.floor(cy - r)), y1 = Math.min(H - 1, Math.ceil(cy + r));
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if ((x - cx) ** 2 + (y - cy) ** 2 <= r2) em[y * W + x] = val;
  }
  // лінія пензлем (кроки не більші за пів радіуса, щоб не було дірок)
  function paintLine(em, W, H, ax, ay, bx, by, r, val) {
    const len = Math.hypot(bx - ax, by - ay), n = Math.max(1, Math.ceil(len / Math.max(0.5, r / 2)));
    for (let i = 0; i <= n; i++) paintCircle(em, W, H, ax + (bx - ax) * i / n, ay + (by - ay) * i / n, r, val);
  }
  function paintRect(em, W, H, x0, y0, x1, y1, val) {
    for (let y = Math.max(0, Math.min(y0, y1)); y <= Math.min(H - 1, Math.max(y0, y1)); y++) for (let x = Math.max(0, Math.min(x0, x1)); x <= Math.min(W - 1, Math.max(x0, x1)); x++) em[y * W + x] = val;
  }
  // накласти маску правок на результат: 1 -> альфа 0, 2 -> альфа з оригіналу (повне відновлення піксель-у-піксель)
  function applyEdits(img, orig, em) {
    const out = clone(img), d = out.data;
    for (let p = 0; p < em.length; p++) { if (em[p] === 1) d[p * 4 + 3] = 0; else if (em[p] === 2) { d[p * 4] = orig.data[p * 4]; d[p * 4 + 1] = orig.data[p * 4 + 1]; d[p * 4 + 2] = orig.data[p * 4 + 2]; d[p * 4 + 3] = orig.data[p * 4 + 3]; } }
    return out;
  }

  /* ---------- пошук спрайтів ---------- */
  // Зв'язні області непрозорих пікселів. gap = скільки порожніх пікселів між частинами ще вважати одним спрайтом.
  function findSprites(img, o = {}) {
    const W = img.width, H = img.height, d = img.data, gap = Math.max(0, o.gap | 0), minArea = o.minArea || 1, thr = o.alpha ?? 8;
    const mask = new Uint8Array(W * H);
    for (let p = 0; p < W * H; p++) mask[p] = d[p * 4 + 3] > thr ? 1 : 0;
    // «розширена» маска лише для зв'язності: горизонтальне, потім вертикальне розширення на gap
    let wide = mask;
    if (gap > 0) {
      const h = new Uint8Array(W * H), v = new Uint8Array(W * H);
      for (let y = 0; y < H; y++) { let last = -1e9; for (let x = 0; x < W; x++) { if (mask[y * W + x]) last = x; if (x - last <= gap) h[y * W + x] = 1; } last = 1e9; for (let x = W - 1; x >= 0; x--) { if (mask[y * W + x]) last = x; if (last - x <= gap) h[y * W + x] = 1; } }
      for (let x = 0; x < W; x++) { let last = -1e9; for (let y = 0; y < H; y++) { if (h[y * W + x]) last = y; if (y - last <= gap) v[y * W + x] = 1; } last = 1e9; for (let y = H - 1; y >= 0; y--) { if (h[y * W + x]) last = y; if (last - y <= gap) v[y * W + x] = 1; } }
      wide = v;
    }
    const lab = new Int32Array(W * H), rects = [], stack = [];
    for (let s = 0; s < W * H; s++) {
      if (!wide[s] || lab[s]) continue;
      const id = rects.length + 1; let x0 = W, y0 = H, x1 = -1, y1 = -1, area = 0;
      lab[s] = id; stack.push(s);
      while (stack.length) {
        const p = stack.pop(), x = p % W, y = (p - x) / W;
        if (mask[p]) { area++; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
          const q = ny * W + nx; if (wide[q] && !lab[q]) { lab[q] = id; stack.push(q); }
        }
      }
      rects.push(x1 < 0 ? null : { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1, area });
    }
    return sortReading(rects.filter(r => r && r.area >= minArea));
  }
  // порядок читання: рядки зверху вниз (спрайти з перекриттям по вертикалі — один рядок), у рядку зліва направо
  function sortReading(rects) {
    const list = rects.slice().sort((a, b) => a.y - b.y), rows = [];
    for (const r of list) {
      const row = rows.find(w => r.y < w.y1 && r.y + r.h > w.y0 + (w.y1 - w.y0) * .3);
      if (row) { row.items.push(r); row.y0 = Math.min(row.y0, r.y); row.y1 = Math.max(row.y1, r.y + r.h); } else rows.push({ y0: r.y, y1: r.y + r.h, items: [r] });
    }
    rows.sort((a, b) => a.y0 - b.y0);
    return rows.flatMap(w => w.items.sort((a, b) => a.x - b.x));
  }
  function gridRects(W, H, cols, rows) {
    const out = [];
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const x0 = Math.round(i * W / cols), x1 = Math.round((i + 1) * W / cols), y0 = Math.round(j * H / rows), y1 = Math.round((j + 1) * H / rows);
      out.push({ x: x0, y: y0, w: x1 - x0, h: y1 - y0 });
    }
    return out;
  }
  function crop(img, r) {
    const out = new Uint8ClampedArray(r.w * r.h * 4);
    for (let y = 0; y < r.h; y++) {
      const sy = r.y + y; if (sy < 0 || sy >= img.height) continue;
      for (let x = 0; x < r.w; x++) { const sx = r.x + x; if (sx < 0 || sx >= img.width) continue; const i = px(img, sx, sy), o = (y * r.w + x) * 4; out[o] = img.data[i]; out[o + 1] = img.data[i + 1]; out[o + 2] = img.data[i + 2]; out[o + 3] = img.data[i + 3]; }
    }
    return { data: out, width: r.w, height: r.h };
  }
  // найменший прямокутник із непрозорими пікселями всередині r; null, якщо порожньо
  function trimRect(img, r, alpha = 0) {
    let x0 = Infinity, y0 = Infinity, x1 = -1, y1 = -1;
    for (let y = Math.max(0, r.y); y < Math.min(img.height, r.y + r.h); y++) for (let x = Math.max(0, r.x); x < Math.min(img.width, r.x + r.w); x++) {
      if (img.data[px(img, x, y) + 3] > alpha) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    }
    return x1 < 0 ? null : { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
  }

  /* ---------- палітра: медіанний зріз (median cut), без дізерінгу ---------- */
  function medianCut(img, n) {
    const d = img.data, pts = [];
    for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 0) pts.push([d[i], d[i + 1], d[i + 2]]);
    if (!pts.length) return [];
    let boxes = [pts];
    while (boxes.length < n) {
      let bi = -1, bs = 0, ch = 0;
      boxes.forEach((b, i) => {
        if (b.length < 2) return;
        for (let c = 0; c < 3; c++) { let lo = 255, hi = 0; for (const p of b) { if (p[c] < lo) lo = p[c]; if (p[c] > hi) hi = p[c]; } if ((hi - lo) * Math.sqrt(b.length) > bs) { bs = (hi - lo) * Math.sqrt(b.length); bi = i; ch = c; } }
      });
      if (bi < 0 || bs === 0) break;
      const b = boxes[bi].sort((p, q) => p[ch] - q[ch]), m = b.length >> 1;
      boxes.splice(bi, 1, b.slice(0, m), b.slice(m));
    }
    const pal = boxes.map(b => { const s = [0, 0, 0]; for (const p of b) { s[0] += p[0]; s[1] += p[1]; s[2] += p[2]; } return s.map(v => Math.round(v / b.length)); });
    const seen = new Set(); return pal.filter(c => { const k = c.join(','); if (seen.has(k)) return false; seen.add(k); return true; });
  }
  function applyPalette(img, pal) {
    const out = clone(img), d = out.data;
    if (!pal.length) return out;
    const cache = new Map();
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] === 0) continue;
      const key = d[i] << 16 | d[i + 1] << 8 | d[i + 2]; let c = cache.get(key);
      if (!c) { let bd = Infinity; for (const q of pal) { const e = (q[0] - d[i]) ** 2 + (q[1] - d[i + 1]) ** 2 + (q[2] - d[i + 2]) ** 2; if (e < bd) { bd = e; c = q; } } cache.set(key, c); }
      d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2];
    }
    return out;
  }
  const quantize = (img, n) => { const pal = medianCut(img, n); return { palette: pal, img: applyPalette(img, pal) }; };

  /* ---------- атлас: «полиці» (shelf packing) ---------- */
  const nextPow2 = v => { let p = 1; while (p < v) p <<= 1; return p; };
  // sizes = [{w,h}], повертає { pos: [{x,y}] у порядку sizes, W, H }; pad — відступ між спрайтами
  function packShelf(sizes, o = {}) {
    const pad = o.pad ?? 1, order = sizes.map((s, i) => i).sort((a, b) => sizes[b].h - sizes[a].h || sizes[b].w - sizes[a].w);
    const area = sizes.reduce((s, r) => s + (r.w + pad) * (r.h + pad), 0), widest = Math.max(0, ...sizes.map(s => s.w + pad));
    let maxW = o.maxW || Math.max(widest, Math.ceil(Math.sqrt(area * 1.15)));
    if (o.pow2) maxW = nextPow2(maxW);
    maxW = Math.max(maxW, widest);
    const pos = new Array(sizes.length); let x = 0, y = 0, rowH = 0, usedW = 0;
    for (const i of order) {
      const s = sizes[i];
      if (x + s.w + pad > maxW && x > 0) { y += rowH; x = 0; rowH = 0; }
      pos[i] = { x, y }; x += s.w + pad; rowH = Math.max(rowH, s.h + pad); usedW = Math.max(usedW, x);
    }
    let W = Math.max(1, usedW - pad), H = Math.max(1, y + rowH - pad);
    if (o.pow2) { W = nextPow2(W); H = nextPow2(H); }
    return { pos, W, H };
  }
  // формат «JSON Hash» (TexturePacker): читають Phaser, PixiJS та інші
  function atlasJson(names, sizes, pos, W, H, image) {
    const frames = {};
    names.forEach((n, i) => { frames[n] = { frame: { x: pos[i].x, y: pos[i].y, w: sizes[i].w, h: sizes[i].h }, rotated: false, trimmed: false, spriteSourceSize: { x: 0, y: 0, w: sizes[i].w, h: sizes[i].h }, sourceSize: { w: sizes[i].w, h: sizes[i].h } }; });
    return { frames, meta: { app: 'Zbyrai Sprite Sheet Cleaner', image, format: 'RGBA8888', size: { w: W, h: H }, scale: '1' } };
  }
  function blit(dst, src, x, y) {
    for (let j = 0; j < src.height; j++) for (let i = 0; i < src.width; i++) {
      const a = (j * src.width + i) * 4, b = ((y + j) * dst.width + x + i) * 4;
      dst.data[b] = src.data[a]; dst.data[b + 1] = src.data[a + 1]; dst.data[b + 2] = src.data[a + 2]; dst.data[b + 3] = src.data[a + 3];
    }
  }

  /* ---------- ZIP без стиснення (store), щоб не тягти бібліотек ---------- */
  const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  const crc32 = u8 => { let c = 0xffffffff; for (let i = 0; i < u8.length; i++) c = CRC[(c ^ u8[i]) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  function zip(files) {
    const enc = new TextEncoder(), parts = [], central = []; let off = 0;
    const u16 = v => [v & 255, v >> 8 & 255], u32 = v => [v & 255, v >> 8 & 255, v >> 16 & 255, v >>> 24 & 255];
    for (const f of files) {
      const name = enc.encode(f.name), crc = crc32(f.data), n = f.data.length;
      const head = new Uint8Array([0x50, 0x4b, 3, 4, ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0x21), ...u32(crc), ...u32(n), ...u32(n), ...u16(name.length), ...u16(0)]);
      parts.push(head, name, f.data);
      central.push(new Uint8Array([0x50, 0x4b, 1, 2, ...u16(20), ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0x21), ...u32(crc), ...u32(n), ...u32(n), ...u16(name.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(off)]), name);
      off += head.length + name.length + n;
    }
    const cdSize = central.reduce((s, p) => s + p.length, 0);
    const end = new Uint8Array([0x50, 0x4b, 5, 6, 0, 0, 0, 0, ...u16(files.length), ...u16(files.length), ...u32(cdSize), ...u32(off), 0, 0]);
    const all = [...parts, ...central, end], out = new Uint8Array(all.reduce((s, p) => s + p.length, 0)); let o = 0;
    for (const p of all) { out.set(p, o); o += p.length; }
    return out;
  }

  return { detectBg, removeBg, removeColors, edgeColors, wandMask, paintCircle, paintLine, paintRect, applyEdits, findSprites, sortReading, gridRects, crop, trimRect, medianCut, applyPalette, quantize, packShelf, atlasJson, blit, crc32, zip, nextPow2 };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = SpriteCore;
