// Вкладка «Перемалювання»: зафарбовуєш ділянку (пензель, гумка, прямокутник), пишеш свій промпт (порожньо = промпт картинки),
// обираєш силу зміни 0.05–1. Розмір обробки підбирається автоматично за ділянкою (1024 / 1344 / 1536, кратно 64). ADetailer і апскейл не застосовуються.
// Під час перемалювання стара картинка лишається, поверх неї індикатор; результат додається у версії (мініатюри), їх можна порівняти повзунком «до / після»
// й обрати будь-яку для наступного перемалювання. Вкладка не перемикається на «Генерацію». Логіка: inpaint-core.js.
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var I = window.SDInpaint, V = window.SDViewer, PT = window.PromptTools;
  var host = null, st = null, cur = null, wrap = null, im = null, mk = null, ctx = null, w = 0, h = 0, tool = 'brush', size = 40, hist = [], infoT = 0;
  var sending = false, cmpOn = false, cmpPct = 50, cmpEl = null, cmpImg = null, handle = null, lblL = null, lblR = null, sig = '', notified = {}, cursor = null;

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  var chain = function () { return host.state.inp.chain; };
  var jobById = function (id) { return host.jobs().filter(function (x) { return x.id === id; })[0]; };
  function versions() { return chain().map(jobById).filter(function (j) { return j && j.status === 'done'; }); }
  function setSrc(node, url) { if (node.dataset.u !== url) { node.dataset.u = url; node.src = url; } }   // не перезавантажувати те саме
  function pendingFor(id) { return host.jobs().filter(function (j) { return (j.kind === 'inpaint' || j.kind === 'facefix') && j.srcId === id && (j.status === 'queued' || j.status === 'running'); })[0]; }

  // ---- маска
  function snap() { var c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(mk, 0, 0); hist.push(c); if (hist.length > 10) hist.shift(); }
  function undo() { var c = hist.pop(); if (!c || !mk) return; ctx.clearRect(0, 0, w, h); ctx.drawImage(c, 0, 0); info(); }
  function clearMask() { if (!mk) return; snap(); ctx.clearRect(0, 0, w, h); info(); }
  function invert() {
    if (!mk) return; snap(); var t = document.createElement('canvas'); t.width = w; t.height = h; t.getContext('2d').drawImage(mk, 0, 0);
    ctx.clearRect(0, 0, w, h); ctx.fillStyle = '#ff3b6b'; ctx.fillRect(0, 0, w, h); ctx.globalCompositeOperation = 'destination-out'; ctx.drawImage(t, 0, 0); ctx.globalCompositeOperation = 'source-over'; info();
  }
  function bbox() { if (!mk) return null; return I.maskBBox(ctx.getImageData(0, 0, w, h).data, w, h); }
  function info() {   // авто-розмір обробки за ділянкою (з невеликою затримкою, поки малюєш)
    clearTimeout(infoT);
    infoT = setTimeout(function () {
      var b = bbox(), t = $('inpInfo');
      if (!cur) { t.textContent = ''; return; }
      if (!b) { t.textContent = 'Зафарбуй ділянку, яку треба перемалювати.'; return; }
      var z = I.inpaintSize(b, w, h);
      t.textContent = 'Ділянка ' + b.w + '×' + b.h + ' px → обробка ' + z.w + '×' + z.h + ' (підібрано автоматично), результат вставиться назад у картинку.';
    }, 120);
  }

  // ---- інструменти (координати вже в пікселях картинки)
  var painting = null, box = null;
  var tools = {
    brush: { down: function (e, p) { snap(); return begin(p, false); }, move: function (e, p) { stroke(p); }, up: function () { painting = null; info(); } },
    erase: { down: function (e, p) { snap(); return begin(p, true); }, move: function (e, p) { stroke(p); }, up: function () { painting = null; info(); } },
    rect: {
      down: function (e, p) { snap(); box = { x: p.x, y: p.y, el: el('div', 'selbox') }; st.holder.appendChild(box.el); return true; },
      move: function (e, p) { var x = Math.min(box.x, p.x), y = Math.min(box.y, p.y), rw = Math.abs(p.x - box.x), rh = Math.abs(p.y - box.y); box.r = { x: x, y: y, w: rw, h: rh }; var s = box.el.style; s.left = x + 'px'; s.top = y + 'px'; s.width = rw + 'px'; s.height = rh + 'px'; },
      up: function () { if (box.r && box.r.w > 2 && box.r.h > 2) { ctx.fillStyle = '#ff3b6b'; ctx.globalCompositeOperation = 'source-over'; ctx.fillRect(box.r.x, box.r.y, box.r.w, box.r.h); } else hist.pop(); box.el.remove(); box = null; info(); },
    },
  };
  function begin(p, erase) {
    ctx.globalCompositeOperation = erase ? 'destination-out' : 'source-over'; ctx.strokeStyle = ctx.fillStyle = '#ff3b6b'; ctx.lineCap = ctx.lineJoin = 'round'; ctx.lineWidth = size;
    ctx.beginPath(); ctx.arc(p.x, p.y, size / 2, 0, 7); ctx.fill(); ctx.beginPath(); ctx.moveTo(p.x, p.y); painting = true; return true;
  }
  function stroke(p) { if (painting) { ctx.lineTo(p.x, p.y); ctx.stroke(); } }
  function pick(t) {
    tool = t; applyTool();
    document.querySelectorAll('#inpToolSeg button').forEach(function (b) { b.classList.toggle('on', b.dataset.t === t); });
  }
  function applyTool() {   // у режимі порівняння малювати не можна
    var on = !cmpOn && !!tools[tool];
    if (st) { st.tool = on ? tools[tool] : null; st.stage.classList.toggle('tool', on); }
    if (mk) mk.style.visibility = cmpOn ? 'hidden' : 'visible';
    if (!on || (tool !== 'brush' && tool !== 'erase')) hideCursor();
  }

  // ---- курсор-коло: показує справжній розмір пензля з урахуванням зуму
  function moveCursor(e) {
    if (!st || cmpOn || (tool !== 'brush' && tool !== 'erase')) return hideCursor();
    var r = $('inpStage').getBoundingClientRect(), d = Math.max(4, size * st.view.k);
    cursor.style.width = cursor.style.height = d + 'px'; cursor.style.left = (e.clientX - r.left) + 'px'; cursor.style.top = (e.clientY - r.top) + 'px'; cursor.classList.toggle('er', tool === 'erase'); cursor.hidden = false;
  }
  function hideCursor() { if (cursor) cursor.hidden = true; }

  // ---- порівняння «до / після»
  function pair() {   // before = раніша версія, after = пізніша
    var v = versions(), i = v.indexOf(cur);
    if (v.length < 2 || i < 0) return null;
    return i > 0 ? { before: v[i - 1], after: v[i] } : { before: v[0], after: v[1] };
  }
  function setClip() { if (!cmpEl) return; cmpEl.style.clipPath = 'inset(0 ' + (100 - cmpPct) + '% 0 0)'; handle.style.left = cmpPct + '%'; }
  function applyCompare() {
    var pr = cmpOn ? pair() : null;
    if (cmpOn && !pr) { cmpOn = false; host.toast('Для порівняння потрібні щонайменше дві версії'); }
    $('inpCmp').classList.toggle('on', cmpOn);
    if (cmpEl) { cmpEl.hidden = !cmpOn; handle.hidden = !cmpOn; lblL.hidden = lblR.hidden = !cmpOn; }
    if (cmpOn && pr && im) { setSrc(im, host.imgUrl(pr.after)); setSrc(cmpImg, host.imgUrl(pr.before)); setClip(); }
    else if (im && cur) setSrc(im, host.imgUrl(cur));
    applyTool();
  }

  // ---- вибір версії: стара картинка лишається, маска зберігається (зручно повторити ту саму ділянку)
  var pendMask = null;
  function paintMargins(m) {   // маска на нових смугах + невеликий захльост на край оригіналу
    var k = w / m.W, ov = Math.round(m.ov * k), l = Math.round(m.l * k), t = Math.round(m.t * k), r = Math.round(m.r * k), b = Math.round(m.b * k);
    ctx.fillStyle = '#ff3b6b'; ctx.globalCompositeOperation = 'source-over';
    if (t) ctx.fillRect(0, 0, w, t + ov); if (b) ctx.fillRect(0, h - b - ov, w, b + ov);
    if (l) ctx.fillRect(0, 0, l + ov, h); if (r) ctx.fillRect(w - r - ov, 0, r + ov, h);
  }
  function select(j, compare) {
    var keep = mk ? (function () { var c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(mk, 0, 0); return c; })() : null;
    cur = j; host.state.inp.src = j.id; host.save(); hist = []; cmpOn = !!compare;
    var box0 = $('inpStage'); box0.textContent = ''; st = null; $('inpDrop').hidden = true;
    var pr = cmpOn ? pair() : null, img = new Image(); img.draggable = false;
    img.onload = function () {
      img.onload = null;   // подальші зміни src не мають будувати сцену заново
      var first = !mk; w = img.naturalWidth; h = img.naturalHeight; wrap = el('div', 'inpwrap'); im = img; im.className = 'inpimg'; wrap.appendChild(im);
      cmpEl = el('div', 'cmpl'); cmpImg = el('img', 'cmpimg'); cmpImg.draggable = false; cmpEl.appendChild(cmpImg); wrap.appendChild(cmpEl);
      mk = document.createElement('canvas'); mk.width = w; mk.height = h; mk.className = 'inpmask'; ctx = mk.getContext('2d'); wrap.appendChild(mk);
      if (keep && keep.width === w && keep.height === h) ctx.drawImage(keep, 0, 0);
      if (pendMask && cur && cur.id === pendMask.id) { paintMargins(pendMask); pendMask = null; var S0 = host.state.inp; S0.denoise = Math.max(S0.denoise, 0.9); $('inpDn').value = S0.denoise; $('inpDnV').textContent = S0.denoise; host.save(); host.toast('Полотно розширено, нові смуги зафарбовано. Додай опис у промпт (якщо треба) і натисни «Згенерувати»'); }
      lblL = el('span', 'cmpt l', 'ДО'); lblR = el('span', 'cmpt r', 'ПІСЛЯ'); handle = el('div', 'cmph'); handle.title = 'Тягни, щоб порівняти «до» і «після»';
      handle.addEventListener('pointerdown', function (e) { e.stopPropagation(); handle.setPointerCapture(e.pointerId); handle.dragging = true; });
      handle.addEventListener('pointermove', function (e) { if (!handle.dragging) return; var r = wrap.getBoundingClientRect(); cmpPct = Math.max(0, Math.min(100, (e.clientX - r.left) / r.width * 100)); setClip(); });
      handle.addEventListener('pointerup', function () { handle.dragging = false; });
      wrap.appendChild(lblL); wrap.appendChild(lblR); wrap.appendChild(handle);
      st = V.makeStage(box0); st.set(wrap, w, h);
      if (first) { size = Math.max(8, Math.round(Math.max(w, h) / 40)); $('inpBrush').max = Math.max(200, size * 4); $('inpBrush').value = size; }
      applyCompare(); pick(tool); info(); strip(true); busy();
    };
    img.onerror = function () { $('inpDrop').hidden = false; host.toast('Не вдалося відкрити картинку (її могло бути видалено з сервера)'); };
    var u0 = host.imgUrl(pr ? pr.after : j); img.dataset.u = u0; img.src = u0; $('inpPick').textContent = 'Картинка: ' + (j.prompt || '').slice(0, 70);
  }

  // вхід ззовні («Перемалювати» на картинці): продовжує ланцюжок версій або починає новий
  function enter(j) {
    var ch = chain();
    if (ch.indexOf(j.id) < 0) { if ((j.kind === 'inpaint' || j.kind === 'facefix') && ch.indexOf(j.srcId) >= 0) ch.push(j.id); else host.state.inp.chain = [j.id]; }
    if (chain().length > 30) host.state.inp.chain = chain().slice(-30);
    cur = j; host.state.inp.src = j.id; host.save(); host.setTab('inp'); select(j, false); recent();
  }

  // ---- версії (мініатюри) і індикатор
  function strip(force) {
    var v = versions(), pend = chain().map(pendingFor).filter(Boolean);
    var key = v.map(function (j) { return j.id; }).join(',') + '|' + pend.map(function (j) { return j.id + j.status; }).join(',') + '|' + (cur ? cur.id : '') + '|' + cmpOn;
    if (!force && key === sig) return; sig = key;
    var box1 = $('inpVers'); box1.textContent = ''; box1.hidden = !v.length;
    v.forEach(function (j, i) {
      var b = el('button', 'vth' + (cur && cur.id === j.id ? ' on' : '')); b.type = 'button'; b.title = (i === 0 ? 'Оригінал' : 'Версія ' + (i + 1)) + ': обрати для перегляду й наступного перемалювання';
      var t = el('img'); t.src = host.imgUrl(j); t.alt = ''; b.appendChild(t); b.appendChild(el('span', null, i === 0 ? 'Оригінал' : 'Версія ' + (i + 1)));
      b.addEventListener('click', function () { select(j, false); }); box1.appendChild(b);
    });
    pend.forEach(function (j) { var b = el('div', 'vth pend'); b.appendChild(el('div', 'ph', j.status === 'running' ? Math.round((j.progress || 0) * 100) + '%' : '⏳')); b.appendChild(el('span', null, 'Нова версія')); box1.appendChild(b); });
  }
  function busy() {   // стара картинка лишається, поверх неї індикатор
    var p = cur ? pendingFor(cur.id) : null, o = $('inpBusy');
    o.hidden = !p; o.textContent = ''; host.updateGo(); $('faceFix').disabled = !cur || !!p || sending;
    if (p) { var n = host.progressNode(p); if (n) o.appendChild(n); }
  }
  function recent() {
    var r = $('inpRecent'); r.textContent = '';
    host.jobs().filter(function (j) { return j.status === 'done'; }).slice(-14).reverse().forEach(function (j) {
      var b = el('button', 'rth' + (cur && cur.id === j.id ? ' on' : '')); b.type = 'button'; b.title = 'Перемалювати цю картинку: ' + (j.prompt || '');
      var t = el('img'); t.src = host.imgUrl(j); t.alt = ''; t.loading = 'lazy'; b.appendChild(t); b.addEventListener('click', function () { enter(j); }); r.appendChild(b);
    });
    if (!r.children.length) r.appendChild(el('p', 'hint', 'Спершу згенеруй картинку, потім натисни на ній «Перемалювати».'));
  }

  // викликається після кожного оновлення задач: нові версії додаються в ланцюжок, показується прогрес
  function refresh() {
    if (!host) return;
    host.jobs().forEach(function (j) {
      if ((j.kind !== 'inpaint' && j.kind !== 'facefix') || chain().indexOf(j.srcId) < 0 || notified[j.id]) return;
      if (j.status === 'done') {
        notified[j.id] = 1; if (chain().indexOf(j.id) < 0) { chain().push(j.id); host.save(); }
        if (cur && cur.id === j.srcId && !$('vInp').hidden) { setTimeout(function () { select(j, true); }, 50); host.toast('Готово: нова версія. Повзунок показує «до / після».'); }   // автоматично показати результат поруч зі старою
        else if (cur && cur.id === j.srcId) { cur = j; host.state.inp.src = j.id; }
      } else if (j.status === 'error') { notified[j.id] = 1; host.toast((j.kind === 'facefix' ? 'Виправлення обличчя не вдалося: ' : 'Перемалювання не вдалося: ') + (j.error || 'помилка')); }
    });
    if (!$('vInp').hidden) { strip(false); busy(); }
  }

  // ---- Власна картинка: будь-який формат, який відкриває браузер → зменшення до 2560 px по довшій стороні → WebP (запасний JPEG) → на сервер
  var MAXSIDE = 2560, MAXB64 = 1400000;
  function viaImg(file) {
    return new Promise(function (res, rej) { var u = URL.createObjectURL(file), im = new Image(); im.onload = function () { URL.revokeObjectURL(u); res(im); }; im.onerror = function () { URL.revokeObjectURL(u); rej(new Error('format')); }; im.src = u; });
  }
  function loadBitmap(file) {   // createImageBitmap враховує поворот із EXIF; інакше звичайний <img>
    return window.createImageBitmap ? createImageBitmap(file, { imageOrientation: 'from-image' }).catch(function () { return viaImg(file); }) : viaImg(file);
  }
  function canWebp() { try { return document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0; } catch (e) { return false; } }
  function encode(src, w, h) {   // якість знижується, доки файл не влізе в ліміт сервера
    var c = document.createElement('canvas'); c.width = w; c.height = h; var x = c.getContext('2d'), webp = canWebp(), type = webp ? 'image/webp' : 'image/jpeg', qs = [0.92, 0.85, 0.78, 0.7, 0.6, 0.5];
    if (!webp) { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); }
    x.imageSmoothingQuality = 'high'; x.drawImage(src, 0, 0, w, h);
    function tryQ(i) { return new Promise(function (res) { c.toBlob(res, type, qs[i]); }).then(function (b) { if (!b) throw new Error('encode'); return (b.size * 4 / 3 < MAXB64 || i === qs.length - 1) ? b : tryQ(i + 1); }); }
    return tryQ(0);
  }
  function shrink(src, w, h, tries) {
    return encode(src, w, h).then(function (b) {
      if (b.size * 4 / 3 < MAXB64) return { blob: b, w: w, h: h };
      if (tries >= 4) throw new Error('Не вдалося стиснути картинку до ~1 МБ: вибери меншу');
      return shrink(src, Math.round(w * 0.85), Math.round(h * 0.85), tries + 1);
    });
  }
  function toB64(blob) { return new Promise(function (res, rej) { var fr = new FileReader(); fr.onload = function () { res(String(fr.result).split(',')[1]); }; fr.onerror = rej; fr.readAsDataURL(blob); }); }
  function uploadFile(file, opt) {
    if (!file) return;
    opt = opt || {};
    if (!/^image\//.test(file.type || '') && !/\.(jpe?g|png|webp|gif|bmp|avif|heic|heif|tiff?)$/i.test(file.name || '')) return host.toast('Це не схоже на зображення');
    $('inpInfo').textContent = 'Обробка зображення…';
    loadBitmap(file).then(function (bmp) {
      var w0 = bmp.width || bmp.naturalWidth, h0 = bmp.height || bmp.naturalHeight, f = I.fitSize(w0, h0, MAXSIDE);
      return shrink(bmp, f.w, f.h, 0).then(function (r) { return { blob: r.blob, w: r.w, h: r.h, from: w0 + '×' + h0 }; });
    }).then(function (r) {
      $('inpInfo').textContent = 'Завантаження на сервер…';
      return toB64(r.blob).then(function (b64) { return host.api('upload', { method: 'POST', body: JSON.stringify({ image: b64, w: r.w, h: r.h, name: file.name || '' }) }); }).then(function (res) { return { res: res, r: r }; });
    }).then(function (o) {
      var job = { id: o.res.id, status: 'done', kind: 'upload', prompt: opt.prompt != null ? opt.prompt : (file.name || 'своя картинка').replace(/\.[^.]+$/, ''), neg: '', w: o.r.w, h: o.r.h, seed: -1, upscale: 1, loras: [], adOn: false, src: URL.createObjectURL(o.r.blob) };
      host.addUpload(job); if (opt.mask) pendMask = { id: job.id, l: opt.mask.l, t: opt.mask.t, r: opt.mask.r, b: opt.mask.b, ov: opt.mask.ov, W: opt.mask.W }; enter(job);
      host.toast('Завантажено: ' + o.r.from + (o.r.from !== o.r.w + '×' + o.r.h ? ' → ' + o.r.w + '×' + o.r.h : '') + ', WebP ' + Math.round(o.r.blob.size / 1024) + ' КБ');
    }).catch(function (e) {
      $('inpInfo').textContent = '';
      host.toast(e && e.message === 'format' ? 'Браузер не зміг відкрити цей формат (напр. HEIC): збережи як JPG чи PNG' : (e && e.message) || 'Не вдалося завантажити');
    });
  }

  // Виправити лише обличчя: ADetailer по вибраній картинці без перемальовування маскою
  function outInfo() {
    var v = function (id) { return Math.max(0, Math.min(1024, +$(id).value || 0)); };
    var W = w + v('outL') + v('outR'), H = h + v('outT') + v('outB');
    $('outInfo').textContent = 'Новий розмір: ' + W + '×' + H + (Math.max(W, H) > 2560 ? ' (стиснеться до 2560 по довгій стороні)' : '');
  }
  function outpaint() {
    if (!cur || !im) return host.toast('Спершу обери картинку');
    var v = function (id) { return Math.max(0, Math.min(1024, Math.round((+$(id).value || 0) / 8) * 8)); };
    var l = v('outL'), t = v('outT'), r = v('outR'), b = v('outB');
    if (!l && !t && !r && !b) return host.toast('Вкажи, на скільки розширити');
    var W = w + l + r, H = h + t + b, c = document.createElement('canvas'); c.width = W; c.height = H; var x = c.getContext('2d');
    x.imageSmoothingEnabled = false; x.drawImage(im, l, t);   // край розтягується в нові смуги, щоб було від чого відштовхуватись
    if (l) x.drawImage(im, 0, 0, 1, h, 0, t, l, h); if (r) x.drawImage(im, w - 1, 0, 1, h, l + w, t, r, h);
    if (t) x.drawImage(c, 0, t, W, 1, 0, 0, W, t); if (b) x.drawImage(c, 0, t + h - 1, W, 1, 0, t + h, W, b);
    $('outDlg').close();
    c.toBlob(function (blob) {
      if (!blob) return host.toast('Не вдалося створити полотно');
      uploadFile(new File([blob], 'outpaint.png', { type: 'image/png' }), { prompt: cur.prompt || '', mask: { l: l, t: t, r: r, b: b, ov: 16, W: W } });
    }, 'image/png');
  }

  function faceFix() {
    if (sending) return;
    if (!cur) return host.toast('Спершу обери картинку (кнопка «Перемалювати» на картинці або своє зображення)');
    var S = host.state, src = cur, text = $('inpPrompt').value.trim() || src.prompt || '', neg = $('inpNeg').value.trim() || S.neg;
    sending = true; host.updateGo(); $('faceFix').disabled = true;
    host.enqueue({ kind: 'facefix', prompt: PT.joinPrompt(text, S.loras), negative: neg, steps: S.steps, seed: -1, srcId: src.id, adPrompt: S.adPrompt, adNeg: S.adNeg },
      { kind: 'facefix', srcId: src.id, prompt: text, neg: neg, loras: JSON.parse(JSON.stringify(S.loras)), w: src.w, h: src.h, upscale: 1, adOn: true, adPrompt: S.adPrompt, adNeg: S.adNeg }, { stay: true })
      .then(function () { sending = false; busy(); strip(true); }, function () { sending = false; busy(); });
  }

  function go() {
    if (sending) return;
    if (!cur || !mk) return host.toast('Спершу обери картинку (кнопка «Перемалювати» на картинці)');
    var d = ctx.getImageData(0, 0, w, h), b = I.maskBBox(d.data, w, h);
    if (!b) return host.toast('Зафарбуй ділянку для перемалювання');
    var z = I.inpaintSize(b, w, h), px = new Uint8ClampedArray(d.data); I.toBinaryMask(px);
    var c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').putImageData(new ImageData(px, w, h), 0, 0);
    var src = cur; sending = true; host.updateGo();
    c.toBlob(function (blob) {
      var fr = new FileReader();
      fr.onload = function () {
        var mask = String(fr.result).split(',')[1], S = host.state, text = $('inpPrompt').value.trim() || src.prompt || '', neg = $('inpNeg').value.trim() || S.neg;
        host.enqueue({ kind: 'inpaint', prompt: PT.joinPrompt(text, S.loras), negative: neg, steps: S.steps, seed: -1, srcId: src.id, mask: mask, denoise: S.inp.denoise, width: z.w, height: z.h, padding: z.padding, blur: 8 },
          { kind: 'inpaint', srcId: src.id, prompt: text, neg: neg, loras: JSON.parse(JSON.stringify(S.loras)), w: w, h: h, upscale: 1, adOn: false, denoise: S.inp.denoise, work: z.w + '×' + z.h }, { stay: true })
          .then(function () { sending = false; busy(); strip(true); }, function () { sending = false; busy(); });
      };
      fr.readAsDataURL(blob);
    }, 'image/png');
  }

  window.SDInp = {
    open: enter, refresh: refresh, run: go, isBusy: function () { return !host ? false : sending || !!(cur && pendingFor(cur.id)); },
    show: function () {
      if (!host) return;
      recent(); strip(true); busy();
      if (!cur && host.state.inp.src) { var j = jobById(host.state.inp.src); if (j && j.status === 'done') { if (chain().indexOf(j.id) < 0) host.state.inp.chain = [j.id]; select(j, false); } }
    },
    init: function (h0) {
      host = h0; var S = host.state;
      $('inpDn').value = S.inp.denoise; $('inpDnV').textContent = S.inp.denoise;
      $('inpDn').addEventListener('input', function () { S.inp.denoise = +this.value; $('inpDnV').textContent = this.value; host.save(); });
      var mkEd = function (ta, mi, bar, key) { var e = window.PromptEditor.create({ ta: $(ta), mirror: $(mi), bar: $(bar), onInput: function (t) { S.inp[key] = t; host.save(); } }); e.set(S.inp[key]); $(ta).value = S.inp[key]; };
      mkEd('inpPrompt', 'mI', 'wI', 'prompt'); mkEd('inpNeg', 'mIN', 'wIN', 'neg');
      $('inpPrompt').addEventListener('keydown', function (e) { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); go(); } });
      if (window.SDAutocomplete) { SDAutocomplete.attach($('inpPrompt')); SDAutocomplete.attach($('inpNeg')); }
      cursor = el('div', 'brushcur'); cursor.hidden = true; $('inpStage').parentNode.appendChild(cursor);
      var stageBox = $('inpStage'); stageBox.addEventListener('pointermove', moveCursor); stageBox.addEventListener('pointerleave', hideCursor); stageBox.addEventListener('wheel', function (e) { setTimeout(function () { moveCursor(e); }, 0); }, { passive: true });
      document.querySelectorAll('#inpToolSeg button').forEach(function (b) { b.addEventListener('click', function () { pick(b.dataset.t); }); });
      $('inpBrush').addEventListener('input', function () { size = +this.value; });
      $('faceFix').addEventListener('click', faceFix);
      $('inpOut').addEventListener('click', function () { if (!cur) return host.toast('Спершу обери картинку'); outInfo(); $('outDlg').showModal(); });
      ['outL', 'outT', 'outR', 'outB'].forEach(function (id) { $(id).addEventListener('input', outInfo); });
      document.querySelectorAll('.out-pre button').forEach(function (bt) { bt.addEventListener('click', function () {
        var o = bt.dataset.o, a = { all: [1, 1, 1, 1], h: [0, 1, 1, 0], v: [1, 0, 0, 1], zero: [0, 0, 0, 0] }[o];
        ['outT', 'outL', 'outR', 'outB'].forEach(function (id, i) { $(id).value = a[i] * 256; }); outInfo(); }); });
      $('outGo').addEventListener('click', outpaint);
      $('inpUndo').addEventListener('click', undo); $('inpClear').addEventListener('click', clearMask); $('inpInvert').addEventListener('click', invert);
      var fileIn = $('inpFile'), box1 = $('inpBox');
      $('inpUpload').addEventListener('click', function () { fileIn.click(); }); $('inpDrop').addEventListener('click', function () { fileIn.click(); });
      fileIn.addEventListener('change', function () { var f = fileIn.files && fileIn.files[0]; fileIn.value = ''; uploadFile(f); });
      ['dragenter', 'dragover'].forEach(function (ev) { box1.addEventListener(ev, function (e) { if (e.dataTransfer && [].indexOf.call(e.dataTransfer.types || [], 'Files') >= 0) { e.preventDefault(); box1.classList.add('over'); } }); });
      ['dragleave', 'drop'].forEach(function (ev) { box1.addEventListener(ev, function () { box1.classList.remove('over'); }); });
      box1.addEventListener('drop', function (e) { var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]; if (f) { e.preventDefault(); uploadFile(f); } });
      document.addEventListener('paste', function (e) {   // Ctrl+V зі скриншота, коли відкрита вкладка перемалювання
        if ($('vInp').hidden || /^(TEXTAREA|INPUT)$/.test((document.activeElement || {}).tagName || '')) return;
        var f = e.clipboardData && e.clipboardData.files && e.clipboardData.files[0]; if (f && /^image\//.test(f.type)) { e.preventDefault(); uploadFile(f); }
      });
      $('inpCmp').addEventListener('click', function () { cmpOn = !cmpOn; if (cmpOn && !pair()) { cmpOn = false; return host.toast('Для порівняння потрібні щонайменше дві версії: перемалюй картинку хоча б раз'); } applyCompare(); strip(true); });
      document.addEventListener('keydown', function (e) { if (!$('vInp').hidden && (e.ctrlKey || e.metaKey) && (window.zbKey ? window.zbKey(e) : e.key) === 'z' && document.activeElement.tagName !== 'TEXTAREA') { e.preventDefault(); undo(); } });
    },
  };
})();
