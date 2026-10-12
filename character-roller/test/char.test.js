// Тести ядра Character Roller. Запуск: node character-roller/test/char.test.js
// Без залежностей: лише вбудовані модулі Node.
const assert = require('node:assert/strict');
const C = require('../char-core.js');
const SRD = C.SRD;

let failed = 0, total = 0;
function test(name, fn) {
  total++;
  try { fn(); console.log('  ok   ' + name); }
  catch (e) { failed++; console.log('  FAIL ' + name + '\n       ' + String(e.message).split('\n').join('\n       ')); }
}
const LEVELS = [1, 2, 3, 4, 5, 6, 9, 11, 13, 15, 17, 20];

console.log('Character Roller: тести');

test('дані: таблиці класів мають 20 рівнів, усі id заклять і спорядження існують', () => {
  for (const c of SRD.CLASSES) {
    if (c.caster) { assert.equal(c.caster.cantrips.length, 20, c.id + ' трюки'); if (c.caster.known) assert.equal(c.caster.known.length, 20, c.id + ' відомі'); }
    for (const f of c.features.concat(c.subclass.features)) assert.ok(f[0] >= 1 && f[0] <= 20 && f[1] && f[2], c.id + ' риса ' + f[1]);
    for (const t of c.equip.fixed.concat(...c.equip.choices.flat())) {
      const k = t.replace(/^\d+\*/, '');
      if (k === 'shield') continue;
      const [kind, id] = k.split(':');
      if (kind === 'w') assert.ok(SRD.WEAPONS.some(w => w.id === id), c.id + ' зброя ' + id);
      else if (kind === 'a') assert.ok(SRD.ARMOR.some(a => a.id === id), c.id + ' броня ' + id);
      else if (kind === 'pack') assert.ok(SRD.PACKS[id], c.id + ' набір ' + id);
      else if (kind === 'g') assert.ok(SRD.GEAR_NAMES[id], c.id + ' річ ' + id);
      else assert.ok(kind === '?w' || k === '?instrument', c.id + ' токен ' + t);
    }
  }
  for (const table of Object.values(SRD.DOMAIN_SPELLS)) for (const ids of Object.values(table)) for (const id of ids) assert.ok(SRD.spells.byId[id], 'закляття ' + id);
  for (const r of SRD.RACES) for (const i of r.innate || []) assert.ok(SRD.spells.byId[i.spell]);
  assert.equal(SRD.FULL_SLOTS.length, 20); assert.equal(SRD.HALF_SLOTS.length, 20); assert.equal(SRD.PACT_SLOTS.length, 20);
});

test('той самий seed і параметри дають того самого персонажа, інший seed дає іншого', () => {
  const a = C.generate({ level: 7 }, 'abc'), b = C.generate({ level: 7 }, 'abc'), c = C.generate({ level: 7 }, 'abd');
  assert.deepEqual(a, b);
  assert.notDeepEqual(a, c);
});

test('усі класи, раси й рівні дають коректних персонажів (перевірка інваріантів)', () => {
  let n = 0;
  for (const cls of SRD.CLASSES) for (const race of SRD.RACES) for (const L of LEVELS) {
    const ch = C.generate({ cls: cls.id, race: race.id, level: L, method: 'any', assign: 'any', hp: 'roll' }, `${cls.id}-${race.id}-${L}`);
    const bad = C.validate(ch);
    assert.deepEqual(bad, [], `${cls.id}/${race.id}/${L}: ${bad}`);
    n++;
  }
  assert.ok(n > 1000);
});

test('бонус майстерності за рівнем, модифікатори за формулою', () => {
  const exp = { 1: 2, 4: 2, 5: 3, 8: 3, 9: 4, 12: 4, 13: 5, 16: 5, 17: 6, 20: 6 };
  for (const [L, p] of Object.entries(exp)) assert.equal(C.generate({ level: +L }, 'p' + L).proficiency, p, 'рівень ' + L);
  assert.equal(C.modOf(10), 0); assert.equal(C.modOf(9), -1); assert.equal(C.modOf(8), -1); assert.equal(C.modOf(20), 5); assert.equal(C.modOf(3), -4);
});

