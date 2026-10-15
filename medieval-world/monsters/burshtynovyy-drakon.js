Atlas.registerMonster({
  format: 2,
  id: "burshtynovyy-drakon",
  name: "Бурштиновий дракон",
  kind: "boss",
  nature: "threat",
  spawn: { biomes: ["forest", "taiga", "mountain", "hills"], worlds: "all" },
  order: 276,
  lore: {
    description: "Дракон.",
    behavior: "Зустрічається: бурштинові ліси, старі шахти.",
    abilities: ["липка смола", "вогняні кулі", "броня з бурштину"],
  },
});
