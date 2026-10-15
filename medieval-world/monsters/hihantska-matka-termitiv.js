Atlas.registerMonster({
  format: 2,
  id: "hihantska-matka-termitiv",
  name: "Гігантська матка термітів",
  kind: "boss",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills", "desert"], worlds: "all" },
  order: 284,
  lore: {
    description: "Комаха.",
    behavior: "Зустрічається: піщані гнізда.",
    abilities: ["створює термітів", "руйнує землю тунелями", "кислотні бризки"],
  },
});
