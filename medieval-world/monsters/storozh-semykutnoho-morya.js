Atlas.registerMonster({
  format: 2,
  id: "storozh-semykutnoho-morya",
  name: "Сторож Семикутного Моря",
  kind: "world-boss",
  nature: "magic",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 745,
  lore: {
    description: "Плаский морський колос із сімома плавниками-лопатями та панциром із чорного вулканічного скла.",
    behavior: "Панує над морським кратером Семи Кутів.",
    abilities: ["розтинає морську поверхню на обертові водяні сектори, затискаючи супротивників між течіями"],
  },
});
