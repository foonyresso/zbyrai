Atlas.registerMonster({
  "format": 2,
  "id": "strazh-nepryvatnoho-horyzontu",
  "name": "Страж непридатного горизонту",
  "kind": "mini-boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "tag:surreal"
    ],
    "worlds": "all"
  },
  "order": 995,
  "lore": {
    "description": "Висока рамка з дверима, у якій видно інше небо.",
    "behavior": "Дозволяє перейти, лише якщо відповісти на загадку.",
    "abilities": [
      "відкриває портал-ловушку",
      "міняє місцями героїв"
    ],
    "drops": [
      "шматок горизонту"
    ]
  }
});
