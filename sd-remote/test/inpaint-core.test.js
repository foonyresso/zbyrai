// Тести перемалювання: node sd-remote/test/inpaint-core.test.js
const assert = require('node:assert');
const I = require('../inpaint-core.js');
let failed = 0;
const test = (n, f) => { try { f(); console.log('  ok  ', n); } catch (e) { failed++; console.log('  FAIL', n, '\n      ', e.message); } };
function img(w, h, rects) { const d = new Uint8ClampedArray(w * h * 4); rects.forEach(([x, y, rw, rh]) => { for (let j = y; j < y + rh; j++) for (let i = x; i < x + rw; i++) d[(j * w + i) * 4 + 3] = 255; }); return d; }
test('maskBBox: рамка зафарбованого, порожня маска → null', () => {
  assert.deepEqual(I.maskBBox(img(100, 80, [[10, 20, 30, 15], [60, 5, 5, 5]]), 100, 80), { x: 10, y: 5, w: 55, h: 30 });
  assert.equal(I.maskBBox(img(10, 10, []), 10, 10), null);
});
test('inpaintSize: 1024 для малої ділянки, 1344, 1536 для великої; пропорції зберігаються; кратно 64', () => {
  assert.deepEqual([I.inpaintSize({ w: 200, h: 200 }, 2000, 2000).w, I.inpaintSize({ w: 200, h: 200 }, 2000, 2000).h], [1024, 1024]);
  assert.equal(Math.max(I.inpaintSize({ w: 1100, h: 700 }, 3000, 3000).w, 0), 1344);
  const big = I.inpaintSize({ w: 1500, h: 1500 }, 3000, 3000); assert.deepEqual([big.w, big.h], [1536, 1536]);
  const tall = I.inpaintSize({ w: 300, h: 800 }, 2000, 2000); assert.ok(tall.h === 1024 && tall.w < tall.h && tall.w % 64 === 0 && tall.w >= 512, JSON.stringify(tall));
  const tall2 = I.inpaintSize({ w: 300, h: 900 }, 2000, 2000); assert.deepEqual([tall2.w, tall2.h], [576, 1344]);   // ділянка з відступами (1028 px) → 1344
  const wide = I.inpaintSize({ w: 800, h: 300 }, 2000, 2000); assert.ok(wide.w === 1024 && wide.h < wide.w && wide.h % 64 === 0);
  const clamp = I.inpaintSize({ w: 100, h: 100 }, 300, 300); assert.equal(clamp.padding, 64); assert.equal(clamp.region.w, 228);
});
test('toBinaryMask: біле/чорне без напівтонів', () => {
  const d = new Uint8ClampedArray([255, 0, 0, 200, 255, 0, 0, 40]); I.toBinaryMask(d); assert.deepEqual([...d], [255, 255, 255, 255, 0, 0, 0, 255]);
});
test('fitSize: довга сторона ≤ max, пропорції, малі не збільшуються', () => {
  assert.deepEqual(I.fitSize(5000, 2500, 2560), { w: 2560, h: 1280, scaled: true }); assert.deepEqual(I.fitSize(2000, 4000, 2560), { w: 1280, h: 2560, scaled: true });
  assert.deepEqual(I.fitSize(1000, 700, 2560), { w: 1000, h: 700, scaled: false }); assert.equal(I.fitSize(100000, 1, 2560).h, 1);
});
console.log(failed ? `\n${failed} не пройдено` : '\nУсі перевірки пройдено');
process.exit(failed ? 1 : 0);
