Atlas.registerMonster({
  format: 2,
  id: "zhnets-pidzemnoho-sontsya",
  name: "Жнець підземного сонця",
  kind: "super-boss",
  nature: "magic",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 480,
  lore: {
    description: "Червоподібний титан із розпеченою спиною.",
    behavior: "Підземне магматичне море.",
    abilities: ["проходить крізь скелю, залишаючи лавові канали, що змінюють форму арени"],
  },
});
