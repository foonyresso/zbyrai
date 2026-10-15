Atlas.registerMonster({
  format: 2,
  id: "dvoholovyy-hirskyy-drakon",
  name: "Двоголовий гірський дракон",
  kind: "boss",
  nature: "threat",
  spawn: { biomes: ["mountain", "hills", "peaks"], worlds: "all" },
  order: 277,
  lore: {
    description: "Дракон.",
    behavior: "Зустрічається: високогірні печери.",
    abilities: ["одна голова дихає вогнем", "друга кам’яними уламками"],
  },
});
