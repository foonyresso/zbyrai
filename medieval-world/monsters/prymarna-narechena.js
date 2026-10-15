Atlas.registerMonster({
  format: 2,
  id: "prymarna-narechena",
  name: "Примарна наречена",
  kind: "mini-boss",
  nature: "magic",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 319,
  lore: {
    description: "Привид.",
    behavior: "Зустрічається: покинуті маєтки.",
    abilities: ["морозний дотик", "ілюзії", "зникнення"],
  },
});
