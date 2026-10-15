Atlas.registerMonster({
  format: 2,
  id: "klishch-parazyt",
  name: "Кліщ-паразит",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga", "mountain", "hills"], worlds: "all" },
  order: 396,
  lore: {
    description: "Паразит.",
    behavior: "Зустрічається: печери, заражені ліси.",
    abilities: ["чіпляється до істот", "виснажує їх"],
  },
});
