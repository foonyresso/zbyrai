Atlas.registerDungeon({
  "format": 2,
  "id": "torn-castle-vaults",
  "name": "Підвали розірваного замку",
  "anchor": {
    "type": "settlement",
    "states": [
      "ruined",
      "fallen"
    ]
  },
  "size": {
    "rooms": [
      10,
      35
    ],
    "length": [
      600,
      2500
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
    "безликі лицарі",
    "хижаки руїн"
  ],
  "chance": 0.7,
  "danger": 3,
  "order": 211,
  "spawn": {
    "biomes": [
      "citadel-graveyard"
    ],
    "worlds": [
      "ostanky"
    ]
  },
  "lore": {
    "description": "Три частини замку мають три різні підвали, що колись були одним."
  }
});
