Atlas.registerMonster({
  format: 2,
  id: "tumannyy-kovpachok",
  name: "Туманний Ковпачок",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 910,
  lore: {
    description: "Маленький гриб із довгими тонкими ніжками та напівпрозорою шапкою.",
    behavior: "Росте на берегах холодних підземних озер.",
    abilities: ["при наближенні випускає туман, у якому змінюється видимий розмір предметів, через що складно визначити відстань до нього"],
  },
});
