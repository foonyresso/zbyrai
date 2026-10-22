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
const monFiles = fs.readdirSync(path.join(base, 'monsters')).filter((f) => f.endsWith('.js')).map((f) => f.slice(0, -3));
for (const f of monFiles) vm.runInThisContext(fs.readFileSync(path.join(base, 'monsters', f + '.js'), 'utf8'));
const dgFiles = fs.readdirSync(path.join(base, 'dungeons')).filter((f) => f.endsWith('.js')).map((f) => f.slice(0, -3));
for (const f of dgFiles) vm.runInThisContext(fs.readFileSync(path.join(base, 'dungeons', f + '.js'), 'utf8'));
for (const f of fs.readdirSync(path.join(base, 'races')).filter((x) => x.endsWith('.js'))) vm.runInThisContext(fs.readFileSync(path.join(base, 'races', f), 'utf8'));
for (const f of worldFiles) vm.runInThisContext(fs.readFileSync(path.join(base, 'worlds', f, 'world.js'), 'utf8'));

test('кожен файл реєструє світ/біом з id, що збігається з назвою файлу', () => {
  assert.deepEqual(Atlas.worlds.map((w) => w.id).sort(), worldFiles.slice().sort());
  assert.deepEqual(Atlas.biomes.map((b) => b.id).sort(), biomeFiles.slice().sort());
});
test('registry.js актуальний (node tools/build-atlas-registry.mjs)', () => {
  const m = JSON.parse(fs.readFileSync(path.join(base, 'registry.js'), 'utf8').replace(/^[\s\S]*?Atlas\.manifest = /, '').replace(/;\s*$/, ''));
  assert.deepEqual(m.worlds, worldFiles.map((f) => `worlds/${f}/world.js`).sort());
  assert.deepEqual(m.biomes, biomeFiles.map((f) => `biomes/${f}.js`).sort());
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
  const cf = Atlas.resolveBiomes({ biomes: { allow: 'tag:cold+forest' } });
  assert.ok(cf.some((x) => x.biome.id === 'taiga') && cf.every((x) => x.biome.tags.includes('cold') && x.biome.tags.includes('forest')), 'tag:a+b: усі теги разом');
  const r = Atlas.resolveBiomes({ biomes: { allow: ['grass', 'tag:mountain'], deny: 'tag:exclusive', weights: { grass: 3, 'tag:cold': 0 } } });
  const rid = r.map((x) => x.biome.id);
  assert.ok(rid.includes('grass') && rid.includes('mountain'), 'allow: id і тег разом');
  assert.ok(!rid.includes('peaks') && r.every((x) => !x.biome.tags.includes('exclusive') && !x.biome.tags.includes('cold')), 'deny і вага 0 вимикають біом');
  assert.ok(r.every((x) => x.biome.id === 'grass' || x.biome.tags.includes('mountain')), 'лише збіги з allow');
  assert.equal(r.find((x) => x.biome.id === 'grass').weight, 3);
});
test('дубль id і невідомий формат відхиляються', () => {
  assert.throws(() => Atlas.registerBiome({ format: 1, id: 'grass', name: 'x', color: '#000000', tags: ['a'] }), /вже/);
  assert.throws(() => Atlas.registerWorld({ format: 99, id: 'zz', name: 'x', runner: 'builtin' }), /формат/);
});
test('кожен файл монстра реєструє монстра з id = назві файлу, типом, природою й біомами', () => {
  assert.deepEqual(Atlas.monsters.map((m) => m.id).sort(), monFiles.slice().sort());
  for (const m of Atlas.monsters) {
    assert.ok(Atlas.monsterKinds[m.kind], m.id + ': невідомий тип ' + m.kind);
    assert.ok(Atlas.monsterNatures[m.nature], m.id + ': невідома природа');
    assert.ok(m.spawn.biomes.length, m.id);
    for (const b of m.spawn.biomes) assert.ok(Atlas.biomes.some((x) => x.id === b), m.id + ': невідомий біом ' + b);
  }
});
test('у кожній групі монстрів щонайменше кілька', () => {
  for (const k in Atlas.monsterKinds) assert.ok(Atlas.monsters.filter((m) => m.kind === k).length >= 3, k);
});
test('чим сильніший тип, тим далі від міст і сіл', () => {
  const ks = Object.values(Atlas.monsterKinds).filter((k) => k.rank > 2);
  for (const a of ks) for (const b of ks) if (b.rank > a.rank) assert.ok(b.city > a.city && b.village > a.village, b.name);
  for (const k of Object.values(Atlas.monsterKinds)) if (k.rank > 2) assert.ok(k.city > Atlas.monsterKinds.monster.city, k.name);
  const w = Atlas.monsterKinds.weak;
  assert.ok(w.near > w.village && w.weakNear > 0, 'слабкі лише зрідка біля сіл');
});
test('monstersFor фільтрує за типом і біомом', () => {
  const l = Atlas.monstersFor('boss', ['mountain'], 'infinite');
  assert.ok(l.length && l.every((m) => m.kind === 'boss' && m.spawn.biomes.includes('mountain')));
});
test('registry.js містить усі файли монстрів', () => {
  const m = JSON.parse(fs.readFileSync(path.join(base, 'registry.js'), 'utf8').replace(/^[\s\S]*?Atlas\.manifest = /, '').replace(/;\s*$/, ''));
  assert.deepEqual(m.monsters, monFiles.map((f) => `monsters/${f}.js`).sort());
});
test('файли формату 1 і 2 співіснують; формат 2 додає лише необов\'язкове lore', () => {
  assert.ok(Atlas.biomes.some((b) => b.format === 1) && Atlas.biomes.some((b) => b.format === 2));
  assert.ok(Atlas.worlds.some((w) => w.format === 1) && Atlas.worlds.some((w) => w.format === 2));
  assert.doesNotThrow(() => Atlas.registerBiome({ format: 1, id: 'zz-old', name: 'Старий формат', color: '#000000', tags: ['x'] }));
  assert.doesNotThrow(() => Atlas.registerBiome({ format: 2, id: 'zz-new', name: 'Новий формат', color: '#000000', tags: ['x'], lore: { description: 'x' } }));
  Atlas.biomes.splice(Atlas.biomes.findIndex((b) => b.id === 'zz-old'), 1);
  Atlas.biomes.splice(Atlas.biomes.findIndex((b) => b.id === 'zz-new'), 1);
});
test('кожен файл підземелля реєструє підземелля з id = назві файлу й коректними розмірами та біомами', () => {
  assert.deepEqual(Atlas.dungeons.map((d) => d.id).sort(), dgFiles.slice().sort());
  for (const d of Atlas.dungeons) {
    assert.ok(d.danger >= 1 && d.danger <= 5 && d.chance > 0 && d.chance <= 1, d.id);
    assert.ok(d.inhabitants.length, d.id + ': немає мешканців');
    assert.ok(d.lore && d.lore.description, d.id + ': немає опису');
    if (d.spawn.biomes !== 'all') for (const b of d.spawn.biomes) assert.ok(Atlas.biomes.some((x) => x.id === b), d.id + ': невідомий біом ' + b);
    if (d.spawn.worlds !== 'all') for (const w of d.spawn.worlds) assert.ok(Atlas.worlds.some((x) => x.id === w), d.id + ': невідомий світ ' + w);
    for (const m of d.monsters) assert.ok(Atlas.monsters.some((x) => x.id === m), d.id + ': невідомий монстр ' + m);
  }
  assert.throws(() => Atlas.registerDungeon({ format: 1, id: 'q', name: 'x', anchor: { type: 'city' }, size: { rooms: [1, 2], length: [1, 2], area: [1, 2] }, spawn: { biomes: 'all', worlds: 'all' } }), /формат 2/);
  assert.throws(() => Atlas.registerDungeon({ format: 2, id: 'q', name: 'x', anchor: { type: 'sky' }, size: { rooms: [1, 2], length: [1, 2], area: [1, 2] }, spawn: { biomes: 'all', worlds: 'all' } }), /прив/);
  assert.throws(() => Atlas.registerDungeon({ format: 2, id: 'q', name: 'x', anchor: { type: 'city' }, size: { rooms: [5, 2], length: [1, 2], area: [1, 2] }, spawn: { biomes: 'all', worlds: 'all' } }), /size/);
});
test('підземелля прив\'язані логічно: під містами, у поселеннях, у місцях інтересу; у кожної прив\'язки є вибір', () => {
  const f = (a, b = ['grass']) => Atlas.dungeonsFor(a, b, 'infinite').map((d) => d.id);
  assert.ok(f({ type: 'city', tier: 4 }).includes('catacombs') && !f({ type: 'city', tier: 3 }).includes('catacombs'));
  assert.ok(f({ type: 'settlement', state: 'ruined' }).includes('ruin-cellars') && f({ type: 'settlement', state: 'occupied' }).includes('occupied-warren'));
  assert.ok(f({ type: 'poi', poi: 'ruins' }).includes('ancient-vault') && f({ type: 'poi', poi: 'mage_tower' }).includes('mage-cellar'));
  assert.ok(f({ type: 'poi', poi: 'small_mine' }, ['mountain']).includes('mine') && !f({ type: 'poi', poi: 'small_mine' }, ['grass']).includes('mine'));
  assert.deepEqual(f({ type: 'poi', poi: 'hollow-cavity' }, ['star-caverns']), [], 'підземелля чужого світу не з\'являються в нескінченному');
  assert.deepEqual(Atlas.dungeonsFor({ type: 'poi', poi: 'hollow-cavity' }, ['star-caverns'], 'astrakor').map((d) => d.id), ['star-cavern']);
});
test('registry.js містить усі файли підземель', () => {
  const m = JSON.parse(fs.readFileSync(path.join(base, 'registry.js'), 'utf8').replace(/^[\s\S]*?Atlas\.manifest = /, '').replace(/;\s*$/, ''));
  assert.deepEqual(m.dungeons, dgFiles.map((f) => `dungeons/${f}.js`).sort());
});
test('назви біомів, монстрів і підземель не дублюються (використовуй наявні)', () => {
  for (const [what, list] of [['біом', Atlas.biomes], ['монстр', Atlas.monsters], ['підземелля', Atlas.dungeons]]) {
    const seen = new Map();
    for (const x of list) { const k = x.name.toLowerCase(); assert.ok(!seen.has(k), what + ' «' + x.name + '»: дубль ' + seen.get(k) + ' і ' + x.id); seen.set(k, x.id); }
  }
});
test('світи формату 2: усі посилання в lore існують і прив\'язані до цього світу', () => {
  const full = Atlas.worlds.filter((w) => w.lore);
  assert.ok(full.length >= 6, 'шість нових світів');
  for (const w of full) {
    const L = w.lore;
    for (const k of ['concept', 'meaning', 'history', 'structure', 'sky', 'exploration']) assert.ok(typeof L[k] === 'string' && L[k].length > 20, w.id + ': немає ' + k);
    for (const k of ['biomes', 'creatures', 'bosses', 'architecture', 'mechanics', 'resources', 'dungeons']) assert.ok(Array.isArray(L[k]) && L[k].length, w.id + ': порожнє ' + k);
    assert.ok(L.visual && L.visual.palette.length >= 4 && L.visual.signature, w.id + ': немає вигляду');
    assert.ok(L.structures && L.structures.under && L.structures.above, w.id + ': немає підземних і надземних споруд');
    for (const b of L.biomes) assert.ok(Atlas.biomes.some((x) => x.id === b.id), w.id + ': біом ' + b.id);
    for (const b of w.biomes.allow) assert.ok(Atlas.biomes.some((x) => x.id === b), w.id + ': дозволений біом ' + b);
    for (const id of L.creatures.concat(L.bosses)) {
      const m = Atlas.monsters.find((x) => x.id === id);
      assert.ok(m, w.id + ': монстр ' + id);
      assert.ok(m.spawn.worlds === 'all' || m.spawn.worlds.includes(w.id), w.id + ': ' + id + ' не з\'являється в цьому світі');
    }
    for (const id of L.bosses) assert.ok(Atlas.monsters.find((x) => x.id === id).kind !== 'monster', w.id + ': ' + id + ' не бос');
    for (const id of L.dungeons) { const d = Atlas.dungeons.find((x) => x.id === id); assert.ok(d, w.id + ': підземелля ' + id); assert.ok(d.spawn.worlds === 'all' || d.spawn.worlds.includes(w.id), w.id + ': ' + id + ' не з\'являється в цьому світі'); }
    assert.ok(w.preset && w.preset.theme, w.id + ': немає теми');
  }
});
test('світи не змішують біоми один одного: біоми з тегом exclusive не потрапляють у старі світи', () => {
  for (const id of ['continent', 'archipelago', 'island', 'pangea']) assert.ok(Atlas.resolveBiomes(Atlas.worldById(id)).every((r) => !r.biome.tags.includes('exclusive')), id);
});
test('тема кожного світу на рушії «Материк» існує в themes.js', () => {
  const sb = { RealmMap: {} };
  Object.assign(sb, { globalThis: sb });
  for (const f of ['themes.js', 'themes-worlds.js']) vm.runInNewContext(fs.readFileSync(path.join(base, 'worlds/continent/render', f), 'utf8'), sb);
  for (const w of Atlas.worlds) if (w.preset && w.preset.theme) assert.ok(sb.RealmMap.Themes[w.preset.theme], w.id + ': немає теми ' + w.preset.theme);
});
test('народів немає: ні реєстру, ні папки, ні поля lore.peoples', () => {
  assert.ok(!('peoples' in Atlas) && !Atlas.registerPeople && !fs.existsSync(path.join(base, 'peoples')));
  for (const w of Atlas.worlds) assert.ok(!(w.lore && 'peoples' in w.lore), w.id + ': lore.peoples');
});
test('раси: ≥30 файлів, id = назві файлу, вага >0, унікальні назви', () => {
  const files = fs.readdirSync(path.join(base, 'races')).filter((f) => f.endsWith('.js'));
  assert.strictEqual(Atlas.races.length, files.length);
  assert.ok(files.length >= 30);
  for (const r of Atlas.races) { assert.ok(files.includes(r.id + '.js'), r.id); assert.ok(r.format >= 2 && r.weight > 0, r.id); }
  assert.strictEqual(new Set(Atlas.races.map((r) => r.name)).size, Atlas.races.length);
});
test('склейки atlas-data/* і списки монстрів материка актуальні (node tools/build-atlas-registry.mjs --check)', () => {
  require('node:child_process').execFileSync(process.execPath, [path.join(__dirname, 'build-atlas-registry.mjs'), '--check'], { stdio: 'pipe' });
});
console.log(failed ? `\n${failed} не пройдено` : '\nУсі перевірки пройдено');
process.exit(failed ? 1 : 0);
