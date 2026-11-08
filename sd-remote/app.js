// Віддалений SD: інтерфейс. Код доступу й список задач зберігаються в localStorage (префікс sd_).
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var C = window.SDClient, LS = 'sd_';
  var S = { token: '', params: { w: 512, h: 512, steps: 25, cfg: 7, seed: -1, neg: 'lowres, bad anatomy, blurry, watermark' }, jobs: [] };
  var timers = {};
  function load() { try { var x = JSON.parse(localStorage.getItem(LS + 'state') || '{}'); S.token = x.token || ''; Object.assign(S.params, x.params || {}); S.jobs = x.jobs || []; } catch (e) { /* не критично */ } }
  function save() { try { localStorage.setItem(LS + 'state', JSON.stringify({ token: S.token, params: S.params, jobs: S.jobs.slice(-60) })); } catch (e) { /* не критично */ } }
  function toast(t) { var el = $('toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(function () { el.classList.remove('show'); }, 2600); }
  function api(path, opt) {
    opt = opt || {}; opt.headers = Object.assign({ 'x-token': S.token, 'content-type': 'application/json' }, opt.headers || {});
    return fetch('/api/sd/' + path, opt).then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || 'Помилка ' + r.status); return j; }); });
  }

  function ping() {
    api('ping').then(function (p) { setPc(C.pcText(p)); }, function () { setPc(C.pcText(null)); });
  }
  function setPc(o) { var el = $('pcState'); el.className = 'pc ' + o.cls; el.textContent = o.text; }

  function render() {
    var g = $('grid'); g.textContent = '';
    $('empty').hidden = S.jobs.length > 0;
    S.jobs.slice().reverse().forEach(function (j) {
      var card = document.createElement('div'); card.className = 'card' + (j.status === 'error' ? ' err' : '');
      var fr = document.createElement('div'); fr.className = 'frame';
      if (j.status === 'done') {
        var im = document.createElement('img'); im.src = '/api/sd/image?id=' + j.id; im.alt = j.prompt; im.loading = 'lazy';
        im.title = 'Відкрити в повному розмірі'; im.addEventListener('click', function () { window.open(im.src, '_blank'); });
        im.addEventListener('error', function () { fr.textContent = 'Картинка вже видалена з сервера'; });
        fr.appendChild(im);
      } else fr.textContent = j.status === 'error' ? (j.error || 'Помилка') : (j.text || 'Чекаю…');
      var cap = document.createElement('div'); cap.className = 'cap';
      var pr = document.createElement('span'); pr.className = 'pr'; pr.textContent = j.prompt; pr.title = j.prompt;
      var meta = document.createElement('span'); meta.textContent = j.w + '×' + j.h + ' · ' + j.steps + ' кр.' + (j.seed >= 0 ? ' · seed ' + j.seed : '');
      cap.appendChild(pr); cap.appendChild(meta);
      var acts = document.createElement('div'); acts.className = 'acts';
      function btn(label, title, fn) { var b = document.createElement('button'); b.textContent = label; b.title = title; b.addEventListener('click', fn); acts.appendChild(b); }
      if (j.status === 'done') btn('Завантажити', 'Зберегти картинку на комп’ютер', function () { var a = document.createElement('a'); a.href = '/api/sd/image?id=' + j.id; a.download = C.fileName(j.prompt, j.seed); a.click(); });
      btn('Ще раз', 'Підставити ці параметри й промпт у форму', function () { $('prompt').value = j.prompt; Object.assign(S.params, { w: j.w, h: j.h, steps: j.steps, cfg: j.cfg, seed: j.seed >= 0 ? j.seed : -1, neg: j.neg }); syncForm(); save(); toast('Параметри підставлено'); });
      btn('×', 'Прибрати зі списку', function () { S.jobs = S.jobs.filter(function (x) { return x.id !== j.id; }); save(); render(); });
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
        render();
      }, function (e) {
        if (/не знайдено/.test(e.message)) { job.status = 'error'; job.error = e.message; clearInterval(timers[job.id]); delete timers[job.id]; save(); render(); }
      });
    }, 3000);
  }

  function go() {
    var prompt = $('prompt').value.trim();
    if (!prompt) return toast('Напиши промпт');
    var p = S.params, body = { prompt: prompt, negative: p.neg, width: p.w, height: p.h, steps: p.steps, cfg: p.cfg, seed: p.seed };
    $('btnGo').disabled = true;
    api('submit', { method: 'POST', body: JSON.stringify(body) }).then(function (r) {
      var job = { id: r.id, status: 'queued', text: 'У черзі…', prompt: prompt, neg: p.neg, w: p.w, h: p.h, steps: p.steps, cfg: p.cfg, seed: p.seed };
      S.jobs.push(job); save(); render(); poll(job);
    }, function (e) { toast(e.message); }).then(function () { $('btnGo').disabled = false; });
  }

  var registerMode = false;
  function started() {
    document.body.classList.add('authed'); $('gate').hidden = true; ping();
    S.jobs.forEach(function (j) { if (j.status === 'queued' || j.status === 'running') poll(j); });
  }
  function checkToken(silent) {
    if (!S.token) { $('gate').hidden = false; return; }
    api('me').then(started, function (e) {
      if (/увійти/i.test(e.message)) { S.token = ''; save(); } if (!silent) $('gateErr').textContent = e.message; $('gate').hidden = false;
    });
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
  function syncForm() {
    var p = S.params;
    $('w').value = p.w; $('h').value = p.h; $('steps').value = p.steps; $('cfg').value = p.cfg; $('seed').value = p.seed; $('neg').value = p.neg;
    $('stV').textContent = p.steps; $('cfgV').textContent = p.cfg;
    document.querySelectorAll('#sizes button').forEach(function (b) { b.classList.toggle('on', +b.dataset.w === p.w && +b.dataset.h === p.h); });
  }
  function bind() {
    var sz = $('sizes');
    C.SIZES.forEach(function (s) { var b = document.createElement('button'); b.textContent = s[0] + '×' + s[1]; b.dataset.w = s[0]; b.dataset.h = s[1]; b.title = 'Розмір ' + s[0] + '×' + s[1]; b.addEventListener('click', function () { S.params.w = s[0]; S.params.h = s[1]; syncForm(); save(); }); sz.appendChild(b); });
    [['w', 'w', 256, 1024], ['h', 'h', 256, 1024], ['steps', 'steps', 1, 40], ['cfg', 'cfg', 1, 15], ['seed', 'seed', -1, 4294967295]].forEach(function (a) {
      $(a[0]).addEventListener('change', function () { var v = Number(this.value); if (!isFinite(v)) v = S.params[a[1]]; S.params[a[1]] = Math.min(a[3], Math.max(a[2], v)); syncForm(); save(); });
      $(a[0]).addEventListener('input', function () { if (a[0] === 'steps') $('stV').textContent = this.value; if (a[0] === 'cfg') $('cfgV').textContent = this.value; });
    });
    $('neg').addEventListener('change', function () { S.params.neg = this.value; save(); });
    $('btnGo').addEventListener('click', go);
    $('prompt').addEventListener('keydown', function (e) { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); go(); } });
    $('gateForm').addEventListener('submit', submitGate);
    $('gateSwitch').addEventListener('click', function () { setMode(!registerMode); });
    $('btnClear').addEventListener('click', function () { S.jobs = []; save(); render(); });
  }

  load(); bind(); syncForm(); render();
  checkToken(true);
  setInterval(function () { if (S.token) ping(); }, 20000);
})();
