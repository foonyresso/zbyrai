// Відео редактор: мініатюри кадрів для таймлайна (окреме приховане <video>, кадри рівномірно по всій тривалості).
(function (root) {
  // Повертає { n, frames[], dur, aspect, cancel() }; frames заповнюються по мірі готовності, cb() викликається після кожного кадру.
  function make(url, dur, cb) {
    var v = document.createElement('video'), n = Math.max(6, Math.min(48, Math.round(dur / 2))), out = { n: n, frames: new Array(n), dur: dur, aspect: 16 / 9, stopped: false, cancel: function () { out.stopped = true; v.removeAttribute('src'); v.load(); } };
    v.muted = true; v.preload = 'auto'; v.playsInline = true; v.src = url;
    var i = 0;
    function next() {
      if (out.stopped || i >= n) return;
      try { v.currentTime = Math.min(dur - 0.05, (i + 0.5) * dur / n); } catch (e) { out.stopped = true; }
    }
    v.addEventListener('loadedmetadata', function () { if (v.videoWidth) out.aspect = v.videoWidth / v.videoHeight; next(); });
    v.addEventListener('seeked', function () {
      if (out.stopped) return;
      var h = 72, w = Math.max(8, Math.round(h * out.aspect)), c = document.createElement('canvas'); c.width = w; c.height = h;
      try { c.getContext('2d').drawImage(v, 0, 0, w, h); out.frames[i] = c; } catch (e) { /* кадр пропускаємо */ }
      i++; if (cb) cb(); next();
    });
    v.addEventListener('error', function () { out.stopped = true; });
    return out;
  }
  root.VEThumbs = { make: make };
})(window);
