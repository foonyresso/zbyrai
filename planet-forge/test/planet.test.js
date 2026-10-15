// Тести Planet Forge. Запуск: node planet-forge/test/planet.test.js
const assert = require('node:assert/strict');
const P = require('../planet-core.js');
let failed = 0, total = 0;
function test(name, fn) { total++; try { fn(); console.log('  ok   ' + name); } catch (e) { failed++; console.log('  FAIL ' + name + '\n       ' + String(e.message).split('\n').join('\n       ')); } }
const W = 128, H = 64;

console.log('Planet Forge');

test('детермінованість: той самий seed дає ту саму текстуру, інший — іншу', () => {
  const a = P.generateTexture({ seed: 'a' }, W, H), b = P.generateTexture({ seed: 'a' }, W, H), c = P.generateTexture({ seed: 'b' }, W, H);
  assert.deepEqual(a.rgb, b.rgb); assert.notDeepEqual(a.rgb, c.rgb);
});

test('частка води дорівнює параметру sea (процентиль висот) і монотонна', () => {
  let prev = -1;
  for (const sea of [.1, .3, .5, .7, .9]) { const t = P.generateTexture({ seed: 'sea', sea }, W, H); assert.ok(Math.abs(t.water - sea) < .03, `sea=${sea}, вода=${t.water}`); assert.ok(t.water > prev); prev = t.water; }
  assert.equal(P.generateTexture({ seed: 'dry', sea: 0 }, W, H).water, 0);
});

test('шов: лівий і правий край текстури неперервні (різниця висот сусідніх пікселів мала)', () => {
  const t = P.generateTexture({ seed: 'seam', kind: 'earth' }, 256, 128); let maxStep = 0, maxEdge = 0;
  for (let y = 0; y < 128; y++) { maxEdge = Math.max(maxEdge, Math.abs(t.height[y * 256] - t.height[y * 256 + 255])); for (let x = 1; x < 256; x++) maxStep = Math.max(maxStep, Math.abs(t.height[y * 256 + x] - t.height[y * 256 + x - 1])); }
  assert.ok(maxEdge <= maxStep * 1.5 + 1e-6, `край ${maxEdge}, макс. крок ${maxStep}`);
});

test('landBiome: холод — лід, спека без вологи — пустеля, спека з вологою — джунглі, високо — гори/піки', () => {
  assert.equal(P.landBiome(.05, .5, .1), 2); assert.equal(P.landBiome(.8, .05, .1), 7); assert.equal(P.landBiome(.8, .9, .1), 9);
  assert.equal(P.landBiome(.5, .6, .1), 5); assert.equal(P.landBiome(.5, .8, .1), 6); assert.equal(P.landBiome(.7, .5, .9), 10); assert.equal(P.landBiome(.2, .5, .9), 11); assert.equal(P.landBiome(.2, .1, .1), 3);
});

test('типи планет: пустеля пустельніша за ліси, льодова холодніша, океанічна має більше води', () => {
  const frac = (t, id) => t.biome.reduce((s, b) => s + (b === id ? 1 : 0), 0) / t.biome.length;
  const des = P.generateTexture(P.fromKind('desert', 'k'), W, H), earth = P.generateTexture(P.fromKind('earth', 'k'), W, H), ice = P.generateTexture(P.fromKind('ice', 'k'), W, H), ocean = P.generateTexture(P.fromKind('ocean', 'k'), W, H);
  assert.ok(frac(des, 7) > frac(earth, 7)); assert.ok(frac(ice, 2) > frac(earth, 2)); assert.ok(ocean.water > earth.water);
  const lava = P.generateTexture(P.fromKind('lava', 'k'), W, H); assert.ok(lava.biome.every(b => /лав|магм|вулкан|попіл/i.test(P.BIOMES[b].name)), 'на вулканічній лише лава, магма, порода й попіл'); assert.ok(!lava.biome.some(b => b <= 1), 'води на вулканічній немає');
  const gas = P.generateTexture(P.fromKind('gas', 'k'), W, H); assert.ok(gas.height.every(v => v === 0));
});

