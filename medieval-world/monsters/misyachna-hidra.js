Atlas.registerMonster({
  format: 2,
  id: "misyachna-hidra",
  name: "Місячна гідра",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["lake"], worlds: "all" },
  order: 250,
  lore: {
    description: "Багатоголовий водний дракон.",
    behavior: "Зустрічається: темні озера, затоплені кратери.",
    abilities: ["відростання голів", "крижане дихання", "отруйний туман"],
  },
});
