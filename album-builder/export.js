// Експорт: завантаження файлу, ZIP (без стиснення), PDF із JPEG-сторінками. Без залежностей.
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
      offs[b + 2] = len; put((b + 2) + ' 0 obj\n<< /Type /XObject /Subtype /Image /Width ' + p.w + ' /Height ' + p.h + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + p.jpeg.length + ' >>\nstream\n'); put(p.jpeg); put('\nendstream\nendobj\n');
    });
    var n = 3 + pages.length * 3, xr = len; put('xref\n0 ' + (n + 1) + '\n0000000000 65535 f \n');
    for (var i = 1; i <= n; i++) put(String(offs[i]).padStart(10, '0') + ' 00000 n \n');
    put('trailer\n<< /Size ' + (n + 1) + ' /Root 1 0 R >>\nstartxref\n' + xr + '\n%%EOF');
    return new Blob(chunks, { type: 'application/pdf' });
  }
  root.AlbumExport = { download: download, zip: zip, pdf: pdf };
})(typeof self !== 'undefined' ? self : this);
