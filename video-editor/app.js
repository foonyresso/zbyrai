// Відео редактор: головний файл. Стан, історія (скасування), відкриття файлу, таймлайн і плеєр, кнопки правок.
// Меню (частина, кадр, звук, експорт) у ve-panels.js, вікно експорту в ve-export.js; обидва отримують контекст ctx.
(function () {
  var C = VECore, $ = function (id) { return document.getElementById(id); };
  var video = $('vid'), toastT = 0;

  // Стан. segs: частини (див. ve-core), crop: рамка в px оригіналу чи null (весь кадр), ratio: ключ пропорції.
  var S = { file: null, name: '', url: null, previewUrl: null, proxyUrl: null, info: { duration: 0, w: 0, h: 0, hasVideo: true, hasAudio: true, probed: false },
    segs: [], master: 1, mute: false, crop: null, ratio: 'orig', ca: 5, cb: 4, sel: null };
  var thumbs = null, hist = [], hi = -1, lastKey = '', lastAt = 0;

  function toast(msg) { var t = $('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('show'); }, 2600); }

  // ---------- історія ----------
  function snap() { return JSON.stringify({ segs: S.segs, master: S.master, mute: S.mute, crop: S.crop, ratio: S.ratio, ca: S.ca, cb: S.cb }); }
  function commit(key) {
    var s = snap(), now = Date.now();
    if (hist[hi] === s) return;
    if (key && key === lastKey && now - lastAt < 900 && hi > 0) hist[hi] = s;
    else { hist = hist.slice(0, hi + 1); hist.push(s); if (hist.length > 120) hist.shift(); hi = hist.length - 1; }
    lastKey = key || ''; lastAt = now;
  }
  function restore(i) {
    hi = i; var o = JSON.parse(hist[hi]);
    S.segs = o.segs; S.master = o.master; S.mute = o.mute; S.crop = o.crop; S.ratio = o.ratio; S.ca = o.ca; S.cb = o.cb; S.sel = null; lastKey = '';
    player.setVolume(S.master, S.mute);
    player.setSegs(S.segs, Math.min(player.time, C.total(S.segs)));
    refresh();
  }
  function undo() { if (hi > 0) restore(hi - 1); }
  function redo() { if (hi < hist.length - 1) restore(hi + 1); }

  // ---------- плеєр і таймлайн ----------
  var player = VEPlayer.create(video, { time: function (t, playing) {
    tl.set({ t: t }); updateTime(t); $('btnPlay').textContent = playing ? '❚❚' : '▶';
  } });
  var tl = VETimeline.create($('tlc'), {
    onSeek: function (t) { player.seek(t); },
    onSelect: function (sel) { S.sel = sel; ctx.refreshClip(); updateButtons(); },
    onZoom: function () { $('zoomR').value = Math.round(tl.getZoom() * 100); }
  });
  function updateTime(t) { $('timeLbl').textContent = C.fmtTime(t, true) + ' / ' + C.fmtTime(C.total(S.segs), true); }

  // Ціль правки: виділений діапазон або частина під курсором.
  function target() {
    if (!S.segs.length) return null;
    if (S.sel) return S.sel;
    var L = C.locate(S.segs, player.time); return L ? C.segRange(S.segs, L.i) : null;
  }
  // Застосувати нові частини: курсор t (за замовчуванням лишається), нове виділення, ключ для злиття в історії.
  function setSegs(segs, o) {
    o = o || {};
    S.segs = segs; S.sel = o.sel || null;
    var t = o.t != null ? o.t : player.time;
    player.setSegs(segs, Math.min(t, C.total(segs)));
    commit(o.key); refresh();
  }

  // ---------- правки ----------
  function doSplit() { if (S.file) setSegs(C.splitAt(S.segs, player.time), { key: '' }); }
  function doDelete() { var r = target(); if (!r) return; setSegs(C.removeRange(S.segs, r[0], r[1]), { t: r[0] }); }
  function doTrimL() { if (player.time > C.MIN_SEG) setSegs(C.removeRange(S.segs, 0, player.time), { t: 0 }); }
  function doTrimR() { if (player.time < C.total(S.segs) - C.MIN_SEG) setSegs(C.removeRange(S.segs, player.time, C.total(S.segs)), { t: player.time }); }
  function doKeep() { if (!S.sel) return toast('Спершу виділи діапазон на таймлайні'); setSegs(C.keepRange(S.segs, S.sel[0], S.sel[1]), { t: 0 }); }
  // Змінити швидкість/гучність цілі; виділення лишається на тих самих шматках.
  function doPatch(patch, key) {
    var r = target(); if (!r) return;
    var iso = C.isolate(S.segs, r[0], r[1]); if (!iso.idx.length) return;
    var segs = iso.segs.map(function (g, i) { return iso.idx.indexOf(i) < 0 ? g : Object.assign({}, g, { speed: patch.speed != null ? C.clamp(patch.speed, C.SPEED_MIN, C.SPEED_MAX) : g.speed, vol: patch.vol != null ? C.clamp(patch.vol, 0, C.VOL_MAX) : g.vol }); });
    var st = C.starts(segs), last = iso.idx[iso.idx.length - 1];
    setSegs(segs, { sel: [st[iso.idx[0]], st[last] + C.segDur(segs[last])], key: key || '', t: st[iso.idx[0]] <= player.time ? player.time : st[iso.idx[0]] });
  }

  // ---------- вигляд ----------
  function updateButtons() {
    var has = !!S.file, any = has && S.segs.length > 0;
    $('btnPlay').disabled = !any; $('btnStart').disabled = !any; $('btnSplit').disabled = !any; $('btnDel').disabled = !any;
    $('btnTrimL').disabled = !any; $('btnTrimR').disabled = !any; $('btnKeep').disabled = !S.sel;
    $('btnUndo').disabled = hi <= 0; $('btnRedo').disabled = hi >= hist.length - 1;
    $('btnClear').disabled = !has;
  }
  function refresh() {
    tl.set({ segs: S.segs, t: player.time, sel: S.sel, thumbs: thumbs });
    updateTime(player.time); updateButtons();
    ctx.refreshClip(); ctx.refreshCrop(); ctx.refreshAudio(); ctx.refreshExport();
  }
  function layoutView() {
    var box = $('viewbox'), wrap = $('viewwrap');
    if (box.hidden) return;
    var aw = wrap.clientWidth, ah = wrap.clientHeight, ar = S.info.hasVideo && S.info.w ? S.info.w / S.info.h : 16 / 9;
    var w = Math.min(aw, ah * ar), h = w / ar;
    box.style.width = Math.floor(w) + 'px'; box.style.height = Math.floor(h) + 'px';
    ctx.crop.render();
  }
  if (window.ResizeObserver) new ResizeObserver(layoutView).observe($('viewwrap'));
  window.addEventListener('resize', layoutView);

  // ---------- відкриття файлу ----------
  function waitMeta(v, ms) {
    return new Promise(function (res) {
      var done = false, to;
      function fin(ok) { if (done) return; done = true; clearTimeout(to); v.removeEventListener('loadedmetadata', onOk); v.removeEventListener('error', onErr); res(ok); }
      function onOk() { fin(true); } function onErr() { fin(false); }
      v.addEventListener('loadedmetadata', onOk); v.addEventListener('error', onErr); to = setTimeout(function () { fin(false); }, ms);
    });
  }
  function busy(txt, frac) {
    var b = $('busy'); b.hidden = txt == null; if (txt == null) return;
    $('busyTxt').textContent = txt; var m = b.querySelector('.meter'); m.classList.toggle('ind', frac == null); $('busyBar').style.width = frac == null ? '' : Math.round(frac * 100) + '%';
  }
  function release() {
    player.pause();
    if (thumbs) { thumbs.cancel(); thumbs = null; }
    [S.url, S.proxyUrl].forEach(function (u) { if (u) URL.revokeObjectURL(u); });
    S.url = S.proxyUrl = null; video.removeAttribute('src'); video.load();
  }
  function closeFile() {
    release();
    S.file = null; S.segs = []; S.sel = null; S.crop = null; S.ratio = 'orig'; S.master = 1; S.mute = false; hist = []; hi = -1;
    $('viewbox').hidden = true; $('tl').hidden = true; $('empty').hidden = false; $('fileInfo').textContent = 'Файл не відкрито';
    player.setSegs([], 0); player.setVolume(1, false); ctx.crop.set(null, 0, false); refresh();
  }
  var opening = false;
  async function openFile(file) {
    if (!file || opening) return;
    opening = true; closeFile();
    var isVideoName = /\.(mp4|mov|mkv|avi|webm|m4v|flv|wmv|ts|3gp|ogv|mpg|mpeg)$/i.test(file.name) || /^video\//.test(file.type);
    try {
      busy('Читаю файл…', null);
      S.file = file; S.name = file.name; S.url = URL.createObjectURL(file); video.src = S.url;
      var ok = await waitMeta(video, 8000), info;
      if (ok && isFinite(video.duration) && video.duration > 0 && !(isVideoName && video.videoWidth === 0)) {
        info = { duration: video.duration, w: video.videoWidth, h: video.videoHeight, hasVideo: video.videoWidth > 0, hasAudio: true, probed: false };
        S.previewUrl = S.url;
      } else {
        if (location.protocol === 'file:') throw new Error('Браузер не відтворює цей формат напряму, а рушій ffmpeg працює лише зі сторінки сайту (http/https), не з файлу на диску.');
        busy('Формат не відтворюється браузером напряму. Завантажую рушій…', null);
        await VEEngine.ensure(function (f, txt) { busy(txt, f); });
        info = await VEEngine.probe(file);
        if (!info.duration || (!info.hasVideo && !info.hasAudio)) throw new Error('Не вдалося прочитати цей файл як відео чи аудіо.');
        info.probed = true;
        busy('Готую легку копію для перегляду (оригінал при експорті не змінюється)…', 0);
        S.proxyUrl = await VEEngine.makeProxy(file, info, function (f) { busy('Готую легку копію для перегляду…', f); });
        video.src = S.proxyUrl; S.previewUrl = S.proxyUrl;
        if (!(await waitMeta(video, 15000))) throw new Error('Не вдалося підготувати перегляд цього файлу.');
      }
      S.info = info; S.segs = [C.newSeg(0, info.duration)]; S.sel = null; S.crop = null; S.ratio = 'orig'; S.master = 1; S.mute = false;
      hist = []; hi = -1; commit('');
      $('viewbox').hidden = false; $('tl').hidden = false; $('empty').hidden = true; $('viewbox').classList.toggle('audio', !info.hasVideo);
      ctx.crop.setFrame(info.w || 1, info.h || 1); layoutView(); tl.resize();
      player.setVolume(1, false); player.setSegs(S.segs, 0);
      thumbs = info.hasVideo ? VEThumbs.make(S.previewUrl, info.duration, function () { tl.set({ thumbs: thumbs }); }) : null;
      $('fileInfo').textContent = file.name + ' · ' + C.fmtTime(info.duration) + (info.hasVideo ? ' · ' + info.w + '×' + info.h : ' · аудіо') + ' · ' + C.fmtBytes(file.size);
      ctx.onOpened(); tl.fit(); refresh();
    } catch (e) {
      release(); S.file = null; $('fileInfo').textContent = 'Файл не відкрито';
      toast(e.message || 'Не вдалося відкрити файл');
    } finally { busy(null); opening = false; $('fileIn').value = ''; refresh(); }
  }

  // ---------- кнопки й клавіші ----------
  $('btnOpen').addEventListener('click', function () { $('fileIn').click(); });
  $('btnOpen2').addEventListener('click', function () { $('fileIn').click(); });
  $('fileIn').addEventListener('change', function () { openFile(this.files[0]); });
  $('btnClear').addEventListener('click', closeFile);
  $('btnPlay').addEventListener('click', function () { player.toggle(); });
  $('btnStart').addEventListener('click', function () { player.seek(0); });
  $('btnSplit').addEventListener('click', doSplit); $('btnDel').addEventListener('click', doDelete);
  $('btnTrimL').addEventListener('click', doTrimL); $('btnTrimR').addEventListener('click', doTrimR); $('btnKeep').addEventListener('click', doKeep);
  $('btnUndo').addEventListener('click', undo); $('btnRedo').addEventListener('click', redo);
  $('btnFit').addEventListener('click', function () { tl.fit(); });
  $('zoomR').addEventListener('input', function () { tl.setZoom(this.value / 100); });
  video.addEventListener('error', function () { if (S.file && !opening) toast('Помилка відтворення цього файлу'); });
  video.addEventListener('click', function () { if (S.file) player.toggle(); });

  document.addEventListener('keydown', function (e) {
    var tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' && e.target.type !== 'range' || tag === 'textarea' || tag === 'select' || !S.file || $('job').hidden === false) return;
    var k = window.zbKey(e), mod = e.ctrlKey || e.metaKey;
    if (mod && k === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
    else if (mod && k === 'y') { e.preventDefault(); redo(); }
    else if (mod || e.altKey) return;
    else if (e.code === 'Space') { e.preventDefault(); player.toggle(); }
    else if (k === 's') doSplit();
    else if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); doDelete(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); player.seek(player.time - (e.shiftKey ? 1 : 0.04)); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); player.seek(player.time + (e.shiftKey ? 1 : 0.04)); }
    else if (e.key === 'Home') { e.preventDefault(); player.seek(0); }
    else if (e.key === 'End') { e.preventDefault(); player.seek(C.total(S.segs)); }
  });
  var stage = $('work');
  ['dragenter', 'dragover'].forEach(function (n) { stage.addEventListener(n, function (e) { if (e.dataTransfer && Array.prototype.indexOf.call(e.dataTransfer.types, 'Files') >= 0) { e.preventDefault(); stage.classList.add('over'); } }); });
  stage.addEventListener('dragleave', function (e) { if (e.target === stage) stage.classList.remove('over'); });
  stage.addEventListener('drop', function (e) { e.preventDefault(); stage.classList.remove('over'); if (e.dataTransfer.files.length) openFile(e.dataTransfer.files[0]); });
  window.addEventListener('beforeunload', function (e) { if (S.file && hi > 0) { e.preventDefault(); e.returnValue = ''; } });

  // ---------- контекст для меню й експорту ----------
  var ctx = { S: S, C: C, $: $, video: video, player: player, tl: tl, toast: toast, commit: commit, refresh: refresh, setSegs: setSegs, doPatch: doPatch, target: target, layoutView: layoutView, busy: busy,
    refreshClip: function () {}, refreshCrop: function () {}, refreshAudio: function () {}, refreshExport: function () {}, onOpened: function () {}, crop: null };
  ctx.crop = VECrop.create($('cropLayer'), { onChange: function (c, final) { ctx.onCrop(c, final); } });
  ctx.onCrop = function () {};
  VEPanels.init(ctx);
  VEExport.init(ctx);
  window.VEApp = ctx; // для налагодження й тестів
  refresh();
})();
