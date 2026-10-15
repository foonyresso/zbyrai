Atlas.registerDungeon({
  "format": 2,
  "id": "sand-tomb",
  "name": "Піщана гробниця",
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
    "мумії",
    "скарабеї-стражі",
    "жерці-вартові"
  ],
  "chance": 0.3,
  "danger": 3,
  "order": 305,
  "spawn": {
    "biomes": "all",
    "worlds": "all"
  },
  "lore": {
    "description": "Гробниця правителя, засипана піском, із пастками й похованнями слуг."
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
