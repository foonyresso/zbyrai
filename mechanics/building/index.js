/* Механіка «building»: ділянка поселення 40×40, розміщення будівель, дороги, що виростають навколо них і зникають при зносі.
   Зберігається лише town.buildings (serialize); ландшафт ділянки відновлюється з середовища env (світ Атласу): { tileClass(x,y), share(x,y,classes,r) }. Без DOM. */
(function (root) {
  'use strict';
  const Mech = root.Mech = root.Mech || {};
  const Rng = Mech.Rng || require('../rng/index.js');
  const BD = Mech.BuildingData || require('./data.js');
  const N = 40, C = 20, TILE = 20, MAXLINK = 3, ROAD_COST = 3; // TILE: метрів у плитці
  const D4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const inb = (x, y) => x >= 0 && y >= 0 && x < N && y < N;
  const at = (x, y) => y * N + x;

  // ландшафт ділянки: клас місцевості під кожною плиткою; центр вирівняно
  function terrainFor(env) {
    const t = new Uint8Array(N * N);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) t[at(x, y)] = Math.abs(x - C) <= 4 && Math.abs(y - C) <= 4 ? 2 : env.tileClass(x, y);
    return t;
  }
  const PLAZA = []; for (let y = C - 1; y <= C + 1; y++) for (let x = C - 1; x <= C + 1; x++) PLAZA.push([x, y]);
  const HALL = { x: C + 2, y: C - 1, w: 2, h: 2 };
  const CORE_ROADS = [[C, C - 4], [C, C - 3], [C, C - 2], [C, C + 2], [C, C + 3], [C, C + 4], [C - 4, C], [C - 3, C], [C - 2, C], [C + 2, C + 1], [C + 3, C + 1], [C + 4, C + 1]];
  const footprint = b => { const t = BD.TYPES[b.type]; const w = b.type === 'hall' ? HALL.w : 1, h = b.type === 'hall' ? HALL.h : 1; const out = []; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) out.push([b.x + x, b.y + y]); return out; };

  function rebuild(town) {
    town.roads = new Uint8Array(N * N); town.occ = new Int16Array(N * N);
    for (const [x, y] of PLAZA) town.occ[at(x, y)] = -1;
    for (const [x, y] of CORE_ROADS) town.roads[at(x, y)] = 1;
    for (const b of town.buildings) {
      for (const [x, y] of footprint(b)) town.occ[at(x, y)] = b.id;
      for (const [x, y] of b.path) town.roads[at(x, y)] = 1;
    }
    return town;
  }
  function create(env, sid) {
    const town = { v: 1, sid, n: N, env, terrain: terrainFor(env), buildings: [{ id: 1, type: 'hall', x: HALL.x, y: HALL.y, path: [] }], nextId: 2 };
    return rebuild(town);
  }
  const serialize = town => ({ v: town.v, sid: town.sid, buildings: town.buildings, nextId: town.nextId });
  function restore(env, saved) {
    const town = { v: saved.v, sid: saved.sid, n: N, env, terrain: terrainFor(env), buildings: saved.buildings, nextId: saved.nextId };
    return rebuild(town);
  }
  const byId = (town, id) => town.buildings.find(b => b.id === id);
  const isCoreRoad = (x, y) => CORE_ROADS.some(r => r[0] === x && r[1] === y);

  // чи можна поставити будівлю; повертає шлях нових клітин дороги до мережі
  function canPlace(town, type, x, y) {
    const T = BD.TYPES[type]; if (!T || T.core) return { ok: false, reason: 'Такої будівлі не можна ставити' };
    if (!inb(x, y)) return { ok: false, reason: 'Поза ділянкою' };
    const i = at(x, y);
    if (town.occ[i]) return { ok: false, reason: 'Клітина зайнята' };
    if (town.roads[i]) return { ok: false, reason: 'Тут дорога' };
    const tr = town.terrain[i];
    if (T.on ? !T.on.includes(tr) : (tr === 0 || tr === 5)) return { ok: false, reason: T.on ? 'Не підходить місцевість для цієї будівлі' : 'Тут не збудувати (вода чи скелі)' };
    if (T.yields) { const sh = countTiles(town, { type, x, y }); if (sh < T.yields.need / 2) return { ok: false, reason: 'Замало потрібної місцевості поруч (' + Math.round(sh * 100) + '%, треба хоча б ' + Math.round(T.yields.need * 50) + '%)' }; }
    // пошук найкоротшого з'єднання з дорогами через вільні клітини
    const prev = new Map([[i, -1]]), depth = new Map([[i, 0]]), q = [[x, y]];
    while (q.length) {
      const [cx, cy] = q.shift(), d = depth.get(at(cx, cy));
      for (const [ox, oy] of D4) { const nx = cx + ox, ny = cy + oy; if (inb(nx, ny) && town.roads[at(nx, ny)]) {
        const path = []; for (let c = at(cx, cy); c !== i; c = prev.get(c)) path.push([c % N, (c / N) | 0]);
        return { ok: true, path: path.reverse(), join: [nx, ny] };
      } }
      if (d >= MAXLINK) continue;
      for (const [ox, oy] of D4) { const nx = cx + ox, ny = cy + oy; if (!inb(nx, ny)) continue; const j = at(nx, ny); if (prev.has(j) || town.occ[j] || town.terrain[j] === 0) continue; prev.set(j, at(cx, cy)); depth.set(j, d + 1); q.push([nx, ny]); }
    }
    return { ok: false, reason: 'Задалеко від доріг (не далі ' + MAXLINK + ' клітин)' };
  }
  // ланцюжок доріг від клітини до ядра (щоб дорога лишалась, поки хтось нею користується)
  function chainToCore(town, join) {
    const prev = new Map([[at(join[0], join[1]), -1]]), q = [join]; let hit = isCoreRoad(join[0], join[1]) ? at(join[0], join[1]) : -1;
    while (q.length && hit < 0) { const [cx, cy] = q.shift(); for (const [ox, oy] of D4) { const nx = cx + ox, ny = cy + oy, j = at(nx, ny); if (!inb(nx, ny) || !town.roads[j] || prev.has(j)) continue; prev.set(j, at(cx, cy)); if (isCoreRoad(nx, ny)) { hit = j; break; } q.push([nx, ny]); } }
    const out = []; for (let c = hit; c >= 0; c = prev.get(c)) out.push([c % N, (c / N) | 0]);
    return out;
  }
  const costOf = (type, newRoad) => { const c = Object.assign({}, BD.TYPES[type].cost); c.gold = (c.gold || 0) + ROAD_COST * newRoad; return c; };
  const canPay = (stock, cost) => Object.keys(cost).every(k => (stock[k] || 0) >= cost[k]);
  function place(town, stock, type, x, y) {
    const r = canPlace(town, type, x, y); if (!r.ok) return r;
    const cost = costOf(type, r.path.length); if (!canPay(stock, cost)) return { ok: false, reason: 'Не вистачає ресурсів', cost };
    for (const k in cost) stock[k] -= cost[k];
    const chain = chainToCore(town, r.join), seen = new Set(), path = [];
    for (const p of r.path.concat(chain)) { const k = at(p[0], p[1]); if (!seen.has(k)) { seen.add(k); path.push(p); } }
    const b = { id: town.nextId++, type, x, y, path };
    town.buildings.push(b); rebuild(town);
    return { ok: true, building: b, cost, newRoad: r.path.length };
  }
  function demolish(town, stock, id) {
    const b = byId(town, id); if (!b || BD.TYPES[b.type].core) return { ok: false, reason: 'Цю будівлю знести не можна' };
    const before = town.roads.reduce((a, v) => a + v, 0), refund = {};
    for (const k in BD.TYPES[b.type].cost) { refund[k] = Math.floor(BD.TYPES[b.type].cost[k] * 0.5); stock[k] = (stock[k] || 0) + refund[k]; }
    town.buildings = town.buildings.filter(x => x.id !== id); rebuild(town);
    return { ok: true, refund, roadsRemoved: before - town.roads.reduce((a, v) => a + v, 0), building: b };
  }
  // частка потрібної місцевості навколо будівлі (0..1): від неї залежить видобуток
  function countTiles(town, b) { const Y = BD.TYPES[b.type].yields; return Y ? town.env.share(b.x, b.y, Y.classes, Y.r) : 0; }
  const sum = (town, f) => town.buildings.reduce((a, b) => a + (f(BD.TYPES[b.type], b) || 0), 0);
  const housing = town => sum(town, T => T.house);
  const storageCap = town => sum(town, T => T.storage);
  const count = (town, type) => town.buildings.filter(b => b.type === type).length;
  const defense = town => sum(town, T => T.defense);

  // добове виробництво. eff[buildingId] = ефективності працівників; pop — мешканців. Змінює stock, повертає звіт
  function produceDay(town, stock, eff, pop) {
    const cap = storageCap(town), rep = { by: {}, gold: 0 }, add = (r, v) => { stock[r] = Math.min(cap, (stock[r] || 0) + v); };
    const gain = g => { stock.gold = Math.max(0, (stock.gold || 0) + g); rep.gold += g; };
    for (const b of town.buildings) {
      const T = BD.TYPES[b.type], e = (eff[b.id] || []).reduce((a, v) => a + v, 0); let out = 0;
      if (T.yields) { const f = Math.min(1, countTiles(town, b) / T.yields.need); out = T.yields.perWorker * e * f; add(T.yields.res, out); rep.by[b.id] = { res: T.yields.res, out }; }
      else if (T.makes) {
        const u = Math.min(T.makes.perWorker * e, ...Object.keys(T.makes.in).map(r => (stock[r] || 0) / T.makes.in[r]));
        if (u > 0) { for (const r in T.makes.in) stock[r] -= T.makes.in[r] * u; for (const r in T.makes.out) add(r, T.makes.out[r] * u); }
        rep.by[b.id] = { res: 'tools', out: Math.max(0, u) };
      } else if (T.shop) { const g = Math.min(T.shop * e, 0.8 * pop); gain(g); rep.by[b.id] = { res: 'gold', out: g }; }
      else if (T.tavernGold) { const g = T.tavernGold * e; gain(g); rep.by[b.id] = { res: 'gold', out: g }; }
    }
    gain(1.0 * pop); gain(-0.15 * (town.buildings.length - 1));
    return rep;
  }
  const api = { N, C, TILE, ROAD_COST, PLAZA, HALL, CORE_ROADS, isCoreRoad, create, serialize, restore, canPlace, place, demolish, costOf, canPay, countTiles, housing, storageCap, count, defense, byId, produceDay, footprint, TYPES: BD.TYPES, ORDER: BD.ORDER };
  Mech.Building = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(globalThis);
