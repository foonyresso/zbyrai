// Тести математики Pattern Maker. Запуск: node pattern-maker/test/fold.test.js
// Без залежностей: лише вбудовані модулі Node.
const assert = require('node:assert/strict');
const C = require('../pattern-core.js');

const S3 = Math.sqrt(3), D2R = Math.PI / 180;
let seed = 12345;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296); // детермінований LCG
const range = (lo, hi) => lo + (hi - lo) * rnd();

const cases = [
  ['pmm', 1], ['pmm', .5], ['pmm', 1.7], ['p4m', 1], ['p6m', 1], ['p3m1', 1], ['tex', 1], ['tex', 1.6],
];
const mirror = cases.filter(([m]) => m !== 'tex');
const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);

let failed = 0, total = 0;
function test(name, fn) {
  total++;
  try { fn(); console.log('  ok   ' + name); }
  catch (e) { failed++; console.log('  FAIL ' + name + '\n       ' + String(e.message).split('\n').join('\n       ')); }
}

console.log('Pattern Maker: тести');

test('періодичність: fold(x+PW, y) = fold(x, y) = fold(x, y+PH) (до 1e-9), усі режими', () => {
  for (const [mode, a] of cases) {
    const g = C.geometry(mode, a);
    let worst = 0;
    for (let i = 0; i < 20000; i++) {
      const x = range(-9, 9), y = range(-9, 9), base = C.fold(mode, x, y, a);
      const kx = Math.floor(range(-3, 4)), ky = Math.floor(range(-3, 4));
      worst = Math.max(worst, dist(base, C.fold(mode, x + kx * g.PW, y, a)), dist(base, C.fold(mode, x, y + ky * g.PH, a)),
        dist(base, C.fold(mode, x + g.PW, y + g.PH, a)));
    }
    assert.ok(worst < 1e-9, `${mode} a=${a}: розбіжність ${worst}`);
  }
});

test('неперервність через краї: |fold(p+εd) − fold(p)| ≈ ε (перевіряє округлення гексів і кутову згортку)', () => {
  const eps = 1e-6;
  for (const [mode, a] of mirror) {
    let worst = 0;
    for (let i = 0; i < 40000; i++) {
      const x = range(-6, 6), y = range(-6, 6), t = range(0, 2 * Math.PI);
      worst = Math.max(worst, dist(C.fold(mode, x, y, a), C.fold(mode, x + eps * Math.cos(t), y + eps * Math.sin(t), a)));
    }
    assert.ok(worst < 3 * eps, `${mode} a=${a}: стрибок ${worst}`);
  }
});

test('неперервність точно на межах гексів (обидва боки ребра дають одну точку)', () => {
  const d = 1e-9;
  for (const mode of ['p6m', 'p3m1']) {
    let worst = 0;
    for (let i = 0; i < 6000; i++) {
      // випадковий центр решітки
      const q = Math.floor(range(-4, 5)), r = Math.floor(range(-4, 5));
      const cx = S3 * (q + r / 2), cy = 1.5 * r;
      const k = Math.floor(range(0, 6)), ang = k * 60 * D2R, t = range(-.5, .5);
      const nx = Math.cos(ang), ny = Math.sin(ang);           // нормаль до ребра
      const mx = cx + S3 / 2 * nx - t * ny, my = cy + S3 / 2 * ny + t * nx; // точка на ребрі
      worst = Math.max(worst, dist(C.fold(mode, mx - d * nx, my - d * ny), C.fold(mode, mx + d * nx, my + d * ny)));
    }
    assert.ok(worst < 1e-7, `${mode}: на межі гексів розбіжність ${worst}`);
  }
});

test('результат лежить у базовій області (прямокутник / трикутник)', () => {
  const tol = 1e-9;
  const inPoly = (poly, [x, y]) => {
    let sign = 0;
    for (let i = 0; i < poly.length; i++) {
      const [x1, y1] = poly[i], [x2, y2] = poly[(i + 1) % poly.length];
      const cr = (x2 - x1) * (y - y1) - (y2 - y1) * (x - x1);
      if (Math.abs(cr) < tol) continue;
      if (sign === 0) sign = Math.sign(cr); else if (Math.sign(cr) !== sign) return false;
    }
    return true;
  };
  for (const [mode, a] of mirror) {
    const g = C.geometry(mode, a);
    for (let i = 0; i < 20000; i++) {
      const p = C.fold(mode, range(-8, 8), range(-8, 8), a);
      assert.ok(inPoly(g.poly, p), `${mode} a=${a}: (${p}) поза областю`);
    }
  }
});

test('p6m: інваріантність відносно обертань на 60° та відбиття відносно кожного гекс-центра', () => {
  for (let i = 0; i < 5000; i++) {
    const q = Math.floor(range(-3, 4)), r = Math.floor(range(-3, 4)), cx = S3 * (q + r / 2), cy = 1.5 * r;
    const rho = range(0, .99) , th = range(0, 2 * Math.PI); // у межах гекса (R=1, apothem √3/2) беремо ρ ≤ .85
    const v = [Math.min(rho, .85) * Math.cos(th), Math.min(rho, .85) * Math.sin(th)];
    const base = C.fold('p6m', cx + v[0], cy + v[1]);
    for (let k = 1; k < 6; k++) {
      const a = k * 60 * D2R, rv = [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)];
      assert.ok(dist(base, C.fold('p6m', cx + rv[0], cy + rv[1])) < 1e-9, `поворот ${k * 60}°`);
    }
    assert.ok(dist(base, C.fold('p6m', cx + v[0], cy - v[1])) < 1e-9, 'відбиття (x,−y)');
  }
});

