Atlas.registerDungeon({
  "format": 2,
  "id": "fungus-caverns",
  "name": "Грибні печери",
  "anchor": {
    "type": "poi",
    "poi": [
      "mountain",
      "small_mine"
    ]
  },
  "size": {
    "rooms": [
      10,
      34
    ],
    "length": [
      700,
      2800
    ],
    "area": [
      1500,
      6000
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "грибні велети",
    "спорові тварі",
    "гноми-збирачі"
  ],
  "chance": 0.3,
  "danger": 2,
  "order": 308,
  "spawn": {
    "biomes": "all",
    "worlds": "all"
  },
  "lore": {
    "description": "Печери, поросли світними грибами, спори яких змінюють тих, хто довго тут дихає."
  },
  "sim": {
    "tags": {
      "nests": 30,
      "crystals": 25,
      "webs": 25
    },
    "corr": 5,
    "cave": true
  }
});
