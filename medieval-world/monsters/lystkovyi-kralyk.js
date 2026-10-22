Atlas.registerMonster({
  "format": 2,
  "id": "lystkovyi-kralyk",
  "name": "Листковий кролик",
  "kind": "weak",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "tag:forest",
      "tag:canopy"
    ],
    "worlds": "all"
  },
  "order": 945,
  "lore": {
    "description": "Кролик із вухами-листками, що зливається з підліском.",
    "behavior": "Тікає, шелестить, сам не нападає.",
    "abilities": [
      "зникає в кущах",
      "шелестом відволікає хижаків"
    ],
    "drops": [
      "лист-вухо",
      "кролячий хвіст"
    ]
  }
});
