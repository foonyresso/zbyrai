Atlas.registerMonster({
  format: 2,
  id: "staryy-bolotnyy-trol",
  name: "Старий болотний троль",
  kind: "boss",
  nature: "threat",
  spawn: { biomes: ["swamp"], worlds: "all" },
  order: 279,
  lore: {
    description: "Троль.",
    behavior: "Зустрічається: глибокі болота.",
    abilities: ["швидка регенерація", "удари колодою", "отруйні випари"],
  },
});
