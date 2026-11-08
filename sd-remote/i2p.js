// Вкладка «Картинка → промпт»: вбудований сайт vheer.com (image-to-prompt) + кнопки, що переносять промпт у наше поле.
// Сторонній сайт не віддає результат сторінці (захист браузера), тому: скопіюй промпт там і встав сюди (з буфера чи Ctrl+V), далі кнопки замінюють або доповнюють промпт.
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var URL_I2P = 'https://vheer.com/app/image-to-prompt', host = null, loaded = false, ready = false;

  function clean(t) { return String(t || '').replace(/\s+/g, ' ').trim(); }
  var prev = null;
  function put(text, append, quiet) {
    text = clean(text); if (!text) return host.toast('Спершу скопіюй промпт із сайту й встав його сюди');
    prev = host.state.prompt; $('i2pUndo').disabled = false;
    var cur = host.state.prompt.trim().replace(/,\s*$/, '');
    host.setPrompt(append && cur ? cur + ', ' + text : text);
    if (!quiet) host.toast(append ? 'Додано до промпта' : 'Промпт замінено');
  }
  // Повідомлення від скрипта з vheer.com (лише від нашої рамки й лише з цього сайту)
  window.addEventListener('message', function (e) {
    var f = $('i2pFrame'); if (!f || e.source !== f.contentWindow || e.origin !== 'https://vheer.com') return;
    var d = e.data; if (!d || d.source !== 'zbyrai-i2p') return;
    if (d.type === 'ready') { ready = true; crop(); $('i2pStatus').textContent = 'Скрипт активний: промпт передається автоматично'; $('i2pStatus').classList.add('okk'); }
    if (d.type === 'caption' && typeof d.text === 'string') {
      var t = clean(d.text).slice(0, 4000); if (!t) return; $('i2pBox').value = t;
      var mode = host.state.i2p.mode || 'replace';
      if (mode === 'none') host.toast('Промпт отримано: він у полі нижче'); else { put(t, mode === 'append', true); host.toast(mode === 'append' ? 'Промпт додано до поля' : 'Промпт вставлено в поле'); }
    }
  });
  function fromClipboard(cb) {
    if (!navigator.clipboard || !navigator.clipboard.readText) return host.toast('Браузер не дає читати буфер: встав текст у поле нижче (Ctrl+V)');
    navigator.clipboard.readText().then(function (t) { $('i2pBox').value = t; cb(t); }, function () { host.toast('Немає дозволу на буфер: встав текст у поле нижче (Ctrl+V)'); });
  }
  function crop() {   // обрізання вікна: сховати меню зверху й підвал знизу
    var sv = host.state.i2p, c = ready ? { top: 0, left: 0, h: sv.h } : sv, v = $('i2pView'), f = $('i2pFrame');   // зі скриптом меню вже сховане, обрізання не потрібне
    v.style.height = c.h + 'px'; f.style.marginTop = -c.top + 'px'; f.style.height = (c.h + c.top) + 'px'; f.style.marginLeft = -c.left + 'px'; f.style.width = 'calc(100% + ' + c.left + 'px)';
    $('i2pTop').value = sv.top; $('i2pTopV').textContent = sv.top + ' px'; $('i2pLeft').value = sv.left; $('i2pLeftV').textContent = sv.left + ' px';
    document.querySelectorAll('#i2pTop,#i2pLeft').forEach(function (e) { e.disabled = ready; e.parentNode.style.opacity = ready ? .45 : 1; }); $('i2pH').value = c.h; $('i2pHV').textContent = c.h + ' px';
  }
  window.SDI2p = {
    init: function (h) {
      host = h; var sv = host.state.i2p || {}; if (sv.top === 0 && sv.h === 720 && sv.left === undefined) sv = {};   // старі типові значення замінюються новими
      host.state.i2p = Object.assign({ top: 93, left: 48, h: 860, mode: 'replace' }, sv); crop();
      $('i2pMode').value = host.state.i2p.mode; $('i2pMode').addEventListener('change', function () { host.state.i2p.mode = this.value; host.save(); });
      $('i2pUndo').addEventListener('click', function () { if (prev != null) { host.setPrompt(prev); prev = null; this.disabled = true; host.toast('Повернено попередній промпт'); } });
      $('i2pLeft').addEventListener('input', function () { host.state.i2p.left = +this.value; crop(); host.save(); });
      $('i2pTop').addEventListener('input', function () { host.state.i2p.top = +this.value; crop(); host.save(); });
      $('i2pH').addEventListener('input', function () { host.state.i2p.h = +this.value; crop(); host.save(); });
      $('i2pPaste').addEventListener('click', function () { fromClipboard(function (t) { put(t, false); }); });
      $('i2pAppend').addEventListener('click', function () { var v = $('i2pBox').value; if (clean(v)) put(v, true); else fromClipboard(function (t) { put(t, true); }); });
      $('i2pReplace').addEventListener('click', function () { put($('i2pBox').value, false); });
      $('i2pOpen').addEventListener('click', function () { window.open(URL_I2P, '_blank', 'noopener'); });
    },
    show: function () {   // сторонній сайт вантажиться лише тоді, коли відкриваєш вкладку
      if (loaded) return; loaded = true; $('i2pFrame').src = URL_I2P;
      setTimeout(function () { if (!ready) $('i2pStatus').textContent = 'Скрипт не знайдено: промпт копіюй вручну або встанови скрипт (кнопка нижче)'; }, 6000);
    },
  };
})();
