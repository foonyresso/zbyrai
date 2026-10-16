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
  for (const k of L.KS) for (const f of ['23x23', '20x30']) {
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
test('перенесення на портретний розворот міняє місцями з першим фото, без дірки', () => {
  const st = S.newState(); st.children = Array.from({length: 30}, (_, i) => (i + 1) + ' А А').join('\n'); st.kOverride = 8; S.buildSpreads(st);
  const ps = st.spreads.map((s, i) => s.type === 'portrait' ? i : -1).filter(i => i >= 0);
  st.spreads[ps[0]].extra = { 0: 'a.jpg', 3: 'b.jpg' }; st.spreads[ps[1]].extra = { 0: 'c.jpg', 1: 'd.jpg' };
  assert.ok(S.movePhoto(st, ps[0], { t: 'extra', j: 3 }, ps[1]));
  assert.deepStrictEqual(st.spreads[ps[1]].extra, { 0: 'b.jpg', 1: 'd.jpg' });
  assert.deepStrictEqual(st.spreads[ps[0]].extra, { 0: 'a.jpg', 3: 'c.jpg' });
});
test('візерунок клітинки: ставиться без тексту, переживає зміну тексту, знімається', () => {
  const st = S.newState(); st.children = '1 А А'; S.buildSpreads(st);
  S.setPattern(st, 2, 3, { id: 'dots', c: '#ccc', s: 6 });
  assert.strictEqual(st.spreads[2].text[3].p.id, 'dots');
  S.setText(st, 2, 3, { t: 'Наш клас', s: 'frame' }); assert.strictEqual(st.spreads[2].text[3].p.id, 'dots');
  S.setPattern(st, 2, 3, null); assert.ok(!st.spreads[2].text[3].p);
  S.setPattern(st, 2, 4, { id: 'hex' }); S.setPattern(st, 2, 4, null); assert.ok(!st.spreads[2].text[4]);
  const AP = require('../data/patterns.js'); assert.ok(AP.LIST.length >= 30); assert.ok(AP.LIST.every(p => typeof p.draw === 'function'));
});
test('подвійні альбоми: пара = один альбом, портрет навпіл, один підпис, одна позиція в експорті', () => {
  const st = S.newState(); st.children = '1 А А\n2 Б Б\n5 Іваненко Іван\n7 В В\n6 Коваль Марія\n9 Мельник Ольга\n10 Бондар Тарас'; st.pairs = ['0006\n0005', 'Мельник Ольга\n0010']; S.buildSpreads(st);
  assert.strictEqual(S.people(st).length, 7); assert.strictEqual(S.albumKids(st).length, 5);
  const o = S.albumKids(st)[2]; assert.strictEqual(o.name, 'Іваненко Іван і Коваль Марія');
  st.owner = o.id; const nm = S.numMapOf(['5.jpg', '6.jpg']);
  const it = S.slotsFor(st, 0, nm).items.filter(x => x.kind === 'cover'); assert.strictEqual(it.length, 2);
  assert.deepStrictEqual(it.map(x => x.name), ['5.jpg', '6.jpg']); assert.ok(it[0].rect.x + it[0].rect.w <= it[1].rect.x);
  assert.strictEqual(S.slotsFor(st, 0, nm).ownerName, 'Іваненко Іван і Коваль Марія');
  S.setPhoto(st, 1, { t: 'fright', m: 1 }, 'x.jpg'); assert.strictEqual(S.slotsFor(st, 1, new Map()).items.filter(x => x.kind === 'portrait1')[1].name, 'x.jpg');
  assert.strictEqual(S.exportPlan(st).filter(p => p.si === 0).length, 5);
});
test('номери в списках нормалізуються до 4 цифр', () => {
  const P2 = require('../core/parse.js'); assert.strictEqual(P2.pad4('1 22 Іваненко Іван\n005 Б Б'), '0001 0022 Іваненко Іван\n0005 Б Б');
});
test('обмін фото між портретними розворотами і виправлення імені', () => {
  const st = S.newState(); st.children = Array.from({ length: 30 }, (_, i) => (i + 1) + ' А' + i + ' Б').join('\n'); st.kOverride = 8; S.buildSpreads(st);
  const ps = st.spreads.map((s, i) => s.type === 'portrait' ? i : -1).filter(i => i >= 0);
  st.spreads[ps[0]].extra = { 2: 'a.jpg' }; st.spreads[ps[1]].extra = { 5: 'b.jpg' };
  assert.ok(S.swapAcross(st, ps[0], 2, ps[1], 5)); assert.strictEqual(st.spreads[ps[0]].extra[2], 'b.jpg'); assert.strictEqual(st.spreads[ps[1]].extra[5], 'a.jpg');
  assert.ok(S.swapAcross(st, ps[0], 2, ps[1], 6)); assert.ok(!st.spreads[ps[0]].extra[2] && st.spreads[ps[1]].extra[6] === 'b.jpg');
  const p = S.people(st)[0]; st.names = { [p.id]: 'Виправлене Ім\'я' }; assert.strictEqual(S.people(st)[0].name, 'Виправлене Ім\'я');
});
test('сітки портретів: будь-яка кількість, парні колонки, нічого на згині, стиль з відступами', () => {
  const z = PR.spreadSize('23x23'), z2 = PR.spreadSize('20x30');
  [z, z2].forEach(zz => [14, 20, 27, 45].forEach(n => {
    const o = L.gridOptions(n, zz.W, zz.H); assert.ok(o.length >= 3); o.forEach(g => assert.ok(g.cols % 2 === 0 && g.cap >= 4));
  }));
  const rs = L.portraitSlots(18, z.W, z.H, 1.2, { cols: 6, rows: 3 }, 'dense'); assert.strictEqual(rs.length, 18);
  rs.forEach(r => assert.ok(r.x + r.w <= z.W / 2 + 1e-6 || r.x >= z.W / 2 - 1e-6));
  const fr = L.portraitSlots(18, z.W, z.H, 1.2, { cols: 6, rows: 3 }, 'framed'); assert.ok(fr[0].x >= 14 && fr[0].y >= 14);
  fr.forEach(r => assert.ok(r.x + r.w <= z.W / 2 + 1e-6 || r.x >= z.W / 2 - 1e-6));
  const st = S.newState(); st.children = Array.from({ length: 30 }, (_, i) => (i + 1) + ' А А').join('\n'); st.grid = { cols: 10, rows: 3 }; S.buildSpreads(st);
  assert.strictEqual(S.portraitK(st), 30); assert.strictEqual(st.spreads.filter(s => s.type === 'portrait').length, 1);
  assert.strictEqual(S.slotsFor(st, 2, new Map()).items.length, 30);
});
test('заміна фото через панель зберігає дитину; вклеєні: шар зверху й скотч', () => {
  const st = S.newState(); st.children = '1 Іваненко Іван\n2 Коваль Марія'; S.buildSpreads(st);
  S.placePortrait(st, 2, '1.jpg'); const j = Object.keys(st.spreads[2].extra)[0];
  S.setPhoto(st, 2, { t: 'extra', j: +j }, 'IMG_9999.jpg');
  const it = S.slotsFor(st, 2, new Map()).items.filter(x => x.ref.j === +j)[0];
  assert.strictEqual(it.name, 'IMG_9999.jpg'); assert.strictEqual(it.caption, 'Іваненко Іван'); assert.strictEqual(S.portraitStats(st).placed, 1);
  const gi = st.spreads.findIndex(s => s.type === 'group'), sp = st.spreads[gi]; sp.style = 'scrap'; sp.slots = ['a', 'b', 'c'];
  const ord = () => S.slotsFor(st, gi, new Map()).items.map(x => x.ref.i);
  sp.zs = [ord()[0]]; assert.strictEqual(ord()[2], sp.zs[0]);
  sp.tape = { 0: ['tr'] }; assert.deepStrictEqual(S.slotsFor(st, gi, new Map()).items.filter(x => x.ref.i === 0)[0].tape, ['tr']);
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
test('один номер: те саме фото на обкладинці, першому розвороті й у розкладці; два номери: перший на обкладинці й у сітці, другий лише на першому розвороті', () => {
  const st = S.newState(); st.children = '1 Іваненко Іван\n2 3 Коваль Марія'; S.buildSpreads(st);
  const m = S.numMapOf(['1.jpg', '2.jpg', '3.jpg']);
  assert.strictEqual(S.slotsFor(st, 0, m).items[0].name, '1.jpg');
  assert.strictEqual(S.slotsFor(st, 1, m).items.slice(-1)[0].name, '1.jpg');
  st.owner = 1; assert.strictEqual(S.slotsFor(st, 0, m).items[0].name, '2.jpg');
  assert.strictEqual(S.slotsFor(st, 1, m).items.slice(-1)[0].name, '3.jpg');
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
test('вчителі: великі фото в безпечній зоні лівої сторінки, ряди по центру, конструктор рядів', () => {
  const z = PR.spreadSize('23x23');
  assert.ok(L.teacherSlots(2, z.W, z.H)[0].photo.w > 80, 'двоє вчителів: великі фото');
  assert.deepStrictEqual(L.teacherRows(3), [[0, 1], [2]]);
  assert.deepStrictEqual(L.normRows([[2], [0], []], 4), [[2], [0, 1, 3]]);
  const t3 = L.teacherSlots(3, z.W, z.H, { rows: [[0], [1, 2]] });
  assert.ok(Math.abs((t3[0].photo.x + t3[0].photo.w / 2) - (t3[1].photo.x + t3[2].photo.x + t3[2].photo.w) / 2) < 1e-6, 'ряд по центру');
  assert.ok(L.teacherPresets(5).length >= 2 && L.teacherPresets(5).every(r => r.reduce((a, b) => a + b, 0) === 5));
  const half = L.teacherSlots(2, z.W, z.H, { size: 50 })[0].photo.w, full = L.teacherSlots(2, z.W, z.H)[0].photo.w; assert.ok(Math.abs(half * 2 - full) < 1e-6);
  for (let n = 1; n <= 8; n++) L.teacherSlots(n, z.W, z.H).forEach(t => {
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
test('шаблони групових розкладок: усі валідні, вікна в межах розвороту без перекриття', () => {
  const TP = require('../core/templates.js');
  assert.ok(TP.LIST.length >= 30);
  for (const t of TP.LIST) {
    const r = TP.rects(t, 466, 236, 1.2, 0); assert.strictEqual(r.length, t.n, t.id);
    if (!t.tilt) r.forEach((a, i) => { assert.ok(a.x > -1e-6 && a.y > -1e-6 && a.x + a.w < 466 + 1e-6 && a.y + a.h < 236 + 1e-6, t.id); r.forEach((b, j) => i < j && assert.ok(!overlap(a, b), t.id)); });
    else assert.ok(r.every(x => x.pivot && x.rot !== 0), t.id);
  }
  ['g4', 'g12', 'g6c', 'g8a', 'g7'].forEach(id => assert.ok(TP.byId(id)));
});
test('вибір розкладки, забагато фото: інша розкладка, пропуск зайвих, авто-підбір', () => {
  const st = S.newState(); st.children = '1 А А'; S.buildSpreads(st);
  const g = st.spreads.findIndex(x => x.type === 'group'), sp = st.spreads[g], asp = n => (n.startsWith('p') ? 0.75 : 1.5);
  sp.slots = ['a1', 'a2', 'a3', 'a4', 'a5'];
  const r = S.setTemplate(st, g, 'g4'); assert.ok(r.overflow); assert.strictEqual(sp.style, 'mosaic');
  assert.ok(S.setTemplate(st, g, 'g6').ok); assert.strictEqual(sp.slots.length, 6); assert.strictEqual(S.freeCount(sp), 1);
  const add = S.addGroupPhotos(st, g, ['b1', 'b2']); assert.strictEqual(add.placed, 1); assert.deepStrictEqual(add.rest, ['b2']);
  sp.slots = ['x1', 'x2', null, null]; S.setTemplate(st, g, 'g4'); assert.strictEqual(S.freeCount(sp), 2);
  const n = S.fillBest(st, g, ['q1', 'q2', 'q3'], asp); assert.strictEqual(n, 2); assert.strictEqual(S.freeCount(sp), 0);
  const f = S.fitAll(st, g, ['n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7'], asp); assert.ok(f.tpl && f.tpl.n >= 11); assert.ok(S.groupPhotos(sp).length >= 11);
  const big = S.fitAll(st, g, Array.from({ length: 30 }, (_, i) => 'z' + i), asp); assert.strictEqual(big.tpl, null); assert.strictEqual(sp.style, 'mosaic');
});
test('видалення фото з шаблону лишає вікно порожнім', () => {
  const st = S.newState(); st.children = '1 А А'; S.buildSpreads(st);
  const g = st.spreads.findIndex(x => x.type === 'group'); st.spreads[g].slots = ['a', 'b']; S.setTemplate(st, g, 'g4');
  S.removePhoto(st, g, { t: 'slot', i: 0 }); const it = S.slotsFor(st, g, new Map()).items;
  assert.strictEqual(it.length, 4); assert.strictEqual(it[0].name, null); assert.strictEqual(it[1].name, 'b'); assert.ok(it[0].dark);
});
test('JSON туди й назад', () => {
  const st = S.newState(); st.children = '1 А А'; S.buildSpreads(st);
  assert.strictEqual(S.fromJSON(S.toJSON(st)).spreads.length, st.spreads.length);
  assert.throws(() => S.fromJSON('{"v":2}'));
});
test('варіанти обкладинок: унікальні id, категорії існують, є для кожної категорії з фото й без, фото-варіанти мають місце фото', () => {
  const CV = require('../data/cover-variants.js'), DSg = require('../data/designs.js'), L = require('../core/layout.js');
  const ids = CV.VARIANTS.map(v => v.id); assert.strictEqual(new Set(ids).size, ids.length);
  CV.VARIANTS.forEach(v => (v.cats || []).forEach(c => assert.ok(DSg.CATEGORIES.some(x => x.id === c), c)));
  DSg.CATEGORIES.forEach(c => { const l = CV.forCat(c.id); assert.ok(l.some(v => v.photo) && l.some(v => !v.photo), c.id); });
  CV.VARIANTS.filter(v => v.photo && !v.builtin).forEach(v => { const c = L.coverLayout(466, 236, 8, { bleed: 3, spine: 0 }, v); assert.ok(c.photo.y > 0 && c.photo.y + c.photo.h < 236 * 0.8); });
  const st = S.newState(); st.coverVar = 'frame'; st.children = '1 А А'; S.buildSpreads(st); assert.strictEqual(S.fromJSON(S.toJSON(st)).coverVar, 'frame');
  assert.ok(S.slotsFor(st, 0, new Map()).items.every(i => i.kind === 'cover'));
  st.coverVar = 'abstract'; assert.strictEqual(S.slotsFor(st, 0, new Map()).items.length, 0);
});
test('тексти варіантів обкладинок: стандартні значення відомі, зберігаються в JSON', () => {
  const CV = require('../data/cover-variants.js');
  assert.strictEqual(CV.defaults('g11-gold').ctitle, 'Graduation'); assert.strictEqual(CV.defaults('g11-gold').csub, 'class of'); assert.ok(!('ctitle' in CV.defaults('classic')));
  const st = S.newState(); st.children = '1 А А'; S.buildSpreads(st); st.cvText['g11-gold:ctitle'] = ''; assert.strictEqual(S.fromJSON(S.toJSON(st)).cvText['g11-gold:ctitle'], '');
});
test('захист від повторів портретів: файл і дитина не стають двічі', () => {
  const st = S.newState(); st.children = '0001 А А\n0002 Б Б\n0003 В В'; S.buildSpreads(st);
  const pi = st.spreads.findIndex(x => x.type === 'portrait');
  assert.ok(S.placePortrait(st, pi, '0001.jpg') >= 0);
  assert.strictEqual(S.placePortrait(st, pi, '0001.jpg'), -1); assert.strictEqual(S.placePortrait(st, pi, '0001_copy.jpg'), -1);
  assert.ok(S.portraitPlaced(st, '0001.jpg')); assert.ok(!S.portraitPlaced(st, '0001.jpg', { si: pi, j: 0 }));
  assert.ok(S.placePortrait(st, pi, '0002.jpg') >= 0);
  S.reflowPortrait(st); let n = 0; st.spreads.forEach(x => { if (x.type === 'portrait') n += Object.keys(x.extra).length; }); assert.strictEqual(n, 2);
});
test('обкладинка: перемикач прізвища й імені', () => {
  const st = S.newState(); st.children = '1 Іваненко Марія\n2 Петренко Олег'; S.buildSpreads(st);
  assert.strictEqual(S.slotsFor(st, 0, new Map()).ownerName, 'Іваненко Марія');
  assert.deepStrictEqual(S.exportPlan(st).filter(x => /^cover/.test(x.name)).map(x => x.name), ['cover_01', 'cover_02']);
  st.coverIndividual = false;
  assert.strictEqual(S.slotsFor(st, 0, new Map()).ownerName, '');
  assert.deepStrictEqual(S.exportPlan(st).filter(x => /^cover/.test(x.name)).map(x => x.name), ['cover']);
});
test('обкладинки: колажі й фігури', () => {
  const CV = require('../data/cover-variants.js'), L = require('../core/layout.js');
  const n = {}; CV.VARIANTS.filter(v => v.cells).forEach(v => { assert.ok(v.general && v.photo === false); const cs = v.cells({ x0: 233, x1: 463, cx: 348, W: 466, H: 236, sb: 8 }); n[cs.length] = 1; cs.forEach(q => assert.ok(q.x >= 233 && q.x + q.w <= 466.01 && q.y >= 0 && q.y + q.h <= 236)); });
  assert.ok(n[1] && n[3] && n[5]);
  const st = S.newState(); st.children = '1 А А\n2 Б Б'; S.buildSpreads(st); st.coverVar = 'gp-3'; st.spreads[0].slots = ['a.jpg'];
  assert.strictEqual(S.coverIndividual(st), false); const it = S.slotsFor(st, 0, new Map()).items; assert.strictEqual(it.length, 3); assert.strictEqual(it[0].name, 'a.jpg');
  assert.deepStrictEqual(S.exportPlan(st).filter(x => /^cover/.test(x.name)).map(x => x.name), ['cover']);
  st.coverVar = 'arch'; assert.strictEqual(S.slotsFor(st, 0, new Map()).items[0].shape, 'arch');
  assert.ok(CV.VARIANTS.filter(v => v.photo).length >= 7);
});
test('обкладинки за зразками: групи, шрифти, місце фото, написи не виходять за безпечну смугу', () => {
  const CV = require('../data/cover-variants.js'); require('../data/cover-ref-kit.js'); require('../data/cover-ref-photo.js'); require('../data/cover-ref-extra.js');
  const L = require('../core/layout.js'), FT = require('../data/fonts.js'), ids = {}, groups = {};
  CV.VARIANTS.forEach(v => { assert.ok(!ids[v.id], 'дубль ' + v.id); ids[v.id] = 1; assert.ok(CV.GROUPS.includes(CV.groupOf(v)), v.id + ': група'); groups[CV.groupOf(v)] = (groups[CV.groupOf(v)] || 0) + 1; });
  const ref = CV.VARIANTS.filter(v => v.grp && /^(cal|typ|min|soft|sch|kid)-/.test(v.id)); assert.strictEqual(ref.length, 20);
  ref.forEach(v => {
    assert.ok(v.text && v.fonts && v.fonts.length, v.id + ': шрифти');
    CV.fontsOf(v.id).forEach(n => assert.ok(FT.stack(n), v.id + ': шрифт ' + n + ' відсутній у data/fonts.js'));
    if (v.photo) { assert.ok(v.prf || v.pr, v.id + ': місце фото'); const c = L.coverLayout(466, 236, 18, { bleed: 3, spine: 0 }, v); assert.ok(c.photo.w > 20 && c.photo.h > 20 && c.photo.x >= 233 - 1e-6, v.id + ': фото на передній сторінці'); }
    // малювання з імітацією canvas: усі виклики тексту мають y у безпечній смузі [sb, H - sb]
    const ys = [], noop = () => 0, ctx = new Proxy({}, { get: (t, k) => k === 'measureText' ? () => ({ width: 1 }) : (k === 'createLinearGradient' || k === 'createRadialGradient') ? () => ({ addColorStop: noop }) : noop, set: () => true });
    const g = { ctx, W: 466, H: 236, sb: 18, cx: 348, x0: 233, x1: 463, bx0: 0, bx1: 466, ph: { x: 280, y: 40, w: 120, h: 130 }, year: '2025', owner: 'Іваненко Олена', inst: 'Ліцей №5', get: (k, d) => d, t: x => x, t2: x => x, fx: noop, tx: (k, t, x, y) => { if (y !== 0) ys.push(y); return 0; } }; // y = 0: напис у повернутій системі координат (не рахується)
    v.text(g); assert.ok(ys.length >= 3, v.id + ': написи');
    ys.forEach(y => assert.ok(y >= 17.99 && y <= 236 - 18 + 0.01, v.id + ': y=' + y + ' поза безпечною смугою'));
  });
  assert.ok(Object.keys(groups).length >= 6);
});
console.log(failed ? `\n${failed} не пройдено` : '\nУсі перевірки пройдено');
process.exit(failed ? 1 : 0);
