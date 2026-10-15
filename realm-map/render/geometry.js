// Кеш векторної геометрії світу: згладжені берег, межі, річки, дороги в координатах комірок. Будується один раз на світ.
(function () {
  'use strict';
  const R = (globalThis.RealmMap = globalThis.RealmMap || {});

  function buildGeometry(world) {
    const g = world.grid, C = R.Contours, land = i => world.water[i] === 0;
    const geom = {};
    geom.coast = C.lines(g, (a, b) => land(a) !== land(b), 2);
    geom.provinceBorders = C.lines(g, (a, b) => land(a) && land(b) && world.province[a] !== world.province[b], 2);
    geom.regionBorders = C.lines(g, (a, b) => land(a) && land(b) && world.region[a] !== world.region[b] && world.province[a] === world.province[b], 2);
    geom.rivers = world.rivers.map(r => ({ pts: C.pathLine(g, r.cells, 2), flow: r.flow }));
    const sorted = ['trail', 'minor', 'medium', 'major'];
    geom.world = world;
    geom.roads = world.roads.map(r => ({ cls: r.cls, pts: C.pathLine(g, r.cells, 2), bridges: r.bridges, id: r.id }));
    geom.roadsByClass = {}; for (const c of sorted) geom.roadsByClass[c] = geom.roads.filter(r => r.cls === c);
    geom.sea = world.seaRoutes.map(r => {
      const a = world.settlements[r.from], b = world.settlements[r.to];
      const cells = r.cells; return { pts: C.pathLine(g, cells, 2), from: a, to: b, danger: r.danger, id: r.id };
    });
    return geom;
  }
  R.Geometry = { buildGeometry };
})();
