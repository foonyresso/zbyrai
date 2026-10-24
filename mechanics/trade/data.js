/* Механіка «trade»: перелік ресурсів і базові ціни. */
(function (root) {
  'use strict';
  const Mech = root.Mech = root.Mech || {};
  const RES = {
    grain: { name: 'Зерно', icon: '🌾', base: 6, food: true },
    fish: { name: 'Риба', icon: '🐟', base: 7, food: true },
    wood: { name: 'Дерево', icon: '🪵', base: 5 },
    stone: { name: 'Камінь', icon: '🪨', base: 7 },
    ore: { name: 'Руда', icon: '⛏', base: 12 },
    herbs: { name: 'Трави', icon: '🌿', base: 14 },
    tools: { name: 'Знаряддя', icon: '🔧', base: 30 },
  };
  // список «розблоковано»: у грі діють лише ці ресурси (решта даних лишається для наступних кроків)
  const UNLOCKED = ['grain', 'wood'];
  const RAW = ['grain', 'fish', 'wood', 'stone', 'ore', 'herbs'].filter(r => UNLOCKED.includes(r));
  Mech.TradeData = { RES, RAW, UNLOCKED, ALL: Object.keys(RES), IDS: UNLOCKED.slice() };
  if (typeof module !== 'undefined' && module.exports) module.exports = Mech.TradeData;
})(globalThis);