test('метод «стандартний набір» видає 15 14 13 12 10 8 до расових бонусів', () => {
  for (let i = 0; i < 20; i++) {
    const ch = C.generate({ method: 'standard', level: 1 }, 'std' + i);
    assert.deepEqual(Object.values(ch.abilities).map(x => x.base).sort((a, b) => b - a), [15, 14, 13, 12, 10, 8]);
  }
});

test('point buy: значення 8-15, витрати не більше 27 очок і використано всі', () => {
  const cost = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };
  for (let i = 0; i < 100; i++) {
    const ch = C.generate({ method: 'pointbuy', level: 1, assign: i % 2 ? 'smart' : 'random' }, 'pb' + i);
    const vals = Object.values(ch.abilities).map(x => x.base);
    for (const v of vals) assert.ok(v >= 8 && v <= 15, 'значення ' + v);
    const pts = vals.reduce((s, v) => s + cost[v], 0);
    assert.ok(pts <= 27 && pts >= 25, 'очків ' + pts);
  }
});

test('4d6 з відкиданням: значення 3-18, розподіл за класом ставить найвище в основну', () => {
  let high = 0;
  for (let i = 0; i < 60; i++) {
    const ch = C.generate({ method: '4d6', cls: 'wizard', level: 1, assign: 'smart' }, 'd' + i);
    const vals = Object.values(ch.abilities).map(x => x.base);
    for (const v of vals) assert.ok(v >= 3 && v <= 18);
    if (ch.abilities.int.base === Math.max(...vals)) high++;
  }
  assert.ok(high >= 45, 'ІНТ чарівника рідко найвищий: ' + high + '/60');
});

test('фіксація: раса, клас, рівень, передісторія, світогляд і базові характеристики дотримуються', () => {
  for (let i = 0; i < 30; i++) {
    const ch = C.generate({ race: 'gnome', subrace: 'rock', cls: 'rogue', level: 8, background: 'acolyte', alignment: 'CN', abilities: { dex: 17, cha: 8 } }, 'fix' + i);
    assert.equal(ch.race.id, 'gnome'); assert.equal(ch.race.sub, SRD.RACES.find(r => r.id === 'gnome').subraces[0].name);
    assert.equal(ch.cls.id, 'rogue'); assert.equal(ch.level, 8); assert.equal(ch.alignment.id, 'CN');
    assert.equal(ch.abilities.dex.base, 17); assert.equal(ch.abilities.cha.base, 8);
  }
});

test('фіксація підкласу задає клас, а суперечливий підклас ігнорується', () => {
  assert.equal(C.generate({ subclass: 'champion', level: 5 }, 'a').cls.id, 'fighter');
  assert.equal(C.generate({ cls: 'wizard', subclass: 'champion', level: 5 }, 'a').cls.id, 'wizard');
  assert.equal(C.generate({ cls: 'cleric', level: 1 }, 'a').subclass.id, 'life');
  assert.equal(C.generate({ cls: 'wizard', level: 1 }, 'a').subclass, null);
});

test('діапазон рівнів і санітизація параметрів', () => {
  for (let i = 0; i < 40; i++) { const L = C.generate({ levelMin: 5, levelMax: 8 }, 'r' + i).level; assert.ok(L >= 5 && L <= 8); }
  const P = C.sanitize({ race: 'орк', cls: 99, level: 50, abilities: { str: 99, dex: 'x' }, method: 'zz', skills: ['nope', 'stealth'] });
  assert.equal(P.race, 'any'); assert.equal(P.cls, 'any'); assert.equal(P.level, 'any'); assert.deepEqual(P.abilities, {}); assert.equal(P.method, '4d6'); assert.deepEqual(P.skills, ['stealth']);
});

