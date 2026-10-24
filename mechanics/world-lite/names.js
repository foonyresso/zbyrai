/* Механіка «world-lite»: власні назви поселень і лігв (склади з слів, без запозичень). */
(function (root) {
  'use strict';
  const Mech = root.Mech = root.Mech || {};
  const PRE = ['Зелен', 'Вишн', 'Крем', 'Лісо', 'Бір', 'Сив', 'Дубр', 'Медо', 'Камен', 'Ясно', 'Бузко', 'Горло', 'Тихо', 'Вітро', 'Ряст', 'Калин', 'Соснов', 'Перев', 'Луго', 'Явор'];
  const SUF = ['горб', 'брід', 'поле', 'яр', 'ів', 'ичі', 'ань', 'ець', 'гай', 'луг', 'пілля', 'вир', 'камінь', 'долина'];
  const LAIR_A = { forest: ['Вовче', 'Сіре', 'Темне'], mountain: ['Кам\'яне', 'Холодне', 'Глухе'], swamp: ['Туманне', 'Гниле', 'Мовчазне'], hills: ['Руде', 'Криве', 'Зубате'], plain: ['Чорне', 'Криваве'] };
  const LAIR_B = { forest: 'лігво', mountain: 'лігво', swamp: 'болото', hills: 'кублище', plain: 'становище' };
  function town(R, used) {
    for (let g = 0; g < 30; g++) { const n = PRE[Math.floor(R() * PRE.length)] + SUF[Math.floor(R() * SUF.length)], name = n[0].toUpperCase() + n.slice(1); if (!used.has(name)) { used.add(name); return name; } }
    return 'Селище ' + (used.size + 1);
  }
  function lair(R, kind, used) {
    const a = LAIR_A[kind] || LAIR_A.plain, name = a[Math.floor(R() * a.length)] + ' ' + (LAIR_B[kind] || 'становище');
    let n = name, i = 2; while (used.has(n)) n = name + ' ' + i++;
    used.add(n); return n;
  }
  Mech.WorldNames = { town, lair };
  if (typeof module !== 'undefined' && module.exports) module.exports = Mech.WorldNames;
})(globalThis);
