Atlas.registerMonster({
  "format": 2,
  "id": "vitrovyi-pastukh",
  "name": "Вітровий пастух",
  "kind": "mini-boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "tag:plain",
      "tag:farmland"
    ],
    "worlds": "all"
  },
  "order": 987,
  "lore": {
    "description": "Чучело в піджаку з вітру, чия коса косить усе поспіль.",
    "behavior": "Вартує поля й ганяє злодіїв.",
    "abilities": [
      "вітер-коса по прямій",
      "скликає ворон"
    ],
    "drops": [
      "чучело",
      "ворона"
    ]
  }
});
