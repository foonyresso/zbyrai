// Sprite Sheet Cleaner: інтерфейс. Математика лежить у sprite-core.js (SpriteCore).
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const C = SpriteCore;
  const store = {
    get(k, d) { try { const v = localStorage.getItem('sc_' + k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem('sc_' + k, JSON.stringify(v)); } catch {} },
  };
  const DEFAULTS = { colors: [], fea: 0, mode: 'flood', slice: 'auto', gap: 2, min: 8, cols: 4, rows: 2, trim: false, pal: 0, name: 'sprite', pad: 1, pow2: false, boxes: false, bg: 'checker', brush: 24, wandTol: 12, contig: true };
  const NUM = { fea: [0, 30], gap: [0, 24], min: [1, 200], cols: [1, 64], rows: [1, 64], pal: [0, 64], pad: [0, 16], brush: [1, 200], wandTol: [0, 100] };
  const BGS = ['checker', 'white', 'black', 'magenta', 'gray'];
  const hexOk = h => typeof h === 'string' && /^#[0-9a-f]{6}$/i.test(h);
  // перевіряє будь-який об'єкт налаштувань (з localStorage або імпортованого JSON) і повертає лише коректні поля
  function sanitize(src) {
    const o = {};
    if (!src || typeof src !== 'object') return o;
    if (Array.isArray(src.colors)) o.colors = src.colors.filter(e => e && hexOk(e.c)).slice(0, 24).map(e => ({ c: e.c.toLowerCase(), tol: Math.min(100, Math.max(0, Math.round(+e.tol) || 0)) }));
    for (const k in NUM) if (k in src) o[k] = Math.min(NUM[k][1], Math.max(NUM[k][0], Math.round(+src[k]) || NUM[k][0]));
    if (src.mode === 'flood' || src.mode === 'global') o.mode = src.mode;
    if (['auto', 'grid', 'none'].includes(src.slice)) o.slice = src.slice;
    if (BGS.includes(src.bg)) o.bg = src.bg;
    for (const k of ['trim', 'pow2', 'boxes', 'contig']) if (typeof src[k] === 'boolean') o[k] = src[k];
    if (typeof src.name === 'string') o.name = src.name.replace(/[^\w\-а-яіїєґА-ЯІЇЄҐ]/g, '_').slice(0, 24) || 'sprite';
    return o;
  }
  const st = Object.assign({}, DEFAULTS, sanitize(store.get('settings', {})));
  const save = () => store.set('settings', st);

  let orig = null, origCv = null, base = null, work = null, workCv = null, rects = [], em = null, emDirty = false;
  let tool = 'pipette', compare = false, spaceDown = false, mouse = null;
  const view = { s: 1, tx: 0, ty: 0 };
  const toast = (m, ms = 1800) => { const t = $('toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), ms); };
  const hex = c => '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
  const unhex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const toCanvas = img => { const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; c.getContext('2d').putImageData(new ImageData(img.data, img.width, img.height), 0, 0); return c; };

  /* ---------- історія (скасувати / повторити) ---------- */
  // знімок = кольори + м'який край + режим + маска ручних правок (маска в знімках незмінна й може ділитися між ними)
  let hist = [], hi = -1, emRef = null;
  const snap = () => ({ colors: st.colors.map(e => ({ ...e })), fea: st.fea, mode: st.mode, em: emRef });
  function commit() {
    if (!orig) return;
    if (emDirty || !emRef) { emRef = em.slice(); emDirty = false; }
    hist = hist.slice(0, hi + 1); hist.push(snap());
    const cap = Math.max(5, Math.min(60, Math.floor(3e8 / (orig.width * orig.height))));
    while (hist.length > cap) hist.shift();
    hi = hist.length - 1; updUndo();
  }
  function restore(s) {
    st.colors = s.colors.map(e => ({ ...e })); st.fea = s.fea; st.mode = s.mode;
    emRef = s.em; em = s.em.slice(); emDirty = false;
    save(); sync(); renderColors(); schedule(true);
  }
  const undo = () => { if (hi > 0) { restore(hist[--hi]); updUndo(); } };
  const redo = () => { if (hi < hist.length - 1) { restore(hist[++hi]); updUndo(); } };
  function updUndo() { $('btnUndo').disabled = hi <= 0; $('btnRedo').disabled = hi >= hist.length - 1; $('btnResetEdits').disabled = !orig; }

  /* ---------- завантаження зображення ---------- */
  function setImage(source, label, demo) {
    const w = source.naturalWidth || source.width, h = source.naturalHeight || source.height;
    if (!w || !h) { toast('Не вдалося прочитати зображення'); return; }
    if (w * h > 24e6) { toast('Зображення завелике: до 24 мегапікселів'); return; }
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(source, 0, 0);
    orig = g.getImageData(0, 0, w, h); origCv = toCanvas(orig);
    em = new Uint8Array(w * h); emRef = null; emDirty = false; hist = []; hi = -1;
    st.colors = demo ? [{ c: '#00ff00', tol: 12 }] : [{ c: hex(C.detectBg(orig)), tol: 12 }];
    $('info').textContent = `${label}: ${w}×${h} px`;
    save(); sync(); renderColors(); commit(); schedule(true); fit();
  }
  function loadFile(f) {
    if (!f || !/^image\//.test(f.type)) { toast('Це не зображення'); return; }
    const url = URL.createObjectURL(f), im = new Image();
    im.onload = () => { setImage(im, f.name || 'зображення'); URL.revokeObjectURL(url); };
    im.onerror = () => { URL.revokeObjectURL(url); toast('Не вдалося відкрити файл'); };
    im.src = url;
  }
  $('btnPick').onclick = () => $('file').click();
  $('file').onchange = e => { loadFile(e.target.files[0]); e.target.value = ''; };
  $('btnPaste').onclick = async () => {
    try {
      for (const it of await navigator.clipboard.read()) { const t = it.types.find(x => x.startsWith('image/')); if (t) { loadFile(new File([await it.getType(t)], 'з буфера', { type: t })); return; } }
      toast('У буфері немає зображення');
    } catch { toast('Натисніть Ctrl+V на сторінці'); }
  };
  addEventListener('paste', e => {
    const f = [...(e.clipboardData?.files || [])].find(x => /^image\//.test(x.type)); if (f) return loadFile(f);
    if (/^(input|textarea)$/i.test(e.target.tagName)) return;
    const t = e.clipboardData?.getData('text') || ''; if (t.trim().startsWith('{')) { e.preventDefault(); importJson(t); }
  });
  const vp = $('vp');
  ['dragenter', 'dragover'].forEach(n => addEventListener(n, e => { e.preventDefault(); vp.classList.add('drag'); }));
  ['dragleave', 'drop'].forEach(n => addEventListener(n, e => { e.preventDefault(); if (n === 'drop' || e.target === document.documentElement) vp.classList.remove('drag'); if (n === 'drop') loadFile(e.dataTransfer.files[0]); }));

  // демо: спрайт-лист із шумним зеленим фоном (як JPEG), щоб показати допуск
  function makeDemo() {
    const W = 288, H = 160, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
    g.fillStyle = '#00ff00'; g.fillRect(0, 0, W, H);
    const cols = [['#d9534f', '#ffd166'], ['#4f8fd9', '#bfe3ff'], ['#7bc96f', '#2d5a2a'], ['#b784e0', '#f1d4ff'], ['#e8924a', '#fff0c0'], ['#e079a8', '#ffe0ee'], ['#6fc3c0', '#0d3b3a'], ['#c9a766', '#3a2c12']];
    cols.forEach(([a, b], i) => {
      const cx = 36 + (i % 4) * 72, cy = 40 + Math.floor(i / 4) * 80, s = 10 + (i % 3) * 2;
      g.fillStyle = a; g.fillRect(cx - s, cy - s + 4, s * 2, s * 2 - 4); g.fillRect(cx - s - 4, cy - 2, 4, 10); g.fillRect(cx + s, cy - 2, 4, 10);
      g.fillStyle = b; g.fillRect(cx - s + 4, cy - s + 8, 5, 5); g.fillRect(cx + s - 9, cy - s + 8, 5, 5);
      g.fillStyle = '#111'; g.fillRect(cx - s + 6, cy - s + 10, 2, 2); g.fillRect(cx + s - 7, cy - s + 10, 2, 2);
      g.fillStyle = a; if (i % 2) { g.fillRect(cx - 3, cy - s - 4, 6, 6); } else { g.fillRect(cx - s, cy - s, 4, 6); g.fillRect(cx + s - 4, cy - s, 4, 6); }
    });
    const im = g.getImageData(0, 0, W, H); let s = 7;
    for (let i = 0; i < im.data.length; i += 4) { s = (s * 1664525 + 1013904223) >>> 0; const n = ((s >>> 24) % 9) - 4; im.data[i] += n; im.data[i + 1] += n; im.data[i + 2] += n; }
    g.putImageData(im, 0, 0); return c;
  }
  $('btnDemo').onclick = () => setImage(makeDemo(), 'демо', true);

  /* ---------- конвеєр: кольори фону -> ручні правки -> палітра -> нарізка ---------- */
  let pending = null;
  function schedule(full) { pending = pending === 'full' || full ? 'full' : 'light'; if (schedule.raf) return; schedule.raf = requestAnimationFrame(() => { schedule.raf = 0; const m = pending; pending = null; recompute(m === 'full'); }); }
  let baseKey = '';
  function recompute(full = true) {
    if (!orig) { draw(); return; }
    const key = JSON.stringify([st.colors, st.fea, st.mode]);
    if (!base || key !== baseKey) { base = st.colors.length ? C.removeColors(orig, { colors: st.colors.map(e => ({ color: unhex(e.c), tol: e.tol })), feather: st.fea, mode: st.mode }) : orig; baseKey = key; }
    let img = base;
    if (em.some(v => v)) img = C.applyEdits(img, orig, em);
    let pal = null;
    if (full) {
      if (st.pal >= 2) { const q = C.quantize(img, st.pal); img = q.img; pal = q.palette; }
      work = img;
      if (st.slice === 'auto') rects = C.findSprites(work, { gap: st.gap, minArea: st.min });
      else if (st.slice === 'grid') { rects = C.gridRects(work.width, work.height, st.cols, st.rows); if (st.trim) rects = rects.map(r => C.trimRect(work, r)).filter(Boolean); }
      else rects = [];
      $('swatches').replaceChildren(...(pal || []).map(c => { const i = document.createElement('i'); i.style.background = hex(c); i.title = hex(c); return i; }));
      $('sliceInfo').textContent = st.slice === 'none' ? 'Нарізки немає: експортується весь лист.' : `Знайдено спрайтів: ${rects.length}`;
    } else work = img;
    workCv = toCanvas(work);
    draw();
  }

  /* ---------- вигляд: масштаб і переміщення ---------- */
  const cv = $('cv'), ctx = cv.getContext('2d');
  let dpr = 1, checker = null;
  function resize() { dpr = window.devicePixelRatio || 1; cv.width = Math.max(1, Math.round(vp.clientWidth * dpr)); cv.height = Math.max(1, Math.round(vp.clientHeight * dpr)); draw(); }
  if (window.ResizeObserver) new ResizeObserver(() => { const fresh = !view.fitted; resize(); if (fresh) fit(); }).observe(vp);
  function fit() {
    if (!orig) { draw(); return; }
    const W = vp.clientWidth, H = vp.clientHeight; if (W < 10 || H < 10) return;
    view.s = Math.min(W / orig.width, H / orig.height, 16) * 0.96; view.fitted = true;
    view.tx = (W - orig.width * view.s) / 2; view.ty = (H - orig.height * view.s) / 2; draw();
  }
  function zoomAt(f, cx = vp.clientWidth / 2, cy = vp.clientHeight / 2) {
    const s = Math.min(64, Math.max(0.02, view.s * f)), k = s / view.s;
    view.tx = cx - (cx - view.tx) * k; view.ty = cy - (cy - view.ty) * k; view.s = s; draw();
  }
  const BGC = { white: '#ffffff', black: '#000000', magenta: '#ff00ff', gray: '#808080' };
  function draw() {
    const W = vp.clientWidth, H = vp.clientHeight;
    $('empty').hidden = !!orig;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    $('zVal').textContent = Math.round(view.s * 100) + '%';
    if (!orig || !workCv) return;
    const x = view.tx, y = view.ty, w = orig.width * view.s, h = orig.height * view.s, show = compare ? origCv : workCv;
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    if (st.bg === 'checker') {
      if (!checker) { const c = document.createElement('canvas'); c.width = c.height = 16; const g = c.getContext('2d'); g.fillStyle = '#2a2a32'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#3a3a44'; g.fillRect(0, 0, 8, 8); g.fillRect(8, 8, 8, 8); checker = ctx.createPattern(c, 'repeat'); }
      ctx.fillStyle = checker;
    } else ctx.fillStyle = BGC[st.bg];
    ctx.fillRect(x, y, w, h);
    ctx.imageSmoothingEnabled = view.s < 1; ctx.drawImage(show, x, y, w, h);
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 1; ctx.strokeRect(x - .5, y - .5, w + 1, h + 1);
    if (st.boxes && !compare) {
      ctx.lineWidth = 1; ctx.font = '11px ui-monospace, monospace'; ctx.textBaseline = 'top';
      rects.forEach((r, i) => {
        const rx = x + r.x * view.s, ry = y + r.y * view.s;
        ctx.strokeStyle = 'rgba(230,193,74,.95)'; ctx.strokeRect(Math.round(rx) + .5, Math.round(ry) + .5, Math.max(1, Math.round(r.w * view.s) - 1), Math.max(1, Math.round(r.h * view.s) - 1));
        const lab = String(i + 1); ctx.fillStyle = 'rgba(9,9,12,.75)'; ctx.fillRect(rx + 1, ry + 1, ctx.measureText(lab).width + 4, 13); ctx.fillStyle = '#f3d97e'; ctx.fillText(lab, rx + 3, ry + 2);
      });
    }
    if (drag && drag.kind === 'rect') {
      const a = toScreen(drag.x0, drag.y0), b = toScreen(drag.x1 + 1, drag.y1 + 1);
      ctx.fillStyle = drag.val === 2 ? 'rgba(111,201,111,.22)' : 'rgba(224,80,80,.22)'; ctx.fillRect(a[0], a[1], b[0] - a[0], b[1] - a[1]);
      ctx.setLineDash([5, 4]); ctx.strokeStyle = '#f3d97e'; ctx.strokeRect(a[0] + .5, a[1] + .5, b[0] - a[0], b[1] - a[1]); ctx.setLineDash([]);
    }
    if (mouse && (tool === 'erase' || tool === 'restore') && !spaceDown) {
      ctx.beginPath(); ctx.arc(mouse.x, mouse.y, st.brush * view.s, 0, 7);
      ctx.strokeStyle = tool === 'erase' ? '#ff7070' : '#7be07b'; ctx.lineWidth = 1.5; ctx.stroke();
    }
  }
  const toScreen = (ix, iy) => [view.tx + ix * view.s, view.ty + iy * view.s];
  const toImg = (sx, sy) => [(sx - view.tx) / view.s, (sy - view.ty) / view.s];
  const inImg = (ix, iy) => orig && ix >= 0 && iy >= 0 && ix < orig.width && iy < orig.height;

  /* ---------- інструменти ---------- */
  function setTool(t) {
    tool = t; vp.dataset.tool = t;
    document.querySelectorAll('.tool').forEach(b => b.classList.toggle('on', b.dataset.tool === t));
    $('btnAddPip').classList.toggle('on', t === 'pipette'); draw();
  }
  document.querySelectorAll('.tool').forEach(b => b.onclick = () => setTool(b.dataset.tool));
  // меню-іконки й довідка «i»: спільний кіт zb-ui.js
  $('btnAddPip').onclick = () => setTool('pipette');

  const pts = new Map(); // активні вказівники (для pinch)
  let drag = null, gesture = null;
  const local = e => { const b = vp.getBoundingClientRect(); return { x: e.clientX - b.left, y: e.clientY - b.top }; };
  function addColor(c) {
    if (st.colors.some(e => e.c === c)) { toast('Цей колір уже є в списку'); return; }
    if (st.colors.length >= 24) { toast('Не більше 24 кольорів'); return; }
    st.colors.push({ c, tol: 12 }); save(); renderColors(); commit(); schedule(true); toast('Колір додано: ' + c);
  }
  function startTool(e, p) {
    const [fx, fy] = toImg(p.x, p.y), ix = Math.floor(fx), iy = Math.floor(fy);
    if (tool === 'pipette') {
      if (!inImg(ix, iy)) return;
      const i = (iy * orig.width + ix) * 4; addColor(hex([orig.data[i], orig.data[i + 1], orig.data[i + 2]]));
    } else if (tool === 'wand') {
      if (!inImg(ix, iy)) return;
      const n = C.wandMask(em, orig, ix, iy, st.wandTol, st.contig, e.shiftKey ? 2 : 1); emDirty = true; commit(); schedule(true);
      toast((e.shiftKey ? 'Відновлено' : 'Стерто') + ' пікселів: ' + n.toLocaleString('uk-UA'));
    } else if (tool === 'erase' || tool === 'restore') {
      drag = { kind: 'brush', val: tool === 'erase' ? 1 : 2, lx: fx, ly: fy, before: em.slice() };
      C.paintCircle(em, orig.width, orig.height, fx, fy, st.brush, drag.val); emDirty = true; schedule(false);
    } else if (tool === 'rect') {
      drag = { kind: 'rect', val: e.shiftKey ? 2 : 1, x0: Math.max(0, Math.min(orig.width - 1, ix)), y0: Math.max(0, Math.min(orig.height - 1, iy)) };
      drag.x1 = drag.x0; drag.y1 = drag.y0;
    }
  }
  vp.addEventListener('contextmenu', e => e.preventDefault());
  vp.addEventListener('pointerdown', e => {
    if (!orig) return;
    vp.setPointerCapture(e.pointerId); const p = local(e); pts.set(e.pointerId, p);
    if (pts.size === 2) { // два пальці: скасувати поточну дію й перейти до pinch
      if (drag && drag.kind === 'brush') { em = drag.before; emDirty = true; schedule(true); }
      drag = null; const [a, b] = [...pts.values()]; gesture = { d: Math.hypot(a.x - b.x, a.y - b.y), cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2 }; return;
    }
    if (pts.size > 2) return;
    if (tool === 'hand' || spaceDown || e.button === 1 || e.button === 2) { drag = { kind: 'pan', lx: p.x, ly: p.y }; vp.classList.add('panning'); return; }
    if (e.button !== 0) return;
    startTool(e, p);
  });
  vp.addEventListener('pointermove', e => {
    const p = local(e); mouse = p; pts.set(e.pointerId, p);
    if (orig) { const ix = Math.floor(toImg(p.x, p.y)[0]), iy = Math.floor(toImg(p.x, p.y)[1]); readout(ix, iy); }
    if (gesture && pts.size >= 2) {
      const [a, b] = [...pts.values()], d = Math.hypot(a.x - b.x, a.y - b.y), cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2;
      view.tx += cx - gesture.cx; view.ty += cy - gesture.cy; zoomAt(d / gesture.d, cx, cy); gesture.d = d; gesture.cx = cx; gesture.cy = cy; return;
    }
    if (!drag) { if (tool === 'erase' || tool === 'restore') draw(); return; }
    if (drag.kind === 'pan') { view.tx += p.x - drag.lx; view.ty += p.y - drag.ly; drag.lx = p.x; drag.ly = p.y; view.fitted = true; draw(); }
    else if (drag.kind === 'brush') { const [fx, fy] = toImg(p.x, p.y); C.paintLine(em, orig.width, orig.height, drag.lx, drag.ly, fx, fy, st.brush, drag.val); drag.lx = fx; drag.ly = fy; emDirty = true; schedule(false); }
    else if (drag.kind === 'rect') { const [fx, fy] = toImg(p.x, p.y); drag.x1 = Math.max(0, Math.min(orig.width - 1, Math.floor(fx))); drag.y1 = Math.max(0, Math.min(orig.height - 1, Math.floor(fy))); draw(); }
  });
  function endPointer(e) {
    pts.delete(e.pointerId); if (pts.size < 2) gesture = null;
    if (!drag) return;
    if (drag.kind === 'pan') vp.classList.remove('panning');
    else if (drag.kind === 'brush') { commit(); schedule(true); }
    else if (drag.kind === 'rect') { C.paintRect(em, orig.width, orig.height, drag.x0, drag.y0, drag.x1, drag.y1, drag.val); emDirty = true; commit(); schedule(true); }
    drag = null; draw();
  }
  vp.addEventListener('pointerup', endPointer); vp.addEventListener('pointercancel', endPointer);
  vp.addEventListener('pointerleave', () => { mouse = null; $('readout').textContent = '—'; draw(); });
  vp.addEventListener('wheel', e => { e.preventDefault(); const p = local(e); view.fitted = true; zoomAt(Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015)), p.x, p.y); }, { passive: false });
  function readout(ix, iy) {
    if (!inImg(ix, iy)) { $('readout').textContent = '—'; return; }
    const i = (iy * orig.width + ix) * 4, d = orig.data;
    $('readout').textContent = `${ix}, ${iy} · ${hex([d[i], d[i + 1], d[i + 2]])}` + (d[i + 3] < 255 ? ` · α${d[i + 3]}` : '');
  }

  /* ---------- список кольорів фону ---------- */
  function renderColors() {
    const box = $('colors'); box.replaceChildren();
    if (!st.colors.length) { const n = document.createElement('div'); n.className = 'none'; n.textContent = 'Список порожній: фон не прибирається. Додайте колір піпеткою або кнопкою «З країв».'; box.append(n); return; }
    st.colors.forEach((e, i) => {
      const row = document.createElement('div'); row.className = 'crow';
      const inp = document.createElement('input'); inp.type = 'color'; inp.value = e.c; inp.title = 'Колір фону. Клікніть, щоб змінити вручну.';
      const code = document.createElement('code'); code.textContent = e.c; code.title = 'Колір у форматі HEX';
      const out = document.createElement('output'); out.textContent = e.tol + '%'; out.title = 'Допуск цього кольору';
      const x = document.createElement('button'); x.className = 'x'; x.textContent = '×'; x.title = 'Прибрати цей колір зі списку';
      const rg = document.createElement('input'); rg.type = 'range'; rg.min = 0; rg.max = 100; rg.value = e.tol; rg.title = 'Допуск: наскільки відтінок може відрізнятися від цього кольору, щоб теж стати прозорим';
      inp.oninput = () => { e.c = inp.value.toLowerCase(); code.textContent = e.c; save(); schedule(true); };
      inp.onchange = () => commit();
      rg.oninput = () => { e.tol = +rg.value; out.textContent = e.tol + '%'; save(); schedule(true); };
      rg.onchange = () => commit();
      x.onclick = () => { st.colors.splice(i, 1); save(); renderColors(); commit(); schedule(true); };
      row.append(inp, code, out, x, rg); box.append(row);
    });
  }
  $('btnEdge').onclick = () => {
    if (!orig) return toast('Спершу завантажте зображення');
    let n = 0; for (const e of C.edgeColors(orig, 3)) { const c = hex(e.color); if (!st.colors.some(q => q.c === c) && st.colors.length < 24) { st.colors.push({ c, tol: 12 }); n++; } }
    if (!n) return toast('Нових кольорів по краях не знайдено');
    save(); renderColors(); commit(); schedule(true); toast('Додано кольорів: ' + n);
  };
  $('btnClearColors').onclick = () => { if (!st.colors.length) return; st.colors = []; save(); renderColors(); commit(); schedule(true); };
  $('btnResetEdits').onclick = () => { if (!orig || !em.some(v => v)) return toast('Ручних правок немає'); em = new Uint8Array(orig.width * orig.height); emDirty = true; commit(); schedule(true); toast('Правки скинуто'); };
  $('btnUndo').onclick = undo; $('btnRedo').onclick = redo;

  /* ---------- керування ---------- */
  function sync() {
    $('rFea').value = st.fea; $('oFea').textContent = st.fea + '%'; $('selMode').value = st.mode;
    $('rBrush').value = st.brush; $('oBrush').textContent = st.brush + ' px'; $('rWand').value = st.wandTol; $('oWand').textContent = st.wandTol + '%'; $('cContig').checked = st.contig;
    $('selSlice').value = st.slice; $('boxAuto').hidden = st.slice !== 'auto'; $('boxGrid').hidden = st.slice !== 'grid';
    $('rGap').value = st.gap; $('oGap').textContent = st.gap + ' px'; $('rMin').value = st.min; $('oMin').textContent = st.min + ' px';
    $('nCols').value = st.cols; $('nRows').value = st.rows; $('cTrim').checked = st.trim;
    $('rPal').value = st.pal; $('oPal').textContent = st.pal >= 2 ? st.pal : 'вимкнено';
    $('tName').value = st.name; $('nPad').value = st.pad; $('cPow2').checked = st.pow2; $('cBoxes').checked = st.boxes; $('selBg').value = st.bg;
  }
  const bind = (id, key, conv = v => v, redo = 'full', commitOnChange = false) => {
    const el = $(id), h = e => { const t = e.target; st[key] = conv(t.type === 'checkbox' ? t.checked : t.value); sync(); save(); if (redo === 'full') schedule(true); else draw(); };
    el.addEventListener(el.tagName === 'SELECT' || el.type === 'checkbox' || el.type === 'number' ? 'change' : 'input', h);
    if (commitOnChange) el.addEventListener('change', () => commit());
    if (el.type === 'checkbox' && commitOnChange) { /* чекбокс вже спрацював у change */ }
  };
  const num = (lo, hi) => v => Math.min(hi, Math.max(lo, Math.round(+v) || lo));
  bind('rFea', 'fea', Number, 'full', true); bind('selMode', 'mode', String, 'full', true);
  bind('rBrush', 'brush', Number, 'draw'); bind('rWand', 'wandTol', Number, 'draw'); bind('cContig', 'contig', Boolean, 'draw');
  bind('selSlice', 'slice', String); bind('rGap', 'gap', Number); bind('rMin', 'min', Number); bind('nCols', 'cols', num(1, 64)); bind('nRows', 'rows', num(1, 64));
  bind('cTrim', 'trim'); bind('rPal', 'pal', Number);
  bind('tName', 'name', v => v.replace(/[^\w\-а-яіїєґА-ЯІЇЄҐ]/g, '_') || 'sprite', 'draw');
  bind('nPad', 'pad', num(0, 16), 'draw'); bind('cPow2', 'pow2', Boolean, 'draw');
  bind('cBoxes', 'boxes', Boolean, 'draw'); bind('selBg', 'bg', String, 'draw');
  $('cCompare').onchange = e => { compare = e.target.checked; draw(); };
  $('zIn').onclick = () => { view.fitted = true; zoomAt(1.25); }; $('zOut').onclick = () => { view.fitted = true; zoomAt(1 / 1.25); };
  $('zFit').onclick = fit; $('z100').onclick = () => { if (!orig) return; view.fitted = true; zoomAt(1 / view.s); };

  addEventListener('keydown', e => {
    if (/^(input|textarea|select)$/i.test(e.target.tagName) && e.key !== 'Escape') return;
    const k = (window.zbKey || (x => x.key.toLowerCase()))(e);
    if ((e.ctrlKey || e.metaKey) && k === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
    if ((e.ctrlKey || e.metaKey) && k === 'y') { e.preventDefault(); redo(); return; }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (k === ' ') { spaceDown = true; vp.classList.add('panning'); e.preventDefault(); return; }
    const map = { h: 'hand', i: 'pipette', w: 'wand', b: 'erase', r: 'restore', m: 'rect' };
    if (map[k]) setTool(map[k]);
    else if (k === 'o' && !e.repeat) { compare = true; $('cCompare').checked = true; draw(); }
    else if (k === '0') fit(); else if (k === '1') $('z100').click(); else if (k === '+' || k === '=') $('zIn').click(); else if (k === '-') $('zOut').click();
    else if (k === '[') { st.brush = Math.max(1, st.brush - 4); sync(); save(); draw(); } else if (k === ']') { st.brush = Math.min(200, st.brush + 4); sync(); save(); draw(); }
  });
  addEventListener('keyup', e => {
    const k = (window.zbKey || (x => x.key.toLowerCase()))(e);
    if (k === ' ') { spaceDown = false; if (!drag) vp.classList.remove('panning'); }
    if (k === 'o') { compare = false; $('cCompare').checked = false; draw(); }
  });

  /* ---------- експорт ---------- */
  const pngBlob = img => new Promise((res, rej) => toCanvas(img).toBlob(b => (b ? res(b) : rej(new Error('png'))), 'image/png'));
  const pngBytes = async img => new Uint8Array(await (await pngBlob(img)).arrayBuffer());
  function download(blob, name) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }
  const nm = i => `${st.name}_${String(i + 1).padStart(String(rects.length).length < 2 ? 2 : String(rects.length).length, '0')}`;

  $('btnSheet').onclick = async () => { if (!work) return toast('Спершу завантажте зображення'); download(await pngBlob(work), `${st.name}_sheet.png`); toast('PNG збережено'); };
  $('btnCopyPng').onclick = async () => {
    if (!work) return toast('Спершу завантажте зображення');
    try { await navigator.clipboard.write([new ClipboardItem({ 'image/png': pngBlob(work) })]); toast('PNG скопійовано в буфер'); } catch { toast('Браузер не дозволив копіювання: скористайтеся «Завантажити PNG»', 3000); }
  };
  $('btnZip').onclick = async () => {
    if (!work) return toast('Спершу завантажте зображення');
    if (!rects.length) return toast('Немає спрайтів: оберіть нарізку');
    toast('Пакуємо…', 6000);
    const files = []; for (let i = 0; i < rects.length; i++) files.push({ name: nm(i) + '.png', data: await pngBytes(C.crop(work, rects[i])) });
    download(new Blob([C.zip(files)], { type: 'application/zip' }), `${st.name}_sprites.zip`); toast(`Збережено ${files.length} спрайтів`);
  };
  $('btnAtlas').onclick = async () => {
    if (!work) return toast('Спершу завантажте зображення');
    if (!rects.length) return toast('Немає спрайтів: оберіть нарізку');
    const sizes = rects.map(r => ({ w: r.w, h: r.h })), { pos, W, H } = C.packShelf(sizes, { pad: st.pad, pow2: st.pow2 });
    const atlas = { data: new Uint8ClampedArray(W * H * 4), width: W, height: H };
    rects.forEach((r, i) => C.blit(atlas, C.crop(work, r), pos[i].x, pos[i].y));
    const names = rects.map((r, i) => nm(i));
    download(await pngBlob(atlas), `${st.name}_atlas.png`);
    setTimeout(() => download(new Blob([JSON.stringify(C.atlasJson(names, sizes, pos, W, H, `${st.name}_atlas.png`), null, 2)], { type: 'application/json' }), `${st.name}_atlas.json`), 250);
    toast(`Атлас ${W}×${H}: ${rects.length} спрайтів`);
  };

  /* ---------- JSON налаштувань ---------- */
  const settingsJson = () => JSON.stringify({ format: 'zbyrai-sprite-cleaner', version: 1, settings: st }, null, 2);
  function importJson(text) {
    let j; try { j = JSON.parse(text); } catch { return toast('Це не схоже на JSON'); }
    if (!j || j.format !== 'zbyrai-sprite-cleaner' || !j.settings) return toast('Це не налаштування Sprite Sheet Cleaner');
    Object.assign(st, sanitize(j.settings)); save(); sync(); renderColors(); commit(); schedule(true); toast('Налаштування застосовано');
  }
  $('btnCopyJson').onclick = async () => { try { await navigator.clipboard.writeText(settingsJson()); toast('JSON налаштувань скопійовано'); } catch { toast('Браузер не дозволив копіювання: скористайтеся «Експорт JSON»', 3000); } };
  $('btnExportJson').onclick = () => { download(new Blob([settingsJson()], { type: 'application/json' }), `${st.name}_settings.json`); toast('Налаштування збережено'); };
  $('btnImportJson').onclick = () => $('jsonFile').click();
  $('jsonFile').onchange = async e => { const f = e.target.files[0]; e.target.value = ''; if (f) importJson(await f.text()); };

  sync(); renderColors(); setTool('pipette'); updUndo(); resize();
  $('btnDemo').click();
})();
