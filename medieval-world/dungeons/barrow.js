Atlas.registerDungeon({
  "format": 2,
  "id": "barrow",
  "name": "Курган-усипальня",
  "anchor": {
    "type": "poi",
    "poi": [
      "monument",
      "small_monument"
    ]
  },
  "size": {
    "rooms": [
      3,
      10
    ],
    "length": [
      100,
      500
    ],
    "area": [
      150,
      700
    ],
    "levels": [
      1,
      1
    ]
  },
  "inhabitants": [
    "нежить",
    "могильні варти"
  ],
  "chance": 0.5,
  "danger": 2,
  "order": 36,
  "spawn": {
    "biomes": "all",
    "worlds": "all"
  },
  "lore": {
    "description": "Усипальня під давнім пам'ятником чи знаком."
  }
});
