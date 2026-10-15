Atlas.registerMonster({
  "format": 2,
  "id": "ruin-predator",
  "name": "Хижак руїн",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "citadel-graveyard",
      "petrified-shore",
      "ownerless-garden"
    ],
    "worlds": [
      "ostanky"
    ]
  },
  "order": 210,
  "lore": {
    "description": "Тварина, що ховається серед руїн і вистежує тих, хто лізе в підвали.",
    "behavior": "Засідки у завалах і підвалах.",
    "abilities": [
      "засідка",
      "стрибок",
      "лазіння стінами"
    ],
    "drops": [
      "шкури"
    ]
  }
});
