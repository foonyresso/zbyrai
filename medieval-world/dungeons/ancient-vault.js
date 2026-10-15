Atlas.registerDungeon({
  "format": 2,
  "id": "ancient-vault",
  "name": "Давнє підземелля",
  "anchor": {
    "type": "poi",
    "poi": [
      "ruins"
    ]
  },
  "size": {
    "rooms": [
      15,
      45
    ],
    "length": [
      900,
      3500
    ],
    "area": [
      2000,
      8000
    ],
    "levels": [
      2,
      4
    ]
  },
  "inhabitants": [
    "давні вартові",
    "нежить",
    "грабіжники"
  ],
  "chance": 0.7,
  "danger": 3,
  "order": 30,
  "spawn": {
    "biomes": "all",
    "worlds": "all"
  },
  "lore": {
    "description": "Підземні поверхи під старими руїнами."
  }
});
