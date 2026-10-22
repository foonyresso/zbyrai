/* Автоматично: node tools/build-atlas-registry.mjs. Не правити вручну: правте файли в папках. */
/* monsters/aggressive-mountain-bird.js */
Atlas.registerMonster({
  "format": 2,
  "id": "aggressive-mountain-bird",
  "name": "Агресивний гірський птах",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "copper-nests",
      "mountain",
      "peaks"
    ],
    "worlds": [
      "midnokryl"
    ]
  },
  "order": 239,
  "lore": {
    "description": "Дикий птах, що б'є непроханих гостей біля гнізд.",
    "behavior": "Охороняє гніздо.",
    "abilities": [
      "пікірування",
      "кігті"
    ],
    "drops": [
      "міцне пір'я",
      "кігті"
    ]
  }
});

/* monsters/alfa-varh.js */
Atlas.registerMonster({
  format: 1,
  id: "alfa-varh",
  name: "Альфа-Варг",
  kind: "mini-boss",
  nature: "threat",
  alias: "Вожак Зграї",
  spawn: { biomes: ["forest", "taiga", "enchanted"], worlds: "all" },
  order: 69,
});

/* monsters/ancient-lumberjack.js */
Atlas.registerMonster({
  "format": 2,
  "id": "ancient-lumberjack",
  "name": "Стародавній Лісоруб",
  "kind": "world-boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "moss-trunks",
      "jungle"
    ],
    "worlds": [
      "vershynnytsia"
    ]
  },
  "order": 231,
  "lore": {
    "description": "Велетень із сокирою, що охороняє серцевину прадавнього дерева.",
    "behavior": "Стоїть біля серцевини.",
    "abilities": [
      "удар сокирою",
      "вирубування платформ"
    ],
    "drops": [
      "серцевина прадавнього дерева"
    ]
  }
});

/* monsters/ancient-tree-dragon.js */
Atlas.registerMonster({
  "format": 2,
  "id": "ancient-tree-dragon",
  "name": "Давній деревний дракон",
  "kind": "mini-boss",
  "nature": "magic",
  "alias": "Охоронець Гнізд",
  "spawn": {
    "biomes": [
      "garden-branches",
      "root-coasts",
      "upper-light-gardens",
      "branch-plains"
    ],
    "worlds": [
      "astrakor",
      "vershynnytsia"
    ]
  },
  "order": 204,
  "lore": {
    "description": "Дракон із деревною лускою, що охороняє гнізда в порожнистих коренях і на верхівках.",
    "behavior": "Не залишає гнізда, прогонює всіх, хто підійшов; жодного разу не покидає свого дерева.",
    "abilities": [
      "деревна луска",
      "подих спор",
      "оплутування лозами"
    ],
    "drops": [
      "смола велетенських дерев",
      "луска з деревини",
      "яйця (рідкісні)"
    ]
  }
});

/* monsters/archivist-of-remains.js */
Atlas.registerMonster({
  "format": 2,
  "id": "archivist-of-remains",
  "name": "Архіваріус Решток",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "citadel-graveyard"
    ],
    "worlds": [
      "ostanky"
    ]
  },
  "order": 213,
  "lore": {
    "description": "Постать у сутані з уламків, що збирає частини зруйнованих споруд.",
    "behavior": "Складає й розбирає арену з уламків, що літають.",
    "abilities": [
      "збирання споруд",
      "виклик уламків"
    ],
    "drops": [
      "реліквія архіву"
    ]
  }
});

/* monsters/arkhidrakon-kryzhanoho-pekla.js */
Atlas.registerMonster({
  format: 1,
  id: "arkhidrakon-kryzhanoho-pekla",
  name: "Архідракон Крижаного Пекла",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["peaks", "tundra", "snow"], worlds: "all" },
  order: 105,
});

/* monsters/arkhisadivnyk.js */
Atlas.registerMonster({
  "format": 2,
  "id": "arkhisadivnyk",
  "name": "Архісадівник",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "soborni-dibrovy",
      "korenevi-katakomby",
      "kvitkovi-terasy",
      "sporovi-dolyny",
      "sklyani-pelyustkovi-hory"
    ],
    "worlds": [
      "illariya"
    ]
  },
  "order": 741,
  "lore": {
    "description": "Архісадівник вирощує арену під час бою."
  }
});

/* monsters/arkhitektor-mertvykh-pryplyviv.js */
Atlas.registerMonster({
  format: 2,
  id: "arkhitektor-mertvykh-pryplyviv",
  name: "Архітектор Мертвих Припливів",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 839,
  lore: {
    description: "Багатокутний морський велетень із коралових стовпів, мушель і зеленуватих скляних пластин.",
    behavior: "Перебуває в затопленому місті під час найнижчого припливу.",
    abilities: ["перебудовує берег під час бою, відкриваючи провалля та створюючи тимчасові стіни з води"],
  },
});

/* monsters/arkhont-hrozovykh-khmar.js */
Atlas.registerMonster({
  format: 2,
  id: "arkhont-hrozovykh-khmar",
  name: "Архонт грозових хмар",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["peaks"], worlds: "all" },
  order: 266,
  lore: {
    description: "Повітряний дух.",
    behavior: "Зустрічається: літаючі острови.",
    abilities: ["блискавки", "грозові фронти", "повітряні леза"],
  },
});

/* monsters/arkhont-koshmaru.js */
Atlas.registerMonster({
  "format": 2,
  "id": "arkhont-koshmaru",
  "name": "Архонт Кошмару",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "lavandovi-sny",
      "koshmarni-lisy",
      "dolyny-myakykh-skel",
      "bili-sady-spohadiv",
      "chorni-porozhnechi"
    ],
    "worlds": [
      "umbralit"
    ]
  },
  "order": 777,
  "lore": {
    "description": "Архонт Кошмару змінює арену відповідно до дій гравця."
  }
});

/* monsters/arkhont-padinnya.js */
Atlas.registerMonster({
  "format": 2,
  "id": "arkhont-padinnya",
  "name": "Архонт Падіння",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "midni-krony",
      "sklyani-ustupy",
      "korenevi-bezodni",
      "burshtynovi-plato",
      "pylovi-arkhipelahy"
    ],
    "worlds": [
      "velarium"
    ]
  },
  "order": 701,
  "lore": {
    "description": "Архонт Падіння перевертає цілі бойові арени."
  }
});

/* monsters/arkhont-semy-tyazhin.js */
Atlas.registerMonster({
  format: 2,
  id: "arkhont-semy-tyazhin",
  name: "Архонт семи тяжінь",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["peaks", "wasteland", "hills", "grass"], worlds: "all" },
  order: 460,
  lore: {
    description: "Масивний чотирикрилий звір із металевими пластинами.",
    behavior: "Руїни небесної обсерваторії.",
    abilities: ["змінює силу тяжіння в окремих секторах арени"],
  },
});

/* monsters/armoured-rootgnawer.js */
Atlas.registerMonster({
  "format": 2,
  "id": "armoured-rootgnawer",
  "name": "Панцирний коренегриз",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "star-caverns",
      "grass",
      "garden-branches"
    ],
    "worlds": [
      "astrakor"
    ]
  },
  "order": 202,
  "lore": {
    "description": "Панцирний гризун завбільшки з віз, що прокладає тунелі під ґрунтом.",
    "behavior": "Риє під землею, виринає під ногами; тунелі лишаються як підземні ходи.",
    "abilities": [
      "рит тунелів",
      "панцир",
      "гризіння коріння"
    ],
    "drops": [
      "кореневий бурштин",
      "панцирні пластини"
    ]
  }
});

/* monsters/aspydochelon.js */
Atlas.registerMonster({
  format: 1,
  id: "aspydochelon",
  name: "Аспидочелон",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["deep"], worlds: "all" },
  order: 92,
});

/* monsters/asteroyidnyy-vartovyy.js */
Atlas.registerMonster({
  "format": 2,
  "id": "asteroyidnyy-vartovyy",
  "name": "Астероїдний Вартовий",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "meteorni-rivnyny",
      "chorni-kratery",
      "sklyani-polya",
      "stari-udarni-hory",
      "midni-dolyny",
      "irzhavi-lisy",
      "sribni-plato",
      "kraterni-bolota"
    ],
    "worlds": [
      "asterfell"
    ]
  },
  "order": 806,
  "lore": {
    "description": "Бос світу «Астерфелл»."
  }
});

/* monsters/avtonomni-storozhi.js */
Atlas.registerMonster({
  "format": 2,
  "id": "avtonomni-storozhi",
  "name": "Автономні сторожі",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "shesterenni-pahorby",
      "midni-lisy",
      "pruzhynni-bolota",
      "mayatnykovi-ushchelyny",
      "zaly-pershotvortsiv"
    ],
    "worlds": [
      "kaldras"
    ]
  },
  "order": 712,
  "lore": {
    "description": "Загроза світу «Кальдрас»."
  }
});

/* monsters/bahatonizhka-pechernyk.js */
Atlas.registerMonster({
  format: 2,
  id: "bahatonizhka-pechernyk",
  name: "Багатоніжка-печерник",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 401,
  lore: {
    description: "Членистоноге.",
    behavior: "Зустрічається: вологі печери.",
    abilities: ["швидкі укуси", "ховається у тріщинах"],
  },
});

/* monsters/bahnyukovyy-rehent.js */
Atlas.registerMonster({
  format: 2,
  id: "bahnyukovyy-rehent",
  name: "Багнюковий Регент",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["swamp", "wasteland", "hills", "lake"], worlds: "all" },
  order: 845,
  lore: {
    description: "Регіональний бос із десятків глиняних масок, зібраних у високу фігуру з шістьма ліктями.",
    behavior: "Править у затопленому палаці серед боліт із червоним очеретом.",
    abilities: ["змінює маски, набуваючи різних бойових стилів, а розбиті маски залишають на землі липкі глиняні поля"],
  },
});

/* monsters/bahryanyy-barabannyk.js */
Atlas.registerMonster({
  format: 2,
  id: "bahryanyy-barabannyk",
  name: "Багряний барабанник",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 466,
  lore: {
    description: "Панцирний гігант із барабаноподібною грудною кліткою.",
    behavior: "Червоні базальтові сходи.",
    abilities: ["удари породжують хвилі, що руйнують укриття й порушують рівновагу"],
  },
});

/* monsters/bahryanyy-oberten-svitu.js */
Atlas.registerMonster({
  format: 2,
  id: "bahryanyy-oberten-svitu",
  name: "Багряний Обертень Світу",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "volcanic"], worlds: "all" },
  order: 835,
  lore: {
    description: "Велетенська чотирирука істота з чорного базальту, крізь тріщини якого пульсують червоні зоряні жили.",
    behavior: "Спить під центральним кратером стародавнього материка.",
    abilities: ["перевертає ділянки землі, змушуючи скелі й будівлі обертатися навколо себе, а під час другої фази розколює горизонтальні пласти ґрунту"],
  },
});

/* monsters/bandyt.js */
Atlas.registerMonster({
  format: 2,
  id: "bandyt",
  name: "Бандит",
  kind: "monster",
  nature: "threat",
  variants: ["бандит-мечник", "бандит-лучник", "бандит-важковаговик"],
  spawn: { biomes: ["forest", "taiga", "grass", "hills"], worlds: "all" },
  order: 355,
  lore: {
    description: "Звичайний гуманоїд. Об'єднує схожих істот: бандит-мечник, бандит-лучник, бандит-важковаговик.",
    behavior: "Зустрічається: лісові дороги, табори; скелі, лісові стежки; розбійницькі фортеці.",
    abilities: ["короткий меч", "ухилення", "лук", "засідки", "дворучна сокира", "повільні сильні удари"],
  },
});

/* monsters/barabannyy-kaban.js */
Atlas.registerMonster({
  format: 2,
  id: "barabannyy-kaban",
  name: "Барабанний Кабан",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["forest"], worlds: "all" },
  order: 787,
  lore: {
    description: "Круглобокий кабан із дерев’яними пластинами на спині, порожнистими боками та короткими бивнями.",
    behavior: "Мешкає в Березових гаях-барабанах.",
    abilities: ["вибиває копитами ритм, що прискорює рух своєї зграї й уповільнює реакції ворога"],
  },
});

/* monsters/baran.js */
Atlas.registerMonster({
  format: 2,
  id: "baran",
  name: "Баран",
  kind: "monster",
  nature: "magic",
  variants: ["магічний чорний баран", "гірський баран"],
  spawn: { biomes: ["mountain", "hills", "grass"], worlds: "all" },
  order: 340,
  lore: {
    description: "Елітний звір. Об'єднує схожих істот: магічний чорний баран, гірський баран.",
    behavior: "Зустрічається: гірські пасовища; кам’янисті плато.",
    abilities: ["лобовий таран", "кам’яні роги", "таран", "захист рогами"],
  },
});

/* monsters/behemot.js */
Atlas.registerMonster({
  format: 1,
  id: "behemot",
  name: "Бегемот",
  kind: "boss",
  nature: "threat",
  spawn: { biomes: ["hills", "mountain", "peaks"], worlds: "all" },
  order: 59,
});

/* monsters/beregova-motuziaka.js */
Atlas.registerMonster({
  "format": 2,
  "id": "beregova-motuziaka",
  "name": "Берегова мотузяка",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "tag:shore",
      "tag:water",
      "tag:sea",
      "tag:fresh"
    ],
    "worlds": "all"
  },
  "order": 978,
  "lore": {
    "description": "Довга водорость із щупальцями, що ловить ноги.",
    "behavior": "Лежить прихована в припливі.",
    "abilities": [
      "хапає й тягне до води",
      "огортає липким слизом"
    ],
    "drops": [
      "водорості",
      "мотузка припливу"
    ]
  }
});

/* monsters/bezholosyy-korol.js */
Atlas.registerMonster({
  "format": 2,
  "id": "bezholosyy-korol",
  "name": "Безголосий Король",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "dzvinki-khrebty",
      "tykhi-porozhnyny",
      "spivochi-stepy",
      "rezonansni-lisy",
      "basovi-bezodni"
    ],
    "worlds": [
      "runhar"
    ]
  },
  "order": 751,
  "lore": {
    "description": "Безголосий Король поглинає звуки арени."
  }
});

/* monsters/bezimennyy-krok.js */
Atlas.registerMonster({
  "format": 2,
  "id": "bezimennyy-krok",
  "name": "Безіменний Крок",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "plavayuchi-skhody",
      "sady-okremykh-plyt",
      "mosty-bez-kintsya",
      "porozhni-arkhivy",
      "kray-znyklykh-dorih"
    ],
    "worlds": [
      "neverion"
    ]
  },
  "order": 745,
  "lore": {
    "description": "Безіменний Крок руйнує дороги навколо себе."
  }
});

/* monsters/bezimennyy-ostanniy-boh.js */
Atlas.registerMonster({
  "format": 2,
  "id": "bezimennyy-ostanniy-boh",
  "name": "Безіменний Останній Бог",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "reberni-hory",
      "krovyani-dolyny",
      "popelyasti-rivnyny",
      "cherepni-pechery",
      "sady-zabutykh-imen",
      "cherepni-plato",
      "kistyani-ustupy",
      "pylovi-dolyny",
      "pechery-khrebtsiv"
    ],
    "worlds": [
      "morgalis"
    ]
  },
  "order": 732,
  "lore": {
    "description": "Безіменний Останній Бог поглинає імена ворогів."
  }
});

/* monsters/bezkoronnyy-polkovodets.js */
Atlas.registerMonster({
  "format": 2,
  "id": "bezkoronnyy-polkovodets",
  "name": "Безкоронний Полководець",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "praporni-rivnyny",
      "yalynovi-peredmurya",
      "kamyani-bastiony",
      "zruynovani-korolivski-sady"
    ],
    "worlds": [
      "trykoron"
    ]
  },
  "order": 866,
  "lore": {
    "description": "Бос світу «Трикорон»."
  }
});

/* monsters/bezlykyy-volodar-dzerkal.js */
Atlas.registerMonster({
  format: 2,
  id: "bezlykyy-volodar-dzerkal",
  name: "Безликий володар дзеркал",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["crystal", "wasteland", "hills"], worlds: "all" },
  order: 269,
  lore: {
    description: "Магічна істота.",
    behavior: "Зустрічається: дзеркальний палац.",
    abilities: ["створює копії супротивників", "відбиває закляття", "викривлює простір"],
  },
});

/* monsters/bezodnya-shcho-dyvytsya.js */
Atlas.registerMonster({
  format: 1,
  id: "bezodnya-shcho-dyvytsya",
  name: "Безодня, Що Дивиться",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["deep"], worlds: "all" },
  order: 103,
});

/* monsters/bila-koroleva-pylu.js */
Atlas.registerMonster({
  format: 2,
  id: "bila-koroleva-pylu",
  name: "Біла королева пилу",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["desert"], worlds: "all" },
  order: 479,
  lore: {
    description: "Плаваюча фігура під вуаллю з мінерального пилу.",
    behavior: "Пустельний амфітеатр.",
    abilities: ["розчиняється в хмарах і створює копії з піску"],
  },
});

/* monsters/bilyy-perekovuvach-pir.js */
Atlas.registerMonster({
  format: 2,
  id: "bilyy-perekovuvach-pir",
  name: "Білий Перековувач Пір",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["peaks"], worlds: "all" },
  order: 741,
  lore: {
    description: "Чотирирукий велет із мармуровим тулубом, крижаними плечима й корою, що проростає крізь обладунок.",
    behavior: "Дрімає в серці Календарних Альп.",
    abilities: ["змінює пори року навколо себе, перетворюючи арену на весняне болото, літню спеку, осіннє листопаддя або слизький лід"],
  },
});

/* monsters/bizon.js */
Atlas.registerMonster({
  format: 2,
  id: "bizon",
  name: "Бізон",
  kind: "monster",
  nature: "magic",
  variants: ["гігантський бізон", "грозовий зубр", "квадратнолапий бізон"],
  spawn: { biomes: ["steppe", "deep", "sea"], worlds: "all" },
  order: 374,
  lore: {
    description: "Звір. Об'єднує схожих істот: гігантський бізон, грозовий зубр, квадратнолапий бізон.",
    behavior: "Зустрічається: степи; штормові рівнини; Високотравні степи.",
    abilities: ["таран", "розкид ворогів", "електричні роги", "ударна хвиля", "квадратнолапий бізон: швидко розганяється рівниною, не втрачаючи рівноваги"],
  },
});

/* monsters/blakytnyy-plavnyk-serp.js */
Atlas.registerMonster({
  format: 2,
  id: "blakytnyy-plavnyk-serp",
  name: "Блакитний плавник-серп",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 690,
  lore: {
    description: "Швидка риба з серпоподібним спинним плавцем.",
    behavior: "Відкриті морські простори.",
    abilities: ["прорізає воду прямими ривками та залишає різкі хвилі"],
  },
});

/* monsters/blood-knight.js */
Atlas.registerMonster({
  "format": 2,
  "id": "blood-knight",
  "name": "Кров'яний лицар",
  "kind": "mini-boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "blood-wells"
    ],
    "worlds": [
      "krovostep"
    ]
  },
  "order": 220,
  "lore": {
    "description": "Лицар у червоних обладунках, що охороняє джерела життєвої рідини.",
    "behavior": "Не залишає колодязя.",
    "abilities": [
      "поглинання крові",
      "захисний шолом"
    ],
    "drops": [
      "кривавий гранат"
    ]
  }
});

/* monsters/blood-patriarch.js */
Atlas.registerMonster({
  "format": 2,
  "id": "blood-patriarch",
  "name": "Кривавий Патріарх",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "crimson-barrows",
      "blood-wells"
    ],
    "worlds": [
      "krovostep"
    ]
  },
  "order": 222,
  "lore": {
    "description": "Істота, що притягує до себе дрібних хижаків.",
    "behavior": "Збирає зграї довкола себе й живиться ними.",
    "abilities": [
      "поклик хижаків",
      "висмоктування"
    ],
    "drops": [
      "корона з кісток"
    ]
  }
});

/* monsters/blood-wolf.js */
Atlas.registerMonster({
  "format": 2,
  "id": "blood-wolf",
  "name": "Кровопивний вовк",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "wasteland",
      "crimson-barrows",
      "black-rifts"
    ],
    "worlds": [
      "krovostep"
    ]
  },
  "order": 216,
  "lore": {
    "description": "Вовк із червоною шерстю, що полює зграями й відновлює сили кров'ю жертв.",
    "behavior": "Полює зграєю, слідкує за пораненими.",
    "abilities": [
      "відновлення від укусу",
      "зграя"
    ],
    "drops": [
      "червоне хутро",
      "ікла"
    ]
  }
});

/* monsters/blukayuchi-vohnyky.js */
Atlas.registerMonster({
  format: 1,
  id: "blukayuchi-vohnyky",
  name: "Блукаючі вогники",
  kind: "other",
  nature: "magic",
  spawn: { biomes: ["swamp", "forest", "enchanted", "ashlands"], worlds: "all" },
  order: 133,
});

/* monsters/blyskavychni-vovky.js */
Atlas.registerMonster({
  "format": 2,
  "id": "blyskavychni-vovky",
  "name": "Блискавичні вовки",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "synohromovi-stepy",
      "sklyani-kanyony",
      "burshtynovi-vysoty",
      "hromovi-bolota",
      "chorni-providni-pechery",
      "hromovi-stepy",
      "chorni-plato",
      "sukhi-veresovyshcha",
      "dolyny-blyskavychnoho-kamenyu"
    ],
    "worlds": [
      "eshkariya"
    ]
  },
  "order": 717,
  "lore": {
    "description": "Загроза світу «Ешкарія»."
  }
});

/* monsters/bolotna-koroleva-zhab.js */
Atlas.registerMonster({
  format: 1,
  id: "bolotna-koroleva-zhab",
  name: "Болотна Королева Жаб",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["swamp"], worlds: "all" },
  order: 111,
});

/* monsters/bolotni-hidry.js */
Atlas.registerMonster({
  format: 1,
  id: "bolotni-hidry",
  name: "Болотні гідри",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["swamp", "jungle"], worlds: "all" },
  order: 120,
});

/* monsters/bolotni-zhaby-pererostky.js */
Atlas.registerMonster({
  format: 1,
  id: "bolotni-zhaby-pererostky",
  name: "Болотні жаби-переростки",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["swamp", "jungle"], worlds: "all" },
  order: 131,
});

/* monsters/bolotno-kryzhanyy-zhrets.js */
Atlas.registerMonster({
  "format": 2,
  "id": "bolotno-kryzhanyy-zhrets",
  "name": "Болотно-Крижаний Жрець",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "syni-torfovyshcha",
      "chorni-tryasovyny",
      "kryvi-verby",
      "hazovi-pechery"
    ],
    "worlds": [
      "nokserra"
    ]
  },
  "order": 813,
  "lore": {
    "description": "Бос світу «Ноксерра»."
  }
});

/* monsters/bolotnyi-bulbashnyk.js */
Atlas.registerMonster({
  "format": 2,
  "id": "bolotnyi-bulbashnyk",
  "name": "Болотяний бульбашник",
  "kind": "weak",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "tag:swamp",
      "tag:wet"
    ],
    "worlds": "all"
  },
  "order": 940,
  "lore": {
    "description": "Прозорий кубічний слиз із бульбашками газу всередині.",
    "behavior": "Пливе по ряскі, лопається, коли його чіпають.",
    "abilities": [
      "лопається й відкидає хмарку смердючого газу",
      "липка плівка уповільнює"
    ],
    "drops": [
      "бульбашка газу",
      "болотний слиз"
    ]
  }
});

/* monsters/bolotnyy-hidra-pan.js */
Atlas.registerMonster({
  format: 1,
  id: "bolotnyy-hidra-pan",
  name: "Болотний Гідра-Пан",
  kind: "boss",
  nature: "threat",
  spawn: { biomes: ["swamp", "jungle"], worlds: "all" },
  order: 116,
});

/* monsters/bolotnyy-latalnyk.js */
Atlas.registerMonster({
  format: 2,
  id: "bolotnyy-latalnyk",
  name: "Болотний Латальник",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["swamp"], worlds: "all" },
  order: 890,
  lore: {
    description: "Плаский земноводний монстр із темно-зеленою шкірою та чотирма ногами, розташованими по кутах тіла.",
    behavior: "Живе в болотах із чорними лататтями.",
    abilities: ["розтягує між ногами перетинки, утворюючи липку сітку над калюжами, а потім підтягує здобич до пащі"],
  },
});

/* monsters/bolotyana-kovzanka.js */
Atlas.registerMonster({
  format: 2,
  id: "bolotyana-kovzanka",
  name: "Болотяна Ковзанка",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["swamp"], worlds: "all" },
  order: 802,
  lore: {
    description: "Пласка амфібія з широкими круглими лапами-присосками та гладкою зелено-сірою шкірою.",
    behavior: "Мешкає на торф’яних болотах.",
    abilities: ["ковзає по мулу без занурення й залишає глибокі присмоктувальні ями, які затягують ноги переслідувачів"],
  },
});

/* monsters/bolotyana-svystunka.js */
Atlas.registerMonster({
  format: 2,
  id: "bolotyana-svystunka",
  name: "Болотяна свистунка",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 588,
  lore: {
    description: "Тонка жабоподібна істота.",
    behavior: "Очеретяні ставки.",
    abilities: ["її свист викликає дрібні стрибки води, які збивають із ніг"],
  },
});

/* monsters/bolotyanyy-hlechar.js */
Atlas.registerMonster({
  format: 2,
  id: "bolotyanyy-hlechar",
  name: "Болотяний Глечар",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["wasteland", "ashlands"], worlds: "all" },
  order: 895,
  lore: {
    description: "Чотиринога істота з глиняним тулубом і порожнистими боками, схожими на глечики.",
    behavior: "Блукає серед глиняних курганів.",
    abilities: ["накопичує болотний газ і випускає його вузькими струменями, що штовхають гравця назад, не завдаючи значної шкоди"],
  },
});

/* monsters/bolotyanyy-hlechyk.js */
Atlas.registerMonster({
  format: 2,
  id: "bolotyanyy-hlechyk",
  name: "Болотяний глечик",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["swamp"], worlds: "all" },
  order: 709,
  lore: {
    description: "Хижа рослина у формі великої посудини.",
    behavior: "Стоячі болота.",
    abilities: ["заманює дрібних істот солодким запахом і захлопує кришку"],
  },
});

/* monsters/bolotyanyy-komar-hihant.js */
Atlas.registerMonster({
  format: 2,
  id: "bolotyanyy-komar-hihant",
  name: "Болотяний комар-гігант",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["swamp"], worlds: "all" },
  order: 395,
  lore: {
    description: "Комаха.",
    behavior: "Зустрічається: болота.",
    abilities: ["висмоктує життєву силу", "переносить отруту"],
  },
});

/* monsters/bolotyanyy-krokodyl.js */
Atlas.registerMonster({
  format: 2,
  id: "bolotyanyy-krokodyl",
  name: "Болотяний крокодил",
  kind: "monster",
  nature: "threat",
  variants: ["болотяний крокодил", "болотяний крокодил-людожер"],
  spawn: { biomes: ["lake", "swamp", "jungle"], worlds: "all" },
  order: 334,
  lore: {
    description: "Рептилія. Об'єднує схожих істот: болотяний крокодил, болотяний крокодил-людожер.",
    behavior: "Зустрічається: болота, річки; тропічні болота.",
    abilities: ["ривок із води", "захоплення щелепами"],
  },
});

/* monsters/bolotyanyy-pereviznyk.js */
Atlas.registerMonster({
  format: 2,
  id: "bolotyanyy-pereviznyk",
  name: "Болотяний перевізник",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["swamp"], worlds: "all" },
  order: 486,
  lore: {
    description: "Чотиринога істота з платформою з коріння на спині.",
    behavior: "Трясовинні переправи.",
    abilities: ["переносить отруйні калюжі та викидає їх під ногами ворогів"],
  },
});

/* monsters/bolotyanyy-strybunets-riy.js */
Atlas.registerMonster({
  format: 2,
  id: "bolotyanyy-strybunets-riy",
  name: "Болотяний стрибунець-рій",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 673,
  lore: {
    description: "Десятки дрібних комах, які синхронно перестрибують між лататтям.",
    behavior: "Болотні водойми.",
    abilities: ["створюють хвилі, що збивають рівновагу"],
  },
});

/* monsters/bolotyanyy-tryton.js */
Atlas.registerMonster({
  format: 2,
  id: "bolotyanyy-tryton",
  name: "Болотяний тритон",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["swamp"], worlds: "all" },
  order: 420,
  lore: {
    description: "Земноводне чудовисько.",
    behavior: "Зустрічається: болота.",
    abilities: ["отруйний слиз", "стрибки", "укуси"],
  },
});

/* monsters/bolotyanyy-zmiy-iz-kistyanym-hrebenem.js */
Atlas.registerMonster({
  format: 2,
  id: "bolotyanyy-zmiy-iz-kistyanym-hrebenem",
  name: "Болотяний змій із кістяним гребенем",
  kind: "boss",
  nature: "threat",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 285,
  lore: {
    description: "Змій.",
    behavior: "Зустрічається: темні річки та трясовини.",
    abilities: ["отрута", "підводні засідки", "хвостові удари"],
  },
});

/* monsters/bone-digger.js */
Atlas.registerMonster({
  "format": 2,
  "id": "bone-digger",
  "name": "Кістяний копальник",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "crimson-barrows",
      "black-rifts"
    ],
    "worlds": [
      "krovostep"
    ]
  },
  "order": 217,
  "lore": {
    "description": "Кістяна істота, що розгризає скельні блоки й риє нори.",
    "behavior": "Риє нори під курганами.",
    "abilities": [
      "рит скелі",
      "кістяні шипи"
    ],
    "drops": [
      "кістяна сталь"
    ]
  }
});

/* monsters/brodyachi-proklyati.js */
Atlas.registerMonster({
  format: 1,
  id: "brodyachi-proklyati",
  name: "Бродячі прокляті",
  kind: "other",
  nature: "magic",
  spawn: { biomes: ["swamp", "wasteland", "ashlands", "forest"], worlds: "all" },
  order: 137,
});

/* monsters/bronenosets.js */
Atlas.registerMonster({
  format: 2,
  id: "bronenosets",
  name: "Броненосець",
  kind: "mini-boss",
  nature: "threat",
  variants: ["шипастий броненосець", "хрускітливий броненосець"],
  spawn: { biomes: ["grass", "mountain", "hills"], worlds: "all" },
  order: 386,
  lore: {
    description: "Звір. Об'єднує схожих істот: шипастий броненосець, хрускітливий броненосець.",
    behavior: "Зустрічається: сухі рівнини; Уламкові схили.",
    abilities: ["міцний панцир", "перекочування в нападі", "хрускітливий броненосець: згортається в кулю й котиться з великою швидкістю"],
  },
});

/* monsters/bronzovyy-zhuk.js */
Atlas.registerMonster({
  format: 2,
  id: "bronzovyy-zhuk",
  name: "Бронзовий жук",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["grass"], worlds: "all" },
  order: 391,
  lore: {
    description: "Комаха.",
    behavior: "Зустрічається: сухі рівнини.",
    abilities: ["міцний панцир", "короткий розгін"],
  },
});

/* monsters/buhlery.js */
Atlas.registerMonster({
  format: 1,
  id: "buhlery",
  name: "буглери",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["hills", "mountain", "peaks", "forest", "taiga", "enchanted"], worlds: "all" },
  order: 4,
});

/* monsters/bulbashkovyy-somyk.js */
Atlas.registerMonster({
  format: 2,
  id: "bulbashkovyy-somyk",
  name: "Бульбашковий сомик",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 682,
  lore: {
    description: "Кругла риба з прозорими мішками навколо голови.",
    behavior: "Теплі печерні водойми.",
    abilities: ["випускає бульбашки, які відштовхують ворогів"],
  },
});

/* monsters/bureviynyy-parusnyk.js */
Atlas.registerMonster({
  format: 2,
  id: "bureviynyy-parusnyk",
  name: "Буревійний Парусник",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 868,
  lore: {
    description: "Літаюча істота з довгим вузьким тулубом і величезними прозорими перетинками, натягнутими між кістяними ребрами.",
    behavior: "Ширяє над глибокими ущелинами.",
    abilities: ["використовує висхідні потоки для різких піке й може змінювати напрямок польоту майже миттєво"],
  },
});

/* monsters/burshtynova-matrona.js */
Atlas.registerMonster({
  format: 2,
  id: "burshtynova-matrona",
  name: "Бурштинова Матрона",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga", "mountain", "hills"], worlds: "all" },
  order: 760,
  lore: {
    description: "Масивна істота з бурштиновим черевцем, хиткими членистими ногами та вкрапленими в тіло силуетами давніх тварин.",
    behavior: "Гніздиться в Смоляних заростях.",
    abilities: ["створює прозорі бурштинові перегородки, а розбиті перегородки випускають короткочасні примарні образи колишніх мешканців"],
  },
});

/* monsters/burshtynova-mukha.js */
Atlas.registerMonster({
  "format": 2,
  "id": "burshtynova-mukha",
  "name": "Бурштинова муха",
  "kind": "weak",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "tag:amber",
      "tag:clay"
    ],
    "worlds": "all"
  },
  "order": 997,
  "lore": {
    "description": "Муха, що застигла в краплі смоли й ожила.",
    "behavior": "Падає з гілок, приклеюючись.",
    "abilities": [
      "липке падіння"
    ],
    "drops": [
      "бурштин"
    ]
  }
});

/* monsters/burshtynovi-holemy.js */
Atlas.registerMonster({
  "format": 2,
  "id": "burshtynovi-holemy",
  "name": "Бурштинові големи",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "burshtynovi-stepy",
      "kamyani-oazy",
      "sklyani-dyuny",
      "zastyhli-dolyny",
      "vitrovi-khrebty"
    ],
    "worlds": [
      "rakhmir"
    ]
  },
  "order": 773,
  "lore": {
    "description": "Загроза світу «Рахмір»."
  }
});

/* monsters/burshtynovyy-drakon.js */
Atlas.registerMonster({
  format: 2,
  id: "burshtynovyy-drakon",
  name: "Бурштиновий дракон",
  kind: "boss",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga", "mountain", "hills"], worlds: "all" },
  order: 276,
  lore: {
    description: "Дракон.",
    behavior: "Зустрічається: бурштинові ліси, старі шахти.",
    abilities: ["липка смола", "вогняні кулі", "броня з бурштину"],
  },
});

/* monsters/burshtynovyy-sverdlyk.js */
Atlas.registerMonster({
  format: 2,
  id: "burshtynovyy-sverdlyk",
  name: "Бурштиновий свердлик",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga"], worlds: "all" },
  order: 650,
  lore: {
    description: "Жук із довгим прозорим рогом.",
    behavior: "Бурштинові гаї.",
    abilities: ["пробурює м’яке дерево та залишає отвори-пастки"],
  },
});

/* monsters/burulkovyy-hrabizhnyk.js */
Atlas.registerMonster({
  format: 2,
  id: "burulkovyy-hrabizhnyk",
  name: "Бурульковий грабіжник",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["peaks", "snow", "wasteland", "hills"], worlds: "all" },
  order: 514,
  lore: {
    description: "Худий крижаний гуманоїд із довгими пальцями-гачками.",
    behavior: "Покинуті зимові селища.",
    abilities: ["краде предмети й кидає їх крізь крижані портали"],
  },
});

/* monsters/chasovi-dviynyky.js */
Atlas.registerMonster({
  "format": 2,
  "id": "chasovi-dviynyky",
  "name": "Часові двійники",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "sady-zavmerlykh-doshchiv",
      "polya-starykh-viyn",
      "sklyani-sekundy",
      "dolyny-povilnoho-starinnya",
      "mista-povtorennya"
    ],
    "worlds": [
      "noktalis"
    ]
  },
  "order": 702,
  "lore": {
    "description": "Загроза світу «Нокталіс»."
  }
});

/* monsters/cherepashka-dzvonyk.js */
Atlas.registerMonster({
  format: 2,
  id: "cherepashka-dzvonyk",
  name: "Черепашка-дзвоник",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 691,
  lore: {
    description: "Маленька істота з порожньою дзвінкою мушлею.",
    behavior: "Кам’янисті пляжі.",
    abilities: ["ховається всередині й видає гучний звук при наближенні небезпеки"],
  },
});

/* monsters/chervonyy-drakon-kat.js */
Atlas.registerMonster({
  format: 2,
  id: "chervonyy-drakon-kat",
  name: "Червоний дракон-кат",
  kind: "super-boss",
  nature: "threat",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 262,
  lore: {
    description: "Броньований дракон.",
    behavior: "Зустрічається: фортеця драконячого культу.",
    abilities: ["вогняні заряди", "хвостові удари", "бронебійне дихання"],
  },
});

/* monsters/chervonyy-vasylisk.js */
Atlas.registerMonster({
  format: 2,
  id: "chervonyy-vasylisk",
  name: "Червоний василіск",
  kind: "boss",
  nature: "threat",
  variants: ["червоний василіск", "королівський василіск"],
  spawn: { biomes: ["mountain", "hills", "desert"], worlds: "all" },
  order: 291,
  lore: {
    description: "Рептилія. Об'єднує схожих істот: червоний василіск, королівський василіск.",
    behavior: "Зустрічається: кам’янисті пустелі; скелясті печери.",
    abilities: ["скам’янювальний погляд", "отруйні кігті", "маскування під скелі", "коротке скам’яніння", "отруйний укус"],
  },
});

/* monsters/chorna-vdova.js */
Atlas.registerMonster({
  format: 2,
  id: "chorna-vdova",
  name: "Чорна вдова",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills", "wasteland"], worlds: "all" },
  order: 398,
  lore: {
    description: "Павукоподібне.",
    behavior: "Зустрічається: руїни, темні кути печер.",
    abilities: ["сильна отрута", "засідки"],
  },
});

/* monsters/chornoperyy-morskyy-zmiy.js */
Atlas.registerMonster({
  format: 2,
  id: "chornoperyy-morskyy-zmiy",
  name: "Чорноперий морський змій",
  kind: "boss",
  nature: "threat",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 297,
  lore: {
    description: "Морський дракон.",
    behavior: "Зустрічається: відкрите море.",
    abilities: ["чорнильні хмари", "водяні леза", "блискавки під час шторму"],
  },
});

/* monsters/chornylna-osa.js */
Atlas.registerMonster({
  format: 2,
  id: "chornylna-osa",
  name: "Чорнильна Оса",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 808,
  lore: {
    description: "Тонка чорна оса з папероподібними крильцями та черевцем, наповненим магічними чорнилами.",
    behavior: "Водиться в покинутих скрипторіях.",
    abilities: ["розбризкує плями, які стирають видимі позначки на землі й приховують пастки під темним шаром"],
  },
});

/* monsters/chornylnyy-lotsman.js */
Atlas.registerMonster({
  format: 2,
  id: "chornylnyy-lotsman",
  name: "Чорнильний Лоцман",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 875,
  lore: {
    description: "Довгорука істота з темного морського дерева та чорнильного мішка замість живота.",
    behavior: "Мешкає серед уламків затонулих кораблів.",
    abilities: ["випускає плями, що приховують справжні межі підводних урвищ, і веде здобич у небезпечні течії"],
  },
});

/* monsters/chornyy-hryf.js */
Atlas.registerMonster({
  format: 2,
  id: "chornyy-hryf",
  name: "Чорний гриф",
  kind: "monster",
  nature: "threat",
  variants: ["чорний гриф", "чорний гриф"],
  spawn: { biomes: ["grass", "desert", "wasteland", "ashlands"], worlds: "all" },
  order: 337,
  lore: {
    description: "Елітний падальник. Об'єднує схожих істот: чорний гриф, чорний гриф.",
    behavior: "Зустрічається: пустки, поля битв.",
    abilities: ["пікірування", "кігті", "розкидання отруйного пилу", "короткі повітряні атаки"],
  },
});

/* monsters/chornyy-narist.js */
Atlas.registerMonster({
  "format": 2,
  "id": "chornyy-narist",
  "name": "Чорний Наріст",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "kistyani-alpy",
      "bahryani-sudyny",
      "lehenevi-stepy",
      "zhovchni-ozera",
      "nervovi-sady"
    ],
    "worlds": [
      "ormaval"
    ]
  },
  "order": 707,
  "lore": {
    "description": "Чорний Наріст намагається дістатися серця Орми."
  }
});

/* monsters/chornyy-ork-vatazhok.js */
Atlas.registerMonster({
  format: 2,
  id: "chornyy-ork-vatazhok",
  name: "Чорний орк-ватажок",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["grass", "hills"], worlds: "all" },
  order: 326,
  lore: {
    description: "Елітний гуманоїд.",
    behavior: "Зустрічається: оркські табори.",
    abilities: ["важка сокира", "бойовий крик", "посилення союзників"],
  },
});

/* monsters/chumnyy-kolos.js */
Atlas.registerMonster({
  format: 1,
  id: "chumnyy-kolos",
  name: "Чумний Колос",
  kind: "super-boss",
  nature: "threat",
  spawn: { biomes: ["swamp", "jungle"], worlds: "all" },
  order: 107,
});

/* monsters/cliff-predator.js */
Atlas.registerMonster({
  "format": 2,
  "id": "cliff-predator",
  "name": "Скельний хижак",
  "kind": "monster",
  "nature": "threat",
  "alias": "Гірський хижак",
  "spawn": {
    "biomes": [
      "windy-meadows",
      "mountain",
      "copper-nests"
    ],
    "worlds": [
      "midnokryl"
    ]
  },
  "order": 240,
  "lore": {
    "description": "Хижак, що полює на скелях і на полонинах; також відомий як гірський хижак.",
    "behavior": "Чекає на уступі, стрибає на здобич.",
    "abilities": [
      "стрибок зі скелі",
      "засідка"
    ],
    "drops": [
      "шкури",
      "кігті"
    ]
  }
});

/* monsters/cloud-ray-mother.js */
Atlas.registerMonster({
  "format": 2,
  "id": "cloud-ray-mother",
  "name": "Матір Хмарних Скатів",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "soft-cloud-meadows",
      "blue-hollows"
    ],
    "worlds": [
      "neborid"
    ]
  },
  "order": 237,
  "lore": {
    "description": "Матка гнізда хмарних скатів.",
    "behavior": "Ширяє над гніздом, викликає зграю.",
    "abilities": [
      "виклик зграї",
      "електричний шторм"
    ],
    "drops": [
      "королівські пера"
    ]
  }
});

/* monsters/cloud-ray.js */
Atlas.registerMonster({
  "format": 2,
  "id": "cloud-ray",
  "name": "Хмарний скат",
  "kind": "monster",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "soft-cloud-meadows",
      "mineral-crowns"
    ],
    "worlds": [
      "neborid"
    ]
  },
  "order": 232,
  "lore": {
    "description": "Плаский літаючий звір, що літає між вершинами; його пера цінуються.",
    "behavior": "Ширяє зграями між платформами; пастухи розводять приручених.",
    "abilities": [
      "планерування",
      "електричний удар"
    ],
    "drops": [
      "пера скатів"
    ]
  }
});

/* monsters/copper-nest-matriarch.js */
Atlas.registerMonster({
  "format": 2,
  "id": "copper-nest-matriarch",
  "name": "Праматір Мідних Гнізд",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "copper-nests"
    ],
    "worlds": [
      "midnokryl"
    ]
  },
  "order": 242,
  "lore": {
    "description": "Найстарша мідноперя птаха-матка, що живе у великому гнізді на вершечку скелі.",
    "behavior": "Сидить на гнізді, викликає зграю.",
    "abilities": [
      "удар крилами",
      "виклик птахів",
      "пікірування"
    ],
    "drops": [
      "мідні пера Праматері"
    ]
  }
});

/* monsters/crown-cat.js */
Atlas.registerMonster({
  "format": 2,
  "id": "crown-cat",
  "name": "Кроновий кіт",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "branch-plains",
      "upper-light-gardens",
      "moss-trunks"
    ],
    "worlds": [
      "vershynnytsia"
    ]
  },
  "order": 226,
  "lore": {
    "description": "Великий кіт, що стрибає між гілками.",
    "behavior": "Полює зверху.",
    "abilities": [
      "стрибок між гілками",
      "кігті"
    ],
    "drops": [
      "хутро кронового кота"
    ]
  }
});

/* monsters/dahon.js */
Atlas.registerMonster({
  format: 1,
  id: "dahon",
  name: "Дагон",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["deep"], worlds: "all" },
  order: 83,
});

/* monsters/dakhovi-hrabizhnyky.js */
Atlas.registerMonster({
  "format": 2,
  "id": "dakhovi-hrabizhnyky",
  "name": "Дахові грабіжники",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "midni-dakhy",
      "zeleni-doshchovi-dolyny",
      "kamyani-kanaly",
      "zatopleni-nyzhni-kvartaly"
    ],
    "worlds": [
      "doshchohrad"
    ]
  },
  "order": 895,
  "lore": {
    "description": "Загроза світу «Дощоград»."
  }
});

/* monsters/demon-rozbytoho-misyatsya.js */
Atlas.registerMonster({
  format: 2,
  id: "demon-rozbytoho-misyatsya",
  name: "Демон розбитого місяця",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills", "wasteland"], worlds: "all" },
  order: 261,
  lore: {
    description: "Крилатий демон.",
    behavior: "Зустрічається: нічні руїни на високих плато.",
    abilities: ["місячні промені", "тіньові клони", "телепортація"],
  },
});

/* monsters/derevni-vartovi.js */
Atlas.registerMonster({
  "format": 2,
  "id": "derevni-vartovi",
  "name": "Деревні вартові",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "chorni-stovbury",
      "burshtynovi-zaplavy",
      "mokhovi-terasy",
      "sklyani-korenevyshcha"
    ],
    "worlds": [
      "smolyar"
    ]
  },
  "order": 827,
  "lore": {
    "description": "Загроза світу «Смоляр»."
  }
});

/* monsters/devid-dzhons.js */
Atlas.registerMonster({
  format: 1,
  id: "devid-dzhons",
  name: "Девід Джонс",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["deep"], worlds: "all" },
  order: 91,
});

/* monsters/dovhoshyya-ocheretyanka.js */
Atlas.registerMonster({
  format: 2,
  id: "dovhoshyya-ocheretyanka",
  name: "Довгошия очеретянка",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 636,
  lore: {
    description: "Великий болотний птах.",
    behavior: "Мілководні дельти.",
    abilities: ["витягує шию крізь зарості й атакує дзьобом з неочікуваної відстані"],
  },
});

/* monsters/dovhovusyy-hraver.js */
Atlas.registerMonster({
  format: 2,
  id: "dovhovusyy-hraver",
  name: "Довговусий Гравер",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga"], worlds: "all" },
  order: 813,
  lore: {
    description: "Жук із довгими різьбленими вусами та шліфованими надкрилами.",
    behavior: "Водиться в живих дерев’яних арках.",
    abilities: ["дряпає на корі дерев символи, які змушують відповідні гілки падати при наближенні здобичі"],
  },
});

/* monsters/drakon-popelyastoyi-korony.js */
Atlas.registerMonster({
  format: 2,
  id: "drakon-popelyastoyi-korony",
  name: "Дракон попелястої корони",
  kind: "super-boss",
  nature: "threat",
  spawn: { biomes: ["volcanic", "ashlands", "mountain", "peaks"], worlds: "all" },
  order: 257,
  lore: {
    description: "Древній дракон.",
    behavior: "Зустрічається: чорні вулканічні гори.",
    abilities: ["попелясте полум’я", "сліпучі спалахи", "вогняні крила"],
  },
});

/* monsters/drakon.js */
Atlas.registerMonster({
  format: 1,
  id: "drakon",
  name: "Дракон",
  kind: "boss",
  nature: "magic",
  variants: ["Червоний", "Крижаний", "Камінний"],
  spawn: { biomes: ["hills", "mountain", "peaks"], worlds: "all" },
  order: 51,
});

/* monsters/drakonchyk-obpalyuvach.js */
Atlas.registerMonster({
  format: 2,
  id: "drakonchyk-obpalyuvach",
  name: "Дракончик-обпалювач",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 327,
  lore: {
    description: "Елітний дракон.",
    behavior: "Зустрічається: теплі печери, драконячі гнізда.",
    abilities: ["короткі вогняні залпи", "політ", "укуси"],
  },
});

/* monsters/drevni-krabovi-holemy.js */
Atlas.registerMonster({
  "format": 2,
  "id": "drevni-krabovi-holemy",
  "name": "Древні крабові големи",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "mertvi-ryfy",
      "mushlyani-dyuny",
      "skamyanili-prybiyni-skeli",
      "blakytni-pechery",
      "kreydyani-vezhi",
      "sukhi-morski-terasy",
      "chervoni-rozlomy",
      "skamyanili-berehy"
    ],
    "worlds": [
      "fossar"
    ]
  },
  "order": 835,
  "lore": {
    "description": "Загроза світу «Фоссар»."
  }
});

/* monsters/drevniy-lisovyy-veleten.js */
Atlas.registerMonster({
  format: 2,
  id: "drevniy-lisovyy-veleten",
  name: "Древній лісовий велетень",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga", "enchanted"], worlds: "all" },
  order: 249,
  lore: {
    description: "Жива гора з коріння й деревини.",
    behavior: "Зустрічається: праліси з велетенськими деревами.",
    abilities: ["піднімає коріння", "оживляє дерева", "створює зарості"],
  },
});

/* monsters/driady.js */
Atlas.registerMonster({
  format: 1,
  id: "driady",
  name: "дріади",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga", "enchanted"], worlds: "all" },
  order: 22,
});

/* monsters/dribnokaminets.js */
Atlas.registerMonster({
  format: 2,
  id: "dribnokaminets",
  name: "Дрібнокамінець",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills", "grass"], worlds: "all" },
  order: 830,
  lore: {
    description: "Маленька багатогранна істота з тонкими кришталевими ніжками та двома блискучими очима.",
    behavior: "Ховається на гірських стежках і мостах.",
    abilities: ["при небезпеці притискається до дороги, вдаючи звичайний камінь, а потім стрибає під ноги мандрівника"],
  },
});

/* monsters/dribnyy-klishch.js */
Atlas.registerMonster({
  format: 2,
  id: "dribnyy-klishch",
  name: "Дрібний кліщ",
  kind: "weak",
  nature: "magic",
  variants: ["мереживний кліщ", "крихітний мідний кліщ", "скляний Кліщ"],
  spawn: { biomes: ["forest", "taiga", "grass", "hills"], worlds: "all" },
  order: 644,
  lore: {
    description: "Крихітний павукоподібний із напівпрозорими лапками. Об'єднує схожих істот: мереживний кліщ, крихітний мідний кліщ, скляний Кліщ.",
    behavior: "Квіткові луки. Старі копальні. Гніздиться в кристальних садах.",
    abilities: ["мереживний кліщ: плете тонкі сітки між травинками, майже непомітні на світлі", "крихітний мідний кліщ: збирається групами й обліплює металеве спорядження, роблячи його важчим", "скляний Кліщ: прикріплюється до обладунку та робить його дедалі крихкішим після кожного сильного удару, доки його не зняти"],
  },
});

/* monsters/drimnyy-dzobyk.js */
Atlas.registerMonster({
  format: 2,
  id: "drimnyy-dzobyk",
  name: "Дрімний Дзьобик",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga", "grass", "hills"], worlds: "all" },
  order: 827,
  lore: {
    description: "Маленький круглий птах із пухнастим кубічним пір’ям і коротким м’яким дзьобом.",
    behavior: "Спить під капелюшками грибів у сутінкових садах.",
    abilities: ["у разі переляку видає заспокійливу трель, від якої втомлені істоти починають позіхати й на мить втрачають пильність"],
  },
});

/* monsters/dukh-lisovoho-khaosu.js */
Atlas.registerMonster({
  format: 1,
  id: "dukh-lisovoho-khaosu",
  name: "Дух Лісового Хаосу",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga", "enchanted"], worlds: "all" },
  order: 78,
});

/* monsters/dukh-proklyatoho-khashcha.js */
Atlas.registerMonster({
  format: 1,
  id: "dukh-proklyatoho-khashcha",
  name: "Дух Проклятого Хаща",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga", "enchanted"], worlds: "all" },
  order: 77,
});

/* monsters/dukhy-zabutykh-bytv.js */
Atlas.registerMonster({
  format: 1,
  id: "dukhy-zabutykh-bytv",
  name: "Духи забутих битв",
  kind: "other",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills", "steppe"], worlds: "all" },
  order: 136,
});

/* monsters/dviynyky-hravtsya.js */
Atlas.registerMonster({
  "format": 2,
  "id": "dviynyky-hravtsya",
  "name": "Двійники гравця",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "sribni-pushchi",
      "chorni-viddzerkalennya",
      "ozera-podviynykh-misyatsiv",
      "bili-labirynty",
      "sady-zvorotnoho-svitla"
    ],
    "worlds": [
      "mirrahon"
    ]
  },
  "order": 720,
  "lore": {
    "description": "Загроза світу «Міррагон»."
  }
});

/* monsters/dvoholovyy-hirskyy-drakon.js */
Atlas.registerMonster({
  format: 2,
  id: "dvoholovyy-hirskyy-drakon",
  name: "Двоголовий гірський дракон",
  kind: "boss",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills", "peaks"], worlds: "all" },
  order: 277,
  lore: {
    description: "Дракон.",
    behavior: "Зустрічається: високогірні печери.",
    abilities: ["одна голова дихає вогнем", "друга кам’яними уламками"],
  },
});

/* monsters/dyki-kabany.js */
Atlas.registerMonster({
  format: 1,
  id: "dyki-kabany",
  name: "Дикі кабани",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["forest", "grass", "taiga"], worlds: "all" },
  order: 127,
});

/* monsters/dykyy-kit.js */
Atlas.registerMonster({
  format: 2,
  id: "dykyy-kit",
  name: "Дикий кіт",
  kind: "monster",
  nature: "threat",
  variants: ["лісова рись", "плямиста печерна пантера", "сніговий барс"],
  spawn: { biomes: ["forest", "taiga", "jungle", "mountain"], worlds: "all" },
  order: 371,
  lore: {
    description: "Звір-хижак. Об'єднує схожих істот: лісова рись, плямиста печерна пантера, сніговий барс.",
    behavior: "Зустрічається: густі ліси; джунглі, печери; високогір’я.",
    abilities: ["стрибки", "засідки", "маскування", "швидкі серії атак", "маскування на снігу", "стрибки згори"],
  },
});

/* monsters/dykyy-krit.js */
Atlas.registerMonster({
  format: 2,
  id: "dykyy-krit",
  name: "Дикий кріт",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga", "grass", "hills"], worlds: "all" },
  order: 437,
  lore: {
    description: "Підземний звір.",
    behavior: "Зустрічається: поля, сади.",
    abilities: ["розкопує ґрунт", "раптово вистрибує"],
  },
});

/* monsters/dymotyah.js */
Atlas.registerMonster({
  format: 2,
  id: "dymotyah",
  name: "Димотяг",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 792,
  lore: {
    description: "Довготілий звір із величезною складчастою мордою-міхом і маленькими світлими очима.",
    behavior: "Мешкає в Сажистих ущелинах.",
    abilities: ["втягує дим від вогню, а потім випускає густі хмари, що закривають огляд і дають йому змогу відступити"],
  },
});

/* monsters/dyvnyi-pushynets.js */
Atlas.registerMonster({
  "format": 2,
  "id": "dyvnyi-pushynets",
  "name": "Дивний пушинець",
  "kind": "weak",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "tag:land+fantasy"
    ],
    "worlds": "all"
  },
  "order": 1000,
  "lore": {
    "description": "Кубічне створіння з веселковим пухом.",
    "behavior": "Кружляє над квітами й підспівує.",
    "abilities": [
      "спокійна пісенька",
      "розсипає пух"
    ],
    "drops": [
      "веселковий пух"
    ]
  }
});

/* monsters/dzerkalnyi-povtoriuvach.js */
Atlas.registerMonster({
  "format": 2,
  "id": "dzerkalnyi-povtoriuvach",
  "name": "Дзеркальний повторювач",
  "kind": "weak",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "tag:surreal"
    ],
    "worlds": "all"
  },
  "order": 993,
  "lore": {
    "description": "Малий куб, що повторює рухи гравця із запізненням.",
    "behavior": "Ходить за кимось усюди.",
    "abilities": [
      "повторює дію",
      "виникає позаду"
    ],
    "drops": [
      "дзеркальне скельце"
    ]
  }
});

/* monsters/dzerkalnyy-tsvyntarnyk.js */
Atlas.registerMonster({
  format: 2,
  id: "dzerkalnyy-tsvyntarnyk",
  name: "Дзеркальний Цвинтарник",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["desert", "wasteland", "hills"], worlds: "all" },
  order: 750,
  lore: {
    description: "Сутула істота з тонкими металевими кінцівками й головою з уламків полірованих надгробків.",
    behavior: "Доглядає соляне Місто Відображень.",
    abilities: ["виставляє дзеркальні плити, що змінюють напрямок атак, а потім складає з них лабіринт навколо супротивника"],
  },
});

/* monsters/elektrychnyy-vuhor.js */
Atlas.registerMonster({
  format: 2,
  id: "elektrychnyy-vuhor",
  name: "Електричний вугор",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 414,
  lore: {
    description: "Магічна риба.",
    behavior: "Зустрічається: підземні водойми, теплі річки.",
    abilities: ["електричні розряди", "оглушення"],
  },
});

/* monsters/enty.js */
Atlas.registerMonster({
  format: 1,
  id: "enty",
  name: "енти",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga", "enchanted"], worlds: "all" },
  order: 20,
});

/* monsters/eyeless-hunter.js */
Atlas.registerMonster({
  "format": 2,
  "id": "eyeless-hunter",
  "name": "Безокий мисливець",
  "kind": "monster",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "black-rifts",
      "blood-wells"
    ],
    "worlds": [
      "krovostep"
    ]
  },
  "order": 219,
  "lore": {
    "description": "Безокий хижак, що реагує на поранених істот.",
    "behavior": "Іде на запах крові; ігнорує здорових.",
    "abilities": [
      "чуття крові",
      "стрімкий ривок"
    ],
    "drops": [
      "сухі сухожилля"
    ]
  }
});

/* monsters/faceless-knight.js */
Atlas.registerMonster({
  "format": 2,
  "id": "faceless-knight",
  "name": "Безликий лицар",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "citadel-graveyard",
      "ashlands"
    ],
    "worlds": [
      "ostanky"
    ]
  },
  "order": 209,
  "lore": {
    "description": "Лицар у порожніх обладунках, що повторює останній наказ.",
    "behavior": "Охороняє те, що охороняв; не відступає, поки не виконає або не буде знищений.",
    "abilities": [
      "вперті атаки",
      "захист мурів"
    ],
    "drops": [
      "іржаві обладунки",
      "фрагменти гербів"
    ]
  }
});

/* monsters/farbovani-holemy.js */
Atlas.registerMonster({
  "format": 2,
  "id": "farbovani-holemy",
  "name": "Фарбовані големи",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "syni-freskovi-skeli",
      "chervoni-malyarni-dolyny",
      "zoloti-khramovi-terasy",
      "chornylni-pechery"
    ],
    "worlds": [
      "malvar"
    ]
  },
  "order": 879,
  "lore": {
    "description": "Загроза світу «Мальвар»."
  }
});

/* monsters/feniks-vichnoho-popelu.js */
Atlas.registerMonster({
  format: 2,
  id: "feniks-vichnoho-popelu",
  name: "Фенікс вічного попелу",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["volcanic", "ashlands", "wasteland", "hills"], worlds: "all" },
  order: 264,
  lore: {
    description: "Вогняний птах.",
    behavior: "Зустрічається: руїни храмів у вулканічних долинах.",
    abilities: ["воскресає з попелу", "створює вогняні вихори"],
  },
});

/* monsters/frahmentni-holemy.js */
Atlas.registerMonster({
  "format": 2,
  "id": "frahmentni-holemy",
  "name": "Фрагментні големи",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "kistyani-dyuny",
      "morya-frahmentiv",
      "cherepni-arkhipelahy",
      "bili-bolota",
      "skeletni-ryfy"
    ],
    "worlds": [
      "oskarium"
    ]
  },
  "order": 764,
  "lore": {
    "description": "Загроза світу «Оскаріум»."
  }
});

/* monsters/glow-frog.js */
Atlas.registerMonster({
  "format": 2,
  "id": "glow-frog",
  "name": "Світна жаба",
  "kind": "weak",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "crown-lakes",
      "upper-light-gardens"
    ],
    "worlds": [
      "vershynnytsia"
    ]
  },
  "order": 228,
  "lore": {
    "description": "Мала жаба, що світиться у верхніх водоймах.",
    "behavior": "Тримається води; безпечна.",
    "abilities": [
      "світіння"
    ],
    "drops": [
      "світний слиз"
    ]
  }
});

/* monsters/great-collector.js */
Atlas.registerMonster({
  "format": 2,
  "id": "great-collector",
  "name": "Великий Збирач",
  "kind": "super-boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "citadel-graveyard",
      "petrified-shore"
    ],
    "worlds": [
      "ostanky"
    ]
  },
  "order": 215,
  "lore": {
    "description": "Велетенський збирач, що перебудовує арену з навколишніх блоків.",
    "behavior": "На очах змінює арену, скидаючи й підіймаючи платформи.",
    "abilities": [
      "перебудова арени",
      "всмоктування блоків"
    ],
    "drops": [
      "серце Збирача"
    ]
  }
});

/* monsters/gudzykova-mysha.js */
Atlas.registerMonster({
  format: 2,
  id: "gudzykova-mysha",
  name: "Ґудзикова Миша",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["grass", "hills"], worlds: "all" },
  order: 826,
  lore: {
    description: "Крихітний гризун із круглим панциром, схожим на застібнутий ґудзик, і коротким хвостом-ниткою.",
    behavior: "Мешкає біля торгових трактів і старих заїжджих дворів.",
    abilities: ["перегризає ремінці, шнурки та мотузки, після чого згортається в клубочок і котиться під найближчу щілину"],
  },
});

/* monsters/hadyuky.js */
Atlas.registerMonster({
  format: 1,
  id: "hadyuky",
  name: "Гадюки",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["grass", "desert", "swamp", "savanna", "hills"], worlds: "all" },
  order: 128,
});

/* monsters/hakokryl.js */
Atlas.registerMonster({
  format: 2,
  id: "hakokryl",
  name: "Гакокрил",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills", "grass"], worlds: "all" },
  order: 766,
  lore: {
    description: "Хижий птах із вузьким тілом, залізним дзьобом, гачкуватими задніми лапами й перетинчастими крилами.",
    behavior: "Гніздиться у вежах на урвищах.",
    abilities: ["вихоплює щити та підвішує їх на виступах скель, позбавляючи ворога захисту"],
  },
});

/* monsters/halkovyy-nosiy.js */
Atlas.registerMonster({
  format: 2,
  id: "halkovyy-nosiy",
  name: "Гальковий носій",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 628,
  lore: {
    description: "Черепахоподібна тварина, що збирає камінці на спину.",
    behavior: "Кам’янисті береги річок.",
    abilities: ["скидає їх одним рухом, коли її переслідують"],
  },
});

/* monsters/halkovyy-pyshchyk.js */
Atlas.registerMonster({
  format: 2,
  id: "halkovyy-pyshchyk",
  name: "Гальковий пищик",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 715,
  lore: {
    description: "Дрібний звір, схожий на рухомий камінець.",
    behavior: "Кам’янисті стежки.",
    abilities: ["пищить і ховається між плитами"],
  },
});

/* monsters/hanchiryanyy-lovets.js */
Atlas.registerMonster({
  format: 2,
  id: "hanchiryanyy-lovets",
  name: "Ганчір’яний ловець",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills", "grass"], worlds: "all" },
  order: 581,
  lore: {
    description: "Клаптева істота з довгими тканинними руками.",
    behavior: "Покинуті склади.",
    abilities: ["обмотує здобич і тягне до себе"],
  },
});

/* monsters/harpiyi.js */
Atlas.registerMonster({
  format: 1,
  id: "harpiyi",
  name: "гарпії",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["hills", "mountain", "peaks"], worlds: "all" },
  order: 12,
});

/* monsters/heartless-king.js */
Atlas.registerMonster({
  "format": 2,
  "id": "heartless-king",
  "name": "Безсердечний Король",
  "kind": "super-boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "blood-wells"
    ],
    "worlds": [
      "krovostep"
    ]
  },
  "order": 224,
  "lore": {
    "description": "Володар найбільшого колодязя, що править племенами страхом.",
    "behavior": "Тримає колодязь і війська племен.",
    "abilities": [
      "вампіричний удар",
      "виклик кров'яних лицарів"
    ],
    "drops": [
      "серце колодязя"
    ]
  }
});

/* monsters/hidra.js */
Atlas.registerMonster({
  format: 1,
  id: "hidra",
  name: "Гідра",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["deep"], worlds: "all" },
  order: 84,
});

/* monsters/hihantska-khyzha-cherepakha.js */
Atlas.registerMonster({
  format: 2,
  id: "hihantska-khyzha-cherepakha",
  name: "Гігантська хижа черепаха",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 419,
  lore: {
    description: "Водний звір.",
    behavior: "Зустрічається: озера, морські печери.",
    abilities: ["таран панциром", "укус", "сильні удари ластами"],
  },
});

/* monsters/hihantska-matka-termitiv.js */
Atlas.registerMonster({
  format: 2,
  id: "hihantska-matka-termitiv",
  name: "Гігантська матка термітів",
  kind: "boss",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills", "desert"], worlds: "all" },
  order: 284,
  lore: {
    description: "Комаха.",
    behavior: "Зустрічається: піщані гнізда.",
    abilities: ["створює термітів", "руйнує землю тунелями", "кислотні бризки"],
  },
});

/* monsters/hihantska-mokrytsya.js */
Atlas.registerMonster({
  format: 2,
  id: "hihantska-mokrytsya",
  name: "Гігантська мокриця",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["hills", "mountain"], worlds: "all" },
  order: 402,
  lore: {
    description: "Членистоноге.",
    behavior: "Зустрічається: підземні вологі зони.",
    abilities: ["панцир", "згортання в кулю"],
  },
});

/* monsters/hihantska-murakha.js */
Atlas.registerMonster({
  format: 2,
  id: "hihantska-murakha",
  name: "Гігантська мураха",
  kind: "monster",
  nature: "threat",
  variants: ["бойова мураха", "мураха-кислотник", "звичайна гігантська мураха"],
  spawn: { biomes: ["forest", "taiga", "hills", "mountain"], worlds: "all" },
  order: 389,
  lore: {
    description: "Комаха. Об'єднує схожих істот: бойова мураха, мураха-кислотник, звичайна гігантська мураха.",
    behavior: "Зустрічається: лісова підстилка; підземні мурашники.",
    abilities: ["укуси", "атаки колонією", "кислотні бризки", "роз’їдання слабкої броні", "напади невеликими групами"],
  },
});

/* monsters/hihantska-shchuka.js */
Atlas.registerMonster({
  format: 2,
  id: "hihantska-shchuka",
  name: "Гігантська щука",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 412,
  lore: {
    description: "Риба-хижак.",
    behavior: "Зустрічається: озера, річки.",
    abilities: ["стрімкий ривок", "сильний укус"],
  },
});

/* monsters/hihantski-anemony.js */
Atlas.registerMonster({
  format: 1,
  id: "hihantski-anemony",
  name: "гігантські анемони",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["deep"], worlds: "all" },
  order: 39,
});

/* monsters/hihantski-kalmary.js */
Atlas.registerMonster({
  format: 1,
  id: "hihantski-kalmary",
  name: "гігантські кальмари",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["deep"], worlds: "all" },
  order: 37,
});

/* monsters/hihantski-kraby.js */
Atlas.registerMonster({
  format: 1,
  id: "hihantski-kraby",
  name: "гігантські краби",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["deep"], worlds: "all" },
  order: 36,
});

/* monsters/hihantski-mureny.js */
Atlas.registerMonster({
  format: 1,
  id: "hihantski-mureny",
  name: "гігантські мурени",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["deep"], worlds: "all" },
  order: 38,
});

/* monsters/hihantski-pavuky.js */
Atlas.registerMonster({
  format: 1,
  id: "hihantski-pavuky",
  name: "гігантські павуки",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga", "enchanted"], worlds: "all" },
  order: 27,
});

/* monsters/hihantski-shchury.js */
Atlas.registerMonster({
  format: 1,
  id: "hihantski-shchury",
  name: "Гігантські щури",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["grass", "forest", "hills", "steppe", "swamp"], worlds: "all" },
  order: 125,
});

/* monsters/hihantskyy-bohomol.js */
Atlas.registerMonster({
  format: 2,
  id: "hihantskyy-bohomol",
  name: "Гігантський богомол",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["jungle", "grass", "hills"], worlds: "all" },
  order: 338,
  lore: {
    description: "Елітна комаха.",
    behavior: "Зустрічається: високі трави, джунглі.",
    abilities: ["швидкі леза-передні кінцівки", "маскування"],
  },
});

/* monsters/hihantskyy-bolotnyy-zhabun.js */
Atlas.registerMonster({
  format: 2,
  id: "hihantskyy-bolotnyy-zhabun",
  name: "Гігантський болотний жабун",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 315,
  lore: {
    description: "Земноводне.",
    behavior: "Зустрічається: заболочені береги.",
    abilities: ["довгий язик", "отруйна слина", "стрибки"],
  },
});

/* monsters/hihantskyy-orel.js */
Atlas.registerMonster({
  format: 2,
  id: "hihantskyy-orel",
  name: "Гігантський орел",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills", "peaks"], worlds: "all" },
  order: 376,
  lore: {
    description: "Хижий птах.",
    behavior: "Зустрічається: гірські вершини.",
    abilities: ["пікірування", "захоплення дрібних істот"],
  },
});

/* monsters/hipohryfy.js */
Atlas.registerMonster({
  format: 1,
  id: "hipohryfy",
  name: "гіпогрифи",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["hills", "mountain", "peaks"], worlds: "all" },
  order: 9,
});

/* monsters/hirski-hobliny.js */
Atlas.registerMonster({
  format: 1,
  id: "hirski-hobliny",
  name: "гірські гобліни",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["hills", "mountain", "peaks"], worlds: "all" },
  order: 15,
});

/* monsters/hirski-rozbiynyky.js */
Atlas.registerMonster({
  "format": 2,
  "id": "hirski-rozbiynyky",
  "name": "Гірські розбійники",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "vitrovi-plato",
      "taiga",
      "hromovi-perevaly",
      "tykhi-dolyny"
    ],
    "worlds": [
      "valdren"
    ]
  },
  "order": 782,
  "lore": {
    "description": "Загроза світу «Вальдрен»."
  }
});

/* monsters/hirskyi-drymba.js */
Atlas.registerMonster({
  "format": 2,
  "id": "hirskyi-drymba",
  "name": "Гірський дримба",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "tag:highland",
      "tag:hills",
      "tag:mountain",
      "tag:stone"
    ],
    "worlds": "all"
  },
  "order": 990,
  "lore": {
    "description": "Вовкоподібна істота з кам'яною спиною.",
    "behavior": "Лазить по скелях і скидає каміння.",
    "abilities": [
      "каменепад",
      "блискавичний стрибок"
    ],
    "drops": [
      "камінь-спина"
    ]
  }
});

/* monsters/hirskyy-hachkokhvist.js */
Atlas.registerMonster({
  format: 2,
  id: "hirskyy-hachkokhvist",
  name: "Гірський гачкохвіст",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 535,
  lore: {
    description: "Коза-подібний хижак із хвостом-гачком.",
    behavior: "Вузькі гірські стежки.",
    abilities: ["чіпляється за скелі та зіштовхує ворогів зі схилів"],
  },
});

/* monsters/hirskyy-hekon.js */
Atlas.registerMonster({
  format: 2,
  id: "hirskyy-hekon",
  name: "Гірський гекон",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills", "wasteland"], worlds: "all" },
  order: 380,
  lore: {
    description: "Рептилія.",
    behavior: "Зустрічається: скелі, руїни.",
    abilities: ["лазіння по стінах", "короткий стрибок"],
  },
});

/* monsters/hirskyy-kozel.js */
Atlas.registerMonster({
  format: 2,
  id: "hirskyy-kozel",
  name: "Гірський козел",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 372,
  lore: {
    description: "Звір.",
    behavior: "Зустрічається: гірські схили.",
    abilities: ["таран рогами", "стрибки по скелях"],
  },
});

/* monsters/hirskyy-tytan.js */
Atlas.registerMonster({
  format: 1,
  id: "hirskyy-tytan",
  name: "Гірський Титан",
  kind: "boss",
  nature: "threat",
  spawn: { biomes: ["hills", "mountain", "peaks"], worlds: "all" },
  order: 50,
});

/* monsters/hlechykolap.js */
Atlas.registerMonster({
  format: 2,
  id: "hlechykolap",
  name: "Глечиколап",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills", "grass"], worlds: "all" },
  order: 789,
  lore: {
    description: "Панцирне створіння з тулубом у формі глиняного глечика й лапами, схожими на розбитий посуд.",
    behavior: "Ховається серед руїн гончарного села.",
    abilities: ["тупотить і створює навколо себе рухомі глиняні уламки, які відволікають і ранять ворога"],
  },
});

/* monsters/hlybokokorin.js */
Atlas.registerMonster({
  format: 2,
  id: "hlybokokorin",
  name: "Глибококорінь",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "peaks"], worlds: "all" },
  order: 744,
  lore: {
    description: "Величезна рослинна істота з перевернутою кроною під землею та сотнями товстих коренів-ніг.",
    behavior: "Прокидається під Залізнокореневими горами.",
    abilities: ["висмоктує мінерали з ґрунту, змушуючи каміння ставати крихким і провалюватися"],
  },
});

/* monsters/hlybynna-ryba-likhtar.js */
Atlas.registerMonster({
  format: 2,
  id: "hlybynna-ryba-likhtar",
  name: "Глибинна риба-ліхтар",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["deep"], worlds: "all" },
  order: 423,
  lore: {
    description: "Морський хижак.",
    behavior: "Зустрічається: безодні океану.",
    abilities: ["заманює світлом", "кусає з темряви"],
  },
});

/* monsters/hlybynnyky.js */
Atlas.registerMonster({
  format: 1,
  id: "hlybynnyky",
  name: "глибинники",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["deep"], worlds: "all" },
  order: 48,
});

/* monsters/hlybynnyy-drevniy.js */
Atlas.registerMonster({
  format: 1,
  id: "hlybynnyy-drevniy",
  name: "Глибинний Древній",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["deep"], worlds: "all" },
  order: 97,
});

/* monsters/hlybynnyy-pantsyrnyk.js */
Atlas.registerMonster({
  format: 2,
  id: "hlybynnyy-pantsyrnyk",
  name: "Глибинний панцирник",
  kind: "boss",
  nature: "threat",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 281,
  lore: {
    description: "Морське чудовисько.",
    behavior: "Зустрічається: коралові рифи, підводні печери.",
    abilities: ["міцний панцир", "водяні тарани", "хмари чорнила"],
  },
});

/* monsters/hlybynnyy-shchelepnyk.js */
Atlas.registerMonster({
  format: 2,
  id: "hlybynnyy-shchelepnyk",
  name: "Глибинний щелепник",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 544,
  lore: {
    description: "Річкова істота з подвійною нижньою щелепою.",
    behavior: "Мутні потоки.",
    abilities: ["чіпляється за береги та тягне здобич у воду"],
  },
});

/* monsters/hlybynnyy-suddya-bez-oblychchya.js */
Atlas.registerMonster({
  format: 2,
  id: "hlybynnyy-suddya-bez-oblychchya",
  name: "Глибинний Суддя Без Обличчя",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 843,
  lore: {
    description: "Масивна істота з темно-синіх плит, яка пересувається на руках, тримаючи тулуб над землею.",
    behavior: "Охороняє зал суду в підземному місті, похованому під соляним морем.",
    abilities: ["позначає гравця рунами, а потім карає за повторення тієї самої атаки тричі поспіль"],
  },
});

/* monsters/hlybynnyy-vukhan.js */
Atlas.registerMonster({
  format: 2,
  id: "hlybynnyy-vukhan",
  name: "Глибинний вухань",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 694,
  lore: {
    description: "Невелика риба з широкими вушкоподібними плавниками.",
    behavior: "Підводні печери.",
    abilities: ["сприймає вібрації та нападає на тих, хто рухається"],
  },
});

/* monsters/hlyniana-lialka.js */
Atlas.registerMonster({
  "format": 2,
  "id": "hlyniana-lialka",
  "name": "Глиняна лялька",
  "kind": "monster",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "tag:amber",
      "tag:clay"
    ],
    "worlds": "all"
  },
  "order": 998,
  "lore": {
    "description": "Нескладна глиняна фігурка, що ходить на півсвідомості.",
    "behavior": "Лепить себе з землі після ударів.",
    "abilities": [
      "самолікування",
      "глиняні кулі"
    ],
    "drops": [
      "свіжа глина"
    ]
  }
});

/* monsters/hlynomov.js */
Atlas.registerMonster({
  format: 2,
  id: "hlynomov",
  name: "Глиномов",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 757,
  lore: {
    description: "Приземкуватий велет із гончарним кругом у животі, глиняною головою-глечиком і важкими руками-лопатами.",
    behavior: "Ховається в Лабіринті Недопеченої Цегли.",
    abilities: ["виліплює з навколишньої землі стіни, ями та рухомі статуї, постійно перебудовуючи арену"],
  },
});

/* monsters/hlynyana-tsykada.js */
Atlas.registerMonster({
  format: 2,
  id: "hlynyana-tsykada",
  name: "Глиняна Цикада",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 812,
  lore: {
    description: "Теракотова комаха з отворами-жарівнями на черевці та короткими товстими вусиками.",
    behavior: "Мешкає в покинутих цегельнях.",
    abilities: ["дзижчить так, що пухкі блоки землі підстрибують і збивають чаклування, а сипкий ґрунт просідає"],
  },
});

/* monsters/hlynyani-storozhi.js */
Atlas.registerMonster({
  "format": 2,
  "id": "hlynyani-storozhi",
  "name": "Глиняні сторожі",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "chervoni-hlynyani-bashty",
      "bili-sukhi-terasy",
      "hlybynni-yary",
      "zeleni-oazy",
      "bili-portselyanovi-stepy",
      "kobaltovi-yary",
      "rozhevi-karyery",
      "chorni-vypalyuvalni-pechery"
    ],
    "worlds": [
      "hlynyshche"
    ]
  },
  "order": 820,
  "lore": {
    "description": "Загроза світу «Глинище»."
  }
});

/* monsters/hlynyanyy-barabanets.js */
Atlas.registerMonster({
  format: 2,
  id: "hlynyanyy-barabanets",
  name: "Глиняний барабанець",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 527,
  lore: {
    description: "Маленький гуманоїд із порожнистим тулубом.",
    behavior: "Старі глиняні кар’єри.",
    abilities: ["стукає по грудях, викликаючи локальні тріщини в землі"],
  },
});

/* monsters/hlynyanyy-kryvolap.js */
Atlas.registerMonster({
  format: 2,
  id: "hlynyanyy-kryvolap",
  name: "Глиняний Криволап",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["hills", "mountain"], worlds: "all" },
  order: 859,
  lore: {
    description: "Невеликий приземкуватий мешканець із трьома ногами, довгими руками та головою у формі перевернутого горщика.",
    behavior: "Живе на терасованих глиняних пагорбах.",
    abilities: ["перекидає землю, створюючи горбки, через які гравець спотикається, і ховається в них, коли його атакують"],
  },
});

/* monsters/hlynyanyy-olen.js */
Atlas.registerMonster({
  format: 2,
  id: "hlynyanyy-olen",
  name: "Глиняний олень",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["grass"], worlds: "all" },
  order: 637,
  lore: {
    description: "Тварина з висохлої глини та коренів.",
    behavior: "Глиняні долини.",
    abilities: ["при бігу обсипається грудками, які залишають слизькі плями"],
  },
});

/* monsters/hlynyanyy-svystun.js */
Atlas.registerMonster({
  format: 2,
  id: "hlynyanyy-svystun",
  name: "Глиняний Свистун",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 918,
  lore: {
    description: "Маленький горщикоподібний монстр із трьома ніжками та отворами по всьому тулубу.",
    behavior: "Трапляється в глиняних кар'єрах і висохлих ярах.",
    abilities: ["видуває різкі свисти, які змушують дрібні камені підстрибувати й перекривають вузькі стежки"],
  },
});

/* monsters/hlynyanyy-termit.js */
Atlas.registerMonster({
  format: 2,
  id: "hlynyanyy-termit",
  name: "Глиняний терміт",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["hills"], worlds: "all" },
  order: 654,
  lore: {
    description: "Світла комаха, що будує невеликі башточки з вологої землі.",
    behavior: "Сухі пагорби.",
    abilities: ["ховається всередині й атакує через вузькі отвори"],
  },
});

/* monsters/hlynyanyy-voyin-strazh.js */
Atlas.registerMonster({
  format: 2,
  id: "hlynyanyy-voyin-strazh",
  name: "Глиняний воїн-страж",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 347,
  lore: {
    description: "Елітний конструкт.",
    behavior: "Зустрічається: глиняні храми.",
    abilities: ["спис", "щит", "самовідновлення біля землі"],
  },
});

/* monsters/hlytsyak.js */
Atlas.registerMonster({
  format: 2,
  id: "hlytsyak",
  name: "Глицяк",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills", "forest"], worlds: "all" },
  order: 803,
  lore: {
    description: "Кремезний травоїдний жукоподібний звір із ялиновими гілками замість рогів і панциром, укритим хвоєю.",
    behavior: "Водиться на кедрових урвищах.",
    abilities: ["скидає колючі голки, які плутають сліди й заважають пройти вузькими стежками"],
  },
});

/* monsters/hnoly.js */
Atlas.registerMonster({
  format: 1,
  id: "hnoly",
  name: "гноли",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga", "enchanted"], worlds: "all" },
  order: 17,
});

/* monsters/hnylyy-hrybun.js */
Atlas.registerMonster({
  format: 2,
  id: "hnylyy-hrybun",
  name: "Гнилий грибун",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 445,
  lore: {
    description: "Грибна істота.",
    behavior: "Зустрічається: темні печери, гнилі пні.",
    abilities: ["розкидає слабкі спори"],
  },
});

/* monsters/hoblin-shaman.js */
Atlas.registerMonster({
  format: 2,
  id: "hoblin-shaman",
  name: "Гоблін-шаман",
  kind: "mini-boss",
  nature: "magic",
  variants: ["крилатий гоблін-шаман", "гоблінський шаман-буревісник"],
  spawn: { biomes: ["wasteland", "hills", "grass"], worlds: "all" },
  order: 317,
  lore: {
    description: "Магічний гуманоїд. Об'єднує схожих істот: крилатий гоблін-шаман, гоблінський шаман-буревісник.",
    behavior: "Зустрічається: гоблінські фортеці; пагорби й табори.",
    abilities: ["прокляті тотеми", "блискавки", "вітрові поштовхи", "тотеми"],
  },
});

/* monsters/hoblinskyy-alkhimik.js */
Atlas.registerMonster({
  format: 2,
  id: "hoblinskyy-alkhimik",
  name: "Гоблінський алхімік",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["grass", "hills"], worlds: "all" },
  order: 330,
  lore: {
    description: "Елітний гуманоїд.",
    behavior: "Зустрічається: гоблінські лабораторії.",
    abilities: ["вибухові склянки", "отруйні хмари", "зілля лікування"],
  },
});

/* monsters/hoblinyata-zlodyuzhky.js */
Atlas.registerMonster({
  format: 1,
  id: "hoblinyata-zlodyuzhky",
  name: "Гоблінята-злодюжки",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["grass", "forest", "hills"], worlds: "all" },
  order: 130,
});

/* monsters/hodynnykar-bez-zavtra.js */
Atlas.registerMonster({
  "format": 2,
  "id": "hodynnykar-bez-zavtra",
  "name": "Годинникар Без Завтра",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "sady-zavmerlykh-doshchiv",
      "polya-starykh-viyn",
      "sklyani-sekundy",
      "dolyny-povilnoho-starinnya",
      "mista-povtorennya"
    ],
    "worlds": [
      "noktalis"
    ]
  },
  "order": 704,
  "lore": {
    "description": "Бос світу «Нокталіс»."
  }
});

/* monsters/holchastyy-krotokhid.js */
Atlas.registerMonster({
  format: 2,
  id: "holchastyy-krotokhid",
  name: "Голчастий кротохід",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills", "desert", "grass"], worlds: "all" },
  order: 559,
  lore: {
    description: "Підземний звір із голками на спині.",
    behavior: "Піщано-кам’яні рівнини.",
    abilities: ["проривається крізь ґрунт і залишає небезпечні гряди"],
  },
});

/* monsters/holem-chornoho-kamenya.js */
Atlas.registerMonster({
  format: 1,
  id: "holem-chornoho-kamenya",
  name: "Голем Чорного Каменя",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["hills", "mountain", "peaks"], worlds: "all" },
  order: 62,
});

/* monsters/holemy-shakhtari.js */
Atlas.registerMonster({
  "format": 2,
  "id": "holemy-shakhtari",
  "name": "Големи-шахтарі",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "midni-hrebeni",
      "zeleni-malakhitovi-skhyly",
      "fioletovi-zhyly",
      "siri-shakhtarski-dolyny",
      "kobaltovi-ustupy",
      "syni-karyery",
      "kryshtalevi-pechery",
      "temni-hirski-sela"
    ],
    "worlds": [
      "rudozir"
    ]
  },
  "order": 889,
  "lore": {
    "description": "Загроза світу «Рудозір»."
  }
});

/* monsters/holkoplechyy-zhuk.js */
Atlas.registerMonster({
  format: 2,
  id: "holkoplechyy-zhuk",
  name: "Голкоплечий жук",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["forest"], worlds: "all" },
  order: 672,
  lore: {
    description: "Комаха з парою довгих шипів на плечах.",
    behavior: "Висока осока.",
    abilities: ["атакує боком, прокладаючи вузький коридор крізь траву"],
  },
});

/* monsters/holkorohyy-zemletrus.js */
Atlas.registerMonster({
  format: 2,
  id: "holkorohyy-zemletrus",
  name: "Голкорогий землетрус",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills", "steppe"], worlds: "all" },
  order: 482,
  lore: {
    description: "Масивний бик із кам’яними рогами, що вібрують під землею.",
    behavior: "Горбисті кам’яні степи.",
    abilities: ["пробиває ґрунт і залишає нестабільні провали"],
  },
});

/* monsters/holodnyy-voron.js */
Atlas.registerMonster({
  format: 2,
  id: "holodnyy-voron",
  name: "Голодний ворон",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["grass"], worlds: "all" },
  order: 436,
  lore: {
    description: "Птах.",
    behavior: "Зустрічається: поля, села.",
    abilities: ["клювання", "крадіжка їжі"],
  },
});

/* monsters/honchak-vkradenykh-krokiv.js */
Atlas.registerMonster({
  format: 2,
  id: "honchak-vkradenykh-krokiv",
  name: "Гончак Вкрадених Кроків",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["forest"], worlds: "all" },
  order: 852,
  lore: {
    description: "Хижак із чотирма задніми лапами та однією великою передньою кінцівкою, вкритий сірою повстю.",
    behavior: "Полює на стежках між безмовними соснами.",
    abilities: ["поглинає звуки пересування й прискорюється щоразу, коли гравець робить крок, але завмирає, якщо поблизу хтось нерухомий"],
  },
});

/* monsters/honchar-zhyvykh-hir.js */
Atlas.registerMonster({
  format: 2,
  id: "honchar-zhyvykh-hir",
  name: "Гончар живих гір",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 469,
  lore: {
    description: "Товста шестирука істота з глини та мінералів.",
    behavior: "Глиняні кар’єри титанів.",
    abilities: ["ліпить із землі бійців-двійників і броньовані укриття"],
  },
});

/* monsters/horbatyy-lystoriz.js */
Atlas.registerMonster({
  format: 2,
  id: "horbatyy-lystoriz",
  name: "Горбатий листоріз",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga"], worlds: "all" },
  order: 602,
  lore: {
    description: "Комахоподібна істота, що носить на спині листяний дах.",
    behavior: "Вологі ліси.",
    abilities: ["ховається під ним, а потім атакує довгими щелепами"],
  },
});

/* monsters/horikhovyy-metalnyk.js */
Atlas.registerMonster({
  format: 2,
  id: "horikhovyy-metalnyk",
  name: "Горіховий метальник",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga"], worlds: "all" },
  order: 595,
  lore: {
    description: "Білкоподібний звір із великими щоками.",
    behavior: "Листяні ліси.",
    abilities: ["вистрілює твердими горіхами й тікає по деревах"],
  },
});

/* monsters/horikhovyy-pyshchak.js */
Atlas.registerMonster({
  format: 2,
  id: "horikhovyy-pyshchak",
  name: "Горіховий пищак",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga"], worlds: "all" },
  order: 729,
  lore: {
    description: "Дрібний звір, що ховає горіхи в щоках.",
    behavior: "Ліщинові гаї.",
    abilities: ["плюється дрібними шкаралупками, якщо його потривожити"],
  },
});

/* monsters/horshchyk-peklo.js */
Atlas.registerMonster({
  "format": 2,
  "id": "horshchyk-peklo",
  "name": "Гончар пекла",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "tag:amber",
      "tag:clay"
    ],
    "worlds": "all"
  },
  "order": 999,
  "lore": {
    "description": "Велетень-гончар із кам'яним колом замість серця.",
    "behavior": "Виготовляє слуг із глини й випалює їх у горнилі.",
    "abilities": [
      "випалює слуг",
      "розбиває на черепки",
      "кидає розпечену глину"
    ],
    "drops": [
      "горнило гончара",
      "жива глина"
    ]
  }
});

/* monsters/hospodar-dyvnoho-krayu.js */
Atlas.registerMonster({
  "format": 2,
  "id": "hospodar-dyvnoho-krayu",
  "name": "Господар дивного краю",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "tag:land+fantasy"
    ],
    "worlds": "all"
  },
  "order": 1002,
  "lore": {
    "description": "Високий постать у плащі зі шматків різних пейзажів.",
    "behavior": "Господарює в кожному дивному краї й міняє його правила.",
    "abilities": [
      "змінює ландшафт у бою",
      "закликає слуг із різних біомів",
      "відводить увагу ілюзіями"
    ],
    "drops": [
      "плащ краю",
      "печатка господаря"
    ]
  },
  "variants": [
    "господар краю"
  ]
});

/* monsters/hospodar-zvorotnoho-polumya.js */
Atlas.registerMonster({
  format: 2,
  id: "hospodar-zvorotnoho-polumya",
  name: "Господар зворотного полум’я",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["ashlands"], worlds: "all" },
  order: 475,
  lore: {
    description: "Істота з попелястим панциром і блакитним полум’ям усередині.",
    behavior: "Попелясті терми.",
    abilities: ["відновлює здоров’я, коли отримує вогняні атаки, і поглинає жар арени"],
  },
});

/* monsters/hrebenezub.js */
Atlas.registerMonster({
  format: 2,
  id: "hrebenezub",
  name: "Гребенезуб",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 818,
  lore: {
    description: "Тонка хижакоподібна риба з гребінчастими зубами, пласкими плавниками та довгим хвостовим клином.",
    behavior: "Мешкає серед затонулих кораблів узбережжя.",
    abilities: ["шкребе днища човнів, послаблюючи дошки, а потім пробиває ослаблені місця різким ударом"],
  },
});

/* monsters/hromovyy-buyvol.js */
Atlas.registerMonster({
  format: 2,
  id: "hromovyy-buyvol",
  name: "Громовий буйвол",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["savanna"], worlds: "all" },
  order: 294,
  lore: {
    description: "Магічний звір.",
    behavior: "Зустрічається: широкі савани.",
    abilities: ["електричні роги", "розгони", "грозові розряди"],
  },
});

/* monsters/hryb-pukhlyk.js */
Atlas.registerMonster({
  "format": 2,
  "id": "hryb-pukhlyk",
  "name": "Гриб-пухлик",
  "kind": "weak",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "tag:mushroom",
      "tag:glow",
      "tag:toxic"
    ],
    "worlds": "all"
  },
  "order": 981,
  "lore": {
    "description": "Кругленький гриб на ніжках, що підстрибує.",
    "behavior": "Розкидає спори в обличчя.",
    "abilities": [
      "спори дурману",
      "стрибки"
    ],
    "drops": [
      "спори",
      "капелюшок"
    ]
  }
});

/* monsters/hrybna-krykhta.js */
Atlas.registerMonster({
  format: 2,
  id: "hrybna-krykhta",
  name: "Грибна крихта",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga", "grass"], worlds: "all" },
  order: 716,
  lore: {
    description: "Крихітний грибок на ніжках.",
    behavior: "Грибні галявини.",
    abilities: ["тікає стрибками й розкидає легкі спори"],
  },
});

/* monsters/hrybnyi-patriarkh.js */
Atlas.registerMonster({
  "format": 2,
  "id": "hrybnyi-patriarkh",
  "name": "Грибний патріарх",
  "kind": "mini-boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "tag:mushroom",
      "tag:glow",
      "tag:toxic"
    ],
    "worlds": "all"
  },
  "order": 983,
  "lore": {
    "description": "Високий гриб-старець із очима на капелюшку.",
    "behavior": "Керує меншими грибами й просить розмов.",
    "abilities": [
      "закликає спорових слуг",
      "отруйна хмара"
    ],
    "drops": [
      "капелюх патріарха",
      "спори"
    ]
  }
});

/* monsters/hrybnyy-kolos.js */
Atlas.registerMonster({
  format: 2,
  id: "hrybnyy-kolos",
  name: "Грибний колос",
  kind: "boss",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga", "hills", "mountain"], worlds: "all" },
  order: 282,
  lore: {
    description: "Грибний велетень.",
    behavior: "Зустрічається: підземні грибні ліси.",
    abilities: ["спори сну", "отруйні хмари", "вибухові гриби"],
  },
});

/* monsters/hrybnyy-nosylnyk.js */
Atlas.registerMonster({
  format: 2,
  id: "hrybnyy-nosylnyk",
  name: "Грибний носильник",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga", "hills", "mountain"], worlds: "all" },
  order: 545,
  lore: {
    description: "Велика повільна істота з кошиком грибів на спині.",
    behavior: "Підземні грибниці.",
    abilities: ["розкидає навколо вибухові капелюшки"],
  },
});

/* monsters/hrybnyy-pereviznyk.js */
Atlas.registerMonster({
  format: 2,
  id: "hrybnyy-pereviznyk",
  name: "Грибний Перевізник",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga", "grass", "hills"], worlds: "all" },
  order: 877,
  lore: {
    description: "Велика шестинога істота з округлою шапкою гриба замість спини та ногами з переплетеного коріння.",
    behavior: "Мешкає в підземних грибних садах.",
    abilities: ["перевозить дрібні гриби на власному тілі, а під час загрози скидає їх, утворюючи слизький килим"],
  },
});

/* monsters/hrybnyy-zhuk.js */
Atlas.registerMonster({
  format: 2,
  id: "hrybnyy-zhuk",
  name: "Грибний жук",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga"], worlds: "all" },
  order: 403,
  lore: {
    description: "Комаха.",
    behavior: "Зустрічається: грибні ліси.",
    abilities: ["розпорошує спори", "ховається під капелюшком гриба"],
  },
});

/* monsters/hryfony.js */
Atlas.registerMonster({
  format: 1,
  id: "hryfony",
  name: "грифони",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["hills", "mountain", "peaks"], worlds: "all" },
  order: 8,
});

/* monsters/hubchasta-matka.js */
Atlas.registerMonster({
  "format": 2,
  "id": "hubchasta-matka",
  "name": "Губчаста матка",
  "kind": "mini-boss",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "tag:swamp",
      "tag:wet"
    ],
    "worlds": "all"
  },
  "order": 942,
  "lore": {
    "description": "Величезна пориста губка на кривих лапах, що народжує дрібних губчат.",
    "behavior": "Сидить у трясовині й вичавлює воду на всіх навколо.",
    "abilities": [
      "випускає виводок губчат",
      "вбирає удари й повертає водяним потоком"
    ],
    "drops": [
      "живляча губка",
      "жила матки"
    ]
  }
});

/* monsters/hulki-holemy.js */
Atlas.registerMonster({
  "format": 2,
  "id": "hulki-holemy",
  "name": "Гулкі големи",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "dzvinki-khrebty",
      "tykhi-porozhnyny",
      "spivochi-stepy",
      "rezonansni-lisy",
      "basovi-bezodni"
    ],
    "worlds": [
      "runhar"
    ]
  },
  "order": 750,
  "lore": {
    "description": "Загроза світу «Рунгар»."
  }
});

/* monsters/husin-kameneriz.js */
Atlas.registerMonster({
  format: 2,
  id: "husin-kameneriz",
  name: "Гусінь-каменеріз",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["hills", "mountain"], worlds: "all" },
  order: 508,
  lore: {
    description: "Товста гусінь із пласкими лезами на боках.",
    behavior: "Сланцеві пагорби.",
    abilities: ["прорізає траншеї та залишає гострі уламки породи"],
  },
});

/* monsters/imunni-kolosy.js */
Atlas.registerMonster({
  "format": 2,
  "id": "imunni-kolosy",
  "name": "Імунні колоси",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "kistyani-alpy",
      "bahryani-sudyny",
      "lehenevi-stepy",
      "zhovchni-ozera",
      "nervovi-sady"
    ],
    "worlds": [
      "ormaval"
    ]
  },
  "order": 705,
  "lore": {
    "description": "Загроза світу «Ормаваль»."
  }
});

/* monsters/irzhavyy-hrabar.js */
Atlas.registerMonster({
  format: 2,
  id: "irzhavyy-hrabar",
  name: "Іржавий грабар",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 531,
  lore: {
    description: "Невисока істота з металевими лопатями замість рук.",
    behavior: "Покинуті фортифікації.",
    abilities: ["викопує ями й ховається у виритих ходах"],
  },
});

/* monsters/istoty-strakhu.js */
Atlas.registerMonster({
  "format": 2,
  "id": "istoty-strakhu",
  "name": "Істоти страху",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "usmikhneni-lisy",
      "strakhitlyvi-pahorby",
      "dzerkalni-rivnyny",
      "dolyny-spokoyu",
      "maskovi-hory"
    ],
    "worlds": [
      "kernalis"
    ]
  },
  "order": 757,
  "lore": {
    "description": "Загроза світу «Керналіс»."
  }
});

/* monsters/kamenyi-arkhivariy.js */
Atlas.registerMonster({
  "format": 2,
  "id": "kamenyi-arkhivariy",
  "name": "Кам'яний архівар",
  "kind": "mini-boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "tag:ruins",
      "tag:bones",
      "tag:dead"
    ],
    "worlds": "all"
  },
  "order": 975,
  "lore": {
    "description": "Статуя зі стосом кам'яних сувоїв замість голови.",
    "behavior": "Допитує мандрівників загадками на камені.",
    "abilities": [
      "каменем накладає мовчання",
      "пересуває стіни"
    ],
    "drops": [
      "кам'яний сувій",
      "печатка архівара"
    ]
  }
});

/* monsters/kamertonnyy-zhuk.js */
Atlas.registerMonster({
  format: 2,
  id: "kamertonnyy-zhuk",
  name: "Камертонний Жук",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 885,
  lore: {
    description: "Великий жук із двома металевими рогами, що утворюють вилку.",
    behavior: "Живе у шахтах із покладами чорного заліза.",
    abilities: ["вдаряє рогами об каміння, викликаючи резонанс, який руйнує крихкі блоки та тимчасово дезорієнтує супротивників"],
  },
});

/* monsters/kamianyi-lyshainyk.js */
Atlas.registerMonster({
  "format": 2,
  "id": "kamianyi-lyshainyk",
  "name": "Кам'яний лишайник",
  "kind": "weak",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "tag:canyon"
    ],
    "worlds": "all"
  },
  "order": 949,
  "lore": {
    "description": "Плаский лишайник, що повзе по відвісних стінах.",
    "behavior": "Висить на скелях, падає на тих, хто йде вузьким проходом.",
    "abilities": [
      "падає й обволікає",
      "маскується під скелю"
    ],
    "drops": [
      "лишайник",
      "кам'яна цвіль"
    ]
  }
});

/* monsters/kaminni-veletni.js */
Atlas.registerMonster({
  format: 1,
  id: "kaminni-veletni",
  name: "камінні велетні",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["hills", "mountain", "peaks"], worlds: "all" },
  order: 6,
});

/* monsters/kamyana-morska-zirka.js */
Atlas.registerMonster({
  format: 2,
  id: "kamyana-morska-zirka",
  name: "Кам’яна морська зірка",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 683,
  lore: {
    description: "Велика п’ятикутна істота з гранітними променями.",
    behavior: "Підводні руїни.",
    abilities: ["повільно пересувається по стінах і скидає гострі пластини"],
  },
});

/* monsters/kamyani-honchi.js */
Atlas.registerMonster({
  "format": 2,
  "id": "kamyani-honchi",
  "name": "Кам'яні гончі",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "statuyevi-dibrovy",
      "bazaltovi-karyery",
      "kvartsovi-ustupy",
      "pylovi-dolyny",
      "chervoni-ustupy",
      "hlyboki-yary",
      "mokhovi-terasy",
      "sonyachni-kamyani-mosty",
      "vysoki-viaduky",
      "zeleni-ustupy",
      "kamyani-perevaly",
      "zabuti-mostovi-mista"
    ],
    "worlds": [
      "kamyanorod",
      "hlybokray"
    ]
  },
  "order": 815,
  "lore": {
    "description": "Загроза світу «Кам'янород»."
  }
});

/* monsters/kamyani-storozhi.js */
Atlas.registerMonster({
  "format": 2,
  "id": "kamyani-storozhi",
  "name": "Кам'яні сторожі",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "kvartsovi-sady",
      "hranatovi-plato",
      "bili-kamyani-luky",
      "temni-heodni-pechery"
    ],
    "worlds": [
      "skeltsvit"
    ]
  },
  "order": 883,
  "lore": {
    "description": "Загроза світу «Скельцвіт»."
  }
});

/* monsters/kamyani-striltsi.js */
Atlas.registerMonster({
  "format": 2,
  "id": "kamyani-striltsi",
  "name": "Кам'яні стрільці",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "mertvi-ryfy",
      "mushlyani-dyuny",
      "skamyanili-prybiyni-skeli",
      "blakytni-pechery",
      "kreydyani-vezhi",
      "sukhi-morski-terasy",
      "chervoni-rozlomy",
      "skamyanili-berehy"
    ],
    "worlds": [
      "fossar"
    ]
  },
  "order": 837,
  "lore": {
    "description": "Загроза світу «Фоссар»."
  }
});

/* monsters/kamyanyy-klishch.js */
Atlas.registerMonster({
  format: 2,
  id: "kamyanyy-klishch",
  name: "Кам'яний кліщ",
  kind: "monster",
  nature: "magic",
  variants: ["літаючий кам’яний кліщ", "малий кам’яний кліщ"],
  spawn: { biomes: ["mountain", "hills", "wasteland"], worlds: "all" },
  order: 408,
  lore: {
    description: "Магічна істота. Об'єднує схожих істот: літаючий кам’яний кліщ, малий кам’яний кліщ.",
    behavior: "Зустрічається: гірські руїни; гірські стежки.",
    abilities: ["коротко зависає в повітрі", "б’є кам’яними щелепами", "слабкий удар", "маскується під камінь"],
  },
});

/* monsters/kamyanyy-konyk.js */
Atlas.registerMonster({
  format: 2,
  id: "kamyanyy-konyk",
  name: "Кам’яний коник",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 655,
  lore: {
    description: "Стрибуча комаха з квадратними задніми лапами.",
    behavior: "Скельні тераси.",
    abilities: ["відскакує від стін і збиває гравця з ніг"],
  },
});

/* monsters/kamyanyy-korol-veletniv.js */
Atlas.registerMonster({
  format: 2,
  id: "kamyanyy-korol-veletniv",
  name: "Кам’яний король велетнів",
  kind: "super-boss",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 263,
  lore: {
    description: "Гірський велетень.",
    behavior: "Зустрічається: гірські цитаделі.",
    abilities: ["обвали", "удари землею", "кидання валунів"],
  },
});

/* monsters/kamyanyy-luskar.js */
Atlas.registerMonster({
  format: 2,
  id: "kamyanyy-luskar",
  name: "Кам’яний лускар",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 537,
  lore: {
    description: "Рептилій із квадратними пластинами на спині.",
    behavior: "Сухі кам’янисті плато.",
    abilities: ["відкидає дрібні кам’яні луски як метальні снаряди"],
  },
});

/* monsters/kamyanyy-morzhyk.js */
Atlas.registerMonster({
  format: 2,
  id: "kamyanyy-morzhyk",
  name: "Кам’яний моржик",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 687,
  lore: {
    description: "Кремезна напівводна тварина з короткими мінеральними бивнями.",
    behavior: "Холодні береги.",
    abilities: ["зіштовхує ворогів із крижаної кромки"],
  },
});

/* monsters/kamyanyy-prylypay.js */
Atlas.registerMonster({
  format: 2,
  id: "kamyanyy-prylypay",
  name: "Кам’яний прилипай",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 713,
  lore: {
    description: "Маленька істота з присосками на нижній частині тіла.",
    behavior: "Мокрі прибережні скелі.",
    abilities: ["прикріплюється до човнів, каменів і ніг, сповільнюючи рух"],
  },
});

/* monsters/kamyanyy-surykat.js */
Atlas.registerMonster({
  format: 2,
  id: "kamyanyy-surykat",
  name: "Кам’яний сурикат",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 620,
  lore: {
    description: "Маленька норна тварина із сірою шкірою, схожою на гальку.",
    behavior: "Сухі каньйони.",
    abilities: ["завмирає вертикально й подає тривожні сигнали"],
  },
});

/* monsters/kamyanyy-sviyskyy-piven.js */
Atlas.registerMonster({
  format: 2,
  id: "kamyanyy-sviyskyy-piven",
  name: "Кам’яний свійський півень",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills", "grass"], worlds: "all" },
  order: 524,
  lore: {
    description: "Високий птах із гранітним гребенем.",
    behavior: "Кам’янисті фермерські угіддя.",
    abilities: ["пробиває землю дзьобом і здіймає кільцеві хвилі пилу"],
  },
});

/* monsters/kamyanyy-svystun.js */
Atlas.registerMonster({
  format: 2,
  id: "kamyanyy-svystun",
  name: "Кам'яний свистун",
  kind: "boss",
  nature: "magic",
  variants: ["кам’яний свистун", "кам’яний свисток"],
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 501,
  lore: {
    description: "Вузький крилатий звір із порожнистими кістяними ребрами. Об'єднує схожих істот: кам’яний свистун, кам’яний свисток.",
    behavior: "Високі вапнякові стіни. Гірські арки.",
    abilities: ["кам’яний свистун: свистом викликає каменепади й відволікає хижаків", "кам’яний свисток: свистом відволікає та викликає короткі пориви вітру"],
  },
});

/* monsters/kamyanyy-vertun.js */
Atlas.registerMonster({
  format: 2,
  id: "kamyanyy-vertun",
  name: "Кам’яний вертун",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 603,
  lore: {
    description: "Невелика істота з кільцевим панциром.",
    behavior: "Галькові береги.",
    abilities: ["обертається на місці та створює пилові завихрення"],
  },
});

/* monsters/kamyanyy-vusach.js */
Atlas.registerMonster({
  format: 2,
  id: "kamyanyy-vusach",
  name: "Кам'яний Вусач",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 876,
  lore: {
    description: "Печерний звір із широким пласким черепом і двома довгими вусами з білого кварцу.",
    behavior: "Живе в темних тунелях під гірськими монастирями.",
    abilities: ["вловлює вібрації через вуса й атакує лише тоді, коли гравець рухається, зате не реагує на нерухомі цілі"],
  },
});

/* monsters/kamyanyy-zhuk-oberih.js */
Atlas.registerMonster({
  format: 2,
  id: "kamyanyy-zhuk-oberih",
  name: "Кам’яний жук-оберіг",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills", "wasteland"], worlds: "all" },
  order: 318,
  lore: {
    description: "Магічна комаха.",
    behavior: "Зустрічається: гірські храми.",
    abilities: ["кам’яна броня", "ударні хвилі"],
  },
});

/* monsters/kanalni-marodery.js */
Atlas.registerMonster({
  "format": 2,
  "id": "kanalni-marodery",
  "name": "Канальні мародери",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "kanalni-stepy",
      "vodyani-terasy",
      "sukhi-vodoskhovyshcha",
      "arkhitekturni-kanyony"
    ],
    "worlds": [
      "akvedor"
    ]
  },
  "order": 873,
  "lore": {
    "description": "Загроза світу «Акведор»."
  }
});

/* monsters/kanalovi-khyzhaky.js */
Atlas.registerMonster({
  "format": 2,
  "id": "kanalovi-khyzhaky",
  "name": "Каналові хижаки",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "midni-dakhy",
      "zeleni-doshchovi-dolyny",
      "kamyani-kanaly",
      "zatopleni-nyzhni-kvartaly"
    ],
    "worlds": [
      "doshchohrad"
    ]
  },
  "order": 894,
  "lore": {
    "description": "Загроза світу «Дощоград»."
  }
});

/* monsters/kanionnyi-sup.js */
Atlas.registerMonster({
  "format": 2,
  "id": "kanionnyi-sup",
  "name": "Каньйонний сип",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "tag:canyon"
    ],
    "worlds": "all"
  },
  "order": 950,
  "lore": {
    "description": "Червоний стерв'ятник із рогами-уступами.",
    "behavior": "Кружляє над ущелинами й виглядає втомлених мандрівників.",
    "abilities": [
      "пікірує з виступів",
      "скидає каміння з-під крил"
    ],
    "drops": [
      "пір'я сипа",
      "рогова пластина"
    ]
  }
});

/* monsters/kapelyushnyk-pereverten.js */
Atlas.registerMonster({
  format: 2,
  id: "kapelyushnyk-pereverten",
  name: "Капелюшник-перевертень",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga", "mountain", "hills"], worlds: "all" },
  order: 519,
  lore: {
    description: "Грибна істота з великим капелюхом, що нагадує камінь.",
    behavior: "Мохові скелі.",
    abilities: ["маскується серед валунів і викидає липкі спори"],
  },
});

/* monsters/kapitan-pokhovanoho-flotu.js */
Atlas.registerMonster({
  "format": 2,
  "id": "kapitan-pokhovanoho-flotu",
  "name": "Капітан Похованого Флоту",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "zoloti-dyuny",
      "chorni-kamyani-ryfy",
      "midni-oazy",
      "pokhovani-porty"
    ],
    "worlds": [
      "vitroparus"
    ]
  },
  "order": 869,
  "lore": {
    "description": "Бос світу «Вітропарус»."
  }
});

/* monsters/kapitan-skeletiv.js */
Atlas.registerMonster({
  format: 2,
  id: "kapitan-skeletiv",
  name: "Капітан скелетів",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 300,
  lore: {
    description: "Нежить.",
    behavior: "Зустрічається: кладовища, руїни.",
    abilities: ["піднімає скелетних воїнів", "атакує шаблею"],
  },
});

/* monsters/kapotsefaly.js */
Atlas.registerMonster({
  format: 1,
  id: "kapotsefaly",
  name: "капоцефали",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["deep"], worlds: "all" },
  order: 47,
});

/* monsters/kapturnyk.js */
Atlas.registerMonster({
  format: 2,
  id: "kapturnyk",
  name: "Каптурник",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["grass", "hills"], worlds: "all" },
  order: 783,
  lore: {
    description: "Приземкуватий монстр із каптуром із перекритих сланцевих плит і короткими руками, що ховаються під панциром.",
    behavior: "Живе вздовж старих паломницьких доріг.",
    abilities: ["розкриває каптур у вигляді великого радіального віяла, поглинаючи спрямовані в нього чари, а потім згортається й прослизає крізь вузькі щілини"],
  },
});

/* monsters/karstovi-holemy.js */
Atlas.registerMonster({
  "format": 2,
  "id": "karstovi-holemy",
  "name": "Карстові големи",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "biryuzovi-baseyny",
      "terasovi-sady",
      "bili-karstovi-skeli",
      "tepli-pidzemni-dzherela"
    ],
    "worlds": [
      "kaltseron"
    ]
  },
  "order": 853,
  "lore": {
    "description": "Загроза світу «Кальцерон»."
  }
});

/* monsters/kashlyayuchyy-hrybok.js */
Atlas.registerMonster({
  format: 2,
  id: "kashlyayuchyy-hrybok",
  name: "Кашляючий грибок",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga", "grass", "steppe"], worlds: "all" },
  order: 611,
  lore: {
    description: "Крихітний грибний монстр із товстою ніжкою.",
    behavior: "Темні грибні зарості.",
    abilities: ["випускає спори короткими порціями, коли його наближаються"],
  },
});

/* monsters/kashtanovyy-kulachnyk.js */
Atlas.registerMonster({
  format: 2,
  id: "kashtanovyy-kulachnyk",
  name: "Каштановий кулачник",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga"], worlds: "all" },
  order: 582,
  lore: {
    description: "Маленький звір із твердими горбами на лапах.",
    behavior: "Ліщинові гаї.",
    abilities: ["скручується в клубок і стукає по ворогу, наче горіхом"],
  },
});

/* monsters/kazhan.js */
Atlas.registerMonster({
  format: 2,
  id: "kazhan",
  name: "Кажан",
  kind: "monster",
  nature: "threat",
  variants: ["гірський кажан", "великий нічний кажан", "печерний кажан"],
  spawn: { biomes: ["mountain", "hills", "grass"], worlds: "all" },
  order: 378,
  lore: {
    description: "Літаючий звір. Об'єднує схожих істот: гірський кажан, великий нічний кажан, печерний кажан.",
    behavior: "Зустрічається: печери; старі вежі, печери.",
    abilities: ["укуси", "ехолокація", "зграєві атаки", "коротке оглушення", "дезорієнтувальний писк"],
  },
});

/* monsters/kazhany-krovopyvtsi.js */
Atlas.registerMonster({
  format: 1,
  id: "kazhany-krovopyvtsi",
  name: "Кажани-кровопивці",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["hills", "mountain", "forest"], worlds: "all" },
  order: 129,
});

/* monsters/kentavr.js */
Atlas.registerMonster({
  format: 2,
  id: "kentavr",
  name: "Кентавр",
  kind: "monster",
  nature: "threat",
  variants: ["отруйний кентавр-рейдер", "кентавр-лучник"],
  spawn: { biomes: ["steppe"], worlds: "all" },
  order: 339,
  lore: {
    description: "Елітний вершник. Об'єднує схожих істот: отруйний кентавр-рейдер, кентавр-лучник.",
    behavior: "Зустрічається: степи.",
    abilities: ["спис", "отруйні стріли", "швидкі наскоки", "стріли на бігу", "швидке відступлення"],
  },
});

/* monsters/keramichnyy-pantsyrnyk.js */
Atlas.registerMonster({
  format: 2,
  id: "keramichnyy-pantsyrnyk",
  name: "Керамічний панцирник",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 555,
  lore: {
    description: "Повільний звір із глазурованою бронею.",
    behavior: "Глиняні плато.",
    abilities: ["відбиває слабкі снаряди й тріскається під важкими ударами"],
  },
});

/* monsters/keramichnyy-pyskun.js */
Atlas.registerMonster({
  format: 2,
  id: "keramichnyy-pyskun",
  name: "Керамічний пискун",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 607,
  lore: {
    description: "Крихка істота з порцеляновою головою.",
    behavior: "Підвали старих гончарень.",
    abilities: ["видає різкий звук, від якого тріскаються слабкі предмети"],
  },
});

/* monsters/kharibda.js */
Atlas.registerMonster({
  format: 1,
  id: "kharibda",
  name: "Харібда",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["deep"], worlds: "all" },
  order: 88,
});

/* monsters/khmarni-khyzhaky.js */
Atlas.registerMonster({
  "format": 2,
  "id": "khmarni-khyzhaky",
  "name": "Хмарні хижаки",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "kryshtalevi-neboskhyly",
      "kamyani-khmary",
      "hlybynni-luky",
      "sonyachni-porozhnyny",
      "pokhovani-mista"
    ],
    "worlds": [
      "skarveld"
    ]
  },
  "order": 755,
  "lore": {
    "description": "Загроза світу «Скарвельд»."
  }
});

/* monsters/khmarnyi-pukhnastyk.js */
Atlas.registerMonster({
  "format": 2,
  "id": "khmarnyi-pukhnastyk",
  "name": "Хмарний пухнастик",
  "kind": "weak",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "tag:cloud"
    ],
    "worlds": "all"
  },
  "order": 936,
  "lore": {
    "description": "Круглий кубічний звірок із білою хмароподібною шерстю й крихітними крильцями.",
    "behavior": "Тримається зграйками між плавучими островами, ночує в густому тумані.",
    "abilities": [
      "падає повільно, як пір'їна, тож не розбивається з жодної висоти",
      "розкидає пухнасті клубки, які липнуть до ніг"
    ],
    "drops": [
      "хмарна вовна",
      "пір'їна пухнастика"
    ]
  },
  "variants": [
    "вітряний",
    "грозовий"
  ]
});

/* monsters/khodyachyy-koral.js */
Atlas.registerMonster({
  format: 2,
  id: "khodyachyy-koral",
  name: "Ходячий Корал",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 820,
  lore: {
    description: "Повільна колонія коралових гілок на шести тонких кам’яних ногах, із порожниною в центрі, де виблискує маленька перлина.",
    behavior: "Мешкає в коралових садах.",
    abilities: ["повністю підбирає ноги й удає частину рифу, а при наближенні розкривається й перегороджує шлях розгалуженими відростками"],
  },
});

/* monsters/khorovod-burevisnykh-vezh.js */
Atlas.registerMonster({
  format: 2,
  id: "khorovod-burevisnykh-vezh",
  name: "Хоровод Буревісних Веж",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills", "peaks"], worlds: "all" },
  order: 740,
  lore: {
    description: "Сім рухомих кам’яних стовпів із блискавичними жилами замість облич.",
    behavior: "Охороняють високогірне Плато Громових Кіл.",
    abilities: ["кружляють навколо цілі, передають електричні розряди між собою та раптово міняються місцями"],
  },
});

/* monsters/khranytel-biloho-labiryntu.js */
Atlas.registerMonster({
  "format": 2,
  "id": "khranytel-biloho-labiryntu",
  "name": "Хранитель Білого Лабіринту",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "mertvi-ryfy",
      "mushlyani-dyuny",
      "skamyanili-prybiyni-skeli",
      "blakytni-pechery",
      "kreydyani-vezhi",
      "sukhi-morski-terasy",
      "chervoni-rozlomy",
      "skamyanili-berehy"
    ],
    "worlds": [
      "fossar"
    ]
  },
  "order": 839,
  "lore": {
    "description": "Бос світу «Фоссар»."
  }
});

/* monsters/khranytel-kryshtalyu.js */
Atlas.registerMonster({
  format: 1,
  id: "khranytel-kryshtalyu",
  name: "Хранитель Кришталю",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["crystal", "peaks"], worlds: "all" },
  order: 115,
});

/* monsters/khranytel-rozbytoho-misyatsya.js */
Atlas.registerMonster({
  "format": 2,
  "id": "khranytel-rozbytoho-misyatsya",
  "name": "Хранитель Розбитого Місяця",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "snow",
      "syni-lodovyky",
      "zamerzli-sosny",
      "krystalichni-pechery"
    ],
    "worlds": [
      "frostheym"
    ]
  },
  "order": 844,
  "lore": {
    "description": "Бос світу «Фростгейм»."
  }
});

/* monsters/khranytel-tykhoho-pryplyvu.js */
Atlas.registerMonster({
  "format": 2,
  "id": "khranytel-tykhoho-pryplyvu",
  "name": "Хранитель тихого припливу",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "tag:shore",
      "tag:water",
      "tag:sea",
      "tag:fresh"
    ],
    "worlds": "all"
  },
  "order": 980,
  "lore": {
    "description": "Колосальна медуза-парасоля з перлинами всередині.",
    "behavior": "Підіймається з глибин, коли місяць повний.",
    "abilities": [
      "електричні щупальці",
      "хвиля-цунамі",
      "зцілюється від води"
    ],
    "drops": [
      "серце медузи",
      "перлина припливу"
    ]
  }
});

/* monsters/khranytel-zolotoho-mista.js */
Atlas.registerMonster({
  "format": 2,
  "id": "khranytel-zolotoho-mista",
  "name": "Хранитель Золотого Міста",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "zoloti-nyzyny",
      "tumanni-lisy",
      "kamyani-vysoty",
      "zatopleni-svyatylyshcha"
    ],
    "worlds": [
      "aurokhm"
    ]
  },
  "order": 863,
  "lore": {
    "description": "Бос світу «Аурохм»."
  }
});

/* monsters/khrebtolom-pidzemnykh-richok.js */
Atlas.registerMonster({
  format: 2,
  id: "khrebtolom-pidzemnykh-richok",
  name: "Хребтолом Підземних Річок",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 765,
  lore: {
    description: "Довге низьке чудовисько з десятків вапнякових хребців, лапами, схожими на кирки, і порожнім тулубом, крізь який проходить вода.",
    behavior: "Ховається в каньйонах підземних річок.",
    abilities: ["викривляє підземні русла, перетворюючи потоки на вертикальні водоспади, що зносять усе на своєму шляху"],
  },
});

/* monsters/khyzhaky-kozhnoho-sezonu.js */
Atlas.registerMonster({
  "format": 2,
  "id": "khyzhaky-kozhnoho-sezonu",
  "name": "Хижаки кожного сезону",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "kvituchi-dibrovy",
      "zoloti-zhnyva",
      "bahryani-veresovyshcha",
      "kryzhanyy-pereval"
    ],
    "worlds": [
      "sezonariy"
    ]
  },
  "order": 832,
  "lore": {
    "description": "Загроза світу «Сезонарій»."
  }
});

/* monsters/khyzhaky-mandrivnyky.js */
Atlas.registerMonster({
  "format": 2,
  "id": "khyzhaky-mandrivnyky",
  "name": "Хижаки-мандрівники",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "kochovi-luky",
      "korenevi-berehy",
      "pantsyrni-lisy",
      "koralovi-plato",
      "mihratsiyni-bolota"
    ],
    "worlds": [
      "litarkh"
    ]
  },
  "order": 752,
  "lore": {
    "description": "Загроза світу «Літарх»."
  }
});

/* monsters/khyzhaky-protok.js */
Atlas.registerMonster({
  "format": 2,
  "id": "khyzhaky-protok",
  "name": "Хижаки проток",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "syni-katedry",
      "chorni-protoky",
      "koralovi-pechery",
      "povitryani-ozera",
      "zeleni-hlybynni-lisy"
    ],
    "worlds": [
      "talassyr"
    ]
  },
  "order": 770,
  "lore": {
    "description": "Загроза світу «Талассир»."
  }
});

/* monsters/khyzhaky-zabuttya.js */
Atlas.registerMonster({
  "format": 2,
  "id": "khyzhaky-zabuttya",
  "name": "Хижаки забуття",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "lavandovi-sny",
      "koshmarni-lisy",
      "dolyny-myakykh-skel",
      "bili-sady-spohadiv",
      "chorni-porozhnechi"
    ],
    "worlds": [
      "umbralit"
    ]
  },
  "order": 776,
  "lore": {
    "description": "Загроза світу «Умбраліт»."
  }
});

/* monsters/khyzhi-vatazhky.js */
Atlas.registerMonster({
  "format": 2,
  "id": "khyzhi-vatazhky",
  "name": "Хижі ватажки",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "vysokotravya",
      "kamyani-vodopoyi",
      "chervoni-pahorby",
      "tumanni-zaplavy"
    ],
    "worlds": [
      "veletraviya"
    ]
  },
  "order": 818,
  "lore": {
    "description": "Загроза світу «Велетравія»."
  }
});

/* monsters/kin.js */
Atlas.registerMonster({
  format: 2,
  id: "kin",
  name: "Кінь",
  kind: "monster",
  nature: "magic",
  variants: ["дикий кінь", "бойовий кінь-утікач", "клинокопитний кінь"],
  spawn: { biomes: ["grass", "wasteland", "hills", "peaks"], worlds: "all" },
  order: 383,
  lore: {
    description: "Звір. Об'єднує схожих істот: дикий кінь, бойовий кінь-утікач, клинокопитний кінь.",
    behavior: "Зустрічається: рівнини; руїни старих військових таборів; Вітряні рівнини.",
    abilities: ["удар копитами", "швидкий відступ", "таран", "лякаючий іржанням", "клинокопитний кінь: б’є по землі й розкидає невеликі кам’яні уламки"],
  },
});

/* monsters/king-of-storm-rams.js */
Atlas.registerMonster({
  "format": 2,
  "id": "king-of-storm-rams",
  "name": "Король Грозових Баранів",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "peaks"
    ],
    "worlds": [
      "neborid"
    ]
  },
  "order": 236,
  "lore": {
    "description": "Найбільший баран-вожак грозового стада.",
    "behavior": "Веде стадо, викликає бурю.",
    "abilities": [
      "грозова буря",
      "таран"
    ],
    "drops": [
      "корона Короля Баранів"
    ]
  }
});

/* monsters/kistkovyi-zhuk.js */
Atlas.registerMonster({
  "format": 2,
  "id": "kistkovyi-zhuk",
  "name": "Кістковий жук",
  "kind": "weak",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "tag:ruins",
      "tag:bones",
      "tag:dead"
    ],
    "worlds": "all"
  },
  "order": 973,
  "lore": {
    "description": "Жук із панциром із черепа.",
    "behavior": "Роздирає старі гробниці.",
    "abilities": [
      "гризе кістки",
      "висипає прах"
    ],
    "drops": [
      "кістковий панцир"
    ]
  }
});

/* monsters/kistyana-mysha.js */
Atlas.registerMonster({
  format: 2,
  id: "kistyana-mysha",
  name: "Кістяна миша",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 444,
  lore: {
    description: "Дрібна нежить.",
    behavior: "Зустрічається: склепи, катакомби.",
    abilities: ["слабкі укуси", "швидко тікає"],
  },
});

/* monsters/kistyani-akuly.js */
Atlas.registerMonster({
  "format": 2,
  "id": "kistyani-akuly",
  "name": "Кістяні акули",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "kistyani-dyuny",
      "morya-frahmentiv",
      "cherepni-arkhipelahy",
      "bili-bolota",
      "skeletni-ryfy"
    ],
    "worlds": [
      "oskarium"
    ]
  },
  "order": 763,
  "lore": {
    "description": "Загроза світу «Оскаріум»."
  }
});

/* monsters/kistyani-hihanty.js */
Atlas.registerMonster({
  "format": 2,
  "id": "kistyani-hihanty",
  "name": "Кістяні гіганти",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "reberni-hory",
      "krovyani-dolyny",
      "popelyasti-rivnyny",
      "cherepni-pechery",
      "sady-zabutykh-imen",
      "cherepni-plato",
      "kistyani-ustupy",
      "pylovi-dolyny",
      "pechery-khrebtsiv"
    ],
    "worlds": [
      "morgalis"
    ]
  },
  "order": 729,
  "lore": {
    "description": "Загроза світу «Морґаліс»."
  }
});

/* monsters/kistyani-honchi.js */
Atlas.registerMonster({
  "format": 2,
  "id": "kistyani-honchi",
  "name": "Кістяні гончі",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "reberni-hory",
      "krovyani-dolyny",
      "popelyasti-rivnyny",
      "cherepni-pechery",
      "sady-zabutykh-imen",
      "cherepni-plato",
      "kistyani-ustupy",
      "pylovi-dolyny",
      "pechery-khrebtsiv"
    ],
    "worlds": [
      "morgalis"
    ]
  },
  "order": 730,
  "lore": {
    "description": "Загроза світу «Морґаліс»."
  }
});

/* monsters/kistyanoklyuv.js */
Atlas.registerMonster({
  format: 2,
  id: "kistyanoklyuv",
  name: "Кістяноклюв",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["wasteland", "ashlands"], worlds: "all" },
  order: 543,
  lore: {
    description: "Птах із дзьобом, схожим на обценьки.",
    behavior: "Кургани.",
    abilities: ["вириває з землі кістки й жбурляє їх із великої відстані"],
  },
});

/* monsters/kistyanyy-buksyr.js */
Atlas.registerMonster({
  format: 2,
  id: "kistyanyy-buksyr",
  name: "Кістяний буксир",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 507,
  lore: {
    description: "Горбатий підземний звір із ланцюгами замість хвоста.",
    behavior: "Старі шахтні тунелі.",
    abilities: ["чіпляє гравця й тягне крізь небезпечні ділянки"],
  },
});

/* monsters/kistyanyy-kalihraf.js */
Atlas.registerMonster({
  format: 2,
  id: "kistyanyy-kalihraf",
  name: "Кістяний Каліграф",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills", "grass"], worlds: "all" },
  order: 769,
  lore: {
    description: "Видовжене кістяне створіння з хвостом-пером, черепом без нижньої щелепи та рухливими ребрами, що нагадують сторінки.",
    behavior: "Блукає скрипторієм у крипті старої бібліотеки.",
    abilities: ["пише у повітрі руни, які на короткий час перетворюються на фізичні пастки, стіни чи леза"],
  },
});

/* monsters/kistyanyy-kazhan-vozhak.js */
Atlas.registerMonster({
  format: 2,
  id: "kistyanyy-kazhan-vozhak",
  name: "Кістяний кажан-вожак",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 323,
  lore: {
    description: "Літаюча нежить.",
    behavior: "Зустрічається: катакомби.",
    abilities: ["звукові хвилі", "виклик кажанів"],
  },
});

/* monsters/kistyanyy-morskyy-krab.js */
Atlas.registerMonster({
  format: 2,
  id: "kistyanyy-morskyy-krab",
  name: "Кістяний морський краб",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 426,
  lore: {
    description: "Неживе членистоноге.",
    behavior: "Зустрічається: затонулі кораблі.",
    abilities: ["кістяні клешні", "збирає уламки броні"],
  },
});

/* monsters/kistyanyy-parasolnyk.js */
Atlas.registerMonster({
  format: 2,
  id: "kistyanyy-parasolnyk",
  name: "Кістяний Парасольник",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 911,
  lore: {
    description: "Невелика істота з реберного каркаса, який розкривається над головою, утворюючи парасольку.",
    behavior: "Живе в кістяних печерах давно вимерлих велетнів.",
    abilities: ["падає з високих стель, плануючи на повітрі, і відскакує від землі після приземлення"],
  },
});

/* monsters/kistyanyy-pysar-zabutykh-imen.js */
Atlas.registerMonster({
  format: 2,
  id: "kistyanyy-pysar-zabutykh-imen",
  name: "Кістяний Писар Забутих Імен",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["grass", "hills"], worlds: "all" },
  order: 855,
  lore: {
    description: "Худий чотирирукий скелетоподібний створений із білих табличок і чорнильних ниток.",
    behavior: "Блукає архівом під стародавньою бібліотекою.",
    abilities: ["записує ім'я ворога на кістяній плиті, тимчасово позбавляючи його однієї здібності, а напис можна знищити лише ударом по плиті"],
  },
});

/* monsters/klishch-parazyt.js */
Atlas.registerMonster({
  format: 2,
  id: "klishch-parazyt",
  name: "Кліщ-паразит",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga", "mountain", "hills"], worlds: "all" },
  order: 396,
  lore: {
    description: "Паразит.",
    behavior: "Зустрічається: печери, заражені ліси.",
    abilities: ["чіпляється до істот", "виснажує їх"],
  },
});

/* monsters/klop-parasolya.js */
Atlas.registerMonster({
  format: 2,
  id: "klop-parasolya",
  name: "Клоп-Парасоля",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["grass"], worlds: "all" },
  order: 811,
  lore: {
    description: "Пласка комаха з шістьма шарнірними ногами та панциром, що складається в круглу парасолю.",
    behavior: "Ховається на великих соняшникових полях.",
    abilities: ["під час небезпеки перевертає панцир і відбиває сонячне світло в очі нападнику"],
  },
});

/* monsters/klynodzobyy-padalnyk.js */
Atlas.registerMonster({
  format: 2,
  id: "klynodzobyy-padalnyk",
  name: "Клинодзьобий падальник",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["grass", "wasteland", "ashlands"], worlds: "all" },
  order: 510,
  lore: {
    description: "Великий птах із дзьобом у формі кам’яного клина.",
    behavior: "Бойові поля давніх королівств.",
    abilities: ["розколює броню точними ударами"],
  },
});

/* monsters/klynolobyy-mokhar.js */
Atlas.registerMonster({
  format: 2,
  id: "klynolobyy-mokhar",
  name: "Клинолобий Мохар",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills", "grass"], worlds: "all" },
  order: 863,
  lore: {
    description: "Масивний травоїдний звір із головою у формі кам'яного клина та спиною, вкритою товстим зеленим мохом.",
    behavior: "Пасеться в затінених кам'яних садах.",
    abilities: ["пробиває зарості головою, відкриваючи нові проходи, а під час небезпеки вклинюється між скелями й стає майже невразливим"],
  },
});

/* monsters/klyuchokist.js */
Atlas.registerMonster({
  format: 2,
  id: "klyuchokist",
  name: "Ключокіст",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 770,
  lore: {
    description: "Довгонога істота з ребрами у формі замків і хребтом, уздовж якого ростуть зубчасті ключі.",
    behavior: "Мешкає в закинутому арсеналі фортеці.",
    abilities: ["замикає дотиком двері, брами й навіть рухомі частини обладунків, тимчасово блокуючи певні дії супротивника"],
  },
});

/* monsters/knyaz-mokhovykh-rohiv.js */
Atlas.registerMonster({
  format: 2,
  id: "knyaz-mokhovykh-rohiv",
  name: "Князь мохових рогів",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga", "mountain", "hills"], worlds: "all" },
  order: 487,
  lore: {
    description: "Лось із розгалуженими зеленими рогами, що вкриті світними спорами.",
    behavior: "Мохові урвища.",
    abilities: ["вирощує пастки з моху та відновлюється в тіні"],
  },
});

/* monsters/knyaz-rozbytoyi-materiyi.js */
Atlas.registerMonster({
  format: 2,
  id: "knyaz-rozbytoyi-materiyi",
  name: "Князь розбитої матерії",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["desert"], worlds: "all" },
  order: 458,
  lore: {
    description: "Багатогранний титан із плаваючих уламків.",
    behavior: "Пустеля уламкових монолітів.",
    abilities: ["розділяє своє тіло на небезпечні фрагменти, які атакують окремо, а потім зливаються знову"],
  },
});

/* monsters/knyaz-roztroshchenykh-pir-roku.js */
Atlas.registerMonster({
  format: 2,
  id: "knyaz-roztroshchenykh-pir-roku",
  name: "Князь Розтрощених Пір року",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["grass", "hills"], worlds: "all" },
  order: 842,
  lore: {
    description: "Чотириголовий звір із тулубом у формі кубічного дерева, на кожній стороні якого панує інша пора року.",
    behavior: "Мешкає в саду, де чотири сезони існують одночасно.",
    abilities: ["перемикає сезонні зони на полі бою, миттєво змінюючи властивості землі, рослин і снарядів"],
  },
});

/* monsters/knyaz-solyanykh-sadiv.js */
Atlas.registerMonster({
  format: 2,
  id: "knyaz-solyanykh-sadiv",
  name: "Князь Соляних Садів",
  kind: "super-boss",
  nature: "magic",
  variants: ["князь Соляних Садів", "князь соляних уламків"],
  spawn: { biomes: ["desert"], worlds: "all" },
  order: 471,
  lore: {
    description: "Гуманоїдний володар із тілами-кристалами солі, короною з висохлих квітів і довгим плащем із кірки. Об'єднує схожих істот: князь Соляних Садів, князь соляних уламків.",
    behavior: "Править Білими Соляними садами. Білі соляні бастіони.",
    abilities: ["князь Соляних Садів: вирощує соляні лілеї, які миттєво витягують вологу з калюж та перетворюють землю на крихку кірку", "князь соляних уламків: засипає арену соляними бурями, що поступово висушують і сповільнюють"],
  },
});

/* monsters/knyzhkovyy-shchypach.js */
Atlas.registerMonster({
  format: 2,
  id: "knyzhkovyy-shchypach",
  name: "Книжковий щипач",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills", "grass"], worlds: "all" },
  order: 584,
  lore: {
    description: "Маленька істота з паперовими крилами й довгим дзьобом.",
    behavior: "Покинуті бібліотеки.",
    abilities: ["ріже сторінки, а паперові клапті кружляють навколо як леза"],
  },
});

/* monsters/kobold-shakhtar-vbyvtsya.js */
Atlas.registerMonster({
  format: 2,
  id: "kobold-shakhtar-vbyvtsya",
  name: "Кобольд-шахтар-вбивця",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 331,
  lore: {
    description: "Елітний гуманоїд.",
    behavior: "Зустрічається: шахти.",
    abilities: ["кирка", "пастки", "засипання тунелів"],
  },
});

/* monsters/koboldy.js */
Atlas.registerMonster({
  format: 1,
  id: "koboldy",
  name: "кобольди",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["hills", "mountain", "peaks"], worlds: "all" },
  order: 1,
});

/* monsters/kokatrysy.js */
Atlas.registerMonster({
  format: 1,
  id: "kokatrysy",
  name: "кокатриси",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["hills", "mountain", "peaks"], worlds: "all" },
  order: 14,
});

/* monsters/kolo-pravdopodibnosti.js */
Atlas.registerMonster({
  "format": 2,
  "id": "kolo-pravdopodibnosti",
  "name": "Коло ймовірності",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "tag:surreal"
    ],
    "worlds": "all"
  },
  "order": 996,
  "lore": {
    "description": "Велетенське колесо з тисячею рамок, що показують різні можливості.",
    "behavior": "Крутиться над площею, і правила змінюються щоразу.",
    "abilities": [
      "крутить правила бою",
      "клони з різних можливостей",
      "стирає одну можливість"
    ],
    "drops": [
      "колесо ймовірності",
      "рамка можливості"
    ]
  }
});

/* monsters/kolos-polyusiv.js */
Atlas.registerMonster({
  "format": 2,
  "id": "kolos-polyusiv",
  "name": "Колос Полюсів",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "zalizni-pusteli",
      "mahnitni-stovpy",
      "kobaltovi-dzhunhli",
      "nebesni-rudnyky",
      "polyarni-kratery"
    ],
    "worlds": [
      "ferroks"
    ]
  },
  "order": 738,
  "lore": {
    "description": "Колос Полюсів перевертає магнітні поля."
  }
});

/* monsters/kolos-rozkolotoho-neba.js */
Atlas.registerMonster({
  format: 2,
  id: "kolos-rozkolotoho-neba",
  name: "Колос розколотого неба",
  kind: "world-boss",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 255,
  lore: {
    description: "Кам'яний титан.",
    behavior: "Зустрічається: гірські плато та місця падіння метеоритів.",
    abilities: ["кидає уламки скель", "відкриває просторові розломи", "викликає метеоритні дощі"],
  },
});

/* monsters/kolyuchi-harbuzovi-holemy.js */
Atlas.registerMonster({
  "format": 2,
  "id": "kolyuchi-harbuzovi-holemy",
  "name": "Колючі гарбузові големи",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "yablunevi-terasy",
      "fioletovi-hrushevi-hayi",
      "hirki-korenevi-polya",
      "zoloti-sady",
      "harbuzovi-rivnyny",
      "kukurudzyani-labirynty",
      "buryakovi-yary",
      "zoloti-teplytsi"
    ],
    "worlds": [
      "orchardum"
    ]
  },
  "order": 799,
  "lore": {
    "description": "Загроза світу «Орчардум»."
  }
});

/* monsters/kolyuchi-khyzhaky.js */
Atlas.registerMonster({
  "format": 2,
  "id": "kolyuchi-khyzhaky",
  "name": "Колючі хижаки",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "kolyuchi-polya",
      "liany-staroho-mista",
      "korenevi-yary",
      "sukhi-shypasti-stepy"
    ],
    "worlds": [
      "ternaviya"
    ]
  },
  "order": 808,
  "lore": {
    "description": "Загроза світу «Тернавія»."
  }
});

/* monsters/kolyuchyy-kylymar.js */
Atlas.registerMonster({
  format: 2,
  id: "kolyuchyy-kylymar",
  name: "Колючий килимар",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["grass", "lake"], worlds: "all" },
  order: 540,
  lore: {
    description: "Плаский багатоногий монстр, укритий м’якими на вигляд шипами.",
    behavior: "Трав’яні низини.",
    abilities: ["притискається до землі й раптово розкриває колючі пластини"],
  },
});

/* monsters/kolyuchyy-morskyy-konyk.js */
Atlas.registerMonster({
  format: 2,
  id: "kolyuchyy-morskyy-konyk",
  name: "Колючий морський коник",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["sea"], worlds: "all" },
  order: 432,
  lore: {
    description: "Магічна риба.",
    behavior: "Зустрічається: зарості водоростей.",
    abilities: ["таран головою", "водяні голки"],
  },
});

/* monsters/kolyuchyy-nasinnyeyid.js */
Atlas.registerMonster({
  format: 2,
  id: "kolyuchyy-nasinnyeyid",
  name: "Колючий насіннєїд",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga", "grass"], worlds: "all" },
  order: 660,
  lore: {
    description: "Маленький жук, що носить насіння на спині.",
    behavior: "Квітчасті поля.",
    abilities: ["стріляє ним у ворога, а на місці влучання виростають короткі колючки"],
  },
});

/* monsters/kolyuchyy-pukhokhid.js */
Atlas.registerMonster({
  format: 2,
  id: "kolyuchyy-pukhokhid",
  name: "Колючий пухохід",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["forest"], worlds: "all" },
  order: 638,
  lore: {
    description: "Малий звір із пухнастим тілом і голчастим хвостом.",
    behavior: "Сухі чагарники.",
    abilities: ["розпушується й перекриває вузькі проходи"],
  },
});

/* monsters/kolyuchyy-skat.js */
Atlas.registerMonster({
  format: 2,
  id: "kolyuchyy-skat",
  name: "Колючий скат",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 415,
  lore: {
    description: "Морська істота.",
    behavior: "Зустрічається: морське дно.",
    abilities: ["удар шипастим хвостом", "короткі електричні розряди"],
  },
});

/* monsters/kolyuchyy-strybunchyk.js */
Atlas.registerMonster({
  format: 2,
  id: "kolyuchyy-strybunchyk",
  name: "Колючий стрибунчик",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["grass", "hills"], worlds: "all" },
  order: 606,
  lore: {
    description: "Дрібний звір із голчастими лапами.",
    behavior: "Сухі луки.",
    abilities: ["відскакує після кожної атаки, залишаючи шипи на землі"],
  },
});

/* monsters/koptylnyy-pryvyd.js */
Atlas.registerMonster({
  format: 2,
  id: "koptylnyy-pryvyd",
  name: "Коптильний привид",
  kind: "other",
  nature: "magic",
  spawn: { biomes: ["grass", "hills"], worlds: "all" },
  order: 571,
  lore: {
    description: "Темна постать, що нагадує стовп диму.",
    behavior: "Старі кухні та печі.",
    abilities: ["прослизає крізь ґрати й залишає за собою задушливий слід"],
  },
});

/* monsters/koralovyy-klishch.js */
Atlas.registerMonster({
  format: 2,
  id: "koralovyy-klishch",
  name: "Кораловий кліщ",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 674,
  lore: {
    description: "Дрібний морський членистоногий із рожевим панциром.",
    behavior: "Прибережні рифи.",
    abilities: ["кріпиться до каменів і випускає короткі колючі нитки"],
  },
});

/* monsters/koralozubyy-vuhor.js */
Atlas.registerMonster({
  format: 2,
  id: "koralozubyy-vuhor",
  name: "Коралозубий вугор",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 684,
  lore: {
    description: "Довга риба із зубами, схожими на дрібні коралові гілки.",
    behavior: "Рифові тунелі.",
    abilities: ["ховається в тріщинах і атакує короткими ривками"],
  },
});

/* monsters/korenevi-khyzhaky.js */
Atlas.registerMonster({
  "format": 2,
  "id": "korenevi-khyzhaky",
  "name": "Кореневі хижаки",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "midni-krony",
      "sklyani-ustupy",
      "korenevi-bezodni",
      "burshtynovi-plato",
      "pylovi-arkhipelahy"
    ],
    "worlds": [
      "velarium"
    ]
  },
  "order": 700,
  "lore": {
    "description": "Загроза світу «Веларіум»."
  }
});

/* monsters/korenevi-okhorontsi.js */
Atlas.registerMonster({
  "format": 2,
  "id": "korenevi-okhorontsi",
  "name": "Кореневі охоронці",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "yablunevi-terasy",
      "fioletovi-hrushevi-hayi",
      "hirki-korenevi-polya",
      "zoloti-sady",
      "harbuzovi-rivnyny",
      "kukurudzyani-labirynty",
      "buryakovi-yary",
      "zoloti-teplytsi"
    ],
    "worlds": [
      "orchardum"
    ]
  },
  "order": 797,
  "lore": {
    "description": "Загроза світу «Орчардум»."
  }
});

/* monsters/korenevi-vartovi.js */
Atlas.registerMonster({
  "format": 2,
  "id": "korenevi-vartovi",
  "name": "Кореневі вартові",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "soborni-dibrovy",
      "korenevi-katakomby",
      "kvitkovi-terasy",
      "sporovi-dolyny",
      "sklyani-pelyustkovi-hory"
    ],
    "worlds": [
      "illariya"
    ]
  },
  "order": 739,
  "lore": {
    "description": "Загроза світу «Ілларія»."
  }
});

/* monsters/korenevyi-lastivets.js */
Atlas.registerMonster({
  "format": 2,
  "id": "korenevyi-lastivets",
  "name": "Кореневий ластівець",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "tag:cloud"
    ],
    "worlds": "all"
  },
  "order": 937,
  "lore": {
    "description": "Швидкий птах із бурштиновим дзьобом і кроною-гребенем із живого коріння.",
    "behavior": "Гніздиться на звислому корені й обстрілює чужинців насінням.",
    "abilities": [
      "пікірує на сильних вітрах",
      "випльовує смолисте насіння, що склеює ноги"
    ],
    "drops": [
      "бурштинова смола",
      "кореневе пір'я"
    ]
  }
});

/* monsters/korenevyy-chervyak.js */
Atlas.registerMonster({
  format: 2,
  id: "korenevyy-chervyak",
  name: "Кореневий черв’як",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga", "grass"], worlds: "all" },
  order: 405,
  lore: {
    description: "Підземна істота.",
    behavior: "Зустрічається: ліси, поля.",
    abilities: ["розриває ґрунт", "підкидає землю"],
  },
});

/* monsters/korenevyy-dushytel.js */
Atlas.registerMonster({
  format: 2,
  id: "korenevyy-dushytel",
  name: "Кореневий душитель",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga"], worlds: "all" },
  order: 322,
  lore: {
    description: "Рослинне чудовисько.",
    behavior: "Зустрічається: темні хащі.",
    abilities: ["хапає корінням", "створює колючі зарості"],
  },
});

/* monsters/korenevyy-hrebenyar.js */
Atlas.registerMonster({
  format: 2,
  id: "korenevyy-hrebenyar",
  name: "Кореневий Гребеняр",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga", "mountain", "hills"], worlds: "all" },
  order: 879,
  lore: {
    description: "Низька істота з дерев'яним панциром, широкою спиною та рядами кореневих зубців.",
    behavior: "Мешкає у старих садах, де коріння підняло кам'яні доріжки.",
    abilities: ["заривається в ґрунт, залишаючи над поверхнею рухомий гребінь, який збиває гравця з ніг"],
  },
});

/* monsters/korenevyy-pidkopuvach.js */
Atlas.registerMonster({
  format: 2,
  id: "korenevyy-pidkopuvach",
  name: "Кореневий підкопувач",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga", "grass", "hills"], worlds: "all" },
  order: 553,
  lore: {
    description: "Істота з коренями замість лап.",
    behavior: "Старі сади.",
    abilities: ["з’являється з-під ґрунту, хапає предмети й тікає в нори"],
  },
});

/* monsters/korol-bez-korony.js */
Atlas.registerMonster({
  "format": 2,
  "id": "korol-bez-korony",
  "name": "Король без корони",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "tag:ruins",
      "tag:bones",
      "tag:dead"
    ],
    "worlds": "all"
  },
  "order": 976,
  "lore": {
    "description": "Гігантський скелет у розбитих латах, на голові — порожнє коло.",
    "behavior": "Ходить залом зруйнованого палацу й шукає свою корону.",
    "abilities": [
      "командує мертвою вартою",
      "розколює підлогу",
      "пророчий погляд знімає захист"
    ],
    "drops": [
      "розбита корона",
      "королівський меч"
    ]
  },
  "variants": [
    "темний король",
    "білий король"
  ]
});

/* monsters/korol-bezodni.js */
Atlas.registerMonster({
  format: 2,
  id: "korol-bezodni",
  name: "Король безодні",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 259,
  lore: {
    description: "Морський демон.",
    behavior: "Зустрічається: затонулий тронний комплекс.",
    abilities: ["водяні списи", "темні хвилі", "призов морських чудовиськ"],
  },
});

/* monsters/korol-chornoyi-hushchavyny.js */
Atlas.registerMonster({
  "format": 2,
  "id": "korol-chornoyi-hushchavyny",
  "name": "Король Чорної Гущавини",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "blakytnyy-pidlisok",
      "burshtynovi-halyavyny",
      "chervoni-korenevi-yary",
      "sribni-dibrovy",
      "chorni-dibrovy",
      "syniy-mokh",
      "lilovi-bolota",
      "zabuti-svitli-halyavyny"
    ],
    "worlds": [
      "lyumenvild"
    ]
  },
  "order": 794,
  "lore": {
    "description": "Бос світу «Люменвільд»."
  }
});

/* monsters/korol-hlynyanykh-holemiv.js */
Atlas.registerMonster({
  format: 2,
  id: "korol-hlynyanykh-holemiv",
  name: "Король глиняних големів",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 290,
  lore: {
    description: "Земляний конструкт.",
    behavior: "Зустрічається: старі глиняні храми.",
    abilities: ["розділяється на менших големів", "поглинає каміння", "створює стіни"],
  },
});

/* monsters/korol-hobliniv.js */
Atlas.registerMonster({
  format: 1,
  id: "korol-hobliniv",
  name: "Король Гоблінів",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["hills", "mountain", "peaks"], worlds: "all" },
  order: 61,
});

/* monsters/korol-irzhavoho-korinnya.js */
Atlas.registerMonster({
  "format": 2,
  "id": "korol-irzhavoho-korinnya",
  "name": "Король Іржавого Коріння",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "irzhavi-dibrovy",
      "chervoni-karyery",
      "zalizni-luky",
      "chorni-kuzni"
    ],
    "worlds": [
      "rzhavar"
    ]
  },
  "order": 841,
  "lore": {
    "description": "Бос світу «Ржавар»."
  }
});

/* monsters/korol-lych-pustky.js */
Atlas.registerMonster({
  format: 1,
  id: "korol-lych-pustky",
  name: "Король-Лич Пустки",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "ashlands"], worlds: "all" },
  order: 109,
});

/* monsters/korol-mertvoho-sontsya.js */
Atlas.registerMonster({
  format: 2,
  id: "korol-mertvoho-sontsya",
  name: "Король мертвого сонця",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["desert"], worlds: "all" },
  order: 245,
  lore: {
    description: "Неживий велетень.",
    behavior: "Зустрічається: чорна пустеля, стародавня столиця мертвих.",
    abilities: ["темрява", "випалювання землі", "виклик скелетних армій"],
  },
});

/* monsters/korol-ohriv.js */
Atlas.registerMonster({
  format: 1,
  id: "korol-ohriv",
  name: "Король Огрів",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["hills", "mountain", "peaks"], worlds: "all" },
  order: 53,
});

/* monsters/korol-perevernutykh-hir.js */
Atlas.registerMonster({
  format: 2,
  id: "korol-perevernutykh-hir",
  name: "Король перевернутих гір",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills", "sea"], worlds: "all" },
  order: 453,
  lore: {
    description: "Істота з кам’яних шпилів, що ростуть догори ногами.",
    behavior: "Архіпелаг летючих гір.",
    abilities: ["змушує скелі злітати в небо й падати на арену"],
  },
});

/* monsters/korol-pohasloho-promenya.js */
Atlas.registerMonster({
  "format": 2,
  "id": "korol-pohasloho-promenya",
  "name": "Король Погаслого Променя",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "burshtynovi-promeni",
      "sady-pryzmatychnykh-derev",
      "tinovi-yary",
      "zoloti-pustky",
      "sklyani-nebesni-luhy"
    ],
    "worlds": [
      "aurelit"
    ]
  },
  "order": 727,
  "lore": {
    "description": "Бос світу «Ауреліт»."
  }
});

/* monsters/korol-porozhnikh-vulykiv.js */
Atlas.registerMonster({
  format: 2,
  id: "korol-porozhnikh-vulykiv",
  name: "Король Порожніх Вуликів",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills", "mountain"], worlds: "all" },
  order: 749,
  lore: {
    description: "Шестигранний монарх із тілом, складеним із велетенських порожніх стільників, і шістьма масками замість облич.",
    behavior: "Править покинутими пасіками Крейдяних Круч.",
    abilities: ["налаштовує комірки на різні звукові частоти, руйнуючи заклинання та дезорієнтуючи ворогів резонансом"],
  },
});

/* monsters/korol-zipsovanoho-urozhayu.js */
Atlas.registerMonster({
  "format": 2,
  "id": "korol-zipsovanoho-urozhayu",
  "name": "Король Зіпсованого Урожаю",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "yablunevi-terasy",
      "fioletovi-hrushevi-hayi",
      "hirki-korenevi-polya",
      "zoloti-sady",
      "harbuzovi-rivnyny",
      "kukurudzyani-labirynty",
      "buryakovi-yary",
      "zoloti-teplytsi"
    ],
    "worlds": [
      "orchardum"
    ]
  },
  "order": 801,
  "lore": {
    "description": "Бос світу «Орчардум»."
  }
});

/* monsters/koroleva-demoniv-koreniv.js */
Atlas.registerMonster({
  format: 2,
  id: "koroleva-demoniv-koreniv",
  name: "Королева демонів-коренів",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["forest", "enchanted"], worlds: "all" },
  order: 267,
  lore: {
    description: "Рослинний демон.",
    behavior: "Зустрічається: проклятий праліс.",
    abilities: ["заражає землю", "хапає корінням", "вирощує хижі квіти"],
  },
});

/* monsters/koroleva-kamyanykh-harpiy.js */
Atlas.registerMonster({
  format: 2,
  id: "koroleva-kamyanykh-harpiy",
  name: "Королева кам’яних гарпій",
  kind: "boss",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 295,
  lore: {
    description: "Крилата істота.",
    behavior: "Зустрічається: гірські гнізда.",
    abilities: ["кам’яні пір’я", "повітряні вихори", "крик", "що дезорієнтує"],
  },
});

/* monsters/koroleva-krystalichnoho-royu.js */
Atlas.registerMonster({
  format: 2,
  id: "koroleva-krystalichnoho-royu",
  name: "Королева кристалічного рою",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["crystal", "desert", "wasteland", "hills"], worlds: "all" },
  order: 253,
  lore: {
    description: "Кристалічна матка.",
    behavior: "Зустрічається: кришталеві пустки, підземні геоди.",
    abilities: ["створює нескінченні хвилі кристалічних істот", "відрощує броню"],
  },
});

/* monsters/koroleva-popelu.js */
Atlas.registerMonster({
  format: 1,
  id: "koroleva-popelu",
  name: "Королева Попелу",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "ashlands", "volcanic"], worlds: "all" },
  order: 104,
});

/* monsters/koroliva-vitriv.js */
Atlas.registerMonster({
  "format": 2,
  "id": "koroliva-vitriv",
  "name": "Королева вітрів",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "tag:cloud"
    ],
    "worlds": "all"
  },
  "order": 939,
  "lore": {
    "description": "Велетенська орлиця зі склепінням із кам'яних кілець замість корони.",
    "behavior": "Кружляє над кільцевими островами й керує грозами.",
    "abilities": [
      "викликає смерчі навколо арени",
      "скидає на героїв кам'яні кільця",
      "блискавка з ясного неба"
    ],
    "drops": [
      "корона-кільце",
      "грозове перо"
    ]
  },
  "variants": [
    "королева бур",
    "повітряна владарка"
  ]
});

/* monsters/korona-hrozovykh-dzvoniv.js */
Atlas.registerMonster({
  format: 2,
  id: "korona-hrozovykh-dzvoniv",
  name: "Корона Грозових Дзвонів",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 836,
  lore: {
    description: "Колосальний літаючий звір без голови, тіло якого утворюють дев'ять бронзових дзвонів, з'єднаних блискавичними ланцюгами.",
    behavior: "Мешкає над гірськими плато під час вічних гроз.",
    abilities: ["кожен удар створює хвилю, що руйнує споруди й змінює напрямок вітру"],
  },
});

/* monsters/korona-zemletrus.js */
Atlas.registerMonster({
  format: 2,
  id: "korona-zemletrus",
  name: "Корона-Землетрус",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills", "grass"], worlds: "all" },
  order: 737,
  lore: {
    description: "Велетенська шестинога гора з базальтовими терасами, моховими садами й кам’яною короною.",
    behavior: "Блукає давніми королівськими трактами й кам’яними рівнинами.",
    abilities: ["кожен крок зсуває пагорби, розколює землю та змінює рельєф арени"],
  },
});

/* monsters/korovyi-vovk.js */
Atlas.registerMonster({
  "format": 2,
  "id": "korovyi-vovk",
  "name": "Корововий вовк",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "tag:forest",
      "tag:canopy"
    ],
    "worlds": "all"
  },
  "order": 946,
  "lore": {
    "description": "Вовк із корою замість шерсті й гіллястими рогами.",
    "behavior": "Полює зграєю на чужинців, що вторглися в чагарі.",
    "abilities": [
      "завиває, і ліс збирає хижаків",
      "кора поглинає перший удар"
    ],
    "drops": [
      "вовча кора",
      "ріг-гілка"
    ]
  }
});

/* monsters/kotushka-pavuk.js */
Atlas.registerMonster({
  format: 2,
  id: "kotushka-pavuk",
  name: "Котушка-павук",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga", "wasteland", "hills"], worlds: "all" },
  order: 648,
  lore: {
    description: "Павук із круглим тілом, схожим на клубок ниток.",
    behavior: "Дерев’яні руїни.",
    abilities: ["згортається й котиться до здобичі, обмотуючи її липкою павутиною"],
  },
});

/* monsters/koval-nebesnoho-poyasu.js */
Atlas.registerMonster({
  "format": 2,
  "id": "koval-nebesnoho-poyasu",
  "name": "Коваль Небесного Поясу",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "meteorni-rivnyny",
      "chorni-kratery",
      "sklyani-polya",
      "stari-udarni-hory",
      "midni-dolyny",
      "irzhavi-lisy",
      "sribni-plato",
      "kraterni-bolota"
    ],
    "worlds": [
      "asterfell"
    ]
  },
  "order": 807,
  "lore": {
    "description": "Бос світу «Астерфелл»."
  }
});

/* monsters/koval-porozhnikh-hromiv.js */
Atlas.registerMonster({
  format: 2,
  id: "koval-porozhnikh-hromiv",
  name: "Коваль Порожніх Громів",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills", "peaks", "volcanic"], worlds: "all" },
  order: 850,
  lore: {
    description: "Широкоплечий гуманоїд із темного заліза, у грудях якого обертається порожнє колесо.",
    behavior: "Мешкає в кузні на скелі, що зависла серед грозових хмар.",
    abilities: ["кує блискавки ударами молота об власні ребра, а відкинуті громові згустки залишають на землі заряджені металеві уламки"],
  },
});

/* monsters/koval-porozhnoho-neba.js */
Atlas.registerMonster({
  format: 2,
  id: "koval-porozhnoho-neba",
  name: "Коваль порожнього неба",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["peaks", "volcanic", "ashlands"], worlds: "all" },
  order: 451,
  lore: {
    description: "Шестирукий титан із розпечених мінералів.",
    behavior: "Небесна кузня над хмарами.",
    abilities: ["б’є по повітрю невидимим молотом, створюючи тріщини у просторі"],
  },
});

/* monsters/koval-sporysh.js */
Atlas.registerMonster({
  format: 2,
  id: "koval-sporysh",
  name: "Коваль-Спориш",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["volcanic", "ashlands"], worlds: "all" },
  order: 793,
  lore: {
    description: "Невеликий гуманоїд із трав’яним тілом, насіннєвою головою та важким молотом із кореня.",
    behavior: "Мешкає в зарослих кузнях.",
    abilities: ["під час сутички підправляє обладунок сусідніх істот, зміцнюючи їхні пошкоджені пластини, доки його не відігнати"],
  },
});

/* monsters/kovalski-holemy.js */
Atlas.registerMonster({
  "format": 2,
  "id": "kovalski-holemy",
  "name": "Ковальські големи",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "bazaltovi-kuzni",
      "obsydianovi-lisy",
      "popelyasti-terasy",
      "mahmovi-riky",
      "kryshtalevi-horny"
    ],
    "worlds": [
      "embergard"
    ]
  },
  "order": 761,
  "lore": {
    "description": "Загроза світу «Емберґард»."
  }
});

/* monsters/kovzun-iz-chornoho-lodu.js */
Atlas.registerMonster({
  format: 2,
  id: "kovzun-iz-chornoho-lodu",
  name: "Ковзун із чорного льоду",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["peaks", "snow"], worlds: "all" },
  order: 525,
  lore: {
    description: "Плоский хижак, що пересувається без ніг.",
    behavior: "Темні льодовики.",
    abilities: ["створює під собою крижану доріжку й різко змінює напрямок"],
  },
});

/* monsters/kozorih-dzvinkykh-skel.js */
Atlas.registerMonster({
  format: 2,
  id: "kozorih-dzvinkykh-skel",
  name: "Козоріг Дзвінких Скель",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 860,
  lore: {
    description: "Стрункий гірський звір із квадратними рогами, схожими на порожнисті кам'яні труби.",
    behavior: "Мешкає на вузьких карнизах базальтових гір.",
    abilities: ["під час стрибків видає різкий тон, який збиває приціл і змушує дрібні камені падати зі стін"],
  },
});

/* monsters/krab-dzvonolom.js */
Atlas.registerMonster({
  format: 2,
  id: "krab-dzvonolom",
  name: "Краб-дзвонолом",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills", "sea"], worlds: "all" },
  order: 485,
  lore: {
    description: "Величезний краб із панциром, схожим на старовинну дзвіницю.",
    behavior: "Узбережжя чорних скель.",
    abilities: ["розбиває скелі клешнями й створює оглушливі звукові хвилі"],
  },
});

/* monsters/krab-holiaf.js */
Atlas.registerMonster({
  format: 1,
  id: "krab-holiaf",
  name: "Краб-Голіаф",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["deep"], worlds: "all" },
  order: 98,
});

/* monsters/krab-reshitnyk.js */
Atlas.registerMonster({
  format: 2,
  id: "krab-reshitnyk",
  name: "Краб-решітник",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 706,
  lore: {
    description: "Краб із пласким панциром, прорізаним отворами.",
    behavior: "Рифові лабіринти.",
    abilities: ["ховається серед кам’яних сіток і затискає предмети клешнями"],
  },
});

/* monsters/krab-voyin.js */
Atlas.registerMonster({
  format: 2,
  id: "krab-voyin",
  name: "Краб-воїн",
  kind: "monster",
  nature: "magic",
  variants: ["морський краб-воїн", "краб-кам’янонос"],
  spawn: { biomes: ["deep", "sea", "mountain", "hills"], worlds: "all" },
  order: 417,
  lore: {
    description: "Членистоноге. Об'єднує схожих істот: морський краб-воїн, краб-кам’янонос.",
    behavior: "Зустрічається: пляжі, рифи; скелясті узбережжя.",
    abilities: ["клешні", "міцний панцир", "кидає каміння", "маскується під валуни"],
  },
});

/* monsters/kraby-ruynivnyky.js */
Atlas.registerMonster({
  "format": 2,
  "id": "kraby-ruynivnyky",
  "name": "Краби-руйнівники",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "milkovodni-sady",
      "chorni-pryplyvni-skeli",
      "koralovi-uzberezhzhya",
      "soloni-zaplavy"
    ],
    "worlds": [
      "talmoriya"
    ]
  },
  "order": 784,
  "lore": {
    "description": "Загроза світу «Талморія»."
  }
});

/* monsters/kradiy-tiney.js */
Atlas.registerMonster({
  format: 2,
  id: "kradiy-tiney",
  name: "Крадій тіней",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga"], worlds: "all" },
  order: 499,
  lore: {
    description: "Чотиринога істота без власної тіні.",
    behavior: "Ліс із чорними стовбурами.",
    abilities: ["відділяє тінь гравця, змушуючи її атакувати свого власника"],
  },
});

/* monsters/kradiy-vohnykiv.js */
Atlas.registerMonster({
  format: 2,
  id: "kradiy-vohnykiv",
  name: "Крадій вогників",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["wasteland", "hills", "mountain"], worlds: "all" },
  order: 511,
  lore: {
    description: "Маленький летючий звір із довгими пальцями.",
    behavior: "Підземні лабіринти.",
    abilities: ["викрадає світло факелів і переносить його в темні куточки печер"],
  },
});

/* monsters/kraken-chornykh-techiy.js */
Atlas.registerMonster({
  format: 2,
  id: "kraken-chornykh-techiy",
  name: "Кракен чорних течій",
  kind: "super-boss",
  nature: "threat",
  spawn: { biomes: ["deep"], worlds: "all" },
  order: 270,
  lore: {
    description: "Морський гігант.",
    behavior: "Зустрічається: темні океанічні жолоби.",
    abilities: ["щупальця", "водяні вирви", "затоплення арени"],
  },
});

/* monsters/kraken.js */
Atlas.registerMonster({
  format: 1,
  id: "kraken",
  name: "Кракен",
  kind: "boss",
  nature: "threat",
  spawn: { biomes: ["deep"], worlds: "all" },
  order: 80,
});

/* monsters/krapchastyy-kylymovyy-pavuk.js */
Atlas.registerMonster({
  format: 2,
  id: "krapchastyy-kylymovyy-pavuk",
  name: "Крапчастий килимовий павук",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["grass", "hills"], worlds: "all" },
  order: 652,
  lore: {
    description: "Плаский павук із візерунком, схожим на підлогову плитку.",
    behavior: "Старі двори.",
    abilities: ["маскується на кам’яних доріжках і хапає за щиколотки"],
  },
});

/* monsters/krapchastyy-pruzhnyk.js */
Atlas.registerMonster({
  format: 2,
  id: "krapchastyy-pruzhnyk",
  name: "Крапчастий пружник",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills", "wasteland"], worlds: "all" },
  order: 601,
  lore: {
    description: "Маленький звір із круглими плямами на спині.",
    behavior: "Кам’яні лабіринти.",
    abilities: ["стискає тіло й відскакує від стін у випадкових напрямках"],
  },
});

/* monsters/krapelnyk.js */
Atlas.registerMonster({
  format: 2,
  id: "krapelnyk",
  name: "Крапельник",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 822,
  lore: {
    description: "Водяна істота з глиняним ядром, навколо якого зависають три десятки окремих крапель.",
    behavior: "Мешкає у затоплених акведуках.",
    abilities: ["підстрибує до стелі, розсипає краплі зверху й відновлює тіло в дощі"],
  },
});

/* monsters/krapelnyy-pyskun.js */
Atlas.registerMonster({
  format: 2,
  id: "krapelnyy-pyskun",
  name: "Крапельний Пискун",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 931,
  lore: {
    description: "Крихітна синя істота з водяного желе, що має три очі й довгий хвостик.",
    behavior: "Мешкає біля підземних джерел.",
    abilities: ["залишає маленькі калюжі, які відтворюють останній звук, почутий поблизу, вводячи гравця в оману"],
  },
});

/* monsters/krapelnyy-sklyar.js */
Atlas.registerMonster({
  format: 2,
  id: "krapelnyy-sklyar",
  name: "Крапельний Скляр",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 914,
  lore: {
    description: "Крихітна істота з прозорого скла, що має квадратне черевце й тонкі пальці.",
    behavior: "Мешкає в оранжереях з розбитими дахами.",
    abilities: ["збирає краплі води на поверхнях і перетворює їх на маленькі скляні кульки, якими жбурляється в гравця"],
  },
});

/* monsters/krapelnyy-zhuchok.js */
Atlas.registerMonster({
  format: 2,
  id: "krapelnyy-zhuchok",
  name: "Крапельний жучок",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 724,
  lore: {
    description: "Маленький комахоподібний монстр із блискучим панциром.",
    behavior: "Джерела та струмки.",
    abilities: ["скидає краплю води, що відскакує від каменів"],
  },
});

/* monsters/kraplelusk.js */
Atlas.registerMonster({
  format: 2,
  id: "kraplelusk",
  name: "Краплелуск",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills", "grass"], worlds: "all" },
  order: 832,
  lore: {
    description: "Крихітна рибка з прозорими краплеподібними лусками та широким ротом.",
    behavior: "Живе в дощових садах і біля кам’яних фонтанів.",
    abilities: ["стрибає між калюжами, збираючи з води відображення предметів, які потім видно на її боках"],
  },
});

/* monsters/kraplynnyy-dzvonar.js */
Atlas.registerMonster({
  format: 2,
  id: "kraplynnyy-dzvonar",
  name: "Краплинний Дзвонар",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 874,
  lore: {
    description: "Прозора істота, що складається з десятків великих водяних крапель, з'єднаних тонкими струменями.",
    behavior: "Мешкає під стелями печер із підземними водоспадами.",
    abilities: ["розбивається на окремі краплі, ухиляючись від ударів, а потім знову збирається з іншого боку"],
  },
});

/* monsters/kraplynnyy-khovach.js */
Atlas.registerMonster({
  format: 2,
  id: "kraplynnyy-khovach",
  name: "Краплинний ховач",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 585,
  lore: {
    description: "Напівпрозорий водяний звір, що ховається в калюжах.",
    behavior: "Дощові низини.",
    abilities: ["стрибає в обличчя та тимчасово погіршує видимість"],
  },
});

/* monsters/kremyanyy-zhvavchyk.js */
Atlas.registerMonster({
  format: 2,
  id: "kremyanyy-zhvavchyk",
  name: "Крем’яний жвавчик",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills", "grass"], worlds: "all" },
  order: 591,
  lore: {
    description: "Невелика істота з гострими крем’яними пластинами.",
    behavior: "Сухі кам’яні долини.",
    abilities: ["вдаряє лапами об землю, породжуючи іскри"],
  },
});

/* monsters/kreydyanyy-bihun.js */
Atlas.registerMonster({
  format: 2,
  id: "kreydyanyy-bihun",
  name: "Крейдяний Бігун",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 794,
  lore: {
    description: "Пласка бліда чотиринога істота з шаруватими крейдяними пластинами.",
    behavior: "Водиться в Крейдяних каньйонах.",
    abilities: ["швидко бігає по стінах і стелі, залишаючи лінії, які розтріскуються під наступним кроком"],
  },
});

/* monsters/kreydyanyy-malyar.js */
Atlas.registerMonster({
  format: 2,
  id: "kreydyanyy-malyar",
  name: "Крейдяний маляр",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 600,
  lore: {
    description: "Невисока істота з білими пальцями.",
    behavior: "Крейдяні печери.",
    abilities: ["креслить на поверхнях хибні проходи, які розсипаються при дотику"],
  },
});

/* monsters/kreydyanyy-skakun.js */
Atlas.registerMonster({
  format: 2,
  id: "kreydyanyy-skakun",
  name: "Крейдяний скакун",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 725,
  lore: {
    description: "Крихітний чотириногий звір із білими ногами.",
    behavior: "Вапнякові стежки.",
    abilities: ["стрибає по скелях і залишає мітки, схожі на крейдяні риски"],
  },
});

/* monsters/kreydyanyy-skorpionchyk.js */
Atlas.registerMonster({
  format: 2,
  id: "kreydyanyy-skorpionchyk",
  name: "Крейдяний скорпіончик",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 668,
  lore: {
    description: "Дрібний скорпіон із білим пиловим панциром.",
    behavior: "Білі каньйони.",
    abilities: ["залишає крейдяні позначки на поверхнях і жалить із засідки"],
  },
});

/* monsters/kruhlorotyy-kamenehryz.js */
Atlas.registerMonster({
  format: 2,
  id: "kruhlorotyy-kamenehryz",
  name: "Круглоротий каменегриз",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 700,
  lore: {
    description: "Донна риба з круглим ротом і зубчастими пластинами.",
    behavior: "Підводні урвища.",
    abilities: ["присмоктується до скель і відриває фрагменти каменю"],
  },
});

/* monsters/kruhlyy-pantsyrnyk-murakha.js */
Atlas.registerMonster({
  format: 2,
  id: "kruhlyy-pantsyrnyk-murakha",
  name: "Круглий панцирник-мураха",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills", "wasteland", "ashlands"], worlds: "all" },
  order: 677,
  lore: {
    description: "Маленька мураха з майже сферичним панциром.",
    behavior: "Кам’яні кургани.",
    abilities: ["скочується зі схилів і відбиває слабкі удари"],
  },
});

/* monsters/kryholamnyy-baran.js */
Atlas.registerMonster({
  format: 2,
  id: "kryholamnyy-baran",
  name: "Криголамний баран",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["peaks", "snow"], worlds: "all" },
  order: 547,
  lore: {
    description: "Звір із масивним клиноподібним лобом.",
    behavior: "Льодові проходи.",
    abilities: ["пробиває крижані стіни й атакує крізь уламки"],
  },
});

/* monsters/kryholap.js */
Atlas.registerMonster({
  format: 2,
  id: "kryholap",
  name: "Криголап",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["tundra"], worlds: "all" },
  order: 798,
  lore: {
    description: "Трилапий хутряний хижак із блакитними кришталевими подушечками на ступнях.",
    behavior: "Полює біля замерзлих гирл річок.",
    abilities: ["ковзає по тонкому льоду, різко змінює напрямок і б’є по поверхні, розкидаючи навколо гострі льодові скалки"],
  },
});

/* monsters/krykhitka-hromovoyi-hlyny.js */
Atlas.registerMonster({
  format: 2,
  id: "krykhitka-hromovoyi-hlyny",
  name: "Крихітка Громової Глини",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 897,
  lore: {
    description: "Маленька істота з блакитної глини, що має три короткі руки й голову у формі грозової хмари.",
    behavior: "Трапляється біля глиняних кар'єрів після бурі.",
    abilities: ["накопичує статичний заряд від руху по піску та випускає невеликі іскри, які активують металеві предмети"],
  },
});

/* monsters/krykhitka-pechati.js */
Atlas.registerMonster({
  format: 2,
  id: "krykhitka-pechati",
  name: "Крихітка Печаті",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills", "grass"], worlds: "all" },
  order: 807,
  lore: {
    description: "Дрібна квадратна личинка з гладкою панцирною спинкою й крихітними чорнильними лапками.",
    behavior: "Ховається в ущелинах старих підземель.",
    abilities: ["приклеює до предметів липкі печатки, що тимчасово блокують відкривання скринь або механізмів"],
  },
});

/* monsters/krykhitna-mushlya-khodun.js */
Atlas.registerMonster({
  format: 2,
  id: "krykhitna-mushlya-khodun",
  name: "Крихітна мушля-ходун",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 720,
  lore: {
    description: "Молюск із квадратною мушлею.",
    behavior: "Береги струмків.",
    abilities: ["повільно переходить доріжки та ховається при дотику"],
  },
});

/* monsters/krykhitnyy-bureviynyk.js */
Atlas.registerMonster({
  format: 2,
  id: "krykhitnyy-bureviynyk",
  name: "Крихітний буревійник",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["peaks", "hills"], worlds: "all" },
  order: 659,
  lore: {
    description: "Літаюча комаха з чотирма нерівними крилами.",
    behavior: "Вітряні пагорби.",
    abilities: ["невеликими поривами вітру збиває траєкторію снарядів"],
  },
});

/* monsters/krykhitnyy-krab.js */
Atlas.registerMonster({
  format: 2,
  id: "krykhitnyy-krab",
  name: "Крихітний краб",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 441,
  lore: {
    description: "Членистоноге.",
    behavior: "Зустрічається: пляжі.",
    abilities: ["щипає клешнями", "ховається під камінням"],
  },
});

/* monsters/krykhitnyy-lavovyy-zhuk.js */
Atlas.registerMonster({
  format: 2,
  id: "krykhitnyy-lavovyy-zhuk",
  name: "Крихітний Лавовий Жук",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["volcanic", "ashlands"], worlds: "all" },
  order: 922,
  lore: {
    description: "Маленький чорний жук із помаранчевими тріщинами на панцирі.",
    behavior: "Живе біля теплих тріщин згаслих вулканів.",
    abilities: ["гріє каміння під собою, залишаючи гарячі квадрати, які змушують гравця змінювати маршрут"],
  },
});

/* monsters/krykhitnyy-pylokryl.js */
Atlas.registerMonster({
  format: 2,
  id: "krykhitnyy-pylokryl",
  name: "Крихітний пилокрил",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga", "grass"], worlds: "all" },
  order: 714,
  lore: {
    description: "Маленька комаха, що здіймає хмарку пилку при зльоті.",
    behavior: "Квіткові галявини.",
    abilities: ["ненадовго затуманює огляд"],
  },
});

/* monsters/krykhitnyy-sazhok.js */
Atlas.registerMonster({
  format: 2,
  id: "krykhitnyy-sazhok",
  name: "Крихітний сажок",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["grass", "hills"], worlds: "all" },
  order: 735,
  lore: {
    description: "Маленька грудка сажі на ніжках.",
    behavior: "Старі печі та димарі.",
    abilities: ["розбігається на кілька частинок при ударі й збирається після паузи"],
  },
});

/* monsters/krykhkyy-spysar.js */
Atlas.registerMonster({
  format: 2,
  id: "krykhkyy-spysar",
  name: "Крихкий списар",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["crystal", "grass", "hills"], worlds: "all" },
  order: 580,
  lore: {
    description: "Тонкий монстр із тіламистими кінцівками зі скла.",
    behavior: "Скляні майстерні.",
    abilities: ["атакує прямими випадами, але легко розсипається від важкого удару"],
  },
});

/* monsters/krykhtokryl.js */
Atlas.registerMonster({
  format: 2,
  id: "krykhtokryl",
  name: "Крихтокрил",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills", "grass"], worlds: "all" },
  order: 900,
  lore: {
    description: "Маленька комаха з крильми з тонких кам'яних пластин і круглим тулубом із пісковику.",
    behavior: "Гніздиться в обвалених вежах.",
    abilities: ["облітає старі стіни, відколюючи крихти, а потім скидає їх на гравця з висоти"],
  },
});

/* monsters/krylati-myslyvtsi.js */
Atlas.registerMonster({
  "format": 2,
  "id": "krylati-myslyvtsi",
  "name": "Крилаті мисливці",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "chervoni-ustupy",
      "hlyboki-yary",
      "mokhovi-terasy",
      "sonyachni-kamyani-mosty",
      "vysoki-viaduky",
      "zeleni-ustupy",
      "kamyani-perevaly",
      "zabuti-mostovi-mista"
    ],
    "worlds": [
      "hlybokray"
    ]
  },
  "order": 845,
  "lore": {
    "description": "Загроза світу «Глибокрай»."
  }
});

/* monsters/krylatyy-naperstok.js */
Atlas.registerMonster({
  format: 2,
  id: "krylatyy-naperstok",
  name: "Крилатий наперсток",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["grass", "hills"], worlds: "all" },
  order: 643,
  lore: {
    description: "Маленька комаха з твердими конусоподібними крилами.",
    behavior: "Високі трави.",
    abilities: ["падає з висоти й пробиває тонкі поверхні"],
  },
});

/* monsters/kryshtaleva-kovzanka.js */
Atlas.registerMonster({
  format: 2,
  id: "kryshtaleva-kovzanka",
  name: "Кришталева Ковзанка",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 858,
  lore: {
    description: "Плаский звір із шістьма кришталевими лапами й довгим хвостом-лезом.",
    behavior: "Трапляється в печерах під замерзлими водоспадами.",
    abilities: ["рухається лише по слизьких поверхнях, розганяючись до небезпечної швидкості, та залишає за собою тонкий лід"],
  },
});

/* monsters/kryshtalevi-holemy.js */
Atlas.registerMonster({
  format: 1,
  id: "kryshtalevi-holemy",
  name: "Кришталеві големи",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["crystal", "mountain"], worlds: "all" },
  order: 123,
});

/* monsters/kryshtalevyi-yizhak.js */
Atlas.registerMonster({
  "format": 2,
  "id": "kryshtalevyi-yizhak",
  "name": "Кришталевий їжак",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "tag:crystal",
      "tag:glass"
    ],
    "worlds": "all"
  },
  "order": 962,
  "lore": {
    "description": "Їжак, чий хребет — гостра кристалічна щітка.",
    "behavior": "Згортається в кулю й котиться по схилах.",
    "abilities": [
      "розкидає гострі кристали",
      "дзвенить, відлякуючи ворогів"
    ],
    "drops": [
      "кришталева голка"
    ]
  }
});

/* monsters/kryshtalevyy-chervets.js */
Atlas.registerMonster({
  format: 2,
  id: "kryshtalevyy-chervets",
  name: "Кришталевий червець",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 675,
  lore: {
    description: "Маленька комаха з прозорими сегментами тіла.",
    behavior: "Кришталеві печери.",
    abilities: ["ховається всередині кристалів і вилітає при наближенні"],
  },
});

/* monsters/kryshtalnookyy-vovchenya.js */
Atlas.registerMonster({
  format: 2,
  id: "kryshtalnookyy-vovchenya",
  name: "Криштальноокий вовченя",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga"], worlds: "all" },
  order: 635,
  lore: {
    description: "Молодий хижак зі скляними очима.",
    behavior: "Кришталеві ліси.",
    abilities: ["бачить крізь тонкі перешкоди й вистежує рух"],
  },
});

/* monsters/krystalichni-zhuky.js */
Atlas.registerMonster({
  "format": 2,
  "id": "krystalichni-zhuky",
  "name": "Кристалічні жуки",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "kvartsovi-sady",
      "hranatovi-plato",
      "bili-kamyani-luky",
      "temni-heodni-pechery"
    ],
    "worlds": [
      "skeltsvit"
    ]
  },
  "order": 882,
  "lore": {
    "description": "Загроза світу «Скельцвіт»."
  }
});

/* monsters/krystalichnyy-pavuk.js */
Atlas.registerMonster({
  format: 2,
  id: "krystalichnyy-pavuk",
  name: "Кристалічний павук",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills", "crystal"], worlds: "all" },
  order: 342,
  lore: {
    description: "Елітний павук.",
    behavior: "Зустрічається: геодні печери.",
    abilities: ["кристалічні нитки", "рикошетні уламки"],
  },
});

/* monsters/krystalnyy-skorpion.js */
Atlas.registerMonster({
  format: 2,
  id: "krystalnyy-skorpion",
  name: "Кристальний скорпіон",
  kind: "mini-boss",
  nature: "magic",
  variants: ["кристальний скорпіон", "скорпіон-кристал"],
  spawn: { biomes: ["mountain", "hills", "crystal"], worlds: "all" },
  order: 302,
  lore: {
    description: "Комаха. Об'єднує схожих істот: кристальний скорпіон, скорпіон-кристал.",
    behavior: "Зустрічається: геодні печери; геоди.",
    abilities: ["кристалічні шипи", "отрута", "броньований панцир", "відбиття світлових атак"],
  },
});

/* monsters/kryzhana-pecherna-hidra.js */
Atlas.registerMonster({
  format: 2,
  id: "kryzhana-pecherna-hidra",
  name: "Крижана печерна гідра",
  kind: "boss",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills", "peaks", "snow"], worlds: "all" },
  order: 289,
  lore: {
    description: "Багатоголовий звір.",
    behavior: "Зустрічається: льодовикові печери.",
    abilities: ["морозне дихання", "регенерація", "крижані пастки"],
  },
});

/* monsters/kryzhani-troli.js */
Atlas.registerMonster({
  "format": 2,
  "id": "kryzhani-troli",
  "name": "Крижані тролі",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "snow",
      "syni-lodovyky",
      "zamerzli-sosny",
      "krystalichni-pechery"
    ],
    "worlds": [
      "frostheym"
    ]
  },
  "order": 842,
  "lore": {
    "description": "Загроза світу «Фростгейм»."
  }
});

/* monsters/kryzhani-veletni.js */
Atlas.registerMonster({
  format: 1,
  id: "kryzhani-veletni",
  name: "крижані велетні",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["hills", "mountain", "peaks"], worlds: "all" },
  order: 7,
});

/* monsters/kryzhanyy-barabanshchyk.js */
Atlas.registerMonster({
  format: 2,
  id: "kryzhanyy-barabanshchyk",
  name: "Крижаний барабанщик",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills", "tundra"], worlds: "all" },
  order: 556,
  lore: {
    description: "Гуманоїд зі шкіряними рукавицями та крижаними барабанами.",
    behavior: "Замерзлі печери.",
    abilities: ["вібраціями руйнує тонкі крижані настили"],
  },
});

/* monsters/kryzhanyy-baranets.js */
Atlas.registerMonster({
  format: 2,
  id: "kryzhanyy-baranets",
  name: "Крижаний баранець",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills", "tundra"], worlds: "all" },
  order: 497,
  lore: {
    description: "Звір із кристалічною вовною та гострими копитами.",
    behavior: "Замерзлі ущелини.",
    abilities: ["залишає слизькі сліди й стрибає між крижаними виступами"],
  },
});

/* monsters/kryzhanyy-molyusk.js */
Atlas.registerMonster({
  format: 2,
  id: "kryzhanyy-molyusk",
  name: "Крижаний молюск",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 705,
  lore: {
    description: "Холодноводна істота з багатошаровою напівпрозорою мушлею.",
    behavior: "Полярні затоки.",
    abilities: ["утворює крижані плями навколо місця, де лежить"],
  },
});

/* monsters/kryzhanyy-ohr.js */
Atlas.registerMonster({
  format: 2,
  id: "kryzhanyy-ohr",
  name: "Крижаний огр",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills", "peaks", "snow"], worlds: "all" },
  order: 335,
  lore: {
    description: "Елітний велетень.",
    behavior: "Зустрічається: льодовикові печери.",
    abilities: ["кидання льоду", "заморожувальні удари"],
  },
});

/* monsters/kryzhanyy-perepysuvach.js */
Atlas.registerMonster({
  format: 2,
  id: "kryzhanyy-perepysuvach",
  name: "Крижаний переписувач",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["grass", "hills"], worlds: "all" },
  order: 465,
  lore: {
    description: "Довгорукий гуманоїд, який креслить символи в повітрі.",
    behavior: "Бібліотека вічної мерзлоти.",
    abilities: ["записані ним знаки перетворюються на крижані конструкції та замкнені проходи"],
  },
});

/* monsters/kryzhanyy-prabatko.js */
Atlas.registerMonster({
  format: 2,
  id: "kryzhanyy-prabatko",
  name: "Крижаний прабатько",
  kind: "super-boss",
  nature: "threat",
  spawn: { biomes: ["peaks", "snow"], worlds: "all" },
  order: 260,
  lore: {
    description: "Велетень морозу.",
    behavior: "Зустрічається: вічні льодовики.",
    abilities: ["заморожує поверхню", "викликає крижані шипи", "створює хуртовини"],
  },
});

/* monsters/kryzhanyy-tyulen-khyzhak.js */
Atlas.registerMonster({
  format: 2,
  id: "kryzhanyy-tyulen-khyzhak",
  name: "Крижаний тюлень-хижак",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 433,
  lore: {
    description: "Водний звір.",
    behavior: "Зустрічається: полярні береги.",
    abilities: ["крижаний подих", "швидкі атаки з води"],
  },
});

/* monsters/kryzhanyy-vovk-vozhak.js */
Atlas.registerMonster({
  format: 1,
  id: "kryzhanyy-vovk-vozhak",
  name: "Крижаний Вовк-Вожак",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["tundra", "snow", "taiga"], worlds: "all" },
  order: 113,
});

/* monsters/ktulkhu.js */
Atlas.registerMonster({
  format: 1,
  id: "ktulkhu",
  name: "Ктулху",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["deep"], worlds: "all" },
  order: 82,
});

/* monsters/kubichna-mil.js */
Atlas.registerMonster({
  format: 2,
  id: "kubichna-mil",
  name: "Кубічна міль",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["grass", "hills"], worlds: "all" },
  order: 717,
  lore: {
    description: "Маленький метелик із квадратними крилами.",
    behavior: "Кольорові луки.",
    abilities: ["летить до яскравих кольорів і кружляє біля спорядження"],
  },
});

/* monsters/kubichnyy-kropyvnyk.js */
Atlas.registerMonster({
  format: 2,
  id: "kubichnyy-kropyvnyk",
  name: "Кубічний кропивник",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga", "grass", "hills"], worlds: "all" },
  order: 612,
  lore: {
    description: "Маленька рослинна істота з квадратними листками.",
    behavior: "Зарослі сади.",
    abilities: ["відскакує від ударів і розкидає жалкі насінини"],
  },
});

/* monsters/kubichnyy-pukhoyid.js */
Atlas.registerMonster({
  format: 2,
  id: "kubichnyy-pukhoyid",
  name: "Кубічний Пухоїд",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["grass"], worlds: "all" },
  order: 930,
  lore: {
    description: "Маленький білий звір із прямокутним тілом, короткими лапами й вухами, схожими на листя.",
    behavior: "Пасеться в трав'яних долинах біля старих млинів.",
    abilities: ["жує мох і пух, а коли наляканий, розпушує шерсть до величезного куба, перекриваючи вузький прохід"],
  },
});

/* monsters/kubichnyy-svitlyachok.js */
Atlas.registerMonster({
  format: 2,
  id: "kubichnyy-svitlyachok",
  name: "Кубічний світлячок",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga", "grass"], worlds: "all" },
  order: 736,
  lore: {
    description: "Дрібна літаюча істота з квадратним світним черевцем.",
    behavior: "Вечірні галявини.",
    abilities: ["збирається у візерунки в повітрі й розлітається, коли до неї наближаються"],
  },
});

/* monsters/kubichnyy-zhuk-perekotypole.js */
Atlas.registerMonster({
  format: 2,
  id: "kubichnyy-zhuk-perekotypole",
  name: "Кубічний жук-перекотиполе",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["desert", "grass"], worlds: "all" },
  order: 410,
  lore: {
    description: "Комаха.",
    behavior: "Зустрічається: пустельні рівнини.",
    abilities: ["згортається в тверду кулю й котиться на ворога"],
  },
});

/* monsters/kultyst.js */
Atlas.registerMonster({
  format: 2,
  id: "kultyst",
  name: "Культист",
  kind: "monster",
  nature: "threat",
  variants: ["культовий послушник", "культист-підпалювач", "сільський культист-вербувальник"],
  spawn: { biomes: ["wasteland", "hills", "grass"], worlds: "all" },
  order: 356,
  lore: {
    description: "Звичайний гуманоїд. Об'єднує схожих істот: культовий послушник, культист-підпалювач, сільський культист-вербувальник.",
    behavior: "Зустрічається: руїни храмів; прокляті табори; покинуті поселення.",
    abilities: ["ритуальний кинджал", "слабке прокляття", "вогняні суміші", "підпалювання трави", "ритуальні знаки", "заклик слабких послідовників"],
  },
});

/* monsters/kupolna-meduza.js */
Atlas.registerMonster({
  format: 2,
  id: "kupolna-meduza",
  name: "Купольна медуза",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 708,
  lore: {
    description: "Маленька медуза з твердим напівпрозорим куполом.",
    behavior: "Теплі морські печери.",
    abilities: ["підстрибує у воді й лишає слабкі електричні розряди"],
  },
});

/* monsters/kurhannyy-korol.js */
Atlas.registerMonster({
  "format": 2,
  "id": "kurhannyy-korol",
  "name": "Курганний Король",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "smarahdovi-stepy",
      "veresovi-pahorby",
      "korenevi-yary",
      "kamyani-pokhovannya"
    ],
    "worlds": [
      "grondar"
    ]
  },
  "order": 789,
  "lore": {
    "description": "Бос світу «Ґрондар»."
  }
});

/* monsters/kvitka-parasolka.js */
Atlas.registerMonster({
  format: 2,
  id: "kvitka-parasolka",
  name: "Квітка-Парасолька",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["swamp", "grass", "hills"], worlds: "all" },
  order: 779,
  lore: {
    description: "Мандрівна рослина з однією міцною кореневою ногою, широким квітковим куполом і рядами краплеподібних зубців.",
    behavior: "Росте на заболочених луках.",
    abilities: ["складає пелюстки та котиться схилом, розкидаючи колючі насінини на поворотах"],
  },
});

/* monsters/kvitkoyid-rozkrytykh-shchelep.js */
Atlas.registerMonster({
  format: 2,
  id: "kvitkoyid-rozkrytykh-shchelep",
  name: "Квіткоїд Розкритих Щелеп",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["wasteland", "hills", "grass"], worlds: "all" },
  order: 878,
  lore: {
    description: "Рослинний хижак із товстим стеблом, чотирма пелюстками-щелепами й корінням, що ходить на кінчиках.",
    behavior: "Росте в садах покинутих алхіміків.",
    abilities: ["стуляє пелюстки навколо гравця, якщо той наступає на квіткові мітки, але відкривається після сильного удару по стеблу"],
  },
});

/* monsters/kvitkoyidnyy-baran.js */
Atlas.registerMonster({
  format: 2,
  id: "kvitkoyidnyy-baran",
  name: "Квіткоїдний баран",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["grass", "hills", "mountain", "peaks"], worlds: "all" },
  order: 515,
  lore: {
    description: "Агресивна тварина з пелюстками замість шерсті.",
    behavior: "Різнобарвні високогірні луки.",
    abilities: ["поглинає магічні квіти, тимчасово змінюючи тип атаки"],
  },
});

/* monsters/kytovezh.js */
Atlas.registerMonster({
  format: 2,
  id: "kytovezh",
  name: "Китовеж",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["deep"], worlds: "all" },
  order: 738,
  lore: {
    description: "Колосальна морська істота з тілом, укритим вежами з мушель і наростами, схожими на затонулі замки.",
    behavior: "Мешкає в Беззоряному океані.",
    abilities: ["здіймає спиною цунамі та струшує кам’яні уламки, що падають на кораблі"],
  },
});

/* monsters/last-siege-knight.js */
Atlas.registerMonster({
  "format": 2,
  "id": "last-siege-knight",
  "name": "Лицар Останньої Облоги",
  "kind": "boss",
  "nature": "threat",
  "alias": "Останній Захисник",
  "spawn": {
    "biomes": [
      "citadel-graveyard"
    ],
    "worlds": [
      "ostanky"
    ]
  },
  "order": 214,
  "lore": {
    "description": "Лицар, що досі тримає оборону на розірваному на частини замку.",
    "behavior": "Охороняє міст і ворота; не здається.",
    "abilities": [
      "удар облогового меча",
      "виклик безликих лицарів"
    ],
    "drops": [
      "обладунок облоги"
    ]
  }
});

/* monsters/latanyy-zemleryy.js */
Atlas.registerMonster({
  format: 2,
  id: "latanyy-zemleryy",
  name: "Латаний землерий",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga", "mountain", "hills"], worlds: "all" },
  order: 575,
  lore: {
    description: "Гризун, обліплений шматками кори та глини.",
    behavior: "Лісові схили.",
    abilities: ["прориває короткі тунелі й вискакує біля ніг"],
  },
});

/* monsters/latattyevyy-khapach.js */
Atlas.registerMonster({
  format: 2,
  id: "latattyevyy-khapach",
  name: "Лататтєвий хапач",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 693,
  lore: {
    description: "Водна рослина-хижак із кількома плаваючими листками.",
    behavior: "Зарослі ставки.",
    abilities: ["стягує листки навколо цілі й тягне її під воду"],
  },
});

/* monsters/latunnyy-zhuk-nosiy.js */
Atlas.registerMonster({
  format: 2,
  id: "latunnyy-zhuk-nosiy",
  name: "Латунний жук-носій",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 567,
  lore: {
    description: "Масивна комаха з порожнистим панциром.",
    behavior: "Старі латунні копальні.",
    abilities: ["перевозить дрібних істот усередині себе й випускає їх при небезпеці"],
  },
});

/* monsters/lavovi-zhuky.js */
Atlas.registerMonster({
  "format": 2,
  "id": "lavovi-zhuky",
  "name": "Лавові жуки",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "haryachi-dzherela",
      "siri-plato",
      "parovi-yary",
      "vulkanichni-ustupy"
    ],
    "worlds": [
      "termalis"
    ]
  },
  "order": 859,
  "lore": {
    "description": "Загроза світу «Термаліс»."
  }
});

/* monsters/lavovi-zviri.js */
Atlas.registerMonster({
  "format": 2,
  "id": "lavovi-zviri",
  "name": "Лавові звірі",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "bazaltovi-kuzni",
      "obsydianovi-lisy",
      "popelyasti-terasy",
      "mahmovi-riky",
      "kryshtalevi-horny"
    ],
    "worlds": [
      "embergard"
    ]
  },
  "order": 760,
  "lore": {
    "description": "Загроза світу «Емберґард»."
  }
});

/* monsters/lavovyi-rakshyk.js */
Atlas.registerMonster({
  "format": 2,
  "id": "lavovyi-rakshyk",
  "name": "Лавовий рачок",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "tag:hot",
      "tag:volcanic",
      "tag:ashlands"
    ],
    "worlds": "all"
  },
  "order": 966,
  "lore": {
    "description": "Рак із розпеченою кам'яною шкаралупою.",
    "behavior": "Ходить по лаві, ловить клешнями.",
    "abilities": [
      "вогняні клешні",
      "охолоджується й тверднішає"
    ],
    "drops": [
      "розпечена шкаралупа"
    ]
  }
});

/* monsters/lavovyy-zhuk-oblohar.js */
Atlas.registerMonster({
  format: 2,
  id: "lavovyy-zhuk-oblohar",
  name: "Лавовий жук-облогар",
  kind: "boss",
  nature: "threat",
  spawn: { biomes: ["volcanic", "ashlands"], worlds: "all" },
  order: 286,
  lore: {
    description: "Гігантська комаха.",
    behavior: "Зустрічається: вулканічні поля.",
    abilities: ["розбризкує лаву", "заривається в землю", "має розпечений панцир"],
  },
});

/* monsters/leshi.js */
Atlas.registerMonster({
  format: 1,
  id: "leshi",
  name: "леші",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga", "enchanted"], worlds: "all" },
  order: 24,
});

/* monsters/leviafan.js */
Atlas.registerMonster({
  format: 1,
  id: "leviafan",
  name: "Левіафан",
  kind: "boss",
  nature: "threat",
  spawn: { biomes: ["deep"], worlds: "all" },
  order: 81,
});

/* monsters/lich-imperator.js */
Atlas.registerMonster({
  format: 2,
  id: "lich-imperator",
  name: "Ліч-імператор",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "ashlands"], worlds: "all" },
  order: 258,
  lore: {
    description: "Верховний некромант.",
    behavior: "Зустрічається: похований імператорський некрополь.",
    abilities: ["воскресіння мерців", "прокляття", "магічні щити"],
  },
});

/* monsters/likhtarna-meduza.js */
Atlas.registerMonster({
  format: 2,
  id: "likhtarna-meduza",
  name: "Ліхтарна медуза",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 528,
  lore: {
    description: "Повітряна істота з напівпрозорим куполом.",
    behavior: "Печери з природними шахтами.",
    abilities: ["приваблює світлом, а потім б’є паралізувальними нитками"],
  },
});

/* monsters/likhtarni-parazyty.js */
Atlas.registerMonster({
  "format": 2,
  "id": "likhtarni-parazyty",
  "name": "Ліхтарні паразити",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "blakytnyy-pidlisok",
      "burshtynovi-halyavyny",
      "chervoni-korenevi-yary",
      "sribni-dibrovy",
      "chorni-dibrovy",
      "syniy-mokh",
      "lilovi-bolota",
      "zabuti-svitli-halyavyny"
    ],
    "worlds": [
      "lyumenvild"
    ]
  },
  "order": 793,
  "lore": {
    "description": "Загроза світу «Люменвільд»."
  }
});

/* monsters/likhtarnyk-bez-oblychchya.js */
Atlas.registerMonster({
  format: 2,
  id: "likhtarnyk-bez-oblychchya",
  name: "Ліхтарник без обличчя",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["grass", "hills"], worlds: "all" },
  order: 776,
  lore: {
    description: "Худорлява істота в довгому темному плащі, усередині якого висять зелені ліхтарі.",
    behavior: "Полює на туманних мостах.",
    abilities: ["відчіплює вогники й змушує їх блукати окремими маршрутами, а сам рухається лише між ділянками світла"],
  },
});

/* monsters/likhtarnyk-zatonulykh-vulyts.js */
Atlas.registerMonster({
  format: 2,
  id: "likhtarnyk-zatonulykh-vulyts",
  name: "Ліхтарник затонулих вулиць",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills", "lake"], worlds: "all" },
  order: 483,
  lore: {
    description: "Рибоподібна істота з ліхтарем у грудях.",
    behavior: "Затоплене місто.",
    abilities: ["світло приманює гравця в засідки під водою"],
  },
});

/* monsters/likhtarnyy-blukach.js */
Atlas.registerMonster({
  format: 2,
  id: "likhtarnyy-blukach",
  name: "Ліхтарний Блукач",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["swamp", "lake", "grass", "hills"], worlds: "all" },
  order: 866,
  lore: {
    description: "Худорлява істота з довгими ногами й головою-ліхтарем із жовтого скла.",
    behavior: "Блукає затопленими дорогами та болотними мостами.",
    abilities: ["світиться крізь туман, приваблюючи гравця до провалля, а в бою вимикає світло й пересувається ривками"],
  },
});

/* monsters/likhtarnyy-kozlyk.js */
Atlas.registerMonster({
  format: 2,
  id: "likhtarnyy-kozlyk",
  name: "Ліхтарний Козлик",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["mountain", "peaks"], worlds: "all" },
  order: 805,
  lore: {
    description: "Невеликий гірський звір із прозорими кристалічними рогами та шерстю кольору попелу.",
    behavior: "Мешкає в Місячнокам’яних нагір’ях.",
    abilities: ["освітлює темні проходи, доки його не налякати, а тоді цілеспрямовано таранить джерело світла й ховається за камінням"],
  },
});

/* monsters/likhtarnyy-svitlyak.js */
Atlas.registerMonster({
  format: 2,
  id: "likhtarnyy-svitlyak",
  name: "Ліхтарний світляк",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["grass", "hills"], worlds: "all" },
  order: 667,
  lore: {
    description: "Великий світляк із прямокутним черевцем.",
    behavior: "Вечірні луки.",
    abilities: ["спалахи його світла приманюють дрібних істот і ненадовго відволікають мандрівників"],
  },
});

/* monsters/lisoriz-perevernenykh-derev.js */
Atlas.registerMonster({
  format: 2,
  id: "lisoriz-perevernenykh-derev",
  name: "Лісоріз Перевернених Дерев",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga", "hills", "mountain"], worlds: "all" },
  order: 759,
  lore: {
    description: "Чотиринога деревна істота, у якої стовбур утворює корпус, а крона стоїть унизу на коренях-ногах.",
    behavior: "Живе в лісі, де дерева ростуть кронами під землею.",
    abilities: ["вириває дерева догори корінням і розмахує ними, створюючи рухомі зони небезпеки"],
  },
});

/* monsters/lisovi-hobliny.js */
Atlas.registerMonster({
  format: 1,
  id: "lisovi-hobliny",
  name: "лісові гобліни",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga", "enchanted"], worlds: "all" },
  order: 30,
});

/* monsters/lisovyi-dzvonar.js */
Atlas.registerMonster({
  "format": 2,
  "id": "lisovyi-dzvonar",
  "name": "Лісовий дзвонар",
  "kind": "mini-boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "tag:forest",
      "tag:canopy"
    ],
    "worlds": "all"
  },
  "order": 947,
  "lore": {
    "description": "Старий пеньок із дзвоником-серцем і довгими руками-вусами.",
    "behavior": "Б'є в дупло — і з землі встають коріння.",
    "abilities": [
      "дзвін оживляє коріння",
      "розсіює пилок, що присипляє"
    ],
    "drops": [
      "дзвоник-серце",
      "пеньок дзвонаря"
    ]
  }
});

/* monsters/lisovyy-chaklun-vyhnanets.js */
Atlas.registerMonster({
  format: 2,
  id: "lisovyy-chaklun-vyhnanets",
  name: "Лісовий чаклун-вигнанець",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga"], worlds: "all" },
  order: 363,
  lore: {
    description: "Звичайний маг.",
    behavior: "Зустрічається: самотні хатини, гаї.",
    abilities: ["коріння-пастки", "слабкі прокляття"],
  },
});

/* monsters/lisovyy-drakon.js */
Atlas.registerMonster({
  format: 1,
  id: "lisovyy-drakon",
  name: "Лісовий Дракон",
  kind: "boss",
  nature: "magic",
  variants: ["Зелений", "Отруйний"],
  spawn: { biomes: ["forest", "taiga", "enchanted"], worlds: "all" },
  order: 72,
});

/* monsters/lisovyy-hihant.js */
Atlas.registerMonster({
  format: 1,
  id: "lisovyy-hihant",
  name: "Лісовий Гігант",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga", "enchanted"], worlds: "all" },
  order: 79,
});

/* monsters/lisovyy-pavuchok.js */
Atlas.registerMonster({
  format: 2,
  id: "lisovyy-pavuchok",
  name: "Лісовий павучок",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga"], worlds: "all" },
  order: 435,
  lore: {
    description: "Павукоподібне.",
    behavior: "Зустрічається: кущі, дерева.",
    abilities: ["короткі стрибки", "укуси"],
  },
});

/* monsters/lodovi-pavuky.js */
Atlas.registerMonster({
  "format": 2,
  "id": "lodovi-pavuky",
  "name": "Льодові павуки",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "snow",
      "syni-lodovyky",
      "zamerzli-sosny",
      "krystalichni-pechery"
    ],
    "worlds": [
      "frostheym"
    ]
  },
  "order": 843,
  "lore": {
    "description": "Загроза світу «Фростгейм»."
  }
});

/* monsters/lodyanyy-kilnyk.js */
Atlas.registerMonster({
  format: 2,
  id: "lodyanyy-kilnyk",
  name: "Льодяний Кільник",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 892,
  lore: {
    description: "Вузький підводний звір із синіх крижаних пластин і загостреною головою.",
    behavior: "Живе під крижаними озерами.",
    abilities: ["прорізає замерзлі поверхні знизу, створюючи рухомі тріщини, які гравець має перестрибувати"],
  },
});

/* monsters/lord-buri.js */
Atlas.registerMonster({
  format: 1,
  id: "lord-buri",
  name: "Лорд Бурі",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 106,
});

/* monsters/lord-vidplyvu.js */
Atlas.registerMonster({
  format: 1,
  id: "lord-vidplyvu",
  name: "Лорд Відпливу",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["deep"], worlds: "all" },
  order: 99,
});

/* monsters/lord-zruynovanoho-perekhrestya.js */
Atlas.registerMonster({
  "format": 2,
  "id": "lord-zruynovanoho-perekhrestya",
  "name": "Лорд Зруйнованого Перехрестя",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "chervoni-ustupy",
      "hlyboki-yary",
      "mokhovi-terasy",
      "sonyachni-kamyani-mosty",
      "vysoki-viaduky",
      "zeleni-ustupy",
      "kamyani-perevaly",
      "zabuti-mostovi-mista"
    ],
    "worlds": [
      "hlybokray"
    ]
  },
  "order": 848,
  "lore": {
    "description": "Бос світу «Глибокрай»."
  }
});

/* monsters/lotofory.js */
Atlas.registerMonster({
  format: 1,
  id: "lotofory",
  name: "лотофори",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["deep"], worlds: "all" },
  order: 49,
});

/* monsters/luskata-kulya.js */
Atlas.registerMonster({
  format: 2,
  id: "luskata-kulya",
  name: "Луската куля",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 578,
  lore: {
    description: "Круглий броньований звір.",
    behavior: "Сухі кам’яні плато.",
    abilities: ["котиться до ворога, розкривається на короткий час і б’є лапами"],
  },
});

/* monsters/luskavyy-zemlemir.js */
Atlas.registerMonster({
  format: 2,
  id: "luskavyy-zemlemir",
  name: "Лускавий землемір",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["steppe", "hills", "mountain"], worlds: "all" },
  order: 502,
  lore: {
    description: "Довгий броньований рептилій із пластинами, схожими на геодезичні мітки.",
    behavior: "Степи тріснутої землі.",
    abilities: ["розмічає поле променями й обвалює позначені ділянки"],
  },
});

/* monsters/lychynka-hryzun.js */
Atlas.registerMonster({
  format: 2,
  id: "lychynka-hryzun",
  name: "Личинка-гризун",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 440,
  lore: {
    description: "Комахоподібна істота.",
    behavior: "Зустрічається: вологий ґрунт, печери.",
    abilities: ["слабкий укус", "ховається в землі"],
  },
});

/* monsters/lychynka-zoryanoho-pylu.js */
Atlas.registerMonster({
  format: 2,
  id: "lychynka-zoryanoho-pylu",
  name: "Личинка Зоряного Пилу",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["grass", "hills", "mountain", "peaks"], worlds: "all" },
  order: 829,
  lore: {
    description: "Срібляста гусениця з кубічними сегментами, що блимають, наче далекі зорі.",
    behavior: "Повзає в метеоритних садах на краю високогір’я.",
    abilities: ["залишає на камінні світний пил, який тимчасово підсвічує невидимі стежки та приховані написи"],
  },
});

/* monsters/lyskuchyy-pidkopnyk.js */
Atlas.registerMonster({
  format: 2,
  id: "lyskuchyy-pidkopnyk",
  name: "Лискучий підкопник",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["desert", "wasteland", "hills"], worlds: "all" },
  order: 599,
  lore: {
    description: "Невеликий червоподібний звір із металевим блиском.",
    behavior: "Піщані подвір’я руїн.",
    abilities: ["ковзає крізь пісок і залишає короткі слизькі борозни"],
  },
});

/* monsters/lystkovyi-kralyk.js */
Atlas.registerMonster({
  "format": 2,
  "id": "lystkovyi-kralyk",
  "name": "Листковий кролик",
  "kind": "weak",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "tag:forest",
      "tag:canopy"
    ],
    "worlds": "all"
  },
  "order": 945,
  "lore": {
    "description": "Кролик із вухами-листками, що зливається з підліском.",
    "behavior": "Тікає, шелестить, сам не нападає.",
    "abilities": [
      "зникає в кущах",
      "шелестом відволікає хижаків"
    ],
    "drops": [
      "лист-вухо",
      "кролячий хвіст"
    ]
  }
});

/* monsters/lystohryznyy-zhuzhil.js */
Atlas.registerMonster({
  format: 2,
  id: "lystohryznyy-zhuzhil",
  name: "Листогризний жужіль",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga"], worlds: "all" },
  order: 670,
  lore: {
    description: "Блискуча комаха з квадратною головою.",
    behavior: "Фруктові гаї.",
    abilities: ["гризе рослини, а потім плюється пережованими грудочками"],
  },
});

/* monsters/lystoyidnyy-vertun.js */
Atlas.registerMonster({
  format: 2,
  id: "lystoyidnyy-vertun",
  name: "Листоїдний Вертун",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga", "mountain", "hills"], worlds: "all" },
  order: 905,
  lore: {
    description: "Дрібний шестиногий звір із тілом, укритим круглими зеленими листками.",
    behavior: "Мешкає на терасах гігантських папоротей.",
    abilities: ["скручується в кулю та котиться по схилах, збиваючи ворогів, але зупиняється на м'якому ґрунті"],
  },
});

/* monsters/lystyanyy-kruten.js */
Atlas.registerMonster({
  format: 2,
  id: "lystyanyy-kruten",
  name: "Листяний крутень",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga"], worlds: "all" },
  order: 731,
  lore: {
    description: "Маленька комаха з широкими плоскими крилами.",
    behavior: "Листяні гаї.",
    abilities: ["обертається в повітрі, наче опалий листок, і ховається на землі"],
  },
});

/* monsters/lystyanyy-olenok.js */
Atlas.registerMonster({
  format: 2,
  id: "lystyanyy-olenok",
  name: "Листяний оленьок",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["forest", "enchanted"], worlds: "all" },
  order: 627,
  lore: {
    description: "Маленький олень із вухами у формі листків.",
    behavior: "Осінні переліски.",
    abilities: ["зливається з кущами й тікає зигзагами"],
  },
});

/* monsters/lysytsi-perevertky.js */
Atlas.registerMonster({
  format: 1,
  id: "lysytsi-perevertky",
  name: "Лисиці-перевертки",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["forest", "grass", "taiga"], worlds: "all" },
  order: 132,
});

/* monsters/lysytsya.js */
Atlas.registerMonster({
  format: 2,
  id: "lysytsya",
  name: "Лисиця",
  kind: "monster",
  nature: "magic",
  variants: ["лисиця-вогнівка", "срібна лисиця", "міднохвоста лисиця"],
  spawn: { biomes: ["forest", "taiga", "snow"], worlds: "all" },
  order: 384,
  lore: {
    description: "Магічний звір. Об'єднує схожих істот: лисиця-вогнівка, срібна лисиця, міднохвоста лисиця.",
    behavior: "Зустрічається: осінні ліси; засніжені гаї; Мідні ліси.",
    abilities: ["кидає маленькі вогники", "швидко тікає", "ілюзорні двійники", "маскування", "міднохвоста лисиця: збиває дрібні снаряди хвостовими помахами"],
  },
});

/* monsters/lytsar-perevernutoho-pylu.js */
Atlas.registerMonster({
  format: 2,
  id: "lytsar-perevernutoho-pylu",
  name: "Лицар Перевернутого Пилу",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 851,
  lore: {
    description: "Елітний воїн у панцирі з багряних піщаникових кубів, із плащем, що тече вертикально вгору.",
    behavior: "Охороняє гробниці в каньйоні з перевернутими скелями.",
    abilities: ["піднімає пил із землі й формує з нього тимчасові щити, а під час випадів ковзає крізь піщані шари"],
  },
});

/* monsters/lytsar-proklyatoho-kurhanu.js */
Atlas.registerMonster({
  format: 2,
  id: "lytsar-proklyatoho-kurhanu",
  name: "Лицар проклятого кургану",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills", "ashlands"], worlds: "all" },
  order: 299,
  lore: {
    description: "Неживий воїн.",
    behavior: "Зустрічається: кургани, склепи.",
    abilities: ["проклятий меч", "щитова хвиля"],
  },
});

/* monsters/lytsari-vidstupnyky.js */
Atlas.registerMonster({
  "format": 2,
  "id": "lytsari-vidstupnyky",
  "name": "Лицарі-відступники",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "praporni-rivnyny",
      "yalynovi-peredmurya",
      "kamyani-bastiony",
      "zruynovani-korolivski-sady"
    ],
    "worlds": [
      "trykoron"
    ]
  },
  "order": 864,
  "lore": {
    "description": "Загроза світу «Трикорон»."
  }
});

/* monsters/lyutovovky.js */
Atlas.registerMonster({
  format: 1,
  id: "lyutovovky",
  name: "лютововки",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga", "enchanted"], worlds: "all" },
  order: 26,
});

/* monsters/mah-lavovykh-bryl.js */
Atlas.registerMonster({
  format: 2,
  id: "mah-lavovykh-bryl",
  name: "Маг лавових брил",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills", "volcanic", "ashlands"], worlds: "all" },
  order: 309,
  lore: {
    description: "Елементаль.",
    behavior: "Зустрічається: вулканічні ущелини.",
    abilities: ["метає розпечене каміння", "створює лавові калюжі"],
  },
});

/* monsters/mahichna-husin-lystoyid.js */
Atlas.registerMonster({
  format: 2,
  id: "mahichna-husin-lystoyid",
  name: "Магічна гусінь-листоїд",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["enchanted", "forest", "taiga"], worlds: "all" },
  order: 409,
  lore: {
    description: "Комаха.",
    behavior: "Зустрічається: чарівні ліси.",
    abilities: ["знищує рослинність", "залишає отруйні сліди"],
  },
});

/* monsters/mahichnyy-krolyk-strybunets.js */
Atlas.registerMonster({
  format: 2,
  id: "mahichnyy-krolyk-strybunets",
  name: "Магічний кролик-стрибунець",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga", "grass", "hills"], worlds: "all" },
  order: 387,
  lore: {
    description: "Малий звір.",
    behavior: "Зустрічається: луки, квіткові поля.",
    abilities: ["блискавичні стрибки", "збиває з ніг"],
  },
});

/* monsters/mahichnyy-kryzhanyy-vedmid.js */
Atlas.registerMonster({
  format: 2,
  id: "mahichnyy-kryzhanyy-vedmid",
  name: "Магічний крижаний ведмідь",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga", "snow"], worlds: "all" },
  order: 313,
  lore: {
    description: "Звір.",
    behavior: "Зустрічається: засніжені ліси.",
    abilities: ["крижані пазурі", "морозний подих"],
  },
});

/* monsters/malyy-drakonchyk.js */
Atlas.registerMonster({
  format: 2,
  id: "malyy-drakonchyk",
  name: "Малий дракончик",
  kind: "monster",
  nature: "threat",
  variants: ["крихітний дракончик-крадій", "малий річковий дракончик"],
  spawn: { biomes: ["mountain", "hills", "lake"], worlds: "all" },
  order: 407,
  lore: {
    description: "Малий дракон. Об'єднує схожих істот: крихітний дракончик-крадій, малий річковий дракончик.",
    behavior: "Зустрічається: драконячі гнізда; гірські струмки, водоспади.",
    abilities: ["хапає блискучі предмети", "випускає іскри", "бризки води", "короткий стрибок", "укус"],
  },
});

/* monsters/malyy-dzerkalnyy-lazun.js */
Atlas.registerMonster({
  format: 2,
  id: "malyy-dzerkalnyy-lazun",
  name: "Малий Дзеркальний Лазун",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["crystal", "wasteland", "hills"], worlds: "all" },
  order: 916,
  lore: {
    description: "Плоска істота з блискучої сріблястої луски та довгих пальців-присосок.",
    behavior: "Ховається у дзеркальних залах старих палаців.",
    abilities: ["повзає по стінах, відбиваючи світло у вузькі промені, які засліплюють гравця, коли він дивиться вгору"],
  },
});

/* monsters/malyy-koreneplyh.js */
Atlas.registerMonster({
  format: 2,
  id: "malyy-koreneplyh",
  name: "Малий коренеплиг",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga", "grass"], worlds: "all" },
  order: 721,
  lore: {
    description: "Маленька грудка коріння з двома ніжками.",
    behavior: "Садові галявини.",
    abilities: ["підстрибує між рослинами й тікає від великих істот"],
  },
});

/* monsters/malyy-pryvyd.js */
Atlas.registerMonster({
  format: 2,
  id: "malyy-pryvyd",
  name: "Малий привид",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 443,
  lore: {
    description: "Нежить.",
    behavior: "Зустрічається: старі будинки, руїни.",
    abilities: ["слабкий морозний дотик", "проходить крізь тонкі перешкоди"],
  },
});

/* monsters/malyy-slyzen.js */
Atlas.registerMonster({
  format: 2,
  id: "malyy-slyzen",
  name: "Малий слизень",
  kind: "weak",
  nature: "threat",
  variants: ["малий зелений слизень", "синій слизень", "малий грибний слизень"],
  spawn: { biomes: ["forest", "taiga", "grass", "hills"], worlds: "all" },
  order: 434,
  lore: {
    description: "Слизень. Об'єднує схожих істот: малий зелений слизень, синій слизень, малий грибний слизень.",
    behavior: "Зустрічається: луки, ліси; береги водойм; грибні галявини.",
    abilities: ["слабкий удар", "стрибки", "залишає слизький слід", "розкидає спори"],
  },
});

/* monsters/malyy-vodyanyy-dukh.js */
Atlas.registerMonster({
  format: 2,
  id: "malyy-vodyanyy-dukh",
  name: "Малий водяний дух",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 442,
  lore: {
    description: "Дух.",
    behavior: "Зустрічається: струмки, джерела.",
    abilities: ["створює бризки", "штовхає гравця"],
  },
});

/* monsters/malyy-zhuk.js */
Atlas.registerMonster({
  format: 2,
  id: "malyy-zhuk",
  name: "Малий жук",
  kind: "weak",
  nature: "threat",
  variants: ["малий вогняний жук", "малий крижаний жук"],
  spawn: { biomes: ["mountain", "hills", "snow"], worlds: "all" },
  order: 439,
  lore: {
    description: "Комаха. Об'єднує схожих істот: малий вогняний жук, малий крижаний жук.",
    behavior: "Зустрічається: теплі печери; засніжені ділянки.",
    abilities: ["слабкий опік при контакті", "короткочасно сповільнює холодом"],
  },
});

/* monsters/mandrivni-buri.js */
Atlas.registerMonster({
  format: 1,
  id: "mandrivni-buri",
  name: "Мандрівні бурі",
  kind: "other",
  nature: "magic",
  spawn: { biomes: ["steppe", "desert", "tundra", "deep", "sea"], worlds: "all" },
  order: 135,
});

/* monsters/mandrivnyi-kameniak.js */
Atlas.registerMonster({
  "format": 2,
  "id": "mandrivnyi-kameniak",
  "name": "Мандрівний каменяк",
  "kind": "monster",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "tag:land+fantasy"
    ],
    "worlds": "all"
  },
  "order": 1001,
  "lore": {
    "description": "Безформний шматок породи на чотирьох лапах.",
    "behavior": "Блукає зі стадом.",
    "abilities": [
      "каменяче прискорення",
      "удар головою"
    ],
    "drops": [
      "дивний камінь"
    ]
  }
});

/* monsters/mandrivnyy-tron.js */
Atlas.registerMonster({
  format: 2,
  id: "mandrivnyy-tron",
  name: "Мандрівний Трон",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 753,
  lore: {
    description: "Королівський трон на восьми коренеподібних ногах, навантажений уламками власного замку.",
    behavior: "Блукає руїнами забутих столиць.",
    abilities: ["захоплює двері й ворота навколо арени, змінюючи проходи та перетворюючи стіни на рухомі барикади"],
  },
});

/* monsters/mantykory.js */
Atlas.registerMonster({
  format: 1,
  id: "mantykory",
  name: "мантикори",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["hills", "mountain", "peaks"], worlds: "all" },
  order: 11,
});

/* monsters/marmurova-kunytsya.js */
Atlas.registerMonster({
  format: 2,
  id: "marmurova-kunytsya",
  name: "Мармурова Куниця",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["wasteland", "hills", "grass"], worlds: "all" },
  order: 884,
  lore: {
    description: "Гнучкий чотириногий хижак із біло-сірими мармуровими смугами та хвостом із дрібних кубиків.",
    behavior: "Полює в палацових садах.",
    abilities: ["прослизає між декоративними статуями й відтворює їхню позу, перш ніж раптово атакувати з флангу"],
  },
});

/* monsters/marmurova-zhabka.js */
Atlas.registerMonster({
  format: 2,
  id: "marmurova-zhabka",
  name: "Мармурова жабка",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 583,
  lore: {
    description: "Пласка амфібія з гладкою кам’яною шкірою.",
    behavior: "Мармурові печери.",
    abilities: ["стрибає по стінах і плюється дрібними мармуровими кульками"],
  },
});

/* monsters/marmurovyy-murashnykar.js */
Atlas.registerMonster({
  format: 2,
  id: "marmurovyy-murashnykar",
  name: "Мармуровий мурашникар",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["desert", "wasteland"], worlds: "all" },
  order: 661,
  lore: {
    description: "Велика мурашка з білим кам’яним панциром.",
    behavior: "Мармурові пустки.",
    abilities: ["риє короткі проходи між плитами та атакує з-під землі"],
  },
});

/* monsters/maskovanyy-duelyant.js */
Atlas.registerMonster({
  format: 2,
  id: "maskovanyy-duelyant",
  name: "Маскований дуелянт",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 367,
  lore: {
    description: "Звичайний гуманоїд.",
    behavior: "Зустрічається: руїни арен.",
    abilities: ["парирування", "швидкий випад"],
  },
});

/* monsters/materynska-heoda.js */
Atlas.registerMonster({
  "format": 2,
  "id": "materynska-heoda",
  "name": "Материнська Геода",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "kvartsovi-sady",
      "hranatovi-plato",
      "bili-kamyani-luky",
      "temni-heodni-pechery"
    ],
    "worlds": [
      "skeltsvit"
    ]
  },
  "order": 884,
  "lore": {
    "description": "Бос світу «Скельцвіт»."
  }
});

/* monsters/matir-nerukhomykh-bur.js */
Atlas.registerMonster({
  format: 2,
  id: "matir-nerukhomykh-bur",
  name: "Матір нерухомих бур",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 448,
  lore: {
    description: "Левіафан із хмар, блискавок і скляних пластин.",
    behavior: "Плато вічних штормів.",
    abilities: ["зупиняє вітер, а потім випускає його у вигляді руйнівних стін повітря"],
  },
});

/* monsters/matir-usikh-chudovysk.js */
Atlas.registerMonster({
  format: 2,
  id: "matir-usikh-chudovysk",
  name: "Матір усіх чудовиськ",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 246,
  lore: {
    description: "Прадавня істота.",
    behavior: "Зустрічається: заражені підземні гнізда.",
    abilities: ["породжує мутованих монстрів", "отруює землю", "відновлює здоров’я за рахунок потомства"],
  },
});

/* monsters/matir-verkhnoho-pryplyvu.js */
Atlas.registerMonster({
  "format": 2,
  "id": "matir-verkhnoho-pryplyvu",
  "name": "Матір Верхнього Припливу",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "solyani-dzvony",
      "povitryani-ryfy",
      "vodospadni-dzhunhli",
      "blue-hollows",
      "arkhipelahy-plavayuchoho-mulu",
      "vertykalni-dzhunhli",
      "dolyny-vyskhidnoyi-vody",
      "khmarni-arkhipelahy",
      "kamyani-richkovi-ushchelyny",
      "nebesni-bolota"
    ],
    "worlds": [
      "solemor"
    ]
  },
  "order": 710,
  "lore": {
    "description": "Матір Верхнього Припливу змушує океан падати на материки."
  }
});

/* monsters/matka-burshtynovoho-hnizda.js */
Atlas.registerMonster({
  "format": 2,
  "id": "matka-burshtynovoho-hnizda",
  "name": "Матка Бурштинового Гнізда",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "chorni-stovbury",
      "burshtynovi-zaplavy",
      "mokhovi-terasy",
      "sklyani-korenevyshcha"
    ],
    "worlds": [
      "smolyar"
    ]
  },
  "order": 828,
  "lore": {
    "description": "Бос світу «Смоляр»."
  }
});

/* monsters/matka-hihantskykh-arakhnidiv.js */
Atlas.registerMonster({
  format: 1,
  id: "matka-hihantskykh-arakhnidiv",
  name: "Матка Гігантських Арахнідів",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga", "enchanted"], worlds: "all" },
  order: 76,
});

/* monsters/matka-mantykor.js */
Atlas.registerMonster({
  format: 1,
  id: "matka-mantykor",
  name: "Матка Мантикор",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["hills", "mountain", "peaks"], worlds: "all" },
  order: 55,
});

/* monsters/matka-pidvodnykh-shpyliv.js */
Atlas.registerMonster({
  format: 2,
  id: "matka-pidvodnykh-shpyliv",
  name: "Матка Підводних Шпилів",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 739,
  lore: {
    description: "Багатотіла володарка рифів, складена з десятків зрощених коралових колон і величезного перлинного ядра.",
    behavior: "Ховається в западинах Рифового Собору.",
    abilities: ["вирощує просто під противником гострі шпилі та перегороджує морське дно кораловими стінами"],
  },
});

/* monsters/matka-stovburiv.js */
Atlas.registerMonster({
  "format": 2,
  "id": "matka-stovburiv",
  "name": "Матка стовбурів",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "tag:forest",
      "tag:canopy"
    ],
    "worlds": "all"
  },
  "order": 948,
  "lore": {
    "description": "Велетенське дерево-вдова, що ходить на корінні й шепоче гілками.",
    "behavior": "Сідає в чорному лісі та вирощує вартових зі своїх шишок.",
    "abilities": [
      "гілки б'ють по площі",
      "шишки розкриваються стражами",
      "вичавлює життя з сусідніх дерев"
    ],
    "drops": [
      "серцевина стовбура",
      "смола-матка"
    ]
  },
  "variants": [
    "біла вдова лісу",
    "чорна вдова лісу"
  ]
});

/* monsters/matka-zhyl.js */
Atlas.registerMonster({
  "format": 2,
  "id": "matka-zhyl",
  "name": "Матка жил",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "tag:underground",
      "tag:mine"
    ],
    "worlds": "all"
  },
  "order": 960,
  "lore": {
    "description": "Колосальний павук із лискучою рудою замість панцира.",
    "behavior": "Пряде мережу з металевого волокна під найглибшою шахтою.",
    "abilities": [
      "окутує павутинням-дротом",
      "вмикає живу руду-слуг",
      "струмінь розпеченого металу"
    ],
    "drops": [
      "панцир-руда",
      "серце матки"
    ]
  }
});

/* monsters/matrona-ostannoho-snihopadu.js */
Atlas.registerMonster({
  format: 2,
  id: "matrona-ostannoho-snihopadu",
  name: "Матрона Останнього Снігопаду",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["peaks", "tundra", "snow", "grass"], worlds: "all" },
  order: 838,
  lore: {
    description: "Величезна шестинога постать із білих дерев'яних плит, підвішених у повітрі навколо порожньої грудної клітки.",
    behavior: "Володарює у замерзлій долині, де сніг падає навіть угору.",
    abilities: ["викликає сніг, який поступово заморожує самі звуки, позбавляючи гравця можливості чути наближення атак"],
  },
});

/* monsters/maty-pavuchykha.js */
Atlas.registerMonster({
  format: 1,
  id: "maty-pavuchykha",
  name: "Мати-Павучиха",
  kind: "boss",
  nature: "threat",
  alias: "Шелоб",
  spawn: { biomes: ["forest", "taiga", "enchanted"], worlds: "all" },
  order: 68,
});

/* monsters/maty-vsikh-lisiv.js */
Atlas.registerMonster({
  format: 1,
  id: "maty-vsikh-lisiv",
  name: "Мати Всіх Лісів",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga", "enchanted", "jungle"], worlds: "all" },
  order: 102,
});

/* monsters/mayster-nezavershenoyi-fresky.js */
Atlas.registerMonster({
  "format": 2,
  "id": "mayster-nezavershenoyi-fresky",
  "name": "Майстер Незавершеної Фрески",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "syni-freskovi-skeli",
      "chervoni-malyarni-dolyny",
      "zoloti-khramovi-terasy",
      "chornylni-pechery"
    ],
    "worlds": [
      "malvar"
    ]
  },
  "order": 881,
  "lore": {
    "description": "Бос світу «Мальвар»."
  }
});

/* monsters/mayster-obpalenoyi-vezhi.js */
Atlas.registerMonster({
  "format": 2,
  "id": "mayster-obpalenoyi-vezhi",
  "name": "Майстер Обпаленої Вежі",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "chervoni-hlynyani-bashty",
      "bili-sukhi-terasy",
      "hlybynni-yary",
      "zeleni-oazy",
      "bili-portselyanovi-stepy",
      "kobaltovi-yary",
      "rozhevi-karyery",
      "chorni-vypalyuvalni-pechery"
    ],
    "worlds": [
      "hlynyshche"
    ]
  },
  "order": 824,
  "lore": {
    "description": "Бос світу «Глинище»."
  }
});

/* monsters/mayster-ostannoho-zhynu.js */
Atlas.registerMonster({
  "format": 2,
  "id": "mayster-ostannoho-zhynu",
  "name": "Майстер Останнього Згину",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "bili-paperovi-skeli",
      "riznokolorovi-terasy",
      "vitryani-stepy",
      "temni-sharovi-pechery"
    ],
    "worlds": [
      "paperon"
    ]
  },
  "order": 851,
  "lore": {
    "description": "Бос світу «Паперон»."
  }
});

/* monsters/mayster-tysyachi-cherepkiv.js */
Atlas.registerMonster({
  "format": 2,
  "id": "mayster-tysyachi-cherepkiv",
  "name": "Майстер Тисячі Черепків",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "chervoni-hlynyani-bashty",
      "bili-sukhi-terasy",
      "hlybynni-yary",
      "zeleni-oazy",
      "bili-portselyanovi-stepy",
      "kobaltovi-yary",
      "rozhevi-karyery",
      "chorni-vypalyuvalni-pechery"
    ],
    "worlds": [
      "hlynyshche"
    ]
  },
  "order": 825,
  "lore": {
    "description": "Бос світу «Глинище»."
  }
});

/* monsters/mayster-zruynovanoho-shlyuzu.js */
Atlas.registerMonster({
  "format": 2,
  "id": "mayster-zruynovanoho-shlyuzu",
  "name": "Майстер Зруйнованого Шлюзу",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "kanalni-stepy",
      "vodyani-terasy",
      "sukhi-vodoskhovyshcha",
      "arkhitekturni-kanyony"
    ],
    "worlds": [
      "akvedor"
    ]
  },
  "order": 875,
  "lore": {
    "description": "Бос світу «Акведор»."
  }
});

/* monsters/medovyy-borsuk-mokhovyk.js */
Atlas.registerMonster({
  format: 2,
  id: "medovyy-borsuk-mokhovyk",
  name: "Медовий борсук-моховик",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga", "hills"], worlds: "all" },
  order: 629,
  lore: {
    description: "Коротколапий звір із зеленою шерстю.",
    behavior: "Мохові пагорби.",
    abilities: ["риє гнізда комах і агресивно захищає знайдені запаси"],
  },
});

/* monsters/medovyy-hrabizhnyk.js */
Atlas.registerMonster({
  format: 2,
  id: "medovyy-hrabizhnyk",
  name: "Медовий грабіжник",
  kind: "monster",
  nature: "threat",
  variants: ["медовий грабіжник", "медовий Пильник"],
  spawn: { biomes: ["forest", "taiga"], worlds: "all" },
  order: 642,
  lore: {
    description: "Жук із прозорим черевцем, наповненим золотистою рідиною. Об'єднує схожих істот: медовий грабіжник, медовий Пильник.",
    behavior: "Порожнисті дерева. Живе у величезних вуликах серед бурштинових дерев.",
    abilities: ["медовий грабіжник: розбризкує липкий мед, що уповільнює рух", "медовий Пильник: розбризкує липкий мед, що сповільнює рух, а сама пересувається по липких слідах, не втрачаючи швидкості"],
  },
});

/* monsters/meduza.js */
Atlas.registerMonster({
  format: 2,
  id: "meduza",
  name: "Медуза",
  kind: "monster",
  nature: "threat",
  variants: ["медуза-паралізатор", "мініатюрна медуза"],
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 416,
  lore: {
    description: "Морська істота. Об'єднує схожих істот: медуза-паралізатор, мініатюрна медуза.",
    behavior: "Зустрічається: теплі моря, підводні печери; мілководдя.",
    abilities: ["паралізувальні щупальця", "отруйна хмара", "слабке жалення щупальцями"],
  },
});

/* monsters/meduzka-lunnoho-pylu.js */
Atlas.registerMonster({
  format: 2,
  id: "meduzka-lunnoho-pylu",
  name: "Медузка Лунного Пилу",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills", "wasteland"], worlds: "all" },
  order: 920,
  lore: {
    description: "Крихітна літаюча істота з прозорою кубічною шапкою та ниткоподібними щупальцями.",
    behavior: "З'являється вночі над руїнами на високих плато.",
    abilities: ["накопичує місячний пил на щупальцях і випускає короткі спалахи, які тимчасово підсвічують невидимі сліди"],
  },
});

/* monsters/meha-akula.js */
Atlas.registerMonster({
  format: 1,
  id: "meha-akula",
  name: "Мега-Акула",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["deep"], worlds: "all" },
  order: 94,
});

/* monsters/mehalodony.js */
Atlas.registerMonster({
  format: 1,
  id: "mehalodony",
  name: "мегалодони",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["deep"], worlds: "all" },
  order: 42,
});

/* monsters/mekhanichni-khyzhaky.js */
Atlas.registerMonster({
  "format": 2,
  "id": "mekhanichni-khyzhaky",
  "name": "Механічні хижаки",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "shesterenni-pahorby",
      "midni-lisy",
      "pruzhynni-bolota",
      "mayatnykovi-ushchelyny",
      "zaly-pershotvortsiv"
    ],
    "worlds": [
      "kaldras"
    ]
  },
  "order": 713,
  "lore": {
    "description": "Загроза світу «Кальдрас»."
  }
});

/* monsters/metelyk.js */
Atlas.registerMonster({
  format: 2,
  id: "metelyk",
  name: "Метелик",
  kind: "weak",
  nature: "magic",
  variants: ["вогняний метелик", "крижаний метелик", "отруйний метелик"],
  spawn: { biomes: ["volcanic", "ashlands", "hills", "mountain"], worlds: "all" },
  order: 393,
  lore: {
    description: "Магічна комаха. Об'єднує схожих істот: вогняний метелик, крижаний метелик, отруйний метелик.",
    behavior: "Зустрічається: вулканічні луки; тундра, крижані печери; джунглі.",
    abilities: ["підпалює суху траву", "залишає жаркі частинки", "сповільнює холодним пилком", "токсичний пилок", "маскування серед квітів"],
  },
});

/* monsters/meteorni-zhuky.js */
Atlas.registerMonster({
  "format": 2,
  "id": "meteorni-zhuky",
  "name": "Метеорні жуки",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "meteorni-rivnyny",
      "chorni-kratery",
      "sklyani-polya",
      "stari-udarni-hory",
      "midni-dolyny",
      "irzhavi-lisy",
      "sribni-plato",
      "kraterni-bolota"
    ],
    "worlds": [
      "asterfell"
    ]
  },
  "order": 802,
  "lore": {
    "description": "Загроза світу «Астерфелл»."
  }
});

/* monsters/midna-babka.js */
Atlas.registerMonster({
  format: 2,
  id: "midna-babka",
  name: "Мідна бабка",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 651,
  lore: {
    description: "Велика бабка з металевими крилами.",
    behavior: "Мілкі річки.",
    abilities: ["зависає нерухомо, а потім атакує прямолінійним ривком"],
  },
});

/* monsters/midna-osa-rozvidnyk.js */
Atlas.registerMonster({
  format: 2,
  id: "midna-osa-rozvidnyk",
  name: "Мідна оса-розвідник",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 539,
  lore: {
    description: "Велика металева комаха.",
    behavior: "Старі рудники.",
    abilities: ["позначає цілі світними краплями, за якими її рій завдає точніших ударів"],
  },
});

/* monsters/midnohlot.js */
Atlas.registerMonster({
  format: 2,
  id: "midnohlot",
  name: "Мідноглот",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 756,
  lore: {
    description: "Шестиногий бронзовий звір із черевом, що світиться крізь щілини, та панциром зі старих лицарських щитів.",
    behavior: "Охороняє поховану Королівську ливарню.",
    abilities: ["ковтає зачаровані удари, накопичує їхню силу й випльовує розплавлені металеві брили"],
  },
});

/* monsters/midnokrylyy-krykun.js */
Atlas.registerMonster({
  format: 2,
  id: "midnokrylyy-krykun",
  name: "Міднокрилий Крикун",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills", "grass"], worlds: "all" },
  order: 864,
  lore: {
    description: "Хижий птах із широкими мідними крилами та вузьким квадратним дзьобом.",
    behavior: "Гніздиться на вежах над золотими рівнинами.",
    abilities: ["розгортає крила й відбиває сонячне світло в очі ворогам, після чого пікірує з боку сонця"],
  },
});

/* monsters/midnolobyy-nosorih.js */
Atlas.registerMonster({
  format: 2,
  id: "midnolobyy-nosorih",
  name: "Міднолобий носоріг",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 505,
  lore: {
    description: "Важкий звір із металевою лобовою пластиною.",
    behavior: "Мідні каньйони.",
    abilities: ["розганяється прямою лінією, змушуючи ворога використовувати перешкоди"],
  },
});

/* monsters/midnyy-husar.js */
Atlas.registerMonster({
  format: 2,
  id: "midnyy-husar",
  name: "Мідний Гусар",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["grass", "hills"], worlds: "all" },
  order: 775,
  lore: {
    description: "Двоногий дуелянт у мідних пластинах, із порожнистим списом, що нагадує водостічну трубу.",
    behavior: "Патрулює старий лицарський плац.",
    abilities: ["перед атакою креслить на землі прямі лінії, після чого мчить ними без можливості різко повернути"],
  },
});

/* monsters/midnyy-korol-bez-tronu.js */
Atlas.registerMonster({
  format: 2,
  id: "midnyy-korol-bez-tronu",
  name: "Мідний король без трону",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 477,
  lore: {
    description: "Чотириногий механічно-органічний звір із живими металевими ребрами.",
    behavior: "Старі мідні шахти.",
    abilities: ["відбиває магічні снаряди й повертає їх із затримкою"],
  },
});

/* monsters/midnyy-kulkach.js */
Atlas.registerMonster({
  format: 2,
  id: "midnyy-kulkach",
  name: "Мідний Кулькач",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["volcanic", "ashlands", "hills"], worlds: "all" },
  order: 928,
  lore: {
    description: "Маленький круглий монстр із мідних пластинок, що з'єднані рухомими заклепками.",
    behavior: "Мешкає в майстернях стародавніх ковалів.",
    abilities: ["котиться по металевих поверхнях і збирає уламки, а коли накопичує їх забагато, втрачає рівновагу й перевертається"],
  },
});

/* monsters/mineralni-zhuky.js */
Atlas.registerMonster({
  "format": 2,
  "id": "mineralni-zhuky",
  "name": "Мінеральні жуки",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "midni-hrebeni",
      "zeleni-malakhitovi-skhyly",
      "fioletovi-zhyly",
      "siri-shakhtarski-dolyny",
      "kobaltovi-ustupy",
      "syni-karyery",
      "kryshtalevi-pechery",
      "temni-hirski-sela"
    ],
    "worlds": [
      "rudozir"
    ]
  },
  "order": 891,
  "lore": {
    "description": "Загроза світу «Рудозір»."
  }
});

/* monsters/miniatyurnyy-hlynyanyk.js */
Atlas.registerMonster({
  format: 2,
  id: "miniatyurnyy-hlynyanyk",
  name: "Мініатюрний глиняник",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 730,
  lore: {
    description: "Крихітна глиняна істота з тріснутою головою.",
    behavior: "Глиняні яри.",
    abilities: ["розсипається на грудочки й повільно збирається знову"],
  },
});

/* monsters/miniatyurnyy-koralovyy-strybun.js */
Atlas.registerMonster({
  format: 2,
  id: "miniatyurnyy-koralovyy-strybun",
  name: "Мініатюрний Кораловий Стрибун",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 932,
  lore: {
    description: "Маленький краб із рожевого коралу та білих піщаних клешень.",
    behavior: "Живе в мілких лагунах серед уламків мушель.",
    abilities: ["стрибає між камінням і піднімає короткі хмарки піску, які приховують його напрямок руху"],
  },
});

/* monsters/minlyvi-khyzhaky.js */
Atlas.registerMonster({
  "format": 2,
  "id": "minlyvi-khyzhaky",
  "name": "Мінливі хижаки",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "nedobudovani-hory",
      "spiralni-lisy",
      "dolyny-myakoho-kamenyu",
      "krystalichni-perekhody",
      "porozhni-formy"
    ],
    "worlds": [
      "eydoliya"
    ]
  },
  "order": 766,
  "lore": {
    "description": "Загроза світу «Ейдолія»."
  }
});

/* monsters/minlyvi-kopiyi-hravtsya.js */
Atlas.registerMonster({
  "format": 2,
  "id": "minlyvi-kopiyi-hravtsya",
  "name": "Мінливі копії гравця",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "usmikhneni-lisy",
      "strakhitlyvi-pahorby",
      "dzerkalni-rivnyny",
      "dolyny-spokoyu",
      "maskovi-hory"
    ],
    "worlds": [
      "kernalis"
    ]
  },
  "order": 758,
  "lore": {
    "description": "Загроза світу «Керналіс»."
  }
});

/* monsters/mishkoholovyy-hrabizhnyk.js */
Atlas.registerMonster({
  format: 2,
  id: "mishkoholovyy-hrabizhnyk",
  name: "Мішкоголовий грабіжник",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 574,
  lore: {
    description: "Маленький гуманоїд із тканинним мішком замість голови.",
    behavior: "Покинуті базари.",
    abilities: ["ховає здобич усередині мішка й кидається піском"],
  },
});

/* monsters/mist-predator.js */
Atlas.registerMonster({
  "format": 2,
  "id": "mist-predator",
  "name": "Туманний хижак",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "blue-hollows",
      "soft-cloud-meadows"
    ],
    "worlds": [
      "neborid"
    ]
  },
  "order": 235,
  "lore": {
    "description": "Хижак, що ховається в щільних хмарах і нападає зненацька.",
    "behavior": "Невидимий у тумані.",
    "abilities": [
      "зникнення в тумані",
      "засідка"
    ],
    "drops": [
      "туманна пара"
    ]
  }
});

/* monsters/misyachna-hidra.js */
Atlas.registerMonster({
  format: 2,
  id: "misyachna-hidra",
  name: "Місячна гідра",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 250,
  lore: {
    description: "Багатоголовий водний дракон.",
    behavior: "Зустрічається: темні озера, затоплені кратери.",
    abilities: ["відростання голів", "крижане дихання", "отруйний туман"],
  },
});

/* monsters/misyatsekhid-tykhykh-dzerkal.js */
Atlas.registerMonster({
  format: 2,
  id: "misyatsekhid-tykhykh-dzerkal",
  name: "Місяцехід Тихих Дзеркал",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills", "wasteland", "grass"], worlds: "all" },
  order: 849,
  lore: {
    description: "Довгонога істота з білих кам'яних дисків замість суглобів і гладкої дзеркальної голови.",
    behavior: "Блукає руїнами обсерваторії на безповітряному магічному плато.",
    abilities: ["створює копії арени, які змінюють розташування справжніх платформ, змушуючи гравця орієнтуватися за рухом місяця"],
  },
});

/* monsters/mlynovi-holemy.js */
Atlas.registerMonster({
  "format": 2,
  "id": "mlynovi-holemy",
  "name": "Млинові големи",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "zhovti-zhornovi-polya",
      "kamyani-mlynovi-pahorby",
      "vysoki-travyani-stepy",
      "zernoskhovyshcha-pidzemel"
    ],
    "worlds": [
      "zhornoverkh"
    ]
  },
  "order": 886,
  "lore": {
    "description": "Загроза світу «Жорноверх»."
  }
});

/* monsters/mokhova-zhabura.js */
Atlas.registerMonster({
  "format": 2,
  "id": "mokhova-zhabura",
  "name": "Мохова жабура",
  "kind": "weak",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "tag:swamp",
      "tag:wet"
    ],
    "worlds": "all"
  },
  "order": 944,
  "lore": {
    "description": "Товста жабка з мохом замість шкіри.",
    "behavior": "Сидить на купинах, квакає, коли хтось поруч.",
    "abilities": [
      "стрибає, ляскаючи язиком по ногах"
    ],
    "drops": [
      "мох",
      "жаб'яче стегно"
    ]
  }
});

/* monsters/mokhovyy-maskaron.js */
Atlas.registerMonster({
  format: 2,
  id: "mokhovyy-maskaron",
  name: "Моховий маскарон",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga", "wasteland", "hills"], worlds: "all" },
  order: 557,
  lore: {
    description: "Кам’яна голова на довгих ногах.",
    behavior: "Руїни, порослі мохом.",
    abilities: ["зливається зі стінами й плюється густою зеленою масою"],
  },
});

/* monsters/mokhovyy-poshtar.js */
Atlas.registerMonster({
  format: 2,
  id: "mokhovyy-poshtar",
  name: "Моховий Поштар",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga", "wasteland", "hills"], worlds: "all" },
  order: 886,
  lore: {
    description: "Кумедна двонога істота з великою головою, вкритою мохом, і сумкою з листя на спині.",
    behavior: "Мешкає на стежках між лісовими поселеннями.",
    abilities: ["краде дрібні предмети й переносить їх у випадкові схованки, а при переслідуванні кидає насіння, з якого миттєво виростають перешкоди"],
  },
});

/* monsters/mokryy-plashch.js */
Atlas.registerMonster({
  format: 2,
  id: "mokryy-plashch",
  name: "Мокрий Плащ",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 872,
  lore: {
    description: "Невеликий водяний хижак, що нагадує темно-зелену тканину з чотирма прихованими кінцівками.",
    behavior: "Трапляється у старих каналах і затоплених підвалах.",
    abilities: ["розстеляється по поверхні води й затягує здобич під себе, але на суші повільно повзе складками"],
  },
});

/* monsters/molochnyy-slyz.js */
Atlas.registerMonster({
  format: 2,
  id: "molochnyy-slyz",
  name: "Молочний слиз",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 572,
  lore: {
    description: "Біла напівпрозора істота, що ділиться на маленькі краплі після удару.",
    behavior: "Підземні джерела.",
    abilities: ["знову зливається, якщо краплі не розігнати"],
  },
});

/* monsters/molyusk-strilets.js */
Atlas.registerMonster({
  format: 2,
  id: "molyusk-strilets",
  name: "Молюск-стрілець",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 418,
  lore: {
    description: "Морська істота.",
    behavior: "Зустрічається: коралові рифи.",
    abilities: ["стріляє гострими мушлями", "ховається в панцирі"],
  },
});

/* monsters/monakh-mertvykh-dzvoniv.js */
Atlas.registerMonster({
  format: 2,
  id: "monakh-mertvykh-dzvoniv",
  name: "Монах Мертвих Дзвонів",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills", "mountain"], worlds: "all" },
  order: 767,
  lore: {
    description: "Висока фігура в багатошаровому полотняному одязі, з порожнистою бронзовою головою-дзвоном і руками, складеними як для молитви.",
    behavior: "Бродить дзвіницею підземних катакомб.",
    abilities: ["поглинає звуки навколо, зупиняючи звукові атаки й послаблюючи заклинання, а потім вивільняє накопичену тишу ударною хвилею"],
  },
});

/* monsters/moroznyy-dzygar.js */
Atlas.registerMonster({
  format: 2,
  id: "moroznyy-dzygar",
  name: "Морозний дзиґар",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 521,
  lore: {
    description: "Маленький звір із крижаним спіральним панциром.",
    behavior: "Замерзлі озера.",
    abilities: ["крутиться на місці й розлітається крижаними уламками"],
  },
});

/* monsters/moroznyy-lytsar.js */
Atlas.registerMonster({
  format: 2,
  id: "moroznyy-lytsar",
  name: "Морозний лицар",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["peaks", "snow", "wasteland", "hills"], worlds: "all" },
  order: 307,
  lore: {
    description: "Неживий воїн.",
    behavior: "Зустрічається: крижані фортеці.",
    abilities: ["заморожує землю", "атакує крижаним списом"],
  },
});

/* monsters/moroznyy-mamont-vozhd.js */
Atlas.registerMonster({
  format: 2,
  id: "moroznyy-mamont-vozhd",
  name: "Морозний мамонт-вождь",
  kind: "boss",
  nature: "threat",
  spawn: { biomes: ["grass", "snow"], worlds: "all" },
  order: 278,
  lore: {
    description: "Гігантський звір.",
    behavior: "Зустрічається: засніжені долини.",
    abilities: ["крижані хвилі", "таран", "заклик стада"],
  },
});

/* monsters/morozylnyi-vedmid.js */
Atlas.registerMonster({
  "format": 2,
  "id": "morozylnyi-vedmid",
  "name": "Морозильний ведмідь",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "tag:cold"
    ],
    "worlds": "all"
  },
  "order": 970,
  "lore": {
    "description": "Здоровенний білий ведмідь із крижаним панцирем.",
    "behavior": "Стереже озера з крижаними печерами.",
    "abilities": [
      "крижаний подих",
      "удар лапою, що заморожує"
    ],
    "drops": [
      "ведмежа шкура",
      "льодяний кіготь"
    ]
  }
});

/* monsters/morska-holka.js */
Atlas.registerMonster({
  format: 2,
  id: "morska-holka",
  name: "Морська голка",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 550,
  lore: {
    description: "Довга риба з надзвичайно гострим кістяним носом.",
    behavior: "Холодні прибережні течії.",
    abilities: ["стрімко пробиває воду й атакує з-під поверхні"],
  },
});

/* monsters/morski-chervyaky.js */
Atlas.registerMonster({
  format: 1,
  id: "morski-chervyaky",
  name: "морські черв'яки",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["deep"], worlds: "all" },
  order: 35,
});

/* monsters/morski-guli.js */
Atlas.registerMonster({
  format: 1,
  id: "morski-guli",
  name: "морські ґулі",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["deep"], worlds: "all" },
  order: 46,
});

/* monsters/morski-vayverny.js */
Atlas.registerMonster({
  format: 1,
  id: "morski-vayverny",
  name: "морські вайверни",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["deep"], worlds: "all" },
  order: 44,
});

/* monsters/morski-zmiyi.js */
Atlas.registerMonster({
  format: 1,
  id: "morski-zmiyi",
  name: "морські змії",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["deep"], worlds: "all" },
  order: 40,
});

/* monsters/morskyy-avatar.js */
Atlas.registerMonster({
  format: 1,
  id: "morskyy-avatar",
  name: "Морський Аватар",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["deep"], worlds: "all" },
  order: 96,
});

/* monsters/morskyy-chort.js */
Atlas.registerMonster({
  format: 1,
  id: "morskyy-chort",
  name: "Морський Чорт",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["deep"], worlds: "all" },
  order: 93,
});

/* monsters/morskyy-hlynyanyk.js */
Atlas.registerMonster({
  format: 2,
  id: "morskyy-hlynyanyk",
  name: "Морський глиняник",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["sea"], worlds: "all" },
  order: 695,
  lore: {
    description: "Амфібій, покритий липкою глиною.",
    behavior: "Глинисті узбережжя.",
    abilities: ["кидає глиняні грудки, що твердіють у воді"],
  },
});

/* monsters/morskyy-hudun.js */
Atlas.registerMonster({
  format: 2,
  id: "morskyy-hudun",
  name: "Морський Гудун",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga", "sea"], worlds: "all" },
  order: 923,
  lore: {
    description: "Невеликий округлий морський звір із синьо-сірими боками та великими порожнистими ніздрями.",
    behavior: "Мешкає у водоростевих лісах.",
    abilities: ["випускає низький гул, що змушує дрібних риб розбігатися й розгойдує водорості, відкриваючи приховані проходи"],
  },
});

/* monsters/morskyy-myslyvets-iz-harpunom.js */
Atlas.registerMonster({
  format: 2,
  id: "morskyy-myslyvets-iz-harpunom",
  name: "Морський мисливець із гарпуном",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 348,
  lore: {
    description: "Елітний водний гуманоїд.",
    behavior: "Зустрічається: рифи, прибережні печери.",
    abilities: ["гарпун", "сітка", "засідки з води"],
  },
});

/* monsters/morskyy-pirat-abordazhnyk.js */
Atlas.registerMonster({
  format: 2,
  id: "morskyy-pirat-abordazhnyk",
  name: "Морський пірат-абордажник",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 368,
  lore: {
    description: "Звичайний гуманоїд.",
    behavior: "Зустрічається: пляжі, корабельні руїни.",
    abilities: ["шабля", "гак", "короткі ривки"],
  },
});

/* monsters/morskyy-plashch.js */
Atlas.registerMonster({
  format: 2,
  id: "morskyy-plashch",
  name: "Морський плащ",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 702,
  lore: {
    description: "Пласка м’якотіла істота, що накриває камені широким тілом.",
    behavior: "Рифові печери.",
    abilities: ["розправляє краї як хвилі та штовхає супротивника"],
  },
});

/* monsters/morskyy-viyalnyk.js */
Atlas.registerMonster({
  format: 2,
  id: "morskyy-viyalnyk",
  name: "Морський віялник",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 681,
  lore: {
    description: "Істота з вісьмома широкими плавниками.",
    behavior: "Підводні ущелини.",
    abilities: ["різкими рухами створює локальні течії"],
  },
});

/* monsters/morskyy-yizhak-mina.js */
Atlas.registerMonster({
  format: 2,
  id: "morskyy-yizhak-mina",
  name: "Морський їжак-міна",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 424,
  lore: {
    description: "Морська істота.",
    behavior: "Зустрічається: мілководні рифи.",
    abilities: ["вибухає голками при наближенні"],
  },
});

/* monsters/morskyy-zmiy-yormunhand.js */
Atlas.registerMonster({
  format: 1,
  id: "morskyy-zmiy-yormunhand",
  name: "Морський змій Йормунганд",
  kind: "boss",
  nature: "threat",
  spawn: { biomes: ["deep"], worlds: "all" },
  order: 86,
});

/* monsters/mostovi-hrabizhnyky.js */
Atlas.registerMonster({
  "format": 2,
  "id": "mostovi-hrabizhnyky",
  "name": "Мостові грабіжники",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "chervoni-ustupy",
      "hlyboki-yary",
      "mokhovi-terasy",
      "sonyachni-kamyani-mosty",
      "vysoki-viaduky",
      "zeleni-ustupy",
      "kamyani-perevaly",
      "zabuti-mostovi-mista"
    ],
    "worlds": [
      "hlybokray"
    ]
  },
  "order": 846,
  "lore": {
    "description": "Загроза світу «Глибокрай»."
  }
});

/* monsters/mostovyi-strazh.js */
Atlas.registerMonster({
  "format": 2,
  "id": "mostovyi-strazh",
  "name": "Мостовий страж",
  "kind": "mini-boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "tag:cloud"
    ],
    "worlds": "all"
  },
  "order": 938,
  "lore": {
    "description": "Кам'яний гуманоїд-арка, що стоїть посеред вузького природного мосту.",
    "behavior": "Не пускає тих, хто не поклав дар на камінь, і скидає порушників у прірву.",
    "abilities": [
      "розширює себе й перекриває міст",
      "відштовхує ударною хвилею"
    ],
    "drops": [
      "мостовий камінь",
      "жила-ключ"
    ]
  }
});

/* monsters/motuzyanyy-povzun.js */
Atlas.registerMonster({
  format: 2,
  id: "motuzyanyy-povzun",
  name: "Мотузяний повзун",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills", "grass"], worlds: "all" },
  order: 604,
  lore: {
    description: "Довга істота, сплетена з сухих ліан.",
    behavior: "Покинуті підвішені мости.",
    abilities: ["пролазить крізь отвори й хапає предмети петлями"],
  },
});

/* monsters/movchaznyy-volodar-porohiv.js */
Atlas.registerMonster({
  format: 2,
  id: "movchaznyy-volodar-porohiv",
  name: "Мовчазний володар порогів",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["grass", "hills"], worlds: "all" },
  order: 481,
  lore: {
    description: "Висока безрука істота з десятками дверей на спині.",
    behavior: "Замок нескінченних порогів.",
    abilities: ["відкриває короткочасні проходи, з яких атакують істоти з інших місць"],
  },
});

/* monsters/mozayichna-antylopa.js */
Atlas.registerMonster({
  format: 2,
  id: "mozayichna-antylopa",
  name: "Мозаїчна антилопа",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga", "savanna"], worlds: "all" },
  order: 633,
  lore: {
    description: "Травоїдна тварина з кольоровими квадратними плямами.",
    behavior: "Квітчасті савани.",
    abilities: ["плями змінюють яскравість, збиваючи прицілювання"],
  },
});

/* monsters/mulovyy-kovtach.js */
Atlas.registerMonster({
  format: 2,
  id: "mulovyy-kovtach",
  name: "Муловий ковтач",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 689,
  lore: {
    description: "Круглий донний монстр із широким ротом.",
    behavior: "Замулені дельти.",
    abilities: ["всмоктує мул разом із дрібними предметами й випльовує його хмарами"],
  },
});

/* monsters/murakhoyid.js */
Atlas.registerMonster({
  format: 2,
  id: "murakhoyid",
  name: "Мурахоїд",
  kind: "weak",
  nature: "threat",
  variants: ["гігантський мурахоїд", "золотоспинний мурахоїд"],
  spawn: { biomes: ["jungle", "forest", "taiga", "grass"], worlds: "all" },
  order: 388,
  lore: {
    description: "Звір. Об'єднує схожих істот: гігантський мурахоїд, золотоспинний мурахоїд.",
    behavior: "Зустрічається: тропічні ліси; Теплі лісові галявини.",
    abilities: ["довгий язик", "сильні кігті", "золотоспинний мурахоїд: витягує довгий язик, що прилипає до цілі"],
  },
});

/* monsters/murashynyy-lytnyk.js */
Atlas.registerMonster({
  format: 2,
  id: "murashynyy-lytnyk",
  name: "Мурашиний Литник",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 809,
  lore: {
    description: "Колонія крихітних бронзових мурах із розпеченими зернятками руди в щелепах.",
    behavior: "Мешкають у тунелях під рудними святинями.",
    abilities: ["зносять мінерали в одну точку та швидко виливають низеньку металеву стіну, що перегороджує проходи"],
  },
});

/* monsters/mushelnyy-sadivnyk.js */
Atlas.registerMonster({
  format: 2,
  id: "mushelnyy-sadivnyk",
  name: "Мушельний Садівник",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 894,
  lore: {
    description: "Повільний морський гуманоїд із панциром, складеним із багатьох мушель різного розміру.",
    behavior: "Живе в затонулих садах.",
    abilities: ["прикріплює мушлі до каменів, створюючи живі укриття, а в бою закривається ними, поки гравець не знищить зовнішній шар"],
  },
});

/* monsters/mushlya-pastka.js */
Atlas.registerMonster({
  format: 2,
  id: "mushlya-pastka",
  name: "Мушля-пастка",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 431,
  lore: {
    description: "Молюск-хижак.",
    behavior: "Зустрічається: підводні руїни.",
    abilities: ["різко змикає стулки", "захоплює здобич"],
  },
});

/* monsters/mushlyanyy-kydalnyk.js */
Atlas.registerMonster({
  format: 2,
  id: "mushlyanyy-kydalnyk",
  name: "Мушляний кидальник",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 561,
  lore: {
    description: "Краб із кількома запасними мушлями на панцирі.",
    behavior: "Кам’янисті пляжі.",
    abilities: ["жбурляє їх у ворога, а потім ховається в одну з них"],
  },
});

/* monsters/mushlyanyy-strybach.js */
Atlas.registerMonster({
  format: 2,
  id: "mushlyanyy-strybach",
  name: "Мушляний стрибач",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 696,
  lore: {
    description: "Маленький морський молюск із пружною ніжкою.",
    behavior: "Припливні калюжі.",
    abilities: ["вистрибує з води й ударяє твердою мушлею"],
  },
});

/* monsters/mushlyastyy-zemlekop.js */
Atlas.registerMonster({
  format: 2,
  id: "mushlyastyy-zemlekop",
  name: "Мушлястий землекоп",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills", "desert"], worlds: "all" },
  order: 530,
  lore: {
    description: "Коротколапий підземний звір із мушлею, схожою на бур.",
    behavior: "Піщані печери.",
    abilities: ["вилазить під ногами й розкидає грудки ґрунту"],
  },
});

/* monsters/myslyvets-na-misyatsi.js */
Atlas.registerMonster({
  format: 2,
  id: "myslyvets-na-misyatsi",
  name: "Мисливець на місяці",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 473,
  lore: {
    description: "Стрункий звір із серпоподібними рогами.",
    behavior: "Нічні плато.",
    abilities: ["створює фальшиві місяці, які падають на арену як вибухові снаряди"],
  },
});

/* monsters/myslyvtsi-z-vodospadiv.js */
Atlas.registerMonster({
  "format": 2,
  "id": "myslyvtsi-z-vodospadiv",
  "name": "Мисливці з водоспадів",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "solyani-dzvony",
      "povitryani-ryfy",
      "vodospadni-dzhunhli",
      "blue-hollows",
      "arkhipelahy-plavayuchoho-mulu",
      "vertykalni-dzhunhli",
      "dolyny-vyskhidnoyi-vody",
      "khmarni-arkhipelahy",
      "kamyani-richkovi-ushchelyny",
      "nebesni-bolota"
    ],
    "worlds": [
      "solemor"
    ]
  },
  "order": 708,
  "lore": {
    "description": "Загроза світу «Солемор»."
  }
});

/* monsters/nebesnyy-providnyk.js */
Atlas.registerMonster({
  "format": 2,
  "id": "nebesnyy-providnyk",
  "name": "Небесний Провідник",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "synohromovi-stepy",
      "sklyani-kanyony",
      "burshtynovi-vysoty",
      "hromovi-bolota",
      "chorni-providni-pechery",
      "hromovi-stepy",
      "chorni-plato",
      "sukhi-veresovyshcha",
      "dolyny-blyskavychnoho-kamenyu"
    ],
    "worlds": [
      "eshkariya"
    ]
  },
  "order": 718,
  "lore": {
    "description": "Небесний Провідник керує блискавками на всій арені."
  }
});

/* monsters/nebesnyy-zmiy.js */
Atlas.registerMonster({
  format: 2,
  id: "nebesnyy-zmiy",
  name: "Небесний змій",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["peaks"], worlds: "all" },
  order: 247,
  lore: {
    description: "Літаючий драконоподібний колос.",
    behavior: "Зустрічається: небесні острови, вершини хмар.",
    abilities: ["блискавки", "урагани", "руйнівні пікірування"],
  },
});

/* monsters/neptun.js */
Atlas.registerMonster({
  format: 1,
  id: "neptun",
  name: "Нептун",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["deep"], worlds: "all" },
  order: 90,
});

/* monsters/nest-devourer.js */
Atlas.registerMonster({
  "format": 2,
  "id": "nest-devourer",
  "name": "Пожирач Гнізд",
  "kind": "super-boss",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "root-coasts",
      "dead-crown"
    ],
    "worlds": [
      "astrakor"
    ]
  },
  "order": 207,
  "lore": {
    "description": "Безформна істота, що ховається в темряві за краями материка й пожирає гнізда.",
    "behavior": "Нападає на гнізда й поселення з-за краю; видно лише його сліди й тінь.",
    "abilities": [
      "поглинання",
      "темна хмара",
      "виривання коренів"
    ],
    "drops": [
      "реліквії зжертих гнізд"
    ]
  }
});

/* monsters/nestabilni-holemy.js */
Atlas.registerMonster({
  "format": 2,
  "id": "nestabilni-holemy",
  "name": "Нестабільні големи",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "nedobudovani-hory",
      "spiralni-lisy",
      "dolyny-myakoho-kamenyu",
      "krystalichni-perekhody",
      "porozhni-formy"
    ],
    "worlds": [
      "eydoliya"
    ]
  },
  "order": 767,
  "lore": {
    "description": "Загроза світу «Ейдолія»."
  }
});

/* monsters/nezavershenyy-tvorets.js */
Atlas.registerMonster({
  "format": 2,
  "id": "nezavershenyy-tvorets",
  "name": "Незавершений Творець",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "nedobudovani-hory",
      "spiralni-lisy",
      "dolyny-myakoho-kamenyu",
      "krystalichni-perekhody",
      "porozhni-formy"
    ],
    "worlds": [
      "eydoliya"
    ]
  },
  "order": 768,
  "lore": {
    "description": "Бос світу «Ейдолія»."
  }
});

/* monsters/nichna-mantykora.js */
Atlas.registerMonster({
  format: 2,
  id: "nichna-mantykora",
  name: "Нічна мантикора",
  kind: "boss",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 292,
  lore: {
    description: "Крилатий хижак.",
    behavior: "Зустрічається: темні каньйони.",
    abilities: ["отруйні шипи хвоста", "пікірування", "нічна невидимість"],
  },
});

/* monsters/nichni-khyzhaky.js */
Atlas.registerMonster({
  "format": 2,
  "id": "nichni-khyzhaky",
  "name": "Нічні хижаки",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "midni-veresovyshcha",
      "bahryani-sosny",
      "sutinkovi-stepy",
      "syni-nichni-bolota",
      "kray-chornoho-sontsya"
    ],
    "worlds": [
      "vespern"
    ]
  },
  "order": 734,
  "lore": {
    "description": "Загроза світу «Весперн»."
  }
});

/* monsters/nichnyy-kresalnyk.js */
Atlas.registerMonster({
  format: 2,
  id: "nichnyy-kresalnyk",
  name: "Нічний Кресальник",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["volcanic", "ashlands", "forest"], worlds: "all" },
  order: 801,
  lore: {
    description: "Лисоподібний звір із залізним зубом і крем’яними наростами на щоках.",
    behavior: "Виходить на полювання в сутінках вулканічних чагарників.",
    abilities: ["треться ними об землю, створюючи короткі віяла іскор, що займають сухе листя та відтинають переслідувачам шлях"],
  },
});

/* monsters/nichnyy-pastukh-kazhaniv.js */
Atlas.registerMonster({
  format: 2,
  id: "nichnyy-pastukh-kazhaniv",
  name: "Нічний пастух кажанів",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills", "grass"], worlds: "all" },
  order: 504,
  lore: {
    description: "Високий звір із шкіряною накидкою-крилами.",
    behavior: "Печерні долини.",
    abilities: ["керує хмарами дрібних кажаноподібних істот і ховається в них"],
  },
});

/* monsters/nimfy.js */
Atlas.registerMonster({
  format: 1,
  id: "nimfy",
  name: "німфи",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga", "enchanted"], worlds: "all" },
  order: 23,
});

/* monsters/oblohovi-holemy.js */
Atlas.registerMonster({
  "format": 2,
  "id": "oblohovi-holemy",
  "name": "Облогові големи",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "praporni-rivnyny",
      "yalynovi-peredmurya",
      "kamyani-bastiony",
      "zruynovani-korolivski-sady"
    ],
    "worlds": [
      "trykoron"
    ]
  },
  "order": 865,
  "lore": {
    "description": "Загроза світу «Трикорон»."
  }
});

/* monsters/ocheretyanyy-klatsun.js */
Atlas.registerMonster({
  format: 2,
  id: "ocheretyanyy-klatsun",
  name: "Очеретяний Клацун",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 917,
  lore: {
    description: "Невисока істота з порожнистих стебел і квадратної голови з дерев'яними щелепами.",
    behavior: "Живе на берегах тихих річок.",
    abilities: ["клацає щелепами, імітуючи звуки кроків, щоб відвернути увагу, а потім швидко відступає в зарості"],
  },
});

/* monsters/ocheretyanyy-pavuk-storozh.js */
Atlas.registerMonster({
  format: 2,
  id: "ocheretyanyy-pavuk-storozh",
  name: "Очеретяний павук-сторож",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 665,
  lore: {
    description: "Тонконогий павук із тілом, схожим на стебло.",
    behavior: "Болотні береги.",
    abilities: ["натягує нитки-попередження між очеретинами"],
  },
});

/* monsters/ocheretyanyy-skrypal.js */
Atlas.registerMonster({
  format: 2,
  id: "ocheretyanyy-skrypal",
  name: "Очеретяний Скрипаль",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["swamp", "grass", "steppe"], worlds: "all" },
  order: 871,
  lore: {
    description: "Висока болотяна істота з тулубом із порожнистих стебел та пальцями, схожими на тонкі леза.",
    behavior: "Стоїть серед густих очеретяних заростей.",
    abilities: ["грає на власних ребрах, створюючи вібрації, які змушують зброю гравця тремтіти й збивають ритм атак"],
  },
});

/* monsters/ohry.js */
Atlas.registerMonster({
  format: 1,
  id: "ohry",
  name: "огри",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["hills", "mountain", "peaks"], worlds: "all" },
  order: 2,
});

/* monsters/okhorontsi-halerey.js */
Atlas.registerMonster({
  "format": 2,
  "id": "okhorontsi-halerey",
  "name": "Охоронці галерей",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "syni-freskovi-skeli",
      "chervoni-malyarni-dolyny",
      "zoloti-khramovi-terasy",
      "chornylni-pechery"
    ],
    "worlds": [
      "malvar"
    ]
  },
  "order": 880,
  "lore": {
    "description": "Загроза світу «Мальвар»."
  }
});

/* monsters/okhorontsi-matky.js */
Atlas.registerMonster({
  "format": 2,
  "id": "okhorontsi-matky",
  "name": "Охоронці матки",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "medovi-luky",
      "voskovi-skeli",
      "smolyani-roshchi",
      "porozhnysti-vulyky"
    ],
    "worlds": [
      "medokray"
    ]
  },
  "order": 870,
  "lore": {
    "description": "Загроза світу «Медокрай»."
  }
});

/* monsters/olen.js */
Atlas.registerMonster({
  format: 2,
  id: "olen",
  name: "Олень",
  kind: "monster",
  nature: "magic",
  variants: ["великий олень", "чорний рогатий олень", "лісовий лось"],
  spawn: { biomes: ["forest", "taiga", "grass", "hills"], worlds: "all" },
  order: 373,
  lore: {
    description: "Звір. Об'єднує схожих істот: великий олень, чорний рогатий олень, лісовий лось.",
    behavior: "Зустрічається: ліси, луки; прокляті гаї; заболочені ліси.",
    abilities: ["удари копитами", "захист рогами", "нічні ривки", "короткочасна невидимість", "таран рогами"],
  },
});

/* monsters/orky.js */
Atlas.registerMonster({
  format: 1,
  id: "orky",
  name: "орки",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["hills", "mountain", "peaks"], worlds: "all" },
  order: 16,
});

/* monsters/osa.js */
Atlas.registerMonster({
  format: 2,
  id: "osa",
  name: "Оса",
  kind: "monster",
  nature: "magic",
  variants: ["гігантська оса", "оса-кам’янотворець"],
  spawn: { biomes: ["forest", "taiga", "mountain", "hills"], worlds: "all" },
  order: 394,
  lore: {
    description: "Комаха. Об'єднує схожих істот: гігантська оса, оса-кам’янотворець.",
    behavior: "Зустрічається: ліси, скельні гнізда; гірські печери.",
    abilities: ["отруйне жало", "швидкі повітряні атаки", "обліплює цілі кам’янистими наростами"],
  },
});

/* monsters/ostanniy-leviafan.js */
Atlas.registerMonster({
  "format": 2,
  "id": "ostanniy-leviafan",
  "name": "Останній Левіафан",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "mertvi-ryfy",
      "mushlyani-dyuny",
      "skamyanili-prybiyni-skeli",
      "blakytni-pechery",
      "kreydyani-vezhi",
      "sukhi-morski-terasy",
      "chervoni-rozlomy",
      "skamyanili-berehy"
    ],
    "worlds": [
      "fossar"
    ]
  },
  "order": 838,
  "lore": {
    "description": "Бос світу «Фоссар»."
  }
});

/* monsters/ostanniy-svidok-tvorinnya.js */
Atlas.registerMonster({
  format: 2,
  id: "ostanniy-svidok-tvorinnya",
  name: "Останній свідок творіння",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "volcanic"], worlds: "all" },
  order: 461,
  lore: {
    description: "Давня істота, складена з піску, кісток, льоду, коренів і лави.",
    behavior: "Первісний кратер, де зійшлися всі стихії.",
    abilities: ["у кожній фазі перебудовує себе під стихію арени"],
  },
});

/* monsters/ostanniy-svitlyachok.js */
Atlas.registerMonster({
  format: 2,
  id: "ostanniy-svitlyachok",
  name: "Останній Світлячок",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills", "wasteland", "grass"], worlds: "all" },
  order: 935,
  lore: {
    description: "Крихітна істота з прозорим черевцем і довгими тонкими ніжками.",
    behavior: "Зустрічається в темних садах, старих тунелях і забутих святилищах.",
    abilities: ["блимає лише тоді, коли поруч є прихований прохід, а при спробі зловити його перелітає за найближчу перешкоду"],
  },
});

/* monsters/ostanniy-volodar-khrebtsiv.js */
Atlas.registerMonster({
  "format": 2,
  "id": "ostanniy-volodar-khrebtsiv",
  "name": "Останній Володар Хребців",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "reberni-hory",
      "krovyani-dolyny",
      "popelyasti-rivnyny",
      "cherepni-pechery",
      "sady-zabutykh-imen",
      "cherepni-plato",
      "kistyani-ustupy",
      "pylovi-dolyny",
      "pechery-khrebtsiv"
    ],
    "worlds": [
      "morgalis"
    ]
  },
  "order": 733,
  "lore": {
    "description": "Бос світу «Морґаліс»."
  }
});

/* monsters/otruyni-kabany.js */
Atlas.registerMonster({
  "format": 2,
  "id": "otruyni-kabany",
  "name": "Отруйні кабани",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "yablunevi-terasy",
      "fioletovi-hrushevi-hayi",
      "hirki-korenevi-polya",
      "zoloti-sady",
      "harbuzovi-rivnyny",
      "kukurudzyani-labirynty",
      "buryakovi-yary",
      "zoloti-teplytsi"
    ],
    "worlds": [
      "orchardum"
    ]
  },
  "order": 796,
  "lore": {
    "description": "Загроза світу «Орчардум»."
  }
});

/* monsters/otruynyy-bolotyanyy-hihant.js */
Atlas.registerMonster({
  format: 2,
  id: "otruynyy-bolotyanyy-hihant",
  name: "Отруйний болотяний гігант",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["swamp"], worlds: "all" },
  order: 308,
  lore: {
    description: "Болотний гуманоїд.",
    behavior: "Зустрічається: трясовини.",
    abilities: ["отруйні удари", "туман"],
  },
});

/* monsters/pahorbkovyi-baran.js */
Atlas.registerMonster({
  "format": 2,
  "id": "pahorbkovyi-baran",
  "name": "Горбатий баран",
  "kind": "weak",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "tag:highland",
      "tag:hills",
      "tag:mountain",
      "tag:stone"
    ],
    "worlds": "all"
  },
  "order": 989,
  "lore": {
    "description": "Баран із кам'яними рогами.",
    "behavior": "Паситься на уступах.",
    "abilities": [
      "таран",
      "стрибки"
    ],
    "drops": [
      "баранячий ріг"
    ]
  }
});

/* monsters/palayuchyy-kistyanyy-drakon.js */
Atlas.registerMonster({
  format: 2,
  id: "palayuchyy-kistyanyy-drakon",
  name: "Палаючий кістяний дракон",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 268,
  lore: {
    description: "Неживий дракон.",
    behavior: "Зустрічається: стародавні драконячі катакомби.",
    abilities: ["вогняні кістки", "прокляте дихання", "скелетні слуги"],
  },
});

/* monsters/pani-rtutnykh-vikon.js */
Atlas.registerMonster({
  format: 2,
  id: "pani-rtutnykh-vikon",
  name: "Пані Ртутних Вікон",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills", "lake"], worlds: "all" },
  order: 764,
  lore: {
    description: "Струнка постать із рідкометалевою шкірою й шістьма прямокутними панелями замість обличчя.",
    behavior: "Мешкає в затопленому Ртутному палаці.",
    abilities: ["відділяє відображення від поверхонь, примушуючи їх повторювати рухи героїні або заманювати гравця хибними проходами"],
  },
});

/* monsters/pani-sklyanoho-pryplyvu.js */
Atlas.registerMonster({
  format: 2,
  id: "pani-sklyanoho-pryplyvu",
  name: "Пані скляного припливу",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 463,
  lore: {
    description: "Висока постать із прозорими плавниками.",
    behavior: "Берег скляного моря.",
    abilities: ["підіймає хвилі з рідкого скла, що застигають у гострі стіни"],
  },
});

/* monsters/pantsyrni-holemy.js */
Atlas.registerMonster({
  "format": 2,
  "id": "pantsyrni-holemy",
  "name": "Панцирні големи",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "luskati-khrebty",
      "chervoni-ulohovyny",
      "siri-pantsyrni-luky",
      "pechery-staroyi-shkiry"
    ],
    "worlds": [
      "luskariya"
    ]
  },
  "order": 877,
  "lore": {
    "description": "Загроза світу «Лускарія»."
  }
});

/* monsters/pantsyrni-khyzhaky.js */
Atlas.registerMonster({
  "format": 2,
  "id": "pantsyrni-khyzhaky",
  "name": "Панцирні хижаки",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "mertvi-ryfy",
      "mushlyani-dyuny",
      "skamyanili-prybiyni-skeli",
      "blakytni-pechery",
      "kreydyani-vezhi",
      "sukhi-morski-terasy",
      "chervoni-rozlomy",
      "skamyanili-berehy"
    ],
    "worlds": [
      "fossar"
    ]
  },
  "order": 834,
  "lore": {
    "description": "Загроза світу «Фоссар»."
  }
});

/* monsters/pantsyrnyk-burshtynovykh-richok.js */
Atlas.registerMonster({
  format: 2,
  id: "pantsyrnyk-burshtynovykh-richok",
  name: "Панцирник бурштинових річок",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga"], worlds: "all" },
  order: 500,
  lore: {
    description: "Масивний черепахоподібний монстр із застиглими всередині панцира комахами.",
    behavior: "Бурштинові русла.",
    abilities: ["перекриває потік і випускає рій із тріщин"],
  },
});

/* monsters/pantsyrnyk-midnoho-doshchu.js */
Atlas.registerMonster({
  format: 2,
  id: "pantsyrnyk-midnoho-doshchu",
  name: "Панцирник Мідного Дощу",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 853,
  lore: {
    description: "Кремезний звір із мідних пластин, які під час руху відшаровуються й падають навколо нього.",
    behavior: "Живе на мідних схилах старих шахт.",
    abilities: ["притискається до землі, переживаючи атаки, а потім піднімає розкидані пластини магнітним полем і запускає їх дугами"],
  },
});

/* monsters/pantsyrnyy-tapir.js */
Atlas.registerMonster({
  format: 2,
  id: "pantsyrnyy-tapir",
  name: "Панцирний тапір",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["grass"], worlds: "all" },
  order: 619,
  lore: {
    description: "Масивна мирна тварина з плитами на плечах.",
    behavior: "Широколисті долини.",
    abilities: ["у разі небезпеки розгортає захисні пластини й штовхає супротивника"],
  },
});

/* monsters/paperovyy-osoyid.js */
Atlas.registerMonster({
  format: 2,
  id: "paperovyy-osoyid",
  name: "Паперовий осоїд",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["forest"], worlds: "all" },
  order: 657,
  lore: {
    description: "Комаха з тонкими шаруватими крилами.",
    behavior: "Порожнисті стовбури.",
    abilities: ["випльовує паперові смужки, що прилипають до цілі"],
  },
});

/* monsters/paperovyy-voronar.js */
Atlas.registerMonster({
  format: 2,
  id: "paperovyy-voronar",
  name: "Паперовий Воронар",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills", "lake", "grass"], worlds: "all" },
  order: 882,
  lore: {
    description: "Довгокрила істота, складена з пожовклих сторінок і чорнильних пластин.",
    behavior: "Гніздиться в архівах затоплених замків.",
    abilities: ["розгортає крила в пласкі листи, ковзає крізь вузькі щілини та залишає паперові порізи при зіткненні"],
  },
});

/* monsters/paporoteva-myshka.js */
Atlas.registerMonster({
  format: 2,
  id: "paporoteva-myshka",
  name: "Папоротева мишка",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga"], worlds: "all" },
  order: 723,
  lore: {
    description: "Зелений гризун із листкоподібними вухами.",
    behavior: "Затінені ліси.",
    abilities: ["завмирає в папороті та тікає звивистими маршрутами"],
  },
});

/* monsters/paporotevyy-kapelyushnyk.js */
Atlas.registerMonster({
  format: 2,
  id: "paporotevyy-kapelyushnyk",
  name: "Папоротевий Капелюшник",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga"], worlds: "all" },
  order: 924,
  lore: {
    description: "Крихітна істота з тулубом під великим зеленим листком, який вона носить як капелюх.",
    behavior: "Живе на узліссях стародавніх папоротевих лісів.",
    abilities: ["ховається серед рослин і стрибає на голову гравця, закриваючи огляд, але падає від різкого руху"],
  },
});

/* monsters/parazyty-pozhyrachi.js */
Atlas.registerMonster({
  "format": 2,
  "id": "parazyty-pozhyrachi",
  "name": "Паразити-пожирачі",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "kistyani-alpy",
      "bahryani-sudyny",
      "lehenevi-stepy",
      "zhovchni-ozera",
      "nervovi-sady"
    ],
    "worlds": [
      "ormaval"
    ]
  },
  "order": 706,
  "lore": {
    "description": "Загроза світу «Ормаваль»."
  }
});

/* monsters/parazyty-zarodkiv.js */
Atlas.registerMonster({
  "format": 2,
  "id": "parazyty-zarodkiv",
  "name": "Паразити зародків",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "pervisni-sady",
      "kamyani-zarodky",
      "pylkovi-rivnyny",
      "korenevi-materyky",
      "skhovyshcha-nezarodzhenykh-svitiv"
    ],
    "worlds": [
      "arkhelor"
    ]
  },
  "order": 778,
  "lore": {
    "description": "Загроза світу «Архелор»."
  }
});

/* monsters/parovi-khyzhaky.js */
Atlas.registerMonster({
  "format": 2,
  "id": "parovi-khyzhaky",
  "name": "Парові хижаки",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "haryachi-dzherela",
      "siri-plato",
      "parovi-yary",
      "vulkanichni-ustupy"
    ],
    "worlds": [
      "termalis"
    ]
  },
  "order": 858,
  "lore": {
    "description": "Загроза світу «Термаліс»."
  }
});

/* monsters/pasovyshchnyi-hihant.js */
Atlas.registerMonster({
  "format": 2,
  "id": "pasovyshchnyi-hihant",
  "name": "Пасовищний гігант",
  "kind": "mini-boss",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "tag:highland",
      "tag:hills",
      "tag:mountain",
      "tag:stone"
    ],
    "worlds": "all"
  },
  "order": 991,
  "lore": {
    "description": "Волохатий кам'яний велетень, що гляне — і трава в'яне.",
    "behavior": "Живе на високих пасовищах і відганяє чужинців.",
    "abilities": [
      "кидає валуни",
      "розтрощує землю"
    ],
    "drops": [
      "камінь-шерсть",
      "мох велетня"
    ]
  }
});

/* monsters/pastka-khodok.js */
Atlas.registerMonster({
  format: 2,
  id: "pastka-khodok",
  name: "Пастка-Ходок",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 856,
  lore: {
    description: "Велика скриня на шести дерев'яних ногах, обвішана мідними дзвіночками.",
    behavior: "Ховається в покинутих караван-сараях і скарбницях.",
    abilities: ["прикидається скарбом, а коли гравець наближається, стрибає вбік і закриває щелепи навколо зброї, намагаючись вирвати її з рук"],
  },
});

/* monsters/pastka-z-tysyachi-rotiv.js */
Atlas.registerMonster({
  format: 2,
  id: "pastka-z-tysyachi-rotiv",
  name: "Пастка з тисячі ротів",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills", "grass"], worlds: "all" },
  order: 472,
  lore: {
    description: "Велетенська істота, схожа на пересувний пагорб із кам’яними щелепами.",
    behavior: "Долина живих печер.",
    abilities: ["відкриває роти-портали, що вивергають різні типи істот"],
  },
});

/* monsters/pastukh-popelyastykh-ovets.js */
Atlas.registerMonster({
  format: 2,
  id: "pastukh-popelyastykh-ovets",
  name: "Пастух попелястих овець",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["volcanic", "ashlands", "hills"], worlds: "all" },
  order: 491,
  lore: {
    description: "Темний гуманоїд із посохом, оточений клубами попелу.",
    behavior: "Попелясті луки вулканічного краю.",
    abilities: ["його стадо вибухає хмарами жаркого пилу"],
  },
});

/* monsters/pastukh-zhaslykh-sonts.js */
Atlas.registerMonster({
  format: 2,
  id: "pastukh-zhaslykh-sonts",
  name: "Пастух згаслих сонць",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "ashlands"], worlds: "all" },
  order: 449,
  lore: {
    description: "Велетень із чорною короною, що несе на ланцюгах мертві зорі.",
    behavior: "Космічний некрополь.",
    abilities: ["створює ділянки абсолютної темряви й гравітаційні провали"],
  },
});

/* monsters/pastyr-bezodnikh-kontynentiv.js */
Atlas.registerMonster({
  format: 2,
  id: "pastyr-bezodnikh-kontynentiv",
  name: "Пастир Безодніх Континентів",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["deep"], worlds: "all" },
  order: 837,
  lore: {
    description: "Гігантська істота з напівпрозорого синього мінералу, схожа на ходячу арку з сотнями крихітних вікон.",
    behavior: "Прокидається в найглибших океанічних розломах.",
    abilities: ["пересуває острови морським дном, підіймаючи хвилі заввишки з вежі, а у відкритих вікнах накопичує світло для нищівного променя"],
  },
});

/* monsters/pavuk-arfist.js */
Atlas.registerMonster({
  format: 2,
  id: "pavuk-arfist",
  name: "Павук-Арфіст",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 810,
  lore: {
    description: "Довгоногий павук із дерев’яним резонатором замість черевця та тонкими блискучими нитками між кінцівками.",
    behavior: "Живе в печерах лункого каменю.",
    abilities: ["натягнуті нитки перетворює на струни, чиї різкі ноти ріжуть відкриті ділянки й попереджають про наближення ворога"],
  },
});

/* monsters/pavuk-lovets-veletniv.js */
Atlas.registerMonster({
  format: 2,
  id: "pavuk-lovets-veletniv",
  name: "Павук-ловець велетнів",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga", "mountain", "hills"], worlds: "all" },
  order: 304,
  lore: {
    description: "Павук.",
    behavior: "Зустрічається: глибокі лісові печери.",
    abilities: ["липка павутина", "отруйні пастки"],
  },
});

/* monsters/pavuk-merezhnyk.js */
Atlas.registerMonster({
  format: 2,
  id: "pavuk-merezhnyk",
  name: "Павук-мережник",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga"], worlds: "all" },
  order: 400,
  lore: {
    description: "Павукоподібне.",
    behavior: "Зустрічається: ліси.",
    abilities: ["розтягує павутинні пастки між деревами"],
  },
});

/* monsters/pavuk-reshitnyk.js */
Atlas.registerMonster({
  format: 2,
  id: "pavuk-reshitnyk",
  name: "Павук-решітник",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills", "grass"], worlds: "all" },
  order: 669,
  lore: {
    description: "Павук із широкими лапами, розташованими як прути решітки.",
    behavior: "Кам’яні вежі.",
    abilities: ["притискає ціль до стіни й перекриває втечу"],
  },
});

/* monsters/pavuk-roztyazhnyk.js */
Atlas.registerMonster({
  format: 2,
  id: "pavuk-roztyazhnyk",
  name: "Павук-розтяжник",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga"], worlds: "all" },
  order: 551,
  lore: {
    description: "Восьминогий хижак із довгими нитками-пастками.",
    behavior: "Лісові проходи.",
    abilities: ["натягує їх між деревами, а потім стягує здобич"],
  },
});

/* monsters/pavutynnyy-honchar.js */
Atlas.registerMonster({
  format: 2,
  id: "pavutynnyy-honchar",
  name: "Павутинний Гончар",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["hills", "mountain"], worlds: "all" },
  order: 904,
  lore: {
    description: "Павукоподібна істота з короткими ногами та черевцем у формі глиняного глечика.",
    behavior: "Живе у висохлих підземних цистернах.",
    abilities: ["плете не сітки, а тверді глиняні чаші навколо проходів, створюючи вузькі лабіринти, де атакує з-за перегородок"],
  },
});

/* monsters/peak-warden.js */
Atlas.registerMonster({
  "format": 2,
  "id": "peak-warden",
  "name": "Вартовий Вершин",
  "kind": "world-boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "mineral-crowns",
      "peaks"
    ],
    "worlds": [
      "neborid"
    ]
  },
  "order": 238,
  "lore": {
    "description": "Велетенський вартовий, що спить у центральному гірському масиві; під час бою створює нові кам'яні платформи.",
    "behavior": "Спить; прокидається, коли турбують головну вершину.",
    "abilities": [
      "створення платформ",
      "обвал",
      "грозовий удар"
    ],
    "drops": [
      "серце вершини"
    ]
  }
});

/* monsters/pechatnyk-perelesnyk.js */
Atlas.registerMonster({
  format: 2,
  id: "pechatnyk-perelesnyk",
  name: "Печатник-Перелесник",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 773,
  lore: {
    description: "Худий мандрівний гуманоїд із маскою з темного дерева та долонями у формі воскових печаток.",
    behavior: "Служить сторожем руїн старого трибуналу.",
    abilities: ["залишає на землі символи-заборони, які тимчасово унеможливлюють стрибки, перекати або чаклування в позначеній зоні"],
  },
});

/* monsters/pechatnyk-pisku.js */
Atlas.registerMonster({
  format: 2,
  id: "pechatnyk-pisku",
  name: "Печатник піску",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["desert", "wasteland", "hills"], worlds: "all" },
  order: 534,
  lore: {
    description: "Пласка ящірка з візерунками, схожими на воскові печатки.",
    behavior: "Піщані руїни.",
    abilities: ["залишає під землею магічні мітки, що вибухають при наступанні"],
  },
});

/* monsters/pecherna-dzerkalka.js */
Atlas.registerMonster({
  format: 2,
  id: "pecherna-dzerkalka",
  name: "Печерна Дзеркалка",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 819,
  lore: {
    description: "Бліда саламандра з дзеркальною шкірою та короткими пальцями-присосками.",
    behavior: "Живе в печерах із кришталевими підземними озерами.",
    abilities: ["відображає світло від поверхні води, створюючи хибні контури проходів і відгалужень"],
  },
});

/* monsters/pecherna-mukha.js */
Atlas.registerMonster({
  "format": 2,
  "id": "pecherna-mukha",
  "name": "Печерна мошка",
  "kind": "weak",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "tag:underground",
      "tag:mine"
    ],
    "worlds": "all"
  },
  "order": 957,
  "lore": {
    "description": "Світлячок-мошка з тьмяним ліхтариком у хвості.",
    "behavior": "Тягне мандрівників у темряву, мерехтіючи.",
    "abilities": [
      "осліплює спалахом",
      "рій піднімається разом"
    ],
    "drops": [
      "тьмяний світляк"
    ]
  }
});

/* monsters/pecherna-salamandra.js */
Atlas.registerMonster({
  format: 2,
  id: "pecherna-salamandra",
  name: "Печерна саламандра",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 382,
  lore: {
    description: "Земноводне.",
    behavior: "Зустрічається: вологі печери.",
    abilities: ["слабкий отруйний слиз", "нічне бачення"],
  },
});

/* monsters/pecherna-slipa-ryba.js */
Atlas.registerMonster({
  format: 2,
  id: "pecherna-slipa-ryba",
  name: "Печерна сліпа риба",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 425,
  lore: {
    description: "Підземна риба.",
    behavior: "Зустрічається: підземні озера.",
    abilities: ["орієнтується за вібраціями", "кусає в темряві"],
  },
});

/* monsters/pecherni-hrabizhnyky.js */
Atlas.registerMonster({
  "format": 2,
  "id": "pecherni-hrabizhnyky",
  "name": "Печерні грабіжники",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "reberni-hory",
      "krovyani-dolyny",
      "popelyasti-rivnyny",
      "cherepni-pechery",
      "sady-zabutykh-imen",
      "cherepni-plato",
      "kistyani-ustupy",
      "pylovi-dolyny",
      "pechery-khrebtsiv"
    ],
    "worlds": [
      "morgalis"
    ]
  },
  "order": 731,
  "lore": {
    "description": "Загроза світу «Морґаліс»."
  }
});

/* monsters/pecherni-leviafany.js */
Atlas.registerMonster({
  "format": 2,
  "id": "pecherni-leviafany",
  "name": "Печерні левіафани",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "syni-katedry",
      "chorni-protoky",
      "koralovi-pechery",
      "povitryani-ozera",
      "zeleni-hlybynni-lisy"
    ],
    "worlds": [
      "talassyr"
    ]
  },
  "order": 769,
  "lore": {
    "description": "Загроза світу «Талассир»."
  }
});

/* monsters/pecherni-skorpiony.js */
Atlas.registerMonster({
  "format": 2,
  "id": "pecherni-skorpiony",
  "name": "Печерні скорпіони",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "mertvi-ryfy",
      "mushlyani-dyuny",
      "skamyanili-prybiyni-skeli",
      "blakytni-pechery",
      "kreydyani-vezhi",
      "sukhi-morski-terasy",
      "chervoni-rozlomy",
      "skamyanili-berehy"
    ],
    "worlds": [
      "fossar"
    ]
  },
  "order": 836,
  "lore": {
    "description": "Загроза світу «Фоссар»."
  }
});

/* monsters/pechernyy-hnom-vidstupnyk.js */
Atlas.registerMonster({
  format: 2,
  id: "pechernyy-hnom-vidstupnyk",
  name: "Печерний гном-відступник",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 357,
  lore: {
    description: "Звичайний гуманоїд.",
    behavior: "Зустрічається: старі шахти.",
    abilities: ["молот", "димові заряди"],
  },
});

/* monsters/pechernyy-lev.js */
Atlas.registerMonster({
  format: 2,
  id: "pechernyy-lev",
  name: "Печерний лев",
  kind: "monster",
  nature: "threat",
  variants: ["печерний лев", "білий печерний лев"],
  spawn: { biomes: ["mountain", "hills", "peaks"], worlds: "all" },
  order: 349,
  lore: {
    description: "Звір-хижак. Об'єднує схожих істот: печерний лев, білий печерний лев.",
    behavior: "Зустрічається: гірські печери; холодні гірські печери.",
    abilities: ["потужні стрибки", "оглушливий рик", "крижаний рик", "стрибки", "кігті"],
  },
});

/* monsters/pechernyy-minotavr.js */
Atlas.registerMonster({
  format: 2,
  id: "pechernyy-minotavr",
  name: "Печерний мінотавр",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 311,
  lore: {
    description: "Рогатий гуманоїд.",
    behavior: "Зустрічається: лабіринти.",
    abilities: ["таран", "сокира", "розбивання перешкод"],
  },
});

/* monsters/pechernyy-pavuk.js */
Atlas.registerMonster({
  format: 2,
  id: "pechernyy-pavuk",
  name: "Печерний павук",
  kind: "monster",
  nature: "threat",
  variants: ["печерний павук", "крихітний печерний павук"],
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 397,
  lore: {
    description: "Павукоподібне. Об'єднує схожих істот: печерний павук, крихітний печерний павук.",
    behavior: "Зустрічається: темні печери; печери.",
    abilities: ["отруйний укус", "павутина", "слабка отрута"],
  },
});

/* monsters/pelyustkovyy-povzun.js */
Atlas.registerMonster({
  format: 2,
  id: "pelyustkovyy-povzun",
  name: "Пелюстковий повзун",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["forest", "grass", "hills"], worlds: "all" },
  order: 728,
  lore: {
    description: "Маленький рослинний монстр із чотирма пелюстками замість лап.",
    behavior: "Клумби старих замків.",
    abilities: ["складається в квітку, коли до нього наближаються"],
  },
});

/* monsters/pen-strybun.js */
Atlas.registerMonster({
  format: 2,
  id: "pen-strybun",
  name: "Пень-стрибун",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["enchanted", "forest", "taiga"], worlds: "all" },
  order: 522,
  lore: {
    description: "Хижа рослина, що прикидається зрізаним деревом.",
    behavior: "Вирубки в зачарованих лісах.",
    abilities: ["стрибає на здобич і затискає її гілками"],
  },
});

/* monsters/penolyz.js */
Atlas.registerMonster({
  format: 2,
  id: "penolyz",
  name: "Пеньолиз",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga"], worlds: "all" },
  order: 790,
  lore: {
    description: "Низький широкомордий звір із довгим шорстким язиком, схожим на рубанок.",
    behavior: "Живе на старих лісосіках.",
    abilities: ["облизує пеньки, роблячи їх і прилеглі ділянки землі слизькими, а потім ковзає до здобичі"],
  },
});

/* monsters/perevernuta-tin.js */
Atlas.registerMonster({
  "format": 2,
  "id": "perevernuta-tin",
  "name": "Перевернута тінь",
  "kind": "monster",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "tag:surreal"
    ],
    "worlds": "all"
  },
  "order": 994,
  "lore": {
    "description": "Темна постать, що висить догори ногами й тягнеться до голови.",
    "behavior": "Виринає з перевернутих водоспадів.",
    "abilities": [
      "тягне вгору",
      "інвертує керування"
    ],
    "drops": [
      "чорна тінь"
    ]
  }
});

/* monsters/pereverten-alfa.js */
Atlas.registerMonster({
  format: 1,
  id: "pereverten-alfa",
  name: "Перевертень-Альфа",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga", "enchanted"], worlds: "all" },
  order: 73,
});

/* monsters/perevertni.js */
Atlas.registerMonster({
  format: 1,
  id: "perevertni",
  name: "перевертні",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga", "enchanted"], worlds: "all" },
  order: 29,
});

/* monsters/perlynnyy-hlushnyk.js */
Atlas.registerMonster({
  format: 2,
  id: "perlynnyy-hlushnyk",
  name: "Перлинний Глушник",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 824,
  lore: {
    description: "Велетенська двостулкова істота, прикріплена до підводної дзвіниці, з перламутровими ребрами та темною щілиною між стулками.",
    behavior: "Ховається в затоплених гаванях.",
    abilities: ["різко змикає мушлю, створюючи тискову хвилю, що оглушує істот і руйнує підводні споруди"],
  },
});

/* monsters/perlynnyy-khovach.js */
Atlas.registerMonster({
  format: 2,
  id: "perlynnyy-khovach",
  name: "Перлинний ховач",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["sea"], worlds: "all" },
  order: 711,
  lore: {
    description: "Молюск, що носить блискучі перлини між стулками.",
    behavior: "Перлинні мілини.",
    abilities: ["закривається при наближенні, а потім випускає перлинні кульки як снаряди"],
  },
});

/* monsters/pershyy-koval.js */
Atlas.registerMonster({
  "format": 2,
  "id": "pershyy-koval",
  "name": "Перший Коваль",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "bazaltovi-kuzni",
      "obsydianovi-lisy",
      "popelyasti-terasy",
      "mahmovi-riky",
      "kryshtalevi-horny"
    ],
    "worlds": [
      "embergard"
    ]
  },
  "order": 762,
  "lore": {
    "description": "Перший Коваль перековує арену в ході битви."
  }
});

/* monsters/pervisnyy-khaos.js */
Atlas.registerMonster({
  format: 2,
  id: "pervisnyy-khaos",
  name: "Первісний хаос",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "volcanic"], worlds: "all" },
  order: 256,
  lore: {
    description: "Мінлива магічна істота.",
    behavior: "Зустрічається: центр стародавньої аномалії.",
    abilities: ["змінює форму", "стихію й поведінку арени"],
  },
});

/* monsters/pichnyy-shurkhit.js */
Atlas.registerMonster({
  format: 2,
  id: "pichnyy-shurkhit",
  name: "Пічний шурхіт",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["volcanic", "ashlands"], worlds: "all" },
  order: 579,
  lore: {
    description: "Істота з вуглинок і попелу.",
    behavior: "Старі кузні.",
    abilities: ["проникає в холодні печі, а потім вискакує з жаром"],
  },
});

/* monsters/pidkhmarnyy-komaryk.js */
Atlas.registerMonster({
  format: 2,
  id: "pidkhmarnyy-komaryk",
  name: "Підхмарний Комарик",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["hills"], worlds: "all" },
  order: 833,
  lore: {
    description: "Дрібна комаха з голчастими ногами, напівпрозорими крилами та маленьким дзвінким черевцем.",
    behavior: "З’являється над високою травою на передгрозових пагорбах.",
    abilities: ["кружляє над головою, виснажуючи витривалість монотонним писком і привертаючи увагу більших хижаків"],
  },
});

/* monsters/pidlystkovyy-kusak.js */
Atlas.registerMonster({
  format: 2,
  id: "pidlystkovyy-kusak",
  name: "Підлистковий кусак",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga"], worlds: "all" },
  order: 610,
  lore: {
    description: "Малий хижак, схожий на зім’ятий лист.",
    behavior: "Осінні гаї.",
    abilities: ["хапається за ноги й маскується серед опалого листя"],
  },
});

/* monsters/pidpilnyy-luskar.js */
Atlas.registerMonster({
  format: 2,
  id: "pidpilnyy-luskar",
  name: "Підпільний Лускар",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills", "steppe"], worlds: "all" },
  order: 887,
  lore: {
    description: "Довгий червоподібний звір із шаруватими глиняними лусками та широкою головою-лопатою.",
    behavior: "Мешкає під кам'янистими степами.",
    abilities: ["риє тунелі просто під ногами, змушуючи блоки провалюватися, а сам з'являється лише на мить, щоб захопити здобич"],
  },
});

/* monsters/pidpornyk.js */
Atlas.registerMonster({
  format: 2,
  id: "pidpornyk",
  name: "Підпорник",
  kind: "monster",
  nature: "magic",
  variants: ["підпорник", "кам'яний Підпірник"],
  spawn: { biomes: ["mountain", "hills", "desert", "lake"], worlds: "all" },
  order: 797,
  lore: {
    description: "Низький підземний звір із панциром у формі кам’яної арки та короткими прихованими ногами. Об'єднує схожих істот: підпорник, кам'яний Підпірник.",
    behavior: "Живе в соляних шахтах. Живе в руїнах мостів і старих акведуках.",
    abilities: ["підпорник: підпирає слабкі склепіння печер, а коли здобич проходить під ними, відпускає опору й обвалює каміння", "кам'яний Підпірник: підставляє верхній блок під хиткі споруди, а коли гравець наближається, забирає опору, спричиняючи обвал"],
  },
});

/* monsters/pidstinnyy-shkryabun.js */
Atlas.registerMonster({
  format: 2,
  id: "pidstinnyy-shkryabun",
  name: "Підстінний шкрябун",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 589,
  lore: {
    description: "Плаский звір із кігтями на спині.",
    behavior: "Кам’яні коридори.",
    abilities: ["бігає по стінах і падає на ціль згори"],
  },
});

/* monsters/pidvodnyy-chervyak-ryvach.js */
Atlas.registerMonster({
  format: 2,
  id: "pidvodnyy-chervyak-ryvach",
  name: "Підводний черв’як-ривач",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 430,
  lore: {
    description: "Водний хижак.",
    behavior: "Зустрічається: морське дно.",
    abilities: ["прориває донний ґрунт", "створює каламутні хмари"],
  },
});

/* monsters/pidvodnyy-dzyhar.js */
Atlas.registerMonster({
  format: 2,
  id: "pidvodnyy-dzyhar",
  name: "Підводний дзигар",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 688,
  lore: {
    description: "Риба зі спіральним хвостом.",
    behavior: "Швидкі течії.",
    abilities: ["крутиться у воді й створює невеликі вирви, що затягують предмети"],
  },
});

/* monsters/pidzemnyy-dzyzhchar.js */
Atlas.registerMonster({
  format: 2,
  id: "pidzemnyy-dzyzhchar",
  name: "Підземний Дзижчар",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills", "grass"], worlds: "all" },
  order: 926,
  lore: {
    description: "Маленька комаха з широким квадратним черевцем і прозорими крилами.",
    behavior: "Мешкає у вузьких тунелях під старими містами.",
    abilities: ["вібрує крилами так, що дрібні блоки починають повільно зсуватися, відкриваючи приховані тріщини в стінах"],
  },
});

/* monsters/pidzemnyy-rohach.js */
Atlas.registerMonster({
  format: 2,
  id: "pidzemnyy-rohach",
  name: "Підземний рогач",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 344,
  lore: {
    description: "Елітний жук.",
    behavior: "Зустрічається: шахти, печери.",
    abilities: ["буріння", "таран", "кам’яний панцир"],
  },
});

/* monsters/pidzemnyy-svichnyk.js */
Atlas.registerMonster({
  format: 2,
  id: "pidzemnyy-svichnyk",
  name: "Підземний свічник",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 516,
  lore: {
    description: "Істота з панциром, схожим на металеву люстру.",
    behavior: "Катакомби старих палаців.",
    abilities: ["розкидає гарячі краплі воску, які застигають у пастки"],
  },
});

/* monsters/pidzemnyy-tsvirkun.js */
Atlas.registerMonster({
  format: 2,
  id: "pidzemnyy-tsvirkun",
  name: "Підземний цвіркун",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["hills"], worlds: "all" },
  order: 613,
  lore: {
    description: "Комаха з твердими бурштиновими надкрилами.",
    behavior: "Неглибокі нори.",
    abilities: ["створює вібрації, що розхитують дрібні камені"],
  },
});

/* monsters/pinnyy-barabanshchyk.js */
Atlas.registerMonster({
  format: 2,
  id: "pinnyy-barabanshchyk",
  name: "Пінний Барабанщик",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 893,
  lore: {
    description: "Кругла морська істота з блідо-блакитним тілом і двома порожнистими боковими мішками.",
    behavior: "Мешкає в печерах за водоспадами.",
    abilities: ["стискає мішки, створюючи водяні удари, які відкидають ворогів і розбивають слабкі підводні блоки"],
  },
});

/* monsters/pinnyy-krab.js */
Atlas.registerMonster({
  format: 2,
  id: "pinnyy-krab",
  name: "Пінний краб",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 699,
  lore: {
    description: "Невеликий краб із білою піною між клешнями.",
    behavior: "Прибійні береги.",
    abilities: ["кидає пінні грудки, які на короткий час закривають огляд"],
  },
});

/* monsters/piryanyy-hrybnyk.js */
Atlas.registerMonster({
  format: 2,
  id: "piryanyy-hrybnyk",
  name: "Пір’яний Грибник",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["grass", "hills"], worlds: "all" },
  order: 828,
  lore: {
    description: "Маленька істота з грибним капелюхом замість голови, пернатим тулубом і лапками з пучків тонких корінців.",
    behavior: "Живе в садах вечірнього цвітіння.",
    abilities: ["стрибає між деревами, розсипаючи блакитні спори, з яких виростають крихітні світні грибочки"],
  },
});

/* monsters/piryanyy-shchytonosets.js */
Atlas.registerMonster({
  format: 2,
  id: "piryanyy-shchytonosets",
  name: "Пір’яний щитоносець",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["steppe"], worlds: "all" },
  order: 552,
  lore: {
    description: "Птах із перекривними твердими пір’їнами.",
    behavior: "Високі степи.",
    abilities: ["згортає крила в щит і контратакує дзьобом"],
  },
});

/* monsters/pishchana-zmiia-spraty.js */
Atlas.registerMonster({
  "format": 2,
  "id": "pishchana-zmiia-spraty",
  "name": "Піщана змія спраги",
  "kind": "boss",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "tag:dry"
    ],
    "worlds": "all"
  },
  "order": 956,
  "lore": {
    "description": "Колосальна змія з піску, чиє тіло лишає за собою мертву смугу.",
    "behavior": "Повзає під барханами й шукає останню краплю води.",
    "abilities": [
      "заривається й виринає під ногами",
      "піщана буря",
      "виссисає воду з героїв"
    ],
    "drops": [
      "пісок спраги",
      "луска-діна"
    ]
  }
});

/* monsters/pishchani-chervy.js */
Atlas.registerMonster({
  "format": 2,
  "id": "pishchani-chervy",
  "name": "Піщані черви",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "chervoni-hlynyani-bashty",
      "bili-sukhi-terasy",
      "hlybynni-yary",
      "zeleni-oazy",
      "bili-portselyanovi-stepy",
      "kobaltovi-yary",
      "rozhevi-karyery",
      "chorni-vypalyuvalni-pechery"
    ],
    "worlds": [
      "hlynyshche"
    ]
  },
  "order": 821,
  "lore": {
    "description": "Загроза світу «Глинище»."
  }
});

/* monsters/pishchani-chervyaky.js */
Atlas.registerMonster({
  format: 1,
  id: "pishchani-chervyaky",
  name: "Піщані черв’яки",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["desert", "savanna", "wasteland"], worlds: "all" },
  order: 118,
});

/* monsters/pishchani-khyzhaky.js */
Atlas.registerMonster({
  "format": 2,
  "id": "pishchani-khyzhaky",
  "name": "Піщані хижаки",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "zoloti-dyuny",
      "chorni-kamyani-ryfy",
      "midni-oazy",
      "pokhovani-porty"
    ],
    "worlds": [
      "vitroparus"
    ]
  },
  "order": 867,
  "lore": {
    "description": "Загроза світу «Вітропарус»."
  }
});

/* monsters/pishchani-leviafany.js */
Atlas.registerMonster({
  "format": 2,
  "id": "pishchani-leviafany",
  "name": "Піщані левіафани",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "zoloti-dyuny",
      "sklyani-oazy",
      "svitlovi-kanyony",
      "midni-plato",
      "pidzemni-sonyachni-morya"
    ],
    "worlds": [
      "heliontar"
    ]
  },
  "order": 746,
  "lore": {
    "description": "Загроза світу «Геліонтар»."
  }
});

/* monsters/pishchanyi-krab-pozhyvnyk.js */
Atlas.registerMonster({
  "format": 2,
  "id": "pishchanyi-krab-pozhyvnyk",
  "name": "Піщаний крабик",
  "kind": "weak",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "tag:shore",
      "tag:water",
      "tag:sea",
      "tag:fresh"
    ],
    "worlds": "all"
  },
  "order": 977,
  "lore": {
    "description": "Крихітний краб із мушлею-хатинкою.",
    "behavior": "Збирає блискітки на березі.",
    "abilities": [
      "щипає за пальці",
      "ховається в піску"
    ],
    "drops": [
      "мушля",
      "піщана перлинка"
    ]
  }
});

/* monsters/pishchanyy-chervyak-ruynivnyk.js */
Atlas.registerMonster({
  format: 2,
  id: "pishchanyy-chervyak-ruynivnyk",
  name: "Піщаний черв’як-руйнівник",
  kind: "boss",
  nature: "threat",
  spawn: { biomes: ["desert"], worlds: "all" },
  order: 296,
  lore: {
    description: "Підземний хижак.",
    behavior: "Зустрічається: великі пустелі.",
    abilities: ["засмоктує пісок", "створює провалля", "атакує з-під землі"],
  },
});

/* monsters/pishchanyy-dzhyn-strazh.js */
Atlas.registerMonster({
  format: 2,
  id: "pishchanyy-dzhyn-strazh",
  name: "Піщаний джин-страж",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["desert", "wasteland", "hills"], worlds: "all" },
  order: 324,
  lore: {
    description: "Дух.",
    behavior: "Зустрічається: пустельні храми.",
    abilities: ["піщані леза", "вихори", "короткочасна невразливість"],
  },
});

/* monsters/pishchanyy-kuryer.js */
Atlas.registerMonster({
  format: 2,
  id: "pishchanyy-kuryer",
  name: "Піщаний кур’єр",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["desert"], worlds: "all" },
  order: 498,
  lore: {
    description: "Довгоногий пустельний хижак із мішками на боках.",
    behavior: "Дюни старих караванних шляхів.",
    abilities: ["переносить вибуховий пісок і розкидає його пастками"],
  },
});

/* monsters/pishchanyy-lychynnyk.js */
Atlas.registerMonster({
  format: 2,
  id: "pishchanyy-lychynnyk",
  name: "Піщаний личинник",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["desert"], worlds: "all" },
  order: 406,
  lore: {
    description: "Личинка-хижак.",
    behavior: "Зустрічається: пустелі.",
    abilities: ["засмоктує дрібних істот у пісок"],
  },
});

/* monsters/pishchanyy-motyl.js */
Atlas.registerMonster({
  format: 2,
  id: "pishchanyy-motyl",
  name: "Піщаний мотиль",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["desert"], worlds: "all" },
  order: 676,
  lore: {
    description: "Крилата комаха, схожа на летючу піщинку.",
    behavior: "Пустельні ночі.",
    abilities: ["збирається у вихор і осідає на обличчі, погіршуючи огляд"],
  },
});

/* monsters/pishchanyy-nekromant.js */
Atlas.registerMonster({
  format: 1,
  id: "pishchanyy-nekromant",
  name: "Піщаний Некромант",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["desert", "wasteland"], worlds: "all" },
  order: 112,
});

/* monsters/pisochnyy-vuzlyar.js */
Atlas.registerMonster({
  format: 2,
  id: "pisochnyy-vuzlyar",
  name: "Пісочний Вузляр",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["desert"], worlds: "all" },
  order: 913,
  lore: {
    description: "Маленька істота з чотирма довгими руками, зібрана з піщаних кубиків, що постійно розсипаються.",
    behavior: "Живе на краях рухомих дюн.",
    abilities: ["зв'язує піщинки в тимчасові вузли на ногах ворога, уповільнюючи його, а сам розпадається на окремі частинки, коли отримує удар"],
  },
});

/* monsters/plaskyy-donnyk.js */
Atlas.registerMonster({
  format: 2,
  id: "plaskyy-donnyk",
  name: "Плаский донник",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 679,
  lore: {
    description: "Донна риба, схожа на рухому кам’яну плиту.",
    behavior: "Мілкі озера.",
    abilities: ["вискакує з мулу й накриває дрібну здобич"],
  },
});

/* monsters/plastynchasti-zhuky.js */
Atlas.registerMonster({
  "format": 2,
  "id": "plastynchasti-zhuky",
  "name": "Пластинчасті жуки",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "bili-paperovi-skeli",
      "riznokolorovi-terasy",
      "vitryani-stepy",
      "temni-sharovi-pechery"
    ],
    "worlds": [
      "paperon"
    ]
  },
  "order": 849,
  "lore": {
    "description": "Загроза світу «Паперон»."
  }
});

/* monsters/pleskatyy-ocheretnyk.js */
Atlas.registerMonster({
  format: 2,
  id: "pleskatyy-ocheretnyk",
  name: "Плескатий очеретник",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 560,
  lore: {
    description: "Плаский болотяний хижак, що маскується під листя.",
    behavior: "Зарості мілководдя.",
    abilities: ["вистрибує з очерету та б’є водяним батогом"],
  },
});

/* monsters/pletenyy-kozlonih.js */
Atlas.registerMonster({
  format: 2,
  id: "pletenyy-kozlonih",
  name: "Плетений козлоніг",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga"], worlds: "all" },
  order: 529,
  lore: {
    description: "Звір із кінцівками, сплетеними з лози.",
    behavior: "Густі виноградні хащі.",
    abilities: ["чіпляється за стіни й створює тимчасові живі мости"],
  },
});

/* monsters/pletilnyk-kolyuchykh-dorih.js */
Atlas.registerMonster({
  format: 2,
  id: "pletilnyk-kolyuchykh-dorih",
  name: "Плетільник колючих доріг",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga"], worlds: "all" },
  order: 489,
  lore: {
    description: "Довга змієподібна істота з колючих лоз.",
    behavior: "Тернові хащі.",
    abilities: ["перекриває стежки живими огорожами й атакує з-під землі"],
  },
});

/* monsters/pleziozavry.js */
Atlas.registerMonster({
  format: 1,
  id: "pleziozavry",
  name: "плезіозаври",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["deep"], worlds: "all" },
  order: 41,
});

/* monsters/plodoyidni-chudovyska.js */
Atlas.registerMonster({
  "format": 2,
  "id": "plodoyidni-chudovyska",
  "name": "Плодоїдні чудовиська",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "yablunevi-terasy",
      "fioletovi-hrushevi-hayi",
      "hirki-korenevi-polya",
      "zoloti-sady",
      "harbuzovi-rivnyny",
      "kukurudzyani-labirynty",
      "buryakovi-yary",
      "zoloti-teplytsi"
    ],
    "worlds": [
      "orchardum"
    ]
  },
  "order": 798,
  "lore": {
    "description": "Загроза світу «Орчардум»."
  }
});

/* monsters/ploskoholovyy-bolotolaz.js */
Atlas.registerMonster({
  format: 2,
  id: "ploskoholovyy-bolotolaz",
  name: "Плоскоголовий болотолаз",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["swamp"], worlds: "all" },
  order: 625,
  lore: {
    description: "Рептилій із широкою мордою та короткими лапами.",
    behavior: "Топкі заплави.",
    abilities: ["ховається під тонкою кіркою болота й виринає поруч"],
  },
});

/* monsters/plyamokhid.js */
Atlas.registerMonster({
  format: 2,
  id: "plyamokhid",
  name: "Плямохід",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 831,
  lore: {
    description: "Пласке чорнильне створіння з чотирма паперовими лапами й округлим тілом, що нагадує розлиту фарбу.",
    behavior: "Мешкає в покинутих мозаїчних залах.",
    abilities: ["змінює забарвлення навколишніх блоків і зливається з мозаїчною підлогою, а при ударі залишає пляму, що ковзає"],
  },
});

/* monsters/plyamystyy-mokhoyid.js */
Atlas.registerMonster({
  format: 2,
  id: "plyamystyy-mokhoyid",
  name: "Плямистий мохоїд",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga", "mountain", "hills"], worlds: "all" },
  order: 616,
  lore: {
    description: "Невеликий травоїдний звір, що носить на спині живий килим моху.",
    behavior: "Туманні лісові схили.",
    abilities: ["маскується серед каменів"],
  },
});

/* monsters/plyamystyy-nichnyy-bihun.js */
Atlas.registerMonster({
  format: 2,
  id: "plyamystyy-nichnyy-bihun",
  name: "Плямистий нічний бігун",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["savanna"], worlds: "all" },
  order: 618,
  lore: {
    description: "Чотириногий звір із люмінесцентними плямами на боках.",
    behavior: "Сутінкові савани.",
    abilities: ["плями мерехтять, відволікаючи здобич"],
  },
});

/* monsters/plyamystyy-slyzen.js */
Atlas.registerMonster({
  format: 2,
  id: "plyamystyy-slyzen",
  name: "Плямистий слизень",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills", "grass"], worlds: "all" },
  order: 608,
  lore: {
    description: "Повільний слиз із кольоровими плямами.",
    behavior: "Вологі підземелля.",
    abilities: ["кожна пляма розпадається на маленьку липку краплю"],
  },
});

/* monsters/plyamystyy-strybun.js */
Atlas.registerMonster({
  format: 2,
  id: "plyamystyy-strybun",
  name: "Плямистий стрибун",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga", "grass", "hills"], worlds: "all" },
  order: 509,
  lore: {
    description: "Хижак із пружними задніми лапами й світними плямами.",
    behavior: "Грибні луки.",
    abilities: ["стрибає через укриття та залишає вибухові сліди"],
  },
});

/* monsters/plytkovyy-voyak.js */
Atlas.registerMonster({
  format: 2,
  id: "plytkovyy-voyak",
  name: "Плитковий вояк",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills", "grass"], worlds: "all" },
  order: 570,
  lore: {
    description: "Гуманоїд із рухомих кам’яних плит.",
    behavior: "Руїни мостових міст.",
    abilities: ["складає руки в щити та атакує гострими кутами"],
  },
});

/* monsters/plyushchevyy-yenot.js */
Atlas.registerMonster({
  format: 2,
  id: "plyushchevyy-yenot",
  name: "Плющевий єнот",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 621,
  lore: {
    description: "Спритний звір із зеленими смугами на шерсті.",
    behavior: "Зарослі руїни.",
    abilities: ["використовує ліани, щоб хитатися над стежками й красти їжу"],
  },
});

/* monsters/plyushchovyy-pidminnyk.js */
Atlas.registerMonster({
  format: 2,
  id: "plyushchovyy-pidminnyk",
  name: "Плющовий Підмінник",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["wasteland", "hills", "grass"], worlds: "all" },
  order: 898,
  lore: {
    description: "Невеликий рослинний гуманоїд із тулубом із зелених кубиків і руками з довгих лоз.",
    behavior: "Ховається в садах зруйнованих фортець.",
    abilities: ["прикидається декоративною рослиною, а коли гравець проходить повз, хапає його за ноги й тягне до заростей"],
  },
});

/* monsters/polovyi-zhaivoronok.js */
Atlas.registerMonster({
  "format": 2,
  "id": "polovyi-zhaivoronok",
  "name": "Польовий жайворонок",
  "kind": "weak",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "tag:plain",
      "tag:farmland"
    ],
    "worlds": "all"
  },
  "order": 985,
  "lore": {
    "description": "Малий птах, що співає серед пшениці.",
    "behavior": "Тікає при наближенні.",
    "abilities": [
      "заспокійлива пісня"
    ],
    "drops": [
      "пір'я",
      "пшениця"
    ]
  }
});

/* monsters/popelyasti-khyzhaky.js */
Atlas.registerMonster({
  "format": 2,
  "id": "popelyasti-khyzhaky",
  "name": "Попелясті хижаки",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "chorni-sosny",
      "popelyasti-halyavyny",
      "vuhilni-pahorby",
      "smolyani-yary"
    ],
    "worlds": [
      "vuhlerod"
    ]
  },
  "order": 855,
  "lore": {
    "description": "Загроза світу «Вуглерод»."
  }
});

/* monsters/popelyastyy-arkhivarius.js */
Atlas.registerMonster({
  "format": 2,
  "id": "popelyastyy-arkhivarius",
  "name": "Попелястий Архіваріус",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "popelyasti-dyuny",
      "chorni-kratery",
      "siri-lisy",
      "sklyani-popelyshcha",
      "vitryani-nekropoli"
    ],
    "worlds": [
      "varhess"
    ]
  },
  "order": 743,
  "lore": {
    "description": "Попелястий Архіваріус відновлює власне тіло з попелу."
  }
});

/* monsters/popelyastyy-skokun.js */
Atlas.registerMonster({
  format: 2,
  id: "popelyastyy-skokun",
  name: "Попелястий Скокун",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["volcanic", "ashlands", "mountain", "hills"], worlds: "all" },
  order: 896,
  lore: {
    description: "Крихітний чорний звір із довгими задніми ногами та хвостом із сірих пластівців.",
    behavior: "Живе на схилах згаслих вулканів.",
    abilities: ["стрибає між гарячими каменями, розкидаючи попіл, що приховує пастки й дрібні ями"],
  },
});

/* monsters/popelyastyy-strybun.js */
Atlas.registerMonster({
  format: 2,
  id: "popelyastyy-strybun",
  name: "Попелястий стрибун",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["volcanic", "ashlands"], worlds: "all" },
  order: 566,
  lore: {
    description: "Жабоподібна істота, вкрита сухим попелом.",
    behavior: "Вулканічні рівнини.",
    abilities: ["під час стрибка здіймає хмару, що затуманює огляд"],
  },
});

/* monsters/popilnyi-chervak.js */
Atlas.registerMonster({
  "format": 2,
  "id": "popilnyi-chervak",
  "name": "Попільний черв'як",
  "kind": "weak",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "tag:hot",
      "tag:volcanic",
      "tag:ashlands"
    ],
    "worlds": "all"
  },
  "order": 965,
  "lore": {
    "description": "Довгий черв'як із тліючим хвостом.",
    "behavior": "Виповзає з попелу, обпалює ноги.",
    "abilities": [
      "тліючий укус",
      "залишає вогняні плями"
    ],
    "drops": [
      "попіл",
      "тліюча луска"
    ]
  }
});

/* monsters/poridni-holemy.js */
Atlas.registerMonster({
  "format": 2,
  "id": "poridni-holemy",
  "name": "Порідні големи",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "bili-paperovi-skeli",
      "riznokolorovi-terasy",
      "vitryani-stepy",
      "temni-sharovi-pechery"
    ],
    "worlds": [
      "paperon"
    ]
  },
  "order": 850,
  "lore": {
    "description": "Загроза світу «Паперон»."
  }
});

/* monsters/porozhnynni-myslyvtsi.js */
Atlas.registerMonster({
  "format": 2,
  "id": "porozhnynni-myslyvtsi",
  "name": "Порожнинні мисливці",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "plavayuchi-skhody",
      "sady-okremykh-plyt",
      "mosty-bez-kintsya",
      "porozhni-arkhivy",
      "kray-znyklykh-dorih"
    ],
    "worlds": [
      "neverion"
    ]
  },
  "order": 744,
  "lore": {
    "description": "Загроза світу «Неверіон»."
  }
});

/* monsters/portselyanovyy-snovydets.js */
Atlas.registerMonster({
  format: 2,
  id: "portselyanovyy-snovydets",
  name: "Порцеляновий Сновидець",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills", "grass"], worlds: "all" },
  order: 883,
  lore: {
    description: "Крихка істота з білої порцеляни, круглою головою та довгими руками, що закінчуються чашоподібними долонями.",
    behavior: "Живе в покинутих майстернях сновидців.",
    abilities: ["ловить у долоні частинки сну, викликаючи короткі марення, які змінюють сприйняття відстані"],
  },
});

/* monsters/poseydon.js */
Atlas.registerMonster({
  format: 1,
  id: "poseydon",
  name: "Посейдон",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["deep"], worlds: "all" },
  order: 89,
});

/* monsters/povitryani-zmiyi.js */
Atlas.registerMonster({
  "format": 2,
  "id": "povitryani-zmiyi",
  "name": "Повітряні змії",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "vitrovi-plato",
      "taiga",
      "hromovi-perevaly",
      "tykhi-dolyny"
    ],
    "worlds": [
      "valdren"
    ]
  },
  "order": 781,
  "lore": {
    "description": "Загроза світу «Вальдрен»."
  }
});

/* monsters/pozhyrach-dush.js */
Atlas.registerMonster({
  format: 2,
  id: "pozhyrach-dush",
  name: "Пожирач душ",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["grass", "wasteland", "ashlands"], worlds: "all" },
  order: 274,
  lore: {
    description: "Тіньовий демон.",
    behavior: "Зустрічається: прокляті поля битв.",
    abilities: ["висмоктує життєву силу", "створює темні зони", "викликає примар"],
  },
});

/* monsters/pozhyrach-dzerkalnoho-neba.js */
Atlas.registerMonster({
  format: 2,
  id: "pozhyrach-dzerkalnoho-neba",
  name: "Пожирач Дзеркального Неба",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 841,
  lore: {
    description: "Величезний плаский хижак із райдужних скляних пластин, що літає черевом догори.",
    behavior: "Кружляє над озерами, де вода віддзеркалює зорі навіть удень.",
    abilities: ["відбиває заклинання у випадкових напрямках і тимчасово копіює силует останнього супротивника, якого поглинув"],
  },
});

/* monsters/pozhyrach-kontynentiv.js */
Atlas.registerMonster({
  format: 2,
  id: "pozhyrach-kontynentiv",
  name: "Пожирач континентів",
  kind: "world-boss",
  nature: "threat",
  spawn: { biomes: ["mountain", "peaks", "hills"], worlds: "all" },
  order: 243,
  lore: {
    description: "Колосальний підземний звір.",
    behavior: "Зустрічається: глибокі розломи, підземні порожнини під горами.",
    abilities: ["розриває землю", "створює провалля", "викликає землетруси"],
  },
});

/* monsters/pozhyrach-moriv.js */
Atlas.registerMonster({
  "format": 2,
  "id": "pozhyrach-moriv",
  "name": "Пожирач Морів",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "kistyani-dyuny",
      "morya-frahmentiv",
      "cherepni-arkhipelahy",
      "bili-bolota",
      "skeletni-ryfy"
    ],
    "worlds": [
      "oskarium"
    ]
  },
  "order": 765,
  "lore": {
    "description": "Пожирач Морів збирає тіла з уламків."
  }
});

/* monsters/pozhyrach-ostannoho-promenya.js */
Atlas.registerMonster({
  "format": 2,
  "id": "pozhyrach-ostannoho-promenya",
  "name": "Пожирач Останнього Променя",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "midni-veresovyshcha",
      "bahryani-sosny",
      "sutinkovi-stepy",
      "syni-nichni-bolota",
      "kray-chornoho-sontsya"
    ],
    "worlds": [
      "vespern"
    ]
  },
  "order": 736,
  "lore": {
    "description": "Бос світу «Весперн»."
  }
});

/* monsters/pozhyrach-pershoho-zerna.js */
Atlas.registerMonster({
  "format": 2,
  "id": "pozhyrach-pershoho-zerna",
  "name": "Пожирач Першого Зерна",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "pervisni-sady",
      "kamyani-zarodky",
      "pylkovi-rivnyny",
      "korenevi-materyky",
      "skhovyshcha-nezarodzhenykh-svitiv"
    ],
    "worlds": [
      "arkhelor"
    ]
  },
  "order": 780,
  "lore": {
    "description": "Пожирач Першого Зерна прагне знищити всі можливі форми життя."
  }
});

/* monsters/pozhyrach-sonyachnoho-morya.js */
Atlas.registerMonster({
  "format": 2,
  "id": "pozhyrach-sonyachnoho-morya",
  "name": "Пожирач Сонячного Моря",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "zoloti-dyuny",
      "sklyani-oazy",
      "svitlovi-kanyony",
      "midni-plato",
      "pidzemni-sonyachni-morya"
    ],
    "worlds": [
      "heliontar"
    ]
  },
  "order": 748,
  "lore": {
    "description": "Бос світу «Геліонтар»."
  }
});

/* monsters/pozhyrach-svitanku.js */
Atlas.registerMonster({
  "format": 2,
  "id": "pozhyrach-svitanku",
  "name": "Пожирач Світанку",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "blakytnyy-pidlisok",
      "burshtynovi-halyavyny",
      "chervoni-korenevi-yary",
      "sribni-dibrovy",
      "chorni-dibrovy",
      "syniy-mokh",
      "lilovi-bolota",
      "zabuti-svitli-halyavyny"
    ],
    "worlds": [
      "lyumenvild"
    ]
  },
  "order": 795,
  "lore": {
    "description": "Бос світу «Люменвільд»."
  }
});

/* monsters/pozhyrach-svitiv.js */
Atlas.registerMonster({
  format: 1,
  id: "pozhyrach-svitiv",
  name: "Пожирач Світів",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["peaks", "wasteland", "ashlands", "volcanic"], worlds: "all" },
  order: 100,
});

/* monsters/pozhyrach-usikh-vidlun.js */
Atlas.registerMonster({
  format: 2,
  id: "pozhyrach-usikh-vidlun",
  name: "Пожирач усіх відлунь",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["grass"], worlds: "all" },
  order: 455,
  lore: {
    description: "Безликий велетень із дзеркальними ребрами.",
    behavior: "Долина, у якій не чути голосів.",
    abilities: ["краде звуки здібностей і відтворює їх у посиленій, викривленій формі"],
  },
});

/* monsters/pozhyrach-veselkovykh-mostiv.js */
Atlas.registerMonster({
  format: 2,
  id: "pozhyrach-veselkovykh-mostiv",
  name: "Пожирач веселкових мостів",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["peaks"], worlds: "all" },
  order: 468,
  lore: {
    description: "Крилатий хижак із довгим дзьобом.",
    behavior: "Небесні провалля.",
    abilities: ["перекушує магічні переправи й кидає гравця на нижні рівні арени"],
  },
});

/* monsters/pozhyrach-zirok.js */
Atlas.registerMonster({
  format: 2,
  id: "pozhyrach-zirok",
  name: "Пожирач зірок",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["peaks"], worlds: "all" },
  order: 252,
  lore: {
    description: "Космічний звір.",
    behavior: "Зустрічається: місця падіння небесних уламків.",
    abilities: ["темніє небо", "поглинає магічне світло", "випускає руйнівні промені"],
  },
});

/* monsters/pradavniy-dendroyid.js */
Atlas.registerMonster({
  format: 1,
  id: "pradavniy-dendroyid",
  name: "Прадавній Дендроїд",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga", "enchanted"], worlds: "all" },
  order: 75,
});

/* monsters/pradavniy-drakon-volodar.js */
Atlas.registerMonster({
  format: 1,
  id: "pradavniy-drakon-volodar",
  name: "Прадавній Дракон-Володар",
  kind: "world-boss",
  nature: "magic",
  variants: ["Золотий", "Чорний", "Кришталевий"],
  spawn: { biomes: ["peaks", "mountain", "volcanic"], worlds: "all" },
  order: 101,
});

/* monsters/pradavniy-ent.js */
Atlas.registerMonster({
  format: 1,
  id: "pradavniy-ent",
  name: "Прадавній Ент",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga", "enchanted"], worlds: "all" },
  order: 65,
});

/* monsters/pradavniy-hnol-oskvernytel.js */
Atlas.registerMonster({
  format: 1,
  id: "pradavniy-hnol-oskvernytel",
  name: "Прадавній Гнол-Осквернитель",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga", "enchanted"], worlds: "all" },
  order: 71,
});

/* monsters/pradavnya-karka.js */
Atlas.registerMonster({
  format: 1,
  id: "pradavnya-karka",
  name: "Прадавня Карка",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["hills", "mountain", "peaks"], worlds: "all" },
  order: 58,
});

/* monsters/pradavnya-matrona.js */
Atlas.registerMonster({
  "format": 2,
  "id": "pradavnya-matrona",
  "name": "Прадавня Матрона",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "medovi-luky",
      "voskovi-skeli",
      "smolyani-roshchi",
      "porozhnysti-vulyky"
    ],
    "worlds": [
      "medokray"
    ]
  },
  "order": 872,
  "lore": {
    "description": "Бос світу «Медокрай»."
  }
});

/* monsters/pramatir-burshtynovykh-royiv.js */
Atlas.registerMonster({
  format: 2,
  id: "pramatir-burshtynovykh-royiv",
  name: "Праматір Бурштинових Роїв",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga"], worlds: "all" },
  order: 848,
  lore: {
    description: "Величезна комахоподібна матка з напівпрозорого бурштину, усередині якого застигли дрібні істоти.",
    behavior: "Мешкає у викопному лісі, де дерева збереглися в золотій смолі.",
    abilities: ["розкриває панцир і випускає рій, що збирає кинуті предмети та перетворює їх на додаткові сегменти її броні"],
  },
});

/* monsters/pramatir-kryzhanykh-skrypiv.js */
Atlas.registerMonster({
  format: 2,
  id: "pramatir-kryzhanykh-skrypiv",
  name: "Праматір Крижаних Скрипів",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["peaks", "snow"], worlds: "all" },
  order: 752,
  lore: {
    description: "Багатосуглобова істота, схожа на складену гармошку з крижаних пластин і рогатих льодових дуг.",
    behavior: "Живе під Льодовиком Тихих Вітрів.",
    abilities: ["стискає тіло, випускаючи скрипучі звукові хвилі, які скуковують рухливі суглоби та тріскають захисні споруди"],
  },
});

/* monsters/proklyatyy-lytsar-pikhotynets.js */
Atlas.registerMonster({
  format: 2,
  id: "proklyatyy-lytsar-pikhotynets",
  name: "Проклятий лицар-піхотинець",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills", "grass"], worlds: "all" },
  order: 361,
  lore: {
    description: "Звичайна нежить.",
    behavior: "Зустрічається: старі дороги, кладовища.",
    abilities: ["меч", "іржава броня"],
  },
});

/* monsters/pruzhynnyy-zhabohryz.js */
Atlas.registerMonster({
  format: 2,
  id: "pruzhynnyy-zhabohryz",
  name: "Пружинний Жабогриз",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["swamp", "peaks"], worlds: "all" },
  order: 786,
  lore: {
    description: "Кубічна жабоподібна істота з широкою щелепою та задніми ногами, скрученими, наче очеретяні пружини.",
    behavior: "Полює між болотяними острівцями.",
    abilities: ["стискається в щільний блок і відскакує ламаною траєкторією, кусаючи все на своєму шляху"],
  },
});

/* monsters/prymarna-narechena.js */
Atlas.registerMonster({
  format: 2,
  id: "prymarna-narechena",
  name: "Примарна наречена",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 319,
  lore: {
    description: "Привид.",
    behavior: "Зустрічається: покинуті маєтки.",
    abilities: ["морозний дотик", "ілюзії", "зникнення"],
  },
});

/* monsters/prymarnyy-lytsar-luchnyk.js */
Atlas.registerMonster({
  format: 2,
  id: "prymarnyy-lytsar-luchnyk",
  name: "Примарний лицар-лучник",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 341,
  lore: {
    description: "Елітна нежить.",
    behavior: "Зустрічається: туманні руїни.",
    abilities: ["стріли крізь перешкоди", "коротка невидимість"],
  },
});

/* monsters/prymarnyy-moryak.js */
Atlas.registerMonster({
  format: 2,
  id: "prymarnyy-moryak",
  name: "Примарний моряк",
  kind: "other",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 427,
  lore: {
    description: "Водна нежить.",
    behavior: "Зустрічається: корабельні руїни, туманні бухти.",
    abilities: ["примарний абордажний гак", "морозний дотик"],
  },
});

/* monsters/prymarnyy-olen-volodar.js */
Atlas.registerMonster({
  format: 2,
  id: "prymarnyy-olen-volodar",
  name: "Примарний олень-володар",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["enchanted", "forest", "taiga"], worlds: "all" },
  order: 287,
  lore: {
    description: "Дух-звір.",
    behavior: "Зустрічається: зачаровані гаї.",
    abilities: ["телепортація", "примарні роги", "виклик туману"],
  },
});

/* monsters/prymarnyy-vartovyy.js */
Atlas.registerMonster({
  format: 2,
  id: "prymarnyy-vartovyy",
  name: "Примарний вартовий",
  kind: "other",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 362,
  lore: {
    description: "Звичайний привид.",
    behavior: "Зустрічається: руїни.",
    abilities: ["проходить крізь перешкоди", "морозний дотик"],
  },
});

/* monsters/pryplyvnyy-tytan.js */
Atlas.registerMonster({
  "format": 2,
  "id": "pryplyvnyy-tytan",
  "name": "Припливний Титан",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "khvylovi-rivnyny",
      "hranatovi-morya",
      "skelni-delty",
      "bazaltovi-pryplyvy",
      "porozhni-kamyani-bukhty"
    ],
    "worlds": [
      "drumbor"
    ]
  },
  "order": 724,
  "lore": {
    "description": "Припливний Титан здіймає ціле море над гравцем."
  }
});

/* monsters/pryplyvova-kasatka.js */
Atlas.registerMonster({
  "format": 2,
  "id": "pryplyvova-kasatka",
  "name": "Приплив-касатка",
  "kind": "mini-boss",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "tag:shore",
      "tag:water",
      "tag:sea",
      "tag:fresh"
    ],
    "worlds": "all"
  },
  "order": 979,
  "lore": {
    "description": "Чорно-білий кит-вартовий, що виринає на мілководді.",
    "behavior": "Нападає на судна й тих, хто ступає в воду.",
    "abilities": [
      "хвильовий удар хвостом",
      "затягує на глибину"
    ],
    "drops": [
      "китовий жир",
      "перлина припливу"
    ]
  }
});

/* monsters/pryvydy-shlyakhiv.js */
Atlas.registerMonster({
  format: 1,
  id: "pryvydy-shlyakhiv",
  name: "Привиди шляхів",
  kind: "other",
  nature: "magic",
  spawn: { biomes: ["grass", "steppe", "wasteland", "hills"], worlds: "all" },
  order: 134,
});

/* monsters/pryzma-koloh.js */
Atlas.registerMonster({
  "format": 2,
  "id": "pryzma-koloh",
  "name": "Призма-коло",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "tag:crystal",
      "tag:glass"
    ],
    "worlds": "all"
  },
  "order": 964,
  "lore": {
    "description": "Колосальна призма, що кружляє над долиною й розкладає сонце на промені.",
    "behavior": "Прокидається на світанку й палить усе кольоровими променями.",
    "abilities": [
      "розкладає світло на шість променів",
      "дзеркала-двійники",
      "осліплює при руйнуванні"
    ],
    "drops": [
      "серце-призма",
      "уламок веселки"
    ]
  }
});

/* monsters/psar-iz-rozkolotoyi-orbity.js */
Atlas.registerMonster({
  format: 2,
  id: "psar-iz-rozkolotoyi-orbity",
  name: "Псарь із Розколотої Орбіти",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "volcanic"], worlds: "all" },
  order: 751,
  lore: {
    description: "Велетенський чотириногий звір із темного небесного каменю, оперезаний уламками світних кілець.",
    behavior: "Полює в кратерах Зорепаду.",
    abilities: ["його стрибки нахиляють силу тяжіння, змушуючи гравця ковзати до краю скель або падати на стіни"],
  },
});

/* monsters/pukhnastyy-kamenepad.js */
Atlas.registerMonster({
  format: 2,
  id: "pukhnastyy-kamenepad",
  name: "Пухнастий Каменепад",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 919,
  lore: {
    description: "Кругла істота з густим сірим хутром і твердим кам'яним ядром усередині.",
    behavior: "Живе на сипких гірських стежках.",
    abilities: ["згортається в кулю й котиться вниз схилами, збираючи дрібне каміння у власну шерсть, через що поступово збільшується"],
  },
});

/* monsters/pukhnastyy-kameneriz.js */
Atlas.registerMonster({
  format: 2,
  id: "pukhnastyy-kameneriz",
  name: "Пухнастий каменеріз",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 624,
  lore: {
    description: "Невеликий гризун із твердими різцями.",
    behavior: "Гірські розсипи.",
    abilities: ["прогризає мінеральні жили в скелях"],
  },
});

/* monsters/pukhnastyy-kistkozher.js */
Atlas.registerMonster({
  format: 2,
  id: "pukhnastyy-kistkozher",
  name: "Пухнастий кісткожер",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 562,
  lore: {
    description: "Невеликий звір із м’якою сірою шерстю та міцними щелепами.",
    behavior: "Занедбані склепи.",
    abilities: ["згризає кістяні укриття й відновлюється на рештках"],
  },
});

/* monsters/pukhnastyy-pylozbyrach.js */
Atlas.registerMonster({
  format: 2,
  id: "pukhnastyy-pylozbyrach",
  name: "Пухнастий пилозбирач",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga"], worlds: "all" },
  order: 722,
  lore: {
    description: "Маленький круглий звір із довгою шерстю.",
    behavior: "Осінні ліси.",
    abilities: ["під час бігу збирає сухе листя й пил, утворюючи клубок"],
  },
});

/* monsters/pukhopyl.js */
Atlas.registerMonster({
  format: 2,
  id: "pukhopyl",
  name: "Пухопил",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["peaks"], worlds: "all" },
  order: 814,
  lore: {
    description: "Крихітний рій золотавих пухнастих спор, що зливаються в одну хмаринку.",
    behavior: "Мешкає в сінниках старих вітряків.",
    abilities: ["осідає на ліхтарях і розсіює їхнє світло, створюючи напівтемряву, в якій ховаються інші дрібні істоти"],
  },
});

/* monsters/pukhovyy-strybun.js */
Atlas.registerMonster({
  format: 2,
  id: "pukhovyy-strybun",
  name: "Пуховий стрибун",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["peaks", "grass", "hills"], worlds: "all" },
  order: 649,
  lore: {
    description: "Дрібна комаха, вкрита м’якими білими волокнами.",
    behavior: "Вітряні луки.",
    abilities: ["високо підстрибує та засипає ворога легким пухом, що погіршує видимість"],
  },
});

/* monsters/pukhyrchasta-babusya-zhuk.js */
Atlas.registerMonster({
  format: 2,
  id: "pukhyrchasta-babusya-zhuk",
  name: "Пухирчаста бабуся-жук",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 666,
  lore: {
    description: "Кругла комаха з рядами прозорих пухирців.",
    behavior: "Теплі джерела.",
    abilities: ["лускає їх, залишаючи слизькі краплі"],
  },
});

/* monsters/pukhyrchastyy-bolotnyk.js */
Atlas.registerMonster({
  format: 2,
  id: "pukhyrchastyy-bolotnyk",
  name: "Пухирчастий болотник",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["swamp"], worlds: "all" },
  order: 533,
  lore: {
    description: "Істота з м’яким тілом і великими газовими бульбашками.",
    behavior: "Теплі смердючі болота.",
    abilities: ["лускає бульбашки, випускаючи отруйний туман"],
  },
});

/* monsters/pukhyrchastyy-mandrivnyk.js */
Atlas.registerMonster({
  format: 2,
  id: "pukhyrchastyy-mandrivnyk",
  name: "Пухирчастий мандрівник",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["swamp"], worlds: "all" },
  order: 592,
  lore: {
    description: "Круглий монстр, наповнений легким газом.",
    behavior: "Болотяні стежки.",
    abilities: ["підстрибує над поверхнею й розкидає слизькі бульбашки"],
  },
});

/* monsters/pukhyrchastyy-vodomalyuk.js */
Atlas.registerMonster({
  format: 2,
  id: "pukhyrchastyy-vodomalyuk",
  name: "Пухирчастий водомалюк",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 733,
  lore: {
    description: "Дрібна водяна істота з прозорими бульбашками на спині.",
    behavior: "Мілкі ставки.",
    abilities: ["лускає їх, залишаючи водяні бризки"],
  },
});

/* monsters/pukhyrnyk-vitryanykh-luk.js */
Atlas.registerMonster({
  format: 2,
  id: "pukhyrnyk-vitryanykh-luk",
  name: "Пухирник Вітряних Лук",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["grass", "hills"], worlds: "all" },
  order: 862,
  lore: {
    description: "Округлий звір із блакитного пуху та шести тонких ніжок.",
    behavior: "Мешкає на високих луках, де трава росте горизонтально.",
    abilities: ["набирає повітря у величезні щоки й відштовхує супротивників серіями поривів, але сам легко зноситься вітром"],
  },
});

/* monsters/pukhyrnyy-som.js */
Atlas.registerMonster({
  format: 2,
  id: "pukhyrnyy-som",
  name: "Пухирний Сом",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["wasteland", "hills", "lake"], worlds: "all" },
  order: 815,
  lore: {
    description: "Кремезна риба з широкою квадратною головою та прозорими міхурами вздовж боків.",
    behavior: "Мешкає в затоплених криптах.",
    abilities: ["лускає міхури, випускаючи водяні ударні хвилі, які збивають предмети з рук і розкидають дрібну здобич"],
  },
});

/* monsters/pustelna-hiyena.js */
Atlas.registerMonster({
  format: 2,
  id: "pustelna-hiyena",
  name: "Пустельна гієна",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills", "desert"], worlds: "all" },
  order: 375,
  lore: {
    description: "Звір-хижак.",
    behavior: "Зустрічається: пустелі, каньйони.",
    abilities: ["атаки зграєю", "добивання ослаблених цілей"],
  },
});

/* monsters/pustelnyy-reyder.js */
Atlas.registerMonster({
  format: 2,
  id: "pustelnyy-reyder",
  name: "Пустельний рейдер",
  kind: "monster",
  nature: "threat",
  variants: ["пустельний кочівник-рейдер", "пустельний списоносець"],
  spawn: { biomes: ["desert", "mountain", "hills"], worlds: "all" },
  order: 359,
  lore: {
    description: "Звичайний гуманоїд. Об'єднує схожих істот: пустельний кочівник-рейдер, пустельний списоносець.",
    behavior: "Зустрічається: пустелі, караванні шляхи; каньйони.",
    abilities: ["шабля", "піщаний пил", "довгий спис", "засідки з-за каміння"],
  },
});

/* monsters/pustelnyy-skorpion.js */
Atlas.registerMonster({
  format: 2,
  id: "pustelnyy-skorpion",
  name: "Пустельний скорпіон",
  kind: "monster",
  nature: "threat",
  variants: ["великий пустельний скорпіон", "скорпіон-піщаник", "малий пустельний скорпіон"],
  spawn: { biomes: ["desert"], worlds: "all" },
  order: 329,
  lore: {
    description: "Елітна комаха. Об'єднує схожих істот: великий пустельний скорпіон, скорпіон-піщаник, малий пустельний скорпіон.",
    behavior: "Зустрічається: пустелі; піщані дюни.",
    abilities: ["отруйне жало", "клешні", "засідки в піску", "маскування в піску", "слабка отрута", "швидкі укуси"],
  },
});

/* monsters/puzyrchastyy-skat.js */
Atlas.registerMonster({
  format: 2,
  id: "puzyrchastyy-skat",
  name: "Пузирчастий скат",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 685,
  lore: {
    description: "Круглий скат із газовими камерами на спині.",
    behavior: "Лагуни.",
    abilities: ["піднімається до поверхні й випускає бульбашкові снаряди"],
  },
});

/* monsters/pyatoperyy-slidopyt.js */
Atlas.registerMonster({
  format: 2,
  id: "pyatoperyy-slidopyt",
  name: "П’ятоперий Слідопит",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills", "desert"], worlds: "all" },
  order: 781,
  lore: {
    description: "Довготіла ящіркоподібна істота з п’ятьма віялами пір’я на спині, кожне з яких реагує на окремий запах.",
    behavior: "Водиться в солоних ущелинах.",
    abilities: ["чіпляється кігтями до стін і вистежує конкретну ціль навіть крізь воду чи густу рослинність"],
  },
});

/* monsters/pyatyholovyy-mlynar-tiney.js */
Atlas.registerMonster({
  format: 2,
  id: "pyatyholovyy-mlynar-tiney",
  name: "П’ятиголовий млинар тіней",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["peaks"], worlds: "all" },
  order: 464,
  lore: {
    description: "Велетенський звір із п’ятьма головами різної форми.",
    behavior: "Темні вітряки забутого краю.",
    abilities: ["кожна голова створює іншу ілюзію арени"],
  },
});

/* monsters/pyavka.js */
Atlas.registerMonster({
  format: 2,
  id: "pyavka",
  name: "П'явка",
  kind: "monster",
  nature: "threat",
  variants: ["болотяна п’явка", "малий болотяний п’явун"],
  spawn: { biomes: ["lake", "swamp"], worlds: "all" },
  order: 429,
  lore: {
    description: "Паразит. Об'єднує схожих істот: болотяна п’явка, малий болотяний п’явун.",
    behavior: "Зустрічається: трясовини, каламутні ставки; болота.",
    abilities: ["присмоктується й висмоктує життєву силу", "присмоктується", "повільно виснажує"],
  },
});

/* monsters/pylokryl.js */
Atlas.registerMonster({
  format: 2,
  id: "pylokryl",
  name: "Пилокрил",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga", "grass"], worlds: "all" },
  order: 867,
  lore: {
    description: "Невелика літаюча істота з чотирма крильцями, схожими на листки, і круглим бурштиновим черевцем.",
    behavior: "Мешкає на галявинах гігантських квітів.",
    abilities: ["обсипає ворогів пилком, що змушує їх на короткий час бачити фальшиві контури предметів"],
  },
});

/* monsters/pylovi-hihanty.js */
Atlas.registerMonster({
  "format": 2,
  "id": "pylovi-hihanty",
  "name": "Пилові гіганти",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "popelyasti-dyuny",
      "chorni-kratery",
      "siri-lisy",
      "sklyani-popelyshcha",
      "vitryani-nekropoli"
    ],
    "worlds": [
      "varhess"
    ]
  },
  "order": 742,
  "lore": {
    "description": "Загроза світу «Варгесс»."
  }
});

/* monsters/pylovyi-skarabei.js */
Atlas.registerMonster({
  "format": 2,
  "id": "pylovyi-skarabei",
  "name": "Пиловий скарабей",
  "kind": "weak",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "tag:dry"
    ],
    "worlds": "all"
  },
  "order": 953,
  "lore": {
    "description": "Дрібний жук, що збирає пил у кульки.",
    "behavior": "Котить кульку просто через дорогу.",
    "abilities": [
      "пилова завіса",
      "кусає за ногу"
    ],
    "drops": [
      "пилова кулька"
    ]
  }
});

/* monsters/pylovyy-krit-veyernyk.js */
Atlas.registerMonster({
  format: 2,
  id: "pylovyy-krit-veyernyk",
  name: "Пиловий Кріт-Веєрник",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["desert", "wasteland", "mountain", "hills"], worlds: "all" },
  order: 804,
  lore: {
    description: "Великий кріт із віялоподібними лопатами на передніх лапах і широким пласким носом.",
    behavior: "Мешкає під пісковиковими терасами.",
    abilities: ["вириває спіральні вентиляційні шахти, що засмоктують пісок і створюють короткі вирви під ногами ворога"],
  },
});

/* monsters/pylovyy-metalnyk.js */
Atlas.registerMonster({
  format: 2,
  id: "pylovyy-metalnyk",
  name: "Пиловий метальник",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 546,
  lore: {
    description: "Худий пустельний гуманоїд із кам’яною пращею.",
    behavior: "Сухі ущелини.",
    abilities: ["засліплює супротивника піщаними зарядами"],
  },
});

/* monsters/pysar-kryvavykh-pryplyviv.js */
Atlas.registerMonster({
  format: 2,
  id: "pysar-kryvavykh-pryplyviv",
  name: "Писар кривавих припливів",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 474,
  lore: {
    description: "Плаский скатоподібний монстр із довгими кістяними перами.",
    behavior: "Затоплений архів.",
    abilities: ["малює на землі руни, з яких вириваються червоні водяні стовпи"],
  },
});

/* monsters/red-scorpion-queen.js */
Atlas.registerMonster({
  "format": 2,
  "id": "red-scorpion-queen",
  "name": "Королева Червоних Скорпіонів",
  "kind": "boss",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "dried-vessel-gardens",
      "black-rifts"
    ],
    "worlds": [
      "krovostep"
    ]
  },
  "order": 223,
  "lore": {
    "description": "Велетенська королева гнізда червоних скорпіонів.",
    "behavior": "Ховається в гнізді, викликає виводок.",
    "abilities": [
      "виклик виводку",
      "отруйне жало"
    ],
    "drops": [
      "королівська отрута"
    ]
  }
});

/* monsters/red-scorpion.js */
Atlas.registerMonster({
  "format": 2,
  "id": "red-scorpion",
  "name": "Червоний скорпіон",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "wasteland",
      "dried-vessel-gardens",
      "black-rifts"
    ],
    "worlds": [
      "krovostep"
    ]
  },
  "order": 218,
  "lore": {
    "description": "Скорпіон, що ховається під поверхнею й чекає на здобич.",
    "behavior": "Засідки під піском.",
    "abilities": [
      "отруйне жало",
      "зариття"
    ],
    "drops": [
      "отрута",
      "панцир"
    ]
  }
});

/* monsters/rektor-hrybnoho-doshchu.js */
Atlas.registerMonster({
  format: 2,
  id: "rektor-hrybnoho-doshchu",
  name: "Ректор Грибного Дощу",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["grass", "hills"], worlds: "all" },
  order: 762,
  lore: {
    description: "Довготелесий грибний чаклун із широким капелюхом-парасолею, ніжками-руками та поясом із порожніх спорних коробочок.",
    behavior: "Мешкає в Обсерваторії Спор.",
    abilities: ["викликає зливу квадратних грибів, які перетворюються на тимчасові платформи або вибухають звуковими хвилями при наступанні"],
  },
});

/* monsters/remains-collector.js */
Atlas.registerMonster({
  "format": 2,
  "id": "remains-collector",
  "name": "Збирач решток",
  "kind": "other",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "citadel-graveyard",
      "petrified-shore",
      "ashlands"
    ],
    "worlds": [
      "ostanky"
    ]
  },
  "order": 212,
  "lore": {
    "description": "Розумна істота, що будує житла з деталей загиблих світів.",
    "behavior": "Збирає все, що може нести; торгує або нападає.",
    "abilities": [
      "збирання",
      "тяжка ноша",
      "торгівля"
    ],
    "drops": [
      "фрагменти зачарованих конструкцій"
    ]
  }
});

/* monsters/reyderski-karavany.js */
Atlas.registerMonster({
  "format": 2,
  "id": "reyderski-karavany",
  "name": "Рейдерські каравани",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "zoloti-dyuny",
      "chorni-kamyani-ryfy",
      "midni-oazy",
      "pokhovani-porty"
    ],
    "worlds": [
      "vitroparus"
    ]
  },
  "order": 868,
  "lore": {
    "description": "Загроза світу «Вітропарус»."
  }
});

/* monsters/richkovyy-kameneplav.js */
Atlas.registerMonster({
  format: 2,
  id: "richkovyy-kameneplav",
  name: "Річковий каменеплав",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 707,
  lore: {
    description: "Витягнута риба з плоскими плавниками.",
    behavior: "Порожисті річки.",
    abilities: ["втискається між галькою й пересуває каміння, змінюючи течію"],
  },
});

/* monsters/richkovyy-kusaka.js */
Atlas.registerMonster({
  format: 2,
  id: "richkovyy-kusaka",
  name: "Річковий кусака",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 411,
  lore: {
    description: "Водний хижак.",
    behavior: "Зустрічається: річки, мілководдя.",
    abilities: ["раптові укуси з-під води"],
  },
});

/* monsters/richkovyy-lotsman.js */
Atlas.registerMonster({
  format: 2,
  id: "richkovyy-lotsman",
  name: "Річковий Лоцман",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 823,
  lore: {
    description: "Невисока амфібія зі світними вусами, долонями-лопатями й поясом із гладких річкових каменів.",
    behavior: "Водиться в річкових дельтах.",
    abilities: ["розкладає камені, змінюючи напрямок дрібних течій і створюючи небезпечні вирви, але уникає сутичок, поки не порушать його стежку"],
  },
});

/* monsters/richkovyy-shchypach.js */
Atlas.registerMonster({
  format: 2,
  id: "richkovyy-shchypach",
  name: "Річковий щипач",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 520,
  lore: {
    description: "Довгий водяний хижак із парою надзвичайно сильних клешень.",
    behavior: "Вузькі річкові каньйони.",
    abilities: ["хапає за ноги й тягне у вир"],
  },
});

/* monsters/richkovyy-strybun.js */
Atlas.registerMonster({
  format: 2,
  id: "richkovyy-strybun",
  name: "Річковий стрибун",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 639,
  lore: {
    description: "Гладкий звір із широкими задніми лапами.",
    behavior: "Порожисті річки.",
    abilities: ["перестрибує між каменями й відкидає водяні бризки"],
  },
});

/* monsters/richkovyy-vodyanyk.js */
Atlas.registerMonster({
  format: 2,
  id: "richkovyy-vodyanyk",
  name: "Річковий водяник",
  kind: "other",
  nature: "magic",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 421,
  lore: {
    description: "Водний дух.",
    behavior: "Зустрічається: річкові пороги, старі мости.",
    abilities: ["створює вирви", "тягне істот під воду"],
  },
});

/* monsters/riy-popelyastykh-pelyustok.js */
Atlas.registerMonster({
  format: 2,
  id: "riy-popelyastykh-pelyustok",
  name: "Рій попелястих пелюсток",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["volcanic", "ashlands"], worlds: "all" },
  order: 664,
  lore: {
    description: "Група комах, схожих на сухі квіткові пелюстки.",
    behavior: "Згарища.",
    abilities: ["розпадається на окремих істот і знову збирається в хмару"],
  },
});

/* monsters/rizbyar-lystya.js */
Atlas.registerMonster({
  format: 2,
  id: "rizbyar-lystya",
  name: "Різьбяр листя",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga", "grass", "hills"], worlds: "all" },
  order: 647,
  lore: {
    description: "Довга комаха з лезоподібними передніми лапами.",
    behavior: "Густі сади.",
    abilities: ["вирізає з листя гострі пластинки та кидає їх"],
  },
});

/* monsters/rohach-kvitkovoho-popelu.js */
Atlas.registerMonster({
  format: 2,
  id: "rohach-kvitkovoho-popelu",
  name: "Рогач Квіткового Попелу",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["grass"], worlds: "all" },
  order: 915,
  lore: {
    description: "Невеликий звір із чорним тілом і рогами, схожими на сухі квіткові стебла.",
    behavior: "Мешкає на полях після магічних пожеж.",
    abilities: ["розкидає попіл, що осідає на рослинах і змушує їх тимчасово закриватися, позбавляючи гравця природних укриттів"],
  },
});

/* monsters/rohata-korchma.js */
Atlas.registerMonster({
  format: 2,
  id: "rohata-korchma",
  name: "Рогата корчма",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga", "grass", "hills"], worlds: "all" },
  order: 492,
  lore: {
    description: "Ходяча дерев’яна будівля на коренях, усередині якої живе хижак.",
    behavior: "Старий трактовий ліс.",
    abilities: ["вікна стають очима, а двері — щелепами"],
  },
});

/* monsters/rohata-pylova-kishka.js */
Atlas.registerMonster({
  format: 2,
  id: "rohata-pylova-kishka",
  name: "Рогата пилова кішка",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["desert"], worlds: "all" },
  order: 517,
  lore: {
    description: "Пустельний хижак із короткими рогами над очима.",
    behavior: "Червоні бархани.",
    abilities: ["зникає в пилу й атакує збоку"],
  },
});

/* monsters/rohatyy-bolotozher.js */
Atlas.registerMonster({
  format: 2,
  id: "rohatyy-bolotozher",
  name: "Рогатий болотожер",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 548,
  lore: {
    description: "Важка напівводна тварина з рогами, зарослими мохом.",
    behavior: "Болотні береги.",
    abilities: ["плюється грудками багнюки, що сповільнюють рух"],
  },
});

/* monsters/rohatyy-hromoverzhets.js */
Atlas.registerMonster({
  "format": 2,
  "id": "rohatyy-hromoverzhets",
  "name": "Рогатий Громовержець",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "synohromovi-stepy",
      "sklyani-kanyony",
      "burshtynovi-vysoty",
      "hromovi-bolota",
      "chorni-providni-pechery",
      "hromovi-stepy",
      "chorni-plato",
      "sukhi-veresovyshcha",
      "dolyny-blyskavychnoho-kamenyu"
    ],
    "worlds": [
      "eshkariya"
    ]
  },
  "order": 719,
  "lore": {
    "description": "Бос світу «Ешкарія»."
  }
});

/* monsters/rohatyy-kaban.js */
Atlas.registerMonster({
  format: 2,
  id: "rohatyy-kaban",
  name: "Рогатий кабан",
  kind: "monster",
  nature: "magic",
  variants: ["рогатий кабан", "червоноглазий лісовий кабан"],
  spawn: { biomes: ["forest", "taiga", "mountain", "hills"], worlds: "all" },
  order: 350,
  lore: {
    description: "Магічний звір. Об'єднує схожих істот: рогатий кабан, червоноглазий лісовий кабан.",
    behavior: "Зустрічається: гірські ліси; густі ліси.",
    abilities: ["посилений таран", "кам’яні роги", "серії таранів", "розкопування землі"],
  },
});

/* monsters/rohatyy-patriarkh.js */
Atlas.registerMonster({
  "format": 2,
  "id": "rohatyy-patriarkh",
  "name": "Рогатий Патріарх",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "vysokotravya",
      "kamyani-vodopoyi",
      "chervoni-pahorby",
      "tumanni-zaplavy"
    ],
    "worlds": [
      "veletraviya"
    ]
  },
  "order": 819,
  "lore": {
    "description": "Бос світу «Велетравія»."
  }
});

/* monsters/rohatyy-voron.js */
Atlas.registerMonster({
  format: 2,
  id: "rohatyy-voron",
  name: "Рогатий ворон",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga"], worlds: "all" },
  order: 377,
  lore: {
    description: "Магічний птах.",
    behavior: "Зустрічається: темні ліси.",
    abilities: ["крик", "що дезорієнтує", "крадіжка дрібних предметів"],
  },
});

/* monsters/rohatyy-zemleriz.js */
Atlas.registerMonster({
  format: 2,
  id: "rohatyy-zemleriz",
  name: "Рогатий землеріз",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["grass"], worlds: "all" },
  order: 634,
  lore: {
    description: "Підземний звір із двома пласкими рогами.",
    behavior: "Кротові поля.",
    abilities: ["прокладає прямі тунелі крізь м’який ґрунт"],
  },
});

/* monsters/root-giant.js */
Atlas.registerMonster({
  "format": 2,
  "id": "root-giant",
  "name": "Кореневий велет",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "garden-branches",
      "root-coasts",
      "grass",
      "forest"
    ],
    "worlds": [
      "astrakor"
    ]
  },
  "order": 200,
  "lore": {
    "description": "Велетень із живого коріння й кори, що вдає з себе дерево.",
    "behavior": "Стоїть нерухомо серед лісу, нападає на тих, хто підійшов упритул.",
    "abilities": [
      "маскування під дерево",
      "удар корінням",
      "оплутування"
    ],
    "drops": [
      "зоряне дерево",
      "кореневий бурштин"
    ]
  }
});

/* monsters/root-mother.js */
Atlas.registerMonster({
  "format": 2,
  "id": "root-mother",
  "name": "Матір Коренів",
  "kind": "boss",
  "nature": "magic",
  "alias": "Керманичка Коренів",
  "spawn": {
    "biomes": [
      "garden-branches",
      "star-caverns"
    ],
    "worlds": [
      "astrakor"
    ]
  },
  "order": 205,
  "lore": {
    "description": "Правителька кореневих істот: ніби живе коріння, зібране в одну велетенську постать.",
    "behavior": "Керує кореневими велетами й коренегризами, відновлює їх із коріння.",
    "abilities": [
      "виклик кореневих істот",
      "оплутування",
      "відновлення"
    ],
    "drops": [
      "серце коріння",
      "зоряне дерево"
    ]
  }
});

/* monsters/rooted-beast.js */
Atlas.registerMonster({
  "format": 2,
  "id": "rooted-beast",
  "name": "Товстошкірий кореневий звір",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "jungle",
      "moss-trunks"
    ],
    "worlds": [
      "vershynnytsia"
    ]
  },
  "order": 227,
  "lore": {
    "description": "Товстошкірий звір нижнього лісу.",
    "behavior": "Бродить у підліску, не боїться дрібних істот.",
    "abilities": [
      "таран",
      "товста шкіра"
    ],
    "drops": [
      "міцна шкіра"
    ]
  }
});

/* monsters/rozbytyy-arkhont.js */
Atlas.registerMonster({
  "format": 2,
  "id": "rozbytyy-arkhont",
  "name": "Розбитий Архонт",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "pechatkovi-plato",
      "siri-runni-skeli",
      "zacharovani-dolyny",
      "chorni-zaly"
    ],
    "worlds": [
      "runozem"
    ]
  },
  "order": 831,
  "lore": {
    "description": "Бос світу «Рунозем»."
  }
});

/* monsters/rozkolopazur.js */
Atlas.registerMonster({
  format: 2,
  id: "rozkolopazur",
  name: "Розколопазур",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 800,
  lore: {
    description: "Приземкувата ящірка з двома зчепленими броньованими частинами тіла та товстим пласким хвостом.",
    behavior: "Живе серед шаруватих скель.",
    abilities: ["під час втечі залишає задню броньовану частину як рухому перешкоду, а сама тікає в ущелину"],
  },
});

/* monsters/rozlyucheni-ostrovy.js */
Atlas.registerMonster({
  "format": 2,
  "id": "rozlyucheni-ostrovy",
  "name": "Розлючені острови",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "kochovi-luky",
      "korenevi-berehy",
      "pantsyrni-lisy",
      "koralovi-plato",
      "mihratsiyni-bolota"
    ],
    "worlds": [
      "litarkh"
    ]
  },
  "order": 753,
  "lore": {
    "description": "Загроза світу «Літарх»."
  }
});

/* monsters/rozlyucheni-stada.js */
Atlas.registerMonster({
  "format": 2,
  "id": "rozlyucheni-stada",
  "name": "Розлючені стада",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "synohromovi-stepy",
      "sklyani-kanyony",
      "burshtynovi-vysoty",
      "hromovi-bolota",
      "chorni-providni-pechery",
      "hromovi-stepy",
      "chorni-plato",
      "sukhi-veresovyshcha",
      "dolyny-blyskavychnoho-kamenyu"
    ],
    "worlds": [
      "eshkariya"
    ]
  },
  "order": 716,
  "lore": {
    "description": "Загроза світу «Ешкарія»."
  }
});

/* monsters/rozshchepleni-tini.js */
Atlas.registerMonster({
  "format": 2,
  "id": "rozshchepleni-tini",
  "name": "Розщеплені тіні",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "burshtynovi-promeni",
      "sady-pryzmatychnykh-derev",
      "tinovi-yary",
      "zoloti-pustky",
      "sklyani-nebesni-luhy"
    ],
    "worlds": [
      "aurelit"
    ]
  },
  "order": 726,
  "lore": {
    "description": "Загроза світу «Ауреліт»."
  }
});

/* monsters/rozzhareni-holemy.js */
Atlas.registerMonster({
  "format": 2,
  "id": "rozzhareni-holemy",
  "name": "Розжарені големи",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "meteorni-rivnyny",
      "chorni-kratery",
      "sklyani-polya",
      "stari-udarni-hory",
      "midni-dolyny",
      "irzhavi-lisy",
      "sribni-plato",
      "kraterni-bolota"
    ],
    "worlds": [
      "asterfell"
    ]
  },
  "order": 803,
  "lore": {
    "description": "Загроза світу «Астерфелл»."
  }
});

/* monsters/rubinovyy-brunkoklyuv.js */
Atlas.registerMonster({
  format: 2,
  id: "rubinovyy-brunkoklyuv",
  name: "Рубіновий Брунькоклюв",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills", "grass"], worlds: "all" },
  order: 772,
  lore: {
    description: "Невеликий птах із масивним кристалічним дзьобом, короткими ногами й крильми з рубінових пластин.",
    behavior: "Гніздиться в Рубіновому саду.",
    abilities: ["вистрілює твердими насінинами, що проростають кристалічними шипами, а після бою збирає їх назад дзьобом"],
  },
});

/* monsters/rudni-holemy.js */
Atlas.registerMonster({
  "format": 2,
  "id": "rudni-holemy",
  "name": "Рудні големи",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "meteorni-rivnyny",
      "chorni-kratery",
      "sklyani-polya",
      "stari-udarni-hory",
      "midni-dolyny",
      "irzhavi-lisy",
      "sribni-plato",
      "kraterni-bolota"
    ],
    "worlds": [
      "asterfell"
    ]
  },
  "order": 805,
  "lore": {
    "description": "Загроза світу «Астерфелл»."
  }
});

/* monsters/rudni-vartovi.js */
Atlas.registerMonster({
  "format": 2,
  "id": "rudni-vartovi",
  "name": "Рудні вартові",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "irzhavi-dibrovy",
      "chervoni-karyery",
      "zalizni-luky",
      "chorni-kuzni"
    ],
    "worlds": [
      "rzhavar"
    ]
  },
  "order": 840,
  "lore": {
    "description": "Загроза світу «Ржавар»."
  }
});

/* monsters/rudni-zhuky.js */
Atlas.registerMonster({
  "format": 2,
  "id": "rudni-zhuky",
  "name": "Рудні жуки",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "midni-hrebeni",
      "zeleni-malakhitovi-skhyly",
      "fioletovi-zhyly",
      "siri-shakhtarski-dolyny",
      "kobaltovi-ustupy",
      "syni-karyery",
      "kryshtalevi-pechery",
      "temni-hirski-sela"
    ],
    "worlds": [
      "rudozir"
    ]
  },
  "order": 888,
  "lore": {
    "description": "Загроза світу «Рудозір»."
  }
});

/* monsters/rudoiid.js */
Atlas.registerMonster({
  "format": 2,
  "id": "rudoiid",
  "name": "Рудоїд",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "tag:underground",
      "tag:mine"
    ],
    "worlds": "all"
  },
  "order": 958,
  "lore": {
    "description": "Кубічний кріт, що гризе жили руди й вигризає осколки.",
    "behavior": "Риється в жилах, напрошується на будь-який шум.",
    "abilities": [
      "пробиває стіни",
      "відригує гострими уламками"
    ],
    "drops": [
      "сира руда",
      "зуб рудоїда"
    ]
  }
});

/* monsters/ruin-predator.js */
Atlas.registerMonster({
  "format": 2,
  "id": "ruin-predator",
  "name": "Хижак руїн",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "citadel-graveyard",
      "petrified-shore",
      "ownerless-garden"
    ],
    "worlds": [
      "ostanky"
    ]
  },
  "order": 210,
  "lore": {
    "description": "Тварина, що ховається серед руїн і вистежує тих, хто лізе в підвали.",
    "behavior": "Засідки у завалах і підвалах.",
    "abilities": [
      "засідка",
      "стрибок",
      "лазіння стінами"
    ],
    "drops": [
      "шкури"
    ]
  }
});

/* monsters/rukhomi-skelni-zviri.js */
Atlas.registerMonster({
  "format": 2,
  "id": "rukhomi-skelni-zviri",
  "name": "Рухомі скельні звірі",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "khvylovi-rivnyny",
      "hranatovi-morya",
      "skelni-delty",
      "bazaltovi-pryplyvy",
      "porozhni-kamyani-bukhty"
    ],
    "worlds": [
      "drumbor"
    ]
  },
  "order": 723,
  "lore": {
    "description": "Загроза світу «Друмбор»."
  }
});

/* monsters/runni-vartovi.js */
Atlas.registerMonster({
  "format": 2,
  "id": "runni-vartovi",
  "name": "Рунні вартові",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "pechatkovi-plato",
      "siri-runni-skeli",
      "zacharovani-dolyny",
      "chorni-zaly"
    ],
    "worlds": [
      "runozem"
    ]
  },
  "order": 829,
  "lore": {
    "description": "Загроза світу «Рунозем»."
  }
});

/* monsters/runnyy-holem.js */
Atlas.registerMonster({
  format: 2,
  id: "runnyy-holem",
  name: "Рунний голем",
  kind: "mini-boss",
  nature: "magic",
  variants: ["рунний голем", "рунний бойовий голем"],
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 305,
  lore: {
    description: "Магічний конструкт. Об'єднує схожих істот: рунний голем, рунний бойовий голем.",
    behavior: "Зустрічається: руїни храмів; стародавні руїни.",
    abilities: ["рунні вибухи", "кам’яні кулаки", "магічні удари", "короткий захисний бар’єр"],
  },
});

/* monsters/runnyy-pidbyrach.js */
Atlas.registerMonster({
  format: 2,
  id: "runnyy-pidbyrach",
  name: "Рунний Підбирач",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["grass", "hills"], worlds: "all" },
  order: 902,
  lore: {
    description: "Невеликий гуманоїд із синіх кам'яних плит і довгих пальців, вкритих світними знаками.",
    behavior: "Блукає коридорами рунних підземель.",
    abilities: ["збирає активні руни з підлоги та переносить їх на власне тіло, отримуючи нові атаки залежно від підібраного знака"],
  },
});

/* monsters/runnyy-strilets.js */
Atlas.registerMonster({
  format: 2,
  id: "runnyy-strilets",
  name: "Рунний стрілець",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["grass", "hills"], worlds: "all" },
  order: 366,
  lore: {
    description: "Звичайний магічний стрілець.",
    behavior: "Зустрічається: стародавні вежі.",
    abilities: ["енергетичні стріли", "короткий бар’єр"],
  },
});

/* monsters/rusalky.js */
Atlas.registerMonster({
  format: 1,
  id: "rusalky",
  name: "русалки",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["deep"], worlds: "all" },
  order: 33,
});

/* monsters/ruyinni-holemy.js */
Atlas.registerMonster({
  "format": 2,
  "id": "ruyinni-holemy",
  "name": "Руїнні големи",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "zoloti-nyzyny",
      "tumanni-lisy",
      "kamyani-vysoty",
      "zatopleni-svyatylyshcha"
    ],
    "worlds": [
      "aurokhm"
    ]
  },
  "order": 862,
  "lore": {
    "description": "Загроза світу «Аурохм»."
  }
});

/* monsters/rybyachyy-veretennyk.js */
Atlas.registerMonster({
  format: 2,
  id: "rybyachyy-veretennyk",
  name: "Риб’ячий веретенник",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 697,
  lore: {
    description: "Довга риба з тілом, як загострений веретеноподібний брусок.",
    behavior: "Підводні очеретяники.",
    abilities: ["пронизує водяні зарості та атакує з вузьких проходів"],
  },
});

/* monsters/ryfovyy-kovalchyk.js */
Atlas.registerMonster({
  format: 2,
  id: "ryfovyy-kovalchyk",
  name: "Рифовий ковальчик",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 680,
  lore: {
    description: "Маленький морський звір із клешнями, що нагадують молотки.",
    behavior: "Коралові виступи.",
    abilities: ["вибиває з каменів хмарки уламків"],
  },
});

/* monsters/ryfovyy-pastukh.js */
Atlas.registerMonster({
  format: 2,
  id: "ryfovyy-pastukh",
  name: "Рифовий Пастух",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 873,
  lore: {
    description: "Морський звір із панциром у формі арки, вкритим живими кораловими відростками.",
    behavior: "Мешкає серед коралових лабіринтів.",
    abilities: ["зганяє рибу у вузькі кишені між рифами й атакує гравця лише тоді, коли той перетинає його межі"],
  },
});

/* monsters/ryfovyy-shchytolom.js */
Atlas.registerMonster({
  format: 2,
  id: "ryfovyy-shchytolom",
  name: "Рифовий щитолом",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 565,
  lore: {
    description: "Товстий морський звір із кораловою бронею.",
    behavior: "Коралові тераси.",
    abilities: ["таранить супротивника й залишає гострі рифові уламки"],
  },
});

/* monsters/ryfovyy-strazh.js */
Atlas.registerMonster({
  format: 2,
  id: "ryfovyy-strazh",
  name: "Рифовий страж",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 422,
  lore: {
    description: "Кораловий конструкт.",
    behavior: "Зустрічається: коралові храми.",
    abilities: ["коралові шипи", "відновлення у воді"],
  },
});

/* monsters/ryfovyy-zhnets.js */
Atlas.registerMonster({
  format: 2,
  id: "ryfovyy-zhnets",
  name: "Рифовий Жнець",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 784,
  lore: {
    description: "Масивний крабоподібний мешканець із серпоподібними кораловими клешнями та панциром із живих гілок рифу.",
    behavior: "Мешкає серед Червоних рифів.",
    abilities: ["зрізає шматки коралів і кидає їх у воду, де ті швидко розростаються в перешкоди"],
  },
});

/* monsters/sadivnyk-bez-urozhayu.js */
Atlas.registerMonster({
  "format": 2,
  "id": "sadivnyk-bez-urozhayu",
  "name": "Садівник Без Урожаю",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "yablunevi-terasy",
      "fioletovi-hrushevi-hayi",
      "hirki-korenevi-polya",
      "zoloti-sady",
      "harbuzovi-rivnyny",
      "kukurudzyani-labirynty",
      "buryakovi-yary",
      "zoloti-teplytsi"
    ],
    "worlds": [
      "orchardum"
    ]
  },
  "order": 800,
  "lore": {
    "description": "Бос світу «Орчардум»."
  }
});

/* monsters/sand-leviathan.js */
Atlas.registerMonster({
  "format": 2,
  "id": "sand-leviathan",
  "name": "Левіафан пісків",
  "kind": "boss",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "wasteland"
    ],
    "worlds": [
      "krovostep"
    ]
  },
  "order": 221,
  "lore": {
    "description": "Величезний хижак, що спить під піском, поки його не розбудять.",
    "behavior": "Спить; прокидається від кроків і поранених.",
    "abilities": [
      "вихід із піску",
      "ковтання"
    ],
    "drops": [
      "панцир левіафана"
    ]
  }
});

/* monsters/sapfirova-mushka.js */
Atlas.registerMonster({
  format: 2,
  id: "sapfirova-mushka",
  name: "Сапфірова мушка",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga", "grass", "crystal"], worlds: "all" },
  order: 727,
  lore: {
    description: "Крихітна комаха з синім блиском.",
    behavior: "Кристальні галявини.",
    abilities: ["збирається біля кристалів і ненадовго залишає світні крапки в повітрі"],
  },
});

/* monsters/sapfirovyy-klishch.js */
Atlas.registerMonster({
  format: 2,
  id: "sapfirovyy-klishch",
  name: "Сапфіровий кліщ",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills", "crystal"], worlds: "all" },
  order: 526,
  lore: {
    description: "Великий паразит із твердим синім панциром.",
    behavior: "Кристалічні гнізда.",
    abilities: ["присмоктується до магічних істот і переймає їхню стихію"],
  },
});

/* monsters/satyry.js */
Atlas.registerMonster({
  format: 1,
  id: "satyry",
  name: "сатири",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga", "enchanted"], worlds: "all" },
  order: 18,
});

/* monsters/sazhahonyk.js */
Atlas.registerMonster({
  format: 2,
  id: "sazhahonyk",
  name: "Сажагоник",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 777,
  lore: {
    description: "Низький чотириногий звір із тілом з ущільненої сажі та білими керамічними лапами.",
    behavior: "Мешкає в руїнах старих лазень.",
    abilities: ["прилипає до смолоскипів, гасить їх і вискакує з охололих жаровень, коли жертва проходить повз"],
  },
});

/* monsters/sazhayid.js */
Atlas.registerMonster({
  format: 2,
  id: "sazhayid",
  name: "Сажаїд",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["grass", "hills"], worlds: "all" },
  order: 605,
  lore: {
    description: "Пухнастий чорний звір, що харчується сажею.",
    behavior: "Димарі та печі.",
    abilities: ["при переляку роздувається й випускає чорну хмару"],
  },
});

/* monsters/sazhovyy-strybunets.js */
Atlas.registerMonster({
  format: 2,
  id: "sazhovyy-strybunets",
  name: "Сажовий стрибунець",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["volcanic", "ashlands"], worlds: "all" },
  order: 538,
  lore: {
    description: "Чорна істота з довгими задніми лапами.",
    behavior: "Згарища.",
    abilities: ["залишає короткочасні хмари сажі, що приховують її пересування"],
  },
});

/* monsters/semyholova-bolotyana-hidra.js */
Atlas.registerMonster({
  format: 2,
  id: "semyholova-bolotyana-hidra",
  name: "Семиголова болотяна гідра",
  kind: "super-boss",
  nature: "threat",
  spawn: { biomes: ["swamp"], worlds: "all" },
  order: 265,
  lore: {
    description: "Болотне чудовисько.",
    behavior: "Зустрічається: велетенські болота.",
    abilities: ["отруйні бризки", "регенерація", "захоплення щупальцями"],
  },
});

/* monsters/serpokryla-moshka.js */
Atlas.registerMonster({
  format: 2,
  id: "serpokryla-moshka",
  name: "Серпокрила мошка",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga"], worlds: "all" },
  order: 656,
  lore: {
    description: "Дрібний літаючий рій із вигнутими крильцями.",
    behavior: "Вологі лісові просіки.",
    abilities: ["збирається у форму серпа й робить короткі наскрізні атаки"],
  },
});

/* monsters/sertse-bezdonnoyi-trishchyny.js */
Atlas.registerMonster({
  format: 2,
  id: "sertse-bezdonnoyi-trishchyny",
  name: "Серце бездонної тріщини",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 454,
  lore: {
    description: "Багатонога істота, що живе між пластами землі.",
    behavior: "Континентальний каньйон.",
    abilities: ["відкриває розломи під ворогами та поглинає цілі ділянки ландшафту"],
  },
});

/* monsters/sertsevynna-matir.js */
Atlas.registerMonster({
  "format": 2,
  "id": "sertsevynna-matir",
  "name": "Серцевинна Матір",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "kolyuchi-polya",
      "liany-staroho-mista",
      "korenevi-yary",
      "sukhi-shypasti-stepy"
    ],
    "worlds": [
      "ternaviya"
    ]
  },
  "order": 810,
  "lore": {
    "description": "Бос світу «Тернавія»."
  }
});

/* monsters/shakaly-lyudozhery.js */
Atlas.registerMonster({
  format: 1,
  id: "shakaly-lyudozhery",
  name: "Шакали-людожери",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["savanna", "desert", "steppe"], worlds: "all" },
  order: 124,
});

/* monsters/shakhtarski-holemy.js */
Atlas.registerMonster({
  "format": 2,
  "id": "shakhtarski-holemy",
  "name": "Шахтарські големи",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "midni-hrebeni",
      "zeleni-malakhitovi-skhyly",
      "fioletovi-zhyly",
      "siri-shakhtarski-dolyny",
      "kobaltovi-ustupy",
      "syni-karyery",
      "kryshtalevi-pechery",
      "temni-hirski-sela"
    ],
    "worlds": [
      "rudozir"
    ]
  },
  "order": 890,
  "lore": {
    "description": "Загроза світу «Рудозір»."
  }
});

/* monsters/shakhtnyi-obvalnyk.js */
Atlas.registerMonster({
  "format": 2,
  "id": "shakhtnyi-obvalnyk",
  "name": "Шахтний обвальник",
  "kind": "mini-boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "tag:underground",
      "tag:mine"
    ],
    "worlds": "all"
  },
  "order": 959,
  "lore": {
    "description": "Дух старої шахти, оповитий дерев'яною кріпою й пилом.",
    "behavior": "Вмикає обвали у тих, хто неповажно ставиться до шахти.",
    "abilities": [
      "обвалює стелю",
      "кріпа ожива й б'є балками"
    ],
    "drops": [
      "балка духа",
      "шахтний пил"
    ]
  }
});

/* monsters/shaman-vidlyudnyk.js */
Atlas.registerMonster({
  format: 2,
  id: "shaman-vidlyudnyk",
  name: "Шаман-відлюдник",
  kind: "monster",
  nature: "magic",
  variants: ["печерний шаман", "болотний знахар"],
  spawn: { biomes: ["mountain", "hills", "swamp"], worlds: "all" },
  order: 364,
  lore: {
    description: "Звичайний маг. Об'єднує схожих істот: печерний шаман, болотний знахар.",
    behavior: "Зустрічається: печери; болота.",
    abilities: ["кам’яні уламки", "слабке лікування", "отруйні снаряди", "туман"],
  },
});

/* monsters/shard-golem.js */
Atlas.registerMonster({
  "format": 2,
  "id": "shard-golem",
  "name": "Уламковий голем",
  "kind": "monster",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "citadel-graveyard",
      "ownerless-garden",
      "ashlands"
    ],
    "worlds": [
      "ostanky"
    ]
  },
  "order": 208,
  "lore": {
    "description": "Голем, складений із блоків різних матеріалів з різних загиблих світів.",
    "behavior": "Бродить по уламку; розсипається на блоки, що рухаються окремо.",
    "abilities": [
      "розсипання на частини",
      "кам'яний удар",
      "збирання"
    ],
    "drops": [
      "уламкова сталь",
      "камінь забутих міст"
    ]
  }
});

/* monsters/shershni-berserky.js */
Atlas.registerMonster({
  "format": 2,
  "id": "shershni-berserky",
  "name": "Шершні-берсерки",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "medovi-luky",
      "voskovi-skeli",
      "smolyani-roshchi",
      "porozhnysti-vulyky"
    ],
    "worlds": [
      "medokray"
    ]
  },
  "order": 871,
  "lore": {
    "description": "Загроза світу «Медокрай»."
  }
});

/* monsters/shestyholka.js */
Atlas.registerMonster({
  format: 2,
  id: "shestyholka",
  name: "Шестиголка",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 869,
  lore: {
    description: "Комаха розміром із собаку, вкрита чорними пластинами, з шістьма довгими голками вздовж спини.",
    behavior: "Ховається у щілинах стін стародавніх фортець.",
    abilities: ["по черзі піднімає голки, утворюючи рухомий бар'єр, а потім прокочується крізь вузькі проходи"],
  },
});

/* monsters/shestyhrannyy-lystoyid.js */
Atlas.registerMonster({
  format: 2,
  id: "shestyhrannyy-lystoyid",
  name: "Шестигранний листоїд",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga"], worlds: "all" },
  order: 641,
  lore: {
    description: "Велика комаха з панциром у формі шестикутних пластин.",
    behavior: "Геометричні ліси.",
    abilities: ["згортається в захисну мозаїку"],
  },
});

/* monsters/shestykryla-bolotna-tin.js */
Atlas.registerMonster({
  format: 2,
  id: "shestykryla-bolotna-tin",
  name: "Шестикрила болотна тінь",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["swamp"], worlds: "all" },
  order: 494,
  lore: {
    description: "Плаский літаючий хижак із напівпрозорими крилами.",
    behavior: "Темні очеретяники.",
    abilities: ["накриває місцевість темрявою і пікірує крізь неї"],
  },
});

/* monsters/shovkotkach.js */
Atlas.registerMonster({
  format: 2,
  id: "shovkotkach",
  name: "Шовкоткач",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["wasteland", "hills", "grass"], worlds: "all" },
  order: 771,
  lore: {
    description: "Стрункий шестирукий мисливець із головою нічного метелика та довгими пальцями-прядками.",
    behavior: "Охороняє руїни Королівської ткацької майстерні.",
    abilities: ["натягує між колонами пружні шовкові нитки, що ловлять ворога або катапультують його в іншу частину зали"],
  },
});

/* monsters/shurkhitnyy-pylovyk.js */
Atlas.registerMonster({
  format: 2,
  id: "shurkhitnyy-pylovyk",
  name: "Шурхітний пиловик",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 614,
  lore: {
    description: "Рухома грудка сухого пилу.",
    behavior: "Занедбані горища.",
    abilities: ["прослизає крізь щілини й осідає на гравцеві, тимчасово сповільнюючи його"],
  },
});

/* monsters/shypastyy-vukhan.js */
Atlas.registerMonster({
  format: 2,
  id: "shypastyy-vukhan",
  name: "Шипастий вухань",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["grass", "steppe"], worlds: "all" },
  order: 586,
  lore: {
    description: "Довговухий гризун із кістяними шипами на спині.",
    behavior: "Сухі зарості.",
    abilities: ["відступає задом і б’є шипами при наближенні"],
  },
});

/* monsters/sirchanyy-plavets.js */
Atlas.registerMonster({
  format: 2,
  id: "sirchanyy-plavets",
  name: "Сірчаний Плавець",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["grass"], worlds: "all" },
  order: 901,
  lore: {
    description: "Довгий жовтуватий звір із плавниками, схожими на рвані листи металу.",
    behavior: "Мешкає в геотермальних долинах.",
    abilities: ["рухається крізь гарячі сірчані калюжі, залишаючи за собою бульбашки, що лускають із різким запахом і коротким спалахом"],
  },
});

/* monsters/siryy-kaminchyk-strybun.js */
Atlas.registerMonster({
  format: 2,
  id: "siryy-kaminchyk-strybun",
  name: "Сірий камінчик-стрибун",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 732,
  lore: {
    description: "Маленьке створіння, схоже на гладкий валун.",
    behavior: "Галькові береги.",
    abilities: ["робить короткі стрибки та перекочується під ноги"],
  },
});

/* monsters/siryy-pirnyk.js */
Atlas.registerMonster({
  format: 2,
  id: "siryy-pirnyk",
  name: "Сірий Пірник",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 934,
  lore: {
    description: "Крихітна пташка з попелястими пір'їнами й короткими крилами, що нагадують складені квадрати.",
    behavior: "Гніздиться в тріщинах старих мурів.",
    abilities: ["збирає пил із руїн і струшує його в очі ворогам, після чого тікає короткими стрибками"],
  },
});

/* monsters/siryy-volokonnyk.js */
Atlas.registerMonster({
  format: 2,
  id: "siryy-volokonnyk",
  name: "Сірий волоконник",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["grass", "wasteland", "hills"], worlds: "all" },
  order: 594,
  lore: {
    description: "Клубок грубих волокон, що пересувається десятками тонких ніжок.",
    behavior: "Лляні поля та покинуті ткацькі майстерні.",
    abilities: ["обплутує зброю й робить її важчою"],
  },
});

/* monsters/skeletnyy-luchnyk-kat.js */
Atlas.registerMonster({
  format: 2,
  id: "skeletnyy-luchnyk-kat",
  name: "Скелетний лучник-кат",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 328,
  lore: {
    description: "Елітна нежить.",
    behavior: "Зустрічається: фортеці мерців.",
    abilities: ["бронебійні стріли", "отруйні наконечники"],
  },
});

/* monsters/skeletnyy-vershnyk-na-vovku.js */
Atlas.registerMonster({
  format: 2,
  id: "skeletnyy-vershnyk-na-vovku",
  name: "Скелетний вершник на вовку",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["grass"], worlds: "all" },
  order: 316,
  lore: {
    description: "Неживий вершник.",
    behavior: "Зустрічається: нічні рівнини.",
    abilities: ["швидкі наскоки", "спис", "виклик скелетних псів"],
  },
});

/* monsters/skelety-vartovi.js */
Atlas.registerMonster({
  format: 1,
  id: "skelety-vartovi",
  name: "Скелети-вартові",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["wasteland", "ashlands", "hills"], worlds: "all" },
  order: 121,
});

/* monsters/skelni-yashchery.js */
Atlas.registerMonster({
  "format": 2,
  "id": "skelni-yashchery",
  "name": "Скельні ящери",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "luskati-khrebty",
      "chervoni-ulohovyny",
      "siri-pantsyrni-luky",
      "pechery-staroyi-shkiry"
    ],
    "worlds": [
      "luskariya"
    ]
  },
  "order": 876,
  "lore": {
    "description": "Загроза світу «Лускарія»."
  }
});

/* monsters/skelnyy-dovhorih.js */
Atlas.registerMonster({
  format: 2,
  id: "skelnyy-dovhorih",
  name: "Скельний довгоріг",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 630,
  lore: {
    description: "Гірська антилопа з дуже довгими прямими рогами.",
    behavior: "Височинні тераси.",
    abilities: ["пробиває ними вузькі укриття й таранить ворогів"],
  },
});

/* monsters/skelnyy-viyalorih.js */
Atlas.registerMonster({
  format: 2,
  id: "skelnyy-viyalorih",
  name: "Скельний Віялоріг",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 888,
  lore: {
    description: "Невеликий гірський звір із широкими рогами у формі кам'яного віяла та короткими потужними ногами.",
    behavior: "Пасеться на уступах гірських терас.",
    abilities: ["розгортає роги, відбиваючи легкі снаряди й піднімаючи кам'яний пил, але не здатен швидко повертати"],
  },
});

/* monsters/skelyastyy-strybun.js */
Atlas.registerMonster({
  format: 2,
  id: "skelyastyy-strybun",
  name: "Скелястий стрибун",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 549,
  lore: {
    description: "Ящір із широкими лапами та кам’яними подушечками.",
    behavior: "Обриви.",
    abilities: ["перестрибує через ущелини й обстрілює кам’яними крихтами"],
  },
});

/* monsters/skladach-kistyanykh-labiryntiv.js */
Atlas.registerMonster({
  format: 2,
  id: "skladach-kistyanykh-labiryntiv",
  name: "Складач кістяних лабіринтів",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 478,
  lore: {
    description: "Довга істота, що тягне за собою рухомий скелетний каркас.",
    behavior: "Кладовище велетенських істот.",
    abilities: ["перебудовує арену з ребер, щелеп і хребців"],
  },
});

/* monsters/skliana-iskra.js */
Atlas.registerMonster({
  "format": 2,
  "id": "skliana-iskra",
  "name": "Скляна іскра",
  "kind": "weak",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "tag:crystal",
      "tag:glass"
    ],
    "worlds": "all"
  },
  "order": 961,
  "lore": {
    "description": "Дрібна кубічна іскра з прозорим тілом.",
    "behavior": "Блукає в кристалічних долинах, відбиваючи світло.",
    "abilities": [
      "відбиває промінь у очі",
      "розсипається на скельця"
    ],
    "drops": [
      "скляна іскра"
    ]
  }
});

/* monsters/skliarnyi-tkach.js */
Atlas.registerMonster({
  "format": 2,
  "id": "skliarnyi-tkach",
  "name": "Скляний ткач",
  "kind": "mini-boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "tag:crystal",
      "tag:glass"
    ],
    "worlds": "all"
  },
  "order": 963,
  "lore": {
    "description": "Тонка людиноподібна постать зі скла, що в'яже світло в нитки.",
    "behavior": "Плете прозорі стіни, які не видно, доки не вдаришся.",
    "abilities": [
      "прозорі пастки",
      "нитка світла, що ріже"
    ],
    "drops": [
      "скляна нитка",
      "ткацький кристал"
    ]
  }
});

/* monsters/skloryb.js */
Atlas.registerMonster({
  format: 2,
  id: "skloryb",
  name: "Склориб",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 780,
  lore: {
    description: "Літаюча риба з тонкими вітражними плавниками, прозорим кубічним черевцем і кольоровими очима.",
    behavior: "Ширяє в закинутій повітряній оранжереї.",
    abilities: ["заломлює спрямовані на неї стріли, розщеплюючи траєкторії на кілька хибних напрямків"],
  },
});

/* monsters/sklyani-khyzhaky.js */
Atlas.registerMonster({
  "format": 2,
  "id": "sklyani-khyzhaky",
  "name": "Скляні хижаки",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "sribni-pushchi",
      "chorni-viddzerkalennya",
      "ozera-podviynykh-misyatsiv",
      "bili-labirynty",
      "sady-zvorotnoho-svitla"
    ],
    "worlds": [
      "mirrahon"
    ]
  },
  "order": 721,
  "lore": {
    "description": "Загроза світу «Міррагон»."
  }
});

/* monsters/sklyanokryl.js */
Atlas.registerMonster({
  format: 2,
  id: "sklyanokryl",
  name: "Склянокрил",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills", "crystal"], worlds: "all" },
  order: 518,
  lore: {
    description: "Хижий птах із прозорими гострими крилами.",
    behavior: "Скляні ущелини.",
    abilities: ["сипле уламками скла під час пікірування"],
  },
});

/* monsters/sklyanyy-olen-khram.js */
Atlas.registerMonster({
  format: 2,
  id: "sklyanyy-olen-khram",
  name: "Скляний Олень-Храм",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga", "crystal", "grass"], worlds: "all" },
  order: 761,
  lore: {
    description: "Величний чотириногий звір із вітражним корпусом, високими рогами-вікнами та прозорими ногами.",
    behavior: "Охороняє Заломлений собор у Скляному лісі.",
    abilities: ["розкладає сонячне проміння на кольорові промені, що активують небезпечні ділянки арени залежно від кольору"],
  },
});

/* monsters/sklyanyy-pavuchok.js */
Atlas.registerMonster({
  format: 2,
  id: "sklyanyy-pavuchok",
  name: "Скляний павучок",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["crystal", "grass", "steppe"], worlds: "all" },
  order: 678,
  lore: {
    description: "Крихітний майже прозорий павук.",
    behavior: "Скляні зарості.",
    abilities: ["плете короткі нитки, що мерехтять лише під певним кутом"],
  },
});

/* monsters/sklyanyy-rybohryz.js */
Atlas.registerMonster({
  format: 2,
  id: "sklyanyy-rybohryz",
  name: "Скляний Рибогриз",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 891,
  lore: {
    description: "Хижак із прозорого тіла, довгим хвостом і зубами з кольорового скла.",
    behavior: "Мешкає в мілких річках із піщаним дном.",
    abilities: ["завмирає серед сонячних відблисків, а під час атаки розсікає воду гострими хвостовими рухами"],
  },
});

/* monsters/skruchenyy-dovhonosyk.js */
Atlas.registerMonster({
  format: 2,
  id: "skruchenyy-dovhonosyk",
  name: "Скручений довгоносик",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["grass", "hills"], worlds: "all" },
  order: 663,
  lore: {
    description: "Жук із довгим спіральним рогом.",
    behavior: "Старі склади зерна.",
    abilities: ["чіпляється за предмети й використовує їх як щит"],
  },
});

/* monsters/skrynkopazur.js */
Atlas.registerMonster({
  format: 2,
  id: "skrynkopazur",
  name: "Скринькопазур",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 865,
  lore: {
    description: "Маленький нічний звір із кубічним панциром, схожим на дерев'яну шкатулку, та довгими чорними кігтями.",
    behavior: "Живе в руїнах торговельних поселень.",
    abilities: ["збирає блискучі предмети, маскуючись серед покинутого спорядження, і дряпає руки тих, хто намагається забрати його здобич"],
  },
});

/* monsters/skrypery.js */
Atlas.registerMonster({
  format: 1,
  id: "skrypery",
  name: "скрипери",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["deep"], worlds: "all" },
  order: 45,
});

/* monsters/skrypuchyy-cherevychnyk.js */
Atlas.registerMonster({
  format: 2,
  id: "skrypuchyy-cherevychnyk",
  name: "Скрипучий черевичник",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["grass", "hills"], worlds: "all" },
  order: 587,
  lore: {
    description: "Маленький гуманоїд із дерев’яними ногами.",
    behavior: "Старі дороги.",
    abilities: ["швидко переступає й видає гучні звуки, що збивають ритм атак"],
  },
});

/* monsters/skrypuchyy-khodok.js */
Atlas.registerMonster({
  format: 2,
  id: "skrypuchyy-khodok",
  name: "Скрипучий ходок",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga", "wasteland", "hills"], worlds: "all" },
  order: 576,
  lore: {
    description: "Худий дерев’яний гуманоїд зі зламаними суглобами.",
    behavior: "Старі дерев’яні фортеці.",
    abilities: ["рухається ривками й розгойдується перед ударом"],
  },
});

/* monsters/skrypuchyy-pastukh.js */
Atlas.registerMonster({
  format: 2,
  id: "skrypuchyy-pastukh",
  name: "Скрипучий Пастух",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["peaks", "wasteland", "hills"], worlds: "all" },
  order: 778,
  lore: {
    description: "Тонконога дерев’яна істота на коліщатих ступнях, із рогатою головою та кістяною сопілкою в зубах.",
    behavior: "Блукає пагорбами навколо покинутих вітряків.",
    abilities: ["керує зграями дрібних птахів свистом, змушуючи їх закривати огляд і атакувати з різних напрямків"],
  },
});

/* monsters/slipyy-dyryhent-hroz.js */
Atlas.registerMonster({
  format: 2,
  id: "slipyy-dyryhent-hroz",
  name: "Сліпий диригент гроз",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["peaks"], worlds: "all" },
  order: 462,
  lore: {
    description: "Істота з довгими руками-блискавками.",
    behavior: "Громові шпилі.",
    abilities: ["керує грозовими розрядами як пастками, змушуючи гравця рухатися між ними"],
  },
});

/* monsters/slipyy-kopalnyk.js */
Atlas.registerMonster({
  format: 2,
  id: "slipyy-kopalnyk",
  name: "Сліпий копальник",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 536,
  lore: {
    description: "Кремезний підземний звір із твердою мордою.",
    behavior: "Глибокі шахти.",
    abilities: ["знаходить ворогів за вібрацією кроків"],
  },
});

/* monsters/slipyy-orach-lavovykh-rivnyn.js */
Atlas.registerMonster({
  format: 2,
  id: "slipyy-orach-lavovykh-rivnyn",
  name: "Сліпий Орач Лавових Рівнин",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["volcanic", "ashlands"], worlds: "all" },
  order: 763,
  lore: {
    description: "Повзучий велет із базальтовим корпусом і величезною головою-плугом без очей.",
    behavior: "Блукає Чорними Лавовими полями.",
    abilities: ["прокладає в землі розпечені борозни, що відтинають шляхи відступу та застиглим лавовим каменем створюють нові перешкоди"],
  },
});

/* monsters/slyzen-dzerkalnyk.js */
Atlas.registerMonster({
  format: 2,
  id: "slyzen-dzerkalnyk",
  name: "Слизень-дзеркальник",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["swamp"], worlds: "all" },
  order: 490,
  lore: {
    description: "Великий прозорий молюск із твердим дзеркальним куполом.",
    behavior: "Кришталеві заплави.",
    abilities: ["відбиває спрямовані на нього промені та маскується під водойму"],
  },
});

/* monsters/slyzen.js */
Atlas.registerMonster({
  format: 2,
  id: "slyzen",
  name: "Слизень",
  kind: "monster",
  nature: "threat",
  variants: ["кислотний слизень", "кам’яний слизень", "вогняний слизень", "крижаний слизень", "слизень-стрибун", "водяний слизень", "великий вогняний слизень"],
  spawn: { biomes: ["swamp", "mountain", "hills", "volcanic"], worlds: "all" },
  order: 343,
  lore: {
    description: "Слизень. Об'єднує схожих істот: кислотний слизень, кам’яний слизень, вогняний слизень, крижаний слизень, слизень-стрибун, водяний слизень, великий вогняний слизень.",
    behavior: "Зустрічається: печери, болота; гірські тунелі; вулканічні печери; льодовики; луки, болота; береги озер, затоплені печери; лавові тунелі.",
    abilities: ["роз’їдає броню", "залишає небезпечний слід", "маскується під камінь", "прилипає до ніг", "підпалює поверхню", "ділиться після ударів", "залишає слизький крижаний слід", "стрибки на ціль", "відкидання слизом", "розбризкує воду", "розділяється на менші тіла", "розпечені калюжі", "поділ на менші тіла"],
  },
});

/* monsters/slyzkyy-horoshok.js */
Atlas.registerMonster({
  format: 2,
  id: "slyzkyy-horoshok",
  name: "Слизький горошок",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["grass"], worlds: "all" },
  order: 718,
  lore: {
    description: "Кругла зелена істота, що перекочується по землі.",
    behavior: "Вологі поля.",
    abilities: ["залишає невеликі слизькі плями"],
  },
});

/* monsters/slyzovyy-svystun.js */
Atlas.registerMonster({
  format: 2,
  id: "slyzovyy-svystun",
  name: "Слизовий свистун",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["hills", "mountain"], worlds: "all" },
  order: 568,
  lore: {
    description: "Довгий безокий черв’як.",
    behavior: "Вологі підземні коридори.",
    abilities: ["звуком виманює ворогів у слизькі ями"],
  },
});

/* monsters/smolyani-khyzhaky.js */
Atlas.registerMonster({
  "format": 2,
  "id": "smolyani-khyzhaky",
  "name": "Смоляні хижаки",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "burshtynovi-stepy",
      "kamyani-oazy",
      "sklyani-dyuny",
      "zastyhli-dolyny",
      "vitrovi-khrebty"
    ],
    "worlds": [
      "rakhmir"
    ]
  },
  "order": 772,
  "lore": {
    "description": "Загроза світу «Рахмір»."
  }
});

/* monsters/smolyani-pavuky.js */
Atlas.registerMonster({
  "format": 2,
  "id": "smolyani-pavuky",
  "name": "Смоляні павуки",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "chorni-stovbury",
      "burshtynovi-zaplavy",
      "mokhovi-terasy",
      "sklyani-korenevyshcha"
    ],
    "worlds": [
      "smolyar"
    ]
  },
  "order": 826,
  "lore": {
    "description": "Загроза світу «Смоляр»."
  }
});

/* monsters/smuhastyy-morskyy-strybun.js */
Atlas.registerMonster({
  format: 2,
  id: "smuhastyy-morskyy-strybun",
  name: "Смугастий морський стрибун",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["sea"], worlds: "all" },
  order: 710,
  lore: {
    description: "Риба з міцними грудними плавниками.",
    behavior: "Припливна зона.",
    abilities: ["вилазить на мокрі камені та стрибає між калюжами"],
  },
});

/* monsters/smuhastyy-nichnyy-tapir.js */
Atlas.registerMonster({
  format: 2,
  id: "smuhastyy-nichnyy-tapir",
  name: "Смугастий нічний тапір",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga"], worlds: "all" },
  order: 640,
  lore: {
    description: "Масивний звір із темними та світлими смугами.",
    behavior: "Місячні ліси.",
    abilities: ["ховається серед тіней і пробиває кущі коротким ривком"],
  },
});

/* monsters/smuhastyy-skokar.js */
Atlas.registerMonster({
  format: 2,
  id: "smuhastyy-skokar",
  name: "Смугастий скокар",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["grass"], worlds: "all" },
  order: 626,
  lore: {
    description: "Довгоногий степовий звір, що стрибає серіями.",
    behavior: "Сухі рівнини.",
    abilities: ["залишає в землі ямки, які заважають пересуванню"],
  },
});

/* monsters/snihomir.js */
Atlas.registerMonster({
  format: 2,
  id: "snihomir",
  name: "Снігомір",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["peaks", "tundra"], worlds: "all" },
  order: 795,
  lore: {
    description: "Довгоноге хутряне створіння з білими вусиками-вимірювачами й коротким квадратним хвостом.",
    behavior: "Мешкає на морозних вересовищах.",
    abilities: ["визначає глибину снігу, ховається в заметах і вискакує під ногами того, хто ступає на нестійкий наст"],
  },
});

/* monsters/snihova-shchurka.js */
Atlas.registerMonster({
  "format": 2,
  "id": "snihova-shchurka",
  "name": "Сніжна щурка",
  "kind": "weak",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "tag:cold"
    ],
    "worlds": "all"
  },
  "order": 969,
  "lore": {
    "description": "Біла щурка з крижаними вусами.",
    "behavior": "Риє нори в снігу й гризе припаси.",
    "abilities": [
      "викопує пастки",
      "холодний укус"
    ],
    "drops": [
      "крижані вуса"
    ]
  }
});

/* monsters/snihovi-prymary.js */
Atlas.registerMonster({
  format: 1,
  id: "snihovi-prymary",
  name: "Снігові примари",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["tundra", "snow", "taiga"], worlds: "all" },
  order: 119,
});

/* monsters/snihovyy-naperstok.js */
Atlas.registerMonster({
  format: 2,
  id: "snihovyy-naperstok",
  name: "Сніговий Наперсток",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills", "peaks", "snow"], worlds: "all" },
  order: 927,
  lore: {
    description: "Крихітна істота у формі білого конуса з двома чорними очима й чотирма короткими ніжками.",
    behavior: "Живе серед заметених кам'яних огорож.",
    abilities: ["заривається в пухкий сніг і вискакує перед гравцем, залишаючи маленькі замети, що сповільнюють рух"],
  },
});

/* monsters/snihovyy-rozbiynyk.js */
Atlas.registerMonster({
  format: 2,
  id: "snihovyy-rozbiynyk",
  name: "Сніговий розбійник",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["tundra"], worlds: "all" },
  order: 360,
  lore: {
    description: "Звичайний гуманоїд.",
    behavior: "Зустрічається: тундра.",
    abilities: ["короткий лук", "снігові засідки"],
  },
});

/* monsters/sobor-doshchovyk.js */
Atlas.registerMonster({
  format: 2,
  id: "sobor-doshchovyk",
  name: "Собор-Дощовик",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["grass"], worlds: "all" },
  order: 743,
  lore: {
    description: "Жива споруда на десятках кам’яних ніг, з дахом із перекритих плит і водостоками замість ребер.",
    behavior: "Мандрує Долиною Нескінченної Зливи.",
    abilities: ["пересуває стіни, створює потоки зливової води та затоплює низини арени"],
  },
});

/* monsters/solenyy-kradiy.js */
Atlas.registerMonster({
  format: 2,
  id: "solenyy-kradiy",
  name: "Солений Крадій",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 821,
  lore: {
    description: "Дрібний прибережний краб із білими кристалічними клешнями й прозорим панциром.",
    behavior: "Живе в соляних болотцях уздовж берега.",
    abilities: ["збирає сіль з каміння та шкіри, а при захисті вистрілює нею тонкими кристалічними голками"],
  },
});

/* monsters/solonchakovyi-vartovyi.js */
Atlas.registerMonster({
  "format": 2,
  "id": "solonchakovyi-vartovyi",
  "name": "Солончаковий вартовий",
  "kind": "mini-boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "tag:dry"
    ],
    "worlds": "all"
  },
  "order": 955,
  "lore": {
    "description": "Статуя з соляних кристалів із нахиленою головою.",
    "behavior": "Захищає висохлі джерела й вимагає води як данини.",
    "abilities": [
      "висушує воду зі спорядження",
      "сольові шипи вириваються з землі"
    ],
    "drops": [
      "соляне серце",
      "вартова сіль"
    ]
  }
});

/* monsters/solyanyy-plyuvach.js */
Atlas.registerMonster({
  format: 2,
  id: "solyanyy-plyuvach",
  name: "Соляний плювач",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["desert"], worlds: "all" },
  order: 577,
  lore: {
    description: "Маленька ящірка з кристалами в горлі.",
    behavior: "Солончаки.",
    abilities: ["випускає струмінь солоного пилу, що подразнює очі"],
  },
});

/* monsters/solyanyy-rizbyar.js */
Atlas.registerMonster({
  format: 2,
  id: "solyanyy-rizbyar",
  name: "Соляний Різьбяр",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 861,
  lore: {
    description: "Довгорогий пустельний звір із білих соляних пластин і рожевих кристалів на спині.",
    behavior: "Живе на краях солоних озер.",
    abilities: ["зішкрібає сіль рогами й створює навколо себе сліпучі хмари, що поступово кристалізують воду на спорядженні гравця"],
  },
});

/* monsters/sonnyy-dzobach.js */
Atlas.registerMonster({
  format: 2,
  id: "sonnyy-dzobach",
  name: "Сонний Дзьобач",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 899,
  lore: {
    description: "Кремезний нічний птах із великим квадратним дзьобом і важкими повіками.",
    behavior: "Живе в печерах із м'яким мінеральним пилом.",
    abilities: ["клює землю, створюючи маленькі кратери, а його гучне позіхання змушує істот поблизу на мить засинати"],
  },
});

/* monsters/sontsehryz.js */
Atlas.registerMonster({
  format: 2,
  id: "sontsehryz",
  name: "Сонцегриз",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills", "peaks", "wasteland"], worlds: "all" },
  order: 844,
  lore: {
    description: "Гігантська істота з золотих шестикутних лусок і порожньої пащі, що нагадує розкриту браму.",
    behavior: "З'являється на вершинах гірських храмів під час сонячних затемнень.",
    abilities: ["затуляє сонце своїм тілом, поступово охолоджуючи арену, а потім випускає накопичене світло вузькими променями"],
  },
});

/* monsters/sonyachnyy-pukhyr.js */
Atlas.registerMonster({
  format: 2,
  id: "sonyachnyy-pukhyr",
  name: "Сонячний Пухир",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga", "mountain", "hills"], worlds: "all" },
  order: 925,
  lore: {
    description: "Крихітна літаюча кулька з жовтого світла та тонкою оболонкою, схожою на скло.",
    behavior: "Літає над сонячними галявинами та кам'яними колами.",
    abilities: ["збирає сонячні промені й випускає їх короткими спалахами, освітлюючи темні проходи, але засліплюючи всіх поблизу"],
  },
});

/* monsters/sovovedmedi.js */
Atlas.registerMonster({
  format: 1,
  id: "sovovedmedi",
  name: "сововедмеді",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga", "enchanted"], worlds: "all" },
  order: 28,
});

/* monsters/spiralnyy-metelyk.js */
Atlas.registerMonster({
  format: 2,
  id: "spiralnyy-metelyk",
  name: "Спіральний метелик",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga"], worlds: "all" },
  order: 671,
  lore: {
    description: "Нічний метелик із закрученими крильцями.",
    behavior: "Сутінкові хащі.",
    abilities: ["летить спіраллю й залишає за собою плутану світну стежку"],
  },
});

/* monsters/sporonosni-velety.js */
Atlas.registerMonster({
  "format": 2,
  "id": "sporonosni-velety",
  "name": "Спороносні велети",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "blakytnyy-pidlisok",
      "burshtynovi-halyavyny",
      "chervoni-korenevi-yary",
      "sribni-dibrovy",
      "chorni-dibrovy",
      "syniy-mokh",
      "lilovi-bolota",
      "zabuti-svitli-halyavyny"
    ],
    "worlds": [
      "lyumenvild"
    ]
  },
  "order": 791,
  "lore": {
    "description": "Загроза світу «Люменвільд»."
  }
});

/* monsters/sporovi-myslyvtsi.js */
Atlas.registerMonster({
  "format": 2,
  "id": "sporovi-myslyvtsi",
  "name": "Спорові мисливці",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "soborni-dibrovy",
      "korenevi-katakomby",
      "kvitkovi-terasy",
      "sporovi-dolyny",
      "sklyani-pelyustkovi-hory"
    ],
    "worlds": [
      "illariya"
    ]
  },
  "order": 740,
  "lore": {
    "description": "Загроза світу «Ілларія»."
  }
});

/* monsters/sporovyy-pavuchok.js */
Atlas.registerMonster({
  format: 2,
  id: "sporovyy-pavuchok",
  name: "Споровий павучок",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga", "hills", "mountain"], worlds: "all" },
  order: 404,
  lore: {
    description: "Павукоподібне.",
    behavior: "Зустрічається: підземні грибниці.",
    abilities: ["отруйні спори", "липкі нитки"],
  },
});

/* monsters/sribnokryla-harpiya.js */
Atlas.registerMonster({
  format: 2,
  id: "sribnokryla-harpiya",
  name: "Срібнокрила гарпія",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 310,
  lore: {
    description: "Крилата істота.",
    behavior: "Зустрічається: високі скелі.",
    abilities: ["пікірування", "пориви вітру", "оглушливий крик"],
  },
});

/* monsters/sribnyy-hrebinets.js */
Atlas.registerMonster({
  format: 2,
  id: "sribnyy-hrebinets",
  name: "Срібний гребінець",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 686,
  lore: {
    description: "Велика двостулкова істота з гострим краєм мушлі.",
    behavior: "Піщані морські рівнини.",
    abilities: ["швидко змикає стулки й стрибає по дну"],
  },
});

/* monsters/star-ray.js */
Atlas.registerMonster({
  "format": 2,
  "id": "star-ray",
  "name": "Зоряний скат",
  "kind": "monster",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "root-coasts"
    ],
    "worlds": [
      "astrakor"
    ]
  },
  "order": 201,
  "lore": {
    "description": "Плаский літаючий хижак, що ширяє за краями материка й живиться космічним світлом.",
    "behavior": "Кружляє над обривами, пікірує на тих, хто стоїть на краю.",
    "abilities": [
      "планерування в порожнечі",
      "світний шлейф"
    ],
    "drops": [
      "волокна космічної кори",
      "пера з зоряним блиском"
    ]
  }
});

/* monsters/stari-voyiny.js */
Atlas.registerMonster({
  "format": 2,
  "id": "stari-voyiny",
  "name": "Старі воїни",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "sady-zavmerlykh-doshchiv",
      "polya-starykh-viyn",
      "sklyani-sekundy",
      "dolyny-povilnoho-starinnya",
      "mista-povtorennya"
    ],
    "worlds": [
      "noktalis"
    ]
  },
  "order": 703,
  "lore": {
    "description": "Старі воїни повторюють останню атаку."
  }
});

/* monsters/starodavniy-tsyklop.js */
Atlas.registerMonster({
  format: 1,
  id: "starodavniy-tsyklop",
  name: "Стародавній Циклоп",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["hills", "mountain", "peaks"], worlds: "all" },
  order: 52,
});

/* monsters/starshyy-hromokryl.js */
Atlas.registerMonster({
  "format": 2,
  "id": "starshyy-hromokryl",
  "name": "Старший Громокрил",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "vitrovi-plato",
      "taiga",
      "hromovi-perevaly",
      "tykhi-dolyny"
    ],
    "worlds": [
      "valdren"
    ]
  },
  "order": 783,
  "lore": {
    "description": "Бос світу «Вальдрен»."
  }
});

/* monsters/starshyy-skelnyy-veyvern.js */
Atlas.registerMonster({
  format: 1,
  id: "starshyy-skelnyy-veyvern",
  name: "Старший Скельний Вейверн",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["hills", "mountain", "peaks"], worlds: "all" },
  order: 63,
});

/* monsters/starshyy-vasylisk.js */
Atlas.registerMonster({
  format: 1,
  id: "starshyy-vasylisk",
  name: "Старший Василіск",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["hills", "mountain", "peaks"], worlds: "all" },
  order: 57,
});

/* monsters/starshyy-zhornovyy-mayster.js */
Atlas.registerMonster({
  "format": 2,
  "id": "starshyy-zhornovyy-mayster",
  "name": "Старший Жорновий Майстер",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "zhovti-zhornovi-polya",
      "kamyani-mlynovi-pahorby",
      "vysoki-travyani-stepy",
      "zernoskhovyshcha-pidzemel"
    ],
    "worlds": [
      "zhornoverkh"
    ]
  },
  "order": 887,
  "lore": {
    "description": "Бос світу «Жорноверх»."
  }
});

/* monsters/staryy-bolotnyy-trol.js */
Atlas.registerMonster({
  format: 2,
  id: "staryy-bolotnyy-trol",
  name: "Старий болотний троль",
  kind: "boss",
  nature: "threat",
  spawn: { biomes: ["swamp"], worlds: "all" },
  order: 279,
  lore: {
    description: "Троль.",
    behavior: "Зустрічається: глибокі болота.",
    abilities: ["швидка регенерація", "удари колодою", "отруйні випари"],
  },
});

/* monsters/staryy-materyk.js */
Atlas.registerMonster({
  "format": 2,
  "id": "staryy-materyk",
  "name": "Старий Материк",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "kochovi-luky",
      "korenevi-berehy",
      "pantsyrni-lisy",
      "koralovi-plato",
      "mihratsiyni-bolota"
    ],
    "worlds": [
      "litarkh"
    ]
  },
  "order": 754,
  "lore": {
    "description": "Старий Материк поглинає сусідні острови."
  }
});

/* monsters/staryy-popilnyy-lisorub.js */
Atlas.registerMonster({
  "format": 2,
  "id": "staryy-popilnyy-lisorub",
  "name": "Старий Попільний Лісоруб",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "chorni-sosny",
      "popelyasti-halyavyny",
      "vuhilni-pahorby",
      "smolyani-yary"
    ],
    "worlds": [
      "vuhlerod"
    ]
  },
  "order": 857,
  "lore": {
    "description": "Бос світу «Вуглерод»."
  }
});

/* monsters/staryy-zmiy-pidhirya.js */
Atlas.registerMonster({
  "format": 2,
  "id": "staryy-zmiy-pidhirya",
  "name": "Старий Змій Підгір'я",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "luskati-khrebty",
      "chervoni-ulohovyny",
      "siri-pantsyrni-luky",
      "pechery-staroyi-shkiry"
    ],
    "worlds": [
      "luskariya"
    ]
  },
  "order": 878,
  "lore": {
    "description": "Бос світу «Лускарія»."
  }
});

/* monsters/statuyi-vartovi.js */
Atlas.registerMonster({
  "format": 2,
  "id": "statuyi-vartovi",
  "name": "Статуї-вартові",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "statuyevi-dibrovy",
      "bazaltovi-karyery",
      "kvartsovi-ustupy",
      "pylovi-dolyny"
    ],
    "worlds": [
      "kamyanorod"
    ]
  },
  "order": 814,
  "lore": {
    "description": "Загроза світу «Кам'янород»."
  }
});

/* monsters/stem-spider-mother.js */
Atlas.registerMonster({
  "format": 2,
  "id": "stem-spider-mother",
  "name": "Матір Стовбурових Павуків",
  "kind": "boss",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "moss-trunks"
    ],
    "worlds": [
      "vershynnytsia"
    ]
  },
  "order": 229,
  "lore": {
    "description": "Велетенський павук, що керує гніздами на стовбурах.",
    "behavior": "Тримає гніздо в серці стовбура.",
    "abilities": [
      "виклик павуків",
      "обплутування"
    ],
    "drops": [
      "шовк матері"
    ]
  }
});

/* monsters/stepovi-zasidnyky.js */
Atlas.registerMonster({
  "format": 2,
  "id": "stepovi-zasidnyky",
  "name": "Степові засідники",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "vysokotravya",
      "kamyani-vodopoyi",
      "chervoni-pahorby",
      "tumanni-zaplavy"
    ],
    "worlds": [
      "veletraviya"
    ]
  },
  "order": 817,
  "lore": {
    "description": "Загроза світу «Велетравія»."
  }
});

/* monsters/stepovyi-bizon-shypospyn.js */
Atlas.registerMonster({
  "format": 2,
  "id": "stepovyi-bizon-shypospyn",
  "name": "Степовий бізон-шипоспин",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "tag:plain",
      "tag:farmland"
    ],
    "worlds": "all"
  },
  "order": 986,
  "lore": {
    "description": "Зарослий кущами бізон із шипами на спині.",
    "behavior": "Гуляє по степу стадом.",
    "abilities": [
      "тарани",
      "шипи при поваленні"
    ],
    "drops": [
      "бізонова шкура",
      "шип"
    ]
  }
});

/* monsters/stone-bird.js */
Atlas.registerMonster({
  "format": 2,
  "id": "stone-bird",
  "name": "Кам'яний птах",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "mineral-crowns",
      "peaks"
    ],
    "worlds": [
      "neborid"
    ]
  },
  "order": 233,
  "lore": {
    "description": "Птах із кам'яним оперенням, що гніздиться в кратерах.",
    "behavior": "Охороняє кратер, пікірує на непроханих.",
    "abilities": [
      "кам'яні пера",
      "пікірування"
    ],
    "drops": [
      "кам'яні пера"
    ]
  }
});

/* monsters/storm-ram.js */
Atlas.registerMonster({
  "format": 2,
  "id": "storm-ram",
  "name": "Грозовий баран",
  "kind": "monster",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "peaks",
      "mineral-crowns"
    ],
    "worlds": [
      "neborid"
    ]
  },
  "order": 234,
  "lore": {
    "description": "Баран, що викликає блискавки рогами.",
    "behavior": "Пасеться на вершинах, б'ється рогами.",
    "abilities": [
      "блискавка рогами",
      "таран"
    ],
    "drops": [
      "грозовий кварц"
    ]
  }
});

/* monsters/storozh-hrybnoho-kordonu.js */
Atlas.registerMonster({
  format: 2,
  id: "storozh-hrybnoho-kordonu",
  name: "Сторож грибного кордону",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga"], worlds: "all" },
  order: 496,
  lore: {
    description: "Кремезний монстр із грибними щитами на спині.",
    behavior: "Грибні прикордонні ліси.",
    abilities: ["випускає хмари спор, які створюють примарні копії місцевості"],
  },
});

/* monsters/storozh-semy-masok.js */
Atlas.registerMonster({
  format: 2,
  id: "storozh-semy-masok",
  name: "Сторож семи масок",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 467,
  lore: {
    description: "Істота, що змінює голову після кожного отриманого удару.",
    behavior: "Храм без облич.",
    abilities: ["кожна маска надає інший бойовий стиль і слабкість"],
  },
});

/* monsters/storozh-semykutnoho-morya.js */
Atlas.registerMonster({
  format: 2,
  id: "storozh-semykutnoho-morya",
  name: "Сторож Семикутного Моря",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 745,
  lore: {
    description: "Плаский морський колос із сімома плавниками-лопатями та панциром із чорного вулканічного скла.",
    behavior: "Панує над морським кратером Семи Кутів.",
    abilities: ["розтинає морську поверхню на обертові водяні сектори, затискаючи супротивників між течіями"],
  },
});

/* monsters/strakhitlyvi-dviynyky.js */
Atlas.registerMonster({
  "format": 2,
  "id": "strakhitlyvi-dviynyky",
  "name": "Страхітливі двійники",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "lavandovi-sny",
      "koshmarni-lisy",
      "dolyny-myakykh-skel",
      "bili-sady-spohadiv",
      "chorni-porozhnechi"
    ],
    "worlds": [
      "umbralit"
    ]
  },
  "order": 775,
  "lore": {
    "description": "Загроза світу «Умбраліт»."
  }
});

/* monsters/strazh-nepryvatnoho-horyzontu.js */
Atlas.registerMonster({
  "format": 2,
  "id": "strazh-nepryvatnoho-horyzontu",
  "name": "Страж непридатного горизонту",
  "kind": "mini-boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "tag:surreal"
    ],
    "worlds": "all"
  },
  "order": 995,
  "lore": {
    "description": "Висока рамка з дверима, у якій видно інше небо.",
    "behavior": "Дозволяє перейти, лише якщо відповісти на загадку.",
    "abilities": [
      "відкриває портал-ловушку",
      "міняє місцями героїв"
    ],
    "drops": [
      "шматок горизонту"
    ]
  }
});

/* monsters/strazh-pidzemnoho-zharu.js */
Atlas.registerMonster({
  "format": 2,
  "id": "strazh-pidzemnoho-zharu",
  "name": "Страж Підземного Жару",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "haryachi-dzherela",
      "siri-plato",
      "parovi-yary",
      "vulkanichni-ustupy"
    ],
    "worlds": [
      "termalis"
    ]
  },
  "order": 860,
  "lore": {
    "description": "Бос світу «Термаліс»."
  }
});

/* monsters/strybuchyy-pavuk.js */
Atlas.registerMonster({
  format: 2,
  id: "strybuchyy-pavuk",
  name: "Стрибучий павук",
  kind: "monster",
  nature: "threat",
  variants: ["стрибучий павук", "голчастий павук-стрибун"],
  spawn: { biomes: ["forest", "taiga", "mountain", "hills"], worlds: "all" },
  order: 399,
  lore: {
    description: "Павукоподібне. Об'єднує схожих істот: стрибучий павук, голчастий павук-стрибун.",
    behavior: "Зустрічається: скелі, дерева; Сухі кам’яні стіни.",
    abilities: ["швидкі стрибки", "атаки згори", "голчастий павук-стрибун: під час стрибка розкидає їх навколо"],
  },
});

/* monsters/stsylla.js */
Atlas.registerMonster({
  format: 1,
  id: "stsylla",
  name: "Сцилла",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["deep"], worlds: "all" },
  order: 87,
});

/* monsters/suddya-beztinnykh.js */
Atlas.registerMonster({
  format: 2,
  id: "suddya-beztinnykh",
  name: "Суддя Безтінних",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 747,
  lore: {
    description: "Тринога постать із білої кістяної кераміки, у мантії з прямокутних пластин і з головою-ліхтарем.",
    behavior: "Засідає в Суді Вічного Полудня.",
    abilities: ["забирає тіні з арени, перетворюючи їх на агресивні копії ворогів, а безтінних цілей карає променями"],
  },
});

/* monsters/sukhokh-vitrohon.js */
Atlas.registerMonster({
  "format": 2,
  "id": "sukhokh-vitrohon",
  "name": "Сухий вітрогон",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "tag:dry"
    ],
    "worlds": "all"
  },
  "order": 954,
  "lore": {
    "description": "Худий звір із воском замість шерсті, ноги як у газелі.",
    "behavior": "Мчить по барханах, перекидає тих, хто на нього полює.",
    "abilities": [
      "різкий ривок із кидком",
      "піщана хвиля за хвостом"
    ],
    "drops": [
      "воскова шерсть",
      "копито вітрогона"
    ]
  }
});

/* monsters/sutinkovi-koty.js */
Atlas.registerMonster({
  "format": 2,
  "id": "sutinkovi-koty",
  "name": "Сутінкові коти",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "blakytnyy-pidlisok",
      "burshtynovi-halyavyny",
      "chervoni-korenevi-yary",
      "sribni-dibrovy",
      "chorni-dibrovy",
      "syniy-mokh",
      "lilovi-bolota",
      "zabuti-svitli-halyavyny"
    ],
    "worlds": [
      "lyumenvild"
    ]
  },
  "order": 790,
  "lore": {
    "description": "Загроза світу «Люменвільд»."
  }
});

/* monsters/svichkohryz.js */
Atlas.registerMonster({
  format: 2,
  id: "svichkohryz",
  name: "Свічкогриз",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills", "wasteland"], worlds: "all" },
  order: 912,
  lore: {
    description: "Маленький чорний звір із круглим тілом, широким ротом і двома короткими рогами.",
    behavior: "Мешкає в підземних криптах і занедбаних шахтах.",
    abilities: ["пожирає відкритий вогонь, залишаючи навколо себе темряву, а потім світиться зсередини, коли накопичить достатньо полум'я"],
  },
});

/* monsters/svichkokryli-motyli.js */
Atlas.registerMonster({
  format: 2,
  id: "svichkokryli-motyli",
  name: "Свічкокрилі Мотилі",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["grass", "hills"], worlds: "all" },
  order: 788,
  lore: {
    description: "Рій дрібних мотилів із восковими черевцями, що світяться крізь тонкі крильця.",
    behavior: "Збираються в Свічкових садах біля старих каплиць.",
    abilities: ["залишають краплі гарячого воску, перетворюючи землю на слизькі пастки"],
  },
});

/* monsters/svichkova-mil.js */
Atlas.registerMonster({
  format: 2,
  id: "svichkova-mil",
  name: "Свічкова міль",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 653,
  lore: {
    description: "Комаха з восковими крильцями.",
    behavior: "Покинуті садиби.",
    abilities: ["притягується до відкритого вогню й розлітається гарячими лусочками"],
  },
});

/* monsters/svitlopozhyrachi.js */
Atlas.registerMonster({
  "format": 2,
  "id": "svitlopozhyrachi",
  "name": "Світлопожирачі",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "burshtynovi-promeni",
      "sady-pryzmatychnykh-derev",
      "tinovi-yary",
      "zoloti-pustky",
      "sklyani-nebesni-luhy"
    ],
    "worlds": [
      "aurelit"
    ]
  },
  "order": 725,
  "lore": {
    "description": "Загроза світу «Ауреліт»."
  }
});

/* monsters/svitlovi-skorpiony.js */
Atlas.registerMonster({
  "format": 2,
  "id": "svitlovi-skorpiony",
  "name": "Світлові скорпіони",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "zoloti-dyuny",
      "sklyani-oazy",
      "svitlovi-kanyony",
      "midni-plato",
      "pidzemni-sonyachni-morya"
    ],
    "worlds": [
      "heliontar"
    ]
  },
  "order": 747,
  "lore": {
    "description": "Загроза світу «Геліонтар»."
  }
});

/* monsters/svitlovyi-shuhaistyr.js */
Atlas.registerMonster({
  "format": 2,
  "id": "svitlovyi-shuhaistyr",
  "name": "Світловий шугайстир",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "tag:mushroom",
      "tag:glow",
      "tag:toxic"
    ],
    "worlds": "all"
  },
  "order": 982,
  "lore": {
    "description": "Довгі мережива міцелію, що рухаються як тварина.",
    "behavior": "Охороняє грибні сади й світиться, коли гнівається.",
    "abilities": [
      "міцеліальні батоги",
      "спалахи світла"
    ],
    "drops": [
      "міцелій",
      "світлий гриб"
    ]
  }
});

/* monsters/svitlozubyy-khovrakh.js */
Atlas.registerMonster({
  format: 2,
  id: "svitlozubyy-khovrakh",
  name: "Світлозубий ховрах",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["hills"], worlds: "all" },
  order: 564,
  lore: {
    description: "Швидка норна тварина з сяючими різцями.",
    behavior: "Сонячні пагорби.",
    abilities: ["викопує пастки під освітленими ділянками"],
  },
});

/* monsters/svitlyak.js */
Atlas.registerMonster({
  format: 2,
  id: "svitlyak",
  name: "Світляк",
  kind: "weak",
  nature: "magic",
  variants: ["світляк-спалахувач", "нічний світлячок-приманка", "проклятий світлячок"],
  spawn: { biomes: ["forest", "taiga", "swamp"], worlds: "all" },
  order: 392,
  lore: {
    description: "Магічна комаха. Об'єднує схожих істот: світляк-спалахувач, нічний світлячок-приманка, проклятий світлячок.",
    behavior: "Зустрічається: нічні ліси; темні ліси, болота; темні ліси.",
    abilities: ["яскравий спалах", "коротке засліплення", "заманює світлом у пастки", "спалахом на мить засліплює"],
  },
});

/* monsters/svitlyanyy-pastushok.js */
Atlas.registerMonster({
  format: 2,
  id: "svitlyanyy-pastushok",
  name: "Світляний Пастушок",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 880,
  lore: {
    description: "Крихітний круглий дух із трьома золотими очима та ніжками з тонких світлових ниток.",
    behavior: "Живе у світних заростях підземних озер.",
    abilities: ["збирає розкидані світляки в рухомі сфери, які засліплюють ворогів лише тоді, коли ті дивляться прямо на них"],
  },
});

/* monsters/svitna-koreneva-lychynka.js */
Atlas.registerMonster({
  format: 2,
  id: "svitna-koreneva-lychynka",
  name: "Світна коренева личинка",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga", "hills", "mountain"], worlds: "all" },
  order: 734,
  lore: {
    description: "Маленька личинка з зеленим світним черевцем.",
    behavior: "Лісові ґрунти.",
    abilities: ["живе під корінням і з’являється після дощу"],
  },
});

/* monsters/svitnyy-khrobak.js */
Atlas.registerMonster({
  format: 2,
  id: "svitnyy-khrobak",
  name: "Світний хробак",
  kind: "weak",
  nature: "threat",
  variants: ["світний болотяний хробак", "білий черв’ячок-світляк"],
  spawn: { biomes: ["swamp", "mountain", "hills"], worlds: "all" },
  order: 446,
  lore: {
    description: "Червоподібна істота. Об'єднує схожих істот: світний болотяний хробак, білий черв’ячок-світляк.",
    behavior: "Зустрічається: болота, вологі печери; Вологі тунелі.",
    abilities: ["виділяє подразнювальний слиз", "заривається в землю", "білий черв’ячок-світляк: повзає групами й залишає короткі світні доріжки"],
  },
});

/* monsters/syniy-hrozovyy-elemental.js */
Atlas.registerMonster({
  format: 2,
  id: "syniy-hrozovyy-elemental",
  name: "Синій грозовий елементаль",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 321,
  lore: {
    description: "Стихійний дух.",
    behavior: "Зустрічається: штормові плато.",
    abilities: ["блискавки", "короткі телепортації"],
  },
});

/* monsters/syniy-muloplav.js */
Atlas.registerMonster({
  format: 2,
  id: "syniy-muloplav",
  name: "Синій мулоплав",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 704,
  lore: {
    description: "Невелика риба з широкими черевними плавниками.",
    behavior: "Глибокі ставки.",
    abilities: ["пересувається по дну, здіймаючи хмари синього мулу"],
  },
});

/* monsters/syniy-porokhar.js */
Atlas.registerMonster({
  format: 2,
  id: "syniy-porokhar",
  name: "Синій Порохар",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills", "grass"], worlds: "all" },
  order: 906,
  lore: {
    description: "Крихітний істотоподібний мішечок із блакитного мінерального пилу та двома тонкими ніжками.",
    behavior: "Мешкає в покинутих фарбувальних майстернях.",
    abilities: ["чхає хмарами порошку, які змінюють колір навколишніх блоків і тимчасово приховують межі пасток"],
  },
});

/* monsters/synoplyamystyy-zhuk-nosiy.js */
Atlas.registerMonster({
  format: 2,
  id: "synoplyamystyy-zhuk-nosiy",
  name: "Синьоплямистий жук-носій",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["grass", "hills"], worlds: "all" },
  order: 658,
  lore: {
    description: "Повільна комаха з синіми світними плямами.",
    behavior: "Сині луки.",
    abilities: ["при небезпеці вивільняє дрібних жуків зі складок панцира"],
  },
});

/* monsters/synospynnyy-dovhokhvist.js */
Atlas.registerMonster({
  format: 2,
  id: "synospynnyy-dovhokhvist",
  name: "Синьоспинний довгохвіст",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills", "grass"], worlds: "all" },
  order: 615,
  lore: {
    description: "Прудка ящірка з хвостом, розділеним на квадратні сегменти.",
    behavior: "Теплі кам’яні долини.",
    abilities: ["відкидає хвіст як приманку"],
  },
});

/* monsters/syreny.js */
Atlas.registerMonster({
  format: 1,
  id: "syreny",
  name: "сирени",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["deep"], worlds: "all" },
  order: 32,
});

/* monsters/tamed-winged-beast.js */
Atlas.registerMonster({
  "format": 2,
  "id": "tamed-winged-beast",
  "name": "Приручений крилатий звір",
  "kind": "other",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "copper-nests",
      "windy-meadows"
    ],
    "worlds": [
      "midnokryl"
    ]
  },
  "order": 241,
  "lore": {
    "description": "Мідноперий птах, приручений мисливцями; дає транспортні переваги.",
    "behavior": "Супроводжує мисливця; використовується для планерних перельотів.",
    "abilities": [
      "планерний переліт",
      "швидкий спуск",
      "пошук ресурсів з висоти"
    ],
    "drops": [
      "міцне пір'я"
    ]
  }
});

/* monsters/techiyni-khyzhaky.js */
Atlas.registerMonster({
  "format": 2,
  "id": "techiyni-khyzhaky",
  "name": "Течійні хижаки",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "solyani-dzvony",
      "povitryani-ryfy",
      "vodospadni-dzhunhli",
      "blue-hollows",
      "arkhipelahy-plavayuchoho-mulu",
      "vertykalni-dzhunhli",
      "dolyny-vyskhidnoyi-vody",
      "khmarni-arkhipelahy",
      "kamyani-richkovi-ushchelyny",
      "nebesni-bolota"
    ],
    "worlds": [
      "solemor"
    ]
  },
  "order": 709,
  "lore": {
    "description": "Загроза світу «Солемор»."
  }
});

/* monsters/temni-karhy.js */
Atlas.registerMonster({
  format: 1,
  id: "temni-karhy",
  name: "темні карги",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga", "enchanted"], worlds: "all" },
  order: 19,
});

/* monsters/temnyy-elf-arbaletnyk.js */
Atlas.registerMonster({
  format: 2,
  id: "temnyy-elf-arbaletnyk",
  name: "Темний ельф-арбалетник",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["wasteland", "hills", "mountain"], worlds: "all" },
  order: 332,
  lore: {
    description: "Елітний стрілець.",
    behavior: "Зустрічається: підземні поселення.",
    abilities: ["отруйні болти", "маскування"],
  },
});

/* monsters/temnyy-elf-duelyant.js */
Atlas.registerMonster({
  format: 2,
  id: "temnyy-elf-duelyant",
  name: "Темний ельф-дуелянт",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["wasteland", "hills", "grass", "mountain"], worlds: "all" },
  order: 303,
  lore: {
    description: "Гуманоїд.",
    behavior: "Зустрічається: підземні міста.",
    abilities: ["швидкі комбінації клинків", "тіньове ухилення"],
  },
});

/* monsters/temnyy-elf.js */
Atlas.registerMonster({
  format: 2,
  id: "temnyy-elf",
  name: "Темний ельф",
  kind: "monster",
  nature: "magic",
  variants: ["темний ельф-мечник", "темний ельф-жрець"],
  spawn: { biomes: ["wasteland", "hills", "grass", "mountain"], worlds: "all" },
  order: 353,
  lore: {
    description: "Звичайний гуманоїд. Об'єднує схожих істот: темний ельф-мечник, темний ельф-жрець.",
    behavior: "Зустрічається: підземні міста; підземні храми.",
    abilities: ["швидкі удари клинком", "темні прокляття", "лікування союзників"],
  },
});

/* monsters/teplokrad.js */
Atlas.registerMonster({
  format: 2,
  id: "teplokrad",
  name: "Теплокрад",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["peaks", "wasteland", "hills", "grass"], worlds: "all" },
  order: 825,
  lore: {
    description: "Невелика довгохвоста пухнаста істота з носом із темного каменю та тонкими лапами.",
    behavior: "З’являється біля покинутих таборів на морозних луках.",
    abilities: ["висмоктує тепло з багать і залишає навколо них кільце інею, а потім ховається у холодній землі"],
  },
});

/* monsters/tinova-soroka-chaklunka.js */
Atlas.registerMonster({
  format: 2,
  id: "tinova-soroka-chaklunka",
  name: "Тіньова сорока-чаклунка",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga"], worlds: "all" },
  order: 351,
  lore: {
    description: "Елітний магічний птах.",
    behavior: "Зустрічається: темні гаї.",
    abilities: ["краде магічні ефекти", "створює примарні копії"],
  },
});

/* monsters/tinovi-khyzhaky.js */
Atlas.registerMonster({
  "format": 2,
  "id": "tinovi-khyzhaky",
  "name": "Тіньові хижаки",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "blakytnyy-pidlisok",
      "burshtynovi-halyavyny",
      "chervoni-korenevi-yary",
      "sribni-dibrovy",
      "chorni-dibrovy",
      "syniy-mokh",
      "lilovi-bolota",
      "zabuti-svitli-halyavyny"
    ],
    "worlds": [
      "lyumenvild"
    ]
  },
  "order": 792,
  "lore": {
    "description": "Загроза світу «Люменвільд»."
  }
});

/* monsters/tinovi-velety.js */
Atlas.registerMonster({
  "format": 2,
  "id": "tinovi-velety",
  "name": "Тіньові велети",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "midni-veresovyshcha",
      "bahryani-sosny",
      "sutinkovi-stepy",
      "syni-nichni-bolota",
      "kray-chornoho-sontsya"
    ],
    "worlds": [
      "vespern"
    ]
  },
  "order": 735,
  "lore": {
    "description": "Загроза світу «Весперн»."
  }
});

/* monsters/tinovi-zviri.js */
Atlas.registerMonster({
  "format": 2,
  "id": "tinovi-zviri",
  "name": "Тіньові звірі",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "pechatkovi-plato",
      "siri-runni-skeli",
      "zacharovani-dolyny",
      "chorni-zaly"
    ],
    "worlds": [
      "runozem"
    ]
  },
  "order": 830,
  "lore": {
    "description": "Загроза світу «Рунозем»."
  }
});

/* monsters/tinovyy-gudzyk.js */
Atlas.registerMonster({
  format: 2,
  id: "tinovyy-gudzyk",
  name: "Тіньовий Ґудзик",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 929,
  lore: {
    description: "Пласка чорна істота з круглим тілом і чотирма короткими відростками, схожими на нитки.",
    behavior: "Живе в темних коридорах і за меблями покинутих маєтків.",
    abilities: ["приклеюється до тіні гравця та трохи затримує його рухи, доки не опиниться під прямим світлом"],
  },
});

/* monsters/tinovyy-myslyvets.js */
Atlas.registerMonster({
  format: 2,
  id: "tinovyy-myslyvets",
  name: "Тіньовий мисливець",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 314,
  lore: {
    description: "Демон.",
    behavior: "Зустрічається: прокляті руїни.",
    abilities: ["телепортація", "удари зі спини", "невидимість"],
  },
});

/* monsters/tkach-burshtynovykh-kokoniv.js */
Atlas.registerMonster({
  format: 2,
  id: "tkach-burshtynovykh-kokoniv",
  name: "Ткач бурштинових коконів",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga", "mountain", "hills"], worlds: "all" },
  order: 476,
  lore: {
    description: "Величезна багатонога істота з бурштиновими щупальцями.",
    behavior: "Бурштинові печери.",
    abilities: ["запечатує цілі ділянки арени в застиглих коконах, що вибухають при руйнуванні"],
  },
});

/* monsters/tkach-misyachnykh-pryplyviv.js */
Atlas.registerMonster({
  format: 2,
  id: "tkach-misyachnykh-pryplyviv",
  name: "Ткач Місячних Припливів",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["sea"], worlds: "all" },
  order: 746,
  lore: {
    description: "Небесне членистоноге чудовисько з довгими срібними кінцівками й черевцем, схожим на порожню мушлю.",
    behavior: "Оселяється на Місячному архіпелазі.",
    abilities: ["плете світні канати між островами та смикає ними океан, змінюючи напрямок припливів посеред бою"],
  },
});

/* monsters/tkach-poludennykh-tiney.js */
Atlas.registerMonster({
  format: 2,
  id: "tkach-poludennykh-tiney",
  name: "Ткач Полуденних Тіней",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["desert", "wasteland"], worlds: "all" },
  order: 840,
  lore: {
    description: "Довготелеса істота з дев'ятьма ногами й довгими чорними стрічками замість обличчя.",
    behavior: "Полює серед білих обелісків сонячної пустки.",
    abilities: ["розтягує тіні гравців у пастки, які затримують рух, а потім міняється з ними місцями"],
  },
});

/* monsters/torfyanyy-horbyk.js */
Atlas.registerMonster({
  format: 2,
  id: "torfyanyy-horbyk",
  name: "Торф’яний горбик",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["swamp"], worlds: "all" },
  order: 726,
  lore: {
    description: "Маленька істота, замаскована під шматок торфу.",
    behavior: "Болотні стежки.",
    abilities: ["повільно пересувається та лякає тих, хто наступає поруч"],
  },
});

/* monsters/torfyanyy-vartovyy.js */
Atlas.registerMonster({
  format: 2,
  id: "torfyanyy-vartovyy",
  name: "Торф’яний вартовий",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "ashlands", "swamp"], worlds: "all" },
  order: 512,
  lore: {
    description: "Людиноподібна грудка торфу з кореневими руками.",
    behavior: "Заболочені кургани.",
    abilities: ["розсипається на шматки, а потім збирається позаду ворога"],
  },
});

/* monsters/toy-khto-perevertaye-svitanok.js */
Atlas.registerMonster({
  format: 2,
  id: "toy-khto-perevertaye-svitanok",
  name: "Той, хто перевертає світанок",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 457,
  lore: {
    description: "Крилата істота з обличчям, схожим на сонячний годинник.",
    behavior: "Край світла, де день постійно змінює напрямок.",
    abilities: ["міняє місцями світло й тінь, роблячи безпечні зони смертельними"],
  },
});

/* monsters/toy-khto-zhortaye-obriy.js */
Atlas.registerMonster({
  format: 2,
  id: "toy-khto-zhortaye-obriy",
  name: "Той, хто згортає обрій",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["hills", "mountain"], worlds: "all" },
  order: 447,
  lore: {
    description: "Колосальна істота з багатьох кам’яних кілець.",
    behavior: "Край світу, де небо торкається землі.",
    abilities: ["складає простір навколо себе, змінюючи відстані й напрямки руху"],
  },
});

/* monsters/travyanyy-pyskunchyk.js */
Atlas.registerMonster({
  format: 2,
  id: "travyanyy-pyskunchyk",
  name: "Трав’яний пискунчик",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["grass", "hills"], worlds: "all" },
  order: 719,
  lore: {
    description: "Маленький гризун із тонкими вусами.",
    behavior: "Низькі луки.",
    abilities: ["ховається в траві й голосно попереджає інших істот"],
  },
});

/* monsters/treanty.js */
Atlas.registerMonster({
  format: 1,
  id: "treanty",
  name: "треанти",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga", "enchanted"], worlds: "all" },
  order: 21,
});

/* monsters/tree-colossus.js */
Atlas.registerMonster({
  "format": 2,
  "id": "tree-colossus",
  "name": "Деревний Колос",
  "kind": "world-boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "garden-branches",
      "root-coasts"
    ],
    "worlds": [
      "astrakor"
    ]
  },
  "order": 206,
  "lore": {
    "description": "Гігант із живого дерева, що спить у центрі материка й пробуджується під час фінальної битви.",
    "behavior": "Прокидається лише наприкінці; його пробудження змінює арену.",
    "abilities": [
      "пробудження",
      "удар гілками",
      "обвал кореневого вузла"
    ],
    "drops": [
      "ядро Колоса"
    ]
  }
});

/* monsters/trishchynnyy-kulyk.js */
Atlas.registerMonster({
  format: 2,
  id: "trishchynnyy-kulyk",
  name: "Тріщинний кулик",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 573,
  lore: {
    description: "Довгоногий птах із пласким дзьобом.",
    behavior: "Кам’янисті береги.",
    abilities: ["виколупує камінці й кидає їх у супротивника"],
  },
});

/* monsters/triskuchyy-pantsyrnyk.js */
Atlas.registerMonster({
  format: 2,
  id: "triskuchyy-pantsyrnyk",
  name: "Тріскучий панцирник",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga"], worlds: "all" },
  order: 541,
  lore: {
    description: "Комахоподібний звір із сухим дерев’яним панциром.",
    behavior: "Мертві ліси.",
    abilities: ["видає тріск, який приваблює інших хижаків"],
  },
});

/* monsters/triskun-koralovykh-hilok.js */
Atlas.registerMonster({
  format: 2,
  id: "triskun-koralovykh-hilok",
  name: "Тріскун Коралових Гілок",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 870,
  lore: {
    description: "Невеликий крабоподібний монстр із рожевих коралових блоків та асиметричних клешень.",
    behavior: "Мешкає в мілководних рифах.",
    abilities: ["ламає підводні корали, щоб створювати гострі бар'єри, і відступає за них під час атаки"],
  },
});

/* monsters/trisnuti-holemy.js */
Atlas.registerMonster({
  "format": 2,
  "id": "trisnuti-holemy",
  "name": "Тріснуті големи",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "chervoni-hlynyani-bashty",
      "bili-sukhi-terasy",
      "hlybynni-yary",
      "zeleni-oazy",
      "bili-portselyanovi-stepy",
      "kobaltovi-yary",
      "rozhevi-karyery",
      "chorni-vypalyuvalni-pechery"
    ],
    "worlds": [
      "hlynyshche"
    ]
  },
  "order": 822,
  "lore": {
    "description": "Загроза світу «Глинище»."
  }
});

/* monsters/trisnutyy-arkhont-svichok.js */
Atlas.registerMonster({
  format: 2,
  id: "trisnutyy-arkhont-svichok",
  name: "Тріснутий Архонт Свічок",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["grass", "hills"], worlds: "all" },
  order: 758,
  lore: {
    description: "Зависла постать із десятків зрощених свічок, восковим обличчям і язиками різнокольорового полум’я.",
    behavior: "Мешкає в Каплиці Нескінченного Ґнота.",
    abilities: ["розплавляє кінцівки й витягує їх у довгі воскові перегородки, а згасання кожної свічки змінює колір та характер вогню"],
  },
});

/* monsters/trisnutyy-horshchykar.js */
Atlas.registerMonster({
  format: 2,
  id: "trisnutyy-horshchykar",
  name: "Тріснутий Горщикар",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 921,
  lore: {
    description: "Маленький гуманоїд із уламків теракотового посуду, з'єднаних тонкими коренями.",
    behavior: "Мешкає на смітниках старих поселень.",
    abilities: ["розкидає уламки навколо себе, створюючи гостре кільце, а потім збирається знову, якщо уламки залишити поруч"],
  },
});

/* monsters/trol-ruynivnyk.js */
Atlas.registerMonster({
  format: 2,
  id: "trol-ruynivnyk",
  name: "Троль-руйнівник",
  kind: "mini-boss",
  nature: "threat",
  variants: ["печерний троль-руйнівник", "броньований троль"],
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 298,
  lore: {
    description: "Троль. Об'єднує схожих істот: печерний троль-руйнівник, броньований троль.",
    behavior: "Зустрічається: великі печери; гірські проходи.",
    abilities: ["важкі удари", "регенерація", "кам’яна броня", "удари кулаками"],
  },
});

/* monsters/troli.js */
Atlas.registerMonster({
  format: 1,
  id: "troli",
  name: "тролі",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["hills", "mountain", "peaks"], worlds: "all" },
  order: 3,
});

/* monsters/trubach-iz-mushli.js */
Atlas.registerMonster({
  format: 2,
  id: "trubach-iz-mushli",
  name: "Трубач із мушлі",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 513,
  lore: {
    description: "Масивний молюск, що пересувається на шести кінцівках.",
    behavior: "Коралові плато.",
    abilities: ["створює звукові поштовхи через свою порожню мушлю"],
  },
});

/* monsters/trubchastyy-plyushch.js */
Atlas.registerMonster({
  format: 2,
  id: "trubchastyy-plyushch",
  name: "Трубчастий плющ",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["grass", "hills"], worlds: "all" },
  order: 590,
  lore: {
    description: "Жива ліана з порожнистими стеблами.",
    behavior: "Зарослі вежі.",
    abilities: ["випускає насіння короткими чергами, наче дрібні стріли"],
  },
});

/* monsters/trubocherevets.js */
Atlas.registerMonster({
  format: 2,
  id: "trubocherevets",
  name: "Трубочеревець",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills", "peaks"], worlds: "all" },
  order: 782,
  lore: {
    description: "Кремезне створіння з бочкоподібним животом, з якого стирчать різні кістяні трубки.",
    behavior: "Ховається у вітрових печерах.",
    abilities: ["втягує дрібні предмети й випускає їх ударними звуковими імпульсами, добираючи висоту тону під тип перешкоди"],
  },
});

/* monsters/trunk-spider.js */
Atlas.registerMonster({
  "format": 2,
  "id": "trunk-spider",
  "name": "Гігантський деревний павук",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "moss-trunks",
      "jungle",
      "branch-plains"
    ],
    "worlds": [
      "vershynnytsia"
    ]
  },
  "order": 225,
  "lore": {
    "description": "Павук завбільшки з віз, що плете гнізда між стовбурами.",
    "behavior": "Плете павутиння між стовбурами, чекає здобич.",
    "abilities": [
      "павутиння",
      "отруйний укус"
    ],
    "drops": [
      "павутинне волокно"
    ]
  }
});

/* monsters/tryasovynni-khyzhaky.js */
Atlas.registerMonster({
  "format": 2,
  "id": "tryasovynni-khyzhaky",
  "name": "Трясовинні хижаки",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "syni-torfovyshcha",
      "chorni-tryasovyny",
      "kryvi-verby",
      "hazovi-pechery"
    ],
    "worlds": [
      "nokserra"
    ]
  },
  "order": 811,
  "lore": {
    "description": "Загроза світу «Ноксерра»."
  }
});

/* monsters/trychovnovyy-pereviznyk.js */
Atlas.registerMonster({
  format: 2,
  id: "trychovnovyy-pereviznyk",
  name: "Тричовновий Перевізник",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 768,
  lore: {
    description: "Чудернацька істота з одного плаща з очерету, трьох зчеплених човнів та рук-весел.",
    behavior: "Мешкає біля затонулого переправного двору.",
    abilities: ["роз’єднує човни й перекриває ними водні маршрути, а під час атаки гребе одразу в трьох напрямках"],
  },
});

/* monsters/trytony.js */
Atlas.registerMonster({
  format: 1,
  id: "trytony",
  name: "тритони",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["deep"], worlds: "all" },
  order: 34,
});

/* monsters/tsar-skorpion-piskiv.js */
Atlas.registerMonster({
  format: 1,
  id: "tsar-skorpion-piskiv",
  name: "Цар-Скорпіон Пісків",
  kind: "super-boss",
  nature: "threat",
  spawn: { biomes: ["desert", "savanna"], worlds: "all" },
  order: 108,
});

/* monsters/tsyklopy.js */
Atlas.registerMonster({
  format: 1,
  id: "tsyklopy",
  name: "циклопи",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["hills", "mountain", "peaks"], worlds: "all" },
  order: 5,
});

/* monsters/tumanni-khyzhaky.js */
Atlas.registerMonster({
  "format": 2,
  "id": "tumanni-khyzhaky",
  "name": "Туманні хижаки",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "zoloti-nyzyny",
      "tumanni-lisy",
      "kamyani-vysoty",
      "zatopleni-svyatylyshcha"
    ],
    "worlds": [
      "aurokhm"
    ]
  },
  "order": 861,
  "lore": {
    "description": "Загроза світу «Аурохм»."
  }
});

/* monsters/tumannyi-sluh.js */
Atlas.registerMonster({
  "format": 2,
  "id": "tumannyi-sluh",
  "name": "Туманний слух",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "tag:mushroom",
      "tag:glow",
      "tag:toxic"
    ],
    "worlds": "all"
  },
  "order": 984,
  "lore": {
    "description": "Велетенська тінь серед мережі грибних веж.",
    "behavior": "Шепоче в тумані й веде до мертвих печер.",
    "abilities": [
      "туман, що збиває з пуття",
      "отруйні кулі",
      "лунає голосами загиблих"
    ],
    "drops": [
      "серце туману",
      "отруйний гриб"
    ]
  }
});

/* monsters/tumannyy-kopyten.js */
Atlas.registerMonster({
  format: 2,
  id: "tumannyy-kopyten",
  name: "Туманний копитень",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills", "grass"], worlds: "all" },
  order: 569,
  lore: {
    description: "Стрункий звір, що розпадається на серпанок під час бігу.",
    behavior: "Гірські луки.",
    abilities: ["з’являється з іншого боку стежки й атакує копитами"],
  },
});

/* monsters/tumannyy-kovpachok.js */
Atlas.registerMonster({
  format: 2,
  id: "tumannyy-kovpachok",
  name: "Туманний Ковпачок",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 910,
  lore: {
    description: "Маленький гриб із довгими тонкими ніжками та напівпрозорою шапкою.",
    behavior: "Росте на берегах холодних підземних озер.",
    abilities: ["при наближенні випускає туман, у якому змінюється видимий розмір предметів, через що складно визначити відстань до нього"],
  },
});

/* monsters/tunelni-zhuky.js */
Atlas.registerMonster({
  "format": 2,
  "id": "tunelni-zhuky",
  "name": "Тунельні жуки",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "smarahdovi-stepy",
      "veresovi-pahorby",
      "korenevi-yary",
      "kamyani-pokhovannya"
    ],
    "worlds": [
      "grondar"
    ]
  },
  "order": 787,
  "lore": {
    "description": "Загроза світу «Ґрондар»."
  }
});

/* monsters/tytan-bezodni.js */
Atlas.registerMonster({
  format: 2,
  id: "tytan-bezodni",
  name: "Титан безодні",
  kind: "world-boss",
  nature: "threat",
  spawn: { biomes: ["deep"], worlds: "all" },
  order: 244,
  lore: {
    description: "Морський колос.",
    behavior: "Зустрічається: найглибші океанічні западини.",
    abilities: ["гігантські хвилі", "водяні вирви", "удари щупальцями"],
  },
});

/* monsters/tytan-bureviyu.js */
Atlas.registerMonster({
  format: 2,
  id: "tytan-bureviyu",
  name: "Титан буревію",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 251,
  lore: {
    description: "Повітряний колос.",
    behavior: "Зустрічається: штормові рівнини, небесні плато.",
    abilities: ["створює торнадо", "блискавки й потоки вітру"],
  },
});

/* monsters/tytan-nyv.js */
Atlas.registerMonster({
  "format": 2,
  "id": "tytan-nyv",
  "name": "Титан ланів",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "tag:plain",
      "tag:farmland"
    ],
    "worlds": "all"
  },
  "order": 988,
  "lore": {
    "description": "Колосальний колос із соломи й каменя, що ходить по ланах.",
    "behavior": "Рушить, коли когось ловлять на крадіжці врожаю.",
    "abilities": [
      "молотить кулаками",
      "розсіює солому, що сліпить",
      "скликає хвилі пшениці"
    ],
    "drops": [
      "колос титана",
      "золоте зерно"
    ]
  }
});

/* monsters/tytan-zaliznoho-pantsyra.js */
Atlas.registerMonster({
  format: 2,
  id: "tytan-zaliznoho-pantsyra",
  name: "Титан залізного панцира",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills", "wasteland"], worlds: "all" },
  order: 271,
  lore: {
    description: "Броньований голем.",
    behavior: "Зустрічається: покинуті гірничі комплекси.",
    abilities: ["магнітні удари", "металеві уламки", "майже невразлива броня"],
  },
});

/* monsters/tytanichnyy-kalmar.js */
Atlas.registerMonster({
  format: 1,
  id: "tytanichnyy-kalmar",
  name: "Титанічний Кальмар",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["deep"], worlds: "all" },
  order: 95,
});

/* monsters/uchen-stykhiy.js */
Atlas.registerMonster({
  format: 2,
  id: "uchen-stykhiy",
  name: "Учень стихій",
  kind: "monster",
  nature: "magic",
  variants: ["вогняний послушник", "крижаний учень"],
  spawn: { biomes: ["volcanic", "ashlands", "wasteland", "hills"], worlds: "all" },
  order: 365,
  lore: {
    description: "Звичайний маг. Об'єднує схожих істот: вогняний послушник, крижаний учень.",
    behavior: "Зустрічається: вулканічні руїни; засніжені табори.",
    abilities: ["вогняні кульки", "підпалювання", "крижані стріли", "сповільнення"],
  },
});

/* monsters/ulamkokryl.js */
Atlas.registerMonster({
  format: 2,
  id: "ulamkokryl",
  name: "Уламкокрил",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 785,
  lore: {
    description: "Чотирикрила міль із крилами з тонких сланцевих пластин і коротким кам’яним дзьобом.",
    behavior: "Літає над старим каменоломним кар’єром.",
    abilities: ["скидає уламки-крила, які встромляються в землю та виростають у маленькі стіни"],
  },
});

/* monsters/ulamkolip.js */
Atlas.registerMonster({
  format: 2,
  id: "ulamkolip",
  name: "Уламколіп",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills", "wasteland"], worlds: "all" },
  order: 834,
  lore: {
    description: "Маленький глиняний дух із липкими долонями, короткими ногами й порожньою квадратною головою.",
    behavior: "Живе серед кам’яних руїн і розбитих мурувань.",
    abilities: ["збирає навколишні уламки та незграбно наліплює їх на себе як тимчасовий панцир, але розсипається від кількох сильних ударів"],
  },
});

/* monsters/ulamkovi-zhuky.js */
Atlas.registerMonster({
  "format": 2,
  "id": "ulamkovi-zhuky",
  "name": "Уламкові жуки",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "chervoni-hlynyani-bashty",
      "bili-sukhi-terasy",
      "hlybynni-yary",
      "zeleni-oazy",
      "bili-portselyanovi-stepy",
      "kobaltovi-yary",
      "rozhevi-karyery",
      "chorni-vypalyuvalni-pechery"
    ],
    "worlds": [
      "hlynyshche"
    ]
  },
  "order": 823,
  "lore": {
    "description": "Загроза світу «Глинище»."
  }
});

/* monsters/umbon.js */
Atlas.registerMonster({
  format: 1,
  id: "umbon",
  name: "Умбон",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["deep"], worlds: "all" },
  order: 85,
});

/* monsters/upper-crown-dragon.js */
Atlas.registerMonster({
  "format": 2,
  "id": "upper-crown-dragon",
  "name": "Деревний Дракон Верхньої Крони",
  "kind": "super-boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "upper-light-gardens",
      "branch-plains"
    ],
    "worlds": [
      "vershynnytsia"
    ]
  },
  "order": 230,
  "lore": {
    "description": "Найстарший дракон верхньої крони.",
    "behavior": "Лежить на вершині дерева, охороняє гніздо.",
    "abilities": [
      "подих спор",
      "піке"
    ],
    "drops": [
      "луска Верхньої Крони"
    ]
  }
});

/* monsters/ushchelynnyi-kolos.js */
Atlas.registerMonster({
  "format": 2,
  "id": "ushchelynnyi-kolos",
  "name": "Ущельний колос",
  "kind": "mini-boss",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "tag:canyon"
    ],
    "worlds": "all"
  },
  "order": 951,
  "lore": {
    "description": "Кам'яний велетень, схожий на живий пласт скелі.",
    "behavior": "Закриває собою прохід між двома стінами.",
    "abilities": [
      "розхитує стіни, скидаючи завали",
      "бій зблизька важкими кулаками"
    ],
    "drops": [
      "колосовий камінь",
      "руда стіни"
    ]
  }
});

/* monsters/utopeltsi.js */
Atlas.registerMonster({
  format: 1,
  id: "utopeltsi",
  name: "утопельці",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["deep"], worlds: "all" },
  order: 31,
});

/* monsters/vapnyanyy-ryyuch.js */
Atlas.registerMonster({
  format: 2,
  id: "vapnyanyy-ryyuch",
  name: "Вапняний риюч",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["grass", "mountain", "hills"], worlds: "all" },
  order: 596,
  lore: {
    description: "Низький плаский монстр із білим панциром.",
    behavior: "Вапнякові рівнини.",
    abilities: ["залишає після себе крихку кірку, що ламається під ногами"],
  },
});

/* monsters/varhy.js */
Atlas.registerMonster({
  format: 1,
  id: "varhy",
  name: "варги",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga", "enchanted"], worlds: "all" },
  order: 25,
});

/* monsters/vartovyi-zlamanykh-vezh.js */
Atlas.registerMonster({
  "format": 2,
  "id": "vartovyi-zlamanykh-vezh",
  "name": "Вартовий зламаних веж",
  "kind": "monster",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "tag:ruins",
      "tag:bones",
      "tag:dead"
    ],
    "worlds": "all"
  },
  "order": 974,
  "lore": {
    "description": "Порожні обладунки, що ходять там, де впали вежі.",
    "behavior": "Не пускає чужаків у руїни.",
    "abilities": [
      "удари мечем із-за кута",
      "збирається знову після удару"
    ],
    "drops": [
      "іржавий шолом",
      "уламок вежі"
    ]
  }
});

/* monsters/vartovyy-semy-baseyniv.js */
Atlas.registerMonster({
  "format": 2,
  "id": "vartovyy-semy-baseyniv",
  "name": "Вартовий Семи Басейнів",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "biryuzovi-baseyny",
      "terasovi-sady",
      "bili-karstovi-skeli",
      "tepli-pidzemni-dzherela"
    ],
    "worlds": [
      "kaltseron"
    ]
  },
  "order": 854,
  "lore": {
    "description": "Бос світу «Кальцерон»."
  }
});

/* monsters/vartovyy-sklyanoho-korenya.js */
Atlas.registerMonster({
  format: 2,
  id: "vartovyy-sklyanoho-korenya",
  name: "Вартовий Скляного Кореня",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga", "wasteland", "hills"], worlds: "all" },
  order: 846,
  lore: {
    description: "Велика істота з прозорих кореневих жил і гранованих зелених пластин замість м'язів.",
    behavior: "Охороняє серце підземного лісу під руїнами друїдського храму.",
    abilities: ["втягує удари в коріння, а потім повертає накопичену силу через підлогу у вигляді гострих кристалічних пагонів"],
  },
});

/* monsters/vasylisky.js */
Atlas.registerMonster({
  format: 1,
  id: "vasylisky",
  name: "василіски",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["hills", "mountain", "peaks"], worlds: "all" },
  order: 13,
});

/* monsters/vayverny.js */
Atlas.registerMonster({
  format: 1,
  id: "vayverny",
  name: "вайверни",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["hills", "mountain", "peaks"], worlds: "all" },
  order: 10,
});

/* monsters/vdova-dvanadtsyaty-mostiv.js */
Atlas.registerMonster({
  format: 2,
  id: "vdova-dvanadtsyaty-mostiv",
  name: "Вдова Дванадцяти Мостів",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills", "grass"], worlds: "all" },
  order: 748,
  lore: {
    description: "Висока істота під дерев’яною вуаллю, чиї дванадцять рук закінчуються гачками, рубанками та голками.",
    behavior: "Мешкає в проваллі з покинутими мостами.",
    abilities: ["перекроює мости під час бою, натягує між ними невидимі нитки й обвалює обрані переходи"],
  },
});

/* monsters/vdova-porozhnikh-dzvoniv.js */
Atlas.registerMonster({
  format: 2,
  id: "vdova-porozhnikh-dzvoniv",
  name: "Вдова порожніх дзвонів",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills", "wasteland"], worlds: "all" },
  order: 470,
  lore: {
    description: "Висока павукоподібна постать із металевими дзвонами замість черевця.",
    behavior: "Покинута дзвіниця в ущелині.",
    abilities: ["звукові хвилі відкидають, оглушують і руйнують магічні бар’єри"],
  },
});

/* monsters/vedmid.js */
Atlas.registerMonster({
  format: 2,
  id: "vedmid",
  name: "Ведмідь",
  kind: "monster",
  nature: "threat",
  variants: ["бурий ведмідь", "печерний ведмідь", "білий гірський ведмідь"],
  spawn: { biomes: ["forest", "taiga", "mountain", "peaks"], worlds: "all" },
  order: 370,
  lore: {
    description: "Звір-хижак. Об'єднує схожих істот: бурий ведмідь, печерний ведмідь, білий гірський ведмідь.",
    behavior: "Зустрічається: ліси, гори; печери; снігові гори.",
    abilities: ["сильні удари лапами", "захоплення", "важкі удари", "лютість у темряві", "морозний укус", "стійкість до холоду"],
  },
});

/* monsters/velet-metelytsia.js */
Atlas.registerMonster({
  "format": 2,
  "id": "velet-metelytsia",
  "name": "Велет-метелиця",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "tag:cold"
    ],
    "worlds": "all"
  },
  "order": 972,
  "lore": {
    "description": "Велетень із вихру снігу й льоду, обличчя — дві чорні діри.",
    "behavior": "Гуляє полями й перетворює усе на крижані скульптури.",
    "abilities": [
      "завірюха по площі",
      "заморожує героїв у льоді",
      "ламає лід під ногами"
    ],
    "drops": [
      "серце метелиці",
      "ядро снігу"
    ]
  }
});

/* monsters/veletenska-sova-vereteno.js */
Atlas.registerMonster({
  format: 2,
  id: "veletenska-sova-vereteno",
  name: "Велетенська сова-веретено",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["peaks"], worlds: "all" },
  order: 495,
  lore: {
    description: "Птах із видовженим спіральним тілом.",
    behavior: "Високі вітряні кручі.",
    abilities: ["закручує повітря в смерчі й обертається як живий бур"],
  },
});

/* monsters/velety-ruynivnyky.js */
Atlas.registerMonster({
  "format": 2,
  "id": "velety-ruynivnyky",
  "name": "Велети-руйнівники",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "pervisni-sady",
      "kamyani-zarodky",
      "pylkovi-rivnyny",
      "korenevi-materyky",
      "skhovyshcha-nezarodzhenykh-svitiv"
    ],
    "worlds": [
      "arkhelor"
    ]
  },
  "order": 779,
  "lore": {
    "description": "Загроза світу «Архелор»."
  }
});

/* monsters/velyka-burya.js */
Atlas.registerMonster({
  "format": 2,
  "id": "velyka-burya",
  "name": "Велика Буря",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "burshtynovi-stepy",
      "kamyani-oazy",
      "sklyani-dyuny",
      "zastyhli-dolyny",
      "vitrovi-khrebty"
    ],
    "worlds": [
      "rakhmir"
    ]
  },
  "order": 774,
  "lore": {
    "description": "Велика Буря поглинає цілі поселення."
  }
});

/* monsters/velyka-maska.js */
Atlas.registerMonster({
  "format": 2,
  "id": "velyka-maska",
  "name": "Велика Маска",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "usmikhneni-lisy",
      "strakhitlyvi-pahorby",
      "dzerkalni-rivnyny",
      "dolyny-spokoyu",
      "maskovi-hory"
    ],
    "worlds": [
      "kernalis"
    ]
  },
  "order": 759,
  "lore": {
    "description": "Велика Маска переписує арену залежно від бойових дій."
  }
});

/* monsters/velyka-nenarodzhena-khvylya.js */
Atlas.registerMonster({
  format: 2,
  id: "velyka-nenarodzhena-khvylya",
  name: "Велика ненароджена хвиля",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["deep"], worlds: "all" },
  order: 459,
  lore: {
    description: "Напівпрозора істота, що нагадує море, згорнуте в кільце.",
    behavior: "Океанська западина без дна.",
    abilities: ["поглинає снаряди й повертає їх разом із водяними списами"],
  },
});

/* monsters/velykyy-khranytel-zhyl.js */
Atlas.registerMonster({
  "format": 2,
  "id": "velykyy-khranytel-zhyl",
  "name": "Великий Хранитель Жил",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "midni-hrebeni",
      "zeleni-malakhitovi-skhyly",
      "fioletovi-zhyly",
      "siri-shakhtarski-dolyny",
      "kobaltovi-ustupy",
      "syni-karyery",
      "kryshtalevi-pechery",
      "temni-hirski-sela"
    ],
    "worlds": [
      "rudozir"
    ]
  },
  "order": 892,
  "lore": {
    "description": "Бос світу «Рудозір»."
  }
});

/* monsters/velykyy-rohatyy-demon.js */
Atlas.registerMonster({
  format: 2,
  id: "velykyy-rohatyy-demon",
  name: "Великий рогатий демон",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 280,
  lore: {
    description: "Демон.",
    behavior: "Зустрічається: зруйновані фортеці.",
    abilities: ["наскоки", "вогняні роги", "ударні хвилі"],
  },
});

/* monsters/velykyy-sovovedmed.js */
Atlas.registerMonster({
  format: 1,
  id: "velykyy-sovovedmed",
  name: "Великий Сововедмед",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga", "enchanted"], worlds: "all" },
  order: 67,
});

/* monsters/velykyy-zavodchyk.js */
Atlas.registerMonster({
  "format": 2,
  "id": "velykyy-zavodchyk",
  "name": "Великий Заводчик",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "shesterenni-pahorby",
      "midni-lisy",
      "pruzhynni-bolota",
      "mayatnykovi-ushchelyny",
      "zaly-pershotvortsiv"
    ],
    "worlds": [
      "kaldras"
    ]
  },
  "order": 714,
  "lore": {
    "description": "Великий Заводчик перебудовує арену під час бою."
  }
});

/* monsters/verbovyi-trusnyk.js */
Atlas.registerMonster({
  "format": 2,
  "id": "verbovyi-trusnyk",
  "name": "Вербовий трусник",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "tag:swamp",
      "tag:wet"
    ],
    "worlds": "all"
  },
  "order": 941,
  "lore": {
    "description": "Згорблена істота з гілля велетенських верб, очі — дві світляні жаби.",
    "behavior": "Ховається серед верб, хапає за ноги довгими прутами.",
    "abilities": [
      "обвиває лозою й тягне в багно",
      "свистить, скликаючи жаб"
    ],
    "drops": [
      "вербова лоза",
      "жаб'яче око"
    ]
  }
});

/* monsters/verkhovna-temna-karha.js */
Atlas.registerMonster({
  format: 1,
  id: "verkhovna-temna-karha",
  name: "Верховна Темна Карга",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga", "enchanted"], worlds: "all" },
  order: 70,
});

/* monsters/verkhovnyy-krystalichnyy-vartovyy.js */
Atlas.registerMonster({
  "format": 2,
  "id": "verkhovnyy-krystalichnyy-vartovyy",
  "name": "Верховний Кристалічний Вартовий",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "midni-hrebeni",
      "zeleni-malakhitovi-skhyly",
      "fioletovi-zhyly",
      "siri-shakhtarski-dolyny",
      "kobaltovi-ustupy",
      "syni-karyery",
      "kryshtalevi-pechery",
      "temni-hirski-sela"
    ],
    "worlds": [
      "rudozir"
    ]
  },
  "order": 893,
  "lore": {
    "description": "Бос світу «Рудозір»."
  }
});

/* monsters/verkhovnyy-rizbyar.js */
Atlas.registerMonster({
  "format": 2,
  "id": "verkhovnyy-rizbyar",
  "name": "Верховний Різьбяр",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "statuyevi-dibrovy",
      "bazaltovi-karyery",
      "kvartsovi-ustupy",
      "pylovi-dolyny"
    ],
    "worlds": [
      "kamyanorod"
    ]
  },
  "order": 816,
  "lore": {
    "description": "Бос світу «Кам'янород»."
  }
});

/* monsters/verkhovnyy-sadivnyk-kamenyu.js */
Atlas.registerMonster({
  format: 2,
  id: "verkhovnyy-sadivnyk-kamenyu",
  name: "Верховний садівник каменю",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga", "mountain", "hills"], worlds: "all" },
  order: 456,
  lore: {
    description: "Гігантська істота з кришталевих гілок і гранітного коріння.",
    behavior: "Кам’яний ліс стародавніх велетів.",
    abilities: ["за секунди вирощує стіни, шипи та цілі лабіринти"],
  },
});

/* monsters/vershynnyy-hryfonariy.js */
Atlas.registerMonster({
  format: 1,
  id: "vershynnyy-hryfonariy",
  name: "Вершинний Грифонарій",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["hills", "mountain", "peaks"], worlds: "all" },
  order: 56,
});

/* monsters/vezhnyk-irzhavykh-klyuchiv.js */
Atlas.registerMonster({
  format: 2,
  id: "vezhnyk-irzhavykh-klyuchiv",
  name: "Вежник Іржавих Ключів",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills", "grass"], worlds: "all" },
  order: 854,
  lore: {
    description: "Гуманоїд із довгим тулубом, складеним із замків, засувів і залізних ключів.",
    behavior: "Охороняє покинутий замок, де кожна кімната має власний замок.",
    abilities: ["відмикає закриті двері просто під час бою, випускаючи з них пастки, леза або захисні механізми"],
  },
});

/* monsters/vichnyi-likhtarnyk.js */
Atlas.registerMonster({
  "format": 2,
  "id": "vichnyi-likhtarnyk",
  "name": "Вічний ліхтарник",
  "kind": "mini-boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "tag:cold"
    ],
    "worlds": "all"
  },
  "order": 971,
  "lore": {
    "description": "Привид-ліхтар у снігу, оповитий синім світлом.",
    "behavior": "Заводить подорожніх у хуртовину.",
    "abilities": [
      "морозна заграва",
      "зникає в завірюсі"
    ],
    "drops": [
      "синій ліхтар",
      "крижаний вогонь"
    ]
  }
});

/* monsters/vichnyy-volodar-khashchi.js */
Atlas.registerMonster({
  format: 1,
  id: "vichnyy-volodar-khashchi",
  name: "Вічний Володар Хащі",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["forest", "enchanted", "jungle"], worlds: "all" },
  order: 110,
});

/* monsters/vidma-tysyachi-proklyat.js */
Atlas.registerMonster({
  format: 2,
  id: "vidma-tysyachi-proklyat",
  name: "Відьма тисячі проклять",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["swamp", "mountain", "hills", "grass"], worlds: "all" },
  order: 272,
  lore: {
    description: "Древня чаклунка.",
    behavior: "Зустрічається: чорні болота, відьомська вежа.",
    abilities: ["прокляття", "отруйні примари", "висмоктування життєвої сили"],
  },
});

/* monsters/vidomskyy-kit-okhoronets.js */
Atlas.registerMonster({
  format: 2,
  id: "vidomskyy-kit-okhoronets",
  name: "Відьомський кіт-охоронець",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["forest"], worlds: "all" },
  order: 345,
  lore: {
    description: "Елітний магічний звір.",
    behavior: "Зустрічається: відьомські хатини.",
    abilities: ["проклятий погляд", "тіньові стрибки"],
  },
});

/* monsters/vidomskyy-kruk.js */
Atlas.registerMonster({
  format: 2,
  id: "vidomskyy-kruk",
  name: "Відьомський крук",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga"], worlds: "all" },
  order: 306,
  lore: {
    description: "Магічний птах.",
    behavior: "Зустрічається: відьомські ліси.",
    abilities: ["проклятий крик", "крадіжка позитивних ефектів"],
  },
});

/* monsters/vitroplav.js */
Atlas.registerMonster({
  format: 2,
  id: "vitroplav",
  name: "Вітроплав",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills", "peaks"], worlds: "all" },
  order: 799,
  lore: {
    description: "Чотиринога істота з довгими перетинками між кінцівками й головою, схожою на клин.",
    behavior: "Мешкає на вітрових плато.",
    abilities: ["розправляє шкіряні вітрила та ширяє на висхідних потоках, вихоплюючи дрібну здобич зі скельних гнізд"],
  },
});

/* monsters/vitrovyi-pastukh.js */
Atlas.registerMonster({
  "format": 2,
  "id": "vitrovyi-pastukh",
  "name": "Вітровий пастух",
  "kind": "mini-boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "tag:plain",
      "tag:farmland"
    ],
    "worlds": "all"
  },
  "order": 987,
  "lore": {
    "description": "Чучело в піджаку з вітру, чия коса косить усе поспіль.",
    "behavior": "Вартує поля й ганяє злодіїв.",
    "abilities": [
      "вітер-коса по прямій",
      "скликає ворон"
    ],
    "drops": [
      "чучело",
      "ворона"
    ]
  }
});

/* monsters/vitrovyy-kozlyk.js */
Atlas.registerMonster({
  format: 2,
  id: "vitrovyy-kozlyk",
  name: "Вітровий козлик",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["grass", "hills"], worlds: "all" },
  order: 622,
  lore: {
    description: "Невелика тварина з легкими вигнутими рогами.",
    behavior: "Високі луки.",
    abilities: ["стрибає на великі відстані за сильного вітру"],
  },
});

/* monsters/vitryanyy-kalachyk.js */
Atlas.registerMonster({
  format: 2,
  id: "vitryanyy-kalachyk",
  name: "Вітряний Калачик",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 908,
  lore: {
    description: "Маленький літаючий звір із закрученого сухого листя та трьох дерев'яних кілець.",
    behavior: "Кружляє над осінніми плато.",
    abilities: ["обертається навколо власної осі, відштовхуючи легкі предмети й відводячи стріли вбік"],
  },
});

/* monsters/vitryanyy-zaytseroh.js */
Atlas.registerMonster({
  format: 2,
  id: "vitryanyy-zaytseroh",
  name: "Вітряний зайцерог",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["grass"], worlds: "all" },
  order: 532,
  lore: {
    description: "Швидкий заєць із рогами у формі лопатей.",
    behavior: "Високі трав’яні рівнини.",
    abilities: ["відштовхується від повітря й атакує стрибками"],
  },
});

/* monsters/vitrylnyy-krab.js */
Atlas.registerMonster({
  format: 2,
  id: "vitrylnyy-krab",
  name: "Вітрильний Краб",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["sea"], worlds: "all" },
  order: 816,
  lore: {
    description: "Прибережний краб із високим панциром-вітрилом, тонкими боковими лапами й піщаними клешнями.",
    behavior: "Живе на припливних мілинах.",
    abilities: ["ловить боковий вітер і блискавично ковзає вздовж берега, засипаючи ворога піском"],
  },
});

/* monsters/viyalokryl-shypun.js */
Atlas.registerMonster({
  format: 2,
  id: "viyalokryl-shypun",
  name: "Віялокрил-Шипун",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["swamp", "mountain", "hills", "grass"], worlds: "all" },
  order: 806,
  lore: {
    description: "Ширококрила комаха з хвостовим жалом і віялом із напівпрозорих пластин.",
    behavior: "Гніздиться в заростях гігантського очерету.",
    abilities: ["видає різкий гул, що на короткий час порушує прицілювання та збиває легкі предмети з країв"],
  },
});

/* monsters/vladar-hori-polumia.js */
Atlas.registerMonster({
  "format": 2,
  "id": "vladar-hori-polumia",
  "name": "Владар гори полум'я",
  "kind": "super-boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "tag:hot",
      "tag:volcanic",
      "tag:ashlands"
    ],
    "worlds": "all"
  },
  "order": 968,
  "lore": {
    "description": "Колосальний дракон-вулкан, чиє тіло складається з обвугленого каменю.",
    "behavior": "Спить усередині жерла й прокидається, коли земля тріщить.",
    "abilities": [
      "виверження по площі",
      "вогняний подих",
      "бронює себе застиглою лавою"
    ],
    "drops": [
      "серце вулкана",
      "луска магми"
    ]
  },
  "variants": [
    "драконовий вулкан",
    "вогняний владар"
  ]
});

/* monsters/vladyka-pasma.js */
Atlas.registerMonster({
  "format": 2,
  "id": "vladyka-pasma",
  "name": "Владика пасма",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "tag:highland",
      "tag:hills",
      "tag:mountain",
      "tag:stone"
    ],
    "worlds": "all"
  },
  "order": 992,
  "lore": {
    "description": "Колосальний орел із крилами зі скель і очима з дзеркал.",
    "behavior": "Мешкає на вершині й вивчає тих, хто підіймається.",
    "abilities": [
      "пікірує з вершини",
      "лавини з крил",
      "ілюзії з очей"
    ],
    "drops": [
      "оч-дзеркало",
      "орлине крило"
    ]
  }
});

/* monsters/vladyka-pecher.js */
Atlas.registerMonster({
  format: 1,
  id: "vladyka-pecher",
  name: "Владика Печер",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["hills", "mountain", "peaks"], worlds: "all" },
  order: 64,
});

/* monsters/vladyka-rozlomu.js */
Atlas.registerMonster({
  "format": 2,
  "id": "vladyka-rozlomu",
  "name": "Владика розлому",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "tag:canyon"
    ],
    "worlds": "all"
  },
  "order": 952,
  "lore": {
    "description": "Скелет із видовженими уламками гір, у ребрах — світний кристал.",
    "behavior": "Живе на дні найглибшого розлому, чекає, поки хтось упаде.",
    "abilities": [
      "провалює арену трясінням",
      "метає уламки-списи",
      "тримає героїв гравітаційною пасткою"
    ],
    "drops": [
      "кристал розлому",
      "осколок хребта"
    ]
  }
});

/* monsters/vlastelin-lisu.js */
Atlas.registerMonster({
  format: 1,
  id: "vlastelin-lisu",
  name: "Властелін Лісу",
  kind: "boss",
  nature: "magic",
  alias: "Леший",
  spawn: { biomes: ["forest", "taiga", "enchanted"], worlds: "all" },
  order: 66,
});

/* monsters/vodomir.js */
Atlas.registerMonster({
  format: 2,
  id: "vodomir",
  name: "Водомір",
  kind: "monster",
  nature: "threat",
  variants: ["зелений водомір", "кубічний Водомір"],
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 698,
  lore: {
    description: "Комахоподібна істота з надзвичайно довгими лапами. Об'єднує схожих істот: зелений водомір, кубічний Водомір.",
    behavior: "Тихі озера. Живе на поверхні гірських озер.",
    abilities: ["зелений водомір: бігає по поверхні води й розкидає дрібні хвилі", "кубічний Водомір: бігає по воді, залишаючи короткочасні тверді водяні платформи, якими може користуватися й гравець"],
  },
});

/* monsters/vodorostevyy-kabanchyk.js */
Atlas.registerMonster({
  format: 2,
  id: "vodorostevyy-kabanchyk",
  name: "Водоростевий кабанчик",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 632,
  lore: {
    description: "Кремезний звір із зеленою щетиною.",
    behavior: "Болотні озера.",
    abilities: ["пірнає в ставки й виходить із густим покривом водоростей"],
  },
});

/* monsters/vodorostevyy-plyhun.js */
Atlas.registerMonster({
  format: 2,
  id: "vodorostevyy-plyhun",
  name: "Водоростевий Плигун",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 907,
  lore: {
    description: "Довгонога водяна істота з тілом, обплетеним синіми водоростями.",
    behavior: "Мешкає в затоплених садах.",
    abilities: ["стрибає між калюжами й залишає на суші слизькі зелені плями, що відштовхують істот у напрямку найближчої води"],
  },
});

/* monsters/vodorostevyy-povzun.js */
Atlas.registerMonster({
  format: 2,
  id: "vodorostevyy-povzun",
  name: "Водоростевий повзун",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 712,
  lore: {
    description: "Довга істота, вкрита гнучкими водоростями.",
    behavior: "Підводні сади.",
    abilities: ["маскується у заростях і хапає здобич ниткоподібними відростками"],
  },
});

/* monsters/vodospadnyy-shchypets.js */
Atlas.registerMonster({
  format: 2,
  id: "vodospadnyy-shchypets",
  name: "Водоспадний щипець",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills", "lake"], worlds: "all" },
  order: 703,
  lore: {
    description: "Краб із довгими вузькими клешнями.",
    behavior: "Гірські потоки.",
    abilities: ["чіпляється за бризки й раптово вистрілює зі струменів водоспаду"],
  },
});

/* monsters/vodyani-elementali.js */
Atlas.registerMonster({
  format: 1,
  id: "vodyani-elementali",
  name: "водяні елементалі",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["deep"], worlds: "all" },
  order: 43,
});

/* monsters/vodyani-holemy.js */
Atlas.registerMonster({
  "format": 2,
  "id": "vodyani-holemy",
  "name": "Водяні големи",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "kanalni-stepy",
      "vodyani-terasy",
      "sukhi-vodoskhovyshcha",
      "arkhitekturni-kanyony"
    ],
    "worlds": [
      "akvedor"
    ]
  },
  "order": 874,
  "lore": {
    "description": "Загроза світу «Акведор»."
  }
});

/* monsters/vodyani-khyzhaky.js */
Atlas.registerMonster({
  "format": 2,
  "id": "vodyani-khyzhaky",
  "name": "Водяні хижаки",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "biryuzovi-baseyny",
      "terasovi-sady",
      "bili-karstovi-skeli",
      "tepli-pidzemni-dzherela"
    ],
    "worlds": [
      "kaltseron"
    ]
  },
  "order": 852,
  "lore": {
    "description": "Загроза світу «Кальцерон»."
  }
});

/* monsters/vodyanyy-horshchyk.js */
Atlas.registerMonster({
  format: 2,
  id: "vodyanyy-horshchyk",
  name: "Водяний горщик",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 503,
  lore: {
    description: "Круглотілий амфібій із твердою керамічною шкірою.",
    behavior: "Глиняні джерела.",
    abilities: ["накопичує воду в тілі й випускає її струменями, що збивають із ніг"],
  },
});

/* monsters/vodyanyy-rubanok.js */
Atlas.registerMonster({
  format: 2,
  id: "vodyanyy-rubanok",
  name: "Водяний рубанок",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 692,
  lore: {
    description: "Пласка довга риба з жорсткою головою.",
    behavior: "Зарослі канали.",
    abilities: ["ковзає під поверхнею й підрізає водорості та тонкі корені"],
  },
});

/* monsters/vohnyani-dukhy.js */
Atlas.registerMonster({
  "format": 2,
  "id": "vohnyani-dukhy",
  "name": "Вогняні духи",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "syni-torfovyshcha",
      "chorni-tryasovyny",
      "kryvi-verby",
      "hazovi-pechery"
    ],
    "worlds": [
      "nokserra"
    ]
  },
  "order": 812,
  "lore": {
    "description": "Загроза світу «Ноксерра»."
  }
});

/* monsters/vohnyanyy-feniks-ruynivnyk.js */
Atlas.registerMonster({
  format: 1,
  id: "vohnyanyy-feniks-ruynivnyk",
  name: "Вогняний Фенікс-Руйнівник",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["volcanic", "desert"], worlds: "all" },
  order: 117,
});

/* monsters/vohnyanyy-kaban-vozhak.js */
Atlas.registerMonster({
  format: 2,
  id: "vohnyanyy-kaban-vozhak",
  name: "Вогняний кабан-вожак",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga", "ashlands"], worlds: "all" },
  order: 320,
  lore: {
    description: "Магічний звір.",
    behavior: "Зустрічається: попелясті ліси.",
    abilities: ["полум’яний таран", "розпечені ікла"],
  },
});

/* monsters/vohnyanyy-salamandrovyy-knyaz.js */
Atlas.registerMonster({
  format: 2,
  id: "vohnyanyy-salamandrovyy-knyaz",
  name: "Вогняний саламандровий князь",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills", "volcanic", "ashlands"], worlds: "all" },
  order: 301,
  lore: {
    description: "Вогняна істота.",
    behavior: "Зустрічається: вулканічні печери.",
    abilities: ["лавові бризки", "розпечений хвіст"],
  },
});

/* monsters/vohnyanyy-skelet.js */
Atlas.registerMonster({
  format: 2,
  id: "vohnyanyy-skelet",
  name: "Вогняний скелет",
  kind: "monster",
  nature: "magic",
  variants: ["вогняний скелет", "скелет-піроман"],
  spawn: { biomes: ["volcanic", "ashlands", "wasteland", "hills"], worlds: "all" },
  order: 336,
  lore: {
    description: "Елітна нежить. Об'єднує схожих істот: вогняний скелет, скелет-піроман.",
    behavior: "Зустрічається: вулканічні склепи.",
    abilities: ["палаючі удари", "самозаймання після смерті", "кидає вогняні сфери"],
  },
});

/* monsters/void-hunter.js */
Atlas.registerMonster({
  "format": 2,
  "id": "void-hunter",
  "name": "Мисливець-пустотник",
  "kind": "other",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "root-coasts",
      "dead-crown"
    ],
    "worlds": [
      "astrakor"
    ]
  },
  "order": 203,
  "lore": {
    "description": "Худа постать, що виходить із темряви за краєм материка й краде ресурси поселень.",
    "behavior": "Нападає з темряви на склади й каравани, зникає в безодні.",
    "abilities": [
      "невидимість у темряві",
      "крадіжка ресурсів",
      "стрибок через прірву"
    ],
    "drops": [
      "викрадені припаси",
      "осколки пустоти"
    ]
  }
});

/* monsters/volodar-bez-oblychchya.js */
Atlas.registerMonster({
  "format": 2,
  "id": "volodar-bez-oblychchya",
  "name": "Володар Без Обличчя",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "sribni-pushchi",
      "chorni-viddzerkalennya",
      "ozera-podviynykh-misyatsiv",
      "bili-labirynty",
      "sady-zvorotnoho-svitla"
    ],
    "worlds": [
      "mirrahon"
    ]
  },
  "order": 722,
  "lore": {
    "description": "Володар Без Обличчя викрадає здібності відображень."
  }
});

/* monsters/volodar-hihantskykh-pyavok.js */
Atlas.registerMonster({
  format: 2,
  id: "volodar-hihantskykh-pyavok",
  name: "Володар гігантських п’явок",
  kind: "boss",
  nature: "threat",
  spawn: { biomes: ["wasteland", "hills", "lake"], worlds: "all" },
  order: 293,
  lore: {
    description: "Болотний паразит.",
    behavior: "Зустрічається: затоплені руїни.",
    abilities: ["висмоктує життєву силу", "викликає рої п’явок", "регенерує у воді"],
  },
});

/* monsters/volodar-hlybynnoho-moroku.js */
Atlas.registerMonster({
  format: 2,
  id: "volodar-hlybynnoho-moroku",
  name: "Володар глибинного мороку",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["deep"], worlds: "all" },
  order: 254,
  lore: {
    description: "Безформна морська істота.",
    behavior: "Зустрічається: бездонні океани.",
    abilities: ["поглинає світло", "створює ілюзії", "викликає тіньових хижаків"],
  },
});

/* monsters/volodar-hlybynnoho-shlyuzu.js */
Atlas.registerMonster({
  "format": 2,
  "id": "volodar-hlybynnoho-shlyuzu",
  "name": "Володар Глибинного Шлюзу",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "milkovodni-sady",
      "chorni-pryplyvni-skeli",
      "koralovi-uzberezhzhya",
      "soloni-zaplavy"
    ],
    "worlds": [
      "talmoriya"
    ]
  },
  "order": 786,
  "lore": {
    "description": "Бос світу «Талморія»."
  }
});

/* monsters/volodar-lavovoho-sertsya.js */
Atlas.registerMonster({
  format: 2,
  id: "volodar-lavovoho-sertsya",
  name: "Володар лавового серця",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["volcanic", "ashlands"], worlds: "all" },
  order: 248,
  lore: {
    description: "Вогняний титан.",
    behavior: "Зустрічається: серце вулкану.",
    abilities: ["виверження лави", "вогняні хвилі", "розколювання скель"],
  },
});

/* monsters/volodar-nyzhnoho-rozlomu.js */
Atlas.registerMonster({
  "format": 2,
  "id": "volodar-nyzhnoho-rozlomu",
  "name": "Володар Нижнього Розлому",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "chervoni-ustupy",
      "hlyboki-yary",
      "mokhovi-terasy",
      "sonyachni-kamyani-mosty",
      "vysoki-viaduky",
      "zeleni-ustupy",
      "kamyani-perevaly",
      "zabuti-mostovi-mista"
    ],
    "worlds": [
      "hlybokray"
    ]
  },
  "order": 847,
  "lore": {
    "description": "Бос світу «Глибокрай»."
  }
});

/* monsters/volodar-ostannoho-vidplyvu.js */
Atlas.registerMonster({
  format: 2,
  id: "volodar-ostannoho-vidplyvu",
  name: "Володар останнього відпливу",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["grass", "sea"], worlds: "all" },
  order: 450,
  lore: {
    description: "Панцирна істота завбільшки з острів.",
    behavior: "Безмежні припливні рівнини.",
    abilities: ["відтягує воду на величезну відстань, оголюючи дно, а потім повертає цунамі"],
  },
});

/* monsters/volodar-porozhnikh-dzvoniv.js */
Atlas.registerMonster({
  "format": 2,
  "id": "volodar-porozhnikh-dzvoniv",
  "name": "Володар порожніх дзвонів",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "tag:swamp",
      "tag:wet"
    ],
    "worlds": "all"
  },
  "order": 943,
  "lore": {
    "description": "Вежа з кам'яних водяних дзвонів, які б'ють самі, а всередині немає нікого.",
    "behavior": "Прокидається, коли хтось порушує болотну тишу.",
    "abilities": [
      "дзвін звуком руйнує щити",
      "викликає хвилі з мулу",
      "стискає воду в кулі"
    ],
    "drops": [
      "порожній дзвін",
      "болотна перлина"
    ]
  }
});

/* monsters/volodar-zatoplenoho-kvartalu.js */
Atlas.registerMonster({
  "format": 2,
  "id": "volodar-zatoplenoho-kvartalu",
  "name": "Володар Затопленого Кварталу",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "midni-dakhy",
      "zeleni-doshchovi-dolyny",
      "kamyani-kanaly",
      "zatopleni-nyzhni-kvartaly"
    ],
    "worlds": [
      "doshchohrad"
    ]
  },
  "order": 896,
  "lore": {
    "description": "Бос світу «Дощоград»."
  }
});

/* monsters/volodar-zatoplenoyi-katedry.js */
Atlas.registerMonster({
  "format": 2,
  "id": "volodar-zatoplenoyi-katedry",
  "name": "Володар Затопленої Катедри",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "syni-katedry",
      "chorni-protoky",
      "koralovi-pechery",
      "povitryani-ozera",
      "zeleni-hlybynni-lisy"
    ],
    "worlds": [
      "talassyr"
    ]
  },
  "order": 771,
  "lore": {
    "description": "Бос світу «Талассир»."
  }
});

/* monsters/vorm.js */
Atlas.registerMonster({
  format: 1,
  id: "vorm",
  name: "Ворм",
  kind: "boss",
  nature: "threat",
  alias: "Гірський Черв'як",
  spawn: { biomes: ["hills", "mountain", "peaks"], worlds: "all" },
  order: 60,
});

/* monsters/voron-dzerkalnyk.js */
Atlas.registerMonster({
  format: 2,
  id: "voron-dzerkalnyk",
  name: "Ворон-Дзеркальник",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 791,
  lore: {
    description: "Чорний ворон із дзеркальною грудною пластиною та квадратними очима.",
    behavior: "Гніздиться в руїнах скляних оранжерей.",
    abilities: ["накопичує сонячне світло в дзеркалі й випускає його тонким горизонтальним променем, після чого ховає голову під крило"],
  },
});

/* monsters/voskova-husin.js */
Atlas.registerMonster({
  format: 2,
  id: "voskova-husin",
  name: "Воскова Гусінь",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga", "mountain", "hills"], worlds: "all" },
  order: 909,
  lore: {
    description: "Товстенька біла істота з сегментованим тілом, схожим на свічкові бруски.",
    behavior: "Живе у старих воскових майстернях і печерах із природною смолою.",
    abilities: ["прокладає м'які воскові доріжки, які сповільнюють гравця, а сама пересувається ними швидше"],
  },
});

/* monsters/voskovyy-dviynyk.js */
Atlas.registerMonster({
  format: 2,
  id: "voskovyy-dviynyk",
  name: "Восковий двійник",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["grass", "hills"], worlds: "all" },
  order: 542,
  lore: {
    description: "Гуманоїдна істота, що копіює силует найближчої цілі.",
    behavior: "Старі свічкові майстерні.",
    abilities: ["плавиться від тепла й твердне в холоді"],
  },
});

/* monsters/voskovyy-kulchyk.js */
Atlas.registerMonster({
  format: 2,
  id: "voskovyy-kulchyk",
  name: "Восковий Кульчик",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 933,
  lore: {
    description: "Маленька жовта істота з м'якого воску, круглим тулубом і двома великими очима.",
    behavior: "Живе біля гарячих джерел і старих свічкових майстерень.",
    abilities: ["прилипає до теплих предметів, розм'якшує їхню поверхню та залишає липкі сліди, що заважають пересуванню"],
  },
});

/* monsters/voskovyy-pilihrym.js */
Atlas.registerMonster({
  format: 2,
  id: "voskovyy-pilihrym",
  name: "Восковий Пілігрим",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills", "grass"], worlds: "all" },
  order: 881,
  lore: {
    description: "Тонка істота з багатошарового воску, із запаленим ґнотом у голові та довгими руками.",
    behavior: "Блукає в покинутих каплицях.",
    abilities: ["відкушує шматки власного тіла, створюючи тимчасові воскові фігурки, що блокують проходи, а після дощу швидко тане"],
  },
});

/* monsters/vovchyy-prakorol.js */
Atlas.registerMonster({
  format: 2,
  id: "vovchyy-prakorol",
  name: "Вовчий пракороль",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga", "mountain", "hills"], worlds: "all" },
  order: 283,
  lore: {
    description: "Магічний хижак.",
    behavior: "Зустрічається: місячні ліси, засніжені хребти.",
    abilities: ["крижаний рев", "виклик зграї", "стрімкі наскоки"],
  },
});

/* monsters/vovk-iz-porozhnimy-rebramy.js */
Atlas.registerMonster({
  format: 2,
  id: "vovk-iz-porozhnimy-rebramy",
  name: "Вовк із порожніми ребрами",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 506,
  lore: {
    description: "Довгоногий хижак, крізь тіло якого видно зоряне небо.",
    behavior: "Сутінкові перевали.",
    abilities: ["телепортується між клаптями нічної темряви"],
  },
});

/* monsters/vovk.js */
Atlas.registerMonster({
  format: 2,
  id: "vovk",
  name: "Вовк",
  kind: "monster",
  nature: "threat",
  variants: ["сірий вовк", "чорний лісовий вовк", "великий печерний вовк"],
  spawn: { biomes: ["forest", "taiga", "grass", "mountain"], worlds: "all" },
  order: 369,
  lore: {
    description: "Звір-хижак. Об'єднує схожих істот: сірий вовк, чорний лісовий вовк, великий печерний вовк.",
    behavior: "Зустрічається: ліси, рівнини; темні ліси; печери, ущелини.",
    abilities: ["укуси", "атаки зграєю", "нічне маскування", "швидкі наскоки", "сильний укус", "переслідування в темряві"],
  },
});

/* monsters/vozhd-veletniv.js */
Atlas.registerMonster({
  format: 1,
  id: "vozhd-veletniv",
  name: "Вождь Велетнів",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["hills", "mountain", "peaks"], worlds: "all" },
  order: 54,
});

/* monsters/vuhilni-holemy.js */
Atlas.registerMonster({
  "format": 2,
  "id": "vuhilni-holemy",
  "name": "Вугільні големи",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "chorni-sosny",
      "popelyasti-halyavyny",
      "vuhilni-pahorby",
      "smolyani-yary"
    ],
    "worlds": [
      "vuhlerod"
    ]
  },
  "order": 856,
  "lore": {
    "description": "Загроза світу «Вуглерод»."
  }
});

/* monsters/vuhilnyy-piven.js */
Atlas.registerMonster({
  format: 2,
  id: "vuhilnyy-piven",
  name: "Вугільний Півень",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["volcanic", "ashlands"], worlds: "all" },
  order: 857,
  lore: {
    description: "Кремезний птах із чорних вугільних блоків, що має гребінь із гарячих цеглин.",
    behavior: "Мешкає в обвуглених селах біля лавових полів.",
    abilities: ["розкидає жар дзьобом і роздмухує вогонь крилами, але втрачає силу після тривалого перебування під дощем"],
  },
});

/* monsters/vuhlynkova-laska.js */
Atlas.registerMonster({
  format: 2,
  id: "vuhlynkova-laska",
  name: "Вуглинкова ласка",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["volcanic", "ashlands", "wasteland", "hills"], worlds: "all" },
  order: 554,
  lore: {
    description: "Довгий хижак із жаркими плямами на шерсті.",
    behavior: "Вулканічні руїни.",
    abilities: ["прослизає крізь вузькі щілини й залишає гарячі сліди"],
  },
});

/* monsters/vuhlynkova-murakha.js */
Atlas.registerMonster({
  format: 2,
  id: "vuhlynkova-murakha",
  name: "Вуглинкова мураха",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["grass", "ashlands"], worlds: "all" },
  order: 646,
  lore: {
    description: "Чорна мураха з жаркими щелепами.",
    behavior: "Попелясті поля.",
    abilities: ["переносить тліючі частинки й підпалює сухі рослини"],
  },
});

/* monsters/vukhatyy-skelelaz.js */
Atlas.registerMonster({
  format: 2,
  id: "vukhatyy-skelelaz",
  name: "Вухатий скелелаз",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills", "peaks"], worlds: "all" },
  order: 617,
  lore: {
    description: "Струнка гірська тварина з довгими вухами й широкими лапами.",
    behavior: "Скелясті вершини.",
    abilities: ["стрибає між вузькими виступами"],
  },
});

/* monsters/vukhokryl.js */
Atlas.registerMonster({
  format: 2,
  id: "vukhokryl",
  name: "Вухокрил",
  kind: "monster",
  nature: "threat",
  variants: ["пустельний вухокрил", "малий вухокрил"],
  spawn: { biomes: ["desert", "forest", "taiga"], worlds: "all" },
  order: 631,
  lore: {
    description: "Дрібний хижак із широкими вухами, що служать крилами для планерування. Об'єднує схожих істот: пустельний вухокрил, малий вухокрил.",
    behavior: "Піщані стіни. Лісові узлісся.",
    abilities: ["пустельний вухокрил: залітає в ущелини та вихоплює здобич", "малий вухокрил: планерує між гілками й іноді кидає тверді насінини"],
  },
});

/* monsters/vulkanichni-elementali.js */
Atlas.registerMonster({
  format: 1,
  id: "vulkanichni-elementali",
  name: "Вулканічні елементалі",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["volcanic", "ashlands"], worlds: "all" },
  order: 122,
});

/* monsters/vulkanichnyi-kuznets.js */
Atlas.registerMonster({
  "format": 2,
  "id": "vulkanichnyi-kuznets",
  "name": "Вулканічний коваль",
  "kind": "mini-boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "tag:hot",
      "tag:volcanic",
      "tag:ashlands"
    ],
    "worlds": "all"
  },
  "order": 967,
  "lore": {
    "description": "Кам'яний гігант із молотом із застиглої лави.",
    "behavior": "Кує зброю з магми, нападає на всіх, хто несе зброю.",
    "abilities": [
      "вогняний удар молотом",
      "кує щит із лави"
    ],
    "drops": [
      "молот лави",
      "магматична руда"
    ]
  }
});

/* monsters/vulkanichnyy-pryvratnyk.js */
Atlas.registerMonster({
  format: 1,
  id: "vulkanichnyy-pryvratnyk",
  name: "Вулканічний Привратник",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["volcanic", "ashlands"], worlds: "all" },
  order: 114,
});

/* monsters/vusatyy-zbyrach-buri.js */
Atlas.registerMonster({
  format: 2,
  id: "vusatyy-zbyrach-buri",
  name: "Вусатий збирач бурі",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["swamp", "peaks"], worlds: "all" },
  order: 484,
  lore: {
    description: "Літаючий звір із довгими електричними вусами.",
    behavior: "Грозові болота.",
    abilities: ["накопичує блискавки й випускає їх ланцюгом між металевими об’єктами"],
  },
});

/* monsters/vuzdechka-techiy.js */
Atlas.registerMonster({
  format: 2,
  id: "vuzdechka-techiy",
  name: "Вуздечка Течій",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 817,
  lore: {
    description: "Довга водяна істота з чотирьох зчеплених петель тіла та перлинної голови.",
    behavior: "Ховається у вирвах річкових порогів.",
    abilities: ["обвиває плавця кільцями й тягне його за течією у вибраному напрямку, змушуючи боротися з водяним потоком"],
  },
});

/* monsters/vyrizuvach-zirok.js */
Atlas.registerMonster({
  format: 2,
  id: "vyrizuvach-zirok",
  name: "Вирізувач Зірок",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["peaks", "wasteland", "hills", "grass"], worlds: "all" },
  order: 754,
  lore: {
    description: "Величезна небесна істота з крильми-ножицями, плащем із темно-синього полотна й довгими пальцями-голками.",
    behavior: "Мешкає на вершині Покинутої обсерваторії.",
    abilities: ["відтинає від сузір’їв світні фрагменти, які падають на арену як розпечені зоряні уламки"],
  },
});

/* monsters/vyverten-perekotypole.js */
Atlas.registerMonster({
  format: 2,
  id: "vyverten-perekotypole",
  name: "Вивертень-Перекотиполе",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["grass", "hills"], worlds: "all" },
  order: 796,
  lore: {
    description: "Кулястий клубок гачкуватих гілок, сухого листя та насінних коробочок.",
    behavior: "Блукає Сухими перекотними луками.",
    abilities: ["котиться за вітром, а коли його зупиняють, розпадається на нерухомі колючі грудки, що знову збираються за кілька митей"],
  },
});

/* monsters/wandering-mimic.js */
Atlas.registerMonster({
  "format": 2,
  "id": "wandering-mimic",
  "name": "Мандрівний скринник",
  "kind": "other",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "citadel-graveyard",
      "ownerless-garden",
      "forest"
    ],
    "worlds": [
      "ostanky"
    ]
  },
  "order": 211,
  "lore": {
    "description": "Істота, що імітує стародавні скрині й ходить між уламками.",
    "behavior": "Лежить як скриня, кусає того, хто відкриває.",
    "abilities": [
      "імітація скрині",
      "укус",
      "пересування"
    ],
    "drops": [
      "реліквії невідомих рас (всередині)"
    ]
  }
});

/* monsters/yashcherolyud.js */
Atlas.registerMonster({
  format: 2,
  id: "yashcherolyud",
  name: "Ящеролюд",
  kind: "monster",
  nature: "threat",
  variants: ["ящеролюд-воїн", "ящеролюд-метальник"],
  spawn: { biomes: ["deep", "sea", "jungle", "grass"], worlds: "all" },
  order: 358,
  lore: {
    description: "Звичайний рептилоїд. Об'єднує схожих істот: ящеролюд-воїн, ящеролюд-метальник.",
    behavior: "Зустрічається: болота, річкові береги; джунглі, зарості.",
    abilities: ["спис", "луската шкіра", "метальні списи", "засідки"],
  },
});

/* monsters/yizhak.js */
Atlas.registerMonster({
  format: 2,
  id: "yizhak",
  name: "Їжак",
  kind: "weak",
  nature: "threat",
  variants: ["гігантський їжак", "колючий їжак"],
  spawn: { biomes: ["forest", "taiga", "grass", "hills"], worlds: "all" },
  order: 385,
  lore: {
    description: "Звір. Об'єднує схожих істот: гігантський їжак, колючий їжак.",
    behavior: "Зустрічається: луки, ліси; ліси, луки.",
    abilities: ["згортається в кулю", "випускає голки", "завдає шкоди голками"],
  },
});

/* monsters/zabuti-paladyny.js */
Atlas.registerMonster({
  "format": 2,
  "id": "zabuti-paladyny",
  "name": "Забуті паладини",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "reberni-hory",
      "krovyani-dolyny",
      "popelyasti-rivnyny",
      "cherepni-pechery",
      "sady-zabutykh-imen",
      "cherepni-plato",
      "kistyani-ustupy",
      "pylovi-dolyny",
      "pechery-khrebtsiv"
    ],
    "worlds": [
      "morgalis"
    ]
  },
  "order": 728,
  "lore": {
    "description": "Загроза світу «Морґаліс»."
  }
});

/* monsters/zacharovanyy-lytsar-bez-holovy.js */
Atlas.registerMonster({
  format: 2,
  id: "zacharovanyy-lytsar-bez-holovy",
  name: "Зачарований лицар без голови",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills", "grass"], worlds: "all" },
  order: 325,
  lore: {
    description: "Проклятий воїн.",
    behavior: "Зустрічається: старі дороги, руїни фортець.",
    abilities: ["удари довгим мечем", "темний туман", "кінний наскок"],
  },
});

/* monsters/zalizni-khyzhaky.js */
Atlas.registerMonster({
  "format": 2,
  "id": "zalizni-khyzhaky",
  "name": "Залізні хижаки",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "zalizni-pusteli",
      "mahnitni-stovpy",
      "kobaltovi-dzhunhli",
      "nebesni-rudnyky",
      "polyarni-kratery",
      "irzhavi-dibrovy",
      "chervoni-karyery",
      "zalizni-luky",
      "chorni-kuzni"
    ],
    "worlds": [
      "ferroks",
      "rzhavar"
    ]
  },
  "order": 737,
  "lore": {
    "description": "Загроза світу «Феррокс»."
  }
});

/* monsters/zalizni-zhuky.js */
Atlas.registerMonster({
  "format": 2,
  "id": "zalizni-zhuky",
  "name": "Залізні жуки",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "meteorni-rivnyny",
      "chorni-kratery",
      "sklyani-polya",
      "stari-udarni-hory",
      "midni-dolyny",
      "irzhavi-lisy",
      "sribni-plato",
      "kraterni-bolota"
    ],
    "worlds": [
      "asterfell"
    ]
  },
  "order": 804,
  "lore": {
    "description": "Загроза світу «Астерфелл»."
  }
});

/* monsters/zaliznokrylyy-hryfon.js */
Atlas.registerMonster({
  format: 2,
  id: "zaliznokrylyy-hryfon",
  name: "Залізнокрилий грифон",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills", "wasteland"], worlds: "all" },
  order: 288,
  lore: {
    description: "Магічний хижак.",
    behavior: "Зустрічається: високі скелі, руїни фортець.",
    abilities: ["повітряні атаки", "металеві пера", "вітрові пориви"],
  },
});

/* monsters/zaliznyy-okhoronets-bramy.js */
Atlas.registerMonster({
  format: 2,
  id: "zaliznyy-okhoronets-bramy",
  name: "Залізний охоронець брами",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["grass", "hills", "mountain"], worlds: "all" },
  order: 352,
  lore: {
    description: "Елітний конструкт.",
    behavior: "Зустрічається: замки та підземні брами.",
    abilities: ["важка булава", "щитова хвиля", "блокування проходів"],
  },
});

/* monsters/zaliznyy-parazyt.js */
Atlas.registerMonster({
  format: 2,
  id: "zaliznyy-parazyt",
  name: "Залізний Паразит",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills", "mountain"], worlds: "all" },
  order: 903,
  lore: {
    description: "Плоска істота з чорних металевих лусочок і чотирьох гачків.",
    behavior: "Мешкає у покинутих залізних копальнях.",
    abilities: ["чіпляється до обладунків гравця, збільшуючи їхню вагу й знижуючи швидкість, доки його не скинуть ударом об стіну"],
  },
});

/* monsters/zarosli-holemy.js */
Atlas.registerMonster({
  "format": 2,
  "id": "zarosli-holemy",
  "name": "Зарослі големи",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "kolyuchi-polya",
      "liany-staroho-mista",
      "korenevi-yary",
      "sukhi-shypasti-stepy"
    ],
    "worlds": [
      "ternaviya"
    ]
  },
  "order": 809,
  "lore": {
    "description": "Загроза світу «Тернавія»."
  }
});

/* monsters/zaryadzheni-khyzhaky.js */
Atlas.registerMonster({
  "format": 2,
  "id": "zaryadzheni-khyzhaky",
  "name": "Заряджені хижаки",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "synohromovi-stepy",
      "sklyani-kanyony",
      "burshtynovi-vysoty",
      "hromovi-bolota",
      "chorni-providni-pechery",
      "hromovi-stepy",
      "chorni-plato",
      "sukhi-veresovyshcha",
      "dolyny-blyskavychnoho-kamenyu"
    ],
    "worlds": [
      "eshkariya"
    ]
  },
  "order": 715,
  "lore": {
    "description": "Загроза світу «Ешкарія»."
  }
});

/* monsters/zasnuli-vartovi.js */
Atlas.registerMonster({
  "format": 2,
  "id": "zasnuli-vartovi",
  "name": "Заснулі вартові",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "smarahdovi-stepy",
      "veresovi-pahorby",
      "korenevi-yary",
      "kamyani-pokhovannya"
    ],
    "worlds": [
      "grondar"
    ]
  },
  "order": 788,
  "lore": {
    "description": "Загроза світу «Ґрондар»."
  }
});

/* monsters/zatonulyy-pirat-skelet.js */
Atlas.registerMonster({
  format: 2,
  id: "zatonulyy-pirat-skelet",
  name: "Затонулий пірат-скелет",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 428,
  lore: {
    description: "Неживий гуманоїд.",
    behavior: "Зустрічається: затонулі судна.",
    abilities: ["іржава шабля", "гарпун"],
  },
});

/* monsters/zatopleni-lytsari.js */
Atlas.registerMonster({
  "format": 2,
  "id": "zatopleni-lytsari",
  "name": "Затоплені лицарі",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "milkovodni-sady",
      "chorni-pryplyvni-skeli",
      "koralovi-uzberezhzhya",
      "soloni-zaplavy"
    ],
    "worlds": [
      "talmoriya"
    ]
  },
  "order": 785,
  "lore": {
    "description": "Загроза світу «Талморія»."
  }
});

/* monsters/zbyrach-dzvinkykh-kamintsiv.js */
Atlas.registerMonster({
  format: 2,
  id: "zbyrach-dzvinkykh-kamintsiv",
  name: "Збирач дзвінких камінців",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 493,
  lore: {
    description: "Панцирний ящір із кам’яними пластинами.",
    behavior: "Ущелини дзвінких порід.",
    abilities: ["кидає пластини як рикошетні диски й повертає їх магнітним полем"],
  },
});

/* monsters/zdychavili-psy.js */
Atlas.registerMonster({
  format: 1,
  id: "zdychavili-psy",
  name: "Здичавілі пси",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["grass", "steppe", "forest", "hills"], worlds: "all" },
  order: 126,
});

/* monsters/zelenyy-mantykor.js */
Atlas.registerMonster({
  format: 1,
  id: "zelenyy-mantykor",
  name: "Зелений Мантикор",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga", "enchanted"], worlds: "all" },
  order: 74,
});

/* monsters/zemlekop-nebes.js */
Atlas.registerMonster({
  "format": 2,
  "id": "zemlekop-nebes",
  "name": "Землекоп Небес",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "kryshtalevi-neboskhyly",
      "kamyani-khmary",
      "hlybynni-luky",
      "sonyachni-porozhnyny",
      "pokhovani-mista"
    ],
    "worlds": [
      "skarveld"
    ]
  },
  "order": 756,
  "lore": {
    "description": "Землекоп Небес здатний обвалювати цілі рівні."
  }
});

/* monsters/zernovyy-pozhyrach.js */
Atlas.registerMonster({
  format: 2,
  id: "zernovyy-pozhyrach",
  name: "Зерновий Пожирач",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["peaks", "wasteland", "hills"], worlds: "all" },
  order: 774,
  lore: {
    description: "Кремезна істота з тулубом-бочкою, солом’яними батогами замість рук і обертовим жорном замість голови.",
    behavior: "Живе в покинутому зерносховищі на вітряних пагорбах.",
    abilities: ["ковтає зерно, а потім видихає хмари дрібного пилу, що засліплюють та засипають проходи"],
  },
});

/* monsters/zernoyidni-chudovyska.js */
Atlas.registerMonster({
  "format": 2,
  "id": "zernoyidni-chudovyska",
  "name": "Зерноїдні чудовиська",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "zhovti-zhornovi-polya",
      "kamyani-mlynovi-pahorby",
      "vysoki-travyani-stepy",
      "zernoskhovyshcha-pidzemel"
    ],
    "worlds": [
      "zhornoverkh"
    ]
  },
  "order": 885,
  "lore": {
    "description": "Загроза світу «Жорноверх»."
  }
});

/* monsters/zernoyidnyy-klyuvach.js */
Atlas.registerMonster({
  format: 2,
  id: "zernoyidnyy-klyuvach",
  name: "Зерноїдний клювач",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["grass", "wasteland", "hills"], worlds: "all" },
  order: 598,
  lore: {
    description: "Кремезний птах із широким дзьобом.",
    behavior: "Покинуті поля.",
    abilities: ["збирає камінці й плюється ними серіями"],
  },
});

/* monsters/zernystyy-strazh.js */
Atlas.registerMonster({
  format: 2,
  id: "zernystyy-strazh",
  name: "Зернистий страж",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["desert", "wasteland", "hills"], worlds: "all" },
  order: 563,
  lore: {
    description: "Грудкувата істота з рухомих піщинок.",
    behavior: "Піщані храми.",
    abilities: ["розпадається від удару та збирається за кілька кроків"],
  },
});

/* monsters/zhaba.js */
Atlas.registerMonster({
  format: 2,
  id: "zhaba",
  name: "Жаба",
  kind: "weak",
  nature: "threat",
  variants: ["отруйна деревна жаба", "велика жаба-бульбашник"],
  spawn: { biomes: ["jungle", "swamp"], worlds: "all" },
  order: 381,
  lore: {
    description: "Земноводне. Об'єднує схожих істот: отруйна деревна жаба, велика жаба-бульбашник.",
    behavior: "Зустрічається: джунглі; болота.",
    abilities: ["отруйний дотик", "маскування", "плюється липкими бульбашками", "сповільнює цілі"],
  },
});

/* monsters/zhabokist.js */
Atlas.registerMonster({
  format: 2,
  id: "zhabokist",
  name: "Жабокіст",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["wasteland", "hills", "lake"], worlds: "all" },
  order: 523,
  lore: {
    description: "Болотяний амфібій із білими кістяними пластинами.",
    behavior: "Затоплені руїни.",
    abilities: ["плюється густою слиною, що склеює ноги"],
  },
});

/* monsters/zhertovnyy-maskaron.js */
Atlas.registerMonster({
  format: 2,
  id: "zhertovnyy-maskaron",
  name: "Жертовний Маскарон",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 755,
  lore: {
    description: "Величезна кам’яна театральна маска з рухомою нижньою щелепою та кількома змінними обличчями на потилиці.",
    behavior: "Охороняє амфітеатр у Руїнах Тисячі Ролей.",
    abilities: ["кожна маска змінює правила арени: трагедія провалює підлогу, гнів здіймає шипи, а сміх змушує плити пружно відкидати всіх угору"],
  },
});

/* monsters/zhnets-hirskykh-vidlun.js */
Atlas.registerMonster({
  format: 2,
  id: "zhnets-hirskykh-vidlun",
  name: "Жнець Гірських Відлунь",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 847,
  lore: {
    description: "Чотиринога постать із чорного каменю, що має довгу шию та три порожні дзьоби.",
    behavior: "Живе в ущелині, де кожен крик повертається десятками голосів.",
    abilities: ["запам'ятовує звуки атак і повторює їх із затримкою у вигляді руйнівних звукових хвиль"],
  },
});

/* monsters/zhnets-pidzemnoho-sontsya.js */
Atlas.registerMonster({
  format: 2,
  id: "zhnets-pidzemnoho-sontsya",
  name: "Жнець підземного сонця",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 480,
  lore: {
    description: "Червоподібний титан із розпеченою спиною.",
    behavior: "Підземне магматичне море.",
    abilities: ["проходить крізь скелю, залишаючи лавові канали, що змінюють форму арени"],
  },
});

/* monsters/zhornovyy-kaban.js */
Atlas.registerMonster({
  format: 2,
  id: "zhornovyy-kaban",
  name: "Жорновий кабан",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 488,
  lore: {
    description: "Дикий звір із кам’яними колесами замість плечей.",
    behavior: "Гірські каменярні.",
    abilities: ["розганяється по схилах і дробить усе на своєму шляху"],
  },
});

/* monsters/zhovtohrudyy-koroyid.js */
Atlas.registerMonster({
  format: 2,
  id: "zhovtohrudyy-koroyid",
  name: "Жовтогрудий короїд",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga"], worlds: "all" },
  order: 623,
  lore: {
    description: "Великий лісовий звір із міцними щелепами.",
    behavior: "Старі хвойні ліси.",
    abilities: ["здирає кору й кидає її на переслідувачів"],
  },
});

/* monsters/zhuk-dzerkalokryl.js */
Atlas.registerMonster({
  format: 2,
  id: "zhuk-dzerkalokryl",
  name: "Жук-дзеркалокрил",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga", "grass"], worlds: "all" },
  order: 645,
  lore: {
    description: "Комаха з гладкими сріблястими надкрилами.",
    behavior: "Сонячні галявини.",
    abilities: ["коротко засліплює світловими відблисками"],
  },
});

/* monsters/zhuk-nosorih.js */
Atlas.registerMonster({
  format: 2,
  id: "zhuk-nosorih",
  name: "Жук-носоріг",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga", "grass", "hills"], worlds: "all" },
  order: 390,
  lore: {
    description: "Комаха.",
    behavior: "Зустрічається: луки, ліси.",
    abilities: ["таран рогом", "перекидання ворогів"],
  },
});

/* monsters/zhyvyy-klyn.js */
Atlas.registerMonster({
  format: 2,
  id: "zhyvyy-klyn",
  name: "Живий клин",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills", "grass"], worlds: "all" },
  order: 609,
  lore: {
    description: "Невеликий монстр із трикутним тілом.",
    behavior: "Руїни замків.",
    abilities: ["прослизає під дверима й різко розкривається, відкидаючи супротивника"],
  },
});

/* monsters/zhyvyy-nul.js */
Atlas.registerMonster({
  format: 2,
  id: "zhyvyy-nul",
  name: "Живий нуль",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "volcanic"], worlds: "all" },
  order: 452,
  lore: {
    description: "Геометрична істота у формі порожнього куба.",
    behavior: "Мертва зона магії.",
    abilities: ["стирає магічні ефекти, руйнує зачаровані предмети й тимчасово вимикає здібності"],
  },
});

/* monsters/zhyvyy-vuzol.js */
Atlas.registerMonster({
  format: 2,
  id: "zhyvyy-vuzol",
  name: "Живий вузол",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga", "grass", "hills"], worlds: "all" },
  order: 597,
  lore: {
    description: "Грудка коріння, мотузок і сухих гілок.",
    behavior: "Старі лісові дороги.",
    abilities: ["стрибає на ноги, зав’язується навколо них і сповільнює рух"],
  },
});

/* monsters/zipsutyy-khranytel-rivnovahy.js */
Atlas.registerMonster({
  "format": 2,
  "id": "zipsutyy-khranytel-rivnovahy",
  "name": "Зіпсутий Хранитель Рівноваги",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "kvituchi-dibrovy",
      "zoloti-zhnyva",
      "bahryani-veresovyshcha",
      "kryzhanyy-pereval"
    ],
    "worlds": [
      "sezonariy"
    ]
  },
  "order": 833,
  "lore": {
    "description": "Бос світу «Сезонарій»."
  }
});

/* monsters/zlyy-husak.js */
Atlas.registerMonster({
  format: 2,
  id: "zlyy-husak",
  name: "Злий гусак",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 438,
  lore: {
    description: "Птах.",
    behavior: "Зустрічається: сільські водойми.",
    abilities: ["клювання", "переслідування"],
  },
});

/* monsters/zmiy-kryshtalevoho-sertsya.js */
Atlas.registerMonster({
  format: 2,
  id: "zmiy-kryshtalevoho-sertsya",
  name: "Змій кришталевого серця",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills", "crystal"], worlds: "all" },
  order: 273,
  lore: {
    description: "Кристалічний дракон.",
    behavior: "Зустрічається: геодні печери.",
    abilities: ["лазероподібні промені", "кристалічні шипи", "відбиття атак"],
  },
});

/* monsters/zmiy-verkhnoho-dzherela.js */
Atlas.registerMonster({
  "format": 2,
  "id": "zmiy-verkhnoho-dzherela",
  "name": "Змій Верхнього Джерела",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "solyani-dzvony",
      "povitryani-ryfy",
      "vodospadni-dzhunhli",
      "blue-hollows",
      "arkhipelahy-plavayuchoho-mulu",
      "vertykalni-dzhunhli",
      "dolyny-vyskhidnoyi-vody",
      "khmarni-arkhipelahy",
      "kamyani-richkovi-ushchelyny",
      "nebesni-bolota"
    ],
    "worlds": [
      "solemor"
    ]
  },
  "order": 711,
  "lore": {
    "description": "Бос світу «Солемор»."
  }
});

/* monsters/zmiya.js */
Atlas.registerMonster({
  format: 2,
  id: "zmiya",
  name: "Змія",
  kind: "monster",
  nature: "threat",
  variants: ["гігантська лісова змія", "скельний удав"],
  spawn: { biomes: ["jungle", "forest", "mountain", "hills"], worlds: "all" },
  order: 379,
  lore: {
    description: "Рептилія. Об'єднує схожих істот: гігантська лісова змія, скельний удав.",
    behavior: "Зустрічається: джунглі, хащі; ущелини, скелі.",
    abilities: ["укус", "обвивання", "камуфляж", "стискання"],
  },
});

/* monsters/zolotokryla-tsykada.js */
Atlas.registerMonster({
  format: 2,
  id: "zolotokryla-tsykada",
  name: "Золотокрила цикада",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga", "mountain", "hills"], worlds: "all" },
  order: 662,
  lore: {
    description: "Комаха з великими золотистими крилами.",
    behavior: "Теплі скелясті гаї.",
    abilities: ["гучним тріском дезорієнтує ворогів і періодично злітає вгору"],
  },
});

/* monsters/zolotysta-ryba-likhtar.js */
Atlas.registerMonster({
  format: 2,
  id: "zolotysta-ryba-likhtar",
  name: "Золотиста риба-ліхтар",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 701,
  lore: {
    description: "Невелика риба з яскравим світлом на хвості.",
    behavior: "Темні лагуни.",
    abilities: ["створює фальшиві вогники, які відволікають від справжньої загрози"],
  },
});

/* monsters/zolotyy-krykunchyk.js */
Atlas.registerMonster({
  format: 2,
  id: "zolotyy-krykunchyk",
  name: "Золотий Крикунчик",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 889,
  lore: {
    description: "Яскрава пташка з жовтими кубічними пір'їнами та великим синім дзьобом.",
    behavior: "Мешкає на дахах торговельних міст.",
    abilities: ["копіює звуки скринь, дверей і кроків, заманюючи гравця до своїх гнізд, де краде їжу"],
  },
});

/* monsters/zolotyy-lev-boh.js */
Atlas.registerMonster({
  format: 2,
  id: "zolotyy-lev-boh",
  name: "Золотий лев-бог",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["desert", "wasteland", "hills"], worlds: "all" },
  order: 275,
  lore: {
    description: "Магічний звір.",
    behavior: "Зустрічається: забутий храм серед пустелі.",
    abilities: ["сонячні вибухи", "сліпучий рев", "броня зі світла"],
  },
});

/* monsters/zombi-lytsar.js */
Atlas.registerMonster({
  format: 2,
  id: "zombi-lytsar",
  name: "Зомбі-лицар",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 333,
  lore: {
    description: "Елітна нежить.",
    behavior: "Зустрічається: покинуті фортеці.",
    abilities: ["важка броня", "щит", "заражені удари"],
  },
});

/* monsters/zombi-ohr.js */
Atlas.registerMonster({
  format: 2,
  id: "zombi-ohr",
  name: "Зомбі-огр",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 312,
  lore: {
    description: "Нежить.",
    behavior: "Зустрічається: заражені кладовища.",
    abilities: ["удари дубиною", "зараження", "стійкість до болю"],
  },
});

/* monsters/zombi-vedmid.js */
Atlas.registerMonster({
  format: 2,
  id: "zombi-vedmid",
  name: "Зомбі-ведмідь",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga"], worlds: "all" },
  order: 346,
  lore: {
    description: "Елітна нежить.",
    behavior: "Зустрічається: прокляті ліси.",
    abilities: ["потужні лапи", "заражений укус", "нечутливість до болю"],
  },
});

/* monsters/zombi.js */
Atlas.registerMonster({
  format: 2,
  id: "zombi",
  name: "Зомбі",
  kind: "monster",
  nature: "magic",
  variants: ["зомбі-селянин", "зомбі-шахтар", "зомбі-мандрівник"],
  spawn: { biomes: ["wasteland", "hills", "mountain", "grass"], worlds: "all" },
  order: 354,
  lore: {
    description: "Звичайна нежить. Об'єднує схожих істот: зомбі-селянин, зомбі-шахтар, зомбі-мандрівник.",
    behavior: "Зустрічається: покинуті села; шахти; дороги, рівнини.",
    abilities: ["повільні удари", "заражений дотик", "кирка", "руйнування слабких блоків", "несподівані атаки", "стійкість до оглушення"],
  },
});

/* monsters/zubastyy-naperstok.js */
Atlas.registerMonster({
  format: 2,
  id: "zubastyy-naperstok",
  name: "Зубастий наперсток",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 593,
  lore: {
    description: "Маленький конусоподібний хижак із кільцем дрібних зубів.",
    behavior: "Старі кам’яні стіни.",
    abilities: ["ховається у щілинах і кусає за пальці та лапи"],
  },
});

/* monsters/zubastyy-som.js */
Atlas.registerMonster({
  format: 2,
  id: "zubastyy-som",
  name: "Зубастий сом",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 413,
  lore: {
    description: "Донний хижак.",
    behavior: "Зустрічається: глибокі озера.",
    abilities: ["засмоктування здобичі", "удари хвостом"],
  },
});

/* monsters/zubatyy-pukhyr.js */
Atlas.registerMonster({
  format: 2,
  id: "zubatyy-pukhyr",
  name: "Зубатий пухир",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 558,
  lore: {
    description: "Водяний монстр із роздутим тілом.",
    behavior: "Тихі лагуни.",
    abilities: ["різко стискається, вистрілюючи колючками"],
  },
});

/* monsters/zvukovi-khyzhaky.js */
Atlas.registerMonster({
  "format": 2,
  "id": "zvukovi-khyzhaky",
  "name": "Звукові хижаки",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "dzvinki-khrebty",
      "tykhi-porozhnyny",
      "spivochi-stepy",
      "rezonansni-lisy",
      "basovi-bezodni"
    ],
    "worlds": [
      "runhar"
    ]
  },
  "order": 749,
  "lore": {
    "description": "Загроза світу «Рунгар»."
  }
});
