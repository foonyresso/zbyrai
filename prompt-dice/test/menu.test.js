// Тести меню параметрів (menu-tree.js): повнота, унікальність, видимість за типом, моделлю й налаштуванням 18+. Запуск: node prompt-dice/test/menu.test.js
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const dir = path.join(__dirname, '..');
const ctx = { document: { getElementById: () => null }, console }; vm.createContext(ctx);
['pools.js', 'ua-tags.js', 'ua-body.js', 'ua-outfit.js', 'ua-scene.js', 'ua-pixel.js', 'ua-race.js', 'colors.js', 'race-data.js', 'styles.js', 'types.js', 'mk-shapes.js', 'mk-data-body.js', 'mk-data-head.js', 'mk-data-scene.js', 'mk-data-extra.js', 'mk-slots.js', 'mk-spec.js', 'mk-merge.js', 'nsfw-data.js', 'menu-tree.js']
  .forEach(f => vm.runInContext(fs.readFileSync(path.join(dir, f), 'utf8'), ctx, { filename: f }));
const get = expr => vm.runInContext(expr, ctx);
const plain = v => JSON.parse(JSON.stringify(v));
let failed = 0;
const test = (n, f) => { try { f(); console.log('  ok  ', n); } catch (e) { failed++; console.log('  FAIL', n, '\n      ', e.message); } };

const types = get('Object.keys(TYPES)'), models = ['sdxl', 'flux', 'gemini'];
const visibleIds = (t, m) => plain(get(`(() => { const t = TYPES['${t}'], px = t.kind === 'pixel'; return [...new Set(t.sections.flatMap(s => s.s))].filter(id => px || !SLOTS[id].models || SLOTS[id].models.includes('${m}')); })()`));

test('усі id у меню існують серед параметрів і не повторюються', () => {
  const ids = plain(get('MENU_CATS.flatMap(c => c.n.flatMap(n => n[3]))'));
  ids.forEach(id => assert.ok(get(`!!SLOTS['${id}']`), 'немає параметра ' + id));
  assert.equal(new Set(ids).size, ids.length, 'повтор: ' + ids.filter((v, i) => ids.indexOf(v) !== i));
});
test('категорії: унікальні id, назва, опис, колір і значок', () => {
  const cats = plain(get('MENU_CATS'));
  assert.equal(new Set(cats.map(c => c.id)).size, cats.length);
  cats.forEach(c => {
    assert.ok(c.name && c.desc, c.id + ': немає назви чи опису');
    assert.match(c.color, /^#[0-9a-f]{6}$/i, c.id + ': колір');
    assert.ok(get(`!!MENU_ICONS['${c.id}']`), c.id + ': немає значка');
    const nids = c.n.map(n => n[0]); assert.equal(new Set(nids).size, nids.length, c.id + ': повтор підгруп');
    c.n.forEach(n => assert.ok(n[1] && n[2], c.id + '.' + n[0] + ': немає назви чи опису'));
  });
});
types.forEach(t => models.forEach(m => {
  test(`${t} · ${m}: кожен видимий параметр є в меню рівно один раз`, () => {
    const cats = plain(get(`menuBuild('${t}', '${m}', { adult: true })`)), ids = cats.flatMap(c => c.nodes.flatMap(n => n.all));
    const want = visibleIds(t, m);
    assert.deepEqual([...ids].sort(), [...want].sort(), 'розбіжність меню й параметрів');
    assert.equal(new Set(ids).size, ids.length, 'повтор у меню');
    const nid = cats.flatMap(c => c.nodes.map(n => n.id)); assert.equal(new Set(nid).size, nid.length, 'повтор id підгруп');
    cats.forEach(c => c.nodes.forEach(n => {
      assert.ok(n.all.length, n.id + ' порожня');
      assert.deepEqual([...n.slots, ...n.texts].sort(), [...n.all].sort());
      n.texts.forEach(id => assert.equal(get(`SLOTS['${id}'].text`), true, id));
    }));
  });
}));
test('запасна категорія «Інше» не потрібна ні для персонажа, ні для спрайта, ні для локації', () => {
  ['char', 'sprite', 'scene'].forEach(t => models.forEach(m => {
    const cats = plain(get(`menuBuild('${t}', '${m}', { adult: true })`));
    assert.ok(!cats.some(c => c.id === 'other'), `${t}/${m}: є «Інше»: ` + JSON.stringify(cats.filter(c => c.id === 'other').map(c => c.nodes[0].all)));
  }));
});
test('піксель-арт типи: одна підгрупа «Зерно дизайну» з усіма параметрами', () => {
  types.filter(t => t.startsWith('px_')).forEach(t => {
    const cats = plain(get(`menuBuild('${t}', 'sdxl', {})`));
    assert.equal(cats.length, 1); assert.equal(cats[0].nodes.length, 1);
    assert.deepEqual([...cats[0].nodes[0].all].sort(), [...visibleIds(t, 'sdxl')].sort());
  });
});
test('18+: за замовчуванням прихований і не потрапляє в «Інше»; лише персонаж, SDXL і Flux', () => {
  const ids = (t, m, o) => plain(get(`menuBuild('${t}', '${m}', ${JSON.stringify(o)}).flatMap(c => c.nodes.flatMap(n => n.all))`));
  const has = a => a.some(id => id.startsWith('n_'));
  assert.ok(!has(ids('char', 'sdxl', {})), 'без дозволу 18+ видно');
  assert.ok(has(ids('char', 'sdxl', { adult: true })) && has(ids('char', 'flux', { adult: true })));
  assert.ok(!has(ids('char', 'gemini', { adult: true })), 'Gemini не підтримує 18+');
  assert.ok(!has(ids('sprite', 'sdxl', { adult: true })) && !has(ids('scene', 'sdxl', { adult: true })));
});
test('приховані користувачем категорії зникають, але їхні параметри не з’являються деінде', () => {
  const cats = plain(get(`menuBuild('char', 'sdxl', { adult: true, hide: { light: true, fx: true } })`)), idsOf = c => c.nodes.flatMap(n => n.all);
  assert.ok(!cats.some(c => c.id === 'light' || c.id === 'fx' || c.id === 'other'));
  assert.ok(!cats.flatMap(idsOf).includes('lighting'));
});
test('Gemini: категорія «Запит до Gemini» лише для цієї моделі', () => {
  const names = m => plain(get(`menuBuild('char', '${m}', {}).map(c => c.id)`));
  assert.ok(names('gemini').includes('gemini') && !names('sdxl').includes('gemini') && !names('flux').includes('gemini'));
});
test('спрайт-лист: є категорія «Спрайт-лист», немає пози й фону персонажа', () => {
  const ids = plain(get(`menuBuild('sprite', 'sdxl', {}).map(c => c.id)`));
  assert.ok(ids.includes('sprite') && !ids.includes('pose') && !ids.includes('place'));
});

console.log(failed ? `\n${failed} не пройдено` : '\nУсі перевірки пройдено');
process.exit(failed ? 1 : 0);
