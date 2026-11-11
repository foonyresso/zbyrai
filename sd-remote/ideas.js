'use strict';
// Вкладка «Ідеї»: пошук картинок на Civitai за словами/тегами (через проксі сервера з ключем), перегляд з даними генерації й копіюванням промпта.
(function () {
  var $ = function (id) { return document.getElementById(id); };
  window.SDIdeas = {
    init: function (host) {
      var root = $('ideasGal'); if (!root || !window.SDLoras || !window.CivitaiInfo) return;
      var q = '', gal = window.SDLoras.mkGallery(root, {
        empty: 'За цим запитом нічого не знайдено (або знайдене приховане фільтром Civitai). Спробуй інші слова.',
        fetchPage: function (cur, f) {
          if (!q) return Promise.resolve({ items: [], next: '' });
          return window.CivitaiInfo.search(q, cur, f).then(function (r) {
            if (!cur) r.note = (r.used.length ? 'Шукаю за тегами: ' + r.used.join(', ') + '.' : '') + (r.missing.length ? ' На Civitai немає такого тегу: ' + r.missing.join(', ') + ' (спробуй інший запис, напр. без дужок).' : '');
            return r;
          });
        }
      });
      function go() { var v = $('ideasQ').value.trim(); if (!v) return host.toast('Введи теги або слова для пошуку'); q = v; try { localStorage.setItem('sd_ideasq', v); } catch (e) { /* не критично */ } gal.reset(); }
      $('ideasGo').addEventListener('click', go);
      if (window.SDAutocomplete) SDAutocomplete.attach($('ideasQ'));   // підказки тегів, як у промпті
      $('ideasQ').addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.defaultPrevented) { e.preventDefault(); go(); } });
      // приклади: 5–7 випадкових поширених тегів (кнопка 🎲 міняє їх)
      var POOL = ['1girl', '1boy', 'solo', 'long hair', 'short hair', 'pink hair', 'blue hair', 'white hair', 'red eyes', 'cat ears', 'fox ears', 'elf', 'witch', 'maid', 'kimono', 'school uniform', 'armor', 'knight', 'dragon', 'wings', 'demon', 'angel', 'sword', 'cyberpunk', 'steampunk', 'gothic', 'fantasy', 'castle', 'forest', 'city', 'night', 'rain', 'beach', 'snow', 'portrait', 'smile', 'mecha', 'robot', 'space', 'flowers'];
      function examples() {
        var box = $('ideasEx'), pool = POOL.slice(), n = 5 + Math.floor(Math.random() * 3); box.textContent = '';
        var lb = document.createElement('span'); lb.className = 'hint'; lb.textContent = 'Приклади:'; box.appendChild(lb);
        for (var k = 0; k < n; k++) { var t = pool.splice(Math.floor(Math.random() * pool.length), 1)[0], b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = t; b.addEventListener('click', function () { $('ideasQ').value = this.textContent; go(); }); box.appendChild(b); }
        var d = document.createElement('button'); d.type = 'button'; d.className = 'chip'; d.textContent = '🎲'; d.title = 'Інші приклади'; d.addEventListener('click', examples); box.appendChild(d);
      }
      examples();
      try { var old = localStorage.getItem('sd_ideasq'); if (old) $('ideasQ').value = old; } catch (e) { /* не критично */ }
    }
  };
})();
