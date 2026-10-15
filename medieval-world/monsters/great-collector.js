Atlas.registerMonster({
  "format": 2,
  "id": "great-collector",
  "name": "Великий Збирач",
  "kind": "super-boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "citadel-graveyard",
      "petrified-shore"
    ],
    "worlds": [
      "ostanky"
    ]
  },
  "order": 215,
  "lore": {
    "description": "Велетенський збирач, що перебудовує арену з навколишніх блоків.",
    "behavior": "На очах змінює арену, скидаючи й підіймаючи платформи.",
    "abilities": [
      "перебудова арени",
      "всмоктування блоків"
    ],
    "drops": [
      "серце Збирача"
    ]
  }
});
