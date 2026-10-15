Atlas.registerDungeon({
  "format": 2,
  "id": "royal-vault",
  "name": "Підземна скарбниця",
  "anchor": {
    "type": "city",
    "tiers": [
      6
    ]
  },
  "size": {
    "rooms": [
      15,
      40
    ],
    "length": [
      800,
      3000
    ],
    "area": [
      1800,
      6000
    ],
    "levels": [
      2,
      3
    ]
  },
  "inhabitants": [
    "вартові",
    "пастки",
    "привиди скарбників"
  ],
  "chance": 0.6,
  "danger": 3,
  "order": 13,
  "spawn": {
    "biomes": "all",
    "worlds": "all"
  },
  "lore": {
    "description": "Скарбниця й тюрма під палацом столиці."
  }
});
