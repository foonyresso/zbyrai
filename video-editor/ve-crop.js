// Відео редактор: рамка кадрування поверх перегляду. Тягни рамку, щоб посунути, ручки по краях і кутах міняють розмір
// (з фіксованою пропорцією або вільно). Координати рамки в пікселях оригінального відео.
(function (root) {
  var HANDLES = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

  function create(layer, hooks) {
    var C = root.VECore, box = document.createElement('div'), vw = 0, vh = 0, crop = null, aspect = 0, interactive = false, drag = null;
    box.className = 'cropbox';
    HANDLES.forEach(function (h) { var d = document.createElement('i'); d.className = 'h h-' + h; d.dataset.h = h; box.appendChild(d); });
    layer.appendChild(box);

    function scale() { return vw ? layer.clientWidth / vw : 1; }
    function render() {
      var show = !!crop && !C.isFull(crop, vw, vh);
      layer.classList.toggle('on', show || interactive);
      layer.classList.toggle('live', interactive);
      if (!crop || !vw) { box.style.display = 'none'; return; }
      var k = scale(); box.style.display = '';
      box.style.left = crop.x * k + 'px'; box.style.top = crop.y * k + 'px'; box.style.width = crop.w * k + 'px'; box.style.height = crop.h * k + 'px';
    }
    function srcPoint(e) { var r = layer.getBoundingClientRect(), k = scale(); return { x: (e.clientX - r.left) / k, y: (e.clientY - r.top) / k }; }

    box.addEventListener('pointerdown', function (e) {
      if (!interactive || e.button !== 0) return;
      e.preventDefault(); box.setPointerCapture(e.pointerId);
      var p = srcPoint(e), h = e.target.dataset && e.target.dataset.h;
      drag = h ? { mode: 'size', h: h } : { mode: 'move', px: p.x, py: p.y, c0: crop };
    });
    box.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var p = srcPoint(e);
      if (drag.mode === 'move') crop = C.moveCrop(drag.c0, p.x - drag.px, p.y - drag.py, vw, vh);
      else crop = C.resizeCrop(crop, drag.h, p.x, p.y, aspect, vw, vh);
      render(); if (hooks.onChange) hooks.onChange(crop, false);
    });
    function up() { if (!drag) return; drag = null; if (hooks.onChange) hooks.onChange(crop, true); }
    box.addEventListener('pointerup', up); box.addEventListener('pointercancel', up);
    if (window.ResizeObserver) new ResizeObserver(render).observe(layer);

    return {
      // Розмір кадру оригіналу (px).
      setFrame: function (w, h) { vw = w; vh = h; render(); },
      // Нова рамка (px оригіналу) і пропорція (0 = вільно); interactive: чи можна тягнути.
      set: function (c, a, inter) { crop = c; aspect = a || 0; interactive = !!inter; render(); },
      render: render
    };
  }
  root.VECrop = { create: create };
})(window);