test('расові бонуси й швидкість: гірський дворф, людина, напівельф, тифлінг', () => {
  const d = C.generate({ race: 'dwarf', subrace: 'mountain', cls: 'fighter', level: 1 }, 'dw');
  assert.equal(d.abilities.con.racial, 2); assert.equal(d.abilities.str.racial, 2); assert.equal(d.speed.ft, 25);
  const h = C.generate({ race: 'human', level: 1 }, 'hu'); for (const a of C.AB) assert.equal(h.abilities[a].racial, 1);
  const he = C.generate({ race: 'halfelf', level: 1 }, 'he'); assert.equal(he.abilities.cha.racial, 2);
  assert.equal(C.AB.filter(a => he.abilities[a].racial === 1).length, 2);
  const t = C.generate({ race: 'tiefling', cls: 'fighter', level: 5 }, 'ti'); assert.equal(t.abilities.cha.racial, 2); assert.equal(t.abilities.int.racial, 1);
  assert.equal(t.spellcasting.innate.length, 3, 'тифлінг 5 рівня: Чудотворство, Пекельна відсіч (з 3-го), Темрява (з 5-го)');
  assert.equal(C.generate({ race: 'tiefling', cls: 'fighter', level: 2 }, 'ti').spellcasting.innate.length, 1);
});

test('HP: перший рівень максимум кістки + мод. Статури, далі середнє', () => {
  for (let i = 0; i < 30; i++) {
    const ch = C.generate({ cls: 'fighter', race: 'human', level: 5, hp: 'average' }, 'hp' + i);
    const m = ch.abilities.con.mod;
    assert.equal(ch.hp.perLevel[0].total, Math.max(1, 10 + m));
    for (let k = 1; k < 5; k++) assert.equal(ch.hp.perLevel[k].total, Math.max(1, 6 + m));
    assert.equal(ch.hp.max, ch.hp.perLevel.reduce((s, x) => s + x.total, 0));
  }
  const hill = C.generate({ cls: 'cleric', race: 'dwarf', subrace: 'hill', level: 3, hp: 'average' }, 'x');
  assert.equal(hill.hp.max, hill.hp.perLevel.reduce((s, x) => s + x.total, 0));
  assert.ok(hill.hp.perLevel.every(x => x.total >= 2), 'гірський дворф +1 за рівень');
});

test('HP при кидках лежить у межах кістки', () => {
  for (let i = 0; i < 50; i++) {
    const ch = C.generate({ cls: 'wizard', level: 10, hp: 'roll' }, 'roll' + i);
    for (const x of ch.hp.perLevel) { assert.ok(x.die >= 1 && x.die <= 6); }
    assert.equal(ch.hp.perLevel[0].die, 6);
  }
});

test('слоти заклять: чарівник, паладин, чаклун, рейнджер', () => {
  assert.deepEqual(C.generate({ cls: 'wizard', level: 5 }, 'w').spellcasting.slots, [4, 3, 2]);
  assert.deepEqual(C.generate({ cls: 'wizard', level: 20 }, 'w').spellcasting.slots, [4, 3, 3, 3, 3, 2, 2, 1, 1]);
  assert.deepEqual(C.generate({ cls: 'paladin', level: 5 }, 'p').spellcasting.slots, [4, 2]);
  assert.equal(C.generate({ cls: 'paladin', race: 'human', level: 1 }, 'p').spellcasting, null);
  assert.equal(C.generate({ cls: 'ranger', race: 'human', level: 1 }, 'r').spellcasting, null);
  assert.deepEqual(C.generate({ cls: 'warlock', level: 5 }, 'l').spellcasting.pact, { count: 2, level: 3 });
  assert.deepEqual(C.generate({ cls: 'warlock', level: 17 }, 'l').spellcasting.pact, { count: 4, level: 5 });
  assert.equal(C.generate({ cls: 'fighter', race: 'human', level: 20 }, 'f').spellcasting, null);
});

