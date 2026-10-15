Atlas.registerMonster({
  "format": 2,
  "id": "wandering-mimic",
  "name": "Мандрівний скринник",
  "kind": "other",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "citadel-graveyard",
      "ownerless-garden",
      "forest"
    ],
    "worlds": [
      "ostanky"
    ]
  },
  "order": 211,
  "lore": {
    "description": "Істота, що імітує стародавні скрині й ходить між уламками.",
    "behavior": "Лежить як скриня, кусає того, хто відкриває.",
    "abilities": [
      "імітація скрині",
      "укус",
      "пересування"
    ],
    "drops": [
      "реліквії невідомих народів (всередині)"
    ]
  }
});
