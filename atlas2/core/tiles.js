// Атлас 2.0: розкладка материків тайлами різного розміру (розкладка 2). Що тут: світ ділиться на супертайли розміру домашнього материка; кожен супертайл рекурсивно ділиться на квадранти або половинки (квадродерево), у кожному листку лежить материк довільної форми (деякі листки порожні, сусідній материк може зайняти порожній листок), різні параметри в кожного. Тут лише тайли й грубі контури: решту (рельєф, міста…) створює core/blocks.js, коли користувач відкриває материк. Опис: docs/atlas2/layout.md
(function () {
  'use strict';
  const A = globalThis.Atlas2;
  const MINW = 150, MINH = 100, VARIANTS = 4, STEP = 6; // найменший листок, кількість пробних форм і крок грубого контуру (клітин)
  const SPLIT_P = [0.72, 0.45, 0.2, 0], EMPTY_P = [0, 0.1, 0.18, 0.25]; // імовірність поділу й порожнього листка за глибиною
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const touch = (a, b) => a[0] - 1 <= b[2] && b[0] <= a[2] + 1 && a[1] - 1 <= b[3] && b[1] <= a[3] + 1; // прямокутники [x0,y0,x1,y1] торкаються (зазор до 1 клітини)
  const shareEdge = (a, b) => (a[2] === b[0] || b[2] === a[0]) && Math.min(a[3], b[3]) - Math.max(a[1], b[1]) >= 20 || (a[3] === b[1] || b[3] === a[1]) && Math.min(a[2], b[2]) - Math.max(a[0], b[0]) >= 20;

  // квадродерево одного супертайла: повертає листки {x,y,w,h,depth}; поділ на 4 (частіше) або на 2 по вертикалі/горизонталі
  function split(r, X, Y, W, H) {
    const out = [];
    (function go(x, y, w, h, depth) {
      const q = w >= 2 * MINW && h >= 2 * MINH, v = w >= 2 * MINW, hz = h >= 2 * MINH;
      if (depth < 4 && r() < SPLIT_P[depth] && (q || v || hz)) {
        const kinds = []; if (q) kinds.push('q', 'q'); if (v) kinds.push('v'); if (hz) kinds.push('h'); const k = kinds[Math.floor(r() * kinds.length)], w1 = Math.floor(w / 2), h1 = Math.floor(h / 2);
        if (k === 'q') { go(x, y, w1, h1, depth + 1); go(x + w1, y, w - w1, h1, depth + 1); go(x, y + h1, w1, h - h1, depth + 1); go(x + w1, y + h1, w - w1, h - h1, depth + 1); }
        else if (k === 'v') { go(x, y, w1, h, depth + 1); go(x + w1, y, w - w1, h, depth + 1); }
        else { go(x, y, w, h1, depth + 1); go(x, y + h1, w, h - h1, depth + 1); }
      } else out.push({ x, y, w, h, depth });
    })(X, Y, W, H, 0);
    return out;
  }

  // оцінка форми в тайлі: наскільки вона займає місце (охоплення листка) і чи це один цілий материк, а не уламки
  function fit(o, leaf, ox, oy) {
    let x0 = 1e9, x1 = -1, y0 = 1e9, y1 = -1, n = 0; const { cw, ch, land, step } = o;
    for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) if (land[y * cw + x]) { n++; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    if (!n) return -1;
    const cc = A.Grid.components(cw, ch, i => land[i] === 1), main = Math.max(...cc.sizes) / n, bw = (x1 - x0 + 1) * step, bh = (y1 - y0 + 1) * step;
    return (Math.min(1, bw / leaf.w) + Math.min(1, bh / leaf.h)) / 2 + 0.6 * main;
  }

  function create(base) {
    const TW = base.w, TH = base.h, supers = new Map(), byId = new Map(), hx = TW / 2, hy = TH / 2;
    const common = { seed: base.seed, wseed: base.seed, hx, hy, layout: 2 };
    const home = { id: '0,0.0', home: true, sx: 0, sy: 0, ox: 0, oy: 0, w: TW, h: TH, rects: [[0, 0, TW, TH]], leaf: [0, 0, TW, TH], seed: base.seed, p: {}, outline: null };
    byId.set(home.id, home);
    // параметри генерації материка: розмір задає тайл, решта — випадкові навколо параметрів домашнього
    function makeDesc(sx, sy, k, leaf, rects, r) {
      const rr = (a, b) => a + (b - a) * r(), id = sx + ',' + sy + '.' + k, X0 = Math.min(...rects.map(q => q[0])), Y0 = Math.min(...rects.map(q => q[1])), X1 = Math.max(...rects.map(q => q[2])), Y1 = Math.max(...rects.map(q => q[3]));
      let area = 0; for (const q of rects) area += (q[2] - q[0]) * (q[3] - q[1]);
      const rel = area / (TW * TH), seed0 = base.seed + '|' + id;
      const p = {
        provinces: clamp(Math.round(base.provinces * Math.pow(rel, 0.85) * rr(0.8, 1.3)), 2, 50), regionsPerProvince: clamp(Math.round(base.regionsPerProvince * rr(0.7, 1.3)), 2, 24),
        density: clamp(base.density * rr(0.75, 1.3), 0.3, 2.2), rugged: clamp(base.rugged * rr(0.5, 1.5), 0, 2), riverDensity: clamp(base.riverDensity * rr(0.7, 1.4), 0.1, 2.5),
        landFrac: rr(0.2, 0.42), lakeDepth: base.lakeDepth, lakeFlow: base.lakeFlow
      };
      const d = { id, sx, sy, ox: X0, oy: Y0, w: X1 - X0, h: Y1 - Y0, rects, leaf, seed: seed0, p, outline: null, home: false };
      // кілька пробних форм: лишаємо ту, що краще лягає в тайл
      let best = null;
      for (let v = 0; v < VARIANTS; v++) {
        const sd = v ? seed0 + '|v' + v : seed0, o = A.terrainOutline(paramsFor(Object.assign({}, d, { seed: sd })), STEP), sc = fit(o, { w: leaf[2] - leaf[0], h: leaf[3] - leaf[1] }, X0, Y0);
        if (!best || sc > best.sc) best = { sc, sd, o };
      }
      d.seed = best.sd; d.outline = best.o; return d;
    }
    function paramsFor(d) {
      if (d.home) return A.Params.normalize(Object.assign({}, base, { wseed: base.seed, ox: 0, oy: 0, hx, hy, layout: 2 }));
      return A.Params.normalize(Object.assign({}, base, d.p, common, { seed: d.seed, ox: d.ox, oy: d.oy, cw: d.w, ch: d.h, pad: 0.035, cspread: 0.2, bx: 0, by: 0, rects: d.rects.map(q => [q[0] - d.ox, q[1] - d.oy, q[2] - d.ox, q[3] - d.oy]) }));
    }
    function superTile(sx, sy) {
      const key = sx + ',' + sy; let s = supers.get(key); if (s) return s;
      if (!sx && !sy) { s = { descs: [home] }; supers.set(key, s); return s; }
      const r = A.Rng.stream(base.seed, 'tiles|' + key), leaves = split(r, sx * TW, sy * TH, TW, TH).map(l => Object.assign(l, { rect: [l.x, l.y, l.x + l.w, l.y + l.h], empty: r() < EMPTY_P[Math.min(3, l.depth)], extra: [] }));
      if (leaves.every(l => l.empty)) leaves[0].empty = false;
      // порожній листок може віддатися сусідньому материку: той простягнеться на його місце (межі тайлів не обмежують форму)
      for (const e of leaves) if (e.empty) {
        const cand = leaves.filter(l => !l.empty && shareEdge(l.rect, e.rect)).sort((a, b) => b.w * b.h - a.w * a.h); if (cand.length && r() < 0.8) cand[0].extra.push(e.rect);
      }
      s = { descs: [] }; supers.set(key, s); let k = 0;
      for (const l of leaves) if (!l.empty) { const d = makeDesc(sx, sy, k++, l.rect, [l.rect].concat(l.extra), r); s.descs.push(d); byId.set(d.id, d); }
      return s;
    }
    const self = {
      kind: 'tiles', home, TW, TH, byId, paramsOf: paramsFor,
      get: id => byId.get(id) || null,
      // материки, чиї коробки перетинають прямокутник вікна [x0,y0,x1,y1] у клітинах світу
      descsIn(x0, y0, x1, y1) {
        const out = []; for (let sy = Math.floor(y0 / TH); sy <= Math.floor((y1 - 1) / TH); sy++) for (let sx = Math.floor(x0 / TW); sx <= Math.floor((x1 - 1) / TW); sx++) for (const d of superTile(sx, sy).descs) if (d.ox < x1 && d.ox + d.w > x0 && d.oy < y1 && d.oy + d.h > y0) out.push(d);
        return out;
      },
      // материк, чия власна територія містить точку світу
      at(gx, gy) { for (const d of superTile(Math.floor(gx / TW), Math.floor(gy / TH)).descs) for (const q of d.rects) if (gx >= q[0] && gx < q[2] && gy >= q[1] && gy < q[3]) return d; return null; },
      adjacent: (a, b) => a !== b && a.rects.some(p => b.rects.some(q => touch(p, q))),
      // сусіди материка (з тих же й суміжних супертайлів)
      near(d) { const out = []; for (let sy = d.sy - 1; sy <= d.sy + 1; sy++) for (let sx = d.sx - 1; sx <= d.sx + 1; sx++) for (const o of superTile(sx, sy).descs) if (o !== d && self.adjacent(d, o)) out.push(o); return out; },
      // чи містить точка (клітини світу) ту частину тайла, що закрита хмарою (грубий контур з відступом)
      inCloud(d, gx, gy) {
        const o = d.outline; if (!o) return true; const cx = Math.floor((gx - d.ox) / o.step), cy = Math.floor((gy - d.oy) / o.step);
        for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const x = cx + dx, y = cy + dy; if (x >= 0 && y >= 0 && x < o.cw && y < o.ch && o.land[y * o.cw + x]) return true; }
        return false;
      },
      label: d => d.home ? 'домашній' : 'тайл ' + d.id
    };
    return self;
  }
  A.Tiles = { create, split, fit };
})();
