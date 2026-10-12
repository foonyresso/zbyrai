// Тести ефектів Pattern Maker. Запуск: node pattern-maker/test/fx.test.js
// Без залежностей: лише вбудовані модулі Node.
const assert = require('node:assert/strict');
const F = require('../pattern-fx.js');

let failed = 0, total = 0;
function test(name, fn) {
  total++;
  try { fn(); console.log('  ok   ' + name); }
  catch (e) { failed++; console.log('  FAIL ' + name + '\n       ' + String(e.message).split('\n').join('\n       ')); }
}
let seed = 99;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const noise = (w, h) => { const d = new Uint8ClampedArray(w * h * 4); for (let i = 0; i < d.length; i++) d[i] = i % 4 === 3 ? 255 : Math.floor(rnd() * 256); return { data: d, width: w, height: h }; };
const fx = o => Object.assign({}, F.DEFAULT_FX, o);
const same = (a, b) => a.data.length === b.data.length && a.data.every((v, i) => v === b.data[i]);

console.log('Pattern Maker: ефекти');

test('значення за замовчуванням нічого не змінюють і не вмикають конвеєр', () => {
  assert.equal(F.active(F.DEFAULT_FX), false);
  const img = noise(37, 23);
  assert.ok(same(F.process(img, F.DEFAULT_FX), img));
});

test('піксель-арт: кожен блок B×B однокольоровий, розмір зображення зберігається', () => {
  const img = noise(50, 35), out = F.process(img, fx({ px: 8 }));
  assert.equal(out.width, 50); assert.equal(out.height, 35);
  for (let by = 0; by < 35; by += 8) for (let bx = 0; bx < 50; bx += 8) {
    const i0 = (by * 50 + bx) * 4;
    for (let y = by; y < Math.min(35, by + 8); y++) for (let x = bx; x < Math.min(50, bx + 8); x++) {
      const i = (y * 50 + x) * 4;
      assert.ok(out.data[i] === out.data[i0] && out.data[i + 1] === out.data[i0 + 1] && out.data[i + 2] === out.data[i0 + 2], `блок ${bx},${by}`);
    }
  }
});

test('піксель-арт усереднює колір блока (однорідне зображення лишається собою)', () => {
  const d = new Uint8ClampedArray(16 * 16 * 4); for (let i = 0; i < d.length; i += 4) { d[i] = 200; d[i + 1] = 100; d[i + 2] = 50; d[i + 3] = 255; }
  const out = F.process({ data: d, width: 16, height: 16 }, fx({ px: 5 }));
  assert.deepEqual([...out.data.slice(0, 4)], [200, 100, 50, 255]);
});

test('scale множить розмір пікселя (превʼю з devicePixelRatio = 2 дає блоки 2B)', () => {
  const img = noise(40, 40), a = F.process(img, fx({ px: 4 }), 2), b = F.process(img, fx({ px: 8 }), 1);
  assert.ok(same(a, b));
});

test('палітра: кожен піксель результату належить палітрі; дізерінг теж', () => {
  for (const key of Object.keys(F.PALETTES)) {
    for (const dith of [0, 100]) {
      const out = F.process(noise(40, 30), fx({ pal: key, dith }));
      const set = new Set(F.PALETTES[key].rgb.map(c => c.join(',')));
      for (let i = 0; i < out.data.length; i += 4) assert.ok(set.has([out.data[i], out.data[i + 1], out.data[i + 2]].join(',')), `${key}/${dith}: колір поза палітрою`);
    }
  }
});

test('палітра вибирає найближчий колір (чисто чорне → найтемніший, біле → найсвітліший)', () => {
  const img = { data: new Uint8ClampedArray([0, 0, 0, 255, 255, 255, 255, 255]), width: 2, height: 1 };
  const out = F.process(img, fx({ pal: 'gameboy' }));
  assert.deepEqual([...out.data.slice(0, 3)], [0x0f, 0x38, 0x0f]);
  assert.deepEqual([...out.data.slice(4, 7)], [0x9b, 0xbc, 0x0f]);
});

test('постеризація: не більше N різних значень на канал; дізерінг без палітри теж квантує', () => {
  for (const levels of [2, 3, 5, 8]) {
    const out = F.process(noise(40, 40), fx({ post: levels }));
    for (let ch = 0; ch < 3; ch++) assert.ok(new Set(Array.from({ length: 1600 }, (_, p) => out.data[p * 4 + ch])).size <= levels, `${levels} рівнів`);
  }
  const dithered = F.process(noise(40, 40), fx({ dith: 100 }));
  assert.ok(new Set(Array.from({ length: 1600 }, (_, p) => dithered.data[p * 4])).size <= 4);
});

