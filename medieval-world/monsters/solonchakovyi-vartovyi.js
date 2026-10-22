Atlas.registerMonster({
  "format": 2,
  "id": "solonchakovyi-vartovyi",
  "name": "Солончаковий вартовий",
  "kind": "mini-boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "tag:dry"
    ],
    "worlds": "all"
  },
  "order": 955,
  "lore": {
    "description": "Статуя з соляних кристалів із нахиленою головою.",
    "behavior": "Захищає висохлі джерела й вимагає води як данини.",
    "abilities": [
      "висушує воду зі спорядження",
      "сольові шипи вириваються з землі"
    ],
    "drops": [
      "соляне серце",
      "вартова сіль"
    ]
  }
});
