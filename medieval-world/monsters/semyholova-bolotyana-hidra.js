Atlas.registerMonster({
  format: 2,
  id: "semyholova-bolotyana-hidra",
  name: "Семиголова болотяна гідра",
  kind: "super-boss",
  nature: "threat",
  spawn: { biomes: ["swamp"], worlds: "all" },
  order: 265,
  lore: {
    description: "Болотне чудовисько.",
    behavior: "Зустрічається: велетенські болота.",
    abilities: ["отруйні бризки", "регенерація", "захоплення щупальцями"],
  },
});
