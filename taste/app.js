// Ігрові смаки: малює каталог, групи, мінуси й задуми з data.js.
// Фільтр групи й пошук зберігаються в адресі (?g=loot&q=...), тож на потрібний зріз можна дати посилання.
(function () {
  var T = window.TASTE;
  if (!T) return;

  var collator = new Intl.Collator('uk');
  var byId = {};
  T.groups.forEach(function (g) { byId[g.id] = g; g.count = 0; g.primary = []; });
  T.games.forEach(function (game) {
    game.groups.forEach(function (id) { if (byId[id]) byId[id].count++; });
    var p = byId[game.groups[0]];
    if (p) p.primary.push(game);
  });

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function $(id) { return document.getElementById(id); }
  function plural(n, one, few, many) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
    return many;
  }

  // ---- шапка сторінки ----
  var d = new Date(T.updated + 'T00:00:00');
  var dateText = isNaN(d) ? T.updated : d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' });
  $('meta').textContent = T.games.length + ' ' + plural(T.games.length, 'запис', 'записи', 'записів') +
    ' · ' + T.groups.length + ' ' + plural(T.groups.length, 'група', 'групи', 'груп') + ' · оновлено ' + dateText;

  // ---- стан фільтра ----
  var state = { g: 'all', q: '' };
  try {
    var params = new URLSearchParams(location.search);
    if (byId[params.get('g')]) state.g = params.get('g');
    state.q = params.get('q') || '';
  } catch (e) {}

  function saveState() {
    try {
      var p = new URLSearchParams();
      if (state.g !== 'all') p.set('g', state.g);
      if (state.q) p.set('q', state.q);
      var s = p.toString();
      history.replaceState(null, '', location.pathname + (s ? '?' + s : '') + location.hash);
    } catch (e) {}
  }

  function setGroup(id, scroll) {
    state.g = id;
    renderChips();
    renderCatalog();
    saveState();
    if (scroll) $('catalog').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ---- групи ----
  var pillars = $('pillars-grid');
  var top = Math.max.apply(null, T.groups.map(function (g) { return g.count; }));
  T.groups.forEach(function (g) {
    var b = el('button', 'pillar');
    b.type = 'button';
    var head = el('div', 'pillar-head');
    head.appendChild(el('h3', null, g.name));
    head.appendChild(el('span', 'count', String(g.count)));
    b.appendChild(head);
    b.appendChild(el('p', 'pd', g.desc));
    var bar = el('div', 'bar-meter');
    var fill = el('i');
    fill.style.width = Math.max(6, Math.round(g.count / top * 100)) + '%';
    bar.appendChild(fill);
    b.appendChild(bar);
    var names = g.primary.slice().sort(function (a, c) { return collator.compare(a.name, c.name); }).slice(0, 5);
    var row = el('p', 'pg');
    row.textContent = names.map(function (x) { return x.name.replace(/\s*\(.*$/, ''); }).join(' · ') + (g.count > names.length ? ' …' : '');
    b.appendChild(row);
    b.addEventListener('click', function () { setGroup(g.id, true); });
    pillars.appendChild(b);
  });

  // ---- чіпи фільтра ----
  var chips = $('chips');
  function chip(id, label, count) {
    var b = el('button', 'chip');
    b.type = 'button';
    b.setAttribute('data-g', id);
    b.appendChild(document.createTextNode(label + ' '));
    b.appendChild(el('span', 'n', String(count)));
    b.addEventListener('click', function () { setGroup(id, false); });
    return b;
  }
  function renderChips() {
    chips.textContent = '';
    var c = chip('all', 'Усі', T.games.length);
    if (state.g === 'all') c.classList.add('on');
    chips.appendChild(c);
    T.groups.forEach(function (g) {
      var b = chip(g.id, g.name, g.count);
      if (state.g === g.id) b.classList.add('on');
      chips.appendChild(b);
    });
  }

  // ---- каталог ----
  function matches(game) {
    if (state.g !== 'all' && game.groups.indexOf(state.g) < 0) return false;
    if (!state.q) return true;
    var hay = [game.name, game.likes, game.minus || '', (game.tags || []).join(' ')].join(' ').toLowerCase();
    return hay.indexOf(state.q.toLowerCase()) >= 0;
  }

  function gameCard(game) {
    var a = el('article', 'game');
    var h = el('h4', null, game.name);
    if (game.check) {
      var q = el('span', 'check', '?');
      q.title = game.check;
      q.setAttribute('aria-label', 'Варто перевірити: ' + game.check);
      h.appendChild(q);
    }
    a.appendChild(h);
    var gt = el('p', 'gtags');
    game.groups.forEach(function (id) {
      if (!byId[id]) return;
      var t = el('button', 'tag tag-btn' + (id === game.groups[0] ? ' main' : ''), byId[id].name);
      t.type = 'button';
      t.addEventListener('click', function () { setGroup(id, false); });
      gt.appendChild(t);
    });
    a.appendChild(gt);
    var like = el('p', 'likes');
    like.appendChild(el('b', null, 'Подобається'));
    like.appendChild(document.createTextNode(game.likes));
    a.appendChild(like);
    if (game.minus) {
      var m = el('p', 'minus');
      m.appendChild(el('b', null, 'Мінус'));
      m.appendChild(document.createTextNode(game.minus));
      a.appendChild(m);
    }
    if (game.tags && game.tags.length) {
      var tg = el('p', 'tags');
      game.tags.forEach(function (t) { tg.appendChild(el('span', 'tag', t)); });
      a.appendChild(tg);
    }
    return a;
  }

  function section(title, desc, games) {
    var s = el('section', 'cat-group');
    var h = el('h3', null, title);
    h.appendChild(el('span', 'count', String(games.length)));
    s.appendChild(h);
    if (desc) s.appendChild(el('p', 'cat-desc', desc));
    var grid = el('div', 'games');
    games.forEach(function (g) { grid.appendChild(gameCard(g)); });
    s.appendChild(grid);
    return s;
  }

  function sorted(list) { return list.slice().sort(function (a, b) { return collator.compare(a.name, b.name); }); }

  var catalog = $('catalog-list');
  function renderCatalog() {
    catalog.textContent = '';
    var found = T.games.filter(matches);
    $('found').textContent = found.length === T.games.length ? '' :
      'Знайдено: ' + found.length + ' з ' + T.games.length;
    if (!found.length) {
      catalog.appendChild(el('p', 'empty', 'Нічого не знайдено. Спробуй інше слово або зніми фільтр групи.'));
      return;
    }
    if (state.g !== 'all') {
      catalog.appendChild(section(byId[state.g].name, byId[state.g].desc, sorted(found)));
      return;
    }
    T.groups.forEach(function (g) {
      var list = found.filter(function (x) { return x.groups[0] === g.id; });
      if (list.length) catalog.appendChild(section(g.name, g.desc, sorted(list)));
    });
  }

  var search = $('q');
  search.value = state.q;
  search.addEventListener('input', function () {
    state.q = search.value.trim();
    renderCatalog();
    saveState();
  });

  // ---- мінуси ----
  var dis = $('dislikes-grid');
  T.dislikes.forEach(function (x) {
    var a = el('article', 'note');
    a.appendChild(el('h3', null, x.title));
    a.appendChild(el('p', null, x.text));
    var row = el('p', 'tags');
    x.games.forEach(function (g) { row.appendChild(el('span', 'tag', g)); });
    a.appendChild(row);
    dis.appendChild(a);
  });

  // ---- задуми ----
  var ideas = $('ideas-grid');
  T.ideas.forEach(function (x, i) {
    var a = el('article', 'note idea');
    a.appendChild(el('span', 'num', String(i + 1).padStart(2, '0')));
    a.appendChild(el('h3', null, x.title));
    a.appendChild(el('p', null, x.text));
    var row = el('p', 'tags');
    row.appendChild(el('span', 'from', 'Основа:'));
    x.from.forEach(function (g) { row.appendChild(el('span', 'tag', g)); });
    a.appendChild(row);
    ideas.appendChild(a);
  });

  renderChips();
  renderCatalog();
})();