test('хмари й вогні: cloud=0 і lights=0 їх вимикають; вогні лише на придатному суходолі; в пустелі менше', () => {
  const none = P.generateTexture({ seed: 'cl', cloud: 0, lights: 0 }, W, H); assert.ok(none.cloud.every(v => v === 0) && none.light.every(v => v === 0));
  const some = P.generateTexture({ seed: 'cl', cloud: .8, lights: .9 }, W, H); assert.ok(some.cloud.some(v => v > 0) && some.light.some(v => v > 0));
  for (let i = 0; i < some.light.length; i++) if (some.light[i]) assert.ok([5, 6, 8, 12].includes(some.biome[i]));
});

test('кольори й біоми валідні (0..255, відомі id)', () => {
  const t = P.generateTexture({ seed: 'v' }, W, H);
  for (const v of t.rgb) assert.ok(v >= 0 && v <= 255 && Number.isFinite(v)); for (const b of t.biome) assert.ok(P.BIOMES[b]);
});

test('описові характеристики: діапазони, придатність, ім\'я детерміноване, газовий гігант непридатний', () => {
  const p = Object.assign(P.fromKind('earth', 'desc'), { moons: 3 }), t = P.generateTexture(p, W, H), d = P.describe(p, t), d2 = P.describe(p, t);
  assert.deepEqual(d, d2); assert.ok(d.radiusKm >= 2800 && d.radiusKm <= 9200); assert.ok(d.gravity > .2 && d.gravity < 4); assert.ok(d.habitability >= 0 && d.habitability <= 100);
  assert.equal(d.moons.length, 3); assert.ok(Math.abs(d.atmosphere.reduce((s, a) => s + a[1], 0) - 100) < 1.5); assert.equal(d.resources.length, 3);
  assert.ok(Math.abs(d.biomes.reduce((s, b) => s + b.share, 0) - 1) < 1e-9);
  assert.equal(P.describe(P.fromKind('gas', 'g'), P.generateTexture(P.fromKind('gas', 'g'), W, H)).habitability, 0);
  assert.equal(P.describe(P.fromKind('lava', 'g')).habitability, 0); assert.equal(P.describe(P.fromKind('lava', 'g')).liquidName, 'Лава');
  assert.equal(P.planetName('x'), P.planetName('x')); assert.notEqual(P.planetName('x'), P.planetName('y')); assert.match(P.designation('x'), /^ZB-[A-Z]{2}-\d{3}$/);
});

test('придатність: помірний клімат і вода дають більше, ніж спека чи холод', () => {
  const hab = o => { const p = Object.assign(P.fromKind('earth', 'h'), o); return P.describe(p, P.generateTexture(p, 64, 32)).habitability; };
  assert.ok(hab({ temp: .05 }) > hab({ temp: .95 })); assert.ok(hab({ temp: .05 }) > hab({ temp: -.95 })); assert.ok(hab({ sea: .6 }) >= hab({ sea: 0 }));
});

/* ---------- нове: каталог типів, ручки, випадковість, замочки ---------- */
const ids = Object.keys(P.KINDS), seq = n => { let a = n; return () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; }; };

test('типів не менше 30: і реальні, і фантастичні, у кожного назва, опис, ручки й склад атмосфери', () => {
  assert.ok(ids.length >= 30, 'типів ' + ids.length); assert.ok(ids.filter(k => P.KINDS[k].group === 'real').length >= 12); assert.ok(ids.filter(k => P.KINDS[k].group === 'fantasy').length >= 15);
  assert.equal(new Set(ids.map(k => P.KINDS[k].name)).size, ids.length, 'назви унікальні');
  for (const k of ids) { const K = P.KINDS[k]; assert.ok(K.name && K.blurb && K.life && K.gases.length && K.res.length >= 3 && K.knobs.length >= 5, k); assert.ok(Math.abs(K.gases.reduce((s, a) => s + a[1], 0) - 100) < 1.5, k + ': атмосфера'); for (const kb of K.knobs) assert.ok(kb.min < kb.max && kb.def >= kb.min && kb.def <= kb.max && kb.l, `${k}.${kb.k}`); }
});

