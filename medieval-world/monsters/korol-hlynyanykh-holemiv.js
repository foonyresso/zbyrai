Atlas.registerMonster({
  format: 2,
  id: "korol-hlynyanykh-holemiv",
  name: "Король глиняних големів",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 290,
  lore: {
    description: "Земляний конструкт.",
    behavior: "Зустрічається: старі глиняні храми.",
    abilities: ["розділяється на менших големів", "поглинає каміння", "створює стіни"],
  },
});
