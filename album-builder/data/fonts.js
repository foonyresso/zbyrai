// Вільні шрифти з кирилицею (ліцензії в fonts/NOTICE.md), лежать локально у fonts/ (див. fonts/fonts.css), без CDN. Браузер завантажує файл шрифту лише коли він використаний.
(function (root) {
  var LIST = [
    { n: 'Playfair Display', k: 'serif', g: 'Класичні із засічками' },
    { n: 'Lora', k: 'serif', g: 'Класичні із засічками' },
    { n: 'PT Serif', k: 'serif', g: 'Класичні із засічками' },
    { n: 'Cormorant Garamond', k: 'serif', g: 'Класичні із засічками' },
    { n: 'Merriweather', k: 'serif', g: 'Класичні із засічками' },
    { n: 'EB Garamond', k: 'serif', g: 'Класичні із засічками' },
    { n: 'Old Standard TT', k: 'serif', g: 'Класичні із засічками' },
    { n: 'Source Serif 4', k: 'serif', g: 'Класичні із засічками' },
    { n: 'Literata', k: 'serif', g: 'Класичні із засічками' },
    { n: 'Spectral', k: 'serif', g: 'Класичні із засічками' },
    { n: 'Vollkorn', k: 'serif', g: 'Класичні із засічками' },
    { n: 'Alegreya', k: 'serif', g: 'Класичні із засічками' },
    { n: 'Bitter', k: 'serif', g: 'Класичні із засічками' },
    { n: 'Roboto Slab', k: 'serif', g: 'Класичні із засічками' },
    { n: 'Podkova', k: 'serif', g: 'Класичні із засічками' },
    { n: 'Oranienbaum', k: 'serif', g: 'Класичні із засічками' },
    { n: 'Forum', k: 'serif', g: 'Класичні із засічками' },
    { n: 'Prata', k: 'serif', g: 'Класичні із засічками' },
    { n: 'PT Sans', k: 'sans-serif', g: 'Гротески без засічок' },
    { n: 'Montserrat', k: 'sans-serif', g: 'Гротески без засічок' },
    { n: 'Raleway', k: 'sans-serif', g: 'Гротески без засічок' },
    { n: 'Roboto', k: 'sans-serif', g: 'Гротески без засічок' },
    { n: 'Open Sans', k: 'sans-serif', g: 'Гротески без засічок' },
    { n: 'Noto Sans', k: 'sans-serif', g: 'Гротески без засічок' },
    { n: 'Ubuntu', k: 'sans-serif', g: 'Гротески без засічок' },
    { n: 'Exo 2', k: 'sans-serif', g: 'Гротески без засічок' },
    { n: 'Fira Sans', k: 'sans-serif', g: 'Гротески без засічок' },
    { n: 'Rubik', k: 'sans-serif', g: 'Гротески без засічок' },
    { n: 'Nunito', k: 'sans-serif', g: 'Гротески без засічок' },
    { n: 'Manrope', k: 'sans-serif', g: 'Гротески без засічок' },
    { n: 'Jura', k: 'sans-serif', g: 'Гротески без засічок' },
    { n: 'Didact Gothic', k: 'sans-serif', g: 'Гротески без засічок' },
    { n: 'Cuprum', k: 'sans-serif', g: 'Гротески без засічок' },
    { n: 'Play', k: 'sans-serif', g: 'Гротески без засічок' },
    { n: 'Tenor Sans', k: 'sans-serif', g: 'Гротески без засічок' },
    { n: 'Oswald', k: 'sans-serif', g: 'Заголовкові й декоративні' },
    { n: 'Russo One', k: 'sans-serif', g: 'Заголовкові й декоративні' },
    { n: 'Ruslan Display', k: 'sans-serif', g: 'Заголовкові й декоративні' },
    { n: 'Philosopher', k: 'sans-serif', g: 'Заголовкові й декоративні' },
    { n: 'Yeseva One', k: 'sans-serif', g: 'Заголовкові й декоративні' },
    { n: 'Rubik Mono One', k: 'sans-serif', g: 'Заголовкові й декоративні' },
    { n: 'Stalinist One', k: 'sans-serif', g: 'Заголовкові й декоративні' },
    { n: 'Poiret One', k: 'sans-serif', g: 'Заголовкові й декоративні' },
    { n: 'Advent Pro', k: 'sans-serif', g: 'Заголовкові й декоративні' },
    { n: 'Kelly Slab', k: 'sans-serif', g: 'Заголовкові й декоративні' },
    { n: 'Tektur', k: 'sans-serif', g: 'Заголовкові й декоративні' },
    { n: 'Montserrat Alternates', k: 'sans-serif', g: 'Заголовкові й декоративні' },
    { n: 'Unbounded', k: 'sans-serif', g: 'Заголовкові й декоративні' },
    { n: 'Yanone Kaffeesatz', k: 'sans-serif', g: 'Заголовкові й декоративні' },
    { n: 'Kurale', k: 'sans-serif', g: 'Заголовкові й декоративні' },
    { n: 'Sofia Sans Extra Condensed', k: 'sans-serif', g: 'Заголовкові й декоративні' },
    { n: 'Caveat', k: 'cursive', g: 'Рукописні й каліграфічні' },
    { n: 'Marck Script', k: 'cursive', g: 'Рукописні й каліграфічні' },
    { n: 'Pacifico', k: 'cursive', g: 'Рукописні й каліграфічні' },
    { n: 'Bad Script', k: 'cursive', g: 'Рукописні й каліграфічні' },
    { n: 'Lobster', k: 'cursive', g: 'Рукописні й каліграфічні' },
    { n: 'Comforter', k: 'cursive', g: 'Рукописні й каліграфічні' },
    { n: 'Great Vibes', k: 'cursive', g: 'Рукописні й каліграфічні' },
    { n: 'Comforter Brush', k: 'cursive', g: 'Рукописні й каліграфічні' },
    { n: 'Comfortaa', k: 'cursive', g: 'Дитячі й ігрові' },
    { n: 'Underdog', k: 'cursive', g: 'Дитячі й ігрові' },
    { n: 'Pangolin', k: 'cursive', g: 'Дитячі й ігрові' },
    { n: 'Amatic SC', k: 'cursive', g: 'Дитячі й ігрові' },
    { n: 'Rubik Bubbles', k: 'cursive', g: 'Дитячі й ігрові' },
    { n: 'Playpen Sans', k: 'cursive', g: 'Дитячі й ігрові' },
    { n: 'Neucha', k: 'cursive', g: 'Дитячі й ігрові' },
    { n: 'Marmelad', k: 'cursive', g: 'Дитячі й ігрові' }
  ];
  function stack(n) { var f = LIST.filter(function (x) { return x.n === n; })[0]; return f ? '"' + f.n + '", ' + f.k : null; }
  // Завантажує шрифти, що використовує макет, перед малюванням на canvas. Повертає Promise<true>, якщо щось довелося чекати.
  function used(st) {
    var set = {}; if (st.font) set[st.font] = 1; Object.keys(st.tf || {}).forEach(function (k) { if (st.tf[k]) set[st.tf[k]] = 1; });
    (st.spreads || []).forEach(function (sp) { Object.keys(sp.text || {}).forEach(function (j) { if (sp.text[j] && sp.text[j].f) set[sp.text[j].f] = 1; }); });
    var CVs = root.AlbumCoverVariants || (typeof require !== 'undefined' ? require('./cover-variants.js') : null);
    if (CVs && st.coverVar) CVs.fontsOf(st.coverVar).forEach(function (n) { set[n] = 1; });
    return Object.keys(set).filter(stack);
  }
  function ensure(st) {
    if (typeof document === 'undefined' || !document.fonts) return Promise.resolve(false);
    var need = []; used(st).forEach(function (n) { ['300', '400', '500', '600', '700', '800', '900', 'italic 400'].forEach(function (w) { var f = w + ' 20px "' + n + '"'; if (!document.fonts.check(f, 'Аб1')) need.push(document.fonts.load(f, 'Аб1')); }); });
    return need.length ? Promise.all(need).then(function () { return true; }, function () { return false; }) : Promise.resolve(false);
  }
  var GROUPS = []; LIST.forEach(function (f) { if (GROUPS.indexOf(f.g) < 0) GROUPS.push(f.g); });
  var api = { GROUPS: GROUPS, LIST: LIST, stack: stack, used: used, ensure: ensure };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.AlbumFonts = api;
})(typeof self !== 'undefined' ? self : this);
