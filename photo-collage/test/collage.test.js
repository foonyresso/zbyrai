// Тести логіки колажу. Запуск: node photo-collage/test/collage.test.js
const assert = require('node:assert');
const C = require('../collage-core.js');
let failed = 0;
const test = (n, f) => { try { f(); console.log('  ok  ', n); } catch (e) { failed++; console.log('  FAIL', n, '\n      ', e.message); } };
const overlap = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

test('кількість комірок = кількості фото, усі в межах полотна', () => {
  for (let n = 1; n <= 12; n++) {
    const cells = C.layout(n, 2000, 1500, 12, n * 7);
    assert.strictEqual(cells.length, n);
    for (const c of cells) assert.ok(c.w > 0 && c.h > 0 && c.x >= 0 && c.y >= 0 && c.x + c.w <= 2000 && c.y + c.h <= 1500, JSON.stringify(c));
  }
});
test('комірки не перекриваються', () => {
  for (let s = 1; s <= 30; s++) {
    const cells = C.layout(9, 1800, 1800, 10, s);
    for (let i = 0; i < cells.length; i++) for (let j = i + 1; j < cells.length; j++) assert.ok(!overlap(cells[i], cells[j]), 'перекриття, зерно ' + s);
  }
});
test('те саме зерно дає ту саму розкладку, інше — іншу', () => {
  assert.deepStrictEqual(C.layout(6, 2000, 1500, 8, 5), C.layout(6, 2000, 1500, 8, 5));
  assert.notDeepStrictEqual(C.layout(6, 2000, 1500, 8, 5), C.layout(6, 2000, 1500, 8, 6));
});
test('обрізання заповнює комірку без розтягування', () => {
  const r = C.coverCrop(1000, 500, 200, 200);
  assert.ok(Math.abs(r.sw / r.sh - 1) < 1e-9 && r.sw <= 1000 && r.sh <= 500 && r.sx >= 0 && r.sy >= 0);
});

const MODES = Object.keys(C.MODES);
test('усі режими: n комірок у межах полотна без перекриттів', () => {
  for (const m of MODES) for (let n = 1; n <= 14; n++) for (const [W, H] of [[2400, 1800], [1440, 2560], [2000, 2000]]) {
    const asp = Array.from({ length: n }, (_, i) => [1.5, 0.75, 1, 1.78][i % 4]);
    const cells = C.layout(n, W, H, 12, n * 3 + 1, m, asp);
    assert.strictEqual(cells.length, n, m + ' n=' + n);
    for (const c of cells) assert.ok(c && c.w > 0 && c.h > 0 && c.x >= 0 && c.y >= 0 && c.x + c.w <= W && c.y + c.h <= H, `${m} n=${n} ${JSON.stringify(c)}`);
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) assert.ok(!overlap(cells[i], cells[j]), `перекриття ${m} n=${n}`);
  }
});
test('режим без зерна однаковий; режими дають різні розкладки', () => {
  const a = C.layout(6, 2000, 1500, 8, 5, 'rows', [1, 1.5, 0.7, 1, 1.2, 0.9]);
  assert.deepStrictEqual(a, C.layout(6, 2000, 1500, 8, 5, 'rows', [1, 1.5, 0.7, 1, 1.2, 0.9]));
  assert.notDeepStrictEqual(a, C.layout(6, 2000, 1500, 8, 5, 'grid'));
});
test('rows підлаштовує ширину комірки під пропорцію фото', () => {
  const cells = C.layout(2, 2000, 1000, 0, 1, 'rows', [2, 1]);
  const wide = cells[0].w / cells[0].h, sq = cells[1].w / cells[1].h;
  assert.ok(wide > sq * 1.5, wide + ' vs ' + sq);
});
test('зум і зсув кадру: у межах картинки, зум зменшує ділянку', () => {
  const a = C.coverCrop(1000, 500, 200, 200), b = C.coverCrop(1000, 500, 200, 200, 2, 0, 1);
  assert.ok(Math.abs(b.sw - a.sw / 2) < 1e-6 && b.sx === 0 && Math.abs(b.sy + b.sh - 500) < 1e-6);
  const c = C.coverCrop(1000, 500, 200, 200, 1, 1, 0.5);
  assert.ok(Math.abs(c.sx + c.sw - 1000) < 1e-6);
});
test('інверсія фону: білий↔чорний, довільний колір інвертується, сірий дає контрастний', () => {
  assert.strictEqual(C.invertColor('#ffffff'), '#000000');
  assert.strictEqual(C.invertColor('#000000'), '#ffffff');
  assert.strictEqual(C.invertColor('#ff8000'), '#007fff');
  assert.ok(['#000000', '#ffffff'].includes(C.invertColor('#808080')));
  assert.strictEqual(C.invertColor('xx'), '#ffffff');
});
test('обмін місцями: рамки міняються, розкладка (набір рамок) лишається', () => {
  const a = { x: 1, y: 2, w: 3, h: 4, hx: 1, hy: 2, hw: 3, hh: 4 }, b = { x: 10, y: 20, w: 30, h: 40, hx: 10, hy: 20, hw: 30, hh: 40 };
  C.swapRects(a, b);
  assert.deepStrictEqual([a.x, a.y, a.w, a.h, a.hx, a.hw], [10, 20, 30, 40, 10, 30]);
  assert.deepStrictEqual([b.x, b.y, b.w, b.h, b.hy, b.hh], [1, 2, 3, 4, 2, 4]);
});
console.log(failed ? `\n${failed} не пройдено` : '\nУсі перевірки пройдено');
process.exit(failed ? 1 : 0);
