// Безкінечний основний світ, стара рівна сітка (розкладка 1) і менеджер материків: зерно блока, рівні від центру світу, морські шляхи між сусідами, вивантаження.
'use strict';
const assert = require('node:assert/strict'), A = require('../core/index.js');

assert.equal(A.Blocks.blockSeed('s', 0, 0), 's', 'домашній блок має зерно світу без змін');
assert.notEqual(A.Blocks.blockSeed('s', 1, 0), A.Blocks.blockSeed('s', 0, 1));
assert.equal(A.Params.normalize({}).infinite, true);
assert.equal(A.Params.normalize({}).layout, 2, 'нові світи за замовчуванням тайлами');
assert.equal(A.Params.normalize({ layout: 1 }).layout, 1);
assert.equal(A.Params.normalize({ dimension: 'astrakor' }).infinite, false, 'Астракор лишається одним материком');
assert.equal(A.Params.normalize({ infinite: false }).infinite, false);
// старі посилання й файли (версія 1) не мали розкладки: відкриваються зі старою сіткою
assert.equal(A.Save.paramsFromJSON({ format: 'atlas2-params', version: 1, seed: 'x' }).layout, 1);
assert.equal(A.Save.paramsFromJSON(A.Save.paramsToJSON(A.Params.normalize({ seed: 'x' }))).layout, 2);

(async () => {
  // ---- розкладка 1: стара рівна сітка
  const P = { seed: 'inf', size: 'small', layout: 1 }, B = A.Blocks.create(P), home = A.generate(Object.assign({}, P));
  assert.equal(B.layout, 1);
  const d0 = B.home, d1 = B.prov.get('1,0') || B.descsIn(450, 0, 451, 1)[0];
  B.open(d0.id); B.open(d1.id); await B.idle();
  const h = B.get(d0.id), e = B.get(d1.id); assert.ok(h && e, 'материки створені');
  assert.equal(B.has(h.W), true);
  // домашній материк збігається зі звичайною картою того ж зерна (збережені карти не змінились)
  assert.deepEqual(Array.from(h.W.land), Array.from(home.land));
  assert.equal(h.W.settlements.length, home.settlements.length);
  assert.notDeepEqual(Array.from(e.W.land), Array.from(home.land));
  const { w, h: hh } = e.W;
  for (const blk of [h, e]) { for (let x = 0; x < w; x++) assert.ok(blk.W.ocean[x] && blk.W.ocean[(hh - 1) * w + x]); for (let y = 0; y < hh; y++) assert.ok(blk.W.ocean[y * w] && blk.W.ocean[y * w + w - 1]); }
  assert.ok(e.W.level[(hh >> 1) * w] > home.level[(hh >> 1) * w + (w >> 1)] * 3, 'сусідній материк небезпечніший за центр світу');
  assert.equal(e.W.origin.x, w / 2 - w); assert.equal(e.W.origin.y, hh / 2);
  assert.ok(B.links.length >= 1, 'є морський шлях між материками');
  for (const l of B.links) {
    assert.equal(l.a, '0,0'); assert.equal(l.b, '1,0'); assert.ok(l.segs.length >= 1);
    for (const seg of l.segs) for (let i = 0; i < seg.length; i += 2) {
      const gx = Math.floor(seg[i]), gy = Math.floor(seg[i + 1]), blk = gx >= w ? e : h, lx = gx - blk.ox;
      assert.ok(blk.W.ocean[gy * w + lx], `клітина шляху (${gx},${gy}) не вода`);
    }
    assert.ok(h.W.settlements[l.from].port && e.W.settlements[l.to].port);
  }
  const n0 = B.links.length; B.open(d0.id); B.open(d1.id); await B.idle(); assert.equal(B.links.length, n0, 'шляхи не дублюються');
  const d2 = B.descsIn(0, 300, 1, 301)[0]; B.open(d2.id); await B.idle(); assert.equal(B.list().length, 3);
  const gone = B.evict(0, 0, 2, new Set()); assert.equal(gone.length, 1); assert.equal(B.get(d0.id) !== null, true, 'домашній не вивантажується');
  assert.equal(gone[0].W.blk, null);

  // ---- розкладка 2: тайли; створення за кліком, шляхи між сусідніми материками
  const T = A.Blocks.create({ seed: 'tl', size: 'small' }), hd = T.home;
  assert.equal(T.layout, 2);
  const hw = A.generate(T.paramsOf(hd)); assert.deepEqual(Array.from(hw.land), Array.from(A.generate({ seed: 'tl', size: 'small' }).land), 'домашній материк той самий, що без тайлів');
  T.add(hd, hw);
  const nb = T.prov.near(hd).sort((a, b) => a.w * a.h - b.w * b.h)[0]; assert.ok(nb, 'у домашнього є сусід');
  T.open(nb.id); assert.equal(T.opening(), nb.id); await T.idle();
  const nw = T.get(nb.id); assert.ok(nw, 'сусід створений після відкриття');
  assert.equal(nw.W.w, nb.w); assert.equal(nw.W.h, nb.h);
  assert.ok(T.links.length >= 1, 'є морський шлях між материками-тайлами');
  for (const l of T.links) for (const seg of l.segs) for (let i = 0; i < seg.length; i += 2) {
    const gx = Math.floor(seg[i]), gy = Math.floor(seg[i + 1]); for (const blk of [T.get(hd.id), nw]) { const lx = gx - blk.ox, ly = gy - blk.oy; if (lx >= 0 && ly >= 0 && lx < blk.W.w && ly < blk.W.h) assert.ok(blk.W.ocean[ly * blk.W.w + lx], 'шлях лише по воді'); }
  }
  console.log('blocks.test.js ok');
})();
