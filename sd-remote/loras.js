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

  // деталі LoRA у вікні: більша картинка, метадані, тригер-слова, група, посилання
  function openDetail(k) {
    var d = $('lDlg'), box = $('lDlgBody'); box.textContent = '';
    var on = activeIdx(k.name) >= 0, im = thumbUrl(k);
    var left = el('div', 'ldimg'); if (im) { var i = el('img'); i.src = im; i.alt = k.title || k.name; left.appendChild(i); } else left.textContent = 'без прев\u2019ю'; box.appendChild(left);
    var r = el('div', 'ldinfo'); r.appendChild(el('h3', null, k.title || k.name));
    var mt = [k.version, k.base, k.type].filter(Boolean).join(' · '); if (mt) r.appendChild(el('p', 'lm', mt));
    r.appendChild(el('p', 'lm', '<lora:' + k.name + '>' + (k.folder ? '  ·  папка: ' + k.folder : '')));
    if (k.nsfw) r.appendChild(el('p', 'lm', '18+')); if (k.note) r.appendChild(el('p', 'lnote2', k.note));
    var tr = k.triggers && k.triggers.length ? k.triggers : [], hints = !tr.length && k.hints ? k.hints : [];
    if (tr.length || hints.length) {
      r.appendChild(el('p', 'lm', tr.length ? 'Тригер-слова (натисни, щоб додати в промпт):' : 'Часті теги навчання:'));
      var row = el('div', 'chips'); (tr.length ? tr : hints).forEach(function (w) { var ch = el('button', 'chip tg', w); ch.type = 'button'; ch.addEventListener('click', function () { host.insert(w); }); row.appendChild(ch); }); r.appendChild(row);
    }
    var cfg = el('div', 'lcfg'), gs = el('select'); gs.title = 'Група цієї LoRA';
    var opts = allGroups(); if (opts.indexOf(groupOf(k)) < 0) opts.push(groupOf(k));
    opts.concat(['＋ Нова група…']).forEach(function (n) { var o = el('option', null, n); o.value = n; if (n === groupOf(k)) o.selected = true; gs.appendChild(o); });
    gs.addEventListener('change', function () {
      var v = gs.value; if (v === '＋ Нова група…') { v = (window.prompt('Назва нової групи') || '').trim().slice(0, 40); if (!v) { openDetail(k); return; } }
      meta(k.name).group = v === autoGroup(k) ? undefined : v; host.save(); renderManager(); openDetail(k);
    });
    cfg.appendChild(el('span', 'lm', 'Група:')); cfg.appendChild(gs); r.appendChild(cfg);
    var acts = el('div', 'acts'), add = el('button', on ? 'on' : 'btn-main', on ? '✓ Додано (прибрати)' : 'Додати в генерацію'); add.addEventListener('click', function () { toggle(k.name); openDetail(k); });
    acts.appendChild(add);
    if (k.civitai) { var a2 = el('a', 'lnk', 'Civitai ↗'); a2.href = k.civitai; a2.target = '_blank'; a2.rel = 'noopener'; acts.appendChild(a2); }
    r.appendChild(acts); box.appendChild(r); if (!d.open) d.showModal();
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
      var add = el('button', 'ladd', on ? '✓' : '＋'); add.type = 'button'; add.title = on ? 'Додано: натисни, щоб прибрати' : 'Додати в генерацію';
      add.addEventListener('click', function (e) { e.stopPropagation(); toggle(k.name); }); c.appendChild(add);
      c.addEventListener('click', function () { openDetail(k); }); g.appendChild(c);
    });
  }

  function render() { renderActive(); renderManager(); }
  window.SDLoras = {
    DEFAULT_LIST: Object.keys(DEFAULTS).map(function (n) { return { name: n, w: DEFAULTS[n] }; }),
    defaultWeight: defaultWeight, render: render, names: function () { return known.map(function (k) { return k.name; }); },
    init: function (h) { host = h; $('lSearch').addEventListener('input', renderManager); $('lBy').addEventListener('change', function () { host.state.loraBy = this.value; host.state.loraGroup = ''; host.save(); renderManager(); }); $('lDlg').addEventListener('click', function (e) { if (e.target === this) this.close(); }); render(); },
    load: function () { host.api('loras').then(function (r) { known = r.loras || []; render(); }, function () { /* без списку */ }); },
  };
})();
