Atlas.registerDungeon({
  "format": 2,
  "id": "scorpion-burrows",
  "name": "Нори червоних скорпіонів",
  "anchor": {
    "type": "poi",
    "poi": [
      "scorpion-nest"
    ]
  },
  "size": {
    "rooms": [
      6,
      20
    ],
    "length": [
      300,
      1500
    ],
    "area": [
      800,
      3500
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "червоні скорпіони",
    "Королева Червоних Скорпіонів"
  ],
  "chance": 0.7,
  "danger": 3,
  "order": 221,
  "spawn": {
    "biomes": [
      "dried-vessel-gardens",
      "black-rifts"
    ],
    "worlds": [
      "krovostep"
    ]
  },
  "lore": {
    "description": "Нори й камери з виводком під сухими судинами."
  }
});
