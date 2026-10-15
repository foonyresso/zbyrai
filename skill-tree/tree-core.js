/* Skill Tree Lab: ядро. Модель дерева, правила вкладання очок, перевірка, автороскладка й генератор великих дерев.
   Без DOM: працює і в браузері (глобал TreeCore), і в Node (module.exports), тож його можна тестувати.

   Дерево:
     { version, name, points, mode: 'path' | 'prereq',
       nodes: [{ id, x, y, name, desc, kind: 'small'|'notable'|'keystone'|'start', role: 'passive'|'active'|'transit', max, cost, need, stats: {stat: значення за ранг} }],
       links: [[a, b]],            // path: двосторонні; prereq: a є вимогою для b
       stats: { stat: { name, pct } } }
   Режими відкриття вузла:
     path  : відкритий, якщо вже вкладено в сусіда або сусід = початок;
     prereq (як у класичних талантах): відкритий, якщо вкладено в усі вузли, що ведуть до нього.
   «need» = скільки очок має бути вкладено в ІНШІ вузли. «start» не коштує очок і завжди активний. */
const TreeCore = (() => {
  const MAX_NODES = 20000; // розумна межа для генератора: далі полотно й браузер починають страждати
  // Роль вузла = що він дає (колір на полотні); тип (kind) = наскільки він важливий (форма й розмір).
  const ROLES = {
    passive: { name: 'Пасивний', hint: 'Постійний бонус до статів' },
    active: { name: 'Активний', hint: 'Здібність, яку гравець застосовує сам' },
    transit: { name: 'Прохідний', hint: 'Лише з’єднує гілки: бонусів не дає, нічого не коштує' },
  };
  const defaultRole = n => (n.kind === 'start' ? 'start' : n.kind === 'keystone' ? 'active' : Object.keys(n.stats || {}).length ? 'passive' : 'transit');
  const KINDS = {
    small: { name: 'Малий', r: 7 }, notable: { name: 'Значний', r: 11 }, keystone: { name: 'Ключовий', r: 15 }, start: { name: 'Початок', r: 12 },
  };

  /* ---------- детермінований генератор ---------- */
  function xmur3(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
    return () => { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return (h ^= h >>> 16) >>> 0; };
  }
  function mulberry32(a) {
    return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  const rngFromSeed = seed => mulberry32(xmur3(String(seed))());

  /* ---------- індекс і стан ---------- */
  function index(tree) {
    const byId = new Map(tree.nodes.map(n => [n.id, n]));
    const adj = new Map(), parents = new Map(), children = new Map();
    for (const n of tree.nodes) { adj.set(n.id, []); parents.set(n.id, []); children.set(n.id, []); }
    for (const [a, b] of tree.links) {
      if (!byId.has(a) || !byId.has(b) || a === b) continue;
      adj.get(a).push(b); adj.get(b).push(a); parents.get(b).push(a); children.get(a).push(b);
    }
    return { byId, adj, parents, children };
  }
  const isStart = n => n && n.kind === 'start';
  const rankOf = (state, id) => ((state && state.ranks && state.ranks[id]) | 0);
  const emptyState = () => ({ ranks: {} });

  function spentPoints(tree, state) {
    let s = 0;
    for (const n of tree.nodes) if (!isStart(n)) s += (n.cost || 0) * rankOf(state, n.id);
    return s;
  }
  function ruleOpen(tree, idx, state, n) {
    if (isStart(n)) return true;
    if (tree.mode === 'prereq') return idx.parents.get(n.id).every(p => rankOf(state, p) > 0 || isStart(idx.byId.get(p)));
    return idx.adj.get(n.id).some(m => rankOf(state, m) > 0 || isStart(idx.byId.get(m)));
  }

  function canAllocate(tree, state, id, idx = index(tree), spent = spentPoints(tree, state)) {
    const n = idx.byId.get(id);
    if (!n) return { ok: false, reason: 'Немає такого вузла.' };
    if (isStart(n)) return { ok: false, reason: 'Початкова точка завжди активна.' };
    const rank = rankOf(state, id);
    if (rank >= (n.max || 1)) return { ok: false, reason: 'Досягнуто максимальний ранг.' };
    if (spent + (n.cost || 0) > tree.points) return { ok: false, reason: 'Не вистачає очок.' };
    const others = spent - (n.cost || 0) * rank;
    if ((n.need || 0) > others) return { ok: false, reason: `Спершу вклади ${n.need} очок в інші вузли (зараз ${others}).` };
    if (!ruleOpen(tree, idx, state, n)) return { ok: false, reason: tree.mode === 'prereq' ? 'Спершу вклади в попередні вузли.' : 'Спершу відкрий сусідній вузол.' };
    return { ok: true, reason: '' };
  }

  function allocate(tree, state, id, idx = index(tree)) {
    if (!canAllocate(tree, state, id, idx).ok) return null;
    return { ranks: Object.assign({}, state.ranks, { [id]: rankOf(state, id) + 1 }) };
  }

  // Чи правильний розподіл: кожен вкладений вузол досяжний за правилом режиму й задовольняє «need».
  function validState(tree, state, idx = index(tree)) {
    const spent = spentPoints(tree, state);
    if (spent > tree.points) return false;
    for (const n of tree.nodes) {
      const r = rankOf(state, n.id);
      if (!r || isStart(n)) continue;
      if (r > (n.max || 1)) return false;
      if ((n.need || 0) > spent - (n.cost || 0) * r) return false;
    }
    if (tree.mode === 'prereq') {
      for (const n of tree.nodes) if (rankOf(state, n.id) > 0 && !isStart(n) && !ruleOpen(tree, idx, state, n)) return false;
      return true;
    }
    const seen = new Set(), queue = tree.nodes.filter(isStart).map(n => n.id);
    queue.forEach(id => seen.add(id));
    while (queue.length) {
      const cur = queue.pop();
      for (const m of idx.adj.get(cur)) {
        if (!seen.has(m) && (rankOf(state, m) > 0 || isStart(idx.byId.get(m)))) { seen.add(m); queue.push(m); }
      }
    }
    return tree.nodes.every(n => isStart(n) || rankOf(state, n.id) === 0 || seen.has(n.id));
  }

  function canRefund(tree, state, id, idx = index(tree)) {
    const n = idx.byId.get(id), rank = rankOf(state, id);
    if (!n || isStart(n) || rank <= 0) return false;
    return validState(tree, { ranks: Object.assign({}, state.ranks, { [id]: rank - 1 }) }, idx);
  }
  function refund(tree, state, id, idx = index(tree)) {
    if (!canRefund(tree, state, id, idx)) return null;
    const ranks = Object.assign({}, state.ranks, { [id]: rankOf(state, id) - 1 });
    if (!ranks[id]) delete ranks[id];
    return { ranks };
  }

  function summary(tree, state) {
    const sum = {};
    for (const n of tree.nodes) {
      const r = isStart(n) ? 1 : rankOf(state, n.id);
      if (!r) continue;
      for (const [s, v] of Object.entries(n.stats || {})) sum[s] = (sum[s] || 0) + v * r;
    }
    return Object.entries(sum).map(([id, value]) => ({ id, value: Math.round(value * 100) / 100, name: (tree.stats[id] || {}).name || id, pct: !!(tree.stats[id] || {}).pct }));
  }

  // Статус кожного вузла для малювання: 'start' | 'full' | 'part' | 'open' | 'locked'
  function analyze(tree, state) {
    const idx = index(tree), status = new Map(), spent = spentPoints(tree, state);
    for (const n of tree.nodes) {
      const r = rankOf(state, n.id);
      if (isStart(n)) status.set(n.id, 'start');
      else if (r >= (n.max || 1)) status.set(n.id, 'full');
      else if (r > 0) status.set(n.id, 'part');
      else status.set(n.id, canAllocate(tree, state, n.id, idx, spent).ok ? 'open' : 'locked');
    }
    return { idx, status, spent, left: tree.points - spent };
  }

  /* ---------- перевірка ---------- */
  function validate(tree) {
    const out = [];
    if (!tree || !Array.isArray(tree.nodes) || !tree.nodes.length) return ['У дереві немає жодного вузла.'];
    const ids = new Set();
    for (const n of tree.nodes) {
      if (ids.has(n.id)) out.push(`Повторюваний id вузла «${n.id}».`);
      ids.add(n.id);
      if (!(n.max >= 1)) out.push(`Вузол «${n.name}»: максимальний ранг має бути не менше 1.`);
      if (n.cost < 0) out.push(`Вузол «${n.name}»: ціна не може бути від’ємною.`);
    }
    const seenLink = new Set();
    for (const [a, b] of tree.links) {
      if (!ids.has(a) || !ids.has(b)) out.push(`Зв’язок «${a}» → «${b}» веде до неіснуючого вузла.`);
      else if (a === b) out.push(`Вузол «${a}» пов’язаний сам із собою.`);
      const key = tree.mode === 'prereq' ? a + '>' + b : [a, b].sort().join('~');
      if (seenLink.has(key)) out.push(`Повторюваний зв’язок «${a}» — «${b}».`);
      seenLink.add(key);
    }
    if (out.length) return out;
    const idx = index(tree);
    if (tree.mode === 'prereq') {
      // Алгоритм Кана: ітеративно, щоб довгі ланцюги на тисячі вузлів не вичерпували стек.
      const deg = new Map(tree.nodes.map(n => [n.id, idx.parents.get(n.id).length])), q = tree.nodes.filter(n => !deg.get(n.id)).map(n => n.id);
      let done = 0;
      for (let h = 0; h < q.length; h++) { done++; for (const c of idx.children.get(q[h])) { deg.set(c, deg.get(c) - 1); if (!deg.get(c)) q.push(c); } }
      const cyc = done < tree.nodes.length;
      if (cyc) out.push('У вимогах є цикл: вузли чекають один на одного, їх неможливо відкрити.');
    } else {
      const starts = tree.nodes.filter(isStart);
      if (!starts.length) out.push('У режимі «шляху» потрібен хоча б один вузол-початок.');
      else {
        const seen = new Set(starts.map(n => n.id)), q = [...seen];
        while (q.length) { const c = q.pop(); for (const m of idx.adj.get(c)) if (!seen.has(m)) { seen.add(m); q.push(m); } }
        const lost = tree.nodes.filter(n => !seen.has(n.id));
        if (lost.length) out.push(`${lost.length} вузл(ів) недосяжні від початку, наприклад «${lost[0].name}».`);
      }
    }
    const total = tree.nodes.reduce((s, n) => s + (isStart(n) ? 0 : (n.cost || 0) * (n.max || 1)), 0);
    if (tree.points > total) out.push(`Очок (${tree.points}) більше, ніж можна витратити (${total}): дерево можна взяти повністю.`);
    return out;
  }

  /* ---------- імпорт / експорт ---------- */
  const num = (v, d, lo = -Infinity, hi = Infinity) => { v = Number(v); return Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) + 0 : d; };
  const str = (v, d, max = 80) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : d);
  function sanitize(raw) {
    const src = raw && raw.tree ? raw.tree : raw;
    if (!src || typeof src !== 'object' || !Array.isArray(src.nodes)) throw new Error('Це не схоже на дерево скілів.');
    const tree = { version: 1, name: str(src.name, 'Без назви'), points: Math.round(num(src.points, 20, 0, 99999)), mode: src.mode === 'prereq' ? 'prereq' : 'path', nodes: [], links: [], stats: {} };
    for (const [id, s] of Object.entries(src.stats || {})) { if (s && typeof s === 'object') { const o = { name: str(s.name, id, 40) }; if (s.pct) o.pct = true; tree.stats[String(id).slice(0, 24)] = o; } }
    for (const n of src.nodes.slice(0, 30000)) {
      if (!n || typeof n !== 'object') continue;
      const stats = {};
      for (const [k, v] of Object.entries(n.stats || {})) if (Number.isFinite(Number(v))) stats[String(k).slice(0, 24)] = Number(v);
      const node = {
        id: str(String(n.id ?? ''), 'n' + tree.nodes.length, 24), x: num(n.x, 0, -1e5, 1e5), y: num(n.y, 0, -1e5, 1e5), name: str(n.name, 'Вузол'), desc: typeof n.desc === 'string' ? n.desc.slice(0, 300) : '',
        kind: KINDS[n.kind] ? n.kind : 'small', max: Math.round(num(n.max, 1, 1, 99)), cost: Math.round(num(n.cost, 1, 0, 999)), need: Math.round(num(n.need, 0, 0, 99999)), stats,
      };
      node.role = node.kind === 'start' ? 'start' : ROLES[n.role] ? n.role : defaultRole(node); // старі файли без ролі отримують її з типу й статів
      // вузол може нести скіл з Конструктора скілів (формат zbyrai.skill): зберігаємо як є, якщо він не завеликий
      if (n.skill && typeof n.skill === 'object' && n.skill.format === 'zbyrai.skill' && JSON.stringify(n.skill).length < 40000) node.skill = n.skill;
      tree.nodes.push(node);
    }
    for (const l of (src.links || []).slice(0, 90000)) if (Array.isArray(l) && l.length === 2) tree.links.push([String(l[0]), String(l[1])]);
    for (const n of tree.nodes) for (const k of Object.keys(n.stats)) if (!tree.stats[k]) tree.stats[k] = { name: k };
    const bad = validate(tree).filter(p => !p.startsWith('Очок'));
    if (bad.length) throw new Error(bad[0]);
    return tree;
  }
  const exportJSON = tree => JSON.stringify({ format: 'zbyrai.skill-tree', version: 1, tree }, null, 2);

  /* ---------- автороскладка ---------- */
  function autoLayout(tree) {
    const idx = index(tree), nodes = tree.nodes;
    if (!nodes.length) return;
    if (tree.mode === 'prereq') {
      // Рядок = найдовший шлях від кореня; колонка = «піддерева»: вузол стоїть під першим із батьків,
      // а ширина піддерева залежить від кількості його листків, тож окремі гілки не перемішуються.
      // Усе ітеративно (топологічний порядок), щоб глибокі ланцюги на тисячі вузлів не вичерпували стек.
      const deg = new Map(nodes.map(n => [n.id, idx.parents.get(n.id).length])), topo = nodes.filter(n => !deg.get(n.id)).map(n => n.id);
      const depth = new Map(topo.map(id => [id, 0]));
      for (let h = 0; h < topo.length; h++) {
        for (const c of idx.children.get(topo[h])) {
          depth.set(c, Math.max(depth.get(c) || 0, depth.get(topo[h]) + 1));
          deg.set(c, deg.get(c) - 1); if (!deg.get(c)) topo.push(c);
        }
      }
      nodes.forEach(n => { if (!depth.has(n.id)) depth.set(n.id, 0); }); // вузли в циклі (дерево невалідне) лягають у перший рядок
      const order = new Map(nodes.map((n, i) => [n.id, i]));
      const kids = new Map(nodes.map(n => [n.id, []]));
      const roots = [];
      for (const n of nodes) {
        const ps = idx.parents.get(n.id);
        if (!ps.length) roots.push(n.id);
        else kids.get(ps.reduce((a, b) => (order.get(a) <= order.get(b) ? a : b))).push(n.id);
      }
      const gap = 110, byDepth = nodes.map(n => n.id).sort((a, b) => depth.get(b) - depth.get(a));
      let cursor = 0;
      const stack = roots.slice().reverse(), seen = new Set();
      while (stack.length) { // листки отримують колонки зліва направо в порядку обходу
        const id = stack.pop(); if (seen.has(id)) continue; seen.add(id);
        const ks = kids.get(id);
        if (!ks.length) idx.byId.get(id).x = (cursor++ + .5) * gap;
        else for (let i = ks.length - 1; i >= 0; i--) stack.push(ks[i]);
      }
      for (const id of byDepth) { // батьки стають посередині над дітьми (глибші спершу)
        const ks = kids.get(id), node = idx.byId.get(id);
        if (ks.length) { const xs2 = ks.map(k2 => idx.byId.get(k2).x); node.x = (Math.min(...xs2) + Math.max(...xs2)) / 2; }
        node.y = depth.get(id) * 104;
      }
      const xs = nodes.map(n => n.x), mid = (Math.min(...xs) + Math.max(...xs)) / 2;
      nodes.forEach(n => { n.x = Math.round(n.x - mid) + 0; n.y = Math.round(n.y) + 0; });
      return;
    }
    const starts = nodes.filter(isStart);
    const depth = new Map(), q = [];
    starts.forEach((n, i) => { depth.set(n.id, 0); q.push(n.id); const a = (i / starts.length) * 2 * Math.PI; n.x = starts.length > 1 ? Math.cos(a) * 36 : 0; n.y = starts.length > 1 ? Math.sin(a) * 36 : 0; });
    for (let h = 0; h < q.length; h++) for (const m of idx.adj.get(q[h])) if (!depth.has(m)) { depth.set(m, depth.get(q[h]) + 1); q.push(m); }
    const maxD = Math.max(0, ...depth.values());
    nodes.forEach(n => { if (!depth.has(n.id)) depth.set(n.id, maxD + 1); });
    const rings = new Map();
    nodes.forEach(n => { const d = depth.get(n.id); if (d > 0) { if (!rings.has(d)) rings.set(d, []); rings.get(d).push(n); } });
    const ang = new Map(starts.map(n => [n.id, Math.atan2(n.y, n.x)]));
    let prevR = 0;
    [...rings.keys()].sort((a, b) => a - b).forEach(d => {
      // радіус кільця росте разом із кількістю вузлів у ньому, щоб у великих деревах вузли не злипалися
      const ring = rings.get(d), r = Math.max(d * 82, prevR + 60, ring.length * 44 / (2 * Math.PI)); prevR = r;
      const pref = n => {
        const ps = idx.adj.get(n.id).filter(m => ang.has(m) && depth.get(m) === d - 1);
        if (!ps.length) return null;
        return Math.atan2(ps.reduce((s, m) => s + Math.sin(ang.get(m)), 0), ps.reduce((s, m) => s + Math.cos(ang.get(m)), 0));
      };
      ring.forEach((n, i) => { n._p = pref(n); n._i = i; });
      ring.forEach((n, i) => { if (n._p == null) n._p = (i / ring.length) * 2 * Math.PI; });
      ring.sort((a, b) => a._p - b._p || a._i - b._i);
      const gap = Math.min(2 * Math.PI / ring.length, 46 / r), first = ring[0]._p;
      const as = ring.map((n, i) => n._p);
      for (let i = 1; i < as.length; i++) if (as[i] < as[i - 1] + gap) as[i] = as[i - 1] + gap;
      const span = as[as.length - 1] - as[0], limit = 2 * Math.PI - gap;
      if (span > limit) for (let i = 0; i < as.length; i++) as[i] = first + (as[i] - first) * (limit / span);
      ring.forEach((n, i) => { n.x = Math.cos(as[i]) * r; n.y = Math.sin(as[i]) * r; ang.set(n.id, as[i]); delete n._p; delete n._i; });
    });
  }

  /* ---------- генератор великих дерев ---------- */
  const STATS = {
    str: { name: 'Сила' }, agi: { name: 'Спритність' }, int: { name: 'Інтелект' }, hp: { name: 'Здоров’я' }, mana: { name: 'Мана' }, armor: { name: 'Броня' },
    dmg: { name: 'Шкода' }, res: { name: 'Опір магії', pct: true }, ms: { name: 'Швидкість руху', pct: true }, aspd: { name: 'Швидкість атаки', pct: true },
    crit: { name: 'Шанс крита', pct: true }, luck: { name: 'Удача', pct: true },
  };
  const UNIT = { str: 2, agi: 2, int: 2, hp: 10, mana: 8, armor: 3, dmg: 2, res: 2, ms: 1.5, aspd: 2, crit: 1.5, luck: 2 };
  const THEMES = [
    { stat: 'str', second: 'hp', label: 'Міць' }, { stat: 'agi', second: 'ms', label: 'Спритність' }, { stat: 'int', second: 'mana', label: 'Розум' },
    { stat: 'hp', second: 'armor', label: 'Живучість' }, { stat: 'luck', second: 'crit', label: 'Доля' }, { stat: 'aspd', second: 'ms', label: 'Швидкість' },
    { stat: 'armor', second: 'res', label: 'Захист' }, { stat: 'dmg', second: 'crit', label: 'Сила удару' },
  ];
  const NOTABLE = ['Сталева воля', 'Холодний розрахунок', 'Шлях ворона', 'Вогонь у жилах', 'Тиха мить', 'Залізний подих', 'Чуття мисливця', 'Крижана витримка', 'Дикий ритм', 'Гострий погляд', 'Сила предків', 'Невидимий крок'];
  const KEYSTONE = ['Серце бурі', 'Безодня розуму', 'Колос', 'Тінь без імені', 'Остання вежа', 'Око долі', 'Танець клинків', 'Нескорений'];

  const ACTIVE = ['Вибух', 'Ривок', 'Крижаний щит', 'Заклик', 'Влучний постріл', 'Вихор', 'Блискавка', 'Пастка', 'Удар об землю', 'Зцілення'];
  const CLASS_NAMES = ['Воїн', 'Лучник', 'Маг', 'Жрець', 'Розбійник', 'Паладин', 'Друїд', 'Інженер'];
  const fx = v => Math.round(v * 10) / 10;
  const clampN = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  /* Оформлення вузла: тип (форма), роль (колір), стати, ціна, опис. Спільне для всіх генераторів. */
  function styleNode(node, kind, role, th, k2, rng) {
    node.kind = kind; node.role = role;
    if (role === 'transit') { node.name = 'Перехід'; node.cost = 0; node.stats = {}; node.desc = 'Прохідний вузол: лише з’єднує гілки, бонусів не дає.'; return node; }
    const big = kind === 'keystone' ? 4 : kind === 'notable' ? 2.5 : 1, big2 = kind === 'keystone' ? 3 : kind === 'notable' ? 2 : 0;
    node.stats = { [th.stat]: fx(UNIT[th.stat] * big * k2) };
    if (big2) node.stats[th.second] = fx(UNIT[th.second] * big2 * k2);
    if (kind === 'keystone') { node.cost = 2; node.name = KEYSTONE[Math.floor(rng() * KEYSTONE.length)]; }
    else if (kind === 'notable') node.name = role === 'active' ? ACTIVE[Math.floor(rng() * ACTIVE.length)] : NOTABLE[Math.floor(rng() * NOTABLE.length)];
    else node.name = STATS[th.stat].name;
    for (const key of Object.keys(node.stats)) node.stats[key] = STATS[key].pct ? Math.max(.5, fx(node.stats[key])) : Math.max(1, Math.round(node.stats[key]));
    node.desc = (role === 'active' ? 'Активна здібність. ' : '') + Object.entries(node.stats).map(([s, v]) => `${STATS[s].name} +${v}${STATS[s].pct ? '%' : ''}`).join(', ');
    return node;
  }
  const roleFor = (kind, rng) => (kind === 'keystone' ? 'active' : kind === 'notable' ? (rng() < .45 ? 'active' : 'passive') : rng() < .16 ? 'transit' : 'passive');
  const statsOf = nodes => { const stats = {}; for (const n of nodes) for (const k of Object.keys(n.stats || {})) stats[k] = Object.assign({}, STATS[k]); return stats; };
  const pointsFor = nodes => Math.max(10, Math.round((nodes.length - 1) * .34));
  const newNode = (id, x, y) => ({ id, x: Math.round(x), y: Math.round(y), name: '', desc: '', kind: 'small', role: 'passive', max: 1, cost: 1, need: 0, stats: {} });

  /* Радіальне дерево: гілки-теми навколо початку. Або за «гілки × глибина» (opts.branches, opts.depth),
     або за загальною кількістю вузлів (opts.count): тоді ширина шарів і радіуси підлаштовуються під кількість. */
  function generateTree(opts = {}) {
    const seed = opts.seed ?? 'zbyrai', byCount = opts.count > 0;
    const count = byCount ? clampN(Math.round(opts.count), 2, MAX_NODES) : 0;
    const B = byCount ? (opts.branches > 0 ? clampN(opts.branches | 0, 2, 12) : clampN(Math.round(Math.sqrt(count) / 3.2), 3, 12)) : Math.max(2, Math.min(8, opts.branches | 0 || 6));
    const D = Math.max(3, Math.min(16, opts.depth | 0 || 10));
    const density = opts.density ?? .82, cross = opts.cross ?? .14;
    const rng = rngFromSeed(seed);
    const nodes = [], links = [];
    let n = 0;
    const mk = o => { const node = Object.assign({ id: 'n' + (++n), desc: '', role: 'passive', max: 1, cost: 1, need: 0, stats: {} }, o); nodes.push(node); return node; };
    const center = mk({ id: 'start', kind: 'start', role: 'start', name: 'Початок', x: 0, y: 0, cost: 0 });
    const themes = THEMES.slice().sort(() => rng() - .5);
    const angDiff = (a, b) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
    const kMax = byCount ? Math.max(7, Math.ceil(Math.sqrt(count / B) * 1.3)) : 7;

    for (let b = 0; b < B; b++) {
      const th = themes[b % themes.length], sector = 2 * Math.PI / B, a0 = -Math.PI / 2 + b * sector;
      let quota = byCount ? Math.floor((count - 1) / B) + (b < (count - 1) % B ? 1 : 0) : Infinity, prevR = 0, keyNode = null, layers = 0;
      let prev = [{ node: center, ang: a0 + sector / 2 }];
      for (let d = 1; byCount ? quota > 0 : d <= D; d++) {
        const k = Math.max(1, Math.min(kMax, 1 + Math.floor(d * .45)));
        let slots = Array.from({ length: k }, (_, i) => ({ a: a0 + sector * (.14 + .72 * (k === 1 ? .5 : i / (k - 1))), i }));
        let present;
        if (byCount) {
          if (slots.length > quota) { const m = quota; slots = Array.from({ length: m }, (_, i) => ({ a: a0 + sector * (.14 + .72 * (m === 1 ? .5 : i / (m - 1))), i })); }
          present = slots; quota -= slots.length;
        } else { present = d === D ? slots : slots.filter(() => rng() < density); if (!present.length) present = [slots[Math.floor(k / 2)]]; }
        const last = byCount ? quota <= 0 : d === D;
        const layer = [];
        // радіус шару: не тісніше за попередній і достатньо широкий, щоб k вузлів помістилися по дузі сектора
        const r0 = byCount ? Math.max(prevR + 70, present.length * 38 / (sector * .72)) : d * 78; prevR = r0;
        for (const s of present) {
          const parent = prev.reduce((best, p) => (angDiff(s.a, p.ang) < angDiff(s.a, best.ang) ? p : best), prev[0]).node;
          const r = r0 + (byCount ? 0 : (rng() - .5) * 8);
          const node = mk({ x: Math.round(Math.cos(s.a) * r) + 0, y: Math.round(Math.sin(s.a) * r) + 0, name: '', kind: 'small' });
          links.push([parent.id, node.id]);
          layer.push({ node, ang: s.a });
        }
        layer.sort((x, y) => x.ang - y.ang);
        for (let i = 0; i + 1 < layer.length; i++) if (d > 1 && rng() < cross) links.push([layer[i].node.id, layer[i + 1].node.id]);
        const keyIdx = last ? Math.floor(layer.length / 2) : -1;
        const k2 = 1 + Math.min(d, 40) * .08;
        layer.forEach(({ node }, i) => {
          if (i === keyIdx) { styleNode(node, 'keystone', 'active', th, k2, rng); keyNode = node; }
          else if (d >= 2 && rng() < .2) styleNode(node, 'notable', roleFor('notable', rng), th, k2, rng);
          else styleNode(node, 'small', roleFor('small', rng), th, k2, rng);
        });
        prev = layer; layers = d;
      }
      if (keyNode) keyNode.need = Math.round((byCount ? Math.min(layers, 30) : D) * 1.2);
    }
    return { version: 1, name: opts.name || 'Згенероване дерево', points: pointsFor(nodes), mode: 'path', nodes, links, stats: statsOf(nodes) };
  }

  /* Ланцюг-змійка: одна довга лінія з N вузлів, що загинається рядками (path-режим). */
  function chainTree(count, seed) {
    const rng = rngFromSeed(seed), nodes = [], links = [];
    const cols = clampN(Math.round(Math.sqrt(count) * 1.3), 4, 80), gap = 70;
    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / cols), c = i % cols, x = (row % 2 ? cols - 1 - c : c) * gap, y = row * gap;
      const node = newNode(i ? 'c' + i : 'start', x, y);
      if (!i) { Object.assign(node, { kind: 'start', role: 'start', name: 'Початок', cost: 0 }); }
      else {
        const th = THEMES[(row >> 1) % THEMES.length], kind = i === count - 1 || i % 25 === 0 ? 'keystone' : i % 7 === 0 ? 'notable' : 'small';
        styleNode(node, kind, i % 3 === 0 && kind === 'small' ? 'transit' : roleFor(kind, rng), th, 1 + Math.min(row, 40) * .06, rng);
        links.push([nodes[i - 1].id, node.id]);
      }
      nodes.push(node);
    }
    return { version: 1, name: 'Ланцюг-змійка', points: pointsFor(nodes), mode: 'path', nodes, links, stats: statsOf(nodes) };
  }

  /* Сітка з вимогами (режим prereq): «Технології» (одна сітка) або «Класи» (кілька колонок-класів з коренем зверху).
     Вузол відкривається, коли вкладено в його батьків над ним; чим нижче ряд, тим більше «потрібно очок». */
  function gridTree(type, count, seed) {
    const rng = rngFromSeed(seed), classes = type === 'classes', groups = classes ? clampN(Math.round(count / 12), 1, 3) || 1 : 1;
    const nodes = [], links = [];
    for (let g = 0; g < groups; g++) {
      const quota = Math.floor(count / groups) + (g < count % groups ? 1 : 0) - (classes ? 1 : 0);
      const cols = clampN(Math.round(Math.sqrt(quota / 1.2)), 2, 60), rows = Math.ceil(quota / cols), gx = (g - (groups - 1) / 2) * (cols + 1.5) * 84, top = classes ? 1 : 0;
      let root = null;
      if (classes) { root = newNode('k' + g, gx, 0); Object.assign(root, { name: CLASS_NAMES[g % CLASS_NAMES.length], kind: 'notable', role: 'passive', cost: 1, stats: { hp: 10 }, desc: 'Початок класу: відкриває всю його колонку.' }); nodes.push(root); }
      const ids = [];
      for (let i = 0; i < quota; i++) {
        const r = Math.floor(i / cols), c = i % cols, node = newNode(`${classes ? 'g' + g : 't'}_${r}_${c}`, gx + (c - (cols - 1) / 2) * 84, (r + top) * 92);
        const th = THEMES[(g * 2 + Math.floor(c * 3 / cols)) % THEMES.length];
        const kind = r === rows - 1 ? 'keystone' : r % 4 === 3 ? 'notable' : 'small';
        styleNode(node, kind, roleFor(kind, rng), th, 1 + Math.min(r, 40) * .08, rng);
        if (node.role === 'transit') node.max = 1;
        else if (kind === 'small') node.max = 1 + Math.floor(rng() * 3);
        node.need = Math.round(r * cols * .3);
        ids.push(node.id); nodes.push(node);
        if (r) {
          const up = ids[i - cols]; if (up) links.push([up, node.id]);
          if (c && ids[i - cols - 1]) links.push([ids[i - cols - 1], node.id]);
        } else if (root) links.push([root.id, node.id]);
      }
    }
    return { version: 1, name: classes ? 'Класи (таланти)' : 'Дерево технологій', points: Math.max(10, Math.round(nodes.length * .34)), mode: 'prereq', nodes, links, stats: statsOf(nodes) };
  }

  const BLANK = () => ({ version: 1, name: 'Нове дерево', points: 10, mode: 'path', nodes: [{ id: 'start', x: 0, y: 0, name: 'Початок', desc: '', kind: 'start', role: 'start', max: 1, cost: 0, need: 0, stats: {} }], links: [], stats: {} });

  /* Типи, які можна згенерувати з заданою кількістю вузлів. */
  const TYPES = {
    radial: { name: 'Радіальне', hint: 'Гілки-теми розходяться від початку в центрі.' },
    chain: { name: 'Ланцюг', hint: 'Одна довга лінія вузлів, що загинається змійкою: вкладаєш очки послідовно.' },
    tech: { name: 'Технології', hint: 'Сітка з вимогами: нижній ряд відкривається, лише коли вкладено у вузли над ним.' },
    classes: { name: 'Класи', hint: 'Кілька колонок-класів, у кожної свій корінь і вимоги вниз. Режим вимог.' },
    blank: { name: 'Чистий аркуш', hint: 'Лише початковий вузол: решту малюєш вручну в режимі «Редагувати».' },
  };
  function buildTree(type, opts = {}) {
    const count = clampN(Math.round(opts.count) || 60, 2, MAX_NODES), seed = opts.seed ?? 'zbyrai';
    if (type === 'chain') return chainTree(count, seed);
    if (type === 'tech' || type === 'classes') return gridTree(type, count, seed);
    if (type === 'blank') return BLANK();
    return generateTree({ seed, count, branches: opts.branches });
  }

  const withRoles = tree => { tree.nodes.forEach(n => { n.role = defaultRole(n); }); return tree; };

  /* ---------- приклад: класичні таланти (режим prereq) ---------- */
  function tiersExample() {
    const stats = { dmg: { name: 'Шкода' }, armor: { name: 'Броня' }, hp: { name: 'Здоров’я' }, aspd: { name: 'Швидкість атаки', pct: true }, crit: { name: 'Шанс крита', pct: true }, mana: { name: 'Мана' }, int: { name: 'Інтелект' }, ms: { name: 'Швидкість руху', pct: true } };
    const classes = [
      { id: 'w', name: 'Воїн', nodes: [['Міцний удар', { dmg: 4 }, 3], ['Загартування', { armor: 3 }, 2], ['Бойовий дух', { hp: 20 }, 2], ['Лють', { dmg: 8, aspd: 5 }, 1], ['Незламність', { armor: 8, hp: 40 }, 1], ['Вихор клинків', { dmg: 22, aspd: 12 }, 1]] },
      { id: 'r', name: 'Лучник', nodes: [['Влучність', { crit: 3 }, 3], ['Легка хода', { ms: 4 }, 2], ['Швидкий приціл', { aspd: 6 }, 2], ['Подвійний постріл', { dmg: 6, crit: 4 }, 1], ['Тінь лісу', { ms: 10, aspd: 8 }, 1], ['Дощ стріл', { dmg: 20, crit: 10 }, 1]] },
      { id: 'm', name: 'Маг', nodes: [['Іскра розуму', { int: 3 }, 3], ['Глибока мана', { mana: 15 }, 2], ['Фокус', { crit: 3 }, 2], ['Хвиля вогню', { dmg: 8, int: 4 }, 1], ['Кристал ясності', { mana: 40, int: 6 }, 1], ['Буря', { dmg: 24, int: 10 }, 1]] },
    ];
    const nodes = [], links = [];
    classes.forEach(c => {
      const ids = c.nodes.map((_, i) => `${c.id}${i}`);
      c.nodes.forEach(([name, st, max], i) => {
        nodes.push({ id: ids[i], x: 0, y: 0, name, desc: Object.entries(st).map(([s, v]) => `${stats[s].name} +${v}${stats[s].pct ? '%' : ''}`).join(', ') + (max > 1 ? ' за ранг' : ''), kind: i === 5 ? 'keystone' : i >= 3 ? 'notable' : 'small', max, cost: i === 5 ? 3 : i >= 3 ? 2 : 1, need: [0, 0, 0, 3, 5, 8][i], stats: st });
      });
      links.push([ids[0], ids[1]], [ids[0], ids[2]], [ids[1], ids[3]], [ids[2], ids[3]], [ids[3], ids[4]], [ids[4], ids[5]]);
    });
    const tree = { version: 1, name: 'Три класи (класичні таланти)', points: 24, mode: 'prereq', nodes, links, stats };
    autoLayout(tree);
    return withRoles(tree);
  }

  /* ---------- шаблони ---------- */
  const TEMPLATES = { fan: 'Віяло (4 гілки зі старту)', chain: 'Ланцюг (одна лінія)', tech: 'Технології (вимоги, сітка 4×4)' };
  function templateTree(kind) {
    const stats = { dmg: { name: 'Шкода' }, hp: { name: 'Здоров’я' }, ms: { name: 'Швидкість руху', pct: true }, crit: { name: 'Шанс крита', pct: true } };
    const keys = Object.keys(stats), nodes = [], links = [];
    const node = (id, name, kindN, i, extra = {}) => nodes.push(Object.assign({ id, x: 0, y: 0, name, desc: '', kind: kindN, max: kindN === 'small' ? 3 : 1, cost: kindN === 'keystone' ? 3 : kindN === 'notable' ? 2 : 1, need: 0, stats: { [keys[i % keys.length]]: kindN === 'small' ? 3 : 8 } }, extra));
    if (kind === 'chain') {
      node('c0', 'Початок', 'start', 0, { max: 1, cost: 0, stats: {} });
      for (let i = 1; i <= 8; i++) { node('c' + i, i === 8 ? 'Вершина' : i % 4 === 0 ? 'Значний ' + i : 'Крок ' + i, i === 8 ? 'keystone' : i % 4 === 0 ? 'notable' : 'small', i); links.push(['c' + (i - 1), 'c' + i]); }
      const t = { version: 1, name: 'Ланцюг', points: 14, mode: 'path', nodes, links, stats };
      autoLayout(t); return withRoles(t);
    }
    if (kind === 'tech') {
      for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
        const id = `t${r}${c}`, last = r === 3;
        node(id, last ? 'Прорив ' + (c + 1) : `Тех ${r + 1}.${c + 1}`, last ? 'keystone' : r === 2 ? 'notable' : 'small', r + c, { need: r * 2 });
        if (r) { links.push([`t${r - 1}${c}`, id]); if (c) links.push([`t${r - 1}${c - 1}`, id]); }
      }
      const t = { version: 1, name: 'Дерево технологій', points: 16, mode: 'prereq', nodes, links, stats };
      autoLayout(t); return withRoles(t);
    }
    node('s', 'Початок', 'start', 0, { max: 1, cost: 0, stats: {} });
    for (let b = 0; b < 4; b++) {
      let prev = 's';
      for (let i = 1; i <= 4; i++) { const id = `b${b}${i}`; node(id, i === 4 ? 'Печатка ' + (b + 1) : `Гілка ${b + 1}.${i}`, i === 4 ? 'keystone' : i === 2 ? 'notable' : 'small', b + i); links.push([prev, id]); prev = id; }
    }
    const t = { version: 1, name: 'Віяло', points: 16, mode: 'path', nodes, links, stats };
    autoLayout(t); return withRoles(t);
  }

  return { TEMPLATES, templateTree, KINDS, ROLES, TYPES, MAX_NODES, defaultRole, buildTree,  STATS, index, emptyState, rankOf, spentPoints, canAllocate, allocate, canRefund, refund, validState, summary, analyze, validate, sanitize, exportJSON, autoLayout, generateTree, tiersExample, rngFromSeed };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = TreeCore;
