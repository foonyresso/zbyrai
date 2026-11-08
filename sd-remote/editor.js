// Поле промпта з підсвіткою тегів і кнопками ваги для виділеного тексту.
// Підсвітка: «дзеркало» <pre> під прозорим <textarea> (однаковий шрифт, без відступів у span-ах). Логіка ваги: prompt-tools.js.
(function () {
  var P = window.PromptTools;
  var STEPS = [['−100%', -1], ['−50%', -0.5], ['−10%', -0.1], ['Норма', 'reset'], ['+10%', 0.1], ['+50%', 0.5], ['+100%', 1]];

  // o: {ta, mirror, bar, onInput(text), loraDefault(name)}
  function create(o) {
    var ta = o.ta;
    function fit() { ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 2 + 'px'; }
    function paint() { o.mirror.innerHTML = P.highlightHtml(ta.value); fit(); }
    function updateBar() { o.bar.hidden = !(ta.selectionEnd > ta.selectionStart); }
    function apply(d) {
      var r = P.applyWeight(ta.value, ta.selectionStart, ta.selectionEnd, d, o.loraDefault);
      if (!r) return;
      ta.value = r.text; ta.setSelectionRange(r.start, r.end); paint(); o.onInput(ta.value); updateBar();
    }
    o.bar.textContent = '';
    var lbl = document.createElement('span'); lbl.className = 'wl'; lbl.textContent = 'Вага виділеного:'; o.bar.appendChild(lbl);
    STEPS.forEach(function (s) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = s[0];
      b.title = s[1] === 'reset' ? 'Повернути вагу 1.0 (для LoRA: типову силу)' : 'Змінити вагу виділених тегів на ' + (s[1] > 0 ? '+' : '') + s[1].toFixed(1).replace('.', ',');
      b.addEventListener('pointerdown', function (e) { e.preventDefault(); });   // не губити виділення
      b.addEventListener('click', function () { apply(s[1]); });
      o.bar.appendChild(b);
    });
    ta.addEventListener('input', function () { paint(); o.onInput(ta.value); updateBar(); });
    ['select', 'keyup', 'mouseup', 'touchend', 'focus'].forEach(function (ev) { ta.addEventListener(ev, function () { setTimeout(updateBar, 0); }); });
    document.addEventListener('selectionchange', function () { if (document.activeElement === ta) updateBar(); });
    window.addEventListener('resize', fit);
    return { set: function (v) { ta.value = v; paint(); updateBar(); }, paint: paint };
  }
  window.PromptEditor = { create: create };
})();