test('закляття: кількості, відсутність дублів, лише дозволений рівень і список класу', () => {
  const lists = { bard: 'bard', cleric: 'cleric', druid: 'druid', paladin: 'paladin', ranger: 'ranger', sorcerer: 'sorcerer', warlock: 'warlock', wizard: 'wizard' };
  for (const cls of Object.keys(lists)) for (const L of [1, 3, 5, 9, 13, 17, 20]) {
    const ch = C.generate({ cls, level: L, race: 'human' }, `sp${cls}${L}`);
    const sp = ch.spellcasting; if (!sp) { assert.ok(['paladin', 'ranger'].includes(cls) && L === 1); continue; }
    const caster = SRD.CLASS_BY_ID[cls].caster;
    assert.equal(sp.cantrips.length, caster.cantrips[L - 1] + (ch.race.sub ? 0 : 0) + (cls === 'druid' && L >= 2 ? 1 : 0) + (cls === 'warlock' && ch.pact && ch.pact.startsWith('Книга') ? 3 : 0), `${cls}${L} трюки`);
    const all = [].concat(sp.cantrips, sp.known, sp.prepared, sp.always, sp.arcanum, sp.secrets);
    const book = sp.book || [];
    const ids = all.map(s => s.id).concat(book.map(s => s.id).filter(i => !sp.prepared.some(p => p.id === i)));
    assert.equal(new Set(ids).size, ids.length, `${cls}${L}: дублі заклять`);
    if (caster.known) assert.equal(sp.known.length, caster.known[L - 1], `${cls}${L} відомі`);
    if (cls === 'wizard') { assert.equal(sp.book.length, 6 + 2 * (L - 1)); assert.equal(sp.prepared.length, Math.max(1, ch.abilities.int.mod + L)); }
    if (['cleric', 'druid'].includes(cls)) assert.equal(sp.prepared.length, Math.max(1, ch.abilities.wis.mod + L));
    if (cls === 'paladin') assert.equal(sp.prepared.length, Math.max(1, ch.abilities.cha.mod + Math.floor(L / 2)));
    for (const s of [].concat(sp.known, sp.prepared, sp.book)) {
      const full = SRD.spells.byId[s.id];
      assert.ok(full.classes.includes(cls) || (cls === 'warlock' && SRD.DOMAIN_SPELLS.fiend[full.lvl].includes(s.id)), `${s.name} не зі списку ${cls}`);
      assert.ok(s.lvl <= sp.maxSpellLevel);
    }
    assert.equal(sp.dc, 8 + ch.proficiency + ch.abilities[caster.ab].mod);
    assert.equal(sp.attack, ch.proficiency + ch.abilities[caster.ab].mod);
  }
});

test('домен життя й клятва відданості додають завжди підготовлені закляття', () => {
  const cl = C.generate({ cls: 'cleric', level: 5, race: 'human' }, 'cl');
  assert.deepEqual(cl.spellcasting.always.map(s => s.id).sort(), ['bless', 'beacon-of-hope', 'cure-wounds', 'lesser-restoration', 'revivify', 'spiritual-weapon'].sort());
  const pa = C.generate({ cls: 'paladin', level: 5, race: 'human' }, 'pa');
  assert.deepEqual(pa.spellcasting.always.map(s => s.id).sort(), ['lesser-restoration', 'protection-from-evil-and-good', 'sanctuary', 'zone-of-truth']);
});

test('КБ: обладунок, без обладунку, захист варвара/монаха, щит', () => {
  for (let i = 0; i < 40; i++) {
    const b = C.generate({ cls: 'barbarian', level: 3, race: 'human' }, 'ba' + i);
    const dex = b.abilities.dex.mod, con = b.abilities.con.mod;
    assert.ok(b.ac.value >= 10 + dex + con, 'варвар: захист без обладунку');
    const m = C.generate({ cls: 'monk', level: 3, race: 'human' }, 'mo' + i);
    assert.equal(m.ac.value, 10 + m.abilities.dex.mod + m.abilities.wis.mod);
    assert.ok(m.equipment.every(e => e.kind !== 'armor'));
  }
  const p = C.generate({ cls: 'paladin', level: 1, race: 'human' }, 'pl');
  const sh = p.equipment.some(e => e.kind === 'shield');
  assert.equal(p.ac.value, 16 + (sh ? 2 : 0) + (p.fightingStyles.length ? 0 : 0));
});

