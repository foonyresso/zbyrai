/* Автоматично: node tools/build-atlas-registry.mjs. Не правити вручну: правте файли в папках. */
/* races/antfolk.js */
Atlas.registerRace({
  "format": 2,
  "id": "antfolk",
  "order": 217,
  "name": "Мурашник",
  "category": "інсектоїдна",
  "weight": 3,
  "size": "мала",
  "habitat": [
    "underground",
    "plain"
  ],
  "worlds": [
    "grondar",
    "medokray",
    "skarveld",
    "ormaval",
    "talassyr",
    "zhornoverkh",
    "infinite"
  ],
  "look": {
    "tint": "#80402a",
    "accent": "#c07a50",
    "body": "низький гуманоїд червоно-бурого кольору з вусиками"
  },
  "lore": {
    "description": "Колоніальний народ, що будує тунелі швидше за дворфів.",
    "appearance": "Бурі блоки, вусики, сильні руки.",
    "temperament": "Дисципліновані, роботящі, колективні.",
    "quarter": "Тунельні вузли",
    "buildings": "Земляні кургани з багатьма входами.",
    "abilities": [
      "несуть вагу в десять разів більшу",
      "копають швидко"
    ]
  }
});

/* races/ashkin.js */
Atlas.registerRace({
  "format": 2,
  "id": "ashkin",
  "order": 206,
  "name": "Попелюх",
  "category": "стихійна",
  "weight": 2,
  "size": "середня",
  "habitat": [
    "dry",
    "hot"
  ],
  "worlds": [
    "varhess",
    "rakhmir",
    "krovostep",
    "heliontar",
    "vitroparus",
    "fossar"
  ],
  "look": {
    "tint": "#7a7a74",
    "accent": "#c8c0b0",
    "body": "сіра людиноподібна фігура, що розсипається в дрібні куби"
  },
  "lore": {
    "description": "Народ попелу, що пам'ятає все, що згоріло.",
    "appearance": "Сіро-попільна шкіра, при русі осипаються дрібні уламки.",
    "temperament": "Тихі, меланхолійні, шанують пам'ять.",
    "quarter": "Попільні сховища",
    "buildings": "Мури з обпаленої цегли й спресованого попелу.",
    "abilities": [
      "розсипатися й збиратися знову",
      "читати сліди вогню"
    ]
  }
});

/* races/batfolk.js */
Atlas.registerRace({
  "format": 2,
  "id": "batfolk",
  "order": 219,
  "name": "Кажан",
  "category": "крилата",
  "weight": 2,
  "size": "мала",
  "habitat": [
    "underground",
    "dry"
  ],
  "worlds": [
    "talassyr",
    "skarveld",
    "noktalis",
    "nokserra",
    "grondar",
    "vespern",
    "umbralit",
    "ormaval"
  ],
  "look": {
    "tint": "#4a3a5a",
    "accent": "#c070c0",
    "body": "мала сутула фігура з великими перетинчастими крилами"
  },
  "lore": {
    "description": "Підземні літуни, що орієнтуються за звуком.",
    "appearance": "Темно-фіолетове хутро, великі вуха.",
    "temperament": "Обережні, гостинні вночі, сплять удень.",
    "quarter": "Стелі печер",
    "buildings": "Висячі гнізда й сталактитові житла.",
    "abilities": [
      "ехолокація",
      "висять догори ногами"
    ]
  }
});

/* races/beast-bear.js */
Atlas.registerRace({
  "format": 2,
  "id": "beast-bear",
  "order": 233,
  "name": "Звіролюд: ведмідь",
  "category": "звіролюд",
  "weight": 2,
  "size": "велика",
  "habitat": [
    "forest",
    "cold"
  ],
  "worlds": [
    "frostheym",
    "vuhlerod",
    "aurokhm",
    "sezonariy",
    "infinite",
    "trykoron",
    "zhornoverkh",
    "vershynnytsia"
  ],
  "look": {
    "tint": "#7a5a3a",
    "accent": "#d0b080",
    "body": "масивна ведмежа постать із блоків, широкі лапи"
  },
  "lore": {
    "description": "Сильні й неквапливі, дбають про берлоги.",
    "appearance": "Бурий хутро, широкі плечі.",
    "temperament": "Лагідні, поки їх не чіпають.",
    "quarter": "Берлоги й дровітні",
    "buildings": "Дерев'яні хатини.",
    "abilities": [
      "сила",
      "зимова сплячка"
    ]
  }
});

/* races/beast-boar.js */
Atlas.registerRace({
  "format": 2,
  "id": "beast-boar",
  "order": 235,
  "name": "Звіролюд: кабан",
  "category": "звіролюд",
  "weight": 2,
  "size": "середня",
  "habitat": [
    "forest",
    "plain"
  ],
  "worlds": [
    "infinite",
    "continent",
    "island",
    "pangea",
    "sezonariy",
    "vuhlerod",
    "zhornoverkh",
    "trykoron",
    "ternaviya"
  ],
  "look": {
    "tint": "#6a4a38",
    "accent": "#d8b898",
    "body": "кремезний гуманоїд із рилом і іклами"
  },
  "lore": {
    "description": "Упертий народ, любить наїдатися й боротися.",
    "appearance": "Темна щетина, ікла.",
    "temperament": "Запальні, щиросердні.",
    "quarter": "Хутори й свинарники",
    "buildings": "Дерев'яні хліви-будинки.",
    "abilities": [
      "таран",
      "нюх"
    ]
  }
});

/* races/beast-camel.js */
Atlas.registerRace({
  "format": 2,
  "id": "beast-camel",
  "order": 237,
  "name": "Звіролюд: верблюд",
  "category": "звіролюд",
  "weight": 2,
  "size": "велика",
  "habitat": [
    "dry",
    "hot"
  ],
  "worlds": [
    "heliontar",
    "vitroparus",
    "krovostep",
    "fossar",
    "rakhmir",
    "varhess",
    "hlynyshche"
  ],
  "look": {
    "tint": "#c8a068",
    "accent": "#ead8b0",
    "body": "висока постать із горбом із блоків"
  },
  "lore": {
    "description": "Каравани пустель — їхня хата.",
    "appearance": "Пісочне хутро, горб.",
    "temperament": "Терплячі, торговці.",
    "quarter": "Оази й каравансараї",
    "buildings": "Намети та глиняні двори.",
    "abilities": [
      "мало п'ють",
      "витривалі"
    ]
  }
});

/* races/beast-cat.js */
Atlas.registerRace({
  "format": 2,
  "id": "beast-cat",
  "order": 113,
  "name": "Звіролюд: кіт",
  "category": "звіролюд",
  "weight": 3,
  "size": "середня",
  "habitat": [
    "any"
  ],
  "look": {
    "tint": "#c9a07a"
  },
  "lore": {
    "description": "Котячі звіролюди: гнучкі й спритні.",
    "appearance": "Хутро, вуса, хвіст.",
    "temperament": "Незалежні, цікаві.",
    "quarter": "Дахи й ринки",
    "buildings": "Легкі прибудови, сходи.",
    "abilities": [
      "спритність"
    ]
  }
});

/* races/beast-deer.js */
Atlas.registerRace({
  "format": 2,
  "id": "beast-deer",
  "order": 234,
  "name": "Звіролюд: олень",
  "category": "звіролюд",
  "weight": 2,
  "size": "середня",
  "habitat": [
    "forest",
    "temperate"
  ],
  "worlds": [
    "aurokhm",
    "sezonariy",
    "orchardum",
    "illariya",
    "infinite",
    "lyumenvild",
    "zhornoverkh",
    "pangea"
  ],
  "look": {
    "tint": "#a07a50",
    "accent": "#e0d0b0",
    "body": "гуманоїд із рогами-гілками на голові"
  },
  "lore": {
    "description": "Лісові мандрівники, що чують ліс.",
    "appearance": "Світло-руде хутро, великі роги.",
    "temperament": "Обережні, мирні, швидкі.",
    "quarter": "Лісові галявини",
    "buildings": "Дерев'яні будинки на узліссі.",
    "abilities": [
      "швидкий біг",
      "чуття небезпеки"
    ]
  }
});

/* races/beast-fox.js */
Atlas.registerRace({
  "format": 2,
  "id": "beast-fox",
  "order": 115,
  "name": "Звіролюд: лис",
  "category": "звіролюд",
  "weight": 2,
  "size": "середня",
  "habitat": [
    "forest"
  ],
  "look": {
    "tint": "#c98a4a"
  },
  "lore": {
    "description": "Лисячі звіролюди: хитрі торговці й оповідачі.",
    "appearance": "Руде хутро, пухнастий хвіст.",
    "temperament": "Хитрі, дотепні.",
    "quarter": "Ринки й таверни",
    "buildings": "Теплі кольори, прикрашені двері.",
    "abilities": [
      "хитрість"
    ]
  }
});

/* races/beast-horse.js */
Atlas.registerRace({
  "format": 2,
  "id": "beast-horse",
  "order": 120,
  "name": "Звіролюд: кінь",
  "category": "звіролюд",
  "weight": 2,
  "size": "велика",
  "habitat": [
    "plain"
  ],
  "look": {
    "tint": "#9a7a5a"
  },
  "lore": {
    "description": "Кіньоподібні звіролюди-гінці й вершники.",
    "appearance": "Гриви, копита.",
    "temperament": "Швидкі, вільні.",
    "quarter": "Стайні й тракти",
    "buildings": "Стайні й відкриті двори.",
    "abilities": [
      "швидкий біг"
    ]
  }
});

/* races/beast-lion.js */
Atlas.registerRace({
  "format": 2,
  "id": "beast-lion",
  "order": 238,
  "name": "Звіролюд: лев",
  "category": "звіролюд",
  "weight": 1,
  "size": "велика",
  "habitat": [
    "plain",
    "dry"
  ],
  "worlds": [
    "veletraviya",
    "krovostep",
    "heliontar",
    "zhornoverkh",
    "pangea",
    "infinite",
    "sezonariy"
  ],
  "look": {
    "tint": "#d0a040",
    "accent": "#8a5020",
    "body": "потужна фігура з гривою з блоків"
  },
  "lore": {
    "description": "Гордовитий народ рівнин.",
    "appearance": "Золота шерсть, грива.",
    "temperament": "Гордовиті, владні.",
    "quarter": "Стійбища на пагорбах",
    "buildings": "Кам'яні кола й намети.",
    "abilities": [
      "гарчання",
      "сила стрибка"
    ]
  }
});

