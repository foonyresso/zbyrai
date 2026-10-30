// Атлас 2.0: точки ресурсів і дороги до них (W.resources, W.resRoads): кольорові точки за видом, возові шляхи суцільні, стежки пунктиром. Показуються з наближенням.
(function () {
  'use strict';
  const A = globalThis.Atlas2;
  const COL = { ore: '#6b5b8a', stone: '#7d7466', wood: '#3f7a3a', water: '#2f78b8', herb: '#b05a96', hunt: '#a8472f', farm: '#c9a227' };
  A.ResColor = g => COL[g] || '#555';
  A.drawResources = function (ctx, W, px, k, L) {
    if (!W.resources || k < 3.5) return;
    ctx.save();
    const g = A.ResData.byId, rad = (k >= 8 ? 3.4 : 2.4) * px;
    for (const n of W.resources) { const t = g[n.type]; ctx.beginPath(); ctx.arc(n.x, n.y, rad * (n.q === 'rich' ? 1.25 : n.q === 'poor' ? 0.8 : 1), 0, 6.2832); ctx.fillStyle = COL[t.grp] || '#555'; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 0.8 * px; ctx.stroke(); }
    ctx.restore();
  };
})();
