// Точки інтересу: великі (до них ведуть малі дороги) і дрібні (до них ведуть стежки).
(function () {
  'use strict';
  const R = (globalThis.RealmMap = globalThis.RealmMap || {});

  const groupOf = (world, c) => {
    const id = R.Data.biomes[world.bio[c]].id;
    const out = ['land'];
    if (id === 'forest' || id === 'taiga' || id === 'enchanted') out.push('forest');
    if (id === 'hills') out.push('hills');
    if (id === 'mountain' || id === 'peaks') { out.push('mountain'); }
    if (id === 'grass' || id === 'steppe') out.push('plain');
    if (world.river[c]) out.push('river');
    return out;
  };
  const allowed = (t, groups) => !t.on || t.on.some(x => groups.includes(x));

  function placePois(world, p, namer, settlements) {
    const g = world.grid, rnd = R.Rng.stream(p.seed, 'poi'), P = [], dens = p.density, nb = new Int32Array(8);
    const taken = settlements.map(s => s.cell);
    const farFrom = (c, d) => { for (const t of taken) if (R.Grid.dist(g, c, t) < d) return false; return true; };
    const cultOf = c => world.provinces[world.province[c] >= 0 ? world.province[c] : 0].culture;
    function add(type, cell, access, name) {
      const def = R.Data.poi[type], o = { id: P.length, type, cls: def.cls, name, cell, access: access === undefined ? cell : access, x: g.cx[cell], y: g.cy[cell], region: world.region[cell] >= 0 ? world.region[cell] : (world.region[access] >= 0 ? world.region[access] : 0), danger: def.danger || 0 };
      o.province = world.regions[o.region].province; P.push(o); taken.push(cell); return o;
    }
    // озера
    const lakeComp = R.Grid.components(g, i => world.water[i] === 2, true);
    lakeComp.sizes.forEach((sz, k) => {
      if (sz < 4) return;
      let sx = 0, sy = 0; const cells = []; for (let i = 0; i < g.n; i++) if (lakeComp.id[i] === k) { cells.push(i); sx += g.cx[i]; sy += g.cy[i]; }
      sx /= cells.length; sy /= cells.length;
      const mid = cells.reduce((a, b) => (Math.hypot(g.cx[b] - sx, g.cy[b] - sy) < Math.hypot(g.cx[a] - sx, g.cy[a] - sy) ? b : a));
      // берег: суша, дотична до озера, найближча до центру озера
      let acc = -1, ad = 1e9;
      for (const c of cells) { const m = R.Grid.neighbors(g, c, true, nb); for (let q = 0; q < m; q++) { const j = nb[q]; if (world.water[j] === 0) { const d = Math.hypot(g.cx[j] - sx, g.cy[j] - sy); if (d < ad) { ad = d; acc = j; } } } }
      if (acc < 0) return;
      const o = add('lake', mid, acc, namer.lakeName(cultOf(acc))); o.size = sz;
    });
    // вершини: локальні максимуми гірських пасм
    const mcomp = R.Grid.components(g, i => world.bio[i] === R.Data.B.MOUNTAIN || world.bio[i] === R.Data.B.PEAKS, true);
    const peaks = []; for (let i = 0; i < g.n; i++) if (mcomp.id[i] >= 0) peaks.push(i);
    peaks.sort((a, b) => world.height[b] - world.height[a] || a - b);
    const peakCount = Math.round(world.landCount / 900 * dens + 1);
    const pk = [];
    for (const c of peaks) { if (pk.length >= peakCount) break; if (pk.some(o => R.Grid.dist(g, c, o) < 14)) continue; pk.push(c); }
    for (const c of pk) add('mountain', c, c, namer.peak(cultOf(c)));
    // великі й дрібні місця за регіонами
    const cellsOf = world.regions.map(() => []); for (let i = 0; i < g.n; i++) if (world.region[i] >= 0) cellsOf[world.region[i]].push(i);
    const majorW = [['ruins', 35], ['monument', 20], ['temple', 15], ['mage_tower', 15], ['waterfall', 15]];
    const minorW = [['glade', 18], ['small_mine', 12], ['viewpoint', 14], ['small_monument', 12], ['park', 12], ['bandit_camp', 12], ['shrine', 10], ['hermit', 10]];
    for (const reg of world.regions) {
      const cells = cellsOf[reg.id]; if (cells.length < 10) continue;
      const pickCell = (type) => {
        const def = R.Data.poi[type];
        for (let t = 0; t < 60; t++) { const c = cells[Math.floor(rnd() * cells.length)]; if (!allowed(def, groupOf(world, c))) continue; if (!farFrom(c, 2.5)) continue; return c; }
        return -1;
      };
      let nMaj = Math.round(cells.length / 170 * dens), nMin = Math.round(cells.length / 45 * dens);
      for (; nMaj > 0; nMaj--) { const type = R.Rng.weighted(rnd, majorW), c = pickCell(type); if (c < 0) continue; add(type, c, c, poiName(type, namer, cultOf(c), rnd)); }
      for (; nMin > 0; nMin--) { const type = R.Rng.weighted(rnd, minorW), c = pickCell(type); if (c < 0) continue; add(type, c, c, poiName(type, namer, cultOf(c), rnd)); }
    }
    return P;
  }
  const ADJ = { ruins: ['Старі', 'Забуті', 'Прокляті', 'Сірі'], monument: ['Давній', 'Мовчазний', 'Різьблений'], temple: ['Світлий', 'Тихий', 'Гірський'], mage_tower: ['Вежа'], waterfall: ['Водоспад'] };
  function poiName(type, namer, cult, rnd) {
    const def = R.Data.poi[type], base = namer.place(cult);
    if (type === 'ruins') return R.Rng.pick(rnd, ADJ.ruins) + ' руїни ' + base;
    if (type === 'monument') return R.Rng.pick(rnd, ADJ.monument) + ' монумент ' + base;
    if (type === 'temple') return 'Храм-монастир ' + base;
    if (type === 'mage_tower') return 'Вежа ' + base;
    if (type === 'waterfall') return 'Водоспад ' + base;
    return def.name + ' ' + base;
  }
  R.Pois = { placePois, groupOf };
})();
