Atlas.registerMonster({
  format: 2,
  id: "krykhitnyy-sazhok",
  name: "Крихітний сажок",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["grass", "hills"], worlds: "all" },
  order: 735,
  lore: {
    description: "Маленька грудка сажі на ніжках.",
    behavior: "Старі печі та димарі.",
    abilities: ["розбігається на кілька частинок при ударі й збирається після паузи"],
  },
});
