/* Механіка «atlas-map»: адаптер міста гравця до формату міста Атласу 2.0 (щоб його малював той самий рендер, що й усі міста карти).
   Вхід: дані ділянки (сітка плиток: дороги, площа, будівлі). Вихід: об'єкт міста для A.Town.setCustom. Метри від центру клітини поселення. Без DOM. */
(function (root) {
  'use strict';
  const Mech = root.Mech = root.Mech || {};
  // типи гри → типи споруд Атласу (колір, вигляд)
  const ATLAS_TYPE = { hall: 'elder', house: 'house', farm: 'farm', lumber: 'hut', quarry: 'mineshaft', mine: 'mineshaft', fisher: 'fishhut', herbalist: 'pharm', workshop: 'smith', shop: 'shop', tavern: 'tavern', warehouse: 'warehouse', yard: 'inn', guard: 'barracks', plaza: 'market' };
  const segDist = (px, py, ax, ay, bx, by) => { const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy || 1e-9, t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l2)); return Math.hypot(px - ax - dx * t, py - ay - dy * t); };
  const SIZE = { hall: 2, plaza: 3 };
  // st: { tile (м), n, c (центральна плитка), roads: Uint8Array, core: (x,y)=>bool, buildings:[{id,type,x,y,name}], plaza:{x,y} (центр) }
  function build(W, s, st) {
    const A = root.Atlas2, T = A.CityData.T, tile = st.tile, n = st.n, M = (t) => (t - st.c) * tile, extent = n * tile / 2 * 1.05;
    const road = (x, y) => x >= 0 && y >= 0 && x < n && y < n && st.roads[y * n + x];
    // вулиці: суцільні відрізки дорожніх плиток по горизонталі й вертикалі
    const streets = []; let ni = 0;
    const addRun = pts => { const core = pts.filter(p => st.core(p[0], p[1])).length * 2 >= pts.length, hw = core ? 4.6 : 3; const flat = []; for (const [x, y] of pts) flat.push(M(x), M(y)); let len = 0; for (let i = 2; i < flat.length; i += 2) len += Math.hypot(flat[i] - flat[i - 2], flat[i + 1] - flat[i - 1]); streets.push({ id: streets.length, kind: core ? 'street' : 'lane', hw, parent: -1, pts: flat, br: pts.map(() => false), name: (core ? 'Вулиця ' : 'Провулок ') + (++ni), len, district: -1 }); };
    for (let y = 0; y < n; y++) { let run = []; for (let x = 0; x <= n; x++) { if (road(x, y)) run.push([x, y]); else { if (run.length > 1) addRun(run); run = []; } } }
    for (let x = 0; x < n; x++) { let run = []; for (let y = 0; y <= n; y++) { if (road(x, y)) run.push([x, y]); else { if (run.length > 1) addRun(run); run = []; } } }
    // одинокі плитки дороги (без сусідів по прямій) малюємо короткими відрізками
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (road(x, y) && !road(x - 1, y) && !road(x + 1, y) && !road(x, y - 1) && !road(x, y + 1)) addRun([[x, y], [x + 0.01, y]]);
    const buildings = [];
    for (const b of st.buildings) {
      const k = SIZE[b.type] || 1, ty = ATLAS_TYPE[b.type] || 'house', t = T[ty], side = k * tile - 5, cx = M(b.x) + (k - 1) * tile / 2, cy = M(b.y) + (k - 1) * tile / 2, big = k > 1;
      buildings.push({ id: buildings.length, gid: b.id, type: ty, x: cx, y: cy, w: side * (big ? 1 : 0.62), h: side * (big ? 1 : 0.62), a: 0, st: -1, side: 1, district: -1, cond: 'good', uniq: big, name: b.name || t.n, floors: 1, addr: '', hook: '', pop: 0 });
    }
    const plaza = st.plaza && { t: 'plaza', x: M(st.plaza.x), y: M(st.plaza.y), r: tile * 1.5, name: 'Площа Закладин' };
    const features = plaza ? [plaza] : [];
    return { sid: s.id, name: s.name, rank: s.rank, tier: 1, fate: null, occupier: null, port: false, pop: s.pop, c0: [0, 0], R: extent, Rmap: extent * 1.1, walled: false, wall: { on: false, runs: [], towers: [], gates: [], w: 0, mat: 'palisade' }, keep: null,
      streets, rivers: [], shore: [], piers: [], ships: [], plazas: features, sites: [], features, props: plaza ? [{ t: 'fountain', x: plaza.x, y: plaza.y, r: 4.2 }] : [], buildings, districts: [], fields: [], trees: [], camps: [], stats: { buildings: buildings.length, streets: streets.length }, group: 'grass', env: { waterKind: () => 0, segDist }, bgrid: new Map(), BK: 24, districtOf: () => -1, s, custom: true };
  }
  Mech.AtlasTown = { build, ATLAS_TYPE };
  if (typeof module !== 'undefined' && module.exports) module.exports = Mech.AtlasTown;
})(globalThis);
