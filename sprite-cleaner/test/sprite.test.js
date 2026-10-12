// Тести Sprite Sheet Cleaner. Запуск: node sprite-cleaner/test/sprite.test.js
const assert = require('node:assert/strict');
const S = require('../sprite-core.js');
let failed = 0, total = 0;
function test(name, fn) { total++; try { fn(); console.log('  ok   ' + name); } catch (e) { failed++; console.log('  FAIL ' + name + '\n       ' + String(e.message).split('\n').join('\n       ')); } }

const make = (w, h, bg) => { const d = new Uint8ClampedArray(w * h * 4); for (let i = 0; i < d.length; i += 4) { d[i] = bg[0]; d[i + 1] = bg[1]; d[i + 2] = bg[2]; d[i + 3] = 255; } return { data: d, width: w, height: h }; };
const rect = (img, x, y, w, h, c) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) { const p = (j * img.width + i) * 4; img.data[p] = c[0]; img.data[p + 1] = c[1]; img.data[p + 2] = c[2]; img.data[p + 3] = 255; } };
const alpha = (img, x, y) => img.data[(y * img.width + x) * 4 + 3];
const GREEN = [0, 255, 0];

console.log('Sprite Sheet Cleaner');

test('detectBg знаходить колір фону по периметру', () => {
  const img = make(20, 20, GREEN); rect(img, 5, 5, 8, 8, [200, 10, 10]);
  assert.deepEqual(S.detectBg(img), GREEN);
});

test('removeBg (flood): фон прозорий, однаковий колір усередині спрайта лишається', () => {
  const img = make(30, 30, GREEN); rect(img, 5, 5, 20, 20, [200, 0, 0]); rect(img, 12, 12, 5, 5, GREEN); // «дірка» зеленого всередині
  const o = S.removeBg(img, { color: GREEN, tol: 5, feather: 0, mode: 'flood' });
  assert.equal(alpha(o, 0, 0), 0); assert.equal(alpha(o, 10, 10), 255); assert.equal(alpha(o, 14, 14), 255);
  const g = S.removeBg(img, { color: GREEN, tol: 5, feather: 0, mode: 'global' });
  assert.equal(alpha(g, 14, 14), 0);
});

test('removeBg: допуск і м\'який край', () => {
  const img = make(10, 10, GREEN); rect(img, 4, 4, 2, 2, [0, 230, 0]); // близький до фону
  assert.equal(alpha(S.removeBg(img, { color: GREEN, tol: 1, feather: 0, mode: 'global' }), 4, 4), 255);
  assert.equal(alpha(S.removeBg(img, { color: GREEN, tol: 10, feather: 0, mode: 'global' }), 4, 4), 0);
  const a = alpha(S.removeBg(img, { color: GREEN, tol: 1, feather: 20, mode: 'global' }), 4, 4);
  assert.ok(a > 0 && a < 255, 'частково прозорий: ' + a);
});

test('removeColors: кілька кольорів фону, кожен зі своїм допуском (небо + пісок), фото-подібний сценарій', () => {
  const SKY = [120, 180, 240], SAND = [230, 210, 150], RED = [200, 20, 20];
  const img = make(40, 20, SKY); rect(img, 0, 10, 40, 10, SAND); rect(img, 15, 5, 10, 10, RED); // небо зверху, пісок знизу, предмет посередині
  const one = S.removeColors(img, { colors: [{ color: SKY, tol: 5 }], mode: 'flood' });
  assert.equal(alpha(one, 1, 1), 0); assert.equal(alpha(one, 1, 18), 255, 'пісок один колір не бере');
  const two = S.removeColors(img, { colors: [{ color: SKY, tol: 5 }, { color: SAND, tol: 5 }], mode: 'flood' });
  assert.equal(alpha(two, 1, 1), 0); assert.equal(alpha(two, 1, 18), 0); assert.equal(alpha(two, 20, 10), 255);
  // допуск у кожного власний: вузький для піску не зачіпає близький відтінок
  const near = make(10, 10, SKY); rect(near, 0, 5, 10, 5, [225, 205, 150]);
  assert.equal(alpha(S.removeColors(near, { colors: [{ color: SKY, tol: 5 }, { color: SAND, tol: 0 }], mode: 'global' }), 2, 8), 255);
  assert.equal(alpha(S.removeColors(near, { colors: [{ color: SKY, tol: 5 }, { color: SAND, tol: 5 }], mode: 'global' }), 2, 8), 0);
  assert.equal(alpha(S.removeColors(img, { colors: [], mode: 'flood' }), 1, 1), 255, 'порожній список нічого не прибирає');
});

