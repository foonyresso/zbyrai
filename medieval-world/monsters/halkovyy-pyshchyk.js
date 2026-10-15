Atlas.registerMonster({
  format: 2,
  id: "halkovyy-pyshchyk",
  name: "Гальковий пищик",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 715,
  lore: {
    description: "Дрібний звір, схожий на рухомий камінець.",
    behavior: "Кам’янисті стежки.",
    abilities: ["пищить і ховається між плитами"],
  },
});
