// Відео редактор і конвертер: логіка без DOM (частини таймлайна, кадр і пропорції, розмір, збирання команди ffmpeg). Працює в браузері й у Node-тестах.
// Модель: відео = список частин segs = [{ s, e, speed, vol }] (початок і кінець у секундах оригіналу, швидкість, гучність). Час на таймлайні («вихідний») = сума (e-s)/speed.
(function (root) {
  var MIN_SEG = 0.04; // найкоротша частина, с
  var SPEED_MIN = 0.1, SPEED_MAX = 8, VOL_MAX = 2;

  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function segDur(g) { return (g.e - g.s) / g.speed; }
  function newSeg(s, e) { return { s: s, e: e, speed: 1, vol: 1 }; }
  function total(segs) { var t = 0; for (var i = 0; i < segs.length; i++) t += segDur(segs[i]); return t; }
  function starts(segs) { var a = [], t = 0; for (var i = 0; i < segs.length; i++) { a.push(t); t += segDur(segs[i]); } return a; }

  // Де на таймлайні час t: номер частини, зсув усередині (вихідні секунди), відповідний час оригіналу.
  function locate(segs, t) {
    if (!segs.length) return null;
    var st = 0;
    for (var i = 0; i < segs.length; i++) {
      var d = segDur(segs[i]);
      if (t < st + d || i === segs.length - 1) {
        var off = clamp(t - st, 0, d);
        return { i: i, off: off, src: segs[i].s + off * segs[i].speed, start: st, dur: d };
      }
      st += d;
    }
    return null;
  }

  // Розрізати в точці t (вихідний час). Біля краю частини (< MIN_SEG) нічого не робить.
  function splitAt(segs, t) {
    var L = locate(segs, t);
    if (!L || L.off < MIN_SEG || L.dur - L.off < MIN_SEG) return segs;
    var g = segs[L.i], m = g.s + L.off * g.speed;
    return segs.slice(0, L.i).concat([Object.assign({}, g, { e: m }), Object.assign({}, g, { s: m })], segs.slice(L.i + 1));
  }

  // Виокремити діапазон [a, b] у самостійні частини; повертає нові частини й номери тих, що в діапазоні.
  function isolate(segs, a, b) {
    var T = total(segs); a = clamp(a, 0, T); b = clamp(b, 0, T);
    if (b < a) { var x = a; a = b; b = x; }
    var out = splitAt(splitAt(segs, a), b), st = starts(out), idx = [];
    for (var i = 0; i < out.length; i++) { var mid = st[i] + segDur(out[i]) / 2; if (mid > a && mid < b) idx.push(i); }
    return { segs: out, idx: idx };
  }

  function removeRange(segs, a, b) {
    var r = isolate(segs, a, b);
    return r.segs.filter(function (_, i) { return r.idx.indexOf(i) < 0; });
  }
  function keepRange(segs, a, b) {
    var r = isolate(segs, a, b);
    return r.segs.filter(function (_, i) { return r.idx.indexOf(i) >= 0; });
  }
  // Змінити швидкість і/або гучність частин у діапазоні: patch = { speed?, vol? }.
  function patchRange(segs, a, b, patch) {
    var r = isolate(segs, a, b);
    return r.segs.map(function (g, i) {
      if (r.idx.indexOf(i) < 0) return g;
      var n = Object.assign({}, g);
      if (patch.speed != null) n.speed = clamp(+patch.speed || 1, SPEED_MIN, SPEED_MAX);
      if (patch.vol != null) n.vol = clamp(+patch.vol, 0, VOL_MAX);
      return n;
    });
  }
  // Межі частини i на таймлайні: [початок, кінець].
  function segRange(segs, i) { var st = starts(segs)[i]; return [st, st + segDur(segs[i])]; }
  // Чи всі частини діапазону мають однакове значення поля (для показу в меню); інакше null.
  function commonValue(segs, a, b, key) {
    var r = isolate(segs, a, b), v;
    for (var k = 0; k < r.idx.length; k++) { var x = r.segs[r.idx[k]][key]; if (k === 0) v = x; else if (Math.abs(v - x) > 1e-9) return null; }
    return v === undefined ? null : v;
  }

  // Час оригіналу → вихідний час (для частин, що містять цей момент); null, якщо момент вирізано.
  function srcToOut(segs, src) {
    var st = 0;
    for (var i = 0; i < segs.length; i++) { var g = segs[i]; if (src >= g.s && src <= g.e) return st + (src - g.s) / g.speed; st += segDur(g); }
    return null;
  }

  // ---------- кадр і пропорції ----------
  // Пропорції: ключ, підпис, відношення ширина/висота (0 = весь кадр, -1 = довільно руками).
  var RATIOS = [
    ['orig', 'Весь кадр', 0], ['free', 'Довільно', -1], ['1:1', '1:1', 1], ['4:3', '4:3', 4 / 3], ['3:2', '3:2', 3 / 2], ['16:9', '16:9', 16 / 9], ['21:9', '21:9', 21 / 9],
    ['3:4', '3:4', 3 / 4], ['2:3', '2:3', 2 / 3], ['4:5', '4:5', 4 / 5], ['9:16', '9:16', 9 / 16], ['custom', 'Своя', -2]
  ];
  var MIN_CROP = 16;

  function ratioValue(key, ca, cb) {
    if (key === 'custom') return clamp((+ca || 1) / (+cb || 1), 0.05, 20);
    for (var i = 0; i < RATIOS.length; i++) if (RATIOS[i][0] === key) return RATIOS[i][2];
    return 0;
  }
  function fullCrop(vw, vh) { return { x: 0, y: 0, w: vw, h: vh }; }
  function isFull(c, vw, vh) { return !c || (c.x <= 0.5 && c.y <= 0.5 && c.w >= vw - 0.5 && c.h >= vh - 0.5); }

  // Найбільша рамка заданої пропорції в кадрі, з центром біля центру prev (якщо є).
  function fitCrop(vw, vh, aspect, prev) {
    if (!(aspect > 0)) return fullCrop(vw, vh);
    var w = vw, h = w / aspect;
    if (h > vh) { h = vh; w = h * aspect; }
    var cx = prev ? prev.x + prev.w / 2 : vw / 2, cy = prev ? prev.y + prev.h / 2 : vh / 2;
    return clampCrop({ x: cx - w / 2, y: cy - h / 2, w: w, h: h }, vw, vh);
  }
  function clampCrop(c, vw, vh) {
    var w = clamp(c.w, Math.min(MIN_CROP, vw), vw), h = clamp(c.h, Math.min(MIN_CROP, vh), vh);
    return { x: clamp(c.x, 0, vw - w), y: clamp(c.y, 0, vh - h), w: w, h: h };
  }
  function moveCrop(c, dx, dy, vw, vh) { return clampCrop({ x: c.x + dx, y: c.y + dy, w: c.w, h: c.h }, vw, vh); }

  // Потягнути за ручку (nw n ne e se s sw w) до точки (px, py) у координатах кадру. aspect > 0 тримає пропорцію, 0 = вільно.
  function resizeCrop(c, handle, px, py, aspect, vw, vh) {
    var L = c.x, T = c.y, R = c.x + c.w, B = c.y + c.h;
    var hasW = handle.indexOf('w') >= 0, hasE = handle.indexOf('e') >= 0, hasN = handle.indexOf('n') >= 0, hasS = handle.indexOf('s') >= 0;
    px = clamp(px, 0, vw); py = clamp(py, 0, vh);
    if (!(aspect > 0)) {
      if (hasW) L = Math.min(px, R - MIN_CROP); if (hasE) R = Math.max(px, L + MIN_CROP);
      if (hasN) T = Math.min(py, B - MIN_CROP); if (hasS) B = Math.max(py, T + MIN_CROP);
      return clampCrop({ x: L, y: T, w: R - L, h: B - T }, vw, vh);
    }
    var corner = (hasW || hasE) && (hasN || hasS), w, h, ax, ay;
    if (corner) {
      ax = hasW ? R : L; ay = hasN ? B : T; // нерухомий кут
      w = Math.abs(px - ax); h = Math.abs(py - ay);
      w = Math.max(w, h * aspect);
      var maxW = Math.min(hasW ? ax : vw - ax, (hasN ? ay : vh - ay) * aspect);
      w = clamp(w, Math.min(MIN_CROP * aspect, maxW), maxW); h = w / aspect;
      return { x: hasW ? ax - w : ax, y: hasN ? ay - h : ay, w: w, h: h };
    }
    if (hasW || hasE) { // бічна ручка: ширина міняється, висота за пропорцією, центр по вертикалі лишається
      ax = hasW ? R : L; w = Math.abs(px - ax);
      var cy = (T + B) / 2, maxWe = Math.min(hasW ? ax : vw - ax, Math.min(cy, vh - cy) * 2 * aspect);
      w = clamp(w, Math.min(MIN_CROP * aspect, maxWe), maxWe); h = w / aspect;
      return { x: hasW ? ax - w : ax, y: cy - h / 2, w: w, h: h };
    }
    ay = hasN ? B : T; h = Math.abs(py - ay); // верхня/нижня ручка
    var cx = (L + R) / 2, maxH = Math.min(hasN ? ay : vh - ay, Math.min(cx, vw - cx) * 2 / aspect);
    h = clamp(h, Math.min(MIN_CROP, maxH), maxH); w = h * aspect;
    return { x: cx - w / 2, y: hasN ? ay - h : ay, w: w, h: h };
  }
  // Рамка в цілих парних пікселях (потрібно для H.264).
  function cropPx(c, vw, vh) {
    var w = Math.max(2, Math.floor(c.w / 2) * 2), h = Math.max(2, Math.floor(c.h / 2) * 2);
    w = Math.min(w, Math.floor(vw / 2) * 2); h = Math.min(h, Math.floor(vh / 2) * 2);
    return { x: clamp(Math.floor(c.x / 2) * 2, 0, vw - w), y: clamp(Math.floor(c.y / 2) * 2, 0, vh - h), w: w, h: h };
  }

  // Розмір результату: size = { mode: 'orig' | 'h' | 'w', value }. Не збільшує понад розмір рамки. Завжди парні числа.
  function outSize(cw, ch, size) {
    var w = cw, h = ch;
    if (size && size.mode === 'h' && size.value > 0) { h = Math.min(size.value, ch); w = h * cw / ch; }
    else if (size && size.mode === 'w' && size.value > 0) { w = Math.min(size.value, cw); h = w * ch / cw; }
    return { w: Math.max(2, Math.round(w / 2) * 2), h: Math.max(2, Math.round(h / 2) * 2) };
  }
  var SIZE_PRESETS = [['orig', 'Як у оригіналі', 0], ['h', '2160p (4K)', 2160], ['h', '1440p', 1440], ['h', '1080p', 1080], ['h', '720p', 720], ['h', '480p', 480], ['h', '360p', 360], ['h', '240p', 240]];

  // ---------- формати й команда ffmpeg ----------
  // crf: [мала вага, рекомендовано, максимум]; ext, mime; video/audio: що потрібно в результаті.
  var FORMATS = {
    mp4: { label: 'MP4', ext: 'mp4', mime: 'video/mp4', video: true, audio: true, crf: [28, 23, 18], note: 'Найсумісніший відеоформат (H.264 + AAC): відкривається скрізь.' },
    webm: { label: 'WebM', ext: 'webm', mime: 'video/webm', video: true, audio: true, crf: [40, 33, 27], note: 'Відкритий формат для сайтів (VP9 + Opus). Кодується повільніше за MP4.' },
    gif: { label: 'GIF', ext: 'gif', mime: 'image/gif', video: true, audio: false, crf: [], note: 'Анімація без звуку. Файли швидко важчають: краще до 15 с і ширина до 480 px.' },
    mp3: { label: 'MP3', ext: 'mp3', mime: 'audio/mpeg', video: false, audio: true, crf: [], note: 'Лише звук. Працює і для відео, і для аудіофайлів.' }
  };
  var MP3_KBPS = [128, 192, 320];

  // Число для фільтрів ffmpeg: без експоненти.
  function n3(v) { return (Math.round(v * 1000) / 1000).toFixed(3); }
  // atempo приймає 0.5..2 (ланцюжок для крайніх значень).
  function atempoChain(sp) {
    var a = [];
    while (sp > 2) { a.push('atempo=2.0'); sp /= 2; }
    while (sp < 0.5) { a.push('atempo=0.5'); sp *= 2; }
    if (Math.abs(sp - 1) > 1e-6) a.push('atempo=' + n3(sp));
    return a;
  }

  // o: { segs, master, mute, crop, srcW, srcH, hasVideo, hasAudio, fmt, quality 0..2, size, fps, kbps, input }
  // Повертає { args, outFile, mime, outDur, size, vf } або кидає Error з поясненням українською.
  function buildExport(o) {
    var F = FORMATS[o.fmt];
    if (!F) throw new Error('Невідомий формат');
    if (!o.segs || !o.segs.length) throw new Error('Немає що експортувати: усі частини видалено');
    var vid = F.video, aud = F.audio && o.hasAudio && !o.mute;
    if (vid && !o.hasVideo) throw new Error('У файлі немає відео: оберіть MP3');
    if (!vid && !o.hasAudio) throw new Error('У файлі немає звуку для MP3');
    if (!vid && o.mute) throw new Error('Звук вимкнено, а MP3 складається лише зі звуку');
    var parts = [], labels = '', N = o.segs.length;
    o.segs.forEach(function (g, i) {
      var tr = 'start=' + n3(g.s) + ':end=' + n3(g.e);
      if (vid) { parts.push('[0:v:0]trim=' + tr + ',setpts=(PTS-STARTPTS)/' + n3(g.speed) + '[v' + i + ']'); labels += '[v' + i + ']'; }
      if (aud) {
        var ch = ['atrim=' + tr, 'asetpts=PTS-STARTPTS'].concat(atempoChain(g.speed));
        if (Math.abs(g.vol - 1) > 1e-6) ch.push('volume=' + n3(g.vol));
        parts.push('[0:a:0]' + ch.join(',') + '[a' + i + ']'); labels += '[a' + i + ']';
      }
    });
    parts.push(labels + 'concat=n=' + N + ':v=' + (vid ? 1 : 0) + ':a=' + (aud ? 1 : 0) + (vid ? '[vc]' : '') + (aud ? '[ac]' : ''));
    var size = null, vf = '';
    if (vid) {
      var c = cropPx(o.crop || fullCrop(o.srcW, o.srcH), o.srcW, o.srcH);
      size = outSize(c.w, c.h, o.size);
      var ch2 = [];
      if (c.w !== o.srcW || c.h !== o.srcH) ch2.push('crop=' + c.w + ':' + c.h + ':' + c.x + ':' + c.y);
      if (size.w !== c.w || size.h !== c.h) ch2.push('scale=' + size.w + ':' + size.h + ':flags=lanczos');
      ch2.push('setsar=1');
      if (o.fmt === 'gif') ch2.push('fps=' + clamp(Math.round(o.fps || 12), 1, 30), 'split[ga][gb];[ga]palettegen=stats_mode=diff[gp];[gb][gp]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle');
      else ch2.push('format=yuv420p');
      vf = ch2.join(',');
      parts.push('[vc]' + vf + '[vo]');
    }
    if (aud) parts.push('[ac]' + (Math.abs(o.master - 1) > 1e-6 ? 'volume=' + n3(clamp(o.master, 0, VOL_MAX)) : 'anull') + '[ao]');
    var q = clamp(o.quality == null ? 1 : o.quality, 0, 2), args = ['-i', o.input, '-filter_complex', parts.join(';')];
    if (vid) args.push('-map', '[vo]');
    if (aud) args.push('-map', '[ao]');
    if (o.fmt === 'mp4') args.push('-c:v', 'libx264', '-preset', 'veryfast', '-crf', String(F.crf[q]), '-movflags', '+faststart');
    else if (o.fmt === 'webm') args.push('-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', String(F.crf[q]), '-deadline', 'realtime', '-cpu-used', '6', '-row-mt', '1');
    else if (o.fmt === 'gif') args.push('-loop', '0');
    if (aud && o.fmt === 'mp4') args.push('-c:a', 'aac', '-b:a', '128k');
    if (aud && o.fmt === 'webm') args.push('-c:a', 'libopus', '-b:a', '128k');
    if (o.fmt === 'mp3') args.push('-c:a', 'libmp3lame', '-b:a', (MP3_KBPS.indexOf(+o.kbps) >= 0 ? +o.kbps : 192) + 'k');
    var outFile = 'out.' + F.ext;
    args.push('-y', outFile);
    return { args: args, outFile: outFile, mime: F.mime, outDur: total(o.segs), size: size, vf: vf };
  }

  // ---------- допоміжне ----------
  function fmtTime(sec, frac) {
    sec = Math.max(0, sec || 0);
    var h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60;
    var ss = (frac ? s.toFixed(1) : String(Math.floor(s))).padStart(frac ? 4 : 2, '0');
    return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + ss;
  }
  function fmtBytes(b) { return b >= 1048576 ? (b / 1048576).toFixed(b >= 10485760 ? 0 : 1) + ' МБ' : Math.max(1, Math.round(b / 1024)) + ' КБ'; }
  function baseName(name) { return String(name || 'video').replace(/\.[^.]+$/, '').replace(/[\\/:*?"<>|]+/g, '_') || 'video'; }
  function outName(name, fmt, suffix) { return baseName(name) + (suffix == null ? '-edit' : suffix) + '.' + FORMATS[fmt].ext; }

  // Розбір журналу `ffmpeg -i файл` (без виходу): тривалість, розмір кадру, є відео/звук, поворот.
  function parseProbe(log) {
    var r = { duration: 0, w: 0, h: 0, hasVideo: false, hasAudio: false };
    var d = /Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/.exec(log);
    if (d) r.duration = +d[1] * 3600 + +d[2] * 60 + +d[3];
    var v = /Stream #\d+:\d+[^\n]*Video:[^\n]*?(\d{2,5})x(\d{2,5})/.exec(log);
    if (v) { r.hasVideo = true; r.w = +v[1]; r.h = +v[2]; }
    r.hasAudio = /Stream #\d+:\d+[^\n]*Audio:/.test(log);
    var rot = /rotation of (-?\d+(?:\.\d+)?) degrees/.exec(log);
    if (rot && Math.abs(Math.round(+rot[1] / 90)) % 2 === 1) { var t = r.w; r.w = r.h; r.h = t; }
    return r;
  }
  // Час із рядка прогресу ffmpeg (`time=00:00:03.20`) у секундах; null, якщо його немає.
  function parseProgressTime(line) {
    var m = /time=(\d+):(\d+):(\d+(?:\.\d+)?)/.exec(line);
    return m ? +m[1] * 3600 + +m[2] * 60 + +m[3] : null;
  }

  root.VECore = {
    MIN_SEG: MIN_SEG, SPEED_MIN: SPEED_MIN, SPEED_MAX: SPEED_MAX, VOL_MAX: VOL_MAX, RATIOS: RATIOS, SIZE_PRESETS: SIZE_PRESETS, FORMATS: FORMATS, MP3_KBPS: MP3_KBPS,
    clamp: clamp, segDur: segDur, newSeg: newSeg, total: total, starts: starts, locate: locate, splitAt: splitAt, isolate: isolate, removeRange: removeRange, keepRange: keepRange,
    patchRange: patchRange, segRange: segRange, commonValue: commonValue, srcToOut: srcToOut,
    ratioValue: ratioValue, fullCrop: fullCrop, isFull: isFull, fitCrop: fitCrop, clampCrop: clampCrop, moveCrop: moveCrop, resizeCrop: resizeCrop, cropPx: cropPx, outSize: outSize,
    atempoChain: atempoChain, buildExport: buildExport, fmtTime: fmtTime, fmtBytes: fmtBytes, baseName: baseName, outName: outName, parseProbe: parseProbe, parseProgressTime: parseProgressTime
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.VECore;
})(typeof window !== 'undefined' ? window : (typeof self !== 'undefined' ? self : globalThis));
