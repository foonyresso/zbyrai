Atlas.registerDungeon({
  "format": 2,
  "id": "dakhovi-tsysterny",
  "name": "Дахові Цистерни",
  "anchor": {
    "type": "poi",
    "poi": [
      "ruins",
      "small_mine"
    ]
  },
  "size": {
    "rooms": [
      10,
      30
    ],
    "length": [
      600,
      2250
    ],
    "area": [
      1400,
      5700
    ],
    "levels": [
      2,
      4
    ]
  },
  "inhabitants": [
    "злодії-дахоходи",
    "болотяні водяники"
  ],
  "chance": 0.35,
  "danger": 2,
  "order": 705,
  "spawn": {
    "biomes": "all",
    "worlds": [
      "doshchohrad"
    ]
  },
  "lore": {
    "description": "Вертикальний лабіринт цистерн і критих переходів під багатоярусним містом."
  }
});
