Atlas.registerMonster({
  "format": 2,
  "id": "root-giant",
  "name": "Кореневий велет",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "garden-branches",
      "root-coasts",
      "grass",
      "forest"
    ],
    "worlds": [
      "astrakor"
    ]
  },
  "order": 200,
  "lore": {
    "description": "Велетень із живого коріння й кори, що вдає з себе дерево.",
    "behavior": "Стоїть нерухомо серед лісу, нападає на тих, хто підійшов упритул.",
    "abilities": [
      "маскування під дерево",
      "удар корінням",
      "оплутування"
    ],
    "drops": [
      "зоряне дерево",
      "кореневий бурштин"
    ]
  }
});
