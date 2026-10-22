Atlas.registerMonster({
  "format": 2,
  "id": "vartovyi-zlamanykh-vezh",
  "name": "Вартовий зламаних веж",
  "kind": "monster",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "tag:ruins",
      "tag:bones",
      "tag:dead"
    ],
    "worlds": "all"
  },
  "order": 974,
  "lore": {
    "description": "Порожні обладунки, що ходять там, де впали вежі.",
    "behavior": "Не пускає чужаків у руїни.",
    "abilities": [
      "удари мечем із-за кута",
      "збирається знову після удару"
    ],
    "drops": [
      "іржавий шолом",
      "уламок вежі"
    ]
  }
});