test('removeColors (flood): колір фону всередині предмета, не з\'єднаний з краєм, лишається; global прибирає', () => {
  const img = make(30, 30, GREEN); rect(img, 5, 5, 20, 20, [200, 0, 0]); rect(img, 12, 12, 5, 5, [0, 0, 255]);
  const o = { colors: [{ color: GREEN, tol: 3 }, { color: [0, 0, 255], tol: 3 }], feather: 0 };
  assert.equal(alpha(S.removeColors(img, { ...o, mode: 'flood' }), 14, 14), 255);
  assert.equal(alpha(S.removeColors(img, { ...o, mode: 'global' }), 14, 14), 0);
});

test('removeColors: м\'який край береться мінімумом по кольорах', () => {
  const img = make(6, 6, GREEN); rect(img, 2, 2, 2, 2, [0, 230, 0]);
  const a = alpha(S.removeColors(img, { colors: [{ color: GREEN, tol: 1 }, { color: [255, 0, 255], tol: 1 }], feather: 20, mode: 'global' }), 2, 2);
  assert.ok(a > 0 && a < 255, 'частково прозорий: ' + a);
});

test('edgeColors знаходить кілька різних кольорів по краях і не повторює близькі', () => {
  const img = make(40, 20, [120, 180, 240]); rect(img, 0, 10, 40, 10, [230, 210, 150]); rect(img, 10, 4, 12, 12, [200, 20, 20]);
  const e = S.edgeColors(img, 3);
  assert.equal(e.length, 2);
  assert.deepEqual(e.map(x => x.color).sort((a, b) => a[0] - b[0]), [[120, 180, 240], [230, 210, 150]]);
  assert.ok(e[0].share > 0.4);
});

test('ручні правки: паличка (суміжна й глобальна), пензель, рамка, відновлення', () => {
  const img = make(20, 10, [10, 10, 10]); rect(img, 0, 0, 5, 10, [250, 250, 250]); rect(img, 15, 0, 5, 10, [250, 250, 250]);
  const em = new Uint8Array(200);
  assert.equal(S.wandMask(em, img, 2, 2, 5, true, 1), 50); // лише ліва смуга
  assert.equal(em[2 * 20 + 17], 0);
  const em2 = new Uint8Array(200); assert.equal(S.wandMask(em2, img, 2, 2, 5, false, 1), 100); // обидві смуги
  let o = S.applyEdits(img, img, em); assert.equal(alpha(o, 2, 2), 0); assert.equal(alpha(o, 17, 2), 255);
  const e3 = new Uint8Array(200); S.paintLine(e3, 20, 10, 2, 5, 17, 5, 1, 1);
  assert.ok([2, 8, 17].every(x => e3[5 * 20 + x] === 1), 'лінія без дірок'); assert.equal(e3[0], 0);
  const e4 = new Uint8Array(200); S.paintRect(e4, 20, 10, 18, 8, 25, 12, 1); // виходить за межі: обрізається
  assert.equal(e4[9 * 20 + 19], 1); assert.equal(e4[7 * 20 + 19], 0);
  // відновлення бере піксель з оригіналу
  const cleared = S.removeColors(img, { colors: [{ color: [10, 10, 10], tol: 2 }], mode: 'global' }); assert.equal(alpha(cleared, 10, 5), 0);
  const e5 = new Uint8Array(200); e5[5 * 20 + 10] = 2; const back = S.applyEdits(cleared, img, e5);
  assert.equal(alpha(back, 10, 5), 255); assert.deepEqual([...back.data.slice((5 * 20 + 10) * 4, (5 * 20 + 10) * 4 + 3)], [10, 10, 10]);
});

test('findSprites: знаходить окремі спрайти в порядку читання, зі щільними рамками', () => {
  const img = make(60, 40, GREEN); rect(img, 30, 2, 10, 10, [255, 0, 0]); rect(img, 4, 4, 8, 6, [0, 0, 255]); rect(img, 10, 25, 12, 12, [255, 255, 0]);
  const cl = S.removeBg(img, { color: GREEN, tol: 3, feather: 0, mode: 'flood' }), r = S.findSprites(cl);
  assert.equal(r.length, 3);
  assert.deepEqual(r.map(q => [q.x, q.y, q.w, q.h]), [[4, 4, 8, 6], [30, 2, 10, 10], [10, 25, 12, 12]]);
});

test('findSprites: gap зливає близькі частини, minArea відсікає пил', () => {
  const img = make(40, 20, GREEN); rect(img, 5, 5, 4, 4, [255, 0, 0]); rect(img, 12, 5, 4, 4, [255, 0, 0]); rect(img, 30, 15, 1, 1, [255, 0, 0]);
  const cl = S.removeBg(img, { color: GREEN, tol: 3, feather: 0, mode: 'flood' });
  assert.equal(S.findSprites(cl, {}).length, 3);
  assert.equal(S.findSprites(cl, { gap: 4 }).length, 2);
  const m = S.findSprites(cl, { gap: 4, minArea: 4 }); assert.equal(m.length, 1); assert.deepEqual([m[0].x, m[0].w], [5, 11]);
});

