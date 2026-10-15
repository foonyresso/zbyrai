Atlas.registerMonster({
  format: 2,
  id: "zombi-ohr",
  name: "Зомбі-огр",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 312,
  lore: {
    description: "Нежить.",
    behavior: "Зустрічається: заражені кладовища.",
    abilities: ["удари дубиною", "зараження", "стійкість до болю"],
  },
});
