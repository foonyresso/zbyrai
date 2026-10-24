// Перевірка механік, що використовує «Симуляція поселення»: needs, schedule, combat, spawner, pathgrid. Запуск: node settlement-sim/test/mechanics.test.js
const assert = require('node:assert'), path = require('node:path'), root = path.join(__dirname, '..', '..');
for (const m of ['rng', 'needs', 'schedule', 'combat', 'spawner', 'pathgrid']) require(path.join(root, 'mechanics', m, 'index.js'));
let failed = 0; const test = (n, f) => { try { f(); console.log('  ok  ', n); } catch (e) { failed++; console.log('  FAIL', n, '\n      ', e.message); } };
const { Needs, Schedule, Combat, Spawner, Pathgrid } = Mech, R = Mech.Rng.stream('t', 'x');
test('потреби: сон відновлює сили, робота витрачає', () => { const n = { energy: .5, hunger: .5, social: .5, fun: .5 }; Needs.tick(n, 'sleep', 2); assert.ok(n.energy > .7); Needs.tick(n, 'work', 2); assert.ok(n.energy < .8); });
test('розклад: вночі спати, вдень працювати, при голоді їсти', () => {
  const ok = { energy: .9, hunger: .9, social: .9, fun: .9 };
  assert.strictEqual(Schedule.choose({ ...ok, energy: .5 }, 23, R), 'sleep'); assert.strictEqual(Schedule.choose(ok, 10, R), 'work');
  assert.strictEqual(Schedule.choose({ ...ok, hunger: .2 }, 10, R), 'eat'); assert.strictEqual(Schedule.choose({ ...ok, energy: .1 }, 14, R), 'sleep');
});
test('розклад: вночі не прокидаються до 5:30', () => { assert.strictEqual(Schedule.shouldWake({ energy: 1 }, 3), false); assert.strictEqual(Schedule.shouldWake({ energy: 1 }, 6), true); });
test('бій: удар, лікування, найближча ціль', () => {
  const a = { ...Combat.make('knight', 'd'), x: 0, y: 0 }, m = { ...Combat.make('goblin', 'm'), x: 5, y: 0 };
  assert.strictEqual(Combat.nearest(a, [a, m], 50), m); assert.ok(Combat.hit(m, 100).dead); assert.strictEqual(Combat.nearest(a, [m], 50), null);
  a.hp = 10; Combat.heal(a, 999); assert.strictEqual(a.hp, a.max);
});
test('спавнер: хвилі приходять і детерміновані', () => {
  const run = () => { const st = Spawner.create('s'); let n = []; for (let t = 0; t < 400; t++) n = n.concat(Spawner.tick(st, 1, { day: 1, alive: 0 })); return n.map(o => o.kind + o.side).join(); };
  assert.ok(run().length > 0); assert.strictEqual(run(), run());
});
test('шлях: оминає стіну, неможливий не знайдено', () => {
  const g = Pathgrid.create(400, 300, 8); Pathgrid.blockRect(g, 100, 50, 140, 250);
  const p = Pathgrid.find(g, 20, 150, 300, 150); assert.ok(p && p.length >= 2);
  Pathgrid.blockRect(g, 100, 0, 140, 300); assert.strictEqual(Pathgrid.find(g, 20, 150, 300, 150), null);
});
console.log(failed ? `\n${failed} не пройдено` : '\nУсі перевірки пройдено'); process.exit(failed ? 1 : 0);
