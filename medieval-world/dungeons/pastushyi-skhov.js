Atlas.registerDungeon({
  "format": 2,
  "id": "pastushyi-skhov",
  "name": "Пастуший Сховок",
  "anchor": {
    "type": "poi",
    "poi": [
      "bandit_camp"
    ]
  },
  "size": {
    "rooms": [
      3,
      8
    ],
    "length": [
      100,
      400
    ],
    "area": [
      200,
      700
    ],
    "levels": [
      1,
      1
    ]
  },
  "inhabitants": [
    "вовки",
    "злодії-пастухи"
  ],
  "chance": 0.5,
  "danger": 2,
  "order": 780,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "veletraviya"
    ]
  },
  "lore": {
    "description": "Схованка бандитів, що нападають на стада."
  }
});
