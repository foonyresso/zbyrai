// Аудіо редактор: звертання до воркера збирання; якщо воркер недоступний (напр. file://), збирає на головному потоці.
(function (root) {
  'use strict';
  function create() {
    var worker = null, jobs = {}, nextId = 1, src = null, broken = false;
    function fail(msg) { Object.keys(jobs).forEach(function (k) { jobs[k].reject(new Error(msg)); delete jobs[k]; }); }
    function start() {
      if (worker || broken || typeof Worker === 'undefined') { if (typeof Worker === 'undefined') broken = true; return; }
      try {
        worker = new Worker('./audio-worker.js');
        worker.onmessage = function (e) {
          var m = e.data, j = jobs[m.id]; if (!j) return;
          if (m.type === 'progress') { if (j.progress) j.progress(m.p); return; }
          delete jobs[m.id];
          if (m.type === 'error') j.reject(new Error(m.error)); else j.resolve({ sr: m.sr, channels: m.channels, peak: m.peak, duration: m.channels[0].length / m.sr });
        };
        worker.onerror = function (ev) { if (ev.preventDefault) ev.preventDefault(); broken = true; worker = null; fail('worker'); };
      } catch (e) { broken = true; worker = null; }
    }
    return {
      // Передає джерело воркеру (канали копіюються; у головного потоку лишається власна копія лише для запасного режиму).
      setSource: function (s) {
        src = s; start();
        if (worker) worker.postMessage({ type: 'source', sr: s.sr, channels: s.channels.map(function (c) { return Float32Array.from(c); }) });
      },
      render: function (segs, opts, progress) {
        function direct() { return new Promise(function (res) { setTimeout(function () { var o = root.AudioRender.render(src, segs, opts, progress); res(o); }, 20); }); }
        if (!worker) return direct();
        return new Promise(function (resolve, reject) {
          var id = nextId++; jobs[id] = { resolve: resolve, reject: reject, progress: progress };
          worker.postMessage({ type: 'render', id: id, segs: segs, opts: opts });
        }).catch(function (e) { if (broken) return direct(); throw e; });
      },
      mode: function () { return worker ? 'worker' : 'main'; }
    };
  }
  root.RenderPool = { create: create };
})(window);
