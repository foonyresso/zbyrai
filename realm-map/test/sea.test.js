// Морські шляхи: між портами, поблизу берега, повз лігва. Запуск: node realm-map/test/sea.test.js
const { R, assert, test, world, SAMPLES, finish } = require('./helpers.js');
console.log('Карта королівств: морські шляхи');
for (const params of SAMPLES) {
  const w = world(params), tag = `[${params.seed}/${params.worldType}] `, g = w.grid, pref = w.params.seaPrefMax;
  test(tag + 'шляхи йдуть лише морем і з’єднують порти', () => {
    for (const r of w.seaRoutes) { assert.ok(w.settlements[r.from].port && w.settlements[r.to].port); for (const c of r.cells) assert.equal(w.water[c], 1); assert.equal(r.cells[0], w.settlements[r.from].dock); assert.equal(r.cells[r.cells.length - 1], w.settlements[r.to].dock); }
  });
  test(tag + 'порти одного моря з’єднані шляхами', () => {
    const ports = w.settlements.filter(s => s.port), sc = R.Grid.components(g, i => w.water[i] === 1, true);
    const by = new Map(); for (const s of ports) { const id = sc.id[s.dock]; (by.get(id) || by.set(id, []).get(id)).push(s); }
    const par = new Map(ports.map(s => [s.id, s.id])); const find = x => { while (par.get(x) !== x) x = par.get(x); return x; };
    for (const r of w.seaRoutes) par.set(find(r.from), find(r.to));
    for (const list of by.values()) if (list.length > 1) { const root = find(list[0].id); const linked = list.filter(s => find(s.id) === root).length; assert.ok(linked >= list.length * 0.8, `з’єднано ${linked} з ${list.length}`); }
  });
  test(tag + 'шляхи не заходять у ядро лігва монстрів', () => {
    for (const r of w.seaRoutes) for (const l of w.lairs.filter(l => l.domain === 'sea')) { const inner = (l.radius + 1) * 0.45; let bad = 0; for (const c of r.cells) if (R.Grid.dist(g, c, l.cell) < inner) bad++; assert.ok(bad <= 2, `шлях проходить крізь лігво ${l.name}`); }
  });
}
test('шляхи тримаються біля берега: більшість комірок у смузі 2–4 км на материку', () => {
  const w = world(SAMPLES[0]); assert.ok(w.seaRoutes.length > 0); let hug = 0, tot = 0; for (const r of w.seaRoutes) for (const c of r.cells) { tot++; if (w.shore[c] <= w.params.seaPrefMax) hug++; }
  assert.ok(hug / tot > 0.75, 'біля берега лише ' + Math.round(hug / tot * 100) + '%');
});
test('смуга кораблів залежить від масштабу карти: 2 км/комірка → до 2 комірок, 4 км → до 1', () => {
  assert.equal(R.Params.normalize({ kmPerCell: 2 }).seaPrefMax, 2); assert.equal(R.Params.normalize({ kmPerCell: 4 }).seaPrefMax, 1);
});
finish();
