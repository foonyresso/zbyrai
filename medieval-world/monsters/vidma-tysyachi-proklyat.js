Atlas.registerMonster({
  format: 2,
  id: "vidma-tysyachi-proklyat",
  name: "Відьма тисячі проклять",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["swamp", "mountain", "hills", "grass"], worlds: "all" },
  order: 272,
  lore: {
    description: "Древня чаклунка.",
    behavior: "Зустрічається: чорні болота, відьомська вежа.",
    abilities: ["прокляття", "отруйні примари", "висмоктування життєвої сили"],
  },
});
