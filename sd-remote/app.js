// Віддалений SD: стан, генерація, прогрес, історія, вхід. Стан у localStorage (sd_state2): токен, налаштування, промпти, LoRA, список задач.
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var C = window.SDClient, PT = window.PromptTools, LS = 'sd_state2';
  var NEG = 'bad quality, worst quality, low quality, lowres, score_1, score_2, jpeg artifacts, logo, watermark,\nbad anatomy, bad hands, fewer fingers, missing fingers,\nflat color, 2d, anime, monochrome,\n(abs, muscular),';
  var D = { mode: 'basic', view: 'img', tab: 'gen', ratio: '9:16', orient: 'v', long: 1344, steps: 8, seed: -1, upscale: 1.65,
    adOn: true, adPrompt: '', adNeg: '', prompt: '', neg: NEG, loras: window.SDLoras.DEFAULT_LIST, templates: [], colors: {}, links: [], loraMeta: {}, loraBy: 'category', loraGroup: '', inp: { src: '', prompt: '', neg: '', denoise: 0.5, chain: [] } };
  var S = Object.assign({ token: '', jobs: [] }, JSON.parse(JSON.stringify(D))), timers = {}, registerMode = false, edP, edN;

  function load() {
    try { var x = JSON.parse(localStorage.getItem(LS) || '{}'); Object.keys(x).forEach(function (k) { if (k in S) S[k] = x[k]; }); } catch (e) { /* не критично */ }
    if (['gen', 'inp', 'lora', 'tpl', 'hist', 'links'].indexOf(S.tab) < 0) S.tab = 'gen';   // напр. прибрана вкладка зі старого збереження
    if (!S.token) { try { var old = JSON.parse(localStorage.getItem('sd_state') || '{}'); if (old.token) S.token = old.token; } catch (e) { /* не критично */ } }
  }
  function save() { try { localStorage.setItem(LS, JSON.stringify(Object.assign({}, S, { jobs: S.jobs.slice(-60).map(function (j) { var c = Object.assign({}, j); delete c.src; delete c.loading; delete c.dl; return c; }) }))); } catch (e) { /* не критично */ } }
  function toast(t) { var el = $('toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(function () { el.classList.remove('show'); }, 3200); }
  function api(path, opt) {
    opt = opt || {}; opt.headers = Object.assign({ 'x-token': S.token, 'content-type': 'application/json' }, opt.headers || {});
    return fetch('/api/sd/' + path, opt).then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || 'Помилка ' + r.status); return j; }); });
  }

  // ---------- сервер увімкнений / недоступний
  function setOnline(p) {
    var o = C.pcText(p), el = $('pcState'); el.className = 'pc ' + o.cls; el.textContent = o.text;
    document.body.classList.toggle('offline', !p || !p.online); $('offline').hidden = !!(p && p.online);
  }
  function ping() { api('ping').then(setOnline, function () { setOnline(null); }); }

  // ---------- розмір, апскейл, перемикачі
  function dims() { return C.sizeFor(S.ratio, S.orient, S.long); }
  function capUpscale(notify) {
    var d = dims(), max = C.maxUpscale(d.w, d.h), hint = $('upHint');
    $('upscale').max = max;
    if (S.upscale > max + 1e-9) { S.upscale = max; if (notify) toast('Апскейл зменшено до ' + max + '×, щоб довга сторона не перевищила ' + C.FINAL_MAX + ' px'); }
    var atMax = max < 2 && S.upscale >= max - 1e-9;
    hint.hidden = !atMax; hint.textContent = atMax ? 'Це максимум для такого розміру: довга сторона результату ' + C.FINAL_MAX + ' px. Більше не варто, зображення ламається.' : '';
  }
  function syncForm() {
    capUpscale(false);
    var d = dims(), f = C.finalSize(d.w, d.h, S.upscale);
    document.querySelectorAll('#ratios button').forEach(function (b) { b.classList.toggle('on', b.dataset.r === S.ratio); });
    $('btnOrient').textContent = S.orient === 'v' ? '⇄ Вертикально' : '⇄ Горизонтально'; $('btnOrient').disabled = S.ratio === '1:1';
    $('long').value = S.long; $('longV').textContent = S.long + ' px';
    $('sizeInfo').textContent = d.w + '×' + d.h + (S.upscale > 1 ? ' → ' + f.w + '×' + f.h : '');
    $('steps').value = S.steps; $('stV').textContent = S.steps;
    $('upscale').value = S.upscale; $('upV').textContent = S.upscale > 1 ? S.upscale + '×' : 'вимкнено';
    $('seed').value = S.seed; $('detOnB').classList.toggle('on', S.adOn); $('detOff').classList.toggle('on', !S.adOn); $('detBtn').disabled = !S.adOn;
    $('seedState').textContent = S.seed < 0 ? 'Seed: випадковий для кожної генерації' : '🔒 Seed зафіксовано: ' + S.seed + ' (кожна генерація буде схожою)'; $('seedState').classList.toggle('warn', S.seed >= 0);
    $('preview').style.setProperty('--ar', (d.w / d.h).toFixed(4)); $('pvTag').textContent = (S.upscale > 1 ? f.w + '×' + f.h : d.w + '×' + d.h) + ' · ' + S.ratio;
  }
  var lastTab = '';
  function syncLayout() {
    if (S.mode !== 'flex') S.view = 'img';
    $('modeBasic').classList.toggle('on', S.mode === 'basic'); $('modeFlex').classList.toggle('on', S.mode === 'flex');
    $('views').hidden = S.mode !== 'flex'; $('viewImg').classList.toggle('on', S.view === 'img'); $('viewTags').classList.toggle('on', S.view === 'tags');
    document.querySelectorAll('#ctabs button').forEach(function (b) { b.classList.toggle('on', b.dataset.tab === S.tab); });
    $('vGen').hidden = S.tab !== 'gen'; $('vLora').hidden = S.tab !== 'lora'; $('vHist').hidden = S.tab !== 'hist'; $('vTpl').hidden = S.tab !== 'tpl'; $('vLinks').hidden = S.tab !== 'links'; $('vInp').hidden = S.tab !== 'inp'; if (S.tab === 'inp' && window.SDInp) SDInp.show(); updateGo();
    if (S.tab !== lastTab) { lastTab = S.tab; if (S.tab === 'lora' && window.SDLoras && S.token) SDLoras.load(); }   // при відкритті вкладки список оновлюється з сервера
    var tags = S.mode === 'flex' && S.view === 'tags';
    $('pvWrap').hidden = tags; $('builder').hidden = !tags;
  }

  // ---------- прогрес і картинки
  function fmtPct(x) { return Math.round(x * 100) + '%'; }
  function bar(frac, label) {
    var w = document.createElement('div'); w.className = 'pg';
    var t = document.createElement('div'); t.className = 'pl'; t.textContent = label;
    var b = document.createElement('div'); b.className = 'pbar' + (frac == null ? ' ind' : ''); var i = document.createElement('i'); if (frac != null) i.style.width = fmtPct(frac); b.appendChild(i);
    w.appendChild(t); w.appendChild(b); return w;
  }
  function stage(j) {   // реальний етап задачі
    if (j.status === 'error') return { text: j.error || 'Помилка' };
    if (j.status === 'queued') return { text: j.text || 'У черзі…', frac: null };
    if (j.status === 'running') {
      var p = j.progress || 0;
      if (p >= 0.999) return { text: 'Передача готової картинки на сервер…', frac: null };
      if (p >= 0.98 && j.adOn) return { text: 'Доопрацювання ADetailer…', frac: null };
      return { text: 'Генерація на сервері: ' + fmtPct(p), frac: p };
    }
    if (j.status === 'done' && j.loading) return { text: 'Завантаження в браузер' + (j.dl != null ? ': ' + fmtPct(j.dl) : '…'), frac: j.dl };
    return null;
  }
  function imgUrl(j) { return j.src || '/api/sd/image?id=' + j.id; }
  function openView(j) { SDViewer.open({ url: imgUrl(j), name: C.fileName(j.prompt, j.seed), onInpaint: function () { SDInp.open(j); } }); }
  function fetchImage(j) {   // справжнє завантаження в браузер із прогресом за байтами
    if (j.src || j.loading) return; j.loading = true; j.dl = null;
    fetch('/api/sd/image?id=' + j.id).then(function (r) {
      if (!r.ok) throw new Error('image'); var total = +r.headers.get('content-length') || 0, type = r.headers.get('content-type') || 'image/webp';
      if (!r.body || !r.body.getReader) return r.blob();
      var rd = r.body.getReader(), parts = [], got = 0;
      return (function pump() { return rd.read().then(function (d) {
        if (d.done) return new Blob(parts, { type: type });
        parts.push(d.value); got += d.value.length; j.dl = total ? Math.min(1, got / total) : null; renderPreview(); return pump();
      }); })();
    }).then(function (b) { j.src = URL.createObjectURL(b); j.loading = false; renderAll(); }, function () { j.loading = false; j.live = false; renderAll(); });
  }
  function renderPreview() {
    var box = $('pvIn'), j = S.jobs[S.jobs.length - 1]; box.textContent = '';
    if (!j) { $('btnSave').disabled = $('btnInp').disabled = true; box.textContent = 'Так виглядатиме рамка картинки'; return; }
    var st = stage(j);
    $('btnSave').disabled = $('btnInp').disabled = !(j.status === 'done' && (j.src || !j.live));
    if (j.status === 'done' && j.live && !j.src && !j.loading) fetchImage(j);
    if (j.status === 'done' && (j.src || !j.live)) {
      var im = document.createElement('img'); im.src = imgUrl(j); im.alt = j.prompt; im.title = 'Відкрити: зум, редагування';
      im.addEventListener('click', function () { openView(j); }); box.appendChild(im);
    } else if (st && j.status === 'error') box.textContent = st.text;
    else if (st) box.appendChild(bar(st.frac, st.text));
  }
  function renderHistory() {
    var g = $('grid'); g.textContent = ''; $('empty').hidden = S.jobs.length > 0;
    S.jobs.slice().reverse().forEach(function (j) {
      var card = document.createElement('div'); card.className = 'card' + (j.status === 'error' ? ' err' : '');
      var fr = document.createElement('div'), st = stage(j); fr.className = 'frame';
      if (j.status === 'done' && (j.src || !j.live)) {
        var im = document.createElement('img'); im.src = imgUrl(j); im.alt = j.prompt; im.loading = 'lazy'; im.title = 'Відкрити: зум, редагування';
        im.addEventListener('click', function () { openView(j); });
        im.addEventListener('error', function () { fr.textContent = 'Картинку видалено з сервера (зберігаються останні 40 і 7 днів)'; }); fr.appendChild(im);
      } else if (st && st.frac !== undefined) fr.appendChild(bar(st.frac, st.text)); else fr.textContent = st ? st.text : '';
      var cap = document.createElement('div'); cap.className = 'cap';
      var pr = document.createElement('span'); pr.className = 'pr'; pr.textContent = j.prompt; pr.title = j.prompt;
      var meta = document.createElement('span'); meta.textContent = j.w + '×' + j.h + (j.upscale > 1 ? ' ×' + j.upscale : '') + (j.seed >= 0 ? ' · seed ' + j.seed : '') + (j.kind === 'inpaint' ? ' · перемалювання ' + (j.denoise || '') : '');
      cap.appendChild(pr); cap.appendChild(meta);
      var acts = document.createElement('div'); acts.className = 'acts';
      var btn = function (label, title, fn) { var b = document.createElement('button'); b.textContent = label; b.title = title; b.addEventListener('click', fn); acts.appendChild(b); };
      if (j.status === 'done') btn('Завантажити', 'Зберегти картинку на комп’ютер', function () { var a = document.createElement('a'); a.href = imgUrl(j); a.download = C.fileName(j.prompt, j.seed); a.click(); });
      if (j.status === 'done') btn('Перемалювати', 'Зафарбувати ділянку цієї картинки й перемалювати', function () { SDInp.open(j); });
      btn('Лог', 'Усі налаштування й теги цієї картинки', function () { openLog(j); });
      if (j.kind !== 'inpaint') btn('Ще раз', 'Підставити промпт і параметри цієї картинки', function () {
        Object.assign(S, { prompt: j.prompt, neg: j.neg, seed: j.reqSeed != null ? j.reqSeed : -1, upscale: j.upscale || 1, adOn: !!j.adOn, adPrompt: j.adPrompt || '', adNeg: j.adNeg || '', loras: JSON.parse(JSON.stringify(j.loras || [])) });
        S.tab = 'gen'; fillEditors(); syncForm(); syncLayout(); SDLoras.render(); save(); toast('Параметри підставлено');
      });
      btn('×', 'Прибрати зі списку', function () { S.jobs = S.jobs.filter(function (x) { return x.id !== j.id; }); save(); renderAll(); });
      cap.appendChild(acts); card.appendChild(fr); card.appendChild(cap); g.appendChild(card);
    });
  }
  function logText(j) {
    var s = j.sent || {}, o = ['=== Надіслано з сайту ==='];
    o.push('Повний промпт (LoRA спочатку, потім теги):\n' + (s.prompt || j.prompt || '—'));
    o.push('Негативний промпт:\n' + (s.negative != null ? s.negative : j.neg || '—'));
    o.push('Розмір: ' + (s.width || j.w) + '×' + (s.height || j.h) + '  ·  Кроки: ' + (s.steps || '—') + '  ·  Апскейл: ' + ((s.upscale || j.upscale || 1) > 1 ? (s.upscale || j.upscale) + '×' : 'вимкнено'));
    o.push('Seed (запит): ' + ((j.reqSeed != null ? j.reqSeed : s.seed) < 0 || (j.reqSeed == null && s.seed == null) ? '-1 (випадковий)' : (j.reqSeed != null ? j.reqSeed : s.seed)) + (j.seed >= 0 ? '  ·  Seed (результат): ' + j.seed : ''));
    if (j.kind === 'inpaint') o.push('Перемалювання: сила зміни ' + (j.denoise || '—') + ', обробка ' + (j.work || '—') + ' (авто), вихідна картинка ' + (j.srcId || '—') + '\nADetailer і апскейл не застосовуються');
    else o.push('ADetailer: ' + (j.adOn ? 'увімкнено' : 'вимкнено') + (j.adOn ? '\n  позитивний: ' + (j.adPrompt || '—') + '\n  негативний: ' + (j.adNeg || '—') : ''));
    o.push('LoRA: ' + ((j.loras || []).length ? j.loras.map(function (l) { return l.name + ' ' + l.w; }).join(', ') : 'немає'));
    var lg = j.log;
    if (lg && lg.saved) o.push('\nФайл на ПК: ' + lg.saved);
    o.push('\n=== Підсумок Forge (infotext) ===\n' + (lg && lg.infotext ? lg.infotext : 'ще немає (з\u2019явиться, коли картинка готова; потрібна нова версія воркера)'));
    if (lg && lg.request) o.push('\n=== Запит воркера до Forge (JSON) ===\n' + JSON.stringify(lg.request, null, 1));
    return o.join('\n');
  }
  function openLog(j) { if (!j) return toast('Ще немає картинок'); $('logPre').textContent = logText(j); $('logDlg').showModal(); }
  function renderAll() { renderPreview(); renderHistory(); if (window.SDInp) SDInp.refresh(); }

  function poll(job) {
    if (timers[job.id]) return;
    timers[job.id] = setInterval(function () {
      api('status?id=' + job.id).then(function (st) {
        var was = job.status; job.status = st.status; job.text = C.queueText(st); job.error = st.error;
        if (st.progress != null) job.progress = Math.max(job.progress || 0, st.progress);
        if (st.info && st.info.seed != null) job.seed = st.info.seed;
        if (st.info && (st.info.infotext || st.info.request)) job.log = { infotext: st.info.infotext || '', request: st.info.request || null, saved: st.info.saved || '' };
        if (st.status === 'done' || st.status === 'error') { clearInterval(timers[job.id]); delete timers[job.id]; if (st.status === 'done' && was !== 'done') job.live = true; save(); }
        renderAll();
      }, function (e) {
        if (/не знайдено/.test(e.message)) { job.status = 'error'; job.error = e.message; clearInterval(timers[job.id]); delete timers[job.id]; save(); renderAll(); }
      });
    }, 1500);
  }
  // Поставити задачу в чергу (генерація чи перемалювання); fields — що показувати про неї в історії
  function enqueue(body, fields, opts) {
    return api('submit', { method: 'POST', body: JSON.stringify(body) }).then(function (r) {
      var shown = Object.assign({}, body); if (shown.mask) shown.mask = '<маска ' + shown.mask.length + ' символів>';
      var job = Object.assign({ id: r.id, status: 'queued', text: 'У черзі…', progress: 0, sent: shown, reqSeed: body.seed, seed: body.seed }, fields);
      S.jobs.push(job); save();
      if (!(opts && opts.stay)) { S.tab = 'gen'; if (S.view === 'tags') S.view = 'img'; }   // перемалювання лишається на своїй вкладці
      syncLayout(); renderAll(); poll(job);
    }, function (e) { toast(e.message); throw e; });
  }
  var submitting = false;
  // Кнопка внизу ліворуч одна: на вкладці «Перемалювання» перемальовує, на інших генерує
  function updateGo() {
    var inp = S.tab === 'inp', b = $('btnGo');
    b.textContent = inp ? '🖌 Перемалювати' : '✨ Згенерувати';
    b.title = inp ? 'Поставити перемалювання в чергу (Ctrl+Enter)' : 'Поставити задачу в чергу (Ctrl+Enter)';
    b.disabled = submitting || (inp && !!window.SDInp && SDInp.isBusy());
    $('btnClearPrompt').title = inp ? 'Очистити промпт перемалювання' : 'Очистити поле промпта';
  }
  function go() {
    if (S.tab === 'inp') return SDInp.run();
    var text = S.prompt.trim(); if (!text) return toast('Напиши промпт');
    var d = dims(), full = PT.joinPrompt(text, S.loras);
    var body = { prompt: full, negative: S.neg, width: d.w, height: d.h, steps: S.steps, seed: S.seed, upscale: S.upscale, adFace: S.adOn, adPrompt: S.adOn ? S.adPrompt : '', adNeg: S.adOn ? S.adNeg : '' };
    submitting = true; updateGo();
    enqueue(body, { prompt: text, neg: S.neg, loras: JSON.parse(JSON.stringify(S.loras)), w: d.w, h: d.h, upscale: S.upscale, adOn: S.adOn, adPrompt: S.adPrompt, adNeg: S.adNeg })
      .then(function () { submitting = false; updateGo(); }, function () { submitting = false; updateGo(); });
  }

  // ---------- вхід і реєстрація
  function started() {
    document.body.classList.add('authed'); $('gate').hidden = true; ping(); SDLoras.load();
    S.jobs.forEach(function (j) { if (j.status === 'queued' || j.status === 'running') poll(j); });
  }
  function checkToken() {
    if (!S.token) { $('gate').hidden = false; return; }
    api('me').then(started, function (e) { if (/увійти/i.test(e.message)) { S.token = ''; save(); } $('gate').hidden = false; });
  }
  function setMode(reg) {
    registerMode = reg; $('gateBtn').textContent = reg ? 'Подати заявку' : 'Увійти';
    $('gateSwitch').textContent = reg ? 'Вже є акаунт? Увійти' : 'Немає акаунта? Подати заявку';
    $('pass').autocomplete = reg ? 'new-password' : 'current-password'; $('gateErr').textContent = ''; $('gateErr').className = 'err';
  }
  function submitGate(e) {
    e.preventDefault();
    var body = JSON.stringify({ login: $('login').value.trim(), password: $('pass').value, hp: $('hp').value }), err = $('gateErr');
    err.className = 'err'; err.textContent = '';
    api(registerMode ? 'register' : 'login', { method: 'POST', body: body }).then(function (r) {
      if (registerMode) { setMode(false); err.className = 'err ok'; err.textContent = 'Заявку подано. Коли власник відкриє доступ, увійди з цим логіном і паролем.'; return; }
      S.token = r.token; save(); started();
    }, function (x) { err.textContent = x.message; });
  }

  // ---------- поля промпта
  function fillEditors() { edP.set(S.prompt); edN.set(S.neg); }
  function insertText(t) {
    var cur = PT.segments(S.prompt).length ? S.prompt.replace(/,\s*$/, '') + ', ' : '';
    S.prompt = cur + t; edP.set(S.prompt); save(); if (window.SDBuilder) SDBuilder.refresh(); toast('Додано в промпт: ' + t);
  }

  function applyTemplate(d) {
    Object.keys(d).forEach(function (k) { S[k] = JSON.parse(JSON.stringify(d[k])); });
    S.tab = 'gen'; fillEditors(); syncForm(); syncLayout(); SDLoras.render(); save();
  }

  function bind() {
    var rs = $('ratios');
    C.RATIOS.forEach(function (r) { var b = document.createElement('button'); b.textContent = r; b.dataset.r = r; b.title = 'Пропорції ' + r; b.addEventListener('click', function () { S.ratio = r; capUpscale(true); syncForm(); save(); }); rs.appendChild(b); });
    $('long').min = C.LONG_MIN; $('long').max = C.LONG_MAX;
    $('long').addEventListener('input', function () { S.long = +this.value; capUpscale(true); syncForm(); save(); });
    $('btnOrient').addEventListener('click', function () { S.orient = S.orient === 'v' ? 'h' : 'v'; syncForm(); save(); });
    $('steps').addEventListener('input', function () { S.steps = +this.value; syncForm(); save(); });
    $('upscale').addEventListener('input', function () { S.upscale = +this.value; syncForm(); save(); });
    $('seed').addEventListener('input', function () { var v = Number(this.value); if (isFinite(v)) { S.seed = Math.min(4294967295, Math.max(-1, Math.round(v))); save(); } });
    $('seedRand').addEventListener('click', function () { S.seed = -1; syncForm(); save(); });
    $('seedLast').addEventListener('click', function () {
      var j = S.jobs.slice().reverse().filter(function (x) { return x.seed >= 0; })[0];
      if (!j) return toast('Ще немає готової картинки з seed'); S.seed = j.seed; syncForm(); save(); toast('Seed ' + j.seed + ' зафіксовано');
    });
    $('detOnB').addEventListener('click', function () { S.adOn = true; syncForm(); save(); });
    $('detOff').addEventListener('click', function () { S.adOn = false; syncForm(); save(); });
    $('detBtn').addEventListener('click', function () { $('detP').value = S.adPrompt; $('detN').value = S.adNeg; $('detDlg').showModal(); });
    $('detP').addEventListener('input', function () { S.adPrompt = this.value; save(); });
    $('detN').addEventListener('input', function () { S.adNeg = this.value; save(); });
    $('detDlg').addEventListener('click', function (e) { if (e.target === this) this.close(); });
    $('modeBasic').addEventListener('click', function () { S.mode = 'basic'; syncLayout(); save(); });
    $('modeFlex').addEventListener('click', function () { S.mode = 'flex'; syncLayout(); save(); SDBuilder.refresh(); });
    $('viewImg').addEventListener('click', function () { S.view = 'img'; syncLayout(); save(); });
    $('viewTags').addEventListener('click', function () { S.view = 'tags'; syncLayout(); save(); SDBuilder.refresh(); });
    document.querySelectorAll('#ctabs button').forEach(function (b) { b.addEventListener('click', function () { S.tab = b.dataset.tab; syncLayout(); save(); }); });
    $('loraManage').addEventListener('click', function () { S.tab = 'lora'; syncLayout(); save(); });
    $('btnFull').addEventListener('click', function () {
      var p = $('preview'); if (document.fullscreenElement) return document.exitFullscreen();
      if (p.requestFullscreen) p.requestFullscreen().catch(function () { /* без повного екрана */ });
    });
    $('btnInp').addEventListener('click', function () { var j = S.jobs[S.jobs.length - 1]; if (j && j.status === 'done') SDInp.open(j); });
    $('btnSave').addEventListener('click', function () { var j = S.jobs[S.jobs.length - 1]; if (!j || j.status !== 'done') return toast('Картинка ще не готова'); var a = document.createElement('a'); a.href = imgUrl(j); a.download = C.fileName(j.prompt, j.seed); document.body.appendChild(a); a.click(); a.remove(); });
    $('btnLog').addEventListener('click', function () { openLog(S.jobs[S.jobs.length - 1]); });
    $('logCopy').addEventListener('click', function () { var t = $('logPre').textContent; (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { toast('Лог скопійовано'); }, function () { toast('Не вдалося скопіювати'); }); });
    $('logDlg').addEventListener('click', function (e) { if (e.target === this) this.close(); });
    $('btnGo').addEventListener('click', go);
    $('prompt').addEventListener('keydown', function (e) { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); go(); } });
    $('btnClear').addEventListener('click', function () { S.jobs = []; save(); renderAll(); });
    $('negReset').addEventListener('click', function () { S.neg = NEG; edN.set(NEG); save(); toast('Негативний промпт скинуто до стандартного'); });
    $('btnClearPrompt').addEventListener('click', function () { if (S.tab === 'inp') { $('inpPrompt').value = ''; $('inpPrompt').dispatchEvent(new Event('input', { bubbles: true })); return; } S.prompt = ''; edP.set(''); save(); if (window.SDBuilder) SDBuilder.refresh(); });
    $('gateForm').addEventListener('submit', submitGate);
    $('gateSwitch').addEventListener('click', function () { setMode(!registerMode); });
  }

  load();
  edP = PromptEditor.create({ ta: $('prompt'), mirror: $('mP'), bar: $('wP'), loraDefault: SDLoras.defaultWeight, onInput: function (t) { S.prompt = t; save(); if (window.SDBuilder) SDBuilder.refresh(); } });
  edN = PromptEditor.create({ ta: $('neg'), mirror: $('mN'), bar: $('wN'), loraDefault: SDLoras.defaultWeight, onInput: function (t) { S.neg = t; save(); } });
  SDAutocomplete.init({ names: SDLoras.names, weight: SDLoras.defaultWeight }); SDAutocomplete.attach($('prompt')); SDAutocomplete.attach($('neg')); 
  S.inp = Object.assign({ src: '', prompt: '', neg: '', denoise: 0.5, chain: [] }, S.inp || {}); if (!Array.isArray(S.inp.chain)) S.inp.chain = [];
  bind(); fillEditors(); syncForm(); syncLayout(); renderAll();
  SDLoras.init({ toast: toast, state: S, get: function () { return S.loras; }, set: function (l) { S.loras = l; save(); }, save: save, insert: insertText, api: api });
  SDBuilder.init({ get: function () { return S.prompt; }, set: function (t) { S.prompt = t; edP.set(t); save(); SDBuilder.refresh(); },
    colors: { get: function (id) { var a = S.colors[id]; return a && a.length ? a : [null]; }, set: function (id, a) { S.colors[id] = a; save(); } } });
  SDInp.init({ state: S, save: save, toast: toast, setTab: function (t) { S.tab = t; syncLayout(); save(); }, imgUrl: imgUrl, jobs: function () { return S.jobs; }, enqueue: enqueue, updateGo: updateGo, progressNode: function (j) { var st = stage(j); return st ? bar(st.frac, st.text) : null; } });
  SDLinks.init({ state: S, save: save, toast: toast });
  SDTplUI.init({ list: function () { return S.templates; }, set: function (l) { S.templates = l; save(); }, capture: function () { return SDTemplates.capture(S); }, apply: applyTemplate, toast: toast });
  syncLayout();   // модулі вже готові: застосувати відкриту вкладку (LoRA, Перемалювання)
  checkToken();
  setInterval(function () { if (S.token) ping(); }, 15000);
  S.jobs.forEach(function (j) { delete j.loading; });
})();
