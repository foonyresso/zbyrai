Atlas.registerMonster({
  format: 2,
  id: "pidvodnyy-chervyak-ryvach",
  name: "Підводний черв’як-ривач",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 430,
  lore: {
    description: "Водний хижак.",
    behavior: "Зустрічається: морське дно.",
    abilities: ["прориває донний ґрунт", "створює каламутні хмари"],
  },
});
