// Малювання розвороту на canvas (одиниці — мм). Використовується і для перегляду, і для експорту.
(function (root) {
  var S = root.AlbumState;
  function crop(st, name) { var c = st.crops[name]; return c || (st.crops[name] = { z: 1, fx: 0.5, fy: 0.35 }); }
  function drawImg(ctx, img, r, c) {
    var s = Math.max(r.w / img.naturalWidth, r.h / img.naturalHeight) * c.z, dw = img.naturalWidth * s, dh = img.naturalHeight * s;
    ctx.save(); ctx.beginPath(); ctx.rect(r.x, r.y, r.w, r.h); ctx.clip();
    ctx.drawImage(img, r.x - (dw - r.w) * c.fx, r.y - (dh - r.h) * c.fy, dw, dh); ctx.restore();
  }
  // Текст, що стискається до ширини maxW.
  function fitText(ctx, text, x, y, size, maxW, font, color, weight, align, spacing) {
    ctx.save(); ctx.fillStyle = color; ctx.textAlign = align || 'center'; ctx.textBaseline = 'alphabetic';
    var s = size; ctx.font = (weight || '400') + ' ' + s + 'px ' + font;
    if ('letterSpacing' in ctx) ctx.letterSpacing = (spacing || 0) * s + 'px';
    var w = ctx.measureText(text).width;
    if (w > maxW) { s = s * maxW / w; ctx.font = (weight || '400') + ' ' + s + 'px ' + font; if ('letterSpacing' in ctx) ctx.letterSpacing = (spacing || 0) * s + 'px'; }
    ctx.fillText(text, x, y); ctx.restore(); return s;
  }
  function draw(ctx, st, si, numMap, imgs, o) {
    var info = S.slotsFor(st, si, numMap), d = info.design, W = info.W, H = info.H, sp = st.spreads[si];
    ctx.save(); ctx.setTransform(o.pxPerMm, 0, 0, o.pxPerMm, 0, 0);
    ctx.fillStyle = d.bg; ctx.fillRect(0, 0, W, H);
    var yr = st.year || '', inst = st.inst.full || st.inst.short || '';
    info.items.forEach(function (it) {
      var r = it.rect, img = it.name && imgs.get(it.name);
      if (img) drawImg(ctx, img, r, crop(st, it.name));
      else if (it.kind === 'person' || it.kind === 'teacher') { ctx.fillStyle = d.ph; ctx.fillRect(r.x, r.y, r.w, r.h); }
      else if (o.preview) {
        ctx.fillStyle = '#f4f2f0'; ctx.fillRect(r.x, r.y, r.w, r.h); ctx.strokeStyle = '#c9c4be'; ctx.setLineDash([2, 2]); ctx.lineWidth = 0.4; ctx.strokeRect(r.x + .5, r.y + .5, r.w - 1, r.h - 1); ctx.setLineDash([]);
        fitText(ctx, 'фото', r.x + r.w / 2, r.y + r.h / 2, Math.min(r.w, r.h) * 0.12, r.w * 0.8, d.font, '#b5aea6');
      }
      if (it.kind === 'person' && it.caption) {
        var bh = Math.min(r.h * 0.15, 11), by = r.y + r.h - bh;
        ctx.fillStyle = d.band; ctx.fillRect(r.x, by, r.w, bh);
        fitText(ctx, it.caption.toUpperCase(), r.x + r.w / 2, by + bh * 0.64, bh * 0.4, r.w * 0.9, d.font, d.text, '400', 'center', 0.04);
      }
      if (it.kind === 'teacher') {
        var c = it.capRect, nm = it.caption.toUpperCase();
        fitText(ctx, nm, c.x + c.w / 2, c.y + c.h * (it.post ? 0.46 : 0.62), c.h * 0.36, c.w * 0.96, d.font, d.text, '600', 'center', 0.03);
        if (it.post) fitText(ctx, it.post, c.x + c.w / 2, c.y + c.h * 0.84, c.h * 0.24, c.w * 0.96, d.font, d.text, '400', 'center', 0.02);
      }
      if (it.kind === 'cover' && it.caption) {
        var cl = require_cover(W, H);
        fitText(ctx, it.caption.toUpperCase(), cl.name.x, cl.name.y - H * 0.025, H * 0.034, r.w * 1.1, d.font, d.text, '400', 'center', 0.1);
      }
    });
    if (sp.type === 'cover') {
      var cv = require_cover(W, H);
      if (yr) fitText(ctx, yr, cv.year.x, cv.year.y, cv.year.size, W * 0.5, d.fontLight, d.title, '200', 'right', 0.02);
      if (inst) fitText(ctx, inst.toUpperCase(), cv.name.x, cv.name.y, H * 0.02, W * 0.28, d.font, '#9a9a9a', '400', 'center', 0.08);
    }
    if (sp.type === 'first') {
      var fl = root.AlbumLayout.firstLayout(W, H);
      fitText(ctx, 'ВИПУСК ' + yr, fl.text.x, fl.text.y, H * 0.036, W * 0.4, d.font, d.text, '500', 'center', 0.12);
      if (inst) fitText(ctx, inst, fl.text.x, fl.text.y + H * 0.05, H * 0.026, W * 0.42, d.font, '#9a9a9a', '400', 'center', 0.04);
      ctx.strokeStyle = '#cfcfcf'; ctx.lineWidth = 0.35; ctx.beginPath(); ctx.moveTo(fl.text.x - W * 0.04, fl.text.y + H * 0.018); ctx.lineTo(fl.text.x + W * 0.04, fl.text.y + H * 0.018); ctx.stroke();
    }
    if (o.preview && sp.type === 'group' && !sp.slots.length) fitText(ctx, 'Додай групові фото: кнопка «Додати фото» або перетягни на полотно', W / 2, H / 2, H * 0.04, W * 0.8, d.font, '#b5aea6');
    if (o.preview) {
      var z = root.AlbumPrint.spreadSize(st.fmtId);
      if (o.guides) {
        ctx.lineWidth = 0.4; ctx.strokeStyle = 'rgba(224,70,70,.8)'; ctx.setLineDash([3, 2]); ctx.strokeRect(z.bleed, z.bleed, W - 2 * z.bleed, H - 2 * z.bleed);
        ctx.strokeStyle = 'rgba(70,120,224,.8)'; ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke(); ctx.setLineDash([]);
      }
      if (o.sel) info.items.forEach(function (it) {
        if (JSON.stringify(it.ref) === JSON.stringify(o.sel)) { ctx.strokeStyle = '#b9a0e6'; ctx.lineWidth = Math.max(0.8, 3 / o.pxPerMm); ctx.strokeRect(it.rect.x, it.rect.y, it.rect.w, it.rect.h); }
      });
    }
    ctx.restore();
    return info;
  }
  function require_cover(W, H) { return root.AlbumLayout.coverLayout(W, H); }
  root.AlbumRender = { draw: draw, crop: crop };
})(typeof self !== 'undefined' ? self : this);
