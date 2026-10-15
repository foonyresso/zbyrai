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
