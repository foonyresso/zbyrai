// Атлас 2.0: власні назви місць зі складів і закінчень (слов'янське звучання), унікальні в межах світу.
(function () {
  'use strict';
  const A = globalThis.Atlas2;
  const ROOT = ['Бер', 'Білo', 'Брід', 'Вел', 'Верх', 'Вись', 'Вітр', 'Глин', 'Гор', 'Грім', 'Дібр', 'Довг', 'Дуб', 'Жов', 'Зел', 'Кам', 'Кри', 'Лип', 'Луг', 'Мир', 'Мор', 'Нов', 'Ост', 'Перв', 'Піщ', 'Прим', 'Ряб', 'Світ', 'Сіл', 'Став', 'Стар', 'Тих', 'Чер', 'Чист', 'Шир', 'Яс', 'Ялин', 'Вовч', 'Орл', 'Ліс'].map(s => s.replace('o', 'о'));
  const TOWN = ['ів', 'ин', 'ичі', 'ськ', 'город', 'ець', 'ани', 'ове', 'иця', 'ава', 'ярськ', 'бор', 'пілля', 'ківка'];
  const PROV = ['ія', 'ія', 'ляндія', 'арія', 'щина'];
  const REG = ['щина', 'івщина', 'ччина', 'янщина', 'ина'];
  function make(seed) {
    const r = A.Rng.stream(seed, 'names'), used = new Set();
    const pick = a => a[Math.floor(r() * a.length)];
    function unique(f) { for (let k = 0; k < 40; k++) { const n = f(); if (!used.has(n)) { used.add(n); return n; } } const n = f() + ' ' + (used.size + 1); used.add(n); return n; }
    const town = () => unique(() => { const a = pick(ROOT), b = pick(TOWN); return a + (/[аеиіоуяюєї]$/.test(a) && /^[аеиіоуяюєї]/.test(b) ? b.slice(1) : b); });
    const root = () => pick(ROOT);
    return {
      town,
      province: () => unique(() => root() + pick(PROV)),
      region: () => unique(() => root() + pick(REG)),
    };
  }
  A.Names = { make };
})();
