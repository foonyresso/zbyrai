Atlas.registerMonster({
  format: 2,
  id: "hoblinskyy-alkhimik",
  name: "Гоблінський алхімік",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["grass", "hills"], worlds: "all" },
  order: 330,
  lore: {
    description: "Елітний гуманоїд.",
    behavior: "Зустрічається: гоблінські лабораторії.",
    abilities: ["вибухові склянки", "отруйні хмари", "зілля лікування"],
  },
});
