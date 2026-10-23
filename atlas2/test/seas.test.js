// Тести форми материка, островів, назв водойм і портів.
'use strict';
const assert = require('node:assert/strict'), A = require('../core/index.js');
// форма: материк не округлий (заповнення прямокутника не більше 0.6), островів багато й їх більше на більшій карті
const isl = {};
for (const size of ['small', 'large']) for (const seed of ['a', 'b', 'c', 'd']) {
  const p = A.Params.normalize({ seed, size }), T = A.terrain(p), lm = A.Grid.components(p.w, p.h, i => T.land[i] === 1); let best = 0; lm.sizes.forEach((s, k) => { if (s > lm.sizes[best]) best = k; });
  let x0 = 1e9, x1 = 0, y0 = 1e9, y1 = 0, n = 0; for (let i = 0; i < p.w * p.h; i++) if (lm.id[i] === best && T.land[i]) { const x = i % p.w, y = (i / p.w) | 0; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); n++; }
  assert.ok(n / ((x1 - x0 + 1) * (y1 - y0 + 1)) < 0.6, `${size}/${seed}: материк надто округлий`);
  (isl[size] = isl[size] || []).push(lm.sizes.filter(s => s >= 40).length - 1);
}
const avg = a => a.reduce((x, y) => x + y, 0) / a.length;
assert.ok(avg(isl.small) >= 8 && avg(isl.large) >= 30 && avg(isl.large) > avg(isl.small) * 1.8, `острови: ${JSON.stringify(isl)}`);

for (const [worldType, seed] of [['continent', 'a'], ['continent', 'zbyrai'], ['islands', 'k']]) {
  const t = `${worldType}/${seed}`, W = A.generate({ seed, worldType, size: 'small' }), N = W.w * W.h, wb = W.waterBodies, names = new Set();
  // кожне озеро має назву, моря й океани теж, цифр і дублів немає
  for (const l of W.lakes) assert.ok(wb[l.waterBody] && wb[l.waterBody].kind === 'lake' && wb[l.waterBody].name.startsWith('Озеро '), `${t}: озеро без назви`);
  for (const b of wb) { assert.ok(!/\d/.test(b.name), `${t}: цифри в назві`); assert.ok(!names.has(b.name), `${t}: дубль ${b.name}`); names.add(b.name); }
  const oceans = wb.filter(b => b.kind === 'ocean' && b.cells), seas = wb.filter(b => b.kind === 'sea' && b.cells);
  if (worldType === 'continent') { assert.ok(oceans.length >= 2 && oceans.length <= 5, `${t}: океанів ${oceans.length}`); assert.ok(seas.length >= 2, `${t}: морів ${seas.length}`); }
  for (const b of oceans) assert.ok(b.name.startsWith('Океан '));
  for (const b of seas) assert.ok(b.name.startsWith('Море '));
  // вода без назви — лише дрібні клаптики; суша без водойми
  let named = 0, ocean = 0; for (let i = 0; i < N; i++) { if (W.ocean[i]) { ocean++; if (W.waterBody[i] >= 0) named++; } if (!W.ocean[i] && !W.lake[i]) assert.equal(W.waterBody[i], -1); }
  assert.ok(named >= ocean * 0.97, `${t}: названо ${named} з ${ocean} клітин океану`);
  // порти: торкаються води, а маркер зсунуто до води на межу клітини
  const ports = W.settlements.filter(s => s.port); assert.ok(ports.length > 0, `${t}: портів нема`);
  for (const s of ports) {
    let wet = false; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const j = (s.y + dy) * W.w + s.x + dx; if (W.ocean[j] || (W.lake[j] && W.lakeOf[j] >= 0)) wet = true; }
    assert.ok(wet, `${t}: порт не біля води`); assert.ok(s.ox !== undefined && Math.max(Math.abs(s.ox), Math.abs(s.oy)) > 0.49 && Math.max(Math.abs(s.ox), Math.abs(s.oy)) < 0.51, `${t}: порт без зсуву до берега`);
  }
}
console.log('seas.test.js ok');