/* races/beast-mouse.js */
Atlas.registerRace({
  "format": 2,
  "id": "beast-mouse",
  "order": 117,
  "name": "Звіролюд: миша",
  "category": "звіролюд",
  "weight": 2,
  "size": "мала",
  "habitat": [
    "any"
  ],
  "look": {
    "tint": "#a89a8a"
  },
  "lore": {
    "description": "Мишачі звіролюди: дрібні майстри й посильні.",
    "appearance": "Маленькі, з круглими вухами.",
    "temperament": "Робочі, обачні.",
    "quarter": "Склади й підпіл",
    "buildings": "Малі будиночки в стінах.",
    "abilities": [
      "прихованість"
    ]
  }
});

/* races/beast-otter.js */
Atlas.registerRace({
  "format": 2,
  "id": "beast-otter",
  "order": 236,
  "name": "Звіролюд: видра",
  "category": "звіролюд",
  "weight": 2,
  "size": "мала",
  "habitat": [
    "wet",
    "coast"
  ],
  "worlds": [
    "akvedor",
    "doshchohrad",
    "talmoriya",
    "archipelago",
    "island",
    "infinite",
    "talassyr",
    "pangea"
  ],
  "look": {
    "tint": "#6a5040",
    "accent": "#d0c0a0",
    "body": "мала гнучка постать, хутро й хвіст-весло"
  },
  "lore": {
    "description": "Веселі плавці і збирачі.",
    "appearance": "Коричневе хутро, довгий хвіст.",
    "temperament": "Грайливі, цікаві.",
    "quarter": "Причали й канали",
    "buildings": "Будинки на палях.",
    "abilities": [
      "плавають",
      "вправні руки"
    ]
  }
});

/* races/beast-panda.js */
Atlas.registerRace({
  "format": 2,
  "id": "beast-panda",
  "order": 119,
  "name": "Звіролюд: панда",
  "category": "звіролюд",
  "weight": 1,
  "size": "велика",
  "habitat": [
    "mountain",
    "forest"
  ],
  "look": {
    "tint": "#e8e8e8"
  },
  "lore": {
    "description": "Пандоподібні звіролюди: спокійні сади й чайні.",
    "appearance": "Біле й чорне хутро.",
    "temperament": "Спокійні, добродушні.",
    "quarter": "Сади й чайні",
    "buildings": "Бамбукові будинки.",
    "abilities": [
      "сила й терпіння"
    ]
  }
});

/* races/beast-rabbit.js */
Atlas.registerRace({
  "format": 2,
  "id": "beast-rabbit",
  "order": 116,
  "name": "Звіролюд: кролик",
  "category": "звіролюд",
  "weight": 2,
  "size": "мала",
  "habitat": [
    "plain"
  ],
  "look": {
    "tint": "#d8d0c0"
  },
  "lore": {
    "description": "Кролячі звіролюди: швидкі й обережні землероби.",
    "appearance": "Довгі вуха, м'яке хутро.",
    "temperament": "Лякливі, але згуртовані.",
    "quarter": "Городи й нори",
    "buildings": "Нори й низькі будиночки.",
    "abilities": [
      "швидкість"
    ]
  }
});

/* races/beast-raccoon.js */
Atlas.registerRace({
  "format": 2,
  "id": "beast-raccoon",
  "order": 118,
  "name": "Звіролюд: єнот",
  "category": "звіролюд",
  "weight": 2,
  "size": "мала",
  "habitat": [
    "forest",
    "wet"
  ],
  "look": {
    "tint": "#8a7a6a"
  },
  "lore": {
    "description": "Єнотоподібні звіролюди: допитливі зброярі й збирачі.",
    "appearance": "Маска на обличчі, смугастий хвіст.",
    "temperament": "Допитливі.",
    "quarter": "Ринки й майстерні",
    "buildings": "Заставлені дрібницями майстерні.",
    "abilities": [
      "вправні лапи"
    ]
  }
});

/* races/beast-wolf.js */
Atlas.registerRace({
  "format": 2,
  "id": "beast-wolf",
  "order": 114,
  "name": "Звіролюд: вовк",
  "category": "звіролюд",
  "weight": 3,
  "size": "середня",
  "habitat": [
    "forest",
    "cold"
  ],
  "look": {
    "tint": "#8a8a8a"
  },
  "lore": {
    "description": "Вовкоподібні звіролюди зграйного побуту.",
    "appearance": "Сіре хутро, ікла.",
    "temperament": "Вірні зграї.",
    "quarter": "Окраїни й казарми",
    "buildings": "Зруби й загорожі.",
    "abilities": [
      "нюх"
    ]
  }
});

/* races/beefolk.js */
Atlas.registerRace({
  "format": 2,
  "id": "beefolk",
  "order": 215,
  "name": "Медар",
  "category": "інсектоїдна",
  "weight": 3,
  "size": "мала",
  "habitat": [
    "temperate",
    "plain"
  ],
  "worlds": [
    "medokray",
    "orchardum",
    "illariya",
    "aurokhm",
    "zhornoverkh",
    "sezonariy"
  ],
  "look": {
    "tint": "#e0b030",
    "accent": "#503010",
    "body": "невисока фігура у смугах жовтого й чорного, крильця-пластини"
  },
  "lore": {
    "description": "Працьовиті мешканці вуликів, що діляться медом і новинами.",
    "appearance": "Смугаста шкіра, прозорі крильця.",
    "temperament": "Згуртовані, дисципліновані, ненавидять розкол.",
    "quarter": "Вуликові квартали",
    "buildings": "Шестикутні стільники з воску.",
    "abilities": [
      "політ на короткі відстані",
      "лікувальний мед"
    ]
  }
});

/* races/birdfolk.js */
Atlas.registerRace({
  "format": 2,
  "id": "birdfolk",
  "order": 129,
  "name": "Людина-птах",
  "category": "крилата",
  "weight": 2,
  "size": "середня",
  "habitat": [
    "mountain",
    "coast"
  ],
  "look": {
    "tint": "#c9b88a"
  },
  "lore": {
    "description": "Крилаті люди висоти й узбережжя.",
    "appearance": "Пір'я й крила.",
    "temperament": "Вільні, балакучі.",
    "quarter": "Вежі й дахи",
    "buildings": "Високі башти й майданчики для зльоту.",
    "abilities": [
      "політ"
    ]
  }
});

/* races/centaur.js */
Atlas.registerRace({
  "format": 2,
  "id": "centaur",
  "order": 239,
  "name": "Кентавр",
  "category": "міфічна",
  "weight": 2,
  "size": "велика",
  "habitat": [
    "plain",
    "temperate"
  ],
  "worlds": [
    "veletraviya",
    "zhornoverkh",
    "sezonariy",
    "pangea",
    "infinite",
    "aurokhm",
    "litarkh",
    "trykoron"
  ],
  "look": {
    "tint": "#9a6a40",
    "accent": "#e0c090",
    "body": "чотириногий корпус із гуманоїдним торсом"
  },
  "lore": {
    "description": "Вільні вершники рівнин.",
    "appearance": "Кінське тіло, гуманоїдний торс.",
    "temperament": "Горді, вільнолюбні.",
    "quarter": "Табори в степу",
    "buildings": "Намети й кам'яні кола.",
    "abilities": [
      "швидкий галоп",
      "стрільба з лука"
    ]
  }
});

/* races/chitinoid.js */
Atlas.registerRace({
  "format": 2,
  "id": "chitinoid",
  "order": 112,
  "name": "Хітинець",
  "category": "інсектоїдна",
  "weight": 2,
  "size": "середня",
  "habitat": [
    "any"
  ],
  "look": {
    "tint": "#8a7a4a"
  },
  "lore": {
    "description": "Раса комахоподібних з хітиновими панцирами та колективним розумом.",
    "appearance": "Панцир, фасеткові очі.",
    "temperament": "Колективні, діловиті.",
    "quarter": "Вулики й склади",
    "buildings": "Воскові й смоляні вулики.",
    "abilities": [
      "панцир"
    ]
  }
});

/* races/clayfolk.js */
Atlas.registerRace({
  "format": 2,
  "id": "clayfolk",
  "order": 208,
  "name": "Глиняник",
  "category": "конструкт",
  "weight": 3,
  "size": "середня",
  "habitat": [
    "dry",
    "plain"
  ],
  "worlds": [
    "hlynyshche",
    "paperon",
    "malvar",
    "grondar",
    "heliontar",
    "vitroparus",
    "zhornoverkh"
  ],
  "look": {
    "tint": "#b46a40",
    "accent": "#e0b080",
    "body": "людиноподібна фігура з теракотових блоків, відбитки пальців на тілі"
  },
  "lore": {
    "description": "Ліплені з глини істоти, що самі виліплюють свої міста.",
    "appearance": "Теракотова шкіра, глибокі відбитки замість зморшок.",
    "temperament": "Працьовиті, ремісники, довірливі.",
    "quarter": "Гончарні квартали",
    "buildings": "Глиняні будинки з розписом.",
    "abilities": [
      "лише нова глина лікує",
      "ліплять форми руками"
    ]
  }
});

/* races/crabfolk.js */
Atlas.registerRace({
  "format": 2,
  "id": "crabfolk",
  "order": 222,
  "name": "Крабовик",
  "category": "водяна",
  "weight": 2,
  "size": "велика",
  "habitat": [
    "coast",
    "dry"
  ],
  "worlds": [
    "fossar",
    "talmoriya",
    "oskarium",
    "archipelago",
    "island",
    "pangea",
    "solemor"
  ],
  "look": {
    "tint": "#c0503a",
    "accent": "#f0d0b0",
    "body": "широка фігура з панциром-блоком і клешнями замість долонь"
  },
  "lore": {
    "description": "Береговий народ, що носить будинок на спині.",
    "appearance": "Червоний панцир, клешні, бокова хода.",
    "temperament": "Упертий, територіальний, добрий ремісник.",
    "quarter": "Пляжі й мілководдя",
    "buildings": "Мушлі-доми й каменеві брами.",
    "abilities": [
      "міцний панцир",
      "захват клешнею"
    ]
  }
});

