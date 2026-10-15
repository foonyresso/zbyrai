Atlas.registerDungeon({
  "format": 2,
  "id": "star-cavern",
  "name": "Зоряна порожнина",
  "anchor": {
    "type": "poi",
    "poi": [
      "hollow-cavity"
    ]
  },
  "size": {
    "rooms": [
      10,
      40
    ],
    "length": [
      700,
      3000
    ],
    "area": [
      2000,
      8000
    ],
    "levels": [
      2,
      4
    ]
  },
  "inhabitants": [
    "панцирні коренегризи",
    "світні кристалічні істоти"
  ],
  "chance": 0.8,
  "danger": 3,
  "order": 200,
  "spawn": {
    "biomes": [
      "star-caverns"
    ],
    "worlds": [
      "astrakor"
    ]
  },
  "lore": {
    "description": "Велика печера всередині материка зі світними кристалами; ходи коренегризів зв'язують порожнини між собою."
  }
});