test('кожен тип генерує коректну текстуру й паспорт', () => {
  for (const k of ids) { const p = P.fromKind(k, 'v1'), t = P.generateTexture(p, 96, 48), d = P.describe(p, t);
    for (const v of t.rgb) assert.ok(Number.isFinite(v) && v >= 0 && v <= 255, k); for (const b of t.biome) assert.ok(P.BIOMES[b], k + ': біом ' + b);
    assert.ok(d.name && d.biomes.length && d.habitability >= 0 && d.habitability <= 100, k); assert.ok(Math.abs(d.biomes.reduce((s, b) => s + b.share, 0) - 1) < 1e-9, k); }
});

test('типи виглядають по-різному: середні кольори різних типів помітно відрізняються', () => {
  const avg = k => { const t = P.generateTexture(P.fromKind(k, 's'), 96, 48), a = [0, 0, 0]; for (let i = 0; i < t.rgb.length; i++) a[i % 3] += t.rgb[i]; return a.map(v => v / (t.rgb.length / 3)); };
  const cols = ids.map(avg); let close = 0; for (let i = 0; i < cols.length; i++) for (let j = i + 1; j < cols.length; j++) if (Math.hypot(cols[i][0] - cols[j][0], cols[i][1] - cols[j][1], cols[i][2] - cols[j][2]) < 6) close++;
  assert.ok(close <= 12, 'надто багато схожих пар типів: ' + close);
});

test('адаптація під тип: вулканічна має лаву, титаноподібна метан, льодяна без лави, у літаючих островів є мости', () => {
  const names = (k, o) => { const p = Object.assign(P.fromKind(k, 'ad'), o), t = P.generateTexture(p, 128, 64); return new Set(Array.from(t.biome, b => P.BIOMES[b].name)); };
  assert.ok(names('lava').has('Магмове море') || names('lava').has('Лава')); assert.ok(names('titan').has('Метанове озеро') || names('titan').has('Етанова мілина')); assert.ok(!names('ice').has('Лава'));
  assert.ok(names('floating', { bridge: 1 }).has('Мости')); assert.ok(!names('floating', { bridge: 0 }).has('Мости'));
  assert.equal(P.describe(P.fromKind('titan', 'a')).liquidName, 'Метан');
});

test('кожна ручка кожного типу змінює вигляд планети (кольори, світіння, хмари чи вогні), а не лише розмір', () => {
  const sig = p => { const t = P.generateTexture(p, 96, 48); let s = 0; for (let i = 0; i < t.rgb.length; i++) s += t.rgb[i] * (1 + i % 7); for (let i = 0; i < t.glow.length; i++) s += t.glow[i] * (3 + i % 5) + t.cloud[i] * (2 + i % 3) + t.light[i] * (1 + i % 11); return s + P.describe(p).pressure * 1e5 + P.describe(p).tempC * 1e3; };
  const dead = [];
  for (const k of ids) for (const kb of P.KINDS[k].knobs) {
    if (['tilt', 'moons', 'ringw', 'ringd', 'shine'].includes(kb.k)) continue; // ці лише в рендері сфери
    const base = P.fromKind(k, 'knob'), v = [kb.min, (kb.min + kb.max) / 2, kb.max].map(x => sig(Object.assign({}, base, { [kb.k]: x })));
    if (v[0] === v[1] && v[1] === v[2]) dead.push(k + '.' + kb.k);
  }
  assert.deepEqual(dead, []);
});

