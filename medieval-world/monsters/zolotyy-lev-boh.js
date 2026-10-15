Atlas.registerMonster({
  format: 2,
  id: "zolotyy-lev-boh",
  name: "Золотий лев-бог",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["desert", "wasteland", "hills"], worlds: "all" },
  order: 275,
  lore: {
    description: "Магічний звір.",
    behavior: "Зустрічається: забутий храм серед пустелі.",
    abilities: ["сонячні вибухи", "сліпучий рев", "броня зі світла"],
  },
});
