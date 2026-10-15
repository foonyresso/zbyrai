// Симуляція колонії (Colonist Foundry): інтерфейс. Логіка лежить у colonist-core.js (ColonistCore).
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const C = ColonistCore, NS = 'http://www.w3.org/2000/svg';
  const store = {
    get(k, d) { try { const v = localStorage.getItem('cf_' + k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem('cf_' + k, JSON.stringify(v)); } catch {} },
  };
  const randSeed = () => Math.random().toString(36).slice(2, 7);
  const st = Object.assign({ seed: randSeed(), n: 8, day: 1, tab: 'roster', locks: {}, gen: 2, place: { planet: 'Орвелія', biome: 'temperate', kind: 'village' }, hours: 0, speed: 12 }, store.get('state', {}));
  st.place = ColonyWorld.normPlace(st.place); st.hours = Math.max(0, +st.hours || 0);
  const save = () => store.set('state', st);
  let colony = null;
  const live = () => CFSim.getSim();
  const el = (tag, attrs = {}, ...kids) => { const e = document.createElement(tag); for (const [k, v] of Object.entries(attrs)) { if (k === 'class') e.className = v; else if (k.startsWith('on')) e[k] = v; else if (v !== false && v != null) e.setAttribute(k, v === true ? '' : v); } e.append(...kids.flat().filter(x => x != null)); return e; };
  const svg = (tag, attrs = {}) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); return e; };
  const toast = (m, ms = 1800) => { const t = $('toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), ms); };
  function download(text, name, type) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }

  /* ---------- портрет: процедурний SVG за зерном колоніста ---------- */
  function avatar(c) {
    const R = C.rngFromSeed('face:' + c.seed + ':' + c.name), pickA = l => l[Math.floor(R() * l.length)];
    const skin = pickA(['#f1c9a5', '#e0ac82', '#c68b62', '#a56b45', '#7d4d33', '#f6d9bd']), hair = pickA(['#2b1d14', '#4b2f1c', '#8a5a2b', '#c9a24a', '#a63d2a', '#d8d4cf', '#14110f']);
    const cloth = { farm: '#6f9e5a', mine: '#8a7f73', craft: '#c27a3a', cook: '#c9a766', heal: '#d9d9e8', fight: '#8a4b4b', shoot: '#5a7a5a', think: '#5a6fa8', build: '#b08a4a', talk: '#9c6ab0' }[Object.entries(c.skills).sort((a, b) => b[1] - a[1])[0][0]];
    const s = svg('svg', { viewBox: '0 0 64 64', role: 'img', 'aria-label': 'Портрет ' + c.name });
    const add = (tag, a) => s.append(svg(tag, a));
    add('rect', { width: 64, height: 64, fill: '#1a1822' });
    add('path', { d: 'M10 64c1-14 9-19 22-19s21 5 22 19z', fill: cloth });
    add('rect', { x: 27, y: 38, width: 10, height: 10, rx: 3, fill: skin });
    if (c.female && R() < .8) add('path', { d: 'M16 36c-2-18 8-26 16-26s18 8 16 26c-2 6-6 6-8 0H24c-2 6-6 6-8 0z', fill: hair });
    add('ellipse', { cx: 32, cy: 28, rx: 12, ry: 14, fill: skin });
    const style = Math.floor(R() * 3);
    if (style === 0) add('path', { d: 'M19 27c-1-12 6-17 13-17s14 5 13 17c-3-6-7-8-13-8s-10 2-13 8z', fill: hair });
    else if (style === 1) add('path', { d: 'M18 26c0-13 7-17 14-17s14 4 14 17c-2-4-4-6-6-7-4 3-14 3-16 0-2 1-4 3-6 7z', fill: hair });
    else add('path', { d: 'M19 24c2-9 8-12 13-12s11 3 13 12c-5-3-9-4-13-4s-8 1-13 4z', fill: hair });
    if (!c.female && c.age > 28 && R() < .45) add('path', { d: 'M22 32c1 9 6 12 10 12s9-3 10-12c-3 4-6 5-10 5s-7-1-10-5z', fill: hair, opacity: .9 });
    add('circle', { cx: 27, cy: 28, r: 1.6, fill: '#1a1214' }); add('circle', { cx: 37, cy: 28, r: 1.6, fill: '#1a1214' });
    add('path', { d: c.traits.some(t => ['gloomy', 'pessimist', 'cruel'].includes(t)) ? 'M28 36q4-2 8 0' : 'M28 35q4 3 8 0', fill: 'none', stroke: '#3a1d1d', 'stroke-width': 1.4, 'stroke-linecap': 'round' });
    if (c.age > 45) add('path', { d: 'M24 24q3-1 6 0M34 24q3-1 6 0', stroke: 'rgba(0,0,0,.25)', 'stroke-width': 1, fill: 'none' });
    return s;
  }

  /* ---------- вкладка «Колоністи» ---------- */
  function renderRoster() {
    const g = $('grid'); g.replaceChildren();
    colony.colonists.forEach((c, i) => {
      const locked = !!st.locks[i], pri = C.priorities(c);
      const bonds = (live() ? live().rel : colony.relations).filter(r => r.a === i || r.b === i).map(r => { const o = colony.colonists[r.a === i ? r.b : r.a]; return el('span', { class: 'rel-' + r.type }, `${C.REL[r.type]}: ${o.name}`); });
      const story = C.backstoryText(c).map(b => el('span', {}, el('b', {}, b.name + '. '), b.text + ' '));
      const sorted = C.SKILLS.slice().sort((a, b) => c.skills[b.id] - c.skills[a.id]);
      g.append(el('article', { class: 'ccard' + (locked ? ' locked' : '') },
        el('div', { class: 'ctop' }, avatar(c), el('div', {}, el('h3', { class: 'cname' }, C.fullName(c)), el('div', { class: 'csub', title: 'Професія визначається найвищим пріоритетом роботи' }, `${C.profession(c)}, ${c.age} р.`)),
          el('div', { class: 'cbtns' }, el('button', { class: locked ? 'on' : '', title: locked ? 'Розімкнути' : 'Замкнути: лишиться після «Нової колонії»', onclick: () => { if (locked) delete st.locks[i]; else st.locks[i] = c; save(); renderRoster(); } }, locked ? '🔒' : '🔓'),
            el('button', { title: 'Перегенерувати цього колоніста', onclick: () => { delete st.locks[i]; colony = C.reroll(colony, i, randSeed()); resetTime(); st.locks = Object.fromEntries(Object.keys(st.locks).map(k => [k, colony.colonists[k]])); save(); renderAll(); } }, '🎲'))),
        el('div', { class: 'tags' }, c.traits.map(t => el('span', { class: 'tag tr', title: C.TRAIT_BY[t].desc }, C.TRAIT_BY[t].name))),
        el('p', { class: 'story' }, story, c.quirk ? el('span', {}, el('b', {}, 'Звичка: '), c.quirk + '.') : null),
        el('div', { class: 'skills' }, sorted.map(s => el('div', { class: `sk p${c.passion[s.id]}` }, el('span', { class: 'nm' }, s.name), el('div', { class: 'bar2' }, el('i', { style: `width:${c.skills[s.id] / 20 * 100}%` })), el('b', {}, c.skills[s.id])))),
        el('div', { class: 'tags' }, C.JOBS.filter(j => pri[j.id] === 1).map(j => el('span', { class: 'tag', title: 'Головна робота' }, '★ ' + j.name)), c.noJobs.map(j => el('span', { class: 'tag', style: 'opacity:.6', title: 'Не виконує через передісторію' }, '✕ ' + C.JOBS.find(x => x.id === j).name))),
        bonds.length ? el('div', { class: 'bonds' }, bonds) : null));
    });
  }

  /* ---------- вкладка «Стосунки» ---------- */
  const RELCOL = { couple: '#f7b6d2', spouse: '#f39ac0', friend: '#8fd6a0', sibling: '#8fb7ee', rival: '#f08a8a' };
  function renderBonds() {
    const cs = colony.colonists, n = cs.length, W = 560, H = 420, cx = W / 2, cy = H / 2, R = 160, host = $('web'); host.replaceChildren();
    const s = svg('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Схема стосунків' }), pos = cs.map((_, i) => { const a = i / n * Math.PI * 2 - Math.PI / 2; return [cx + R * Math.cos(a), cy + R * Math.sin(a)]; });
    for (const r of live().rel) s.append(svg('line', { x1: pos[r.a][0], y1: pos[r.a][1], x2: pos[r.b][0], y2: pos[r.b][1], stroke: RELCOL[r.type], 'stroke-width': r.type === 'spouse' ? 3.5 : 2, 'stroke-opacity': .8, 'stroke-dasharray': r.type === 'rival' ? '5 4' : '' }));
    cs.forEach((c, i) => { const g = svg('g'); g.append(svg('circle', { cx: pos[i][0], cy: pos[i][1], r: 14, fill: '#1c1a22', stroke: '#c98fdc', 'stroke-width': 1.4 })); const t = svg('text', { x: pos[i][0], y: pos[i][1] + 4, 'text-anchor': 'middle', fill: '#f0eee9', 'font-size': 11, 'font-weight': 600 }); t.textContent = i + 1; g.append(t);
      const a = i / n * Math.PI * 2 - Math.PI / 2, lt = svg('text', { x: cx + (R + 34) * Math.cos(a), y: cy + (R + 34) * Math.sin(a) + 4, 'text-anchor': Math.cos(a) > .3 ? 'start' : Math.cos(a) < -.3 ? 'end' : 'middle', fill: '#a09cab', 'font-size': 11 }); lt.textContent = c.name; g.append(lt); s.append(g); });
    host.append(s);
    $('relLegend').replaceChildren(...Object.entries(C.REL).map(([k, v]) => el('span', {}, el('i', { style: `background:${RELCOL[k]}` }), v)));
    const t = $('matrix'), col = v => { const a = Math.min(1, Math.abs(v) / 60); return v >= 0 ? `rgba(111,195,160,${a * .55})` : `rgba(240,138,138,${a * .55})`; };
    t.replaceChildren(el('thead', {}, el('tr', {}, el('th', {}, ''), cs.map((c, i) => el('th', { class: 'vert', title: c.name }, c.name)))),
      el('tbody', {}, cs.map((c, i) => el('tr', {}, el('td', {}, c.name), cs.map((o, j) => { if (i === j) return el('td', {}, '·'); const v = Math.round(live().ops[i][j]), r = ColonySim.relOf(live(), i, j); return el('td', { style: `background:${col(v)}`, title: `${c.name} про ${o.name}${r ? ' (' + C.REL[r] + ')' : ''}` }, v > 0 ? '+' + v : v); }))))); }

  /* ---------- керування ---------- */
  function build(keepTime) { st.locks = Object.fromEntries(Object.entries(st.locks).filter(([i]) => i < st.n)); colony = C.generateColony(st.seed, st.n, st.locks, st.gen); if (!keepTime) { st.hours = 0; CFSim.pause(); } CFSim.rebuild(); }
  function resetTime() { st.hours = 0; CFSim.pause(); CFSim.rebuild(); }
  function renderAll() { renderRoster(); renderBonds(); CFSim.render(); CFSim.renderPlace(); }
  function syncTop() { $('rCount').value = st.n; $('oCount').textContent = st.n; $('tSeed').value = st.seed; $('nDay').value = st.day; document.querySelectorAll('.tabs button').forEach(b => b.setAttribute('aria-selected', b.dataset.tab === st.tab)); for (const t of ['roster', 'bonds', 'place', 'day']) $('tab' + t[0].toUpperCase() + t.slice(1)).hidden = st.tab !== t; }
  function tab(t) { st.tab = t; save(); syncTop(); if (t === 'bonds') renderBonds(); if (t === 'day') CFSim.render(); }
  document.querySelectorAll('.tabs button').forEach(b => { b.onclick = () => tab(b.dataset.tab); });
  $('rCount').oninput = e => { st.n = +e.target.value; build(); save(); syncTop(); renderAll(); };
  $('tSeed').onchange = e => { st.seed = e.target.value.trim() || randSeed(); build(); save(); syncTop(); renderAll(); };
  $('btnNew').onclick = () => { st.seed = randSeed(); build(); save(); syncTop(); renderAll(); };
  addEventListener('keydown', e => { if (e.code === 'Space' && !/^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(document.activeElement.tagName)) { e.preventDefault(); $('btnNew').click(); } });
  const exportObj = () => ({ tool: 'colonist-foundry', version: 2, state: { seed: st.seed, n: st.n, day: st.day, locks: st.locks, gen: st.gen, place: st.place, hours: st.hours }, seed: colony.seed, colonists: colony.colonists.map(c => Object.assign({}, c, { fullName: C.fullName(c), priorities: C.priorities(c) })), relations: colony.relations.map(r => ({ a: colony.colonists[r.a].name, b: colony.colonists[r.b].name, type: r.type })) });
  $('btnJson').onclick = () => { download(JSON.stringify(exportObj(), null, 2), 'colonists.json', 'application/json'); toast('Файл збережено'); };
  $('btnCopyJson').onclick = async () => { try { await navigator.clipboard.writeText(JSON.stringify(exportObj(), null, 2)); toast('JSON скопійовано'); } catch { toast('Браузер не дає копіювати: збережіть файл'); } };
  $('btnImport').onclick = () => $('fileImport').click();
  $('fileImport').onchange = async e => {
    const f = e.target.files[0]; e.target.value = ''; if (!f) return;
    try {
      const d = JSON.parse(await f.text()), s = d.state;
      if (d.tool !== 'colonist-foundry' || !s || !s.seed) throw new Error('bad');
      st.seed = String(s.seed).slice(0, 20); st.n = Math.min(24, Math.max(2, +s.n || 8)); st.day = Math.max(1, +s.day || 1);
      st.locks = s.locks && typeof s.locks === 'object' ? s.locks : {}; st.gen = s.gen === 2 ? 2 : 1; // файли без gen створені до розширення даних
      st.place = ColonyWorld.normPlace(s.place); st.hours = Math.max(0, Math.min(24 * 400, +s.hours || 0)); CFSim.pause(); build(true); save(); syncTop(); renderAll(); toast('Колонію завантажено');
    } catch { toast('Не вдалося прочитати: потрібен файл, збережений цим інструментом'); }
  };
  $('btnCsv').onclick = () => { download(C.toCsv(colony), 'colonists.csv', 'text/csv'); toast('Файл збережено'); };
  CFSim.init({ $, el, st, save, toast, randSeed, getColony: () => colony, onTick: () => { if (st.tab === 'bonds') renderBonds(); } });
  build(true); syncTop(); renderAll();
})();
