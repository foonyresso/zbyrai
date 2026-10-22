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
