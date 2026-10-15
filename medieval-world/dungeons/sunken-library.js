Atlas.registerDungeon({
  "format": 2,
  "id": "sunken-library",
  "name": "Затоплена бібліотека",
  "anchor": {
    "type": "poi",
    "poi": [
      "ruins",
      "mage_tower"
    ]
  },
  "size": {
    "rooms": [
      10,
      28
    ],
    "length": [
      700,
      2400
    ],
    "area": [
      1200,
      5000
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "книжкові привиди",
    "хранителі сувоїв",
    "болотні слизи"
  ],
  "chance": 0.3,
  "danger": 3,
  "order": 304,
  "spawn": {
    "biomes": "all",
    "worlds": "all"
  },
  "lore": {
    "description": "Колись велика бібліотека, нині напівзатоплена, з розмоклими фоліантами."
  },
  "sim": {
    "tags": {
      "library": 65,
      "flooded": 40,
      "webs": 20
    },
    "corr": 8,
    "cave": false
  }
});
