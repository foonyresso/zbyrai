Atlas.registerMonster({
  format: 2,
  id: "shaman-vidlyudnyk",
  name: "Шаман-відлюдник",
  kind: "monster",
  nature: "magic",
  variants: ["печерний шаман", "болотний знахар"],
  spawn: { biomes: ["mountain", "hills", "swamp"], worlds: "all" },
  order: 364,
  lore: {
    description: "Звичайний маг. Об'єднує схожих істот: печерний шаман, болотний знахар.",
    behavior: "Зустрічається: печери; болота.",
    abilities: ["кам’яні уламки", "слабке лікування", "отруйні снаряди", "туман"],
  },
});
