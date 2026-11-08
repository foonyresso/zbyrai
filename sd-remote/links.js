// Вкладка «Посилання»: корисні сервіси (відкриваються в новій вкладці) + свої посилання (зберігаються в браузері).
(function () {
  var $ = function (id) { return document.getElementById(id); }, host = null;
  var DEFAULTS = [
    { g: 'Промпти й опис картинок', title: 'Картинка → промпт (Vheer)', url: 'https://vheer.com/app/image-to-prompt', note: 'Завантаж картинку й отримай її опис-промпт англійською. Сторонній безкоштовний сервіс: картинка йде на їхній сервер, не вантаж приватного.' },
    { g: 'Промпти й опис картинок', title: 'WD Tagger (Hugging Face)', url: 'https://huggingface.co/spaces/SmilingWolf/wd-tagger', note: 'Картинка → теги у стилі Danbooru (аніме). Онлайн-демо моделей WD14.' },
    { g: 'Промпти й опис картинок', title: 'DeepL Перекладач', url: 'https://www.deepl.com/translator', note: 'Переклад задуму українською на англійську для промпта.' },
    { g: 'Промпти й опис картинок', title: 'Danbooru: групи тегів', url: 'https://danbooru.donmai.us/wiki_pages/tag_groups', note: 'Довідник тегів за групами (може містити відвертий вміст).' },
    { g: 'Натхнення', title: 'Civitai', url: 'https://civitai.com', note: 'Приклади картинок разом із промптами й налаштуваннями для ідей.' },
    { g: 'Редагування', title: 'Photopea', url: 'https://www.photopea.com', note: 'Онлайн-редактор у стилі Photoshop: шари, маски, ретуш готових картинок.' },
  ];

  // Приймає лише http(s); повертає нормалізовану адресу або ''
  function cleanUrl(u) { try { var x = new URL(String(u || '').trim()); return /^https?:$/.test(x.protocol) ? x.href : ''; } catch (e) { return ''; } }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  function card(l, own) {
    var a = el('a', 'lnk-card'); a.href = l.url; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.title = 'Відкрити в новій вкладці: ' + l.url;
    a.appendChild(el('b', null, l.title)); a.appendChild(el('span', 'lm', new URL(l.url).host)); if (l.note) a.appendChild(el('span', 'ln', l.note));
    if (own) { var x = el('button', 'lx', '×'); x.type = 'button'; x.title = 'Видалити це посилання'; x.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); host.state.links = host.state.links.filter(function (z) { return z.id !== l.id; }); host.save(); render(); }); a.appendChild(x); }
    return a;
  }
  function render() {   // групи за заголовками; власні посилання окремо в кінці
    var box = $('lnList'); box.textContent = ''; var cur = null, grid = null;
    function head(t) { box.appendChild(el('h3', 'sh', t)); grid = el('div', 'llinks'); box.appendChild(grid); }
    DEFAULTS.forEach(function (l) { if (l.g !== cur) { cur = l.g; head(cur); } grid.appendChild(card(l, false)); });
    var own = host.state.links.filter(function (l) { return cleanUrl(l.url); });
    if (own.length) { head('Мої посилання'); own.forEach(function (l) { grid.appendChild(card(l, true)); }); }
  }
  function add() {
    var url = cleanUrl($('lnUrl').value), title = $('lnTitle').value.trim();
    if (!url) return host.toast('Вкажи адресу, що починається з https://');
    if (!title) title = new URL(url).host;
    host.state.links.push({ id: 'u' + Date.now(), title: title.slice(0, 60), url: url, note: $('lnNote').value.trim().slice(0, 140) });
    host.save(); $('lnTitle').value = $('lnUrl').value = $('lnNote').value = ''; render(); host.toast('Посилання додано');
  }
  var api = { cleanUrl: cleanUrl, DEFAULTS: DEFAULTS, init: function (h) { host = h; if (!Array.isArray(host.state.links)) host.state.links = []; $('lnAdd').addEventListener('click', add); $('lnUrl').addEventListener('keydown', function (e) { if (e.key === 'Enter') add(); }); render(); } };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else window.SDLinks = api;
})();
