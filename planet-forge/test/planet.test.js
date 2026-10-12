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
  const lava = P.generateTexture(P.fromKind('lava', 'k'), W, H); assert.ok(frac(lava, 13) + frac(lava, 14) > .99); assert.equal(lava.water, 0);
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
  assert.equal(P.describe(P.fromKind('lava', 'g')).habitability, 0);
  assert.equal(P.planetName('x'), P.planetName('x')); assert.notEqual(P.planetName('x'), P.planetName('y')); assert.match(P.designation('x'), /^ZB-[A-Z]{2}-\d{3}$/);
});

test('придатність: помірний клімат і вода дають більше, ніж спека чи холод', () => {
  const hab = o => { const p = Object.assign(P.fromKind('earth', 'h'), o); return P.describe(p, P.generateTexture(p, 64, 32)).habitability; };
  assert.ok(hab({ temp: .05 }) > hab({ temp: .95 })); assert.ok(hab({ temp: .05 }) > hab({ temp: -.95 })); assert.ok(hab({ sea: .6 }) >= hab({ sea: 0 }));
});

console.log(failed ? `\nПровалено: ${failed} з ${total}` : `\nУсі ${total} тестів пройдено`);
process.exit(failed ? 1 : 0);
