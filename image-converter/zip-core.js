// Конвертер зображень: найпростіший ZIP без стиснення (картинки вже стиснуті). Працює в браузері та Node. Ліміт одного архіву ~4 ГБ, тому великі набори ділять на частини.
(function (root) {
  var T = null;
  function table() { if (T) return T; T = new Uint32Array(256); for (var n = 0; n < 256; n++) { var c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; T[n] = c >>> 0; } return T; }
  function crc32(u8) { var t = table(), c = 0xFFFFFFFF; for (var i = 0; i < u8.length; i++) c = t[(c ^ u8[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
  function dosTime(d) { return { t: (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1), d: ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate() }; }

  // entries: [{name, blob}] -> Promise<Blob>
  async function makeZip(entries, date) {
    var enc = new TextEncoder(), dt = dosTime(date || new Date()), parts = [], central = [], off = 0;
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i], nm = enc.encode(e.name), data = new Uint8Array(await e.blob.arrayBuffer()), crc = crc32(data), size = data.length;
      var lh = new DataView(new ArrayBuffer(30));
      lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true); lh.setUint16(8, 0, true);
      lh.setUint16(10, dt.t, true); lh.setUint16(12, dt.d, true); lh.setUint32(14, crc, true); lh.setUint32(18, size, true); lh.setUint32(22, size, true);
      lh.setUint16(26, nm.length, true); lh.setUint16(28, 0, true);
      parts.push(lh.buffer, nm, e.blob);
      var ch = new DataView(new ArrayBuffer(46));
      ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint16(8, 0x0800, true); ch.setUint16(10, 0, true);
      ch.setUint16(12, dt.t, true); ch.setUint16(14, dt.d, true); ch.setUint32(16, crc, true); ch.setUint32(20, size, true); ch.setUint32(24, size, true);
      ch.setUint16(28, nm.length, true); ch.setUint32(42, off, true);
      central.push(ch.buffer, nm);
      off += 30 + nm.length + size;
    }
    var cdSize = 0; central.forEach(function (p) { cdSize += p.byteLength !== undefined ? p.byteLength : p.length; });
    var end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true); end.setUint16(8, entries.length, true); end.setUint16(10, entries.length, true); end.setUint32(12, cdSize, true); end.setUint32(16, off, true);
    return new Blob(parts.concat(central, [end.buffer]), { type: 'application/zip' });
  }

  // Ділить записи на групи, щоб кожен архів був не більший за limit байтів (за замовчуванням ~1,5 ГБ).
  function splitEntries(entries, limit) {
    limit = limit || 1.5 * 1073741824;
    var groups = [], cur = [], sum = 0;
    entries.forEach(function (e) {
      if (cur.length && sum + e.blob.size > limit) { groups.push(cur); cur = []; sum = 0; }
      cur.push(e); sum += e.blob.size;
    });
    if (cur.length) groups.push(cur);
    return groups;
  }

  root.ZipCore = { crc32: crc32, makeZip: makeZip, splitEntries: splitEntries };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.ZipCore;
})(typeof window !== 'undefined' ? window : (typeof self !== 'undefined' ? self : globalThis));
