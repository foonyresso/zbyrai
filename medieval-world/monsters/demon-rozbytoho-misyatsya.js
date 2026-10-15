Atlas.registerMonster({
  format: 2,
  id: "demon-rozbytoho-misyatsya",
  name: "Демон розбитого місяця",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills", "wasteland"], worlds: "all" },
  order: 261,
  lore: {
    description: "Крилатий демон.",
    behavior: "Зустрічається: нічні руїни на високих плато.",
    abilities: ["місячні промені", "тіньові клони", "телепортація"],
  },
});
