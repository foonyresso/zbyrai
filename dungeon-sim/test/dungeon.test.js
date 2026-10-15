// Тести ядра симулятора підземель. Запуск: node dungeon-sim/test/dungeon.test.js
const assert = require('node:assert'), fs = require('node:fs'), path = require('node:path');
const C = require('../dungeon-core.js'), { T } = C;
let failed = 0;
const test = (n, f) => { try { f(); console.log('  ok  ', n); } catch (e) { failed++; console.log('  FAIL', n, '\n      ', e.message); } };

// зв'язність по плитках: від входу (центр першої кімнати) до всіх кімнат, ходячи підлогою, коридорами, дверима (таємні теж прохідні)
function reach(f) {
  const s = f.rooms[0], seen = new Uint8Array(f.w * f.h), st = [s.my * f.w + s.mx]; seen[st[0]] = 1;
  while (st.length) { const t = st.pop(), x = t % f.w, y = (t / f.w) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= f.w || ny >= f.h) continue; const n = ny * f.w + nx; if (!seen[n] && f.tiles[n] !== T.ROCK) { seen[n] = 1; st.push(n); } } }
  return seen;
}

test('детермінізм: те саме зерно дає те саме підземелля', () => {
  const a = C.generate({ seed: 'x1', rooms: 40, levels: 2 }), b = C.generate({ seed: 'x1', rooms: 40, levels: 2 }), c = C.generate({ seed: 'x2', rooms: 40, levels: 2 });
  assert.deepStrictEqual(Buffer.from(a.floors[0].tiles), Buffer.from(b.floors[0].tiles));
  assert.ok(!Buffer.from(a.floors[0].tiles).equals(Buffer.from(c.floors[0].tiles)));
});
test('кількість кімнат: від 3 до 300, сума по поверхах збігається', () => {
  for (const n of [3, 4, 10, 57, 100, 300]) for (const lv of [1, 2, 3]) { const d = C.generate({ seed: 's' + n, rooms: n, levels: lv }); assert.strictEqual(d.stats.rooms, d.params.rooms); assert.strictEqual(d.stats.floors, d.params.levels); }
  assert.strictEqual(C.normalize({ rooms: 9999 }).rooms, 300); assert.strictEqual(C.normalize({ rooms: 0 }).rooms, 24); assert.strictEqual(C.normalize({ rooms: 2 }).rooms, 3);
});
test('усі кімнати досяжні від входу, на кожному поверсі, у всіх стилях і режимах', () => {
  for (const style of ['brick', 'cave']) for (const branch of [0, 50, 100]) for (const rooms of [6, 30, 120]) {
    const d = C.generate({ seed: 'r' + branch + rooms, rooms, levels: 2, style, branch, loops: 60, secrets: 100 });
    for (const f of d.floors) { const seen = reach(f); for (const r of f.rooms) assert.ok(seen[r.my * f.w + r.mx], `недосяжна кімната ${r.id} (${style}/${branch}/${rooms})`); }
  }
});
test('кімнати не перекриваються й не виходять за поле', () => {
  const d = C.generate({ seed: 'ov', rooms: 150, style: 'brick' }), f = d.floors[0], own = new Map();
  for (const r of f.rooms) { assert.ok(r.x >= 0 && r.y >= 0 && r.x + r.w <= f.w && r.y + r.h <= f.h); for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) { const k = y * f.w + x; assert.ok(!own.has(k), 'перетин'); own.set(k, r.id); } }
});
test('двері стикуються: кожне ребро має по дверях з обох боків', () => {
  const d = C.generate({ seed: 'dr', rooms: 60, loops: 80, secrets: 100 }), f = d.floors[0];
  const total = f.rooms.reduce((s, r) => s + r.doors.length, 0);
  assert.strictEqual(total, f.edges.length * 2);
  for (const r of f.rooms) for (const [x, y, sec] of r.doors) assert.strictEqual(f.tiles[y * f.w + x], sec ? T.SECRET : T.DOOR);
});
test('таємні двері лише на глухих кінцях і петлях: видимий граф лишається зв’язним', () => {
  const d = C.generate({ seed: 'sc', rooms: 80, loops: 50, secrets: 100 }), f = d.floors[0];
  const vis = f.rooms.map(() => false); const adj = f.rooms.map(() => []); for (const e of f.edges) if (!e.secret) { adj[e.a].push(e.b); adj[e.b].push(e.a); }
  const st = [0]; vis[0] = true; while (st.length) { const i = st.pop(); for (const j of adj[i]) if (!vis[j]) { vis[j] = true; st.push(j); } }
  f.rooms.forEach((r, i) => { if (!r.secret) assert.ok(vis[i], 'відкрита кімната ' + i + ' втрачена'); });
});
test('сходи: вихід поверху збігається з входом наступного, останній поверх має фінал', () => {
  const d = C.generate({ seed: 'st', rooms: 40, levels: 3 });
  for (let i = 0; i < 2; i++) { const a = d.floors[i], b = d.floors[i + 1], ex = a.rooms[a.exit], en = b.rooms[0]; assert.strictEqual(ex.cx, en.cx); assert.strictEqual(ex.cy, en.cy); assert.strictEqual(a.tiles[ex.my * a.w + ex.mx], T.DOWN); assert.strictEqual(b.tiles[en.my * b.w + en.mx], T.UP); }
  assert.strictEqual(d.floors[2].rooms[d.floors[2].exit].role, 'boss');
});
test('вхід і фінал різні кімнати, фінал найдальший', () => {
  const f = C.generate({ seed: 'bo', rooms: 30 }).floors[0]; assert.notStrictEqual(f.exit, 0); assert.strictEqual(f.rooms[f.exit].dist, Math.max(...f.rooms.map(r => r.dist)));
});
test('режим «розгалуження» міняє форму: 0 дає довші ходи, ніж 100', () => {
  const depth = b => { let s = 0; for (let i = 0; i < 10; i++) s += Math.max(...C.generate({ seed: 'd' + i, rooms: 40, branch: b, loops: 0 }).floors[0].rooms.map(r => r.dist)); return s; };
  assert.ok(depth(0) > depth(100));
});
test('пастки на вільних плитках; 0% = без пасток', () => {
  assert.strictEqual(C.generate({ seed: 'tp', rooms: 40, traps: 0 }).stats.traps, 0);
  const d = C.generate({ seed: 'tp', rooms: 40, traps: 100 }), f = d.floors[0]; assert.ok(f.traps.length > 0);
  for (const t of f.traps) assert.ok(f.tiles[t.y * f.w + t.x] === T.CORR || f.tiles[t.y * f.w + t.x] === T.FLOOR);
});
test('типи підземель з Атласу: усі генеруються й узгоджені з межами типу', () => {
  assert.strictEqual(C.types.length, fs.readdirSync(path.join(__dirname, '..', '..', 'medieval-world', 'dungeons')).filter(n => n.endsWith('.js')).length, 'dungeon-types.js застарів: node tools/build-dungeon-types.mjs');
  for (const ty of C.types) for (let i = 0; i < 4; i++) {
    const p = C.applyType({ seed: 'ty' + i }, ty.id, C.rng('t' + i)), d = C.generate(p);
    assert.ok(p.rooms >= ty.rooms[0] && p.rooms <= ty.rooms[1], ty.id + ' кімнат'); assert.ok(p.levels >= Math.min(ty.levels[0], Math.floor(p.rooms / 2)) && p.levels <= ty.levels[1], ty.id + ' рівнів');
    assert.strictEqual(p.danger, ty.danger); assert.strictEqual(d.type.id, ty.id);
    const kinds = new Set(d.floors.flatMap(f => f.rooms).filter(r => r.monsters).map(r => r.monsters.kind)); for (const k of kinds) assert.ok(ty.inhabitants.includes(k), ty.id + ' чужий мешканець ' + k);
  }
});
test('JSON: збереження й відновлення дають те саме; сміття нормалізується', () => {
  const p = C.randomize({}, {}, C.rng('rz')); assert.deepStrictEqual(C.fromJSON(C.toJSON(p)), p);
  const bad = C.fromJSON('{"rooms":"abc","levels":99,"style":"zzz","type":"nope","danger":77,"traps":-5}'); assert.strictEqual(bad.style, 'brick'); assert.strictEqual(bad.type, ''); assert.ok(bad.levels <= 6 && bad.danger === 5 && bad.traps === 0);
  C.generate(bad);
});
test('замочок типу: рандом лишає тип', () => {
  const p = C.applyType({}, 'sewer', C.rng('a')); for (let i = 0; i < 20; i++) assert.strictEqual(C.randomize(p, { type: true }, C.rng('r' + i)).type, 'sewer');
});
test('швидкість: 300 кімнат менше ніж за 400 мс', () => { const t = Date.now(); C.generate({ seed: 'perf', rooms: 300, levels: 2 }); assert.ok(Date.now() - t < 400); });
console.log(failed ? `\n${failed} не пройдено` : '\nУсі перевірки пройдено'); process.exit(failed ? 1 : 0);
