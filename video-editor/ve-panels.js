// Відео редактор: меню зліва (частина: швидкість і гучність; кадр: пропорції й рамка; звук: загальна гучність; експорт: формат, якість, розмір).
// Налаштування експорту пам'ятаються в localStorage (ключ ve_opt).
(function (root) {
  var SPEEDS = [0.25, 0.5, 0.75, 1, 1.5, 2, 4, 8], GIF_W = [240, 320, 480, 640, 800], QUAL = ['Мала вага', 'Рекомендовано', 'Максимум'];
  var DEFAULTS = { fmt: 'mp4', quality: 1, size: { mode: 'orig', value: 0 }, gifW: 480, fps: 12, kbps: 192, name: '' };

  function init(ctx) {
    var C = ctx.C, $ = ctx.$, S = ctx.S, opt = Object.assign({}, DEFAULTS);
    try { Object.assign(opt, JSON.parse(localStorage.getItem('ve_opt') || '{}')); } catch (e) { /* не критично */ }
    function save() { try { localStorage.setItem('ve_opt', JSON.stringify(opt)); } catch (e) { /* не критично */ } }
    function chips(box, items, onClick) { // items: [{ label, on, title, disabled }]
      box.textContent = '';
      items.forEach(function (it, i) { var b = document.createElement('button'); b.textContent = it.label; b.title = it.title || ''; b.disabled = !!it.disabled; b.classList.toggle('on', !!it.on); b.addEventListener('click', function () { onClick(i); }); box.appendChild(b); });
    }
    var r1 = function (v) { return +v.toFixed(2); };

    // ---------- частина ----------
    ctx.refreshClip = function () {
      var r = S.file ? ctx.target() : null;
      $('selCtls').classList.toggle('off', !r);
      var info = !S.file ? 'Відкрий відео, щоб редагувати його частини.'
        : S.sel ? 'Виділено ' + C.fmtTime(S.sel[0], true) + ' – ' + C.fmtTime(S.sel[1], true) + ' (' + (S.sel[1] - S.sel[0]).toFixed(1) + ' с). Зміни застосуються до нього.'
        : 'Нічого не виділено: зміни стосуються частини під курсором. Щоб змінити довільну ділянку, протягни по таймлайну.';
      $('selInfo').textContent = info;
      var sp = r ? C.commonValue(S.segs, r[0], r[1], 'speed') : null, vl = r ? C.commonValue(S.segs, r[0], r[1], 'vol') : null;
      $('speedV').textContent = sp == null ? 'різна' : '×' + r1(sp);
      if (sp != null && document.activeElement !== $('speedNum')) $('speedNum').value = r1(sp);
      chips($('speedChips'), SPEEDS.map(function (v) { return { label: '×' + v, on: sp != null && Math.abs(sp - v) < 1e-6, title: v < 1 ? 'Уповільнити в ' + r1(1 / v) + ' раз' : v > 1 ? 'Пришвидшити в ' + v + ' раз' : 'Звичайна швидкість' }; }), function (i) { ctx.doPatch({ speed: SPEEDS[i] }, ''); });
      $('volV').textContent = vl == null ? 'різна' : Math.round(vl * 100) + '%';
      if (vl != null) $('volR').value = Math.round(vl * 100);
    };
    $('speedNum').addEventListener('change', function () { var v = parseFloat(this.value); if (v > 0) ctx.doPatch({ speed: v }, ''); });
    $('volR').addEventListener('input', function () { ctx.doPatch({ vol: this.value / 100 }, 'vol'); });
    $('volMute').addEventListener('click', function () { ctx.doPatch({ vol: 0 }, ''); });
    $('vol100').addEventListener('click', function () { ctx.doPatch({ vol: 1 }, ''); });
    $('btnResetSel').addEventListener('click', function () { ctx.doPatch({ speed: 1, vol: 1 }, ''); });

    // ---------- кадр ----------
    var panel = '';
    function inset(c, f) { var w = c.w * f, h = c.h * f; return { x: c.x + (c.w - w) / 2, y: c.y + (c.h - h) / 2, w: w, h: h }; }
    function setRatio(key) {
      if (!S.file || !S.info.hasVideo) return;
      var vw = S.info.w, vh = S.info.h; S.ratio = key;
      if (key === 'orig') S.crop = null;
      else if (key === 'free') S.crop = S.crop || inset(C.fullCrop(vw, vh), 0.9);
      else S.crop = inset(C.fitCrop(vw, vh, C.ratioValue(key, S.ca, S.cb), S.crop), 0.92);
      ctx.commit('ratio'); ctx.refresh();
    }
    function aspect() { return C.ratioValue(S.ratio, S.ca, S.cb); }
    function cropInfo() {
      if (!S.file || !S.info.hasVideo) { $('cropInfo').textContent = S.file ? 'У аудіофайлі немає кадру.' : ''; return; }
      var c = C.cropPx(S.crop || C.fullCrop(S.info.w, S.info.h), S.info.w, S.info.h);
      $('cropInfo').textContent = 'Кадр результату: ' + c.w + '×' + c.h + ' px' + (S.crop ? '' : ' (весь кадр)');
    }
    function fields() {
      var c = S.crop || (S.file ? C.fullCrop(S.info.w, S.info.h) : { x: 0, y: 0, w: 0, h: 0 });
      ['x', 'y', 'w', 'h'].forEach(function (k) { var el = $('c' + k); if (document.activeElement !== el) el.value = Math.round(c[k]); });
    }
    ctx.refreshCrop = function () {
      chips($('ratioChips'), C.RATIOS.map(function (r) { return { label: r[1], on: S.ratio === r[0], disabled: !S.file || !S.info.hasVideo, title: r[2] === 0 ? 'Без кадрування: весь кадр' : r[2] === -1 ? 'Рамка будь-якої форми: тягни вручну' : r[2] === -2 ? 'Своя пропорція: введи числа нижче' : 'Рамка з пропорцією ' + r[1] }; }), function (i) { setRatio(C.RATIOS[i][0]); });
      $('customRatio').hidden = S.ratio !== 'custom'; $('ca').value = S.ca; $('cb').value = S.cb;
      fields(); cropInfo();
      ctx.crop.set(S.crop, aspect(), panel === 'crop' && S.file && S.info.hasVideo);
    };
    ctx.onCrop = function (c, final) { S.crop = c; fields(); cropInfo(); if (final) { ctx.commit('crop'); ctx.refreshExport(); } };
    ['ca', 'cb'].forEach(function (id) { $(id).addEventListener('change', function () { S.ca = Math.max(1, +$('ca').value || 1); S.cb = Math.max(1, +$('cb').value || 1); if (S.ratio === 'custom') setRatio('custom'); else ctx.refreshCrop(); }); });
    ['x', 'y', 'w', 'h'].forEach(function (k) {
      $('c' + k).addEventListener('change', function () {
        if (!S.file || !S.info.hasVideo) return;
        if (S.ratio === 'orig') S.ratio = 'free';
        var c = Object.assign({}, S.crop || C.fullCrop(S.info.w, S.info.h)), v = +this.value || 0, a = aspect();
        c[k] = v; if (a > 0 && k === 'w') c.h = v / a; if (a > 0 && k === 'h') c.w = v * a;
        S.crop = C.clampCrop(c, S.info.w, S.info.h); ctx.commit('cropnum'); ctx.refresh();
      });
    });
    $('btnCropReset').addEventListener('click', function () { setRatio('orig'); });
    if (window.ZB) window.ZB.onPanel = function (p) { panel = p; ctx.refreshCrop(); };

    // ---------- звук ----------
    $('masterR').addEventListener('input', function () { S.master = this.value / 100; $('masterV').textContent = this.value + '%'; ctx.player.setVolume(S.master, S.mute); ctx.commit('master'); });
    $('muteChk').addEventListener('change', function () { S.mute = this.checked; ctx.player.setVolume(S.master, S.mute); ctx.commit('mute'); ctx.refreshExport(); });
    ctx.refreshAudio = function () { $('masterR').value = Math.round(S.master * 100); $('masterV').textContent = Math.round(S.master * 100) + '%'; $('muteChk').checked = S.mute; };

    // ---------- експорт ----------
    ctx.sizeFor = function () { return opt.fmt === 'gif' ? (opt.gifW > 0 ? { mode: 'w', value: opt.gifW } : { mode: 'orig', value: 0 }) : opt.size; };
    ctx.getExportOpts = function () { return { fmt: opt.fmt, quality: opt.quality, size: ctx.sizeFor(), fps: opt.fps, kbps: opt.kbps, name: opt.name }; };
    ctx.exportName = function () { return (opt.name || C.baseName(S.name) + '-edit') + '.' + C.FORMATS[opt.fmt].ext; };
    function cropH() { return S.info.hasVideo && S.file ? C.cropPx(S.crop || C.fullCrop(S.info.w, S.info.h), S.info.w, S.info.h).h : 0; }
    ctx.refreshExport = function () {
      var F = C.FORMATS, fmts = Object.keys(F), f = opt.fmt;
      if (S.file && !S.info.hasVideo && F[f].video) { f = opt.fmt = 'mp3'; }
      var seg = $('fmtSeg'); seg.textContent = '';
      fmts.forEach(function (k) {
        var b = document.createElement('button'); b.textContent = F[k].label; b.disabled = !!(S.file && !S.info.hasVideo && F[k].video); b.classList.toggle('on', k === f);
        b.title = F[k].label + ': ' + F[k].note; b.addEventListener('click', function () { opt.fmt = k; save(); ctx.refreshExport(); }); seg.appendChild(b);
      });
      $('fmtNote').textContent = F[f].note;
      var vid = F[f].video;
      $('qualBox').hidden = !(vid && F[f].crf.length); $('sizeBox').hidden = !vid; $('fpsBox').hidden = f !== 'gif'; $('kbpsBox').hidden = f !== 'mp3';
      chips($('qualChips'), QUAL.map(function (q, i) { return { label: q, on: opt.quality === i, title: ['Найменший файл, помітніше стиснення', 'Добрий баланс якості й ваги', 'Найкраща якість, файл найбільший'][i] }; }), function (i) { opt.quality = i; save(); ctx.refreshExport(); });
      var ch = cropH(), items;
      if (f === 'gif') items = GIF_W.map(function (w) { return { label: w + ' px', on: opt.gifW === w, title: 'Ширина GIF ' + w + ' px', v: w }; }).concat([{ label: 'Оригінал', on: opt.gifW === 0, title: 'Розмір кадру без зміни (GIF буде дуже важким)', v: 0 }]);
      else items = C.SIZE_PRESETS.filter(function (p) { return p[0] === 'orig' || !ch || p[2] <= ch; }).map(function (p) { return { label: p[1], on: opt.size.mode === p[0] && (p[0] === 'orig' || opt.size.value === p[2]), title: p[0] === 'orig' ? 'Розмір кадру без зміни' : 'Висота ' + p[2] + ' px, ширина за пропорцією', p: p }; });
      chips($('sizeChips'), items, function (i) { if (f === 'gif') opt.gifW = items[i].v; else opt.size = { mode: items[i].p[0], value: items[i].p[2] }; save(); ctx.refreshExport(); });
      var cw = f === 'gif' ? opt.gifW : (opt.size.mode === 'w' ? opt.size.value : 0), sw = $('sizeW'); if (document.activeElement !== sw) sw.value = cw && !items.some(function (it) { return it.on; }) ? cw : '';
      if (document.activeElement !== $('fps')) $('fps').value = opt.fps;
      chips($('kbpsChips'), C.MP3_KBPS.map(function (k) { return { label: k + ' кбіт/с', on: opt.kbps === k, title: 'Бітрейт MP3 ' + k + ' кбіт/с' }; }), function (i) { opt.kbps = C.MP3_KBPS[i]; save(); ctx.refreshExport(); });
      $('nameIn').placeholder = S.file ? C.baseName(S.name) + '-edit' : 'video-edit'; if (document.activeElement !== $('nameIn')) $('nameIn').value = opt.name;
      var sum = '';
      if (S.file) {
        var dur = C.total(S.segs); sum = 'Результат: ' + C.fmtTime(dur, true) + ' · ' + F[f].label;
        if (vid && S.info.hasVideo) { var c = C.cropPx(S.crop || C.fullCrop(S.info.w, S.info.h), S.info.w, S.info.h), sz = C.outSize(c.w, c.h, ctx.sizeFor()); sum += ' · ' + sz.w + '×' + sz.h; }
        if (f === 'gif' && dur > 20) sum += '. Довгий GIF вийде дуже важким: краще до 15 с.';
      }
      $('sumLbl').textContent = sum;
      $('btnExport').textContent = 'Експортувати ' + F[f].label;
    };
    $('sizeW').addEventListener('change', function () { var v = Math.round(+this.value); if (!(v >= 16)) return; if (opt.fmt === 'gif') opt.gifW = v; else opt.size = { mode: 'w', value: v }; save(); ctx.refreshExport(); });
    $('fps').addEventListener('change', function () { opt.fps = C.clamp(Math.round(+this.value) || 12, 1, 30); save(); ctx.refreshExport(); });
    $('nameIn').addEventListener('input', function () { opt.name = this.value.replace(/[\\/:*?"<>|]+/g, '_'); save(); });
    ctx.onOpened = function () { opt.name = ''; if (!S.info.hasVideo) opt.fmt = 'mp3'; };
  }
  root.VEPanels = { init: init };
})(window);
