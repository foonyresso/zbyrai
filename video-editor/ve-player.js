// Відео редактор: перегляд з урахуванням частин. Одне <video> грає оригінал, а плеєр перестрибує між частинами,
// ставить швидкість і гучність поточної частини. Гучність понад 100% через Web Audio (якщо браузер дозволяє).
(function (root) {
  function create(video, cb) {
    var C = root.VECore, segs = [], st = [], master = 1, mute = false, ci = 0, t = 0, playing = false, raf = 0, ctx = null, gain = null, total = 0;

    function gainValue() { var g = segs[ci]; return mute ? 0 : master * (g ? g.vol : 1); }
    function applyGain() { var v = gainValue(); if (gain) gain.gain.value = v; else video.volume = C.clamp(v, 0, 1); }
    function applySeg() {
      var g = segs[ci]; if (!g) return;
      try { video.preservesPitch = true; } catch (e) { /* не критично */ }
      video.playbackRate = C.clamp(g.speed, 0.0625, 16);
      applyGain();
    }
    function ensureAudio() {
      if (ctx !== null) { if (ctx && ctx.state === 'suspended') ctx.resume(); return; }
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        var src = ctx.createMediaElementSource(video); gain = ctx.createGain();
        src.connect(gain); gain.connect(ctx.destination); video.volume = 1;
        if (ctx.state === 'suspended') ctx.resume();
      } catch (e) { ctx = false; gain = null; }
    }
    function emit() { if (cb.time) cb.time(t, playing); }

    function seek(to) {
      if (!segs.length) { t = 0; emit(); return; }
      var L = C.locate(segs, C.clamp(to, 0, total));
      ci = L.i; t = L.start + L.off;
      video.currentTime = L.src;
      applySeg(); emit();
    }
    function tick() {
      if (!playing) return;
      var g = segs[ci];
      if (g && !video.seeking) {
        var cur = video.currentTime;
        if (cur >= g.e - 0.02 || video.ended) {
          if (ci + 1 >= segs.length) { pause(); t = total; emit(); return; }
          var ng = segs[ci + 1], contiguous = Math.abs(ng.s - g.e) < 0.001 && !video.ended;
          ci++;
          if (!contiguous) video.currentTime = ng.s;
          applySeg();
          if (video.paused) video.play().catch(function () { /* не критично */ });
        } else if (cur >= g.s - 0.5) {
          t = st[ci] + (cur - g.s) / g.speed;
        }
        emit();
      }
      raf = requestAnimationFrame(tick);
    }
    function play() {
      if (!segs.length) return;
      if (t >= total - 0.03) seek(0);
      ensureAudio(); applySeg();
      playing = true;
      video.play().catch(function () { playing = false; emit(); });
      cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); emit();
    }
    function pause() { playing = false; cancelAnimationFrame(raf); video.pause(); emit(); }

    return {
      get playing() { return playing; }, get time() { return t; }, get total() { return total; },
      play: play, pause: pause, toggle: function () { playing ? pause() : play(); }, seek: seek,
      // Нові частини (після правки) і куди поставити курсор; відтворення, якщо йшло, продовжується.
      setSegs: function (s, to) {
        segs = s; st = C.starts(s); total = C.total(s);
        seek(to == null ? t : to);
      },
      setVolume: function (m, mu) { master = m; mute = !!mu; applyGain(); },
      refresh: function () { applySeg(); }
    };
  }
  root.VEPlayer = { create: create };
})(window);
