// Відео редактор: рушій ffmpeg.wasm (завантаження ядра, опис файлу, проксі для перегляду, виконання команд, скасування).
// Обгортка @ffmpeg/ffmpeg лежить у vendor/ffmpeg/ (MIT), ядро ffmpeg-core (≈32 МБ) вантажиться з CDN при першій потребі: див. vendor/README.md.
// Файл не копіюється в пам'ять: монтується через WORKERFS. Одна копія рушія на сторінку; після скасування створюється заново.
(function (root) {
  var CORE_VERSION = '0.12.10';
  var CORE_BASES = [
    'https://cdn.jsdelivr.net/npm/@ffmpeg/core@' + CORE_VERSION + '/dist/esm/',
    'https://unpkg.com/@ffmpeg/core@' + CORE_VERSION + '/dist/esm/'
  ];
  var ff = null, blobs = null, mounted = null, loading = null, logHook = null;

  // Завантаження файлу з прогресом (частка 0..1 або null, якщо розмір невідомий) у blob-адресу.
  async function fetchBlobURL(url, type, onFrac) {
    var res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    var len = +res.headers.get('content-length') || 0, got = 0, chunks = [], rd = res.body.getReader();
    for (;;) {
      var r = await rd.read();
      if (r.done) break;
      chunks.push(r.value); got += r.value.length;
      if (onFrac) onFrac(len ? Math.min(1, got / len) : null, got);
    }
    return URL.createObjectURL(new Blob(chunks, { type: type }));
  }

  // Створює рушій і вантажить ядро; onProgress(частка|null, текст).
  async function ensure(onProgress) {
    if (ff) return ff;
    if (loading) return loading;
    loading = (async function () {
      if (!blobs) {
        var lastErr;
        for (var i = 0; i < CORE_BASES.length && !blobs; i++) {
          try {
            var base = CORE_BASES[i];
            var js = await fetchBlobURL(base + 'ffmpeg-core.js', 'text/javascript');
            var wasm = await fetchBlobURL(base + 'ffmpeg-core.wasm', 'application/wasm', function (f, got) {
              if (onProgress) onProgress(f, 'Завантаження рушія: ' + (got / 1048576).toFixed(1) + ' МБ' + (f ? ' з ≈32 (' + Math.round(f * 100) + '%)' : ''));
            });
            blobs = { coreURL: js, wasmURL: wasm };
          } catch (e) { lastErr = e; }
        }
        if (!blobs) throw new Error('Не вдалося завантажити рушій ffmpeg (потрібен інтернет при першому запуску): ' + (lastErr && lastErr.message));
      }
      if (onProgress) onProgress(null, 'Запуск рушія…');
      var mod = await import('./vendor/ffmpeg/index.js');
      var inst = new mod.FFmpeg();
      inst.on('log', function (e) { if (logHook) logHook(e.message); });
      await inst.load(blobs);
      ff = inst; mounted = null;
      return ff;
    })();
    try { return await loading; } finally { loading = null; }
  }

  // Монтує файл як /in/in.<розширення> (без копіювання в пам'ять). Повертає шлях.
  async function mount(file, onProgress) {
    var inst = await ensure(onProgress);
    if (mounted && mounted.file === file) return mounted.path;
    var ext = (/\.([A-Za-z0-9]{1,5})$/.exec(file.name) || [0, 'bin'])[1].toLowerCase();
    var name = 'in.' + ext, wrapped = new File([file], name);
    try { await inst.unmount('/in'); } catch (e) { /* ще не змонтовано */ }
    try { await inst.createDir('/in'); } catch (e) { /* вже є */ }
    await inst.mount('WORKERFS', { files: [wrapped] }, '/in');
    mounted = { file: file, path: '/in/' + name };
    return mounted.path;
  }

  // Збирає журнал виконання команди.
  async function runLogged(args, onLine) {
    var text = '';
    logHook = function (m) { text += m + '\n'; if (onLine) onLine(m); };
    try { var code = await ff.exec(args); return { code: code, log: text }; } finally { logHook = null; }
  }

  // Опис файлу: тривалість, розмір кадру, чи є відео й звук.
  async function probe(file, onProgress) {
    var path = await mount(file, onProgress);
    var r = await runLogged(['-hide_banner', '-i', path, '-f', 'null', '-t', '0', '-']);
    return root.VECore.parseProbe(r.log);
  }

  // Легка копія для перегляду, якщо браузер не вміє грати оригінал (MKV, AVI, HEVC…). Повертає blob-адресу.
  async function makeProxy(file, info, onProgress) {
    var path = await mount(file);
    var args = ['-i', path];
    if (info.hasVideo) args.push('-vf', 'scale=-2:360,format=yuv420p', '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '32');
    else args.push('-vn');
    if (info.hasAudio) args.push('-c:a', 'aac', '-b:a', '96k'); else args.push('-an');
    var ext = info.hasVideo ? 'mp4' : 'm4a';
    args.push('-y', 'proxy.' + ext);
    await runLogged(args, function (line) {
      var t = root.VECore.parseProgressTime(line);
      if (t != null && info.duration && onProgress) onProgress(Math.min(1, t / info.duration));
    });
    var data = await ff.readFile('proxy.' + ext);
    try { await ff.deleteFile('proxy.' + ext); } catch (e) { /* не критично */ }
    return URL.createObjectURL(new Blob([data], { type: info.hasVideo ? 'video/mp4' : 'audio/mp4' }));
  }

  // Виконує підготовлену команду, повертає Blob. onProgress(частка 0..1).
  async function exportFile(file, plan, onProgress) {
    var path = await mount(file);
    var args = plan.args.slice(); args[args.indexOf('-i') + 1] = path;
    var r = await runLogged(args, function (line) {
      var t = root.VECore.parseProgressTime(line);
      if (t != null && plan.outDur && onProgress) onProgress(Math.min(0.99, t / plan.outDur));
    });
    if (r.code !== 0) {
      var tail = r.log.trim().split('\n').slice(-3).join(' | ');
      throw new Error('ffmpeg завершився з помилкою (код ' + r.code + '): ' + tail);
    }
    var data = await ff.readFile(plan.outFile);
    try { await ff.deleteFile(plan.outFile); } catch (e) { /* не критично */ }
    if (!data || !data.length) throw new Error('Результат порожній');
    return new Blob([data], { type: plan.mime });
  }

  // Зупиняє поточну роботу: рушій знищується й при наступному виклику створюється наново (ядро вже в пам'яті).
  function cancel() {
    if (ff) { try { ff.terminate(); } catch (e) { /* не критично */ } }
    ff = null; mounted = null; logHook = null;
  }

  root.VEEngine = { ensure: ensure, probe: probe, makeProxy: makeProxy, exportFile: exportFile, cancel: cancel, CORE_VERSION: CORE_VERSION };
})(window);
