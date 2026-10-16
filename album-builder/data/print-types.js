// Типи друку й формати. УВАГА: розміри — ЗАГЛУШКИ (номінальні), точних розмірів з макетів Цифролабу отримати не вдалося.
// Бракує для кожного типу й формату: точний розмір сторінки (мм), виліт (мм), ширина корінця/зазору (мм), чи розворот суцільний.
// Заміни значення нижче (pageW, pageH, bleed) на дійсні: більше нічого в коді міняти не треба.
(function (root) {
  var FMT = {
    '23x23': { label: '23×23 см', pageW: 230, pageH: 230, bleed: 3 },
    '20x30': { label: '20×30 см, альбомна (сторінка 300×200 мм)', pageW: 300, pageH: 200, bleed: 3 },
    '20x30v': { label: '20×30 см, книжкова (сторінка 200×300 мм)', pageW: 200, pageH: 300, bleed: 3 }
  };
  var TYPES = [
    { id: 'bamboo', name: 'Бамбук', note: 'Заглушка розмірів', formats: ['23x23', '20x30', '20x30v'] },
    { id: 'slim', name: 'Slim Book', note: 'Заглушка розмірів', formats: ['23x23', '20x30', '20x30v'] },
    { id: 'unibook', name: 'Unibook Light', note: 'Заглушка розмірів', formats: ['23x23', '20x30', '20x30v'] }
  ];
  // Розворот у мм: дві сторінки поруч + виліт з усіх боків.
  function spreadSize(fmtId) {
    var f = FMT[fmtId] || FMT['23x23'];
    return { W: 2 * f.pageW + 2 * f.bleed, H: f.pageH + 2 * f.bleed, bleed: f.bleed, pageW: f.pageW, pageH: f.pageH };
  }
  var api = { FORMATS: FMT, TYPES: TYPES, spreadSize: spreadSize };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.AlbumPrint = api;
})(typeof self !== 'undefined' ? self : this);
