// Аудіо редактор: визначає рідну частоту дискретизації файлу (WAV, FLAC, MP3, OGG Vorbis) за заголовком, щоб декодувати без зайвого перерахунку. Без DOM.
(function (root) {
  'use strict';
  var MP3 = { 3: [44100, 48000, 32000], 2: [22050, 24000, 16000], 0: [11025, 12000, 8000] };
  function str(b, o, n) { var s = ''; for (var i = 0; i < n && o + i < b.length; i++) s += String.fromCharCode(b[o + i]); return s; }
  var BR1 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0], BR2 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0];
  function mp3Frame(b, i) {
    if (i + 4 > b.length || b[i] !== 0xFF || (b[i + 1] & 0xE0) !== 0xE0) return null;
    var ver = (b[i + 1] >> 3) & 3, layer = (b[i + 1] >> 1) & 3, br = (b[i + 2] >> 4) & 15, ix = (b[i + 2] >> 2) & 3;
    if (!MP3[ver] || ix > 2 || layer !== 1 || br === 0 || br === 15) return null; // лише Layer III
    var rate = MP3[ver][ix], kbps = (ver === 3 ? BR1 : BR2)[br], len = Math.floor((ver === 3 ? 144 : 72) * kbps * 1000 / rate) + ((b[i + 2] >> 1) & 1);
    return { rate: rate, len: len };
  }
  // b — початок файлу (достатньо ~64 КБ). Повертає частоту в Гц або 0, якщо невідомо.
  function sampleRate(b) {
    if (b.length < 32) return 0;
    if (str(b, 0, 4) === 'RIFF' && str(b, 8, 4) === 'WAVE') {
      for (var p = 12; p + 8 < b.length;) {
        var id = str(b, p, 4), sz = b[p + 4] | b[p + 5] << 8 | b[p + 6] << 16 | b[p + 7] << 24;
        if (id === 'fmt ') return (b[p + 12] | b[p + 13] << 8 | b[p + 14] << 16 | b[p + 15] << 24) >>> 0;
        p += 8 + sz + (sz & 1); if (sz < 0) break;
      }
      return 0;
    }
    if (str(b, 0, 4) === 'fLaC') return (b[18] << 12) | (b[19] << 4) | (b[20] >> 4);
    if (str(b, 0, 4) === 'OggS') {
      var head = str(b, 0, Math.min(b.length, 400)), k = head.indexOf('\x01vorbis');
      if (k >= 0 && k + 16 < b.length) return (b[k + 12] | b[k + 13] << 8 | b[k + 14] << 16 | b[k + 15] << 24) >>> 0;
      return 0;
    }
    if (str(b, 4, 4) === 'ftyp') return 0; // MP4/M4A: частоту визначить декодер
    var o = 0;
    if (str(b, 0, 3) === 'ID3') o = 10 + ((b[6] & 127) << 21 | (b[7] & 127) << 14 | (b[8] & 127) << 7 | (b[9] & 127));
    for (var i = o; i < Math.min(b.length - 4, o + 4096); i++) {
      var f = mp3Frame(b, i);
      // справжній кадр MP3: далі за його довжиною стоїть ще один такий самий заголовок (відсікає випадкові збіги)
      if (f && (i + f.len + 4 > b.length || (mp3Frame(b, i + f.len) && mp3Frame(b, i + f.len).rate === f.rate))) return f.rate;
    }
    return 0;
  }
  root.SniffCore = { sampleRate: sampleRate };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.SniffCore;
})(typeof self !== 'undefined' ? self : this);
