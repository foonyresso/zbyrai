// Wave & Balance Curves: інтерфейс. Математика лежить у curves-core.js (BalanceCore).
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const B = BalanceCore, NS = 'http://www.w3.org/2000/svg';
  const store = {
    get(k, d) { try { const v = localStorage.getItem('bc_' + k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem('bc_' + k, JSON.stringify(v)); } catch {} },
  };
  const COLORS = ['#73d6a0', '#e8924a', '#7aa7e6', '#e079a8', '#c9a766', '#b39ddb', '#6fc3c0', '#e86a6a'];
  const DEFAULTS = () => ({
    from: 1, to: 50, view: 'val', log: false, a: 0, b: 1,
    curves: [
      { id: 1, name: 'HP ворога', type: 'exp', a: 100, b: 1.12, p: 0, color: COLORS[1], on: true },
      { id: 2, name: 'Шкода гравця', type: 'power', a: 40, b: 0, p: 1.6, color: COLORS[0], on: true },
      { id: 3, name: 'XP до рівня', type: 'power', a: 50, b: 0, p: 2.1, color: COLORS[2], on: false },
    ],
    waves: { to: 40, seed: 11, boss: 10, share: 40, budget: { type: 'linear', a: 8, b: 4, p: 0 }, hpScale: { type: 'linear', a: 1, b: 0, p: 0 },
      types: [{ name: 'Гобліни', cost: 1, hp: 30, minWave: 1, weight: 4 }, { name: 'Лучники', cost: 2, hp: 24, minWave: 3, weight: 2 }, { name: 'Орки', cost: 5, hp: 110, minWave: 8, weight: 2 }, { name: 'Тролі', cost: 12, hp: 380, minWave: 18, weight: 1 }] },
  });
  const saved = store.get('state', null);
  const st = saved && saved.curves ? Object.assign(DEFAULTS(), saved) : DEFAULTS();
  st.waves = Object.assign(DEFAULTS().waves, st.waves);
  const save = () => { B.setContext(st.curves); store.set('state', st); };
  B.setContext(st.curves);
  const toast = (m, ms = 1800) => { const t = $('toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), ms); };
  const el = (tag, attrs = {}, ...kids) => { const e = document.createElement(tag); for (const [k, v] of Object.entries(attrs)) { if (k === 'class') e.className = v; else if (k.startsWith('on')) e[k] = v; else if (v !== false && v != null) e.setAttribute(k, v === true ? '' : v); } e.append(...kids.flat().filter(x => x != null)); return e; };
  const svg = (tag, attrs = {}) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); return e; };
  function download(text, name, type) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }
  const range = () => { const f = Math.max(0, Math.min(st.from, st.to - 1)), t = Math.max(f + 1, Math.min(1000, st.to)); return [f, t]; };

  /* ---------- графік (SVG): лінії або стовпчики, підказка під курсором ---------- */
  function niceStep(span, n) { const raw = span / n, p = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / p; return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * p; }
  function chart(host, o) {
    host.replaceChildren();
    const W = host.clientWidth || 640, H = host.clientHeight || 360, m = { l: 58, r: 16, t: 14, b: 30 }, pw = W - m.l - m.r, ph = H - m.t - m.b;
    const s = svg('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': o.label || 'Графік' });
    const xs = o.xs, x0 = xs[0], x1 = xs[xs.length - 1];
    let lo = Infinity, hi = -Infinity;
    for (const l of o.lines) for (const p of l.pts) if (Number.isFinite(p.y) && (!o.log || p.y > 0)) { lo = Math.min(lo, p.y); hi = Math.max(hi, p.y); }
    if (o.bars) { lo = 0; hi = Math.max(1, ...o.bars.totals); }
    if (!Number.isFinite(lo)) { lo = 0; hi = 1; }
    if (o.log) { lo = Math.pow(10, Math.floor(Math.log10(lo))); hi = Math.pow(10, Math.ceil(Math.log10(hi))); if (lo === hi) hi = lo * 10; }
    else { if (!o.bars && lo > 0 && lo < hi * .5) lo = 0; if (lo === hi) hi = lo + 1; const st2 = niceStep(hi - lo, 5); lo = o.bars || lo >= 0 && lo === 0 ? lo : Math.floor(lo / st2) * st2; hi = Math.ceil(hi / st2) * st2; }
    const X = x => m.l + (o.bars ? (x - x0 + .5) / (x1 - x0 + 1) : (x - x0) / (x1 - x0 || 1)) * pw;
    const Y = y => m.t + ph - ((o.log ? Math.log10(Math.max(y, lo)) - Math.log10(lo) : y - lo) / (o.log ? Math.log10(hi) - Math.log10(lo) : hi - lo)) * ph;
    // сітка
    const ticks = []; if (o.log) { for (let v = lo; v <= hi * 1.0001; v *= 10) ticks.push(v); } else { const sp = niceStep(hi - lo, 5); for (let v = lo; v <= hi + sp / 2; v += sp) ticks.push(v); }
    for (const v of ticks) { const y = Y(v); s.append(svg('line', { x1: m.l, x2: W - m.r, y1: y, y2: y, stroke: 'rgba(255,255,255,.07)' })); const t = svg('text', { x: m.l - 8, y: y + 4, 'text-anchor': 'end', fill: '#8a8794', 'font-size': 11, 'font-family': 'ui-monospace,monospace' }); t.textContent = o.pct ? Math.round(v * 100) / 100 + '%' : B.fmt(v); s.append(t); }
    const xt = niceStep(x1 - x0 || 1, Math.max(3, Math.floor(pw / 70)));
    for (let v = Math.ceil(x0 / xt) * xt; v <= x1; v += xt) { const x = X(v); s.append(svg('line', { x1: x, x2: x, y1: m.t, y2: m.t + ph, stroke: 'rgba(255,255,255,.04)' })); const t = svg('text', { x, y: H - 10, 'text-anchor': 'middle', fill: '#8a8794', 'font-size': 11, 'font-family': 'ui-monospace,monospace' }); t.textContent = v; s.append(t); }
    if (o.bars) {
      const bw = Math.max(1, pw / (x1 - x0 + 1) - 2), acc = new Array(xs.length).fill(0);
      o.bars.series.forEach(se => se.vals.forEach((v, i) => { if (!v) return; const y0 = Y(acc[i]), y1 = Y(acc[i] + v); s.append(svg('rect', { x: X(xs[i]) - bw / 2, y: y1, width: bw, height: Math.max(0, y0 - y1), fill: se.color, opacity: .9 })); acc[i] += v; }));
      o.bars.boss.forEach((b, i) => { if (b) s.append(svg('path', { d: `M${X(xs[i])} ${m.t + 2}l-4 -2h8z`, fill: '#e8d29e', transform: 'translate(0,-0)' })); });
    }
    for (const l of o.lines) {
      let d = '', pen = false;
      for (const p of l.pts) { if (!Number.isFinite(p.y) || (o.log && p.y <= 0)) { pen = false; continue; } d += (pen ? 'L' : 'M') + X(p.x).toFixed(1) + ' ' + Y(p.y).toFixed(1); pen = true; }
      s.append(svg('path', { d, fill: 'none', stroke: l.color, 'stroke-width': l.w || 2, 'stroke-linejoin': 'round', 'stroke-dasharray': l.dash || '' }));
    }
    if (o.refLine != null && o.refLine >= lo && o.refLine <= hi) s.append(svg('line', { x1: m.l, x2: W - m.r, y1: Y(o.refLine), y2: Y(o.refLine), stroke: '#e8d29e', 'stroke-dasharray': '5 5', opacity: .7 }));
    const cross = svg('line', { y1: m.t, y2: m.t + ph, stroke: 'rgba(255,255,255,.35)', visibility: 'hidden' }); s.append(cross);
    host.append(s); const tip = el('div', { class: 'tip' }); tip.hidden = true; host.append(tip);
    s.addEventListener('pointermove', e => {
      const r = s.getBoundingClientRect(), px = (e.clientX - r.left) / r.width * W;
      let i = Math.round(o.bars ? (px - m.l) / pw * (x1 - x0 + 1) - .5 : (px - m.l) / pw * (x1 - x0)); i = Math.max(0, Math.min(xs.length - 1, i));
      cross.setAttribute('x1', X(xs[i])); cross.setAttribute('x2', X(xs[i])); cross.setAttribute('visibility', 'visible');
      tip.hidden = false; tip.textContent = ''; tip.append(el('div', {}, (o.xlabel || 'x') + ' ' + xs[i]), ...o.tip(i));
      tip.style.left = (X(xs[i]) / W * r.width) + 'px'; tip.style.top = Math.max(30, (e.clientY - r.top)) + 'px';
      if (X(xs[i]) > W * .62) tip.style.transform = 'translate(calc(-100% - 12px), -50%)'; else tip.style.transform = '';
    });
    s.addEventListener('pointerleave', () => { cross.setAttribute('visibility', 'hidden'); tip.hidden = true; });
  }

  /* ---------- вкладка «Криві» ---------- */
  const curveById = id => st.curves.find(c => c.id === +id);
  function seriesFor(c, from, to) {
    let s = B.series(c, from, to);
    if (st.view === 'cum') s = B.cumulative(s); else if (st.view === 'gr') s = B.growthPerStep(s).map(p => ({ x: p.x, y: p.y * 100 }));
    return s;
  }
  function renderCurves() {
    const [from, to] = range(), box = $('curves'); box.replaceChildren();
    for (const c of st.curves) {
      const T = B.TYPES[c.type], fit = el('div', { class: 'fit' });
      const fv = c.fit || { x1: from, y1: B.evalCurve(c, from) || 1, x2: to, y2: B.evalCurve(c, to) || 10 };
      const fin = (k, lab) => { const i = el('input', { type: 'number', step: 'any', value: Math.round(fv[k] * 1e4) / 1e4, 'aria-label': lab, title: lab.startsWith('x') ? 'Рівень (крок), для якого задаємо бажане значення' : 'Бажане значення кривої на цьому рівні' }); i.oninput = () => { fv[k] = +i.value; c.fit = fv; }; return el('label', { class: 'num' }, lab, i); };
      fit.append(fin('x1', 'x₁'), fin('y1', 'y₁'), fin('x2', 'x₂'), fin('y2', 'y₂'), el('button', { title: 'Порахувати параметри кривої так, щоб вона пройшла через обидві точки', onclick: () => { const r = B.fitTwo(c.type, fv.x1, fv.y1, fv.x2, fv.y2); if (!r) return toast('Для цієї кривої точки недопустимі (потрібні різні x й додатні y)'); Object.assign(c, { a: r.a, b: r.b, p: r.p }); c.fit = null; commit(true); toast('Параметри підібрано'); } }, 'Підібрати'));
      const canFit = ['linear', 'power', 'exp'].includes(c.type);
      const name = el('input', { type: 'text', value: c.name, maxlength: 32, 'aria-label': 'Назва', title: 'Назва кривої' }); name.oninput = () => { c.name = name.value; commit(false); };
      const color = el('input', { type: 'color', value: c.color, 'aria-label': 'Колір', title: 'Колір лінії на графіку' }); color.oninput = () => { c.color = color.value; commit(false); };
      const on = el('input', { type: 'checkbox', checked: c.on, 'aria-label': 'Показувати', title: 'Показувати цю криву на графіку й у таблиці' }); on.onchange = () => { c.on = on.checked; commit(false); };
      const sel = el('select', { 'aria-label': 'Тип кривої', title: 'Форма росту: лінійна — рівномірно, степенева — прискорюється, експоненційна — швидко вибухає, S-крива — виходить на стелю, логарифмічна — швидко на початку й повільно далі, сходинки — баланс змінюється кожні N рівнів, квадратична й корінь — для тонкого підгону' }, Object.entries(B.TYPES).map(([k, t]) => el('option', { value: k, selected: k === c.type }, t.name)));
      sel.onchange = () => { c.type = sel.value; if (c.type === 'custom') { c.expr = c.expr || 'a * x ^ p'; if (!c.a) c.a = 1; if (!c.p) c.p = 1; } if (c.type === 'logistic' && !c.p) { c.a = Math.max(c.a, 100); c.b = .2; c.p = (from + to) / 2; } if (c.type === 'log' && !c.b) c.b = .5; if (c.type === 'exp' && (!c.b || c.b < 1)) c.b = 1.1; if (c.type === 'steps' && !(c.p > 0)) { c.p = 10; if (!c.b) c.b = c.a || 10; } c.fit = null; commit(true); };
      const params = el('div', { class: 'params' }, Object.entries(T.params).map(([k, lab0]) => { const lab = (c.type === 'custom' && c.pl && c.pl[k]) || lab0; const i = el('input', { type: 'number', step: 'any', value: c[k], 'aria-label': lab, title: 'Параметр формули: ' + lab }); i.oninput = () => { c[k] = +i.value || 0; commit(false, true); }; return el('label', { title: 'Параметр формули: ' + lab }, lab, i); }));
            box.append(el('div', { class: 'card cv', style: `--k:${c.color}` },
        el('div', { class: 'cv-top' }, on, color, name, el('button', { title: 'Видалити цю криву', onclick: () => { st.curves = st.curves.filter(x => x !== c); commit(true); } }, '✕')),
        el('div', { class: 'row2' }, sel, el('span', { class: 'formula', title: 'Формула кривої' }, c.type === 'custom' ? '= ' + (c.expr || '…') : T.f)), c.type === 'custom' ? FormulaUI.exprBox(c, () => { c.type === 'custom' && save(); renderChart(); }) : null, params,
        el('div', { class: 'cv-btns' }, canFit ? el('button', { title: 'Задати, яке значення хочете на двох рівнях, і порахувати параметри автоматично', onclick: () => fit.classList.toggle('open') }, 'Підібрати під точки') : null,
          el('button', { title: 'Створити копію цієї кривої, щоб поекспериментувати', onclick: () => { st.curves.push(Object.assign({}, c, { id: Date.now(), name: c.name + ' копія', color: COLORS[st.curves.length % COLORS.length] })); commit(true); } }, 'Дублювати')), fit));
    }
    const opts = st.curves.map(c => el('option', { value: c.id }, c.name));
    for (const [id, key] of [['selA', 'a'], ['selB', 'b']]) { const s = $(id); s.replaceChildren(...st.curves.map(c => el('option', { value: c.id, selected: String(c.id) === String(st.curves[st.ratioPick?.[key] ?? (key === 'a' ? 1 : 0)]?.id) }, c.name))); }
    const cc = $('selCodeCurve'), keep = cc.value; cc.replaceChildren(...st.curves.map(c => el('option', { value: c.id }, c.name))); if (keep) cc.value = keep;
    $('nFrom').value = st.from; $('nTo').value = st.to; $('selView').value = st.view; $('cLog').checked = st.log;
  }
  function renderChart() {
    const [from, to] = range(), vis = st.curves.filter(c => c.on), lines = [];
    const xs = []; for (let x = st.view === 'gr' ? from + 1 : from; x <= to; x++) xs.push(x);
    for (const c of vis) lines.push({ name: c.name, color: c.color, pts: seriesFor(c, from, to), c });
    let info = '', ref = null;
    const A = curveById($('selA').value), Bc = curveById($('selB').value);
    if (A && Bc) {
      const r = B.ratio(B.series(A, from, to), B.series(Bc, from, to)), cr = B.crossings(r, 1), at = x => r.find(p => p.x === x)?.y;
      info = `${A.name} ÷ ${Bc.name}: на ${from} = ${B.fmt(at(from))}, на ${to} = ${B.fmt(at(to))}. ` + (cr.length ? `Рівність 1:1 на рівні ${cr.map(x => Math.round(x * 10) / 10).join(', ')}.` : 'Рівності 1:1 на цьому проміжку немає.');
    }
    $('ratioInfo').textContent = info;
    if (A && Bc) { const rr = B.ratio(B.series(A, from, to), B.series(Bc, from, to)); chart($('rplot'), { xs: rr.map(p => p.x), lines: [{ name: 'відношення', color: '#e8d29e', pts: rr }], log: true, refLine: 1, xlabel: 'x', label: 'Співвідношення', tip: i => [el('div', {}, `${A.name} ÷ ${Bc.name}: ${B.fmt(rr[i].y)}`)] }); }
    $('legend').replaceChildren(...lines.map(l => el('span', {}, el('i', { style: `background:${l.color}` }), l.name)));
    chart($('plot'), { xs, lines, log: st.log, pct: st.view === 'gr', xlabel: 'x', refLine: ref, label: 'Графік кривих', tip: i => lines.map(l => el('div', { style: `color:${l.color}` }, `${l.name}: ${B.fmt(l.pts.find(p => p.x === xs[i])?.y)}${st.view === 'gr' ? '%' : ''}`)) });
    // таблиця
    const t = $('tbl'); const head = el('tr', {}, el('th', {}, 'x'), vis.map(c => el('th', {}, c.name)));
    const rows = []; for (let x = from; x <= to; x++) rows.push(el('tr', {}, el('td', {}, x), vis.map(c => el('td', {}, B.fmt(B.evalCurve(c, x))))));
    t.replaceChildren(el('thead', {}, head), el('tbody', {}, rows));
  }
  $('presetSlot').append(FormulaUI.presetSelect(p => { st.curves.push({ id: Date.now(), name: p.name.slice(0, 32), type: 'custom', expr: p.expr, a: p.a, b: p.b, p: p.p, pl: p.pl, color: COLORS[st.curves.length % COLORS.length], on: true }); commit(true); toast('Додано: ' + p.name + '. ' + p.hint, 3500); }));
  $('formulaHelp').append(FormulaUI.help());
  function commit(rebuild, light) { save(); if (rebuild) renderCurves(); renderChart(); }
  $('btnAdd').onclick = () => { st.curves.push({ id: Date.now(), name: 'Крива ' + (st.curves.length + 1), type: 'linear', a: 10, b: 5, p: 0, color: COLORS[st.curves.length % COLORS.length], on: true }); commit(true); };
  $('nFrom').oninput = e => { st.from = Math.max(0, Math.round(+e.target.value) || 0); commit(false); };
  $('nTo').oninput = e => { st.to = Math.min(1000, Math.max(2, Math.round(+e.target.value) || 2)); commit(false); };
  $('selView').onchange = e => { st.view = e.target.value; commit(false); };
  $('cLog').onchange = e => { st.log = e.target.checked; commit(false); };
  const pickRatio = () => { st.ratioPick = { a: st.curves.findIndex(c => String(c.id) === $('selA').value), b: st.curves.findIndex(c => String(c.id) === $('selB').value) }; commit(false); };
  $('selA').onchange = pickRatio; $('selB').onchange = pickRatio;
  const curvesCsv = () => { const [f, t] = range(); download(B.toCsv(st.curves.filter(c => c.on), f, t), 'balance-curves.csv', 'text/csv'); };
  const curvesJson = () => { const [f, t] = range(); download(JSON.stringify({ from: f, to: t, curves: st.curves.map(c => ({ name: c.name, type: c.type, a: c.a, b: c.b, p: c.p, values: B.series(c, f, t).map(p => Math.round(p.y * 1e4) / 1e4) })) }, null, 2), 'balance-curves-table.json', 'application/json'); };

  /* ---------- вкладка «Хвилі» ---------- */
  /* Редактор кривої для вкладки «Хвилі» (бюджет, множник HP): тип, параметри, власна формула й бібліотека. */
  function curveEditor(box, bd, what, rebuild, light, o) {
    const T = B.TYPES, bs = el('select', { 'aria-label': 'Тип кривої ' + what, title: 'Як росте крива ' + what + ' від хвилі до хвилі; «Власна формула» дозволяє записати свою' }, Object.entries(T).map(([k, t]) => el('option', { value: k, selected: k === bd.type }, t.name)));
    bs.onchange = () => { bd.type = bs.value; if (bd.type === 'exp' && bd.b < 1) bd.b = o.b; if (bd.type === 'custom') { bd.expr = bd.expr || 'a + b * x'; if (!bd.a) bd.a = 1; } o.def(bd); rebuild(); };
    const lib = FormulaUI.presetSelect(p => { Object.assign(bd, { type: 'custom', expr: p.expr, a: p.a, b: p.b, p: p.p, pl: p.pl }); rebuild(); }, '＋ Формула з бібліотеки…');
    box.replaceChildren(el('div', { class: 'row2' }, bs, el('span', { class: 'formula', title: 'Формула' }, bd.type === 'custom' ? '= ' + (bd.expr || '…') : T[bd.type].f)),
      bd.type === 'custom' ? FormulaUI.exprBox(bd, light) : null,
      el('div', { class: 'params' }, Object.entries(T[bd.type].params).map(([k, lab0]) => { const lab = (bd.type === 'custom' && bd.pl && bd.pl[k]) || lab0, i = el('input', { type: 'number', step: 'any', value: bd[k], 'aria-label': lab, title: 'Параметр: ' + lab }); i.oninput = () => { bd[k] = +i.value || 0; light(); }; return el('label', {}, lab, i); })), lib);
  }
  let wavesCache = [];
  function renderWaveUi() {
    const w = st.waves;
    $('wTo').value = w.to; $('wSeed').value = w.seed; $('wBoss').value = w.boss; $('wShare').value = w.share;
    curveEditor($('wBudget'), w.budget, 'бюджету', () => { renderWaveUi(); wcommit(); }, () => wcommit(), { type: 'exp', b: 1.08, def: bd => { if (bd.type === 'logistic') { bd.a = 200; bd.b = .15; bd.p = w.to / 2; } } });
    curveEditor($('wHp'), w.hpScale, 'множника HP', () => { renderWaveUi(); wcommit(); }, () => wcommit(), { type: 'exp', b: 1.03, def: bd => { if (bd.type === 'logistic') { bd.a = 5; bd.b = .15; bd.p = w.to / 2; } } });
    const wtips = { name: 'Назва типу ворога', cost: 'Скільки бюджету складності забирає один ворог цього типу', hp: 'Здоров\'я одного ворога (для підрахунку загального HP хвилі)', minWave: 'З якої хвилі цей тип починає з\'являтися', weight: 'Як часто тип обирається, коли є вибір: більша вага означає частіше' };
    const box = $('wTypes'); box.replaceChildren();
    w.types.forEach((t, idx) => {
      const f = (k, lab, type = 'number', props = {}) => { const i = el('input', Object.assign({ type, value: t[k], 'aria-label': lab, title: wtips[k] }, props)); i.oninput = () => { t[k] = type === 'number' ? (+i.value || 0) : i.value; wcommit(); }; return el('label', { class: 'num', title: wtips[k] }, lab, i); };
      box.append(el('div', { class: 'trow' }, f('name', 'Назва', 'text'), f('cost', 'Вартість', 'number', { min: .1, step: 'any' }), f('hp', 'HP', 'number', { min: 0, step: 'any' }), f('minWave', 'З хвилі', 'number', { min: 1 }), f('weight', 'Вага', 'number', { min: 0, step: 'any' }),
        el('button', { title: 'Видалити цей тип ворога', onclick: () => { w.types.splice(idx, 1); renderWaveUi(); wcommit(); } }, '✕')));
    });
  }
  function wcommit() { save(); renderWaves(); }
  function renderWaves() {
    const w = st.waves;
    wavesCache = B.buildWaves({ to: w.to, seed: w.seed, budget: w.budget, hpScale: w.hpScale, bossEvery: w.boss, bossShare: w.share / 100, types: w.types.filter(t => t.name) });
    const names = [...new Set(wavesCache.flatMap(x => x.enemies.map(e => e.name)))], color = n => COLORS[Math.max(0, names.indexOf(n)) % COLORS.length];
    const xs = wavesCache.map(x => x.wave);
    $('wlegend').replaceChildren(...names.map(n => el('span', {}, el('i', { style: `background:${color(n)}` }), n)), el('span', {}, '▲ — хвиля з босом'));
    chart($('wplot'), { xs, lines: [], bars: { series: names.map(n => ({ name: n, color: color(n), vals: wavesCache.map(x => x.enemies.find(e => e.name === n)?.count || 0) })), totals: wavesCache.map(x => x.total), boss: wavesCache.map(x => x.boss) }, xlabel: 'Хвиля', label: 'Склад хвиль',
      tip: i => { const x = wavesCache[i]; return [el('div', {}, `Усього: ${x.total}, HP: ${B.fmt(x.hp)}`), el('div', {}, `Бюджет: ${B.fmt(x.budget)}`), ...x.enemies.map(e => el('div', { style: `color:${color(e.name)}` }, `${e.name}: ${e.count}`))]; } });
    const t = $('wtbl');
    t.replaceChildren(el('thead', {}, el('tr', {}, ...['Хвиля', 'Бюджет', 'Ворогів', 'Загальне HP', 'Склад'].map(h => el('th', h === 'Склад' ? { class: 'enemies' } : {}, h)))),
      el('tbody', {}, wavesCache.map(x => el('tr', { class: x.boss ? 'boss' : '' }, el('td', {}, x.wave + (x.boss ? ' ▲' : '')), el('td', {}, B.fmt(x.budget)), el('td', {}, x.total), el('td', {}, B.fmt(x.hp)), el('td', { class: 'enemies' }, x.enemies.map(e => `${e.name} ×${e.count}`).join(', '))))));
  }
  $('wTo').oninput = e => { st.waves.to = Math.min(200, Math.max(1, Math.round(+e.target.value) || 1)); wcommit(); };
  $('wSeed').oninput = e => { st.waves.seed = Math.max(1, Math.round(+e.target.value) || 1); wcommit(); };
  $('wBoss').oninput = e => { st.waves.boss = Math.max(0, Math.round(+e.target.value) || 0); wcommit(); };
  $('wShare').oninput = e => { st.waves.share = Math.min(90, Math.max(5, Math.round(+e.target.value) || 40)); wcommit(); };
  $('btnWReroll').onclick = () => { st.waves.seed = 1 + Math.floor(Math.random() * 99999); renderWaveUi(); wcommit(); };
  $('btnWType').onclick = () => { st.waves.types.push({ name: 'Новий ' + (st.waves.types.length + 1), cost: 3, hp: 60, minWave: 1, weight: 1 }); renderWaveUi(); wcommit(); };
  const wavesCsv = () => { const names = [...new Set(wavesCache.flatMap(x => x.enemies.map(e => e.name)))]; download(['wave,budget,total,hp,boss,' + names.map(n => JSON.stringify(n)).join(','), ...wavesCache.map(x => [x.wave, Math.round(x.budget * 100) / 100, x.total, Math.round(x.hp), x.boss ? 1 : 0, ...names.map(n => x.enemies.find(e => e.name === n)?.count || 0)].join(','))].join('\n'), 'waves.csv', 'text/csv'); };
  const wavesJson = () => download(JSON.stringify({ seed: st.waves.seed, waves: wavesCache }, null, 2), 'waves.json', 'application/json');
  const curTab = () => store.get('tab', 'curves');
  $('btnCsv').onclick = () => (curTab() === 'curves' ? curvesCsv() : wavesCsv());
  $('btnJson').onclick = () => (curTab() === 'curves' ? curvesJson() : wavesJson());
  const snapshot = () => JSON.parse(JSON.stringify(st));
  $('btnExport').onclick = () => download(JSON.stringify(snapshot(), null, 2), 'balance-curves.json', 'application/json');
  $('btnCopyJson').onclick = async () => { try { await navigator.clipboard.writeText(JSON.stringify(snapshot(), null, 2)); toast('JSON скопійовано'); } catch { toast('Не вдалося скопіювати'); } };
  $('btnImport').onclick = () => $('file').click();
  $('file').onchange = async e => {
    const f = e.target.files[0]; e.target.value = ''; if (!f) return;
    try {
      const j = JSON.parse(await f.text()); if (!Array.isArray(j.curves)) throw new Error('немає curves');
      const d = DEFAULTS(); for (const k of Object.keys(st)) delete st[k];
      Object.assign(st, d, j); st.waves = Object.assign(d.waves, j.waves || {});
      st.curves = j.curves.map((c, i) => ({ id: c.id || Date.now() + i, name: String(c.name || 'Крива ' + (i + 1)), type: B.TYPES[c.type] ? c.type : 'linear', a: +c.a || 0, b: +c.b || 0, p: +c.p || 0, expr: c.type === 'custom' ? String(c.expr || 'x').slice(0, 400) : undefined, pl: c.type === 'custom' && c.pl ? { a: String(c.pl.a || ''), b: String(c.pl.b || ''), p: String(c.pl.p || '') } : undefined, color: c.color || COLORS[i % COLORS.length], on: c.on !== false }));
      save(); renderCurves(); renderWaveUi(); tab(curTab()); toast('Імпортовано');
    } catch { toast('Не вдалося прочитати файл'); }
  };
  $('selCodeLang').onchange = async e => { const lang = e.target.value; e.target.value = ''; const c = curveById($('selCodeCurve').value) || st.curves[0]; if (!lang || !c) return; const t = B.toCode(c, lang); try { await navigator.clipboard.writeText(t); toast('Скопійовано: ' + c.name + ' (' + lang.toUpperCase() + ')'); } catch { toast(t, 5000); } };

  /* ---------- меню-іконки (окремо для кожної вкладки) ---------- */
  const panels = {};
  for (const [id, key] of [['viewCurves', 'c'], ['viewWaves', 'w']]) {
    const root = $(id), drawer = root.querySelector('.drawer'); let cur = store.get('panel_' + key, key === 'c' ? 'curves' : 'budget');
    const show = n => {
      cur = n; store.set('panel_' + key, n || ''); drawer.hidden = !n; root.classList.toggle('shift', !!n);
      root.querySelectorAll('.rail button').forEach(b => b.classList.toggle('on', b.dataset.panel === n));
      drawer.querySelectorAll('section').forEach(x => x.classList.toggle('on', x.dataset.panel === n));
      requestAnimationFrame(() => (key === 'c' ? renderChart() : renderWaves()));
    };
    root.querySelectorAll('.rail button').forEach(b => { b.onclick = () => show(cur === b.dataset.panel ? '' : b.dataset.panel); });
    drawer.querySelector('[data-close]').onclick = () => show('');
    panels[key] = () => show(cur);
  }

  /* ---------- вкладки й запуск ---------- */
  function tab(which) {
    const c = which === 'curves'; $('viewCurves').hidden = !c; $('viewWaves').hidden = c;
    $('tabCurves').setAttribute('aria-selected', c); $('tabWaves').setAttribute('aria-selected', !c);
    store.set('tab', which); if (c) renderChart(); else renderWaves();
  }
  $('tabCurves').onclick = () => tab('curves'); $('tabWaves').onclick = () => tab('waves');
  $('btnReset').onclick = () => { const d = DEFAULTS(); for (const k of Object.keys(st)) delete st[k]; Object.assign(st, d); save(); renderCurves(); renderWaveUi(); tab(store.get('tab', 'curves')); toast('Повернуто приклад'); };
  if (window.ResizeObserver) { let t; const ro = new ResizeObserver(() => { clearTimeout(t); t = setTimeout(() => (store.get('tab', 'curves') === 'curves' ? renderChart() : renderWaves()), 80); }); ro.observe(document.body); ro.observe($('plot')); ro.observe($('wplot')); }
  renderCurves(); renderWaveUi(); tab(store.get('tab', 'curves'));
  panels.c(); panels.w();
})();
