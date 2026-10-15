Atlas.registerMonster({
  format: 2,
  id: "bolotyanyy-tryton",
  name: "Болотяний тритон",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["swamp"], worlds: "all" },
  order: 420,
  lore: {
    description: "Земноводне чудовисько.",
    behavior: "Зустрічається: болота.",
    abilities: ["отруйний слиз", "стрибки", "укуси"],
  },
});
