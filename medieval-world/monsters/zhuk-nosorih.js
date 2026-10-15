Atlas.registerMonster({
  format: 2,
  id: "zhuk-nosorih",
  name: "Жук-носоріг",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga", "grass", "hills"], worlds: "all" },
  order: 390,
  lore: {
    description: "Комаха.",
    behavior: "Зустрічається: луки, ліси.",
    abilities: ["таран рогом", "перекидання ворогів"],
  },
});
