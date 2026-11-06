// Експорт: завантаження файлу, ZIP (без стиснення), PDF із JPEG-сторінками; усюди вбудовується профіль sRGB IEC61966-2.1. Без залежностей.
(function (root) {
  function download(blob, name) {
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }
  var tbl = null;
  function crc32(u8) {
    if (!tbl) { tbl = new Uint32Array(256); for (var n = 0; n < 256; n++) { var c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; tbl[n] = c >>> 0; } }
    var r = 0xFFFFFFFF; for (var i = 0; i < u8.length; i++) r = tbl[(r ^ u8[i]) & 255] ^ (r >>> 8); return (r ^ 0xFFFFFFFF) >>> 0;
  }
  function u16(n) { return [n & 255, (n >>> 8) & 255]; }
  function u32(n) { return [n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255]; }
  // ---- ICC: вбудовування профілю sRGB IEC61966-2.1 (друкарні приймають лише його) ----
  function iccBytes() {
    if (typeof Buffer !== 'undefined') return new Uint8Array(Buffer.from(root.AlbumICC, 'base64'));
    var b = atob(root.AlbumICC), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u;
  }
  function cat(list) { var n = 0; list.forEach(function (a) { n += a.length; }); var o = new Uint8Array(n), p = 0; list.forEach(function (a) { o.set(a, p); p += a.length; }); return o; }
  // JPEG: APP2 «ICC_PROFILE» одразу після SOI (старий APP2/ICC і APP1/Adobe не чіпаємо, крім наявного ICC)
  function iccJpeg(u8) {
    var prof = iccBytes(), id = new TextEncoder().encode('ICC_PROFILE\0'), len = 2 + id.length + 2 + prof.length;
    var seg = cat([new Uint8Array([0xFF, 0xE2, len >> 8, len & 255]), id, new Uint8Array([1, 1]), prof]);
    var out = [u8.subarray(0, 2)], p = 2;
    while (p + 4 <= u8.length && u8[p] === 0xFF && u8[p + 1] >= 0xE0 && u8[p + 1] <= 0xEF) { // пропускаємо APPn, викидаємо чужий ICC
      var l = (u8[p + 2] << 8) | u8[p + 3], isIcc = u8[p + 1] === 0xE2 && String.fromCharCode.apply(null, u8.subarray(p + 4, p + 15)) === 'ICC_PROFILE';
      if (!isIcc) out.push(u8.subarray(p, p + 2 + l)); p += 2 + l;
    }
    // APP0 (JFIF) має бути першим, тож ICC ставимо після нього
    out.splice(out.length > 1 && u8[2] === 0xFF && u8[3] === 0xE0 ? 2 : 1, 0, seg);
    out.push(u8.subarray(p)); return cat(out);
  }
  function adler(u8) { var a = 1, b = 0; for (var i = 0; i < u8.length; i++) { a = (a + u8[i]) % 65521; b = (b + a) % 65521; } return ((b << 16) | a) >>> 0; }
  function be32(n) { return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255]; }
  // PNG: чанк iCCP (zlib без стиснення) одразу після IHDR; sRGB/gAMA/cHRM/iCCP, що були, прибираємо
  function iccPng(u8) {
    var prof = iccBytes(), nm = new TextEncoder().encode('sRGB IEC61966-2.1'), z = [0x78, 1];
    for (var o = 0; o < prof.length; o += 65535) { var n = Math.min(65535, prof.length - o); z.push(o + n >= prof.length ? 1 : 0, n & 255, n >> 8, (~n) & 255, ((~n) >> 8) & 255); for (var i = 0; i < n; i++) z.push(prof[o + i]); }
    var data = cat([nm, new Uint8Array([0, 0]), new Uint8Array(z.concat(be32(adler(prof))))]);
    var body = cat([new TextEncoder().encode('iCCP'), data]);
    var chunk = cat([new Uint8Array(be32(data.length)), body, new Uint8Array(be32(crc32(body)))]);
    var out = [u8.subarray(0, 8)], p = 8, done = false;
    while (p < u8.length) {
      var l = ((u8[p] << 24) | (u8[p + 1] << 16) | (u8[p + 2] << 8) | u8[p + 3]) >>> 0, t = String.fromCharCode(u8[p + 4], u8[p + 5], u8[p + 6], u8[p + 7]), e = p + 12 + l;
      if (t !== 'iCCP' && t !== 'sRGB' && t !== 'gAMA' && t !== 'cHRM') out.push(u8.subarray(p, e));
      if (t === 'IHDR' && !done) { out.push(chunk); done = true; } p = e;
    }
    return cat(out);
  }
  // Blob (image/jpeg | image/png) → Promise<Blob> з вбудованим профілем
  function tagBlob(blob) {
    return blob.arrayBuffer().then(function (ab) {
      var u = new Uint8Array(ab); return new Blob([blob.type === 'image/png' ? iccPng(u) : iccJpeg(u)], { type: blob.type });
    });
  }
  // files: [{name, data:Uint8Array}] → Blob zip
  function zip(files) {
    var enc = new TextEncoder(), parts = [], cen = [], off = 0;
    files.forEach(function (f) {
      var nm = enc.encode(f.name), crc = crc32(f.data), h = new Uint8Array([0x50, 0x4b, 3, 4, 20, 0, 0, 8, 0, 0, 0, 0, 0x21, 0].concat(u32(crc), u32(f.data.length), u32(f.data.length), u16(nm.length), [0, 0]));
      parts.push(h, nm, f.data);
      cen.push(new Uint8Array([0x50, 0x4b, 1, 2, 20, 0, 20, 0, 0, 8, 0, 0, 0, 0, 0x21, 0].concat(u32(crc), u32(f.data.length), u32(f.data.length), u16(nm.length), [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], u32(off))), nm);
      off += h.length + nm.length + f.data.length;
    });
    var cl = 0; cen.forEach(function (c) { cl += c.length; });
    parts = parts.concat(cen, [new Uint8Array([0x50, 0x4b, 5, 6, 0, 0, 0, 0].concat(u16(files.length), u16(files.length), u32(cl), u32(off), [0, 0]))]);
    return new Blob(parts, { type: 'application/zip' });
  }
  // pages: [{jpeg:Uint8Array, w, h (px), wMm, hMm}] → Blob pdf
  function pdf(pages) {
    var enc = new TextEncoder(), chunks = [], offs = [], len = 0;
    function put(x) { var u = typeof x === 'string' ? enc.encode(x) : x; chunks.push(u); len += u.length; }
    function obj(n, body) { offs[n] = len; put(n + ' 0 obj\n'); put(body); put('\nendobj\n'); }
    put('%PDF-1.4\n');
    var kids = pages.map(function (_, i) { return (4 + i * 3) + ' 0 R'; }).join(' ');
    obj(1, '<< /Type /Catalog /Pages 2 0 R >>'); obj(3, '<< >>'); obj(2, '<< /Type /Pages /Kids [' + kids + '] /Count ' + pages.length + ' >>');
    pages.forEach(function (p, i) {
      var b = 3 + i * 3 + 1, wp = (p.wMm / 25.4 * 72).toFixed(2), hp = (p.hMm / 25.4 * 72).toFixed(2), cs = 'q ' + wp + ' 0 0 ' + hp + ' 0 0 cm /Im0 Do Q';
      obj(b, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + wp + ' ' + hp + '] /Contents ' + (b + 1) + ' 0 R /Resources << /XObject << /Im0 ' + (b + 2) + ' 0 R >> >> >>');
      obj(b + 1, '<< /Length ' + cs.length + ' >>\nstream\n' + cs + '\nendstream');
      offs[b + 2] = len; put((b + 2) + ' 0 obj\n<< /Type /XObject /Subtype /Image /Width ' + p.w + ' /Height ' + p.h + ' /ColorSpace [/ICCBased ' + (3 + pages.length * 3 + 1) + ' 0 R] /BitsPerComponent 8 /Filter /DCTDecode /Length ' + p.jpeg.length + ' >>\nstream\n'); put(p.jpeg); put('\nendstream\nendobj\n');
    });
    var n = 3 + pages.length * 3 + 1, icc = iccBytes(); offs[n] = len; put(n + ' 0 obj\n<< /N 3 /Alternate /DeviceRGB /Length ' + icc.length + ' >>\nstream\n'); put(icc); put('\nendstream\nendobj\n');
    var xr = len; put('xref\n0 ' + (n + 1) + '\n0000000000 65535 f \n');
    for (var i = 1; i <= n; i++) put(String(offs[i]).padStart(10, '0') + ' 00000 n \n');
    put('trailer\n<< /Size ' + (n + 1) + ' /Root 1 0 R >>\nstartxref\n' + xr + '\n%%EOF');
    return new Blob(chunks, { type: 'application/pdf' });
  }
  root.AlbumExport = { download: download, zip: zip, pdf: pdf, tagBlob: tagBlob, iccJpeg: iccJpeg, iccPng: iccPng };
})(typeof self !== 'undefined' ? self : this);
