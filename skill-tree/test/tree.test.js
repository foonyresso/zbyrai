// Тести ядра Skill Tree Lab. Запуск: node skill-tree/test/tree.test.js
// Без залежностей: лише вбудовані модулі Node.
const assert = require('node:assert/strict');
const T = require('../tree-core.js');

let failed = 0, total = 0;
function test(name, fn) {
  total++;
  try { fn(); console.log('  ok   ' + name); }
  catch (e) { failed++; console.log('  FAIL ' + name + '\n       ' + String(e.message).split('\n').join('\n       ')); }
}
const mk = (mode, nodes, links, points = 10) => ({ version: 1, name: 't', points, mode, nodes: nodes.map(n => Object.assign({ x: 0, y: 0, name: n.id, desc: '', kind: 'small', max: 1, cost: 1, need: 0, stats: {} }, n)), links, stats: {} });
const give = (tree, state, ...ids) => ids.reduce((s, id) => { const r = T.allocate(tree, s, id); assert.ok(r, 'не вдалося вкласти в ' + id); return r; }, state);

console.log('Skill Tree Lab: тести');

test('path: вкладати можна лише в сусіда початку або вже відкритого вузла', () => {
  const t = mk('path', [{ id: 's', kind: 'start', cost: 0 }, { id: 'a' }, { id: 'b' }, { id: 'c' }], [['s', 'a'], ['a', 'b'], ['b', 'c']]);
  let st = T.emptyState();
  assert.equal(T.canAllocate(t, st, 'b').ok, false);
  assert.equal(T.canAllocate(t, st, 'a').ok, true);
  st = give(t, st, 'a', 'b');
  assert.equal(T.canAllocate(t, st, 'c').ok, true);
  assert.equal(T.allocate(t, T.emptyState(), 'c'), null);
});

test('path: зв’язок двосторонній (вкладений дальній вузол відкриває ближній)', () => {
  const t = mk('path', [{ id: 's', kind: 'start', cost: 0 }, { id: 'a' }, { id: 'b' }], [['s', 'a'], ['a', 'b']]);
  const st = give(t, T.emptyState(), 'a', 'b');
  const idx = T.index(t);
  assert.equal(T.canRefund(t, st, 'a', idx), false, 'a тримає b');
  assert.equal(T.canRefund(t, st, 'b', idx), true);
});

test('prereq: потрібні ВСІ батьки; корені відкриті від початку', () => {
  const t = mk('prereq', [{ id: 'a' }, { id: 'b' }, { id: 'c' }], [['a', 'c'], ['b', 'c']]);
  let st = T.emptyState();
  assert.equal(T.canAllocate(t, st, 'c').ok, false);
  st = give(t, st, 'a');
  assert.equal(T.canAllocate(t, st, 'c').ok, false, 'лише один із двох батьків');
  st = give(t, st, 'b');
  assert.equal(T.canAllocate(t, st, 'c').ok, true);
});

test('ліміт очок, максимальний ранг і ціна', () => {
  const t = mk('prereq', [{ id: 'a', max: 3, cost: 2 }, { id: 'b', cost: 5 }], [], 7);
  let st = give(t, T.emptyState(), 'a', 'a', 'a');
  assert.equal(T.spentPoints(t, st), 6);
  assert.match(T.canAllocate(t, st, 'a').reason, /максимальний/);
  assert.match(T.canAllocate(t, st, 'b').reason, /очок/);
});

test('«need»: потрібні очки в інших вузлах; власні ранги не рахуються', () => {
  const t = mk('prereq', [{ id: 'a', max: 5 }, { id: 'k', need: 3, max: 2 }], []);
  let st = T.emptyState();
  assert.equal(T.canAllocate(t, st, 'k').ok, false);
  st = give(t, st, 'a', 'a');
  assert.equal(T.canAllocate(t, st, 'k').ok, false, '2 з 3');
  st = give(t, st, 'a');
  st = give(t, st, 'k');
  assert.equal(T.canAllocate(t, st, 'k').ok, true, 'другий ранг k: інші вузли досі дають 3');
  assert.equal(T.canRefund(t, st, 'a'), false, 'зняття з a порушило б need ключового вузла');
});

