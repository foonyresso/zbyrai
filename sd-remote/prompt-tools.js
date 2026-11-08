// Чиста логіка промпта без DOM: розбір на теги, ваги виділеного тексту, підсвітка (HTML), теги LoRA. Тести: test/prompt-tools.test.js
(function (root) {
  var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };

  // Розбиття на теги по комах поза дужками й <…>; повертає {cs, ce} — межі вмісту тегу без пробілів
  function segments(text) {
    var out = [], start = 0, depth = 0, angle = 0, n = text.length;
    for (var i = 0; i <= n; i++) {
      var c = text.charAt(i);
      if (i < n) {
        if (c === '\\') { i++; continue; }
        if (c === '(') depth++; else if (c === ')') depth = Math.max(0, depth - 1);
        else if (c === '<' && /^<[a-z]+:/i.test(text.slice(i, i + 12))) angle++; else if (c === '>') angle = Math.max(0, angle - 1);
      }
      if (i === n || (c === ',' && depth === 0 && angle === 0)) {
        var s = start, e = i;
        while (s < e && /\s/.test(text.charAt(s))) s++;
        while (e > s && /\s/.test(text.charAt(e - 1))) e--;
        if (e > s) out.push({ cs: s, ce: e });
        start = i + 1;
      }
    }
    return out;
  }

  var LORA = /^<lora:([^:>]+)(?::(-?\d*\.?\d+))?>$/i, WEIGHTED = /^\(([\s\S]+):(-?\d*\.?\d+)\)$/;
  function parseTag(t) {
    var m = LORA.exec(t); if (m) return { kind: 'lora', name: m[1], w: m[2] === undefined ? null : parseFloat(m[2]) };
    m = WEIGHTED.exec(t); if (m) return { kind: 'w', inner: m[1], w: parseFloat(m[2]) };
    return { kind: 'plain', inner: t, w: null };
  }
  var fmt = function (w) { return String(+w.toFixed(2)); };
  var clamp = function (v, lo, hi) { return Math.min(hi, Math.max(lo, v)); };

  var WMIN = 0.1, WMAX = 5;
  // Задати точну вагу тегу (1.0 = без дужок). Теги <lora:…> не чіпає: їхня сила має власні повзунки
  function weighted(tag, w) {
    var p = parseTag(tag); if (p.kind === 'lora') return tag;
    w = clamp(w, WMIN, WMAX);
    return Math.abs(w - 1) < 1e-9 ? p.inner : '(' + p.inner + ':' + fmt(w) + ')';
  }
  function weightOf(tag) { var p = parseTag(tag); return p.kind === 'lora' ? null : (p.w == null ? 1 : p.w); }

  // Теги, яких торкається виділення [a,b): {cs, ce, tag, w}; без LoRA
  function selected(text, a, b) {
    if (!(b > a)) return [];
    return segments(text).filter(function (s) { return s.cs < b && s.ce > a; }).map(function (s) { var t = text.slice(s.cs, s.ce); return { cs: s.cs, ce: s.ce, tag: t, w: weightOf(t) }; }).filter(function (x) { return x.w != null; });
  }
  // Поточна вага виділених тегів (перший) або null
  function selectionWeight(text, a, b) { var l = selected(text, a, b); return l.length ? l[0].w : null; }

  // Виставити вагу w виділеним тегам. Суміжні теги об'єднуються в ОДНУ групу з однією вагою: «(a, b, c:1.4)»;
  // стара вага окремих тегів чи групи замінюється; вага 1.0 розгруповує в прості теги; <lora:…> лишаються як є.
  // Повертає {text, start, end} (нове виділення) або null
  function setWeight(text, a, b, w) {
    if (!(b > a)) return null;
    var all = segments(text).filter(function (s) { return s.cs < b && s.ce > a; });
    if (!all.some(function (s) { return weightOf(text.slice(s.cs, s.ce)) != null; })) return null;
    w = clamp(w, WMIN, WMAX);
    var out = '', pos = 0, start = -1, end = 0, run = [];
    function inner(t) { var p = parseTag(t); return p.kind === 'w' ? p.inner : t; }
    function flush() {
      if (!run.length) return;
      var first = run[0], last = run[run.length - 1], tags = run.map(function (s) { return inner(text.slice(s.cs, s.ce)); }).join(', ');
      out += text.slice(pos, first.cs); if (start < 0) start = out.length;
      out += Math.abs(w - 1) < 1e-9 ? tags : '(' + tags + ':' + fmt(w) + ')'; end = out.length; pos = last.ce; run = [];
    }
    all.forEach(function (s) {
      if (parseTag(text.slice(s.cs, s.ce)).kind === 'lora') { flush(); out += text.slice(pos, s.cs); if (start < 0) start = out.length; out += text.slice(s.cs, s.ce); end = out.length; pos = s.ce; } else run.push(s);
    });
    flush();
    return { text: out + text.slice(pos), start: start, end: end };
  }

  // Кінець групи, що починається на open в позиції i (з урахуванням вкладених дужок і екранування); -1, якщо не закрита
  function groupEnd(text, i, open, close) {
    var depth = 0;
    for (var k = i; k < text.length; k++) {
      var c = text.charAt(k);
      if (c === '\\') { k++; continue; }
      if (c === open) depth++; else if (c === close && --depth === 0) return k;
    }
    return -1;
  }
  // Підсвітка без вкладених фонів: коми золоті, <lora:…> блакитні, решта як є
  function plainHtml(t) {
    var out = '', i = 0;
    while (i < t.length) {
      var c = t.charAt(i);
      if (c === '\\') { out += esc(t.substr(i, 2)); i += 2; continue; }
      if (c === ',') { out += '<span class="c">,</span>'; i++; continue; }
      if (c === '<' && /^<[a-z]+:/i.test(t.slice(i, i + 12))) { var e = t.indexOf('>', i); if (e > 0) { out += '<span class="lora">' + esc(t.slice(i, e + 1)) + '</span>'; i = e + 1; continue; } }
      out += esc(c); i++;
    }
    return out;
  }
  // HTML для підсвітки: кожен символ тексту лишається на місці (без відступів), лише обгортки <span>
  function highlightHtml(text) {
    var out = '', i = 0, n = text.length;
    while (i < n) {
      var c = text.charAt(i), e;
      if (c === '(' || c === '[') {
        e = groupEnd(text, i, c, c === '(' ? ')' : ']');
        if (e > 0) { out += '<span class="' + (c === '(' ? 'grp' : 'grp2') + '">' + plainHtml(text.slice(i, e + 1)) + '</span>'; i = e + 1; continue; }
      }
      var j = i + 1;
      while (j < n && text.charAt(j) !== '(' && text.charAt(j) !== '[') { if (text.charAt(j) === '\\') j++; j++; }
      out += plainHtml(text.slice(i, Math.min(j, n))); i = Math.min(j, n);
    }
    return out + (/\n$/.test(text) ? '\u200b' : '');
  }

  // Рядок тегів LoRA для промпта: [{name, w}] → "<lora:name:0.2>, …"
  function loraTags(list) {
    return (list || []).filter(function (l) { return l && l.name; }).map(function (l) { return '<lora:' + l.name + ':' + fmt(Number(l.w) || 0) + '>'; }).join(', ');
  }
  function joinPrompt(text, list) { return [loraTags(list), String(text || '').trim().replace(/,\s*$/, '')].filter(Boolean).join(', '); }   // LoRA спочатку, потім теги

  var api = { WMIN: WMIN, WMAX: WMAX, segments: segments, parseTag: parseTag, setWeight: setWeight, selectionWeight: selectionWeight, highlightHtml: highlightHtml, loraTags: loraTags, joinPrompt: joinPrompt };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.PromptTools = api;
})(typeof window !== 'undefined' ? window : globalThis);
