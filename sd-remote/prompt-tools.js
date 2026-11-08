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

  // Нова вага одного тегу. action: число (дельта) або 'reset'. loraDefault(name) → типова вага LoRA або null
  function reweight(tag, action, loraDefault) {
    var p = parseTag(tag);
    if (p.kind === 'lora') {
      var def = loraDefault ? loraDefault(p.name) : null; if (def == null) def = 1;
      var w = action === 'reset' ? def : clamp((p.w == null ? def : p.w) + action, -5, 5);
      return '<lora:' + p.name + ':' + fmt(w) + '>';
    }
    var nw = action === 'reset' ? 1 : clamp((p.w == null ? 1 : p.w) + action, 0, 3);
    return Math.abs(nw - 1) < 1e-9 ? p.inner : '(' + p.inner + ':' + fmt(nw) + ')';
  }

  // Змінити вагу всіх тегів, яких торкається виділення [a,b). Повертає {text, start, end} (нове виділення) або null
  function applyWeight(text, a, b, action, loraDefault) {
    if (!(b > a)) return null;
    var segs = segments(text).filter(function (s) { return s.cs < b && s.ce > a; });
    if (!segs.length) return null;
    var out = '', pos = 0, start = -1, end = 0;
    segs.forEach(function (s) {
      out += text.slice(pos, s.cs); if (start < 0) start = out.length;
      out += reweight(text.slice(s.cs, s.ce), action, loraDefault); end = out.length; pos = s.ce;
    });
    return { text: out + text.slice(pos), start: start, end: end };
  }

  // HTML для підсвітки: кожен символ тексту лишається на місці (без відступів), лише обгортки <span>
  function highlightHtml(text) {
    var html = '', pos = 0;
    segments(text).forEach(function (s, i) {
      var tag = text.slice(s.cs, s.ce), p = parseTag(tag), cls = 't t' + (i % 2);
      if (p.kind === 'lora') cls = 't lora'; else if (p.kind === 'w') cls += p.w > 1 ? ' up' : p.w < 1 ? ' down' : '';
      html += esc(text.slice(pos, s.cs)) + '<span class="' + cls + '">' + esc(tag) + '</span>'; pos = s.ce;
    });
    return html + esc(text.slice(pos)) + (/\n$/.test(text) ? '​' : '');
  }

  // Рядок тегів LoRA для промпта: [{name, w}] → "<lora:name:0.2>, …"
  function loraTags(list) {
    return (list || []).filter(function (l) { return l && l.name; }).map(function (l) { return '<lora:' + l.name + ':' + fmt(Number(l.w) || 0) + '>'; }).join(', ');
  }
  function joinPrompt(text, list) { return [String(text || '').trim().replace(/,\s*$/, ''), loraTags(list)].filter(Boolean).join(', '); }

  var api = { segments: segments, parseTag: parseTag, reweight: reweight, applyWeight: applyWeight, highlightHtml: highlightHtml, loraTags: loraTags, joinPrompt: joinPrompt };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.PromptTools = api;
})(typeof window !== 'undefined' ? window : globalThis);
