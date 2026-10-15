Atlas.registerMonster({
  "format": 2,
  "id": "ancient-tree-dragon",
  "name": "Давній деревний дракон",
  "kind": "mini-boss",
  "nature": "magic",
  "alias": "Охоронець Гнізд",
  "spawn": {
    "biomes": [
      "garden-branches",
      "root-coasts",
      "upper-light-gardens",
      "branch-plains"
    ],
    "worlds": [
      "astrakor",
      "vershynnytsia"
    ]
  },
  "order": 204,
  "lore": {
    "description": "Дракон із деревною лускою, що охороняє гнізда в порожнистих коренях і на верхівках.",
    "behavior": "Не залишає гнізда, прогонює всіх, хто підійшов; жодного разу не покидає свого дерева.",
    "abilities": [
      "деревна луска",
      "подих спор",
      "оплутування лозами"
    ],
    "drops": [
      "смола велетенських дерев",
      "луска з деревини",
      "яйця (рідкісні)"
    ]
  }
});
