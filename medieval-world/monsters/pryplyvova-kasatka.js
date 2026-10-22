Atlas.registerMonster({
  "format": 2,
  "id": "pryplyvova-kasatka",
  "name": "Приплив-касатка",
  "kind": "mini-boss",
  "nature": "threat",
  "spawn": {
    "biomes": [
      "tag:shore",
      "tag:water",
      "tag:sea",
      "tag:fresh"
    ],
    "worlds": "all"
  },
  "order": 979,
  "lore": {
    "description": "Чорно-білий кит-вартовий, що виринає на мілководді.",
    "behavior": "Нападає на судна й тих, хто ступає в воду.",
    "abilities": [
      "хвильовий удар хвостом",
      "затягує на глибину"
    ],
    "drops": [
      "китовий жир",
      "перлина припливу"
    ]
  }
});
