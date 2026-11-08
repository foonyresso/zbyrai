// Вкладка «Шаблони»: вбудовані й власні шаблони, збереження поточних налаштувань під назвою. Логіка: templates.js.
(function () {
  var $ = function (id) { return document.getElementById(id); }, T = window.SDTemplates, host = null;
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  function card(t, own) {
    var c = el('div', 'tcard'), d = T.sanitize(t.data);
    c.appendChild(el('b', null, t.name)); if (t.note) c.appendChild(el('span', 'lm', t.note));
    var s = T.summary(d); if (s) c.appendChild(el('span', 'lm', s));
    if (d.prompt) { var p = el('span', 'lnote', d.prompt); p.title = d.prompt; c.appendChild(p); }
    var acts = el('div', 'acts');
    var ap = el('button', 'btn-main', 'Застосувати'); ap.title = 'Підставити налаштування й промпт цього шаблону'; ap.addEventListener('click', function () { host.apply(d); host.toast('Шаблон «' + t.name + '» застосовано'); }); acts.appendChild(ap);
    if (own) { var rm = el('button', '', 'Видалити'); rm.title = 'Видалити цей шаблон'; rm.addEventListener('click', function () { if (confirm('Видалити шаблон «' + t.name + '»?')) { host.set(host.list().filter(function (x) { return x.id !== t.id; })); render(); } }); acts.appendChild(rm); }
    c.appendChild(acts); return c;
  }
  function render() {
    var own = $('tOwn'), b = $('tBuiltin'); own.textContent = ''; b.textContent = '';
    var l = host.list();
    if (!l.length) own.appendChild(el('p', 'hint', 'Своїх шаблонів ще немає. Налаштуй промпт і параметри, вкажи назву й натисни «Зберегти».'));
    l.forEach(function (t) { own.appendChild(card(t, true)); });
    T.BUILTIN.forEach(function (t) { b.appendChild(card(t, false)); });
  }
  function save() {
    var name = $('tName').value.trim(); if (!name) return host.toast('Вкажи назву шаблону');
    var l = host.list().filter(function (x) { return x.name !== name; });
    l.push({ id: 't' + Date.now(), name: name.slice(0, 60), data: host.capture() }); host.set(l); $('tName').value = ''; render(); host.toast('Шаблон «' + name + '» збережено');
  }
  window.SDTplUI = { init: function (h) { host = h; $('tSave').addEventListener('click', save); $('tName').addEventListener('keydown', function (e) { if (e.key === 'Enter') save(); }); render(); }, render: render };
})();
