// Атлас 2.0: каталог природних точок ресурсів (вузлів `resource.*`). Дані за resource_points.md; числа стартові, змінюються тут без правок коду генератора.
// Поля вузла: id, name, grp (ore/stone/wood/water/herb), mat (що добувають), res (ресурс механіки trade), on (де: land/river/lake/shore/sea/deep),
// bio (біоми; 'hills' = пагорби: низькі гори й підвищення поза горами, 'beach' = берег моря), h (висота над морем, м), tier (1..4), per (на регіон; perProv — на провінцію), dist (мін. відстань до такої ж точки, м), cond (додаткові умови).
(function () {
  'use strict';
  const A = globalThis.Atlas2;
  const MT = ['mountain'], MH = ['mountain', 'hills'], FOR = ['forest', 'taiga', 'jungle'], MEAD = ['grass', 'forest', 'steppe', 'savanna'], COLD = ['snow', 'tundra', 'taiga'];
  // [id, name, grp, mat, res, on, bio, h, tier, per, dist, cond]
  const R = (id, name, grp, mat, res, on, bio, h, tier, per, dist, cond) => ({ id: 'resource.' + id, name, grp, mat, res, on, bio, h, tier, per: per.length ? per : [per], perProv: !!(cond && cond.perProv), dist, cond: cond || {} });
  const LIST = [
    // 1. руди й копалини
    R('iron', 'Залізна жила', 'ore', 'Залізна руда (Fe)', 'ore', 'land', MH, [15, 120], 1, [1, 2], 150, { slope: 5 }),
    R('copper', 'Мідна жила', 'ore', 'Мідь (Cu)', 'ore', 'land', MH, [10, 100], 1, [1, 1], 200),
    R('tin', "Олов'яна жила", 'ore', "Олово (Sn), для бронзи", 'ore', 'land', MH, [0, 200], 1, [0, 1], 200, { near: ['copper', 300] }),
    R('coal', 'Вугільний пласт', 'ore', 'Вугілля (C)', 'ore', 'land', MH.concat(['swamp']), [0, 150], 1, [1, 2], 150, { slope: 3 }),
    R('quarry', 'Каменоломня-скеля', 'stone', 'Камінь (будівельний, пісковик)', 'stone', 'land', MT.concat(['desert', 'hills', 'beach']), [0, 260], 1, [2, 3], 100),
    R('silver', 'Срібна жила', 'ore', 'Срібло (Ag), свинець (Pb)', 'ore', 'land', MT, [40, 150], 2, [0, 1], 300),
    R('gold', 'Золота жила', 'ore', 'Золото (Au)', 'ore', 'land', MT, [60, 180], 2, [0, 1], 400),
    R('gold_placer', 'Золотий розсип', 'ore', 'Золото (Au), розсип', 'ore', 'river', MH, [20, 200], 2, [0, 1], 400),
    R('lead_zinc', 'Свинцево-цинкова жила', 'ore', 'Свинець, алюміній, магній', 'ore', 'land', MT, [20, 260], 2, [0, 1], 300),
    R('cobalt', 'Кобальтова жила', 'ore', 'Кобальт (Co), галій', 'ore', 'land', MT.concat(['snow']), [60, 280], 3, [0, 1], 500, { perProv: true }),
    R('tungsten', 'Вольфрамова жила', 'ore', 'Вольфрам (W)', 'ore', 'land', MT, [100, 280], 3, [0, 1], 500, { perProv: true }),
    R('titanium', 'Титанова жила', 'ore', 'Титан (Ti)', 'ore', 'land', MT, [120, 300], 3, [1, 1], 600, { perProv: true }),
    R('mithril', 'Міфрилова жила', 'ore', 'Міфріл', 'ore', 'land', MT, [180, 300], 3, [1, 1], 800, { perProv: true, rare: 0.4 }),
    R('sulfur', 'Сірчаний вихід', 'ore', 'Сірка (S), фосфор (P)', 'ore', 'land', ['mountain', 'desert', 'swamp'], [0, 260], 1, [0, 1], 300),
    R('gas_cave', 'Газова/ртутна печера', 'ore', "Ртуть, миш'як, хлор, гелій, аргон", 'ore', 'land', ['mountain', 'swamp'], [0, 260], 2, [0, 1], 400),
    R('limestone', 'Вапнякова скеля', 'stone', 'Кальцій (Ca), вапно', 'stone', 'land', MT.concat(['beach']), [0, 260], 1, [0, 1], 200),
    R('gems', 'Самоцвітна жила', 'ore', 'Алмази, сапфіри, рубіни, смарагди, аметисти', 'ore', 'land', MT, [40, 300], 3, [0, 1], 500, { rare: 0.6 }),
    R('isle_ore', 'Острівна жила', 'ore', 'Рідкісна руда, скарби', 'ore', 'land', ['mountain', 'hills', 'grass', 'forest', 'steppe', 'savanna', 'desert'], [5, 200], 1, [0, 1], 500, { isle: true }),
    R('clay', 'Глиняне русло', 'stone', 'Глина', 'stone', 'land', ['grass', 'swamp', 'forest', 'steppe', 'savanna'], [0, 40], 1, [1, 2], 100, { water: 120 }),
    R('sand', 'Піщана коса', 'stone', 'Пісок (скло)', 'stone', 'land', ['beach', 'desert'], [0, 80], 1, [1, 2], 150),
    R('salt', 'Соляна копальня/озеро', 'stone', 'Сіль', 'stone', 'land', ['desert', 'beach', 'mountain'], [0, 260], 1, [0, 1], 300),
    R('peat', 'Торфовище', 'stone', 'Торф (паливо)', 'stone', 'land', ['swamp'], [0, 60], 1, [0, 1], 150),
    // 2. ліс
    R('oak_grove', 'Листяний гай', 'wood', 'Колоди, тверда деревина (дуб, бук)', 'wood', 'land', ['forest', 'grass', 'jungle'], [0, 130], 1, [2, 3], 120),
    R('birch_grove', 'Березовий гай', 'wood', 'Береза, кора', 'wood', 'land', ['forest', 'grass', 'taiga', 'steppe'], [0, 130], 1, [1, 2], 120),
    R('pine_forest', 'Хвойний бір', 'wood', 'Ялина, сосна, смола', 'wood', 'land', ['snow', 'mountain', 'forest', 'taiga', 'tundra'], [20, 240], 1, [1, 2], 120),
    R('palm_grove', 'Пальмовий гай', 'wood', 'Пальма, листя, кокоси', 'wood', 'land', ['beach', 'desert', 'savanna', 'jungle'], [0, 40], 1, [0, 1], 150, { water: 200 }),
    R('willow', 'Болотяна верба', 'wood', "Верба (пруття, кошики)", 'wood', 'land', ['swamp'], [0, 40], 1, [0, 1], 120),
    R('giant_tree', 'Велетенське дерево', 'wood', 'Рідкісна цінна деревина', 'wood', 'land', ['forest', 'jungle'], [0, 130], 2, [0, 1], 400, { rare: 0.5 }),
    // 3. вода
    R('river_pool', 'Річкове плесо', 'water', 'Прісна риба', 'fish', 'river', null, [0, 180], 1, [2, 3], 80, { acc: 30 }),
    R('lake_fish', 'Озеро', 'water', 'Риба, раки', 'fish', 'lake', null, [0, 260], 1, [1, 2], 100),
    R('sea_shore', 'Морський берег', 'water', 'Риба, краби, мушлі', 'fish', 'shore', null, null, 1, [2, 3], 100),
    R('deep_sea', 'Глибоководне місце', 'water', 'Велика риба', 'fish', 'deep', null, null, 2, [1, 2], 400),
    R('pearl_bank', 'Мілина з перлинами', 'water', 'Перлини, мушлі, корали', 'fish', 'shore', null, null, 2, [0, 1], 300, { warm: true }),
    R('ice_hole', 'Крижана ополонка', 'water', 'Риба, лід', 'fish', 'lake', null, null, 1, [0, 1], 200, { cold: true }),
    // 5. збирання
    R('meadow_herbs', 'Лучна галявина трав', 'herb', 'Цілюще зілля (подорожник, ромашка, конюшина)', 'herbs', 'land', ['grass', 'forest', 'steppe', 'savanna'], [0, 80], 1, [2, 4], 60),
    R('forest_glade', 'Лісова галявина', 'herb', 'Лісова квітка, папороть, мох', 'herbs', 'land', FOR, [0, 130], 1, [2, 3], 60),
    R('mushrooms', 'Грибне місце', 'herb', 'Мухомор, боровик', 'herbs', 'land', ['forest', 'swamp', 'taiga'], [0, 130], 1, [1, 3], 80),
    R('berries', 'Ягідник', 'herb', 'Ягоди, горіхи, дика вишня', 'herbs', 'land', ['forest', 'grass', 'taiga'], [0, 130], 1, [1, 3], 80),
    R('lavender', 'Лавандове поле', 'herb', 'Лаванда, соняшник, ірис', 'herbs', 'land', ['grass', 'steppe'], [0, 80], 1, [0, 1], 100),
    R('fire_bloom', 'Вогнецвіт', 'herb', 'Вогнецвіт (fire_bloom)', 'herbs', 'land', ['desert', 'savanna', 'mountain'], [0, 200], 1, [0, 1], 200, { warm: true }),
    R('alpine_flower', 'Високогірна квітка', 'herb', 'Едельвейс, тирлич', 'herbs', 'land', MT, [100, 260], 1, [1, 1], 200),
    R('reeds', 'Очеретяні зарості', 'herb', 'Очерет, рогіз, ірис', 'herbs', 'land', ['swamp', 'grass', 'forest', 'savanna'], [0, 40], 1, [1, 2], 80, { water: 40 }),
    R('wild_flax', 'Льон-дичка', 'herb', 'Льон (волокно)', 'herbs', 'land', ['grass', 'steppe'], [0, 80], 1, [0, 1], 100),
    R('wild_bees', 'Дикі бджоли (борть)', 'herb', 'Мед, віск', 'herbs', 'land', ['forest', 'grass'], [0, 130], 1, [0, 2], 200),
    R('wild_grain', 'Дикі злаки', 'herb', 'Зерно, солома', 'grain', 'land', ['grass', 'steppe', 'savanna'], [0, 80], 1, [1, 2], 100),
    R('beach_finds', 'Пляжні знахідки', 'herb', 'Мушлі, плавник, бурштин', 'herbs', 'land', ['beach'], [0, 30], 1, [2, 3], 100),
    R('resin', 'Лісова смола/кора', 'herb', 'Смола, кора, дьоготь', 'wood', 'land', ['taiga', 'snow', 'forest'], [0, 240], 1, [0, 1], 120),
    R('nests', 'Пташині гнізда', 'herb', "Пір'я, яйця", 'herbs', 'land', ['mountain', 'beach'], [0, 260], 1, [0, 2], 150, { slope: 8 }),
    // мисливські угіддя (тварини в ANIM), 2–4 на регіон
    R('hunt_meadow', 'Мисливські угіддя луків', 'hunt', 'Дичина, шкури', 'food', 'land', ['grass', 'steppe', 'savanna'], [0, 90], 1, [2, 3], 200),
    R('hunt_forest', 'Мисливські угіддя лісу', 'hunt', 'Дичина, шкури, хутро', 'food', 'land', FOR, [0, 140], 1, [2, 4], 200),
    R('hunt_mountain', 'Мисливські угіддя гір', 'hunt', 'Дичина, шкури, пір\'я', 'food', 'land', ['mountain'], [0, 260], 1, [1, 3], 200),
    R('hunt_snow', 'Мисливські угіддя півночі', 'hunt', 'Дичина, хутро', 'food', 'land', ['snow', 'tundra'], [0, 260], 1, [1, 3], 200),
    R('hunt_desert', 'Мисливські угіддя пустелі', 'hunt', 'Дичина, шкури', 'food', 'land', ['desert'], [0, 120], 1, [1, 2], 200),
    R('hunt_swamp', 'Мисливські угіддя боліт', 'hunt', 'Дичина, пір\'я', 'food', 'land', ['swamp'], [0, 60], 1, [1, 3], 200),
    R('hunt_coast', 'Берегові угіддя', 'hunt', 'Краби, птахи', 'food', 'land', ['beach'], [0, 30], 1, [1, 2], 200),
    // додано поверх файлу (для основи економіки): джерела питної води
    R('spring', 'Джерело', 'water', 'Питна вода', 'water', 'land', ['grass', 'forest', 'steppe', 'savanna', 'taiga', 'mountain', 'jungle', 'swamp'], [0, 220], 1, [0, 1], 150),
    // орні землі: ставляться лише навколо поселень, щоб покрити їжу (balance)
    R('farmland', 'Орні землі', 'farm', 'Зерно, овочі', 'food', 'land', ['grass', 'steppe', 'savanna', 'forest'], [0, 70], 1, [0, 0], 300, { bal: true, slope: 0 }),
  ];
  // відповідність тірів файлу тірам небезпеки світу (W.tier 0..6)
  const TIER = { 1: [0, 3], 2: [2, 4], 3: [3, 6], 4: [4, 6] };
  // добуток за добу на звичайному вузлі: [категорія, що саме, кількість]; бідний ×0,7, багатий ×1,35 (випадково). Категорії: food, water, wood, stone, ore, herbs, hide
  const OUT = {
    iron: [['ore', 'Залізна руда', 15]], copper: [['ore', 'Мідь', 12]], tin: [['ore', 'Олово', 8]], coal: [['ore', 'Вугілля', 15]], quarry: [['stone', 'Камінь', 20]], silver: [['ore', 'Срібло', 5]],
    gold: [['ore', 'Золото', 3]], gold_placer: [['ore', 'Золото (розсип)', 2]], lead_zinc: [['ore', 'Свинець, цинк', 8]], cobalt: [['ore', 'Кобальт', 3]], tungsten: [['ore', 'Вольфрам', 3]],
    titanium: [['ore', 'Титан', 3]], mithril: [['ore', 'Міфріл', 1]], sulfur: [['ore', 'Сірка', 6]], gas_cave: [['ore', 'Ртуть, гази', 3]], limestone: [['stone', 'Вапняк', 15]], gems: [['ore', 'Самоцвіти', 2]],
    isle_ore: [['ore', 'Рідкісна руда', 4]], clay: [['stone', 'Глина', 15]], sand: [['stone', 'Пісок', 20]], salt: [['stone', 'Сіль', 10]], peat: [['wood', 'Торф', 12]],
    oak_grove: [['wood', 'Деревина дуба', 20]], birch_grove: [['wood', 'Береза', 15]], pine_forest: [['wood', 'Хвоя', 18], ['herbs', 'Смола', 3]], palm_grove: [['wood', 'Пальма', 8]], willow: [['wood', 'Верба', 8]],
    giant_tree: [['wood', 'Цінна деревина', 6]], river_pool: [['food', 'Риба', 10]], lake_fish: [['food', 'Риба, раки', 8]], sea_shore: [['food', 'Риба, краби', 12]], deep_sea: [['food', 'Велика риба', 25]],
    pearl_bank: [['food', 'Мушлі', 3], ['ore', 'Перлини', 1]], ice_hole: [['food', 'Риба', 6]], meadow_herbs: [['herbs', 'Цілюще зілля', 8]], forest_glade: [['herbs', 'Лісові трави', 6]],
    mushrooms: [['food', 'Гриби', 6]], berries: [['food', 'Ягоди, горіхи', 8]], lavender: [['herbs', 'Лаванда', 5]], fire_bloom: [['herbs', 'Вогнецвіт', 3]], alpine_flower: [['herbs', 'Високогірні квіти', 3]],
    reeds: [['herbs', 'Очерет', 12]], wild_flax: [['herbs', 'Льон', 8]], wild_bees: [['food', 'Мед', 4], ['herbs', 'Віск', 2]], wild_grain: [['food', 'Дикі злаки', 12]], beach_finds: [['herbs', 'Мушлі, бурштин', 3]],
    resin: [['herbs', 'Смола, дьоготь', 5]], nests: [['food', 'Яйця', 4], ['herbs', 'Пір\'я', 3]],
    hunt_meadow: [['food', 'М\'ясо', 8], ['hide', 'Шкури', 3]], hunt_forest: [['food', 'М\'ясо', 12], ['hide', 'Шкури', 4]], hunt_mountain: [['food', 'М\'ясо', 8], ['hide', 'Шкури', 3]],
    hunt_snow: [['food', 'М\'ясо', 7], ['hide', 'Хутро', 5]], hunt_desert: [['food', 'М\'ясо', 6], ['hide', 'Шкури', 2]], hunt_swamp: [['food', 'М\'ясо', 7], ['hide', 'Пір\'я', 2]], hunt_coast: [['food', 'Краби, птахи', 6]],
    spring: [['water', 'Питна вода', 30]], farmland: [['food', 'Зерно, овочі', 40]],
  };
  const ANIM = {
    hunt_meadow: ['Заєць', 'Олень', 'Лисиця'], hunt_forest: ['Олень', 'Кабан', 'Заєць', 'Вовк', 'Ведмідь'], hunt_mountain: ['Гірський козел', 'Орел', 'Вовк', 'Ведмідь'],
    hunt_snow: ['Білий заєць', 'Песець', 'Вовк', 'Білий ведмідь'], hunt_desert: ['Верблюд', 'Ящірка', 'Скорпіон'], hunt_swamp: ['Жаба', 'Чапля', 'Кабан'], hunt_coast: ['Краб', 'Чайка'],
  };
  // дорога до точки: cart — возовий шлях (шахти, каменоломні, ліс, поля), trail — стежка (угіддя, трави, вода)
  const CART = new Set(['iron', 'copper', 'tin', 'coal', 'quarry', 'silver', 'gold', 'lead_zinc', 'cobalt', 'tungsten', 'titanium', 'mithril', 'sulfur', 'gas_cave', 'limestone', 'gems', 'isle_ore', 'clay', 'sand', 'salt', 'peat', 'oak_grove', 'birch_grove', 'pine_forest', 'palm_grove', 'giant_tree', 'farmland']);
  for (const t of LIST) { const k = t.id.slice(9); t.out = OUT[k] || []; t.animals = ANIM[k] || null; t.road = t.on === 'deep' || t.on === 'shore' ? null : CART.has(k) ? 'cart' : 'trail'; }
  A.ResData = { LIST, TIER, byId: Object.fromEntries(LIST.map(t => [t.id, t])) };
})();
