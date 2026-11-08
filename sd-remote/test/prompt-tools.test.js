// Тести логіки промпта: node sd-remote/test/prompt-tools.test.js
const assert = require('node:assert');
const P = require('../prompt-tools.js');
let failed = 0;
const test = (n, f) => { try { f(); console.log('  ok  ', n); } catch (e) { failed++; console.log('  FAIL', n, '\n      ', e.message); } };
const def = (n) => ({ epi: 0.2 })[n] ?? null;
const sel = (text, sub) => { const a = text.indexOf(sub); return [a, a + sub.length]; };

test('segments: коми поза дужками й <lora>', () => {
  const t = '1girl, (a, b:1.2), <lora:x:0.5>, tail \\(animal\\)';
  assert.deepEqual(P.segments(t).map(s => t.slice(s.cs, s.ce)), ['1girl', '(a, b:1.2)', '<lora:x:0.5>', 'tail \\(animal\\)']);
});
test('setWeight: точна вага, 1.0 знімає дужки, межі 0.1…5', () => {
  let r = P.setWeight('1girl, long hair', ...sel('1girl, long hair', 'long'), 1.4);
  assert.equal(r.text, '1girl, (long hair:1.4)');
  r = P.setWeight(r.text, r.start, r.end, 0.7); assert.equal(r.text, '1girl, (long hair:0.7)');
  r = P.setWeight(r.text, r.start, r.end, 1); assert.equal(r.text, '1girl, long hair');
  assert.equal(P.setWeight('cat', 0, 3, 0).text, '(cat:0.1)'); assert.equal(P.setWeight('cat', 0, 3, 9).text, '(cat:5)');
});
test('setWeight: кілька тегів разом; LoRA не чіпається; порожнє виділення', () => {
  const t = 'a, b, <lora:x:0.5>, c'; const r = P.setWeight(t, 0, t.length, 1.2);
  assert.equal(r.text, '(a:1.2), (b:1.2), <lora:x:0.5>, (c:1.2)');
  assert.equal(P.setWeight('a, b', 1, 1, 1.2), null); assert.equal(P.setWeight('<lora:x:1>', 0, 10, 1.2), null);
});
test('selectionWeight: поточна вага першого тегу', () => {
  assert.equal(P.selectionWeight('(cat:1.7), dog', 0, 5), 1.7); assert.equal(P.selectionWeight('cat', 0, 3), 1); assert.equal(P.selectionWeight('<lora:x:1>', 0, 10), null);
});
test('highlightHtml: коми золоті, групи (…) і […], LoRA, екранування; текст не змінюється', () => {
  const x = 'a<b, (x, y:1.2), [z], <lora:z:1>, tail \\(animal\\)';
  const h = P.highlightHtml(x);
  assert.ok(h.includes('class="grp"') && h.includes('class="grp2"') && h.includes('class="lora"') && h.includes('class="c"') && h.includes('a&lt;b'));
  assert.equal(h.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'), x);
  assert.equal(P.highlightHtml('(abc').replace(/<[^>]+>/g, ''), '(abc');
});
test('loraTags і joinPrompt', () => {
  assert.equal(P.loraTags([{ name: 'a', w: 0.2 }, { name: 'b', w: -1 }]), '<lora:a:0.2>, <lora:b:-1>');
  assert.equal(P.joinPrompt('1girl, ', [{ name: 'a', w: 0.15 }, { name: 'b', w: 0.3 }]), '<lora:a:0.15>, <lora:b:0.3>, 1girl');
  assert.equal(P.joinPrompt('1girl', []), '1girl');
  assert.equal(P.joinPrompt('', []), '');
});
console.log(failed ? `\n${failed} не пройдено` : '\nУсі перевірки пройдено');
process.exit(failed ? 1 : 0);
