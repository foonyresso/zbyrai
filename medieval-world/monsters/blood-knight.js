Atlas.registerMonster({
  "format": 2,
  "id": "blood-knight",
  "name": "Кров'яний лицар",
  "kind": "mini-boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "blood-wells"
    ],
    "worlds": [
      "krovostep"
    ]
  },
  "order": 220,
  "lore": {
    "description": "Лицар у червоних обладунках, що охороняє джерела життєвої рідини.",
    "behavior": "Не залишає колодязя.",
    "abilities": [
      "поглинання крові",
      "захисний шолом"
    ],
    "drops": [
      "кривавий гранат"
    ]
  }
});
