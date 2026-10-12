// Production Chain Planner: інтерфейс. Розрахунок лежить у planner-core.js (PlannerCore).
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const PC = PlannerCore, NS = 'http://www.w3.org/2000/svg';
  const store = {
    get(k, d) { try { const v = localStorage.getItem('pp_' + k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem('pp_' + k, JSON.stringify(v)); } catch {} },
  };
  const R = (id, name, building, time, inputs, outputs) => ({ id, name, building, time, inputs, outputs });
  const PRESETS = {
    medieval: { name: 'Середньовічне селище: хліб і мечі', recipes: [
      R('field', 'Пшениця', 'Поле', 40, {}, { пшениця: 8 }), R('mill', 'Борошно', 'Млин', 6, { пшениця: 3 }, { борошно: 2 }), R('bake', 'Хліб', 'Пекарня', 10, { борошно: 2, дрова: 1 }, { хліб: 4 }),
      R('log', 'Колоди', 'Лісоруб', 12, {}, { колода: 4 }), R('wood', 'Дрова', 'Колун', 3, { колода: 1 }, { дрова: 3 }),
      R('mine', 'Руда', 'Копальня', 8, {}, { руда: 2 }), R('smelt', 'Залізо', 'Плавильня', 6, { руда: 2, дрова: 1 }, { залізо: 1 }), R('sword', 'Меч', 'Кузня', 12, { залізо: 2, дрова: 1 }, { меч: 1 })],
      targets: [{ res: 'хліб', rate: 20 }, { res: 'меч', rate: 4 }] },
    factory: { name: 'Завод: механізми з руди', recipes: [
      R('smelt', 'Залізо', 'Піч', 3.2, { руда: 1 }, { залізо: 1 }), R('plate', 'Пластина', 'Прес', 6, { залізо: 3 }, { пластина: 2 }), R('gear', 'Шестерня', 'Збірка', 1, { залізо: 2 }, { шестерня: 1 }),
      R('machine', 'Механізм', 'Збірка', 10, { пластина: 4, шестерня: 2 }, { механізм: 1 })],
      targets: [{ res: 'механізм', rate: 30 }] },
    oil: { name: 'Хімія: побічні продукти й вибір рецепта', recipes: [
      R('crack', 'Крекінг', 'Реактор', 5, { нафта: 10 }, { бензин: 4, газ: 6 }), R('plast', 'Пластик', 'Хімзавод', 2, { газ: 3, вугілля: 1 }, { пластик: 2 }),
      R('plast2', 'Пластик (нафтою)', 'Хімзавод', 4, { нафта: 6 }, { пластик: 1 }), R('coal', 'Вугілля', 'Копальня', 3, {}, { вугілля: 3 })],
      targets: [{ res: 'бензин', rate: 40 }, { res: 'пластик', rate: 20 }] },
  };
  const fresh = k => JSON.parse(JSON.stringify(Object.assign({ choose: {}, raw: [], speed: {} }, PRESETS[k], { preset: k })));
  const saved = store.get('state', null);
  let st = saved && Array.isArray(saved.recipes) ? Object.assign({ choose: {}, raw: [], speed: {}, targets: [] }, saved) : fresh('medieval');
  const save = () => store.set('state', st);
  const el = (tag, attrs = {}, ...kids) => { const e = document.createElement(tag); for (const [k, v] of Object.entries(attrs)) { if (k === 'class') e.className = v; else if (k.startsWith('on')) e[k] = v; else if (v !== false && v != null) e.setAttribute(k, v === true ? '' : v); } e.append(...kids.flat().filter(x => x != null)); return e; };
  const svg = (tag, attrs = {}) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); return e; };
  const f2 = v => String(Math.round(v * 100) / 100);
  const toast = (m, ms = 1800) => { const t = $('toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), ms); };
  function download(text, name, type) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }

  const parseList = s => { const o = {}; for (const part of String(s).split(',')) { const m = part.trim().match(/^(.+?)\s*[:×x*]\s*([\d.,]+)$/i); if (m) o[m[1].trim()] = parseFloat(m[2].replace(',', '.')); else if (part.trim()) o[part.trim()] = 1; } return o; };
  const fmtList = o => Object.entries(o || {}).map(([k, v]) => `${k}:${v}`).join(', ');
  const allResources = () => [...new Set(st.recipes.flatMap(r => [...Object.keys(r.inputs || {}), ...Object.keys(r.outputs || {})]))].sort();
  const producedRes = () => [...new Set(st.recipes.flatMap(r => Object.keys(r.outputs || {})))].sort();

  /* ---------- редактори ---------- */
  function renderTargets() {
    const box = $('targets'); box.replaceChildren();
    const res = allResources();
    st.targets.forEach((t, i) => {
      const sel = el('select', { 'aria-label': 'Ресурс' }, res.map(r => el('option', { value: r, selected: r === t.res }, r)));
      sel.onchange = () => { t.res = sel.value; commit(); };
      const n = el('input', { type: 'number', min: 0, step: 'any', value: t.rate, 'aria-label': 'Штук за хвилину' }); n.oninput = () => { t.rate = Math.max(0, +n.value || 0); commit(false); };
      box.append(el('div', { class: 'row t' }, el('label', { class: 'num' }, 'Ресурс', sel), el('label', { class: 'num' }, 'шт/хв', n), el('button', { title: 'Видалити', onclick: () => { st.targets.splice(i, 1); commit(); } }, '✕')));
    });
    if (!st.targets.length) box.append(el('p', { class: 'hint' }, 'Додайте ціль: що і скільки за хвилину потрібно виробляти.'));
  }
  function renderOpts() {
    const box = $('opts'); box.replaceChildren();
    const P = PC.producers(st.recipes), multi = [...P].filter(([, l]) => l.length > 1);
    if (multi.length) { box.append(el('div', { class: 'sub-t' }, 'Спосіб виробництва')); for (const [res, list] of multi) { const sel = el('select', {}, list.map(r => el('option', { value: r.id, selected: (st.choose[res] || list[0].id) === r.id }, r.name))); sel.onchange = () => { st.choose[res] = sel.value; commit(false); }; box.append(el('div', { class: 'optrow' }, el('span', {}, res + ':'), sel)); } }
    const prod = producedRes();
    if (prod.length) { box.append(el('div', { class: 'sub-t' }, 'Брати ззовні (не виробляти)')); box.append(el('div', { class: 'optrow' }, prod.map(r => { const c = el('input', { type: 'checkbox', checked: st.raw.includes(r) }); c.onchange = () => { st.raw = c.checked ? [...st.raw, r] : st.raw.filter(x => x !== r); commit(false); }; return el('label', {}, c, r); }))); }
    const bs = [...new Set(st.recipes.map(r => r.building).filter(Boolean))];
    if (bs.length) { box.append(el('div', { class: 'sub-t' }, 'Швидкість будівель')); box.append(el('div', { class: 'optrow' }, bs.map(b => { const n = el('input', { type: 'number', min: .1, step: .1, value: st.speed[b] ?? 1, 'aria-label': 'Швидкість ' + b }); n.oninput = () => { st.speed[b] = Math.max(.1, +n.value || 1); commit(false); }; return el('label', {}, b + ' ×', n); }))); }
  }
  function renderRecipes() {
    const box = $('recipes'); box.replaceChildren();
    for (const r of st.recipes) {
      const f = (k, lab, props = {}, conv) => { const i = el('input', Object.assign({ value: k === 'inputs' || k === 'outputs' ? fmtList(r[k]) : r[k], 'aria-label': lab }, props)); i.onchange = () => { r[k] = conv ? conv(i.value) : i.value; commit(true); }; return el('label', {}, lab, i); };
      box.append(el('div', { class: 'rec' }, f('name', 'Назва'), f('building', 'Будівля'), f('time', 'Секунд', { type: 'number', min: .1, step: 'any' }, v => +v || 1),
        el('button', { title: 'Видалити', onclick: () => { st.recipes = st.recipes.filter(x => x !== r); commit(true); } }, '✕'),
        el('div', { class: 'wide' }, f('inputs', 'Входи', { placeholder: 'руда:2, вугілля:1' }, parseList)), el('span'), el('span'),
        el('div', { class: 'wide' }, f('outputs', 'Виходи', { placeholder: 'залізо:1' }, parseList))));
    }
  }

  /* ---------- результат ---------- */
  let last = null;
  function compute() {
    const errs = PC.validate(st.recipes);
    if (errs.length) return { ok: false, error: errs[0] };
    const targets = {}; for (const t of st.targets) if (t.res && t.rate > 0) targets[t.res] = (targets[t.res] || 0) + t.rate;
    return PC.plan(st.recipes, targets, { choose: st.choose, speed: st.speed, raw: st.raw });
  }
  function render() {
    last = compute();
    const sum = $('summary'); sum.replaceChildren();
    if (!last.ok) { sum.append(el('h2', {}, 'Результат'), el('p', { class: 'err' }, last.error)); $('graph').replaceChildren(); $('tbl').replaceChildren(); return; }
    const machines = last.lines.reduce((s, l) => s + l.machinesCeil, 0), bn = PC.bottleneck(last), rawN = Object.keys(last.raw).length;
    sum.append(el('h2', {}, 'Результат'),
      el('div', { class: 'kpis' }, el('div', { class: 'kpi' }, el('b', {}, machines), el('span', {}, 'машин усього')), el('div', { class: 'kpi' }, el('b', {}, last.lines.length), el('span', {}, 'видів рецептів')), el('div', { class: 'kpi' }, el('b', {}, rawN), el('span', {}, 'видів сировини')),
        el('div', { class: 'kpi warn' }, el('b', {}, bn ? bn.recipe.name : '—'), el('span', {}, 'найбільше машин'))),
      el('div', { class: 'chips' }, Object.entries(last.raw).map(([k, v]) => el('span', { class: 'chip' }, k + ' ', el('b', {}, f2(v) + '/хв'))), Object.entries(last.surplus).map(([k, v]) => el('span', { class: 'chip', title: 'Побічний продукт, що лишається' }, 'надлишок ' + k + ' ', el('b', {}, f2(v) + '/хв')))));
    const rows = last.lines.slice().reverse().map(l => el('tr', { class: bn && l === bn ? 'bn' : '' }, el('td', {}, l.recipe.name), el('td', {}, l.recipe.building + (l.speed !== 1 ? ' ×' + l.speed : '')), el('td', {}, f2(l.machines)), el('td', {}, l.machinesCeil), el('td', {}, f2(l.runs)), el('td', {}, Object.entries(l.recipe.outputs).map(([k, v]) => `${k} ${f2(v * l.runs)}`).join(', '))));
    $('tbl').replaceChildren(el('thead', {}, el('tr', {}, ...['Рецепт', 'Будівля', 'Машин', 'Округл.', 'Циклів/хв', 'Виробляє/хв'].map(h => el('th', {}, h)))), el('tbody', {}, rows));
    drawGraph();
  }

  /* схема: шари за найдовшим шляхом до цілі; сировина ліворуч, продукт праворуч */
  function drawGraph() {
    const g = $('graph'); g.replaceChildren();
    const lines = last.lines, byId = new Map(lines.map(l => [l.recipe.id, l]));
    const level = new Map(); // кількість кроків до цілі (0 = рецепт цілі)
    const consumers = new Map(); for (const f of last.flows) { if (!consumers.has(f.from)) consumers.set(f.from, []); consumers.get(f.from).push(f.to); }
    const lv = id => { if (id.startsWith('out:')) return -1; if (level.has(id)) return level.get(id); level.set(id, 0); let m = 0; for (const c of consumers.get(id) || []) m = Math.max(m, lv(c) + 1); level.set(id, m); return m; };
    lines.forEach(l => lv(l.recipe.id));
    const maxL = Math.max(0, ...level.values()), cols = maxL + 3; // 0 — сировина, 1..maxL+1 — рецепти, останній — цілі
    const nodes = new Map(); const colOf = id => id.startsWith('raw:') ? 0 : id.startsWith('out:') ? cols - 1 : 1 + (maxL - level.get(id));
    const ids = new Set(last.flows.flatMap(f => [f.from, f.to])); for (const l of lines) ids.add(l.recipe.id);
    let colItems = Array.from({ length: cols }, () => []); for (const id of ids) colItems[colOf(id)].push(id);
    colItems = colItems.filter(c => c.length); const nc = colItems.length; // порожні шари не показуємо
    const NW = 150, NH = 44, GX = 70, GY = 18; let H = 20;
    colItems.forEach(c => { H = Math.max(H, c.length * (NH + GY) + GY); });
    const W = nc * NW + (nc - 1) * GX + 20;
    colItems.forEach((c, ci) => c.forEach((id, i) => nodes.set(id, { x: 10 + ci * (NW + GX), y: (H - c.length * (NH + GY) + GY) / 2 + i * (NH + GY), id })));
    const s = svg('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}`, style: 'max-width:100%;height:auto', role: 'img', 'aria-label': 'Схема виробничого ланцюжка' });
    s.append(svg('defs')); s.firstChild.innerHTML = '<marker id="ar" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" fill="#8a8794"/></marker>';
    const maxRate = Math.max(1, ...last.flows.map(f => f.rate));
    for (const f of last.flows) {
      const a = nodes.get(f.from), b = nodes.get(f.to); if (!a || !b) continue;
      const x1 = a.x + NW, y1 = a.y + NH / 2, x2 = b.x, y2 = b.y + NH / 2, mx = (x1 + x2) / 2;
      s.append(svg('path', { d: `M${x1} ${y1}C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`, fill: 'none', stroke: '#d98c5f', 'stroke-opacity': .55, 'stroke-width': (1 + 3 * f.rate / maxRate).toFixed(1), 'marker-end': 'url(#ar)' }));
      const t = svg('text', { x: mx, y: (y1 + y2) / 2 - 4, 'text-anchor': 'middle', fill: '#b9b5c2', 'font-size': 10, 'font-family': 'ui-monospace,monospace', stroke: '#0f0e13', 'stroke-width': 3, 'paint-order': 'stroke' }); t.textContent = `${f.res} ${f2(f.rate)}`; s.append(t);
    }
    for (const n of nodes.values()) {
      const id = n.id, isRaw = id.startsWith('raw:'), isOut = id.startsWith('out:'), l = byId.get(id);
      const label = isRaw ? id.slice(4) : isOut ? id.slice(4) : l.recipe.name, sub = isRaw ? 'сировина' : isOut ? 'ціль' : `${l.machinesCeil} × ${l.recipe.building}`;
      s.append(svg('rect', { x: n.x, y: n.y, width: NW, height: NH, rx: 8, fill: isRaw ? '#17151b' : isOut ? 'rgba(217,140,95,.18)' : '#1c1a22', stroke: isRaw ? '#4a4752' : '#d98c5f', 'stroke-width': isOut ? 1.6 : 1 }));
      const t1 = svg('text', { x: n.x + 10, y: n.y + 18, fill: '#f0eee9', 'font-size': 13, 'font-weight': 600 }); t1.textContent = label.length > 18 ? label.slice(0, 17) + '…' : label;
      const t2 = svg('text', { x: n.x + 10, y: n.y + 34, fill: '#a09cab', 'font-size': 11 }); t2.textContent = sub;
      s.append(t1, t2);
    }
    g.append(s);
  }

  function commit(rebuild = false) { save(); if (rebuild) { renderTargets(); renderOpts(); renderRecipes(); } render(); }
  $('btnTarget').onclick = () => { st.targets.push({ res: allResources()[0] || '', rate: 10 }); commit(true); };
  $('btnRecipe').onclick = () => { st.recipes.push({ id: 'r' + Date.now().toString(36), name: 'Новий рецепт', building: 'Машина', time: 5, inputs: {}, outputs: { новий: 1 } }); commit(true); };
  $('btnCopy').onclick = async () => { if (!last || !last.ok) return; try { await navigator.clipboard.writeText(PC.toText(last)); toast('Скопійовано'); } catch { toast('Не вдалося скопіювати'); } };
  $('btnCsv').onclick = () => { if (last && last.ok) download(PC.toCsv(last), 'production-plan.csv', 'text/csv'); };
  $('btnExport').onclick = () => download(JSON.stringify({ recipes: st.recipes, targets: st.targets, choose: st.choose, raw: st.raw, speed: st.speed }, null, 2), 'production-chain.json', 'application/json');
  $('btnImport').onclick = () => $('file').click();
  $('file').onchange = async e => {
    const f = e.target.files[0]; e.target.value = ''; if (!f) return;
    try {
      const j = JSON.parse(await f.text()); if (!Array.isArray(j.recipes)) throw new Error('немає recipes');
      st = { preset: 'custom', choose: j.choose || {}, raw: j.raw || [], speed: j.speed || {}, targets: j.targets || [], recipes: j.recipes.map((r, i) => ({ id: String(r.id || 'i' + i), name: String(r.name || r.id || 'Рецепт'), building: String(r.building || ''), time: +r.time || 1, inputs: r.inputs || {}, outputs: r.outputs || {} })) };
      commit(true); toast('Імпортовано');
    } catch { toast('Не вдалося прочитати файл'); }
  };
  const sp = $('selPreset'); sp.replaceChildren(el('option', { value: '' }, 'Приклади…'), ...Object.entries(PRESETS).map(([k, p]) => el('option', { value: k }, p.name)));
  sp.onchange = () => { if (!sp.value) return; st = fresh(sp.value); sp.value = ''; commit(true); toast('Приклад завантажено'); };
  addEventListener('resize', () => { if (last && last.ok) drawGraph(); });
  renderTargets(); renderOpts(); renderRecipes(); render();
})();
