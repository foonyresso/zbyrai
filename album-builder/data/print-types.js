// Типи друку й формати. УВАГА: розміри — ЗАГЛУШКИ (номінальні), точних розмірів з макетів Цифролабу отримати не вдалося.
// Бракує для кожного типу й формату: точний розмір сторінки (мм), виліт (мм), ширина корінця/зазору (мм), чи розворот суцільний.
// bleed = виліт (мм, зона, що точно обріжеться), safe = безпечний відступ від лінії обрізу (мм, ризикова лінія; текст і важливе не заходять). 3 і 5 — типові значення, не з сайту.
// spine = ширина корінця/зазору між передньою й задньою частинами обкладинки (мм), поки 0; від неї залежить центр передньої сторони.
// Заміни значення нижче (pageW, pageH, bleed, safe, spine) на дійсні: більше нічого в коді міняти не треба.
(function (root) {
  var FMT = {
    '23x23': { label: '23×23 см', pageW: 230, pageH: 230, bleed: 3, safe: 5, spine: 0 },
    // 20×30: одна орієнтація (сторінка 200 мм завширшки, 300 мм заввишки). Це припущення, не з сайту Цифролабу.
    '20x30': { label: '20×30 см', pageW: 200, pageH: 300, bleed: 3, safe: 5 }
  };
  // Розміри, що залежать від типу друку (перекривають FMT). UniBook Light 20×30: розворот 408×290 мм = 4819×3425 px (300 dpi); обкладинка окремо — 5386×3780 px (шаблон cover_11.tif),
  // як вимагає друкарня (з її TIF-шаблону). Розбивка на сторінку й виліт умовна (200×282 мм + 4 мм); точні px задає поле px.
  var TYPE_FMT = {
    unibook: { '20x30': { pageW: 200, pageH: 282, bleed: 4, px: [4819, 3425], coverPx: [5386, 3780] } }
  };
  var TYPES = [
    { id: 'bamboo', name: 'Бамбук', note: 'Заглушка розмірів', formats: ['23x23', '20x30'] },
    { id: 'slim', name: 'Slim Book', note: 'Заглушка розмірів', formats: ['23x23', '20x30'] },
    { id: 'unibook', name: 'Фотокнига: UniBook Light', note: 'Заглушка розмірів', formats: ['23x23', '20x30'] }
  ];
  // Розворот у мм: дві сторінки поруч + виліт з усіх боків.
  function spreadSize(fmtId, typeId, cover) {
    var fid = fmtId === '20x30v' ? '20x30' : fmtId, base = FMT[fid] || FMT['23x23'], ov = (TYPE_FMT[typeId] || {})[fid], f = {};
    for (var k in base) f[k] = base[k];
    if (ov) for (var k2 in ov) f[k2] = ov[k2];
    var sf = f.safe == null ? 5 : f.safe;
    var W = 2 * f.pageW + 2 * f.bleed, H = f.pageH + 2 * f.bleed;
    // Точний розмір файлу в пікселях (300 dpi): явний від друкарні або округлений з мм.
    if (cover && f.coverPx) {
      // Обкладинка має власний розмір (шаблон cover_*.tif): мм виводимо з px, сторінка = (W − 2·виліт)/2.
      var cpx = f.coverPx.slice(), cW = cpx[0] * 25.4 / 300, cH = cpx[1] * 25.4 / 300;
      return { px: cpx, pxW: cpx[0], pxH: cpx[1], W: cW, H: cH, bleed: f.bleed, safe: sf, sb: f.bleed + sf, spine: f.spine || 0, pageW: (cW - 2 * f.bleed) / 2, pageH: cH - 2 * f.bleed };
    }
    var px = f.px ? f.px.slice() : [Math.round(W * 300 / 25.4), Math.round(H * 300 / 25.4)];
    return { px: px, pxW: px[0], pxH: px[1], W: W, H: H, bleed: f.bleed, safe: sf, sb: f.bleed + sf, spine: f.spine || 0, pageW: f.pageW, pageH: f.pageH };
  }
  var api = { FORMATS: FMT, TYPES: TYPES, spreadSize: spreadSize };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.AlbumPrint = api;
})(typeof self !== 'undefined' ? self : this);
