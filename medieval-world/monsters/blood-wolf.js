Atlas.registerMonster({
  "format": 2,
  "id": "blood-wolf",
  "name": "Кровопивний вовк",
  "kind": "monster",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "wasteland",
      "crimson-barrows",
      "black-rifts"
    ],
    "worlds": [
      "krovostep"
    ]
  },
  "order": 216,
  "lore": {
    "description": "Вовк із червоною шерстю, що полює зграями й відновлює сили кров'ю жертв.",
    "behavior": "Полює зграєю, слідкує за пораненими.",
    "abilities": [
      "відновлення від укусу",
      "зграя"
    ],
    "drops": [
      "червоне хутро",
      "ікла"
    ]
  }
});
