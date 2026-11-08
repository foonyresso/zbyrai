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

  // ---- Кольори: палітра вбудовує колір у тег («red long hair», «red and blue multicolored hair»)
  var COLORS = [['white', 'білий', '#f2f2f2'], ['silver', 'сріблястий', '#c0c4cc'], ['grey', 'сірий', '#8a8f98'], ['black', 'чорний', '#1b1b1f'],
    ['brown', 'коричневий', '#7a4a2a'], ['blonde', 'русявий (блонд)', '#e8cf7a'], ['orange', 'помаранчевий', '#f08a2a'], ['red', 'червоний', '#d93a3a'],
    ['pink', 'рожевий', '#f27ab0'], ['purple', 'фіолетовий', '#8a52d6'], ['blue', 'синій', '#3a78e0'], ['aqua', 'блакитний', '#34c4d4'],
    ['green', 'зелений', '#3fae5a'], ['yellow', 'жовтий', '#f2d23a'], ['gold', 'золотий', '#d4a82a']];
  var CW = '(?:' + COLORS.map(function (c) { return c[0]; }).join('|') + ')', COLOR_RE = new RegExp('^' + CW + '(?: and ' + CW + ')*$');
  // Кольори, доступні для групи (блонд лише для волосся)
  function colorsFor(param) { return COLORS.filter(function (c) { return c[0] !== 'blonde' || /^hair/i.test(param.id); }); }
  function colorEntry(tag, colors) { var c = (colors || []).filter(Boolean); return (c.length ? c.join(' and ') + ' ' : '') + tagText(tag); }
  // Номер запису в промпті для тегу: «long hair» або з кольором («red and blue long hair»); -1, якщо немає
  function findEntry(list, tag) {
    var k = norm(tag);
    for (var i = 0; i < list.length; i++) { var e = norm(list[i]); if (e === k || (e.length > k.length && e.slice(-k.length - 1) === ' ' + k && COLOR_RE.test(e.slice(0, e.length - k.length - 1)))) return i; }
    return -1;
  }
  // Перефарбувати всі теги групи, що вже є в промпті, у нові кольори
  function recolor(text, param, colors) {
    var list = splitTags(text);
    param.groups.forEach(function (g) { g[1].forEach(function (it) { var i = findEntry(list, it[1]); if (i >= 0) list[i] = colorEntry(it[1], colors); }); });
    return list.join(', ');
  }

  // Клік по тегу змінює головний промпт: є в тексті (з кольором чи без) — прибирається, нема — додається в кінець.
  // У групах «один варіант» (single) інші теги цієї групи спочатку прибираються. colors — вибрані кольори групи (якщо вона з палітрою)
  function toggleTag(text, param, tag, colors) {
    var list = splitTags(text), i = findEntry(list, tag);
    if (i >= 0) { list.splice(i, 1); return list.join(', '); }
    if (!param.multi) param.groups.forEach(function (g) { g[1].forEach(function (it) { var j = findEntry(list, it[1]); if (j >= 0) list.splice(j, 1); }); });
    list.push(colorEntry(tag, param.color ? colors : []));
    return list.join(', ');
  }
  function countIn(text, tags) { var list = splitTags(text); return tags.filter(function (t) { return findEntry(list, t) >= 0; }).length; }

  // Пошук: за тегом, українською підказкою, а також за назвою групи/параметра («розмір грудей» показує всі теги групи)
  function searchTags(tree, q, limit) {
    q = String(q || '').trim().toLowerCase().replace(/_/g, ' ');
    if (q.length < 2) return [];
    var res = [], seen = {}, max = limit || 120;
    function push(p, it, path) { if (!seen[p.id + '|' + it[1]] && res.length < max) { seen[p.id + '|' + it[1]] = 1; res.push({ param: p, hint: it[0], tag: it[1], path: path }); } }
    (tree || []).forEach(function (c) { c.subs.forEach(function (s) { s.params.forEach(function (p) {
      var path = c.name + ' › ' + s.name;
      p.groups.forEach(function (g) {
        var byName = q.length >= 3 && ((p.label || '').toLowerCase().indexOf(q) >= 0 || (g[0] || '').toLowerCase().indexOf(q) >= 0);
        g[1].forEach(function (it) {
          if (byName || String(it[1]).replace(/_/g, ' ').toLowerCase().indexOf(q) >= 0 || it[0].toLowerCase().indexOf(q) >= 0) push(p, it, path);
        });
      });
    }); }); });
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
  var api = { RATIOS: RATIOS, LONG_MIN: LONG_MIN, LONG_MAX: LONG_MAX, LONG_STEP: LONG_STEP, FINAL_MAX: FINAL_MAX, maxUpscale: maxUpscale, sizeFor: sizeFor, finalSize: finalSize, tagText: tagText, norm: norm, splitTags: splitTags, hasTag: hasTag, toggleTag: toggleTag, countIn: countIn, searchTags: searchTags, COLORS: COLORS, colorsFor: colorsFor, colorEntry: colorEntry, findEntry: findEntry, recolor: recolor, queueText: queueText, pcText: pcText, fileName: fileName };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.SDClient = api;
})(typeof window !== 'undefined' ? window : globalThis);
