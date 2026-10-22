Atlas.registerMonster({
  "format": 2,
  "id": "matka-zhyl",
  "name": "Матка жил",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "tag:underground",
      "tag:mine"
    ],
    "worlds": "all"
  },
  "order": 960,
  "lore": {
    "description": "Колосальний павук із лискучою рудою замість панцира.",
    "behavior": "Пряде мережу з металевого волокна під найглибшою шахтою.",
    "abilities": [
      "окутує павутинням-дротом",
      "вмикає живу руду-слуг",
      "струмінь розпеченого металу"
    ],
    "drops": [
      "панцир-руда",
      "серце матки"
    ]
  }
});
