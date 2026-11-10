// Тести інструкцій для ШІ: node sd-remote/test/ai-prompts.test.js
const assert = require('node:assert'); const A = require('../ai-prompts.js'); let failed = 0;
const test = (n, f) => { try { f(); console.log('  ok  ', n); } catch (e) { failed++; console.log('  FAIL', n, '\n      ', e.message); } };
test('4 варіанти з правильними межами в тексті', () => {
  assert.deepEqual(A.VARIANTS.map(v => v.lo + '-' + v.hi), ['50-60', '60-100', '70-120', '80-180']);
  A.VARIANTS.forEach(v => { const t = A.build(v); assert.ok(t.includes('Total ' + v.lo + '-' + v.hi + ' tags'), v.id); assert.ok(t.includes(v.lo + '-' + v.hi + ' tags, do not copy'), v.id + ' приклад'); assert.ok(!/\{\{|undefined/.test(t), v.id + ' плейсхолдери'); });
});
test('межі по блоках сумуються в діапазон загальної кількості (±15%)', () => {
  A.VARIANTS.forEach(v => { const lo = v.b.reduce((s, x) => s + +x.split('-')[0], 0), hi = v.b.reduce((s, x) => s + +x.split('-')[1], 0); assert.ok(lo >= v.lo * 0.85 && lo <= v.lo * 1.1, v.id + ' мін ' + lo); assert.ok(hi >= v.hi * 0.9 && hi <= v.hi * 1.15, v.id + ' макс ' + hi); });
});
test('текст про картинку, без старих режимів і чужих меж', () => {
  A.VARIANTS.forEach(v => { const t = A.build(v); assert.match(t, /LOOK at the input image/); assert.ok(!/PROFILE|SCENE MODE|200-300|150-250/.test(t), v.id); assert.ok(t.includes('BLOCK 6 - LIGHTING AND COLORS') && t.includes('Output only the final tag blocks')); });
});
console.log(failed ? `\n${failed} не пройдено` : '\nУсі перевірки пройдено'); process.exit(failed ? 1 : 0);
