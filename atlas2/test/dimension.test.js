// Тести вимірів: «Астракор» (материк у космосі на коренях дерева) і біоми основного світу.
'use strict';
const assert = require('node:assert/strict'), A = require('../core/index.js');

// межі параметрів: Астракор має 50–100 провінцій і завжди материк, основний світ 2–50
assert.equal(A.Params.normalize({ dimension: 'astrakor', provinces: 10 }).provinces, 50);
assert.equal(A.Params.normalize({ dimension: 'astrakor', provinces: 500 }).provinces, 100);
assert.equal(A.Params.normalize({ dimension: 'astrakor' }).provinces, 64);
assert.equal(A.Params.normalize({ dimension: 'astrakor', worldType: 'islands' }).worldType, 'continent');
assert.equal(A.Params.normalize({ provinces: 500 }).provinces, 50);
assert.equal(A.Params.normalize({ dimension: 'nonsense' }).dimension, 'main');
const rt = A.Save.paramsFromJSON(A.Save.paramsToJSON(A.Params.normalize({ dimension: 'astrakor', seed: 'x' })));
assert.equal(rt.dimension, 'astrakor');

const count = a => a.reduce((s, v) => s + (v ? 1 : 0), 0), SPECIAL = ['tree', 'rootcoast', 'garden', 'deadcrown', 'starcave'];
for (const seed of ['zbyrai', '7']) {
  const t = `astrakor/${seed}`, W = A.generate({ seed, dimension: 'astrakor', size: 'small' }), N = W.w * W.h;
  // один материк, край карти порожнеча
  const lc = A.Grid.components(W.w, W.h, i => W.land[i] === 1); assert.equal(lc.sizes.length, 1, `${t}: суходолів ${lc.sizes.length}`);
  for (let x = 0; x < W.w; x++) assert.ok(W.ocean[x] && W.ocean[(W.h - 1) * W.w + x], `${t}: край не космос`);
  for (let y = 0; y < W.h; y++) assert.ok(W.ocean[y * W.w] && W.ocean[y * W.w + W.w - 1], `${t}: край не космос`);
  const land = count(W.land); assert.ok(land > N * 0.4 && land < N * 0.65, `${t}: частка суші ${land / N}`);
  // 50–100 провінцій, кожна клітина суші в провінції
  assert.ok(W.provinces.length >= 50 && W.provinces.length <= 100, `${t}: провінцій ${W.provinces.length}`);
  for (let i = 0; i < N; i++) if (W.land[i] && !W.lake[i]) assert.ok(W.province[i] >= 0, `${t}: клітина без провінції`);
  // без морів, портів на космосі й морських шляхів між ними; води лише озера
  assert.ok((W.waterBodies || []).every(b => b.kind === 'lake'), `${t}: є моря чи океани`);
  assert.ok(W.settlements.every(s => !s.port || s.body >= 0), `${t}: порт на краю в космос`);
  // у космосі ні небезпеки, ні локацій, ні доріг
  for (let i = 0; i < N; i++) if (W.ocean[i]) { assert.equal(W.tier[i], 0, `${t}: небезпека в космосі`); assert.equal(W.group[i], 255); }
  assert.ok(W.sites.every(s => !W.ocean[s.i]), `${t}: локація в космосі`);
  for (const r of W.roads) assert.ok(r.cells.every(c => !W.ocean[c]), `${t}: дорога в космосі`);
  // дерево в центрі, особливі біоми виміру, нульова точка в центрі
  const c = Math.floor(W.h / 2) * W.w + Math.floor(W.w / 2); assert.equal(A.BIOMES[W.bio[c]].id, 'tree', `${t}: у центрі не дерево`);
  const seen = new Set(); for (let i = 0; i < N; i++) if (W.land[i] && !W.lake[i]) seen.add(A.BIOMES[W.bio[i]].id);
  for (const b of ['tree', 'garden', 'rootcoast', 'deadcrown']) assert.ok(seen.has(b), `${t}: немає біома ${b}`);
  assert.ok(count(W.root) > 200, `${t}: корені`);
  // стік: від кожної клітини суші ланцюг дійде до космосу (річка падає з краю материка)
  for (let i = 0; i < N; i += 3) { if (W.ocean[i]) continue; let q = i, n = 0; while (!W.ocean[q]) { q = W.down[q]; assert.ok(q >= 0 && ++n < N, `${t}: стік обірвано`); } }
  assert.equal(W.sub.length, N); assert.equal(count(W.sub), 0, `${t}: плями основного світу в Астракорі`);
}

// біоми основного світу: плями з каталогу, жодного з виключних біомів виміру
const D = A.BiomeData; assert.ok(D.list.length > 150, `каталог біомів: ${D.list.length}`);
for (const id of ['root-coasts', 'garden-branches', 'dead-crown', 'star-caverns']) assert.ok(!D.list.some(b => b[0] === id), `виключний біом ${id} у каталозі основного світу`);
const M = A.generate({ seed: 'zbyrai', size: 'small' }), M2 = A.generate({ seed: 'zbyrai', size: 'small' });
assert.ok(M.subUsed.length >= 3, `плям біомів: ${M.subUsed.length}`);
for (let i = 0; i < M.sub.length; i++) if (M.sub[i]) assert.ok(M.land[i] && !M.lake[i], 'пляма поза сушею');
assert.deepEqual(Array.from(M.sub), Array.from(M2.sub), 'плями недетерміновані');
assert.ok(M.settlements.some(s => s.port && s.body === -1), 'в основному світі порти на морі зникли');
assert.ok(M.waterBodies.some(b => b.kind === 'ocean'), 'в основному світі зникли океани');
console.log('dimension.test.js ok; біомів у каталозі', D.list.length, 'плям на малій карті', M.subUsed.length);