/* races/crocfolk.js */
Atlas.registerRace({
  "format": 2,
  "id": "crocfolk",
  "order": 230,
  "name": "Крокодил",
  "category": "рептилоїдна",
  "weight": 2,
  "size": "велика",
  "habitat": [
    "wet",
    "hot"
  ],
  "worlds": [
    "nokserra",
    "ternaviya",
    "vershynnytsia",
    "doshchohrad",
    "krovostep",
    "akvedor",
    "talmoriya"
  ],
  "look": {
    "tint": "#4a7040",
    "accent": "#d0c880",
    "body": "широка фігура з зелено-бурої луски й довгою пащею"
  },
  "lore": {
    "description": "Засідкові мисливці боліт і річкових дельт.",
    "appearance": "Тверда луска, довга паща.",
    "temperament": "Терплячі, жорсткі, але вірні.",
    "quarter": "Берегові нори",
    "buildings": "Глиняні хати над водою.",
    "abilities": [
      "потужний укус",
      "довго під водою"
    ]
  }
});

/* races/crystalkin.js */
Atlas.registerRace({
  "format": 2,
  "id": "crystalkin",
  "order": 210,
  "name": "Кристаліт",
  "category": "конструкт",
  "weight": 2,
  "size": "середня",
  "habitat": [
    "mountain",
    "underground"
  ],
  "worlds": [
    "eshkariya",
    "skeltsvit",
    "aurelit",
    "asterfell",
    "kaltseron",
    "runozem",
    "skarveld",
    "neverion"
  ],
  "look": {
    "tint": "#a070d0",
    "accent": "#f0d0ff",
    "body": "гуманоїд з фіолетових і білих кристалічних кубів"
  },
  "lore": {
    "description": "Світлолюбні істоти з живого кристала.",
    "appearance": "Прозорі грані, внутрішнє сяйво.",
    "temperament": "Спокійні, мелодійні, чутливі до звуку.",
    "quarter": "Кристальні зали",
    "buildings": "Прозорі стіни й призми на дахах.",
    "abilities": [
      "заломлення світла",
      "дзвінкий голос"
    ]
  }
});

/* races/cyclops.js */
Atlas.registerRace({
  "format": 2,
  "id": "cyclops",
  "order": 127,
  "name": "Циклоп",
  "category": "велетенська",
  "weight": 1,
  "size": "велика",
  "habitat": [
    "mountain"
  ],
  "look": {
    "tint": "#8a7a5a"
  },
  "lore": {
    "description": "Одноокі велетні-ковалі.",
    "appearance": "Одне велике око, високий зріст.",
    "temperament": "Замкнені, працьовиті.",
    "quarter": "Кузні й майстерні",
    "buildings": "Високі двері й кам'яні кузні.",
    "abilities": [
      "кування"
    ]
  }
});

/* races/dark-elf.js */
Atlas.registerRace({
  "format": 2,
  "id": "dark-elf",
  "order": 102,
  "name": "Темний ельф",
  "category": "ельфійська",
  "weight": 3,
  "size": "середня",
  "habitat": [
    "underground",
    "forest"
  ],
  "look": {
    "tint": "#6a5a8a"
  },
  "lore": {
    "description": "Нащадки вигнаних ельфів, що пішли в підземелля й тіні.",
    "appearance": "Темна шкіра, світле волосся.",
    "temperament": "Таємні, честолюбні, інтриги.",
    "quarter": "Нижні квартали й підземні поверхи",
    "buildings": "Вузькі вежі й ходи під землею, фіолетові ліхтарі.",
    "abilities": [
      "бачать у темряві"
    ]
  }
});

/* races/deepdweller.js */
Atlas.registerRace({
  "format": 2,
  "id": "deepdweller",
  "order": 245,
  "name": "Глибинець",
  "category": "підземна",
  "weight": 2,
  "size": "середня",
  "habitat": [
    "underground"
  ],
  "worlds": [
    "skarveld",
    "grondar",
    "talassyr",
    "ormaval",
    "hlybokray",
    "noktalis",
    "kernalis",
    "infinite"
  ],
  "look": {
    "tint": "#4a5a6a",
    "accent": "#70c0d0",
    "body": "блідий гуманоїд з великими очима, довгі пальці"
  },
  "lore": {
    "description": "Народ глибоких печер, що забув про світло.",
    "appearance": "Блідо-сіра шкіра, світні очі.",
    "temperament": "Сором'язливі, допитливі, обережні.",
    "quarter": "Глибокі зали",
    "buildings": "Тонкі вежі в печерах з грибним світлом.",
    "abilities": [
      "бачать у темряві",
      "чуття вібрації"
    ]
  }
});

/* races/demon.js */
Atlas.registerRace({
  "format": 2,
  "id": "demon",
  "order": 108,
  "name": "Демон",
  "category": "демонічна",
  "weight": 1,
  "size": "середня",
  "habitat": [
    "hot",
    "underground"
  ],
  "look": {
    "tint": "#8a3a3a"
  },
  "lore": {
    "description": "Створіння з іншого плану, що оселилося серед смертних.",
    "appearance": "Роги, червона шкіра, жарке дихання.",
    "temperament": "Горді, непередбачувані.",
    "quarter": "Вежі й підземні зали",
    "buildings": "Чорний камінь із червоними прорізами.",
    "abilities": [
      "вогняні вміння"
    ]
  }
});

/* races/domovyk.js */
Atlas.registerRace({
  "format": 2,
  "id": "domovyk",
  "order": 242,
  "name": "Домовик",
  "category": "мала",
  "weight": 3,
  "size": "мала",
  "habitat": [
    "temperate",
    "plain"
  ],
  "worlds": [
    "infinite",
    "zhornoverkh",
    "grondar",
    "medokray",
    "trykoron",
    "sezonariy",
    "island",
    "pangea",
    "continent"
  ],
  "look": {
    "tint": "#a07050",
    "accent": "#e8c898",
    "body": "невеликий гуманоїд у каптурі й з бородою, малий зріст"
  },
  "lore": {
    "description": "Невидимий господар хат, що любить порядок.",
    "appearance": "Руде волосся, борода, каптур.",
    "temperament": "Працьовиті, образливі, щедрі до чемних.",
    "quarter": "Піч і комора",
    "buildings": "Затишні хатки під горищем.",
    "abilities": [
      "невидимість",
      "дрібне чаклунство"
    ]
  }
});

/* races/dragonborn.js */
Atlas.registerRace({
  "format": 2,
  "id": "dragonborn",
  "order": 122,
  "name": "Напівдракон",
  "category": "драконяча",
  "weight": 1,
  "size": "велика",
  "habitat": [
    "mountain",
    "hot"
  ],
  "look": {
    "tint": "#b23a2e"
  },
  "lore": {
    "description": "Нащадки драконячої крові з лускою.",
    "appearance": "Луска, ікла, хвіст.",
    "temperament": "Горді, воїнські.",
    "quarter": "Фортеці й арени",
    "buildings": "Кам'яні зали й вежі.",
    "abilities": [
      "подих"
    ]
  }
});

/* races/dreamfolk.js */
Atlas.registerRace({
  "format": 2,
  "id": "dreamfolk",
  "order": 248,
  "name": "Мрієць",
  "category": "ефірна",
  "weight": 2,
  "size": "середня",
  "habitat": [
    "any"
  ],
  "worlds": [
    "umbralit",
    "kernalis",
    "noktalis",
    "eydoliya",
    "mirrahon",
    "neverion",
    "vespern",
    "aurelit"
  ],
  "look": {
    "tint": "#8a70c0",
    "accent": "#f0d0ff",
    "body": "напівпрозора фіолетова фігура з м'яких кубів, хмара над головою"
  },
  "lore": {
    "description": "Створені снами, що живуть на межі яви.",
    "appearance": "Фіолетові тіні, тихе світіння.",
    "temperament": "Мрійливі, добрі, розсіяні.",
    "quarter": "Тихі вежі снів",
    "buildings": "Хмароподібні будинки.",
    "abilities": [
      "сновидіння",
      "невидимість уві сні"
    ]
  }
});

/* races/dryad.js */
Atlas.registerRace({
  "format": 2,
  "id": "dryad",
  "order": 123,
  "name": "Дріада",
  "category": "міфічна",
  "weight": 1,
  "size": "середня",
  "habitat": [
    "forest"
  ],
  "look": {
    "tint": "#6aa86a"
  },
  "lore": {
    "description": "Духи дерев у людській подобі.",
    "appearance": "Шкіра як кора, листя у волоссі.",
    "temperament": "Мирні, пов'язані з лісом.",
    "quarter": "Парки й дерева",
    "buildings": "Живі дерева замість стін.",
    "abilities": [
      "зв'язок із деревами"
    ]
  }
});

/* races/dwarf.js */
Atlas.registerRace({
  "format": 2,
  "id": "dwarf",
  "order": 103,
  "name": "Дворф",
  "category": "підземна",
  "weight": 6,
  "size": "мала",
  "habitat": [
    "mountain",
    "underground"
  ],
  "look": {
    "tint": "#8a8f99"
  },
  "lore": {
    "description": "Міцні майстри каменя й металу з гірських твердинь.",
    "appearance": "Низькі, кремезні, з бородами.",
    "temperament": "Вперті, чесні, любителі пива й кування.",
    "quarter": "Кузні й кам'яні квартали",
    "buildings": "Низькі товсті стіни з каменю, кована фурнітура.",
    "abilities": [
      "майстри кування"
    ]
  }
});

/* races/elf.js */
Atlas.registerRace({
  "format": 2,
  "id": "elf",
  "order": 101,
  "name": "Ельф",
  "category": "ельфійська",
  "weight": 6,
  "size": "середня",
  "habitat": [
    "forest",
    "temperate"
  ],
  "look": {
    "tint": "#b9d08a"
  },
  "lore": {
    "description": "Довговічна раса лісів і гір, шанує красу й знання.",
    "appearance": "Високі, стрункі, гострі вуха.",
    "temperament": "Стримані, мистецькі.",
    "quarter": "Садові квартали й дерева",
    "buildings": "Легкі споруди з дерева, скла й живих гілок.",
    "abilities": [
      "довге життя",
      "гострий слух"
    ]
  }
});

