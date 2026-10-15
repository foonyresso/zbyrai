// Декор рельєфу: дерева, пагорби, гори, болота, дюни — дрібні значки, розставлені детерміновано за комірками.
(function () {
  'use strict';
  const R = (globalThis.RealmMap = globalThis.RealmMap || {});

  const D = {
    mountain(ctx, x, y, s, snow) {
      const w = s * 0.95, h = s * 1.15;
      ctx.beginPath(); ctx.moveTo(x - w, y + h * 0.5); ctx.lineTo(x, y - h * 0.6); ctx.lineTo(x + w, y + h * 0.5); ctx.closePath();
      ctx.fillStyle = snow ? '#f4f6f8' : '#b3aa9a'; ctx.fill();
      ctx.beginPath(); ctx.moveTo(x, y - h * 0.6); ctx.lineTo(x + w, y + h * 0.5); ctx.lineTo(x + w * 0.1, y + h * 0.5); ctx.closePath(); ctx.fillStyle = snow ? '#c9d2da' : '#8a8274'; ctx.fill();
      ctx.beginPath(); ctx.moveTo(x - w, y + h * 0.5); ctx.lineTo(x, y - h * 0.6); ctx.lineTo(x + w, y + h * 0.5); ctx.strokeStyle = '#4a3f33'; ctx.lineWidth = Math.max(0.6, s * 0.1); ctx.stroke();
      if (!snow) { ctx.beginPath(); ctx.moveTo(x - w * 0.28, y - h * 0.18); ctx.lineTo(x, y - h * 0.6); ctx.lineTo(x + w * 0.28, y - h * 0.18); ctx.closePath(); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fill(); }
    },
    hill(ctx, x, y, s) { ctx.beginPath(); ctx.arc(x, y + s * 0.3, s * 0.7, Math.PI * 1.08, Math.PI * 1.92); ctx.strokeStyle = 'rgba(70,58,38,.7)'; ctx.lineWidth = Math.max(0.6, s * 0.12); ctx.stroke(); },
    tree(ctx, x, y, s, kind) {
      ctx.beginPath();
      if (kind === 'taiga') { ctx.moveTo(x, y - s * 0.95); ctx.lineTo(x + s * 0.5, y + s * 0.3); ctx.lineTo(x - s * 0.5, y + s * 0.3); ctx.closePath(); ctx.fillStyle = '#3f6b4d'; }
      else { ctx.arc(x, y - s * 0.2, s * 0.5, 0, 6.3); ctx.fillStyle = kind === 'enchanted' ? '#3f9c93' : '#4d7e3a'; }
      ctx.fill(); ctx.strokeStyle = 'rgba(25,40,20,.85)'; ctx.lineWidth = Math.max(0.5, s * 0.08); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, y + s * 0.3); ctx.lineTo(x, y + s * 0.65); ctx.strokeStyle = '#4b3722'; ctx.stroke();
      if (kind === 'enchanted') { ctx.fillStyle = 'rgba(210,255,248,.95)'; ctx.fillRect(x - s * 0.08, y - s * 0.55, s * 0.16, s * 0.16); }
    },
    swamp(ctx, x, y, s) { ctx.strokeStyle = 'rgba(40,70,45,.8)'; ctx.lineWidth = Math.max(0.5, s * 0.1); ctx.beginPath(); ctx.moveTo(x - s * 0.4, y); ctx.lineTo(x + s * 0.4, y); ctx.moveTo(x - s * 0.25, y + s * 0.3); ctx.lineTo(x + s * 0.25, y + s * 0.3); ctx.moveTo(x, y - s * 0.4); ctx.lineTo(x, y - s * 0.05); ctx.stroke(); },
    dune(ctx, x, y, s) { ctx.beginPath(); ctx.arc(x, y + s * 0.4, s * 0.55, Math.PI * 1.15, Math.PI * 1.85); ctx.strokeStyle = 'rgba(150,115,60,.75)'; ctx.lineWidth = Math.max(0.5, s * 0.1); ctx.stroke(); },
    dead(ctx, x, y, s) { ctx.strokeStyle = 'rgba(55,40,35,.85)'; ctx.lineWidth = Math.max(0.6, s * 0.12); ctx.beginPath(); ctx.moveTo(x, y + s * 0.4); ctx.lineTo(x, y - s * 0.4); ctx.moveTo(x, y - s * 0.1); ctx.lineTo(x + s * 0.3, y - s * 0.4); ctx.moveTo(x, y); ctx.lineTo(x - s * 0.3, y - s * 0.3); ctx.stroke(); },
    grass(ctx, x, y, s) { ctx.strokeStyle = 'rgba(70,100,45,.55)'; ctx.lineWidth = Math.max(0.5, s * 0.08); ctx.beginPath(); ctx.moveTo(x - s * 0.2, y + s * 0.15); ctx.lineTo(x - s * 0.3, y - s * 0.15); ctx.moveTo(x, y + s * 0.15); ctx.lineTo(x, y - s * 0.25); ctx.moveTo(x + s * 0.2, y + s * 0.15); ctx.lineTo(x + s * 0.3, y - s * 0.15); ctx.stroke(); },
  };

  function renderDecor(world, S) {
    const g = world.grid, cv = R.BaseLayer.mkCanvas(Math.ceil(g.w * S), Math.ceil(g.h * S)), ctx = cv.getContext('2d'), P = R.Palette, B = R.Data.biomes;
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    const road = world.roadLevel;
    for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
      const i = y * g.w + x; if (world.water[i] !== 0) continue;
      const id = B[world.bio[i]].id, r1 = P.hash(x, y, 11), r2 = P.hash(x, y, 12), r3 = P.hash(x, y, 13);
      const px = (g.cx[i] + (r1 - 0.5) * 0.7) * S, py = (g.cy[i] + (r2 - 0.5) * 0.7) * S;
      if (world.river[i]) continue;
      const onRoad = road && road[i] >= 2;
      switch (id) {
        case 'peaks': D.mountain(ctx, px, py, S * 0.95, true); break;
        case 'mountain': D.mountain(ctx, px, py, S * 0.85, false); break;
        case 'hills': if (r3 < 0.55 && !onRoad) D.hill(ctx, px, py, S * 0.8); break;
        case 'forest': case 'taiga': case 'enchanted': if (r3 < 0.62 && !onRoad) D.tree(ctx, px, py, S * 0.62, id); break;
        case 'swamp': if (r3 < 0.6) D.swamp(ctx, px, py, S * 0.7); break;
        case 'desert': if (r3 < 0.35) D.dune(ctx, px, py, S * 0.8); break;
        case 'wasteland': if (r3 < 0.4) D.dead(ctx, px, py, S * 0.8); break;
        case 'grass': if (r3 < 0.14) D.grass(ctx, px, py, S * 0.7); break;
        default: break;
      }
    }
    return cv;
  }
  R.Decor = { renderDecor, D };
})();
