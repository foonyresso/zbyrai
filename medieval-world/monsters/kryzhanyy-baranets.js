Atlas.registerMonster({
  format: 2,
  id: "kryzhanyy-baranets",
  name: "Крижаний баранець",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills", "tundra"], worlds: "all" },
  order: 497,
  lore: {
    description: "Звір із кристалічною вовною та гострими копитами.",
    behavior: "Замерзлі ущелини.",
    abilities: ["залишає слизькі сліди й стрибає між крижаними виступами"],
  },
});
