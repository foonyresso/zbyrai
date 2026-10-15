Atlas.registerMonster({
  format: 2,
  id: "likhtarnyy-svitlyak",
  name: "Ліхтарний світляк",
  kind: "monster",
  nature: "threat",
  spawn: { biomes: ["grass", "hills"], worlds: "all" },
  order: 667,
  lore: {
    description: "Великий світляк із прямокутним черевцем.",
    behavior: "Вечірні луки.",
    abilities: ["спалахи його світла приманюють дрібних істот і ненадовго відволікають мандрівників"],
  },
});
