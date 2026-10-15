Atlas.registerMonster({
  format: 2,
  id: "pidzemnyy-rohach",
  name: "Підземний рогач",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills"], worlds: "all" },
  order: 344,
  lore: {
    description: "Елітний жук.",
    behavior: "Зустрічається: шахти, печери.",
    abilities: ["буріння", "таран", "кам’яний панцир"],
  },
});
