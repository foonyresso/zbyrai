/* Colonist Foundry: інтерфейс вкладок «Симуляція» (час, журнал, історія колоніста) і «Поселення» (планета, місцевість, тип поселення).
   Логіка в colony-sim.js та colony-world.js; цей файл лише малює й керує часом. Підключається після app.js (глобал CFSim, init викликає app.js). */
const CFSim = (() => {
  let X = null, sim = null, timer = null, selected = 0, logFilter = 'all', logMax = 200, histDay = 0;
  const S = ColonySim, W = ColonyWorld, C = ColonistCore;
  const ACT = { сон: 'Сон', їжа: 'Їжа', відпочинок: 'Відпочинок', розвага: 'Розвага', розмова: 'Розмова', зрив: 'Зрив', хворіє: 'Хворіє', робота: 'Робота' };
  const actLabel = a => (a.startsWith('робота:') ? 'Робота: ' + C.JOBS.find(j => j.id === a.slice(7)).name : ACT[a] || a);
  const pad = n => String(n).padStart(2, '0'), clock = t => `${Math.floor(t / 24) + 1} доба, ${pad(t % 24)}:00`;
  const SPEEDS = { 4: '4 год/с', 12: '12 год/с', 24: '1 доба/с', 72: '3 доби/с' };
  const moodColor = m => (m >= 60 ? '#a6e3b4' : m >= 35 ? '#e6d9a0' : '#f2a0a0');

  function init(x) {
    X = x; const { $ } = X, sel = $('selSpeed');
    sel.replaceChildren(...Object.entries(SPEEDS).map(([v, l]) => X.el('option', { value: v, selected: +v === X.st.speed }, l)));
    sel.onchange = () => { X.st.speed = +sel.value; X.save(); if (timer) { pause(); play(); } };
    $('btnPlay').onclick = () => (timer ? pause() : play());
    $('btnH1').onclick = () => advance(1); $('btnH6').onclick = () => advance(6); $('btnD1').onclick = () => advance(24);
    $('btnResetTime').onclick = () => { pause(); X.st.hours = 0; rebuild(); render(); };
    $('nDay').onchange = e => { X.st.day = Math.max(1, +e.target.value || 1); X.st.hours = 0; pause(); rebuild(); render(); X.save(); };
    addEventListener('keydown', e => { if (e.code === 'KeyP' && !e.ctrlKey && !e.metaKey && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) { e.preventDefault(); if (X.st.tab === 'day') $('btnPlay').click(); } });
    // поселення
    const pl = () => X.st.place, change = () => { pause(); X.st.hours = 0; rebuild(); X.save(); renderPlace(); render(); };
    $('selBiome').replaceChildren(...Object.entries(W.BIOMES).map(([k, b]) => X.el('option', { value: k }, b.name)));
    $('selKind').replaceChildren(...Object.entries(W.KINDS).map(([k, b]) => X.el('option', { value: k }, b.name)));
    $('inPlanet').onchange = e => { pl().planet = e.target.value.trim().slice(0, 24) || 'Орвелія'; change(); };
    $('selBiome').onchange = e => { pl().biome = e.target.value; change(); };
    $('selKind').onchange = e => { pl().kind = e.target.value; change(); };
    $('btnPlaceRand').onclick = () => { X.st.place = W.randomPlace(C.rngFromSeed(X.randSeed())); change(); };
    $('btnPlanetName').onclick = () => { pl().planet = W.planetName(C.rngFromSeed(X.randSeed())); change(); };
  }
  const rebuild = () => { sim = S.replay(X.getColony(), X.st.place, X.st.day, X.st.hours); if (selected >= sim.n) selected = 0; histDay = 0; };
  const getSim = () => sim;
  function advance(h) { S.run(sim, h); X.st.hours = sim.hour; X.save(); histDay = 0; render(); X.onTick && X.onTick(); }
  function play() { const per = Math.max(1, Math.round(X.st.speed / 4)); timer = setInterval(() => advance(per), 250); X.$('btnPlay').textContent = '⏸ Пауза'; }
  function pause() { if (timer) clearInterval(timer); timer = null; const b = X.$('btnPlay'); if (b) b.textContent = '▶ Грати'; }

  /* ---------- вкладка «Поселення» ---------- */
  function renderPlace() {
    const { $, el } = X, p = X.st.place, b = W.BIOMES[p.biome], k = W.KINDS[p.kind];
    $('inPlanet').value = p.planet; $('selBiome').value = p.biome; $('selKind').value = p.kind;
    const fx = (v, d = 0) => (v === 1 || v == null ? '—' : '×' + v);
    $('placeInfo').replaceChildren(el('h2', {}, `${p.planet}: ${b.name.toLowerCase()}, ${k.name.toLowerCase()}`),
      el('p', { class: 'story' }, b.desc + ' ' + k.desc),
      el('h3', { class: 'mini' }, 'Умови й проблеми'), el('ul', { class: 'plist' }, W.problemsOf(p).map(t => el('li', {}, t))),
      el('h3', { class: 'mini' }, 'Що це змінює'),
      el('ul', { class: 'plist' },
        el('li', { title: 'Додається до настрою кожного колоніста' }, `Настрій: ${(b.mood + k.thought) >= 0 ? '+' : ''}${b.mood + k.thought}`),
        el('li', { title: 'Множник ризику хвороб (також залежить від погоди)' }, `Ризик хвороб: ${fx(b.ill)}`),
        el('li', { title: 'Множник швидкості спаду потреб' }, 'Потреби: ' + (Object.entries(b.need).map(([id, v]) => `${C.NEEDS.find(n => n.id === id).name.toLowerCase()} ×${v}`).join(', ') || '—')),
        el('li', { title: 'Розваги й розмови відновлюють потреби швидше чи повільніше' }, `Розваги ${fx(k.fun)}, спілкування ${fx(k.social)}`),
        el('li', { title: 'Як часто на поселення нападають' }, `Загрози: ${fx(k.raid)}`)),
      el('h3', { class: 'mini' }, 'Погода тут'), el('p', { class: 'story' }, Object.entries(b.w).sort((a, c) => c[1] - a[1]).map(([id]) => W.WEATHER[id].name.toLowerCase()).join(', ') + '.'));
  }

  /* ---------- вкладка «Симуляція» ---------- */
  const selectColonist = i => { selected = i; histDay = 0; render(); };
  function render() { renderClock(); if (X.st.tab === 'day') renderDay(); }
  function renderClock() {
    const w = W.WEATHER[sim.weather], ill = sim.ill.filter(Boolean).length;
    X.$('simClock').textContent = `${clock(sim.hour)} · ${w.name}, ${W.tempOf(sim.place.biome, sim.weather, sim.hour % 24)}° · ${sim.place.planet}${ill ? ` · хворіє ${ill}` : ''}`;
  }
  function renderDay() {
    const { el } = X, out = X.$('dayOut'), cs = X.getColony().colonists, n = cs.length, st = sim.stats, snap = S.snapshot(sim); out.replaceChildren();
    if (sim.hour === 0) out.append(el('p', { class: 'hint' }, 'Натисніть «▶ Грати» або «+1 год»: час піде годину за годиною. Колоністи сплять, працюють за пріоритетами, їдять, говорять, хворіють, сваряться й мирляться. Подія в поселенні може вплинути на всіх, на одну професію чи на одну людину.'));
    const workSum = Object.values(st.work).reduce((a, b) => a + b, 0);
    out.append(el('div', { class: 'stats' }, [['доба', snap.day], ['середній настрій', Math.round(snap.moods.reduce((a, b) => a + b, 0) / n)], ['хворіють', snap.ill], ['розмов', st.talks], ['сварок', st.fights], ['змін у стосунках', st.bondChanges], ['подій', st.events], ['роботи, од.', Math.round(workSum)]].map(([l, v]) => el('div', { class: 'kpi' }, el('b', {}, v), el('span', {}, l)))));
    // розклад: останні 24 години
    const from = Math.max(0, sim.hour - 24), cols = Array.from({ length: 24 }, (_, k) => (sim.hour - 24 + k)), head = el('div', { class: 'tl head' }, el('span'), ...cols.map(t => el('i', {}, t >= 0 && t % 3 === 0 ? pad(t % 24) : '')), el('span'));
    const rows = cs.map((c, i) => {
      const m = S.moodOf(sim, i), ill = sim.ill[i];
      return el('div', { class: 'tl' + (i === selected ? ' sel' : '') },
        el('span', { class: 'who', title: 'Показати історію: ' + C.fullName(c), onclick: () => selectColonist(i) }, (ill ? '🤒 ' : '') + c.name),
        ...cols.map(t => { if (t < from || t < 0) return el('i', { class: 'act-none' }); const a = sim.acts[i][t - sim.actsFrom]; if (!a) return el('i', { class: 'act-none' }); const evs = sim.log.filter(e => e.t === t && e.who.includes(i)); return el('i', { class: 'act-' + a.split(':')[0] + (evs.length ? ' hasev' : ''), title: `${clock(t)}: ${actLabel(a)}${evs.length ? '\n' + evs.map(e => '• ' + e.text).join('\n') : ''}` }); }),
        el('span', { class: 'm', style: `color:${moodColor(m)}`, title: `Настрій ${m}\n` + S.moodParts(sim, i).map(p => `${p.l}: ${p.v > 0 && p.l !== 'Звичайний рівень' ? '+' : ''}${p.v}`).join('\n') }, m));
    });
    out.append(el('div', { class: 'card' }, el('h2', {}, 'Розклад ', el('span', { class: 'sub' }, 'останні 24 години, кожна клітинка = година; обведена клітинка = була подія; праворуч настрій (наведіть, щоб побачити причини)')), head, ...rows,
      el('div', { class: 'legend2' }, Object.keys(ACT).map(a => el('span', {}, el('i', { class: 'act-' + a }), ACT[a].toLowerCase())))));
    out.append(el('div', { class: 'daygrid' }, el('div', {}, renderLog(), renderWork()), el('div', {}, renderHistory(), renderPriorities())));
  }
  const FILTERS = { all: 'Усе', mine: 'Лише обраний колоніст', events: 'Події (робота, загальні, особисті)', social: 'Стосунки й розмови', health: 'Здоров’я', weather: 'Погода' };
  function renderLog() {
    const { el } = X, cs = X.getColony().colonists, match = e => logFilter === 'all' || (logFilter === 'mine' && e.who.includes(selected)) || (logFilter === 'events' && ['job', 'global', 'person'].includes(e.scope)) || e.scope === logFilter;
    const all = sim.log.filter(match), shown = all.slice(-logMax).reverse();
    const sel = el('select', { title: 'Що показувати в журналі', onchange: e => { logFilter = e.target.value; logMax = 200; renderDay(); } }, Object.entries(FILTERS).map(([v, l]) => el('option', { value: v, selected: v === logFilter }, l)));
    return el('div', { class: 'card' }, el('h2', {}, 'Журнал подій ', el('span', { class: 'sub' }, `${all.length} записів; наведіть на запис, щоб побачити подробиці; клік — обрати колоніста`)), el('div', { class: 'bar' }, sel),
      el('ul', { class: 'log' }, shown.length ? shown.map(e => el('li', { class: e.kind, title: [e.text, e.detail, clock(e.t), e.who.length ? 'Учасники: ' + e.who.map(i => cs[i].name).join(', ') : ''].filter(Boolean).join('\n'), onclick: () => { if (e.who.length) selectColonist(e.who[0]); } }, el('time', {}, `${e.day}д ${pad(e.h)}:00`), el('span', {}, e.text))) : [el('li', {}, el('time'), el('span', {}, 'Поки нічого примітного.'))]),
      all.length > logMax ? el('button', { title: 'Показати старіші записи журналу', onclick: () => { logMax += 300; renderDay(); } }, 'Показати ще') : null);
  }
  function renderWork() {
    const { el } = X, s = sim.stats, wmax = Math.max(1, ...Object.values(s.work));
    return el('div', { class: 'card workbars' }, el('h2', {}, 'Зроблено роботи ', el('span', { class: 'sub' }, 'за весь час')), ...C.JOBS.map(j => el('div', { class: 'wb', title: j.name }, el('span', {}, j.name), el('div', { class: 'b' }, el('i', { style: `width:${s.work[j.id] / wmax * 100}%` })), el('span', {}, Math.round(s.work[j.id])))));
  }
  function renderHistory() {
    const { el } = X, cs = X.getColony().colonists, c = cs[selected], lastDay = Math.floor(Math.max(0, sim.hour - 1) / 24) + 1, day = histDay || lastDay, first = Math.floor(sim.actsFrom / 24) + 1;
    const pick = el('select', { title: 'Чию історію показати', onchange: e => selectColonist(+e.target.value) }, cs.map((x, i) => el('option', { value: i, selected: i === selected }, x.name)));
    const nav = el('span', { class: 'nav' }, el('button', { title: 'Попередня доба', disabled: day <= first, onclick: () => { histDay = day - 1; renderDay(); } }, '◀'), ` доба ${day} `, el('button', { title: 'Наступна доба', disabled: day >= lastDay, onclick: () => { histDay = day + 1; renderDay(); } }, '▶'));
    const blocks = sim.hour === 0 ? [] : S.history(sim, selected, day);
    const ill = sim.ill[selected], m = S.moodOf(sim, selected);
    return el('div', { class: 'card' }, el('h2', {}, 'Історія колоніста'), el('div', { class: 'bar' }, pick, nav),
      el('p', { class: 'story', title: 'Те, що зараз тримає чи псує настрій' }, el('b', {}, `${C.fullName(c)}, ${C.profession(c).toLowerCase()}. Настрій ${m}. `), ill ? `Хворіє: ${W.ILLNESS[ill.id].name.toLowerCase()} (ще близько ${Math.max(1, Math.round(ill.left))} год). ` : '', S.moodParts(sim, selected).filter(p => p.l !== 'Звичайний рівень').map(p => `${p.l} ${p.v > 0 ? '+' : ''}${p.v}`).join('; ')),
      el('ul', { class: 'hist' }, blocks.length ? blocks.map(b => el('li', {}, el('time', {}, `${pad(b.from)}–${pad(b.to)}`), el('span', {}, actLabel(b.act)), ...b.events.map(e => el('em', { class: e.kind, title: e.detail || e.text }, e.text)))) : [el('li', {}, el('time'), el('span', {}, 'Для цієї доби ще немає записів.'))]));
  }
  function renderPriorities() {
    const { el } = X, cs = X.getColony().colonists;
    return el('div', { class: 'card' }, el('h2', {}, 'Пріоритети робіт ', el('span', { class: 'sub' }, '1 — головна, 4 — у крайньому разі, — не виконує')),
      el('div', { class: 'tablewrap' }, el('table', {}, el('thead', {}, el('tr', {}, el('th', {}, ''), C.JOBS.map(j => el('th', { class: 'vert' }, j.name)))), el('tbody', {}, cs.map(c => { const p = C.priorities(c); return el('tr', {}, el('td', {}, c.name), C.JOBS.map(j => el('td', { class: 'pr' + p[j.id] }, p[j.id] || '—'))); })))));
  }
  return { init, rebuild, getSim, render, renderPlace, pause, selectColonist };
})();