/* races/flamekin.js */
Atlas.registerRace({
  "format": 2,
  "id": "flamekin",
  "order": 202,
  "name": "Полум'яр",
  "category": "стихійна",
  "weight": 3,
  "size": "середня",
  "habitat": [
    "hot",
    "dry"
  ],
  "worlds": [
    "embergard",
    "kaldras",
    "heliontar",
    "vitroparus",
    "rzhavar",
    "varhess"
  ],
  "look": {
    "tint": "#e0662a",
    "accent": "#ffd040",
    "body": "гуманоїд із вогняних кубів: жовте ядро, червоні краї"
  },
  "lore": {
    "description": "Народ живого вогню, що гріється біля кузень і жерел лави.",
    "appearance": "Тіло як жаринки: помаранчеве ядро, іскри навколо.",
    "temperament": "Запальні, щирі, швидко вибухають і швидко остигають.",
    "quarter": "Кузенні двори",
    "buildings": "Червона цегла, відкриті горна.",
    "abilities": [
      "вогняний дотик",
      "нечутливі до жару"
    ]
  }
});

/* races/fragmentfolk.js */
Atlas.registerRace({
  "format": 2,
  "id": "fragmentfolk",
  "order": 252,
  "name": "Уламок",
  "category": "конструкт",
  "weight": 2,
  "size": "середня",
  "habitat": [
    "any"
  ],
  "worlds": [
    "ostanky",
    "eydoliya",
    "kernalis",
    "neverion",
    "morgalis",
    "infinite"
  ],
  "look": {
    "tint": "#8a8a98",
    "accent": "#e0a050",
    "body": "фігура, складена з різнорідних шматків інших істот"
  },
  "lore": {
    "description": "Створені з решток інших рас, шукають власне ім'я.",
    "appearance": "Тіло з різнокольорових блоків.",
    "temperament": "Сумні, прив'язані до всього.",
    "quarter": "Склади знахідок",
    "buildings": "Зібрані з уламків будинки.",
    "abilities": [
      "мінливість",
      "збирають форму"
    ]
  }
});

/* races/frogfolk.js */
Atlas.registerRace({
  "format": 2,
  "id": "frogfolk",
  "order": 223,
  "name": "Жабрин",
  "category": "водяна",
  "weight": 3,
  "size": "мала",
  "habitat": [
    "wet"
  ],
  "worlds": [
    "nokserra",
    "doshchohrad",
    "akvedor",
    "ternaviya",
    "vershynnytsia",
    "talmoriya",
    "infinite"
  ],
  "look": {
    "tint": "#58a050",
    "accent": "#d0e070",
    "body": "низький гуманоїд зеленого кольору з великими очима"
  },
  "lore": {
    "description": "Мешканці боліт і дощових міст, що люблять калюжі.",
    "appearance": "Зелена гладка шкіра, широкий рот.",
    "temperament": "Веселі, балакучі, непосидючі.",
    "quarter": "Болотні помости",
    "buildings": "Палі, очеретяні дахи, ліани.",
    "abilities": [
      "стрибки",
      "квакають, лякаючи ворога"
    ]
  }
});

/* races/frostkin.js */
Atlas.registerRace({
  "format": 2,
  "id": "frostkin",
  "order": 203,
  "name": "Інеєць",
  "category": "стихійна",
  "weight": 3,
  "size": "середня",
  "habitat": [
    "cold",
    "mountain"
  ],
  "worlds": [
    "frostheym",
    "termalis",
    "asterfell",
    "infinite",
    "sezonariy",
    "vuhlerod"
  ],
  "look": {
    "tint": "#9cc8e0",
    "accent": "#ffffff",
    "body": "гуманоїд з льодяних блоків, білий іній на плечах"
  },
  "lore": {
    "description": "Мешканці вічної зими, що ховають тепло в глибині тіла.",
    "appearance": "Блакитно-білі блоки льоду, іній замість волосся.",
    "temperament": "Стримані, терплячі, байдужі до холоду.",
    "quarter": "Льодові печери",
    "buildings": "Крижані арки й сніжні куполи.",
    "abilities": [
      "морозний подих",
      "ходять по льоду"
    ]
  }
});

/* races/fungoid.js */
Atlas.registerRace({
  "format": 2,
  "id": "fungoid",
  "order": 213,
  "name": "Грибовик",
  "category": "рослинна",
  "weight": 3,
  "size": "мала",
  "habitat": [
    "wet",
    "underground"
  ],
  "worlds": [
    "nokserra",
    "lyumenvild",
    "smolyar",
    "talassyr",
    "ormaval",
    "skarveld",
    "ternaviya",
    "doshchohrad",
    "grondar"
  ],
  "look": {
    "tint": "#a0705a",
    "accent": "#e8d8b0",
    "body": "низька фігура з великою грибною шапкою-кубом"
  },
  "lore": {
    "description": "Мешканці вологих печер, що ростуть колоніями.",
    "appearance": "Шапка гриба замість голови, тонкі ніжки.",
    "temperament": "Тихі, колективні, ніколи не поспішають.",
    "quarter": "Грибні печери",
    "buildings": "Гриби-будинки з пористими стінами.",
    "abilities": [
      "спори сну",
      "ріст з сухих колод"
    ]
  }
});

/* races/ghostfolk.js */
Atlas.registerRace({
  "format": 2,
  "id": "ghostfolk",
  "order": 226,
  "name": "Привид",
  "category": "нежива",
  "weight": 2,
  "size": "середня",
  "habitat": [
    "any"
  ],
  "worlds": [
    "noktalis",
    "umbralit",
    "mirrahon",
    "kernalis",
    "ostanky",
    "vespern",
    "morgalis",
    "nokserra"
  ],
  "look": {
    "tint": "#b8c8d8",
    "accent": "#ffffff",
    "body": "напівпрозора біла фігура з кубів, що розчиняється знизу"
  },
  "lore": {
    "description": "Невпокоєні тіні, що не мають ваги.",
    "appearance": "Бліді прозорі блоки, довгий низ плаща.",
    "temperament": "Сумні, наглядові, мстиві лише за зраду.",
    "quarter": "Старі залишені будинки",
    "buildings": "Стіни, що пропускають світло.",
    "abilities": [
      "проходять крізь стіни",
      "холод поряд"
    ]
  }
});

/* races/goblin.js */
Atlas.registerRace({
  "format": 2,
  "id": "goblin",
  "order": 105,
  "name": "Гоблін",
  "category": "мала",
  "weight": 5,
  "size": "мала",
  "habitat": [
    "any"
  ],
  "look": {
    "tint": "#7a9a5a"
  },
  "lore": {
    "description": "Дрібні кмітливі створіння; майстри пасток і торгівлі дрібницями.",
    "appearance": "Малий зріст, великі вуха й очі.",
    "temperament": "Хитрі, балакучі, жадібні.",
    "quarter": "Склади, ринки й підпіл",
    "buildings": "Тісні дерев'яні халупи, схованки.",
    "abilities": [
      "пастки"
    ]
  }
});

/* races/golem.js */
Atlas.registerRace({
  "format": 2,
  "id": "golem",
  "order": 207,
  "name": "Голем",
  "category": "конструкт",
  "weight": 3,
  "size": "велика",
  "habitat": [
    "mountain",
    "underground"
  ],
  "worlds": [
    "kamyanorod",
    "runozem",
    "rudozir",
    "hlynyshche",
    "skeltsvit",
    "fossar",
    "luskariya",
    "kaltseron",
    "drumbor",
    "ostanky",
    "infinite",
    "trykoron"
  ],
  "look": {
    "tint": "#8a8a86",
    "accent": "#d0c070",
    "body": "масивна фігура з сірих блоків, рунічні відмітки на грудях"
  },
  "lore": {
    "description": "Народ оживлених каменів: мислить повільно, але пам'ятає віки.",
    "appearance": "Кубасте кам'яне тіло, руни, мох на плечах.",
    "temperament": "Мовчазні, мудрі, зрушити їх важко.",
    "quarter": "Кам'яні подвір'я",
    "buildings": "Монолітні споруди без швів.",
    "abilities": [
      "міцність каменя",
      "ніколи не втомлюються"
    ]
  }
});

/* races/halfling.js */
Atlas.registerRace({
  "format": 2,
  "id": "halfling",
  "order": 121,
  "name": "Напіврослик",
  "category": "мала",
  "weight": 5,
  "size": "мала",
  "habitat": [
    "plain",
    "temperate"
  ],
  "look": {
    "tint": "#d1ae82"
  },
  "lore": {
    "description": "Малі добродушні землероби й кухарі.",
    "appearance": "Малий зріст, кучеряве волосся.",
    "temperament": "Домашні, гостинні, цінують їжу.",
    "quarter": "Городи й затишні вулиці",
    "buildings": "Круглі двері й землянкові будиночки.",
    "abilities": [
      "везіння"
    ]
  },
  "alias": "Гном"
});

/* races/hellhound-folk.js */
Atlas.registerRace({
  "format": 2,
  "id": "hellhound-folk",
  "order": 201,
  "name": "Пекловарг",
  "category": "демонічна",
  "weight": 1,
  "size": "середня",
  "habitat": [
    "hot",
    "underground"
  ],
  "worlds": [
    "embergard",
    "kaldras",
    "morgalis",
    "ostanky",
    "krovostep",
    "vuhlerod",
    "heliontar"
  ],
  "look": {
    "tint": "#6a2a2a",
    "accent": "#ff7a30",
    "body": "гуманоїд із собачою головою-кубом, розжареними очима"
  },
  "lore": {
    "description": "Вартові темних брам, що несуть жар у грудях.",
    "appearance": "Чорне хутро, світяться очі й пащі.",
    "temperament": "Вірні, лютіші за тих, кого охороняють.",
    "quarter": "Прибрамні вежі",
    "buildings": "Чорний камінь із вогнищами в нішах.",
    "abilities": [
      "жар дихання",
      "чуття брехні"
    ]
  }
});

