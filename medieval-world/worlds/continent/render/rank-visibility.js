// Від якого масштабу видно поселення кожного рангу. Підписів на карті немає: назви лише в підказці при наведенні.
(function () {
  'use strict';
  const R = (globalThis.RealmMap = globalThis.RealmMap || {});
  function visibleRank(rk, k) { return rk === 'capital' || rk === 'regional' || rk === 'town' || (rk === 'village' && k >= 5.5) || ((rk === 'hamlet' || rk === 'mine') && k >= 9); }
  R.Rank = { visibleRank };
})();
