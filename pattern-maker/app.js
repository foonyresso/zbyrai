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
  const DEFAULTS = { mode: 'p6m', a: 1, size: .4, rot: 0, k: .5, pixel: false, zoom: .5, outline: false, tileW: 1024, cw: 1920, ch: 1080 };
  const st = Object.assign({}, DEFAULTS, store.get('settings', {}));
  if (!PMCore.MODES[st.mode]) st.mode = DEFAULTS.mode;
  const saveSettings = () => store.set('settings', st);

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
    src = { data: id.data, width: w, height: h, canvas: c };
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
    const g = PMCore.geometry(st.mode, st.a), p = params();
    return g.poly.map(([x, y]) => PMCore.regionToSource(p, g, x, y));
  };
  function drawSource() {
    if (!src || !sv.w) return;
    const cvs = $('src'), ctx = cvs.getContext('2d'), dpr = devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, sv.w, sv.h);
    ctx.imageSmoothingEnabled = !st.pixel;
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
    cell = toCanvas(PMCore.renderCell(src, params(), w, { nearest: st.pixel, ssaa }));
    drawPreview();
  }

  /* ---------- превʼю ---------- */
  function sizePreview() {
    const cvs = $('prev'), wrap = $('prevWrap'), dpr = devicePixelRatio || 1;
    const w = wrap.clientWidth, h = wrap.clientHeight;
    if (!w || !h) return;
    cvs.width = Math.round(w * dpr); cvs.height = Math.round(h * dpr);
  }
  function drawPreview() {
    const cvs = $('prev'), ctx = cvs.getContext('2d'), dpr = devicePixelRatio || 1, W = cvs.width, H = cvs.height;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#09090c'; ctx.fillRect(0, 0, W, H);
    if (!cell) return;
    const k = st.zoom * BASE / cell.width * dpr; // пікселів екрана на піксель клітинки
    ctx.imageSmoothingEnabled = !st.pixel; ctx.imageSmoothingQuality = 'high';
    ctx.save();
    ctx.translate(view.px * dpr, view.py * dpr); ctx.scale(k, k);
    ctx.fillStyle = ctx.createPattern(cell, 'repeat');
    ctx.fillRect(-view.px * dpr / k, -view.py * dpr / k, W / k, H / k);
    ctx.restore();
    if (st.outline) {
      const tw = cell.width * k, th = cell.height * k, ox = view.px * dpr, oy = view.py * dpr;
      ctx.strokeStyle = 'rgba(232,210,158,.75)'; ctx.lineWidth = dpr; ctx.setLineDash([6 * dpr, 5 * dpr]);
      ctx.beginPath();
      for (let x = ((ox % tw) + tw) % tw; x < W; x += tw) { ctx.moveTo(Math.round(x) + .5, 0); ctx.lineTo(Math.round(x) + .5, H); }
      for (let y = ((oy % th) + th) % th; y < H; y += th) { ctx.moveTo(0, Math.round(y) + .5); ctx.lineTo(W, Math.round(y) + .5); }
      ctx.stroke(); ctx.setLineDash([]);
    }
  }
  let pdrag = null;
  $('prev').addEventListener('pointerdown', e => {
    pdrag = { x: e.clientX, y: e.clientY, px: view.px, py: view.py };
    $('prev').setPointerCapture(e.pointerId); $('prev').classList.add('drag');
  });
  $('prev').addEventListener('pointermove', e => {
    if (!pdrag) return;
    view.px = pdrag.px + e.clientX - pdrag.x; view.py = pdrag.py + e.clientY - pdrag.y; drawPreview();
  });
  const endPdrag = () => { pdrag = null; $('prev').classList.remove('drag'); };
  $('prev').addEventListener('pointerup', endPdrag);
  $('prev').addEventListener('pointercancel', endPdrag);
  $('prev').addEventListener('wheel', e => {
    e.preventDefault();
    const r = $('prev').getBoundingClientRect(), cx = e.clientX - r.left, cy = e.clientY - r.top;
    const z0 = st.zoom, z1 = clamp(z0 * Math.exp(-e.deltaY * .0015), .1, 3);
    view.px = cx - (cx - view.px) * z1 / z0; view.py = cy - (cy - view.py) * z1 / z0; // точка під курсором лишається на місці
    st.zoom = z1; syncControls(); drawPreview(); saveSettings();
  }, { passive: false });

  /* ---------- режими й елементи керування ---------- */
  const ICONS = {
    pmm: '<rect x="4" y="4" width="16" height="16" rx="1.5"/><path d="M12 4v16M4 12h16"/>',
    p4m: '<rect x="4" y="4" width="16" height="16" rx="1.5"/><path d="M12 4v16M4 12h16M4 4l16 16M20 4 4 20"/>',
    p6m: '<path d="M12 3l7.8 4.5v9L12 21l-7.8-4.5v-9z"/><path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9"/>',
    p3m1: '<path d="M12 3.5 21 19.5H3z"/><path d="M12 3.5v16M3 19.5l13.5-8M21 19.5 7.5 11.5"/>',
    tex: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 12c4-6 12 6 16 0"/>',
  };
  const modesBox = $('modes');
  Object.entries(PMCore.MODES).forEach(([key, m]) => {
    const b = document.createElement('button');
    b.className = 'mode'; b.dataset.mode = key; b.type = 'button';
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
    $('cPixel').checked = st.pixel; $('cOutline').checked = st.outline;
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
  bind('cPixel', t => { st.pixel = t.checked; });
  bind('rZoom', t => { st.zoom = +t.value / 100; }, false);
  bind('cOutline', t => { st.outline = t.checked; }, false);
  $('selTile').addEventListener('change', e => { st.tileW = +e.target.value; saveSettings(); });
  for (const id of ['inW', 'inH']) $(id).addEventListener('change', e => {
    const v = clamp(Math.round(+e.target.value) || DEFAULTS[id === 'inW' ? 'cw' : 'ch'], 16, 8192);
    st[id === 'inW' ? 'cw' : 'ch'] = v; syncControls(); saveSettings();
  });
  $('btnReset').onclick = () => { st.zoom = DEFAULTS.zoom; view.px = 0; view.py = 0; syncControls(); drawPreview(); saveSettings(); };

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
    return toBlob(toCanvas(PMCore.renderCell(src, params(), w, { nearest: st.pixel })));
  }
  // полотно: клітинка в масштабі превʼю, вимощена на W×H
  async function canvasBlob(W, H) {
    const cw = Math.max(16, Math.round(BASE * st.zoom));
    const tile = toCanvas(PMCore.renderCell(src, params(), cw, { nearest: st.pixel }));
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const ctx = c.getContext('2d'); ctx.fillStyle = ctx.createPattern(tile, 'repeat'); ctx.fillRect(0, 0, W, H);
    return toBlob(c);
  }
  const canvasDims = () => {
    const W = clamp(Math.round(+$('inW').value) || DEFAULTS.cw, 16, 8192), H = clamp(Math.round(+$('inH').value) || DEFAULTS.ch, 16, 8192);
    return W * H > 64e6 ? null : [W, H];
  };
  $('btnTile').onclick = async () => {
    if (!src) return;
    toast('Готуємо тайл…', 8000); await tick();
    try { download(await tileBlob(st.tileW), `pattern-${st.mode}-${st.tileW}px.png`); toast('Тайл збережено'); }
    catch { toast('Не вдалося створити PNG (замало памʼяті?)'); }
  };
  $('btnCanvas').onclick = async () => {
    if (!src) return;
    const d = canvasDims(); if (!d) { toast('Полотно завелике: не більше 64 мегапікселів'); return; }
    toast('Готуємо полотно…', 8000); await tick();
    try { download(await canvasBlob(d[0], d[1]), `pattern-${st.mode}-${d[0]}x${d[1]}.png`); toast('Полотно збережено'); }
    catch { toast('Не вдалося створити PNG (замало памʼяті?)'); }
  };
  $('btnCopy').onclick = async () => {
    if (!src) return;
    const d = canvasDims(); if (!d) { toast('Полотно завелике: не більше 64 мегапікселів'); return; }
    if (!navigator.clipboard || typeof ClipboardItem === 'undefined') { toast('Цей браузер не вміє копіювати зображення: збережіть PNG'); return; }
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': tick().then(() => canvasBlob(d[0], d[1])) })]);
      toast('Скопійовано в буфер');
    } catch { toast('Не вдалося скопіювати: збережіть PNG'); }
  };

  /* ---------- розміри й запуск ---------- */
  const relayout = () => { layoutSource(); drawSource(); sizePreview(); drawPreview(); };
  if (window.ResizeObserver) { const ro = new ResizeObserver(relayout); ro.observe($('srcWrap')); ro.observe($('prevWrap')); }
  addEventListener('resize', relayout);

  syncControls();
  sizePreview();
  setSource(makeDemo(), 'демо');
})();