/* races/human.js */
Atlas.registerRace({
  "format": 2,
  "id": "human",
  "order": 100,
  "name": "Людина",
  "category": "звичайна",
  "weight": 10,
  "size": "середня",
  "habitat": [
    "any"
  ],
  "look": {
    "tint": "#c9a27a"
  },
  "lore": {
    "description": "Найпоширеніша раса: пристосовується до будь-якого клімату й ремесла.",
    "appearance": "Різні зріст і колір шкіри залежно від краю.",
    "temperament": "Різні: від торговців до воїнів.",
    "quarter": "Усі квартали",
    "buildings": "Будинки різних звичаїв, залежно від місцевості.",
    "abilities": []
  }
});

/* races/imp.js */
Atlas.registerRace({
  "format": 2,
  "id": "imp",
  "order": 200,
  "name": "Біс",
  "category": "демонічна",
  "weight": 2,
  "size": "мала",
  "habitat": [
    "hot",
    "underground"
  ],
  "worlds": "all",
  "look": {
    "tint": "#b4443c",
    "accent": "#f0b030",
    "body": "малий гуманоїд із куцими рогами, хвостом-кубиком"
  },
  "lore": {
    "description": "Дрібна нечисть з іншого плану, що пристала до смертних як слуги й шкідники.",
    "appearance": "Червоний кубастий тулуб, ріжки, тонкий хвіст.",
    "temperament": "Пустотливі, жадібні до дрібних угод.",
    "quarter": "Горища й димарі",
    "buildings": "Низькі будиночки з сажею та червоною черепицею.",
    "abilities": [
      "вогняна іскра",
      "обмін послугами"
    ]
  }
});

/* races/incubus.js */
Atlas.registerRace({
  "format": 2,
  "id": "incubus",
  "order": 131,
  "name": "Інкуб",
  "category": "демонічна",
  "weight": 1,
  "size": "середня",
  "habitat": [
    "any"
  ],
  "look": {
    "tint": "#6a3a8a"
  },
  "lore": {
    "description": "Демонічні спокусники.",
    "appearance": "Крила й роги, вишукана зовнішність.",
    "temperament": "Чарівні, схильні до інтриг.",
    "quarter": "Таверни й вежі",
    "buildings": "Темні зали з важкими завісами.",
    "abilities": [
      "чарівність"
    ]
  }
});

/* races/ironborn.js */
Atlas.registerRace({
  "format": 2,
  "id": "ironborn",
  "order": 209,
  "name": "Залізняк",
  "category": "конструкт",
  "weight": 2,
  "size": "велика",
  "habitat": [
    "mountain",
    "hot"
  ],
  "worlds": [
    "ferroks",
    "rzhavar",
    "embergard",
    "rudozir",
    "kaldras",
    "ostanky",
    "krovostep",
    "trykoron"
  ],
  "look": {
    "tint": "#5a6068",
    "accent": "#c05a30",
    "body": "важка фігура з сірого металу, іржаві плями на стиках"
  },
  "lore": {
    "description": "Живі заготовки з металу, що віддали серце кузні.",
    "appearance": "Блоки сталі, заклепки, іржа на плечах.",
    "temperament": "Прямі, дисципліновані, цінують слово.",
    "quarter": "Ливарні двори",
    "buildings": "Залізні балки й димарі.",
    "abilities": [
      "міцна броня",
      "магнітне тяжіння"
    ]
  }
});

/* races/lamia.js */
Atlas.registerRace({
  "format": 2,
  "id": "lamia",
  "order": 124,
  "name": "Ламія",
  "category": "міфічна",
  "weight": 1,
  "size": "велика",
  "habitat": [
    "hot",
    "dry"
  ],
  "look": {
    "tint": "#6a8a5a"
  },
  "lore": {
    "description": "Напівлюди-напівзмії.",
    "appearance": "Людське тіло й змієвий хвіст.",
    "temperament": "Загадкові, спокусливі.",
    "quarter": "Підземні зали й храми",
    "buildings": "Широкі проходи й змійські орнаменти.",
    "abilities": [
      "гіпноз"
    ]
  }
});

/* races/leshy.js */
Atlas.registerRace({
  "format": 2,
  "id": "leshy",
  "order": 240,
  "name": "Лісовик",
  "category": "міфічна",
  "weight": 2,
  "size": "мала",
  "habitat": [
    "forest"
  ],
  "worlds": [
    "infinite",
    "aurokhm",
    "sezonariy",
    "vuhlerod",
    "ternaviya",
    "lyumenvild",
    "smolyar",
    "orchardum",
    "arkhelor",
    "vershynnytsia"
  ],
  "look": {
    "tint": "#5a7a40",
    "accent": "#a0c070",
    "body": "низька постать з моху й гілок, довга борода"
  },
  "lore": {
    "description": "Хранитель лісових стежок, що заводить чужинців не туди.",
    "appearance": "Зелено-бура постать, борода з моху.",
    "temperament": "Хитрі, жартівливі, суворі до браконьєрів.",
    "quarter": "Лісові пеньки",
    "buildings": "Хатини в дуплах і між корінням.",
    "abilities": [
      "збиває з путі",
      "говорить із звірами"
    ]
  }
});

/* races/lightwing.js */
Atlas.registerRace({
  "format": 2,
  "id": "lightwing",
  "order": 220,
  "name": "Світляр",
  "category": "крилата",
  "weight": 2,
  "size": "середня",
  "habitat": [
    "temperate",
    "mountain"
  ],
  "worlds": [
    "aurelit",
    "heliontar",
    "astrakor",
    "neborid",
    "solemor",
    "eydoliya"
  ],
  "look": {
    "tint": "#f0e8b0",
    "accent": "#ffd860",
    "body": "гуманоїд з білих кубів, великі світлі крила"
  },
  "lore": {
    "description": "Втілення світла в тілі, що живиться ранковими променями.",
    "appearance": "Світла шкіра, сяйво навколо, крила з променів.",
    "temperament": "Привітні, але вимогливі до чесності.",
    "quarter": "Високі тераси",
    "buildings": "Біле каміння з золотими балконами.",
    "abilities": [
      "сліпуче світло",
      "легкий політ"
    ]
  }
});

/* races/lizardfolk.js */
Atlas.registerRace({
  "format": 2,
  "id": "lizardfolk",
  "order": 111,
  "name": "Ящеролюд",
  "category": "рептилоїдна",
  "weight": 2,
  "size": "середня",
  "habitat": [
    "wet",
    "hot"
  ],
  "look": {
    "tint": "#5a8a5a"
  },
  "lore": {
    "description": "Давня раса мисливців із боліт і джунглів.",
    "appearance": "Луска й хвіст.",
    "temperament": "Терплячі, обережні мисливці.",
    "quarter": "Береги й болотяні квартали",
    "buildings": "Тростинні й глиняні хатини на палях.",
    "abilities": [
      "плавання"
    ]
  }
});

/* races/mantisfolk.js */
Atlas.registerRace({
  "format": 2,
  "id": "mantisfolk",
  "order": 216,
  "name": "Богомолець",
  "category": "інсектоїдна",
  "weight": 1,
  "size": "середня",
  "habitat": [
    "forest",
    "wet"
  ],
  "worlds": [
    "ternaviya",
    "vershynnytsia",
    "lyumenvild",
    "illariya",
    "arkhelor",
    "sezonariy"
  ],
  "look": {
    "tint": "#6ab048",
    "accent": "#204020",
    "body": "тонкий гуманоїд із зелених блоків і складними руками"
  },
  "lore": {
    "description": "Тихі мисливці-чекальники з лісових заростей.",
    "appearance": "Тонкі зелені кінцівки, довгі передпліччя.",
    "temperament": "Терплячі, лаконічні, влучні.",
    "quarter": "Гілкові тераси",
    "buildings": "Тонкі помости між гілками.",
    "abilities": [
      "нерухомість мисливця",
      "швидкий удар"
    ]
  }
});

/* races/mavka.js */
Atlas.registerRace({
  "format": 2,
  "id": "mavka",
  "order": 241,
  "name": "Мавка",
  "category": "міфічна",
  "weight": 2,
  "size": "середня",
  "habitat": [
    "forest",
    "wet"
  ],
  "worlds": [
    "infinite",
    "aurokhm",
    "sezonariy",
    "lyumenvild",
    "orchardum",
    "illariya",
    "ternaviya",
    "smolyar",
    "vershynnytsia",
    "arkhelor"
  ],
  "look": {
    "tint": "#58b090",
    "accent": "#f0f0d0",
    "body": "тонка постать із зелено-блакитної шкіри, з квітами у волоссі"
  },
  "lore": {
    "description": "Лісова дівчина з легендами, чия краса оманлива.",
    "appearance": "Бліда шкіра, листя й квіти замість одягу.",
    "temperament": "Грайливі, невловимі, недовірливі.",
    "quarter": "Лісові поляни",
    "buildings": "Вінки й візерунки з гілок.",
    "abilities": [
      "чарівний спів",
      "зникнення в тіні"
    ]
  }
});

/* races/merfolk.js */
Atlas.registerRace({
  "format": 2,
  "id": "merfolk",
  "order": 221,
  "name": "Русал",
  "category": "водяна",
  "weight": 3,
  "size": "середня",
  "habitat": [
    "wet",
    "coast"
  ],
  "worlds": [
    "talassyr",
    "talmoriya",
    "solemor",
    "akvedor",
    "archipelago",
    "island",
    "doshchohrad",
    "oskarium",
    "pangea"
  ],
  "look": {
    "tint": "#3a70b0",
    "accent": "#a0e0d0",
    "body": "верхня частина гуманоїдна, нижня риб'яча з плавцем-блоками"
  },
  "lore": {
    "description": "Підводний народ, що вправно ходить і по берегу.",
    "appearance": "Синя луска, плавці, перламутрові вставки.",
    "temperament": "Гордовиті, співочі, не терплять сушу довго.",
    "quarter": "Затоки й шлюзи",
    "buildings": "Перлинні будинки у воді й на палях.",
    "abilities": [
      "дихають під водою",
      "пісня-приманка"
    ]
  }
});

