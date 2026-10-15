Atlas.registerMonster({
  format: 2,
  id: "zombi-vedmid",
  name: "Зомбі-ведмідь",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga"], worlds: "all" },
  order: 346,
  lore: {
    description: "Елітна нежить.",
    behavior: "Зустрічається: прокляті ліси.",
    abilities: ["потужні лапи", "заражений укус", "нечутливість до болю"],
  },
});
