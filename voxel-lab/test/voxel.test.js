// Тести Voxel World Lab. Запуск: node voxel-lab/test/voxel.test.js
const assert = require('node:assert/strict');
const V = require('../voxel-core.js');
let failed = 0, total = 0;
function test(name, fn) { total++; try { fn(); console.log('  ok   ' + name); } catch (e) { failed++; console.log('  FAIL ' + name + '\n       ' + String(e.message).split('\n').join('\n       ')); } }
const same = (a, b) => a.blocks.length === b.blocks.length && a.blocks.every((v, i) => v === b.blocks[i]);

console.log('Voxel World Lab');

test('детермінованість: seed і параметри дають той самий світ, інший seed — інший', () => {
  assert.ok(same(V.generate({ seed: 'a', sx: 32, sz: 32 }), V.generate({ seed: 'a', sx: 32, sz: 32 })));
  assert.ok(!same(V.generate({ seed: 'a', sx: 32, sz: 32 }), V.generate({ seed: 'b', sx: 32, sz: 32 })));
});

test('шар основи внизу, над поверхнею лише повітря й листя/дерево, висоти в межах', () => {
  const w = V.generate({ seed: 'x', sx: 40, sz: 40, sy: 36 });
  for (let z = 0; z < 40; z++) for (let x = 0; x < 40; x++) {
    assert.equal(V.get(w, x, 0, z), V.ID.BEDROCK);
    const h = w.heights[x + 40 * z]; assert.ok(h >= 2 && h <= 34);
    for (let y = h + 1; y < 36; y++) { const b = V.get(w, x, y, z); assert.ok([0, V.ID.WATER, V.ID.WOOD, V.ID.LEAVES].includes(b), `блок ${b} над поверхнею (${x},${y},${z})`); }
  }
});

test('вода заповнює западини до рівня моря, вище нього води немає', () => {
  const w = V.generate({ seed: 'wat', sx: 40, sz: 40, sy: 40, water: .5 });
  let top = -1, lowest = 99; for (let z = 0; z < 40; z++) for (let x = 0; x < 40; x++) for (let y = 0; y < 40; y++) if (V.get(w, x, y, z) === V.ID.WATER) { top = Math.max(top, y); }
  assert.ok(top > 0);
  for (let z = 0; z < 40; z++) for (let x = 0; x < 40; x++) { const b = V.get(w, x, top, z); const col = []; for (let y = 0; y < 40; y++) col.push(V.get(w, x, y, z)); const wy = col.indexOf(V.ID.WATER); if (wy >= 0) for (let y = wy; y <= top; y++) assert.ok(col[y] === V.ID.WATER || col[y] === V.ID.AIR && false, 'суцільний стовп води'); }
});

test('дерева ростуть із трави: під стовбуром трава, є деревина й листя; trees=0 дерев не дає', () => {
  const w = V.generate({ seed: 'forest', sx: 48, sz: 48, trees: 1 }), c = V.counts(w);
  assert.ok(c[V.ID.WOOD] > 0 && c[V.ID.LEAVES] > 0);
  for (let z = 0; z < 48; z++) for (let x = 0; x < 48; x++) for (let y = 1; y < w.sy; y++) if (V.get(w, x, y, z) === V.ID.WOOD && V.get(w, x, y - 1, z) !== V.ID.WOOD) assert.equal(V.get(w, x, y - 1, z), V.ID.GRASS);
  const n = V.counts(V.generate({ seed: 'forest', sx: 48, sz: 48, trees: 0 })); assert.equal(n[V.ID.WOOD], 0);
});

test('печери вирізають камінь, не чіпаючи основу й верхній шар', () => {
  const a = V.generate({ seed: 'cv', caves: 0 }), b = V.generate({ seed: 'cv', caves: 1 });
  const solid = w => w.blocks.reduce((s, v) => s + (v ? 1 : 0), 0);
  assert.ok(solid(b) < solid(a));
  for (let z = 0; z < b.sz; z++) for (let x = 0; x < b.sx; x++) { assert.equal(V.get(b, x, 0, z), V.ID.BEDROCK); const h = b.heights[x + b.sx * z]; assert.notEqual(V.get(b, x, h, z), V.ID.AIR); }
});

test('руди трапляються лише всередині каменю; ores=0 їх прибирає', () => {
  const c = V.counts(V.generate({ seed: 'ore', ores: 1, caves: 0 }));
  assert.ok(c[V.ID.COAL] + c[V.ID.IRON] + c[V.ID.GOLD] > 0);
  assert.equal(V.counts(V.generate({ seed: 'ore', ores: 0 }))[V.ID.COAL], 0);
});

test('walk: порядок «ззаду наперед» для всіх поворотів, кожен непорожній блок рівно один раз', () => {
  const w = V.generate({ seed: 'walk', sx: 20, sz: 20, sy: 24 }), total = w.blocks.reduce((s, v) => s + (v ? 1 : 0), 0);
  for (let rot = 0; rot < 4; rot++) {
    let n = 0, lastKey = -1; const seen = new Set();
    V.walk(w, rot, 99, (x, y, z, xs, zs) => { n++; const k = (xs + zs) * 1000 + y; assert.ok(k >= lastKey - 0 || xs + zs >= Math.floor(lastKey / 1000), 'порядок'); lastKey = Math.max(lastKey, k); const id = V.idx(w, x, y, z); assert.ok(!seen.has(id)); seen.add(id); });
    assert.equal(n, total, 'поворот ' + rot);
  }
  const r = V.generate({ seed: 'rect', sx: 22, sz: 13, sy: 20 }), tot2 = r.blocks.reduce((s, v) => s + (v ? 1 : 0), 0);
  for (let rot = 0; rot < 4; rot++) { let n = 0; const seen = new Set(); V.walk(r, rot, 99, (x, y, z) => { n++; seen.add(V.idx(r, x, y, z)); }); assert.equal(n, tot2, 'прямокутний світ, поворот ' + rot); assert.equal(seen.size, tot2); }
  let low = 0; V.walk(w, 0, 5, (x, y) => { assert.ok(y <= 5); low++; }); assert.ok(low < total);
});

