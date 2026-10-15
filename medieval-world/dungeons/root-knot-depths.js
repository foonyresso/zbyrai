Atlas.registerDungeon({
  "format": 2,
  "id": "root-knot-depths",
  "name": "Підземелля Кореневого вузла",
  "anchor": {
    "type": "poi",
    "poi": [
      "root-knot-temple"
    ]
  },
  "size": {
    "rooms": [
      30,
      80
    ],
    "length": [
      2000,
      6000
    ],
    "area": [
      6000,
      20000
    ],
    "levels": [
      3,
      6
    ]
  },
  "inhabitants": [
    "Матір Коренів",
    "кореневі велети"
  ],
  "chance": 1,
  "danger": 5,
  "order": 202,
  "spawn": {
    "biomes": [
      "root-coasts",
      "garden-branches"
    ],
    "worlds": [
      "astrakor"
    ]
  },
  "lore": {
    "description": "Храм у місці, де корені сходяться до одного вузла; нижче — лігво Матері Коренів."
  }
});
