Atlas.registerMonster({
  format: 2,
  id: "pozhyrach-kontynentiv",
  name: "Пожирач континентів",
  kind: "world-boss",
  nature: "threat",
  spawn: { biomes: ["mountain", "peaks", "hills"], worlds: "all" },
  order: 243,
  lore: {
    description: "Колосальний підземний звір.",
    behavior: "Зустрічається: глибокі розломи, підземні порожнини під горами.",
    abilities: ["розриває землю", "створює провалля", "викликає землетруси"],
  },
});
