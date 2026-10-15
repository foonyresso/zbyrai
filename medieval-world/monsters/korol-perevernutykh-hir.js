Atlas.registerMonster({
  format: 2,
  id: "korol-perevernutykh-hir",
  name: "Король перевернутих гір",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills", "sea"], worlds: "all" },
  order: 453,
  lore: {
    description: "Істота з кам’яних шпилів, що ростуть догори ногами.",
    behavior: "Архіпелаг летючих гір.",
    abilities: ["змушує скелі злітати в небо й падати на арену"],
  },
});
