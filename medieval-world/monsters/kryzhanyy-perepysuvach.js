Atlas.registerMonster({
  format: 2,
  id: "kryzhanyy-perepysuvach",
  name: "Крижаний переписувач",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["grass", "hills"], worlds: "all" },
  order: 465,
  lore: {
    description: "Довгорукий гуманоїд, який креслить символи в повітрі.",
    behavior: "Бібліотека вічної мерзлоти.",
    abilities: ["записані ним знаки перетворюються на крижані конструкції та замкнені проходи"],
  },
});
