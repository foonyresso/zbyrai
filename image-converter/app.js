// Конвертер зображень: інтерфейс (пачка фото, сітка кадрів, меню, обробка у воркерах, ZIP, JSON). Логіка — у convert-core.js, малювання — у convert-render.js.
(function () {
  var C = window.ConvertCore, Z = window.ZipCore, $ = function (id) { return document.getElementById(id); };
  var LS = 'ic_';
  var st = JSON.parse(JSON.stringify(C.DEFAULTS));
  st.thumb = 220; st.tiles = []; st.sel = null; st.busy = false; st.stop = false;
  var avail = { webp: true, jpeg: true, png: true, avif: false };
  var pool = window.ConvertPool.create(Math.max(1, Math.min(4, (navigator.hardwareConcurrency || 4) - 1)));
  var seq = 0;

  function save() { try { localStorage.setItem(LS + 'cfg', JSON.stringify(cfgOnly())); } catch (e) {} }
  function cfgOnly() { var o = {}; Object.keys(C.DEFAULTS).forEach(function (k) { o[k] = st[k]; }); o.thumb = st.thumb; return o; }
  function applyCfg(s) {
    if (!s) return;
    if (C.FORMATS[s.fmt]) st.fmt = s.fmt;
    if (s.q) Object.keys(st.q).forEach(function (k) { if (+s.q[k] > 0) st.q[k] = C.clamp(+s.q[k] | 0, 1, 100); });
    st.maxKB = C.clamp(+s.maxKB || 0, 0, 50000);
    if (/^#[0-9a-f]{6}$/i.test(s.bg)) st.bg = s.bg;
    if (C.RATIOS.some(function (r) { return r[0] === s.ratio; })) st.ratio = s.ratio;
    st.ca = C.clamp(+s.ca || 16, 1, 100); st.cb = C.clamp(+s.cb || 9, 1, 100);
    st.w = C.clamp(+s.w || 1920, 16, 12000); st.maxSide = C.clamp(+s.maxSide || 0, 0, 12000);
    st.noUp = s.noUp !== false; st.suffix = typeof s.suffix === 'string' ? s.suffix.slice(0, 20) : st.suffix;
    if (+s.thumb) st.thumb = C.clamp(+s.thumb, 120, 420);
  }
  try { applyCfg(JSON.parse(localStorage.getItem(LS + 'cfg') || 'null')); } catch (e) {}

  var toastT;
  function toast(t) { var el = $('toast'); el.textContent = t; el.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function () { el.classList.remove('on'); }, 1800); }

  // ---- меню ----
  // меню-іконки й довідка «i»: спільний кіт zb-ui.js

  // ---- завдання для фото ----
  function aspect(t) { return t.iw / t.ih; }
  function frameR(t) { return C.frameAspect(st, aspect(t)); }
  function jobFor(t) {
    var F = C.FORMATS[st.fmt], r = frameR(t), c = C.cropRect(t.iw, t.ih, r, t.z, t.fx, t.fy), o = C.outSize(st, r, c.sw, c.sh);
    return { sx: c.sx, sy: c.sy, sw: c.sw, sh: c.sh, w: o.w, h: o.h, type: F.mime, lossy: F.lossy, quality: st.q[st.fmt] / 100, maxBytes: F.lossy ? st.maxKB * 1024 : 0, bg: st.bg, alpha: F.alpha };
  }
  function keyOf(job) { return JSON.stringify(job); }

  // ---- картка фото ----
  function frameStyle(t) {
    var r = frameR(t), c = C.cropRect(t.iw, t.ih, r, t.z, t.fx, t.fy);
    t.frame.style.aspectRatio = String(r);
    var im = t.img.style;
    im.width = (100 / c.vw) + '%'; im.height = (100 / c.vh) + '%';
    im.left = (-c.left * 100 / c.vw) + '%'; im.top = (-c.top * 100 / c.vh) + '%';
  }
  function capText(t) {
    var o = C.outSize(st, frameR(t), C.cropRect(t.iw, t.ih, frameR(t), t.z, t.fx, t.fy).sw, C.cropRect(t.iw, t.ih, frameR(t), t.z, t.fx, t.fy).sh);
    t.szEl.textContent = t.iw + '×' + t.ih + ' · ' + C.fmtBytes(t.file.size) + ' → ' + o.w + '×' + o.h;
    var ok = t.res && t.res.key === keyOf(jobFor(t));
    if (ok) {
      t.resEl.textContent = C.fmtBytes(t.res.blob.size) + ' (' + (C.saving(t.file.size, t.res.blob.size) >= 0 ? '−' : '+') + Math.abs(C.saving(t.file.size, t.res.blob.size)) + '%)' + (t.res.over ? ' · вище ліміту' : '');
      t.resEl.className = 'res' + (t.res.over || t.res.blob.size > t.file.size ? ' bad' : '');
    } else { t.resEl.textContent = t.res ? 'застаріло, перерахуй' : ''; t.resEl.className = 'res'; }
  }
  function refreshTile(t) { frameStyle(t); capText(t); }
  function refreshAll() { st.tiles.forEach(refreshTile); summary(); }

  function buildCard(t) {
    var d = document.createElement('div'); d.className = 'card'; d.style.animationDelay = Math.min(300, (seq++ % 12) * 25) + 'ms';
    d.innerHTML = '<button class="del" title="Прибрати це фото зі списку">×</button><div class="frame" title="Перетягни, щоб посунути кадр; колесо мишки наближає; подвійний клік скидає кадр"><img alt=""></div><div class="cap"><span class="nm"></span><span class="sz"></span><span class="res"></span></div>';
    t.el = d; t.frame = d.querySelector('.frame'); t.img = d.querySelector('img'); t.szEl = d.querySelector('.sz'); t.resEl = d.querySelector('.res');
    d.querySelector('.nm').textContent = t.file.name; d.querySelector('.nm').title = t.file.name;
    t.img.src = t.url;
    d.querySelector('.del').onclick = function (e) { e.stopPropagation(); removeTile(t); };
    d.onclick = function () { select(t); };
    var drag = null;
    t.frame.addEventListener('pointerdown', function (e) {
      select(t); var r = frameR(t), c = C.cropRect(t.iw, t.ih, r, t.z, t.fx, t.fy), b = t.frame.getBoundingClientRect();
      drag = { x: e.clientX, y: e.clientY, fx: t.fx, fy: t.fy, c: c, w: b.width, h: b.height };
      t.frame.setPointerCapture(e.pointerId); t.frame.classList.add('drag');
    });
    t.frame.addEventListener('pointermove', function (e) {
      if (!drag) return;
      // зсув у частках оригіналу: екранні пікселі рамки відповідають видимій частці vw/vh
      var dl = -(e.clientX - drag.x) / drag.w * drag.c.vw, dt = -(e.clientY - drag.y) / drag.h * drag.c.vh;
      var fl = 1 - drag.c.vw, ft = 1 - drag.c.vh;
      if (fl > 0.0005) t.fx = C.clamp(drag.fx + dl / fl, 0, 1);
      if (ft > 0.0005) t.fy = C.clamp(drag.fy + dt / ft, 0, 1);
      refreshTile(t); syncSel(); summary();
    });
    var end = function () { drag = null; t.frame.classList.remove('drag'); };
    t.frame.addEventListener('pointerup', end); t.frame.addEventListener('pointercancel', end);
    t.frame.addEventListener('dblclick', function () { t.z = 1; t.fx = t.fy = 0.5; refreshTile(t); syncSel(); summary(); });
    t.frame.addEventListener('wheel', function (e) { e.preventDefault(); select(t); t.z = C.clamp(t.z * (e.deltaY < 0 ? 1.08 : 1 / 1.08), 1, 5); refreshTile(t); syncSel(); summary(); }, { passive: false });
    refreshTile(t);
    var nx = null; for (var i = 0; i < st.tiles.length; i++) if (st.tiles[i].ord > t.ord && st.tiles[i].el) { nx = st.tiles[i].el; break; }
    $('grid').insertBefore(d, nx);
  }

  function select(t) {
    if (st.sel && st.sel.el) st.sel.el.classList.remove('sel');
    st.sel = t; if (t) t.el.classList.add('sel');
    syncSel();
  }
  function syncSel() {
    var t = st.sel; $('noSel').hidden = !!t; $('selCtls').hidden = !t;
    if (!t) return;
    $('selZ').value = t.z; $('zV').textContent = '×' + t.z.toFixed(2); $('selFx').value = Math.round(t.fx * 100); $('selFy').value = Math.round(t.fy * 100);
    var o = jobFor(t); $('selInfo').textContent = t.file.name + ': ' + t.iw + '×' + t.ih + ' → ' + o.w + '×' + o.h + ' px';
  }
  function removeTile(t) {
    var i = st.tiles.indexOf(t); if (i < 0) return;
    st.tiles.splice(i, 1); t.el.remove(); try { URL.revokeObjectURL(t.url); } catch (e) {}
    if (st.sel === t) { st.sel = null; syncSel(); }
    summary();
  }

  $('selZ').oninput = function () { var t = st.sel; if (!t) return; t.z = +this.value; refreshTile(t); syncSel(); summary(); };
  $('selFx').oninput = function () { var t = st.sel; if (!t) return; t.fx = this.value / 100; refreshTile(t); syncSel(); summary(); };
  $('selFy').oninput = function () { var t = st.sel; if (!t) return; t.fy = this.value / 100; refreshTile(t); syncSel(); summary(); };
  $('selCrop').onclick = function () { var t = st.sel; if (!t) return; t.z = 1; t.fx = t.fy = 0.5; refreshTile(t); syncSel(); summary(); };
  $('selDel').onclick = function () { if (st.sel) removeTile(st.sel); };
  $('selAll').onclick = function () { var s = st.sel; if (!s) return; st.tiles.forEach(function (t) { t.z = s.z; t.fx = s.fx; t.fy = s.fy; }); refreshAll(); toast('Кадр застосовано до всіх'); };
  $('btnResetAll').onclick = function () { st.tiles.forEach(function (t) { t.z = 1; t.fx = t.fy = 0.5; }); refreshAll(); syncSel(); };
  $('btnClear').onclick = function () { st.stop = true; pool.clear(); st.tiles.forEach(function (t) { try { URL.revokeObjectURL(t.url); } catch (e) {} }); st.tiles = []; $('grid').innerHTML = ''; select(null); summary(); };
  document.addEventListener('keydown', function (e) { if (e.key === 'Delete' && st.sel && !/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) removeTile(st.sel); });

  // ---- підсумок ----
  function summary() {
    var n = st.tiles.length, before = 0, after = 0, done = 0;
    st.tiles.forEach(function (t) { before += t.file.size; if (t.res && t.res.key === keyOf(jobFor(t))) { after += t.res.blob.size; done++; } });
    var s = 'Фото: ' + n;
    if (n) s += ' · ' + C.fmtBytes(before);
    if (n && done === n) s += ' → ' + C.fmtBytes(after) + ' (' + (after <= before ? '−' : '+') + Math.abs(C.saving(before, after)) + '%)';
    else if (done) s += ' · пораховано ' + done + ' з ' + n;
    $('count').textContent = s; $('empty').hidden = n > 0 || loading > 0; syncSel();
    st.tiles.forEach(capText);
  }

  // ---- додавання фото: мініатюри з'являються по одній ----
  var loading = 0, ord = 0;
  function insertSorted(t) { var i = st.tiles.length; while (i > 0 && st.tiles[i - 1].ord > t.ord) i--; st.tiles.splice(i, 0, t); }
  async function makeThumb(file) {
    var bmp = await window.ConvertRender.decode(file), iw = bmp.width, ih = bmp.height, k = Math.min(1, 480 / Math.max(iw, ih));
    var c = document.createElement('canvas'); c.width = Math.max(1, Math.round(iw * k)); c.height = Math.max(1, Math.round(ih * k));
    var x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(bmp, 0, 0, c.width, c.height); bmp.close && bmp.close();
    var blob = await new Promise(function (r) { c.toBlob(r, 'image/webp', 0.82); });
    return { iw: iw, ih: ih, url: URL.createObjectURL(blob) };
  }
  async function addFiles(files) {
    var list = Array.prototype.filter.call(files, function (f) { return /^image\//.test(f.type) || /\.(avif|webp|jpe?g|png|gif|bmp)$/i.test(f.name); });
    if (!list.length) return toast('Потрібні файли-картинки');
    loading += list.length; $('empty').hidden = true;
    var bad = 0, idx = 0, base = ord; ord += list.length;
    async function worker() {
      while (idx < list.length) {
        var my = idx++, f = list[my];
        try { var th = await makeThumb(f); var t = { ord: base + my, file: f, iw: th.iw, ih: th.ih, url: th.url, z: 1, fx: 0.5, fy: 0.5, res: null }; insertSorted(t); buildCard(t); }
        catch (e) { bad++; }
        loading--; summary();
        await new Promise(function (r) { setTimeout(r, 30); });
      }
    }
    await Promise.all([worker(), worker(), worker()]);
    if (bad) toast('Не вдалося прочитати файлів: ' + bad);
    summary();
  }
  $('btnAdd').onclick = function () { $('fileImg').click(); };
  $('fileImg').onchange = function () { addFiles(this.files); this.value = ''; };
  var drop = $('drop');
  ['dragenter', 'dragover'].forEach(function (e) { drop.addEventListener(e, function (ev) { ev.preventDefault(); drop.classList.add('over'); }); });
  ['dragleave', 'drop'].forEach(function (e) { drop.addEventListener(e, function (ev) { ev.preventDefault(); drop.classList.remove('over'); }); });
  drop.addEventListener('drop', function (ev) { if (ev.dataTransfer && ev.dataTransfer.files.length) addFiles(ev.dataTransfer.files); });

  // ---- налаштування ----
  var seg = $('fmtSeg');
  Object.keys(C.FORMATS).forEach(function (k) {
    var b = document.createElement('button'); b.dataset.fmt = k; b.textContent = C.FORMATS[k].label; b.title = 'Формат ' + C.FORMATS[k].label + ': ' + C.FORMATS[k].note;
    b.onclick = function () { st.fmt = k; syncUI(); save(); refreshAll(); };
    seg.appendChild(b);
  });
  var qp = $('qPresets');
  ['Мала вага', 'Рекомендовано', 'Максимум'].forEach(function (nm, i) {
    var b = document.createElement('button'); b.textContent = nm; b.dataset.i = i; b.title = i === 1 ? 'Збалансована якість: майже не видно різниці, файл значно менший' : i === 0 ? 'Найменший файл, видно легке погіршення' : 'Найкраща якість, файл більший';
    b.onclick = function () { var F = C.FORMATS[st.fmt]; if (F.q.length) st.q[st.fmt] = F.q[i]; syncUI(); save(); refreshAll(); };
    qp.appendChild(b);
  });
  var rs = $('ratio');
  C.RATIOS.forEach(function (r) { var o = document.createElement('option'); o.value = r[0]; o.textContent = r[1]; rs.appendChild(o); });
  var qk = $('quick');
  [3840, 2560, 1920, 1280, 1024, 512].forEach(function (v) {
    var b = document.createElement('button'); b.textContent = v; b.dataset.v = v; b.title = 'Поставити ' + v + ' px';
    b.onclick = function () { if (st.ratio === 'orig') st.maxSide = v; else st.w = v; syncUI(); save(); refreshAll(); };
    qk.appendChild(b);
  });
  function ratioNow() { return st.ratio === 'orig' ? 1 : C.frameAspect(st, 1); }
  function syncUI() {
    var F = C.FORMATS[st.fmt];
    seg.querySelectorAll('button').forEach(function (b) { var k = b.dataset.fmt; b.classList.toggle('on', k === st.fmt); b.disabled = !avail[k]; if (!avail[k]) b.title = C.FORMATS[k].label + ': цей браузер не вміє зберігати такий формат'; });
    $('fmtNote').textContent = F.note;
    $('qBox').hidden = !F.lossy; $('bgBox').hidden = F.alpha;
    $('q').value = st.q[st.fmt] || 80; $('qV').textContent = st.q[st.fmt] || '';
    qp.querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', F.q[+b.dataset.i] === st.q[st.fmt]); });
    $('maxKB').value = st.maxKB; $('bg').value = st.bg; $('suffix').value = st.suffix;
    var ex = C.outName('фото.png', st.suffix, F.ext, {}); $('nameEx').textContent = 'Приклад: фото.png → ' + ex;
    rs.value = st.ratio; $('customRatio').hidden = st.ratio !== 'custom'; $('ca').value = st.ca; $('cb').value = st.cb;
    var orig = st.ratio === 'orig'; $('fixedSize').hidden = orig; $('origSize').hidden = !orig;
    $('w').value = st.w; $('h').value = C.heightFor(st.w, ratioNow()); $('maxSide').value = st.maxSide;
    qk.querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', +b.dataset.v === (orig ? st.maxSide : st.w)); });
    $('noUp').checked = st.noUp;
    $('sizeInfo').textContent = orig ? (st.maxSide ? 'Довга сторона кожного фото стане не більшою за ' + st.maxSide + ' px, пропорції лишаються.' : 'Розмір у пікселях не змінюється (лише формат).') : 'Усі картинки будуть ' + st.w + '×' + C.heightFor(st.w, ratioNow()) + ' px; що не вміщується, обрізається кадром, який можна посунути на фото.';
    $('grid').style.setProperty('--th', st.thumb + 'px'); $('thumb').value = st.thumb;
  }
  $('q').oninput = function () { st.q[st.fmt] = +this.value; syncUI(); save(); refreshAll(); };
  $('maxKB').onchange = function () { st.maxKB = C.clamp(+this.value || 0, 0, 50000); syncUI(); save(); refreshAll(); };
  $('bg').oninput = function () { st.bg = this.value; save(); refreshAll(); };
  $('suffix').oninput = function () { st.suffix = this.value.replace(/[\\\/:*?"<>|]+/g, ''); var F = C.FORMATS[st.fmt]; $('nameEx').textContent = 'Приклад: фото.png → ' + C.outName('фото.png', st.suffix, F.ext, {}); save(); };
  rs.onchange = function () { st.ratio = rs.value; syncUI(); save(); refreshAll(); };
  $('ca').onchange = function () { st.ca = C.clamp(+this.value || 1, 1, 100); syncUI(); save(); refreshAll(); };
  $('cb').onchange = function () { st.cb = C.clamp(+this.value || 1, 1, 100); syncUI(); save(); refreshAll(); };
  $('w').onchange = function () { st.w = C.clamp(+this.value || st.w, 16, 12000); syncUI(); save(); refreshAll(); };
  $('h').onchange = function () { st.w = C.clamp(C.widthFor(+this.value || 16, ratioNow()), 16, 12000); syncUI(); save(); refreshAll(); };
  $('maxSide').onchange = function () { st.maxSide = C.clamp(+this.value || 0, 0, 12000); syncUI(); save(); refreshAll(); };
  $('noUp').onchange = function () { st.noUp = this.checked; save(); refreshAll(); };
  $('thumb').oninput = function () { st.thumb = +this.value; $('grid').style.setProperty('--th', st.thumb + 'px'); save(); };

  // ---- обробка ----
  async function runTiles(tiles) {
    if (st.busy) return false;
    st.busy = true; st.stop = false;
    var todo = tiles.filter(function (t) { return !(t.res && t.res.key === keyOf(jobFor(t))); }), done = 0, fail = 0, idx = 0;
    var btn = $('btnCalc'); btn.textContent = 'Стоп';
    async function lane() {
      while (idx < todo.length && !st.stop) {
        var t = todo[idx++], job = jobFor(t), k = keyOf(job);
        try { var r = await pool.run(t.file, job); t.res = { key: k, blob: r.blob, over: r.over }; } catch (e) { if (st.stop) return; fail++; }
        done++; btn.textContent = 'Стоп ' + done + '/' + todo.length; capText(t); summary();
      }
    }
    var lanes = []; for (var i = 0; i < 6; i++) lanes.push(lane());
    await Promise.all(lanes);
    st.busy = false; btn.textContent = 'Порахувати розміри';
    if (fail) toast('Не вдалося обробити файлів: ' + fail);
    summary();
    return !st.stop && !fail;
  }
  $('btnCalc').onclick = function () { if (st.busy) { st.stop = true; pool.clear(); return; } if (!st.tiles.length) return toast('Спершу додай фото'); runTiles(st.tiles); };

  function dl(name, blob) { var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000); }
  function ready(t) { return t.res && t.res.key === keyOf(jobFor(t)); }
  $('btnZip').onclick = async function () {
    if (!st.tiles.length) return toast('Спершу додай фото');
    if (st.busy) return toast('Зачекай, обробка триває');
    toast('Конвертую…'); await runTiles(st.tiles);
    if (st.stop || !st.tiles.every(ready)) return;
    var used = {}, ext = C.FORMATS[st.fmt].ext;
    var entries = st.tiles.map(function (t) { return { name: C.outName(t.file.name, st.suffix, ext, used), blob: t.res.blob }; });
    var groups = Z.splitEntries(entries);
    for (var i = 0; i < groups.length; i++) {
      var zip = await Z.makeZip(groups[i]);
      dl('zbyrai-images' + (groups.length > 1 ? '-' + (i + 1) : '') + '.zip', zip);
      if (i < groups.length - 1) await new Promise(function (r) { setTimeout(r, 800); });
    }
    toast(groups.length > 1 ? 'Архівів: ' + groups.length : 'ZIP готовий');
  };
  $('btnOne').onclick = async function () {
    var t = st.sel; if (!t) return toast('Спершу вибери фото');
    if (st.busy) return toast('Зачекай, обробка триває');
    await runTiles([t]); if (ready(t)) dl(C.outName(t.file.name, st.suffix, C.FORMATS[st.fmt].ext, {}), t.res.blob);
  };

  // ---- JSON ----
  // Формат версії 1: налаштування + кадри фото за іменем файлу.
  function cfgJson() {
    var o = cfgOnly(); o.app = 'image-converter'; o.v = 1;
    o.tiles = st.tiles.map(function (t) { return { name: t.file.name, z: +t.z.toFixed(3), fx: +t.fx.toFixed(3), fy: +t.fy.toFixed(3) }; });
    return JSON.stringify(o, null, 2);
  }
  $('btnJson').onclick = function () { dl('image-converter.json', new Blob([cfgJson()], { type: 'application/json' })); };
  $('btnCopyJson').onclick = function () { (navigator.clipboard ? navigator.clipboard.writeText(cfgJson()) : Promise.reject()).then(function () { toast('Скопійовано!'); }, function () { toast('Не вдалося скопіювати'); }); };
  $('btnImport').onclick = function () { $('fileImport').click(); };
  $('fileImport').onchange = function () {
    var f = this.files[0]; this.value = ''; if (!f) return;
    var rd = new FileReader();
    rd.onload = function () {
      try {
        var d = JSON.parse(rd.result); if (d.app !== 'image-converter') throw 0;
        applyCfg(d); var n = 0;
        if (Array.isArray(d.tiles)) d.tiles.forEach(function (q) {
          st.tiles.forEach(function (t) { if (q && t.file.name === q.name) { t.z = C.clamp(+q.z || 1, 1, 5); t.fx = C.clamp(q.fx == null ? 0.5 : +q.fx, 0, 1); t.fy = C.clamp(q.fy == null ? 0.5 : +q.fy, 0, 1); n++; } });
        });
        syncUI(); save(); refreshAll(); syncSel();
        toast('Налаштування завантажено' + (n ? ', кадрів: ' + n : ''));
      } catch (e) { toast('Це не файл конвертера'); }
    };
    rd.readAsText(f);
  };

  // ---- підтримка форматів браузером ----
  function probe(type) {
    return new Promise(function (res) {
      try { var c = document.createElement('canvas'); c.width = c.height = 2; c.toBlob(function (b) { res(!!b && b.type === type); }, type, 0.5); } catch (e) { res(false); }
    });
  }
  Promise.all([probe('image/webp'), probe('image/avif')]).then(function (r) {
    avail.webp = r[0]; avail.avif = r[1];
    if (!avail[st.fmt]) st.fmt = 'jpeg';
    syncUI(); refreshAll();
  });

  syncUI(); summary();
})();
