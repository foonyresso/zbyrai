// Аудіо редактор: запис WAV (PCM 16/24 біт або float 32) з масивів каналів. Без DOM.
(function (root) {
  'use strict';
  function encodeWav(chs, sr, bits) {
    var nc = chs.length, n = chs[0].length, bps = bits / 8, dataLen = n * nc * bps;
    var buf = new ArrayBuffer(44 + dataLen), v = new DataView(buf), p = 0, i, c;
    function str(s) { for (var k = 0; k < s.length; k++) v.setUint8(p++, s.charCodeAt(k)); }
    str('RIFF'); v.setUint32(p, 36 + dataLen, true); p += 4; str('WAVE'); str('fmt ');
    v.setUint32(p, 16, true); p += 4; v.setUint16(p, bits === 32 ? 3 : 1, true); p += 2; v.setUint16(p, nc, true); p += 2;
    v.setUint32(p, sr, true); p += 4; v.setUint32(p, sr * nc * bps, true); p += 4; v.setUint16(p, nc * bps, true); p += 2; v.setUint16(p, bits, true); p += 2;
    str('data'); v.setUint32(p, dataLen, true); p += 4;
    for (i = 0; i < n; i++) for (c = 0; c < nc; c++) {
      var x = chs[c][i];
      if (bits === 32) { v.setFloat32(p, x, true); p += 4; continue; }
      x = x > 1 ? 1 : x < -1 ? -1 : x;
      if (bits === 16) { v.setInt16(p, Math.round(x * (x < 0 ? 32768 : 32767)), true); p += 2; }
      else { var q = Math.round(x * (x < 0 ? 8388608 : 8388607)); v.setUint8(p++, q & 255); v.setUint8(p++, (q >> 8) & 255); v.setUint8(p++, (q >> 16) & 255); }
    }
    return new Uint8Array(buf);
  }
  root.WavCore = { encodeWav: encodeWav };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.WavCore;
})(typeof self !== 'undefined' ? self : this);
