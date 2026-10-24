// Перевірка розкладки міста: 20 домів без накладань, всі двері й точки досяжні від брами, шлях ззовні до площі. Запуск: node settlement-sim/test/layout.test.js
const assert = require('node:assert'), path = require('node:path');
const root = path.join(__dirname, '..', '..');
require(path.join(root, 'mechanics/rng/index.js')); require(path.join(root, 'mechanics/pathgrid/index.js'));
const Layout = require(path.join(root, 'settlement-sim/layout.js'));
let failed = 0; const test = (n, f) => { try { f(); console.log('  ok  ', n); } catch (e) { failed++; console.log('  FAIL', n, '\n      ', e.message); } };
const L = Layout.build('test'), P = Mech.Pathgrid;
test('19 домів + дім старости = 20 осель', () => { assert.strictEqual(L.houses.length, 19); assert.ok(L.buildings.find(b => b.type === 'mayor')); });
test('будівлі не накладаються', () => {
  const rs = L.buildings.map(b => ({ b, x0: b.x - b.w / 2, x1: b.x + b.w / 2, y0: b.y - b.d, y1: b.y }));
  for (let i = 0; i < rs.length; i++) for (let j = i + 1; j < rs.length; j++) { const a = rs[i], c = rs[j]; assert.ok(a.x1 <= c.x0 || c.x1 <= a.x0 || a.y1 <= c.y0 || c.y1 <= a.y0, `${a.b.type}${a.b.id ?? ''} накладається на ${c.b.type}${c.b.id ?? ''}`); }
});
test('двері всіх будівель досяжні від брами', () => {
  for (const b of L.buildings) { const p = P.find(L.grid, 560, 720, b.door.x, b.door.y); assert.ok(p, 'немає шляху до ' + b.type + (b.id ?? '')); }
});
test('усі точки призначення досяжні', () => {
  for (const k in L.spots) for (const [x, y] of L.spots[k]) assert.ok(P.find(L.grid, 560, 720, x, y), `недосяжна точка ${k} ${x},${y}`);
});
test('ззовні (з трьох боків) можна дійти до площі лише через браму', () => {
  for (const [x, y] of [[8, 400], [1112, 400], [560, 790]]) { const p = P.find(L.grid, x, y, 560, 430); assert.ok(p, 'немає шляху'); const through = p.concat([[x, y]]).some(q => Math.abs(q[0] - 560) < 30 && q[1] > 640); assert.ok(through, 'шлях оминає браму'); }
});
console.log(failed ? `\n${failed} не пройдено` : '\nУсі перевірки пройдено'); process.exit(failed ? 1 : 0);
