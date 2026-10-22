Atlas.registerMonster({
  "format": 2,
  "id": "vulkanichnyi-kuznets",
  "name": "Вулканічний коваль",
  "kind": "mini-boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "tag:hot",
      "tag:volcanic",
      "tag:ashlands"
    ],
    "worlds": "all"
  },
  "order": 967,
  "lore": {
    "description": "Кам'яний гігант із молотом із застиглої лави.",
    "behavior": "Кує зброю з магми, нападає на всіх, хто несе зброю.",
    "abilities": [
      "вогняний удар молотом",
      "кує щит із лави"
    ],
    "drops": [
      "молот лави",
      "магматична руда"
    ]
  }
});
