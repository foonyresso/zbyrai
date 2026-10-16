// Тести даних манекена: ділянки, категорії, підключення до типів. Запуск: node prompt-dice/test/mannequin.test.js
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const dir = path.join(__dirname, '..');
const ctx = { document: { getElementById: () => null }, console }; vm.createContext(ctx);
['pools.js', 'styles.js', 'types.js', 'mk-shapes.js', 'mk-data-body.js', 'mk-data-head.js', 'mk-data-scene.js', 'mk-data-extra.js', 'mk-slots.js']
  .forEach(f => vm.runInContext(fs.readFileSync(path.join(dir, f), 'utf8'), ctx, { filename: f }));
const get = expr => vm.runInContext(expr, ctx);
let failed = 0;
const test = (n, f) => { try { f(); console.log('  ok  ', n); } catch (e) { failed++; console.log('  FAIL', n, '\n      ', e.message); } };

test('контури ділянок: без NaN, є хоч один контур, групи існують', () => {
  const zones = get('MK_ZONES'), groups = get('MK_GROUPS').map(g => g.id);
  zones.forEach(z => { assert.ok(z.d.length, z.id); z.d.forEach(d => assert.ok(!/NaN|undefined/.test(d), z.id + ': ' + d)); assert.ok(groups.includes(z.group), z.id + ' група ' + z.group); });
});
test('кожна ділянка й група має слоти (щонайменше «свій опис») і назви', () => {
  const ids = [...new Set(get('MK_ZONES').map(z => z.id)), ...get('MK_GROUPS').map(g => g.id)];
  ids.forEach(id => { assert.ok(get(`MK.partSlots['${id}'].length`) >= 1, 'немає слотів: ' + id); assert.ok(get(`MK_PART_UA['${id}']`) && get(`MK_PART_EN['${id}']`), 'немає назви: ' + id); });
});
test('категорії: унікальні id, підписи й промпти непорожні, без повторів промптів усередині', () => {
  const all = get('MK_ALL'), seen = new Set();
  all.forEach(c => {
    assert.ok(!seen.has(c.id), 'повтор id ' + c.id); seen.add(c.id);
    assert.ok(get(`MK_PART_EN['${c.part}']`), c.id + ': невідома ділянка ' + c.part);
    const p = new Set(); c.groups.forEach(([, items]) => items.forEach(([l, pr]) => { assert.ok(l && pr, c.id + ' порожній пункт'); assert.ok(!p.has(pr), c.id + ' повтор ' + pr); p.add(pr); }));
  });
  assert.ok(all.length > 90, 'категорій ' + all.length);
});
test('нові слоти вимкнені за замовчуванням (manual) і не псують старі id', () => {
  assert.equal(get("SLOTS.hairColor.manual"), undefined);
  assert.equal(get("SLOTS.x_thigh.manual"), true);
  assert.equal(get("SLOTS.zt_hand.text"), true);
});
test('нові слоти підключено до типів: персонаж, спрайт, локація', () => {
  const has = (t, s) => get(`TYPES.${t}.sections.some(x => x.s.includes('${s}'))`);
  assert.ok(has('char', 'x_thigh') && has('char', 'x_posefull') && has('char', 'x_bgfant') && has('char', 'zt_hand'));
  assert.ok(has('sprite', 'x_thigh') && !has('sprite', 'x_posefull'));
  assert.ok(has('scene', 'x_bgfant') && has('scene', 'x_lens') && !has('scene', 'x_thigh'));
});
test('Flux: абзац додаткових деталей за ділянками', () => {
  const t = get(`mkFluxParagraph(['x_thigh','zt_hand','hairColor'], id => ({ x_thigh: ['thick thighs'], zt_hand: ['gold rings, scar'], hairColor: ['red_hair'] })[id])`);
  assert.match(t, /Thighs: thick thighs\./); assert.match(t, /Hands: gold rings, scar\./); assert.ok(!/hair/i.test(t));
  assert.equal(get(`mkFluxParagraph(['x_thigh'], () => [])`), '');
});
if (failed) { console.log('\nПровалено: ' + failed); process.exit(1); } else console.log('\nУсі перевірки пройдено');
