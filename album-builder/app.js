// Інтерфейс макетника: майстер (тип, формат, дизайн, список) і редактор розворотів. Усе в браузері, нічого не надсилається.
(function () {
  var S = AlbumState, R = AlbumRender, PR = AlbumPrint, DS = AlbumDesigns, X = AlbumExport;
  var $ = function (id) { return document.getElementById(id); };
  var st = S.newState(), files = new Map(), imgs = new Map(), numMap = new Map();
  var cur = 0, sel = null, step = 1, dragMode = 'swap', guides = true, drag = null, pickRef = null, lastInfo = null, panel = null;
  var cv = $('cv'), ctx = cv.getContext('2d');
  function toast(t) { var e = $('toast'); e.textContent = t; e.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(function () { e.classList.remove('on'); }, 2600); }
  function el(tag, cls, text, title) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; if (title) e.title = title; return e; }

  // ---------- Майстер ----------
  var STEPS = ['Тип друку', 'Формат', 'Дизайн', 'Списки'];
  function showStep(n) {
    step = n; $('wizard').hidden = false; $('work').hidden = true; document.body.classList.remove('editing'); closeMenu();
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
    $('children').value = st.children; $('noAlbum').value = st.noAlbum; buildPairs(); $('teachers').value = st.teachers;
  }
  document.querySelectorAll('[data-back]').forEach(function (b) { b.onclick = function () { showStep(+b.dataset.back); }; });
  // Подвійні альбоми: окреме поле на кожну пару (два рядки), біля кожного хрестик
  var pairVals = [];
  function buildPairs() {
    pairVals = (Array.isArray(st.pairs) ? st.pairs : []).slice(); var box = $('pairBox'); box.textContent = '';
    pairVals.forEach(function (v, i) {
      var w = el('label', 'pairf', 'Подвійний альбом ' + (i + 1) + ': два рядки «0000 0000 Прізвище Ім\'я» або «0000 Прізвище Ім\'я»', 'Двоє дітей з одного альбому: кожна дитина в окремому рядку, той самий формат'), t = document.createElement('textarea'), x = el('button', 'x2', '✕', 'Прибрати цей подвійний альбом');
      t.rows = 2; t.value = v; t.placeholder = '0005 Іваненко Іван\n0006 Коваль Марія'; t.oninput = function () { pairVals[i] = t.value; };
      x.type = 'button'; x.onclick = function () { pairVals.splice(i, 1); st.pairs = pairVals.slice(); buildPairs(); };
      w.appendChild(t); w.appendChild(x); box.appendChild(w);
    });
  }
  $('btnPair').onclick = function () { st.pairs = pairVals.concat(['']); buildPairs(); var ts = $('pairBox').querySelectorAll('textarea'); if (ts.length) ts[ts.length - 1].focus(); };
  $('btnOk').onclick = function () {
    st.inst.full = $('instFull').value.trim(); st.inst.short = $('instShort').value.trim(); st.year = $('year').value.trim();
    st.children = AlbumParse.pad4($('children').value); st.noAlbum = AlbumParse.pad4($('noAlbum').value); st.pairs = pairVals.map(AlbumParse.pad4).filter(function (v) { return v.trim(); }); st.teachers = AlbumParse.pad4($('teachers').value);
    $('children').value = st.children; $('noAlbum').value = st.noAlbum; $('teachers').value = st.teachers;
    st.order = []; S.people(st);
    if (!st.spreads.length) S.buildSpreads(st); else S.resizePortrait(st);
    cur = Math.min(cur, st.spreads.length - 1); sel = null; showEditor();
  };

  // ---------- Редактор ----------
  function showEditor() { $('wizard').hidden = true; $('work').hidden = false; document.body.classList.add('editing'); refresh(); }
  var saveT;
  function save() { clearTimeout(saveT); saveT = setTimeout(function () { try { localStorage.setItem('albumBuilder.v1', S.toJSON(st)); } catch (e) {} }, 300); }
  function refresh() { redraw(); thumbs(); updateInfo(); if (panel === 'obj') buildObjPanel(); save(); }
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
    if (AlbumFonts.used(st).length) AlbumFonts.ensure(st).then(function (w) { if (w) { redraw(); thumbs(); } });
  }
  function label(i) { var t = st.spreads[i].type, n = String(i).padStart(2, '0'); return t === 'cover' ? 'Обкладинка' : n + (t === 'first' ? ' індивід.' : t === 'portrait' ? ' портрети' : ' групові'); }
  // Стрічка дітей: фіксована ширина кнопок (довгі ПІБ обрізаються), видно лише коли поточний розворот індивідуальний.
  function buildKidStrip() {
    var strip = $('kidStrip'), on = S.isIndividual(st, cur); strip.hidden = !on; if (!on) return;
    st.seen = st.seen || {}; var curOwn = S.ownerOf(st); if (curOwn && !st.seen[st.spreads[cur].id + '|' + curOwn.id]) { st.seen[st.spreads[cur].id + '|' + curOwn.id] = 1; save(); }
    var indiv = []; st.spreads.forEach(function (x, i) { if (S.isIndividual(st, i)) indiv.push(i); });
    strip.textContent = ''; var kids = S.albumKids(st), own = S.ownerOf(st), keep = st.owner;
    kids.forEach(function (p, i) {
      var b = el('button', 'kid' + (own && own.id === p.id ? ' on' : ''), String(i + 1).padStart(2, '0') + ' ' + p.name, 'Показати цю дитину: ' + p.name);
      st.owner = p.id; var it = S.slotsFor(st, cur, numMap).items, ph = it.filter(function (x) { return x.kind === 'cover' || x.kind === 'portrait1'; })[0];
      if (!ph || !ph.name) b.classList.add('miss'); if (!ph) b.classList.remove('miss');
      var dots = el('span', 'dots'); indiv.forEach(function (si) { var seen = st.seen[st.spreads[si].id + '|' + p.id]; dots.appendChild(el('i', seen ? '' : 'new', null, label(si) + (seen ? ': переглянуто' : ': ще не переглянуто'))); }); b.appendChild(dots);
      b.onclick = function () { S.setOwnerIndex(st, i); refresh(); };
      strip.appendChild(b);
    });
    st.owner = keep; if (!kids.length) strip.appendChild(el('span', 'hint', 'У списку немає дітей'));
    var on2 = strip.querySelector('.on'); if (on2 && on2.scrollIntoView) on2.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
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
    var ps = S.people(st), tl = S.teachers(st), pst = S.portraitStats(st), tk = tl.filter(function (p) { return S.photoFor(p, numMap); }).length;
    $('count').textContent = 'Портрети на розворотах: ' + pst.placed + '/' + pst.total + (tl.length ? ' · вчителі: ' + tk + '/' + tl.length : '') + ' · фото в пам\'яті: ' + files.size;
    var k = S.portraitK(st);
    $('kInfo').textContent = 'Дітей у списку: ' + ps.length + '. Зараз ' + k + ' на розворот, портретних розворотів: ' + st.spreads.filter(function (s) { return s.type === 'portrait'; }).length + '. Зайві вікна лишаються білими.';
    $('kSel').value = st.kOverride ? String(st.kOverride) : '';
    fontSample();
    $('spInfo').textContent = 'Розворот: ' + label(cur) + '.';
    var z = S.zoneOf(st, cur), t = st.spreads[cur].type;
    $('roundRow').hidden = t !== 'group'; $('roundIn').value = st.spreads[cur].round != null ? st.spreads[cur].round : st.round || 0;
    $('btnLeftPhotos').hidden = t !== 'first';
    $('btnAdd').textContent = t === 'cover' || t === 'first' ? '＋ Портрети' : '＋ Додати фото';
    $('btnLeftPhotos').textContent = S.teachers(st).length ? '＋ Вчителі' : '＋ Загальне фото';
    buildKidStrip();
    $('btnShuffle').hidden = $('btnStyle').hidden = $('btnLayouts').hidden = t !== 'group';
    if (t !== 'group') $('layoutStrip').hidden = true; else if (!$('layoutStrip').hidden) buildLayoutStrip();
    $('btnStyle').textContent = 'Стиль: ' + ({ mosaic: 'мозаїка', rows: 'ряди', scrap: 'вклеєні', tpl: 'готова' }[st.spreads[cur].style || 'mosaic']);
    $('spineIn').value = st.spine == null ? PR.spreadSize(st.fmtId).spine : st.spine;
    $('coverNoPhoto').checked = !!st.coverNoPhoto;
    $('safeIn').value = st.safe == null ? PR.spreadSize(st.fmtId).safe : st.safe; $('coverSafeIn').value = st.coverSafe == null ? 15 : st.coverSafe;
    $('sizeInfo').textContent = 'Файл розвороту: ' + Math.round(z.W * 300 / 25.4) + '×' + Math.round(z.H * 300 / 25.4) + ' px (' + z.W + '×' + z.H + ' мм, 300 dpi). Файлів буде: ' + S.exportPlan(st).length + '.';
    $('safeInfo').textContent = 'Виліт ' + z.bleed + ' мм (точно обріжеться); безпечна межа ' + z.safe + ' мм від обрізу' + (t === 'cover' ? ' (для обкладинки)' : '') + ': текст і підписи тримаємо всередині. Значення типові, не з сайту друкарні; вводь свої.';
  }

  // ---------- Фото ----------
  function loadImage(f) {
    return new Promise(function (res) {
      var u = URL.createObjectURL(f), im = new Image(); im.onload = function () { res(im); }; im.onerror = function () { URL.revokeObjectURL(u); res(null); }; im.src = u;
    });
  }
  function portraitHas(n) { return st.spreads.some(function (s) { return s.type === 'portrait' && Object.keys(s.extra).some(function (j) { return s.extra[j] === n; }); }); }
  async function addFiles(list, targetRef, side) {
    var names = [], bad = 0;
    for (var f of Array.from(list)) {
      if (!/^image\//.test(f.type) && !/\.(jpe?g|png|webp|gif|bmp)$/i.test(f.name)) continue;
      var im = await loadImage(f); if (!im) { bad++; continue; }
      files.set(f.name, f); imgs.set(f.name, im); names.push(f.name);
    }
    numMap = S.numMapOf(Array.from(files.keys()));
    var sp = st.spreads[cur], placed = 0;
    if (sp.type === 'group') {
      var fresh = names.filter(function (n) { return sp.slots.indexOf(n) < 0; });
      if (sp.style === 'tpl' && fresh.length > S.freeCount(sp)) { refresh(); tooMany(fresh); return; }
      placed = S.addGroupPhotos(st, cur, fresh).placed;
    }
    else if (sp.type === 'portrait') {
      var rest = names.slice();
      if (targetRef && targetRef.t === 'extra' && rest.length) { S.setPhoto(st, cur, targetRef, rest.shift()); placed++; }
      S.sortForPortrait(st, rest.filter(function (n) { return !portraitHas(n); })).forEach(function (n) { S.placePortrait(st, cur, n); placed++; });
    }
    else if (sp.type === 'cover' || sp.type === 'first') {
      var rest2 = names.slice(), tl = S.teachers(st);
      if (targetRef && rest2.length) { S.setPhoto(st, cur, targetRef, rest2.shift()); placed++; }
      if (sp.type === 'cover') placed += S.assignUnmatched(st, 'cover', rest2, numMap, cur);
      else if (side === 'left') {
        if (tl.length) placed += S.assignTeachers(st, cur, rest2, numMap);
        else if (rest2.length) { sp.slots[0] = rest2[0]; placed++; }
      } else placed += S.assignUnmatched(st, 'fright', rest2, numMap, cur);
    }
    refresh();
    var auto = (sp.type === 'cover' || sp.type === 'first') && !placed && names.length ? ' (фото за номерами з назв підхоплено автоматично)' : '';
    toast('Додано файлів: ' + names.length + (placed ? ', поставлено: ' + placed : '') + auto + (bad ? ', не прочитано: ' + bad : ''));
  }
  var pickSide = 'right';
  $('btnAdd').onclick = function () { pickRef = null; pickSide = 'right'; $('fileImg').click(); };
  $('btnLeftPhotos').onclick = function () { pickRef = null; pickSide = 'left'; $('fileImg').click(); };
  $('btnFolder').onclick = function () { pickRef = null; $('fileDir').click(); };
  $('fileImg').onchange = function (e) { addFiles(e.target.files, pickRef, pickSide); e.target.value = ''; pickRef = null; pickSide = 'right'; };
  $('fileDir').onchange = function (e) { addFiles(e.target.files, null, 'right'); e.target.value = ''; };

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
  // Напис під курсором (обкладинка, перший розворот): його ключ для st.tf
  function hitText(p) {
    var t = lastInfo && lastInfo.texts || [];
    for (var i = t.length - 1; i >= 0; i--) { var r = t[i].rect; if (p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h) return t[i].key; }
    return null;
  }
  function selFor(p, it) { if (it) return it.ref; var k = hitText(p); return k ? { t: 'text', key: k } : { t: 'bg' }; }
  cv.addEventListener('pointerdown', function (e) {
    closeMenu(); var p = mmAt(e), it = hit(p); sel = selFor(p, it); if (panel === 'obj') buildObjPanel();
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
      if (t && t !== d.it) { if (d.it.span || t.span) toast('Об\'єднані вікна не міняються місцями: спершу роз\'єднай (правий клік)'); else if (S.swapRefs(st, cur, d.it.ref, t.ref)) { sel = t.ref; refresh(); } else toast('Ці вікна не можна поміняти місцями'); }
    } else if (!d.moved && d.it.kind === 'teacher' || !d.moved && d.it.kind === 'group' && st.spreads[cur].type === 'first') {
      if (panel !== 'obj') openPanel('obj'); else buildObjPanel();
      if (!d.it.name) { pickRef = d.it.ref; pickSide = 'left'; $('fileImg').click(); }
    } else if (!d.moved && d.it.kind === 'cell' && !d.it.name && !d.it.text) {
      openMenu(d.it, e);
    } else if (!d.moved && !d.it.name && (d.it.kind === 'group' || d.it.kind === 'cover' || d.it.kind === 'portrait1' || d.it.kind === 'teacher')) {
      pickRef = d.it.ref; pickSide = d.it.rect.x < lastInfo.W / 2 ? 'left' : 'right'; $('fileImg').click();
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
    var mm = lastInfo ? mmAt(e) : null, it = mm ? hit(mm) : null; addFiles(e.dataTransfer.files, it ? it.ref : null, mm && lastInfo && mm.x < lastInfo.W / 2 ? 'left' : 'right');
  });
  // ---------- Розкладки групових фото, діалог «фото забагато», фон ----------
  function aspectOf(n) { var im = imgs.get(n); return im ? im.naturalWidth / im.naturalHeight : 1.4; }
  function dialog(text, buttons) {
    $('dlgText').textContent = text; var b = $('dlgBtns'); b.textContent = '';
    buttons.forEach(function (x) { var e = el('button', x.cls || '', x.t, x.title); e.onclick = function () { $('dlg').hidden = true; x.fn(); refresh(); }; b.appendChild(e); });
    $('dlg').hidden = false;
  }
  // Фото більше, ніж вікон у розкладці: три варіанти дій.
  function tooMany(extra, tpl) {
    var sp = st.spreads[cur], t = tpl || (sp.template && AlbumTemplates.byId(sp.template)), total = S.groupPhotos(sp).length + extra.length;
    dialog('Фото забагато: ' + total + ' фото, а в розкладці ' + (t ? t.n : '?') + ' вікон.', [
      { t: 'Обрати інші фото', title: 'Ці фото ігноруються, конструктор чекає наступних', fn: function () { toast('Фото пропущено, чекаю інші'); }, cls: '' },
      { t: 'Підібрати іншу розкладку', title: 'Розкладка підбирається під кількість фото та їх пропорції', fn: function () { var r = S.fitAll(st, cur, extra, aspectOf); toast(r.tpl ? 'Розкладка: ' + r.tpl.name : 'Підходящого шаблону немає, зроблено авто-мозаїку'); } },
      { t: 'Пропустити ті, що не вміщаються', title: 'У вікна кладуться фото, найближчі за пропорціями; решта ігнорується', fn: function () { if (tpl) { var ph = S.groupPhotos(sp); sp.style = 'tpl'; sp.template = tpl.id; sp.slots = Array(tpl.n).fill(null); S.fillBest(st, cur, ph.concat(extra), aspectOf); } else S.fillBest(st, cur, extra, aspectOf); } }
    ]);
  }
  function pickLayout(id) {
    var r = S.setTemplate(st, cur, id);
    if (r.overflow) tooMany([], r.tpl); else refresh();
  }
  function buildLayoutStrip() {
    var strip = $('layoutStrip'), sp = st.spreads[cur], z = S.zoneOf(st, cur), th = 50, tw = Math.round(th * z.W / z.H); strip.textContent = '';
    var opt = el('div', 'lopt'), lab = el('label', '', '', 'Біла рамка навколо фото'), cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = !!sp.frame; cb.onchange = function () { sp.frame = cb.checked; refresh(); };
    lab.appendChild(cb); lab.appendChild(document.createTextNode(' Біла рамка')); opt.appendChild(lab); strip.appendChild(opt);
    [['mosaic', 'Мозаїка (авто)'], ['rows', 'Ряди (авто)'], ['scrap', 'Вклеєні (авто)']].forEach(function (a) {
      var b = el('button', 'lt txt' + (sp.style === a[0] ? ' on' : ''), a[1], 'Авто-розкладка під будь-яку кількість фото'); b.onclick = function () { S.setStyle(st, cur, a[0]); refresh(); }; strip.appendChild(b);
    });
    AlbumTemplates.LIST.forEach(function (t) {
      var b = el('button', 'lt' + (sp.style === 'tpl' && sp.template === t.id ? ' on' : ''), null, t.name + ' (' + t.n + ' фото)'), c = document.createElement('canvas'); c.width = tw * 2; c.height = th * 2;
      var g = c.getContext('2d'), k = c.width / z.W; g.fillStyle = '#e9e5df'; g.fillRect(0, 0, c.width, c.height); g.setTransform(k, 0, 0, k, 0, 0);
      AlbumTemplates.rects(t, z.W, z.H, 3, 0).forEach(function (r) { g.save(); if (r.pivot) { g.translate(r.pivot.x, r.pivot.y); g.rotate(r.rot); g.translate(-r.pivot.x, -r.pivot.y); } g.fillStyle = '#3a3a42'; g.fillRect(r.x, r.y, r.w, r.h); g.restore(); });
      c.style.width = tw + 'px'; b.appendChild(c); b.appendChild(el('span', '', String(t.n))); b.onclick = function () { pickLayout(t.id); }; strip.appendChild(b);
    });
  }
  $('btnLayouts').onclick = function () { var s2 = $('layoutStrip'); s2.hidden = !s2.hidden; if (!s2.hidden) buildLayoutStrip(); setTimeout(redraw, 30); };
  var bgDraft = { type: 'color', color: '#ffffff', color2: '#cfd8ff', angle: 90, image: null };
  function bgSync() { bgDraft.type = $('bgType').value; bgDraft.color = $('bgC1').value; bgDraft.color2 = $('bgC2').value; bgDraft.angle = +$('bgAngle').value; $('bgC2L').hidden = $('bgAngL').hidden = bgDraft.type !== 'gradient'; $('bgImgRow').hidden = bgDraft.type !== 'image'; $('bgC1').parentNode.hidden = bgDraft.type === 'image' && false; }
  ['bgType', 'bgC1', 'bgC2', 'bgAngle'].forEach(function (id) { $(id).oninput = $(id).onchange = bgSync; }); bgSync();
  $('bgImgBtn').onclick = function () { $('fileBg').click(); };
  $('fileBg').onchange = async function (e) { var f = e.target.files[0]; e.target.value = ''; if (!f) return; var im = await loadImage(f); if (!im) return toast('Не вдалося прочитати картинку'); var key = 'bg::' + f.name; imgs.set(key, im); bgDraft.image = key; $('bgImgName').textContent = f.name; };
  function bgCopy() { if (bgDraft.type === 'image' && !bgDraft.image) { toast('Спершу вибери картинку'); return null; } return JSON.parse(JSON.stringify(bgDraft)); }
  $('bgAll').onclick = function () { var b = bgCopy(); if (!b) return; st.bg = b; refresh(); };
  $('bgOne').onclick = function () { var b = bgCopy(); if (!b) return; st.spreads[cur].bg = b; refresh(); };
  $('bgResetOne').onclick = function () { st.spreads[cur].bg = null; refresh(); };
  $('bgResetAll').onclick = function () { st.bg = null; refresh(); };

  // ---------- Контекстне меню (правий клік; клік по порожній комірці теж) ----------
  function closeMenu() { $('cellMenu').hidden = true; }
  // Пункти вибору шрифту для напису: get/set працюють з рядком шрифту (null = шрифт альбому)
  function fontItems(get, set) {
    var items = [['Як у альбомі' + (get() ? '' : ' ✓'), 'Прибрати окремий шрифт цього напису', function () { set(null); }]];
    AlbumFonts.LIST.forEach(function (f) { items.push([f.n + (get() === f.n ? ' ✓' : ''), 'Шрифт «' + f.n + '» лише для цього напису', function () { set(f.n); }]); });
    return items;
  }
  var TEXTNAME = { year: 'Рік', name: 'Прізвище на обкладинці', inst: 'Назва закладу', title: 'Напис «Випуск»', cap: 'Підписи під портретами', teach: 'Підписи вчителів' };
  function menuFor(it) {
    var secs = [], j = it && it.ref.j, sp = st.spreads[cur];
    function tfSec(key) { secs.push({ h: 'Шрифт: ' + TEXTNAME[key], items: fontItems(function () { return (st.tf || {})[key] || null; }, function (v) { st.tf = st.tf || {}; if (v) st.tf[key] = v; else delete st.tf[key]; }) }); }
    if (!it && sel && sel.t === 'text') {
      tfSec(sel.key); secs.push({ h: 'Альбом', items: [['Шрифт усього альбому…', 'Відкрити вибір шрифту для всього альбому', function () { if (panel !== 'font') openPanel('font'); }]] });
    } else if (!it) {
      secs.push({ h: 'Фон', items: [['Фон розвороту й альбому…', 'Відкрити налаштування фону: колір, градієнт, картинка', function () { if (panel !== 'bg') openPanel('bg'); }]] });
    } else if (it.caption && it.kind === 'cell') tfSec('cap');
    else if (it.kind === 'teacher') tfSec('teach');
    if (it && it.kind === 'cell' && it.text) secs.push({ h: 'Шрифт тексту', items: fontItems(function () { return it.text.f || null; }, function (v) { if (v) it.text.f = v; else delete it.text.f; sp.text[j] = it.text; }) });
    if (it) {
      var c = [];
      if (it.kind === 'cell' || it.kind === 'group' || it.kind === 'cover' || it.kind === 'portrait1' || it.kind === 'teacher') c.push(['Додати/замінити фото…', 'Вибрати файл для цього вікна', function () { pickRef = it.ref; pickSide = it.rect.x < lastInfo.W / 2 ? 'left' : 'right'; $('fileImg').click(); }]);
      if (it.name && (it.kind === 'cell' || it.kind === 'group')) c.push(['Видалити фото', 'Прибрати фото з вікна (його можна додати знову)', function () { S.removePhoto(st, cur, it.ref); sel = null; }]);
      if (it.text) c.push(['Видалити текст', 'Прибрати текст з вікна', function () { S.removePhoto(st, cur, it.ref); }]);
      if (it.name) c.push(['Скинути кадр', 'Повернути масштаб і зсув фото', function () { st.crops[it.name] = { z: 1, fx: 0.5, fy: 0.35 }; }]);
      if (it.kind === 'cover') c.push([st.coverNoPhoto ? 'Показати фото на обкладинці' : 'Обкладинка без фото', 'Лише дизайн без фото', function () { st.coverNoPhoto = !st.coverNoPhoto; }]);
      secs.push({ h: 'Вікно', items: c });
      if (it.name && (it.kind === 'cell' || it.kind === 'group')) {
        var mv = [];
        st.spreads.forEach(function (x, i) { if (i !== cur && (x.type === 'portrait' || x.type === 'group')) mv.push(['→ ' + label(i), 'Перенести це фото на розворот «' + label(i) + '»', function () { if (S.movePhoto(st, cur, it.ref, i)) { sel = null; toast('Перенесено: ' + label(i)); } else toast('Там немає вільного місця'); }]); });
        if (mv.length) secs.push({ h: 'Перемістити на розворот', items: mv });
      }
      if (it.kind === 'cell' && !it.name) secs.push({ h: 'Візерунок', items: [['Візерунки… (' + AlbumPatterns.LIST.length + ')', 'Відкрити вікно з готовими візерунками для цієї клітинки', function () { openPatterns(it); }]].concat(it.text && it.text.p ? [['Прибрати візерунок', 'Лишити клітинку без візерунка', function () { S.setPattern(st, cur, j, null); }]] : []) });
      if (it.kind === 'cell' && !it.name) {
        secs.push({ h: 'Готовий текст', items: S.presets(st).map(function (p) { return [p.label, 'Вставити текст «' + p.t.replace('\n', ' ') + '»', function () { S.setText(st, cur, j, { t: p.t, s: (it.text && it.text.s) || 'ornament' }); }]; }).concat([['Свій текст…', 'Написати довільний текст (\\n = новий рядок)', function () {
          var t = prompt('Текст для вікна (\\n = новий рядок):', it.text ? it.text.t.replace(/\n/g, '\\n') : ''); if (t != null) S.setText(st, cur, j, { t: t.replace(/\\n/g, '\n'), s: (it.text && it.text.s) || 'ornament' });
        }]]) });
      }
      if (it.kind === 'cell' && it.text) secs.push({ h: 'Оформлення тексту', items: [['Візерунок: ' + ({ plain: 'без', ornament: 'лінії', frame: 'рамка' }[it.text.s || 'plain']) + ' → далі', 'Змінити: без візерунка, лінії, рамка', function () { S.cycleStyle(st, cur, j); }]] });
      if (it.kind === 'cell' && !it.name) {
        var mg = [[2, 1, '2 вправо'], [3, 1, '3 вправо'], [1, 2, '2 вниз'], [2, 2, '2×2']].map(function (a) { return ['Об\'єднати: ' + a[2], 'Об\'єднати з сусідніми порожніми в одне велике вікно', function () { if (!S.setSpan(st, cur, j, a[0], a[1])) toast('Тут не вийде: сусідні клітинки зайняті або поза розворотом'); }]; });
        if (it.span) mg.push(['Роз\'єднати', 'Повернути окремі клітинки', function () { S.setSpan(st, cur, j, 1, 1); }]);
        secs.push({ h: 'Об\'єднання', items: mg });
      }
    }
    var sc = [];
    if (sp.type === 'group') sc.push(['Стиль розкладки: ' + ({ mosaic: 'мозаїка', rows: 'рівні ряди', scrap: 'вклеєні в альбом', tpl: 'готова розкладка' }[sp.style || 'mosaic']) + ' → далі', 'Змінити стиль групових фото: мозаїка, рівні ряди, вклеєні в альбом (з нахилами й накладанням)', function () { var ss = ['mosaic', 'rows', 'scrap']; S.setStyle(st, cur, ss[(ss.indexOf(sp.style || 'mosaic') + 1) % 3]); }]);
    if (sp.type === 'group') sc.push(['🎲 Розкласти інакше', 'Нова випадкова розкладка групових фото', function () { sp.seed = 1 + Math.floor(Math.random() * 99999); }]);
    if (sp.type === 'cover') sc.push([S.coverIndividual(st) ? 'Обкладинка одна для всіх (cover.jpg)' : 'Обкладинка індивідуальна (cover_01…)', 'Індивідуальна: окрема для кожної дитини; одна: один файл cover.jpg', function () { st.coverIndividual = !S.coverIndividual(st); }]);
    if (cur >= 1 && (sp.type === 'group' || sp.type === 'portrait')) sc.push(['Зробити розворот індивідуальним', 'Розворот стане як перший: ліворуч вчителі чи загальне фото, праворуч портрет кожної дитини; файли NN_01, NN_02…', function () {
      var has = sp.type === 'portrait' ? Object.keys(sp.extra).length : sp.slots.length;
      if (!has || confirm('Поточний вміст розвороту буде очищено. Продовжити?')) S.makeIndividual(st, cur);
    }]);
    if (cur >= 2 && sp.type === 'first') sc.push(['Зробити розворот загальним', 'Повернути звичайний груповий розворот (індивідуальні фото скинуться)', function () { if (confirm('Індивідуальні фото цього розвороту буде скинуто. Продовжити?')) S.makeGeneral(st, cur); }]);
    if (cur >= 2) {
      sc.push(['← Розворот раніше', 'Пересунути розворот ближче до початку', function () { if (S.moveSpread(st, cur, -1)) cur--; }]);
      sc.push(['Розворот пізніше →', 'Пересунути розворот ближче до кінця', function () { if (S.moveSpread(st, cur, 1)) cur++; }]);
      sc.push(['Видалити розворот', 'Видалити цей розворот разом з розкладкою', function () { if (confirm('Видалити цей розворот?')) { st.spreads.splice(cur, 1); cur = Math.min(cur, st.spreads.length - 1); sel = null; } }]);
    }
    sc.push(['＋ Портрети після цього', 'Додати порожній портретний розворот', function () { st.spreads.splice(Math.max(cur, 1) + 1, 0, S.mkSpread('portrait')); cur = Math.max(cur, 1) + 1; }]);
    sc.push(['＋ Групові після цього', 'Додати розворот під групові фото', function () { st.spreads.splice(Math.max(cur, 1) + 1, 0, S.mkSpread('group')); cur = Math.max(cur, 1) + 1; }]);
    secs.push({ h: 'Розворот', items: sc });
    return secs;
  }
  function showMenu(secs, e) {
    var m = $('cellMenu'); m.textContent = '';
    secs.forEach(function (sec) {
      if (!sec.items.length) return; m.appendChild(el('h4', '', sec.h));
      sec.items.forEach(function (a) { var b = el('button', '', a[0], a[1]); b.onclick = function () { closeMenu(); a[2](); refresh(); }; m.appendChild(b); });
    });
    m.hidden = false; var w = m.offsetWidth, h = m.offsetHeight;
    m.style.left = Math.max(8, Math.min(e.clientX, innerWidth - w - 8)) + 'px'; m.style.top = Math.max(8, Math.min(e.clientY, innerHeight - h - 8)) + 'px';
  }
  function openMenu(it, e) { showMenu(menuFor(it), e); }
  cv.addEventListener('contextmenu', function (e) {
    e.preventDefault(); var p = lastInfo ? mmAt(e) : null, it = p ? hit(p) : null; sel = p ? selFor(p, it) : null; redraw(); openMenu(it, e);
  });
  document.addEventListener('pointerdown', function (e) { if (!$('cellMenu').hidden && !$('cellMenu').contains(e.target) && e.target !== cv) closeMenu(); });
  $('roundIn').oninput = function () { st.spreads[cur].round = +$('roundIn').value; redraw(); };
  $('roundAll').onclick = function () { var v = +$('roundIn').value; st.round = v; st.spreads.forEach(function (s) { if (s.type === 'group') s.round = v; }); redraw(); toast('Скруглення застосовано до всіх групових розворотів'); };
  $('coverNoPhoto').onchange = function () { st.coverNoPhoto = $('coverNoPhoto').checked; refresh(); };
  function removeSel() {
    if (!sel || sel.t === 'bg' || sel.t === 'text') return toast('Спершу вибери фото');
    if (S.removePhoto(st, cur, sel)) { sel = null; refresh(); } else toast('Портрети й фото вчителів беруться за номером; щоб прибрати, вилучи файл або номер зі списку');
  }
  document.addEventListener('keydown', function (e) {
    if ($('work').hidden || /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
    if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); removeSel(); }
    if (e.key === 'ArrowLeft' && cur > 0) { cur--; sel = null; refresh(); }
    if (e.key === 'ArrowRight' && cur < st.spreads.length - 1) { cur++; sel = null; refresh(); }
  });
  window.addEventListener('resize', redraw);

  // ---------- Панель «Об'єкт»: вміст залежить від вибраного ----------
  function slider(label, min, max, step, get, set, title) {
    var l = el('label', '', label + ': '), inp = document.createElement('input'), v = el('span', 'hint', ''); inp.type = 'range'; inp.min = min; inp.max = max; inp.step = step; inp.value = get(); inp.title = title || label;
    function sh() { v.textContent = ' ' + (+inp.value); } sh();
    inp.oninput = function () { set(+inp.value); sh(); redraw(); thumbs(); }; l.appendChild(v); l.appendChild(inp); return l;
  }
  function buildTeacherUI(box) {
    var tl = S.teachers(st), n = tl.length, cfg = st.tl = st.tl || {}, AL = AlbumLayout;
    var rows = AL.normRows(cfg.rows && cfg.rows.length ? cfg.rows : AL.teacherRows(n), n), dragIdx = null;
    box.appendChild(el('p', 'hint', 'Вчителів: ' + n + '. Перетягни кубик в інший ряд або на «+ новий ряд». Ряди завжди по центру.'));
    function setRows(r) { cfg.rows = AL.normRows(r, n); refresh(); buildObjPanel(); }
    function move(idx, ri, before) {
      var rs = rows.map(function (r) { return r.slice(); }), tgtRow = ri === 'new' ? null : rs[ri];
      rs.forEach(function (r) { var k = r.indexOf(idx); if (k >= 0) r.splice(k, 1); });
      if (ri === 'new') { rs.splice(before, 0, [idx]); }
      else { var k2 = before == null ? tgtRow.length : tgtRow.indexOf(before); tgtRow.splice(k2 < 0 ? tgtRow.length : k2, 0, idx); }
      setRows(rs.filter(function (r) { return r.length; }));
    }
    var pr = el('div', 'pbtns'); pr.appendChild(el('span', 'hint', 'Готові:'));
    AL.teacherPresets(n).forEach(function (counts) {
      var b = el('button', '', counts.join(' + '), 'Ряди: ' + counts.join(', ') + ' вчителів у ряду'), i = 0;
      b.onclick = function () { i = 0; setRows(counts.map(function (c) { var r = []; for (var k = 0; k < c; k++) r.push(i++); return r; })); }; pr.appendChild(b);
    });
    box.appendChild(pr);
    var sch = el('div', 'tsch');
    function zone(pos) { var z = el('div', 'tnew', '+ новий ряд', 'Перетягни кубик сюди, щоб почати новий ряд'); z.ondragover = function (e) { e.preventDefault(); z.classList.add('over'); }; z.ondragleave = function () { z.classList.remove('over'); }; z.ondrop = function (e) { e.preventDefault(); if (dragIdx != null) move(dragIdx, 'new', pos); }; return z; }
    sch.appendChild(zone(0));
    rows.forEach(function (r, ri) {
      var rowEl = el('div', 'trow');
      rowEl.ondragover = function (e) { e.preventDefault(); rowEl.classList.add('over'); }; rowEl.ondragleave = function () { rowEl.classList.remove('over'); };
      rowEl.ondrop = function (e) { e.preventDefault(); rowEl.classList.remove('over'); if (dragIdx != null) move(dragIdx, ri, null); };
      r.forEach(function (idx) {
        var c = el('div', 'cube' + (sel && sel.t === 'teacher' && sel.i === idx ? ' on' : ''), String(idx + 1), (tl[idx] ? tl[idx].name : '') + ': перетягни в інший ряд, клік вибирає на розвороті'); c.draggable = true;
        c.ondragstart = function (e) { dragIdx = idx; c.classList.add('drag'); e.dataTransfer.setData('text/plain', String(idx)); e.dataTransfer.effectAllowed = 'move'; };
        c.ondragend = function () { dragIdx = null; c.classList.remove('drag'); };
        c.ondragover = function (e) { e.preventDefault(); e.stopPropagation(); }; c.ondrop = function (e) { e.preventDefault(); e.stopPropagation(); if (dragIdx != null && dragIdx !== idx) move(dragIdx, ri, idx); };
        c.onclick = function () { sel = { t: 'teacher', i: idx }; redraw(); buildObjPanel(); };
        rowEl.appendChild(c);
      });
      sch.appendChild(rowEl); sch.appendChild(zone(ri + 1));
    });
    box.appendChild(sch);
    var ab = el('div', 'pbtns');
    var add = el('button', '', '＋ Ряд', 'Додати ряд: останній вчитель найдовшого ряду переходить у новий ряд внизу'); add.onclick = function () { var li = 0; rows.forEach(function (r, i) { if (r.length > rows[li].length) li = i; }); if (rows[li].length < 2) return toast('Немає з чого створити ряд'); var rs = rows.map(function (r) { return r.slice(); }), x = rs[li].pop(); rs.push([x]); setRows(rs); };
    var del = el('button', '', '− Ряд', 'Прибрати останній ряд: вчителі переходять у попередній'); del.onclick = function () { if (rows.length < 2) return; var rs = rows.map(function (r) { return r.slice(); }), last = rs.pop(); rs[rs.length - 1] = rs[rs.length - 1].concat(last); setRows(rs); };
    var rst = el('button', '', 'Авто', 'Повернути типові ряди'); rst.onclick = function () { cfg.rows = null; refresh(); buildObjPanel(); };
    ab.appendChild(add); ab.appendChild(del); ab.appendChild(rst); box.appendChild(ab);
    box.appendChild(slider('Розмір фото, %', 30, 100, 1, function () { return cfg.size == null ? 100 : cfg.size; }, function (v) { cfg.size = v; }, 'Менше значення: фото менші, блок усе одно по центру'));
    box.appendChild(slider('Пропорція (вузькі ← → широкі)', 0.7, 1.6, 0.05, function () { return cfg.asp == null ? 1.1 : +(2.3 - cfg.asp).toFixed(2); }, function (v) { cfg.asp = +(2.3 - v).toFixed(2); }, 'Вліво: вертикальні (високі) фото; вправо: горизонтальні (широкі)'));
    box.appendChild(slider('Відстань між фото, мм', 0, 30, 1, function () { return cfg.gap == null ? 10 : cfg.gap; }, function (v) { cfg.gap = v; }, 'Проміжок між фото'));
  }
  function buildGeneralUI(box) {
    var g = st.gp = st.gp || {};
    box.appendChild(el('p', 'hint', 'Загальне фото на лівій сторінці першого розвороту. Центр лишається на місці.'));
    box.appendChild(slider('Ширина, %', 30, 100, 1, function () { return g.w == null ? 100 : g.w; }, function (v) { g.w = v; }, 'Вужче чи ширше'));
    box.appendChild(slider('Висота, %', 30, 100, 1, function () { return g.h == null ? 100 : g.h; }, function (v) { g.h = v; }, 'Нижче чи вище'));
    var b = el('button', '', 'Скинути розмір', 'Повернути типовий розмір'); b.onclick = function () { st.gp = null; refresh(); buildObjPanel(); }; box.appendChild(b);
  }
  function buildObjPanel() {
    var box = $('objBody'); if (!box) return; box.textContent = ''; var sp = st.spreads[cur]; if (!sp) return;
    if (sel && sel.t === 'text') {
      box.appendChild(el('p', 'hint', 'Вибрано напис: ' + (TEXTNAME[sel.key] || '') + '. Шрифт: правий клік по ньому.'));
      var s = el('select', '', null, 'Шрифт цього напису'); s.appendChild(el('option', '', 'Як у альбомі')).value = '';
      AlbumFonts.LIST.forEach(function (f) { var o = el('option', '', f.n); o.value = f.n; s.appendChild(o); }); s.value = (st.tf || {})[sel.key] || '';
      s.onchange = function () { st.tf = st.tf || {}; if (s.value) st.tf[sel.key] = s.value; else delete st.tf[sel.key]; refresh(); }; box.appendChild(s); return;
    }
    if (sel && sel.t === 'bg') {
      box.appendChild(el('p', 'hint', 'Вибрано фон розвороту. Колір, градієнт, картинка й візерунки: вкладка «Фон».'));
      var bb = el('button', '', 'Відкрити «Фон»', 'Перейти до налаштувань фону'); bb.onclick = function () { openPanel('bg'); }; box.appendChild(bb); return;
    }
    if (sp.type === 'first') { if (S.teachers(st).length) buildTeacherUI(box); else buildGeneralUI(box); return; }
    if (sp.type === 'group') {
      box.appendChild(slider('Скруглення кутів, мм', 0, 15, 0.5, function () { return sp.round != null ? sp.round : st.round || 0; }, function (v) { sp.round = v; }, 'Скруглення кутів групових фото цього розвороту'));
      return;
    }
    box.appendChild(el('p', 'hint', 'Клікни по фото, напису чи фону. На першому розвороті тут конструктор вчителів або розмір загального фото, на груповому скруглення кутів.'));
  }
  // ---------- Візерунки для порожніх клітинок ----------
  var patTarget = null, patDraft = { id: 'dots', c: '#c9c9c9', s: 6 };
  (function () {
    var s = $('patColor'); AlbumPatterns.COLORS.forEach(function (c) { var o = el('option', '', c[1]); o.value = c[0]; s.appendChild(o); });
    s.onchange = function () { patDraft.c = s.value; patApply(); };
    $('patSize').oninput = function () { patDraft.s = +$('patSize').value; patApply(true); };
    $('patNone').onclick = function () { if (patTarget) { S.setPattern(st, cur, patTarget.j, null); refresh(); patGrid(); } };
    $('patClose').onclick = function () { $('patDlg').hidden = true; };
    $('patAll').onclick = function () {
      if (!patTarget || !patDraft.id) return; var n = 0;
      S.slotsFor(st, cur, numMap).items.forEach(function (it) { if (it.kind === 'cell' && !it.name && !it.span) { S.setPattern(st, cur, it.ref.j, JSON.parse(JSON.stringify(patDraft))); n++; } });
      refresh(); toast('Візерунок у ' + n + ' клітинках');
    };
    $('patFile').onclick = function () { $('patFileIn').click(); };
    $('patFileIn').onchange = async function (e) {
      var f = e.target.files[0]; e.target.value = ''; if (!f) return; var im = await loadImage(f); if (!im) return toast('Не вдалося прочитати файл');
      var key = 'pat::' + f.name; imgs.set(key, im); patDraft = { id: 'img', img: key, s: patDraft.s }; patApply();
    };
  })();
  function patApply(light) { if (!patTarget) return; S.setPattern(st, cur, patTarget.j, JSON.parse(JSON.stringify(patDraft))); if (light) { redraw(); thumbs(); } else { refresh(); patGrid(); } }
  function patGrid() {
    var g = $('patGrid'); g.textContent = '';
    AlbumPatterns.LIST.forEach(function (p) {
      var b = el('button', patDraft.id === p.id ? 'on' : '', null, p.name), c = document.createElement('canvas'); c.width = 152; c.height = 112;
      var x = c.getContext('2d'), k = 152 / 38; x.fillStyle = '#fff'; x.fillRect(0, 0, 152, 112); x.setTransform(k, 0, 0, k, 0, 0);
      AlbumPatterns.draw(x, { x: 0, y: 0, w: 38, h: 28 }, { id: p.id, c: patDraft.c, s: Math.min(patDraft.s, 8) });
      b.appendChild(c); b.appendChild(el('span', '', p.name)); b.onclick = function () { patDraft.id = p.id; delete patDraft.img; patApply(); }; g.appendChild(b);
    });
  }
  function openPatterns(it) {
    patTarget = { j: it.ref.j }; var cur0 = it.text && it.text.p; if (cur0) { patDraft = JSON.parse(JSON.stringify(cur0)); if (patDraft.id === 'img' && !imgs.get(patDraft.img)) patDraft.id = 'dots'; }
    $('patColor').value = patDraft.c || '#c9c9c9'; $('patSize').value = patDraft.s || 6; patGrid(); $('patDlg').hidden = false;
  }
  // ---------- Шрифти ----------
  (function () {
    var s = $('fontSel'), g = '';
    s.appendChild(el('option', '', 'Як у дизайні (системний)')).value = '';
    AlbumFonts.LIST.forEach(function (f) { var o = el('option', '', f.n + ' · ' + f.g); o.value = f.n; o.style.fontFamily = AlbumFonts.stack(f.n); s.appendChild(o); });
    s.onchange = function () { st.font = s.value || null; fontSample(); refresh(); };
    $('fontResetText').onclick = function () { st.tf = {}; st.spreads.forEach(function (sp) { Object.keys(sp.text || {}).forEach(function (j) { if (sp.text[j]) delete sp.text[j].f; }); }); refresh(); };
  })();
  function fontSample() { $('fontSample').style.fontFamily = (st.font && AlbumFonts.stack(st.font)) || 'inherit'; $('fontSel').value = st.font || ''; }
  // ---------- Меню й кнопки ----------
  function openPanel(name) {
    panel = panel === name ? null : name;
    $('drawer').hidden = !panel; $('work').classList.toggle('shift', !!panel);
    document.querySelectorAll('.rail [data-panel]').forEach(function (b) { b.classList.toggle('on', b.dataset.panel === panel); });
    document.querySelectorAll('.drawer section').forEach(function (s) { s.classList.toggle('on', s.dataset.panel === panel); });
    if (panel === 'obj') buildObjPanel();
    setTimeout(redraw, 170);
  }
  document.querySelectorAll('.rail [data-panel]').forEach(function (b) { b.onclick = function () { openPanel(b.dataset.panel); }; });
  $('drawerX').onclick = function () { openPanel(panel); };
  document.querySelector('.rail [data-go=list]').onclick = function () { showStep(4); };
  document.querySelector('.rail [data-go=album]').onclick = function () { showStep(1); };
  $('kSel').onchange = function () { st.kOverride = +$('kSel').value || null; S.resizePortrait(st); S.reflowPortrait(st); if (cur >= st.spreads.length) cur = st.spreads.length - 1; sel = null; refresh(); };
  document.querySelectorAll('#dragMode [data-dm]').forEach(function (b) { b.onclick = function () { dragMode = b.dataset.dm; document.querySelectorAll('#dragMode button').forEach(function (x) { x.classList.toggle('on', x === b); }); }; });
  $('btnShuffle').onclick = function () { st.spreads[cur].seed = 1 + Math.floor(Math.random() * 99999); refresh(); };
  $('btnStyle').onclick = function () { var sp = st.spreads[cur], ss = ['mosaic', 'rows', 'scrap']; S.setStyle(st, cur, ss[(ss.indexOf(sp.style || 'mosaic') + 1) % 3]); refresh(); };
  $('spineIn').onchange = function () { var v = parseFloat($('spineIn').value); st.spine = isNaN(v) ? null : Math.max(0, Math.min(60, v)); refresh(); };
  $('safeIn').onchange = function () { var v = parseFloat($('safeIn').value); st.safe = isNaN(v) ? null : Math.max(0, Math.min(40, v)); refresh(); };
  $('coverSafeIn').onchange = function () { var v = parseFloat($('coverSafeIn').value); st.coverSafe = isNaN(v) ? null : Math.max(0, Math.min(60, v)); refresh(); };
  $('guides').onchange = function () { guides = $('guides').checked; redraw(); };
  $('btnPlus').onclick = function () { $('addMenu').hidden = !$('addMenu').hidden; };
  document.querySelectorAll('[data-add]').forEach(function (b) {
    b.onclick = function () { $('addMenu').hidden = true; st.spreads.splice(cur < 1 ? 2 : cur + 1, 0, S.mkSpread(b.dataset.add)); cur = cur < 1 ? 2 : cur + 1; sel = null; refresh(); };
  });

  // ---------- Збереження й експорт ----------
  function needEditor() { if (!st.spreads.length || $('work').hidden) { toast('Спершу створи макет (кроки 1–4)'); return true; } return false; }
  // Малює розворот si у точному розмірі друку (300 dpi); для обкладинки й першого розвороту підставляє дитину ownerId.
  function renderBlob(i, mime, ownerId) {
    return AlbumFonts.ensure(st).then(function () {
      var z = PR.spreadSize(st.fmtId), k = 300 / 25.4, c = document.createElement('canvas'), keep = st.owner;
      c.width = Math.round(z.W * k); c.height = Math.round(z.H * k);
      if (ownerId != null) st.owner = ownerId;
      R.draw(c.getContext('2d'), st, i, numMap, imgs, { pxPerMm: c.width / z.W, preview: false });
      st.owner = keep;
      return new Promise(function (res) { c.toBlob(res, mime, 1); });
    });
  }
  function one(mime, ext) { if (needEditor()) return; renderBlob(cur, mime).then(function (b) { X.download(b, S.exportName(st, cur) + ext); }); }
  $('btnJpg').onclick = function () { one('image/jpeg', '.jpg'); };
  function missingPhotos(plan) {
    var n = 0, keep = st.owner;
    plan.forEach(function (p) {
      if (p.owner == null) return; st.owner = p.owner;
      var it = S.slotsFor(st, p.si, numMap).items, ph = it.filter(function (x) { return x.kind === 'cover' || x.kind === 'portrait1'; })[0];
      if (ph && !ph.name) n++;
    });
    st.owner = keep; return n;
  }
  async function renderAll(mime) {
    var plan = S.exportPlan(st), out = [], miss = missingPhotos(plan);
    for (var i = 0; i < plan.length; i++) { toast('Готую ' + (i + 1) + '/' + plan.length + ': ' + plan[i].name); var b = await renderBlob(plan[i].si, mime, plan[i].owner); out.push({ name: plan[i].name, blob: b }); }
    if (miss) toast('Увага: без фото лишилося обкладинок і перших розворотів: ' + miss);
    return out;
  }
  $('btnZip').onclick = async function () {
    if (needEditor()) return; var r = await renderAll('image/jpeg'), out = [];
    for (var f of r) out.push({ name: f.name + '.jpg', data: new Uint8Array(await f.blob.arrayBuffer()) });
    X.download(X.zip(out), 'album-spreads.zip'); toast('Архів готовий: ' + out.length + ' файлів');
  };

  showStep(1);
  try {
    var saved = localStorage.getItem('albumBuilder.v1');
    if (saved) { var s0 = S.fromJSON(saved); if (s0.spreads.length) { st = s0; cur = 0; showEditor(); toast('Відновлено останній макет. Фото додай знову (за назвами файлів вони стануть на місця)'); } }
  } catch (e) {}
})();
