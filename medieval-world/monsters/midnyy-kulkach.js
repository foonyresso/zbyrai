Atlas.registerMonster({
  format: 2,
  id: "midnyy-kulkach",
  name: "Мідний Кулькач",
  kind: "weak",
  nature: "magic",
  spawn: { biomes: ["volcanic", "ashlands", "hills"], worlds: "all" },
  order: 928,
  lore: {
    description: "Маленький круглий монстр із мідних пластинок, що з'єднані рухомими заклепками.",
    behavior: "Мешкає в майстернях стародавніх ковалів.",
    abilities: ["котиться по металевих поверхнях і збирає уламки, а коли накопичує їх забагато, втрачає рівновагу й перевертається"],
  },
});
