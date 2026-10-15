Atlas.registerMonster({
  format: 2,
  id: "vidomskyy-kruk",
  name: "Відьомський крук",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga"], worlds: "all" },
  order: 306,
  lore: {
    description: "Магічний птах.",
    behavior: "Зустрічається: відьомські ліси.",
    abilities: ["проклятий крик", "крадіжка позитивних ефектів"],
  },
});
