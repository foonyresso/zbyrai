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
console.log(failed ? `\n${failed} не пройдено` : '\nУсі перевірки пройдено');
process.exit(failed ? 1 : 0);
