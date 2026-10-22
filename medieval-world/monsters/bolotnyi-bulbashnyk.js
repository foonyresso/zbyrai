Atlas.registerMonster({
  "format": 2,
  "id": "bolotnyi-bulbashnyk",
  "name": "Болотяний бульбашник",
  "kind": "weak",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "tag:swamp",
      "tag:wet"
    ],
    "worlds": "all"
  },
  "order": 940,
  "lore": {
    "description": "Прозорий кубічний слиз із бульбашками газу всередині.",
    "behavior": "Пливе по ряскі, лопається, коли його чіпають.",
    "abilities": [
      "лопається й відкидає хмарку смердючого газу",
      "липка плівка уповільнює"
    ],
    "drops": [
      "бульбашка газу",
      "болотний слиз"
    ]
  }
});
