// Поселення: центри регіонів (столиці й міста), містечка, села, хутори, шахти. Стани: живе / занепале / зруйноване / покинуте / захоплене монстрами.
(function () {
  'use strict';
  const R = (globalThis.RealmMap = globalThis.RealmMap || {});
  const GENERIC_OCCUPIERS = ['розбійники', 'нежить', 'банда мародерів', 'культисти'];

  const monGroup = b => (b.mon || null);
  // який вид монстрів тримає околиці комірки (за біомами в радіусі r)
  function surroundGroup(world, cell, r) {
    const g = world.grid, cnt = { mountain: 0, forest: 0 }, cx = g.cx[cell], cy = g.cy[cell];
    for (let i = 0; i < g.n; i++) {
      if (Math.abs(g.cx[i] - cx) > r || Math.abs(g.cy[i] - cy) > r) continue;
      const m = monGroup(R.Data.biomes[world.bio[i]]); if (m) cnt[m]++;
    }
    const best = cnt.mountain >= cnt.forest ? 'mountain' : 'forest';
    return cnt[best] >= 6 ? best : null;
  }
  function monsterFor(world, cell, rnd) {
    const grp = surroundGroup(world, cell, 4);
    return grp ? { group: grp, name: R.Rng.pick(rnd, R.Data[grp].monsters) } : { group: null, name: R.Rng.pick(rnd, GENERIC_OCCUPIERS) };
  }
  const seaAdjacent = (world, cell) => { const nb = new Int32Array(8), m = R.Grid.neighbors(world.grid, cell, true, nb); for (let k = 0; k < m; k++) if (world.water[nb[k]] === 1) return nb[k]; return -1; };

  function placeSettlements(world, p, namer) {
    const g = world.grid, rnd = R.Rng.stream(p.seed, 'settle'), S = [], ranks = R.Data.ranks;
    const dens = p.density, taken = [];
    const farFrom = (cell, d) => { for (const t of taken) if (R.Grid.dist(g, cell, t) < d) return false; return true; };
    function add(rank, cell, region) {
      const reg = world.regions[region], prov = world.provinces[reg.province], cult = prov.culture;
      const o = { id: S.length, rank, cell, x: g.cx[cell], y: g.cy[cell], region, province: reg.province, name: namer.place(cult), state: 'normal', port: false, dock: -1 };
      const pr = ranks[rank].pop; o.pop = Math.round(pr[0] + (pr[1] - pr[0]) * Math.pow(rnd(), 1.3));
      S.push(o); taken.push(cell); return o;
    }
    // 1. центри регіонів: у кожній провінції перший регіон — столиця
    world.provinces.forEach(pv => pv.regions.forEach((rid, j) => {
      const reg = world.regions[rid], s = add(j === 0 ? 'capital' : 'regional', reg.centerCell, rid);
      reg.center = s.id; if (j === 0) pv.capital = s.id;
    }));
    // 2. решта поселень по регіонах
    const cellsOf = world.regions.map(() => []);
    for (let i = 0; i < g.n; i++) if (world.region[i] >= 0) cellsOf[world.region[i]].push(i);
    const spec = [['town', 130, 7.5, 0.35], ['village', 60, 3.8, 0.25], ['hamlet', 130, 2.6, 0.2]];
    for (const reg of world.regions) {
      const cells = cellsOf[reg.id];
      for (const [rank, per, mind, minSuit] of spec) {
        let need = Math.round(cells.length / per * dens + (rank === 'town' && cells.length > 40 ? 0.6 : 0));
        if (!need) continue;
        const cand = cells.filter(c => world.suit[c] > minSuit).map(c => [c, world.suit[c] * (0.6 + rnd() * 0.8)]).sort((a, b) => b[1] - a[1] || a[0] - b[0]);
        for (const [c] of cand) { if (need <= 0) break; if (!farFrom(c, mind)) continue; add(rank, c, reg.id); need--; }
      }
    }
    // 3. стани не головних поселень
    const stateW = { town: [['normal', 78], ['fallen', 8], ['ruined', 5], ['abandoned', 4], ['occupied', 5]], village: [['normal', 70], ['fallen', 5], ['ruined', 8], ['abandoned', 10], ['occupied', 7]], hamlet: [['normal', 66], ['fallen', 4], ['ruined', 10], ['abandoned', 12], ['occupied', 8]] };
    for (const s of S) {
      if (!stateW[s.rank]) continue;
      s.state = R.Rng.weighted(rnd, stateW[s.rank]);
      if (s.state === 'fallen') s.pop = Math.round(s.pop * 0.35);
      if (s.state === 'ruined' || s.state === 'abandoned') s.pop = 0;
      if (s.state === 'occupied') { s.occupant = monsterFor(world, s.cell, rnd); s.pop = Math.round(s.pop * 0.1); }
    }
    // 4. порти: узбережжя з виходом у море
    for (const s of S) {
      const dock = seaAdjacent(world, s.cell);
      if (dock < 0 || s.state === 'ruined' || s.state === 'abandoned' || s.state === 'occupied') continue;
      const big = s.rank === 'capital' || s.rank === 'regional' || s.rank === 'town';
      if (big || (s.rank === 'village' && rnd() < 0.35)) { s.port = true; s.dock = dock; }
    }
    // 5. шахти: у пагорбах і горах поруч із заселеними краями
    const mineBiome = new Set([R.Data.B.HILLS, R.Data.B.MOUNTAIN, R.Data.B.PEAKS]);
    for (const reg of world.regions) {
      const cells = cellsOf[reg.id], mc = cells.filter(c => mineBiome.has(world.bio[c]));
      let need = Math.min(4, Math.round(mc.length / 70 * dens)); if (!need) continue;
      const cand = mc.map(c => [c, rnd()]).sort((a, b) => b[1] - a[1]);
      for (const [c] of cand) {
        if (need <= 0) break; if (!farFrom(c, 5)) continue;
        const bio = R.Data.biomes[world.bio[c]].id, ore = pickOre(rnd, bio);
        const m = add('mine', c, reg.id); m.ore = ore[0]; m.oreName = ore[1];
        m.name = 'Шахта ' + m.name;
        m.state = rnd() < 0.15 ? 'abandoned' : 'normal'; if (m.state === 'abandoned') m.pop = 0; need--;
      }
    }
    return S;
  }
  function pickOre(rnd, biome) {
    const where = biome === 'hills' ? ['any', 'hills'] : biome === 'mountain' ? ['any', 'mountain'] : ['any', 'mountain', 'peaks'];
    return R.Rng.weighted(rnd, R.Data.ores.filter(o => where.includes(o[3])).map(o => [o, o[2]]));
  }
  R.Settlements = { placeSettlements, monsterFor, surroundGroup, seaAdjacent };
})();
