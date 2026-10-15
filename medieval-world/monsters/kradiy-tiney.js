Atlas.registerMonster({
  format: 2,
  id: "kradiy-tiney",
  name: "Крадій тіней",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga"], worlds: "all" },
  order: 499,
  lore: {
    description: "Чотиринога істота без власної тіні.",
    behavior: "Ліс із чорними стовбурами.",
    abilities: ["відділяє тінь гравця, змушуючи її атакувати свого власника"],
  },
});
