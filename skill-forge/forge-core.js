/* Конструктор скілів: ядро. Реєстр цеглинок, дерево скіла, перевірка, формат zbyrai.skill (версія 1) і міграція.
   Без DOM: працює і в браузері (глобал ForgeCore), і в Node (module.exports).

   Скіл:
     { format: 'zbyrai.skill', version: 1,
       skill: { name, desc, tags: [], element, cast: { time, cooldown, cost, resource, charges }, aim: { mode, range },
                root: [Цеглинка], seq } }
   Цеглинка: { id, t: 'projectile', p: { …параметри }, c: [вкладені цеглинки] }
   Категорії: delivery (доставка), modifier (модифікатор), effect (ефект), trigger (тригер).
   Хто кого може містити: root ← delivery | effect;  delivery ← modifier | effect | trigger;  trigger ← effect | delivery. */
const ForgeCore = (() => {
  const FORMAT = 'zbyrai.skill', VERSION = 1;
  const LIMITS = { nodes: 80, depth: 6 };
  const CATS = {
    delivery: { name: 'Доставка', hint: 'Як скіл досягає цілей: снаряд, конус, зона, виклик…', accepts: ['modifier', 'effect', 'trigger'] },
    modifier: { name: 'Модифікатор', hint: 'Змінює спосіб доставки: пробиття, ланцюг, розкол, затримка…', accepts: [] },
    effect: { name: 'Ефект', hint: 'Що стається з ціллю: шкода, лікування, контроль, посилення…', accepts: [] },
    trigger: { name: 'Тригер', hint: 'Умова, після якої запускаються вкладені цеглинки', accepts: ['effect', 'delivery'] },
  };
  const ROOT_ACCEPTS = ['delivery', 'effect'];
  const ELEMENTS = [['phys', 'Фізична'], ['fire', 'Вогонь'], ['ice', 'Лід'], ['lightning', 'Блискавка'], ['poison', 'Отрута'], ['holy', 'Світло'], ['shadow', 'Тінь'], ['arcane', 'Містика']];
  const RESOURCES = [['mana', 'Мана'], ['energy', 'Енергія'], ['rage', 'Лють'], ['health', 'Здоров’я'], ['none', 'Без ціни']];
  const AIM_MODES = [['enemy', 'Ворог'], ['ally', 'Союзник'], ['self', 'Я'], ['ground', 'Точка на землі'], ['direction', 'Напрямок']];

  /* ---------- реєстр ---------- */
  const registry = new Map();
  function register(defs) {
    for (const d of [].concat(defs)) {
      if (!d || !d.id || !CATS[d.cat]) throw new Error('Некоректна цеглинка: ' + (d && d.id));
      if (registry.has(d.id)) throw new Error('Дубль цеглинки: ' + d.id);
      d.params = d.params || [];
      for (const p of d.params) {
        if (!p.k || !p.label || !['num', 'enum', 'bool'].includes(p.type)) throw new Error(`Некоректний параметр ${d.id}.${p.k}`);
        if (p.type === 'enum' && !(p.options && p.options.length)) throw new Error(`Порожній список ${d.id}.${p.k}`);
        if (p.def === undefined) throw new Error(`Немає значення за замовчуванням ${d.id}.${p.k}`);
      }
      registry.set(d.id, d);
    }
  }
  const def = id => registry.get(id);
  const all = () => [...registry.values()];
  const byCat = cat => all().filter(d => d.cat === cat);
  const elementName = v => (ELEMENTS.find(e => e[0] === v) || [0, v])[1];

  /* ---------- параметри ---------- */
  function clampParam(spec, v) {
    if (spec.type === 'bool') return !!v;
    if (spec.type === 'enum') return spec.options.some(o => o[0] === v) ? v : spec.def;
    let n = Number(v);
    if (!Number.isFinite(n)) n = spec.def;
    n = Math.min(spec.max, Math.max(spec.min, n));
    const step = spec.step || 1;
    return Math.round(n / step) * step === n ? n : +(Math.round(n / step) * step).toFixed(4);
  }
  // Спільний параметр ефектів: на кого діє. Додається до кожного ефекту автоматично.
  const TO_SPEC = d => ({ k: 'to', label: 'Кому', type: 'enum', def: d.toDef || 'hit', options: [['hit', 'Цілям'], ['self', 'Мені'], ['allies', 'Союзникам поруч']], hint: 'На кого діє ефект: на уражені цілі, на самого гравця чи на союзників біля нього' });
  const paramSpecs = d => (d.cat === 'effect' ? d.params.concat(TO_SPEC(d)) : d.params);
  function defaults(d) { const p = {}; for (const s of paramSpecs(d)) p[s.k] = s.def; return p; }

  /* ---------- скіл і цеглинки ---------- */
  const emptyCast = () => ({ time: 0.5, cooldown: 5, cost: 20, resource: 'mana', charges: 1 });
  function newSkill(name = 'Новий скіл') {
    return { name, desc: '', tags: [], element: 'phys', cast: emptyCast(), aim: { mode: 'enemy', range: 12 }, root: [], seq: 0 };
  }
  function makeBrick(skill, t, p) {
    const d = def(t);
    if (!d) throw new Error('Невідома цеглинка: ' + t);
    const params = Object.assign(defaults(d), p || {});
    for (const s of paramSpecs(d)) params[s.k] = clampParam(s, params[s.k]);
    skill.seq = (skill.seq | 0) + 1;
    return { id: 'b' + skill.seq, t, p: params, c: [] };
  }
  function accepts(parentCat, cat) { return (parentCat ? CATS[parentCat].accepts : ROOT_ACCEPTS).includes(cat); }
  function walk(list, fn, parent = null, depth = 1) {
    for (const b of list) { fn(b, parent, depth); if (b.c && b.c.length) walk(b.c, fn, b, depth + 1); }
  }
  const countNodes = skill => { let n = 0; walk(skill.root, () => n++); return n; };
  function find(skill, id) {
    let r = null;
    walk(skill.root, (b, parent) => { if (b.id === id) r = { brick: b, parent, list: parent ? parent.c : skill.root }; });
    return r;
  }
  // Додає цеглинку: у батька (parentId) або в корінь. Повертає створену або null (з причиною в ForgeCore.lastError).
  function add(skill, t, parentId, p) {
    const d = def(t);
    if (!d) return fail('Невідома цеглинка');
    let list = skill.root, parentCat = null, depth = 1;
    if (parentId) {
      const f = find(skill, parentId);
      if (!f) return fail('Немає батьківської цеглинки');
      list = f.brick.c; parentCat = def(f.brick.t).cat;
      walk(skill.root, (b, par, dp) => { if (b === f.brick) depth = dp + 1; });
    }
    if (!accepts(parentCat, d.cat)) return fail(`«${CATS[d.cat].name}» не можна вкладати сюди`);
    if (depth > LIMITS.depth) return fail('Забагато рівнів вкладення');
    if (countNodes(skill) >= LIMITS.nodes) return fail('Забагато цеглинок (ліміт ' + LIMITS.nodes + ')');
    const b = makeBrick(skill, t, p);
    list.push(b);
    return b;
  }
  let lastError = '';
  function fail(msg) { lastError = msg; return null; }
  function remove(skill, id) {
    const f = find(skill, id);
    if (!f) return false;
    f.list.splice(f.list.indexOf(f.brick), 1);
    return true;
  }
  function move(skill, id, dir) {
    const f = find(skill, id);
    if (!f) return false;
    const i = f.list.indexOf(f.brick), j = i + dir;
    if (j < 0 || j >= f.list.length) return false;
    [f.list[i], f.list[j]] = [f.list[j], f.list[i]];
    return true;
  }
  function cloneBrick(skill, b) {
    skill.seq = (skill.seq | 0) + 1;
    return { id: 'b' + skill.seq, t: b.t, p: Object.assign({}, b.p), c: b.c.map(x => cloneBrick(skill, x)) };
  }
  function duplicate(skill, id) {
    const f = find(skill, id);
    if (!f || countNodes(skill) + 1 > LIMITS.nodes) return null;
    const copy = cloneBrick(skill, f.brick);
    f.list.splice(f.list.indexOf(f.brick) + 1, 0, copy);
    return copy;
  }
  function setParam(skill, id, k, v) {
    const f = find(skill, id);
    if (!f) return false;
    const spec = paramSpecs(def(f.brick.t)).find(s => s.k === k);
    if (!spec) return false;
    f.brick.p[k] = clampParam(spec, v);
    return true;
  }
  const clone = o => JSON.parse(JSON.stringify(o));

  /* ---------- перевірка ---------- */
  // Повертає список проблем: { level: 'error'|'warn', id?, msg }
  function validate(skill) {
    const out = [];
    const add_ = (level, msg, id) => out.push({ level, msg, id });
    if (!skill.root.length) add_('warn', 'Скіл порожній: додай хоча б одну доставку або ефект');
    if (countNodes(skill) > LIMITS.nodes) add_('error', 'Забагато цеглинок');
    const seen = new Set();
    walk(skill.root, (b, parent, depth) => {
      const d = def(b.t);
      if (!d) return add_('error', 'Невідома цеглинка «' + b.t + '»', b.id);
      if (seen.has(b.id)) add_('error', 'Повторний ідентифікатор ' + b.id, b.id);
      seen.add(b.id);
      if (depth > LIMITS.depth) add_('error', 'Забагато рівнів вкладення', b.id);
      if (!accepts(parent ? def(parent.t).cat : null, d.cat)) add_('error', `«${d.name}» не можна вкладати в «${parent ? def(parent.t).name : 'корінь'}»`, b.id);
      for (const s of paramSpecs(d)) if (clampParam(s, b.p[s.k]) !== b.p[s.k]) add_('error', `Параметр «${s.label}» поза межами в «${d.name}»`, b.id);
      if (d.cat === 'delivery' && !b.c.some(x => def(x.t) && (def(x.t).cat === 'effect' || def(x.t).cat === 'trigger'))) add_('warn', `«${d.name}» нічого не робить: додай ефект`, b.id);
      if (d.cat === 'trigger' && !b.c.length) add_('warn', `Тригер «${d.name}» порожній`, b.id);
      if (d.cat === 'delivery' && b.c.filter(x => def(x.t) && def(x.t).cat === 'modifier').some(x => def(x.t).only && !def(x.t).only.includes(b.t))) add_('warn', 'Деякі модифікатори не діють на цю доставку', b.id);
    });
    const c = skill.cast;
    if (c.cost > 0 && c.resource === 'none') add_('warn', 'Ціна задана, але ресурс «Без ціни»');
    return out;
  }

  /* ---------- формат і міграція ---------- */
  const MIGRATIONS = {}; // MIGRATIONS[n] переводить версію n у n+1; для майбутніх змін формату
  function normalize(raw) {
    const s = newSkill();
    const r = raw || {};
    s.name = String(r.name || s.name).slice(0, 80);
    s.desc = String(r.desc || '').slice(0, 600);
    s.tags = Array.isArray(r.tags) ? r.tags.map(String).slice(0, 12) : [];
    s.element = ELEMENTS.some(e => e[0] === r.element) ? r.element : 'phys';
    const c = r.cast || {};
    const num = (v, d, lo, hi) => { v = Number(v); return Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d; };
    s.cast = { time: num(c.time, 0.5, 0, 10), cooldown: num(c.cooldown, 5, 0, 600), cost: num(c.cost, 0, 0, 10000), resource: RESOURCES.some(e => e[0] === c.resource) ? c.resource : 'mana', charges: Math.round(num(c.charges, 1, 1, 10)) };
    const a = r.aim || {};
    s.aim = { mode: AIM_MODES.some(e => e[0] === a.mode) ? a.mode : 'enemy', range: num(a.range, 12, 0, 60) };
    s.seq = 0;
    const build = (list, parentCat, depth) => {
      const out = [];
      for (const x of Array.isArray(list) ? list : []) {
        const d = def(x && x.t);
        if (!d || depth > LIMITS.depth || !accepts(parentCat, d.cat) || s.seq >= LIMITS.nodes) continue; // невідоме відкидаємо
        const b = makeBrick(s, x.t, x.p);
        b.c = build(x.c, d.cat, depth + 1);
        out.push(b);
      }
      return out;
    };
    s.root = build(r.root, null, 1);
    return s;
  }
  function serialize(skill) { return { format: FORMAT, version: VERSION, skill: clone(skill) }; }
  // Приймає об'єкт або рядок JSON. Кидає помилку з українським текстом.
  function parse(input) {
    let o = input;
    if (typeof input === 'string') { try { o = JSON.parse(input); } catch (e) { throw new Error('Це не JSON: ' + e.message); } }
    if (!o || o.format !== FORMAT) throw new Error('Це не файл скіла (очікується format = "' + FORMAT + '")');
    let v = Number(o.version);
    if (!Number.isInteger(v) || v < 1) throw new Error('Невідома версія формату');
    if (v > VERSION) throw new Error(`Файл створено новішою версією формату (${v}), ця підтримує до ${VERSION}`);
    while (v < VERSION) { o = MIGRATIONS[v](o); v++; }
    return normalize(o.skill);
  }

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

  // Короткі конструктори параметрів для файлів цеглинок
  const P = {
    num: (k, label, def, min, max, step, hint, unit) => ({ k, label, type: 'num', def, min, max, step: step || 1, hint: hint || '', unit: unit || '' }),
    en: (k, label, def, options, hint) => ({ k, label, type: 'enum', def, options, hint: hint || '' }),
    bool: (k, label, def, hint) => ({ k, label, type: 'bool', def, hint: hint || '' }),
  };

  return {
    P, FORMAT, VERSION, LIMITS, CATS, ELEMENTS, RESOURCES, AIM_MODES,
    register, def, all, byCat, elementName, paramSpecs, defaults, clampParam,
    newSkill, makeBrick, accepts, walk, countNodes, find, add, remove, move, duplicate, setParam, clone,
    validate, normalize, serialize, parse, rngFromSeed,
    get lastError() { return lastError; },
  };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = ForgeCore;
