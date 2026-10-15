Atlas.registerMonster({
  format: 2,
  id: "koroleva-demoniv-koreniv",
  name: "Королева демонів-коренів",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["forest", "enchanted"], worlds: "all" },
  order: 267,
  lore: {
    description: "Рослинний демон.",
    behavior: "Зустрічається: проклятий праліс.",
    abilities: ["заражає землю", "хапає корінням", "вирощує хижі квіти"],
  },
});
