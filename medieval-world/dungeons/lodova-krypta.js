Atlas.registerDungeon({
  "format": 2,
  "id": "lodova-krypta",
  "name": "Крижана Крипта",
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
    "морозні мерці",
    "льодові тіні"
  ],
  "chance": 0.4,
  "danger": 3,
  "order": 765,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "frostheym"
    ]
  },
  "lore": {
    "description": "Склеп, вичавлений у льоду, із замерзлими саркофагами."
  }
});
