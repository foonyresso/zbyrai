// Тести Production Chain Planner. Запуск: node production-planner/test/planner.test.js
const assert = require('node:assert/strict');
const P = require('../planner-core.js');
let failed = 0, total = 0;
function test(name, fn) { total++; try { fn(); console.log('  ok   ' + name); } catch (e) { failed++; console.log('  FAIL ' + name + '\n       ' + String(e.message).split('\n').join('\n       ')); } }
const near = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) <= eps * Math.max(1, Math.abs(b)), `${a} ≉ ${b}`);
const R = (id, building, time, inputs, outputs) => ({ id, name: id, building, time, inputs, outputs });
const line = (res, id) => res.lines.find(l => l.recipe.id === id);

console.log('Production Chain Planner');

const iron = [
  R('smelt', 'Піч', 3.2, { руда: 1 }, { залізо: 1 }),
  R('plate', 'Прес', 6, { залізо: 3 }, { пластина: 2 }),
  R('gear', 'Збірка', 1, { залізо: 2 }, { шестерня: 1 }),
  R('machine', 'Збірка', 10, { пластина: 4, шестерня: 2 }, { механізм: 1 }),
];

test('ланцюжок: машини й сировина збігаються з ручним розрахунком', () => {
  const r = P.plan(iron, { механізм: 6 }); assert.ok(r.ok);
  // 6 механізмів/хв: 6 циклів → 24 пластини + 12 шестерень
  near(line(r, 'machine').runs, 6); near(line(r, 'machine').machines, 6 * 10 / 60);
  near(line(r, 'plate').runs, 12); near(line(r, 'gear').runs, 12);
  // залізо: 12·3 + 12·2 = 60 → руда 60
  near(line(r, 'smelt').runs, 60); near(r.raw['руда'], 60);
  near(line(r, 'smelt').machines, 60 * 3.2 / 60);
  assert.deepEqual(Object.keys(r.raw), ['руда']);
});

test('швидкість будівлі зменшує кількість машин, ceil округлює вгору', () => {
  const base = P.plan(iron, { механізм: 6 }), fast = P.plan(iron, { механізм: 6 }, { speed: { 'Піч': 2 } });
  near(line(fast, 'smelt').machines, line(base, 'smelt').machines / 2);
  assert.equal(line(base, 'smelt').machinesCeil, Math.ceil(line(base, 'smelt').machines - 1e-9));
});

test('побічний продукт: рецепт запускається за найбільшою потребою, зайве йде в надлишок', () => {
  const rec = [R('crack', 'Хім', 1, { нафта: 10 }, { бензин: 4, газ: 6 }), R('plast', 'Хім', 1, { газ: 3 }, { пластик: 1 })];
  const r = P.plan(rec, { бензин: 8, пластик: 2 }); assert.ok(r.ok);
  // бензин вимагає 2 цикли, пластик — 6 газу = 1 цикл; береться 2 цикли → газ 12, надлишок 6
  near(line(r, 'crack').runs, 2); near(r.surplus['газ'], 12 - 6); near(r.raw['нафта'], 20);
});

test('вибір альтернативного рецепта й позначення ресурсу сировиною', () => {
  const rec = [R('a', 'X', 1, { руда: 1 }, { метал: 1 }), R('b', 'X', 1, { лом: 1 }, { метал: 2 }), R('t', 'Y', 1, { метал: 1 }, { виріб: 1 })];
  assert.deepEqual(Object.keys(P.plan(rec, { виріб: 4 }).raw), ['руда']);
  const alt = P.plan(rec, { виріб: 4 }, { choose: { метал: 'b' } }); assert.deepEqual(Object.keys(alt.raw), ['лом']); near(alt.raw['лом'], 2);
  const ext = P.plan(rec, { виріб: 4 }, { raw: ['метал'] }); assert.deepEqual(Object.keys(ext.raw), ['метал']); near(ext.raw['метал'], 4);
});

test('цикл виявляється з зрозумілою помилкою', () => {
  const rec = [R('a', 'X', 1, { б: 1 }, { а: 1 }), R('b', 'X', 1, { а: 1 }, { б: 1 })];
  const r = P.plan(rec, { а: 1 }); assert.equal(r.ok, false); assert.match(r.error, /Цикл/);
  assert.equal(P.plan(rec, { а: 1 }, { raw: ['б'] }).ok, true);
});

test('кілька цілей і спільний проміжний ресурс складаються', () => {
  const r = P.plan(iron, { шестерня: 3, механізм: 3 }); assert.ok(r.ok);
  near(line(r, 'gear').runs, 3 + 3 * 2);
  near(P.plan(iron, { шестерня: 0 }).ok ? 1 : 0, 0);
});

test('потоки між вузлами сходяться: вхід кожного рецепта = виробництво виробника', () => {
  const r = P.plan(iron, { механізм: 5 });
  for (const l of r.lines) {
    const out = r.flows.filter(f => f.from === l.recipe.id).reduce((s, f) => s + f.rate, 0), made = Object.values(l.recipe.outputs)[0] * l.runs;
    near(out, made, 1e-9);
  }
});

test('maxRate і bottleneck', () => {
  const r = P.plan(iron, { механізм: 1 }), b = P.bottleneck(r);
  near(P.maxRate(iron, 'механізм', b.machines * 5), 5, 1e-9);
  assert.equal(b.recipe.id, 'smelt');
});

test('validate і текстові експорти', () => {
  assert.equal(P.validate(iron).length, 0);
  assert.ok(P.validate([R('x', 'B', 0, {}, { a: 1 })]).length >= 1);
  const r = P.plan(iron, { механізм: 6 }); assert.match(P.toText(r), /руда: 60/); assert.match(P.toCsv(r), /рецепт,будівля/);
});

test('сторінка: довідка, підказки й збереження у верхній панелі', () => {
  const html = require('fs').readFileSync(require('path').join(__dirname, '..', 'index.html'), 'utf8');
  assert.match(html, /Що це, для чого, як користуватися/);
  const header = html.slice(html.indexOf('<header'), html.indexOf('</header>'));
  for (const id of ['btnExample', 'btnCopyJson', 'btnImport', 'btnExport', 'btnCopy', 'btnCsv']) assert.ok(header.includes('id="' + id + '"'), id + ' має бути в шапці');
  for (const m of header.matchAll(/<button [^>]*id="(\w+)"[^>]*>/g)) assert.match(m[0], /title="/, 'підказка для ' + m[1]);
});

console.log(failed ? `\nПровалено: ${failed} з ${total}` : `\nУсі ${total} тестів пройдено`);
process.exit(failed ? 1 : 0);
