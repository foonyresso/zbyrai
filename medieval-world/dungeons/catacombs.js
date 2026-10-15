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
