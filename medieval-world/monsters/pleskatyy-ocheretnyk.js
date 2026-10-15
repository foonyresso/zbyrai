Atlas.registerMonster({
  format: 2,
  id: "pleskatyy-ocheretnyk",
  name: "Плескатий очеретник",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 560,
  lore: {
    description: "Плаский болотяний хижак, що маскується під листя.",
    behavior: "Зарості мілководдя.",
    abilities: ["вистрибує з очерету та б’є водяним батогом"],
  },
});
