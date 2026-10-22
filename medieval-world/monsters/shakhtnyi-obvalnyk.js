Atlas.registerMonster({
  "format": 2,
  "id": "shakhtnyi-obvalnyk",
  "name": "Шахтний обвальник",
  "kind": "mini-boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "tag:underground",
      "tag:mine"
    ],
    "worlds": "all"
  },
  "order": 959,
  "lore": {
    "description": "Дух старої шахти, оповитий дерев'яною кріпою й пилом.",
    "behavior": "Вмикає обвали у тих, хто неповажно ставиться до шахти.",
    "abilities": [
      "обвалює стелю",
      "кріпа ожива й б'є балками"
    ],
    "drops": [
      "балка духа",
      "шахтний пил"
    ]
  }
});
