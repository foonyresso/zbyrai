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
