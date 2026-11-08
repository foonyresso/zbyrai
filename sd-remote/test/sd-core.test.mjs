// Тести серверної логіки: node sd-remote/test/sd-core.test.mjs
import assert from 'node:assert';
import { userOf, cleanParams, LIMITS, validLogin, validPass, hashPassword } from '../../functions/api/sd/sd-core.js';
let failed = 0;
const test = (n, f) => { try { f(); console.log('  ok  ', n); } catch (e) { failed++; console.log('  FAIL', n, '\n      ', e.message); } };
test('userOf: логін і пароль', () => {
  assert.equal(userOf('anya:abc, vasya:x:y', 'vasya', 'x:y'), 'vasya');
  assert.equal(userOf('anya:abc', 'anya', 'abc'), 'anya');
  assert.equal(userOf('anya:abc', 'anya', 'bad'), null);
  assert.equal(userOf('anya:abc', 'bob', 'abc'), null);
  assert.equal(userOf('anya:abc', '', ''), null);
  assert.equal(userOf('', 'a', 'b'), null);
});
test('cleanParams: обмеження розміру, кроків, cfg', () => {
  const p = cleanParams({ prompt: ' cat ', width: 5000, height: 10, steps: 999, cfg: 99, seed: 'x' });
  assert.equal(p.prompt, 'cat'); assert.equal(p.width, LIMITS.maxSide); assert.equal(p.height, LIMITS.minSide);
  assert.equal(p.steps, LIMITS.maxSteps); assert.equal(p.cfg, LIMITS.maxCfg); assert.equal(p.seed, -1);
});
test('cleanParams: розмір кратний 8', () => assert.equal(cleanParams({ width: 515 }).width % 8, 0));
test('validLogin/validPass', () => {
  assert.ok(validLogin('anya_1')); assert.ok(!validLogin('Anya')); assert.ok(!validLogin('a!')); assert.ok(!validLogin('ab'));
  assert.ok(validPass('12345678')); assert.ok(!validPass('1234567'));
});
await (async () => {
  try {
    const a = await hashPassword('secret123'), b = await hashPassword('secret123', a.salt), c = await hashPassword('other', a.salt);
    assert.equal(a.hash, b.hash); assert.notEqual(a.hash, c.hash); console.log('  ok   hashPassword: стабільний із сіллю');
  } catch (e) { failed++; console.log('  FAIL hashPassword', e.message); }
})();
console.log(failed ? `\n${failed} не пройдено` : '\nУсі перевірки пройдено');
process.exit(failed ? 1 : 0);
