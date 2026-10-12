// Skill Tree Lab: інтерфейс. Правила, перевірка й генератор живуть у tree-core.js.
(function () {
  'use strict';
  const T = TreeCore;
  const $ = id => document.getElementById(id);

  /* ---------- допоміжне ---------- */
  function h(tag, props, ...kids) {
    const e = document.createElement(tag);
    if (props) for (const [k, v] of Object.entries(props)) {
      if (v == null || v === false) continue;
      if (k === 'class') e.className = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else if (v === true) e.setAttribute(k, '');
      else e.setAttribute(k, v);
    }
    for (const c of kids.flat()) { if (c == null || c === false) continue; e.append(c.nodeType ? c : document.createTextNode(String(c))); }
    return e;
  }
  const store = {
    get(k, d) { try { const v = localStorage.getItem('st_' + k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem('st_' + k, JSON.stringify(v)); } catch {} },
  };
  let toastTimer;
  function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2400); }
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const fmtStat = (st, v) => `${(st && st.name) || ''}: ${v > 0 ? '+' : ''}${Math.round(v * 100) / 100}${st && st.pct ? '%' : ''}`;

  /* ---------- стан ---------- */
  const saved = store.get('state', null);
  let tree = null, build = T.emptyState(), mode = 'play', view = null;
  try {
    if (saved && saved.tree) {
      tree = T.sanitize(saved.tree);
      if (saved.build && T.validState(tree, saved.build)) build = saved.build;
      if (saved.view && Number.isFinite(saved.view.k)) view = saved.view;
    }
  } catch { tree = null; }
  if (!tree) tree = T.generateTree({ seed: 'zbyrai' });
  if (saved && saved.mode === 'edit') mode = 'edit';
  let sel = null, hover = null, edited = false, A = null;
  let saveTimer = 0;
  const dirty = () => { A = null; };
  const analysis = () => A || (A = T.analyze(tree, build));
  const byId = id => analysis().idx.byId.get(id);
  function persist() { clearTimeout(saveTimer); saveTimer = setTimeout(() => store.set('state', { tree, build, mode, view }), 250); }

  /* ---------- полотно ---------- */
  const cv = $('cv'), ctx = cv.getContext('2d'), stage = $('stage');
  let W = 1, H = 1, dpr = 1, raf = 0;
  const schedule = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; draw(); }); };
  function resize() {
    const r = stage.getBoundingClientRect();
    dpr = window.devicePixelRatio || 1; W = Math.max(1, r.width); H = Math.max(1, r.height);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    if (!view) fit();
    schedule();
  }
  function fit() {
    const ns = tree.nodes;
    if (!ns.length) { view = { x: W / 2, y: H / 2, k: 1 }; return; }
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const n of ns) { x0 = Math.min(x0, n.x); y0 = Math.min(y0, n.y); x1 = Math.max(x1, n.x); y1 = Math.max(y1, n.y); }
    const pad = 70, k = clamp(Math.min(W / (x1 - x0 + pad * 2), H / (y1 - y0 + pad * 2)), 0.12, 1.4);
    view = { k, x: W / 2 - ((x0 + x1) / 2) * k, y: H / 2 - ((y0 + y1) / 2) * k };
  }
  function zoomAt(sx, sy, f) {
    const k = clamp(view.k * f, 0.12, 4), r = k / view.k;
    view.x = sx - (sx - view.x) * r; view.y = sy - (sy - view.y) * r; view.k = k;
    schedule(); persist();
  }
  new ResizeObserver(resize).observe(stage);

  const COL = { gold: '#c9a766', goldHi: '#e8d29e', line: '#2e2e3a', accent: '#7aa7e6', text: '#ece8df', part: '#6b5a35', open: '#1c2232', locked: '#101015', lockedLine: '#34343f' };
  const isOn = s => s === 'start' || s === 'full' || s === 'part';

  function shape(n, r) {
    ctx.beginPath();
    if (n.kind === 'notable') { ctx.moveTo(n.x, n.y - r); ctx.lineTo(n.x + r, n.y); ctx.lineTo(n.x, n.y + r); ctx.lineTo(n.x - r, n.y); ctx.closePath(); }
    else if (n.kind === 'keystone') { for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + i * Math.PI / 3; ctx[i ? 'lineTo' : 'moveTo'](n.x + Math.cos(a) * r, n.y + Math.sin(a) * r); } ctx.closePath(); }
    else ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
  }

  function draw() {
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
    if (!view) return;
    const k = view.k, a = analysis();
    ctx.setTransform(dpr * k, 0, 0, dpr * k, dpr * view.x, dpr * view.y);
    const vx0 = -view.x / k - 60, vy0 = -view.y / k - 60, vx1 = (W - view.x) / k + 60, vy1 = (H - view.y) / k + 60;
    const vis = n => n.x >= vx0 && n.x <= vx1 && n.y >= vy0 && n.y <= vy1;
    const small = tree.nodes.length <= 40; // у малих деревах підписуємо всі вузли

    // зв’язки
    ctx.lineWidth = 2.4; ctx.lineCap = 'round';
    for (const [i, j] of tree.links) {
      const p = a.idx.byId.get(i), q = a.idx.byId.get(j);
      if (!p || !q || (!vis(p) && !vis(q))) continue;
      const op = isOn(a.status.get(i)), oq = isOn(a.status.get(j));
      const col = op && oq ? COL.gold : (op || oq) ? 'rgba(122,167,230,.6)' : COL.line;
      ctx.strokeStyle = col; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
      if (tree.mode === 'prereq' && k >= .4) {
        const dx = q.x - p.x, dy = q.y - p.y, len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len;
        const rq = T.KINDS[q.kind].r + 5, bx = q.x - ux * rq, by = q.y - uy * rq;
        ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx - ux * 8 - uy * 4.5, by - uy * 8 + ux * 4.5); ctx.lineTo(bx - ux * 8 + uy * 4.5, by - uy * 8 - ux * 4.5); ctx.closePath(); ctx.fill();
      }
    }

    // вузли
    ctx.lineWidth = 2; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const n of tree.nodes) {
      if (!vis(n)) continue;
      const st = a.status.get(n.id), r = T.KINDS[n.kind].r, rank = build.ranks[n.id] | 0;
      const lit = st === 'full' || st === 'start';
      ctx.fillStyle = lit ? COL.gold : st === 'part' ? COL.part : st === 'open' ? COL.open : COL.locked;
      ctx.strokeStyle = lit ? COL.goldHi : st === 'part' ? COL.gold : st === 'open' ? COL.accent : COL.lockedLine;
      if (lit && k > .35) { ctx.shadowColor = 'rgba(201,167,102,.7)'; ctx.shadowBlur = 14; }
      shape(n, r); ctx.fill(); ctx.shadowBlur = 0; ctx.stroke();
      if (st === 'start') { ctx.fillStyle = '#17120a'; ctx.beginPath(); ctx.arc(n.x, n.y, 3.5, 0, Math.PI * 2); ctx.fill(); }
      if (st === 'open') { ctx.strokeStyle = 'rgba(122,167,230,.25)'; ctx.lineWidth = 5; shape(n, r + 1); ctx.stroke(); ctx.lineWidth = 2; }
      if (n.max > 1 && k >= .6) {
        ctx.font = '600 10px Inter, system-ui, sans-serif'; ctx.fillStyle = lit ? '#17120a' : COL.text;
        if (r >= 11) ctx.fillText(rank + '/' + n.max, n.x, n.y + .5);
        else { ctx.fillStyle = rank ? COL.goldHi : '#8a867d'; ctx.fillText(rank + '/' + n.max, n.x, n.y + r + 9); }
      }
      if (n.id === sel) { ctx.strokeStyle = '#fff'; ctx.setLineDash([4, 3]); shape(n, r + 6); ctx.stroke(); ctx.setLineDash([]); }
      else if (n.id === hover) { ctx.strokeStyle = 'rgba(169,200,242,.8)'; shape(n, r + 4); ctx.stroke(); }
      if ((k >= 1.25 && (n.kind === 'notable' || n.kind === 'keystone')) || k >= 2.2 || n.id === sel || (small && k >= .7)) {
        ctx.font = (n.kind === 'small' ? '500 10.5px' : '600 12px') + ' Inter, system-ui, sans-serif';
        ctx.fillStyle = isOn(st) ? COL.goldHi : '#b5b0a5'; ctx.fillText(n.name, n.x, n.y - r - 9);
      }
    }
  }

  /* ---------- вказівник ---------- */
  const pos = e => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const toWorld = p => ({ x: (p.x - view.x) / view.k, y: (p.y - view.y) / view.k });
  function nodeAt(p) {
    const w = toWorld(p), pad = Math.max(2, 6 / view.k);
    let best = null, bd = Infinity;
    for (const n of tree.nodes) {
      const d = Math.hypot(n.x - w.x, n.y - w.y);
      if (d <= T.KINDS[n.kind].r + pad && d < bd) { best = n; bd = d; }
    }
    return best;
  }
  let drag = null;
  cv.addEventListener('pointerdown', e => {
    if (e.button === 2) return;
    cv.setPointerCapture(e.pointerId); cv.focus({ preventScroll: true });
    const p = pos(e), n = nodeAt(p);
    drag = { sx: p.x, sy: p.y, vx: view.x, vy: view.y, moved: false, n, mod: e.shiftKey || e.ctrlKey || e.metaKey, type: n && mode === 'edit' ? 'node' : 'pan', nx: n ? n.x : 0, ny: n ? n.y : 0 };
  });
  cv.addEventListener('pointermove', e => {
    const p = pos(e);
    if (drag) {
      const dx = p.x - drag.sx, dy = p.y - drag.sy;
      if (!drag.moved && Math.hypot(dx, dy) > 4) { drag.moved = true; if (drag.type === 'pan') cv.classList.add('grabbing'); hideTip(); }
      if (drag.moved) {
        if (drag.type === 'pan') { view.x = drag.vx + dx; view.y = drag.vy + dy; }
        else { drag.n.x = Math.round((drag.nx + dx / view.k) / 5) * 5; drag.n.y = Math.round((drag.ny + dy / view.k) / 5) * 5; edited = true; }
        schedule();
      }
      return;
    }
    const n = nodeAt(p), id = n ? n.id : null;
    if (id !== hover) { hover = id; cv.classList.toggle('pointer', !!id); schedule(); }
    if (n) showTip(n, p); else hideTip();
  });
  cv.addEventListener('pointerup', () => {
    if (!drag) return;
    const d = drag; drag = null; cv.classList.remove('grabbing');
    if (d.moved) { if (d.type === 'node') { refreshLight(); renderInspector(); } persist(); return; }
    clickNode(d.n, d.mod);
  });
  cv.addEventListener('pointerleave', () => { if (!drag) { hover = null; hideTip(); schedule(); } });
  cv.addEventListener('contextmenu', e => { e.preventDefault(); const n = nodeAt(pos(e)); if (n && mode === 'play') { sel = n.id; tryRefund(n); } });
  cv.addEventListener('wheel', e => { e.preventDefault(); const p = pos(e); zoomAt(p.x, p.y, Math.exp(-e.deltaY * 0.0016)); }, { passive: false });
  cv.addEventListener('dblclick', e => {
    if (mode !== 'edit') return;
    const p = pos(e); if (nodeAt(p)) return;
    const w = toWorld(p); addNode(Math.round(w.x / 5) * 5, Math.round(w.y / 5) * 5);
  });
  document.addEventListener('keydown', e => {
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) || $('dlgImport').open) return;
    if (e.key === 'Escape') { sel = null; refreshAll(); }
    else if ((e.key === 'Delete' || e.key === 'Backspace') && mode === 'edit' && sel) { e.preventDefault(); deleteNode(sel); }
  });

  const tip = $('tip');
  function showTip(n, p) {
    const a = analysis(), st = a.status.get(n.id), rank = build.ranks[n.id] | 0;
    tip.textContent = '';
    tip.append(h('b', null, n.name));
    if (n.desc) tip.append(document.createTextNode(n.desc));
    if (n.kind !== 'start') tip.append(h('small', null, `Ранг ${rank}/${n.max} · ціна ${n.cost}${n.need ? ' · потрібно ' + n.need + ' очок в інших' : ''}`));
    if (mode === 'play' && st === 'locked') tip.append(h('small', null, T.canAllocate(tree, build, n.id, a.idx).reason));
    tip.hidden = false;
    const w = tip.offsetWidth, hh = tip.offsetHeight;
    tip.style.left = clamp(p.x + 16, 8, W - w - 8) + 'px'; tip.style.top = clamp(p.y + 16, 8, H - hh - 8) + 'px';
  }
  const hideTip = () => { tip.hidden = true; };

  /* ---------- дії ---------- */
  function clickNode(n, mod) {
    if (!n) { if (sel) { sel = null; refreshAll(); } return; }
    if (mode === 'play') { sel = n.id; if (mod) tryRefund(n); else tryAllocate(n); return; }
    if (sel && sel !== n.id && mod) { toggleLink(sel, n.id); return; }
    sel = n.id; refreshAll();
  }
  function tryAllocate(n) {
    const r = T.canAllocate(tree, build, n.id, analysis().idx);
    if (!r.ok) { toast(r.reason); refreshAll(); return; }
    build = T.allocate(tree, build, n.id, analysis().idx); dirty(); refreshAll(); persist();
  }
  function tryRefund(n) {
    const idx = analysis().idx;
    if (!T.canRefund(tree, build, n.id, idx)) { toast((build.ranks[n.id] | 0) ? 'Не можна забрати: від цього вузла залежать інші.' : 'Тут нічого забирати.'); refreshAll(); return; }
    build = T.refund(tree, build, n.id, idx); dirty(); refreshAll(); persist();
  }
  function repairBuild() {
    const ids = new Set(tree.nodes.map(n => n.id));
    for (const id of Object.keys(build.ranks)) if (!ids.has(id)) delete build.ranks[id];
    if (!T.validState(tree, build)) { build = T.emptyState(); toast('Розподіл очок скинуто: він більше не відповідає дереву.'); }
    dirty();
  }
  function uniqueId() { const ids = new Set(tree.nodes.map(n => n.id)); let i = tree.nodes.length + 1; while (ids.has('n' + i)) i++; return 'n' + i; }
  function addNode(x, y) {
    const first = !tree.nodes.length && tree.mode === 'path';
    const n = { id: uniqueId(), x, y, name: first ? 'Початок' : 'Новий вузол', desc: '', kind: first ? 'start' : 'small', max: 1, cost: first ? 0 : 1, need: 0, stats: {} };
    tree.nodes.push(n);
    if (sel && tree.nodes.some(m => m.id === sel)) tree.links.push([sel, n.id]);
    sel = n.id; edited = true; dirty(); refreshAll(); persist();
  }
  function deleteNode(id) {
    tree.nodes = tree.nodes.filter(n => n.id !== id);
    tree.links = tree.links.filter(([a, b]) => a !== id && b !== id);
    delete build.ranks[id]; sel = null; hover = null; hideTip(); edited = true; repairBuild(); refreshAll(); persist();
  }
  function toggleLink(a, b) {
    const same = (l, x, y) => l[0] === x && l[1] === y;
    const prereq = tree.mode === 'prereq';
    const i = tree.links.findIndex(l => same(l, a, b) || (!prereq && same(l, b, a)) || (prereq && same(l, b, a)));
    if (i >= 0) { tree.links.splice(i, 1); toast('Зв’язок прибрано'); }
    else {
      tree.links.push([a, b]);
      if (prereq && T.validate(tree).some(p => p.includes('цикл'))) { tree.links.pop(); toast('Так не можна: вийшов би цикл у вимогах.'); return; }
      toast(prereq ? 'Зв’язок додано: перший вузол стає вимогою для другого' : 'Зв’язок додано');
    }
    edited = true; repairBuild(); refreshAll(); persist();
  }
  function replaceTree(next, nextBuild) {
    if (edited && !window.confirm('Замінити поточне дерево? Незбережені зміни буде втрачено.')) return false;
    tree = next; build = nextBuild || T.emptyState(); sel = null; hover = null; edited = false; view = null; dirty(); fit(); refreshAll(); persist();
    return true;
  }

  /* ---------- бічні панелі ---------- */
  function renderSummary() {
    const a = analysis(), box = $('sum'); box.textContent = '';
    box.append(h('div', { class: 'kv' }, 'Очок витрачено', h('b', null, a.spent + ' / ' + tree.points)),
      h('div', { class: 'meter' }, h('i', { style: `width:${tree.points ? clamp(a.spent / tree.points * 100, 0, 100) : 0}%` })));
    const sum = T.summary(tree, build);
    if (!sum.length) box.append(h('p', { class: 'empty' }, 'Вклади очки, і тут з’являться підсумкові стати.'));
    for (const s of sum) box.append(h('div', { class: 'kv pos' }, s.name, h('b', null, `${s.value > 0 ? '+' : ''}${s.value}${s.pct ? '%' : ''}`)));
    const total = tree.nodes.length, used = tree.nodes.filter(n => build.ranks[n.id]).length;
    box.append(h('p', { class: 'hint' }, `Вузлів: ${total} · вкладено в ${used}`));
  }

  function statsToText(stats) { return Object.entries(stats || {}).map(([k, v]) => `${k}:${v}`).join(', '); }
  function parseStats(text) {
    const out = {};
    for (const part of String(text).split(',')) {
      const m = part.trim().match(/^([\w]+)\s*:\s*(-?[\d.]+)$/);
      if (m && Number.isFinite(Number(m[2]))) { out[m[1]] = Number(m[2]); if (!tree.stats[m[1]]) tree.stats[m[1]] = { name: m[1] }; }
    }
    return out;
  }

  function renderInspector() {
    const box = $('inspector'); box.textContent = '';
    const n = sel && byId(sel);
    if (!n) { box.append(h('p', { class: 'empty' }, mode === 'play' ? 'Клікни вузол, щоб вкласти очко. Наведи курсор, щоб побачити опис.' : 'Вибери вузол, щоб змінити його. Подвійний клік по порожньому місцю додає новий.')); return; }
    const a = analysis(), st = a.status.get(n.id), rank = build.ranks[n.id] | 0;
    if (mode === 'edit') {
      const on = (fn, rerender) => e => { fn(e.target); edited = true; dirty(); refreshLight(); if (rerender) renderInspector(); persist(); };
      box.append(h('div', { class: 'form' },
        h('label', null, 'Назва', h('input', { type: 'text', value: n.name, onchange: on(el => { n.name = el.value.trim() || n.name; }) })),
        h('label', null, 'Тип', h('select', { onchange: on(el => { n.kind = el.value; if (n.kind === 'start') n.cost = 0; }, true) }, Object.entries(T.KINDS).map(([k, v]) => h('option', { value: k, selected: k === n.kind }, v.name)))),
        h('div', { class: 'two' },
          h('label', null, 'Рангів', h('input', { type: 'number', min: 1, max: 99, value: n.max, onchange: on(el => { n.max = Math.round(clamp(+el.value || 1, 1, 99)); }) })),
          h('label', null, 'Ціна', h('input', { type: 'number', min: 0, max: 999, value: n.cost, onchange: on(el => { n.cost = Math.round(clamp(+el.value || 0, 0, 999)); }) })),
          h('label', null, 'Потрібно очок', h('input', { type: 'number', min: 0, value: n.need, onchange: on(el => { n.need = Math.round(clamp(+el.value || 0, 0, 99999)); }) }))),
        h('label', null, 'Стати за ранг (ключ:значення)', h('input', { type: 'text', value: statsToText(n.stats), onchange: on(el => { n.stats = parseStats(el.value); el.value = statsToText(n.stats); }, false) })),
        h('label', null, 'Опис', h('textarea', { onchange: on(el => { n.desc = el.value.slice(0, 300); }) }, n.desc)),
      ));
      box.append(h('div', { class: 'btns' }, h('button', { class: 'danger', onclick: () => deleteNode(n.id) }, 'Видалити вузол')));
      box.append(h('p', { class: 'hint' }, tree.mode === 'prereq' ? 'Shift+клік по іншому вузлу: перший стає вимогою для другого (стрілка). Повторний Shift+клік прибирає зв’язок.' : 'Shift+клік по іншому вузлу з’єднує або роз’єднує їх.'));
      return;
    }
    box.append(h('p', { class: 'nname' }, n.name), h('span', { class: 'badge ' + n.kind }, T.KINDS[n.kind].name));
    if (n.desc) box.append(h('p', { class: 'ndesc' }, n.desc));
    for (const [s, v] of Object.entries(n.stats || {})) box.append(h('div', { class: 'kv pos' }, 'за ранг', h('b', null, fmtStat(tree.stats[s] || { name: s }, v))));
    if (n.kind !== 'start') {
      box.append(h('div', { class: 'kv' }, 'Ранг', h('b', null, `${rank} / ${n.max}`)), h('div', { class: 'kv' }, 'Ціна', h('b', null, n.cost)));
      if (n.need) box.append(h('div', { class: 'kv' }, 'Потрібно в інших', h('b', null, n.need)));
      const can = T.canAllocate(tree, build, n.id, a.idx);
      if (!can.ok && st !== 'full') box.append(h('p', { class: 'reason' }, can.reason));
      box.append(h('div', { class: 'btns' },
        h('button', { class: 'btn-primary', disabled: !can.ok, onclick: () => tryAllocate(n) }, 'Вкласти +'),
        h('button', { disabled: !T.canRefund(tree, build, n.id, a.idx), onclick: () => tryRefund(n) }, 'Забрати −')));
    }
  }

  function renderTreeSet() {
    const box = $('treeset'); box.textContent = '';
    const on = fn => e => { fn(e.target); edited = true; repairBuild(); refreshLight(); renderTreeSet(); persist(); };
    box.append(h('div', { class: 'form' },
      h('label', null, 'Назва дерева', h('input', { type: 'text', value: tree.name, onchange: on(el => { tree.name = el.value.trim() || tree.name; }) })),
      h('div', { class: 'two', style: 'grid-template-columns:1fr 1fr' },
        h('label', null, 'Очок', h('input', { type: 'number', min: 0, value: tree.points, onchange: on(el => { tree.points = Math.round(clamp(+el.value || 0, 0, 99999)); }) })),
        h('label', null, 'Відкриття вузла', h('select', { onchange: on(el => { tree.mode = el.value; }) },
          h('option', { value: 'path', selected: tree.mode === 'path' }, 'Шлях (сусід)'), h('option', { value: 'prereq', selected: tree.mode === 'prereq' }, 'Вимоги (стрілки)'))))));
    const problems = T.validate(tree);
    box.append(problems.length ? h('div', { class: 'warns' }, problems.slice(0, 4).map(p => h('div', { class: 'warn' }, p))) : h('div', { class: 'okmsg' }, 'Дерево без проблем: усі вузли досяжні, цикли відсутні.'));

    box.append(h('p', { class: 'sub-t' }, 'Нове дерево'));
    const g = { seed: store.get('gseed', 'zbyrai'), branches: store.get('gbr', 6), depth: store.get('gdp', 10) };
    const gi = (label, key, type, o = {}) => h('label', null, label, h('input', Object.assign({ type, value: g[key], onchange: e => { g[key] = type === 'number' ? +e.target.value : e.target.value; store.set({ seed: 'gseed', branches: 'gbr', depth: 'gdp' }[key], g[key]); } }, o)));
    box.append(h('div', { class: 'form' },
      h('div', { class: 'two' }, gi('Seed', 'seed', 'text'), gi('Гілок', 'branches', 'number', { min: 2, max: 8 }), gi('Глибина', 'depth', 'number', { min: 3, max: 16 })),
      h('div', { class: 'btns' },
        h('button', { class: 'btn-primary', onclick: () => { const t = T.generateTree({ seed: g.seed, branches: g.branches, depth: g.depth }); if (replaceTree(t)) toast(`Згенеровано ${t.nodes.length} вузлів`); } }, 'Згенерувати'),
        h('button', { onclick: () => { if (replaceTree(T.tiersExample())) toast('Приклад: три класи'); } }, 'Три класи'),
        h('button', { onclick: () => { if (replaceTree({ version: 1, name: 'Нове дерево', points: 10, mode: 'path', nodes: [{ id: 'start', x: 0, y: 0, name: 'Початок', desc: '', kind: 'start', max: 1, cost: 0, need: 0, stats: {} }], links: [], stats: {} })) { mode = 'edit'; applyMode(); } } }, 'Порожнє')),
    ));
    box.append(h('p', { class: 'hint' }, 'Генератор будує дерево зі стартом у центрі: гілки-теми, значні й ключові вузли, перехресні зв’язки. Той самий seed дає те саме дерево.'));
    box.append(h('div', { class: 'btns' }, h('button', { onclick: () => { T.autoLayout(tree); edited = true; fit(); dirty(); refreshAll(); persist(); toast('Вузли розкладено'); } }, 'Розкласти вузли автоматично')));
  }

  function refreshLight() { $('pts').replaceChildren(document.createTextNode('Очок: '), h('b', null, `${analysis().left}`), document.createTextNode(` з ${tree.points}`)); renderSummary(); schedule(); }
  function refreshAll() { refreshLight(); renderInspector(); renderTreeSet(); }

  /* ---------- режими, HUD ---------- */
  function applyMode() {
    document.body.classList.toggle('edit', mode === 'edit');
    document.querySelectorAll('#modeSeg button').forEach(b => { const on = b.dataset.mode === mode; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    $('help').textContent = mode === 'play'
      ? 'Клік вкладає очко · правий клік або Shift+клік повертає · колесо масштабує · тягни полотно.'
      : 'Тягни вузол · подвійний клік по порожньому місцю додає вузол (з’єднується з вибраним) · Shift+клік по іншому вузлу з’єднує · Delete видаляє.';
    refreshAll(); persist();
  }
  document.querySelectorAll('#modeSeg button').forEach(b => b.addEventListener('click', () => { mode = b.dataset.mode; applyMode(); }));
  $('btnResetBuild').addEventListener('click', () => { build = T.emptyState(); dirty(); refreshAll(); persist(); });
  $('btnLayout').addEventListener('click', () => { T.autoLayout(tree); edited = true; fit(); dirty(); refreshAll(); persist(); toast('Вузли розкладено'); });
  $('zoomIn').addEventListener('click', () => zoomAt(W / 2, H / 2, 1.3));
  $('zoomOut').addEventListener('click', () => zoomAt(W / 2, H / 2, 1 / 1.3));
  $('zoomFit').addEventListener('click', () => { fit(); schedule(); persist(); });

  /* ---------- імпорт / експорт ---------- */
  async function copyText(text, okMsg) {
    try { await navigator.clipboard.writeText(text); toast(okMsg); return; } catch {}
    const ta = h('textarea', { style: 'position:fixed;left:-9999px' }); ta.value = text; document.body.append(ta); ta.select();
    try { document.execCommand('copy'); toast(okMsg); } catch { toast('Не вдалося скопіювати'); }
    ta.remove();
  }
  const exportText = () => JSON.stringify({ format: 'zbyrai.skill-tree', version: 1, tree, build: { ranks: build.ranks } }, null, 2);
  $('btnCopy').addEventListener('click', () => copyText(exportText(), 'JSON скопійовано'));
  $('btnSave').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([exportText()], { type: 'application/json' }));
    const a = h('a', { href: url, download: 'skill-tree.json' }); document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000); toast('skill-tree.json збережено');
  });
  const dlg = $('dlgImport');
  $('btnImport').addEventListener('click', () => { $('importErr').textContent = ''; $('importText').value = ''; dlg.showModal(); });
  $('importFile').addEventListener('click', () => $('importFileInput').click());
  $('importFileInput').addEventListener('change', e => {
    const f = e.target.files[0]; if (!f) return;
    const rd = new FileReader(); rd.onload = () => { $('importText').value = String(rd.result); }; rd.readAsText(f); e.target.value = '';
  });
  $('importGo').addEventListener('click', () => {
    try {
      const raw = JSON.parse($('importText').value), next = T.sanitize(raw);
      const b = raw && raw.build && raw.build.ranks ? { ranks: raw.build.ranks } : T.emptyState();
      dlg.close();
      if (replaceTree(next, T.validState(next, b) ? b : T.emptyState())) toast('Дерево імпортовано');
    } catch (e) { $('importErr').textContent = e instanceof SyntaxError ? 'Це не схоже на JSON.' : e.message; }
  });

  applyMode();
  resize();
})();
