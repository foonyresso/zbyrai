// Sprite Sheet Cleaner: інтерфейс. Математика лежить у sprite-core.js (SpriteCore).
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const C = SpriteCore;
  const store = {
    get(k, d) { try { const v = localStorage.getItem('sc_' + k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem('sc_' + k, JSON.stringify(v)); } catch {} },
  };
  const DEFAULTS = { bgOn: true, color: '#00ff00', tol: 12, fea: 0, mode: 'flood', slice: 'auto', gap: 2, min: 8, cols: 4, rows: 2, trim: false, pal: 0, name: 'sprite', pad: 1, pow2: false, boxes: true, zoom: 0 };
  const st = Object.assign({}, DEFAULTS, store.get('settings', {}));
  const save = () => store.set('settings', st);

  let orig = null, work = null, rects = [], eye = false;
  const toast = (m, ms = 1800) => { const t = $('toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), ms); };
  const hex = c => '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
  const unhex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));

  /* ---------- завантаження зображення ---------- */
  function setImage(source, label) {
    const w = source.naturalWidth || source.width, h = source.naturalHeight || source.height;
    if (!w || !h) { toast('Не вдалося прочитати зображення'); return; }
    if (w * h > 24e6) { toast('Зображення завелике: до 24 мегапікселів'); return; }
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(source, 0, 0);
    orig = g.getImageData(0, 0, w, h);
    $('info').textContent = `${label}: ${w}×${h} px`;
    if (!store.get('colorTouched', false)) { st.color = hex(C.detectBg(orig)); }
    recompute();
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
  addEventListener('paste', e => { const f = [...(e.clipboardData?.files || [])].find(x => /^image\//.test(x.type)); if (f) loadFile(f); });
  const wrap = $('wrap');
  ['dragenter', 'dragover'].forEach(n => addEventListener(n, e => { e.preventDefault(); wrap.classList.add('drag'); }));
  ['dragleave', 'drop'].forEach(n => addEventListener(n, e => { e.preventDefault(); if (n === 'drop' || e.target === document.documentElement) wrap.classList.remove('drag'); if (n === 'drop') loadFile(e.dataTransfer.files[0]); }));

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
  $('btnDemo').onclick = () => { st.color = '#00ff00'; setImage(makeDemo(), 'демо'); };

  /* ---------- конвеєр ---------- */
  function recompute() {
    if (!orig) return;
    let img = orig;
    if (st.bgOn) img = C.removeBg(img, { color: unhex(st.color), tol: st.tol, feather: st.fea, mode: st.mode });
    let pal = [];
    if (st.pal >= 2) { const q = C.quantize(img, st.pal); img = q.img; pal = q.palette; }
    work = img;
    if (st.slice === 'auto') rects = C.findSprites(work, { gap: st.gap, minArea: st.min });
    else if (st.slice === 'grid') {
      rects = C.gridRects(work.width, work.height, st.cols, st.rows);
      if (st.trim) rects = rects.map(r => C.trimRect(work, r)).filter(Boolean);
    } else rects = [];
    $('swatches').replaceChildren(...pal.map(c => { const i = document.createElement('i'); i.style.background = hex(c); i.title = hex(c); return i; }));
    $('sliceInfo').textContent = st.slice === 'none' ? 'Нарізки немає: експортується весь лист.' : `Знайдено спрайтів: ${rects.length}`;
    draw();
  }
  function draw() {
    const cv = $('cv'); if (!work) { cv.width = cv.height = 0; return; }
    const zoom = st.zoom || Math.max(1, Math.min(8, Math.floor(Math.min((wrap.clientWidth - 4) / work.width, (wrap.clientHeight - 4) / work.height) * 100) / 100));
    const W = Math.round(work.width * zoom), H = Math.round(work.height * zoom);
    cv.width = W; cv.height = H; cv.style.width = W + 'px'; cv.style.height = H + 'px';
    const g = cv.getContext('2d'), t = toCanvas(work);
    g.imageSmoothingEnabled = false; g.drawImage(t, 0, 0, W, H);
    if (st.boxes) {
      g.lineWidth = 1; g.font = '11px ui-monospace, monospace'; g.textBaseline = 'top';
      rects.forEach((r, i) => {
        g.strokeStyle = 'rgba(230,193,74,.95)'; g.strokeRect(Math.round(r.x * zoom) + .5, Math.round(r.y * zoom) + .5, Math.round(r.w * zoom) - 1, Math.round(r.h * zoom) - 1);
        const lab = String(i + 1), x = Math.round(r.x * zoom) + 2, y = Math.round(r.y * zoom) + 2;
        g.fillStyle = 'rgba(9,9,12,.75)'; g.fillRect(x - 1, y - 1, g.measureText(lab).width + 4, 13); g.fillStyle = '#f3d97e'; g.fillText(lab, x + 1, y);
      });
    }
  }
  if (window.ResizeObserver) new ResizeObserver(() => draw()).observe(wrap);

  // піпетка: клік по картинці бере колір з оригіналу
  $('cv').addEventListener('click', e => {
    if (!eye || !orig) return;
    const b = $('cv').getBoundingClientRect(), x = Math.floor((e.clientX - b.left) / b.width * orig.width), y = Math.floor((e.clientY - b.top) / b.height * orig.height), i = (y * orig.width + x) * 4;
    st.color = hex([orig.data[i], orig.data[i + 1], orig.data[i + 2]]); store.set('colorTouched', true);
    eye = false; wrap.classList.remove('eye'); $('btnEye').classList.remove('on'); sync(); save(); recompute();
  });
  $('btnEye').onclick = () => { eye = !eye; wrap.classList.toggle('eye', eye); $('btnEye').classList.toggle('on', eye); };
  $('btnAuto').onclick = () => { if (!orig) return; st.color = hex(C.detectBg(orig)); store.set('colorTouched', false); sync(); save(); recompute(); };

  /* ---------- керування ---------- */
  function sync() {
    $('bgOn').checked = st.bgOn; $('bgColor').value = st.color;
    $('rTol').value = st.tol; $('oTol').textContent = st.tol + '%'; $('rFea').value = st.fea; $('oFea').textContent = st.fea + '%'; $('selMode').value = st.mode;
    $('selSlice').value = st.slice; $('boxAuto').hidden = st.slice !== 'auto'; $('boxGrid').hidden = st.slice !== 'grid';
    $('rGap').value = st.gap; $('oGap').textContent = st.gap + ' px'; $('rMin').value = st.min; $('oMin').textContent = st.min + ' px';
    $('nCols').value = st.cols; $('nRows').value = st.rows; $('cTrim').checked = st.trim;
    $('rPal').value = st.pal; $('oPal').textContent = st.pal >= 2 ? st.pal : 'вимкнено';
    $('tName').value = st.name; $('nPad').value = st.pad; $('cPow2').checked = st.pow2; $('cBoxes').checked = st.boxes; $('selZoom').value = String(st.zoom);
  }
  const bind = (id, key, conv = v => v, ev = 'input', redo = true) => $(id).addEventListener(ev, e => {
    const t = e.target; st[key] = conv(t.type === 'checkbox' ? t.checked : t.value);
    if (key === 'color') store.set('colorTouched', true);
    sync(); save(); if (redo) recompute(); else draw();
  });
  const num = (lo, hi) => v => Math.min(hi, Math.max(lo, Math.round(+v) || lo));
  bind('bgOn', 'bgOn'); bind('bgColor', 'color'); bind('rTol', 'tol', Number); bind('rFea', 'fea', Number); bind('selMode', 'mode', String);
  bind('selSlice', 'slice', String); bind('rGap', 'gap', Number); bind('rMin', 'min', Number); bind('nCols', 'cols', num(1, 64)); bind('nRows', 'rows', num(1, 64));
  bind('cTrim', 'trim'); bind('rPal', 'pal', Number);
  bind('tName', 'name', v => v.replace(/[^\w\-а-яіїєґА-ЯІЇЄҐ]/g, '_') || 'sprite', 'input', false);
  bind('nPad', 'pad', num(0, 16), 'input', false); bind('cPow2', 'pow2', Boolean, 'input', false);
  bind('cBoxes', 'boxes', Boolean, 'input', false); bind('selZoom', 'zoom', Number, 'input', false);

  /* ---------- експорт ---------- */
  const toCanvas = img => { const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; c.getContext('2d').putImageData(new ImageData(img.data, img.width, img.height), 0, 0); return c; };
  const pngBlob = img => new Promise((res, rej) => toCanvas(img).toBlob(b => (b ? res(b) : rej(new Error('png'))), 'image/png'));
  const pngBytes = async img => new Uint8Array(await (await pngBlob(img)).arrayBuffer());
  function download(blob, name) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }
  const nm = i => `${st.name}_${String(i + 1).padStart(String(rects.length).length < 2 ? 2 : String(rects.length).length, '0')}`;

  $('btnSheet').onclick = async () => { if (!work) return toast('Спершу завантажте зображення'); download(await pngBlob(work), `${st.name}_sheet.png`); toast('Лист збережено'); };
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

  sync();
  $('btnDemo').click();
})();
