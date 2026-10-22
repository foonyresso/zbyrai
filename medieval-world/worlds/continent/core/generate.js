// Конвеєр генерації світу: рельєф → вода → клімат → біоми → провінції/регіони → поселення → місця → лігва → дороги → морські шляхи.
// Усі стадії — чисті функції від зерна й параметрів; результат — звичайний об’єкт world (масиви й списки).
(function () {
  'use strict';
  const R = (globalThis.RealmMap = globalThis.RealmMap || {});
  const VERSION = 1;

  function generate(input) {
    const p = R.Params.normalize(input), size = R.Params.SIZES[p.size];
    const g = R.Grid.makeGrid(size.w, size.h, p.seed), nz = R.Noise.makeNoise(p.seed), namer = R.Names.makeNamer(p.seed);
    const world = { version: VERSION, params: p, grid: g };
    // рельєф і вода
    const ht = R.Terrain.genHeight(g, p, nz), sl = R.Terrain.seaLevel(ht, R.Terrain.WORLD_TYPES[p.worldType].land);
    world.height = ht; world.seaLevel = sl; world.water = R.Terrain.classifyWater(g, ht, sl);
    const clim = R.Climate.genClimate(g, ht, world.water, sl, p, nz);
    const rv = R.Rivers.buildRivers(g, ht, world.water, clim.moist, p);
    world.river = rv.river; world.flow = rv.flow; world.rivers = rv.rivers.map((r, i) => ({ id: i, cells: r.cells, flow: Math.round(r.flow) }));
    const ab = R.Climate.assignBiomes(g, world.water, clim, world.river, p, nz);
    world.bio = ab.bio; world.shore = ab.shore; world.temp = clim.temp; world.moist = clim.moist; world.el = clim.el;
    world.landCount = 0; for (let i = 0; i < g.n; i++) if (world.water[i] === 0) world.landCount++;
    world.suit = R.Suitability.suitability(g, world.bio, world.water, world.river, ht, p.seed);
    // політика
    const pol = R.Politics.buildPolitics(world, p);
    world.province = pol.province; world.region = pol.region; world.regions = pol.regions; world.provinces = pol.provinces; world.landComp = pol.landComp;
    const order = R.Rng.shuffle(R.Rng.stream(p.seed, 'cultures'), namer.cultures.map((c, i) => i));
    world.provinces.forEach((pv, k) => { pv.culture = order[k % order.length]; pv.cultureName = namer.cultures[pv.culture].name; pv.name = namer.province(pv.culture); });
    // поселення, місця, лігва
    world.settlements = R.Settlements.placeSettlements(world, p, namer);
    for (const reg of world.regions) { const c = world.settlements[reg.center]; reg.name = 'Регіон ' + c.name; reg.centerName = c.name; }
    { const pa = R.Contours.anchors(g, i => world.province[i], world.provinces.length), ra = R.Contours.anchors(g, i => world.region[i], world.regions.length); world.provinces.forEach((pv, k) => { pv.anchor = pa[k]; }); world.regions.forEach((r, k) => { r.anchor = ra[k]; }); }
    world.pois = R.Pois.placePois(world, p, namer, world.settlements);
    world.lairs = R.Lairs.placeLairs(world, p, namer, world.settlements);
    world.danger = R.Lairs.computeDanger(world, world.lairs, world.settlements);
    // дороги й морські шляхи
    world.roads = R.Roads.buildRoads(world, p, world.settlements, world.pois, world.lairs);
    world.seaRoutes = R.SeaRoutes.buildSeaRoutes(world, p, world.settlements, world.lairs);
    world.features = R.Features.buildFeatures(world, p, namer);
    R.Races.assign(world, p);
    R.Details.describe(world, p);
    world.stats = R.Stats.compute(world);
    return world;
  }
  R.generate = generate; R.VERSION = VERSION;
})();