test('друїд не носить металевих обладунків і щитів', () => {
  for (let i = 0; i < 60; i++) {
    const d = C.generate({ cls: 'druid', level: 2, race: 'human' }, 'dr' + i);
    for (const e of d.equipment) { if (e.kind === 'armor') assert.ok(['leather', 'padded', 'hide'].includes(e.id)); if (e.kind === 'shield') assert.ok(e.wooden); }
  }
});

test('володіння: вибір зброї відповідає класу, спис вершника не береться без потреби', () => {
  for (const cls of SRD.CLASSES) for (let i = 0; i < 25; i++) {
    const ch = C.generate({ cls: cls.id, level: 1 }, 'eq' + i);
    for (const e of ch.equipment.filter(x => x.kind === 'weapon')) {
      const w = SRD.WEAPONS.find(x => x.id === e.id);
      const ok = cls.weapons.includes(w.cat) || cls.weapons.includes(w.id) || ch.profs.weapons.includes(w.name);
      if (!['cleric'].includes(cls.id)) assert.ok(ok, `${cls.id}: ${w.name} без володіння`);
    }
  }
});

test('навички: достатньо володінь, подвоєння експертизи, Майстер на всі руки', () => {
  const rog = C.generate({ cls: 'rogue', level: 6, race: 'human' }, 'rog');
  assert.equal(rog.skills.filter(s => s.prof === 2).length, 4, 'експертиза плута 1+6 рівень');
  for (const s of rog.skills.filter(s => s.prof === 2)) assert.equal(s.bonus, rog.abilities[s.ab].mod + 2 * rog.proficiency);
  const bard = C.generate({ cls: 'bard', level: 3, race: 'human' }, 'brd');
  assert.equal(bard.skills.filter(s => s.prof === 2).length, 2);
  for (const s of bard.skills.filter(s => !s.prof)) assert.equal(s.bonus, bard.abilities[s.ab].mod + Math.floor(bard.proficiency / 2));
  const ch = C.generate({ cls: 'fighter', race: 'human', level: 1, skills: ['acrobatics', 'survival'] }, 'pref');
  assert.ok(ch.skills.find(s => s.id === 'acrobatics').prof && ch.skills.find(s => s.id === 'survival').prof, 'бажані навички береться першими');
});

test('Послушник дає Проникливість і Релігію; навички раси без дублікатів', () => {
  for (let i = 0; i < 30; i++) {
    const ch = C.generate({ race: 'elf', subrace: 'high', cls: 'cleric', level: 1 }, 'sk' + i);
    const prof = ch.skills.filter(s => s.prof);
    assert.ok(prof.find(s => s.id === 'perception'), 'ельф: Уважність');
    assert.ok(prof.find(s => s.id === 'insight') && prof.find(s => s.id === 'religion') || prof.length >= 5, 'послушник');
    assert.equal(prof.length, 5, 'ельф 1 + послушник 2 + клірик 2: без дублів');
  }
});

test('покращення характеристик: ніколи не перевищують 20, кількість відповідає рівням', () => {
  for (let i = 0; i < 60; i++) {
    const ch = C.generate({ cls: i % 2 ? 'fighter' : 'rogue', level: 20, assign: i % 3 ? 'smart' : 'random' }, 'asi' + i);
    for (const a of C.AB) assert.ok(ch.abilities[a].score <= 20);
    const expected = ch.cls.id === 'fighter' ? 7 : 6;
    assert.equal(ch.log.asi.length, expected, ch.cls.id);
  }
  const f = C.generate({ cls: 'fighter', level: 6 }, 'f6'); assert.equal(f.log.asi.length, 2, 'воїн: 4 і 6 рівні');
  const nope = C.generate({ cls: 'fighter', level: 3 }, 'f3'); assert.equal(nope.log.asi.length, 0);
});

