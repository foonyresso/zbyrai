// Тести Wave & Balance Curves. Запуск: node balance-curves/test/curves.test.js
const assert = require('node:assert/strict');
const B = require('../curves-core.js');
let failed = 0, total = 0;
function test(name, fn) { total++; try { fn(); console.log('  ok   ' + name); } catch (e) { failed++; console.log('  FAIL ' + name + '\n       ' + String(e.message).split('\n').join('\n       ')); } }
const near = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) <= eps * Math.max(1, Math.abs(b)), `${a} ≉ ${b}`);

console.log('Wave & Balance Curves');

test('значення кривих у відомих точках', () => {
  near(B.evalCurve({ type: 'linear', a: 10, b: 5 }, 1), 10); near(B.evalCurve({ type: 'linear', a: 10, b: 5 }, 4), 25);
  near(B.evalCurve({ type: 'power', a: 2, p: 3 }, 3), 54);
  near(B.evalCurve({ type: 'exp', a: 100, b: 1.5 }, 3), 225);
  near(B.evalCurve({ type: 'logistic', a: 100, b: 1, p: 5 }, 5), 50);
  near(B.evalCurve({ type: 'log', a: 10, b: 1 }, Math.E - 1), 10);
});

test('логістична крива монотонна й обмежена стелею', () => {
  const s = B.series({ type: 'logistic', a: 80, b: .4, p: 10 }, 1, 60);
  for (let i = 1; i < s.length; i++) assert.ok(s[i].y >= s[i - 1].y);
  assert.ok(s[s.length - 1].y < 80 && s[s.length - 1].y > 79.9);
});

test('fitTwo: підібрана крива проходить через обидві цільові точки', () => {
  for (const type of ['linear', 'power', 'exp']) {
    const c = B.fitTwo(type, 1, 100, 30, 9000); near(B.evalCurve(c, 1), 100, 1e-9); near(B.evalCurve(c, 30), 9000, 1e-9);
  }
  assert.equal(B.fitTwo('exp', 1, 0, 5, 10), null); assert.equal(B.fitTwo('exp', 3, 5, 3, 9), null);
});

test('ratio і crossings: знаходить рівень, де співвідношення перетинає 1', () => {
  const hp = B.series({ type: 'exp', a: 100, b: 1.1 }, 1, 40), dmg = B.series({ type: 'linear', a: 50, b: 40 }, 1, 40);
  const r = B.ratio(dmg, hp), cr = B.crossings(r, 1);
  assert.ok(cr.length >= 1);
  const x = cr[0]; near(B.evalCurve({ type: 'linear', a: 50, b: 40 }, x) / B.evalCurve({ type: 'exp', a: 100, b: 1.1 }, x), 1, 0.05);
});

test('cumulative, doublingStep, growthPerStep', () => {
  const s = B.series({ type: 'exp', a: 10, b: 2 }, 1, 6);
  assert.equal(B.cumulative(s)[3].y, 10 + 20 + 40 + 80); assert.equal(B.doublingStep(s), 1);
  B.growthPerStep(s).forEach(p => near(p.y, 1));
});

test('buildWaves: детермінованість, бюджет не перевищено, вартості сходяться', () => {
  const o = { to: 30, budget: { type: 'linear', a: 10, b: 6 }, seed: 7, bossEvery: 10, types: [{ name: 'A', cost: 1, hp: 10 }, { name: 'B', cost: 3, hp: 40, minWave: 5 }, { name: 'C', cost: 8, hp: 150, minWave: 12, weight: .5 }] };
  const a = B.buildWaves(o), b = B.buildWaves(o); assert.deepEqual(a, b);
  for (const w of a) {
    assert.ok(w.spent <= w.budget + 1e-9, 'бюджет хвилі ' + w.wave);
    const cost = w.enemies.reduce((s, e) => s + e.count * o.types.find(t => e.name.startsWith(t.name)).cost, 0); near(cost, w.spent, 1e-9);
    if (w.wave < 5) assert.ok(w.enemies.every(e => !e.name.startsWith('B') && !e.name.startsWith('C')));
    assert.equal(w.boss, w.wave % 10 === 0);
  }
  assert.ok(a[29].total > a[0].total);
  assert.notDeepEqual(B.buildWaves(Object.assign({}, o, { seed: 8 })), a);
});

test('toCsv і toCode дають придатний вивід', () => {
  const csv = B.toCsv([{ name: 'HP', type: 'linear', a: 1, b: 2 }], 1, 3); assert.equal(csv, 'x,"HP"\n1,1\n2,3\n3,5');
  const c = { type: 'exp', a: 100, b: 1.15, name: 'enemy hp' };
  const f = new Function('return ' + B.toCode(c).replace(/^const [^=]+= /, '').replace(/;$/, ''))(); near(f(5), B.evalCurve(c, 5), 1e-5);
  assert.match(B.toCode(c, 'py'), /def enemy_hp\(x\)/); assert.match(B.toCode(c, 'cs'), /Math\.Pow/);
});

test('сторінка: довідка, підказки й збереження у верхній панелі', () => {
  const html = require('fs').readFileSync(require('path').join(__dirname, '..', 'index.html'), 'utf8');
  assert.match(html, /Що це, для чого, як користуватися/);
  const header = html.slice(html.indexOf('<header'), html.indexOf('</header>'));
  for (const id of ['btnCopyJson', 'btnImport', 'btnExport', 'btnCsv', 'btnJson', 'selCodeLang']) assert.ok(header.includes('id="' + id + '"'), id + ' має бути в шапці');
  for (const m of header.matchAll(/<button [^>]*id="(\w+)"[^>]*>/g)) assert.match(m[0], /title="/, 'підказка для ' + m[1]);
});

console.log(failed ? `\nПровалено: ${failed} з ${total}` : `\nУсі ${total} тестів пройдено`);
process.exit(failed ? 1 : 0);

test('сходинки, квадратична й корінь: значення та код', () => {
  const st = { type: 'steps', a: 10, b: 5, p: 10 };
  near(B.evalCurve(st, 1), 10, 1e-9); near(B.evalCurve(st, 10), 10, 1e-9); near(B.evalCurve(st, 11), 15, 1e-9); near(B.evalCurve(st, 31), 25, 1e-9);
  near(B.evalCurve({ type: 'quad', a: 1, b: 2, p: 3 }, 2), 17, 1e-9); near(B.evalCurve({ type: 'sqrt', a: 2, b: 1 }, 9), 7, 1e-9);
  for (const c of [st, { type: 'quad', a: 1, b: 2, p: 3 }, { type: 'sqrt', a: 2, b: 1 }]) { const f = new Function('return ' + B.toCode(c).replace(/^const [^=]+= /, '').replace(/;$/, ''))(); near(f(7), B.evalCurve(c, 7), 1e-5); }
  assert.match(B.toCode(st, 'py'), /math\.floor/);
});
