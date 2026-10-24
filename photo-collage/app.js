// Колаж фото: інтерфейс (завантаження фото, полотно, вибір фото, обмін місцями/кадр, макет без фото, експорт). Логіка розкладки — у collage-core.js.
(function () {
  var C = window.CollageCore, $ = function (id) { return document.getElementById(id); };
  var LS = 'pc_';
  var cv = $('cv'), ctx = cv.getContext('2d');
  // tile: {img, x,y,w,h (рамка зараз), hx,hy,hw,hh (за розкладкою), z (наближення кадру), fx,fy (зсув кадру 0..1)}
  var st = { w: 2400, h: 1800, gap: 16, bg: '#101014', seed: 1, preset: '4:3', mode: 'tree', dragMode: 'swap', blank: false, tiles: [], sel: null };

  function save() { try { localStorage.setItem(LS + 'cfg', JSON.stringify({ w: st.w, h: st.h, gap: st.gap, bg: st.bg, preset: st.preset, mode: st.mode })); } catch (e) {} }
  try { var s = JSON.parse(localStorage.getItem(LS + 'cfg') || 'null'); if (s) { st.w = s.w || st.w; st.h = s.h || st.h; st.gap = s.gap == null ? st.gap : s.gap; st.bg = s.bg || st.bg; st.preset = s.preset || st.preset; st.mode = C.MODES[s.mode] ? s.mode : st.mode; } } catch (e) {}

  function toast(t) { var el = $('toast'); el.textContent = t; el.classList.add('on'); setTimeout(function () { el.classList.remove('on'); }, 1400); }

  // меню-іконки й довідка «i»: спільний кіт zb-ui.js (ZB.showPanel, ZB.panel)

  // ---- розкладка ----
  function aspects() { return st.tiles.map(function (t) { return t.img.naturalWidth / Math.max(1, t.img.naturalHeight); }); }
  function relayout(newSeed) {
    if (newSeed) st.seed = (Math.random() * 1e9) | 0;
    var cells = C.layout(st.tiles.length, st.w, st.h, st.gap, st.seed, st.mode, aspects());
    st.tiles.forEach(function (t, i) { var c = cells[i]; t.x = t.hx = c.x; t.y = t.hy = c.y; t.w = t.hw = c.w; t.h = t.hh = c.h; });
    draw();
  }

  function draw(noSel) {
    if (cv.width !== st.w) cv.width = st.w; if (cv.height !== st.h) cv.height = st.h;
    ctx.fillStyle = st.bg; ctx.fillRect(0, 0, st.w, st.h);
    var inv = C.invertColor(st.bg);
    st.tiles.forEach(function (t) {
      if (st.blank) { ctx.fillStyle = inv; ctx.fillRect(t.x, t.y, t.w, t.h); return; }
      var r = C.coverCrop(t.img.naturalWidth, t.img.naturalHeight, t.w, t.h, t.z, t.fx, t.fy);
      ctx.save(); ctx.beginPath(); ctx.rect(t.x, t.y, t.w, t.h); ctx.clip();
      ctx.drawImage(t.img, r.sx, r.sy, r.sw, r.sh, t.x, t.y, t.w, t.h);
      ctx.restore();
    });
    if (!noSel && drag && drag.kind === 'swap') {
      var k2 = Math.max(1, st.w / Math.max(1, cv.getBoundingClientRect().width)), d = drag.t;
      ctx.save();
      if (drag.target) { ctx.lineWidth = 4 * k2; ctx.strokeStyle = '#c9a766'; ctx.strokeRect(drag.target.x + 2 * k2, drag.target.y + 2 * k2, drag.target.w - 4 * k2, drag.target.h - 4 * k2); }
      var gw = d.w * 0.5, gh = d.h * 0.5; ctx.globalAlpha = 0.75; ctx.fillStyle = st.blank ? inv : '#000';
      if (st.blank) ctx.fillRect(drag.mx - gw / 2, drag.my - gh / 2, gw, gh);
      else { var r2 = C.coverCrop(d.img.naturalWidth, d.img.naturalHeight, gw, gh, d.z, d.fx, d.fy); ctx.drawImage(d.img, r2.sx, r2.sy, r2.sw, r2.sh, drag.mx - gw / 2, drag.my - gh / 2, gw, gh); }
      ctx.restore();
    }
    if (!noSel && st.sel) {
      var t = st.sel, k = Math.max(1, st.w / Math.max(1, cv.getBoundingClientRect().width)), hs = 12 * k;
      ctx.save(); ctx.lineWidth = 2 * k; ctx.strokeStyle = '#7fc8a9'; ctx.strokeRect(t.x + k, t.y + k, t.w - 2 * k, t.h - 2 * k);
      ctx.fillStyle = '#7fc8a9'; ctx.fillRect(t.x + t.w - hs, t.y + t.h - hs, hs, hs); ctx.restore();
    }
    $('empty').hidden = st.tiles.length > 0;
    $('count').textContent = 'Фото: ' + st.tiles.length;
    $('info').textContent = st.w + ' × ' + st.h + ' px';
  }

  // ---- параметри полотна ----
  var pre = $('preset');
  Object.keys(C.PRESETS).concat(['custom']).forEach(function (k) { var o = document.createElement('option'); o.value = k; o.textContent = k === 'custom' ? 'Свій розмір' : k; pre.appendChild(o); });
  var modesBox = $('modes');
  Object.keys(C.MODES).forEach(function (k) {
    var b = document.createElement('button'); b.dataset.mode = k; b.textContent = C.MODES[k]; b.title = 'Режим розкладки: ' + C.MODES[k];
    b.onclick = function () { st.mode = k; syncUI(); save(); relayout(); };
    modesBox.appendChild(b);
  });
  function syncUI() {
    pre.value = st.preset; $('cw').value = st.w; $('ch').value = st.h; $('gap').value = st.gap; $('gapV').textContent = st.gap; $('bg').value = st.bg;
    modesBox.querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', b.dataset.mode === st.mode); });
    $('btnBlank').onclick = function () { st.blank = !st.blank; syncUI(); draw(); };
  document.querySelectorAll('#dragMode button').forEach(function (b) { b.classList.toggle('on', b.dataset.dm === st.dragMode); });
    $('btnBlank').classList.toggle('on', st.blank); $('btnBlank').setAttribute('aria-pressed', st.blank);
    $('btnBlank').textContent = st.blank ? 'Показати фото' : 'Вимкнути фото';
    var t = st.sel;
    $('noSel').hidden = !!t; $('selCtls').hidden = !t;
    if (t) {
      $('selZ').value = t.z; $('zV').textContent = '×' + t.z.toFixed(2); $('selFx').value = Math.round(t.fx * 100); $('selFy').value = Math.round(t.fy * 100);
      $('selW').value = Math.round(t.w); $('selH').value = Math.round(t.h);
    }
  }
  pre.onchange = function () { st.preset = pre.value; if (st.preset !== 'custom') { st.w = C.PRESETS[st.preset][0]; st.h = C.PRESETS[st.preset][1]; } syncUI(); save(); relayout(); };
  function sizeInput() { st.w = Math.min(6000, Math.max(200, +$('cw').value || st.w)); st.h = Math.min(6000, Math.max(200, +$('ch').value || st.h)); st.preset = 'custom'; syncUI(); save(); relayout(); }
  $('cw').onchange = sizeInput; $('ch').onchange = sizeInput;
  $('gap').oninput = function () { st.gap = +this.value; $('gapV').textContent = st.gap; save(); relayout(); };
  $('bg').oninput = function () { st.bg = this.value; save(); draw(); };
  $('btnShuffle').onclick = function () { relayout(true); };
  $('btnReset').onclick = function () { st.tiles.forEach(homeTile); draw(); syncUI(); };
  $('btnClear').onclick = function () { st.tiles = []; st.sel = null; draw(); syncUI(); };
  document.querySelectorAll('#dragMode button').forEach(function (b) { b.onclick = function () { st.dragMode = b.dataset.dm; syncUI(); }; });

  // ---- вибране фото ----
  function homeTile(t) { t.x = t.hx; t.y = t.hy; t.w = t.hw; t.h = t.hh; }
  function clampTile(t) { t.w = Math.min(st.w, Math.max(40, Math.round(t.w))); t.h = Math.min(st.h, Math.max(40, Math.round(t.h))); }
  $('selZ').oninput = function () { if (!st.sel) return; st.sel.z = +this.value; draw(); syncUI(); };
  $('selFx').oninput = function () { if (!st.sel) return; st.sel.fx = this.value / 100; draw(); };
  $('selFy').oninput = function () { if (!st.sel) return; st.sel.fy = this.value / 100; draw(); };
  $('selW').onchange = function () { if (!st.sel) return; st.sel.w = +this.value || st.sel.w; clampTile(st.sel); draw(); syncUI(); };
  $('selH').onchange = function () { if (!st.sel) return; st.sel.h = +this.value || st.sel.h; clampTile(st.sel); draw(); syncUI(); };
  $('selHome').onclick = function () { if (st.sel) { homeTile(st.sel); draw(); syncUI(); } };
  $('selCrop').onclick = function () { if (st.sel) { st.sel.z = 1; st.sel.fx = st.sel.fy = 0.5; draw(); syncUI(); } };
  function delSel() { if (!st.sel) return; st.tiles.splice(st.tiles.indexOf(st.sel), 1); st.sel = null; draw(); syncUI(); }
  $('selDel').onclick = delSel;
  document.addEventListener('keydown', function (e) { if (e.key === 'Delete' && st.sel && !/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) delSel(); });

  // ---- додавання фото ----
  function newTile(img) { return { img: img, x: 0, y: 0, w: 100, h: 100, hx: 0, hy: 0, hw: 100, hh: 100, z: 1, fx: 0.5, fy: 0.5 }; }
  function addFiles(files) {
    var list = Array.prototype.filter.call(files, function (f) { return /^image\//.test(f.type); });
    if (!list.length) return toast('Потрібні файли-картинки');
    var left = list.length;
    list.forEach(function (f) {
      var img = new Image(), url = URL.createObjectURL(f);
      img.onload = function () { st.tiles.push(newTile(img)); if (--left === 0) relayout(true); };
      img.onerror = function () { if (--left === 0) relayout(true); };
      img.src = url;
    });
  }
  $('btnAdd').onclick = function () { $('fileImg').click(); };
  $('fileImg').onchange = function () { addFiles(this.files); this.value = ''; };
  var drop = $('drop');
  ['dragenter', 'dragover'].forEach(function (e) { drop.addEventListener(e, function (ev) { ev.preventDefault(); drop.classList.add('over'); }); });
  ['dragleave', 'drop'].forEach(function (e) { drop.addEventListener(e, function (ev) { ev.preventDefault(); drop.classList.remove('over'); }); });
  drop.addEventListener('drop', function (ev) { if (ev.dataTransfer && ev.dataTransfer.files.length) addFiles(ev.dataTransfer.files); });

  // ---- пересування рамки, зсув кадру, зміна розміру ----
  var drag = null;
  // canvas має object-fit: contain, тому рахуємо видиму ділянку
  function pt(e) {
    var r = cv.getBoundingClientRect(), k = Math.min(r.width / st.w, r.height / st.h), ox = (r.width - st.w * k) / 2, oy = (r.height - st.h * k) / 2;
    return { x: (e.clientX - r.left - ox) / k, y: (e.clientY - r.top - oy) / k, k: k };
  }
  function hit(p, skip) { for (var i = st.tiles.length - 1; i >= 0; i--) { var t = st.tiles[i]; if (t !== skip && p.x >= t.x && p.x <= t.x + t.w && p.y >= t.y && p.y <= t.y + t.h) return i; } return -1; }
  function onHandle(p) { var t = st.sel; if (!t) return false; var hs = 18 / p.k; return p.x >= t.x + t.w - hs && p.x <= t.x + t.w && p.y >= t.y + t.h - hs && p.y <= t.y + t.h; }
  cv.addEventListener('pointerdown', function (e) {
    var p = pt(e);
    if (onHandle(p)) { drag = { kind: 'size', t: st.sel, ox: p.x - st.sel.w, oy: p.y - st.sel.h }; cv.setPointerCapture(e.pointerId); return; }
    var i = hit(p);
    if (i < 0) { st.sel = null; draw(); syncUI(); return; }
    var t = st.tiles[i]; st.sel = t;
    var crop = (st.dragMode === 'crop') !== e.altKey;
    drag = { kind: crop && !st.blank ? 'crop' : 'swap', t: t, target: null, mx: p.x, my: p.y, px: p.x, py: p.y };
    cv.setPointerCapture(e.pointerId); cv.classList.add('drag'); draw(); syncUI();
    if (!ZB.panel) ZB.showPanel('photo');
  });
  cv.addEventListener('pointermove', function (e) {
    var p = pt(e);
    if (!drag) { cv.classList.toggle('size', onHandle(p)); cv.classList.toggle('hot', !onHandle(p) && hit(p) >= 0); return; }
    var t = drag.t;
    if (drag.kind === 'swap') { drag.mx = p.x; drag.my = p.y; var j = hit(p, t); drag.target = j < 0 ? null : st.tiles[j]; }
    else if (drag.kind === 'size') { t.w = p.x - drag.ox; t.h = p.y - drag.oy; clampTile(t); }
    else {
      var iw = t.img.naturalWidth, ih = t.img.naturalHeight, r = C.coverCrop(iw, ih, t.w, t.h, t.z, t.fx, t.fy);
      var free = [iw - r.sw, ih - r.sh], mx = (p.x - drag.px) * (r.sw / t.w), my = (p.y - drag.py) * (r.sh / t.h);
      if (free[0] > 0.5) t.fx = Math.min(1, Math.max(0, t.fx - mx / free[0]));
      if (free[1] > 0.5) t.fy = Math.min(1, Math.max(0, t.fy - my / free[1]));
      drag.px = p.x; drag.py = p.y;
    }
    draw(); syncUI();
  });
  function end() {
    if (drag && drag.kind === 'swap' && drag.target) { C.swapRects(drag.t, drag.target); }
    drag = null; cv.classList.remove('drag'); draw(); syncUI(); }
  cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
  cv.addEventListener('dblclick', function (e) { var i = hit(pt(e)); if (i < 0) return; homeTile(st.tiles[i]); draw(); syncUI(); });
  cv.addEventListener('wheel', function (e) {
    var i = hit(pt(e)); if (i < 0) return;
    e.preventDefault(); var t = st.tiles[i]; st.sel = t;
    t.z = Math.min(5, Math.max(1, t.z * (e.deltaY < 0 ? 1.08 : 1 / 1.08))); draw(); syncUI();
  }, { passive: false });
  window.addEventListener('resize', function () { draw(); });

  // ---- збереження й обмін ----
  function dl(name, blob) { var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000); }
  // Формат: версія 3 додає blank (фото вимкнено); версія 2 додає режим розкладки й дані кадру кожного фото (за порядком); версія 1 (лише налаштування) читається як раніше.
  function cfgJson() {
    return JSON.stringify({
      app: 'photo-collage', v: 3, blank: st.blank, w: st.w, h: st.h, gap: st.gap, bg: st.bg, preset: st.preset, seed: st.seed, mode: st.mode, count: st.tiles.length,
      tiles: st.tiles.map(function (t) { return { x: t.x, y: t.y, w: t.w, h: t.h, z: +t.z.toFixed(3), fx: +t.fx.toFixed(3), fy: +t.fy.toFixed(3) }; })
    }, null, 2);
  }
  $('btnJson').onclick = function () { dl('photo-collage.json', new Blob([cfgJson()], { type: 'application/json' })); };
  $('btnCopyJson').onclick = function () { (navigator.clipboard ? navigator.clipboard.writeText(cfgJson()) : Promise.reject()).then(function () { toast('Скопійовано!'); }, function () { toast('Не вдалося скопіювати'); }); };
  $('btnImport').onclick = function () { $('fileImport').click(); };
  $('fileImport').onchange = function () {
    var f = this.files[0]; this.value = ''; if (!f) return;
    var rd = new FileReader();
    rd.onload = function () {
      try {
        var d = JSON.parse(rd.result); if (d.app !== 'photo-collage') throw 0;
        st.w = Math.min(6000, Math.max(200, d.w | 0)); st.h = Math.min(6000, Math.max(200, d.h | 0));
        st.gap = Math.min(80, Math.max(0, d.gap | 0)); st.bg = /^#[0-9a-f]{6}$/i.test(d.bg) ? d.bg : st.bg; st.preset = d.preset || 'custom'; st.seed = d.seed | 0;
        st.mode = C.MODES[d.mode] ? d.mode : 'tree'; st.blank = d.blank === true;
        syncUI(); save(); relayout();
        if (Array.isArray(d.tiles) && d.tiles.length === st.tiles.length) {
          d.tiles.forEach(function (q, i) {
            var t = st.tiles[i]; if (!q) return;
            t.x = q.x | 0; t.y = q.y | 0; t.w = q.w > 0 ? q.w : t.w; t.h = q.h > 0 ? q.h : t.h;
            t.z = Math.min(5, Math.max(1, +q.z || 1)); t.fx = Math.min(1, Math.max(0, q.fx == null ? 0.5 : +q.fx)); t.fy = Math.min(1, Math.max(0, q.fy == null ? 0.5 : +q.fy));
          });
          draw(); syncUI();
        }
        toast('Налаштування завантажено');
      } catch (e) { toast('Це не файл колажу'); }
    };
    rd.readAsText(f);
  };
  $('btnPng').onclick = function () { if (!st.tiles.length) return toast('Спершу додай фото'); draw(true); cv.toBlob(function (b) { dl(st.blank ? 'collage-layout.png' : 'collage.png', b); draw(); }, 'image/png'); };

  syncUI(); draw();
})();
