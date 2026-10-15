// Симуляція колонії (colonist-foundry): головний файл інтерфейсу: стан, керування часом, смуга колоністів, збереження. Логіка в colony-*.js, панелі в ui-*.js.
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const C = ColonistCore, S = ColonySim, W = ColonyWorld, U = CFUI;
  const store = {
    get(k, d) { try { const v = localStorage.getItem('cf_' + k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem('cf_' + k, JSON.stringify(v)); } catch {} },
  };
  const randSeed = () => Math.random().toString(36).slice(2, 7);
  const st = Object.assign({ seed: randSeed(), n: 8, day: 1, locks: {}, gen: 2, place: { planet: 'Орвелія', biome: 'temperate', kind: 'village' }, hours: 0, speed: 12, sel: 0, view: 'log', dtab: 'bio', logFilter: 'all' }, store.get('state', {}));
  st.place = W.normPlace(st.place); st.hours = Math.max(0, +st.hours || 0);
  if (!['log', 'bonds', 'sched', 'work'].includes(st.view)) st.view = 'log';
  const save = () => store.set('state', st);
  const el = (tag, attrs = {}, ...kids) => { const e = document.createElement(tag); for (const [k, v] of Object.entries(attrs)) { if (k === 'class') e.className = v; else if (k.startsWith('on')) e[k] = v; else if (v !== false && v != null) e.setAttribute(k, v === true ? '' : v); } e.append(...kids.flat().filter(x => x != null)); return e; };
  const toast = (m, ms = 1800) => { const t = $('toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), ms); };
  function download(text, name, type) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }

  let colony = null, sim = null, timer = null, firstRun = true;
  const faces = new Map(); // портрети не перемальовуються щотіку
  const face = c => { const k = `${c.seed}|${c.name}`; if (!faces.has(k)) faces.set(k, CFPortrait.avatar(c)); return faces.get(k).cloneNode(true); };

  /* ---------- колонія й час ---------- */
  function rebuildSim() { sim = S.replay(colony, st.place, st.day, st.hours); if (st.sel >= sim.n) st.sel = 0; CFDetail.resetDay(); }
  function build(keepTime) {
    st.locks = Object.fromEntries(Object.entries(st.locks).filter(([i]) => i < st.n)); colony = C.generateColony(st.seed, st.n, st.locks, st.gen);
    if (!keepTime) { st.hours = 0; pause(); } rebuildSim();
  }
  function resetTime() { st.hours = 0; pause(); rebuildSim(); }
  function advance(h) {
    if (firstRun) { firstRun = false; $('setup').open = false; }
    S.run(sim, h); st.hours = sim.hour; save(); CFDetail.resetDay(); refresh();
  }
  function play() { const per = Math.max(1, Math.round(st.speed / 4)); timer = setInterval(() => advance(per), 250); renderTimebar(); }
  function pause() { if (timer) clearInterval(timer); timer = null; if ($('btnPlay')) renderTimebar(); }

  /* ---------- відображення ---------- */
  const SPEEDS = { 4: '4 год/с', 12: '12 год/с', 24: '1 доба/с', 72: '3 доби/с' };
  function renderTimebar() {
    $('btnPlay').textContent = timer ? '⏸ Пауза' : '▶ Грати'; $('btnPlay').classList.toggle('pulse', !timer && sim.hour === 0);
    $('speeds').replaceChildren(...Object.entries(SPEEDS).map(([v, l]) => el('button', { class: st.speed === +v ? 'on' : '', title: `Автоперемотка: ${l}`, onclick: () => { st.speed = +v; save(); const was = !!timer; pause(); if (was) play(); else renderTimebar(); } }, l)));
    const snap = S.snapshot(sim), w = W.WEATHER[sim.weather];
    $('clkTime').textContent = `Доба ${snap.day} · ${U.pad(snap.h)}:00`;
    $('clkWx').textContent = `${U.WEATHER_ICON[sim.weather]} ${w.name}, ${W.tempOf(sim.place.biome, sim.weather, snap.h)}° · ${sim.place.planet}`;
    $('clkStat').textContent = `настрій ${Math.round(snap.moods.reduce((a, b) => a + b, 0) / sim.n)}${snap.ill ? ` · хворіють ${snap.ill}` : ''}`;
  }
  function renderBar() {
    const cs = colony.colonists;
    $('cbar').replaceChildren(...cs.map((c, i) => {
      const m = S.moodOf(sim, i), a = sim.hour > 0 ? sim.acts[i][sim.acts[i].length - 1] : null, ill = sim.ill[i];
      return el('button', { class: 'cb' + (i === st.sel ? ' sel' : ''), role: 'listitem', style: `--mc:${U.moodColor(m)}`, title: `${C.fullName(c)}, ${C.profession(c).toLowerCase()}\n${a ? U.actLabel(a) : 'Час ще не пішов'}\nНастрій ${m}${ill ? '\n' + W.ILLNESS[ill.id].name : ''}${st.locks[i] ? '\nЗамкнено 🔒' : ''}`, onclick: () => select(i) },
        el('span', { class: 'ph' }, face(c), ill ? el('em', { class: 'bdg' }, '🤒') : null, st.locks[i] ? el('em', { class: 'bdg lk' }, '🔒') : null), el('b', {}, c.name), el('span', { class: 'st' }, `${a ? U.actIcon(a) : '·'} ${m}`));
    }));
  }
  function refresh(full) {
    renderTimebar(); renderBar(); CFViews.render($('viewHost')); CFDetail.render($('detailHost'));
    if (full) CFSetup.render();
  }
  function select(i) { st.sel = i; CFDetail.resetDay(); save(); refresh(); }

  /* ---------- дії для панелей ---------- */
  const X = {
    $, el, st, save, toast, randSeed, getColony: () => colony, getSim: () => sim, refresh, select,
    toggleLock(i) { if (st.locks[i]) delete st.locks[i]; else st.locks[i] = colony.colonists[i]; save(); refresh(); },
    reroll(i) { delete st.locks[i]; colony = C.reroll(colony, i, randSeed()); st.locks = Object.fromEntries(Object.keys(st.locks).map(k => [k, colony.colonists[k]])); resetTime(); save(); refresh(true); },
    setPeople(n) { st.n = n; build(); save(); refresh(true); },
    setSeed(v) { st.seed = v || randSeed(); build(); save(); refresh(true); },
    newColony() { st.seed = randSeed(); build(); save(); refresh(true); },
    setVariant(v) { st.day = v; resetTime(); save(); refresh(true); },
    setPlace(patch) { st.place = W.normPlace(Object.assign({}, st.place, patch)); resetTime(); save(); refresh(true); },
  };
  CFSetup.init(X); CFDetail.init(X); CFViews.init(X);
  $('btnPlay').onclick = () => (timer ? pause() : play());
  $('btnH1').onclick = () => advance(1); $('btnH6').onclick = () => advance(6); $('btnD1').onclick = () => advance(24);
  $('btnResetTime').onclick = () => { resetTime(); save(); refresh(); };
  addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey || /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(document.activeElement.tagName)) return;
    if (e.code === 'Space') { e.preventDefault(); $('btnPlay').click(); } else if (e.code === 'KeyN') { e.preventDefault(); X.newColony(); }
  });

  /* ---------- збереження й обмін ---------- */
  const exportObj = () => {
    const rel = sim.rel.map(r => ({ a: colony.colonists[r.a].name, b: colony.colonists[r.b].name, type: r.type }));
    return { tool: 'colonist-foundry', version: 2, state: { seed: st.seed, n: st.n, day: st.day, locks: st.locks, gen: st.gen, place: st.place, hours: st.hours }, seed: colony.seed, colonists: colony.colonists.map(c => Object.assign({}, c, { fullName: C.fullName(c), profession: C.profession(c), priorities: C.priorities(c) })), relations: rel };
  };
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
      st.place = W.normPlace(s.place); st.hours = Math.max(0, Math.min(24 * 400, +s.hours || 0));
      build(true); save(); refresh(true); toast('Колонію завантажено');
    } catch { toast('Не вдалося прочитати: потрібен файл, збережений цим інструментом'); }
  };
  $('btnCsv').onclick = () => { download(C.toCsv(colony), 'colonists.csv', 'text/csv'); toast('Файл збережено'); };
  build(true); if (st.hours > 0) { firstRun = false; $('setup').open = false; }
  refresh(true);
})();
