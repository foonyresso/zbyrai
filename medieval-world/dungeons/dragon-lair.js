Atlas.registerDungeon({
  "format": 2,
  "id": "dragon-lair",
  "name": "Лігво дракона",
  "anchor": {
    "type": "poi",
    "poi": [
      "mountain"
    ]
  },
  "size": {
    "rooms": [
      6,
      16
    ],
    "length": [
      800,
      2500
    ],
    "area": [
      2000,
      8000
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "дракон",
    "кобольди-прислужники",
    "скарбошукачі"
  ],
  "chance": 0.15,
  "danger": 5,
  "order": 301,
  "spawn": {
    "biomes": "all",
    "worlds": "all"
  },
  "lore": {
    "description": "Величезна печера зі скарбами та кістками тих, хто прийшов по них."
  },
  "sim": {
    "tags": {
      "cache": 70,
      "rubble": 30,
      "crystals": 20
    },
    "corr": 5,
    "cave": true
  }
});
