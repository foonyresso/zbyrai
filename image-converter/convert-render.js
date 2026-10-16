// Конвертер зображень: малювання кадру й кодування у вибраний формат. Працює і у Web Worker (OffscreenCanvas), і на головному потоці (звичайне полотно).
(function (root) {
  function toBlob(c, type, q) {
    if (c.convertToBlob) return c.convertToBlob({ type: type, quality: q });
    return new Promise(function (res) { c.toBlob(res, type, q); });
  }

  // Кодує полотно; з обмеженням ваги (maxBytes) двійковим пошуком добирає найвищу якість, що влізає.
  async function encode(c, job) {
    var q = job.lossy ? job.quality : undefined;
    var blob = await toBlob(c, job.type, q);
    if (!job.lossy || !job.maxBytes || blob.size <= job.maxBytes) return { blob: blob, over: false };
    var lo = 0.05, hi = job.quality, best = null;
    for (var i = 0; i < 7; i++) {
      var mid = (lo + hi) / 2, b = await toBlob(c, job.type, mid);
      if (b.size <= job.maxBytes) { best = b; lo = mid; } else hi = mid;
    }
    if (best) return { blob: best, over: false };
    return { blob: await toBlob(c, job.type, 0.05), over: true };
  }

  // src — ImageBitmap (вже з урахуванням EXIF-повороту); job: {sx,sy,sw,sh,w,h,type,quality,lossy,maxBytes,bg,alpha}; mk(w,h) створює полотно.
  async function render(src, job, mk) {
    var cw = job.sw, ch = job.sh, cur = src, sx = job.sx, sy = job.sy, tmp;
    // Велике зменшення робимо кроками вдвічі: так краще збереження дрібних деталей.
    while (cw / 2 > job.w && ch / 2 > job.h) {
      var nw = Math.max(1, Math.round(cw / 2)), nh = Math.max(1, Math.round(ch / 2));
      tmp = mk(nw, nh); var tc = tmp.getContext('2d'); tc.imageSmoothingQuality = 'high';
      tc.drawImage(cur, sx, sy, cw, ch, 0, 0, nw, nh);
      cur = tmp; sx = 0; sy = 0; cw = nw; ch = nh;
    }
    var c = mk(job.w, job.h), ctx = c.getContext('2d');
    if (!job.alpha) { ctx.fillStyle = job.bg || '#ffffff'; ctx.fillRect(0, 0, job.w, job.h); }
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(cur, sx, sy, cw, ch, 0, 0, job.w, job.h);
    var r = await encode(c, job);
    return { blob: r.blob, over: r.over, w: job.w, h: job.h };
  }

  async function decode(file) {
    try { return await createImageBitmap(file, { imageOrientation: 'from-image' }); }
    catch (e) { return await createImageBitmap(file); }
  }

  root.ConvertRender = { render: render, decode: decode };
})(typeof window !== 'undefined' ? window : self);