test('відтінок повертає палітру, а нуль її не чіпає', () => {
  const a = P.generateTexture(P.fromKind('earth', 'h'), 64, 32), b = P.generateTexture(Object.assign(P.fromKind('earth', 'h'), { hue: .1 }), 64, 32); assert.notDeepEqual(a.rgb, b.rgb);
  assert.deepEqual(a.rgb, P.generateTexture(Object.assign(P.fromKind('earth', 'h'), { hue: 0 }), 64, 32).rgb);
});

test('Сюрприз: різні типи, назви й значення ручок; значення в допустимих діапазонах', () => {
  const R = seq(7); let prev = P.fromKind('earth', 'a'); const kinds = new Set(), names = new Set(), seeds = new Set(), vals = {};
  for (let i = 0; i < 900; i++) { prev = P.randomPlanet(prev, {}, R); kinds.add(prev.kind); names.add(prev.name); seeds.add(prev.seed); const K = P.KINDS[prev.kind];
    for (const kb of K.knobs) { assert.ok(prev[kb.k] >= kb.min - 1e-9 && prev[kb.k] <= kb.max + 1e-9, `${prev.kind}.${kb.k}=${prev[kb.k]}`); (vals[prev.kind + '.' + kb.k] ||= new Set()).add(Math.round(prev[kb.k] * 20)); } }
  assert.ok(kinds.size >= 25, 'типів у вибірці ' + kinds.size); assert.ok(names.size >= 850 && seeds.size >= 890);
  const flat = Object.entries(vals).filter(([k, s]) => s.size < 2 && !k.endsWith('.moons')); assert.ok(flat.length === 0, 'ручки без різноманіття: ' + flat.map(f => f[0]).join(','));
});

test('замочки: тип, назва, зерно, ручки й кільця лишаються, решта міняється; «Нова планета» зберігає тип', () => {
  const R = seq(3), prev = Object.assign(P.fromKind('lava', 'keepme'), { name: 'Моя Лава', veins: .123, heat: .9, ring: true });
  const locks = { kind: true, name: true, seed: true, veins: true, ring: true };
  for (let i = 0; i < 20; i++) { const n = P.randomPlanet(prev, locks, R); assert.equal(n.kind, 'lava'); assert.equal(n.name, 'Моя Лава'); assert.equal(n.seed, 'keepme'); assert.ok(Math.abs(n.veins - .123) < 1e-9); assert.equal(n.ring, true); }
  const heats = new Set(); for (let i = 0; i < 20; i++) heats.add(P.randomPlanet(prev, locks, R).heat.toFixed(2)); assert.ok(heats.size > 10);
  for (let i = 0; i < 20; i++) assert.equal(P.randomPlanet(prev, {}, R, { keepKind: true }).kind, 'lava');
  const sw = P.switchKind(prev, 'ice', { cracks: true, name: true }); assert.equal(sw.kind, 'ice'); assert.equal(sw.name, 'Моя Лава');
  const clamped = P.randomPlanet({ kind: 'earth', seed: 'x', sea: 5 }, { sea: true }, R, { keepKind: true }); assert.ok(clamped.sea <= .95);
});

test('назва: завжди є, залежить від зерна й типу, не порожня для кожного типу', () => {
  for (const k of ids) assert.ok(P.planetName('seed1', k).length >= 3, k);
  assert.notEqual(P.planetName('s', 'lava'), P.planetName('t', 'lava')); assert.equal(P.planetName('s', 'lava'), P.planetName('s', 'lava')); assert.ok(P.fromKind('crystal', 'zz').name);
});

test('clampParams: застарілі або чужі значення приводяться до діапазонів типу', () => {
  const c = P.clampParams({ kind: 'lava', seed: 'q', sea: 5, heat: -3, moons: 9 }); assert.ok(c.sea <= .7 && c.heat >= .2 && c.moons <= 3); assert.equal(P.clampParams({ kind: 'nope' }).kind, 'earth');
});

