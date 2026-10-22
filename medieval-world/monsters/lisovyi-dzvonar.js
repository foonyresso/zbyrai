Atlas.registerMonster({
  "format": 2,
  "id": "lisovyi-dzvonar",
  "name": "Лісовий дзвонар",
  "kind": "mini-boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "tag:forest",
      "tag:canopy"
    ],
    "worlds": "all"
  },
  "order": 947,
  "lore": {
    "description": "Старий пеньок із дзвоником-серцем і довгими руками-вусами.",
    "behavior": "Б'є в дупло — і з землі встають коріння.",
    "abilities": [
      "дзвін оживляє коріння",
      "розсіює пилок, що присипляє"
    ],
    "drops": [
      "дзвоник-серце",
      "пеньок дзвонаря"
    ]
  }
});
