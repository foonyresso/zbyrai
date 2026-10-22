Atlas.registerMonster({
  "format": 2,
  "id": "skliarnyi-tkach",
  "name": "Скляний ткач",
  "kind": "mini-boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "tag:crystal",
      "tag:glass"
    ],
    "worlds": "all"
  },
  "order": 963,
  "lore": {
    "description": "Тонка людиноподібна постать зі скла, що в'яже світло в нитки.",
    "behavior": "Плете прозорі стіни, які не видно, доки не вдаришся.",
    "abilities": [
      "прозорі пастки",
      "нитка світла, що ріже"
    ],
    "drops": [
      "скляна нитка",
      "ткацький кристал"
    ]
  }
});
