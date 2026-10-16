// Тести режиму Flux (жива мова). Запуск: node prompt-dice/test/flux.test.js
const assert = require('node:assert/strict');
const L = require('../flux-grammar.js');
let failed = 0;
const test = (n, f) => { try { f(); console.log('  ok  ', n); } catch (e) { failed++; console.log('  FAIL', n, '\n      ', e.message); } };
const mk = o => id => o[id] || [];
const text = (kind, o, theme) => L.paragraphs(kind, mk(o), theme).join('\n\n');

test('порожні параметри дають порожній результат (шматки пропускаються)', () => {
  assert.deepEqual(L.paragraphs('char', mk({})), []);
  assert.deepEqual(L.paragraphs('scene', mk({})), []);
});
test('волосся: довжина, колір, зачіска, деталь в одному реченні', () => {
  const t = text('char', { gender: ['1girl'], hairLen: ['long_hair'], hairColor: ['silver_hair'], hairStyle: ['high_ponytail'], hairDetail: ['ahoge'] });
  assert.match(t, /Her long silver hair is pulled into a high ponytail, with a stray ahoge curling up from the crown\./);
});
test('волосся без зачіски й довжини: лише колір; немає тегів: речення немає', () => {
  assert.match(text('char', { gender: ['1boy'], hairColor: ['black_hair'] }), /His black hair\./);
  assert.ok(!/hair/i.test(text('char', { gender: ['1boy'], eyeColor: ['blue_eyes'] })));
});
test('умова: світяться очі + колір + зіниці', () => {
  assert.match(text('char', { gender: ['1girl'], eyeColor: ['red_eyes'], eyeDetail: ['glowing_eyes', 'slit_pupils'] }), /Her red eyes glow from within, with slit pupils\./);
  assert.match(text('char', { gender: ['1girl'], eyeColor: ['glowing_eyes'] }), /Her eyes glow with an inner light\./);
  assert.match(text('char', { gender: ['1girl'], eyeColor: ['heterochromia'] }), /two different colors/);
  assert.match(text('char', { gender: ['1girl'], eyeColor: ['blue_eyes'] }), /She has blue eyes\./);
});
test('кольорове пасмо й внутрішній шар у волоссі', () => {
  assert.match(text('char', { gender: ['1girl'], hairColor: ['white_hair', 'blue_streaks'] }), /white hair with blue streaks/);
  assert.match(text('char', { gender: ['1girl'], hairColor: ['black_hair, red_inner_hair'] }), /black hair with a red inner layer/);
});
test('особа: рід, вік, раса, шкіра', () => {
  assert.match(text('char', { gender: ['1girl'], age: ['adult'], race: ['dark_elf'], skin: ['colored_skin, blue_skin'] }), /^An adult dark elf woman with blue skin\./);
  assert.match(text('char', { gender: ['1boy'], race: ['cat_boy'] }), /^A cat-eared man\./);
  assert.match(text('char', { race: ['elf'] }), /^An elf character\./);
});
test('обличчя: емоція, рот, очі в одному абзаці', () => {
  const t = text('char', { gender: ['1girl'], emotion: ['smirk'], expression: ['parted_lips'], eyeExpr: ['narrowed_eyes'] });
  assert.match(t, /She smirks with quiet confidence\. Her lips are slightly parted and her eyes are narrowed\./);
});
test('поза: дієслово, руки, ноги, дія, погляд з присвійним словом', () => {
  const t = text('char', { gender: ['1girl'], pose: ['standing'], armPos: ['hand_on_hip'], legPos: ['crossed_legs'], action: ['adjusting_hair'], gaze: ['looking_back'] });
  assert.match(t, /She stands with one hand on her hip and her legs crossed, caught adjusting her hair\./);
  assert.match(t, /She looks back over her shoulder\./);
  assert.match(text('char', { gender: ['1boy'], armPos: ['arms_crossed'] }), /with his arms crossed/);
});
test('одяг: комплект + стан, зброя без дублів, взуття, аксесуари', () => {
  const t = text('char', { gender: ['1girl'], outfit: ['white_dress, gold_trim, corset'], outState: ['torn_clothes'], weapon: ['holding_sword, longsword, glowing_sword'], footwear: ['thigh_boots'], accessories: ['choker', 'earrings'] });
  assert.match(t, /She wears a white dress, a gold trim and a corset, and the clothing is torn\./);
  assert.match(t, /She holds a longsword and a glowing sword\./);
  assert.match(t, /On her feet: thigh boots\./);
  assert.match(t, /adorned with a choker and earrings/);
});
test('тіло: прикметники й особливості', () => {
  assert.match(text('char', { gender: ['1girl'], build: ['curvy', 'narrow_waist', 'toned'], limbs: ['long_legs'] }), /Her build is curvy and toned, with a narrow waist and long legs\./);
});
test('локація: інтер’єр/екстер’єр, фон, час і погода, світло', () => {
  const t = text('scene', { io: ['outdoors'], background: ['castle', 'stone_wall'], timeOfDay: ['golden_hour'], weather: ['clear_sky'], lighting: ['rim_light', 'god_rays'], atmosphere: ['warm and nostalgic'] }, 'high fantasy');
  assert.match(t, /^Theme: high fantasy\. The scene is set outdoors, with castle and stone wall\./);
  assert.match(t, /The time is golden hour, with a clear sky\./); assert.match(t, /The lighting features rim light and god rays\./); assert.match(t, /The mood is warm and nostalgic\./);
});
test('спрайт-лист: персонаж, одяг, специфікація листа', () => {
  const t = text('sprite', { gender: ['1girl'], hairColor: ['red_hair'], sprViews: ['front view', 'back view'], sprBg: ['plain flat white background'] });
  assert.match(t, /front view and back view/); assert.match(t, /Background: plain flat white background\./); assert.ok(!/Image format|The view is/.test(t));
});
test('невідомі теги не ламають: загальне перетворення', () => {
  const t = text('char', { gender: ['1girl'], emotion: ['weird_tag'], eyeDetail: ['odd_thing'], pose: ['do_a_flip'], hairStyle: ['mystery_cut'] });
  assert.ok(t.includes('weird tag') && t.includes('odd thing') && t.includes('do a flip') && t.includes('mystery cut'));
});
test('повний випадковий набір усіх типів: без сирих тегів і без порожніх речень', () => {
  const vm = require('node:vm'), fs = require('node:fs'), path = require('node:path');
  const dir = path.join(__dirname, '..'), c = { document: { getElementById: () => null }, console, Math }; vm.createContext(c);
  for (const f of ['pools.js', 'types.js']) vm.runInContext(fs.readFileSync(path.join(dir, f), 'utf8'), c, { filename: f });
  vm.runInContext('this.SLOTS=SLOTS;this.THEMES=THEMES;this.TYPES=TYPES;this.pick=pick;this.sample=sample;this.rnd=rnd;', c);
  const kinds = ['char', 'sprite', 'scene'];
  for (let i = 0; i < 400; i++) {
    const kind = kinds[i % 3], theme = Object.keys(c.THEMES)[i % Object.keys(c.THEMES).length];
    const g = Math.random() < 0.5 ? 'f' : 'm', ctx = { g, theme }, vals = {};
    for (const sl of Object.values(c.SLOTS)) {
      if (sl.models && !sl.models.includes('flux')) continue;
      if (sl.id.startsWith('px_') || Math.random() > (typeof sl.p === 'function' ? sl.p(ctx) : sl.p)) continue;
      if (sl.gen) { vals[sl.id] = sl.gen(ctx); continue; }
      const o = sl.opts(ctx); if (!o.length) continue;
      vals[sl.id] = sl.kind === 'multi' ? c.sample(o, sl.n[0] + c.rnd(sl.n[1] - sl.n[0] + 1)) : [c.pick(o)];
    }
    const out = L.paragraphs(kind, id => vals[id] || [], c.THEMES[theme].nl).join('\n\n');
    assert.ok(out.length > 20, 'порожньо');
    assert.ok(!/_/.test(out.replace(/_{0}/g, '')), 'сирий тег: ' + (out.match(/\S*_\S*/) || [''])[0]);
    assert.ok(!/undefined|\[object|NaN|\bnull\b/.test(out), 'сміття: ' + out.slice(0, 200));
    assert.ok(!/ {2,}|\.\.|, ,|,\.| \./.test(out), 'пунктуація: ' + (out.match(/.{20}( {2,}|\.\.|, ,|,\.| \.).{10}/) || [''])[0]);
    assert.ok(!/~/.test(out), 'непідставлене ~');
  }
});
console.log(failed ? `\n${failed} не пройдено` : '\nУсі перевірки пройдено');
process.exit(failed ? 1 : 0);
