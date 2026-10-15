Atlas.registerDungeon({
  "format": 2,
  "id": "nest-grottoes",
  "name": "Гроти порожніх гнізд",
  "anchor": {
    "type": "poi",
    "poi": [
      "empty-nest"
    ]
  },
  "size": {
    "rooms": [
      5,
      18
    ],
    "length": [
      300,
      1200
    ],
    "area": [
      800,
      3000
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "скельні хижаки",
    "агресивні птахи"
  ],
  "chance": 0.7,
  "danger": 2,
  "order": 250,
  "spawn": {
    "biomes": [
      "copper-nests",
      "mountain"
    ],
    "worlds": [
      "midnokryl"
    ]
  },
  "lore": {
    "description": "Печери за покинутими гніздами, в які оселилися хижаки."
  }
});
