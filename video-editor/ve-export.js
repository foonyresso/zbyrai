// Відео редактор: вікно експорту (прогрес, скасування, перегляд і завантаження результату) і запуск ffmpeg.
(function (root) {
  function init(ctx) {
    var C = ctx.C, $ = ctx.$, S = ctx.S, resultUrl = null, running = false, cancelled = false;
    function show(o) {
      $('job').hidden = false; $('jobTitle').textContent = o.title; $('jobTxt').textContent = o.txt || '';
      var m = $('job').querySelector('.meter'); m.classList.toggle('ind', o.frac == null && !o.done); $('jobBar').style.width = o.done ? '100%' : o.frac == null ? '' : Math.round(o.frac * 100) + '%';
      $('jobCancel').hidden = !!o.done || !!o.err; $('jobClose').hidden = !(o.done || o.err); $('jobDl').hidden = !o.done;
    }
    function clearResult() { if (resultUrl) { URL.revokeObjectURL(resultUrl); resultUrl = null; } $('jobPrev').textContent = ''; }
    function preview(blob, fmt) {
      var P = $('jobPrev'), el;
      if (fmt === 'gif') { el = document.createElement('img'); } else if (fmt === 'mp3') { el = document.createElement('audio'); el.controls = true; } else { el = document.createElement('video'); el.controls = true; el.playsInline = true; }
      el.src = resultUrl; P.textContent = ''; P.appendChild(el);
    }

    async function run() {
      if (!S.file || running) return;
      if (location.protocol === 'file:') return ctx.toast('Експорт працює лише зі сторінки сайту (http/https), не з файлу на диску');
      var ex = ctx.getExportOpts(), name = ctx.exportName();
      running = true; cancelled = false; clearResult(); ctx.player.pause();
      show({ title: 'Експорт: ' + name, txt: 'Готую рушій…' });
      try {
        await VEEngine.ensure(function (f, txt) { show({ title: 'Експорт: ' + name, txt: txt, frac: f }); });
        if (!S.info.probed) { show({ title: 'Експорт: ' + name, txt: 'Читаю доріжки файлу…' }); var p = await VEEngine.probe(S.file); S.info.hasAudio = p.hasAudio; S.info.probed = true; }
        var plan = C.buildExport({ segs: S.segs, master: S.master, mute: S.mute, crop: S.crop, srcW: S.info.w, srcH: S.info.h, hasVideo: S.info.hasVideo, hasAudio: S.info.hasAudio,
          fmt: ex.fmt, quality: ex.quality, size: ex.size, fps: ex.fps, kbps: ex.kbps, input: '/in/x' });
        var t0 = Date.now();
        var blob = await VEEngine.exportFile(S.file, plan, function (f) {
          var el = (Date.now() - t0) / 1000, eta = f > 0.03 ? Math.round(el / f - el) : null;
          show({ title: 'Експорт: ' + name, txt: 'Кодування: ' + Math.round(f * 100) + '%' + (eta != null ? ', залишилось ≈ ' + C.fmtTime(eta) : ''), frac: f });
        });
        resultUrl = URL.createObjectURL(blob);
        var dl = $('jobDl'); dl.href = resultUrl; dl.download = name;
        show({ title: 'Готово', txt: name + ' · ' + C.fmtBytes(blob.size) + (S.file.size ? ' (оригінал ' + C.fmtBytes(S.file.size) + ')' : ''), done: true });
        preview(blob, ex.fmt);
      } catch (e) {
        if (!cancelled) show({ title: 'Не вдалося', txt: e.message || String(e), err: true });
      } finally { running = false; ctx.refreshExport(); }
    }
    $('btnExport').addEventListener('click', run); $('btnExport2').addEventListener('click', run);
    $('jobCancel').addEventListener('click', function () { cancelled = true; VEEngine.cancel(); $('job').hidden = true; ctx.toast('Експорт скасовано'); });
    $('jobClose').addEventListener('click', function () { $('job').hidden = true; clearResult(); });
  }
  root.VEExport = { init: init };
})(window);