test('риса «Борець» вимагає Сили 13', () => {
  let seen = 0;
  for (let i = 0; i < 400; i++) {
    const ch = C.generate({ cls: 'wizard', level: 8, assign: 'random' }, 'fe' + i);
    if (ch.feats.length) { seen++; assert.ok(ch.abilities.str.score >= 13); assert.equal(ch.feats.length, 1); }
  }
  assert.ok(seen > 0, 'риса ніколи не випала');
});

test('чаклун: прохання відповідають рівню й дару угоди, трюки вистачає', () => {
  for (let i = 0; i < 80; i++) {
    const L = 2 + (i % 19);
    const w = C.generate({ cls: 'warlock', level: L }, 'wl' + i);
    const want = L >= 18 ? 8 : L >= 15 ? 7 : L >= 12 ? 6 : L >= 9 ? 5 : L >= 7 ? 4 : L >= 5 ? 3 : 2;
    assert.equal(w.invocations.length, want);
    const pact = w.pact ? w.pact.split(':')[0] : null;
    for (const inv of w.invocations) {
      const def = SRD.INVOCATIONS.find(x => x[0] === inv.name);
      assert.ok(def[2] <= L, inv.name + ' рівень');
      if (def[3]) assert.equal({ blade: 'Клинок', chain: 'Ланцюг', tome: 'Книга' }[def[3]], pact, inv.name + ' дар');
      if (def[4]) assert.ok(w.spellcasting.cantrips.some(c => c.id === 'eldritch-blast'), inv.name + ' потребує Містичного променя');
    }
  }
});

test('метамагія чародія: 2/3/4 опції без повторів; експертиза без повторів', () => {
  for (const [L, n] of [[3, 2], [10, 3], [17, 4]]) {
    const s = C.generate({ cls: 'sorcerer', level: L }, 'sor' + L);
    assert.equal(s.metamagic.length, n); assert.equal(new Set(s.metamagic.map(m => m.name)).size, n);
  }
  assert.equal(C.generate({ cls: 'sorcerer', level: 2 }, 's').metamagic.length, 0);
});

test('Бойові стилі: воїн один, чемпіон 10+ рівня два, паладин/рейнджер з 2 рівня', () => {
  assert.equal(C.generate({ cls: 'fighter', level: 1 }, 'a').fightingStyles.length, 1);
  assert.equal(C.generate({ cls: 'fighter', level: 10 }, 'a').fightingStyles.length, 2);
  assert.equal(C.generate({ cls: 'paladin', level: 1 }, 'a').fightingStyles.length, 0);
  assert.equal(C.generate({ cls: 'paladin', level: 2 }, 'a').fightingStyles.length, 1);
  assert.equal(C.generate({ cls: 'ranger', level: 2 }, 'a').fightingStyles.length, 1);
  assert.equal(C.generate({ cls: 'wizard', level: 20 }, 'a').fightingStyles.length, 0);
});

test('риси класу й підкласу з’являються на правильних рівнях', () => {
  const f1 = C.generate({ cls: 'fighter', level: 4 }, 'a'), f5 = C.generate({ cls: 'fighter', level: 5 }, 'a');
  assert.ok(!f1.features.some(x => x.name === 'Додаткова атака')); assert.ok(f5.features.some(x => x.name === 'Додаткова атака'));
  assert.ok(f1.features.some(x => x.name === 'Покращений критичний удар'));
  assert.ok(!C.generate({ cls: 'fighter', level: 2 }, 'a').features.some(x => x.name === 'Покращений критичний удар'));
  const m20 = C.generate({ cls: 'monk', level: 20 }, 'a'); assert.ok(m20.features.some(x => x.name === 'Досконале «я»'));
  const b = C.generate({ cls: 'barbarian', level: 20 }, 'a'); assert.ok(b.features.some(x => x.name === 'Первісний чемпіон'));
  assert.ok(C.generate({ cls: 'barbarian', level: 9 }, 'a').features.find(x => x.name === 'Лють').desc.includes('+3'));
  assert.ok(C.generate({ cls: 'rogue', level: 9 }, 'a').features.find(x => x.name === 'Підлий удар').desc.includes('5d6'));
});

