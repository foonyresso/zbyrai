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

  // ---- групи й 18+: автоматично з метаданих Civitai (теги, nsfw), можна змінити вручну; вибір зберігається в браузері (host.state.loraMeta)
  var TAG_GROUPS = [['character', 'Персонажі'], ['style', 'Стилі'], ['concept', 'Концепти'], ['clothing', 'Одяг'], ['pose', 'Пози'], ['poses', 'Пози'], ['background', 'Фони'], ['scenery', 'Фони'], ['tool', 'Інструменти'], ['detail', 'Інструменти']];
  function meta(name) { var m = host.state.loraMeta; return m[name] || (m[name] = {}); }
  function autoGroup(k) {
    var tags = (k.tags || []).map(function (t) { return String(t).toLowerCase(); });
    for (var i = 0; i < TAG_GROUPS.length; i++) if (tags.indexOf(TAG_GROUPS[i][0]) >= 0) return TAG_GROUPS[i][1];
    return k.base || 'Інше';
  }
  function groupOf(k) { var m = host.state.loraMeta[k.name]; return (m && m.group) || autoGroup(k); }
  function adultOf(k) { var m = host.state.loraMeta[k.name]; return m && m.adult != null ? !!m.adult : !!k.nsfw; }
  function allGroups() { var g = {}; known.forEach(function (k) { g[groupOf(k)] = 1; }); Object.keys(host.state.loraMeta).forEach(function (n) { var m = host.state.loraMeta[n]; if (m && m.group) g[m.group] = 1; }); return Object.keys(g).sort(); }

  // вкладка зі списком
  function renderManager() {
    var g = $('lGrid'); g.textContent = '';
    var q = $('lSearch').value.trim().toLowerCase(), st = host.state, showAdult = !!st.loraAdult;
    $('lAdult').checked = showAdult;
    var visible = known.filter(function (k) { return showAdult || !adultOf(k); }), hidden = known.length - visible.length;
    // чіпси груп із лічильниками
    var gr = $('lGroups'); gr.textContent = '';
    var counts = {}; visible.forEach(function (k) { var n = groupOf(k); counts[n] = (counts[n] || 0) + 1; });
    var sel = counts[st.loraGroup] ? st.loraGroup : '';
    [['', 'Усі (' + visible.length + ')']].concat(Object.keys(counts).sort().map(function (n) { return [n, n + ' (' + counts[n] + ')']; })).forEach(function (c) {
      var b = el('button', sel === c[0] ? 'on' : '', c[1]); b.type = 'button'; b.title = c[0] ? 'Показати лише групу «' + c[0] + '»' : 'Показати всі LoRA';
      b.addEventListener('click', function () { st.loraGroup = c[0]; host.save(); renderManager(); }); gr.appendChild(b);
    });
    $('lInfo').textContent = known.length ? 'LoRA на ПК: ' + known.length + (hidden ? ' · приховано 18+: ' + hidden + ' (увімкни перемикач «Показувати 18+»)' : '') + '. «Додати» створює блок із повзунком сили ліворуч.'
      : 'Список LoRA ще не отримано. Запусти воркер на ПК (нова версія): він сам надішле список із папки Forge разом із метаданими.';
    visible.filter(function (k) {
      return (!sel || groupOf(k) === sel) && (!q || (k.name + ' ' + (k.title || '') + ' ' + (k.base || '') + ' ' + groupOf(k) + ' ' + (k.triggers || []).join(' ')).toLowerCase().indexOf(q) >= 0);
    }).forEach(function (k) {
      var c = el('div', 'lcard'), on = activeIdx(k.name) >= 0;
      var th = el('div', 'lth');
      if (k.thumb) { var im = el('img'); im.src = 'data:image/webp;base64,' + k.thumb; im.alt = k.title || k.name; im.loading = 'lazy'; th.appendChild(im); } else th.textContent = 'без прев\u2019ю';
      c.appendChild(th);
      var b = el('div', 'lbody');
      var head = el('b', null, k.title || k.name); if (adultOf(k)) head.appendChild(el('span', 'badge18', ' 18+')); b.appendChild(head);
      var mt = [k.version, k.base].filter(Boolean).join(' · '); if (mt) b.appendChild(el('span', 'lm', mt));
      b.appendChild(el('span', 'lm', '<lora:' + k.name + '>'));
      if (k.note) b.appendChild(el('span', 'lnote', k.note));
      var tr = k.triggers && k.triggers.length ? k.triggers : [], hints = !tr.length && k.hints ? k.hints : [];
      if (tr.length || hints.length) {
        var row = el('div', 'chips');
        (tr.length ? tr : hints).forEach(function (w) { var ch = el('button', 'chip tg', w); ch.type = 'button'; ch.title = (tr.length ? 'Тригер-слово' : 'Частий тег навчання') + ': натисни, щоб додати в промпт'; ch.addEventListener('click', function () { host.insert(w); }); row.appendChild(ch); });
        b.appendChild(row);
      }
      // група й 18+ (можна змінити вручну)
      var cfgRow = el('div', 'lcfg'), gs = el('select'); gs.title = 'Група цієї LoRA';
      var opts = allGroups(); if (opts.indexOf(groupOf(k)) < 0) opts.push(groupOf(k));
      opts.concat(['＋ Нова група…']).forEach(function (n) { var o = el('option', null, n); o.value = n; if (n === groupOf(k)) o.selected = true; gs.appendChild(o); });
      gs.addEventListener('change', function () {
        var v = gs.value; if (v === '＋ Нова група…') { v = (window.prompt('Назва нової групи') || '').trim().slice(0, 40); if (!v) { renderManager(); return; } }
        meta(k.name).group = v === autoGroup(k) ? undefined : v; host.save(); renderManager();
      });
      var ad = el('label', 'chk'), ac = el('input'); ac.type = 'checkbox'; ac.checked = adultOf(k); ac.title = 'Позначити як 18+ (прихована, поки не ввімкнено перемикач)';
      ac.addEventListener('change', function () { meta(k.name).adult = ac.checked; host.save(); renderManager(); }); ad.appendChild(ac); ad.appendChild(document.createTextNode(' 18+'));
      cfgRow.appendChild(gs); cfgRow.appendChild(ad); b.appendChild(cfgRow);
      var acts = el('div', 'acts');
      var add = el('button', on ? 'on' : '', on ? '✓ Додано' : 'Додати'); add.title = on ? 'Прибрати з генерації' : 'Додати в генерацію зі стандартною силою'; add.addEventListener('click', function () { toggle(k.name); });
      acts.appendChild(add);
      if (k.civitai) { var a = el('a', 'lnk', 'Civitai ↗'); a.href = k.civitai; a.target = '_blank'; a.rel = 'noopener'; a.title = 'Сторінка LoRA на Civitai'; acts.appendChild(a); }
      b.appendChild(acts); c.appendChild(b); g.appendChild(c);
    });
  }

  function render() { renderActive(); renderManager(); }
  window.SDLoras = {
    DEFAULT_LIST: Object.keys(DEFAULTS).map(function (n) { return { name: n, w: DEFAULTS[n] }; }),
    defaultWeight: defaultWeight, render: render, names: function () { return known.filter(function (k) { return host.state.loraAdult || !adultOf(k); }).map(function (k) { return k.name; }); },
    init: function (h) { host = h; $('lSearch').addEventListener('input', renderManager); $('lAdult').addEventListener('change', function () { host.state.loraAdult = this.checked; host.save(); renderManager(); }); render(); },
    load: function () { host.api('loras').then(function (r) { known = r.loras || []; render(); }, function () { /* без списку */ }); },
  };
})();
