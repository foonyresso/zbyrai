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
test('cleanParams: кроки й cfg необов\u2019язкові (0 = з воркера), обмежуються', () => {
  assert.equal(cleanParams({ prompt: 'a' }).steps, 0); assert.equal(cleanParams({ prompt: 'a' }).cfg, 0);
  const p = cleanParams({ prompt: ' cat ', width: 5000, height: 10, steps: 999, cfg: 99, seed: 'x' });
  assert.equal(p.prompt, 'cat'); assert.equal(p.width, LIMITS.maxSide); assert.equal(p.height, LIMITS.minSide);
  assert.equal(p.steps, LIMITS.maxSteps); assert.equal(p.cfg, LIMITS.maxCfg); assert.equal(p.seed, -1);
});
test('cleanParams: апскейл 1–2, обмежений довгою стороною ≤ 2800, ADetailer із промптами', () => {
  assert.equal(cleanParams({ upscale: 5, width: 512, height: 512 }).upscale, 2); assert.equal(cleanParams({ upscale: 0 }).upscale, 1);
  assert.equal(cleanParams({ upscale: 1.65, width: 768, height: 1344 }).upscale, 1.65); assert.equal(cleanParams({ upscale: 1.34, width: 512, height: 512 }).upscale, 1.35);
  const big = cleanParams({ upscale: 2, width: 1024, height: 1536 }); assert.ok(big.height * big.upscale <= LIMITS.maxFinal);
  const p = cleanParams({ adFace: 1, adPrompt: ' detailed eyes ', adNeg: 'blurry' }); assert.equal(p.adFace, true); assert.equal(p.adPrompt, 'detailed eyes'); assert.equal(p.adNeg, 'blurry');
  assert.equal(p.adHands, undefined);
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
test('cleanParams: перемалювання — межі, розмір кратний 64, перевірка маски й посилання', () => {
  const id = '12345678-1234-1234-1234-123456789abc';
  const p = cleanParams({ kind: 'inpaint', prompt: ' x ', srcId: id, mask: 'QUJD', denoise: 5, width: 100, height: 9999, padding: 70, steps: 99 });
  assert.equal(p.kind, 'inpaint'); assert.equal(p.denoise, 1); assert.equal(p.width, 512); assert.equal(p.height, 1536); assert.equal(p.steps, LIMITS.maxSteps); assert.equal(p.padding % 8, 0);
  assert.equal(cleanParams({ kind: 'inpaint', denoise: 0 }).denoise, 0.05); assert.equal(cleanParams({ kind: 'inpaint', srcId: 'x', mask: '<script>' }).srcId, ''); assert.equal(cleanParams({ kind: 'inpaint', mask: '<script>' }).mask, '');
  assert.equal(cleanParams({ kind: 'inpaint', mask: 'A'.repeat(LIMITS.maxMask + 1) }).mask, '');
});
console.log(failed ? `\n${failed} не пройдено` : '\nУсі перевірки пройдено');
process.exit(failed ? 1 : 0);
