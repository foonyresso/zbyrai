// Тести автопідказок: node sd-remote/test/autocomplete-core.test.js
const assert = require('node:assert');
const A = require('../autocomplete-core.js');
let failed = 0;
const test = (n, f) => { try { f(); console.log('  ok  ', n); } catch (e) { failed++; console.log('  FAIL', n, '\n      ', e.message); } };
const list = A.parse('masterpiece\tq\t9000000000\t\nlong_hair\t0\t5000\t/lh,longhair\nlong_sleeves\t0\t3000\t\nponytail\t0\t2000\thorsetail\nhigh_ponytail\t0\t1500\t\nbreasts\t0\t9000\toppai,boobs\n');
test('parse: поля й синоніми', () => { assert.equal(list.length, 6); assert.deepEqual(list[1].a, ['/lh', 'longhair']); assert.equal(list[1].n, 5000); });
test('fragment: від коми до курсору; пробіли й дужки', () => {
  assert.deepEqual(A.fragment('1girl, long ha', 14), { start: 7, end: 14, query: 'long_ha', lora: false });
  assert.equal(A.fragment('1girl, (lon', 11).query, 'lon');
  assert.equal(A.fragment('a, b', 4), null); assert.equal(A.fragment('1girl, (cat:1.', 14), null);
  const l = A.fragment('x, <lora:epi', 12); assert.ok(l.lora && l.query === 'epi');
});
test('search: початок тегу → синонім → збіг усередині; за популярністю', () => {
  assert.deepEqual(A.search(list, 'long').map(r => r.e.t), ['long_hair', 'long_sleeves']);
  assert.equal(A.search(list, 'oppai')[0].e.t, 'breasts'); assert.equal(A.search(list, 'oppai')[0].alias, 'oppai');
  assert.deepEqual(A.search(list, 'ponytail').map(r => r.e.t), ['ponytail', 'high_ponytail']);
  assert.equal(A.search(list, 'xyzxyz').length, 0);
});
test('apply: заміна фрагмента, кома, екранування дужок', () => {
  const t = '1girl, long ha'; const r = A.apply(t, A.fragment(t, t.length), A.tagText('long_hair'));
  assert.equal(r.text, '1girl, long hair, '); assert.equal(r.caret, r.text.length);
  const mid = 'a, lon, b'; const f = A.fragment(mid, 6); assert.equal(A.apply(mid, f, 'long hair').text, 'a, long hair, b');
  assert.equal(A.tagText('tail_(animal)'), 'tail \\(animal\\)');
});
test('count: підпис кількості', () => { assert.equal(A.count(7077121), '7.1M'); assert.equal(A.count(4500), '5k'); assert.equal(A.count(9e9), ''); });
console.log(failed ? `\n${failed} не пройдено` : '\nУсі перевірки пройдено');
process.exit(failed ? 1 : 0);
