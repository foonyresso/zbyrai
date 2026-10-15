// Сцена: збирає шари у кадр, веде камеру, шукає об’єкт під курсором, експортує PNG. Логіка світу не змішується з DOM — сцена лише читає world.
(function () {
  'use strict';
  const R = (globalThis.RealmMap = globalThis.RealmMap || {});

  const DEFAULT_LAYERS = {
    political: true, provinceBorders: true, regionBorders: true, rivers: true, relief: true,
    road_major: true, road_medium: true, road_minor: true, road_trail: true, sea: true,
    settlements: true, pois: true, lairs: true, danger: false,
    names_provinces: true, names_regions: true, names_settlements: true, names_nature: true, scale: true,
  };
  const iconK = k => Math.max(0.65, Math.min(2.3, Math.sqrt(k / 8)));

  class Scene {
    constructor(canvas) { this.cv = canvas; this.ctx = canvas.getContext('2d'); this.layers = Object.assign({}, DEFAULT_LAYERS); this.view = { k: 8, tx: 0, ty: 0 }; this.world = null; this.hits = []; this.sel = null; this.route = null; this.cache = null; this.dirty = true; this.dpr = 1; this.pins = {}; }
    setWorld(w) {
      clearTimeout(this.upT); R.Palette.setTheme(w.params.theme); this.world = w; this.geom = R.Geometry.buildGeometry(w); this.cache = null; this.dangerCv = null; this.sel = null; this.route = null; this.pins = {};
      const g = w.grid; this.maxS = Math.max(6, Math.min(14, Math.floor(Math.sqrt(4.5e6 / g.n)))); this.fit(); this.dirty = true;
    }
    resize() { const r = this.cv.getBoundingClientRect(); this.dpr = Math.min(2, window.devicePixelRatio || 1); this.cv.width = Math.max(10, Math.round(r.width * this.dpr)); this.cv.height = Math.max(10, Math.round(r.height * this.dpr)); this.W = r.width; this.H = r.height; this.dirty = true; }
    fit() { if (!this.world) return; const g = this.world.grid, W = this.W || 800, H = this.H || 500, k = Math.min(W / g.w, H / g.h) * 0.98; this.view = { k, tx: (W - g.w * k) / 2, ty: (H - g.h * k) / 2 }; this.dirty = true; }
    zoomAt(sx, sy, f) { const v = this.view, g = this.world.grid, min = Math.min(this.W / g.w, this.H / g.h) * 0.6, nk = Math.max(min, Math.min(60, v.k * f)); f = nk / v.k; v.tx = sx - (sx - v.tx) * f; v.ty = sy - (sy - v.ty) * f; v.k = nk; this.dirty = true; }
    pan(dx, dy) { this.view.tx += dx; this.view.ty += dy; this.dirty = true; }
    focusCell(c, k) { const g = this.world.grid; this.view.k = k || Math.max(this.view.k, 14); this.view.tx = this.W / 2 - g.cx[c] * this.view.k; this.view.ty = this.H / 2 - g.cy[c] * this.view.k; this.dirty = true; }
    screenToCell(sx, sy) { const g = this.world.grid, x = (sx - this.view.tx) / this.view.k, y = (sy - this.view.ty) / this.view.k; const cx = Math.floor(x), cy = Math.floor(y); if (cx < 0 || cy < 0 || cx >= g.w || cy >= g.h) return -1; return cy * g.w + cx; }

    // Перший кадр будується одразу; вищу роздільність (при наближенні) будуємо відкладено, щоб рух і масштаб не підвисали: поки готується, малюється наявна
    layersFor(S) {
      if (this.cache && this.cache.S >= S) return this.cache;
      if (!this.cache) return this.buildLayers(S);
      this.wantS = S; clearTimeout(this.upT);
      this.upT = setTimeout(() => { if (this.world && (!this.cache || this.cache.S < this.wantS)) { this.buildLayers(this.wantS); this.dirty = true; } }, 220);
      return this.cache;
    }
    buildLayers(S) {
      const w = this.world, g = this.geom, t0 = performance.now();
      this.cache = { S, base: R.BaseLayer.renderBase(w, g, S), political: R.BaseLayer.renderPolitical(w, g, S), decor: R.Decor.renderDecor(w, S), ms: performance.now() - t0 };
      return this.cache;
    }
    pickS(k) { return k < 9 ? Math.min(this.maxS, 8) : this.maxS; }

    // Малює кадр у ctx: W×H CSS-пікселів, view — камера
    render(ctx, W, H, view, opt) {
      const w = this.world, g = w.grid, L = this.layers, k = view.k, t = (opt && opt.time) || performance.now();
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = R.Palette.theme.bg; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      const sc = (opt && opt.scale) || this.dpr; ctx.setTransform(sc, 0, 0, sc, 0, 0);
      const C = this.layersFor(this.pickS(k * (opt && opt.hiRes ? 2 : 1)));
      ctx.save(); ctx.translate(view.tx, view.ty); ctx.scale(k, k); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(C.base, 0, 0, g.w, g.h);
      if (L.political) ctx.drawImage(C.political, 0, 0, g.w, g.h);
      if (L.relief) ctx.drawImage(C.decor, 0, 0, g.w, g.h);
      if (L.danger) { if (!this.dangerCv) this.dangerCv = R.Vectors.dangerCanvas(w); ctx.drawImage(this.dangerCv, 0, 0, g.w, g.h); }
      if (L.rivers) R.Vectors.drawRivers(ctx, this.geom, view);
      R.Vectors.drawBorders(ctx, this.geom, w, view, L);
      if (L.sea) R.Vectors.drawSeaRoutes(ctx, this.geom, w, view);
      R.Vectors.drawRoads(ctx, this.geom, view, L);
      if (this.route) R.Vectors.drawRoute(ctx, this.route.cells, w, view);
      ctx.restore();
      // значки в екранних координатах
      const hits = [], boxes = [], ik = iconK(k), vis = (x, y) => x > -30 && y > -40 && x < W + 30 && y < H + 30;
      if (L.pois) for (const o of w.pois) { if ((o.cls === 'minor' && k < 9) || (o.cls === 'major' && k < 6)) continue; const x = o.x * k + view.tx, y = o.y * k + view.ty; if (!vis(x, y)) continue; R.IconsPlaces.drawPoi(ctx, o, x, y, ik); hits.push({ t: 'p', o, x, y, r: 9 * ik }); }
      if (L.lairs) for (const l of w.lairs) { if (l.tier === 1 && k < 6.5) continue; const x = l.x * k + view.tx, y = l.y * k + view.ty; if (!vis(x, y)) continue; R.IconsPlaces.drawLair(ctx, l, x, y, ik, t); hits.push({ t: 'l', o: l, x, y, r: (l.tier === 1 ? 7 : 11) * ik }); }
      if (L.settlements) {
        const order = w.settlements.slice().sort((a, b) => a.y - b.y);
        for (const s of order) { if (!R.Labels.visibleRank(s.rank, k)) continue; const x = s.x * k + view.tx, y = s.y * k + view.ty; if (!vis(x, y)) continue; R.IconsSettlements.drawSettlement(ctx, s, x, y, ik); const sz = R.Data.ranks[s.rank].size * 2.2 * ik + 4; boxes.push([x - sz, y - sz * 1.6, x + sz, y + 3]); hits.push({ t: 's', o: s, x, y: y - 4 * ik, r: (4 + R.Data.ranks[s.rank].size * 2.2) * ik }); }
      }
      R.Labels.drawLabels(ctx, w, view, L, boxes);
      this.drawSelection(ctx, view, t);
      if (L.scale) this.drawScale(ctx, W, H, k);
      if (!opt || !opt.noHits) this.hits = hits;
    }
    drawSelection(ctx, view, t) {
      const w = this.world;
      const ring = (x, y, r, col) => { ctx.beginPath(); ctx.arc(x, y, r, 0, 6.3); ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.stroke(); ctx.strokeStyle = 'rgba(0,0,0,.5)'; ctx.lineWidth = 1; ctx.stroke(); };
      if (this.sel) { const h = this.hits.find(x => x.o === this.sel.o); if (h) ring(h.x, h.y, h.r + 6 + Math.sin(t / 250) * 1.5, '#ffd24a'); }
      for (const key of ['A', 'B']) { const p = this.pins[key]; if (!p) continue; const x = w.grid.cx[p] * view.k + view.tx, y = w.grid.cy[p] * view.k + view.ty; ring(x, y, 11, key === 'A' ? '#3cff9a' : '#ff5a3c'); ctx.font = '700 12px sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.strokeStyle = '#000'; ctx.lineWidth = 3; ctx.strokeText(key, x, y - 16); ctx.fillText(key, x, y - 16); }
    }
    drawScale(ctx, W, H, k) {
      const km = this.world.params.kmPerCell, pxPerKm = k / km, nice = [1, 2, 5, 10, 20, 50, 100, 200, 500]; let len = nice[0];
      for (const n of nice) { if (n * pxPerKm <= 150) len = n; }
      const px = len * pxPerKm, x = 16, y = H - 16;
      ctx.fillStyle = 'rgba(244,234,210,.85)'; ctx.fillRect(x - 6, y - 20, px + 12, 26); ctx.strokeStyle = '#2f2418'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y - 6); ctx.lineTo(x, y); ctx.lineTo(x + px, y); ctx.lineTo(x + px, y - 6); ctx.stroke();
      ctx.font = '12px sans-serif'; ctx.fillStyle = '#2f2418'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText(len + ' км', x + 2, y - 9);
    }
    draw() { if (!this.world || !this.W) return; this.render(this.ctx, this.W, this.H, this.view, {}); this.dirty = false; }
    hitAt(sx, sy) { let best = null, bd = 1e9; for (const h of this.hits) { const d = Math.hypot(h.x - sx, h.y - sy); if (d <= h.r + 4 && d < bd) { bd = d; best = h; } } return best; }
    // PNG заданої ширини (пікселі) з усією картою
    exportCanvas(widthPx) {
      const g = this.world.grid, k = widthPx / g.w, H = Math.round(g.h * k), cv = document.createElement('canvas'); cv.width = widthPx; cv.height = H;
      const saveHits = this.hits, saveSel = this.sel; this.sel = null;
      this.render(cv.getContext('2d'), widthPx, H, { k, tx: 0, ty: 0 }, { scale: 1, hiRes: true, noHits: true }); this.sel = saveSel; this.hits = saveHits; return cv;
    }
  }
  R.Scene = Scene; R.DEFAULT_LAYERS = DEFAULT_LAYERS;
})();
