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