/* races/mirrorfolk.js */
Atlas.registerRace({
  "format": 2,
  "id": "mirrorfolk",
  "order": 247,
  "name": "Відбиток",
  "category": "ефірна",
  "weight": 2,
  "size": "середня",
  "habitat": [
    "any"
  ],
  "worlds": [
    "mirrahon",
    "eydoliya",
    "umbralit",
    "kernalis",
    "neverion",
    "ostanky",
    "paperon"
  ],
  "look": {
    "tint": "#a0b8c8",
    "accent": "#ffffff",
    "body": "дзеркальна гуманоїдна фігура з відполірованих блоків"
  },
  "lore": {
    "description": "Істоти-відображення, що живуть у паралельному шарі.",
    "appearance": "Дзеркальна поверхня, відбиває навколишнє.",
    "temperament": "Мінливі, наслідувачі, цікаві.",
    "quarter": "Дзеркальні зали",
    "buildings": "Скляні фасади.",
    "abilities": [
      "копіюють зовнішність",
      "відбивають світло"
    ]
  }
});

/* races/molefolk.js */
Atlas.registerRace({
  "format": 2,
  "id": "molefolk",
  "order": 246,
  "name": "Кротолюд",
  "category": "підземна",
  "weight": 2,
  "size": "мала",
  "habitat": [
    "underground",
    "plain"
  ],
  "worlds": [
    "grondar",
    "skarveld",
    "hlybokray",
    "infinite",
    "zhornoverkh",
    "rudozir",
    "runozem"
  ],
  "look": {
    "tint": "#5a4a3a",
    "accent": "#e0b8a0",
    "body": "низька кремезна фігура, лопатоподібні долоні"
  },
  "lore": {
    "description": "Копачі нір, що ненавидять сонце.",
    "appearance": "Темне хутро, довгі кігті.",
    "temperament": "Затишні, торговці дрібницями.",
    "quarter": "Нори й коридори",
    "buildings": "Низькі землянки.",
    "abilities": [
      "копають",
      "нюх на воду"
    ]
  }
});

/* races/moon-elf.js */
Atlas.registerRace({
  "format": 2,
  "id": "moon-elf",
  "order": 260,
  "name": "Місячний ельф",
  "category": "ельфійська",
  "weight": 2,
  "size": "середня",
  "habitat": [
    "forest",
    "cold"
  ],
  "worlds": [
    "noktalis",
    "vespern",
    "nokserra",
    "lyumenvild",
    "umbralit",
    "infinite",
    "sezonariy",
    "aurokhm"
  ],
  "look": {
    "tint": "#9ab0e0",
    "accent": "#e8f0ff",
    "body": "стрункий гуманоїд зі сріблястою шкірою й синім волоссям"
  },
  "lore": {
    "description": "Ельфи, що поклоняються місяцю й живуть за місячним календарем.",
    "appearance": "Сріблясто-біла шкіра, синє волосся.",
    "temperament": "Стримані, поетичні, проти поспіху.",
    "quarter": "Гаї при озерах",
    "buildings": "Білокам'яні вежі з синіми ліхтарями.",
    "abilities": [
      "нічний зір",
      "місячне світіння"
    ]
  }
});

/* races/mummyfolk.js */
Atlas.registerRace({
  "format": 2,
  "id": "mummyfolk",
  "order": 227,
  "name": "Муміян",
  "category": "нежива",
  "weight": 2,
  "size": "середня",
  "habitat": [
    "dry",
    "hot"
  ],
  "worlds": [
    "heliontar",
    "vitroparus",
    "fossar",
    "krovostep",
    "rakhmir",
    "varhess"
  ],
  "look": {
    "tint": "#c8b88a",
    "accent": "#7a6020",
    "body": "гуманоїд, обгорнутий у бежеві смуги, світяться очі"
  },
  "lore": {
    "description": "Хранителі пісків, що тримаються на давніх клятвах.",
    "appearance": "Бежові бинти, золоті прикраси.",
    "temperament": "Урочисті, ритуальні, відчувають вік.",
    "quarter": "Гробниці й піраміди",
    "buildings": "Пісковик, золоті двері, піраміди.",
    "abilities": [
      "нетлінність",
      "прокляття мандрівників"
    ]
  }
});

/* races/nymph.js */
Atlas.registerRace({
  "format": 2,
  "id": "nymph",
  "order": 128,
  "name": "Німфа",
  "category": "міфічна",
  "weight": 1,
  "size": "середня",
  "habitat": [
    "wet",
    "coast"
  ],
  "look": {
    "tint": "#6ab0c8"
  },
  "lore": {
    "description": "Духи води й джерел у людській подобі.",
    "appearance": "Мінлива шкіра й водяне волосся.",
    "temperament": "Спокійні, привітні.",
    "quarter": "Фонтани й береги",
    "buildings": "Фонтани, басейни й водяні сади.",
    "abilities": [
      "водні чари"
    ]
  }
});

/* races/ogre.js */
Atlas.registerRace({
  "format": 2,
  "id": "ogre",
  "order": 132,
  "name": "Огр",
  "category": "велетенська",
  "weight": 2,
  "size": "велика",
  "habitat": [
    "any"
  ],
  "look": {
    "tint": "#8a7a4a"
  },
  "lore": {
    "description": "Велетні-тугодуми, добрі в бійці й у вантажах.",
    "appearance": "Масивне тіло й широке обличчя.",
    "temperament": "Прямі, ситі й задоволені.",
    "quarter": "Склади й ринки",
    "buildings": "Грубі балки й широкі двері.",
    "abilities": [
      "сила"
    ]
  }
});

/* races/orc.js */
Atlas.registerRace({
  "format": 2,
  "id": "orc",
  "order": 104,
  "name": "Орк",
  "category": "дикунська",
  "weight": 4,
  "size": "велика",
  "habitat": [
    "any"
  ],
  "look": {
    "tint": "#6a7a4a"
  },
  "lore": {
    "description": "Сильні воїни кланів із рівнин і гір.",
    "appearance": "Зелена або сіра шкіра, ікла.",
    "temperament": "Гордовиті, прямі, цінують силу.",
    "quarter": "Окраїни й казарми",
    "buildings": "Грубі зруби зі шкірою й кістками.",
    "abilities": [
      "велика сила"
    ]
  }
});

/* races/owlfolk.js */
Atlas.registerRace({
  "format": 2,
  "id": "owlfolk",
  "order": 218,
  "name": "Сов'ян",
  "category": "крилата",
  "weight": 2,
  "size": "середня",
  "habitat": [
    "forest",
    "mountain"
  ],
  "worlds": [
    "midnokryl",
    "neborid",
    "hlybokray",
    "noktalis",
    "vespern",
    "valdren",
    "sezonariy",
    "infinite"
  ],
  "look": {
    "tint": "#a08a68",
    "accent": "#f0e0b0",
    "body": "середня фігура з пір'ям, великі круглі очі"
  },
  "lore": {
    "description": "Нічні мудреці, що бачать у темряві і слухають вітер.",
    "appearance": "Пір'я тепло-коричневе, великі очі.",
    "temperament": "Мовчазні, вдумливі, кепкують тихо.",
    "quarter": "Вежі-обсерваторії",
    "buildings": "Круглі вежі з відкритими вікнами.",
    "abilities": [
      "нічний зір",
      "безшумний політ"
    ]
  }
});

/* races/paperfolk.js */
Atlas.registerRace({
  "format": 2,
  "id": "paperfolk",
  "order": 211,
  "name": "Паперник",
  "category": "конструкт",
  "weight": 2,
  "size": "мала",
  "habitat": [
    "plain",
    "dry"
  ],
  "worlds": [
    "paperon",
    "malvar",
    "eydoliya",
    "mirrahon",
    "illariya",
    "infinite"
  ],
  "look": {
    "tint": "#e8e0c8",
    "accent": "#c04040",
    "body": "плоска тонка фігура з кількох білих кубів-аркушів"
  },
  "lore": {
    "description": "Згорнуті з паперу люди, що пишуть себе самі.",
    "appearance": "Біла фігура, написи на шкірі.",
    "temperament": "Допитливі, балакучі, бояться вогню.",
    "quarter": "Бібліотечні двори",
    "buildings": "Складені з паперу й клею будинки.",
    "abilities": [
      "складатися малою",
      "писати майбутнє"
    ]
  }
});

/* races/pigmentfolk.js */
Atlas.registerRace({
  "format": 2,
  "id": "pigmentfolk",
  "order": 253,
  "name": "Пігментник",
  "category": "ефірна",
  "weight": 2,
  "size": "мала",
  "habitat": [
    "any"
  ],
  "worlds": [
    "malvar",
    "paperon",
    "eydoliya",
    "illariya",
    "orchardum",
    "infinite"
  ],
  "look": {
    "tint": "#d06080",
    "accent": "#60b0d0",
    "body": "невелика фігура з яскравих багатокольорових кубів"
  },
  "lore": {
    "description": "Народ барв, що живе на фресках і скелях.",
    "appearance": "Яскраві плями, що змінюють колір з настроєм.",
    "temperament": "Творчі, ревниві до своїх робіт.",
    "quarter": "Майстерні",
    "buildings": "Розписані будинки з фресками.",
    "abilities": [
      "змінюють колір",
      "малюють двері"
    ]
  }
});

/* races/pixie.js */
Atlas.registerRace({
  "format": 2,
  "id": "pixie",
  "order": 244,
  "name": "Феєць",
  "category": "мала",
  "weight": 2,
  "size": "мала",
  "habitat": [
    "forest",
    "temperate"
  ],
  "worlds": [
    "illariya",
    "orchardum",
    "lyumenvild",
    "aurelit",
    "eydoliya",
    "arkhelor",
    "ternaviya",
    "infinite"
  ],
  "look": {
    "tint": "#e090c0",
    "accent": "#fff0a0",
    "body": "крихітна фігура з прозорими крильцями з кубів"
  },
  "lore": {
    "description": "Крилаті малюки з квіткових країв, що ходять зграями.",
    "appearance": "Рожеві та жовті блоки, прозорі крильця.",
    "temperament": "Грайливі, непосидючі, різкі.",
    "quarter": "Квіткові лужки",
    "buildings": "Будиночки з пелюсток і гілок.",
    "abilities": [
      "політ",
      "чаклунський пил"
    ]
  }
});

