Atlas.registerMonster({
  format: 2,
  id: "baran",
  name: "Баран",
  kind: "monster",
  nature: "magic",
  variants: ["магічний чорний баран", "гірський баран"],
  spawn: { biomes: ["mountain", "hills", "grass"], worlds: "all" },
  order: 340,
  lore: {
    description: "Елітний звір. Об'єднує схожих істот: магічний чорний баран, гірський баран.",
    behavior: "Зустрічається: гірські пасовища; кам’янисті плато.",
    abilities: ["лобовий таран", "кам’яні роги", "таран", "захист рогами"],
  },
});
