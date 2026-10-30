// Безкінечний основний світ: блоки-материки з океанським краєм, зерно блока, рівні від центру світу, морські шляхи між сусідніми блоками, вивантаження.
'use strict';
const assert = require('node:assert/strict'), A = require('../core/index.js');

assert.equal(A.Blocks.blockSeed('s', 0, 0), 's', 'домашній блок має зерно світу без змін');
assert.notEqual(A.Blocks.blockSeed('s', 1, 0), A.Blocks.blockSeed('s', 0, 1));
assert.equal(A.Params.normalize({}).infinite, true);
assert.equal(A.Params.normalize({ dimension: 'astrakor' }).infinite, false, 'Астракор лишається одним материком');
assert.equal(A.Params.normalize({ infinite: false }).infinite, false);

(async () => {
  const P = { seed: 'inf', size: 'small' }, B = A.Blocks.create(P);
  const home = A.generate(P);
  B.request([[0, 0], [1, 0]]); await B.idle();
  const h = B.get(0, 0), e = B.get(1, 0); assert.ok(h && e, 'блоки створені');
  assert.equal(B.has(h.W), true);
  // домашній блок збігається зі звичайною картою того ж зерна (збережені карти не змінились)
  assert.deepEqual(Array.from(h.W.land), Array.from(home.land));
  assert.equal(h.W.settlements.length, home.settlements.length);
  // сусід — інший материк
  assert.notDeepEqual(Array.from(e.W.land), Array.from(home.land));
  const { w, h: hh } = e.W;
  // краї обох блоків — океан, тож межа між ними суцільна вода
  for (const blk of [h, e]) { for (let x = 0; x < w; x++) assert.ok(blk.W.ocean[x] && blk.W.ocean[(hh - 1) * w + x]); for (let y = 0; y < hh; y++) assert.ok(blk.W.ocean[y * w] && blk.W.ocean[y * w + w - 1]); }
  // рівні ростуть від центру світу, а не від центру блока
  assert.ok(e.W.level[(hh >> 1) * w] > home.level[(hh >> 1) * w + (w >> 1)] * 3, 'сусідній материк небезпечніший за центр світу');
  assert.equal(e.W.origin.x, w / 2 - w); assert.equal(e.W.origin.y, hh / 2);
  // морські шляхи між блоками: від порту до порту лише по воді, кінці стоять біля портів
  assert.ok(B.links.length >= 1, 'є морський шлях між материками');
  for (const l of B.links) {
    assert.equal(l.a, '0,0'); assert.equal(l.b, '1,0'); assert.ok(l.segs.length >= 1);
    for (const seg of l.segs) for (let i = 0; i < seg.length; i += 2) {
      const gx = Math.floor(seg[i]), gy = Math.floor(seg[i + 1]), blk = gx >= w ? e : h, lx = gx - blk.ox;
      assert.ok(blk.W.ocean[gy * w + lx], `клітина шляху (${gx},${gy}) не вода`);
    }
    const pa = h.W.settlements[l.from], pb = e.W.settlements[l.to]; assert.ok(pa.port && pb.port);
  }
  const n0 = B.links.length; B.request([[1, 0], [0, 0]]); await B.idle(); assert.equal(B.links.length, n0, 'шляхи не дублюються');
  // вивантаження: домашній блок лишається, найдальший іде
  B.request([[0, 1]]); await B.idle(); assert.equal(B.list().length, 3);
  const gone = B.evict(0, 0, 2, new Set()); assert.equal(gone.length, 1); assert.equal(B.get(0, 0) !== null, true);
  assert.equal(gone[0].W.blk, null);
  console.log('blocks.test.js ok');
})();
