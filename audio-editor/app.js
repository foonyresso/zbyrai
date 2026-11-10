// Аудіо редактор і конвертер: інтерфейс (відкриття файлу, монтаж, відтворення, експорт). Логіка: audio-core, dsp-core, render-core, encode-core.
(function () {
  var C = window.AudioCore, E = window.EncodeCore, P = window.PeaksCore, $ = function (id) { return document.getElementById(id); };
  var LS = 'ae_';
  var pool = window.RenderPool.create();
  var st = { name: '', src: null, peaksC: null, peaksF: null, segs: [], undo: [], redo: [], sel: null, head: 0, rev: 0, busy: false,
    master: { gainDb: 0, fadeIn: 0, fadeOut: 0, norm: false, normDb: -1 }, exp: Object.assign({}, E.DEFAULTS), play: null, prev: null };

  function save() { try { localStorage.setItem(LS + 'cfg', JSON.stringify({ master: st.master, exp: st.exp })); } catch (e) { /* не критично */ } }
  try {
    var cfg = JSON.parse(localStorage.getItem(LS + 'cfg') || 'null');
    if (cfg) { Object.assign(st.master, cfg.master || {}); Object.assign(st.exp, cfg.exp || {}); }
  } catch (e) { /* не критично */ }

  var toastT;
  function toast(t) { var el = $('toast'); el.textContent = t; el.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function () { el.classList.remove('on'); }, 2600); }
  function prog(txt, p) {
    var el = $('prog'); if (txt === null) { el.hidden = true; return; }
    el.hidden = false; $('progTxt').textContent = txt;
    el.querySelector('.pbar').classList.toggle('ind', p === null || p === undefined);
    if (p !== null && p !== undefined) $('progBar').style.width = Math.round(p * 100) + '%';
  }

  // ---- таймлайн ----
  var tl = window.Timeline.create($('cv'), {
    onSeek: function (t) { st.head = t; stopPlay(); refresh(true); },
    onSelect: function (a, b) { st.sel = a === null || a === undefined || b - a < 0.005 ? null : { a: a, b: b }; refresh(true); },
    onView: updateScroll
  });
  function updateScroll() {
    var v = tl.view(), r = $('tlScroll'); r.disabled = v.total <= v.span;
    r.value = v.total > v.span ? Math.round(v.scroll / (v.total - v.span) * 1000) : 0;
  }
  $('tlScroll').addEventListener('input', function () { var v = tl.view(); tl.setScroll(this.value / 1000 * Math.max(0, v.total - v.span)); });

  // ---- ціль операцій: виділення або фрагмент під курсором ----
  function target() {
    if (!st.segs.length) return null;
    if (st.sel) return { kind: 'sel', t0: st.sel.a, t1: st.sel.b };
    var L = C.locate(st.segs, st.head), starts = C.starts(st.segs);
    return { kind: 'seg', i: L.i, t0: starts[L.i], t1: starts[L.i] + C.segDur(st.segs[L.i]) };
  }
  function segsIn(t) {
    var starts = C.starts(st.segs), r = [];
    for (var i = 0; i < st.segs.length; i++) if (starts[i] < t.t1 - 1e-6 && starts[i] + C.segDur(st.segs[i]) > t.t0 + 1e-6) r.push(st.segs[i]);
    return r;
  }

  function mutate(fn) {
    st.undo.push({ segs: C.clone(st.segs), sel: st.sel, head: st.head }); if (st.undo.length > 100) st.undo.shift();
    st.redo.length = 0; stopPlay(); fn(st.segs); st.rev++;
    var tot = C.total(st.segs); st.head = Math.min(st.head, tot); if (st.sel && st.sel.b > tot) st.sel = st.sel.a < tot - 0.005 ? { a: st.sel.a, b: tot } : null;
    refresh(); syncControls();
  }
  function undo() { if (!st.undo.length) return; st.redo.push({ segs: C.clone(st.segs), sel: st.sel, head: st.head }); var s = st.undo.pop(); st.segs = s.segs; st.sel = s.sel; st.head = s.head; st.rev++; stopPlay(); refresh(); syncControls(); }
  function redo() { if (!st.redo.length) return; st.undo.push({ segs: C.clone(st.segs), sel: st.sel, head: st.head }); var s = st.redo.pop(); st.segs = s.segs; st.sel = s.sel; st.head = s.head; st.rev++; stopPlay(); refresh(); syncControls(); }

  // ---- обгортки над монтажем ----
  function doSplit() { if (!st.src) return; var n = st.segs.length; mutate(function (s) { C.cut(s, st.head); }); if (st.segs.length === n) { st.undo.pop(); toast('Курсор біля краю фрагмента: розрізати нічого'); } }
  function doDelete() {
    var t = target(); if (!t) return;
    if (t.kind === 'seg' && st.segs.length === 1) { toast('Це єдиний фрагмент: виділи ділянку, яку треба видалити'); return; }
    mutate(function (s) { C.removeRange(s, t.t0, t.t1); }); st.sel = null; refresh();
  }
  function doTrim(left) {
    if (!st.src) return; var tot = C.total(st.segs);
    if (left ? st.head < C.MIN_GAP : st.head > tot - C.MIN_GAP) { toast('Постав курсор усередині запису'); return; }
    mutate(function (s) { if (left) C.removeRange(s, 0, st.head); else C.removeRange(s, st.head, tot); });
    if (left) st.head = 0; st.sel = null; refresh();
  }
  function doCrop() { if (!st.sel) { toast('Спершу виділи ділянку'); return; } var a = st.sel.a, b = st.sel.b; mutate(function (s) { C.cropTo(s, a, b); }); st.sel = null; st.head = 0; refresh(); }
  function readProps() { return { speed: +Math.pow(2, $('spd').value / 100).toFixed(3), pitch: +$('pit').value, gain: +$('gdb').value, tape: $('tape').checked }; }
  function doApply(reset) {
    var t = target(); if (!t) return;
    var props = reset ? { speed: 1, pitch: 0, gain: 0, tape: false } : readProps();
    var t0 = t.t0;
    mutate(function (s) {
      var r = C.isolate(s, t.t0, t.t1); C.setProps(s, r[0], r[1], props);
      if (t.kind === 'sel') { var starts = C.starts(s); st.sel = { a: starts[r[0]], b: starts[r[1] - 1] + C.segDur(s[r[1] - 1]) }; }
    });
    if (reset) syncControls();
  }

  // ---- керування: синхронізація й підписи ----
  function pair(id, fmt, onChange) {
    var el = $(id), v = $(id + 'V');
    el.addEventListener('input', function () { if (v) v.textContent = fmt(+el.value); if (onChange) onChange(); });
  }
  var spdTxt = function (v) { return '×' + +Math.pow(2, v / 100).toFixed(2); };
  var sgn = function (v, u) { return (v > 0 ? '+' : '') + v + u; };
  pair('spd', spdTxt); pair('pit', function (v) { return sgn(v, ' пт'); }); pair('gdb', function (v) { return sgn(v, ' дБ'); });
  pair('mg', function (v) { return sgn(v, ' дБ'); }, readMaster); pair('fi', function (v) { return v + ' с'; }, readMaster); pair('fo', function (v) { return v + ' с'; }, readMaster);
  pair('nd', function (v) { return v + ' дБ'; }, readMaster); $('norm').addEventListener('change', readMaster);
  function readMaster() {
    st.master = { gainDb: +$('mg').value, fadeIn: +$('fi').value, fadeOut: +$('fo').value, norm: $('norm').checked, normDb: +$('nd').value };
    $('nd').disabled = !st.master.norm; st.rev++; stopPlay(); save();
  }
  function setRange(id, v) { var el = $(id); el.value = v; el.dispatchEvent(new Event('input')); }
  // Показує у повзунках значення ділянки (якщо в цілі однакові) або типові
  function syncControls() {
    var t = target(); if (!t) return;
    var list = segsIn(t), f = list[0] || C.newSeg(0, 1), same = list.every(function (s) { return s.speed === f.speed && s.pitch === f.pitch && s.gain === f.gain && s.tape === f.tape; });
    if (same) { setRange('spd', Math.round(Math.log2(f.speed) * 100)); setRange('pit', f.pitch); setRange('gdb', f.gain); $('tape').checked = f.tape; }
  }
  $('selA').addEventListener('change', selFromInputs); $('selB').addEventListener('change', selFromInputs);
  function selFromInputs() {
    var a = C.parseTime($('selA').value), b = C.parseTime($('selB').value), tot = C.total(st.segs);
    if (!st.src || isNaN(a) || isNaN(b)) { refresh(); return; }
    a = Math.max(0, Math.min(tot, a)); b = Math.max(0, Math.min(tot, b));
    st.sel = Math.abs(b - a) > 0.005 ? { a: Math.min(a, b), b: Math.max(a, b) } : null; refresh(true);
  }
  var lastTgtKey = '';
  function refresh(light) {
    var tot = C.total(st.segs), has = !!st.src;
    tl.set({ segs: st.segs, peaksC: st.peaksC, peaksF: st.peaksF, sr: st.src ? st.src.sr : 44100, sel: st.sel, head: st.head, tgt: has ? target() : null });
    updateScroll();
    $('clock').textContent = C.fmtTime(st.head) + ' / ' + C.fmtTime(tot);
    $('empty').hidden = has;
    var t = target(), key = '';
    if (t) {
      $('tgtInfo').textContent = t.kind === 'sel' ? 'Виділено ' + C.fmtTime(t.t0) + ' – ' + C.fmtTime(t.t1) + ' (' + (t.t1 - t.t0).toFixed(2) + ' с)' : 'Виділення немає: дії стосуються фрагмента №' + (t.i + 1) + ' під курсором (' + C.fmtTime(t.t0) + ' – ' + C.fmtTime(t.t1) + ')';
      key = t.kind + (t.i === undefined ? '' : t.i);
    } else $('tgtInfo').textContent = 'Відкрий файл і виділи ділянку на таймлайні.';
    if (st.sel) { if (document.activeElement !== $('selA')) $('selA').value = C.fmtTime(st.sel.a); if (document.activeElement !== $('selB')) $('selB').value = C.fmtTime(st.sel.b); }
    else if (document.activeElement !== $('selA') && document.activeElement !== $('selB')) { $('selA').value = ''; $('selB').value = ''; }
    if (light && key !== lastTgtKey) { lastTgtKey = key; syncControls(); } else if (!light) lastTgtKey = key;
    ['btnPlay', 'btnStop', 'btnPlaySel', 'btnExport', 'btnExport2'].forEach(function (id) { $(id).disabled = !has || tot <= 0.01; });
    $('btnPlaySel').disabled = !has || !st.sel;
    $('btnUndo').disabled = !st.undo.length; $('btnRedo').disabled = !st.redo.length;
    $('btnPlay').textContent = st.play ? '❚❚' : '▶'; $('btnPlay').title = st.play ? 'Поставити на паузу (пробіл)' : 'Відтворити з курсора (пробіл)';
    updateEstimate();
  }

  // ---- експорт: меню ----
  function srcRate() { return st.src ? st.src.sr : 44100; }
  function buildExpUi() {
    var seg = $('fmtSeg'); seg.innerHTML = '';
    E.ORDER.forEach(function (k) {
      var b = document.createElement('button'); b.textContent = E.FORMATS[k].name; b.title = E.FORMATS[k].note; b.dataset.k = k;
      b.addEventListener('click', function () { st.exp.fmt = k; save(); fillExp(); }); seg.appendChild(b);
    });
    var chs = $('chs'); chs.innerHTML = '';
    [[0, 'Як у джерелі'], [1, 'Моно'], [2, 'Стерео']].forEach(function (o) { chs.add(new Option(o[1], o[0])); });
    ['kbps', 'bits', 'rate', 'chs'].forEach(function (id) { $(id).addEventListener('change', function () { readExp(); }); });
    fillExp();
  }
  function fillExp() {
    var f = st.exp.fmt = E.FORMATS[st.exp.fmt] ? st.exp.fmt : 'mp3', F = E.FORMATS[f];
    Array.prototype.forEach.call($('fmtSeg').children, function (b) { b.classList.toggle('on', b.dataset.k === f); });
    $('fmtNote').textContent = F.note;
    $('kbpsBox').hidden = !F.lossy; $('bitsBox').hidden = F.lossy;
    var o = E.sanitize(st.exp, srcRate()), kb = $('kbps'), bt = $('bits'), rt = $('rate');
    kb.innerHTML = ''; (F.kbps || []).forEach(function (k) { kb.add(new Option(k + (k > E.maxKbps(f, o.rate) ? ' (не для цієї частоти)' : ''), k)); kb.options[kb.options.length - 1].disabled = k > E.maxKbps(f, o.rate); });
    bt.innerHTML = ''; (F.bits || []).forEach(function (b) { bt.add(new Option(b === 32 ? '32 (float)' : b, b)); });
    rt.innerHTML = ''; rt.add(new Option('Як у джерелі (' + srcRate() + ' Гц' + (E.resolveRate(f, srcRate(), 0) !== srcRate() ? ', буде ' + E.resolveRate(f, srcRate(), 0) : '') + ')', 0));
    F.rates.forEach(function (r) { rt.add(new Option(r + ' Гц', r)); });
    kb.value = o.kbps || ''; bt.value = o.bits || ''; rt.value = st.exp.rate && F.rates.indexOf(st.exp.rate) >= 0 ? st.exp.rate : 0; $('chs').value = o.ch;
    updateEstimate();
  }
  function readExp() {
    st.exp.kbps = +$('kbps').value || st.exp.kbps; st.exp.bits = +$('bits').value || st.exp.bits; st.exp.rate = +$('rate').value; st.exp.ch = +$('chs').value; save(); fillExp();
  }
  function updateEstimate() {
    if (!st.src) { $('estimate').textContent = ''; return; }
    var o = E.sanitize(st.exp, srcRate()), nch = o.ch || st.src.nch, tot = C.total(st.segs);
    $('estimate').textContent = 'Орієнтовно: ' + E.fmtBytes(E.estimateBytes(o, tot, nch, o.rate)) + ', ' + C.fmtTime(tot, 1) + ', ' + o.rate + ' Гц, ' + (nch === 1 ? 'моно' : 'стерео');
  }

  // ---- відтворення ----
  var actx = null;
  function audioCtx() { if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === 'suspended') actx.resume(); return actx; }
  function masterOpts(extra) { return Object.assign({ gainDb: st.master.gainDb, fadeIn: st.master.fadeIn, fadeOut: st.master.fadeOut, normalize: { on: st.master.norm, peakDb: st.master.normDb } }, extra || {}); }
  async function ensurePreview() {
    var key = st.rev + '|' + JSON.stringify(st.master);
    if (st.prev && st.prev.key === key) return st.prev.buf;
    prog('Готую відтворення…', 0);
    var snapRev = st.rev, res;
    try { res = await pool.render(C.clone(st.segs), masterOpts(), function (p) { prog('Готую відтворення…', p); }); } finally { prog(null); }
    var a = audioCtx(), buf = a.createBuffer(res.channels.length, res.channels[0].length, res.sr);
    res.channels.forEach(function (c, i) { buf.copyToChannel(c, i); });
    st.prev = { key: snapRev + '|' + JSON.stringify(st.master), buf: buf };
    return buf;
  }
  async function startPlay(from, to) {
    if (!st.src || st.busy) return; st.busy = true;
    try {
      var buf = await ensurePreview(), a = audioCtx(), node = a.createBufferSource(); node.buffer = buf; node.connect(a.destination);
      var dur = to === undefined ? undefined : Math.max(0.01, to - from);
      if (from >= buf.duration - 0.01) from = 0;
      node.start(0, from, dur);
      var p = { node: node, t0: a.currentTime, from: from, to: to === undefined ? buf.duration : to, sel: to !== undefined };
      st.play = p; node.onended = function () { if (st.play === p) { st.head = p.sel ? p.from : Math.min(p.to, buf.duration); st.play = null; refresh(true); } };
      tick(); refresh(true);
    } catch (e) { toast('Не вдалося відтворити: ' + e.message); } finally { st.busy = false; }
  }
  function stopPlay() {
    var p = st.play; if (!p) return; st.play = null;
    try { p.node.onended = null; p.node.stop(); } catch (e) { /* уже зупинено */ }
    if (!p.sel) st.head = Math.min(p.from + (actx.currentTime - p.t0), p.to); refresh(true);
  }
  function tick() {
    var p = st.play; if (!p) return;
    var t = Math.min(p.from + (actx.currentTime - p.t0), p.to); st.head = t; tl.follow(t); refresh(true);
    requestAnimationFrame(tick);
  }

  // ---- відкриття файлу ----
  function bytesToAB(u8) { return u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength); }
  async function decode(file) {
    var ab = await file.arrayBuffer(), head = new Uint8Array(ab, 0, Math.min(ab.byteLength, 65536)), rate = window.SniffCore.sampleRate(head), dc;
    try { dc = rate >= 8000 && rate <= 96000 ? new (window.AudioContext || window.webkitAudioContext)({ sampleRate: rate }) : new (window.AudioContext || window.webkitAudioContext)(); }
    catch (e) { dc = new (window.AudioContext || window.webkitAudioContext)(); }
    var buf = null;
    try { buf = await dc.decodeAudioData(ab.slice(0)); }
    catch (e) {
      prog('Браузер не прочитав файл, пробую ffmpeg…', null);
      var wav = await window.AudioFF.decodeToWav(new Uint8Array(ab), file.name, function (t, p) { prog(t, p); });
      buf = await dc.decodeAudioData(bytesToAB(wav));
    }
    try { dc.close(); } catch (e) { /* не критично */ }
    return buf;
  }
  async function openFile(file) {
    if (!file) return; stopPlay(); prog('Читаю файл…', null);
    try {
      var buf = await decode(file), nch = Math.min(2, buf.numberOfChannels), chs = [];
      for (var i = 0; i < nch; i++) chs.push(Float32Array.from(buf.getChannelData(i)));
      if (!chs[0].length) throw new Error('файл порожній');
      st.src = { sr: buf.sampleRate, nch: nch, dur: chs[0].length / buf.sampleRate };
      st.name = file.name; st.peaksC = P.build(chs); st.peaksF = P.build(chs, 32);
      pool.setSource({ sr: st.src.sr, channels: chs });
      st.segs = C.newProject(st.src.dur); st.undo = []; st.redo = []; st.sel = null; st.head = 0; st.rev++; st.prev = null;
      var inf = $('info'); inf.hidden = false;
      inf.innerHTML = '<b></b> · ' + st.src.sr + ' Гц · ' + (nch === 1 ? 'моно' : 'стерео') + ' · ' + C.fmtTime(st.src.dur, 1); inf.querySelector('b').textContent = file.name;
      fillExp(); refresh(); syncControls(); tl.resize(); tl.fit();
      if (buf.numberOfChannels > 2) toast('У файлі понад 2 канали: взято перші два');
    } catch (e) { toast('Не вдалося відкрити файл: ' + (e && e.message || e)); }
    prog(null);
  }
  $('btnOpen').addEventListener('click', function () { $('fileIn').click(); });
  $('fileIn').addEventListener('change', function () { var f = this.files[0]; this.value = ''; openFile(f); });
  var stage = $('work');
  ['dragenter', 'dragover'].forEach(function (n) { stage.addEventListener(n, function (e) { e.preventDefault(); stage.classList.add('over'); }); });
  ['dragleave', 'drop'].forEach(function (n) { stage.addEventListener(n, function (e) { e.preventDefault(); stage.classList.remove('over'); }); });
  stage.addEventListener('drop', function (e) { var f = e.dataTransfer && e.dataTransfer.files[0]; if (f) openFile(f); });

  // ---- експорт ----
  function download(bytes, mime, name) {
    var url = URL.createObjectURL(new Blob([bytes], { type: mime })), a = document.createElement('a');
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 20000);
  }
  async function doExport() {
    if (!st.src || st.busy || C.total(st.segs) <= 0.01) return; st.busy = true; stopPlay();
    try {
      var o = E.sanitize(st.exp, srcRate()), F = E.FORMATS[o.fmt];
      prog('Збираю звук…', 0);
      var res = await pool.render(C.clone(st.segs), masterOpts({ channels: o.ch, rate: o.rate }), function (p) { prog('Збираю звук…', p * (o.fmt === 'wav' ? 0.9 : 0.4)); });
      var bytes;
      if (o.fmt === 'wav') bytes = window.WavCore.encodeWav(res.channels, res.sr, o.bits);
      else {
        var wav = window.WavCore.encodeWav(res.channels, res.sr, 32);
        bytes = await window.AudioFF.encode(wav, o, function (t, p) { prog(t, p === null ? null : p * 0.1 + 0.4); }, function (p) { prog('Кодую ' + F.name + '…', 0.5 + p * 0.5); });
      }
      var name = E.fileName(st.name, o.fmt);
      download(bytes, F.mime, name);
      toast('Збережено ' + name + ' (' + E.fmtBytes(bytes.length) + ')' + (res.peak > 1.0001 ? '. Пік вищий за 0 дБ: звук обрізано, зменш гучність чи увімкни нормалізацію' : ''));
    } catch (e) { toast('Експорт не вдався: ' + (e && e.message || e)); }
    prog(null); st.busy = false;
  }

  // ---- кнопки й клавіші ----
  $('btnSplit').addEventListener('click', doSplit); $('btnDel').addEventListener('click', doDelete);
  $('btnTrimL').addEventListener('click', function () { doTrim(true); }); $('btnTrimR').addEventListener('click', function () { doTrim(false); });
  $('btnCrop').addEventListener('click', doCrop); $('btnApply').addEventListener('click', function () { doApply(false); }); $('btnReset').addEventListener('click', function () { doApply(true); });
  $('btnPlay').addEventListener('click', function () { if (st.play) stopPlay(); else startPlay(st.head); });
  $('btnStop').addEventListener('click', function () { stopPlay(); st.head = 0; tl.setScroll(0); refresh(true); });
  $('btnPlaySel').addEventListener('click', function () { if (st.sel) startPlay(st.sel.a, st.sel.b); });
  $('btnUndo').addEventListener('click', undo); $('btnRedo').addEventListener('click', redo);
  $('btnZoomIn').addEventListener('click', function () { tl.zoom(1.5); }); $('btnZoomOut').addEventListener('click', function () { tl.zoom(1 / 1.5); }); $('btnFit').addEventListener('click', function () { tl.fit(); });
  $('btnExport').addEventListener('click', doExport); $('btnExport2').addEventListener('click', doExport);
  document.addEventListener('keydown', function (e) {
    var tag = (e.target.tagName || '').toLowerCase(), typing = tag === 'input' && /text|number/.test(e.target.type) || tag === 'textarea' || tag === 'select';
    if (typing || document.querySelector('dialog[open]')) return;
    var k = window.zbKey(e), mod = e.ctrlKey || e.metaKey;
    if (mod && k === 'z') { e.preventDefault(); if (e.shiftKey) redo(); else undo(); }
    else if (mod && k === 'y') { e.preventDefault(); redo(); }
    else if (mod) return;
    else if (e.code === 'Space') { if (tag === 'button') return; e.preventDefault(); $('btnPlay').click(); }
    else if (k === 's') doSplit();
    else if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); doDelete(); }
    else if (e.key === 'Home') { st.head = 0; stopPlay(); tl.setScroll(0); refresh(true); }
    else if (e.key === 'End') { st.head = C.total(st.segs); stopPlay(); refresh(true); }
    else if (e.key === '+' || e.key === '=') tl.zoom(1.5); else if (e.key === '-') tl.zoom(1 / 1.5);
  });

  // ---- початок ----
  setRange('mg', st.master.gainDb); setRange('fi', st.master.fadeIn); setRange('fo', st.master.fadeOut); $('norm').checked = !!st.master.norm; setRange('nd', st.master.normDb); $('nd').disabled = !st.master.norm;
  setRange('spd', 0); setRange('pit', 0); setRange('gdb', 0);
  buildExpUi(); refresh();
  // для автоматичних перевірок
  window.__ae = { st: st, openFile: openFile, mutate: mutate, doExport: doExport };
})();
