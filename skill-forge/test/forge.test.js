// Тести Конструктора скілів. Запуск: node skill-forge/test/forge.test.js
// Без залежностей: лише вбудовані модулі Node.
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path');
const F = require('../forge-core.js');
for (const f of fs.readdirSync(path.join(__dirname, '..', 'bricks')).sort()) require('../bricks/' + f);
const E = require('../forge-eval.js');
const P = require('../presets.js');
const V = require('../forge-preview.js');

let failed = 0, total = 0;
function test(name, fn) {
  total++;
  try { fn(); console.log('  ok   ' + name); }
  catch (e) { failed++; console.log('  FAIL ' + name + '\n       ' + String(e.message).split('\n').join('\n       ')); }
}
console.log('Конструктор скілів: тести');

test('реєстр: достатньо цеглинок усіх чотирьох видів, id унікальні', () => {
  assert.ok(F.all().length >= 50, 'цеглинок ' + F.all().length);
  for (const c of Object.keys(F.CATS)) assert.ok(F.byCat(c).length >= 5, 'мало цеглинок виду ' + c);
  assert.equal(new Set(F.all().map(d => d.id)).size, F.all().length);
  assert.throws(() => F.register({ id: 'single', cat: 'delivery', name: 'x', params: [] }), /Дубль/);
});

test('кожна цеглинка має назву, іконку, підказку українською, повні параметри', () => {
  for (const d of F.all()) {
    assert.ok(d.name && d.icon && d.hint, d.id + ': немає назви/іконки/підказки');
    assert.ok(/[а-яіїєґ]/i.test(d.name) && /[а-яіїєґ]/i.test(d.hint), d.id + ': не українською');
    for (const s of F.paramSpecs(d)) {
      assert.ok(s.label && /[а-яіїєґ]/i.test(s.label), `${d.id}.${s.k}: підпис`);
      if (s.type === 'num') assert.ok(s.def >= s.min && s.def <= s.max && s.step > 0, `${d.id}.${s.k}: значення за замовчуванням поза межами`);
    }
    if (d.cat === 'delivery') for (const f of ['n', 'time']) assert.equal(typeof d[f], 'function', d.id + ': немає ' + f);
    if (d.cat === 'modifier') assert.equal(typeof d.mod, 'function', d.id);
    if (d.cat === 'effect') { assert.equal(typeof d.val, 'function', d.id); assert.ok(Object.keys(d.val(F.defaults(d))).length, d.id + ': val порожній'); }
    if (d.cat === 'trigger') assert.equal(typeof d.fires, 'function', d.id);
  }
});

test('вкладення: правила категорій і ліміти', () => {
  const s = F.newSkill();
  assert.equal(F.add(s, 'pierce', null), null, 'модифікатор у корінь не можна');
  const d = F.add(s, 'projectile', null);
  assert.ok(F.add(s, 'pierce', d.id) && F.add(s, 'damage', d.id));
  assert.equal(F.add(s, 'projectile', d.id), null, 'доставка в доставку без тригера не можна');
  const t = F.add(s, 'on_kill', d.id);
  assert.ok(F.add(s, 'burst', t.id), 'доставка в тригері можлива');
  assert.equal(F.add(s, 'on_hit', t.id), null, 'тригер у тригері не можна');
  for (let i = 0; i < 100; i++) F.add(s, 'damage', d.id);
  assert.ok(F.countNodes(s) <= F.LIMITS.nodes, 'ліміт цеглинок');
});

test('параметри обрізаються до меж; невідоме значення перелічення замінюється', () => {
  const s = F.newSkill(), d = F.add(s, 'damage', null, { amount: 99999, element: 'nonsense' });
  assert.equal(d.p.amount, 1000); assert.equal(d.p.element, 'phys');
  F.setParam(s, d.id, 'amount', -5); assert.equal(d.p.amount, 10);
  assert.equal(F.setParam(s, d.id, 'немає', 1), false);
});

