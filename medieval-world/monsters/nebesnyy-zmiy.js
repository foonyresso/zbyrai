Atlas.registerMonster({
  format: 2,
  id: "nebesnyy-zmiy",
  name: "Небесний змій",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["peaks"], worlds: "all" },
  order: 247,
  lore: {
    description: "Літаючий драконоподібний колос.",
    behavior: "Зустрічається: небесні острови, вершини хмар.",
    abilities: ["блискавки", "урагани", "руйнівні пікірування"],
  },
});
