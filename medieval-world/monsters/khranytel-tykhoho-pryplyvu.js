Atlas.registerMonster({
  "format": 2,
  "id": "khranytel-tykhoho-pryplyvu",
  "name": "Хранитель тихого припливу",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "tag:shore",
      "tag:water",
      "tag:sea",
      "tag:fresh"
    ],
    "worlds": "all"
  },
  "order": 980,
  "lore": {
    "description": "Колосальна медуза-парасоля з перлинами всередині.",
    "behavior": "Підіймається з глибин, коли місяць повний.",
    "abilities": [
      "електричні щупальці",
      "хвиля-цунамі",
      "зцілюється від води"
    ],
    "drops": [
      "серце медузи",
      "перлина припливу"
    ]
  }
});
