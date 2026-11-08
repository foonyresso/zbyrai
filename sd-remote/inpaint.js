// Вкладка «Перемалювання»: зафарбовуєш ділянку картинки (пензель, гумка, прямокутник), пишеш свій промпт (порожньо = промпт картинки),
// обираєш силу зміни 0.05–1. Розмір обробки підбирається автоматично за ділянкою (1024 / 1344 / 1536, кратно 64). ADetailer і апскейл не застосовуються.
// Логіка: inpaint-core.js. Результат — нова картинка в історії.
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var I = window.SDInpaint, V = window.SDViewer, PT = window.PromptTools;
  var host = null, st = null, job = null, wrap = null, mk = null, ctx = null, w = 0, h = 0, tool = 'brush', size = 40, hist = [], infoT = 0, edI = null, edN = null;

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function snap() { var c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(mk, 0, 0); hist.push(c); if (hist.length > 10) hist.shift(); }
  function undo() { var c = hist.pop(); if (!c) return; ctx.clearRect(0, 0, w, h); ctx.drawImage(c, 0, 0); info(); }
  function clearMask() { if (!mk) return; snap(); ctx.clearRect(0, 0, w, h); info(); }
  function invert() {
    if (!mk) return; snap(); var t = document.createElement('canvas'); t.width = w; t.height = h; t.getContext('2d').drawImage(mk, 0, 0);
    ctx.clearRect(0, 0, w, h); ctx.fillStyle = '#ff3b6b'; ctx.fillRect(0, 0, w, h); ctx.globalCompositeOperation = 'destination-out'; ctx.drawImage(t, 0, 0); ctx.globalCompositeOperation = 'source-over'; info();
  }
  function bbox() { if (!mk) return null; var d = ctx.getImageData(0, 0, w, h); return I.maskBBox(d.data, w, h); }
  function info() {   // авто-розмір обробки за ділянкою (з невеликою затримкою, поки малюєш)
    clearTimeout(infoT);
    infoT = setTimeout(function () {
      var b = bbox(), t = $('inpInfo');
      if (!job) { t.textContent = ''; return; }
      if (!b) { t.textContent = 'Зафарбуй ділянку, яку треба перемалювати.'; return; }
      var z = I.inpaintSize(b, w, h);
      t.textContent = 'Ділянка ' + b.w + '×' + b.h + ' px → обробка ' + z.w + '×' + z.h + ' (підібрано автоматично), результат вставиться назад у картинку.';
    }, 120);
  }

  // інструменти для сцени зі viewer.js: координати вже в пікселях картинки
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
    tool = t; if (st) st.tool = tools[t] || null; if (st) st.stage.classList.toggle('tool', !!tools[t]);
    document.querySelectorAll('#inpToolSeg button').forEach(function (b) { b.classList.toggle('on', b.dataset.t === t); });
  }

  function open(j) {
    job = j; host.state.inp.src = j.id; host.save(); host.setTab('inp'); hist = [];
    var box0 = $('inpStage'); box0.textContent = ''; st = null;
    var im = new Image(); im.draggable = false;
    im.onload = function () {
      w = im.naturalWidth; h = im.naturalHeight; wrap = el('div', 'inpwrap'); mk = document.createElement('canvas'); mk.width = w; mk.height = h; mk.className = 'inpmask'; ctx = mk.getContext('2d');
      im.className = 'inpimg'; wrap.appendChild(im); wrap.appendChild(mk);
      st = V.makeStage(box0); st.set(wrap, w, h); pick(tool); info();
      var sz = Math.max(8, Math.round(Math.max(w, h) / 40)); size = sz; $('inpBrush').max = Math.max(200, sz * 4); $('inpBrush').value = size;
      $('inpPick').textContent = 'Картинка: ' + (j.prompt || '').slice(0, 70);
    };
    im.onerror = function () { host.toast('Не вдалося відкрити картинку (її могло бути видалено з сервера)'); };
    im.src = host.imgUrl(j); recent();
  }

  function recent() {
    var r = $('inpRecent'); r.textContent = '';
    host.jobs().filter(function (j) { return j.status === 'done'; }).slice(-14).reverse().forEach(function (j) {
      var b = el('button', 'rth' + (job && job.id === j.id ? ' on' : '')); b.type = 'button'; b.title = 'Перемалювати цю картинку: ' + (j.prompt || '');
      var im = el('img'); im.src = host.imgUrl(j); im.alt = ''; im.loading = 'lazy'; b.appendChild(im); b.addEventListener('click', function () { open(j); }); r.appendChild(b);
    });
    if (!r.children.length) r.appendChild(el('p', 'hint', 'Спершу згенеруй картинку, потім натисни на ній «Перемалювати».'));
  }

  function go() {
    if (!job || !mk) return host.toast('Спершу обери картинку (кнопка «Перемалювати» на картинці)');
    var d = ctx.getImageData(0, 0, w, h), b = I.maskBBox(d.data, w, h);
    if (!b) return host.toast('Зафарбуй ділянку для перемалювання');
    var z = I.inpaintSize(b, w, h), px = new Uint8ClampedArray(d.data); I.toBinaryMask(px);
    var c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').putImageData(new ImageData(px, w, h), 0, 0);
    $('inpGo').disabled = true;
    c.toBlob(function (blob) {
      var fr = new FileReader();
      fr.onload = function () {
        var mask = String(fr.result).split(',')[1], S = host.state, text = $('inpPrompt').value.trim() || job.prompt || '';
        host.enqueue({ kind: 'inpaint', prompt: PT.joinPrompt(text, S.loras), negative: $('inpNeg').value.trim() || S.neg, steps: S.steps, seed: -1, srcId: job.id, mask: mask, denoise: S.inp.denoise, width: z.w, height: z.h, padding: z.padding, blur: 8 },
          { kind: 'inpaint', srcId: job.id, prompt: text, neg: $('inpNeg').value.trim() || S.neg, loras: JSON.parse(JSON.stringify(S.loras)), w: w, h: h, upscale: 1, adOn: false, denoise: S.inp.denoise, work: z.w + '×' + z.h })
          .then(function () { $('inpGo').disabled = false; }, function () { $('inpGo').disabled = false; });
      };
      fr.readAsDataURL(blob);
    }, 'image/png');
  }

  window.SDInp = {
    open: open,
    show: function () { recent(); if (!job && host.state.inp.src) { var j = host.jobs().filter(function (x) { return x.id === host.state.inp.src && x.status === 'done'; })[0]; if (j) open(j); } },
    init: function (h0) {
      host = h0; var S = host.state;
      $('inpDn').value = S.inp.denoise; $('inpDnV').textContent = S.inp.denoise;
      $('inpDn').addEventListener('input', function () { S.inp.denoise = +this.value; $('inpDnV').textContent = this.value; host.save(); });
      $('inpPrompt').value = S.inp.prompt; $('inpNeg').value = S.inp.neg;
      edI = window.PromptEditor.create({ ta: $('inpPrompt'), mirror: $('mI'), bar: $('wI'), onInput: function (t) { S.inp.prompt = t; host.save(); } }); edI.set(S.inp.prompt);
      edN = window.PromptEditor.create({ ta: $('inpNeg'), mirror: $('mIN'), bar: $('wIN'), onInput: function (t) { S.inp.neg = t; host.save(); } }); edN.set(S.inp.neg);
      if (window.SDAutocomplete) { SDAutocomplete.attach($('inpPrompt')); SDAutocomplete.attach($('inpNeg')); }
      document.querySelectorAll('#inpToolSeg button').forEach(function (b) { b.addEventListener('click', function () { pick(b.dataset.t); }); });
      $('inpBrush').addEventListener('input', function () { size = +this.value; });
      $('inpUndo').addEventListener('click', undo); $('inpClear').addEventListener('click', clearMask); $('inpInvert').addEventListener('click', invert); $('inpGo').addEventListener('click', go);
      document.addEventListener('keydown', function (e) { if (!$('vInp').hidden && (e.ctrlKey || e.metaKey) && (window.zbKey ? window.zbKey(e) : e.key) === 'z' && document.activeElement.tagName !== 'TEXTAREA') { e.preventDefault(); undo(); } });
    },
  };
})();
