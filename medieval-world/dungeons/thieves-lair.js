Atlas.registerDungeon({
  "format": 2,
  "id": "thieves-lair",
  "name": "Лігво гільдії злодіїв",
  "anchor": {
    "type": "city",
    "tiers": [
      4,
      5,
      6
    ]
  },
  "size": {
    "rooms": [
      12,
      25
    ],
    "length": [
      500,
      1800
    ],
    "area": [
      900,
      3000
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "злодії",
    "душогуби",
    "контрабандисти"
  ],
  "chance": 0.35,
  "danger": 2,
  "order": 12,
  "spawn": {
    "biomes": "all",
    "worlds": "all"
  },
  "lore": {
    "description": "Потайні кімнати під ринком чи портом."
  }
});
