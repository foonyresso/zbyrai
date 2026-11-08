// Поле промпта з підсвіткою тегів і повзунком ваги для виділеного тексту.
// Підсвітка: «дзеркало» <pre> під прозорим <textarea> (однаковий шрифт, без відступів у span-ах). Логіка: prompt-tools.js.
// Повзунок спливає під полем поверх інших блоків (position: absolute), тому розміри меню не змінюються й теги не затуляються.
(function () {
  var P = window.PromptTools;

  // o: {ta, mirror, bar, onInput(text)}
  function create(o) {
    var ta = o.ta, bar = o.bar, rng, num, val;
    function fit() { ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 2 + 'px'; }
    function paint() { o.mirror.innerHTML = P.highlightHtml(ta.value); fit(); }
    function show() {
      var w = P.selectionWeight(ta.value, ta.selectionStart, ta.selectionEnd);
      if (w == null) { bar.hidden = true; return; }
      bar.hidden = false; rng.value = w; num.value = w;
    }
    function apply(w) {
      var r = P.setWeight(ta.value, ta.selectionStart, ta.selectionEnd, w);
      if (!r) return;
      ta.value = r.text; ta.setSelectionRange(r.start, r.end); paint(); o.onInput(ta.value);
      rng.value = w; num.value = w;
    }
    bar.textContent = '';
    var lbl = document.createElement('span'); lbl.className = 'wl'; lbl.textContent = 'Вага виділеного';
    rng = document.createElement('input'); rng.type = 'range'; rng.min = P.WMIN; rng.max = P.WMAX; rng.step = 0.05; rng.title = 'Вага виділених тегів від ' + P.WMIN + ' до ' + P.WMAX + ' (1.0 = звичайна)';
    num = document.createElement('input'); num.type = 'number'; num.min = P.WMIN; num.max = P.WMAX; num.step = 0.05; num.title = 'Вага виділених тегів';
    var reset = document.createElement('button'); reset.type = 'button'; reset.textContent = '1.0'; reset.title = 'Скинути вагу до звичайної (без дужок)';
    [lbl, rng, num, reset].forEach(function (e) { bar.appendChild(e); });
    function clampW(v) { v = Number(v); return isFinite(v) ? Math.min(P.WMAX, Math.max(P.WMIN, Math.round(v * 100) / 100)) : null; }
    rng.addEventListener('input', function () { apply(clampW(rng.value)); });
    num.addEventListener('change', function () { var v = clampW(num.value); if (v != null) apply(v); });
    reset.addEventListener('click', function () { apply(1); });

    ta.addEventListener('input', function () { paint(); o.onInput(ta.value); show(); });
    ['select', 'keyup', 'mouseup', 'touchend', 'focus'].forEach(function (ev) { ta.addEventListener(ev, function () { setTimeout(show, 0); }); });
    document.addEventListener('selectionchange', function () { if (document.activeElement === ta) show(); });
    // ховати, коли фокус пішов кудись, крім повзунка
    function away(e) { var t = e.relatedTarget; if (!t || (t !== ta && !bar.contains(t))) bar.hidden = true; }
    ta.addEventListener('blur', away); bar.addEventListener('focusout', away);
    window.addEventListener('resize', fit);
    return { set: function (v) { ta.value = v; paint(); bar.hidden = true; }, paint: paint };
  }
  window.PromptEditor = { create: create };
})();
