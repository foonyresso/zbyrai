// Малювання розвороту на canvas (одиниці — мм). Використовується і для перегляду, і для експорту.
(function (root) {
  var S = root.AlbumState;
  function crop(st, name) { var c = st.crops[name]; return c || (st.crops[name] = { z: 1, fx: 0.5, fy: 0.35 }); }
  function rrect(ctx, r, rad) {
    rad = Math.min(rad || 0, r.w / 2, r.h / 2); ctx.beginPath();
    if (rad > 0) { ctx.moveTo(r.x + rad, r.y); ctx.arcTo(r.x + r.w, r.y, r.x + r.w, r.y + r.h, rad); ctx.arcTo(r.x + r.w, r.y + r.h, r.x, r.y + r.h, rad); ctx.arcTo(r.x, r.y + r.h, r.x, r.y, rad); ctx.arcTo(r.x, r.y, r.x + r.w, r.y, rad); ctx.closePath(); }
    else ctx.rect(r.x, r.y, r.w, r.h);
  }
  function drawImg(ctx, img, r, c, rad) {
    var s = Math.max(r.w / img.naturalWidth, r.h / img.naturalHeight) * c.z, dw = img.naturalWidth * s, dh = img.naturalHeight * s;
    ctx.save(); rrect(ctx, r, rad); ctx.clip();
    ctx.drawImage(img, r.x - (dw - r.w) * c.fx, r.y - (dh - r.h) * c.fy, dw, dh); ctx.restore();
  }
  // Текст, що вміщується в maxW: спершу менший міжбуквений інтервал, потім стиснення по ширині до 85%, і лише тоді менший розмір.
  function fitText(ctx, text, x, y, size, maxW, font, color, weight, align, spacing) {
    ctx.save(); ctx.fillStyle = color; ctx.textAlign = align || 'center'; ctx.textBaseline = 'alphabetic';
    var s = size, sx = 1, ls = 'letterSpacing' in ctx; ctx.font = (weight || '400') + ' ' + s + 'px ' + font;
    if (ls) ctx.letterSpacing = (spacing || 0) * s + 'px';
    var w = ctx.measureText(text).width;
    if (w > maxW && ls && spacing) { ctx.letterSpacing = '0px'; w = ctx.measureText(text).width; }
    if (w > maxW) { sx = Math.max(0.85, maxW / w); w *= sx; }
    if (w > maxW) { s = s * maxW / w; ctx.font = (weight || '400') + ' ' + s + 'px ' + font; if (ls) ctx.letterSpacing = '0px'; w = maxW; }
    ctx.translate(x, y); ctx.scale(sx, 1); ctx.fillText(text, 0, 0); fitText.w = w; ctx.restore(); return s;
  }
  // Регістр напису: upper | title (Перша Велика в Слові) | lower | null (як є / типовий)
  function applyCase(t, mode, def) {
    mode = mode || def; t = String(t);
    if (mode === 'upper') return t.toUpperCase();
    if (mode === 'lower') return t.toLowerCase();
    if (mode === 'title') return t.toLowerCase().replace(/(^|[\s\-'’])(\S)/g, function (m, a, b) { return a + b.toUpperCase(); });
    return t;
  }
  // Фон розвороту: однотонний, градієнт або картинка (bg.type: color | gradient | image); без bg колір дизайну.
  function paintBg(ctx, W, H, bg, imgs, fallback) {
    ctx.fillStyle = fallback; ctx.fillRect(0, 0, W, H);
    if (!bg) return;
    if (bg.type === 'color') { ctx.fillStyle = bg.color || fallback; ctx.fillRect(0, 0, W, H); }
    else if (bg.type === 'gradient') {
      var a = (bg.angle || 0) * Math.PI / 180, dx = Math.cos(a), dy = Math.sin(a), half = (Math.abs(W * dx) + Math.abs(H * dy)) / 2, g = ctx.createLinearGradient(W / 2 - dx * half, H / 2 - dy * half, W / 2 + dx * half, H / 2 + dy * half);
      g.addColorStop(0, bg.color || '#ffffff'); g.addColorStop(1, bg.color2 || '#000000'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    } else if (bg.type === 'image') { var im = bg.image && imgs.get(bg.image); if (im) drawImg(ctx, im, { x: 0, y: 0, w: W, h: H }, { z: 1, fx: 0.5, fy: 0.5 }); }
  }
  function draw(ctx, st, si, numMap, imgs, o) {
    var info = S.slotsFor(st, si, numMap), d = info.design, W = info.W, H = info.H, sp = st.spreads[si], sb = info.z.sb;
    var FT = root.AlbumFonts, hits = []; info.texts = hits;
    if (st.font && FT && FT.stack(st.font)) d = Object.assign({}, d, { font: FT.stack(st.font), fontLight: FT.stack(st.font) });
    // Умовне «фото» для мініатюр вибору обкладинки: градієнт, боке й силует (щоб було видно, як дизайн лягає на справжнє фото)
  function sampleScene(ctx, r, k) {
    var pal = [['#a9bb98', '#5b7550'], ['#a9bfd3', '#617f9b'], ['#d9b9a0', '#8f6a55']][k % 3], g = ctx.createLinearGradient(0, r.y, 0, r.y + r.h), cx = r.x + r.w / 2, u = Math.min(r.w, r.h * 0.8);
    ctx.save(); ctx.beginPath(); ctx.rect(r.x, r.y, r.w, r.h); ctx.clip(); g.addColorStop(0, pal[0]); g.addColorStop(1, pal[1]); ctx.fillStyle = g; ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.fillStyle = 'rgba(255,255,255,.08)'; for (var i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(r.x + r.w * ((i * 0.37) % 1), r.y + r.h * ((i * 0.23 + 0.1) % 0.7), u * (0.08 + (i % 3) * 0.04), 0, 7); ctx.fill(); }
    ctx.fillStyle = '#efe9df'; ctx.beginPath(); ctx.ellipse(cx, r.y + r.h * 1.02, u * 0.5, u * 0.34, 0, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#e4b697'; ctx.fillRect(cx - u * 0.05, r.y + r.h * 0.6, u * 0.1, r.h * 0.2);
    ctx.fillStyle = '#5a3b26'; ctx.beginPath(); ctx.ellipse(cx, r.y + r.h * 0.47, u * 0.2, u * 0.26, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#e4b697'; ctx.beginPath(); ctx.ellipse(cx, r.y + r.h * 0.5, u * 0.14, u * 0.18, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#5a3b26'; ctx.beginPath(); ctx.ellipse(cx, r.y + r.h * 0.44, u * 0.16, u * 0.12, 0, Math.PI, 0); ctx.fill(); ctx.restore();
  }
  // Текст зі своїм шрифтом (st.tf[key]) і областю для клацання (hits)
    var fx = function (key, text, x, y, size, maxW, kind, color, weight, align, spacing, defCase) {
      var ov = st.ts && st.ts[key] || {}, f = st.tf && st.tf[key] && FT && FT.stack(st.tf[key]) || d[kind || 'font'] || FT && FT.stack(kind) || d.font, k = ov.scale || 1;
      return fitText(ctx, applyCase(text, defCase === 'as' ? null : ov.case, defCase), x, y, size * k, maxW * Math.max(1, k), f, ov.color || color, weight, align, spacing);
    };
    var tx = function (key, text, x, y, size, maxW, kind, color, weight, align, spacing, defCase) {
      var s = fx(key, text, x, y, size, maxW, kind, color, weight, align, spacing, defCase), w = fitText.w || maxW;
      hits.push({ key: key, rect: { x: x - w / 2 - 1, y: y - s * 1.05, w: w + 2, h: s * 1.4 } }); return s;
    };
    ctx.save(); ctx.setTransform(o.pxPerMm, 0, 0, o.pxPerMm, 0, 0);
    paintBg(ctx, W, H, sp.bg || st.bg, imgs, d.bg);
    var cvv = sp.type === 'cover' ? S.coverVar(st) : null, cg = null;
    if (cvv && !cvv.builtin) {
      var cl = root.AlbumLayout.coverLayout(W, H, sb, info.z, cvv);
      cg = { ctx: ctx, W: W, H: H, sb: sb, cx: cl.cx, x0: W / 2 + (info.z.spine || 0) / 2, x1: W - info.z.bleed, bx0: 0, bx1: W, tx: function (key, text) { var ov = st.cvText && st.cvText[cvv.id + ':' + key]; if (ov != null) text = ov; if (!text) return 0; arguments[1] = text; return tx.apply(null, arguments); }, fx: fx,
        ph: cl.photo, year: st.year || '', owner: info.ownerName, inst: st.inst.full || st.inst.short || '', get: function (key, def) { var ov = st.cvText && st.cvText[cvv.id + ':' + key]; return ov != null ? ov : def; }, t: function (s) { return s; }, t2: function (s) { return s; } };
      if (!sp.bg) { var vb = cvv.bg; if (Array.isArray(vb)) { var vg = ctx.createLinearGradient(0, 0, 0, H); vg.addColorStop(0, vb[0]); vg.addColorStop(1, vb[1]); ctx.fillStyle = vg; } else ctx.fillStyle = vb || '#ffffff'; ctx.fillRect(0, 0, W, H); }
      if (cvv.deco) { ctx.save(); cvv.deco(cg); ctx.restore(); }
    }
    var yr = st.year || '', inst = st.inst.full || st.inst.short || '';
    var drawItem = function (it) {
      var r = it.rect, img = it.name && imgs.get(it.name);
      var rad = sp.type === 'group' && it.kind === 'group' ? (sp.round != null ? sp.round : st.round || 0) : 0;
      if (it.rot) { drawPaper(ctx, img, it, st, o, d, rad); return; }
      if (it.shape) { ctx.save(); root.AlbumCoverVariants.shapePath(ctx, r, it.shape); ctx.clip(); }
      if (img) drawImg(ctx, img, r, crop(st, it.name), rad);
      else if (it.dark) { ctx.fillStyle = '#1f1f23'; rrect(ctx, r, rad); ctx.fill(); if (o.preview) fitText(ctx, 'фото', r.x + r.w / 2, r.y + r.h / 2, Math.min(r.w, r.h) * 0.1, r.w * 0.8, d.font, '#55555c'); }
      else if (it.kind === 'teacher') { ctx.fillStyle = d.ph; ctx.fillRect(r.x, r.y, r.w, r.h); }
      else if (o.sample && (it.kind === 'cover' || it.kind === 'group')) sampleScene(ctx, r, it.ref && it.ref.i || 0);
      else if (o.preview && !it.text) {
        ctx.fillStyle = '#f4f2f0'; ctx.fillRect(r.x, r.y, r.w, r.h); ctx.strokeStyle = '#c9c4be'; ctx.setLineDash([2, 2]); ctx.lineWidth = 0.4; ctx.strokeRect(r.x + .5, r.y + .5, r.w - 1, r.h - 1); ctx.setLineDash([]);
        fitText(ctx, it.kind === 'cell' ? 'клік: фото чи текст' : 'фото', r.x + r.w / 2, r.y + r.h / 2, Math.min(r.w, r.h) * 0.12, r.w * 0.8, d.font, '#b5aea6');
      }
      if (it.shape) ctx.restore();
      if (it.kind === 'cell' && it.text && it.text.p && root.AlbumPatterns) root.AlbumPatterns.draw(ctx, r, it.text.p, imgs);
      if (it.pivot) { ctx.strokeStyle = 'rgba(255,255,255,.92)'; ctx.lineWidth = 0.8; ctx.strokeRect(r.x, r.y, r.w, r.h); }
      if (it.kind === 'cell' && it.caption) {
        // підпис не заходить у безпечну зону: біля країв розвороту смуга довша, а текст зсунутий всередину
        var bh = Math.min(r.h * 0.15, 11), bot = Math.min(r.y + r.h, H - sb), by = bot - bh;
        // смуга тягнеться до краю розвороту, якщо клітинка біля нього: невідомо, де саме обріжеться
        var bx0 = r.x <= sb ? 0 : r.x, bx1 = r.x + r.w >= W - sb ? W : r.x + r.w, bb = r.y + r.h >= H - sb ? H : r.y + r.h, bw = bx1 - bx0, bhh = bb - by;
        if (img) {
          // біле матове скло: фото під смугою розмите строго в межах смуги
          ctx.save(); ctx.beginPath(); ctx.rect(r.x, by, r.w, Math.min(bb, r.y + r.h) - by); ctx.clip();
          if ('filter' in ctx) { ctx.filter = 'blur(' + Math.max(2, 2.2 * o.pxPerMm) + 'px)'; drawImg(ctx, img, r, crop(st, it.name), rad); ctx.filter = 'none'; }
          ctx.restore();
        }
        ctx.fillStyle = 'rgba(255,255,255,.58)'; ctx.fillRect(bx0, by, bw, bhh);
        var tx0 = Math.max(r.x, sb), tx1 = Math.min(r.x + r.w, W - sb);
        fx('cap', it.caption, (tx0 + tx1) / 2, by + bh * 0.64, bh * 0.4, (tx1 - tx0) * 0.92, 'font', d.text, '400', 'center', 0.04, 'upper');
      }
      if (it.kind === 'cell' && it.text && it.text.t) cellText(ctx, it, d, sb, W, H);
      if (it.kind === 'teacher') {
        var c = it.capRect, nm = it.caption.toUpperCase();
        fx('teach', it.caption, c.x + c.w / 2, c.y + c.h * (it.post ? 0.46 : 0.62), c.h * 0.36, c.w * 0.96, 'font', d.text, '600', 'center', 0.03, 'upper');
        if (it.post) fx('teach', it.post, c.x + c.w / 2, c.y + c.h * 0.84, c.h * 0.24, c.w * 0.96, 'font', d.text, '400', 'center', 0.02, 'as');
      }
    };
    info.items.forEach(function (it) {
      if (it.pivot) { ctx.save(); ctx.translate(it.pivot.x, it.pivot.y); ctx.rotate(it.tilt); ctx.translate(-it.pivot.x, -it.pivot.y); }
      drawItem(it);
      if (it.pivot) ctx.restore();
    });
    if (cg && cvv.over) { ctx.save(); cvv.over(cg); ctx.restore(); }
    if (cg && cvv.text) { ctx.save(); cvv.text(cg); ctx.restore(); }
    else if (sp.type === 'cover') {
      var cv = require_cover(W, H, sb, info.z);
      if (yr) tx('year', yr, cv.year.x, cv.year.y, cv.year.size, Math.min(cv.photo.w * 1.5, W * 0.4), 'fontLight', d.title, '200', 'center', 0.02);
      var ny = Math.min(cv.name.line, cv.name.y - H * 0.06);
      if (info.ownerName) tx('name', info.ownerName, cv.name.x, ny, H * 0.036, W * 0.34, 'font', d.text, '400', 'center', 0.1, 'upper');
      if (inst) tx('inst', inst, cv.name.x, ny + H * 0.055, H * 0.021, W * 0.34, 'font', '#9a9a9a', '400', 'center', 0.08, 'upper');
    }
    if (sp.type === 'first') {
      var fl = root.AlbumLayout.firstLayout(W, H, sb, root.AlbumLayout.pageCenters(W, info.z.bleed, info.z.safe).left);
      tx('title', 'Випуск ' + yr, fl.text.x, fl.text.y, H * 0.036, W * 0.4, 'font', d.text, '500', 'center', 0.12, 'upper');
      if (inst) tx('inst', inst, fl.text.x, fl.text.y + H * 0.048, H * 0.026, W * 0.42, 'font', '#9a9a9a', '400', 'center', 0.04);
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
        ctx.strokeStyle = 'rgba(70,120,224,.9)'; ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke();
        if (o.centers) {
          var pcn = root.AlbumLayout.pageCenters(W, z.bleed, z.safe);
          ctx.strokeStyle = 'rgba(70,180,120,.28)'; ctx.lineWidth = Math.max(0.2, 0.7 / o.pxPerMm); ctx.setLineDash([3, 2]);
          [pcn.left, pcn.right].forEach(function (x) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); });
          ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke();
          ctx.setLineDash([3, 2]); ctx.strokeStyle = 'rgba(70,120,224,.9)';
        }
        if (z.spine > 0 && sp.type === 'cover') { ctx.beginPath(); ctx.moveTo(W / 2 - z.spine / 2, 0); ctx.lineTo(W / 2 - z.spine / 2, H); ctx.moveTo(W / 2 + z.spine / 2, 0); ctx.lineTo(W / 2 + z.spine / 2, H); ctx.stroke(); }
        ctx.setLineDash([]);
      }
      if (o.sel && o.sel.t === 'text') hits.forEach(function (h) { if (h.key === o.sel.key) { ctx.strokeStyle = '#b9a0e6'; ctx.lineWidth = Math.max(0.6, 2 / o.pxPerMm); ctx.setLineDash([2, 1.5]); ctx.strokeRect(h.rect.x, h.rect.y, h.rect.w, h.rect.h); ctx.setLineDash([]); } });
      if (o.sel && o.sel.t === 'bg') { ctx.strokeStyle = '#b9a0e6'; ctx.lineWidth = Math.max(0.8, 3 / o.pxPerMm); ctx.setLineDash([4, 3]); ctx.strokeRect(1, 1, W - 2, H - 2); ctx.setLineDash([]); }
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
    var cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, w = x1 - x0, h = y1 - y0, size = Math.min(h / (lines.length + 1.2) * 0.55, w * 0.1) * (o.k || 1);
    ctx.save(); ctx.strokeStyle = '#c9c9c9'; ctx.lineWidth = 0.35;
    if (o.s === 'frame') ctx.strokeRect(x0 + w * 0.06, y0 + h * 0.06, w * 0.88, h * 0.88);
    if (o.s === 'ornament') { [-1, 1].forEach(function (sg) { var yy = cy + sg * (lines.length * size * 0.75 + h * 0.08); ctx.beginPath(); ctx.moveTo(cx - w * 0.22, yy); ctx.lineTo(cx + w * 0.22, yy); ctx.stroke(); ctx.beginPath(); ctx.arc(cx, yy, 0.9, 0, 6.3); ctx.stroke(); }); }
    ctx.restore();
    var cf = o.f && root.AlbumFonts && root.AlbumFonts.stack(o.f) || d.font;
    lines.forEach(function (ln, i) { fitText(ctx, applyCase(ln, o.case), cx, cy + (i - (lines.length - 1) / 2) * size * 1.5 + size * 0.35, size, w * 0.8 * Math.max(1, o.k || 1), cf, o.c || d.text, i ? '300' : '500', 'center', 0.1); });
  }
  // Фото «вклеєне в альбом»: біла рамка, тінь, невеликий нахил.
  // Шматочок скотчу із зубчастими краями: центр (x, y), кут ang, довжина len (мм)
  function tape(ctx, x, y, ang, len) {
    var h = len * 0.4, n = 6, a = h * 0.07;
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.beginPath(); ctx.moveTo(-len / 2, -h / 2); ctx.lineTo(len / 2, -h / 2);
    for (var k = 1; k <= n; k++) ctx.lineTo(len / 2 + (k % 2 ? a : -a), -h / 2 + h * k / n);
    ctx.lineTo(-len / 2, h / 2);
    for (var q = n - 1; q >= 0; q--) ctx.lineTo(-len / 2 + (q % 2 ? -a : a), -h / 2 + h * q / n);
    ctx.closePath(); ctx.fillStyle = 'rgba(244,234,176,.58)'; ctx.fill(); ctx.strokeStyle = 'rgba(180,160,90,.3)'; ctx.lineWidth = 0.15; ctx.stroke();
    ctx.restore();
  }
  // Фото «вклеєне в альбом»: біла рамка, тінь, невеликий нахил, шматочки скотчу на кутах; rad — скруглення кутів, мм.
  function drawPaper(ctx, img, it, st, o, d, rad) {
    var r = it.rect, b = Math.min(r.w, r.h) * 0.035, cx = r.x + r.w / 2, cy = r.y + r.h / 2, full = { x: -r.w / 2, y: -r.h / 2, w: r.w, h: r.h };
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(it.rot);
    ctx.shadowColor = 'rgba(0,0,0,.32)'; ctx.shadowBlur = 2.2 * o.pxPerMm; ctx.shadowOffsetX = 0.6 * o.pxPerMm; ctx.shadowOffsetY = 1 * o.pxPerMm;
    ctx.fillStyle = '#fff'; rrect(ctx, full, rad); ctx.fill(); ctx.shadowColor = 'transparent';
    var inner = { x: -r.w / 2 + b, y: -r.h / 2 + b, w: r.w - 2 * b, h: r.h - 2 * b }, ir = Math.max(0, (rad || 0) - b);
    if (img) drawImg(ctx, img, inner, crop(st, it.name), ir); else { ctx.fillStyle = '#f1eeea'; rrect(ctx, inner, ir); ctx.fill(); }
    var tl = Math.max(7, Math.min(15, Math.min(r.w, r.h) * 0.3));
    var tp = it.tape || ['tl', 'br'], hw = r.w / 2, hh = r.h / 2, e = tl * 0.2, f = tl * 0.1;
    if (tp.indexOf('tl') >= 0) tape(ctx, -hw + e, -hh + f, -0.75, tl); if (tp.indexOf('br') >= 0) tape(ctx, hw - e, hh - f, -0.75, tl);
    if (tp.indexOf('tr') >= 0) tape(ctx, hw - e, -hh + f, 0.75, tl); if (tp.indexOf('bl') >= 0) tape(ctx, -hw + e, hh - f, 0.75, tl);
    ctx.restore();
  }
  function require_cover(W, H, sb, z) { return root.AlbumLayout.coverLayout(W, H, sb, z); }
  root.AlbumRender = { draw: draw, crop: crop };
})(typeof self !== 'undefined' ? self : this);
