// Автопідказки тегів у полях промпта: меню під полем, стрілки вибирають, Enter/Tab вставляють, Esc закриває.
// Списки (data/*.txt, зібрані з CSV розширення Tag Autocomplete) вантажаться при першому наборі. Логіка: autocomplete-core.js.
(function () {
  var A = window.SDAcCore, COLORS = { '0': '#7fb8e8', '1': '#f06a6a', '3': '#d98af0', '4': '#6fd69a', '5': '#f0b05a', '7': '#f0b05a', '8': '#6fd69a', q: '#f0b05a', lora: '#62c8ec' };
  var loaded = {}, sets = { danbooru: true, e621: true }, merged = null, host = { names: function () { return []; }, weight: function () { return null; } };

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function load(name) {   // повертає Promise; кожен список вантажиться один раз
    if (!loaded[name]) loaded[name] = fetch('./data/' + name + '.txt').then(function (r) { return r.ok ? r.text() : ''; }).then(A.parse, function () { return []; });
    return loaded[name];
  }
  function list() {
    var want = Object.keys(sets).filter(function (k) { return sets[k]; });
    return Promise.all(want.map(load)).then(function (ls) { var key = want.join('+'); if (!merged || merged.key !== key) merged = { key: key, data: ls.length > 1 ? A.merge(ls) : ls[0] || [] }; return merged.data; });
  }

  function attach(ta) {
    var box = ta.closest('.field'), pop = el('div', 'acp'), items = [], sel = 0, frag = null, mute = false;
    pop.hidden = true; box.appendChild(pop);
    function hide() { pop.hidden = true; items = []; }
    function render() {
      pop.textContent = '';
      items.forEach(function (it, i) {
        var row = el('div', 'acr' + (i === sel ? ' on' : '')), name = el('span', 'acn', it.label); name.style.color = COLORS[it.cat] || COLORS['0'];
        row.appendChild(name); if (it.alias) row.appendChild(el('span', 'aca', '← ' + it.alias)); row.appendChild(el('span', 'acc', it.count));
        row.addEventListener('pointerdown', function (e) { e.preventDefault(); accept(i); });
        pop.appendChild(row);
      });
      pop.hidden = !items.length;
    }
    function accept(i) {
      var it = items[i]; if (!it || !frag) return;
      var r = A.apply(ta.value, frag, it.insert); mute = true;
      ta.value = r.text; ta.setSelectionRange(r.caret, r.caret); hide(); ta.dispatchEvent(new Event('input', { bubbles: true })); mute = false;
    }
    function update() {
      if (mute) return;
      frag = A.fragment(ta.value, ta.selectionStart);
      if (!frag || ta.selectionStart !== ta.selectionEnd) return hide();
      var f = frag;
      if (f.lora) {
        var q = f.query, res = host.names().filter(function (n) { return n.toLowerCase().indexOf(q) >= 0; }).slice(0, 12);
        items = res.map(function (n) { var w = host.weight(n); return { label: n, cat: 'lora', count: 'LoRA', insert: '<lora:' + n + ':' + (w == null ? 0.8 : w) + '>' }; }); sel = 0; return render();
      }
      list().then(function (data) {
        if (frag !== f || ta.selectionStart !== f.end) return;   // користувач уже пішов далі
        items = A.search(data, f.query, 12).map(function (r) { return { label: A.tagText(r.e.t), cat: r.e.c, alias: r.alias, count: A.count(r.e.n), insert: A.tagText(r.e.t) }; }); sel = 0; render();
      });
    }
    ta.addEventListener('input', update);
    ta.addEventListener('keydown', function (e) {
      if (pop.hidden || !items.length) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); sel = (sel + 1) % items.length; render(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); sel = (sel + items.length - 1) % items.length; render(); }
      else if ((e.key === 'Enter' && !e.ctrlKey && !e.metaKey) || e.key === 'Tab') { e.preventDefault(); e.stopPropagation(); accept(sel); }
      else if (e.key === 'Escape') { e.preventDefault(); hide(); }
    }, true);
    ta.addEventListener('blur', function () { setTimeout(hide, 120); });
    ta.addEventListener('click', hide);
  }

  window.SDAutocomplete = {
    attach: attach,
    init: function (h) { host = h; },
    start: function () { Object.keys(sets).forEach(function (k) { load(k); }); },
    setSets: function (s) { sets = Object.assign({ danbooru: true, e621: true }, s); merged = null; Object.keys(sets).forEach(function (k) { if (sets[k]) load(k); }); },
  };
})();
