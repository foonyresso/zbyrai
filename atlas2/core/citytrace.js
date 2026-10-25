// Атлас 2.0: покадрова побудова міста для демонстрації «Як генерується карта». Збирає знімки стану між етапами A.Town.build (хук extra.trace); звичайну генерацію не чіпає.
(function () {
  'use strict';
  const A = globalThis.Atlas2;
  const cpSt = st => ({ kind: st.kind, look: st.look, hw: st.hw, pts: st.pts.slice(), br: st.br.slice() });
  const cpCirc = f => ({ t: f.t, x: f.x, y: f.y, r: f.r, kind: f.kind, name: f.name });
  // що копіювати на кожному етапі (далі генерація змінює масиви на місці, тому знімок — копія)
  const SNAP = {
    roads: o => ({ streets: o.streets.map(cpSt), runs: o.env.runs.map(r => ({ level: r.level, pts: r.pts.slice() })), c0: o.c0, R: o.R, Rmap: o.Rmap, waterKind: o.env.waterKind }),
    side: o => ({ streets: o.streets.map(cpSt) }),
    paths: o => ({ streets: o.streets.map(cpSt) }),
    districts: o => ({ anchors: o.anchors.map(a => Object.assign({}, a)), outerKind: o.outerKind, walled: o.walled }),
    features: o => ({ F: o.F.map(cpCirc) }),
    buildings: o => ({ B: o.B.map(b => ({ type: b.type, x: b.x, y: b.y, w: b.w, h: b.h, a: b.a })), F: o.F.map(cpCirc), piers: o.piers.map(p => Object.assign({}, p)) }),
    nature: o => ({ fields: (o.fields || []).map(f => ({ pts: f.pts.slice(), crop: f.crop })), trees: o.trees.map(t => [t.x, t.y, t.r]) }),
    wall: o => ({ wall: { on: o.wall.on, mat: o.wall.mat, w: o.wall.w, runs: o.wall.runs.map(r => r.slice()), towers: o.wall.towers.map(q => q.slice()), gates: o.wall.gates.map(g => Object.assign({}, g)) } })
  };
  // повертає { city, snaps }: snaps[id] — знімок після етапу id (ключі як у SNAP); city — готове місто (те саме, що дала б звичайна генерація)
  function run(W, s) {
    const snaps = {}, geom = A.draw && A.draw.prep ? A.draw.prep(W).geom : undefined;
    const city = A.Town.build(W, s, { geom, mask: A.TownMask ? E => A.TownMask.make(W, s, E) : undefined, trace: (id, o) => { if (SNAP[id]) snaps[id] = SNAP[id](o); } });
    return { city, snaps };
  }
  A.CityTrace = { run };
})();
