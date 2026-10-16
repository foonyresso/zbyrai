// Тести логіки макетника. Запуск: node album-builder/test/album.test.js
const assert = require('node:assert');
const P = require('../core/parse.js'), L = require('../core/layout.js'), S = require('../core/state.js'), PR = require('../data/print-types.js');
let failed = 0;
const test = (n, f) => { try { f(); console.log('  ok  ', n); } catch (e) { failed++; console.log('  FAIL', n, '\n      ', e.message); } };
const overlap = (a, b) => a.x < b.x + b.w - 1e-6 && b.x < a.x + a.w - 1e-6 && a.y < b.y + b.h - 1e-6 && b.y < a.y + a.h - 1e-6;

test('рядок дитини: номери й ім\'я в будь-якому порядку', () => {
  assert.deepStrictEqual(P.parseChildren('12 13 Іваненко Іван')[0], { nums: ['12', '13'], name: 'Іваненко Іван' });
  assert.deepStrictEqual(P.parseChildren('Іван Іваненко, 7')[0], { nums: ['7'], name: 'Іван Іваненко' });
  assert.deepStrictEqual(P.parseChildren('Петренко-Коваль Ол\'га 007 - 008')[0], { nums: ['7', '8'], name: 'Петренко-Коваль Ол\'га' });
  assert.strictEqual(P.parseChildren('\n  \n').length, 0);
});
test('вчитель: три слова ПІБ, решта посада', () => {
  const t = P.parseTeachers('101 Мельник Ірина Петрівна вчитель математики\n102 103 Бондар Олег Степанович\n');
  assert.deepStrictEqual(t[0], { nums: ['101'], name: 'Мельник Ірина Петрівна', post: 'вчитель математики' });
  assert.deepStrictEqual(t[1], { nums: ['102', '103'], name: 'Бондар Олег Степанович', post: '' });
});
test('номер із назви файлу', () => {
  assert.deepStrictEqual(P.fileRuns('IMG_0123.jpg'), ['123']);
  assert.deepStrictEqual(P.fileRuns('5_12.png'), ['5', '12']);
});
test('автовибір розкладки: 16→8, 24→12, 20→12, 30→16, 8→8', () => {
  assert.strictEqual(L.autoK(16), 8); assert.strictEqual(L.autoK(24), 12); assert.strictEqual(L.autoK(20), 12);
  assert.strictEqual(L.autoK(30), 16); assert.strictEqual(L.autoK(8), 8); assert.strictEqual(L.autoK(0), 8);
});
test('сітка портретів: потрібна кількість вікон, без перекриття, в межах розвороту', () => {
  for (const k of L.KS) for (const f of ['23x23', '20x30', '20x30v']) {
    const z = PR.spreadSize(f), r = L.portraitSlots(k, z.W, z.H, 1.2);
    assert.strictEqual(r.length, k);
    r.forEach((a, i) => { assert.ok(a.x >= -1e-6 && a.x + a.w <= z.W + 1e-6 && a.y + a.h <= z.H + 1e-6); r.forEach((b, j) => i < j && assert.ok(!overlap(a, b))); });
  }
});
test('групові й вчительські вікна без перекриття', () => {
  for (let n = 1; n <= 9; n++) {
    const g = L.groupSlots(n, 466, 236, 3, 6, n);
    assert.strictEqual(g.length, n); g.forEach((a, i) => g.forEach((b, j) => i < j && assert.ok(!overlap(a, b))));
    const t = L.teacherSlots(n, 466, 236); assert.strictEqual(t.length, n);
    t.forEach((a, i) => { assert.ok(a.photo.w > 0 && a.photo.h > 0); t.forEach((b, j) => i < j && assert.ok(!overlap(a.photo, b.photo))); });
  }
});
test('побудова макета: обкладинка, перший, потім портрети й групові по черзі', () => {
  const st = S.newState(); st.children = Array.from({ length: 16 }, (_, i) => `${i + 1} Прізвище${i} Ім'я`).join('\n');
  S.buildSpreads(st);
  assert.deepStrictEqual(st.spreads.map(s => s.type), ['cover', 'first', 'portrait', 'group', 'portrait', 'group']);
  st.kOverride = 16; S.resizePortrait(st);
  assert.strictEqual(st.spreads.filter(s => s.type === 'portrait').length, 1);
  st.kOverride = 8; S.resizePortrait(st);
  assert.strictEqual(st.spreads.filter(s => s.type === 'portrait').length, 2);
});
test('фото за номером і підпис зі списку; лишні вікна порожні', () => {
  const st = S.newState(); st.children = '1 Іваненко Іван\n2 3 Коваль Марія'; S.buildSpreads(st);
  const m = S.numMapOf(['IMG_0001.jpg', '003.jpg']);
  const it = S.slotsFor(st, 2, m).items;
  assert.strictEqual(it.length, 8);
  assert.strictEqual(it[0].name, 'IMG_0001.jpg'); assert.strictEqual(it[0].caption, 'Іваненко Іван');
  assert.strictEqual(it[1].name, '003.jpg'); assert.strictEqual(it[1].caption, 'Коваль Марія');
  assert.strictEqual(it[2].kind, 'blank');
});
test('обмін портретів місцями міняє порядок людей', () => {
  const st = S.newState(); st.children = '1 А А\n2 Б Б'; S.buildSpreads(st);
  const m = new Map(), it = S.slotsFor(st, 2, m).items;
  S.swapRefs(st, 2, it[0].ref, it[1].ref);
  assert.strictEqual(S.slotsFor(st, 2, m).items[0].caption, 'Б Б');
});
test('перший розворот: без вчителів — загальне фото, з вчителями — вікна вчителів', () => {
  const st = S.newState(); st.children = '1 А А'; S.buildSpreads(st);
  assert.strictEqual(S.slotsFor(st, 1, new Map()).items[0].kind, 'group');
  st.teachers = '50 Мельник Ірина Петрівна вчитель\n51 Бондар Олег Степанович';
  const it = S.slotsFor(st, 1, S.numMapOf(['50.jpg'])).items;
  assert.strictEqual(it.filter(x => x.kind === 'teacher').length, 2);
  assert.strictEqual(it[0].name, '50.jpg'); assert.strictEqual(it[0].post, 'вчитель');
});
test('JSON туди й назад', () => {
  const st = S.newState(); st.children = '1 А А'; S.buildSpreads(st);
  assert.strictEqual(S.fromJSON(S.toJSON(st)).spreads.length, st.spreads.length);
  assert.throws(() => S.fromJSON('{"v":2}'));
});
console.log(failed ? `\n${failed} не пройдено` : '\nУсі перевірки пройдено');
process.exit(failed ? 1 : 0);
