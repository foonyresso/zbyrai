// Конвертер зображень: логіка без DOM (формати, пропорції, розмір, кадр, імена файлів). Працює і в браузері, і в Node-тестах.
(function (root) {
  // Формати: mime, розширення, чи є прозорість, чи стискається з втратами, значення якості «мала вага / рекомендовано / максимум».
  var FORMATS = {
    webp: { label: 'WebP', mime: 'image/webp', ext: 'webp', alpha: true, lossy: true, q: [65, 80, 92], note: 'Найкращий вибір для сайтів і архівів: у 2–4 рази менше за JPEG, підтримує прозорість. Рекомендовано 80.' },
    jpeg: { label: 'JPEG', mime: 'image/jpeg', ext: 'jpg', alpha: false, lossy: true, q: [70, 82, 92], note: 'Найсумісніший формат для фото. Прозорості немає (замість неї колір фону). Рекомендовано 82.' },
    png: { label: 'PNG', mime: 'image/png', ext: 'png', alpha: true, lossy: false, q: [], note: 'Без втрат, з прозорістю; для скриншотів з текстом і графіки. Файли найбільші, якості немає.' },
    avif: { label: 'AVIF', mime: 'image/avif', ext: 'avif', alpha: true, lossy: true, q: [40, 55, 75], note: 'Найменші файли, але кодування повільніше, а підтримка залежить від браузера. Рекомендовано 55.' }
  };

  // Пропорції: ключ, підпис, відношення ширина/висота (0 = оригінал, -1 = своя).
  var RATIOS = [
    ['orig', 'Оригінал', 0], ['1:1', '1:1 квадрат', 1], ['4:3', '4:3', 4 / 3], ['3:2', '3:2', 3 / 2], ['16:9', '16:9', 16 / 9], ['21:9', '21:9', 21 / 9],
    ['3:4', '3:4', 3 / 4], ['2:3', '2:3', 2 / 3], ['4:5', '4:5', 4 / 5], ['9:16', '9:16', 9 / 16], ['custom', 'Своя пропорція', -1]
  ];

  var DEFAULTS = { fmt: 'webp', q: { webp: 80, jpeg: 82, avif: 55 }, maxKB: 0, bg: '#ffffff', ratio: 'orig', ca: 16, cb: 9, w: 1920, maxSide: 0, noUp: true, suffix: '-web' };

  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }

  // Відношення ширина/висота рамки для фото з пропорцією a.
  function frameAspect(s, a) {
    if (s.ratio === 'orig') return a;
    if (s.ratio === 'custom') return clamp((+s.ca || 1) / (+s.cb || 1), 0.05, 20);
    for (var i = 0; i < RATIOS.length; i++) if (RATIOS[i][0] === s.ratio) return RATIOS[i][2];
    return a;
  }

  // Кадр: фото a=iw/ih у рамці r (cover), наближення z>=1, зсув fx,fy у 0..1. Повертає видиму частку (vw,vh) і прямокутник у пікселях джерела.
  function cropRect(iw, ih, r, z, fx, fy) {
    var a = iw / ih, vw, vh;
    z = Math.max(1, z || 1);
    if (a > r) { vw = r / a / z; vh = 1 / z; } else { vw = 1 / z; vh = a / r / z; }
    var left = (1 - vw) * clamp(fx, 0, 1), top = (1 - vh) * clamp(fy, 0, 1);
    return { vw: vw, vh: vh, left: left, top: top, sx: left * iw, sy: top * ih, sw: vw * iw, sh: vh * ih };
  }

  // Розмір результату. Оригінал: довга сторона обмежена maxSide (0 = без зміни). Інакше: ширина s.w, висота за пропорцією.
  // noUp не дає збільшувати: якщо кадр менший за потрібне, результат зменшується до кадру.
  function outSize(s, r, sw, sh) {
    var w, h, f;
    if (s.ratio === 'orig') {
      f = 1;
      if (s.maxSide > 0) { f = s.maxSide / Math.max(sw, sh); if (s.noUp) f = Math.min(1, f); }
      w = sw * f; h = sh * f;
    } else {
      w = s.w; h = s.w / r;
      if (s.noUp) { f = Math.min(1, sw / w, sh / h); w *= f; h *= f; }
    }
    return { w: Math.max(1, Math.round(w)), h: Math.max(1, Math.round(h)) };
  }

  // Зв'язані поля: з однієї сторони другу за пропорцією r.
  function heightFor(w, r) { return Math.max(1, Math.round(w / r)); }
  function widthFor(h, r) { return Math.max(1, Math.round(h * r)); }

  // Ім'я результату: назва без розширення + суфікс + нове розширення; повтори отримують (2), (3)…; used — об'єкт-лічильник імен.
  function outName(name, suffix, ext, used) {
    var base = String(name).replace(/\.[^.\/\\]+$/, '').replace(/[\\\/:*?"<>|]+/g, '_') || 'image';
    var n = base + (suffix || ''), full = n + '.' + ext, k = 1, low = full.toLowerCase();
    while (used[low]) { k++; full = n + ' (' + k + ').' + ext; low = full.toLowerCase(); }
    used[low] = 1;
    return full;
  }

  function fmtBytes(b) {
    if (b < 1024) return Math.round(b) + ' Б';
    if (b < 1048576) return (b / 1024).toFixed(b < 10240 ? 1 : 0) + ' КБ';
    if (b < 1073741824) return (b / 1048576).toFixed(1) + ' МБ';
    return (b / 1073741824).toFixed(2) + ' ГБ';
  }

  // Економія у відсотках (додатне = менше за оригінал).
  function saving(before, after) { return before > 0 ? Math.round((1 - after / before) * 100) : 0; }

  root.ConvertCore = { FORMATS: FORMATS, RATIOS: RATIOS, DEFAULTS: DEFAULTS, clamp: clamp, frameAspect: frameAspect, cropRect: cropRect, outSize: outSize, heightFor: heightFor, widthFor: widthFor, outName: outName, fmtBytes: fmtBytes, saving: saving };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.ConvertCore;
})(typeof window !== 'undefined' ? window : (typeof self !== 'undefined' ? self : globalThis));
