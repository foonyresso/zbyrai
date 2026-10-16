// Інтерфейс макетника: майстер (тип, формат, дизайн, список) і редактор розворотів. Усе в браузері, нічого не надсилається.
(function () {
  var S = AlbumState, R = AlbumRender, PR = AlbumPrint, DS = AlbumDesigns, X = AlbumExport;
  var $ = function (id) { return document.getElementById(id); };
  var st = S.newState(), files = new Map(), imgs = new Map(), numMap = new Map();
  var cur = 0, sel = null, step = 1, dragMode = 'swap', guides = false, drag = null, pickRef = null, lastInfo = null, panel = null;
  var cv = $('cv'), ctx = cv.getContext('2d');
  function toast(t) { var e = $('toast'); e.textContent = t; e.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(function () { e.classList.remove('on'); }, 2600); }
  function el(tag, cls, text, title) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; if (title) e.title = title; return e; }

  // ---------- Майстер ----------
  var STEPS = ['Тип друку', 'Формат', 'Дизайн', 'Списки'];
  function showStep(n) {
    step = n; $('wizard').hidden = false; $('work').hidden = true;
    for (var i = 1; i <= 4; i++) $('w' + i).hidden = i !== n;
    var ol = $('steps'); ol.textContent = '';
    STEPS.forEach(function (s, i) { ol.appendChild(el('li', i + 1 === n ? 'on' : '', (i + 1) + '. ' + s)); });
    if (n === 1) fillTypes(); if (n === 2) fillFormats(); if (n === 3) fillDesigns(); if (n === 4) fillForm();
  }
  function card(parent, name, small, on, title, fn) {
    var b = el('button', on ? 'on' : '', name, title); if (small) b.appendChild(el('small', '', small)); b.onclick = fn; parent.appendChild(b);
  }
  function fillTypes() {
    var c = $('typeCards'); c.textContent = '';
    PR.TYPES.forEach(function (t) { card(c, t.name, t.note, t.id === st.typeId, 'Тип друку «' + t.name + '»', function () { st.typeId = t.id; showStep(2); }); });
  }
  function fillFormats() {
    var c = $('fmtCards'), t = PR.TYPES.filter(function (x) { return x.id === st.typeId; })[0]; c.textContent = '';
    t.formats.forEach(function (f) { var z = PR.spreadSize(f); card(c, PR.FORMATS[f].label, 'розворот ' + z.W + '×' + z.H + ' мм (заглушка)', f === st.fmtId, 'Формат ' + PR.FORMATS[f].label, function () { st.fmtId = f; showStep(3); }); });
    $('fmtNote').textContent = 'Розміри сторінок поки номінальні: точні значення Цифролабу (з вильотами) треба внести у data/print-types.js.';
  }
  function fillDesigns() {
    var tabs = $('catTabs'), c = $('designCards'); tabs.textContent = ''; c.textContent = '';
    DS.CATEGORIES.forEach(function (cat) { var b = el('button', cat.id === st.catId ? 'on' : '', cat.name, 'Категорія дизайнів: ' + cat.name); b.onclick = function () { st.catId = cat.id; fillDesigns(); }; tabs.appendChild(b); });
    var cat = DS.CATEGORIES.filter(function (x) { return x.id === st.catId; })[0] || DS.CATEGORIES[0];
    if (!cat.designs.length) c.appendChild(el('p', 'hint', 'Дизайнів у цій категорії поки немає.'));
    cat.designs.forEach(function (id) { var d = DS.DESIGNS[id]; card(c, d.name, 'світлий, підписи під портретами', id === st.designId, 'Дизайн «' + d.name + '»', function () { st.designId = id; showStep(4); }); });
  }
  function fillForm() {
    $('instFull').value = st.inst.full; $('instShort').value = st.inst.short; $('year').value = st.year;
    $('children').value = st.children; $('noAlbum').value = st.noAlbum; $('teachers').value = st.teachers;
  }
  document.querySelectorAll('[data-back]').forEach(function (b) { b.onclick = function () { showStep(+b.dataset.back); }; });
  $('btnOk').onclick = function () {
    st.inst.full = $('instFull').value.trim(); st.inst.short = $('instShort').value.trim(); st.year = $('year').value.trim();
    st.children = $('children').value; st.noAlbum = $('noAlbum').value; st.teachers = $('teachers').value;
    st.order = []; S.people(st);
    if (!st.spreads.length) S.buildSpreads(st); else S.resizePortrait(st);
    cur = Math.min(cur, st.spreads.length - 1); sel = null; showEditor();
  };

  // ---------- Редактор ----------
  function showEditor() { $('wizard').hidden = true; $('work').hidden = false; refresh(); }
  function refresh() { redraw(); thumbs(); updateInfo(); }
  function sizeCanvas() {
    var z = PR.spreadSize(st.fmtId), box = $('drop'), cs = getComputedStyle(box);
    var aw = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight), ah = box.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    var k = Math.max(0.5, Math.min(aw / z.W, ah / z.H)), dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(z.W * k * dpr); cv.height = Math.round(z.H * k * dpr); return cv.width / z.W;
  }
  function redraw() {
    if ($('work').hidden) return;
    var ppm = sizeCanvas();
    lastInfo = R.draw(ctx, st, cur, numMap, imgs, { pxPerMm: ppm, preview: true, sel: sel, guides: guides });
  }
  function label(i) { var t = st.spreads[i].type; return t === 'cover' ? 'Обкладинка' : t === 'first' ? 'Перший' : (i - 1) + (t === 'portrait' ? ' портрети' : ' групові'); }
  var thTimer;
  function thumbs() { clearTimeout(thTimer); thTimer = setTimeout(buildThumbs, 60); }
  function buildThumbs() {
    var strip = $('strip'), z = PR.spreadSize(st.fmtId); strip.textContent = '';
    st.spreads.forEach(function (sp, i) {
      var d = el('div', 'th' + (i === cur ? ' on' : '')), c = document.createElement('canvas'), k = 0.3;
      c.width = Math.round(z.W * k); c.height = Math.round(z.H * k);
      R.draw(c.getContext('2d'), st, i, numMap, imgs, { pxPerMm: k, preview: false });
      d.appendChild(c); d.appendChild(el('span', '', label(i)));
      d.onclick = function () { cur = i; sel = null; refresh(); };
      if (i >= 2) {
        d.draggable = true;
        d.ondragstart = function (e) { e.dataTransfer.setData('text/plain', 'sp' + i); };
        d.ondragover = function (e) { if ((e.dataTransfer.types || []).indexOf('Files') < 0) { e.preventDefault(); d.classList.add('dragover'); } };
        d.ondragleave = function () { d.classList.remove('dragover'); };
        d.ondrop = function (e) {
          var m = /^sp(\d+)$/.exec(e.dataTransfer.getData('text/plain')); d.classList.remove('dragover'); if (!m) return; e.preventDefault();
          var from = +m[1]; if (from === i) return; var s = st.spreads.splice(from, 1)[0]; st.spreads.splice(i, 0, s); cur = i; refresh();
        };
      }
      strip.appendChild(d);
    });
    var on = strip.querySelector('.on'); if (on && on.scrollIntoView) on.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
  function updateInfo() {
    var ps = S.people(st), tl = S.teachers(st), ok = ps.filter(function (p) { return S.photoFor(p, numMap); }).length, tk = tl.filter(function (p) { return S.photoFor(p, numMap); }).length;
    $('count').textContent = 'Портрети: ' + ok + '/' + ps.length + (tl.length ? ' · вчителі: ' + tk + '/' + tl.length : '') + ' · фото в пам\'яті: ' + files.size;
    var k = S.portraitK(st);
    $('kInfo').textContent = 'Дітей у списку: ' + ps.length + '. Зараз ' + k + ' на розворот, портретних розворотів: ' + st.spreads.filter(function (s) { return s.type === 'portrait'; }).length + '. Зайві вікна лишаються білими.';
    $('kSel').value = st.kOverride ? String(st.kOverride) : '';
    $('spInfo').textContent = 'Розворот: ' + label(cur) + '.';
  }

  // ---------- Фото ----------
  function loadImage(f) {
    return new Promise(function (res) {
      var u = URL.createObjectURL(f), im = new Image(); im.onload = function () { res(im); }; im.onerror = function () { URL.revokeObjectURL(u); res(null); }; im.src = u;
    });
  }
  async function addFiles(list, targetRef) {
    var names = [], bad = 0;
    for (var f of Array.from(list)) {
      if (!/^image\//.test(f.type) && !/\.(jpe?g|png|webp|gif|bmp)$/i.test(f.name)) continue;
      var im = await loadImage(f); if (!im) { bad++; continue; }
      files.set(f.name, f); imgs.set(f.name, im); names.push(f.name);
    }
    numMap = S.numMapOf(Array.from(files.keys()));
    var sp = st.spreads[cur], placed = 0;
    if (sp.type === 'group') names.forEach(function (n) { if (sp.slots.indexOf(n) < 0) { sp.slots.push(n); placed++; } });
    else if (targetRef && targetRef.t !== 'person' && targetRef.t !== 'teacher' && names.length) { S.setPhoto(st, cur, targetRef, names[0]); placed = 1; }
    else if (sp.type === 'cover' && names.length) { sp.slots[0] = names[0]; placed = 1; }
    else if (sp.type === 'first') {
      var free = (lastInfo ? lastInfo.items : []).filter(function (it) { return it.ref.t === 'slot' && !it.name; });
      names.forEach(function (n, i) { if (free[i] && S.personByFile(st, n) === null) { S.setPhoto(st, cur, free[i].ref, n); placed++; } });
    }
    refresh();
    toast('Додано файлів: ' + names.length + (placed ? ', на розворот поставлено: ' + placed : '') + (bad ? ', не прочитано: ' + bad : ''));
  }
  $('btnAdd').onclick = function () { pickRef = null; $('fileImg').click(); };
  $('btnFolder').onclick = function () { pickRef = null; $('fileDir').click(); };
  $('fileImg').onchange = function (e) { addFiles(e.target.files, pickRef); e.target.value = ''; pickRef = null; };
  $('fileDir').onchange = function (e) { addFiles(e.target.files, null); e.target.value = ''; };

  // ---------- Взаємодія з полотном ----------
  function mmAt(e) {
    var r = cv.getBoundingClientRect(), W = lastInfo.W, H = lastInfo.H, k = Math.min(r.width / W, r.height / H), ox = (r.width - W * k) / 2, oy = (r.height - H * k) / 2;
    return { x: (e.clientX - r.left - ox) / k, y: (e.clientY - r.top - oy) / k, k: k };
  }
  function hit(p) {
    if (!lastInfo) return null; var it = lastInfo.items;
    for (var i = it.length - 1; i >= 0; i--) { var r = it[i].rect; if (p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h) return it[i]; }
    return null;
  }
  cv.addEventListener('pointerdown', function (e) {
    var p = mmAt(e), it = hit(p); sel = it ? it.ref : null;
    drag = it ? { it: it, x: e.clientX, y: e.clientY, p: p, crop: !!(e.altKey || dragMode === 'crop'), moved: false } : null;
    if (drag) cv.setPointerCapture(e.pointerId); redraw();
  });
  cv.addEventListener('pointermove', function (e) {
    if (!drag) return;
    if (Math.abs(e.clientX - drag.x) + Math.abs(e.clientY - drag.y) > 4) drag.moved = true;
    if (drag.moved && drag.crop && drag.it.name) {
      var p = mmAt(e), img = imgs.get(drag.it.name), c = R.crop(st, drag.it.name), r = drag.it.rect;
      if (img) {
        var s = Math.max(r.w / img.naturalWidth, r.h / img.naturalHeight) * c.z, fw = img.naturalWidth * s - r.w, fh = img.naturalHeight * s - r.h;
        if (fw > 0.01) c.fx = Math.min(1, Math.max(0, c.fx - (p.x - drag.p.x) / fw));
        if (fh > 0.01) c.fy = Math.min(1, Math.max(0, c.fy - (p.y - drag.p.y) / fh));
        drag.p = p; redraw();
      }
    }
    cv.style.cursor = drag.moved ? 'grabbing' : '';
  });
  cv.addEventListener('pointerup', function (e) {
    if (!drag) return; var d = drag; drag = null; cv.style.cursor = '';
    if (d.moved && !d.crop) {
      var t = hit(mmAt(e));
      if (t && t !== d.it) { if (S.swapRefs(st, cur, d.it.ref, t.ref)) { sel = t.ref; refresh(); } else toast('Ці вікна не можна поміняти місцями'); }
    } else if (!d.moved && !d.it.name && (d.it.kind === 'blank' || d.it.kind === 'group' || d.it.kind === 'cover' || d.it.kind === 'portrait1')) {
      pickRef = d.it.ref; $('fileImg').click();
    }
  });
  cv.addEventListener('wheel', function (e) {
    var it = hit(mmAt(e)); if (!it || !it.name) return; e.preventDefault();
    var c = R.crop(st, it.name); c.z = Math.min(4, Math.max(1, c.z * (e.deltaY < 0 ? 1.08 : 1 / 1.08))); redraw(); thumbs();
  }, { passive: false });
  cv.addEventListener('dblclick', function (e) { var it = hit(mmAt(e)); if (it && it.name) { st.crops[it.name] = { z: 1, fx: 0.5, fy: 0.35 }; refresh(); } });
  var box = $('drop');
  box.addEventListener('dragover', function (e) { if ((e.dataTransfer.types || []).indexOf('Files') >= 0) { e.preventDefault(); box.classList.add('over'); } });
  box.addEventListener('dragleave', function () { box.classList.remove('over'); });
  box.addEventListener('drop', function (e) {
    if (!e.dataTransfer.files.length) return; e.preventDefault(); box.classList.remove('over');
    var it = lastInfo ? hit(mmAt(e)) : null; addFiles(e.dataTransfer.files, it ? it.ref : null);
  });
  function removeSel() {
    if (!sel) return toast('Спершу вибери фото'); 
    if (S.removePhoto(st, cur, sel)) { sel = null; refresh(); } else toast('Портрети й фото вчителів беруться за номером; щоб прибрати, вилучи файл або номер зі списку');
  }
  document.addEventListener('keydown', function (e) {
    if ($('work').hidden || /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
    if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); removeSel(); }
    if (e.key === 'ArrowLeft' && cur > 0) { cur--; sel = null; refresh(); }
    if (e.key === 'ArrowRight' && cur < st.spreads.length - 1) { cur++; sel = null; refresh(); }
  });
  window.addEventListener('resize', redraw);

  // ---------- Меню й кнопки ----------
  function openPanel(name) {
    panel = panel === name ? null : name;
    $('drawer').hidden = !panel; $('work').classList.toggle('shift', !!panel);
    document.querySelectorAll('.rail [data-panel]').forEach(function (b) { b.classList.toggle('on', b.dataset.panel === panel); });
    document.querySelectorAll('.drawer section').forEach(function (s) { s.classList.toggle('on', s.dataset.panel === panel); });
    setTimeout(redraw, 170);
  }
  document.querySelectorAll('.rail [data-panel]').forEach(function (b) { b.onclick = function () { openPanel(b.dataset.panel); }; });
  $('drawerX').onclick = function () { openPanel(panel); };
  document.querySelector('.rail [data-go=list]').onclick = function () { showStep(4); };
  document.querySelector('.rail [data-go=album]').onclick = function () { showStep(1); };
  $('kSel').onchange = function () { st.kOverride = +$('kSel').value || null; S.resizePortrait(st); if (cur >= st.spreads.length) cur = st.spreads.length - 1; sel = null; refresh(); };
  $('btnLeft').onclick = function () { if (S.moveSpread(st, cur, -1)) { cur--; refresh(); } };
  $('btnRight').onclick = function () { if (S.moveSpread(st, cur, 1)) { cur++; refresh(); } };
  $('btnShuffle').onclick = function () { var sp = st.spreads[cur]; if (sp.type !== 'group') return toast('Перерозкладка діє на групових розворотах'); sp.seed = 1 + Math.floor(Math.random() * 99999); refresh(); };
  $('btnRemovePhoto').onclick = removeSel;
  $('btnDel').onclick = function () {
    if (cur < 2) return toast('Обкладинку й перший розворот видалити не можна');
    if (!confirm('Видалити цей розворот?')) return; st.spreads.splice(cur, 1); cur = Math.min(cur, st.spreads.length - 1); sel = null; refresh();
  };
  document.querySelectorAll('#dragMode [data-dm]').forEach(function (b) { b.onclick = function () { dragMode = b.dataset.dm; document.querySelectorAll('#dragMode button').forEach(function (x) { x.classList.toggle('on', x === b); }); }; });
  $('guides').onchange = function () { guides = $('guides').checked; redraw(); };
  $('btnPlus').onclick = function () { $('addMenu').hidden = !$('addMenu').hidden; };
  document.querySelectorAll('[data-add]').forEach(function (b) {
    b.onclick = function () { $('addMenu').hidden = true; st.spreads.splice(cur < 1 ? 2 : cur + 1, 0, S.mkSpread(b.dataset.add)); cur = cur < 1 ? 2 : cur + 1; sel = null; refresh(); };
  });

  // ---------- Збереження й експорт ----------
  function needEditor() { if (!st.spreads.length || $('work').hidden) { toast('Спершу створи макет (кроки 1–4)'); return true; } return false; }
  $('btnCopyJson').onclick = function () { navigator.clipboard.writeText(S.toJSON(st)).then(function () { toast('JSON скопійовано'); }, function () { toast('Не вдалося скопіювати'); }); };
  $('btnJson').onclick = function () { X.download(new Blob([S.toJSON(st)], { type: 'application/json' }), 'album.json'); };
  $('btnImport').onclick = function () { $('fileImport').click(); };
  $('fileImport').onchange = function (e) {
    var f = e.target.files[0]; e.target.value = ''; if (!f) return;
    f.text().then(function (t) { st = S.fromJSON(t); cur = 0; sel = null; showEditor(); toast('Макет завантажено. Фото додай знову (за назвами файлів вони стануть на місця)'); }).catch(function (er) { toast('Помилка імпорту: ' + er.message); });
  };
  function renderBlob(i, mime) {
    var z = PR.spreadSize(st.fmtId), k = 300 / 25.4, c = document.createElement('canvas'); c.width = Math.round(z.W * k); c.height = Math.round(z.H * k);
    R.draw(c.getContext('2d'), st, i, numMap, imgs, { pxPerMm: k, preview: false });
    return new Promise(function (res) { c.toBlob(res, mime, 0.93); });
  }
  function one(mime, ext) { if (needEditor()) return; renderBlob(cur, mime).then(function (b) { X.download(b, S.exportName(st, cur) + ext); }); }
  $('btnPng').onclick = function () { one('image/png', '.png'); };
  $('btnJpg').onclick = function () { one('image/jpeg', '.jpg'); };
  $('btnZip').onclick = async function () {
    if (needEditor()) return; toast('Готую архів…'); var out = [];
    for (var i = 0; i < st.spreads.length; i++) { var b = await renderBlob(i, 'image/jpeg'); out.push({ name: S.exportName(st, i) + '.jpg', data: new Uint8Array(await b.arrayBuffer()) }); }
    X.download(X.zip(out), 'album-spreads.zip'); toast('Архів готовий');
  };
  $('btnPdf').onclick = async function () {
    if (needEditor()) return; toast('Готую PDF…'); var z = PR.spreadSize(st.fmtId), pages = [];
    for (var i = 0; i < st.spreads.length; i++) { var b = await renderBlob(i, 'image/jpeg'); pages.push({ jpeg: new Uint8Array(await b.arrayBuffer()), w: Math.round(z.W * 300 / 25.4), h: Math.round(z.H * 300 / 25.4), wMm: z.W, hMm: z.H }); }
    X.download(X.pdf(pages), 'album.pdf'); toast('PDF готовий');
  };

  showStep(1);
})();
