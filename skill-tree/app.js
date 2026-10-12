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
  /* скасування/повтор: знімки {tree, ranks} */
  const undoStack = [], redoStack = [];
  const snapshot = () => JSON.stringify({ tree, ranks: build.ranks });
  function pushUndo() {
    const snap = snapshot(); undoStack.push(snap);
    const cap = clamp(Math.floor(3e6 / snap.length), 4, 100); // у великих деревах пам’ять важливіша за глибину історії
    while (undoStack.length > cap) undoStack.shift();
    redoStack.length = 0; syncUndo();
  }
  function restore(str) {
    const o = JSON.parse(str); tree = o.tree; build = { ranks: o.ranks }; multi.clear();
    if (sel && !tree.nodes.some(n => n.id === sel)) sel = null;
    dirty(); refreshAll(); persist();
  }
  function undo() { if (!undoStack.length) return; redoStack.push(snapshot()); while (redoStack.length > 20) redoStack.shift(); restore(undoStack.pop()); syncUndo(); }
  function redo() { if (!redoStack.length) return; undoStack.push(snapshot()); restore(redoStack.pop()); syncUndo(); }
  function syncUndo() { $('btnUndo').disabled = !undoStack.length; $('btnRedo').disabled = !redoStack.length; }
  const multi = new Set(); // додаткові вибрані вузли (редагування)
  const analysis = () => A || (A = T.analyze(tree, build));
  const byId = id => analysis().idx.byId.get(id);
  function persist() { clearTimeout(saveTimer); saveTimer = setTimeout(() => store.set('state', { tree, build, mode, view }), 250); }

  /* ---------- полотно ---------- */
  const cv = $('cv'), ctx = cv.getContext('2d'), stage = $('stage');
  let W = 1, H = 1, dpr = 1, raf = 0;
  const schedule = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; if (!looping) draw(); }); };
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
    const pad = 70, k = clamp(Math.min(W / (x1 - x0 + pad * 2), H / (y1 - y0 + pad * 2)), 0.02, 1.4);
    view = { k, x: W / 2 - ((x0 + x1) / 2) * k, y: H / 2 - ((y0 + y1) / 2) * k };
  }
  function zoomAt(sx, sy, f) {
    const k = clamp(view.k * f, 0.02, 4), r = k / view.k;
    view.x = sx - (sx - view.x) * r; view.y = sy - (sy - view.y) * r; view.k = k;
    schedule(); persist();
  }
  new ResizeObserver(resize).observe(stage);

  /* ---------- кольори ---------- */
  const hex = (c, a) => { const n = parseInt(c.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
  const ROLE_COL = { passive: '#6fc08f', active: '#f08a5d', transit: '#8798b5', start: '#e8c36a' };
  const ROLE_HI = { passive: '#b4ecc9', active: '#ffc7a8', transit: '#c9d4ea', start: '#fff0c4' };
  const PAL = {};
  for (const r of Object.keys(ROLE_COL)) PAL[r] = { base: ROLE_COL[r], hi: ROLE_HI[r], part: hex(ROLE_COL[r], .5), open: hex(ROLE_COL[r], .14), edge: hex(ROLE_COL[r], .55), halo: hex(ROLE_COL[r], .22), glow: hex(ROLE_COL[r], .7) };
  const COL = { goldHi: '#e8d29e', text: '#ece8df', locked: '#0f1015', linkOff: '#303a50', linkHalf: 'rgba(140,170,215,.5)', linkOn: '#d6bc7a' };
  const roleOf = n => (n.kind === 'start' ? 'start' : n.role || T.defaultRole(n));
  const isOn = s => s === 'start' || s === 'full' || s === 'part';

  function shapePath(c, kind, x, y, r) {
    c.beginPath();
    if (kind === 'notable') { c.moveTo(x, y - r); c.lineTo(x + r, y); c.lineTo(x, y + r); c.lineTo(x - r, y); c.closePath(); }
    else if (kind === 'keystone') { for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + i * Math.PI / 3; c[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * r, y + Math.sin(a) * r); } c.closePath(); }
    else c.arc(x, y, r, 0, Math.PI * 2);
  }

  /* Кеш геометрії для малювання: індекси вузлів, їхні статуси та зв’язки парами індексів. Скидається разом із аналізом. */
  function geom() {
    const a = analysis();
    if (a.geo) return a.geo;
    const ns = tree.nodes, num = new Map(ns.map((n, i) => [n.id, i]));
    const st = ns.map(n => a.status.get(n.id)), role = ns.map(roleOf);
    const lk = [];
    for (const [p, q] of tree.links) { const i = num.get(p), j = num.get(q); if (i != null && j != null && i !== j) lk.push(i, j); }
    return (a.geo = { num, st, role, lk: Int32Array.from(lk), ox: new Float32Array(ns.length), oy: new Float32Array(ns.length), os: new Float32Array(ns.length) });
  }

  /* ---------- анімація: хвилі від кліку й легкий рух під курсором ---------- */
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let animOn = store.get('anim', !reduceMotion);
  const ripples = [], hoverAnim = new Map();
  let looping = false, nowT = 0, lastBump = 0;
  function addRipple(x, y, R, A, speed) {
    if (!animOn) return;
    ripples.push({ x, y, R, A, speed, t0: performance.now() });
    if (ripples.length > 8) ripples.shift();
    kick();
  }
  function kick() { if (!looping) { looping = true; requestAnimationFrame(frame); } }
  function frame(ts) {
    nowT = performance.now();
    for (let i = ripples.length - 1; i >= 0; i--) { const r = ripples[i]; if ((nowT - r.t0) / 1000 > r.R / r.speed + .45) ripples.splice(i, 1); }
    for (const [id, v] of hoverAnim) {
      const nv = v + ((id === hover && animOn ? 1 : 0) - v) * .2;
      if (id !== hover && nv < .02) hoverAnim.delete(id); else hoverAnim.set(id, nv);
    }
    if (hover && animOn && !hoverAnim.has(hover)) hoverAnim.set(hover, 0);
    draw();
    const settling = [...hoverAnim].some(([id, v]) => id !== hover || v < .98);
    if (ripples.length || settling) requestAnimationFrame(frame); else looping = false;
  }
  // зсув і «пульс» кожного вузла від усіх активних хвиль: м’який гаусів фронт, що йде від центру й згасає з відстанню та часом
  function computeOffsets(g) {
    const { ox, oy, os } = g, ns = tree.nodes;
    ox.fill(0); oy.fill(0); os.fill(0);
    for (const r of ripples) {
      const e = (nowT - r.t0) / 1000, front = r.speed * e, life = Math.max(0, 1 - e / (r.R / r.speed + .4));
      if (life <= 0) continue;
      for (let i = 0; i < ns.length; i++) {
        const dx = ns[i].x - r.x, dy = ns[i].y - r.y, d = Math.hypot(dx, dy);
        if (d > r.R) continue;
        const ph = (d - front) / (r.R * .16 + 20), w = Math.exp(-ph * ph);
        if (w < .01) continue;
        const f = w * life * (1 - d / r.R);
        os[i] += f * .45;
        if (d > .5) { ox[i] += dx / d * r.A * f; oy[i] += dy / d * r.A * f; }
      }
    }
  }

  function draw() {
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
    if (!view) return;
    const k = view.k, a = analysis(), g = geom(), ns = tree.nodes;
    const moving = ripples.length > 0 && animOn;
    if (moving) computeOffsets(g);
    ctx.setTransform(dpr * k, 0, 0, dpr * k, dpr * view.x, dpr * view.y);
    const vx0 = -view.x / k - 60, vy0 = -view.y / k - 60, vx1 = (W - view.x) / k + 60, vy1 = (H - view.y) / k + 60;
    const px = i => ns[i].x + (moving ? g.ox[i] : 0), py = i => ns[i].y + (moving ? g.oy[i] : 0);
    const vis = i => { const x = ns[i].x, y = ns[i].y; return x >= vx0 && x <= vx1 && y >= vy0 && y <= vy1; };
    const labelAll = ns.length <= 40; // у малих деревах підписуємо всі вузли
    const prereq = tree.mode === 'prereq';

    // зв’язки: три пачки (обидва кінці вкладені / один / жоден), кожна одним штрихом
    const buckets = [new Path2D(), new Path2D(), new Path2D()], arrows = [new Path2D(), new Path2D(), new Path2D()];
    const showArrows = prereq && k >= .4;
    for (let e = 0; e < g.lk.length; e += 2) {
      const i = g.lk[e], j = g.lk[e + 1];
      if (!vis(i) && !vis(j)) continue;
      const b = (isOn(g.st[i]) ? 1 : 0) + (isOn(g.st[j]) ? 1 : 0), B = b === 2 ? 0 : b === 1 ? 1 : 2;
      const x1 = px(i), y1 = py(i), x2 = px(j), y2 = py(j);
      buckets[B].moveTo(x1, y1); buckets[B].lineTo(x2, y2);
      if (showArrows) {
        const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len, rq = T.KINDS[ns[j].kind].r + 5, bx = x2 - ux * rq, by = y2 - uy * rq;
        const P = arrows[B]; P.moveTo(bx, by); P.lineTo(bx - ux * 8 - uy * 4.5, by - uy * 8 + ux * 4.5); P.lineTo(bx - ux * 8 + uy * 4.5, by - uy * 8 - ux * 4.5); P.closePath();
      }
    }
    ctx.lineCap = 'round';
    const lcol = [COL.linkOn, COL.linkHalf, COL.linkOff], lw = [2.6, 2, 1.6];
    for (let B = 2; B >= 0; B--) { ctx.strokeStyle = lcol[B]; ctx.fillStyle = lcol[B]; ctx.lineWidth = lw[B]; ctx.stroke(buckets[B]); if (showArrows) ctx.fill(arrows[B]); }

    // хвилі: ледь помітні кільця
    if (moving) for (const r of ripples) {
      const e = (nowT - r.t0) / 1000, life = Math.max(0, 1 - e / (r.R / r.speed + .4));
      ctx.strokeStyle = `rgba(160,190,235,${.22 * life})`; ctx.lineWidth = 2 / k; ctx.beginPath(); ctx.arc(r.x, r.y, Math.min(r.R, r.speed * e), 0, Math.PI * 2); ctx.stroke();
    }

    // вузли
    let visible = 0;
    for (let i = 0; i < ns.length; i++) if (vis(i)) visible++;
    const glow = visible <= 500 && k > .35;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (let i = 0; i < ns.length; i++) {
      if (!vis(i)) continue;
      const n = ns[i], st = g.st[i], pal = PAL[g.role[i]] || PAL.passive, hv = hoverAnim.get(n.id) || 0;
      const r = T.KINDS[n.kind].r * (1 + .25 * hv + (moving ? g.os[i] : 0)), x = px(i), y = py(i), rank = build.ranks[n.id] | 0;
      if (r * k < 2.4) { // дрібно: просто крапка, щоб тисячі вузлів малювалися швидко
        ctx.fillStyle = st === 'locked' ? pal.edge : isOn(st) ? pal.base : pal.part;
        const sz = Math.max(2.4 / k, r * 1.4); ctx.fillRect(x - sz / 2, y - sz / 2, sz, sz); continue;
      }
      const lit = st === 'full' || st === 'start';
      ctx.lineWidth = 2;
      ctx.fillStyle = lit ? pal.base : st === 'part' ? pal.part : st === 'open' ? pal.open : COL.locked;
      ctx.strokeStyle = lit ? pal.hi : st === 'part' || st === 'open' ? pal.base : pal.edge;
      if (st === 'open') { ctx.strokeStyle = pal.halo; ctx.lineWidth = 6; shapePath(ctx, n.kind, x, y, r + 1); ctx.stroke(); ctx.strokeStyle = pal.base; ctx.lineWidth = 2; }
      if (lit && glow) { ctx.shadowColor = pal.glow; ctx.shadowBlur = 14; }
      shapePath(ctx, n.kind, x, y, r); ctx.fill(); ctx.shadowBlur = 0; ctx.stroke();
      if (st === 'start') { ctx.fillStyle = '#17120a'; ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2); ctx.fill(); }
      if (n.max > 1 && k >= .6) {
        ctx.font = '600 10px Inter, system-ui, sans-serif'; ctx.fillStyle = lit ? '#17120a' : COL.text;
        if (r >= 11) ctx.fillText(rank + '/' + n.max, x, y + .5);
        else { ctx.fillStyle = rank ? pal.hi : '#8a867d'; ctx.fillText(rank + '/' + n.max, x, y + r + 9); }
      }
      if (multi.has(n.id)) { ctx.strokeStyle = COL.goldHi; ctx.setLineDash([2, 3]); shapePath(ctx, n.kind, x, y, r + 6); ctx.stroke(); ctx.setLineDash([]); }
      if (n.id === sel) { ctx.strokeStyle = '#fff'; ctx.setLineDash([4, 3]); shapePath(ctx, n.kind, x, y, r + 6); ctx.stroke(); ctx.setLineDash([]); }
      else if (n.id === hover) { ctx.strokeStyle = 'rgba(169,200,242,.8)'; shapePath(ctx, n.kind, x, y, r + 4); ctx.stroke(); }
      if ((k >= 1.25 && (n.kind === 'notable' || n.kind === 'keystone')) || k >= 2.2 || n.id === sel || (labelAll && k >= .7)) {
        ctx.font = (n.kind === 'small' ? '500 10.5px' : '600 12px') + ' Inter, system-ui, sans-serif';
        ctx.fillStyle = isOn(st) ? pal.hi : '#b5b0a5'; ctx.fillText(n.name, x, y - r - 9);
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
  let drag = null, pinch = null;
  const ptrs = new Map();
  const pinchState = () => { const [a, b] = [...ptrs.values()]; return { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2 }; };
  cv.addEventListener('pointerdown', e => {
    if (e.button === 2) return;
    cv.setPointerCapture(e.pointerId); cv.focus({ preventScroll: true });
    const p = pos(e); ptrs.set(e.pointerId, p);
    if (ptrs.size === 2) { drag = null; const ps = pinchState(); pinch = { d: ps.d, k: view.k, cx: ps.cx, cy: ps.cy, vx: view.x, vy: view.y }; hideTip(); return; }
    const n = nodeAt(p);
    drag = { sx: p.x, sy: p.y, vx: view.x, vy: view.y, moved: false, n, mod: e.shiftKey || e.ctrlKey || e.metaKey, alt: e.altKey, type: n && mode === 'edit' ? 'node' : 'pan', nx: n ? n.x : 0, ny: n ? n.y : 0, group: null };
  });
  cv.addEventListener('pointermove', e => {
    const p = pos(e);
    if (ptrs.has(e.pointerId)) ptrs.set(e.pointerId, p);
    if (pinch && ptrs.size >= 2) {
      const ps = pinchState(), k = clamp(pinch.k * ps.d / pinch.d, 0.02, 4), r = k / pinch.k;
      view.k = k; view.x = ps.cx - (pinch.cx - pinch.vx) * r; view.y = ps.cy - (pinch.cy - pinch.vy) * r; schedule(); return;
    }
    if (drag) {
      const dx = p.x - drag.sx, dy = p.y - drag.sy;
      if (!drag.moved && Math.hypot(dx, dy) > 4) {
        drag.moved = true; if (drag.type === 'pan') cv.classList.add('grabbing'); hideTip();
        if (drag.type === 'node') {
          pushUndo();
          const ids = multi.has(drag.n.id) || (sel === drag.n.id && multi.size) ? new Set([...multi, sel, drag.n.id]) : new Set([drag.n.id]);
          drag.group = tree.nodes.filter(m => ids.has(m.id)).map(m => ({ m, x: m.x, y: m.y }));
        }
      }
      if (drag.moved) {
        if (drag.type === 'pan') { view.x = drag.vx + dx; view.y = drag.vy + dy; }
        else { const sx = Math.round(dx / view.k / 5) * 5, sy = Math.round(dy / view.k / 5) * 5; for (const g of drag.group) { g.m.x = g.x + sx; g.m.y = g.y + sy; } edited = true; }
        schedule();
      }
      return;
    }
    const n = nodeAt(p), id = n ? n.id : null;
    if (id !== hover) {
      hover = id; cv.classList.toggle('pointer', !!id);
      if (id && animOn) { // легкий «поштовх» навколо вузла: сусіди ледь розступаються
        if (!hoverAnim.has(id)) hoverAnim.set(id, 0);
        const t = performance.now(); if (t - lastBump > 220) { lastBump = t; addRipple(n.x, n.y, 120, 3.2, 260); }
      }
      if (hoverAnim.size || id) kick(); else schedule();
    }
    if (n) showTip(n, p); else hideTip();
  });
  const endPtr = e => { ptrs.delete(e.pointerId); if (ptrs.size < 2) { if (pinch) persist(); pinch = null; drag = null; cv.classList.remove('grabbing'); } };
  cv.addEventListener('pointercancel', endPtr);
  cv.addEventListener('pointerup', e => {
    const wasPinch = !!pinch; ptrs.delete(e.pointerId);
    if (wasPinch) { endPtr(e); return; }
    if (!drag) return;
    const d = drag; drag = null; cv.classList.remove('grabbing');
    if (d.moved) { if (d.type === 'node') { refreshLight(); renderInspector(); } persist(); return; }
    clickNode(d.n, d.mod, d.alt);
  });
  cv.addEventListener('pointerleave', () => { if (!drag) { hover = null; hideTip(); if (hoverAnim.size) kick(); else schedule(); } });
  cv.addEventListener('contextmenu', e => { e.preventDefault(); const n = nodeAt(pos(e)); if (n && mode === 'play') { sel = n.id; tryRefund(n); } });
  cv.addEventListener('wheel', e => { e.preventDefault(); const p = pos(e); zoomAt(p.x, p.y, Math.exp(-e.deltaY * 0.0016)); }, { passive: false });
  cv.addEventListener('dblclick', e => {
    if (mode !== 'edit') return;
    const p = pos(e); if (nodeAt(p)) return;
    const w = toWorld(p); addNode(Math.round(w.x / 5) * 5, Math.round(w.y / 5) * 5);
  });
  document.addEventListener('keydown', e => {
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) || $('dlgImport').open) return;
    if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === 'z') { e.preventDefault(); if (e.shiftKey) redo(); else undo(); }
    else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); }
    else if (e.key === 'Escape') { sel = null; multi.clear(); refreshAll(); }
    else if ((e.key === 'Delete' || e.key === 'Backspace') && mode === 'edit' && sel) { e.preventDefault(); deleteNode(sel); }
  });

  const tip = $('tip');
  function showTip(n, p) {
    const a = analysis(), st = a.status.get(n.id), rank = build.ranks[n.id] | 0;
    tip.textContent = '';
    tip.append(h('b', null, n.name));
    tip.append(h('span', { class: 'badge ' + (n.kind === 'start' ? '' : roleOf(n)) }, n.kind === 'start' ? 'Початок' : `${(T.ROLES[roleOf(n)] || {}).name} · ${T.KINDS[n.kind].name.toLowerCase()}`));
    if (n.desc) tip.append(document.createTextNode(n.desc));
    if (n.kind !== 'start') tip.append(h('small', null, `Ранг ${rank}/${n.max} · ціна ${n.cost}${n.need ? ' · потрібно ' + n.need + ' очок в інших' : ''}`));
    if (mode === 'play' && st === 'locked') tip.append(h('small', null, T.canAllocate(tree, build, n.id, a.idx).reason));
    tip.hidden = false;
    const w = tip.offsetWidth, hh = tip.offsetHeight;
    tip.style.left = clamp(p.x + 16, 8, W - w - 8) + 'px'; tip.style.top = clamp(p.y + 16, 8, H - hh - 8) + 'px';
  }
  const hideTip = () => { tip.hidden = true; };

  /* ---------- дії ---------- */
  function clickNode(n, mod, alt) {
    if (!n) { if (sel || multi.size) { sel = null; multi.clear(); refreshAll(); } return; }
    if (mode === 'edit' && alt) { if (sel && sel !== n.id) multi.add(sel); if (multi.has(n.id)) multi.delete(n.id); else multi.add(n.id); sel = n.id; refreshAll(); return; }
    if (mode === 'edit') multi.clear();
    if (mode === 'play') { sel = n.id; if (mod) tryRefund(n); else tryAllocate(n); return; }
    if (sel && sel !== n.id && mod) { toggleLink(sel, n.id); return; }
    addRipple(n.x, n.y, 240, 4.5, 420);
    sel = n.id; refreshAll();
  }
  function tryAllocate(n) {
    const r = T.canAllocate(tree, build, n.id, analysis().idx);
    if (!r.ok) { addRipple(n.x, n.y, 150, 2.6, 300); toast(r.reason); refreshAll(); return; }
    addRipple(n.x, n.y, 420, 8, 560);
    pushUndo(); build = T.allocate(tree, build, n.id, analysis().idx); dirty(); refreshAll(); persist();
  }
  function tryRefund(n) {
    const idx = analysis().idx;
    if (!T.canRefund(tree, build, n.id, idx)) { toast((build.ranks[n.id] | 0) ? 'Не можна забрати: від цього вузла залежать інші.' : 'Тут нічого забирати.'); refreshAll(); return; }
    addRipple(n.x, n.y, 260, 4.5, 420);
    pushUndo(); build = T.refund(tree, build, n.id, idx); dirty(); refreshAll(); persist();
  }
  function repairBuild() {
    const ids = new Set(tree.nodes.map(n => n.id));
    for (const id of Object.keys(build.ranks)) if (!ids.has(id)) delete build.ranks[id];
    if (!T.validState(tree, build)) { build = T.emptyState(); toast('Розподіл очок скинуто: він більше не відповідає дереву.'); }
    dirty();
  }
  function uniqueId() { const ids = new Set(tree.nodes.map(n => n.id)); let i = tree.nodes.length + 1; while (ids.has('n' + i)) i++; return 'n' + i; }
  function addNode(x, y) {
    pushUndo();
    const first = !tree.nodes.length && tree.mode === 'path';
    const n = { id: uniqueId(), x, y, name: first ? 'Початок' : 'Новий вузол', desc: '', kind: first ? 'start' : 'small', role: first ? 'start' : 'passive', max: 1, cost: first ? 0 : 1, need: 0, stats: {} };
    tree.nodes.push(n);
    if (sel && tree.nodes.some(m => m.id === sel)) tree.links.push([sel, n.id]);
    sel = n.id; edited = true; dirty(); refreshAll(); persist();
  }
  function deleteNode(id) {
    pushUndo();
    const gone = new Set([id, ...multi]); multi.clear();
    tree.nodes = tree.nodes.filter(n => !gone.has(n.id));
    tree.links = tree.links.filter(([a, b]) => !gone.has(a) && !gone.has(b));
    for (const g of gone) delete build.ranks[g];
    sel = null; hover = null; hideTip(); edited = true; repairBuild(); refreshAll(); persist();
  }
  function toggleLink(a, b) {
    pushUndo();
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
    pushUndo(); tree = next; build = nextBuild || T.emptyState(); multi.clear(); sel = null; hover = null; edited = false; view = null; dirty(); fit(); refreshAll(); persist();
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
      const on = (fn, rerender) => e => { pushUndo(); fn(e.target); edited = true; dirty(); refreshLight(); if (rerender) renderInspector(); persist(); };
      const L = (text, tip, ...kids) => h('label', { title: tip }, text, ...kids);
      const roleSel = n.kind === 'start' ? null : L('Роль (колір)', 'Що вузол дає: пасивний бонус, активна здібність чи лише прохід між гілками. Від ролі залежить колір на полотні.',
        h('select', { onchange: on(el => { n.role = el.value; if (n.role === 'transit' && !Object.keys(n.stats).length) n.cost = 0; }, true) }, Object.entries(T.ROLES).map(([k, v]) => h('option', { value: k, selected: k === roleOf(n), title: v.hint }, v.name))));
      box.append(h('div', { class: 'form' },
        L('Назва', 'Як вузол називається в підказці та на полотні', h('input', { type: 'text', value: n.name, onchange: on(el => { n.name = el.value.trim() || n.name; }) })),
        L('Тип (форма)', 'Наскільки вузол важливий: малий (коло), значний (ромб), ключовий (шестикутник) чи початок', h('select', { onchange: on(el => { n.kind = el.value; if (n.kind === 'start') { n.cost = 0; n.role = 'start'; } else if (n.role === 'start') n.role = T.defaultRole(n); }, true) }, Object.entries(T.KINDS).map(([k, v]) => h('option', { value: k, selected: k === n.kind }, v.name)))),
        roleSel,
        h('div', { class: 'two' },
          L('Рангів', 'Скільки разів можна вкласти очко в цей вузол', h('input', { type: 'number', min: 1, max: 99, value: n.max, onchange: on(el => { n.max = Math.round(clamp(+el.value || 1, 1, 99)); }) })),
          L('Ціна', 'Скільки очок коштує один ранг (0 = безкоштовно)', h('input', { type: 'number', min: 0, max: 999, value: n.cost, onchange: on(el => { n.cost = Math.round(clamp(+el.value || 0, 0, 999)); }) })),
          L('Потрібно очок', 'Скільки очок має бути вкладено в ІНШІ вузли, щоб цей відкрився', h('input', { type: 'number', min: 0, value: n.need, onchange: on(el => { n.need = Math.round(clamp(+el.value || 0, 0, 99999)); }) }))),
        L('Стати за ранг (ключ:значення)', 'Бонуси, які вузол дає за кожен ранг, наприклад dmg:5, hp:20', h('input', { type: 'text', value: statsToText(n.stats), onchange: on(el => { n.stats = parseStats(el.value); el.value = statsToText(n.stats); }, false) })),
        L('Опис', 'Текст, який бачить гравець у підказці', h('textarea', { onchange: on(el => { n.desc = el.value.slice(0, 300); }) }, n.desc)),
      ));
      box.append(h('div', { class: 'btns' }, h('button', { class: 'danger', title: 'Видалити вибраний вузол разом з його зв’язками (Delete)', onclick: () => deleteNode(n.id) }, 'Видалити вузол')));
      box.append(h('p', { class: 'hint' }, tree.mode === 'prereq' ? 'Shift+клік по іншому вузлу: перший стає вимогою для другого (стрілка). Повторний Shift+клік прибирає зв’язок.' : 'Shift+клік по іншому вузлу з’єднує або роз’єднує їх.'));
      return;
    }
    box.append(h('p', { class: 'nname' }, n.name), h('span', { class: 'badge ' + n.kind, title: 'Тип вузла: його важливість' }, T.KINDS[n.kind].name), ...(n.kind === 'start' ? [] : [' ', h('span', { class: 'badge ' + roleOf(n), title: (T.ROLES[roleOf(n)] || {}).hint }, (T.ROLES[roleOf(n)] || {}).name)]));
    if (n.desc) box.append(h('p', { class: 'ndesc' }, n.desc));
    for (const [s, v] of Object.entries(n.stats || {})) box.append(h('div', { class: 'kv pos' }, 'за ранг', h('b', null, fmtStat(tree.stats[s] || { name: s }, v))));
    if (n.kind !== 'start') {
      box.append(h('div', { class: 'kv' }, 'Ранг', h('b', null, `${rank} / ${n.max}`)), h('div', { class: 'kv' }, 'Ціна', h('b', null, n.cost)));
      if (n.need) box.append(h('div', { class: 'kv' }, 'Потрібно в інших', h('b', null, n.need)));
      const can = T.canAllocate(tree, build, n.id, a.idx);
      if (!can.ok && st !== 'full') box.append(h('p', { class: 'reason' }, can.reason));
      box.append(h('div', { class: 'btns' },
        h('button', { class: 'btn-primary', title: 'Вкласти одне очко в цей вузол', disabled: !can.ok, onclick: () => tryAllocate(n) }, 'Вкласти +'),
        h('button', { title: 'Забрати одне очко (не можна, якщо від вузла залежать інші)', disabled: !T.canRefund(tree, build, n.id, a.idx), onclick: () => tryRefund(n) }, 'Забрати −')));
    }
  }

  function renderTreeSet() {
    const box = $('treeset'); box.textContent = '';
    const on = fn => e => { pushUndo(); fn(e.target); edited = true; repairBuild(); refreshLight(); renderTreeSet(); persist(); };
    box.append(h('div', { class: 'form' },
      h('label', { title: 'Назва дерева; потрапляє у файл експорту' }, 'Назва дерева', h('input', { type: 'text', value: tree.name, onchange: on(el => { tree.name = el.value.trim() || tree.name; }) })),
      h('div', { class: 'two', style: 'grid-template-columns:1fr 1fr' },
        h('label', { title: 'Скільки очок гравець може вкласти в усе дерево' }, 'Очок', h('input', { type: 'number', min: 0, value: tree.points, onchange: on(el => { tree.points = Math.round(clamp(+el.value || 0, 0, 99999)); }) })),
        h('label', { title: 'Шлях: вузол відкривається, коли вкладено в будь-якого сусіда (як у Path of Exile). Вимоги: потрібно вкласти в усі вузли, з яких ведуть стрілки (як у класичних талантах).' }, 'Відкриття вузла', h('select', { onchange: on(el => { tree.mode = el.value; }) },
          h('option', { value: 'path', selected: tree.mode === 'path', title: 'Достатньо вкласти в будь-якого сусіда' }, 'Шлях (сусід)'), h('option', { value: 'prereq', selected: tree.mode === 'prereq', title: 'Потрібно вкласти в усі вузли, з яких веде стрілка' }, 'Вимоги (стрілки)'))))));
    const problems = T.validate(tree);
    box.append(problems.length ? h('div', { class: 'warns' }, problems.slice(0, 4).map(p => h('div', { class: 'warn' }, p))) : h('div', { class: 'okmsg' }, 'Дерево без проблем: усі вузли досяжні, цикли відсутні.'));
    box.append(h('div', { class: 'btns' }, h('button', { title: 'Розставити вузли за схемою заново: від початку колами (режим «Шлях») або рядами зверху вниз (режим «Вимоги»). Зв’язки, очки й властивості вузлів не змінюються. Корисно після ручного додавання вузлів.', onclick: doLayout }, 'Розкласти вузли автоматично')));
    box.append(h('p', { class: 'hint' }, '«Розкласти автоматично» лише переставляє вузли на полотні: так вони не злипаються і дерево читається. Зв’язки й очки лишаються.'));
  }

  function renderGen() {
    const box = $('gen'); box.textContent = '';
    const g = { type: store.get('gtype', 'radial'), count: store.get('gcount', 60), seed: store.get('gseed', 'zbyrai'), branches: store.get('gbr', 0) };
    if (!T.TYPES[g.type]) g.type = 'radial';
    const save = (k, key, v) => { g[k] = v; store.set(key, v); };
    const countIn = h('input', { type: 'number', min: 2, max: T.MAX_NODES, step: 1, value: g.count, onchange: e => { const v = Math.round(clamp(+e.target.value || 60, 2, T.MAX_NODES)); e.target.value = v; save('count', 'gcount', v); sync(); } });
    const seedIn = h('input', { type: 'text', value: g.seed, onchange: e => save('seed', 'gseed', e.target.value) });
    const brIn = h('input', { type: 'number', min: 0, max: 12, value: g.branches, onchange: e => save('branches', 'gbr', Math.round(clamp(+e.target.value || 0, 0, 12))) });
    const hint = h('p', { class: 'hint' }), perf = h('p', { class: 'hint' });
    const brLabel = h('label', { title: 'Скільки променів-гілок розходиться від початку. 0 = підібрати автоматично під кількість вузлів. Лише для типу «Радіальне».' }, 'Гілок (0 = авто)', brIn);
    const chips = h('div', { class: 'chips' }, [20, 60, 200, 500, 2000, 5000, 20000].map(c => h('button', { title: `Поставити ${c.toLocaleString('uk-UA')} вузлів`, onclick: () => { countIn.value = c; save('count', 'gcount', c); sync(); } }, c.toLocaleString('uk-UA'))));
    const typeSel = h('select', { onchange: e => { save('type', 'gtype', e.target.value); sync(); } }, Object.entries(T.TYPES).map(([k, v]) => h('option', { value: k, selected: k === g.type, title: v.hint }, v.name)));
    function sync() {
      hint.textContent = T.TYPES[g.type].hint;
      typeSel.title = T.TYPES[g.type].hint;
      brLabel.style.display = g.type === 'radial' ? '' : 'none';
      [...chips.children].forEach(b => b.classList.toggle('on', b.textContent.replace(/\s/g, '') === String(g.count)));
      const blank = g.type === 'blank';
      countIn.disabled = blank; chips.style.opacity = blank ? .4 : 1;
      perf.textContent = blank ? '' : g.count > 3000 ? `${g.count.toLocaleString('uk-UA')} вузлів: генерація й малювання займуть кілька секунд; наближай полотно, щоб бачити окремі вузли.` : '';
    }
    box.append(h('div', { class: 'form' },
      h('label', { title: 'Яка структура дерева буде згенерована' }, 'Тип дерева', typeSel),
      hint,
      h('label', { title: `Скільки вузлів у дереві, разом із початком. Від 2 до ${T.MAX_NODES.toLocaleString('uk-UA')}. Для типу «Чистий аркуш» не діє.` }, 'Кількість вузлів', countIn),
      chips,
      perf,
      h('div', { class: 'two', style: 'grid-template-columns:1fr 1fr' },
        h('label', { title: 'Те саме слово дає те саме дерево. Змінюй, щоб отримати інше.' }, 'Seed', seedIn),
        brLabel),
      h('div', { class: 'btns' },
        h('button', { class: 'btn-primary', title: 'Згенерувати дерево з цими параметрами. Поточне дерево буде замінено.', onclick: () => generate(g) }, 'Згенерувати'),
        h('button', { title: 'Підставити випадковий seed і одразу згенерувати нове дерево', onclick: () => { const s2 = Math.random().toString(36).slice(2, 8); seedIn.value = s2; save('seed', 'gseed', s2); generate(g); } }, '🎲 Випадкове'))));
    sync();
  }
  function generate(g) {
    const t0 = performance.now();
    const t = T.buildTree(g.type, { count: g.count, seed: g.seed, branches: g.branches });
    if (!replaceTree(t)) return;
    if (g.type === 'blank') { mode = 'edit'; applyMode(); } 
    toast(`Створено: ${t.nodes.length.toLocaleString('uk-UA')} вузлів за ${Math.max(1, Math.round(performance.now() - t0))} мс`);
  }
  function doLayout() { pushUndo(); T.autoLayout(tree); edited = true; fit(); dirty(); refreshAll(); persist(); toast('Вузли розкладено'); }

  function refreshLight() { $('pts').replaceChildren(document.createTextNode('Очок: '), h('b', null, `${analysis().left}`), document.createTextNode(` з ${tree.points}`)); renderSummary(); schedule(); }
  function refreshAll() { refreshLight(); renderInspector(); renderTreeSet(); }
  renderGen();

  /* ---------- режими, HUD ---------- */
  function applyMode() {
    document.body.classList.toggle('edit', mode === 'edit');
    document.querySelectorAll('#modeSeg button').forEach(b => { const on = b.dataset.mode === mode; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    refreshAll(); persist();
  }
  document.querySelectorAll('#modeSeg button').forEach(b => b.addEventListener('click', () => { mode = b.dataset.mode; applyMode(); }));
  $('btnResetBuild').addEventListener('click', () => { pushUndo(); build = T.emptyState(); dirty(); refreshAll(); persist(); });
  $('btnLayout').addEventListener('click', doLayout);
  const syncAnim = () => $('btnAnim').classList.toggle('on', animOn);
  $('btnAnim').addEventListener('click', () => { animOn = !animOn; store.set('anim', animOn); syncAnim(); toast(animOn ? 'Анімацію увімкнено' : 'Анімацію вимкнено'); });
  syncAnim();
  $('btnUndo').addEventListener('click', undo); $('btnRedo').addEventListener('click', redo); syncUndo();
  $('btnPng').addEventListener('click', () => {
    const keep = view, keepR = ripples.splice(0); fit(); draw();
    const out = document.createElement('canvas'); out.width = cv.width; out.height = cv.height;
    const o = out.getContext('2d'); o.fillStyle = '#0b0b10'; o.fillRect(0, 0, out.width, out.height); o.drawImage(cv, 0, 0);
    view = keep; ripples.push(...keepR); schedule();
    out.toBlob(b => {
      if (!b) { toast('Не вдалося створити PNG'); return; }
      const url = URL.createObjectURL(b), a = h('a', { href: url, download: 'skill-tree.png' }); document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000); toast('skill-tree.png збережено');
    }, 'image/png');
  });
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

  const about = $('about');
  about.open = !store.get('about_seen', false);
  if (about.open) store.set('about_seen', true);
  applyMode();
  resize();
})();
