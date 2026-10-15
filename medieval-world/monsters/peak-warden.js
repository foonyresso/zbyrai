Atlas.registerMonster({
  "format": 2,
  "id": "peak-warden",
  "name": "Вартовий Вершин",
  "kind": "world-boss",
  "nature": "magic",
  "spawn": {
    "biomes": [
      "mineral-crowns",
      "peaks"
    ],
    "worlds": [
      "neborid"
    ]
  },
  "order": 238,
  "lore": {
    "description": "Велетенський вартовий, що спить у центральному гірському масиві; під час бою створює нові кам'яні платформи.",
    "behavior": "Спить; прокидається, коли турбують головну вершину.",
    "abilities": [
      "створення платформ",
      "обвал",
      "грозовий удар"
    ],
    "drops": [
      "серце вершини"
    ]
  }
});
