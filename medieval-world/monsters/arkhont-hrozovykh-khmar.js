Atlas.registerMonster({
  format: 2,
  id: "arkhont-hrozovykh-khmar",
  name: "Архонт грозових хмар",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["peaks"], worlds: "all" },
  order: 266,
  lore: {
    description: "Повітряний дух.",
    behavior: "Зустрічається: літаючі острови.",
    abilities: ["блискавки", "грозові фронти", "повітряні леза"],
  },
});
