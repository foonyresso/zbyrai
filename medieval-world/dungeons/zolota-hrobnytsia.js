Atlas.registerDungeon({
  "format": 2,
  "id": "zolota-hrobnytsia",
  "name": "Золота Гробниця",
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
    "золоті мумії",
    "піщані скарабеї"
  ],
  "chance": 0.3,
  "danger": 4,
  "order": 769,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "heliontar"
    ]
  },
  "lore": {
    "description": "Гробниця пустельних правителів у шарі золотого піску."
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
