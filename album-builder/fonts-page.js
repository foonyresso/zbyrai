// Сторінка «Українські шрифти». Дані: data/fonts-meta.js. Приховані шрифти: localStorage (лише в цьому браузері).
(function () {
  var M = window.FontsMeta, KEY = 'zb-fonts-hidden', $ = function (id) { return document.getElementById(id); };
  var st = { text: $('text').value, size: 44, cs: 'as', q: '', grp: '', showHidden: false, pick: {} };
  var hidden = {}; try { (JSON.parse(localStorage.getItem(KEY)) || []).forEach(function (n) { hidden[n] = 1; }); } catch (e) {}
  function saveHidden() { try { localStorage.setItem(KEY, JSON.stringify(Object.keys(hidden))); } catch (e) {} }
  function applyCase(s, c) {
    if (c === 'upper') return s.toUpperCase(); if (c === 'lower') return s.toLowerCase();
    if (c === 'title') return s.toLowerCase().replace(/(^|[^\p{L}\p{N}'’])(\p{L})/gu, function (m, a, b) { return a + b.toUpperCase(); });
    if (c === 'alt') { var i = 0; return Array.from(s.toLowerCase()).map(function (ch) { if (!/\p{L}/u.test(ch)) return ch; return (i++ % 2) ? ch : ch.toUpperCase(); }).join(''); }
    return s;
  }
  function el(t, cls, txt) { var e = document.createElement(t); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function styleSample(e, f) {
    var v = f.variants[st.pick[f.id] || 0]; e.style.fontFamily = '"' + v.family + '"'; e.style.fontWeight = v.weight; e.style.fontStyle = v.style; e.style.fontSize = st.size + 'px';
    e.textContent = applyCase(st.text, st.cs) || '—';
  }
  function card(f) {
    var c = el('article', 'card' + (hidden[f.id] ? ' isHidden' : '')), h = el('div', 'ch');
    h.appendChild(el('b', '', f.name)); h.appendChild(el('span', 'by', f.author));
    var x = el('button', 'x', hidden[f.id] ? 'Повернути' : 'Приховати'); x.title = hidden[f.id] ? 'Показати шрифт у списку' : 'Прибрати шрифт зі списку (можна повернути)';
    x.onclick = function () { if (hidden[f.id]) delete hidden[f.id]; else hidden[f.id] = 1; saveHidden(); render(); }; h.appendChild(x); c.appendChild(h);
    var s = el('div', 'sample'); styleSample(s, f); c.appendChild(s);
    if (f.variants.length > 1) {
      var ch = el('div', 'chips');
      f.variants.forEach(function (v, i) { var b = el('button', (st.pick[f.id] || 0) === i ? 'on' : '', v.label); b.onclick = function () { st.pick[f.id] = i; Array.prototype.forEach.call(ch.children, function (k, j) { k.className = j === i ? 'on' : ''; }); styleSample(s, f); }; ch.appendChild(b); });
      c.appendChild(ch);
    }
    var m = el('div', 'meta'); m.appendChild(el('span', 'badge', f.group));
    var lb = el('span', 'badge ' + (f.free ? 'ok' : 'bad'), f.free ? f.license : (f.license === 'unknown' ? 'не вільний: ліцензія невідома' : 'не вільний'));
    lb.title = f.licenseName; m.appendChild(lb);
    if (f.free && f.licenseUrl) { var l = el('a', '', 'ліцензія'); l.href = f.licenseUrl; l.target = '_blank'; l.rel = 'noopener'; m.appendChild(l); }
    var a = el('a', '', 'джерело'); a.href = f.source; a.target = '_blank'; a.rel = 'noopener'; m.appendChild(a);
    c.appendChild(m);
    if (f.note) c.appendChild(el('p', 'note', f.note));
    return c;
  }
  function render() {
    var q = st.q.trim().toLowerCase(), g = $('grid'); g.textContent = '';
    var nh = Object.keys(hidden).length, shown = 0;
    M.FAMILIES.forEach(function (f) {
      if (hidden[f.id] && !st.showHidden) return;
      if (st.grp && f.group !== st.grp) return;
      if (q && (f.name + ' ' + f.author).toLowerCase().indexOf(q) < 0) return;
      g.appendChild(card(f)); shown++;
    });
    $('count').textContent = shown + ' з ' + M.FAMILIES.length;
    $('empty').hidden = shown > 0;
    $('hiddenInfo').textContent = nh ? 'Приховано: ' + nh : '';
    $('showHidden').hidden = !nh; $('showHidden').textContent = st.showHidden ? 'Сховати приховані' : 'Показати приховані';
    $('exportHidden').hidden = !nh; $('restoreAll').hidden = !nh;
  }
  function restyle() { render(); }
  M.GROUPS.forEach(function (n) { var o = el('option', '', n); o.value = n; $('grp').appendChild(o); });
  $('text').oninput = function () { st.text = this.value; restyle(); };
  $('size').oninput = function () { st.size = +this.value; $('sizeOut').textContent = this.value; restyle(); };
  $('q').oninput = function () { st.q = this.value; render(); };
  $('grp').onchange = function () { st.grp = this.value; render(); };
  $('caseSeg').onclick = function (e) { var b = e.target.closest('button'); if (!b) return; st.cs = b.dataset.c; Array.prototype.forEach.call(this.children, function (k) { k.className = k === b ? 'on' : ''; }); restyle(); };
  $('showHidden').onclick = function () { st.showHidden = !st.showHidden; render(); };
  $('restoreAll').onclick = function () { hidden = {}; saveHidden(); render(); };
  $('exportHidden').onclick = function () {
    var blob = new Blob([JSON.stringify({ hiddenFonts: Object.keys(hidden), exported: new Date().toISOString() }, null, 2)], { type: 'application/json' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'hidden-fonts.json'; a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  };
  render();
})();
