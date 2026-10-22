Atlas.registerMonster({
  "format": 2,
  "id": "horshchyk-peklo",
  "name": "Гончар пекла",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "tag:amber",
      "tag:clay"
    ],
    "worlds": "all"
  },
  "order": 999,
  "lore": {
    "description": "Велетень-гончар із кам'яним колом замість серця.",
    "behavior": "Виготовляє слуг із глини й випалює їх у горнилі.",
    "abilities": [
      "випалює слуг",
      "розбиває на черепки",
      "кидає розпечену глину"
    ],
    "drops": [
      "горнило гончара",
      "жива глина"
    ]
  }
});
