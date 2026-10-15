// Перевірка реєстру Атласу: формат файлів світів і біомів, актуальність registry.js, вибір біомів для світу.
// Запуск: node tools/atlas-registry.test.js
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict'), vm = require('node:vm');
const base = path.join(__dirname, '..', 'medieval-world');
const Atlas = require(path.join(base, 'src/core/atlas.js'));
vm.createContext(globalThis);
globalThis.Atlas = Atlas;
let failed = 0;
const test = (n, f) => { try { f(); console.log('  ok  ', n); } catch (e) { failed++; console.log('  FAIL', n, '\n      ', e.message); } };

const worldFiles = fs.readdirSync(path.join(base, 'worlds'), { withFileTypes: true }).filter((e) => e.isDirectory() && fs.existsSync(path.join(base, 'worlds', e.name, 'world.js'))).map((e) => e.name);
const biomeFiles = fs.readdirSync(path.join(base, 'biomes')).filter((f) => f.endsWith('.js')).map((f) => f.slice(0, -3));
for (const f of biomeFiles) vm.runInThisContext(fs.readFileSync(path.join(base, 'biomes', f + '.js'), 'utf8'));
for (const f of worldFiles) vm.runInThisContext(fs.readFileSync(path.join(base, 'worlds', f, 'world.js'), 'utf8'));

test('кожен файл реєструє світ/біом з id, що збігається з назвою файлу', () => {
  assert.deepEqual(Atlas.worlds.map((w) => w.id).sort(), worldFiles.slice().sort());
  assert.deepEqual(Atlas.biomes.map((b) => b.id).sort(), biomeFiles.slice().sort());
});
test('registry.js актуальний (node tools/build-atlas-registry.mjs)', () => {
  const m = JSON.parse(fs.readFileSync(path.join(base, 'registry.js'), 'utf8').replace(/^[\s\S]*?Atlas\.manifest = /, '').replace(/;\s*$/, ''));
  assert.deepEqual(m.worlds, worldFiles.sort().map((f) => `worlds/${f}/world.js`));
  assert.deepEqual(m.biomes, biomeFiles.sort().map((f) => `biomes/${f}.js`));
});
test('рівно один світ за замовчуванням, режим builtin або iframe з entry', () => {
  assert.equal(Atlas.worlds.filter((w) => w.default).length, 1);
  for (const w of Atlas.worlds) { assert.ok(['builtin', 'iframe'].includes(w.runner), w.id); if (w.runner === 'iframe') assert.ok(fs.existsSync(path.join(base, w.entry.split('?')[0])), w.id + ': немає entry'); }
});
test('біоми мають кольори й теги', () => { for (const b of Atlas.biomes) { assert.match(b.color, /^#[0-9a-f]{6}$/i, b.id); assert.ok(b.tags.length, b.id); } });
test('дозволені світу біоми існують', () => {
  for (const w of Atlas.worlds) for (const s of [].concat(w.biomes.allow, w.biomes.deny || [])) if (s !== 'all' && !s.startsWith('tag:')) assert.ok(Atlas.biomes.some((b) => b.id === s), w.id + ': невідомий біом ' + s);
});
test('вибір біомів: allow/deny/теги/ваги', () => {
  const ids = (w) => Atlas.resolveBiomes(w).map((x) => x.biome.id);
  assert.equal(ids({ biomes: { allow: 'all' } }).length, Atlas.biomes.length);
  assert.ok(!ids({ biomes: { allow: 'all', deny: 'tag:water' } }).includes('sea'));
  assert.deepEqual(ids({ biomes: { allow: 'tag:cold+forest' } }), ['taiga']);
  const r = Atlas.resolveBiomes({ biomes: { allow: ['grass', 'tag:mountain'], weights: { grass: 3, 'tag:cold': 0 } } });
  assert.deepEqual(r.map((x) => x.biome.id).sort(), ['grass', 'mountain']);
  assert.equal(r.find((x) => x.biome.id === 'grass').weight, 3);
});
test('дубль id і невідомий формат відхиляються', () => {
  assert.throws(() => Atlas.registerBiome({ format: 1, id: 'grass', name: 'x', color: '#000000', tags: ['a'] }), /вже/);
  assert.throws(() => Atlas.registerWorld({ format: 2, id: 'zz', name: 'x', runner: 'builtin' }), /формат/);
});
console.log(failed ? `\n${failed} не пройдено` : '\nУсі перевірки пройдено');
process.exit(failed ? 1 : 0);
