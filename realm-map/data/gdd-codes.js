// Відповідність типів карти стабільним кодам карток гри GodsDontDie (World/Catalog/Cards/*.cs).
// Лише довідка для перенесення: генерація цих кодів не використовує.
(function () {
  'use strict';
  const R = (globalThis.RealmMap = globalThis.RealmMap || {}); R.Data = R.Data || {};

  R.Data.gddCodes = {
    road: { major: 'road.central', medium: 'road.middle', minor: 'road.small', trail: 'road.trail' },
    rank: {
      capital: 'settlement.capital', regional: 'settlement.town', town: 'settlement.village',
      village: 'settlement.village', hamlet: 'settlement.hamlet', mine: null /* Mines.cs */,
    },
    poi: {
      ruins: 'poi.ruins', monument: 'poi.generic', temple: 'poi.altar', mage_tower: 'poi.generic',
      bandit_camp: 'poi.bandit_camp', viewpoint: 'poi.viewpoint', glade: 'poi.cozy_spot', park: 'poi.cozy_spot',
      small_mine: 'poi.dungeon', shrine: 'poi.altar', hermit: 'poi.cozy_spot', small_monument: 'poi.generic',
      lake: 'poi.generic', mountain: 'poi.generic', waterfall: 'poi.generic',
    },
    lairTier3: 'poi.boss_lair',
    port: { sea_hub: 'port.main', fishing: 'port.fishing', island: 'port.island' },
  };
})();