test('дізерінг відрізняється від простої постеризації, але детермінований', () => {
  const img = noise(32, 32);
  const a = F.process(img, fx({ post: 3, dith: 100 })), b = F.process(img, fx({ post: 3, dith: 100 })), c = F.process(img, fx({ post: 3 }));
  assert.ok(same(a, b)); assert.ok(!same(a, c));
});

test('колір: відтінок 360° = тотожність, насиченість 0 = сірий, яскравість і контраст у межах, інверсія двічі = тотожність', () => {
  const img = noise(30, 30);
  const mid = { data: img.data.map((v, i) => (i % 4 === 3 ? 255 : 90 + (v % 76))), width: 30, height: 30 }; // середні яскравості: поворот не насичується
  const turned = F.process(mid, fx({ hue: 180 })), back = F.process(turned, fx({ hue: 180 }));
  for (let i = 0; i < mid.data.length; i++) assert.ok(Math.abs(back.data[i] - mid.data[i]) <= 3, 'поворот відтінку туди й назад');
  assert.ok(same(F.process(mid, fx({ hue: 360 })), mid) || F.process(mid, fx({ hue: 360 })).data.every((v, i) => Math.abs(v - mid.data[i]) <= 1), 'повний оберт');
  const grey = F.process(img, fx({ sat: 0 }));
  for (let i = 0; i < grey.data.length; i += 4) assert.ok(Math.abs(grey.data[i] - grey.data[i + 1]) <= 1 && Math.abs(grey.data[i + 1] - grey.data[i + 2]) <= 1);
  assert.ok(same(F.process(F.process(img, fx({ inv: true })), fx({ inv: true })), img));
  const bright = F.process(img, fx({ bri: 100 })); assert.ok(bright.data.every((v, i) => i % 4 === 3 || v === 255 || v > img.data[i]));
  assert.ok(F.process(img, fx({ bri: -100 })).data.every((v, i) => i % 4 === 3 || v <= img.data[i]));
});

test('хвиля: нульова амплітуда = тотожність; ненульова змінює зображення й не виходить за межі', () => {
  const img = noise(60, 40);
  assert.ok(same(F.process(img, fx({ wave: 0 })), img));
  const w = F.process(img, fx({ wave: 80, waveL: 30 }));
  assert.ok(!same(w, img)); assert.equal(w.data.length, img.data.length);
});

test('сканлінії темніють рядки, зерно додає шум, але альфа не змінюється', () => {
  const flat = { data: new Uint8ClampedArray(20 * 20 * 4).fill(128), width: 20, height: 20 };
  for (let i = 3; i < flat.data.length; i += 4) flat.data[i] = 255;
  const sc = F.process(flat, fx({ scan: 100 }));
  assert.ok(sc.data[0] < 128 && sc.data[(1 * 20) * 4] === 128, 'перший рядок темніший, другий ні');
  const gr = F.process(flat, fx({ grain: 50 }));
  assert.ok(new Set(Array.from({ length: 400 }, (_, p) => gr.data[p * 4])).size > 20);
  for (let i = 3; i < gr.data.length; i += 4) assert.equal(gr.data[i], 255);
  assert.ok(same(F.process(flat, fx({ grain: 50 })), gr), 'зерно детерміноване');
});

test('режим «лише колір» (для тайла) не чіпає геометрію: піксель-арт, хвиля, сканлінії, зерно ігноруються', () => {
  const img = noise(30, 30);
  assert.ok(same(F.process(img, fx({ px: 8, wave: 50, scan: 50, grain: 50 }), 1, true), img));
  assert.ok(!same(F.process(img, fx({ post: 3 }), 1, true), img));
});

test('розетка: N-кратна обертова симетрія (N=4: поворот на 90° збігається з собою)', () => {
  const src = noise(64, 64), W = 64, H = 64;
  const r = F.rosette(src, W, H, { n: 4, spin: 0, cx: 32, cy: 32, R: 28 });
  let worst = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const a = (y * W + x) * 4, b = (x * W + (W - 1 - y)) * 4; // поворот пікселя на 90° навколо центру
    for (let ch = 0; ch < 3; ch++) worst = Math.max(worst, Math.abs(r.data[a + ch] - r.data[b + ch]));
  }
  assert.ok(worst <= 3, 'розбіжність ' + worst);
});

