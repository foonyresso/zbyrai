'use strict';
// Вкладка «Ідеї»: пошук картинок на Civitai за словами/тегами (через проксі сервера з ключем), перегляд з даними генерації й копіюванням промпта.
(function () {
  var $ = function (id) { return document.getElementById(id); };
  window.SDIdeas = {
    init: function (host) {
      var root = $('ideasGal'); if (!root || !window.SDLoras || !window.CivitaiInfo) return;
      var q = '', gal = window.SDLoras.mkGallery(root, {
        empty: 'За цим запитом нічого не знайдено (або знайдене приховане фільтром Civitai). Спробуй інші слова.',
        fetchPage: function (cur, f) { return q ? window.CivitaiInfo.search(q, cur, f) : Promise.resolve({ items: [], next: '' }); }
      });
      function go() { var v = $('ideasQ').value.trim(); if (!v) return host.toast('Введи теги або слова для пошуку'); q = v; try { localStorage.setItem('sd_ideasq', v); } catch (e) { /* не критично */ } gal.reset(); }
      $('ideasGo').addEventListener('click', go);
      $('ideasQ').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); go(); } });
      document.querySelectorAll('#ideasEx button').forEach(function (b) { b.addEventListener('click', function () { $('ideasQ').value = b.textContent; go(); }); });
      try { var old = localStorage.getItem('sd_ideasq'); if (old) $('ideasQ').value = old; } catch (e) { /* не критично */ }
    }
  };
})();
