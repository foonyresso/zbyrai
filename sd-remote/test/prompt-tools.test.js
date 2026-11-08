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
test('вага: +10% і +50% на простому тегу', () => {
  let r = P.applyWeight('1girl, long hair', ...sel('1girl, long hair', 'long'), 0.1, def);
  assert.equal(r.text, '1girl, (long hair:1.1)');
  r = P.applyWeight(r.text, r.start, r.end, 0.5, def); assert.equal(r.text, '1girl, (long hair:1.6)');
});
test('вага: повернення до 1.0 знімає дужки; reset', () => {
  let r = P.applyWeight('(cat:1.1)', 0, 9, -0.1, def); assert.equal(r.text, 'cat');
  r = P.applyWeight('(cat:1.7)', 0, 9, 'reset', def); assert.equal(r.text, 'cat');
});
test('вага: мінімум 0, максимум 3', () => {
  assert.equal(P.applyWeight('cat', 0, 3, -1, def).text, '(cat:0)');
  assert.equal(P.applyWeight('(cat:2.8)', 0, 9, 1, def).text, '(cat:3)');
});
test('LoRA: дельта від типової, reset до типової, межі −5…5', () => {
  assert.equal(P.applyWeight('<lora:epi:0.2>', 0, 14, 0.1, def).text, '<lora:epi:0.3>');
  assert.equal(P.applyWeight('<lora:epi:0.9>', 0, 14, 'reset', def).text, '<lora:epi:0.2>');
  assert.equal(P.applyWeight('<lora:zzz>', 0, 10, 'reset', def).text, '<lora:zzz:1>');
  assert.equal(P.applyWeight('<lora:zzz:4.8>', 0, 14, 1, def).text, '<lora:zzz:5>');
  assert.equal(P.applyWeight('<lora:zzz:-4.8>', 0, 15, -1, def).text, '<lora:zzz:-5>');
});
test('виділення кількох тегів змінює всі, нове виділення покриває їх', () => {
  const t = 'a, b, c, d'; const r = P.applyWeight(t, 3, 8, 0.5, def);
  assert.equal(r.text, 'a, (b:1.5), (c:1.5), d'); assert.equal(r.text.slice(r.start, r.end), '(b:1.5), (c:1.5)');
});
test('порожнє виділення або без тегів нічого не змінює', () => {
  assert.equal(P.applyWeight('a, b', 1, 1, 0.1, def), null); assert.equal(P.applyWeight(' , ', 0, 3, 0.1, def), null);
});
test('highlightHtml: екранує, класи за вагою й LoRA, довжина тексту збережена', () => {
  const t = 'a<b, (x:1.2), (y:0.8), <lora:z:1>';
  const h = P.highlightHtml(t);
  assert.ok(h.includes('a&lt;b') && h.includes('class="t t1 up"') && h.includes('class="t t0 down"') && h.includes('class="t lora"'));
  assert.equal(h.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'), t);
});
test('loraTags і joinPrompt', () => {
  assert.equal(P.loraTags([{ name: 'a', w: 0.2 }, { name: 'b', w: -1 }]), '<lora:a:0.2>, <lora:b:-1>');
  assert.equal(P.joinPrompt('1girl, ', [{ name: 'a', w: 0.15 }]), '1girl, <lora:a:0.15>');
  assert.equal(P.joinPrompt('', []), '');
});
console.log(failed ? `\n${failed} не пройдено` : '\nУсі перевірки пройдено');
process.exit(failed ? 1 : 0);
