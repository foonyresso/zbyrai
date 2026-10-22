Atlas.registerMonster({
  "format": 2,
  "id": "kamenyi-arkhivariy",
  "name": "Кам'яний архівар",
  "kind": "mini-boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "tag:ruins",
      "tag:bones",
      "tag:dead"
    ],
    "worlds": "all"
  },
  "order": 975,
  "lore": {
    "description": "Статуя зі стосом кам'яних сувоїв замість голови.",
    "behavior": "Допитує мандрівників загадками на камені.",
    "abilities": [
      "каменем накладає мовчання",
      "пересуває стіни"
    ],
    "drops": [
      "кам'яний сувій",
      "печатка архівара"
    ]
  }
});