/* races/rudnychok.js */
Atlas.registerRace({
  "format": 2,
  "id": "rudnychok",
  "order": 243,
  "name": "Рудничок",
  "category": "мала",
  "weight": 3,
  "size": "мала",
  "habitat": [
    "underground",
    "mountain"
  ],
  "worlds": [
    "infinite",
    "rudozir",
    "grondar",
    "skarveld",
    "kamyanorod",
    "runozem",
    "embergard",
    "rzhavar",
    "vuhlerod"
  ],
  "look": {
    "tint": "#6a6a58",
    "accent": "#e0b040",
    "body": "низький гуманоїд з кайлом і ліхтарем на лобі"
  },
  "lore": {
    "description": "Рудничні шкідники й помічники, що чують руду.",
    "appearance": "Сіра шкіра, великі вуха.",
    "temperament": "Хитрі, жадібні до блискучого.",
    "quarter": "Рудники й склади",
    "buildings": "Сховки в штреках.",
    "abilities": [
      "чуття руди",
      "прориття нір"
    ]
  }
});

/* races/salamanderfolk.js */
Atlas.registerRace({
  "format": 2,
  "id": "salamanderfolk",
  "order": 229,
  "name": "Саламандр",
  "category": "рептилоїдна",
  "weight": 2,
  "size": "середня",
  "habitat": [
    "hot",
    "wet"
  ],
  "worlds": [
    "embergard",
    "kaldras",
    "termalis",
    "heliontar",
    "vitroparus",
    "vershynnytsia"
  ],
  "look": {
    "tint": "#d06a30",
    "accent": "#ffe080",
    "body": "гуманоїд з помаранчевою лускою й чорними плямами"
  },
  "lore": {
    "description": "Теплолюби, що люблять гарячі джерела й лаву.",
    "appearance": "Лискуча лускa, довгий хвіст, плями.",
    "temperament": "Лінькуваті, дружні, швидко перегріваються.",
    "quarter": "Купальні й гарячі джерела",
    "buildings": "Нагріті камені, закриті двори.",
    "abilities": [
      "тепло як зброя",
      "відростає хвіст"
    ]
  }
});

/* races/sandfolk.js */
Atlas.registerRace({
  "format": 2,
  "id": "sandfolk",
  "order": 251,
  "name": "Піщан",
  "category": "стихійна",
  "weight": 2,
  "size": "середня",
  "habitat": [
    "dry",
    "hot"
  ],
  "worlds": [
    "heliontar",
    "vitroparus",
    "rakhmir",
    "varhess",
    "fossar",
    "krovostep",
    "hlynyshche"
  ],
  "look": {
    "tint": "#d4b068",
    "accent": "#f0e0a0",
    "body": "гуманоїд із піщаних блоків, що осипаються при русі"
  },
  "lore": {
    "description": "Мешканці пустелі, що розсипаються й складаються знову.",
    "appearance": "Золотий пісок, очі як жаринки.",
    "temperament": "Терплячі, гостинні, мовчазні.",
    "quarter": "Оази",
    "buildings": "Піщані стіни, намети, глиняні дворики.",
    "abilities": [
      "розсипатися",
      "ховаються в піску"
    ]
  }
});

/* races/satyr.js */
Atlas.registerRace({
  "format": 2,
  "id": "satyr",
  "order": 126,
  "name": "Сатир",
  "category": "міфічна",
  "weight": 2,
  "size": "середня",
  "habitat": [
    "forest",
    "temperate"
  ],
  "look": {
    "tint": "#8a6a4a"
  },
  "lore": {
    "description": "Козлоногі веселуни, любителі музики й вина.",
    "appearance": "Козлині ноги й роги.",
    "temperament": "Веселі, непосидючі.",
    "quarter": "Таверни й театри",
    "buildings": "Яскраві балкони з музикою.",
    "abilities": [
      "музика"
    ]
  }
});

/* races/scalefolk.js */
Atlas.registerRace({
  "format": 2,
  "id": "scalefolk",
  "order": 232,
  "name": "Лускач",
  "category": "драконяча",
  "weight": 2,
  "size": "середня",
  "habitat": [
    "mountain",
    "dry"
  ],
  "worlds": [
    "luskariya",
    "kaltseron",
    "runozem",
    "valdren",
    "kamyanorod",
    "trykoron",
    "infinite"
  ],
  "look": {
    "tint": "#8a7a5a",
    "accent": "#d8c890",
    "body": "гуманоїд, укритий плитами з луски гірського змія"
  },
  "lore": {
    "description": "Народ гірської луски, що вважає себе нащадками прадавнього змія.",
    "appearance": "Пластинчаста луска, вузькі очі.",
    "temperament": "Шанують предків, стримані.",
    "quarter": "Лускаті тераси",
    "buildings": "Плитчасті стіни з укладених пластин.",
    "abilities": [
      "броня з луски",
      "чуття вібрації"
    ]
  }
});

/* races/skeletonfolk.js */
Atlas.registerRace({
  "format": 2,
  "id": "skeletonfolk",
  "order": 225,
  "name": "Кістяр",
  "category": "нежива",
  "weight": 3,
  "size": "середня",
  "habitat": [
    "any"
  ],
  "worlds": [
    "oskarium",
    "morgalis",
    "ostanky",
    "krovostep",
    "noktalis",
    "varhess",
    "fossar"
  ],
  "look": {
    "tint": "#e8e4d0",
    "accent": "#505050",
    "body": "каркас із білих блоків-кісток, темні порожнини очей"
  },
  "lore": {
    "description": "Мертві, що не пішли до спокою й тримаються разом.",
    "appearance": "Білий кістяк, ледь жевріють очі.",
    "temperament": "Мовчазні, службові, іронічні.",
    "quarter": "Катакомби",
    "buildings": "Склепи з кісток і чорного каменю.",
    "abilities": [
      "не знають втоми",
      "збираються з уламків"
    ]
  }
});

/* races/soundfolk.js */
Atlas.registerRace({
  "format": 2,
  "id": "soundfolk",
  "order": 249,
  "name": "Голосник",
  "category": "ефірна",
  "weight": 2,
  "size": "середня",
  "habitat": [
    "mountain",
    "plain"
  ],
  "worlds": [
    "runhar",
    "neborid",
    "valdren",
    "aurelit",
    "hlybokray",
    "kaltseron",
    "infinite"
  ],
  "look": {
    "tint": "#e0a050",
    "accent": "#fff0c0",
    "body": "стрункі фігури з жовто-оранжевих кубів, рот-резонатор"
  },
  "lore": {
    "description": "Народ співу, чий голос будує мости й лікує.",
    "appearance": "Золоті блоки, вдалині помітні хвилі.",
    "temperament": "Музичні, гучні, любителі свят.",
    "quarter": "Амфітеатри",
    "buildings": "Дзвінкі арки та резонансні зали.",
    "abilities": [
      "голос, що будує",
      "заспокійливий спів"
    ]
  }
});

/* races/stonegiant.js */
Atlas.registerRace({
  "format": 2,
  "id": "stonegiant",
  "order": 228,
  "name": "Гороїд",
  "category": "велетенська",
  "weight": 2,
  "size": "велика",
  "habitat": [
    "mountain"
  ],
  "worlds": [
    "neborid",
    "valdren",
    "litarkh",
    "morgalis",
    "veletraviya",
    "frostheym",
    "hlybokray",
    "sezonariy",
    "infinite"
  ],
  "look": {
    "tint": "#9a9a8a",
    "accent": "#605040",
    "body": "дуже високий гуманоїд з сірого каменю й снігових шапок"
  },
  "lore": {
    "description": "Гірські велетні, що спираються на скелі, як на гори.",
    "appearance": "Масивні кам'яні блоки, мох у бороді.",
    "temperament": "Повільні, добродушні, але грізні.",
    "quarter": "Високі кручі",
    "buildings": "Зариті в гору печери й кам'яні кола.",
    "abilities": [
      "метання скель",
      "неспішний крок"
    ]
  }
});

/* races/stormkin.js */
Atlas.registerRace({
  "format": 2,
  "id": "stormkin",
  "order": 204,
  "name": "Громовик",
  "category": "стихійна",
  "weight": 2,
  "size": "середня",
  "habitat": [
    "mountain",
    "dry"
  ],
  "worlds": [
    "eshkariya",
    "ferroks",
    "runhar",
    "neborid",
    "valdren",
    "astrakor",
    "solemor"
  ],
  "look": {
    "tint": "#6a78c0",
    "accent": "#f0e060",
    "body": "гуманоїд у синьому, з жовтими блискавками по руках"
  },
  "lore": {
    "description": "Народ гроз, що ловить блискавки й живе на гребенях.",
    "appearance": "Синя шкіра, жовті прожилки, наелектризоване волосся.",
    "temperament": "Галасливі, азартні, не люблять тиші.",
    "quarter": "Громовідні вежі",
    "buildings": "Високі шпилі з металевими стрижнями.",
    "abilities": [
      "розряд",
      "передчуття бурі"
    ]
  }
});

/* races/succubus.js */
Atlas.registerRace({
  "format": 2,
  "id": "succubus",
  "order": 130,
  "name": "Суккуб",
  "category": "демонічна",
  "weight": 1,
  "size": "середня",
  "habitat": [
    "any"
  ],
  "look": {
    "tint": "#a83a6a"
  },
  "lore": {
    "description": "Демонічні спокусниці.",
    "appearance": "Крила й роги, чарівна зовнішність.",
    "temperament": "Спокусливі й хитрі.",
    "quarter": "Таверни й вежі",
    "buildings": "Оздоблені зали з м'якими завісами.",
    "abilities": [
      "чарівність"
    ]
  }
});

/* races/sun-elf.js */
Atlas.registerRace({
  "format": 2,
  "id": "sun-elf",
  "order": 261,
  "name": "Сонячний ельф",
  "category": "ельфійська",
  "weight": 2,
  "size": "середня",
  "habitat": [
    "temperate",
    "hot"
  ],
  "worlds": [
    "heliontar",
    "aurelit",
    "astrakor",
    "orchardum",
    "sezonariy",
    "infinite",
    "zhornoverkh",
    "vershynnytsia"
  ],
  "look": {
    "tint": "#e8c060",
    "accent": "#fff0b0",
    "body": "стрункий гуманоїд із золотою шкірою й рудим волоссям"
  },
  "lore": {
    "description": "Ельфи, що шанують сонце й живуть на відкритих терасах.",
    "appearance": "Золота шкіра, руде волосся.",
    "temperament": "Світлі, гарячі серцем, гордовиті.",
    "quarter": "Тераси й сади",
    "buildings": "Золоті куполи й відкриті тераси.",
    "abilities": [
      "сонячний вогонь",
      "теплий погляд"
    ]
  }
});

