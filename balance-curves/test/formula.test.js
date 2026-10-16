// Тести власних формул кривих. Запуск: node balance-curves/test/formula.test.js
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const F = require('../formula.js'), B = require('../curves-core.js');
let failed = 0;
const test = (n, f) => { try { f(); console.log('  ok  ', n); } catch (e) { failed++; console.log('  FAIL', n, '\n      ', e.message); } };
const near = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) <= eps * Math.max(1, Math.abs(b)), `${a} ≉ ${b}`);
const ev = (src, x = 1, a = 0, b = 0, p = 0, ref) => F.evaluate(src, x, a, b, p, ref);

test('арифметика й пріоритети', () => {
  near(ev('1+2*3'), 7); near(ev('(1+2)*3'), 9); near(ev('2^3^2'), 512); near(ev('-2^2'), -4); near(ev('2^-1'), 0.5);
  near(ev('10 % 4 + 7 / 2'), 5.5); near(ev('1e3 + .5'), 1000.5);
});
test('змінні x, a, b, p і константи', () => near(ev('a*x^p + b + pi', 3, 2, 1, 2), 2 * 9 + 1 + Math.PI));
test('функції', () => {
  near(ev('min(3,1,2)+max(1,5)'), 6); near(ev('clamp(15,0,10)'), 10); near(ev('mix(10,20,0.25)'), 12.5); near(ev('floor(2.9)+ceil(2.1)+round(2.5)'), 8);
  near(ev('mod(-1,10)'), 9); near(ev('ln(e)+log10(1000)+log2(8)'), 7); near(ev('sign(-5)'), -1); near(ev('step(5,x)', 6), 1); near(ev('step(5,x)', 4), 0);
});
test('умови й логіка', () => {
  near(ev('x%10==0 ? 5 : 1', 20), 5); near(ev('x%10==0 ? 5 : 1', 21), 1);
  near(ev('if(x<5, 1, 2)', 3), 1); near(ev('(x>1 && x<10) + (x>100 || x<0)', 5), 1); near(ev('!0 + !3'), 1);
  near(ev('a * 2 ^ floor((x-1)/p)', 21, 100, 0, 10), 400);
});
test('посилання на інші криві c1, c2 і захист від циклів', () => {
  const list = [{ type: 'linear', a: 10, b: 1 }, { type: 'custom', expr: 'c1*2+x', a: 0, b: 0, p: 0 }, { type: 'custom', expr: 'c3', a: 0, b: 0, p: 0 }];
  B.setContext(list);
  near(B.evalCurve(list[1], 5), (10 + 4) * 2 + 5);
  assert.ok(Number.isNaN(B.evalCurve(list[2], 5)), 'самопосилання дає NaN');
  B.setContext([]); assert.ok(Number.isNaN(B.evalCurve(list[1], 5)));
});
test('помилки: зрозумілі, без винятків', () => {
  for (const bad of ['', '1+', '2**3', 'foo(1)', 'z+1', 'min()', 'clamp(1,2)', '(1+2', '1 2', '$', 'x?1', 'c99']) {
    const e = F.check(bad); assert.ok(e && typeof e === 'string', 'очікувалась помилка для «' + bad + '»');
    assert.ok(Number.isNaN(ev(bad)));
  }
  assert.ok(F.check('x'.repeat(500)), 'задовга'); assert.ok(F.check('('.repeat(80) + '1' + ')'.repeat(80)), 'забагато дужок');
  assert.equal(F.check('x+1'), null);
});
test('ділення на нуль і корінь із мінуса дають NaN, не крах', () => { assert.ok(Number.isNaN(ev('1/0'))); assert.ok(Number.isNaN(ev('sqrt(-1)'))); });
test('код JS дає ті самі числа, що й обчислення', () => {
  for (const src of ['a*b^(x-1)*(x%p==0 ? 4 : 1)', 'clamp(a-b*abs(x-p), 0.02, a)', 'if(x<p, a*x^1.5, a*p^1.5+b*(x-p)^2)', 'mix(a,b,min(1,x/p)) + (x>3 && x<9) + mod(x,3) + step(4,x)', 'max(a,b,x) - round(x/3) + sin(x)*cos(x) + sqrt(x) + exp(0.1) + ln(x+1) + log2(x) + log10(x) + pow(x,2) + sign(x-3)']) {
    const par = { a: 3, b: 1.5, p: 7 }, code = F.toCode(src, 'js', par), f = new Function('x', 'return ' + code);
    for (const x of [1, 2, 5, 10, 14, 30]) near(f(x), ev(src, x, par.a, par.b, par.p), 1e-9);
  }
});
test('код Python дає ті самі числа (якщо є python3)', () => {
  if (spawnSync('python3', ['-V']).status !== 0) return;
  const par = { a: 3, b: 1.5, p: 7 };
  for (const src of ['a*b^(x-1)*(x%p==0 ? 4 : 1)', 'if(x<p, a*x^1.5, a*p^1.5+b*(x-p)^2)', 'clamp(a-b*abs(x-p), 0.02, a) + (x>3 && x<9) + !x + mod(x,3)', 'max(a,b,x)-floor(x/3)+sqrt(x)+ln(x)+pi+e']) {
    const code = F.toCode(src, 'py', par), xs = [1, 5, 14, 30];
    const out = spawnSync('python3', ['-c', 'import math\nf=lambda x: ' + code + '\nprint(*[repr(float(f(x))) for x in ' + JSON.stringify(xs) + '])']);
    assert.equal(out.status, 0, String(out.stderr)); const got = String(out.stdout).trim().split(' ').map(Number);
    xs.forEach((x, i) => near(got[i], ev(src, x, par.a, par.b, par.p), 1e-9));
  }
});
test('код C#: типи й функції', () => {
  const c = B.toCode({ type: 'custom', name: 'Мій HP', expr: 'a*b^(x-1)*(x%p==0 ? 4 : 1) + max(1,x,3)', a: 100, b: 1.1, p: 10 }, 'cs');
  assert.match(c, /^static double _{0,3}\w+\(double x\) =>/); assert.match(c, /Math\.Pow\(1\.1, \(x - 1\.0\)\)/); assert.match(c, /Math\.Max\(Math\.Max\(1\.0, x\), 3\.0\)/); assert.match(c, /\? 4\.0 : 1\.0/);
});
test('toCode для власної формули: js/py і помилки', () => {
  const c = { type: 'custom', name: 'hp', expr: 'a*x', a: 2, b: 0, p: 0 };
  assert.equal(B.toCode(c), 'const hp = x => (2 * x);'); assert.match(B.toCode(c, 'py'), /def hp\(x\):\n    return \(2 \* x\)/);
  assert.match(B.toCode({ type: 'custom', name: 'q', expr: '1+', a: 0, b: 0, p: 0 }), /NaN/);
});
test('власна формула в серіях і таблиці', () => {
  const c = { type: 'custom', name: 'S', expr: 'a + b*floor((x-1)/p)', a: 10, b: 5, p: 10 };
  assert.deepEqual(B.series(c, 9, 12).map(p => p.y), [10, 10, 15, 15]);
  assert.match(B.toCsv([c], 1, 3), /^x,"S"\n1,10\n2,10\n3,10$/);
});
test('хвилі працюють із власною формулою бюджету', () => {
  const w = B.buildWaves({ to: 12, seed: 1, budget: { type: 'custom', expr: 'a*(1 + (x%p==0))*x', a: 3, b: 0, p: 5 }, types: [{ name: 'g', cost: 1, hp: 10 }] });
  assert.equal(w.length, 12); assert.equal(w[4].budget, 3 * 2 * 5); assert.equal(w[4].spent, 30);
});
test('множник HP хвилі (необов\'язкова крива) масштабує загальне HP', () => {
  const base = { to: 3, seed: 1, budget: { type: 'linear', a: 4, b: 0, p: 0 }, types: [{ name: 'g', cost: 1, hp: 10 }] };
  const a = B.buildWaves(base), b = B.buildWaves({ ...base, hpScale: { type: 'custom', expr: 'x', a: 0, b: 0, p: 0 } });
  assert.equal(b[0].hp, a[0].hp); assert.equal(b[2].hp, a[2].hp * 3);
});
test('бібліотека формул: усі розбираються й дають скінченні числа', () => {
  const PR = require('../formula-presets.js'); assert.ok(PR.list.length >= 15);
  const ctx = [{ type: 'linear', a: 10, b: 2 }, { type: 'linear', a: 5, b: 1 }];
  B.setContext(ctx);
  for (const pr of PR.list) {
    assert.equal(F.check(pr.expr), null, pr.name);
    const c = { type: 'custom', expr: pr.expr, a: pr.a, b: pr.b, p: pr.p };
    for (const x of [1, 10, 33]) assert.ok(Number.isFinite(B.evalCurve(c, x)), `${pr.name} x=${x}`);
  }
  B.setContext([]);
});
console.log(failed ? `\n${failed} не пройдено` : '\nУсі перевірки пройдено');
process.exit(failed ? 1 : 0);
