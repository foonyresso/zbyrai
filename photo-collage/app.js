// Колаж фото: інтерфейс (завантаження фото, полотно, перетягування, експорт). Логіка розкладки — у collage-core.js.
(function () {
  var C = window.CollageCore, $ = function (id) { return document.getElementById(id); };
  var LS = 'pc_';
  var cv = $('cv'), ctx = cv.getContext('2d');
  var st = { w: 2400, h: 1800, gap: 16, bg: '#101014', seed: 1, preset: '4:3', tiles: [] }; // tile: {img, x,y,w,h, hx,hy (позиція за розкладкою)}

  function save() { try { localStorage.setItem(LS + 'cfg', JSON.stringify({ w: st.w, h: st.h, gap: st.gap, bg: st.bg, preset: st.preset })); } catch (e) {} }
  try { var s = JSON.parse(localStorage.getItem(LS + 'cfg') || 'null'); if (s) { st.w = s.w || st.w; st.h = s.h || st.h; st.gap = s.gap == null ? st.gap : s.gap; st.bg = s.bg || st.bg; st.preset = s.preset || st.preset; } } catch (e) {}

  function toast(t) { var el = $('toast'); el.textContent = t; el.classList.add('on'); setTimeout(function () { el.classList.remove('on'); }, 1400); }

  // ---- розкладка ----
  function relayout(newSeed) {
    if (newSeed) st.seed = (Math.random() * 1e9) | 0;
    var cells = C.layout(st.tiles.length, st.w, st.h, st.gap, st.seed);
    st.tiles.forEach(function (t, i) { var c = cells[i]; t.x = t.hx = c.x; t.y = t.hy = c.y; t.w = c.w; t.h = c.h; });
    draw();
  }

  function draw() {
    cv.width = st.w; cv.height = st.h;
    ctx.fillStyle = st.bg; ctx.fillRect(0, 0, st.w, st.h);
    st.tiles.forEach(function (t) {
      var r = C.coverCrop(t.img.naturalWidth, t.img.naturalHeight, t.w, t.h);
      ctx.save(); ctx.beginPath(); ctx.rect(t.x, t.y, t.w, t.h); ctx.clip();
      ctx.drawImage(t.img, r.sx, r.sy, r.sw, r.sh, t.x, t.y, t.w, t.h);
      ctx.restore();
    });
    $('empty').hidden = st.tiles.length > 0;
    $('count').textContent = 'Фото: ' + st.tiles.length;
    $('info').textContent = st.w + ' × ' + st.h + ' px';
  }

  // ---- параметри ----
  var pre = $('preset');
  Object.keys(C.PRESETS).concat(['custom']).forEach(function (k) { var o = document.createElement('option'); o.value = k; o.textContent = k === 'custom' ? 'Свій розмір' : k; pre.appendChild(o); });
  function syncUI() { pre.value = st.preset; $('cw').value = st.w; $('ch').value = st.h; $('gap').value = st.gap; $('gapV').textContent = st.gap; $('bg').value = st.bg; }
  pre.onchange = function () { st.preset = pre.value; if (st.preset !== 'custom') { st.w = C.PRESETS[st.preset][0]; st.h = C.PRESETS[st.preset][1]; } syncUI(); save(); relayout(); };
  function sizeInput() { st.w = Math.min(6000, Math.max(200, +$('cw').value || st.w)); st.h = Math.min(6000, Math.max(200, +$('ch').value || st.h)); st.preset = 'custom'; syncUI(); save(); relayout(); }
  $('cw').onchange = sizeInput; $('ch').onchange = sizeInput;
  $('gap').oninput = function () { st.gap = +this.value; $('gapV').textContent = st.gap; save(); relayout(); };
  $('bg').oninput = function () { st.bg = this.value; save(); draw(); };
  $('btnShuffle').onclick = function () { relayout(true); };
  $('btnReset').onclick = function () { relayout(); };
  $('btnClear').onclick = function () { st.tiles = []; draw(); };

  // ---- додавання фото ----
  function addFiles(files) {
    var list = Array.prototype.filter.call(files, function (f) { return /^image\//.test(f.type); });
    if (!list.length) return toast('Потрібні файли-картинки');
    var left = list.length;
    list.forEach(function (f) {
      var img = new Image(), url = URL.createObjectURL(f);
      img.onload = function () { st.tiles.push({ img: img }); if (--left === 0) relayout(true); };
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

  // ---- ручне пересування ----
  var drag = null;
  function pt(e) { var r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * st.w / r.width, y: (e.clientY - r.top) * st.h / r.height }; }
  function hit(p) { for (var i = st.tiles.length - 1; i >= 0; i--) { var t = st.tiles[i]; if (p.x >= t.x && p.x <= t.x + t.w && p.y >= t.y && p.y <= t.y + t.h) return i; } return -1; }
  cv.addEventListener('pointerdown', function (e) {
    var p = pt(e), i = hit(p); if (i < 0) return;
    var t = st.tiles.splice(i, 1)[0]; st.tiles.push(t); // піднімаємо нагору
    drag = { t: t, dx: p.x - t.x, dy: p.y - t.y }; cv.setPointerCapture(e.pointerId); cv.classList.add('drag'); draw();
  });
  cv.addEventListener('pointermove', function (e) { if (!drag) return; var p = pt(e); drag.t.x = Math.round(p.x - drag.dx); drag.t.y = Math.round(p.y - drag.dy); draw(); });
  function end() { drag = null; cv.classList.remove('drag'); }
  cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
  cv.addEventListener('dblclick', function (e) { var i = hit(pt(e)); if (i < 0) return; st.tiles[i].x = st.tiles[i].hx; st.tiles[i].y = st.tiles[i].hy; draw(); });

  // ---- збереження й обмін ----
  function dl(name, blob) { var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000); }
  function cfgJson() { return JSON.stringify({ app: 'photo-collage', v: 1, w: st.w, h: st.h, gap: st.gap, bg: st.bg, preset: st.preset, seed: st.seed, count: st.tiles.length }, null, 2); }
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
        syncUI(); save(); relayout(); toast('Налаштування завантажено');
      } catch (e) { toast('Це не файл колажу'); }
    };
    rd.readAsText(f);
  };
  $('btnPng').onclick = function () { if (!st.tiles.length) return toast('Спершу додай фото'); cv.toBlob(function (b) { dl('collage.png', b); }, 'image/png'); };

  syncUI(); draw();
})();