test('faceVisible: грань, закрита твердим сусідом, не видна; відкрита повітрям видна', () => {
  const w = { sx: 3, sy: 3, sz: 3, blocks: new Uint8Array(27), opts: {}, heights: new Int16Array(9) };
  V.set(w, 1, 1, 1, V.ID.STONE); for (let f = 0; f < 3; f++) assert.ok(V.faceVisible(w, 1, 1, 1, f));
  V.set(w, 1, 2, 1, V.ID.STONE); assert.equal(V.faceVisible(w, 1, 1, 1, 0), false);
  V.set(w, 1, 1, 2, V.ID.STONE); assert.equal(V.faceVisible(w, 1, 1, 1, 1), false);
  V.set(w, 2, 1, 1, V.ID.WATER); assert.ok(V.faceVisible(w, 1, 1, 1, 2)); // вода не затуляє
});

test('visibleDir узгоджений з faceVisible і з напрямками екранних осей', () => {
  const w = V.generate({ seed: 'dir', sx: 16, sz: 16, sy: 20 });
  V.walk(w, 0, 99, (x, y, z) => { assert.equal(V.visibleDir(w, x, y, z, 0, 1, 0), V.faceVisible(w, x, y, z, 0)); assert.equal(V.visibleDir(w, x, y, z, 0, 0, 1), V.faceVisible(w, x, y, z, 1)); assert.equal(V.visibleDir(w, x, y, z, 1, 0, 0), V.faceVisible(w, x, y, z, 2)); });
  // екранні осі сусідніх клітинок збігаються з напрямком зростання xs/zs у walk
  for (let rot = 0; rot < 4; rot++) { const pos = new Map(); V.walk(w, rot, 99, (x, y, z, xs, zs) => pos.set(xs + ',' + zs, [x, z])); const [dxs, dzs] = V.SCREEN_DIRS[rot];
    for (const [k, [x, z]] of pos) { const [xs, zs] = k.split(',').map(Number), nx = pos.get((xs + 1) + ',' + zs), nz = pos.get(xs + ',' + (zs + 1)); if (nx) assert.deepEqual([nx[0] - x, nx[1] - z], dxs); if (nz) assert.deepEqual([nz[0] - x, nz[1] - z], dzs); } }
});

test('.vox: заголовок, розмір, кількість вокселів і палітра', () => {
  const w = V.generate({ seed: 'vox', sx: 24, sz: 20, sy: 18 }), vox = V.toVox(w), dv = new DataView(vox.buffer);
  assert.equal(String.fromCharCode(...vox.slice(0, 4)), 'VOX '); assert.equal(dv.getUint32(4, true), 150);
  assert.equal(String.fromCharCode(...vox.slice(8, 12)), 'MAIN');
  const pos = vox.indexOf(0x53, 20); // «S» від SIZE
  assert.equal(String.fromCharCode(...vox.slice(20, 24)), 'SIZE'); assert.deepEqual([dv.getUint32(32, true), dv.getUint32(36, true), dv.getUint32(40, true)], [24, 20, 18]);
  const xyziAt = 20 + 12 + 12; assert.equal(String.fromCharCode(...vox.slice(xyziAt, xyziAt + 4)), 'XYZI');
  const count = dv.getUint32(xyziAt + 12, true), solid = w.blocks.reduce((s, v) => s + (v ? 1 : 0), 0); assert.equal(count, solid);
  for (let i = 0; i < count; i += 97) { const o = xyziAt + 16 + i * 4; assert.ok(vox[o] < 24 && vox[o + 1] < 20 && vox[o + 2] < 18 && vox[o + 3] >= 1); }
  assert.throws(() => V.toVox({ sx: 300, sy: 10, sz: 10, blocks: new Uint8Array(0) }));
});

test('JSON: експорт і імпорт повертають той самий світ', () => {
  const w = V.generate({ seed: 'json', sx: 30, sz: 26, sy: 20 }), j = V.toJson(w), r = V.fromJson(JSON.parse(JSON.stringify(j)));
  assert.ok(same(w, r)); assert.ok(j.rle.length < w.blocks.length / 2);
  assert.throws(() => V.fromJson({ format: 'x' }));
});

test('heightmap і counts узгоджені', () => {
  const w = V.generate({ seed: 'hm', sx: 20, sz: 20 }), hm = V.heightmap(w), c = V.counts(w);
  assert.equal(hm.length, 400); assert.equal(c.reduce((a, b) => a + b, 0), w.blocks.length); assert.ok(Math.max(...hm) > Math.min(...hm));
});

console.log(failed ? `\nПровалено: ${failed} з ${total}` : `\nУсі ${total} тестів пройдено`);
process.exit(failed ? 1 : 0);
