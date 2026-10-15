// Збереження й обмін: параметри (для відновлення карти за зерном) і повний експорт світу (для гри: об’єкти, дороги, шари).
(function () {
  'use strict';
  const R = (globalThis.RealmMap = globalThis.RealmMap || {});
  const FORMAT = 'zbyrai-realm-map';

  // RLE для цілих масивів: "значення:кількість,..." — шари з великими однорідними ділянками стискаються в рази
  function rle(arr) { const out = []; let i = 0; while (i < arr.length) { let j = i; while (j < arr.length && arr[j] === arr[i]) j++; out.push(arr[i] + ':' + (j - i)); i = j; } return out.join(','); }
  function unrle(str, Type) { const out = []; for (const part of str.split(',')) { const [v, n] = part.split(':'); for (let k = 0; k < +n; k++) out.push(+v); } return Type ? Type.from(out) : out; }

  // Лише параметри: цього досить, щоб відновити карту (генерація детермінована)
  function paramsToJSON(p) { return JSON.stringify({ format: FORMAT, version: R.VERSION, params: p }, null, 2); }
  function paramsFromJSON(text) {
    const o = typeof text === 'string' ? JSON.parse(text) : text;
    if (!o || o.format !== FORMAT || !o.params) throw new Error('Це не файл «Карти королівств»');
    return R.Params.normalize(o.params);
  }

  const cellXY = (g, c) => [Math.round(g.cx[c] * 100) / 100, Math.round(g.cy[c] * 100) / 100];
  // Повний світ без «сирих» масивів висот: об’єкти + шари біомів/провінцій/регіонів у RLE
  function worldToJSON(w, pretty) {
    const g = w.grid;
    const out = {
      format: FORMAT, version: w.version, kind: 'world', params: w.params,
      grid: { w: g.w, h: g.h, kmPerCell: w.params.kmPerCell, seaLevel: Math.round(w.seaLevel * 1000) / 1000 },
      legend: { biomes: R.Data.biomes.map(b => b.id), ranks: Object.keys(R.Data.ranks), states: Object.keys(R.Data.states), roadClasses: Object.keys(R.Data.roadClasses) },
      layers: { biome: rle(w.bio), water: rle(w.water), province: rle(w.province), region: rle(w.region), river: rle(w.river), roadLevel: rle(w.roadLevel), danger: rle(w.danger) },
      provinces: w.provinces.map(p => ({ id: p.id, name: p.name, culture: p.cultureName, capital: p.capital, regions: p.regions, cells: p.cells })),
      regions: w.regions.map(r => ({ id: r.id, name: r.name, province: r.province, center: r.center, cells: r.cells })),
      settlements: w.settlements.map(s => ({ id: s.id, name: s.name, rank: s.rank, state: s.state, province: s.province, region: s.region, pos: cellXY(g, s.cell), cell: s.cell, pop: s.pop, port: s.port, goods: s.goods, ore: s.ore || undefined, occupant: s.occupant ? s.occupant.name : undefined, hook: s.hook })),
      pois: w.pois.map(o => ({ id: o.id, name: o.name, type: o.type, cls: o.cls, region: o.region, pos: cellXY(g, o.cell), cell: o.cell, hook: o.hook })),
      lairs: w.lairs.map(l => ({ id: l.id, name: l.name, kind: l.kind, domain: l.domain, tier: l.tier, monster: l.monster, alias: l.alias || undefined, region: l.region, pos: cellXY(g, l.cell), cell: l.cell, hook: l.hook })),
      roads: w.roads.map(r => ({ id: r.id, cls: r.cls, from: r.from, to: r.to, lenKm: r.lenKm, cells: r.cells, bridges: r.bridges })),
      seaRoutes: w.seaRoutes.map(r => ({ id: r.id, from: r.from, to: r.to, lenKm: r.lenKm, danger: r.danger, cells: r.cells })),
      rivers: w.rivers.map(r => ({ id: r.id, flow: r.flow, cells: r.cells })),
      features: w.features.map(f => ({ id: f.id, type: f.type, name: f.name, cell: f.cell })),
      stats: w.stats,
    };
    return JSON.stringify(out, null, pretty ? 1 : 0);
  }
  const csvEsc = v => { v = v === undefined || v === null ? '' : String(v); return /[",\n;]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
  function settlementsCSV(w) {
    const head = ['id', 'назва', 'тип', 'стан', 'провінція', 'регіон', 'населення', 'порт', 'x', 'y', 'товари'];
    const rows = w.settlements.map(s => [s.id, s.name, R.Data.ranks[s.rank].name, R.Data.states[s.state].name, w.provinces[s.province].name, w.regions[s.region].name, s.pop, s.port ? 'так' : '', s.x.toFixed(1), s.y.toFixed(1), (s.goods || []).join('; ')]);
    return '﻿' + [head].concat(rows).map(r => r.map(csvEsc).join(';')).join('\n');
  }
  R.Serialize = { FORMAT, rle, unrle, paramsToJSON, paramsFromJSON, worldToJSON, settlementsCSV };
})();
