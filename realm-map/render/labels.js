// Підписи: назви провінцій (великі, рознесені літери), регіонів, природних об’єктів і поселень з уникненням перекриття.
(function () {
  'use strict';
  const R = (globalThis.RealmMap = globalThis.RealmMap || {});
  const FONT = '"Cinzel","Trajan Pro","Palatino Linotype","Book Antiqua",Georgia,serif';

  function spaced(ctx, text, x, y, sp, halo, fill, haloW) {
    let w = 0; const ws = []; for (const ch of text) { const cw = ctx.measureText(ch).width; ws.push(cw); w += cw + sp; } w -= sp;
    let cx = x - w / 2; ctx.textAlign = 'left'; let i = 0;
    for (const ch of text) { if (halo) { ctx.strokeStyle = halo; ctx.lineWidth = haloW; ctx.strokeText(ch, cx, y); } ctx.fillStyle = fill; ctx.fillText(ch, cx, y); cx += ws[i++] + sp; }
    return w;
  }
  const textW = (ctx, t) => ctx.measureText(t).width;
  function boxFree(boxes, b) { for (const o of boxes) if (b[0] < o[2] && b[2] > o[0] && b[1] < o[3] && b[3] > o[1]) return false; return true; }

  // Малює всі підписи. L — увімкнені шари; hits не потрібні. boxes — зайняті прямокутники (значки) для уникнення.
  function drawLabels(ctx, world, view, L, iconBoxes) {
    const g = world.grid, k = view.k, boxes = iconBoxes.slice();
    const sx = c => g.cx[c] * k + view.tx, sy = c => g.cy[c] * k + view.ty;
    ctx.textBaseline = 'middle';
    if (L.names_nature) {
      for (const f of world.features) {
        const sizeK = Math.sqrt(f.size) * k * 0.16; if (sizeK < 9) continue;
        const fs = Math.min(40, sizeK), x = sx(f.cell), y = sy(f.cell);
        ctx.font = (f.type === 'sea' ? 'italic ' : '') + Math.round(fs) + 'px ' + FONT;
        const col = f.type === 'sea' ? 'rgba(230,246,255,.82)' : f.type === 'range' ? 'rgba(60,50,42,.7)' : f.type === 'forest' ? (f.enchanted ? 'rgba(18,80,76,.8)' : 'rgba(25,62,30,.72)') : 'rgba(70,50,30,.65)';
        const w = spaced(ctx, f.name, x, y, fs * 0.28, f.type === 'sea' ? 'rgba(10,40,70,.35)' : 'rgba(255,255,255,.25)', col, 2);
        boxes.push([x - w / 2, y - fs / 2, x + w / 2, y + fs / 2]);
      }
    }
    if (L.names_provinces) {
      for (const pv of world.provinces) {
        const fs = Math.max(14, Math.min(46, Math.sqrt(pv.cells) * k * 0.2)), x = sx(pv.anchor), y = sy(pv.anchor);
        ctx.font = '600 ' + Math.round(fs) + 'px ' + FONT;
        const w = spaced(ctx, pv.name.toUpperCase(), x, y, fs * 0.22, 'rgba(255,248,230,.55)', R.Palette.provinceSolid(pv.hue), 3.5);
        boxes.push([x - w / 2, y - fs / 2, x + w / 2, y + fs / 2]);
      }
    }
    if (L.names_regions && k >= 9) {
      for (const r of world.regions) {
        const fs = Math.max(9, Math.min(15, Math.sqrt(r.cells) * k * 0.09)), x = sx(r.anchor) , y = sy(r.anchor) + fs * 1.3;
        ctx.font = 'italic ' + Math.round(fs) + 'px ' + FONT;
        const t = r.name; const w = textW(ctx, t), b = [x - w / 2, y - fs / 2, x + w / 2, y + fs / 2];
        if (!boxFree(boxes, b)) continue;
        ctx.textAlign = 'center'; ctx.strokeStyle = 'rgba(255,250,235,.7)'; ctx.lineWidth = 2.5; ctx.strokeText(t, x, y); ctx.fillStyle = 'rgba(60,40,28,.75)'; ctx.fillText(t, x, y); boxes.push(b);
      }
    }
    if (L.names_settlements) {
      const order = world.settlements.slice().sort((a, b) => R.Data.ranks[b.rank].size - R.Data.ranks[a.rank].size || a.id - b.id);
      for (const s of order) {
        const rk = s.rank; if (!visibleRank(rk, k)) continue;
        const fs = rk === 'capital' ? 15 : rk === 'regional' ? 12.5 : rk === 'town' ? 11 : 9.5, x = s.x * k + view.tx, y = s.y * k + view.ty + (R.Data.ranks[rk].size * 1.4 + 9) * Math.sqrt(k / 8) * 0.9;
        ctx.font = (rk === 'capital' ? '700 ' : rk === 'regional' ? '600 ' : '') + fs + 'px ' + FONT;
        const w = textW(ctx, s.name), b = [x - w / 2 - 1, y - fs / 2, x + w / 2 + 1, y + fs / 2];
        if (rk !== 'capital' && !boxFree(boxes, b)) continue;
        ctx.textAlign = 'center'; ctx.strokeStyle = 'rgba(250,244,226,.92)'; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.strokeText(s.name, x, y);
        ctx.fillStyle = s.state === 'normal' ? '#23190f' : '#6a5a4a'; ctx.fillText(s.name, x, y); boxes.push(b);
      }
    }
  }
  function visibleRank(rk, k) { return rk === 'capital' || rk === 'regional' || rk === 'town' || (rk === 'village' && k >= 5.5) || ((rk === 'hamlet' || rk === 'mine') && k >= 9); }
  R.Labels = { drawLabels, visibleRank, FONT };
})();
