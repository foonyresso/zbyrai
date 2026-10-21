/* Colonist Foundry: центральні подання: Журнал, Стосунки (схема й таблиця), Розклад (24 години), Робота (пріоритети й зроблене). Глобал CFViews. */
const CFViews = (() => {
  const C = ColonistCore, S = ColonySim, U = CFUI, NS = 'http://www.w3.org/2000/svg';
  let X = null, logMax = 200;
  const init = x => { X = x; };
  const svg = (tag, attrs = {}) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); return e; };
  const VIEWS = [['log', '📜', 'Журнал', 'Усе, що відбувається в поселенні, від найновішого'], ['bonds', '🕸️', 'Стосунки', 'Схема й таблиця: хто кого як сприймає'], ['map', '🗺️', 'Карта', 'Колоністи ходять поселенням: дім, їдальня, робота, лікарня'], ['sched', '🕒', 'Розклад', 'Що робив кожен колоніст останні 24 години'], ['work', '🔨', 'Робота', 'Пріоритети робіт і скільки зроблено']];

  function render(host) {
    const { el } = X, v = X.st.view;
    const tabs = el('div', { class: 'vtabs', role: 'tablist' }, VIEWS.map(([k, ic, l, t]) => el('button', { role: 'tab', 'aria-selected': k === v, title: t, onclick: () => { X.st.view = k; X.save(); X.refresh(); } }, `${ic} ${l}`)));
    host.replaceChildren(tabs, v === 'map' ? CFMap.pane() : v === 'log' ? log() : v === 'bonds' ? bonds() : v === 'sched' ? sched() : work());
  }

  const FILTERS = [['all', 'Усе', 'Усі записи'], ['mine', 'Обраний', 'Лише записи про обраного колоніста'], ['events', 'Події', 'Загальні, за професією й особисті події'], ['social', 'Люди', 'Розмови, сварки, дружба, кохання'], ['health', 'Здоров’я', 'Хвороби, травми й одужання'], ['weather', 'Погода', 'Зміни погоди']];
  function log() {
    const { el } = X, sim = X.getSim(), cs = X.getColony().colonists, f = X.st.logFilter, sel = X.st.sel;
    const match = e => f === 'all' || (f === 'mine' && e.who.includes(sel)) || (f === 'events' && ['job', 'global', 'person'].includes(e.scope)) || e.scope === f;
    const all = sim.log.filter(match), shown = all.slice(-logMax).reverse();
    return el('div', { class: 'pane' },
      el('div', { class: 'chips' }, FILTERS.map(([k, l, t]) => el('button', { class: f === k ? 'on' : '', title: t, onclick: () => { X.st.logFilter = k; logMax = 200; X.save(); X.refresh(); } }, l)), el('span', { class: 'hint' }, `${all.length} записів. Наведіть на запис для подробиць, клікніть, щоб відкрити колоніста.`)),
      shown.length ? el('ul', { class: 'log' }, shown.map(e => el('li', { class: e.kind, title: [e.text, e.detail, U.clock(e.t), e.who.length ? 'Учасники: ' + e.who.map(i => cs[i].name).join(', ') : ''].filter(Boolean).join('\n'), onclick: () => { if (e.who.length) X.select(e.who[0]); } }, el('time', {}, `${e.day}д ${U.pad(e.h)}:00`), el('span', {}, e.text))))
        : el('div', { class: 'empty' }, sim.hour === 0 ? el('p', {}, 'Тут буде літопис поселення. Натисніть велику кнопку ▶ угорі, щоб пустити час.') : el('p', {}, 'За цим фільтром поки нічого немає.')),
      all.length > logMax ? el('button', { title: 'Показати старіші записи', onclick: () => { logMax += 300; X.refresh(); } }, 'Показати старіші') : null);
  }

  function bonds() {
    const { el } = X, sim = X.getSim(), cs = X.getColony().colonists, n = cs.length, W = 560, H = 420, cx = W / 2, cy = H / 2, R = 160, sel = X.st.sel;
    const s = svg('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Схема стосунків' }), pos = cs.map((_, i) => { const a = i / n * Math.PI * 2 - Math.PI / 2; return [cx + R * Math.cos(a), cy + R * Math.sin(a)]; });
    for (const r of sim.rel) s.append(svg('line', { x1: pos[r.a][0], y1: pos[r.a][1], x2: pos[r.b][0], y2: pos[r.b][1], stroke: U.RELCOL[r.type], 'stroke-width': r.type === 'spouse' ? 3.5 : 2, 'stroke-opacity': r.a === sel || r.b === sel ? 1 : .55, 'stroke-dasharray': r.type === 'rival' ? '5 4' : '' }));
    cs.forEach((c, i) => {
      const g = svg('g', { style: 'cursor:pointer' }), a = i / n * Math.PI * 2 - Math.PI / 2, m = S.moodOf(sim, i);
      g.append(svg('title')); g.firstChild.textContent = `${c.name}: настрій ${m}. Натисніть, щоб відкрити`;
      g.append(svg('circle', { cx: pos[i][0], cy: pos[i][1], r: 15, fill: '#1c1a22', stroke: i === sel ? '#ffd479' : U.moodColor(m), 'stroke-width': i === sel ? 3 : 2 }));
      const t = svg('text', { x: pos[i][0], y: pos[i][1] + 4, 'text-anchor': 'middle', fill: '#f0eee9', 'font-size': 11, 'font-weight': 600 }); t.textContent = c.name[0]; g.append(t);
      const lt = svg('text', { x: cx + (R + 36) * Math.cos(a), y: cy + (R + 36) * Math.sin(a) + 4, 'text-anchor': Math.cos(a) > .3 ? 'start' : Math.cos(a) < -.3 ? 'end' : 'middle', fill: i === sel ? '#ffd479' : '#a09cab', 'font-size': 11 }); lt.textContent = c.name; g.append(lt);
      g.onclick = () => X.select(i); s.append(g);
    });
    const col = v => { const a = Math.min(1, Math.abs(v) / 60); return v >= 0 ? `rgba(111,195,160,${a * .55})` : `rgba(240,138,138,${a * .55})`; };
    const matrix = el('table', {}, el('thead', {}, el('tr', {}, el('th', {}, ''), cs.map(c => el('th', { class: 'vert', title: c.name }, c.name)))),
      el('tbody', {}, cs.map((c, i) => el('tr', { class: i === sel ? 'sel' : '' }, el('td', { onclick: () => X.select(i), style: 'cursor:pointer' }, c.name), cs.map((o, j) => { if (i === j) return el('td', {}, '·'); const v = Math.round(sim.ops[i][j]), r = S.relOf(sim, i, j); return el('td', { style: `background:${col(v)}`, title: `${c.name} про ${o.name}${r ? ' (' + C.REL[r] + ')' : ''}` }, U.signed(v)); })))));
    return el('div', { class: 'pane two' },
      el('div', {}, el('h3', { class: 'mini' }, 'Схема', el('span', { class: 'sub' }, ' лінії = зв’язки; зараз: ' + U.clock(sim.hour))), el('div', { class: 'web' }, s), el('div', { class: 'legend' }, Object.entries(C.REL).map(([k, v]) => el('span', {}, el('i', { style: `background:${U.RELCOL[k]}` }), v)))),
      el('div', {}, el('h3', { class: 'mini' }, 'Хто що думає про кого', el('span', { class: 'sub' }, ' рядок думає про стовпчик')), el('div', { class: 'tablewrap' }, matrix)));
  }

  function sched() {
    const { el } = X, sim = X.getSim(), cs = X.getColony().colonists, from = Math.max(0, sim.hour - 24), cols = Array.from({ length: 24 }, (_, k) => sim.hour - 24 + k);
    const head = el('div', { class: 'tl head' }, el('span'), ...cols.map(t => el('i', {}, t >= 0 && t % 3 === 0 ? U.pad(t % 24) : '')), el('span'));
    const rows = cs.map((c, i) => {
      const m = S.moodOf(sim, i);
      return el('div', { class: 'tl' + (i === X.st.sel ? ' sel' : '') }, el('span', { class: 'who', title: 'Відкрити колоніста: ' + C.fullName(c), onclick: () => X.select(i) }, (sim.ill[i] ? '🤒 ' : '') + c.name),
        ...cols.map(t => { const a = t < from ? null : sim.acts[i][t - sim.actsFrom]; if (!a) return el('i', { class: 'act-none' }); const evs = sim.log.filter(e => e.t === t && e.who.includes(i)); return el('i', { class: 'act-' + U.actKey(a) + (evs.length ? ' hasev' : ''), title: `${U.clock(t)}: ${U.actLabel(a)}${evs.length ? '\n' + evs.map(e => '• ' + e.text).join('\n') : ''}` }); }),
        el('span', { class: 'm', style: `color:${U.moodColor(m)}`, title: `Настрій ${m}` }, m));
    });
    return el('div', { class: 'pane' }, el('p', { class: 'hint' }, 'Кожна клітинка — година. Обведена — була подія. Клікніть ім’я, щоб відкрити колоніста; праворуч його настрій.'), head, ...rows,
      el('div', { class: 'legend2' }, Object.keys(U.ACT).map(a => el('span', {}, el('i', { class: 'act-' + a }), U.ACT[a][1].toLowerCase()))));
  }

  function work() {
    const { el } = X, sim = X.getSim(), cs = X.getColony().colonists, s = sim.stats, wmax = Math.max(1, ...Object.values(s.work));
    return el('div', { class: 'pane two' },
      el('div', {}, el('h3', { class: 'mini' }, 'Зроблено роботи', el('span', { class: 'sub' }, ' за весь час')), el('div', { class: 'workbars' }, C.JOBS.map(j => el('div', { class: 'wb', title: j.name }, el('span', {}, j.name), el('div', { class: 'b' }, el('i', { style: `width:${s.work[j.id] / wmax * 100}%` })), el('span', {}, Math.round(s.work[j.id])))))),
      el('div', {}, el('h3', { class: 'mini' }, 'Пріоритети робіт', el('span', { class: 'sub' }, ' 1 — головна, 4 — у крайньому разі, — не виконує')),
        el('div', { class: 'tablewrap' }, el('table', {}, el('thead', {}, el('tr', {}, el('th', {}, ''), C.JOBS.map(j => el('th', { class: 'vert' }, j.name)))), el('tbody', {}, cs.map((c, i) => { const p = C.priorities(c); return el('tr', { class: i === X.st.sel ? 'sel' : '' }, el('td', { onclick: () => X.select(i), style: 'cursor:pointer' }, c.name), C.JOBS.map(j => el('td', { class: 'pr' + p[j.id] }, p[j.id] || '—'))); }))))));
  }
  return { init, render };
})();
