Atlas.registerMonster({
  "format": 2,
  "id": "volodar-porozhnikh-dzvoniv",
  "name": "Володар порожніх дзвонів",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "tag:swamp",
      "tag:wet"
    ],
    "worlds": "all"
  },
  "order": 943,
  "lore": {
    "description": "Вежа з кам'яних водяних дзвонів, які б'ють самі, а всередині немає нікого.",
    "behavior": "Прокидається, коли хтось порушує болотну тишу.",
    "abilities": [
      "дзвін звуком руйнує щити",
      "викликає хвилі з мулу",
      "стискає воду в кулі"
    ],
    "drops": [
      "порожній дзвін",
      "болотна перлина"
    ]
  }
});
