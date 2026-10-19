// Вигляд інтерфейсу: колірна тема (data-look) і розкладка (data-layout) на <html>.
// Підключається в <head> синхронно, щоб тема застосувалась до першого малювання. Вибір зберігається в localStorage (pd2_look).
(function () {
  var LOOKS = [
    ['gold', '🜚 Обсидіан і золото'], ['neon', '⚡ Неон'], ['paper', '📜 Папір (світла)'],
    ['forest', '🌲 Ліс'], ['sakura', '🌸 Сакура (світла)'], ['terminal', '▮ Термінал'], ['slate', '◼ Графіт-індиго'],
  ];
  var LAYOUTS = [
    ['classic', 'Класична (3 колонки)'], ['mirror', 'Дзеркальна'], ['dock', 'Промпт знизу'], ['top', 'Промпт зверху'], ['wide', 'Широкі параметри'],
  ];
  var KEY = 'pd2_look', root = document.documentElement, cur = { look: 'gold', layout: 'classic' };
  try { var s = JSON.parse(localStorage.getItem(KEY) || '{}'); if (s.look) cur.look = s.look; if (s.layout) cur.layout = s.layout; } catch (e) {}
  var has = function (list, v) { return list.some(function (x) { return x[0] === v; }); };
  if (!has(LOOKS, cur.look)) cur.look = 'gold';
  if (!has(LAYOUTS, cur.layout)) cur.layout = 'classic';
  function apply() {
    root.setAttribute('data-look', cur.look); root.setAttribute('data-layout', cur.layout);
    try { localStorage.setItem(KEY, JSON.stringify(cur)); } catch (e) {}
  }
  apply();
  function fill(id, list, key) {
    var el = document.getElementById(id); if (!el) return;
    list.forEach(function (x) { var o = document.createElement('option'); o.value = x[0]; o.textContent = x[1]; el.appendChild(o); });
    el.value = cur[key];
    el.onchange = function () { cur[key] = el.value; apply(); };
  }
  document.addEventListener('DOMContentLoaded', function () { fill('lookSel', LOOKS, 'look'); fill('layoutSel', LAYOUTS, 'layout'); });
})();
