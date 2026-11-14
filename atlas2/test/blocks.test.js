// Менеджер материків безкінечного світу (вільна розкладка, core/layout.js): створення за кліком, шляхи між сусідніми материками, вивантаження, старі файли параметрів.
'use strict';
const assert = require('node:assert/strict'), A = require('../core/index.js');

assert.equal(A.Params.normalize({}).infinite, true);
assert.equal(A.Params.normalize({ dimension: 'astrakor' }).infinite, false, 'Астракор лишається одним материком');
assert.equal(A.Params.normalize({ infinite: false }).infinite, false);
// старі файли й посилання (з полем layout чи без нього) відкриваються: домашній материк той самий, решта лежить вільною розкладкою
assert.equal(A.Save.paramsFromJSON({ format: 'atlas2-params', version: 1, seed: 'x', layout: 1 }).seed, 'x');
assert.equal(A.Save.paramsFromJSON({ format: 'atlas2-params', version: 1, seed: 'x' }).layout, undefined);

(async () => {
  // ---- розкладка; створення за кліком, шляхи між сусідніми материками
  const T = A.Blocks.create({ seed: 'tl', size: 'small' }), hd = T.home;
  const hw = A.generate(T.paramsOf(hd)); assert.equal(hw.params.R, hd.R, 'домашній має запас території');
  T.add(hd, hw); T.grow(-1500, -1000, 1500, 1000, 5000);
  const nb = T.prov.near(hd).sort((a, b) => a.w * a.h - b.w * b.h)[0]; assert.ok(nb, 'у домашнього є сусід');
  T.open(nb.id); assert.equal(T.opening(), nb.id); await T.idle();
  const nw = T.get(nb.id); assert.ok(nw, 'сусід створений після відкриття');
  assert.equal(nw.W.w, nb.w); assert.equal(nw.W.h, nb.h);
  assert.ok(T.links.length >= 1, 'є морський шлях між сусідніми материками');
  for (const l of T.links) for (const seg of l.segs) for (let i = 0; i < seg.length; i += 2) {
    const gx = Math.floor(seg[i]), gy = Math.floor(seg[i + 1]); for (const blk of [T.get(hd.id), nw]) { const lx = gx - blk.ox, ly = gy - blk.oy; if (lx >= 0 && ly >= 0 && lx < blk.W.w && ly < blk.W.h) assert.ok(blk.W.ocean[ly * blk.W.w + lx], 'шлях лише по воді'); }
  }
  // вивантаження: домашній лишається, найдальший іде
  const far = T.descsIn(0, 800, 1, 801).filter(d => !d.home && d.id !== nb.id)[0] || T.descsIn(-3000, -3000, 3000, 3000).filter(d => !d.home && d.id !== nb.id)[0]; T.open(far.id); await T.idle(); assert.equal(T.list().length, 3);
  const gone = T.evict(0, 0, 2, new Set()); assert.equal(gone.length, 1); assert.ok(T.get(hd.id), 'домашній не вивантажується'); assert.equal(gone[0].W.blk, null);
  console.log('blocks.test.js ok');
})();
