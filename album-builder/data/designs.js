// Дизайни за категоріями. Категорії-заготовки: дизайнів у них поки один спільний («Світла класика»), решта буде додана пізніше.
// Дизайн = набір кольорів і шрифтів для render.js; нові дизайни додавай окремим записом у DESIGNS і в designs відповідних категорій.
(function (root) {
  var DESIGNS = {
    classic: { id: 'classic', name: 'Світла класика', bg: '#ffffff', text: '#6b6b6b', title: '#c9c9c9', band: 'rgba(255,255,255,.62)', ph: '#e8e4e1', font: '"Helvetica Neue", Arial, sans-serif', fontLight: '"Helvetica Neue Light", "Segoe UI Light", "Helvetica Neue", Arial, sans-serif', gap: 1.2, groupGap: 3, groupMargin: 6 }
  };
  var CATEGORIES = [
    { id: 'kindergarten', name: 'Садочок', designs: ['classic'] },
    { id: 'grade4', name: '4 клас', designs: ['classic'] },
    { id: 'grade9', name: '9 клас', designs: ['classic'] },
    { id: 'grade11', name: '11 клас', designs: ['classic'] },
    { id: 'university', name: 'Виші', designs: ['classic'] }
  ];
  var api = { DESIGNS: DESIGNS, CATEGORIES: CATEGORIES };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.AlbumDesigns = api;
})(typeof self !== 'undefined' ? self : this);
