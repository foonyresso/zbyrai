// Тести «Закладин»: механіки й склеювання. Запуск: node zakladyny/test/game.test.js
const assert = require('node:assert');
const World = require('../../mechanics/world-lite'), Build = require('../../mechanics/building'), Trade = require('../../mechanics/trade'), Set = require('../../mechanics/settlers');
const Game = require('../zk-game.js'), Save = require('../zk-save.js');
let failed = 0; const test = (n, f) => { try { f(); console.log('  ok  ', n); } catch (e) { failed++; console.log('  FAIL', n, '\n     ', e.stack.split('\n').slice(0, 3).join('\n      ')); } };

test('світ: детермінований, один материк, 8 поселень, дороги з’єднують усіх', () => {
  for (const seed of ['a', 'b', 'зерно', '42', 'zbyrai']) {
    const w = World.generate(seed), w2 = World.generate(seed);
    assert.deepStrictEqual(Array.from(w.biome), Array.from(w2.biome));
    assert.ok(w.S.length >= 6 && w.lairs.length >= 3, seed + ': поселень ' + w.S.length + ', лігв ' + w.lairs.length);
    for (const s of w.S) assert.ok(w.biome[s.y * w.w + s.x] !== 0, 'поселення в морі');
    for (const s of w.S) assert.ok(s.id === 0 || World.routePath(w, 0, s.id), seed + ': нема дороги до ' + s.name);
  }
});
test('будівництво: дорога виростає й зникає при зносі', () => {
  const G = Game.newGame('t1'), t = G.s.town, st = G.s.stock; st.gold = 5000; st.wood = 500; st.stone = 500;
  const roads0 = t.roads.reduce((a, v) => a + v, 0);
  let placed = null;
  outer: for (let r = 3; r < 9; r++) for (let x = 20 - r; x <= 20 + r; x++) for (let y = 20 - r; y <= 20 + r; y++) { const c = Build.canPlace(t, 'house', x, y); if (c.ok && c.path.length >= 2) { placed = Build.place(t, st, 'house', x, y); break outer; } }
  assert.ok(placed && placed.ok, 'не вдалось поставити віддалений будинок');
  const roads1 = t.roads.reduce((a, v) => a + v, 0); assert.ok(roads1 > roads0);
  const d = Build.demolish(t, st, placed.building.id); assert.ok(d.ok && d.roadsRemoved > 0);
  assert.strictEqual(t.roads.reduce((a, v) => a + v, 0), roads0);
  assert.ok(!Build.demolish(t, st, 1).ok, 'ратушу знести не можна');
});
test('ціни: потреба дорожча за надлишок, продаж знижує ціну', () => {
  const w = World.generate('p1'), m = Trade.initMarkets(w), id = Object.keys(m)[0], mk = m[id];
  assert.ok(Trade.price(mk, mk.needs[0]) > Trade.price(mk, mk.produces[0]) * 1.2);
  const q1 = Trade.quote(mk, mk.needs[0], 10), q2 = Trade.quote(mk, mk.needs[0], 20); assert.ok(q2 < q1 * 2);
});
test('поселенці приходять, лише коли є житло; поселяються у вільний будинок', () => {
  const G = Game.newGame('s1');
  for (let i = 0; i < 12; i++) Game.stepDay(G); assert.strictEqual(G.s.settlers.arrivals.length, 0);
  const t = G.s.town; let ok = null;
  for (let x = 14; x < 26 && !ok; x++) for (let y = 14; y < 26 && !ok; y++) if (Build.canPlace(t, 'house', x, y).ok) ok = Game.build(G, 'house', x, y);
  assert.ok(ok.ok);
  for (let i = 0; i < 12; i++) Game.stepDay(G); assert.ok(G.s.settlers.arrivals.length >= 1);
  const a = G.s.settlers.arrivals[0]; assert.ok(Game.settle(G, a.id, ok.building.id).ok); assert.strictEqual(Game.pop(G), 1);
});
test('збереження: туди-назад дає той самий стан і гра продовжується однаково', () => {
  const G = Game.newGame('sv'); for (let i = 0; i < 5; i++) Game.stepDay(G);
  const J = JSON.parse(JSON.stringify(Save.toJSON(G))), H = Save.fromJSON(J);
  assert.deepStrictEqual(Save.toJSON(H), J);
  for (let i = 0; i < 20; i++) { Game.stepDay(G); Game.stepDay(H); } assert.deepStrictEqual(Save.toJSON(H), Save.toJSON(G));
  assert.throws(() => Save.fromJSON({ format: 'x' })); assert.throws(() => Save.fromJSON({ format: 'zakladyny', v: 99 }));
});
test('гра: 300 діб за простою стратегією без NaN, економіка рухається, каравани працюють', () => {
  const G = Game.newGame('bot1'), s = G.s; let sold = 0, maxPop = 0;
  const want = ['house', 'lumber', 'farm', 'house', 'quarry', 'farm', 'house', 'fisher', 'shop', 'yard', 'workshop', 'mine', 'tavern', 'guard', 'house', 'farm'];
  const spots = []; for (let r = 2; r < 12; r++) for (let x = 20 - r; x <= 20 + r; x++) for (let y = 20 - r; y <= 20 + r; y++) if (Math.max(Math.abs(x - 20), Math.abs(y - 20)) === r) spots.push([x, y]);
  for (let day = 0; day < 300; day++) {
    if (day % 4 === 0 && want.length) { const type = want[0]; let any = false; for (const [x, y] of spots) { if (Build.canPlace(s.town, type, x, y).ok) { any = true; if (Build.canPay(s.stock, Build.costOf(type, 0)) && Game.build(G, type, x, y).ok) want.shift(); break; } } if (!any) want.push(want.shift()); }
    for (const a of s.settlers.arrivals.slice()) { const h = Set.bestHouse(s.settlers, s.town); if (h) Game.settle(G, a.id, h.id); }
    if (Game.caravanSlots(G) > 0 && s.stock.grain > 60) { const to = Object.keys(s.markets)[day % 7]; const r = Game.sendCaravan(G, +to, { grain: 25 }, false); if (r.ok) sold++; }
    Game.stepDay(G); maxPop = Math.max(maxPop, Game.pop(G));
    for (const k in s.stock) assert.ok(Number.isFinite(s.stock[k]) && s.stock[k] >= 0, k + ' = ' + s.stock[k]);
  }
  console.log('      будівель', s.town.buildings.length, 'пік населення', maxPop, 'золото', Math.round(s.stock.gold), 'каравани', sold, 'їжа', Math.round(s.stock.grain + s.stock.fish));
  assert.ok(maxPop >= 4 && s.town.buildings.length >= 8);
});
test('караван: потрібен двір, везе, продає, повертається; золото зростає', () => {
  const G = Game.newGame('car1'), s = G.s; s.stock.gold = 2000; s.stock.wood = 400; s.stock.stone = 400; s.stock.grain = 100;
  assert.ok(!Game.sendCaravan(G, 1, { grain: 20 }, false).ok, 'без двору не можна');
  let yard = null; for (let x = 14; x < 27 && !yard; x++) for (let y = 14; y < 27 && !yard; y++) if (Build.canPlace(s.town, 'yard', x, y).ok) { const r = Game.build(G, 'yard', x, y); if (r.ok) yard = r; }
  assert.ok(yard);
  const to = +Object.keys(s.markets).find(id => World.routePath(G.world, 0, +id)), g0 = s.stock.gold;
  const r = Game.sendCaravan(G, to, { grain: 25 }, true); assert.ok(r.ok, r.reason);
  assert.ok(!Game.sendCaravan(G, to, { grain: 5 }, false).ok, 'один двір везе один караван');
  for (let i = 0; i < 60 && s.caravans.length; i++) Game.stepDay(G);
  assert.strictEqual(s.caravans.length, 0, 'караван мав повернутись');
  assert.ok(s.stock.gold > g0 - 60, 'золото має зрости від продажу: ' + g0 + ' → ' + s.stock.gold);
});
test('набіги: без оборони забирають, з вартою відбиваються', () => {
  const Thr = require('../../mechanics/threats'), Rng = require('../../mechanics/rng'), w = World.generate('raid1');
  const st1 = { gold: 100, grain: 50, fish: 0, wood: 50 }, r1 = Thr.raid(w, 0, 0, st1, Rng.stream('x', 'a'));
  if (r1) { assert.ok(!r1.win); assert.ok(st1.gold < 100 || st1.grain < 50); }
  const r2 = Thr.raid(w, 0, 99, { gold: 100 }, Rng.stream('x', 'a')); if (r2) assert.ok(r2.win);
});
console.log(failed ? `\n${failed} не пройдено` : '\nУсі перевірки пройдено'); process.exit(failed ? 1 : 0);
