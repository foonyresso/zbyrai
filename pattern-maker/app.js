// Pattern Maker: інтерфейс. Математика лежить у pattern-core.js (PMCore).
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  /* ---------- стан і збереження (префікс pm_, щоб не змішуватися з іншими інструментами сайту) ---------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem('pm_' + k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem('pm_' + k, JSON.stringify(v)); } catch {} },
  };
  const DEFAULTS = { mode: 'p6m', a: 1, size: .4, rot: 0, k: .5, seg: 8, spin: 0, zoom: .5, outline: false, layout: 'grid', tileW: 1024, cw: 1920, ch: 1080, fx: Object.assign({}, PMFx.DEFAULT_FX) };
  const savedSt = store.get('settings', {});
  const st = Object.assign({}, DEFAULTS, savedSt, { fx: Object.assign({}, DEFAULTS.fx, savedSt.fx) });
  delete st.pixel; // старий прапорець «піксель-арт для текстури»: тепер ефект працює на кінцевому результаті (st.fx.px)
  // «Розетка» (мандала) живе лише в застосунку: вона не вимощує клітинку, а складає зображення навколо центру
  const MODES = Object.assign({}, PMCore.MODES, { ros: { name: 'Розетка', sub: 'мандала з N променів', tip: 'Мандала: шматок повторюється по колу. Розетка не вимощується, зберігайте полотно' } });
  if (!MODES[st.mode]) st.mode = DEFAULTS.mode;
  /* ---------- історія (скасування), «рецепти» ефектів і посилання зі станом ---------- */
  const STATE_KEYS = ['mode', 'a', 'size', 'rot', 'k', 'seg', 'spin', 'zoom', 'outline', 'layout', 'fx'];
  const snap = () => JSON.stringify(STATE_KEYS.reduce((o, k) => (o[k] = st[k], o), {}));
  function applySnap(json) {
    try {
      const o = JSON.parse(json);
      for (const k of STATE_KEYS) if (k !== 'fx' && k in o) st[k] = o[k];
      st.fx = Object.assign({}, DEFAULTS.fx, o.fx);
      if (!MODES[st.mode]) st.mode = DEFAULTS.mode;
      return true;
    } catch { return false; }
  }
  const hist = [snap()]; let histTimer = 0, restoring = false;
  function pushHist() {
    clearTimeout(histTimer);
    histTimer = setTimeout(() => { const j = snap(); if (!restoring && j !== hist[hist.length - 1]) { hist.push(j); if (hist.length > 60) hist.shift(); } }, 350);
  }
  const saveSettings = () => { store.set('settings', st); pushHist(); };

  const BASE = 512;          // логічна ширина клітинки в превʼю (зум 100% = 512 px на клітинку)
  const MAX_SIDE = 3200;     // більші зображення зменшуємо, щоб не з'їсти памʼять
  let src = null;            // { data, width, height, canvas }
  const sel = { cx: 0, cy: 0 };   // де центроїд базової області лежить на джерелі (px)
  let cell = null;           // canvas з останньою обчисленою клітинкою
  const view = { px: 0, py: 0 }; // зсув превʼю в CSS-пікселях

  const params = () => ({
    mode: st.mode, a: st.a, cx: sel.cx, cy: sel.cy,
    s: st.size * Math.min(src.width, src.height), phi: st.rot * Math.PI / 180, k: st.k,
  });

  /* ---------- підказки ---------- */
  let toastTimer;
  function toast(msg, ms = 1800) {
    const t = $('toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), ms);
  }
  const tick = () => new Promise(r => setTimeout(r, 30));

  /* ---------- завантаження зображення ---------- */
  function setSource(img, label) {
    let w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
    const k = Math.min(1, MAX_SIDE / Math.max(w, h));
    w = Math.max(1, Math.round(w * k)); h = Math.max(1, Math.round(h * k));
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const cx = c.getContext('2d', { willReadFrequently: true });
    cx.drawImage(img, 0, 0, w, h);
    const id = cx.getImageData(0, 0, w, h);
    src = { data: id.data, width: w, height: h, canvas: c }; srcId++;
    sel.cx = w / 2; sel.cy = h / 2;
    $('srcInfo').textContent = `${label ? label + ' · ' : ''}${w}×${h} px. Перетягніть виділення, колесо миші змінює розмір.`;
    layoutSource(); drawSource(); requestRender();
  }
  function loadFile(file) {
    if (!file || !/^image\//.test(file.type)) { toast('Це не зображення'); return; }
    const url = URL.createObjectURL(file), im = new Image();
    im.onload = () => { setSource(im, file.name || 'з буфера'); URL.revokeObjectURL(url); };
    im.onerror = () => { toast('Не вдалося відкрити цей файл'); URL.revokeObjectURL(url); };
    im.src = url;
  }

  // Демо-зображення малюється тут же, щоб інструмент не був порожнім і працював без файлів.
  function makeDemo() {
    const W = 1200, H = 900, c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d');
    let s = 7; const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
    const bg = g.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#0f2a3a'); bg.addColorStop(.55, '#1d4258'); bg.addColorStop(1, '#13192e');
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    const pal = ['#c9a766', '#e8d29e', '#b84a5a', '#2f8f83', '#f0ece0', '#6c5fc7', '#d9784f', '#7fb7a4'];
    for (let i = 0; i < 46; i++) { // м'які плями кольору для глибини
      const x = r() * W, y = r() * H, rad = 40 + r() * 110, col = pal[Math.floor(r() * pal.length)];
      const rg = g.createRadialGradient(x, y, 0, x, y, rad);
      rg.addColorStop(0, col); rg.addColorStop(1, 'rgba(0,0,0,0)');
      g.globalAlpha = .18 + r() * .35; g.fillStyle = rg; g.beginPath(); g.arc(x, y, rad, 0, 7); g.fill();
    }
    g.globalAlpha = 1;
    for (let i = 0; i < 34; i++) { // квіти з пелюстками, різного розміру
      const x = 30 + r() * (W - 60), y = 30 + r() * (H - 60), sz = 18 + r() * r() * 110, rot = r() * 6.28, n = 5 + Math.floor(r() * 5);
      const col = pal[Math.floor(r() * pal.length)], col2 = pal[Math.floor(r() * pal.length)];
      g.save(); g.translate(x, y); g.rotate(rot);
      for (let k = 0; k < n; k++) {
        g.rotate(6.2832 / n); g.fillStyle = col; g.globalAlpha = .92;
        g.beginPath(); g.ellipse(sz * .55, 0, sz * .5, sz * .22, 0, 0, 7); g.fill();
        g.strokeStyle = 'rgba(9,9,12,.55)'; g.lineWidth = Math.max(1, sz * .03); g.stroke();
      }
      g.globalAlpha = 1; g.fillStyle = col2; g.beginPath(); g.arc(0, 0, sz * .22, 0, 7); g.fill();
      g.fillStyle = '#17120a'; g.beginPath(); g.arc(0, 0, sz * .12, 0, 7); g.fill();
      g.restore();
    }
    const hero = (x, y, sz, n, col, col2, rot) => { // кілька великих квітів ближче до центру, щоб типовий вибір одразу давав цікавий візерунок
      g.save(); g.translate(x, y); g.rotate(rot);
      for (let k = 0; k < n; k++) {
        g.rotate(6.2832 / n); g.fillStyle = col; g.globalAlpha = .95;
        g.beginPath(); g.ellipse(sz * .55, 0, sz * .5, sz * .21, 0, 0, 7); g.fill();
        g.strokeStyle = 'rgba(9,9,12,.55)'; g.lineWidth = Math.max(1, sz * .03); g.stroke();
      }
      g.globalAlpha = 1; g.fillStyle = col2; g.beginPath(); g.arc(0, 0, sz * .22, 0, 7); g.fill();
      g.fillStyle = '#17120a'; g.beginPath(); g.arc(0, 0, sz * .12, 0, 7); g.fill();
      g.restore();
    };
    hero(520, 400, 120, 8, '#b84a5a', '#e8d29e', .3);
    hero(700, 470, 96, 6, '#2f8f83', '#f0ece0', 1.1);
    hero(610, 560, 70, 7, '#c9a766', '#6c5fc7', .6);
    hero(430, 530, 54, 5, '#d9784f', '#e8d29e', 0);
    hero(740, 340, 58, 6, '#7fb7a4', '#b84a5a', .9);
    for (let i = 0; i < 26; i++) { // дрібні ромби й крапки
      const x = r() * W, y = r() * H, d = 5 + r() * 14;
      g.fillStyle = pal[Math.floor(r() * pal.length)]; g.globalAlpha = .9;
      g.beginPath(); g.moveTo(x, y - d); g.lineTo(x + d * .6, y); g.lineTo(x, y + d); g.lineTo(x - d * .6, y); g.closePath(); g.fill();
    }
    g.globalAlpha = 1;
    g.lineCap = 'round';
    for (let i = 0; i < 46; i++) { // тонкі золоті лінії
      g.strokeStyle = pal[Math.floor(r() * 3)]; g.globalAlpha = .35 + r() * .45; g.lineWidth = .8 + r() * 2.4;
      g.beginPath(); const x = r() * W, y = r() * H;
      g.moveTo(x, y); g.bezierCurveTo(x + r() * 260 - 130, y + r() * 260 - 130, x + r() * 260 - 130, y + r() * 260 - 130, x + r() * 300 - 150, y + r() * 300 - 150);
      g.stroke();
    }
    g.globalAlpha = 1;
    return c;
  }

  /* ---------- джерело: відображення й виділення ---------- */
  const sv = { k: 1, ox: 0, oy: 0, w: 0, h: 0 };
  function layoutSource() {
    if (!src) return;
    const wrap = $('srcWrap'), cvs = $('src'), cw = wrap.clientWidth;
    if (!cw) return;
    const maxH = clamp(innerHeight * .42, 220, 480);
    let k = cw / src.width, ch = src.height * k;
    if (ch > maxH) { ch = maxH; k = ch / src.height; }
    ch = Math.max(120, Math.round(ch));
    const dpr = devicePixelRatio || 1;
    wrap.style.height = ch + 'px';
    cvs.style.width = cw + 'px'; cvs.style.height = ch + 'px';
    cvs.width = Math.round(cw * dpr); cvs.height = Math.round(ch * dpr);
    sv.k = k; sv.w = cw; sv.h = ch; sv.ox = (cw - src.width * k) / 2; sv.oy = (ch - src.height * k) / 2;
  }
  const regionPolyImg = () => {
    if (st.mode === 'ros') { // у розетці виділення — коло навколо центру
      const R = st.size * Math.min(src.width, src.height);
      return Array.from({ length: 48 }, (_, i) => [sel.cx + R * Math.cos(i / 48 * 2 * Math.PI), sel.cy + R * Math.sin(i / 48 * 2 * Math.PI)]);
    }
    const g = PMCore.geometry(st.mode, st.a), p = params();
    return g.poly.map(([x, y]) => PMCore.regionToSource(p, g, x, y));
  };
  function drawSource() {
    if (!src || !sv.w) return;
    const cvs = $('src'), ctx = cvs.getContext('2d'), dpr = devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, sv.w, sv.h);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(src.canvas, sv.ox, sv.oy, src.width * sv.k, src.height * sv.k);
    const pts = regionPolyImg().map(([x, y]) => [sv.ox + x * sv.k, sv.oy + y * sv.k]);
    ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath();
    ctx.fillStyle = 'rgba(201,167,102,.20)'; ctx.fill();
    ctx.lineJoin = 'round'; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(9,9,12,.7)'; ctx.stroke();
    ctx.lineWidth = 1.6; ctx.strokeStyle = '#e8d29e'; ctx.stroke();
    pts.forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 3.2, 0, 7); ctx.fillStyle = '#e8d29e'; ctx.fill(); });
  }
  const toImg = (e) => {
    const r = $('src').getBoundingClientRect();
    return [(e.clientX - r.left - sv.ox) / sv.k, (e.clientY - r.top - sv.oy) / sv.k];
  };
  function inPoly(pts, [px, py]) {
    let ins = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i], [xj, yj] = pts[j];
      if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) ins = !ins;
    }
    return ins;
  }
  let sdrag = null;
  $('src').addEventListener('pointerdown', e => {
    if (!src) return;
    const p = toImg(e), inside = inPoly(regionPolyImg(), p);
    sdrag = { dx: inside ? p[0] - sel.cx : 0, dy: inside ? p[1] - sel.cy : 0 };
    $('src').setPointerCapture(e.pointerId); $('src').classList.add('drag');
    moveSel(p);
  });
  $('src').addEventListener('pointermove', e => { if (sdrag) moveSel(toImg(e)); });
  const endSdrag = () => { sdrag = null; $('src').classList.remove('drag'); };
  $('src').addEventListener('pointerup', endSdrag);
  $('src').addEventListener('pointercancel', endSdrag);
  function moveSel(p) {
    sel.cx = clamp(p[0] - sdrag.dx, 0, src.width); sel.cy = clamp(p[1] - sdrag.dy, 0, src.height);
    drawSource(); requestRender();
  }
  $('src').addEventListener('wheel', e => {
    e.preventDefault();
    st.size = clamp(st.size * Math.exp(-e.deltaY * .0015), .03, 1);
    syncControls(); drawSource(); requestRender(); saveSettings();
  }, { passive: false });

  /* ---------- обчислення клітинки ---------- */
  function toCanvas(r) {
    const c = document.createElement('canvas'); c.width = r.width; c.height = r.height;
    c.getContext('2d').putImageData(new ImageData(r.data, r.width, r.height), 0, 0);
    return c;
  }
  let raf = 0, finalTimer = 0;
  // під час перетягування рахуємо чернетку малої ширини, потім у спокої дорахуємо повну якість
  function requestRender() {
    if (!src) return;
    if (!raf) raf = requestAnimationFrame(() => { raf = 0; renderTo(160, 1); });
    clearTimeout(finalTimer);
    finalTimer = setTimeout(() => renderTo(BASE, 0), 170);
  }
  function renderTo(w, ssaa) {
    if (st.mode === 'ros') { cell = null; drawPreview(ssaa === 1); return; }
    cell = toCanvas(PMCore.renderCell(src, params(), w, { ssaa }));
    drawPreview(ssaa === 1);
  }

  /* ---------- превʼю ---------- */
  function sizePreview() {
    const cvs = $('prev'), wrap = $('prevWrap'), dpr = devicePixelRatio || 1;
    const w = wrap.clientWidth, h = wrap.clientHeight;
    if (!w || !h) return;
    cvs.width = Math.round(w * dpr); cvs.height = Math.round(h * dpr);
  }
  /* ----- малювання: тайли або розетка, потім ефекти кінцевого результату ----- */
  let fxTimer = 0, srcId = 0, rosCache = { key: '', canvas: null };
  const imgOf = () => ({ data: src.data, width: src.width, height: src.height });
  const rosOpts = () => ({ n: st.seg, spin: st.spin * Math.PI / 180, cx: sel.cx, cy: sel.cy, R: Math.max(2, st.size * Math.min(src.width, src.height)) });
  // розетка без ефектів кешується: повзунки ефектів не мають перераховувати її щоразу
  function rosetteCanvas(W, H) {
    const key = [srcId, st.seg, st.spin, sel.cx, sel.cy, st.size, W, H].join('|');
    if (rosCache.key !== key) {
      const r = PMFx.rosette(imgOf(), W, H, rosOpts());
      const c = document.createElement('canvas'); c.width = W; c.height = H;
      c.getContext('2d').putImageData(new ImageData(r.data, W, H), 0, 0);
      rosCache = { key, canvas: c };
    }
    return rosCache.canvas;
  }
  function paintRosette(ctx, W, H, quality) {
    const rw = Math.max(16, Math.round(W * quality)), rh = Math.max(16, Math.round(H * quality));
    ctx.imageSmoothingEnabled = quality < 1; ctx.drawImage(rosetteCanvas(rw, rh), 0, 0, W, H);
  }
  // нахил візерунка: вся решітка повертається навколо центру полотна
  function tileTransform(ctx, W, H, k, ox, oy) {
    ctx.translate(W / 2, H / 2); ctx.rotate(st.fx.ang * Math.PI / 180); ctx.translate(-W / 2 + ox, -H / 2 + oy); ctx.scale(k, k);
  }
  // розкладки: «цегла» зсуває кожен другий рядок на півклітинки, «півкрок» зсуває кожен другий стовпчик на піввисоти.
  // Дзеркальні клітинки в зсуві не збігаються краями, тож шви видно навмисне. Складена плитка = 2 клітинки, кешується.
  let layCache = { tile: null, layout: '', canvas: null };
  function layoutTile(tile) {
    if (st.layout === 'grid') return tile;
    if (layCache.tile === tile && layCache.layout === st.layout) return layCache.canvas;
    const w = tile.width, h = tile.height, c = document.createElement('canvas'), g = c.getContext('2d');
    if (st.layout === 'brick') {
      c.width = w; c.height = h * 2; g.drawImage(tile, 0, 0);
      const o = Math.floor(w / 2); g.drawImage(tile, o, h); g.drawImage(tile, o - w, h);
    } else {
      c.width = w * 2; c.height = h; g.drawImage(tile, 0, 0);
      const o = Math.floor(h / 2); g.drawImage(tile, w, o); g.drawImage(tile, w, o - h);
    }
    layCache = { tile, layout: st.layout, canvas: c };
    return c;
  }
  function paintTiles(ctx, W, H, k, tile, ox, oy) {
    ctx.save(); tileTransform(ctx, W, H, k, ox, oy);
    ctx.fillStyle = ctx.createPattern(layoutTile(tile), 'repeat'); const big = (W + H) * 2 / k; ctx.fillRect(-big, -big, big * 2, big * 2);
    ctx.restore();
  }
  function applyFx(ctx, W, H, scale, colorOnly) {
    const out = PMFx.process(ctx.getImageData(0, 0, W, H), st.fx, scale, colorOnly);
    ctx.putImageData(new ImageData(out.data, W, H), 0, 0);
  }
  function drawPreview(fast) {
    const cvs = $('prev'), ctx = cvs.getContext('2d'), dpr = devicePixelRatio || 1, W = cvs.width, H = cvs.height;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#09090c'; ctx.fillRect(0, 0, W, H);
    if (!src) return;
    const ros = st.mode === 'ros';
    if (!ros && !cell) return;
    const k = ros ? 1 : st.zoom * BASE / cell.width * dpr; // пікселів екрана на піксель клітинки
    if (ros) paintRosette(ctx, W, H, fast ? .3 : 1);
    else { ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; paintTiles(ctx, W, H, k, cell, view.px * dpr, view.py * dpr); }
    clearTimeout(fxTimer);
    if (fast) fxTimer = setTimeout(() => drawPreview(false), 130); // під час перетягування чернетка, у спокої повна якість з ефектами
    else if (PMFx.active(st.fx)) applyFx(ctx, W, H, dpr, false);
    if (st.outline && !ros && st.layout === 'grid') {
      const big = (W + H) * 2 / k, n = Math.ceil(big / cell.width) + 1, m = Math.ceil(big / cell.height) + 1;
      ctx.save(); tileTransform(ctx, W, H, k, view.px * dpr, view.py * dpr);
      ctx.strokeStyle = 'rgba(232,210,158,.75)'; ctx.lineWidth = dpr / k; ctx.setLineDash([6 * dpr / k, 5 * dpr / k]);
      ctx.beginPath();
      for (let i = -n; i <= n; i++) { ctx.moveTo(i * cell.width, -big); ctx.lineTo(i * cell.width, big); }
      for (let j = -m; j <= m; j++) { ctx.moveTo(-big, j * cell.height); ctx.lineTo(big, j * cell.height); }
      ctx.stroke(); ctx.restore();
    }
  }
  let pdrag = null;
  $('prev').addEventListener('pointerdown', e => {
    pdrag = { x: e.clientX, y: e.clientY, px: view.px, py: view.py };
    $('prev').setPointerCapture(e.pointerId); $('prev').classList.add('drag');
  });
  $('prev').addEventListener('pointermove', e => {
    if (!pdrag) return;
    view.px = pdrag.px + e.clientX - pdrag.x; view.py = pdrag.py + e.clientY - pdrag.y; drawPreview(true);
  });
  const endPdrag = () => { pdrag = null; $('prev').classList.remove('drag'); };
  $('prev').addEventListener('pointerup', endPdrag);
  $('prev').addEventListener('pointercancel', endPdrag);
  $('prev').addEventListener('wheel', e => {
    e.preventDefault();
    const r = $('prev').getBoundingClientRect(), cx = e.clientX - r.left, cy = e.clientY - r.top;
    const z0 = st.zoom, z1 = clamp(z0 * Math.exp(-e.deltaY * .0015), .1, 3);
    view.px = cx - (cx - view.px) * z1 / z0; view.py = cy - (cy - view.py) * z1 / z0; // точка під курсором лишається на місці
    st.zoom = z1; syncControls(); drawPreview(true); saveSettings();
  }, { passive: false });

  /* ---------- режими й елементи керування ---------- */
  const ICONS = {
    pmm: '<rect x="4" y="4" width="16" height="16" rx="1.5"/><path d="M12 4v16M4 12h16"/>',
    p4m: '<rect x="4" y="4" width="16" height="16" rx="1.5"/><path d="M12 4v16M4 12h16M4 4l16 16M20 4 4 20"/>',
    p6m: '<path d="M12 3l7.8 4.5v9L12 21l-7.8-4.5v-9z"/><path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9"/>',
    p3m1: '<path d="M12 3.5 21 19.5H3z"/><path d="M12 3.5v16M3 19.5l13.5-8M21 19.5 7.5 11.5"/>',
    tex: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 12c4-6 12 6 16 0"/>',
    ros: '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17M3.5 12h17M6 6l12 12M18 6 6 18"/>',
  };
  const modesBox = $('modes');
  Object.entries(MODES).forEach(([key, m]) => {
    const b = document.createElement('button');
    b.className = 'mode'; b.dataset.mode = key; b.type = 'button'; b.title = m.tip || m.name;
    b.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[key]}</svg><span><b>${m.name}</b><small>${m.sub}</small></span>`;
    b.onclick = () => { st.mode = key; syncControls(); drawSource(); requestRender(); saveSettings(); };
    modesBox.appendChild(b);
  });

  function syncControls() {
    modesBox.querySelectorAll('.mode').forEach(b => {
      const on = b.dataset.mode === st.mode; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on);
    });
    document.querySelectorAll('[data-for]').forEach(el => { el.hidden = !el.dataset.for.split(' ').includes(st.mode); });
    $('rSize').value = Math.round(st.size * 100); $('oSize').textContent = Math.round(st.size * 100) + '%';
    $('rRot').value = st.rot; $('oRot').textContent = st.rot + '°';
    $('rAsp').value = Math.round(st.a * 100); $('oAsp').textContent = st.a.toFixed(2) + ' : 1';
    $('rBlend').value = Math.round(st.k * 100); $('oBlend').textContent = Math.round(st.k * 100) + '%';
    $('cOutline').checked = st.outline; $('selLayout').value = st.layout;
    $('rSeg').value = st.seg; $('oSeg').textContent = st.seg; $('rSpin').value = st.spin; $('oSpin').textContent = st.spin + '°';
    syncFx();
    $('rZoom').value = Math.round(st.zoom * 100); $('oZoom').textContent = Math.round(st.zoom * 100) + '%';
    $('selTile').value = String(st.tileW); $('inW').value = st.cw; $('inH').value = st.ch;
  }
  const bind = (id, fn, redrawSrc = true) => $(id).addEventListener('input', e => {
    fn(e.target); syncControls();
    if (redrawSrc) { drawSource(); requestRender(); } else drawPreview();
    saveSettings();
  });
  bind('rSize', t => { st.size = +t.value / 100; });
  bind('rRot', t => { st.rot = +t.value; });
  bind('rAsp', t => { st.a = +t.value / 100; });
  bind('rBlend', t => { st.k = +t.value / 100; });
  bind('rSeg', t => { st.seg = +t.value; });
  bind('rSpin', t => { st.spin = +t.value; });
  bind('rZoom', t => { st.zoom = +t.value / 100; }, false);
  bind('cOutline', t => { st.outline = t.checked; }, false);
  $('selTile').addEventListener('change', e => { st.tileW = +e.target.value; saveSettings(); });
  for (const id of ['inW', 'inH']) $(id).addEventListener('change', e => {
    const v = clamp(Math.round(+e.target.value) || DEFAULTS[id === 'inW' ? 'cw' : 'ch'], 16, 8192);
    st[id === 'inW' ? 'cw' : 'ch'] = v; syncControls(); saveSettings();
  });
  $('selLayout').addEventListener('change', e => { st.layout = e.target.value; drawPreview(); saveSettings(); });
  $('btnReset').onclick = () => { st.zoom = DEFAULTS.zoom; view.px = 0; view.py = 0; syncControls(); drawPreview(); saveSettings(); };

  /* ---------- кнопки скидання (↺ біля кожного повзунка) і «Скинути все» ---------- */
  function resetBtn(onClick, title = 'Скинути до початкового') {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'rst'; b.textContent = '↺'; b.title = title; b.setAttribute('aria-label', title);
    b.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); onClick(); });
    return b;
  }
  const EXIST = { rSize: ['size', true], rRot: ['rot', true], rAsp: ['a', true], rBlend: ['k', true], rSeg: ['seg', true], rSpin: ['spin', true], rZoom: ['zoom', false] };
  function addResets() {
    for (const [id, [key, redrawSrc]] of Object.entries(EXIST)) {
      $(id).closest('.ctl').append(resetBtn(() => {
        st[key] = DEFAULTS[key]; syncControls();
        if (redrawSrc) { drawSource(); requestRender(); } else drawPreview();
        saveSettings();
      }));
    }
  }
  $('btnResetAll').onclick = () => {
    for (const k of ['a', 'size', 'rot', 'k', 'seg', 'spin', 'zoom', 'outline', 'layout']) st[k] = DEFAULTS[k];
    st.fx = Object.assign({}, DEFAULTS.fx); view.px = 0; view.py = 0;
    syncControls(); drawSource(); requestRender(); saveSettings(); toast('Усе скинуто до початкових значень');
  };

  // «Сюрприз»: випадкові параметри візерунка й 2–4 випадкові ефекти (режим і зображення не чіпаємо)
  $('btnSurprise').onclick = () => {
    const R = (a, b) => Math.round(a + Math.random() * (b - a)), pick = o => o[Math.floor(Math.random() * o.length)];
    st.size = R(20, 70) / 100; st.rot = R(-180, 180); st.a = R(70, 140) / 100; st.k = R(25, 70) / 100; st.seg = R(4, 16); st.spin = R(-180, 180);
    const fx = Object.assign({}, DEFAULTS.fx);
    const pool = [
      () => { fx.px = R(3, 14); }, () => { fx.pal = pick(Object.keys(PMFx.PALETTES)); if (Math.random() < .5) fx.dith = R(20, 80); },
      () => { fx.hue = R(-180, 180); fx.sat = R(100, 220); }, () => { fx.gmap = pick(Object.keys(PMFx.GRADS)); },
      () => { fx.wave = R(10, 45); fx.waveL = R(40, 160); }, () => { fx.lens = pick([-1, 1]) * R(30, 90); }, () => { fx.swirl = R(-240, 240); },
      () => { fx.ca = R(2, 10); }, () => { fx.relief = R(40, 100); }, () => { fx.edge = R(30, 80); }, () => { fx.vig = R(30, 80); },
      () => { fx.scan = R(20, 60); }, () => { fx.grain = R(10, 40); }, () => { fx.post = R(3, 6); },
    ];
    for (let n = R(2, 4); n > 0; n--) pick(pool)();
    st.fx = fx; view.px = 0; view.py = 0;
    syncControls(); drawSource(); requestRender(); saveSettings(); toast('Сюрприз!');
  };

  /* ---------- ефекти кінцевого результату: панель керування ---------- */
  const FXC = [
    { k: 'px', label: 'Піксель-арт: розмір пікселя', min: 1, max: 48, fmt: v => (v <= 1 ? 'вимкнено' : v + ' px') },
    { k: 'pgrid', label: 'Форма пікселя', type: 'select', list: [['sq', 'Квадрат'], ['hex', 'Шестикутник'], ['dia', 'Ромб']], noOut: true },
    { k: 'pal', label: 'Палітра', type: 'select', opts: 'PALETTES', none: 'Без палітри' },
    { k: 'dith', label: 'Дізерінг (растрове змішування)', min: 0, max: 100, fmt: v => v + '%' },
    { k: 'post', label: 'Постеризація: рівнів на канал', min: 0, max: 16, fmt: v => (v < 2 ? 'вимкнено' : v) },
    { k: 'hue', label: 'Відтінок', min: -180, max: 180, fmt: v => v + '°' },
    { k: 'sat', label: 'Насиченість', min: 0, max: 300, fmt: v => v + '%' },
    { k: 'bri', label: 'Яскравість', min: -100, max: 100, fmt: v => (v > 0 ? '+' : '') + v },
    { k: 'con', label: 'Контраст', min: 20, max: 300, fmt: v => v + '%' },
    { k: 'wave', label: 'Хвиля: розмах', min: 0, max: 100, fmt: v => v + '%' },
    { k: 'waveL', label: 'Хвиля: довжина', min: 20, max: 300, fmt: v => v + ' px' },
    { k: 'scan', label: 'Сканлінії (ЕПТ)', min: 0, max: 100, fmt: v => v + '%' },
    { k: 'grain', label: 'Зерно', min: 0, max: 100, fmt: v => v + '%' },
    { k: 'lens', label: 'Лінза: опуклість / увігнутість', min: -100, max: 100, fmt: v => (v > 0 ? '+' : '') + v },
    { k: 'swirl', label: 'Вир (закручування)', min: -360, max: 360, fmt: v => v + '°' },
    { k: 'ca', label: 'Хроматична аберація', min: 0, max: 30, fmt: v => (v ? v + ' px' : 'вимкнено') },
    { k: 'relief', label: 'Рельєф (тиснення)', min: 0, max: 100, fmt: v => v + '%' },
    { k: 'edge', label: 'Контури', min: 0, max: 100, fmt: v => v + '%' },
    { k: 'gmap', label: 'Градієнт-мапа', type: 'select', opts: 'GRADS', none: 'Без градієнта' },
    { k: 'vig', label: 'Віньєтка', min: 0, max: 100, fmt: v => v + '%' },
    { k: 'ang', label: 'Нахил візерунка', min: -180, max: 180, fmt: v => v + '°' },
    { k: 'inv', label: 'Інвертувати кольори', type: 'check' },
  ];
  const FX_TIPS = {"px": "Перетворює картинку на великі квадратики-пікселі", "pgrid": "Форма клітинки піксельного ефекту", "pal": "Обмежує кольори готовою палітрою (ретро-консолі, Game Boy тощо)", "dith": "Змішує кольори дрібним візерунком, щоб сховати різкі переходи палітри", "post": "Зменшує кількість відтінків на канал: плакатний вигляд", "hue": "Зсуває всі кольори по колу", "sat": "Робить кольори блідішими або яскравішими", "bri": "Світліше або темніше", "con": "Різниця між світлим і темним", "wave": "Хвилями викривляє картинку: наскільки сильно", "waveL": "Відстань між гребенями хвилі", "scan": "Горизонтальні смужки, як на старому моніторі", "grain": "Плівкове зерно (шум)", "lens": "Роздуває або втягує центр, як лінза", "swirl": "Закручує картинку навколо центра", "ca": "Розсовує червоний і синій канали, як у дешевому обʼєктиві", "relief": "Тиснення: світлі краї виступають, як рельєф", "edge": "Підкреслює контури", "gmap": "Фарбує картинку за яскравістю градієнтом", "vig": "Затемнює краї кадру", "ang": "Нахиляє весь візерунок", "inv": "Міняє кольори на протилежні"};
  const fxCtl = {};
  function onFx() { syncFx(); drawPreview(); saveSettings(); }
  function buildFxUi() {
    const box = $('fxCtls');
    for (const c of FXC) {
      const reset = resetBtn(() => { st.fx[c.k] = DEFAULTS.fx[c.k]; onFx(); });
      const tip = FX_TIPS[c.k] || c.label;
      if (c.type === 'check') {
        const inp = document.createElement('input'); inp.type = 'checkbox';
        inp.addEventListener('input', () => { st.fx[c.k] = inp.checked; onFx(); });
        const lab = document.createElement('label'); lab.className = 'chk fx-chk';
        const sp = document.createElement('span'); sp.textContent = c.label;
        lab.title = tip; lab.append(inp, sp, reset); box.append(lab); fxCtl[c.k] = { inp };
      } else if (c.type === 'select') {
        const sel2 = document.createElement('select'); sel2.setAttribute('aria-label', c.label);
        if (c.list) c.list.forEach(([v, t]) => sel2.add(new Option(t, v)));
        else {
          sel2.add(new Option(c.none, 'none'));
          for (const [key, p] of Object.entries(PMFx[c.opts])) sel2.add(new Option(`${p.name} (${p.rgb.length})`, key));
        }
        sel2.addEventListener('input', () => { st.fx[c.k] = sel2.value; onFx(); });
        const lab = document.createElement('label'); lab.className = 'ctl';
        const sp = document.createElement('span'); sp.textContent = c.label;
        const out = document.createElement('output');
        lab.title = tip; lab.append(sp, out, reset, sel2); box.append(lab); fxCtl[c.k] = { inp: sel2, out };
      } else {
        const lab = document.createElement('label'); lab.className = 'ctl';
        const sp = document.createElement('span'); sp.textContent = c.label;
        const out = document.createElement('output');
        const inp = document.createElement('input'); inp.type = 'range'; inp.min = c.min; inp.max = c.max; inp.step = 1; inp.setAttribute('aria-label', c.label);
        inp.addEventListener('input', () => { st.fx[c.k] = +inp.value; onFx(); });
        lab.title = tip; lab.append(sp, out, reset, inp); box.append(lab); fxCtl[c.k] = { inp, out };
      }
    }
  }
  function syncFx() {
    for (const c of FXC) {
      const el = fxCtl[c.k]; if (!el) continue;
      const v = st.fx[c.k];
      if (c.type === 'check') el.inp.checked = !!v;
      else if (c.type === 'select') { el.inp.value = v; el.out.textContent = ''; }
      else { el.inp.value = v; el.out.textContent = c.fmt(v); }
    }
  }

  /* ---------- випадкове зображення з інтернету ----------
     Єдине місце, де інструмент звертається до мережі. Потрібні сервіси з CORS (інакше полотно «забруднюється»
     й PNG не експортується): пробуємо picsum.photos, потім випадковий файл зі Вікісховища. */
  const loadUrl = url => new Promise((res, rej) => {
    const im = new Image(); im.crossOrigin = 'anonymous';
    im.onload = () => res(im); im.onerror = () => rej(new Error('не завантажилось')); im.src = url;
  });
  const RANDOM_SOURCES = [
    async () => `https://picsum.photos/seed/${Math.random().toString(36).slice(2, 10)}/1200/900`,
    async () => {
      const api = 'https://commons.wikimedia.org/w/api.php?action=query&generator=random&grnnamespace=6&grnlimit=10&prop=imageinfo&iiprop=url%7Cmime&iiurlwidth=1200&format=json&origin=*';
      const j = await (await fetch(api)).json();
      const ok = Object.values((j.query && j.query.pages) || {}).map(p => p.imageinfo && p.imageinfo[0]).filter(i => i && /^image\/(jpeg|png|webp)$/.test(i.mime));
      if (!ok.length) throw new Error('порожньо');
      return ok[Math.floor(Math.random() * ok.length)].thumburl || ok[0].url;
    },
    async () => { // Art Institute of Chicago: картини у суспільному надбанні, IIIF-зображення з CORS
      const page = 1 + Math.floor(Math.random() * 200);
      const j = await (await fetch(`https://api.artic.edu/api/v1/artworks/search?query[term][is_public_domain]=true&fields=image_id&limit=20&page=${page}`)).json();
      const ids = (j.data || []).map(d => d.image_id).filter(Boolean);
      if (!ids.length) throw new Error('порожньо');
      return `https://www.artic.edu/iiif/2/${ids[Math.floor(Math.random() * ids.length)]}/full/843,/0/default.jpg`;
    },
  ];
  $('btnRandom').onclick = async () => {
    const btn = $('btnRandom'); btn.disabled = true; toast('Шукаю випадкове зображення…', 12000);
    let ok = false;
    for (const next of RANDOM_SOURCES) {
      try { setSource(await loadUrl(await next()), 'випадкове'); ok = true; break; } catch (e) { /* пробуємо наступне джерело */ }
    }
    btn.disabled = false;
    toast(ok ? 'Випадкове зображення завантажено' : 'Не вдалося: потрібен інтернет, або сервіси недоступні', ok ? 1800 : 3500);
  };

  /* ---------- файли: вибір, вставка, перетягування ---------- */
  $('btnPick').onclick = () => $('file').click();
  $('file').addEventListener('change', e => { loadFile(e.target.files[0]); e.target.value = ''; });
  $('btnDemo').onclick = () => setSource(makeDemo(), 'демо');
  $('btnPaste').onclick = async () => {
    try {
      for (const item of await navigator.clipboard.read()) {
        const type = item.types.find(t => t.startsWith('image/'));
        if (type) { loadFile(new File([await item.getType(type)], 'з буфера', { type })); return; }
      }
      toast('У буфері немає зображення');
    } catch { toast('Браузер не дає прочитати буфер: натисніть Ctrl+V'); }
  };
  document.addEventListener('paste', e => {
    const f = [...(e.clipboardData?.files || [])].find(x => x.type.startsWith('image/'));
    if (f) { e.preventDefault(); loadFile(f); }
  });
  let dragDepth = 0;
  const hasFiles = e => [...(e.dataTransfer?.types || [])].includes('Files');
  addEventListener('dragenter', e => { if (hasFiles(e)) { dragDepth++; document.body.classList.add('dragging'); } });
  addEventListener('dragleave', e => { if (hasFiles(e) && --dragDepth <= 0) { dragDepth = 0; document.body.classList.remove('dragging'); } });
  addEventListener('dragover', e => { if (hasFiles(e)) e.preventDefault(); });
  addEventListener('drop', e => {
    if (!hasFiles(e)) return;
    e.preventDefault(); dragDepth = 0; document.body.classList.remove('dragging');
    loadFile(e.dataTransfer.files[0]);
  });

  /* ---------- експорт ---------- */
  const toBlob = c => new Promise(res => c.toBlob(res, 'image/png'));
  function download(blob, name) {
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
  // тайл: одна клітинка заданої ширини
  async function tileBlob(w) {
    let r = PMCore.renderCell(src, params(), w, {});
    if (PMFx.hasColorOnly(st.fx)) r = PMFx.process(r, st.fx, 1, true); // лише колір: геометрію тайла не чіпаємо, він лишається безшовним
    return toBlob(toCanvas(r));
  }
  // полотно: клітинка в масштабі превʼю, вимощена на W×H
  async function canvasBlob(W, H) {
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const ctx = c.getContext('2d');
    if (st.mode === 'ros') paintRosette(ctx, W, H, 1);
    else {
      const cw = Math.max(16, Math.round(BASE * st.zoom));
      paintTiles(ctx, W, H, 1, toCanvas(PMCore.renderCell(src, params(), cw, {})), 0, 0);
    }
    if (PMFx.active(st.fx)) applyFx(ctx, W, H, 1, false);
    return toBlob(c);
  }
  const canvasDims = () => {
    const W = clamp(Math.round(+$('inW').value) || DEFAULTS.cw, 16, 8192), H = clamp(Math.round(+$('inH').value) || DEFAULTS.ch, 16, 8192);
    return W * H > (PMFx.active(st.fx) ? 16e6 : 64e6) ? null : [W, H];
  };
  $('btnTile').onclick = async () => {
    if (!src) return;
    if (st.mode === 'ros') { toast('Розетка не вимощується: збережіть полотно'); return; }
    toast('Готуємо тайл…', 8000); await tick();
    try { download(await tileBlob(st.tileW), `pattern-${st.mode}-${st.tileW}px.png`); toast('Тайл збережено'); }
    catch { toast('Не вдалося створити PNG (замало памʼяті?)'); }
  };
  $('btnCanvas').onclick = async () => {
    if (!src) return;
    const d = canvasDims(); if (!d) { toast(PMFx.active(st.fx) ? 'З ефектами полотно не більше 16 мегапікселів' : 'Полотно завелике: не більше 64 мегапікселів'); return; }
    toast('Готуємо полотно…', 8000); await tick();
    try { download(await canvasBlob(d[0], d[1]), `pattern-${st.mode}-${d[0]}x${d[1]}.png`); toast('Полотно збережено'); }
    catch { toast('Не вдалося створити PNG (замало памʼяті?)'); }
  };
  $('btnCopy').onclick = async () => {
    if (!src) return;
    const d = canvasDims(); if (!d) { toast(PMFx.active(st.fx) ? 'З ефектами полотно не більше 16 мегапікселів' : 'Полотно завелике: не більше 64 мегапікселів'); return; }
    if (!navigator.clipboard || typeof ClipboardItem === 'undefined') { toast('Цей браузер не вміє копіювати зображення: збережіть PNG'); return; }
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': tick().then(() => canvasBlob(d[0], d[1])) })]);
      toast('Скопійовано в буфер');
    } catch { toast('Не вдалося скопіювати: збережіть PNG'); }
  };

  function restore(json) {
    restoring = true; applySnap(json); syncControls(); drawSource(); requestRender(); store.set('settings', st); restoring = false;
  }
  function undo() {
    clearTimeout(histTimer); const cur = snap();
    if (cur !== hist[hist.length - 1]) hist.push(cur); // незафіксована правка теж стає кроком
    if (hist.length < 2) { toast('Немає що скасовувати'); return; }
    hist.pop(); restore(hist[hist.length - 1]); toast('Крок скасовано');
  }
  $('btnUndo').onclick = undo;
  addEventListener('keydown', e => {
    const t = document.activeElement, typing = t && (t.tagName === 'SELECT' || (t.tagName === 'INPUT' && t.type === 'number'));
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (window.zbKey ? window.zbKey(e) : e.key.toLowerCase()) === 'z' && !typing) { e.preventDefault(); undo(); }
  });

  // рецепти: іменовані набори ефектів у localStorage
  let recipes = store.get('recipes', []);
  function drawRecipes() {
    const sel2 = $('selRecipe'); sel2.textContent = '';
    sel2.add(new Option(recipes.length ? 'Обрати рецепт…' : 'Рецептів ще немає', ''));
    recipes.forEach((r, i) => sel2.add(new Option(r.name, String(i))));
  }
  $('btnRecipeSave').onclick = () => {
    const name = (prompt('Назва рецепта:', 'Мій рецепт ' + (recipes.length + 1)) || '').trim().slice(0, 40);
    if (!name) return;
    const i = recipes.findIndex(r => r.name === name), r = { name, fx: Object.assign({}, st.fx) };
    if (i >= 0) recipes[i] = r; else recipes.push(r);
    store.set('recipes', recipes); drawRecipes(); toast('Рецепт збережено');
  };
  $('selRecipe').onchange = e => {
    const r = recipes[+e.target.value]; if (!r) return;
    st.fx = Object.assign({}, DEFAULTS.fx, r.fx); syncFx(); drawPreview(); saveSettings(); toast('Рецепт застосовано: ' + r.name);
  };
  $('btnRecipeDel').onclick = () => {
    const i = +$('selRecipe').value; if (!recipes[i] || $('selRecipe').value === '') return;
    recipes.splice(i, 1); store.set('recipes', recipes); drawRecipes(); toast('Рецепт видалено');
  };

  // посилання на стан: #s=base64(JSON); зображення в посилання не входить
  $('btnLink').onclick = async () => {
    const url = location.href.split('#')[0] + '#s=' + btoa(unescape(encodeURIComponent(snap())));
    try { history.replaceState(null, '', url); } catch {}
    try { await navigator.clipboard.writeText(url); toast('Посилання зі станом скопійовано (без зображення)'); } catch { toast('Посилання у адресному рядку'); }
  };
  $('btnJson').onclick = () => { download(new Blob([JSON.stringify({ tool: 'pattern-maker', state: JSON.parse(snap()) }, null, 2)], { type: 'application/json' }), 'pattern-settings.json'); toast('Налаштування збережено'); };
  $('btnImport').onclick = () => $('fileImport').click();
  $('fileImport').onchange = async e => {
    const f = e.target.files[0]; e.target.value = ''; if (!f) return;
    try {
      const d = JSON.parse(await f.text()); if (d.tool !== 'pattern-maker' || !d.state) throw new Error('bad');
      applySnap(JSON.stringify(d.state)); syncControls(); drawSource(); requestRender(); saveSettings(); toast('Налаштування завантажено');
    } catch { toast('Не вдалося прочитати: потрібен файл, збережений цим інструментом', 3200); }
  };
  if (/^#s=/.test(location.hash)) { try { applySnap(decodeURIComponent(escape(atob(location.hash.slice(3))))); hist[0] = snap(); } catch {} }

  /* ---------- меню-іконки ---------- */
  // меню-іконки й довідка «i»: спільний кіт zb-ui.js (ZB.showPanel)

  /* ---------- розміри й запуск ---------- */
  const relayout = () => { layoutSource(); drawSource(); sizePreview(); drawPreview(); };
  if (window.ResizeObserver) { const ro = new ResizeObserver(relayout); ro.observe($('srcWrap')); ro.observe($('prevWrap')); }
  addEventListener('resize', relayout);

  buildFxUi();
  drawRecipes();
  addResets();
  syncControls();
  sizePreview();
  setSource(makeDemo(), 'демо');
})();
