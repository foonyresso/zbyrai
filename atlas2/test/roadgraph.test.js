// Тест зв'язності: окуповані поселення не розривають дороги між живими (порт і міста лишаються з'єднаними).
'use strict';
const assert = require('node:assert/strict'), A = require('../core/index.js');
let occ = 0;
for (const seed of ['a', 'b', 'zbyrai', '42', 'k', 'q']) {
  const W = A.generate({ seed, size: 'small' });
  occ += W.settlements.filter(s => s.fate === 'occupied').length;
  assert.deepEqual(A.RoadGraph.connected(W), [], `${seed}: окуповане поселення перекриває дорогу`);
}
assert.ok(occ > 0, 'жодного окупованого поселення: тест нічого не перевіряє');
console.log('roadgraph.test.js ok; окупованих', occ);
