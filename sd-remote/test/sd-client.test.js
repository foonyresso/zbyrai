// Тести чистої логіки «Віддаленого SD». Запуск: node sd-remote/test/sd-client.test.js
const assert = require('node:assert');
const C = require('../sd-client.js');
let failed = 0;
const test = (n, f) => { try { f(); console.log('  ok  ', n); } catch (e) { failed++; console.log('  FAIL', n, '\n      ', e.message); } };
test('queueText: черга, генерація, готово', () => {
  assert.equal(C.queueText({ status: 'queued', position: 2 }), 'У черзі: 2');
  assert.equal(C.queueText({ status: 'running' }), 'Генерується на ПК…');
  assert.equal(C.queueText({ status: 'done' }), 'Готово');
});
test('pcText: онлайн/офлайн', () => {
  assert.equal(C.pcText({ online: true, queue: 0 }).cls, 'on');
  assert.equal(C.pcText({ online: false, queue: 1 }).cls, 'off');
  assert.equal(C.pcText(null).cls, '');
});
test('fileName: безпечне ім’я з seed', () => {
  assert.equal(C.fileName('A cat / dog!', 42), 'a-cat-dog-42.webp');
  assert.equal(C.fileName('', -1, 'png'), 'sd.png');
});
const tree = [{ id: 'c', name: 'Волосся', subs: [{ id: 'c.s', name: 'Зачіска', params: [
  { id: 'len', label: 'Довжина', multi: false, groups: [['', [['Коротке', 'short_hair'], ['Довге', 'long_hair']]]] },
  { id: 'acc', label: 'Прикраси', multi: true, groups: [['', [['Бант', 'hair_bow'], ['Стрічка', 'hair_ribbon']]]] }] }] }];
test('sizeFor: пропорції, орієнтація, кратність 64', () => {
  assert.deepEqual(C.sizeFor('1:1', 'v', 1024), { w: 1024, h: 1024 });
  assert.deepEqual(C.sizeFor('9:16', 'v', 1344), { w: 768, h: 1344 });
  assert.deepEqual(C.sizeFor('2:3', 'v', 1024), { w: 704, h: 1024 });
  assert.deepEqual(C.sizeFor('2:3', 'h', 1024), { w: 1024, h: 704 });
  for (const r of C.RATIOS) for (const o of ['v', 'h']) { const s = C.sizeFor(r, o, 1216); assert.ok(s.w % 64 === 0 && s.h % 64 === 0 && Math.max(s.w, s.h) === 1216); }
  assert.deepEqual(C.finalSize(704, 1024, 1.5), { w: 1056, h: 1536 });
});
test('toggleTag: додає в промпт і прибирає повторним кліком', () => {
  const len = tree[0].subs[0].params[0], acc = tree[0].subs[0].params[1];
  let t = C.toggleTag('1girl', acc, 'hair_bow'); assert.equal(t, '1girl, hair bow');
  t = C.toggleTag(t, acc, 'hair_ribbon'); assert.equal(t, '1girl, hair bow, hair ribbon');
  t = C.toggleTag(t, acc, 'hair_bow'); assert.equal(t, '1girl, hair ribbon');
  assert.ok(C.hasTag('1girl, (hair ribbon:1.2)', 'hair_ribbon'));
});
test('toggleTag: у групі «один варіант» замінює сусідній тег', () => {
  const len = tree[0].subs[0].params[0];
  let t = C.toggleTag('1girl, short hair', len, 'long_hair'); assert.equal(t, '1girl, long hair');
  assert.equal(C.toggleTag(t, len, 'long_hair'), '1girl');
});
test('toggleTag: дужки екрануються, пошук їх розуміє', () => {
  const p = { id: 'x', multi: true, groups: [['', [['', 'tail_(animal)']]]] };
  const t = C.toggleTag('', p, 'tail_(animal)'); assert.equal(t, 'tail \\(animal\\)');
  assert.ok(C.hasTag(t, 'tail_(animal)')); assert.equal(C.toggleTag(t, p, 'tail_(animal)'), '');
});
test('countIn: скільки тегів групи вже в промпті', () => assert.equal(C.countIn('a, hair bow', ['hair_bow', 'hair_ribbon']), 1));
test('searchTags: за тегом і за підказкою', () => {
  assert.equal(C.searchTags(tree, 'hair bo')[0].tag, 'hair_bow');
  assert.equal(C.searchTags(tree, 'довг')[0].tag, 'long_hair');
  assert.deepEqual(C.searchTags(tree, 'а'), []);
});
console.log(failed ? `\n${failed} не пройдено` : '\nУсі перевірки пройдено');
process.exit(failed ? 1 : 0);
