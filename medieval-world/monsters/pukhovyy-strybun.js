Atlas.registerMonster({
  format: 2,
  id: "pukhovyy-strybun",
  name: "Пуховий стрибун",
  kind: "weak",
  nature: "threat",
  spawn: { biomes: ["peaks", "grass", "hills"], worlds: "all" },
  order: 649,
  lore: {
    description: "Дрібна комаха, вкрита м’якими білими волокнами.",
    behavior: "Вітряні луки.",
    abilities: ["високо підстрибує та засипає ворога легким пухом, що погіршує видимість"],
  },
});
