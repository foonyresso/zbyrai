// Розкладка тайлами: квадродерево різних розмірів, довільна форма в тайлі, власна територія материка, грубий контур збігається з тим, що створюється.
'use strict';
const assert = require('node:assert/strict'), A = require('../core/index.js');

const P = { seed: 'tiles', size: 'medium' }, T1 = A.Tiles.create(A.Params.normalize(P)), T2 = A.Tiles.create(A.Params.normalize(P)), TX = A.Tiles.create(A.Params.normalize({ seed: 'other', size: 'medium' }));
const WIN = [-900, -600, 1700, 1200], d1 = T1.descsIn(...WIN), d2 = T2.descsIn(...WIN);
// детермінованість: те саме зерно дає ті самі тайли незалежно від порядку запитів
assert.deepEqual(d1.map(d => [d.id, d.ox, d.oy, d.w, d.h, d.seed]), d2.map(d => [d.id, d.ox, d.oy, d.w, d.h, d.seed]));
assert.notDeepEqual(d1.map(d => d.id + d.ox + d.w), TX.descsIn(...WIN).map(d => d.id + d.ox + d.w));
// домашній материк займає свій тайл цілком, у (0, 0)
const home = T1.home; assert.deepEqual([home.ox, home.oy, home.w, home.h], [0, 0, 800, 540]); assert.equal(T1.at(10, 10), home);
// квадродерево: листки складають супертайл без щілин
for (let i = 0; i < 20; i++) { const r = A.Rng.rng(i), lv = A.Tiles.split(r, 0, 0, 800, 540); assert.equal(lv.reduce((a, l) => a + l.w * l.h, 0), 800 * 540); assert.ok(lv.every(l => l.w >= 150 && l.h >= 100)); }
// території материків не перекриваються; точка належить рівно одному (або жодному, якщо тайл порожній)
const rects = []; for (const d of d1) for (const q of d.rects) rects.push([q, d.id]);
for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) { const a = rects[i][0], b = rects[j][0]; assert.ok(a[2] <= b[0] || b[2] <= a[0] || a[3] <= b[1] || b[3] <= a[1], `території ${rects[i][1]} і ${rects[j][1]} перекриваються`); }
for (const d of d1) { const q = d.rects[0]; assert.equal(T1.at((q[0] + q[2]) / 2, (q[1] + q[3]) / 2), d); }
// різноманітність: різні розміри тайлів і параметри
assert.ok(new Set(d1.map(d => d.w + 'x' + d.h)).size >= 3, 'тайли різних розмірів');
const tiles = d1.filter(d => !d.home); assert.ok(new Set(tiles.map(d => d.p.landFrac.toFixed(2))).size >= 5 && new Set(tiles.map(d => d.p.provinces)).size >= 2, 'різні параметри');
// грубий контур: є суша, вона лежить у власній території й не торкається межі тайла впритул
for (const d of tiles.slice(0, 6)) {
  const o = d.outline; let n = 0; assert.ok(o.land.some(v => v), d.id + ': контур порожній');
  for (let y = 0; y < o.ch; y++) for (let x = 0; x < o.cw; x++) if (o.land[y * o.cw + x]) { n++; const gx = d.ox + x * o.step, gy = d.oy + y * o.step; assert.equal(T1.at(gx, gy), d, d.id + ': контур вийшов за власну територію'); }
}
assert.ok(T1.inCloud(tiles[0], tiles[0].ox + 1e6, 0) === false);
// повне створення малого тайла: суша лише у власній території, чуже — океан, контур збігається з сушею
const small = tiles.slice().sort((a, b) => a.w * a.h - b.w * b.h)[0], W = A.generate(T1.paramsOf(small)), o = small.outline;
assert.equal(W.w, small.w); assert.equal(W.h, small.h);
let land = 0, ocLand = 0, cloudMiss = 0;
for (let i = 0; i < W.land.length; i++) { if (W.land[i]) land++; if (W.ext && W.ext[i]) assert.ok(W.ocean[i] && !W.land[i], 'чужа територія завжди вода'); }
for (let y = 0; y < W.h; y++) for (let x = 0; x < W.w; x++) if (W.land[y * W.w + x]) { const cx = Math.floor(x / o.step), cy = Math.floor(y / o.step); let near = false; for (let dy = -2; dy <= 2 && !near; dy++) for (let dx = -2; dx <= 2; dx++) { const px = cx + dx, py = cy + dy; if (px >= 0 && py >= 0 && px < o.cw && py < o.ch && o.land[py * o.cw + px]) { near = true; break; } } if (!near) cloudMiss++; }
// берег не впирається в межу території: суша лишається за кілька клітин від чужої води (без обрізання по прямій)
{ let near = 0; const R = 6; for (let y = 0; y < W.h; y++) for (let x = 0; x < W.w; x++) if (W.land[y * W.w + x]) { let hit = x < R || y < R || x >= W.w - R || y >= W.h - R; for (let dy = -R; dy <= R && !hit; dy += 2) for (let dx = -R; dx <= R; dx += 2) { const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < W.w && yy < W.h && W.ext && W.ext[yy * W.w + xx]) { hit = true; break; } } if (hit) near++; } assert.equal(near, 0, 'суша біля межі території: ' + near); }
assert.ok(land > 500, 'материк має сушу'); assert.ok(cloudMiss < land * 0.1, `суша виходить за контур-хмару: ${cloudMiss} з ${land}`);
console.log('tiles.test.js ok');
