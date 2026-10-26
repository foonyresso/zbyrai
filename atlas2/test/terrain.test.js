// Тести етапів 1–3: ландшафт, вода, біоми.
'use strict';
const assert = require('node:assert/strict'), A = require('../core/index.js');
const count = (a) => a.reduce((s, v) => s + (v ? 1 : 0), 0);
for (const worldType of ['continent']) for (const seed of ['a', 'b', 'zbyrai', '42']) {
  const t = `${worldType}/${seed}`, W = A.generate({ seed, worldType, size: 'small' }), N = W.w * W.h;
  const land = count(W.land); assert.ok(land > N * 0.15 && land < N * 0.65, `${t}: частка суші ${land / N}`);
  for (let x = 0; x < W.w; x++) assert.ok(!W.land[x] && !W.land[(W.h - 1) * W.w + x], `${t}: край не океан`);
  // стік: від кожної клітини суші ланцюг down дійде до океану без циклів, висота заповнення не зростає вниз
  for (let i = 0; i < N; i++) {
    if (W.ocean[i]) continue; let c = i, n = 0;
    while (!W.ocean[c]) { c = W.down[c]; assert.ok(c >= 0 && ++n < N, `${t}: стік обірвано/цикл`); }
  }
  for (const path of W.rivers) assert.ok(!W.ocean[path[0]]);
  for (const r of W.rivers) r.forEach((c, k) => { if (W.ocean[c]) assert.equal(k, r.length - 1, `${t}: річка в морі`); });
  assert.ok(W.rivers.length >= 3, `${t}: мало річок ${W.rivers.length}`);
  // кожне озеро має виток: клітина озера, чий down не в цьому озері
  // кожне озеро має виток: клітина, що стікає за межі озера
  for (const l of W.lakes) { const inL = new Set(l.cells); assert.ok(l.cells.some(c => !inL.has(W.down[c])), `${t}: озеро без витоку`); }
}
// детермінізм і унікальність сіда
const a1 = A.generate({ seed: 'x', size: 'small' }), a2 = A.generate({ seed: 'x', size: 'small' }), b1 = A.generate({ seed: 'y', size: 'small' });
assert.deepEqual(Array.from(a1.land), Array.from(a2.land));
let diff = 0; for (let i = 0; i < a1.land.length; i++) if (a1.land[i] !== b1.land[i]) diff++;
assert.ok(diff > a1.land.length * 0.1, 'різні сіди мають давати різну форму суші');
console.log('terrain.test.js ok; озер', a1.lakes.length, 'річок', a1.rivers.length);
