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
