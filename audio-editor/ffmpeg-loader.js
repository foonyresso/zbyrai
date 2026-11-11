// Аудіо редактор: ледаче завантаження ffmpeg.wasm (лише коли потрібне кодування MP3/OGG/M4A/FLAC або нетиповий вхідний файл).
// Обгортка лежить у vendor/, ядро (~32 МБ) тягнеться з CDN й кешується в Cache API браузера. Інші інструменти не залежать від цього файлу.
// Для перевірки без інтернету ядро можна віддати з власного сервера: ?ffcore=/шлях/до/папки/ (там ffmpeg-core.js і ffmpeg-core.wasm).
(function (root) {
  'use strict';
  var CORE_VER = '0.12.10', CACHE = 'zb-ffmpeg-core-' + CORE_VER;
  var CDNS = ['https://cdn.jsdelivr.net/npm/@ffmpeg/core@' + CORE_VER + '/dist/umd/', 'https://unpkg.com/@ffmpeg/core@' + CORE_VER + '/dist/umd/'];
  var ff = null, loading = null, queue = Promise.resolve();

  function loadScript(src) {
    return new Promise(function (res, rej) { var s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = function () { rej(new Error('Не вдалося завантажити ' + src)); }; document.head.appendChild(s); });
  }
  // Завантажує файл із прогресом (байти) і кешем; повертає blob: URL.
  async function fetchBlobURL(url, type, onBytes) {
    var cache = null, resp = null;
    try { cache = await caches.open(CACHE); resp = await cache.match(url); } catch (e) { cache = null; }
    if (!resp) {
      var r = await fetch(url);
      if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + url);
      var total = +r.headers.get('content-length') || 0, got = 0, chunks = [], rd = r.body && r.body.getReader();
      if (rd) { for (;;) { var x = await rd.read(); if (x.done) break; chunks.push(x.value); got += x.value.length; if (onBytes) onBytes(got, total); } }
      else { chunks.push(new Uint8Array(await r.arrayBuffer())); got = chunks[0].length; if (onBytes) onBytes(got, got); }
      var blob = new Blob(chunks, { type: type });
      if (cache) { try { await cache.put(url, new Response(blob, { headers: { 'content-type': type } })); } catch (e) { /* кеш необов'язковий */ } }
      return URL.createObjectURL(blob);
    }
    return URL.createObjectURL(new Blob([await resp.arrayBuffer()], { type: type }));
  }
  function bases() {
    var q = /[?&]ffcore=([^&]+)/.exec(location.search);
    return q ? [decodeURIComponent(q[1]).replace(/\/?$/, '/')] : CDNS;
  }

  // onStatus(текст, частка 0..1 | null)
  function load(onStatus) {
    if (ff) return Promise.resolve(ff);
    if (loading) return loading;
    onStatus = onStatus || function () {};
    loading = (async function () {
      if (!root.FFmpegWASM) await loadScript('./vendor/ffmpeg.js');
      var list = bases(), err = null;
      for (var i = 0; i < list.length; i++) {
        try {
          onStatus('Завантажую ffmpeg (один раз, ~32 МБ)…', 0);
          var js = await fetchBlobURL(list[i] + 'ffmpeg-core.js', 'text/javascript');
          var wasm = await fetchBlobURL(list[i] + 'ffmpeg-core.wasm', 'application/wasm', function (g, t) { onStatus('Завантажую ffmpeg: ' + (g / 1048576).toFixed(1) + (t ? ' з ' + (t / 1048576).toFixed(1) : '') + ' МБ', t ? g / t : null); });
          var inst = new root.FFmpegWASM.FFmpeg();
          onStatus('Запускаю ffmpeg…', null);
          await inst.load({ coreURL: js, wasmURL: wasm });
          ff = inst; return ff;
        } catch (e) { err = e; if (root.console) console.warn('ffmpeg load', list[i], e); }
      }
      throw new Error('ffmpeg не завантажився (' + (err && (err.message || err)) + '). Перевір інтернет: MP3/OGG/M4A/FLAC кодуються через ffmpeg; WAV працює без нього.');
    })();
    loading.catch(function () { loading = null; });
    return loading;
  }

  // Послідовна черга: ffmpeg одночасно виконує одне завдання.
  function serial(fn) { var p = queue.then(fn, fn); queue = p.catch(function () {}); return p; }

  // Кодує WAV-байти в потрібний формат. enc — EncodeCore.buildArgs; повертає Uint8Array.
  function encode(wavBytes, o, onStatus, onProgress) {
    return serial(async function () {
      var inst = await load(onStatus), E = root.EncodeCore, inName = 'in.wav', outName = 'out.' + E.FORMATS[o.fmt].ext;
      var cb = function (e) { if (onProgress) onProgress(Math.max(0, Math.min(1, e.progress))); };
      inst.on('progress', cb);
      try {
        await inst.writeFile(inName, wavBytes);
        var code = await inst.exec(E.buildArgs(o, inName, outName));
        if (code !== 0) throw new Error('ffmpeg завершився з кодом ' + code);
        var data = await inst.readFile(outName);
        return data;
      } finally {
        inst.off('progress', cb);
        try { await inst.deleteFile(inName); } catch (e) { /* ignore */ }
        try { await inst.deleteFile(outName); } catch (e) { /* ignore */ }
      }
    });
  }

  // Запасне декодування нетипових файлів (і відео з доріжкою звуку) у WAV 16 біт.
  function decodeToWav(bytes, name, onStatus) {
    return serial(async function () {
      var inst = await load(onStatus), inName = 'src.' + ((/\.([a-z0-9]{1,5})$/i.exec(name || '') || [0, 'bin'])[1]), outName = 'dec.wav';
      try {
        await inst.writeFile(inName, bytes);
        var code = await inst.exec(['-i', inName, '-vn', '-c:a', 'pcm_s16le', outName]);
        if (code !== 0) throw new Error('ffmpeg не зміг прочитати файл');
        return await inst.readFile(outName);
      } finally {
        try { await inst.deleteFile(inName); } catch (e) { /* ignore */ }
        try { await inst.deleteFile(outName); } catch (e) { /* ignore */ }
      }
    });
  }

  root.AudioFF = { load: load, encode: encode, decodeToWav: decodeToWav };
})(window);
