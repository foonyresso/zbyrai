// LoRA: вкладка зі списком із ПК (назва, метадані Civitai, тригер-слова, прев'ю) і активні блоки з повзунками сили (−5…5).
// Дані приходять від воркера (/api/sd/loras). Активні LoRA зберігає app.js (host.get/set).
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var DEFAULTS = { 'Epistail_0.1': 0.2, 'UTV_v0.1': 0.15, 'PFT_ASH_0.1': 0.3 };
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
      var h = el('div', 'lh'); var n = el('b', null, (k && k.title) || it.name); n.title = it.name + (k && k.base ? ' · ' + k.base : '');
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
  function copyText(t, btn) {
    var done = function () { btn.classList.add('ok'); host.toast('Промпт скопійовано'); setTimeout(function () { btn.classList.remove('ok'); }, 1200); };
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
      if (m.prompt) { g.prompt = m.prompt; g.neg = g.neg || m.neg; g.info = g.info || m.info; } else { g.hasPrompt = false; host.toast('До цієї картинки промпт не додано'); }
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
  function bigView(g) {
    var o = el('div', 'lbigv'), im = el('img'); im.src = g.big; im.alt = ''; im.referrerPolicy = 'no-referrer'; o.appendChild(im);
    var p = el('div', 'lbigp'), txt = el('span', 'lbigt'); p.appendChild(copyBtn(g, 'Копіювати промпт')); p.appendChild(txt); o.appendChild(p);
    var upd = function () { txt.textContent = g.prompt ? g.prompt.slice(0, 600) : 'Натисни іконку, щоб отримати й скопіювати промпт'; p.hidden = !wantsIcon(g); }; upd(); g.subs.push(upd);
    o.addEventListener('click', function () { o.remove(); }); ($('lDlg').open ? $('lDlg') : document.body).appendChild(o);
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
  function galTile(g, snap) {
    var t = el('div', 'lgi'), im = el('img'); im.draggable = false; im.src = g.thumb; im.alt = ''; im.loading = 'lazy'; im.referrerPolicy = 'no-referrer'; im.addEventListener('click', function () { bigView(g); }); t.appendChild(im);
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
  function openDetail(k) {
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
      CI.licenseItems(model).forEach(function (it) { var p = el('p', 'ld-li ' + (it.ok ? 'ok' : 'no')); p.appendChild(el('span', 'ld-mark', it.ok ? '✓' : '✕')); p.appendChild(el('span', null, it.text)); lic.appendChild(p); });
      lic.appendChild(el('p', 'lm ld-small', 'Дані з Civitai: перед комерційним використанням перевір сторінку моделі.'));
      det.textContent = ''; det.appendChild(el('h4', null, 'Деталі'));
      CI.details(model, ver).forEach(function (x) { var p = el('p', 'ld-row'); p.appendChild(el('span', null, x[0])); p.appendChild(el('b', null, x[1])); det.appendChild(p); });
      strip.textContent = ''; if (!gal.length) strip.appendChild(el('p', 'lm', 'Автор не додав картинок до цієї версії (або вони 18+ і Civitai їх не віддає).'));
      gal.slice(0, 12).forEach(function (g) { var t = galTile(g); t.classList.add('ld-st'); strip.appendChild(t); }); if (gal.length > 1) carousel(strip, alive);
      var vid = ver && ver.id, cursor = '', ended = false, loading = false, more = el('div', 'ld-sentinel');
      var gbox = el('div', 'ld-gbox'), gmsg = el('p', 'lm ld-gmsg'), all = [], cols = [], hs = [], zoom = 220, gen = 0;
      try { zoom = Math.max(100, Math.min(480, +localStorage.getItem('sd_galzoom') || 220)); } catch (e) { /* не критично */ }
      var zbar = el('div', 'ld-zoom'), zr = el('input'); zr.type = 'range'; zr.min = 100; zr.max = 480; zr.step = 10; zr.value = zoom; zr.title = 'Розмір плиток';
      var sel = function (title, opts) { var s = el('select'); s.title = title; opts.forEach(function (o) { var x = el('option', null, o[1]); x.value = o[0]; s.appendChild(x); }); return s; };
      var sSort = sel('Сортування', [['Most Reactions', 'За реакціями'], ['Most Comments', 'За коментарями'], ['Newest', 'Спочатку нові']]), sPer = sel('Період', [['AllTime', 'За весь час'], ['Year', 'За рік'], ['Month', 'За місяць'], ['Week', 'За тиждень'], ['Day', 'За день']]);
      function refilter() { gen++; ended = false; all = []; cursor = ''; loading = false; gbox.textContent = ''; cols = []; hs = []; gmsg.textContent = ''; pull(); }
      sSort.addEventListener('change', function () { sPer.disabled = sSort.value === 'Newest'; refilter(); }); sPer.addEventListener('change', refilter);
      zbar.appendChild(sSort); zbar.appendChild(sPer); zbar.appendChild(el('span', 'lm', 'Розмір плиток')); zbar.appendChild(zr); zbar.appendChild(el('span', 'lm ld-ratios', 'пропорції підбираються автоматично'));
      function place(g) {   // у найкоротшу колонку; висота плитки ∝ 1/пропорція
        var m = 0, i; for (i = 1; i < hs.length; i++) if (hs[i] < hs[m] - 0.001) m = i;
        cols[m].appendChild(galTile(g, true)); hs[m] += 1 / window.CivitaiInfo.snapRatio(g.w, g.h);
      }
      function layout() {
        var w = gbox.clientWidth || vGa.clientWidth || 800, n = Math.max(1, Math.floor((w + 8) / (zoom + 8))); gbox.textContent = ''; cols = []; hs = [];
        for (var i = 0; i < n; i++) { var c = el('div', 'ld-col'); cols.push(c); hs.push(0); gbox.appendChild(c); }
        all.forEach(place);
      }
      zr.addEventListener('input', function () { zoom = +zr.value; try { localStorage.setItem('sd_galzoom', String(zoom)); } catch (e) { /* не критично */ } layout(); });
      if (window.ResizeObserver) { var ro = new ResizeObserver(function () { if (!vGa.hidden && gbox.clientWidth && Math.max(1, Math.floor((gbox.clientWidth + 8) / (zoom + 8))) !== cols.length) layout(); }); ro.observe(vGa); }
      vGa.textContent = ''; vGa.appendChild(zbar); vGa.appendChild(gbox); vGa.appendChild(gmsg); vGa.appendChild(more);
      function pull() {
        if (loading || !vid) return; loading = true; gmsg.textContent = 'Завантаження робіт спільноти…'; var my = gen;
        CI.fetchImages(vid, cursor, { sort: sSort.value, period: sPer.value }).then(function (r) {
          if (box._tok !== token || my !== gen) return; loading = false; if (!cols.length) layout(); r.items.forEach(function (g) { all.push(g); place(g); }); cursor = r.next; ended = !r.next; setTimeout(check, 50);
          gmsg.textContent = all.length ? (ended ? 'Це всі роботи.' : '') : 'Спільнота ще не додала робіт (або вони 18+ і Civitai їх не віддає).';
        }, function () { if (box._tok !== token || my !== gen) return; loading = false; gmsg.textContent = 'Не вдалося завантажити галерею з Civitai. Прокрути ще раз, щоб повторити.'; });
      }
      var near = function () { var a = more.getBoundingClientRect(), b = vGa.getBoundingClientRect(); return !vGa.hidden && a.top < b.bottom + 500; };
      var check = function () { if (!ended && !loading && near()) pull(); };
      vGa.addEventListener('scroll', check); if (window.IntersectionObserver) new IntersectionObserver(check, { root: vGa, rootMargin: '500px' }).observe(more);
      loadGal = function () { loadGal = null; pull(); };
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

  function render() { renderActive(); renderManager(); }
  window.SDLoras = {
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
    load: function () { if (!host) return; host.api('loras').then(function (r) { known = r.loras || []; render(); }, function () { /* без списку */ }); },
  };
})();
