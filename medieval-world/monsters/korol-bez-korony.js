Atlas.registerMonster({
  "format": 2,
  "id": "korol-bez-korony",
  "name": "Король без корони",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "tag:ruins",
      "tag:bones",
      "tag:dead"
    ],
    "worlds": "all"
  },
  "order": 976,
  "lore": {
    "description": "Гігантський скелет у розбитих латах, на голові — порожнє коло.",
    "behavior": "Ходить залом зруйнованого палацу й шукає свою корону.",
    "abilities": [
      "командує мертвою вартою",
      "розколює підлогу",
      "пророчий погляд знімає захист"
    ],
    "drops": [
      "розбита корона",
      "королівський меч"
    ]
  },
  "variants": [
    "темний король",
    "білий король"
  ]
});