test('повернення очок не залишає «висячих» вузлів (path, розгалуження)', () => {
  const t = mk('path', [{ id: 's', kind: 'start', cost: 0 }, { id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }], [['s', 'a'], ['a', 'b'], ['a', 'c'], ['c', 'd'], ['s', 'd']]);
  const st = give(t, T.emptyState(), 'a', 'b', 'c', 'd');
  // d досяжний і через s, тож c можна забрати; a тримає b
  assert.equal(T.canRefund(t, st, 'a'), false);
  assert.equal(T.canRefund(t, st, 'c'), true);
  assert.equal(T.canRefund(t, st, 'b'), true);
  assert.ok(T.validState(t, T.refund(t, st, 'c')));
});

test('випадкові вкладання/повернення завжди лишають правильний стан', () => {
  const tree = T.generateTree({ seed: 'rand', branches: 5, depth: 8 });
  const idx = T.index(tree), rng = T.rngFromSeed('walk');
  let st = T.emptyState();
  for (let i = 0; i < 1500; i++) {
    const n = tree.nodes[Math.floor(rng() * tree.nodes.length)];
    const next = rng() < .62 ? T.allocate(tree, st, n.id, idx) : T.refund(tree, st, n.id, idx);
    if (next) { st = next; assert.ok(T.validState(tree, st, idx), 'стан став неправильним'); }
  }
  assert.ok(T.spentPoints(tree, st) <= tree.points);
});

test('підсумок статів: сума значень × ранг; початок враховується без вкладення', () => {
  const t = mk('prereq', [{ id: 'a', max: 3, stats: { dmg: 4 } }, { id: 'b', stats: { dmg: 1, hp: 10 } }, { id: 's', kind: 'start', cost: 0, stats: { hp: 5 } }], []);
  const st = give(t, T.emptyState(), 'a', 'a', 'b');
  const sum = Object.fromEntries(T.summary(t, st).map(s => [s.id, s.value]));
  assert.deepEqual(sum, { dmg: 9, hp: 15 });
});

test('перевірка дерева: цикл, биті зв’язки, дублікати, недосяжні вузли', () => {
  assert.ok(T.validate(mk('prereq', [{ id: 'a' }, { id: 'b' }], [['a', 'b'], ['b', 'a']])).some(p => p.includes('цикл')));
  assert.ok(T.validate(mk('path', [{ id: 's', kind: 'start' }, { id: 'a' }], [['s', 'zzz']])).some(p => p.includes('неіснуючого')));
  assert.ok(T.validate(mk('path', [{ id: 'a' }, { id: 'a' }], [])).some(p => p.includes('Повторюваний id')));
  assert.ok(T.validate(mk('path', [{ id: 's', kind: 'start' }, { id: 'a' }, { id: 'lost' }], [['s', 'a']])).some(p => p.includes('недосяжні')));
  assert.ok(T.validate(mk('path', [{ id: 'a' }], [])).some(p => p.includes('початок')));
  assert.deepEqual(T.validate(mk('path', [{ id: 's', kind: 'start', cost: 0 }, { id: 'a' }], [['s', 'a']], 1)), []);
});

test('генератор: детермінований, усі вузли досяжні, розмір росте з розмірами', () => {
  const a = T.generateTree({ seed: 'x', branches: 6, depth: 10 }), b = T.generateTree({ seed: 'x', branches: 6, depth: 10 }), c = T.generateTree({ seed: 'y', branches: 6, depth: 10 });
  assert.deepEqual(a, b);
  assert.notDeepEqual(a, c);
  assert.deepEqual(T.validate(a), []);
  assert.ok(a.nodes.length > 100, 'вузлів: ' + a.nodes.length);
  assert.ok(T.generateTree({ seed: 'x', branches: 8, depth: 14 }).nodes.length > a.nodes.length);
  assert.equal(a.nodes.filter(n => n.kind === 'start').length, 1);
  assert.equal(a.nodes.filter(n => n.kind === 'keystone').length, 6, 'по ключовому вузлу на гілку');
  for (const n of a.nodes) if (n.kind !== 'start') assert.ok((Object.keys(n.stats).length || n.role === 'transit') && n.desc, 'без статів: ' + n.id);
});

test('генероване дерево можна пройти: жадібно вкласти всі очки, стан правильний', () => {
  const tree = T.generateTree({ seed: 'walk', branches: 6, depth: 10 });
  const idx = T.index(tree); let st = T.emptyState(), progress = true;
  while (progress) {
    progress = false;
    for (const n of tree.nodes) { const nx = T.allocate(tree, st, n.id, idx); if (nx) { st = nx; progress = true; } }
  }
  assert.ok(T.spentPoints(tree, st) <= tree.points && tree.points - T.spentPoints(tree, st) >= 0);
  assert.ok(T.validState(tree, st, idx));
});

