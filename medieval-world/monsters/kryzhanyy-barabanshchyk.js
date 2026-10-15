Atlas.registerMonster({
  format: 2,
  id: "kryzhanyy-barabanshchyk",
  name: "Крижаний барабанщик",
  kind: "monster",
  nature: "magic",
  spawn: { biomes: ["mountain", "hills", "tundra"], worlds: "all" },
  order: 556,
  lore: {
    description: "Гуманоїд зі шкіряними рукавицями та крижаними барабанами.",
    behavior: "Замерзлі печери.",
    abilities: ["вібраціями руйнує тонкі крижані настили"],
  },
});
