/* Механіка «atlas-map»: адаптер міста гравця до формату міста Атласу 2.0 (щоб його малював той самий рендер, що й усі міста карти).
   Вхід: місто гравця (mechanics/building: стартова основа з генератора Атласу, будівлі, відгалуження доріг). Вихід: об'єкт міста для A.Town.setCustom. Метри від центру клітини поселення. Без DOM. */
(function (root) {
  'use strict';
  const Mech = root.Mech = root.Mech || {};
  // типи гри → типи споруд Атласу (колір, вигляд)
  const ATLAS_TYPE = { hall: 'elder', house: 'house', farm: 'farm', lumber: 'hut', quarry: 'mineshaft', mine: 'mineshaft', fisher: 'fishhut', herbalist: 'pharm', workshop: 'smith', shop: 'shop', tavern: 'tavern', warehouse: 'warehouse', yard: 'inn', guard: 'barracks', plaza: 'market' };
  const segDist = (px, py, ax, ay, bx, by) => { const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy || 1e-9, t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l2)); return Math.hypot(px - ax - dx * t, py - ay - dy * t); };
  // town — місто гравця (mechanics/building): town.base (старт з генератора Атласу), town.buildings, відгалуження доріг. Метри від центру клітини поселення.
  function build(W, s, town, names) {
    const A = root.Atlas2, T = A.CityData.T, base = town.base, extent = 170, ni = { n: 0 };
    const streets = base.streets.map((st, i) => ({ id: i, kind: st.kind, hw: st.hw, parent: -1, pts: st.pts, br: [], name: st.name, len: 0, district: -1 }));
    const lane = (pts) => { let len = 0; for (let i = 2; i < pts.length; i += 2) len += Math.hypot(pts[i] - pts[i - 2], pts[i + 1] - pts[i - 1]); streets.push({ id: streets.length, kind: 'lane', hw: 3, parent: -1, pts, br: [], name: 'Провулок ' + (++ni.n), len, district: -1 }); };
    for (const b of town.buildings) if (b.spur) lane(b.spur);
    for (const o of town.orphans) lane(o.spur);
    const buildings = [];
    for (const b of town.buildings) {
      const ty = b.type === 'hall' ? 'elder' : ATLAS_TYPE[b.type] || 'house', t = T[ty];
      buildings.push({ id: buildings.length, gid: b.id, type: ty, x: b.x, y: b.y, w: b.w, h: b.h, a: b.a, st: -1, side: 1, district: -1, cond: 'good', uniq: b.type === 'hall', name: b.type === 'hall' ? 'Дім старости' : (names && names[b.id]) || t.n, floors: 1, addr: '', hook: '', pop: 0 });
    }
    // дерева не ростуть на вулицях і під будівлями
    const near = (x, y) => { for (const st of streets) for (let i = 2; i < st.pts.length; i += 2) { const ax = st.pts[i - 2], ay = st.pts[i - 1], dx = st.pts[i] - ax, dy = st.pts[i + 1] - ay, l2 = dx * dx + dy * dy || 1e-9, u = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / l2)); if (Math.hypot(x - ax - dx * u, y - ay - dy * u) < st.hw + 3) return true; } return buildings.some(b => Math.hypot(b.x - x, b.y - y) < Math.max(b.w, b.h) / 2 + 3); };
    const trees = base.trees.filter(t => !near(t.x, t.y));
    const plaza = { t: 'plaza', x: base.plaza.x, y: base.plaza.y, r: base.plaza.r, name: base.plaza.name };
    return { sid: s.id, name: s.name, rank: s.rank, tier: 1, fate: null, occupier: null, port: false, pop: s.pop, c0: [0, 0], R: extent, Rmap: extent * 1.1, walled: false, wall: { on: false, runs: [], towers: [], gates: [], w: 0, mat: 'palisade' }, keep: null,
      streets, rivers: [], shore: [], piers: [], ships: [], plazas: [plaza], sites: [], features: [plaza], props: base.props, buildings, districts: [], fields: [], trees, camps: [], stats: { buildings: buildings.length, streets: streets.length }, group: 'grass', env: { waterKind: () => 0, segDist }, bgrid: new Map(), BK: 24, districtOf: () => -1, s, custom: true };
  }
  Mech.AtlasTown = { build, ATLAS_TYPE };
  if (typeof module !== 'undefined' && module.exports) module.exports = Mech.AtlasTown;
})(globalThis);
