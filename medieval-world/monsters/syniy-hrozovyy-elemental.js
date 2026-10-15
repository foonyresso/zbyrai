Atlas.registerMonster({
  format: 2,
  id: "syniy-hrozovyy-elemental",
  name: "Синій грозовий елементаль",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 321,
  lore: {
    description: "Стихійний дух.",
    behavior: "Зустрічається: штормові плато.",
    abilities: ["блискавки", "короткі телепортації"],
  },
});
