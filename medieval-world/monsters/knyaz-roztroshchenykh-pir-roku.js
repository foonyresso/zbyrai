Atlas.registerMonster({
  format: 2,
  id: "knyaz-roztroshchenykh-pir-roku",
  name: "Князь Розтрощених Пір року",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["grass", "hills"], worlds: "all" },
  order: 842,
  lore: {
    description: "Чотириголовий звір із тулубом у формі кубічного дерева, на кожній стороні якого панує інша пора року.",
    behavior: "Мешкає в саду, де чотири сезони існують одночасно.",
    abilities: ["перемикає сезонні зони на полі бою, миттєво змінюючи властивості землі, рослин і снарядів"],
  },
});
