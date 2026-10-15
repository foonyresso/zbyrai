Atlas.registerDungeon({
  "format": 2,
  "id": "occupied-warren",
  "name": "Лігво загарбників",
  "anchor": {
    "type": "settlement",
    "states": [
      "occupied"
    ]
  },
  "size": {
    "rooms": [
      5,
      14
    ],
    "length": [
      150,
      500
    ],
    "area": [
      300,
      1000
    ],
    "levels": [
      1,
      1
    ]
  },
  "inhabitants": [
    "монстри-загарбники",
    "їхній виводок"
  ],
  "chance": 0.8,
  "danger": 2,
  "order": 22,
  "spawn": {
    "biomes": "all",
    "worlds": "all"
  },
  "lore": {
    "description": "Підвали й тунелі під захопленим монстрами поселенням."
  }
});
