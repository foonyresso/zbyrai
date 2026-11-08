// Віддалений SD: інтерфейс. Стан у localStorage (префікс sd_): токен входу, параметри, промпти, список задач.
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var C = window.SDClient, LS = 'sd_';
  var D = { mode: 'basic', ratio: '9:16', orient: 'v', long: 1344, seed: -1, upscale: 1.65, adFace: true, adHands: false,
    prompt: '', neg: '', sideOff: false, builderMin: false };
  var S = Object.assign({ token: '', jobs: [] }, D), timers = {}, registerMode = false;

  function load() { try { var x = JSON.parse(localStorage.getItem(LS + 'state') || '{}'); Object.keys(x).forEach(function (k) { if (k in S) S[k] = x[k]; }); } catch (e) { /* не критично */ } }
  function save() { try { localStorage.setItem(LS + 'state', JSON.stringify(Object.assign({}, S, { jobs: S.jobs.slice(-60) }))); } catch (e) { /* не критично */ } }
  function toast(t) { var el = $('toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(function () { el.classList.remove('show'); }, 2600); }
  function api(path, opt) {
    opt = opt || {}; opt.headers = Object.assign({ 'x-token': S.token, 'content-type': 'application/json' }, opt.headers || {});
    return fetch('/api/sd/' + path, opt).then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || 'Помилка ' + r.status); return j; }); });
  }
  function ping() { api('ping').then(function (p) { setPc(C.pcText(p)); }, function () { setPc(C.pcText(null)); }); }
  function setPc(o) { var el = $('pcState'); el.className = 'pc ' + o.cls; el.textContent = o.text; }

  // ---------- параметри й рамка-превʼю
  function dims() { return C.sizeFor(S.ratio, S.orient, S.long); }
  function syncForm() {
    var d = dims(), f = C.finalSize(d.w, d.h, S.upscale);
    document.querySelectorAll('#ratios button').forEach(function (b) { b.classList.toggle('on', b.dataset.r === S.ratio); });
    document.querySelectorAll('#longs button').forEach(function (b) { b.classList.toggle('on', +b.dataset.l === S.long); });
    $('btnOrient').textContent = S.orient === 'v' ? '⇄ Вертикально' : '⇄ Горизонтально'; $('btnOrient').disabled = S.ratio === '1:1';
    $('sizeInfo').textContent = d.w + '×' + d.h + (S.upscale > 1 ? ' → ' + f.w + '×' + f.h : '');
    $('seed').value = S.seed;
    $('upscale').value = S.upscale; $('upV').textContent = S.upscale > 1 ? S.upscale + '×' : 'вимкнено';
    $('adFace').checked = S.adFace; $('adHands').checked = S.adHands;
    $('prompt').value = S.prompt; $('neg').value = S.neg;
    $('modeBasic').classList.toggle('on', S.mode === 'basic'); $('modeFlex').classList.toggle('on', S.mode === 'flex');
    $('builder').hidden = S.mode !== 'flex'; $('builder').classList.toggle('min', S.builderMin); $('bToggle').textContent = S.builderMin ? '▸' : '▾';
    document.body.classList.toggle('side-off', S.sideOff); $('btnSide').textContent = S.sideOff ? 'Показати параметри' : 'Сховати параметри';
    $('preview').style.setProperty('--ar', (d.w / d.h).toFixed(4)); $('pvTag').textContent = (S.upscale > 1 ? f.w + '×' + f.h : d.w + '×' + d.h) + ' · ' + S.ratio;
    renderPreview();
  }
  function renderPreview() {
    var box = $('pvIn'), j = S.jobs[S.jobs.length - 1]; box.textContent = '';
    if (j && j.status === 'done') {
      var im = document.createElement('img'); im.src = '/api/sd/image?id=' + j.id; im.alt = j.prompt; im.title = 'Відкрити в повному розмірі';
      im.addEventListener('click', function () { window.open(im.src, '_blank'); }); box.appendChild(im);
    } else box.textContent = j ? (j.status === 'error' ? (j.error || 'Помилка') : (j.text || 'Чекаю…')) : 'Так виглядатиме рамка картинки';
  }

  // ---------- список задач
  function render() {
    var g = $('grid'); g.textContent = ''; $('empty').hidden = S.jobs.length > 0;
    S.jobs.slice().reverse().forEach(function (j) {
      var card = document.createElement('div'); card.className = 'card' + (j.status === 'error' ? ' err' : '');
      var fr = document.createElement('div'); fr.className = 'frame';
      if (j.status === 'done') {
        var im = document.createElement('img'); im.src = '/api/sd/image?id=' + j.id; im.alt = j.prompt; im.loading = 'lazy'; im.title = 'Відкрити в повному розмірі';
        im.addEventListener('click', function () { window.open(im.src, '_blank'); });
        im.addEventListener('error', function () { fr.textContent = 'Картинка вже видалена з сервера'; }); fr.appendChild(im);
      } else fr.textContent = j.status === 'error' ? (j.error || 'Помилка') : (j.text || 'Чекаю…');
      var cap = document.createElement('div'); cap.className = 'cap';
      var pr = document.createElement('span'); pr.className = 'pr'; pr.textContent = j.prompt; pr.title = j.prompt;
      var meta = document.createElement('span'); meta.textContent = j.w + '×' + j.h + (j.upscale > 1 ? ' ×' + j.upscale : '') + (j.seed >= 0 ? ' · seed ' + j.seed : '');
      cap.appendChild(pr); cap.appendChild(meta);
      var acts = document.createElement('div'); acts.className = 'acts';
      var btn = function (label, title, fn) { var b = document.createElement('button'); b.textContent = label; b.title = title; b.addEventListener('click', fn); acts.appendChild(b); };
      if (j.status === 'done') btn('Завантажити', 'Зберегти картинку на комп’ютер', function () { var a = document.createElement('a'); a.href = '/api/sd/image?id=' + j.id; a.download = C.fileName(j.prompt, j.seed); a.click(); });
      btn('Ще раз', 'Підставити промпт і параметри цієї картинки', function () {
        Object.assign(S, { prompt: j.prompt, neg: j.neg, seed: j.seed >= 0 ? j.seed : -1, upscale: j.upscale || 1, adFace: !!j.adFace, adHands: !!j.adHands });
        syncForm(); save(); SDBuilder.refresh(); toast('Параметри підставлено');
      });
      btn('×', 'Прибрати зі списку', function () { S.jobs = S.jobs.filter(function (x) { return x.id !== j.id; }); save(); render(); renderPreview(); });
      cap.appendChild(acts); card.appendChild(fr); card.appendChild(cap); g.appendChild(card);
    });
  }
  function poll(job) {
    if (timers[job.id]) return;
    timers[job.id] = setInterval(function () {
      api('status?id=' + job.id).then(function (st) {
        job.status = st.status; job.text = C.queueText(st); job.error = st.error;
        if (st.info && st.info.seed != null) job.seed = st.info.seed;
        if (st.status === 'done' || st.status === 'error') { clearInterval(timers[job.id]); delete timers[job.id]; save(); }
        render(); renderPreview();
      }, function (e) {
        if (/не знайдено/.test(e.message)) { job.status = 'error'; job.error = e.message; clearInterval(timers[job.id]); delete timers[job.id]; save(); render(); renderPreview(); }
      });
    }, 3000);
  }
  function go() {
    var prompt = S.prompt.trim(); if (!prompt) return toast('Напиши промпт');
    var d = dims(), body = { prompt: prompt, negative: S.neg, width: d.w, height: d.h, seed: S.seed, upscale: S.upscale, adFace: S.adFace, adHands: S.adHands };
    $('btnGo').disabled = true;
    api('submit', { method: 'POST', body: JSON.stringify(body) }).then(function (r) {
      var job = { id: r.id, status: 'queued', text: 'У черзі…', prompt: prompt, neg: S.neg, w: d.w, h: d.h, seed: S.seed, upscale: S.upscale, adFace: S.adFace, adHands: S.adHands };
      S.jobs.push(job); save(); render(); renderPreview(); poll(job);
    }, function (e) { toast(e.message); }).then(function () { $('btnGo').disabled = false; });
  }

  // ---------- вхід і реєстрація
  function started() {
    document.body.classList.add('authed'); $('gate').hidden = true; ping();
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

  // ---------- події
  function bind() {
    var rs = $('ratios'), ls = $('longs');
    C.RATIOS.forEach(function (r) { var b = document.createElement('button'); b.textContent = r; b.dataset.r = r; b.title = 'Пропорції ' + r; b.addEventListener('click', function () { S.ratio = r; syncForm(); save(); }); rs.appendChild(b); });
    C.LONG_SIDES.forEach(function (l) { var b = document.createElement('button'); b.textContent = l; b.dataset.l = l; b.title = 'Довга сторона ' + l + ' px'; b.addEventListener('click', function () { S.long = l; syncForm(); save(); }); ls.appendChild(b); });
    $('seedRand').addEventListener('click', function () { S.seed = -1; syncForm(); save(); });
    $('seedLast').addEventListener('click', function () {
      var j = S.jobs.slice().reverse().filter(function (x) { return x.seed >= 0; })[0];
      if (!j) return toast('Ще немає готової картинки з seed'); S.seed = j.seed; syncForm(); save(); toast('Seed ' + j.seed + ' зафіксовано');
    });
    $('btnOrient').addEventListener('click', function () { S.orient = S.orient === 'v' ? 'h' : 'v'; syncForm(); save(); });
    [['seed', -1, 4294967295], ['upscale', 1, 2]].forEach(function (a) {
      $(a[0]).addEventListener('input', function () { var v = Number(this.value); if (!isFinite(v)) return; S[a[0]] = Math.min(a[2], Math.max(a[1], v)); syncForm(); save(); });
    });
    ['adFace', 'adHands'].forEach(function (k) { $(k).addEventListener('change', function () { S[k] = this.checked; save(); }); });
    $('prompt').addEventListener('input', function () { S.prompt = this.value; save(); SDBuilder.refresh(); });
    $('neg').addEventListener('input', function () { S.neg = this.value; save(); });
    $('modeBasic').addEventListener('click', function () { S.mode = 'basic'; syncForm(); save(); });
    $('modeFlex').addEventListener('click', function () { S.mode = 'flex'; syncForm(); save(); SDBuilder.refresh(); });
    $('bToggle').addEventListener('click', function () { S.builderMin = !S.builderMin; syncForm(); save(); });
    $('btnSide').addEventListener('click', function () { S.sideOff = !S.sideOff; syncForm(); save(); });
    $('btnFull').addEventListener('click', function () {
      var p = $('preview'); if (document.fullscreenElement) return document.exitFullscreen();
      if (p.requestFullscreen) p.requestFullscreen().catch(function () { document.body.classList.toggle('big'); }); else document.body.classList.toggle('big');
    });
    $('btnGo').addEventListener('click', go);
    $('prompt').addEventListener('keydown', function (e) { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); go(); } });
    $('btnClear').addEventListener('click', function () { S.jobs = []; save(); render(); renderPreview(); });
    $('btnClearPrompt').addEventListener('click', function () { S.prompt = ''; $('prompt').value = ''; save(); SDBuilder.refresh(); });
    $('gateForm').addEventListener('submit', submitGate);
    $('gateSwitch').addEventListener('click', function () { setMode(!registerMode); });
  }

  load(); bind(); syncForm(); render();
  SDBuilder.init({ get: function () { return S.prompt; }, set: function (t) { S.prompt = t; $('prompt').value = t; save(); SDBuilder.refresh(); } });
  checkToken();
  setInterval(function () { if (S.token) ping(); }, 20000);
})();
