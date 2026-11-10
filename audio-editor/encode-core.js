// Аудіо редактор: формати експорту, допустимі бітрейти й частоти, аргументи для ffmpeg, оцінка ваги, імена файлів. Без DOM.
(function (root) {
  'use strict';
  var RATES_LOSSY = [8000, 11025, 12000, 16000, 22050, 24000, 32000, 44100, 48000];
  var RATES_LOSSLESS = RATES_LOSSY.concat([88200, 96000]);
  var KBPS = [64, 96, 128, 160, 192, 256, 320];
  // Vorbis кодується за якістю (VBR): бітрейт-режим libvorbis падає на низьких частотах, а якість працює завжди. Значення ≈ середній бітрейт для стерео 44.1 кГц.
  var OGG_Q = { 64: 0, 96: 2, 128: 4, 160: 5, 192: 6, 256: 8, 320: 9 };

  var FORMATS = {
    mp3: { name: 'MP3', ext: 'mp3', mime: 'audio/mpeg', lossy: true, kbps: KBPS, defKbps: 192, rates: RATES_LOSSY, note: 'Найпоширеніший формат: грає скрізь. Кодування через ffmpeg (завантажується при першому експорті).' },
    ogg: { name: 'OGG', ext: 'ogg', mime: 'audio/ogg', lossy: true, kbps: KBPS, defKbps: 160, rates: RATES_LOSSY, note: 'Vorbis: вільний формат, добрий для ігор і сайтів. Бітрейт приблизний (змінний, VBR). Кодування через ffmpeg.' },
    m4a: { name: 'M4A', ext: 'm4a', mime: 'audio/mp4', lossy: true, kbps: KBPS, defKbps: 192, rates: RATES_LOSSY, note: 'AAC у контейнері MP4: Apple, телефони, відео. Кодування через ffmpeg.' },
    flac: { name: 'FLAC', ext: 'flac', mime: 'audio/flac', lossy: false, bits: [16, 24], defBits: 16, rates: RATES_LOSSLESS, note: 'Без втрат: файл удвічі менший за WAV. Кодування через ffmpeg.' },
    wav: { name: 'WAV', ext: 'wav', mime: 'audio/wav', lossy: false, bits: [16, 24, 32], defBits: 16, rates: RATES_LOSSLESS, note: 'Без стиснення й без втрат (32 біти = float). Збирається прямо в браузері, ffmpeg не потрібен.' }
  };
  var ORDER = ['mp3', 'wav', 'ogg', 'm4a', 'flac'];
  var DEFAULTS = { fmt: 'mp3', kbps: 192, bits: 16, rate: 0, ch: 0 }; // rate 0 і ch 0 = як у джерелі

  // Найбільший бітрейт, який дозволяє MP3 для частоти (MPEG-2.5: ≤64, MPEG-2: ≤160, MPEG-1: ≤320).
  function maxKbps(fmt, rate) {
    if (fmt !== 'mp3') return 320;
    return rate <= 12000 ? 64 : rate <= 24000 ? 160 : 320;
  }
  // Частота результату: 0 = як у джерелі, а якщо формат її не підтримує, найближча допустима.
  function resolveRate(fmt, srcRate, want) {
    var list = FORMATS[fmt].rates, r = want || srcRate, best = list[0];
    list.forEach(function (x) { if (Math.abs(x - r) < Math.abs(best - r)) best = x; });
    return best;
  }
  function sanitize(o, srcRate) {
    var f = FORMATS[o.fmt] ? o.fmt : 'mp3', F = FORMATS[f], r = {};
    r.fmt = f;
    r.rate = resolveRate(f, srcRate, o.rate);
    r.ch = o.ch === 1 || o.ch === 2 ? o.ch : 0;
    if (F.lossy) {
      var k = F.kbps.indexOf(+o.kbps) >= 0 ? +o.kbps : F.defKbps, mx = maxKbps(f, r.rate);
      r.kbps = Math.min(k, mx);
    } else r.bits = F.bits.indexOf(+o.bits) >= 0 ? +o.bits : F.defBits;
    return r;
  }
  function fileName(base, fmt) {
    var b = String(base || 'audio').replace(/\.[^.\\/]{1,5}$/, '').replace(/[\\/:*?"<>|]+/g, '_').trim() || 'audio';
    return b + '-edit.' + FORMATS[fmt].ext;
  }
  function estimateBytes(o, dur, nch, rate) {
    var F = FORMATS[o.fmt];
    if (F.lossy) return o.kbps * 1000 / 8 * dur;
    var raw = rate * nch * o.bits / 8 * dur;
    return o.fmt === 'wav' ? raw + 44 : raw * 0.6;
  }
  function fmtBytes(b) { return b >= 1048576 ? (b / 1048576).toFixed(1) + ' МБ' : Math.max(1, Math.round(b / 1024)) + ' КБ'; }

  // Аргументи ffmpeg: вхід — WAV (float32) уже потрібної частоти й каналів, змонтований як inName.
  function buildArgs(o, inName, outName) {
    var a = ['-i', inName, '-vn', '-map_metadata', '-1'];
    if (o.fmt === 'mp3') a.push('-c:a', 'libmp3lame', '-b:a', o.kbps + 'k');
    else if (o.fmt === 'ogg') a.push('-c:a', 'libvorbis', '-q:a', String(OGG_Q[o.kbps] === undefined ? 4 : OGG_Q[o.kbps]));
    else if (o.fmt === 'm4a') a.push('-c:a', 'aac', '-b:a', o.kbps + 'k', '-movflags', '+faststart');
    else if (o.fmt === 'flac') a.push('-c:a', 'flac', '-compression_level', '8', '-sample_fmt', o.bits === 24 ? 's32' : 's16');
    a.push(outName);
    return a;
  }

  root.EncodeCore = { FORMATS: FORMATS, ORDER: ORDER, DEFAULTS: DEFAULTS, RATES_LOSSY: RATES_LOSSY, maxKbps: maxKbps, resolveRate: resolveRate, sanitize: sanitize, fileName: fileName, estimateBytes: estimateBytes, fmtBytes: fmtBytes, buildArgs: buildArgs };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.EncodeCore;
})(typeof self !== 'undefined' ? self : this);
