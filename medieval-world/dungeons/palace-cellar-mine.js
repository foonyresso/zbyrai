Atlas.registerDungeon({
  "format": 2,
  "id": "palace-cellar-mine",
  "name": "Шахта-підвал палацу",
  "anchor": {
    "type": "poi",
    "poi": [
      "shard-mine"
    ]
  },
  "size": {
    "rooms": [
      15,
      40
    ],
    "length": [
      800,
      3000
    ],
    "area": [
      2000,
      7000
    ],
    "levels": [
      2,
      4
    ]
  },
  "inhabitants": [
    "уламкові големи",
    "збирачі решток"
  ],
  "chance": 0.8,
  "danger": 3,
  "order": 210,
  "spawn": {
    "biomes": [
      "citadel-graveyard",
      "ashlands"
    ],
    "worlds": [
      "ostanky"
    ]
  },
  "lore": {
    "description": "Шахта, що переходить у підвал знищеного палацу."
  }
});
