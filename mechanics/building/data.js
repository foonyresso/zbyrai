/* Механіка «building»: типи будівель. cost — ціна (gold, ресурси); jobs — робочі місця; house — місць проживання;
   yields — що добуває (res, perWorker за добу, classes — які класи місцевості навколо рахуються, need — яка частка (0..1) клітин карти в радіусі r клітин потрібна для повного видобутку);
   on — дозволені класи місцевості під будівлею (0 вода, 1 узбережжя, 2 рівнина, 3 ліс, 4 пагорби, 5 гори, 6 болото); job — робота з colonist-foundry. */
(function (root) {
  'use strict';
  const Mech = root.Mech = root.Mech || {};
  const T = {
    hall: { name: 'Дім старости', icon: 'Д', color: '#d8a24a', cost: {}, jobs: 1, house: 0, storage: 100, job: 'trade', desc: 'Серце поселення. Збирає податки; знести не можна.', core: true },
    house: { name: 'Житловий будинок', icon: 'Ж', color: '#b98a5e', cost: { gold: 30, wood: 15, stone: 5 }, jobs: 0, house: 4, desc: 'Тут живуть до 4 поселенців. Без житла нові люди не приходять.' },
    farm: { name: 'Ферма', icon: 'Ф', color: '#9cb55a', cost: { gold: 40, wood: 20 }, jobs: 2, on: [2, 1], yields: { res: 'grain', perWorker: 2.4, classes: [2, 1], need: 0.3, r: 2 }, job: 'farm', desc: 'Зерно. Потрібна рівнина навколо (в радіусі ≈500 м).' },
    lumber: { name: 'Лісоруб', icon: 'Л', color: '#4f8a52', cost: { gold: 30, stone: 5 }, jobs: 2, on: [2, 3, 1], yields: { res: 'wood', perWorker: 2.0, classes: [3], need: 0.15, r: 4 }, job: 'lumber', desc: 'Дерево. Став біля лісу.' },
    quarry: { name: 'Каменярня', icon: 'К', color: '#9aa0a8', cost: { gold: 40, wood: 25 }, jobs: 2, on: [2, 3, 4, 5, 1], yields: { res: 'stone', perWorker: 1.5, classes: [4, 5], need: 0.12, r: 4 }, job: 'mine', desc: 'Камінь. Став біля пагорбів чи гір.' },
    mine: { name: 'Шахта', icon: 'Ш', color: '#7c6f8f', cost: { gold: 70, wood: 30, stone: 20 }, jobs: 2, on: [4, 5, 2, 3], yields: { res: 'ore', perWorker: 1.1, classes: [5], need: 0.08, r: 4 }, job: 'mine', desc: 'Руда. Потрібні гори поруч.' },
    fisher: { name: 'Рибальська хата', icon: 'Р', color: '#5aa0c8', cost: { gold: 30, wood: 15 }, jobs: 2, on: [1, 2], yields: { res: 'fish', perWorker: 2.0, classes: [0, 1], need: 0.1, r: 3 }, job: 'hunt', desc: 'Риба. Потрібна вода поруч.' },
    herbalist: { name: 'Збирач трав', icon: 'Т', color: '#6bbd9a', cost: { gold: 35, wood: 15 }, jobs: 1, on: [2, 3, 6, 1], yields: { res: 'herbs', perWorker: 1.0, classes: [6, 3], need: 0.12, r: 4 }, job: 'herb', desc: 'Трави (болото й ліс). Дорого продаються.' },
    workshop: { name: 'Майстерня', icon: 'М', color: '#c0794a', cost: { gold: 60, wood: 30, stone: 15 }, jobs: 2, on: [2, 3, 1, 4], makes: { in: { ore: 1, wood: 1 }, out: { tools: 1 }, perWorker: 1.2 }, job: 'craft', desc: 'Руда й дерево на знаряддя: вони цінні для торгівлі.' },
    shop: { name: 'Крамниця', icon: 'Кр', color: '#d8c04a', cost: { gold: 50, wood: 25, stone: 10 }, jobs: 1, shop: 7, job: 'trade', desc: 'Продавець заробляє золото з мешканців (до 0,8 на людину за добу).' },
    tavern: { name: 'Корчма', icon: 'Ко', color: '#c25a5a', cost: { gold: 60, wood: 30, stone: 10 }, jobs: 1, mood: 8, tavernGold: 4, job: 'cook', desc: 'Підіймає настрій усім, дає трохи золота.' },
    warehouse: { name: 'Склад', icon: 'Ск', color: '#8a7a6a', cost: { gold: 30, wood: 30, stone: 10 }, jobs: 0, storage: 150, desc: '+150 місця для кожного ресурсу.' },
    yard: { name: 'Караванний двір', icon: 'Кв', color: '#e0a060', cost: { gold: 80, wood: 40, stone: 15 }, jobs: 1, caravans: 1, job: 'trade', desc: 'Дозволяє відправляти каравани (по одному на двір).' },
    guard: { name: 'Варта', icon: 'В', color: '#6a7fd0', cost: { gold: 60, wood: 25, stone: 25 }, jobs: 2, defense: 3, job: 'guard', desc: 'Захищає від набігів. Вартові посилюють оборону.' },
  };
  const ORDER = ['house', 'farm', 'lumber', 'quarry', 'mine', 'fisher', 'herbalist', 'workshop', 'shop', 'tavern', 'warehouse', 'yard', 'guard'];
  Mech.BuildingData = { TYPES: T, ORDER };
  if (typeof module !== 'undefined' && module.exports) module.exports = Mech.BuildingData;
})(globalThis);
