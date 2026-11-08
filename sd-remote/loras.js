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

  // вкладка зі списком
  function renderManager() {
    var g = $('lGrid'); g.textContent = '';
    var q = $('lSearch').value.trim().toLowerCase();
    $('lInfo').textContent = known.length ? 'LoRA на ПК: ' + known.length + '. Натисни «Додати», і з’явиться блок із повзунком сили ліворуч.'
      : 'Список LoRA ще не отримано. Запусти воркер на ПК (нова версія): він сам надішле список із папки Forge разом із метаданими.';
    known.filter(function (k) {
      return !q || (k.name + ' ' + (k.title || '') + ' ' + (k.base || '') + ' ' + (k.triggers || []).join(' ')).toLowerCase().indexOf(q) >= 0;
    }).forEach(function (k) {
      var c = el('div', 'lcard'), on = activeIdx(k.name) >= 0;
      var th = el('div', 'lth');
      if (k.thumb) { var im = el('img'); im.src = 'data:image/webp;base64,' + k.thumb; im.alt = k.title || k.name; im.loading = 'lazy'; th.appendChild(im); } else th.textContent = 'без прев’ю';
      c.appendChild(th);
      var b = el('div', 'lbody');
      b.appendChild(el('b', null, k.title || k.name));
      var meta = [k.version, k.base].filter(Boolean).join(' · '); if (meta) b.appendChild(el('span', 'lm', meta));
      b.appendChild(el('span', 'lm', '<lora:' + k.name + '>'));
      if (k.note) b.appendChild(el('span', 'lnote', k.note));
      var tr = k.triggers && k.triggers.length ? k.triggers : [], hints = !tr.length && k.hints ? k.hints : [];
      if (tr.length || hints.length) {
        var row = el('div', 'chips');
        (tr.length ? tr : hints).forEach(function (w) { var ch = el('button', 'chip tg', w); ch.type = 'button'; ch.title = (tr.length ? 'Тригер-слово' : 'Частий тег навчання') + ': натисни, щоб додати в промпт'; ch.addEventListener('click', function () { host.insert(w); }); row.appendChild(ch); });
        b.appendChild(row);
      }
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
    defaultWeight: defaultWeight, render: render, names: function () { return known.map(function (k) { return k.name; }); },
    init: function (h) { host = h; $('lSearch').addEventListener('input', renderManager); render(); },
    load: function () { host.api('loras').then(function (r) { known = r.loras || []; render(); }, function () { /* без списку */ }); },
  };
})();