test('фони: п’ять типів, у кожного ручки; clampBg виправляє, randomBg поважає замочок', () => {
  const B = require('../planet-bg.js'); assert.ok(B.ORDER.length >= 5);
  for (const id of B.ORDER) assert.ok(B.knobsOf(id).length >= 2 && B.TYPES[id].name && B.TYPES[id].tip);
  const c = B.clampBg({ bg: 'x', bgArms: 99, bgDens: -4 }); assert.equal(c.bg, 'stars'); assert.equal(c.bgArms, 6); assert.equal(c.bgDens, .1);
  const prev = B.clampBg({ bg: 'galaxy' }); assert.deepEqual(B.randomBg(prev, true), prev);
  let n = 0; const seen = new Set(); for (let i = 0; i < 80; i++) { const r = B.randomBg(prev, false); seen.add(r.bg); n += r.bgArms >= 2 && r.bgArms <= 6 ? 1 : 0; } assert.equal(n, 80); assert.ok(seen.size >= 4);
});

test('типи світів: група «world» з п’яти..чотирьох типів, континентальний перший; вулканічний має лаву, кислотні озера й джерела', () => {
  const ids = Object.keys(P.KINDS).filter(k => P.KINDS[k].group === 'world'); assert.deepEqual(ids, ['continental', 'pangaea', 'archipelago', 'volcanic']);
  for (const id of ids) { const t = P.generateTexture(P.fromKind(id, 'w1'), W, H), d = P.describe(P.fromKind(id, 'w1'), t); assert.ok(d.blurb && d.biomes.length >= 3, id); }
  const v = P.describe(P.fromKind('volcanic', 'w1'), P.generateTexture(Object.assign(P.fromKind('volcanic', 'w1'), { acid: 1, springs: 1 }), 256, 128)).biomes.map(b => b.name);
  assert.ok(v.includes('Лава') || v.includes('Магмове море')); assert.ok(v.includes('Кислотне озеро'), v.join());
  const e = P.fromKind('earth', 'x'); assert.ok(e.sea <= .5, 'земного типу менше води');
});

test('зоряна система: детермінована, 3–9 планет з коректними типами, усі зорі (з чорною дірою) працюють, clampSystem відсіює зіпсоване', () => {
  const S = require('../planet-system.js'); assert.ok(S.STAR_ORDER.includes('blackhole') && S.STAR_ORDER.length >= 10);
  assert.deepEqual(S.generate('a'), S.generate('a')); assert.notDeepEqual(S.generate('a'), S.generate('b'));
  for (const st of S.STAR_ORDER) for (const n of [3, 9]) { const y = S.generate('t' + st, { star: st, count: n }); assert.equal(y.planets.length, n); assert.equal(y.star, st);
    let prev = 0; for (const p of y.planets) { assert.ok(P.KINDS[p.params.kind] && p.au > prev); prev = p.au; assert.ok(P.generateTexture(p.params, 32, 16)); } }
  const y = S.generate('q'); assert.ok(S.clampSystem(JSON.parse(JSON.stringify(y)))); assert.equal(S.clampSystem({ star: 'x', planets: [] }), null); assert.equal(S.clampSystem(Object.assign({}, y, { planets: [{ au: 1, params: { kind: 'nope' } }] })), null);
  for (const m of ['compact', 'real']) { const f = y.planets.map((_, i) => S.orbitFrac(y, i, m)); for (let i = 1; i < f.length; i++) assert.ok(f[i] > f[i - 1]); assert.ok(f[f.length - 1] <= 1); }
  const hot = S.generate('h', { star: 'blue', count: 9 }), red = S.generate('h', { star: 'red', count: 9 }); assert.ok(S.hz(S.STARS.blue).in > S.hz(S.STARS.red).out);
  assert.ok(hot.planets[0].au > red.planets[8].au * .1);
});

console.log(failed ? `\nПровалено: ${failed} з ${total}` : `\nУсі ${total} тестів пройдено`);
process.exit(failed ? 1 : 0);
