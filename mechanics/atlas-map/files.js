/* Механіка «atlas-map»: перелік файлів рушія Атласу 2.0 (світ, дороги, поселення, місто, малювання) і завантаження в браузері.
   Рушій лишається в atlas2/ (його правлять окремо); тут лише спільний спосіб його підключити. Без ui/app.js і ui/dungeon.js. */
(function (root) {
  'use strict';
  const Mech = root.Mech = root.Mech || {};
  const CORE = ['rng', 'noise', 'heap', 'grid', 'params', 'terrain', 'hydrology', 'climate', 'names', 'settle', 'grow', 'politics', 'settlements', 'roads', 'landmarks', 'searoutes', 'seas', 'bestiary', 'danger', 'generate', 'serialize'];
  const CITY = ['citydata', 'citytext', 'townenv', 'townstreets', 'townsites', 'townsites2', 'townroads', 'townfields', 'castlegeo', 'castleplot', 'castletypes', 'castlewall', 'castlelayout', 'castleroads', 'townkeep', 'town', 'townquery'];
  const RENDER = ['contours', 'raster', 'draw', 'roadgeom', 'landmarks', 'places', 'townmask', 'townkeep', 'town'];
  const FILES = CORE.map(f => 'core/' + f).concat(CITY.map(f => 'core/' + f), RENDER.map(f => 'render/' + f), ['ui/town']);
  // завантажує файли по черзі (порядок важливий); base — шлях до atlas2/ (напр. '../atlas2/'); повертає Promise
  function load(base, ver) {
    return FILES.reduce((p, f) => p.then(() => new Promise((ok, fail) => { const s = document.createElement('script'); s.src = base + f + '.js' + (ver ? '?v=' + ver : ''); s.onload = ok; s.onerror = () => fail(new Error('Не завантажено ' + f)); document.head.appendChild(s); })), Promise.resolve());
  }
  Mech.AtlasFiles = { FILES, load };
  if (typeof module !== 'undefined' && module.exports) module.exports = Mech.AtlasFiles;
})(globalThis);
