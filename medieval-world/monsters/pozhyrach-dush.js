Atlas.registerMonster({
  format: 2,
  id: "pozhyrach-dush",
  name: "Пожирач душ",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["grass", "wasteland", "ashlands"], worlds: "all" },
  order: 274,
  lore: {
    description: "Тіньовий демон.",
    behavior: "Зустрічається: прокляті поля битв.",
    abilities: ["висмоктує життєву силу", "створює темні зони", "викликає примар"],
  },
});
