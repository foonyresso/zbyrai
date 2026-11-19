// ZB UI-кіт (джерело): поведінка іконок-меню з панеллю, довідки «i» і посилання на головну.
// Розмітка: #rail > button[data-panel], #drawer > section[data-panel] + #drawerX, #btnHelp + dialog#help.
// Ключ збереження відкритої панелі: data-store на #drawer (інакше zb.<папка>.panel); початкова: data-default.
// Копії в папках інструментів робить node tools/sync-theme.mjs; не правити копії вручну.
(function () {
  // гарячі клавіші, незалежні від розкладки (літера з фізичної клавіші e.code)
  window.zbKey = function (e) {
    var c = e.code || '';
    if (/^Key[A-Z]$/.test(c)) return c.charAt(3).toLowerCase();
    if (c === 'BracketLeft') return '[';
    if (c === 'BracketRight') return ']';
    return (e.key || '').toLowerCase();
  };
  var folder = (location.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '').split('/').pop()) || 'tool';
  function $(id) { return document.getElementById(id); }
  var ZB = window.ZB = { panel: '', showPanel: function () {}, onPanel: null };
  function init() {
    var back = document.querySelector('.hub-back');
    if (back) {
      back.setAttribute('href', '../index.html#t-' + folder);
      var seen = false; try { seen = !!sessionStorage.getItem('hub'); } catch (e) { /* не критично */ }
      if (/^https?:$/.test(location.protocol) || seen) back.hidden = false;
    }
    var rail = $('rail'), drawer = $('drawer');
    if (rail && drawer) {
      var key = drawer.dataset.store || 'zb.' + folder + '.panel', panel = '';
      try { panel = localStorage.getItem(key); } catch (e) { /* не критично */ }
      if (panel === null || panel === undefined) panel = drawer.dataset.default || '';
      var btns = rail.querySelectorAll('button[data-panel]');
      ZB.showPanel = function (n) {
        panel = n || '';
        ZB.panel = panel;
        try { localStorage.setItem(key, panel); } catch (e) { /* не критично */ }
        drawer.hidden = !panel; document.body.classList.toggle('zb-panel', !!panel);
        btns.forEach(function (b) { b.classList.toggle('on', b.dataset.panel === panel); });
        drawer.querySelectorAll('section').forEach(function (s) { s.classList.toggle('on', s.dataset.panel === panel); });
        if (ZB.onPanel) ZB.onPanel(panel);
      };
      btns.forEach(function (b) { b.addEventListener('click', function () { ZB.showPanel(ZB.panel === b.dataset.panel ? '' : b.dataset.panel); }); });
      if ($('drawerX')) $('drawerX').addEventListener('click', function () { ZB.showPanel(''); });
      ZB.showPanel(panel);
    }
    var help = $('help'), hb = $('btnHelp');
    if (help && hb) {
      hb.addEventListener('click', function () { help.showModal(); });
      help.addEventListener('click', function (e) { if (e.target === help) help.close(); });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
