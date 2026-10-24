/* Механіка «building»: ділянка поселення 40×40, розміщення будівель, дороги, що виростають навколо них і зникають при зносі.
   Зберігається лише town.buildings (serialize); ландшафт ділянки відновлюється з середовища env (світ Атласу): { tileClass(x,y), share(x,y,classes,r) }. Без DOM. */
(function (root) {
  'use strict';
  const Mech = root.Mech = root.Mech || {};
  const Rng = Mech.Rng || require('../rng/index.js');
  const BD = Mech.BuildingData || require('./data.js');
  const ROAD_COST = 3, MAXLINK = 75, MAXR = 230, TILE = 20; // ROAD_COST золота за 20 м нової вулиці; MAXLINK, MAXR у метрах
  // розміри споруд, м (ширина, глибина)
  const SZ = { house: [7, 6], farm: [12, 9], lumber: [7, 6], quarry: [8, 7], mine: [8, 7], fisher: [6, 5], herbalist: [6, 5], workshop: [9, 7], shop: [8, 6], tavern: [10, 8], warehouse: [11, 8], yard: [12, 10], guard: [8, 7] };
  const rad = b => Math.max(b.w, b.h) / 2;

  // геометрія: найближча точка ламаної (плоский масив [x0,y0,x1,y1,…]) до (x,y)
  function nearOn(pts, x, y) {
    let best = null;
    for (let i = 2; i < pts.length; i += 2) {
      const ax = pts[i - 2], ay = pts[i - 1], dx = pts[i] - ax, dy = pts[i + 1] - ay, l2 = dx * dx + dy * dy || 1e-9, t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / l2)), px = ax + dx * t, py = ay + dy * t, d = Math.hypot(x - px, y - py);
      if (!best || d < best.d) best = { d, px, py, a: Math.atan2(dy, dx) };
    }
    return best;
  }
  const lenOf = pts => { let l = 0; for (let i = 2; i < pts.length; i += 2) l += Math.hypot(pts[i] - pts[i - 2], pts[i + 1] - pts[i - 1]); return l; };

  // base — стартове поселення з генератора міст Атласу (mechanics/atlas-map: startTown): вулиці, площа, колодязь, дім старости, дерева
  function create(env, sid, base) {
    const e = base.elder, town = { v: 2, sid, env, base, buildings: [{ id: 1, type: 'hall', x: e.x, y: e.y, w: e.w, h: e.h, a: e.a, spur: null, parent: -1 }], orphans: [], nextId: 2 };
    return town;
  }
  const serialize = town => ({ v: town.v, sid: town.sid, buildings: town.buildings.map(b => Object.assign({}, b)), orphans: town.orphans, nextId: town.nextId });
  function restore(env, base, saved) { return { v: saved.v, sid: saved.sid, env, base, buildings: saved.buildings, orphans: saved.orphans || [], nextId: saved.nextId }; }
  const byId = (town, id) => town.buildings.find(b => b.id === id);
  // усі вулиці: основні (з генератора) і відгалуження від будівель; owner — чия відноска (id будівлі чи -1)
  function network(town) {
    const out = town.base.streets.map(st => ({ pts: st.pts, hw: st.hw, owner: -1 }));
    for (const b of town.buildings) if (b.spur) out.push({ pts: b.spur, hw: 3, owner: b.id });
    for (const o of town.orphans) out.push({ pts: o.spur, hw: 3, owner: o.id });
    return out;
  }
  function hit(town, x, y) { let best = null, bd = 1e9; for (const b of town.buildings) { const d = Math.hypot(b.x - x, b.y - y); if (d < rad(b) * 1.05 && d < bd) { bd = d; best = b; } } return best; }

  // чи можна поставити будівлю; повертає відгалуження дороги (spur) до мережі
  function canPlace(town, type, x, y) {
    const T = BD.TYPES[type]; if (!T || T.core) return { ok: false, reason: 'Такої будівлі не можна ставити' };
    if (Math.hypot(x, y) > MAXR) return { ok: false, reason: 'Задалеко від центру поселення' };
    const [w, h] = SZ[type] || [7, 6], nb = { x, y, w, h, a: 0 }, ra = rad(nb), tr = town.env.classAt(x, y);
    if (T.on ? !T.on.includes(tr) : (tr === 0 || tr === 5)) return { ok: false, reason: T.on ? 'Не підходить місцевість для цієї будівлі' : 'Тут не збудувати (вода чи гори)' };
    for (const [ox, oy] of [[ra, 0], [-ra, 0], [0, ra], [0, -ra]]) if (town.env.classAt(x + ox, y + oy) === 0) return { ok: false, reason: 'Будівля потрапляє у воду' };
    const pl = town.base.plaza; if (Math.hypot(x - pl.x, y - pl.y) < pl.r + ra * 0.8) return { ok: false, reason: 'Це площа' };
    for (const b of town.buildings) if (Math.hypot(b.x - x, b.y - y) < rad(b) + ra + 1.2) return { ok: false, reason: 'Місце зайняте' };
    if (T.yields) { const sh = town.env.share(x, y, T.yields.classes, T.yields.r); if (sh < T.yields.need / 2) return { ok: false, reason: 'Замало потрібної місцевості поруч (' + Math.round(sh * 100) + '%, треба ≥ ' + Math.round(T.yields.need * 50) + '%)' }; }
    let best = null;
    for (const st of network(town)) {
      const q = nearOn(st.pts, x, y); if (!q) continue;
      if (q.d - st.hw < ra * 0.7) return { ok: false, reason: 'Тут вулиця' };
      if (town.buildings.some(b => Math.hypot(b.x - q.px, b.y - q.py) < rad(b) * 0.9)) continue;
      if (!best || q.d < best.q.d) best = { st, q };
    }
    if (!best || best.q.d > MAXLINK) return { ok: false, reason: 'Задалеко від доріг (не далі ' + MAXLINK + ' м)' };
    const q = best.q, gap = q.d - best.st.hw - ra, side = Math.sin(x * 12.9898 + y * 78.233) > 0 ? 1 : -1;
    let a = q.a; // вздовж вулиці
    let spur = null, len = 0;
    if (gap > 3) {
      const ux = (x - q.px) / q.d, uy = (y - q.py) / q.d, fx = x - ux * ra * 0.7, fy = y - uy * ra * 0.7, L = Math.hypot(fx - q.px, fy - q.py), nx = -uy * side, ny = ux * side;
      const make = k => [q.px, q.py, q.px + (fx - q.px) * 0.5 + nx * L * 0.1 * k, q.py + (fy - q.py) * 0.5 + ny * L * 0.1 * k, fx, fy];
      const clear = pts => { for (let t = 0.1; t < 1; t += 0.1) { const px = (1 - t) * (1 - t) * pts[0] + 2 * (1 - t) * t * pts[2] + t * t * pts[4], py = (1 - t) * (1 - t) * pts[1] + 2 * (1 - t) * t * pts[3] + t * t * pts[5]; if (town.buildings.some(b => Math.hypot(b.x - px, b.y - py) < rad(b) * 0.8)) return false; } return true; };
      // згладжена лінія: точки кривої, а не лише вузли
      const curve = pts => { const o = []; for (let t = 0; t <= 1.0001; t += 0.2) o.push((1 - t) * (1 - t) * pts[0] + 2 * (1 - t) * t * pts[2] + t * t * pts[4], (1 - t) * (1 - t) * pts[1] + 2 * (1 - t) * t * pts[3] + t * t * pts[5]); return o; };
      let ctrl = make(1); if (!clear(ctrl)) { ctrl = make(-1); if (!clear(ctrl)) return { ok: false, reason: 'Шлях до дороги перекрито' }; }
      spur = curve(ctrl); len = lenOf(spur);
    }
    const parent = best.st.owner;
    return { ok: true, spur, len, parent, a, w, h, newRoad: Math.ceil(len / TILE) };
  }
  const costOf = (type, newRoad) => { const c = Object.assign({}, BD.TYPES[type].cost); c.gold = (c.gold || 0) + ROAD_COST * newRoad; return c; };
  const canPay = (stock, cost) => Object.keys(cost).every(k => (stock[k] || 0) >= cost[k]);
  function place(town, stock, type, x, y) {
    const r = canPlace(town, type, x, y); if (!r.ok) return r;
    const cost = costOf(type, r.newRoad); if (!canPay(stock, cost)) return { ok: false, reason: 'Не вистачає ресурсів', cost };
    for (const k in cost) stock[k] -= cost[k];
    const b = { id: town.nextId++, type, x, y, w: r.w, h: r.h, a: r.a, spur: r.spur, parent: r.parent };
    town.buildings.push(b);
    return { ok: true, building: b, cost, newRoad: r.newRoad };
  }
  const roadLen = town => town.buildings.reduce((a, b) => a + (b.spur ? lenOf(b.spur) : 0), 0) + town.orphans.reduce((a, o) => a + lenOf(o.spur), 0);
  function demolish(town, stock, id) {
    const b = byId(town, id); if (!b || BD.TYPES[b.type].core) return { ok: false, reason: 'Цю будівлю знести не можна' };
    const before = roadLen(town), refund = {};
    for (const k in BD.TYPES[b.type].cost) { refund[k] = Math.floor(BD.TYPES[b.type].cost[k] * 0.5); stock[k] = (stock[k] || 0) + refund[k]; }
    town.buildings = town.buildings.filter(x => x.id !== id);
    // відгалуження лишається, поки до нього хтось під'єднаний (перейшло в «осиротілі»)
    if (b.spur) town.orphans.push({ id: b.id, spur: b.spur, parent: b.parent });
    for (let again = true; again;) { again = false; town.orphans = town.orphans.filter(o => { const used = town.buildings.some(x => x.parent === o.id) || town.orphans.some(q => q !== o && q.parent === o.id); if (!used) again = true; return used; }); }
    return { ok: true, refund, roadsRemoved: Math.round((before - roadLen(town)) / TILE), building: b };
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
  const api = { TILE, ROAD_COST, MAXLINK, MAXR, SZ, TYPES: BD.TYPES, ORDER: BD.ORDER, UNLOCKED: BD.UNLOCKED, create, serialize, restore, canPlace, place, demolish, costOf, canPay, countTiles, housing, storageCap, count, defense, byId, hit, network, roadLen, produceDay };
  Mech.Building = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(globalThis);
