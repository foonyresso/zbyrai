// Аудіо редактор: таймлайн на canvas (лінійка, хвиля фрагментів, виділення, курсор, масштаб). Лише малювання й миша; дані дає app.js.
// Хуки: onSeek(t), onSelect(a, b | null), onView().
(function (root) {
  'use strict';
  var C = root.AudioCore, P = root.PeaksCore, RULER = 26;

  function create(canvas, hooks) {
    var ctx = canvas.getContext('2d'), w = 0, h = 0, dpr = 1;
    var S = { segs: [], peaksC: null, peaksF: null, sr: 44100, sel: null, head: 0, tgt: null, pps: 50, scroll: 0, total: 0 };
    var out = [0, 0], drag = null, css = {};

    function readCss() {
      var cs = getComputedStyle(document.documentElement);
      ['--accent', '--accent-hi', '--text', '--muted', '--faint', '--line', '--panel'].forEach(function (k) { css[k] = cs.getPropertyValue(k).trim() || '#999'; });
    }
    function resize() {
      var r = canvas.getBoundingClientRect(); dpr = Math.min(2, root.devicePixelRatio || 1);
      w = Math.max(10, Math.round(r.width)); h = Math.max(10, Math.round(r.height));
      canvas.width = w * dpr; canvas.height = h * dpr; clampView(); draw();
    }
    function clampView() {
      var span = w / S.pps;
      S.scroll = Math.max(0, Math.min(S.scroll, Math.max(0, S.total - span)));
    }
    function fitPps() { return Math.max(1, (w - 24) / Math.max(0.05, S.total)); }
    function maxPps() { return 4000; }
    function xOf(t) { return (t - S.scroll) * S.pps; }
    function tOf(x) { return S.scroll + x / S.pps; }

    function niceStep() {
      var steps = [0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300, 600, 1800, 3600];
      for (var i = 0; i < steps.length; i++) if (steps[i] * S.pps >= 80) return steps[i];
      return 3600;
    }
    function badge(sg) {
      var t = [];
      if (sg.speed !== 1) t.push('×' + +sg.speed.toFixed(2));
      if (sg.pitch) t.push((sg.pitch > 0 ? '+' : '') + +sg.pitch.toFixed(1) + ' пт');
      if (sg.gain) t.push((sg.gain > 0 ? '+' : '') + +sg.gain.toFixed(1) + ' дБ');
      return t.join('  ');
    }

    function draw() {
      if (!css['--accent']) readCss();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
      var mid = RULER + (h - RULER) / 2, amp = (h - RULER) / 2 - 8, i;
      // лінійка
      ctx.fillStyle = 'rgba(255,255,255,.04)'; ctx.fillRect(0, 0, w, RULER);
      var step = niceStep(), t0 = Math.floor(S.scroll / step) * step;
      ctx.font = '11px system-ui, sans-serif'; ctx.textBaseline = 'middle'; ctx.fillStyle = css['--muted']; ctx.strokeStyle = css['--line'];
      for (var t = t0; t <= S.scroll + w / S.pps + step; t += step) {
        var x = Math.round(xOf(t)) + 0.5; ctx.beginPath(); ctx.moveTo(x, RULER - 7); ctx.lineTo(x, RULER); ctx.stroke();
        ctx.fillText(C.fmtTime(t, step < 1 ? 2 : 0), x + 3, RULER / 2 - 1);
      }
      if (!S.segs.length || !S.peaksC) return;
      // фрагменти
      var st = C.starts(S.segs), rng = out;
      for (i = 0; i < S.segs.length; i++) {
        var sg = S.segs[i], d = C.segDur(sg), x0 = xOf(st[i]), x1 = x0 + d * S.pps;
        if (x1 < 0 || x0 > w) continue;
        var isT = S.tgt && S.tgt.kind === 'seg' && S.tgt.i === i;
        ctx.fillStyle = isT ? 'rgba(255,255,255,.075)' : (i % 2 ? 'rgba(255,255,255,.035)' : 'rgba(255,255,255,.015)');
        ctx.fillRect(x0, RULER, x1 - x0, h - RULER);
        ctx.strokeStyle = css['--line']; ctx.beginPath(); ctx.moveTo(Math.round(x0) + 0.5, RULER); ctx.lineTo(Math.round(x0) + 0.5, h); ctx.stroke();
        // хвиля: піки з джерела, масштабовані гучністю фрагмента
        var g = Math.pow(10, (sg.gain || 0) / 20), pk = (S.pps < S.sr / 256 * 0.9 || !S.peaksF) ? S.peaksC : S.peaksF;
        var xa = Math.max(0, Math.floor(x0)), xb = Math.min(w, Math.ceil(x1));
        ctx.fillStyle = css['--accent'];
        for (var px = xa; px < xb; px++) {
          var tt = S.scroll + px / S.pps - st[i], sa = (sg.a + tt * sg.speed) * S.sr, sb = sa + sg.speed / S.pps * S.sr;
          if (sb <= 0 || sa >= pk.length) continue;
          P.range(pk, Math.max(0, Math.floor(sa)), Math.max(1, Math.ceil(sb)), rng);
          var yt = mid - Math.min(1, rng[1] * g) * amp, yb = mid - Math.max(-1, rng[0] * g) * amp;
          ctx.fillRect(px, yt, 1, Math.max(1, yb - yt));
        }
        var bt = badge(sg);
        if (bt && x1 - x0 > 50) { ctx.fillStyle = css['--accent-hi']; ctx.textBaseline = 'top'; ctx.fillText(bt, Math.max(x0, 0) + 5, RULER + 4); ctx.textBaseline = 'middle'; }
      }
      ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.beginPath(); ctx.moveTo(0, mid + 0.5); ctx.lineTo(w, mid + 0.5); ctx.stroke();
      var ex = xOf(S.total); if (ex < w) { ctx.strokeStyle = css['--line']; ctx.beginPath(); ctx.moveTo(Math.round(ex) + 0.5, RULER); ctx.lineTo(Math.round(ex) + 0.5, h); ctx.stroke(); }
      // виділення
      if (S.sel) {
        var sa2 = xOf(S.sel.a), sb2 = xOf(S.sel.b);
        ctx.fillStyle = 'rgba(88,196,176,.16)'; ctx.fillRect(sa2, RULER, sb2 - sa2, h - RULER);
        ctx.fillStyle = css['--accent-hi']; ctx.fillRect(Math.round(sa2) - 1, RULER, 2, h - RULER); ctx.fillRect(Math.round(sb2) - 1, RULER, 2, h - RULER);
      }
      // курсор
      var hx = Math.round(xOf(S.head)) + 0.5;
      if (hx >= 0 && hx <= w) {
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(hx, 0); ctx.lineTo(hx, h); ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(hx - 6, 0); ctx.lineTo(hx + 6, 0); ctx.lineTo(hx, 9); ctx.fill();
      }
    }

    // ---- миша ----
    function evX(e) { return e.clientX - canvas.getBoundingClientRect().left; }
    function snapT(t) { return Math.max(0, Math.min(S.total, t)); }
    canvas.addEventListener('pointerdown', function (e) {
      if (!S.segs.length) return;
      canvas.setPointerCapture(e.pointerId);
      var x = evX(e), t = snapT(tOf(x)), edge = null;
      if (S.sel && e.offsetY > RULER) {
        if (Math.abs(x - xOf(S.sel.a)) < 7) edge = 'a'; else if (Math.abs(x - xOf(S.sel.b)) < 7) edge = 'b';
      }
      drag = { x0: x, t0: t, moved: false, edge: edge, ruler: e.offsetY <= RULER };
      if (drag.ruler) hooks.onSeek(t);
    });
    canvas.addEventListener('pointermove', function (e) {
      var x = evX(e);
      if (!drag) { canvas.style.cursor = S.sel && e.offsetY > RULER && (Math.abs(x - xOf(S.sel.a)) < 7 || Math.abs(x - xOf(S.sel.b)) < 7) ? 'ew-resize' : 'crosshair'; return; }
      var t = snapT(tOf(x));
      if (drag.ruler) { hooks.onSeek(t); return; }
      if (!drag.moved && Math.abs(x - drag.x0) < 4) return;
      drag.moved = true;
      if (drag.edge) { var o = drag.edge === 'a' ? S.sel.b : S.sel.a; hooks.onSelect(Math.min(o, t), Math.max(o, t)); if (t < o === (drag.edge === 'b')) drag.edge = drag.edge === 'a' ? 'b' : 'a'; }
      else hooks.onSelect(Math.min(drag.t0, t), Math.max(drag.t0, t));
    });
    function up() { if (drag && !drag.moved && !drag.ruler) { hooks.onSelect(null); hooks.onSeek(drag.t0); } drag = null; }
    canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', function () { drag = null; });
    canvas.addEventListener('wheel', function (e) {
      e.preventDefault();
      if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) { S.scroll += (e.deltaX || e.deltaY) / S.pps; clampView(); draw(); hooks.onView(); return; }
      zoomAt(evX(e), e.deltaY < 0 ? 1.25 : 0.8);
    }, { passive: false });

    function zoomAt(x, k) {
      var t = tOf(x); S.pps = Math.max(Math.min(fitPps() * 0.5, 5), Math.min(maxPps(), S.pps * k));
      S.scroll = t - x / S.pps; clampView(); draw(); hooks.onView();
    }
    root.addEventListener('resize', resize);
    if (root.ResizeObserver) new ResizeObserver(resize).observe(canvas);

    return {
      set: function (o) { Object.assign(S, o); S.total = C.total(S.segs); clampView(); draw(); },
      draw: draw, resize: resize,
      fit: function () { S.pps = fitPps(); S.scroll = 0; draw(); hooks.onView(); },
      zoom: function (k) { zoomAt(w / 2, k); },
      setScroll: function (t) { S.scroll = t; clampView(); draw(); },
      // тримає курсор у видимій частині під час відтворення
      follow: function (t) { var span = w / S.pps; if (t < S.scroll || t > S.scroll + span * 0.92) { S.scroll = Math.max(0, t - span * 0.1); clampView(); hooks.onView(); } },
      view: function () { return { scroll: S.scroll, span: w / S.pps, total: S.total }; },
      readCss: function () { css = {}; draw(); }
    };
  }
  root.Timeline = { create: create };
})(window);
