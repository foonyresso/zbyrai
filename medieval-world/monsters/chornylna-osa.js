Atlas.registerMonster({
  format: 2,
  id: "chornylna-osa",
  name: "Чорнильна Оса",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["wasteland", "hills"], worlds: "all" },
  order: 808,
  lore: {
    description: "Тонка чорна оса з папероподібними крильцями та черевцем, наповненим магічними чорнилами.",
    behavior: "Водиться в покинутих скрипторіях.",
    abilities: ["розбризкує плями, які стирають видимі позначки на землі й приховують пастки під темним шаром"],
  },
});