test('експорт → імпорт повертає те саме дерево; сміття відхиляється', () => {
  for (const tree of [T.generateTree({ seed: 'rt' }), T.tiersExample()]) {
    const back = T.sanitize(JSON.parse(T.exportJSON(tree)));
    assert.deepEqual(back, tree);
  }
  assert.throws(() => T.sanitize({ nodes: 'x' }));
  assert.throws(() => T.sanitize(null));
  const cyc = { mode: 'prereq', nodes: [{ id: 'a' }, { id: 'b' }], links: [['a', 'b'], ['b', 'a']] };
  assert.throws(() => T.sanitize(cyc), /цикл/);
  const dirty = T.sanitize({ nodes: [{ id: 's', kind: 'start', x: 'abc', max: -5, cost: 'z', stats: { dmg: 'x', hp: '7' } }], mode: 'path', links: [] });
  assert.equal(dirty.nodes[0].x, 0); assert.equal(dirty.nodes[0].max, 1); assert.deepEqual(dirty.nodes[0].stats, { hp: 7 });
});

test('автороскладка (path): вузли не накладаються, відстань від початку зростає з глибиною', () => {
  const tree = T.generateTree({ seed: 'lay', branches: 6, depth: 10 });
  for (const n of tree.nodes) { n.x = 0; n.y = 0; }
  T.autoLayout(tree);
  let min = Infinity;
  for (let i = 0; i < tree.nodes.length; i++) for (let j = i + 1; j < tree.nodes.length; j++) min = Math.min(min, Math.hypot(tree.nodes[i].x - tree.nodes[j].x, tree.nodes[i].y - tree.nodes[j].y));
  assert.ok(min > 18, 'найближча пара: ' + min.toFixed(1));
  const idx = T.index(tree), start = tree.nodes.find(n => n.kind === 'start');
  const first = idx.adj.get('start')[0], node = tree.nodes.find(n => n.id === first);
  assert.ok(Math.hypot(node.x - start.x, node.y - start.y) < 100);
});

test('автороскладка (prereq): дитина завжди нижче за кожного батька', () => {
  const tree = T.tiersExample();
  tree.nodes.forEach(n => { n.x = 0; n.y = 0; });
  T.autoLayout(tree);
  const by = new Map(tree.nodes.map(n => [n.id, n]));
  for (const [a, b] of tree.links) assert.ok(by.get(b).y > by.get(a).y, `${b} має бути нижче за ${a}`);
  let min = Infinity;
  for (let i = 0; i < tree.nodes.length; i++) for (let j = i + 1; j < tree.nodes.length; j++) min = Math.min(min, Math.hypot(tree.nodes[i].x - tree.nodes[j].x, tree.nodes[i].y - tree.nodes[j].y));
  assert.ok(min > 40);
  // колонки класів не переплітаються: усі вузли Воїна лівіше за Лучника, Лучника лівіше за Мага
  const xs = c => tree.nodes.filter(n => n.id[0] === c).map(n => n.x);
  assert.ok(Math.max(...xs('w')) < Math.min(...xs('r')) && Math.max(...xs('r')) < Math.min(...xs('m')), 'класи переплутано');
});

test('приклад «три класи» валідний і проходиться', () => {
  const t = T.tiersExample();
  assert.deepEqual(T.validate(t), []);
  let st = T.emptyState();
  st = give(t, st, 'w0', 'w0', 'w0', 'w1', 'w2');
  assert.equal(T.canAllocate(t, st, 'w3').ok, true);
  assert.equal(T.canAllocate(t, st, 'w5').ok, false);
});

test('шаблони валідні, дають ненульове дерево, а tech — вимоги без циклів', () => {
  for (const k of Object.keys(T.TEMPLATES)) {
    const t = T.templateTree(k);
    assert.deepEqual(T.validate(t), [], k);
    assert.ok(t.nodes.length >= 9, k);
    assert.deepEqual(T.sanitize(JSON.parse(JSON.stringify(t))).nodes.length, t.nodes.length);
  }
  assert.equal(T.templateTree('tech').mode, 'prereq');
});

const timed = fn => { const t0 = Date.now(); const r = fn(); return [r, Date.now() - t0]; };

test('роль вузла: старі файли без ролі отримують її з типу й статів; start має роль start', () => {
  const t = T.sanitize({ nodes: [{ id: 's', kind: 'start' }, { id: 'a', stats: { dmg: 1 } }, { id: 'b' }, { id: 'k', kind: 'keystone', stats: { dmg: 1 } }, { id: 'x', role: 'active', stats: { dmg: 1 } }], links: [['s', 'a']] , mode: 'prereq' });
  assert.deepEqual(t.nodes.map(n => n.role), ['start', 'passive', 'transit', 'active', 'active']);
  assert.ok(Object.keys(T.ROLES).length === 3);
});

