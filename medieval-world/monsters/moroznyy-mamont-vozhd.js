Atlas.registerMonster({
  format: 2,
  id: "moroznyy-mamont-vozhd",
  name: "Морозний мамонт-вождь",
  kind: "boss",
  nature: "threat",
  spawn: { biomes: ["grass", "snow"], worlds: "all" },
  order: 278,
  lore: {
    description: "Гігантський звір.",
    behavior: "Зустрічається: засніжені долини.",
    abilities: ["крижані хвилі", "таран", "заклик стада"],
  },
});
