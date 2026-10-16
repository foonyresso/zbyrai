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
  for (const r of f.rooms) for (const [x, y, sec] of r.doors) { const t = f.tiles[y * f.w + x]; if (sec) assert.strictEqual(t, T.SECRET); else assert.ok(t === T.DOOR || t === T.FLOOR || t === T.CORR, 'порожній вихід'); }
});
test('частка коридорів: 0 = усе впритул, 100 = усі зв’язки дерева коридори, типово 5-10%', () => {
  const cnt = c => { const m = { tunnel: 0, direct: 0 }; for (let i = 0; i < 8; i++) { const L = C.generate({ seed: 'lk' + i, rooms: 60, corr: c, loops: 0 }).stats.links; for (const k in L) m[k] += L[k]; } return m; };
  const z = cnt(0), f = cnt(100), mid = cnt(30), def = cnt(C.defaults().corr);
  assert.strictEqual(z.tunnel, 0); assert.ok(z.direct > 0); assert.strictEqual(f.direct, 0); assert.ok(mid.tunnel > 0 && mid.direct > 0);
  const share = def.tunnel / (def.tunnel + def.direct); assert.ok(share > .02 && share < .16, 'типова частка ' + share);
});
test('без коридорів кімнати впритул: між сусідніми з проходом рівно одна стіна', () => {
  const f = C.generate({ seed: 'flush', rooms: 60, corr: 0 }).floors[0];
  for (const e of f.edges) { const A = f.rooms[e.a], B = f.rooms[e.b], gx = Math.max(A.x - (B.x + B.w), B.x - (A.x + A.w)), gy = Math.max(A.y - (B.y + B.h), B.y - (A.y + A.h)); assert.strictEqual(Math.max(gx, gy), 1, 'зазор між зв’язаними кімнатами'); }
});
test('коридор відсуває кімнату: зазор дорівнює довжині ходу, решта групи щільна', () => {
  const f = C.generate({ seed: 'gap', rooms: 60, corr: 15 }).floors[0]; let t = 0, d = 0;
  for (const e of f.edges) { const A = f.rooms[e.a], B = f.rooms[e.b], g = Math.max(A.x - (B.x + B.w), B.x - (A.x + A.w), A.y - (B.y + B.h), B.y - (A.y + A.h)); if (e.kind === 'tunnel') { t++; assert.ok(g >= 3, 'короткий коридор ' + g); } else { d++; assert.strictEqual(g, 1); } }
  assert.ok(t > 0 && d > t);
});
test('довжина коридорів: більше значення дає довші проміжки', () => {
  const len = l => { let s = 0; for (let i = 0; i < 6; i++) { const d = C.generate({ seed: 'ln' + i, rooms: 40, corr: 100, corrLen: l }); s += d.stats.corridors / d.stats.rooms; } return s; };
  assert.ok(len(100) > len(0) * 1.5, len(0) + ' ' + len(100));
});
test('розкид довжини: 0 дає однакові коридори, 100 дуже різні; усе досяжне', () => {
  const sd = v => { const L = []; for (let i = 0; i < 6; i++) for (const e of C.generate({ seed: 'vr' + i, rooms: 60, corr: 100, corrVar: v, corrLen: 30, loops: 0 }).floors[0].edges) { const A = 0; L.push(e.path.length); } const m = L.reduce((a, b) => a + b) / L.length; return Math.sqrt(L.reduce((a, b) => a + (b - m) ** 2, 0) / L.length); };
  assert.ok(sd(100) > sd(0) + 2, sd(0) + ' ' + sd(100));
  for (const v of [0, 50, 100]) for (const l of [0, 100]) { const d = C.generate({ seed: 'vv' + v, rooms: 120, levels: 2, corrVar: v, corrLen: l, corr: 30 }); for (const f of d.floors) { const seen = reach(f); for (const r of f.rooms) assert.ok(seen[r.my * f.w + r.mx], 'недосяжна'); } }
});
test('прямий прохід: кімнати стоять впритул через стіну з прорізом', () => {
  const f = C.generate({ seed: 'dp', rooms: 80, corr: 0, loops: 80 }).floors[0]; let n = 0;
  for (const e of f.edges) if (e.kind === 'direct') { n++; const A = f.rooms[e.a], B = f.rooms[e.b]; assert.ok(A.doors.length && B.doors.length); assert.ok(Math.abs(A.mx - B.mx) + Math.abs(A.my - B.my) < 25); }
  assert.ok(n > 5);
});
test('форми кімнат різні, центр завжди підлога', () => {
  const shapes = new Set(); for (const style of ['brick', 'cave']) for (let i = 0; i < 6; i++) for (const r of C.generate({ seed: 'sh' + i, rooms: 80, style }).floors[0].rooms) { shapes.add(r.shape); assert.ok(r.w >= 4 && r.h >= 4); }
  assert.ok(shapes.size >= 5, [...shapes].join());
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
    const kinds = new Set(d.floors.flatMap(f => f.rooms).filter(r => r.monsters).map(r => r.monsters.name)); for (const k of kinds) assert.ok(ty.inhabitants.includes(k), ty.id + ' чужий мешканець ' + k);
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

// монстри читаються з файлів medieval-world/monsters/*.js без вставки в код (так само, як у браузері)
const vm = require('node:vm'), MDIR = path.join(__dirname, '..', '..', 'medieval-world', 'monsters');
const loadMonsters = () => fs.readdirSync(MDIR).filter(n => n.endsWith('.js')).map(f => { let m; vm.runInNewContext(fs.readFileSync(path.join(MDIR, f), 'utf8'), { Atlas: { registerMonster: x => { m = x; } } }); return m; });
test('монстри з бази світів: усі в підземеллі існують у папці, лише дозволені біоми й рівні', () => {
  const list = loadMonsters(); assert.ok(list.length > 100); C.setMonsters(list);
  const ids = new Set(list.map(m => m.id));
  for (const ty of C.types) { const d = C.generate(C.applyType({ seed: 'mm' }, ty.id, C.rng('m'))); let n = 0;
    for (const r of d.floors.flatMap(f => f.rooms)) if (r.monsters) { n++; if (r.monsters.id) { assert.ok(ids.has(r.monsters.id)); const m = list.find(x => x.id === r.monsters.id); assert.ok(!(m.spawn.biomes || []).every(b => b === 'deep')); } }
    assert.ok(n > 0, ty.id + ' без істот'); const boss = d.floors.at(-1).rooms.find(r => r.role === 'boss'); assert.ok(boss.monsters && boss.monsters.boss); }
});
test('нові монстри підхоплюються без правок коду; структура від них не залежить', () => {
  const base = loadMonsters(), a = C.generate({ seed: 'z', rooms: 30 }); C.setMonsters(base);
  const fake = { format: 2, id: 'zz-test-monster', name: 'Тестовий звір', kind: 'monster', nature: 'threat', spawn: { biomes: ['deep2'], worlds: 'all' }, lore: { description: 'x' } };
  C.setMonsters(base.filter(m => m.kind !== 'monster' && m.kind !== 'weak').concat(fake));
  const b = C.generate({ seed: 'z', rooms: 30 });
  assert.ok(b.floors[0].rooms.some(r => r.monsters && r.monsters.id === 'zz-test-monster'));
  assert.ok(Buffer.from(a.floors[0].tiles).equals(Buffer.from(b.floors[0].tiles)), 'розкладка залежить від бази монстрів');
  C.setMonsters(base);
});
test('особливості кімнат: у кожного типу свій набір, значення 0 і 100 працюють', () => {
  const sets = new Set(C.types.map(t => Object.keys(C.tagDefaults(t.id)).sort().join())); assert.ok(sets.size >= 15, 'мало різних наборів');
  for (const t of C.types) for (const k of Object.keys(C.tagDefaults(t.id))) assert.ok(C.TAGS[k], t.id + ' невідома особливість ' + k);
  const p = C.applyType({ seed: 'tg' }, 'sewer', C.rng('x')); p.opts.flooded = 100;
  const all = C.generate(p).floors.flatMap(f => f.rooms).filter(r => r.role !== 'start' && r.role !== 'boss' && r.role !== 'down'); assert.ok(all.every(r => r.tags.includes('flooded')));
  p.opts.flooded = 0; assert.ok(C.generate(p).floors.flatMap(f => f.rooms).every(r => !r.tags.includes('flooded')));
  assert.deepStrictEqual(Object.keys(C.normalize({ type: 'crypt', opts: { zzz: 5, tombs: 500 } }).opts).sort(), ['altar', 'tombs', 'webs']); assert.strictEqual(C.normalize({ type: 'crypt', opts: { tombs: 500 } }).opts.tombs, 100);
});
test('щільність істот і здобич керують кількістю', () => {
  const n = (k, v) => C.generate({ seed: 'dn', rooms: 80, [k]: v }).stats[k === 'mon' ? 'monsters' : 'loot'];
  assert.ok(n('mon', 100) > n('mon', 0)); assert.ok(n('loot', 100) > n('loot', 0));
});
// види кімнат читаються з файлів dungeon-sim/room-kinds/*.js (так само, як у браузері)
const KDIR = path.join(__dirname, '..', 'room-kinds');
const loadKinds = () => fs.readdirSync(KDIR).filter(n => n.endsWith('.js') && n !== 'manifest.js').flatMap(f => { let out = []; vm.runInNewContext(fs.readFileSync(path.join(KDIR, f), 'utf8'), { DungeonRooms: { register: a => { out = a; } } }); return out; });
test('види кімнат: файли коректні, посилаються на існуючі типи й особливості', () => {
  const kinds = loadKinds(), ids = new Set(C.types.map(t => t.id)), roles = ['start', 'boss', 'hub', 'room', 'dead', 'secret'], seen = new Set();
  assert.ok(kinds.length >= 150, 'мало видів кімнат: ' + kinds.length);
  for (const k of kinds) { assert.ok(!seen.has(k.id), 'дубль ' + k.id); seen.add(k.id); assert.ok(k.name && k.desc, k.id); for (const r of k.roles) assert.ok(roles.includes(r), k.id + ' роль ' + r); for (const t of k.types) assert.ok(t === '*' || ids.has(t), k.id + ' тип ' + t); for (const t of k.tags || []) assert.ok(C.TAGS[t], k.id + ' особливість ' + t); }
  for (const t of C.types) for (const role of ['room', 'hub', 'dead']) assert.ok(kinds.some(k => k.roles.includes(role) && (k.types.includes(t.id) || k.types.includes('*'))), t.id + ' без ' + role);
});
test('види кімнат: імена залежать від типу підземелля й різноманітні', () => {
  C.setRoomKinds(loadKinds());
  const names = id => { const s = new Set(); for (let i = 0; i < 4; i++) for (const r of C.generate(C.applyType({ seed: 'rk' + i, rooms: 40 }, id, C.rng('r' + i))).floors[0].rooms) s.add(r.name); return s; };
  const crypt = names('crypt'), mine = names('mine'), sewer = names('sewer');
  assert.ok(crypt.size >= 12 && mine.size >= 12, crypt.size + ' ' + mine.size);
  assert.ok([...crypt].some(n => /склеп|сарк|кост|могил|усипальн/i.test(n)), 'у склепі немає склепових кімнат');
  assert.ok([...mine].some(n => /штольн|шахт|руд|забій|штрек/i.test(n)), 'у шахті немає шахтних');
  assert.ok([...sewer].some(n => /тунел|шлюз|цистерн|стоків|басейн|причал/i.test(n)), 'у каналізації немає водних');
  const d = C.generate({ seed: 'rk', rooms: 30 }); assert.ok(d.floors[0].rooms.every(r => r.name));
  C.setRoomKinds([]);
});
test('нові типи підземель із файлів Атласу: поле sim задає особливості, коридори й стиль', () => {
  assert.ok(C.types.length >= 40);
  for (const id of ['prison', 'dragon-lair', 'frost-cave', 'sunken-library', 'sand-tomb']) { const t = C.typeById(id); assert.ok(t && t.sim, id); assert.deepStrictEqual(C.tagDefaults(id), t.sim.tags); assert.strictEqual(C.corrDefault(id), t.sim.corr); }
  assert.strictEqual(C.applyType({}, 'dragon-lair', C.rng('x')).style, 'cave'); assert.strictEqual(C.applyType({}, 'prison', C.rng('x')).style, 'brick');
});
test('швидкість: 300 кімнат менше ніж за 400 мс', () => { const t = Date.now(); C.generate({ seed: 'perf', rooms: 300, levels: 2 }); assert.ok(Date.now() - t < 400); });
console.log(failed ? `\n${failed} не пройдено` : '\nУсі перевірки пройдено'); process.exit(failed ? 1 : 0);
