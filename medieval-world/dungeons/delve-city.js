Atlas.registerDungeon({
  "format": 2,
  "id": "delve-city",
  "name": "Покинуте підземне місто",
  "anchor": {
    "type": "poi",
    "poi": [
      "ruins",
      "small_mine"
    ]
  },
  "size": {
    "rooms": [
      25,
      80
    ],
    "length": [
      2500,
      9000
    ],
    "area": [
      4000,
      16000
    ],
    "levels": [
      2,
      4
    ]
  },
  "inhabitants": [
    "духи мешканців",
    "глибинні мисливці",
    "бандити-мародери"
  ],
  "chance": 0.2,
  "danger": 4,
  "order": 306,
  "spawn": {
    "biomes": "all",
    "worlds": "all"
  },
  "lore": {
    "description": "Ціла підземна вулиця з будинками, майстернями й залами зборів, давно покинута."
  },
  "sim": {
    "tags": {
      "rubble": 35,
      "ore": 20,
      "cache": 25
    },
    "corr": 15,
    "cave": false
  }
});
