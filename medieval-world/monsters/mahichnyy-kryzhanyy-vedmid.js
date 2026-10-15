Atlas.registerMonster({
  format: 2,
  id: "mahichnyy-kryzhanyy-vedmid",
  name: "Магічний крижаний ведмідь",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga", "snow"], worlds: "all" },
  order: 313,
  lore: {
    description: "Звір.",
    behavior: "Зустрічається: засніжені ліси.",
    abilities: ["крижані пазурі", "морозний подих"],
  },
});
