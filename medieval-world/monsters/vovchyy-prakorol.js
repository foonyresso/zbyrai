Atlas.registerMonster({
  format: 2,
  id: "vovchyy-prakorol",
  name: "Вовчий пракороль",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga", "mountain", "hills"], worlds: "all" },
  order: 283,
  lore: {
    description: "Магічний хижак.",
    behavior: "Зустрічається: місячні ліси, засніжені хребти.",
    abilities: ["крижаний рев", "виклик зграї", "стрімкі наскоки"],
  },
});