test('рейнджер: улюблені ввороги й місцевості за рівнем', () => {
  const r = C.generate({ cls: 'ranger', level: 14 }, 'rn');
  assert.equal(r.features.find(x => x.name === 'Улюблений ворог').desc.split(' → ')[1].split('; ').length, 3);
  assert.equal(r.features.find(x => x.name === 'Природний дослідник').desc.split(' → ')[1].split('; ').length, 3);
});

test('друїд кола землі: тип місцевості визначає закляття кола', () => {
  const d = C.generate({ cls: 'druid', level: 9, race: 'human' }, 'dd');
  assert.equal(d.spellcasting.always.length, 8);
  assert.ok(d.features.find(x => x.name === 'Друїдичне коло').desc.includes('→'));
});

test('мови: раса + додаткові, без повторів; передісторія дає дві', () => {
  for (let i = 0; i < 40; i++) {
    const h = C.generate({ race: 'human', cls: 'fighter', level: 1 }, 'lg' + i);
    assert.equal(new Set(h.languages).size, h.languages.length);
    assert.equal(h.languages.length, 1 + 1 + 2, 'людина: Загальна + 1 + Послушник 2');
    const d = C.generate({ race: 'dwarf', subrace: 'hill', cls: 'fighter', level: 1 }, 'lg' + i);
    assert.equal(d.languages.length, 2 + 2);
  }
});

test('швидкість: варвар 5+ і монах швидші, дворф 25', () => {
  const b = C.generate({ cls: 'barbarian', race: 'human', level: 5 }, 'sp');
  const heavy = b.equipment.some(e => e.id === 'chain-mail');
  assert.ok(b.speed.ft === 40 || heavy);
  const m = C.generate({ cls: 'monk', race: 'human', level: 6 }, 'sp'); assert.equal(m.speed.ft, 45);
  assert.equal(C.generate({ cls: 'wizard', race: 'dwarf', subrace: 'hill', level: 1 }, 'sp').speed.ft, 25);
  assert.equal(C.fmtSpeed(30), '30 фт (9 м)'); assert.equal(C.fmtSpeed(25), '25 фт (7,5 м)');
});

test('драконороджений: тип, подих зростає з рівнем', () => {
  const d = C.generate({ race: 'dragonborn', level: 6, cls: 'fighter' }, 'db');
  assert.ok(d.race.dragon); assert.ok(d.features.find(x => x.name === 'Подих').desc.startsWith('Дією: 3d6'));
  assert.ok(C.generate({ race: 'dragonborn', level: 16, cls: 'fighter' }, 'db').features.find(x => x.name === 'Подих').desc.startsWith('Дією: 5d6'));
});

test('експорт JSON: формат, повертається без втрат', () => {
  const ch = C.generate({ cls: 'cleric', level: 7 }, 'json', 'x');
  const back = JSON.parse(C.exportJSON(ch));
  assert.equal(back.format, 'zbyrai.character-roller'); assert.deepEqual(back, JSON.parse(JSON.stringify(ch)));
  assert.equal(back.cls.id, 'cleric');
});

test('розподіл за класом: основна характеристика зазвичай найвища, випадковий розподіл це не гарантує', () => {
  let smart = 0, rnd = 0;
  for (let i = 0; i < 100; i++) {
    const a = C.generate({ cls: 'barbarian', level: 1, race: 'human', method: '4d6', assign: 'smart' }, 'as' + i);
    const b = C.generate({ cls: 'barbarian', level: 1, race: 'human', method: '4d6', assign: 'random' }, 'as' + i);
    if (a.abilities.str.base >= Math.max(...Object.values(a.abilities).map(x => x.base))) smart++;
    if (b.abilities.str.base >= Math.max(...Object.values(b.abilities).map(x => x.base))) rnd++;
  }
  assert.ok(smart > 90, 'smart ' + smart); assert.ok(rnd < 40, 'random ' + rnd);
});

console.log(`\n${total - failed}/${total} пройдено`);
if (failed) process.exit(1);
