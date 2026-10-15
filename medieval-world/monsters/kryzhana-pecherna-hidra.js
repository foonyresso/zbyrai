Atlas.registerMonster({
  format: 2,
  id: "kryzhana-pecherna-hidra",
  name: "Крижана печерна гідра",
  kind: "boss",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills", "peaks", "snow"], worlds: "all" },
  order: 289,
  lore: {
    description: "Багатоголовий звір.",
    behavior: "Зустрічається: льодовикові печери.",
    abilities: ["морозне дихання", "регенерація", "крижані пастки"],
  },
});
