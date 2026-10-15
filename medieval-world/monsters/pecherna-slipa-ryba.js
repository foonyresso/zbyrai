Atlas.registerMonster({
  format: 2,
  id: "pecherna-slipa-ryba",
  name: "Печерна сліпа риба",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 425,
  lore: {
    description: "Підземна риба.",
    behavior: "Зустрічається: підземні озера.",
    abilities: ["орієнтується за вібраціями", "кусає в темряві"],
  },
});