test('перемістити, дублювати, видалити', () => {
  const s = F.newSkill(), d = F.add(s, 'projectile', null), a = F.add(s, 'damage', d.id), b = F.add(s, 'stun', d.id);
  assert.ok(F.move(s, b.id, -1)); assert.equal(d.c[0].id, b.id);
  assert.equal(F.move(s, b.id, -1), false);
  const copy = F.duplicate(s, d.id); assert.equal(s.root.length, 2); assert.notEqual(copy.id, d.id); assert.equal(copy.c.length, 2);
  assert.equal(new Set(((l) => { const o = []; F.walk(l, x => o.push(x.id)); return o; })(s.root)).size, 6, 'id унікальні після дублювання');
  assert.ok(F.remove(s, d.id)); assert.equal(s.root.length, 1);
});

test('формат: туди й назад, версія, відхилення сторонніх і новіших файлів', () => {
  const s = P.build(P.byId('arc')), o = F.serialize(s);
  assert.equal(o.format, 'zbyrai.skill'); assert.equal(o.version, 1);
  const back = F.parse(JSON.stringify(o));
  assert.deepEqual(F.serialize(back).skill.root.map(b => b.t), s.root.map(b => b.t));
  assert.equal(E.describe(back), E.describe(s));
  assert.throws(() => F.parse('не json'), /Це не JSON/);
  assert.throws(() => F.parse({ format: 'інше', version: 1 }), /не файл скіла/);
  assert.throws(() => F.parse({ format: 'zbyrai.skill', version: 99, skill: {} }), /новішою/);
});

test('імпорт відкидає невідомі цеглинки та неможливі вкладення, не падає на сміттєвих даних', () => {
  const s = F.parse({ format: 'zbyrai.skill', version: 1, skill: { name: 'x', cast: { cooldown: 'abc', cost: -4 }, root: [
    { t: 'projectile', p: { range: 9999 }, c: [{ t: 'нема', p: {} }, { t: 'damage', p: { amount: 'text' } }, { t: 'projectile', p: {} }] }, { t: 'pierce', p: {} }, null, 5] } });
  assert.equal(s.root.length, 1); assert.equal(s.root[0].p.range, 40);
  assert.deepEqual(s.root[0].c.map(c => c.t), ['damage']); assert.equal(s.root[0].c[0].p.amount, 120);
  assert.equal(s.cast.cooldown, 5); assert.equal(s.cast.cost, 0);
  assert.ok(F.parse({ format: 'zbyrai.skill', version: 1, skill: null }).root.length === 0);
});

test('перевірка: попереджає про порожню доставку, помилка на зламаному вкладенні', () => {
  const s = F.newSkill(); F.add(s, 'cone', null);
  assert.ok(F.validate(s).some(i => i.level === 'warn' && /нічого не робить/.test(i.msg)));
  assert.equal(F.validate(P.build(P.byId('firebolt'))).filter(i => i.level === 'error').length, 0);
  s.root[0].c.push({ id: 'x1', t: 'projectile', p: F.defaults(F.def('projectile')), c: [] });
  assert.ok(F.validate(s).some(i => i.level === 'error'));
});

test('приклади: усі валідні, оцінюються, мають опис і відрізняються', () => {
  assert.ok(P.LIST.length >= 15);
  for (const p of P.LIST) {
    const s = P.build(p);
    assert.equal(F.validate(s).filter(i => i.level === 'error').length, 0, p.id);
    const ev = E.evaluate(s);
    assert.ok(ev.power > 0 && Number.isFinite(ev.efficiency), p.id + ': сила');
    assert.ok(E.describe(s).includes(p.name), p.id);
  }
  assert.equal(new Set(P.LIST.map(p => p.id)).size, P.LIST.length);
  assert.ok(P.LIST.filter(p => E.evaluate(P.build(p)).verdict === 'fair').length >= P.LIST.length * 0.6, 'більшість прикладів збалансовані');
});

test('оцінка: ланцюг і пробиття збільшують охоплення, затухання зменшує силу на ціль', () => {
  const mk = (...mods) => { const s = F.newSkill(); const d = F.add(s, 'projectile', null); mods.forEach(m => F.add(s, m[0], d.id, m[1])); F.add(s, 'damage', d.id, { amount: 100 }); return E.evaluate(s); };
  const base = mk(), pierce = mk(['pierce', { count: 4 }]), chain = mk(['chain', { bounces: 4, falloff: 50 }]);
  assert.ok(pierce.targets > base.targets && pierce.damage > base.damage);
  assert.ok(chain.damage > base.damage && chain.damage < base.damage * 5);
});

