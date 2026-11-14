// Розкладка материків: різні розміри й форми без рамок, щільне укладання без перекриттів, дотик сусідів, контур хмари збігається зі створеним материком.
'use strict';
const assert = require('node:assert/strict'), A = require('../core/index.js');

const P = A.Params.normalize({ seed: 'layout', size: 'medium' }), WIN = [-1800, -1300, 2600, 1900];
const L1 = A.Layout.create(P), L2 = A.Layout.create(P), LX = A.Layout.create(A.Params.normalize({ seed: 'other', size: 'medium' }));
for (const L of [L1, L2, LX]) { let g; do g = L.grow(...WIN, 2000); while (g.more); }
const ds1 = L1.descsIn(-1e5, -1e5, 1e5, 1e5), ds2 = L2.descsIn(-1e5, -1e5, 1e5, 1e5), key = ds => ds.map(d => [d.id, d.ox, d.oy, d.w, d.h, d.seed].join(','));
assert.ok(ds1.length >= 12, 'вікно заповнене материками: ' + ds1.length);
assert.deepEqual(key(ds1), key(ds2), 'те саме зерно дає ту саму розкладку');
assert.notDeepEqual(key(ds1), key(LX.descsIn(-1e5, -1e5, 1e5, 1e5)));
// ліниво й послідовно: менше вікно не змінює вже покладене
const L3 = A.Layout.create(P); L3.grow(-300, -300, 900, 800, 2000); const part = key(L3.descsIn(-1e5, -1e5, 1e5, 1e5)); assert.deepEqual(part, key(ds1).slice(0, part.length), 'порядок укладання не залежить від вікна');
// домашній у (0, 0), у своєму місці
const home = L1.home; assert.deepEqual([home.ox, home.oy, home.w, home.h], [0, 0, 800, 540]); assert.equal(L1.at(400, 270), home);
// суша кожного материка лежить у власній території, а не в чужій: жодних перекриттів
for (const d of ds1) {
  const o = d.outline, step = o.step; let n = 0; assert.ok(o.land.some(v => v), d.id + ': порожній контур');
  for (let y = 0; y < o.ch; y++) for (let x = 0; x < o.cw; x++) if (o.land[y * o.cw + x]) { n++; assert.equal(L1.at(d.ox + x * step, d.oy + y * step), d, d.id + ': суша в чужій території'); }
}
// різні розміри, форми й параметри; сусідство взаємне; материки торкаються (щільне укладання)
assert.ok(new Set(ds1.map(d => d.w + 'x' + d.h)).size >= 8, 'різні розміри');
const rest = ds1.filter(d => !d.home); assert.ok(new Set(rest.map(d => d.p.landFrac.toFixed(2))).size >= 8 && new Set(rest.map(d => d.p.provinces)).size >= 3, 'різні параметри');
for (const d of ds1) for (const id of d.nb) assert.ok(L1.get(id).nb.has(d.id), 'сусідство взаємне');
assert.ok(rest.every(d => d.nb.size >= 1), 'кожен материк торкається когось (без самотніх)');
assert.equal(L1.inCloud(rest[0], rest[0].ox + 1e6, 0), false);
// повне створення малого материка: чуже — вода, суша в межах контуру, острівців небагато
const small = rest.slice().sort((a, b) => a.w * a.h - b.w * b.h)[0], W = A.generate(L1.paramsOf(small)), o = small.outline;
assert.equal(W.w, small.w); assert.equal(W.h, small.h); assert.ok(W.ext, 'є чужа територія');
let land = 0, miss = 0; for (let i = 0; i < W.land.length; i++) { if (W.land[i]) land++; if (W.ext[i]) assert.ok(W.ocean[i] && !W.land[i], 'чужа територія завжди вода'); }
for (let y = 0; y < W.h; y++) for (let x = 0; x < W.w; x++) if (W.land[y * W.w + x]) { const cx = Math.round(x / o.step), cy = Math.round(y / o.step); let near = false; for (let dy = -2; dy <= 2 && !near; dy++) for (let dx = -2; dx <= 2; dx++) { const px = cx + dx, py = cy + dy; if (px >= 0 && py >= 0 && px < o.cw && py < o.ch && o.land[py * o.cw + px]) { near = true; break; } } if (!near) miss++; }
assert.ok(land > 500, 'материк має сушу'); assert.ok(miss < land * 0.12, `суша виходить за контур-хмару: ${miss} з ${land}`);
const comps = A.Grid.components(W.w, W.h, i => W.land[i] === 1); assert.ok(comps.sizes.length <= 12, 'острівців небагато: ' + comps.sizes.length);
console.log('layout.test.js ok; материків у вікні', ds1.length);