test('p3m1: інваріантність відносно 120° і дзеркала, але не 60° (це не p6m)', () => {
  let differs = 0;
  for (let i = 0; i < 3000; i++) {
    const q = Math.floor(range(-3, 4)), r = Math.floor(range(-3, 4)), cx = S3 * (q + r / 2), cy = 1.5 * r;
    const rho = range(.1, .85), th = range(0, 2 * Math.PI), v = [rho * Math.cos(th), rho * Math.sin(th)];
    const base = C.fold('p3m1', cx + v[0], cy + v[1]), rot = a => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)];
    for (const deg of [120, 240]) {
      const rv = rot(deg * D2R);
      assert.ok(dist(base, C.fold('p3m1', cx + rv[0], cy + rv[1])) < 1e-9, `поворот ${deg}°`);
    }
    assert.ok(dist(base, C.fold('p3m1', cx - v[0], cy + v[1])) < 1e-9, 'відбиття (−x,y) відносно осі 90°');
    const r60 = rot(60 * D2R);
    if (dist(base, C.fold('p3m1', cx + r60[0], cy + r60[1])) > 1e-6) differs++;
  }
  assert.ok(differs > 1000, 'повертання на 60° мало б давати іншу точку');
});

test('рефлексивна вибірка refl() завжди дає індекс у [0, n−1]', () => {
  for (const n of [1, 2, 5, 64]) for (let i = -300; i < 300; i++) {
    const j = C.refl(i, n);
    assert.ok(Number.isInteger(j) && j >= 0 && j < n, `n=${n} i=${i} → ${j}`);
  }
  assert.equal(C.refl(-1, 5), 1); assert.equal(C.refl(5, 5), 3);
});

test('розмір клітинки: гекс-режими мають CH = round(CW·√3), p4m квадратна', () => {
  assert.deepEqual(C.cellSize('p6m', 1, 512), [512, Math.round(512 * S3)]);
  assert.deepEqual(C.cellSize('p3m1', 1, 1024), [1024, Math.round(1024 * S3)]);
  assert.deepEqual(C.cellSize('p4m', 1, 300), [300, 300]);
  assert.deepEqual(C.cellSize('pmm', 2, 400), [400, 200]);
});

/* Наскрізна перевірка на справжніх пікселях: гладке недрібне «зображення» без власної періодичності.
   Різниця між сусідніми пікселями через шов клітинки (останній ↔ перший) має бути такою ж малою,
   як між будь-якими сусідами. Без дзеркал/змішування вона була б порядку сотні рівнів. */
function gradientImage(w, h) {
  const data = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    data[i] = 255 * x / (w - 1);
    data[i + 1] = 255 * y / (h - 1);
    data[i + 2] = 128 + 120 * Math.sin(x / 23) * Math.cos(y / 31);
    data[i + 3] = 255;
  }
  return { data, width: w, height: h };
}
function seamStats(cell) {
  const { data: d, width: W, height: H } = cell, px = (x, y, c) => d[(y * W + x) * 4 + c];
  let seam = 0, inner = 0;
  for (let y = 0; y < H; y++) for (let c = 0; c < 3; c++) {
    seam = Math.max(seam, Math.abs(px(W - 1, y, c) - px(0, y, c)));
    for (let x = 0; x < W - 1; x++) inner = Math.max(inner, Math.abs(px(x, y, c) - px(x + 1, y, c)));
  }
  for (let x = 0; x < W; x++) for (let c = 0; c < 3; c++) seam = Math.max(seam, Math.abs(px(x, H - 1, c) - px(x, 0, c)));
  return { seam, inner };
}

test('шви клітинки на пікселях: вона стикується сама з собою у всіх режимах, включно з безшовною текстурою', () => {
  const src = gradientImage(260, 200);
  for (const mode of ['pmm', 'p4m', 'p6m', 'p3m1', 'tex']) {
    const cell = C.renderCell(src, { mode, a: 1, cx: 130, cy: 100, s: 110, phi: .4, k: .5 }, 96);
    const { seam, inner } = seamStats(cell);
    // допуск: шов не гірший за трохи більше найбільшого внутрішнього кроку (там, де дзеркальна складка, крок може подвоїтись)
    assert.ok(seam <= Math.max(14, inner * 2.2), `${mode}: шов ${seam.toFixed(1)} при внутрішньому кроці ${inner.toFixed(1)}`);
  }
});

test('контрольний тест чутливості: проста обрізка без змішування мала б помітний шов', () => {
  const src = gradientImage(260, 200), CW = 96, g = C.geometry('tex', 1);
  // «наївна» клітинка: просто вирізаємо прямокутник w×h із зображення без дзеркал і змішування
  const d = new Uint8ClampedArray(CW * CW * 4), samp = C.makeSampler(src, false), o = [0, 0, 0, 0];
  for (let y = 0; y < CW; y++) for (let x = 0; x < CW; x++) {
    samp(40 + 110 * x / CW, 40 + 110 * y / CW, o);
    d.set([o[0], o[1], o[2], 255], (y * CW + x) * 4);
  }
  assert.ok(g.PW === 1);
  const { seam } = seamStats({ data: d, width: CW, height: CW });
  assert.ok(seam > 40, `наївна обрізка дала шов лише ${seam}: тест недостатньо чутливий`);
});

console.log(failed ? `\n${failed} з ${total} не пройшли` : `\nУсі ${total} тестів пройдено`);
process.exit(failed ? 1 : 0);
