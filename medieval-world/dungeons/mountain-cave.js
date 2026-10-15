Atlas.registerDungeon({
  "format": 2,
  "id": "mountain-cave",
  "name": "Печерна система",
  "anchor": {
    "type": "poi",
    "poi": [
      "mountain"
    ]
  },
  "size": {
    "rooms": [
      6,
      25
    ],
    "length": [
      400,
      2500
    ],
    "area": [
      800,
      5000
    ],
    "levels": [
      1,
      3
    ]
  },
  "inhabitants": [
    "ведмеді",
    "печерні монстри"
  ],
  "chance": 0.5,
  "danger": 2,
  "order": 35,
  "spawn": {
    "biomes": [
      "hills",
      "mountain",
      "peaks"
    ],
    "worlds": "all"
  },
  "lore": {
    "description": "Природні печери під горою; великі системи сполучаються зі шахтами."
  }
});
