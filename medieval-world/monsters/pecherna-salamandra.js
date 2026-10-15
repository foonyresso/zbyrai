Atlas.registerMonster({
  format: 2,
  id: "pecherna-salamandra",
  name: "Печерна саламандра",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 382,
  lore: {
    description: "Земноводне.",
    behavior: "Зустрічається: вологі печери.",
    abilities: ["слабкий отруйний слиз", "нічне бачення"],
  },
});