/* races/thornfolk.js */
Atlas.registerRace({
  "format": 2,
  "id": "thornfolk",
  "order": 214,
  "name": "Терник",
  "category": "рослинна",
  "weight": 2,
  "size": "середня",
  "habitat": [
    "temperate",
    "dry"
  ],
  "worlds": [
    "ternaviya",
    "orchardum",
    "sezonariy",
    "aurokhm",
    "illariya",
    "arkhelor",
    "kernalis"
  ],
  "look": {
    "tint": "#5a7a3a",
    "accent": "#c04060",
    "body": "худорлява фігура, вкрита шипами й квітами"
  },
  "lore": {
    "description": "Люди-кущі, чия краса оберігається шипами.",
    "appearance": "Зелена шкіра, шипи на ліктях, червоні квіти.",
    "temperament": "Гордовиті, колючі на слова, вірні у дружбі.",
    "quarter": "Живоплоти й оранжереї",
    "buildings": "Живі огорожі й альтанки з лози.",
    "abilities": [
      "отруйні шипи",
      "швидке відростання"
    ]
  }
});

/* races/tidekin.js */
Atlas.registerRace({
  "format": 2,
  "id": "tidekin",
  "order": 205,
  "name": "Припливник",
  "category": "стихійна",
  "weight": 3,
  "size": "середня",
  "habitat": [
    "wet",
    "coast"
  ],
  "worlds": [
    "talassyr",
    "talmoriya",
    "solemor",
    "akvedor",
    "doshchohrad",
    "archipelago",
    "island"
  ],
  "look": {
    "tint": "#3a8ab0",
    "accent": "#c8f0f0",
    "body": "гуманоїд бірюзового кольору з хвилястими краями кубів"
  },
  "lore": {
    "description": "Люди припливів, які живуть на межі води й суші.",
    "appearance": "Бірюзова шкіра, плавці на передпліччях.",
    "temperament": "Мінливі, як море; щедрі, але не прощають образи.",
    "quarter": "Причали й шлюзи",
    "buildings": "Палі, мости, будинки на плотах.",
    "abilities": [
      "керують течією",
      "довго тримають дихання"
    ]
  }
});

/* races/tiefling.js */
Atlas.registerRace({
  "format": 2,
  "id": "tiefling",
  "order": 125,
  "name": "Тіфлінг",
  "category": "демонічна",
  "weight": 2,
  "size": "середня",
  "habitat": [
    "any"
  ],
  "look": {
    "tint": "#8a4a6a"
  },
  "lore": {
    "description": "Нащадки смертних і демонів.",
    "appearance": "Роги, хвіст, дивні очі.",
    "temperament": "Недовірливі, гострі на язик.",
    "quarter": "Околиці й храми",
    "buildings": "Темні двері й вишукані ґрати.",
    "abilities": [
      "опірність до вогню"
    ]
  }
});

/* races/timefolk.js */
Atlas.registerRace({
  "format": 2,
  "id": "timefolk",
  "order": 250,
  "name": "Часовик",
  "category": "ефірна",
  "weight": 1,
  "size": "середня",
  "habitat": [
    "any"
  ],
  "worlds": [
    "noktalis",
    "neverion",
    "umbralit",
    "kernalis",
    "mirrahon"
  ],
  "look": {
    "tint": "#6a8a9a",
    "accent": "#e0d890",
    "body": "фігура з сірих блоків і золотими шестернями в грудях"
  },
  "lore": {
    "description": "Хранителі застиглих митей, що бачать на крок наперед.",
    "appearance": "Сіра шкіра, шестерні.",
    "temperament": "Спокійні, педантичні.",
    "quarter": "Вежі з годинниками",
    "buildings": "Хронометри в стінах.",
    "abilities": [
      "уповільнення",
      "дрібне передбачення"
    ]
  }
});

/* races/treant.js */
Atlas.registerRace({
  "format": 2,
  "id": "treant",
  "order": 212,
  "name": "Деревник",
  "category": "рослинна",
  "weight": 2,
  "size": "велика",
  "habitat": [
    "forest",
    "temperate"
  ],
  "worlds": [
    "illariya",
    "vershynnytsia",
    "ternaviya",
    "lyumenvild",
    "arkhelor",
    "orchardum",
    "smolyar",
    "vuhlerod",
    "aurokhm",
    "sezonariy",
    "infinite"
  ],
  "look": {
    "tint": "#6a8a4a",
    "accent": "#a07040",
    "body": "високий гуманоїд з кори й гілок, листя замість волосся"
  },
  "lore": {
    "description": "Давні ходячі дерева, що стали вартою лісів.",
    "appearance": "Кора, гілки, на плечах мох.",
    "temperament": "Повільні, мудрі, але стають страшними в гніві.",
    "quarter": "Гаї",
    "buildings": "Сплетені крони й дупла.",
    "abilities": [
      "вростають у землю",
      "говорять із лісом"
    ]
  }
});

/* races/troll.js */
Atlas.registerRace({
  "format": 2,
  "id": "troll",
  "order": 106,
  "name": "Троль",
  "category": "дикунська",
  "weight": 2,
  "size": "велика",
  "habitat": [
    "mountain",
    "forest"
  ],
  "look": {
    "tint": "#6a7a6a"
  },
  "lore": {
    "description": "Велетні з камінною шкірою, терпимі, поки ситі.",
    "appearance": "Сіра шкіра з мохом, довгі руки.",
    "temperament": "Повільні, примітивні, але вірні.",
    "quarter": "Окраїни й мости",
    "buildings": "Брили каменю й грубі зруби.",
    "abilities": [
      "відновлення"
    ]
  }
});

/* races/tur.js */
Atlas.registerRace({
  "format": 2,
  "id": "tur",
  "order": 107,
  "name": "Тур",
  "category": "велетенська",
  "weight": 2,
  "size": "велика",
  "habitat": [
    "plain",
    "mountain"
  ],
  "look": {
    "tint": "#8a6a4a"
  },
  "lore": {
    "description": "Раса бикоголових: велетенські рогаті воїни й орачі.",
    "appearance": "Бичачі голови, потужне тіло.",
    "temperament": "Мовчазні, гордовиті, вірні клятві.",
    "quarter": "Ремісничі кінці й ринки худоби",
    "buildings": "Високі двері й міцні балки.",
    "abilities": [
      "потужний удар"
    ]
  },
  "alias": "Бикоголові"
});

/* races/turtlefolk.js */
Atlas.registerRace({
  "format": 2,
  "id": "turtlefolk",
  "order": 224,
  "name": "Черепах",
  "category": "водяна",
  "weight": 1,
  "size": "велика",
  "habitat": [
    "coast",
    "wet"
  ],
  "worlds": [
    "talmoriya",
    "archipelago",
    "litarkh",
    "veletraviya",
    "island",
    "doshchohrad",
    "pangea"
  ],
  "look": {
    "tint": "#50805a",
    "accent": "#c8b070",
    "body": "масивна істота з панциром із зелених блоків"
  },
  "lore": {
    "description": "Мудрі довгожителі узбереж, чия повільність — переконання.",
    "appearance": "Зелено-коричневий панцир, спокійні очі.",
    "temperament": "Мудрі, невимушені, добрі.",
    "quarter": "Лагуни",
    "buildings": "Кам'яні хати під пальмами.",
    "abilities": [
      "панцир",
      "довголіття"
    ]
  }
});

/* races/undead.js */
Atlas.registerRace({
  "format": 2,
  "id": "undead",
  "order": 110,
  "name": "Мертвяк",
  "category": "нежива",
  "weight": 1,
  "size": "середня",
  "habitat": [
    "any"
  ],
  "look": {
    "tint": "#8a8a7a"
  },
  "lore": {
    "description": "Скелет або зомбі: нежить, що зберегла розум чи службу.",
    "appearance": "Кістки або гнила плоть.",
    "temperament": "Мовчазні й нестомні.",
    "quarter": "Цвинтарі й склепи",
    "buildings": "Склепи, кістяні прикраси.",
    "abilities": [
      "нестомність"
    ]
  },
  "alias": "Скелет, зомбі"
});

/* races/vampire.js */
Atlas.registerRace({
  "format": 2,
  "id": "vampire",
  "order": 109,
  "name": "Вампір",
  "category": "нежива",
  "weight": 1,
  "size": "середня",
  "habitat": [
    "any"
  ],
  "look": {
    "tint": "#5a2a3a"
  },
  "lore": {
    "description": "Безсмертні аристократи ночі, що живуть кров'ю.",
    "appearance": "Блідість, ікла.",
    "temperament": "Вишукані, прихований голод.",
    "quarter": "Вежі й особняки",
    "buildings": "Темні особняки з важкими завісами.",
    "abilities": [
      "вічне життя"
    ]
  }
});

/* races/wyvernfolk.js */
Atlas.registerRace({
  "format": 2,
  "id": "wyvernfolk",
  "order": 231,
  "name": "Вивернець",
  "category": "драконяча",
  "weight": 1,
  "size": "велика",
  "habitat": [
    "mountain"
  ],
  "worlds": [
    "neborid",
    "valdren",
    "midnokryl",
    "hlybokray",
    "asterfell",
    "luskariya",
    "solemor",
    "astrakor"
  ],
  "look": {
    "tint": "#6a5aa0",
    "accent": "#e0c060",
    "body": "гуманоїд з крилами і хвостом, по плечах луска"
  },
  "lore": {
    "description": "Нащадки літаючих змій, що тримаються висот.",
    "appearance": "Фіолетова луска, перетинчасті крила.",
    "temperament": "Незалежні, гонорові, самотні.",
    "quarter": "Скельні гнізда",
    "buildings": "Кам'яні тераси на скелях.",
    "abilities": [
      "політ",
      "отруйне жало"
    ]
  }
});
