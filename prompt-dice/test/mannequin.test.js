// Тести даних манекена: ділянки, категорії, підключення до типів. Запуск: node prompt-dice/test/mannequin.test.js
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const dir = path.join(__dirname, '..');
const ctx = { document: { getElementById: () => null }, console }; vm.createContext(ctx);
['pools.js', 'ua-tags.js', 'ua-body.js', 'ua-outfit.js', 'ua-scene.js', 'ua-pixel.js', 'ua-race.js', 'colors.js', 'race-data.js', 'styles.js', 'types.js', 'mk-shapes.js', 'mk-data-body.js', 'mk-data-head.js', 'mk-data-scene.js', 'mk-data-extra.js', 'mk-slots.js', 'mk-spec.js', 'mk-merge.js']
  .forEach(f => vm.runInContext(fs.readFileSync(path.join(dir, f), 'utf8'), ctx, { filename: f }));
const get = expr => vm.runInContext(expr, ctx);
const plain = v => JSON.parse(JSON.stringify(v));
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
  assert.ok(all.length > 60, 'категорій ' + all.length);
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

/* ---- об'єднання параметрів, групи, українські назви (mk-spec.js, mk-merge.js, ua-*.js) ---- */
const slotIds = () => Object.keys(get('SLOTS'));
const optsOf = id => get(`mkAllOpts(SLOTS['${id}'])`);
const hasCyr = t => /[А-Яа-яІіЇїЄєҐґ]/.test(t);
test('групи старих параметрів покривають усі їхні значення, без зайвих і повторів', () => {
  Object.keys(get('MKM_SPEC')).forEach(id => {
    const groups = get(`SLOTS['${id}'].groups`); if (!groups || get(`SLOTS['${id}'].mk`)) return;
    const inGroups = plain(groups.flatMap(g => g[1].map(x => x[1]))), opts = plain(optsOf(id));
    assert.deepEqual(plain(opts.filter(v => !inGroups.includes(v))), [], id + ': значення без групи');
    assert.deepEqual(inGroups.filter(v => !opts.includes(v)), [], id + ': зайве в групах');
    assert.equal(new Set(inGroups).size, inGroups.length, id + ': повтор у групах');
  });
});
test('кожен тег має лише один «дім» у межах типу (персонаж, спрайт, локація)', () => {
  const skip = new Set(['effects', 'background', 'fgObjects', 'io']);
  ['char', 'sprite', 'scene'].forEach(t => {
    const where = {};
    get(`TYPES['${t}'].sections.flatMap(s => s.s)`).filter(id => !/^spr/.test(id) && !skip.has(id) && get(`!!SLOTS['${id}']`)).forEach(id => {
      new Set(optsOf(id)).forEach(v => { const a = get(`mkAtom(${JSON.stringify(v)})`); if (a) (where[a] = where[a] || new Set()).add(id); });
    });
    const dups = Object.entries(where).filter(([, s]) => s.size > 1).map(([a, s]) => a + ': ' + [...s].join(', '));
    assert.equal(dups.length, 0, t + ': дублікати тегів ' + dups.join(' | '));
  });
});
test('кожен варіант у вибірі має українську назву (усі параметри, усі статі й тематики)', () => {
  const missing = [];
  slotIds().forEach(id => {
    const sl = get(`SLOTS['${id}']`); if (sl.text || ['gTask', 'pl_eye_symbols'].includes(id)) return; // смайли очей (> <, x3…) — це й є підписи
    optsOf(id).forEach(v => { const t = get(`mkLabel(SLOTS['${id}'], ${JSON.stringify(v)})`); if (!hasCyr(t)) missing.push(id + ': ' + v); });
  });
  assert.equal(missing.length, 0, 'без української назви: ' + missing.slice(0, 20).join(' | '));
});
test('фон і ефекти тематик розбито на окремі теги (не один довгий «чип»)', () => {
  const bg = get(`SLOTS.background.opts({ g: 'f', theme: 'fantasy' })`), fx = get(`SLOTS.effects.opts({ g: 'f', theme: 'fantasy' })`);
  assert.ok(bg.every(v => !v.includes(',')) && fx.every(v => !v.includes(',')));
  assert.ok(bg.includes('castle') && fx.includes('sparkle'));
});
test('«одне з групи»: вибір тегів тієї самої групи не накопичується, інших груп — так', () => {
  const enforce = (id, vals) => plain(get(`mkEnforce(SLOTS['${id}'], ${JSON.stringify(vals)})`));
  assert.deepEqual(enforce('eyeDetail', ['tsurime', 'tareme']), ['tareme']);                       // розріз очей: одне
  assert.deepEqual(enforce('eyeDetail', ['tsurime', 'heart-shaped_pupils', 'long_eyelashes', 'thick_eyelashes']), ['tsurime', 'heart-shaped_pupils', 'long_eyelashes', 'thick_eyelashes']);
  assert.deepEqual(enforce('hairStyle', ['ponytail', 'twintails', 'wavy_hair']), ['twintails', 'wavy_hair']); // хвіст одного виду + текстура
  const rnd = get(`Array.from({ length: 40 }, () => mkSampleGrouped(SLOTS.eyeDetail, SLOTS.eyeDetail.opts({ g: 'f', theme: 'fantasy' }), 4))`);
  plain(rnd).forEach(vals => assert.deepEqual(plain(get(`mkEnforce(SLOTS.eyeDetail, ${JSON.stringify(vals)})`)), vals));
});
test('групи показуються на своїй ділянці: очі, рот, ноги, хвости', () => {
  const scope = (id, zone) => { const r = get(`(() => { const s = mkScope(SLOTS['${id}'], '${zone}'); return s && [...s]; })()`); return r && plain(r); };
  assert.equal(scope('eyeDetail', 'eyes'), null);                       // усі групи на очах
  assert.deepEqual(scope('raceFeat', 'pelvis'), ['Хвости']);
  assert.deepEqual(scope('raceFeat', 'hair').sort(), ['Незвичайне волосся', 'Роги']);
  assert.deepEqual(scope('makeup', 'mouth'), ['Помада й губи']);
  assert.deepEqual(scope('limbs', 'leg'), ['Ноги']);
  assert.ok(get(`MK.partSlots.pelvis.includes('raceFeat')`) && get(`MK.partSlots.mouth.includes('expression')`));
  assert.ok(scope('permFeat', 'head').every(n => /обличчі|Родимки й розмальовка/.test(n)), 'на голові лише групи обличчя');
});
test('нічого не загублено: кількість унікальних тегів не менша за базову', () => {
  const atoms = new Set();
  slotIds().forEach(id => { const sl = get(`SLOTS['${id}']`); if (sl.text) return; optsOf(id).forEach(v => v.split(/,\s*/).forEach(x => atoms.add(get(`mkNorm(${JSON.stringify(x)})`)))); });
  assert.ok(atoms.size >= 3800, 'унікальних тегів ' + atoms.size);
});
test('стать задається лише параметром «Стать»: у тегах тіла немає чоловічих/жіночих слів', () => {
  const re = /(female|male|girl|boy|woman|\bman\b|onee|bishounen|\bbara\b|pectoral)/i, bad = [];
  slotIds().forEach(id => { const sl = get(`SLOTS['${id}']`); if (sl.text || id === 'gender' || id.startsWith('px_') || /^(g|spr|framing)/.test(id)) return; optsOf(id).forEach(v => { if (re.test(v) && !/boyshorts|bare_pectorals|cowboy/.test(v)) bad.push(id + ': ' + v); }); });
  assert.equal(bad.length, 0, bad.join(' | '));
  ['m', 'f'].forEach(g => assert.deepEqual(plain(get(`SLOTS.breasts.opts({ g: '${g}', theme: 'dark' })`)), plain(get('G.breastsF_all'))));
});
test('кольори: складання тегу, розбір, найближча назва, підписи', () => {
  assert.equal(get(`colorize('wings', 'white')`), 'white wings');
  assert.equal(get(`colorize('angel_wings', 'dark_red')`), 'dark_red_angel_wings');
  assert.equal(get(`colorize('thighhighs', 'red', true)`), 'red_thighhighs');
  assert.deepEqual(plain(get(`uncolor('hot_pink_hair_ribbon')`)), { c: 'hot_pink', base: 'hair_ribbon' });
  assert.deepEqual(plain(get(`uncolor('pink bunny ears')`)), { c: 'pink', base: 'bunny ears' });
  assert.equal(get(`uncolor('wings')`), null);
  assert.equal(get(`nearestColor('#d00000')`), 'red');
  assert.equal(get(`nearestColor('#101010')`), 'black');
  assert.match(get(`mkLabel(SLOTS.raceFeat, 'pink_bunny_ears')`), /колір: рожевий/);
  assert.match(get(`mkLabel(SLOTS.hairColor, 'lavender_hair')`), /Волосся|лаванд/i);
  assert.match(get(`mkLabel(SLOTS.eyeColor, 'hot_pink_eyes')`), /Очі: яскраво-рожевий/);
  assert.ok(get(`COLORS.length`) >= 20 && get(`COLORS.every(c => /^#[0-9a-f]{6}$/.test(c[2]))`));
});
test('меню рас: кожна раса з меню є в параметрі «Раса», усі теги меню є в «Расових особливостях»', () => {
  const races = new Set(plain(optsOf('race'))), feats = new Set(plain(optsOf('raceFeat')));
  const menu = plain(get('RACE_MENU'));
  Object.entries(menu).forEach(([k, groups]) => {
    assert.ok(races.has(k), 'раси немає в параметрі race: ' + k);
    assert.ok(groups.length, k);
    groups.forEach(([name, tags]) => tags.split('|').forEach(t => assert.ok(feats.has(t), k + ' / ' + name + ': немає тегу ' + t)));
  });
  ['catfolk', 'foxfolk', 'wolffolk', 'rabbitfolk', 'dragonkin', 'monster', 'angel', 'demon', 'vampire', 'oni', 'kitsune'].forEach(k => assert.ok(menu[k], 'немає меню для ' + k));
  assert.ok(menu.rabbitfolk.some(g => g[1].includes('pom_pom_tail')) && menu.angel.some(g => g[1].includes('halo')));
});
test('палітра показується українською', () => {
  assert.match(get(`uaPalette(['crimson', 'teal', 'gold'])`), /домінує: багряний; другорядний: .*; акценти: /);
  assert.match(get(`uaPalette(['bone white and ash gray split complementary, mint for glowing parts'])`), /кістково-білий і попелясто-сірий/);
});
if (failed) { console.log('\nПровалено: ' + failed); process.exit(1); } else console.log('\nУсі перевірки пройдено');
