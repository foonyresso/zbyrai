// Чиста логіка «Віддаленого SD» без DOM: пропорції й розмір, складання промпта з тегів, пошук тегів, підписи. Тести: test/sd-client.test.js
(function (root) {
  var RATIOS = ['1:1', '2:3', '3:4', '4:5', '5:7', '9:16', '9:21'];
  var LONG_MIN = 640, LONG_MAX = 1536, LONG_STEP = 64, FINAL_MAX = 2800;
  // Найбільший апскейл, щоб довга сторона результату не перевищила FINAL_MAX (крок 0.05, не більше 2×)
  function maxUpscale(w, h) { return Math.max(1, Math.min(2, Math.floor(FINAL_MAX / Math.max(w, h) * 20) / 20)); }

  // Розмір у пікселях за пропорцією: довга сторона = long, коротка рахується й округлюється до кратної 64 (як 768×1344 у типових налаштуваннях). orient: 'v' (вертикально) | 'h' (горизонтально)
  function sizeFor(ratio, orient, long) {
    var p = String(ratio).split(':').map(Number), a = p[0] || 1, b = p[1] || 1;
    var lo = Math.min(a, b), hi = Math.max(a, b), short = Math.round(long * lo / hi / 64) * 64;
    return orient === 'h' ? { w: long, h: short } : { w: short, h: long };
  }
  function finalSize(w, h, upscale) { return { w: Math.round(w * upscale), h: Math.round(h * upscale) }; }

  // Тег для промпта: пробіли замість «_», дужки екрановані (так вимагає Stable Diffusion)
  var tagText = function (t) { return String(t).replace(/_/g, ' ').replace(/([()])/g, '\\$1'); };
  // Ключ порівняння: без ваг, дужок, регістру і «_»
  var norm = function (t) { return String(t).toLowerCase().replace(/\\/g, '').replace(/_/g, ' ').replace(/^[(\[]+|[)\]]+$/g, '').replace(/:\s*[\d.]+$/, '').replace(/\s+/g, ' ').trim(); };
  var splitTags = function (text) { return String(text || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean); };
  var hasTag = function (text, tag) { var k = norm(tag); return splitTags(text).some(function (x) { return norm(x) === k; }); };

  // Клік по тегу змінює головний промпт: є в тексті — прибирається, нема — додається в кінець.
  // У групах «один варіант» (single) інші теги цієї групи спочатку прибираються.
  function toggleTag(text, param, tag) {
    var list = splitTags(text), k = norm(tag);
    if (list.some(function (x) { return norm(x) === k; })) return list.filter(function (x) { return norm(x) !== k; }).join(', ');
    if (!param.multi) {
      var mine = {};
      param.groups.forEach(function (g) { g[1].forEach(function (it) { mine[norm(it[1])] = 1; }); });
      list = list.filter(function (x) { return !mine[norm(x)]; });
    }
    list.push(tagText(tag));
    return list.join(', ');
  }
  function countIn(text, tags) { return tags.filter(function (t) { return hasTag(text, t); }).length; }

  // Пошук по англійському тегу (і по українській підказці)
  function searchTags(tree, q, limit) {
    q = String(q || '').trim().toLowerCase().replace(/_/g, ' ');
    if (q.length < 2) return [];
    var res = [];
    (tree || []).some(function (c) { return c.subs.some(function (s) { return s.params.some(function (p) { return p.groups.some(function (g) { return g[1].some(function (it) {
      if (String(it[1]).replace(/_/g, ' ').toLowerCase().indexOf(q) >= 0 || it[0].toLowerCase().indexOf(q) >= 0) res.push({ param: p, hint: it[0], tag: it[1], path: c.name + ' › ' + s.name });
      return res.length >= (limit || 120);
    }); }); }); }); });
    return res;
  }

  function queueText(st) {
    if (!st) return '';
    if (st.status === 'queued') return 'У черзі: ' + st.position;
    if (st.status === 'running') return 'Генерується на ПК…';
    if (st.status === 'done') return 'Готово';
    return st.error || 'Помилка';
  }
  function pcText(ping) {
    if (!ping) return { cls: 'off', text: 'Сервер недоступний' };
    if (!ping.online) return { cls: 'off', text: 'Сервер вимкнений' + (ping.queue ? ' · черга ' + ping.queue : '') };
    return { cls: 'on', text: 'Сервер увімкнений' + (ping.queue ? ' · черга ' + ping.queue : '') };
  }
  function fileName(prompt, seed, ext) {
    var s = String(prompt || 'sd').toLowerCase().replace(/[^a-z0-9а-яіїєґ]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'sd';
    return s + (seed != null && seed >= 0 ? '-' + seed : '') + '.' + (ext || 'webp');
  }
  var api = { RATIOS: RATIOS, LONG_MIN: LONG_MIN, LONG_MAX: LONG_MAX, LONG_STEP: LONG_STEP, FINAL_MAX: FINAL_MAX, maxUpscale: maxUpscale, sizeFor: sizeFor, finalSize: finalSize, tagText: tagText, norm: norm, splitTags: splitTags, hasTag: hasTag, toggleTag: toggleTag, countIn: countIn, searchTags: searchTags, queueText: queueText, pcText: pcText, fileName: fileName };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.SDClient = api;
})(typeof window !== 'undefined' ? window : globalThis);
