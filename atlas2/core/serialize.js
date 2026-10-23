// Атлас 2.0: збереження. Параметри (світ відновлюється точно, бо генерація детермінована) і повний експорт світу для гри.
(function () {
  'use strict';
  const A = globalThis.Atlas2;
  const KEYS = ['seed', 'size', 'worldType', 'provinces', 'regionsPerProvince', 'density', 'rugged', 'riverDensity'];
  function paramsToJSON(p) { const o = { format: 'atlas2-params', version: 1 }; for (const k of KEYS) o[k] = p[k]; return o; }
  function paramsFromJSON(o) { if (!o || o.format !== 'atlas2-params') throw new Error('Це не файл параметрів Атласу 2.0'); const p = {}; for (const k of KEYS) if (o[k] != null) p[k] = o[k]; return p; }
  // повний експорт: об'єкти без важких масивів; шари — у RLE
  function rle(a) { const o = []; let v = a[0], n = 1; for (let i = 1; i < a.length; i++) { if (a[i] === v) n++; else { o.push(v, n); v = a[i]; n = 1; } } o.push(v, n); return o; }
  function exportWorld(W) {
    return {
      format: 'atlas2-world', version: 1, params: paramsToJSON(W.params), w: W.w, h: W.h, kmPerCell: W.params.kmPerCell,
      provinces: W.provinces, regions: W.regions, settlements: W.settlements || [], roads: (W.roads || []).map(r => ({ level: r.level, from: r.from, to: r.to, cells: r.cells })), seaRoutes: W.seaRoutes || [],
      rivers: W.rivers, layers: { land: rle(W.land), ocean: rle(W.ocean), lake: rle(W.lake), biome: rle(W.bio), province: rle(W.province), region: rle(W.region), river: rle(W.river) },
    };
  }
  A.Save = { paramsToJSON, paramsFromJSON, exportWorld };
})();