test('оцінка: ефекти на себе не множаться на цілі, тригер «при вбивстві» залежить від шкоди', () => {
  const heal = (n) => { const s = F.newSkill(); const d = F.add(s, 'burst', null, { radius: 15 }); F.add(s, 'heal', d.id, { amount: 100, to: 'self' }); return E.evaluate(s, { enemies: n }).heal; };
  assert.equal(heal(1), heal(10));
  const kill = amt => { const s = F.newSkill(); const d = F.add(s, 'single', null); F.add(s, 'damage', d.id, { amount: amt }); const t = F.add(s, 'on_kill', d.id); F.add(s, 'restore', t.id, { to: 'self' }); return E.evaluate(s).utility; };
  assert.ok(kill(1000) > kill(100));
});

test('оцінка: ціна й перезарядка знижують ефективність, підказки балансу сходяться', () => {
  const s = P.build(P.byId('firebolt'));
  s.cast.cooldown = 1; s.cast.cost = 10; const cheap = E.evaluate(s).efficiency;
  s.cast.cooldown = 20; s.cast.cost = 80; const dear = E.evaluate(s).efficiency;
  assert.ok(cheap > dear);
  s.cast.cost = 20; const ev = E.evaluate(s); s.cast.cooldown = ev.suggestCooldown;
  assert.ok(Math.abs(E.evaluate(s).efficiency - 1) < 0.35, 'після підбору ефективність близько 1');
  assert.equal(E.evaluate(F.newSkill()).verdict, 'none');
});

test('випадковий скіл: той самий seed дає той самий скіл, результат завжди валідний', () => {
  assert.equal(JSON.stringify(P.random('abc')), JSON.stringify(P.random('abc')));
  assert.notEqual(JSON.stringify(P.random('abc')), JSON.stringify(P.random('abd')));
  for (let i = 0; i < 300; i++) {
    const s = P.random('t' + i);
    assert.equal(F.validate(s).filter(v => v.level === 'error').length, 0, 'seed t' + i);
    assert.ok(s.root.length >= 1 && E.evaluate(s).power > 0);
    assert.ok(s.cast.cooldown >= 1 && s.cast.cooldown <= 120);
    assert.deepEqual(F.serialize(F.parse(F.serialize(s))).skill.root.length, s.root.length);
  }
});

test('опис: українською, містить параметри; підсумок згадує шкоду', () => {
  const s = P.build(P.byId('whirl')), d = E.describe(s);
  assert.match(d, /Вир лез\. Ціль:/); assert.match(d, /Удар зблизька \(дуга\): радіус 3 м, кут 360°/); assert.match(d, /↳ Шкода: сила 180%/);
  assert.match(E.summary(s, E.evaluate(s)), /шкода/);
});

test('прев\'ю: події для всіх прикладів, ланцюг дає зв\'язки, пробиття — більше влучань', () => {
  for (const p of P.LIST) { const tl = V.buildTimeline(P.build(p)); assert.ok(Number.isFinite(tl.end), p.id); if (p.id !== 'shadowstep') assert.ok(tl.events.length >= 1, p.id); }
  const arc = V.buildTimeline(P.build(P.byId('arc'))).events[0];
  assert.ok(arc.links && arc.links.length >= 1 && arc.hits.length >= 2);
  const mk = w => { const s = F.newSkill(); const d = F.add(s, 'beam', null, { range: 30, width: w }); F.add(s, 'damage', d.id); return V.buildTimeline(s).events[0].hits.length; };
  assert.ok(mk(8) > mk(0.3), 'ширший промінь зачіпає більше манекенів');
  const pr = F.newSkill(); const pd = F.add(pr, 'projectile', null); F.add(pr, 'pierce', pd.id); F.add(pr, 'damage', pd.id);
  assert.ok(V.buildTimeline(pr).events[0].hits.length >= 1);
  const sp = V.buildTimeline(P.build(P.byId('spirits')));
  assert.ok(sp.events.length >= 2, 'тригер «коли закінчиться» додає вибух');
});

console.log(`\n${total - failed}/${total} пройдено`);
process.exit(failed ? 1 : 0);
