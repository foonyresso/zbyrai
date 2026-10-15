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
