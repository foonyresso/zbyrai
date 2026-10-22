Atlas.registerMonster({
  "format": 2,
  "id": "vladar-hori-polumia",
  "name": "Владар гори полум'я",
  "kind": "super-boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "tag:hot",
      "tag:volcanic",
      "tag:ashlands"
    ],
    "worlds": "all"
  },
  "order": 968,
  "lore": {
    "description": "Колосальний дракон-вулкан, чиє тіло складається з обвугленого каменю.",
    "behavior": "Спить усередині жерла й прокидається, коли земля тріщить.",
    "abilities": [
      "виверження по площі",
      "вогняний подих",
      "бронює себе застиглою лавою"
    ],
    "drops": [
      "серце вулкана",
      "луска магми"
    ]
  },
  "variants": [
    "драконовий вулкан",
    "вогняний владар"
  ]
});
