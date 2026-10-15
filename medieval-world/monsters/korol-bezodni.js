Atlas.registerMonster({
  format: 2,
  id: "korol-bezodni",
  name: "Король безодні",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 259,
  lore: {
    description: "Морський демон.",
    behavior: "Зустрічається: затонулий тронний комплекс.",
    abilities: ["водяні списи", "темні хвилі", "призов морських чудовиськ"],
  },
});
