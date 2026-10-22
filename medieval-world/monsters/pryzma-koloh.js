Atlas.registerMonster({
  "format": 2,
  "id": "pryzma-koloh",
  "name": "Призма-коло",
  "kind": "boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "tag:crystal",
      "tag:glass"
    ],
    "worlds": "all"
  },
  "order": 964,
  "lore": {
    "description": "Колосальна призма, що кружляє над долиною й розкладає сонце на промені.",
    "behavior": "Прокидається на світанку й палить усе кольоровими променями.",
    "abilities": [
      "розкладає світло на шість променів",
      "дзеркала-двійники",
      "осліплює при руйнуванні"
    ],
    "drops": [
      "серце-призма",
      "уламок веселки"
    ]
  }
});
