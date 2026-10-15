Atlas.registerDungeon({
  "format": 2,
  "id": "bog-grotto",
  "name": "Болотна печера",
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
    "болотні відьми",
    "трясинні тварі",
    "мерзенні жаби"
  ],
  "chance": 0.35,
  "danger": 2,
  "order": 307,
  "spawn": {
    "biomes": "all",
    "worlds": "all"
  },
  "lore": {
    "description": "Сирі печери під болотом, де вода доходить до кісточок, а подекуди й до пояса."
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
