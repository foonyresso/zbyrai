Atlas.registerDungeon({
  "format": 2,
  "id": "blood-well-shrine",
  "name": "Підземне святилище колодязя",
  "anchor": {
    "type": "poi",
    "poi": [
      "blood-well"
    ]
  },
  "size": {
    "rooms": [
      8,
      30
    ],
    "length": [
      400,
      2000
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
    "кров'яні лицарі",
    "жерці крові"
  ],
  "chance": 0.85,
  "danger": 4,
  "order": 220,
  "spawn": {
    "biomes": [
      "blood-wells"
    ],
    "worlds": [
      "krovostep"
    ]
  },
  "lore": {
    "description": "Багаторівневі сходи колодязя ведуть до святилища давнього божества."
  }
});
