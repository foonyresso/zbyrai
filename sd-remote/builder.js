// Гнучкий режим: групи тегів (Персонаж › підгрупа › параметр › теги). Клік по тегу додає/прибирає його в полі промпта,
// а ручне редагування промпта підсвічує теги, що вже в тексті. Дані: tags-data.js (node tools/build-sd-tags.mjs).
(function () {
  var C = window.SDClient, TREE = window.SD_TAGS || [], $ = function (id) { return document.getElementById(id); };
  var host = { get: function () { return ''; }, set: function () {} };
  var cat = 0, chips = [];   // chips: {el, tag}
  try { cat = Math.min(TREE.length - 1, Math.max(0, +localStorage.getItem('sd_bcat') || 0)); } catch (e) { /* не критично */ }

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  function chip(param, it) {
    var b = el('button', 'chip tg', String(it[1]).replace(/_/g, ' '));
    b.type = 'button'; b.title = it[0] && it[0] !== it[1] ? it[0] : 'Додати в промпт';
    b.addEventListener('click', function () { host.set(C.toggleTag(host.get(), param, it[1])); });
    chips.push({ el: b, tag: it[1] });
    return b;
  }
  function paramBlock(p) {
    var box = el('div', 'param');
    var h = el('h4', null, p.label); h.appendChild(el('small', null, p.multi ? ' · кілька' : ' · один'));
    box.appendChild(h);
    p.groups.forEach(function (g) {
      if (g[0]) box.appendChild(el('div', 'gname', g[0]));
      var row = el('div', 'chips');
      g[1].forEach(function (it) { row.appendChild(chip(p, it)); });
      box.appendChild(row);
    });
    return box;
  }

  function renderTabs() {
    var t = $('bTabs'); t.textContent = '';
    TREE.forEach(function (c, i) {
      var b = el('button', 'tab' + (i === cat ? ' on' : ''), c.name); b.type = 'button'; b.title = 'Група: ' + c.name;
      b.appendChild(el('i', null, '')); b.dataset.i = i;
      b.addEventListener('click', function () { cat = i; try { localStorage.setItem('sd_bcat', i); } catch (e) { /* не критично */ } $('bSearch').value = ''; render(); });
      t.appendChild(b);
    });
  }
  function render() {
    chips = []; var body = $('bBody'); body.textContent = '';
    var q = $('bSearch').value;
    if (q.trim().length >= 2) {
      var res = C.searchTags(TREE, q, 150);
      if (!res.length) body.appendChild(el('p', 'hint', 'Нічого не знайдено'));
      var row = el('div', 'chips');
      res.forEach(function (r) { var c = chip(r.param, [r.hint, r.tag]); c.title = r.path + (r.hint ? ' · ' + r.hint : ''); row.appendChild(c); });
      body.appendChild(row);
    } else {
      TREE[cat].subs.forEach(function (s, i) {
        var d = el('details', 'sub'); d.open = i === 0;
        var sm = el('summary', null, s.name); sm.appendChild(el('i', null, '')); sm.dataset.sub = s.id;
        d.appendChild(sm); s.params.forEach(function (p) { d.appendChild(paramBlock(p)); }); body.appendChild(d);
      });
    }
    renderTabs(); refresh();
  }

  // підсвітити теги, що є в промпті, і показати лічильники
  var catTags = null;
  function refresh() {
    var text = host.get(), have = {};
    C.splitTags(text).forEach(function (x) { have[C.norm(x)] = 1; });
    chips.forEach(function (c) { c.el.classList.toggle('on', !!have[C.norm(c.tag)]); });
    document.querySelectorAll('#bBody summary[data-sub]').forEach(function (sm) {
      var n = sm.parentNode.querySelectorAll('.chip.on').length; sm.lastChild.textContent = n ? ' ' + n : '';
    });
    if (!catTags) catTags = TREE.map(function (c) { var o = []; c.subs.forEach(function (s) { s.params.forEach(function (p) { p.groups.forEach(function (g) { g[1].forEach(function (it) { o.push(C.norm(it[1])); }); }); }); }); return o; });
    document.querySelectorAll('#bTabs .tab').forEach(function (t) {
      var n = catTags[+t.dataset.i].filter(function (k) { return have[k]; }).length; t.lastChild.textContent = n ? ' ' + n : '';
    });
  }

  window.SDBuilder = {
    init: function (h) { host = h; $('bSearch').addEventListener('input', render); render(); },
    refresh: refresh,
  };
})();
