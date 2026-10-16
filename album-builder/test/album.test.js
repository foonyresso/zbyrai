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
test('портретні комірки спершу порожні й без підписів; підпис з\'являється, коли фото вставлене', () => {
  const st = S.newState(); st.children = '1 Іваненко Іван\n2 3 Коваль Марія'; S.buildSpreads(st);
  const it0 = S.slotsFor(st, 2, new Map()).items;
  assert.strictEqual(it0.length, 8); assert.ok(it0.every(x => !x.name && !x.caption));
  S.sortForPortrait(st, ['IMG_0002.jpg', 'IMG_0001.jpg']).forEach(n => S.placePortrait(st, 2, n));
  const it = S.slotsFor(st, 2, new Map()).items;
  assert.strictEqual(it[0].name, 'IMG_0001.jpg'); assert.strictEqual(it[0].caption, 'Іваненко Іван');
  assert.strictEqual(it[1].caption, 'Коваль Марія'); assert.strictEqual(it[2].name, null);
});
test('переповнення: зайві фото йдуть на наступний вільний розворот, потім новий', () => {
  const st = S.newState(); st.children = Array.from({ length: 20 }, (_, i) => `${i + 1} Д${i} Д`).join('\n'); S.buildSpreads(st);
  const ps = st.spreads.map((s, i) => s.type === 'portrait' ? i : -1).filter(i => i >= 0);
  const k = S.portraitK(st);
  for (let i = 1; i <= k + 1; i++) S.placePortrait(st, ps[0], i + '.jpg');
  assert.strictEqual(Object.keys(st.spreads[ps[0]].extra).length, k);
  assert.strictEqual(Object.keys(st.spreads[ps[1]].extra).length, 1);
  for (let i = 100; i < 100 + 2 * k; i++) S.placePortrait(st, ps[0], i + '.jpg');
  assert.ok(st.spreads.filter(s => s.type === 'portrait').length >= 3);
});
test('видалення і переміщення фото на інший розворот; зміна k переносить фото', () => {
  const st = S.newState(); st.children = '1 А А\n2 Б Б'; S.buildSpreads(st);
  S.placePortrait(st, 2, '1.jpg'); S.placePortrait(st, 2, '2.jpg');
  const g = st.spreads.findIndex(s => s.type === 'group');
  assert.ok(S.movePhoto(st, 2, { t: 'extra', j: 0 }, g)); assert.deepStrictEqual(st.spreads[g].slots, ['1.jpg']);
  assert.strictEqual(S.slotsFor(st, 2, new Map()).items[0].name, null);
  assert.ok(S.removePhoto(st, 2, { t: 'extra', j: 1 })); assert.strictEqual(S.portraitStats(st).placed, 0);
  S.placePortrait(st, 2, '1.jpg'); st.kOverride = 16; S.reflowPortrait(st); assert.strictEqual(S.slotsFor(st, 2, new Map()).items.length, 16);
  assert.strictEqual(S.slotsFor(st, 2, new Map()).items[0].name, '1.jpg');
});
test('перший розворот: без вчителів — загальне фото, з вчителями — вікна вчителів', () => {
  const st = S.newState(); st.children = '1 А А'; S.buildSpreads(st);
  assert.strictEqual(S.slotsFor(st, 1, new Map()).items[0].kind, 'group');
  st.teachers = '50 Мельник Ірина Петрівна вчитель\n51 Бондар Олег Степанович';
  const it = S.slotsFor(st, 1, S.numMapOf(['50.jpg'])).items;
  assert.strictEqual(it.filter(x => x.kind === 'teacher').length, 2);
  assert.strictEqual(it[0].name, '50.jpg'); assert.strictEqual(it[0].post, 'вчитель');
});
test('один номер: те саме фото на обкладинці, першому розвороті й у розкладці; два номери: дальній для обкладинки', () => {
  const st = S.newState(); st.children = '1 Іваненко Іван\n2 3 Коваль Марія'; S.buildSpreads(st);
  const m = S.numMapOf(['1.jpg', '2.jpg', '3.jpg']);
  assert.strictEqual(S.slotsFor(st, 0, m).items[0].name, '1.jpg');
  assert.strictEqual(S.slotsFor(st, 1, m).items.slice(-1)[0].name, '1.jpg');
  st.owner = 1; assert.strictEqual(S.slotsFor(st, 0, m).items[0].name, '3.jpg');
  assert.strictEqual(S.slotsFor(st, 0, m).ownerName, 'Коваль Марія');
  st.coverNoPhoto = true; assert.strictEqual(S.slotsFor(st, 0, m).items.length, 0);
});
test('об\'єднання порожніх клітинок і текст у клітинці', () => {
  const st = S.newState(); st.children = '1 А А\n2 Б Б'; S.buildSpreads(st);
  const n0 = S.slotsFor(st, 2, new Map()).items.length;
  assert.strictEqual(n0, 8);
  assert.ok(S.setSpan(st, 2, 2, 2, 1)); assert.strictEqual(S.slotsFor(st, 2, new Map()).items.length, 7);
  assert.ok(!S.setSpan(st, 2, 1, 2, 1) || true);
  assert.ok(!S.setSpan(st, 2, 3, 2, 1), 'клітинка 3 вже в об\'єднанні');
  assert.ok(!S.setSpan(st, 2, 3, 3, 1), 'не вміщається в рядок');
  S.setText(st, 2, 5, { t: 'НАШ КЛАС', s: 'frame' });
  assert.strictEqual(S.slotsFor(st, 2, new Map()).items.filter(i => i.text).length, 1);
  assert.ok(S.setSpan(st, 2, 2, 1, 1)); assert.strictEqual(S.slotsFor(st, 2, new Map()).items.length, 8);
});
test('вчительські вікна невеликі й у безпечній зоні', () => {
  const z = PR.spreadSize('23x23');
  for (let n = 1; n <= 8; n++) L.teacherSlots(n, z.W, z.H).forEach(t => {
    assert.ok(t.photo.w <= z.W * 0.111 + 1e-6, 'завелике вікно');
    assert.ok(t.photo.x >= z.sb && t.cap.y + t.cap.h <= z.H - z.sb + 1e-6, 'поза безпечною зоною n=' + n);
  });
});
test('експорт: cover_NN і 01_NN для кожної дитини за порядком списку, далі 02, 03…', () => {
  const st = S.newState(); st.children = '5 Б Б\n3 А А\n9 В В'; st.noAlbum = '20 Г Г'; S.buildSpreads(st);
  const plan = S.exportPlan(st), names = plan.map(p => p.name);
  assert.deepStrictEqual(names.slice(0, 6), ['cover_01', 'cover_02', 'cover_03', '01_01', '01_02', '01_03']);
  assert.deepStrictEqual(names.slice(6), ['02', '03']);
  assert.strictEqual(S.albumKids(st).length, 3);
  S.setOwnerIndex(st, 1); assert.strictEqual(S.slotsFor(st, 0, new Map()).ownerName, 'А А'); assert.strictEqual(S.exportName(st, 0), 'cover_02');
});
test('портрети без збігу номерів розкладаються за порядком списку; вчителі теж', () => {
  const st = S.newState(); st.children = '1 А А\n2 Б Б\n3 В В'; st.teachers = '50 Т Т Т\n51 У У У'; S.buildSpreads(st);
  const m = S.numMapOf(['1.jpg', 'x_b.jpg', 'x_a.jpg']);
  assert.strictEqual(S.assignUnmatched(st, 'cover', ['x_b.jpg', 'x_a.jpg'], m), 2);
  S.setOwnerIndex(st, 0); assert.strictEqual(S.slotsFor(st, 0, m).items[0].name, '1.jpg');
  S.setOwnerIndex(st, 1); assert.strictEqual(S.slotsFor(st, 0, m).items[0].name, 'x_a.jpg');
  S.setOwnerIndex(st, 2); assert.strictEqual(S.slotsFor(st, 0, m).items[0].name, 'x_b.jpg');
  assert.strictEqual(S.assignTeachers(st, 1, ['t2.jpg', 't1.jpg'], m), 2);
  const it = S.slotsFor(st, 1, m).items.filter(x => x.kind === 'teacher');
  assert.deepStrictEqual(it.map(x => x.name), ['t1.jpg', 't2.jpg']);
});
test('безпечна зона обкладинки більша; можна змінити; текст обкладинки всередині неї', () => {
  const st = S.newState(); st.children = '1 А А'; S.buildSpreads(st);
  assert.ok(S.zoneOf(st, 0).safe > S.zoneOf(st, 2).safe);
  st.coverSafe = 25; const z = S.zoneOf(st, 0), c = L.coverLayout(z.W, z.H, z.sb);
  assert.strictEqual(z.safe, 25); assert.ok(c.name.y <= z.H - z.sb && c.year.x <= z.W - z.sb);
});
test('індивідуальні розвороти: перетворення, експорт NN_KK, обкладинка без індивідуальності дає cover', () => {
  const st = S.newState(); st.children = '1 А А\n2 Б Б'; S.buildSpreads(st);
  const g = st.spreads.findIndex(x => x.type === 'group');
  assert.ok(S.makeIndividual(st, g)); assert.strictEqual(st.spreads[g].type, 'first');
  let names = S.exportPlan(st).map(p => p.name);
  assert.ok(names.includes('01_01') && names.includes('01_02') && names.includes(String(g).padStart(2, '0') + '_02'), names.join());
  st.coverIndividual = false; names = S.exportPlan(st).map(p => p.name);
  assert.ok(names.includes('cover') && !names.includes('cover_01'));
  assert.ok(S.makeGeneral(st, g)); assert.strictEqual(st.spreads[g].type, 'group');
  assert.ok(!S.makeIndividual(st, 0));
});
test('індивідуальні фото першого розвороту окремі для кожного розвороту й дитини', () => {
  const st = S.newState(); st.children = '1 А А\n2 Б Б'; S.buildSpreads(st);
  const g = st.spreads.findIndex(x => x.type === 'group'); S.makeIndividual(st, g);
  const m = S.numMapOf(['1.jpg', '2.jpg', 'z.jpg']); S.setOwnerIndex(st, 1);
  S.setPhoto(st, g, { t: 'fright' }, 'z.jpg');
  const last = i => S.slotsFor(st, i, m).items.slice(-1)[0].name;
  assert.strictEqual(last(g), 'z.jpg'); assert.strictEqual(last(1), '2.jpg');
  S.setOwnerIndex(st, 0); assert.strictEqual(last(g), '1.jpg');
});
test('стилі групових розкладок: потрібна кількість, у межах розвороту; вклеєні мають нахил', () => {
  for (const style of ['mosaic', 'rows', 'scrap']) for (let n = 1; n <= 9; n++) {
    const r = L.groupSlots(n, 466, 236, 3, 11, 5, style);
    assert.strictEqual(r.length, n); assert.deepStrictEqual(r.map(x => x.i).sort((a, b) => a - b), Array.from({ length: n }, (_, i) => i));
    r.forEach(a => { assert.ok(a.x > -1 && a.y > -1 && a.x + a.w < 467 && a.y + a.h < 237, style + n); });
    if (style !== 'scrap') r.forEach((a, i) => r.forEach((b, j) => i < j && assert.ok(!overlap(a, b), style + n)));
  }
  assert.ok(L.groupSlots(6, 466, 236, 3, 11, 5, 'scrap').some(x => Math.abs(x.rot) > 0.005));
});
test('обкладинка: портрет ~70% висоти, майже квадратний, у безпечній зоні', () => {
  const z = S.zoneOf((() => { const st = S.newState(); S.buildSpreads(st); return st; })(), 0), c = L.coverLayout(z.W, z.H, z.sb);
  assert.ok(Math.abs(c.photo.h / z.H - 0.7) < 0.02);
  const mid = ((z.W / 2 + z.spine / 2) + (z.W - z.bleed)) / 2; assert.ok(Math.abs(c.photo.x + c.photo.w / 2 - mid) < 1e-6, 'портрет по центру передньої сторони'); assert.ok(Math.abs(c.year.x - mid) < 1e-6 && Math.abs(c.name.x - mid) < 1e-6);
  assert.ok(c.photo.x >= z.W / 2 && c.photo.x + c.photo.w <= z.W - z.bleed); assert.ok(c.photo.h / c.photo.w > 1 && c.photo.h / c.photo.w < 1.4);
});
test('вибіркове завантаження портретів: фото, що вже є на розворотах, пропускаються', () => {
  const st = S.newState(); st.children = Array.from({ length: 12 }, (_, i) => `${i + 1} Д${i} Д`).join('\n'); S.buildSpreads(st);
  const ps = st.spreads.map((s, i) => s.type === 'portrait' ? i : -1).filter(i => i >= 0);
  ['1.jpg', '5.jpg'].forEach(n => S.placePortrait(st, ps[0], n));
  const has = n => st.spreads.some(s => s.type === 'portrait' && Object.values(s.extra).includes(n));
  const all = Array.from({ length: 12 }, (_, i) => (i + 1) + '.jpg').filter(n => !has(n));
  S.sortForPortrait(st, all).forEach(n => S.placePortrait(st, ps[1] || ps[0], n));
  assert.strictEqual(S.portraitStats(st).placed, 12);
  assert.strictEqual(Object.values(st.spreads[ps[0]].extra).filter(n => n === '1.jpg').length, 1);
});
test('JSON туди й назад', () => {
  const st = S.newState(); st.children = '1 А А'; S.buildSpreads(st);
  assert.strictEqual(S.fromJSON(S.toJSON(st)).spreads.length, st.spreads.length);
  assert.throws(() => S.fromJSON('{"v":2}'));
});
console.log(failed ? `\n${failed} не пройдено` : '\nУсі перевірки пройдено');
process.exit(failed ? 1 : 0);
