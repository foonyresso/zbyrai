// Дизайни за категоріями. Категорії-заготовки: дизайнів у них поки один спільний («Світла класика»), решта буде додана пізніше.
// Дизайн = набір кольорів і шрифтів для render.js; нові дизайни додавай окремим записом у DESIGNS і в designs відповідних категорій.
(function (root) {
  var DESIGNS = {
    classic: { id: 'classic', name: 'Світла класика', individualCover: true, bg: '#ffffff', text: '#6b6b6b', title: '#c9c9c9', band: 'rgba(255,255,255,.62)', ph: '#e8e4e1', font: '"Helvetica Neue", Arial, sans-serif', fontLight: '"Helvetica Neue Light", "Segoe UI Light", "Helvetica Neue", Arial, sans-serif', gap: 1.2, groupGap: 3, groupMargin: 11 }
    ,kinder: { id: 'kinder', name: 'Садочок: малюнки', note: 'білий, тонкий шрифт, малюнки олівцями на обкладинці', individualCover: false, coverVar: 'kg-crayon', fonts: ['Advent Pro'], bg: '#ffffff', text: '#8c8c8c', title: '#555555', band: 'rgba(255,255,255,.62)', ph: '#e8e4e1', font: '"Advent Pro", "Helvetica Neue", Arial, sans-serif', fontLight: '"Advent Pro", "Helvetica Neue", Arial, sans-serif', gap: 1.2, groupGap: 3, groupMargin: 11,
      // Перший розворот за макетом автора (01_01), частки W і H: фото справа з білим полем знизу (там прізвище), зліва зверху напис у двох рядках (другий на чорній плашці)
      first: { portrait: { x: 0.5, y: 0, w: 0.5, h: 0.8645 }, group: { x: 0, y: 0.3, w: 0.49, h: 0.62 }, t1: { r: 0.4656, y: 0.150, s: 0.057, sp: 0.16, c: '#555555' }, t2: { r: 0.4656, y: 0.2166, s: 0.057, sp: 0.16, c: '#ffffff', box: { x: 0.325, y: 0.159, w: 0.1406, h: 0.069, c: '#000000' } }, name: { x: 0.75, y: 0.935, s: 0.05, sp: 0.06, c: '#9a9a9a' }, texts: { ftitle1: 'GRADUATION', ftitle2: 'ALBUM' } } }
  };
  var CATEGORIES = [
    { id: 'kindergarten', name: 'Садочок', designs: ['classic', 'kinder'] },
    { id: 'grade4', name: '4 клас', designs: ['classic'] },
    { id: 'grade9', name: '9 клас', designs: ['classic'] },
    { id: 'grade11', name: '11 клас', designs: ['classic'] },
    { id: 'university', name: 'Виші', designs: ['classic'] }
  ];
  var api = { DESIGNS: DESIGNS, CATEGORIES: CATEGORIES };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.AlbumDesigns = api;
})(typeof self !== 'undefined' ? self : this);
