Atlas.registerMonster({
  format: 2,
  id: "trubach-iz-mushli",
  name: "Трубач із мушлі",
  kind: "mini-boss",
  nature: "threat",
  spawn: { biomes: ["deep", "sea"], worlds: "all" },
  order: 513,
  lore: {
    description: "Масивний молюск, що пересувається на шести кінцівках.",
    behavior: "Коралові плато.",
    abilities: ["створює звукові поштовхи через свою порожню мушлю"],
  },
});
