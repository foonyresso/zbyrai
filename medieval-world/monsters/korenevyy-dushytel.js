Atlas.registerMonster({
  format: 2,
  id: "korenevyy-dushytel",
  name: "Кореневий душитель",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga"], worlds: "all" },
  order: 322,
  lore: {
    description: "Рослинне чудовисько.",
    behavior: "Зустрічається: темні хащі.",
    abilities: ["хапає корінням", "створює колючі зарості"],
  },
});
