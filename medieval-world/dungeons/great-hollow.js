Atlas.registerDungeon({
  "format": 2,
  "id": "great-hollow",
  "name": "Велике дупло з підземними проходами",
  "anchor": {
    "type": "poi",
    "poi": [
      "great-hollow"
    ]
  },
  "size": {
    "rooms": [
      12,
      40
    ],
    "length": [
      800,
      3000
    ],
    "area": [
      2500,
      9000
    ],
    "levels": [
      2,
      4
    ]
  },
  "inhabitants": [
    "павуки",
    "кореневі звірі"
  ],
  "chance": 0.7,
  "danger": 3,
  "order": 231,
  "spawn": {
    "biomes": [
      "moss-trunks",
      "jungle"
    ],
    "worlds": [
      "vershynnytsia"
    ]
  },
  "lore": {
    "description": "Дупло, що веде в підземні проходи між корінням сусідніх дерев."
  }
});