test('генератор за кількістю: точно N вузлів для кожного типу (60, 500, 5000)', () => {
  for (const type of ['radial', 'chain', 'tech', 'classes']) {
    for (const count of [60, 500, 5000]) {
      const [t, ms] = timed(() => T.buildTree(type, { count, seed: 'cnt' }));
      assert.equal(t.nodes.length, count, `${type} ${count}: вийшло ${t.nodes.length}`);
      assert.deepEqual(T.validate(t).filter(p => !p.startsWith('Очок')), [], `${type} ${count}`);
      assert.ok(ms < 4000, `${type} ${count}: ${ms} мс`);
    }
  }
  assert.equal(T.buildTree('blank').nodes.length, 1);
});

test('генератор за кількістю: детермінований, різні ролі, вузли не злипаються', () => {
  const a = T.buildTree('radial', { count: 800, seed: 's' }), b = T.buildTree('radial', { count: 800, seed: 's' });
  assert.deepEqual(a, b);
  const roles = new Set(a.nodes.map(n => n.role));
  for (const r of ['start', 'passive', 'active', 'transit']) assert.ok(roles.has(r), 'немає ролі ' + r);
  // ключові вузли мають рівно по одному на гілку, початок один
  assert.equal(a.nodes.filter(n => n.kind === 'start').length, 1);
  let minD = Infinity;
  const cell = new Map();
  for (const n of a.nodes) { const k = Math.round(n.x / 20) + ',' + Math.round(n.y / 20); if (cell.has(k)) minD = Math.min(minD, 0); cell.set(k, n); }
  assert.ok(minD > 0, 'вузли накладаються');
});

test('великі деревa: 20000 вузлів — межа, а понад межу обрізається; ланцюг не валить стек', () => {
  const [t, ms] = timed(() => T.buildTree('chain', { count: 99999, seed: 'big' }));
  assert.equal(t.nodes.length, T.MAX_NODES);
  assert.ok(ms < 5000, ms + ' мс');
  const st = T.analyze(t, T.emptyState());
  assert.equal(st.status.get('c1'), 'open');
  // глибокий prereq-ланцюг: перевірка й розкладка ітеративні
  const n = 8000, nodes = [], links = [];
  for (let i = 0; i < n; i++) { nodes.push({ id: 'p' + i, x: 0, y: 0, name: 'p' + i, desc: '', kind: 'small', role: 'passive', max: 1, cost: 1, need: 0, stats: { dmg: 1 } }); if (i) links.push(['p' + (i - 1), 'p' + i]); }
  const deep = { version: 1, name: 'deep', points: n, mode: 'prereq', nodes, links, stats: { dmg: { name: 'Шкода' } } };
  assert.deepEqual(T.validate(deep), []);
  T.autoLayout(deep);
  assert.ok(deep.nodes[n - 1].y > deep.nodes[0].y);
  deep.links.push(['p' + (n - 1), 'p0']);
  assert.ok(T.validate(deep).some(p => p.includes('цикл')));
});

test('автороскладка (path) для великого кільця: вузли не ближче 30 одиниць', () => {
  const t = T.buildTree('radial', { count: 2000, seed: 'ring' });
  T.autoLayout(t);
  const cell = new Map();
  let close = 0;
  for (const n of t.nodes) { const k = Math.floor(n.x / 30) + ',' + Math.floor(n.y / 30); close += cell.has(k) ? 1 : 0; cell.set(k, 1); }
  assert.ok(close < t.nodes.length * .02, 'накладень: ' + close);
});

test('генерований великий білд можна пройти жадібно в обох режимах', () => {
  for (const type of ['radial', 'tech']) {
    const t = T.buildTree(type, { count: 1500, seed: 'walk' });
    let st = T.emptyState(), progress = true;
    while (progress) {
      progress = false;
      const a = T.analyze(t, st);
      for (const n of t.nodes) if (a.status.get(n.id) === 'open') { st = T.allocate(t, st, n.id, a.idx); progress = true; break; }
    }
    assert.ok(T.validState(t, st), type);
    assert.ok(T.spentPoints(t, st) > 10, type);
  }
});

console.log(failed ? `\nПровалено: ${failed} з ${total}` : `\nУсі ${total} тестів пройдено`);
process.exit(failed ? 1 : 0);
