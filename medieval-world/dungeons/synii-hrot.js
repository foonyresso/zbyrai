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
