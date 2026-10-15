Atlas.registerMonster({
  format: 2,
  id: "likhtarnyy-blukach",
  name: "Ліхтарний Блукач",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["swamp", "lake", "grass", "hills"], worlds: "all" },
  order: 866,
  lore: {
    description: "Худорлява істота з довгими ногами й головою-ліхтарем із жовтого скла.",
    behavior: "Блукає затопленими дорогами та болотними мостами.",
    abilities: ["світиться крізь туман, приваблюючи гравця до провалля, а в бою вимикає світло й пересувається ривками"],
  },
});