test('розетка: дзеркальна симетрія відносно осі сектора й вихід у межах', () => {
  const src = noise(80, 60), W = 61, H = 61; // непарні розміри: центр у піксельному центрі
  const r = F.rosette(src, W, H, { n: 6, spin: 0, cx: 40, cy: 30, R: 25 });
  let worst = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const a = (y * W + x) * 4, b = ((H - 1 - y) * W + x) * 4; // відбиття відносно горизонтальної осі (spin=0)
    for (let ch = 0; ch < 3; ch++) worst = Math.max(worst, Math.abs(r.data[a + ch] - r.data[b + ch]));
  }
  assert.ok(worst <= 3, 'розбіжність ' + worst);
});

test('лінза/вир: центр і кути лишаються, нуль нічого не змінює, результат змінюється', () => {
  const img = noise(61, 61);
  assert.ok(same(F.lensWarp(img, 0, 0), img));
  const o = F.lensWarp(img, 80, 0), c = (30 * 61 + 30) * 4, k = 0;
  assert.deepEqual([...o.data.slice(c, c + 3)], [...img.data.slice(c, c + 3)]);
  assert.deepEqual([...o.data.slice(k, k + 3)], [...img.data.slice(k, k + 3)]);
  assert.ok(!same(F.lensWarp(img, 0, 120), img));
});

test('хроматична аберація: зелений канал на місці, червоний і синій зсунуті', () => {
  const img = noise(30, 10), o = F.chromatic(img, 3);
  for (let y = 0; y < 10; y++) for (let x = 3; x < 27; x++) {
    const i = (y * 30 + x) * 4;
    assert.equal(o.data[i + 1], img.data[i + 1]);
    assert.equal(o.data[i], img.data[(y * 30 + x - 3) * 4]);
    assert.equal(o.data[i + 2], img.data[(y * 30 + x + 3) * 4 + 2]);
  }
});

test('рельєф і контури: плоске зображення не змінюється, межа дає відгук', () => {
  const flat = { data: new Uint8ClampedArray(20 * 20 * 4).fill(128), width: 20, height: 20 };
  for (let i = 3; i < flat.data.length; i += 4) flat.data[i] = 255;
  assert.ok(same(F.relief(flat, 100, 100), flat));
  const e = { data: flat.data.slice(), width: 20, height: 20 };
  for (let y = 0; y < 20; y++) for (let x = 10; x < 20; x++) { const i = (y * 20 + x) * 4; e.data[i] = e.data[i + 1] = e.data[i + 2] = 220; }
  assert.ok(!same(F.relief(e, 0, 100), e));
});

test('градієнт-мапа: чорне й біле беруть крайні кольори градієнта', () => {
  const img = { data: new Uint8ClampedArray([0, 0, 0, 255, 255, 255, 255, 255]), width: 2, height: 1 }, g = F.GRADS.fire.rgb;
  F.gradientMap(img, 'fire');
  assert.deepEqual([...img.data.slice(0, 3)], g[0]);
  assert.deepEqual([...img.data.slice(4, 7)], g[g.length - 1]);
});

test('градієнт-мапа колірна: діє і на тайл, віньєтка й лінза — ні', () => {
  const img = noise(32, 32);
  assert.ok(F.hasColorOnly(fx({ gmap: 'ocean' })) && !F.hasColorOnly(fx({ vig: 50 })) && F.hasSpatial(fx({ lens: 20 })));
  assert.ok(!same(F.process(img, fx({ gmap: 'ocean' }), 1, true), img));
  assert.ok(same(F.process(img, fx({ vig: 50, lens: 40, ca: 4, relief: 50 }), 1, true), img));
});

test('віньєтка: центр не темнішає, кути темнішають', () => {
  const d = new Uint8ClampedArray(41 * 41 * 4).fill(200), img = { data: d, width: 41, height: 41 };
  F.vignette(img, 100);
  assert.equal(d[(20 * 41 + 20) * 4], 200);
  assert.ok(d[0] < 60);
});

test('шестикутна й ромбічна піксельна сітка: колір комірки однорідний, форма не квадратна', () => {
  const img = noise(60, 60);
  for (const kind of ['hex', 'dia']) {
    const out = F.process(img, fx({ px: 10, pgrid: kind })), seen = new Map();
    for (let y = 0; y < 60; y++) for (let x = 0; x < 60; x++) {
      const id = F.cellId(x + .5, y + .5, 10, kind).join(','), i = (y * 60 + x) * 4, v = out.data[i] + ',' + out.data[i + 1] + ',' + out.data[i + 2];
      if (seen.has(id)) assert.equal(v, seen.get(id), kind + ' ' + id); else seen.set(id, v);
    }
    assert.ok(seen.size > 6 && !same(out, F.process(img, fx({ px: 10 }))));
  }
});

console.log(failed ? `\nПровалено: ${failed} з ${total}` : `\nУсі ${total} тестів пройдено`);
process.exit(failed ? 1 : 0);
