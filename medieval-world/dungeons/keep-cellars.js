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
