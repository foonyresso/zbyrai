Atlas.registerDungeon({
  "format": 2,
  "id": "crypt",
  "name": "Склеп",
  "anchor": {
    "type": "settlement",
    "states": [
      "ruined",
      "abandoned",
      "fallen"
    ]
  },
  "size": {
    "rooms": [
      4,
      12
    ],
    "length": [
      100,
      400
    ],
    "area": [
      200,
      800
    ],
    "levels": [
      1,
      1
    ]
  },
  "inhabitants": [
    "скелети",
    "привиди"
  ],
  "chance": 0.4,
  "danger": 2,
  "order": 21,
  "spawn": {
    "biomes": "all",
    "worlds": "all"
  },
  "lore": {
    "description": "Родинний склеп біля покинутого храму чи цвинтаря."
  }
});
