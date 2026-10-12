/* Production Chain Planner: обчислення без DOM (браузер: глобал PlannerCore; Node: module.exports).
   Рецепт = { id, name, building, time (с на один цикл), inputs: { ресурс: к-сть }, outputs: { ресурс: к-сть } }.
   Ресурс без жодного рецепта, що його виробляє, вважається сировиною. Швидкості рахуються за хвилину. */
const PlannerCore = (() => {
  const EPS = 1e-9;

  // які рецепти виробляють ресурс
  function producers(recipes) {
    const m = new Map();
    for (const r of recipes) for (const o of Object.keys(r.outputs || {})) { if (!m.has(o)) m.set(o, []); m.get(o).push(r); }
    return m;
  }

  /* plan(recipes, targets, opts)
     targets: { ресурс: шт/хв };  opts.choose: { ресурс: id рецепта } (якщо кілька способів; за замовчуванням перший);
     opts.speed: { будівля: множник швидкості } (за замовчуванням 1);  opts.raw: [ресурси], які брати ззовні, навіть якщо їх можна виробити.
     Повертає { ok, error?, lines: [{ recipe, runs, machines, machinesCeil, speed }], raw: { ресурс: шт/хв }, surplus: { ресурс: шт/хв }, flows: [{ from, to, res, rate }] } */
  function plan(recipes, targets, opts = {}) {
    const P = producers(recipes), choose = opts.choose || {}, speed = opts.speed || {}, rawSet = new Set(opts.raw || []);
    const byId = new Map(recipes.map(r => [r.id, r]));
    const pick = res => {
      if (rawSet.has(res)) return null;
      const list = P.get(res); if (!list) return null;
      return byId.get(choose[res]) && list.includes(byId.get(choose[res])) ? byId.get(choose[res]) : list[0];
    };
    const want = Object.entries(targets).filter(([, v]) => v > 0);
    if (!want.length) return { ok: false, error: 'Вкажіть, що виробляти і скільки за хвилину.' };

    // 1) які рецепти потрібні (обхід у глибину) і граф «споживач → виробник»
    const used = new Map(), edges = new Map(); // id → recipe; id → Set(id виробників)
    const visiting = new Set(); let cycle = null;
    const visit = r => {
      if (used.has(r.id)) return;
      if (visiting.has(r.id)) { cycle = cycle || r; return; }
      visiting.add(r.id); edges.set(r.id, new Set());
      for (const i of Object.keys(r.inputs || {})) { const p = pick(i); if (p) { edges.get(r.id).add(p.id); visit(p); if (cycle) return; } }
      visiting.delete(r.id); used.set(r.id, r);
    };
    for (const [res] of want) { const r = pick(res); if (r) visit(r); if (cycle) break; }
    if (cycle) return { ok: false, error: `Цикл у виробництві через рецепт «${cycle.name}»: ресурс потрібен для власного виробництва. Позначте один з ресурсів циклу сировиною.` };

    // 2) порядок: споживачі раніше за виробників (топологічно, алгоритм Кана)
    const indeg = new Map([...used.keys()].map(id => [id, 0]));
    for (const [, set] of edges) for (const p of set) if (indeg.has(p)) indeg.set(p, indeg.get(p) + 1);
    const queue = [...indeg].filter(([, d]) => d === 0).map(([id]) => id), order = [];
    while (queue.length) { const id = queue.shift(); order.push(id); for (const p of edges.get(id) || []) { indeg.set(p, indeg.get(p) - 1); if (indeg.get(p) === 0) queue.push(p); } }

    // 3) попит рухається від цілей до сировини
    const demand = new Map(), raw = {}, lines = [], surplus = {}, runsOf = new Map();
    const add = (m, k, v) => m.set(k, (m.get(k) || 0) + v);
    for (const [res, v] of want) { if (pick(res)) add(demand, res, v); else add(demand, res, v); }
    for (const id of order) {
      const r = used.get(id); let runs = 0;
      for (const [o, n] of Object.entries(r.outputs)) { const d = demand.get(o) || 0; if (d > 0 && pick(o) === r) runs = Math.max(runs, d / n); }
      runsOf.set(id, runs);
      for (const [o, n] of Object.entries(r.outputs)) { const extra = runs * n - (demand.get(o) || 0); if (extra > EPS) surplus[o] = (surplus[o] || 0) + extra; }
      for (const [i, n] of Object.entries(r.inputs || {})) add(demand, i, runs * n);
      const sp = speed[r.building] > 0 ? speed[r.building] : 1, machines = runs * r.time / 60 / sp;
      lines.push({ recipe: r, runs, machines, machinesCeil: Math.ceil(machines - 1e-9), speed: sp });
    }
    for (const [res, v] of demand) if (!pick(res) && v > EPS) raw[res] = v;
    // цілі-сировина: ресурс, який просять, але ніхто не виробляє
    // потоки між вузлами (для схеми)
    const flows = [];
    for (const id of order) {
      const r = used.get(id), runs = runsOf.get(id);
      for (const [i, n] of Object.entries(r.inputs || {})) { const p = pick(i); flows.push({ from: p ? p.id : 'raw:' + i, to: id, res: i, rate: runs * n }); }
    }
    for (const [res, v] of want) { const p = pick(res); flows.push({ from: p ? p.id : 'raw:' + res, to: 'out:' + res, res, rate: v }); }
    return { ok: true, lines, raw, surplus, flows, order };
  }

  /* Скільки одиниць цілі на хвилину дає задана кількість машин (обернена задача для одного рецепта цілі). */
  function maxRate(recipes, res, machines, opts = {}) {
    const r = plan(recipes, { [res]: 1 }, opts); if (!r.ok) return 0;
    const need = Math.max(...r.lines.map(l => l.machines)); // скільки машин потрібно на 1/хв у найвужчому місці
    return need > 0 ? machines / need : 0;
  }
  // вузьке місце: рядок з найбільшою кількістю машин на одиницю цілі
  const bottleneck = res => res.lines.reduce((m, l) => (!m || l.machines > m.machines ? l : m), null);

  /* ---------- текстові експорти ---------- */
  const f2 = v => String(Math.round(v * 100) / 100);
  function toText(res) {
    const out = ['Машини:'];
    for (const l of res.lines) out.push(`  ${l.recipe.name} (${l.recipe.building}): ${f2(l.machines)} → ${l.machinesCeil} шт., циклів ${f2(l.runs)}/хв`);
    out.push('Сировина за хвилину:'); for (const [k, v] of Object.entries(res.raw)) out.push(`  ${k}: ${f2(v)}`);
    if (Object.keys(res.surplus).length) { out.push('Надлишок побічних продуктів за хвилину:'); for (const [k, v] of Object.entries(res.surplus)) out.push(`  ${k}: ${f2(v)}`); }
    return out.join('\n');
  }
  function toCsv(res) {
    const rows = ['рецепт,будівля,машин,машин (округл.),циклів/хв'];
    for (const l of res.lines) rows.push([JSON.stringify(l.recipe.name), JSON.stringify(l.recipe.building), f2(l.machines), l.machinesCeil, f2(l.runs)].join(','));
    rows.push('', 'сировина,шт/хв'); for (const [k, v] of Object.entries(res.raw)) rows.push(`${JSON.stringify(k)},${f2(v)}`);
    return rows.join('\n');
  }

  // перевірка даних, введених користувачем
  function validate(recipes) {
    const errs = [], ids = new Set();
    for (const r of recipes) {
      if (ids.has(r.id)) errs.push(`Повторний id: ${r.id}`); ids.add(r.id);
      if (!(r.time > 0)) errs.push(`«${r.name}»: час циклу має бути більшим за нуль`);
      if (!Object.keys(r.outputs || {}).length) errs.push(`«${r.name}»: немає результату`);
      for (const [k, v] of [...Object.entries(r.inputs || {}), ...Object.entries(r.outputs || {})]) if (!(v > 0)) errs.push(`«${r.name}»: кількість «${k}» має бути додатною`);
    }
    return errs;
  }

  return { plan, producers, maxRate, bottleneck, toText, toCsv, validate };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = PlannerCore;
