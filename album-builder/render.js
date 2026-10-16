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
    var info = S.slotsFor(st, si, numMap), d = info.design, W = info.W, H = info.H, sp = st.spreads[si], sb = info.z.sb;
    ctx.save(); ctx.setTransform(o.pxPerMm, 0, 0, o.pxPerMm, 0, 0);
    ctx.fillStyle = d.bg; ctx.fillRect(0, 0, W, H);
    var yr = st.year || '', inst = st.inst.full || st.inst.short || '';
    info.items.forEach(function (it) {
      var r = it.rect, img = it.name && imgs.get(it.name);
      if (img) drawImg(ctx, img, r, crop(st, it.name));
      else if (it.kind === 'teacher') { ctx.fillStyle = d.ph; ctx.fillRect(r.x, r.y, r.w, r.h); }
      else if (o.preview && !it.text) {
        ctx.fillStyle = '#f4f2f0'; ctx.fillRect(r.x, r.y, r.w, r.h); ctx.strokeStyle = '#c9c4be'; ctx.setLineDash([2, 2]); ctx.lineWidth = 0.4; ctx.strokeRect(r.x + .5, r.y + .5, r.w - 1, r.h - 1); ctx.setLineDash([]);
        fitText(ctx, it.kind === 'cell' ? 'клік: фото чи текст' : 'фото', r.x + r.w / 2, r.y + r.h / 2, Math.min(r.w, r.h) * 0.12, r.w * 0.8, d.font, '#b5aea6');
      }
      if (it.kind === 'cell' && it.caption) {
        // підпис не заходить у безпечну зону: біля країв розвороту смуга довша, а текст зсунутий всередину
        var bh = Math.min(r.h * 0.15, 11), bot = Math.min(r.y + r.h, H - sb), by = bot - bh;
        ctx.fillStyle = d.band; ctx.fillRect(r.x, by, r.w, r.y + r.h - by);
        var tx0 = Math.max(r.x, sb), tx1 = Math.min(r.x + r.w, W - sb);
        fitText(ctx, it.caption.toUpperCase(), (tx0 + tx1) / 2, by + bh * 0.64, bh * 0.4, (tx1 - tx0) * 0.92, d.font, d.text, '400', 'center', 0.04);
      }
      if (it.kind === 'cell' && it.text) cellText(ctx, it, d, sb, W, H);
      if (it.kind === 'teacher') {
        var c = it.capRect, nm = it.caption.toUpperCase();
        fitText(ctx, nm, c.x + c.w / 2, c.y + c.h * (it.post ? 0.46 : 0.62), c.h * 0.36, c.w * 0.96, d.font, d.text, '600', 'center', 0.03);
        if (it.post) fitText(ctx, it.post, c.x + c.w / 2, c.y + c.h * 0.84, c.h * 0.24, c.w * 0.96, d.font, d.text, '400', 'center', 0.02);
      }
    });
    if (sp.type === 'cover') {
      var cv = require_cover(W, H, sb);
      if (yr) fitText(ctx, yr, cv.year.x, cv.year.y, cv.year.size, W * 0.5, d.fontLight, d.title, '200', 'right', 0.02);
      if (info.ownerName) fitText(ctx, info.ownerName.toUpperCase(), cv.name.x, cv.name.y - H * 0.03, H * 0.034, W * 0.3, d.font, d.text, '400', 'center', 0.1);
      if (inst) fitText(ctx, inst.toUpperCase(), cv.name.x, cv.name.y, H * 0.02, W * 0.3, d.font, '#9a9a9a', '400', 'center', 0.08);
    }
    if (sp.type === 'first') {
      var fl = root.AlbumLayout.firstLayout(W, H, sb);
      fitText(ctx, 'ВИПУСК ' + yr, fl.text.x, fl.text.y, H * 0.036, W * 0.4, d.font, d.text, '500', 'center', 0.12);
      if (inst) fitText(ctx, inst, fl.text.x, fl.text.y + H * 0.048, H * 0.026, W * 0.42, d.font, '#9a9a9a', '400', 'center', 0.04);
      ctx.strokeStyle = '#cfcfcf'; ctx.lineWidth = 0.35; ctx.beginPath(); ctx.moveTo(fl.text.x - W * 0.04, fl.text.y + H * 0.018); ctx.lineTo(fl.text.x + W * 0.04, fl.text.y + H * 0.018); ctx.stroke();
    }
    if (o.preview && sp.type === 'group' && !sp.slots.length) fitText(ctx, 'Додай групові фото: кнопка «Додати фото» або перетягни на полотно', W / 2, H / 2, H * 0.04, W * 0.8, d.font, '#b5aea6');
    if (o.preview) {
      var z = info.z;
      if (o.guides) {
        var bl = z.bleed, sf = z.sb;
        ctx.fillStyle = 'rgba(224,70,70,.22)';
        ctx.fillRect(0, 0, W, bl); ctx.fillRect(0, H - bl, W, bl); ctx.fillRect(0, bl, bl, H - 2 * bl); ctx.fillRect(W - bl, bl, bl, H - 2 * bl);
        ctx.lineWidth = Math.max(0.3, 1.2 / o.pxPerMm); ctx.setLineDash([3, 2]);
        ctx.strokeStyle = 'rgba(224,70,70,.95)'; ctx.strokeRect(bl, bl, W - 2 * bl, H - 2 * bl);
        ctx.strokeStyle = 'rgba(240,160,40,.95)'; ctx.strokeRect(sf, sf, W - 2 * sf, H - 2 * sf);
        ctx.strokeStyle = 'rgba(70,120,224,.9)'; ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke(); ctx.setLineDash([]);
      }
      if (o.sel) info.items.forEach(function (it) {
        if (JSON.stringify(it.ref) === JSON.stringify(o.sel)) { ctx.strokeStyle = '#b9a0e6'; ctx.lineWidth = Math.max(0.8, 3 / o.pxPerMm); ctx.strokeRect(it.rect.x, it.rect.y, it.rect.w, it.rect.h); }
      });
    }
    ctx.restore();
    return info;
  }
  // Текст у порожній клітинці: рядки по центру; стилі: plain, ornament (лінії зверху й знизу), frame (тонка рамка).
  function cellText(ctx, it, d, sb, W, H) {
    var r = it.rect, o = it.text, lines = String(o.t).split('\n'), x0 = Math.max(r.x, sb), x1 = Math.min(r.x + r.w, W - sb), y0 = Math.max(r.y, sb), y1 = Math.min(r.y + r.h, H - sb);
    var cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, w = x1 - x0, h = y1 - y0, size = Math.min(h / (lines.length + 1.2) * 0.55, w * 0.1);
    ctx.save(); ctx.strokeStyle = '#c9c9c9'; ctx.lineWidth = 0.35;
    if (o.s === 'frame') ctx.strokeRect(x0 + w * 0.06, y0 + h * 0.06, w * 0.88, h * 0.88);
    if (o.s === 'ornament') { [-1, 1].forEach(function (sg) { var yy = cy + sg * (lines.length * size * 0.75 + h * 0.08); ctx.beginPath(); ctx.moveTo(cx - w * 0.22, yy); ctx.lineTo(cx + w * 0.22, yy); ctx.stroke(); ctx.beginPath(); ctx.arc(cx, yy, 0.9, 0, 6.3); ctx.stroke(); }); }
    ctx.restore();
    lines.forEach(function (ln, i) { fitText(ctx, ln, cx, cy + (i - (lines.length - 1) / 2) * size * 1.5 + size * 0.35, size, w * 0.8, d.font, d.text, i ? '300' : '500', 'center', 0.1); });
  }
  function require_cover(W, H, sb) { return root.AlbumLayout.coverLayout(W, H, sb); }
  root.AlbumRender = { draw: draw, crop: crop };
})(typeof self !== 'undefined' ? self : this);
