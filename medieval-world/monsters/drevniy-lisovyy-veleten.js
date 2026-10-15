Atlas.registerMonster({
  format: 2,
  id: "drevniy-lisovyy-veleten",
  name: "Древній лісовий велетень",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga", "enchanted"], worlds: "all" },
  order: 249,
  lore: {
    description: "Жива гора з коріння й деревини.",
    behavior: "Зустрічається: праліси з велетенськими деревами.",
    abilities: ["піднімає коріння", "оживляє дерева", "створює зарості"],
  },
});
