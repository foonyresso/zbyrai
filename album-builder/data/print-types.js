// Типи друку й формати. УВАГА: розміри — ЗАГЛУШКИ (номінальні), точних розмірів з макетів Цифролабу отримати не вдалося.
// Бракує для кожного типу й формату: точний розмір сторінки (мм), виліт (мм), ширина корінця/зазору (мм), чи розворот суцільний.
// bleed = виліт (мм, зона, що точно обріжеться), safe = безпечний відступ від лінії обрізу (мм, ризикова лінія; текст і важливе не заходять). 3 і 5 — типові значення, не з сайту.
// spine = ширина корінця/зазору між передньою й задньою частинами обкладинки (мм), поки 0; від неї залежить центр передньої сторони.
// Заміни значення нижче (pageW, pageH, bleed, safe, spine) на дійсні: більше нічого в коді міняти не треба.
(function (root) {
  var FMT = {
    '23x23': { label: '23×23 см', pageW: 230, pageH: 230, bleed: 3, safe: 5, spine: 0 },
    // 20×30: розворот 408×290 мм = 4819×3425 px (300 dpi) — розмір, який вимагає друкарня (взято з їхнього TIF-шаблону).
    // Розбивка на сторінку й виліт умовна (200×282 мм + 4 мм виліт); точні px задає поле px.
    '20x30': { label: '20×30 см (розворот 408×290 мм)', pageW: 200, pageH: 282, bleed: 4, safe: 5, px: [4819, 3425] }
  };
  var TYPES = [
    { id: 'bamboo', name: 'Бамбук', note: 'Заглушка розмірів', formats: ['23x23', '20x30'] },
    { id: 'slim', name: 'Slim Book', note: 'Заглушка розмірів', formats: ['23x23', '20x30'] },
    { id: 'unibook', name: 'Unibook Light', note: 'Заглушка розмірів', formats: ['23x23', '20x30'] }
  ];
  // Розворот у мм: дві сторінки поруч + виліт з усіх боків.
  function spreadSize(fmtId) {
    var f = FMT[fmtId === '20x30v' ? '20x30' : fmtId] || FMT['23x23'];
    var sf = f.safe == null ? 5 : f.safe;
    var W = 2 * f.pageW + 2 * f.bleed, H = f.pageH + 2 * f.bleed;
    // Точний розмір файлу в пікселях (300 dpi): явний від друкарні або округлений з мм.
    var px = f.px ? f.px.slice() : [Math.round(W * 300 / 25.4), Math.round(H * 300 / 25.4)];
    return { px: px, pxW: px[0], pxH: px[1], W: W, H: H, bleed: f.bleed, safe: sf, sb: f.bleed + sf, spine: f.spine || 0, pageW: f.pageW, pageH: f.pageH };
  }
  var api = { FORMATS: FMT, TYPES: TYPES, spreadSize: spreadSize };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.AlbumPrint = api;
})(typeof self !== 'undefined' ? self : this);