test('gridRects покриває зображення без щілин, навіть коли розмір не ділиться націло', () => {
  const r = S.gridRects(100, 50, 3, 2); assert.equal(r.length, 6);
  assert.equal(r[0].x, 0); assert.equal(r[2].x + r[2].w, 100); assert.equal(r[3].y, 25);
  assert.equal(r.slice(0, 3).reduce((s, q) => s + q.w, 0), 100);
});

test('trimRect і crop', () => {
  const img = { data: new Uint8ClampedArray(20 * 20 * 4), width: 20, height: 20 }; rect(img, 6, 7, 3, 2, [1, 2, 3]);
  const t = S.trimRect(img, { x: 0, y: 0, w: 20, h: 20 }); assert.deepEqual(t, { x: 6, y: 7, w: 3, h: 2 });
  assert.equal(S.trimRect(img, { x: 0, y: 0, w: 5, h: 5 }), null);
  const c = S.crop(img, t); assert.equal(c.width, 3); assert.deepEqual([...c.data.slice(0, 4)], [1, 2, 3, 255]);
});

test('quantize: не більше N кольорів, прозорі пікселі не чіпаються', () => {
  const img = make(16, 16, GREEN); for (let i = 0; i < 16 * 16; i++) { const p = i * 4; img.data[p] = (i * 7) % 256; img.data[p + 1] = (i * 13) % 256; img.data[p + 2] = (i * 29) % 256; }
  img.data[3] = 0;
  const q = S.quantize(img, 6), set = new Set();
  for (let i = 4; i < img.data.length; i += 4) set.add(q.img.data[i] + ',' + q.img.data[i + 1] + ',' + q.img.data[i + 2]);
  assert.ok(set.size <= 6 && set.size >= 2, 'кольорів ' + set.size); assert.equal(q.img.data[3], 0); assert.ok(q.palette.length <= 6);
});

test('packShelf: спрайти не перекриваються, вміщуються в атлас, pow2 дає степені двійки', () => {
  const sizes = Array.from({ length: 25 }, (_, i) => ({ w: 8 + (i * 5) % 23, h: 6 + (i * 7) % 19 }));
  for (const pow2 of [false, true]) {
    const { pos, W, H } = S.packShelf(sizes, { pad: 1, pow2 });
    if (pow2) { assert.equal(W & (W - 1), 0); assert.equal(H & (H - 1), 0); }
    sizes.forEach((a, i) => {
      assert.ok(pos[i].x + a.w <= W && pos[i].y + a.h <= H, 'у межах ' + i);
      for (let j = i + 1; j < sizes.length; j++) { const b = sizes[j]; assert.ok(pos[i].x + a.w + 1 <= pos[j].x || pos[j].x + b.w + 1 <= pos[i].x || pos[i].y + a.h + 1 <= pos[j].y || pos[j].y + b.h + 1 <= pos[i].y, `перекриття ${i}/${j}`); }
    });
  }
});

test('atlasJson: формат JSON Hash', () => {
  const j = S.atlasJson(['a', 'b'], [{ w: 4, h: 5 }, { w: 2, h: 2 }], [{ x: 0, y: 0 }, { x: 5, y: 0 }], 8, 8, 'atlas.png');
  assert.deepEqual(j.frames.b.frame, { x: 5, y: 0, w: 2, h: 2 }); assert.equal(j.meta.image, 'atlas.png'); assert.deepEqual(j.meta.size, { w: 8, h: 8 });
});

test('crc32 збігається з еталоном, zip має правильну структуру', () => {
  assert.equal(S.crc32(new TextEncoder().encode('123456789')), 0xcbf43926);
  const z = S.zip([{ name: 'a.txt', data: new TextEncoder().encode('hello') }, { name: 'b/c.bin', data: new Uint8Array([1, 2, 3]) }]);
  assert.deepEqual([...z.slice(0, 4)], [0x50, 0x4b, 3, 4]);
  const end = z.length - 22; assert.deepEqual([...z.slice(end, end + 4)], [0x50, 0x4b, 5, 6]);
  assert.equal(z[end + 10], 2); // записів у каталозі
  // перевірка системним unzip, якщо він є
  try {
    const fs = require('fs'), cp = require('child_process'), p = require('os').tmpdir() + '/sc-test-' + process.pid + '.zip';
    fs.writeFileSync(p, z); const out = cp.execSync('unzip -p "' + p + '" a.txt', { stdio: ['ignore', 'pipe', 'ignore'] }).toString(); fs.unlinkSync(p);
    assert.equal(out, 'hello');
  } catch (e) { if (e.name === 'AssertionError') throw e; }
});

console.log(failed ? `\nПровалено: ${failed} з ${total}` : `\nУсі ${total} тестів пройдено`);
process.exit(failed ? 1 : 0);
