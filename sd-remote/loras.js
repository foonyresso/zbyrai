// LoRA: вкладка зі списком із ПК (назва, метадані Civitai, тригер-слова, прев'ю) і активні блоки з повзунками сили (−5…5).
// Дані приходять від воркера (/api/sd/loras). Активні LoRA зберігає app.js (host.get/set).
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var DEFAULTS = { 'Epistail_0.1': 0.6, 'PFT_ASH_0.1': 0.5 };
  var host = null, known = [];

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function find(name) { for (var i = 0; i < known.length; i++) if (known[i].name === name) return known[i]; return null; }
  function defaultWeight(name) { var k = find(name); if (k && k.weight > 0) return k.weight; return DEFAULTS[name] != null ? DEFAULTS[name] : null; }
  function activeIdx(name) { var l = host.get(); for (var i = 0; i < l.length; i++) if (l[i].name === name) return i; return -1; }

  function toggle(name) {
    var l = host.get().slice(), i = activeIdx(name);
    if (i >= 0) l.splice(i, 1); else { var w = defaultWeight(name); l.push({ name: name, w: w == null ? 0.8 : w }); }
    host.set(l); render();
  }

  // активні блоки в лівій панелі
  function renderActive() {
    var box = $('loraActive'); box.textContent = '';
    var l = host.get();
    if (!l.length) box.appendChild(el('p', 'hint', 'LoRA не додано. Відкрий «керувати» й додай потрібні.'));
    l.forEach(function (it) {
      var k = find(it.name), b = el('div', 'lblk');
      var h = el('div', 'lh'); var n = el('button', 'lname', (k && k.title) || it.name); n.type = 'button'; n.title = 'Відкрити інформацію про LoRA · ' + it.name + (k && k.base ? ' · ' + k.base : '');
      n.addEventListener('click', function () { if (k) openDetail(k); else host.toast('Цієї LoRA немає у списку з ПК (список оновлюється кнопкою «Оновити» у вкладці LoRA)'); });
      var x = el('button', 'x', '×'); x.title = 'Прибрати цю LoRA з генерації'; x.addEventListener('click', function () { toggle(it.name); });
      h.appendChild(n); h.appendChild(x); b.appendChild(h);
      var row = el('div', 'lr'), rng = el('input'), num = el('input');
      rng.type = 'range'; rng.min = -5; rng.max = 5; rng.step = 0.05; rng.value = it.w; rng.title = 'Сила LoRA від −5 до 5';
      num.type = 'number'; num.min = -5; num.max = 5; num.step = 0.05; num.value = it.w; num.title = 'Сила LoRA';
      function set(v) { v = Math.min(5, Math.max(-5, Number(v))); if (!isFinite(v)) return; it.w = Math.round(v * 100) / 100; rng.value = it.w; num.value = it.w; host.save(); }
      rng.addEventListener('input', function () { set(rng.value); });
      num.addEventListener('change', function () { set(num.value); });
      row.appendChild(rng); row.appendChild(num); b.appendChild(row);
      if (k && k.triggers && k.triggers.length) {
        var t = el('button', 'link', 'тригер-слова в промпт'); t.title = k.triggers.join(', ');
        t.addEventListener('click', function () { host.insert(k.triggers.join(', ')); }); b.appendChild(t);
      }
      box.appendChild(b);
    });
  }

  // ---- групи: категорії Civitai (з тегів), базова модель або папка; групу можна змінити вручну (зберігається в браузері: host.state.loraMeta)
  var CATS = [['character', 'Персонажі'], ['style', 'Стилі'], ['concept', 'Концепти'], ['clothing', 'Одяг'], ['outfit', 'Одяг'], ['costume', 'Одяг'], ['armor', 'Одяг'], ['poses', 'Пози'], ['pose', 'Пози'],
    ['background', 'Фони'], ['backgrounds', 'Фони'], ['scenery', 'Фони'], ['landscape', 'Фони'], ['buildings', 'Будівлі'], ['building', 'Будівлі'], ['architecture', 'Будівлі'],
    ['vehicle', 'Транспорт'], ['vehicles', 'Транспорт'], ['objects', 'Предмети'], ['object', 'Предмети'], ['prop', 'Предмети'], ['weapon', 'Предмети'],
    ['animal', 'Тварини'], ['animals', 'Тварини'], ['creature', 'Тварини'], ['action', 'Дії'], ['assets', 'Ресурси'], ['tool', 'Інструменти'], ['detail', 'Інструменти'], ['slider', 'Інструменти'], ['enhancer', 'Інструменти']];
  var BY = [['category', 'Категорії'], ['base', 'Базова модель'], ['folder', 'Папка']];
  function meta(name) { var m = host.state.loraMeta; return m[name] || (m[name] = {}); }
  function category(k) {
    var tags = (k.tags || []).map(function (t) { return String(t).toLowerCase(); });
    for (var i = 0; i < CATS.length; i++) if (tags.indexOf(CATS[i][0]) >= 0) return CATS[i][1];
    return '';
  }
  function autoGroup(k) {
    var by = host.state.loraBy;
    if (by === 'base') return k.base || 'Невідома модель';
    if (by === 'folder') return k.folder || 'Коренева папка';
    return category(k) || 'Без категорії';
  }
  function groupOf(k) { var m = host.state.loraMeta[k.name]; return (m && m.group) || autoGroup(k); }
  function allGroups() { var g = {}; known.forEach(function (k) { g[groupOf(k)] = 1; }); return Object.keys(g).sort(); }
  function thumbUrl(k) { return k.thumb ? 'data:image/webp;base64,' + k.thumb : ''; }

  // деталі LoRA: майже на весь екран. Ліворуч (3/4): вкладки «Огляд» (картинки автора + опис) і «Галерея»; праворуч (1/4): ліцензія й деталі.
  // Дані з Civitai браузер бере напряму (CivitaiInfo.fetchModel); якщо недоступні — лишається локальна інформація.
  // Сповіщення про копіювання: зникає за 5 с або одразу від дії користувача (клік, клавіша, помітний рух мишки).
  // Додається в саме вікно LoRA, бо звичайні сповіщення сайту лишаються під модальним вікном.
  var noteEl = null, noteOff = null;
  function copyNote(text) {
    if (noteOff) noteOff();
    var d = $('lDlg'), n = el('div', 'ld-copynote', '✓ ' + text); (d.open ? d : document.body).appendChild(n); noteEl = n;
    var timer = null, sx = null, sy = null;
    function off() { clearTimeout(timer); document.removeEventListener('pointerdown', off, true); document.removeEventListener('keydown', off, true); document.removeEventListener('wheel', off, true); document.removeEventListener('pointermove', mv, true); n.remove(); noteOff = null; }
    function mv(e) { if (sx === null) { sx = e.clientX; sy = e.clientY; return; } if (Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy) > 24) off(); }
    noteOff = off; timer = setTimeout(off, 5000);
    setTimeout(function () { if (noteOff !== off) return; document.addEventListener('pointerdown', off, true); document.addEventListener('keydown', off, true); document.addEventListener('wheel', off, true); document.addEventListener('pointermove', mv, true); }, 0);
  }
  function copyText(t, btn) {
    var done = function () { btn.classList.add('ok'); copyNote('Промпт скопійовано'); setTimeout(function () { btn.classList.remove('ok'); }, 1200); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done, function () { host.toast('Не вдалося скопіювати'); });
    else { var ta = el('textarea'); ta.value = t; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); done(); } catch (e) { host.toast('Не вдалося скопіювати'); } ta.remove(); }
  }
  var SVGNS = 'http://www.w3.org/2000/svg';
  function copyIcon() {
    var s = document.createElementNS(SVGNS, 'svg'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('width', '16'); s.setAttribute('height', '16'); s.setAttribute('fill', 'none'); s.setAttribute('stroke', 'currentColor'); s.setAttribute('stroke-width', '2');
    var r1 = document.createElementNS(SVGNS, 'rect'); r1.setAttribute('x', '9'); r1.setAttribute('y', '9'); r1.setAttribute('width', '12'); r1.setAttribute('height', '12'); r1.setAttribute('rx', '2');
    var p = document.createElementNS(SVGNS, 'path'); p.setAttribute('d', 'M5 15V5a2 2 0 0 1 2-2h10'); s.appendChild(r1); s.appendChild(p); return s;
  }
  function wantsIcon(g) { return !!g.prompt || g.hasPrompt === true || (g.hasPrompt === undefined && !g.resolved); }
  function resolvePrompt(g, then) {   // добирає промпт за id (потрібен ключ Civitai)
    if (g.prompt) return then && then();
    var CI = window.CivitaiInfo; if (!g.id) { g.resolved = true; g.hasPrompt = false; fire(g); return then && then(); }
    CI.fetchImageMeta(g.id).then(function (m) {
      g.full = m; if (m.prompt) { g.prompt = m.prompt; g.neg = g.neg || m.neg; g.info = g.info || m.info; } else { g.hasPrompt = false; host.toast('До цієї картинки промпт не додано'); }
      g.resolved = true; fire(g); if (then) then();
    }, function (e) { host.toast(e && /nokey|503/.test(e.message) ? 'Адмін ще не додав ключ Civitai на сервері' : 'Не вдалося отримати промпт з Civitai'); });
  }
  function fire(g) { (g.subs || []).forEach(function (f) { f(); }); }
  function copyBtn(g, label) {   // іконка лише там, де промпт є (або, судячи з позначки Civitai, має бути)
    var b = el('button', 'lcopy'); b.type = 'button'; b.appendChild(copyIcon()); if (label) b.appendChild(el('span', null, ' ' + label));
    b.title = 'Копіювати промпт цієї картинки';
    var sync = function () { b.hidden = !wantsIcon(g); }; sync(); (g.subs = g.subs || []).push(sync);
    b.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
    b.addEventListener('click', function (e) { e.stopPropagation(); resolvePrompt(g, function () { copyText(g.prompt, b); }); });
    return b;
  }
  var knownAt = Date.now(), knownSubs = [];   // коли список з ПК оновлювався востаннє й хто хоче знати про оновлення
  // чи є ця LoRA з Civitai у моєму списку (за id моделі; якщо відомі обидві версії й вони різні — «інша версія»)
  function ownedFor(r) {
    if (!r.modelId) return null; var hit = null;
    known.forEach(function (k) {
      var mid = window.CivitaiInfo ? CivitaiInfo.modelIdOf(k.civitai) : ''; if (String(mid) !== String(r.modelId)) return;
      var diff = !!(r.versionId && k.versionId && +k.versionId !== +r.versionId), cur = { k: k, diff: diff };
      if (!hit || (hit.diff && !diff)) hit = cur;
    });
    return hit;
  }
  function bigView(g0, list) {
    list = list || [g0]; var idx = Math.max(0, list.indexOf(g0)), g = g0, off = null;
    var o = el('div', 'lbigv'), imgBox = el('div', 'lbig-img'), im = el('img'); im.alt = ''; im.referrerPolicy = 'no-referrer'; imgBox.appendChild(im); o.appendChild(imgBox);
    var side = el('div', 'lbig-side'); o.appendChild(side); side.addEventListener('click', function (e) { e.stopPropagation(); });
    function chips(arr, cls) { var d = el('div', 'chips'); arr.forEach(function (t) { d.appendChild(el('span', 'chip ' + (cls || ''), t)); }); return d; }
    function block(title, text, copy) {
      var h = el('div', 'lb-h'); h.appendChild(el('h4', null, title)); if (copy) { var b = el('button', 'lcopy lb-c'); b.type = 'button'; b.appendChild(copyIcon()); b.title = 'Копіювати'; b.addEventListener('click', function () { copyText(text, b); }); h.appendChild(b); }
      side.appendChild(h); side.appendChild(el('p', 'lb-t', text));
    }
    function fill() {
      side.textContent = ''; var f = g.full, st = g.stats;
      if (st) { var sp = el('p', 'lb-stats'); sp.textContent = '👍 ' + (st.likeCount || 0) + '   ❤ ' + (st.heartCount || 0) + '   😂 ' + (st.laughCount || 0) + '   😢 ' + (st.cryCount || 0) + '   💬 ' + (st.commentCount || 0); side.appendChild(sp); }
      if (g.id) { var a = el('a', 'lnk', 'Відкрити на Civitai (коментарі, ремікс) ↗'); a.href = 'https://civitai.com/images/' + g.id; a.target = '_blank'; a.rel = 'noopener'; side.appendChild(a); }
      if (!f) { side.appendChild(el('p', 'lm', g.id ? 'Завантаження даних генерації…' : 'Даних генерації немає.')); return; }
      if (f.resources.length) {
        side.appendChild(el('h4', null, 'Використані ресурси'));
        f.resources.forEach(function (r) {
          var p = el('p', 'ld-row ld-res'), isLora = r.type === 'LORA', mine = isLora ? ownedFor(r) : null, nm = el('button', 'lname-btn', r.name + (r.version ? ' · ' + r.version : '')); nm.type = 'button';
          if (isLora) { var st = !mine ? ['no', '✕', 'Цієї LoRA в тебе немає: клік відкриє її на Civitai'] : (mine.diff ? ['mid', '≈', 'У тебе є ця LoRA, але інша версія: клік відкриє її у твоєму списку'] : ['ok', '✓', 'Ця LoRA в тебе є: клік відкриє її у твоєму списку']); var mk = el('span', 'res-mk ' + st[0], st[1]); mk.title = st[2]; nm.title = st[2]; p.appendChild(mk); }
          else nm.title = 'Відкрити на Civitai';
          nm.addEventListener('click', function (e) { e.stopPropagation(); if (mine) { close(); openDetail(mine.k); } else if (r.modelId) window.open('https://civitai.com/models/' + r.modelId + (r.versionId ? '?modelVersionId=' + r.versionId : ''), '_blank', 'noopener'); });
          p.appendChild(nm); p.appendChild(el('b', null, (isLora ? 'LoRA' : r.type) + (r.strength != null ? ' ' + r.strength : ''))); side.appendChild(p);
        });
      }
      if (f.prompt) block('Промпт', f.prompt, true); if (f.neg) block('Негативний промпт', f.neg, true);
      var ex = Object.keys(f.extra || {}); if (ex.length) { side.appendChild(el('h4', null, 'Інші параметри')); side.appendChild(chips(ex.map(function (k) { return k + ': ' + f.extra[k]; }), 'tg')); }
      if (f.tags.length) { side.appendChild(el('h4', null, 'Теги')); side.appendChild(chips(f.tags)); }
      if (!f.prompt && !f.resources.length) side.appendChild(el('p', 'lm', 'Автор не залишив даних генерації.'));
    }
    var prev = el('button', 'car-btn l', '‹'), next = el('button', 'car-btn r', '›'); prev.type = next.type = 'button'; prev.title = 'Попередня (←)'; next.title = 'Наступна (→)';
    var info = el('button', 'lb-info', 'ℹ Дані'); info.type = 'button'; info.title = 'Показати/сховати дані генерації'; o.appendChild(info);   // на телефоні: або картинка, або дані
    info.addEventListener('click', function (e) { e.stopPropagation(); o.classList.toggle('show-data'); info.textContent = o.classList.contains('show-data') ? '🖼 Картинка' : 'ℹ Дані'; });
    var xb = el('button', 'lb-x', '✕'); xb.type = 'button'; xb.title = 'Закрити'; o.appendChild(xb); xb.addEventListener('click', function (e) { e.stopPropagation(); close(); });
    prev.classList.add('lb-nav'); next.classList.add('lb-nav'); o.insertBefore(prev, imgBox); o.insertBefore(next, side);   // стрілки поза картинкою: ліворуч і праворуч від неї
    function load() {
      if (off) off(); g = list[idx]; im.src = g.big; g.subs = g.subs || []; g.subs.push(fill); off = function () { var i = g.subs.indexOf(fill); if (i >= 0) g.subs.splice(i, 1); };
      prev.style.visibility = idx <= 0 ? 'hidden' : 'visible'; next.style.visibility = idx >= list.length - 1 ? 'hidden' : 'visible'; fill();
      if (g.id && !g.full && window.CivitaiInfo) {
        var cur = g; window.CivitaiInfo.fetchImageMeta(cur.id).then(function (m) { cur.full = m; if (m.prompt && !cur.prompt) { cur.prompt = m.prompt; cur.neg = cur.neg || m.neg; } cur.resolved = true; fire(cur); }, function (e) {
          if (cur !== g) return; side.textContent = ''; side.appendChild(el('p', 'lm', e && /nokey|503/.test(e.message) ? 'Дані генерації недоступні: адмін ще не додав ключ Civitai на сервері.' : 'Не вдалося отримати дані генерації з Civitai.'));
          var a = el('a', 'lnk', 'Відкрити на Civitai ↗'); a.href = 'https://civitai.com/images/' + cur.id; a.target = '_blank'; a.rel = 'noopener'; side.appendChild(a);
        });
      }
    }
    function go(d) { var n = idx + d; if (n < 0 || n >= list.length) return; idx = n; load(); }
    function close() { if (off) off(); var si = knownSubs.indexOf(refill); if (si >= 0) knownSubs.splice(si, 1); document.removeEventListener('keydown', key, true); o.remove(); }
    function refill() { if (o.isConnected) fill(); }   // список LoRA з ПК оновився (довантажив нові): ✓/✕ біля ресурсів перераховуються
    knownSubs.push(refill); if (Date.now() - knownAt > 30000 && window.SDLoras) window.SDLoras.load();
    function key(e) { if (e.key === 'ArrowLeft') { e.preventDefault(); e.stopPropagation(); go(-1); } else if (e.key === 'ArrowRight') { e.preventDefault(); e.stopPropagation(); go(1); } else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); } }
    prev.addEventListener('click', function (e) { e.stopPropagation(); go(-1); }); next.addEventListener('click', function (e) { e.stopPropagation(); go(1); });
    document.addEventListener('keydown', key, true); o.addEventListener('click', close);
    ($('lDlg').open ? $('lDlg') : document.body).appendChild(o); load();
  }
  function dragScroll(box) {   // потягнув мишкою — прокручується; простий клік (без руху) відкриває картинку
    var sx = 0, sl = 0, down = false, moved = false;
    box.addEventListener('pointerdown', function (e) { if (e.button !== 0 || e.target.closest('.lcopy')) return; down = true; moved = false; sx = e.clientX; sl = box.scrollLeft; });
    box.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 5) { moved = true; box.classList.add('drag'); } if (moved) box.scrollLeft = sl - dx; });
    var end = function () { down = false; box.classList.remove('drag'); };
    box.addEventListener('pointerup', end); box.addEventListener('pointerleave', end); box.addEventListener('pointercancel', end);
    box.addEventListener('click', function (e) { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
    box.addEventListener('dragstart', function (e) { e.preventDefault(); });
  }
  function galTile(g, snap, list) {
    var t = el('div', 'lgi'), im = el('img'); im.draggable = false; im.src = g.thumb; im.alt = ''; im.loading = 'lazy'; im.referrerPolicy = 'no-referrer'; im.addEventListener('click', function () { bigView(g, list && list()); }); t.appendChild(im);
    if (snap) t.style.aspectRatio = String(window.CivitaiInfo.snapRatio(g.w, g.h));
    if (g.user) t.appendChild(el('span', 'lgu', g.user));
    t.appendChild(copyBtn(g));
    return t;
  }
  // карусель: плавне гортання по одній картинці, стрілки по боках, автопрокрутка (паузa при наведенні й перетягуванні)
  function carousel(strip, alive) {
    var wrap = el('div', 'ld-car'), prev = el('button', 'car-btn l', '‹'), next = el('button', 'car-btn r', '›'), timer = null, hover = false;
    prev.type = next.type = 'button'; prev.title = 'Попередня'; next.title = 'Наступна'; strip.parentNode.insertBefore(wrap, strip); wrap.appendChild(strip); wrap.appendChild(prev); wrap.appendChild(next);
    function step(dir) {
      var tiles = strip.querySelectorAll('.lgi'); if (!tiles.length) return; var cur = strip.scrollLeft, i = 0, atEnd = cur + strip.clientWidth >= strip.scrollWidth - 4;
      for (i = 0; i < tiles.length; i++) if (tiles[i].offsetLeft - strip.offsetLeft >= cur + 4) break;
      var to = dir > 0 ? (atEnd ? 0 : i) : Math.max(0, i - 2);   // вперед: на наступну (з кінця — на початок); назад: на попередню
      var tgt = tiles[Math.min(to, tiles.length - 1)]; strip.scrollTo({ left: dir > 0 && atEnd ? 0 : tgt.offsetLeft - strip.offsetLeft, behavior: 'smooth' });
    }
    prev.addEventListener('click', function () { step(-1); }); next.addEventListener('click', function () { step(1); });
    wrap.addEventListener('pointerenter', function () { hover = true; }); wrap.addEventListener('pointerleave', function () { hover = false; });
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) timer = setInterval(function () { if (!alive()) { clearInterval(timer); return; } if (!hover && !strip.classList.contains('drag') && !document.querySelector('.lbigv')) step(1); }, 4000);
  }
  // підказка-пояснення біля пункту (власна, бо блок праворуч прокручується й обрізав би звичайну)
  var tipEl = null;
  function tipHide() { if (tipEl) { tipEl.remove(); tipEl = null; } }
  function tipShow(target, it) {
    tipHide(); var d = $('lDlg'); if (!d.open) return;
    tipEl = el('div', 'ld-tipbox ' + (it.ok ? 'ok' : 'no')); tipEl.appendChild(el('b', null, it.text)); tipEl.appendChild(el('p', null, it.hint)); d.appendChild(tipEl);
    var r = target.getBoundingClientRect(), w = Math.min(360, window.innerWidth - 24), h = tipEl.offsetHeight, left = r.left - w - 12;
    if (left < 12) { left = Math.max(12, Math.min(r.left, window.innerWidth - w - 12)); }
    var top = left < r.left - w ? r.top : r.bottom + 8; if (top + h > window.innerHeight - 12) top = Math.max(12, window.innerHeight - h - 12);
    tipEl.style.width = w + 'px'; tipEl.style.left = left + 'px'; tipEl.style.top = top + 'px';
  }
  function tip(node, it) {
    node.addEventListener('mouseenter', function () { tipShow(node, it); }); node.addEventListener('mouseleave', tipHide);
    node.addEventListener('focus', function () { tipShow(node, it); }); node.addEventListener('blur', tipHide);
    node.addEventListener('click', function (e) { e.stopPropagation(); if (tipEl) tipHide(); else tipShow(node, it); });
  }
  // Галерея-«мурашник» з безкінечним підвантаженням, сортуванням і зумом плиток. Використовується у вікні LoRA й у вкладці «Ідеї».
  // opts: fetchPage(cursor, {sort, period}) → Promise<{items, next}>, alive() → чи ще потрібна, empty — текст порожнього результату
  function mkGallery(root, opts) {
    var cursor = '', ended = false, loading = false, gen = 0, started = false, all = [], cols = [], hs = [], zoom = 220;
    var gbox = el('div', 'ld-gbox'), gmsg = el('p', 'lm ld-gmsg'), more = el('div', 'ld-sentinel');
    try { zoom = Math.max(100, Math.min(480, +localStorage.getItem('sd_galzoom') || 220)); } catch (e) { /* не критично */ }
    var zbar = el('div', 'ld-zoom'), zr = el('input'); zr.type = 'range'; zr.min = 100; zr.max = 480; zr.step = 10; zr.value = zoom; zr.title = 'Розмір плиток';
    var sel = function (title, list) { var s = el('select'); s.title = title; list.forEach(function (o) { var x = el('option', null, o[1]); x.value = o[0]; s.appendChild(x); }); return s; };
    var sSort = sel('Сортування', [['Most Reactions', 'За реакціями'], ['Most Comments', 'За коментарями'], ['Newest', 'Спочатку нові']]), sPer = sel('Період', [['AllTime', 'За весь час'], ['Year', 'За рік'], ['Month', 'За місяць'], ['Week', 'За тиждень'], ['Day', 'За день']]);
    function reset() { gen++; ended = false; all = []; cursor = ''; loading = false; gbox.textContent = ''; cols = []; hs = []; gmsg.textContent = ''; pull(); }
    sSort.addEventListener('change', function () { sPer.disabled = sSort.value === 'Newest'; reset(); }); sPer.addEventListener('change', reset);
    zbar.appendChild(sSort); zbar.appendChild(sPer); zbar.appendChild(el('span', 'lm', 'Розмір плиток')); zbar.appendChild(zr); zbar.appendChild(el('span', 'lm ld-ratios', 'пропорції підбираються автоматично'));
    function place(g) {   // у найкоротшу колонку; висота плитки ∝ 1/пропорція
      var m = 0, i; for (i = 1; i < hs.length; i++) if (hs[i] < hs[m] - 0.001) m = i;
      cols[m].appendChild(galTile(g, true, function () { return all; })); hs[m] += 1 / window.CivitaiInfo.snapRatio(g.w, g.h);
    }
    function layout() {
      var w = gbox.clientWidth || root.clientWidth || 800, n = Math.max(1, Math.floor((w + 8) / (zoom + 8))); gbox.textContent = ''; cols = []; hs = [];
      for (var i = 0; i < n; i++) { var c = el('div', 'ld-col'); cols.push(c); hs.push(0); gbox.appendChild(c); }
      all.forEach(place);
    }
    zr.addEventListener('input', function () { zoom = +zr.value; try { localStorage.setItem('sd_galzoom', String(zoom)); } catch (e) { /* не критично */ } layout(); });
    if (window.ResizeObserver) new ResizeObserver(function () { if (root.offsetParent !== null && gbox.clientWidth && Math.max(1, Math.floor((gbox.clientWidth + 8) / (zoom + 8))) !== cols.length) layout(); }).observe(root);
    root.textContent = ''; if (opts.before) root.appendChild(opts.before); root.appendChild(zbar); root.appendChild(gbox); root.appendChild(gmsg); root.appendChild(more);
    // підвантаження: спостерігаємо за маркером внизу відносно екрана (працює і коли прокручується не сама галерея, а все вікно, як на телефоні)
    var io = window.IntersectionObserver ? new IntersectionObserver(function (es) { if (es[0] && es[0].isIntersecting && started && !ended && !loading) pull(); }, { rootMargin: '600px' }) : null;
    function rewatch() { if (io) { io.unobserve(more); io.observe(more); } }
    function pull() {
      if (loading || (opts.alive && !opts.alive())) return; loading = true; gmsg.textContent = 'Завантаження…'; var my = gen;
      opts.fetchPage(cursor, { sort: sSort.value, period: sPer.value }).then(function (r) {
        if (my !== gen) return; loading = false; if (!cols.length) layout(); r.items.forEach(function (g) { all.push(g); place(g); }); cursor = r.next; ended = !r.next;
        gmsg.textContent = all.length ? (ended ? 'Це всі результати.' : '') : (opts.empty || 'Нічого не знайдено.'); rewatch();
      }, function (e) { if (my !== gen) return; loading = false; gmsg.textContent = e && /nokey|503/.test(e.message) ? 'Адмін ще не додав ключ Civitai на сервері.' : 'Не вдалося завантажити з Civitai. Прокрути ще раз, щоб повторити.'; });
    }
    return { start: function () { started = true; if (!all.length && !loading) pull(); else rewatch(); }, reset: function () { started = true; reset(); } };
  }

  function openDetail(k) {
    tipHide();
    var d = $('lDlg'), box = $('lDlgBody'); box.textContent = '';
    var on = activeIdx(k.name) >= 0, CI = window.CivitaiInfo, mid = CI ? CI.modelIdOf(k.civitai) : '', token = {};
    box._tok = token;
    // --- ліва частина
    var left = el('div', 'ld-left'), tabs = el('div', 'ld-tabs'), bOv = el('button', 'on', 'Огляд'), bGa = el('button', null, 'Галерея'); bOv.type = bGa.type = 'button';
    tabs.appendChild(bOv); tabs.appendChild(bGa); left.appendChild(tabs);
    var vOv = el('div', 'ld-ov'), strip = el('div', 'ld-strip'), desc = el('div', 'ld-desc'), vGa = el('div', 'ld-gal'); vGa.hidden = true;
    var im0 = thumbUrl(k); if (im0) { var i0 = el('img'); i0.src = im0; i0.alt = ''; strip.appendChild(i0); } else strip.appendChild(el('p', 'lm', mid ? 'Завантаження картинок автора…' : 'Немає картинок'));
    desc.appendChild(el('p', 'lm', mid ? 'Завантаження опису з Civitai…' : (k.note || 'Опису немає (LoRA не знайдено на Civitai).')));
    vOv.appendChild(strip); vOv.appendChild(desc); left.appendChild(vOv); left.appendChild(vGa);
    function tab(g) { bOv.classList.toggle('on', !g); bGa.classList.toggle('on', g); vOv.hidden = g; vGa.hidden = !g; if (g && loadGal) loadGal(); }
    var loadGal = null; dragScroll(strip);
    var alive = function () { return box._tok === token && $('lDlg').open; };
    bOv.addEventListener('click', function () { tab(false); }); bGa.addEventListener('click', function () { tab(true); });
    // --- права частина
    var r = el('div', 'ld-right'); r.appendChild(el('h3', null, k.title || k.name));
    r.appendChild(el('p', 'lm', '<lora:' + k.name + '>' + (k.folder ? '  ·  папка: ' + k.folder : '')));
    var acts = el('div', 'acts'), add = el('button', on ? 'on' : 'btn-main', on ? '✓ Додано (прибрати)' : 'Додати до активного набору'); add.type = 'button'; add.addEventListener('click', function () { toggle(k.name); openDetail(k); });
    acts.appendChild(add); if (k.civitai) { var a2 = el('a', 'lnk', 'Civitai ↗'); a2.href = k.civitai; a2.target = '_blank'; a2.rel = 'noopener'; acts.appendChild(a2); } r.appendChild(acts);
    var tr = k.triggers && k.triggers.length ? k.triggers : [], hints = !tr.length && k.hints ? k.hints : [];
    if (tr.length || hints.length) {
      r.appendChild(el('p', 'lm', tr.length ? 'Тригер-слова (натисни, щоб додати в промпт):' : 'Часті теги навчання:'));
      var row = el('div', 'chips'); (tr.length ? tr : hints).forEach(function (w) { var ch = el('button', 'chip tg', w); ch.type = 'button'; ch.addEventListener('click', function () { host.insert(w); }); row.appendChild(ch); }); r.appendChild(row);
    }
    var lic = el('div', 'ld-lic'); r.appendChild(lic); var det = el('div', 'ld-det'); r.appendChild(det);
    var cfg = el('div', 'lcfg'), gs = el('select'); gs.title = 'Група цієї LoRA';
    var opts = allGroups(); if (opts.indexOf(groupOf(k)) < 0) opts.push(groupOf(k));
    opts.concat(['＋ Нова група…']).forEach(function (n) { var o = el('option', null, n); o.value = n; if (n === groupOf(k)) o.selected = true; gs.appendChild(o); });
    gs.addEventListener('change', function () {
      var v = gs.value; if (v === '＋ Нова група…') { v = (window.prompt('Назва нової групи') || '').trim().slice(0, 40); if (!v) { openDetail(k); return; } }
      meta(k.name).group = v === autoGroup(k) ? undefined : v; host.save(); renderManager(); openDetail(k);
    });
    cfg.appendChild(el('span', 'lm', 'Група:')); cfg.appendChild(gs); r.appendChild(cfg);
    function localDet() {
      var rows = [['Тип', k.type], ['База', k.base], ['Версія', k.version], ['18+', k.nsfw ? 'так' : '']].filter(function (x) { return x[1]; });
      if (rows.length) { det.appendChild(el('h4', null, 'Деталі')); rows.forEach(function (x) { var p = el('p', 'ld-row'); p.appendChild(el('span', null, x[0])); p.appendChild(el('b', null, x[1])); det.appendChild(p); }); }
    }
    localDet();
    if (!mid) lic.appendChild(el('p', 'lm', 'Ліцензія невідома: цієї LoRA не знайдено на Civitai (або воркер ще не знайшов її).'));
    box.appendChild(left); box.appendChild(r);
    if (!d.open) d.showModal();
    // --- дані з Civitai
    if (!mid || !CI) return;
    lic.appendChild(el('p', 'lm', 'Завантаження ліцензії…'));
    CI.fetchModel(mid).then(function (model) {
      if (box._tok !== token) return;   // вікно вже показує іншу LoRA
      var ver = CI.pickVersion(model, k.versionId, k.version), gal = CI.gallery(ver);
      lic.textContent = ''; lic.appendChild(el('h4', null, 'Ліцензія'));
      lic.appendChild(el('p', 'lm ld-small', 'Наведи курсор (або торкнись) на пункт: з\u2019явиться пояснення, що це означає. Для картинок для себе на своєму ПК важливі перші пункти; решта — для тих, хто робить сервіси чи моделі.'));
      CI.licenseItems(model).forEach(function (it) { var p = el('p', 'ld-li ' + (it.ok ? 'ok' : 'no')); p.tabIndex = 0; p.appendChild(el('span', 'ld-mark', it.ok ? '✓' : '✕')); p.appendChild(el('span', null, it.text)); tip(p, it); lic.appendChild(p); });
      lic.appendChild(el('p', 'lm ld-small', 'Дані з Civitai: перед комерційним використанням перевір сторінку моделі.'));
      det.textContent = ''; det.appendChild(el('h4', null, 'Деталі'));
      var mtags = (model.tags || []).map(function (t) { return typeof t === 'string' ? t : t.name; }).filter(Boolean).slice(0, 20);
      CI.details(model, ver).forEach(function (x) { var p = el('p', 'ld-row'); p.appendChild(el('span', null, x[0])); p.appendChild(el('b', null, x[1])); det.appendChild(p); });
      if (mtags.length) { det.appendChild(el('h4', null, 'Теги')); var tgs = el('div', 'chips'); mtags.forEach(function (t) { tgs.appendChild(el('span', 'chip', t)); }); det.appendChild(tgs); }
      strip.textContent = ''; if (!gal.length) strip.appendChild(el('p', 'lm', 'Автор не додав картинок до цієї версії (або вони 18+ і Civitai їх не віддає).'));
      var sg = gal.slice(0, 12); sg.forEach(function (g) { var t = galTile(g, false, function () { return sg; }); t.classList.add('ld-st'); strip.appendChild(t); }); if (gal.length > 1) carousel(strip, alive);
      var vid = ver && ver.id;
      var gal2 = mkGallery(vGa, { alive: function () { return box._tok === token; }, empty: 'Спільнота ще не додала робіт (або вони 18+ і Civitai їх не віддає).', fetchPage: function (cur, f) { return vid ? CI.fetchImages(vid, cur, f) : Promise.resolve({ items: [], next: '' }); } });
      loadGal = function () { loadGal = null; gal2.start(); };
      bGa.textContent = 'Галерея';
      desc.textContent = '';
      var html = (ver && ver.description ? ver.description : '') + (model.description || '');
      if (html.trim()) { var dv = el('div', 'ld-html'); if (ver && ver.description) { var vh = el('div'); vh.appendChild(CI.safeHtml(ver.description)); dv.appendChild(vh); } if (model.description) dv.appendChild(CI.safeHtml(model.description)); desc.appendChild(dv); }
      else desc.appendChild(el('p', 'lm', 'Автор не залишив опису.'));
      if (model.tags && model.tags.length) { var tg = el('div', 'chips'); model.tags.slice(0, 20).forEach(function (t) { tg.appendChild(el('span', 'chip', typeof t === 'string' ? t : t.name)); }); desc.appendChild(tg); }
    }, function () {
      if (box._tok !== token) return;
      lic.textContent = ''; lic.appendChild(el('p', 'lm', 'Не вдалося отримати дані з Civitai (немає зв’язку або сайт їх не віддає). Відкрий «Civitai ↗».'));
      desc.textContent = ''; desc.appendChild(el('p', 'lm', k.note || 'Опис недоступний.'));
    });
  }

  // галерея: щільні плитки з великою картинкою, як на Civitai
  function renderManager() {
    var g = $('lGrid'); g.textContent = '';
    var q = $('lSearch').value.trim().toLowerCase(), st = host.state;
    var by = $('lBy'); if (!by.options.length) BY.forEach(function (o) { var op = el('option', null, 'Групувати: ' + o[1]); op.value = o[0]; by.appendChild(op); }); by.value = st.loraBy;
    var gr = $('lGroups'); gr.textContent = '';
    var counts = {}; known.forEach(function (k) { var n = groupOf(k); counts[n] = (counts[n] || 0) + 1; });
    var sel = counts[st.loraGroup] ? st.loraGroup : '';
    [['', 'Усі (' + known.length + ')']].concat(Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a] || a.localeCompare(b); }).map(function (n) { return [n, n + ' (' + counts[n] + ')']; })).forEach(function (c) {
      var b = el('button', sel === c[0] ? 'on' : '', c[1]); b.type = 'button'; b.title = c[0] ? 'Показати лише «' + c[0] + '»' : 'Показати всі LoRA';
      b.addEventListener('click', function () { st.loraGroup = c[0]; host.save(); renderManager(); }); gr.appendChild(b);
    });
    var nocat = known.filter(function (k) { return !category(k); }).length;
    $('lInfo').textContent = known.length ? 'LoRA на ПК: ' + known.length + '. Клік по плитці відкриває деталі; «＋» додає в генерацію.'
      + (st.loraBy === 'category' && nocat > known.length / 2 ? ' Категорій мало: воркер добирає їх з Civitai у фоні (потрібен інтернет на ПК), тимчасово можна групувати за папкою чи базовою моделлю.' : '')
      : 'Список LoRA ще не отримано. Запусти воркер на ПК (нова версія): він сам надішле список із папки Forge разом із метаданими.';
    known.filter(function (k) {
      return (!sel || groupOf(k) === sel) && (!q || (k.name + ' ' + (k.title || '') + ' ' + (k.base || '') + ' ' + groupOf(k) + ' ' + (k.tags || []).join(' ') + ' ' + (k.triggers || []).join(' ')).toLowerCase().indexOf(q) >= 0);
    }).forEach(function (k) {
      var on = activeIdx(k.name) >= 0, c = el('div', 'ltile' + (on ? ' on' : '')), im = thumbUrl(k); c.title = (k.title || k.name) + (k.base ? ' · ' + k.base : '');
      if (im) { var i = el('img'); i.src = im; i.alt = ''; i.loading = 'lazy'; c.appendChild(i); } else c.appendChild(el('div', 'lnoimg', 'без прев\u2019ю'));
      if (k.base) c.appendChild(el('span', 'lbase', k.base)); if (k.nsfw) c.appendChild(el('span', 'badge18 lb18', '18+'));
      c.appendChild(el('span', 'ltitle', k.title || k.name));
      var add = el('button', 'lplus', on ? '✓' : '＋'); add.type = 'button'; add.title = on ? 'Додано: натисни, щоб прибрати' : 'Додати в генерацію';
      add.addEventListener('click', function (e) { e.stopPropagation(); toggle(k.name); }); c.appendChild(add);
      c.addEventListener('click', function () { openDetail(k); }); g.appendChild(c);
    });
  }

  function render() { if (!host) return; renderActive(); renderManager(); }
  window.SDLoras = {
    mkGallery: mkGallery,
    DEFAULT_LIST: Object.keys(DEFAULTS).map(function (n) { return { name: n, w: DEFAULTS[n] }; }),
    defaultWeight: defaultWeight, render: render, names: function () { return known.map(function (k) { return k.name; }); },
    init: function (h) { host = h; if (window.CivitaiInfo) CivitaiInfo.setTransport(function (kind, q) { return host.api('civ?' + new URLSearchParams(Object.assign({ kind: kind }, q)).toString()); }); $('lSearch').addEventListener('input', renderManager); $('lBy').addEventListener('change', function () { host.state.loraBy = this.value; host.state.loraGroup = ''; host.save(); renderManager(); }); $('lDlg').addEventListener('click', function (e) { if (e.target === this) this.close(); });
      $('loraReset').addEventListener('click', function () { host.set(JSON.parse(JSON.stringify(window.SDLoras.DEFAULT_LIST))); render(); host.toast('Повернено типові LoRA'); });
      $('lRefresh').addEventListener('click', function () {
        host.api('loras-refresh', { method: 'POST', body: '{}' }).then(function (r) {
          host.toast(r.online ? 'Запит надіслано ПК: список оновиться за кілька секунд' : 'Сервер вимкнений: список оновиться, щойно ПК увімкнеться');
          [5000, 12000, 25000].forEach(function (t) { setTimeout(function () { window.SDLoras.load(); }, t); });
        }, function (e) { host.toast(e.message); });
      });
      render(); },
    load: function () { if (!host) return; host.api('loras').then(function (r) { known = r.loras || []; knownAt = Date.now(); render(); knownSubs.slice().forEach(function (f) { f(); }); }, function () { /* без списку */ }); },
  };
})();
