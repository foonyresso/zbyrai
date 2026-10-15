Atlas.registerMonster({
  format: 2,
  id: "yizhak",
  name: "Їжак",
  kind: "weak",
  nature: "threat",
  variants: ["гігантський їжак", "колючий їжак"],
  spawn: { biomes: ["forest", "taiga", "grass", "hills"], worlds: "all" },
  order: 385,
  lore: {
    description: "Звір. Об'єднує схожих істот: гігантський їжак, колючий їжак.",
    behavior: "Зустрічається: луки, ліси; ліси, луки.",
    abilities: ["згортається в кулю", "випускає голки", "завдає шкоди голками"],
  },
});
