// Стабільні номери варіантів обкладинок: щоб можна було сказати «номер 17, проблема така». Номер видається один раз і не змінюється, не повторюється.
// Нові варіанти дописуй у КІНЕЦЬ списку NUMBERED (порядок не міняти, нічого не видаляти й не переставляти). Файл підключається після всіх cover-*.js.
(function (root) {
  var CV = root.AlbumCoverVariants || (typeof require !== 'undefined' ? require('./cover-variants.js') : null);
  var NUMBERED = [
    'classic', 'frame', 'grad-photo', 'kg-sun', 'kg-confetti', 'kg-stars', 'p-pencils', 'p-bubbles', 'g9-geo', 'g9-wave',
    'g11-gold', 'g11-class', 'u-alumni', 'abstract', 'botanic', 'lines', 'arch', 'oval-flowers', 'circle-sun', 'diamond',
    'hexagon', 'heart', 'watercolor', 'black-gold', 'splash', 'big-year', 'marble', 'doodles', 'letters', 'clouds',
    'noir', 'silver', 'script-year', 'only-year', 'gp-frame', 'gp-full', 'gp-oval', 'gp-3', 'gp-5', 'gp-strips',
    'cal-taupe', 'cal-virtual', 'cal-fullphoto', 'cal-brush', 'cal-peach', 'cal-gold', 'cal-sparkle', 'cal-black', 'typ-vert-year', 'typ-grad-tall',
    'typ-numerals', 'typ-year-geo', 'min-wordmark', 'min-dark', 'min-lookbook', 'soft-botanic', 'soft-monogram', 'sch-chalk', 'sch-class', 'kid-balloon'
  ];
  function numOf(id) { var i = NUMBERED.indexOf(id); return i < 0 ? 0 : i + 1; }
  // Варіант, якого ще немає в списку (забули дописати), отримує наступні номери за порядком; тест на це не пропускає
  var extra = NUMBERED.length;
  CV.VARIANTS.forEach(function (v) { v.num = numOf(v.id) || ++extra; });
  CV.NUMBERED = NUMBERED; CV.numOf = function (id) { var v = CV.byId(id); return v && v.id === id ? v.num : 0; };
})(typeof self !== 'undefined' ? self : this);
