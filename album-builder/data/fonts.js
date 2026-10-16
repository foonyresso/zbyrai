// Вільні шрифти з кирилицею (SIL OFL), лежать локально у fonts/ (див. fonts/fonts.css), без CDN.
(function (root) {
  var LIST = [
    { n: 'Playfair Display', k: 'serif', g: 'Із засічками' }, { n: 'Lora', k: 'serif', g: 'Із засічками' }, { n: 'PT Serif', k: 'serif', g: 'Із засічками' }, { n: 'Cormorant Garamond', k: 'serif', g: 'Із засічками' },
    { n: 'PT Sans', k: 'sans-serif', g: 'Без засічок' }, { n: 'Montserrat', k: 'sans-serif', g: 'Без засічок' }, { n: 'Raleway', k: 'sans-serif', g: 'Без засічок' }, { n: 'Oswald', k: 'sans-serif', g: 'Без засічок' }, { n: 'Comfortaa', k: 'sans-serif', g: 'Без засічок' },
    { n: 'Caveat', k: 'cursive', g: 'Рукописні' }, { n: 'Marck Script', k: 'cursive', g: 'Рукописні' }, { n: 'Pacifico', k: 'cursive', g: 'Рукописні' }
  ];
  function stack(n) { var f = LIST.filter(function (x) { return x.n === n; })[0]; return f ? '"' + f.n + '", ' + f.k : null; }
  // Завантажує шрифти, що використовує макет, перед малюванням на canvas. Повертає Promise<true>, якщо щось довелося чекати.
  function used(st) {
    var set = {}; if (st.font) set[st.font] = 1; Object.keys(st.tf || {}).forEach(function (k) { if (st.tf[k]) set[st.tf[k]] = 1; });
    (st.spreads || []).forEach(function (sp) { Object.keys(sp.text || {}).forEach(function (j) { if (sp.text[j] && sp.text[j].f) set[sp.text[j].f] = 1; }); });
    return Object.keys(set).filter(stack);
  }
  function ensure(st) {
    if (typeof document === 'undefined' || !document.fonts) return Promise.resolve(false);
    var need = []; used(st).forEach(function (n) { [400, 700].forEach(function (w) { var f = w + ' 20px "' + n + '"'; if (!document.fonts.check(f, 'Аб1')) need.push(document.fonts.load(f, 'Аб1')); }); });
    return need.length ? Promise.all(need).then(function () { return true; }, function () { return false; }) : Promise.resolve(false);
  }
  var api = { LIST: LIST, stack: stack, used: used, ensure: ensure };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.AlbumFonts = api;
})(typeof self !== 'undefined' ? self : this);
