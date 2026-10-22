/* Автоматично: node tools/build-atlas-registry.mjs. Не правити вручну: правте файли в папках. */
/* dungeons/akvedukovi-tunely.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "akvedukovi-tunely",
  "name": "Акведукові Тунелі",
  "anchor": {
    "type": "city",
    "tiers": [
      3,
      4,
      5,
      6
    ]
  },
  "size": {
    "rooms": [
      10,
      30
    ],
    "length": [
      600,
      2500
    ],
    "area": [
      800,
      4000
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "водяні вартові"
  ],
  "chance": 0.5,
  "danger": 2,
  "order": 778,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "akvedor"
    ]
  },
  "lore": {
    "description": "Підземні тунелі мережі акведуків."
  }
});

/* dungeons/alchemist-vault.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "alchemist-vault",
  "name": "Лабораторія алхіміків",
  "anchor": {
    "type": "poi",
    "poi": [
      "mage_tower",
      "ruins"
    ]
  },
  "size": {
    "rooms": [
      8,
      24
    ],
    "length": [
      600,
      2200
    ],
    "area": [
      1000,
      4500
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "алхіміки-відлюдники",
    "трансмутовані істоти",
    "живі слизи"
  ],
  "chance": 0.3,
  "danger": 3,
  "order": 311,
  "spawn": {
    "biomes": "all",
    "worlds": "all"
  },
  "lore": {
    "description": "Підземні лабораторії, де експерименти давно вийшли з-під контролю."
  },
  "sim": {
    "tags": {
      "lab": 60,
      "library": 25,
      "cache": 15
    },
    "corr": 10,
    "cave": false
  }
});

/* dungeons/alkhimichni-pohreby-sadiv.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "alkhimichni-pohreby-sadiv",
  "name": "Алхімічні погреби садів",
  "anchor": {
    "type": "poi",
    "poi": [
      "alkhimichni-pohreby-sadiv"
    ]
  },
  "size": {
    "rooms": [
      12,
      30
    ],
    "length": [
      600,
      2300
    ],
    "area": [
      1400,
      5000
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "отруйні кабани",
    "кореневі охоронці",
    "глиняні помічники"
  ],
  "chance": 0.4,
  "danger": 2,
  "order": 431,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "orchardum"
    ]
  },
  "lore": {
    "description": "Погреби перших алхіміків, де зберігаються рідкісні сорти й рецепти."
  }
});

/* dungeons/ancient-vault.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "ancient-vault",
  "name": "Давнє підземелля",
  "anchor": {
    "type": "poi",
    "poi": [
      "ruins"
    ]
  },
  "size": {
    "rooms": [
      15,
      45
    ],
    "length": [
      900,
      3500
    ],
    "area": [
      2000,
      8000
    ],
    "levels": [
      2,
      4
    ]
  },
  "inhabitants": [
    "давні вартові",
    "нежить",
    "грабіжники"
  ],
  "chance": 0.7,
  "danger": 3,
  "order": 30,
  "spawn": {
    "biomes": "all",
    "worlds": "all"
  },
  "lore": {
    "description": "Підземні поверхи під старими руїнами."
  }
});

/* dungeons/arena-depths.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "arena-depths",
  "name": "Підземна арена",
  "anchor": {
    "type": "city",
    "tiers": [
      4,
      5,
      6
    ]
  },
  "size": {
    "rooms": [
      8,
      22
    ],
    "length": [
      500,
      1800
    ],
    "area": [
      1000,
      4000
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "гладіатори",
    "звірі арени",
    "організатори боїв"
  ],
  "chance": 0.25,
  "danger": 3,
  "order": 310,
  "spawn": {
    "biomes": "all",
    "worlds": "all"
  },
  "lore": {
    "description": "Нелегальна арена під містом: клітки, трибуни й комори зі зброєю."
  },
  "sim": {
    "tags": {
      "cells": 40,
      "blood": 35,
      "cache": 15
    },
    "corr": 20,
    "cave": false
  }
});

/* dungeons/arkhiv-pershoho-zerna.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "arkhiv-pershoho-zerna",
  "name": "Архів Першого Зерна",
  "anchor": {
    "type": "poi",
    "poi": [
      "arkhiv-pershoho-zerna"
    ]
  },
  "size": {
    "rooms": [
      18,
      44
    ],
    "length": [
      800,
      3100
    ],
    "area": [
      2000,
      7000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "паразити зародків",
    "насіннєві велети",
    "садівники буття"
  ],
  "chance": 0.4,
  "danger": 4,
  "order": 426,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "arkhelor"
    ]
  },
  "lore": {
    "description": "Сховище незароджених світів під поверхнею первісного ґрунту."
  }
});

/* dungeons/arsenaly-trykoronu.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "arsenaly-trykoronu",
  "name": "Арсенали Трикорону",
  "anchor": {
    "type": "poi",
    "poi": [
      "arsenaly-trykoronu"
    ]
  },
  "size": {
    "rooms": [
      15,
      37
    ],
    "length": [
      700,
      2700
    ],
    "area": [
      1700,
      6000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "лицарі-відступники",
    "облогові големи",
    "гоблінські загони"
  ],
  "chance": 0.4,
  "danger": 3,
  "order": 450,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "trykoron"
    ]
  },
  "lore": {
    "description": "Підземні арсенали трьох кілець мурів, що ведуть до королівської цитаделі."
  }
});

/* dungeons/bandit-hideout.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "bandit-hideout",
  "name": "Сховок бандитів",
  "anchor": {
    "type": "poi",
    "poi": [
      "bandit_camp"
    ]
  },
  "size": {
    "rooms": [
      3,
      8
    ],
    "length": [
      100,
      400
    ],
    "area": [
      200,
      700
    ],
    "levels": [
      1,
      1
    ]
  },
  "inhabitants": [
    "бандити",
    "полонені"
  ],
  "chance": 0.5,
  "danger": 1,
  "order": 37,
  "spawn": {
    "biomes": "all",
    "worlds": "all"
  },
  "lore": {
    "description": "Підземний схрон табору."
  }
});

/* dungeons/barrow.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "barrow",
  "name": "Курган-усипальня",
  "anchor": {
    "type": "poi",
    "poi": [
      "monument",
      "small_monument"
    ]
  },
  "size": {
    "rooms": [
      3,
      10
    ],
    "length": [
      100,
      500
    ],
    "area": [
      150,
      700
    ],
    "levels": [
      1,
      1
    ]
  },
  "inhabitants": [
    "нежить",
    "могильні варти"
  ],
  "chance": 0.5,
  "danger": 2,
  "order": 36,
  "spawn": {
    "biomes": "all",
    "worlds": "all"
  },
  "lore": {
    "description": "Усипальня під давнім пам'ятником чи знаком."
  }
});

/* dungeons/blood-well-shrine.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "blood-well-shrine",
  "name": "Підземне святилище колодязя",
  "anchor": {
    "type": "poi",
    "poi": [
      "blood-well"
    ]
  },
  "size": {
    "rooms": [
      8,
      30
    ],
    "length": [
      400,
      2000
    ],
    "area": [
      1200,
      5000
    ],
    "levels": [
      2,
      4
    ]
  },
  "inhabitants": [
    "кров'яні лицарі",
    "жерці крові"
  ],
  "chance": 0.85,
  "danger": 4,
  "order": 220,
  "spawn": {
    "biomes": [
      "blood-wells"
    ],
    "worlds": [
      "krovostep"
    ]
  },
  "lore": {
    "description": "Багаторівневі сходи колодязя ведуть до святилища давнього божества."
  }
});

/* dungeons/blue-hollow-caves.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "blue-hollow-caves",
  "name": "Печери Блакитної порожнини",
  "anchor": {
    "type": "poi",
    "poi": [
      "cloud-cavern"
    ]
  },
  "size": {
    "rooms": [
      8,
      25
    ],
    "length": [
      500,
      2000
    ],
    "area": [
      1500,
      5000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "туманні хижаки",
    "хмарні скати"
  ],
  "chance": 0.8,
  "danger": 3,
  "order": 240,
  "spawn": {
    "biomes": [
      "blue-hollows"
    ],
    "worlds": [
      "neborid"
    ]
  },
  "lore": {
    "description": "Печери між хмарними шарами; стелі й підлоги світяться паморозззю."
  }
});

/* dungeons/bog-grotto.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "bog-grotto",
  "name": "Болотна печера",
  "anchor": {
    "type": "poi",
    "poi": [
      "ruins",
      "small_monument"
    ]
  },
  "size": {
    "rooms": [
      6,
      20
    ],
    "length": [
      500,
      1800
    ],
    "area": [
      800,
      3500
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "болотні відьми",
    "трясинні тварі",
    "мерзенні жаби"
  ],
  "chance": 0.35,
  "danger": 2,
  "order": 307,
  "spawn": {
    "biomes": "all",
    "worlds": "all"
  },
  "lore": {
    "description": "Сирі печери під болотом, де вода доходить до кісточок, а подекуди й до пояса."
  },
  "sim": {
    "tags": {
      "flooded": 65,
      "webs": 20,
      "nests": 25
    },
    "corr": 8,
    "cave": true
  }
});

/* dungeons/bolotni-sklepy.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "bolotni-sklepy",
  "name": "Болотні Склепи",
  "anchor": {
    "type": "poi",
    "poi": [
      "ruins",
      "lake"
    ]
  },
  "size": {
    "rooms": [
      8,
      26
    ],
    "length": [
      480,
      1950
    ],
    "area": [
      1120,
      4940
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "синьовогнені блукальці",
    "болотні гнилі"
  ],
  "chance": 0.35,
  "danger": 3,
  "order": 732,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "nokserra"
    ]
  },
  "lore": {
    "description": "Склепи під водою з холодним синім полум'ям над газовими бульбашками."
  }
});

/* dungeons/burshtynovi-kamery.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "burshtynovi-kamery",
  "name": "Бурштинові камери",
  "anchor": {
    "type": "poi",
    "poi": [
      "burshtynovi-kamery"
    ]
  },
  "size": {
    "rooms": [
      15,
      37
    ],
    "length": [
      700,
      2700
    ],
    "area": [
      1700,
      6000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "смоляні хижаки",
    "бурштинові големи",
    "застиглі істоти"
  ],
  "chance": 0.4,
  "danger": 3,
  "order": 424,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "rakhmir"
    ]
  },
  "lore": {
    "description": "Підземні камери з істотами, що застигли в бурштині на останньому русі."
  }
});

/* dungeons/burshtynovi-vykhory.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "burshtynovi-vykhory",
  "name": "Бурштинові Виходи",
  "anchor": {
    "type": "poi",
    "poi": [
      "mountain",
      "ruins"
    ]
  },
  "size": {
    "rooms": [
      8,
      26
    ],
    "length": [
      480,
      1950
    ],
    "area": [
      1120,
      4940
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "бурштинові комахи",
    "вихрові зайди"
  ],
  "chance": 0.35,
  "danger": 3,
  "order": 739,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "rakhmir"
    ]
  },
  "lore": {
    "description": "Печери, де застигла буря, і в бурштині ховаються уламки ландшафту."
  }
});

/* dungeons/catacombs.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "catacombs",
  "name": "Катакомби",
  "anchor": {
    "type": "city",
    "tiers": [
      4,
      5,
      6
    ]
  },
  "size": {
    "rooms": [
      20,
      60
    ],
    "length": [
      1200,
      4000
    ],
    "area": [
      2500,
      9000
    ],
    "levels": [
      2,
      3
    ]
  },
  "inhabitants": [
    "скелети",
    "упирі",
    "культисти"
  ],
  "chance": 0.45,
  "danger": 2,
  "order": 11,
  "spawn": {
    "biomes": "all",
    "worlds": "all"
  },
  "lore": {
    "description": "Склепи й ходи під старими кварталами та цвинтарем."
  }
});

/* dungeons/chashovi-pechery.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "chashovi-pechery",
  "name": "Чашеві Печери",
  "anchor": {
    "type": "poi",
    "poi": [
      "glade",
      "waterfall"
    ]
  },
  "size": {
    "rooms": [
      8,
      24
    ],
    "length": [
      480,
      1800
    ],
    "area": [
      1120,
      4560
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "мінеральні водяники",
    "кальцитові чужаки"
  ],
  "chance": 0.35,
  "danger": 2,
  "order": 719,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "kaltseron"
    ]
  },
  "lore": {
    "description": "Печери з терасами, чашами джерел і прозорими озерцями на кожному рівні."
  }
});

/* dungeons/chorni-providni-pechery.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "chorni-providni-pechery",
  "name": "Чорні провідні печери",
  "anchor": {
    "type": "poi",
    "poi": [
      "chorni-providni-pechery"
    ]
  },
  "size": {
    "rooms": [
      18,
      44
    ],
    "length": [
      800,
      3100
    ],
    "area": [
      2000,
      7000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "заряджені хижаки",
    "кристалічні бізони",
    "племена провідників"
  ],
  "chance": 0.4,
  "danger": 4,
  "order": 405,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "eshkariya"
    ]
  },
  "lore": {
    "description": "Підземні тунелі з чорного магнітного базальту, що проводять блискавки."
  }
});

/* dungeons/chorni-zaly-pechatok.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "chorni-zaly-pechatok",
  "name": "Чорні зали печаток",
  "anchor": {
    "type": "poi",
    "poi": [
      "chorni-zaly-pechatok"
    ]
  },
  "size": {
    "rooms": [
      18,
      44
    ],
    "length": [
      800,
      3100
    ],
    "area": [
      2000,
      7000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "рунні вартові",
    "тіньові звірі",
    "каменярі-рунотворці"
  ],
  "chance": 0.4,
  "danger": 4,
  "order": 439,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "runozem"
    ]
  },
  "lore": {
    "description": "Підземні зали, де печатки найслабші, а стародавні чудовиська ближче до свободи."
  }
});

/* dungeons/chornylni-pechery.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "chornylni-pechery",
  "name": "Чорнильні печери",
  "anchor": {
    "type": "poi",
    "poi": [
      "chornylni-pechery"
    ]
  },
  "size": {
    "rooms": [
      15,
      37
    ],
    "length": [
      700,
      2700
    ],
    "area": [
      1700,
      6000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "фарбовані големи",
    "охоронці галерей",
    "статуї-вартові"
  ],
  "chance": 0.4,
  "danger": 3,
  "order": 455,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "malvar"
    ]
  },
  "lore": {
    "description": "Печерні галереї з розписами, що відкривають приховані двері й кімнати."
  }
});

/* dungeons/chotyry-pory-pidzemellya.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "chotyry-pory-pidzemellya",
  "name": "Підземелля Чотирьох Пір",
  "anchor": {
    "type": "poi",
    "poi": [
      "temple",
      "ruins"
    ]
  },
  "size": {
    "rooms": [
      16,
      44
    ],
    "length": [
      960,
      3300
    ],
    "area": [
      2240,
      8360
    ],
    "levels": [
      1,
      4
    ]
  },
  "inhabitants": [
    "сезонні духи",
    "крижані та квіткові стражі"
  ],
  "chance": 0.35,
  "danger": 3,
  "order": 744,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "sezonariy"
    ]
  },
  "lore": {
    "description": "Підземелля з чотирма крилами, у кожному з яких панує своя пора року."
  }
});

/* dungeons/cloud-monastery-crypt.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "cloud-monastery-crypt",
  "name": "Крипта гірського монастиря",
  "anchor": {
    "type": "poi",
    "poi": [
      "mountain-monastery"
    ]
  },
  "size": {
    "rooms": [
      8,
      22
    ],
    "length": [
      300,
      1400
    ],
    "area": [
      1000,
      4000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "ченці-привиди",
    "вартові громовідводів"
  ],
  "chance": 0.7,
  "danger": 3,
  "order": 241,
  "spawn": {
    "biomes": [
      "mineral-crowns",
      "peaks"
    ],
    "worlds": [
      "neborid"
    ]
  },
  "lore": {
    "description": "Підземні келії й сховище під монастирем на вершині."
  }
});

/* dungeons/crypt.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "crypt",
  "name": "Склеп",
  "anchor": {
    "type": "settlement",
    "states": [
      "ruined",
      "abandoned",
      "fallen"
    ]
  },
  "size": {
    "rooms": [
      4,
      12
    ],
    "length": [
      100,
      400
    ],
    "area": [
      200,
      800
    ],
    "levels": [
      1,
      1
    ]
  },
  "inhabitants": [
    "скелети",
    "привиди"
  ],
  "chance": 0.4,
  "danger": 2,
  "order": 21,
  "spawn": {
    "biomes": "all",
    "worlds": "all"
  },
  "lore": {
    "description": "Родинний склеп біля покинутого храму чи цвинтаря."
  }
});

/* dungeons/dakhova-kanalizatsiya.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "dakhova-kanalizatsiya",
  "name": "Дахова Каналізація",
  "anchor": {
    "type": "city",
    "tiers": [
      3,
      4,
      5,
      6
    ]
  },
  "size": {
    "rooms": [
      10,
      30
    ],
    "length": [
      600,
      2500
    ],
    "area": [
      800,
      4000
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "щурі",
    "дахоходи"
  ],
  "chance": 0.5,
  "danger": 2,
  "order": 777,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "doshchohrad"
    ]
  },
  "lore": {
    "description": "Каналізація міста-даху з водоспадами."
  }
});

/* dungeons/dakhovi-tsysterny.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "dakhovi-tsysterny",
  "name": "Дахові Цистерни",
  "anchor": {
    "type": "poi",
    "poi": [
      "ruins",
      "small_mine"
    ]
  },
  "size": {
    "rooms": [
      10,
      30
    ],
    "length": [
      600,
      2250
    ],
    "area": [
      1400,
      5700
    ],
    "levels": [
      2,
      4
    ]
  },
  "inhabitants": [
    "злодії-дахоходи",
    "болотяні водяники"
  ],
  "chance": 0.35,
  "danger": 2,
  "order": 705,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "doshchohrad"
    ]
  },
  "lore": {
    "description": "Вертикальний лабіринт цистерн і критих переходів під багатоярусним містом."
  }
});

/* dungeons/delve-city.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "delve-city",
  "name": "Покинуте підземне місто",
  "anchor": {
    "type": "poi",
    "poi": [
      "ruins",
      "small_mine"
    ]
  },
  "size": {
    "rooms": [
      25,
      80
    ],
    "length": [
      2500,
      9000
    ],
    "area": [
      4000,
      16000
    ],
    "levels": [
      2,
      4
    ]
  },
  "inhabitants": [
    "духи мешканців",
    "глибинні мисливці",
    "бандити-мародери"
  ],
  "chance": 0.2,
  "danger": 4,
  "order": 306,
  "spawn": {
    "biomes": "all",
    "worlds": "all"
  },
  "lore": {
    "description": "Ціла підземна вулиця з будинками, майстернями й залами зборів, давно покинута."
  },
  "sim": {
    "tags": {
      "rubble": 35,
      "ore": 20,
      "cache": 25
    },
    "corr": 15,
    "cave": false
  }
});

/* dungeons/dosh-kanal.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "dosh-kanal",
  "name": "Дощовий Колектор",
  "anchor": {
    "type": "city",
    "tiers": [
      3,
      4,
      5,
      6
    ]
  },
  "size": {
    "rooms": [
      10,
      30
    ],
    "length": [
      600,
      2500
    ],
    "area": [
      800,
      4000
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "водяні істоти"
  ],
  "chance": 0.5,
  "danger": 2,
  "order": 776,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "solemor"
    ]
  },
  "lore": {
    "description": "Колектор, куди стікає вода з небесного моря."
  }
});

/* dungeons/dragon-lair.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "dragon-lair",
  "name": "Лігво дракона",
  "anchor": {
    "type": "poi",
    "poi": [
      "mountain"
    ]
  },
  "size": {
    "rooms": [
      6,
      16
    ],
    "length": [
      800,
      2500
    ],
    "area": [
      2000,
      8000
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "дракон",
    "кобольди-прислужники",
    "скарбошукачі"
  ],
  "chance": 0.15,
  "danger": 5,
  "order": 301,
  "spawn": {
    "biomes": "all",
    "worlds": "all"
  },
  "lore": {
    "description": "Величезна печера зі скарбами та кістками тих, хто прийшов по них."
  },
  "sim": {
    "tags": {
      "cache": 70,
      "rubble": 30,
      "crystals": 20
    },
    "corr": 5,
    "cave": true
  }
});

/* dungeons/dzerkalni-zaly.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "dzerkalni-zaly",
  "name": "Дзеркальні Зали",
  "anchor": {
    "type": "poi",
    "poi": [
      "ruins",
      "monument"
    ]
  },
  "size": {
    "rooms": [
      10,
      30
    ],
    "length": [
      600,
      2250
    ],
    "area": [
      1400,
      5700
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "відображення",
    "дзеркальні варти"
  ],
  "chance": 0.35,
  "danger": 4,
  "order": 728,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "mirrahon"
    ]
  },
  "lore": {
    "description": "Зали з дзеркалами, у яких відображення діє самостійно."
  }
});

/* dungeons/dzherela-snovydin.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "dzherela-snovydin",
  "name": "Джерела Сновидінь",
  "anchor": {
    "type": "poi",
    "poi": [
      "ruins",
      "shrine"
    ]
  },
  "size": {
    "rooms": [
      8,
      26
    ],
    "length": [
      480,
      1950
    ],
    "area": [
      1120,
      4940
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "образи снів",
    "сонні вартові"
  ],
  "chance": 0.35,
  "danger": 4,
  "order": 754,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "umbralit"
    ]
  },
  "lore": {
    "description": "Печери, де сни матеріалізуються в предмети й створіння."
  }
});

/* dungeons/ember-tunnels.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "ember-tunnels",
  "name": "Вогняні тунелі",
  "anchor": {
    "type": "poi",
    "poi": [
      "mountain",
      "small_mine"
    ]
  },
  "size": {
    "rooms": [
      10,
      30
    ],
    "length": [
      900,
      3000
    ],
    "area": [
      1500,
      6000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "вогняні елементалі",
    "попелясті тварі",
    "магмові слизи"
  ],
  "chance": 0.25,
  "danger": 4,
  "order": 303,
  "spawn": {
    "biomes": "all",
    "worlds": "all"
  },
  "lore": {
    "description": "Розпечені тунелі біля вулканічних жил, де повітря тремтить від жару."
  },
  "sim": {
    "tags": {
      "rubble": 40,
      "ore": 30,
      "blood": 15
    },
    "corr": 10,
    "cave": true
  }
});

/* dungeons/freskovi-hallerey.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "freskovi-hallerey",
  "name": "Фрескові Галереї",
  "anchor": {
    "type": "poi",
    "poi": [
      "temple",
      "ruins"
    ]
  },
  "size": {
    "rooms": [
      10,
      32
    ],
    "length": [
      600,
      2400
    ],
    "area": [
      1400,
      6080
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "оживлені малюнки",
    "фарбові привиди"
  ],
  "chance": 0.35,
  "danger": 3,
  "order": 725,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "malvar"
    ]
  },
  "lore": {
    "description": "Підземні галереї з фресками, які оживають, якщо поглянути довго."
  }
});

/* dungeons/frost-cave.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "frost-cave",
  "name": "Крижана печера",
  "anchor": {
    "type": "poi",
    "poi": [
      "mountain",
      "small_monument"
    ]
  },
  "size": {
    "rooms": [
      8,
      26
    ],
    "length": [
      600,
      2200
    ],
    "area": [
      1500,
      6000
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "крижані вовки",
    "сніжні примари",
    "льодяні големи"
  ],
  "chance": 0.3,
  "danger": 3,
  "order": 302,
  "spawn": {
    "biomes": "all",
    "worlds": "all"
  },
  "lore": {
    "description": "Печери, скуті кригою, з промерзлими озерцями й крижаними залами."
  },
  "sim": {
    "tags": {
      "crystals": 50,
      "flooded": 20,
      "nests": 25
    },
    "corr": 5,
    "cave": true
  }
});

/* dungeons/fungus-caverns.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "fungus-caverns",
  "name": "Грибні печери",
  "anchor": {
    "type": "poi",
    "poi": [
      "mountain",
      "small_mine"
    ]
  },
  "size": {
    "rooms": [
      10,
      34
    ],
    "length": [
      700,
      2800
    ],
    "area": [
      1500,
      6000
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "грибні велети",
    "спорові тварі",
    "гноми-збирачі"
  ],
  "chance": 0.3,
  "danger": 2,
  "order": 308,
  "spawn": {
    "biomes": "all",
    "worlds": "all"
  },
  "lore": {
    "description": "Печери, поросли світними грибами, спори яких змінюють тих, хто довго тут дихає."
  },
  "sim": {
    "tags": {
      "nests": 30,
      "crystals": 25,
      "webs": 25
    },
    "corr": 5,
    "cave": true
  }
});

/* dungeons/great-hollow.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "great-hollow",
  "name": "Велике дупло з підземними проходами",
  "anchor": {
    "type": "poi",
    "poi": [
      "great-hollow"
    ]
  },
  "size": {
    "rooms": [
      12,
      40
    ],
    "length": [
      800,
      3000
    ],
    "area": [
      2500,
      9000
    ],
    "levels": [
      2,
      4
    ]
  },
  "inhabitants": [
    "павуки",
    "кореневі звірі"
  ],
  "chance": 0.7,
  "danger": 3,
  "order": 231,
  "spawn": {
    "biomes": [
      "moss-trunks",
      "jungle"
    ],
    "worlds": [
      "vershynnytsia"
    ]
  },
  "lore": {
    "description": "Дупло, що веде в підземні проходи між корінням сусідніх дерев."
  }
});

/* dungeons/hazovi-pechery.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "hazovi-pechery",
  "name": "Газові печери",
  "anchor": {
    "type": "poi",
    "poi": [
      "hazovi-pechery"
    ]
  },
  "size": {
    "rooms": [
      15,
      37
    ],
    "length": [
      700,
      2700
    ],
    "area": [
      1700,
      6000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "трясовинні хижаки",
    "вогняні духи",
    "болотні мисливці"
  ],
  "chance": 0.4,
  "danger": 3,
  "order": 434,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "nokserra"
    ]
  },
  "lore": {
    "description": "Печери з газовими тріщинами й мінеральними наростами, де горить синє полум'я."
  }
});

/* dungeons/hilkovi-pidvaly.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "hilkovi-pidvaly",
  "name": "Гіллясті Підвали",
  "anchor": {
    "type": "poi",
    "poi": [
      "glade",
      "ruins"
    ]
  },
  "size": {
    "rooms": [
      8,
      24
    ],
    "length": [
      480,
      1800
    ],
    "area": [
      1120,
      4560
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "гіллясті звірі",
    "павуки-ткачі"
  ],
  "chance": 0.35,
  "danger": 3,
  "order": 759,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "vershynnytsia"
    ]
  },
  "lore": {
    "description": "Підвали в дуплах велетенських дерев із щаблями з гілок."
  }
});

/* dungeons/hirska-viaznytsia.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "hirska-viaznytsia",
  "name": "Гірська В'язниця Птахів",
  "anchor": {
    "type": "city",
    "tiers": [
      3,
      4,
      5,
      6
    ]
  },
  "size": {
    "rooms": [
      8,
      24
    ],
    "length": [
      500,
      1800
    ],
    "area": [
      700,
      3000
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "сторожі",
    "крилаті звірі"
  ],
  "chance": 0.35,
  "danger": 3,
  "order": 785,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "midnokryl"
    ]
  },
  "lore": {
    "description": "В'язниця в скелі, що охороняється приручені птахами."
  },
  "sim": {
    "tags": {
      "cells": 60,
      "blood": 15,
      "rubble": 10
    },
    "corr": 30,
    "cave": false
  }
});

/* dungeons/hlynyani-labirynty.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "hlynyani-labirynty",
  "name": "Глиняні Лабіринти",
  "anchor": {
    "type": "poi",
    "poi": [
      "ruins",
      "small_mine"
    ]
  },
  "size": {
    "rooms": [
      14,
      40
    ],
    "length": [
      840,
      3000
    ],
    "area": [
      1960,
      7600
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "глиняні істоти",
    "гончарні вартові"
  ],
  "chance": 0.35,
  "danger": 2,
  "order": 716,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "hlynyshche"
    ]
  },
  "lore": {
    "description": "Лабіринти у вибитих глиняних скелях, схожі на велетенські виліплені соти."
  }
});

/* dungeons/hnizda-fortetsi-valdrenu.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "hnizda-fortetsi-valdrenu",
  "name": "Гнізда-фортеці Вальдрену",
  "anchor": {
    "type": "poi",
    "poi": [
      "hnizda-fortetsi-valdrenu"
    ]
  },
  "size": {
    "rooms": [
      15,
      37
    ],
    "length": [
      700,
      2700
    ],
    "area": [
      1700,
      6000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "повітряні змії",
    "гірські розбійники",
    "крилаті хижаки"
  ],
  "chance": 0.4,
  "danger": 3,
  "order": 427,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "valdren"
    ]
  },
  "lore": {
    "description": "Руїни стародавніх фортець, що колись були гніздами велетенських птахів."
  }
});

/* dungeons/hnizdovi-pechery.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "hnizdovi-pechery",
  "name": "Гніздові Печери",
  "anchor": {
    "type": "poi",
    "poi": [
      "mountain",
      "monument"
    ]
  },
  "size": {
    "rooms": [
      8,
      24
    ],
    "length": [
      480,
      1800
    ],
    "area": [
      1120,
      4560
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "гірські птахи",
    "пташині ловці"
  ],
  "chance": 0.35,
  "danger": 3,
  "order": 727,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "midnokryl"
    ]
  },
  "lore": {
    "description": "Печери в урвищах, де ховаються яйця й корми гірських птахів."
  }
});

/* dungeons/hromovi-hrotyy.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "hromovi-hrotyy",
  "name": "Громові Грота",
  "anchor": {
    "type": "poi",
    "poi": [
      "mountain",
      "monument"
    ]
  },
  "size": {
    "rooms": [
      8,
      26
    ],
    "length": [
      480,
      1950
    ],
    "area": [
      1120,
      4940
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "іскрові гончаки",
    "кристалічні варти"
  ],
  "chance": 0.35,
  "danger": 3,
  "order": 708,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "eshkariya"
    ]
  },
  "lore": {
    "description": "Печери в корінні блискавичних лісів, де кожен крок викликає розряд."
  }
});

/* dungeons/irzhavi-tunely.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "irzhavi-tunely",
  "name": "Іржаві Тунелі",
  "anchor": {
    "type": "poi",
    "poi": [
      "small_mine",
      "ruins"
    ]
  },
  "size": {
    "rooms": [
      10,
      30
    ],
    "length": [
      600,
      2250
    ],
    "area": [
      1400,
      5700
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "іржаві рослини",
    "залізні жуки"
  ],
  "chance": 0.35,
  "danger": 3,
  "order": 743,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "rzhavar"
    ]
  },
  "lore": {
    "description": "Тунелі, де метал проростає з порід, а повітря пахне іржею."
  }
});

/* dungeons/kamera-zhyvykh-nasinyn.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "kamera-zhyvykh-nasinyn",
  "name": "Камера Живих Насінин",
  "anchor": {
    "type": "poi",
    "poi": [
      "ruins",
      "glade"
    ]
  },
  "size": {
    "rooms": [
      6,
      18
    ],
    "length": [
      360,
      1350
    ],
    "area": [
      840,
      3420
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "паростеві істоти",
    "зародкові тіні"
  ],
  "chance": 0.35,
  "danger": 3,
  "order": 764,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "arkhelor"
    ]
  },
  "lore": {
    "description": "Малий склеп, де зберігаються насінини, що самі обирають господаря."
  }
});

/* dungeons/kamyani-khvyli-hrot.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "kamyani-khvyli-hrot",
  "name": "Грот Кам'яних Хвиль",
  "anchor": {
    "type": "poi",
    "poi": [
      "mountain",
      "lake"
    ]
  },
  "size": {
    "rooms": [
      8,
      24
    ],
    "length": [
      480,
      1800
    ],
    "area": [
      1120,
      4560
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "хвильові елементалі",
    "скельні плавуни"
  ],
  "chance": 0.35,
  "danger": 3,
  "order": 706,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "drumbor"
    ]
  },
  "lore": {
    "description": "Печера, де порода тече повільною хвилею й раз на добу змикає коридори."
  }
});

/* dungeons/kaplytsi-uzlamkiv.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "kaplytsi-uzlamkiv",
  "name": "Каплиці Уламків",
  "anchor": {
    "type": "poi",
    "poi": [
      "ruins",
      "temple"
    ]
  },
  "size": {
    "rooms": [
      10,
      32
    ],
    "length": [
      600,
      2400
    ],
    "area": [
      1400,
      6080
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "осколочні духи",
    "чужі вартові"
  ],
  "chance": 0.35,
  "danger": 4,
  "order": 737,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "ostanky"
    ]
  },
  "lore": {
    "description": "Каплиці, зібрані з уламків різних світів, де кожна стіна з іншої епохи."
  }
});

/* dungeons/katakomby-kistok.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "katakomby-kistok",
  "name": "Катакомби Кісток",
  "anchor": {
    "type": "city",
    "tiers": [
      4,
      5,
      6
    ]
  },
  "size": {
    "rooms": [
      20,
      60
    ],
    "length": [
      1200,
      4000
    ],
    "area": [
      2500,
      9000
    ],
    "levels": [
      2,
      3
    ]
  },
  "inhabitants": [
    "кістяні мерці"
  ],
  "chance": 0.45,
  "danger": 4,
  "order": 786,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "morgalis"
    ]
  },
  "lore": {
    "description": "Катакомби в кістках бога."
  }
});

/* dungeons/katakomby-mytey.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "katakomby-mytey",
  "name": "Катакомби Миттєвостей",
  "anchor": {
    "type": "city",
    "tiers": [
      4,
      5,
      6
    ]
  },
  "size": {
    "rooms": [
      20,
      60
    ],
    "length": [
      1200,
      4000
    ],
    "area": [
      2500,
      9000
    ],
    "levels": [
      2,
      3
    ]
  },
  "inhabitants": [
    "часові тіні"
  ],
  "chance": 0.45,
  "danger": 4,
  "order": 787,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "noktalis"
    ]
  },
  "lore": {
    "description": "Катакомби, де кожна ніша тримає застиглу мить."
  }
});

/* dungeons/keep-cellars.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "keep-cellars",
  "name": "Підвали зруйнованого замку",
  "anchor": {
    "type": "poi",
    "poi": [
      "ruins"
    ]
  },
  "size": {
    "rooms": [
      10,
      30
    ],
    "length": [
      500,
      2000
    ],
    "area": [
      1500,
      5000
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "привиди гарнізону",
    "бандити",
    "щури-гіганти"
  ],
  "chance": 0.5,
  "danger": 2,
  "order": 31,
  "spawn": {
    "biomes": "all",
    "worlds": "all"
  },
  "lore": {
    "description": "Склади, в'язниці й казарми замку, що провалився під землю."
  }
});

/* dungeons/khmarni-monastyri.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "khmarni-monastyri",
  "name": "Хмарні Підвали",
  "anchor": {
    "type": "poi",
    "poi": [
      "temple",
      "mountain"
    ]
  },
  "size": {
    "rooms": [
      8,
      24
    ],
    "length": [
      480,
      1800
    ],
    "area": [
      1120,
      4560
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "хмарні монахи",
    "вітряні духи"
  ],
  "chance": 0.35,
  "danger": 2,
  "order": 730,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "neborid"
    ]
  },
  "lore": {
    "description": "Підвали гірських монастирів на плато над хмарами."
  }
});

/* dungeons/khram-minlyvykh-zaliv.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "khram-minlyvykh-zaliv",
  "name": "Храм мінливих залів",
  "anchor": {
    "type": "poi",
    "poi": [
      "khram-minlyvykh-zaliv"
    ]
  },
  "size": {
    "rooms": [
      18,
      44
    ],
    "length": [
      800,
      3100
    ],
    "area": [
      2000,
      7000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "істоти страху",
    "мінливі копії гравця",
    "маскарі"
  ],
  "chance": 0.4,
  "danger": 4,
  "order": 419,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "kernalis"
    ]
  },
  "lore": {
    "description": "Храм, у якому кожен зал відображає інший характер світу."
  }
});

/* dungeons/khram-zvorotnykh-dverey.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "khram-zvorotnykh-dverey",
  "name": "Храм зворотних дверей",
  "anchor": {
    "type": "poi",
    "poi": [
      "khram-zvorotnykh-dverey"
    ]
  },
  "size": {
    "rooms": [
      18,
      44
    ],
    "length": [
      800,
      3100
    ],
    "area": [
      2000,
      7000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "двійники гравця",
    "скляні мисливці",
    "ордени відблисків"
  ],
  "chance": 0.4,
  "danger": 4,
  "order": 406,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "mirrahon"
    ]
  },
  "lore": {
    "description": "Храм на межі відображень, двері якого відчиняються лише з іншого боку."
  }
});

/* dungeons/kilcevi-bastiony.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "kilcevi-bastiony",
  "name": "Кільцеві Бастіони",
  "anchor": {
    "type": "poi",
    "poi": [
      "ruins",
      "monument"
    ]
  },
  "size": {
    "rooms": [
      16,
      48
    ],
    "length": [
      960,
      3600
    ],
    "area": [
      2240,
      9120
    ],
    "levels": [
      1,
      4
    ]
  },
  "inhabitants": [
    "гарнізонні привиди",
    "мурові вартові"
  ],
  "chance": 0.35,
  "danger": 3,
  "order": 753,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "trykoron"
    ]
  },
  "lore": {
    "description": "Підземні ходи між трьома кільцями оборонних мурів."
  }
});

/* dungeons/kistyane-lihvo.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "kistyane-lihvo",
  "name": "Кістяне Лігво Кочовиків",
  "anchor": {
    "type": "poi",
    "poi": [
      "bandit_camp"
    ]
  },
  "size": {
    "rooms": [
      3,
      8
    ],
    "length": [
      100,
      400
    ],
    "area": [
      200,
      700
    ],
    "levels": [
      1,
      1
    ]
  },
  "inhabitants": [
    "кістяні кочовики"
  ],
  "chance": 0.5,
  "danger": 3,
  "order": 779,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "krovostep"
    ]
  },
  "lore": {
    "description": "Схованка кочовиків у кістяних фортецях."
  }
});

/* dungeons/kistyani-katakomby.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "kistyani-katakomby",
  "name": "Піщані Катакомби",
  "anchor": {
    "type": "city",
    "tiers": [
      4,
      5,
      6
    ]
  },
  "size": {
    "rooms": [
      20,
      60
    ],
    "length": [
      1200,
      4000
    ],
    "area": [
      2500,
      9000
    ],
    "levels": [
      2,
      3
    ]
  },
  "inhabitants": [
    "кістяні шукачі"
  ],
  "chance": 0.45,
  "danger": 3,
  "order": 788,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "oskarium"
    ]
  },
  "lore": {
    "description": "Катакомби з тонким кістяним піском на підлозі."
  }
});

/* dungeons/kistyani-kolodyazi.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "kistyani-kolodyazi",
  "name": "Кістяні Колодязі",
  "anchor": {
    "type": "poi",
    "poi": [
      "bandit_camp",
      "ruins"
    ]
  },
  "size": {
    "rooms": [
      10,
      30
    ],
    "length": [
      600,
      2250
    ],
    "area": [
      1400,
      5700
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "кістяні кочовики",
    "колодязні вартові"
  ],
  "chance": 0.35,
  "danger": 4,
  "order": 722,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "krovostep"
    ]
  },
  "lore": {
    "description": "Колодязі кістяних фортець із обороною на сухих воротах."
  }
});

/* dungeons/kistyani-pechery-oskariumu.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "kistyani-pechery-oskariumu",
  "name": "Кістяні печери Оскаріуму",
  "anchor": {
    "type": "poi",
    "poi": [
      "kistyani-pechery-oskariumu"
    ]
  },
  "size": {
    "rooms": [
      15,
      37
    ],
    "length": [
      700,
      2700
    ],
    "area": [
      1700,
      6000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "кістяні акули",
    "рифові велети",
    "збирачі фрагментів"
  ],
  "chance": 0.4,
  "danger": 3,
  "order": 421,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "oskarium"
    ]
  },
  "lore": {
    "description": "Печери зі спресованих останків під кістяними морями."
  }
});

/* dungeons/kistyani-prymorski-pechery.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "kistyani-prymorski-pechery",
  "name": "Кістяні Піщані Печери",
  "anchor": {
    "type": "poi",
    "poi": [
      "mountain",
      "lake"
    ]
  },
  "size": {
    "rooms": [
      8,
      26
    ],
    "length": [
      480,
      1950
    ],
    "area": [
      1120,
      4940
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "кістяні краби",
    "піщані привиди"
  ],
  "chance": 0.35,
  "danger": 3,
  "order": 736,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "oskarium"
    ]
  },
  "lore": {
    "description": "Печери під «кістяним морем» з тонкими, як пісок, фрагментами."
  }
});

/* dungeons/kolorovi-zhyly.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "kolorovi-zhyly",
  "name": "Кольорові Жили",
  "anchor": {
    "type": "poi",
    "poi": [
      "small_mine",
      "mountain"
    ]
  },
  "size": {
    "rooms": [
      14,
      40
    ],
    "length": [
      840,
      3000
    ],
    "area": [
      1960,
      7600
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "рудні ґноми",
    "самоцвітні ящери"
  ],
  "chance": 0.35,
  "danger": 3,
  "order": 740,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "rudozir"
    ]
  },
  "lore": {
    "description": "Шахти вздовж кольорових жил руди, що світяться в темряві."
  }
});

/* dungeons/kolyshni-nebesa.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "kolyshni-nebesa",
  "name": "Колишні Небеса",
  "anchor": {
    "type": "poi",
    "poi": [
      "ruins",
      "mountain"
    ]
  },
  "size": {
    "rooms": [
      10,
      34
    ],
    "length": [
      600,
      2550
    ],
    "area": [
      1400,
      6460
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "хмарні тіні",
    "забуті птахи"
  ],
  "chance": 0.35,
  "danger": 4,
  "order": 745,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "skarveld"
    ]
  },
  "lore": {
    "description": "Печери зі стелями-старими небосхилами, де ще блукають хмари."
  }
});

/* dungeons/kopytni-nori.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "kopytni-nori",
  "name": "Копитні Нори",
  "anchor": {
    "type": "poi",
    "poi": [
      "glade",
      "small_mine"
    ]
  },
  "size": {
    "rooms": [
      8,
      24
    ],
    "length": [
      480,
      1800
    ],
    "area": [
      1120,
      4560
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "нірні велетні",
    "степові вовки"
  ],
  "chance": 0.35,
  "danger": 2,
  "order": 758,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "veletraviya"
    ]
  },
  "lore": {
    "description": "Нори під степом, прокопані й вибиті велетенськими стадами."
  }
});

/* dungeons/korabelni-trumy.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "korabelni-trumy",
  "name": "Корабельні Трюми",
  "anchor": {
    "type": "poi",
    "poi": [
      "ruins",
      "treasure"
    ]
  },
  "size": {
    "rooms": [
      12,
      36
    ],
    "length": [
      720,
      2700
    ],
    "area": [
      1680,
      6840
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "піщані пірати",
    "парусні привиди"
  ],
  "chance": 0.35,
  "danger": 3,
  "order": 761,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "vitroparus"
    ]
  },
  "lore": {
    "description": "Трюми наземних кораблів, закопаних у піски разом із вантажем."
  }
});

/* dungeons/korenevi-khody-ternaviyi.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "korenevi-khody-ternaviyi",
  "name": "Кореневі ходи Тернавії",
  "anchor": {
    "type": "poi",
    "poi": [
      "korenevi-khody-ternaviyi"
    ]
  },
  "size": {
    "rooms": [
      15,
      37
    ],
    "length": [
      700,
      2700
    ],
    "area": [
      1700,
      6000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "колючі хижаки",
    "зарослі големи",
    "броньовані комахи"
  ],
  "chance": 0.4,
  "danger": 3,
  "order": 433,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "ternaviya"
    ]
  },
  "lore": {
    "description": "Підземні ходи, прошиті хижими коренями під колючими хащами."
  }
});

/* dungeons/korenevi-pechery-pid-ostrovamy.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "korenevi-pechery-pid-ostrovamy",
  "name": "Кореневі печери під островами",
  "anchor": {
    "type": "poi",
    "poi": [
      "korenevi-pechery-pid-ostrovamy"
    ]
  },
  "size": {
    "rooms": [
      15,
      37
    ],
    "length": [
      700,
      2700
    ],
    "area": [
      1700,
      6000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "хижаки-мандрівники",
    "мисливці на корені",
    "острівні плавці"
  ],
  "chance": 0.4,
  "danger": 3,
  "order": 417,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "litarkh"
    ]
  },
  "lore": {
    "description": "Порожнини між кореневими плавцями живих островів, що мігрують морем."
  }
});

/* dungeons/korenevi-zaly-illariyi.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "korenevi-zaly-illariyi",
  "name": "Кореневі зали Ілларії",
  "anchor": {
    "type": "poi",
    "poi": [
      "korenevi-zaly-illariyi"
    ]
  },
  "size": {
    "rooms": [
      15,
      37
    ],
    "length": [
      700,
      2700
    ],
    "area": [
      1700,
      6000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "кореневі велети",
    "пелюсткові духи",
    "спорові мисливці"
  ],
  "chance": 0.4,
  "danger": 3,
  "order": 412,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "illariya"
    ]
  },
  "lore": {
    "description": "Підземні зали з коренів і живих сходів під соборними дібровами."
  }
});

/* dungeons/korin-sadiv.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "korin-sadiv",
  "name": "Коріння Садів",
  "anchor": {
    "type": "poi",
    "poi": [
      "glade",
      "temple"
    ]
  },
  "size": {
    "rooms": [
      8,
      28
    ],
    "length": [
      480,
      2100
    ],
    "area": [
      1120,
      5320
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "садові духи",
    "плодові хижаки"
  ],
  "chance": 0.35,
  "danger": 2,
  "order": 734,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "orchardum"
    ]
  },
  "lore": {
    "description": "Підземні зали під давніми садами, де коріння змінюють властивості плодів."
  }
});

/* dungeons/kovalski-pechery-embergardu.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "kovalski-pechery-embergardu",
  "name": "Ковальські печери Емберґарду",
  "anchor": {
    "type": "poi",
    "poi": [
      "kovalski-pechery-embergardu"
    ]
  },
  "size": {
    "rooms": [
      18,
      44
    ],
    "length": [
      800,
      3100
    ],
    "area": [
      2000,
      7000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "ковальські големи",
    "лавові звірі",
    "жарові жерці"
  ],
  "chance": 0.4,
  "danger": 4,
  "order": 420,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "embergard"
    ]
  },
  "lore": {
    "description": "Ковальські печери й рудні канали навколо розпеченого ядра світу."
  }
});

/* dungeons/kratery-ulamkiv.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "kratery-ulamkiv",
  "name": "Кратерні Уламкосховища",
  "anchor": {
    "type": "poi",
    "poi": [
      "mountain",
      "small_mine"
    ]
  },
  "size": {
    "rooms": [
      8,
      26
    ],
    "length": [
      480,
      1950
    ],
    "area": [
      1120,
      4940
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "метеоритні жуки",
    "зоряні шукачі"
  ],
  "chance": 0.35,
  "danger": 4,
  "order": 702,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "asterfell"
    ]
  },
  "lore": {
    "description": "Тунелі під ударним кратером, повні небесного металу й уламків чужих зірок."
  }
});

/* dungeons/krypta-hrafov.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "krypta-hrafov",
  "name": "Крипта Графів",
  "anchor": {
    "type": "settlement",
    "states": [
      "ruined",
      "abandoned",
      "fallen"
    ]
  },
  "size": {
    "rooms": [
      4,
      12
    ],
    "length": [
      100,
      400
    ],
    "area": [
      200,
      800
    ],
    "levels": [
      1,
      1
    ]
  },
  "inhabitants": [
    "гарнізонні привиди"
  ],
  "chance": 0.4,
  "danger": 3,
  "order": 767,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "trykoron"
    ]
  },
  "lore": {
    "description": "Склеп королівської знаті всередині мурів."
  }
});

/* dungeons/krypta-strakhiv.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "krypta-strakhiv",
  "name": "Крипта Страхів",
  "anchor": {
    "type": "settlement",
    "states": [
      "ruined",
      "abandoned",
      "fallen"
    ]
  },
  "size": {
    "rooms": [
      4,
      12
    ],
    "length": [
      100,
      400
    ],
    "area": [
      200,
      800
    ],
    "levels": [
      1,
      1
    ]
  },
  "inhabitants": [
    "уособлення страху"
  ],
  "chance": 0.4,
  "danger": 3,
  "order": 766,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "kernalis"
    ]
  },
  "lore": {
    "description": "Склеп, у якому страхи мешканців стають видимими."
  }
});

/* dungeons/kubichni-kamery.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "kubichni-kamery",
  "name": "Кубічні Камери",
  "anchor": {
    "type": "poi",
    "poi": [
      "ruins",
      "monument"
    ]
  },
  "size": {
    "rooms": [
      12,
      36
    ],
    "length": [
      720,
      2700
    ],
    "area": [
      1680,
      6840
    ],
    "levels": [
      1,
      4
    ]
  },
  "inhabitants": [
    "кубічні варти",
    "платформні блукальці"
  ],
  "chance": 0.35,
  "danger": 3,
  "order": 731,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "neverion"
    ]
  },
  "lore": {
    "description": "Кубічні кімнати, з'єднані зсувними платформами й мостами в порожнечі."
  }
});

/* dungeons/kuzni-pidhirya.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "kuzni-pidhirya",
  "name": "Кузні Підгір'я",
  "anchor": {
    "type": "poi",
    "poi": [
      "mountain",
      "small_mine"
    ]
  },
  "size": {
    "rooms": [
      14,
      40
    ],
    "length": [
      840,
      3000
    ],
    "area": [
      1960,
      7600
    ],
    "levels": [
      2,
      4
    ]
  },
  "inhabitants": [
    "вогняні ковалі",
    "попелясті ґолеми"
  ],
  "chance": 0.35,
  "danger": 4,
  "order": 707,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "embergard"
    ]
  },
  "lore": {
    "description": "Покинуті гірські кузні, де горнила досі горять без палива."
  }
});

/* dungeons/lodova-krypta.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "lodova-krypta",
  "name": "Крижана Крипта",
  "anchor": {
    "type": "settlement",
    "states": [
      "ruined",
      "abandoned",
      "fallen"
    ]
  },
  "size": {
    "rooms": [
      4,
      12
    ],
    "length": [
      100,
      400
    ],
    "area": [
      200,
      800
    ],
    "levels": [
      1,
      1
    ]
  },
  "inhabitants": [
    "морозні мерці",
    "льодові тіні"
  ],
  "chance": 0.4,
  "danger": 3,
  "order": 765,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "frostheym"
    ]
  },
  "lore": {
    "description": "Склеп, вичавлений у льоду, із замерзлими саркофагами."
  }
});

/* dungeons/lodovi-sklepinnya.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "lodovi-sklepinnya",
  "name": "Крижані Склепіння",
  "anchor": {
    "type": "poi",
    "poi": [
      "mountain",
      "ruins"
    ]
  },
  "size": {
    "rooms": [
      10,
      30
    ],
    "length": [
      600,
      2250
    ],
    "area": [
      1400,
      5700
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "льодові вовки",
    "замерзлі вартові"
  ],
  "chance": 0.35,
  "danger": 4,
  "order": 712,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "frostheym"
    ]
  },
  "lore": {
    "description": "Печери в глибині льодовика з вмороженими людьми й тваринами."
  }
});

/* dungeons/mage-cellar.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "mage-cellar",
  "name": "Лабораторія під вежею мага",
  "anchor": {
    "type": "poi",
    "poi": [
      "mage_tower"
    ]
  },
  "size": {
    "rooms": [
      8,
      20
    ],
    "length": [
      300,
      1200
    ],
    "area": [
      900,
      3000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "створені магом істоти",
    "големи",
    "елементалі"
  ],
  "chance": 0.75,
  "danger": 3,
  "order": 33,
  "spawn": {
    "biomes": "all",
    "worlds": "all"
  },
  "lore": {
    "description": "Лабораторії й клітки під вежею."
  }
});

/* dungeons/magnitni-shakhty-ferroksu.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "magnitni-shakhty-ferroksu",
  "name": "Магнітні Копальні",
  "anchor": {
    "type": "poi",
    "poi": [
      "small_mine",
      "mountain"
    ]
  },
  "size": {
    "rooms": [
      12,
      34
    ],
    "length": [
      720,
      2550
    ],
    "area": [
      1680,
      6460
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "залізні оповідачі",
    "магнітні рої"
  ],
  "chance": 0.35,
  "danger": 3,
  "order": 710,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "ferroks"
    ]
  },
  "lore": {
    "description": "Шахти, де інструмент прилипає до стін, а компас показує лише вглиб."
  }
});

/* dungeons/maliarskyi-pidval.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "maliarskyi-pidval",
  "name": "Малярський Підвал",
  "anchor": {
    "type": "poi",
    "poi": [
      "mage_tower"
    ]
  },
  "size": {
    "rooms": [
      8,
      20
    ],
    "length": [
      300,
      1200
    ],
    "area": [
      900,
      3000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "оживлені малюнки"
  ],
  "chance": 0.75,
  "danger": 3,
  "order": 781,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "malvar"
    ]
  },
  "lore": {
    "description": "Підвал художника-мага з оживаючими картинами."
  }
});

/* dungeons/mekhanizmy-kamyanykh-hodynnykiv.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "mekhanizmy-kamyanykh-hodynnykiv",
  "name": "Механізми кам'яних годинників",
  "anchor": {
    "type": "poi",
    "poi": [
      "mekhanizmy-kamyanykh-hodynnykiv"
    ]
  },
  "size": {
    "rooms": [
      18,
      44
    ],
    "length": [
      800,
      3100
    ],
    "area": [
      2000,
      7000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "часові двійники",
    "хроножуки",
    "старі воїни"
  ],
  "chance": 0.4,
  "danger": 4,
  "order": 401,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "noktalis"
    ]
  },
  "lore": {
    "description": "Годинникові вузли між часовими пластами: кожен перехід веде в іншу епоху."
  }
});

/* dungeons/mine.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "mine",
  "name": "Покинута шахта",
  "anchor": {
    "type": "poi",
    "poi": [
      "small_mine"
    ]
  },
  "size": {
    "rooms": [
      8,
      30
    ],
    "length": [
      500,
      3000
    ],
    "area": [
      1000,
      6000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "гномі привиди",
    "печерні тварі",
    "бандити"
  ],
  "chance": 0.85,
  "danger": 2,
  "order": 34,
  "spawn": {
    "biomes": [
      "hills",
      "mountain",
      "peaks"
    ],
    "worlds": "all"
  },
  "lore": {
    "description": "Старі штреки, що обвалилися чи наткнулися на печерну систему."
  }
});

/* dungeons/mlynovi-pidzemellya.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "mlynovi-pidzemellya",
  "name": "Млинові Підземелля",
  "anchor": {
    "type": "poi",
    "poi": [
      "ruins",
      "small_mine"
    ]
  },
  "size": {
    "rooms": [
      10,
      30
    ],
    "length": [
      600,
      2250
    ],
    "area": [
      1400,
      5700
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "жорнові ґолеми",
    "борошняні привиди"
  ],
  "chance": 0.35,
  "danger": 2,
  "order": 763,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "zhornoverkh"
    ]
  },
  "lore": {
    "description": "Підземні млини, де чарівне зерно досі перемелюється самотужки."
  }
});

/* dungeons/mountain-cave.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "mountain-cave",
  "name": "Печерна система",
  "anchor": {
    "type": "poi",
    "poi": [
      "mountain"
    ]
  },
  "size": {
    "rooms": [
      6,
      25
    ],
    "length": [
      400,
      2500
    ],
    "area": [
      800,
      5000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "ведмеді",
    "печерні монстри"
  ],
  "chance": 0.5,
  "danger": 2,
  "order": 35,
  "spawn": {
    "biomes": [
      "hills",
      "mountain",
      "peaks"
    ],
    "worlds": "all"
  },
  "lore": {
    "description": "Природні печери під горою; великі системи сполучаються зі шахтами."
  }
});

/* dungeons/nasinni-sklepinnya.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "nasinni-sklepinnya",
  "name": "Насінні Склепіння",
  "anchor": {
    "type": "poi",
    "poi": [
      "mountain",
      "glade"
    ]
  },
  "size": {
    "rooms": [
      10,
      30
    ],
    "length": [
      600,
      2250
    ],
    "area": [
      1400,
      5700
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "паростеві стражі",
    "спорові хробаки"
  ],
  "chance": 0.35,
  "danger": 3,
  "order": 701,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "arkhelor"
    ]
  },
  "lore": {
    "description": "Порожнисті насінини завбільшки з собор, у яких дрімають зародки невідомих істот."
  }
});

/* dungeons/nervovi-vuzly-ormy.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "nervovi-vuzly-ormy",
  "name": "Нервові вузли Орми",
  "anchor": {
    "type": "poi",
    "poi": [
      "nervovi-vuzly-ormy"
    ]
  },
  "size": {
    "rooms": [
      18,
      44
    ],
    "length": [
      800,
      3100
    ],
    "area": [
      2000,
      7000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "паразити-пожирачі",
    "імунні колоси",
    "симбіотичні жуки"
  ],
  "chance": 0.4,
  "danger": 4,
  "order": 402,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "ormaval"
    ]
  },
  "lore": {
    "description": "Храмові печери навколо нервових вузлів велета, що реагують на його думки."
  }
});

/* dungeons/nest-grottoes.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "nest-grottoes",
  "name": "Гроти порожніх гнізд",
  "anchor": {
    "type": "poi",
    "poi": [
      "empty-nest"
    ]
  },
  "size": {
    "rooms": [
      5,
      18
    ],
    "length": [
      300,
      1200
    ],
    "area": [
      800,
      3000
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "скельні хижаки",
    "агресивні птахи"
  ],
  "chance": 0.7,
  "danger": 2,
  "order": 250,
  "spawn": {
    "biomes": [
      "copper-nests",
      "mountain"
    ],
    "worlds": [
      "midnokryl"
    ]
  },
  "lore": {
    "description": "Печери за покинутими гніздами, в які оселилися хижаки."
  }
});

/* dungeons/occupied-warren.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "occupied-warren",
  "name": "Лігво загарбників",
  "anchor": {
    "type": "settlement",
    "states": [
      "occupied"
    ]
  },
  "size": {
    "rooms": [
      5,
      14
    ],
    "length": [
      150,
      500
    ],
    "area": [
      300,
      1000
    ],
    "levels": [
      1,
      1
    ]
  },
  "inhabitants": [
    "монстри-загарбники",
    "їхній виводок"
  ],
  "chance": 0.8,
  "danger": 2,
  "order": 22,
  "spawn": {
    "biomes": "all",
    "worlds": "all"
  },
  "lore": {
    "description": "Підвали й тунелі під захопленим монстрами поселенням."
  }
});

/* dungeons/okeani-svitla.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "okeani-svitla",
  "name": "Підпіскові Океани Світла",
  "anchor": {
    "type": "poi",
    "poi": [
      "ruins",
      "treasure"
    ]
  },
  "size": {
    "rooms": [
      8,
      26
    ],
    "length": [
      480,
      1950
    ],
    "area": [
      1120,
      4940
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "золоті піщані духи",
    "світляні медузи"
  ],
  "chance": 0.35,
  "danger": 4,
  "order": 714,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "heliontar"
    ]
  },
  "lore": {
    "description": "Підземні порожнини, заповнені світлом, що хлюпає, як вода."
  }
});

/* dungeons/padinnya-moriv.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "padinnya-moriv",
  "name": "Падіння Морів",
  "anchor": {
    "type": "poi",
    "poi": [
      "lake",
      "ruins"
    ]
  },
  "size": {
    "rooms": [
      8,
      26
    ],
    "length": [
      480,
      1950
    ],
    "area": [
      1120,
      4940
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "морські духи",
    "падаючі риби"
  ],
  "chance": 0.35,
  "danger": 3,
  "order": 748,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "solemor"
    ]
  },
  "lore": {
    "description": "Печери під місцями, куди падає вода з небесного моря."
  }
});

/* dungeons/palace-cellar-mine.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "palace-cellar-mine",
  "name": "Шахта-підвал палацу",
  "anchor": {
    "type": "poi",
    "poi": [
      "shard-mine"
    ]
  },
  "size": {
    "rooms": [
      15,
      40
    ],
    "length": [
      800,
      3000
    ],
    "area": [
      2000,
      7000
    ],
    "levels": [
      2,
      4
    ]
  },
  "inhabitants": [
    "уламкові големи",
    "збирачі решток"
  ],
  "chance": 0.8,
  "danger": 3,
  "order": 210,
  "spawn": {
    "biomes": [
      "citadel-graveyard",
      "ashlands"
    ],
    "worlds": [
      "ostanky"
    ]
  },
  "lore": {
    "description": "Шахта, що переходить у підвал знищеного палацу."
  }
});

/* dungeons/paperovi-shari.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "paperovi-shari",
  "name": "Паперові Шари",
  "anchor": {
    "type": "poi",
    "poi": [
      "ruins",
      "small_mine"
    ]
  },
  "size": {
    "rooms": [
      12,
      36
    ],
    "length": [
      720,
      2700
    ],
    "area": [
      1680,
      6840
    ],
    "levels": [
      2,
      5
    ]
  },
  "inhabitants": [
    "сторінкові істоти",
    "чорнильні блукальці"
  ],
  "chance": 0.35,
  "danger": 2,
  "order": 738,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "paperon"
    ]
  },
  "lore": {
    "description": "Багаторівневе підземелля з тонких шарів плато, що шарудять під ногами."
  }
});

/* dungeons/parovi-hrotyy.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "parovi-hrotyy",
  "name": "Парові Грота",
  "anchor": {
    "type": "poi",
    "poi": [
      "mountain",
      "glade"
    ]
  },
  "size": {
    "rooms": [
      8,
      26
    ],
    "length": [
      480,
      1950
    ],
    "area": [
      1120,
      4940
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "парові духи",
    "теплолюбні ящери"
  ],
  "chance": 0.35,
  "danger": 2,
  "order": 751,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "termalis"
    ]
  },
  "lore": {
    "description": "Грота з гарячими джерелами й густою парою."
  }
});

/* dungeons/parovi-tuneli-termalisa.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "parovi-tuneli-termalisa",
  "name": "Парові тунелі Термаліса",
  "anchor": {
    "type": "poi",
    "poi": [
      "parovi-tuneli-termalisa"
    ]
  },
  "size": {
    "rooms": [
      15,
      37
    ],
    "length": [
      700,
      2700
    ],
    "area": [
      1700,
      6000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "парові хижаки",
    "лавові жуки",
    "теплокровні звірі"
  ],
  "chance": 0.4,
  "danger": 3,
  "order": 448,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "termalis"
    ]
  },
  "lore": {
    "description": "Печери з паровими каналами під геотермальними долинами."
  }
});

/* dungeons/paruska-hrobnytsia.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "paruska-hrobnytsia",
  "name": "Парусна Гробниця",
  "anchor": {
    "type": "poi",
    "poi": [
      "monument",
      "ruins"
    ]
  },
  "size": {
    "rooms": [
      12,
      36
    ],
    "length": [
      900,
      3000
    ],
    "area": [
      1500,
      6500
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "піщані мумії",
    "парусні духи"
  ],
  "chance": 0.3,
  "danger": 3,
  "order": 768,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "vitroparus"
    ]
  },
  "lore": {
    "description": "Гробниця капітанів наземних кораблів."
  },
  "sim": {
    "tags": {
      "tombs": 55,
      "cache": 35,
      "webs": 15
    },
    "corr": 10,
    "cave": false
  }
});

/* dungeons/pastushyi-skhov.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "pastushyi-skhov",
  "name": "Пастуший Сховок",
  "anchor": {
    "type": "poi",
    "poi": [
      "bandit_camp"
    ]
  },
  "size": {
    "rooms": [
      3,
      8
    ],
    "length": [
      100,
      400
    ],
    "area": [
      200,
      700
    ],
    "levels": [
      1,
      1
    ]
  },
  "inhabitants": [
    "вовки",
    "злодії-пастухи"
  ],
  "chance": 0.5,
  "danger": 2,
  "order": 780,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "veletraviya"
    ]
  },
  "lore": {
    "description": "Схованка бандитів, що нападають на стада."
  }
});

/* dungeons/pechery-hlybokykh-spohadiv.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "pechery-hlybokykh-spohadiv",
  "name": "Печери глибоких спогадів",
  "anchor": {
    "type": "poi",
    "poi": [
      "pechery-hlybokykh-spohadiv"
    ]
  },
  "size": {
    "rooms": [
      18,
      44
    ],
    "length": [
      800,
      3100
    ],
    "area": [
      2000,
      7000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "страхітливі двійники",
    "хижаки забуття",
    "хранителі снів"
  ],
  "chance": 0.4,
  "danger": 4,
  "order": 425,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "umbralit"
    ]
  },
  "lore": {
    "description": "Підземелля, що ведуть до найглибших спогадів і кошмарів зниклої цивілізації."
  }
});

/* dungeons/pechery-khranyteliv-tyshi.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "pechery-khranyteliv-tyshi",
  "name": "Печери хранителів тиші",
  "anchor": {
    "type": "poi",
    "poi": [
      "pechery-khranyteliv-tyshi"
    ]
  },
  "size": {
    "rooms": [
      18,
      44
    ],
    "length": [
      800,
      3100
    ],
    "area": [
      2000,
      7000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "хранителі тиші",
    "звукові хижаки",
    "гулкі големи"
  ],
  "chance": 0.4,
  "danger": 4,
  "order": 416,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "runhar"
    ]
  },
  "lore": {
    "description": "Найдавніші печери світу, де абсолютна тиша послаблює простір."
  }
});

/* dungeons/pechery-skhovyshcha-hlynyanykh-mist.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "pechery-skhovyshcha-hlynyanykh-mist",
  "name": "Печери-сховища глиняних міст",
  "anchor": {
    "type": "poi",
    "poi": [
      "pechery-skhovyshcha-hlynyanykh-mist"
    ]
  },
  "size": {
    "rooms": [
      15,
      37
    ],
    "length": [
      700,
      2700
    ],
    "area": [
      1700,
      6000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "глиняні сторожі",
    "піщані черви",
    "уламкові жуки"
  ],
  "chance": 0.4,
  "danger": 3,
  "order": 437,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "hlynyshche"
    ]
  },
  "lore": {
    "description": "Печери-сховища й підземні випалювальні комплекси, що пережили розпад держави."
  }
});

/* dungeons/pechery-staroyi-shkiry.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "pechery-staroyi-shkiry",
  "name": "Печери Старої Шкіри",
  "anchor": {
    "type": "poi",
    "poi": [
      "pechery-staroyi-shkiry"
    ]
  },
  "size": {
    "rooms": [
      15,
      37
    ],
    "length": [
      700,
      2700
    ],
    "area": [
      1700,
      6000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "скельні ящери",
    "панцирні големи",
    "шкіряники"
  ],
  "chance": 0.4,
  "danger": 3,
  "order": 454,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "luskariya"
    ]
  },
  "lore": {
    "description": "Печери під панциром скам'янілого змія, що охороняє приховані входи."
  }
});

/* dungeons/pechery-strakhu.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "pechery-strakhu",
  "name": "Печери Страху",
  "anchor": {
    "type": "poi",
    "poi": [
      "ruins",
      "shrine"
    ]
  },
  "size": {
    "rooms": [
      8,
      26
    ],
    "length": [
      480,
      1950
    ],
    "area": [
      1120,
      4940
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "уособлення страху",
    "тіні мешканців"
  ],
  "chance": 0.35,
  "danger": 4,
  "order": 721,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "kernalis"
    ]
  },
  "lore": {
    "description": "Підземелля, яке набуває форми найбільшого страху того, хто в нього заходить."
  }
});

/* dungeons/pechery-svitlyakiv.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "pechery-svitlyakiv",
  "name": "Печери Світляків",
  "anchor": {
    "type": "poi",
    "poi": [
      "glade",
      "lake"
    ]
  },
  "size": {
    "rooms": [
      8,
      28
    ],
    "length": [
      480,
      2100
    ],
    "area": [
      1120,
      5320
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "світляні павуки",
    "грибні сторожі"
  ],
  "chance": 0.35,
  "danger": 2,
  "order": 724,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "lyumenvild"
    ]
  },
  "lore": {
    "description": "Темні печери, які освітлюють лише біолюмінесцентні рослини й гриби."
  }
});

/* dungeons/pechery-vykopnykh-kistok.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "pechery-vykopnykh-kistok",
  "name": "Печери викопних кісток",
  "anchor": {
    "type": "poi",
    "poi": [
      "pechery-vykopnykh-kistok"
    ]
  },
  "size": {
    "rooms": [
      12,
      30
    ],
    "length": [
      600,
      2300
    ],
    "area": [
      1400,
      5000
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "степові засідники",
    "хижі степові коти",
    "мисливські клани"
  ],
  "chance": 0.4,
  "danger": 2,
  "order": 436,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "veletraviya"
    ]
  },
  "lore": {
    "description": "Печери в м'якому пісковику зі слідами викопних велетів."
  }
});

/* dungeons/pechery-zhyvota.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "pechery-zhyvota",
  "name": "Чревні Печери",
  "anchor": {
    "type": "poi",
    "poi": [
      "mountain",
      "lake"
    ]
  },
  "size": {
    "rooms": [
      10,
      30
    ],
    "length": [
      600,
      2250
    ],
    "area": [
      1400,
      5700
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "сокові слизняки",
    "кров'яні паразити"
  ],
  "chance": 0.35,
  "danger": 4,
  "order": 735,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "ormaval"
    ]
  },
  "lore": {
    "description": "Пустоти в органах колосальної істоти, повні травних соків і слизу."
  }
});

/* dungeons/pechery-zhyvoyi-zemli.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "pechery-zhyvoyi-zemli",
  "name": "Печери Живої Землі",
  "anchor": {
    "type": "poi",
    "poi": [
      "mountain",
      "glade"
    ]
  },
  "size": {
    "rooms": [
      10,
      32
    ],
    "length": [
      600,
      2400
    ],
    "area": [
      1400,
      6080
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "земляні крокодили",
    "ґрунтові блукальці"
  ],
  "chance": 0.35,
  "danger": 3,
  "order": 723,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "litarkh"
    ]
  },
  "lore": {
    "description": "Печери, які повільно переходять разом із велетенською живою ділянкою суші."
  }
});

/* dungeons/perevernuti-zaly.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "perevernuti-zaly",
  "name": "Перевернуті Зали",
  "anchor": {
    "type": "poi",
    "poi": [
      "mountain",
      "ruins"
    ]
  },
  "size": {
    "rooms": [
      10,
      30
    ],
    "length": [
      600,
      2250
    ],
    "area": [
      1400,
      5700
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "висячі тіні",
    "перевернуті істоти"
  ],
  "chance": 0.35,
  "danger": 3,
  "order": 757,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "velarium"
    ]
  },
  "lore": {
    "description": "Зали, де підлога там, де в інших світах стеля."
  }
});

/* dungeons/petlyustky-pechery.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "petlyustky-pechery",
  "name": "Пелюсткові Печери",
  "anchor": {
    "type": "poi",
    "poi": [
      "mountain",
      "glade"
    ]
  },
  "size": {
    "rooms": [
      8,
      26
    ],
    "length": [
      480,
      1950
    ],
    "area": [
      1120,
      4940
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "кам'яні бджоли",
    "мінеральні квітки"
  ],
  "chance": 0.35,
  "danger": 2,
  "order": 746,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "skeltsvit"
    ]
  },
  "lore": {
    "description": "Печери в гігантських кам'яних квітках із пелюстками-стінами."
  }
});

/* dungeons/pidval-snoviddya.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "pidval-snoviddya",
  "name": "Підвал Сновидця",
  "anchor": {
    "type": "poi",
    "poi": [
      "mage_tower"
    ]
  },
  "size": {
    "rooms": [
      8,
      20
    ],
    "length": [
      300,
      1200
    ],
    "area": [
      900,
      3000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "образи снів"
  ],
  "chance": 0.75,
  "danger": 3,
  "order": 782,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "umbralit"
    ]
  },
  "lore": {
    "description": "Підвал чарівника снів із дверима в нікуди."
  }
});

/* dungeons/pidvaly-promenevykh-vezh.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "pidvaly-promenevykh-vezh",
  "name": "Підвали променевих веж",
  "anchor": {
    "type": "poi",
    "poi": [
      "pidvaly-promenevykh-vezh"
    ]
  },
  "size": {
    "rooms": [
      15,
      37
    ],
    "length": [
      700,
      2700
    ],
    "area": [
      1700,
      6000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "сонцесторожі",
    "нічні мисливці",
    "тіньові велети"
  ],
  "chance": 0.4,
  "danger": 3,
  "order": 410,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "vespern"
    ]
  },
  "lore": {
    "description": "Підземні сховища веж, де зберігаються втрачені променеві ключі."
  }
});

/* dungeons/pidvisheni-mahnitni-shakhty.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "pidvisheni-mahnitni-shakhty",
  "name": "Підвішені магнітні шахти",
  "anchor": {
    "type": "poi",
    "poi": [
      "pidvisheni-mahnitni-shakhty"
    ]
  },
  "size": {
    "rooms": [
      15,
      37
    ],
    "length": [
      700,
      2700
    ],
    "area": [
      1700,
      6000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "залізні жуки",
    "ковалі-полюсники",
    "метеорні звірі"
  ],
  "chance": 0.4,
  "danger": 3,
  "order": 411,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "ferroks"
    ]
  },
  "lore": {
    "description": "Шахти, що висять між магнітними полюсами: вага спорядження тут змінюється."
  }
});

/* dungeons/pidvisni-pechery.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "pidvisni-pechery",
  "name": "Підвісні Печери",
  "anchor": {
    "type": "poi",
    "poi": [
      "mountain",
      "small_mine"
    ]
  },
  "size": {
    "rooms": [
      8,
      24
    ],
    "length": [
      480,
      1800
    ],
    "area": [
      1120,
      4560
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "скельні птахи",
    "мотузкові павуки"
  ],
  "chance": 0.35,
  "danger": 3,
  "order": 715,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "hlybokray"
    ]
  },
  "lore": {
    "description": "Печери в стінах каньйонів із мостами з канатів і місцями без підлоги."
  }
});

/* dungeons/pidvodna-zatoka.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "pidvodna-zatoka",
  "name": "Підводна Затока",
  "anchor": {
    "type": "poi",
    "poi": [
      "bandit_camp",
      "small_monument"
    ]
  },
  "size": {
    "rooms": [
      6,
      18
    ],
    "length": [
      400,
      1500
    ],
    "area": [
      700,
      3000
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "контрабандисти-плавці"
  ],
  "chance": 0.4,
  "danger": 3,
  "order": 784,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "talassyr"
    ]
  },
  "lore": {
    "description": "Печерна затока з повітряними кишенями."
  },
  "sim": {
    "tags": {
      "cache": 55,
      "flooded": 30,
      "cells": 10
    },
    "corr": 25,
    "cave": false
  }
});

/* dungeons/pidvodni-khramy-fossaru.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "pidvodni-khramy-fossaru",
  "name": "Підводні храми Фоссару",
  "anchor": {
    "type": "poi",
    "poi": [
      "pidvodni-khramy-fossaru"
    ]
  },
  "size": {
    "rooms": [
      15,
      37
    ],
    "length": [
      700,
      2700
    ],
    "area": [
      1700,
      6000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "панцирні хижаки",
    "крабові големи",
    "печерні скорпіони"
  ],
  "chance": 0.4,
  "danger": 3,
  "order": 441,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "fossar"
    ]
  },
  "lore": {
    "description": "Храми, що вціліли в підземних водоймах під сухим морським дном."
  }
});

/* dungeons/pidvodni-pechery-talasyru.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "pidvodni-pechery-talasyru",
  "name": "Підводні Печери",
  "anchor": {
    "type": "poi",
    "poi": [
      "lake",
      "ruins"
    ]
  },
  "size": {
    "rooms": [
      12,
      36
    ],
    "length": [
      720,
      2700
    ],
    "area": [
      1680,
      6840
    ],
    "levels": [
      1,
      4
    ]
  },
  "inhabitants": [
    "глибинні риби",
    "печерні хижаки"
  ],
  "chance": 0.35,
  "danger": 4,
  "order": 749,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "talassyr"
    ]
  },
  "lore": {
    "description": "Затоплені пещерні системи з повітряними кишенями."
  }
});

/* dungeons/pidzemellya-chotyrokh-svyatyn.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "pidzemellya-chotyrokh-svyatyn",
  "name": "Підземелля чотирьох святинь",
  "anchor": {
    "type": "poi",
    "poi": [
      "pidzemellya-chotyrokh-svyatyn"
    ]
  },
  "size": {
    "rooms": [
      15,
      37
    ],
    "length": [
      700,
      2700
    ],
    "area": [
      1700,
      6000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "листяні големи",
    "крижані вовки",
    "хранителі сезонів"
  ],
  "chance": 0.4,
  "danger": 3,
  "order": 440,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "sezonariy"
    ]
  },
  "lore": {
    "description": "Сезонні підземелля під святинями весни, літа, осені й зими."
  }
});

/* dungeons/pidzemellya-starykh-krateriv.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "pidzemellya-starykh-krateriv",
  "name": "Підземелля старих кратерів",
  "anchor": {
    "type": "poi",
    "poi": [
      "pidzemellya-starykh-krateriv"
    ]
  },
  "size": {
    "rooms": [
      15,
      37
    ],
    "length": [
      700,
      2700
    ],
    "area": [
      1700,
      6000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "метеорні жуки",
    "розжарені големи",
    "гірські клановики"
  ],
  "chance": 0.4,
  "danger": 3,
  "order": 432,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "asterfell"
    ]
  },
  "lore": {
    "description": "Шахти й тріщини під кратерами, де осіли уламки небесного заліза."
  }
});

/* dungeons/pidzemne-misto-kurhaniv.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "pidzemne-misto-kurhaniv",
  "name": "Підземне місто курганів",
  "anchor": {
    "type": "poi",
    "poi": [
      "pidzemne-misto-kurhaniv"
    ]
  },
  "size": {
    "rooms": [
      15,
      37
    ],
    "length": [
      700,
      2700
    ],
    "area": [
      1700,
      6000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "тунельні жуки",
    "заснулі вартові",
    "кротолюди"
  ],
  "chance": 0.4,
  "danger": 3,
  "order": 429,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "grondar"
    ]
  },
  "lore": {
    "description": "Багаторівневе місто під пагорбом із самотнім деревом: зали, кузні й поховані фортеці."
  }
});

/* dungeons/pidzemni-halereyi-skulptoriv.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "pidzemni-halereyi-skulptoriv",
  "name": "Підземні галереї скульпторів",
  "anchor": {
    "type": "poi",
    "poi": [
      "pidzemni-halereyi-skulptoriv"
    ]
  },
  "size": {
    "rooms": [
      15,
      37
    ],
    "length": [
      700,
      2700
    ],
    "area": [
      1700,
      6000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "статуї-вартові",
    "кам'яні гончі",
    "скульптори-кочівники"
  ],
  "chance": 0.4,
  "danger": 3,
  "order": 435,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "kamyanorod"
    ]
  },
  "lore": {
    "description": "Галереї покинутих кар'єрів зі статуями, що оживають вночі."
  }
});

/* dungeons/pidzemni-medovi-skhovyshcha.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "pidzemni-medovi-skhovyshcha",
  "name": "Підземні медові сховища",
  "anchor": {
    "type": "poi",
    "poi": [
      "pidzemni-medovi-skhovyshcha"
    ]
  },
  "size": {
    "rooms": [
      12,
      30
    ],
    "length": [
      600,
      2300
    ],
    "area": [
      1400,
      5000
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "охоронці матки",
    "шершні-берсерки",
    "бджоли-воїни"
  ],
  "chance": 0.4,
  "danger": 2,
  "order": 452,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "medokray"
    ]
  },
  "lore": {
    "description": "Підземні камери для зберігання меду й воску в незалежних гніздах."
  }
});

/* dungeons/pidzemni-mineralni-dzherela.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "pidzemni-mineralni-dzherela",
  "name": "Підземні мінеральні джерела",
  "anchor": {
    "type": "poi",
    "poi": [
      "pidzemni-mineralni-dzherela"
    ]
  },
  "size": {
    "rooms": [
      12,
      30
    ],
    "length": [
      600,
      2300
    ],
    "area": [
      1400,
      5000
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "водяні хижаки",
    "карстові големи",
    "панцирні амфібії"
  ],
  "chance": 0.4,
  "danger": 2,
  "order": 446,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "kaltseron"
    ]
  },
  "lore": {
    "description": "Тепла карстова система під чашами басейнів, де мінеральна вода будує нові блоки."
  }
});

/* dungeons/pidzemni-mista-pid-dyunamy.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "pidzemni-mista-pid-dyunamy",
  "name": "Підземні міста під дюнами",
  "anchor": {
    "type": "poi",
    "poi": [
      "pidzemni-mista-pid-dyunamy"
    ]
  },
  "size": {
    "rooms": [
      18,
      44
    ],
    "length": [
      800,
      3100
    ],
    "area": [
      2000,
      7000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "пилові двійники",
    "вітряні жерці",
    "попеляні кочівники"
  ],
  "chance": 0.4,
  "danger": 4,
  "order": 413,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "varhess"
    ]
  },
  "lore": {
    "description": "Скам'янілі цивілізації, що ховаються під попелястими дюнами."
  }
});

/* dungeons/pidzemni-observatoriyi.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "pidzemni-observatoriyi",
  "name": "Підземні обсерваторії",
  "anchor": {
    "type": "poi",
    "poi": [
      "pidzemni-observatoriyi"
    ]
  },
  "size": {
    "rooms": [
      15,
      37
    ],
    "length": [
      700,
      2700
    ],
    "area": [
      1700,
      6000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "підземні астрономи",
    "хмарні хижаки",
    "небесні раси"
  ],
  "chance": 0.4,
  "danger": 3,
  "order": 418,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "skarveld"
    ]
  },
  "lore": {
    "description": "Обсерваторії всередині скель із похованими небосхилами над головою."
  }
});

/* dungeons/pidzemni-sonyachni-koreni.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "pidzemni-sonyachni-koreni",
  "name": "Підземні сонячні корені",
  "anchor": {
    "type": "poi",
    "poi": [
      "pidzemni-sonyachni-koreni"
    ]
  },
  "size": {
    "rooms": [
      15,
      37
    ],
    "length": [
      700,
      2700
    ],
    "area": [
      1700,
      6000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "тіньові звірі",
    "світлопожирачі",
    "розщеплені тіні"
  ],
  "chance": 0.4,
  "danger": 3,
  "order": 408,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "aurelit"
    ]
  },
  "lore": {
    "description": "Печери, де сонячні корені з'єднують континенти світлових плато."
  }
});

/* dungeons/pidzemni-tsarstva-pid-cherepamy.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "pidzemni-tsarstva-pid-cherepamy",
  "name": "Підземні царства під черепами",
  "anchor": {
    "type": "poi",
    "poi": [
      "pidzemni-tsarstva-pid-cherepamy"
    ]
  },
  "size": {
    "rooms": [
      18,
      44
    ],
    "length": [
      800,
      3100
    ],
    "area": [
      2000,
      7000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "хранителі останніх молитов",
    "некромантські ордени",
    "безіменні істоти"
  ],
  "chance": 0.4,
  "danger": 4,
  "order": 409,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "morgalis"
    ]
  },
  "lore": {
    "description": "Царства під черепами божеств, повні молитов і незавершених бажань."
  }
});

/* dungeons/pidzemni-tsysterny-akvedoru.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "pidzemni-tsysterny-akvedoru",
  "name": "Підземні цистерни Акведору",
  "anchor": {
    "type": "poi",
    "poi": [
      "pidzemni-tsysterny-akvedoru"
    ]
  },
  "size": {
    "rooms": [
      12,
      30
    ],
    "length": [
      600,
      2300
    ],
    "area": [
      1400,
      5000
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "канальні мародери",
    "водяні големи",
    "річкові ящери"
  ],
  "chance": 0.4,
  "danger": 2,
  "order": 453,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "akvedor"
    ]
  },
  "lore": {
    "description": "Підземні резервуари під водоводами, до яких ведуть механічні перемикачі."
  }
});

/* dungeons/pidzemni-zernoskhovyshcha.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "pidzemni-zernoskhovyshcha",
  "name": "Підземні зерносховища",
  "anchor": {
    "type": "poi",
    "poi": [
      "pidzemni-zernoskhovyshcha"
    ]
  },
  "size": {
    "rooms": [
      12,
      30
    ],
    "length": [
      600,
      2300
    ],
    "area": [
      1400,
      5000
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "зерноїдні чудовиська",
    "млинові големи",
    "вітряні големи"
  ],
  "chance": 0.4,
  "danger": 2,
  "order": 457,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "zhornoverkh"
    ]
  },
  "lore": {
    "description": "Глибокі зерносховища під млиновими комплексами, закриті воротами-механізмами."
  }
});

/* dungeons/plynni-zaly.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "plynni-zaly",
  "name": "Плинні Зали",
  "anchor": {
    "type": "poi",
    "poi": [
      "ruins",
      "monument"
    ]
  },
  "size": {
    "rooms": [
      10,
      32
    ],
    "length": [
      600,
      2400
    ],
    "area": [
      1400,
      6080
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "мінливі тіні",
    "незавершені створіння"
  ],
  "chance": 0.35,
  "danger": 4,
  "order": 709,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "eydoliya"
    ]
  },
  "lore": {
    "description": "Підземелля, що перебудовує кімнати щоразу, коли в нього заходять."
  }
});

/* dungeons/pokhovani-porty.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "pokhovani-porty",
  "name": "Поховані порти",
  "anchor": {
    "type": "poi",
    "poi": [
      "pokhovani-porty"
    ]
  },
  "size": {
    "rooms": [
      15,
      37
    ],
    "length": [
      700,
      2700
    ],
    "area": [
      1700,
      6000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "піщані хижаки",
    "рейдерські каравани",
    "мисливці за кораблями"
  ],
  "chance": 0.4,
  "danger": 3,
  "order": 451,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "vitroparus"
    ]
  },
  "lore": {
    "description": "Напівзасипані доки й корабельні, поховані піском разом із флотом."
  }
});

/* dungeons/popilyani-mista.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "popilyani-mista",
  "name": "Попелясті Міста",
  "anchor": {
    "type": "poi",
    "poi": [
      "ruins",
      "monument"
    ]
  },
  "size": {
    "rooms": [
      12,
      36
    ],
    "length": [
      720,
      2700
    ],
    "area": [
      1680,
      6840
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "попелясті привиди",
    "пилові вартові"
  ],
  "chance": 0.35,
  "danger": 4,
  "order": 756,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "varhess"
    ]
  },
  "lore": {
    "description": "Підземні міста, що відновлюються з попелу після кожної бурі."
  }
});

/* dungeons/porozhni-arkhivy-neverionu.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "porozhni-arkhivy-neverionu",
  "name": "Порожні архіви Неверіону",
  "anchor": {
    "type": "poi",
    "poi": [
      "porozhni-arkhivy-neverionu"
    ]
  },
  "size": {
    "rooms": [
      15,
      37
    ],
    "length": [
      700,
      2700
    ],
    "area": [
      1700,
      6000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "порожнинні мисливці",
    "бездомні титани",
    "шляхотворці"
  ],
  "chance": 0.4,
  "danger": 3,
  "order": 414,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "neverion"
    ]
  },
  "lore": {
    "description": "Архіви на окремих платформах над порожнечею, куди веде лише вигаданий шлях."
  }
});

/* dungeons/porozhnysti-svyatylyshcha.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "porozhnysti-svyatylyshcha",
  "name": "Порожнисті святилища",
  "anchor": {
    "type": "poi",
    "poi": [
      "porozhnysti-svyatylyshcha"
    ]
  },
  "size": {
    "rooms": [
      15,
      37
    ],
    "length": [
      700,
      2700
    ],
    "area": [
      1700,
      6000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "совині хижаки",
    "сутінкові коти",
    "спороносні велети"
  ],
  "chance": 0.4,
  "danger": 3,
  "order": 430,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "lyumenvild"
    ]
  },
  "lore": {
    "description": "Святилища всередині порожнистих стовбурів, освітлені світними грибами."
  }
});

/* dungeons/povitryani-kaniony.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "povitryani-kaniony",
  "name": "Повітряні Каньйонові Печери",
  "anchor": {
    "type": "poi",
    "poi": [
      "mountain",
      "small_mine"
    ]
  },
  "size": {
    "rooms": [
      8,
      26
    ],
    "length": [
      480,
      1950
    ],
    "area": [
      1120,
      4940
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "вітряні орли",
    "скелелази"
  ],
  "chance": 0.35,
  "danger": 2,
  "order": 755,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "valdren"
    ]
  },
  "lore": {
    "description": "Печери в каньйонах, де повітряні течії видно як стрічки пилу."
  }
});

/* dungeons/prison.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "prison",
  "name": "Каземат",
  "anchor": {
    "type": "city",
    "tiers": [
      3,
      4,
      5,
      6
    ]
  },
  "size": {
    "rooms": [
      8,
      24
    ],
    "length": [
      500,
      1800
    ],
    "area": [
      700,
      3000
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "наглядачі",
    "в'язні-бунтівники",
    "привиди страчених"
  ],
  "chance": 0.35,
  "danger": 2,
  "order": 300,
  "spawn": {
    "biomes": "all",
    "worlds": "all"
  },
  "lore": {
    "description": "Тюрма під містом: камери, допитні й похмурі коридори."
  },
  "sim": {
    "tags": {
      "cells": 60,
      "blood": 15,
      "rubble": 10
    },
    "corr": 30,
    "cave": false
  }
});

/* dungeons/pryplyvni-svyatyni.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "pryplyvni-svyatyni",
  "name": "Припливні святині",
  "anchor": {
    "type": "poi",
    "poi": [
      "pryplyvni-svyatyni"
    ]
  },
  "size": {
    "rooms": [
      15,
      37
    ],
    "length": [
      700,
      2700
    ],
    "area": [
      1700,
      6000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "краби-руйнівники",
    "затоплені лицарі",
    "Хранителі Води"
  ],
  "chance": 0.4,
  "danger": 3,
  "order": 428,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "talmoriya"
    ]
  },
  "lore": {
    "description": "Затоплені святині, що відкриваються лише під час відпливу."
  }
});

/* dungeons/rakushkovi-zaly.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "rakushkovi-zaly",
  "name": "Мушляні Зали",
  "anchor": {
    "type": "poi",
    "poi": [
      "ruins",
      "mountain"
    ]
  },
  "size": {
    "rooms": [
      10,
      30
    ],
    "length": [
      600,
      2250
    ],
    "area": [
      1400,
      5700
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "рифові ховрахи",
    "кам'яні краби"
  ],
  "chance": 0.35,
  "danger": 3,
  "order": 711,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "fossar"
    ]
  },
  "lore": {
    "description": "Витончені зали всередині велетенської скам'янілої мушлі колишнього океану."
  }
});

/* dungeons/reberni-sklepinnya.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "reberni-sklepinnya",
  "name": "Реберні Склепіння",
  "anchor": {
    "type": "poi",
    "poi": [
      "mountain",
      "ruins"
    ]
  },
  "size": {
    "rooms": [
      14,
      40
    ],
    "length": [
      840,
      3000
    ],
    "area": [
      1960,
      7600
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "кістяні блукальці",
    "кров'яні шукачі"
  ],
  "chance": 0.35,
  "danger": 4,
  "order": 729,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "morgalis"
    ]
  },
  "lore": {
    "description": "Склепіння всередині ребер колосального скелета бога."
  }
});

/* dungeons/rifovyi-hrot.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "rifovyi-hrot",
  "name": "Рифовий Грот",
  "anchor": {
    "type": "poi",
    "poi": [
      "ruins",
      "small_monument"
    ]
  },
  "size": {
    "rooms": [
      6,
      20
    ],
    "length": [
      500,
      1800
    ],
    "area": [
      800,
      3500
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "рифові істоти"
  ],
  "chance": 0.35,
  "danger": 2,
  "order": 789,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "fossar"
    ]
  },
  "lore": {
    "description": "Грот серед скам'янілих рифів."
  },
  "sim": {
    "tags": {
      "flooded": 65,
      "webs": 20,
      "nests": 25
    },
    "corr": 8,
    "cave": true
  }
});

/* dungeons/root-knot-depths.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "root-knot-depths",
  "name": "Підземелля Кореневого вузла",
  "anchor": {
    "type": "poi",
    "poi": [
      "root-knot-temple"
    ]
  },
  "size": {
    "rooms": [
      30,
      80
    ],
    "length": [
      2000,
      6000
    ],
    "area": [
      6000,
      20000
    ],
    "levels": [
      3,
      6
    ]
  },
  "inhabitants": [
    "Матір Коренів",
    "кореневі велети"
  ],
  "chance": 1,
  "danger": 5,
  "order": 202,
  "spawn": {
    "biomes": [
      "root-coasts",
      "garden-branches"
    ],
    "worlds": [
      "astrakor"
    ]
  },
  "lore": {
    "description": "Храм у місці, де корені сходяться до одного вузла; нижче — лігво Матері Коренів."
  }
});

/* dungeons/royal-vault.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "royal-vault",
  "name": "Підземна скарбниця",
  "anchor": {
    "type": "city",
    "tiers": [
      6
    ]
  },
  "size": {
    "rooms": [
      15,
      40
    ],
    "length": [
      800,
      3000
    ],
    "area": [
      1800,
      6000
    ],
    "levels": [
      2,
      3
    ]
  },
  "inhabitants": [
    "вартові",
    "пастки",
    "привиди скарбників"
  ],
  "chance": 0.6,
  "danger": 3,
  "order": 13,
  "spawn": {
    "biomes": "all",
    "worlds": "all"
  },
  "lore": {
    "description": "Скарбниця й тюрма під палацом столиці."
  }
});

/* dungeons/rozrosli-pidvaly.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "rozrosli-pidvaly",
  "name": "Розрослі Підвали",
  "anchor": {
    "type": "settlement",
    "states": [
      "ruined",
      "fallen"
    ]
  },
  "size": {
    "rooms": [
      3,
      9
    ],
    "length": [
      80,
      300
    ],
    "area": [
      150,
      600
    ],
    "levels": [
      1,
      1
    ]
  },
  "inhabitants": [
    "терновики"
  ],
  "chance": 0.55,
  "danger": 3,
  "order": 775,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "ternaviya"
    ]
  },
  "lore": {
    "description": "Підвали, захоплені рослинністю."
  }
});

/* dungeons/rudna-shakhta-rudozoru.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "rudna-shakhta-rudozoru",
  "name": "Рудна Шахта Кольорів",
  "anchor": {
    "type": "poi",
    "poi": [
      "small_mine"
    ]
  },
  "size": {
    "rooms": [
      8,
      30
    ],
    "length": [
      500,
      3000
    ],
    "area": [
      1000,
      6000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "рудні ґноми"
  ],
  "chance": 0.85,
  "danger": 2,
  "order": 771,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "rudozir"
    ]
  },
  "lore": {
    "description": "Шахта, де кожен рівень відповідає кольору руди."
  }
});

/* dungeons/ruin-cellars.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "ruin-cellars",
  "name": "Підвали зруйнованого поселення",
  "anchor": {
    "type": "settlement",
    "states": [
      "ruined",
      "fallen"
    ]
  },
  "size": {
    "rooms": [
      3,
      9
    ],
    "length": [
      80,
      300
    ],
    "area": [
      150,
      600
    ],
    "levels": [
      1,
      1
    ]
  },
  "inhabitants": [
    "щури",
    "безхатченки",
    "привиди колишніх мешканців"
  ],
  "chance": 0.55,
  "danger": 1,
  "order": 20,
  "spawn": {
    "biomes": "all",
    "worlds": "all"
  },
  "lore": {
    "description": "Підвали й льохи, що вціліли під руїнами."
  }
});

/* dungeons/runni-pidzemellya.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "runni-pidzemellya",
  "name": "Рунні Підземелля",
  "anchor": {
    "type": "poi",
    "poi": [
      "temple",
      "monument"
    ]
  },
  "size": {
    "rooms": [
      10,
      30
    ],
    "length": [
      600,
      2250
    ],
    "area": [
      1400,
      5700
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "рунні вартові",
    "кам'яні ритуалісти"
  ],
  "chance": 0.35,
  "danger": 3,
  "order": 742,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "runozem"
    ]
  },
  "lore": {
    "description": "Підземелля з руническими плитами, які змінюють правила кімнат."
  }
});

/* dungeons/sand-tomb.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "sand-tomb",
  "name": "Піщана гробниця",
  "anchor": {
    "type": "poi",
    "poi": [
      "monument",
      "ruins"
    ]
  },
  "size": {
    "rooms": [
      12,
      36
    ],
    "length": [
      900,
      3000
    ],
    "area": [
      1500,
      6500
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "мумії",
    "скарабеї-стражі",
    "жерці-вартові"
  ],
  "chance": 0.3,
  "danger": 3,
  "order": 305,
  "spawn": {
    "biomes": "all",
    "worlds": "all"
  },
  "lore": {
    "description": "Гробниця правителя, засипана піском, із пастками й похованнями слуг."
  },
  "sim": {
    "tags": {
      "tombs": 55,
      "cache": 35,
      "webs": 15
    },
    "corr": 10,
    "cave": false
  }
});

/* dungeons/scorpion-burrows.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "scorpion-burrows",
  "name": "Нори червоних скорпіонів",
  "anchor": {
    "type": "poi",
    "poi": [
      "scorpion-nest"
    ]
  },
  "size": {
    "rooms": [
      6,
      20
    ],
    "length": [
      300,
      1500
    ],
    "area": [
      800,
      3500
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "червоні скорпіони",
    "Королева Червоних Скорпіонів"
  ],
  "chance": 0.7,
  "danger": 3,
  "order": 221,
  "spawn": {
    "biomes": [
      "dried-vessel-gardens",
      "black-rifts"
    ],
    "worlds": [
      "krovostep"
    ]
  },
  "lore": {
    "description": "Нори й камери з виводком під сухими судинами."
  }
});

/* dungeons/sewer.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "sewer",
  "name": "Каналізація",
  "anchor": {
    "type": "city",
    "tiers": [
      3,
      4,
      5,
      6
    ]
  },
  "size": {
    "rooms": [
      10,
      30
    ],
    "length": [
      600,
      2500
    ],
    "area": [
      800,
      4000
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "щури-мутанти",
    "контрабандисти",
    "болотяні примари"
  ],
  "chance": 0.5,
  "danger": 1,
  "order": 10,
  "spawn": {
    "biomes": "all",
    "worlds": "all"
  },
  "lore": {
    "description": "Тунелі під вулицями з кільцевою каналізацією; у місті цьому відповідає шар «Підземелля» в детальному вигляді."
  }
});

/* dungeons/shakhty-rudozoru.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "shakhty-rudozoru",
  "name": "Шахти Рудозору",
  "anchor": {
    "type": "poi",
    "poi": [
      "shakhty-rudozoru"
    ]
  },
  "size": {
    "rooms": [
      15,
      37
    ],
    "length": [
      700,
      2700
    ],
    "area": [
      1700,
      6000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "рудні жуки",
    "големи-шахтарі",
    "мінеральні жуки"
  ],
  "chance": 0.4,
  "danger": 3,
  "order": 458,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "rudozir"
    ]
  },
  "lore": {
    "description": "Покинуті шахти, заповнені дикими істотами після зникнення гірничих кланів."
  }
});

/* dungeons/shary-starykh-form.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "shary-starykh-form",
  "name": "Шари старих форм",
  "anchor": {
    "type": "poi",
    "poi": [
      "shary-starykh-form"
    ]
  },
  "size": {
    "rooms": [
      18,
      44
    ],
    "length": [
      800,
      3100
    ],
    "area": [
      2000,
      7000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "мінливі хижаки",
    "нестабільні големи",
    "дикі мутанти"
  ],
  "chance": 0.4,
  "danger": 4,
  "order": 422,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "eydoliya"
    ]
  },
  "lore": {
    "description": "Кам'яні пласти зі старими формами, що стають на шляху нових."
  }
});

/* dungeons/shlyuzovi-hlyboky.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "shlyuzovi-hlyboky",
  "name": "Шлюзові Глибини",
  "anchor": {
    "type": "poi",
    "poi": [
      "ruins",
      "lake"
    ]
  },
  "size": {
    "rooms": [
      12,
      34
    ],
    "length": [
      720,
      2550
    ],
    "area": [
      1680,
      6460
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "водяні вартові",
    "мулисті ґолеми",
    "мародери"
  ],
  "chance": 0.35,
  "danger": 3,
  "order": 700,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "akvedor"
    ]
  },
  "lore": {
    "description": "Старі шлюзи під руслом каналу, де досі працюють засувки й тече чорна вода."
  }
});

/* dungeons/skarbnytsi-vertykalnykh-pecher.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "skarbnytsi-vertykalnykh-pecher",
  "name": "Скарбниці вертикальних печер",
  "anchor": {
    "type": "poi",
    "poi": [
      "skarbnytsi-vertykalnykh-pecher"
    ]
  },
  "size": {
    "rooms": [
      15,
      37
    ],
    "length": [
      700,
      2700
    ],
    "area": [
      1700,
      6000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "кам'яні гончі",
    "крилаті мисливці",
    "мостові грабіжники"
  ],
  "chance": 0.4,
  "danger": 3,
  "order": 444,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "hlybokray"
    ]
  },
  "lore": {
    "description": "Печери й шахти у стінах каньйонів, відкриті старими підйомниками."
  }
});

/* dungeons/skhovyshche-uzlamkiv.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "skhovyshche-uzlamkiv",
  "name": "Сховище Уламків",
  "anchor": {
    "type": "poi",
    "poi": [
      "ruins"
    ]
  },
  "size": {
    "rooms": [
      15,
      45
    ],
    "length": [
      900,
      3500
    ],
    "area": [
      2000,
      8000
    ],
    "levels": [
      2,
      4
    ]
  },
  "inhabitants": [
    "чужі вартові"
  ],
  "chance": 0.7,
  "danger": 4,
  "order": 773,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "ostanky"
    ]
  },
  "lore": {
    "description": "Сховище, складене з частин інших цивілізацій."
  }
});

/* dungeons/skull-fortress-depths.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "skull-fortress-depths",
  "name": "Фортеця в черепі велетня",
  "anchor": {
    "type": "poi",
    "poi": [
      "giant-skull"
    ]
  },
  "size": {
    "rooms": [
      20,
      60
    ],
    "length": [
      1000,
      4000
    ],
    "area": [
      3000,
      12000
    ],
    "levels": [
      2,
      4
    ]
  },
  "inhabitants": [
    "Безсердечний Король",
    "кров'яні лицарі"
  ],
  "chance": 1,
  "danger": 5,
  "order": 222,
  "spawn": {
    "biomes": [
      "wasteland",
      "crimson-barrows"
    ],
    "worlds": [
      "krovostep"
    ]
  },
  "lore": {
    "description": "Фортеця в черепі велетенського скелета: ребра слугують мостами, а під черепом ідуть підвали."
  }
});

/* dungeons/smolyani-hrobnytsi.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "smolyani-hrobnytsi",
  "name": "Смолисті Гробниці",
  "anchor": {
    "type": "poi",
    "poi": [
      "ruins",
      "glade"
    ]
  },
  "size": {
    "rooms": [
      10,
      30
    ],
    "length": [
      600,
      2250
    ],
    "area": [
      1400,
      5700
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "застиглі комахи",
    "смолисті ґолеми"
  ],
  "chance": 0.35,
  "danger": 3,
  "order": 747,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "smolyar"
    ]
  },
  "lore": {
    "description": "Гробниці у товщі смоли з рослинами й комахами всередині, іноді ще живими."
  }
});

/* dungeons/smolyani-pechery.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "smolyani-pechery",
  "name": "Смоляні печери",
  "anchor": {
    "type": "poi",
    "poi": [
      "smolyani-pechery"
    ]
  },
  "size": {
    "rooms": [
      15,
      37
    ],
    "length": [
      700,
      2700
    ],
    "area": [
      1700,
      6000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "смоляні павуки",
    "деревні вартові",
    "комахи-хижаки"
  ],
  "chance": 0.4,
  "danger": 3,
  "order": 438,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "smolyar"
    ]
  },
  "lore": {
    "description": "Природні печери під смоляними озерами з законсервованими мешканцями."
  }
});

/* dungeons/smugglers-cove.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "smugglers-cove",
  "name": "Печера контрабандистів",
  "anchor": {
    "type": "poi",
    "poi": [
      "bandit_camp",
      "small_monument"
    ]
  },
  "size": {
    "rooms": [
      6,
      18
    ],
    "length": [
      400,
      1500
    ],
    "area": [
      700,
      3000
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "контрабандисти",
    "вартові-найманці",
    "дресировані звірі"
  ],
  "chance": 0.4,
  "danger": 2,
  "order": 309,
  "spawn": {
    "biomes": "all",
    "worlds": "all"
  },
  "lore": {
    "description": "Прихований порт і склади в підземеллі, куди заходять човни без вогнів."
  },
  "sim": {
    "tags": {
      "cache": 55,
      "flooded": 30,
      "cells": 10
    },
    "corr": 25,
    "cave": false
  }
});

/* dungeons/star-cavern.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "star-cavern",
  "name": "Зоряна порожнина",
  "anchor": {
    "type": "poi",
    "poi": [
      "hollow-cavity"
    ]
  },
  "size": {
    "rooms": [
      10,
      40
    ],
    "length": [
      700,
      3000
    ],
    "area": [
      2000,
      8000
    ],
    "levels": [
      2,
      4
    ]
  },
  "inhabitants": [
    "панцирні коренегризи",
    "світні кристалічні істоти"
  ],
  "chance": 0.8,
  "danger": 3,
  "order": 200,
  "spawn": {
    "biomes": [
      "star-caverns"
    ],
    "worlds": [
      "astrakor"
    ]
  },
  "lore": {
    "description": "Велика печера всередині материка зі світними кристалами; ходи коренегризів зв'язують порожнини між собою."
  }
});

/* dungeons/starodavni-shakhty-velariumu.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "starodavni-shakhty-velariumu",
  "name": "Стародавні шахти Веларіуму",
  "anchor": {
    "type": "poi",
    "poi": [
      "starodavni-shakhty-velariumu"
    ]
  },
  "size": {
    "rooms": [
      15,
      37
    ],
    "length": [
      700,
      2700
    ],
    "area": [
      1700,
      6000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "крилаті шахтарі-варуни",
    "кореневі хижаки",
    "гравітаційні скати"
  ],
  "chance": 0.4,
  "danger": 3,
  "order": 400,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "velarium"
    ]
  },
  "lore": {
    "description": "Шахти під перевернутими материками, де відкриваються портали й гравітаційні колодязі."
  }
});

/* dungeons/sunken-library.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "sunken-library",
  "name": "Затоплена бібліотека",
  "anchor": {
    "type": "poi",
    "poi": [
      "ruins",
      "mage_tower"
    ]
  },
  "size": {
    "rooms": [
      10,
      28
    ],
    "length": [
      700,
      2400
    ],
    "area": [
      1200,
      5000
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "книжкові привиди",
    "хранителі сувоїв",
    "болотні слизи"
  ],
  "chance": 0.3,
  "danger": 3,
  "order": 304,
  "spawn": {
    "biomes": "all",
    "worlds": "all"
  },
  "lore": {
    "description": "Колись велика бібліотека, нині напівзатоплена, з розмоклими фоліантами."
  },
  "sim": {
    "tags": {
      "library": 65,
      "flooded": 40,
      "webs": 20
    },
    "corr": 8,
    "cave": false
  }
});

/* dungeons/sutinkovi-pechery.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "sutinkovi-pechery",
  "name": "Сутінкові Печери",
  "anchor": {
    "type": "poi",
    "poi": [
      "mountain",
      "ruins"
    ]
  },
  "size": {
    "rooms": [
      8,
      26
    ],
    "length": [
      480,
      1950
    ],
    "area": [
      1120,
      4940
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "тіньові звірі",
    "спекотні тварини"
  ],
  "chance": 0.35,
  "danger": 3,
  "order": 760,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "vespern"
    ]
  },
  "lore": {
    "description": "Печери на межі вічного заходу, де температура різко змінюється."
  }
});

/* dungeons/svitlovi-kamery-aurelitu.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "svitlovi-kamery-aurelitu",
  "name": "Світлові Камери",
  "anchor": {
    "type": "poi",
    "poi": [
      "monument",
      "temple"
    ]
  },
  "size": {
    "rooms": [
      9,
      28
    ],
    "length": [
      540,
      2100
    ],
    "area": [
      1260,
      5320
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "світлові духи",
    "криштальні хранителі"
  ],
  "chance": 0.35,
  "danger": 3,
  "order": 703,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "aurelit"
    ]
  },
  "lore": {
    "description": "Зали, де застигле світло утворює стіни, колони й пастки з променів."
  }
});

/* dungeons/svitlovi-pechery-pid-pusteleyu.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "svitlovi-pechery-pid-pusteleyu",
  "name": "Світлові печери під пустелею",
  "anchor": {
    "type": "poi",
    "poi": [
      "svitlovi-pechery-pid-pusteleyu"
    ]
  },
  "size": {
    "rooms": [
      18,
      44
    ],
    "length": [
      800,
      3100
    ],
    "area": [
      2000,
      7000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "світлові скорпіони",
    "піщані левіафани",
    "жерці сонця"
  ],
  "chance": 0.4,
  "danger": 4,
  "order": 415,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "heliontar"
    ]
  },
  "lore": {
    "description": "Глибокі шахти до підземних сонячних морів і світлових печер."
  }
});

/* dungeons/svyatylyshcha-pid-zolotym-tumanom.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "svyatylyshcha-pid-zolotym-tumanom",
  "name": "Святилища під золотим туманом",
  "anchor": {
    "type": "poi",
    "poi": [
      "svyatylyshcha-pid-zolotym-tumanom"
    ]
  },
  "size": {
    "rooms": [
      15,
      37
    ],
    "length": [
      700,
      2700
    ],
    "area": [
      1700,
      6000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "туманні хижаки",
    "руїнні големи",
    "руїнні вартові"
  ],
  "chance": 0.4,
  "danger": 3,
  "order": 449,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "aurokhm"
    ]
  },
  "lore": {
    "description": "Затоплені святилища й скарбниці, приховані золотим туманом."
  }
});

/* dungeons/svyatylyshcha-vseredyni-heod.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "svyatylyshcha-vseredyni-heod",
  "name": "Святилища всередині геод",
  "anchor": {
    "type": "poi",
    "poi": [
      "svyatylyshcha-vseredyni-heod"
    ]
  },
  "size": {
    "rooms": [
      12,
      30
    ],
    "length": [
      600,
      2300
    ],
    "area": [
      1400,
      5000
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "кристалічні жуки",
    "кам'яні сторожі",
    "збирачі самоцвітів"
  ],
  "chance": 0.4,
  "danger": 2,
  "order": 456,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "skeltsvit"
    ]
  },
  "lore": {
    "description": "Святилища й гнізда істот у великих мінеральних утвореннях."
  }
});

/* dungeons/symetrychni-kryvtu.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "symetrychni-kryvtu",
  "name": "Симетричні Крипти",
  "anchor": {
    "type": "poi",
    "poi": [
      "temple",
      "ruins"
    ]
  },
  "size": {
    "rooms": [
      10,
      30
    ],
    "length": [
      600,
      2250
    ],
    "area": [
      1400,
      5700
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "кореневі хранителі",
    "квіткові наглядачі"
  ],
  "chance": 0.35,
  "danger": 3,
  "order": 717,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "illariya"
    ]
  },
  "lore": {
    "description": "Дзеркально симетричні зали, де ліва й права половини завжди збігаються."
  }
});

/* dungeons/synii-hrot.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "synii-hrot",
  "name": "Синій Грот",
  "anchor": {
    "type": "poi",
    "poi": [
      "ruins",
      "small_monument"
    ]
  },
  "size": {
    "rooms": [
      6,
      20
    ],
    "length": [
      500,
      1800
    ],
    "area": [
      800,
      3500
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "синьовогневі істоти"
  ],
  "chance": 0.35,
  "danger": 3,
  "order": 790,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "nokserra"
    ]
  },
  "lore": {
    "description": "Грот із постійним синім полум'ям."
  },
  "sim": {
    "tags": {
      "flooded": 65,
      "webs": 20,
      "nests": 25
    },
    "corr": 8,
    "cave": true
  }
});

/* dungeons/temni-sharovi-pechery.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "temni-sharovi-pechery",
  "name": "Темні шарові печери",
  "anchor": {
    "type": "poi",
    "poi": [
      "temni-sharovi-pechery"
    ]
  },
  "size": {
    "rooms": [
      12,
      30
    ],
    "length": [
      600,
      2300
    ],
    "area": [
      1400,
      5000
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "пластинчасті жуки",
    "порідні големи",
    "гірські птахи"
  ],
  "chance": 0.4,
  "danger": 2,
  "order": 445,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "paperon"
    ]
  },
  "lore": {
    "description": "Кишені й печери між шарами породи, відкриті руйнуванням тонких пластів."
  }
});

/* dungeons/temple-undercroft.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "temple-undercroft",
  "name": "Підземний монастир",
  "anchor": {
    "type": "poi",
    "poi": [
      "temple"
    ]
  },
  "size": {
    "rooms": [
      8,
      25
    ],
    "length": [
      400,
      1600
    ],
    "area": [
      1200,
      4000
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "ченці-привиди",
    "культисти",
    "реліквійні вартові"
  ],
  "chance": 0.6,
  "danger": 2,
  "order": 32,
  "spawn": {
    "biomes": "all",
    "worlds": "all"
  },
  "lore": {
    "description": "Крипта, келії й сховище реліквій під храмом."
  }
});

/* dungeons/ternovi-krypty.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "ternovi-krypty",
  "name": "Тернові Крипти",
  "anchor": {
    "type": "poi",
    "poi": [
      "ruins",
      "temple"
    ]
  },
  "size": {
    "rooms": [
      8,
      28
    ],
    "length": [
      480,
      2100
    ],
    "area": [
      1120,
      5320
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "терновики",
    "лозові душителі"
  ],
  "chance": 0.35,
  "danger": 3,
  "order": 752,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "ternaviya"
    ]
  },
  "lore": {
    "description": "Крипти, де коріння й терен розламали мури й проросли в склепи."
  }
});

/* dungeons/thieves-lair.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "thieves-lair",
  "name": "Лігво гільдії злодіїв",
  "anchor": {
    "type": "city",
    "tiers": [
      4,
      5,
      6
    ]
  },
  "size": {
    "rooms": [
      12,
      25
    ],
    "length": [
      500,
      1800
    ],
    "area": [
      900,
      3000
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "злодії",
    "душогуби",
    "контрабандисти"
  ],
  "chance": 0.35,
  "danger": 2,
  "order": 12,
  "spawn": {
    "biomes": "all",
    "worlds": "all"
  },
  "lore": {
    "description": "Потайні кімнати під ринком чи портом."
  }
});

/* dungeons/torn-castle-vaults.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "torn-castle-vaults",
  "name": "Підвали розірваного замку",
  "anchor": {
    "type": "settlement",
    "states": [
      "ruined",
      "fallen"
    ]
  },
  "size": {
    "rooms": [
      10,
      35
    ],
    "length": [
      600,
      2500
    ],
    "area": [
      1500,
      6000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "безликі лицарі",
    "хижаки руїн"
  ],
  "chance": 0.7,
  "danger": 3,
  "order": 211,
  "spawn": {
    "biomes": [
      "citadel-graveyard"
    ],
    "worlds": [
      "ostanky"
    ]
  },
  "lore": {
    "description": "Три частини замку мають три різні підвали, що колись були одним."
  }
});

/* dungeons/trunk-fortress.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "trunk-fortress",
  "name": "Фортеця всередині стовбура",
  "anchor": {
    "type": "poi",
    "poi": [
      "trunk-fortress"
    ]
  },
  "size": {
    "rooms": [
      15,
      40
    ],
    "length": [
      500,
      2000
    ],
    "area": [
      1500,
      6000
    ],
    "levels": [
      3,
      5
    ]
  },
  "inhabitants": [
    "кореневі велети",
    "вартові племен"
  ],
  "chance": 0.7,
  "danger": 3,
  "order": 201,
  "spawn": {
    "biomes": [
      "garden-branches"
    ],
    "worlds": [
      "astrakor"
    ]
  },
  "lore": {
    "description": "Фортеця, вирізана всередині стовбура; сходи ведуть угору й униз до коренів."
  }
});

/* dungeons/trunk-temple.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "trunk-temple",
  "name": "Храм у стовбурі",
  "anchor": {
    "type": "poi",
    "poi": [
      "trunk-temple"
    ]
  },
  "size": {
    "rooms": [
      10,
      30
    ],
    "length": [
      400,
      1800
    ],
    "area": [
      1200,
      5000
    ],
    "levels": [
      2,
      4
    ]
  },
  "inhabitants": [
    "деревні павуки",
    "дереволази-жерці"
  ],
  "chance": 0.8,
  "danger": 3,
  "order": 230,
  "spawn": {
    "biomes": [
      "moss-trunks"
    ],
    "worlds": [
      "vershynnytsia"
    ]
  },
  "lore": {
    "description": "Храм усередині стовбура, сходи ведуть до коренів і нагору до дупел."
  }
});

/* dungeons/tumanni-pidvaly-ruin.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "tumanni-pidvaly-ruin",
  "name": "Підвали Забутого Міста",
  "anchor": {
    "type": "settlement",
    "states": [
      "ruined",
      "fallen"
    ]
  },
  "size": {
    "rooms": [
      3,
      9
    ],
    "length": [
      80,
      300
    ],
    "area": [
      150,
      600
    ],
    "levels": [
      1,
      1
    ]
  },
  "inhabitants": [
    "тіні в тумані"
  ],
  "chance": 0.55,
  "danger": 3,
  "order": 774,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "aurokhm"
    ]
  },
  "lore": {
    "description": "Підвали старих будинків у золотому тумані."
  }
});

/* dungeons/tumanni-pidvaly.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "tumanni-pidvaly",
  "name": "Туманні Підвали Аурохму",
  "anchor": {
    "type": "poi",
    "poi": [
      "ruins"
    ]
  },
  "size": {
    "rooms": [
      12,
      36
    ],
    "length": [
      720,
      2700
    ],
    "area": [
      1680,
      6840
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "тіні в тумані",
    "золотопилові мисливці"
  ],
  "chance": 0.35,
  "danger": 3,
  "order": 704,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "aurokhm"
    ]
  },
  "lore": {
    "description": "Затоплені золотим туманом льохи давнього міста, де губляться стежки."
  }
});

/* dungeons/tuneli-povilnykh-khvyl.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "tuneli-povilnykh-khvyl",
  "name": "Тунелі повільних хвиль",
  "anchor": {
    "type": "poi",
    "poi": [
      "tuneli-povilnykh-khvyl"
    ]
  },
  "size": {
    "rooms": [
      15,
      37
    ],
    "length": [
      700,
      2700
    ],
    "area": [
      1700,
      6000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "пластинчасті звірі",
    "кам'яні мореплавці",
    "рухомі скельні звірі"
  ],
  "chance": 0.4,
  "danger": 3,
  "order": 407,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "drumbor"
    ]
  },
  "lore": {
    "description": "Глибокі ходи під поверхнею з текучої породи, що змінюють форму за місячними циклами."
  }
});

/* dungeons/tunelni-mista-hrondaru.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "tunelni-mista-hrondaru",
  "name": "Тунельні Міста Предків",
  "anchor": {
    "type": "poi",
    "poi": [
      "ruins",
      "monument"
    ]
  },
  "size": {
    "rooms": [
      20,
      60
    ],
    "length": [
      1200,
      4500
    ],
    "area": [
      2800,
      11400
    ],
    "levels": [
      2,
      5
    ]
  },
  "inhabitants": [
    "тунельні сторожі",
    "забуті мешканці"
  ],
  "chance": 0.35,
  "danger": 3,
  "order": 713,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "grondar"
    ]
  },
  "lore": {
    "description": "Покинуті підземні кварталі давньої цивілізації з галереями й сходами."
  }
});

/* dungeons/vidlyvni-pidzemellya.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "vidlyvni-pidzemellya",
  "name": "Відливні Підземелля",
  "anchor": {
    "type": "poi",
    "poi": [
      "lake",
      "ruins"
    ]
  },
  "size": {
    "rooms": [
      8,
      26
    ],
    "length": [
      480,
      1950
    ],
    "area": [
      1120,
      4940
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "відливні крабі",
    "затоплені мерці"
  ],
  "chance": 0.35,
  "danger": 3,
  "order": 750,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "talmoriya"
    ]
  },
  "lore": {
    "description": "Підземелля, що відкриваються лише під час відпливу й зникають під водою."
  }
});

/* dungeons/village-cellar.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "village-cellar",
  "name": "Старий льох",
  "anchor": {
    "type": "settlement",
    "states": [
      "normal"
    ]
  },
  "size": {
    "rooms": [
      2,
      5
    ],
    "length": [
      40,
      140
    ],
    "area": [
      80,
      300
    ],
    "levels": [
      1,
      1
    ]
  },
  "inhabitants": [
    "щури",
    "контрабандисти"
  ],
  "chance": 0.06,
  "danger": 1,
  "order": 23,
  "spawn": {
    "biomes": "all",
    "worlds": "all"
  },
  "lore": {
    "description": "Старий льох під поселенням, про який мало хто знає."
  }
});

/* dungeons/voshchani-soty.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "voshchani-soty",
  "name": "Воскові Соти",
  "anchor": {
    "type": "poi",
    "poi": [
      "glade",
      "ruins"
    ]
  },
  "size": {
    "rooms": [
      16,
      48
    ],
    "length": [
      960,
      3600
    ],
    "area": [
      2240,
      9120
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "воскові ковалі",
    "бджолині варти"
  ],
  "chance": 0.35,
  "danger": 3,
  "order": 726,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "medokray"
    ]
  },
  "lore": {
    "description": "Шестикутні кімнати в порожнині старої бджолиної колонії."
  }
});

/* dungeons/vuhilna-shakhta.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "vuhilna-shakhta",
  "name": "Закинута Вугільна Шахта",
  "anchor": {
    "type": "poi",
    "poi": [
      "small_mine"
    ]
  },
  "size": {
    "rooms": [
      8,
      30
    ],
    "length": [
      500,
      3000
    ],
    "area": [
      1000,
      6000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "задимлені ґноми",
    "вугільні жуки"
  ],
  "chance": 0.85,
  "danger": 3,
  "order": 770,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "vuhlerod"
    ]
  },
  "lore": {
    "description": "Шахта під хвойним лісом з обвалами."
  }
});

/* dungeons/vuhilni-shakhty-vuhlerodu.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "vuhilni-shakhty-vuhlerodu",
  "name": "Вугільні шахти Вуглероду",
  "anchor": {
    "type": "poi",
    "poi": [
      "vuhilni-shakhty-vuhlerodu"
    ]
  },
  "size": {
    "rooms": [
      15,
      37
    ],
    "length": [
      700,
      2700
    ],
    "area": [
      1700,
      6000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "вугільні големи",
    "попелясті вовки",
    "шахтарі"
  ],
  "chance": 0.4,
  "danger": 3,
  "order": 447,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "vuhlerod"
    ]
  },
  "lore": {
    "description": "Шахти у вугільних жилах під чорними соснами й попелястими галявинами."
  }
});

/* dungeons/vuhilni-shakhty.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "vuhilni-shakhty",
  "name": "Вугільні Шахти",
  "anchor": {
    "type": "poi",
    "poi": [
      "small_mine",
      "ruins"
    ]
  },
  "size": {
    "rooms": [
      14,
      40
    ],
    "length": [
      840,
      3000
    ],
    "area": [
      1960,
      7600
    ],
    "levels": [
      1,
      4
    ]
  },
  "inhabitants": [
    "вугільні ґноми",
    "задимлені вовки"
  ],
  "chance": 0.35,
  "danger": 3,
  "order": 762,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "vuhlerod"
    ]
  },
  "lore": {
    "description": "Покинуті вугільні шахти під темними хвойними лісами."
  }
});

/* dungeons/vulkanichna-shakhta.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "vulkanichna-shakhta",
  "name": "Вулканічна Шахта",
  "anchor": {
    "type": "poi",
    "poi": [
      "small_mine"
    ]
  },
  "size": {
    "rooms": [
      8,
      30
    ],
    "length": [
      500,
      3000
    ],
    "area": [
      1000,
      6000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "вогняні ґноми"
  ],
  "chance": 0.85,
  "danger": 4,
  "order": 772,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "embergard"
    ]
  },
  "lore": {
    "description": "Шахта поряд з ділянкою живої лави."
  }
});

/* dungeons/zaly-pershotvortsiv.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "zaly-pershotvortsiv",
  "name": "Зали Першотворців",
  "anchor": {
    "type": "poi",
    "poi": [
      "zaly-pershotvortsiv"
    ]
  },
  "size": {
    "rooms": [
      21,
      51
    ],
    "length": [
      900,
      3500
    ],
    "area": [
      2300,
      8000
    ],
    "levels": [
      1,
      4
    ]
  },
  "inhabitants": [
    "автономні сторожі",
    "механічні хижаки",
    "ордени заводчиків"
  ],
  "chance": 0.4,
  "danger": 5,
  "order": 404,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "kaldras"
    ]
  },
  "lore": {
    "description": "Глибини під центральним маятником, де механізм світу досі вдосконалює сам себе."
  }
});

/* dungeons/zalyshi-zhyvykh-statuy.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "zalyshi-zhyvykh-statuy",
  "name": "Зали Живих Статуй",
  "anchor": {
    "type": "poi",
    "poi": [
      "temple",
      "monument"
    ]
  },
  "size": {
    "rooms": [
      12,
      34
    ],
    "length": [
      720,
      2550
    ],
    "area": [
      1680,
      6460
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "оживші статуї",
    "кам'яні блукальці"
  ],
  "chance": 0.35,
  "danger": 4,
  "order": 720,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "kamyanorod"
    ]
  },
  "lore": {
    "description": "Зали, де статуї рухаються, коли ніхто не дивиться."
  }
});

/* dungeons/zamerzli-mista.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "zamerzli-mista",
  "name": "Замерзлі міста",
  "anchor": {
    "type": "poi",
    "poi": [
      "zamerzli-mista"
    ]
  },
  "size": {
    "rooms": [
      18,
      44
    ],
    "length": [
      800,
      3100
    ],
    "area": [
      2000,
      7000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "крижані тролі",
    "льодові павуки",
    "підлідні жуки"
  ],
  "chance": 0.4,
  "danger": 4,
  "order": 443,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "frostheym"
    ]
  },
  "lore": {
    "description": "Давні міста під льодовими пластами, куди ведуть крижані печери."
  }
});

/* dungeons/zanedbani-kuzni-rzhavaru.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "zanedbani-kuzni-rzhavaru",
  "name": "Занедбані кузні Ржавару",
  "anchor": {
    "type": "poi",
    "poi": [
      "zanedbani-kuzni-rzhavaru"
    ]
  },
  "size": {
    "rooms": [
      15,
      37
    ],
    "length": [
      700,
      2700
    ],
    "area": [
      1700,
      6000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "залізні хижаки",
    "рудні вартові",
    "металеві жуки"
  ],
  "chance": 0.4,
  "danger": 3,
  "order": 442,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "rzhavar"
    ]
  },
  "lore": {
    "description": "Покинуті кузні в гірських стінах, поглинуті металевими коренями."
  }
});

/* dungeons/zastyhli-khvylyny.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "zastyhli-khvylyny",
  "name": "Застиглі Хвилини",
  "anchor": {
    "type": "poi",
    "poi": [
      "ruins",
      "monument"
    ]
  },
  "size": {
    "rooms": [
      8,
      24
    ],
    "length": [
      480,
      1800
    ],
    "area": [
      1120,
      4560
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "застиглі люди",
    "часові тіні"
  ],
  "chance": 0.35,
  "danger": 4,
  "order": 733,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "noktalis"
    ]
  },
  "lore": {
    "description": "Кімнати, де час застиг: можна пройти повз людей, що завмерли на півкроці."
  }
});

/* dungeons/zatoka-vidplyvu.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "zatoka-vidplyvu",
  "name": "Затока Контрабандистів",
  "anchor": {
    "type": "poi",
    "poi": [
      "bandit_camp",
      "small_monument"
    ]
  },
  "size": {
    "rooms": [
      6,
      18
    ],
    "length": [
      400,
      1500
    ],
    "area": [
      700,
      3000
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "контрабандисти",
    "крабі"
  ],
  "chance": 0.4,
  "danger": 2,
  "order": 783,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "talmoriya"
    ]
  },
  "lore": {
    "description": "Печера, доступна лише під час відпливу."
  },
  "sim": {
    "tags": {
      "cache": 55,
      "flooded": 30,
      "cells": 10
    },
    "corr": 25,
    "cave": false
  }
});

/* dungeons/zatoplena-katedra-talassyru.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "zatoplena-katedra-talassyru",
  "name": "Затоплена катедра Талассиру",
  "anchor": {
    "type": "poi",
    "poi": [
      "zatoplena-katedra-talassyru"
    ]
  },
  "size": {
    "rooms": [
      21,
      51
    ],
    "length": [
      900,
      3500
    ],
    "area": [
      2300,
      8000
    ],
    "levels": [
      1,
      4
    ]
  },
  "inhabitants": [
    "печерні левіафани",
    "хижаки проток",
    "глибинні клани"
  ],
  "chance": 0.4,
  "danger": 5,
  "order": 423,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "talassyr"
    ]
  },
  "lore": {
    "description": "Підводна катедра в системі печер, де повітряні озера можуть перевернутися."
  }
});

/* dungeons/zatopleni-kvartaly-doshchohradu.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "zatopleni-kvartaly-doshchohradu",
  "name": "Затоплені квартали Дощограду",
  "anchor": {
    "type": "poi",
    "poi": [
      "zatopleni-kvartaly-doshchohradu"
    ]
  },
  "size": {
    "rooms": [
      15,
      37
    ],
    "length": [
      700,
      2700
    ],
    "area": [
      1700,
      6000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "каналові хижаки",
    "дахові грабіжники",
    "човнярі"
  ],
  "chance": 0.4,
  "danger": 3,
  "order": 459,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "doshchohrad"
    ]
  },
  "lore": {
    "description": "Затоплені нижні квартали зі сховищами під старими будинками."
  }
});

/* dungeons/zatopleni-pryplyvni-khramy.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "zatopleni-pryplyvni-khramy",
  "name": "Затоплені припливні храми",
  "anchor": {
    "type": "poi",
    "poi": [
      "zatopleni-pryplyvni-khramy"
    ]
  },
  "size": {
    "rooms": [
      18,
      44
    ],
    "length": [
      800,
      3100
    ],
    "area": [
      2000,
      7000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "глибоководні королі",
    "небесні скати",
    "соляні істоти"
  ],
  "chance": 0.4,
  "danger": 4,
  "order": 403,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "solemor"
    ]
  },
  "lore": {
    "description": "Старі храми, затоплені догори дном, у шарах води над материками."
  }
});

/* dungeons/zolota-hrobnytsia.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "zolota-hrobnytsia",
  "name": "Золота Гробниця",
  "anchor": {
    "type": "poi",
    "poi": [
      "monument",
      "ruins"
    ]
  },
  "size": {
    "rooms": [
      12,
      36
    ],
    "length": [
      900,
      3000
    ],
    "area": [
      1500,
      6500
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "золоті мумії",
    "піщані скарабеї"
  ],
  "chance": 0.3,
  "danger": 4,
  "order": 769,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "heliontar"
    ]
  },
  "lore": {
    "description": "Гробниця пустельних правителів у шарі золотого піску."
  },
  "sim": {
    "tags": {
      "tombs": 55,
      "cache": 35,
      "webs": 15
    },
    "corr": 10,
    "cave": false
  }
});

/* dungeons/zubchasti-mekhanizmy.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "zubchasti-mekhanizmy",
  "name": "Зубчасті Механізми",
  "anchor": {
    "type": "poi",
    "poi": [
      "mountain",
      "ruins"
    ]
  },
  "size": {
    "rooms": [
      12,
      36
    ],
    "length": [
      720,
      2700
    ],
    "area": [
      1680,
      6840
    ],
    "levels": [
      2,
      4
    ]
  },
  "inhabitants": [
    "шестерні-стражі",
    "латунні павуки"
  ],
  "chance": 0.35,
  "danger": 4,
  "order": 718,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "kaldras"
    ]
  },
  "lore": {
    "description": "Гірське нутро з великими обертовими зубчастими плитами замість підлоги."
  }
});

/* dungeons/zvukovi-sklepinnya.js */
Atlas.registerDungeon({
  "format": 2,
  "id": "zvukovi-sklepinnya",
  "name": "Звукові Склепіння",
  "anchor": {
    "type": "poi",
    "poi": [
      "ruins",
      "monument"
    ]
  },
  "size": {
    "rooms": [
      8,
      26
    ],
    "length": [
      480,
      1950
    ],
    "area": [
      1120,
      4940
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "луна-духи",
    "гуркітні істоти"
  ],
  "chance": 0.35,
  "danger": 3,
  "order": 741,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "runhar"
    ]
  },
  "lore": {
    "description": "Склепіння, у яких кожен звук матеріалізується й залишається в стінах."
  }
});
