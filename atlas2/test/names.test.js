// Тести назв: унікальні в межах світу, без цифр, культури різні.
'use strict';
const assert = require('node:assert/strict'), A = require('../core/index.js');
for (const seed of ['a', 'zbyrai', 'k']) {
  const W = A.generate({ seed, size: 'small', provinces: 30 });
  const all = [...W.provinces.map(p => p.name), ...W.regions.map(g => g.name), ...W.settlements.map(s => s.name)];
  assert.equal(new Set(all).size, all.length, `${seed}: назви повторюються`);
  for (const n of all) assert.ok(!/\d/.test(n) && /^[А-ЯІЇЄҐ]/.test(n), `${seed}: дивна назва ${n}`);
  assert.ok(new Set(W.provinces.map(p => p.culture)).size >= 3, `${seed}: замало культур`);
}
// багато назв з одного потоку без повторів і цифр
const nm = A.Names.make('stress'); const seen = new Set();
for (let i = 0; i < 6000; i++) { const n = nm.town(nm.culture()); assert.ok(!seen.has(n) && !/\d/.test(n)); seen.add(n); }
console.log('names.test.js ok');
