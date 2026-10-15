Atlas.registerMonster({
  "format": 2,
  "id": "remains-collector",
  "name": "Збирач решток",
  "kind": "other",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "citadel-graveyard",
      "petrified-shore",
      "ashlands"
    ],
    "worlds": [
      "ostanky"
    ]
  },
  "order": 212,
  "lore": {
    "description": "Розумна істота, що будує житла з деталей загиблих світів.",
    "behavior": "Збирає все, що може нести; торгує або нападає.",
    "abilities": [
      "збирання",
      "тяжка ноша",
      "торгівля"
    ],
    "drops": [
      "фрагменти зачарованих конструкцій"
    ]
  }
});
