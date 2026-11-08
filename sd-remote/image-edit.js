// Редактор картинки (канвас, без бібліотек): кадрування, пензель, текст, поворот/віддзеркалення, корекція, відміна/повтор.
// Відкривається з вікна перегляду (viewer.js). Результат завантажується як WebP/PNG. Історія — до 12 кроків.
(function () {
  var V = window.SDViewer, el = V.el, btn = V.btn;

  function open(img, o) {
    var root = el('div', 've'), top = el('div', 'vtop'), opt = el('div', 'vopt'), body = el('div', 'vbody');
    var cv = document.createElement('canvas'), ctx = cv.getContext('2d'), st, tool = 'hand', hist = [], hi = -1, cropBox = null, cropRect = null;
    var cfg = { color: '#ff3b6b', size: Math.max(4, Math.round(img.naturalWidth / 160)), text: 'Текст', tsize: Math.max(24, Math.round(img.naturalWidth / 14)), outline: true, ratio: 0, fmt: 'webp' };
    cv.width = img.naturalWidth; cv.height = img.naturalHeight; ctx.drawImage(img, 0, 0);

    function snap() { var c = document.createElement('canvas'); c.width = cv.width; c.height = cv.height; c.getContext('2d').drawImage(cv, 0, 0); return c; }
    function push() { hist = hist.slice(0, hi + 1); hist.push(snap()); if (hist.length > 12) hist.shift(); hi = hist.length - 1; btns(); }
    function restore(i) {
      var c = hist[i], resized = c.width !== cv.width || c.height !== cv.height; hi = i; cv.width = c.width; cv.height = c.height; ctx.drawImage(c, 0, 0);
      st.set(cv, cv.width, cv.height, !resized); clearCrop(); btns();
    }
    function btns() { undoB.disabled = hi <= 0; redoB.disabled = hi >= hist.length - 1; }
    function close() { document.removeEventListener('keydown', onKey, true); root.remove(); }
    function onKey(e) {
      var k = window.zbKey ? window.zbKey(e) : e.key.toLowerCase();
      if (e.key === 'Escape') { e.stopPropagation(); close(); return; }
      if ((e.ctrlKey || e.metaKey) && k === 'z') { e.preventDefault(); if (e.shiftKey) { if (hi < hist.length - 1) restore(hi + 1); } else if (hi > 0) restore(hi - 1); }
      if ((e.ctrlKey || e.metaKey) && k === 'y') { e.preventDefault(); if (hi < hist.length - 1) restore(hi + 1); }
    }
    document.addEventListener('keydown', onKey, true);

    // --- перетворення
    function transform(w, h, draw) { var c = document.createElement('canvas'); c.width = w; c.height = h; var x = c.getContext('2d'); draw(x); cv.width = w; cv.height = h; ctx.drawImage(c, 0, 0); st.set(cv, w, h); clearCrop(); push(); }
    function rotate(dir) { var w = cv.width, h = cv.height, s = snap(); transform(h, w, function (x) { x.translate(h / 2, w / 2); x.rotate(dir * Math.PI / 2); x.drawImage(s, -w / 2, -h / 2); }); }
    function flip(hz) { var w = cv.width, h = cv.height, s = snap(); transform(w, h, function (x) { if (hz) { x.translate(w, 0); x.scale(-1, 1); } else { x.translate(0, h); x.scale(1, -1); } x.drawImage(s, 0, 0); }); }

    // --- кадрування
    function clearCrop() { if (cropBox) { cropBox.remove(); cropBox = null; } cropRect = null; applyB && (applyB.hidden = true); }
    function drawCrop() {
      if (!cropBox) { cropBox = el('div', 'cropbox'); st.holder.appendChild(cropBox); }
      cropBox.style.left = cropRect.x + 'px'; cropBox.style.top = cropRect.y + 'px'; cropBox.style.width = cropRect.w + 'px'; cropBox.style.height = cropRect.h + 'px';
    }
    var cropStart = null;
    var tools = {
      hand: null,
      crop: {
        down: function (e, p) { cropStart = { x: Math.max(0, Math.min(cv.width, p.x)), y: Math.max(0, Math.min(cv.height, p.y)) }; cropRect = { x: cropStart.x, y: cropStart.y, w: 0, h: 0 }; drawCrop(); return true; },
        move: function (e, p) {
          var x = Math.max(0, Math.min(cv.width, p.x)), y = Math.max(0, Math.min(cv.height, p.y)), w = x - cropStart.x, h = y - cropStart.y;
          if (cfg.ratio) { var a = Math.abs(w), b = Math.abs(h); if (a / (b || 1) > cfg.ratio) a = b * cfg.ratio; else b = a / cfg.ratio; w = Math.sign(w || 1) * a; h = Math.sign(h || 1) * b; }
          cropRect = { x: w < 0 ? cropStart.x + w : cropStart.x, y: h < 0 ? cropStart.y + h : cropStart.y, w: Math.abs(w), h: Math.abs(h) };
          if (cropRect.x + cropRect.w > cv.width) cropRect.w = cv.width - cropRect.x; if (cropRect.y + cropRect.h > cv.height) cropRect.h = cv.height - cropRect.y;
          drawCrop();
        },
        up: function () { applyB.hidden = !(cropRect && cropRect.w > 8 && cropRect.h > 8); },
      },
      brush: {
        down: function (e, p) { ctx.lineCap = ctx.lineJoin = 'round'; ctx.strokeStyle = ctx.fillStyle = cfg.color; ctx.lineWidth = cfg.size; ctx.beginPath(); ctx.arc(p.x, p.y, cfg.size / 2, 0, 7); ctx.fill(); ctx.beginPath(); ctx.moveTo(p.x, p.y); return true; },
        move: function (e, p) { ctx.lineTo(p.x, p.y); ctx.stroke(); },
        up: function () { push(); },
      },
      text: {
        down: function (e, p) {
          var t = cfg.text.trim(); if (!t) return false;
          ctx.font = 'bold ' + cfg.tsize + 'px system-ui, sans-serif'; ctx.textBaseline = 'middle'; ctx.textAlign = 'center'; ctx.lineJoin = 'round';
          if (cfg.outline) { ctx.strokeStyle = '#000'; ctx.lineWidth = Math.max(2, cfg.tsize / 8); ctx.strokeText(t, p.x, p.y); }
          ctx.fillStyle = cfg.color; ctx.fillText(t, p.x, p.y); return true;
        },
        up: function () { push(); },
      },
    };
    function applyCrop() {
      if (!cropRect || cropRect.w < 8) return; var r = { x: Math.round(cropRect.x), y: Math.round(cropRect.y), w: Math.round(cropRect.w), h: Math.round(cropRect.h) }, s = snap();
      transform(r.w, r.h, function (x) { x.drawImage(s, r.x, r.y, r.w, r.h, 0, 0, r.w, r.h); });
    }

    // --- корекція (яскравість, контраст, насиченість)
    var adj = { b: 100, c: 100, s: 100 };
    function adjCss() { return 'brightness(' + adj.b + '%) contrast(' + adj.c + '%) saturate(' + adj.s + '%)'; }
    function bake() {
      if (adj.b === 100 && adj.c === 100 && adj.s === 100) return; var s = snap();
      ctx.filter = adjCss(); ctx.clearRect(0, 0, cv.width, cv.height); ctx.drawImage(s, 0, 0); ctx.filter = 'none';
      adj = { b: 100, c: 100, s: 100 }; cv.style.filter = ''; push(); buildOpts();
    }

    // --- панель параметрів інструмента
    function field(label, input) { var l = el('label', 'vf', label + ' '); l.appendChild(input); return l; }
    function range(min, max, val, fn) { var r = el('input'); r.type = 'range'; r.min = min; r.max = max; r.value = val; r.addEventListener('input', function () { fn(+r.value); }); return r; }
    function color() { var c = el('input'); c.type = 'color'; c.value = cfg.color; c.title = 'Колір'; c.addEventListener('input', function () { cfg.color = c.value; }); return c; }
    var applyB;
    function buildOpts() {
      opt.textContent = ''; applyB = null;
      if (tool === 'hand') opt.appendChild(el('span', 'hint', 'Перетягуй картинку, колесо мишки зумить. Обери інструмент зверху.'));
      if (tool === 'brush') { opt.appendChild(field('Колір', color())); opt.appendChild(field('Товщина', range(1, Math.max(60, cfg.size * 4), cfg.size, function (v) { cfg.size = v; }))); }
      if (tool === 'text') {
        var t = el('input'); t.type = 'text'; t.value = cfg.text; t.placeholder = 'Текст'; t.title = 'Текст, який з’явиться після кліку на картинці'; t.addEventListener('input', function () { cfg.text = t.value; });
        var ol = el('input'); ol.type = 'checkbox'; ol.checked = cfg.outline; ol.addEventListener('change', function () { cfg.outline = ol.checked; });
        opt.appendChild(field('Текст', t)); opt.appendChild(field('Колір', color())); opt.appendChild(field('Розмір', range(10, Math.max(200, cfg.tsize * 3), cfg.tsize, function (v) { cfg.tsize = v; }))); opt.appendChild(field('Обведення', ol));
        opt.appendChild(el('span', 'hint', 'Клікни на картинку, щоб поставити текст.'));
      }
      if (tool === 'crop') {
        [['Вільно', 0], ['1:1', 1], ['3:4', 3 / 4], ['4:3', 4 / 3], ['9:16', 9 / 16], ['16:9', 16 / 9]].forEach(function (r) {
          var b = btn(r[0], 'Пропорції рамки кадрування', function () { cfg.ratio = r[1]; buildOpts(); }, cfg.ratio === r[1] ? 'on' : ''); opt.appendChild(b);
        });
        opt.appendChild(el('span', 'hint', 'Обведи ділянку, потім «Обрізати».'));
        applyB = btn('✓ Обрізати', 'Застосувати кадрування', applyCrop, 'btn-main'); applyB.hidden = !(cropRect && cropRect.w > 8); opt.appendChild(applyB);
        opt.appendChild(btn('Скасувати рамку', 'Прибрати рамку', clearCrop));
      }
      if (tool === 'adjust') {
        if (!('filter' in CanvasRenderingContext2D.prototype)) { opt.appendChild(el('span', 'hint', 'Цей браузер не підтримує корекцію кольору. Спробуй Chrome чи Firefox.')); return; }
        [['Яскравість', 'b'], ['Контраст', 'c'], ['Насиченість', 's']].forEach(function (a) { opt.appendChild(field(a[0], range(40, 180, adj[a[1]], function (v) { adj[a[1]] = v; cv.style.filter = adjCss(); }))); });
        opt.appendChild(btn('✓ Застосувати', 'Закріпити корекцію', bake, 'btn-main'));
        opt.appendChild(btn('Скинути', 'Повернути повзунки', function () { adj = { b: 100, c: 100, s: 100 }; cv.style.filter = ''; buildOpts(); }));
      }
    }
    function pick(t) {
      if (tool === 'adjust' && t !== 'adjust') { adj = { b: 100, c: 100, s: 100 }; cv.style.filter = ''; }
      tool = t; clearCrop(); st.tool = tools[t] || null; st.stage.classList.toggle('tool', !!tools[t]);
      toolBtns.forEach(function (b) { b.classList.toggle('on', b.dataset.t === t); }); buildOpts();
    }

    // --- верхня панель
    var toolBtns = [];
    [['hand', '✋ Рука', 'Рухати й зумити картинку'], ['crop', '✂ Кадр', 'Кадрування'], ['brush', '🖌 Пензель', 'Малювати'], ['text', 'T Текст', 'Додати текст'], ['adjust', '◐ Корекція', 'Яскравість, контраст, насиченість']].forEach(function (t) {
      var b = btn(t[1], t[2], function () { pick(t[0]); }); b.dataset.t = t[0]; toolBtns.push(b); top.appendChild(b);
    });
    top.appendChild(el('span', 'sep'));
    top.appendChild(btn('↺', 'Повернути на 90° проти годинникової', function () { rotate(-1); }));
    top.appendChild(btn('↻', 'Повернути на 90° за годинниковою', function () { rotate(1); }));
    top.appendChild(btn('⇋', 'Віддзеркалити по горизонталі', function () { flip(true); }));
    top.appendChild(btn('⇅', 'Віддзеркалити по вертикалі', function () { flip(false); }));
    top.appendChild(el('span', 'sep'));
    var undoB = btn('↶ Скасувати', 'Скасувати дію (Ctrl+Z)', function () { if (hi > 0) restore(hi - 1); });
    var redoB = btn('↷ Повторити', 'Повторити скасовану дію (Ctrl+Y)', function () { if (hi < hist.length - 1) restore(hi + 1); });
    top.appendChild(undoB); top.appendChild(redoB);
    top.appendChild(btn('⟲ Оригінал', 'Повернути початкову картинку (можна скасувати)', function () { if (hi > 0) restore(0); push(); }));
    top.appendChild(el('span', 'grow'));
    var fmt = el('select'); [['webp', 'WebP'], ['png', 'PNG'], ['jpeg', 'JPEG']].forEach(function (f) { var op = el('option', '', f[1]); op.value = f[0]; fmt.appendChild(op); }); fmt.title = 'Формат файлу'; fmt.addEventListener('change', function () { cfg.fmt = fmt.value; });
    top.appendChild(fmt);
    top.appendChild(btn('⭳ Зберегти', 'Завантажити відредаговану картинку', function () {
      bake(); var type = 'image/' + cfg.fmt;
      cv.toBlob(function (b) { if (!b) return; var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = ((o.name || 'sd').replace(/\.\w+$/, '')) + '-edit.' + (cfg.fmt === 'jpeg' ? 'jpg' : cfg.fmt); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 5000); if (o.onSaved) o.onSaved(b); }, type, 0.95);
    }, 'btn-main'));
    top.appendChild(btn('×', 'Закрити редактор (Esc); незбережені зміни пропадуть', close, 'vx'));

    root.appendChild(top); root.appendChild(opt); root.appendChild(body); (o.parent || document.body).appendChild(root);
    st = V.makeStage(body); st.set(cv, cv.width, cv.height);
    hist = []; hi = -1; push(); pick('hand');
  }
  window.SDImageEdit = { open: open };
})();
