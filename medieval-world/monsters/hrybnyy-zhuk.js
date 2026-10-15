Atlas.registerMonster({
  format: 2,
  id: "hrybnyy-zhuk",
  name: "Грибний жук",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga"], worlds: "all" },
  order: 403,
  lore: {
    description: "Комаха.",
    behavior: "Зустрічається: грибні ліси.",
    abilities: ["розпорошує спори", "ховається під капелюшком гриба"],
  },
});
