Atlas.registerDungeon({
  "format": 2,
  "id": "trunk-temple",
  "name": "Храм у стовбурі",
  "anchor": {
    "type": "poi",
    "poi": [
      "trunk-temple"
    ]
  },
  "size": {
    "rooms": [
      10,
      30
    ],
    "length": [
      400,
      1800
    ],
    "area": [
      1200,
      5000
    ],
    "levels": [
      2,
      4
    ]
  },
  "inhabitants": [
    "деревні павуки",
    "дереволази-жерці"
  ],
  "chance": 0.8,
  "danger": 3,
  "order": 230,
  "spawn": {
    "biomes": [
      "moss-trunks"
    ],
    "worlds": [
      "vershynnytsia"
    ]
  },
  "lore": {
    "description": "Храм усередині стовбура, сходи ведуть до коренів і нагору до дупел."
  }
});
