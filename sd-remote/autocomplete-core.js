// Чиста логіка автопідказок тегів (без DOM): розбір списку, фрагмент під курсором, пошук, вставка. Тести: test/autocomplete-core.test.js
(function (root) {
  // Список із data/*.txt: «тег<TAB>категорія<TAB>кількість<TAB>синоніми через кому» → [{t, c, n, a:[…]}]
  function parse(text) {
    var out = [], lines = text.split('\n');
    for (var i = 0; i < lines.length; i++) {
      var l = lines[i]; if (!l) continue;
      var p = l.split('\t'); if (!p[0]) continue;
      out.push({ t: p[0], c: p[1] || '0', n: +p[2] || 0, a: p[3] ? p[3].split(',') : [] });
    }
    return out;
  }
  var merge = function (lists) { return [].concat.apply([], lists).sort(function (a, b) { return b.n - a.n; }); };

  // Фрагмент тегу, який пише користувач: від останньої коми/дужки/нового рядка до курсору. lora: true, якщо це «<lora:…»
  function fragment(text, caret) {
    var i = caret;
    while (i > 0 && !/[,(\[\n]/.test(text.charAt(i - 1))) i--;
    while (i < caret && /\s/.test(text.charAt(i))) i++;
    var raw = text.slice(i, caret), m = /^<lora:([^:>]*)$/i.exec(raw);
    if (m) return { start: i, end: caret, query: m[1].toLowerCase(), lora: true };
    if (/:\s*[\d.]*$/.test(raw) || raw.charAt(0) === '<') return null;   // вже пише вагу
    var q = raw.replace(/\\([()])/g, '$1').toLowerCase().trim().replace(/\s+/g, '_');
    return q.length >= 2 ? { start: i, end: caret, query: q, lora: false } : null;
  }

  // Пошук: спершу початок тегу, потім початок синоніма, потім збіг усередині (від 3 символів). Порядок усередині групи = за популярністю
  function search(list, q, limit) {
    limit = limit || 12; var a = [], b = [], c = [], sub = q.length >= 3;
    for (var i = 0; i < list.length && a.length < limit; i++) {
      var e = list[i], t = e.t;
      if (t.lastIndexOf(q, 0) === 0) { a.push({ e: e }); continue; }
      if (b.length < limit) { var hit = null; for (var k = 0; k < e.a.length; k++) if (e.a[k].lastIndexOf(q, 0) === 0) { hit = e.a[k]; break; } if (hit) { b.push({ e: e, alias: hit }); continue; } }
      if (sub && c.length < limit && t.indexOf(q) > 0 && (t.indexOf('_' + q) >= 0 || t.indexOf(q) > 0)) c.push({ e: e });
    }
    return a.concat(b, c).slice(0, limit);
  }

  var tagText = function (t) { return String(t).replace(/_/g, ' ').replace(/([()])/g, '\\$1'); };
  // Вставка вибраного: замінює фрагмент, додає «, » (якщо далі не кома). Повертає {text, caret}
  function apply(text, frag, insert) {
    var tail = text.slice(frag.end), sep = /^\s*(,|$)/.test(tail) && /^\s*,/.test(tail) ? '' : ', ';
    var head = text.slice(0, frag.start) + insert + sep;
    return { text: head + (sep ? tail.replace(/^\s+/, '') : tail), caret: head.length };
  }
  var count = function (n) { return n >= 9e8 ? '' : n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? Math.round(n / 1e3) + 'k' : String(n); };

  var api = { parse: parse, merge: merge, fragment: fragment, search: search, tagText: tagText, apply: apply, count: count };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.SDAcCore = api;
})(typeof window !== 'undefined' ? window : globalThis);
