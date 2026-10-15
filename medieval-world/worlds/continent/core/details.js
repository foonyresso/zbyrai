// Описові деталі: товари поселень, зачіпки для пригод, підписи станів. Не впливає на геометрію світу.
(function () {
  'use strict';
  const R = (globalThis.RealmMap = globalThis.RealmMap || {});
  const fill = (t, o) => t.replace(/\{(\w)\}/g, (m, k) => o[k] || '');

  function goods(world, s) {
    const g = world.grid, cnt = {}, B = R.Data.biomes;
    for (let i = 0; i < g.n; i++) { if (Math.abs(g.cx[i] - s.x) > 4 || Math.abs(g.cy[i] - s.y) > 4) continue; if (world.water[i] === 0) { const id = B[world.bio[i]].id; cnt[id] = (cnt[id] || 0) + 1; } if (world.river[i]) cnt.river = (cnt.river || 0) + 1; }
    const out = [];
    if ((cnt.grass || 0) + (cnt.steppe || 0) > 12) out.push('зерно');
    if ((cnt.forest || 0) + (cnt.taiga || 0) + (cnt.enchanted || 0) > 12) out.push('деревина');
    if ((cnt.hills || 0) > 8) out.push('вовна');
    if ((cnt.mountain || 0) + (cnt.peaks || 0) > 6) out.push('камінь');
    if ((cnt.river || 0) > 3) out.push('риба');
    if (s.port) out.push('морська торгівля');
    if (s.ore) out.push(s.oreName.toLowerCase());
    return out;
  }

  function describe(world, p) {
    const rnd = R.Rng.stream(p.seed, 'details'), H = R.Data.hooks, pick = a => R.Rng.pick(rnd, a);
    for (const s of world.settlements) {
      s.goods = goods(world, s);
      const o = { n: s.name, m: s.occupant ? s.occupant.name : '', r: s.oreName ? s.oreName.toLowerCase() : '' };
      if (s.state === 'normal' && s.rank === 'mine') s.hook = fill(pick(H.mine), o);
      else if (H[s.state]) s.hook = fill(pick(H[s.state]), o);
    }
    for (const l of world.lairs) l.hook = fill(pick(H[l.tier === 1 ? (l.kind === 'rest' ? 'rest1' : 'lair1') : 'lair' + l.tier]), { n: l.name.replace(/^[^:]+: /, ''), m: l.monster });
    for (const o of world.pois) {
      const key = o.type === 'bandit_camp' ? 'bandit' : (H[o.type] ? o.type : 'default');
      o.hook = fill(pick(H[key]), { n: o.name });
    }
  }

  // зведення для інтерфейсу й тестів
  function compute(world) {
    const st = { cells: world.grid.n, land: world.landCount, provinces: world.provinces.length, regions: world.regions.length, settlements: {}, states: {}, roads: {}, roadKm: {}, pois: world.pois.length, lairs: { tier1: 0, tier2: 0, tier3: 0, sea: 0 }, seaRoutes: world.seaRoutes.length, ports: 0, bridges: 0 };
    for (const s of world.settlements) { st.settlements[s.rank] = (st.settlements[s.rank] || 0) + 1; st.states[s.state] = (st.states[s.state] || 0) + 1; if (s.port) st.ports++; }
    for (const r of world.roads) { st.roads[r.cls] = (st.roads[r.cls] || 0) + 1; st.roadKm[r.cls] = Math.round(((st.roadKm[r.cls] || 0) + r.lenKm) * 10) / 10; st.bridges += r.bridges.length; }
    for (const l of world.lairs) { st['lairs'] ['tier' + l.tier]++; if (l.domain === 'sea') st.lairs.sea++; }
    return st;
  }
  R.Details = { describe, goods };
  R.Stats = { compute };
})();
