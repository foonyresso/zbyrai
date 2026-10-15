Atlas.registerDungeon({
  "format": 2,
  "id": "mine",
  "name": "Покинута шахта",
  "anchor": {
    "type": "poi",
    "poi": [
      "small_mine"
    ]
  },
  "size": {
    "rooms": [
      8,
      30
    ],
    "length": [
      500,
      3000
    ],
    "area": [
      1000,
      6000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "гномі привиди",
    "печерні тварі",
    "бандити"
  ],
  "chance": 0.85,
  "danger": 2,
  "order": 34,
  "spawn": {
    "biomes": [
      "hills",
      "mountain",
      "peaks"
    ],
    "worlds": "all"
  },
  "lore": {
    "description": "Старі штреки, що обвалилися чи наткнулися на печерну систему."
  }
});
