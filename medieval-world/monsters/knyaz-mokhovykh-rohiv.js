Atlas.registerMonster({
  format: 2,
  id: "knyaz-mokhovykh-rohiv",
  name: "Князь мохових рогів",
  kind: "boss",
  nature: "magic",
  spawn: { biomes: ["forest", "taiga", "mountain", "hills"], worlds: "all" },
  order: 487,
  lore: {
    description: "Лось із розгалуженими зеленими рогами, що вкриті світними спорами.",
    behavior: "Мохові урвища.",
    abilities: ["вирощує пастки з моху та відновлюється в тіні"],
  },
});
