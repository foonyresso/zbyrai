Atlas.registerMonster({
  "format": 2,
  "id": "tree-colossus",
  "name": "Деревний Колос",
  "kind": "world-boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "garden-branches",
      "root-coasts"
    ],
    "worlds": [
      "astrakor"
    ]
  },
  "order": 206,
  "lore": {
    "description": "Гігант із живого дерева, що спить у центрі материка й пробуджується під час фінальної битви.",
    "behavior": "Прокидається лише наприкінці; його пробудження змінює арену.",
    "abilities": [
      "пробудження",
      "удар гілками",
      "обвал кореневого вузла"
    ],
    "drops": [
      "ядро Колоса"
    ]
  }
});
