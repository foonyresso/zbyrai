// Конвертер зображень: пул Web Worker-ів. Якщо воркери недоступні (наприклад, сторінку відкрито як file://), працює на головному потоці по черзі.
(function (root) {
  function mkDom(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

  function create(n) {
    var workers = [], queue = [], jobs = {}, nextId = 1, broken = false, mainBusy = false;
    var canWorker = typeof Worker !== 'undefined' && typeof OffscreenCanvas !== 'undefined';
    if (canWorker) {
      try {
        for (var i = 0; i < n; i++) {
          var w = new Worker('./convert-worker.js'); w.busy = null;
          w.onmessage = function (ev) { var j = jobs[ev.data.id]; delete jobs[ev.data.id]; this.busy = null; if (ev.data.error) j.reject(new Error(ev.data.error)); else j.resolve(ev.data); pump(); };
          w.onerror = function (ev) { ev.preventDefault && ev.preventDefault(); broken = true; var b = this.busy; this.busy = null; if (b) { delete jobs[b.id]; queue.unshift(b); } pump(); };
          workers.push(w);
        }
      } catch (e) { broken = true; }
    } else broken = true;

    async function runMain(t) {
      mainBusy = true;
      try {
        var bmp = await ConvertRender.decode(t.file);
        try { t.resolve(await ConvertRender.render(bmp, t.job, mkDom)); } finally { bmp.close && bmp.close(); }
      } catch (e) { t.reject(e); }
      mainBusy = false; pump();
    }
    function pump() {
      if (broken) { if (!mainBusy && queue.length) runMain(queue.shift()); return; }
      for (var i = 0; i < workers.length && queue.length; i++) {
        if (workers[i].busy) continue;
        var t = queue.shift(); workers[i].busy = t; jobs[t.id] = t;
        workers[i].postMessage({ id: t.id, file: t.file, job: t.job });
      }
    }
    return {
      run: function (file, job) { return new Promise(function (resolve, reject) { queue.push({ id: nextId++, file: file, job: job, resolve: resolve, reject: reject }); pump(); }); },
      clear: function () { queue.forEach(function (t) { t.reject(new Error('cancel')); }); queue.length = 0; },
      mode: function () { return broken ? 'main' : 'worker'; }
    };
  }
  root.ConvertPool = { create: create };
})(window);
