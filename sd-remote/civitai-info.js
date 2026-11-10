'use strict';
// Дані про LoRA напряму з Civitai (браузер → civitai.com, наш сервер не задіяний): ліцензія, версія, картинки автора, опис.
// Чиста логіка (без DOM, окрім safeHtml) + fetchModel. Тести: test/civitai-info.test.js
(function () {
  var cache = {};

  // allowCommercialUse приходить масивом (Image, RentCivit, Rent, Sell) або старим рядком (None/Image/Rent/Sell): зводимо до набору прав
  function commercial(v) {
    var m = { image: ['Image'], rentcivit: ['Image', 'RentCivit'], rent: ['Image', 'RentCivit', 'Rent'], sell: ['Image', 'RentCivit', 'Rent', 'Sell'], none: [] };
    var out = {};
    (Array.isArray(v) ? v : [v]).forEach(function (x) { (m[String(x || 'none').toLowerCase()] || []).forEach(function (k) { out[k] = 1; }); if (Array.isArray(v)) out[String(x)] = 1; });
    return out;
  }

  // Ліцензія: пункти як на Civitai, простими словами. ok=true — зелене («можна»), false — червоне («не можна / треба»)
  function licenseItems(model) {
    if (!model) return [];
    var c = commercial(model.allowCommercialUse), yes = function (b) { return b !== false; };
    return [
      { key: 'credit', ok: model.allowNoCredit !== false, text: model.allowNoCredit !== false ? 'Можна не вказувати автора' : 'Треба вказувати автора моделі' },
      { key: 'image', ok: !!c.Image, text: c.Image ? 'Можна заробляти гроші на картинках, зроблених цією моделлю' : 'Не можна заробляти гроші на картинках з цієї моделі' },
      { key: 'civitai', ok: !!c.RentCivit, text: c.RentCivit ? 'Можна генерувати на сайті Civitai' : 'Не можна генерувати на сайті Civitai' },
      { key: 'rent', ok: !!c.Rent, text: c.Rent ? 'Можна використовувати в платних онлайн-сервісах генерації' : 'Не можна використовувати в платних онлайн-сервісах генерації' },
      { key: 'sell', ok: !!c.Sell, text: c.Sell ? 'Можна продавати саму модель (і її змішування)' : 'Не можна продавати саму модель чи її змішування' },
      { key: 'merge', ok: yes(model.allowDerivatives), text: yes(model.allowDerivatives) ? 'Можна робити й публікувати змішування з цією моделлю' : 'Не можна публікувати змішування з цією моделлю' },
      { key: 'relicense', ok: yes(model.allowDifferentLicense), text: yes(model.allowDifferentLicense) ? 'Для своїх змішувань можна ставити інші умови' : 'Змішування мають лишатися на тих самих умовах' }
    ];
  }

  function pickVersion(model, versionId, versionName) {
    var vs = (model && model.modelVersions) || [], i;
    if (versionId) for (i = 0; i < vs.length; i++) if (String(vs[i].id) === String(versionId)) return vs[i];
    if (versionName) for (i = 0; i < vs.length; i++) if (vs[i].name === versionName) return vs[i];
    return vs[0] || null;
  }

  function sized(url, w) { return String(url).replace(/\/width=\d+/, '/width=' + w).replace(/^(https:\/\/image\.civitai\.com\/[^/]+\/[^/]+\/)(?!width=)([^/]+)$/, '$1width=' + w + '/$2'); }

  // Картинки версії (їх завантажив автор): мініатюра, велика, промпт (якщо автор його залишив)
  function gallery(version) {
    return ((version && version.images) || []).filter(function (i) { return i && /^https:\/\//.test(i.url || '') && String(i.type || 'image') === 'image'; }).map(function (i) {
      var m = i.meta || {}; var pr = m.prompt || m.Prompt;
      return { thumb: sized(i.url, 450), big: sized(i.url, 1280), w: i.width || 0, h: i.height || 0, prompt: typeof pr === 'string' ? pr.trim() : '', neg: typeof m.negativePrompt === 'string' ? m.negativePrompt.trim() : '',
        info: ['steps', 'sampler', 'cfgScale', 'seed', 'Size'].filter(function (k) { return m[k] != null && m[k] !== ''; }).map(function (k) { return k + ': ' + m[k]; }).join(' · ') };
    });
  }

  function fmtBytes(kb) { return kb >= 1024 ? (kb / 1024).toFixed(kb >= 10240 ? 0 : 1) + ' МБ' : Math.round(kb) + ' КБ'; }
  function fmtDate(s) { var d = new Date(s); return isNaN(d) ? '' : d.toLocaleDateString('uk-UA', { year: 'numeric', month: 'long', day: 'numeric' }); }

  // Рядки для блоку «Деталі»: [підпис, значення]
  function details(model, version) {
    var rows = [], f = version && (version.files || []).filter(function (x) { return x.type === 'Model'; })[0] || (version && version.files && version.files[0]);
    var st = (version && version.stats) || (model && model.stats) || {};
    function add(k, v) { if (v !== undefined && v !== null && v !== '') rows.push([k, String(v)]); }
    add('Тип', model && model.type); add('Базова модель', version && version.baseModel); add('Версія', version && version.name);
    add('Статус', version ? (version.status === 'Published' || version.publishedAt ? 'Опубліковано' : version.status || '') : '');
    add('Опубліковано', version && fmtDate(version.publishedAt || version.createdAt)); add('Автор', model && model.creator && model.creator.username);
    if (f && f.sizeKB) add('Розмір файлу', fmtBytes(f.sizeKB)); if (f && f.metadata && f.metadata.format) add('Формат', f.metadata.format);
    if (st.downloadCount != null) add('Завантажень', st.downloadCount); if (st.thumbsUpCount != null) add('Вподобань', st.thumbsUpCount);
    if (model && model.nsfw) add('Вміст', '18+');
    return rows;
  }

  // Опис від автора — це HTML з чужого сайту: лишаємо тільки безпечні теги й атрибути
  var OK_TAGS = { P: 1, BR: 1, B: 1, STRONG: 1, I: 1, EM: 1, U: 1, S: 1, UL: 1, OL: 1, LI: 1, H1: 1, H2: 1, H3: 1, H4: 1, H5: 1, H6: 1, A: 1, IMG: 1, BLOCKQUOTE: 1, CODE: 1, PRE: 1, HR: 1, SPAN: 1, DIV: 1, TABLE: 1, THEAD: 1, TBODY: 1, TR: 1, TD: 1, TH: 1, DEL: 1 };
  function safeHtml(html, doc) {
    doc = doc || document; var t = new DOMParser().parseFromString('<body>' + String(html || '') + '</body>', 'text/html'), out = doc.createDocumentFragment();
    function walk(src, dst) {
      Array.prototype.forEach.call(src.childNodes, function (n) {
        if (n.nodeType === 3) return dst.appendChild(doc.createTextNode(n.nodeValue));
        if (n.nodeType !== 1) return;
        if (!OK_TAGS[n.tagName]) { if (!/^(SCRIPT|STYLE|IFRAME|OBJECT|EMBED|FORM|INPUT|BUTTON|TEXTAREA|SELECT|LINK|META|SVG|MATH|NOSCRIPT)$/i.test(n.tagName)) walk(n, dst); return; }
        var e = doc.createElement(n.tagName);
        if (n.tagName === 'A') { var h = n.getAttribute('href') || ''; if (/^https?:\/\//i.test(h)) { e.href = h; e.target = '_blank'; e.rel = 'noopener noreferrer nofollow'; } }
        if (n.tagName === 'IMG') { var s = n.getAttribute('src') || ''; if (!/^https:\/\//i.test(s)) return; e.src = s; e.loading = 'lazy'; e.alt = n.getAttribute('alt') || ''; e.referrerPolicy = 'no-referrer'; }
        walk(n, e); dst.appendChild(e);
      });
    }
    walk(t.body, out); return out;
  }

  // GET /api/v1/models/{id}: публічний, CORS дозволений; результат кешується до перезавантаження сторінки
  function fetchModel(id) {
    id = String(id || '').replace(/\D/g, ''); if (!id) return Promise.reject(new Error('no-id'));
    if (!cache[id]) cache[id] = fetch('https://civitai.com/api/v1/models/' + id).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }).catch(function (e) { delete cache[id]; throw e; });
    return cache[id];
  }
  // Галерея спільноти: роботи людей, які генерують на цій версії (GET /api/v1/images). Повертає {items, next}
  function fetchImages(versionId, cursor, opt) {
    opt = opt || {};
    var u = 'https://civitai.com/api/v1/images?modelVersionId=' + encodeURIComponent(String(versionId).replace(/\D/g, '')) + '&limit=48&sort=' + encodeURIComponent(opt.sort || 'Most Reactions') + '&period=' + encodeURIComponent(opt.period || 'AllTime') + (cursor ? '&cursor=' + encodeURIComponent(cursor) : '');
    return fetch(u).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }).then(function (d) {
      var raw = (d.items || []).filter(function (i) { return i && /^https:\/\//.test(i.url || '') && String(i.type || 'image') === 'image'; }), g = gallery({ images: raw });
      g.forEach(function (x, n) { x.user = raw[n].username || ''; });
      return { items: g, next: (d.metadata && d.metadata.nextCursor) || '' };
    });
  }
  // Найближча «стандартна» пропорція (ширина/висота) — щоб плитки різних картинок рівно лягали в колонки
  var RATIOS = [9 / 21, 9 / 16, 2 / 3, 3 / 4, 4 / 5, 1, 5 / 4, 4 / 3, 3 / 2, 16 / 9];
  function snapRatio(w, h) {
    if (!(w > 0 && h > 0)) return 2 / 3;
    var r = w / h, best = RATIOS[0];
    RATIOS.forEach(function (x) { if (Math.abs(Math.log(x / r)) < Math.abs(Math.log(best / r))) best = x; });
    return best;
  }
  function modelIdOf(url) { var m = /\/models\/(\d+)/.exec(String(url || '')); return m ? m[1] : ''; }

  var api = { licenseItems: licenseItems, pickVersion: pickVersion, gallery: gallery, details: details, safeHtml: safeHtml, fetchModel: fetchModel, fetchImages: fetchImages, modelIdOf: modelIdOf, snapRatio: snapRatio, commercial: commercial, sized: sized };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else window.CivitaiInfo = api;
})();
