Atlas.registerDungeon({
  "format": 2,
  "id": "frost-cave",
  "name": "Крижана печера",
  "anchor": {
    "type": "poi",
    "poi": [
      "mountain",
      "small_monument"
    ]
  },
  "size": {
    "rooms": [
      8,
      26
    ],
    "length": [
      600,
      2200
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
    "крижані вовки",
    "сніжні примари",
    "льодяні големи"
  ],
  "chance": 0.3,
  "danger": 3,
  "order": 302,
  "spawn": {
    "biomes": "all",
    "worlds": "all"
  },
  "lore": {
    "description": "Печери, скуті кригою, з промерзлими озерцями й крижаними залами."
  },
  "sim": {
    "tags": {
      "crystals": 50,
      "flooded": 20,
      "nests": 25
    },
    "corr": 5,
    "cave": true
  }
});
