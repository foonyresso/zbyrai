// Атлас 2.0: запуск генерації. Що тут: A.GenClient.run(params, onProgress) створює світ у воркері (core/genworker.js), а де воркерів нема (file://), у основному потоці кроками, що чекають, поки камера стихне; tick() — спільне очікування між кроками для решти довгих справ (підготовка растрів).
(function () {
  'use strict';
  const A = globalThis.Atlas2; let worker = null, tried = false, seq = 0, last = 0; const jobs = new Map();
  const touch = () => { last = Date.now(); };
  addEventListener('wheel', touch, { passive: true }); addEventListener('pointerdown', touch, { passive: true }); addEventListener('pointermove', e => { if (e.buttons) touch(); }, { passive: true });
  // віддати керування браузеру; поки користувач рухає камеру (до 0,25 с тому), чекаємо, але не довше ~4 с
  const tick = () => new Promise(res => { const t0 = Date.now(); (function w() { if (Date.now() - last >= 250 || Date.now() - t0 > 4000) res(); else setTimeout(w, 80); })(); });
  function start() {
    if (tried) return worker; tried = true;
    try {
      if (!/^https?:$/.test(location.protocol) || typeof Worker === 'undefined') return null;
      const v = globalThis.ATLAS2_V || '', w = new Worker(new URL('core/genworker.js?v=' + v, document.baseURI));
      w.onmessage = e => { const m = e.data, j = jobs.get(m.id); if (!j) return; if (m.f != null) { if (j.progress && j.progress(m.f, m.l) === false) w.postMessage({ cancel: m.id }); return; } jobs.delete(m.id); if (m.error) j.reject(new Error(m.error)); else j.resolve(m.W); };
      w.onerror = () => { const all = Array.from(jobs.values()); jobs.clear(); worker = null; for (const j of all) j.reject(new Error('worker')); };
      worker = w;
    } catch (e) { worker = null; }
    return worker;
  }
  async function run(params, onProgress) {
    const w = start();
    if (w) {
      try { return await new Promise((resolve, reject) => { const id = ++seq; jobs.set(id, { resolve, reject, progress: onProgress }); w.postMessage({ id, params }); }); } catch (e) { if (String(e.message) !== 'worker') throw e; }
    }
    return A.generateAsync(params, onProgress, tick); // без воркера: основний потік, кроки між рухами камери
  }
  A.GenClient = { run, tick, usesWorker: () => !!worker };
})();
