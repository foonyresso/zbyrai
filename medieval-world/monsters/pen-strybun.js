Atlas.registerMonster({
  format: 2,
  id: "pen-strybun",
  name: "Пень-стрибун",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["enchanted", "forest", "taiga"], worlds: "all" },
  order: 522,
  lore: {
    description: "Хижа рослина, що прикидається зрізаним деревом.",
    behavior: "Вирубки в зачарованих лісах.",
    abilities: ["стрибає на здобич і затискає її гілками"],
  },
});
