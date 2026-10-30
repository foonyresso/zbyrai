// Атлас 2.0: точки ресурсів і дороги до них (W.resources, W.resRoads): кольорові точки за видом, возові шляхи суцільні, стежки пунктиром. Показуються з наближенням.
(function () {
  'use strict';
  const A = globalThis.Atlas2;
  const COL = { ore: '#6b5b8a', stone: '#7d7466', wood: '#3f7a3a', water: '#2f78b8', herb: '#b05a96', hunt: '#a8472f', farm: '#c9a227' };
  A.ResColor = g => COL[g] || '#555';
  A.drawResources = function (ctx, W, px, k, L) {
    if (!W.resources || k < 3.5) return;
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const kind of ['trail', 'cart']) {
      ctx.beginPath(); for (const r of W.resRoads || []) { if (r.kind !== kind) continue; const c = r.cells; ctx.moveTo((c[0] % W.w) + 0.5, ((c[0] / W.w) | 0) + 0.5); for (let i = 1; i < c.length; i++) ctx.lineTo((c[i] % W.w) + 0.5, ((c[i] / W.w) | 0) + 0.5); }
      ctx.strokeStyle = kind === 'cart' ? 'rgba(120,88,52,.85)' : 'rgba(120,88,52,.7)'; ctx.lineWidth = (kind === 'cart' ? 1.1 : 0.8) * px; ctx.setLineDash(kind === 'cart' ? [] : [3 * px, 2.5 * px]); ctx.stroke(); ctx.setLineDash([]);
    }
    const g = A.ResData.byId, rad = (k >= 8 ? 3.4 : 2.4) * px;
    for (const n of W.resources) { const t = g[n.type]; ctx.beginPath(); ctx.arc(n.x, n.y, rad * (n.q === 'rich' ? 1.25 : n.q === 'poor' ? 0.8 : 1), 0, 6.2832); ctx.fillStyle = COL[t.grp] || '#555'; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 0.8 * px; ctx.stroke(); }
    ctx.restore();
  };
})();
