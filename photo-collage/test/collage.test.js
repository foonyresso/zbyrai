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
console.log(failed ? `\n${failed} не пройдено` : '\nУсі перевірки пройдено');
process.exit(failed ? 1 : 0);
