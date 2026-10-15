Atlas.registerDungeon({
  "format": 2,
  "id": "ember-tunnels",
  "name": "Вогняні тунелі",
  "anchor": {
    "type": "poi",
    "poi": [
      "mountain",
      "small_mine"
    ]
  },
  "size": {
    "rooms": [
      10,
      30
    ],
    "length": [
      900,
      3000
    ],
    "area": [
      1500,
      6000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "вогняні елементалі",
    "попелясті тварі",
    "магмові слизи"
  ],
  "chance": 0.25,
  "danger": 4,
  "order": 303,
  "spawn": {
    "biomes": "all",
    "worlds": "all"
  },
  "lore": {
    "description": "Розпечені тунелі біля вулканічних жил, де повітря тремтить від жару."
  },
  "sim": {
    "tags": {
      "rubble": 40,
      "ore": 30,
      "blood": 15
    },
    "corr": 10,
    "cave": true
  }
});
