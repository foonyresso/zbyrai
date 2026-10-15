Atlas.registerDungeon({
  "format": 2,
  "id": "sewer",
  "name": "Каналізація",
  "anchor": {
    "type": "city",
    "tiers": [
      3,
      4,
      5,
      6
    ]
  },
  "size": {
    "rooms": [
      10,
      30
    ],
    "length": [
      600,
      2500
    ],
    "area": [
      800,
      4000
    ],
    "levels": [
      1,
      2
    ]
  },
  "inhabitants": [
    "щури-мутанти",
    "контрабандисти",
    "болотяні примари"
  ],
  "chance": 0.5,
  "danger": 1,
  "order": 10,
  "spawn": {
    "biomes": "all",
    "worlds": "all"
  },
  "lore": {
    "description": "Тунелі під вулицями з кільцевою каналізацією; у місті цьому відповідає шар «Підземелля» в детальному вигляді."
  }
});
