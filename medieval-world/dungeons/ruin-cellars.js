Atlas.registerDungeon({
  "format": 2,
  "id": "ruin-cellars",
  "name": "Підвали зруйнованого поселення",
  "anchor": {
    "type": "settlement",
    "states": [
      "ruined",
      "fallen"
    ]
  },
  "size": {
    "rooms": [
      3,
      9
    ],
    "length": [
      80,
      300
    ],
    "area": [
      150,
      600
    ],
    "levels": [
      1,
      1
    ]
  },
  "inhabitants": [
    "щури",
    "безхатченки",
    "привиди колишніх мешканців"
  ],
  "chance": 0.55,
  "danger": 1,
  "order": 20,
  "spawn": {
    "biomes": "all",
    "worlds": "all"
  },
  "lore": {
    "description": "Підвали й льохи, що вціліли під руїнами."
  }
});
