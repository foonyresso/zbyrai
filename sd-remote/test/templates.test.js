// Тести шаблонів: node sd-remote/test/templates.test.js
const assert = require('node:assert');
const T = require('../templates.js');
let failed = 0;
const test = (n, f) => { try { f(); console.log('  ok  ', n); } catch (e) { failed++; console.log('  FAIL', n, '\n      ', e.message); } };
test('capture копіює лише поля шаблону й не ділить посилання', () => {
  const S = { prompt: 'a', neg: 'b', ratio: '2:3', loras: [{ name: 'x', w: 0.2 }], token: 'secret', jobs: [1] };
  const c = T.capture(S); assert.equal(c.token, undefined); assert.equal(c.jobs, undefined); c.loras[0].w = 9; assert.equal(S.loras[0].w, 0.2);
});
test('sanitize: межі, невідомі значення, сміття відкидається', () => {
  const s = T.sanitize({ ratio: '7:7', orient: 'x', long: 5000, steps: 99, upscale: 9, adOn: 'yes', loras: [{ name: 'a', w: 99 }, { w: 1 }, null], evil: 1, prompt: 5 });
  assert.equal(s.ratio, undefined); assert.equal(s.orient, undefined); assert.equal(s.long, 1536); assert.equal(s.steps, 12); assert.equal(s.upscale, 2);
  assert.equal(s.adOn, undefined); assert.deepEqual(s.loras, [{ name: 'a', w: 5 }]); assert.equal(s.evil, undefined); assert.equal(s.prompt, undefined);
  assert.equal(T.sanitize({ long: 1000 }).long % 64, 0);
});
test('вбудовані шаблони проходять sanitize без втрат ключових полів', () => {
  T.BUILTIN.forEach(b => { const s = T.sanitize(b.data); assert.equal(s.ratio, b.data.ratio); assert.equal(s.prompt, b.data.prompt); assert.ok(T.summary(s).length > 0); });
});
console.log(failed ? `\n${failed} не пройдено` : '\nУсі перевірки пройдено');
process.exit(failed ? 1 : 0);
