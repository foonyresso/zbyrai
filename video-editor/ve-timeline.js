// Відео редактор: таймлайн на canvas. Частини з кадрами-мініатюрами, лінійка, курсор, виділення діапазону (тягнеш мишею; краї можна посунути),
// клік по частині виділяє її, колесо гортає, Ctrl+колесо масштабує.
(function (root) {
  var RULER = 22, PAD = 6;

  function create(canvas, hooks) {
    var C = root.VECore, g = canvas.getContext('2d');
    var segs = [], t = 0, sel = null, thumbs = null, pps = 40, scroll = 0, W = 0, H = 0, dpr = 1, drag = null, total = 0, st = [];
    var css = getComputedStyle(document.documentElement);
    var col = { accent: (css.getPropertyValue('--accent') || '#e0a458').trim(), hi: (css.getPropertyValue('--accent-hi') || '#f0c58a').trim(), bg: '#0b0b0f', line: '#2a2a34', text: '#ece8df', mute: '#8c877d' };

    function trackTop() { return RULER + 4; } function trackH() { return H - trackTop() - PAD; }
    function fitPps() { return total > 0 ? Math.max(2, (W - 2 * PAD) / total) : 40; }
    function maxScroll() { return Math.max(0, total - (W - 2 * PAD) / pps); }
    function x2t(x) { return scroll + (x - PAD) / pps; } function t2x(tt) { return PAD + (tt - scroll) * pps; }
    function clampScroll() { scroll = C.clamp(scroll, 0, maxScroll()); }

    function resize() {
      var r = canvas.getBoundingClientRect(); dpr = Math.min(2, window.devicePixelRatio || 1);
      W = Math.max(50, r.width); H = Math.max(50, r.height);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      pps = C.clamp(pps, fitPps(), 800); clampScroll(); draw();
    }

    function snapT(tt, ignoreSel) {
      var best = tt, bd = 7 / pps, pts = st.concat([total, t]);
      if (sel && !ignoreSel) pts.push(sel[0], sel[1]);
      for (var i = 0; i < pts.length; i++) { var d = Math.abs(pts[i] - tt); if (d < bd) { bd = d; best = pts[i]; } }
      return C.clamp(best, 0, total);
    }

    function draw() {
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
      g.fillStyle = col.bg; g.fillRect(0, 0, W, H);
      var ty = trackTop(), th = trackH();
      // лінійка
      g.fillStyle = col.mute; g.strokeStyle = col.line; g.font = '11px system-ui, sans-serif'; g.textBaseline = 'middle';
      var steps = [0.1, 0.2, 0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300, 600, 1800, 3600], step = 1;
      for (var k = 0; k < steps.length; k++) { step = steps[k]; if (step * pps >= 70) break; }
      for (var s = Math.floor(scroll / step) * step; s <= x2t(W) + step; s += step) {
        var x = Math.round(t2x(s)) + 0.5; if (x < 0 || x > W) continue;
        g.beginPath(); g.moveTo(x, RULER - 7); g.lineTo(x, RULER); g.stroke();
        g.fillText(C.fmtTime(s, step < 1), x + 3, 9);
      }
      g.beginPath(); g.moveTo(0, RULER + 0.5); g.lineTo(W, RULER + 0.5); g.stroke();
      // частини
      var tile = thumbs && thumbs.frames.length ? Math.max(24, th * (thumbs.aspect || 1.78)) : 0;
      for (var i = 0; i < segs.length; i++) {
        var sg = segs[i], x0 = t2x(st[i]), x1 = t2x(st[i] + C.segDur(sg));
        if (x1 < -2 || x0 > W + 2) continue;
        var cx0 = Math.max(x0, -2), cx1 = Math.min(x1, W + 2);
        g.save(); g.beginPath(); g.rect(x0 + 1, ty, Math.max(1, x1 - x0 - 2), th); g.clip();
        g.fillStyle = '#1b1b22'; g.fillRect(x0, ty, x1 - x0, th);
        if (tile) {
          for (var tx = Math.floor((cx0 - x0) / tile) * tile + x0; tx < cx1; tx += tile) {
            var src = sg.s + ((tx + tile / 2 - x0) / pps) * sg.speed, idx = C.clamp(Math.floor(src / thumbs.dur * thumbs.n), 0, thumbs.n - 1), f = thumbs.frames[idx];
            if (!f) { for (var d = 1; d < thumbs.n && !f; d++) f = thumbs.frames[idx - d] || thumbs.frames[idx + d]; }
            if (f) g.drawImage(f, tx, ty, tile, th);
          }
          g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(x0, ty, x1 - x0, th);
        }
        // позначки швидкості й гучності
        var tags = []; if (Math.abs(sg.speed - 1) > 1e-6) tags.push('×' + +sg.speed.toFixed(2)); if (Math.abs(sg.vol - 1) > 1e-6) tags.push(sg.vol === 0 ? 'без звуку' : '🔊' + Math.round(sg.vol * 100) + '%');
        if (tags.length) {
          var label = tags.join(' · '); g.font = '600 11px system-ui, sans-serif'; var tw = g.measureText(label).width + 10, lx = Math.max(x0 + 3, 3);
          if (x1 - x0 > tw + 6) { g.fillStyle = 'rgba(0,0,0,.7)'; g.fillRect(lx, ty + 3, tw, 16); g.fillStyle = col.hi; g.fillText(label, lx + 5, ty + 11.5); }
        }
        g.restore();
        g.strokeStyle = col.accent; g.globalAlpha = .55; g.lineWidth = 1; g.strokeRect(x0 + .5, ty + .5, x1 - x0 - 1, th - 1); g.globalAlpha = 1;
      }
      // виділення
      if (sel && sel[1] > sel[0]) {
        var a = t2x(sel[0]), b = t2x(sel[1]);
        g.fillStyle = 'rgba(224,164,88,.22)'; g.fillRect(a, RULER, b - a, H - RULER);
        g.strokeStyle = col.hi; g.lineWidth = 2; g.strokeRect(a, ty, b - a, th); g.lineWidth = 1;
        g.fillStyle = col.hi; [a, b].forEach(function (hx) { g.fillRect(hx - 3, ty + th / 2 - 14, 6, 28); });
        g.fillStyle = col.hi; g.font = '600 11px system-ui, sans-serif'; var lab = C.fmtTime(sel[1] - sel[0], true); g.fillText(lab, Math.max(2, Math.min(W - 40, a + 4)), RULER - 11 + 12);
      }
      // курсор
      var px = Math.round(t2x(t)) + 0.5;
      if (px >= -5 && px <= W + 5) { g.strokeStyle = '#ff6a5c'; g.fillStyle = '#ff6a5c'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(px, 0); g.lineTo(px, H); g.stroke(); g.beginPath(); g.moveTo(px - 5, 0); g.lineTo(px + 5, 0); g.lineTo(px, 8); g.fill(); g.lineWidth = 1; }
      if (!segs.length) { g.fillStyle = col.mute; g.font = '13px system-ui, sans-serif'; g.fillText('Таймлайн порожній: усі частини видалено або відео не відкрито', 16, H / 2 + 8); }
    }

    function pos(e) { var r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    function nearHandle(x) {
      if (!sel) return -1;
      if (Math.abs(x - t2x(sel[0])) <= 7) return 0;
      if (Math.abs(x - t2x(sel[1])) <= 7) return 1;
      return -1;
    }
    function setSel(a, b) { sel = (b - a > 0.02) ? [a, b] : null; if (hooks.onSelect) hooks.onSelect(sel); draw(); }

    canvas.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      canvas.setPointerCapture(e.pointerId);
      var p = pos(e), tt = C.clamp(x2t(p.x), 0, total);
      if (p.y < RULER) { drag = { mode: 'seek' }; if (hooks.onSeek) hooks.onSeek(snapT(tt, true)); return; }
      var h = nearHandle(p.x);
      if (h >= 0) { drag = { mode: 'handle', h: h }; return; }
      drag = { mode: 'pending', x0: p.x, t0: tt };
    });
    canvas.addEventListener('pointermove', function (e) {
      var p = pos(e);
      if (!drag) { canvas.style.cursor = p.y >= RULER && nearHandle(p.x) >= 0 ? 'ew-resize' : 'default'; return; }
      var tt = C.clamp(x2t(p.x), 0, total);
      if (p.x > W - 24) { scroll += 12 / pps; clampScroll(); } else if (p.x < 24) { scroll -= 12 / pps; clampScroll(); }
      if (drag.mode === 'seek') { if (hooks.onSeek) hooks.onSeek(snapT(tt, true)); }
      else if (drag.mode === 'handle' && sel) { var v = snapT(tt, true), a = sel[0], b = sel[1]; if (drag.h === 0) a = Math.min(v, b - 0.05); else b = Math.max(v, a + 0.05); setSel(a, b); }
      else if (drag.mode === 'pending' && Math.abs(p.x - drag.x0) > 4) drag.mode = 'range';
      if (drag.mode === 'range') { var a2 = snapT(drag.t0, true), b2 = snapT(tt, true); setSel(Math.min(a2, b2), Math.max(a2, b2)); }
    });
    function up(e) {
      if (!drag) return;
      if (drag.mode === 'pending') { // простий клік: виділити частину під курсором і поставити курсор
        var L = C.locate(segs, drag.t0), x = pos(e).x;
        if (L && x2t(x) <= total + 0.0001) { var r = C.segRange(segs, L.i); setSel(r[0], r[1]); if (hooks.onSeek) hooks.onSeek(drag.t0); }
        else setSel(0, 0);
      }
      drag = null;
    }
    canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
    canvas.addEventListener('wheel', function (e) {
      e.preventDefault();
      var p = pos(e);
      if (e.ctrlKey || e.metaKey || e.altKey) {
        var tt = x2t(p.x); pps = C.clamp(pps * (e.deltaY < 0 ? 1.18 : 1 / 1.18), fitPps(), 800); scroll = tt - (p.x - PAD) / pps; clampScroll();
        if (hooks.onZoom) hooks.onZoom();
      } else { scroll += (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) / pps; clampScroll(); }
      draw();
    }, { passive: false });
    if (window.ResizeObserver) new ResizeObserver(resize).observe(canvas); else window.addEventListener('resize', resize);

    return {
      resize: resize, draw: draw,
      // Нові частини: курсор t, виділення (або null), мініатюри.
      set: function (o) {
        if (o.segs) { segs = o.segs; st = C.starts(segs); total = C.total(segs); pps = C.clamp(pps, fitPps(), 800); clampScroll(); }
        if (o.t != null) { t = o.t; if (!drag && W) { var x = t2x(t); if (x > W - 30 || x < PAD - 1) { scroll = t - (W * 0.25) / pps; clampScroll(); } } }
        if ('sel' in o) sel = o.sel;
        if (o.thumbs !== undefined) thumbs = o.thumbs;
        draw();
      },
      getSel: function () { return sel; },
      fit: function () { pps = fitPps(); scroll = 0; draw(); if (hooks.onZoom) hooks.onZoom(); },
      // Масштаб 0..1 (0 = все видно, 1 = 800 px/с), логарифмічно.
      getZoom: function () { var f = fitPps(); return f >= 800 ? 0 : Math.log(pps / f) / Math.log(800 / f); },
      setZoom: function (z) { var f = fitPps(), c = t; pps = f >= 800 ? f : f * Math.pow(800 / f, C.clamp(z, 0, 1)); scroll = c - (W / 2) / pps; clampScroll(); draw(); }
    };
  }
  root.VETimeline = { create: create };
})(window);
