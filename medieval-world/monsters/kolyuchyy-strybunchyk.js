Atlas.registerMonster({
  format: 2,
  id: "kolyuchyy-strybunchyk",
  name: "Колючий стрибунчик",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["grass", "hills"], worlds: "all" },
  order: 606,
  lore: {
    description: "Дрібний звір із голчастими лапами.",
    behavior: "Сухі луки.",
    abilities: ["відскакує після кожної атаки, залишаючи шипи на землі"],
  },
});
