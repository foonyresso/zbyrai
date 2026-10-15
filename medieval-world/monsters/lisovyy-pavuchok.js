Atlas.registerMonster({
  format: 2,
  id: "lisovyy-pavuchok",
  name: "Лісовий павучок",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga"], worlds: "all" },
  order: 435,
  lore: {
    description: "Павукоподібне.",
    behavior: "Зустрічається: кущі, дерева.",
    abilities: ["короткі стрибки", "укуси"],
  },
});
